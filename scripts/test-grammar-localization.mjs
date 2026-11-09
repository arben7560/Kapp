import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const { localizedContent } = await import("../data/localized/index.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resolveGrammarText } = await import("../lib/i18n/grammarText.ts");
const { getContentLocalizationScope } = await import("../lib/i18n/contentLocalizationScope.ts");
const { GRAMMAR_COPY_BY_MODULE } = await import("../data/localized/grammarRegistry.ts");
const { JAPANESE_GRAMMAR_GUIDES } = await import("../data/localized/grammarGuidesJapanese.ts");
const { JAPANESE_GRAMMAR_DRILLS } = await import("../data/localized/grammarDrillsJapanese.ts");
const { JAPANESE_GRAMMAR_CORRECT_FEEDBACK, JAPANESE_GRAMMAR_WRONG_FEEDBACK } = await import("../data/localized/grammarFeedbackJapanese.ts");
const { getJapaneseGrammarFeedback } = await import("../data/localized/grammarFeedbackDisplay.ts");
const { GRAMMAR_LESSON_GUIDES } = await import("../data/grammar/lessonGuides.ts");
const { GRAMMAR_PRACTICE_DRILLS } = await import("../data/grammar/practiceDrills.ts");
const { GRAMMAR_STAGE_BY_ID } = await import("../data/grammar/stages.ts");

const stages = {
  "sentence-structure": "sentence-order",
  "identify-with-copula": "copula-ieyo-yeyo",
  "polite-register": "polite-style-yo",
  "introduce-topic": "topic-eun-neun",
  "demonstratives": "demonstratives-i-geu-jeo",
  "nominal-questions": "question-mwo-nugu-myeot",
  "existence": ["subject-i-ga", "existence-isseoyo-eopseoyo"],
  "locate-thing": "location-e",
  "present-actions": "present-a-eoyo",
  "object-actions": "object-eul-reul",
};

test("the grammar phase translates only stages 1–10 with paired display catalogues", () => {
  const fr = localizedContent.fr.grammar;
  const ja = localizedContent.ja.grammar;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.ok(Object.keys(fr).length > 200, "Expected complete initial grammar block and UI");
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_GUIDES).sort(), Object.keys(stages).sort());
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_DRILLS).sort(), Object.keys(stages).sort());
  for (const id of Object.keys(stages)) assert.ok(Object.hasOwn(GRAMMAR_COPY_BY_MODULE, id));
  assert.ok(!Object.hasOwn(GRAMMAR_COPY_BY_MODULE, "action-location"));
  assert.equal(resolveGrammarText("sentence-structure", "저는 커피를 마셔요.", "ja"), "저는 커피를 마셔요.");
});

test("all theory fields, examples, parts and common mistakes are present in Japanese", () => {
  const errors = [];
  for (const stageId of Object.keys(stages)) {
    const guide = GRAMMAR_LESSON_GUIDES[stageId];
    const check = (source) => {
      if (resolveGrammarText(stageId, source, "ja") === source) errors.push(stageId + " / " + source);
      assert.equal(resolveGrammarText(stageId, source, "fr"), source);
    };
    check(GRAMMAR_STAGE_BY_ID[stageId].title);
    check(GRAMMAR_STAGE_BY_ID[stageId].communicativeGoal);
    check(guide.introduction); check(guide.mainRule);
    check(guide.formula.pattern); check(guide.formula.explanation);
    for (const step of guide.steps) { check(step.title); check(step.explanation); }
    for (const example of guide.examples) {
      check(example.french);
      for (const part of example.parts) { check(part.french); check(part.role); }
    }
    for (const mistake of guide.commonMistakes) { check(mistake.mistake); check(mistake.correction); }
    check(guide.memoryTip);
  }
  assert.deepEqual(errors, [], errors.join("\n"));
});

test("55 existing drills and all expected corrective variants have Japanese explanations", () => {
  const errors = [];
  let count = 0;
  for (const [stageId, conceptId] of Object.entries(stages)) {
    const drillConceptIds = Array.isArray(conceptId) ? conceptId : [conceptId];
    const drills = drillConceptIds.flatMap((id) => GRAMMAR_PRACTICE_DRILLS[id]);
    assert.equal(drills.length, stageId === "existence" ? 10 : 5, stageId);
    for (const drill of drills) {
      count++;
      const localized = JAPANESE_GRAMMAR_DRILLS[stageId][drill.id];
      if (!localized) { errors.push(stageId + "/" + drill.id); continue; }
      for (const field of ["explanation", "context", "prompt", "stimulus"]) {
        const original = drill[field];
        if (typeof original !== "string" || !/[A-Za-zÀ-ÿ]/u.test(original)) continue;
        if (field === "prompt" && !localized.prompt && resolveGrammarText(stageId, original, "ja") !== original) continue;
        if (field === "stimulus" && /[가-힣]/u.test(original)) continue;
        if (resolveGrammarText(stageId, original, "ja") === original) errors.push(stageId + "/" + drill.id + "/" + field);
      }
      const question = {stageId, id:`${stageId}:1:drill-${conceptId}-${drill.id}-1`, answer:drill.answer};
      if (!getJapaneseGrammarFeedback(question, drill.answer, true)) errors.push(stageId + "/" + drill.id + "/correct");
      if (drill.kind === "order") {
        const order = [...drill.answer].reverse();
        if (!getJapaneseGrammarFeedback(question, order, false)) errors.push(stageId + "/" + drill.id + "/order");
      } else {
        for (const wrong of drill.distractors) {
          if (!getJapaneseGrammarFeedback(question, wrong, false)) errors.push(stageId + "/" + drill.id + "/wrong/" + wrong);
        }
      }
    }
  }
  assert.equal(count, 55);
  assert.deepEqual(errors, [], errors.join("\n"));
});

test("language changes are display-only and preserve canonical Korean responses", () => {
  assert.deepEqual(getContentLocalizationScope("/grammar"), {namespace:"grammar",module:"hub"});
  for (const stage of Object.keys(stages)) {
    assert.deepEqual(getContentLocalizationScope("/grammar/" + stage), {namespace:"grammar",module:stage});
    const original = GRAMMAR_STAGE_BY_ID[stage].title;
    const ja = resolveGrammarText(stage, original, "ja");
    assert.notEqual(ja, original);
    assert.equal(resolveGrammarText(stage, original, "fr"), original);
  }
  assert.equal(resolveGrammarText("action-location", "Situer une action", "ja"), "Situer une action");
  assert.match(read("../app/(tabs)/grammar/_layout.tsx"), /<ContentLocalizationProvider pathname=\{pathname\}>/u);
  assert.match(read("../app/(tabs)/grammar/[stageId].tsx"), /getJapaneseGrammarFeedback/u);
  assert.match(read("../lib/i18n/ContentLocalizationProvider.tsx"), /useTranslation\("common"\)/u);
  assert.doesNotMatch(read("../lib/grammar/exercises.ts"), /JAPANESE_GRAMMAR_/u);
  assert.doesNotMatch(read("../lib/grammar/feedback.ts"), /JAPANESE_GRAMMAR_/u);
});


test("Japanese course copy is written for Japanese learners with consistent Korean-grammar terminology", () => {
  const first = JAPANESE_GRAMMAR_GUIDES["sentence-structure"];
  const copula = JAPANESE_GRAMMAR_GUIDES["identify-with-copula"];
  const polite = JAPANESE_GRAMMAR_GUIDES["polite-register"];
  const topic = JAPANESE_GRAMMAR_GUIDES["introduce-topic"];
  assert.match(first.introduction, /日本語/u);
  assert.doesNotMatch(first.mistakes[0][0], /フランス語/u);
  assert.doesNotMatch(copula.mistakes[1][0], /フランス語/u);
  assert.match(polite.introduction, /ヘヨ体/u);
  assert.match(polite.formula.explanation, /ハムニダ体/u);
  assert.match(polite.formula.pattern, /語幹/u);
  for (const example of polite.examples) {
    assert.equal(example[1][0][1], "요を付ける前の活用形");
  }
  assert.match(topic.introduction, /日本語の「は」/u);
  assert.equal(resolveGrammarText("polite-register", "Poli courant", "ja"), "ヘヨ体");
  assert.equal(resolveGrammarText("polite-register", "Formel", "ja"), "ハムニダ体");
  assert.equal(resolveGrammarText("polite-register", "Poli courant", "fr"), "Poli courant");
});

test("grammar feedback is varied and retains a rule for every correct and incorrect answer", () => {
  const positive = Object.values(JAPANESE_GRAMMAR_CORRECT_FEEDBACK).flatMap(Object.values);
  assert.equal(positive.length, 55);
  assert.equal(new Set(positive).size, 25);
  assert.equal(positive.filter((copy) => copy.startsWith("正解。")).length, 0);
  for (const copy of positive) assert.match(copy, /[가-힣]/u);
  const wrong = Object.values(JAPANESE_GRAMMAR_WRONG_FEEDBACK).flatMap((byDrill) =>
    Object.values(byDrill).flatMap(Object.values),
  );
  assert.ok(wrong.length >= 150);
  for (const copy of wrong) {
    assert.ok(copy.length >= 25, copy);
    assert.match(copy, /[가-힣]/u);
  }
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["polite-register"]["good-daily"]["좋습니다"], /ハムニダ体/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["demonstratives"]["this-bag"]["거기"], /「そこ」/u);
});

test("Japanese UI translates assembled labels, score and screen-reader descriptions without leaking French fragments", () => {
  const examples = [
    ["hub", "2 / 41 étapes", "2／41ステップ"],
    ["hub", "ÉTAPE 03 · NIVEAU A0", "ステップ 03・A0レベル"],
    ["hub", "ÉTAPE 04 · A0", "ステップ 04・A0"],
    ["sentence-structure", "NIVEAU A0 · ÉTAPE 1", "A0レベル・ステップ 1"],
    ["sentence-structure", "EXERCICE 1 / 5", "問題 1／5"],
    ["sentence-structure", "3 réponses correctes sur 5.", "5問中3問正解"],
    ["sentence-structure", "Explication de la leçon L’ordre de la phrase", "「文の語順」の解説"],
    ["sentence-structure", "Termine d’abord les étapes requises pour ouvrir « L’ordre de la phrase ».", "「文の語順」を始めるには、前提のステップを完了してください。"],
    ["sentence-structure", "Cette leçon avancée et ses exercices approfondis sont inclus dans K-App Premium.", "この応用レッスンと練習問題は、K-App Premiumで学べます。"],
  ];
  for (const [module, original, translated] of examples) {
    assert.equal(resolveGrammarText(module, original, "ja"), translated);
    assert.equal(resolveGrammarText(module, original, "fr"), original);
  }
  const lesson = read("../app/(tabs)/grammar/[stageId].tsx");
  const hub = read("../app/(tabs)/grammar/index.tsx");
  const modal = read("../components/grammar/GrammarLessonGuideModal.tsx");
  const guide = read("../components/grammar/GrammarLessonGuide.tsx");
  assert.match(lesson, /\{\x60NIVEAU \$\{stage\.status/u);
  assert.match(lesson, /\{\x60\$\{scoreLabel\(session\.score\)\} sur/u);
  assert.match(lesson, /response\.correct && !localizedLead/u);
  assert.match(hub, /\{\x60\$\{completedStages\} \/ \$\{GRAMMAR_STAGE_IDS\.length\} étapes\x60\}/u);
  assert.match(modal, /accessibilityLabel=\{translate\(\x60Explication de la leçon/u);
  assert.match(guide, /accessibilityLabel=\{translate\(/u);
});

test("stages 6–10 teach Japanese-first concepts and all stage-seven drill families", () => {
  const newer = ["nominal-questions", "existence", "locate-thing", "present-actions", "object-actions"];
  for (const id of newer) {
    const guide = JAPANESE_GRAMMAR_GUIDES[id];
    assert.equal(guide.steps.length, 3, id);
    assert.equal(guide.commonMistakes.length, 2, id);
    assert.ok(guide.introduction.length > 25, id);
    assert.ok(guide.memoryTip.length > 20, id);
    assert.doesNotMatch(JSON.stringify(guide), /フランス語|フランス語のつづり|フランス語の語順/u, id);
    assert.equal(resolveGrammarText(id, GRAMMAR_STAGE_BY_ID[id].title, "fr"), GRAMMAR_STAGE_BY_ID[id].title);
    assert.notEqual(resolveGrammarText(id, GRAMMAR_STAGE_BY_ID[id].title, "ja"), GRAMMAR_STAGE_BY_ID[id].title);
  }
  assert.match(JAPANESE_GRAMMAR_GUIDES["nominal-questions"].mainRule, /助数詞/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES.existence.introduction, /이／가/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["locate-thing"].formula.explanation, /에서/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["present-actions"].mainRule, /ヘヨ体|아요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["object-actions"].formula.explanation, /日本語の「を」/u);
  assert.equal(Object.keys(JAPANESE_GRAMMAR_DRILLS.existence).length, 10);
  const stageSeven = [
    ...GRAMMAR_PRACTICE_DRILLS["subject-i-ga"],
    ...GRAMMAR_PRACTICE_DRILLS["existence-isseoyo-eopseoyo"],
  ];
  assert.deepEqual(
    Object.keys(JAPANESE_GRAMMAR_DRILLS.existence).sort(),
    stageSeven.map((drill) => drill.id).sort(),
  );
  for (const drill of stageSeven) {
    assert.equal(Object.keys(JAPANESE_GRAMMAR_WRONG_FEEDBACK.existence[drill.id]).length, 3);
    assert.ok(JAPANESE_GRAMMAR_CORRECT_FEEDBACK.existence[drill.id].length > 20);
  }
});

test("new lessons do not alter Korean stimuli or answer correctness", () => {
  for (const id of ["nominal-questions", "existence", "locate-thing", "present-actions", "object-actions"]) {
    const guides = GRAMMAR_LESSON_GUIDES[id];
    for (const example of guides.examples) {
      assert.match(example.korean, /[가-힣]/u);
      assert.equal(resolveGrammarText(id, example.korean, "ja"), example.korean);
    }
  }
  for (const id of ["nominal-questions", "existence", "locate-thing", "present-actions", "object-actions"]) {
    for (const drill of Object.values(JAPANESE_GRAMMAR_DRILLS[id])) {
      for (const value of Object.values(drill)) {
        assert.doesNotMatch(value, /français|orthographe française|フランス語/u);
      }
    }
  }
});
