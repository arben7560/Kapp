import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

import {
  getMetroSpeechContextualStrings,
  matchMetroSpeechIntent,
} from "../lib/metroSpeechIntents.ts";
import {
  buildMetroConversationSummary,
  createMetroConversationMemory,
  recordMetroAudioReplay,
  recordMetroHelpRequest,
  recordMetroSpeechAttempt,
} from "../lib/metroConversationMemory.ts";

const direction = {
  id: "choose_hongik_direction",
  label: "Demander la direction de Gangnam",
  korean: "강남 방향은 어느 쪽이에요?",
  nextNodeId: "ask_direction_hongik_ia_platform_direction",
};
const repeat = {
  id: "repeat_platform",
  label: "Pouvez-vous répéter ?",
  korean: "다시 한번 말씀해 주실 수 있나요?",
  nextNodeId: "ask_direction_hongik_ia_repeat_platform_direction",
};
const thanks = {
  id: "thank_after_direction",
  label: "Merci",
  korean: "감사합니다, 다 이해했어요!",
  nextNodeId: "ask_direction_hongik_ia_end",
};

test("les formulations naturelles vers Gangnam sont validées", () => {
  for (const transcript of [
    "강남 방향은 어느 쪽이에요?",
    "강남 가는 쪽이 어디예요?",
    "강남은 어느 쪽이에요?",
    "강남 쪽은 어디예요?",
    "강남 가려면 어디로 가야 해요?",
    "강남 가는 방향이 어디예요?",
    "강남역 가는 쪽이 어디예요?",
  ]) {
    const result = matchMetroSpeechIntent(transcript, [direction]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, direction.id, transcript);
  }
});

test("une phrase courte compréhensible passe avec une micro-correction", () => {
  const result = matchMetroSpeechIntent("강남 방향 어디예요?", [direction]);
  assert.equal(result.reason, "matched");
  assert.equal(result.category, "minor-imperfection");
  assert.equal(result.understoodWithCorrection, true);
  assert.match(result.feedback, /plus naturel/i);
});

test("les informations manquantes reçoivent un feedback ciblé", () => {
  const destinationOnly = matchMetroSpeechIntent("강남 어디예요?", [direction]);
  assert.equal(destinationOnly.category, "destination-only");
  assert.match(destinationOnly.feedback, /direction/i);

  const directionOnly = matchMetroSpeechIntent("어느 쪽이에요?", [direction]);
  assert.equal(directionOnly.category, "direction-only");
  assert.match(directionOnly.feedback, /destination/i);
});

test("les confusions de situation sont distinguées", () => {
  const cases = [
    ["몇 번 출구예요?", "exit-confusion"],
    ["얼마나 걸려요?", "duration-confusion"],
    ["어디서 환승해요?", "transfer-confusion"],
    ["이태원 방향은 어느 쪽이에요?", "wrong-destination"],
    ["bonjour", "french"],
    ["오늘 커피를 마셔요", "out-of-scope"],
  ];

  for (const [transcript, category] of cases) {
    assert.equal(
      matchMetroSpeechIntent(transcript, [direction]).category,
      category,
      transcript,
    );
  }
});

test("une intention française comprise encourage une production coréenne", () => {
  const result = matchMetroSpeechIntent(
    "De quel côté est le métro pour Gangnam ?",
    [direction],
  );
  assert.equal(result.category, "french");
  assert.match(result.feedback, /bien compris/i);
  assert.match(result.feedback, /강남/);
});

test("une transcription proche mais incertaine demande confirmation", () => {
  const result = matchMetroSpeechIntent("강람 방향", [direction]);
  assert.equal(result.reason, "uncertain");
  assert.equal(result.choice?.id, direction.id);
  assert.match(result.feedback, /peut-être/i);
});

test("l'aide devient progressivement plus explicite", () => {
  const first = matchMetroSpeechIntent("강남", [direction], 1);
  const second = matchMetroSpeechIntent("강남", [direction], 2);
  const third = matchMetroSpeechIntent("강남", [direction], 3);
  assert.doesNotMatch(first.feedback, /Mots utiles/);
  assert.match(second.feedback, /Mots utiles/);
  assert.match(third.feedback, /Phrase modèle/);
});

test("répéter et remercier restent utilisables vocalement", () => {
  assert.equal(
    matchMetroSpeechIntent("다시 한번 말씀해 주세요", [repeat, thanks]).choice?.id,
    repeat.id,
  );
  assert.equal(
    matchMetroSpeechIntent("감사합니다", [repeat, thanks]).choice?.id,
    thanks.id,
  );
});

test("le contexte vocal reste limité au nœud courant", () => {
  const context = getMetroSpeechContextualStrings([direction]);
  assert.ok(context.includes("강남"));
  assert.ok(context.includes("2호선"));
  assert.ok(!context.includes("이태원"));
});

test("la mission vocale réutilise ask-direction et conserve son accès premium", () => {
  const source = readFileSync(
    new URL("../data/lesson/metro/metroMissions.ts", import.meta.url),
    "utf8",
  );
  const missionBlock = source.match(
    /id: "ask-direction",[\s\S]*?missionKind: "mini",/,
  )?.[0];
  assert.ok(missionBlock);
  assert.match(missionBlock, /access: "premium"/);
  assert.match(missionBlock, /scenarioKey: "ask_direction"/);
  assert.match(source, /id: "choose_hongik_direction"/);
  assert.doesNotMatch(
    source.match(/function createAskDirectionLesson[\s\S]*?type MiniLessonConfig/)?.[0] ?? "",
    /choose_myeongdong_direction/,
  );
});

test("le runtime conserve et fige la même vidéo pendant le tour utilisateur", () => {
  const source = readFileSync(
    new URL("../app/lesson/metroIA.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /getScenarioInitialVideoSource/);
  assert.match(source, /player\.pause\(\);\s+player\.currentTime = Math\.max/);
  assert.doesNotMatch(source, /setDisplayedVideoSource\(null\)/);
  assert.doesNotMatch(source, /replaceAsync\(null\)/);
});

test("les vidéos nécessaires à la mission sont présentes", () => {
  for (const relativePath of [
    "../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4",
    "../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4",
    "../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4",
  ]) {
    assert.ok(statSync(new URL(relativePath, import.meta.url)).size > 0);
  }
});

test("le bilan Métro sépare réussite directe, correction, aide et répétition", () => {
  let memory = createMetroConversationMemory();
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "start",
    transcript: "강남 어디예요?",
    result: matchMetroSpeechIntent("강남 어디예요?", [direction]),
  });
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "start",
    transcript: "강남 방향 어디예요?",
    result: matchMetroSpeechIntent("강남 방향 어디예요?", [direction]),
  });
  memory = recordMetroHelpRequest(memory);
  memory = recordMetroAudioReplay(memory);

  const summary = buildMetroConversationSummary(memory);
  assert.equal(summary.speakingTurns, 2);
  assert.equal(summary.understoodWithCorrection, 1);
  assert.equal(summary.errorsCorrected, 1);
  assert.equal(summary.helpRequests, 1);
  assert.equal(summary.audioReplays, 1);
  assert.ok(summary.vocabularyToReview.includes("강남 방향"));
});
