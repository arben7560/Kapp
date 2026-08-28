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
  | "register-imperfection"
  | "transcription-recovery"
  | "contextual-interpretation"
  | "incomplete"
  | "ambiguous"
  | "wrong-destination"
  | "floor-conflict"
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
  countsAsCorrection?: boolean;
  allowNegation?: boolean;
  matches: (value: string, transcript: string) => boolean;
}>;

type TranscriptionRecovery = Readonly<{
  observed: string;
  canonical: string;
}>;

type FloorMention = Readonly<{
  floor: number;
  basement: boolean;
  index: number;
}>;

const WRONG_DESTINATIONS = [
  "홍대입구",
  "강남",
  "홍대",
  "명동",
  "이태원",
  "부산",
  "수원",
] as const;

const TRANSCRIPTION_CONFUSIONS: readonly Readonly<{
  variants: readonly string[];
  canonical: string;
}>[] = [
  { variants: ["서울력", "서울녁", "서을역"], canonical: "서울역" },
  { variants: ["공항철또", "공항철도우"], canonical: "공항철도" },
  { variants: ["직통열짜"], canonical: "직통열차" },
  { variants: ["일반열짜"], canonical: "일반열차" },
  { variants: ["열짜"], canonical: "열차" },
  { variants: ["플랫품", "플렛폼", "플랫폼"], canonical: "플랫폼" },
  { variants: ["승강짱"], canonical: "승강장" },
  { variants: ["다씨"], canonical: "다시" },
  { variants: ["말슴"], canonical: "말씀" },
  { variants: ["감사함니다"], canonical: "감사합니다" },
  { variants: ["알겠슴니다"], canonical: "알겠습니다" },
] as const;

const NATURAL_VARIANTS: Readonly<
  Record<Exclude<AeroportSpeechIntent, "unknown">, readonly string[]>
> = {
  route: [
    "실례합니다서울역까지어떻게가요",
    "서울역에어떻게가요",
    "서울역까지어떻게가요",
    "서울역어떻게가요",
    "서울역까지어디로가요",
    "서울역어디로가요",
    "서울역가는공항철도어디예요",
    "서울역가는공항철도는어디예요",
    "서울역가려면어디로가야해요",
    "서울역가려면어디로가면돼요",
    "서울역가는길좀알려주세요",
    "서울역가는길알려주실수있어요",
  ],
  continue: [
    "알겠어요그다음어떻게하면돼요",
    "네그다음은요",
    "그다음은요",
    "다음은요",
    "그다음뭐하면돼요",
    "이제뭐하면돼요",
    "이제어디로가요",
  ],
  "train-choice": [
    "어느열차를타는게좋을까요",
    "어떤열차가좋아요",
    "어느열차를추천하세요",
    "일반열차와직통열차중뭐가좋아요",
    "직통이좋아요일반이좋아요",
    "뭘타야돼요",
    "어떤걸타면돼요",
    "직통열차랑일반열차중어느게좋아요",
  ],
  platform: [
    "플랫폼은어디예요",
    "플랫폼어디예요",
    "승강장은어디예요",
    "승강장어디예요",
    "어디에서타요",
    "어디서타요",
    "타는곳이어디예요",
    "열차타는곳이어디예요",
  ],
  repeat: [
    "다시요",
    "한번더요",
    "다시한번말씀해주세요",
    "다시한번말씀해주실수있나요",
    "다시말해주세요",
    "한번더말해주세요",
    "천천히말해주세요",
    "못들었어요",
    "잘못들었어요",
  ],
  thanks: [
    "정말감사합니다",
    "감사합니다",
    "고맙습니다",
    "감사해요",
    "알겠습니다감사합니다",
    "이해했어요감사합니다",
    "알겠습니다",
    "알겠어요",
    "이해했어요",
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

function isQuestionTranscript(transcript: string) {
  return /[?？]\s*$/u.test(transcript.trim());
}

function hasQuestionShape(value: string, transcript: string) {
  return isQuestionTranscript(transcript) || includesAny(value, [
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
    "해야해요",
    "있나요",
    "맞아요",
    "주실수있어요",
  ]);
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

function recoverProbableTranscription(value: string) {
  let corrected = value;
  const recoveries: TranscriptionRecovery[] = [];

  for (const { variants, canonical } of TRANSCRIPTION_CONFUSIONS) {
    for (const variant of variants) {
      const observed = compactKorean(variant);
      if (!corrected.includes(observed)) continue;
      corrected = corrected.replaceAll(observed, compactKorean(canonical));
      recoveries.push({ observed: variant, canonical });
    }
  }

  return { corrected, recoveries };
}

function buildTranscriptionRecoveryFeedback(
  recoveries: readonly TranscriptionRecovery[],
) {
  const details = recoveries
    .map(({ observed, canonical }) => `« ${observed} » → « ${canonical} »`)
    .join(" · ");
  return `La transcription semble avoir déformé un mot (${details}). L’intention reste suffisamment claire, donc je ne le compte pas comme une faute certaine de ta part.`;
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

function uncertain(
  category: AeroportSpeechCategory,
  choice: AeroportSpeechChoice | null,
  feedback: string,
  choices: readonly AeroportSpeechChoice[],
  interpretedIntent?: Exclude<AeroportSpeechIntent, "unknown">,
): AeroportSpeechMatch {
  return {
    reason: "uncertain",
    category,
    choice,
    feedback: withAvailableChoices(feedback, choices),
    understoodWithCorrection: false,
    ...(interpretedIntent ? { interpretedIntent } : {}),
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

function isInformalForIntent(
  value: string,
  intent: Exclude<AeroportSpeechIntent, "unknown">,
) {
  switch (intent) {
    case "route":
      return includesAny(value, ["서울역어떻게가", "서울역어디로가"]) &&
        !includesAny(value, ["가요", "가야해요", "가면돼요", "주세요", "주실수있어요"]);
    case "continue":
      return includesAny(value, ["그다음뭐해", "이제뭐해"]) && !value.endsWith("요");
    case "train-choice":
      return includesAny(value, ["뭘타야돼", "뭐타", "어떤거타"]) &&
        !includesAny(value, ["돼요", "타요", "좋아요", "까요"]);
    case "platform":
      return includesAny(value, ["어디서타", "플랫폼어디야", "승강장어디야"]) &&
        !includesAny(value, ["타요", "예요", "이에요"]);
    case "repeat":
      return ["다시", "한번더"].includes(value) ||
        (includesAny(value, ["다시말해", "한번더말해", "천천히말해"]) &&
          !includesAny(value, ["주세요", "줘요", "주실수있어요", "요"]));
    case "thanks":
      return includesAny(value, ["고마워", "알았어", "이해했어"]) &&
        !includesAny(value, ["고마워요", "알았어요", "이해했어요"]);
  }
}

const CONTEXTUAL_RULES: readonly ContextualRule[] = [
  {
    targetIntent: "route",
    examples: ["서울역에 가고 싶어요.", "서울역 가는 길을 찾고 있어요."],
    confidence: "uncertain",
    understood: "tu veux aller à Seoul Station",
    guidance:
      "La destination est claire, mais tu n’as pas encore demandé le chemin. Tu peux transformer l’idée en question : « 서울역까지 어떻게 가요? »",
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
      "C’est une demande naturelle dans ce contexte. Si tu veux préciser la destination, tu peux ajouter « 서울역 가는… », mais ce n’est pas obligatoire ici.",
    matches: (value, transcript) =>
      includesAny(value, ["공항철도", "arex"]) && hasQuestionShape(value, transcript),
  },
  {
    targetIntent: "continue",
    examples: ["이제 뭐 해요?", "그다음은요?"],
    confidence: "matched",
    understood: "tu demandes ce qu’il faut faire ensuite",
    guidance:
      "« 그다음은요? » est déjà naturel et suffit dans cette conversation.",
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
    confidence: "matched",
    understood: "tu demandes quel train choisir entre le direct et le train avec arrêts",
    guidance:
      "La question est suffisamment claire. « 어느 열차를 타는 게 좋을까요? » est une autre possibilité, pas une correction obligatoire.",
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
    confidence: "matched",
    understood: "tu demandes où monter dans le train",
    guidance:
      "« 어디서 타요? » est naturel ici parce que le train dont on parle est déjà connu. Tu n’as pas besoin de répéter « 플랫폼 » ou « 승강장 ».",
    matches: (value) =>
      includesAny(value, ["어디서타", "타는곳", "어디로내려가", "열차어디있"]) &&
      !includesAny(value, ["공항철도", "arex"]),
  },
  {
    targetIntent: "repeat",
    examples: ["잘 못 들었어요.", "방금 뭐라고 하셨어요?"],
    confidence: "matched",
    understood: "tu n’as pas bien entendu et demandes implicitement une répétition",
    guidance:
      "Dans ce contexte, c’est suffisant pour demander que l’agent répète. « 다시 한번 말씀해 주세요 » est simplement une version plus explicite.",
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
    examples: ["덕분에 알겠어요.", "이제 찾을 수 있어요.", "네."],
    confidence: "matched",
    understood: "tu montres que tu as compris et peux terminer l’échange",
    guidance:
      "C’est une clôture acceptable. Tu peux ajouter « 감사합니다 » si tu veux remercier explicitement l’agent, mais ce n’est pas nécessaire pour que la réponse soit correcte.",
    matches: (value) =>
      includesAny(value, [
        "덕분에알겠",
        "이제찾을수있",
        "어디로갈지알겠",
        "도움이됐",
      ]) || ["네", "예"].includes(value),
  },
] as const;

function getContextualRules(value: string, transcript: string) {
  const negated = hasNegation(value);
  return CONTEXTUAL_RULES.filter(
    ({ allowNegation, matches }) =>
      matches(value, transcript) && (!negated || allowNegation),
  );
}

function hasSeoulStation(value: string) {
  return includesAny(value, ["서울역", "seoulstation"]);
}

function getIntentSignals(value: string, transcript: string) {
  const signals = new Set<Exclude<AeroportSpeechIntent, "unknown">>();
  const seoulStation = hasSeoulStation(value);

  if (
    seoulStation &&
    (includesAny(value, [
      "어떻게가",
      "어디로가",
      "어디로가면",
      "가려면",
      "가는길",
      "가는공항철도",
      "어디서타",
      "알려주",
    ]) || includesAny(value, ["공항철도", "arex"]))
  ) {
    signals.add("route");
  }
  if (includesAny(value, ["그다음", "다음은", "이제뭐", "이제어디로", "그후"])) {
    signals.add("continue");
  }
  if (
    (includesAny(value, ["열차", "기차", "직통", "일반"]) &&
      includesAny(value, ["어느", "어떤", "뭐", "추천", "좋", "타야", "타면"])) ||
    includesAny(value, ["뭘타야", "어떤걸타"])
  ) {
    signals.add("train-choice");
  }
  if (
    (includesAny(value, ["플랫폼", "승강장", "타는곳"]) &&
      hasQuestionShape(value, transcript)) ||
    includesAny(value, ["어디서타", "어디에서타"])
  ) {
    signals.add("platform");
  }
  if (includesAny(value, [
    "다시",
    "한번더",
    "천천히",
  ])) {
    signals.add("repeat");
  }
  if (includesAny(value, [
    "감사",
    "고맙",
    "고마",
    "이해했",
    "알겠습니다",
    "알겠어요",
  ])) {
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
      return includesAny(value, [
        "서울역안가",
        "서울역에안가",
        "서울역가지않",
        "서울역말고",
        "서울역가는거아니",
      ]);
    case "continue":
      return includesAny(value, ["다음필요없", "그다음안", "계속안", "이제안"]);
    case "train-choice":
      return includesAny(value, [
        "열차안타",
        "기차안타",
        "직통열차안타",
        "일반열차안타",
        "추천필요없",
        "아무거나싫",
      ]);
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

function normalizeFloorWords(value: string) {
  return value
    .replace(/지하일층/g, "지하1층")
    .replace(/지하이층/g, "지하2층")
    .replace(/지하삼층/g, "지하3층")
    .replace(/지하사층/g, "지하4층")
    .replace(/일층/g, "1층")
    .replace(/이층/g, "2층")
    .replace(/삼층/g, "3층")
    .replace(/사층/g, "4층");
}

function findEffectiveFloorMentions(value: string) {
  const expanded = normalizeFloorWords(value);
  const mentions: FloorMention[] = [...expanded.matchAll(/(지하)?([1-9])층/gu)]
    .map((match) => ({
      floor: Number(match[2]),
      basement: Boolean(match[1]),
      index: match.index ?? -1,
    }));

  const correctionIndex = [...expanded.matchAll(
    /(?:아니라|아니고요?|아니요|아니(?!면)|말고요?|말고)(?=(?:지하)?[1-9]층)/gu,
  )].at(-1)?.index ?? -1;

  return correctionIndex >= 0
    ? mentions.filter(({ index }) => index > correctionIndex)
    : mentions;
}

function findWrongDestinations(value: string) {
  return WRONG_DESTINATIONS.filter((destination, index) => {
    const normalized = compactKorean(destination);
    if (!value.includes(normalized)) return false;
    return !WRONG_DESTINATIONS.slice(0, index).some((longer) =>
      compactKorean(longer).includes(normalized) &&
      value.includes(compactKorean(longer)),
    );
  });
}

function hasExplicitDestinationCorrection(value: string) {
  const seoulTokens = ["서울역", "seoulstation"];
  const seoulIndexes = seoulTokens
    .map((token) => value.indexOf(compactKorean(token)))
    .filter((index) => index >= 0);
  if (seoulIndexes.length === 0) return false;
  const seoulIndex = Math.min(...seoulIndexes);

  return findWrongDestinations(value).some((destination) => {
    const normalizedDestination = compactKorean(destination);
    const destinationIndex = value.indexOf(normalizedDestination);
    if (destinationIndex < 0 || destinationIndex >= seoulIndex) return false;
    const segment = value.slice(
      destinationIndex + normalizedDestination.length,
      seoulIndex,
    );
    return /(?:아니라|아니고요?|아니요|아니(?!면)|말고요?|말고)/u.test(segment);
  });
}

function getIncompleteFeedback(
  value: string,
  choices: readonly AeroportSpeechChoice[],
  signals: readonly Exclude<AeroportSpeechIntent, "unknown">[],
) {
  const intents = new Set(choices.map(getAeroportSpeechChoiceIntent));
  const expectation = getCurrentExpectation(choices);

  if (intents.has("route") && hasSeoulStation(value) && !signals.includes("route")) {
    if (includesAny(value, ["서울역어디예요", "seoulstation어디예요"])) {
      return `Tu demandes où se trouve Seoul Station, mais pas encore comment la rejoindre depuis l’aéroport. ${expectation}`;
    }
    return `La destination Seoul Station est claire, mais tu n’as pas encore formulé la demande de trajet. ${expectation}`;
  }
  if (
    intents.has("route") &&
    includesAny(value, ["공항철도", "arex"]) &&
    !signals.includes("route")
  ) {
    return `Tu as bien identifié l’AREX, mais il manque encore une demande claire. ${expectation}`;
  }
  if (
    intents.has("continue") &&
    (["네", "예"].includes(value) ||
      includesAny(value, ["알겠어요", "알겠습니다", "이해했어요", "다음"])) &&
    !signals.includes("continue")
  ) {
    return `Tu montres que tu as compris, mais tu n’as pas encore demandé l’étape suivante. ${expectation}`;
  }
  if (
    intents.has("train-choice") &&
    includesAny(value, ["열차", "기차", "직통", "일반"]) &&
    !signals.includes("train-choice")
  ) {
    return `Tu parles bien du train, mais tu n’as pas encore demandé lequel choisir. ${expectation}`;
  }
  if (
    intents.has("platform") &&
    includesAny(value, ["플랫폼", "승강장", "타는곳"]) &&
    !signals.includes("platform")
  ) {
    return `Tu as bien identifié le quai ou le lieu d’embarquement, mais la question reste incomplète. ${expectation}`;
  }
  return null;
}

function getNegativeConfirmation(
  value: string,
  transcript: string,
  choices: readonly AeroportSpeechChoice[],
) {
  if (!isQuestionTranscript(transcript)) return null;

  for (const intent of [
    "route",
    "continue",
    "train-choice",
    "platform",
    "thanks",
  ] as const) {
    if (!hasIntentNegation(value, intent)) continue;
    const choice = findChoiceForIntent(choices, intent);
    if (!choice) return null;

    return uncertain(
      "contextual-interpretation",
      choice,
      `Ta phrase est une question négative de confirmation, pas une négation déclarative. Je comprends l’intention, mais je préfère ne pas la valider automatiquement comme la réponse attendue. ${getCurrentExpectation(choices)}`,
      choices,
      intent,
    );
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
  const rawValue = compactKorean(transcript);

  if (!rawValue) {
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

  const { corrected: recoveredValue, recoveries } =
    recoverProbableTranscription(rawValue);
  if (recoveries.length > 0 && recoveredValue !== rawValue) {
    const recoveredResult = matchAeroportSpeechIntent(
      recoveredValue,
      choices,
      attemptNumber,
    );
    if (recoveredResult.reason === "matched") {
      return {
        ...recoveredResult,
        category: "transcription-recovery",
        feedback: buildTranscriptionRecoveryFeedback(recoveries),
        understoodWithCorrection: false,
      };
    }
    if (recoveredResult.reason === "uncertain") {
      return {
        ...recoveredResult,
        feedback: `${buildTranscriptionRecoveryFeedback(recoveries)} ${recoveredResult.feedback}`,
      };
    }
  }

  const value = rawValue;
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
    if (NATURAL_VARIANTS[intent].some((variant) => value === compactKorean(variant))) {
      return matched(
        "natural",
        choice,
        intent,
        `Oui, cette formulation est naturelle et convient à cette étape. ${getCurrentExpectation(choices)}`,
      );
    }
  }

  const availableIntents = new Set(choices.map(getAeroportSpeechChoiceIntent));
  const negativeConfirmation = getNegativeConfirmation(
    value,
    transcript,
    choices,
  );
  if (negativeConfirmation) return negativeConfirmation;

  const negatedSignal = [...availableIntents].find(
    (intent): intent is Exclude<AeroportSpeechIntent, "unknown"> =>
      intent !== "unknown" && hasIntentNegation(value, intent),
  );
  if (negatedSignal) {
    return needsHelp(
      "negation-conflict",
      `Ta phrase affirme l’inverse de l’intention attendue à ce tour. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  const floorMentions = findEffectiveFloorMentions(value);
  if (
    floorMentions.length > 1 ||
    floorMentions.some(({ floor, basement }) => floor !== 1 || !basement)
  ) {
    const uniqueLabels = [...new Set(
      floorMentions.map(({ floor, basement }) =>
        `${basement ? "지하 " : ""}${floor}층`,
      ),
    )];
    return needsHelp(
      "floor-conflict",
      floorMentions.length > 1
        ? `Tu as cité plusieurs repères d’étage (${uniqueLabels.join(" et ")}). Dans cette scène, l’agent a indiqué « 지하 1층 », le sous-sol 1. Garde un seul repère après une éventuelle auto-correction.`
        : floorMentions[0]?.floor === 1 && !floorMentions[0]?.basement
          ? `Attention : « 1층 » et « 지하 1층 » ne désignent pas le même niveau. Ici, l’agent a indiqué « 지하 1층 », le sous-sol 1.`
          : `Tu as indiqué « ${uniqueLabels[0]} », alors que l’agent a donné « 지하 1층 », le sous-sol 1.`,
      choices,
      attemptNumber,
    );
  }

  const wrongDestinations = findWrongDestinations(value);
  const seoulStation = hasSeoulStation(value);
  if (wrongDestinations.length > 0 && !seoulStation) {
    return needsHelp(
      "wrong-destination",
      `Tu demandes un trajet vers ${wrongDestinations.join(", ")}, mais cette scène travaille le trajet vers Seoul Station. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }
  if (
    wrongDestinations.length > 0 &&
    seoulStation &&
    !hasExplicitDestinationCorrection(value)
  ) {
    return needsHelp(
      "ambiguous",
      `Tu as cité Seoul Station et une autre destination dans la même réponse, sans auto-correction claire. Garde seulement celle que tu veux rejoindre. ${getCurrentExpectation(choices)}`,
      choices,
      attemptNumber,
    );
  }

  const signals = getIntentSignals(value, transcript);
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
      if (isInformalForIntent(value, intent)) {
        return matched(
          "register-imperfection",
          choice,
          intent,
          `Je comprends très bien ton intention, mais la formulation est trop directe pour un agent que tu ne connais pas. Garde une forme polie en « 요 » ou une demande avec « 주세요 » selon la phrase.`,
          true,
        );
      }
      return matched(
        "natural",
        choice,
        intent,
        `Oui, ta formulation est suffisamment naturelle et précise pour cette situation. ${getCurrentExpectation(choices)}`,
      );
    }
  }

  const contextualMatches = getContextualRules(value, transcript);
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
        rule.countsAsCorrection ?? false,
      );
    }
    return uncertain(
      "contextual-interpretation",
      choice,
      feedback,
      choices,
      rule.targetIntent,
    );
  }

  const incompleteFeedback = getIncompleteFeedback(value, choices, signals);
  if (incompleteFeedback) {
    return needsHelp(
      "incomplete",
      incompleteFeedback,
      choices,
      attemptNumber,
    );
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
      platform: "tu demandes où prendre le train",
      repeat: "tu demandes une répétition",
      thanks: "tu remercies l’agent ou indiques que tu as compris",
    }[intent];
    return needsHelp(
      "out-of-scope",
      `Ta formulation est compréhensible : ${understood}. Elle ne correspond simplement pas à l’objectif de ce tour. ${getCurrentExpectation(choices)}`,
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
