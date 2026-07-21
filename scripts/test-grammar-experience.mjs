import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { GRAMMAR_STAGE_IDS } from "../data/grammar/index.ts";
import {
  advanceGrammarPracticeSession,
  answerGrammarPracticeQuestion,
  buildGrammarPracticeQuestions,
  createEmptyGrammarLearningProgress,
  createGrammarPracticeSession,
  getGrammarJourneyCompletion,
  getGrammarStageAccess,
  getGrammarStageState,
  markGrammarSessionStreakRecorded,
  normalizeGrammarLearningProgress,
  recordGrammarSessionCompletion,
  setGrammarActiveSession,
  setGrammarPracticeDraft,
} from "../lib/grammar/index.ts";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const FIRST_STAGE = "sentence-structure";
const SECOND_STAGE = "identify-with-copula";

function answerRemainingCorrectly(session, completedAt = "2026-07-21T10:10:00.000Z") {
  let current = session;
  while (!current.completedAt) {
    const question = current.questions[current.questionIndex];
    const alreadyAnswered = current.responses.some((item) => item.questionId === question.id);
    if (!alreadyAnswered) {
      current = answerGrammarPracticeQuestion(current, question.answer);
    }
    current = advanceGrammarPracticeSession(current, completedAt);
  }
  return current;
}

test("every registered stage produces a five-exercise public practice", () => {
  for (const stageId of GRAMMAR_STAGE_IDS) {
    const questions = buildGrammarPracticeQuestions(stageId);
    assert.equal(questions.length, 5, stageId);
    assert.ok(questions.some(({ kind }) => kind === "order" || kind === "gap"), stageId);
    assert.ok(questions.some(({ kind }) => kind === "scene"), stageId);
    for (const question of questions) {
      assert.ok(question.options.length >= 2, question.id);
      if (typeof question.answer === "string") {
        assert.ok(question.options.includes(question.answer), question.id);
      }
      assert.ok(question.explanation.length > 0, question.id);
    }
  }
});

test("wrong and correct answers persist while a first lesson is resumed", () => {
  const started = createGrammarPracticeSession(FIRST_STAGE, 1, "2026-07-21T10:00:00.000Z");
  const firstQuestion = started.questions[0];
  const wrongAnswer = firstQuestion.options.find((option) => option !== firstQuestion.answer);
  assert.ok(wrongAnswer);

  const answeredWrong = answerGrammarPracticeQuestion(started, wrongAnswer);
  assert.equal(answeredWrong.score, 0);
  assert.equal(answeredWrong.responses[0].correct, false);
  const advanced = advanceGrammarPracticeSession(answeredWrong, "2026-07-21T10:01:00.000Z");
  const drafted = setGrammarPracticeDraft(advanced, ["저는"]);
  const stored = setGrammarActiveSession(createEmptyGrammarLearningProgress(), drafted);
  const restored = normalizeGrammarLearningProgress(JSON.parse(JSON.stringify(stored)));

  assert.equal(restored.stages[FIRST_STAGE].activeSession.questionIndex, 1);
  assert.deepEqual(restored.stages[FIRST_STAGE].activeSession.draftAnswer, ["저는"]);
  assert.equal(restored.stages[FIRST_STAGE].activeSession.responses[0].correct, false);
});

test("completing the first lesson records practiced state and satisfies the next recommendation", () => {
  const before = createEmptyGrammarLearningProgress();
  const recommendationBefore = getGrammarStageAccess(before, SECOND_STAGE);
  assert.equal(recommendationBefore.canOpen, true);
  assert.equal(recommendationBefore.missingRecommended.length, 1);

  const session = createGrammarPracticeSession(FIRST_STAGE, 1, "2026-07-21T10:00:00.000Z");
  const completed = answerRemainingCorrectly(session);
  const progress = recordGrammarSessionCompletion(before, completed);

  assert.equal(completed.score, 5);
  assert.equal(getGrammarStageState(progress, FIRST_STAGE), "practiced");
  assert.equal(progress.stages[FIRST_STAGE].attempts, 1);
  assert.equal(getGrammarJourneyCompletion(progress), 1 / GRAMMAR_STAGE_IDS.length);
  assert.equal(getGrammarStageAccess(progress, SECOND_STAGE).missingRecommended.length, 0);
});

test("one completed session and a repeated lesson are each recorded only once", () => {
  const first = answerRemainingCorrectly(
    createGrammarPracticeSession(FIRST_STAGE, 1, "2026-07-21T10:00:00.000Z"),
  );
  const once = recordGrammarSessionCompletion(createEmptyGrammarLearningProgress(), first);
  const duplicate = recordGrammarSessionCompletion(once, first);
  assert.equal(duplicate.stages[FIRST_STAGE].attempts, 1);
  assert.equal(duplicate.stages[FIRST_STAGE].completedSessionIds.length, 1);

  const repeated = answerRemainingCorrectly(
    createGrammarPracticeSession(FIRST_STAGE, 2, "2026-07-22T10:00:00.000Z"),
    "2026-07-22T10:10:00.000Z",
  );
  const twice = recordGrammarSessionCompletion(duplicate, repeated);
  assert.equal(twice.stages[FIRST_STAGE].attempts, 2);
  assert.equal(twice.stages[FIRST_STAGE].bestScore, 1);

  const streakOnce = markGrammarSessionStreakRecorded(twice, FIRST_STAGE, repeated.id);
  const streakDuplicate = markGrammarSessionStreakRecorded(streakOnce, FIRST_STAGE, repeated.id);
  assert.deepEqual(streakDuplicate.stages[FIRST_STAGE].streakSessionIds, [repeated.id]);
});

test("the public screens keep explicit compact and tablet layouts", () => {
  const hub = readFileSync(join(projectRoot, "app/(tabs)/grammar/index.tsx"), "utf8");
  const lesson = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  assert.match(hub, /useResponsiveLayout\(\{ maxWidth: 960 \}\)/u);
  assert.match(hub, /responsive\.isTablet/u);
  assert.match(lesson, /useResponsiveLayout\(\{ maxWidth: 900 \}\)/u);
  assert.match(lesson, /responsive\.isCompact/u);
  assert.match(lesson, /responsive\.isTablet/u);
});
