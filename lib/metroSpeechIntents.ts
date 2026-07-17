export const METRO_SPEECH_PILOT_MISSION_ID = "ask-direction";

export type MetroSpeechCategory =
  | "natural"
  | "minor-imperfection"
  | "destination-only"
  | "direction-only"
  | "exit-confusion"
  | "duration-confusion"
  | "transfer-confusion"
  | "wrong-destination"
  | "french"
  | "uncertain"
  | "out-of-scope"
  | "empty"
  | "repeat"
  | "thanks";

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
};

const DIRECTION_CHOICE_ID = "choose_hongik_direction";
const GANGNAM_MODEL = "강남 방향은 어느 쪽이에요?";

const DESTINATION_CONFUSIONS = ["강람", "간남", "강남역은", "강남녁"];
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

function findChoice(
  choices: readonly MetroSpeechChoice[],
  predicate: (choice: MetroSpeechChoice) => boolean,
) {
  return choices.find(predicate) ?? null;
}

function withProgressiveHelp(feedback: string, attemptNumber: number) {
  if (attemptNumber >= 3) {
    return `${feedback} Phrase modèle : « ${GANGNAM_MODEL} » (Gangnam banghyang-eun eoneu jjog-ieyo?)`;
  }

  if (attemptNumber === 2) {
    return `${feedback} Mots utiles : 강남 · 방향 · 어느 쪽.`;
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
): MetroSpeechMatch {
  return {
    reason: "needs-help",
    category,
    choice: null,
    feedback: withProgressiveHelp(feedback, attemptNumber),
    understoodWithCorrection: false,
  };
}

export function getMetroSpeechContextualStrings(
  choices: readonly MetroSpeechChoice[],
) {
  const available = choices.map((choice) => choice.korean);

  if (choices.some((choice) => choice.id === DIRECTION_CHOICE_ID)) {
    return [
      ...available,
      "강남",
      "강남역",
      "홍대입구",
      "강남 가는 쪽이 어디예요?",
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

  return available;
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

  if (!korean) {
    return {
      reason: "empty",
      category: "empty",
      choice: null,
      feedback:
        "Je n’ai entendu aucune réponse. Tu peux réessayer ou afficher les réponses.",
      understoodWithCorrection: false,
    };
  }

  const directionChoice = findChoice(
    choices,
    (choice) => choice.id === DIRECTION_CHOICE_ID,
  );
  const repeatChoice = findChoice(choices, (choice) =>
    /repeat|다시|한번/.test(`${choice.id}${choice.korean}`),
  );
  const thanksChoice = findChoice(choices, (choice) =>
    /thank|감사|고마/.test(`${choice.id}${choice.korean}`),
  );

  if (!directionChoice) {
    const hasRepeat = includesAny(korean, ["다시", "한번더", "말씀해 주세요", "반복"]);
    const hasThanks = includesAny(korean, ["감사", "고마워", "고맙습니다", "이해했어요"]);

    if (repeatChoice && hasRepeat) {
      return matched(
        "repeat",
        repeatChoice,
        "Très bien, tu as demandé de répéter.",
      );
    }

    if (thanksChoice && hasThanks) {
      return matched("thanks", thanksChoice, "Très bien, remerciement compris.");
    }

    const exactChoice = choices.find(
      (choice) => compactKorean(choice.korean) === korean,
    );
    if (exactChoice) {
      return matched("natural", exactChoice, "Réponse comprise.");
    }

    return needsHelp(
      "out-of-scope",
      "Ici, réponds à l’intervention en cours. Tu peux demander de répéter, remercier ou afficher les réponses.",
      attemptNumber,
    );
  }

  const hasGangnam = includesAny(korean, ["강남", "강남역"]);
  const hasApproximateGangnam = includesAny(korean, DESTINATION_CONFUSIONS);
  const hasDirectionWord = includesAny(korean, [
    "방향",
    "어느쪽",
    "가는쪽",
    "갈쪽",
    "쪽은어디",
    "어디로가",
    "가려면",
    "타야",
    "가야",
  ]);
  const hasPreciseDirection = includesAny(korean, [
    "방향",
    "어느쪽",
    "가는쪽",
    "쪽은어디",
    "어디로가",
    "가려면",
    "타야",
    "가야",
  ]);
  const hasExit = includesAny(korean, ["출구", "몇번출구", "나가야"]);
  const hasDuration = includesAny(korean, [
    "얼마나걸",
    "몇분",
    "시간",
    "오래걸",
  ]);
  const hasTransfer = includesAny(korean, ["환승", "갈아타", "바꿔타"]);
  const wrongDestination = WRONG_DESTINATIONS.find((station) =>
    korean.includes(compactKorean(station)),
  );
  const isFrench = /[a-zàâçéèêëîïôûùüÿœ]/i.test(transcript);
  const frenchUnderstood =
    latin.includes("gangnam") &&
    ["direction", "cote", "quai", "train", "metro"].some((token) =>
      latin.includes(token),
    );

  if (hasExit) {
    return needsHelp(
      "exit-confusion",
      "Tu demandes la sortie. Ici, tu n’es pas encore arrivé : demande quelle direction prendre pour Gangnam avec « 방향 » ou « 가는 쪽 ».",
      attemptNumber,
    );
  }

  if (hasDuration) {
    return needsHelp(
      "duration-confusion",
      "Tu demandes combien de temps dure le trajet. À cette étape, cherche plutôt de quel côté prendre le train vers Gangnam.",
      attemptNumber,
    );
  }

  if (hasTransfer) {
    return needsHelp(
      "transfer-confusion",
      "Tu demandes où changer de ligne. Ici, le but est seulement de confirmer la direction vers Gangnam.",
      attemptNumber,
    );
  }

  if (wrongDestination && !hasGangnam) {
    return needsHelp(
      "wrong-destination",
      `J’ai reconnu une autre destination (${wrongDestination}). Dans cette scène, tu cherches la direction de Gangnam. Réessaie en incluant « 강남 ».`,
      attemptNumber,
    );
  }

  if (isFrench) {
    const feedback = frenchUnderstood
      ? "Tu as bien compris qu’il faut demander la direction de Gangnam. Essaie maintenant en coréen avec « 강남 » et « 어느 쪽 »."
      : "Réponds en coréen : tu es à Hongik University et tu cherches le quai vers Gangnam. Utilise au moins « 강남 » et « 어느 쪽 ».";
    return needsHelp("french", feedback, attemptNumber);
  }

  if (hasGangnam && hasPreciseDirection) {
    const isNatural = includesAny(korean, [
      "강남방향은어느쪽이에요",
      "강남가는쪽이어디예요",
      "강남은어느쪽이에요",
      "강남쪽은어디예요",
      "강남가려면어디로가야해요",
      "강남가는방향이어디예요",
      "강남역가는쪽이어디예요",
    ]);

    return matched(
      isNatural ? "natural" : "minor-imperfection",
      directionChoice,
      isNatural
        ? "Très bien. Tu as clairement demandé de quel côté prendre le métro pour Gangnam."
        : `Ta phrase est compréhensible. Pour être plus naturel, tu peux dire : « ${GANGNAM_MODEL} ».`,
      !isNatural,
    );
  }

  if (hasGangnam && !hasDirectionWord) {
    return needsHelp(
      "destination-only",
      `J’ai bien reconnu Gangnam, mais il manque l’idée de direction. Demande de quel côté prendre le train : « ${GANGNAM_MODEL} ».`,
      attemptNumber,
    );
  }

  if (hasApproximateGangnam || (hasDirectionWord && korean.includes("강"))) {
    return {
      reason: "uncertain",
      category: "uncertain",
      choice: directionChoice,
      feedback:
        "J’ai peut-être entendu « 강남 방향 ». Est-ce bien la direction vers Gangnam que tu voulais demander ?",
      understoodWithCorrection: false,
    };
  }

  if (!hasGangnam && hasPreciseDirection) {
    return needsHelp(
      "direction-only",
      "Tu demandes bien de quel côté aller, mais il manque la destination. Ajoute « 강남 » pour préciser où tu veux aller.",
      attemptNumber,
    );
  }

  return needsHelp(
    "out-of-scope",
    "Ici, tu es dans la station de Hongik University et tu cherches le quai vers Gangnam. Demande de quel côté se trouve cette direction.",
    attemptNumber,
  );
}
