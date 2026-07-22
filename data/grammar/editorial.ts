import type {
  GrammarConcept,
  GrammarConceptId,
  GrammarPracticeProfile,
} from "./types.ts";

type GrammarEditorialContent = {
  rule: string;
  ruleParts?: GrammarConcept["ruleParts"];
  practice: Omit<GrammarPracticeProfile, "focusForm" | "formDistractors">;
};

function practice(
  distractorGroup: GrammarPracticeProfile["distractorGroup"],
  scenario: string,
  korean: string,
  french: string,
): Omit<GrammarPracticeProfile, "focusForm" | "formDistractors"> {
  return {
    distractorGroup,
    scenario,
    scene: { korean, french },
  };
}

export const GRAMMAR_EDITORIAL = {
  "sentence-order": {
    rule: "Le verbe ou l’adjectif se place à la fin. Le sujet peut être omis quand le contexte suffit.",
    practice: practice(
      "sentence",
      "Au café, tu expliques simplement ce que tu bois.",
      "저는 차를 마셔요.",
      "Je bois du thé.",
    ),
  },
  "copula-ieyo-yeyo": {
    rule: "Ajoute 이에요 après une consonne et 예요 après une voyelle pour identifier une personne ou une chose.",
    practice: practice(
      "identity",
      "Tu te présentes à une nouvelle collègue et tu lui donnes ton prénom.",
      "소피예요.",
      "Je m’appelle Sophie.",
    ),
  },
  "polite-style-yo": {
    rule: "La terminaison 요 marque le style poli courant. Utilise-la avec un adulte ou une personne que tu connais peu.",
    practice: practice(
      "identity",
      "Un serveur te propose une table calme et tu acceptes poliment.",
      "좋아요.",
      "Ça me va.",
    ),
  },
  "copula-imnida": {
    rule: "Ajoute 입니다 directement au nom pour une présentation formelle. À l’oral quotidien, 이에요/예요 est plus naturel.",
    practice: practice(
      "identity",
      "Au guichet, tu te présentes dans un registre formel.",
      "안내원입니다.",
      "Je suis agent d’accueil.",
    ),
  },
  "topic-eun-neun": {
    rule: "Ajoute 은 après une consonne et 는 après une voyelle pour annoncer le thème ou créer un contraste.",
    practice: practice(
      "identity",
      "Tu précises ce que tu fais aujourd’hui, par contraste avec les autres jours.",
      "오늘은 쉬어요.",
      "Aujourd’hui, je me repose.",
    ),
  },
  "demonstratives-i-geu-jeo": {
    rule: "Place 이, 그 ou 저 devant un nom : près de toi, de l’interlocuteur ou loin des deux.",
    practice: practice(
      "identity",
      "Dans un magasin, tu désignes les chaussures proches de la vendeuse.",
      "그 신발이에요.",
      "C’est cette paire de chaussures-là.",
    ),
  },
  "question-mwo-nugu-myeot": {
    rule: "Utilise 누구 pour une personne, 뭐 pour une chose et 몇 devant un classificateur pour demander un nombre.",
    practice: practice(
      "identity",
      "Au guichet, tu demandes combien de billets sont prévus.",
      "몇 장이에요?",
      "Combien de billets ?",
    ),
  },
  "subject-i-ga": {
    rule: "Ajoute 이 après une consonne et 가 après une voyelle pour identifier précisément le sujet d’un état ou événement.",
    practice: practice(
      "identity",
      "À l’arrêt, tu signales que le bus arrive.",
      "버스가 와요.",
      "Le bus arrive.",
    ),
  },
  "existence-isseoyo-eopseoyo": {
    rule: "Le nom existant prend 이/가, puis 있어요 ou 없어요 indique sa présence ou son absence.",
    practice: practice(
      "identity",
      "Au restaurant, tu vérifies qu’une option végétarienne est disponible.",
      "채식 메뉴가 있어요?",
      "Y a-t-il un menu végétarien ?",
    ),
  },
  "location-e": {
    rule: "Place le lieu avec 에 avant 있어요 ou 없어요. Cette construction situe une personne ou une chose, sans action.",
    practice: practice(
      "sentence",
      "Quelqu’un cherche ton ami ; tu indiques où il se trouve.",
      "친구는 카페에 있어요.",
      "Mon ami est au café.",
    ),
  },
  "present-a-eoyo": {
    rule: "Ajoute 아요 si la dernière voyelle est ㅏ ou ㅗ, sinon 어요 ; 하다 devient 해요.",
    practice: practice(
      "sentence",
      "Tu décris une habitude de ta routine du matin.",
      "아침마다 운동해요.",
      "Je fais du sport chaque matin.",
    ),
  },
  "object-eul-reul": {
    rule: "Ajoute 을 après une consonne et 를 après une voyelle au nom directement concerné par l’action.",
    practice: practice(
      "sentence",
      "À la bibliothèque, tu dis ce que tu lis.",
      "책을 읽어요.",
      "Je lis un livre.",
    ),
  },
  "action-location-eseo": {
    rule: "Ajoute 에서 au lieu où une action se déroule, puis place le verbe à la fin. Avec 있어요 ou 없어요, utilise 에 : 카페에서 공부해요, mais 카페에 있어요. La distinction dépend donc du verbe.",
    practice: practice(
      "sentence",
      "On te demande où tu lis habituellement.",
      "도서관에서 책을 읽어요.",
      "Je lis un livre à la bibliothèque.",
    ),
  },
  "destination-time-e": {
    rule: "Ajoute 에 après une destination avec un verbe de déplacement, ou après un moment précis. Le contexte distingue les deux emplois : 서울에 가요 signifie aller à Séoul ; 세 시에 만나요, se retrouver à trois heures.",
    ruleParts: [
      {
        form: "destination + 에 + déplacement",
        explanation: "에 marque le lieu vers lequel on va.",
      },
      {
        form: "moment précis + 에",
        explanation: "에 marque l’heure ou le moment d’une action.",
      },
    ],
    practice: practice(
      "sentence",
      "Tu confirmes à quelle heure tu retrouves un ami.",
      "두 시에 친구를 만나요.",
      "Je retrouve un ami à deux heures.",
    ),
  },
  "possession-ui-je-nae": {
    rule: "Place 의 entre le possesseur et l’objet. 제 et 내 signifient respectivement « mon » en style poli et familier.",
    practice: practice(
      "identity",
      "À bord, tu confirmes qu’il s’agit bien de ton billet.",
      "이건 제 표예요.",
      "C’est mon billet.",
    ),
  },
  "interrogatives-basic": {
    rule: "Garde le mot interrogatif à la place de l’information inconnue : 어디 pour un lieu, 언제 pour un moment, 왜 pour une raison.",
    practice: practice(
      "identity",
      "Sur le quai, tu demandes l’heure d’arrivée du train.",
      "기차가 언제 와요?",
      "Quand arrive le train ?",
    ),
  },
  "negation-an": {
    rule: "Place 안 juste avant le verbe ou l’adjectif conjugué. Avec 하다, la forme naturelle est souvent 안 해요.",
    practice: practice(
      "sentence",
      "On t’invite à sortir aujourd’hui, mais tu déclines simplement.",
      "오늘은 안 가요.",
      "Je n’y vais pas aujourd’hui.",
    ),
  },
  "copula-negation-anieyo": {
    rule: "Pour nier un nom, ajoute 이/가 puis 아니에요. N’utilise pas 안 devant 이에요 ou 예요.",
    practice: practice(
      "identity",
      "Dans le train, tu indiques que le siège montré n’est pas le tien.",
      "제 자리가 아니에요.",
      "Ce n’est pas ma place.",
    ),
  },
  "request-n-juseyo": {
    rule: "Place le nom demandé devant 주세요. 좀 peut adoucir la demande, mais il n’est pas obligatoire.",
    practice: practice(
      "quantity-request",
      "Après avoir payé, tu demandes le reçu au vendeur.",
      "영수증 주세요.",
      "Le reçu, s’il vous plaît.",
    ),
  },
  "native-numbers": {
    rule: "Devant un classificateur, 하나, 둘, 셋 et 넷 deviennent 한, 두, 세 et 네 devant les noms comptés.",
    practice: practice(
      "quantity-request",
      "Au marché, tu commandes trois pommes.",
      "사과 세 개 주세요.",
      "Trois pommes, s’il vous plaît.",
    ),
  },
  "classifiers-basic": {
    rule: "Place le nombre puis le classificateur après le nom : 개 pour les objets, 명 pour les personnes, 잔 pour les boissons.",
    practice: practice(
      "quantity-request",
      "Au guichet, tu commandes deux billets.",
      "표 두 장 주세요.",
      "Deux billets, s’il vous plaît.",
    ),
  },
  "sino-korean-numbers": {
    rule: "Utilise les nombres sino-coréens pour les prix, les minutes, les dates, les étages, les lignes et les numéros.",
    practice: practice(
      "quantity-request",
      "Le vendeur annonce un prix de cinq mille wons.",
      "오천 원이에요.",
      "Cela coûte cinq mille wons.",
    ),
  },
  "noun-link-hago-irang": {
    rule: "Ajoute 하고 ou (이)랑 au premier nom pour dire « et » ou « avec » ; (이)랑 suit la présence d’une consonne. 와/과 exprime le même lien dans un registre plus écrit ou formel.",
    practice: practice(
      "quantity-request",
      "À l’épicerie, tu demandes du pain et du lait.",
      "빵하고 우유 주세요.",
      "Du pain et du lait, s’il vous plaît.",
    ),
  },
  "alternative-ina-animyeon": {
    rule: "Ajoute 이나 après une consonne et 나 après une voyelle pour relier des noms possibles. 아니면 relie plutôt deux propositions ou introduit une autre possibilité : 커피나 차, mais 가요? 아니면 집에 있어요?",
    ruleParts: [
      {
        form: "N(이)나 N",
        explanation: "(이)나 relie directement deux noms possibles.",
      },
      {
        form: "proposition + 아니면 + proposition",
        explanation: "아니면 introduit une autre proposition ou une nouvelle option.",
      },
    ],
    practice: practice(
      "quantity-request",
      "Pour le trajet, tu proposes le bus ou le métro comme possibilités.",
      "버스나 지하철로 가요.",
      "J’y vais en bus ou en métro.",
    ),
  },
  "request-v-a-eo-juseyo": {
    rule: "Conjugue le verbe en -아/어, puis ajoute 주세요 pour demander une action au destinataire. Cette construction porte sur une action ; pour demander un objet, place simplement le nom devant 주세요.",
    practice: practice(
      "quantity-request",
      "Ton interlocuteur parle trop vite ; tu lui demandes de ralentir.",
      "천천히 말해 주세요.",
      "Parlez lentement, s’il vous plaît.",
    ),
  },
  "polite-instruction-euseyo": {
    rule: "Ajoute 으세요 après une consonne et 세요 après une voyelle pour donner une instruction polie. La forme peut aussi inviter respectueusement quelqu’un à agir : 앉으세요 signifie « asseyez-vous ».",
    practice: practice(
      "quantity-request",
      "Tu invites poliment une personne à prendre place ici.",
      "여기에 앉으세요.",
      "Asseyez-vous ici.",
    ),
  },
  "direction-means-ro-euro": {
    rule: "Ajoute 으로 après une consonne, sauf ㄹ, et 로 après une voyelle ou ㄹ. La particule indique une direction ou un moyen : 오른쪽으로 가요, 카드로 계산해요. Le nom précède toujours la particule.",
    ruleParts: [
      {
        form: "direction + (으)로",
        explanation: "(으)로 indique la direction suivie.",
      },
      {
        form: "moyen + (으)로",
        explanation: "(으)로 indique le moyen utilisé pour agir.",
      },
    ],
    practice: practice(
      "sentence",
      "Dans la rue, tu indiques à quelqu’un de partir vers la droite.",
      "오른쪽으로 가세요.",
      "Allez à droite.",
    ),
  },
  "desire-go-sipeoyo": {
    rule: "Retire 다 de la forme du dictionnaire, puis ajoute 고 싶어요 pour exprimer ton propre souhait. Avec une autre personne, préfère une question ou une formulation indirecte : 뭐 먹고 싶어요?",
    practice: practice(
      "ability-needs",
      "Au restaurant, tu dis ce que tu aimerais manger.",
      "비빔밥을 먹고 싶어요.",
      "Je veux manger du bibimbap.",
    ),
  },
  "ability-eul-su-isseoyo": {
    rule: "Ajoute ㄹ 수 있어요 après une voyelle et 을 수 있어요 après une consonne pour exprimer une capacité ou une possibilité. Remplace 있어요 par 없어요 quand l’action est impossible dans la situation décrite.",
    practice: practice(
      "ability-needs",
      "À la caisse, tu demandes si le paiement par carte est possible ici.",
      "여기서 카드로 결제할 수 있어요?",
      "Le paiement par carte est-il possible ici ?",
    ),
  },
  "permission-a-eodo-dwaeyo": {
    rule: "Conjugue le verbe en -아/어도 돼요? pour demander si une action est autorisée. Cette forme demande une permission, tandis que -(으)ㄹ 수 있어요? vérifie plutôt une possibilité ou une capacité.",
    practice: practice(
      "ability-needs",
      "Dans une chambre, tu demandes l’autorisation d’ouvrir la fenêtre.",
      "창문을 열어도 돼요?",
      "Puis-je ouvrir la fenêtre ?",
    ),
  },
  "inability-mot": {
    rule: "Place 못 juste avant le verbe pour signaler qu’une action est impossible ou hors de tes capacités. 안 indique plutôt un choix ou une simple négation : 못 가요, « je ne peux pas y aller ».",
    practice: practice(
      "ability-needs",
      "Tu expliques qu’aujourd’hui, tu es incapable de conduire.",
      "오늘은 운전을 못 해요.",
      "Je ne peux pas conduire aujourd’hui.",
    ),
  },
  "additive-do": {
    rule: "Ajoute 도 directement au nom pour signifier « aussi » ou « même ». La particule remplace généralement 은/는, 이/가 ou 을/를 : 저도 가요 signifie « moi aussi, j’y vais ».",
    practice: practice(
      "sentence",
      "Après une première commande, tu ajoutes du kimchi.",
      "김치도 주세요.",
      "Du kimchi aussi, s’il vous plaît.",
    ),
  },
  "restrictive-man": {
    rule: "Ajoute 만 directement au nom pour limiter le choix à cet élément : 물만 마셔요, « je ne bois que de l’eau ». Contrairement à 도, 만 exclut les autres possibilités.",
    practice: practice(
      "sentence",
      "On te propose plusieurs boissons, mais tu précises que tu bois seulement de l’eau.",
      "물만 마셔요.",
      "Je ne bois que de l’eau.",
    ),
  },
  "range-buteo-kkaji": {
    rule: "Ajoute 부터 au point de départ et 까지 au point d’arrivée d’une période ou d’un trajet. Tu peux employer les deux ensemble ou seulement 까지 : 아홉 시부터 다섯 시까지.",
    practice: practice(
      "time-linking",
      "Tu indiques les jours entre lesquels tu travailles.",
      "월요일부터 금요일까지 일해요.",
      "Je travaille du lundi au vendredi.",
    ),
  },
  "past-ass-eosseoyo": {
    rule: "Ajoute 았어요 si la dernière voyelle est ㅏ ou ㅗ, sinon 었어요 ; 하다 devient 했어요. Cette terminaison présente une action ou un état comme achevé : 어제 영화를 봤어요.",
    practice: practice(
      "time-linking",
      "Tu racontes ce que tu as regardé hier.",
      "어제 영화를 봤어요.",
      "J’ai regardé un film hier.",
    ),
  },
  "future-eul-geoyeyo": {
    rule: "Ajoute ㄹ 거예요 après une voyelle et 을 거예요 après une consonne pour annoncer un projet ou une prévision. Cette forme présente un plan, sans la nuance de décision adressée à quelqu’un portée par -(으)ㄹ게요.",
    practice: practice(
      "time-linking",
      "Tu annonces ton projet de voyage pour la semaine prochaine.",
      "다음 주에 부산에 갈 거예요.",
      "Je vais aller à Busan la semaine prochaine.",
    ),
  },
  "intention-eulgeyo": {
    rule: "Ajoute ㄹ게요 après une voyelle et 을게요 après une consonne pour annoncer une décision prise par le locuteur, souvent en réaction à l’interlocuteur. Pour un simple projet déjà prévu, utilise plutôt -(으)ㄹ 거예요.",
    practice: practice(
      "time-linking",
      "Quelqu’un doit ouvrir la porte ; tu proposes de t’en charger.",
      "제가 문을 열게요.",
      "Je vais ouvrir la porte.",
    ),
  },
  "sequence-go": {
    rule: "Ajoute 고 au radical du premier verbe, puis conjugue seulement le dernier pour relier deux actions. L’ordre peut suivre la chronologie, mais 고 signifie d’abord simplement « et » : 먹고 가요.",
    practice: practice(
      "time-linking",
      "Tu décris deux actions successives de ton repas.",
      "밥을 먹고 커피를 마셔요.",
      "Je mange, puis je bois un café.",
    ),
  },
  "reason-a-eoseo": {
    rule: "Ajoute 아서 si la dernière voyelle est ㅏ ou ㅗ, sinon 어서, pour relier une cause à sa conséquence. Dans cette construction, ne marque généralement pas le passé sur la première proposition : 늦어서 죄송해요.",
    practice: practice(
      "time-linking",
      "Comme il pleut, tu expliques pourquoi tu prends un taxi.",
      "비가 와서 택시를 타요.",
      "Je prends un taxi parce qu’il pleut.",
    ),
  },
  "contrast-jiman": {
    rule: "Ajoute 지만 au radical du verbe ou de l’adjectif pour opposer deux informations, puis conjugue la proposition finale. La première information reste vraie malgré la seconde, sans annuler aucune des deux : 작지만 편해요.",
    practice: practice(
      "time-linking",
      "Tu décris une chambre petite, mais confortable.",
      "작지만 편해요.",
      "Cette chambre est petite, mais confortable.",
    ),
  },
  "condition-eumyeon": {
    rule: "Ajoute 으면 après une consonne et 면 après une voyelle pour poser une condition. La construction -(으)면 돼요 exprime séparément qu’une action suffit : 여기에서 내리면 돼요, « il suffit de descendre ici ».",
    ruleParts: [
      {
        form: "V-(으)면",
        explanation: "-(으)면 pose la condition nécessaire à la suite.",
      },
      {
        form: "V-(으)면 돼요",
        explanation: "-(으)면 돼요 indique que cette action suffit.",
      },
    ],
    practice: practice(
      "time-linking",
      "Tu expliques ce que tu fais s’il pleut.",
      "비가 오면 집에 있어요.",
      "S’il pleut, je reste à la maison.",
    ),
  },
  "obligation-a-eoya-haeyo": {
    rule: "Conjugue le verbe en -아/어야 해요 pour dire qu’une action est obligatoire. 필요해요 exprime séparément qu’un nom est nécessaire : 표를 사야 해요, mais 표가 필요해요. Ne mélange pas ces deux constructions.",
    ruleParts: [
      {
        form: "V-아/어야 해요",
        explanation: "Cette terminaison porte sur une action obligatoire.",
      },
      {
        form: "N이/가 필요해요",
        explanation: "필요해요 porte sur une chose dont on a besoin.",
      },
    ],
    practice: practice(
      "ability-needs",
      "Au contrôle, on t’explique que tu dois montrer ton passeport.",
      "여권을 보여 줘야 해요.",
      "Il faut montrer son passeport.",
    ),
  },
  "comparison-boda-deo-jeil": {
    rule: "Place 보다 après l’élément de référence et 더 devant l’adjectif pour former un comparatif. 제일 signifie « le plus » sans second terme : 버스보다 지하철이 더 빨라요 ; 이게 제일 빨라요.",
    ruleParts: [
      {
        form: "référence + 보다… 더",
        explanation: "보다 fixe la référence et 더 marque le comparatif.",
      },
      {
        form: "제일 + adjectif",
        explanation: "제일 forme un superlatif sans second terme de comparaison.",
      },
    ],
    practice: practice(
      "time-linking",
      "Tu compares deux sacs et indiques que celui-ci est plus léger.",
      "이 가방이 저 가방보다 더 가벼워요.",
      "Ce sac est plus léger que celui-là.",
    ),
  },
  "suggestion-eulkkayo": {
    rule: "Ajoute ㄹ까요 après une voyelle et 을까요 après une consonne pour proposer une action commune ou demander l’avis de l’interlocuteur. Avec je comme sujet implicite, la forme peut aussi offrir de faire quelque chose.",
    practice: practice(
      "ability-needs",
      "À midi, tu proposes à un collègue de déjeuner ensemble.",
      "점심을 같이 먹을까요?",
      "On déjeune ensemble ?",
    ),
  },
  "honorific-si": {
    rule: "Insère 시 après le radical pour honorer le sujet de l’action, puis ajoute la terminaison polie. Certaines formes emploient aussi un mot spécial, comme 계시다 pour 있다 ou 말씀 pour 말 ; à ce niveau, reconnais-les surtout.",
    practice: practice(
      "ability-needs",
      "À l’accueil, quelqu’un annonce respectueusement l’arrivée du professeur.",
      "선생님이 오세요.",
      "Le professeur arrive.",
    ),
  },
} as const satisfies Readonly<
  Record<GrammarConceptId, GrammarEditorialContent>
>;

export const GRAMMAR_PRACTICE_FOCUS_FORMS = {
  "sentence-order": "prédicat en fin de phrase",
  "copula-ieyo-yeyo": "예요",
  "polite-style-yo": "-요",
  "copula-imnida": "입니다",
  "topic-eun-neun": "은",
  "demonstratives-i-geu-jeo": "그",
  "question-mwo-nugu-myeot": "몇",
  "subject-i-ga": "가",
  "existence-isseoyo-eopseoyo": "있어요",
  "location-e": "에 + 있어요",
  "present-a-eoyo": "해요",
  "object-eul-reul": "을",
  "action-location-eseo": "에서",
  "destination-time-e": "moment précis + 에",
  "possession-ui-je-nae": "제",
  "interrogatives-basic": "언제",
  "negation-an": "안 + verbe",
  "copula-negation-anieyo": "이/가 아니에요",
  "request-n-juseyo": "N 주세요",
  "native-numbers": "세",
  "classifiers-basic": "장",
  "sino-korean-numbers": "오천",
  "noun-link-hago-irang": "하고",
  "alternative-ina-animyeon": "나",
  "request-v-a-eo-juseyo": "V-아/어 주세요",
  "polite-instruction-euseyo": "V-(으)세요",
  "direction-means-ro-euro": "direction + (으)로",
  "desire-go-sipeoyo": "V-고 싶어요",
  "ability-eul-su-isseoyo": "V-(으)ㄹ 수 있어요",
  "permission-a-eodo-dwaeyo": "V-아/어도 돼요?",
  "inability-mot": "못 + verbe",
  "additive-do": "도",
  "restrictive-man": "만",
  "range-buteo-kkaji": "부터…까지",
  "past-ass-eosseoyo": "V-았/었어요",
  "future-eul-geoyeyo": "V-(으)ㄹ 거예요",
  "intention-eulgeyo": "V-(으)ㄹ게요",
  "sequence-go": "V-고",
  "reason-a-eoseo": "V-아/어서",
  "contrast-jiman": "V/A-지만",
  "condition-eumyeon": "V-(으)면",
  "obligation-a-eoya-haeyo": "V-아/어야 해요",
  "comparison-boda-deo-jeil": "N보다 더",
  "suggestion-eulkkayo": "V-(으)ㄹ까요?",
  "honorific-si": "-시-",
} as const satisfies Readonly<Record<GrammarConceptId, string>>;

export const GRAMMAR_FORM_DISTRACTORS = {
  "sentence-order": [
    "sujet en fin de phrase",
    "objet en fin de phrase",
    "particule en fin de phrase",
  ],
  "copula-ieyo-yeyo": ["이에요", "입니다", "아니에요"],
  "polite-style-yo": ["-습니다", "-지", "-고"],
  "copula-imnida": ["이에요", "아닙니다", "있습니다"],
  "topic-eun-neun": ["는", "이", "을"],
  "demonstratives-i-geu-jeo": ["이", "저", "거기"],
  "question-mwo-nugu-myeot": ["뭐", "누구", "얼마"],
  "subject-i-ga": ["는", "를", "에"],
  "existence-isseoyo-eopseoyo": ["없어요", "아니에요", "해요"],
  "location-e": ["에서 + 있어요", "(으)로 + 있어요", "을/를 + 있어요"],
  "present-a-eoyo": ["했어요", "할 거예요", "안 해요"],
  "object-eul-reul": ["은", "이", "에서"],
  "action-location-eseo": ["에", "(으)로", "까지"],
  "destination-time-e": ["moment précis + 에서", "moment précis + 부터", "moment précis + 까지"],
  "possession-ui-je-nae": ["저", "제가", "내"],
  "interrogatives-basic": ["어디", "왜", "어떻게"],
  "negation-an": ["못 + verbe", "verbe + 지 않아요", "nom + 아니에요"],
  "copula-negation-anieyo": ["안 + copule", "못 + copule", "이/가 없어요"],
  "request-n-juseyo": ["V-아/어 주세요", "V-(으)세요", "N이/가 있어요"],
  "native-numbers": ["셋", "삼", "세 번째"],
  "classifiers-basic": ["개", "명", "잔"],
  "sino-korean-numbers": ["다섯 천", "오천 개", "다섯"],
  "noun-link-hago-irang": ["도", "나", "만"],
  "alternative-ina-animyeon": ["하고", "도", "만"],
  "request-v-a-eo-juseyo": ["N 주세요", "V-(으)세요", "V-고 싶어요"],
  "polite-instruction-euseyo": ["V-아/어 주세요", "V-아/어요", "V-(으)ㄹ까요?"],
  "direction-means-ro-euro": ["direction + 에", "direction + 에서", "direction + 까지"],
  "desire-go-sipeoyo": ["V-(으)ㄹ 거예요", "V-(으)ㄹ게요", "V-(으)ㄹ까요?"],
  "ability-eul-su-isseoyo": ["V-아/어도 돼요?", "V-고 싶어요", "못 + verbe"],
  "permission-a-eodo-dwaeyo": ["V-(으)ㄹ 수 있어요?", "V-(으)세요", "V-아/어야 해요"],
  "inability-mot": ["안 + verbe", "V-(으)ㄹ 수 있어요", "nom + 아니에요"],
  "additive-do": ["만", "하고", "나"],
  "restrictive-man": ["도", "하고", "나"],
  "range-buteo-kkaji": ["에", "에서", "동안"],
  "past-ass-eosseoyo": ["V-아/어요", "V-(으)ㄹ 거예요", "V-(으)ㄹ게요"],
  "future-eul-geoyeyo": ["V-(으)ㄹ게요", "V-았/었어요", "V-아/어요"],
  "intention-eulgeyo": ["V-(으)ㄹ 거예요", "V-(으)ㄹ까요?", "V-아/어요"],
  "sequence-go": ["V-아/어서", "V-지만", "V-(으)면"],
  "reason-a-eoseo": ["V-고", "V-지만", "V-(으)면"],
  "contrast-jiman": ["V-고", "V-아/어서", "V-(으)면"],
  "condition-eumyeon": ["V-아/어서", "V-지만", "V-(으)ㄹ까요?"],
  "obligation-a-eoya-haeyo": ["V-아/어도 돼요?", "V-(으)ㄹ 수 있어요", "V-(으)세요"],
  "comparison-boda-deo-jeil": ["N만", "N도", "제일 + adjectif"],
  "suggestion-eulkkayo": ["V-(으)ㄹ 거예요", "V-(으)ㄹ게요", "V-아/어도 돼요?"],
  "honorific-si": ["-요", "-습니다", "-아/어 주세요"],
} as const satisfies Readonly<
  Record<GrammarConceptId, readonly [string, string, string]>
>;
