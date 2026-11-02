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
  assert.match(dailyRegister.prompt, /style poli courant/u);

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
        assert.ok(question.explanation.includes(serializedAnswer), question.id);
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
  assert.ok(hearing.options.includes("잘 안 들려요"));
  assert.match(hearing.display, /귀가 아파서/u);
  assert.match(getGrammarIncorrectFeedback(hearing, "잘 안 들려요"), /son est trop faible/u);
  assert.match(guide.introduction, /uniquement 못/u);
  assert.match(
    guide.commonMistakes.map(({ correction }) => correction).join(" "),
    /잘 안 들려요/u,
  );
});

test("register and request distractors are disambiguated by explicit situations", () => {
  const dailyPolite = buildGrammarPracticeQuestions("polite-register", 1, () => 0.42)
    .find(({ options }) => options.includes("좋습니다"));
  assert.ok(dailyPolite);
  assert.match(dailyPolite.prompt, /style poli courant/u);
  assert.match(dailyPolite.display, /conversation quotidienne/u);

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
  assert.match(hub, /label=\{isPremiumStage \? "PREMIUM" : "GRATUIT"\}/u);

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
  assert.match(hub, /useResponsiveLayout\(\{ maxWidth: 960 \}\)/u);
  assert.match(hub, /responsive\.isTablet/u);
  assert.match(lesson, /useResponsiveLayout\(\{ maxWidth: 900 \}\)/u);
  assert.match(lesson, /responsive\.isCompact/u);
  assert.match(lesson, /responsive\.isTablet/u);
});
