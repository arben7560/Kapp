import {
  CAFE_SPEECH_INTENTS,
  getCafeSpeechContextualStrings as getBaseCafeSpeechContextualStrings,
  matchCafeSpeechIntent as matchBaseCafeSpeechIntent,
  normalizeKoreanSpeech,
  type CafeSpeechChoice,
  type CafeSpeechIntentDefinition,
  type CafeSpeechIntentMatch,
} from "./cafeSpeechIntents";

export {
  CAFE_SPEECH_PILOT_MISSION_ID,
  getCafeSpeechAttemptPedagogy,
  recordCafeSpeechRecoveryEvent,
} from "./cafeSpeechIntents";

const PRODUCT_INTENT_IDS = new Set([
  "americano-order",
  "orange-juice-order",
  "latte-order",
  "cheesecake-order",
]);

const PRODUCT_LABELS: Readonly<Record<string, string>> = {
  "americano-order": "l’americano",
  "orange-juice-order": "le jus d’orange",
  "latte-order": "le latte",
  "cheesecake-order": "le cheesecake",
};

const QUANTITY_PATTERN =
  "(?:[1-9]\\d*|한|하나|두|둘|세|셋|네|넷|다섯|여섯|일곱|여덟|아홉|열(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|스물(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|서른(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|마흔(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|쉰(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|예순(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|일흔(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|여든(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|아흔(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?)";

const COUNTED_NOUN_PATTERN = new RegExp(
  `(${QUANTITY_PATTERN})(잔|조각|개|병|그릇|명|분|대|번)`,
  "u",
);

const PLURAL_PRODUCT_QUANTITY_PATTERN = new RegExp(
  `(?:[2-9]\\d*|두|둘|세|셋|네|넷|다섯|여섯|일곱|여덟|아홉|열(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|스물(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|서른(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|마흔(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|쉰(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|예순(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|일흔(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|여든(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?|아흔(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉)?)(잔|조각|개|병|그릇)`,
  "u",
);

const DICTIONARY_OR_PLAIN_ENDING_PATTERN =
  /(?:주다|준다|주문하다|주문한다|부탁하다|말하다|말씀하다|먹다|먹는다|마시다|마신다|가다|간다|포장하다|포장한다|테이크아웃하다|가져가다|가지고가다|결제하다|결제한다|계산하다|계산한다|내다|낸다|받다|받는다|필요하다|필요없다|괜찮다)$/u;

function findDefinitionForChoice(choice: CafeSpeechChoice | null) {
  if (!choice) return undefined;
  return CAFE_SPEECH_INTENTS.find(({ choiceIds }) =>
    choiceIds.includes(choice.id),
  );
}

function productQuantityMismatchFeedback(
  definition: CafeSpeechIntentDefinition,
) {
  const product = PRODUCT_LABELS[definition.id] ?? "le produit";
  return `Le produit est clair : tu demandes ${product}. En revanche, ta phrase en commande plusieurs alors que ce choix de la mission correspond à une seule unité. Ce n’est pas une faute de coréen : c’est la quantité qui ne correspond pas à cette branche. Si tu voulais bien une seule unité, confirme ou reformule : « ${definition.canonical} »`;
}

function getParticleDiagnostic(
  normalizedTranscript: string,
  definition: CafeSpeechIntentDefinition,
) {
  if (definition.id === "card-payment" && normalizedTranscript.includes("카드루")) {
    return "Le moyen de paiement est bien compris. Ici, la particule attendue est « 로 », pas « 루 » : « 카드로 할게요. »";
  }
  if (
    definition.id === "cash-payment" &&
    normalizedTranscript.includes("현금으루")
  ) {
    return "Le moyen de paiement est bien compris. Après « 현금 », utilise « 으로 » : « 현금으로 할게요. »";
  }
  if (definition.id === "takeout" && normalizedTranscript.includes("포장으루")) {
    return "L’intention « à emporter » est claire. La particule correcte est « 으로 » : « 포장으로 해 주세요 » ; tu peux aussi dire simplement « 포장해 주세요 ».";
  }
  if (
    definition.id.startsWith("receipt-") &&
    normalizedTranscript.includes("영수증룰")
  ) {
    return `Le mot « 영수증 » est bien identifié, mais « 룰 » n’est pas la particule attendue ici. Avec un objet, utilise « 을/를 », ou omets simplement la particule : « ${definition.canonical} »`;
  }
  if (definition.id === "repeat" && normalizedTranscript.includes("다시룰")) {
    return "Tu demandes bien de répéter, mais « 다시 » est un adverbe : il ne prend pas la particule « 를 ». Tu peux dire : « 다시 한번 말씀해 주세요. »";
  }
  return null;
}

function getCounterDiagnostic(
  normalizedTranscript: string,
  definition: CafeSpeechIntentDefinition,
) {
  const match = normalizedTranscript.match(COUNTED_NOUN_PATTERN);
  if (!match || PRODUCT_INTENT_IDS.has(definition.id)) return null;

  const [, quantity, classifier] = match;

  if (definition.id === "repeat") {
    if (classifier === "번") return null;
    return `La demande de répétition est comprise, mais « ${classifier} » ne sert pas à compter le nombre de répétitions. Pour dire « ${quantity} fois », utilise « 번 », par exemple : « 다시 한 번 말씀해 주세요. »`;
  }

  if (definition.id === "eat-here") {
    // Une quantité peut décrire un aliment sous-entendu ; ne pas sur-diagnostiquer.
    return null;
  }

  if (classifier === "번") {
    if (definition.id === "card-payment" || definition.id === "cash-payment") {
      return `Le moyen de paiement est clair, mais « ${quantity}번 » signifie que l’action est répétée ${quantity} fois. Ce nombre n’est pas utile pour répondre à la question du paiement. Dis simplement : « ${definition.canonical} »`;
    }
    if (definition.id === "takeout") {
      return `L’option à emporter est claire, mais « ${quantity}번 » compte le nombre de fois où l’action est répétée. Ici, ce nombre n’est pas nécessaire : « ${definition.canonical} »`;
    }
    if (definition.id.startsWith("receipt-")) {
      return `Ta décision concernant le reçu est comprise, mais « ${quantity}번 » ajoute l’idée de répéter l’action plusieurs fois. Pour répondre simplement au serveur : « ${definition.canonical} »`;
    }
  }

  if (definition.id === "takeout") {
    return `L’intention « à emporter » est comprise, mais « ${classifier} » sert à compter un objet ou une personne, pas l’option à emporter. Dis simplement : « ${definition.canonical} »`;
  }
  if (definition.id === "card-payment" || definition.id === "cash-payment") {
    return `Le moyen de paiement est bien compris, mais le compteur « ${classifier} » n’a pas de rôle dans cette réponse. Dis simplement : « ${definition.canonical} »`;
  }
  if (definition.id.startsWith("receipt-")) {
    return `Ta décision concernant le reçu est comprise, mais le compteur « ${classifier} » n’est pas nécessaire ici. Réponds simplement : « ${definition.canonical} »`;
  }

  return null;
}

function getEndingDiagnostic(
  normalizedTranscript: string,
  definition: CafeSpeechIntentDefinition,
) {
  if (!DICTIONARY_OR_PLAIN_ENDING_PATTERN.test(normalizedTranscript)) return null;
  return `L’intention est compréhensible, mais ta phrase se termine à une forme de dictionnaire ou à une forme neutre. Dans un échange avec le personnel, transforme-la en réponse polie et conversationnelle. Par exemple : « ${definition.canonical} »`;
}

function refineMatchedDiagnostic(
  transcript: string,
  result: Extract<CafeSpeechIntentMatch, { reason: "matched" }>,
): CafeSpeechIntentMatch {
  const definition = findDefinitionForChoice(result.choice);
  if (!definition) return result;

  const normalizedTranscript = normalizeKoreanSpeech(transcript);

  // Quand l’ASR a été récupéré, ne pas attribuer simultanément au locuteur
  // une erreur linguistique que la transcription n’établit pas avec certitude.
  if (result.recoveryEvent) return result;

  if (
    PRODUCT_INTENT_IDS.has(definition.id) &&
    PLURAL_PRODUCT_QUANTITY_PATTERN.test(normalizedTranscript)
  ) {
    return {
      reason: "uncertain",
      choice: result.choice,
      confirmationLabel: definition.confirmationLabel,
      feedback: productQuantityMismatchFeedback(definition),
    };
  }

  const particleDiagnostic = getParticleDiagnostic(
    normalizedTranscript,
    definition,
  );
  if (particleDiagnostic) return { ...result, feedback: particleDiagnostic };

  const counterDiagnostic = getCounterDiagnostic(
    normalizedTranscript,
    definition,
  );
  if (counterDiagnostic) return { ...result, feedback: counterDiagnostic };

  const endingDiagnostic = getEndingDiagnostic(normalizedTranscript, definition);
  if (endingDiagnostic) return { ...result, feedback: endingDiagnostic };

  return result;
}

function refineContextualConfidence(
  transcript: string,
  result: CafeSpeechIntentMatch,
): CafeSpeechIntentMatch {
  const normalizedTranscript = normalizeKoreanSpeech(transcript);
  const definition = findDefinitionForChoice(result.choice);

  if (!definition || result.reason === "empty" || result.reason === "out-of-scope") {
    return result;
  }

  if (
    definition.id === "americano-order" &&
    normalizedTranscript.includes("블랙커피") &&
    result.reason === "matched"
  ) {
    return {
      reason: "uncertain",
      choice: result.choice,
      confirmationLabel: definition.confirmationLabel,
      feedback:
        "« 블랙커피 » indique un café noir, mais ne désigne pas forcément un americano. Si tu voulais bien choisir l’americano proposé dans cette scène, confirme ; sinon, reformule ton choix.",
    };
  }

  if (
    definition.id === "eat-here" &&
    result.reason === "uncertain" &&
    /(?:안에서|카페에서)(?:먹|마시)/u.test(normalizedTranscript)
  ) {
    return {
      reason: "matched",
      choice: result.choice,
      feedback:
        "Ta réponse indique clairement que tu vas consommer à l’intérieur du café : l’intention « sur place » est donc bien comprise. « 먹고 갈게요 » est simplement une autre formulation utile dans ce contexte.",
    };
  }

  if (
    definition.id === "takeout" &&
    result.reason === "matched" &&
    /밖에서(?:먹|마시)/u.test(normalizedTranscript)
  ) {
    return {
      reason: "uncertain",
      choice: result.choice,
      confirmationLabel: definition.confirmationLabel,
      feedback:
        "Tu dis que tu vas manger ou boire dehors. Cela peut vouloir dire « à emporter », mais ce n’est pas certain : un espace extérieur ou une terrasse reste possible. Confirme seulement si tu voulais bien prendre la commande à emporter.",
    };
  }

  if (
    definition.id === "receipt-yes" &&
    result.reason === "uncertain" &&
    /(?:종이로|출력해|프린트해|챙겨주세요|필요합니다)/u.test(
      normalizedTranscript,
    )
  ) {
    return {
      reason: "matched",
      choice: result.choice,
      feedback:
        "Dans le contexte de la question sur le reçu, ta réponse indique suffisamment clairement que tu le veux. Tu peux aussi le nommer directement avec « 영수증 주세요 ».",
    };
  }

  return result;
}

export function matchCafeSpeechIntent(
  transcript: string,
  choices: readonly CafeSpeechChoice[],
): CafeSpeechIntentMatch {
  const baseResult = matchBaseCafeSpeechIntent(transcript, choices);
  const contextualResult = refineContextualConfidence(transcript, baseResult);

  return contextualResult.reason === "matched"
    ? refineMatchedDiagnostic(transcript, contextualResult)
    : contextualResult;
}

export function getCafeSpeechContextualStrings(
  choices: readonly CafeSpeechChoice[],
) {
  return getBaseCafeSpeechContextualStrings(choices).filter(
    (value) =>
      normalizeKoreanSpeech(value) !==
      normalizeKoreanSpeech("아이스 아메리카노 두 잔 주세요."),
  );
}
