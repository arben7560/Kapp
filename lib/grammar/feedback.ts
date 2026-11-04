import type {
  GrammarPracticeAnswer,
  GrammarPracticeQuestion,
} from "../../data/grammar/types";

function answerLabel(answer: GrammarPracticeAnswer): string {
  return typeof answer === "string" ? answer : answer.join(" ");
}

function quoted(answer: string) {
  return `« ${answer} »`;
}

function connectorRole(answer: string) {
  if (/지만/u.test(answer)) return "un contraste";
  if (/(?:으)?면/u.test(answer)) return "une condition";
  if (/서/u.test(answer) || /니까/u.test(answer)) return "une cause";
  if (/고/u.test(answer)) return "un simple enchaînement";
  return undefined;
}

function isPolitePast(answer: string) {
  return /(?:았|었|했|갔|봤|왔|셨|렸)어요\.?$/u.test(answer);
}

const interrogativeMeanings: Readonly<Record<string, string>> = {
  뭐: "sert à demander « quoi »",
  누구: "sert à demander « qui »",
  몇: "sert à demander combien, devant un compteur",
  얼마: "sert notamment à demander un prix",
  어디: "sert à demander où",
  언제: "sert à demander quand",
  왜: "sert à demander pourquoi",
  어떻게: "sert à demander comment",
  무슨: "signifie « quel » et se place devant un nom",
};

const interrogativeNeeds: Readonly<Record<string, string>> = {
  what: "ce qu’est la chose, donc il faut 뭐",
  who: "qui est la personne, donc il faut 누구",
  "how-many": "combien il y en a, donc il faut 몇",
  where: "le lieu, donc il faut 어디",
  when: "le moment, donc il faut 언제",
  why: "la raison, donc il faut 왜",
  how: "la manière de faire, donc il faut 어떻게",
  "how-much": "le prix, donc il faut 얼마",
};

const particleRoles: Readonly<Record<string, string>> = {
  은: "marque un thème après un nom avec 받침",
  는: "marque un thème après un nom sans 받침",
  이: "marque un sujet après un nom avec 받침",
  가: "marque un sujet après un nom sans 받침",
  을: "marque un objet direct après un nom avec 받침",
  를: "marque un objet direct après un nom sans 받침",
  에: "marque un lieu statique, une destination ou un moment précis",
  에서: "marque le lieu d’une action ou un point de départ",
  로: "marque une direction ou un moyen après une voyelle ou ㄹ",
  으로: "marque une direction ou un moyen après un 받침 autre que ㄹ",
  부터: "marque le point de départ d’une période",
  까지: "marque une limite ou le point final d’une période",
  동안: "indique la durée pendant laquelle une situation se poursuit",
  도: "signifie « aussi » et ajoute un élément",
  만: "signifie « seulement » et limite les possibilités",
  하고: "coordonne des noms avec le sens « et »",
  이나: "relie des noms avec le sens « ou » après un 받침",
  나: "relie des noms avec le sens « ou » après une voyelle",
  이랑: "relie des noms avec le sens « et / avec » après un 받침",
  랑: "relie des noms avec le sens « et / avec » après une voyelle",
};

/**
 * Étape 01 : chaque distracteur et permutation possède son explication.
 * Certains ordres restent possibles à l'oral, sans correspondre à l'ordre
 * neutre explicitement demandé dans ces cinq exercices.
 */
const SENTENCE_ORDER_STAGE_ONE_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "home-order": {
    "가요 저는 집에.":
      "가요 arrive avant le thème 저는 et la destination 집에. Pour l'ordre neutre demandé, le verbe doit terminer la phrase.",
    "저는 가요 집에.":
      "집에, la destination, est placé après 가요. Dans cette phrase neutre, il doit précéder le verbe.",
    "집에 가요 저는.":
      "저는 est ajouté après le verbe : c'est une reprise possible à l'oral, mais pas l'ordre neutre thème → destination → verbe.",
  },
  "book-order": {
    "도서관에서 읽어요 책을.":
      "책을, le livre lu, se retrouve après 읽어요. Dans l'ordre neutre, l'objet vient avant le verbe.",
    "읽어요 도서관에서 책을.":
      "읽어요 ouvre la phrase, avant le lieu 도서관에서 et l'objet 책을. Ici, le verbe doit être le dernier bloc.",
    "책을 읽어요 도서관에서.":
      "도서관에서, le lieu où tu lis, vient après 읽어요. Dans la phrase neutre, lieu et objet précèdent l'action.",
  },
  "friend-order": {
    "내일 만나요 친구를.":
      "친구를, la personne rencontrée, suit 만나요. Dans cette phrase neutre, l'objet doit précéder le verbe.",
    "만나요 내일 친구를.":
      "만나요 est en premier, avant le moment 내일 et l'objet 친구를. Pour cette consigne, le verbe vient en dernier.",
    "친구를 만나요 내일.":
      "내일 (demain) arrive après 만나요. Ici, le repère de temps précède le verbe final.",
  },
  "subject-omission": {
    "저는 학교에 가요.":
      "Cette phrase est grammaticale, mais 저는 répète « moi » alors que la question indique déjà qui répond. On demandait une réponse sans sujet répété.",
    "학교에 가요 저는.":
      "저는 après 가요 forme une reprise marquée et inutile ici. La consigne demandait une réponse brève, sans répéter le sujet.",
    "가요 학교에.":
      "학교에, la destination, arrive après le verbe 가요. Dans l'ordre neutre demandé, elle doit le précéder.",
  },
};

function getSentenceOrderStageOneFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "sentence-structure" ||
    !question.conceptIds.includes("sentence-order")
  ) {
    return undefined;
  }

  if (typeof answer !== "string") {
    if (typeof question.answer === "string") return undefined;
    const words = answer.map((token) => token.replace(/[.!?]+$/u, ""));
    const expectedWords = question.answer.map((token) =>
      token.replace(/[.!?]+$/u, ""),
    );
    const verb = expectedWords[expectedWords.length - 1];
    const verbIndex = words.indexOf(verb);
    const chosenPhrase = quoted(words.join(" ") + ".");
    if (verbIndex === 0) {
      return (
        "Tu as construit " +
        chosenPhrase +
        " : le verbe " +
        verb +
        " ouvre la phrase. Dans l'ordre neutre demandé, le thème et l'objet viennent avant lui."
      );
    }
    if (verbIndex > 0 && verbIndex < words.length - 1) {
      return (
        "Dans " +
        chosenPhrase +
        ", tu places " +
        words.slice(verbIndex + 1).join(" ") +
        " après le verbe " +
        verb +
        ". Il faut ici terminer la phrase par l'action."
      );
    }
    if (verbIndex === words.length - 1 && words[0] !== expectedWords[0]) {
      return (
        "Avec " +
        chosenPhrase +
        ", le verbe est bien final, mais tu inverses le thème " +
        expectedWords[0] +
        " et l'objet " +
        expectedWords[1] +
        ". Cet ordre peut marquer un contraste ; ici on demande l'ordre neutre."
      );
    }
    return (
      "Dans " +
      chosenPhrase +
      ", l'ordre ne correspond pas aux trois blocs demandés : thème, objet, puis verbe."
    );
  }

  for (const [drillId, choices] of Object.entries(
    SENTENCE_ORDER_STAGE_ONE_DISTRACTORS,
  )) {
    if (question.id.includes(":drill-sentence-order-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + ". " + reason;
    }
  }

  return undefined;
}

/**
 * Étape 02 : on explique le suffixe réellement choisi, à partir du nom
 * affiché. Les variantes formelles correctes ne sont pas présentées
 * comme des fautes de grammaire.
 */
const COPULA_STAGE_TWO_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "student-batchim": {
    예요: "학생 finit par le 받침 ㅇ, pas par une voyelle. « 학생예요 » ne convient pas : après cette consonne finale, écris 학생이에요.",
    이예요:
      "« 학생이예요 » ne correspond pas à la graphie standard. Après le 받침 ㅇ de 학생, la terminaison est 이에요 : 학생이에요.",
    입니다:
      "« 학생입니다 » est grammatical et poli, mais plus formel. Dans cette présentation quotidienne, on emploie le poli courant : 학생이에요.",
  },
  "doctor-vowel": {
    이에요:
      "의사 se termine par ㅏ, une voyelle. « 의사이에요 » ajoute un 이 inutile : au style poli courant, on dit 의사예요.",
    이예요:
      "« 의사이예요 » n'est pas la forme standard. 의사 finit par la voyelle ㅏ : attache directement 예요, donc 의사예요.",
    입니다:
      "« 의사입니다 » est une présentation grammaticalement correcte, mais formelle. Ici, dans une conversation courante, on dit 의사예요.",
  },
  "book-batchim": {
    예요: "책 se termine par ㄱ (받침). « 책예요 » omet le 이 nécessaire après une consonne finale : dis 책이에요.",
    이예요:
      "« 책이예요 » n'est pas la bonne graphie. Après la consonne finale ㄱ de 책, utilise 이에요 : 책이에요.",
    아니에요:
      "« 책아니에요 » ne forme pas correctement la négation ; on dirait 책이 아니에요. Mais tu confirmes ici que c'est un livre : 책이에요.",
  },
  "friend-vowel": {
    이에요:
      "친구 se termine par la voyelle ㅜ. « 친구이에요 » ajoute un 이 inutile ; pour confirmer que c'est ton ami, dis 친구예요.",
    이예요:
      "« 친구이예요 » n'est pas la graphie standard. Après la voyelle finale ㅜ de 친구, on utilise 예요 : 친구예요.",
    아니에요:
      "« 친구아니에요 » n'est pas une négation complète : on dirait 친구가 아니에요. Or, ici, tu confirmes que c'est ton ami : 친구예요.",
  },
  "name-batchim": {
    예요: "수진 finit par ㄴ (받침) : « 수진예요 » ne convient pas. La terminaison du poli courant est 이에요 : 이름은 수진이에요.",
    이예요:
      "Dans « 이름은 수진__ », on complète directement le prénom 수진. Après le ㄴ final, c'est 이에요, non 이예요 : 이름은 수진이에요.",
    입니다:
      "« 이름은 수진입니다 » est grammatical, mais relève du style formel. La consigne demande le style poli courant : 이름은 수진이에요.",
  },
};

function getCopulaStageTwoFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "identify-with-copula" ||
    !question.conceptIds.includes("copula-ieyo-yeyo") ||
    typeof answer !== "string"
  ) {
    return undefined;
  }

  for (const [drillId, choices] of Object.entries(
    COPULA_STAGE_TWO_DISTRACTORS,
  )) {
    if (question.id.includes(":drill-copula-ieyo-yeyo-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + ". " + reason;
    }
  }
  return undefined;
}

/** Étape 03 : corrections ciblées par exercice et par réponse choisie. */
const POLITE_REGISTER_STAGE_THREE_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "good-daily": {
    좋습니다:
      "좋습니다 signifie « c'est bien » au présent, mais au registre formel. Ici, avec le serveur, on demande le poli courant 좋아요.",
    좋아: "좋아 dit bien « c'est bien », mais au registre familier. Pour répondre poliment au serveur, on dit 좋아요.",
    좋았어요:
      "좋았어요 est poli, mais au passé : « c'était bien ». Ici, tu parles de la proposition actuelle : 좋아요.",
  },
  "fine-daily": {
    괜찮습니다:
      "괜찮습니다 est au présent, mais au registre formel. Avec cette connaissance, utilise le poli courant 괜찮아요.",
    괜찮아:
      "괜찮아 veut dire « ça va », mais au registre familier. Ici, dans une conversation polie, choisis 괜찮아요.",
    괜찮았어요:
      "괜찮았어요 signifie « ça allait » au passé. On te demande comment tu vas maintenant : 괜찮아요.",
  },
  "eat-daily": {
    먹습니다:
      "먹습니다 parle de manger au présent, mais au registre formel. Pour cette conversation ordinaire entre collègues, dis 먹어요.",
    먹어: "먹어 est le présent au registre familier de 먹다. Ici, la consigne demande le poli courant 먹어요.",
    먹었어요:
      "먹었어요 veut dire « j'ai mangé » au passé. Ici, tu décris ce que tu manges maintenant : 먹어요.",
  },
  "go-daily": {
    갑니다:
      "갑니다 est grammatical au présent, mais dans le registre formel. Pour cette conversation polie courante, dis 가요.",
    가: "가 est une forme au registre familier de 가다. Pour répondre poliment à cette connaissance au présent, choisis 가요.",
    갔어요:
      "갔어요 veut dire « je suis allé(e) » au passé. Ici, tu parles d'où tu vas maintenant : 가요.",
  },
  "daily-vs-formal": {
    "학생입니다.":
      "학생입니다 est grammatical et poli, mais dans le registre formel. Ici, tu te présentes en poli courant : 학생이에요.",
    "학생이야.":
      "학생이야 signifie « je suis étudiant », mais au registre familier. Ici, tu te présentes poliment : 학생이에요.",
    "학생이었어요.":
      "학생이었어요 est poli, mais au passé : « j'étais étudiant ». Ici, tu es étudiant maintenant : 학생이에요.",
  },
};

function getPoliteRegisterStageThreeFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "polite-register" ||
    !question.conceptIds.includes("polite-style-yo") ||
    typeof answer !== "string"
  )
    return undefined;

  for (const [drillId, choices] of Object.entries(
    POLITE_REGISTER_STAGE_THREE_DISTRACTORS,
  )) {
    if (question.id.includes(":drill-polite-style-yo-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 04 : chaque distracteur est expliqué dans la phrase et le contexte.
 * 이/가 ou 을/를 peuvent être corrects ailleurs ; la consigne porte ici sur
 * le thème connu ou explicitement contrasté avec 은/는.
 */
const TOPIC_STAGE_FOUR_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "je-vowel": {
    은: "저 finit par la voyelle ㅓ : 은 suit une consonne finale, donc « 저은 » ne convient pas. Pour dire « quant à moi », écris 저는 학생이에요.",
    를: "를 est une particule d’objet, mais 학생이에요 identifie la personne sans action sur elle. « 저를 학생이에요 » ne convient pas : dis 저는 학생이에요.",
    가: "가 marque le sujet ; avec 저, on forme 제가 (et non « 저가 »). Ici, tu te présentes en posant « moi » comme thème, donc 저는 학생이에요.",
  },
  "today-batchim": {
    는: "오늘 finit par la consonne ㄹ (받침). 는 suit une voyelle : « 오늘는 » ne convient pas. Pour opposer aujourd’hui aux autres jours, dis 오늘은 쉬어요.",
    을: "을 marque normalement l’objet d’une action. Ici, tu ne fais pas quelque chose à « aujourd’hui » : tu le mets en contraste avec les autres jours. Dis 오늘은 쉬어요.",
    이: "이 marque le sujet. Avec « 오늘이 쉬어요 », tu attribuerais l’action de se reposer au jour lui-même. Ici, c’est toi qui te reposes aujourd’hui : 오늘은 쉬어요.",
  },
  "coffee-vowel": {
    은: "커피 finit par la voyelle ㅣ : 은 suit une consonne finale. Pour marquer le contraste entre le café et les autres boissons, dis 커피는 안 마셔요.",
    를: "를 est une particule d’objet : « 커피를 안 마셔요 » est une phrase correcte, mais elle ne marque pas le contraste demandé avec les autres boissons. Ici : 커피는 안 마셔요.",
    가: "가 marque le sujet : « 커피가 안 마셔요 » ferait du café celui qui ne boit pas. Ici, tu parles du café que toi, tu ne bois pas, en contraste : 커피는 안 마셔요.",
  },
  "book-batchim": {
    는: "책 finit par ㄱ (받침) : la particule de thème est 은 et non 는. Pour reprendre le livre déjà mentionné : 책은 여기 있어요.",
    을: "을 marque un objet direct, mais 있어요 indique ici où le livre se trouve. « 책을 여기 있어요 » ne convient pas ; le livre déjà connu est le thème : 책은 여기 있어요.",
    이: "« 책이 여기 있어요 » est grammatical : 이 présente le livre comme information nouvelle ou mise en avant. Ici, vous parliez déjà de ce livre ; reprends-le comme thème : 책은 여기 있어요.",
  },
  "friend-vowel": {
    은: "친구 finit par la voyelle ㅜ. 은 s’utilise après une consonne finale ; pour reprendre ton ami comme thème, dis 친구는 한국 사람이에요.",
    를: "를 marquerait un objet direct, alors que 한국 사람이에요 décrit l’identité de ton ami, sans action exercée sur lui. Ici, dis 친구는 한국 사람이에요.",
    가: "« 친구가 한국 사람이에요 » est grammatical si tu soulignes « qui est coréen ? ». Ici, vous parlez déjà de ton ami : pour ajouter une information à ce thème, dis 친구는 한국 사람이에요.",
  },
};

function getTopicStageFourFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "introduce-topic" ||
    !question.conceptIds.includes("topic-eun-neun") ||
    typeof answer !== "string"
  )
    return undefined;

  for (const [drillId, choices] of Object.entries(
    TOPIC_STAGE_FOUR_DISTRACTORS,
  )) {
    if (question.id.includes(":drill-topic-eun-neun-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 05 : un commentaire par distracteur, selon la distance, le type de
 * démonstratif (déterminant ou pronom) et le contexte de l'exercice.
 * Une autre forme peut être grammaticale tout en visant un autre référent.
 */
const DEMONSTRATIVES_STAGE_FIVE_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "this-bag": {
    그: "그 가방 désignerait plutôt un sac près de ton interlocuteur ou déjà mentionné. Tu montres ici le sac dans ta main, pour la première fois : 이 가방이에요.",
    저: "저 가방 viserait un sac loin de vous deux. Mais celui-ci est dans ta main : pour le nom 가방, choisis 이 가방이에요.",
    거기: "거기 désigne un endroit proche de ton interlocuteur, pas un déterminant devant 가방. Pour le sac que tu tiens, dis 이 가방이에요.",
  },
  "that-shoes": {
    이: "이 신발 désignerait des chaussures près de toi. Ici, elles sont près de la vendeuse, ton interlocutrice : 그 신발이에요.",
    저: "저 신발 viserait des chaussures loin de vous deux. Celles de la question sont à côté de la vendeuse : 그 신발이에요.",
    거기: "거기 signifie « là, près de l'autre » pour un lieu ; il ne se place pas comme déterminant devant 신발. Ici : 그 신발이에요.",
  },
  "far-building": {
    이: "이 건물 désignerait un bâtiment près de toi. Celui dont vous parlez est au loin, loin de vous deux : 저 건물이에요.",
    그: "그 건물 pourrait désigner un bâtiment déjà évoqué ou proche de l'autre personne. Ici, il est loin de vous deux et nouveau : 저 건물이에요.",
    저기: "저기 signifie « là-bas » et désigne un lieu. Devant le nom 건물, il faut le déterminant 저 : 저 건물이에요.",
  },
  "this-object-pronoun": {
    그거: "그거 pourrait désigner un objet près de l'autre personne ou déjà évoqué. Tu tiens cet objet nouveau dans ta main : 이거 뭐예요?",
    저거: "저거 désigne un objet loin de vous deux. Mais l'objet est dans ta main, tout près : 이거 뭐예요?",
    거기: "거기 désigne un lieu près de l'autre personne. « 거기 뭐예요? » interrogerait plutôt ce qui se trouve là ; ici, tu demandes ce qu'est l'objet dans ta main : 이거 뭐예요?",
  },
  "far-object-pronoun": {
    이거: "이거 désigne un objet tout près de toi. Or celui-ci est loin de vous deux, derrière la vitrine : 저거 뭐예요?",
    그거: "그거 désignerait plutôt un objet près de l'autre personne ou déjà évoqué. Celui-ci est nouveau et loin de vous deux : 저거 뭐예요?",
    저기: "저기 signifie « là-bas », pour un endroit. « 저기 뭐예요? » peut être naturel pour demander ce qu'il y a là-bas ; ici, tu désignes cet objet précis : 저거 뭐예요?",
  },
};

function getDemonstrativesStageFiveFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "demonstratives" ||
    !question.conceptIds.includes("demonstratives-i-geu-jeo") ||
    typeof answer !== "string"
  )
    return undefined;

  for (const [drillId, choices] of Object.entries(
    DEMONSTRATIVES_STAGE_FIVE_DISTRACTORS,
  )) {
    if (
      question.id.includes(":drill-demonstratives-i-geu-jeo-" + drillId + "-")
    ) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 06 : le message dépend du mot interrogatif réellement choisi et
 * explique le décalage entre personne, objet, lieu, quantité et prix.
 */
const NOMINAL_QUESTIONS_STAGE_SIX_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "what-object": {
    누구: "누구 demande l’identité d’une personne : avec une photo de quelqu’un, la question pourrait avoir un sens. Ici, tu regardes un objet inconnu : 이거 뭐예요?",
    몇: "몇 sert à demander un nombre, souvent devant un compteur comme 개. « 이거 몇예요? » ne demande pas naturellement la nature de l’objet : 이거 뭐예요?",
    어디: "어디 sert à demander un lieu. « 이거 어디예요? » pourrait viser l’endroit montré sur une image ; ici, tu veux savoir ce qu’est cet objet : 이거 뭐예요?",
  },
  "who-person": {
    뭐: "뭐 interroge sur une chose ou une catégorie. À propos d’une personne, il pourrait demander son métier, avec une autre formulation ; ici, tu veux son identité : 저 사람은 누구예요?",
    몇: "몇 demande un nombre. Pour l’âge, on pourrait dire 몇 살이에요?, mais pas pour identifier cette personne : 저 사람은 누구예요?",
    어디: "어디 demande un lieu. Pour demander où se trouve cette personne, on dirait 어디에 있어요? Ici, tu veux savoir qui elle est : 저 사람은 누구예요?",
  },
  "how-many-people": {
    뭐: "뭐 veut dire « quoi », pas « combien ». Devant le compteur de personnes 명, il faut 몇 pour demander la taille du groupe : 몇 명이에요?",
    누구: "누구 demande qui est une personne, pas combien de personnes viennent. Pour compter le groupe avec 명, utilise 몇 : 몇 명이에요?",
    얼마: "얼마 sert notamment à demander un prix ou un montant ; « 얼마 명 » ne se dit pas pour compter un groupe. Ici : 몇 명이에요?",
  },
  "how-many-tickets": {
    뭐: "뭐 demanderait « quoi », pas le nombre de billets. Comme 장 compte les billets, mets 몇 devant : 표 몇 장이에요?",
    누구: "누구 demande « qui », par exemple à qui appartient quelque chose. Ici, tu vérifies la quantité avec le compteur 장 : 표 몇 장이에요?",
    얼마: "얼마 convient pour demander un prix : 표 얼마예요? Mais « 얼마 장 » ne compte pas les billets. Ici, on demande le nombre : 표 몇 장이에요?",
  },
  "what-food": {
    누구: "누구 demande « qui » ; pour demander qui mange, on dirait 누가 먹어요? Tu veux identifier l’aliment, pas la personne : 뭐 먹어요?",
    몇: "몇 demande un nombre, mais il faudrait un compteur, par exemple 몇 개 먹어요? Ici, tu demandes quel aliment ton ami mange : 뭐 먹어요?",
    어디: "어디 demande « où ». Pour demander le lieu du repas, on dirait 어디에서 먹어요? Ici, tu demandes ce qu’il mange : 뭐 먹어요?",
  },
};

function getNominalQuestionsStageSixFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "nominal-questions" ||
    !question.conceptIds.includes("question-mwo-nugu-myeot") ||
    typeof answer !== "string"
  )
    return undefined;

  for (const [drillId, choices] of Object.entries(
    NOMINAL_QUESTIONS_STAGE_SIX_DISTRACTORS,
  )) {
    if (
      question.id.includes(":drill-question-mwo-nugu-myeot-" + drillId + "-")
    ) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 07 : le choix réel détermine la correction. Elle distingue
 * 받침, thème contrastif, sujet, présence/absence et identité.
 * Certaines phrases sont valables, mais expriment une autre nuance.
 */
const SUBJECT_STAGE_SEVEN_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "rain-vowel": {
    이: "비 finit par la voyelle ㅣ : « 비이 와요 » n’est pas la bonne forme. Pour annoncer simplement la pluie, choisis 비가 와요.",
    는: "비는 와요 est grammatical, mais souligne un thème ou un contraste (par exemple, la pluie plutôt que la neige). Ici, tu annonces simplement la pluie : 비가 와요.",
    를: "를 marque un objet direct, alors que 비 est le sujet de 와요 (« tomber, venir »). « 비를 와요 » ne convient pas : 비가 와요.",
  },
  "time-batchim": {
    가: "시간 se termine par le 받침 ㄴ : « 시간가 없어요 » ne convient pas. Avec un sujet après consonne, dis 시간이 없어요.",
    은: "시간은 없어요 est grammatical avec un thème ou un contraste (« du temps, je n’en ai pas »). Ici, tu réponds simplement que tu n’as pas le temps : 시간이 없어요.",
    을: "을 marque normalement un objet direct. Avec 없어요, 시간 est ce qui manque, pas l’objet d’une action : 시간이 없어요.",
  },
  "bus-vowel": {
    이: "버스 finit par la voyelle ㅡ, donc « 버스이 와요 » ne convient pas. Pour identifier ce qui arrive, dis 버스가 와요.",
    는: "버스는 와요 est possible si le bus est déjà le thème ou si tu le compares à un autre véhicule. Ici, « qu’est-ce qui arrive ? » appelle 버스가 와요.",
    를: "를 marque un objet, mais 와요 décrit l’arrivée du bus lui-même. « 버스를 와요 » ne convient pas : 버스가 와요.",
  },
  "book-batchim": {
    가: "책 finit par la consonne ㄱ : « 책가 있어요 » est incorrect. Pour annoncer la présence du livre, dis 책이 있어요.",
    은: "책은 있어요 est grammatical si tu opposes le livre à d’autres objets (« le livre, au moins, est là »). Ici, tu annonces un livre nouveau : 책이 있어요.",
    을: "을 marque un objet direct, mais 있어요 annonce ici la présence du livre. « 책을 있어요 » ne convient pas : 책이 있어요.",
  },
  "friend-vowel": {
    이: "친구 se termine par la voyelle ㅜ : « 친구이 » ne convient pas. Pour répondre à « qui étudie ? », dis 친구가 한국어를 공부해요.",
    는: "친구는 한국어를 공부해요 est grammatical si ton ami est déjà le thème. Ici, la question porte sur « qui étudie ? » : 친구가 한국어를 공부해요.",
    를: "를 ferait de 친구 un objet, alors que ton ami est celui qui étudie. 한국어를 est déjà l’objet du verbe : 친구가 한국어를 공부해요.",
  },
};

const EXISTENCE_STAGE_SEVEN_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "menu-available": {
    없어요:
      "채식 메뉴가 없어요? est une question possible, mais elle suppose plutôt que le menu manque. Ici, tu demandes neutrement s’il est disponible : 채식 메뉴가 있어요?",
    아니에요:
      "채식 메뉴가 아니에요? remettrait en question l’identité d’un menu, pas sa disponibilité. Ici, tu veux savoir s’il y en a : 채식 메뉴가 있어요?",
    해요: "해요 signifie « faire » ; le menu n’est pas celui qui réalise une action. Pour demander si un menu végétarien est proposé : 채식 메뉴가 있어요?",
  },
  "menu-unavailable": {
    있어요:
      "채식 메뉴가 있어요 dit qu’un menu végétarien est disponible. Le serveur annonce exactement le contraire : 채식 메뉴가 없어요.",
    아니에요:
      "채식 메뉴가 아니에요 nie l’identité d’un élément (« ce n’est pas un menu végétarien »), pas son existence. Ici : 채식 메뉴가 없어요.",
    "안 해요":
      "안 해요 nie l’action de faire, mais le sujet 채식 메뉴가 ne décrit pas un serveur qui cuisine. Pour signaler l’absence de menu : 채식 메뉴가 없어요.",
  },
  "time-have": {
    없어요:
      "시간이 없어요 veut dire « je n’ai pas le temps ». Or tu confirmes que tu es disponible : 시간이 있어요.",
    아니에요:
      "시간이 아니에요 signifierait plutôt « ce n’est pas le moment », pas « j’ai du temps ». Pour confirmer ta disponibilité : 시간이 있어요.",
    해요: "해요 signifie « faire » et ne dit pas que tu as du temps. Avec 시간이, la disponibilité se formule 시간이 있어요.",
  },
  "time-none": {
    있어요:
      "시간이 있어요 signifie que tu as du temps, mais la réunion t’en empêche. Pour dire « je n’ai pas le temps » : 시간이 없어요.",
    아니에요:
      "시간이 아니에요 ne signifie pas « je n’ai pas le temps » ; cela peut plutôt évoquer « ce n’est pas le moment ». Ici : 시간이 없어요.",
    "안 해요":
      "안 해요 signifie « ne pas faire », sans exprimer le manque de temps. Avec 시간이, il faut 없어요 : 시간이 없어요.",
  },
  "identity-vs-existence": {
    "가 없어요":
      "이건 커피가 없어요 parlerait plutôt d’absence de café, pas de la nature de la boisson servie. Tu dis « ce n’est pas du café » : 이건 커피가 아니에요.",
    "가 있어요":
      "이건 커피가 있어요 pourrait évoquer la présence de café dans quelque chose, pas nier l’identité du verre servi. Ici : 이건 커피가 아니에요.",
    "를 안 해요":
      "커피를 안 해요 nie une action liée au café, sans dire ce qu’est cette boisson. Pour nier son identité, utilise 이건 커피가 아니에요.",
  },
};

function getExistenceStageSevenFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (question.stageId !== "existence" || typeof answer !== "string") {
    return undefined;
  }

  const families = [
    ["subject-i-ga", SUBJECT_STAGE_SEVEN_DISTRACTORS],
    ["existence-isseoyo-eopseoyo", EXISTENCE_STAGE_SEVEN_DISTRACTORS],
  ] as const;

  for (const [conceptId, distractors] of families) {
    if (!question.conceptIds.includes(conceptId)) continue;
    for (const [drillId, choices] of Object.entries(distractors)) {
      if (!question.id.includes(":drill-" + conceptId + "-" + drillId + "-"))
        continue;
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 08 : correction précise de la particule réellement choisie,
 * selon le lieu, le verbe de position 있어요 et les autres emplois possibles.
 */
const LOCATION_STAGE_EIGHT_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "cafe-existence": {
    에서: "에서 indique le lieu d’une action au café. Ici, tu signales uniquement la position statique de ton ami : 친구가 카페에 있어요.",
    로: "카페로 indique une direction vers le café, par exemple avec 가요. Ton ami y est déjà, donc situe-le avec 에 : 친구가 카페에 있어요.",
    를: "를 marque l’objet direct d’une action ; « 카페를 있어요 » ne situe pas quelqu’un. Avec 있어요, le lieu de l’ami est 카페에 : 친구가 카페에 있어요.",
  },
  "school-existence": {
    에서: "학교에서 marque le lieu d’une action, comme 학교에서 공부해요. Ici, tu précises seulement où se trouve le professeur : 선생님이 학교에 있어요.",
    로: "학교로 signifie « vers l’école » avec un déplacement. Le professeur est déjà à l’école ; pour sa position, dis 선생님이 학교에 있어요.",
    가: "가 ferait de 학교 un sujet, et non le lieu du professeur. Le sujet est déjà 선생님이 ; pour localiser cette personne : 선생님이 학교에 있어요.",
  },
  "bag-existence": {
    에서: "가방에서 pourrait marquer le lieu d’une action ou l’origine d’un objet sorti du sac. Ici, la carte est simplement dedans : 카드가 가방에 있어요.",
    으로: "가방으로 indique une direction vers le sac, par exemple pour y déplacer la carte. Mais elle s’y trouve déjà : 카드가 가방에 있어요.",
    를: "를 marque un objet direct, par exemple 가방을 들다 (porter un sac) avec 을 après 가방. Ici, le sac est un lieu : 카드가 가방에 있어요.",
  },
  "floor-existence": {
    에서: "2층에서 situe une action au deuxième étage. Ici, les toilettes s’y trouvent : on marque cette position avec 에, donc 화장실은 2층에 있어요.",
    으로: "2층으로 signifie « vers le deuxième étage », notamment avec 가요. Tu donnes leur emplacement, pas une direction : 화장실은 2층에 있어요.",
    을: "을 marque un objet direct, pas l’étage où se trouvent les toilettes. Pour indiquer leur position : 화장실은 2층에 있어요.",
  },
  "home-existence": {
    에서: "집에서 peut situer une action faite à la maison, comme 집에서 공부해요. Ici, tu dis seulement où se trouve Minsu : 민수는 집에 있어요.",
    으로: "집으로 indique une direction « vers la maison », avec un verbe de mouvement. Minsu est déjà chez elle : 민수는 집에 있어요.",
    를: "집을 pourrait marquer l’objet d’une action, comme 집을 청소해요. Ici, la maison est le lieu où est Minsu : 민수는 집에 있어요.",
  },
};

function getLocationStageEightFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "locate-thing" ||
    !question.conceptIds.includes("location-e") ||
    typeof answer !== "string"
  )
    return undefined;

  for (const [drillId, choices] of Object.entries(
    LOCATION_STAGE_EIGHT_DISTRACTORS,
  )) {
    if (question.id.includes(":drill-location-e-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 09 : un commentaire précis pour chacun des 15 mauvais choix.
 * Distingue mauvaise voyelle / contraction, passé grammatical et futur grammatical.
 */
const PRESENT_ACTIONS_STAGE_NINE_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "eat-present": {
    먹아요:
      "먹아요 ne convient pas : le radical 먹- contient la voyelle ㅓ et prend -어요, pas -아요. Pour dire « je mange » maintenant : 먹어요.",
    먹었어요:
      "먹었어요 est correct, mais au passé : « j’ai mangé ». Ici, tu parles de ce que tu manges maintenant au présent poli courant : 먹어요.",
    "먹을 거예요":
      "먹을 거예요 est correct au futur : « je vais manger ». L’action se passe maintenant, donc utilise le présent : 먹어요.",
  },
  "go-present": {
    가어요:
      "가어요 n’est pas la conjugaison standard : 가- contient ㅏ, prend -아요 et se contracte en 가요. Ici, choisis 가요.",
    갔어요:
      "갔어요 est le passé poli de 가다 : « je suis allé(e) ». Tu annonces où tu vas maintenant, donc choisis 가요.",
    "갈 거예요":
      "갈 거예요 annonce un déplacement futur : « je vais aller / j’irai ». Ici, tu parles de ton déplacement actuel : 가요.",
  },
  "drink-present": {
    마시요:
      "마시요 n’est pas la forme standard : 마시- prend -어요, puis ㅣ + ㅓ se contracte en ㅕ. On obtient 마셔요.",
    마셨어요:
      "마셨어요 est correct au passé : « j’ai bu ». Ici, tu décris ce que tu bois habituellement, au présent : 마셔요.",
    "마실 거예요":
      "마실 거예요 est correct au futur : « je boirai ». L’exercice porte sur ton habitude actuelle : 마셔요.",
  },
  "study-present": {
    공부하요:
      "공부하요 n’est pas la forme standard : les verbes en 하다 prennent 해요 au présent poli courant. On dit 공부해요.",
    공부했어요:
      "공부했어요 est le passé poli : « j’ai étudié ». Pour dire que tu étudies tous les jours au présent : 공부해요.",
    "공부할 거예요":
      "공부할 거예요 annonce des études futures : « je vais étudier ». Ici, tu décris ton habitude au présent : 공부해요.",
  },
  "read-present": {
    읽아요:
      "읽아요 ne convient pas : la dernière voyelle de 읽- est ㅣ, donc on utilise -어요, même si le radical finit par un 받침. La forme est 읽어요.",
    읽었어요:
      "읽었어요 est correct, mais au passé : « j’ai lu ». Pour dire que tu lis en ce moment au présent poli courant : 읽어요.",
    "읽을 거예요":
      "읽을 거예요 exprime le futur : « je vais lire ». Tu décris ce que tu fais en ce moment ; utilise 읽어요.",
  },
};

function getPresentActionsStageNineFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "present-actions" ||
    !question.conceptIds.includes("present-a-eoyo") ||
    typeof answer !== "string"
  )
    return undefined;

  for (const [drillId, choices] of Object.entries(
    PRESENT_ACTIONS_STAGE_NINE_DISTRACTORS,
  )) {
    if (question.id.includes(":drill-present-a-eoyo-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 10 : chacun des 15 choix de réponse reçoit son explication propre.
 * Les thèmes en 은/는 peuvent être corrects ailleurs mais ne sont pas l'objet
 * neutre demandé ; 이/가 déplacerait ici le rôle d'acteur de l'action.
 */
const OBJECT_ACTIONS_STAGE_TEN_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "book-batchim": {
    를: "책 finit par le 받침 ㄱ : 를 suit une voyelle. Pour dire que tu lis un livre, l’objet prend 을 : 책을 읽어요.",
    은: "책은 읽어요 est grammatical si tu mets le livre en thème ou en contraste, par exemple « les livres, j’en lis ». Ici, tu réponds sans contraste à « Que lis-tu ? » : 책을 읽어요.",
    이: "이 marquerait 책 comme sujet, comme si le livre effectuait lui-même l’action de lire. Tu lis le livre : il est l’objet, donc 책을 읽어요.",
  },
  "coffee-vowel": {
    을: "커피 se termine par la voyelle ㅣ : 을 suit une consonne finale. Pour marquer l’objet que tu bois, utilise 를 : 커피를 마셔요.",
    는: "커피는 마셔요 peut être correct pour mettre le café en contraste avec d’autres boissons. Mais tu réponds simplement à « Que bois-tu ? » : 커피를 마셔요.",
    가: "가 ferait du café le sujet qui accomplit l’action de boire. Ici, c’est toi qui bois le café : 커피 est l’objet et prend 를, donc 커피를 마셔요.",
  },
  "meal-batchim": {
    를: "밥 finit par le 받침 ㅂ : la particule d’objet après consonne est 을, pas 를. Pour dire que tu manges ton repas : 밥을 먹어요.",
    은: "밥은 먹어요 est grammatical si tu mets le repas en thème ou en contraste (« au moins, je mange »). Ici, tu indiques seulement ce que tu manges : 밥을 먹어요.",
    이: "이 ferait de 밥 le sujet de 먹어요, comme si le repas mangeait lui-même. Tu manges le repas, donc 밥 est l’objet : 밥을 먹어요.",
  },
  "korean-vowel": {
    을: "한국어 se termine par la voyelle ㅓ : on utilise 를 après une voyelle. Pour indiquer la langue que tu étudies : 한국어를 공부해요.",
    는: "한국어는 공부해요 est possible si le coréen est ton thème ou si tu le compares à d’autres langues. Ici, tu réponds simplement à « Qu’étudies-tu ? » : 한국어를 공부해요.",
    가: "가 présenterait 한국어 comme sujet qui étudie, et non comme la langue étudiée. Dans cette réponse, le coréen est l’objet : 한국어를 공부해요.",
  },
  "film-vowel": {
    을: "영화 finit par la voyelle ㅏ : 을 suit une consonne finale. Ici, 영화 est l’objet du verbe 봐요 et prend 를 : 영화를 봐요.",
    는: "영화는 봐요 est possible pour mettre les films en thème ou en contraste avec d’autres contenus. Ici, tu dis simplement ce que tu regardes : 영화를 봐요.",
    가: "가 ferait du film le sujet qui regarde, au lieu de l’objet que tu regardes. Ici, choisis la particule d’objet 를 : 영화를 봐요.",
  },
};

function getObjectActionsStageTenFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "object-actions" ||
    !question.conceptIds.includes("object-eul-reul") ||
    typeof answer !== "string"
  )
    return undefined;

  for (const [drillId, choices] of Object.entries(
    OBJECT_ACTIONS_STAGE_TEN_DISTRACTORS,
  )) {
    if (question.id.includes(":drill-object-eul-reul-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 11 : distingue le lieu d'une activité (에서), la position (에),
 * la direction (로/으로) et la limite atteinte (까지), selon le choix réel.
 */
const ACTION_LOCATION_STAGE_ELEVEN_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "cafe-action": {
    "에": "카페에 있어요 signifie « je suis au café » : 에 situe une présence. Mais 공부해요 décrit l’activité d’étudier ; pour dire où tu étudies, utilise 카페에서 공부해요.",
    "로": "카페로 signifie « vers le café » avec un verbe comme 가요. Tu es déjà au café et tu y étudies : 카페에서 공부해요 situe l’activité, pas le trajet.",
    "까지": "카페까지 marque une limite ou un point d’arrivée, « jusqu’au café ». Ici, tu précises où se déroule l’étude : 카페에서 공부해요.",
  },
  "school-static": {
    "에서": "학교에서 공부해요 situe une action à l’école. Ici, 있어요 indique simplement où est ton ami, sans activité précisée : 학교에 있어요.",
    "로": "학교로 signifie « vers l’école », par exemple 학교로 가요. Ton ami y est déjà : pour sa position, dis 학교에 있어요.",
    "까지": "학교까지 indique une limite ou destination « jusqu’à l’école ». On te demande où se trouve ton ami, et non jusqu’où il va : 학교에 있어요.",
  },
  "home-action": {
    "에": "집에 있어요 indiquerait que tu es chez toi. Mais la phrase raconte où tu manges : 집에서 밥을 먹어요 marque le lieu du repas.",
    "으로": "집으로 indique une direction « vers la maison », par exemple 집으로 가요. Tu es déjà chez toi et tu y manges : 집에서 밥을 먹어요.",
    "까지": "집까지 signifie « jusqu’à la maison » et désigne une limite de trajet. Ici, il ne s’agit pas d’un trajet, mais d’un repas à la maison : 집에서 밥을 먹어요.",
  },
  "library-static": {
    "에서": "도서관에서 책을 읽어요 situe une lecture à la bibliothèque. Mais ici, tu dis seulement où le livre se trouve : 도서관에 있어요.",
    "으로": "도서관으로 désigne une direction « vers la bibliothèque ». Or le livre s’y trouve déjà : 도서관에 있어요 indique sa position.",
    "까지": "도서관까지 marque « jusqu’à la bibliothèque », une limite de déplacement ou d’étendue. Tu situes simplement le livre : 도서관에 있어요.",
  },
  "restaurant-action": {
    "에": "식당에 있어요 situerait une présence au restaurant. Mais avec 친구를 만나요, tu indiques où se déroule une rencontre : 식당에서 친구를 만나요.",
    "으로": "식당으로 signifie « vers le restaurant », avec un déplacement comme 식당으로 가요. Ici, tu situes la rencontre elle-même : 식당에서 친구를 만나요.",
    "까지": "식당까지 signifie « jusqu’au restaurant », une limite de trajet. Pour dire où tu rencontres ton ami, choisis 식당에서 친구를 만나요.",
  },
};

function getActionLocationStageElevenFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "action-location" ||
    !question.conceptIds.includes("action-location-eseo") ||
    typeof answer !== "string"
  ) return undefined;

  for (const [drillId, choices] of Object.entries(ACTION_LOCATION_STAGE_ELEVEN_DISTRACTORS)) {
    if (question.id.includes(":drill-action-location-eseo-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 12 : explique chacun des choix selon sa fonction exacte :
 * destination (에), départ/origine (에서/부터), limite (까지),
 * objet direct (을/를) ou moment ponctuel (에).
 */
const DESTINATION_STAGE_TWELVE_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "seoul-destination": {
    "에서": "서울에서 가요 peut être une phrase grammaticale si Séoul est le point de départ. Ici, Séoul est la destination : 서울에 가요.",
    "을": "을 marque généralement un objet direct ou certains parcours, pas simplement la ville visée avec 가요. Pour dire que tu vas à Séoul : 서울에 가요.",
    "부터": "서울부터 indique plutôt un départ depuis Séoul ou le début d’un itinéraire. Ici, Séoul est ton point d’arrivée : 서울에 가요.",
  },
  "school-destination": {
    "에서": "학교에서 와요 pourrait vouloir dire que la personne vient de l’école : 학교 est alors le lieu d’origine. Ici, elle vient à l’école : 학교에 와요.",
    "를": "를 marque normalement un objet direct, pas le lieu où l’on vient. Dans cette phrase, l’école est le point d’arrivée : 학교에 와요.",
    "까지": "학교까지 와요 est grammatical et souligne que la personne vient jusqu’à l’école, comme limite du trajet. Ici, tu indiques simplement sa destination : 학교에 와요.",
  },
  "two-time": {
    "에서": "에서 indique notamment le lieu d’une action ou un point de départ. Mais 두 시 est ici l’heure précise du rendez-vous : 두 시에 친구를 만나요.",
    "부터": "두 시부터 veut dire « à partir de deux heures » : cela marque le début d’une période. Ici, la rencontre est fixée précisément à deux heures : 두 시에 친구를 만나요.",
    "를": "를 marque l’objet direct : 친구를 est déjà la personne rencontrée. 두 시 indique l’heure du rendez-vous et prend 에 : 두 시에 친구를 만나요.",
  },
  "monday-time": {
    "에서": "에서 sert notamment à situer une action dans un lieu, pas à fixer ce départ à un jour précis. Pour dire « je pars lundi » : 월요일에 출발해요.",
    "부터": "월요일부터 veut dire « à partir de lundi » et introduit le début d’une période. Ici, le départ a lieu lundi, un jour précis : 월요일에 출발해요.",
    "를": "를 est une particule d’objet direct ; lundi n’est pas ce qu’on fait partir. C’est le jour fixé pour le départ : 월요일에 출발해요.",
  },
  "morning-time": {
    "에서": "에서 peut indiquer le lieu d’une activité ou un point de départ, pas l’heure exacte du réveil dans cette phrase. Ici : 아침 여덟 시에 일어나요.",
    "까지": "아침 여덟 시까지 일어나요 peut vouloir dire que tu te lèves au plus tard à huit heures. Mais tu dis que tu te lèves exactement à huit heures : 아침 여덟 시에 일어나요.",
    "를": "를 marque un objet direct, tandis que 아침 여덟 시 précise le moment du réveil. Pour une heure exacte, utilise 에 : 아침 여덟 시에 일어나요.",
  },
};

function getDestinationStageTwelveFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "destination-and-time" ||
    !question.conceptIds.includes("destination-time-e") ||
    typeof answer !== "string"
  ) return undefined;

  for (const [drillId, choices] of Object.entries(DESTINATION_STAGE_TWELVE_DISTRACTORS)) {
    if (question.id.includes(":drill-destination-time-e-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 13 : le retour dépend du distracteur réellement choisi :
 * possessif poli/familier, démonstratif, pronom sujet ou particule 의.
 */
const POSSESSION_STAGE_THIRTEEN_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "my-ticket-employee": {
    "내": "내 표예요 signifie aussi « c’est mon billet », mais dans un registre familier. Tu parles à un contrôleur : préfère la forme polie 이건 제 표예요.",
    "저": "저 표 signifie « ce billet là-bas » quand 저 précède 표. Tu veux dire « mon billet », pas en montrer un autre : 이건 제 표예요.",
    "제가": "제가 est « moi » marqué comme sujet, pas « mon ». Devant 표, on utilise le possessif 제 : 이건 제 표예요.",
  },
  "my-name-professor": {
    "내": "내 이름은 마크예요 serait grammatical, mais 내 signifie « mon » en style familier. Pour te présenter poliment à ton professeur : 제 이름은 마크예요.",
    "저": "저 devant 이름 peut montrer « ce nom-là », mais ce n’est pas le possessif « mon ». Pour donner ton propre nom poliment : 제 이름은 마크예요.",
    "제가": "제가 signifie « moi » en fonction de sujet, comme 제가 마크예요. Devant le nom 이름, il faut « mon » : 제 이름은 마크예요.",
  },
  "my-passport-agent": {
    "내": "내 여권이에요 signifie bien « c’est mon passeport », mais s’emploie au registre familier. Face à un agent, utilise la forme polie 제 여권이에요.",
    "저": "저 여권 peut désigner « ce passeport là-bas », et non « mon passeport ». Tu identifies le document comme le tien : 제 여권이에요.",
    "제가": "제가 signifie « moi » avec la particule de sujet 가. Ce n’est pas un possessif à placer devant 여권 : 제 여권이에요.",
  },
  "my-bag-close-friend": {
    "제": "제 가방 est un possessif poli grammaticalement correct, mais ta phrase finit en -이야 et s’adresse à un proche. Pour garder le style familier : 이건 내 가방이야.",
    "나": "나 signifie « moi, je » ; pour dire « mon » devant 가방, il faut sa forme possessive 내 : 이건 내 가방이야.",
    "제가": "제가 signifie « moi » comme sujet poli, pas « mon ». Pour parler de ton sac à un ami proche, utilise 내 : 이건 내 가방이야.",
  },
  "friends-bag": {
    "제": "제 signifie « mon » en style poli, mais ton exercice parle du sac de l’ami. Après 친구, il faut relier les deux noms avec 의 : 친구의 가방이에요.",
    "내": "내 signifie « mon » en style familier, pas « de l’ami ». Pour exprimer explicitement à qui appartient le sac : 친구의 가방이에요.",
    "가": "가 marque le sujet : 친구가 가방이에요 signifierait littéralement que l’ami est un sac ! Pour dire « le sac de l’ami », utilise 의 : 친구의 가방이에요.",
  },
};

function getPossessionStageThirteenFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "possession" ||
    !question.conceptIds.includes("possession-ui-je-nae") ||
    typeof answer !== "string"
  ) return undefined;

  for (const [drillId, choices] of Object.entries(POSSESSION_STAGE_THIRTEEN_DISTRACTORS)) {
    if (question.id.includes(":drill-possession-ui-je-nae-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}

/**
 * Étape 14 : la question ne recherche pas la même information selon le
 * distracteur choisi. Les variantes grammaticales sont distinguées des
 * constructions qui nécessitent une autre formulation.
 */
const INFORMATION_QUESTIONS_STAGE_FOURTEEN_DISTRACTORS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "where-toilet": {
    "언제": "언제 demande « quand ». Pour les horaires des toilettes, on demanderait 언제 열어요? Ici, tu veux leur emplacement : 화장실이 어디예요?",
    "왜": "왜 demande « pourquoi », mais 화장실이 왜예요? n’exprime pas naturellement où elles sont. Pour demander leur emplacement : 화장실이 어디예요?",
    "어떻게": "어떻게 demande « comment ». Pour demander l’état des toilettes, on dirait plutôt 화장실이 어때요? Ici, tu cherches le lieu : 화장실이 어디예요?",
  },
  "when-train": {
    "어디": "어디 demande « où » : pour préciser le lieu d’arrivée, on pourrait dire 기차가 어디에 와요? Tu connais le quai et demandes l’heure : 기차가 언제 와요?",
    "왜": "기차가 왜 와요? est grammatical et demande pourquoi le train arrive. Mais tu veux connaître le moment de son arrivée : 기차가 언제 와요?",
    "어떻게": "기차가 어떻게 와요? peut demander comment le train arrive, pas à quelle heure. Pour demander son moment d’arrivée : 기차가 언제 와요?",
  },
  "why-taxi": {
    "어디": "어디 veut dire « où ». Pour demander où prendre un taxi, on dirait plutôt 어디에서 택시를 타요? Ici, tu demandes la raison du choix : 왜 택시를 타요?",
    "언제": "언제 택시를 타요? est grammatical et demande à quel moment ton ami prend un taxi. Tu veux savoir pourquoi il a choisi ce moyen : 왜 택시를 타요?",
    "어떻게": "어떻게 택시를 타요? peut demander comment prendre un taxi. Mais tu veux la raison de ce choix plutôt que sa méthode : 왜 택시를 타요?",
  },
  "how-go": {
    "어디": "어디 demande « où ». Pour demander où exactement à Séoul, on dirait plutôt 서울 어디에 가요? Mais tu connais la destination et demandes le moyen : 서울에 어떻게 가요?",
    "언제": "서울에 언제 가요? est correct, mais demande « quand vas-tu à Séoul ? ». Ici, tu cherches le moyen de transport : 서울에 어떻게 가요?",
    "왜": "서울에 왜 가요? est correct, mais demande « pourquoi vas-tu à Séoul ? ». Ici, tu demandes comment s’y rendre : 서울에 어떻게 가요?",
  },
  "how-much-item": {
    "어디": "이거 어디예요? pourrait viser un lieu montré, mais pas le prix de l’article que tu tiens. Pour savoir combien il coûte : 이거 얼마예요?",
    "언제": "이거 언제예요? pourrait demander quand a lieu un événement désigné par 이거. Ici, tu montres un article et demandes son prix : 이거 얼마예요?",
    "무슨": "무슨 signifie « quel / quelle sorte de » et se place devant un nom, comme 무슨 물건이에요? Il ne peut pas simplement remplacer le prix : 이거 얼마예요?",
  },
};

function getInformationQuestionsStageFourteenFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (
    question.stageId !== "information-questions" ||
    !question.conceptIds.includes("interrogatives-basic") ||
    typeof answer !== "string"
  ) return undefined;

  for (const [drillId, choices] of Object.entries(INFORMATION_QUESTIONS_STAGE_FOURTEEN_DISTRACTORS)) {
    if (question.id.includes(":drill-interrogatives-basic-" + drillId + "-")) {
      const reason = choices[answer];
      if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
    }
  }
  return undefined;
}


/**
 * Étape 15 : la correction suit la réponse réellement choisie.
 * Les formes longues peuvent être grammaticalement correctes ; dans ce cas
 * on explique la consigne plutôt que de les déclarer fausses.
 */
const STAGE_FIFTEEN_DISTRACTOR_FEEDBACK: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "not-go-choice": {
    "못 가요": "못 가요 exprime un empêchement. Ici, tu peux sortir mais tu décides de ne pas y aller : 안 가요.",
    "가지 않아요": "가지 않아요 est une négation correcte, mais longue. L’exercice demande précisément la forme courte 안 가요.",
    "아니에요": "아니에요 nie l’identité d’un nom. Pour nier l’action d’aller, utilise 안 devant 가요.",
  },
  "not-drink-choice": {
    "못 마셔요": "못 마셔요 signifie que tu ne peux pas boire. Ici, tu peux boire du café, mais tu préfères ne pas en boire : 안 마셔요.",
    "마시지 않아요": "마시지 않아요 est correct en négation longue. Pour la forme courte demandée, dis 안 마셔요.",
    "아니에요": "아니에요 signifie « ce n’est pas ». Tu nies ici l’action de boire : 안 마셔요.",
  },
  "not-spicy-short": {
    "못 매워요": "못 exprime en principe une incapacité à faire une action. 맵다 décrit une qualité du plat : dis 안 매워요.",
    "맵지 않아요": "맵지 않아요 est correct, mais c’est la négation longue. La forme courte demandée est 안 매워요.",
    "아니에요": "아니에요 nie l’identité d’une chose, pas directement sa saveur. Pour « ce n’est pas épicé », utilise 안 매워요.",
  },
  "not-buy-choice": {
    "못 사요": "못 사요 suggère que tu ne peux pas acheter le pain. Tu as l’argent, mais choisis de ne pas l’acheter : 안 사요.",
    "사지 않아요": "사지 않아요 est grammaticalement correct, mais c’est la forme longue. Ici, on travaille la négation courte 안 사요.",
    "아니에요": "아니에요 nie un nom, pas le verbe acheter. Dans cette phrase, dis 안 사요.",
  },
  "not-study-choice": {
    "못 공부해요": "못 공부해요 évoque un empêchement. Ici, tu as le temps mais décides de ne pas étudier : 안 공부해요.",
    "공부하지 않아요": "공부하지 않아요 est correct, mais sous la forme longue. L’exercice attend 안 공부해요.",
    "아니에요": "아니에요 nie une identité. Pour nier l’action d’étudier, place 안 devant 공부해요.",
  },
  "not-student": {
    "가 아니에요": "가 marque la négation de la copule après une voyelle. 학생 se termine par le 받침 ㅇ : 학생이 아니에요.",
    "안 이에요": "안 ne se place pas devant 이에요 pour nier une identité. On utilise nom + 이/가 아니에요 : 학생이 아니에요.",
    "이 없어요": "없어요 exprime l’absence ou la non-possession, pas « ne pas être étudiant ». Ici, dis 학생이 아니에요.",
  },
  "not-doctor": {
    "이 아니에요": "이 convient après un 받침. 의사 se termine par la voyelle ㅏ : 의사가 아니에요.",
    "안 예요": "안 예요 n’est pas une négation correcte de la copule. On dit 의사가 아니에요.",
    "가 없어요": "없어요 dirait qu’il n’y a pas de médecin. Tu nies ici la profession d’une personne : 의사가 아니에요.",
  },
  "not-coffee": {
    "이 아니에요": "이 convient après un 받침. 커피 se termine par une voyelle : 커피가 아니에요.",
    "안 이에요": "안 이에요 ne sert pas à nier une identification. Pour dire que cette boisson n’est pas du café : 커피가 아니에요.",
    "가 없어요": "커피가 없어요 signifie qu’il n’y a pas de café. Ici, la boisson est présente mais ce n’est pas du café : 커피가 아니에요.",
  },
  "not-book": {
    "가 아니에요": "가 s’emploie après une voyelle. 책 finit par le 받침 ㄱ : 책이 아니에요.",
    "안 예요": "안 예요 n’est pas la négation de la copule. Après 책, on utilise 이 아니에요.",
    "이 없어요": "책이 없어요 indique l’absence de livre. Tu corriges ici l’identité de l’objet : 책이 아니에요.",
  },
  "absence-vs-identity": {
    "제 가방이 없어요.": "제 가방이 없어요 signifie « je n’ai pas mon sac ». Mais ici, tu dis qu’il ne s’agit pas de ton sac : 제 가방이 아니에요.",
    "제 가방을 안 해요.": "안 해요 nie l’action de faire, pas l’identité d’un sac. Pour dire « ce n’est pas mon sac » : 제 가방이 아니에요.",
    "제 가방이 못 해요.": "못 해요 exprime l’incapacité à faire quelque chose ; un sac ne fait pas l’action ici. Il faut 제 가방이 아니에요.",
  },
};

function getStageFifteenSelectedFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (!question.conceptIds.some((id) => id === "negation-an" || id === "copula-negation-anieyo") || typeof answer !== "string") {
    return undefined;
  }
  for (const [drillId, reasons] of Object.entries(STAGE_FIFTEEN_DISTRACTOR_FEEDBACK)) {
    if (!question.id.includes("-" + drillId + "-")) continue;
    const reason = reasons[answer];
    if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
  }
  return undefined;
}

/**
 * Étape 16 : diagnostic lié à l’option sélectionnée et à l’objet demandé.
 * Une phrase alternative peut être correcte, mais ne pas correspondre à la
 * demande directe précisée par le contexte.
 */
const STAGE_SIXTEEN_DISTRACTOR_FEEDBACK: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "water-item": {
    "마셔 주세요": "물 마셔 주세요. demande à ton interlocuteur de boire de l’eau, et non de t’en apporter. Pour recevoir l’eau, dis 물 주세요.",
    "마시세요": "물 마시세요. est une instruction ou une invitation polie à boire de l’eau. Ici, c’est le serveur qui doit t’en donner : 물 주세요.",
    "있어요": "물 있어요. constate qu’il y a de l’eau ; cette affirmation ne passe pas commande. Pour la demander, dis 물 주세요.",
  },
  "receipt-item": {
    "보여 주세요": "영수증 보여 주세요. est correct pour dire « Montrez-moi le reçu ». Ici, tu veux que le vendeur te remette le papier : 영수증 주세요.",
    "보세요": "영수증 보세요. invite l’autre à regarder le reçu. Après ton paiement, c’est toi qui veux le récupérer : 영수증 주세요.",
    "있어요": "영수증 있어요. dit que le reçu est disponible ou présent ; cela ne demande pas qu’on te le remette : 영수증 주세요.",
  },
  "iced-americano-meaning": {
    "Avez-vous un americano glacé ?": "Cette question vérifierait la disponibilité de la boisson : 아이스 아메리카노 있어요? Mais 주세요 indique une commande : « Un americano glacé, s’il vous plaît. ».",
    "Je bois un americano glacé.": "Cette affirmation décrirait l’action de boire : 아이스 아메리카노 마셔요. Ici, 주세요 demande qu’on te serve la boisson : « Un americano glacé, s’il vous plaît. ».",
    "Buvez un americano glacé, s’il vous plaît.": "Tu demanderais à quelqu’un de boire : 아이스 아메리카노 마셔 주세요. Mais le client commande pour lui-même : « Un americano glacé, s’il vous plaît. ».",
  },
  "bag-direct": {
    "봉투 있어요?": "Cette question est naturelle pour vérifier si le magasin a des sacs ; elle peut même servir de demande indirecte. Mais ici, tu dois demander directement qu’on t’en donne un : 봉투 주세요.",
    "봉투 보여 주세요.": "Cette phrase correcte demande à la caissière de te montrer un sac, sans lui demander de te le remettre : 봉투 주세요.",
    "봉투 필요해요.": "Tu exprimes « J’ai besoin d’un sac », ce qui peut faire comprendre ton besoin. Pour formuler la demande directe attendue : 봉투 주세요.",
  },
  "item-request-softened": {
    "커피 있어요?": "Tu demandes « Avez-vous du café ? ». Cette question est naturelle, mais ne passe pas directement commande. Pour recevoir le café : 커피 좀 주세요.",
    "커피 마셔요.": "Cette phrase décrit le fait de boire du café ; elle ne sollicite aucune boisson auprès du serveur. Pour commander : 커피 좀 주세요.",
    "커피를 마셔 주세요.": "Tu demandes à quelqu’un de boire du café. Avec 마시다, 주세요 demande une action ; pour recevoir le café lui-même : 커피 좀 주세요.",
  },
};

function getStageSixteenSelectedFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (question.stageId !== "request-item" || typeof answer !== "string") return undefined;
  for (const [drillId, reasons] of Object.entries(STAGE_SIXTEEN_DISTRACTOR_FEEDBACK)) {
    if (!question.id.includes("-" + drillId + "-")) continue;
    const reason = reasons[answer];
    if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
  }
  return undefined;
}

/**
 * Étape 17 : les formes courtes et les nombres ordinaux n'ont pas le même
 * sens. Les corrections expliquent le nombre réellement choisi, plutôt
 * que de rappeler indistinctement la règle des classificateurs.
 */
const STAGE_SEVENTEEN_NUMBER_FEEDBACK: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "one-cup": {
    "하나": "하나 est la forme autonome de « un ». Devant 잔, elle se raccourcit en 한 : 커피 한 잔 주세요.",
    "일": "일 est le nombre sino-coréen « un », utilisé dans d’autres comptages. Pour une tasse de café, emploie le natif 한 잔.",
    "첫": "첫 잔 est grammatical : il s’agit de la première tasse d’une série. Tu commandes une seule tasse, sans préciser son rang : 한 잔.",
  },
  "two-people": {
    "둘": "둘 signifie « deux » quand le nombre est seul. Devant 명, il devient 두 : 두 명이에요.",
    "이": "이 est « deux » en sino-coréen. Pour compter deux personnes avec 명 dans cette situation, utilise le natif 두 명.",
    "둘째": "둘째 indique un rang, « deuxième », pas une quantité de deux personnes. Devant 명, dis 두 : 두 명이에요.",
  },
  "three-apples": {
    "셋": "셋 est « trois » lorsqu’on compte sans classificateur. Devant 개, on utilise sa forme courte 세 : 사과 세 개 주세요.",
    "삼": "삼 est « trois » en sino-coréen. Pour commander trois pommes avec 개 au marché, utilise le natif 세 개.",
    "셋째": "셋째 signifie « troisième » dans un ordre. Ici, tu achètes trois pommes, sans désigner la troisième : 세 개.",
  },
  "four-tickets": {
    "넷": "넷 signifie « quatre » sans classificateur. Devant 장, il prend la forme courte 네 : 표 네 장 주세요.",
    "사": "사 est le « quatre » sino-coréen. Pour compter quatre billets avec 장, emploie le natif 네 장.",
    "넷째": "넷째 signifie « quatrième » et indique un rang. Tu veux quatre billets, pas le quatrième billet : 네 장.",
  },
  "standalone-three-context": {
    "세": "세 est la forme courte de « trois » devant un classificateur, comme 세 개. Dans la suite 하나, 둘, ... sans nom, dis 셋.",
    "삼": "삼 exprime « trois » dans la numération sino-coréenne. Ici, tu récites les nombres natifs 하나, 둘, 셋.",
    "세 번째": "세 번째 signifie « le troisième », c’est un rang. Pour dire simplement « trois » dans une suite de comptage, utilise 셋.",
  },
};

/** Étape 17 : chaque unité incorrecte est rapportée à l’objet réel. */
const STAGE_SEVENTEEN_CLASSIFIER_FEEDBACK: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "coffee-cup": {
    "개": "개 peut compter un café comme article vendu : 커피 한 개 peut être naturel dans un autre contexte. Mais ici tu comptes précisément une tasse servie, donc 한 잔.",
    "명": "명 compte des personnes. Une tasse de café n’est pas une personne : pour une boisson servie, utilise 잔.",
    "장": "장 compte des objets plats, comme des billets ou des feuilles. Tu commandes une tasse de café : il faut 잔.",
  },
  "people-count-phrase": {
    "두 개예요.": "Cette phrase dirait « Il y en a deux », en comptant des objets ou unités avec 개. Le serveur demande le nombre de personnes de ton groupe : 두 명이에요.",
    "두 잔이에요.": "잔 compte des verres ou des tasses : « deux boissons ». Tu indiques au serveur que vous êtes deux personnes, donc 두 명이에요.",
    "두 장이에요.": "장 compte des billets ou des feuilles : « deux objets plats ». Ici, tu comptes deux personnes, donc 두 명이에요.",
  },
  "ticket-count": {
    "개": "표 두 개 peut servir à compter deux billets comme unités générales, ce n’est pas forcément incorrect. Pour des billets comptés comme supports plats, la forme précise est 표 두 장.",
    "명": "명 compte les personnes. 표 désigne ici des billets ; pour deux billets, utilise 두 장.",
    "잔": "잔 compte les tasses et les verres de boisson, pas des billets. Au guichet, demande 표 두 장.",
  },
  "apple-count": {
    "명": "명 compte des personnes. Tu achètes trois pommes entières ; le classificateur usuel des fruits comme unités est 개 : 세 개.",
    "잔": "잔 compte des verres ou des tasses. Trois verres de jus ne sont pas trois pommes entières : 사과 세 개 주세요.",
    "장": "장 compte les objets plats, comme les feuilles ou les billets. Trois pommes se comptent normalement avec 개 : 세 개.",
  },
  "portion-count": {
    "개": "삼겹살 2개 pourrait désigner deux articles ou paquets, non deux portions par personne. Pour deux portions de repas, dis 삼겹살 2인분 주세요.",
    "잔": "잔 sert à compter des verres ou tasses de boisson. Le samgyeopsal est commandé ici en portions de repas : 2인분.",
    "장": "장 servirait à compter des pièces plates, par exemple deux tranches. Ici, tu veux deux portions prévues pour deux personnes : 2인분.",
  },
};

function getStageSeventeenSelectedFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (question.stageId !== "request-quantity" || typeof answer !== "string") return undefined;
  const distractors = {
    ...STAGE_SEVENTEEN_NUMBER_FEEDBACK,
    ...STAGE_SEVENTEEN_CLASSIFIER_FEEDBACK,
  };
  for (const [drillId, reasons] of Object.entries(distractors)) {
    if (!question.id.includes("-" + drillId + "-")) continue;
    const reason = reasons[answer];
    if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
  }
  return undefined;
}

/**
 * Étape 18 : chaque distracteur est diagnostiqué dans son contexte.
 * Les autres unités et numéros peuvent être corrects, mais ne désignent
 * pas le prix, la durée ou le numéro recherché dans cette question.
 */
const STAGE_EIGHTEEN_DISTRACTOR_FEEDBACK: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "price-five-thousand": {
    "오백 원": "오백 원 signifie 500 wons : 백 vaut cent. Sur l’étiquette il est écrit 5 000원, donc 오천 원 avec 천 (mille).",
    "오만 원": "오만 원 signifie 50 000 wons : 만 vaut dix mille. Le prix affiché est dix fois moins élevé : 오천 원, 5 000 wons.",
    "다섯 천 원": "Tu utilises 다섯, le « cinq » natif, devant 천. Pour lire le montant écrit 5 000원, emploie le système sino-coréen : 오천 원.",
  },
  "duration-ten-minutes": {
    "열": "열 est « dix » en nombres natifs ; 열 분 peut aussi compter dix personnes avec 분 honorifique. Ici, 분 signifie « minutes » : le nombre sino-coréen attendu est 십, soit 십 분.",
    "구": "구 est bien un nombre sino-coréen, mais il vaut neuf : 구 분 signifie neuf minutes. Le départ est annoncé dans dix minutes : 십 분.",
    "십일": "십일 est un nombre sino-coréen correct, mais il vaut onze. 십일 분 ferait partir dans onze minutes ; l’annonce indique 십 분, dix minutes.",
  },
  "line-two-route": {
    "두 호선": "두 est le « deux » natif utilisé devant certains classificateurs, comme 두 명. Une ligne de métro se numérote en sino-coréen : 2호선, lu 이호선.",
    "2번 출구": "2번 출구 désigne bien une sortie de métro, la sortie 2. Tu dois trouver la ligne 2 et non une sortie : 2호선.",
    "2번 버스": "2번 버스 est un bus portant le numéro 2. Le plan recherché est celui de la ligne 2 du métro : 2호선.",
  },
  "month-march": {
    "세 월": "세 est le nombre natif « trois » utilisé devant certains classificateurs. Pour nommer mars, troisième mois du calendrier, on utilise le sino-coréen 삼 : 3월 (삼월).",
    "삼 개월": "삼 개월 exprime une durée de trois mois ; cette expression n’est pas le nom du mois de mars. Sur le calendrier, mars s’écrit 3월 (삼월).",
    "3일": "3일 correspond au troisième jour du mois, le 3. Ici, tu cherches le troisième mois de l’année : 3월 (삼월).",
  },
  "phone-prefix-010": {
    "공이공": "공이공 lit les chiffres zéro-deux-zéro (020), pas zéro-un-zéro. Le préfixe affiché est 010 : 공일공.",
    "공십공": "Tu regroupes le chiffre du milieu en 십 (« dix »). Or un numéro de téléphone se lit chiffre par chiffre : 0-1-0 donne 공일공.",
    "공하나공": "하나 est le « un » natif utilisé pour compter. Dans ce numéro, le chiffre 1 se lit 일 : 0-1-0 se prononce 공일공.",
  },
};

function getStageEighteenSelectedFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (question.stageId !== "sino-number-contexts" || typeof answer !== "string") {
    return undefined;
  }
  for (const [drillId, reasons] of Object.entries(STAGE_EIGHTEEN_DISTRACTOR_FEEDBACK)) {
    if (!question.id.includes("-" + drillId + "-")) continue;
    const reason = reasons[answer];
    if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
  }
  return undefined;
}

/**
 * Étape 19 : correction contextualisée de chaque réponse sélectionnée.
 * « Et » et « avec » peuvent se traduire tant par 하고 que par (이)랑 ;
 * ne jamais traiter ces deux structures comme mutuellement exclusives.
 */
const STAGE_NINETEEN_DISTRACTOR_FEEDBACK: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "coffee-and-cake-direct": {
    "커피나 케이크 주세요.": "나 signifie « ou » après 커피 : tu proposes le café ou le gâteau, pas nécessairement les deux. Pour les commander ensemble, dis 커피하고 케이크 주세요.",
    "커피만 주세요.": "만 limite la commande au café : le gâteau disparaît. Tu veux recevoir les deux produits, donc 커피하고 케이크 주세요.",
    "케이크만 주세요.": "만 limite la commande au gâteau : le café disparaît. Pour obtenir le café et le gâteau ensemble, dis 커피하고 케이크 주세요.",
  },
  "bread-milk-order": {
    "빵이나 우유 주세요.": "이나, après le nom 빵 qui finit par une consonne, veut dire « ou » : le pain ou le lait. Ici, tu demandes les deux, donc 빵하고 우유 주세요.",
    "빵만 주세요.": "만 signifie « seulement » : cette phrase demande du pain sans lait. Pour commander le pain et le lait ensemble, dis 빵하고 우유 주세요.",
    "우유만 주세요.": "우유만 signifie « seulement du lait » : le pain est exclu. Pour recevoir les deux produits, dis 빵하고 우유 주세요.",
  },
  "friend-with-context": {
    "이랑": "친구 se termine par une voyelle, donc on emploie 랑 sans 이. 친구이랑 n’est pas la forme correcte : pour « avec un ami », dis 친구랑 가요.",
    "가": "친구가 가요. signifie « L’ami y va » : 가 désigne le sujet de l’action. Mais tu y vas toi-même avec cet ami, donc 친구랑 가요.",
    "만": "친구만 가요. signifie « Seul l’ami y va », avec une restriction sur qui part. Ici, l’ami t’accompagne : 친구랑 가요.",
  },
  "student-with-context": {
    "랑": "학생 finit par le 받침 ㅇ : il faut ajouter 이랑, pas 랑 tout seul. Pour « avec un étudiant », dis 학생이랑 가요.",
    "이": "학생이 가요. est une phrase correcte signifiant « L’étudiant y va » ; 이 marque le sujet. Mais tu y vas avec lui : 학생이랑 가요.",
    "만": "학생만 가요. signifie « Seul l’étudiant y va », et non que tu es accompagné de lui. Pour exprimer l’accompagnement, dis 학생이랑 가요.",
  },
  "rice-soup-order": {
    "밥이나 국 주세요.": "이나 signifie « ou » après 밥 : tu demandes du riz ou de la soupe, sans commander explicitement les deux. Ici, tu veux les deux : 밥이랑 국 주세요.",
    "밥만 주세요.": "만 signifie « seulement » : tu commandes du riz sans la soupe. Pour demander le riz et la soupe, dis 밥이랑 국 주세요.",
    "국만 주세요.": "국만 signifie « seulement de la soupe » : il manque le riz. Pour obtenir les deux aliments, dis 밥이랑 국 주세요.",
  },
};

function getStageNineteenSelectedFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (question.stageId !== "coordinate-items" || typeof answer !== "string") return undefined;
  for (const [drillId, reasons] of Object.entries(STAGE_NINETEEN_DISTRACTOR_FEEDBACK)) {
    if (!question.id.includes("-" + drillId + "-")) continue;
    const reason = reasons[answer];
    if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
  }
  return undefined;
}

/**
 * Étape 20 : chaque correction reprend la réponse effectivement choisie.
 * La différence porte selon les cas sur la finale du nom, le sens de « et »,
 * la restriction avec 만 ou le lien entre deux propositions complètes.
 */
const STAGE_TWENTY_DISTRACTOR_FEEDBACK: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "coffee-or-tea-vowel": {
    "커피이나 차 있어요?": "커피 finit par une voyelle. 이나 s’attache à un nom avec consonne finale ; après 커피, il faut 나 : 커피나 차 있어요?",
    "커피하고 차 있어요?": "Cette question demande si le café ET le thé sont disponibles : 하고 réunit les deux. Pour demander si l’un ou l’autre est disponible, dis 커피나 차 있어요?",
    "커피만 있어요?": "만 signifie « seulement ». Cette question porte sur la disponibilité du café seul et écarte le thé. Pour proposer les deux possibilités, dis 커피나 차 있어요?",
  },
  "bread-or-cake-batchim": {
    "빵나 케이크를 먹어요.": "빵 se termine par le 받침 ㅇ : 나 tout seul ne convient pas ici. Avec une consonne finale, l’alternative devient 이나 : 빵이나 케이크를 먹어요.",
    "빵하고 케이크를 먹어요.": "Cette phrase signifie que tu manges du pain ET du gâteau : 하고 réunit les deux aliments. Pour dire que tu manges l’un ou l’autre, utilise 빵이나 케이크를 먹어요.",
    "빵만 먹어요.": "만 restreint ton choix au pain : le gâteau n’est plus une possibilité. Pour exprimer « du pain ou du gâteau », dis 빵이나 케이크를 먹어요.",
  },
  "bus-or-subway-choice": {
    "버스로만 가요.": "만 signifie ici que tu y vas uniquement en bus. Mais le métro est aussi une possibilité dans la consigne : 버스나 지하철로 가요.",
    "지하철로만 가요.": "Cette phrase exclut le bus et impose seulement le métro. Pour conserver les deux moyens de transport comme options, dis 버스나 지하철로 가요.",
    "버스하고 지하철을 타요.": "하고 relie le bus ET le métro : cela suggère que tu utilises les deux. Tu veux garder un choix entre deux moyens, donc 버스나 지하철로 가요.",
  },
  "water-or-tea-choice": {
    "물하고 차를 마셔요.": "하고 signifie « et » : cette phrase dit que tu bois de l’eau et du thé. Le contexte demande une alternative, donc 물이나 차를 마셔요.",
    "물만 마셔요.": "물만 veut dire « seulement de l’eau » : le thé n’est plus une option. Pour garder le choix entre eau et thé, dis 물이나 차를 마셔요.",
    "차만 마셔요.": "차만 signifie « seulement du thé » et exclut l’eau. Ici, l’une ou l’autre boisson est possible : 물이나 차를 마셔요.",
  },
  "two-complete-questions": {
    "이나": "이나 s’attache à un nom avec consonne finale, comme 빵이나 케이크. Ici, tu relies deux questions complètes ; entre elles, utilise 아니면.",
    "하고": "하고 relie des noms correctement pour signifier « et » ou « avec ». Il ne construit pas l’alternative « ou » entre ces deux questions complètes : ici, utilise 아니면.",
    "그리고": "그리고 veut dire « et / puis » et ajoute une deuxième question. Ici, tu demandes de choisir entre partir maintenant et rester à la maison : utilise 아니면.",
  },
};

function getStageTwentySelectedFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  if (question.stageId !== "choose-alternative" || typeof answer !== "string") return undefined;
  for (const [drillId, reasons] of Object.entries(STAGE_TWENTY_DISTRACTOR_FEEDBACK)) {
    if (!question.id.includes("-" + drillId + "-")) continue;
    const reason = reasons[answer];
    if (reason) return "Tu as choisi " + quoted(answer) + " : " + reason;
  }
  return undefined;
}

/** Nuances de choix qui restent ambiguës avec une règle générale. */
function getAdvancedSelectedFeedback(
  question: GrammarPracticeQuestion,
  selected: string,
  expected: string,
): string | undefined {
  if (question.conceptIds.includes("restrictive-man")) {
    if (question.id.includes("sentence-seat-only")) {
      const reasons: Readonly<Record<string, string>> = {
        "자리가 하나 있어요.": "Cette phrase annonce simplement une place disponible, sans insister sur le fait qu’il n’en reste qu’une seule.",
        "자리도 하나 있어요.": "도 signifie « aussi » : tu ajoutes une place à d’autres éléments, au lieu d’exprimer la seule place restante.",
        "자리 두 개만 있어요.": "두 개 signifie deux unités. Or le serveur annonce une seule place : 하나만.",
      };
      if (reasons[selected]) return "Tu as choisi " + quoted(selected) + " : " + reasons[selected] + " Ici, " + expected;
    }
    if (question.id.includes("meaning-bread-only")) {
      const reasons: Readonly<Record<string, string>> = {
        "Il y a aussi du pain.": "« aussi » correspondrait à 도, tandis que 빵만 limite la disponibilité au pain.",
        "Le pain est délicieux.": "맛있어요 décrirait le goût. Ici, 있어요 indique la disponibilité et 만 signifie « seulement ».",
        "Y a-t-il du pain ou du riz ?": "Il faudrait une question avec « ou » ; 빵만 있어요 est une affirmation qui signifie « il n’y a que du pain ».",
      };
      if (reasons[selected]) return "Tu as choisi " + quoted(selected) + " : " + reasons[selected];
    }
    if (question.id.includes("one-only-order") && Array.isArray(question.answer)) {
      const tokens = selected.split(" ");
      const expectedTokens = question.answer;
      if (tokens.at(-1) !== expectedTokens.at(-1)) {
        return "Tu as placé " + quoted(selected) + ". Le verbe 있어요 doit terminer cette affirmation ; garde 한 잔만 avant lui : " + expected + ".";
      }
      return "Tu as placé " + quoted(selected) + ". Pour une phrase neutre, 지금 introduit le moment, puis 한 잔만 limite la quantité, avant le verbe 있어요 : " + expected + ".";
    }
  }

  if (question.conceptIds.includes("past-ass-eosseoyo") && selected === "보았을 거예요") {
    return "Tu as choisi " + quoted(selected) + " : cette forme exprime une supposition sur une action passée, plutôt qu’un simple passé constaté. Pour « j’ai vu », dis " + expected + ".";
  }

  if (question.conceptIds.includes("classifiers-basic")) {
    const counterMeanings: Readonly<Record<string, string>> = {
      "개": "compte des objets génériques",
      "명": "compte des personnes",
      "잔": "compte des verres ou tasses",
      "장": "compte les objets plats, comme les billets",
      "인분": "compte les portions de nourriture",
    };
    const expectedMeanings: Readonly<Record<string, string>> = {
      "개": "des pommes comme unités",
      "명": "des personnes",
      "잔": "une boisson servie en tasse ou verre",
      "장": "des billets",
      "인분": "des portions de repas",
    };
    if (counterMeanings[selected] && expectedMeanings[expected]) {
      return "Tu as choisi " + quoted(selected) + " : ce compteur " + counterMeanings[selected] + ". Ici, tu comptes " + expectedMeanings[expected] + ", donc il faut " + expected + ".";
    }
  }

  return undefined;
}

function selectedSpecificFallback(
  question: GrammarPracticeQuestion,
  selected: string,
  expected: string,
): string | undefined {
  const conceptId = question.conceptIds[0];
  const aspect = question.ruleAspect ?? "";
  const choice = quoted(selected);
  const expectedBare = expected.replace(/[.?!]+$/u, "");

  if (conceptId === "sentence-order") {
    if (aspect === "predicate-final") {
      return `Avec ${choice}, le verbe n’est plus à la fin. En coréen, garde-le en dernier : ${expected}`;
    }
    if (aspect === "subject-omission") {
      if (selected.includes("저는")) {
        return `Dans ${choice}, tu répètes « moi », alors que la question le rend déjà évident. La réponse la plus naturelle est simplement ${expected}`;
      }
      return `Dans ${choice}, un complément arrive après le verbe. Ici, on ne répète pas le sujet et on garde le verbe à la fin : ${expected}`;
    }
  }

  if (conceptId === "copula-ieyo-yeyo") {
    if (selected === "예요") {
      return `${choice} s’emploie après une voyelle. Ici, le nom finit par un 받침 : il prend ${expected}.`;
    }
    if (selected === "이에요") {
      return `${choice} s’emploie après un 받침. Ici, le nom finit par une voyelle : il prend ${expected}.`;
    }
  }

  if (
    conceptId === "alternative-ina-animyeon" &&
    aspect === "clause-alternative"
  ) {
    if (selected === "지만") {
      return `${choice} veut dire « mais ». Ici, tu proposes deux possibilités avec « ou sinon », donc il faut ${expected}.`;
    }
    if (selected === "이나") {
      return `${choice} s’attache à un nom pour dire « ou ». Ici, tu relies deux phrases complètes avec « ou sinon » : ${expected}.`;
    }
  }

  if (
    conceptId === "question-mwo-nugu-myeot" ||
    conceptId === "interrogatives-basic"
  ) {
    const meaning = interrogativeMeanings[selected];
    const need = interrogativeNeeds[aspect];
    if (meaning && need) {
      return `${choice} ${meaning}. Ici, tu demandes ${need}.`;
    }
  }

  if (conceptId === "demonstratives-i-geu-jeo") {
    const meanings: Readonly<Record<string, string>> = {
      이: "s’emploie devant un nom proche de toi",
      그: "s’emploie devant un nom proche de l’autre personne ou déjà évoqué",
      저: "s’emploie devant un nom loin de vous deux",
      이거: "désigne un objet proche de toi",
      그거: "désigne un objet proche de l’autre personne ou déjà évoqué",
      저거: "désigne un objet loin de vous deux",
      거기: "désigne un lieu proche de l’autre personne, pas un objet",
      저기: "désigne un lieu éloigné, pas un objet ni un nom placé derrière",
    };
    const expectedContext =
      aspect === "near-speaker"
        ? "l’objet est proche de toi"
        : aspect === "near-listener"
          ? "l’objet est proche de l’autre personne"
          : "l’objet est loin de vous deux";
    return `${choice} ${meanings[selected]}. Ici, ${expectedContext} : il faut ${expected}.`;
  }

  if (conceptId === "topic-eun-neun" && ["은", "는"].includes(selected)) {
    const ending = aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
    return `${choice} marque bien le thème, mais pas après ${ending}. Ici, on met ${expected}.`;
  }

  if (conceptId === "subject-i-ga") {
    if (["이", "가"].includes(selected)) {
      const ending =
        aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
      return `${choice} marque bien le sujet, mais pas après ${ending}. Ici, on met ${expected}.`;
    }
    if (["을", "를"].includes(selected)) {
      return `${choice} marque l’objet. Ici, ce nom est le sujet, donc il prend ${expected}.`;
    }
  }

  if (conceptId === "object-eul-reul") {
    if (["을", "를"].includes(selected)) {
      const ending =
        aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
      return `${choice} marque bien l’objet, mais pas après ${ending}. Ici, on met ${expected}.`;
    }
    if (["이", "가"].includes(selected)) {
      return `${choice} marque le sujet. Ici, l’action porte sur ce nom : c’est l’objet, donc il prend ${expected}.`;
    }
  }

  if (conceptId === "existence-isseoyo-eopseoyo") {
    const meanings: Readonly<Record<string, string>> = {
      있어요: "dit que quelque chose existe ou est disponible",
      없어요: "dit que quelque chose est absent ou indisponible",
      아니에요: "sert à dire « ce n’est pas », pas « il n’y en a pas »",
      해요: "veut dire « faire », pas « il y a »",
      "안 해요": "veut dire « ne pas faire », pas « il n’y a pas »",
      "가 없어요": "dirait que le café est absent",
      "가 있어요": "dirait que le café est présent",
      "를 안 해요":
        "nie une action avec 안, alors qu’il n’y a pas d’action ici",
    };
    const need =
      aspect === "existence"
        ? "on dit que la chose est disponible, ou on le vérifie"
        : aspect === "absence"
          ? "on dit que la chose est absente"
          : "la boisson existe bien, mais on dit que ce n’est pas celle-ci";
    return `${choice} ${meanings[selected]}. Ici, ${need}, donc il faut ${expected}.`;
  }

  if (
    [
      "location-e",
      "action-location-eseo",
      "destination-time-e",
      "direction-means-ro-euro",
      "additive-do",
      "restrictive-man",
      "range-buteo-kkaji",
      "noun-link-hago-irang",
      "alternative-ina-animyeon",
    ].includes(conceptId)
  ) {
    if (
      [
        "은",
        "는",
        "이",
        "가",
        "을",
        "를",
        "로",
        "으로",
        "에",
        "에서",
        "부터",
        "까지",
        "동안",
        "도",
        "만",
        "하고",
        "이나",
        "나",
        "이랑",
        "랑",
      ].includes(selected)
    ) {
      if (
        conceptId === "direction-means-ro-euro" &&
        ((selected === "으로" && expected === "로") ||
          (selected === "로" && expected === "으로"))
      ) {
        const ending =
          expected === "로"
            ? aspect === "means-rieul"
              ? "ㄹ, qui suit exceptionnellement la variante 로"
              : "une voyelle, sans 받침, qui prend 로"
            : "un 받침 autre que ㄹ, qui prend 으로";
        return `${choice} donne bien la direction ou le moyen, mais pas avec cette fin de mot. Le nom finit par ${ending}.`;
      }
      if (
        conceptId === "noun-link-hago-irang" &&
        ((selected === "이랑" && expected === "랑") ||
          (selected === "랑" && expected === "이랑"))
      ) {
        const ending = expected === "랑" ? "une voyelle, sans 받침" : "un 받침";
        return `${choice} veut bien dire « et / avec », mais pas après ${ending}. Ici, on met ${expected}.`;
      }
      if (
        conceptId === "alternative-ina-animyeon" &&
        ((selected === "이나" && expected === "나") ||
          (selected === "나" && expected === "이나"))
      ) {
        const ending = expected === "나" ? "une voyelle, sans 받침" : "un 받침";
        return `${choice} veut bien dire « ou » entre deux noms, mais pas après ${ending}. Ici, on met ${expected}.`;
      }
      let need = `ici, on utilise ${expected}`;
      if (conceptId === "location-e")
        need = `avec 있어요, le lieu prend ${expected}`;
      if (conceptId === "action-location-eseo")
        need = `l’action se passe dans ce lieu, donc il prend ${expected}`;
      if (conceptId === "destination-time-e")
        need =
          aspect === "time"
            ? `c’est une heure précise, donc il faut ${expected}`
            : `c’est le point d’arrivée, donc il faut ${expected}`;
      if (conceptId === "direction-means-ro-euro")
        need = `tu indiques une direction ou un moyen, donc il faut ${expected}`;
      if (conceptId === "additive-do")
        need = `cet élément s’ajoute à un autre, donc il faut ${expected}`;
      if (conceptId === "restrictive-man")
        need = `tu exclus tout le reste, donc il faut ${expected}`;
      if (conceptId === "range-buteo-kkaji")
        need =
          aspect === "range-start"
            ? `c’est le début de la période, donc il faut ${expected}`
            : `c’est la fin de la période, donc il faut ${expected}`;
      if (conceptId === "noun-link-hago-irang")
        need = `tu réunis les deux noms avec « et / avec », donc il faut ${expected}`;
      if (conceptId === "alternative-ina-animyeon")
        need = `tu choisis entre deux options, donc il faut ${expected}`;
      return `${choice} ${particleRoles[selected]}. Mais ${need}.`;
    }
  }

  if (conceptId === "present-a-eoyo") {
    const reasons: Readonly<Record<string, string>> = {
      먹아요: "ajoute -아요, mais la dernière voyelle de 먹- appelle -어요",
      가어요: "ne fait pas la contraction de 가- + -아요, qui donne 가요",
      마시요: "omet -어- : ㅅㅣ + 어 se contracte en 셔",
      공부하요:
        "ne fait pas la contraction de 하다, dont le présent poli est 해요",
      읽아요: "ajoute -아요, mais la dernière voyelle de 읽- appelle -어요",
    };
    if (reasons[selected])
      return `${choice} ${reasons[selected]}. On obtient donc ${expected}.`;
  }

  if (conceptId === "possession-ui-je-nae" && aspect === "possession-ui") {
    if (selected === "제") {
      return `${choice} signifie « mon » en registre poli. Mais ici, le sac est celui de l’ami : on relie 친구 à 가방 avec 의.`;
    }
    if (selected === "내") {
      return `${choice} signifie « mon » en registre familier. Mais ici, le sac est celui de l’ami : on relie 친구 à 가방 avec 의.`;
    }
    if (selected === "가") {
      return `${choice} marque le sujet. Ici, on veut dire « le sac de l’ami », donc il faut 의 entre 친구 et 가방.`;
    }
  }

  if (conceptId === "copula-negation-anieyo") {
    if (selected.includes("없어요")) {
      return `${choice} dit qu’une chose n’existe pas ou qu’on ne l’a pas. Ici, elle existe : on dit simplement que ce n’est pas la bonne avec ${expectedBare}.`;
    }
    if (selected.includes("안 ")) {
      return `${choice} utilise 안 comme avec un verbe d’action. Pour dire « ce n’est pas », on met le nom devant 이/가 아니에요 : ${expectedBare}.`;
    }
    if (selected.includes("못 ")) {
      return `${choice} veut dire qu’on ne peut pas faire une action. Ici, on dit que ce n’est pas ce sac : ${expectedBare}.`;
    }
    if (selected === "이 아니에요" || selected === "가 아니에요") {
      const ending =
        aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
      return `${choice} veut bien dire « ce n’est pas », mais la particule ne va pas après ${ending}. Ici, on met ${expected}.`;
    }
  }

  if (conceptId === "request-n-juseyo") {
    if (aspect === "item-request-choice" && selected.includes("있어요")) {
      return `${choice} demande si le café existe. Ici, tu veux le commander : nom + 주세요, donc ${expected}`;
    }
    if (aspect === "item-request-choice" && selected.endsWith("마셔요.")) {
      return `${choice} affirme que quelqu’un boit le café. Ici, tu veux le recevoir : il faut commander avec ${expected}`;
    }
    if (
      aspect === "item-request-choice" &&
      selected.endsWith("주세요.") &&
      selected !== expected
    ) {
      return `${choice} demande à quelqu’un de boire le café. Ici, tu veux recevoir l’objet : ${expected}`;
    }
    if (aspect === "item-vs-action" && selected === "있어요") {
      return `${choice} demande si la porte existe, ou dit qu’elle existe. Ici, tu veux que l’employé l’ouvre : ${expected}.`;
    }
    if (selected === "있어요") {
      return `${choice} demande si l’objet existe, ou dit qu’il existe. Ici, tu veux qu’on te le donne : nom + 주세요.`;
    }
    if (selected !== "주세요" && /주세요$/u.test(selected)) {
      return `${choice} demande à l’autre personne de faire une action. Ici, tu commandes directement l’objet : ${expected}.`;
    }
    if (/세요$/u.test(selected)) {
      return `${choice} donne une instruction polie. Ici, tu veux recevoir l’objet, donc tu demandes ${expected}.`;
    }
  }

  if (conceptId === "native-numbers") {
    if (["하나", "둘", "셋", "넷"].includes(selected)) {
      const isStandalone = aspect === "standalone-native-number";
      return isStandalone
        ? `${choice} s’emploie seul, mais ici on demande le nombre trois : il faut ${expected}.`
        : `${choice} s’emploie seul. Devant un compteur, on le raccourcit en ${expected}.`;
    }
    if (["한", "두", "세", "네"].includes(selected)) {
      return `${choice} s’emploie devant un compteur. Ici, il n’y en a pas : on garde la forme complète ${expected}.`;
    }
    if (["일", "이", "삼", "사"].includes(selected)) {
      return `${choice} est un nombre sino-coréen. Pour compter ici, on utilise le nombre coréen natif ${expected}.`;
    }
    if (/[첫째번째]$/u.test(selected) || selected.includes(" 번째")) {
      return `${choice} indique un rang, comme « premier » ou « deuxième ». Ici, on demande combien il y en a : ${expected}.`;
    }
  }

  if (conceptId === "classifiers-basic") {
    const meanings: Readonly<Record<string, string>> = {
      개: "compte des objets ou unités de façon générique",
      명: "compte des personnes dans le registre courant",
      잔: "compte des tasses ou verres de boisson",
      장: "compte des objets plats, comme des feuilles ou des billets",
      인분: "compte des portions prévues pour un nombre de personnes",
    };
    return `${choice} ${meanings[selected]}. Ici, tu comptes autre chose, donc il faut ${expected}.`;
  }

  if (conceptId === "sino-korean-numbers") {
    const reasons: Readonly<Record<string, string>> = {
      "오백 원": "signifie 500 wons, pas 5 000",
      "오만 원": "signifie 50 000 wons, pas 5 000",
      "다섯 천 원":
        "mélange le nombre natif 다섯 avec l’unité sino-coréenne 천",
      "천 원": "signifie 1 000 wons, pas 10 000",
      "십만 원": "signifie 100 000 wons, pas 10 000",
      "열 천 원": "mélange le nombre natif 열 avec l’unité sino-coréenne 천",
      "두 호선":
        "emploie le nombre natif attributif 두 ; une ligne de métro se numérote en sino-coréen",
      "이 개":
        "signifie « deux objets/unités » avec le classificateur 개, pas « ligne 2 »",
      "2명":
        "signifie « deux personnes » avec le classificateur 명, pas « ligne 2 »",
      "세 월":
        "emploie le nombre natif 세 ; les mois du calendrier prennent un numéro sino-coréen",
      "삼 개월": "signifie une durée de trois mois, pas le mois de mars",
      "3일": "désigne le troisième jour du mois, pas le mois de mars",
      영십영:
        "regroupe les chiffres autour de 십 au lieu de les lire séparément",
      하나열하나:
        "emploie les nombres natifs et ne lit pas les chiffres du téléphone séparément",
      공하나공:
        "mélange 공 avec le nombre natif 하나 ; les chiffres se lisent dans un seul système",
    };
    return `${choice} ${reasons[selected]}. Ici, on dit ${expected}.`;
  }

  if (conceptId === "polite-instruction-euseyo") {
    if (/주세요$/u.test(selected)) {
      return `${choice} est possible pour demander un service. Ici, tu donnes plutôt un ordre ou une invitation à l’impératif poli : ${expected}.`;
    }
    if (/^[앉읽].*세요$/u.test(selected) && !selected.includes("으")) {
      return `${choice} omet 으 après un radical avec 받침. L’impératif poli se forme ici avec ${expected}.`;
    }
    if (/^가으|오으/u.test(selected)) {
      return `${choice} ajoute 으 après un radical terminé par une voyelle. Dans ce cas, -세요 s’attache directement : ${expected}.`;
    }
    if (/까요$/u.test(selected)) {
      return `${choice} propose de faire quelque chose ensemble. Ici, tu donnes un ordre ou une invitation à l’impératif poli : ${expected}.`;
    }
    if (/요$/u.test(selected)) {
      return `${choice} est poli, mais ne forme pas l’impératif. Le professeur dira ${expected}.`;
    }
  }

  if (conceptId === "range-buteo-kkaji" && aspect === "limit-only") {
    const role = particleRoles[selected];
    return `${choice} ${role}. Ici, la gare est la limite finale du trajet, « jusqu’à la gare » : il faut ${expected}.`;
  }

  if (conceptId === "past-ass-eosseoyo") {
    const reasons: Readonly<Record<string, string>> = {
      먹았어요: "emploie -았어요, mais la voyelle de 먹- appelle -었어요",
      가었어요: "ne contracte pas 가- + -았어요 en 갔어요",
      공부하었어요: "ne contracte pas 하었어요 en 했어요",
      마샀어요:
        "forme incorrectement le passé de 마시다 ; 마셔요 devient 마셨어요",
    };
    if (reasons[selected])
      return `${choice} ${reasons[selected]}. On dit donc ${expected}.`;
  }

  if (conceptId === "condition-eumyeon" && aspect === "sufficiency") {
    if (selected.includes("면 가요")) {
      return `${choice} veut simplement dire « si…, aller ». Pour dire « il suffit de… », on utilise -(으)면 돼요 : ${expected}.`;
    }
    if (selected.includes("서 돼요")) {
      return `${choice} utilise -아/어서, qui donne une raison. Ici, tu veux dire « il suffit de… » avec -(으)면 돼요 : ${expected}.`;
    }
    if (selected.includes("지만 돼요")) {
      return `${choice} utilise « mais ». Ici, tu veux dire « il suffit de… » avec -(으)면 돼요 : ${expected}.`;
    }
  }

  if (conceptId === "obligation-a-eoya-haeyo" && aspect === "nominal-need") {
    if (selected.includes("야 해요")) {
      return `${choice} dit qu’il faut montrer quelque chose. Ici, on dit simplement que le passeport est nécessaire : 필요해요.`;
    }
    if (selected.includes("도 돼요")) {
      return `${choice} dit que c’est permis. Ici, on dit que le passeport est nécessaire : ${expected}.`;
    }
    if (selected.includes("수 있어요")) {
      return `${choice} dit qu’on peut faire quelque chose. Ici, on dit que le passeport est nécessaire : ${expected}.`;
    }
  }

  if (conceptId === "obligation-a-eoya-haeyo" && selected === "필요해요") {
    return `${choice} dit qu’une chose est nécessaire. Ici, l’agent te dit ce que tu dois faire : montrer le passeport, donc ${expected}.`;
  }

  if (conceptId === "comparison-boda-deo-jeil") {
    const meanings: Readonly<Record<string, string>> = {
      보다: "suit l’élément de référence d’une comparaison",
      더: "forme un comparatif, « plus / davantage »",
      제일: "forme un superlatif dans un groupe, « le plus »",
      만: "signifie « seulement » et exprime une restriction",
      도: "signifie « aussi » et exprime une addition",
      에: "marque notamment un lieu, une destination ou un moment",
    };
    const need =
      aspect === "superlative"
        ? `tu compares au moins trois éléments, donc il faut le superlatif ${expected}`
        : expected === "더"
          ? `tu compares seulement deux éléments, donc il faut ${expected}`
          : `ce nom sert de point de comparaison et prend ${expected}`;
    return `${choice} ${meanings[selected]}. Ici, ${need}.`;
  }

  if (conceptId === "honorific-si" && aspect === "honorific-lexicon") {
    if (selected === "개" || selected === "잔") {
      const referent =
        selected === "개" ? "des objets génériques" : "des tasses ou verres";
      return `${choice} compte ${referent}, pas des personnes. Pour compter respectueusement les clients, il faut 분.`;
    }
    if (selected === "말씀") {
      return `${choice} est le mot honorifique pour les paroles de quelqu’un. Ici, tu demandes son nom : on dit 성함.`;
    }
    if (selected === "나이") {
      return `${choice} signifie « âge ». Ici, la question porte sur le nom du client : on emploie 성함.`;
    }
  }

  return undefined;
}


/**
 * Étapes 21 à 40 : explique le sens de l'option effectivement sélectionnée,
 * puis le contraste imposé par la consigne. Une forme correcte dans un autre
 * contexte n'est jamais présentée comme intrinsèquement incorrecte.
 */
const LATER_STAGE_CONCEPTS = new Set([
  "request-v-a-eo-juseyo", "polite-instruction-euseyo",
  "direction-means-ro-euro", "desire-go-sipeoyo",
  "ability-eul-su-isseoyo", "permission-a-eodo-dwaeyo",
  "inability-mot", "additive-do", "restrictive-man",
  "range-buteo-kkaji", "past-ass-eosseoyo",
  "future-eul-geoyeyo", "intention-eulgeyo", "sequence-go",
  "reason-a-eoseo", "contrast-jiman", "condition-eumyeon",
  "obligation-a-eoya-haeyo", "comparison-boda-deo-jeil",
  "suggestion-eulkkayo",
]);

function laterStageModalityMeaning(selected: string): string | undefined {
  if (/고 싶지 않아요[.?]?$/u.test(selected)) return "indique que l'on ne souhaite pas agir";
  if (/고 싶어요[.?]?$/u.test(selected)) return "exprime un souhait personnel";
  if (/수 있어요[.?]?$/u.test(selected)) return "parle d'une capacité ou d'une possibilité, pas d'une autorisation";
  if (/도 돼요[.?]?$/u.test(selected)) return "indique que l'acte est autorisé, pas forcément réalisable ni obligatoire";
  if (/야 해요[.?]?$/u.test(selected)) return "exprime une obligation";
  if (/거예요[.?]?$/u.test(selected)) return "annonce un projet ou une prévision";
  if (/게요[.?]?$/u.test(selected)) return "annonce une décision ou un engagement auprès de l'interlocuteur";
  if (/까요[.?]?$/u.test(selected)) return "demande un avis ou propose une action, au lieu de l'affirmer";
  if (/주세요[.?]?$/u.test(selected)) return "demande à l'autre de rendre un service";
  if (/세요[.?]?$/u.test(selected)) return "s'adresse directement à l'autre avec une instruction polie";
  if (/(?:았|었|했|갔|봤|왔|셨|렸)어요[.?]?$/u.test(selected)) return "situe l'action dans le passé";
  if (/^못 /u.test(selected) || /를 못 /u.test(selected)) return "exprime une impossibilité ou un empêchement";
  if (/지 않아요[.?]?$/u.test(selected)) return "est une négation longue ; elle ne précise pas à elle seule un empêchement";
  if (/^안 /u.test(selected)) return "est une négation courte ; elle ne précise pas à elle seule un empêchement";
  if (selected === "아니에요") return "nie une identité ou une qualification, pas un verbe d'action";
  if (selected === "필요해요") return "exprime le besoin d'une chose";
  if (/요[.?]?$/u.test(selected)) return "énonce un fait au présent, sans l'intention demandée";
  return undefined;
}

function laterStageConnectorMeaning(selected: string): string | undefined {
  if (/지만/u.test(selected)) return "marque un contraste (« mais »)";
  if (/(?:으)?면/u.test(selected)) return "pose une condition (« si »)";
  if (/니까/u.test(selected)) return "donne une raison (« puisque »)";
  if (/서/u.test(selected)) return "présente une cause ou une conséquence";
  if (/고$/u.test(selected)) return "relie simplement deux actions ou faits (« et »)";
  return undefined;
}

function getLaterStageSelectedFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
): string | undefined {
  const concept = question.conceptIds[0];
  if (!LATER_STAGE_CONCEPTS.has(concept)) return undefined;

  const expected = answerLabel(question.answer);
  const selected = answerLabel(answer);
  const prefix = "Tu as choisi " + quoted(selected) + " : ";
  const explain = (reason: string, target: string) =>
    prefix + reason + ". Ici, " + target + " : " + quoted(expected) + ".";

  if (Array.isArray(answer)) {
    if (concept !== "restrictive-man" || !Array.isArray(question.answer)) return undefined;
    const finalToken = question.answer.at(-1);
    if (answer.at(-1) !== finalToken) {
      return "Tu as placé " + quoted(selected) + ". Le prédicat " + finalToken +
        " doit fermer cette phrase ; " + quoted(expected) + " conserve la restriction sur 한 잔.";
    }
    return "Tu as placé " + quoted(selected) +
      ". Le verbe est final, mais 지금 doit introduire le moment, suivi de 한 잔만 (« un seul verre ») : " +
      quoted(expected) + ".";
  }
  if (typeof answer !== "string") return undefined;

  if (concept === "request-v-a-eo-juseyo") {
    if (selected === "보이세요" || selected === "보여요" || selected === "보일까요") {
      return explain("cette forme parle de visibilité ou de ce qui sera visible",
        "tu demandes au personnel de montrer quelque chose");
    }
    if (selected === "주세요") {
      return explain("주세요 seul demande une chose, sans préciser l'action",
        "l'employé doit ouvrir la porte");
    }
    if (selected === "열고 싶어요") {
      return explain("cela signifie que TOI, tu souhaites ouvrir",
        "tu demandes au personnel de le faire");
    }
    const meaning = laterStageModalityMeaning(selected);
    if (meaning) return explain(meaning, "l'autre personne doit accomplir une action pour toi");
  }

  if (concept === "polite-instruction-euseyo") {
    if (selected === "앉세요" || selected === "읽세요") {
      return explain("le radical se termine par une consonne et il manque 으 avant 세요",
        "l'impératif poli prend 으세요");
    }
    if (selected === "가으세요" || selected === "오으세요") {
      return explain("le radical se termine par une voyelle : 으 n'a pas sa place",
        "l'impératif poli prend directement 세요");
    }
    const meaning = laterStageModalityMeaning(selected);
    if (meaning) return explain(meaning, "tu formules une consigne ou une invitation en -(으)세요");
  }

  if (concept === "direction-means-ro-euro") {
    if (selected === "로" || selected === "으로") {
      const ending = expected === "로"
        ? question.ruleAspect === "means-rieul"
          ? "le nom se termine par ㄹ, exception qui impose 로"
          : "le nom se termine par une voyelle, qui impose 로"
        : "오른쪽 se termine par ㄱ, qui impose 으로";
      return explain("tu as choisi la variante qui ne convient pas à la dernière consonne",
        ending);
    }
    if (selected === "에") {
      return explain("에 marque notamment un lieu d'arrivée ; la phrase peut avoir un autre sens",
        "on doit marquer la direction ou le moyen, pas la destination");
    }
    if (selected === "에서") {
      return explain("에서 indique le lieu où une action a lieu ou son point de départ",
        "on précise le moyen ou la direction du mouvement");
    }
  }

  if (concept === "desire-go-sipeoyo" || concept === "ability-eul-su-isseoyo" ||
      concept === "permission-a-eodo-dwaeyo" || concept === "future-eul-geoyeyo" ||
      concept === "intention-eulgeyo" || concept === "suggestion-eulkkayo") {
    const goals: Readonly<Record<string, string>> = {
      "desire-go-sipeoyo": "tu exprimes ce que tu as envie de faire avec -고 싶어요",
      "ability-eul-su-isseoyo": "tu indiques une capacité ou une faisabilité réelle avec -(으)ㄹ 수 있어요",
      "permission-a-eodo-dwaeyo": "tu demandes si l'action est autorisée avec -아/어도 돼요",
      "future-eul-geoyeyo": "tu annonces un projet prévu avec -(으)ㄹ 거예요",
      "intention-eulgeyo": "tu prends une décision ou t'engages envers l'autre avec -(으)ㄹ게요",
      "suggestion-eulkkayo": "tu demandes l'avis de l'autre sur une action commune avec -(으)ㄹ까요",
    };
    const meaning = laterStageModalityMeaning(selected);
    if (meaning) return explain(meaning, goals[concept]);
  }

  if (concept === "inability-mot") {
    if (selected === "아니에요") {
      return explain("아니에요 nie une identité (« ce n'est pas »), pas une action",
        "la personne ne parvient pas à agir et utilise 못");
    }
    if (selected === "듣고 싶지 않아요") {
      return explain("cela signifie « je ne veux pas écouter »",
        "l'empêchement est physique : la personne entend mal malgré elle");
    }
    if (selected === "들을 수 있어요") {
      return explain("cela affirme au contraire que l'écoute est possible",
        "la personne n'arrive pas à bien entendre");
    }
    if (/지 않아요$/u.test(selected)) {
      return explain("c'est une négation longue qui ne met pas en avant l'incapacité",
        "une contrainte empêche l'action, d'où 못");
    }
    if (/^안 /u.test(selected)) {
      return explain("안 nie l'action sans indiquer clairement que la personne en est empêchée",
        "on exprime l'impossibilité avec 못");
    }
  }

  if (concept === "additive-do") {
    if (/^Je suis le seul/u.test(selected)) {
      return explain("tu traduis « seulement », qui correspondrait à 만",
        "저도 veut dire « moi aussi »");
    }
    if (/^Je pars, moi/u.test(selected)) {
      return explain("tu traduis un contraste, plutôt qu'une addition",
        "저도 ajoute le locuteur à quelqu'un qui part déjà");
    }
    if (/^Est-ce que/u.test(selected)) {
      return explain("tu transformes l'affirmation en question",
        "저도 가요 affirme que moi aussi j'y vais");
    }
    if (selected === "을" || /[을를] [가-힣]+요[.]?$/u.test(selected) ||
        /(?:를|을) 주세요[.]?$/u.test(selected)) {
      return explain("c'est grammaticalement correct et reste une demande neutre, sans « aussi »",
        "l'élément doit s'ajouter à un autre avec 도");
    }
    if (/만/u.test(selected)) return explain("만 signifie « seulement » et exclut les autres éléments",
      "tu ajoutes cet élément à ce qui a déjà été mentionné avec 도");
    if (/는|은/u.test(selected)) return explain("은/는 marque le thème ou un contraste, pas « aussi »",
      "l'élément s'ajoute à un autre avec 도");
  }

  if (concept === "restrictive-man") {
    // Les réponses longues et le réordonnancement possèdent déjà une analyse dédiée.
    if (question.id.includes("sentence-seat-only") || question.id.includes("meaning-bread-only")) return undefined;
    if (selected === "도") return explain("도 signifie « aussi », donc ajoute plutôt que limiter",
      "la phrase exclut toutes les autres possibilités avec 만");
    if (selected === "하고") return explain("하고 relie deux noms avec « et »",
      "la phrase ne garde qu'un élément avec 만");
    if (selected === "나" || selected === "이나") return explain("(이)나 propose une alternative (« ou »)",
      "on exprime « seulement » avec 만");
  }

  if (concept === "range-buteo-kkaji") {
    const atEnd = question.ruleAspect === "range-end" || question.ruleAspect === "limit-only";
    if (selected === "에") return explain("에 marque un moment ponctuel, pas une limite de période",
      atEnd ? "on veut fermer la plage avec 까지" : "on précise son début avec 부터");
    if (selected === "으로") return explain("으로 exprime une direction ou un moyen, pas une borne temporelle",
      "il faut le départ explicite de la période avec 부터");
    if (selected === "동안") return explain("동안 indique une durée, sans fixer à lui seul sa borne",
      atEnd ? "on marque la fin avec 까지" : "on marque le début avec 부터");
    if (selected === "에서") return explain("에서 indique notamment le lieu ou le point de départ ; il ne ferme pas ici la plage",
      "la consigne demande sa borne finale avec 까지");
    if (selected === "부터") return explain("부터 marque un début, pas la destination ou la fin",
      "la limite attendue est 까지");
  }

  if (concept === "past-ass-eosseoyo") {
    const malformed: Readonly<Record<string, string>> = {
      "먹았어요": "먹- appelle -었어요, et non -았어요",
      "가었어요": "가- + -았어요 se contracte en 갔어요",
      "공부하었어요": "하다 forme 했어요 au passé",
      "마샀어요": "마시다 forme 마셨어요, pas 마샀어요",
    };
    if (malformed[selected]) return explain(malformed[selected], "on forme le passé poli correctement");
    if (selected === "보았을 거예요") return explain("cette forme exprime une supposition sur une action passée, plutôt qu'un passé constaté",
      "on demande le passé simple de 보다");
    if (/거예요$/u.test(selected)) return explain("cela annonce l'avenir",
      "l'action s'est déjà produite et doit être au passé");
    return explain("la forme reste au présent poli", "l'action est passée, en -았/었어요");
  }

  if (concept === "inability-mot") return undefined;

  if (concept === "sequence-go" || concept === "reason-a-eoseo" ||
      concept === "contrast-jiman" || concept === "condition-eumyeon") {
    if (concept === "condition-eumyeon" && question.ruleAspect === "sufficiency") {
      if (selected.includes("면 가요")) return explain("cela veut dire « si ..., on y va », sans « il suffit de »",
        "la structure -면 돼요 indique une condition suffisante");
      if (selected.includes("서 돼요")) return explain("-아서/어서 indique une cause, pas une condition suffisante",
        "il faut -면 돼요");
      if (selected.includes("지만 돼요")) return explain("-지만 signifie « mais » et ne donne pas « il suffit de »",
        "il faut -면 돼요");
    }
    const goals: Readonly<Record<string, string>> = {
      "sequence-go": "on enchaîne deux étapes sans cause, opposition ni condition avec -고",
      "reason-a-eoseo": "la première proposition explique la cause de la seconde avec -아/어서",
      "contrast-jiman": "la deuxième proposition reste vraie malgré la première avec -지만",
      "condition-eumyeon": "la suite dépend d'une condition exprimée avec -(으)면",
    };
    const meaning = laterStageConnectorMeaning(selected);
    if (meaning) return explain(meaning, goals[concept]);
  }

  if (concept === "obligation-a-eoya-haeyo") {
    if (question.ruleAspect === "nominal-need") {
      if (selected === "있어요") return explain("여권이 있어요 constate seulement la présence du passeport",
        "il faut dire que le document est indispensable");
      if (selected === "있어도 돼요") return explain("여권이 있어도 돼요 signifie que la présence du passeport est permise",
        "il faut exprimer une nécessité, pas une permission");
      if (selected === "있을 수 있어요") return explain("여권이 있을 수 있어요 laisse seulement entendre que le passeport pourrait être présent",
        "il est exigé, et non simplement possible");
      // Anciens distracteurs : des sessions sauvegardées peuvent les contenir.
      if (selected === "보여 줘야 해요") return explain("avec 여권이, le passeport devient à tort le sujet de « montrer » ; il faudrait 여권을 pour demander de le montrer",
        "la phrase parle de la nécessité du document lui-même");
      if (selected === "볼 수 있어요") return explain("여권이 볼 수 있어요 attribuerait la capacité de voir au passeport, faute de la bonne particule",
        "c'est le passeport qui est nécessaire");
    }
    if (selected === "필요해요") return explain("여권을 필요해요 emploie ici la mauvaise particule : pour un document nécessaire, on dit 여권이 필요해요",
      "l'agent impose plutôt l'action de montrer le passeport");
    if (selected === "볼 수 있어요") return explain("여권을 볼 수 있어요 signifie que tu peux voir le passeport, pas que tu dois le montrer",
      "l'agent exige de présenter le document");
    const meaning = laterStageModalityMeaning(selected);
    if (meaning) return explain(meaning, "l'action doit obligatoirement être accomplie avec -아/어야 해요");
  }

  if (concept === "comparison-boda-deo-jeil") {
    const superlative = question.ruleAspect === "superlative";
    if (selected === "제일") return explain("제일 signifie « le plus » parmi plusieurs",
      "on ne compare que deux éléments : 더 indique « plus »");
    if (selected === "더") return explain("더 signifie « plus » dans une comparaison",
      superlative ? "on cherche « le plus » parmi plusieurs éléments" : "la phrase demande le repère de comparaison après le nom");
    if (selected === "보다") return explain("보다 suit le nom servant de repère, et non la position d'un adverbe",
      "la phrase demande le superlatif 제일");
    const comparisonGoal = expected === "보다"
      ? "le nom sert de point de référence, ce qui demande 보다"
      : expected === "더"
        ? "tu compares deux éléments avec 더 (« plus »)"
        : "tu compares plusieurs éléments avec 제일 (« le plus »)";
    if (selected === "만") return explain("만 exprime « seulement » et restreint l'élément au lieu de le comparer",
      comparisonGoal);
    if (selected === "도") return explain("도 exprime « aussi » et ajoute un élément au lieu de le comparer",
      comparisonGoal);
    if (selected === "에") return explain("에 marque notamment un lieu ou un moment, pas un repère comparatif",
      "le nom de référence doit prendre 보다");
  }

  return undefined;
}

/**
 * Builds the first sentence shown after an incorrect grammar answer.
 * The exercise explanation is the safe fallback because it names the exact
 * rule being assessed. A few high-confusion contrasts use the selected answer
 * when its grammatical value can be identified without ambiguity.
 */
export function getGrammarIncorrectFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
) {
  const selected = answerLabel(answer);
  const expected = answerLabel(question.answer);
  const expectedBare = expected.replace(/[.?!]+$/u, "");
  const conceptId = question.conceptIds[0];

  // Seule la révision finale réutilise cette banque de mots comme épreuve mixte.
  // Un verbe final ne suffit pas : le thème et l'objet doivent aussi être à la bonne place.
  if (
    question.stageId === "a1-validation" &&
    Array.isArray(answer) &&
    Array.isArray(question.answer)
  ) {
    const expectedTokens = question.answer;
    if (answer.at(-1) !== expectedTokens.at(-1)) {
      return `Dans « ${selected} », le verbe doit se placer à la fin de cette phrase neutre. Construis : « ${expected} ».`;
    }
    return `Tu as bien gardé le verbe à la fin, mais le thème et l'objet ne sont pas dans l'ordre neutre demandé. Ici : « ${expected} ».`;
  }

  const sentenceOrderFeedback = getSentenceOrderStageOneFeedback(
    question,
    answer,
  );
  if (sentenceOrderFeedback) return sentenceOrderFeedback;

  const copulaFeedback = getCopulaStageTwoFeedback(question, answer);
  if (copulaFeedback) return copulaFeedback;

  const stageThreeFeedback = getPoliteRegisterStageThreeFeedback(
    question,
    answer,
  );
  if (stageThreeFeedback) return stageThreeFeedback;

  const topicFeedback = getTopicStageFourFeedback(question, answer);
  if (topicFeedback) return topicFeedback;

  const demonstrativesFeedback = getDemonstrativesStageFiveFeedback(
    question,
    answer,
  );
  if (demonstrativesFeedback) return demonstrativesFeedback;

  const nominalQuestionsFeedback = getNominalQuestionsStageSixFeedback(
    question,
    answer,
  );
  if (nominalQuestionsFeedback) return nominalQuestionsFeedback;

  const existenceStageSevenFeedback = getExistenceStageSevenFeedback(
    question,
    answer,
  );
  if (existenceStageSevenFeedback) return existenceStageSevenFeedback;

  const locationStageEightFeedback = getLocationStageEightFeedback(
    question,
    answer,
  );
  if (locationStageEightFeedback) return locationStageEightFeedback;

  const presentActionsFeedback = getPresentActionsStageNineFeedback(
    question,
    answer,
  );
  if (presentActionsFeedback) return presentActionsFeedback;

  const objectActionsFeedback = getObjectActionsStageTenFeedback(
    question,
    answer,
  );
  if (objectActionsFeedback) return objectActionsFeedback;

  const actionLocationFeedback = getActionLocationStageElevenFeedback(question, answer);
  if (actionLocationFeedback) return actionLocationFeedback;

  const destinationFeedback = getDestinationStageTwelveFeedback(question, answer);
  if (destinationFeedback) return destinationFeedback;

  const possessionFeedback = getPossessionStageThirteenFeedback(question, answer);
  if (possessionFeedback) return possessionFeedback;

  const informationFeedback = getInformationQuestionsStageFourteenFeedback(question, answer);
  if (informationFeedback) return informationFeedback;

  const stageFifteenFeedback = getStageFifteenSelectedFeedback(question, answer);
  if (stageFifteenFeedback) return stageFifteenFeedback;

  const stageSixteenFeedback = getStageSixteenSelectedFeedback(question, answer);
  if (stageSixteenFeedback) return stageSixteenFeedback;

  const stageSeventeenFeedback = getStageSeventeenSelectedFeedback(question, answer);
  if (stageSeventeenFeedback) return stageSeventeenFeedback;

  const stageEighteenFeedback = getStageEighteenSelectedFeedback(question, answer);
  if (stageEighteenFeedback) return stageEighteenFeedback;

  const stageNineteenFeedback = getStageNineteenSelectedFeedback(question, answer);
  if (stageNineteenFeedback) return stageNineteenFeedback;

  const stageTwentyFeedback = getStageTwentySelectedFeedback(question, answer);
  if (stageTwentyFeedback) return stageTwentyFeedback;

  const laterStageFeedback = getLaterStageSelectedFeedback(question, answer);
  if (laterStageFeedback) return laterStageFeedback;

  const advancedFeedback = getAdvancedSelectedFeedback(question, selected, expected);
  if (advancedFeedback) return advancedFeedback;

  if (conceptId === "topic-eun-neun") {
    if (
      question.id.includes("drill-topic-eun-neun-je-vowel") &&
      selected === "가"
    ) {
      return "가 mettrait l’accent sur 저, par exemple pour répondre à « qui ? ». Ici, tu parles simplement de toi, donc 저는 est plus naturel : « moi, je suis étudiant ».";
    }
    if (
      question.id.includes("drill-topic-eun-neun-coffee-vowel") &&
      selected === "를"
    ) {
      return "를 est une particule d’objet et donne ici une phrase correcte : (저는) 커피를 안 마셔요, « je ne bois pas de café ». Mais elle n’apporte pas le contraste demandé avec les autres boissons ; pour cela, on dit 커피는.";
    }
    if (["이", "가"].includes(selected)) {
      return `${quoted(selected)} met l’accent sur le sujet et peut être correct dans une autre situation. Ici, ce nom est le thème dont tu parles, donc on met ${expected}.`;
    }
    if (["을", "를"].includes(selected)) {
      return `${quoted(selected)} marque l’objet et peut donner une phrase correcte avec un verbe d’action. Ici, tu poses ce nom comme thème ou tu le mets en contraste, donc on met ${expected}.`;
    }
  }

  if (question.id.includes("drill-question-mwo-nugu-myeot-what-object")) {
    if (selected === "누구") {
      return "누구 sert à demander qui est une personne. Ici, tu demandes ce qu’est un objet, donc on utilise 뭐.";
    }
    if (selected === "어디") {
      return "어디 sert à demander où se trouve quelque chose. Ici, tu demandes ce qu’est l’objet, donc on utilise 뭐.";
    }
    if (selected === "몇") {
      return "몇 sert à demander combien. Ici, tu demandes ce qu’est l’objet, donc on utilise 뭐.";
    }
  }

  if (question.id.includes("drill-question-mwo-nugu-myeot-who-person")) {
    if (selected === "몇") {
      return "몇 sert à demander combien. Ici, tu demandes qui est la personne, donc on utilise 누구.";
    }
    if (selected === "뭐") {
      return "뭐 sert à demander ce qu’est une chose. Ici, tu demandes qui est cette personne, donc on utilise 누구.";
    }
    if (selected === "어디") {
      return "어디 sert à demander où. Ici, tu demandes qui est la personne, pas où elle se trouve, donc on utilise 누구.";
    }
  }

  if (conceptId === "subject-i-ga" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} est possible si tu veux parler de ce nom comme thème ou le mettre en contraste. Ici, tu présentes simplement le sujet, donc on met ${expected}.`;
  }

  if (conceptId === "object-eul-reul" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} est possible si tu veux mettre l’objet en contraste. Ici, tu le présentes simplement comme l’objet de l’action, donc on met ${expected}.`;
  }

  if (conceptId === "copula-ieyo-yeyo" && selected === "아니에요") {
    return `${quoted(selected)} veut dire « ce n’est pas ». Ici, tu confirmes au contraire ce qu’est la personne ou l’objet, donc il faut ${expected}.`;
  }

  if (conceptId === "alternative-ina-animyeon" && selected === "하고") {
    if (question.ruleAspect === "clause-alternative") {
      return `${quoted(selected)} relie des noms avec le sens « et ». Ici, tu relies deux phrases avec « ou sinon », donc on emploie ${expected}.`;
    }
    return `${quoted(selected)} relie correctement les deux noms, mais avec le sens « et ». Ici, tu veux dire « ou », donc il faut ${expected}.`;
  }

  if (
    conceptId === "noun-link-hago-irang" &&
    ["이나", "나"].includes(selected)
  ) {
    return `${quoted(selected)} conviendrait pour dire « ou ». Ici, tu réunis les deux éléments avec « et », donc il faut ${expected}.`;
  }

  if (
    conceptId === "native-numbers" &&
    question.ruleAspect === "attributive-native-number" &&
    selected === "첫"
  ) {
    return "첫 잔 veut dire « la première tasse » d’une série. Ici, tu demandes simplement une tasse : on dit 한 잔.";
  }

  if (
    ["drink-classifier", "flat-classifier", "portion-classifier"].includes(
      question.ruleAspect ?? "",
    ) &&
    selected === "개"
  ) {
    return `${quoted(selected)} est un compteur général. Ici, il existe un compteur plus précis : ${expected}.`;
  }

  if (question.ruleAspect === "short-negation") {
    if (selected.endsWith("지 않아요")) {
      return `${quoted(selected)} est correct, mais c’est la forme longue. Ici, on veut la forme courte avec 안 : ${expected}.`;
    }
    if (selected.startsWith("못 ")) {
      if (expected.includes("매워요")) {
        return `${quoted(selected)} sert normalement à dire qu’on ne peut pas faire une action. 맵다 décrit le plat : pour dire qu’il n’est pas épicé, on dit 안 매워요.`;
      }
      return `${quoted(selected)} veut dire que la personne ne peut pas agir. Ici, elle choisit de ne pas le faire, donc on utilise 안.`;
    }
    if (selected === "아니에요") {
      return "아니에요 sert à dire « ce n’est pas ». Ici, tu nies directement le verbe ou l’adjectif avec 안.";
    }
  }

  if (question.ruleAspect === "daily-polite") {
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, tu parles au présent et dans le style poli courant en -요 : ${expectedBare}.`;
    }
    if (/니다\.?$/u.test(selected)) {
      return `${quoted(selected)} est au registre formel. Dans cette conversation quotidienne, le style poli courant en -요 est plus naturel.`;
    }
    if (!/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est familier. Ici, garde le ton poli avec une forme en -요.`;
    }
  }

  if (
    ["present-eoyo", "present-ayo", "present-haeyo"].includes(
      question.ruleAspect ?? "",
    )
  ) {
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, l’action est au présent, dans le style poli courant.`;
    }
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce une action future. Ici, tu parles de ce qui se passe maintenant, au présent poli.`;
    }
  }

  if (question.ruleAspect?.startsWith("past-")) {
    if (selected === "마샀어요") {
      return `${quoted(selected)} n’est pas le passé de 마시다. À partir de 마셔요, on forme 마셨어요.`;
    }
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} place l’action dans le futur. Mais elle est déjà terminée, donc il faut le passé en -았/었어요.`;
    }
    if (/요\.?$/u.test(selected) && !isPolitePast(selected)) {
      return `${quoted(selected)} est au présent. L’action est déjà terminée, donc il faut le passé en -았/었어요.`;
    }
  }

  if (
    question.ruleAspect === "future-batchim" ||
    question.ruleAspect === "future-no-batchim"
  ) {
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce à l’autre personne ce que tu décides de faire. Ici, le projet est déjà prévu, donc on utilise -(으)ㄹ 거예요.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, tu annonces un projet futur.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est au présent. Pour parler de ce projet futur, utilise -(으)ㄹ 거예요.`;
    }
  }

  if (question.ruleAspect === "polite-my" && selected === "내") {
    return "내 est la façon familière de dire « mon ». Ici, tu parles poliment, donc utilise 제.";
  }
  if (question.ruleAspect === "polite-my" && selected === "저") {
    return "저 signifie « je » dans un registre humble, mais pas « mon ». Pour dire « mon » poliment, utilise 제.";
  }
  if (question.ruleAspect === "polite-my" && selected === "제가") {
    return "제가 veut dire « je » avec la particule 가. Devant ce qui t’appartient, il faut 제 pour dire « mon ».";
  }
  if (question.ruleAspect === "casual-my" && selected === "제") {
    return "제 est poli et humble. Entre amis proches, avec une phrase familière en -이야, on dit 내.";
  }
  if (
    question.ruleAspect === "casual-my" &&
    (selected === "나" || selected === "제가")
  ) {
    return `${quoted(selected)} veut dire « je », pas « mon ». Pour dire « mon » familièrement, on emploie 내.`;
  }

  if (
    selected === "입니다" &&
    (question.ruleAspect === "batchim" || question.ruleAspect === "no-batchim")
  ) {
    return "입니다 est correct, mais plus formel. Ici, utilise le style poli courant : 이에요 après une consonne et 예요 après une voyelle.";
  }
  if (selected === "이예요") {
    return "이예요 n’est pas la forme standard. Après une consonne, on dit 이에요 ; après une voyelle, 예요.";
  }

  if (question.ruleAspect === "honorific-present") {
    if (selected === "와요") {
      return "와요 est poli avec la personne à qui tu parles, mais n’honore pas le professeur. Pour parler de lui avec respect, ajoute -시- : 오세요.";
    }
    if (selected === "오셨어요") {
      return "오셨어요 est honorifique, mais au passé. L’arrivée a lieu maintenant : il faut le présent 오세요.";
    }
    if (selected === "오실 거예요") {
      return "오실 거예요 est honorifique, mais annonce une arrivée future. Ici, le professeur arrive maintenant : 오세요.";
    }
  }
  if (question.ruleAspect === "honorific-lexicon") {
    if (selected === "명") {
      return "명 est le compteur courant pour les personnes. Ici, on parle respectueusement aux clients, donc on choisit 분.";
    }
    if (selected === "있어요") {
      return "있어요 est poli, mais ne montre pas de respect particulier envers le professeur. Pour dire qu’il est là, on emploie 계세요.";
    }
    if (selected === "계셨어요" || selected === "계실 거예요") {
      return `${quoted(selected)} honore bien le professeur, mais le temps ne convient pas. Comme il est là maintenant, on dit 계세요.`;
    }
    if (selected === "이름") {
      return "이름 est le mot courant pour « nom ». Dans cette demande respectueuse, le terme honorifique est 성함.";
    }
  }
  if (question.ruleAspect === "honorific-request") {
    if (selected === "말해요") {
      return "말해요 est trop direct pour cette demande très respectueuse. Pour demander poliment de répéter, dis 말씀해 주시겠어요?";
    }
    if (selected === "말씀하세요") {
      return "말씀하세요 reste une instruction assez directe. Pour demander plus doucement de répéter, dis 말씀해 주시겠어요?";
    }
    if (selected === "말할까요") {
      return "말할까요? veut dire « est-ce que je parle ? ». Pour demander à l’autre de répéter avec respect, dis 말씀해 주시겠어요?";
    }
  }

  if (question.ruleAspect === "location" && selected === "에서") {
    return "에서 s’utilise quand une action se passe dans un lieu. Ici, 있어요 décrit une position statique, donc on met 에.";
  }
  if (question.ruleAspect === "action-location" && selected === "에") {
    return "에 indique notamment où se trouve une chose ou où l’on va. Ici, une action se passe dans ce lieu, donc il faut 에서.";
  }
  if (question.ruleAspect === "static-location" && selected === "에서") {
    return "에서 marque le lieu où une action se déroule. Ici, 있어요 décrit seulement une position, donc il faut 에.";
  }
  if (question.ruleAspect === "destination" && selected === "에서") {
    return "에서 donnerait une phrase grammaticale, mais ferait de ce lieu le point de départ. Ici, c’est la destination, donc on met 에.";
  }
  if (question.ruleAspect === "time") {
    if (selected === "부터") {
      return "부터 marque le début d’une période. Ici, tu donnes simplement une heure précise, donc on met 에.";
    }
    if (selected === "에서") {
      return "에서 s’emploie pour le lieu d’une action, pas pour cette heure précise. Le repère temporel prend 에.";
    }
  }

  if (
    conceptId === "additive-do" &&
    question.ruleAspect === "additive-meaning-person"
  ) {
    if (/seulement|seul/u.test(selected)) {
      return `${quoted(selected)} exprime une limitation. Ici, 도 ajoute le locuteur à l’ami qui part déjà : « moi aussi ».`;
    }
    if (/contraste/u.test(selected)) {
      return `${quoted(selected)} met « je » en contraste avec les autres. Ici, 도 exprime l’addition : ${expected}.`;
    }
    if (/Est-ce que/u.test(selected)) {
      return `${quoted(selected)} transforme la phrase en question. 저도 가요 signifie une affirmation : « moi aussi, j’y vais ».`;
    }
  }

  if (
    conceptId === "additive-do" &&
    question.ruleAspect === "additive-object-choice"
  ) {
    if (selected === "김치를 주세요." || selected === "커피를 마셔요.") {
      return `${quoted(selected)} est grammatical, mais reste neutre : la phrase ne dit pas « aussi ». Pour ajouter cet élément à ce qui est déjà mentionné, il faut ${expected}.`;
    }
    if (selected === "김치만 주세요." || selected === "커피만 마셔요.") {
      return `${quoted(selected)} signifie « seulement ». Ici, tu ajoutes l’élément à un autre déjà mentionné : il faut ${expected}.`;
    }
    if (selected === "김치는 주세요." || selected === "커피는 마셔요.") {
      return `${quoted(selected)} met l’élément en thème ou en contraste, mais n’exprime pas explicitement « aussi ». Ici, il faut ${expected}.`;
    }
  }

  if (
    question.ruleAspect === "additive-vs-restrictive" &&
    (selected === "만" || /만 주세요\.?$/u.test(selected))
  ) {
    return "Tu as choisi « 빵만 주세요. » : 만 signifie « seulement » et limiterait la commande au pain. Ici, tu ajoutes le pain à ce qui est déjà commandé, donc il faut 도.";
  }
  if (
    question.ruleAspect === "additive-vs-restrictive" &&
    selected === "빵을 주세요."
  ) {
    return "Tu as choisi « 빵을 주세요. » : c’est une demande neutre qui ne dit pas que le pain s’ajoute au lait déjà commandé. Pour dire « du pain aussi », il faut 빵도 주세요.";
  }
  if (
    question.ruleAspect === "additive-vs-restrictive" &&
    selected === "빵은 주세요."
  ) {
    return "Tu as choisi « 빵은 주세요. » : le pain devient un thème ou un contraste, sans exprimer « aussi ». Ici, il faut 빵도 주세요.";
  }
  if (conceptId === "additive-do" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} peut marquer un thème ou un contraste. Ici, tu veux dire « aussi », donc il faut 도.`;
  }
  if (
    conceptId === "additive-do" &&
    ["을", "를"].includes(selected) &&
    question.display?.includes("커피")
  ) {
    return `${quoted(selected)} n’est pas faux : le café serait simplement l’objet du verbe. Mais ici, tu ajoutes le café au thé déjà mentionné, donc il faut 도 pour dire « aussi ».`;
  }
  if (question.ruleAspect === "restrictive-vs-additive" && selected === "도") {
    return "도 signifie « aussi » et ajouterait le pain à autre chose. Ici, tu ne veux que du pain, donc il faut 만.";
  }
  if (
    conceptId === "restrictive-man" &&
    question.ruleAspect === "restrictive" &&
    ["은", "는"].includes(selected)
  ) {
    return `${quoted(selected)} peut mettre cet élément en contraste avec d’autres. Ici, tu veux dire « seulement », donc il faut 만.`;
  }

  if (question.ruleAspect === "direction-batchim" && selected === "에") {
    return "오른쪽에 가세요 peut présenter la droite comme le lieu où aller. Ici, tu indiques la direction à suivre : 오른쪽으로 가세요.";
  }

  if (question.ruleAspect === "range-start") {
    if (selected === "에서") {
      return `${quoted(selected)} peut parfois marquer un point de départ. Ici, pour dire clairement « à partir de », on utilise 부터.`;
    }
    if (selected === "에") {
      return `${quoted(selected)} indique un moment précis. Ici, tu donnes le début d’une période, donc il faut 부터.`;
    }
  }
  if (question.ruleAspect === "range-end" && selected === "에") {
    return `${quoted(selected)} indique un moment précis. Ici, tu donnes la fin de la période commencée avec 부터, donc il faut 까지.`;
  }

  if (question.ruleAspect === "comparison" && selected === "제일") {
    return "제일 convient pour dire « le plus » dans un groupe. Ici, tu compares seulement deux éléments avec 보다, donc on emploie 더.";
  }

  if (
    question.ruleAspect === "ability" ||
    question.ruleAspect === "ability-vs-permission"
  ) {
    const possibilityMeaning =
      question.exerciseGroup === "situational-feasibility"
        ? "la faisabilité dans cette situation"
        : "une capacité personnelle";
    if (/도 돼요\??$/u.test(selected)) {
      return `${quoted(selected)} demande si c’est autorisé, pas si c’est réalisable. Ici, tu vérifies ${possibilityMeaning}, donc utilise -(으)ㄹ 수 있어요.`;
    }
    if (/고 싶어요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit ce qu’on a envie de faire, pas ${possibilityMeaning}. Utilise -(으)ㄹ 수 있어요.`;
    }
    if (/야 해요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit qu’il faut faire l’action. Ici, tu vérifies ${possibilityMeaning}.`;
    }
    if (/(?:^|\s)못 /u.test(selected)) {
      return `${quoted(selected)} dit que l’action est impossible. Ici, tu veux au contraire dire que ${possibilityMeaning} est possible.`;
    }
  }

  if (
    question.ruleAspect === "permission" ||
    question.ruleAspect === "permission-vs-ability"
  ) {
    if (/수 있어요\??$/u.test(selected)) {
      return `${quoted(selected)} vérifie si l’action est réalisable, pas si elle est autorisée. Ici, tu demandes si tu as le droit de la faire, donc utilise -아/어도 돼요.`;
    }
    if (/세요\??$/u.test(selected)) {
      return `${quoted(selected)} dit à l’autre personne quoi faire. Ici, tu lui demandes si toi, tu as le droit d’agir.`;
    }
    if (/야 해요\??$/u.test(selected)) {
      return `${quoted(selected)} dit que l’action est obligatoire. Ici, tu veux demander si elle est autorisée.`;
    }
  }

  if (question.ruleAspect === "inability-vs-choice") {
    if (selected === "듣고 싶지 않아요") {
      return "« 듣고 싶지 않아요 » veut dire que tu ne veux pas écouter. Ici, tu essaies d’écouter malgré la douleur, mais tu ne peux pas : 잘 못 들어요.";
    }
    if (selected === "들을 수 있어요") {
      return "« 들을 수 있어요 » indique que l’écoute est possible. Ici, la douleur t’empêche de bien écouter : 잘 못 들어요.";
    }
    if (/^안 /u.test(selected) || /지 않아요\.?$/u.test(selected)) {
      return `${quoted(selected)} laisse entendre qu’on choisit de ne pas faire l’action. Ici, on en est empêché, donc on emploie 못.`;
    }
    if (selected === "아니에요") {
      return "아니에요 sert à dire « ce n’est pas », pas à nier une action. Ici, 못 indique qu’on ne peut pas agir.";
    }
  }

  if (question.ruleAspect === "desire") {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce un projet. Ici, tu dis ce que tu as envie de faire, donc utilise -고 싶어요.`;
    }
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce une décision ou une promesse à l’autre personne. Ici, tu exprimes simplement une envie.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} propose de faire quelque chose ensemble. Ici, tu dis simplement ce que tu veux faire.`;
    }
  }

  if (question.ruleAspect === "future-vs-intention") {
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce à l’autre personne ce que tu décides de faire. Ici, le projet est déjà prévu, donc on emploie -(으)ㄹ 거예요.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} place l’action dans le passé. Mais le projet annoncé est futur.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est au présent. Pour annoncer ce projet futur, utilise -(으)ㄹ 거예요.`;
    }
  }

  if (question.ruleAspect === "intention-vs-future") {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} parle d’un projet déjà prévu. Ici, tu décides sur le moment en réponse à l’autre personne, donc on emploie -(으)ㄹ게요.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} demande l’avis de l’autre. Ici, tu annonces que tu vas t’en charger.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, tu prends une décision ou tu fais une promesse pour la suite.`;
    }
  }

  if (
    question.ruleAspect === "suggestion" ||
    question.ruleAspect === "suggestion-vs-intention"
  ) {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce un projet sans demander l’avis de l’autre. Pour proposer de faire quelque chose ensemble, utilise -(으)ㄹ까요?`;
    }
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce ce que tu décides de faire. Ici, tu veux proposer une action à faire ensemble.`;
    }
    if (/도 돼요\??$/u.test(selected)) {
      return `${quoted(selected)} demande une autorisation. Ici, tu proposes plutôt de faire l’action ensemble avec -(으)ㄹ까요?`;
    }
  }

  if (question.ruleAspect === "action-request") {
    if (selected === "주세요") {
      return "주세요 après un nom sert à demander cet objet. Ici, 문을 est déjà l’objet : précise l’action avec 열어 주세요.";
    }
    if (selected === "열고 싶어요") {
      return "열고 싶어요 veut dire que toi, tu veux ouvrir. Ici, tu demandes à l’employé de le faire pour toi : 열어 주세요.";
    }
    if (selected === "보이세요") {
      return "보이세요 parle de ce qui est visible ou du fait de voir. Pour demander à l’employé de montrer le menu, dis 보여 주세요.";
    }
    if (selected === "보여요") {
      return "보여요 veut dire que quelque chose est visible. Ici, tu demandes à l’employé de te montrer le menu : 보여 주세요.";
    }
    if (selected === "보일까요") {
      return "보일까요 demande si quelque chose sera visible. Pour demander à l’employé d’agir, dis 보여 주세요.";
    }
    if (["말하세요", "기다리세요", "여세요"].includes(selected)) {
      return `${quoted(selected)} donne une instruction ou une invitation. Ici, tu demandes un service à l’autre personne, donc utilise -아/어 주세요.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} propose de faire quelque chose ensemble. Ici, tu demandes directement à l’autre personne d’agir.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} ne demande pas clairement un service. Pour demander à l’autre personne d’agir, utilise -아/어 주세요.`;
    }
  }
  if (question.ruleAspect === "item-vs-action" && selected === "주세요") {
    return "주세요 après un nom demande l’objet lui-même. Comme 문을 est déjà l’objet, précise l’action : 열어 주세요.";
  }
  if (question.ruleAspect === "instruction" && /주세요\.?$/u.test(selected)) {
    return `${quoted(selected)} sert à demander un service. Ici, le professeur s’adresse à toute la classe avec l’impératif poli en -(으)세요.`;
  }
  if (question.ruleAspect === "item-vs-action" && /세요\.?$/u.test(selected)) {
    return `${quoted(selected)} donne une instruction. Ici, tu demandes à l’employé de faire l’action pour toi, donc utilise -아/어 주세요.`;
  }

  if (question.ruleAspect === "verbal-obligation") {
    if (/도 돼요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit que l’action est permise. Ici, elle est obligatoire, donc il faut -아/어야 해요.`;
    }
    if (/수 있어요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit qu’on peut faire l’action. Ici, on doit la faire.`;
    }
    if (/세요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit directement à l’autre quoi faire. Ici, tu exprimes une obligation avec -아/어야 해요.`;
    }
  }

  if (
    [
      "sequence",
      "sequence-vs-reason",
      "reason",
      "contrast",
      "condition",
    ].includes(question.ruleAspect ?? "")
  ) {
    const role = connectorRole(selected);
    if (role) {
      const expectedRole = question.ruleAspect?.startsWith("sequence")
        ? "un simple enchaînement"
        : question.ruleAspect === "reason"
          ? "une cause"
          : question.ruleAspect === "contrast"
            ? "un contraste"
            : "une condition";
      return `${quoted(selected)} donne ${role}, mais ici il faut ${expectedRole}. ${question.explanation}`;
    }
  }

  if (
    question.ruleAspect === "predicate-final" &&
    Array.isArray(question.answer)
  ) {
    const finalVerb = question.answer.at(-1);
    return `En coréen, garde le verbe ${finalVerb} à la fin. L’ordre naturel est ${quoted(expected)}.`;
  }

  const specific = selectedSpecificFallback(question, selected, expected);
  if (specific) return specific;
  if (question.stageId === "a1-validation") {
    return `Tu as choisi ${quoted(selected)}. Dans cette situation, ${question.explanation} La réponse attendue est ${quoted(expected)}.`;
  }
  return question.explanation;
}
