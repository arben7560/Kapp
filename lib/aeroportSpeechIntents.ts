import { getSpeechRecognitionFailureMessage } from "./speechRecognitionState.ts";

export const AEROPORT_SPEECH_PILOT_MISSION_ID = "arrival-assistance";

export type AeroportSpeechIntent =
  | "route"
  | "continue"
  | "train-choice"
  | "platform"
  | "repeat"
  | "thanks"
  | "unknown";

export type AeroportSpeechCategory =
  | "natural"
  | "minor-imperfection"
  | "contextual-interpretation"
  | "incomplete"
  | "ambiguous"
  | "wrong-destination"
  | "quantity-conflict"
  | "negation-conflict"
  | "out-of-scope"
  | "empty";

export type AeroportSpeechChoice = Readonly<{
  id: string;
  label: string;
  korean: string;
  nextNodeId: string;
}>;

export type AeroportSpeechMatch = Readonly<{
  reason: "matched" | "uncertain" | "needs-help" | "empty";
  category: AeroportSpeechCategory;
  choice: AeroportSpeechChoice | null;
  feedback: string;
  understoodWithCorrection: boolean;
  interpretedIntent?: Exclude<AeroportSpeechIntent, "unknown">;
}>;

type ContextualRule = Readonly<{
  targetIntent: Exclude<AeroportSpeechIntent, "unknown">;
  examples: readonly string[];
  confidence: "matched" | "uncertain";
  understood: string;
  guidance: string;
  allowNegation?: boolean;
  matches: (value: string) => boolean;
}>;

const WRONG_DESTINATIONS = [
  "강남",
  "홍대",
  "홍대입구",
  "명동",
  "이태원",
  "부산",
  "수원",
] as const;

const NATURAL_VARIANTS: Readonly<
  Record<Exclude<AeroportSpeechIntent, "unknown">, readonly string[]>
> = {
  route: [
    "실례합니다서울역까지어떻게가요",
    "서울역에어떻게가요",
    "서울역까지어디로가요",
    "서울역가는공항철도어디예요",
    "서울역가려면어디로가야해요",
  ],
  continue: [
    "알겠어요그다음어떻게하면돼요",
    "네그다음은요",
    "그다음뭐하면돼요",
    "이제어디로가요",
  ],
  "train-choice": [
    "어느열차를타는게좋을까요",
    "어떤열차가좋아요",
    "어느열차를추천하세요",
    "일반열차와직통열차중뭐가좋아요",
  ],
  platform: [
    "플랫폼은어디예요",
    "승강장은어디예요",
    "어디에서타요",
    "열차타는곳이어디예요",
  ],
  repeat: [
    "다시한번말씀해주실수있나요",
    "다시말해주세요",
    "한번더말해주세요",
    "천천히말해주세요",
    "못들었어요",
  ],
  thanks: [
    "정말감사합니다",
    "감사합니다",
    "고맙습니다",
    "알겠습니다감사합니다",
    "이해했어요감사합니다",
  ],
};

function compactKorean(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[\s.,!?;:'"“”‘’…~\-_/()[\]{}]/g, "");
}

function includesAny(value: string, candidates: readonly string[]) {
  return candidates.some((candidate) => value.includes(compactKorean(candidate)));
}

function hasNegation(value: string) {
  return includesAny(value, [
    "안",
    "못",
    "않",
    "아니",
    "말고",
    "필요없",
    "싫",
  ]);
}

function hasQuestionShape(value: string) {
  return includesAny(value, [
    "어디",
    "어떻게",
    "어느",
    "어떤",
    "뭐",
    "무엇",
    "나요",
    "까요",
    "돼요",
    "좋아요",
    "타요",
  ]);
}

export function getAeroportSpeechChoiceIntent(
  choice: AeroportSpeechChoice,
): AeroportSpeechIntent {
  if (choice.id === "choice_ask_seoul_station") return "route";
  if (choice.id === "choice_ready") return "continue";
  if (choice.id === "choice_which_train") return "train-choice";
  if (/platform/.test(choice.id) || /플랫폼|승강장/.test(choice.korean)) {
    return "platform";
  }
  if (/^repeat/.test(choice.id) || /다시|한번/.test(choice.korean)) {
    return "repeat";
  }
  if (/^choice_thanks/.test(choice.id) || /감사|고맙/.test(choice.korean)) {
    return "thanks";
  }
  return "unknown";
}

function findChoiceForIntent(
  choices: readonly AeroportSpeechChoice[],
  intent: Exclude<AeroportSpeechIntent, "unknown">,
) {
  return choices.find(
    (choice) => getAeroportSpeechChoiceIntent(choice) === intent,
  ) ?? null;
}

function withAvailableChoices(
  feedback: string,
  choices: readonly AeroportSpeechChoice[],
) {
  const labels = [...new Set(choices.map(({ label }) => label.trim()))]
    .filter(Boolean);
  if (labels.length === 0) return feedback;

  return `${feedback.trim().replace(/[.!?…]+$/u, "")} — réponses proposées : ${labels
    .map((label) => `« ${label} »`)
    .join(" · ")}.`;
}

function getCurrentExpectation(choices: readonly AeroportSpeechChoice[]) {
  const intents = new Set(choices.map(getAeroportSpeechChoiceIntent));

  if (intents.has("route")) {
    return "Ici, tu viens d’arriver à Incheon et tu dois demander comment aller à Seoul Station.";
  }
  if (intents.has("continue")) {
    return "Ici, l’agent vient d’indiquer le centre de transport : tu peux demander l’étape suivante ou lui faire répéter.";
  }
  if (intents.has("train-choice")) {
    return "Ici, l’agent a présenté les trains AREX : tu peux demander lequel choisir ou lui faire répéter.";
  }
  if (intents.has("platform")) {
    return "Ici, tu as choisi le type de train : tu peux demander où se trouve le quai ou faire répéter la recommandation.";
  }
  if (intents.has("thanks")) {
    return "Ici, tu connais le quai : tu peux remercier l’agent et terminer, ou demander une répétition.";
  }
  return "Ici, ta réponse doit correspondre à l’étape actuelle de la conversation.";
}

function withProgressiveHelp(
  feedback: string,
  attemptNumber: number,
  choices: readonly AeroportSpeechChoice[],
) {
  if (attemptNumber >= 3) {
    return withAvailableChoices(
      `${feedback} Affiche les réponses et choisis la formulation qui correspond à ton intention.`,
      choices,
    );
  }
  if (attemptNumber === 2) {
    return withAvailableChoices(
      `${feedback} Réécoute la question, puis réponds avec une seule intention.`,
      choices,
    );
  }
  return withAvailableChoices(feedback, choices);
}

function matched(
  category: AeroportSpeechCategory,
  choice: AeroportSpeechChoice,
  intent: Exclude<AeroportSpeechIntent, "unknown">,
  feedback: string,
  understoodWithCorrection = false,
): AeroportSpeechMatch {
  return {
    reason: "matched",
    category,
    choice,
    feedback,
    understoodWithCorrection,
    interpretedIntent: intent,
  };
}

function needsHelp(
  category: AeroportSpeechCategory,
  feedback: string,
  choices: readonly AeroportSpeechChoice[],
  attemptNumber: number,
): AeroportSpeechMatch {
  return {
    reason: "needs-help",
    category,
    choice: null,
    feedback: withProgressiveHelp(feedback, attemptNumber, choices),
    understoodWithCorrection: false,
  };
}

const CONTEXTUAL_RULES: readonly ContextualRule[] = [
  {
    targetIntent: "route",
    examples: ["서울역에 가고 싶어요.", "서울역 가는 길을 찾고 있어요."],
    confidence: "uncertain",
    understood: "tu veux aller à Seoul Station",
    guidance:
      "L’intention est bonne, mais l’agent attend une question. Tu peux dire : « 서울역까지 어떻게 가요? »",
    matches: (value) => includesAny(value, [
      "서울역에가고싶",
      "서울역가고싶",
      "서울역가는길을찾",
      "서울역가야해",
    ]),
  },
  {
    targetIntent: "route",
    examples: ["공항철도는 어디예요?", "AREX는 어디서 타요?"],
    confidence: "matched",
    understood: "tu cherches l’AREX ou le train de l’aéroport",
    guidance:
      "Dans cette scène, précise la destination si possible : « 서울역 가는 공항철도는 어디예요? »",
    matches: (value) =>
      includesAny(value, ["공항철도", "arex"]) && hasQuestionShape(value),
  },
  {
    targetIntent: "continue",
    examples: ["이제 뭐 해요?", "그다음은요?"],
    confidence: "matched",
    understood: "tu demandes ce qu’il faut faire ensuite",
    guidance: "Une formulation complète est : « 그다음 어떻게 하면 돼요? »",
    matches: (value) => includesAny(value, [
      "이제뭐해",
      "그다음은요",
      "다음은요",
      "그후에는요",
      "이제어디로",
    ]),
  },
  {
    targetIntent: "train-choice",
    examples: ["직통이 좋아요, 일반이 좋아요?", "뭘 타야 돼요?"],
    confidence: "uncertain",
    understood: "tu demandes quel train choisir entre le direct et le train avec arrêts",
    guidance:
      "Pour demander une recommandation clairement : « 어느 열차를 타는 게 좋을까요? »",
    matches: (value) => includesAny(value, [
      "직통이좋",
      "일반이좋",
      "뭘타야돼",
      "무슨열차",
      "어떤걸타",
      "빠른열차",
    ]),
  },
  {
    targetIntent: "platform",
    examples: ["어디서 타요?", "타는 곳이 어디예요?"],
    confidence: "uncertain",
    understood: "tu demandes où monter dans le train",
    guidance:
      "Le lieu d’embarquement s’appelle « 플랫폼 » ou « 승강장 » : « 플랫폼은 어디예요? »",
    matches: (value) =>
      includesAny(value, ["어디서타", "타는곳", "어디로내려가", "열차어디있"]) &&
      !includesAny(value, ["공항철도", "arex"]),
  },
  {
    targetIntent: "repeat",
    examples: ["잘 못 들었어요.", "방금 뭐라고 하셨어요?"],
    confidence: "matched",
    understood: "tu n’as pas bien entendu et demandes une répétition",
    guidance: "Tu peux dire : « 다시 한번 말씀해 주세요. »",
    allowNegation: true,
    matches: (value) => includesAny(value, [
      "잘못들었",
      "못들었",
      "뭐라고하셨어",
      "잘안들려",
      "다시설명",
      "한번만더",
    ]),
  },
  {
    targetIntent: "thanks",
    examples: ["덕분에 알겠어요.", "이제 찾을 수 있어요."],
    confidence: "matched",
    understood: "tu as compris les indications et peux maintenant continuer seul",
    guidance: "Pour terminer poliment, ajoute : « 감사합니다. »",
    matches: (value) => includesAny(value, [
      "덕분에알겠",
      "이제찾을수있",
      "어디로갈지알겠",
      "도움이됐",
    ]),
  },
] as const;

function getContextualRules(value: string) {
  const negated = hasNegation(value);
  return CONTEXTUAL_RULES.filter(
    ({ allowNegation, matches }) => matches(value) && (!negated || allowNegation),
  );
}

function getIntentSignals(value: string) {
  const signals = new Set<Exclude<AeroportSpeechIntent, "unknown">>();

  if (
    includesAny(value, ["서울역"]) &&
    includesAny(value, ["어떻게가", "어디로가", "어디예요", "어디서타", "가려면"])
  ) signals.add("route");
  if (includesAny(value, ["그다음", "다음은", "이제어디로"])) {
    signals.add("continue");
  }
  if (
    includesAny(value, ["열차", "기차"]) &&
    includesAny(value, ["어느", "어떤", "뭐", "추천", "좋", "타야"])
  ) signals.add("train-choice");
  if (
    includesAny(value, ["플랫폼", "승강장", "타는곳"]) &&
    includesAny(value, ["어디", "찾", "가요"])
  ) signals.add("platform");
  if (includesAny(value, ["다시", "한번더", "천천히"])) {
    signals.add("repeat");
  }
  if (includesAny(value, ["감사", "고맙", "이해했", "알겠습니다"])) {
    signals.add("thanks");
  }

  return [...signals];
}

function hasIntentNegation(
  value: string,
  intent: Exclude<AeroportSpeechIntent, "unknown">,
) {
  switch (intent) {
    case "route":
      return includesAny(value, ["서울역안가", "서울역에안가", "서울역가지않", "서울역말고"]);
    case "continue":
      return includesAny(value, ["다음필요없", "그다음안", "계속안", "이제안"]);
    case "train-choice":
      return includesAny(value, ["열차안타", "기차안타", "추천필요없", "아무거나싫"]);
    case "platform":
      return includesAny(value, [
        "플랫폼안",
        "플랫폼필요없",
        "승강장안",
        "승강장필요없",
        "타는곳필요없",
      ]);
    case "thanks":
      return includesAny(value, ["감사하지않", "이해하지못", "알지못"]);
    case "repeat":
      return false;
  }
}

function findFloorNumbers(value: string) {
  const expanded = value
    .replace(/일층/g, "1층")
    .replace(/이층/g, "2층")
    .replace(/삼층/g, "3층");
  const mentions = [...expanded.matchAll(/(?:지하)?([1-9])층/gu)].map(
    (match) => ({ floor: Number(match[1]), index: match.index ?? -1 }),
  );
  const correctionIndex = [...expanded.matchAll(
    /(?:아니라|아니요?|말고)(?=(?:지하)?[1-9]층)/gu,
  )].at(-1)?.index ?? -1;
  const effectiveMentions = correctionIndex >= 0
    ? mentions.filter(({ index }) => index > correctionIndex)
    : mentions;

  return [...new Set(effectiveMentions.map(({ floor }) => floor))];
}

function hasExplicitDestinationCorrection(value: string) {
  const seoulIndex = value.indexOf("서울역");
  if (seoulIndex < 0) return false;

  return WRONG_DESTINATIONS.some((destination) => {
    const destinationIndex = value.indexOf(compactKorean(destination));
    if (destinationIndex < 0 || destinationIndex >= seoulIndex) return false;
    const segment = value.slice(
      destinationIndex + compactKorean(destination).length,
      seoulIndex,
    );
    return /(?:아니라|아니(?!면)|말고)/u.test(segment);
  });
}

function getIncompleteFeedback(
  value: string,
  choices: readonly AeroportSpeechChoice[],
) {
  const intents = new Set(choices.map(getAeroportSpeechChoiceIntent));
  const expectation = getCurrentExpectation(choices);

  if (intents.has("route") && includesAny(value, ["서울역", "공항철도"])) {
    return `J’ai compris que tu parles de Seoul Station ou de l’AREX, mais tu n’as pas formulé la demande de trajet. ${expectation}`;
  }
  if (intents.has("continue") && includesAny(value, ["네", "알겠", "다음"])) {
    return `J’ai compris que tu suis l’explication, mais tu n’as pas demandé clairement l’étape suivante. ${expectation}`;
  }
  if (intents.has("train-choice") && includesAny(value, ["열차", "기차", "직통", "일반"])) {
    return `J’ai compris que tu parles du train, mais tu n’as pas demandé lequel choisir. ${expectation}`;
  }
  if (intents.has("platform") && includesAny(value, ["플랫폼", "승강장", "타는곳"])) {
    return `J’ai compris que tu parles du quai, mais la question reste incomplète. ${expectation}`;
  }
  return null;
}

export function getAeroportSpeechContextualStrings(
  choices: readonly AeroportSpeechChoice[],
) {
  const intents = new Set(choices.map(getAeroportSpeechChoiceIntent));
  return [...new Set([
    ...choices.map(({ korean }) => korean),
    ...[...intents].flatMap((intent) =>
      intent === "unknown" ? [] : NATURAL_VARIANTS[intent],
    ),
    ...CONTEXTUAL_RULES
      .filter(({ targetIntent }) => intents.has(targetIntent))
      .flatMap(({ examples }) => examples),
  ])];
}

export function matchAeroportSpeechIntent(
  transcript: string,
  choices: readonly AeroportSpeechChoice[],
  attemptNumber = 1,
): AeroportSpeechMatch {
  const value = compactKorean(transcript);

  if (!value) {
    return {
      reason: "empty",
      category: "empty",
      choice: null,
      feedback: withAvailableChoices(
        getSpeechRecognitionFailureMessage("empty"),
        choices,
      ),
      understoodWithCorrection: false,
    };
  }

  const exactChoice = choices.find(
    ({ korean }) => compactKorean(korean) === value,
  );
  if (exactChoice) {
    const intent = getAeroportSpeechChoiceIntent(exactChoice);
    if (intent !== "unknown") {
      return matched(
        "natural",
        exactChoice,
        intent,
        "Réponse comprise dans le contexte de cette étape.",
      );
    }
  }

  for (const choice of choices) {
    const intent = getAeroportSpeechChoiceIntent(choice);
    if (intent === "unknown") continue;
    if (
      NATURAL_VARIANTS[intent].some(
        (variant) => value === compactKorean(variant),
      )
    ) {
      return matched(
        "natural",
        choice,
        intent,
        `J’ai compris ton intention. ${getCurrentExpectation(choices)}`,
      );
    }
  }

  const availableIntents = new Set(choices.map(getAeroportSpeechChoiceIntent));
  const signals = getIntentSignals(value);
  const negatedSignal = [...availableIntents].find(
    (intent): intent is Exclude<AeroportSpeechIntent, "unknown"> =>
      intent !== "unknown" && hasIntentNegation(value, intent),
  );
  if (negatedSignal) {
    return needsHelp(
      "negation-conflict",
      `J’ai compris que tu nies ou refuses cette intention. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  const floorNumbers = findFloorNumbers(value);
  if (
    floorNumbers.length > 1 ||
    floorNumbers.some((floor) => floor !== 1)
  ) {
    return needsHelp(
      "quantity-conflict",
      floorNumbers.length > 1
        ? `J’ai entendu plusieurs étages différents (${floorNumbers.map((floor) => `${floor}층`).join(" et ")}). Dans cette scène, le centre de transport est au sous-sol 1 : « 지하 1층 ». Garde un seul étage ou demande simplement le quai.`
        : `J’ai entendu « ${floorNumbers[0]}층 », mais l’agent vient d’indiquer le sous-sol 1. Dans cette scène, dis « 지하 1층 » ou demande simplement où se trouve le quai.`,
      choices,
      attemptNumber,
    );
  }

  const wrongDestinations = WRONG_DESTINATIONS.filter((destination) =>
    value.includes(compactKorean(destination)),
  );
  const hasSeoulStation = includesAny(value, ["서울역", "seoulstation"]);
  if (wrongDestinations.length > 0 && !hasSeoulStation) {
    return needsHelp(
      "wrong-destination",
      `J’ai compris une autre destination : ${wrongDestinations.join(", ")}. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }
  if (
    wrongDestinations.length > 0 &&
    hasSeoulStation &&
    !hasExplicitDestinationCorrection(value)
  ) {
    return needsHelp(
      "ambiguous",
      `J’ai entendu Seoul Station et une autre destination. Garde une seule destination. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  if (signals.length > 1) {
    return needsHelp(
      "ambiguous",
      `J’ai compris plusieurs intentions à la fois. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  const availableSignals = signals.filter((intent) => availableIntents.has(intent));

  if (availableSignals.length === 1) {
    const intent = availableSignals[0];
    const choice = findChoiceForIntent(choices, intent);
    if (choice) {
      const isNatural = NATURAL_VARIANTS[intent].some(
        (variant) => value === compactKorean(variant),
      );
      return matched(
        isNatural ? "natural" : "minor-imperfection",
        choice,
        intent,
        isNatural
          ? `J’ai compris ton intention. ${getCurrentExpectation(choices)}`
          : `J’ai compris ton intention malgré une formulation différente. ${getCurrentExpectation(choices)}`,
        !isNatural,
      );
    }
  }

  const contextualMatches = getContextualRules(value);
  const availableContextualMatches = contextualMatches.flatMap((rule) => {
    const choice = findChoiceForIntent(choices, rule.targetIntent);
    return choice ? [{ rule, choice }] : [];
  });

  if (availableContextualMatches.length > 1) {
    return needsHelp(
      "ambiguous",
      `J’ai reconnu plusieurs sens proches. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  if (availableContextualMatches.length === 1) {
    const [{ rule, choice }] = availableContextualMatches;
    const feedback = `J’ai compris que ${rule.understood}. ${getCurrentExpectation(choices)} ${rule.guidance}`;
    if (rule.confidence === "matched") {
      return matched(
        "contextual-interpretation",
        choice,
        rule.targetIntent,
        feedback,
        true,
      );
    }
    return {
      reason: "uncertain",
      category: "contextual-interpretation",
      choice,
      feedback: withAvailableChoices(feedback, choices),
      understoodWithCorrection: false,
      interpretedIntent: rule.targetIntent,
    };
  }

  const unavailableIntents = [
    ...new Set([
      ...signals.filter((intent) => !availableIntents.has(intent)),
      ...contextualMatches
        .map(({ targetIntent }) => targetIntent)
        .filter((intent) => !availableIntents.has(intent)),
    ]),
  ];
  if (unavailableIntents.length === 1) {
    const intent = unavailableIntents[0];
    const rule = contextualMatches.find(({ targetIntent }) => targetIntent === intent);
    const understood = rule?.understood ?? {
      route: "tu demandes le trajet vers Seoul Station",
      continue: "tu demandes l’étape suivante",
      "train-choice": "tu demandes quel train choisir",
      platform: "tu demandes où se trouve le quai",
      repeat: "tu demandes une répétition",
      thanks: "tu remercies l’agent",
    }[intent];
    return needsHelp(
      "out-of-scope",
      `J’ai compris que ${understood}. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  const incompleteFeedback = getIncompleteFeedback(value, choices);
  if (incompleteFeedback) {
    return needsHelp(
      "incomplete",
      incompleteFeedback,
      choices,
      attemptNumber,
    );
  }

  return needsHelp(
    "out-of-scope",
    `Je n’ai pas reconnu une réponse adaptée. ${getCurrentExpectation(choices)}`,
    choices,
    attemptNumber,
  );
}
