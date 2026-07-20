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

function findChoice(
  choices: readonly MetroSpeechChoice[],
  predicate: (choice: MetroSpeechChoice) => boolean,
) {
  return choices.find(predicate) ?? null;
}

export function getMetroSpeechChoiceIntent(choice: MetroSpeechChoice) {
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

function withAvailableChoices(
  feedback: string,
  choices: readonly MetroSpeechChoice[],
) {
  const labels = [...new Set(choices.map(({ label }) => label.trim()))].filter(
    Boolean,
  );

  if (labels.length === 0) return feedback;

  return `${feedback} Options disponibles maintenant : ${labels
    .map((label) => `« ${label} »`)
    .join(" · ")}.`;
}

function withProgressiveHelp(
  feedback: string,
  attemptNumber: number,
  context: "direction" | "follow-up" = "direction",
) {
  if (context === "follow-up") {
    if (attemptNumber >= 3) {
      return `${feedback} Tu peux afficher les réponses pour revoir les formulations proposées.`;
    }

    if (attemptNumber === 2) {
      return `${feedback} Réécoute l’intervention, puis choisis une réponse proposée à ce moment précis.`;
    }

    return feedback;
  }

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

  if (
    choices.some(
      (choice) => getMetroSpeechChoiceIntent(choice) === "direction",
    )
  ) {
    return [
      ...available,
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
        "Je n’ai entendu aucune réponse. Tu peux réessayer ou afficher les réponses.",
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

    if (hasExitQuestion) {
      return help(
        "exit-confusion",
        "Ta question porte sur une autre information. Réponds avec l’une des options affichées.",
        attemptNumber,
        "follow-up",
      );
    }

    if (hasDurationQuestion && hasTransferQuestion) {
      return help(
        "uncertain",
        "J’ai entendu deux questions à la fois : la durée et la correspondance. Pose-les l’une après l’autre pour que je suive ton intention.",
        attemptNumber,
        "follow-up",
      );
    }

    if (hasDurationQuestion) {
      if (!durationChoice) {
        return help(
          "duration-confusion",
          "Tu redemandes la durée. À ce moment de la scène, tu peux poser l’autre question, demander de répéter ou terminer l’échange.",
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
          "J’ai compris que tu demandes la durée. La formulation correcte est « 얼마나 걸려요? ».",
          true,
        );
      }

      return matched(
        isNaturalDuration ? "duration" : "duration-imperfection",
        durationChoice,
        isNaturalDuration
          ? "Très bien, tu demandes combien de temps dure le trajet jusqu’à Gangnam."
          : "J’ai compris ta question sur la durée. Une formulation A1 naturelle est « 얼마나 걸려요? ».",
        !isNaturalDuration,
      );
    }

    if (hasTransferQuestion) {
      if (!transferChoice) {
        return help(
          "transfer-confusion",
          "Tu redemandes s’il faut changer de ligne. À ce moment de la scène, tu peux poser l’autre question, demander de répéter ou terminer l’échange.",
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
          "J’ai compris que tu demandes s’il faut changer de ligne. La formulation correcte est : 갈아타야 하나요?",
          true,
        );
      }

      return matched(
        isNaturalTransfer ? "transfer" : "transfer-imperfection",
        transferChoice,
        isNaturalTransfer
          ? "Très bien, tu demandes s’il faut faire une correspondance."
          : "J’ai compris ta question sur la correspondance. Tu peux dire « 환승해야 해요? » ou « 갈아타야 해요? ».",
        !isNaturalTransfer,
      );
    }

    if (hasRelevantContentQuestion) {
      return help(
        "relevant-question",
        "Ta question est liée aux indications données. Réécoute l’interlocuteur ou demande de répéter avec « 다시 한번 말씀해 주세요 ».",
        attemptNumber,
        "follow-up",
      );
    }

    if (repeatChoice && hasNotUnderstood) {
      return matched(
        "not-understood",
        repeatChoice,
        "Tu indiques que tu n’as pas encore compris. Je vais répéter les informations plus simplement.",
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
          "J’ai compris ta demande de répétition. En coréen, « 다시요 » suffit dans ce contexte.",
          true,
        );
      }

      if (hasReversedOrder) {
        return matched(
          "repeat-word-order",
          repeatChoice,
          "J’ai compris ta demande. L’ordre naturel est « 다시 말해 주세요 ».",
          true,
        );
      }

      if (isDirect) {
        return matched(
          "repeat-informal",
          repeatChoice,
          "Ta demande est comprise. Avec un inconnu, préfère « 다시 말해 주세요 » à la forme directe « 다시 말해 ».",
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
          ? "J’ai compris que tu veux que la personne répète. « 다시요 » ou « 한 번 더요 » suffit dans ce contexte. Une version plus polie est « 다시 한번 말씀해 주세요 »."
          : "Très bien, tu as demandé de répéter les indications.",
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
        "J’ai compris que tu demandes de répéter. La formulation correcte est « 다시 한번 말씀해 주세요 ».",
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
          ? "Très bien, « 감사합니다 » suffit naturellement pour remercier et terminer l’échange."
          : "Très bien, tu indiques clairement que tu as compris les indications.",
        isMixedLanguage,
      );
    }

    if (thanksChoice && hasInformalClosing) {
      return matched(
        "thanks-informal",
        thanksChoice,
        "Ton intention est comprise. Avec un inconnu, préfère « 감사합니다 » ou « 알겠습니다 ».",
        true,
      );
    }

    if (thanksChoice && includesAny(korean, CLOSING_CONFUSIONS)) {
      return matched(
        "thanks-informal",
        thanksChoice,
        "J’ai compris que tu termines l’échange. La formulation correcte est « 감사합니다 » ou « 알겠습니다 ».",
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
          "J’ai peut-être entendu une formule de clôture incomplète. Est-ce que tu voulais dire « 알겠습니다 » ou « 감사합니다 » ?",
          choices,
        ),
        understoodWithCorrection: false,
      };
    }

    if (isOnlyAcknowledgement) {
      return help(
        "ambiguous-acknowledgement",
        "« 네 » seul est ambigu ici. Dis « 알겠습니다 » si tu as compris, ou « 다시요 » si tu veux entendre les indications une nouvelle fois.",
        attemptNumber,
        "follow-up",
      );
    }

    const exactChoice = choices.find(
      (choice) => compactKorean(choice.korean) === korean,
    );
    if (exactChoice) {
      return matched("natural", exactChoice, "Réponse comprise.");
    }

    return help(
      "out-of-scope",
      "Ici, réponds à l’intervention en cours avec l’une des options affichées.",
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
    const stationIndex = korean.indexOf(compactKorean(station));
    const correctionIndex = korean.indexOf("아니", stationIndex + 1);
    const gangnamIndex = korean.indexOf("강남", correctionIndex + 1);
    return (
      stationIndex >= 0 &&
      correctionIndex > stationIndex &&
      gangnamIndex > correctionIndex
    );
  });
  const hasSelfCorrection = !!selfCorrectionStation;
  const isFrench = /[a-zàâçéèêëîïôûùüÿœ]/i.test(transcript);
  const frenchUnderstood =
    latin.includes("gangnam") &&
    ["direction", "cote", "quai", "train", "metro"].some((token) =>
      latin.includes(token),
    );

  if (hasExit) {
    return help(
      "exit-confusion",
      "Tu demandes la sortie. Ici, tu n’es pas encore arrivé : demande quelle direction prendre pour Gangnam avec « 방향 » ou « 가는 쪽 ».",
      attemptNumber,
    );
  }

  if (hasDuration) {
    return help(
      "duration-confusion",
      "Tu demandes combien de temps dure le trajet. À cette étape, cherche plutôt de quel côté prendre le train vers Gangnam.",
      attemptNumber,
    );
  }

  if (hasTransfer) {
    return help(
      "transfer-confusion",
      "Tu demandes où changer de ligne. Ici, le but est seulement de confirmer la direction vers Gangnam.",
      attemptNumber,
    );
  }

  if (wrongDestination && !hasGangnam) {
    return help(
      "wrong-destination",
      `J’ai reconnu une autre destination (${wrongDestination}). Dans cette scène, tu cherches la direction de Gangnam. Réessaie en incluant « 강남 ».`,
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
      "J’ai entendu Gangnam, mais aussi une autre direction. Demande uniquement comment aller vers Gangnam.",
      attemptNumber,
    );
  }

  if (isFrench && !hasTravelIntent) {
    const feedback = frenchUnderstood
      ? "Tu as bien compris qu’il faut demander comment aller à Gangnam. Essaie maintenant en coréen : « 강남에 어떻게 가요? »."
      : "Réponds en coréen : tu es à Hongik University et tu cherches comment aller à Gangnam.";
    return help("french", feedback, attemptNumber);
  }

  if ((hasGangnam || asksForSubway) && hasTravelIntent) {
    if (hasSelfCorrection) {
      return matched(
        "natural",
        directionChoice,
        "Très bien, tu t’es corrigé et ta demande finale vers Gangnam est claire.",
      );
    }

    if (hasLatinGangnam) {
      return matched(
        "mixed-language",
        directionChoice,
        "J’ai compris ta demande vers Gangnam. En coréen, écris aussi la destination « 강남 » : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (includesAny(korean, ["강남을어떻게가", "강남를어떻게가"])) {
      return matched(
        "particle-imperfection",
        directionChoice,
        "Ta demande est comprise. Pour une destination, utilise « 에 » ou « 까지 » : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (includesAny(korean, ["어떻게강남", "가요어떻게강남", "어디예요강남가는"])) {
      return matched(
        "word-order",
        directionChoice,
        "L’intention est claire. Un ordre naturel est : « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (includesAny(korean, ["어떻게와", "어디로와"])) {
      return matched(
        "go-come-confusion",
        directionChoice,
        "J’ai compris que tu veux aller à Gangnam. Ici, utilise « 가요 » plutôt que « 와요 » : « 강남에 어떻게 가요? ».",
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
        "J’ai compris que tu cherches le métro pour Gangnam. Pour demander le trajet en général, dis plutôt « 강남에 어떻게 가요? ».",
        true,
      );
    }

    if (asksHowToGo && korean.endsWith("가")) {
      return matched(
        "minor-imperfection",
        directionChoice,
        "Ta demande est comprise. Avec un inconnu, ajoute la terminaison polie : « 강남에 어떻게 가요? ».",
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
        "Ta demande est claire. Tu peux ajouter la particule de destination : « 강남에 어떻게 가요? » ou « 강남까지 어떻게 가요? ».",
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
        ? `Ta phrase est naturelle et permet de demander comment aller à Gangnam. Dans une station, tu peux aussi dire : ${GANGNAM_MODEL}`
        : isNatural
          ? "Très bien. Tu as clairement demandé comment aller vers Gangnam."
        : `Ta phrase est compréhensible. Pour être plus naturel, tu peux dire : « ${GANGNAM_MODEL} ».`,
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
        "Ta phrase semble inachevée après « 강남 가려면… ». Veux-tu demander comment aller à Gangnam ?",
        choices,
      ),
      understoodWithCorrection: false,
    };
  }

  if (hasGangnam && !hasTravelIntent) {
    return help(
      "destination-only",
      `J’ai bien reconnu Gangnam, mais il manque l’idée de direction. Demande de quel côté prendre le train : « ${GANGNAM_MODEL} ».`,
      attemptNumber,
    );
  }

  if (hasApproximateGangnam && hasTravelIntent) {
    return matched(
      "minor-imperfection",
      directionChoice,
      "J’ai compris que tu demandes la direction de Gangnam. La destination correcte s’écrit « 강남 ».",
      true,
    );
  }

  if (hasApproximateGangnam || (hasTravelIntent && korean.includes("강"))) {
    return {
      reason: "uncertain",
      category: "uncertain",
      choice: directionChoice,
      feedback: withAvailableChoices(
        "J’ai peut-être entendu « 강남 방향 ». Est-ce bien la direction vers Gangnam que tu voulais demander ?",
        choices,
      ),
      understoodWithCorrection: false,
    };
  }

  if (!hasGangnam && hasTravelIntent) {
    return help(
      "direction-only",
      "Tu demandes bien de quel côté aller, mais il manque la destination. Ajoute « 강남 » pour préciser où tu veux aller.",
      attemptNumber,
    );
  }

  return help(
    "out-of-scope",
    "Ici, tu es dans la station de Hongik University et tu cherches le quai vers Gangnam. Demande de quel côté se trouve cette direction.",
    attemptNumber,
  );
}
