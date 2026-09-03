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

test("the foundations chapter has complete mini-lessons without filling later chapters", () => {
  const foundationStageIds = GRAMMAR_STAGE_IDS.filter(
    (stageId) => GRAMMAR_STAGE_BY_ID[stageId].chapterId === "foundations",
  );

  assert.deepEqual(Object.keys(GRAMMAR_LESSON_GUIDES), foundationStageIds);

  for (const stageId of foundationStageIds) {
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

  assert.equal(getGrammarLessonGuide("present-actions"), undefined);
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
  assert.match(lesson, /if \(!session\) startPractice\(\)/u);
  assert.match(lesson, /Revoir l’explication/u);
  assert.match(modal, /export function GrammarLessonGuideModal/u);
  assert.match(modal, /label="Accéder aux exercices"/u);
  assert.match(modal, /onPress=\{onAccessExercises\}/u);
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

test("lessons keep five exercises and the general review covers twelve structures", () => {
  for (const stageId of GRAMMAR_STAGE_IDS) {
    const questions = buildGrammarPracticeQuestions(stageId);
    const isReview = GRAMMAR_STAGE_BY_ID[stageId].mode === "review";
    assert.equal(questions.length, isReview ? 12 : 5, stageId);
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

test("high-confusion grammar distractors receive answer-specific explanations", () => {
  const dailyRegister = buildGrammarPracticeQuestions("polite-register", 1, () => 0.42)[0];
  assert.match(getGrammarIncorrectFeedback(dailyRegister, "좋습니다"), /registre formel/u);
  assert.match(getGrammarIncorrectFeedback(dailyRegister, "좋았어요"), /passé/u);

  const staticLocation = buildGrammarPracticeQuestions("locate-thing", 1, () => 0.42)
    .find(({ options }) => options.includes("에서"));
  assert.ok(staticLocation);
  assert.match(getGrammarIncorrectFeedback(staticLocation, "에서"), /action.*statique/u);

  const ability = buildGrammarPracticeQuestions("express-ability", 1, () => 0.42)[0];
  assert.match(getGrammarIncorrectFeedback(ability, "읽어도 돼요"), /autorisation.*capacité/u);

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

test("the public screens keep explicit compact and tablet layouts", () => {
  const hub = readFileSync(join(projectRoot, "app/(tabs)/grammar/index.tsx"), "utf8");
  const lesson = readFileSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"), "utf8");
  assert.match(hub, /useResponsiveLayout\(\{ maxWidth: 960 \}\)/u);
  assert.match(hub, /responsive\.isTablet/u);
  assert.match(lesson, /useResponsiveLayout\(\{ maxWidth: 900 \}\)/u);
  assert.match(lesson, /responsive\.isCompact/u);
  assert.match(lesson, /responsive\.isTablet/u);
});
