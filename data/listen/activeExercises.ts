export type ExerciseKind =
  | "dictation"
  | "situation"
  | "gap"
  | "order"
  | "reaction";

type BaseExercise = {
  id: string;
  kind: ExerciseKind;
  theme: string;
  title: string;
  instruction: string;
  explanation: string;
  audioAsset: string;
};

export type DictationExercise = BaseExercise & {
  kind: "dictation";
  options: string[];
  answer: number;
};

export type ContextChoiceExercise = BaseExercise & {
  kind: "situation" | "reaction";
  sourceText: string;
  options: string[];
  answer: number;
};

export type GapExercise = BaseExercise & {
  kind: "gap";
  before: string;
  after: string;
  options: string[];
  answer: string;
};

export type OrderExercise = BaseExercise & {
  kind: "order";
  words: string[];
  answer: string[];
};

export type ListenExercise =
  | DictationExercise
  | ContextChoiceExercise
  | GapExercise
  | OrderExercise;

export const TRAINING_ORDER: ExerciseKind[] = [
  "dictation",
  "situation",
  "gap",
  "order",
  "reaction",
];

export const EXERCISES_BY_KIND: Record<ExerciseKind, ListenExercise[]> = {
  dictation: [
    {
      id: "cafe-dictation-01",
      kind: "dictation",
      theme: "Café",
      title: "Repère la question",
      instruction: "Écoute, puis choisis la phrase prononcée.",
      audioAsset: "assets/audio/listen/myeot-buniseyo-1.mp3",
      options: ["몇 분이세요?", "몇 시예요?", "몇 층이에요?"],
      answer: 0,
      explanation: "몇 분이세요? = Vous êtes combien ?",
    },
    {
      id: "cafe-dictation-02",
      kind: "dictation",
      theme: "Café",
      title: "Repère la commande",
      instruction: "Écoute, puis choisis la phrase prononcée.",
      audioAsset: "assets/audio/listen/aiseu-amerikano-juseyo-1.mp3",
      options: [
        "아이스 아메리카노 주세요.",
        "따뜻한 아메리카노 주세요.",
        "아이스 카페라떼 주세요.",
      ],
      answer: 0,
      explanation:
        "아이스 아메리카노 주세요. = Un americano glacé, s'il vous plaît.",
    },
    {
      id: "metro-dictation-03",
      kind: "dictation",
      theme: "Métro",
      title: "Entends la direction",
      instruction: "Écoute, puis choisis la phrase prononcée.",
      audioAsset: "assets/audio/listen/igoseuro-gaseyo.mp3",
      options: ["이쪽으로 가세요.", "저쪽으로 가세요.", "왼쪽으로 가세요."],
      answer: 0,
      explanation: "이쪽으로 가세요. = Allez par ici.",
    },
    {
      id: "shop-dictation-04",
      kind: "dictation",
      theme: "Boutique",
      title: "Repère la question",
      instruction: "Écoute, puis choisis la phrase prononcée.",
      audioAsset: "assets/audio/listen/eolmayeyo.mp3",
      options: ["얼마예요?", "이거 있어요?", "카드 돼요?"],
      answer: 0,
      explanation: "얼마예요? = Combien ça coûte ?",
    },
    {
      id: "hotel-dictation-05",
      kind: "dictation",
      theme: "Hôtel",
      title: "Repère la demande",
      instruction: "Écoute, puis choisis la phrase prononcée.",
      audioAsset: "assets/audio/listen/yeyakhaesseoyo-1.mp3",
      options: ["예약했어요.", "예약할게요.", "취소했어요."],
      answer: 0,
      explanation: "예약했어요. = J'ai réservé.",
    },
  ],
  situation: [
    {
      id: "bbq-situation-01",
      kind: "situation",
      theme: "K-BBQ",
      title: "Comprends la situation",
      instruction: "Écoute la serveuse et choisis la réponse logique.",
      audioAsset: "assets/audio/listen/myeot-buniseyo-2.mp3",
      sourceText: "몇 분이세요?",
      options: ["두 명이에요.", "삼겹살 2인분 주세요.", "카드로 계산할게요."],
      answer: 0,
      explanation: "La serveuse demande le nombre de personnes.",
    },
    {
      id: "cafe-situation-02",
      kind: "situation",
      theme: "Café",
      title: "Réponds au barista",
      instruction: "Écoute la question et choisis la réponse naturelle.",
      audioAsset: "assets/audio/listen/mwo-deurilkkayo.mp3",
      sourceText: "주문 하시겠어요 ?",
      options: ["따뜻한 라떼 주세요.", "매장에서 마실게요.", "카드로 할게요."],
      answer: 0,
      explanation: "On te demande ce que tu veux commander.",
    },
    {
      id: "metro-situation-03",
      kind: "situation",
      theme: "Métro",
      title: "Trouve l'arrêt",
      instruction: "Écoute l'annonce et choisis quoi faire.",
      audioAsset: "assets/audio/listen/ibeon-yeogeun-hongdaeipguyeogimnida.mp3",
      sourceText: "이번 역은 홍대입구역입니다.",
      options: ["여기서 내려요.", "2호선으로 갈아타요.", "다음 역에서 내려요."],
      answer: 0,
      explanation: "L'annonce indique que c'est l'arrêt où descendre.",
    },
    {
      id: "shop-situation-04",
      kind: "situation",
      theme: "Boutique",
      title: "Comprends la question",
      instruction: "Écoute la question et choisis la réponse adaptée.",
      audioAsset:
        "assets/audio/listen/kadeuro-hasigesseoyo-hyeongeumeuro-hasigesseoyo.mp3",
      sourceText: "카드로 하시겠어요, 현금으로 하시겠어요?",
      options: ["카드로 할게요.", "중간 사이즈로 할게요.", "봉투는 괜찮아요."],
      answer: 0,
      explanation: "On te demande comment tu veux payer.",
    },
    {
      id: "street-situation-05",
      kind: "situation",
      theme: "Rue",
      title: "Réponds dans la rue",
      instruction: "Écoute la personne et choisis la réponse logique.",
      audioAsset: "assets/audio/listen/yeogiseo-jjuk-gasimyeon-dwaeyo.mp3",
      sourceText: "여기서 쭉 가시면 돼요",
      options: ["네, 감사합니다.", "서울역이 어디예요?", "택시를 불러 주세요."],
      answer: 0,
      explanation: "La personne vient de t'indiquer le chemin.",
    },
  ],
  gap: [
    {
      id: "restaurant-gap-01",
      kind: "gap",
      theme: "Restaurant",
      title: "Complète la quantité",
      instruction: "Écoute, puis complète la phrase.",
      audioAsset: "assets/audio/listen/samgyeopsal-iinbun-juseyo.mp3",
      before: "삼겹살 ",
      after: " 주세요.",
      options: ["2인분", "3인분", "4인분"],
      answer: "2인분",
      explanation: "2인분 = deux portions.",
    },
    {
      id: "cafe-gap-02",
      kind: "gap",
      theme: "Café",
      title: "Complète la commande",
      instruction: "Écoute, puis choisis le mot manquant.",
      audioAsset: "assets/audio/listen/aiseu-ratte-juseyo.mp3",
      before: "아이스 ",
      after: " 주세요.",
      options: ["라떼", "아메리카노", "레몬에이드"],
      answer: "라떼",
      explanation: "아이스 라떼 주세요. = Un latte glacé, s'il vous plaît.",
    },
    {
      id: "shop-gap-03",
      kind: "gap",
      theme: "Boutique",
      title: "Complète le paiement",
      instruction: "Écoute, puis complète la phrase.",
      audioAsset: "assets/audio/listen/kadeuro-gyesanhalgeyo.mp3",
      before: "",
      after: " 계산할게요.",
      options: ["카드로", "현금으로", "삼성페이로"],
      answer: "카드로",
      explanation: "카드로 계산할게요. = Je vais payer par carte.",
    },
    {
      id: "metro-gap-04",
      kind: "gap",
      theme: "Métro",
      title: "Complète le lieu",
      instruction: "Écoute, puis choisis le mot manquant.",
      audioAsset: "assets/audio/listen/hongdaeipgueseo-naeryeoyo.mp3",
      before: "",
      after: "에서 내려요.",
      options: ["홍대입구", "강남", "서울역"],
      answer: "홍대입구",
      explanation: "홍대입구에서 내려요. = Je descends à Hongik University.",
    },
    {
      id: "hotel-gap-05",
      kind: "gap",
      theme: "Hôtel",
      title: "Complète la phrase",
      instruction: "Écoute, puis complète la phrase.",
      audioAsset: "assets/audio/listen/yeyakhaesseoyo-2.mp3",
      before: "",
      after: "했어요.",
      options: ["예약", "결제", "체크인"],
      answer: "예약",
      explanation: "예약했어요. = J'ai réservé.",
    },
  ],
  order: [
    {
      id: "metro-order-01",
      kind: "order",
      theme: "Métro",
      title: "Remets en ordre",
      instruction: "Écoute, puis reconstruis la phrase.",
      audioAsset: "assets/audio/listen/jjuk-ijjogeuro-gaseyo.mp3",
      words: ["가세요", "이쪽으로", "쭉"],
      answer: ["쭉", "이쪽으로", "가세요"],
      explanation: "쭉 이쪽으로 가세요. = Continuez tout droit par ici.",
    },
    {
      id: "cafe-order-02",
      kind: "order",
      theme: "Café",
      title: "Reconstruis la commande",
      instruction: "Écoute, puis remets les mots dans l'ordre.",
      audioAsset: "assets/audio/listen/aiseu-amerikano-juseyo-2.mp3",
      words: ["주세요", "아이스", "아메리카노"],
      answer: ["아이스", "아메리카노", "주세요"],
      explanation:
        "아이스 아메리카노 주세요. = Un americano glacé, s'il vous plaît.",
    },
    {
      id: "shop-order-03",
      kind: "order",
      theme: "Boutique",
      title: "Replace les mots",
      instruction: "Écoute, puis reconstruis la phrase.",
      audioAsset: "assets/audio/listen/igeo-eolmayeyo.mp3",
      words: ["얼마예요", "이거", "?"],
      answer: ["이거", "얼마예요", "?"],
      explanation: "이거 얼마예요? = Combien coûte ceci ?",
    },
    {
      id: "restaurant-order-04",
      kind: "order",
      theme: "Restaurant",
      title: "Remets la demande",
      instruction: "Écoute, puis remets les mots en ordre.",
      audioAsset: "assets/audio/listen/mul-jom-juseyo.mp3",
      words: ["주세요", "물", "좀"],
      answer: ["물", "좀", "주세요"],
      explanation: "물 좀 주세요. = Un peu d'eau, s'il vous plaît.",
    },
    {
      id: "street-order-05",
      kind: "order",
      theme: "Rue",
      title: "Reconstruis la question",
      instruction: "Écoute, puis reconstruis la phrase.",
      audioAsset: "assets/audio/listen/hwajangsiri-eodiyeyo.mp3",
      words: ["어디예요", "화장실이", "?"],
      answer: ["화장실이", "어디예요", "?"],
      explanation: "화장실이 어디예요? = Où sont les toilettes ?",
    },
  ],
  reaction: [
    {
      id: "cafe-reaction-01",
      kind: "reaction",
      theme: "Café",
      title: "Choisis la réaction",
      instruction: "Écoute et choisis la commande appropriée.",
      audioAsset: "assets/audio/listen/mwo-deurilkkayo.mp3",
      sourceText: "뭐 드릴까요?",
      options: [
        "아이스 아메리카노 주세요.",
        "카드로 계산할게요.",
        "포장해 주세요.",
      ],
      answer: 0,
      explanation: "On te demande ce que tu veux prendre.",
    },
    {
      id: "restaurant-reaction-02",
      kind: "reaction",
      theme: "Restaurant",
      title: "Réagis à la serveuse",
      instruction: "Écoute et choisis la réponse naturelle.",
      audioAsset: "assets/audio/listen/deo-piryohan-geo-isseuseyo.mp3",
      sourceText: "더 필요한 거 있으세요?",
      options: ["네, 물 좀 주세요.", "카드로 계산할게요.", "포장해 주세요."],
      answer: 0,
      explanation: "La serveuse demande si tu as besoin de quelque chose.",
    },
    {
      id: "shop-reaction-03",
      kind: "reaction",
      theme: "Boutique",
      title: "Réponds au vendeur",
      instruction: "Écoute, puis choisis la bonne réaction.",
      audioAsset: "assets/audio/listen/mwo-chajeusineun-geo-isseuseyo.mp3",
      sourceText: "뭐 찾으시는 거 있으세요?",
      options: [
        "괜찮아요, 그냥 볼게요.",
        "중간 사이즈로 주세요.",
        "카드로 할게요.",
      ],
      answer: 0,
      explanation: "Le vendeur propose de t'aider, tu réponds que tu regardes.",
    },
    {
      id: "hotel-reaction-04",
      kind: "reaction",
      theme: "Hôtel",
      title: "Réponds à l'accueil",
      instruction: "Écoute et choisis la réponse adaptée.",
      audioAsset: "assets/audio/listen/yeyakhasyeosseoyo.mp3",
      sourceText: "예약하셨어요?",
      options: ["예약했어요.", "현금으로 할게요.", "짐을 맡길게요."],
      answer: 0,
      explanation: "La réception demande si tu as une réservation.",
    },
    {
      id: "street-reaction-05",
      kind: "reaction",
      theme: "Rue",
      title: "Réponds dans la rue",
      instruction: "Écoute, puis choisis la réponse adaptée.",
      audioAsset: "assets/audio/listen/yeogiseo-oreunjjogeuro-gaseyo.mp3",
      sourceText: "여기서 쭉 가시면 돼요.",
      options: ["감사합니다.", "왼쪽으로 가세요.", "서울역이 어디예요?"],
      answer: 0,
      explanation: "Quelqu'un vient de t'aider, tu remercies.",
    },
  ],
};

export const ACTIVE_LISTEN_EXERCISES = TRAINING_ORDER.flatMap(
  (kind) => EXERCISES_BY_KIND[kind],
);
