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
      "Utilise 이 pour ce qui est près de moi, le locuteur, 그 pour ce qui est près de l’interlocuteur ou déjà évoqué, et 저 pour ce qui est loin des deux.",
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
  "present-actions": {
    stageId: "present-actions",
    introduction:
      "Le présent coréen sert à décrire ce qui se passe maintenant, mais aussi une habitude. La terminaison polie -아/어요 est donc le réflexe de base pour parler d’une action dans la vie quotidienne.",
    mainRule:
      "Retire 다 de la forme du dictionnaire, observe la dernière voyelle du radical, puis ajoute 아요 après ㅏ ou ㅗ et 어요 dans les autres cas. Les verbes en 하다 deviennent 해요.",
    formula: {
      pattern: "radical + 아요 / 어요  ·  하다 → 해요",
      explanation:
        "Le radical porte le sens de l’action et la terminaison indique ici le présent poli courant. Certaines voyelles se contractent à l’écrit : 가다 devient 가요 et 보다 devient 봐요.",
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
        mistake: "Garder la forme du dictionnaire, comme 공부다 ou 먹다, dans une phrase polie.",
        correction: "Retire 다 et conjugue le radical : 공부해요, 먹어요.",
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
      "을 et 를 indiquent l’objet directement concerné par l’action. Ils permettent de voir clairement ce que l’on boit, lit, apprend ou achète avant le verbe final.",
    mainRule:
      "Attache 을 au nom qui se termine par une consonne et 를 au nom qui se termine par une voyelle, puis place le verbe conjugué à la fin.",
    formula: {
      pattern: "(sujet / thème) + objet + 을/를 + verbe",
      explanation:
        "La particule suit directement le groupe nominal objet. Elle ne se traduit pas toujours en français, mais elle marque le rôle de ce groupe dans la phrase.",
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
        korean: "한국어를 공부해요.",
        french: "J’étudie le coréen.",
        parts: [
          { korean: "한국어를", french: "le coréen", role: "objet" },
          { korean: "공부해요", french: "j’étudie", role: "action" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Choisir 이/가 parce que le nom est important dans la phrase.",
        correction: "Si le nom reçoit directement l’action, marque-le avec 을/를 : 책을 읽어요.",
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
      "Attache 에서 au lieu de l’action, puis place éventuellement l’objet et termine par le verbe conjugué.",
    formula: {
      pattern: "lieu + 에서 + (objet + 을/를) + verbe",
      explanation:
        "에서 répond à « où l’action a-t-elle lieu ? ». Compare 카페에서 공부해요, « j’étudie au café », et 카페에 있어요, « je suis au café ».",
    },
    steps: [
      {
        title: "Identifie le verbe",
        explanation:
          "S’il s’agit d’une action comme étudier, manger, travailler ou descendre, tu décris un lieu d’activité.",
      },
      {
        title: "Marque le lieu avec 에서",
        explanation:
          "Ajoute 에서 directement au lieu : 카페에서, 도서관에서. Le lieu vient avant l’action dans la phrase.",
      },
      {
        title: "Ne confonds pas avec 에",
        explanation:
          "Avec 있어요/없어요, choisis 에 pour une position ou une présence : 카페에 있어요. Avec un verbe d’action, choisis 에서.",
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
        korean: "도서관에서 책을 읽어요.",
        french: "Je lis un livre à la bibliothèque.",
        parts: [
          { korean: "도서관에서", french: "à la bibliothèque", role: "lieu de l’action" },
          { korean: "책을", french: "un livre", role: "objet" },
          { korean: "읽어요", french: "je lis", role: "action" },
        ],
      },
    ],
    commonMistakes: [
      {
        mistake: "Dire 카페에 공부해요 pour « j’étudie au café ».",
        correction: "Le café est le lieu de l’action : 카페에서 공부해요. 에 conviendrait avec 카페에 있어요.",
      },
      {
        mistake: "Employer 에서 pour une personne ou un objet simplement situé.",
        correction: "Pour une position stable, utilise lieu + 에 + 있어요 : 친구가 카페에 있어요.",
      },
    ],
    memoryTip:
      "에서 contient l’idée d’une scène d’activité : si quelque chose s’y passe, pense à 에서 ; si quelque chose y est, pense à 에.",
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
    ],
    memoryTip: "Montre la chose avec les mots avant 주세요 : nom d’abord, demande ensuite.",
  },
  "request-quantity": {
    stageId: "request-quantity",
    introduction:
      "Pour commander une quantité, le coréen place le nom, puis le nombre et le classificateur adapté. Le classificateur précise ce qui est compté : verres, billets, personnes ou objets.",
    mainRule: "Construis nom + nombre + classificateur + 주세요. 하나, 둘, 셋 et 넷 deviennent 한, 두, 세 et 네 devant un classificateur.",
    formula: { pattern: "nom + nombre natif + classificateur + 주세요", explanation: "Le nombre vient avant le classificateur : 한 잔, deux verres ; 두 장, deux billets ; 세 개, trois objets." },
    steps: [
      { title: "Identifie ce que tu comptes", explanation: "Objet → 개, personne → 명, boisson → 잔, billet ou feuille → 장." },
      { title: "Choisis le nombre", explanation: "Pour les premières quantités, utilise les nombres natifs et leurs formes courtes : 한, 두, 세, 네." },
      { title: "Ajoute la demande", explanation: "Place le groupe complet avant 주세요 : 아메리카노 한 잔 주세요." },
    ],
    examples: [
      { korean: "아메리카노 한 잔 주세요.", french: "Un americano, s’il vous plaît.", parts: [{ korean: "아메리카노", french: "un americano", role: "élément compté" }, { korean: "한 잔", french: "un verre", role: "nombre + classificateur" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
      { korean: "표 두 장 주세요.", french: "Deux billets, s’il vous plaît.", parts: [{ korean: "표", french: "billet(s)", role: "élément compté" }, { korean: "두 장", french: "deux billets", role: "nombre + classificateur" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
    ],
    commonMistakes: [
      { mistake: "Dire 아메리카노 한 ou placer le nombre après le classificateur.", correction: "Le classificateur est obligatoire et suit le nombre : 아메리카노 한 잔." },
      { mistake: "Employer le mauvais classificateur.", correction: "Choisis l’unité adaptée : 잔 pour un verre, 장 pour un billet, 명 pour une personne." },
    ],
    memoryTip: "Compte en trois temps : la chose, combien, puis dans quelle unité — nom + nombre + classificateur.",
  },
  "sino-number-contexts": {
    stageId: "sino-number-contexts",
    introduction:
      "Les nombres sino-coréens servent à lire les informations chiffrées de la vie quotidienne : prix, dates, minutes, étages, lignes et numéros. Ils ne remplacent pas tous les nombres natifs.",
    mainRule: "Utilise 일, 이, 삼… avec 원, 분, 월, 층, 호선 et les numéros. Pour compter des objets ou dire l’heure, les nombres natifs restent souvent la référence étudiée ici.",
    formula: { pattern: "nombre sino-coréen + unité de contexte", explanation: "L’unité indique le contexte : 만 원 pour un prix, 십 분 pour dix minutes, 2호선 pour la ligne 2." },
    steps: [
      { title: "Reconnais le contexte", explanation: "Prix, date, minute, étage, ligne ou numéro signalent généralement le système sino-coréen." },
      { title: "Lis avec l’unité", explanation: "Ne lis pas le chiffre isolément : 만 원 forme un prix et 2호선 une ligne de métro." },
      { title: "Ne mélange pas les systèmes", explanation: "Pour une commande comptée, 한 잔 et 두 장 sont natifs ; pour un prix ou une ligne, pense sino-coréen." },
    ],
    examples: [
      { korean: "이거 만 원이에요.", french: "Cela coûte dix mille wons.", parts: [{ korean: "이거", french: "cet article", role: "élément évalué" }, { korean: "만 원", french: "dix mille wons", role: "prix sino-coréen" }, { korean: "이에요", french: "coûte / est", role: "identification" }] },
      { korean: "2호선이에요.", french: "C’est la ligne 2.", parts: [{ korean: "2호선", french: "ligne 2", role: "numéro de ligne" }, { korean: "이에요", french: "c’est", role: "identification" }] },
    ],
    commonMistakes: [
      { mistake: "Utiliser un nombre natif pour un prix ou une ligne.", correction: "Prix et numéros prennent le système sino-coréen : 오천 원, 2호선." },
      { mistake: "Traiter les deux systèmes comme interchangeables.", correction: "Associe le système à l’unité : objets/heures → souvent natif ; prix/minutes/lignes → sino-coréen." },
    ],
    memoryTip: "L’unité donne le signal : 원, 분, 월, 층 et 호선 appellent généralement les nombres sino-coréens.",
  },
  "coordinate-items": {
    stageId: "coordinate-items",
    introduction:
      "하고 et (이)랑 relient des noms dans la conversation. Ils peuvent signifier « et » dans une liste ou « avec » lorsqu’ils relient une personne au déplacement ou à l’action.",
    mainRule: "Place 하고 ou (이)랑 entre les noms. Avec une consonne finale, choisis 이랑 ; après une voyelle, 랑. 와/과 est plus écrit ou formel.",
    formula: { pattern: "nom + 하고 / (이)랑 + nom", explanation: "커피하고 케이크 relie deux éléments commandés. 친구랑 가요 signifie « je vais avec un ami »." },
    steps: [
      { title: "Repère le lien", explanation: "Pour une liste, pense « et ». Pour un compagnon, pense « avec »." },
      { title: "Choisis la forme orale", explanation: "하고 fonctionne entre deux noms. Avec 이랑/랑 : consonne finale → 이랑, voyelle finale → 랑." },
      { title: "Termine normalement", explanation: "Après le groupe relié, ajoute 주세요 ou le verbe final : 커피하고 케이크 주세요." },
    ],
    examples: [
      { korean: "커피하고 케이크 주세요.", french: "Un café et un gâteau, s’il vous plaît.", parts: [{ korean: "커피하고 케이크", french: "un café et un gâteau", role: "éléments reliés" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
      { korean: "친구랑 가요.", french: "J’y vais avec un ami.", parts: [{ korean: "친구랑", french: "avec un ami", role: "compagnon" }, { korean: "가요", french: "je vais", role: "action" }] },
    ],
    commonMistakes: [
      { mistake: "Utiliser 하고 pour dire « ou ».", correction: "하고 signifie « et / avec ». Pour une alternative, utilise (이)나 ou 아니면." },
      { mistake: "Choisir 이랑 après une voyelle.", correction: "Après une voyelle, utilise 랑 : 나랑." },
    ],
    memoryTip: "하고 relie ; 이랑/랑 accompagne. Si les éléments vont ensemble, pense « et » ou « avec », jamais « ou »."
  },
  "choose-alternative": {
    stageId: "choose-alternative",
    introduction: "Pour proposer deux possibilités, le coréen distingue le lien court entre deux noms et le lien entre deux propositions. Cette différence évite de confondre « ou » et « et ».",
    mainRule: "Utilise 이나 après une consonne et 나 après une voyelle entre deux noms. Utilise 아니면 pour relier deux propositions ou présenter une autre option.",
    formula: { pattern: "nom + (이)나 + nom  ·  proposition + 아니면 + proposition", explanation: "커피나 차 relie deux noms possibles. 아니면 peut introduire une option complète : 카드 아니면 현금이에요?" },
    steps: [
      { title: "Choisis le niveau de lien", explanation: "Deux noms dans un même groupe → (이)나. Deux idées ou phrases → 아니면." },
      { title: "Vérifie le dernier son", explanation: "Après une consonne, ajoute 이나 ; après une voyelle, ajoute 나 : 책이나, 커피나." },
      { title: "Garde la terminaison", explanation: "La proposition conserve sa fin : 커피나 차 있어요? signifie « y a-t-il du café ou du thé ? »." },
    ],
    examples: [
      { korean: "커피나 차 있어요?", french: "Avez-vous du café ou du thé ?", parts: [{ korean: "커피나 차", french: "du café ou du thé", role: "noms alternatifs" }, { korean: "있어요?", french: "y en a-t-il ?", role: "question" }] },
      { korean: "카드 아니면 현금이에요?", french: "Carte ou espèces ?", parts: [{ korean: "카드 아니면 현금", french: "carte ou espèces", role: "options" }, { korean: "이에요?", french: "est-ce ?", role: "question" }] },
    ],
    commonMistakes: [
      { mistake: "Employer 하고 dans une alternative : 커피하고 차.", correction: "하고 signifie « et ». Pour « ou » entre noms, dis 커피나 차." },
      { mistake: "Utiliser 나 après une consonne.", correction: "Après une consonne, ajoute 이나 : 책이나 영화 ; après une voyelle, 나 : 커피나 차." },
    ],
    memoryTip: "(이)나 colle deux noms possibles ; 아니면 ouvre une autre proposition. « Et » et « ou » ne se construisent pas pareil."
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
    introduction: "-(으)세요 sert à donner ou comprendre une instruction polie : descendre, aller, lire ou s’asseoir. La forme est directe, tandis que -아/어 주세요 demande plus explicitement un service.",
    mainRule: "Ajoute 세요 après une voyelle, 으세요 après une consonne. Après un radical en ㄹ, le ㄹ disparaît avant 세요 : 살다 → 사세요.",
    formula: { pattern: "radical + (으)세요", explanation: "내리다 → 내리세요 et 앉다 → 앉으세요. La terminaison peut aussi prendre une nuance d’invitation respectueuse." },
    steps: [
      { title: "Pars du radical", explanation: "Retire 다 : 내리다 donne 내리-, 가다 donne 가-, 앉다 donne 앉-." },
      { title: "Adapte au dernier son", explanation: "Voyelle → 세요 : 가세요. Consonne → 으세요 : 앉으세요. Avec ㄹ, supprime ㄹ : 살다 → 사세요." },
      { title: "Choisis le bon ton", explanation: "Une consigne ou une invitation appelle -(으)세요. Pour un service précis, -아/어 주세요 est souvent plus adapté." },
    ],
    examples: [
      { korean: "여기에서 내리세요.", french: "Descendez ici.", parts: [{ korean: "여기에서", french: "ici", role: "lieu de l’action" }, { korean: "내리세요", french: "descendez", role: "instruction polie" }] },
      { korean: "이쪽 가세요.", french: "Allez dans cette direction.", parts: [{ korean: "이쪽", french: "de ce côté", role: "direction" }, { korean: "가세요", french: "allez", role: "instruction polie" }] },
    ],
    commonMistakes: [
      { mistake: "Former 가으세요 ou 앉세요 sans tenir compte du dernier son.", correction: "Voyelle → 가세요 ; consonne → 앉으세요. Le choix dépend du radical." },
      { mistake: "Employer -(으)세요 pour demander une aide personnelle précise.", correction: "Pour un service, préfère -아/어 주세요 : 문을 열어 주세요." },
    ],
    memoryTip: "Voyelle, 세요 ; consonne, 으세요 ; ㄹ tombe. Puis demande-toi si tu donnes une consigne ou sollicites un service.",
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
    introduction: "-(으)ㄹ 수 있어요/없어요 exprime une capacité ou une possibilité réelle. La construction répond à « est-ce possible ? », pas à « est-ce permis ? ».",
    mainRule: "Ajoute ㄹ 수 있어요 après une voyelle et 을 수 있어요 après une consonne. Remplace 있어요 par 없어요 pour dire que l’action est impossible.",
    formula: { pattern: "radical + (으)ㄹ 수 있어요 / 없어요", explanation: "읽다 devient 읽을 수 있어요, 가다 devient 갈 수 있어요. 수 exprime ici la possibilité." },
    steps: [
      { title: "Identifie la possibilité", explanation: "Demande-toi si l’action est faisable techniquement, physiquement ou dans la situation." },
      { title: "Ajoute (으)ㄹ 수", explanation: "Après une voyelle, ㄹ 수 : 가다 → 갈 수. Après une consonne, 을 수 : 읽다 → 읽을 수." },
      { title: "Choisis 있어요 ou 없어요", explanation: "Possibilité présente → 있어요. Impossibilité → 없어요 : 할 수 없어요." },
    ],
    examples: [
      { korean: "여기서 충전할 수 있어요?", french: "Est-il possible de recharger ma carte ici ?", parts: [{ korean: "여기서", french: "ici", role: "lieu de l’action" }, { korean: "충전할 수 있어요?", french: "est-il possible de recharger ?", role: "possibilité" }] },
      { korean: "한국어를 읽을 수 있어요.", french: "Je sais lire le coréen.", parts: [{ korean: "한국어를", french: "le coréen", role: "objet" }, { korean: "읽을 수 있어요", french: "je peux lire", role: "capacité" }] },
    ],
    commonMistakes: [
      { mistake: "Utiliser -아/어도 돼요? pour demander si l’action est possible.", correction: "Possibilité/capacité → -(으)ㄹ 수 있어요? ; autorisation → -아/어도 돼요?." },
      { mistake: "Oublier 을/ㄹ avant 수.", correction: "Retire 다 puis forme 갈 수 ou 읽을 수 avant d’ajouter 있어요/없어요." },
    ],
    memoryTip: "수 est la place de la possibilité : radical + (으)ㄹ 수, puis 있어요 si elle existe, 없어요 si elle n’existe pas.",
  },
  "ask-permission": {
    stageId: "ask-permission",
    introduction: "-아/어도 돼요? demande si une action est autorisée. La question porte sur la règle ou l’accord de l’interlocuteur, pas sur ta capacité à réaliser l’action.",
    mainRule: "Conjugue le verbe en -아/어, ajoute 도 돼요? et garde la question à la fin : 사진 찍어도 돼요?",
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
    introduction: "못 exprime une impossibilité ou une incapacité à réaliser une action. Il se distingue de 안, qui dit plutôt que l’action n’est pas faite ou qu’on choisit de ne pas la faire.",
    mainRule: "Place 못 juste avant le verbe : 못 가요, 못 먹어요. Avec un verbe en 하다, place 못 devant 해요 : 운전을 못 해요.",
    formula: { pattern: "못 + verbe conjugué", explanation: "못 가요 signifie « je ne peux pas y aller » : une contrainte, une compétence ou la situation empêche l’action. 안 가요 signifie « je n’y vais pas »." },
    steps: [
      { title: "Cherche l’empêchement", explanation: "Utilise 못 si l’action est impossible à cause de la situation, d’une limite ou d’une compétence insuffisante." },
      { title: "Place 못 devant l’action", explanation: "못 précède le verbe conjugué : 못 알아들어요, 못 먹어요. Il ne se place pas après le verbe." },
      { title: "Compare avec 안", explanation: "Choix ou négation simple → 안. Incapacité ou empêchement → 못 : 안 가요 / 못 가요." },
    ],
    examples: [
      { korean: "잘 못 알아들어요.", french: "Je ne comprends pas bien.", parts: [{ korean: "잘", french: "bien", role: "degré" }, { korean: "못 알아들어요", french: "je ne peux pas comprendre", role: "incapacité" }] },
      { korean: "매운 음식을 못 먹어요.", french: "Je ne peux pas manger de plats épicés.", parts: [{ korean: "매운 음식을", french: "des plats épicés", role: "objet" }, { korean: "못 먹어요", french: "ne peux pas manger", role: "incapacité" }] },
    ],
    commonMistakes: [
      { mistake: "Employer 안 pour exprimer une incapacité.", correction: "Dis 못 가요 si tu ne peux réellement pas y aller ; 안 가요 exprime plutôt le choix ou la négation." },
      { mistake: "Placer 못 après le verbe ou conserver 못 하다 dans un verbe composé.", correction: "Place-le avant l’action conjuguée : 못 해요, 운전을 못 해요." },
    ],
    memoryTip: "안 ferme la porte par choix ; 못 dit que la porte ne s’ouvre pas. Dans les deux cas, le marqueur vient avant l’action.",
  },
  "add-item": {
    stageId: "add-item",
    introduction: "도 ajoute un élément à ce qui vient d’être dit : « aussi » ou parfois « même ». La particule se colle au groupe ajouté et remplace généralement la particule précédente.",
    mainRule: "Attache 도 au nom ou au groupe que tu ajoutes : 물도 주세요, « de l’eau aussi ». Ne conserve pas en même temps 은/는, 이/가 ou 을/를.",
    formula: { pattern: "élément ajouté + 도 + prédicat", explanation: "도 peut marquer une personne, un objet ou un lieu : 저도 가요, 김치도 주세요. Le reste garde sa structure." },
    steps: [
      { title: "Repère le premier élément", explanation: "Identifie ce qui est déjà mentionné : quelqu’un commande, va quelque part ou choisit une chose." },
      { title: "Ajoute le nouvel élément", explanation: "Colle 도 au groupe ajouté : 물도, 저도, 김치도. Il remplace souvent 을/를 ou 은/는." },
      { title: "Conserve le prédicat", explanation: "Garde le même verbe ou laisse-le sous-entendu selon le contexte : 물도 주세요." },
    ],
    examples: [
      { korean: "물도 주세요.", french: "De l’eau aussi, s’il vous plaît.", parts: [{ korean: "물도", french: "de l’eau aussi", role: "élément ajouté" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
      { korean: "저도 가요.", french: "Moi aussi, j’y vais.", parts: [{ korean: "저도", french: "moi aussi", role: "personne ajoutée" }, { korean: "가요", french: "je vais", role: "action" }] },
    ],
    commonMistakes: [
      { mistake: "Écrire 저는도 ou 물을도 en conservant la particule précédente.", correction: "도 remplace généralement la particule : 저도, 물도." },
      { mistake: "Confondre 도 avec 하고.", correction: "« aussi » → 도 ; « et / avec » → 하고 ou (이)랑." },
    ],
    memoryTip: "도 signifie « ajoute celui-ci aussi » : colle-le directement à l’élément qui rejoint la scène.",
  },
  "limit-request": {
    stageId: "limit-request",
    introduction: "만 limite l’information à un seul élément ou à un seul choix. Contrairement à 도, il n’ajoute pas : il exclut les autres possibilités dans le contexte.",
    mainRule: "Attache 만 directement au groupe limité : 한 잔만 주세요, « un seul verre, s’il vous plaît ». Comme 도, 만 remplace généralement la particule précédente.",
    formula: { pattern: "élément limité + 만 + prédicat", explanation: "만 peut limiter une quantité, une personne ou un objet : 한 잔만, 카드만. La phrase peut rester positive." },
    steps: [
      { title: "Définis la limite", explanation: "Choisis ce qui doit être le seul élément retenu : un verre, une carte, de l’eau ou une personne." },
      { title: "Place 만 après ce groupe", explanation: "Colle 만 au groupe complet : 한 잔만, 물만, 카드만. Le classificateur reste avant 만." },
      { title: "Compare avec 도", explanation: "도 ajoute une possibilité ; 만 la restreint : 물도 « aussi », 물만 « seulement »." },
    ],
    examples: [
      { korean: "한 잔만 주세요.", french: "Un seul verre, s’il vous plaît.", parts: [{ korean: "한 잔만", french: "un seul verre", role: "quantité limitée" }, { korean: "주세요", french: "s’il vous plaît", role: "demande" }] },
      { korean: "카드만 있어요.", french: "Je n’ai que ma carte.", parts: [{ korean: "카드만", french: "seulement une carte", role: "élément limité" }, { korean: "있어요", french: "il y a / j’ai", role: "existence" }] },
    ],
    commonMistakes: [
      { mistake: "Utiliser 도 pour dire « seulement ».", correction: "La restriction se marque avec 만 : 물만." },
      { mistake: "Placer 만 avant le nombre ou oublier la quantité complète.", correction: "Construis nombre + classificateur, puis ajoute 만 : 한 잔만." },
    ],
    memoryTip: "도 ouvre la liste ; 만 la ferme. Visualise 만 comme une barrière après l’unique choix conservé.",
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
