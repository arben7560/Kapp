import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { HANGUL_ASSESSMENT_QUESTIONS } from "../data/hangul/assessment.ts";
import {
  ALL_HANGUL_CONSONANTS,
  ALL_HANGUL_VOWELS,
  ESSENTIAL_FINAL_SOUNDS,
  HANGUL_ASSESSMENT_PASS_SCORE,
  HANGUL_MASTERY_THRESHOLD,
  HANGUL_MODULES,
  HANGUL_PROGRESS_IDS,
  HANGUL_ROUTE_ORDER,
  SIMPLE_FINAL_GROUPS,
  isHangulCurriculumComplete,
  validateHangulCurriculum,
} from "../data/hangul/curriculum.ts";
import { createEmptyHangulProgress } from "../data/hangul/types.ts";
import { PREMIUM_ROUTE_PATHS } from "../lib/paywall/config.ts";

test("the curriculum covers the complete modern Hangul inventory", () => {
  assert.equal(new Set(ALL_HANGUL_VOWELS).size, 21);
  assert.equal(new Set(ALL_HANGUL_CONSONANTS).size, 19);
  assert.equal(new Set(ESSENTIAL_FINAL_SOUNDS).size, 7);
});

test("the 16 simple final spellings map exactly to the seven final sounds", () => {
  assert.deepEqual(Object.keys(SIMPLE_FINAL_GROUPS), [...ESSENTIAL_FINAL_SOUNDS]);
  const spellings = Object.values(SIMPLE_FINAL_GROUPS).flat();
  assert.equal(spellings.length, 16);
  assert.equal(new Set(spellings).size, 16);
});

test("every scene respects the progressive character sequence", () => {
  assert.deepEqual(validateHangulCurriculum(), []);
});

test("progress identifiers and route transitions remain unique", () => {
  assert.equal(new Set(HANGUL_PROGRESS_IDS).size, HANGUL_PROGRESS_IDS.length);
  assert.equal(new Set(HANGUL_ROUTE_ORDER).size, HANGUL_ROUTE_ORDER.length);
  assert.equal(HANGUL_ROUTE_ORDER.at(-2), "/(tabs)/hangul/assessment");
  assert.equal(HANGUL_ROUTE_ORDER.at(-1), "/(tabs)/hangul/bridge");
});

test("every declared Hangul route resolves to an Expo Router screen", () => {
  const projectRoot = fileURLToPath(new URL("..", import.meta.url));
  for (const route of HANGUL_ROUTE_ORDER) {
    const relativeRoute = route.replace(/^\//, "");
    assert.equal(
      existsSync(join(projectRoot, "app", `${relativeRoute}.tsx`)),
      true,
      `${route} does not resolve to a screen`,
    );
  }
});

test("the final assessment is substantial and does not expose romanization", () => {
  assert.equal(HANGUL_ASSESSMENT_QUESTIONS.length, 12);
  const source = JSON.stringify(HANGUL_ASSESSMENT_QUESTIONS);
  assert.doesNotMatch(source, /romanization/i);
  assert.ok(HANGUL_ASSESSMENT_QUESTIONS.some((question) => question.type === "audio-to-character"));
  assert.ok(HANGUL_ASSESSMENT_QUESTIONS.some((question) => question.type === "assemble"));
  assert.ok(HANGUL_ASSESSMENT_QUESTIONS.some((question) => question.type === "layout"));
});

test("mastery and final-assessment boundaries use the intended thresholds", () => {
  assert.equal(5 / 6 >= HANGUL_MASTERY_THRESHOLD, false);
  assert.equal(6 / 7 >= HANGUL_MASTERY_THRESHOLD, true);
  assert.equal(HANGUL_ASSESSMENT_PASS_SCORE, 11);
  assert.equal(10 >= HANGUL_ASSESSMENT_PASS_SCORE, false);
  assert.equal(11 >= HANGUL_ASSESSMENT_PASS_SCORE, true);
});

test("the final assessment unlocks only after all five modules", () => {
  const completed = Object.fromEntries(HANGUL_MODULES.map((module) => [module.id, true]));
  assert.equal(isHangulCurriculumComplete({}), false);
  assert.equal(isHangulCurriculumComplete({ ...completed, [HANGUL_MODULES.at(-1).id]: false }), false);
  assert.equal(isHangulCurriculumComplete(completed), true);
});

test("detailed progression, including a paused quiz, survives serialization", () => {
  const progress = createEmptyHangulProgress();
  const question = HANGUL_MODULES[0].scenes[0].questions[0];
  progress.lessons[HANGUL_MODULES[0].id] = {
    currentSceneId: HANGUL_MODULES[0].scenes[0].id,
    discovered: { [HANGUL_MODULES[0].scenes[0].cards[0].id]: true },
    completedScenes: {},
    masteredScenes: {},
    scores: {},
    errorsByCharacter: { "ㅇ": 2 },
    activeQuiz: {
      sceneId: HANGUL_MODULES[0].scenes[0].id,
      questions: [question],
      questionIndex: 0,
      answered: question.options[0].value,
      score: 1,
      retrySourceIds: {},
      originalQuestionIds: [question.id],
      originalQuestionCount: 1,
    },
  };
  progress.masteredCharacters["ㅏ"] = true;

  const serialized = JSON.stringify(progress);
  const restored = JSON.parse(serialized);
  assert.equal(JSON.stringify(restored), serialized);
  assert.equal(restored.lessons.hangul_vowels_basic.activeQuiz.questionIndex, 0);
  assert.equal(restored.lessons.hangul_vowels_basic.activeQuiz.score, 1);
  assert.equal(restored.lessons.hangul_vowels_basic.errorsByCharacter["ㅇ"], 2);
  assert.equal(restored.masteredCharacters["ㅏ"], true);
});

test("card identifiers are unique inside each persisted lesson and question identifiers are global", () => {
  for (const module of HANGUL_MODULES) {
    const cardIds = module.scenes.flatMap((scene) => scene.cards.map((card) => card.id));
    assert.equal(new Set(cardIds).size, cardIds.length, `${module.id} reuses a persisted card id`);
  }
  const questionIds = HANGUL_MODULES.flatMap((module) => module.scenes.flatMap((scene) => scene.questions.map((question) => question.id)));
  assert.equal(new Set(questionIds).size, questionIds.length);
});

test("every module contains a real practice volume", () => {
  for (const module of HANGUL_MODULES) {
    assert.ok(module.scenes.length >= 3, `${module.id} needs at least three scenes`);
    for (const scene of module.scenes) {
      assert.ok(scene.questions.length >= 6, `${module.id}/${scene.id} needs at least six questions`);
    }
  }
});

test("the complete reading foundation remains outside the premium paywall", () => {
  for (const route of HANGUL_ROUTE_ORDER) {
    assert.equal(PREMIUM_ROUTE_PATHS.has(route), false, `${route} must remain free`);
    assert.equal(PREMIUM_ROUTE_PATHS.has(route.replace("/(tabs)", "")), false, `${route} must remain free`);
  }
});
