import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  GRAMMAR_CONCEPTS,
  GRAMMAR_LESSON_GUIDES,
  GRAMMAR_STAGE_BY_ID,
  GRAMMAR_STAGE_IDS,
  getGrammarLessonGuide,
} from "../data/grammar/index.ts";
import {
  GRAMMAR_QUICK_GUIDE_STAGE_IDS,
  isGrammarQuickGuideStage,
} from "../data/grammar/lessonGuides.ts";
import {
  advanceGrammarPracticeSession,
  answerGrammarPracticeQuestion,
  buildGrammarPracticeQuestions,
  canAccessGrammarStage,
  canRepeatGrammarPractice,
  createEmptyGrammarLearningProgress,
  createGrammarPracticeSession,
  getGrammarIncorrectFeedback,
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

test("the six grammar chapters have complete mini-lessons", () => {
  const coveredChapterStageIds = GRAMMAR_STAGE_IDS.filter(
    (stageId) => [
      "foundations",
      "build-a-sentence",
      "daily-actions",
      "express-needs",
      "time-and-linking",
      "a1-validation",
    ].includes(
      GRAMMAR_STAGE_BY_ID[stageId].chapterId,
    ),
  );

  assert.deepEqual(Object.keys(GRAMMAR_LESSON_GUIDES), coveredChapterStageIds);

  for (const stageId of coveredChapterStageIds) {
    const guide = getGrammarLessonGuide(stageId);
    assert.ok(guide, stageId);
    assert.equal(guide.stageId, stageId);
    assert.ok(guide.introduction.length > 40, `${stageId}: introduction`);
    assert.ok(guide.mainRule.length > 40, `${stageId}: main rule`);
    assert.ok(guide.formula.pattern.length > 10, `${stageId}: formula`);
    assert.ok(guide.formula.explanation.length > 30, `${stageId}: formula explanation`);
    assert.ok(guide.steps.length >= 3, `${stageId}: steps`);
    assert.ok(guide.examples.length >= 2, `${stageId}: examples`);
    assert.ok(
      guide.examples.every((example) => example.parts.length >= 2),
      `${stageId}: decomposed examples`,
    );
    assert.ok(guide.commonMistakes.length >= 2, `${stageId}: common mistakes`);
    assert.ok(guide.memoryTip.length > 30, `${stageId}: memory tip`);
  }

  assert.ok(getGrammarLessonGuide("present-actions"));
  assert.ok(getGrammarLessonGuide("range-and-limit"));
  assert.ok(getGrammarLessonGuide("past-event"));
  assert.ok(getGrammarLessonGuide("a1-validation"));
});

test("grammar theory opens in a reusable modal and resumes without replacing its session", () => {
  const lesson = readFileSync(
    join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"),
    "utf8",
  );
  const modal = readFileSync(
    join(projectRoot, "components/grammar/GrammarLessonGuideModal.tsx"),
    "utf8",
  );
  const guideContent = readFileSync(
    join(projectRoot, "components/grammar/GrammarLessonGuide.tsx"),
    "utf8",
  );

  assert.match(lesson, /<GrammarLessonGuideModal/u);
  assert.match(lesson, /const theoryModalVisible =/u);
  assert.match(lesson, /const theoryEntryRequested = rawTheory === "open"/u);
  assert.match(lesson, /theoryEntryRequested \|\|/u);
  assert.match(lesson, /router\.setParams\(\{ theory: "closed" \}/u);
  assert.match(lesson, /!session && dismissedTheoryStageId !== stageId/u);
  assert.match(lesson, /onReviewExplanation=\{\(\) => setRequestedTheoryStageId\(stageId\)\}/u);
  assert.match(lesson, /onRequestClose=\{closeTheory\}/u);
  assert.match(lesson, /onAccessExercises=\{accessExercises\}/u);
  assert.match(lesson, /const dismissTheory = React\.useCallback/u);
  assert.match(lesson, /if \(!isQuickGuide && !session\) startPractice\(\)/u);
  assert.match(lesson, /const accessExercises = React\.useCallback/u);
  assert.match(lesson, /if \(!session\) startPractice\(\)/u);
  assert.match(lesson, /onStartExercises=\{isQuickGuide \? startPractice : undefined\}/u);
  assert.match(lesson, /Revoir l’explication/u);
  assert.match(modal, /export function GrammarLessonGuideModal/u);
  assert.match(modal, /label="Accéder aux exercices"/u);
  assert.match(modal, /onPress=\{onAccessExercises\}/u);
  assert.match(modal, /isQuickGuide && styles\.exerciseFooterQuick/u);
  assert.match(guideContent, /setShowDetails\(\(current\) => !current\)/u);
  assert.match(guideContent, /\{\(!isQuickGuide \|\| showDetails\) \? \(/u);
  assert.match(
    readFileSync(join(projectRoot, "app/(tabs)/grammar/index.tsx"), "utf8"),
    /onPress=\{\(\) => openStage\(stageId, true\)\}/u,
  );
  for (const section of [
    "L’IDÉE ESSENTIELLE",
    "RÈGLE PRINCIPALE",
    "LA FORMULE",
    "EXEMPLES DÉCOMPOSÉS",
    "ERREURS FRÉQUENTES",
    "ASTUCE MÉMOIRE",
  ]) {
    assert.match(guideContent, new RegExp(section, "u"), section);
  }
});

test("the concise grammar guide covers exactly lessons 01–10", () => {
  assert.deepEqual(GRAMMAR_QUICK_GUIDE_STAGE_IDS, GRAMMAR_STAGE_IDS.slice(0, 10));
  const expectedExamples = [
    ["sentence-structure", "저는 커피를 마셔요."],
    ["identify-with-copula", "학생이에요."],
    ["polite-register", "괜찮아요."],
    ["introduce-topic", "저는 프랑스 사람이에요."],
    ["demonstratives", "이거 뭐예요?"],
    ["nominal-questions", "누구예요?"],
    ["existence", "채식 메뉴가 있어요?"],
    ["locate-thing", "화장실은 2층에 있어요."],
    ["present-actions", "매일 공부해요."],
    ["object-actions", "커피를 마셔요."],
  ];
  for (const [stageId, example] of expectedExamples) {
    const guide = getGrammarLessonGuide(stageId);
    assert.ok(isGrammarQuickGuideStage(stageId), stageId);
    assert.equal(guide.examples[0].korean, example, stageId);
    assert.ok(guide.introduction.length > 40, stageId);
    assert.ok(guide.mainRule.length > 40, stageId);
  }
  assert.equal(isGrammarQuickGuideStage("action-location"), false);
  assert.ok(getGrammarLessonGuide("introduce-topic").examples.some(
    ({ korean }) => korean === "오늘은 쉬어요.",
  ));
});

test("lessons 06–10 introduce the distinctions used in their exercises", () => {
  const guide6 = getGrammarLessonGuide("nominal-questions");
  const guide7 = getGrammarLessonGuide("existence");
  const guide8 = getGrammarLessonGuide("locate-thing");
  const guide9 = getGrammarLessonGuide("present-actions");
  const guide10 = getGrammarLessonGuide("object-actions");

  assert.match(guide6.mainRule, /뭐.*누구.*몇.*명.*장/u);
  assert.match(guide7.mainRule, /이.*가.*있어요.*없어요/u);
  assert.match(guide7.formula.explanation, /버스가 와요.*아니에요/u);
  assert.match(guide8.mainRule, /에.*있어요/u);
  assert.match(guide8.formula.explanation, /에서/u);
  assert.match(guide9.mainRule, /아요.*어요.*해요/u);
  assert.match(guide10.mainRule, /을.*를/u);
  assert.match(guide10.formula.explanation, /은\/는/u);
  assert.ok(guide10.examples.some(({ korean }) => korean === "책을 읽어요."));

  const drill = (conceptId, drillId) =>
    GRAMMAR_CONCEPTS.find(({ id }) => id === conceptId)?.practice.drills
      .find(({ id }) => id === drillId);
  assert.equal(drill("question-mwo-nugu-myeot", "how-many-people")?.answer, "몇");
  assert.equal(drill("existence-isseoyo-eopseoyo", "menu-available")?.answer, "있어요");
  assert.equal(drill("location-e", "floor-existence")?.answer, "에");
  assert.equal(drill("present-a-eoyo", "study-present")?.answer, "공부해요");
  assert.equal(drill("object-eul-reul", "book-batchim")?.answer, "을");
});

test("the freemium boundary keeps A0 free and reserves A1 to Premium", () => {
  const freeStages = GRAMMAR_STAGE_IDS.filter(
    (stageId) => GRAMMAR_STAGE_BY_ID[stageId].access === "free",
  );
  const premiumStages = GRAMMAR_STAGE_IDS.filter(
    (stageId) => GRAMMAR_STAGE_BY_ID[stageId].access === "premium",
  );

  assert.equal(freeStages.length, 15);
  assert.equal(premiumStages.length, 26);
  assert.ok(
    freeStages.every(
      (stageId) => GRAMMAR_STAGE_BY_ID[stageId].status === "pre-a1",
    ),
  );
  assert.ok(
    premiumStages.every(
      (stageId) => GRAMMAR_STAGE_BY_ID[stageId].status === "a1",
    ),
  );
  assert.ok(
    freeStages.every((stageId) =>
      canRepeatGrammarPractice(GRAMMAR_STAGE_BY_ID[stageId], false),
    ),
  );
  assert.equal(
    canAccessGrammarStage(GRAMMAR_STAGE_BY_ID[FIRST_STAGE], false),
    true,
  );
  assert.equal(
    canAccessGrammarStage(GRAMMAR_STAGE_BY_ID["request-item"], false),
    false,
  );
  assert.equal(
    canAccessGrammarStage(GRAMMAR_STAGE_BY_ID["request-item"], true),
    true,
  );
});

test("A0 lessons and retries stay free without limit after success", () => {
  const freeStage = GRAMMAR_STAGE_BY_ID[FIRST_STAGE];
  assert.equal(canRepeatGrammarPractice(freeStage, false), true);
  assert.equal(canRepeatGrammarPractice(freeStage, true), true);

  const premiumStage = GRAMMAR_STAGE_BY_ID["request-item"];
  assert.equal(canRepeatGrammarPractice(premiumStage, false), false);
  assert.equal(canRepeatGrammarPractice(premiumStage, true), true);
});

test("unlocking Premium preserves already saved grammar progress", () => {
  const premiumStageId = "request-item";
  const premiumStage = GRAMMAR_STAGE_BY_ID[premiumStageId];
  const completedSession = answerRemainingCorrectly(
    createGrammarPracticeSession(
      premiumStageId,
      1,
      "2026-07-21T09:00:00.000Z",
    ),
    "2026-07-21T09:05:00.000Z",
  );
  const savedProgress = recordGrammarSessionCompletion(
    createEmptyGrammarLearningProgress(),
    completedSession,
  );
  const serializedBeforeUnlock = JSON.stringify(savedProgress);

  assert.equal(canAccessGrammarStage(premiumStage, false), false);
  assert.equal(canAccessGrammarStage(premiumStage, true), true);
  assert.equal(JSON.stringify(savedProgress), serializedBeforeUnlock);

  const restored = normalizeGrammarLearningProgress(
    JSON.parse(serializedBeforeUnlock),
  );
  assert.equal(getGrammarStageState(restored, premiumStageId), "practiced");
  assert.equal(restored.stages[premiumStageId].bestScore, 1);
});

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

test("lessons keep their configured exercise count and the general review covers twelve structures", () => {
  for (const stageId of GRAMMAR_STAGE_IDS) {
    const questions = buildGrammarPracticeQuestions(stageId);
    const isReview = GRAMMAR_STAGE_BY_ID[stageId].mode === "review";
    const expectedCount = GRAMMAR_STAGE_BY_ID[stageId].practiceQuestionCount ?? 5;
    assert.equal(questions.length, isReview ? 12 : expectedCount, stageId);
    assert.ok(questions.every(({ skill }) => !!skill), `${stageId}: targeted drills`);
    if (GRAMMAR_STAGE_BY_ID[stageId].mode === "review") {
      assert.ok(questions.every(({ kind }) => kind !== "order"), stageId);
    } else {
      assert.ok(
        questions.every(({ skill }) => !!skill) ||
          questions.some(({ kind }) =>
            kind === "order" || kind === "gap" || kind === "transformation"
          ),
        stageId,
      );
    }
    for (const question of questions) {
      assert.ok(question.options.length >= 2, question.id);
      if (typeof question.answer === "string") {
        assert.ok(question.options.includes(question.answer), question.id);
      }
      assert.ok(question.explanation.length > 0, question.id);
    }
  }

  const abilityQuestions = buildGrammarPracticeQuestions("express-ability", 1, () => 0.42);
  assert.deepEqual(
    abilityQuestions.map(({ exerciseGroup }) => exerciseGroup),
    [
      "capacity",
      "capacity",
      "capacity",
      "situational-feasibility",
      "situational-feasibility",
      "situational-feasibility",
      "situational-feasibility",
    ],
  );
});

test("distractors stay specific to the notion and corrections are question-specific", () => {
  for (const stageId of GRAMMAR_STAGE_IDS) {
    const questions = buildGrammarPracticeQuestions(stageId, 2, () => 0.42);
    assert.equal(
      new Set(questions.map(({ explanation }) => explanation)).size,
      questions.length,
      stageId,
    );

    for (const question of questions) {
      if (question.kind === "order" || Array.isArray(question.answer)) continue;
      const concept = GRAMMAR_CONCEPTS.find(({ id }) => id === question.conceptIds[0]);
      assert.ok(concept, question.id);
      const allowed = new Set(
        [
          concept.practice.focusForm,
          ...concept.practice.formDistractors,
          concept.practice.scene.korean,
          concept.practice.scene.french,
          ...concept.examples.flatMap((example) => [example.korean, example.french]),
          ...concept.practice.drills.flatMap((drill) =>
            drill.kind === "order"
              ? []
              : [drill.answer, ...drill.distractors]
          ),
        ],
      );
      for (const option of question.options) {
        assert.ok(allowed.has(option), `${question.id}: unrelated option ${option}`);
        assert.notEqual(option.trim(), "", question.id);
      }
      assert.equal(new Set(question.options).size, question.options.length, question.id);
    }
  }
});

test("context-dependent questions display their situation before the choices", () => {
  for (const stageId of GRAMMAR_STAGE_IDS) {
    const questions = buildGrammarPracticeQuestions(stageId, 1, () => 0.42);

    for (const question of questions.filter(({ kind }) => kind === "scene")) {
      assert.match(question.display, /CONTEXTE\n/u, question.id);
    }

    for (const question of questions.filter(({ kind, skill }) =>
      !skill && (kind === "transformation" || kind === "scene")
    )) {
      const concept = GRAMMAR_CONCEPTS.find(({ id }) => id === question.conceptIds[0]);
      assert.ok(concept, question.id);
      assert.ok(question.display.includes(concept.practice.scenario), question.id);
    }
  }

  const dailyRegister = buildGrammarPracticeQuestions("polite-register", 1, () => 0.42)[0];
  assert.match(dailyRegister.display, /CONTEXTE\n/u);
  assert.match(dailyRegister.prompt, /(?:style|présent) poli courant/u);

  const technicalAbility = buildGrammarPracticeQuestions("express-ability", 3, () => 0.42)
    .find(({ ruleAspect }) => ruleAspect === "ability-vs-permission");
  assert.ok(technicalAbility);
  assert.match(technicalAbility.display, /terminal accepte techniquement/u);
});

test("all rotated question wordings keep one answer and a coherent correction", () => {
  const answerByWording = new Map();

  for (const stageId of GRAMMAR_STAGE_IDS) {
    const attempts = GRAMMAR_STAGE_BY_ID[stageId].mode === "review" ? 9 : 4;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const questions = buildGrammarPracticeQuestions(stageId, attempt, () => 0.42);
      for (const question of questions) {
        const wording = `${question.prompt}\n${question.display ?? ""}`;
        const serializedAnswer = Array.isArray(question.answer)
          ? question.answer.join(" ")
          : question.answer;
        const previous = answerByWording.get(wording);
        assert.equal(
          previous?.answer ?? serializedAnswer,
          serializedAnswer,
          `${question.id}: same wording also used by ${previous?.id}`,
        );
        answerByWording.set(wording, { answer: serializedAnswer, id: question.id });
        assert.ok(question.explanation.includes(serializedAnswer.replace(/[.!?]+$/u, "")), question.id);
      }
    }
  }
});

test("incorrect grammar feedback starts with the exact rule instead of a generic lead", () => {
  const genericLead = /^(?:presque|pas tout à fait|la (?:phrase|forme|structure) est proche|le choix est proche|ici, (?:regarde|il faut une autre forme|c’est .* qu’il faut revoir))/iu;

  for (const stageId of GRAMMAR_STAGE_IDS) {
    const attempts = GRAMMAR_STAGE_BY_ID[stageId].mode === "review" ? 9 : 5;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      for (const question of buildGrammarPracticeQuestions(stageId, attempt, () => 0.42)) {
        const wrongAnswers = Array.isArray(question.answer)
          ? [[...question.answer].reverse()]
          : question.options.filter((option) => option !== question.answer);

        for (const wrongAnswer of wrongAnswers) {
          const feedback = getGrammarIncorrectFeedback(question, wrongAnswer);
          assert.ok(feedback.trim().length > 0, question.id);
          assert.doesNotMatch(feedback, genericLead, `${question.id}: ${feedback}`);
          assert.ok(feedback.length <= 260, `${question.id}: feedback too long (${feedback.length})`);
        }
      }
    }
  }
});

test("stage 01 explains each selected distractor and all word-order permutations", () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    // A shuffle with Math.random near 1 would otherwise leave the first
    // word-order exercise already solved.
    const questions = buildGrammarPracticeQuestions("sentence-structure", attempt, () => 0.999);
    assert.equal(questions.length, 5);

    for (const question of questions) {
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display ?? "", /«\s*«/u, question.id);

      if (Array.isArray(question.answer)) {
        assert.notDeepEqual(question.options, question.answer, question.id);
        const [a, b, c] = question.answer;
        const permutations = [
          [a, b, c],
          [a, c, b],
          [b, a, c],
          [b, c, a],
          [c, a, b],
          [c, b, a],
        ].filter((sequence) =>
          sequence.some((part, index) => part !== question.answer[index])
        );
        assert.equal(permutations.length, 5);
        const feedbacks = permutations.map((sequence) =>
          getGrammarIncorrectFeedback(question, sequence)
        );
        assert.equal(new Set(feedbacks).size, 5, question.id);
        for (const feedback of feedbacks) {
          assert.match(feedback, /verbe|thème|objet|ordre neutre/u, question.id);
          assert.notEqual(feedback, question.explanation, question.id);
          assert.ok(feedback.length <= 260, question.id);
        }
      } else {
        const distractors = question.options.filter(
          (option) => option !== question.answer
        );
        assert.equal(distractors.length, 3, question.id);
        const feedbacks = distractors.map((option) =>
          getGrammarIncorrectFeedback(question, option)
        );
        assert.equal(new Set(feedbacks).size, 3, question.id);
        for (const [index, feedback] of feedbacks.entries()) {
          assert.ok(feedback.includes(distractors[index]), question.id);
          assert.notEqual(feedback, question.explanation, question.id);
          assert.ok(feedback.length <= 260, question.id);
        }
      }
    }
    const subjectOmission = questions.find(({ ruleAspect }) =>
      ruleAspect === "subject-omission"
    );
    assert.ok(subjectOmission);
    assert.match(subjectOmission.display, /Où allez-vous/u);
    assert.match(
      getGrammarIncorrectFeedback(subjectOmission, "저는 학교에 가요."),
      /grammaticale.*sujet répété/u,
    );
  }
});

test("stage 01 exercise UI keeps concise directions and feedback tied to the choice", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const display = readFileSync(join(projectRoot, "components/grammar/QuestionDisplay.tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /styles\.questionCardStageOne/u);
  assert.match(screen, /compactFrench=\{[\s\S]*question\.stageId === "sentence-structure" \|\|[\s\S]*question\.stageId === "identify-with-copula"[\s\S]*\}/u);
  assert.match(screen, /stripTokenPunctuation=\{question\.stageId === "sentence-structure"\}/u);
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(display, /compactFrench \? "sectionTitle" : "featureTitle"/u);
  assert.match(exercises, /shuffleDrillOrderTokens\(stageId, drill\.answer, random\)/u);
});

test("stage 02 explains every copula distractor using the selected suffix and noun", () => {
  const expectedSentences = new Map([
    ["student-batchim", "학생이에요"],
    ["doctor-vowel", "의사예요"],
    ["book-batchim", "책이에요"],
    ["friend-vowel", "친구예요"],
    ["name-batchim", "이름은 수진이에요"],
  ]);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("identify-with-copula", attempt, () => 0.42);
    assert.equal(questions.length, 5);
    for (const question of questions) {
      assert.equal(question.kind, "gap");
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.ok(question.options.includes(question.answer), question.id);

      const drill = [...expectedSentences.keys()].find((id) =>
        question.id.includes("drill-copula-ieyo-yeyo-" + id + "-")
      );
      assert.ok(drill, question.id);

      const distractors = question.options.filter((option) => option !== question.answer);
      assert.equal(distractors.length, 3, question.id);
      const responses = distractors.map((choice) => {
        const feedback = getGrammarIncorrectFeedback(question, choice);
        assert.ok(feedback.includes("Tu as choisi « " + choice + " »"), question.id);
        assert.ok(feedback.includes(expectedSentences.get(drill)), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        return feedback;
      });
      assert.equal(new Set(responses).size, 3, question.id);
    }
  }

  const questions = buildGrammarPracticeQuestions("identify-with-copula", 1, () => 0.42);
  const byDrill = (name) => questions.find(({ id }) => id.includes(name));
  assert.match(getGrammarIncorrectFeedback(byDrill("student-batchim"), "입니다"), /grammatical.*formel/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("doctor-vowel"), "이에요"), /voyelle.*의사예요/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("book-batchim"), "아니에요"), /책이 아니에요.*책이에요/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("friend-vowel"), "아니에요"), /친구가 아니에요.*친구예요/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("name-batchim"), "입니다"), /grammatical.*formel/u);
});

test("stage 02 exercise visuals and good-answer messages are stage-specific", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "identify-with-copula" && styles\.questionCardStageTwo/u);
  assert.match(screen, /question\.stageId === "identify-with-copula"/u);
  assert.match(screen, /student-batchim/u);
  assert.match(screen, /name-batchim/u);
  assert.match(exercises, /stageId === "identify-with-copula"/u);
});

test("stage 03 analyzes all selected register and tense distractors", () => {
  const expected = new Map([
    ["good-daily", { answer: "좋아요", errors: ["좋습니다", "좋아", "좋았어요"] }],
    ["fine-daily", { answer: "괜찮아요", errors: ["괜찮습니다", "괜찮아", "괜찮았어요"] }],
    ["eat-daily", { answer: "먹어요", errors: ["먹습니다", "먹어", "먹었어요"] }],
    ["go-daily", { answer: "가요", errors: ["갑니다", "가", "갔어요"] }],
    ["daily-vs-formal", {
      answer: "학생이에요.", errors: ["학생입니다.", "학생이야.", "학생이었어요."],
    }],
  ]);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("polite-register", attempt, () => 0.42);
    assert.equal(questions.length, 5);
    for (const question of questions) {
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display ?? "", /«\s*«/u, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      const drillId = [...expected.keys()].find((id) =>
        question.id.includes(":drill-polite-style-yo-" + id + "-")
      );
      assert.ok(drillId, question.id);
      const spec = expected.get(drillId);
      assert.equal(question.answer, spec.answer, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.errors]),
        question.id,
      );
      const messages = spec.errors.map((choice) => {
        const message = getGrammarIncorrectFeedback(question, choice);
        assert.ok(message.includes("Tu as choisi « " + choice + " »"), question.id);
        assert.ok(message.includes(spec.answer.replace(/\.$/u, "")), question.id);
        assert.notEqual(message, question.explanation, question.id);
        assert.ok(message.length <= 260, question.id);
        return message;
      });
      assert.equal(new Set(messages).size, 3, question.id);
      assert.match(messages[0], /registre formel/u, question.id);
      assert.match(messages[1], /registre familier/u, question.id);
      assert.match(messages[2], /passé/u, question.id);
      if (drillId === "daily-vs-formal") {
        assert.equal(question.kind, "scene");
        assert.match(question.display, /PHRASE À EXPRIMER\n/u);
        assert.match(question.display, /Je suis étudiant/u);
      } else {
        assert.equal(question.kind, "transformation");
        assert.match(question.display, /FORME À TRANSFORMER\n/u);
        assert.match(question.prompt, /présent poli courant/u);
      }
    }
  }
});

test("stage 03 keeps responsive layout and correct-answer feedback specific", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "polite-register" && styles\.questionCardStageThree/u);
  assert.match(screen, /question\.id\.includes\("good-daily"\)/u);
  assert.match(screen, /question\.id\.includes\("daily-vs-formal"\)/u);
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(exercises, /stageId === "polite-register"/u);
  assert.match(exercises, /"PHRASE À EXPRIMER"/u);
});

test("stage 04 explains all topic-particle choices using the actual context", () => {
  const cases = new Map([
    ["je-vowel", {
      answer: "는", sentence: "저는 학생이에요",
      choices: ["은", "를", "가"],
    }],
    ["today-batchim", {
      answer: "은", sentence: "오늘은 쉬어요",
      choices: ["는", "을", "이"],
    }],
    ["coffee-vowel", {
      answer: "는", sentence: "커피는 안 마셔요",
      choices: ["은", "를", "가"],
    }],
    ["book-batchim", {
      answer: "은", sentence: "책은 여기 있어요",
      choices: ["는", "을", "이"],
    }],
    ["friend-vowel", {
      answer: "는", sentence: "친구는 한국 사람이에요",
      choices: ["은", "를", "가"],
    }],
  ]);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("introduce-topic", attempt, () => 0.42);
    assert.equal(questions.length, 5);
    for (const question of questions) {
      const key = [...cases.keys()].find((name) =>
        question.id.includes(":drill-topic-eun-neun-" + name + "-")
      );
      assert.ok(key, question.id);
      const spec = cases.get(key);

      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.choices]),
        question.id,
      );
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);

      const feedbacks = spec.choices.map((selected) => {
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        return feedback;
      });
      assert.equal(new Set(feedbacks).size, 3, question.id);
    }
  }

  const questions = buildGrammarPracticeQuestions("introduce-topic", 1, () => 0.42);
  const drill = (name) => questions.find(({ id }) =>
    id.includes(":drill-topic-eun-neun-" + name + "-")
  );
  assert.match(getGrammarIncorrectFeedback(drill("je-vowel"), "가"), /저.*제가.*thème/u);
  assert.match(getGrammarIncorrectFeedback(drill("today-batchim"), "이"), /sujet.*jour lui-même/u);
  assert.match(getGrammarIncorrectFeedback(drill("coffee-vowel"), "를"), /particule d’objet.*phrase correcte.*contraste demandé/u);
  assert.match(getGrammarIncorrectFeedback(drill("book-batchim"), "이"), /grammatical.*thème/u);
  assert.match(getGrammarIncorrectFeedback(drill("friend-vowel"), "가"), /grammatical.*thème/u);
});

test("stage 04 retains concise responsive layout and its targeted feedback labels", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");

  assert.match(screen, /question\.stageId === "introduce-topic" && styles\.questionCardStageFour/u);
  assert.match(screen, /if \(question\.stageId === "introduce-topic"\)/u);
  assert.match(screen, /question\.id\.includes\("coffee-vowel"\)/u);
  assert.match(screen, /question\.id\.includes\("friend-vowel"\)/u);
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(exercises, /stageId === "introduce-topic"/u);
});

test("stage 05 explains all demonstrative distractors without confusing objects and places", () => {
  const cases = new Map([
    ["this-bag", {
      answer: "이", sentence: "이 가방이에요",
      choices: ["그", "저", "거기"], kind: "gap",
    }],
    ["that-shoes", {
      answer: "그", sentence: "그 신발이에요",
      choices: ["이", "저", "거기"], kind: "gap",
    }],
    ["far-building", {
      answer: "저", sentence: "저 건물이에요",
      choices: ["이", "그", "저기"], kind: "gap",
    }],
    ["this-object-pronoun", {
      answer: "이거", sentence: "이거 뭐예요?",
      choices: ["그거", "저거", "거기"], kind: "scene",
    }],
    ["far-object-pronoun", {
      answer: "저거", sentence: "저거 뭐예요?",
      choices: ["이거", "그거", "저기"], kind: "scene",
    }],
  ]);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("demonstratives", attempt, () => 0.42);
    assert.equal(questions.length, 5);
    for (const question of questions) {
      const id = [...cases.keys()].find((key) =>
        question.id.includes(":drill-demonstratives-i-geu-jeo-" + key + "-")
      );
      assert.ok(id, question.id);
      const item = cases.get(id);
      assert.equal(question.kind, item.kind, question.id);
      assert.equal(question.answer, item.answer, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([item.answer, ...item.choices]),
        question.id,
      );
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(
        question.display,
        item.kind === "scene" ? /QUESTION À COMPLÉTER\n/u : /PHRASE À COMPLÉTER\n/u,
        question.id,
      );
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);

      const messages = item.choices.map((selected) => {
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(item.sentence), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        return feedback;
      });
      assert.equal(new Set(messages).size, 3, question.id);

      // Le mélange change la position des réponses, pas les choix ni leur sens.
      const variantA = buildGrammarPracticeQuestions("demonstratives", attempt, () => 0);
      const variantB = buildGrammarPracticeQuestions("demonstratives", attempt, () => 0.99);
      const optionA = variantA.find(({ id: questionId }) => questionId === question.id);
      const optionB = variantB.find(({ id: questionId }) => questionId === question.id);
      assert.ok(optionA && optionB, question.id);
      assert.notDeepEqual(optionA.options, optionB.options, question.id);
      assert.deepEqual(new Set(optionA.options), new Set(optionB.options), question.id);
    }
  }

  const questions = buildGrammarPracticeQuestions("demonstratives", 1, () => 0.42);
  const drill = (name) => questions.find(({ id }) =>
    id.includes(":drill-demonstratives-i-geu-jeo-" + name + "-")
  );

  assert.match(getGrammarIncorrectFeedback(drill("this-bag"), "그"), /déjà mentionné.*dans ta main/u);
  assert.match(getGrammarIncorrectFeedback(drill("that-shoes"), "이"), /près de toi.*vendeuse/u);
  assert.match(getGrammarIncorrectFeedback(drill("far-building"), "저기"), /lieu.*déterminant/u);
  assert.match(getGrammarIncorrectFeedback(drill("this-object-pronoun"), "거기"), /lieu.*objet dans ta main/u);
  assert.match(getGrammarIncorrectFeedback(drill("far-object-pronoun"), "저기"), /naturel.*objet précis/u);
});

test("stage 05 uses responsive question cards and contextual success messages", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "demonstratives" && styles\.questionCardStageFive/u);
  assert.match(screen, /if \(question\.stageId === "demonstratives"\)/u);
  assert.match(screen, /question\.id\.includes\("this-bag"\)/u);
  assert.match(screen, /question\.id\.includes\("far-object-pronoun"\)/u);
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(exercises, /stageId === "demonstratives"/u);
  assert.match(exercises, /"QUESTION À COMPLÉTER"/u);
});

test("stage 06 distinguishes all chosen interrogatives and keeps the intended nuance", () => {
  const expected = new Map([
    ["what-object", {
      answer: "뭐", sentence: "이거 뭐예요?",
      choices: ["누구", "몇", "어디"],
    }],
    ["who-person", {
      answer: "누구", sentence: "저 사람은 누구예요?",
      choices: ["뭐", "몇", "어디"],
    }],
    ["how-many-people", {
      answer: "몇", sentence: "몇 명이에요?",
      choices: ["뭐", "누구", "얼마"],
    }],
    ["how-many-tickets", {
      answer: "몇", sentence: "표 몇 장이에요?",
      choices: ["뭐", "누구", "얼마"],
    }],
    ["what-food", {
      answer: "뭐", sentence: "뭐 먹어요?",
      choices: ["누구", "몇", "어디"],
    }],
  ]);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("nominal-questions", attempt, () => 0.42);
    assert.equal(questions.length, 5);

    const shuffledA = buildGrammarPracticeQuestions("nominal-questions", attempt, () => 0);
    const shuffledB = buildGrammarPracticeQuestions("nominal-questions", attempt, () => 0.99);
    let mixedOrderCount = 0;

    for (const question of questions) {
      const drillId = [...expected.keys()].find((name) =>
        question.id.includes(":drill-question-mwo-nugu-myeot-" + name + "-")
      );
      assert.ok(drillId, question.id);
      const spec = expected.get(drillId);

      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.deepEqual(new Set(question.options), new Set([spec.answer, ...spec.choices]), question.id);
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);

      const messages = spec.choices.map((selected) => {
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        return feedback;
      });
      assert.equal(new Set(messages).size, 3, question.id);

      const optionA = shuffledA.find(({ id }) => id === question.id);
      const optionB = shuffledB.find(({ id }) => id === question.id);
      assert.ok(optionA && optionB, question.id);
      assert.deepEqual(new Set(optionA.options), new Set(optionB.options), question.id);
      if (optionA.options.join("|") !== optionB.options.join("|")) mixedOrderCount += 1;
    }
    assert.ok(mixedOrderCount > 0, "some choice orders should differ after shuffling");
  }

  const questions = buildGrammarPracticeQuestions("nominal-questions", 1, () => 0.42);
  const byDrill = (key) => questions.find(({ id }) =>
    id.includes(":drill-question-mwo-nugu-myeot-" + key + "-")
  );
  assert.match(getGrammarIncorrectFeedback(byDrill("what-object"), "누구"), /photo.*objet inconnu/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("who-person"), "몇"), /nombre.*âge.*identif/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("how-many-people"), "얼마"), /prix.*얼마 명.*몇 명이에요/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("how-many-tickets"), "얼마"), /prix.*표 얼마예요.*nombre/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("what-food"), "누구"), /누가 먹어요.*aliment/u);
  assert.match(getGrammarIncorrectFeedback(byDrill("what-food"), "어디"), /어디에서 먹어요.*ce qu’il mange/u);
  assert.match(byDrill("how-many-people").display, /sortie avec une connaissance/u);
});

test("stage 06 uses compact display and answer-specific success and failure messages", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");

  assert.match(screen, /question\.stageId === "nominal-questions" && styles\.questionCardStageSix/u);
  assert.match(screen, /if \(question\.stageId === "nominal-questions"\)/u);
  assert.match(screen, /question\.id\.includes\("what-object"\)/u);
  assert.match(screen, /question\.id\.includes\("how-many-people"\)/u);
  assert.match(screen, /question\.id\.includes\("what-food"\)/u);
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(exercises, /stageId === "nominal-questions"/u);
});

test("stage 07 covers both subject particles and existence with selected-answer feedback", () => {
  const cases = new Map([
    ["subject-i-ga:rain-vowel", {
      answer: "가", sentence: "비가 와요", choices: ["이", "는", "를"], kind: "gap",
    }],
    ["subject-i-ga:time-batchim", {
      answer: "이", sentence: "시간이 없어요", choices: ["가", "은", "을"], kind: "gap",
    }],
    ["subject-i-ga:bus-vowel", {
      answer: "가", sentence: "버스가 와요", choices: ["이", "는", "를"], kind: "gap",
    }],
    ["subject-i-ga:book-batchim", {
      answer: "이", sentence: "책이 있어요", choices: ["가", "은", "을"], kind: "gap",
    }],
    ["subject-i-ga:friend-vowel", {
      answer: "가", sentence: "친구가 한국어를 공부해요", choices: ["이", "는", "를"], kind: "gap",
    }],
    ["existence-isseoyo-eopseoyo:menu-available", {
      answer: "있어요", sentence: "채식 메뉴가 있어요?",
      choices: ["없어요", "아니에요", "해요"], kind: "scene",
    }],
    ["existence-isseoyo-eopseoyo:menu-unavailable", {
      answer: "없어요", sentence: "채식 메뉴가 없어요",
      choices: ["있어요", "아니에요", "안 해요"], kind: "scene",
    }],
    ["existence-isseoyo-eopseoyo:time-have", {
      answer: "있어요", sentence: "시간이 있어요",
      choices: ["없어요", "아니에요", "해요"], kind: "scene",
    }],
    ["existence-isseoyo-eopseoyo:time-none", {
      answer: "없어요", sentence: "시간이 없어요",
      choices: ["있어요", "아니에요", "안 해요"], kind: "scene",
    }],
    ["existence-isseoyo-eopseoyo:identity-vs-existence", {
      answer: "가 아니에요", sentence: "이건 커피가 아니에요",
      choices: ["가 없어요", "가 있어요", "를 안 해요"], kind: "scene",
    }],
  ]);

  const seen = new Set();
  const checked = new Set();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("existence", attempt, () => 0.42);
    assert.equal(questions.length, 5);
    assert.ok(questions.some(({ conceptIds }) => conceptIds.includes("subject-i-ga")));
    assert.ok(questions.some(({ conceptIds }) => conceptIds.includes("existence-isseoyo-eopseoyo")));

    const shuffledA = buildGrammarPracticeQuestions("existence", attempt, () => 0);
    const shuffledB = buildGrammarPracticeQuestions("existence", attempt, () => 0.99);
    let variations = 0;

    for (const question of questions) {
      const key = [...cases.keys()].find((candidate) =>
        question.id.includes(":drill-" + candidate.replace(":", "-") + "-")
      );
      assert.ok(key, question.id);
      seen.add(key);
      const spec = cases.get(key);
      assert.equal(question.kind, spec.kind, question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.choices]),
        question.id,
      );
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(
        question.display,
        spec.kind === "gap"
          ? /PHRASE À COMPLÉTER\n/u
          : question.display.includes("? »")
            ? /QUESTION À COMPLÉTER\n/u
            : /PHRASE À COMPLÉTER\n/u,
        question.id,
      );
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);

      const feedbacks = spec.choices.map((selected) => {
        checked.add(key + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        return feedback;
      });
      assert.equal(new Set(feedbacks).size, 3, question.id);

      const optionA = shuffledA.find(({ id }) => id === question.id);
      const optionB = shuffledB.find(({ id }) => id === question.id);
      assert.ok(optionA && optionB, question.id);
      assert.deepEqual(new Set(optionA.options), new Set(optionB.options), question.id);
      if (optionA.options.join("|") !== optionB.options.join("|")) variations += 1;
    }
    assert.ok(variations > 0, "options should change order between random sources");
  }
  assert.equal(seen.size, 10, "both concepts must cover all ten drills across attempts");
  assert.equal(checked.size, 30, "each of the thirty wrong choices must be explained");

  const questions = Array.from({ length: 5 }, (_, i) =>
    buildGrammarPracticeQuestions("existence", i + 1, () => 0.42)
  ).flat();
  const drill = (name) => questions.find(({ id }) => id.includes(name));
  assert.match(getGrammarIncorrectFeedback(drill("rain-vowel"), "는"), /grammatical.*contraste/u);
  assert.match(getGrammarIncorrectFeedback(drill("book-batchim"), "은"), /grammatical.*livre nouveau/u);
  assert.match(getGrammarIncorrectFeedback(drill("menu-available"), "없어요"), /question possible.*disponible/u);
  assert.match(getGrammarIncorrectFeedback(drill("menu-unavailable"), "아니에요"), /identité.*existence/u);
  assert.match(getGrammarIncorrectFeedback(drill("identity-vs-existence"), "가 있어요"), /présence de café.*identité/u);
});

test("stage 07 presents concise question cards and targeted success messages", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "existence" && styles\.questionCardStageSeven/u);
  assert.match(screen, /if \(question\.stageId === "existence"\)/u);
  assert.match(screen, /question\.id\.includes\("rain-vowel"\)/u);
  assert.match(screen, /question\.id\.includes\("menu-unavailable"\)/u);
  assert.match(screen, /question\.id\.includes\("identity-vs-existence"\)/u);
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(exercises, /stageId === "existence"/u);
  assert.match(exercises, /drill\.stimulus\.trim\(\)\.endsWith\("\?"\)/u);
});

test("stage 08 checks all static-location distractors and their specific explanations", () => {
  const expected = new Map([
    ["cafe-existence", {
      answer: "에", sentence: "친구가 카페에 있어요",
      choices: ["에서", "로", "를"],
    }],
    ["school-existence", {
      answer: "에", sentence: "선생님이 학교에 있어요",
      choices: ["에서", "로", "가"],
    }],
    ["bag-existence", {
      answer: "에", sentence: "카드가 가방에 있어요",
      choices: ["에서", "으로", "를"],
    }],
    ["floor-existence", {
      answer: "에", sentence: "화장실은 2층에 있어요",
      choices: ["에서", "으로", "을"],
    }],
    ["home-existence", {
      answer: "에", sentence: "민수는 집에 있어요",
      choices: ["에서", "으로", "를"],
    }],
  ]);

  const checked = new Set();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("locate-thing", attempt, () => 0.42);
    assert.equal(questions.length, 5);
    const firstOrder = buildGrammarPracticeQuestions("locate-thing", attempt, () => 0);
    const secondOrder = buildGrammarPracticeQuestions("locate-thing", attempt, () => 0.99);
    let shuffledCount = 0;

    for (const question of questions) {
      const drillId = [...expected.keys()].find((id) =>
        question.id.includes(":drill-location-e-" + id + "-")
      );
      assert.ok(drillId, question.id);
      const spec = expected.get(drillId);

      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.choices]),
        question.id,
      );
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);
      assert.match(question.display, /있어요/u, question.id);

      const messages = spec.choices.map((selected) => {
        checked.add(drillId + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        return feedback;
      });
      assert.equal(new Set(messages).size, 3, question.id);

      const a = firstOrder.find(({ id }) => id === question.id);
      const b = secondOrder.find(({ id }) => id === question.id);
      assert.ok(a && b, question.id);
      assert.deepEqual(new Set(a.options), new Set(b.options), question.id);
      if (a.options.join("|") !== b.options.join("|")) shuffledCount += 1;
    }
    assert.ok(shuffledCount > 0, "choice order should depend on random source");
  }
  assert.equal(checked.size, 15, "all 15 choices should have distinct target feedback");

  const questions = buildGrammarPracticeQuestions("locate-thing", 1, () => 0.42);
  const drill = (name) => questions.find(({ id }) =>
    id.includes(":drill-location-e-" + name + "-")
  );
  assert.match(getGrammarIncorrectFeedback(drill("cafe-existence"), "에서"), /action.*statique/u);
  assert.match(getGrammarIncorrectFeedback(drill("school-existence"), "가"), /sujet.*lieu/u);
  assert.match(getGrammarIncorrectFeedback(drill("bag-existence"), "으로"), /direction.*déjà/u);
  assert.match(getGrammarIncorrectFeedback(drill("floor-existence"), "으로"), /vers.*emplacement/u);
  assert.match(getGrammarIncorrectFeedback(drill("home-existence"), "에서"), /action.*où se trouve/u);
});

test("stage 08 keeps compact lesson display and custom successful-answer feedback", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");

  assert.match(screen, /question\.stageId === "locate-thing" && styles\.questionCardStageEight/u);
  assert.match(screen, /if \(question\.stageId === "locate-thing"\)/u);
  assert.match(screen, /question\.id\.includes\("cafe-existence"\)/u);
  assert.match(screen, /question\.id\.includes\("home-existence"\)/u);
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(exercises, /stageId === "locate-thing"/u);
});

test("stage 09 explains each chosen present-tense distractor and preserves shuffled options", () => {
  const cases = new Map([
    ["eat-present", {
      answer: "먹어요", choices: ["먹아요", "먹었어요", "먹을 거예요"], base: "먹다",
    }],
    ["go-present", {
      answer: "가요", choices: ["가어요", "갔어요", "갈 거예요"], base: "가다",
    }],
    ["drink-present", {
      answer: "마셔요", choices: ["마시요", "마셨어요", "마실 거예요"], base: "마시다",
    }],
    ["study-present", {
      answer: "공부해요", choices: ["공부하요", "공부했어요", "공부할 거예요"], base: "공부하다",
    }],
    ["read-present", {
      answer: "읽어요", choices: ["읽아요", "읽었어요", "읽을 거예요"], base: "읽다",
    }],
  ]);

  const feedbackChecked = new Set();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("present-actions", attempt, () => 0.42);
    const shuffledA = buildGrammarPracticeQuestions("present-actions", attempt, () => 0);
    const shuffledB = buildGrammarPracticeQuestions("present-actions", attempt, () => 0.99);
    assert.equal(questions.length, 5);
    let differentOrders = 0;

    for (const question of questions) {
      const key = [...cases.keys()].find((id) =>
        question.id.includes(":drill-present-a-eoyo-" + id + "-")
      );
      assert.ok(key, question.id);
      const spec = cases.get(key);
      assert.equal(question.kind, "transformation", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.deepEqual(new Set(question.options), new Set([spec.answer, ...spec.choices]), question.id);
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /FORME À TRANSFORMER\n/u, question.id);
      assert.ok(question.display.includes(spec.base + " → ?"), question.id);
      assert.match(question.prompt, /présent poli courant/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);

      const messages = spec.choices.map((selected, index) => {
        feedbackChecked.add(key + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.answer), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        assert.match(feedback, index === 1 ? /passé/u : index === 2 ? /futur/u : /forme|radical|conjugaison|contract|terminaison/u, question.id);
        return feedback;
      });
      assert.equal(new Set(messages).size, 3, question.id);

      const a = shuffledA.find(({ id }) => id === question.id);
      const b = shuffledB.find(({ id }) => id === question.id);
      assert.ok(a && b, question.id);
      assert.deepEqual(new Set(a.options), new Set(b.options), question.id);
      if (a.options.join("|") !== b.options.join("|")) differentOrders += 1;
    }
    assert.ok(differentOrders > 0, "the option order should vary with the random source");
  }
  assert.equal(feedbackChecked.size, 15);

  const questions = buildGrammarPracticeQuestions("present-actions", 1, () => 0.42);
  const find = (id) => questions.find(({ id: questionId }) =>
    questionId.includes(":drill-present-a-eoyo-" + id + "-")
  );
  assert.match(getGrammarIncorrectFeedback(find("eat-present"), "먹아요"), /ㅓ.*-어요/u);
  assert.match(getGrammarIncorrectFeedback(find("go-present"), "가어요"), /ㅏ.*-아요.*가요/u);
  assert.match(getGrammarIncorrectFeedback(find("drink-present"), "마시요"), /ㅣ \+ ㅓ.*ㅕ/u);
  assert.match(getGrammarIncorrectFeedback(find("study-present"), "공부하요"), /하다.*해요/u);
  assert.match(getGrammarIncorrectFeedback(find("read-present"), "읽아요"), /ㅣ.*받침/u);
  assert.match(find("study-present").display, /tous les jours/u);
  assert.match(find("drink-present").display, /habituellement/u);
});

test("stage 09 retains compact question cards and success messages for all five verbs", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "present-actions" && styles\.questionCardStageNine/u);
  assert.match(screen, /if \(question\.stageId === "present-actions"\)/u);
  for (const id of ["eat-present", "go-present", "drink-present", "study-present", "read-present"]) {
    assert.ok(screen.includes('question.id.includes("' + id + '")'), id);
  }
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(exercises, /stageId === "present-actions"/u);
});

test("stage 10 distinguishes all object particles and explains the selected distractor", () => {
  const cases = new Map([
    ["book-batchim", {
      answer: "을", sentence: "책을 읽어요", choices: ["를", "은", "이"],
    }],
    ["coffee-vowel", {
      answer: "를", sentence: "커피를 마셔요", choices: ["을", "는", "가"],
    }],
    ["meal-batchim", {
      answer: "을", sentence: "밥을 먹어요", choices: ["를", "은", "이"],
    }],
    ["korean-vowel", {
      answer: "를", sentence: "한국어를 공부해요", choices: ["을", "는", "가"],
    }],
    ["film-vowel", {
      answer: "를", sentence: "영화를 봐요", choices: ["을", "는", "가"],
    }],
  ]);

  const covered = new Set();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("object-actions", attempt, () => 0.42);
    const shuffledA = buildGrammarPracticeQuestions("object-actions", attempt, () => 0);
    const shuffledB = buildGrammarPracticeQuestions("object-actions", attempt, () => 0.99);
    assert.equal(questions.length, 5);
    let mixedOrders = 0;

    for (const question of questions) {
      const drillId = [...cases.keys()].find((id) =>
        question.id.includes(":drill-object-eul-reul-" + id + "-")
      );
      assert.ok(drillId, question.id);
      const spec = cases.get(drillId);
      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.choices]),
        question.id,
      );
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);
      assert.match(question.prompt, /particule|objet/u, question.id);

      const feedbacks = spec.choices.map((selected) => {
        covered.add(drillId + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length <= 260, question.id);
        return feedback;
      });
      assert.equal(new Set(feedbacks).size, 3, question.id);

      const first = shuffledA.find(({ id }) => id === question.id);
      const second = shuffledB.find(({ id }) => id === question.id);
      assert.ok(first && second, question.id);
      assert.deepEqual(new Set(first.options), new Set(second.options), question.id);
      if (first.options.join("|") !== second.options.join("|")) mixedOrders += 1;
    }
    assert.ok(mixedOrders > 0, "some shuffled option orders should differ");
  }
  assert.equal(covered.size, 15, "every choice should have specific feedback");

  const questions = buildGrammarPracticeQuestions("object-actions", 1, () => 0.42);
  const drill = (id) => questions.find(({ id: questionId }) =>
    questionId.includes(":drill-object-eul-reul-" + id + "-")
  );
  assert.match(getGrammarIncorrectFeedback(drill("book-batchim"), "은"), /grammatical.*contraste/u);
  assert.match(getGrammarIncorrectFeedback(drill("coffee-vowel"), "을"), /voyelle.*을.*를/u);
  assert.match(getGrammarIncorrectFeedback(drill("meal-batchim"), "이"), /sujet.*repas.*objet/u);
  assert.match(getGrammarIncorrectFeedback(drill("korean-vowel"), "가"), /sujet.*langue.*objet/u);
  assert.match(getGrammarIncorrectFeedback(drill("film-vowel"), "는"), /thème.*contraste.*영화를 봐요/u);
});

test("stage 10 keeps compact exercise cards and tailored positive responses", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "object-actions" && styles\.questionCardStageTen/u);
  assert.match(screen, /if \(question\.stageId === "object-actions"\)/u);
  for (const id of ["book-batchim", "coffee-vowel", "meal-batchim", "korean-vowel", "film-vowel"]) {
    assert.ok(screen.includes('question.id.includes("' + id + '")'), id);
  }
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(screen, /POUR CET EXERCICE/u);
  assert.match(exercises, /stageId === "object-actions"/u);
});

test("stage 11 explains every chosen location distractor and distinguishes action from presence", () => {
  const cases = new Map([
    ["cafe-action", {
      answer: "에서", sentence: "카페에서 공부해요",
      choices: ["에", "로", "까지"], aspect: "action-location",
    }],
    ["school-static", {
      answer: "에", sentence: "학교에 있어요",
      choices: ["에서", "로", "까지"], aspect: "static-location",
    }],
    ["home-action", {
      answer: "에서", sentence: "집에서 밥을 먹어요",
      choices: ["에", "으로", "까지"], aspect: "action-location",
    }],
    ["library-static", {
      answer: "에", sentence: "도서관에 있어요",
      choices: ["에서", "으로", "까지"], aspect: "static-location",
    }],
    ["restaurant-action", {
      answer: "에서", sentence: "식당에서 친구를 만나요",
      choices: ["에", "으로", "까지"], aspect: "action-location",
    }],
  ]);

  const checked = new Set();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("action-location", attempt, () => 0.42);
    const shuffledA = buildGrammarPracticeQuestions("action-location", attempt, () => 0);
    const shuffledB = buildGrammarPracticeQuestions("action-location", attempt, () => 0.99);
    assert.equal(questions.length, 5);
    let differentOrders = 0;

    for (const question of questions) {
      const drillId = [...cases.keys()].find((key) =>
        question.id.includes(":drill-action-location-eseo-" + key + "-")
      );
      assert.ok(drillId, question.id);
      const spec = cases.get(drillId);
      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.equal(question.ruleAspect, spec.aspect, question.id);
      assert.deepEqual(new Set(question.options), new Set([spec.answer, ...spec.choices]), question.id);
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);
      assert.ok(question.contrastFamily?.id === "location-action-vs-state", question.id);

      const explanations = spec.choices.map((selected) => {
        checked.add(drillId + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.ok(feedback.length <= 260, question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        return feedback;
      });
      assert.equal(new Set(explanations).size, 3, question.id);

      const a = shuffledA.find(({ id }) => id === question.id);
      const b = shuffledB.find(({ id }) => id === question.id);
      assert.ok(a && b, question.id);
      assert.deepEqual(new Set(a.options), new Set(b.options), question.id);
      if (a.options.join("|") !== b.options.join("|")) differentOrders += 1;
    }
    assert.ok(differentOrders > 0, "choice positions should vary without changing the meanings");
  }
  assert.equal(checked.size, 15);

  const questions = buildGrammarPracticeQuestions("action-location", 1, () => 0.42);
  const drill = (name) => questions.find(({ id }) =>
    id.includes(":drill-action-location-eseo-" + name + "-")
  );
  assert.match(getGrammarIncorrectFeedback(drill("cafe-action"), "에"), /présence.*activité/u);
  assert.match(getGrammarIncorrectFeedback(drill("cafe-action"), "로"), /vers le café.*trajet/u);
  assert.match(getGrammarIncorrectFeedback(drill("school-static"), "에서"), /action.*position|action.*학교에 있어요/u);
  assert.match(getGrammarIncorrectFeedback(drill("home-action"), "으로"), /direction.*déjà/u);
  assert.match(getGrammarIncorrectFeedback(drill("library-static"), "에서"), /lecture.*livre se trouve/u);
  assert.match(getGrammarIncorrectFeedback(drill("restaurant-action"), "까지"), /limite.*rencontres/u);
  assert.ok(drill("cafe-action").options.includes("로"));
  assert.ok(drill("school-static").options.includes("로"));
  assert.equal(drill("cafe-action").options.includes("으로"), false);
  assert.equal(drill("school-static").options.includes("으로"), false);
});

test("stage 11 uses compact practice cards and situation-specific correct feedback", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");

  assert.match(screen, /question\.stageId === "action-location" && styles\.questionCardStageEleven/u);
  assert.match(screen, /if \(question\.stageId === "action-location"\)/u);
  for (const drillId of ["cafe-action", "school-static", "home-action", "library-static", "restaurant-action"]) {
    assert.ok(screen.includes('question.id.includes("' + drillId + '")'), drillId);
  }
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(screen, /POUR CET EXERCICE/u);
  assert.match(exercises, /stageId === "action-location"/u);
});

test("stage 12 gives individual feedback for each destination or time distractor", () => {
  const cases = new Map([
    ["seoul-destination", {
      answer: "에", sentence: "서울에 가요",
      choices: ["에서", "을", "부터"], aspect: "destination",
    }],
    ["school-destination", {
      answer: "에", sentence: "학교에 와요",
      choices: ["에서", "를", "까지"], aspect: "destination",
    }],
    ["two-time", {
      answer: "에", sentence: "두 시에 친구를 만나요",
      choices: ["에서", "부터", "를"], aspect: "time",
    }],
    ["monday-time", {
      answer: "에", sentence: "월요일에 출발해요",
      choices: ["에서", "부터", "를"], aspect: "time",
    }],
    ["morning-time", {
      answer: "에", sentence: "아침 여덟 시에 일어나요",
      choices: ["에서", "까지", "를"], aspect: "time",
    }],
  ]);
  const checked = new Set();

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("destination-and-time", attempt, () => 0.42);
    const shuffledA = buildGrammarPracticeQuestions("destination-and-time", attempt, () => 0);
    const shuffledB = buildGrammarPracticeQuestions("destination-and-time", attempt, () => 0.99);
    assert.equal(questions.length, 5);
    let orderVariations = 0;

    for (const question of questions) {
      const drillId = [...cases.keys()].find((key) =>
        question.id.includes(":drill-destination-time-e-" + key + "-")
      );
      assert.ok(drillId, question.id);
      const spec = cases.get(drillId);

      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.equal(question.ruleAspect, spec.aspect, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.choices]),
        question.id,
      );
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);

      const messages = spec.choices.map((selected) => {
        checked.add(drillId + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.ok(feedback.length <= 260, question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        return feedback;
      });
      assert.equal(new Set(messages).size, 3, question.id);

      const a = shuffledA.find(({ id }) => id === question.id);
      const b = shuffledB.find(({ id }) => id === question.id);
      assert.ok(a && b, question.id);
      assert.deepEqual(new Set(a.options), new Set(b.options), question.id);
      if (a.options.join("|") !== b.options.join("|")) orderVariations += 1;
    }
    assert.ok(orderVariations > 0, "choice positions should vary with the random source");
  }
  assert.equal(checked.size, 15, "all fifteen distractors must receive targeted feedback");

  const questions = buildGrammarPracticeQuestions("destination-and-time", 1, () => 0.42);
  const drill = (name) => questions.find(({ id }) =>
    id.includes(":drill-destination-time-e-" + name + "-")
  );
  assert.match(getGrammarIncorrectFeedback(drill("seoul-destination"), "에서"), /phrase grammaticale.*point de départ.*destination/u);
  assert.match(getGrammarIncorrectFeedback(drill("school-destination"), "까지"), /grammatical.*limite.*destination/u);
  assert.match(getGrammarIncorrectFeedback(drill("two-time"), "부터"), /début d’une période.*précisément/u);
  assert.match(getGrammarIncorrectFeedback(drill("monday-time"), "부터"), /début d’une période.*jour précis/u);
  assert.match(getGrammarIncorrectFeedback(drill("morning-time"), "까지"), /au plus tard.*exactement/u);
  assert.match(drill("seoul-destination").display, /point de départ n’est pas indiqué/u);
  assert.match(drill("morning-time").display, /exactement à huit heures/u);
});

test("stage 12 has compact presentation and five contextual correct-answer messages", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");

  assert.match(screen, /question\.stageId === "destination-and-time" && styles\.questionCardStageTwelve/u);
  assert.match(screen, /if \(question\.stageId === "destination-and-time"\)/u);
  for (const id of ["seoul-destination", "school-destination", "two-time", "monday-time", "morning-time"]) {
    assert.ok(screen.includes('question.id.includes("' + id + '")'), id);
  }
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(screen, /POUR CET EXERCICE/u);
  assert.match(exercises, /stageId === "destination-and-time"/u);
});

test("stage 13 explains all selected possessive distractors across five attempts", () => {
  const cases = new Map([
    ["my-ticket-employee", {
      answer: "제", sentence: "이건 제 표예요",
      choices: ["내", "저", "제가"], aspect: "polite-my",
    }],
    ["my-name-professor", {
      answer: "제", sentence: "제 이름은 마크예요",
      choices: ["내", "저", "제가"], aspect: "polite-my",
    }],
    ["my-passport-agent", {
      answer: "제", sentence: "제 여권이에요",
      choices: ["내", "저", "제가"], aspect: "polite-my",
    }],
    ["my-bag-close-friend", {
      answer: "내", sentence: "이건 내 가방이야",
      choices: ["제", "나", "제가"], aspect: "casual-my",
    }],
    ["friends-bag", {
      answer: "의", sentence: "친구의 가방이에요",
      choices: ["제", "내", "가"], aspect: "possession-ui",
    }],
  ]);
  const covered = new Set();

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("possession", attempt, () => 0.42);
    const orderA = buildGrammarPracticeQuestions("possession", attempt, () => 0);
    const orderB = buildGrammarPracticeQuestions("possession", attempt, () => 0.99);
    assert.equal(questions.length, 5);
    let changedOrders = 0;

    for (const question of questions) {
      const drillId = [...cases.keys()].find((key) =>
        question.id.includes(":drill-possession-ui-je-nae-" + key + "-")
      );
      assert.ok(drillId, question.id);
      const spec = cases.get(drillId);
      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.equal(question.ruleAspect, spec.aspect, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.choices]),
        question.id,
      );
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);

      const messages = spec.choices.map((selected) => {
        covered.add(drillId + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.ok(feedback.length <= 260, question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        return feedback;
      });
      assert.equal(new Set(messages).size, 3, question.id);

      const first = orderA.find(({ id }) => id === question.id);
      const second = orderB.find(({ id }) => id === question.id);
      assert.ok(first && second, question.id);
      assert.deepEqual(new Set(first.options), new Set(second.options), question.id);
      if (first.options.join("|") !== second.options.join("|")) changedOrders += 1;
    }
    assert.ok(changedOrders > 0, "option shuffling must preserve the choices but vary their order");
  }
  assert.equal(covered.size, 15, "every one of the fifteen distractors has targeted feedback");

  const questions = buildGrammarPracticeQuestions("possession", 1, () => 0.42);
  const drill = (name) => questions.find(({ id }) =>
    id.includes(":drill-possession-ui-je-nae-" + name + "-")
  );
  assert.match(getGrammarIncorrectFeedback(drill("my-ticket-employee"), "저"), /ce billet là-bas.*mon billet/u);
  assert.match(getGrammarIncorrectFeedback(drill("my-name-professor"), "내"), /grammatical.*familier.*제 이름은 마크예요/u);
  assert.match(getGrammarIncorrectFeedback(drill("my-passport-agent"), "제가"), /sujet.*possessif/u);
  assert.match(getGrammarIncorrectFeedback(drill("my-bag-close-friend"), "제"), /grammaticalement correct.*style familier/u);
  assert.match(getGrammarIncorrectFeedback(drill("friends-bag"), "가"), /sujet.*ami est un sac.*친구의 가방이에요/u);
  assert.match(drill("friends-bag").display, /particule possessive 의/u);
});

test("stage 13 has compact exercise display and five individual success messages", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "possession" && styles\.questionCardStageThirteen/u);
  assert.match(screen, /if \(question\.stageId === "possession"\)/u);
  for (const id of [
    "my-ticket-employee", "my-name-professor", "my-passport-agent",
    "my-bag-close-friend", "friends-bag",
  ]) {
    assert.ok(screen.includes('question.id.includes("' + id + '")'), id);
  }
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(screen, /POUR CET EXERCICE/u);
  assert.match(exercises, /stageId === "possession"/u);
});

test("stage 14 explains all selected interrogatives across five attempts", () => {
  const cases = new Map([
    ["where-toilet", {
      answer: "어디", sentence: "화장실이 어디예요?",
      choices: ["언제", "왜", "어떻게"], aspect: "where",
    }],
    ["when-train", {
      answer: "언제", sentence: "기차가 언제 와요?",
      choices: ["어디", "왜", "어떻게"], aspect: "when",
    }],
    ["why-taxi", {
      answer: "왜", sentence: "왜 택시를 타요?",
      choices: ["어디", "언제", "어떻게"], aspect: "why",
    }],
    ["how-go", {
      answer: "어떻게", sentence: "서울에 어떻게 가요?",
      choices: ["어디", "언제", "왜"], aspect: "how",
    }],
    ["how-much-item", {
      answer: "얼마", sentence: "이거 얼마예요?",
      choices: ["어디", "언제", "무슨"], aspect: "how-much",
    }],
  ]);

  const checked = new Set();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("information-questions", attempt, () => 0.42);
    const shuffledA = buildGrammarPracticeQuestions("information-questions", attempt, () => 0);
    const shuffledB = buildGrammarPracticeQuestions("information-questions", attempt, () => 0.99);
    assert.equal(questions.length, 5);
    let changedOrders = 0;

    for (const question of questions) {
      const drillId = [...cases.keys()].find((key) =>
        question.id.includes(":drill-interrogatives-basic-" + key + "-")
      );
      assert.ok(drillId, question.id);
      const spec = cases.get(drillId);
      assert.equal(question.kind, "gap", question.id);
      assert.equal(question.answer, spec.answer, question.id);
      assert.equal(question.ruleAspect, spec.aspect, question.id);
      assert.deepEqual(
        new Set(question.options),
        new Set([spec.answer, ...spec.choices]),
        question.id,
      );
      assert.equal(question.options.length, 4, question.id);
      assert.match(question.display, /CONTEXTE\n/u, question.id);
      assert.match(question.display, /PHRASE À COMPLÉTER\n/u, question.id);
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.doesNotMatch(question.display, /«\s*«/u, question.id);

      const explanations = spec.choices.map((selected) => {
        checked.add(drillId + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.includes("Tu as choisi « " + selected + " »"), question.id);
        assert.ok(feedback.includes(spec.sentence), question.id);
        assert.ok(feedback.length <= 260, question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        return feedback;
      });
      assert.equal(new Set(explanations).size, 3, question.id);

      const first = shuffledA.find(({ id }) => id === question.id);
      const second = shuffledB.find(({ id }) => id === question.id);
      assert.ok(first && second, question.id);
      assert.deepEqual(new Set(first.options), new Set(second.options), question.id);
      if (first.options.join("|") !== second.options.join("|")) changedOrders += 1;
    }
    assert.ok(changedOrders > 0, "shuffled choices must change order without changing their meaning");
  }
  assert.equal(checked.size, 15, "all fifteen chosen-answer explanations are covered");

  const questions = buildGrammarPracticeQuestions("information-questions", 1, () => 0.42);
  const drill = (name) => questions.find(({ id }) =>
    id.includes(":drill-interrogatives-basic-" + name + "-")
  );
  assert.match(getGrammarIncorrectFeedback(drill("where-toilet"), "언제"), /horaires.*emplacement/u);
  assert.match(getGrammarIncorrectFeedback(drill("when-train"), "왜"), /grammatical.*pourquoi.*moment/u);
  assert.match(getGrammarIncorrectFeedback(drill("why-taxi"), "어디"), /où prendre un taxi.*raison/u);
  assert.match(getGrammarIncorrectFeedback(drill("how-go"), "언제"), /correct.*quand.*moyen de transport/u);
  assert.match(getGrammarIncorrectFeedback(drill("how-much-item"), "무슨"), /devant un nom.*prix/u);
  assert.match(drill("when-train").display, /connais déjà le quai/u);
  assert.match(drill("how-much-item").display, /connaître son prix/u);
});

test("stage 14 keeps compact question cards and five specific correct-answer leads", () => {
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  assert.match(screen, /question\.stageId === "information-questions" && styles\.questionCardStageFourteen/u);
  assert.match(screen, /if \(question\.stageId === "information-questions"\)/u);
  for (const id of ["where-toilet", "when-train", "why-taxi", "how-go", "how-much-item"]) {
    assert.ok(screen.includes('question.id.includes("' + id + '")'), id);
  }
  assert.match(screen, /TON CHOIX EXPLIQUÉ/u);
  assert.match(screen, /POUR CET EXERCICE/u);
  assert.match(exercises, /stageId === "information-questions"/u);
});


test("stage 15 distinguishes every chosen wrong answer across both negation families", () => {
  const seenDrills = new Set();
  const checkedChoices = new Set();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("simple-negation", attempt, () => 0.42);
    for (const question of questions) {
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.ok(question.id.includes(":drill-"), question.id);
      assert.equal(typeof question.answer, "string", question.id);
      const wrongChoices = question.options.filter((option) => option !== question.answer);
      assert.equal(wrongChoices.length, 3, question.id);
      const token = question.id.match(/:drill-(?:negation-an|copula-negation-anieyo)-(.+)-\d+$/u);
      assert.ok(token, question.id);
      seenDrills.add(token[1]);
      const feedbacks = wrongChoices.map((selected) => {
        checkedChoices.add(token[1] + ":" + selected);
        const feedback = getGrammarIncorrectFeedback(question, selected);
        assert.ok(feedback.startsWith("Tu as choisi « " + selected + " » : "), question.id);
        assert.notEqual(feedback, question.explanation, question.id);
        assert.ok(feedback.length > 85 && feedback.length < 290, question.id);
        return feedback;
      });
      assert.equal(new Set(feedbacks).size, 3, question.id);
    }
  }
  assert.equal(seenDrills.size, 10, "the five short-negation and five identity-negation drills are audited");
  assert.equal(checkedChoices.size, 30, "all thirty incorrect selections have their own explanation");

  const questions = buildGrammarPracticeQuestions("simple-negation", 1, () => 0.42);
  const find = (id) => questions.find((question) => question.id.includes(id));
  assert.match(getGrammarIncorrectFeedback(find("not-go-choice"), "못 가요"), /empêchement.*décides/u);
  assert.match(getGrammarIncorrectFeedback(find("not-spicy-short"), "맵지 않아요"), /correct.*longue/u);
});

test("stages 15 to 40 keep concise exercise prompts and their own display context", () => {
  const exercises = readFileSync(join(projectRoot, "lib/grammar/exercises.ts"), "utf8");
  const screen = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  for (const stageId of GRAMMAR_STAGE_IDS.slice(14, 40)) {
    const questions = buildGrammarPracticeQuestions(stageId, 1, () => 0.42);
    assert.ok(questions.length >= 5, stageId);
    for (const question of questions) {
      assert.doesNotMatch(question.prompt, /Objectif :/u, question.id);
      assert.ok(question.display, question.id);
      assert.ok(question.options.length >= 3, question.id);
      assert.ok(question.explanation.trim().length > 10, question.id);
    }
  }
  assert.match(exercises, /stageId !== "a1-validation"/u);
  assert.match(screen, /GRAMMAR_STAGE_IDS\.slice\(14, 40\)\.includes\(question\.stageId\) && styles\.questionCardStageFourteen/u);
  assert.match(screen, /return "Oui\. " \+ question\.explanation/u);
});

test("later lessons distinguish a restricted quantity, an additive meaning and past speculation", () => {
  const restricted = buildGrammarPracticeQuestions("limit-request", 1, () => 0.42);
  const seats = restricted.find((question) => question.id.includes("sentence-seat-only"));
  const bread = restricted.find((question) => question.id.includes("meaning-bread-only"));
  const order = restricted.find((question) => question.id.includes("one-only-order"));
  assert.ok(seats && bread && order);
  assert.match(getGrammarIncorrectFeedback(seats, "자리가 하나 있어요."), /sans insister/u);
  assert.match(getGrammarIncorrectFeedback(seats, "자리도 하나 있어요."), /aussi/u);
  assert.match(getGrammarIncorrectFeedback(seats, "자리 두 개만 있어요."), /deux unités/u);
  assert.match(getGrammarIncorrectFeedback(bread, "Il y a aussi du pain."), /도/u);
  assert.match(getGrammarIncorrectFeedback(bread, "Le pain est délicieux."), /맛있어요/u);
  assert.match(getGrammarIncorrectFeedback(bread, "Y a-t-il du pain ou du riz ?"), /question/u);
  assert.match(getGrammarIncorrectFeedback(order, ["한 잔만", "지금", "있어요."]), /지금.*한 잔만/u);

  const past = buildGrammarPracticeQuestions("past-event", 1, () => 0.42);
  const seeing = past.find((question) => question.id.includes("see-past"));
  assert.ok(seeing);
  assert.match(getGrammarIncorrectFeedback(seeing, "보았을 거예요"), /supposition.*passé/u);
});


test("later grammar distractors must explain the actual selection", () => {
  const missing = [];
  const duplicates = [];
  const summary = new Map();
  for (const stageId of [...GRAMMAR_STAGE_IDS.slice(14, 40), "a1-validation"]) {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
    const questions = buildGrammarPracticeQuestions(stageId, attempt, () => 0.42);
    for (const question of questions) {
      if (Array.isArray(question.answer)) continue;
      const wrong = question.options.filter((choice) => choice !== question.answer);
      const feedbacks = wrong.map((choice) => {
        const feedback = getGrammarIncorrectFeedback(question, choice);
        if (feedback === question.explanation || !feedback.includes(choice)) {
          missing.push(stageId + " / " + question.id + " / " + choice + " => " + feedback.slice(0, 100));
        }
        summary.set(stageId, (summary.get(stageId) ?? 0) + 1);
        return feedback;
      });
      if (new Set(feedbacks).size !== wrong.length) {
        duplicates.push(question.id + " => " + JSON.stringify(feedbacks));
      }
    }
    }
  }
  assert.deepEqual(missing, [], "each explanation must address the selected answer: " + missing.slice(0, 30).join("; "));
  assert.deepEqual(duplicates, [], "different wrong choices must have different feedback: " + duplicates.slice(0, 15).join("; "));
  assert.equal(summary.size, 27);
});
test("high-confusion grammar distractors receive answer-specific explanations", () => {
  const dailyRegister = buildGrammarPracticeQuestions("polite-register", 1, () => 0.42)[0];
  assert.match(getGrammarIncorrectFeedback(dailyRegister, "좋습니다"), /registre formel/u);
  assert.match(getGrammarIncorrectFeedback(dailyRegister, "좋았어요"), /passé/u);

  const staticLocation = buildGrammarPracticeQuestions("locate-thing", 1, () => 0.42)
    .find(({ options }) => options.includes("에서"));
  assert.ok(staticLocation);
  assert.match(getGrammarIncorrectFeedback(staticLocation, "에서"), /action.*statique/u);

  const ability = buildGrammarPracticeQuestions("express-ability", 1, () => 0.42)[0];
  assert.match(getGrammarIncorrectFeedback(ability, "읽어도 돼요"), /autorisé.*réalisable/u);

  const reason = buildGrammarPracticeQuestions("give-reason", 1, () => 0.42)[0];
  assert.match(getGrammarIncorrectFeedback(reason, "오지만"), /contraste.*cause/u);
});

test("valid Korean alternatives are disambiguated by the requested nuance", () => {
  const topic = buildGrammarPracticeQuestions("introduce-topic", 1, () => 0.42)
    .find(({ answer, display, options }) =>
      answer === "는" && display?.includes("커피__") && options.includes("를")
    );
  assert.ok(topic);
  assert.match(topic.prompt, /thème contrastif/u);
  assert.match(topic.display, /opposer explicitement/u);
  assert.match(
    getGrammarIncorrectFeedback(topic, "를"),
    /particule d’objet.*phrase correcte.*contraste demandé/u,
  );

  const destination = buildGrammarPracticeQuestions("destination-and-time", 1, () => 0.42)
    .find(({ options }) => options.includes("에서"));
  assert.ok(destination);
  assert.match(destination.display, /point de départ n’est pas indiqué/u);
  assert.match(
    getGrammarIncorrectFeedback(destination, "에서"),
    /phrase grammaticale.*point de départ.*destination/u,
  );

  const alternative = buildGrammarPracticeQuestions("choose-alternative", 1, () => 0.42)
    .find(({ options }) => options.includes("하고"));
  assert.ok(alternative);
  assert.match(alternative.prompt, /alternative/u);
  assert.match(getGrammarIncorrectFeedback(alternative, "하고"), /correctement.*« et ».*« ou »/u);

  const people = buildGrammarPracticeQuestions("request-quantity", 1, () => 0.42)
    .find(({ ruleAspect }) => ruleAspect === "people-classifier");
  assert.ok(people);
  assert.match(people.display, /personnes composent ton groupe/u);

  const rangeStart = buildGrammarPracticeQuestions("range-and-limit", 1, () => 0.42)
    .find(({ ruleAspect, display }) => ruleAspect === "range-start" && display?.includes("아홉 시"));
  assert.ok(rangeStart);
  assert.equal(rangeStart.options.includes("에서"), false);

  const lesson = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  assert.doesNotMatch(lesson, /MAUVAISE RÉPONSE/u);
  assert.match(lesson, /À AJUSTER ICI/u);
});

test("받침-sensitive forms evaluate both consonant and vowel variants", () => {
  for (const [stageId, expectedAnswers] of [
    ["identify-with-copula", ["이에요", "예요"]],
    ["introduce-topic", ["은", "는"]],
    ["object-actions", ["을", "를"]],
    ["direction-and-means", ["으로", "로"]],
  ]) {
    const questions = buildGrammarPracticeQuestions(stageId, 1, () => 0.42);
    const aspects = new Set(questions.map(({ ruleAspect }) => ruleAspect));
    assert.ok(
      aspects.has("batchim") || [...aspects].some((value) => value?.includes("batchim")),
      `${stageId}: consonant-final item`,
    );
    assert.ok(
      aspects.has("no-batchim") || [...aspects].some((value) => value?.includes("no-batchim")),
      `${stageId}: vowel-final item`,
    );
    for (const answer of expectedAnswers) {
      assert.ok(questions.some((question) => question.answer === answer), `${stageId}: ${answer}`);
    }
  }
});

test("negation and inability use the same vocabulary with an explicit semantic contrast", () => {
  const shortNegation = buildGrammarPracticeQuestions("simple-negation", 1, () => 0.42)
    .find((question) => question.answer === "안 가요");
  const inability = buildGrammarPracticeQuestions("express-inability", 1, () => 0.42)
    .find((question) => question.answer === "못 가요");

  assert.ok(shortNegation);
  assert.ok(inability);
  assert.ok(shortNegation.options.includes("못 가요"));
  assert.ok(inability.options.includes("안 가요"));
  assert.match(shortNegation.prompt, /négation courte 안/u);
  assert.match(inability.display, /empêche/u);
});

test("adding-item drills vary the task and keep grammatical distractors", () => {
  const questions = buildGrammarPracticeQuestions("add-item", 1, () => 0.42);
  const water = questions.find((question) => question.id.includes("water-too"));
  const meaning = questions.find((question) => question.id.includes("me-too"));
  const kimchi = questions.find((question) => question.id.includes("kimchi-too"));
  const bread = questions.find((question) => question.id.includes("too-vs-only"));

  assert.equal(questions.length, 5);
  assert.ok(water);
  assert.deepEqual(new Set(["도", "을", "만", "은"]), new Set([water.answer, ...water.options]));
  assert.ok(meaning);
  assert.equal(meaning.kind, "choice");
  assert.equal(meaning.answer, "Moi aussi, j’y vais.");
  assert.ok(kimchi);
  assert.equal(kimchi.kind, "scene");
  assert.ok(kimchi.options.includes("김치를 주세요."));
  assert.match(getGrammarIncorrectFeedback(kimchi, "김치를 주세요."), /grammatical.*neutre.*« aussi »/u);
  assert.ok(bread);
  assert.match(getGrammarIncorrectFeedback(bread, "빵을 주세요."), /demande neutre.*빵도 주세요/u);
});

test("limit-request drills stay on affirmative 만 있어요", () => {
  const questions = buildGrammarPracticeQuestions("limit-request", 1, () => 0.42);
  const guide = getGrammarLessonGuide("limit-request");
  const exerciseText = questions
    .flatMap(({ prompt, display, explanation, options }) => [prompt, display, explanation, ...options])
    .join(" ");

  assert.equal(questions.length, 5);
  assert.deepEqual(new Set(questions.map(({ kind }) => kind)), new Set(["gap", "choice", "order"]));
  assert.equal(questions.find(({ id }) => id.includes("sentence-seat-only"))?.answer, "자리 하나만 있어요.");
  assert.equal(questions.find(({ id }) => id.includes("meaning-bread-only"))?.answer, "Il n’y a que du pain.");
  assert.deepEqual(
    questions.find(({ id }) => id.includes("one-only-order"))?.answer,
    ["지금", "한 잔만", "있어요."],
  );
  assert.match(exerciseText, /만 있어요/u);
  assert.doesNotMatch(exerciseText, /밖에|없어요/u);
  assert.match(guide.formula.pattern, /만 \+ 있어요/u);
  assert.match(
    guide.commonMistakes.map(({ correction }) => correction).join(" "),
    /밖에 \+ 없어요.*forme affirmative 만 있어요/u,
  );
});

test("inability module keeps 못 as the only correct negation", () => {
  const questions = buildGrammarPracticeQuestions("express-inability", 1, () => 0.42);
  const hearing = questions.find((question) => question.id.includes("cannot-hear"));
  const guide = getGrammarLessonGuide("express-inability");

  assert.equal(questions.length, 5);
  assert.ok(questions.every(({ answer }) => answer.includes("못")));
  assert.ok(hearing);
  assert.equal(hearing.answer, "잘 못 들어요");
  assert.ok(hearing.options.includes("듣고 싶지 않아요"));
  assert.ok(hearing.options.includes("들을 수 있어요"));
  assert.match(hearing.display, /귀가 아파서/u);
  assert.match(getGrammarIncorrectFeedback(hearing, "듣고 싶지 않아요"), /ne veux pas écouter/u);
  assert.match(getGrammarIncorrectFeedback(hearing, "들을 수 있어요"), /écoute est possible/u);
  assert.match(guide.introduction, /uniquement 못/u);
  assert.match(
    guide.commonMistakes.map(({ correction }) => correction).join(" "),
    /잘 안 들려요.*ce n’est pas une erreur/u,
  );
});

test("register and request distractors are disambiguated by explicit situations", () => {
  const dailyPolite = buildGrammarPracticeQuestions("polite-register", 1, () => 0.42)
    .find(({ options }) => options.includes("좋습니다"));
  assert.ok(dailyPolite);
  assert.match(dailyPolite.prompt, /(?:style|présent) poli courant/u);
  assert.match(dailyPolite.display, /poliment et au présent/u);

  const politeMy = buildGrammarPracticeQuestions("possession", 1, () => 0.42)
    .filter(({ answer }) => answer === "제");
  assert.ok(politeMy.length > 0);
  assert.ok(politeMy.every(({ display }) => /contrôleur|professeur|agent/u.test(display)));
  const casualMy = buildGrammarPracticeQuestions("possession", 1, () => 0.42)
    .find(({ answer }) => answer === "내");
  assert.ok(casualMy);
  assert.match(casualMy.display, /ami proche/u);

  const actionRequest = buildGrammarPracticeQuestions("request-action", 1, () => 0.42)
    .find(({ options }) => options.includes("말하세요"));
  assert.ok(actionRequest);
  assert.match(actionRequest.prompt, /demande d’action/u);
  const instruction = buildGrammarPracticeQuestions("polite-instructions", 1, () => 0.42)
    .find(({ options }) => options.includes("펴 주세요"));
  assert.ok(instruction);
  assert.match(instruction.display, /consigne/u);
});

test("present, past and future lessons require real conjugation", () => {
  const present = buildGrammarPracticeQuestions("present-actions", 1, () => 0.42);
  const past = buildGrammarPracticeQuestions("past-event", 1, () => 0.42);
  const future = buildGrammarPracticeQuestions("future-plan", 1, () => 0.42);

  assert.ok(present.every(({ kind }) => kind === "transformation"));
  assert.ok(past.every(({ kind }) => kind === "transformation"));
  assert.ok(future.some(({ kind }) => kind === "transformation"));
  assert.ok(present.some(({ answer }) => answer === "먹어요"));
  assert.ok(past.some(({ answer }) => answer === "먹었어요"));
  assert.ok(future.some(({ answer }) => answer === "먹을 거예요"));
  assert.ok(future.some(({ options }) => options.includes("먹을게요")));
});

test("에 and 에서 are contrasted on stable vocabulary", () => {
  const staticLocation = buildGrammarPracticeQuestions("locate-thing", 1, () => 0.42)
    .find(({ display }) => display.includes("카페__"));
  const actionLocation = buildGrammarPracticeQuestions("action-location", 1, () => 0.42)
    .find(({ display }) => display.includes("카페__"));

  assert.ok(staticLocation);
  assert.ok(actionLocation);
  assert.equal(staticLocation.answer, "에");
  assert.equal(actionLocation.answer, "에서");
  assert.ok(staticLocation.options.includes("에서"));
  assert.ok(actionLocation.options.includes("에"));
});

test("single-token copula examples never become artificial ordering exercises", () => {
  const questions = buildGrammarPracticeQuestions("identify-with-copula", 1, () => 0.42);
  assert.ok(questions.every(({ kind }) => kind !== "order"));
  assert.ok(questions.every(({ kind }) => kind === "gap"));
});

test("every grammar QCM has unique options and exactly one declared correct answer", () => {
  for (const stageId of GRAMMAR_STAGE_IDS) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      for (const question of buildGrammarPracticeQuestions(stageId, attempt, () => 0.42)) {
        if (Array.isArray(question.answer)) continue;
        assert.equal(new Set(question.options).size, question.options.length, question.id);
        assert.equal(
          question.options.filter((option) => option === question.answer).length,
          1,
          question.id,
        );
      }
    }
  }
});

test("the A1 review is diverse and reserves questions for every core family", () => {
  const reviewedConcepts = new Set();
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const questions = buildGrammarPracticeQuestions("a1-validation", attempt, () => 0.42);
    const skills = questions.map(({ skill }) => skill);
    questions.flatMap(({ conceptIds }) => conceptIds).forEach((id) => reviewedConcepts.add(id));

    assert.equal(questions.length, 12);
    assert.ok(new Set(questions.flatMap(({ conceptIds }) => conceptIds)).size >= 10);
    for (const skill of [
      "particles",
      "conjugation",
      "modality",
      "connectors",
      "register",
      "syntax",
    ]) {
      assert.ok(skills.includes(skill), `${attempt}: ${skill}`);
    }
    assert.ok(
      questions.some(({ conceptIds }) =>
        conceptIds.includes("request-v-a-eo-juseyo") ||
        conceptIds.includes("polite-instruction-euseyo")
      ),
      `${attempt}: request or instruction`,
    );
  }
  assert.ok(reviewedConcepts.has("honorific-si"), "receptive honorific coverage");
});

test("lessons with two rule aspects evaluate both halves", () => {
  for (const [stageId, expectedAspects] of [
    ["destination-and-time", ["destination", "time"]],
    ["direction-and-means", ["direction-batchim", "means-no-batchim", "means-rieul"]],
    ["choose-alternative", ["batchim", "clause-alternative"]],
    ["range-and-limit", ["range-start", "range-end", "limit-only"]],
    ["simple-condition", ["condition", "sufficiency"]],
    ["necessity-and-obligation", ["verbal-obligation", "nominal-need"]],
    ["simple-comparison", ["comparison", "superlative"]],
  ]) {
    const questions = buildGrammarPracticeQuestions(stageId, 1, () => 0.42);
    const aspects = new Set(questions.map(({ ruleAspect }) => ruleAspect));
    for (const aspect of expectedAspects) {
      assert.ok(aspects.has(aspect), `${stageId}: ${aspect}`);
    }
  }

  const quantityConcepts = new Set(
    buildGrammarPracticeQuestions("request-quantity", 1, () => 0.42)
      .flatMap(({ conceptIds }) => conceptIds),
  );
  assert.ok(quantityConcepts.has("native-numbers"));
  assert.ok(quantityConcepts.has("classifiers-basic"));
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

test("the general A1 review never grants mastery to all reviewed concepts", () => {
  const reviewStageId = "a1-validation";
  const before = createEmptyGrammarLearningProgress();
  const session = answerRemainingCorrectly(
    createGrammarPracticeSession(
      reviewStageId,
      1,
      "2026-07-21T11:00:00.000Z",
    ),
    "2026-07-21T11:05:00.000Z",
  );
  const after = recordGrammarSessionCompletion(before, session);

  assert.deepEqual(after.concepts, {});
  assert.equal(after.stages[reviewStageId].attempts, 1);
  assert.equal(getGrammarStageState(after, reviewStageId), "practiced");
  assert.ok(session.questions.every(({ kind }) => kind !== "order"));
  assert.ok(
    session.questions.every(({ answer }) =>
      Array.isArray(answer) ? !answer.join(" ").includes("손님:") : !answer.includes("손님:"),
    ),
  );
});

test("grammar completion still keeps XP and streak hooks in place", () => {
  const lesson = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  assert.match(lesson, /complete\(buildProgressId\("grammar", stageId\)\)/u);
  assert.match(lesson, /completeDailyActivity\("grammar_exercise"\)/u);
  assert.match(lesson, /markGrammarSessionStreakRecorded/u);
});

test("grammar screens guard premium navigation at the hub and lesson route", () => {
  const hub = readFileSync(join(projectRoot, "app/(tabs)/grammar/index.tsx"), "utf8");
  const lesson = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");

  assert.match(hub, /hasPremiumAccess:\s*isPremium/u);
  assert.match(hub, /canAccessGrammarStage\(GRAMMAR_STAGE_BY_ID\[stageId\], isPremium\)/u);
  assert.match(hub, /router\.push\("\/premium"\)/u);
  assert.match(hub, /isPremiumStage \? \(/u);
  assert.match(hub, /styles\.premiumMicro/u);
  assert.match(hub, /const premiumLocked = !canAccessGrammarStage\(/u);

  assert.match(lesson, /const premiumLocked = !canAccessGrammarStage\(stage, isPremium\)/u);
  assert.match(lesson, /router\.replace\("\/premium"\)/u);
  assert.match(lesson, /canRepeatGrammarPractice/u);
  assert.match(lesson, /label=\{stage\.access === "premium" \? "PREMIUM" : "GRATUIT"\}/u);
});

test("capacity and permission stay adjacent and distinct in the journey", () => {
  const abilityIndex = GRAMMAR_STAGE_IDS.indexOf("express-ability");
  assert.equal(GRAMMAR_STAGE_IDS[abilityIndex + 1], "ask-permission");
  assert.equal(
    GRAMMAR_STAGE_BY_ID["express-ability"].title,
    "Exprimer une capacité ou une possibilité",
  );
  assert.equal(
    GRAMMAR_STAGE_BY_ID["express-ability"].communicativeGoal,
    "Dire ce qu’on peut faire ou ce qui est faisable dans une situation",
  );
  assert.match(
    getGrammarLessonGuide("express-ability").mainRule,
    /ne demande jamais directement la permission/u,
  );
  assert.match(
    getGrammarLessonGuide("ask-permission").mainRule,
    /autorisée/u,
  );
});

test("the public screens keep explicit compact and tablet layouts", () => {
  const hub = readFileSync(join(projectRoot, "app/(tabs)/grammar/index.tsx"), "utf8");
  const lesson = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  assert.match(hub, /useResponsiveLayout\(\{\s*maxWidth: isLandscape \? 1120 : 920/u);
  assert.match(hub, /responsive\.getColumns/u);
  assert.match(hub, /safeContentWidth/u);
  assert.match(lesson, /useResponsiveLayout\(\{ maxWidth: 900 \}\)/u);
  assert.match(lesson, /responsive\.isCompact/u);
  assert.match(lesson, /responsive\.isTablet/u);
});
