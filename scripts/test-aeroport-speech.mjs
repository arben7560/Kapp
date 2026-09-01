import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";

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

const {
  buildAeroportConversationSummary,
  createAeroportConversationMemory,
  recordAeroportSpeechAttempt,
} = await import("../lib/aeroportConversationMemory.ts");
const {
  AEROPORT_SPEECH_PILOT_MISSION_ID,
  getAeroportSpeechChoiceIntent,
  getAeroportSpeechContextualStrings,
  matchAeroportSpeechIntent,
} = await import("../lib/aeroportSpeechIntents.ts");
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

for (const [name, choice] of [
  ["route", route],
  ["continue", continueChoice],
  ["train-choice", trainChoice],
  ["platform", platform],
  ["repeat", repeat],
  ["thanks", thanks],
]) {
  assert.ok(choice, `Choix introuvable pour ${name}`);
}

test("la mission vocale Aéroport reste premium et dédiée à arrival_voice", () => {
  const mission = getAeroportMissionById(AEROPORT_SPEECH_PILOT_MISSION_ID);
  assert.ok(mission);
  assert.equal(mission.access, "premium");
  assert.equal(mission.scenarioKey, "arrival_voice");
  assert.match(mission.title, /Arrivée guidée/u);
  assert.ok(mission.goals.length >= 3);
  assert.equal(aeroportMissions.filter(({ id }) => id === mission.id).length, 1);
});

test("le parcours vocal reste court, complet et terminable", () => {
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
      assert.equal(result.choice?.nextNodeId, choice.nextNodeId);
      assert.equal(result.understoodWithCorrection, false);
    }
  }
});

test("les variantes naturelles A1 ne sont plus comptées comme corrections", () => {
  const cases = [
    ["서울역에 어떻게 가요?", [route], route],
    ["서울역 어떻게 가요?", [route], route],
    ["서울역 가려면 어디로 가면 돼요?", [route], route],
    ["서울역 가는 길 좀 알려 주세요.", [route], route],
    ["그다음은요?", [continueChoice, repeat], continueChoice],
    ["이제 뭐 하면 돼요?", [continueChoice, repeat], continueChoice],
    ["어떤 열차가 좋아요?", [trainChoice, repeat], trainChoice],
    ["직통이 좋아요, 일반이 좋아요?", [trainChoice, repeat], trainChoice],
    ["뭘 타야 돼요?", [trainChoice, repeat], trainChoice],
    ["승강장은 어디예요?", [platform, repeat], platform],
    ["어디서 타요?", [platform, repeat], platform],
    ["다시요", [continueChoice, repeat], repeat],
    ["다시 말해 주세요.", [continueChoice, repeat], repeat],
    ["못 들었어요.", [continueChoice, repeat], repeat],
    ["감사합니다.", [thanks, repeat], thanks],
    ["알겠어요.", [thanks, repeat], thanks],
  ];

  for (const [transcript, choices, expectedChoice] of cases) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.equal(result.understoodWithCorrection, false, transcript);
  }
});

test("les formulations contextuelles naturelles restent des réussites directes", () => {
  for (const [transcript, choices, expectedChoice] of [
    ["공항철도는 어디예요?", [route], route],
    ["방금 뭐라고 하셨어요?", [continueChoice, repeat], repeat],
    ["도움이 됐어요.", [thanks, repeat], thanks],
    ["네.", [thanks, repeat], thanks],
  ]) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.category, "contextual-interpretation", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.equal(result.understoodWithCorrection, false, transcript);
    assert.match(result.feedback, /J’ai compris/u, transcript);
  }
});

test("une intention claire mais non formulée comme demande reste à confirmer", () => {
  const result = matchAeroportSpeechIntent("서울역에 가고 싶어요.", [route]);
  assert.equal(result.reason, "uncertain");
  assert.equal(result.category, "contextual-interpretation");
  assert.equal(result.choice?.id, route.id);
  assert.equal(result.understoodWithCorrection, false);
  assert.match(result.feedback, /destination est claire|destination/u);
});

test("le moteur ne transforme pas une simple localisation en demande de trajet", () => {
  const result = matchAeroportSpeechIntent("서울역 어디예요?", [route]);
  assert.equal(result.reason, "needs-help");
  assert.equal(result.category, "incomplete");
  assert.equal(result.choice, null);
  assert.match(result.feedback, /comment la rejoindre/u);
});

test("une intention correcte au mauvais tour est distinguée d’une erreur linguistique", () => {
  const result = matchAeroportSpeechIntent("플랫폼은 어디예요?", [route]);
  assert.equal(result.reason, "needs-help");
  assert.equal(result.category, "out-of-scope");
  assert.equal(result.choice, null);
  assert.match(result.feedback, /compréhensible/u);
  assert.match(result.feedback, /objectif de ce tour/u);
});

test("les réponses liées au tour mais incomplètes reçoivent un diagnostic ciblé", () => {
  for (const [transcript, choices, expected] of [
    ["서울역…", [route], /demande de trajet/u],
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

test("une négation déclarative et une question négative ne reçoivent plus le même diagnostic", () => {
  const declarative = matchAeroportSpeechIntent("서울역에 안 가요.", [route]);
  assert.equal(declarative.reason, "needs-help");
  assert.equal(declarative.category, "negation-conflict");

  const confirmation = matchAeroportSpeechIntent("서울역에 안 가요?", [route]);
  assert.equal(confirmation.reason, "uncertain");
  assert.equal(confirmation.category, "contextual-interpretation");
  assert.equal(confirmation.choice?.id, route.id);
  assert.match(confirmation.feedback, /question négative de confirmation/u);

  const trainConfirmation = matchAeroportSpeechIntent(
    "직통열차 안 타요?",
    [trainChoice, repeat],
  );
  assert.equal(trainConfirmation.reason, "uncertain");
  assert.equal(trainConfirmation.choice?.id, trainChoice.id);
});

test("le registre trop direct est compris sans être confondu avec une faute grammaticale", () => {
  for (const [transcript, choices, expectedChoice] of [
    ["서울역 어떻게 가?", [route], route],
    ["다시 말해", [continueChoice, repeat], repeat],
    ["어디서 타?", [platform, repeat], platform],
    ["고마워", [thanks, repeat], thanks],
  ]) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.category, "register-imperfection", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.equal(result.understoodWithCorrection, true, transcript);
    assert.match(result.feedback, /agent|polie/u, transcript);
  }
});

test("1층 et 지하 1층 sont désormais distingués", () => {
  const groundLevel = matchAeroportSpeechIntent(
    "1층 플랫폼은 어디예요?",
    [platform, repeat],
  );
  assert.equal(groundLevel.reason, "needs-help");
  assert.equal(groundLevel.category, "floor-conflict");
  assert.match(groundLevel.feedback, /1층.*지하 1층/u);

  const basement = matchAeroportSpeechIntent(
    "지하 1층 플랫폼은 어디예요?",
    [platform, repeat],
  );
  assert.equal(basement.reason, "matched");
  assert.equal(basement.choice?.id, platform.id);

  const corrected = matchAeroportSpeechIntent(
    "2층 아니, 지하 1층 플랫폼은 어디예요?",
    [platform, repeat],
  );
  assert.equal(corrected.reason, "matched");
  assert.equal(corrected.choice?.id, platform.id);

  const alternatives = matchAeroportSpeechIntent(
    "2층 아니면 지하 1층 플랫폼은 어디예요?",
    [platform, repeat],
  );
  assert.equal(alternatives.reason, "needs-help");
  assert.equal(alternatives.category, "floor-conflict");
});

test("les destinations distinguent auto-correction et alternative réelle", () => {
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

  const corrected = matchAeroportSpeechIntent(
    "강남 아니, 서울역까지 어떻게 가요?",
    [route],
  );
  assert.equal(corrected.reason, "matched");
  assert.equal(corrected.choice?.id, route.id);
});

test("deux intentions simultanées demandent toujours une clarification", () => {
  const result = matchAeroportSpeechIntent(
    "어느 열차가 좋아요? 플랫폼은 어디예요?",
    [trainChoice, repeat],
  );
  assert.equal(result.reason, "needs-help");
  assert.equal(result.category, "ambiguous");
  assert.equal(result.choice, null);
});

test("les récupérations probables de transcription ne sont plus comptées comme fautes", () => {
  for (const [transcript, choices, expectedChoice] of [
    ["서울력까지 어떻게 가요?", [route], route],
    ["다씨 말해 주세요.", [continueChoice, repeat], repeat],
    ["플랫품은 어디예요?", [platform, repeat], platform],
    ["감사함니다", [thanks, repeat], thanks],
  ]) {
    const result = matchAeroportSpeechIntent(transcript, choices);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.category, "transcription-recovery", transcript);
    assert.equal(result.choice?.id, expectedChoice.id, transcript);
    assert.equal(result.understoodWithCorrection, false, transcript);
    assert.match(result.feedback, /transcription/u, transcript);
    assert.match(result.feedback, /faute certaine/u, transcript);
  }
});

test("les exemples vocaux restent strictement limités au nœud courant", () => {
  const routeContext = getAeroportSpeechContextualStrings([route]);
  assert.ok(routeContext.includes("서울역에 가고 싶어요."));
  assert.ok(routeContext.includes("공항철도는 어디예요?"));
  assert.ok(!routeContext.includes("어디서 타요?"));

  const platformContext = getAeroportSpeechContextualStrings([platform, repeat]);
  assert.ok(platformContext.includes("어디서 타요?"));
  assert.ok(platformContext.includes("방금 뭐라고 하셨어요?"));
  assert.ok(!platformContext.includes("서울역에 가고 싶어요."));
});

test("le bilan ne transforme plus une variante contextuelle naturelle en point à revoir", () => {
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

  const summary = buildAeroportConversationSummary(memory);
  assert.ok(summary.achievements.includes("Trajet vers Seoul Station demandé"));
  assert.ok(summary.achievements.includes("Quai de l’AREX demandé"));
  assert.equal(summary.understoodWithCorrection, 0);
  assert.ok(
    !summary.vocabularyToReview.includes(
      "Transformer une intention comprise en demande suffisamment explicite",
    ),
  );
});

test("le bilan conserve une vraie lacune, le registre et l’étage comme points à revoir", () => {
  let memory = createAeroportConversationMemory();
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_start",
    transcript: "서울역에 가고 싶어요.",
    result: matchAeroportSpeechIntent("서울역에 가고 싶어요.", [route]),
  });
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_start",
    transcript: "서울역 어떻게 가?",
    result: matchAeroportSpeechIntent("서울역 어떻게 가?", [route]),
  });
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_after_recommend",
    transcript: "1층 플랫폼은 어디예요?",
    result: matchAeroportSpeechIntent("1층 플랫폼은 어디예요?", [platform, repeat]),
  });

  const summary = buildAeroportConversationSummary(memory);
  assert.ok(
    summary.vocabularyToReview.includes(
      "Transformer une intention comprise en demande suffisamment explicite",
    ),
  );
  assert.ok(
    summary.vocabularyToReview.includes(
      "Avec un agent : garder une forme polie en 요 / 주세요",
    ),
  );
  assert.ok(
    summary.vocabularyToReview.includes(
      "Repère d’étage : 지하 1층 = sous-sol 1, différent de 1층",
    ),
  );
});

test("une récupération ASR n’augmente ni les corrections ni les points à revoir", () => {
  let memory = createAeroportConversationMemory();
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_start",
    transcript: "서울력까지 어떻게 가요?",
    result: matchAeroportSpeechIntent("서울력까지 어떻게 가요?", [route]),
  });

  const summary = buildAeroportConversationSummary(memory);
  assert.equal(summary.understoodWithCorrection, 0);
  assert.equal(summary.vocabularyToReview.length, 0);
  assert.ok(summary.achievements.includes("Trajet vers Seoul Station demandé"));
});

test("une erreur bloquante suivie d’une bonne réponse reste comptée comme corrigée", () => {
  let memory = createAeroportConversationMemory();
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_after_recommend",
    transcript: "플랫폼…",
    result: matchAeroportSpeechIntent("플랫폼…", [platform, repeat]),
  });
  memory = recordAeroportSpeechAttempt(memory, {
    nodeId: "user_after_recommend",
    transcript: "플랫폼은 어디예요?",
    result: matchAeroportSpeechIntent("플랫폼은 어디예요?", [platform, repeat]),
  });
  const summary = buildAeroportConversationSummary(memory);
  assert.equal(summary.errorsCorrected, 1);
});

test("l’écran Aéroport conserve la reconnaissance, l’aide et le bilan uniquement sur la mission vocale", () => {
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

test("la liste Aéroport affiche toujours une carte VOCAL et ouvre le mode guidé", () => {
  const missionsSource = readFileSync(
    new URL("../app/lesson/aeroportMissions.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    missionsSource,
    /mission\.id === AEROPORT_SPEECH_PILOT_MISSION_ID/u,
  );
  assert.match(missionsSource, /variant=\{isVocal \? "vocal" : "access"\}/u);
  assert.match(missionsSource, /accent=\{isVocal \? VOCAL_VIOLET : CYAN\}/u);
  assert.match(
    missionsSource,
    /mission\.id === AEROPORT_SPEECH_PILOT_MISSION_ID[\s\S]*?\? "guided"[\s\S]*?: mode/u,
  );
  assert.match(missionsSource, /mission: mission\.id/u);
});
