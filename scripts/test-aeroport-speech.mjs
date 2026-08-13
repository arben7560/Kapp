import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";

import {
  buildAeroportConversationSummary,
  createAeroportConversationMemory,
  recordAeroportSpeechAttempt,
} from "../lib/aeroportConversationMemory.ts";
import {
  AEROPORT_SPEECH_PILOT_MISSION_ID,
  getAeroportSpeechChoiceIntent,
  getAeroportSpeechContextualStrings,
  matchAeroportSpeechIntent,
} from "../lib/aeroportSpeechIntents.ts";

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

const { aeroportDialogueData } = await import(
  "../data/lesson/aeroport/aeroport.ts"
);
const {
  aeroportMissions,
  applyAeroportMissionToScenario,
  getAeroportMissionById,
} = await import("../data/lesson/aeroport/aeroportMissions.ts");

function createVoiceScenario() {
  return applyAeroportMissionToScenario(
    structuredClone(aeroportDialogueData),
    "arrival_voice",
  );
}

const voiceScenario = createVoiceScenario();
const voiceChoiceNodes = Object.values(voiceScenario.nodes)
  .filter((node) => node.type === "user_choice" && node.choices?.length)
  .map((node) => ({ id: node.id, choices: node.choices }));

const choiceByIntent = new Map();
for (const node of voiceChoiceNodes) {
  for (const choice of node.choices) {
    const intent = getAeroportSpeechChoiceIntent(choice);
    if (intent !== "unknown" && !choiceByIntent.has(intent)) {
      choiceByIntent.set(intent, choice);
    }
  }
}

const route = choiceByIntent.get("route");
const continueChoice = choiceByIntent.get("continue");
const trainChoice = choiceByIntent.get("train-choice");
const platform = choiceByIntent.get("platform");
const repeat = choiceByIntent.get("repeat");
const thanks = choiceByIntent.get("thanks");

test("la nouvelle immersion vocale Aéroport est premium et accessible par un scénario dédié", () => {
  const mission = getAeroportMissionById(AEROPORT_SPEECH_PILOT_MISSION_ID);
  assert.ok(mission);
  assert.equal(mission.access, "premium");
  assert.equal(mission.scenarioKey, "arrival_voice");
  assert.match(mission.title, /Arrivée guidée/u);
  assert.ok(mission.goals.length >= 3);
  assert.equal(
    aeroportMissions.filter(({ id }) => id === mission.id).length,
    1,
  );
});

test("le parcours vocal débutant est court, complet et terminable", () => {
  assert.deepEqual(
    voiceChoiceNodes.map(({ id }) => id).sort(),
    [
      "user_start",
      "user_after_welcome",
      "user_after_welcome_after_repeat",
      "user_after_transport",
      "user_after_transport_after_repeat",
      "user_after_recommend",
      "user_after_recommend_after_repeat",
      "user_after_platform",
      "user_after_platform_after_repeat",
    ].sort(),
  );

  const reachable = new Set([voiceScenario.startNodeId]);
  const pending = [voiceScenario.startNodeId];
  while (pending.length > 0) {
    const nodeId = pending.pop();
    const node = voiceScenario.nodes[nodeId];
    for (const target of [
      node?.nextNodeId,
      ...(node?.choices ?? []).map(({ nextNodeId }) => nextNodeId),
    ]) {
      if (target && !reachable.has(target)) {
        reachable.add(target);
        pending.push(target);
      }
    }
  }

  assert.equal(reachable.size, Object.keys(voiceScenario.nodes).length);
  assert.ok(reachable.has("ia_end"));
  assert.deepEqual(
    [...new Set(
      voiceChoiceNodes.flatMap(({ choices }) =>
        choices.map(getAeroportSpeechChoiceIntent),
      ),
    )].sort(),
    ["continue", "platform", "repeat", "route", "thanks", "train-choice"],
  );
});

test("chaque formulation affichée sélectionne strictement sa branche", () => {
  for (const node of voiceChoiceNodes) {
    for (const choice of node.choices) {
      const result = matchAeroportSpeechIntent(choice.korean, node.choices);
      assert.equal(result.reason, "matched", `${node.id}.${choice.id}`);
      assert.equal(result.choice?.id, choice.id, `${node.id}.${choice.id}`);
      assert.equal(
        result.choice?.nextNodeId,
        choice.nextNodeId,
        `${node.id}.${choice.id}`,
      );
    }
  }
});

test("les formulations naturelles A1 sont comprises sans exiger la phrase exacte", () => {
  for (const [transcript, choices, expectedChoice] of [
    ["서울역에 어떻게 가요?", [route], route],
    ["네, 그다음은요?", [continueChoice, repeat], continueChoice],
    ["어떤 열차가 좋아요?", [trainChoice, repeat], trainChoice],
    ["승강장은 어디예요?", [platform, repeat], platform],
    ["다시 말해 주세요.", [continueChoice, repeat], repeat],
    ["감사합니다.", [thanks, repeat], thanks],
  ]) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
  }
});

test("Aéroport interprète le sens proche selon l’étape actuelle", () => {
  for (const [transcript, choices, expectedChoice, expectedReason] of [
    ["서울역에 가고 싶어요.", [route], route, "uncertain"],
    ["공항철도는 어디예요?", [route], route, "matched"],
    ["이제 뭐 해요?", [continueChoice, repeat], continueChoice, "matched"],
    ["직통이 좋아요, 일반이 좋아요?", [trainChoice, repeat], trainChoice, "uncertain"],
    ["어디서 타요?", [platform, repeat], platform, "uncertain"],
    ["방금 뭐라고 하셨어요?", [continueChoice, repeat], repeat, "matched"],
    ["도움이 됐어요.", [thanks, repeat], thanks, "matched"],
  ]) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, expectedReason, transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.equal(result.category, "contextual-interpretation", transcript);
    assert.match(result.feedback, /J’ai compris/u, transcript);
    assert.match(result.feedback, /Ici,/u, transcript);
  }
});

test("une intention correcte au mauvais tour est expliquée sans changer de branche", () => {
  const result = matchAeroportSpeechIntent(
    "플랫폼은 어디예요?",
    [route],
  );
  assert.equal(result.reason, "needs-help");
  assert.equal(result.category, "out-of-scope");
  assert.equal(result.choice, null);
  assert.match(result.feedback, /quai/u);
  assert.match(result.feedback, /arriver à Incheon/u);
});

test("les réponses liées au tour mais incomplètes reçoivent une aide précise", () => {
  for (const [transcript, choices, expected] of [
    ["서울역…", [route], /pas formulé la demande de trajet/u],
    ["네, 알겠어요.", [continueChoice, repeat], /étape suivante/u],
    ["직통열차요.", [trainChoice, repeat], /lequel choisir/u],
    ["플랫폼…", [platform, repeat], /question reste incomplète/u],
  ]) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "incomplete", transcript);
    assert.equal(result.choice, null, transcript);
    assert.match(result.feedback, expected, transcript);
  }
});

test("la négation reste prioritaire sur les mots-clés positifs", () => {
  for (const [transcript, choices] of [
    ["서울역에 안 가요.", [route]],
    ["그다음 필요 없어요.", [continueChoice, repeat]],
    ["열차 안 타요.", [trainChoice, repeat]],
    ["플랫폼 필요 없어요.", [platform, repeat]],
    ["감사하지 않아요.", [thanks, repeat]],
  ]) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "negation-conflict", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("les étages et destinations contradictoires ne valident aucune intention", () => {
  const floors = matchAeroportSpeechIntent(
    "1층하고 2층 플랫폼은 어디예요?",
    [platform, repeat],
  );
  assert.equal(floors.category, "quantity-conflict");
  assert.equal(floors.choice, null);

  const wrongFloor = matchAeroportSpeechIntent(
    "2층 플랫폼은 어디예요?",
    [platform, repeat],
  );
  assert.equal(wrongFloor.reason, "needs-help");
  assert.equal(wrongFloor.category, "quantity-conflict");
  assert.equal(wrongFloor.choice, null);
  assert.match(wrongFloor.feedback, /sous-sol 1/u);

  const correctedFloor = matchAeroportSpeechIntent(
    "2층 아니, 1층 플랫폼은 어디예요?",
    [platform, repeat],
  );
  assert.equal(correctedFloor.reason, "matched");
  assert.equal(correctedFloor.choice?.id, platform.id);

  const wrongDestination = matchAeroportSpeechIntent(
    "강남까지 어떻게 가요?",
    [route],
  );
  assert.equal(wrongDestination.category, "wrong-destination");
  assert.equal(wrongDestination.choice, null);

  const alternatives = matchAeroportSpeechIntent(
    "강남 아니면 서울역까지 어떻게 가요?",
    [route],
  );
  assert.equal(alternatives.category, "ambiguous");
  assert.equal(alternatives.choice, null);

  const correctedDestination = matchAeroportSpeechIntent(
    "강남 아니, 서울역까지 어떻게 가요?",
    [route],
  );
  assert.equal(correctedDestination.reason, "matched");
  assert.equal(correctedDestination.choice?.id, route.id);
});

test("deux intentions simultanées demandent une clarification", () => {
  const result = matchAeroportSpeechIntent(
    "어느 열차가 좋아요? 플랫폼은 어디예요?",
    [trainChoice, repeat],
  );
  assert.equal(result.reason, "needs-help");
  assert.equal(result.category, "ambiguous");
  assert.equal(result.choice, null);
});

test("les exemples vocaux restent strictement limités au nœud courant", () => {
  const routeContext = getAeroportSpeechContextualStrings([route]);
  assert.ok(routeContext.includes("서울역에 가고 싶어요."));
  assert.ok(routeContext.includes("공항철도는 어디예요?"));
  assert.ok(!routeContext.includes("어디서 타요?"));

  const platformContext = getAeroportSpeechContextualStrings([
    platform,
    repeat,
  ]);
  assert.ok(platformContext.includes("어디서 타요?"));
  assert.ok(platformContext.includes("방금 뭐라고 하셨어요?"));
  assert.ok(!platformContext.includes("서울역에 가고 싶어요."));
});

test("le bilan conserve les intentions comprises par contexte", () => {
  let memory = createAeroportConversationMemory();
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_start",
    transcript: "공항철도는 어디예요?",
    result: matchAeroportSpeechIntent("공항철도는 어디예요?", [route]),
  });
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_after_recommend",
    transcript: "어디서 타요?",
    result: matchAeroportSpeechIntent("어디서 타요?", [platform, repeat]),
  });
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_after_recommend",
    transcript: "플랫폼은 어디예요?",
    result: matchAeroportSpeechIntent("플랫폼은 어디예요?", [platform, repeat]),
  });

  const summary = buildAeroportConversationSummary(memory);
  assert.ok(summary.achievements.includes("Trajet vers Seoul Station demandé"));
  assert.ok(summary.achievements.includes("Quai de l’AREX demandé"));
  assert.equal(summary.errorsCorrected, 1);
  assert.ok(
    summary.vocabularyToReview.includes(
      "Reformuler précisément l’intention comprise",
    ),
  );
});

test("l’écran Aéroport branche la reconnaissance, l’aide et le bilan uniquement sur la mission vocale", () => {
  const screenSource = readFileSync(
    new URL("../app/lesson/aeroportIA.tsx", import.meta.url),
    "utf8",
  );
  const missionsScreenSource = readFileSync(
    new URL("../app/lesson/aeroportMissions.tsx", import.meta.url),
    "utf8",
  );
  const summarySource = readFileSync(
    new URL(
      "../components/aeroport/AeroportConversationSummaryModal.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(screenSource, /AEROPORT_SPEECH_PILOT_MISSION_ID/u);
  assert.match(screenSource, /useKoreanSpeechRecognition/u);
  assert.match(screenSource, /matchAeroportSpeechIntent/u);
  assert.match(screenSource, /<GuidedSpeechTurn/u);
  assert.match(screenSource, /recordAeroportSpeechAttempt/u);
  assert.match(screenSource, /AeroportConversationSummaryModal/u);
  assert.match(screenSource, /"voice_immersion"/u);
  assert.match(missionsScreenSource, /MissionAccessBadge/u);
  assert.match(summarySource, /buildAeroportConversationSummary/u);
  assert.match(summarySource, /Speech\.speak/u);
});
