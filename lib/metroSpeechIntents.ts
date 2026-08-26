import { getSpeechRecognitionFailureMessage } from "./speechRecognitionState.ts";

export const METRO_SPEECH_PILOT_MISSION_ID = "ask-direction";

export type MetroSpeechCategory =
  | "natural"
  | "minor-imperfection"
  | "particle-imperfection"
  | "word-order"
  | "go-come-confusion"
  | "incomplete"
  | "mixed-language"
  | "destination-only"
  | "direction-only"
  | "exit-confusion"
  | "duration-confusion"
  | "transfer-confusion"
  | "line-confusion"
  | "negation-conflict"
  | "contextual-interpretation"
  | "wrong-destination"
  | "french"
  | "uncertain"
  | "out-of-scope"
  | "empty"
  | "repeat"
  | "repeat-informal"
  | "repeat-word-order"
  | "duration"
  | "duration-imperfection"
  | "transfer"
  | "transfer-imperfection"
  | "thanks"
  | "understood"
  | "thanks-informal"
  | "ambiguous-acknowledgement"
  | "not-understood"
  | "relevant-question";

export type MetroSpeechIntent =
  | "direction"
  | "thanks"
  | "repeat"
  | "transfer"
  | "duration"
  | "unknown";

type MetroContextualInterpretationRule = Readonly<{
  targetIntent: Exclude<MetroSpeechIntent, "unknown">;
  examples: readonly string[];
  confidence: "matched" | "uncertain";
  understood: string;
  guidance: string;
  allowNegation?: boolean;
  matches: (value: string, transcript: string) => boolean;
}>;

export type MetroSpeechChoice = {
  id: string;
  label: string;
  korean: string;
  nextNodeId: string;
};

export type MetroSpeechMatch = {
  reason: "matched" | "uncertain" | "needs-help" | "empty";
  category: MetroSpeechCategory;
  choice: MetroSpeechChoice | null;
  feedback: string;
  understoodWithCorrection: boolean;
  interpretedIntent?: Exclude<MetroSpeechIntent, "unknown">;
};

const DIRECTION_CHOICE_ID = "choose_hongik_direction";
const GANGNAM_MODEL = "강남 방향은 어느 쪽이에요?";

const DESTINATION_CONFUSIONS = ["강람", "간남", "강남역은", "강남녁"];
const REPEAT_CONFUSIONS = ["다시이", "다씨", "말슴", "천천이"];
const CLOSING_CONFUSIONS = ["감사함니다", "감사합니", "알게써요", "이해해써요"];
const TRANSFER_CONFUSIONS = ["갈라타", "가라타"];
const WRONG_DESTINATIONS = [
  "이태원",
  "명동",
  "잠실",
  "서울역",
  "신촌",
  "합정",
];

function compactKorean(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[\s.,!?;:'"“”‘’…~\-_/()[\]{}]/g, "");
}

function compactLatin(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/[^a-z0-9]/g, "");
}

function includesAny(value: string, candidates: readonly string[]) {
  return candidates.some((candidate) => value.includes(compactKorean(candidate)));
}

function hasMetroNegation(value: string) {
  return includesAny(value, [
    "안",
    "못",
    "않",
    "아니",
    "말고",
    "필요없",
    "생각없",
  ]);
}

function hasMetroQuestionShape(value: string, transcript: string) {
  return /[?？]/u.test(transcript) || includesAny(value, [
    "어디",
    "어느",
    "어떻게",
    "얼마나",
    "몇",
    "뭐",
    "무엇",
    "나요",
    "까요",
    "해야",
    "있어요",
    "맞아요",
    "예요",
    "이에요",
    "돼요",
  ]);
}

function normalizeMetroLineNumbers(value: string) {
  return value
    .replace(/일호선/g, "1호선")
    .replace(/이호선/g, "2호선")
    .replace(/삼호선/g, "3호선")
    .replace(/사호선/g, "4호선")
    .replace(/오호선/g, "5호선")
    .replace(/육호선/g, "6호선")
    .replace(/칠호선/g, "7호선")
    .replace(/팔호선/g, "8호선")
    .replace(/구호선/g, "9호선");
}

function findEffectiveMetroLineNumbers(value: string) {
  const normalized = normalizeMetroLineNumbers(value);
  const mentions = [...normalized.matchAll(/([1-9])호선/gu)].map((match) => ({
    line: Number(match[1]),
    index: match.index ?? -1,
  }));
  const correctionIndex = [...normalized.matchAll(
    /(?:아니라|아니요?|말고)(?=[1-9]호선)/gu,
  )].at(-1)?.index ?? -1;
  const effectiveMentions = correctionIndex >= 0
    ? mentions.filter(({ index }) => index > correctionIndex)
    : mentions;

  return [...new Set(effectiveMentions.map(({ line }) => line))];
}

function getMetroCurrentExpectation(choices: readonly MetroSpeechChoice[]) {
  const intents = new Set(choices.map(getMetroSpeechChoiceIntent));

  if (intents.has("direction")) {
    return "Ici, le plus naturel est de demander simplement comment aller vers Gangnam depuis Hongik University.";
  }

  const actions = [
    intents.has("duration") ? "demander la durée" : null,
    intents.has("transfer") ? "demander s’il faut changer de ligne" : null,
    intents.has("repeat") ? "demander de répéter" : null,
    intents.has("thanks") ? "indiquer que tu as compris et terminer l’échange" : null,
  ].filter(Boolean);

  return actions.length > 0
    ? `Ici, les choix proposés te permettent de ${actions.join(", ")}.`
    : "Ici, reste simplement sur ce que tu peux répondre à cette étape.";
}

function findChoice(
  choices: readonly MetroSpeechChoice[],
  predicate: (choice: MetroSpeechChoice) => boolean,
) {
  return choices.find(predicate) ?? null;
}

export function getMetroSpeechChoiceIntent(
  choice: MetroSpeechChoice,
): MetroSpeechIntent {
  if (choice.id === DIRECTION_CHOICE_ID) return "direction";
  if (/감사|고마/.test(choice.korean) || /^thank/.test(choice.id)) {
    return "thanks";
  }
  if (/다시|한번/.test(choice.korean) || /^repeat/.test(choice.id)) {
    return "repeat";
  }
  if (/환승|갈아타/.test(choice.korean) || /transfer/.test(choice.id)) {
    return "transfer";
  }
  if (
    /시간|얼마나/.test(choice.korean) ||
    /(?:ask_)?(?:trip|time)/.test(choice.id)
  ) {
    return "duration";
  }

  return "unknown";
}

const METRO_CONTEXTUAL_INTERPRETATIONS: readonly MetroContextualInterpretationRule[] = [
  {
    targetIntent: "direction",
    examples: [
      "강남행은 어디예요?",
      "강남 가는 플랫폼이 어디예요?",
      "강남 쪽 승강장이 어디예요?",
    ],
    confidence: "matched",
    understood: "tu cherches le quai ou le train qui va vers Gangnam",
    guidance:
      "Ta question est naturelle. Dans cette situation, tu peux aussi dire : « 강남 방향은 어느 쪽이에요? »",
    matches: (value, transcript) =>
      includesAny(value, ["강남행", "강남가는플랫폼", "강남쪽승강장", "강남가는열차", "강남쪽타는곳"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "direction",
    examples: ["강남에 가고 싶어요.", "강남역을 찾고 있어요."],
    confidence: "uncertain",
    understood: "tu veux aller à Gangnam ou que tu cherches le trajet vers Gangnam",
    guidance:
      "Je vois ce que tu veux dire, mais il manque encore la question. Tu peux demander simplement : « 강남에 어떻게 가요? »",
    matches: (value) =>
      includesAny(value, ["강남에가고싶", "강남가고싶", "강남역을찾", "강남가는길을찾", "강남가야해"]) &&
      !includesAny(value, ["어떻게", "어디", "어느쪽"]),
  },
  {
    targetIntent: "duration",
    examples: ["강남까지 몇 분이에요?", "강남까지 오래 걸려요?"],
    confidence: "matched",
    understood: "tu demandes combien de temps il faut pour arriver à Gangnam",
    guidance: "Ta question fonctionne très bien. Une tournure simple et passe-partout serait : « 강남까지 얼마나 걸려요? »",
    matches: (value, transcript) =>
      includesAny(value, ["몇분이에요", "몇분쯤", "소요시간", "오래걸려", "금방가요", "빨리가요"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "duration",
    examples: ["강남까지 오래 안 걸려요?"],
    confidence: "matched",
    understood: "tu demandes si le trajet vers Gangnam ne prend pas trop longtemps",
    guidance: "C’est naturel. Si tu préfères une question plus neutre, tu peux dire : « 강남까지 얼마나 걸려요? »",
    allowNegation: true,
    matches: (value, transcript) =>
      includesAny(value, ["오래안걸려", "시간이많이안걸려"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "transfer",
    examples: ["다른 노선으로 바꿔야 해요?", "중간에 내려야 해요?"],
    confidence: "uncertain",
    understood: "tu demandes s’il faut descendre en route ou prendre une autre ligne",
    guidance:
      "Je vois l’idée. Pour parler d’une correspondance, on dira plus naturellement « 갈아타다 » : « 갈아타야 하나요? »",
    matches: (value, transcript) =>
      includesAny(value, ["다른노선", "다른라인", "중간에내려", "중간에바꿔", "다른지하철", "한번내려"]) &&
      includesAny(value, ["바꿔", "타", "내려", "갈아"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "transfer",
    examples: ["갈아타지 않아도 돼요?", "환승 안 해도 돼요?"],
    confidence: "matched",
    understood: "tu demandes si tu peux rester sur la même ligne sans correspondance",
    guidance: "Oui, ça se dit très bien. Tu peux aussi demander plus directement : « 갈아타야 하나요? »",
    allowNegation: true,
    matches: (value, transcript) =>
      includesAny(value, ["갈아타지않아도돼", "환승안해도돼", "바꿔타지않아도돼"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "repeat",
    examples: ["방금 뭐라고 하셨어요?", "조금 더 천천히 부탁드려요."],
    confidence: "matched",
    understood: "tu n’as pas bien entendu et demandes que l’explication soit répétée",
    guidance:
      "Oui, c’est naturel. Si tu veux aller au plus simple : « 다시 한번 말씀해 주세요. »",
    allowNegation: true,
    matches: (value) => includesAny(value, [
      "뭐라고하셨어",
      "잘안들려",
      "잘못들었",
      "못들었",
      "다시설명",
      "한번만더",
      "조금더천천히",
    ]),
  },
  {
    targetIntent: "thanks",
    examples: ["도움이 됐어요.", "이제 길을 알겠어요."],
    confidence: "matched",
    understood: "tu indiques que l’explication t’a aidé et que tu sais maintenant où aller",
    guidance:
      "C’est très clair. Pour fermer l’échange poliment, tu peux ajouter : « 감사합니다. »",
    matches: (value) => includesAny(value, [
      "도움이됐",
      "이제길을알겠",
      "어디로갈지알겠",
      "이제찾을수있",
      "덕분에알겠",
    ]),
  },
] as const;

function getMetroContextualRulesForValue(value: string, transcript: string) {
  const hasNegation = hasMetroNegation(value);
  return METRO_CONTEXTUAL_INTERPRETATIONS.filter(
    ({ allowNegation, matches }) =>
      matches(value, transcript) && (!hasNegation || allowNegation),
  );
}

function getMetroContextualInterpretation(
  value: string,
  transcript: string,
  choices: readonly MetroSpeechChoice[],
): MetroSpeechMatch | null {
  const availableRules = getMetroContextualRulesForValue(value, transcript)
    .flatMap((rule) => {
      const choice = findChoice(
        choices,
        (candidate) => getMetroSpeechChoiceIntent(candidate) === rule.targetIntent,
      );
      return choice ? [{ rule, choice }] : [];
    });

  if (availableRules.length > 1) {
    return {
      reason: "needs-help",
      category: "uncertain",
      choice: null,
      feedback: withAvailableChoices(
        `Ta phrase peut vouloir dire plusieurs choses ici. ${getMetroCurrentExpectation(choices)}`,
        choices,
      ),
      understoodWithCorrection: false,
    };
  }

  if (availableRules.length !== 1) return null;

  const [{ rule, choice }] = availableRules;
  const feedback = `J’ai compris : ${rule.understood}. ${getMetroCurrentExpectation(choices)} ${rule.guidance}`;

  if (rule.confidence === "matched") {
    return {
      ...matched("contextual-interpretation", choice, feedback, true),
      interpretedIntent: rule.targetIntent,
    };
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

function getMetroUnavailableContextualFeedback(
  value: string,
  transcript: string,
  choices: readonly MetroSpeechChoice[],
) {
  const availableIntents = new Set(choices.map(getMetroSpeechChoiceIntent));
  const unavailableRules = getMetroContextualRulesForValue(value, transcript)
    .filter(({ targetIntent }) => !availableIntents.has(targetIntent));

  if (unavailableRules.length !== 1) return null;

  const [rule] = unavailableRules;
  return `J’ai compris : ${rule.understood}. ${getMetroCurrentExpectation(choices)}`;
}

function getMetroIncompleteContextualFeedback(
  value: string,
  choices: readonly MetroSpeechChoice[],
) {
  const intents = new Set(choices.map(getMetroSpeechChoiceIntent));
  const expectation = getMetroCurrentExpectation(choices);

  if (
    intents.has("direction") &&
    includesAny(value, ["지하철", "플랫폼", "승강장", "가는길", "방향"]) &&
    !includesAny(value, ["강남", ...DESTINATION_CONFUSIONS])
  ) {
    return `Je vois que tu parles bien du métro, du quai ou de la direction, mais tu n’as pas indiqué la destination. ${expectation}`;
  }
  if (
    intents.has("duration") &&
    includesAny(value, ["강남까지", "시간", "몇분"]) &&
    !includesAny(value, ["걸", "분이에요", "얼마나", "오래"])
  ) {
    return `Tu es bien sur la durée du trajet, mais ta question s’arrête un peu trop tôt. ${expectation}`;
  }
  if (
    intents.has("transfer") &&
    includesAny(value, ["다른노선", "다른라인", "중간에", "환승역"]) &&
    !includesAny(value, ["바꿔", "타야", "내려", "어디", "있어요"])
  ) {
    return `Tu évoques bien une autre ligne ou une étape intermédiaire, mais tu n’as pas formulé la question. ${expectation}`;
  }
  return null;
}

function withAvailableChoices(
  feedback: string,
  choices: readonly MetroSpeechChoice[],
) {
  const labels = [...new Set(choices.map(({ label }) => label.trim()))].filter(
    Boolean,
  );

  if (labels.length === 0) return feedback;

  const conciseFeedback = feedback.trim().replace(/[.!?…]+$/u, "");
  return `${conciseFeedback} — réponses proposées : ${labels
    .map((label) => `« ${label} »`)
    .join(" · ")}.`;
}

function appendMetroGuidance(feedback: string, guidance: string) {
  return `${feedback.trim().replace(/[.!?…]+$/u, "")} — ${guidance}`;
}

function withProgressiveHelp(
  feedback: string,
  attemptNumber: number,
  context: "direction" | "follow-up" = "direction",
) {
  if (context === "follow-up") {
    if (attemptNumber >= 3) {
      return appendMetroGuidance(
        feedback,
        "si tu bloques, affiche les réponses pour revoir tranquillement les formulations proposées.",
      );
    }

    if (attemptNumber === 2) {
      return appendMetroGuidance(
        feedback,
        "réécoute une fois, puis appuie-toi sur une réponse proposée.",
      );
    }

    return feedback;
  }

  if (attemptNumber >= 3) {
    return appendMetroGuidance(
      feedback,
      `Phrase modèle : « ${GANGNAM_MODEL} » (Gangnam banghyang-eun eoneu jjog-ieyo?).`,
    );
  }

  if (attemptNumber === 2) {
    return appendMetroGuidance(
      feedback,
      "Mots utiles : 강남 · 방향 · 어느 쪽.",
    );
  }

  return feedback;
}

function matched(
  category: MetroSpeechCategory,
  choice: MetroSpeechChoice,
  feedback: string,
  understoodWithCorrection = false,
): MetroSpeechMatch {
  return {
    reason: "matched",
    category,
    choice,
    feedback,
    understoodWithCorrection,
  };
}

function needsHelp(
  category: MetroSpeechCategory,
  feedback: string,
  attemptNumber: number,
  context: "direction" | "follow-up" = "direction",
  choices: readonly MetroSpeechChoice[] = [],
): MetroSpeechMatch {
  return {
    reason: "needs-help",
    category,
    choice: null,
    feedback: withAvailableChoices(
      withProgressiveHelp(feedback, attemptNumber, context),
      choices,
    ),
    understoodWithCorrection: false,
  };
}

export function getMetroSpeechContextualStrings(
  choices: readonly MetroSpeechChoice[],
) {
  const available = choices.map((choice) => choice.korean);
  const contextualExamples = METRO_CONTEXTUAL_INTERPRETATIONS
    .filter(({ targetIntent }) =>
      choices.some(
        (choice) => getMetroSpeechChoiceIntent(choice) === targetIntent,
      ),
    )
    .flatMap(({ examples }) => examples);

  if (
    choices.some(
      (choice) => getMetroSpeechChoiceIntent(choice) === "direction",
    )
  ) {
    return [
      ...available,
      ...contextualExamples,
      "강남",
      "강남역",
      "홍대입구",
      "강남에 어떻게 가요?",
      "강남까지 어떻게 가요?",
      "강남은 어떻게 가요?",
      "강남 가려면 어떻게 해요?",
      "강남 어떻게 가요?",
      "강남 가려면 어디로 가요?",
      "강남 가는 쪽이 어디예요?",
      "강남역 가는 길이 어디예요?",
      "2호선 어디서 타요?",
      "강남 가는 지하철 어디예요?",
      "강남은 어느 쪽이에요?",
      "강남 쪽은 어디예요?",
      "강남 가려면 어디로 가야 해요?",
      "강남 가는 방향이 어디예요?",
      "강남역 가는 쪽이 어디예요?",
      "방향",
      "어느 쪽",
      "가는 쪽",
      "가려면",
      "지하철",
      "2호선",
    ];
  }

  if (
    choices.some((choice) => getMetroSpeechChoiceIntent(choice) === "repeat")
  ) {
    const hasDurationChoice = choices.some(
      (choice) => getMetroSpeechChoiceIntent(choice) === "duration",
    );
    const hasTransferChoice = choices.some(
      (choice) => getMetroSpeechChoiceIntent(choice) === "transfer",
    );

    return [
      ...available,
      ...contextualExamples,
      "다시요",
      "한 번 더요",
      "다시 말해 주세요",
      "다시 한번 말씀해 주세요",
      "천천히 말해 주세요",
      "못 들었어요",
      "이해 못 했어요",
      "감사합니다",
      "고맙습니다",
      "감사해요",
      "알겠습니다",
      "알겠어요",
      "이해했어요",
      "2호선 맞아요?",
      "지하 2층이에요?",
      "합정 방향이에요?",
      "신도림 쪽이에요?",
      "외선순환이 뭐예요?",
      "B2가 어디예요?",
      "몇 호선이에요?",
      ...(hasDurationChoice
        ? [
            "얼마나 걸려요?",
            "강남까지 얼마나 걸려요?",
            "몇 분 걸려요?",
            "시간이 얼마나 걸려요?",
          ]
        : []),
      ...(hasTransferChoice
        ? [
            "환승해야 해요?",
            "갈아타야 해요?",
            "갈아타야 하나요?",
            "환승 있어요?",
            "어디서 갈아타요?",
            "어디서 환승해요?",
          ]
        : []),
    ];
  }

  return [...available, ...contextualExamples];
}

export function getMetroSpeechModelPhrase() {
  return GANGNAM_MODEL;
}

export function matchMetroSpeechIntent(
  transcript: string,
  choices: readonly MetroSpeechChoice[],
  attemptNumber = 1,
): MetroSpeechMatch {
  const korean = compactKorean(transcript);
  const latin = compactLatin(transcript);
  const help = (
    category: MetroSpeechCategory,
    feedback: string,
    _attemptNumber = attemptNumber,
    context: "direction" | "follow-up" = "direction",
  ) => needsHelp(category, feedback, attemptNumber, context, choices);

  if (!korean) {
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

  const directionChoice = findChoice(
    choices,
    (choice) => getMetroSpeechChoiceIntent(choice) === "direction",
  );
  const repeatChoice = findChoice(
    choices,
    (choice) => getMetroSpeechChoiceIntent(choice) === "repeat",
  );
  const thanksChoice = findChoice(
    choices,
    (choice) => getMetroSpeechChoiceIntent(choice) === "thanks",
  );
  const durationChoice = findChoice(
    choices,
    (choice) => getMetroSpeechChoiceIntent(choice) === "duration",
  );
  const transferChoice = findChoice(
    choices,
    (choice) => getMetroSpeechChoiceIntent(choice) === "transfer",
  );
  const effectiveLineNumbers = findEffectiveMetroLineNumbers(korean);

  if (
    directionChoice &&
    (effectiveLineNumbers.length > 1 ||
      effectiveLineNumbers.some((line) => line !== 2))
  ) {
    return help(
      "line-confusion",
      effectiveLineNumbers.length > 1
        ? `Tu as cité plusieurs lignes (${effectiveLineNumbers
            .map((line) => `${line}호선`)
            .join(" et ")}). Pour aller vers Gangnam dans cette scène, c’est la ligne 2.`
        : `Tu as cité la ligne ${effectiveLineNumbers[0]}. Pour aller vers Gangnam dans cette scène, c’est la ligne 2 : demande où prendre « 2호선 » vers Gangnam.`,
      attemptNumber,
    );
  }

  const contextualInterpretation = getMetroContextualInterpretation(
    korean,
    transcript,
    choices,
  );

  if (contextualInterpretation) {
    return contextualInterpretation;
  }

  const unavailableContextualFeedback = getMetroUnavailableContextualFeedback(
    korean,
    transcript,
    choices,
  );

  if (unavailableContextualFeedback) {
    return help(
      "out-of-scope",
      unavailableContextualFeedback,
      attemptNumber,
      directionChoice ? "direction" : "follow-up",
    );
  }

  if (!directionChoice) {
    const hasExactDurationQuestion = includesAny(korean, [
      "얼마나걸",
      "몇분",
      "시간",
      "오래걸",
    ]);
    const hasApproximateDuration = includesAny(korean, [
      "몇뿐걸",
      "얼마나껄",
      "시깐이얼마나",
    ]);
    const hasDurationQuestion =
      hasExactDurationQuestion || hasApproximateDuration;
    const hasExitQuestion = includesAny(korean, ["출구", "몇번출구", "나가야"]);
    const hasExactTransferQuestion = includesAny(korean, [
      "환승",
      "갈아타",
      "바꿔타",
    ]);
    const hasApproximateTransfer =
      includesAny(korean, TRANSFER_CONFUSIONS) &&
      includesAny(korean, [
        "타야하나요",
        "타야해요",
        "타야돼요",
        "타요",
      ]);
    const hasTransferQuestion =
      hasExactTransferQuestion || hasApproximateTransfer;
    const hasNotUnderstood = includesAny(korean, [
      "아니요",
      "아직이해못",
      "이해못",
      "이해가안",
      "아직잘모르",
      "모르겠",
      "잘못들었",
      "못들었",
      "이해하지못",
      "이해하지않",
    ]);
    const hasRepeat = includesAny(korean, [
      "다시",
      "한번더",
      "천천히",
      "반복",
    ]);
    const hasApproximateRepeat = includesAny(korean, REPEAT_CONFUSIONS);
    const hasRelevantContentQuestion =
      includesAny(korean, [
        "2호선맞",
        "몇호선",
        "지하2층",
        "b2가어디",
        "합정방향",
        "신도림쪽",
        "외선순환이뭐",
        "외선순환뭐",
      ]) &&
      includesAny(korean, ["맞", "어디", "뭐", "이에요", "예요", "호선"]);
    const isOnlyAcknowledgement = includesAny(korean, ["네", "예"]) &&
      ["네", "예", "아네", "아예"].includes(korean);
    const hasNegativeDuration =
      hasDurationQuestion &&
      includesAny(korean, ["시간안", "시간은안", "몇분안", "오래안", "궁금하지않", "묻지않", "물어보지않"]);
    const hasNegativeTransfer =
      hasTransferQuestion &&
      includesAny(korean, ["환승안", "갈아타지않", "갈아타면안", "바꿔타지않", "묻지않"]) &&
      !includesAny(korean, ["환승안해도돼", "갈아타지않아도돼", "바꿔타지않아도돼"]);

    if (hasExitQuestion) {
      return help(
        "exit-confusion",
        "Tu es déjà parti sur la sortie. Ici, on est encore sur les indications de trajet ; reste sur les options proposées.",
        attemptNumber,
        "follow-up",
      );
    }

    if (hasDurationQuestion && hasTransferQuestion) {
      return help(
        "uncertain",
        "Tu as posé deux questions d’un coup : la durée et la correspondance. Prends-les l’une après l’autre ; ce sera plus clair dans l’échange.",
        attemptNumber,
        "follow-up",
      );
    }

    if (hasNegativeDuration || hasNegativeTransfer) {
      return help(
        "negation-conflict",
        `Ta phrase donne plutôt l’impression que tu ne veux pas poser cette question. ${getMetroCurrentExpectation(choices)}`,
        attemptNumber,
        "follow-up",
      );
    }

    if (hasDurationQuestion) {
      if (!durationChoice) {
        return help(
          "duration-confusion",
          "Tu as déjà demandé la durée. Ici, passe plutôt à l’autre question, demande de répéter ou termine l’échange.",
          attemptNumber,
          "follow-up",
        );
      }

      const isNaturalDuration = includesAny(korean, [
        "얼마나걸려요",
        "강남까지얼마나걸려요",
        "몇분걸려요",
        "시간이얼마나걸려요",
        "시간은얼마나걸리나요",
      ]);

      if (hasApproximateDuration) {
        return matched(
          "duration-imperfection",
          durationChoice,
          "Je vois que tu demandes la durée. La transcription semble avoir déformé un mot ; la tournure simple et naturelle est « 얼마나 걸려요? ».",
          true,
        );
      }

      return matched(
        isNaturalDuration ? "duration" : "duration-imperfection",
        durationChoice,
        isNaturalDuration
          ? "Oui, c’est clair : tu demandes combien de temps dure le trajet."
          : "Oui, je vois ce que tu demandes : la durée. Tu peux le dire très simplement avec « 얼마나 걸려요? ».",
        !isNaturalDuration,
      );
    }

    if (hasTransferQuestion) {
      if (!transferChoice) {
        return help(
          "transfer-confusion",
          "Tu as déjà demandé s’il fallait changer de ligne. Ici, passe plutôt à l’autre question, demande de répéter ou termine l’échange.",
          attemptNumber,
          "follow-up",
        );
      }

      const isNaturalTransfer = includesAny(korean, [
        "환승해야해요",
        "갈아타야해요",
        "환승있어요",
        "어디서환승해요",
        "어디서갈아타요",
        "갈아타야하나요",
      ]);

      if (hasApproximateTransfer) {
        return matched(
          "transfer-imperfection",
          transferChoice,
          "Tu demandes s’il faut changer de ligne. La transcription semble avoir accroché sur « 갈아타다 » ; la forme claire est « 갈아타야 하나요? ».",
          true,
        );
      }

      return matched(
        isNaturalTransfer ? "transfer" : "transfer-imperfection",
        transferChoice,
        isNaturalTransfer
          ? "Oui, c’est clair : tu demandes s’il faut faire une correspondance."
          : "Oui, je vois ce que tu demandes : une correspondance. En coréen, tu peux dire « 환승해야 해요? » ou « 갈아타야 해요? ».",
        !isNaturalTransfer,
      );
    }

    if (hasRelevantContentQuestion) {
      return help(
        "relevant-question",
        "Ta question est bien liée au trajet, mais cette question n’est pas disponible à ce moment-là. Demande de répéter ou poursuis avec l’une des réponses proposées.",
        attemptNumber,
        "follow-up",
      );
    }

    if (repeatChoice && hasNotUnderstood) {
      return matched(
        "not-understood",
        repeatChoice,
        "D’accord, tu me dis que tu n’as pas compris. On reprend les indications plus simplement.",
      );
    }

    if (repeatChoice && hasRepeat) {
      const isMixedLanguage = /[a-zàâçéèêëîïôûùüÿœ]/i.test(transcript);
      const hasReversedOrder = includesAny(korean, [
        "말해주세요다시",
        "말씀해주세요다시",
        "말해주실수있어요다시",
      ]);
      const isDirect =
        includesAny(korean, ["다시말해", "한번더말해"]) &&
        !includesAny(korean, ["주세요", "주실", "줄래", "줘"]);

      if (isMixedLanguage) {
        return matched(
          "mixed-language",
          repeatChoice,
          "Oui, je vois : tu veux qu’on répète. Ici, « 다시요 » suffit très bien.",
          true,
        );
      }

      if (hasReversedOrder) {
        return matched(
          "repeat-word-order",
          repeatChoice,
          "Oui, je vois ce que tu veux dire. En coréen, « 다시 » se place naturellement avant la demande : « 다시 말해 주세요 ».",
          true,
        );
      }

      if (isDirect) {
        return matched(
          "repeat-informal",
          repeatChoice,
          "Je vois ce que tu veux dire. Avec un inconnu, dis « 다시 말해 주세요 » plutôt que le très direct « 다시 말해 ».",
          true,
        );
      }

      const isShortRepeat = ["다시", "다시요", "한번더", "한번더요"].includes(
        korean,
      );
      return matched(
        "repeat",
        repeatChoice,
        isShortRepeat
          ? "Oui, « 다시요 » suffit très bien ici. Si tu veux être plus poli : « 다시 한번 말씀해 주세요 » ."
          : "Oui, ta demande est claire : tu veux simplement entendre les indications une nouvelle fois.",
      );
    }

    if (
      repeatChoice &&
      hasApproximateRepeat &&
      includesAny(korean, ["요", "주세요", "한번", "말슴", "천천이"])
    ) {
      return matched(
        "repeat-informal",
        repeatChoice,
        "Je vois ce que tu veux dire : tu demandes de répéter. La transcription semble avoir déformé un mot ; vise « 다시 한번 말씀해 주세요 ».",
        true,
      );
    }

    const hasFormalThanks = includesAny(korean, [
      "감사합니다",
      "고맙습니다",
      "감사해요",
    ]);
    const hasUnderstanding = includesAny(korean, [
      "알겠습니다",
      "알겠어요",
      "이해했어요",
      "이제알겠",
      "잘알겠습니다",
    ]);
    const hasInformalClosing =
      includesAny(korean, ["고마워", "알았어", "감사해"]) &&
      !includesAny(korean, ["고마워요", "감사해요"]);

    if (thanksChoice && (hasFormalThanks || hasUnderstanding)) {
      const isMixedLanguage = /[a-zàâçéèêëîïôûùüÿœ]/i.test(transcript);
      return matched(
        hasFormalThanks ? "thanks" : "understood",
        thanksChoice,
        hasFormalThanks
          ? "Oui, « 감사합니다 » fonctionne très bien ici pour remercier et terminer l’échange."
          : "Oui, c’est clair : tu montres que tu as compris les indications.",
        isMixedLanguage,
      );
    }

    if (thanksChoice && hasInformalClosing) {
      return matched(
        "thanks-informal",
        thanksChoice,
        "Je vois ce que tu veux dire. « 고마워 » ou « 알았어 » sont familiers ; avec un inconnu, préfère « 감사합니다 » ou « 알겠습니다 ».",
        true,
      );
    }

    if (thanksChoice && includesAny(korean, CLOSING_CONFUSIONS)) {
      return matched(
        "thanks-informal",
        thanksChoice,
        "Je vois que tu termines l’échange. La transcription semble avoir accroché sur la terminaison ; vise « 감사합니다 » ou « 알겠습니다 ».",
        true,
      );
    }

    if (
      thanksChoice &&
      includesAny(korean, ["알겠", "감사합", "이해했"]) &&
      !hasFormalThanks &&
      !hasUnderstanding
    ) {
      return {
        reason: "uncertain",
        category: "incomplete",
        choice: thanksChoice,
        feedback: withAvailableChoices(
          "On dirait que la fin de la formule a été coupée. Redis « 알겠습니다 » ou « 감사합니다 » en entier.",
          choices,
        ),
        understoodWithCorrection: false,
      };
    }

    if (isOnlyAcknowledgement) {
      return help(
        "ambiguous-acknowledgement",
        "« 네 » tout seul peut simplement vouloir dire « oui ». Si tu veux montrer que tu as compris, dis « 알겠습니다 » ; si tu veux réentendre les indications, « 다시요 » suffit.",
        attemptNumber,
        "follow-up",
      );
    }

    const exactChoice = choices.find(
      (choice) => compactKorean(choice.korean) === korean,
    );
    if (exactChoice) {
      return matched("natural", exactChoice, "Oui, cette réponse fonctionne très bien ici.");
    }

    const incompleteContextualFeedback = getMetroIncompleteContextualFeedback(
      korean,
      choices,
    );
    if (incompleteContextualFeedback) {
      return help(
        "incomplete",
        incompleteContextualFeedback,
        attemptNumber,
        "follow-up",
      );
    }

    return help(
      "out-of-scope",
      "Je comprends la phrase, mais elle ne correspond pas à ce que tu peux faire à ce moment de l’échange. Appuie-toi sur l’une des réponses proposées.",
      attemptNumber,
      "follow-up",
    );
  }

  const hasKoreanGangnam = includesAny(korean, ["강남", "강남역"]);
  const hasLatinGangnam = latin.includes("gangnam");
  const hasGangnam = hasKoreanGangnam || hasLatinGangnam;
  const hasApproximateGangnam = includesAny(korean, DESTINATION_CONFUSIONS);
  // The mission evaluates the meaning of the utterance, not the presence of a
  // particular textbook expression. These patterns cover common ways of asking
  // how to go somewhere or which route/direction to take.
  const asksHowToGo = includesAny(korean, [
    "어떻게가",
    "어떻게와",
    "어떻게타",
    "어디로가",
    "어디로타",
    "어디서타",
    "어떻게찾아가",
  ]);
  const asksWhatToDoToGo =
    includesAny(korean, ["가려면", "갈려면"]) &&
    includesAny(korean, ["어떻게해", "어떻게해야", "뭘해야", "무엇을해야"]);
  const asksForSideOrDirection =
    includesAny(korean, ["어느쪽", "쪽이어디", "쪽은어디"]) ||
    (includesAny(korean, ["방향", "가는쪽", "갈쪽"]) &&
      includesAny(korean, ["어디", "어느", "어떻게"]));
  const asksWhichRoute =
    includesAny(korean, ["가는길", "갈길", "길로"]) &&
    includesAny(korean, ["어디", "어느", "어떻게"]);
  const asksRequiredRoute = includesAny(korean, [
    "어디로가야",
    "어느쪽으로가야",
    "뭘타야",
    "무엇을타야",
  ]);
  const asksShortRoute = includesAny(korean, ["강남어떻게", "강남어디로"]);
  const asksForSubway =
    (includesAny(korean, ["2호선", "이호선"]) &&
      includesAny(korean, ["어디서타", "어디에타", "어디예요", "어디야"])) ||
    (includesAny(korean, ["강남가는지하철", "강남행지하철"]) &&
      includesAny(korean, ["어디", "뭐", "무엇"]));
  const hasTravelIntent =
    asksHowToGo ||
    asksWhatToDoToGo ||
    asksForSideOrDirection ||
    asksWhichRoute ||
    asksRequiredRoute ||
    asksShortRoute ||
    asksForSubway;
  const hasExit = includesAny(korean, ["출구", "몇번출구", "나가야"]);
  const hasDuration = includesAny(korean, [
    "얼마나걸",
    "몇분",
    "시간",
    "오래걸",
  ]);
  const hasTransfer = includesAny(korean, ["환승", "갈아타", "바꿔타"]);
  const hasNegativeDirection =
    hasGangnam &&
    includesAny(korean, [
      "강남안가",
      "강남에안가",
      "강남가지않",
      "강남못가",
      "강남가면안",
      "강남방향아니",
      "강남말고",
    ]);
  const wrongDestination = WRONG_DESTINATIONS.find((station) =>
    korean.includes(compactKorean(station)),
  );
  const hasContradictoryDirection = WRONG_DESTINATIONS.some((station) =>
    includesAny(korean, [
      `${station}방향`,
      `${station}가는쪽`,
      `${station}쪽으로`,
    ]),
  );
  const selfCorrectionStation = WRONG_DESTINATIONS.find((station) => {
    const normalizedStation = compactKorean(station);
    const stationIndex = korean.indexOf(normalizedStation);
    const gangnamIndex = korean.indexOf(
      "강남",
      stationIndex + normalizedStation.length,
    );
    if (stationIndex < 0 || gangnamIndex < 0) return false;

    const correctionSegment = korean.slice(
      stationIndex + normalizedStation.length,
      gangnamIndex,
    );
    return /(?:아니라|아니(?!면)|말고)/u.test(correctionSegment);
  });
  const hasSelfCorrection = !!selfCorrectionStation;
  const isFrench = /[a-zàâçéèêëîïôûùüÿœ]/i.test(transcript);
  const frenchUnderstood =
    latin.includes("gangnam") &&
    ["direction", "cote", "quai", "train", "metro"].some((token) =>
      latin.includes(token),
    );

  if (hasNegativeDirection) {
    return help(
      "negation-conflict",
      `Ta phrase écarte Gangnam, alors qu’ici tu cherches justement comment y aller. ${getMetroCurrentExpectation(choices)}`,
      attemptNumber,
    );
  }

  if (hasExit) {
    return help(
      "exit-confusion",
      "Tu es déjà passé à la sortie, alors qu’on n’est pas encore arrivé à Gangnam. Pour l’instant, demande simplement la direction avec « 방향 » ou « 가는 쪽 ».",
      attemptNumber,
    );
  }

  if (hasDuration) {
    return help(
      "duration-confusion",
      "Là, tu demandes combien de temps dure le trajet. Pour l’instant, demande d’abord de quel côté prendre le train vers Gangnam.",
      attemptNumber,
    );
  }

  if (hasTransfer) {
    return help(
      "transfer-confusion",
      "Là, tu demandes s’il faut changer de ligne. Pour l’instant, demande d’abord la direction vers Gangnam.",
      attemptNumber,
    );
  }

  if (wrongDestination && !hasGangnam) {
    return help(
      "wrong-destination",
      `Tu as donné une autre destination : ${wrongDestination}. Ici, tu cherches Gangnam ; réessaie avec « 강남 ».`,
      attemptNumber,
    );
  }

  if (
    hasGangnam &&
    (hasContradictoryDirection || !!wrongDestination) &&
    !hasSelfCorrection
  ) {
    return help(
      "wrong-destination",
      "J’entends Gangnam, mais aussi une autre direction dans la même réponse. Garde simplement le trajet vers Gangnam.",
      attemptNumber,
    );
  }

  if (isFrench && !hasTravelIntent) {
    const feedback = frenchUnderstood
      ? "Tu demandes comment aller à Gangnam. Très bien : essaie maintenant de le dire en coréen, par exemple « 강남에 어떻게 가요? »."
      : "Essaie de le dire en coréen : tu es à Hongik University et tu cherches comment aller à Gangnam.";
    return help("french", feedback, attemptNumber);
  }

  if ((hasGangnam || asksForSubway) && hasTravelIntent) {
    if (hasSelfCorrection) {
      return matched(
        "natural",
        directionChoice,
        "Oui, ta correction est claire : tu demandes bien la direction de Gangnam.",
      );
    }

    if (hasLatinGangnam) {
      return matched(
        "mixed-language",
        directionChoice,
        "Je t’ai compris. Essaie juste de dire aussi la destination en coréen : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (includesAny(korean, ["강남을어떻게가", "강남를어떻게가"])) {
      return matched(
        "particle-imperfection",
        directionChoice,
        "Je vois ce que tu veux dire. Avec une destination, « 에 » convient ici : « 강남에 어떻게 가요? ». Avec « 까지 », tu insistes sur l’idée de « jusqu’à Gangnam ».",
        true,
      );
    }

    if (includesAny(korean, ["어떻게강남", "가요어떻게강남", "어디예요강남가는"])) {
      return matched(
        "word-order",
        directionChoice,
        "Je vois ce que tu veux dire, mais l’ordre sonne plus naturel avec la destination d’abord : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (includesAny(korean, ["어떻게와", "어디로와"])) {
      return matched(
        "go-come-confusion",
        directionChoice,
        "Je vois ce que tu veux dire. Ici, tu demandes comment aller à Gangnam : utilise « 가요 » (« aller ») plutôt que « 와요 » (« venir ») : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (
      hasGangnam &&
      includesAny(korean, ["어떻게타", "강남어디서타"]) &&
      !asksForSubway
    ) {
      return matched(
        "minor-imperfection",
        directionChoice,
        "Je vois ce que tu veux dire : tu cherches le métro pour Gangnam. « 타다 » s’emploie avec ce que tu prends, comme le métro ou la ligne ; avec Gangnam comme destination, dis plutôt « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (asksHowToGo && korean.endsWith("가")) {
      return matched(
        "minor-imperfection",
        directionChoice,
        "Je vois ce que tu veux dire. Avec un inconnu, garde la terminaison polie en « 요 » : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    const hasOmittedParticle = includesAny(korean, [
      "강남어떻게가",
      "강남어떻게",
      "강남어디로",
    ]);
    if (hasOmittedParticle) {
      return matched(
        "particle-imperfection",
        directionChoice,
        "Je vois ce que tu veux dire. Avec « 강남 », ajoute « 에 » pour marquer la destination, ou « 까지 » pour dire « jusqu’à Gangnam » : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    const isGeneralBeginnerPhrase = includesAny(korean, [
      "강남에어떻게가",
      "강남까지어떻게가",
      "강남은어떻게가",
      "강남가려면어떻게해",
    ]);
    const isNatural = includesAny(korean, [
      "강남에어떻게가요",
      "강남까지어떻게가요",
      "강남은어떻게가요",
      "강남가려면어떻게해요",
      "강남방향은어느쪽이에요",
      "강남가는쪽이어디예요",
      "강남은어느쪽이에요",
      "강남쪽은어디예요",
      "강남가려면어디로가야해요",
      "강남가는방향이어디예요",
      "강남역가는쪽이어디예요",
      "강남가려면어디로가요",
      "강남역가는길이어디예요",
      "2호선어디서타요",
      "강남가는지하철어디예요",
    ]);

    return matched(
      isNatural ? "natural" : "minor-imperfection",
      directionChoice,
      isGeneralBeginnerPhrase
        ? `Ta phrase est naturelle. Dans une station, tu peux aussi dire : « ${GANGNAM_MODEL} ».`
        : isNatural
          ? "Oui, ta question sonne naturelle et claire pour demander le trajet vers Gangnam."
          : `Je vois ce que tu veux dire. Pour sonner plus naturel, tu peux dire : « ${GANGNAM_MODEL} ».`,
      !isNatural,
    );
  }

  if (
    hasGangnam &&
    includesAny(korean, ["가려면", "갈려면"]) &&
    !hasTravelIntent
  ) {
    return {
      reason: "uncertain",
      category: "incomplete",
      choice: directionChoice,
      feedback: withAvailableChoices(
        "Ta phrase s’arrête après « 강남 가려면… » (« pour aller à Gangnam… »). Il manque encore la question : complète-la tranquillement ou réessaie.",
        choices,
      ),
      understoodWithCorrection: false,
    };
  }

  if (hasGangnam && !hasTravelIntent) {
    return help(
      "destination-only",
      `Là, tu as donné Gangnam, mais pas encore la demande de trajet. Pour poser la question de direction, tu peux dire : « ${GANGNAM_MODEL} ».`,
      attemptNumber,
    );
  }

  if (hasApproximateGangnam && hasTravelIntent) {
    return matched(
      "minor-imperfection",
      directionChoice,
      "Je t’ai compris : la destination est Gangnam. La transcription semble avoir déformé le nom ; prononce simplement « 강남 ».",
      true,
    );
  }

  if (hasApproximateGangnam || (hasTravelIntent && korean.includes("강"))) {
    return {
      reason: "uncertain",
      category: "uncertain",
      choice: directionChoice,
      feedback: withAvailableChoices(
        "La transcription ressemble à « 강남 방향 », mais je ne suis pas assez sûr. Confirme ou réessaie.",
        choices,
      ),
      understoodWithCorrection: false,
    };
  }

  if (!hasGangnam && hasTravelIntent) {
    return help(
      "direction-only",
      "Ta question porte bien sur un trajet, mais il manque la destination. Ajoute simplement « 강남 ».",
      attemptNumber,
    );
  }

  const incompleteContextualFeedback = getMetroIncompleteContextualFeedback(
    korean,
    choices,
  );
  if (incompleteContextualFeedback) {
    return help(
      "incomplete",
      incompleteContextualFeedback,
      attemptNumber,
    );
  }

  return help(
    "out-of-scope",
    "Je ne retrouve pas encore une demande de trajet vers Gangnam. Essaie simplement de demander de quel côté prendre le train.",
    attemptNumber,
  );
}
