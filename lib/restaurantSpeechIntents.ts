import {
  CAFE_CLASSIFIERS,
  CAFE_QUANTITIES,
  CAFE_SPEECH_MORPHOLOGY_FAMILIES,
  NEGATION_TOKENS,
  getCafeSyllableDistanceDetails,
  normalizeKoreanSpeech,
  type CafeSpeechMorphologyFamilyId,
} from "./cafeSpeechIntents.ts";
import { getSpeechRecognitionFailureMessage } from "./speechRecognitionState.ts";

export type RestaurantSpeechChoice = Readonly<{
  id: string;
  label: string;
  korean: string;
  nextNodeId: string;
}>;

export type RestaurantSpeechSeverity =
  | "correct"
  | "minor"
  | "moderate"
  | "major"
  | "critical";

export type RestaurantSpeechCategory =
  | "natural"
  | "asr-recovery"
  | "particle-imperfection"
  | "classifier-imperfection"
  | "quantity-imperfection"
  | "register-imperfection"
  | "conjugation-imperfection"
  | "word-order"
  | "contextual-interpretation"
  | "mixed-language"
  | "incomplete"
  | "ambiguous"
  | "contradiction"
  | "wrong-concept"
  | "wrong-quantity"
  | "relevant-question"
  | "out-of-scope"
  | "empty";

export type RestaurantSpeechIntent =
  | "meat-order"
  | "recommendation"
  | "repeat"
  | "staff-grill"
  | "self-grill"
  | "side-order"
  | "decline"
  | "spicy"
  | "less-spicy"
  | "not-spicy"
  | "extra-request"
  | "payment"
  | "receipt-yes"
  | "receipt-no"
  | "unknown";

export type RestaurantSpeechMatch = Readonly<{
  reason: "matched" | "uncertain" | "needs-help" | "empty";
  category: RestaurantSpeechCategory;
  severity: RestaurantSpeechSeverity;
  choice: RestaurantSpeechChoice | null;
  feedback: string | null;
  understoodWithCorrection: boolean;
  intent: RestaurantSpeechIntent;
}>;

type RestaurantIntentId =
  | "samgyeopsal-order"
  | "galbi-order"
  | "recommendation"
  | "repeat"
  | "staff-grill"
  | "self-grill"
  | "doenjang-order"
  | "egg-order"
  | "decline"
  | "spicy"
  | "less-spicy"
  | "not-spicy"
  | "more-lettuce"
  | "more-banchan"
  | "card-payment"
  | "cash-payment"
  | "receipt-yes"
  | "receipt-no";

type RestaurantIntentKind =
  | "meat-order"
  | "recommendation"
  | "repeat"
  | "staff-grill"
  | "self-grill"
  | "side-order"
  | "decline"
  | "spice"
  | "extra"
  | "payment"
  | "receipt-yes"
  | "receipt-no";

type RestaurantSpeechConfusion = Readonly<{
  from: string;
  to: string;
}>;

export type RestaurantSpeechIntentDefinition = Readonly<{
  id: RestaurantIntentId;
  intent: Exclude<RestaurantSpeechIntent, "unknown">;
  kind: RestaurantIntentKind;
  choiceIds: readonly string[];
  canonical: string;
  validVariants: readonly string[];
  conceptTokens: readonly string[];
  predicateFamilies: readonly CafeSpeechMorphologyFamilyId[];
  restaurantPredicates: readonly ("grill" | "recommend")[];
  coherentClassifiers: readonly string[];
  expectedQuantity?: number;
  allowTerse: boolean;
  confirmationLabel: string;
  helpLabel: string;
  asrConfusions: readonly RestaurantSpeechConfusion[];
}>;

const SHARED_REQUEST_FAMILIES = ["give", "order", "request"] as const;
const SHARED_PAYMENT_FAMILIES = [
  "pay",
  "calculate",
  "do",
  "pay-money",
] as const;

const REPEAT_VARIANTS = [
  "다시 한번 말씀해 주세요.",
  "다시 말해 주세요.",
  "한 번 더 말해 주세요.",
  "천천히 말해 주세요.",
  "다시요.",
  "한 번 더요.",
] as const;

export const RESTAURANT_SPEECH_INTENTS: readonly RestaurantSpeechIntentDefinition[] = [
  {
    id: "samgyeopsal-order",
    intent: "meat-order",
    kind: "meat-order",
    choiceIds: ["ped_order_samgyeopsal", "ped_reco_samgyeopsal"],
    canonical: "삼겹살 2인분 주세요.",
    validVariants: [
      "삼겹살 이 인분 주세요.",
      "삼겹살 두 인분 주세요.",
      "삼겹살 2인분 부탁드려요.",
      "삼겹살 2인분 주문할게요.",
      "그럼 삼겹살 2인분 주세요.",
    ],
    conceptTokens: ["삼겹살"],
    predicateFamilies: SHARED_REQUEST_FAMILIES,
    restaurantPredicates: [],
    coherentClassifiers: ["인분"],
    expectedQuantity: 2,
    allowTerse: true,
    confirmationLabel: "deux portions de samgyeopsal",
    helpLabel: "commander deux portions de samgyeopsal",
    asrConfusions: [{ from: "삼겹쌀", to: "삼겹살" }],
  },
  {
    id: "galbi-order",
    intent: "meat-order",
    kind: "meat-order",
    choiceIds: ["ped_order_galbi", "ped_reco_galbi"],
    canonical: "갈비 2인분 주세요.",
    validVariants: [
      "갈비 이 인분 주세요.",
      "갈비 두 인분 주세요.",
      "갈비 2인분 부탁드려요.",
      "갈비 2인분 주문할게요.",
      "그럼 갈비 2인분 주세요.",
    ],
    conceptTokens: ["갈비"],
    predicateFamilies: SHARED_REQUEST_FAMILIES,
    restaurantPredicates: [],
    coherentClassifiers: ["인분"],
    expectedQuantity: 2,
    allowTerse: true,
    confirmationLabel: "deux portions de galbi",
    helpLabel: "commander deux portions de galbi",
    asrConfusions: [
      { from: "갈삐", to: "갈비" },
      { from: "갑비", to: "갈비" },
    ],
  },
  {
    id: "recommendation",
    intent: "recommendation",
    kind: "recommendation",
    choiceIds: ["ped_order_recommendation"],
    canonical: "추천 메뉴가 있어요?",
    validVariants: [
      "추천해 주세요.",
      "메뉴 추천해 주세요.",
      "뭐가 맛있어요?",
      "어떤 메뉴가 맛있어요?",
      "뭐가 좋아요?",
    ],
    conceptTokens: ["추천", "뭐가맛있", "어떤메뉴", "뭐가좋"],
    predicateFamilies: ["give", "request"],
    restaurantPredicates: ["recommend"],
    coherentClassifiers: [],
    allowTerse: false,
    confirmationLabel: "une recommandation",
    helpLabel: "demander une recommandation",
    asrConfusions: [
      { from: "추전", to: "추천" },
      { from: "추천매뉴", to: "추천메뉴" },
    ],
  },
  {
    id: "repeat",
    intent: "repeat",
    kind: "repeat",
    choiceIds: [],
    canonical: "다시 한번 말씀해 주세요.",
    validVariants: REPEAT_VARIANTS,
    conceptTokens: ["다시", "한번더", "천천히", "못들", "이해못"],
    predicateFamilies: ["say", "give", "request"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "une demande de répétition",
    helpLabel: "demander de répéter",
    asrConfusions: [
      { from: "다씨", to: "다시" },
      { from: "말슴", to: "말씀" },
      { from: "천천이", to: "천천히" },
    ],
  },
  {
    id: "staff-grill",
    intent: "staff-grill",
    kind: "staff-grill",
    choiceIds: ["ped_staff_grill_samgyeopsal", "ped_staff_grill_galbi"],
    canonical: "네, 구워 주세요.",
    validVariants: [
      "구워 주세요.",
      "네, 직원이 구워 주세요.",
      "구워 주실래요?",
      "구워 주시겠어요?",
      "부탁드려요.",
    ],
    conceptTokens: ["구워", "직원", "부탁"],
    predicateFamilies: ["give", "request"],
    restaurantPredicates: ["grill"],
    coherentClassifiers: [],
    allowTerse: false,
    confirmationLabel: "la cuisson par le personnel",
    helpLabel: "demander au personnel de griller la viande",
    asrConfusions: [
      { from: "구어주세요", to: "구워주세요" },
      { from: "꾸워주세요", to: "구워주세요" },
    ],
  },
  {
    id: "self-grill",
    intent: "self-grill",
    kind: "self-grill",
    choiceIds: ["ped_self_grill_samgyeopsal", "ped_self_grill_galbi"],
    canonical: "저희가 구울게요.",
    validVariants: [
      "저희가 할게요.",
      "저희가 직접 구울게요.",
      "직접 구울게요.",
      "우리가 구울게요.",
      "제가 구울게요.",
    ],
    conceptTokens: ["저희", "우리", "제가", "직접", "구울"],
    predicateFamilies: ["do"],
    restaurantPredicates: ["grill"],
    coherentClassifiers: [],
    allowTerse: false,
    confirmationLabel: "la cuisson par vous-mêmes",
    helpLabel: "dire que vous grillerez la viande",
    asrConfusions: [{ from: "구을게요", to: "구울게요" }],
  },
  {
    id: "doenjang-order",
    intent: "side-order",
    kind: "side-order",
    choiceIds: ["ped_add_doenjang"],
    canonical: "된장찌개 하나 주세요.",
    validVariants: [
      "된장찌개 주세요.",
      "된장찌개 한 개 주세요.",
      "된장찌개 한 그릇 주세요.",
      "된장찌개도 주세요.",
      "된장찌개 부탁드려요.",
    ],
    conceptTokens: ["된장찌개", "찌개"],
    predicateFamilies: SHARED_REQUEST_FAMILIES,
    restaurantPredicates: [],
    coherentClassifiers: ["그릇", "개"],
    expectedQuantity: 1,
    allowTerse: true,
    confirmationLabel: "un doenjang jjigae",
    helpLabel: "ajouter un doenjang jjigae",
    asrConfusions: [
      { from: "된장찌게", to: "된장찌개" },
      { from: "된장찌께", to: "된장찌개" },
    ],
  },
  {
    id: "egg-order",
    intent: "side-order",
    kind: "side-order",
    choiceIds: ["ped_add_egg"],
    canonical: "계란찜 하나 주세요.",
    validVariants: [
      "계란찜 주세요.",
      "계란찜 한 개 주세요.",
      "계란찜 하나 부탁드려요.",
      "계란찜도 주세요.",
    ],
    conceptTokens: ["계란찜"],
    predicateFamilies: SHARED_REQUEST_FAMILIES,
    restaurantPredicates: [],
    coherentClassifiers: ["개"],
    expectedQuantity: 1,
    allowTerse: true,
    confirmationLabel: "des œufs vapeur",
    helpLabel: "ajouter des œufs vapeur",
    asrConfusions: [
      { from: "계란짐", to: "계란찜" },
      { from: "겨란찜", to: "계란찜" },
    ],
  },
  {
    id: "decline",
    intent: "decline",
    kind: "decline",
    choiceIds: ["ped_no_side", "ped_no_extra"],
    canonical: "아니요, 괜찮아요.",
    validVariants: [
      "괜찮아요.",
      "아니요.",
      "필요 없어요.",
      "안 먹을게요.",
      "됐어요, 감사합니다.",
    ],
    conceptTokens: ["아니", "괜찮", "필요없", "안먹", "됐"],
    predicateFamilies: ["need", "eat"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "un refus poli",
    helpLabel: "refuser poliment",
    asrConfusions: [{ from: "괜찬아요", to: "괜찮아요" }],
  },
  {
    id: "spicy",
    intent: "spicy",
    kind: "spice",
    choiceIds: ["ped_spicy"],
    canonical: "맵게 해 주세요.",
    validVariants: [
      "맵게 해 주세요.",
      "매운 걸로 주세요.",
      "매워도 괜찮아요.",
      "매운 거 주세요.",
    ],
    conceptTokens: ["맵게", "매운", "매워"],
    predicateFamilies: ["do", "give", "request"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "une préparation épicée",
    helpLabel: "choisir épicé",
    asrConfusions: [{ from: "맵께", to: "맵게" }],
  },
  {
    id: "less-spicy",
    intent: "less-spicy",
    kind: "spice",
    choiceIds: ["ped_less_spicy"],
    canonical: "덜 맵게 해 주세요.",
    validVariants: [
      "조금만 맵게 해 주세요.",
      "덜 매운 걸로 주세요.",
      "조금 덜 맵게 해 주세요.",
      "약간만 맵게 해 주세요.",
    ],
    conceptTokens: ["덜맵", "조금만맵", "약간만맵"],
    predicateFamilies: ["do", "give", "request"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "une préparation moins épicée",
    helpLabel: "choisir moins épicé",
    asrConfusions: [{ from: "덜맵께", to: "덜맵게" }],
  },
  {
    id: "not-spicy",
    intent: "not-spicy",
    kind: "spice",
    choiceIds: ["ped_not_spicy"],
    canonical: "안 맵게 해 주세요.",
    validVariants: [
      "맵지 않게 해 주세요.",
      "안 매운 걸로 주세요.",
      "매운 거 말고 주세요.",
      "하나도 안 맵게 해 주세요.",
    ],
    conceptTokens: ["안맵", "맵지않", "안매운", "매운거말고"],
    predicateFamilies: ["do", "give", "request"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "une préparation non épicée",
    helpLabel: "choisir non épicé",
    asrConfusions: [{ from: "안맵께", to: "안맵게" }],
  },
  {
    id: "more-lettuce",
    intent: "extra-request",
    kind: "extra",
    choiceIds: ["ped_more_lettuce"],
    canonical: "상추 좀 더 주세요.",
    validVariants: [
      "상추 더 주세요.",
      "상추 좀 주세요.",
      "상추 추가해 주세요.",
      "상추 부탁드려요.",
      "야채 좀 더 주세요.",
      "야채 더 주세요.",
      "채소 좀 더 주세요.",
      "채소 더 주세요.",
      "쌈 채소 좀 더 주세요.",
    ],
    conceptTokens: ["상추"],
    predicateFamilies: ["give", "request", "do"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "plus de salade",
    helpLabel: "demander plus de salade",
    asrConfusions: [{ from: "상주", to: "상추" }],
  },
  {
    id: "more-banchan",
    intent: "extra-request",
    kind: "extra",
    choiceIds: ["ped_more_banchan"],
    canonical: "반찬 좀 더 주세요.",
    validVariants: [
      "반찬 더 주세요.",
      "반찬 좀 주세요.",
      "반찬 추가해 주세요.",
      "반찬 부탁드려요.",
    ],
    conceptTokens: ["반찬"],
    predicateFamilies: ["give", "request", "do"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "plus d’accompagnements",
    helpLabel: "demander plus d’accompagnements",
    asrConfusions: [{ from: "반창", to: "반찬" }],
  },
  {
    id: "card-payment",
    intent: "payment",
    kind: "payment",
    choiceIds: ["ped_pay_card"],
    canonical: "카드로 할게요.",
    validVariants: [
      "카드로 계산할게요.",
      "카드로 결제할게요.",
      "카드로 해 주세요.",
      "카드요.",
      "카드로 부탁드려요.",
    ],
    conceptTokens: ["카드"],
    predicateFamilies: SHARED_PAYMENT_FAMILIES,
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "un paiement par carte",
    helpLabel: "payer par carte",
    asrConfusions: [
      { from: "카트로", to: "카드로" },
      { from: "가드로", to: "카드로" },
    ],
  },
  {
    id: "cash-payment",
    intent: "payment",
    kind: "payment",
    choiceIds: ["ped_pay_cash"],
    canonical: "현금으로 할게요.",
    validVariants: [
      "현금으로 계산할게요.",
      "현금으로 결제할게요.",
      "현금으로 해 주세요.",
      "현금이요.",
      "현금으로 부탁드려요.",
    ],
    conceptTokens: ["현금"],
    predicateFamilies: SHARED_PAYMENT_FAMILIES,
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "un paiement en espèces",
    helpLabel: "payer en espèces",
    asrConfusions: [
      { from: "현근", to: "현금" },
      { from: "형금", to: "현금" },
    ],
  },
  {
    id: "receipt-yes",
    intent: "receipt-yes",
    kind: "receipt-yes",
    choiceIds: ["ped_receipt_yes"],
    canonical: "네, 영수증 주세요.",
    validVariants: [
      "네, 주세요.",
      "영수증 주세요.",
      "네, 필요해요.",
      "받을게요.",
      "영수증 부탁드려요.",
    ],
    conceptTokens: ["영수증", "필요해", "받을", "네주세요"],
    predicateFamilies: ["give", "need", "receive", "request"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "le reçu",
    helpLabel: "accepter le reçu",
    asrConfusions: [{ from: "영수쯩", to: "영수증" }],
  },
  {
    id: "receipt-no",
    intent: "receipt-no",
    kind: "receipt-no",
    choiceIds: ["ped_receipt_no"],
    canonical: "아니요, 괜찮아요.",
    validVariants: [
      "괜찮아요.",
      "필요 없어요.",
      "영수증은 괜찮아요.",
      "안 받을게요.",
      "아니요, 필요 없어요.",
    ],
    conceptTokens: ["아니", "괜찮", "필요없", "안받", "영수증은괜찮"],
    predicateFamilies: ["need", "receive"],
    restaurantPredicates: [],
    coherentClassifiers: [],
    allowTerse: true,
    confirmationLabel: "le refus du reçu",
    helpLabel: "refuser le reçu",
    asrConfusions: [{ from: "괜찬아요", to: "괜찮아요" }],
  },
] as const;

const RESTAURANT_PREDICATE_FORMS = {
  grill: ["구워", "구울", "굽", "구워주", "구워주시"],
  recommend: ["추천", "추천해", "추천하", "추천드"],
} as const;

const RESTAURANT_CLASSIFIERS = [...CAFE_CLASSIFIERS, "인분"] as const;

const RESTAURANT_QUANTITIES = [...CAFE_QUANTITIES, "다섯", "다섯개"] as const;

const SHARED_ACTION_NEGATION_TOKENS = NEGATION_TOKENS.filter(
  (token) => token !== "말고" && token !== "아니",
);

const CODE_SWITCH_PATTERNS = [
  { pattern: /\bsamgyeopsal\b/giu, korean: "삼겹살" },
  { pattern: /\bgalbi\b/giu, korean: "갈비" },
  { pattern: /\bdoenjang(?:\s+jjigae)?\b/giu, korean: "된장찌개" },
  { pattern: /\b(?:egg|oeufs?|œufs?)\b/giu, korean: "계란찜" },
  { pattern: /\b(?:lettuce|salade)\b/giu, korean: "상추" },
  { pattern: /\b(?:side\s+dishes|accompagnements?)\b/giu, korean: "반찬" },
  { pattern: /\b(?:card|carte)\b/giu, korean: "카드" },
  { pattern: /\b(?:cash|especes|espèces)\b/giu, korean: "현금" },
  { pattern: /\b(?:receipt|recu|reçu)\b/giu, korean: "영수증" },
] as const;

type CodeSwitchReplacement = Readonly<{ spoken: string; korean: string }>;

type NormalizedRestaurantInput = Readonly<{
  normalized: string;
  replacements: readonly CodeSwitchReplacement[];
  hadHangul: boolean;
  isQuestion: boolean;
}>;

type QuantityMention = Readonly<{
  quantity: number;
  classifier: string | null;
}>;

type DefinitionEvaluation = Readonly<{
  definition: RestaurantSpeechIntentDefinition;
  choice: RestaurantSpeechChoice;
  category: RestaurantSpeechCategory;
  severity: RestaurantSpeechSeverity;
  feedback: string | null;
  score: number;
}>;

type ContextualInterpretationRule = Readonly<{
  targetId: RestaurantIntentId;
  examples: readonly string[];
  severity: "minor" | "moderate";
  understood: string;
  guidance: string;
  matches: (value: string) => boolean;
}>;

function normalizeRestaurantInput(value: string): NormalizedRestaurantInput {
  const replacements: CodeSwitchReplacement[] = [];
  let expanded = value.normalize("NFKC").toLocaleLowerCase("fr-FR");

  for (const { pattern, korean } of CODE_SWITCH_PATTERNS) {
    expanded = expanded.replace(pattern, (spoken) => {
      replacements.push({ spoken, korean });
      return korean;
    });
  }

  return {
    normalized: normalizeKoreanSpeech(expanded),
    replacements,
    hadHangul: /[가-힣]/u.test(value),
    isQuestion: /[?？]\s*$/u.test(value.trim()),
  };
}

function includesAny(value: string, candidates: readonly string[]) {
  return candidates.some((candidate) =>
    value.includes(normalizeKoreanSpeech(candidate)),
  );
}

function hasRequestSpeechAct(value: string) {
  return includesAny(value, [
    "주세요",
    "줘요",
    "줘",
    "부탁",
    "넣어",
    "추가",
    "가져",
    "원해",
    "먹을게",
    "할게",
    "해 주세요",
    "주실",
    "낼게",
    "결제",
    "계산",
    "받을게",
    "챙겨",
    "버려",
    "필요해",
  ]);
}

function hasExpectedQuantityFor(
  value: string,
  targetId: "samgyeopsal-order" | "galbi-order",
) {
  const definition = RESTAURANT_SPEECH_INTENTS.find(({ id }) => id === targetId);
  return findQuantityMentions(value).some(
    ({ quantity }) => quantity === definition?.expectedQuantity,
  );
}

const RESTAURANT_CONTEXTUAL_INTERPRETATIONS: readonly ContextualInterpretationRule[] = [
  {
    targetId: "samgyeopsal-order",
    examples: ["돼지고기 두 명", "돼지고기 2인분 주세요."],
    severity: "moderate",
    understood: "tu veux commander du porc pour deux personnes",
    guidance:
      "« 돼지고기 » désigne le porc en général. Pour choisir le samgyeopsal, dis plutôt : « 삼겹살 2인분 주세요. »",
    matches: (value) =>
      includesAny(value, ["돼지고기", "돼지배고기"]) &&
      (hasExpectedQuantityFor(value, "samgyeopsal-order") ||
        hasRequestSpeechAct(value)),
  },
  {
    targetId: "galbi-order",
    examples: ["소고기 두 명", "소고기 2인분 주세요."],
    severity: "moderate",
    understood: "tu veux commander du bœuf pour deux personnes",
    guidance:
      "« 소고기 » désigne le bœuf en général. Pour choisir les galbi, dis plutôt : « 갈비 2인분 주세요. »",
    matches: (value) =>
      includesAny(value, ["소고기", "쇠고기"]) &&
      (hasExpectedQuantityFor(value, "galbi-order") ||
        hasRequestSpeechAct(value)),
  },
  {
    targetId: "recommendation",
    examples: ["메뉴 중에 뭐 먹을까요?", "제일 잘 나가는 메뉴가 뭐예요?"],
    severity: "minor",
    understood: "tu demandes quel plat choisir",
    guidance:
      "C’est bien une demande de recommandation. Une formulation simple est : « 추천 메뉴가 있어요? »",
    matches: (value) =>
      includesAny(value, [
        "뭐먹을까요",
        "뭐먹으면돼요",
        "메뉴가뭐예요",
        "잘나가는메뉴",
        "인기메뉴",
        "맛있는메뉴",
      ]),
  },
  {
    targetId: "staff-grill",
    examples: ["직원분한테 맡길게요.", "직원분이 해 주세요."],
    severity: "moderate",
    understood: "tu veux confier la cuisson au personnel",
    guidance:
      "La réponse est compréhensible, mais précise la cuisson : « 네, 구워 주세요. »",
    matches: (value) =>
      includesAny(value, ["직원분", "직원한테", "사장님", "맡길게"]) &&
      includesAny(value, ["해주", "해주세요", "맡길", "구워", "부탁"]),
  },
  {
    targetId: "self-grill",
    examples: ["저희끼리 할게요.", "우리끼리 구울게요."],
    severity: "minor",
    understood: "tu dis que vous vous occuperez vous-mêmes de la cuisson",
    guidance:
      "Pour être plus précis, tu peux dire : « 저희가 구울게요. »",
    matches: (value) =>
      includesAny(value, ["저희끼리", "우리끼리"]) &&
      includesAny(value, ["할게", "구울", "구워", "굽"]),
  },
  {
    targetId: "doenjang-order",
    examples: ["된장국 하나 주세요.", "된장국도 주세요."],
    severity: "moderate",
    understood: "tu demandes une soupe au doenjang",
    guidance:
      "Le choix proposé est précisément le doenjang jjigae. Dis plutôt : « 된장찌개 하나 주세요. »",
    matches: (value) =>
      includesAny(value, ["된장국", "된장수프"]) && hasRequestSpeechAct(value),
  },
  {
    targetId: "egg-order",
    examples: ["달걀 요리 주세요.", "계란 요리도 주세요."],
    severity: "moderate",
    understood: "tu demandes un accompagnement à base d’œuf",
    guidance:
      "Le choix proposé est l’œuf vapeur. Dis plutôt : « 계란찜 하나 주세요. »",
    matches: (value) =>
      includesAny(value, ["달걀", "계란요리"]) && hasRequestSpeechAct(value),
  },
  {
    targetId: "decline",
    examples: ["충분해요.", "이제 됐습니다."],
    severity: "minor",
    understood: "tu dis que tu en as déjà assez et ne veux rien ajouter",
    guidance:
      "Dans ce contexte, tu peux aussi répondre : « 아니요, 괜찮아요. »",
    matches: (value) =>
      includesAny(value, ["충분해", "이제됐", "더필요하지않"]),
  },
  {
    targetId: "spicy",
    examples: ["매운맛으로 해 주세요.", "아주 맵게 해 주세요."],
    severity: "minor",
    understood: "tu choisis une préparation épicée",
    guidance: "La formulation la plus directe est : « 맵게 해 주세요. »",
    matches: (value) =>
      includesAny(value, ["매운맛", "아주맵", "제일맵", "많이맵"]) &&
      hasRequestSpeechAct(value),
  },
  {
    targetId: "less-spicy",
    examples: ["살짝 맵게 해 주세요.", "조금 매운맛으로 주세요."],
    severity: "minor",
    understood: "tu demandes que ce soit seulement un peu épicé",
    guidance: "Une formulation plus naturelle est : « 덜 맵게 해 주세요. »",
    matches: (value) =>
      includesAny(value, ["살짝맵", "조금매운맛", "약하게맵"]) &&
      hasRequestSpeechAct(value),
  },
  {
    targetId: "not-spicy",
    examples: ["순한 맛으로 해 주세요.", "하나도 맵지 않은 걸로 주세요."],
    severity: "minor",
    understood: "tu demandes une préparation douce, non épicée",
    guidance: "Dans cette scène, dis plutôt : « 안 맵게 해 주세요. »",
    matches: (value) =>
      includesAny(value, ["순한맛", "순하게", "하나도맵지않", "맵지않은걸로"]) &&
      hasRequestSpeechAct(value),
  },
  {
    targetId: "more-lettuce",
    examples: ["야채 좀 더 주세요.", "쌈 채소 좀 더 주세요."],
    severity: "moderate",
    understood: "tu demandes davantage de légumes",
    guidance:
      "Ta demande est compréhensible. Pour nommer précisément la salade des ssam, tu peux dire : « 상추 좀 더 주세요. »",
    matches: (value) =>
      includesAny(value, ["야채", "채소", "쌈채소", "샐러드", "깻잎"]) &&
      includesAny(value, ["더", "추가"]),
  },
  {
    targetId: "more-banchan",
    examples: ["김치 좀 가져다 주세요.", "쌈장 더 주세요."],
    severity: "moderate",
    understood: "tu demandes un accompagnement précis en plus",
    guidance:
      "La serveuse regroupe ici ces petits accompagnements sous « 반찬 ». Tu peux dire : « 반찬 좀 더 주세요. »",
    matches: (value) =>
      includesAny(value, ["밑반찬", "김치", "마늘", "쌈장", "소스"]) &&
      hasRequestSpeechAct(value),
  },
  {
    targetId: "card-payment",
    examples: ["삼성페이로 할게요.", "휴대폰으로 결제할게요."],
    severity: "moderate",
    understood: "tu veux utiliser un paiement électronique",
    guidance:
      "La scène propose carte ou espèces. Pour suivre la branche carte, dis : « 카드로 할게요. »",
    matches: (value) =>
      includesAny(value, ["삼성페이", "애플페이", "휴대폰으로", "모바일페이"]) &&
      includesAny(value, ["할게", "결제", "계산", "낼게"]),
  },
  {
    targetId: "cash-payment",
    examples: ["현찰로 낼게요.", "지폐로 계산할게요."],
    severity: "minor",
    understood: "tu veux payer en espèces",
    guidance:
      "Le mot le plus courant ici est « 현금 » : « 현금으로 할게요. »",
    matches: (value) =>
      includesAny(value, ["현찰", "지폐로", "돈으로"]) &&
      includesAny(value, ["할게", "낼게", "결제", "계산"]),
  },
  {
    targetId: "receipt-yes",
    examples: ["종이로 주세요.", "출력해 주세요."],
    severity: "moderate",
    understood: "tu demandes une version papier du reçu",
    guidance: "Pour nommer clairement le reçu, dis : « 네, 영수증 주세요. »",
    matches: (value) =>
      includesAny(value, ["종이로", "출력해", "프린트해", "챙겨주세요"]) &&
      hasRequestSpeechAct(value),
  },
  {
    targetId: "receipt-no",
    examples: ["버려 주세요.", "안 줘도 돼요."],
    severity: "minor",
    understood: "tu refuses le reçu",
    guidance:
      "Une réponse plus polie et explicite est : « 아니요, 괜찮아요. »",
    matches: (value) =>
      includesAny(value, [
        "버려주세요",
        "안줘도돼",
        "안챙겨도돼",
        "출력안해도돼",
      ]),
  },
] as const;

function matchesSharedMorphology(
  value: string,
  familyId: CafeSpeechMorphologyFamilyId,
) {
  return CAFE_SPEECH_MORPHOLOGY_FAMILIES[familyId].forms.some((form) =>
    value.includes(normalizeKoreanSpeech(form)),
  );
}

function matchesRestaurantPredicate(
  value: string,
  predicate: "grill" | "recommend",
) {
  return RESTAURANT_PREDICATE_FORMS[predicate].some((form) =>
    value.includes(normalizeKoreanSpeech(form)),
  );
}

function hasCompatiblePredicate(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  return (
    definition.predicateFamilies.some((familyId) =>
      matchesSharedMorphology(value, familyId),
    ) ||
    definition.restaurantPredicates.some((predicate) =>
      matchesRestaurantPredicate(value, predicate),
    )
  );
}

function findDefinitionForChoice(choice: RestaurantSpeechChoice) {
  if (choice.id.startsWith("repeat_")) {
    return RESTAURANT_SPEECH_INTENTS.find(({ id }) => id === "repeat");
  }

  return RESTAURANT_SPEECH_INTENTS.find(({ choiceIds }) =>
    choiceIds.includes(choice.id),
  );
}

function getAvailableDefinitions(choices: readonly RestaurantSpeechChoice[]) {
  const definitions = choices
    .map(findDefinitionForChoice)
    .filter(
      (definition): definition is RestaurantSpeechIntentDefinition =>
        definition !== undefined,
    );
  return Array.from(new Map(definitions.map((item) => [item.id, item])).values());
}

function findChoiceForDefinition(
  definition: RestaurantSpeechIntentDefinition,
  choices: readonly RestaurantSpeechChoice[],
) {
  return (
    choices.find((choice) =>
      definition.id === "repeat"
        ? choice.id.startsWith("repeat_")
        : definition.choiceIds.includes(choice.id),
    ) ?? null
  );
}

export function getRestaurantSpeechChoiceIntent(
  choice: RestaurantSpeechChoice,
): RestaurantSpeechIntent {
  return findDefinitionForChoice(choice)?.intent ?? "unknown";
}

function findQuantityMentions(value: string) {
  const mentions: QuantityMention[] = [];
  const forms = [
    { quantity: 1, forms: ["한", "하나", "1", "일"] },
    { quantity: 2, forms: ["두", "둘", "2", "이"] },
    { quantity: 3, forms: ["세", "셋", "3", "삼"] },
    { quantity: 4, forms: ["네", "넷", "4", "사"] },
  ] as const;

  for (const { quantity, forms: quantityForms } of forms) {
    for (const form of quantityForms) {
      const normalizedForm = normalizeKoreanSpeech(form);
      for (const classifier of RESTAURANT_CLASSIFIERS) {
        const normalizedClassifier = normalizeKoreanSpeech(classifier);
        if (value.includes(`${normalizedForm}${normalizedClassifier}`)) {
          mentions.push({ quantity, classifier });
        }
      }

      const canBeBare = !["일", "이", "삼", "사"].includes(form);
      if (
        canBeBare &&
        (value.includes(`${normalizedForm}주세요`) ||
          value.includes(`${normalizedForm}부탁`) ||
          value.includes(`${normalizedForm}주문`))
      ) {
        mentions.push({ quantity, classifier: null });
      }
    }
  }

  return Array.from(
    new Map(
      mentions.map((mention) => [
        `${mention.quantity}:${mention.classifier ?? "none"}`,
        mention,
      ]),
    ).values(),
  );
}

function isConceptNegated(value: string, concept: string) {
  const normalizedConcept = normalizeKoreanSpeech(concept);
  const index = value.indexOf(normalizedConcept);
  if (index < 0) return false;
  const suffix = value.slice(index + normalizedConcept.length);
  return /^(?:은|는|이|가|을|를|에|로|으로)?(?:말고|빼고|아니고|아니라|안주|주지마|주지말)/u.test(
    suffix,
  );
}

function containsActionNegation(value: string) {
  return (
    includesAny(value, [
      ...SHARED_ACTION_NEGATION_TOKENS,
      "주지 마",
      "주지 말",
      "안 할",
      "하지 않을",
      "결제하지 않",
      "계산하지 않",
      "필요 없",
    ]) &&
    !includesAny(value, ["안맵", "맵지않", "안매운", "매운거말고"])
  );
}

function containsExplicitConcept(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  if (
    definition.id === "receipt-yes" &&
    includesAny(value, ["안받", "필요없", "괜찮", "아니"])
  ) {
    return false;
  }
  return definition.conceptTokens.some(
    (concept) =>
      value.includes(normalizeKoreanSpeech(concept)) &&
      !isConceptNegated(value, concept),
  );
}

function hasApproximationContext(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  const hasKnownQuantity =
    findQuantityMentions(value).length > 0 &&
    includesAny(value, RESTAURANT_QUANTITIES);
  return (
    hasCompatiblePredicate(value, definition) ||
    includesAny(value, RESTAURANT_CLASSIFIERS) ||
    hasKnownQuantity ||
    includesAny(value, ["주세요", "줘요", "부탁", "할게요", "해요", "요"])
  );
}

function findApproximateConcept(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  if (!hasApproximationContext(value, definition)) return null;
  const syllables = [...value];

  for (const concept of definition.conceptTokens) {
    const normalizedConcept = normalizeKoreanSpeech(concept);
    if (normalizedConcept.length < 2 || normalizedConcept.length > 6) continue;
    const conceptLength = [...normalizedConcept].length;

    for (let start = 0; start <= syllables.length - conceptLength; start += 1) {
      const observed = syllables.slice(start, start + conceptLength).join("");
      const details = getCafeSyllableDistanceDetails(
        observed,
        normalizedConcept,
      );
      if (details.distance <= 1 && details.alteredSyllables === 1) {
        return { observed, concept: normalizedConcept };
      }
    }
  }

  return null;
}

function applyContextualAsrRecovery(
  value: string,
  definitions: readonly RestaurantSpeechIntentDefinition[],
) {
  let corrected = value;
  const recoveries: {
    definitionId: RestaurantIntentId;
    from: string;
    to: string;
  }[] = [];

  for (const definition of definitions) {
    for (const confusion of definition.asrConfusions) {
      const from = normalizeKoreanSpeech(confusion.from);
      const to = normalizeKoreanSpeech(confusion.to);
      if (
        !corrected.includes(from) ||
        !hasApproximationContext(corrected, definition)
      ) {
        continue;
      }
      corrected = corrected.replaceAll(from, to);
      recoveries.push({ definitionId: definition.id, from, to });
    }
  }

  const hasExactConcept = definitions.some((definition) =>
    containsExplicitConcept(corrected, definition),
  );
  if (!hasExactConcept && recoveries.length === 0) {
    const approximateCandidates = definitions.flatMap((definition) => {
      if (
        ![
          "meat-order",
          "recommendation",
          "side-order",
          "extra",
          "payment",
        ].includes(definition.kind)
      ) {
        return [];
      }
      const approximate = findApproximateConcept(corrected, definition);
      return approximate ? [{ definition, approximate }] : [];
    });

    if (approximateCandidates.length === 1) {
      const [{ definition, approximate }] = approximateCandidates;
      corrected = corrected.replace(approximate.observed, approximate.concept);
      recoveries.push({
        definitionId: definition.id,
        from: approximate.observed,
        to: approximate.concept,
      });
    }
  }

  return { corrected, recoveries };
}

function isExplicitVariant(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  return [definition.canonical, ...definition.validVariants].some(
    (variant) => value === normalizeKoreanSpeech(variant),
  );
}

function isTerseConcept(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  return definition.conceptTokens.some((concept) => {
    const normalized = normalizeKoreanSpeech(concept);
    return (
      value === normalized ||
      value === `${normalized}요` ||
      value === `${normalized}이요`
    );
  });
}

function buildCodeSwitchFeedback(
  definition: RestaurantSpeechIntentDefinition,
  replacements: readonly CodeSwitchReplacement[],
) {
  if (replacements.length === 0) return null;
  const substitutions = Array.from(
    new Set(replacements.map(({ spoken, korean }) => `« ${spoken} » → ${korean}`)),
  ).join(", ");
  return `Je t’ai compris 👍 En coréen, utilise ${substitutions}.`;
}

function combineFeedback(...messages: readonly (string | null | undefined)[]) {
  const unique = Array.from(new Set(messages.filter(Boolean)));
  return unique.length > 0 ? unique.join(" ") : null;
}

function detectRegisterFeedback(value: string) {
  if (
    (value.includes("줘") &&
      !value.includes("줘요") &&
      !value.includes("주세요")) ||
    value.endsWith("해") ||
    value.endsWith("구워")
  ) {
    return "Je t’ai compris 👍 Avec un employé, préfère la forme polie en « 주세요 ».";
  }
  return null;
}

function detectConjugationFeedback(value: string) {
  if (/(?:주다|주문하다|결제하다|계산하다|굽다)$/u.test(value)) {
    return "Le sens est clair. Conjugue le verbe poliment avec « 요 » ou « 주세요 ».";
  }
  return null;
}

function detectParticleFeedback(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  if (
    definition.kind === "payment" &&
    /(?:카드|현금)(?:을|를|에)(?:할|결제|계산|해|부탁)/u.test(value)
  ) {
    const particle =
      definition.id === "card-payment" ? "카드로" : "현금으로";
    return `Le moyen de paiement prend « (으)로 ». Dis plutôt : « ${particle} 할게요. »`;
  }
  if (
    definition.kind === "recommendation" &&
    /추천메뉴(?:을|를)있/u.test(value)
  ) {
    return "Avec « 있어요 », utilise « 이/가 » : « 추천 메뉴가 있어요? »";
  }
  if (
    ["meat-order", "side-order", "extra"].includes(definition.kind) &&
    definition.conceptTokens.some((concept) =>
      new RegExp(
        `${normalizeKoreanSpeech(concept)}(?:이|가|에)(?:좀|더)?(?:주|부탁)`,
        "u",
      ).test(value),
    )
  ) {
    return "La commande est comprise. Ici, omets la particule ou utilise « 을/를 ».";
  }
  return null;
}

function detectWordOrderFeedback(
  value: string,
  definition: RestaurantSpeechIntentDefinition,
) {
  const conceptIndex = definition.conceptTokens
    .map((concept) => value.indexOf(normalizeKoreanSpeech(concept)))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];
  const predicateIndexes = ["주세요", "줘요", "줘", "부탁", "할게", "해요"]
    .map((predicate) => value.indexOf(predicate))
    .filter((index) => index >= 0);
  const predicateIndex = predicateIndexes.sort((left, right) => left - right)[0];

  if (
    conceptIndex !== undefined &&
    predicateIndex !== undefined &&
    predicateIndex < conceptIndex
  ) {
    return `Ta phrase est comprise. L’ordre le plus naturel est : « ${definition.canonical} »`;
  }
  return null;
}

function getPolarityConcepts(value: string) {
  const withoutNegativePolarity = value
    .replaceAll("덜맵", "")
    .replaceAll("조금만맵", "")
    .replaceAll("약간만맵", "")
    .replaceAll("안맵", "")
    .replaceAll("맵지않", "")
    .replaceAll("안매운", "")
    .replaceAll("매운거말고", "");
  return {
    spicy: includesAny(withoutNegativePolarity, ["맵게", "매운", "매워"]),
    less: includesAny(value, ["덜맵", "조금만맵", "약간만맵"]),
    not: includesAny(value, ["안맵", "맵지않", "안매운", "매운거말고"]),
  };
}

function getCurrentQuestionExplanation(
  definitions: readonly RestaurantSpeechIntentDefinition[],
) {
  const ids = new Set(definitions.map(({ id }) => id));

  if (ids.has("samgyeopsal-order") || ids.has("galbi-order")) {
    return "Ici, la serveuse te demande quelle viande tu veux commander, ou si tu souhaites une recommandation.";
  }
  if (ids.has("staff-grill") || ids.has("self-grill")) {
    return "Ici, la serveuse te demande si le personnel doit griller la viande ou si vous préférez le faire vous-mêmes.";
  }
  if (ids.has("doenjang-order") || ids.has("egg-order")) {
    return "Ici, la serveuse te propose un doenjang jjigae, des œufs vapeur, ou aucun accompagnement supplémentaire.";
  }
  if (ids.has("spicy") || ids.has("less-spicy") || ids.has("not-spicy")) {
    return "Ici, la serveuse te demande de choisir un seul niveau de piquant : épicé, moins épicé ou non épicé.";
  }
  if (ids.has("more-lettuce") || ids.has("more-banchan")) {
    return "Ici, la serveuse te demande si tu veux davantage de salade, davantage d’accompagnements, ou rien d’autre.";
  }
  if (ids.has("card-payment") || ids.has("cash-payment")) {
    return "Ici, la serveuse te demande comment tu souhaites payer : par carte ou en espèces.";
  }
  if (ids.has("receipt-yes") || ids.has("receipt-no")) {
    return "Ici, la serveuse te demande si tu veux le reçu ou si tu le refuses.";
  }
  return "La formulation est liée à la scène, mais elle ne répond pas encore précisément à la question posée.";
}

function getContextualRulesForValue(value: string) {
  const hasNegation = containsActionNegation(value);
  return RESTAURANT_CONTEXTUAL_INTERPRETATIONS.filter(
    ({ targetId, matches }) =>
      matches(value) &&
      (!hasNegation ||
        ["decline", "receipt-no", "not-spicy"].includes(targetId)),
  );
}

function findContextualEvaluations(
  value: string,
  definitions: readonly RestaurantSpeechIntentDefinition[],
  choices: readonly RestaurantSpeechChoice[],
) {
  const questionExplanation = getCurrentQuestionExplanation(definitions);
  return getContextualRulesForValue(value).flatMap((rule) => {
    const definition = definitions.find(({ id }) => id === rule.targetId);
    if (!definition) return [];
    const choice = findChoiceForDefinition(definition, choices);
    if (!choice) return [];

    return [
      {
        definition,
        choice,
        category: "contextual-interpretation" as const,
        severity: rule.severity,
        feedback: `J’ai compris que ${rule.understood}. ${questionExplanation} ${rule.guidance}`,
        score: rule.severity === "minor" ? 7 : 5,
      },
    ];
  });
}

function getIncompleteContextualFeedback(
  value: string,
  definitions: readonly RestaurantSpeechIntentDefinition[],
) {
  const ids = new Set(definitions.map(({ id }) => id));
  const questionExplanation = getCurrentQuestionExplanation(definitions);

  if (
    (ids.has("samgyeopsal-order") || ids.has("galbi-order")) &&
    includesAny(value, ["고기", "육류"]) &&
    hasRequestSpeechAct(value)
  ) {
    return `J’ai compris que tu veux commander de la viande, mais tu n’as pas indiqué laquelle. ${questionExplanation}`;
  }
  if (
    (ids.has("staff-grill") || ids.has("self-grill")) &&
    includesAny(value, ["고기", "굽", "구워", "해주"]) &&
    hasRequestSpeechAct(value)
  ) {
    return `J’ai compris que tu parles de la cuisson, mais je ne sais pas clairement qui doit s’en charger. ${questionExplanation}`;
  }
  if (
    (ids.has("doenjang-order") || ids.has("egg-order")) &&
    includesAny(value, ["국", "사이드", "추가", "곁들임"]) &&
    hasRequestSpeechAct(value)
  ) {
    return `J’ai compris que tu veux ajouter un accompagnement, mais tu ne l’as pas identifié. ${questionExplanation}`;
  }
  if (
    (ids.has("spicy") || ids.has("less-spicy") || ids.has("not-spicy")) &&
    includesAny(value, ["보통맛", "기본맛", "그냥해주세요"])
  ) {
    return `J’ai compris que tu demandes le goût standard, mais ce niveau n’est pas assez précis dans cette scène. ${questionExplanation}`;
  }
  if (
    (ids.has("more-lettuce") || ids.has("more-banchan")) &&
    includesAny(value, ["더주세요", "추가해주세요", "좀더요"]) &&
    !includesAny(value, [
      "상추",
      "반찬",
      "야채",
      "채소",
      "김치",
      "마늘",
      "쌈장",
    ])
  ) {
    return `J’ai compris que tu en veux davantage, mais tu n’as pas précisé quoi. ${questionExplanation}`;
  }
  if (
    (ids.has("card-payment") || ids.has("cash-payment")) &&
    includesAny(value, ["계산할게", "결제할게", "낼게"]) &&
    !includesAny(value, ["카드", "현금", "현찰", "삼성페이", "애플페이"])
  ) {
    return `J’ai compris que tu veux payer, mais tu n’as pas indiqué le moyen de paiement. ${questionExplanation}`;
  }
  if (
    (ids.has("receipt-yes") || ids.has("receipt-no")) &&
    /^(?:주세요|줘요|부탁드려요)$/u.test(value)
  ) {
    return `J’ai compris que tu demandes qu’on te donne quelque chose, mais tu n’as pas nommé le reçu. ${questionExplanation}`;
  }
  return null;
}

function evaluateDefinition(
  value: string,
  input: NormalizedRestaurantInput,
  definition: RestaurantSpeechIntentDefinition,
  choice: RestaurantSpeechChoice,
  wasRecovered: boolean,
): DefinitionEvaluation | null {
  const explicit =
    isExplicitVariant(value, definition) ||
    value === normalizeKoreanSpeech(choice.korean);
  const hasConcept = containsExplicitConcept(value, definition);
  const hasPredicate = hasCompatiblePredicate(value, definition);
  const terse = definition.allowTerse && isTerseConcept(value, definition);
  const hasExpectedOrderQuantity =
    (definition.kind === "meat-order" || definition.kind === "side-order") &&
    definition.expectedQuantity !== undefined &&
    findQuantityMentions(value).some(
      ({ quantity }) => quantity === definition.expectedQuantity,
    );

  if (definition.kind === "repeat") {
    if (!hasConcept && !explicit) return null;
  } else if (definition.kind === "recommendation") {
    const naturalQuestion = includesAny(value, [
      "뭐가맛있",
      "어떤메뉴",
      "뭐가좋",
    ]);
    if (!explicit && !(hasConcept && (hasPredicate || naturalQuestion))) {
      return null;
    }
  } else if (definition.kind === "staff-grill") {
    if (includesAny(value, ["저희", "우리", "제가", "직접"])) return null;
    if (!explicit && !(hasConcept && (hasPredicate || value.includes("부탁")))) {
      return null;
    }
  } else if (definition.kind === "self-grill") {
    const hasSelf = includesAny(value, ["저희", "우리", "제가", "직접"]);
    if (
      !explicit &&
      !(hasSelf && (hasPredicate || includesAny(value, ["할게", "구울"])))
    ) {
      return null;
    }
  } else if (
    definition.kind === "decline" ||
    definition.kind === "receipt-no"
  ) {
    if (!hasConcept && !explicit) return null;
  } else if (definition.kind === "spice") {
    const polarity = getPolarityConcepts(value);
    const asksAboutSpice =
      input.isQuestion &&
      includesAny(value, ["매워요", "안매워요", "맵나요"]) &&
      !includesAny(value, ["주세요", "원해요", "괜찮아요"]);
    if (asksAboutSpice) return null;
    if (
      definition.id === "spicy" &&
      (!polarity.spicy || polarity.less || polarity.not)
    ) {
      return null;
    }
    if (definition.id === "less-spicy" && !polarity.less) return null;
    if (definition.id === "not-spicy" && !polarity.not) return null;
  } else if (definition.kind === "receipt-yes") {
    const yesOnly = /^(?:네|예)$/u.test(value);
    if (yesOnly) {
      return {
        definition,
        choice,
        category: "incomplete",
        severity: "moderate",
        feedback: "J’ai compris « oui », mais confirme que tu veux le reçu.",
        score: 4,
      };
    }
    if (
      !explicit &&
      !(hasConcept && (hasPredicate || includesAny(value, ["네", "받을"])))
    ) {
      return null;
    }
  } else if (definition.kind === "payment") {
    if (!explicit && !(hasConcept && (hasPredicate || terse))) return null;
  } else if (
    !explicit &&
    !(hasConcept && (hasPredicate || terse || hasExpectedOrderQuantity))
  ) {
    return null;
  }

  if (
    !["decline", "receipt-no", "spice", "repeat"].includes(definition.kind) &&
    containsActionNegation(value)
  ) {
    return null;
  }

  const quantities = findQuantityMentions(value);
  if (definition.expectedQuantity !== undefined && quantities.length > 0) {
    const distinctQuantities = new Set(quantities.map(({ quantity }) => quantity));
    if (
      distinctQuantities.size > 1 ||
      !distinctQuantities.has(definition.expectedQuantity)
    ) {
      return null;
    }
  }

  if (definition.kind === "meat-order" && quantities.length === 0) {
    return {
      definition,
      choice,
      category: "incomplete",
      severity: "moderate",
      feedback: `J’ai compris le plat. Il manque la quantité : « ${definition.canonical} »`,
      score: 5,
    };
  }

  const observedClassifiers = quantities
    .map(({ classifier }) => classifier)
    .filter((classifier): classifier is string => classifier !== null);
  const incoherentClassifier = observedClassifiers.find(
    (classifier) => !definition.coherentClassifiers.includes(classifier),
  );
  const missingClassifier =
    definition.kind === "meat-order" &&
    quantities.some(
      ({ quantity, classifier }) =>
        quantity === definition.expectedQuantity && classifier === null,
    );

  const codeSwitchFeedback = buildCodeSwitchFeedback(
    definition,
    input.replacements,
  );
  const asrFeedback = wasRecovered
    ? `Je t’ai compris 👍 La formulation visée est « ${definition.canonical} »`
    : null;
  const registerFeedback = detectRegisterFeedback(value);
  const conjugationFeedback = detectConjugationFeedback(value);
  const particleFeedback = detectParticleFeedback(value, definition);
  const wordOrderFeedback = detectWordOrderFeedback(value, definition);
  const missingExtraMarkerFeedback =
    definition.kind === "extra" && !includesAny(value, ["더", "추가"])
      ? `Demande comprise. « 더 » précise que tu en veux davantage : « ${definition.canonical} »`
      : null;
  const classifierFeedback = incoherentClassifier
    ? `Ta demande est comprise. Pour cette commande, préfère ${definition.coherentClassifiers[0] ?? "le compteur du menu"} à ${incoherentClassifier}.`
    : missingClassifier
      ? `Après la quantité, ajoute « 인분 » : « ${definition.canonical} »`
      : null;
  const feedback = combineFeedback(
    codeSwitchFeedback,
    asrFeedback,
    registerFeedback,
    conjugationFeedback,
    particleFeedback,
    wordOrderFeedback,
    missingExtraMarkerFeedback,
    classifierFeedback,
  );
  const category: RestaurantSpeechCategory = wasRecovered
    ? "asr-recovery"
    : codeSwitchFeedback
      ? "mixed-language"
      : registerFeedback
        ? "register-imperfection"
        : conjugationFeedback
          ? "conjugation-imperfection"
          : particleFeedback
            ? "particle-imperfection"
            : wordOrderFeedback
              ? "word-order"
              : classifierFeedback
                ? "classifier-imperfection"
                : "natural";

  return {
    definition,
    choice,
    category,
    severity: feedback ? "minor" : "correct",
    feedback,
    score: explicit ? 10 : hasPredicate ? 8 : terse ? 6 : 7,
  };
}

function withAvailableChoices(
  feedback: string,
  choices: readonly RestaurantSpeechChoice[],
) {
  const labels = Array.from(
    new Set(choices.map(({ label }) => label.trim())),
  ).filter(Boolean);
  if (labels.length === 0) return feedback;
  return `${feedback.trim().replace(/[.!?…]+$/u, "")} — réponses proposées : ${labels
    .map((label) => `« ${label} »`)
    .join(" · ")}.`;
}

function withProgressiveHelp(
  feedback: string,
  attemptNumber: number,
  choices: readonly RestaurantSpeechChoice[],
) {
  const definitions = getAvailableDefinitions(choices).filter(
    ({ id }) => id !== "repeat",
  );
  if (attemptNumber >= 3) {
    const models = definitions
      .slice(0, 2)
      .map(({ canonical }) => `« ${canonical} »`);
    return `${feedback.trim().replace(/[.!?…]+$/u, "")} — phrase modèle : ${models.join(" ou ")}.`;
  }
  if (attemptNumber === 2) {
    const keywords = Array.from(
      new Set(
        definitions.flatMap(({ conceptTokens }) => conceptTokens.slice(0, 1)),
      ),
    );
    return `${feedback.trim().replace(/[.!?…]+$/u, "")} — mots utiles : ${keywords.join(" · ")}.`;
  }
  return feedback;
}

function matched(evaluation: DefinitionEvaluation): RestaurantSpeechMatch {
  return {
    reason: evaluation.severity === "moderate" ? "uncertain" : "matched",
    category: evaluation.category,
    severity: evaluation.severity,
    choice: evaluation.choice,
    feedback: evaluation.feedback,
    understoodWithCorrection: evaluation.severity !== "correct",
    intent: evaluation.definition.intent,
  };
}

function needsHelp(
  category: RestaurantSpeechCategory,
  severity: "major" | "critical",
  feedback: string,
  choices: readonly RestaurantSpeechChoice[],
  attemptNumber: number,
): RestaurantSpeechMatch {
  return {
    reason: "needs-help",
    category,
    severity,
    choice: null,
    feedback: withAvailableChoices(
      withProgressiveHelp(feedback, attemptNumber, choices),
      choices,
    ),
    understoodWithCorrection: false,
    intent: "unknown",
  };
}

function getWrongQuantityFeedback(
  value: string,
  definitions: readonly RestaurantSpeechIntentDefinition[],
) {
  for (const definition of definitions) {
    if (
      definition.expectedQuantity === undefined ||
      !containsExplicitConcept(value, definition)
    ) {
      continue;
    }
    const quantities = findQuantityMentions(value);
    if (
      quantities.length > 0 &&
      quantities.some(
        ({ quantity }) => quantity !== definition.expectedQuantity,
      )
    ) {
      return `Le plat est compris, mais le nombre change la commande. Ici, demande ${definition.expectedQuantity} portion${definition.expectedQuantity > 1 ? "s" : ""} : « ${definition.canonical} »`;
    }
  }
  return null;
}

function findUnavailableIntent(value: string) {
  const matches = RESTAURANT_SPEECH_INTENTS.filter((definition) => {
    if (definition.kind === "spice") {
      const polarity = getPolarityConcepts(value);
      return definition.id === "spicy"
        ? polarity.spicy && !polarity.less && !polarity.not
        : definition.id === "less-spicy"
          ? polarity.less
          : polarity.not;
    }
    return (
      containsExplicitConcept(value, definition) &&
      (hasCompatiblePredicate(value, definition) || definition.allowTerse)
    );
  });
  return matches.length === 1 ? matches[0] : null;
}

function findExplicitSelfCorrection(transcript: string) {
  const match = transcript.match(
    /^(.+?)(?:…|\.{3}|,)?\s*아니(?:요)?\s*,?\s*(.+)$/u,
  );
  if (!match) return null;
  const corrected = match[2]?.trim();
  if (!corrected || /^괜찮/u.test(corrected)) return null;
  return corrected;
}

export function matchRestaurantSpeechIntent(
  transcript: string,
  choices: readonly RestaurantSpeechChoice[],
  attemptNumber = 1,
): RestaurantSpeechMatch {
  const selfCorrection = findExplicitSelfCorrection(transcript);
  if (selfCorrection) {
    const correctedResult = matchRestaurantSpeechIntent(
      selfCorrection,
      choices,
      attemptNumber,
    );
    if (correctedResult.reason === "matched") {
      return {
        ...correctedResult,
        category: "natural",
        severity: "minor",
        feedback: combineFeedback(
          "J’ai compris ta correction 👍",
          correctedResult.feedback,
        ),
        understoodWithCorrection: true,
      };
    }
  }

  const input = normalizeRestaurantInput(transcript);
  if (!input.normalized) {
    return {
      reason: "empty",
      category: "empty",
      severity: "major",
      choice: null,
      feedback: withAvailableChoices(
        getSpeechRecognitionFailureMessage("empty"),
        choices,
      ),
      understoodWithCorrection: false,
      intent: "unknown",
    };
  }

  const availableDefinitions = getAvailableDefinitions(choices);
  const { corrected, recoveries } = applyContextualAsrRecovery(
    input.normalized,
    availableDefinitions,
  );

  const activeSpicePolarities = getPolarityConcepts(corrected);
  if (
    Number(activeSpicePolarities.spicy) +
      Number(activeSpicePolarities.less) +
      Number(activeSpicePolarities.not) >
    1
  ) {
    return needsHelp(
      "contradiction",
      "critical",
      "Tu as donné plusieurs niveaux de piquant. Choisis une seule préférence.",
      choices,
      attemptNumber,
    );
  }

  const hasReceiptYesEvidence =
    includesAny(corrected, [
      "네주세요",
      "예주세요",
      "영수증주세요",
      "필요해",
    ]) ||
    (corrected.includes("받을게") && !corrected.includes("안받을게"));
  const hasReceiptNoEvidence = includesAny(corrected, [
    "아니",
    "괜찮",
    "필요없",
    "안받",
  ]);
  if (
    availableDefinitions.some(({ id }) => id === "receipt-yes") &&
    availableDefinitions.some(({ id }) => id === "receipt-no") &&
    hasReceiptYesEvidence &&
    hasReceiptNoEvidence
  ) {
    return needsHelp(
      "ambiguous",
      "major",
      "Tu as accepté et refusé le reçu dans la même réponse. Choisis une seule option.",
      choices,
      attemptNumber,
    );
  }

  const availableConceptGroups = [
    ["samgyeopsal-order", "galbi-order"],
    ["doenjang-order", "egg-order", "decline"],
    ["more-lettuce", "more-banchan", "decline"],
    ["card-payment", "cash-payment"],
    ["receipt-yes", "receipt-no"],
  ] as const;
  for (const group of availableConceptGroups) {
    const evidenced = availableDefinitions.filter(
      (definition) =>
        group.includes(definition.id as never) &&
        containsExplicitConcept(corrected, definition),
    );
    if (evidenced.length > 1) {
      return needsHelp(
        "ambiguous",
        "major",
        "J’ai entendu plusieurs réponses incompatibles. Choisis-en une seule.",
        choices,
        attemptNumber,
      );
    }
  }

  const evaluations = availableDefinitions.flatMap((definition) => {
    const choice = findChoiceForDefinition(definition, choices);
    if (!choice) return [];
    const evaluation = evaluateDefinition(
      corrected,
      input,
      definition,
      choice,
      recoveries.some(({ definitionId }) => definitionId === definition.id),
    );
    return evaluation ? [evaluation] : [];
  });

  if (evaluations.length > 1) {
    const bestScore = Math.max(...evaluations.map(({ score }) => score));
    const best = evaluations.filter(({ score }) => score === bestScore);
    if (best.length === 1) return matched(best[0]);
    return needsHelp(
      "ambiguous",
      "major",
      "J’ai entendu plusieurs intentions possibles. Reformule une seule réponse.",
      choices,
      attemptNumber,
    );
  }
  if (evaluations.length === 1) return matched(evaluations[0]);

  const wrongQuantityFeedback = getWrongQuantityFeedback(
    corrected,
    availableDefinitions,
  );
  if (wrongQuantityFeedback) {
    return needsHelp(
      "wrong-quantity",
      "major",
      wrongQuantityFeedback,
      choices,
      attemptNumber,
    );
  }

  const hasNegatedAvailableConcept = availableDefinitions.some(
    (definition) =>
      definition.conceptTokens.some((concept) =>
        isConceptNegated(corrected, concept),
      ) ||
      (!["decline", "receipt-no", "spice", "repeat"].includes(
        definition.kind,
      ) &&
        containsExplicitConcept(corrected, definition) &&
        containsActionNegation(corrected)),
  );
  if (hasNegatedAvailableConcept) {
    return needsHelp(
      "contradiction",
      "critical",
      "La négation inverse l’intention attendue. Reformule clairement ce que tu veux.",
      choices,
      attemptNumber,
    );
  }

  if (
    input.isQuestion &&
    includesAny(corrected, ["매워요", "안매워요", "맵나요"])
  ) {
    return needsHelp(
      "relevant-question",
      "major",
      "Tu demandes si c’est épicé, mais le serveur te demande ici de choisir ton niveau de piquant.",
      choices,
      attemptNumber,
    );
  }

  const contextualEvaluations = findContextualEvaluations(
    corrected,
    availableDefinitions,
    choices,
  );
  if (contextualEvaluations.length > 1) {
    return needsHelp(
      "ambiguous",
      "major",
      `J’ai reconnu plusieurs sens proches, mais je ne peux pas choisir à ta place. ${getCurrentQuestionExplanation(availableDefinitions)}`,
      choices,
      attemptNumber,
    );
  }
  if (contextualEvaluations.length === 1) {
    return matched(contextualEvaluations[0]);
  }

  const incompleteContextualFeedback = getIncompleteContextualFeedback(
    corrected,
    availableDefinitions,
  );
  if (incompleteContextualFeedback) {
    return needsHelp(
      "ambiguous",
      "major",
      incompleteContextualFeedback,
      choices,
      attemptNumber,
    );
  }

  const unavailableIntent = findUnavailableIntent(corrected);
  if (
    unavailableIntent &&
    !availableDefinitions.some(({ id }) => id === unavailableIntent.id)
  ) {
    return needsHelp(
      "wrong-concept",
      "major",
      `J’ai compris que tu veux ${unavailableIntent.helpLabel}. ${getCurrentQuestionExplanation(availableDefinitions)}`,
      choices,
      attemptNumber,
    );
  }

  const unavailableContextualRules = getContextualRulesForValue(corrected).filter(
    (rule) =>
      !availableDefinitions.some(({ id }) => id === rule.targetId),
  );
  if (unavailableContextualRules.length === 1) {
    const [rule] = unavailableContextualRules;
    return needsHelp(
      "wrong-concept",
      "major",
      `J’ai compris que ${rule.understood}. ${getCurrentQuestionExplanation(availableDefinitions)}`,
      choices,
      attemptNumber,
    );
  }

  const hasOnlyLatinAfterReplacement =
    !input.hadHangul && input.replacements.length > 0;
  return needsHelp(
    "out-of-scope",
    "major",
    hasOnlyLatinAfterReplacement
      ? "J’ai reconnu le concept, mais réponds avec une phrase coréenne simple."
      : "Cette réponse ne correspond pas à la situation actuelle.",
    choices,
    attemptNumber,
  );
}

export function getRestaurantSpeechContextualStrings(
  choices: readonly RestaurantSpeechChoice[],
) {
  const definitions = getAvailableDefinitions(choices);
  return Array.from(
    new Set(
      [
        ...choices.map(({ korean }) => korean),
        ...definitions.flatMap(({ canonical, validVariants }) => [
          canonical,
          ...validVariants,
        ]),
        ...RESTAURANT_CONTEXTUAL_INTERPRETATIONS
          .filter(({ targetId }) =>
            definitions.some(({ id }) => id === targetId),
          )
          .flatMap(({ examples }) => examples),
      ]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}
