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
  | "transcription-recovery"
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
  requiresCorrection?: boolean;
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
const CLOSING_TRANSCRIPTION_CONFUSIONS = [
  "감사함니다",
  "알게써요",
  "이해해써요",
];
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

function hasLatinWord(value: string) {
  const withoutTechnicalLabels = value.replace(/\bB2\b/gi, "");
  return /[a-zàâçéèêëîïôûùüÿœ]{2,}/i.test(withoutTechnicalLabels);
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
    "있나요",
    "맞아요",
    "예요",
    "이에요",
    "돼요",
    "될까요",
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
    /(?:아니라|아니고(?:요)?|아니요?|말고(?:요)?)(?=[1-9]호선)/gu,
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
      includesAny(value, [
        "강남행",
        "강남가는플랫폼",
        "강남쪽승강장",
        "강남가는열차",
        "강남쪽타는곳",
      ]) && hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "direction",
    examples: [
      "강남 가는 길 좀 알려 주세요.",
      "강남 가는 길 알려 주실 수 있어요?",
      "강남 어떻게 가는지 알려 주세요.",
    ],
    confidence: "matched",
    understood: "tu demandes qu’on t’indique le chemin pour aller à Gangnam",
    guidance:
      "C’est une demande tout à fait naturelle ; tu n’es pas obligé de la reformuler en question avec « 어느 쪽 ».",
    matches: (value) => includesAny(value, [
      "강남가는길알려",
      "강남가는길좀알려",
      "강남어떻게가는지알려",
    ]),
  },
  {
    targetIntent: "direction",
    examples: [
      "강남 안 가요?",
      "이 열차 강남 안 가요?",
      "강남 가는 거 아니에요?",
    ],
    confidence: "matched",
    understood: "tu vérifies si ce train ou cette direction va bien vers Gangnam",
    guidance:
      "La négation sert ici à demander confirmation ; ce n’est pas un refus d’aller à Gangnam.",
    allowNegation: true,
    matches: (value, transcript) =>
      includesAny(value, [
        "강남안가요",
        "강남에안가요",
        "강남가는거아니에요",
        "강남가는열차아니에요",
      ]) && hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "direction",
    examples: ["강남에 가고 싶어요.", "강남역을 찾고 있어요."],
    confidence: "uncertain",
    understood: "tu veux aller à Gangnam ou que tu cherches le trajet vers Gangnam",
    guidance:
      "Je vois ce que tu veux dire, mais il manque encore la demande de direction. Tu peux demander simplement : « 강남에 어떻게 가요? »",
    matches: (value) =>
      includesAny(value, [
        "강남에가고싶",
        "강남가고싶",
        "강남역을찾",
        "강남가는길을찾",
        "강남가야해",
      ]) && !includesAny(value, ["어떻게", "어디", "어느쪽", "알려"]),
  },
  {
    targetIntent: "duration",
    examples: ["강남까지 몇 분이에요?", "강남까지 오래 걸려요?"],
    confidence: "matched",
    understood: "tu demandes combien de temps il faut pour arriver à Gangnam",
    guidance:
      "Ta question fonctionne très bien. Une autre tournure passe-partout serait : « 강남까지 얼마나 걸려요? »",
    matches: (value, transcript) =>
      includesAny(value, [
        "몇분이에요",
        "몇분쯤",
        "오래걸려",
        "금방가요",
        "빨리가요",
      ]) && hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "duration",
    examples: ["강남까지 오래 안 걸려요?", "많이 안 걸려요?"],
    confidence: "matched",
    understood: "tu demandes si le trajet ne prend pas trop longtemps",
    guidance:
      "C’est une question naturelle. Si tu préfères une formulation neutre : « 강남까지 얼마나 걸려요? »",
    allowNegation: true,
    matches: (value, transcript) =>
      includesAny(value, [
        "오래안걸려",
        "시간이많이안걸려",
        "많이안걸려",
      ]) && hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "transfer",
    examples: [
      "다른 노선으로 바꿔야 해요?",
      "다른 라인으로 바꿔야 해요?",
    ],
    confidence: "matched",
    understood: "tu demandes s’il faut passer sur une autre ligne",
    guidance:
      "La phrase est compréhensible et grammaticale. Dans le métro, « 갈아타다 » est simplement le verbe le plus idiomatique : « 갈아타야 하나요? »",
    requiresCorrection: true,
    matches: (value, transcript) =>
      includesAny(value, ["다른노선으로바꿔", "다른라인으로바꿔"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "transfer",
    examples: ["중간에 내려야 해요?", "한 번 내려야 해요?"],
    confidence: "uncertain",
    understood: "tu demandes s’il faut descendre en route",
    guidance:
      "Ça peut vouloir dire qu’il faut faire une correspondance, mais pas forcément. Si c’est bien ton idée, demande « 갈아타야 하나요? »",
    matches: (value, transcript) =>
      includesAny(value, ["중간에내려", "한번내려"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "transfer",
    examples: ["갈아타지 않아도 돼요?", "환승 안 해도 돼요?"],
    confidence: "matched",
    understood: "tu demandes si tu peux rester sur la même ligne sans correspondance",
    guidance:
      "Oui, ça se dit très bien. Tu peux aussi demander directement : « 갈아타야 하나요? »",
    allowNegation: true,
    matches: (value, transcript) =>
      includesAny(value, [
        "갈아타지않아도돼",
        "환승안해도돼",
        "바꿔타지않아도돼",
      ]) && hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "transfer",
    examples: ["환승 안 해요?", "안 갈아타요?"],
    confidence: "matched",
    understood: "tu demandes confirmation qu’il n’y a pas de correspondance",
    guidance:
      "Ici, la négation forme bien une question de confirmation ; elle ne signifie pas que tu refuses de changer de ligne.",
    allowNegation: true,
    matches: (value, transcript) =>
      includesAny(value, ["환승안해요", "안갈아타요"]) &&
      hasMetroQuestionShape(value, transcript),
  },
  {
    targetIntent: "repeat",
    examples: ["방금 뭐라고 하셨어요?", "조금 더 천천히 부탁드려요."],
    confidence: "matched",
    understood: "tu n’as pas bien entendu et demandes que l’explication soit répétée",
    guidance:
      "C’est naturel. Plus simplement, tu peux aussi dire : « 다시 한번 말씀해 주세요. »",
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
    return matched(
      "contextual-interpretation",
      choice,
      feedback,
      rule.requiresCorrection ?? false,
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
    includesAny(value, ["강남까지", "몇분", "소요시간"]) &&
    !includesAny(value, ["걸", "분이에요", "얼마나", "오래", "필요"])
  ) {
    return `Tu es bien sur la durée du trajet, mais ta question s’arrête un peu trop tôt. ${expectation}`;
  }
  if (
    intents.has("transfer") &&
    includesAny(value, ["다른노선", "다른라인", "중간에", "환승역"]) &&
    !includesAny(value, ["바꿔", "타야", "내려", "어디", "있어요", "필요"])
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
  const intent = getMetroSpeechChoiceIntent(choice);
  return {
    reason: "matched",
    category,
    choice,
    feedback,
    understoodWithCorrection,
    ...(intent !== "unknown" ? { interpretedIntent: intent } : {}),
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
      "어떻게 강남에 가요?",
      "강남 가려면 어디로 가요?",
      "강남 가려면 어디로 가면 돼요?",
      "강남 가는 쪽이 어디예요?",
      "강남 가는 쪽 어디예요?",
      "강남역 가는 길이 어디예요?",
      "2호선 어디서 타요?",
      "2호선 어디서 타면 돼요?",
      "강남 가는 지하철 어디예요?",
      "강남 가는 지하철이 어디예요?",
      "강남은 어느 쪽이에요?",
      "강남 쪽은 어디예요?",
      "강남 방향 어디예요?",
      "강남 가려면 어디로 가야 해요?",
      "강남 가려면 어디로 가야 돼요?",
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
      "고마워요",
      "감사해요",
      "알겠습니다",
      "알겠어요",
      "알았어요",
      "이해했어요",
      "이해됐어요",
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
            "몇 분 정도 걸려요?",
            "시간이 얼마나 걸려요?",
            "시간 얼마나 걸려요?",
          ]
        : []),
      ...(hasTransferChoice
        ? [
            "환승해야 해요?",
            "환승해야 하나요?",
            "갈아타야 해요?",
            "갈아타야 하나요?",
            "갈아타야 돼요?",
            "환승 있어요?",
            "환승이 있어요?",
            "환승 있나요?",
            "어디서 갈아타요?",
            "어디에서 갈아타요?",
            "어디서 환승해요?",
            "어디에서 환승해요?",
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
    const hasApproximateDuration = includesAny(korean, [
      "몇뿐걸",
      "얼마나껄",
      "시깐이얼마나",
    ]);
    const hasExactDurationQuestion = includesAny(korean, [
      "얼마나걸",
      "얼마쯤걸",
      "몇분",
      "오래걸",
      "시간이얼마나",
      "시간은얼마나",
      "시간얼마나",
      "소요시간",
    ]);
    const hasDurationQuestion =
      hasApproximateDuration ||
      (hasExactDurationQuestion &&
        (hasMetroQuestionShape(korean, transcript) ||
          includesAny(korean, [
            "걸려요",
            "걸리나요",
            "걸릴까요",
            "분이에요",
            "시간이얼마나",
            "시간은얼마나",
            "시간얼마나",
            "소요시간",
          ]) ||
          ["몇분", "몇분이요"].includes(korean)));
    const hasExitQuestion = includesAny(korean, ["출구", "몇번출구", "나가야"]);
    const hasTransferTopic = includesAny(korean, ["환승", "갈아타", "바꿔타"]);
    const hasApproximateTransfer =
      includesAny(korean, TRANSFER_CONFUSIONS) &&
      includesAny(korean, [
        "타야하나요",
        "타야해요",
        "타야돼요",
        "타요",
      ]);
    const hasTransferQuestion =
      hasApproximateTransfer ||
      (hasTransferTopic &&
        (hasMetroQuestionShape(korean, transcript) ||
          includesAny(korean, [
            "해야",
            "하나요",
            "해요",
            "돼요",
            "있어요",
            "있나요",
            "어디",
            "필요",
            "타요",
            "타나요",
          ]) ||
          ["환승", "환승이요"].includes(korean)));
    const hasNotUnderstood = includesAny(korean, [
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
    const isOnlyAcknowledgement = ["네", "예", "아네", "아예"].includes(korean);
    const isOnlyNegativeAcknowledgement = ["아니", "아니요"].includes(korean);
    const hasNegativeDuration =
      includesAny(korean, [
        "시간안",
        "시간은안",
        "몇분안",
        "오래안",
        "궁금하지않",
        "묻지않",
        "물어보지않",
      ]) && includesAny(korean, ["시간", "몇분", "오래", "걸"]);
    const hasNegativeTransfer =
      hasTransferTopic &&
      includesAny(korean, [
        "환승안",
        "갈아타지않",
        "갈아타면안",
        "바꿔타지않",
        "묻지않",
      ]) &&
      !includesAny(korean, [
        "환승안해도돼",
        "갈아타지않아도돼",
        "바꿔타지않아도돼",
      ]);

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
        `Ta phrase donne plutôt l’impression d’écarter cette question plutôt que de la poser. ${getMetroCurrentExpectation(choices)}`,
        attemptNumber,
        "follow-up",
      );
    }

    if (hasDurationQuestion) {
      if (!durationChoice) {
        return help(
          "duration-confusion",
          "Ta phrase demande bien la durée, mais cette intention n’est pas disponible à ce tour. Poursuis avec l’une des options proposées.",
          attemptNumber,
          "follow-up",
        );
      }

      if (hasApproximateDuration) {
        return matched(
          "transcription-recovery",
          durationChoice,
          "J’ai bien compris que tu demandes la durée. La transcription a probablement accroché sur un mot ; je ne te compte pas cela comme une erreur de formulation. Une forme claire est « 얼마나 걸려요? ».",
          false,
        );
      }

      const isShortDuration = ["몇분", "몇분이요"].includes(korean);
      const isNaturalDuration = includesAny(korean, [
        "얼마나걸려요",
        "강남까지얼마나걸려요",
        "몇분걸려요",
        "몇분정도걸려요",
        "시간이얼마나걸려요",
        "시간은얼마나걸리나요",
        "시간얼마나걸려요",
        "강남까지시간얼마나걸려요",
        "얼마쯤걸려요",
        "소요시간이얼마나돼요",
        "시간이얼마나필요해요",
      ]);

      if (isShortDuration) {
        return matched(
          "duration-imperfection",
          durationChoice,
          "« 몇 분? » se comprend immédiatement dans ce contexte, mais avec un employé de station c’est un peu abrupt. « 몇 분이에요? » ou « 얼마나 걸려요? » garde la question courte tout en restant polie.",
          true,
        );
      }

      return matched(
        isNaturalDuration ? "duration" : "duration-imperfection",
        durationChoice,
        isNaturalDuration
          ? "Oui, c’est clair : tu demandes combien de temps dure le trajet."
          : "Ton intention est claire : tu demandes la durée. La tournure la plus sûre ici est « 얼마나 걸려요? », mais plusieurs formulations naturelles sont possibles.",
        !isNaturalDuration,
      );
    }

    if (hasTransferQuestion) {
      if (!transferChoice) {
        return help(
          "transfer-confusion",
          "Ta phrase demande bien une correspondance, mais cette intention n’est pas disponible à ce tour. Poursuis avec l’une des options proposées.",
          attemptNumber,
          "follow-up",
        );
      }

      if (hasApproximateTransfer) {
        return matched(
          "transcription-recovery",
          transferChoice,
          "J’ai bien compris que tu demandes s’il faut changer de ligne. La transcription a probablement accroché sur « 갈아타다 » ; je ne te compte pas cela comme une erreur de formulation. La forme de référence est « 갈아타야 하나요? ».",
          false,
        );
      }

      const isShortTransfer = ["환승", "환승이요"].includes(korean);
      const isNaturalTransfer = includesAny(korean, [
        "환승해야해요",
        "환승해야하나요",
        "환승해야돼요",
        "갈아타야해요",
        "갈아타야하나요",
        "갈아타야돼요",
        "바꿔타야해요",
        "환승있어요",
        "환승이있어요",
        "환승있나요",
        "환승이필요해요",
        "환승이필요한가요",
        "어디서환승해요",
        "어디에서환승해요",
        "어디서갈아타요",
        "어디에서갈아타요",
        "갈아타는곳이어디예요",
      ]);

      if (isShortTransfer) {
        return matched(
          "transfer-imperfection",
          transferChoice,
          "« 환승? » suffit pour faire comprendre l’idée, mais c’est très elliptique face à un inconnu. « 환승이 있어요? » ou « 갈아타야 하나요? » est plus adapté.",
          true,
        );
      }

      return matched(
        isNaturalTransfer ? "transfer" : "transfer-imperfection",
        transferChoice,
        isNaturalTransfer
          ? "Oui, c’est clair : tu demandes s’il faut faire une correspondance."
          : "Ton intention de demander une correspondance est claire. « 환승해야 해요? » et « 갈아타야 해요? » sont deux formulations naturelles de référence.",
        !isNaturalTransfer,
      );
    }

    if (hasRelevantContentQuestion) {
      return help(
        "relevant-question",
        "Ta question est bien liée au trajet, mais cette question n’est pas disponible à ce moment-là. Elle est linguistiquement recevable ; c’est seulement l’étape de la scène qui ne la propose pas encore.",
        attemptNumber,
        "follow-up",
      );
    }

    if (isOnlyNegativeAcknowledgement) {
      return help(
        "ambiguous-acknowledgement",
        "« 아니요 » exprime une négation, mais ne dit pas à lui seul si tu n’as pas compris ou si tu refuses simplement quelque chose. Si tu veux qu’on répète, dis « 다시요 » ou « 이해 못 했어요 ».",
        attemptNumber,
        "follow-up",
      );
    }

    if (repeatChoice && hasNotUnderstood) {
      return matched(
        "not-understood",
        repeatChoice,
        "D’accord, tu indiques clairement que tu n’as pas compris ou pas bien entendu. On reprend les indications plus simplement.",
      );
    }

    if (repeatChoice && hasRepeat) {
      const isMixedLanguage = hasLatinWord(transcript);
      const hasReversedOrder = includesAny(korean, [
        "말해주세요다시",
        "말씀해주세요다시",
        "말해주실수있어요다시",
      ]);
      const hasPoliteRequest = includesAny(korean, [
        "주세요",
        "주실수",
        "주실래요",
        "줄래요",
        "부탁드려요",
      ]);
      const hasDirectRequest = includesAny(korean, [
        "다시말해",
        "한번더말해",
        "천천히말해",
        "다시설명해",
        "반복해",
      ]);
      const isDirect = hasDirectRequest && !hasPoliteRequest;

      if (isMixedLanguage) {
        return matched(
          "mixed-language",
          repeatChoice,
          "Ta demande de répétition est comprise. Essaie simplement de la garder entièrement en coréen ; « 다시요 » suffit déjà très bien.",
          true,
        );
      }

      if (hasReversedOrder) {
        return matched(
          "repeat-word-order",
          repeatChoice,
          "La demande est comprise. En coréen, « 다시 » se place plus naturellement avant la demande : « 다시 말해 주세요 ».",
          true,
        );
      }

      const isBareRepeat = ["다시", "한번더", "반복"].includes(korean);
      if (isDirect || isBareRepeat) {
        return matched(
          "repeat-informal",
          repeatChoice,
          isBareRepeat
            ? "La demande est comprise, mais sans « 요 » elle sonne abrupte avec un inconnu. « 다시요 » ou « 한 번 더요 » suffit pour rester naturel et poli."
            : "La demande est comprise, mais la formulation est trop directe avec un inconnu. Préfère « 다시 말해 주세요 » ou « 천천히 말해 주세요 ».",
          true,
        );
      }

      const isShortRepeat = ["다시요", "한번더요"].includes(korean);
      return matched(
        "repeat",
        repeatChoice,
        isShortRepeat
          ? "Oui, cette réponse courte est parfaitement suffisante ici. Si tu veux une forme plus développée : « 다시 한번 말씀해 주세요 » ."
          : "Oui, ta demande de répétition est claire et adaptée à la situation.",
      );
    }

    if (
      repeatChoice &&
      hasApproximateRepeat &&
      includesAny(korean, ["요", "주세요", "한번", "말슴", "천천이"])
    ) {
      return matched(
        "transcription-recovery",
        repeatChoice,
        "J’ai compris que tu demandes de répéter. La transcription a probablement déformé « 다시 », « 말씀 » ou « 천천히 » ; je ne te compte pas cela comme une faute de registre. Une forme claire est « 다시 한번 말씀해 주세요 ».",
        false,
      );
    }

    const hasFormalThanks = includesAny(korean, [
      "감사합니다",
      "고맙습니다",
      "고마워요",
      "감사해요",
    ]);
    const hasUnderstanding = includesAny(korean, [
      "알겠습니다",
      "알겠어요",
      "알았어요",
      "이해했어요",
      "이해됐어요",
      "이해가됐어요",
      "이제이해돼",
      "이제알겠",
      "잘알겠습니다",
    ]);
    const hasInformalClosing =
      includesAny(korean, ["고마워", "알았어", "감사해"]) &&
      !includesAny(korean, ["고마워요", "알았어요", "감사해요"]);

    if (thanksChoice && (hasFormalThanks || hasUnderstanding)) {
      const isMixedLanguage = hasLatinWord(transcript);
      return matched(
        isMixedLanguage
          ? "mixed-language"
          : hasFormalThanks
            ? "thanks"
            : "understood",
        thanksChoice,
        isMixedLanguage
          ? "Ton remerciement ou ton indication de compréhension est clair. Pour cet exercice, garde simplement la réponse entièrement en coréen."
          : hasFormalThanks
            ? "Oui, cette formule convient pour remercier et terminer l’échange."
            : "Oui, tu montres clairement que tu as compris les indications.",
        isMixedLanguage,
      );
    }

    if (thanksChoice && hasInformalClosing) {
      return matched(
        "thanks-informal",
        thanksChoice,
        "Le sens est clair, mais « 고마워 », « 알았어 » ou « 감사해 » sont familiers. Avec un inconnu, préfère une forme en « 요 » ou « 감사합니다 / 알겠습니다 ».",
        true,
      );
    }

    if (thanksChoice && includesAny(korean, CLOSING_TRANSCRIPTION_CONFUSIONS)) {
      return matched(
        "transcription-recovery",
        thanksChoice,
        "J’ai compris que tu termines l’échange. La transcription semble avoir accroché sur la terminaison ; je ne peux pas en déduire que ta formulation était réellement incorrecte. Les formes de référence sont « 감사합니다 » et « 알겠습니다 ».",
        false,
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
          "La fin de la formule semble réellement manquer dans la transcription. Redis « 알겠습니다 » ou « 감사합니다 » en entier pour confirmer.",
          choices,
        ),
        understoodWithCorrection: false,
        interpretedIntent: "thanks",
      };
    }

    if (isOnlyAcknowledgement) {
      return help(
        "ambiguous-acknowledgement",
        "« 네 » est naturel, mais trop ambigu pour savoir avec certitude si tu veux terminer l’échange ou simplement acquiescer. Dis « 알겠습니다 » pour confirmer que tu as compris, ou « 다시요 » pour demander une répétition.",
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
      "Je ne peux pas relier cette phrase à l’une des intentions disponibles à ce moment de l’échange. Ce n’est pas forcément une erreur de coréen ; elle est surtout hors de l’étape actuelle.",
      attemptNumber,
      "follow-up",
    );
  }

  const hasKoreanGangnam = includesAny(korean, ["강남", "강남역"]);
  const hasLatinGangnam = latin.includes("gangnam");
  const hasGangnam = hasKoreanGangnam || hasLatinGangnam;
  const hasApproximateGangnam = includesAny(korean, DESTINATION_CONFUSIONS);
  const asksHowToGo = includesAny(korean, [
    "어떻게가",
    "어떻게와",
    "어떻게타",
    "어디로가",
    "어디로타",
    "어디서타",
    "어떻게찾아가",
    "어떻게강남에가",
    "어떻게강남까지가",
  ]);
  const asksWhatToDoToGo =
    includesAny(korean, ["가려면", "갈려면"]) &&
    includesAny(korean, [
      "어떻게해",
      "어떻게해야",
      "뭘해야",
      "무엇을해야",
      "어디로가면돼",
    ]);
  const asksForSideOrDirection =
    includesAny(korean, ["어느쪽", "쪽이어디", "쪽은어디", "방향어디"]) ||
    (includesAny(korean, ["방향", "가는쪽", "갈쪽"]) &&
      includesAny(korean, ["어디", "어느", "어떻게"]));
  const asksWhichRoute =
    includesAny(korean, ["가는길", "갈길", "길로"]) &&
    includesAny(korean, ["어디", "어느", "어떻게", "알려"]);
  const asksRequiredRoute = includesAny(korean, [
    "어디로가야",
    "어느쪽으로가야",
    "뭘타야",
    "무엇을타야",
    "어디로가면돼",
  ]);
  const asksShortRoute = includesAny(korean, ["강남어떻게", "강남어디로"]);
  const asksAwkwardRouteOrder = includesAny(korean, [
    "가요어떻게강남",
    "어디예요강남가는",
  ]);
  const asksForSubway =
    (includesAny(korean, ["2호선", "이호선"]) &&
      includesAny(korean, [
        "어디서타",
        "어디에타",
        "어디예요",
        "어디야",
        "어디서타면돼",
      ])) ||
    (includesAny(korean, ["강남가는지하철", "강남행지하철"]) &&
      includesAny(korean, ["어디", "뭐", "무엇"]));
  const hasTravelIntent =
    asksHowToGo ||
    asksWhatToDoToGo ||
    asksForSideOrDirection ||
    asksWhichRoute ||
    asksRequiredRoute ||
    asksShortRoute ||
    asksAwkwardRouteOrder ||
    asksForSubway;
  const hasExit = includesAny(korean, ["출구", "몇번출구", "나가야"]);
  const hasDuration = includesAny(korean, [
    "얼마나걸",
    "얼마쯤걸",
    "몇분",
    "시간이얼마나",
    "시간얼마나",
    "오래걸",
  ]);
  const hasTransferTopic = includesAny(korean, ["환승", "갈아타", "바꿔타"]);
  const hasTransfer =
    hasTransferTopic &&
    (hasMetroQuestionShape(korean, transcript) ||
      includesAny(korean, [
        "해야",
        "하나요",
        "돼요",
        "있어요",
        "있나요",
        "어디",
        "필요",
        "타요",
      ]) ||
      ["환승", "환승이요"].includes(korean));
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
  const isFrench = hasLatinWord(transcript);
  const frenchUnderstood =
    latin.includes("gangnam") &&
    ["direction", "cote", "quai", "train", "metro", "platform"].some(
      (token) => latin.includes(token),
    );
  const hasLatinDirectionCue = [
    "direction",
    "cote",
    "quai",
    "train",
    "metro",
    "platform",
  ].some((token) => latin.includes(token));
  const hasKoreanQuestionCue = includesAny(korean, ["어디", "어느", "어떻게"]);
  const hasMixedDirectionIntent =
    isFrench &&
    hasGangnam &&
    hasLatinDirectionCue &&
    hasKoreanQuestionCue;

  if (hasNegativeDirection) {
    return help(
      "negation-conflict",
      `Ta phrase semble écarter Gangnam plutôt que demander une confirmation. Si tu voulais poser une question négative comme « 강남 안 가요? », garde une intonation ou une forme interrogative claire. ${getMetroCurrentExpectation(choices)}`,
      attemptNumber,
    );
  }

  if (hasExit) {
    return help(
      "exit-confusion",
      "Tu demandes déjà quel numéro de sortie prendre, mais l’objectif actuel est d’abord de trouver la direction vers Gangnam. La phrase peut être correcte en coréen ; c’est surtout une question posée trop tôt.",
      attemptNumber,
    );
  }

  if (hasDuration) {
    return help(
      "duration-confusion",
      "Ta question porte sur la durée du trajet. Elle peut être parfaitement correcte, mais elle arrive avant la demande de direction vers Gangnam.",
      attemptNumber,
    );
  }

  if (hasTransfer) {
    return help(
      "transfer-confusion",
      "Ta question porte sur une correspondance. Elle peut être correcte en coréen, mais à cette étape tu dois d’abord demander la direction vers Gangnam.",
      attemptNumber,
    );
  }

  if (wrongDestination && !hasGangnam) {
    return help(
      "wrong-destination",
      `Ta demande semble bien concerner un trajet, mais tu as donné ${wrongDestination} au lieu de Gangnam. Ici, l’erreur porte sur la destination, pas sur la structure de ta question.`,
      attemptNumber,
    );
  }

  if (
    hasGangnam &&
    hasContradictoryDirection &&
    !hasSelfCorrection
  ) {
    return help(
      "wrong-destination",
      "J’entends Gangnam et une autre direction dans la même réponse, sans marque claire d’auto-correction. Je préfère donc ne pas valider le trajet tant que la destination n’est pas univoque.",
      attemptNumber,
    );
  }

  if (hasMixedDirectionIntent) {
    return matched(
      "mixed-language",
      directionChoice,
      `Ton intention est claire : tu demandes la direction de Gangnam. Pour cet exercice, remplace simplement le mot en français/anglais par une formulation coréenne, par exemple « ${GANGNAM_MODEL} ».`,
      true,
    );
  }

  if (isFrench && !hasTravelIntent) {
    const feedback = frenchUnderstood
      ? "Tu demandes comment aller à Gangnam. L’intention est comprise, mais essaie maintenant de produire la demande en coréen, par exemple « 강남에 어떻게 가요? »."
      : "Je reconnais surtout une réponse en français/latin. Essaie de formuler en coréen la demande de trajet vers Gangnam.";
    return help("french", feedback, attemptNumber);
  }

  if ((hasGangnam || asksForSubway) && hasTravelIntent) {
    if (hasSelfCorrection) {
      return matched(
        "natural",
        directionChoice,
        "Oui, ton auto-correction est claire : je retiens bien Gangnam comme destination finale.",
      );
    }

    if (isFrench) {
      return matched(
        "mixed-language",
        directionChoice,
        "Ton intention est comprise, mais la réponse mélange encore du coréen et un mot en alphabet latin. Pour l’exercice, garde la destination et la demande entièrement en coréen.",
        true,
      );
    }

    if (includesAny(korean, ["강남을어떻게가", "강남를어떻게가"])) {
      return matched(
        "particle-imperfection",
        directionChoice,
        "L’intention est claire, mais « 을/를 » n’est pas la particule attendue avec une destination de 가다. Utilise « 강남에 » ou « 강남까지 ».",
        true,
      );
    }

    if (includesAny(korean, ["가요어떻게강남", "어디예요강남가는"])) {
      return matched(
        "word-order",
        directionChoice,
        "La phrase est comprise, mais cet ordre est réellement maladroit. Place la demande avant le verbe final, par exemple « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (includesAny(korean, ["어떻게와", "어디로와"])) {
      return matched(
        "go-come-confusion",
        directionChoice,
        "Ici, depuis Hongik University, tu demandes comment aller à Gangnam : « 가요 » est le choix déictique naturel, plutôt que « 와요 ».",
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
        "Je comprends que tu cherches le métro pour Gangnam. « 타다 » se combine naturellement avec ce que tu prends (지하철, 2호선), pas directement avec Gangnam comme destination. Tu peux dire « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (asksHowToGo && korean.endsWith("가")) {
      return matched(
        "minor-imperfection",
        directionChoice,
        "La phrase est compréhensible, mais la terminaison est trop familière pour parler à un inconnu. Garde « 요 » : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    const isNaturalParticleOmission = includesAny(korean, [
      "강남어떻게가요",
      "강남어디로가요",
      "강남어떻게가면돼요",
    ]);
    if (isNaturalParticleOmission) {
      return matched(
        "natural",
        directionChoice,
        "Oui, cette formulation est naturelle à l’oral. En conversation, la particule après « 강남 » peut être omise quand la destination est évidente ; « 강남에 어떻게 가요? » reste simplement une version plus explicite.",
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
        "Je comprends la destination, mais la phrase reste incomplète ou trop abrégée dans cette forme. « 강남에 » ou « 강남까지 » rend la relation de destination explicite.",
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
      "어떻게강남에가요",
      "어떻게강남까지가요",
      "강남은어떻게가요",
      "강남가려면어떻게해요",
      "강남방향은어느쪽이에요",
      "강남방향어디예요",
      "강남가는쪽이어디예요",
      "강남가는쪽어디예요",
      "강남은어느쪽이에요",
      "강남쪽은어디예요",
      "강남가려면어디로가야해요",
      "강남가려면어디로가야돼요",
      "강남가려면어디로가면돼요",
      "강남가는방향이어디예요",
      "강남가는방향어디예요",
      "강남역가는쪽이어디예요",
      "강남가려면어디로가요",
      "강남역가는길이어디예요",
      "강남역가는길어디예요",
      "2호선어디서타요",
      "2호선어디서타면돼요",
      "강남가는지하철어디예요",
      "강남가는지하철이어디예요",
    ]);

    return matched(
      isNatural ? "natural" : "minor-imperfection",
      directionChoice,
      isGeneralBeginnerPhrase
        ? `Ta phrase est naturelle. Dans une station, « ${GANGNAM_MODEL} » est une autre possibilité, pas une correction obligatoire.`
        : isNatural
          ? "Oui, ta question est naturelle et suffisamment claire pour demander le trajet vers Gangnam."
          : `L’intention est comprise. Une formulation sûre serait « ${GANGNAM_MODEL} », mais ce n’est pas la seule manière naturelle de poser la question.`,
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
        "Ta phrase s’arrête après « 강남 가려면… » (« pour aller à Gangnam… »). L’intention est amorcée, mais il manque encore la demande elle-même.",
        choices,
      ),
      understoodWithCorrection: false,
      interpretedIntent: "direction",
    };
  }

  if (hasGangnam && !hasTravelIntent) {
    return help(
      "destination-only",
      `Tu as bien donné Gangnam, mais pas encore une demande de trajet ou de direction. La destination seule ne suffit pas à déterminer l’intention.`,
      attemptNumber,
    );
  }

  if (hasApproximateGangnam && hasTravelIntent) {
    return matched(
      "transcription-recovery",
      directionChoice,
      "La phrase contient une forme très proche de « 강남 » et le reste de la demande indique clairement un trajet. Je l’interprète donc comme une récupération probable de transcription, pas comme une faute certaine de ta part.",
      false,
    );
  }

  if (hasApproximateGangnam || (hasTravelIntent && korean.includes("강"))) {
    return {
      reason: "uncertain",
      category: "uncertain",
      choice: directionChoice,
      feedback: withAvailableChoices(
        "La transcription ressemble à une demande vers « 강남 », mais l’indice n’est pas assez solide pour valider la destination. Confirme ou réessaie.",
        choices,
      ),
      understoodWithCorrection: false,
      interpretedIntent: "direction",
    };
  }

  if (!hasGangnam && hasTravelIntent) {
    return help(
      "direction-only",
      "La structure de ta question indique bien un trajet, mais aucune destination claire n’a été reconnue. Ajoute « 강남 » pour que la demande soit univoque.",
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
    "Je ne reconnais pas encore une demande de trajet vers Gangnam. Cela ne signifie pas forcément que le coréen est incorrect ; je ne peux simplement pas relier la réponse à l’intention attendue ici.",
    attemptNumber,
  );
}
