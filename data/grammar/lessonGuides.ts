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

export const GRAMMAR_LESSON_GUIDES = {
  "sentence-structure": {
    stageId: "sentence-structure",
    introduction:
      "En coréen, l'information principale arrive à la fin. Le sujet peut disparaître lorsqu'il est évident, mais le prédicat — ce que l'on dit ou fait — ferme toujours la phrase.",
    mainRule:
      "Le prédicat se place à la fin de la phrase. Le sujet et les compléments viennent avant lui et peuvent être omis lorsqu’ils sont déjà compris dans le contexte.",
    formula: {
      pattern: "(sujet / thème) + (compléments) + prédicat",
      explanation:
        "Les blocs placés avant le prédicat peuvent varier. Le repère le plus fiable est donc de chercher le verbe ou l'expression finale.",
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
          "Place ensuite l'objet, le lieu ou le moment. Les particules indiquent le rôle de chaque bloc et rendent l'ordre plus souple.",
      },
      {
        title: "Termine par l'action",
        explanation:
          "Garde le verbe, l'adjectif descriptif ou la copule pour la fin. C'est ce dernier bloc qui donne son sens complet à la phrase.",
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
      "이에요 et 예요 permettent d'identifier une personne ou une chose dans le registre poli courant. Le choix dépend uniquement du dernier son du nom.",
    mainRule:
      "Ajoute 이에요 après un nom terminé par une consonne et 예요 après un nom terminé par une voyelle, sans insérer d’espace.",
    formula: {
      pattern: "nom + 이에요 (après consonne) / nom + 예요 (après voyelle)",
      explanation:
        "La copule s'attache directement au nom. Elle correspond souvent à « être », mais sert ici à dire ce qu'est quelque chose.",
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
      "Dans la plupart des échanges du quotidien avec une personne que l'on connaît peu, la terminaison en -요 est le choix sûr : elle reste naturelle tout en marquant le respect.",
    mainRule:
      "Dans le registre poli courant, le prédicat conjugué se termine par 요. La conjugaison vient avant cette marque de politesse.",
    formula: {
      pattern: "base conjuguée + 요",
      explanation:
        "Le -요 se trouve à la fin du prédicat poli. La forme qui le précède change selon le verbe ou l'adjectif : on apprend donc la terminaison complète, pas un 요 isolé.",
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
          "Le 요 final est ton signal audible de politesse. Il ne change pas le contenu, mais règle la relation avec l'interlocuteur.",
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
      "은 et 는 annoncent le thème : la personne, la chose ou le moment à propos duquel la suite apporte une information. En français, on peut souvent sentir « quant à… ».",
    mainRule:
      "Attache 은 après une consonne finale et 는 après une voyelle au nom que tu veux présenter comme thème de la phrase.",
    formula: {
      pattern: "nom + 은 (après consonne) / 는 (après voyelle) + commentaire",
      explanation:
        "La particule s'attache au thème. Le reste de la phrase constitue le commentaire fait à son sujet.",
    },
    steps: [
      {
        title: "Choisis ton thème",
        explanation:
          "Décide ce que tu places au premier plan : moi, aujourd'hui, ce café ou un autre élément déjà connu.",
      },
      {
        title: "Écoute le dernier son",
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
        korean: "오늘은 월요일이에요.",
        french: "Aujourd'hui, c'est lundi.",
        parts: [
          { korean: "오늘은", french: "quant à aujourd'hui", role: "thème après consonne" },
          { korean: "월요일이에요", french: "c'est lundi", role: "commentaire" },
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
      "Le coréen organise l'espace en trois zones : près de moi, près de toi ou déjà mentionné, et loin de nous deux. Cette distinction guide 이, 그 et 저.",
    mainRule:
      "Utilise 이 pour ce qui est près de toi, 그 pour ce qui est près de l’interlocuteur ou déjà évoqué, et 저 pour ce qui est loin des deux.",
    formula: {
      pattern: "이 / 그 / 저 + nom  ·  이거 / 그거 / 저거 (sans nom)",
      explanation:
        "Devant un nom, utilise la forme courte. Pour dire simplement « cette chose », emploie la forme autonome en -거.",
    },
    steps: [
      {
        title: "Situe la chose",
        explanation:
          "Choisis 이 près de toi, 그 près de l'interlocuteur ou pour une chose déjà évoquée, et 저 pour ce qui est loin des deux.",
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
      "Les mots interrogatifs coréens restent à la place de l'information inconnue. 뭐 demande une chose, 누구 une personne et 몇 une quantité devant un classificateur.",
    mainRule:
      "Remplace l’élément inconnu par 뭐, 누구 ou 몇 sans bouleverser l’ordre normal de la phrase coréenne.",
    formula: {
      pattern: "mot interrogatif + structure ordinaire + terminaison polie ?",
      explanation:
        "On ne déplace pas nécessairement le mot interrogatif au début. Remplace simplement l'élément inconnu dans une phrase normale.",
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
        mistake: "Employer 몇 seul pour compter des personnes.",
        correction: "Ajoute le classificateur adapté : 몇 명 pour « combien de personnes ».",
      },
    ],
    memoryTip:
      "Construis d'abord la réponse, puis remplace seulement le morceau inconnu par 뭐, 누구 ou 몇.",
  },
  existence: {
    stageId: "existence",
    introduction:
      "있어요 indique qu'une personne ou une chose existe, est présente ou est disponible ; 없어요 exprime l'absence. Cette structure sert aussi souvent à rendre le français « avoir ».",
    mainRule:
      "Marque avec 이/가 la chose présente ou absente, puis termine par 있어요 pour la présence ou 없어요 pour l’absence.",
    formula: {
      pattern: "nom + 이/가 + 있어요 / 없어요",
      explanation:
        "Le nom présent ou absent reçoit généralement 이/가 : 이 après une consonne finale, 가 après une voyelle.",
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
        korean: "추천 메뉴가 있어요?",
        french: "Avez-vous un plat à recommander ?",
        parts: [
          { korean: "추천 메뉴가", french: "un menu recommandé", role: "élément recherché" },
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
        mistake: "Confondre 이에요/예요 et 있어요.",
        correction: "La copule identifie ce qu'est une chose ; 있어요 signale qu'elle existe ou se trouve là.",
      },
    ],
    memoryTip:
      "Pose une question très concrète à la scène : « Est-ce que cet élément est là ? » 있어요 oui, 없어요 non.",
  },
  "locate-thing": {
    stageId: "locate-thing",
    introduction:
      "Pour situer une personne ou un objet, le lieu reçoit 에 et la phrase se termine par 있어요. La structure décrit une position stable, pas l'endroit où se déroule une action.",
    mainRule:
      "Pour une position statique, attache 에 au lieu et place 있어요 à la fin de la phrase.",
    formula: {
      pattern: "élément + 은/는 ou 이/가 + lieu + 에 + 있어요",
      explanation:
        "Le lieu vient avant 있어요. 에 agit comme un point d'ancrage : c'est à cet endroit que l'élément se trouve.",
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
          "Place 있어요 à la fin pour dire « se trouve ». Emploie 없어요 si l'élément n'est pas à cet endroit.",
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
} as const satisfies Partial<Record<GrammarStageId, GrammarLessonGuide>>;

export function getGrammarLessonGuide(
  stageId: GrammarStageId,
): GrammarLessonGuide | undefined {
  return GRAMMAR_LESSON_GUIDES[stageId as keyof typeof GRAMMAR_LESSON_GUIDES];
}
