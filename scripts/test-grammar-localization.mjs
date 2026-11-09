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
};

test("the grammar phase translates only stages 1–5 with paired display catalogues", () => {
  const fr = localizedContent.fr.grammar;
  const ja = localizedContent.ja.grammar;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.ok(Object.keys(fr).length > 200, "Expected complete initial grammar block and UI");
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_GUIDES).sort(), Object.keys(stages).sort());
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_DRILLS).sort(), Object.keys(stages).sort());
  for (const id of Object.keys(stages)) assert.ok(Object.hasOwn(GRAMMAR_COPY_BY_MODULE, id));
  assert.ok(!Object.hasOwn(GRAMMAR_COPY_BY_MODULE, "nominal-questions"));
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

test("25 existing drills and all expected corrective variants have Japanese explanations", () => {
  const errors = [];
  let count = 0;
  for (const [stageId, conceptId] of Object.entries(stages)) {
    const drills = GRAMMAR_PRACTICE_DRILLS[conceptId];
    assert.equal(drills.length, 5, stageId);
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
  assert.equal(count, 25);
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
  assert.equal(resolveGrammarText("nominal-questions", "Demander qui ou quoi", "ja"), "Demander qui ou quoi");
  assert.match(read("../app/(tabs)/grammar/_layout.tsx"), /<ContentLocalizationProvider pathname=\{pathname\}>/u);
  assert.match(read("../app/(tabs)/grammar/[stageId].tsx"), /getJapaneseGrammarFeedback/u);
  assert.match(read("../lib/i18n/ContentLocalizationProvider.tsx"), /useTranslation\("common"\)/u);
  assert.doesNotMatch(read("../lib/grammar/exercises.ts"), /JAPANESE_GRAMMAR_/u);
  assert.doesNotMatch(read("../lib/grammar/feedback.ts"), /JAPANESE_GRAMMAR_/u);
});
