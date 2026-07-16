import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

import { CAFE_PILOT_PRODUCT_CHOICES } from "../data/lesson/cafe/cafePilotOrder.ts";
import {
  applyCafeOrderProductSelection,
  EMPTY_CAFE_ORDER_STATE,
} from "../lib/cafeOrderState.ts";
import {
  buildCafeUnavailableFeedback,
  CAFE_SPEECH_INTENTS,
  CAFE_SPEECH_LINGUISTIC_RULES,
  CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS,
  CAFE_SPEECH_MAX_KEYWORD_DISTANCE,
  CAFE_SPEECH_PILOT_MISSION_ID,
  getCafeSyllableDistance,
  getCafeSyllableDistanceDetails,
  getCafeSpeechContextualStrings,
  matchCafeSpeechIntent,
  normalizeKoreanSpeech,
} from "../lib/cafeSpeechIntents.ts";
import {
  classifySpeechRecognitionError,
  INITIAL_SPEECH_RECOGNITION_STATE,
  speechRecognitionReducer,
} from "../lib/speechRecognitionState.ts";

function getProductChoice(product) {
  const choice = CAFE_PILOT_PRODUCT_CHOICES.find(
    ({ orderProduct }) => orderProduct === product,
  );
  assert.ok(choice);
  return choice;
}

const americano = getProductChoice("americano");
const orangeJuice = getProductChoice("orange-juice");
const latte = getProductChoice("latte");
const cheesecake = getProductChoice("cheesecake");

const repeat = {
  id: "repeat_ped1",
  label: "Pouvez-vous répéter ?",
  korean: "다시 한번 말씀해 주시겠어요?",
  nextNodeId: "ped_welcome",
};

const eatHere = {
  id: "ped_here_drink",
  label: "Sur place.",
  korean: "네, 먹고 갈게요.",
  nextNodeId: "ped_payment_here",
};

const takeout = {
  id: "ped_takeout_drink",
  label: "À emporter.",
  korean: "포장해 주세요.",
  nextNodeId: "ped_payment_takeout",
};

const card = {
  id: "ped_card_takeout",
  label: "Par carte.",
  korean: "카드로 할게요.",
  nextNodeId: "ped_receipt_card_takeout",
};

const cash = {
  id: "ped_cash_takeout",
  label: "En espèces.",
  korean: "현금으로 할게요.",
  nextNodeId: "ped_receipt_cash_takeout",
};

const receiptYes = {
  id: "ped_receipt_yes_takeout",
  label: "Oui, s’il vous plaît.",
  korean: "네, 주세요.",
  nextNodeId: "ped_takeout_end",
};

const receiptNo = {
  id: "ped_receipt_no_takeout",
  label: "Non, merci.",
  korean: "아니요, 괜찮아요.",
  nextNodeId: "ped_takeout_end",
};

const orderChoices = [...CAFE_PILOT_PRODUCT_CHOICES, repeat];

const phoneticIntentCases = [
  {
    intentId: "americano-order",
    label: "americano",
    choices: orderChoices,
    expectedChoice: americano,
    mutations: [
      "아메리까노 한 잔 주세요.",
      "아메리커노 한 잔 주세요.",
      "암메리카노 한 잔 주세요.",
    ],
    spaced: "아 메 리 카 노 한 잔 주 세 요.",
    isolated: "아메리카농",
    realWord: "아메리카 여행을 좋아해요.",
    negated: "아메리카농은 안 주세요.",
    contradiction: "아메리카농 주세요. 치즈케이크 주세요.",
    competing: "아메리카농 치즈케이쿠 주세요.",
  },
  {
    intentId: "orange-juice-order",
    label: "orange juice",
    choices: orderChoices,
    expectedChoice: orangeJuice,
    mutations: [
      "오렌치 주스 한 잔 주세요.",
      "오론지 주스 한 잔 주세요.",
      "옷렌지 주스 한 잔 주세요.",
    ],
    spaced: "오 렌 지 주 스 한 잔 주 세 요.",
    isolated: "오렌치주수",
    realWord: "오렌지색 옷이에요.",
    negated: "오렌치주수는 안 주세요.",
    contradiction: "오렌치주수 주세요. 라떼 주세요.",
    competing: "오렌치주수 러떼 주세요.",
  },
  {
    intentId: "latte-order",
    label: "latte",
    choices: orderChoices,
    expectedChoice: latte,
    mutations: [
      "나떼 한 잔 주세요.",
      "러떼 한 잔 주세요.",
      "랏떼 한 잔 주세요.",
    ],
    spaced: "라 떼 한 잔 주 세 요.",
    isolated: "러떼",
    realWord: "나 때는 좋았어요.",
    negated: "러떼는 안 주세요.",
    contradiction: "러떼 주세요. 아메리카노 주세요.",
    competing: "러떼 아메리카농 주세요.",
  },
  {
    intentId: "cheesecake-order",
    label: "cheesecake",
    choices: orderChoices,
    expectedChoice: cheesecake,
    mutations: [
      "치즈게이크 한 조각 주세요.",
      "치즈케이코 한 조각 주세요.",
      "치즈켇이크 한 조각 주세요.",
    ],
    spaced: "치 즈 케 이 크 한 조 각 주 세 요.",
    isolated: "치즈게이크",
    realWord: "케이크 사진이에요.",
    negated: "치즈게이크는 안 주세요.",
    contradiction: "치즈게이크 주세요. 오렌지 주스 주세요.",
    competing: "치즈게이크 오렌치주수 주세요.",
  },
  {
    intentId: "repeat",
    label: "repeat",
    choices: [repeat],
    expectedChoice: repeat,
    mutations: [
      "다시 말쯤해 주세요.",
      "다시 말쏨해 주세요.",
      "다시 맏씀해 주세요.",
    ],
    spaced: "다 시 한 번 말 씀 해 주 세 요.",
    isolated: "말쏨",
    realWord: "말씀이 아름다워요.",
    negated: "다시 말쏨하지 마세요.",
    contradiction: "다시 말쏨하지 말아 주세요.",
    competing: "말쏨해 주세요. 아메리카농 주세요.",
    competingChoices: orderChoices,
  },
  {
    intentId: "eat-here",
    label: "eat here",
    choices: [eatHere, takeout, repeat],
    expectedChoice: eatHere,
    mutations: ["넉고 갈게요.", "먹구 갈게요.", "먹곡 갈게요."],
    spaced: "먹 고 갈 게 요.",
    isolated: "먹구",
    realWord: "먹고사는 문제예요.",
    negated: "먹구 가지 않을게요.",
    contradiction: "먹구 갈게요. 포장해 주세요.",
    competing: "먹구 갈게요. 포잔해 주세요.",
  },
  {
    intentId: "takeout",
    label: "takeout",
    choices: [eatHere, takeout, repeat],
    expectedChoice: takeout,
    mutations: ["토장해 주세요.", "푸장해 주세요.", "폿장해 주세요."],
    spaced: "포 장 해 주 세 요.",
    isolated: "포잔",
    realWord: "보장해 주세요.",
    negated: "포잔하지 말아 주세요.",
    contradiction: "포잔해 주세요. 먹고 갈게요.",
    competing: "포잔해 주세요. 먹구 갈게요.",
  },
  {
    intentId: "card-payment",
    label: "card payment",
    choices: [card, cash, repeat],
    expectedChoice: card,
    mutations: ["타드로 할게요.", "커드로 할게요.", "칻드로 할게요."],
    spaced: "카 드 로 할 게 요.",
    isolated: "카두",
    realWord: "가드로 일할게요.",
    negated: "카두로 안 할게요.",
    contradiction: "카두로 할게요. 현금으로 할게요.",
    competing: "카두 현근으로 할게요.",
  },
  {
    intentId: "cash-payment",
    label: "cash payment",
    choices: [card, cash, repeat],
    expectedChoice: cash,
    mutations: [
      "현큼으로 할게요.",
      "현곰으로 할게요.",
      "현급으로 할게요.",
    ],
    spaced: "현 금 으 로 할 게 요.",
    isolated: "현곰",
    realWord: "헌금으로 낼게요.",
    negated: "현곰으로 안 할게요.",
    contradiction: "현곰으로 할게요. 카드로 할게요.",
    competing: "현곰으로 할게요. 카두로 할게요.",
  },
  {
    intentId: "receipt-yes",
    label: "receipt yes",
    choices: [receiptYes, receiptNo],
    expectedChoice: receiptYes,
    mutations: [
      "영수층 필요해요.",
      "영소증 필요해요.",
      "영숫증 필요해요.",
    ],
    spaced: "영 수 증 주 세 요.",
    isolated: "영소증",
    realWord: "향수 냄새가 좋아요.",
    negated: "영소증 필요 없어요.",
    contradiction: "영소증 필요해요. 아니요, 괜찮아요.",
    competing: "영소증 주세요. 아니요, 괜찮아유.",
  },
  {
    intentId: "receipt-no",
    label: "receipt no",
    choices: [receiptYes, receiptNo],
    expectedChoice: receiptNo,
    mutations: [
      "아니요, 왠찮아요.",
      "아니요, 궨찮아요.",
      "아니요, 괜찬아요.",
    ],
    spaced: "아 니 요 괜 찮 아 요.",
    isolated: "괜찮아유",
    realWord: "괜찮은 향수예요.",
    negated: "괜찮아유 아니고 필요해요.",
    contradiction: "괜찮아유 아니고 영수증 필요해요.",
    competing: "괜찮아유 아니고 영소증 필요해요.",
  },
];

const linguisticPropertyExamples = {
  "americano-order": {
    particleAbsent: "아메리카노 주세요.",
    deformedParticle: "아메리카노늘 주세요.",
    endingVariant: "아메리카노 한 잔 주다.",
    wrongClassifier: "아메리카노 한 조각 주세요.",
    awkwardQuantity: "아메리카노 스물세 잔 주문할게요.",
  },
  "orange-juice-order": {
    particleAbsent: "오렌지 주스 주세요.",
    deformedParticle: "오렌지 주스늘 주세요.",
    endingVariant: "오렌지 주스 한 잔 주다.",
    wrongClassifier: "오렌지 주스 한 조각 주세요.",
    awkwardQuantity: "오렌지 주스 스물세 잔 주문할게요.",
  },
  "latte-order": {
    particleAbsent: "라떼 주세요.",
    deformedParticle: "라떼늘 주세요.",
    endingVariant: "라떼 한 잔 주다.",
    wrongClassifier: "라떼 한 조각 주세요.",
    awkwardQuantity: "라떼 스물세 잔 주문할게요.",
  },
  "cheesecake-order": {
    particleAbsent: "치즈케이크 주세요.",
    deformedParticle: "치즈케이크늘 주세요.",
    endingVariant: "치즈케이크 한 조각 주다.",
    wrongClassifier: "치즈케이크 한 잔 주세요.",
    awkwardQuantity: "치즈케이크 스물세 조각 주문할게요.",
  },
  repeat: {
    particleAbsent: "다시 말씀해 주세요.",
    deformedParticle: "다시룰 말씀해 주세요.",
    endingVariant: "다시 말하다.",
    wrongClassifier: "다시 한 잔 말씀해 주세요.",
    awkwardQuantity: "다시 세 번 말씀해 주세요.",
  },
  "eat-here": {
    particleAbsent: "매장 먹을게요.",
    deformedParticle: "매장애서 먹을게요.",
    endingVariant: "여기서 먹다.",
    wrongClassifier: "매장에서 한 조각 먹을게요.",
    awkwardQuantity: "여기서 세 번 먹을게요.",
  },
  takeout: {
    particleAbsent: "포장 주세요.",
    deformedParticle: "포장으루 해 주세요.",
    endingVariant: "테이크아웃하다.",
    wrongClassifier: "포장 한 잔 해 주세요.",
    awkwardQuantity: "포장 세 번 부탁드려요.",
  },
  "card-payment": {
    particleAbsent: "카드 결제할게요.",
    deformedParticle: "카드루 결제할게요.",
    endingVariant: "카드로 결제하다.",
    wrongClassifier: "카드 한 잔으로 결제할게요.",
    awkwardQuantity: "카드로 세 번 계산할게요.",
  },
  "cash-payment": {
    particleAbsent: "현금 결제할게요.",
    deformedParticle: "현금으루 결제할게요.",
    endingVariant: "현금으로 결제하다.",
    wrongClassifier: "현금 한 잔으로 결제할게요.",
    awkwardQuantity: "현금으로 세 번 계산할게요.",
  },
  "receipt-yes": {
    particleAbsent: "영수증 받을게요.",
    deformedParticle: "영수증룰 받을게요.",
    endingVariant: "영수증을 받다.",
    wrongClassifier: "영수증 한 조각 받을게요.",
    awkwardQuantity: "영수증 세 번 받을게요.",
  },
  "receipt-no": {
    particleAbsent: "영수증 필요 없어요.",
    deformedParticle: "영수증룰 필요 없어요.",
    endingVariant: "영수증 필요 없다.",
    wrongClassifier: "영수증 한 잔 필요 없어요.",
    awkwardQuantity: "영수증 세 번 필요 없어요.",
  },
};

const HANGUL_BASE = 0xac00;
const HANGUL_VOWEL_COUNT = 21;
const HANGUL_FINAL_COUNT = 28;

function mutateHangulSyllable(value, component) {
  const codePoint = value.codePointAt(0);
  assert.ok(codePoint >= HANGUL_BASE && codePoint <= 0xd7a3);
  const offset = codePoint - HANGUL_BASE;
  let initial = Math.floor(
    offset / (HANGUL_VOWEL_COUNT * HANGUL_FINAL_COUNT),
  );
  let vowel = Math.floor(offset / HANGUL_FINAL_COUNT) % HANGUL_VOWEL_COUNT;
  let final = offset % HANGUL_FINAL_COUNT;

  if (component === "initial") initial = (initial + 1) % 19;
  if (component === "vowel") vowel = (vowel + 1) % HANGUL_VOWEL_COUNT;
  if (component === "batchim") final = final === 0 ? 1 : 0;

  return String.fromCodePoint(
    HANGUL_BASE +
      (initial * HANGUL_VOWEL_COUNT + vowel) * HANGUL_FINAL_COUNT +
      final,
  );
}

function mutateKeyword(keyword, component, indexes = [0]) {
  const syllables = [...normalizeKoreanSpeech(keyword)];
  for (const index of indexes) {
    syllables[index] = mutateHangulSyllable(syllables[index], component);
  }
  return syllables.join("");
}

function replaceNormalizedKeyword(definition, replacement) {
  const keyword = normalizeKoreanSpeech(definition.fuzzyKeywords[0]);
  const canonical = normalizeKoreanSpeech(definition.canonical);
  assert.ok(canonical.includes(keyword), definition.id);
  return canonical.replace(keyword, replacement);
}

function getOtherNodeChoices(intentId) {
  return intentId.startsWith("receipt-")
    ? [card, cash, repeat]
    : [receiptYes, receiptNo];
}

const GENERATED_PROPERTIES_PER_INTENT = 19;

function readMp4Boxes(buffer, start = 0, end = buffer.length) {
  const boxes = [];
  let offset = start;

  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1 && offset + 16 <= end) {
      size = Number(buffer.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }

    assert.ok(size >= headerSize && offset + size <= end);
    boxes.push({ type, start: offset, end: offset + size, headerSize });
    offset += size;
  }

  assert.equal(offset, end);
  return boxes;
}

function findMp4Child(buffer, parent, type) {
  return readMp4Boxes(
    buffer,
    parent.start + parent.headerSize,
    parent.end,
  ).find((box) => box.type === type);
}

function assertMatched(transcript, choices, expectedChoice) {
  const result = matchCafeSpeechIntent(transcript, choices);
  assert.equal(result.reason, "matched");
  assert.equal(result.choice, expectedChoice);
  assert.equal(result.choice.nextNodeId, expectedChoice.nextNodeId);
  return result;
}

function assertUncertain(
  transcript,
  choices,
  expectedChoice,
  expectedConfirmation,
) {
  const result = matchCafeSpeechIntent(transcript, choices);
  assert.equal(result.reason, "uncertain");
  assert.equal(result.choice, expectedChoice);
  assert.equal(result.choice.nextNodeId, expectedChoice.nextNodeId);
  if (expectedConfirmation !== undefined) {
    assert.equal(result.confirmationLabel, expectedConfirmation);
  }
  assert.match(result.feedback, /Intention probablement comprise/);
  assert.match(result.feedback, new RegExp(expectedConfirmation));
}

test("le pilote reste limité à la mission Café à emporter", () => {
  assert.equal(CAFE_SPEECH_PILOT_MISSION_ID, "order-takeout");
});

test("la normalisation ignore espaces, ponctuation et symboles", () => {
  assert.equal(
    normalizeKoreanSpeech("  아 이 스, 아메리카노!!! "),
    "아이스아메리카노",
  );
});

test("les formulations canoniques conservent les DialogueChoice et transitions", () => {
  for (const [choice, choices] of [
    [americano, orderChoices],
    [orangeJuice, orderChoices],
    [latte, orderChoices],
    [cheesecake, orderChoices],
    [repeat, orderChoices],
    [eatHere, [eatHere, repeat]],
    [takeout, [takeout, repeat]],
    [card, [card, cash, repeat]],
    [cash, [card, cash, repeat]],
    [receiptYes, [receiptYes, receiptNo]],
    [receiptNo, [receiptYes, receiptNo]],
  ]) {
    const result = assertMatched(choice.korean, choices, choice);
    assert.equal(result.feedback, null);
  }
});

test("les quatre produits créent quatre états de commande mono-produit distincts", () => {
  const states = CAFE_PILOT_PRODUCT_CHOICES.map((choice) => {
    const result = matchCafeSpeechIntent(choice.korean, orderChoices);
    assert.equal(result.reason, "matched");
    assert.equal(result.choice.nextNodeId, "ped_confirm");

    return applyCafeOrderProductSelection(
      EMPTY_CAFE_ORDER_STATE,
      result.choice,
    );
  });

  assert.deepEqual(
    states,
    [
      { product: "americano" },
      { product: "orange-juice" },
      { product: "latte" },
      { product: "cheesecake" },
    ],
  );
  assert.equal(new Set(states.map(({ product }) => product)).size, 4);
  assert.ok(states.every(({ product }) => typeof product === "string"));
});

test("les quatre choix produit convergent vers le même nœud générique", () => {
  assert.ok(
    CAFE_PILOT_PRODUCT_CHOICES.every(
      ({ nextNodeId }) => nextNodeId === "ped_confirm",
    ),
  );
});

test("les choix aval ne modifient pas le produit enregistré", () => {
  for (const productChoice of CAFE_PILOT_PRODUCT_CHOICES) {
    const selectedState = applyCafeOrderProductSelection(
      EMPTY_CAFE_ORDER_STATE,
      productChoice,
    );

    for (const downstreamChoice of [eatHere, takeout, card, cash]) {
      assert.equal(
        applyCafeOrderProductSelection(selectedState, downstreamChoice),
        selectedState,
      );
    }
  }
});

const productVariantGroups = [
  [
    "Americano",
    americano,
    [
      "아메리카노 주세요.",
      "아이스 아메리카노 주세요.",
      "아메리카노 한 잔 주세요.",
      "아메리카노 하나 주세요.",
      " 아 메 리 카 노 로, 주세요! ",
    ],
  ],
  [
    "Cheesecake",
    cheesecake,
    [
      "케이크 주세요.",
      "치즈케이크 주세요.",
      "치즈케이크 한 조각 주세요.",
      "케이크 한 조각 주세요.",
    ],
  ],
  [
    "Jus d’orange",
    orangeJuice,
    [
      "오렌지 주스 주세요.",
      "오렌지 주스 한 잔 주세요.",
      "주스 주세요.",
      "오 렌 지 주 스 주세요.",
    ],
  ],
  [
    "Latte",
    latte,
    [
      "라떼 주세요.",
      "아이스 라떼 주세요.",
      "라떼 한 잔 주세요.",
      "아이스 라떼 한 잔 주세요.",
    ],
  ],
];

for (const [product, expectedChoice, variants] of productVariantGroups) {
  for (const variant of variants) {
    test(`${product} accepte la variante ciblée : ${variant}`, () => {
      const result = assertMatched(variant, orderChoices, expectedChoice);
      assert.equal(result.feedback, null);
    });
  }
}

test("les anciennes commandes combinées ne sont plus sélectionnées dans le pilote", () => {
  for (const transcript of [
    "아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 주세요.",
    "아이스 라떼 한 잔이랑 치즈케이크 한 조각 주세요.",
  ]) {
    const result = matchCafeSpeechIntent(transcript, orderChoices);
    assert.equal(result.reason, "ambiguous");
    assert.equal(result.choice, null);
  }
});

test("les corrections produit ciblées valident directement avec un conseil", () => {
  const cases = [
    ["아메리가노 주세요.", americano, /아메리카노 한 잔 주세요/],
    ["치스케이크 주세요.", cheesecake, /치즈케이크 한 조각 주세요/],
    [
      "오랜지 주스 한 잔 주세요.",
      orangeJuice,
      /오렌지 주스 한 잔 주세요/,
    ],
    ["아이스 라테 한 잔 주세요.", latte, /라떼 한 잔 주세요/],
  ];

  for (const [transcript, expectedChoice, feedbackPattern] of cases) {
    const result = assertMatched(transcript, orderChoices, expectedChoice);
    assert.match(result.feedback, /un mot a probablement été mal reconnu/);
    assert.match(result.feedback, feedbackPattern);
    assert.equal(
      result.recoveryEvent?.eventName,
      "cafe_speech_probable_transcription_error",
    );
  }
});

test("un classificateur maladroit conserve le produit et la transition métier", () => {
  const cases = [
    [
      "치즈케이크 한 잔 주세요.",
      cheesecake,
      "Commande comprise : cheesecake. Pour une part, dis plutôt “치즈케이크 한 조각 주세요.”",
    ],
    [
      "아메리카노 한 조각 주세요.",
      americano,
      "Commande comprise : americano. Pour une boisson, dis plutôt “아메리카노 한 잔 주세요.”",
    ],
    [
      "라떼 한 조각 주세요.",
      latte,
      "Commande comprise : latte. Pour une boisson, dis plutôt “라떼 한 잔 주세요.”",
    ],
    [
      "오렌지 주스 한 조각 주세요.",
      orangeJuice,
      "Commande comprise : jus d’orange. Pour une boisson, dis plutôt “오렌지 주스 한 잔 주세요.”",
    ],
  ];

  for (const [transcript, expectedChoice, expectedFeedback] of cases) {
    const result = assertMatched(transcript, orderChoices, expectedChoice);
    assert.equal(result.choice.nextNodeId, "ped_confirm");
    assert.equal(result.feedback, expectedFeedback);
    assert.deepEqual(
      applyCafeOrderProductSelection(EMPTY_CAFE_ORDER_STATE, result.choice),
      { product: expectedChoice.orderProduct },
    );
  }
});

test("une quantité ou une terminaison maladroite ne masque pas un produit unique", () => {
  for (const [transcript, expectedChoice] of [
    ["치즈케이크 두 잔 부탁할게요.", cheesecake],
    ["아메리카노 세 조각 주문할게요.", americano],
  ]) {
    const result = assertMatched(transcript, orderChoices, expectedChoice);
    assert.match(result.feedback, /^Commande comprise :/);
  }
});

test("une commande à plusieurs produits non canonique est refusée comme ambiguë", () => {
  for (const transcript of [
    "아메리카노랑 치즈케이크 주세요.",
    "오렌지 주스하고 라떼 주세요.",
  ]) {
    const result = matchCafeSpeechIntent(transcript, orderChoices);
    assert.deepEqual(result, {
      reason: "ambiguous",
      choice: null,
      feedback:
        "J’ai reconnu plusieurs produits. Choisis une seule commande dans cette scène.",
    });
  }
});

test("cheesecake avec un produit étranger ne force pas la branche dessert", () => {
  const result = matchCafeSpeechIntent(
    "치즈케이크랑 샌드위치 주세요.",
    orderChoices,
  );
  assert.equal(result.reason, "out-of-scope");
  assert.equal(result.choice, null);
});

test("une commande hors périmètre ne sélectionne aucune branche", () => {
  for (const transcript of ["카푸치노 주세요.", "아메리카노는 안 주세요."]) {
    const result = matchCafeSpeechIntent(transcript, orderChoices);
    assert.deepEqual(result, {
      reason: "out-of-scope",
      choice: null,
      feedback:
        "Cette réponse ne correspond à aucune commande disponible ici. Choisis americano, jus d’orange, latte ou cheesecake.",
    });
  }
});

test("les variantes naturelles de paiement en espèces sélectionnent le DialogueChoice existant", () => {
  for (const transcript of [
    "현금이요",
    "현금으로 할게요",
    "현금으로 결제할게요",
    "현금으로 계산할게요",
    "현금으로 하겠습니다",
  ]) {
    const result = assertMatched(transcript, [card, cash, repeat], cash);
    assert.equal(result.choice, cash);
    assert.equal(result.choice.nextNodeId, "ped_receipt_cash_takeout");
  }
});

test("les variantes naturelles de paiement par carte sélectionnent le DialogueChoice existant", () => {
  for (const transcript of [
    "카드로 할게요",
    "카드요",
    "카드로 결제할게요",
    "카드로 계산할게요",
    "카드로 하겠습니다",
  ]) {
    const result = assertMatched(transcript, [card, cash, repeat], card);
    assert.equal(result.choice, card);
    assert.equal(result.choice.nextNodeId, "ped_receipt_card_takeout");
  }
});

test("carte et espèces ensemble demandent confirmation sans choisir de branche", () => {
  for (const transcript of [
    "카드 아니면 현금으로 할게요.",
    "현금하고 카드요.",
  ]) {
    assert.deepEqual(matchCafeSpeechIntent(transcript, [card, cash, repeat]), {
      reason: "ambiguous",
      choice: null,
      feedback:
        "J’ai reconnu à la fois carte et espèces. Quel moyen de paiement souhaites-tu utiliser ?",
    });
  }
});

test("sur place accepte toutes les formulations demandées", () => {
  for (const transcript of [
    "네, 먹고 갈게요.",
    "먹고 갈게요.",
    "먹고 가요.",
    "먹고 갈 거예요.",
    "여기서 먹고 갈게요.",
    "매장에서 먹을게요.",
    "매장이요.",
  ]) {
    const result = assertMatched(transcript, [eatHere, takeout, repeat], eatHere);
    assert.equal(result.feedback, null);
  }
});

test("드시고 갈 거예요 valide sur place avec le message personnalisé", () => {
  const result = assertMatched(
    "드시고 갈 거예요.",
    [eatHere, takeout, repeat],
    eatHere,
  );
  assert.equal(
    result.feedback,
    "Intention comprise : sur place. Pour parler de toi, dis plutôt “먹고 갈게요”.",
  );
});

test("les erreurs ciblées de sur place sont corrigées sans confirmation", () => {
  for (const transcript of ["먹고 갈께요.", "먹꼬 갈게요."]) {
    const result = assertMatched(
      transcript,
      [eatHere, takeout, repeat],
      eatHere,
    );
    assert.match(result.feedback, /먹고 갈게요/);
  }
});

test("à emporter accepte toutes les formulations demandées", () => {
  for (const transcript of [
    "포장해 주세요.",
    "포장이요.",
    "포장할게요.",
    "포장으로 해 주세요.",
    "테이크아웃이요.",
    "테이크아웃으로 주세요.",
    "가져갈게요.",
    "가지고 갈게요.",
  ]) {
    assertMatched(transcript, [eatHere, takeout, repeat], takeout);
  }
});

test("테이크아웃 주세요 valide avec une formulation plus naturelle", () => {
  const result = assertMatched(
    "테이크아웃 주세요.",
    [eatHere, takeout, repeat],
    takeout,
  );
  assert.equal(
    result.feedback,
    "Intention comprise : à emporter. Plus naturel : “포장해 주세요” ou “테이크아웃이요”.",
  );
});

test("les corrections explicites de 테이크아웃 valident à emporter", () => {
  const spacedResult = assertMatched(
    "테이크 아웃이요.",
    [eatHere, takeout, repeat],
    takeout,
  );
  assert.equal(spacedResult.feedback, null);

  for (const transcript of ["데이크아웃으로 주세요.", "테이크아우트 주세요."]) {
    const result = assertMatched(
      transcript,
      [eatHere, takeout, repeat],
      takeout,
    );
    assert.match(result.feedback ?? "", /포장해 주세요|테이크아웃이요/);
  }
});

test("les déformations au-delà du seuil strict ne valident pas", () => {
  for (const transcript of ["테이카웃이요.", "데이카우트 주세요."]) {
    const result = matchCafeSpeechIntent(
      transcript,
      [eatHere, takeout, repeat],
    );
    assert.notEqual(result.reason, "matched");
  }
});

test("les confusions aval univoques valident la branche avec un conseil", () => {
  const cases = [
    ["다시 한 번 마씀해 주세요.", [repeat], repeat],
    ["현근으로 할게요.", [card, cash], cash],
    ["영수중 주세요.", [receiptYes, receiptNo], receiptYes],
    ["아니요, 괜찬아요.", [receiptYes, receiptNo], receiptNo],
  ];

  for (const [transcript, choices, expectedChoice] of cases) {
    const result = assertMatched(transcript, choices, expectedChoice);
    assert.match(result.feedback, /probablement été mal reconnu/);
    assert.ok(result.recoveryEvent);
  }
});

test("la distance syllabique reste limitée à une seule édition", () => {
  assert.equal(CAFE_SPEECH_MAX_KEYWORD_DISTANCE, 1);
});

test("la distance décompose initiale, voyelle et batchim", () => {
  for (const [observed, expected] of [
    ["가", "카"],
    ["다", "타"],
    ["바", "파"],
    ["자", "차"],
    ["사", "싸"],
    ["나", "라"],
    ["더", "도"],
    ["배", "베"],
    ["괴", "궤"],
    ["구", "그"],
    ["갸", "겨"],
    ["교", "규"],
    ["각", "가"],
  ]) {
    assert.ok(
      getCafeSyllableDistance(observed, expected) <=
        CAFE_SPEECH_MAX_KEYWORD_DISTANCE,
      `${observed} devrait rester proche de ${expected}`,
    );
  }

  assert.ok(getCafeSyllableDistance("가", "너") > 1);
  assert.ok(getCafeSyllableDistance("카페", "영수증") > 1);
});

for (const intentCase of phoneticIntentCases) {
  const definition = CAFE_SPEECH_INTENTS.find(
    ({ id }) => id === intentCase.intentId,
  );
  const linguisticRule = CAFE_SPEECH_LINGUISTIC_RULES[intentCase.intentId];
  const examples = linguisticPropertyExamples[intentCase.intentId];
  assert.ok(definition, intentCase.intentId);
  assert.ok(linguisticRule, intentCase.intentId);
  assert.ok(examples, intentCase.intentId);

  const keyword = normalizeKoreanSpeech(definition.fuzzyKeywords[0]);
  const naturalVariant =
    definition.validVariants.find(
      (variant) =>
        normalizeKoreanSpeech(variant) !==
        normalizeKoreanSpeech(definition.canonical),
    ) || definition.validVariants[0];
  const singleMutations = Object.fromEntries(
    ["initial", "vowel", "batchim"].map((component) => [
      component,
      replaceNormalizedKeyword(
        definition,
        mutateKeyword(keyword, component),
      ),
    ]),
  );
  const keywordSyllables = [...keyword];
  const omittedKeyword =
    keywordSyllables.length <= 2
      ? `${keywordSyllables[0]}아${keywordSyllables.slice(1).join("")}`
      : keywordSyllables.filter((_, index) => index !== 0).join("");
  const omittedSyllableTranscript = replaceNormalizedKeyword(
    definition,
    omittedKeyword,
  );
  const multiAlteredKeyword = mutateKeyword(keyword, "batchim", [0, 1]);
  const multiAlteredTranscript = replaceNormalizedKeyword(
    definition,
    multiAlteredKeyword,
  );

  const generatedPropertyTests = [
    {
      name: "phrase canonique",
      run() {
        const result = assertMatched(
          definition.canonical,
          intentCase.choices,
          intentCase.expectedChoice,
        );
        assert.equal(result.feedback, null);
      },
    },
    {
      name: "variante naturelle déclarée",
      run() {
        assertMatched(
          naturalVariant,
          intentCase.choices,
          intentCase.expectedChoice,
        );
      },
    },
    ...Object.entries(singleMutations).map(([component, transcript]) => ({
      name: `${component} modifiée automatiquement`,
      run() {
        const result = assertMatched(
          transcript,
          intentCase.choices,
          intentCase.expectedChoice,
        );
        assert.equal(result.recoveryEvent?.alteredSyllables, 1);
        assert.ok(result.recoveryEvent?.signals.includes("keyword-proximity"));
        assert.ok(
          result.recoveryEvent?.signals.some((signal) =>
            [
              "compatible-predicate",
              "coherent-classifier",
              "polarity-marker",
            ].includes(signal),
          ),
        );
      },
    })),
    {
      name: "syllabe fusionnée, omise ou ajoutée avec contexte",
      run() {
        const result = assertMatched(
          omittedSyllableTranscript,
          intentCase.choices,
          intentCase.expectedChoice,
        );
        assert.equal(result.recoveryEvent?.alteredSyllables, 1);
      },
    },
    {
      name: "espacement incorrect",
      run() {
        assertMatched(
          [...normalizeKoreanSpeech(definition.canonical)].join(" "),
          intentCase.choices,
          intentCase.expectedChoice,
        );
      },
    },
    {
      name: "particule absente",
      run() {
        assertMatched(
          examples.particleAbsent,
          intentCase.choices,
          intentCase.expectedChoice,
        );
      },
    },
    {
      name: "particule déformée",
      run() {
        assertMatched(
          examples.deformedParticle,
          intentCase.choices,
          intentCase.expectedChoice,
        );
      },
    },
    {
      name: "terminaison dictionnaire ou différente",
      run() {
        assertMatched(
          examples.endingVariant,
          intentCase.choices,
          intentCase.expectedChoice,
        );
      },
    },
    {
      name: "classificateur incorrect",
      run() {
        const result = assertMatched(
          examples.wrongClassifier,
          intentCase.choices,
          intentCase.expectedChoice,
        );
        assert.ok(result.feedback);
      },
    },
    {
      name: "quantité maladroite",
      run() {
        assertMatched(
          examples.awkwardQuantity,
          intentCase.choices,
          intentCase.expectedChoice,
        );
      },
    },
    {
      name: "mot-clé déformé sans contexte",
      run() {
        const result = matchCafeSpeechIntent(
          mutateKeyword(keyword, "initial"),
          intentCase.choices,
        );
        assert.equal(result.reason, "out-of-scope");
        assert.equal(result.choice, null);
      },
    },
    {
      name: "négation prioritaire",
      run() {
        const result = matchCafeSpeechIntent(
          intentCase.negated,
          intentCase.choices,
        );
        assert.notEqual(result.choice, intentCase.expectedChoice);
      },
    },
    {
      name: "contradiction",
      run() {
        const result = matchCafeSpeechIntent(
          intentCase.competing,
          intentCase.competingChoices || intentCase.choices,
        );
        assert.equal(result.reason, "ambiguous");
        assert.equal(result.choice, null);
      },
    },
    {
      name: "mot réel proche mais différent",
      run() {
        const result = matchCafeSpeechIntent(
          intentCase.realWord,
          intentCase.choices,
        );
        assert.notEqual(result.reason, "matched");
      },
    },
    {
      name: "phrase hors sujet",
      run() {
        const result = matchCafeSpeechIntent(
          "오늘 날씨가 정말 좋아요.",
          intentCase.choices,
        );
        assert.equal(result.reason, "out-of-scope");
      },
    },
    {
      name: "intention d’un autre nœud",
      run() {
        const result = matchCafeSpeechIntent(
          definition.canonical,
          getOtherNodeChoices(intentCase.intentId),
        );
        assert.equal(result.reason, "out-of-scope");
        assert.equal(result.choice, null);
      },
    },
    {
      name: "deux syllabes altérées diminuent la confiance",
      run() {
        const details = getCafeSyllableDistanceDetails(
          multiAlteredKeyword,
          keyword,
        );
        assert.equal(details.alteredSyllables, 2);
        assert.ok(
          details.alteredSyllables >
            CAFE_SPEECH_MAX_AUTO_KEYWORD_ALTERATIONS,
        );
        assert.ok(details.distance <= CAFE_SPEECH_MAX_KEYWORD_DISTANCE);
        const result = matchCafeSpeechIntent(
          multiAlteredTranscript,
          intentCase.choices,
        );
        assert.equal(result.reason, "uncertain");
        assert.equal(result.choice, intentCase.expectedChoice);
      },
    },
  ];

  assert.equal(
    generatedPropertyTests.length,
    GENERATED_PROPERTIES_PER_INTENT,
  );
  for (const propertyTest of generatedPropertyTests) {
    test(
      `${intentCase.label} [matrice]: ${propertyTest.name}`,
      propertyTest.run,
    );
  }
}

for (const intentCase of phoneticIntentCases) {
  test(`${intentCase.label}: initiale, voyelle et batchim restent contextuels`, () => {
    for (const transcript of intentCase.mutations) {
      const result = assertMatched(
        transcript,
        intentCase.choices,
        intentCase.expectedChoice,
      );
      assert.equal(
        result.feedback,
        `Intention comprise, mais un mot a probablement été mal reconnu. Formulation recommandée : “${result.recoveryEvent?.canonical}”`,
      );
      assert.equal(
        result.recoveryEvent?.eventName,
        "cafe_speech_probable_transcription_error",
      );
      assert.ok(result.recoveryEvent.syllableDistance <= 1);
      assert.ok(result.recoveryEvent.score > 0);
      assert.ok(result.recoveryEvent.signals.includes("keyword-proximity"));
      assert.ok(result.recoveryEvent.signals.includes("node-available"));
      assert.ok(
        result.recoveryEvent.signals.some((signal) =>
          [
            "compatible-predicate",
            "coherent-classifier",
            "polarity-marker",
          ].includes(signal),
        ),
      );
    }
  });

  test(`${intentCase.label}: un espace incorrect ne change pas l’intention`, () => {
    assertMatched(
      intentCase.spaced,
      intentCase.choices,
      intentCase.expectedChoice,
    );
  });

  test(`${intentCase.label}: le mot déformé isolé ne suffit jamais`, () => {
    const result = matchCafeSpeechIntent(
      intentCase.isolated,
      intentCase.choices,
    );
    assert.equal(result.reason, "out-of-scope");
    assert.equal(result.choice, null);
  });

  test(`${intentCase.label}: mot réel, négation et contradiction ne valident pas`, () => {
    for (const transcript of [
      intentCase.realWord,
      intentCase.negated,
      intentCase.contradiction,
      "오늘 날씨가 정말 좋아요.",
    ]) {
      const result = matchCafeSpeechIntent(transcript, intentCase.choices);
      assert.notEqual(result.reason, "matched", transcript);
    }
  });

  test(`${intentCase.label}: deux intentions rapprochées restent ambiguës`, () => {
    const result = matchCafeSpeechIntent(
      intentCase.competing,
      intentCase.competingChoices || intentCase.choices,
    );
    assert.equal(result.reason, "ambiguous");
    assert.equal(result.choice, null);
  });
}

test("les variantes naturelles étendues restent contextuelles", () => {
  for (const [transcript, choices, expectedChoice] of [
    ["여기서 마실게요.", [eatHere, takeout, repeat], eatHere],
    ["가지고 가요.", [eatHere, takeout, repeat], takeout],
    ["카드로 부탁드려요.", [card, cash, repeat], card],
    ["현금으로 낼게요.", [card, cash, repeat], cash],
    ["필요해요.", [receiptYes, receiptNo], receiptYes],
    ["안 받을게요.", [receiptYes, receiptNo], receiptNo],
  ]) {
    assertMatched(transcript, choices, expectedChoice);
  }
});

test("les formes familières valident avec une correction non bloquante", () => {
  for (const [transcript, choices, expectedChoice, feedbackPattern] of [
    ["아메리카노 줘.", orderChoices, americano, /한 잔 주세요/],
    ["먹고 가.", [eatHere, takeout, repeat], eatHere, /Plus poli/],
    ["포장.", [eatHere, takeout, repeat], takeout, /Plus naturel/],
    ["카드.", [card, cash, repeat], card, /Plus poli/],
    ["영수증.", [receiptYes, receiptNo], receiptYes, /Plus poli/],
  ]) {
    const result = assertMatched(transcript, choices, expectedChoice);
    assert.match(result.feedback, feedbackPattern);
  }
});

test("les confusions du reçu valident uniquement au nœud reçu", () => {
  for (const [transcript, expectedChoice, canonicalPattern] of [
    ["영수쯩 주세요.", receiptYes, /영수증 주세요/],
    ["영수증 피료 없어요.", receiptNo, /괜찮아요/],
    ["영수증 필요 업어요.", receiptNo, /괜찮아요/],
  ]) {
    const result = assertMatched(
      transcript,
      [receiptYes, receiptNo],
      expectedChoice,
    );
    assert.match(result.feedback, /probablement été mal reconnu/);
    assert.match(result.feedback, canonicalPattern);
  }
});

test("향수 conserve son sens réel et n’est pas transformé en reçu", () => {
  for (const transcript of ["향수 주세요.", "향수 냄새가 좋아요."]) {
    const result = matchCafeSpeechIntent(transcript, [receiptYes, receiptNo]);
    assert.equal(result.reason, "out-of-scope");
    assert.equal(result.choice, null);
  }
});

test("sur place et à emporter ensemble ne sélectionnent aucune branche", () => {
  for (const transcript of [
    "먹고 갈게요, 포장도 해 주세요.",
    "매장에서요 아니면 테이크아웃이요.",
  ]) {
    assert.deepEqual(
      matchCafeSpeechIntent(transcript, [eatHere, takeout, repeat]),
      {
        reason: "ambiguous",
        choice: null,
        feedback:
          "J’ai reconnu à la fois sur place et à emporter. Choisis une seule option.",
      },
    );
  }
});

test("oui et non ensemble au nœud reçu ne sélectionnent aucune branche", () => {
  for (const transcript of [
    "네, 아니요, 괜찮아요.",
    "영수증 주세요. 필요 없어요.",
  ]) {
    assert.deepEqual(
      matchCafeSpeechIntent(transcript, [receiptYes, receiptNo]),
      {
        reason: "ambiguous",
        choice: null,
        feedback:
          "J’ai reconnu à la fois oui et non pour le reçu. Indique clairement si tu le souhaites.",
      },
    );
  }
});

test("une négation de paiement ne force jamais le mot-clé détecté", () => {
  for (const transcript of [
    "카드로 안 할게요.",
    "현금은 필요 없어요.",
    "카드가 없어요.",
  ]) {
    const result = matchCafeSpeechIntent(transcript, [card, cash, repeat]);
    assert.equal(result.reason, "out-of-scope");
    assert.equal(result.choice, null);
  }
});

test("la négation contrastive inverse la décision sans créer de contradiction", () => {
  for (const [transcript, choices, expectedChoice] of [
    ["카드 말고 현금으로 할게요.", [card, cash, repeat], cash],
    ["현금 말고 카드로 결제할게요.", [card, cash, repeat], card],
    ["매장 말고 포장해 주세요.", [eatHere, takeout, repeat], takeout],
    ["포장 말고 매장에서 먹을게요.", [eatHere, takeout, repeat], eatHere],
    ["괜찮아요 아니고 영수증 필요해요.", [receiptYes, receiptNo], receiptYes],
  ]) {
    assertMatched(transcript, choices, expectedChoice);
  }
});

test("une variation syllabique unique et soutenue récupère une seule intention", () => {
  for (const [transcript, expectedChoice] of [
    ["아메리카농 주세요.", americano],
    ["치즈케이쿠 주세요.", cheesecake],
  ]) {
    const result = assertMatched(transcript, orderChoices, expectedChoice);
    assert.match(result.feedback, /un mot a probablement été mal reconnu/);
    assert.ok(result.recoveryEvent);
  }
});

test("le rapprochement syllabique refuse les phrases sans indice de commande", () => {
  for (const transcript of [
    "아메리카농 날씨가 좋아요.",
    "영수실에 가요.",
    "테이크아웅은 재미있어요.",
    "말씀이 아름다워요.",
  ]) {
    const result = matchCafeSpeechIntent(transcript, orderChoices);
    assert.equal(result.reason, "out-of-scope");
    assert.equal(result.choice, null);
  }
});

test("un nom de produit dans une phrase sans commande reste hors périmètre", () => {
  for (const transcript of [
    "아메리카노는 맛있어요.",
    "라떼를 공부해요.",
    "치즈케이크 사진이에요.",
  ]) {
    const result = matchCafeSpeechIntent(transcript, orderChoices);
    assert.equal(result.reason, "out-of-scope");
    assert.equal(result.choice, null);
  }
});

test("les confusions d’un autre nœud ne fuient pas dans le contexte courant", () => {
  for (const [transcript, choices] of [
    ["향수 주세요.", orderChoices],
    ["가드로 할게요.", [receiptYes, receiptNo]],
    ["오랜지 주스 주세요.", [card, cash, repeat]],
  ]) {
    const result = matchCafeSpeechIntent(transcript, choices);
    assert.equal(result.reason, "out-of-scope");
    assert.equal(result.choice, null);
  }
});

test("un indice trop faible demande confirmation au lieu de valider", () => {
  assertUncertain(
    "현금만.",
    [card, cash, repeat],
    cash,
    "un paiement en espèces",
  );
});

test("toutes les intentions connues restent hors périmètre hors de leur nœud", () => {
  const cases = [
    ["아메리카노 주세요.", [takeout, repeat]],
    ["치즈케이크 주세요.", [takeout, repeat]],
    ["포장이요.", [card, cash, repeat]],
    ["카드요.", [receiptYes, receiptNo]],
    ["현금이요.", [receiptYes, receiptNo]],
    ["영수증 주세요.", [card, cash, repeat]],
  ];

  for (const [transcript, choices] of cases) {
    const result = matchCafeSpeechIntent(transcript, choices);
    assert.equal(result.reason, "out-of-scope");
    assert.equal(result.choice, null);
  }
});

test("une transcription vide ne déclenche aucune branche", () => {
  assert.deepEqual(matchCafeSpeechIntent("  ...  ", orderChoices), {
    reason: "empty",
    choice: null,
    feedback: "Aucune réponse n’a été reconnue. Recommence.",
  });
});

test("le feedback produit indisponible reste exact", () => {
  assert.equal(
    buildCafeUnavailableFeedback(orderChoices),
    "Cette réponse ne correspond à aucune commande disponible ici. Choisis americano, jus d’orange, latte ou cheesecake.",
  );
});

test("le contexte natif contient les variantes valides, pas les confusions", () => {
  const contextualStrings = getCafeSpeechContextualStrings(orderChoices);
  assert.ok(contextualStrings.includes("오렌지 주스 한 잔 주세요."));
  assert.ok(contextualStrings.includes("아이스 라떼 한 잔 주세요."));
  assert.ok(!contextualStrings.includes("아메리가노 주세요."));
  assert.ok(!contextualStrings.includes("오랜지 쥬스 한 잔 주세요."));
  assert.ok(
    !contextualStrings.includes(
      "아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 주세요.",
    ),
  );
  assert.ok(
    !contextualStrings.includes(
      "아이스 라떼 한 잔이랑 치즈케이크 한 조각 주세요.",
    ),
  );
});

test("le MP4 générique existe et contient une structure MP4 lisible", () => {
  const videoUrl = new URL(
    "../assets/ai/cafe/orderConfirmation.mp4",
    import.meta.url,
  );
  assert.ok(statSync(videoUrl).size > 0);

  const video = readFileSync(videoUrl);
  const topLevelBoxes = readMp4Boxes(video);
  const boxTypes = topLevelBoxes.map(({ type }) => type);
  assert.ok(boxTypes.includes("ftyp"));
  assert.ok(boxTypes.includes("moov"));
  assert.ok(boxTypes.includes("mdat"));

  const moov = topLevelBoxes.find(({ type }) => type === "moov");
  const mvhd = findMp4Child(video, moov, "mvhd");
  const mvhdPayload = mvhd.start + mvhd.headerSize;
  const mvhdVersion = video.readUInt8(mvhdPayload);
  const movieTimescale = video.readUInt32BE(
    mvhdPayload + (mvhdVersion === 1 ? 20 : 12),
  );
  const movieDuration =
    mvhdVersion === 1
      ? Number(video.readBigUInt64BE(mvhdPayload + 24))
      : video.readUInt32BE(mvhdPayload + 16);
  assert.ok(movieTimescale > 0);
  assert.ok(movieDuration / movieTimescale > 0);

  const tracks = readMp4Boxes(
    video,
    moov.start + moov.headerSize,
    moov.end,
  )
    .filter(({ type }) => type === "trak")
    .map((trak) => {
      const tkhd = findMp4Child(video, trak, "tkhd");
      const mdia = findMp4Child(video, trak, "mdia");
      const hdlr = findMp4Child(video, mdia, "hdlr");
      const minf = findMp4Child(video, mdia, "minf");
      const stbl = findMp4Child(video, minf, "stbl");
      const stsd = findMp4Child(video, stbl, "stsd");
      const handlerType = video.toString(
        "ascii",
        hdlr.start + hdlr.headerSize + 8,
        hdlr.start + hdlr.headerSize + 12,
      );
      const sampleEntryStart = stsd.start + stsd.headerSize + 8;

      return {
        handlerType,
        codec: video.toString(
          "ascii",
          sampleEntryStart + 4,
          sampleEntryStart + 8,
        ),
        width: video.readUInt32BE(tkhd.end - 8) / 65536,
        height: video.readUInt32BE(tkhd.end - 4) / 65536,
      };
    });

  const videoTrack = tracks.find(({ handlerType }) => handlerType === "vide");
  const audioTrack = tracks.find(({ handlerType }) => handlerType === "soun");
  assert.ok(videoTrack);
  assert.ok(videoTrack.width > 0 && videoTrack.height > 0);
  assert.match(videoTrack.codec, /^[a-zA-Z0-9]{4}$/);
  assert.ok(audioTrack);
  assert.match(audioTrack.codec, /^[a-zA-Z0-9]{4}$/);
});

test("les confirmations du pilote partagent la réplique et le seul MP4 générique", () => {
  const dataSource = readFileSync(
    new URL("../data/lesson/cafe/cafe.ts", import.meta.url),
    "utf8",
  );
  const missionSource = readFileSync(
    new URL("../data/lesson/cafe/cafeMissions.ts", import.meta.url),
    "utf8",
  );
  const runtimeSource = readFileSync(
    new URL("../app/lesson/cafeIA.tsx", import.meta.url),
    "utf8",
  );

  assert.match(dataSource, /assets\/ai\/cafe\/orderConfirmation\.mp4/);
  assert.match(
    dataSource,
    /네, 알겠습니다\. 드시고 가세요\? 아니면 포장해 드릴까요\?/,
  );
  assert.match(
    dataSource,
    /Très bien\. Vous consommez sur place ou à emporter \?/,
  );
  for (const nodeId of ["ped_confirm", "ped_confirm_alt"]) {
    assert.match(
      missionSource,
      new RegExp(
        `applyGenericOrderConfirmation\\(missionScenario, "${nodeId}"\\)`,
      ),
    );
  }
  assert.doesNotMatch(
    missionSource,
    /applyGenericOrderConfirmation\([^\n]*real_/,
  );

  assert.match(dataSource, /orderConfirmationJuice\.mp4/);
  assert.match(dataSource, /orderConfirmationCake\.mp4/);
  assert.match(runtimeSource, /orderConfirmationJuiceReal\.mp4/);
  assert.match(runtimeSource, /orderConfirmationCakeReal\.mp4/);
  assert.match(
    missionSource,
    /case "order_takeout":[\s\S]*?applyGenericOrderConfirmation\(missionScenario, "ped_confirm"\)[\s\S]*?applyGenericOrderConfirmation\(missionScenario, "ped_confirm_alt"\)/,
  );
});

test("le pilote remplace les choix combinés et conserve aide et transitions aval", () => {
  const missionSource = readFileSync(
    new URL("../data/lesson/cafe/cafeMissions.ts", import.meta.url),
    "utf8",
  );
  const guidedTurnSource = readFileSync(
    new URL("../components/GuidedSpeechTurn.tsx", import.meta.url),
    "utf8",
  );
  const runtimeSource = readFileSync(
    new URL("../app/lesson/cafeIA.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    missionSource,
    /case "order_takeout":[\s\S]*?replacePilotProductChoices\(missionScenario\)/,
  );
  assert.match(
    missionSource,
    /case "order_simple":[\s\S]*?"ped_order1"/,
  );
  assert.match(
    missionSource,
    /case "order_dessert":[\s\S]*?"ped_order2"/,
  );
  assert.match(missionSource, /"ped_here_drink"/);
  assert.match(missionSource, /"ped_here_cake"/);
  assert.match(runtimeSource, /applyCafeOrderProductSelection\(state, choice\)/);
  assert.match(guidedTurnSource, /accessibilityLabel="Besoin d’aide"/);
  assert.match(guidedTurnSource, /CHOIX EXISTANTS/);
});

test("permission acceptée puis écoute", () => {
  const requested = speechRecognitionReducer(
    INITIAL_SPEECH_RECOGNITION_STATE,
    { type: "request" },
  );
  const starting = speechRecognitionReducer(requested, {
    type: "permission-result",
    granted: true,
  });
  const listening = speechRecognitionReducer(starting, {
    type: "native-start",
  });

  assert.equal(requested.status, "requesting-permission");
  assert.equal(starting.status, "starting");
  assert.equal(listening.status, "listening");
});

test("permission refusée conserve le fallback", () => {
  const requested = speechRecognitionReducer(
    INITIAL_SPEECH_RECOGNITION_STATE,
    { type: "request" },
  );
  const denied = speechRecognitionReducer(requested, {
    type: "permission-result",
    granted: false,
  });

  assert.equal(denied.status, "permission-denied");
  assert.match(denied.message, /Besoin d’aide/);
});

test("arrêt manuel traite la dernière transcription", () => {
  const listening = {
    status: "listening",
    transcript: "카드로 할게요.",
    message: null,
  };
  const processing = speechRecognitionReducer(listening, { type: "stop" });
  const recognized = speechRecognitionReducer(processing, {
    type: "final",
    transcript: listening.transcript,
  });

  assert.equal(processing.status, "processing");
  assert.equal(recognized.status, "recognized");
});

test("transcription vide, nouvelle tentative, changement de nœud et sortie", () => {
  const empty = speechRecognitionReducer(
    INITIAL_SPEECH_RECOGNITION_STATE,
    { type: "final", transcript: "" },
  );
  const retry = speechRecognitionReducer(empty, { type: "request" });
  const nodeChange = speechRecognitionReducer(retry, { type: "reset" });
  const screenExit = speechRecognitionReducer(nodeChange, { type: "reset" });

  assert.equal(empty.status, "empty");
  assert.equal(retry.status, "requesting-permission");
  assert.deepEqual(nodeChange, INITIAL_SPEECH_RECOGNITION_STATE);
  assert.deepEqual(screenExit, INITIAL_SPEECH_RECOGNITION_STATE);
});

test("les erreurs natives sont classées sans sélection métier", () => {
  assert.equal(classifySpeechRecognitionError("not-allowed"), "permission-denied");
  assert.equal(classifySpeechRecognitionError("service-not-allowed"), "unavailable");
  assert.equal(classifySpeechRecognitionError("no-speech"), "empty");
  assert.equal(classifySpeechRecognitionError("audio-capture"), "error");
  assert.equal(classifySpeechRecognitionError("aborted"), "cancelled");
});
