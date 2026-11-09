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
const { getJapaneseGrammarVocabulary } = await import("../data/localized/grammarVocabularyJapanese.ts");
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
  "action-location": "action-location-eseo",
  "destination-and-time": "destination-time-e",
  "possession": "possession-ui-je-nae",
  "information-questions": "interrogatives-basic",
  "simple-negation": ["negation-an", "copula-negation-anieyo"],
  "request-item": "request-n-juseyo",
  "request-quantity": ["native-numbers", "classifiers-basic"],
  "sino-number-contexts": "sino-korean-numbers",
  "coordinate-items": "noun-link-hago-irang",
  "choose-alternative": "alternative-ina-animyeon",
};

test("the grammar phase translates only stages 1–20 with paired display catalogues", () => {
  const fr = localizedContent.fr.grammar;
  const ja = localizedContent.ja.grammar;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.ok(Object.keys(fr).length > 200, "Expected complete initial grammar block and UI");
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_GUIDES).sort(), Object.keys(stages).sort());
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_DRILLS).sort(), Object.keys(stages).sort());
  for (const id of Object.keys(stages)) assert.ok(Object.hasOwn(GRAMMAR_COPY_BY_MODULE, id));
  assert.ok(!Object.hasOwn(GRAMMAR_COPY_BY_MODULE, "request-action"));
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

test("115 existing drills and all expected corrective variants have Japanese explanations", () => {
  const errors = [];
  let count = 0;
  for (const [stageId, conceptId] of Object.entries(stages)) {
    const drillConceptIds = Array.isArray(conceptId) ? conceptId : [conceptId];
    const drills = drillConceptIds.flatMap((id) => GRAMMAR_PRACTICE_DRILLS[id]);
    assert.equal(drills.length, ["existence", "simple-negation", "request-quantity"].includes(stageId) ? 10 : 5, stageId);
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
  assert.equal(count, 115);
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
  assert.equal(resolveGrammarText("request-action", "Demander une action", "ja"), "Demander une action");
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
  assert.equal(positive.length, 115);
  assert.equal(new Set(positive).size, 115);
  assert.equal(positive.filter((copy) => copy.startsWith("正解。")).length, 0);
  for (const copy of positive) assert.match(copy, /[가-힣]/u);
  const wrong = Object.values(JAPANESE_GRAMMAR_WRONG_FEEDBACK).flatMap((byDrill) =>
    Object.values(byDrill).flatMap(Object.values),
  );
  assert.equal(wrong.length, 342); // 3 stage-one order permutations use a dynamic feedback resolver
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
    assert.equal(guide.mistakes.length, 2, id);
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

test("French vocabulary micro-glosses are localized to Japanese only at display time", () => {
  const samples = [
    ["existence", "subject-i-ga", "bus-vowel", "버스", "バス"],
    ["object-actions", "object-eul-reul", "coffee-vowel", "커피", "コーヒー"],
  ];
  for (const [stageId, conceptId, drillId, korean, expected] of samples) {
    const drill = GRAMMAR_PRACTICE_DRILLS[conceptId].find((item) => item.id === drillId);
    assert.ok(drill.vocabulary, drillId);
    const question = {stageId, vocabulary: drill.vocabulary};
    const original = drill.vocabulary.find((item) => item.korean === korean).french;
    const translated = getJapaneseGrammarVocabulary(question);
    assert.equal(translated.find((item) => item.korean === korean).french, expected);
    assert.equal(drill.vocabulary.find((item) => item.korean === korean).french, original);
  }
  const source = read("../app/(tabs)/grammar/[stageId].tsx");
  assert.match(source, /japanese \? getJapaneseGrammarVocabulary\(question\) : question\.vocabulary/u);
});

test("stage 11–15 Japanese teaching copy covers all guide parts without French-first grammar assumptions", () => {
  const ids = ["action-location", "destination-and-time", "possession", "information-questions", "simple-negation"];
  for (const id of ids) {
    const guide = JAPANESE_GRAMMAR_GUIDES[id];
    const canonical = GRAMMAR_LESSON_GUIDES[id];
    assert.equal(guide.steps.length, canonical.steps.length, id);
    assert.equal(guide.examples.length, canonical.examples.length, id);
    assert.equal(guide.mistakes.length, canonical.commonMistakes.length, id);
    for (let i = 0; i < canonical.examples.length; i++) {
      assert.equal(guide.examples[i][1].length, canonical.examples[i].parts.length, id + " / " + i);
    }
    assert.ok(guide.introduction.length > 25, id);
    assert.ok(guide.mainRule.length > 35, id);
    assert.ok(guide.memoryTip.length > 18, id);
    assert.doesNotMatch(JSON.stringify(guide), /フランス語|フランス語の語順|フランス語のつづり/u, id);
    assert.notEqual(resolveGrammarText(id, GRAMMAR_STAGE_BY_ID[id].title, "ja"), GRAMMAR_STAGE_BY_ID[id].title);
  }
  assert.match(JAPANESE_GRAMMAR_GUIDES["action-location"].formula.explanation, /日本語の「で」と「に」/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["destination-and-time"].mainRule, /부터/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES.possession.introduction, /日本語の「の」/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["information-questions"].steps[1][1], /日本語/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["simple-negation"].mainRule, /아니에요/u);
  assert.equal(Object.keys(JAPANESE_GRAMMAR_DRILLS["simple-negation"]).length, 10);
  const canonical15 = [
    ...GRAMMAR_PRACTICE_DRILLS["negation-an"],
    ...GRAMMAR_PRACTICE_DRILLS["copula-negation-anieyo"],
  ];
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_DRILLS["simple-negation"]).sort(),
    canonical15.map((drill) => drill.id).sort());
  for (const drill of canonical15) {
    assert.equal(Object.keys(JAPANESE_GRAMMAR_WRONG_FEEDBACK["simple-negation"][drill.id]).length, 3);
    assert.ok(JAPANESE_GRAMMAR_CORRECT_FEEDBACK["simple-negation"][drill.id].length > 20);
  }
});

test("stage-15 duplicate French prompts use one faithful Japanese instruction per source string", () => {
  const stage = JAPANESE_GRAMMAR_DRILLS["simple-negation"];
  const shortNegation = ["not-go-choice", "not-drink-choice", "not-buy-choice", "not-study-choice"];
  const nominalNegation = ["not-student", "not-doctor", "not-coffee", "not-book"];
  assert.equal(new Set(shortNegation.map((id) => stage[id].prompt)).size, 1);
  assert.equal(new Set(nominalNegation.map((id) => stage[id].prompt)).size, 1);
  for (const id of [...shortNegation, ...nominalNegation]) {
    const conceptId = shortNegation.includes(id) ? "negation-an" : "copula-negation-anieyo";
    const drill = GRAMMAR_PRACTICE_DRILLS[conceptId].find((item) => item.id === id);
    assert.equal(resolveGrammarText("simple-negation", drill.prompt, "ja"), stage[id].prompt);
  }
  const last = GRAMMAR_PRACTICE_DRILLS["copula-negation-anieyo"].find((item) => item.id === "absence-vs-identity");
  assert.equal(resolveGrammarText("simple-negation", last.stimulus, "ja"), "「これは私のかばんではありません。」");
});

test("new grammar feedback respects valid alternative forms and distinguishes the context", () => {
  const wrong = JAPANESE_GRAMMAR_WRONG_FEEDBACK;
  assert.match(wrong["action-location"]["cafe-action"]["에"], /いる|所在/u);
  assert.match(wrong["destination-and-time"]["two-time"]["부터"], /２時から/u);
  assert.match(wrong.possession["my-bag-close-friend"]["제"], /正しい形/u);
  assert.match(wrong["information-questions"]["how-go"]["언제"], /いつ/u);
  assert.match(wrong["simple-negation"]["not-go-choice"]["가지 않아요"], /正しい/u);
  assert.match(wrong["simple-negation"]["not-student"]["이 없어요"], /学生がいません/u);
  assert.match(wrong["simple-negation"]["absence-vs-identity"]["제 가방이 없어요."], /ありません/u);
  for (const id of ["action-location", "destination-and-time", "possession", "information-questions", "simple-negation"]) {
    for (const copy of Object.values(JAPANESE_GRAMMAR_CORRECT_FEEDBACK[id])) {
      assert.match(copy, /[가-힣]/u, id);
      assert.doesNotMatch(copy, /フランス語/u, id);
    }
  }
});

test("canonical Korean drills, scores, and lesson navigation are display-only in the newly localized stages", () => {
  const ids = ["action-location", "destination-and-time", "possession", "information-questions", "simple-negation"];
  for (const id of ids) {
    for (const ex of GRAMMAR_LESSON_GUIDES[id].examples) {
      assert.equal(resolveGrammarText(id, ex.korean, "ja"), ex.korean);
    }
    for (const entry of Object.values(JAPANESE_GRAMMAR_DRILLS[id])) {
      for (const value of Object.values(entry)) {
        assert.doesNotMatch(value, /français|orthographe française|フランス語/u, id);
      }
    }
    assert.equal(resolveGrammarText(id, GRAMMAR_STAGE_BY_ID[id].title, "fr"), GRAMMAR_STAGE_BY_ID[id].title);
  }
  assert.equal(resolveGrammarText("request-item", "Commander une chose", "ja"), "品物を注文する");
});

test("stages 16–20 have Japanese-first guides and complete two-concept counting coverage", () => {
  const ids = ["request-item", "request-quantity", "sino-number-contexts", "coordinate-items", "choose-alternative"];
  for (const id of ids) {
    const guide = JAPANESE_GRAMMAR_GUIDES[id];
    const original = GRAMMAR_LESSON_GUIDES[id];
    assert.equal(guide.steps.length, original.steps.length, id);
    assert.equal(guide.examples.length, original.examples.length, id);
    assert.equal(guide.mistakes.length, original.commonMistakes.length, id);
    for (let i = 0; i < original.examples.length; i++) {
      assert.equal(guide.examples[i][1].length, original.examples[i].parts.length, id + ":" + i);
    }
    assert.ok(guide.introduction.length > 25, id);
    assert.doesNotMatch(JSON.stringify(guide), /フランス語|フランス語のつづり|フランス語の語順/u, id);
    assert.notEqual(resolveGrammarText(id, GRAMMAR_STAGE_BY_ID[id].title, "ja"), GRAMMAR_STAGE_BY_ID[id].title);
    assert.equal(resolveGrammarText(id, GRAMMAR_STAGE_BY_ID[id].title, "fr"), GRAMMAR_STAGE_BY_ID[id].title);
  }
  assert.match(JAPANESE_GRAMMAR_GUIDES["request-quantity"].introduction, /助数詞/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["sino-number-contexts"].mainRule, /공・일・공/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["coordinate-items"].introduction, /日本語の「と」/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["choose-alternative"].mainRule, /아니면/u);
  const both = [
    ...GRAMMAR_PRACTICE_DRILLS["native-numbers"],
    ...GRAMMAR_PRACTICE_DRILLS["classifiers-basic"],
  ];
  assert.equal(both.length, 10);
  assert.deepEqual(
    Object.keys(JAPANESE_GRAMMAR_DRILLS["request-quantity"]).sort(),
    both.map((drill) => drill.id).sort(),
  );
  for (const drill of both) {
    assert.equal(Object.keys(JAPANESE_GRAMMAR_WRONG_FEEDBACK["request-quantity"][drill.id]).length, 3);
    assert.ok(JAPANESE_GRAMMAR_CORRECT_FEEDBACK["request-quantity"][drill.id].length > 20);
  }
});

test("French answer choices translate for Japanese display but retain canonical selection values", () => {
  const stage = "request-item";
  const drill = GRAMMAR_PRACTICE_DRILLS["request-n-juseyo"].find((d) => d.id === "iced-americano-meaning");
  assert.ok(drill);
  const choices = JAPANESE_GRAMMAR_DRILLS[stage][drill.id].choices;
  assert.equal(Object.keys(choices).length, 4);
  for (const choice of [drill.answer, ...drill.distractors]) {
    assert.equal(resolveGrammarText(stage, choice, "ja"), choices[choice]);
    assert.equal(resolveGrammarText(stage, choice, "fr"), choice);
    assert.doesNotMatch(choices[choice], /[À-ÿ]|[a-zA-Z]/u);
  }
  const screen = read("../app/(tabs)/grammar/[stageId].tsx");
  assert.match(screen, /onPress=\{\(\) => onAnswer\(option\)\}/u);
});

test("new grammar stage 16–20 copy preserves Korean options and never adds French spelling rules", () => {
  for (const stage of ["request-item","request-quantity","sino-number-contexts","coordinate-items","choose-alternative"]) {
    for (const [id, translation] of Object.entries(JAPANESE_GRAMMAR_DRILLS[stage])) {
      for (const [field, content] of Object.entries(translation)) {
        if (typeof content !== "string") continue;
        assert.doesNotMatch(content, /フランス語|orthographe française|ordre français/u, stage+":"+id+":"+field);
      }
    }
    for (const example of GRAMMAR_LESSON_GUIDES[stage].examples) {
      assert.equal(resolveGrammarText(stage, example.korean, "ja"), example.korean);
    }
  }
  for (const label of ["PRIX À LIRE", "SUITE À COMPLÉTER", "LIGNE À IDENTIFIER", "MOIS À IDENTIFIER", "CHIFFRES À LIRE", "QUESTION À EXPRIMER"]) {
    assert.notEqual(resolveGrammarText("sino-number-contexts", label, "ja"), label);
  }
});

test("stage 20 renders all French lexical hints in Japanese without modifying the canonical exercise", () => {
  const ids = ["coffee-or-tea-vowel", "bread-or-cake-batchim", "bus-or-subway-choice", "water-or-tea-choice", "two-complete-questions"];
  const canonical = GRAMMAR_PRACTICE_DRILLS["alternative-ina-animyeon"];
  const seen = new Set();
  for (const id of ids) {
    const drill = canonical.find((item) => item.id === id);
    assert.ok(drill?.vocabulary?.length, id);
    const original = drill.vocabulary.map((hint) => ({ ...hint }));
    const local = getJapaneseGrammarVocabulary({stageId:"choose-alternative",vocabulary:drill.vocabulary});
    for (const hint of local) {
      assert.ok(/[ぁ-ゔァ-ヴー一-龠]/u.test(hint.french), id+" / "+hint.korean+" / "+hint.french);
      assert.doesNotMatch(hint.french, /[À-ÿ]|[a-z]/u);
      seen.add(hint.korean);
    }
    assert.deepEqual(drill.vocabulary, original);
  }
  assert.ok(seen.size >= 10);
});
