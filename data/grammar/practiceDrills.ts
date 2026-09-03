import type {
  GrammarConceptId,
  GrammarPracticeDrill,
  GrammarPracticeSkill,
} from "./types.ts";

type DrillOptions = readonly [string, string, string];

function gap(
  skill: GrammarPracticeSkill,
  id: string,
  stimulus: string,
  answer: string,
  distractors: DrillOptions,
  explanation: string,
  ruleAspect?: string,
  context?: string,
  prompt = "Complète la phrase avec la forme grammaticalement correcte.",
): GrammarPracticeDrill {
  return {
    id,
    kind: "gap",
    skill,
    prompt,
    stimulus,
    displayLabel: "PHRASE À COMPLÉTER",
    ...(context ? { context } : {}),
    answer,
    distractors,
    explanation,
    ...(ruleAspect ? { ruleAspect } : {}),
  };
}

function transform(
  skill: GrammarPracticeSkill,
  id: string,
  stimulus: string,
  answer: string,
  distractors: DrillOptions,
  explanation: string,
  ruleAspect?: string,
  context?: string,
  prompt = "Transforme la forme du dictionnaire selon la consigne.",
): GrammarPracticeDrill {
  return {
    id,
    kind: "transformation",
    skill,
    prompt,
    stimulus,
    displayLabel: "FORME À TRANSFORMER",
    ...(context ? { context } : {}),
    answer,
    distractors,
    explanation,
    ...(ruleAspect ? { ruleAspect } : {}),
  };
}

function choose(
  skill: GrammarPracticeSkill,
  id: string,
  stimulus: string,
  answer: string,
  distractors: DrillOptions,
  explanation: string,
  ruleAspect?: string,
  context?: string,
  prompt = "Choisis la forme qui exprime exactement le sens demandé.",
): GrammarPracticeDrill {
  return {
    id,
    kind: context ? "scene" : "choice",
    skill,
    prompt,
    stimulus,
    displayLabel: context ? "RÉPLIQUE À COMPLÉTER" : "INDICE",
    ...(context ? { context } : {}),
    answer,
    distractors,
    explanation,
    ...(ruleAspect ? { ruleAspect } : {}),
  };
}

function order(
  id: string,
  stimulus: string,
  answer: readonly string[],
  explanation: string,
  ruleAspect?: string,
  context?: string,
): GrammarPracticeDrill {
  return {
    id,
    kind: "order",
    skill: "syntax",
    prompt: "Remets les éléments dans l’ordre pour former la phrase coréenne indiquée.",
    stimulus,
    displayLabel: "PHRASE À FORMER",
    ...(context ? { context } : {}),
    answer,
    explanation,
    ...(ruleAspect ? { ruleAspect } : {}),
  };
}

export const GRAMMAR_PRACTICE_DRILLS: Partial<
  Record<GrammarConceptId, readonly GrammarPracticeDrill[]>
> = {
  "sentence-order": [
    order("coffee-order", "Moi, je bois du café.", ["저는", "커피를", "마셔요."], "L’ordre neutre demandé est thème–objet–verbe : 저는 커피를 마셔요. D’autres placements sont possibles pour mettre un élément en relief.", "neutral-order", "Construis une phrase neutre, sans mise en relief : thème, puis objet, puis verbe."),
    choose("syntax", "home-order", "« Moi, je rentre à la maison. »", "저는 집에 가요.", ["가요 저는 집에.", "저는 가요 집에.", "집에 가요 저는."], "Le groupe de destination précède le verbe final : 저는 집에 가요.", "predicate-final", undefined, "Choisis la phrase dont le verbe est correctement placé à la fin."),
    choose("syntax", "book-order", "« Je lis un livre à la bibliothèque. »", "도서관에서 책을 읽어요.", ["도서관에서 읽어요 책을.", "읽어요 도서관에서 책을.", "책을 읽어요 도서관에서."], "Le lieu et l’objet précèdent le verbe final : 도서관에서 책을 읽어요.", "predicate-final", undefined, "Choisis la phrase dont le verbe est correctement placé à la fin."),
    choose("syntax", "friend-order", "« Je rencontre un ami demain. »", "내일 친구를 만나요.", ["내일 만나요 친구를.", "만나요 내일 친구를.", "친구를 만나요 내일."], "Le temps et l’objet précèdent le verbe final : 내일 친구를 만나요.", "predicate-final", undefined, "Choisis la phrase dont le verbe est correctement placé à la fin."),
    choose("syntax", "subject-omission", "Réponse naturelle à « Où allez-vous ? »", "학교에 가요.", ["저는 학교에 가요.", "학교에 가요 저는.", "가요 학교에."], "Le sujet déjà compris s’omet ici et le verbe reste à la fin : 학교에 가요.", "subject-omission", "La question vient d’identifier clairement la personne qui répond ; la consigne exige une réponse sans sujet répété.", "Choisis la réponse naturelle avec le verbe final et sans sujet inutile."),
  ],

  "copula-ieyo-yeyo": [
    gap("forms", "student-batchim", "학생__.", "이에요", ["예요", "이예요", "입니다"], "학생 se termine par une consonne : on ajoute 이에요.", "batchim", "Réponds dans le style poli courant de la conversation."),
    gap("forms", "doctor-vowel", "의사__.", "예요", ["이에요", "이예요", "입니다"], "의사 se termine par une voyelle : on ajoute 예요.", "no-batchim", "Réponds dans le style poli courant de la conversation."),
    gap("forms", "book-batchim", "책__.", "이에요", ["예요", "이예요", "아니에요"], "Tu identifies affirmativement l’objet : 책 se termine par un 받침 et prend 이에요. 아니에요 nierait cette identité.", "batchim", "Tu confirmes que l’objet montré est bien un livre."),
    gap("forms", "friend-vowel", "친구__.", "예요", ["이에요", "이예요", "아니에요"], "Tu identifies affirmativement cette personne : 친구 finit par une voyelle et prend 예요. 아니에요 exprimerait le contraire.", "no-batchim", "Tu confirmes que cette personne est bien ton ami."),
    gap("forms", "name-batchim", "이름은 수진__.", "이에요", ["예요", "이예요", "입니다"], "수진 se termine par ㄴ et prend 이에요 dans le style poli courant demandé. 입니다 serait correct dans un registre formel.", "batchim", "Tu présentes Sujin dans une conversation quotidienne, au style poli courant et non formel.", "Repère la terminaison du nom et choisis la copule du style poli courant."),
  ],

  "polite-style-yo": [
    transform("register", "good-daily", "좋다 → ?", "좋아요", ["좋습니다", "좋아", "좋았어요"], "좋아요 est la forme présente du style poli courant.", "daily-polite", "Tu réponds à un serveur dans une conversation quotidienne.", "Conjugue au présent, dans le style poli courant en -요."),
    transform("register", "fine-daily", "괜찮다 → ?", "괜찮아요", ["괜찮습니다", "괜찮아", "괜찮았어요"], "괜찮아요 convient au style poli courant demandé.", "daily-polite", "Une connaissance te demande si tout va bien.", "Conjugue au présent, dans le style poli courant en -요."),
    transform("register", "eat-daily", "먹다 → ?", "먹어요", ["먹습니다", "먹어", "먹었어요"], "먹어요 est la forme présente polie courante.", "daily-polite", "Tu parles avec un collègue pendant le déjeuner.", "Conjugue au présent, dans le style poli courant en -요."),
    transform("register", "go-daily", "가다 → ?", "가요", ["갑니다", "가", "갔어요"], "가요 est le présent poli courant ; 갑니다 appartient au style formel.", "daily-polite", "Tu réponds à une personne que tu connais peu, dans une conversation ordinaire.", "Conjugue au présent, dans le style poli courant en -요."),
    choose("register", "daily-vs-formal", "« Je suis étudiant. »", "학생이에요.", ["학생입니다.", "학생이야.", "학생이었어요."], "« 학생이에요. » emploie le style poli courant demandé ; 학생입니다 est formel.", "daily-polite", "Présentation orale quotidienne, polie mais non formelle.", "Choisis la phrase au style poli courant de la conversation."),
  ],

  "demonstratives-i-geu-jeo": [
    gap("forms", "this-bag", "__ 가방이에요.", "이", ["그", "저", "거기"], "이 désigne le sac proche du locuteur.", "near-speaker", "Le sac est dans ta main."),
    gap("forms", "that-shoes", "__ 신발이에요.", "그", ["이", "저", "거기"], "그 désigne les chaussures proches de l’interlocuteur.", "near-listener", "Les chaussures sont juste devant la vendeuse, loin de toi."),
    gap("forms", "far-building", "__ 건물이에요.", "저", ["이", "그", "저기"], "저 désigne le bâtiment éloigné des deux interlocuteurs.", "far-both", "Le bâtiment est loin de vous deux, au bout de la rue."),
    choose("forms", "this-object-pronoun", "__ 뭐예요?", "이거", ["그거", "저거", "거기"], "이거 remplace un nom pour désigner cet objet-ci, proche de toi.", "near-speaker", "Tu tiens l’objet dans ta main."),
    choose("forms", "far-object-pronoun", "__ 뭐예요?", "저거", ["이거", "그거", "저기"], "저거 désigne un objet éloigné ; 저기 désignerait un lieu.", "far-both", "L’objet est loin de vous deux, derrière la vitrine."),
  ],

  "question-mwo-nugu-myeot": [
    gap("forms", "what-object", "이거 __예요?", "뭐", ["누구", "몇", "어디"], "뭐 interroge sur l’identité d’une chose.", "what", "Tu demandes ce qu’est l’objet que l’on te montre."),
    gap("forms", "who-person", "저 사람은 __예요?", "누구", ["뭐", "몇", "어디"], "누구 interroge sur une personne.", "who", "Tu demandes qui est cette personne."),
    gap("forms", "how-many-people", "__ 명이에요?", "몇", ["뭐", "누구", "얼마"], "몇 se place devant le classificateur pour demander une quantité.", "how-many", "Au restaurant, le serveur demande la taille du groupe."),
    gap("forms", "how-many-tickets", "표 __ 장이에요?", "몇", ["뭐", "누구", "얼마"], "몇 précède 장 pour demander le nombre de billets.", "how-many", "Tu demandes le nombre de billets, pas leur prix."),
    gap("forms", "what-food", "__ 먹어요?", "뭐", ["누구", "몇", "어디"], "뭐 demande quelle chose est mangée.", "what", "Tu demandes ce que ton ami mange."),
  ],

  "topic-eun-neun": [
    gap("particles", "je-vowel", "저__ 학생이에요.", "는", ["은", "를", "가"], "La consigne demande la particule de thème : 저 finit par une voyelle et prend 는.", "no-batchim", undefined, "Choisis la particule de thème 은/는 adaptée au nom."),
    gap("particles", "today-batchim", "오늘__ 쉬어요.", "은", ["는", "을", "이"], "오늘 possède un 받침 : le thème contrastif demandé prend 은.", "batchim", "Tu opposes aujourd’hui aux autres jours.", "Marque explicitement aujourd’hui comme thème contrastif avec 은/는."),
    gap("particles", "coffee-vowel", "커피__ 안 마셔요.", "는", ["은", "를", "가"], "커피를 안 마셔요 serait une phrase correcte avec un objet neutre. Ici, la consigne demande d’opposer le café aux autres boissons : le thème contrastif est 커피는.", "no-batchim", "Tu bois d’autres boissons, mais tu veux opposer explicitement le café, que tu ne bois pas.", "Marque explicitement le café comme thème contrastif avec 은/는."),
    gap("particles", "book-batchim", "책__ 여기 있어요.", "은", ["는", "을", "이"], "책이 여기 있어요 serait correct pour focaliser le sujet. Ici, tu reprends le livre comme thème déjà évoqué : 책은.", "batchim", "Vous cherchez plusieurs objets ; tu reprends explicitement le livre déjà évoqué comme thème.", "Choisis 은/는 pour reprendre le livre comme thème, sans le focaliser comme nouvelle information."),
    gap("particles", "friend-vowel", "친구__ 한국 사람이에요.", "는", ["은", "를", "가"], "친구가 한국 사람이에요 serait correct pour focaliser le sujet. Ici, 친구 est le thème déjà établi et prend 는.", "no-batchim", "Ton ami est déjà le sujet de la conversation ; tu ajoutes qu’il est coréen.", "Choisis la particule de thème 은/는 adaptée au nom déjà établi."),
  ],

  "subject-i-ga": [
    gap("particles", "rain-vowel", "비__ 와요.", "가", ["이", "는", "를"], "비는 와요 serait grammatical avec une nuance de thème ou de contraste. Ici, la consigne demande le sujet neutre : 비 finit par une voyelle et prend 가.", "no-batchim", "Tu annonces simplement qu’il pleut, sans contraste avec une autre information.", "Choisis la particule de sujet 이/가, sans transformer le sujet en thème contrastif."),
    gap("particles", "time-batchim", "시간__ 없어요.", "이", ["가", "은", "을"], "시간은 없어요 serait grammatical avec une nuance de thème ou de contraste. Ici, 시간 est le sujet neutre de 없어요 et prend 이.", "batchim", "Tu réponds simplement que tu n’as pas de temps, sans opposer le temps à autre chose.", "Choisis la particule de sujet 이/가, sans ajouter de contraste."),
    gap("particles", "bus-vowel", "버스__ 와요.", "가", ["이", "는", "를"], "버스는 와요 serait grammatical dans un contraste. Ici, tu annonces l’arrivée du bus comme information nouvelle : 버스가 와요.", "no-batchim", "Quelqu’un demande ce qui arrive ; tu réponds simplement que c’est le bus.", "Choisis la particule de sujet 이/가 qui focalise la nouvelle information."),
    gap("particles", "book-batchim", "책__ 있어요.", "이", ["가", "은", "을"], "책은 있어요 serait grammatical avec une nuance contrastive. Ici, tu signales simplement l’existence d’un livre : 책이 있어요.", "batchim", "On demande ce qui est disponible ; tu annonces un livre comme nouvelle information.", "Choisis la particule de sujet 이/가 qui présente la nouvelle information."),
    gap("particles", "friend-vowel", "친구__ 한국어를 공부해요.", "가", ["이", "는", "를"], "친구는 한국어를 공부해요 serait grammatical si l’ami était déjà le thème ou mis en contraste. Ici, il répond à « qui ? » et prend 가.", "no-batchim", "Tu réponds à la question « Qui étudie le coréen ? », sans opposer cette personne à une autre.", "Choisis la particule de sujet 이/가 qui répond directement à « qui ? »."),
  ],

  "existence-isseoyo-eopseoyo": [
    choose("forms", "menu-available", "채식 메뉴가 __?", "있어요", ["없어요", "아니에요", "해요"], "있어요 demande si le menu existe ou est disponible.", "existence", "Tu vérifies si le restaurant propose un menu végétarien."),
    choose("forms", "menu-unavailable", "채식 메뉴가 __.", "없어요", ["있어요", "아니에요", "안 해요"], "없어요 exprime l’absence de menu végétarien.", "absence", "Le serveur explique que le restaurant ne propose aucun menu végétarien."),
    choose("forms", "time-have", "시간이 __.", "있어요", ["없어요", "아니에요", "해요"], "시간이 있어요 signifie que du temps est disponible.", "existence", "Tu confirmes que tu as le temps de venir."),
    choose("forms", "time-none", "시간이 __.", "없어요", ["있어요", "아니에요", "안 해요"], "시간이 없어요 exprime l’absence de temps disponible.", "absence", "Une réunion t’empêche de venir : tu n’as pas le temps."),
    choose("forms", "identity-vs-existence", "이건 커피__.", "가 아니에요", ["가 없어요", "가 있어요", "를 안 해요"], "가 아니에요 nie l’identité de la boisson ; 가 없어요 nierait son existence.", "identity-vs-existence", "La boisson est bien présente, mais ce n’est pas du café."),
  ],

  "location-e": [
    gap("particles", "cafe-existence", "친구가 카페__ 있어요.", "에", ["에서", "로", "를"], "Avec 있어요, 에 indique l’endroit où se trouve l’ami.", "location"),
    gap("particles", "school-existence", "선생님이 학교__ 있어요.", "에", ["에서", "로", "가"], "Une présence statique à l’école se marque avec 에.", "location"),
    gap("particles", "bag-existence", "카드가 가방__ 있어요.", "에", ["에서", "로", "를"], "La carte se trouve dans le sac : 가방에 있어요.", "location"),
    gap("particles", "floor-existence", "화장실은 2층__ 있어요.", "에", ["에서", "으로", "을"], "Avec 있어요, le lieu statique 2층 prend 에.", "location"),
    gap("particles", "home-existence", "민수는 집__ 있어요.", "에", ["에서", "으로", "를"], "집에 있어요 localise Minsu sans décrire une action sur place.", "location"),
  ],

  "object-eul-reul": [
    gap("particles", "book-batchim", "책__ 읽어요.", "을", ["를", "은", "이"], "책은 읽어요 serait grammatical avec une nuance de thème ou de contraste. Ici, la consigne demande l’objet direct neutre : 책 prend 을.", "batchim", "Tu réponds simplement à « Que lis-tu ? », sans contraste.", "Choisis la particule d’objet 을/를, sans transformer l’objet en thème."),
    gap("particles", "coffee-vowel", "커피__ 마셔요.", "를", ["을", "는", "가"], "커피는 마셔요 serait grammatical avec une nuance contrastive. Ici, la consigne demande l’objet direct neutre : 커피 prend 를.", "no-batchim", "Tu réponds simplement à « Que bois-tu ? », sans opposer le café à une autre boisson.", "Choisis la particule d’objet 을/를, sans ajouter de contraste."),
    gap("particles", "meal-batchim", "밥__ 먹어요.", "을", ["를", "은", "이"], "밥은 먹어요 serait grammatical avec une nuance contrastive. Ici, 밥 est l’objet direct neutre et prend 을.", "batchim", "Tu indiques simplement ce que tu manges, sans mise en contraste.", "Choisis la particule d’objet 을/를 adaptée au nom."),
    gap("particles", "korean-vowel", "한국어__ 공부해요.", "를", ["을", "는", "가"], "한국어는 공부해요 serait grammatical si le coréen était mis en contraste. Ici, 한국어 est l’objet direct neutre et prend 를.", "no-batchim", "Tu réponds simplement à « Qu’étudies-tu ? », sans comparer plusieurs matières.", "Choisis la particule d’objet 을/를, sans transformer l’objet en thème."),
    gap("particles", "film-vowel", "영화__ 봐요.", "를", ["을", "는", "가"], "영화는 봐요 serait grammatical avec une nuance contrastive. Ici, 영화 est l’objet direct neutre et prend 를.", "no-batchim", "Tu réponds simplement à « Que regardes-tu ? », sans contraste.", "Choisis la particule d’objet 을/를, sans ajouter de contraste."),
  ],

  "action-location-eseo": [
    gap("particles", "cafe-action", "카페__ 공부해요.", "에서", ["에", "으로", "까지"], "공부해요 est une action réalisée au café : le lieu prend 에서.", "action-location"),
    gap("particles", "school-action", "학교__ 한국어를 배워요.", "에서", ["에", "로", "부터"], "배워요 se déroule à l’école : le lieu de l’action prend 에서.", "action-location"),
    gap("particles", "home-action", "집__ 밥을 먹어요.", "에서", ["에", "으로", "까지"], "먹어요 est une action faite à la maison : 집에서.", "action-location"),
    gap("particles", "library-action", "도서관__ 책을 읽어요.", "에서", ["에", "으로", "까지"], "읽어요 se déroule à la bibliothèque : 도서관에서.", "action-location"),
    gap("particles", "restaurant-action", "식당__ 친구를 만나요.", "에서", ["에", "으로", "까지"], "Le restaurant est le lieu où la rencontre a lieu : 식당에서.", "action-location"),
  ],

  "destination-time-e": [
    gap("particles", "seoul-destination", "서울__ 가요.", "에", ["에서", "을", "부터"], "서울에서 가요 serait grammatical si Séoul était le point de départ. Ici, Séoul est explicitement la destination : 서울에 가요.", "destination", "Tu vas à Séoul ; ton point de départ n’est pas indiqué.", "Complète avec la particule qui marque le point d’arrivée, et non l’origine."),
    gap("particles", "school-destination", "학교__ 와요.", "에", ["에서", "를", "까지"], "학교에서 와요 serait grammatical pour dire que l’on vient de l’école. Ici, l’école est le point d’arrivée : 학교에 와요.", "destination", "Tu viens à l’école ; tu ne dis pas que tu en reviens.", "Complète avec la particule qui marque la destination, et non l’origine."),
    gap("particles", "two-time", "두 시__ 친구를 만나요.", "에", ["에서", "부터", "를"], "Un moment précis comme 두 시 prend 에.", "time", "La rencontre est fixée précisément à deux heures, sans notion de début de plage."),
    gap("particles", "monday-time", "월요일__ 출발해요.", "에", ["에서", "부터", "를"], "Le jour précis de départ se marque avec 에.", "time", "Le départ est fixé lundi ; tu ne décris pas une période commençant lundi."),
    gap("particles", "morning-time", "아침 여덟 시__ 일어나요.", "에", ["에서", "까지", "를"], "L’heure précise 여덟 시 prend 에.", "time", "Tu donnes l’heure exacte à laquelle tu te lèves."),
  ],

  "present-a-eoyo": [
    transform("conjugation", "eat-present", "먹다 → ?", "먹어요", ["먹아요", "먹었어요", "먹을 거예요"], "먹다 prend -어요 au présent poli courant : 먹어요. 먹었어요 et 먹을 거예요 sont corrects à d’autres temps.", "present-eoyo", undefined, "Conjugue au présent, dans le style poli courant en -요."),
    transform("conjugation", "go-present", "가다 → ?", "가요", ["가어요", "갔어요", "갈 거예요"], "가다 se contracte en 가요 au présent poli courant. 갔어요 et 갈 거예요 situeraient l’action à d’autres temps.", "present-ayo", undefined, "Conjugue au présent, dans le style poli courant en -요."),
    transform("conjugation", "drink-present", "마시다 → ?", "마셔요", ["마시요", "마셨어요", "마실 거예요"], "마시다 devient 마셔요 au présent poli courant. Les autres formes correctes proposées renverraient au passé ou au futur.", "present-eoyo", undefined, "Conjugue au présent, dans le style poli courant en -요."),
    transform("conjugation", "study-present", "공부하다 → ?", "공부해요", ["공부하요", "공부했어요", "공부할 거예요"], "하다 devient 해요 au présent : 공부해요. 공부했어요 et 공부할 거예요 correspondent à d’autres temps.", "present-haeyo", undefined, "Conjugue au présent, dans le style poli courant en -요."),
    transform("conjugation", "read-present", "읽다 → ?", "읽어요", ["읽아요", "읽었어요", "읽을 거예요"], "읽다 prend -어요 au présent : 읽어요. 읽었어요 et 읽을 거예요 sont corrects, mais à d’autres temps.", "present-eoyo", undefined, "Conjugue au présent, dans le style poli courant en -요."),
  ],

  "possession-ui-je-nae": [
    gap("register", "my-ticket-employee", "이건 __ 표예요.", "제", ["내", "저", "제가"], "Face à un contrôleur, la forme humble et polie de « mon » est 제.", "polite-my", "Tu montres ton billet à un contrôleur."),
    gap("register", "my-name-professor", "__ 이름은 마크예요.", "제", ["내", "저", "제가"], "Face à un professeur, 제 convient au registre poli.", "polite-my", "Tu te présentes à un professeur."),
    gap("register", "my-passport-agent", "__ 여권이에요.", "제", ["내", "저", "제가"], "Face à l’agent, 제 est la forme polie de « mon ».", "polite-my", "À l’aéroport, tu réponds à un agent de contrôle."),
    gap("register", "my-bag-close-friend", "이건 __ 가방이야.", "내", ["제", "나", "제가"], "La phrase est familière en -이야 entre proches : 내 est cohérent avec ce registre.", "casual-my", "Tu parles familièrement à un ami proche."),
    gap("forms", "friends-bag", "친구__ 가방이에요.", "의", ["제", "내", "가"], "의 relie 친구 au nom possédé 가방 : « le sac de l’ami ».", "possession-ui"),
  ],

  "interrogatives-basic": [
    gap("forms", "where-toilet", "화장실이 __예요?", "어디", ["언제", "왜", "어떻게"], "어디 demande un lieu.", "where", "Tu demandes où se trouvent les toilettes."),
    gap("forms", "when-train", "기차가 __ 와요?", "언제", ["어디", "왜", "어떻게"], "언제 demande le moment de l’arrivée.", "when", "Tu demandes à quel moment le train arrive."),
    gap("forms", "why-taxi", "__ 택시를 타요?", "왜", ["어디", "언제", "어떻게"], "왜 demande la raison de prendre le taxi.", "why", "Tu demandes la raison pour laquelle ton ami prend un taxi."),
    gap("forms", "how-go", "서울에 __ 가요?", "어떻게", ["어디", "언제", "왜"], "어떻게 demande la manière ou le moyen d’aller à Séoul.", "how", "Tu demandes par quel moyen ton ami va à Séoul."),
    gap("forms", "how-much-item", "이거 __예요?", "얼마", ["어디", "언제", "무슨"], "얼마 demande le prix de l’article.", "how-much", "Dans un magasin, tu demandes le prix de cet article."),
  ],

  "negation-an": [
    choose("modality", "not-go-choice", "오늘은 __.", "안 가요", ["못 가요", "가지 않아요", "아니에요"], "La consigne demande la négation courte d’un choix : 안 가요.", "short-negation", "Tu pourrais sortir, mais tu choisis de ne pas y aller aujourd’hui.", "Utilise précisément la négation courte 안 + verbe."),
    choose("modality", "not-drink-choice", "커피를 __.", "안 마셔요", ["못 마셔요", "마시지 않아요", "아니에요"], "La forme courte volontaire est 안 마셔요.", "short-negation", "Tu peux boire du café, mais tu as choisi de ne pas en boire.", "Utilise précisément la négation courte 안 + verbe."),
    choose("modality", "not-spicy-short", "이 음식은 __.", "안 매워요", ["못 매워요", "맵지 않아요", "아니에요"], "La négation courte place 안 devant l’adjectif : 안 매워요.", "short-negation", "Décris le plat avec la forme négative courte étudiée.", "Utilise précisément la négation courte 안 + adjectif."),
    choose("modality", "not-buy-choice", "오늘은 빵을 __.", "안 사요", ["못 사요", "사지 않아요", "아니에요"], "Le refus volontaire en négation courte se dit 안 사요.", "short-negation", "Tu as assez d’argent, mais tu décides de ne pas acheter de pain.", "Utilise précisément la négation courte 안 + verbe."),
    choose("modality", "not-study-choice", "오늘은 한국어를 __.", "안 공부해요", ["못 공부해요", "공부하지 않아요", "아니에요"], "La consigne cible la forme courte : 안 공부해요.", "short-negation", "Tu as le temps, mais tu choisis de ne pas étudier aujourd’hui.", "Utilise précisément la négation courte 안 + verbe."),
  ],

  "copula-negation-anieyo": [
    gap("forms", "not-student", "학생__.", "이 아니에요", ["가 아니에요", "안 이에요", "이 없어요"], "학생 possède un 받침 : la négation de la copule se construit avec 이 아니에요.", "batchim", undefined, "Complète l’identification négative avec la forme de 아니에요 correcte."),
    gap("forms", "not-doctor", "의사__.", "가 아니에요", ["이 아니에요", "안 예요", "가 없어요"], "의사 finit par une voyelle et prend 가 devant 아니에요 : 의사가 아니에요.", "no-batchim", undefined, "Complète l’identification négative avec la forme de 아니에요 correcte."),
    gap("forms", "not-coffee", "커피__.", "가 아니에요", ["이 아니에요", "안 이에요", "가 없어요"], "커피 finit par une voyelle : 커피가 아니에요.", "no-batchim", undefined, "Complète l’identification négative avec la forme de 아니에요 correcte."),
    gap("forms", "not-book", "책__.", "이 아니에요", ["가 아니에요", "안 예요", "이 없어요"], "책 possède un 받침 : 책이 아니에요.", "batchim", undefined, "Complète l’identification négative avec la forme de 아니에요 correcte."),
    choose("forms", "absence-vs-identity", "« Ce n’est pas mon sac. »", "제 가방이 아니에요.", ["제 가방이 없어요.", "제 가방을 안 해요.", "제 가방이 못 해요."], "제 가방이 아니에요. nie l’identité ; 없어요 exprimerait l’absence du sac.", "copula-negation"),
  ],

  "request-n-juseyo": [
    gap("modality", "water-item", "물 __.", "주세요", ["마셔 주세요", "마시세요", "있어요"], "Nom + 주세요 demande l’objet lui-même : de l’eau.", "item-request", "Au restaurant, tu demandes simplement de l’eau."),
    gap("modality", "receipt-item", "영수증 __.", "주세요", ["보여 주세요", "보세요", "있어요"], "영수증 주세요 demande que l’on te donne le reçu.", "item-request", "Après avoir payé, tu demandes le reçu au vendeur."),
    gap("modality", "coffee-item", "아이스 아메리카노 __.", "주세요", ["마셔 주세요", "마시세요", "있어요"], "Le nom de la boisson suivi de 주세요 forme la commande.", "item-request", "Au café, tu commandes un americano glacé."),
    gap("modality", "ticket-item", "표 두 장 __.", "주세요", ["보여 주세요", "보세요", "있어요"], "표 두 장 주세요 demande deux billets comme objets.", "item-request", "Au guichet, tu demandes deux billets."),
    choose("modality", "object-vs-action", "문을 __.", "열어 주세요", ["주세요", "여세요", "있어요"], "Comme 문을 est l’objet d’un verbe, il faut demander l’action avec 열어 주세요.", "item-vs-action", "Tu ne demandes pas la porte elle-même : tu demandes à l’employé de l’ouvrir.", "Choisis la demande adaptée : objet ou action."),
  ],

  "request-v-a-eo-juseyo": [
    transform("modality", "speak-request", "말하다 → ?", "말해 주세요", ["말하세요", "말해요", "말할까요"], "말해 주세요 formule une demande adressée à l’interlocuteur.", "action-request", "Ton interlocuteur parle trop vite ; tu lui demandes de parler lentement.", "Forme une demande d’action polie avec -아/어 주세요."),
    transform("modality", "show-request", "보여 주다 → ?", "보여 주세요", ["보이세요", "보여요", "보일까요"], "보여 주세요 demande à l’employé de montrer quelque chose.", "action-request", "Tu demandes à un employé de te montrer le menu.", "Forme une demande d’action polie avec -아/어 주세요."),
    transform("modality", "wait-request", "기다리다 → ?", "기다려 주세요", ["기다리세요", "기다려요", "기다릴까요"], "기다려 주세요 exprime explicitement une demande de patienter.", "action-request", "Tu demandes à un client de patienter un instant.", "Forme une demande d’action polie avec -아/어 주세요."),
    transform("modality", "open-request", "열다 → ?", "열어 주세요", ["여세요", "열어요", "열까요"], "열어 주세요 demande au destinataire d’ouvrir l’objet.", "action-request", "Tu demandes à un employé d’ouvrir la porte pour toi.", "Forme une demande d’action polie avec -아/어 주세요."),
    choose("modality", "item-vs-action", "문을 __.", "열어 주세요", ["주세요", "여세요", "열고 싶어요"], "Avec un verbe, la demande d’action se forme en -아/어 주세요 : 열어 주세요.", "action-request", "Tu sollicites l’aide de l’employé : tu veux qu’il ouvre la porte.", "Choisis la demande d’action explicite, et non une simple instruction."),
  ],

  "polite-instruction-euseyo": [
    transform("modality", "sit-invitation", "앉다 → ?", "앉으세요", ["앉세요", "앉아 주세요", "앉을까요"], "Le radical 앉- se termine par une consonne et prend 으세요 : 앉으세요.", "batchim", "En tant qu’hôte, tu invites poliment ton visiteur à s’asseoir.", "Forme l’invitation ou l’instruction polie en -(으)세요."),
    transform("modality", "go-instruction", "가다 → ?", "가세요", ["가으세요", "가 주세요", "갈까요"], "Le radical 가- finit par une voyelle et prend 세요 : 가세요.", "no-batchim", "Tu indiques poliment au visiteur d’aller de ce côté.", "Forme l’instruction polie en -(으)세요."),
    transform("modality", "read-instruction", "읽다 → ?", "읽으세요", ["읽세요", "읽어 주세요", "읽을까요"], "Le radical 읽- possède un 받침 et prend 으세요 : 읽으세요.", "batchim", "Le professeur donne à la classe la consigne de lire le texte.", "Forme l’instruction polie en -(으)세요."),
    transform("modality", "come-invitation", "오다 → ?", "오세요", ["오으세요", "와 주세요", "올까요"], "Le radical 오- finit par une voyelle et prend 세요 : 오세요.", "no-batchim", "À l’accueil, tu invites poliment le visiteur à venir par ici.", "Forme l’invitation polie en -(으)세요."),
    choose("modality", "instruction-vs-request", "책을 __.", "펴세요", ["펴 주세요", "펴요", "펼까요"], "Le professeur donne une consigne : 펴세요 convient ; 펴 주세요 demanderait un service.", "instruction", "Un professeur demande à toute la classe d’ouvrir le livre comme consigne.", "Choisis l’instruction polie, et non une demande de service."),
  ],

  "direction-means-ro-euro": [
    gap("particles", "bus-rieul", "버스__ 가요.", "로", ["으로", "에", "에서"], "버스 finit par une voyelle : le moyen prend 로.", "means-no-batchim"),
    gap("particles", "subway-batchim", "지하철__ 가요.", "로", ["으로", "에", "에서"], "지하철 finit par ㄹ : cette exception prend 로, et non 으로.", "means-rieul"),
    gap("particles", "car-batchim", "자동차__ 가요.", "로", ["으로", "에", "에서"], "자동차 finit par une voyelle : le moyen prend 로.", "means-no-batchim"),
    gap("particles", "right-batchim", "오른쪽__ 가세요.", "으로", ["로", "에", "에서"], "오른쪽에 가세요 peut désigner la droite comme lieu d’arrivée. Ici, tu indiques la direction du mouvement : 오른쪽 se termine par ㄱ et prend 으로.", "direction-batchim", "Tu indiques un mouvement vers la droite, sans désigner « la droite » comme un lieu d’arrivée.", "Complète avec la particule qui indique la direction du mouvement."),
    gap("particles", "card-vowel", "카드__ 계산해요.", "로", ["으로", "에", "에서"], "카드 finit par une voyelle : le moyen de paiement prend 로.", "means-no-batchim"),
  ],

  "desire-go-sipeoyo": [
    transform("modality", "eat-desire", "먹다 → ?", "먹고 싶어요", ["먹을 거예요", "먹을게요", "먹을까요"], "먹고 싶어요 exprime une envie. Les autres propositions peuvent être correctes, mais annonceraient un projet, une décision ou une suggestion.", "desire", undefined, "Exprime le souhait du locuteur avec -고 싶어요."),
    transform("modality", "go-desire", "가다 → ?", "가고 싶어요", ["갈 거예요", "갈게요", "갈까요"], "가고 싶어요 exprime une envie. 갈 거예요, 갈게요 et 갈까요 correspondent à d’autres intentions.", "desire", undefined, "Exprime le souhait du locuteur avec -고 싶어요."),
    transform("modality", "buy-desire", "사다 → ?", "사고 싶어요", ["살 거예요", "살게요", "살까요"], "사고 싶어요 exprime le souhait d’acheter ; les distracteurs indiquent plutôt un projet, une décision ou une suggestion.", "desire", undefined, "Exprime le souhait du locuteur avec -고 싶어요."),
    transform("modality", "learn-desire", "배우다 → ?", "배우고 싶어요", ["배울 거예요", "배울게요", "배울까요"], "배우고 싶어요 exprime le souhait d’apprendre ; les autres formes proposées portent une autre intention.", "desire", undefined, "Exprime le souhait du locuteur avec -고 싶어요."),
    choose("modality", "desire-vs-plan", "한국에 __.", "가고 싶어요", ["갈 거예요", "갈게요", "갈까요"], "가고 싶어요 exprime une envie ; 갈 거예요 annoncerait un projet.", "desire", "Tu exprimes une envie, sans annoncer qu’un voyage est déjà prévu."),
  ],

  "ability-eul-su-isseoyo": [
    transform("modality", "read-ability", "읽다 → ?", "읽을 수 있어요", ["읽어도 돼요", "읽고 싶어요", "못 읽어요"], "읽을 수 있어요 exprime la capacité de lire.", "ability", undefined, "Forme une phrase qui exprime une capacité."),
    transform("modality", "go-ability", "가다 → ?", "갈 수 있어요", ["가도 돼요", "가고 싶어요", "못 가요"], "Le radical 가- finit par une voyelle et prend ㄹ 수 있어요 : 갈 수 있어요.", "ability", undefined, "Forme une phrase qui exprime une possibilité réelle."),
    choose("modality", "pay-ability", "여기서 카드로 __?", "결제할 수 있어요", ["결제해도 돼요", "결제하고 싶어요", "결제해야 해요"], "결제할 수 있어요 vérifie si le paiement est possible ; la question ne demande pas une autorisation personnelle.", "ability-vs-permission", "À la caisse, tu vérifies si le terminal accepte techniquement la carte."),
    choose("modality", "charge-ability", "여기서 __?", "충전할 수 있어요", ["충전해도 돼요", "충전하고 싶어요", "충전해야 해요"], "충전할 수 있어요 porte sur la possibilité de recharger ici.", "ability-vs-permission", "Au guichet T-money, tu vérifies que le service de recharge est disponible."),
    choose("modality", "speak-ability", "한국어를 __.", "말할 수 있어요", ["말해도 돼요", "말하고 싶어요", "말해야 해요"], "말할 수 있어요 décrit une capacité linguistique. Les autres phrases seraient grammaticales, mais parleraient d’autorisation, d’envie ou d’obligation.", "ability", "Tu indiques que tu possèdes la capacité de parler coréen, sans demander une autorisation ni exprimer une envie.", "Choisis la forme qui exprime une capacité linguistique réelle."),
  ],

  "permission-a-eodo-dwaeyo": [
    transform("modality", "open-permission", "열다 → ?", "열어도 돼요?", ["열 수 있어요?", "여세요", "열어야 해요"], "열어도 돼요? demande l’autorisation d’ouvrir.", "permission", "Dans une chambre, tu demandes au responsable l’autorisation d’ouvrir la fenêtre.", "Forme une demande d’autorisation."),
    transform("modality", "sit-permission", "앉다 → ?", "앉아도 돼요?", ["앉을 수 있어요?", "앉으세요", "앉아야 해요"], "앉아도 돼요? demande si l’action est autorisée.", "permission", "Tu demandes au personnel si tu as le droit de t’asseoir ici.", "Forme une demande d’autorisation."),
    transform("modality", "photo-permission", "사진을 찍다 → ?", "사진을 찍어도 돼요?", ["사진을 찍을 수 있어요?", "사진을 찍으세요", "사진을 찍어야 해요"], "사진을 찍어도 돼요? demande l’autorisation de prendre une photo.", "permission", "Dans un musée, tu demandes à un gardien si les photos sont autorisées.", "Forme une demande d’autorisation."),
    choose("modality", "use-permission", "이 화장실을 __?", "사용해도 돼요", ["사용할 수 있어요", "사용하세요", "사용해야 해요"], "사용해도 돼요? demande l’autorisation ; 사용할 수 있어요? questionnerait plutôt une possibilité.", "permission-vs-ability", "Tu demandes à un employé si tu as le droit d’utiliser ces toilettes."),
    choose("modality", "charge-permission", "여기서 휴대폰을 __?", "충전해도 돼요", ["충전할 수 있어요", "충전하세요", "충전해야 해요"], "충전해도 돼요? demande l’accord de l’interlocuteur.", "permission-vs-ability", "Une prise appartient au café ; tu demandes au serveur l’autorisation de l’utiliser."),
  ],

  "inability-mot": [
    choose("modality", "cannot-go", "오늘은 __.", "못 가요", ["안 가요", "가지 않아요", "아니에요"], "Une contrainte empêche l’action : 못 가요, et non 안 가요.", "inability-vs-choice", "Tu veux venir, mais une urgence t’en empêche."),
    choose("modality", "cannot-drive", "오늘은 운전을 __.", "못 해요", ["안 해요", "하지 않아요", "아니에요"], "L’incapacité physique à conduire se marque avec 못 해요.", "inability-vs-choice", "Tu voudrais conduire, mais ton bras est immobilisé."),
    choose("modality", "cannot-eat", "매운 음식을 __.", "못 먹어요", ["안 먹어요", "먹지 않아요", "아니에요"], "못 먹어요 indique que tu ne supportes pas les plats épicés.", "inability-vs-choice", "Ton corps ne supporte pas les plats épicés, même si tu voudrais en manger."),
    choose("modality", "cannot-hear", "소리가 작아서 잘 __.", "못 들어요", ["안 들어요", "듣지 않아요", "아니에요"], "Le faible volume rend l’écoute impossible : 못 들어요.", "inability-vs-choice", "Le son est trop faible pour que tu puisses entendre."),
    choose("modality", "cannot-understand", "너무 빨라서 잘 __.", "못 알아들어요", ["안 알아들어요", "알아듣지 않아요", "아니에요"], "La vitesse empêche de comprendre : 못 알아들어요.", "inability-vs-choice", "La personne parle trop vite pour que tu puisses comprendre."),
  ],

  "past-ass-eosseoyo": [
    transform("conjugation", "eat-past", "먹다 → ?", "먹었어요", ["먹았어요", "먹어요", "먹을 거예요"], "먹다 prend -었어요 au passé : 먹었어요. 먹어요 et 먹을 거예요 sont corrects, mais ne situent pas l’action au passé.", "past-eosseoyo", undefined, "Conjugue au passé, dans le style poli courant en -았/었어요."),
    transform("conjugation", "go-past", "가다 → ?", "갔어요", ["가었어요", "가요", "갈 거예요"], "가다 prend -았어요 et se contracte en 갔어요. 가요 et 갈 거예요 correspondent au présent et au futur.", "past-ass-eosseoyo", undefined, "Conjugue au passé, dans le style poli courant en -았/었어요."),
    transform("conjugation", "see-past", "보다 → ?", "봤어요", ["봐요", "볼 거예요", "보았을 거예요"], "보다 se contracte en 봤어요 au passé poli courant. Les distracteurs corrects renvoient au présent ou à une projection future.", "past-ass-eosseoyo", undefined, "Conjugue au passé, dans le style poli courant en -았/었어요."),
    transform("conjugation", "study-past", "공부하다 → ?", "공부했어요", ["공부하었어요", "공부해요", "공부할 거예요"], "하다 devient 했어요 au passé : 공부했어요. 공부해요 et 공부할 거예요 ne répondent pas au temps demandé.", "past-haesseoyo", undefined, "Conjugue au passé, dans le style poli courant en -았/었어요."),
    transform("conjugation", "drink-past", "마시다 → ?", "마셨어요", ["마샀어요", "마셔요", "마실 거예요"], "마시다 devient 마셨어요 au passé poli courant. 마셔요 et 마실 거예요 sont corrects à d’autres temps.", "past-eosseoyo", undefined, "Conjugue au passé, dans le style poli courant en -았/었어요."),
  ],

  "future-eul-geoyeyo": [
    transform("conjugation", "eat-future", "먹다 → ?", "먹을 거예요", ["먹을게요", "먹었어요", "먹어요"], "Le radical 먹- possède un 받침 et prend 을 거예요 : 먹을 거예요.", "future-batchim", undefined, "Annonce un projet déjà prévu avec -(으)ㄹ 거예요."),
    transform("conjugation", "go-future", "가다 → ?", "갈 거예요", ["갈게요", "갔어요", "가요"], "Le radical 가- finit par une voyelle et prend ㄹ 거예요 : 갈 거예요.", "future-no-batchim", undefined, "Annonce un projet déjà prévu avec -(으)ㄹ 거예요."),
    transform("conjugation", "read-future", "읽다 → ?", "읽을 거예요", ["읽을게요", "읽었어요", "읽어요"], "Le radical 읽- possède un 받침 et prend 을 거예요 : 읽을 거예요.", "future-batchim", undefined, "Annonce un projet déjà prévu avec -(으)ㄹ 거예요."),
    transform("conjugation", "study-future", "공부하다 → ?", "공부할 거예요", ["공부할게요", "공부했어요", "공부해요"], "Le radical 공부하- finit par une voyelle et prend ㄹ 거예요 : 공부할 거예요.", "future-no-batchim", undefined, "Annonce un projet déjà prévu avec -(으)ㄹ 거예요."),
    choose("conjugation", "plan-vs-decision", "다음 주에 부산에 __.", "갈 거예요", ["갈게요", "갔어요", "가요"], "Un voyage prévu pour la semaine prochaine s’annonce avec 갈 거예요.", "future-vs-intention", "Le voyage est organisé depuis plusieurs semaines ; tu annonces simplement ce projet."),
  ],

  "intention-eulgeyo": [
    choose("modality", "open-decision", "제가 문을 __.", "열게요", ["열 거예요", "열까요", "열었어요"], "열게요 annonce ta décision de t’en charger en réaction à la situation.", "intention-vs-future", "Quelqu’un demande qui peut ouvrir la porte ; tu te proposes immédiatement."),
    choose("modality", "pay-decision", "제가 __.", "계산할게요", ["계산할 거예요", "계산할까요", "계산했어요"], "계산할게요 exprime une décision prise pour répondre à l’interlocuteur.", "intention-vs-future", "Un ami sort son portefeuille ; tu décides sur le moment de payer."),
    choose("modality", "call-decision", "제가 다시 __.", "전화할게요", ["전화할 거예요", "전화할까요", "전화했어요"], "전화할게요 promet au destinataire que tu rappelleras.", "intention-vs-future", "La ligne coupe ; tu promets immédiatement de rappeler."),
    choose("modality", "do-decision", "제가 __.", "할게요", ["할 거예요", "할까요", "했어요"], "할게요 signifie « je m’en charge » dans cette réaction.", "intention-vs-future", "On demande un volontaire ; tu prends la décision de t’en charger."),
    choose("modality", "wait-promise", "여기에서 __.", "기다릴게요", ["기다릴 거예요", "기다릴까요", "기다렸어요"], "기다릴게요 formule une décision ou une promesse adressée à l’autre personne.", "intention-vs-future", "Ton ami te demande de l’attendre ici ; tu acceptes."),
  ],

  "alternative-ina-animyeon": [
    gap("forms", "coffee-vowel", "커피__ 차 있어요?", "나", ["이나", "하고", "도"], "커피하고 차 있어요? serait correct pour demander si les deux sont disponibles. Ici, tu proposes un choix : après une voyelle, (이)나 devient 나.", "no-batchim", "Une seule des deux boissons suffit : tu demandes s’il y a du café ou du thé.", "Relie les deux noms pour exprimer une alternative (« ou »), et non une addition."),
    gap("forms", "bread-batchim", "빵__ 케이크 주세요.", "이나", ["나", "하고", "도"], "빵하고 케이크 주세요 serait correct pour commander les deux. Ici, tu laisses le choix entre eux : après un 받침, (이)나 devient 이나.", "batchim", "Tu acceptes l’un ou l’autre produit, mais tu ne commandes pas les deux.", "Relie les deux noms pour exprimer une alternative (« ou »), et non une addition."),
    gap("forms", "bus-vowel", "버스__ 지하철로 가요.", "나", ["이나", "하고", "만"], "버스하고 지하철로 가요 pourrait coordonner deux moyens utilisés. Ici, un seul moyen au choix suffit : 버스나 지하철로 가요.", "no-batchim", "Tu envisages soit le bus, soit le métro ; tu n’utiliseras pas les deux successivement.", "Relie les deux moyens pour exprimer une alternative (« ou »)."),
    gap("forms", "water-batchim", "물__ 차를 마셔요.", "이나", ["나", "하고", "만"], "물하고 차를 마셔요 serait correct si tu buvais les deux. Ici, tu choisis l’une des deux boissons : 물이나 차를 마셔요.", "batchim", "Tu boiras soit de l’eau, soit du thé, mais pas les deux.", "Relie les deux boissons pour exprimer une alternative (« ou »)."),
    choose("connectors", "clause-alternative", "지금 가요? __ 집에 있어요?", "아니면", ["이나", "하고", "지만"], "아니면 relie ici deux propositions complètes, et non deux noms.", "clause-alternative"),
  ],

  "noun-link-hago-irang": [
    gap("forms", "coffee-and-cake", "커피__ 케이크 주세요.", "하고", ["이나", "도", "만"], "커피나 케이크 주세요 serait grammatical pour demander l’un ou l’autre. Ici, tu commandes les deux ensemble : 하고 signifie « et ».", "coordination-hago", "Tu commandes à la fois le café et le gâteau, sans laisser de choix entre les deux.", "Relie les deux produits par la conjonction additive « et »."),
    gap("forms", "bread-with-milk", "빵__ 우유 주세요.", "하고", ["이나", "도", "만"], "빵이나 우유 주세요 serait grammatical pour demander l’un des deux. Ici, tu veux les deux produits : 하고 signifie « et ».", "coordination-hago", "Tu commandes le pain et le lait ensemble, pas l’un ou l’autre.", "Relie les deux produits par la conjonction additive « et »."),
    gap("forms", "friend-with", "친구__ 가요.", "랑", ["이랑", "이나", "만"], "친구 finit par une voyelle : (이)랑 prend la variante 랑.", "no-batchim", undefined, "Utilise précisément la variante correcte de (이)랑."),
    gap("forms", "student-with", "학생__ 가요.", "이랑", ["랑", "이나", "만"], "학생 possède un 받침 : (이)랑 prend la variante 이랑.", "batchim", undefined, "Utilise précisément la variante correcte de (이)랑."),
    gap("forms", "rice-with-soup", "밥__ 국을 먹어요.", "이랑", ["랑", "이나", "만"], "밥 possède un 받침 : 밥이랑 relie les deux aliments.", "batchim", undefined, "Utilise précisément la variante correcte de (이)랑."),
  ],

  "native-numbers": [
    gap("forms", "one-cup", "커피 __ 잔 주세요.", "한", ["하나", "일", "첫"], "한 잔 exprime la quantité d’une tasse. 첫 잔 serait grammatical pour parler de la première tasse d’une série, nuance exclue ici.", "attributive-native-number", "Tu commandes exactement une tasse de café ; tu ne parles pas de la première tasse d’une série.", "Exprime la quantité « une tasse » avec le nombre coréen placé devant le classificateur."),
    gap("forms", "two-people", "__ 명이에요.", "두", ["둘", "이", "둘째"], "Devant 명, 둘 devient 두.", "attributive-native-number"),
    gap("forms", "three-apples", "사과 __ 개 주세요.", "세", ["셋", "삼", "셋째"], "Devant 개, 셋 devient 세.", "attributive-native-number"),
    gap("forms", "four-tickets", "표 __ 장 주세요.", "네", ["넷", "사", "넷째"], "Devant 장, 넷 devient 네.", "attributive-native-number"),
    choose("forms", "standalone-three", "Compte sans classificateur : 하나, 둘, __.", "셋", ["세", "삼", "세 번째"], "Dans une suite de comptage sans classificateur, la forme autonome est 셋.", "standalone-native-number"),
  ],

  "classifiers-basic": [
    gap("forms", "coffee-cup", "커피 한 __ 주세요.", "잔", ["개", "명", "장"], "커피 한 개 est courant pour compter un produit de façon générique. Ici, tu comptes précisément le récipient de boisson : 한 잔.", "drink-classifier", "Le café est servi dans une tasse et tu veux compter cette tasse, pas une unité de produit générique.", "Choisis le classificateur propre aux boissons servies en tasse ou en verre."),
    gap("forms", "people-count", "두 __이에요.", "명", ["개", "잔", "장"], "두 개예요, 두 잔이에요 et 두 장이에요 seraient grammaticales pour d’autres éléments omis. Ici, le serveur compte des personnes : 두 명이에요.", "people-classifier", "Au restaurant, le serveur demande combien de personnes composent ton groupe.", "Choisis le classificateur courant des personnes."),
    gap("forms", "ticket-count", "표 두 __ 주세요.", "장", ["개", "명", "잔"], "표 두 개 peut s’entendre avec le compteur générique. Ici, la consigne demande le classificateur précis des objets plats : 표 두 장.", "flat-classifier", "Tu comptes les billets comme des objets plats, et non comme de simples unités génériques.", "Choisis le classificateur spécifique aux billets et autres objets plats."),
    gap("forms", "apple-count", "사과 세 __ 주세요.", "개", ["명", "잔", "장"], "개 est le classificateur générique adapté aux pommes.", "generic-classifier"),
    gap("forms", "portion-count", "삼겹살 2__ 주세요.", "인분", ["개", "잔", "장"], "삼겹살 2개 pourrait compter deux articles ou paquets. Ici, tu commandes de quoi servir deux personnes : 2인분.", "portion-classifier", "Au restaurant, tu commandes une quantité de samgyeopsal prévue pour deux personnes, pas deux articles ou paquets.", "Choisis le classificateur des portions prévues pour un nombre de personnes."),
  ],

  "sino-korean-numbers": [
    choose("forms", "price-five-thousand", "5 000원 → ?", "오천 원", ["오백 원", "오만 원", "다섯 천 원"], "5 000 se construit 오 + 천 : 오천 원.", "price"),
    choose("forms", "price-ten-thousand", "10 000원 → ?", "만 원", ["천 원", "십만 원", "열 천 원"], "10 000 se dit 만 en sino-coréen : 만 원.", "price"),
    choose("forms", "line-two", "Ligne 2 → ?", "2호선", ["두 호선", "이 개", "2명"], "Les numéros de ligne emploient les nombres sino-coréens : 2호선.", "line-number"),
    choose("forms", "month-march", "Mars → ?", "3월", ["세 월", "삼 개월", "3일"], "Les mois utilisent le numéro sino-coréen suivi de 월 : 3월.", "date"),
    choose("forms", "phone-zero-one-zero", "010 → ?", "공일공", ["영십영", "하나열하나", "공하나공"], "Dans un numéro de téléphone, les chiffres se lisent séparément : 공일공.", "phone-number"),
  ],

  "range-buteo-kkaji": [
    gap("particles", "hours-range-start", "아홉 시__ 다섯 시까지 일해요.", "부터", ["에", "으로", "동안"], "아홉 시에서 다섯 시까지 est aussi attesté pour une plage. Ici, 부터 marque explicitement le point de départ de l’horaire.", "range-start", "Tu donnes un horaire continu de 9 h à 17 h et dois marquer explicitement sa borne de départ.", "Complète la borne de départ de cette plage continue."),
    gap("particles", "hours-range-end", "아홉 시부터 다섯 시__ 일해요.", "까지", ["에", "에서", "동안"], "에 marquerait 17 h comme un moment ponctuel. Pour fermer la plage continue commencée avec 부터, la borne finale prend 까지.", "range-end", "Tu donnes un horaire continu de 9 h à 17 h et dois en marquer la borne finale.", "Complète la borne finale de la plage avec 까지."),
    gap("particles", "days-range-start", "월요일__ 금요일까지 일해요.", "부터", ["에", "으로", "동안"], "월요일에서 금요일까지 peut aussi décrire une plage. Ici, 부터 marque explicitement le début de la période.", "range-start", "Tu indiques une période continue du lundi au vendredi et dois marquer explicitement son début.", "Complète la borne de départ de cette période continue."),
    gap("particles", "days-range-end", "월요일부터 금요일__ 일해요.", "까지", ["에", "에서", "동안"], "에 ferait de vendredi un jour ponctuel. Ici, 금요일 ferme la période continue ouverte par 부터 et prend 까지.", "range-end", "Tu indiques une période continue du lundi au vendredi et dois en marquer la fin.", "Complète la borne finale de la période avec 까지."),
    gap("particles", "destination-limit", "서울역__ 가요.", "까지", ["부터", "에서", "동안"], "Employé seul, 까지 signifie « jusqu’à » la gare de Séoul.", "limit-only", "La gare de Séoul est la limite finale du trajet : tu vas jusque-là."),
  ],

  "additive-do": [
    gap("particles", "water-too", "물__ 주세요.", "도", ["만", "하고", "나"], "도 ajoute l’eau à une commande déjà commencée.", "additive", "Tu as déjà commandé un plat et tu ajoutes de l’eau."),
    gap("particles", "me-too", "저__ 가요.", "도", ["만", "는", "를"], "저는 가요 serait grammatical et pourrait opposer le locuteur à quelqu’un. Ici, tu dois encoder explicitement « moi aussi » avec la particule additive : 저도.", "additive", "Un ami a annoncé qu’il part ; tu veux ajouter explicitement que toi aussi, tu pars.", "Exprime explicitement l’addition « moi aussi » avec la particule dédiée."),
    gap("particles", "kimchi-too", "김치__ 주세요.", "도", ["만", "하고", "나"], "김치도 ajoute le kimchi à ce qui a déjà été demandé.", "additive", "Après une première commande, tu ajoutes du kimchi."),
    gap("particles", "coffee-too", "커피__ 마셔요.", "도", ["만", "는", "를"], "커피는 마셔요 et 커피를 마셔요 seraient grammaticales avec d’autres focalisations. Ici, tu dois encoder explicitement « aussi » avec 도 : 커피도 마셔요.", "additive", "Tu bois déjà du thé et tu veux ajouter explicitement que tu bois aussi du café.", "Exprime explicitement l’addition « aussi du café » avec la particule dédiée."),
    choose("particles", "too-vs-only", "빵__ 주세요.", "도", ["만", "하고", "나"], "도 signifie « aussi » ; 만 limiterait la commande au pain.", "additive-vs-restrictive", "Tu as commandé du lait et tu ajoutes du pain."),
  ],

  "restrictive-man": [
    gap("particles", "water-only", "물__ 마셔요.", "만", ["도", "하고", "나"], "만 limite les boissons à l’eau seulement.", "restrictive", "On te propose plusieurs boissons, mais tu ne bois que de l’eau."),
    gap("particles", "one-only", "한 잔__ 주세요.", "만", ["도", "하고", "나"], "만 limite la quantité à un seul verre.", "restrictive", "Le serveur en propose davantage, mais tu n’en veux qu’un."),
    gap("particles", "card-only", "카드__ 있어요.", "만", ["도", "하고", "나"], "카드만 signifie que tu n’as rien d’autre que la carte.", "restrictive", "Tu n’as ni espèces ni autre moyen de paiement."),
    gap("particles", "today-only", "오늘__ 쉬어요.", "만", ["도", "은", "부터"], "오늘은 쉬어요 serait grammatical et créerait un contraste avec les autres jours. Ici, tu dois encoder explicitement « seulement aujourd’hui » avec 만 : 오늘만 쉬어요.", "restrictive", "Tu travailles les autres jours et veux dire explicitement que ton repos se limite à aujourd’hui.", "Exprime explicitement la restriction « seulement aujourd’hui » avec la particule dédiée."),
    choose("particles", "only-vs-too", "빵__ 주세요.", "만", ["도", "하고", "나"], "만 signifie « seulement » ; 도 ajouterait le pain à autre chose.", "restrictive-vs-additive", "Tu refuses les autres produits et demandes uniquement du pain."),
  ],

  "sequence-go": [
    gap("connectors", "eat-drink", "밥을 먹__ 커피를 마셔요.", "고", ["어서", "지만", "으면"], "-고 relie les deux actions sans exprimer une cause ni une condition.", "sequence", "Tu énumères simplement deux actions de ton repas : manger, puis boire un café."),
    gap("connectors", "subway-transfer", "지하철을 타__ 갈아타요.", "고", ["니까", "지만", "면"], "타고 relie l’action de prendre le métro à celle de changer de ligne.", "sequence", "Tu décris deux étapes successives du trajet, sans exprimer de cause."),
    gap("connectors", "study-sleep", "공부하__ 자요.", "고", ["니까", "지만", "면"], "공부하고 자요 enchaîne simplement deux actions.", "sequence", "Tu énumères ton programme : étudier, puis dormir."),
    gap("connectors", "buy-return", "빵을 사__ 집에 가요.", "고", ["니까", "지만", "면"], "사고 relie l’achat et le retour ; la phrase ne donne pas une cause.", "sequence", "Tu racontes deux étapes : acheter du pain, puis rentrer."),
    choose("connectors", "sequence-vs-reason", "비빔밥을 __ 카페에 가요.", "먹고", ["먹어서", "먹지만", "먹으면"], "먹고 présente l’action puis la suivante ; 먹어서 exprimerait un lien causal.", "sequence-vs-reason", "Tu énumères simplement deux étapes de ton programme."),
  ],

  "reason-a-eoseo": [
    choose("connectors", "rain-reason", "비가 __ 택시를 타요.", "와서", ["오고", "오지만", "오면"], "와서 relie la pluie à sa conséquence : prendre un taxi.", "reason", "Tu donnes la pluie comme raison de prendre un taxi."),
    choose("connectors", "sick-reason", "__ 못 가요.", "아파서", ["아프고", "아프지만", "아프면"], "아파서 donne la maladie comme cause de l’impossibilité d’y aller.", "reason", "Tu expliques que la maladie est la cause de ton absence."),
    choose("connectors", "late-reason", "__ 죄송해요.", "늦어서", ["늦고", "늦지만", "늦으면"], "늦어서 introduit la raison des excuses.", "reason", "Tu t’excuses parce que tu es en retard."),
    choose("connectors", "expensive-reason", "너무 __ 안 사요.", "비싸서", ["비싸고", "비싸지만", "비싸면"], "비싸서 présente le prix comme cause du non-achat.", "reason", "Le prix trop élevé est la raison pour laquelle tu n’achètes pas."),
    choose("connectors", "tired-reason", "__ 집에 있어요.", "피곤해서", ["피곤하고", "피곤하지만", "피곤하면"], "피곤해서 explique pourquoi tu restes à la maison.", "reason", "Tu restes chez toi parce que tu es fatigué."),
  ],

  "contrast-jiman": [
    choose("connectors", "small-comfortable", "__ 편해요.", "작지만", ["작고", "작아서", "작으면"], "작지만 oppose la petite taille au confort.", "contrast", "La chambre est petite, mais malgré cela elle est confortable."),
    choose("connectors", "spicy-delicious", "__ 맛있어요.", "맵지만", ["맵고", "매워서", "매우면"], "맵지만 maintient deux informations opposées : épicé, mais délicieux.", "contrast", "Le plat est épicé, mais tout de même délicieux."),
    choose("connectors", "expensive-good", "__ 좋아요.", "비싸지만", ["비싸고", "비싸서", "비싸면"], "비싸지만 oppose le prix élevé à l’appréciation positive.", "contrast", "L’article est cher, mais il te plaît malgré son prix."),
    choose("connectors", "far-go", "__ 자주 가요.", "멀지만", ["멀고", "멀어서", "멀면"], "멀지만 marque le contraste entre la distance et la fréquence.", "contrast", "Le lieu est loin, mais tu y vas pourtant souvent."),
    choose("connectors", "busy-meet", "__ 친구를 만나요.", "바쁘지만", ["바쁘고", "바빠서", "바쁘면"], "바쁘지만 oppose le fait d’être occupé à la rencontre maintenue.", "contrast", "Tu es occupé, mais tu rencontres quand même ton ami."),
  ],

  "condition-eumyeon": [
    choose("connectors", "rain-condition", "비가 __ 집에 있어요.", "오면", ["와서", "오고", "오지만"], "오면 pose la pluie comme condition.", "condition", "Tu poses une condition : s’il pleut, tu restes chez toi."),
    choose("connectors", "time-condition", "시간이 __ 가요.", "있으면", ["있어서", "있고", "있지만"], "있으면 signifie « si j’ai le temps ».", "condition", "Tu iras seulement si tu as le temps."),
    choose("connectors", "cheap-condition", "__ 살게요.", "싸면", ["싸서", "싸고", "싸지만"], "싸면 pose le prix bas comme condition de l’achat.", "condition", "Tu achèteras l’article à condition qu’il soit bon marché."),
    choose("connectors", "get-off-suffices", "여기에서 __.", "내리면 돼요", ["내리면 가요", "내려서 돼요", "내리지만 돼요"], "내리면 돼요 indique que descendre ici suffit.", "sufficiency", "Tu rassures le voyageur : il lui suffit de descendre ici."),
    choose("connectors", "show-ticket-suffices", "표를 __.", "보여 주면 돼요", ["보여 주면 가요", "보여 줘서 돼요", "보여 주지만 돼요"], "보여 주면 돼요 signifie qu’il suffit de montrer le billet.", "sufficiency", "Tu expliques que montrer le billet est la seule action nécessaire."),
  ],

  "obligation-a-eoya-haeyo": [
    transform("modality", "buy-obligation", "사다 → ?", "사야 해요", ["사도 돼요", "살 수 있어요", "사세요"], "사야 해요 exprime l’obligation d’acheter.", "verbal-obligation", undefined, "Forme l’obligation avec -아/어야 해요."),
    transform("modality", "go-obligation", "가다 → ?", "가야 해요", ["가도 돼요", "갈 수 있어요", "가세요"], "가야 해요 signifie qu’il faut aller.", "verbal-obligation", undefined, "Forme l’obligation avec -아/어야 해요."),
    transform("modality", "eat-obligation", "먹다 → ?", "먹어야 해요", ["먹어도 돼요", "먹을 수 있어요", "먹으세요"], "먹어야 해요 exprime une action nécessaire.", "verbal-obligation", undefined, "Forme l’obligation avec -아/어야 해요."),
    choose("modality", "passport-need", "여권이 __.", "필요해요", ["보여 줘야 해요", "있어도 돼요", "볼 수 있어요"], "필요해요 porte sur le nom 여권 : le passeport est nécessaire.", "nominal-need", "On t’explique quel document est nécessaire."),
    choose("modality", "show-passport-obligation", "여권을 __.", "보여 줘야 해요", ["필요해요", "보여 줘도 돼요", "볼 수 있어요"], "보여 줘야 해요 porte sur l’action obligatoire de montrer le passeport.", "verbal-obligation", "Au contrôle, l’agent explique l’action obligatoire."),
  ],

  "comparison-boda-deo-jeil": [
    gap("syntax", "bus-subway", "버스__ 지하철이 더 빨라요.", "보다", ["만", "도", "에"], "보다 suit la référence de comparaison, ici le bus.", "comparison"),
    gap("syntax", "bag-comparison", "이 가방이 저 가방보다 __ 가벼워요.", "더", ["제일", "만", "도"], "제일 peut être correct dans un superlatif portant sur un groupe. Ici, seuls deux sacs sont comparés : 보다 appelle le comparatif 더.", "comparison", "Tu compares uniquement ces deux sacs ; tu ne cherches pas le plus léger d’un groupe.", "Complète la comparaison entre deux éléments, sans former de superlatif."),
    gap("syntax", "coffee-tea", "커피__ 차가 더 싸요.", "보다", ["만", "도", "에"], "커피 est le point de référence et prend 보다.", "comparison"),
    gap("syntax", "cheapest", "이게 __ 싸요.", "제일", ["더", "보다", "만"], "Sans second terme, 제일 forme le superlatif : « le moins cher ».", "superlative", "Parmi au moins trois articles, celui-ci est le moins cher."),
    gap("syntax", "best", "이 식당이 __ 좋아요.", "제일", ["더", "보다", "도"], "Parmi plusieurs restaurants, 제일 exprime « le meilleur ».", "superlative", "Tu compares au moins trois restaurants."),
  ],

  "suggestion-eulkkayo": [
    transform("modality", "eat-suggestion", "먹다 → ?", "먹을까요?", ["먹을 거예요", "먹을게요", "먹어도 돼요"], "먹을까요? propose une action commune.", "suggestion", "Tu proposes à un collègue de déjeuner ensemble.", "Forme une suggestion avec -(으)ㄹ까요?"),
    transform("modality", "go-suggestion", "가다 → ?", "갈까요?", ["갈 거예요", "갈게요", "가도 돼요"], "갈까요? demande l’avis sur une action commune.", "suggestion", "Tu proposes à un ami de partir ensemble.", "Forme une suggestion avec -(으)ㄹ까요?"),
    transform("modality", "drink-suggestion", "마시다 → ?", "마실까요?", ["마실 거예요", "마실게요", "마셔도 돼요"], "마실까요? propose de boire quelque chose ensemble.", "suggestion", "Tu proposes à une collègue de prendre un café.", "Forme une suggestion avec -(으)ㄹ까요?"),
    transform("modality", "meet-suggestion", "만나다 → ?", "만날까요?", ["만날 거예요", "만날게요", "만나도 돼요"], "만날까요? propose une rencontre et sollicite l’avis de l’autre.", "suggestion", "Tu proposes de vous retrouver demain.", "Forme une suggestion avec -(으)ㄹ까요?"),
    choose("modality", "suggestion-vs-plan", "같이 __?", "갈까요", ["갈 거예요", "갈게요", "가도 돼요"], "같이 갈까요? est une proposition commune ; 갈게요 annoncerait ta propre décision.", "suggestion-vs-intention", "Tu demandes à ton ami s’il souhaite partir avec toi."),
  ],

  "honorific-si": [
    choose("register", "teacher-arrives", "선생님이 __.", "오세요", ["와요", "오셨어요", "오실 거예요"], "오세요 contient -시- et honore le professeur qui arrive maintenant.", "honorific-present", "À l’accueil, on annonce respectueusement que le professeur arrive en ce moment.", "Choisis la forme présente qui honore le sujet de l’action."),
    gap("register", "honorific-people", "몇 __이세요?", "분", ["명", "개", "잔"], "몇 명이세요? est grammatical et poli. Ici, la consigne demande en plus le classificateur honorifique qui élève les clients : 몇 분이세요?", "honorific-lexicon", "Au restaurant, l’employé veut honorer explicitement les clients qu’il compte.", "Choisis le classificateur honorifique des personnes, et non le compteur courant."),
    choose("register", "teacher-present", "선생님은 교실에 __.", "계세요", ["있어요", "계셨어요", "계실 거예요"], "선생님은 교실에 있어요 est grammatical et poli envers l’interlocuteur. Ici, tu dois aussi honorer le professeur, sujet de la phrase, avec 계세요.", "honorific-lexicon", "Tu dois honorer explicitement le professeur, qui se trouve actuellement dans la salle.", "Choisis la forme présente qui honore le sujet de la phrase."),
    gap("register", "customer-name", "__이 어떻게 되세요?", "성함", ["이름", "말씀", "나이"], "이름이 어떻게 되세요? est courant et poli. Ici, la consigne demande le nom honorifique qui élève explicitement le client : 성함.", "honorific-lexicon", "Un employé veut employer le nom honorifique réservé au nom du client.", "Choisis le mot honorifique pour « nom », et non le terme courant."),
    choose("register", "repeat-respectfully", "다시 한번 __?", "말씀해 주시겠어요", ["말해요", "말씀하세요", "말할까요"], "말씀해 주시겠어요? formule une demande très respectueuse de répétition.", "honorific-request", "Tu demandes à une personne âgée ou à un supérieur de répéter."),
  ],
};
