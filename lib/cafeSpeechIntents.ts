import type { CafeOrderProduct } from "./cafeOrderState";

export const CAFE_SPEECH_PILOT_MISSION_ID = "order-takeout";
export const CAFE_SPEECH_MAX_KEYWORD_DISTANCE = 1;
export const CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS = 1;

export type CafeSpeechRecoverySignal =
  | "keyword-proximity"
  | "compatible-predicate"
  | "coherent-classifier"
  | "quantity-marker"
  | "polarity-marker"
  | "node-available";

export type CafeSpeechRecoveryEvent = {
  eventName: "cafe_speech_probable_transcription_error";
  intentId: string;
  canonical: string;
  expectedKeyword: string;
  observedKeyword: string;
  syllableDistance: number;
  alteredSyllables: number;
  score: number;
  signals: readonly CafeSpeechRecoverySignal[];
};

export type CafeSpeechChoice = {
  id: string;
  korean: string;
  label: string;
  nextNodeId: string;
  orderProduct?: CafeOrderProduct;
};

type CafeSpeechConfusion = {
  from: string;
  to: string;
};

type CafeSpeechGrammarRule = {
  variants: readonly string[];
  feedback: string;
};

export type CafeSpeechIntentDefinition = {
  id: string;
  choiceIds: readonly string[];
  canonical: string;
  validVariants: readonly string[];
  requiredTokens: readonly string[];
  forbiddenTokens: readonly string[];
  speechConfusions: readonly CafeSpeechConfusion[];
  recoverableGrammarErrors: readonly CafeSpeechGrammarRule[];
  fuzzyKeywords: readonly string[];
  fuzzyPredicates: readonly string[];
  fuzzyClassifiers: readonly string[];
  fuzzyPolarityTokens: readonly string[];
  fuzzyRealWordCollisions: readonly string[];
  confirmationVariants: readonly string[];
  confirmationLabel: string;
  helpLabel: string;
  meaning: string;
  correctionMessage: string;
  ambiguityMessage: string;
  includeInUnavailableFeedback?: boolean;
};

export type CafeSpeechMorphologyFamilyId =
  | "calculate"
  | "do"
  | "drink"
  | "eat"
  | "give"
  | "go"
  | "need"
  | "order"
  | "package"
  | "pay"
  | "pay-money"
  | "receive"
  | "request"
  | "say"
  | "take";

type CafeSpeechMorphologyFamily = {
  radical: string;
  forms: readonly string[];
};

export type CafeSpeechPolarity = "negative" | "neutral" | "positive";

export type CafeSpeechLinguisticRule = {
  conceptTokens: readonly string[];
  predicateFamilies: readonly CafeSpeechMorphologyFamilyId[];
  standalonePredicateFamilies?: readonly CafeSpeechMorphologyFamilyId[];
  coherentClassifiers: readonly string[];
  affirmativeMarkers: readonly string[];
  polarity: CafeSpeechPolarity;
  allowTerseConcept: boolean;
};

export type CafeSpeechIntentMatch =
  | {
      reason: "matched";
      choice: CafeSpeechChoice;
      feedback: string | null;
      recoveryEvent?: CafeSpeechRecoveryEvent;
    }
  | {
      reason: "uncertain";
      choice: CafeSpeechChoice;
      confirmationLabel: string;
      feedback: string;
    }
  | {
      reason: "ambiguous" | "out-of-scope" | "empty";
      choice: null;
      feedback: string;
    };

const AMBIGUOUS_PRODUCT_FEEDBACK =
  "J’ai reconnu plusieurs produits. Choisis une seule commande dans cette scène.";
const AMBIGUOUS_CONSUMPTION_FEEDBACK =
  "J’ai reconnu à la fois sur place et à emporter. Choisis une seule option.";
const AMBIGUOUS_PAYMENT_FEEDBACK =
  "J’ai reconnu à la fois carte et espèces. Quel moyen de paiement souhaites-tu utiliser ?";
const AMBIGUOUS_RECEIPT_FEEDBACK =
  "J’ai reconnu à la fois oui et non pour le reçu. Indique clairement si tu le souhaites.";
const UNAVAILABLE_PRODUCT_FEEDBACK =
  "Cette réponse ne correspond à aucune commande disponible ici. Choisis americano, jus d’orange, latte ou cheesecake.";

const PRODUCT_FORBIDDEN_TOKENS = [
  "안",
  "않",
  "아니",
  "말고",
  "말아",
  "필요없",
  "카드",
  "현금",
  "포장",
  "매장",
  "영수증",
  "다시",
  "샌드위치",
  "카푸치노",
  "에스프레소",
] as const;

const ORDER_ACTION_TOKENS = [
  "주세요",
  "줘",
  "부탁",
  "주문",
  "할게요",
  "하나",
  "잔",
  "조각",
] as const;

const CAFE_SPEECH_MORPHOLOGY_FAMILIES = {
  calculate: {
    radical: "계산하-",
    forms: ["계산하", "계산해", "계산할", "계산합", "계산했", "계산하겠"],
  },
  do: {
    radical: "하-",
    forms: [
      "할게",
      "할거",
      "할래",
      "하겠",
      "합니다",
      "해요",
      "한다",
      "하다",
      "해주세요",
      "해줘",
    ],
  },
  drink: {
    radical: "마시-",
    forms: ["마시", "마실", "마셔", "마십", "마셨", "마시겠"],
  },
  eat: {
    radical: "먹-",
    forms: ["먹고", "먹어", "먹으", "먹을", "먹겠", "먹는다", "먹었", "먹다"],
  },
  give: {
    radical: "주-",
    forms: [
      "주세요",
      "주셔",
      "주십시오",
      "주시",
      "주실",
      "주겠",
      "줄게",
      "준다",
      "주다",
      "줘요",
      "줘",
    ],
  },
  go: {
    radical: "가-",
    forms: ["갈게", "갈거", "갈래", "가요", "간다", "가겠", "갔"],
  },
  need: {
    radical: "필요하-",
    forms: ["필요하", "필요해", "필요합", "필요할", "필요했", "필요한"],
  },
  order: {
    radical: "주문하-",
    forms: ["주문하", "주문해", "주문할", "주문합", "주문했", "주문하겠"],
  },
  package: {
    radical: "포장하-",
    forms: ["포장하", "포장해", "포장할", "포장합", "포장했", "포장하겠"],
  },
  pay: {
    radical: "결제하-",
    forms: ["결제하", "결제해", "결제할", "결제합", "결제했", "결제하겠"],
  },
  "pay-money": {
    radical: "내-",
    forms: ["낼게", "내겠", "냅니다", "내요", "낸다", "냈"],
  },
  receive: {
    radical: "받-",
    forms: [
      "받아",
      "받으",
      "받을",
      "받겠",
      "받습",
      "받는다",
      "받았",
      "받지",
      "받다",
    ],
  },
  request: {
    radical: "부탁하-",
    forms: ["부탁", "부탁하", "부탁해", "부탁할", "부탁합", "부탁드"],
  },
  say: {
    radical: "말하- / 말씀하-",
    forms: ["말씀하", "말씀해", "말씀", "말하", "말해", "말할", "말씀드"],
  },
  take: {
    radical: "가져가-",
    forms: [
      "가져가",
      "가져갈",
      "가져가겠",
      "가져갔",
      "가지고가",
      "가지고갈",
    ],
  },
} as const satisfies Record<
  CafeSpeechMorphologyFamilyId,
  CafeSpeechMorphologyFamily
>;

export const CAFE_SPEECH_LINGUISTIC_RULES = {
  "americano-order": {
    conceptTokens: ["아메리카노"],
    predicateFamilies: ["give", "order", "request"],
    coherentClassifiers: ["잔"],
    affirmativeMarkers: ["요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  "orange-juice-order": {
    conceptTokens: ["오렌지주스", "주스"],
    predicateFamilies: ["give", "order", "request"],
    coherentClassifiers: ["잔"],
    affirmativeMarkers: ["요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  "latte-order": {
    conceptTokens: ["라떼"],
    predicateFamilies: ["give", "order", "request"],
    coherentClassifiers: ["잔"],
    affirmativeMarkers: ["요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  "cheesecake-order": {
    conceptTokens: ["치즈케이크", "케이크"],
    predicateFamilies: ["give", "order", "request"],
    coherentClassifiers: ["조각", "개"],
    affirmativeMarkers: ["요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  repeat: {
    conceptTokens: ["다시", "한번더"],
    predicateFamilies: ["say"],
    coherentClassifiers: [],
    affirmativeMarkers: [],
    polarity: "positive",
    allowTerseConcept: false,
  },
  "eat-here": {
    conceptTokens: ["여기서", "매장", "먹고"],
    predicateFamilies: ["eat", "drink", "go"],
    coherentClassifiers: [],
    affirmativeMarkers: ["네", "요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  takeout: {
    conceptTokens: ["테이크아웃", "가지고가", "가져가", "포장"],
    predicateFamilies: ["package", "take", "give", "request", "do"],
    coherentClassifiers: [],
    affirmativeMarkers: ["요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  "card-payment": {
    conceptTokens: ["카드"],
    predicateFamilies: ["pay", "calculate", "do", "pay-money", "request"],
    coherentClassifiers: [],
    affirmativeMarkers: ["요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  "cash-payment": {
    conceptTokens: ["현금"],
    predicateFamilies: ["pay", "calculate", "do", "pay-money", "request"],
    coherentClassifiers: [],
    affirmativeMarkers: ["요"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  "receipt-yes": {
    conceptTokens: ["영수증"],
    predicateFamilies: ["need", "receive", "give"],
    standalonePredicateFamilies: ["need", "receive"],
    coherentClassifiers: [],
    affirmativeMarkers: ["네", "예"],
    polarity: "positive",
    allowTerseConcept: true,
  },
  "receipt-no": {
    conceptTokens: ["필요없", "안받", "안주", "괜찮"],
    predicateFamilies: ["need", "receive", "give"],
    coherentClassifiers: [],
    affirmativeMarkers: ["아니", "괜찮"],
    polarity: "negative",
    allowTerseConcept: true,
  },
} as const satisfies Record<string, CafeSpeechLinguisticRule>;

const CAFE_CLASSIFIERS = ["잔", "조각", "개", "병", "그릇", "명", "분", "대"] as const;
const CAFE_QUANTITIES = [
  "한",
  "두",
  "세",
  "네",
  "하나",
  "둘",
  "셋",
  "넷",
  "일",
  "이",
  "삼",
  "사",
  "1",
  "2",
  "3",
  "4",
] as const;

const NEGATION_TOKENS = [
  "안",
  "않",
  "아니",
  "말고",
  "말아",
  "못",
  "없",
  "지마",
  "하지마",
  "필요없",
  "안받",
  "안주",
  "안할",
] as const;

export const CAFE_SPEECH_INTENTS: readonly CafeSpeechIntentDefinition[] = [
  {
    id: "americano-order",
    choiceIds: ["ped_order_americano"],
    canonical: "아메리카노 한 잔 주세요.",
    validVariants: [
      "아메리카노 주세요.",
      "아이스 아메리카노 주세요.",
      "아메리카노 한 잔 주세요.",
      "아메리카노 하나 주세요.",
      "아이스 아메리카노 두 잔 주세요.",
      "아메리카노로 주세요.",
      "아메리카노 부탁드려요.",
      "아메리카노요.",
    ],
    requiredTokens: ["아메리카노"],
    forbiddenTokens: PRODUCT_FORBIDDEN_TOKENS,
    speechConfusions: [
      { from: "아메리가노", to: "아메리카노" },
      { from: "아메리카누", to: "아메리카노" },
      { from: "아메리까노", to: "아메리카노" },
      { from: "주새요", to: "주세요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["아메리카노 한 조각 주세요.", "아메리카노 줘."],
        feedback:
          "Commande comprise : americano. Pour une boisson, dis plutôt “아메리카노 한 잔 주세요.”",
      },
    ],
    fuzzyKeywords: ["아메리카노"],
    fuzzyPredicates: ["주세요", "줘", "부탁", "주문", "할게요"],
    fuzzyClassifiers: ["잔", "하나"],
    fuzzyPolarityTokens: [],
    fuzzyRealWordCollisions: [],
    confirmationVariants: [],
    confirmationLabel: "un americano",
    helpLabel: "commande un americano",
    meaning: "Ta réponse commande un americano",
    correctionMessage:
      "Commande comprise : americano. Dis plutôt “아메리카노 한 잔 주세요.”",
    ambiguityMessage: AMBIGUOUS_PRODUCT_FEEDBACK,
  },
  {
    id: "orange-juice-order",
    choiceIds: ["ped_order_orange_juice"],
    canonical: "오렌지 주스 한 잔 주세요.",
    validVariants: [
      "오렌지 주스 주세요.",
      "오렌지 주스 한 잔 주세요.",
      "주스 주세요.",
      "오렌지주스 주세요.",
      "오렌지 주스요.",
    ],
    requiredTokens: ["오렌지주스", "주스"],
    forbiddenTokens: PRODUCT_FORBIDDEN_TOKENS,
    speechConfusions: [
      { from: "오랜지", to: "오렌지" },
      { from: "쥬스", to: "주스" },
      { from: "주새요", to: "주세요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["오렌지 주스 한 조각 주세요.", "오렌지 주스 줘."],
        feedback:
          "Commande comprise : jus d’orange. Pour une boisson, dis plutôt “오렌지 주스 한 잔 주세요.”",
      },
    ],
    fuzzyKeywords: ["오렌지주스"],
    fuzzyPredicates: ["주세요", "줘", "부탁", "주문", "할게요"],
    fuzzyClassifiers: ["잔", "하나"],
    fuzzyPolarityTokens: [],
    fuzzyRealWordCollisions: [],
    confirmationVariants: [],
    confirmationLabel: "un jus d’orange",
    helpLabel: "commande un jus d’orange",
    meaning: "Ta réponse commande un jus d’orange",
    correctionMessage:
      "Commande comprise : jus d’orange. Dis plutôt “오렌지 주스 한 잔 주세요.”",
    ambiguityMessage: AMBIGUOUS_PRODUCT_FEEDBACK,
  },
  {
    id: "latte-order",
    choiceIds: ["ped_order_latte"],
    canonical: "라떼 한 잔 주세요.",
    validVariants: [
      "라떼 주세요.",
      "아이스 라떼 주세요.",
      "라떼 한 잔 주세요.",
      "아이스 라떼 한 잔 주세요.",
      "라떼요.",
    ],
    requiredTokens: ["라떼"],
    forbiddenTokens: PRODUCT_FORBIDDEN_TOKENS,
    speechConfusions: [
      { from: "라테", to: "라떼" },
      { from: "나떼", to: "라떼" },
      { from: "주새요", to: "주세요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["라떼 한 조각 주세요.", "라떼 줘."],
        feedback:
          "Commande comprise : latte. Pour une boisson, dis plutôt “라떼 한 잔 주세요.”",
      },
    ],
    fuzzyKeywords: ["라떼"],
    fuzzyPredicates: ["주세요", "줘", "부탁", "주문", "할게요"],
    fuzzyClassifiers: ["잔", "하나"],
    fuzzyPolarityTokens: [],
    fuzzyRealWordCollisions: [],
    confirmationVariants: [],
    confirmationLabel: "un latte",
    helpLabel: "commande un latte",
    meaning: "Ta réponse commande un latte",
    correctionMessage:
      "Commande comprise : latte. Dis plutôt “라떼 한 잔 주세요.”",
    ambiguityMessage: AMBIGUOUS_PRODUCT_FEEDBACK,
  },
  {
    id: "cheesecake-order",
    choiceIds: ["ped_order_cheesecake"],
    canonical: "치즈케이크 한 조각 주세요.",
    validVariants: [
      "케이크 주세요.",
      "치즈케이크 주세요.",
      "치즈케이크 한 조각 주세요.",
      "케이크 한 조각 주세요.",
      "치즈케이크 부탁드려요.",
      "치즈케이크요.",
    ],
    requiredTokens: ["치즈케이크", "케이크"],
    forbiddenTokens: PRODUCT_FORBIDDEN_TOKENS,
    speechConfusions: [
      { from: "치스케이크", to: "치즈케이크" },
      { from: "치즈케이그", to: "치즈케이크" },
      { from: "케이그", to: "케이크" },
      { from: "주새요", to: "주세요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["치즈케이크 한 잔 주세요.", "치즈케이크 줘."],
        feedback:
          "Commande comprise : cheesecake. Pour une part, dis plutôt “치즈케이크 한 조각 주세요.”",
      },
    ],
    fuzzyKeywords: ["치즈케이크"],
    fuzzyPredicates: ["주세요", "줘", "부탁", "주문", "할게요"],
    fuzzyClassifiers: ["조각"],
    fuzzyPolarityTokens: [],
    fuzzyRealWordCollisions: [],
    confirmationVariants: [],
    confirmationLabel: "un cheesecake",
    helpLabel: "commande un cheesecake",
    meaning: "Ta réponse commande un cheesecake",
    correctionMessage:
      "Commande comprise : cheesecake. Dis plutôt “치즈케이크 한 조각 주세요.”",
    ambiguityMessage: AMBIGUOUS_PRODUCT_FEEDBACK,
  },
  {
    id: "repeat",
    choiceIds: [
      "repeat_ped1",
      "repeat_ped2_drink",
      "repeat_ped2_cake",
      "repeat_ped3_here",
      "repeat_ped3_takeout",
    ],
    canonical: "다시 한번 말씀해 주세요.",
    validVariants: [
      "다시 한번 말씀해 주시겠어요?",
      "다시 말씀해 주세요.",
      "다시 한번 말해 주세요.",
      "다시 한 번 말씀해 주세요.",
      "한 번 더 말씀해 주세요.",
      "한 번 더 말해 주세요.",
    ],
    requiredTokens: ["다시말씀", "다시한번", "한번더"],
    forbiddenTokens: ["안", "않", "말고", "말아", "하지마"],
    speechConfusions: [
      { from: "마씀", to: "말씀" },
      { from: "주새요", to: "주세요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["다시 말해.", "다시 말해 줘."],
        feedback:
          "Intention comprise : répéter. Plus poli : “다시 한번 말씀해 주세요.”",
      },
    ],
    fuzzyKeywords: ["말씀"],
    fuzzyPredicates: ["다시", "한번더", "주세요", "말해"],
    fuzzyClassifiers: [],
    fuzzyPolarityTokens: [],
    fuzzyRealWordCollisions: [],
    confirmationVariants: [],
    confirmationLabel: "demander de répéter",
    helpLabel: "demande de répéter",
    meaning: "Ta réponse demande de répéter",
    correctionMessage:
      "Intention comprise : répéter. Dis plutôt “다시 한번 말씀해 주세요.”",
    ambiguityMessage:
      "J’ai reconnu plusieurs demandes. Reformule uniquement la demande de répétition.",
    includeInUnavailableFeedback: false,
  },
  {
    id: "eat-here",
    choiceIds: ["ped_here_drink", "ped_here_cake"],
    canonical: "먹고 갈게요.",
    validVariants: [
      "네, 먹고 갈게요.",
      "먹고 갈게요.",
      "먹고 가요.",
      "먹고 갈 거예요.",
      "여기서 먹을게요.",
      "여기서 먹고 갈게요.",
      "여기서 마실게요.",
      "매장에서 먹고 갈게요.",
      "매장에서 먹을게요.",
      "매장에서 마실게요.",
      "네, 여기서요.",
      "매장에서요.",
      "매장이요.",
    ],
    requiredTokens: ["먹고", "여기서", "매장"],
    forbiddenTokens: [
      "포장",
      "가져",
      "가지고갈",
      "테이크아웃",
      "안",
      "않",
      "말고",
      "말아",
    ],
    speechConfusions: [
      { from: "먹꼬", to: "먹고" },
      { from: "머글게요", to: "먹을게요" },
      { from: "매장애서", to: "매장에서" },
      { from: "갈께요", to: "갈게요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["드시고 갈 거예요."],
        feedback:
          "Intention comprise : sur place. Pour parler de toi, dis plutôt “먹고 갈게요”.",
      },
      {
        variants: ["먹고 가.", "여기서 먹어."],
        feedback:
          "Intention comprise : sur place. Plus poli : “먹고 갈게요.”",
      },
    ],
    fuzzyKeywords: ["먹고", "매장"],
    fuzzyPredicates: ["갈게", "먹을게", "마실게", "여기서"],
    fuzzyClassifiers: [],
    fuzzyPolarityTokens: ["네"],
    fuzzyRealWordCollisions: [],
    confirmationVariants: [],
    confirmationLabel: "sur place",
    helpLabel: "indique que tu consommeras sur place",
    meaning: "Ta réponse signifie que tu consommeras sur place",
    correctionMessage:
      "Intention comprise : sur place. Dis plutôt “먹고 갈게요.”",
    ambiguityMessage: AMBIGUOUS_CONSUMPTION_FEEDBACK,
  },
  {
    id: "takeout",
    choiceIds: ["ped_takeout_drink", "ped_takeout_cake"],
    canonical: "포장해 주세요.",
    validVariants: [
      "포장이요.",
      "포장해 주세요.",
      "포장할게요.",
      "포장으로 주세요.",
      "포장으로 해 주세요.",
      "포장 부탁드려요.",
      "가져갈게요.",
      "가져가요.",
      "가지고 갈게요.",
      "가지고 가요.",
      "테이크아웃.",
      "테이크아웃이요.",
      "테이크아웃으로 주세요.",
      "테이크아웃할게요.",
    ],
    requiredTokens: ["포장", "가져", "가지고갈", "테이크아웃"],
    forbiddenTokens: [
      "먹고",
      "여기서",
      "매장",
      "안",
      "않",
      "말고",
      "말아",
    ],
    speechConfusions: [
      { from: "테이카웃", to: "테이크아웃" },
      { from: "데이크아웃", to: "테이크아웃" },
      { from: "데이카우트", to: "테이크아웃" },
      { from: "테이크아우트", to: "테이크아웃" },
      { from: "주새요", to: "주세요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: [
          "테이크아웃 주세요.",
          "테이크아웃 해 주세요.",
          "포장.",
          "테이크아웃 줘.",
        ],
        feedback:
          "Intention comprise : à emporter. Plus naturel : “포장해 주세요” ou “테이크아웃이요”.",
      },
    ],
    fuzzyKeywords: ["포장", "테이크아웃"],
    fuzzyPredicates: ["해주세요", "주세요", "할게", "으로", "부탁"],
    fuzzyClassifiers: [],
    fuzzyPolarityTokens: ["이요"],
    fuzzyRealWordCollisions: ["보장"],
    confirmationVariants: [],
    confirmationLabel: "à emporter",
    helpLabel: "demande à emporter",
    meaning: "Ta réponse demande une commande à emporter",
    correctionMessage:
      "Intention comprise : à emporter. Dis plutôt “포장해 주세요.”",
    ambiguityMessage: AMBIGUOUS_CONSUMPTION_FEEDBACK,
  },
  {
    id: "card-payment",
    choiceIds: ["ped_card_here", "ped_card_takeout"],
    canonical: "카드로 할게요.",
    validVariants: [
      "카드로 할게요.",
      "카드로 결제할게요.",
      "카드 결제할게요.",
      "카드로 계산할게요.",
      "카드로 하겠습니다.",
      "카드로 낼게요.",
      "카드요.",
      "카드로요.",
    ],
    requiredTokens: ["카드"],
    forbiddenTokens: ["안", "않", "말고", "말아", "없"],
    speechConfusions: [
      { from: "카도", to: "카드" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["카드.", "카드로 해."],
        feedback:
          "Paiement compris : carte. Plus poli : “카드로 할게요.”",
      },
    ],
    fuzzyKeywords: ["카드"],
    fuzzyPredicates: ["결제", "계산", "할게", "하겠", "낼게", "부탁", "으로"],
    fuzzyClassifiers: [],
    fuzzyPolarityTokens: ["이요"],
    fuzzyRealWordCollisions: ["가드"],
    confirmationVariants: ["가드."],
    confirmationLabel: "un paiement par carte",
    helpLabel: "choisis le paiement par carte",
    meaning: "Ta réponse demande un paiement par carte",
    correctionMessage:
      "Paiement compris : carte. Dis plutôt “카드로 할게요.”",
    ambiguityMessage: AMBIGUOUS_PAYMENT_FEEDBACK,
  },
  {
    id: "cash-payment",
    choiceIds: ["ped_cash_here", "ped_cash_takeout"],
    canonical: "현금으로 할게요.",
    validVariants: [
      "현금으로 할게요.",
      "현금으로 결제할게요.",
      "현금으로 계산할게요.",
      "현금으로 하겠습니다.",
      "현금으로 낼게요.",
      "현금이요.",
      "현금으로요.",
    ],
    requiredTokens: ["현금"],
    forbiddenTokens: ["안", "않", "말고", "말아", "없"],
    speechConfusions: [
      { from: "현근", to: "현금" },
      { from: "형금", to: "현금" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["현금.", "현금으로 해."],
        feedback:
          "Paiement compris : espèces. Plus poli : “현금으로 할게요.”",
      },
    ],
    fuzzyKeywords: ["현금"],
    fuzzyPredicates: ["결제", "계산", "할게", "하겠", "낼게", "부탁", "으로"],
    fuzzyClassifiers: [],
    fuzzyPolarityTokens: ["이요"],
    fuzzyRealWordCollisions: ["헌금"],
    confirmationVariants: ["현금만."],
    confirmationLabel: "un paiement en espèces",
    helpLabel: "choisis le paiement en espèces",
    meaning: "Ta réponse demande un paiement en espèces",
    correctionMessage:
      "Paiement compris : espèces. Dis plutôt “현금으로 할게요.”",
    ambiguityMessage: AMBIGUOUS_PAYMENT_FEEDBACK,
  },
  {
    id: "receipt-yes",
    choiceIds: ["ped_receipt_yes_here", "ped_receipt_yes_takeout"],
    canonical: "네, 영수증 주세요.",
    validVariants: [
      "네, 주세요.",
      "예, 주세요.",
      "영수증 주세요.",
      "네, 영수증 주세요.",
      "영수증 받을게요.",
      "네, 필요해요.",
      "필요해요.",
    ],
    requiredTokens: ["네", "예", "주세요", "받을게", "필요해"],
    forbiddenTokens: ["아니", "괜찮", "필요없", "안주", "않", "말아"],
    speechConfusions: [
      { from: "영수중", to: "영수증" },
      { from: "영수쯩", to: "영수증" },
      { from: "주새요", to: "주세요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["영수증.", "영수증 줘."],
        feedback:
          "Intention comprise : tu souhaites le reçu. Plus poli : “영수증 주세요.”",
      },
    ],
    fuzzyKeywords: ["영수증", "필요해요"],
    fuzzyPredicates: ["주세요", "받을게", "필요해"],
    fuzzyClassifiers: [],
    fuzzyPolarityTokens: ["네", "예"],
    fuzzyRealWordCollisions: ["피로해요"],
    confirmationVariants: [],
    confirmationLabel: "prendre le reçu",
    helpLabel: "accepte le reçu",
    meaning: "Ta réponse accepte le reçu",
    correctionMessage:
      "J’ai compris que tu souhaites le reçu. Le mot “영수증” a peut-être été mal reconnu. Dis plutôt “영수증 주세요.”",
    ambiguityMessage: AMBIGUOUS_RECEIPT_FEEDBACK,
  },
  {
    id: "receipt-no",
    choiceIds: ["ped_receipt_no_here", "ped_receipt_no_takeout"],
    canonical: "아니요, 괜찮아요.",
    validVariants: [
      "아니요, 괜찮아요.",
      "괜찮아요.",
      "영수증 필요 없어요.",
      "아니요, 필요 없어요.",
      "영수증 안 주셔도 돼요.",
      "안 받을게요.",
    ],
    requiredTokens: ["아니", "괜찮", "필요없", "안주", "안받"],
    forbiddenTokens: ["네주세요", "예주세요", "필요해요", "받을게요"],
    speechConfusions: [
      { from: "괜찬", to: "괜찮" },
      { from: "피료", to: "필요" },
      { from: "업어요", to: "없어요" },
    ],
    recoverableGrammarErrors: [
      {
        variants: ["아니.", "필요 없어."],
        feedback:
          "Intention comprise : pas de reçu. Plus poli : “아니요, 괜찮아요.”",
      },
    ],
    fuzzyKeywords: ["괜찮아요"],
    fuzzyPredicates: ["필요없", "안받", "안주", "없어요", "영수증"],
    fuzzyClassifiers: [],
    fuzzyPolarityTokens: ["아니요", "아니"],
    fuzzyRealWordCollisions: [],
    confirmationVariants: [],
    confirmationLabel: "refuser le reçu",
    helpLabel: "refuse le reçu",
    meaning: "Ta réponse refuse le reçu",
    correctionMessage:
      "Intention comprise : pas de reçu. La reconnaissance vocale a peut-être déformé un mot. Dis plutôt “아니요, 괜찮아요.”",
    ambiguityMessage: AMBIGUOUS_RECEIPT_FEEDBACK,
  },
];

const CAFE_PRODUCT_MENTIONS = [
  {
    id: "americano",
    aliases: ["아메리카노"],
    feedback:
      "Commande comprise : americano. Pour une boisson, dis plutôt “아메리카노 한 잔 주세요.”",
  },
  {
    id: "cheesecake",
    aliases: ["치즈케이크", "케이크"],
    feedback:
      "Commande comprise : cheesecake. Pour une part, dis plutôt “치즈케이크 한 조각 주세요.”",
  },
  {
    id: "orange-juice",
    aliases: ["오렌지주스", "주스"],
    feedback:
      "Commande comprise : jus d’orange. Pour une boisson, dis plutôt “오렌지 주스 한 잔 주세요.”",
  },
  {
    id: "latte",
    aliases: ["라떼"],
    feedback:
      "Commande comprise : latte. Pour une boisson, dis plutôt “라떼 한 잔 주세요.”",
  },
] as const;

const UNAVAILABLE_PRODUCT_MARKERS = [
  "샌드위치",
  "카푸치노",
  "에스프레소",
] as const;

export function normalizeKoreanSpeech(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function includesNormalized(value: string, token: string) {
  return value.includes(normalizeKoreanSpeech(token));
}

function containsAnyToken(value: string, tokens: readonly string[]) {
  return tokens.some((token) => includesNormalized(value, token));
}

function getLinguisticRule(definition: CafeSpeechIntentDefinition) {
  return CAFE_SPEECH_LINGUISTIC_RULES[
    definition.id as keyof typeof CAFE_SPEECH_LINGUISTIC_RULES
  ] as CafeSpeechLinguisticRule | undefined;
}

function matchesMorphologyFamily(
  value: string,
  familyId: CafeSpeechMorphologyFamilyId,
) {
  return CAFE_SPEECH_MORPHOLOGY_FAMILIES[familyId].forms.some((form) =>
    includesNormalized(value, form),
  );
}

function containsCompatiblePredicate(
  value: string,
  definition: CafeSpeechIntentDefinition,
) {
  const rule = getLinguisticRule(definition);
  return (
    containsAnyToken(value, definition.fuzzyPredicates) ||
    rule?.predicateFamilies.some((familyId) =>
      matchesMorphologyFamily(value, familyId),
    ) ||
    false
  );
}

function containsCoherentClassifier(
  value: string,
  definition: CafeSpeechIntentDefinition,
) {
  const rule = getLinguisticRule(definition);
  return (
    containsAnyToken(value, definition.fuzzyClassifiers) ||
    (!!rule && containsAnyToken(value, rule.coherentClassifiers))
  );
}

function containsQuantityWithClassifier(value: string) {
  return CAFE_QUANTITIES.some((quantity) =>
    CAFE_CLASSIFIERS.some((classifier) =>
      value.includes(
        `${normalizeKoreanSpeech(quantity)}${normalizeKoreanSpeech(classifier)}`,
      ),
    ),
  );
}

function containsAffirmativeMarker(
  value: string,
  definition: CafeSpeechIntentDefinition,
) {
  const rule = getLinguisticRule(definition);
  const markers = [
    ...definition.fuzzyPolarityTokens,
    ...(rule?.affirmativeMarkers || []),
  ];

  return markers.some((marker) => {
    const normalizedMarker = normalizeKoreanSpeech(marker);
    if (normalizedMarker === "요") {
      return /^(?:은|는|이|가|을|를|에|로|으로)?요$/u.test(value);
    }
    if (normalizedMarker.length === 1) {
      return value === normalizedMarker || value.startsWith(normalizedMarker);
    }
    return value.includes(normalizedMarker);
  });
}

const SOFT_NEGATION_TOKENS = new Set([
  ...NEGATION_TOKENS,
  "괜찮",
  "필요없",
  "안받",
  "안주",
]);

function isConceptExplicitlyNegated(
  value: string,
  concepts: readonly string[],
) {
  return concepts.some((concept) => {
    const normalizedConcept = normalizeKoreanSpeech(concept);
    const index = value.indexOf(normalizedConcept);
    if (index < 0) return false;

    const suffix = value.slice(index + normalizedConcept.length);
    return /^(?:은|는|이|가|을|를|에|로|으로)?(?:아|어|해)?요?(?:말고|아니고|아니라|빼고|안|하지마|하지말|하지않)/u.test(
      suffix,
    );
  });
}

function containsActionNegation(value: string) {
  return (
    containsAnyToken(value, [
      "지않",
      "지마",
      "하지마",
      "지말",
      "말아",
      "필요없",
      "안받",
      "안주",
      "안할",
      "못",
      "없어요",
      "없습니다",
      "괜찮",
      "아니요",
    ]) ||
    /안(?:주|줘|받|하|먹|가|필요|결제|계산|포장|말)/u.test(value)
  );
}

function isDefinitionBlocked(
  value: string,
  definition: CafeSpeechIntentDefinition,
  observedConcepts: readonly string[] = [],
) {
  const rule = getLinguisticRule(definition);
  const concepts = [
    ...(rule?.conceptTokens || []),
    ...definition.fuzzyKeywords,
    ...observedConcepts,
  ];
  const hardForbidden = definition.forbiddenTokens.filter(
    (token) => !SOFT_NEGATION_TOKENS.has(normalizeKoreanSpeech(token)),
  );
  const activeHardForbidden = hardForbidden.filter(
    (token) => !isConceptExplicitlyNegated(value, [token]),
  );
  const explicitlyNegatedForbidden = definition.forbiddenTokens.filter(
    (token) => isConceptExplicitlyNegated(value, [token]),
  );
  const polarityContext = [
    ...observedConcepts,
    ...explicitlyNegatedForbidden,
  ].reduce(
    (context, concept) =>
      context.replaceAll(normalizeKoreanSpeech(concept), ""),
    value,
  );

  if (isConceptExplicitlyNegated(value, concepts)) return true;

  if (rule?.polarity === "negative") {
    return containsActionNegation(polarityContext)
      ? false
      : containsAnyToken(value, activeHardForbidden);
  }

  if (containsAnyToken(value, activeHardForbidden)) return true;
  return containsActionNegation(polarityContext);
}

function matchesExplicitVariant(value: string, variants: readonly string[]) {
  return variants.some((variant) => value === normalizeKoreanSpeech(variant));
}

function findIntentDefinition(choiceId: string) {
  return CAFE_SPEECH_INTENTS.find((intent) =>
    intent.choiceIds.includes(choiceId),
  );
}

function getAvailableIntentDefinitions(choices: readonly CafeSpeechChoice[]) {
  return Array.from(
    new Map(
      choices
        .map((choice) => findIntentDefinition(choice.id))
        .filter(
          (definition): definition is CafeSpeechIntentDefinition =>
            !!definition,
        )
        .map((definition) => [definition.id, definition]),
    ).values(),
  );
}

function getContextSignals(
  normalizedTranscript: string,
  definition: CafeSpeechIntentDefinition,
) {
  const signals: CafeSpeechRecoverySignal[] = [];

  if (containsCompatiblePredicate(normalizedTranscript, definition)) {
    signals.push("compatible-predicate");
  }
  if (containsCoherentClassifier(normalizedTranscript, definition)) {
    signals.push("coherent-classifier");
  }
  if (containsQuantityWithClassifier(normalizedTranscript)) {
    signals.push("quantity-marker");
  }
  if (containsAffirmativeMarker(normalizedTranscript, definition)) {
    signals.push("polarity-marker");
  }

  return signals;
}

function hasConvergingContext(
  signals: readonly CafeSpeechRecoverySignal[],
) {
  return signals.some((signal) =>
    [
      "compatible-predicate",
      "coherent-classifier",
      "polarity-marker",
    ].includes(signal),
  );
}

function scoreRecovery(
  syllableDistance: number,
  contextSignals: readonly CafeSpeechRecoverySignal[],
  alteredSyllables = 1,
) {
  const contextScore = contextSignals.reduce((score, signal) => {
    if (signal === "compatible-predicate") return score + 2;
    if (signal === "coherent-classifier") return score + 2;
    if (signal === "quantity-marker") return score + 0.75;
    if (signal === "polarity-marker") return score + 1.5;
    return score;
  }, 0);

  return Number(
    (
      Math.max(0, 4 - syllableDistance * 2) +
      contextScore +
      0.5 -
      Math.max(0, alteredSyllables - 1) * 3
    ).toFixed(2),
  );
}

function buildRecoveryEvent(
  definition: CafeSpeechIntentDefinition,
  expectedKeyword: string,
  observedKeyword: string,
  syllableDistance: number,
  contextSignals: readonly CafeSpeechRecoverySignal[],
  alteredSyllables = 1,
): CafeSpeechRecoveryEvent {
  return {
    eventName: "cafe_speech_probable_transcription_error",
    intentId: definition.id,
    canonical: definition.canonical,
    expectedKeyword,
    observedKeyword,
    syllableDistance: Number(syllableDistance.toFixed(2)),
    alteredSyllables,
    score: scoreRecovery(syllableDistance, contextSignals, alteredSyllables),
    signals: ["keyword-proximity", ...contextSignals, "node-available"],
  };
}

function applyContextualConfusions(
  normalizedTranscript: string,
  definitions: readonly CafeSpeechIntentDefinition[],
) {
  let correctedTranscript = normalizedTranscript;
  const recoveryEvents = new Map<string, CafeSpeechRecoveryEvent>();

  for (const definition of definitions) {
    let intentCandidate = normalizedTranscript;
    const appliedConfusions: CafeSpeechConfusion[] = [];
    let keywordAlterations = 0;

    for (const confusion of definition.speechConfusions) {
      const from = normalizeKoreanSpeech(confusion.from);
      if (!intentCandidate.includes(from)) continue;
      if (
        getCafeSyllableDistance(confusion.from, confusion.to) >
        CAFE_SPEECH_MAX_KEYWORD_DISTANCE
      ) {
        continue;
      }

      intentCandidate = intentCandidate.replaceAll(
        from,
        normalizeKoreanSpeech(confusion.to),
      );
      appliedConfusions.push(confusion);
      if (
        definition.fuzzyKeywords.some((keyword) =>
          normalizeKoreanSpeech(keyword).includes(
            normalizeKoreanSpeech(confusion.to),
          ),
        )
      ) {
        keywordAlterations += getCafeSyllableDistanceDetails(
          confusion.from,
          confusion.to,
        ).alteredSyllables;
      }
    }

    if (appliedConfusions.length === 0) continue;

    const contextSignals = getContextSignals(
      normalizedTranscript,
      definition,
    );
    const hasExpectedKeyword = definition.fuzzyKeywords.some((keyword) =>
      includesNormalized(normalizedTranscript, keyword),
    );

    const isPlausibleForIntent =
      intentCandidate === normalizeKoreanSpeech(definition.canonical) ||
      matchesExplicitVariant(intentCandidate, definition.validVariants) ||
      !!findGrammarRule(intentCandidate, definition) ||
      (containsAnyToken(intentCandidate, definition.requiredTokens) &&
        contextSignals.length > 0);

    if (
      !isPlausibleForIntent ||
      (!hasExpectedKeyword && contextSignals.length === 0) ||
      isDefinitionBlocked(normalizedTranscript, definition, [
        ...appliedConfusions.map(({ from }) => from),
      ])
    ) {
      continue;
    }

    const primaryConfusion = appliedConfusions[0];
    recoveryEvents.set(
      definition.id,
      buildRecoveryEvent(
        definition,
        primaryConfusion.to,
        primaryConfusion.from,
        getCafeSyllableDistance(primaryConfusion.from, primaryConfusion.to),
        contextSignals,
        Math.max(1, keywordAlterations),
      ),
    );
    for (const confusion of appliedConfusions) {
      correctedTranscript = correctedTranscript.replaceAll(
        normalizeKoreanSpeech(confusion.from),
        normalizeKoreanSpeech(confusion.to),
      );
    }
  }

  return { correctedTranscript, recoveryEvents };
}

function matchesChoiceAsValid(
  normalizedTranscript: string,
  choice: CafeSpeechChoice,
) {
  if (normalizedTranscript === normalizeKoreanSpeech(choice.korean)) return true;

  const definition = findIntentDefinition(choice.id);
  return definition
    ? matchesExplicitVariant(normalizedTranscript, definition.validVariants)
    : false;
}

function findGrammarRule(
  normalizedTranscript: string,
  definition?: CafeSpeechIntentDefinition,
) {
  return definition?.recoverableGrammarErrors.find(({ variants }) =>
    matchesExplicitVariant(normalizedTranscript, variants),
  );
}

function findChoiceForDefinition(
  definition: CafeSpeechIntentDefinition,
  choices: readonly CafeSpeechChoice[],
) {
  return choices.find((choice) => definition.choiceIds.includes(choice.id));
}

function isProductOrderNode(choices: readonly CafeSpeechChoice[]) {
  return choices.some((choice) => !!choice.orderProduct);
}

function findMentionedProducts(normalizedTranscript: string) {
  return CAFE_PRODUCT_MENTIONS.filter(({ aliases }) =>
    aliases.some((alias) => includesNormalized(normalizedTranscript, alias)),
  );
}

function isTerseProductAnswer(
  normalizedTranscript: string,
  aliases: readonly string[],
) {
  return aliases.some((alias) => {
    const normalizedAlias = normalizeKoreanSpeech(alias);
    return (
      normalizedTranscript === normalizedAlias ||
      normalizedTranscript === `${normalizedAlias}요` ||
      normalizedTranscript === `${normalizedAlias}이요`
    );
  });
}

function findProductChoiceFromUniqueMention(
  normalizedTranscript: string,
  choices: readonly CafeSpeechChoice[],
) {
  const mentionedProducts = findMentionedProducts(normalizedTranscript);
  if (mentionedProducts.length !== 1) return null;

  const product = mentionedProducts[0];
  const definition = CAFE_SPEECH_INTENTS.find(
    ({ id }) => id === `${product.id}-order`,
  );
  if (
    !definition ||
    isDefinitionBlocked(normalizedTranscript, definition, product.aliases) ||
    containsAnyToken(normalizedTranscript, UNAVAILABLE_PRODUCT_MARKERS)
  ) {
    return null;
  }

  if (
    !containsAnyToken(normalizedTranscript, ORDER_ACTION_TOKENS) &&
    !isTerseProductAnswer(normalizedTranscript, product.aliases)
  ) {
    return null;
  }


  const nearbyFullKeyword = findBestKeywordMatch(
    normalizedTranscript,
    definition.fuzzyKeywords,
  );
  if (
    nearbyFullKeyword &&
    product.aliases.some(
      (alias) =>
        includesNormalized(normalizedTranscript, alias) &&
        normalizeKoreanSpeech(alias).length <
          normalizeKoreanSpeech(nearbyFullKeyword.keyword).length,
    )
  ) {
    return null;
  }

  const choice = choices.find(({ orderProduct }) => orderProduct === product.id);
  return choice ? { choice, definition, feedback: product.feedback } : null;
}

function hasIntentConceptEvidence(
  normalizedTranscript: string,
  definition: CafeSpeechIntentDefinition,
) {
  if (
    definition.id === "receipt-yes" &&
    (normalizedTranscript.startsWith("네") ||
      normalizedTranscript.startsWith("예"))
  ) {
    return true;
  }

  const linguisticRule = getLinguisticRule(definition);
  const exactConcepts = [
    ...(linguisticRule?.conceptTokens || []),
    ...definition.fuzzyKeywords,
  ].filter((concept) => includesNormalized(normalizedTranscript, concept));
  if (
    exactConcepts.some(
      (concept) =>
        !isConceptExplicitlyNegated(normalizedTranscript, [concept]),
    )
  ) {
    return true;
  }

  const keywordMatch = findBestKeywordMatch(
    normalizedTranscript,
    definition.fuzzyKeywords,
  );
  if (
    !keywordMatch ||
    isConceptExplicitlyNegated(normalizedTranscript, [keywordMatch.observed])
  ) {
    return false;
  }

  const syllables = [...normalizedTranscript];
  const contextTranscript = [
    ...syllables.slice(0, keywordMatch.start),
    ...syllables.slice(keywordMatch.end),
  ].join("");
  return hasConvergingContext(
    getContextSignals(contextTranscript, definition),
  );
}

function findContradictionFeedback(
  normalizedTranscript: string,
  definitions: readonly CafeSpeechIntentDefinition[],
) {
  const availableIds = new Set(definitions.map(({ id }) => id));
  const hasEvidence = (intentId: string) => {
    const definition = definitions.find(({ id }) => id === intentId);
    return !!definition && hasIntentConceptEvidence(normalizedTranscript, definition);
  };

  if (
    availableIds.has("eat-here") &&
    availableIds.has("takeout") &&
    hasEvidence("eat-here") &&
    hasEvidence("takeout")
  ) {
    return AMBIGUOUS_CONSUMPTION_FEEDBACK;
  }

  if (
    availableIds.has("card-payment") &&
    availableIds.has("cash-payment") &&
    hasEvidence("card-payment") &&
    hasEvidence("cash-payment")
  ) {
    return AMBIGUOUS_PAYMENT_FEEDBACK;
  }

  const hasReceiptYes =
    availableIds.has("receipt-yes") &&
    ((normalizedTranscript.startsWith("네") ||
      normalizedTranscript.startsWith("예")) ||
      includesNormalized(normalizedTranscript, "주세요") ||
      (includesNormalized(normalizedTranscript, "필요해") &&
        !includesNormalized(normalizedTranscript, "필요없")) ||
      (containsAnyToken(normalizedTranscript, ["받을게", "받겠", "받아"]) &&
        !includesNormalized(normalizedTranscript, "안받")));
  const hasReceiptNo =
    availableIds.has("receipt-no") && hasEvidence("receipt-no");

  return hasReceiptYes && hasReceiptNo
    ? AMBIGUOUS_RECEIPT_FEEDBACK
    : null;
}

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const HANGUL_VOWEL_COUNT = 21;
const HANGUL_FINAL_COUNT = 28;

const CLOSE_INITIAL_GROUPS = [
  [0, 1, 15], // ㄱ / ㄲ / ㅋ
  [3, 4, 16], // ㄷ / ㄸ / ㅌ
  [7, 8, 17], // ㅂ / ㅃ / ㅍ
  [12, 13, 14], // ㅈ / ㅉ / ㅊ
  [9, 10], // ㅅ / ㅆ
  [2, 5], // ㄴ / ㄹ
] as const;

const CLOSE_VOWEL_GROUPS = [
  [4, 8], // ㅓ / ㅗ
  [1, 5], // ㅐ / ㅔ
  [3, 7], // ㅒ / ㅖ
  [10, 11, 15], // ㅙ / ㅚ / ㅞ
  [13, 18], // ㅜ / ㅡ
  [2, 6], // ㅑ / ㅕ
  [12, 17], // ㅛ / ㅠ
  [0, 8, 9], // ㅏ / ㅗ / ㅘ
  [4, 13, 14], // ㅓ / ㅜ / ㅝ
  [13, 16, 20], // ㅜ / ㅟ / ㅣ
  [18, 19, 20], // ㅡ / ㅢ / ㅣ
] as const;

function valuesShareGroup(
  left: number,
  right: number,
  groups: readonly (readonly number[])[],
) {
  return groups.some(
    (group) => group.includes(left) && group.includes(right),
  );
}

function decomposeHangulSyllable(value: string) {
  const codePoint = value.codePointAt(0);
  if (codePoint === undefined || codePoint < HANGUL_BASE || codePoint > HANGUL_END) {
    return null;
  }

  const offset = codePoint - HANGUL_BASE;
  return {
    initial: Math.floor(offset / (HANGUL_VOWEL_COUNT * HANGUL_FINAL_COUNT)),
    vowel: Math.floor(offset / HANGUL_FINAL_COUNT) % HANGUL_VOWEL_COUNT,
    final: offset % HANGUL_FINAL_COUNT,
  };
}

function syllableSubstitutionCost(left: string, right: string) {
  if (left === right) return 0;

  const a = decomposeHangulSyllable(left);
  const b = decomposeHangulSyllable(right);
  if (!a || !b) return 1;

  const initialCost =
    a.initial === b.initial
      ? 0
      : valuesShareGroup(a.initial, b.initial, CLOSE_INITIAL_GROUPS)
        ? 0.3
        : 0.65;
  const vowelCost =
    a.vowel === b.vowel
      ? 0
      : valuesShareGroup(a.vowel, b.vowel, CLOSE_VOWEL_GROUPS)
        ? 0.3
        : 0.65;
  const finalCost = a.final === b.final ? 0 : 0.35;

  return initialCost + vowelCost + finalCost;
}

export function getCafeSyllableDistanceDetails(left: string, right: string) {
  const a = [...normalizeKoreanSpeech(left)];
  const b = [...normalizeKoreanSpeech(right)];
  const previous = Array.from({ length: b.length + 1 }, (_, index) => ({
    distance: index,
    alteredSyllables: index,
  }));

  const chooseBest = (
    candidates: readonly { distance: number; alteredSyllables: number }[],
  ) =>
    candidates.reduce((best, candidate) => {
      if (candidate.distance < best.distance) return candidate;
      if (
        candidate.distance === best.distance &&
        candidate.alteredSyllables < best.alteredSyllables
      ) {
        return candidate;
      }
      return best;
    });

  for (let row = 1; row <= a.length; row += 1) {
    const current = [{ distance: row, alteredSyllables: row }];
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = syllableSubstitutionCost(
        a[row - 1],
        b[column - 1],
      );
      current[column] = chooseBest([
        {
          distance: current[column - 1].distance + 1,
          alteredSyllables: current[column - 1].alteredSyllables + 1,
        },
        {
          distance: previous[column].distance + 1,
          alteredSyllables: previous[column].alteredSyllables + 1,
        },
        {
          distance: previous[column - 1].distance + substitutionCost,
          alteredSyllables:
            previous[column - 1].alteredSyllables +
            (substitutionCost === 0 ? 0 : 1),
        },
      ]);
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

export function getCafeSyllableDistance(left: string, right: string) {
  return getCafeSyllableDistanceDetails(left, right).distance;
}

type CafeSpeechKeywordMatch = {
  keyword: string;
  observed: string;
  distance: number;
  alteredSyllables: number;
  start: number;
  end: number;
};

type CafeSpeechFuzzyCandidate = {
  definition: CafeSpeechIntentDefinition;
  keywordMatch: CafeSpeechKeywordMatch;
  contextSignals: readonly CafeSpeechRecoverySignal[];
  score: number;
  blocked: boolean;
  realWordCollision: boolean;
  hasUnrelatedContext: boolean;
};

function hasSubstantialUnrelatedContext(value: string) {
  const neutralRemainder = value.replace(
    /(으로|에서|이요|은|는|이|가|을|를|에|로|만|도|요|해)/gu,
    "",
  );
  return neutralRemainder.length > 0;
}

function findBestKeywordMatch(
  normalizedTranscript: string,
  keywords: readonly string[],
) {
  const transcriptSyllables = [...normalizedTranscript];
  let bestMatch: CafeSpeechKeywordMatch | null = null;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeKoreanSpeech(keyword);
    const keywordLength = [...normalizedKeyword].length;
    if (keywordLength < 2) continue;
    if (normalizedTranscript.includes(normalizedKeyword)) continue;

    const minimumLength =
      keywordLength <= 2 ? keywordLength : keywordLength - 1;
    const maximumLength = keywordLength + 1;

    for (let length = minimumLength; length <= maximumLength; length += 1) {
      for (
        let start = 0;
        start + length <= transcriptSyllables.length;
        start += 1
      ) {
        const observed = transcriptSyllables.slice(start, start + length).join("");
        const { distance, alteredSyllables } = getCafeSyllableDistanceDetails(
          observed,
          normalizedKeyword,
        );
        if (
          distance === 0 ||
          distance > CAFE_SPEECH_MAX_KEYWORD_DISTANCE
        ) {
          continue;
        }

        if (
          !bestMatch ||
          distance < bestMatch.distance ||
          (distance === bestMatch.distance &&
            alteredSyllables < bestMatch.alteredSyllables) ||
          (distance === bestMatch.distance &&
            alteredSyllables === bestMatch.alteredSyllables &&
            keywordLength > [...bestMatch.keyword].length)
        ) {
          bestMatch = {
            keyword,
            observed,
            distance,
            alteredSyllables,
            start,
            end: start + length,
          };
        }
      }
    }
  }

  return bestMatch;
}

function findFuzzyCandidates(
  normalizedTranscript: string,
  definitions: readonly CafeSpeechIntentDefinition[],
) {
  return definitions.flatMap((definition): CafeSpeechFuzzyCandidate[] => {
    const keywordMatch = findBestKeywordMatch(
      normalizedTranscript,
      definition.fuzzyKeywords,
    );
    if (!keywordMatch || keywordMatch.distance === 0) return [];

    const transcriptSyllables = [...normalizedTranscript];
    const contextTranscript = [
      ...transcriptSyllables.slice(0, keywordMatch.start),
      ...transcriptSyllables.slice(keywordMatch.end),
    ].join("");
    const contextSignals = getContextSignals(contextTranscript, definition);

    return [
      {
        definition,
        keywordMatch,
        contextSignals,
        score: scoreRecovery(
          keywordMatch.distance,
          contextSignals,
          keywordMatch.alteredSyllables,
        ),
        blocked: isDefinitionBlocked(normalizedTranscript, definition, [
          keywordMatch.observed,
        ]),
        realWordCollision: definition.fuzzyRealWordCollisions.some(
          (collision) =>
            normalizeKoreanSpeech(collision) === keywordMatch.observed,
        ),
        hasUnrelatedContext:
          contextSignals.length === 0 &&
          hasSubstantialUnrelatedContext(contextTranscript),
      },
    ];
  });
}

type CafeSpeechSemanticCandidate = {
  definition: CafeSpeechIntentDefinition;
  choice: CafeSpeechChoice;
  concept: string | null;
  contextSignals: readonly CafeSpeechRecoverySignal[];
  hasIncoherentClassifier: boolean;
  isTerse: boolean;
  score: number;
};

function findExactConcept(
  value: string,
  definition: CafeSpeechIntentDefinition,
) {
  const rule = getLinguisticRule(definition);
  if (!rule) return null;

  return (
    [...rule.conceptTokens]
      .sort(
        (left, right) =>
          normalizeKoreanSpeech(right).length -
          normalizeKoreanSpeech(left).length,
      )
      .find((concept) => includesNormalized(value, concept)) || null
  );
}

function removeFirstNormalized(value: string, token: string) {
  const normalizedToken = normalizeKoreanSpeech(token);
  const index = value.indexOf(normalizedToken);
  if (index < 0) return value;
  return `${value.slice(0, index)}${value.slice(index + normalizedToken.length)}`;
}

function isTerseConceptAnswer(value: string, concept: string) {
  const remainder = removeFirstNormalized(value, concept).replace(
    /(?:은|는|이|가|을|를|에|로|으로|와|과|랑|하고|입니다|이에요|예요|이요|요|다|습니다)+/gu,
    "",
  );
  return remainder.length === 0;
}

function isMarkerOnlyAnswer(
  value: string,
  definition: CafeSpeechIntentDefinition,
) {
  const rule = getLinguisticRule(definition);
  if (!rule || !definition.id.startsWith("receipt-")) return false;

  return rule.affirmativeMarkers.some((marker) => {
    const normalizedMarker = normalizeKoreanSpeech(marker);
    if (!value.startsWith(normalizedMarker)) return false;
    const remainder = value.slice(normalizedMarker.length);
    return /^(?:요|입니다|이에요|예요)?$/u.test(remainder);
  });
}

function findSemanticCandidates(
  normalizedTranscript: string,
  definitions: readonly CafeSpeechIntentDefinition[],
  choices: readonly CafeSpeechChoice[],
) {
  return definitions.flatMap(
    (definition): CafeSpeechSemanticCandidate[] => {
      const rule = getLinguisticRule(definition);
      const choice = findChoiceForDefinition(definition, choices);
      if (!rule || !choice) return [];

      const concept = findExactConcept(normalizedTranscript, definition);
      const contextTranscript = concept
        ? removeFirstNormalized(normalizedTranscript, concept)
        : normalizedTranscript;
      const contextSignals = getContextSignals(
        contextTranscript,
        definition,
      );
      const standalonePredicate =
        !concept &&
        rule.standalonePredicateFamilies?.some((familyId) =>
          matchesMorphologyFamily(normalizedTranscript, familyId),
        );
      const nearbyKeyword = findBestKeywordMatch(
        normalizedTranscript,
        definition.fuzzyKeywords,
      );
      const markerOnly =
        !concept && isMarkerOnlyAnswer(normalizedTranscript, definition);
      const isTerse =
        !!concept &&
        rule.allowTerseConcept &&
        isTerseConceptAnswer(normalizedTranscript, concept);

      if (
        (!concept && !standalonePredicate && !markerOnly) ||
        (!!nearbyKeyword && !!standalonePredicate) ||
        (!!nearbyKeyword &&
          !!concept &&
          normalizeKoreanSpeech(concept).length <
            normalizeKoreanSpeech(nearbyKeyword.keyword).length) ||
        isDefinitionBlocked(
          normalizedTranscript,
          definition,
          concept ? [concept] : [],
        )
      ) {
        return [];
      }

      const hasIndependentContext =
        definition.id === "repeat"
          ? rule.predicateFamilies.some((familyId) =>
              matchesMorphologyFamily(contextTranscript, familyId),
            )
          : hasConvergingContext(contextSignals);
      if (
        concept &&
        !hasIndependentContext &&
        !isTerse &&
        !standalonePredicate
      ) {
        return [];
      }

      const hasAnyClassifier = containsAnyToken(
        normalizedTranscript,
        CAFE_CLASSIFIERS,
      );
      const hasIncoherentClassifier =
        hasAnyClassifier &&
        (rule.coherentClassifiers.length === 0 ||
          !containsAnyToken(
            normalizedTranscript,
            rule.coherentClassifiers,
          ));
      const score =
        (concept ? 4 : 0) +
        (standalonePredicate ? 4 : 0) +
        (markerOnly ? 4 : 0) +
        (isTerse ? 1 : 0) +
        contextSignals.reduce((total, signal) => {
          if (signal === "compatible-predicate") return total + 2;
          if (signal === "coherent-classifier") return total + 2;
          if (signal === "quantity-marker") return total + 0.5;
          if (signal === "polarity-marker") return total + 1;
          return total;
        }, 0);

      return [
        {
          definition,
          choice,
          concept,
          contextSignals,
          hasIncoherentClassifier,
          isTerse,
          score,
        },
      ];
    },
  );
}

function getSemanticCandidateFeedback(
  candidate: CafeSpeechSemanticCandidate,
) {
  if (candidate.hasIncoherentClassifier || candidate.isTerse) {
    return candidate.definition.correctionMessage;
  }
  return null;
}

function buildTranscriptionFeedback(definition: CafeSpeechIntentDefinition) {
  return `Intention comprise, mais un mot a probablement été mal reconnu. Formulation recommandée : “${definition.canonical}”`;
}

function getAmbiguityFeedback(
  definitions: readonly CafeSpeechIntentDefinition[],
) {
  const messages = Array.from(
    new Set(definitions.map(({ ambiguityMessage }) => ambiguityMessage)),
  );
  return messages.length === 1
    ? messages[0]
    : "La transcription reste compatible avec plusieurs intentions. Reformule avec un seul choix.";
}

function joinFrenchOptions(options: readonly string[]) {
  if (options.length <= 1) return options[0] || "utilise les choix proposés";
  if (options.length === 2) return `${options[0]} ou ${options[1]}`;
  return `${options.slice(0, -1).join(", ")} ou ${options.at(-1)}`;
}

function buildCafeOutOfScopeFeedback(
  choices: readonly CafeSpeechChoice[],
  detectedIntent?: CafeSpeechIntentDefinition,
) {
  if (isProductOrderNode(choices)) return UNAVAILABLE_PRODUCT_FEEDBACK;

  const availableInstructions = getAvailableIntentDefinitions(choices)
    .filter(({ includeInUnavailableFeedback }) =>
      includeInUnavailableFeedback !== false,
    )
    .map(({ helpLabel }) => helpLabel);
  const instruction = joinFrenchOptions(availableInstructions);

  if (detectedIntent) {
    return `${detectedIntent.meaning}. Cette intention n’est pas disponible ici. À cette étape, ${instruction}.`;
  }

  return `Cette réponse ne correspond à aucune option disponible à cette étape. Tu peux ${instruction}, recommencer ou utiliser l’aide.`;
}

export function buildCafeUnavailableFeedback(
  choices: readonly CafeSpeechChoice[],
) {
  return buildCafeOutOfScopeFeedback(choices);
}

export function recordCafeSpeechRecoveryEvent(
  nodeId: string,
  event: CafeSpeechRecoveryEvent,
) {
  const record = { ...event, nodeId };
  console.info("[cafe-speech-recovery]", record);
  return record;
}

export function matchCafeSpeechIntent(
  transcript: string,
  choices: readonly CafeSpeechChoice[],
): CafeSpeechIntentMatch {
  const rawNormalizedTranscript = normalizeKoreanSpeech(transcript);
  if (!rawNormalizedTranscript) {
    return {
      reason: "empty",
      choice: null,
      feedback: "Aucune réponse n’a été reconnue. Recommence.",
    };
  }

  const availableDefinitions = getAvailableIntentDefinitions(choices);
  const { correctedTranscript, recoveryEvents } =
    applyContextualConfusions(rawNormalizedTranscript, availableDefinitions);

  const contradictionFeedback = findContradictionFeedback(
    correctedTranscript,
    availableDefinitions,
  );
  if (contradictionFeedback) {
    return {
      reason: "ambiguous",
      choice: null,
      feedback: contradictionFeedback,
    };
  }

  const contextualFuzzyCandidates = findFuzzyCandidates(
    rawNormalizedTranscript,
    availableDefinitions,
  )
    .filter(
      ({ blocked, hasUnrelatedContext }) =>
        !blocked && !hasUnrelatedContext,
    )
    .sort((left, right) => right.score - left.score);
  const [earlyBestCandidate, earlySecondCandidate] =
    contextualFuzzyCandidates;
  const evidencedIntentIds = new Set(
    contextualFuzzyCandidates
      .filter(({ contextSignals }) => contextSignals.length > 0)
      .map(({ definition }) => definition.id),
  );
  for (const definition of availableDefinitions) {
    if (
      definition.fuzzyKeywords.some((keyword) =>
        includesNormalized(rawNormalizedTranscript, keyword),
      ) &&
      !isDefinitionBlocked(rawNormalizedTranscript, definition) &&
      getContextSignals(rawNormalizedTranscript, definition).length > 0
    ) {
      evidencedIntentIds.add(definition.id);
    }
  }
  if (evidencedIntentIds.size > 1) {
    const evidencedDefinitions = availableDefinitions.filter(({ id }) =>
      evidencedIntentIds.has(id),
    );
    return {
      reason: "ambiguous",
      choice: null,
      feedback: getAmbiguityFeedback(evidencedDefinitions),
    };
  }
  if (
    earlyBestCandidate?.contextSignals.length &&
    earlySecondCandidate?.contextSignals.length &&
    earlyBestCandidate.score - earlySecondCandidate.score < 1
  ) {
    return {
      reason: "ambiguous",
      choice: null,
      feedback: getAmbiguityFeedback([
        earlyBestCandidate.definition,
        earlySecondCandidate.definition,
      ]),
    };
  }

  const validChoices = choices.filter((choice) => {
    const definition = findIntentDefinition(choice.id);
    return (
      matchesChoiceAsValid(correctedTranscript, choice) &&
      (!definition ||
        !isDefinitionBlocked(rawNormalizedTranscript, definition))
    );
  });
  if (validChoices.length === 1) {
    const choice = validChoices[0];
    const definition = findIntentDefinition(choice.id);
    const recoveryEvent = definition
      ? recoveryEvents.get(definition.id)
      : undefined;
    if (
      definition &&
      recoveryEvent &&
      recoveryEvent.alteredSyllables >
        CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS
    ) {
      return {
        reason: "uncertain",
        choice,
        confirmationLabel: definition.confirmationLabel,
        feedback: `Intention probablement comprise. Tu voulais dire « ${definition.confirmationLabel} » ?`,
      };
    }
    return {
      reason: "matched",
      choice,
      feedback: definition && recoveryEvent
        ? buildTranscriptionFeedback(definition)
        : null,
      ...(recoveryEvent ? { recoveryEvent } : {}),
    };
  }
  if (validChoices.length > 1) {
    return {
      reason: "ambiguous",
      choice: null,
      feedback:
        findIntentDefinition(validChoices[0].id)?.ambiguityMessage ||
        "J’ai reconnu plusieurs intentions. Choisis une seule réponse.",
    };
  }

  const grammarMatches = choices.flatMap((choice) => {
    const definition = findIntentDefinition(choice.id);
    const rule = findGrammarRule(correctedTranscript, definition);
    return definition &&
      rule &&
      !isDefinitionBlocked(rawNormalizedTranscript, definition)
      ? [{ choice, definition, rule }]
      : [];
  });
  if (grammarMatches.length === 1) {
    const [{ choice, definition, rule }] = grammarMatches;
    const recoveryEvent = recoveryEvents.get(definition.id);
    if (
      recoveryEvent &&
      recoveryEvent.alteredSyllables >
        CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS
    ) {
      return {
        reason: "uncertain",
        choice,
        confirmationLabel: definition.confirmationLabel,
        feedback: `Intention probablement comprise. Tu voulais dire « ${definition.confirmationLabel} » ?`,
      };
    }
    return {
      reason: "matched",
      choice,
      feedback: recoveryEvent
        ? buildTranscriptionFeedback(definition)
        : rule.feedback,
      ...(recoveryEvent ? { recoveryEvent } : {}),
    };
  }

  const semanticCandidates = findSemanticCandidates(
    correctedTranscript,
    availableDefinitions,
    choices,
  ).sort((left, right) => right.score - left.score);
  if (semanticCandidates.length > 1) {
    return {
      reason: "ambiguous",
      choice: null,
      feedback: getAmbiguityFeedback(
        semanticCandidates.map(({ definition }) => definition),
      ),
    };
  }
  if (semanticCandidates.length === 1) {
    const [candidate] = semanticCandidates;
    const recoveryEvent = recoveryEvents.get(candidate.definition.id);
    if (
      recoveryEvent &&
      recoveryEvent.alteredSyllables >
        CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS
    ) {
      return {
        reason: "uncertain",
        choice: candidate.choice,
        confirmationLabel: candidate.definition.confirmationLabel,
        feedback: `Intention probablement comprise. Tu voulais dire « ${candidate.definition.confirmationLabel} » ?`,
      };
    }

    return {
      reason: "matched",
      choice: candidate.choice,
      feedback: recoveryEvent
        ? buildTranscriptionFeedback(candidate.definition)
        : getSemanticCandidateFeedback(candidate),
      ...(recoveryEvent ? { recoveryEvent } : {}),
    };
  }

  if (isProductOrderNode(choices)) {
    const mentionedProducts = findMentionedProducts(correctedTranscript);
    if (mentionedProducts.length > 1) {
      return {
        reason: "ambiguous",
        choice: null,
        feedback: AMBIGUOUS_PRODUCT_FEEDBACK,
      };
    }

    const productMatch = findProductChoiceFromUniqueMention(
      correctedTranscript,
      choices,
    );
    if (productMatch) {
      const recoveryEvent = recoveryEvents.get(productMatch.definition.id);
      if (
        recoveryEvent &&
        recoveryEvent.alteredSyllables >
          CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS
      ) {
        return {
          reason: "uncertain",
          choice: productMatch.choice,
          confirmationLabel: productMatch.definition.confirmationLabel,
          feedback: `Intention probablement comprise. Tu voulais dire « ${productMatch.definition.confirmationLabel} » ?`,
        };
      }
      return {
        reason: "matched",
        choice: productMatch.choice,
        feedback: recoveryEvent
          ? buildTranscriptionFeedback(productMatch.definition)
          : productMatch.feedback,
        ...(recoveryEvent ? { recoveryEvent } : {}),
      };
    }
  }

  const paymentDefinitions = availableDefinitions.filter(({ id }) =>
    id === "card-payment" || id === "cash-payment",
  );
  const paymentMatches = paymentDefinitions.filter((definition) => {
    return (
      containsAnyToken(correctedTranscript, definition.requiredTokens) &&
      !isDefinitionBlocked(correctedTranscript, definition) &&
      containsAnyToken(correctedTranscript, [
        "결제",
        "계산",
        "할게",
        "하겠",
        "낼게",
        "부탁",
        "이요",
      ])
    );
  });
  if (paymentMatches.length === 1) {
    const definition = paymentMatches[0];
    const choice = findChoiceForDefinition(definition, choices);
    if (choice) {
      const recoveryEvent = recoveryEvents.get(definition.id);
      if (
        recoveryEvent &&
        recoveryEvent.alteredSyllables >
          CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS
      ) {
        return {
          reason: "uncertain",
          choice,
          confirmationLabel: definition.confirmationLabel,
          feedback: `Intention probablement comprise. Tu voulais dire « ${definition.confirmationLabel} » ?`,
        };
      }
      return {
        reason: "matched",
        choice,
        feedback: recoveryEvent
          ? buildTranscriptionFeedback(definition)
          : null,
        ...(recoveryEvent ? { recoveryEvent } : {}),
      };
    }
  }

  const fuzzyCandidates = contextualFuzzyCandidates.filter(
    ({ contextSignals }) => hasConvergingContext(contextSignals),
  );

  if (fuzzyCandidates.length > 0) {
    const [bestCandidate, secondCandidate] = fuzzyCandidates;
    if (
      secondCandidate &&
      bestCandidate.score - secondCandidate.score < 1
    ) {
      return {
        reason: "ambiguous",
        choice: null,
        feedback: getAmbiguityFeedback([
          bestCandidate.definition,
          secondCandidate.definition,
        ]),
      };
    }

    const { definition, keywordMatch, contextSignals, realWordCollision } =
      bestCandidate;
    const choice = findChoiceForDefinition(definition, choices);
    if (choice) {
      if (
        realWordCollision ||
        keywordMatch.alteredSyllables >
          CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS
      ) {
        return {
          reason: "uncertain",
          choice,
          confirmationLabel: definition.confirmationLabel,
          feedback: `Intention probablement comprise. Tu voulais dire « ${definition.confirmationLabel} » ?`,
        };
      }

      const recoveryEvent = buildRecoveryEvent(
        definition,
        keywordMatch.keyword,
        keywordMatch.observed,
        keywordMatch.distance,
        contextSignals,
        keywordMatch.alteredSyllables,
      );
      return {
        reason: "matched",
        choice,
        feedback: buildTranscriptionFeedback(definition),
        recoveryEvent,
      };
    }
  }

  const confirmationMatches = choices.flatMap((choice) => {
    const definition = findIntentDefinition(choice.id);
    return definition &&
      matchesExplicitVariant(
        rawNormalizedTranscript,
        definition.confirmationVariants,
      )
      ? [{ choice, definition }]
      : [];
  });
  if (confirmationMatches.length === 1) {
    const [{ choice, definition }] = confirmationMatches;
    return {
      reason: "uncertain",
      choice,
      confirmationLabel: definition.confirmationLabel,
      feedback: `Intention probablement comprise. Tu voulais dire « ${definition.confirmationLabel} » ?`,
    };
  }

  const detectedDefinitions = CAFE_SPEECH_INTENTS.filter(
    (definition) =>
      matchesExplicitVariant(rawNormalizedTranscript, definition.validVariants) ||
      matchesExplicitVariant(
        rawNormalizedTranscript,
        definition.recoverableGrammarErrors.flatMap(({ variants }) => variants),
      ),
  );

  return {
    reason: "out-of-scope",
    choice: null,
    feedback: buildCafeOutOfScopeFeedback(
      choices,
      detectedDefinitions.length === 1 ? detectedDefinitions[0] : undefined,
    ),
  };
}

export function getCafeSpeechContextualStrings(
  choices: readonly CafeSpeechChoice[],
) {
  const contextualStrings = choices.flatMap((choice) => {
    const definition = findIntentDefinition(choice.id);
    return [
      choice.korean,
      ...(definition ? [definition.canonical, ...definition.validVariants] : []),
    ];
  });

  return Array.from(
    new Set(contextualStrings.map((value) => value.trim()).filter(Boolean)),
  );
}

export function getCafeSpeechIntentPedagogy(choiceId: string) {
  const definition = findIntentDefinition(choiceId);
  return definition
    ? {
        intentId: definition.id,
        detectedIntent: definition.meaning,
        canonicalFormulation: definition.canonical,
      }
    : null;
}
