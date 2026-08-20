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
    return "Ici, tu viens d’arriver à Incheon : l’objectif est de demander comment rejoindre Seoul Station.";
  }
  if (intents.has("continue")) {
    return "Ici, l’agent vient de t’indiquer le centre de transport. Tu peux lui demander ce que tu dois faire ensuite ou lui demander de répéter.";
  }
  if (intents.has("train-choice")) {
    return "Ici, l’agent vient de présenter les trains AREX. Tu peux lui demander lequel il te conseille ou lui demander de répéter.";
  }
  if (intents.has("platform")) {
    return "Ici, tu as choisi ton train. Tu peux maintenant demander où prendre le train, ou faire répéter la recommandation.";
  }
  if (intents.has("thanks")) {
    return "Ici, tu sais où prendre le train. Tu peux remercier l’agent et terminer l’échange, ou lui demander de répéter.";
  }
  return "Ici, réponds simplement à ce que l’agent vient de te demander.";
}

function withProgressiveHelp(
  feedback: string,
  attemptNumber: number,
  choices: readonly AeroportSpeechChoice[],
) {
  if (attemptNumber >= 3) {
    return withAvailableChoices(
      `${feedback} Si tu bloques encore, affiche les réponses et choisis celle qui correspond à ce que tu veux dire.`,
      choices,
    );
  }
  if (attemptNumber === 2) {
    return withAvailableChoices(
      `${feedback} Réécoute l’agent et concentre-toi sur une seule intention.`,
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
      "On comprend parfaitement la destination, mais ce n’est pas encore une demande de chemin. Transforme-la simplement en question : « 서울역까지 어떻게 가요? »",
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
      "Ta question est naturelle. Comme ton objectif est Seoul Station, tu peux être encore plus précis : « 서울역 가는 공항철도는 어디예요? »",
    matches: (value) =>
      includesAny(value, ["공항철도", "arex"]) && hasQuestionShape(value),
  },
  {
    targetIntent: "continue",
    examples: ["이제 뭐 해요?", "그다음은요?"],
    confidence: "matched",
    understood: "tu demandes ce qu’il faut faire ensuite",
    guidance:
      "« 그다음은요? » est déjà naturel et très courant. Si tu veux une phrase plus complète : « 그다음 어떻게 하면 돼요? »",
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
      "L’idée est claire. Pour demander explicitement lequel l’agent te conseille, dis : « 어느 열차를 타는 게 좋을까요? »",
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
      "« 어디서 타요? » est naturel dans ce contexte. Si tu veux nommer explicitement le quai, utilise « 플랫폼 » ou « 승강장 » : « 플랫폼은 어디예요? »",
    matches: (value) =>
      includesAny(value, ["어디서타", "타는곳", "어디로내려가", "열차어디있"]) &&
      !includesAny(value, ["공항철도", "arex"]),
  },
  {
    targetIntent: "repeat",
    examples: ["잘 못 들었어요.", "방금 뭐라고 하셨어요?"],
    confidence: "matched",
    understood: "tu n’as pas bien entendu et demandes une répétition",
    guidance:
      "C’est naturel. Une formule très polie et facile à réutiliser est : « 다시 한번 말씀해 주세요. »",
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
    guidance:
      "Ta réponse est naturelle. Pour terminer simplement et poliment, tu peux ajouter : « 감사합니다. »",
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
    return `Tu as bien donné la destination ou parlé de l’AREX, mais tu n’as pas formulé la demande de trajet. ${expectation}`;
  }
  if (intents.has("continue") && includesAny(value, ["네", "알겠", "다음"])) {
    return `Tu montres que tu suis l’explication, mais il manque encore la demande sur l’étape suivante. ${expectation}`;
  }
  if (intents.has("train-choice") && includesAny(value, ["열차", "기차", "직통", "일반"])) {
    return `Tu parles bien du train, mais tu n’as pas encore demandé lequel choisir. ${expectation}`;
  }
  if (intents.has("platform") && includesAny(value, ["플랫폼", "승강장", "타는곳"])) {
    return `Tu as bien identifié le quai ou le lieu d’embarquement, mais la question reste incomplète. ${expectation}`;
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
        "Oui, cette réponse convient naturellement à cette étape.",
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
        `Oui, ta phrase exprime clairement ce qu’il faut ici. ${getCurrentExpectation(choices)}`,
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
      `Ta phrase dit l’inverse de l’intention proposée à ce tour. ${getCurrentExpectation(choices)}`,
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
        ? `Tu as cité plusieurs étages (${floorNumbers.map((floor) => `${floor}층`).join(" et ")}). L’agent vient d’indiquer le sous-sol 1, « 지하 1층 ». Garde un seul étage, ou demande simplement où se trouve le quai.`
        : `Tu as cité « ${floorNumbers[0]}층 », alors que l’agent vient d’indiquer « 지하 1층 », le sous-sol 1. Tu peux reprendre cet étage ou demander simplement où se trouve le quai.`,
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
      `Tu demandes un trajet vers ${wrongDestinations.join(", ")}, mais cette scène travaille le trajet vers Seoul Station. ${getCurrentExpectation(choices)}`,
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
      `Tu as cité Seoul Station et une autre destination dans la même réponse. Garde seulement celle que tu veux rejoindre. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  if (signals.length > 1) {
    return needsHelp(
      "ambiguous",
      `Tu as exprimé plusieurs intentions à la fois. ${getCurrentExpectation(choices)}`,
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
          ? `Oui, ta réponse est naturelle ici. ${getCurrentExpectation(choices)}`
          : `Je t’ai compris même si tu n’as pas repris exactement la formulation proposée. ${getCurrentExpectation(choices)}`,
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
      `Ta phrase peut être comprise de plusieurs façons. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  if (availableContextualMatches.length === 1) {
    const [{ rule, choice }] = availableContextualMatches;
    const feedback = `J’ai compris : ${rule.understood}. ${getCurrentExpectation(choices)} ${rule.guidance}`;
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
      `J’ai compris : ${understood}. Ce n’est simplement pas ce que l’agent attend à ce moment-là. ${getCurrentExpectation(choices)}`,
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
    `Je ne retrouve pas encore une intention adaptée à ce tour. ${getCurrentExpectation(choices)}`,
    choices,
    attemptNumber,
  );
}
