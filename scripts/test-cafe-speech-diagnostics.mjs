import assert from "node:assert/strict";
import test from "node:test";

import {
  getCafeSpeechContextualStrings,
  matchCafeSpeechIntent,
} from "../lib/cafeSpeechDiagnostics.ts";

const americano = {
  id: "ped_order_americano",
  label: "Un americano.",
  korean: "아메리카노 주세요.",
  nextNodeId: "ped_confirm",
  orderProduct: "americano",
};
const orangeJuice = {
  id: "ped_order_orange_juice",
  label: "Un jus d’orange.",
  korean: "오렌지 주스 주세요.",
  nextNodeId: "ped_confirm",
  orderProduct: "orange-juice",
};
const latte = {
  id: "ped_order_latte",
  label: "Un latte.",
  korean: "라떼 주세요.",
  nextNodeId: "ped_confirm",
  orderProduct: "latte",
};
const cheesecake = {
  id: "ped_order_cheesecake",
  label: "Une part de cheesecake.",
  korean: "치즈케이크 주세요.",
  nextNodeId: "ped_confirm",
  orderProduct: "cheesecake",
};
const repeat = {
  id: "repeat_ped1",
  label: "Demander de répéter.",
  korean: "다시 한번 말씀해 주세요.",
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

const orderChoices = [americano, orangeJuice, latte, cheesecake, repeat];

test("une quantité plurielle ne valide pas silencieusement le choix produit singulier", () => {
  for (const [transcript, expectedChoice] of [
    ["아이스 아메리카노 두 잔 주세요.", americano],
    ["오렌지 주스 세 잔 주세요.", orangeJuice],
    ["라떼 4잔 주세요.", latte],
    ["치즈케이크 스물세 조각 주세요.", cheesecake],
  ]) {
    const result = matchCafeSpeechIntent(transcript, orderChoices);
    assert.equal(result.reason, "uncertain", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.match(result.feedback, /quantité|plusieurs/u, transcript);
    assert.match(result.feedback, /Ce n’est pas une faute de coréen/u, transcript);
  }
});

test("une quantité singulière naturelle reste acceptée", () => {
  for (const transcript of [
    "아메리카노 한 잔 주세요.",
    "오렌지 주스 한 잔 주세요.",
    "라떼 한 잔 주세요.",
    "치즈케이크 한 조각 주세요.",
  ]) {
    assert.equal(matchCafeSpeechIntent(transcript, orderChoices).reason, "matched");
  }
});

test("아아 reste un americano clair mais 블랙커피 demande confirmation", () => {
  const abbreviation = matchCafeSpeechIntent("아아 한 잔 주세요.", orderChoices);
  assert.equal(abbreviation.reason, "matched");
  assert.equal(abbreviation.choice?.id, americano.id);

  const blackCoffee = matchCafeSpeechIntent("블랙커피 한 잔 주세요.", orderChoices);
  assert.equal(blackCoffee.reason, "uncertain");
  assert.equal(blackCoffee.choice?.id, americano.id);
  assert.match(blackCoffee.feedback, /ne désigne pas forcément un americano/u);
});

test("dire explicitement intérieur ou café valide sur place sans confirmation inutile", () => {
  for (const transcript of ["안에서 먹을게요.", "카페에서 마실게요."]) {
    const result = matchCafeSpeechIntent(transcript, [eatHere, takeout]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, eatHere.id, transcript);
  }

  const lessExplicit = matchCafeSpeechIntent("여기 앉을게요.", [eatHere, takeout]);
  assert.equal(lessExplicit.reason, "uncertain");
  assert.equal(lessExplicit.choice?.id, eatHere.id);
});

test("dehors ne signifie pas automatiquement à emporter", () => {
  const carryAway = matchCafeSpeechIntent("들고 갈게요.", [eatHere, takeout]);
  assert.equal(carryAway.reason, "matched");
  assert.equal(carryAway.choice?.id, takeout.id);

  const outside = matchCafeSpeechIntent("밖에서 먹을게요.", [eatHere, takeout]);
  assert.equal(outside.reason, "uncertain");
  assert.equal(outside.choice?.id, takeout.id);
  assert.match(outside.feedback, /terrasse|pas certain/u);
});

test("un oui explicite au reçu est validé tandis que 주세요 seul reste à confirmer", () => {
  for (const transcript of [
    "종이로 주세요.",
    "출력해 주세요.",
    "프린트해 주세요.",
    "필요합니다.",
  ]) {
    const result = matchCafeSpeechIntent(transcript, [receiptYes, receiptNo]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, receiptYes.id, transcript);
  }

  const bareRequest = matchCafeSpeechIntent("주세요.", [receiptYes, receiptNo]);
  assert.equal(bareRequest.reason, "uncertain");
  assert.equal(bareRequest.choice?.id, receiptYes.id);
});

test("les formes dictionnaire restent comprises mais reçoivent le bon diagnostic", () => {
  for (const [transcript, choices, expectedChoice] of [
    ["아메리카노 한 잔 주다.", orderChoices, americano],
    ["다시 말하다.", [repeat], repeat],
    ["여기서 먹다.", [eatHere, takeout], eatHere],
    ["포장하다.", [eatHere, takeout], takeout],
    ["카드로 결제하다.", [card, cash], card],
    ["현금으로 계산하다.", [card, cash], cash],
    ["영수증을 받다.", [receiptYes, receiptNo], receiptYes],
  ]) {
    const result = matchCafeSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.match(result.feedback ?? "", /forme de dictionnaire|forme neutre/u, transcript);
    assert.match(result.feedback ?? "", /polie/u, transcript);
  }
});

test("les compteurs incohérents hors commande reçoivent un diagnostic spécifique", () => {
  for (const [transcript, choices, expectedChoice, pattern] of [
    ["다시 한 잔 말씀해 주세요.", [repeat], repeat, /번/u],
    ["포장 한 잔 해 주세요.", [eatHere, takeout], takeout, /à emporter|option/u],
    ["카드 한 잔으로 결제할게요.", [card, cash], card, /compteur.*rôle/u],
    ["영수증 한 조각 받을게요.", [receiptYes, receiptNo], receiptYes, /compteur/u],
  ]) {
    const result = matchCafeSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.match(result.feedback ?? "", pattern, transcript);
  }
});

test("les particules clairement déformées sont diagnostiquées sans bloquer l’intention", () => {
  for (const [transcript, choices, expectedChoice, pattern] of [
    ["카드루 할게요.", [card, cash], card, /로/u],
    ["현금으루 할게요.", [card, cash], cash, /으로/u],
    ["포장으루 해 주세요.", [eatHere, takeout], takeout, /으로/u],
    ["영수증룰 받을게요.", [receiptYes, receiptNo], receiptYes, /을\/를/u],
    ["다시룰 말씀해 주세요.", [repeat], repeat, /adverbe|particule/u],
  ]) {
    const result = matchCafeSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.match(result.feedback ?? "", pattern, transcript);
  }
});

test("les chaînes contextuelles n’encouragent plus la commande plurielle obsolète", () => {
  const contextualStrings = getCafeSpeechContextualStrings(orderChoices);
  assert.equal(
    contextualStrings.includes("아이스 아메리카노 두 잔 주세요."),
    false,
  );
  assert.equal(contextualStrings.includes("아아 한 잔 주세요."), true);
});
