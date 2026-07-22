import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { HANGUL_ASSESSMENT_QUESTIONS } from "../data/hangul/assessment.ts";
import { HANGUL_MODULES } from "../data/hangul/curriculum.ts";
import { exercises as listeningExercises } from "../data/listeningExercises.ts";
import { GRAMMAR_STAGE_IDS } from "../data/grammar/index.ts";
import { shuffleArray, shuffleIndexedChoices } from "../lib/choiceOrder.ts";
import { buildGrammarPracticeQuestions } from "../lib/grammar/exercises.ts";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function seededRandom(seed) {
  let state = Math.imul(seed, 2654435761) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function observedAnswerPositions(choices, isCorrect) {
  const positions = new Set();
  for (let seed = 1; seed <= 80; seed += 1) {
    positions.add(shuffleArray(choices, seededRandom(seed)).findIndex(isCorrect));
  }
  return positions;
}

test("Fisher-Yates preserves indexed answer mappings and every position", () => {
  const source = ["correct", "distractor-1", "distractor-2", "distractor-3"];
  const original = [...source];
  const positions = new Set();
  for (let seed = 1; seed <= 80; seed += 1) {
    const shuffled = shuffleIndexedChoices(source, 0, seededRandom(seed));
    assert.equal(shuffled.choices[shuffled.correctIndex], "correct");
    positions.add(shuffled.correctIndex);
  }
  assert.deepEqual(source, original);
  assert.deepEqual([...positions].sort(), [0, 1, 2, 3]);
});

test("several listening exercises keep their real answer after shuffling", () => {
  for (const exercise of listeningExercises.filter(({ type }) => type === "choice").slice(0, 8)) {
    const positions = observedAnswerPositions(exercise.answers, (answer) => answer === exercise.correct);
    assert.ok(positions.size > 1, exercise.id);
    assert.ok([...positions].some((position) => position > 0), exercise.id);
  }
});

test("several Hangul lesson and assessment questions preserve answer values", () => {
  const lessonQuestions = HANGUL_MODULES.flatMap((module) =>
    module.scenes.flatMap((scene) => scene.questions),
  ).slice(0, 12);
  for (const question of [...lessonQuestions, ...HANGUL_ASSESSMENT_QUESTIONS.slice(0, 6)]) {
    const positions = observedAnswerPositions(question.options, (option) => option.value === question.answer);
    assert.ok(positions.size > 1, question.id);
    assert.ok([...positions].some((position) => position > 0), question.id);
  }
});

test("grammar choice and ordering exercises randomize without changing answers", () => {
  for (const stageId of GRAMMAR_STAGE_IDS.slice(0, 8)) {
    const observedByQuestion = new Map();
    for (let seed = 1; seed <= 24; seed += 1) {
      for (const question of buildGrammarPracticeQuestions(stageId, 1, seededRandom(seed))) {
        assert.ok(Array.isArray(question.answer) || question.options.includes(question.answer), question.id);
        if (typeof question.answer === "string") {
          const positions = observedByQuestion.get(question.id) ?? new Set();
          positions.add(question.options.indexOf(question.answer));
          observedByQuestion.set(question.id, positions);
        }
      }
    }
    for (const [questionId, positions] of observedByQuestion) {
      assert.ok(positions.size > 1, questionId);
      assert.ok([...positions].some((position) => position > 0), questionId);
    }
  }
});

test("all evaluated renderers use the shared stable choice-order logic", () => {
  const files = [
    "app/(tabs)/listen.tsx",
    "app/listen/CafeListen.tsx",
    "app/listen/index-quiz.tsx",
    "components/hangul/HangulLessonScreen.tsx",
    "app/(tabs)/hangul/assessment.tsx",
    "app/(tabs)/voc/famille.tsx",
    "app/(tabs)/voc/objets.tsx",
    "app/(tabs)/voc/voyage.tsx",
    "app/(tabs)/voc/health.tsx",
    "app/immersion/convenience-night.tsx",
  ];
  for (const file of files) {
    assert.match(readFileSync(join(projectRoot, file), "utf8"), /lib\/choiceOrder/u, file);
  }
});
