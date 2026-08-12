import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";

import {
  RESTAURANT_SPEECH_INTENTS,
  getRestaurantSpeechChoiceIntent,
  getRestaurantSpeechContextualStrings,
  matchRestaurantSpeechIntent,
} from "../lib/restaurantSpeechIntents.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      const isLocalExtensionlessImport =
        error?.code === "ERR_MODULE_NOT_FOUND" &&
        /^\.{1,2}\//.test(specifier) &&
        !/\.[a-z]+$/i.test(specifier);

      if (isLocalExtensionlessImport) {
        return nextResolve(`${specifier}.ts`, context);
      }

      throw error;
    }
  },
});

const { restaurantDialogueData } = await import(
  "../data/lesson/restaurant/restaurant.ts"
);
const {
  RESTAURANT_SPEECH_MISSION_ID,
  getRestaurantMissionById,
  getRestaurantMissionScenario,
  restaurantMissions,
} = await import("../data/lesson/restaurant/restaurantMissions.ts");

const scenario = restaurantDialogueData.pedagogical;

function choices(nodeId) {
  const nodeChoices = scenario.nodes[nodeId]?.choices;
  assert.ok(nodeChoices, `${nodeId} doit être un tour utilisateur`);
  return nodeChoices;
}

const meatChoices = choices("ped_meat_choice");
const recommendationChoices = choices("ped_after_recommendation_choice");
const grillChoices = choices("ped_grill_choice_samgyeopsal");
const sideChoices = choices("ped_side_choice");
const spiceChoices = choices("ped_spicy_choice");
const extraChoices = choices("ped_extra_choice");
const paymentChoices = choices("ped_payment_choice");
const receiptChoices = choices("ped_receipt_choice");

test("Restaurant réutilise explicitement les primitives speech éprouvées de Café", () => {
  const source = readFileSync(
    new URL("../lib/restaurantSpeechIntents.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /normalizeKoreanSpeech/);
  assert.match(source, /getCafeSyllableDistanceDetails/);
  assert.match(source, /CAFE_SPEECH_MORPHOLOGY_FAMILIES/);
  assert.match(source, /CAFE_CLASSIFIERS/);
  assert.match(source, /CAFE_QUANTITIES/);
  assert.match(source, /NEGATION_TOKENS/);
});

test("les 14 familles pédagogiques couvrent toutes les branches Restaurant", () => {
  assert.deepEqual(
    new Set(RESTAURANT_SPEECH_INTENTS.map(({ intent }) => intent)),
    new Set([
      "meat-order",
      "recommendation",
      "repeat",
      "staff-grill",
      "self-grill",
      "side-order",
      "decline",
      "spicy",
      "less-spicy",
      "not-spicy",
      "extra-request",
      "payment",
      "receipt-yes",
      "receipt-no",
    ]),
  );
});

test("chaque réplique affichée possède une intention et conserve sa transition", () => {
  for (const node of Object.values(scenario.nodes)) {
    if (!node.choices) continue;

    for (const displayedChoice of node.choices) {
      assert.notEqual(
        getRestaurantSpeechChoiceIntent(displayedChoice),
        "unknown",
        `${node.id}.${displayedChoice.id}`,
      );
      assert.ok(
        scenario.nodes[displayedChoice.nextNodeId],
        `${node.id}.${displayedChoice.id} cible un nœud absent`,
      );

      const result = matchRestaurantSpeechIntent(
        displayedChoice.korean,
        node.choices,
      );
      assert.equal(result.reason, "matched", `${node.id}.${displayedChoice.id}`);
      assert.equal(
        result.choice?.id,
        displayedChoice.id,
        `${node.id}.${displayedChoice.id}`,
      );
    }
  }
});

test("les commandes de viande acceptent plusieurs formulations naturelles", () => {
  for (const [transcript, expectedChoiceId] of [
    ["삼겹살 2인분 주세요", "ped_order_samgyeopsal"],
    ["삼겹살 이 인분 부탁드려요", "ped_order_samgyeopsal"],
    ["삼겹살 두 인분 주문할게요", "ped_order_samgyeopsal"],
    ["갈비 2인분 주세요", "ped_order_galbi"],
    ["갈비 두 인분 부탁드려요", "ped_order_galbi"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, meatChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
  }
});

test("la commande après recommandation rejoint la bonne branche métier", () => {
  for (const [transcript, expectedChoiceId] of [
    ["그럼 삼겹살 2인분 주세요", "ped_reco_samgyeopsal"],
    ["갈비 이 인분 주문할게요", "ped_reco_galbi"],
  ]) {
    const result = matchRestaurantSpeechIntent(
      transcript,
      recommendationChoices,
    );
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
  }
});

test("la recommandation est comprise par le sens, pas par une phrase unique", () => {
  for (const transcript of [
    "추천 메뉴가 있어요?",
    "추천해 주세요",
    "메뉴 추천해 주세요",
    "뭐가 맛있어요?",
    "어떤 메뉴가 맛있어요?",
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, meatChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, "ped_order_recommendation", transcript);
  }
});

test("la répétition reste disponible et strictement limitée au nœud courant", () => {
  for (const transcript of [
    "다시요",
    "한 번 더요",
    "다시 말해 주세요",
    "천천히 말해 주세요",
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, meatChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, "repeat_ped_welcome", transcript);
  }
});

test("le moteur distingue la cuisson par le personnel de la cuisson autonome", () => {
  for (const transcript of ["구워 주세요", "직원이 구워 주세요", "구워 주실래요?"]) {
    const result = matchRestaurantSpeechIntent(transcript, grillChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, "ped_staff_grill_samgyeopsal", transcript);
  }

  for (const transcript of ["저희가 구울게요", "직접 구울게요", "저희가 할게요"]) {
    const result = matchRestaurantSpeechIntent(transcript, grillChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, "ped_self_grill_samgyeopsal", transcript);
  }
});

test("les accompagnements acceptent quantité implicite et compteurs naturels", () => {
  for (const [transcript, expectedChoiceId] of [
    ["된장찌개 주세요", "ped_add_doenjang"],
    ["된장찌개 한 그릇 주세요", "ped_add_doenjang"],
    ["계란찜 주세요", "ped_add_egg"],
    ["계란찜 하나 부탁드려요", "ped_add_egg"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, sideChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
  }
});

test("un refus poli fonctionne pour accompagnement et extra selon le contexte", () => {
  for (const transcript of ["아니요, 괜찮아요", "필요 없어요", "안 먹을게요"]) {
    const side = matchRestaurantSpeechIntent(transcript, sideChoices);
    assert.equal(side.reason, "matched", transcript);
    assert.equal(side.choice?.id, "ped_no_side", transcript);
  }

  const extra = matchRestaurantSpeechIntent("괜찮아요", extraChoices);
  assert.equal(extra.reason, "matched");
  assert.equal(extra.choice?.id, "ped_no_extra");
});

test("les trois niveaux de piquant restent sémantiquement distincts", () => {
  for (const [transcript, expectedChoiceId] of [
    ["맵게 해 주세요", "ped_spicy"],
    ["매운 걸로 주세요", "ped_spicy"],
    ["덜 맵게 해 주세요", "ped_less_spicy"],
    ["조금만 맵게 해 주세요", "ped_less_spicy"],
    ["안 맵게 해 주세요", "ped_not_spicy"],
    ["맵지 않게 해 주세요", "ped_not_spicy"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, spiceChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
  }
});

test("une question sur le piquant n’est jamais validée comme préférence", () => {
  for (const transcript of ["매워요?", "안 매워요?"]) {
    const result = matchRestaurantSpeechIntent(transcript, spiceChoices);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "relevant-question", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("deux polarités de piquant dans la même phrase sont critiques", () => {
  const result = matchRestaurantSpeechIntent(
    "맵게 해 주세요, 안 맵게 해 주세요",
    spiceChoices,
  );
  assert.equal(result.reason, "needs-help");
  assert.equal(result.category, "contradiction");
  assert.equal(result.severity, "critical");
});

test("les demandes d’extra acceptent omission de 더 avec micro-correction", () => {
  for (const [transcript, expectedChoiceId] of [
    ["상추 좀 더 주세요", "ped_more_lettuce"],
    ["상추 추가해 주세요", "ped_more_lettuce"],
    ["반찬 더 주세요", "ped_more_banchan"],
    ["반찬 좀 주세요", "ped_more_banchan"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, extraChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
  }

  const withoutMore = matchRestaurantSpeechIntent("반찬 주세요", extraChoices);
  assert.equal(withoutMore.reason, "matched");
  assert.equal(withoutMore.severity, "minor");
  assert.match(withoutMore.feedback, /더/);
});

test("carte et espèces acceptent les familles de paiement partagées", () => {
  for (const [transcript, expectedChoiceId] of [
    ["카드로 할게요", "ped_pay_card"],
    ["카드로 결제할게요", "ped_pay_card"],
    ["카드요", "ped_pay_card"],
    ["현금으로 할게요", "ped_pay_cash"],
    ["현금으로 계산할게요", "ped_pay_cash"],
    ["현금이요", "ped_pay_cash"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, paymentChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
  }
});

test("le reçu distingue acceptation, refus et oui trop ambigu", () => {
  for (const transcript of ["네, 영수증 주세요", "영수증 주세요", "받을게요"]) {
    const result = matchRestaurantSpeechIntent(transcript, receiptChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, "ped_receipt_yes", transcript);
  }

  for (const transcript of ["아니요, 괜찮아요", "필요 없어요", "안 받을게요"]) {
    const result = matchRestaurantSpeechIntent(transcript, receiptChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, "ped_receipt_no", transcript);
  }

  const yesOnly = matchRestaurantSpeechIntent("네", receiptChoices);
  assert.equal(yesOnly.reason, "uncertain");
  assert.equal(yesOnly.severity, "moderate");
  assert.equal(yesOnly.choice?.id, "ped_receipt_yes");
});

test("un registre trop familier est compris avec correction non bloquante", () => {
  for (const [transcript, nodeChoices, expectedChoiceId] of [
    ["삼겹살 2인분 줘", meatChoices, "ped_order_samgyeopsal"],
    ["반찬 더 줘", extraChoices, "ped_more_banchan"],
    ["구워", grillChoices, "ped_staff_grill_samgyeopsal"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, nodeChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
    assert.equal(result.category, "register-imperfection", transcript);
    assert.equal(result.severity, "minor", transcript);
  }
});

test("un compteur maladroit conserve nombre, plat et transition", () => {
  for (const transcript of ["삼겹살 두 개 주세요", "삼겹살 두 그릇 주세요"]) {
    const result = matchRestaurantSpeechIntent(transcript, meatChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, "ped_order_samgyeopsal", transcript);
    assert.equal(result.category, "classifier-imperfection", transcript);
    assert.equal(result.severity, "minor", transcript);
  }
});

test("un mauvais nombre important ne peut pas faire avancer la commande", () => {
  for (const transcript of [
    "삼겹살 한 인분 주세요",
    "삼겹살 세 인분 주세요",
    "갈비 네 인분 주세요",
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, meatChoices);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "wrong-quantity", transcript);
    assert.equal(result.severity, "major", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("une bonne quantité après retry reste sur le même tour puis rejoint le NPC", () => {
  const invalid = matchRestaurantSpeechIntent(
    "삼겹살 한 인분 주세요.",
    meatChoices,
    1,
  );
  assert.equal(invalid.reason, "needs-help");
  assert.equal(invalid.category, "wrong-quantity");
  assert.equal(invalid.choice, null);

  const retried = matchRestaurantSpeechIntent(
    "삼겹살 두 인분 주세요.",
    meatChoices,
    2,
  );
  assert.equal(retried.reason, "matched");
  assert.equal(retried.choice?.id, "ped_order_samgyeopsal");
  assert.equal(retried.choice?.nextNodeId, "ped_confirm_samgyeopsal");
  assert.equal(scenario.nodes[retried.choice?.nextNodeId]?.type, "ia");
});

test("une viande sans quantité demande confirmation au lieu d’inventer deux portions", () => {
  const result = matchRestaurantSpeechIntent("삼겹살 주세요", meatChoices);
  assert.equal(result.reason, "uncertain");
  assert.equal(result.category, "incomplete");
  assert.equal(result.severity, "moderate");
  assert.equal(result.choice?.id, "ped_order_samgyeopsal");
});

test("les particules maladroites sont mineures quand le sens reste clair", () => {
  const payment = matchRestaurantSpeechIntent("카드를 할게요", paymentChoices);
  assert.equal(payment.reason, "matched");
  assert.equal(payment.category, "particle-imperfection");
  assert.equal(payment.choice?.id, "ped_pay_card");

  const recommendation = matchRestaurantSpeechIntent(
    "추천 메뉴를 있어요?",
    meatChoices,
  );
  assert.equal(recommendation.reason, "matched");
  assert.equal(recommendation.category, "particle-imperfection");
});

test("les mélanges de langues gardent la branche avec reformulation coréenne", () => {
  for (const [transcript, nodeChoices, expectedChoiceId] of [
    ["samgyeopsal 2인분 주세요", meatChoices, "ped_order_samgyeopsal"],
    ["carte로 할게요", paymentChoices, "ped_pay_card"],
    ["receipt 주세요", receiptChoices, "ped_receipt_yes"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, nodeChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
    assert.equal(result.category, "mixed-language", transcript);
    assert.equal(result.severity, "minor", transcript);
  }
});

test("les confusions ASR plausibles exigent un contexte convergent", () => {
  for (const [transcript, nodeChoices, expectedChoiceId] of [
    ["삼겹쌀 2인분 주세요", meatChoices, "ped_order_samgyeopsal"],
    ["된장찌게 하나 주세요", sideChoices, "ped_add_doenjang"],
    ["반창 좀 더 주세요", extraChoices, "ped_more_banchan"],
    ["현근으로 할게요", paymentChoices, "ped_pay_cash"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, nodeChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
    assert.equal(result.category, "asr-recovery", transcript);
    assert.equal(result.severity, "minor", transcript);
  }

  const isolated = matchRestaurantSpeechIntent("삼겹쌀", meatChoices);
  assert.notEqual(isolated.reason, "matched");
  assert.equal(isolated.choice, null);
});

test("la négation reste prioritaire sur les mots-clés de commande et paiement", () => {
  for (const [transcript, nodeChoices] of [
    ["삼겹살 2인분 안 주세요", meatChoices],
    ["카드로 안 할게요", paymentChoices],
    ["반찬 더 주지 마세요", extraChoices],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, nodeChoices);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "contradiction", transcript);
    assert.equal(result.severity, "critical", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("une négation contrastive retient le concept affirmé", () => {
  for (const [transcript, nodeChoices, expectedChoiceId] of [
    ["삼겹살 말고 갈비 2인분 주세요", meatChoices, "ped_order_galbi"],
    ["카드 말고 현금으로 할게요", paymentChoices, "ped_pay_cash"],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, nodeChoices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoiceId, transcript);
  }
});

test("deux concepts incompatibles ne sélectionnent jamais une branche", () => {
  for (const [transcript, nodeChoices] of [
    ["삼겹살하고 갈비 2인분 주세요", meatChoices],
    ["된장찌개하고 계란찜 주세요", sideChoices],
    ["카드하고 현금으로 할게요", paymentChoices],
    ["네 주세요, 아니요 괜찮아요", receiptChoices],
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, nodeChoices);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "ambiguous", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("une auto-correction explicite retient uniquement le choix final", () => {
  const result = matchRestaurantSpeechIntent(
    "카드로 할게요… 아니요, 현금으로 할게요",
    paymentChoices,
  );
  assert.equal(result.reason, "matched");
  assert.equal(result.choice?.id, "ped_pay_cash");
  assert.equal(result.severity, "minor");
  assert.match(result.feedback, /correction/);
});

test("une intention connue mais absente du nœud ne fuit jamais dans une branche", () => {
  for (const transcript of [
    "카드로 할게요",
    "반찬 더 주세요",
    "안 맵게 해 주세요",
  ]) {
    const result = matchRestaurantSpeechIntent(transcript, meatChoices);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "wrong-concept", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("les mots-clés sans acte de parole ne suffisent pas", () => {
  for (const transcript of ["삼겹살 사진이에요", "카드가 있어요", "반찬을 봤어요"]) {
    const nodeChoices = transcript.includes("카드")
      ? paymentChoices
      : transcript.includes("반찬")
        ? extraChoices
        : meatChoices;
    const result = matchRestaurantSpeechIntent(transcript, nodeChoices);
    assert.notEqual(result.reason, "matched", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("l’aide progresse de l’indice vers la phrase modèle", () => {
  const first = matchRestaurantSpeechIntent("몰라요", meatChoices, 1);
  const second = matchRestaurantSpeechIntent("몰라요", meatChoices, 2);
  const third = matchRestaurantSpeechIntent("몰라요", meatChoices, 3);

  assert.doesNotMatch(first.feedback, /mots utiles|phrase modèle/i);
  assert.match(second.feedback, /mots utiles/i);
  assert.match(third.feedback, /phrase modèle/i);
  assert.match(third.feedback, /삼겹살 2인분 주세요/);
});

test("le contexte natif contient les variantes valides mais pas les confusions ASR", () => {
  const context = getRestaurantSpeechContextualStrings(meatChoices);
  assert.ok(context.includes("삼겹살 2인분 주세요."));
  assert.ok(context.includes("뭐가 맛있어요?"));
  assert.ok(context.includes("다시 말해 주세요."));
  assert.ok(!context.includes("삼겹쌀 2인분 주세요"));

  const paymentContext = getRestaurantSpeechContextualStrings(paymentChoices);
  assert.ok(paymentContext.includes("카드로 결제할게요."));
  assert.ok(!paymentContext.includes("삼겹살 2인분 주세요."));
});

test("chaque mission Restaurant conserve un graphe complet et terminable", () => {
  for (const mission of restaurantMissions) {
    const missionScenario = getRestaurantMissionScenario(
      scenario,
      mission.scenarioKey,
    );
    const reachable = new Set([missionScenario.startNodeId]);
    const pending = [missionScenario.startNodeId];

    while (pending.length > 0) {
      const nodeId = pending.pop();
      const node = missionScenario.nodes[nodeId];
      assert.ok(node, `${mission.id}.${nodeId}`);

      for (const target of [
        node.nextNodeId,
        ...(node.choices?.map(({ nextNodeId }) => nextNodeId) ?? []),
      ].filter(Boolean)) {
        assert.ok(missionScenario.nodes[target], `${mission.id}: cible ${target}`);
        if (!reachable.has(target)) {
          reachable.add(target);
          pending.push(target);
        }
      }
    }

    assert.ok(
      [...reachable].some(
        (nodeId) => missionScenario.nodes[nodeId]?.nextNodeId === null,
      ),
      `${mission.id} doit atteindre une fin`,
    );
    assert.ok(getRestaurantMissionById(mission.id));
  }
});

test("la mission VOCAL Restaurant reprend le pattern Premium de Métro", () => {
  assert.equal(RESTAURANT_SPEECH_MISSION_ID, "restaurant-vocal");

  const vocalMission = getRestaurantMissionById(
    RESTAURANT_SPEECH_MISSION_ID,
  );
  assert.ok(vocalMission);
  assert.equal(vocalMission.access, "premium");
  assert.equal(vocalMission.missionKind, "mini");
  assert.equal(vocalMission.scenarioKey, "restaurant_vocal");
  assert.equal(vocalMission.title, "Commander au restaurant");
  assert.equal(restaurantMissions.at(-1)?.id, RESTAURANT_SPEECH_MISSION_ID);

  assert.deepEqual(
    restaurantMissions
      .filter(({ id }) => id !== RESTAURANT_SPEECH_MISSION_ID)
      .map(({ id }) => id),
    [
      "order-simple",
      "ask-recommendation",
      "choose-grill",
      "add-sides",
      "pay-receipt",
    ],
  );
});

test("la mission VOCAL conserve le scénario BBQ complet sans second moteur", () => {
  const vocalMission = getRestaurantMissionById(
    RESTAURANT_SPEECH_MISSION_ID,
  );
  assert.ok(vocalMission);

  const vocalScenario = getRestaurantMissionScenario(
    scenario,
    vocalMission.scenarioKey,
  );
  assert.equal(vocalScenario.startNodeId, scenario.startNodeId);
  assert.deepEqual(Object.keys(vocalScenario.nodes), Object.keys(scenario.nodes));

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    assert.deepEqual(
      vocalScenario.nodes[nodeId]?.choices?.map(({ id }) => id),
      node.choices?.map(({ id }) => id),
      nodeId,
    );
  }
});

test("le listing Restaurant rend la carte VOCAL violette et ouvre la mission guidée", () => {
  const source = readFileSync(
    new URL("../app/lesson/restaurantMissions.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /const VOCAL_VIOLET = "#A78BFA"/);
  assert.match(source, /Mini-missions ciblées/);
  assert.match(source, /mission\.missionKind === "mini"/);
  assert.match(
    source,
    /mission\.id === RESTAURANT_SPEECH_MISSION_ID \? "guided" : mode/,
  );
  assert.match(source, /variant=\{isVocal \? "vocal" : "access"\}/);
  assert.match(source, /pathname: "\/lesson\/restaurantIA"/);
  assert.match(source, /canOpenImmersionMission\(mission, hasPremiumAccess\)/);
});

test("le runtime Restaurant réutilise l’UI et le hook vocaux communs", () => {
  const source = readFileSync(
    new URL("../app/lesson/restaurantIA.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<GuidedSpeechTurn/);
  assert.match(source, /useKoreanSpeechRecognition/);
  assert.match(source, /getRestaurantSpeechContextualStrings/);
  assert.match(source, /matchRestaurantSpeechIntent/);
  assert.match(source, /speechAttemptCountRef/);
  assert.match(source, /cancelSpeechRecognition\(\)/);
  assert.match(source, /voice_immersion/);
  assert.match(
    source,
    /currentMission\?\.id === RESTAURANT_SPEECH_MISSION_ID/,
  );
});

test("chaque succès vocal Restaurant cible un NPC avec une vidéo déclarée", () => {
  const runtime = readFileSync(
    new URL("../app/lesson/restaurantIA.tsx", import.meta.url),
    "utf8",
  );

  for (const node of Object.values(scenario.nodes)) {
    if (node.type !== "user_choice") continue;

    for (const choice of node.choices ?? []) {
      const nextNode = scenario.nodes[choice.nextNodeId];
      assert.equal(nextNode?.type, "ia", `${node.id}.${choice.id}`);
      assert.match(
        runtime,
        new RegExp(`\\b${choice.nextNodeId}:`, "u"),
        `${choice.nextNodeId} doit résoudre un asset vidéo`,
      );
    }
  }
});

test("Restaurant engage la source NPC dans la même transition que le node", () => {
  const runtime = readFileSync(
    new URL("../app/lesson/restaurantIA.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    runtime,
    /const nextNode = currentScenario\.nodes\[choice\.nextNodeId\][\s\S]*?const nextVideoSource = getNodeVideoSource\(nextNode\)[\s\S]*?setDisplayedVideoSource\(nextVideoSource\)[\s\S]*?setCurrentNodeId\(choice\.nextNodeId\)/u,
  );
  assert.match(
    runtime,
    /setShowSpeechChoices\(false\);[\s\S]*?setSpeechFeedback\(null\);[\s\S]*?setSpeechUiNodeId\(null\);[\s\S]*?setPendingSpeechChoice\(null\);[\s\S]*?\}, \[currentNodeId\]\);/u,
  );
  assert.doesNotMatch(
    runtime,
    /displayed native source follows the active IA node/u,
  );
});

test("Restaurant reprend la réponse vidéo une fois la session micro libérée", () => {
  const runtime = readFileSync(
    new URL("../app/lesson/restaurantIA.tsx", import.meta.url),
    "utf8",
  );

  assert.match(runtime, /phase: speechPhase/u);
  assert.match(
    runtime,
    /speechPhase === "ended"[\s\S]*?speechPhase === "error"[\s\S]*?mediaStatus === "loaded"[\s\S]*?mediaStatus === "interrupted"/u,
  );
  assert.match(
    runtime,
    /currentNode\?\.type !== "ia"[\s\S]*?!currentVideoSource[\s\S]*?void resumeVideo\(\)/u,
  );
});
