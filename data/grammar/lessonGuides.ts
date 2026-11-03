import type { GrammarStageId } from "./types";

export type GrammarLessonGuideFormula = {
  pattern: string;
  explanation: string;
};

export type GrammarLessonGuideStep = {
  title: string;
  explanation: string;
};

export type GrammarLessonGuideExamplePart = {
  korean: string;
  french: string;
  role: string;
};

export type GrammarLessonGuideExample = {
  korean: string;
  french: string;
  parts: readonly GrammarLessonGuideExamplePart[];
};

export type GrammarLessonGuideMistake = {
  mistake: string;
  correction: string;
};

export type GrammarLessonGuide = {
  stageId: GrammarStageId;
  introduction: string;
  mainRule: string;
  formula: GrammarLessonGuideFormula;
  steps: readonly GrammarLessonGuideStep[];
  examples: readonly GrammarLessonGuideExample[];
  commonMistakes: readonly GrammarLessonGuideMistake[];
  memoryTip: string;
};

/** Les quinze leçons A0 proposent une lecture courte avant les détails. */
export const GRAMMAR_QUICK_GUIDE_STAGE_IDS: readonly GrammarStageId[] = [
  "sentence-structure",
  "identify-with-copula",
  "polite-register",
  "introduce-topic",
  "demonstratives",
  "nominal-questions",
  "existence",
  "locate-thing",
  "present-actions",
  "object-actions",
  "action-location",
  "destination-and-time",
  "possession",
  "information-questions",
  "simple-negation",
];

export function isGrammarQuickGuideStage(stageId: GrammarStageId): boolean {
  return GRAMMAR_QUICK_GUIDE_STAGE_IDS.includes(stageId);
}

export const GRAMMAR_LESSON_GUIDES = {
  "sentence-structure": {
    stageId: "sentence-structure",
    introduction:
      "En coréen, tu annonces souvent de qui ou de quoi tu parles, puis ce qui se passe. Dans une phrase simple, l'action vient à la fin.",
    mainRule:
      "Pour construire la phrase neutre demandée dans les exercices, place d'abord le thème, puis l'objet, le lieu ou le moment, et termine par le verbe. Tu peux omettre le sujet s'il est déjà compris.",
    formula: {
      pattern: "(thème, si nécessaire) + (objet / lieu / moment) + verbe",
      explanation:
        "Dans 저는 커피를 마셔요, 저는 présente la personne, 커피를 indique ce qu'elle boit et 마셔요 exprime l'action. Dans 집에 가요, le sujet n'est pas écrit.",
    },
    steps: [
      {
        title: "Pose le contexte",
        explanation:
          "Commence, si nécessaire, par la personne ou la chose dont tu parles. Dans 저는, 저 signifie « moi » et 는 annonce le thème.",
      },
      {
        title: "Ajoute les précisions",
        explanation:
          "Place ensuite les précisions utiles : un objet, un lieu ou un moment. Les petits mots attachés aux noms indiquent leur rôle dans la phrase.",
      },
      {
        title: "Termine par l'action",
        explanation:
          "Dans ces exercices, termine par le verbe : 마셔요 (boire), 가요 (aller), 읽어요 (lire) ou 만나요 (rencontrer).",
      },
    ],
    examples: [
      {
        korean: "저는 커피를 마셔요.",
        french: "Moi, je bois du café.",
        parts: [
          { korean: "저는", french: "moi", role: "thème" },
          { korean: "커피를", french: "du café", role: "objet" },
          { korean: "마셔요", french: "je bois", role: "prédicat" },
        ],
      },
      {
        korean: "집에 가요.",
        french: "Je rentre à la maison.",
        parts: [
          { korean: "집에", french: "à la maison", role: "destination" },
          { korean: "가요", french: "je vais", role: "prédicat" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Reproduire automatiquement l'ordre français sujet + verbe + objet.",
        correction: "Regroupe d'abord le contexte et les compléments, puis place le prédicat à la fin.",
      },
      {
        mistake: "Chercher un sujet écrit dans chaque phrase.",
        correction: "Le coréen omet volontiers le sujet quand la situation permet de le comprendre.",
      },
    ],
    memoryTip:
      "Imagine une phrase comme une scène qui garde son action pour la fin : tout se prépare, puis le prédicat tombe.",
  },
  "identify-with-copula": {
    stageId: "identify-with-copula",
    introduction:
      "Pour dire « je suis… » ou « c'est… » dans une conversation polie, tu peux ajouter 이에요 ou 예요 après un nom.",
    mainRule:
      "Après une consonne finale (받침), attache 이에요 ; après une voyelle, attache 예요. N'ajoute jamais d'espace entre le nom et cette terminaison.",
    formula: {
      pattern: "nom + 이에요 (après consonne) / nom + 예요 (après voyelle)",
      explanation:
        "Applique ce choix au nom coréen, et non à sa traduction : 학생이에요, 의사예요, 책이에요 et 친구예요. Ce sont les mêmes formes que tu dois reconnaître dans les exercices.",
    },
    steps: [
      {
        title: "Regarde la dernière syllabe",
        explanation:
          "Vérifie si le nom se termine par une consonne finale, appelée 받침, ou par une voyelle.",
      },
      {
        title: "Choisis la bonne forme",
        explanation:
          "Après une consonne, emploie 이에요. Après une voyelle, emploie la forme plus légère 예요.",
      },
      {
        title: "Attache sans espace",
        explanation:
          "La copule forme un seul bloc avec le nom : 학생이에요 et 마크예요.",
      },
    ],
    examples: [
      {
        korean: "학생이에요.",
        french: "Je suis étudiant.",
        parts: [
          { korean: "학생", french: "étudiant", role: "nom avec consonne finale" },
          { korean: "이에요", french: "suis / est", role: "copule polie" },
        ],
      },
      {
        korean: "마크예요.",
        french: "C'est Marc.",
        parts: [
          { korean: "마크", french: "Marc", role: "nom avec voyelle finale" },
          { korean: "예요", french: "c'est", role: "copule polie" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Écrire 학생 이에요 avec un espace.",
        correction: "Attache toujours la copule au nom : 학생이에요.",
      },
      {
        mistake: "Choisir selon le sens ou l'orthographe française.",
        correction: "Écoute seulement le dernier son du nom coréen : consonne ou voyelle.",
      },
    ],
    memoryTip:
      "Une consonne finale demande le petit pont 이 avant 에요 ; après une voyelle, 예요 suffit.",
  },
  "polite-register": {
    stageId: "polite-register",
    introduction:
      "Avec un serveur, un collègue ou une connaissance, le style poli courant est naturel. Tu le reconnais souvent à la terminaison en -요.",
    mainRule:
      "Dans les exercices, choisis la forme au présent poli courant : 좋아요, 괜찮아요, 먹어요 ou 가요. Ne colle pas simplement 요 à la forme du dictionnaire.",
    formula: {
      pattern: "base conjuguée + 요",
      explanation:
        "Regarde la transformation complète : 먹다 devient 먹어요 et 괜찮다 devient 괜찮아요. Le style formel, comme 좋습니다 ou 학생입니다, est différent du style poli courant demandé ici.",
    },
    steps: [
      {
        title: "Repère la relation",
        explanation:
          "Avec un inconnu, un commerçant ou une personne plus âgée, commence par le registre poli en -요.",
      },
      {
        title: "Conjugue le prédicat",
        explanation:
          "Transforme le verbe ou l'adjectif dans sa forme polie courante, par exemple 괜찮다 devient 괜찮아요.",
      },
      {
        title: "Vérifie la fin",
        explanation:
          "Vérifie aussi le registre : 좋아요 est poli courant, 좋습니다 est formel et 좋아 est familier. Les exercices te demandent le premier.",
      },
    ],
    examples: [
      {
        korean: "괜찮아요.",
        french: "Ça va.",
        parts: [
          { korean: "괜찮아", french: "aller bien", role: "base conjuguée" },
          { korean: "요", french: "marque polie", role: "registre" },
        ],
      },
      {
        korean: "맛있어요.",
        french: "C'est délicieux.",
        parts: [
          { korean: "맛있어", french: "être délicieux", role: "base conjuguée" },
          { korean: "요", french: "marque polie", role: "registre" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Ajouter 요 directement à la forme du dictionnaire, comme 괜찮다요.",
        correction: "Conjugue d'abord la base : 괜찮아요.",
      },
      {
        mistake: "Employer le registre familier parce que la phrase est courte.",
        correction: "La longueur ne décide pas du registre ; la relation entre les personnes, oui.",
      },
    ],
    memoryTip:
      "Entends 요 comme un atterrissage en douceur : il se place tout à la fin et rend la phrase socialement sûre.",
  },
  "introduce-topic": {
    stageId: "introduce-topic",
    introduction:
      "Pour parler de toi, d'aujourd'hui ou d'un objet déjà évoqué, le coréen peut commencer par indiquer le thème : « quant à… ».",
    mainRule:
      "Utilise 은 après une consonne finale (오늘은, 책은) et 는 après une voyelle (저는, 커피는). Dans ces exercices, le mot est le thème de la discussion ou sert à marquer un contraste.",
    formula: {
      pattern: "nom + 은 (après consonne) / 는 (après voyelle) + commentaire",
      explanation:
        "Le groupe avec 은/는 indique de quoi tu parles ; la suite apporte l'information. Dans 오늘은 쉬어요, tu peux aussi opposer aujourd'hui aux autres jours.",
    },
    steps: [
      {
        title: "Choisis ton thème",
        explanation:
          "Décide ce que tu places au premier plan : moi, aujourd'hui, ce café ou un autre élément déjà connu.",
      },
      {
        title: "Regarde la dernière syllabe",
        explanation:
          "Après une consonne finale, ajoute 은. Après une voyelle, ajoute 는.",
      },
      {
        title: "Ajoute le commentaire",
        explanation:
          "Dis ensuite ce que tu veux apprendre ou affirmer sur ce thème. La particule ne se traduit pas toujours mot à mot.",
      },
    ],
    examples: [
      {
        korean: "저는 프랑스 사람이에요.",
        french: "Moi, je suis français.",
        parts: [
          { korean: "저는", french: "quant à moi", role: "thème après voyelle" },
          { korean: "프랑스 사람", french: "personne française", role: "identité" },
          { korean: "이에요", french: "je suis", role: "copule polie" },
        ],
      },
      {
        korean: "오늘은 쉬어요.",
        french: "Aujourd'hui, je me repose.",
        parts: [
          { korean: "오늘은", french: "quant à aujourd'hui", role: "thème après consonne" },
          { korean: "쉬어요", french: "je me repose", role: "information sur le thème" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Séparer la particule du nom : 저 는.",
        correction: "Écris le thème et sa particule dans le même bloc : 저는.",
      },
      {
        mistake: "Considérer 은/는 comme une traduction automatique de « je » ou « le ».",
        correction: "La particule indique le thème ; le nom placé devant conserve son propre sens.",
      },
    ],
    memoryTip:
      "은/는 ouvre un dossier : « à propos de ceci… ». Tout ce qui suit vient remplir ce dossier.",
  },
  demonstratives: {
    stageId: "demonstratives",
    introduction:
      "Au magasin, tu peux montrer un objet dans ta main, près de la vendeuse ou loin de vous deux. Le mot choisi dépend de cette position.",
    mainRule:
      "Du point de vue de celui qui parle, utilise 이 pour l'objet près de toi, 그 pour l'objet près de l'autre personne et 저 pour celui qui est loin de vous deux.",
    formula: {
      pattern: "이 / 그 / 저 + nom  ·  이거 / 그거 / 저거 (sans nom)",
      explanation:
        "Place 이, 그 ou 저 devant un nom : 이 가방, 그 신발, 저 건물. Sans nom, choisis 이거, 그거 ou 저거 ; 저기 désigne un lieu, pas un objet.",
    },
    steps: [
      {
        title: "Situe la chose",
        explanation:
          "Quand tu parles, prends ton propre point de vue : 이 pour ce que tu tiens, 그 pour ce qui est près de la personne en face et 저 pour ce qui est éloigné des deux.",
      },
      {
        title: "Regarde si le nom est dit",
        explanation:
          "Si le nom suit, garde 이/그/저. S'il est remplacé par « cette chose », choisis 이거/그거/저거.",
      },
      {
        title: "Complète normalement",
        explanation:
          "Ajoute ensuite la question ou l'identification, souvent avec 뭐예요? ou 이에요/예요.",
      },
    ],
    examples: [
      {
        korean: "이거 뭐예요?",
        french: "Qu'est-ce que cet objet-ci ?",
        parts: [
          { korean: "이거", french: "cette chose-ci", role: "près de moi" },
          { korean: "뭐예요?", french: "qu'est-ce que c'est ?", role: "question" },
        ],
      },
      {
        korean: "저 가방이에요.",
        french: "C'est ce sac là-bas.",
        parts: [
          { korean: "저", french: "ce… là-bas", role: "loin des deux" },
          { korean: "가방이에요", french: "c'est un sac", role: "nom + copule" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Dire 이 가방 pour montrer un sac loin de tout le monde.",
        correction: "Pour une chose éloignée des deux personnes, choisis 저 가방.",
      },
      {
        mistake: "Employer 이거 devant un nom, comme 이거 가방.",
        correction: "이거 remplace déjà le nom ; dis 이 가방 ou 이거.",
      },
    ],
    memoryTip:
      "Trace trois halos : 이 ici avec moi, 그 de ton côté, 저 là-bas au loin.",
  },
  "nominal-questions": {
    stageId: "nominal-questions",
    introduction:
      "Au restaurant ou dans un magasin, tu peux demander ce qu'est un objet, qui est une personne ou combien il en faut.",
    mainRule:
      "Choisis 뭐 pour « quoi », 누구 pour « qui » et 몇 pour « combien ». Pour compter, mets 몇 devant le mot adapté : 몇 명 (personnes) ou 몇 장 (billets, feuilles).",
    formula: {
      pattern: "quoi : 뭐 · qui : 누구 · combien : 몇 + 명/장",
      explanation:
        "Le mot interrogatif garde la place de l'information cherchée : 이거 뭐예요? ; 저 사람은 누구예요? ; 몇 명이에요? La terminaison reste polie.",
    },
    steps: [
      {
        title: "Identifie l'inconnue",
        explanation:
          "Choisis 뭐/무엇 pour une chose, 누구 pour une personne et 몇 pour demander combien.",
      },
      {
        title: "Garde sa place naturelle",
        explanation:
          "Insère le mot interrogatif là où se trouverait la réponse dans la phrase affirmative.",
      },
      {
        title: "Termine poliment",
        explanation:
          "Conserve la terminaison adaptée, par exemple 예요/이에요, puis marque la question par l'intonation et le point d'interrogation.",
      },
    ],
    examples: [
      {
        korean: "누구예요?",
        french: "Qui est cette personne ?",
        parts: [
          { korean: "누구", french: "qui", role: "personne inconnue" },
          { korean: "예요?", french: "est-ce ?", role: "copule polie" },
        ],
      },
      {
        korean: "몇 명이에요?",
        french: "Combien de personnes êtes-vous ?",
        parts: [
          { korean: "몇", french: "combien", role: "quantité inconnue" },
          { korean: "명", french: "personnes", role: "classificateur" },
          { korean: "이에요?", french: "est-ce ?", role: "copule polie" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Placer systématiquement le mot interrogatif au tout début comme en français.",
        correction: "Place-le dans le bloc que la réponse viendrait remplacer.",
      },
      {
        mistake: "Employer 몇 seul pour compter des personnes ou des billets.",
        correction: "Ajoute le classificateur adapté : 몇 명 pour les personnes, 몇 장 pour les billets.",
      },
    ],
    memoryTip:
      "Construis d'abord la réponse, puis remplace seulement le morceau inconnu par 뭐, 누구 ou 몇.",
  },
  existence: {
    stageId: "existence",
    introduction:
      "Pour dire qu'un menu est disponible ou que tu n'as pas le temps, utilise 있어요 ou 없어요. Tu vas aussi apprendre à marquer ce qui existe ou arrive.",
    mainRule:
      "Attache 이 après une consonne finale (시간이, 책이) et 가 après une voyelle (메뉴가, 버스가). Utilise 있어요 si quelque chose est présent, 없어요 s'il manque.",
    formula: {
      pattern: "nom + 이/가 + 있어요 / 없어요",
      explanation:
        "이/가 marque aussi ce qui arrive : 버스가 와요 (le bus arrive). Pour nier une identité, emploie 아니에요, pas 없어요.",
    },
    steps: [
      {
        title: "Nomme ce qui compte",
        explanation:
          "Repère la personne, la chose, le temps ou le service dont tu veux signaler la présence ou l'absence.",
      },
      {
        title: "Marque avec 이/가",
        explanation:
          "Ajoute 이 après une consonne finale et 가 après une voyelle pour présenter l'élément qui existe ou manque.",
      },
      {
        title: "Choisis présence ou absence",
        explanation:
          "Termine par 있어요 si l'élément est là ou disponible, et par 없어요 s'il ne l'est pas.",
      },
    ],
    examples: [
      {
        korean: "채식 메뉴가 있어요?",
        french: "Y a-t-il un menu végétarien ?",
        parts: [
          { korean: "채식 메뉴가", french: "un menu végétarien", role: "élément recherché" },
          { korean: "있어요?", french: "y en a-t-il ?", role: "existence" },
        ],
      },
      {
        korean: "시간이 없어요.",
        french: "Je n'ai pas le temps.",
        parts: [
          { korean: "시간이", french: "du temps", role: "élément absent" },
          { korean: "없어요", french: "il n'y en a pas", role: "absence" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Traduire « avoir » mot à mot avec une structure française.",
        correction: "Pense plutôt : « du temps existe / n'existe pas » dans la situation.",
      },
      {
        mistake: "Employer 없어요 pour nier une identité, alors que la chose est bien présente.",
        correction: "Pour dire « ce n'est pas du café », emploie 아니에요 ; 없어요 signifie « il n'y en a pas ».",
      },
    ],
    memoryTip:
      "Pose une question très concrète à la scène : « Est-ce que cet élément est là ? » 있어요 oui, 없어요 non.",
  },
  "locate-thing": {
    stageId: "locate-thing",
    introduction:
      "Tu veux indiquer où se trouve une personne ou un objet : au café, à l'école, à la maison ou dans un sac.",
    mainRule:
      "Pour localiser quelqu'un ou quelque chose, attache 에 au lieu puis termine par 있어요 : 가방에 있어요 (se trouve dans le sac).",
    formula: {
      pattern: "élément + 은/는 ou 이/가 + lieu + 에 + 있어요",
      explanation:
        "Dans 화장실은 2층에 있어요, 2층 est le deuxième étage et 에 marque le lieu. Les exercices opposent 에 à 에서, qui sert notamment quand une action se déroule sur place.",
    },
    steps: [
      {
        title: "Présente l'élément",
        explanation:
          "Annonce ce que tu situes avec 은/는 si c'est le thème, ou 이/가 si tu le présentes comme information nouvelle.",
      },
      {
        title: "Marque le lieu avec 에",
        explanation:
          "Attache 에 directement au lieu : 2층에 « au deuxième étage », 가방에 « dans le sac ».",
      },
      {
        title: "Ferme avec 있어요",
        explanation:
          "Termine par 있어요 pour indiquer une présence : 친구가 카페에 있어요. Ici, le lieu n'est pas celui d'une action.",
      },
    ],
    examples: [
      {
        korean: "화장실은 2층에 있어요.",
        french: "Les toilettes sont au deuxième étage.",
        parts: [
          { korean: "화장실은", french: "quant aux toilettes", role: "élément situé" },
          { korean: "2층에", french: "au deuxième étage", role: "lieu" },
          { korean: "있어요", french: "se trouvent", role: "position" },
        ],
      },
      {
        korean: "카드가 가방에 있어요.",
        french: "La carte est dans le sac.",
        parts: [
          { korean: "카드가", french: "la carte", role: "élément situé" },
          { korean: "가방에", french: "dans le sac", role: "lieu" },
          { korean: "있어요", french: "se trouve", role: "position" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Employer 에서 pour une simple position statique.",
        correction: "Avec 있어요 pour dire où se trouve une chose, utilise 에.",
      },
      {
        mistake: "Placer 있어요 avant le lieu.",
        correction: "Garde le prédicat final : lieu + 에, puis 있어요.",
      },
    ],
    memoryTip:
      "Imagine 에 comme une épingle posée sur une carte : l'objet est fixé à ce lieu, puis 있어요 confirme sa présence.",
  },
  "present-actions": {
    stageId: "present-actions",
    introduction:
      "Tu peux parler d'une action en cours ou d'une habitude avec le présent poli courant : manger, aller quelque part, boire, lire ou étudier.",
    mainRule:
      "Pour les verbes réguliers de cette leçon, enlève 다 ; si la dernière voyelle du radical est ㅏ ou ㅗ, utilise 아요, sinon 어요. Les verbes en 하다 deviennent 해요.",
    formula: {
      pattern: "radical + 아요 / 어요  ·  하다 → 해요",
      explanation:
        "Le radical est ce qui reste après avoir retiré 다. Certaines formes se contractent : 가다 → 가요, 마시다 → 마셔요. Le présent se distingue du passé (먹었어요) et du futur (먹을 거예요).",
    },
    steps: [
      {
        title: "Retire 다",
        explanation:
          "Pars de la forme du dictionnaire, par exemple 먹다, 마시다 ou 공부하다, et garde le radical : 먹-, 마시- ou 공부하-.",
      },
      {
        title: "Choisis la terminaison",
        explanation:
          "Avec ㅏ ou ㅗ, choisis 아요 : 가다 → 가요. Avec une autre voyelle, choisis 어요 : 먹다 → 먹어요, 마시다 → 마셔요.",
      },
      {
        title: "Vérifie la forme polie",
        explanation:
          "Un verbe en 하다 devient 해요 : 공부하다 → 공부해요. Le prédicat conjugué reste à la fin de la phrase.",
      },
    ],
    examples: [
      {
        korean: "매일 공부해요.",
        french: "J’étudie tous les jours.",
        parts: [
          { korean: "매일", french: "tous les jours", role: "habitude" },
          { korean: "공부해요", french: "j’étudie", role: "하다 → 해요" },
        ],
      },
      {
        korean: "커피를 마셔요.",
        french: "Je bois du café.",
        parts: [
          { korean: "커피를", french: "du café", role: "objet" },
          { korean: "마셔요", french: "je bois", role: "présent poli" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Garder la forme du dictionnaire (먹다, 공부하다) au lieu du présent poli demandé.",
        correction: "Pour répondre au présent poli, écris 먹어요 ou 공부해요.",
      },
      {
        mistake: "Ajouter mécaniquement 아요 à tous les verbes.",
        correction: "Observe la dernière voyelle : 먹다 donne 먹어요 et 공부하다 donne 공부해요.",
      },
    ],
    memoryTip:
      "Commence par enlever 다, puis écoute la dernière voyelle : ㅏ/ㅗ appellent 아요, les autres appellent 어요, et 하다 devient 해요.",
  },
  "object-actions": {
    stageId: "object-actions",
    introduction:
      "Pour dire ce que tu bois, lis, manges, regardes ou étudies, le coréen ajoute une particule au nom qui reçoit directement l'action.",
    mainRule:
      "Dans ces phrases sans contraste, choisis 을 après une consonne finale (책을, 밥을) et 를 après une voyelle (커피를, 한국어를), puis mets le verbe à la fin.",
    formula: {
      pattern: "(sujet / thème) + objet + 을/를 + verbe",
      explanation:
        "La particule suit l'objet, sans espace. Dans 책을 읽어요, 책 est ce que l'on lit. Les exercices distinguent cet objet neutre d'un thème marqué par 은/는.",
    },
    steps: [
      {
        title: "Trouve ce que l’action concerne",
        explanation:
          "Demande-toi ce que tu bois, lis, apprends ou achètes. C’est ce nom qui recevra 을/를.",
      },
      {
        title: "Regarde la fin du nom",
        explanation:
          "Après une consonne finale, choisis 을 : 책을. Après une voyelle, choisis 를 : 커피를.",
      },
      {
        title: "Place le verbe en dernier",
        explanation:
          "Après l’objet marqué, ajoute l’action conjuguée : 커피를 마셔요 signifie littéralement « le café, je le bois ».",
      },
    ],
    examples: [
      {
        korean: "커피를 마셔요.",
        french: "Je bois du café.",
        parts: [
          { korean: "커피를", french: "du café", role: "objet après voyelle" },
          { korean: "마셔요", french: "je bois", role: "action" },
        ],
      },
      {
        korean: "책을 읽어요.",
        french: "Je lis un livre.",
        parts: [
          { korean: "책을", french: "un livre", role: "objet après consonne" },
          { korean: "읽어요", french: "je lis", role: "action" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Employer 이/가 ou 은/는 pour répondre à « Que lis-tu ? » sans contraste.",
        correction: "Dans les exercices, l'objet direct neutre reçoit 을/를 : 책을 읽어요, 커피를 마셔요.",
      },
      {
        mistake: "Placer la particule après le verbe ou oublier qu’elle dépend du dernier son.",
        correction: "La particule suit l’objet : consonne + 을, voyelle + 를.",
      },
    ],
    memoryTip:
      "Avant de conjuguer, pose la question « quoi ? » au verbe : la réponse prend 을 ou 를, puis l’action ferme la phrase.",
  },
  "action-location": {
    stageId: "action-location",
    introduction:
      "에서 indique le lieu où une action se déroule. Il ne sert pas à dire où une chose se trouve immobile : cette position statique se construit avec 에 + 있어요.",
    mainRule:
      "Pour une activité sur place (공부해요, 먹어요, 만나요), ajoute 에서 au lieu : 카페에서 공부해요. Pour situer quelqu’un ou quelque chose avec 있어요, choisis 에 : 학교에 있어요.",
    formula: {
      pattern: "action : lieu + 에서 + verbe  ·  position : lieu + 에 + 있어요",
      explanation:
        "Compare 카페에서 공부해요 (activité) et 학교에 있어요 (position). Dans 식당에서 친구를 만나요, 식당에서 indique où la rencontre a lieu et 친구를 est la personne rencontrée.",
    },
    steps: [
      {
        title: "Identifie le verbe",
        explanation:
          "공부해요, 먹어요 et 만나요 sont des activités ; 있어요 indique une présence ou une position. Regarde le verbe avant de choisir la particule.",
      },
      {
        title: "Marque le lieu avec 에서",
        explanation:
          "Pour une action : 카페에서 공부해요, 집에서 밥을 먹어요. Pour une position : 학교에 있어요, 도서관에 있어요. La particule suit immédiatement le lieu.",
      },
      {
        title: "Ne confonds pas avec 에",
        explanation:
          "Ne confonds pas avec 로/으로 (« vers », direction) ni 까지 (« jusqu’à », limite). Avec 가요/와요, 에 peut aussi indiquer la destination : 학교에 가요 n’équivaut pas à 학교에서 공부해요.",
      },
    ],
    examples: [
      {
        korean: "카페에서 공부해요.",
        french: "J’étudie au café.",
        parts: [
          { korean: "카페에서", french: "au café", role: "lieu de l’action" },
          { korean: "공부해요", french: "j’étudie", role: "action" },
        ],
      },
      {
        korean: "학교에 있어요.",
        french: "Je suis à l’école.",
        parts: [
          { korean: "학교에", french: "à l’école", role: "position avec 에" },
          { korean: "있어요", french: "je suis / je me trouve", role: "présence" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Dire 카페에 공부해요 pour « j’étudie au café ».",
        correction: "Le café est le lieu de l’action : 카페에서 공부해요. 에 conviendrait avec 카페에 있어요.",
      },
      {
        mistake: "Employer 에서 pour une position, ou 로/으로 ou 까지 pour situer une activité.",
        correction: "Pour une position : 학교에 있어요. Pour une activité : 집에서 밥을 먹어요. 로/으로 indique plutôt la direction ; 까지, la limite d’un trajet.",
      },
    ],
    memoryTip:
      "Action sur place → 에서. Simple présence → 에. Direction ou limite du trajet → 로/으로 ou 까지.",
  },
  "destination-and-time": {
    stageId: "destination-and-time",
    introduction:
      "에 peut marquer un point vers lequel on se déplace ou un moment précis. Le verbe qui suit permet de savoir si 에 signifie « à destination de » ou « à telle heure ».",
    mainRule:
      "Ajoute 에 après la destination avec un verbe de déplacement et après l’heure ou le moment précis d’une action.",
    formula: {
      pattern: "destination + 에 + déplacement  ·  moment + 에 + action",
      explanation:
        "Une même particule relie la phrase à un point spatial ou temporel : 서울역에 가요, « je vais à la gare de Séoul », et 세 시에 만나요, « je retrouve [quelqu’un] à trois heures ».",
    },
    steps: [
      {
        title: "Repère le déplacement",
        explanation:
          "Avec 가다, 오다 ou un autre verbe de déplacement, le lieu visé reçoit 에 : 집에 가요, je rentre à la maison.",
      },
      {
        title: "Repère le moment précis",
        explanation:
          "Une heure ou une date ponctuelle reçoit aussi 에 : 세 시에, à trois heures. Les heures se comptent généralement avec les nombres natifs à ce niveau.",
      },
      {
        title: "Garde l’action à la fin",
        explanation:
          "Tu peux placer le moment avant la destination, mais le verbe conjugué reste le dernier bloc : 세 시에 서울역에 가요.",
      },
    ],
    examples: [
      {
        korean: "세 시에 서울역에 가요.",
        french: "Je vais à la gare de Séoul à trois heures.",
        parts: [
          { korean: "세 시에", french: "à trois heures", role: "moment précis" },
          { korean: "서울역에", french: "à la gare de Séoul", role: "destination" },
          { korean: "가요", french: "je vais", role: "déplacement" },
        ],
      },
      {
        korean: "두 시에 친구를 만나요.",
        french: "Je retrouve un ami à deux heures.",
        parts: [
          { korean: "두 시에", french: "à deux heures", role: "moment précis" },
          { korean: "친구를", french: "un ami", role: "personne rencontrée" },
          { korean: "만나요", french: "je retrouve", role: "action" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Employer 에서 pour une destination sans point de départ : 서울역에서 가요.",
        correction: "Le lieu visé prend 에 : 서울역에 가요. 에서 indiquerait plutôt le lieu de départ ou d’une action.",
      },
      {
        mistake: "Oublier 에 après l’heure ou le traiter comme une partie du nombre.",
        correction: "Sépare le groupe temporel : 세 시에, 두 시에.",
      },
    ],
    memoryTip:
      "에 plante une punaise sur une carte ou une horloge : destination et moment précis sont deux points d’arrivée.",
  },
  possession: {
    stageId: "possession",
    introduction:
      "La particule 의 relie un possesseur à ce qui lui appartient. Dans la conversation, 저의 devient souvent 제 et 나의 devient 내 : ces formes courtes sont à reconnaître et à employer.",
    mainRule:
      "Place le possesseur avant 의 et la chose possédée après : ami + 의 + sac. Pour dire « mon », utilise 제 dans le registre poli et 내 dans le registre familier.",
    formula: {
      pattern: "possesseur + 의 + objet  ·  제/내 + objet",
      explanation:
        "La structure coréenne dit d’abord « de qui », puis nomme la chose. 제 et 내 sont les formes contractées de 저의 et 나의.",
    },
    steps: [
      {
        title: "Nomme le possesseur",
        explanation:
          "Commence par la personne ou le groupe auquel la chose est rattachée : 친구, 저, 나.",
      },
      {
        title: "Relie les deux noms",
        explanation:
          "Entre deux noms, ajoute 의 : 친구의 가방 signifie « le sac de mon ami ». La particule reste attachée au premier groupe.",
      },
      {
        title: "Choisis le registre de « mon »",
        explanation:
          "Avec une personne peu familière, 제 est le choix poli. 내 appartient au style familier, avec un proche ou entre amis.",
      },
    ],
    examples: [
      {
        korean: "제 이름은 마크예요.",
        french: "Mon nom est Marc.",
        parts: [
          { korean: "제 이름은", french: "mon nom", role: "possesseur contracté + thème" },
          { korean: "마크예요", french: "est Marc", role: "identification" },
        ],
      },
      {
        korean: "친구의 가방이에요.",
        french: "C’est le sac de mon ami.",
        parts: [
          { korean: "친구의", french: "de mon ami", role: "possesseur" },
          { korean: "가방이에요", french: "c’est un sac", role: "chose possédée" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Confondre 제 avec 저 ou 제가.",
        correction: "제 signifie « mon » en style poli ; 저 signifie « moi » et 제가 signifie « moi + sujet ».",
      },
      {
        mistake: "Inverser les noms comme en français : 가방의 친구.",
        correction: "Commence par le possesseur : 친구의 가방, « le sac de l’ami ».",
      },
    ],
    memoryTip:
      "En coréen, le propriétaire passe devant la chose : « ami de sac » devient 친구의 가방 ; pour « mon », pense à 제 en contexte poli.",
  },
  "information-questions": {
    stageId: "information-questions",
    introduction:
      "Les mots interrogatifs remplacent directement l’information inconnue dans une phrase coréenne. Ils restent donc à la place naturelle du lieu, du moment, de la raison ou de la quantité demandée.",
    mainRule:
      "Choisis le mot interrogatif adapté — 어디, 언제, 왜, 어떻게, 얼마, 얼마나 ou 무슨 — et garde la structure de la phrase, avec le prédicat à la fin.",
    formula: {
      pattern: "élément inconnu + particule éventuelle + prédicat ?",
      explanation:
        "어디 remplace un lieu, 언제 un moment, 왜 une raison, 어떻게 une manière et 얼마 un prix ou une quantité. 무슨 précède un nom : 무슨 영화, quel film.",
    },
    steps: [
      {
        title: "Définis l’information recherchée",
        explanation:
          "Lieu → 어디, moment → 언제, raison → 왜, manière → 어떻게. Pour un prix ou une quantité, pense à 얼마 ; pour le degré, à 얼마나.",
      },
      {
        title: "Remplace le bon bloc",
        explanation:
          "Garde la place où se trouverait la réponse : 화장실이 어디예요? suit la structure « les toilettes sont [où] ? ».",
      },
      {
        title: "Conserve les particules utiles",
        explanation:
          "Le mot interrogatif peut recevoir une particule ou être suivi d’un nom : 어디에 가요? « où allez-vous ? », 무슨 일을 해요? « quel travail faites-vous ? ».",
      },
    ],
    examples: [
      {
        korean: "화장실이 어디예요?",
        french: "Où sont les toilettes ?",
        parts: [
          { korean: "화장실이", french: "les toilettes", role: "sujet recherché" },
          { korean: "어디예요?", french: "sont où ?", role: "lieu inconnu" },
        ],
      },
      {
        korean: "이거 얼마예요?",
        french: "Combien coûte cet article-ci ?",
        parts: [
          { korean: "이거", french: "cet article-ci", role: "élément évalué" },
          { korean: "얼마예요?", french: "combien coûte-t-il ?", role: "prix inconnu" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Traduire l’ordre français et déplacer systématiquement le mot interrogatif au début.",
        correction: "Remplace seulement l’information inconnue à sa place coréenne : 기차가 언제 와요? « Quand arrive le train ? ».",
      },
      {
        mistake: "Utiliser 얼마 pour demander le degré d’un adjectif, ou oublier le nom après 무슨.",
        correction: "Prix/quantité → 얼마, degré → 얼마나 ; 무슨 doit précéder un nom : 무슨 음식.",
      },
    ],
    memoryTip:
      "Construis la réponse dans ta tête, puis retire uniquement le morceau inconnu : le mot interrogatif prend exactement sa place.",
  },
  "simple-negation": {
    stageId: "simple-negation",
    introduction:
      "Le coréen distingue deux situations souvent confondues en français : 안 nie une action ou un état, tandis que 아니에요 nie une identité ou une catégorie nominale.",
    mainRule:
      "Place 안 juste avant le verbe ou l’adjectif pour dire « ne pas ». Pour dire qu’une personne ou une chose n’est pas un nom, utilise nom + 이/가 아니에요.",
    formula: {
      pattern: "(objet) + 안 + prédicat  ·  nom + 이/가 아니에요",
      explanation:
        "안 매워요 signifie « ce n’est pas épicé » et 커피를 안 마셔요 « je ne bois pas de café ». Pour une identité, 학생이 아니에요 signifie « je ne suis pas étudiant ».",
    },
    steps: [
      {
        title: "Décide ce que tu nies",
        explanation:
          "Une action ou une qualité appelle 안. Une identité, une profession ou une catégorie appelle 아니에요.",
      },
      {
        title: "Place la négation",
        explanation:
          "Mets 안 devant le prédicat : 안 가요, 안 매워요, 안 해요. Ne le place pas devant un nom pour produire une identité négative.",
      },
      {
        title: "Forme la négation nominale",
        explanation:
          "Ajoute 이 après une consonne et 가 après une voyelle, puis 아니에요 : 학생이 아니에요, 의사가 아니에요.",
      },
    ],
    examples: [
      {
        korean: "안 매워요.",
        french: "Ce n’est pas épicé.",
        parts: [
          { korean: "안", french: "ne… pas", role: "négation" },
          { korean: "매워요", french: "être épicé", role: "adjectif" },
        ],
      },
      {
        korean: "학생이 아니에요.",
        french: "Je ne suis pas étudiant.",
        parts: [
          { korean: "학생이", french: "étudiant + sujet", role: "identité niée" },
          { korean: "아니에요", french: "n’est pas", role: "copule négative" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Dire 안이에요 ou 안 예요 pour nier un nom.",
        correction: "Une identité se nie avec 이/가 아니에요 : 학생이 아니에요.",
      },
      {
        mistake: "Confondre 안 et 못 : utiliser 못 pour dire qu’on choisit simplement de ne pas agir.",
        correction: "안 exprime la négation ou le choix ; 못 indique une impossibilité ou une incapacité : 안 가요 / 못 가요.",
      },
    ],
    memoryTip:
      "안 bloque l’action devant le verbe ; 아니에요 corrige une étiquette après le nom. Demande-toi : « je ne fais pas quoi ? » ou « je ne suis pas quoi ? ».",
  },
  "request-item": {
    stageId: "request-item",
    introduction:
      "Pour demander simplement un objet, un plat ou une boisson, le coréen place le nom avant 주세요. Cette formule est directe, polie et très fréquente au café, au restaurant ou au magasin.",
    mainRule:
      "Utilise nom + 주세요. Tu peux ajouter 좀 pour adoucir la demande, mais nom + 주세요 demande une chose, pas une action.",
    formula: { pattern: "objet / plat + (좀) 주세요", explanation: "Le nom demandé arrive avant 주세요 : 물 주세요 signifie « de l’eau, s’il vous plaît ». 좀 ajoute une nuance d’adoucissement." },
    steps: [
      { title: "Nomme ce que tu veux", explanation: "Commence par l’objet, la boisson ou le plat : 물, 영수증, 아이스 아메리카노." },
      { title: "Ajoute 주세요", explanation: "Place 주세요 après le nom pour demander que l’on te donne cette chose : 물 주세요." },
      { title: "Adoucis si nécessaire", explanation: "물 좀 주세요 est plus doux ; 좀 n’est pas obligatoire dans une commande polie." },
    ],
    examples: [
      { korean: "물 주세요.", french: "De l’eau, s’il vous plaît.", parts: [{ korean: "물", french: "de l’eau", role: "objet demandé" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
      { korean: "아이스 아메리카노 주세요.", french: "Un americano glacé, s’il vous plaît.", parts: [{ korean: "아이스 아메리카노", french: "un americano glacé", role: "boisson demandée" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
    ],
    commonMistakes: [
      { mistake: "Dire seulement 주세요 en oubliant l’objet.", correction: "Nomme d’abord la chose : 물 주세요, 영수증 주세요." },
      { mistake: "Utiliser nom + 주세요 pour demander une action.", correction: "Pour une action, conjugue le verbe : 문을 열어 주세요." },
      { mistake: "Confondre « en avez-vous ? » avec une commande directe.", correction: "봉투 있어요? vérifie la disponibilité du sac ; 봉투 주세요. demande qu’on te le donne. Les deux peuvent être naturels, mais ne remplissent pas exactement la même intention." },
      { mistake: "Croire que 좀 est obligatoire.", correction: "커피 주세요. et 커피 좀 주세요. sont tous les deux corrects ; 좀 adoucit la demande sans changer l’objet demandé." },
    ],
    memoryTip: "Montre la chose avec les mots avant 주세요 : nom d’abord, demande ensuite.",
  },
  "request-quantity": {
    stageId: "request-quantity",
    introduction:
      "Pour commander une quantité, indique ce que tu veux, combien et dans quelle unité : une tasse, un billet, un objet ou une portion. Les nombres natifs se raccourcissent devant la plupart des classificateurs de cette leçon, mais 인분 utilise les nombres sino-coréens.",
    mainRule: "Pour 잔, 개, 명 et 장, utilise notamment 한, 두, 세, 네 devant le classificateur (formes courtes de 하나, 둘, 셋, 넷). Pour une portion, utilise 인분 avec un nombre sino-coréen : 2인분 se lit 이 인분.",
    formula: { pattern: "nom + nombre adapté + classificateur + 주세요", explanation: "Le nombre précède le classificateur : 한 잔 = une tasse ; 두 장 = deux billets ; 세 개 = trois objets. Exception importante : 2인분 = deux portions, avec le nombre sino-coréen 이." },
    steps: [
      { title: "Identifie ce que tu comptes", explanation: "Objet ou fruit → 개, personne → 명, boisson en tasse → 잔, billet ou feuille → 장, portion de repas → 인분." },
      { title: "Choisis le nombre", explanation: "Avec 잔, 개, 명, 장, les petites quantités prennent 한, 두, 세, 네. Avec 인분, emploie le sino-coréen : 2인분 (이 인분)." },
      { title: "Ajoute la demande", explanation: "Place le groupe complet avant 주세요 : 아메리카노 한 잔 주세요." },
    ],
    examples: [
      { korean: "아메리카노 한 잔 주세요.", french: "Un americano, s’il vous plaît.", parts: [{ korean: "아메리카노", french: "un americano", role: "élément compté" }, { korean: "한 잔", french: "un verre", role: "nombre + classificateur" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
      { korean: "표 두 장 주세요.", french: "Deux billets, s’il vous plaît.", parts: [{ korean: "표", french: "billet(s)", role: "élément compté" }, { korean: "두 장", french: "deux billets", role: "nombre + classificateur" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
    ],
    commonMistakes: [
      { mistake: "Dire 아메리카노 한 ou placer le nombre après le classificateur.", correction: "Le classificateur est obligatoire et suit le nombre : 아메리카노 한 잔." },
      { mistake: "Employer le mauvais classificateur.", correction: "Choisis l’unité adaptée : 잔 pour une tasse, 장 pour un billet, 명 pour une personne, 개 pour un fruit et 인분 pour une portion." },
      { mistake: "Généraliser les nombres natifs à tous les classificateurs.", correction: "한 잔 et 두 명 utilisent les nombres natifs ; pour une portion de repas, 2인분 se lit 이 인분 avec un nombre sino-coréen." },
      { mistake: "Prendre 첫 잔 pour une quantité neutre.", correction: "첫 잔 est grammatical, mais signifie « la première tasse » d’une série ; pour commander seulement une tasse, dis 한 잔." },
    ],
    memoryTip: "Pense nom → nombre → unité → 주세요. Avec 잔, 명, 개, 장, les petits nombres se raccourcissent ; avec 인분, pense au nombre sino-coréen.",
  },
  "sino-number-contexts": {
    stageId: "sino-number-contexts",
    introduction:
      "Dans la vie quotidienne, les nombres sino-coréens servent notamment à lire les prix, les minutes, les mois, les lignes de métro et les chiffres des numéros de téléphone. Le contexte détermine le bon système de nombres.",
    mainRule:
      "Associe le nombre à ce qui suit : 오천 원 = 5 000 wons, 십 분 = dix minutes, 3월 (삼월) = mars et 2호선 (이호선) = ligne 2. Pour un téléphone, lis chaque chiffre séparément : 010 = 공일공.",
    formula: {
      pattern: "nombre sino-coréen + unité ; téléphone : chiffres séparés",
      explanation:
        "원 exprime un prix, 분 une durée en minutes, 월 un mois et 호선 une ligne de métro. Dans un numéro de téléphone, 0 se prononce couramment 공 ; 영 est aussi possible.",
    },
    steps: [
      {
        title: "Repère l’unité ou le contexte",
        explanation:
          "원 indique des wons ; 분, des minutes ; 월, un mois du calendrier ; 호선, une ligne. Un numéro de téléphone se lit chiffre par chiffre.",
      },
      {
        title: "Lis la valeur sans la changer",
        explanation:
          "오백 원 vaut 500 wons, 오천 원 5 000 et 오만 원 50 000. 구 분 vaut neuf minutes, 십 분 dix minutes et 십일 분 onze minutes.",
      },
      {
        title: "Distingue numéro, date et durée",
        explanation:
          "2호선 désigne une ligne, 2번 출구 une sortie. 3월 est le mois de mars ; 삼 개월 signifie trois mois de durée. 010 se lit 공일공, pas comme un seul nombre.",
      },
    ],
    examples: [
      {
        korean: "이거 만 원이에요.",
        french: "Cet article coûte dix mille wons.",
        parts: [
          { korean: "이거", french: "cet article", role: "objet montré" },
          { korean: "만 원", french: "dix mille wons", role: "prix" },
          { korean: "이에요", french: "est / coûte", role: "identification" },
        ],
      },
      {
        korean: "십 분 후에 출발해요.",
        french: "On part dans dix minutes.",
        parts: [
          { korean: "십 분", french: "dix minutes", role: "durée" },
          { korean: "후에", french: "dans / après", role: "repère temporel" },
          { korean: "출발해요", french: "on part", role: "action" },
        ],
      },
      {
        korean: "2호선이에요.",
        french: "C’est la ligne 2.",
        parts: [
          { korean: "2호선", french: "ligne 2", role: "numéro de ligne" },
          { korean: "이에요", french: "c’est", role: "identification" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Mélanger nombres natifs et sino-coréens pour lire un prix ou des minutes.",
        correction:
          "Utilise 오천 원 pour 5 000 wons et 십 분 pour dix minutes. 열 분 peut compter dix personnes honorifiquement, mais ce n’est pas la lecture attendue pour dix minutes.",
      },
      {
        mistake: "Confondre des nombres égaux associés à des unités différentes.",
        correction:
          "3월 (삼월) indique mars, 삼 개월 une durée de trois mois et 3일 le troisième jour du mois. 2호선 indique une ligne, 2번 출구 une sortie.",
      },
      {
        mistake: "Regrouper les chiffres d’un téléphone comme un nombre entier.",
        correction:
          "Lis chaque chiffre séparément : 010 devient 공일공 dans l’usage courant. 영 peut aussi se lire pour zéro ; il ne faut pas traiter 영일영 comme une erreur de sens.",
      },
    ],
    memoryTip:
      "Regarde l’unité avant de lire : 원 = prix, 분 = minutes, 월 = mois, 호선 = ligne. Pour un téléphone, lis chaque chiffre un par un.",
  },
  "coordinate-items": {
    stageId: "coordinate-items",
    introduction:
      "Pour commander plusieurs produits, on les relie avec 하고 ou (이)랑 : ces deux formes peuvent signifier « et ». Devant une action, elles permettent aussi d’indiquer une personne avec qui l’on fait quelque chose.",
    mainRule:
      "하고 se place après un nom sans changer de forme. Avec (이)랑, ajoute 이랑 après une consonne finale (밥이랑, 학생이랑) et 랑 après une voyelle (친구랑). Ces deux connecteurs peuvent relier des éléments ou exprimer « avec ». Ne les confonds pas avec (이)나 (« ou ») ou 만 (« seulement »).",
    formula: {
      pattern: "nom + 하고 / (이)랑 + nom + 주세요 ; personne + (이)랑 + verbe",
      explanation:
        "커피하고 케이크 주세요. réunit deux produits. 밥이랑 국 주세요. fait de même avec (이)랑. 친구랑 가요. signifie « J’y vais avec un ami ».",
    },
    steps: [
      {
        title: "Détermine l’intention",
        explanation:
          "Pour obtenir les deux produits, utilise un connecteur signifiant « et ». Pour dire avec qui tu vas quelque part, le même (이)랑 peut exprimer l’accompagnement.",
      },
      {
        title: "Choisis la forme après le nom",
        explanation:
          "하고 fonctionne après tout nom. Avec (이)랑, observe la syllabe finale : 친구랑 (voyelle) ; 학생이랑 ou 밥이랑 (consonne finale).",
      },
      {
        title: "Vérifie le sens de la phrase",
        explanation:
          "커피하고 케이크 주세요. demande les deux. 커피나 케이크 주세요. propose « café ou gâteau » et 커피만 주세요. limite la demande au café.",
      },
    ],
    examples: [
      {
        korean: "커피하고 케이크 주세요.",
        french: "Un café et un gâteau, s’il vous plaît.",
        parts: [
          { korean: "커피하고", french: "café et", role: "premier produit + liaison" },
          { korean: "케이크", french: "gâteau", role: "second produit" },
          { korean: "주세요", french: "s’il vous plaît", role: "commande" },
        ],
      },
      {
        korean: "밥이랑 국 주세요.",
        french: "Du riz et de la soupe, s’il vous plaît.",
        parts: [
          { korean: "밥이랑", french: "riz et", role: "liaison après consonne finale" },
          { korean: "국", french: "soupe", role: "second produit" },
          { korean: "주세요", french: "s’il vous plaît", role: "commande" },
        ],
      },
      {
        korean: "친구랑 가요.",
        french: "J’y vais avec un ami.",
        parts: [
          { korean: "친구랑", french: "avec un ami", role: "accompagnement après voyelle" },
          { korean: "가요", french: "je vais", role: "action" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Croire que 하고 et (이)랑 expriment deux sens incompatibles.",
        correction:
          "커피하고 케이크 주세요. et 커피랑 케이크 주세요. sont deux façons naturelles de commander les deux produits. 친구랑 가요. et 친구하고 가요. peuvent tous deux exprimer « avec un ami ».",
      },
      {
        mistake: "Choisir 랑 ou 이랑 sans regarder le nom.",
        correction:
          "Après une voyelle, utilise 랑 : 친구랑. Après une consonne finale, utilise 이랑 : 학생이랑, 밥이랑.",
      },
      {
        mistake: "Confondre addition, alternative et restriction.",
        correction:
          "커피하고 케이크 주세요. commande les deux. 커피나 케이크 주세요. présente une alternative ; 커피만 주세요. signifie « seulement du café ».",
      },
      {
        mistake: "Confondre l’accompagnateur et le sujet de l’action.",
        correction:
          "친구랑 가요. signifie « J’y vais avec un ami » dans le contexte. 친구가 가요. dit que l’ami y va ; 친구만 가요. dit que seul l’ami y va.",
      },
    ],
    memoryTip:
      "Pour commander les deux, pense « et » : 하고 ou (이)랑. Pour « avec », pense aussi (이)랑. Consonne → 이랑 ; voyelle → 랑. (이)나 signifie « ou » et 만 « seulement ».",
  },
  "choose-alternative": {
    stageId: "choose-alternative",
    introduction:
      "Quand tu ne choisis pas encore entre deux possibilités, le coréen utilise « ou ». Pour deux noms, tu peux employer (이)나 ; pour opposer deux questions ou propositions complètes, 아니면 est très naturel. Le sens doit rester différent de « et » ou de « seulement ».",
    mainRule:
      "Attache 나 après un nom terminé par une voyelle (커피나 차, 버스나 지하철) et 이나 après un nom terminé par une consonne finale (빵이나 케이크, 물이나 차). Entre deux propositions, utilise 아니면. 아니면 peut aussi présenter deux noms comme alternatives à l’oral.",
    formula: {
      pattern: "nom + (이)나 + nom ; question + 아니면 + question",
      explanation:
        "커피나 차 : café ou thé ; 빵이나 케이크 : pain ou gâteau. 지금 가요? 아니면 집에 있어요? : « Tu pars maintenant ? Ou tu restes chez toi ? ».",
    },
    steps: [
      {
        title: "Vérifie le sens voulu",
        explanation:
          "« Ou » laisse deux possibilités. Avec 하고, tu réunis les deux (« et ») ; avec 만, tu limites la phrase à un seul élément (« seulement »).",
      },
      {
        title: "Pour deux noms, regarde leur finale",
        explanation:
          "커피 se termine par une voyelle : 커피나 차. 빵 se termine par ㅇ : 빵이나 케이크. Évite 커피이나 et 빵나.",
      },
      {
        title: "Pour deux questions, propose l’autre option",
        explanation:
          "지금 가요? 아니면 집에 있어요? demande de choisir entre partir maintenant et rester à la maison. 그리고 ajouterait une question au lieu de poser le même choix.",
      },
    ],
    examples: [
      {
        korean: "커피나 차 있어요?",
        french: "Avez-vous du café ou du thé ?",
        parts: [
          { korean: "커피나 차", french: "café ou thé", role: "deux noms alternatifs" },
          { korean: "있어요?", french: "y en a-t-il ?", role: "disponibilité" },
        ],
      },
      {
        korean: "빵이나 케이크를 먹어요.",
        french: "Je mange du pain ou du gâteau.",
        parts: [
          { korean: "빵이나", french: "pain ou", role: "alternative après consonne" },
          { korean: "케이크를", french: "du gâteau", role: "second aliment" },
          { korean: "먹어요", french: "je mange", role: "action" },
        ],
      },
      {
        korean: "지금 가요? 아니면 집에 있어요?",
        french: "Tu pars maintenant ? Ou tu restes chez toi ?",
        parts: [
          { korean: "지금 가요?", french: "tu pars maintenant ?", role: "première question" },
          { korean: "아니면", french: "ou alors", role: "alternative" },
          { korean: "집에 있어요?", french: "tu restes chez toi ?", role: "seconde question" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Oublier le 받침 lors du choix entre 이나 et 나.",
        correction:
          "Après 커피 (voyelle), dis 커피나 차, pas 커피이나 차. Après 빵 (consonne finale), dis 빵이나 케이크, pas 빵나 케이크.",
      },
      {
        mistake: "Utiliser 하고 pour dire « ou ».",
        correction:
          "커피하고 차 réunit café et thé, tandis que 커피나 차 laisse le choix. 버스하고 지하철을 타요 suggère les deux transports, contrairement à 버스나 지하철로 가요.",
      },
      {
        mistake: "Employer 만 lorsqu’on veut garder les deux possibilités.",
        correction:
          "물만 마셔요 signifie « je bois seulement de l’eau ». 물이나 차를 마셔요 signifie « je bois de l’eau ou du thé ».",
      },
      {
        mistake: "Croire que 아니면 ne s’utilise qu’entre deux phrases.",
        correction:
          "아니면 relie naturellement deux questions complètes, mais peut aussi relier des noms dans une alternative orale, par exemple 카드 아니면 현금.",
      },
    ],
    memoryTip:
      "Pour deux noms : voyelle → 나, consonne → 이나. Pour deux questions : 아니면 (« ou alors »). 하고 = « et » ; 만 = « seulement ».",
  },
  "request-action": {
    stageId: "request-action",
    introduction: "Pour demander poliment à quelqu’un de faire quelque chose, le coréen conjugue le verbe puis ajoute 주세요. Cette formule se distingue de nom + 주세요, qui demande un objet.",
    mainRule: "Retire 다, forme le présent en -아/어, puis ajoute 주세요 : 말하다 → 말해 주세요. La construction porte sur l’action attendue du destinataire.",
    formula: { pattern: "radical + 아/어 주세요", explanation: "La forme conjuguée indique l’action et 주세요 transforme cette action en demande polie : 열어 주세요, « ouvrez, s’il vous plaît »." },
    steps: [
      { title: "Choisis l’action", explanation: "Demande-toi ce que l’autre doit faire : parler, montrer, attendre ou ouvrir." },
      { title: "Conjugue avant 주세요", explanation: "말하다 devient 말해, 열다 devient 열어, 기다리다 devient 기다려. N’ajoute pas 주세요 à la forme du dictionnaire." },
      { title: "Garde l’objet", explanation: "L’objet conserve sa particule : 문을 열어 주세요. Pour demander l’objet lui-même, dis 문 주세요." },
    ],
    examples: [
      { korean: "다시 말해 주세요.", french: "Répétez, s’il vous plaît.", parts: [{ korean: "다시", french: "encore", role: "précision" }, { korean: "말해 주세요", french: "dites, s’il vous plaît", role: "demande d’action" }] },
      { korean: "문을 열어 주세요.", french: "Ouvrez la porte, s’il vous plaît.", parts: [{ korean: "문을", french: "la porte", role: "objet de l’action" }, { korean: "열어 주세요", french: "ouvrez, s’il vous plaît", role: "demande d’action" }] },
    ],
    commonMistakes: [
      { mistake: "Dire 말하다 주세요 ou 열다 주세요.", correction: "Conjugue le verbe avant 주세요 : 말해 주세요, 열어 주세요." },
      { mistake: "Confondre la demande d’une chose et celle d’une action.", correction: "Nom + 주세요 demande un objet ; verbe en -아/어 주세요 demande que l’autre agisse." },
    ],
    memoryTip: "Avant 주세요, écoute ce qui vient : un nom = donne-moi cela ; un verbe conjugué = fais cela pour moi.",
  },
  "polite-instructions": {
    stageId: "polite-instructions",
    introduction: "-(으)세요 est la forme polie de l’impératif coréen : elle sert à demander directement de descendre, d’aller, de lire ou de s’asseoir. En coréen courant, -아/어 주세요 demande plutôt un service précis.",
    mainRule: "Ajoute 세요 après une voyelle, 으세요 après une consonne. Après un radical en ㄹ, le ㄹ disparaît avant 세요 : 살다 → 사세요.",
    formula: { pattern: "radical + (으)세요", explanation: "내리다 → 내리세요 et 앉다 → 앉으세요. La terminaison peut aussi prendre une nuance d’invitation respectueuse." },
    steps: [
      { title: "Pars du radical", explanation: "Retire 다 : 내리다 donne 내리-, 가다 donne 가-, 앉다 donne 앉-." },
      { title: "Adapte au dernier son", explanation: "Voyelle → 세요 : 가세요. Consonne → 으세요 : 앉으세요. Avec ㄹ, supprime ㄹ : 살다 → 사세요." },
      { title: "Choisis la bonne forme", explanation: "Pour donner une consigne ou une invitation à l’impératif poli, emploie -(으)세요. Pour demander un service précis, -아/어 주세요 est souvent plus adapté." },
    ],
    examples: [
      { korean: "여기에서 내리세요.", french: "Descendez ici.", parts: [{ korean: "여기에서", french: "ici", role: "lieu de l’action" }, { korean: "내리세요", french: "descendez", role: "impératif poli" }] },
      { korean: "이쪽 가세요.", french: "Allez par ici.", parts: [{ korean: "이쪽", french: "par ici", role: "direction" }, { korean: "가세요", french: "allez", role: "impératif poli" }] },
    ],
    commonMistakes: [
      { mistake: "Former 가으세요 ou 앉세요 sans tenir compte du dernier son.", correction: "Voyelle → 가세요 ; consonne → 앉으세요. Le choix dépend du radical pour former l’impératif poli." },
      { mistake: "Employer -(으)세요 pour demander une aide personnelle précise.", correction: "Pour demander un service, préfère -아/어 주세요 : 문을 열어 주세요." },
    ],
    memoryTip: "Voyelle, 세요 ; consonne, 으세요 ; ㄹ tombe. Cette terminaison forme l’impératif poli ; pour un service, utilise plutôt -아/어 주세요.",
  },
  "direction-and-means": {
    stageId: "direction-and-means",
    introduction: "(으)로 indique la direction suivie ou le moyen utilisé. La même particule peut donc guider vers la droite, par le métro ou avec une carte.",
    mainRule: "Ajoute 으로 après une consonne sauf ㄹ, et 로 après une voyelle ou ㄹ. Le contexte indique si le groupe exprime une direction ou un moyen.",
    formula: { pattern: "direction + (으)로 + verbe  ·  moyen + (으)로 + verbe", explanation: "오른쪽으로 가세요 signifie « allez vers la droite » ; 지하철로 가요 signifie « j’y vais en métro »." },
    steps: [
      { title: "Détermine le rôle", explanation: "Un côté ou un chemin donne une direction. Un véhicule, un outil ou un mode de paiement donne un moyen." },
      { title: "Observe le dernier son", explanation: "Consonne → 으로 : 오른쪽으로. Voyelle → 로 : 카드로. Avec ㄹ, choisis aussi 로 : 서울로." },
      { title: "Ne confonds pas avec 에", explanation: "에 marque une destination précise ; (으)로 met l’accent sur le chemin ou le moyen : 서울에 가요, 지하철로 가요." },
    ],
    examples: [
      { korean: "카드로 할게요.", french: "Ce sera par carte.", parts: [{ korean: "카드로", french: "par carte", role: "moyen" }, { korean: "할게요", french: "je vais choisir", role: "décision" }] },
      { korean: "지하철로 가요.", french: "J’y vais en métro.", parts: [{ korean: "지하철로", french: "en métro", role: "moyen de transport" }, { korean: "가요", french: "je vais", role: "déplacement" }] },
    ],
    commonMistakes: [
      { mistake: "Dire 지하철에 가요 pour exprimer « en métro ».", correction: "Le métro est le moyen : 지하철로 가요. La destination, elle, prend 에." },
      { mistake: "Ajouter 으로 après ㄹ, comme 서울으로.", correction: "Après ㄹ, utilise 로 : 서울로." },
    ],
    memoryTip: "(으)로 montre la route ou l’outil du déplacement ; 에 nomme le point d’arrivée.",
  },
  "express-desire": {
    stageId: "express-desire",
    introduction: "-고 싶어요 exprime le souhait du locuteur : ce que je veux faire ou ce que j’aimerais faire. La forme se construit avec le radical du verbe, jamais avec la forme du dictionnaire complète.",
    mainRule: "Retire 다, ajoute 고 싶어요 au radical, et garde les particules de l’objet ou du lieu avant le verbe : 카드를 사고 싶어요.",
    formula: { pattern: "radical + 고 싶어요", explanation: "고 싶어요 signifie « vouloir faire » : 가다 → 가고 싶어요, 먹다 → 먹고 싶어요." },
    steps: [
      { title: "Choisis l’action désirée", explanation: "Le souhait porte sur une action : acheter, manger, aller ou apprendre." },
      { title: "Retire 다 et ajoute 고 싶어요", explanation: "사다 devient 사고 싶어요, 가다 devient 가고 싶어요. Il n’y a pas de changement selon la voyelle finale." },
      { title: "Garde les compléments", explanation: "L’objet conserve 을/를 : 티머니 카드를 사고 싶어요. Le verbe final est 싶어요." },
    ],
    examples: [
      { korean: "티머니 카드를 사고 싶어요.", french: "Je voudrais acheter une carte T-money.", parts: [{ korean: "티머니 카드를", french: "une carte T-money", role: "objet désiré" }, { korean: "사고 싶어요", french: "je voudrais acheter", role: "souhait" }] },
      { korean: "한국에 가고 싶어요.", french: "Je veux aller en Corée.", parts: [{ korean: "한국에", french: "en Corée", role: "destination" }, { korean: "가고 싶어요", french: "je veux aller", role: "souhait" }] },
    ],
    commonMistakes: [
      { mistake: "Dire 사고다 싶어요 ou ajouter 고 싶어요 à un nom.", correction: "Retire 다 et attache 고 싶어요 au radical verbal : 사다 → 사고 싶어요." },
      { mistake: "Présenter comme certain le souhait d’une autre personne.", correction: "Pour demander son souhait, pose une question : 뭐 먹고 싶어요?" },
    ],
    memoryTip: "Le souhait s’accroche au verbe : radical + 고 싶어요. L’objet reste devant, avec sa particule.",
  },
  "express-ability": {
    stageId: "express-ability",
    introduction: "-(으)ㄹ 수 있어요/없어요 exprime une capacité personnelle ou la faisabilité réelle d’une action dans une situation. La construction répond à « est-ce possible ? », pas à « est-ce permis ? ».",
    mainRule: "Ajoute ㄹ 수 있어요 après une voyelle et 을 수 있어요 après une consonne. Cette forme ne demande jamais directement la permission : elle vérifie si l’action est réalisable. Remplace 있어요 par 없어요 pour dire que l’action est impossible.",
    formula: { pattern: "radical + (으)ㄹ 수 있어요 / 없어요", explanation: "읽다 devient 읽을 수 있어요, 가다 devient 갈 수 있어요. 수 exprime ici la possibilité." },
    steps: [
      { title: "Identifie le type de possibilité", explanation: "Demande-toi si tu parles d’une capacité personnelle ou de la faisabilité de l’action dans la situation." },
      { title: "Ajoute (으)ㄹ 수", explanation: "Après une voyelle, ㄹ 수 : 가다 → 갈 수. Après une consonne, 을 수 : 읽다 → 읽을 수." },
      { title: "Choisis 있어요 ou 없어요", explanation: "Possibilité présente → 있어요. Impossibilité → 없어요 : 할 수 없어요." },
    ],
    examples: [
      { korean: "여기서 충전할 수 있어요?", french: "Est-il possible de recharger ma carte ici ?", parts: [{ korean: "여기서", french: "ici", role: "lieu de l’action" }, { korean: "충전할 수 있어요?", french: "est-il possible de recharger ?", role: "possibilité" }] },
      { korean: "한국어를 읽을 수 있어요.", french: "Je sais lire le coréen.", parts: [{ korean: "한국어를", french: "le coréen", role: "objet" }, { korean: "읽을 수 있어요", french: "je peux lire", role: "capacité" }] },
    ],
    commonMistakes: [
      { mistake: "Utiliser -아/어도 돼요? pour demander si l’action est possible.", correction: "Possibilité/capacité → -(으)ㄹ 수 있어요? ; autorisation → -아/어도 돼요?. -(으)ㄹ 수 있어요? ne demande jamais directement la permission." },
      { mistake: "Oublier 을/ㄹ avant 수.", correction: "Retire 다 puis forme 갈 수 ou 읽을 수 avant d’ajouter 있어요/없어요." },
    ],
    memoryTip: "수 est la place de la possibilité : radical + (으)ㄹ 수, puis 있어요 si elle existe, 없어요 si elle n’existe pas.",
  },
  "ask-permission": {
    stageId: "ask-permission",
    introduction: "-아/어도 돼요? demande si une action est autorisée. La question porte sur la règle ou l’accord de l’interlocuteur, pas sur ta capacité à réaliser l’action.",
    mainRule: "Conjugue le verbe en -아/어, ajoute 도 돼요? pour demander si l’action est autorisée, puis garde la question à la fin : 사진 찍어도 돼요?",
    formula: { pattern: "verbe en -아/어 + 도 돼요?", explanation: "찍다 devient 찍어도 돼요? et 앉다 devient 앉아도 돼요? La réponse négative fréquente est 안 돼요." },
    steps: [
      { title: "Formule l’action", explanation: "Choisis l’action dont tu veux vérifier l’autorisation : prendre une photo, t’asseoir ou ouvrir." },
      { title: "Conjugue avant 도", explanation: "찍다 → 찍어도, 앉다 → 앉아도, 하다 → 해도. 도 suit la forme conjuguée." },
      { title: "Pose la question", explanation: "Termine par 돼요? : 사진 찍어도 돼요? signifie « est-ce permis de prendre une photo ? »." },
    ],
    examples: [
      { korean: "사진 찍어도 돼요?", french: "Puis-je prendre une photo ?", parts: [{ korean: "사진", french: "une photo", role: "objet" }, { korean: "찍어도 돼요?", french: "puis-je prendre ?", role: "permission" }] },
      { korean: "여기 앉아도 돼요?", french: "Puis-je m’asseoir ici ?", parts: [{ korean: "여기", french: "ici", role: "lieu" }, { korean: "앉아도 돼요?", french: "puis-je m’asseoir ?", role: "permission" }] },
    ],
    commonMistakes: [
      { mistake: "Dire -(으)ㄹ 수 있어요? lorsqu’on demande l’accord de quelqu’un.", correction: "La permission se demande avec -아/어도 돼요? ; 수 있어요? vérifie la possibilité." },
      { mistake: "Ajouter 도 à la forme du dictionnaire : 찍다도 돼요?.", correction: "Conjugue d’abord : 찍다 → 찍어도 돼요?." },
    ],
    memoryTip: "도 돼요? demande « est-ce permis ? ». La forme conjuguée arrive avant 도, comme une marche avant la question.",
  },
  "express-inability": {
    stageId: "express-inability",
    introduction: "Ce module entraîne uniquement 못 pour dire qu’une action est impossible ou hors de tes capacités. La négation 안 est rappelée pour éviter la confusion : 안 dit que l’action n’est pas faite ou qu’on choisit de ne pas la faire.",
    mainRule: "Place 못 juste avant le verbe : 못 가요, 못 먹어요. Avec un verbe en 하다, place 못 devant 해요 : 운전을 못 해요.",
    formula: { pattern: "못 + verbe conjugué", explanation: "못 가요 signifie « je ne peux pas y aller » : une contrainte, une limite ou la situation empêche l’action. 안 가요 signifie « je n’y vais pas » : ce n’est pas la forme travaillée ici." },
    steps: [
      { title: "Cherche l’empêchement", explanation: "Utilise 못 si l’action est impossible à cause de la situation, d’une limite ou d’une compétence insuffisante." },
      { title: "Place 못 devant l’action", explanation: "못 précède le verbe conjugué : 못 알아들어요, 못 먹어요. Il ne se place pas après le verbe." },
      { title: "Ne confonds pas avec 안", explanation: "Choix ou négation simple → 안. Incapacité ou empêchement → 못 : 안 가요 / 못 가요. Dans les exercices de ce module, la situation indique toujours un empêchement et la réponse attendue est donc en 못." },
    ],
    examples: [
      { korean: "잘 못 알아들어요.", french: "Je ne comprends pas bien.", parts: [{ korean: "잘", french: "bien", role: "degré" }, { korean: "못 알아들어요", french: "je ne peux pas comprendre", role: "incapacité" }] },
      { korean: "매운 음식을 못 먹어요.", french: "Je ne peux pas manger de plats épicés.", parts: [{ korean: "매운 음식을", french: "des plats épicés", role: "objet" }, { korean: "못 먹어요", french: "ne peux pas manger", role: "incapacité" }] },
      { korean: "아파서 오늘 못 가요.", french: "Je ne peux pas y aller aujourd’hui parce que je suis malade.", parts: [{ korean: "아파서", french: "parce que je suis malade", role: "empêchement" }, { korean: "오늘 못 가요", french: "je ne peux pas y aller aujourd’hui", role: "incapacité" }] },
    ],
    commonMistakes: [
      { mistake: "Employer 안 pour exprimer une incapacité.", correction: "Dis 못 가요 si tu ne peux réellement pas y aller ; 안 가요 exprime plutôt le choix ou la négation." },
      { mistake: "Confondre une difficulté de perception et le choix de ne pas écouter.", correction: "잘 안 들려요 (« je n’entends pas bien ») peut aussi être naturel en cas de douleur à l’oreille : ce n’est pas une erreur. 못 들어요 exprime ici un empêchement à écouter ; 듣고 싶지 않아요 signifie plutôt « je ne veux pas écouter »." },
      { mistake: "Placer 못 après le verbe ou conserver 못 하다 dans un verbe composé.", correction: "Place-le avant l’action conjuguée : 못 해요, 운전을 못 해요." },
    ],
    memoryTip: "안 ferme la porte par choix ; 못 dit que la porte ne s’ouvre pas. Pour ce module, cherche toujours la cause qui empêche l’action et place 못 juste devant le verbe.",
  },
  "add-item": {
    stageId: "add-item",
    introduction: "도 ajoute un élément à ce qui vient d’être dit : « aussi » ou parfois « même ». La particule se colle au groupe ajouté et remplace généralement la particule précédente.",
    mainRule: "Attache 도 au nom ou au groupe que tu ajoutes : 물도 주세요, « de l’eau aussi ». Quand 도 remplace une particule, ne conserve pas 은/는, 이/가 ou 을/를.",
    formula: { pattern: "élément ajouté + 도 + prédicat", explanation: "도 peut marquer une personne ou un objet : 저도 가요, 김치도 주세요. Compare 물도 주세요 (« de l’eau aussi »), 물을 주세요 (« de l’eau ») et 물만 주세요 (« seulement de l’eau »)." },
    steps: [
      { title: "Repère ce qui est déjà là", explanation: "Identifie la personne ou la chose déjà mentionnée : quelqu’un commande, part, boit ou choisit un élément." },
      { title: "Ajoute le nouvel élément", explanation: "Colle 도 au groupe ajouté : 물도, 저도, 김치도. Avec un nom qui portait 을/를, 은/는 ou 이/가, 도 prend généralement sa place." },
      { title: "Vérifie le sens", explanation: "도 signifie « aussi ». Une phrase neutre comme 물을 주세요 demande de l’eau ; 만 signifie « seulement » et change la consigne : 물만 주세요." },
    ],
    examples: [
      { korean: "물도 주세요.", french: "De l’eau aussi, s’il vous plaît.", parts: [{ korean: "물도", french: "de l’eau aussi", role: "élément ajouté" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
      { korean: "저도 가요.", french: "Moi aussi, j’y vais.", parts: [{ korean: "저도", french: "moi aussi", role: "personne ajoutée" }, { korean: "가요", french: "je vais", role: "action" }] },
      { korean: "커피도 마셔요.", french: "Je bois aussi du café.", parts: [{ korean: "커피도", french: "du café aussi", role: "boisson ajoutée" }, { korean: "마셔요", french: "je bois", role: "action" }] },
    ],
    commonMistakes: [
      { mistake: "Écrire 저는도 ou 물을도 en conservant la particule précédente.", correction: "도 remplace généralement la particule : 저도, 물도." },
      { mistake: "Choisir 도 simplement parce qu’un nouvel objet apparaît.", correction: "Vérifie qu’un autre élément est déjà présent dans le contexte : 물도 signifie « de l’eau aussi », tandis que 물을 reste une demande neutre." },
      { mistake: "Confondre 도 avec 만.", correction: "도 ajoute un élément : 빵도 주세요, « du pain aussi ». 만 limite le choix : 빵만 주세요, « seulement du pain »." },
      { mistake: "Confondre 도 avec 하고.", correction: "« aussi » → 도 ; « et / avec » → 하고 ou (이)랑." },
    ],
    memoryTip: "도 signifie « ajoute celui-ci aussi » : colle-le directement à l’élément qui rejoint la scène.",
  },
  "limit-request": {
    stageId: "limit-request",
    introduction: "Cette leçon entraîne la forme affirmative 만 있어요 pour annoncer qu’un seul élément est disponible. Contrairement à 도, 만 n’ajoute pas : il restreint l’information à l’élément indiqué.",
    mainRule: "Attache 만 directement au groupe disponible, puis termine par 있어요 : 물만 있어요, « il n’y a que de l’eau ». Cette forme sert à annoncer ce qui est disponible. Comme 도, 만 remplace généralement la particule précédente.",
    formula: { pattern: "élément disponible + 만 + 있어요", explanation: "Place 만 après le groupe complet : 물만 있어요, 커피만 있어요. Ici, on garde la phrase affirmative de la leçon." },
    steps: [
      { title: "Repère l’élément disponible", explanation: "Identifie l’unique élément que tu veux annoncer : de l’eau, du café ou une autre boisson." },
      { title: "Place 만 après ce groupe", explanation: "Colle 만 au groupe complet : 물만, 커피만. Le classificateur reste avant 만." },
      { title: "Garde 있어요", explanation: "La leçon demande une phrase affirmative : élément + 만 + 있어요. Ne remplace pas cette forme par une négation." },
    ],
    examples: [
      { korean: "물만 있어요.", french: "Il n’y a que de l’eau.", parts: [{ korean: "물만", french: "seulement de l’eau", role: "élément disponible" }, { korean: "있어요", french: "il y a", role: "existence affirmative" }] },
      { korean: "커피만 있어요.", french: "Il n’y a que du café.", parts: [{ korean: "커피만", french: "seulement du café", role: "élément disponible" }, { korean: "있어요", french: "il y a", role: "existence affirmative" }] },
    ],
    commonMistakes: [
      { mistake: "Utiliser 도 pour dire « seulement ».", correction: "La restriction se marque avec 만 : 물만." },
      { mistake: "Remplacer 만 있어요 par 밖에 없어요.", correction: "밖에 + 없어요 exprime aussi une exclusion, mais avec une construction négative. Cette leçon entraîne uniquement la forme affirmative 만 있어요 ; pour parler de ce que l’on possède, 밖에 없어요 peut toutefois sonner plus naturel." },
    ],
    memoryTip: "Annonce d’abord l’élément disponible, colle 만, puis garde 있어요 : 물만 있어요. La forme négative 밖에 없어요 appartient à une autre construction.",
  },
  "range-and-limit": {
    stageId: "range-and-limit",
    introduction: "부터 et 까지 encadrent une période, un trajet ou une limite. 부터 marque le point de départ et 까지 le point d’arrivée ; ils peuvent être employés ensemble ou séparément.",
    mainRule: "Ajoute 부터 après le début et 까지 après la fin ou la limite : 아홉 시부터 다섯 시까지, « de neuf heures à cinq heures ». ",
    formula: { pattern: "début + 부터 + fin / limite + 까지", explanation: "La paire porte sur le temps ou l’espace : 월요일부터 금요일까지 ou 서울역까지." },
    steps: [
      { title: "Repère le départ", explanation: "Le jour, l’heure ou le lieu de départ reçoit 부터 : 아홉 시부터, 월요일부터." },
      { title: "Repère la limite", explanation: "La fin d’une période ou d’un trajet reçoit 까지 : 다섯 시까지, 서울역까지." },
      { title: "Utilise un seul marqueur si besoin", explanation: "Pour dire seulement « jusqu’à », 까지 suffit. 부터 peut aussi marquer seul un début." },
    ],
    examples: [
      { korean: "아홉 시부터 다섯 시까지예요.", french: "Les horaires sont de neuf heures à cinq heures.", parts: [{ korean: "아홉 시부터", french: "à partir de neuf heures", role: "début" }, { korean: "다섯 시까지", french: "jusqu’à cinq heures", role: "fin" }, { korean: "예요", french: "sont", role: "identification" }] },
      { korean: "서울역까지 가요.", french: "Je vais jusqu’à la gare de Séoul.", parts: [{ korean: "서울역까지", french: "jusqu’à la gare de Séoul", role: "limite du trajet" }, { korean: "가요", french: "je vais", role: "déplacement" }] },
    ],
    commonMistakes: [
      { mistake: "Utiliser 에 pour exprimer toute la période : 아홉 시에 다섯 시에.", correction: "Le début et la fin se marquent avec 부터 et 까지 : 아홉 시부터 다섯 시까지." },
      { mistake: "Croire que 까지 exige toujours 부터.", correction: "Pour une limite seule, 까지 suffit : 서울역까지 가요." },
    ],
    memoryTip: "부터 lance la ligne, 까지 la termine. Imagine deux bornes autour de la période ou du trajet.",
  },
  "past-event": {
    stageId: "past-event",
    introduction:
      "Pour raconter un événement terminé, le coréen utilise la terminaison polie -았/었어요. Un repère comme 어제 ou 지난주 aide à situer l’action, mais c’est surtout la terminaison du verbe qui indique le passé.",
    mainRule:
      "Retire 다, puis ajoute 았어요 après ㅏ ou ㅗ et 었어요 dans les autres cas. 하다 devient 했어요. Les voyelles se contractent souvent : 가다 devient 갔어요 et 보다 devient 봤어요.",
    formula: {
      pattern: "radical + 았어요 / 었어요  ·  하다 → 했어요",
      explanation:
        "Le radical porte le sens de l’action et la terminaison la présente comme achevée. La forme finale reste polie et se place à la fin de la phrase.",
    },
    steps: [
      {
        title: "Repère l’action terminée",
        explanation:
          "Cherche ce qui s’est déjà produit : réserver, manger, voir ou étudier. Un mot comme 어제, « hier », confirme souvent le repère temporel.",
      },
      {
        title: "Choisis 았 ou 었",
        explanation:
          "Après ㅏ ou ㅗ, choisis 았어요 : 가다 → 갔어요. Pour les autres voyelles, choisis 었어요 : 먹다 → 먹었어요.",
      },
      {
        title: "Vérifie la contraction",
        explanation:
          "Certaines formes se raccourcissent à l’écrit : 보았어요 devient 봤어요, et 하였어요 devient 했어요. Apprends la forme réellement utilisée.",
      },
    ],
    examples: [
      {
        korean: "어제 영화를 봤어요.",
        french: "J’ai regardé un film hier.",
        parts: [
          { korean: "어제", french: "hier", role: "repère passé" },
          { korean: "영화를", french: "un film", role: "objet" },
          { korean: "봤어요", french: "j’ai regardé", role: "보다 → 봤어요" },
        ],
      },
      {
        korean: "예약했어요.",
        french: "J’ai réservé.",
        parts: [
          { korean: "예약", french: "réservation", role: "base nominale" },
          { korean: "했어요", french: "j’ai fait / réservé", role: "하다 → 했어요" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Construire 가었어요 ou 보았어요 dans une phrase débutante sans reconnaître la contraction.",
        correction: "Utilise les formes courantes 갔어요 et 봤어요 ; elles viennent bien de 가다 et 보다 au passé.",
      },
      {
        mistake: "Garder le présent ou le futur avec un repère passé : 어제 영화를 봐요.",
        correction: "Quand l’action est terminée, conjugue le prédicat au passé : 어제 영화를 봤어요.",
      },
    ],
    memoryTip:
      "Le passé ferme une action déjà terminée : observe ㅏ/ㅗ, choisis 았 ou 었, puis vérifie la forme contractée.",
  },
  "future-plan": {
    stageId: "future-plan",
    introduction:
      "-(으)ㄹ 거예요 sert à annoncer un projet prévu ou une prévision. La forme parle de ce qui est envisagé, sans mettre au premier plan une décision prise en réaction à l’interlocuteur.",
    mainRule:
      "Retire 다 et ajoute ㄹ 거예요 après une voyelle, 을 거예요 après une consonne sauf ㄹ : 가다 → 갈 거예요, 먹다 → 먹을 거예요. Après ㄹ, garde ㄹ : 살다 → 살 거예요.",
    formula: {
      pattern: "radical + ㄹ 거예요 / 을 거예요",
      explanation:
        "거예요 suit le radical et transforme l’action en projet ou en prévision. Le lieu, le moment et l’objet gardent leurs particules avant le verbe.",
    },
    steps: [
      {
        title: "Identifie le projet",
        explanation:
          "Demande-toi si l’action est prévue ou probable : partir demain, rencontrer un ami ce week-end, lire un livre.",
      },
      {
        title: "Observe le dernier son",
        explanation:
          "Après une voyelle, ajoute ㄹ : 가다 → 갈 거예요. Après une consonne, ajoute 을 : 먹다 → 먹을 거예요, 읽다 → 읽을 거예요. Un radical en ㄹ garde ㄹ : 살다 → 살 거예요.",
      },
      {
        title: "Garde les compléments",
        explanation:
          "Le moment et la destination restent avant la forme future : 내일 서울에 갈 거예요, « demain, j’irai à Séoul ».",
      },
    ],
    examples: [
      {
        korean: "내일 서울에 갈 거예요.",
        french: "Demain, j’irai à Séoul.",
        parts: [
          { korean: "내일", french: "demain", role: "moment futur" },
          { korean: "서울에", french: "à Séoul", role: "destination" },
          { korean: "갈 거예요", french: "j’irai / je vais aller", role: "projet" },
        ],
      },
      {
        korean: "주말에 친구를 만날 거예요.",
        french: "Je vais voir un ami ce week-end.",
        parts: [
          { korean: "주말에", french: "ce week-end", role: "moment prévu" },
          { korean: "친구를", french: "un ami", role: "personne rencontrée" },
          { korean: "만날 거예요", french: "je vais rencontrer", role: "projet" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Employer 갈게요 pour un voyage déjà prévu sans réaction particulière.",
        correction: "Un simple plan se dit 갈 거예요. 갈게요 annonce plutôt une décision ou une promesse faite maintenant.",
      },
      {
        mistake: "Ajouter la terminaison au dictionnaire complet : 가다ㄹ 거예요 ou 먹다을 거예요.",
        correction: "Retire 다 avant de conjuguer : 가- + ㄹ 거예요, 먹- + 을 거예요.",
      },
    ],
    memoryTip:
      "거예요 dessine un projet à venir. D’abord le radical, puis ㄹ après voyelle ou 을 après consonne.",
  },
  "decision-and-promise": {
    stageId: "decision-and-promise",
    introduction:
      "-(으)ㄹ게요 sert à annoncer ce que le locuteur décide de faire pour répondre à la situation ou à l’interlocuteur. C’est la forme naturelle pour se proposer, rassurer ou promettre quelque chose.",
    mainRule:
      "Retire 다 et ajoute ㄹ게요 après une voyelle, 을게요 après une consonne sauf ㄹ : 열다 → 열게요, 읽다 → 읽을게요. Après ㄹ, garde ㄹ : 살다 → 살게요. Le sujet implicite est généralement « je ».",
    formula: {
      pattern: "radical + ㄹ게요 / 을게요",
      explanation:
        "La terminaison met en avant l’engagement du locuteur. Elle se distingue de -(으)ㄹ 거예요, qui présente plutôt un plan ou une prévision.",
    },
    steps: [
      {
        title: "Cherche la réaction",
        explanation:
          "Quelqu’un demande de l’aide, hésite ou attend une réponse ? Si tu décides de t’en charger maintenant, pense à -ㄹ게요.",
      },
      {
        title: "Forme la terminaison",
        explanation:
          "Après une voyelle, ajoute ㄹ게요 : 하다 → 할게요. Après une consonne, ajoute 을게요 : 읽다 → 읽을게요. Un radical en ㄹ garde ㄹ : 살다 → 살게요.",
      },
      {
        title: "Vérifie le destinataire",
        explanation:
          "-ㄹ게요 est centré sur l’engagement du locuteur. Pour demander l’avis de l’autre, utilise plutôt -(으)ㄹ까요?.",
      },
    ],
    examples: [
      {
        korean: "제가 문을 열게요.",
        french: "Je vais ouvrir la porte.",
        parts: [
          { korean: "제가", french: "moi, je", role: "locuteur engagé" },
          { korean: "문을", french: "la porte", role: "objet" },
          { korean: "열게요", french: "vais ouvrir / je m’en charge", role: "décision" },
        ],
      },
      {
        korean: "카드로 계산할게요.",
        french: "Je vais régler par carte.",
        parts: [
          { korean: "카드로", french: "par carte", role: "moyen" },
          { korean: "계산할게요", french: "je vais régler", role: "décision annoncée" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Utiliser -ㄹ게요 pour décrire un voyage planifié de longue date.",
        correction: "Pour un projet déjà prévu, choisis -ㄹ 거예요. Réserve -ㄹ게요 à une décision prise dans l’échange.",
      },
      {
        mistake: "Dire 갈게요? pour proposer une action commune.",
        correction: "갈게요 annonce ton engagement ; 같이 갈까요? demande si vous partez ensemble.",
      },
    ],
    memoryTip:
      "거예요 décrit ton agenda ; 게요 engage ta parole. Si tu réponds « je m’en charge », pense à -ㄹ게요.",
  },
  "link-actions": {
    stageId: "link-actions",
    introduction:
      "-고 relie deux actions ou deux informations dans une même phrase. Il peut suivre la chronologie, mais son rôle de base est simplement d’enchaîner, comme « et ».",
    mainRule:
      "Retire 다 du premier verbe et ajoute 고, puis conjugue normalement le dernier verbe : 먹다 + 고 + 가다 → 먹고 가요.",
    formula: {
      pattern: "radical 1 + 고 + radical 2 conjugué",
      explanation:
        "La première action reste sous la forme de liaison en -고 et le dernier prédicat porte la terminaison polie, le temps ou la nuance principale.",
    },
    steps: [
      {
        title: "Repère les deux actions",
        explanation:
          "Sépare les actions que tu veux mettre dans la même phrase : manger puis partir, prendre le métro puis changer de ligne.",
      },
      {
        title: "Relie le premier verbe",
        explanation:
          "Retire 다 et ajoute 고 : 먹다 devient 먹고, 타다 devient 타고. Ne mets pas la terminaison polie avant 고.",
      },
      {
        title: "Conjugue la fin",
        explanation:
          "La dernière action ferme la phrase et porte le temps : 먹고 가요, « je mange puis je pars », ou 먹고 갔어요, « j’ai mangé puis je suis parti ».",
      },
    ],
    examples: [
      {
        korean: "밥을 먹고 커피를 마셔요.",
        french: "Je mange puis je bois un café.",
        parts: [
          { korean: "밥을 먹고", french: "manger le repas puis", role: "première action reliée" },
          { korean: "커피를 마셔요", french: "boire un café", role: "action finale" },
        ],
      },
      {
        korean: "지하철을 타고 갈아타요.",
        french: "Je prends le métro puis je change de ligne.",
        parts: [
          { korean: "지하철을 타고", french: "prendre le métro puis", role: "première étape" },
          { korean: "갈아타요", french: "je change de ligne", role: "action finale" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Utiliser -아서 pour une simple suite : 밥을 먹어서 커피를 마셔요.",
        correction: "-고 enchaîne ; -아서 exprime une cause ou une conséquence. Ici, dis 밥을 먹고 커피를 마셔요.",
      },
      {
        mistake: "Conjuguer les deux verbes comme deux phrases séparées avant de les relier.",
        correction: "Le premier verbe prend seulement -고 : 먹고. La terminaison de temps se place sur le dernier prédicat.",
      },
    ],
    memoryTip:
      "-고 est un petit pont entre deux actions : le premier verbe s’y accroche, puis le dernier verbe ferme la phrase.",
  },
  "give-reason": {
    stageId: "give-reason",
    introduction:
      "-아/어서 relie une cause à sa conséquence. Il répond à « pourquoi ? » et permet d’expliquer naturellement un retard, une absence, une excuse ou un choix.",
    mainRule:
      "Retire 다 et ajoute 아서 après ㅏ ou ㅗ, 어서 dans les autres cas ; 하다 devient 해서. La cause vient avant la conséquence : 늦어서 죄송해요.",
    formula: {
      pattern: "cause + 아서 / 어서 + conséquence",
      explanation:
        "La première proposition donne la raison et la seconde exprime le résultat. Dans cette construction débutante, on ne marque généralement pas le passé sur le premier verbe.",
    },
    steps: [
      {
        title: "Trouve le pourquoi",
        explanation:
          "Commence par l’information qui explique l’autre : il pleut, tu es malade, tu es en retard ou tu es fatigué.",
      },
      {
        title: "Choisis 아서 ou 어서",
        explanation:
          "Après ㅏ ou ㅗ, choisis 아서 : 오다 → 와서. Dans les autres cas, choisis 어서 : 늦다 → 늦어서, 피곤하다 → 피곤해서.",
      },
      {
        title: "Place la conséquence ensuite",
        explanation:
          "La raison vient avant ce qu’elle provoque : 비가 와서 택시를 타요, « comme il pleut, je prends un taxi ».",
      },
    ],
    examples: [
      {
        korean: "비가 와서 택시를 타요.",
        french: "Comme il pleut, je prends un taxi.",
        parts: [
          { korean: "비가 와서", french: "comme il pleut", role: "cause" },
          { korean: "택시를 타요", french: "je prends un taxi", role: "conséquence" },
        ],
      },
      {
        korean: "늦어서 죄송해요.",
        french: "Désolé d’être en retard.",
        parts: [
          { korean: "늦어서", french: "parce que je suis en retard", role: "raison" },
          { korean: "죄송해요", french: "je suis désolé", role: "conséquence / réaction" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Employer -고 alors que la première proposition explique la seconde.",
        correction: "Une cause demande -아/어서 : 비가 와서 택시를 타요. -고 se contente d’additionner ou d’enchaîner.",
      },
      {
        mistake: "Ajouter une terminaison polie complète avant 어서 : 늦어요서.",
        correction: "Pars du radical et attache la liaison directement : 늦다 → 늦어서.",
      },
    ],
    memoryTip:
      "-아서/어서 pousse la phrase vers son résultat : cause d’abord, conséquence ensuite.",
  },
  "mark-contrast": {
    stageId: "mark-contrast",
    introduction:
      "-지만 oppose deux informations qui restent toutes les deux vraies. La seconde ne supprime pas la première : quelque chose peut être cher et tout de même agréable.",
    mainRule:
      "Retire 다 du premier verbe ou adjectif, ajoute 지만, puis conjugue la proposition finale : 맵다 → 맵지만 맛있어요.",
    formula: {
      pattern: "proposition 1 + 지만 + proposition 2",
      explanation:
        "-지만 ne dépend pas de la dernière voyelle : le premier radical reçoit directement 지만. La deuxième proposition porte la terminaison polie.",
    },
    steps: [
      {
        title: "Repère le contraste",
        explanation:
          "Cherche deux faits qui semblent aller dans des directions différentes : petit mais confortable, cher mais bon.",
      },
      {
        title: "Attache 지만 au premier radical",
        explanation:
          "Retire 다 puis ajoute 지만 : 작다 → 작지만, 비싸다 → 비싸지만. Il n’y a pas de choix 아/어 ici.",
      },
      {
        title: "Termine la deuxième idée",
        explanation:
          "Conjugue le prédicat final comme d’habitude : 작지만 편해요, « c’est petit mais confortable ».",
      },
    ],
    examples: [
      {
        korean: "맵지만 맛있어요.",
        french: "C’est épicé, mais délicieux.",
        parts: [
          { korean: "맵지만", french: "bien qu’épicé", role: "première information" },
          { korean: "맛있어요", french: "c’est délicieux", role: "information contrastée" },
        ],
      },
      {
        korean: "비싸지만 좋아요.",
        french: "C’est cher, mais ça me plaît.",
        parts: [
          { korean: "비싸지만", french: "bien que cher", role: "obstacle / contraste" },
          { korean: "좋아요", french: "c’est bien / ça me plaît", role: "conclusion" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Utiliser -고 pour exprimer automatiquement « mais ».",
        correction: "-고 ajoute ou enchaîne ; -지만 signale une opposition : 맵지만 맛있어요.",
      },
      {
        mistake: "Conjuguer le premier adjectif en -어요 avant 지만 : 매워요지만.",
        correction: "Retire 다 et ajoute directement 지만 : 맵다 → 맵지만.",
      },
    ],
    memoryTip:
      "지만 garde les deux côtés de la phrase debout : le premier est vrai, le second arrive malgré lui.",
  },
  "simple-condition": {
    stageId: "simple-condition",
    introduction:
      "-(으)면 pose une condition : une action ou une situation doit être vraie pour que la suite se produise. La condition vient avant le résultat, comme dans « s’il pleut, je reste chez moi ».",
    mainRule:
      "Ajoute 면 après une voyelle et 으면 après une consonne sauf ㄹ : 가다 → 가면, 있다 → 있으면. Après ㄹ, garde ㄹ : 살다 → 살면. Avec -(으)면 돼요, la construction signifie « il suffit de… ».",
    formula: {
      pattern: "condition + 면 / 으면 + résultat  ·  action + 면 돼요",
      explanation:
        "La première partie ouvre un scénario et la deuxième dit ce qui se passe dans ce scénario. 돼요 ajoute séparément l’idée de suffisance ou de solution acceptable.",
    },
    steps: [
      {
        title: "Formule le scénario",
        explanation:
          "Demande-toi quelle situation doit être vraie : avoir le temps, pleuvoir ou trouver un prix bas.",
      },
      {
        title: "Observe le dernier son",
        explanation:
          "Après une voyelle, ajoute 면 : 가면. Après une consonne, ajoute 으면 : 있으면, 먹으면. Un radical en ㄹ garde ㄹ devant 면 : 살면.",
      },
      {
        title: "Choisis le résultat",
        explanation:
          "Ajoute la conséquence après la condition : 시간이 있으면 가요. Pour donner une solution suffisante, dis 표를 보여 주면 돼요.",
      },
    ],
    examples: [
      {
        korean: "시간이 있으면 가요.",
        french: "J’y vais si j’ai le temps.",
        parts: [
          { korean: "시간이 있으면", french: "si j’ai le temps", role: "condition" },
          { korean: "가요", french: "j’y vais", role: "résultat" },
        ],
      },
      {
        korean: "여기에서 내리면 돼요.",
        french: "Il suffit de descendre ici.",
        parts: [
          { korean: "여기에서", french: "ici", role: "lieu" },
          { korean: "내리면 돼요", french: "il suffit de descendre", role: "solution suffisante" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Employer -아서 pour une condition : 시간이 있어서 가요.",
        correction: "있어서 signifie « parce que j’ai ». Pour « si j’ai », utilise 있으면 : 시간이 있으면 가요.",
      },
      {
        mistake: "Confondre 내리면 돼요 avec une conséquence automatique comme 내리면 가요.",
        correction: "돼요 signifie que l’action suffit ou convient : 여기에서 내리면 돼요.",
      },
    ],
    memoryTip:
      "면 ouvre une porte conditionnelle : si la première partie est vraie, la seconde devient possible ou suffisante.",
  },
  "necessity-and-obligation": {
    stageId: "necessity-and-obligation",
    introduction:
      "Le coréen distingue l’action obligatoire et la chose nécessaire. -아/어야 해요 dit ce qu’il faut faire ; 필요해요 dit ce dont on a besoin.",
    mainRule:
      "Pour une action, ajoute -아/어야 해요 au radical : 사다 → 사야 해요, 먹다 → 먹어야 해요. Pour un nom nécessaire, utilise nom + 이/가 필요해요.",
    formula: {
      pattern: "radical + 아야/어야 해요  ·  nom + 이/가 필요해요",
      explanation:
        "La première structure impose un verbe. La seconde décrit le besoin d’un objet ou d’une ressource : 여권이 필요해요, « j’ai besoin d’un passeport ».",
    },
    steps: [
      {
        title: "Décide action ou objet",
        explanation:
          "Si la phrase répond à « que faut-il faire ? », choisis -아/어야 해요. Si elle répond à « de quoi a-t-on besoin ? », choisis 필요해요.",
      },
      {
        title: "Conjugue l’action",
        explanation:
          "Après ㅏ ou ㅗ, ajoute 아야 : 사다 → 사야 해요. Dans les autres cas, ajoute 어야 : 먹다 → 먹어야 해요. 하다 devient 해야 해요.",
      },
      {
        title: "Marque le nom nécessaire",
        explanation:
          "Le nom qui est nécessaire prend 이 après consonne ou 가 après voyelle : 여권이 필요해요, 카드가 필요해요.",
      },
    ],
    examples: [
      {
        korean: "표를 사야 해요.",
        french: "Il faut acheter un billet.",
        parts: [
          { korean: "표를", french: "un billet", role: "objet de l’action" },
          { korean: "사야 해요", french: "il faut acheter", role: "obligation" },
        ],
      },
      {
        korean: "여권이 필요해요.",
        french: "J’ai besoin d’un passeport.",
        parts: [
          { korean: "여권이", french: "un passeport", role: "chose nécessaire" },
          { korean: "필요해요", french: "est nécessaire / il me faut", role: "nécessité nominale" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Dire 사도 돼요 pour exprimer une obligation.",
        correction: "사도 돼요 signifie « on peut acheter / c’est permis ». L’obligation se dit 사야 해요.",
      },
      {
        mistake: "Construire 여권을 필요해요 en traitant le besoin comme une action.",
        correction: "Avec 필요해요, le nom nécessaire prend 이/가 : 여권이 필요해요.",
      },
    ],
    memoryTip:
      "야 해요 pousse à agir ; 필요해요 montre le besoin. Demande-toi si tu dois faire quelque chose ou trouver quelque chose.",
  },
  "simple-comparison": {
    stageId: "simple-comparison",
    introduction:
      "Pour comparer, le coréen place la référence avec 보다, puis ajoute 더 devant l’adjectif pour dire « plus ». Pour choisir le meilleur ou le plus grand d’un groupe, utilise 제일.",
    mainRule:
      "Construis référence + 보다 + élément comparé + 이/가 + 더 + adjectif. Sans deuxième terme, 제일 + adjectif forme un superlatif : 이게 제일 싸요.",
    formula: {
      pattern: "A보다 B가 더 + adjectif  ·  B가 제일 + adjectif",
      explanation:
        "보다 suit l’élément auquel on compare. 더 se place juste avant l’adjectif ; 제일 s’emploie quand on compare au moins trois éléments ou un ensemble.",
    },
    steps: [
      {
        title: "Choisis la référence",
        explanation:
          "Décide ce qui sert de point de comparaison : le bus, le café ou un premier sac. Ce groupe reçoit 보다.",
      },
      {
        title: "Marque le comparatif",
        explanation:
          "Place l’élément évalué avec 이/가, puis 더 devant l’adjectif : 버스보다 지하철이 더 빨라요.",
      },
      {
        title: "Passe au superlatif si nécessaire",
        explanation:
          "Si tu sélectionnes un élément parmi plusieurs, remplace la comparaison par 제일 : 이 식당이 제일 좋아요.",
      },
    ],
    examples: [
      {
        korean: "버스보다 지하철이 더 빨라요.",
        french: "Le métro est plus rapide que le bus.",
        parts: [
          { korean: "버스보다", french: "que le bus", role: "référence" },
          { korean: "지하철이", french: "le métro", role: "élément comparé" },
          { korean: "더 빨라요", french: "est plus rapide", role: "comparatif" },
        ],
      },
      {
        korean: "이 식당이 제일 좋아요.",
        french: "Ce restaurant est le meilleur.",
        parts: [
          { korean: "이 식당이", french: "ce restaurant", role: "élément sélectionné" },
          { korean: "제일 좋아요", french: "est le meilleur / me plaît le plus", role: "superlatif" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Mettre 보다 après l’élément comparé : 지하철이 버스보다… puis perdre la référence.",
        correction: "La référence prend 보다 : 버스보다 지하철이 더 빨라요.",
      },
      {
        mistake: "Utiliser 제일 pour comparer seulement deux éléments.",
        correction: "Pour deux éléments, utilise 보다 et 더. 제일 sert à sélectionner le meilleur d’un groupe.",
      },
    ],
    memoryTip:
      "보다 donne le point de départ, 더 augmente l’adjectif, 제일 choisit le numéro un.",
  },
  "make-suggestion": {
    stageId: "make-suggestion",
    introduction:
      "-(으)ㄹ까요? sert à proposer une action commune ou à demander l’avis de l’interlocuteur. La question laisse une place réelle à sa réponse : « on fait cela ? ».",
    mainRule:
      "Retire 다 et ajoute ㄹ까요 après une voyelle, 을까요 après une consonne sauf ㄹ : 가다 → 갈까요?, 먹다 → 먹을까요?. Après ㄹ, garde ㄹ : 살다 → 살까요?.",
    formula: {
      pattern: "radical + ㄹ까요? / 을까요?",
      explanation:
        "La terminaison transforme le verbe en proposition. Elle se distingue de -ㄹ게요, qui annonce ta propre décision, et de -ㄹ 거예요, qui décrit un projet.",
    },
    steps: [
      {
        title: "Vérifie que l’action est partagée",
        explanation:
          "Tu proposes de partir, manger, boire ou vous retrouver ensemble : l’action concerne le groupe, pas seulement toi.",
      },
      {
        title: "Observe le dernier son",
        explanation:
          "Après une voyelle, ajoute ㄹ까요 : 가다 → 갈까요?. Après une consonne, ajoute 을까요 : 먹다 → 먹을까요?. Un radical en ㄹ garde ㄹ : 살다 → 살까요?.",
      },
      {
        title: "Compare les nuances",
        explanation:
          "같이 갈까요? demande un accord. 갈게요 annonce que tu t’en charges. 갈 거예요 présente simplement ton projet.",
      },
    ],
    examples: [
      {
        korean: "같이 갈까요?",
        french: "On y va ensemble ?",
        parts: [
          { korean: "같이", french: "ensemble", role: "action partagée" },
          { korean: "갈까요?", french: "on y va ?", role: "suggestion" },
        ],
      },
      {
        korean: "커피를 마실까요?",
        french: "On prend un café ?",
        parts: [
          { korean: "커피를", french: "un café", role: "objet" },
          { korean: "마실까요?", french: "est-ce qu’on boit ?", role: "proposition" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Dire 갈게요? quand on demande réellement si l’autre veut venir.",
        correction: "갈게요 annonce ta décision. Pour proposer une action commune, dis 같이 갈까요?.",
      },
      {
        mistake: "Ajouter la terminaison à la forme du dictionnaire : 먹다을까요?.",
        correction: "Retire 다 avant la terminaison : 먹다 → 먹을까요?.",
      },
    ],
    memoryTip:
      "까요 garde la porte ouverte à l’autre : tu proposes, puis tu attends son avis.",
  },
  "a1-validation": {
    stageId: "a1-validation",
    introduction:
      "Cette dernière étape ne présente pas une nouvelle terminaison : elle entraîne à choisir la bonne structure dans une situation complète. Le bon réflexe est de partir du sens, puis de vérifier la forme coréenne.",
    mainRule:
      "Classe d’abord l’intention — temps, action, relation entre idées ou nuance sociale — puis choisis le marqueur, conjugue le radical et relis toute la phrase jusqu’au prédicat final.",
    formula: {
      pattern: "intention → marqueur → radical conjugué → phrase complète",
      explanation:
        "Une même action peut prendre plusieurs formes selon le message : 갈 거예요 décrit un projet, 갈게요 engage le locuteur et 갈까요? propose l’action à deux.",
    },
    steps: [
      {
        title: "Comprends la situation",
        explanation:
          "Repère d’abord les indices : événement terminé, projet, permission, obligation, cause, contraste ou proposition. Ne choisis pas une terminaison uniquement parce qu’elle ressemble au français.",
      },
      {
        title: "Choisis le bon bloc",
        explanation:
          "Associe l’intention à sa construction : -았/었어요 pour le passé, -(으)ㄹ 거예요 pour un projet, -아/어서 pour une raison, -(으)면 pour une condition.",
      },
      {
        title: "Contrôle la phrase entière",
        explanation:
          "Vérifie le dernier son du radical, les particules de l’objet ou du lieu, la place du prédicat et le registre poli en -요 avant de valider.",
      },
    ],
    examples: [
      {
        korean: "비가 와서 택시를 타요.",
        french: "Comme il pleut, je prends un taxi.",
        parts: [
          { korean: "비가 와서", french: "comme il pleut", role: "raison" },
          { korean: "택시를 타요", french: "je prends un taxi", role: "conséquence et prédicat" },
        ],
      },
      {
        korean: "같이 갈까요?",
        french: "On y va ensemble ?",
        parts: [
          { korean: "같이", french: "ensemble", role: "action partagée" },
          { korean: "갈까요?", french: "on y va ?", role: "suggestion polie" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Reconnaître le verbe mais choisir la forme sans tenir compte du contexte.",
        correction: "Compare les nuances avant de répondre : projet 갈 거예요, engagement 갈게요, suggestion 갈까요?.",
      },
      {
        mistake: "Valider une phrase après avoir vérifié uniquement la terminaison.",
        correction: "Relis aussi les particules et l’ordre : lieu + 에서 pour une action, objet + 을/를, puis prédicat à la fin.",
      },
    ],
    memoryTip:
      "Pour réussir la révision : sens d’abord, forme ensuite, phrase complète à la fin.",
  },
} as const satisfies Partial<Record<GrammarStageId, GrammarLessonGuide>>;

export function getGrammarLessonGuide(
  stageId: GrammarStageId,
): GrammarLessonGuide | undefined {
  return GRAMMAR_LESSON_GUIDES[stageId as keyof typeof GRAMMAR_LESSON_GUIDES];
}
