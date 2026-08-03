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
import {
  advanceHangulQuiz,
  answerHangulQuizQuestion,
  createHangulQuizSession,
  restoreHangulQuizSession,
  shuffleHangulQuestions,
} from "../lib/hangulQuiz.ts";
import { PREMIUM_ROUTE_PATHS } from "../lib/paywall/config.ts";
import { createRestartableSpeechController } from "../lib/restartableSpeech.ts";

const QUIZ_TEST_QUESTIONS = ["q1", "q2", "q3"].map((id) => ({
  id,
  type: "read",
  prompt: `Question ${id}`,
  options: [
    { value: `${id}-correct`, label: "Correct" },
    { value: `${id}-wrong`, label: "Incorrect" },
  ],
  answer: `${id}-correct`,
  explanation: `Explication ${id}`,
  characters: [id],
}));

const answerAndAdvance = (session, value) =>
  advanceHangulQuiz(answerHangulQuizQuestion(session, value));

test("the curriculum covers the complete modern Hangul inventory", () => {
  assert.equal(new Set(ALL_HANGUL_VOWELS).size, 21);
  assert.equal(new Set(ALL_HANGUL_CONSONANTS).size, 19);
  assert.equal(new Set(ESSENTIAL_FINAL_SOUNDS).size, 7);
});

test("Hangul replay waits for stop and keeps only the latest rapid request", async () => {
  const events = [];
  const speechController = createRestartableSpeechController({
    async stop() {
      events.push("stop");
    },
    speak(value) {
      events.push(`speak:${value}`);
    },
  });

  const firstPlayback = speechController.speak("아", {
    language: "ko-KR",
    rate: 0.72,
  });
  const latestPlayback = speechController.speak("오|우", {
    language: "ko-KR",
    rate: 0.72,
  });

  await Promise.all([firstPlayback, latestPlayback]);

  assert.deepEqual(events, ["stop", "stop", "speak:오", "speak:우"]);
});

test("every Hangul listening exercise exposes a playable audio source", () => {
  const questions = [
    ...HANGUL_MODULES.flatMap((module) =>
      module.scenes.flatMap((scene) => scene.questions),
    ),
    ...HANGUL_ASSESSMENT_QUESTIONS,
  ];

  for (const question of questions) {
    if (!question.prompt.toLocaleLowerCase("fr").includes("écoute")) continue;

    assert.ok(
      question.audio || question.options.some((option) => option.audio),
      `${question.id} has no playable audio source`,
    );
  }
});

test("the silent initial ieung discovery card has no audio", () => {
  const guardianCard = HANGUL_MODULES.flatMap((module) => module.scenes)
    .flatMap((scene) => scene.cards)
    .find((card) => card.id === "guardian");

  assert.ok(guardianCard);
  assert.equal(guardianCard.glyph, "ㅇ");
  assert.equal(guardianCard.audio, undefined);
});

test("every consonant discovery explains the model vowel sound", () => {
  const consonantScenes = HANGUL_MODULES.flatMap((module) => module.scenes)
    .filter(
      (scene) =>
        scene.cards.length > 0 &&
        scene.cards.every((card) => card.kind === "consonant") &&
        scene.questions.some(
          (question) => question.type === "character-to-sound",
        ),
    );

  assert.ok(consonantScenes.length >= 4);
  for (const scene of consonantScenes) {
    assert.match(scene.instruction, /ㅏ/u, scene.id);
    assert.match(scene.instruction, /consonne isolée/u, scene.id);
  }
});

test("Hangul answer positions are randomized without long same-position streaks", () => {
  const questions = Array.from({ length: 9 }, (_, index) => ({
    id: `position-${index}`,
    type: "read",
    prompt: `Position ${index}`,
    options: [
      { value: `correct-${index}`, label: "Correct" },
      { value: `wrong-a-${index}`, label: "Incorrect A" },
      { value: `wrong-b-${index}`, label: "Incorrect B" },
    ],
    answer: `correct-${index}`,
    explanation: "Test",
    characters: ["ㅏ"],
  }));

  const shuffled = shuffleHangulQuestions(questions, { random: () => 0 });
  const positions = shuffled.map((question) =>
    question.options.findIndex((option) => option.value === question.answer),
  );

  assert.deepEqual(
    shuffled.map((question) => question.id),
    questions.map((question) => question.id),
  );
  assert.ok(new Set(positions).size > 1);
  for (let index = 2; index < positions.length; index += 1) {
    assert.equal(
      positions[index] === positions[index - 1] &&
        positions[index] === positions[index - 2],
      false,
    );
  }
});

test("a repeated Hangul question moves its correct answer", () => {
  const initialSession = createHangulQuizSession("scene", [
    QUIZ_TEST_QUESTIONS[0],
  ]);
  const previousPosition = initialSession.questions[0].options.findIndex(
    (option) => option.value === QUIZ_TEST_QUESTIONS[0].answer,
  );
  const answered = answerHangulQuizQuestion(initialSession, "q1-wrong");
  const catchUp = advanceHangulQuiz(answered, () => 0);
  const nextPosition = catchUp.session.questions[0].options.findIndex(
    (option) => option.value === QUIZ_TEST_QUESTIONS[0].answer,
  );

  assert.equal(catchUp.status, "next-round");
  assert.notEqual(nextPosition, previousPosition);
});

test("a Hangul exercise completed without error finishes after the first round", () => {
  let session = createHangulQuizSession("scene", QUIZ_TEST_QUESTIONS);

  for (const [index, question] of QUIZ_TEST_QUESTIONS.entries()) {
    const advancement = answerAndAdvance(session, question.answer);
    if (index < QUIZ_TEST_QUESTIONS.length - 1) {
      assert.equal(advancement.status, "next-question");
      session = advancement.session;
    } else {
      assert.equal(advancement.status, "complete");
      assert.equal(advancement.session.score, QUIZ_TEST_QUESTIONS.length);
      assert.equal(advancement.session.round, 1);
    }
  }
});

test("one Hangul error creates a catch-up round containing only that question", () => {
  let session = createHangulQuizSession("scene", QUIZ_TEST_QUESTIONS);

  session = answerAndAdvance(session, QUIZ_TEST_QUESTIONS[0].answer).session;
  session = answerAndAdvance(session, "q2-wrong").session;
  const catchUp = answerAndAdvance(session, QUIZ_TEST_QUESTIONS[2].answer);

  assert.equal(catchUp.status, "next-round");
  assert.deepEqual(
    catchUp.session.questions.map((question) => question.id),
    ["q2"],
  );
  assert.deepEqual(Object.keys(catchUp.session.correctQuestionIds).sort(), [
    "q1",
    "q3",
  ]);

  const completed = answerAndAdvance(
    catchUp.session,
    QUIZ_TEST_QUESTIONS[1].answer,
  );
  assert.equal(completed.status, "complete");
  assert.equal(completed.session.score, QUIZ_TEST_QUESTIONS.length);
});

test("multiple Hangul errors keep only the incorrect questions", () => {
  let session = createHangulQuizSession("scene", QUIZ_TEST_QUESTIONS);

  session = answerAndAdvance(session, "q1-wrong").session;
  session = answerAndAdvance(session, QUIZ_TEST_QUESTIONS[1].answer).session;
  const catchUp = answerAndAdvance(session, "q3-wrong");

  assert.equal(catchUp.status, "next-round");
  assert.deepEqual(
    catchUp.session.questions.map((question) => question.id),
    ["q1", "q3"],
  );
  assert.deepEqual(Object.keys(catchUp.session.correctQuestionIds), ["q2"]);
});

test("an error repeated during catch-up remains alone in the next round", () => {
  const initialSession = createHangulQuizSession("scene", [
    QUIZ_TEST_QUESTIONS[0],
  ]);
  const firstCatchUp = answerAndAdvance(initialSession, "q1-wrong");
  const secondCatchUp = answerAndAdvance(firstCatchUp.session, "q1-wrong");

  assert.equal(firstCatchUp.status, "next-round");
  assert.equal(secondCatchUp.status, "next-round");
  assert.deepEqual(
    secondCatchUp.session.questions.map((question) => question.id),
    ["q1"],
  );
  assert.equal(secondCatchUp.session.round, 3);

  const completed = answerAndAdvance(
    secondCatchUp.session,
    QUIZ_TEST_QUESTIONS[0].answer,
  );
  assert.equal(completed.status, "complete");
});

test("a paused Hangul catch-up round survives closing and reopening", () => {
  let session = createHangulQuizSession("scene", QUIZ_TEST_QUESTIONS);

  session = answerAndAdvance(session, "q1-wrong").session;
  session = answerAndAdvance(session, QUIZ_TEST_QUESTIONS[1].answer).session;
  const catchUp = answerAndAdvance(session, QUIZ_TEST_QUESTIONS[2].answer);
  const answeredCatchUp = answerHangulQuizQuestion(
    catchUp.session,
    "q1-wrong",
  );
  const serialized = JSON.stringify(answeredCatchUp);
  const restored = restoreHangulQuizSession(
    JSON.parse(serialized),
    QUIZ_TEST_QUESTIONS,
  );

  assert.equal(JSON.stringify(restored), serialized);
  assert.equal(restored.round, 2);
  assert.equal(restored.answered, "q1-wrong");
  assert.deepEqual(restored.roundIncorrectQuestionIds, ["q1"]);
  assert.deepEqual(Object.keys(restored.correctQuestionIds).sort(), [
    "q2",
    "q3",
  ]);

  const nextCatchUp = advanceHangulQuiz(restored);
  assert.equal(nextCatchUp.status, "next-round");
  assert.deepEqual(
    nextCatchUp.session.questions.map((question) => question.id),
    ["q1"],
  );
});

test("the next Hangul stage stays locked until every error is corrected", () => {
  const initialSession = createHangulQuizSession("scene", [
    QUIZ_TEST_QUESTIONS[0],
  ]);
  const firstCatchUp = answerAndAdvance(initialSession, "q1-wrong");
  const secondCatchUp = answerAndAdvance(firstCatchUp.session, "q1-wrong");

  assert.notEqual(firstCatchUp.status, "complete");
  assert.notEqual(secondCatchUp.status, "complete");
  assert.equal(firstCatchUp.session.score, 0);
  assert.equal(secondCatchUp.session.score, 0);

  const completed = answerAndAdvance(
    secondCatchUp.session,
    QUIZ_TEST_QUESTIONS[0].answer,
  );
  assert.equal(completed.status, "complete");
  assert.equal(completed.session.score, 1);
  assert.equal(
    completed.session.score,
    completed.session.originalQuestionCount,
  );
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
      correctQuestionIds: { [question.id]: true },
      roundIncorrectQuestionIds: [],
      round: 1,
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
