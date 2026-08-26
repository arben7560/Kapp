import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildCafeConversationSummary,
  createCafeConversationMemory,
  groupCafeImperfections,
  recordCafeSpeechAttempt,
} from "../lib/cafeConversationMemory.ts";
import {
  getCafeSpeechAttemptPedagogy,
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

function remember(
  memory,
  { nodeId, stepIndex, stepLabel, transcript, choices },
) {
  const result = matchCafeSpeechIntent(transcript, choices);
  return recordCafeSpeechAttempt(memory, {
    nodeId,
    stepIndex,
    stepLabel,
    recordedTranscript: transcript,
    result,
    intent: getCafeSpeechAttemptPedagogy(result, choices, transcript),
  });
}

test("une incertitude sémantique n’est plus attribuée au micro", () => {
  for (const [transcript, choices] of [
    ["아이스 아메리카노 두 잔 주세요.", orderChoices],
    ["블랙커피 한 잔 주세요.", orderChoices],
    ["밖에서 먹을게요.", [eatHere, takeout]],
  ]) {
    const memory = remember(createCafeConversationMemory(), {
      nodeId: `node:${transcript}`,
      stepIndex: 1,
      stepLabel: "Choix",
      transcript,
      choices,
    });
    const summary = buildCafeConversationSummary(memory);

    assert.equal(memory.attempts[0].resultType, "needs-confirmation", transcript);
    assert.equal(summary.needsConfirmation.length, 1, transcript);
    assert.equal(summary.uncertainRecognition.length, 0, transcript);
    assert.equal(summary.improvements.length, 0, transcript);
  }
});

test("une vraie récupération ASR reste séparée des fautes utilisateur", () => {
  const memory = remember(createCafeConversationMemory(), {
    nodeId: "ped_choice1",
    stepIndex: 1,
    stepLabel: "Choix",
    transcript: "아메리카농 주세요.",
    choices: orderChoices,
  });
  const summary = buildCafeConversationSummary(memory);

  assert.equal(memory.attempts[0].resultType, "probable-transcription-error");
  assert.equal(summary.uncertainRecognition.length, 1);
  assert.equal(summary.needsConfirmation.length, 0);
  assert.match(
    summary.uncertainRecognition[0].explanation,
    /micro|reconnaissance/u,
  );
});

test("deux diagnostics différents sur la même intention restent séparés", () => {
  let memory = createCafeConversationMemory();
  for (const transcript of ["카드 할게요.", "카드로 해."]) {
    memory = remember(memory, {
      nodeId: "ped_choice3_takeout",
      stepIndex: 2,
      stepLabel: "Paiement",
      transcript,
      choices: [card, cash, repeat],
    });
  }

  const groups = groupCafeImperfections(memory.attempts);
  assert.equal(groups.length, 2);
  assert.ok(groups.every(({ intentId }) => intentId === "card-payment"));
  assert.notEqual(groups[0].explanation, groups[1].explanation);
});

test("la répétition exacte du même diagnostic reste regroupée", () => {
  let memory = createCafeConversationMemory();
  for (let index = 0; index < 2; index += 1) {
    memory = remember(memory, {
      nodeId: "ped_choice3_takeout",
      stepIndex: 2,
      stepLabel: "Paiement",
      transcript: "카드 할게요.",
      choices: [card, cash, repeat],
    });
  }

  const groups = groupCafeImperfections(memory.attempts);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].attemptCount, 2);
});

test("la phrase à retenir cible d’abord un point à consolider", () => {
  let memory = remember(createCafeConversationMemory(), {
    nodeId: "ped_choice1",
    stepIndex: 1,
    stepLabel: "Choix",
    transcript: "아메리카노 한 잔 주세요.",
    choices: orderChoices,
  });
  memory = remember(memory, {
    nodeId: "ped_choice3_takeout",
    stepIndex: 2,
    stepLabel: "Paiement",
    transcript: "라떼 주세요.",
    choices: [card, cash, repeat],
  });

  const summary = buildCafeConversationSummary(memory);
  assert.equal(summary.canonicalReferencePhrases[0], "아메리카노 한 잔 주세요.");
  assert.equal(summary.improvements.length, 1);
  assert.equal(summary.recommendedPhrase, "카드로 할게요.");
});

test("les difficultés non résolues sont prioritaires dans À revoir", () => {
  let memory = remember(createCafeConversationMemory(), {
    nodeId: "ped_choice1",
    stepIndex: 1,
    stepLabel: "Choix",
    transcript: "아메리카노 한 조각 주세요.",
    choices: orderChoices,
  });
  memory = remember(memory, {
    nodeId: "ped_choice1",
    stepIndex: 1,
    stepLabel: "Choix",
    transcript: "아메리카노 한 잔 주세요.",
    choices: orderChoices,
  });
  memory = remember(memory, {
    nodeId: "ped_choice3_takeout",
    stepIndex: 2,
    stepLabel: "Paiement",
    transcript: "라떼 주세요.",
    choices: [card, cash, repeat],
  });

  const summary = buildCafeConversationSummary(memory);
  assert.equal(summary.improvements.length, 2);
  assert.equal(summary.improvements[0].correctedDuringScene, false);
  assert.equal(summary.improvements[1].correctedDuringScene, true);
});

test("le bilan valorise aussi la décision concernant le reçu", () => {
  let memory = remember(createCafeConversationMemory(), {
    nodeId: "ped_choice1",
    stepIndex: 1,
    stepLabel: "Choix",
    transcript: "아메리카노 한 잔 주세요.",
    choices: orderChoices,
  });
  memory = remember(memory, {
    nodeId: "ped_receipt_choice_takeout",
    stepIndex: 2,
    stepLabel: "Paiement",
    transcript: "아니요, 괜찮아요.",
    choices: [receiptYes, receiptNo],
  });

  const summary = buildCafeConversationSummary(memory);
  assert.ok(summary.successfulPoints.includes("Décision concernant le reçu comprise"));
  assert.ok(summary.successfulPoints.includes("2 réponses validées sans correction"));
});

test("la modale expose les trois niveaux pédagogiques et la phrase recommandée", () => {
  const source = readFileSync(
    new URL(
      "../components/cafe/CafeConversationSummaryModal.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /À revoir/u);
  assert.match(source, /À confirmer/u);
  assert.match(source, /Transcription à vérifier/u);
  assert.match(source, /summary\.recommendedPhrase/u);
  assert.match(source, /Résolu pendant la scène/u);
  assert.match(source, /Formulation de référence/u);
});
