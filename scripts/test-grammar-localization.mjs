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
  "request-action": "request-v-a-eo-juseyo",
  "polite-instructions": "polite-instruction-euseyo",
  "direction-and-means": "direction-means-ro-euro",
  "express-desire": "desire-go-sipeoyo",
  "express-ability": "ability-eul-su-isseoyo",
  "ask-permission": "permission-a-eodo-dwaeyo",
  "express-inability": "inability-mot",
  "add-item": "additive-do",
  "limit-request": "restrictive-man",
  "range-and-limit": "range-buteo-kkaji",
  "past-event": "past-ass-eosseoyo",
  "future-plan": "future-eul-geoyeyo",
  "decision-and-promise": "intention-eulgeyo",
  "link-actions": "sequence-go",
  "give-reason": "reason-a-eoseo",
  "mark-contrast": "contrast-jiman",
  "simple-condition": "condition-eumyeon",
  "necessity-and-obligation": "obligation-a-eoya-haeyo",
  "simple-comparison": "comparison-boda-deo-jeil",
  "make-suggestion": "suggestion-eulkkayo",
};

test("the grammar phase translates stages 1–40 with paired display catalogues", () => {
  const fr = localizedContent.fr.grammar;
  const ja = localizedContent.ja.grammar;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.ok(Object.keys(fr).length > 200, "Expected complete initial grammar block and UI");
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_GUIDES).sort(), Object.keys(stages).sort());
  assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_DRILLS).sort(), Object.keys(stages).sort());
  for (const id of Object.keys(stages)) assert.ok(Object.hasOwn(GRAMMAR_COPY_BY_MODULE, id));
  assert.ok(!Object.hasOwn(GRAMMAR_COPY_BY_MODULE, "a1-validation"));
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

test("217 existing drills and all expected corrective variants have Japanese explanations", () => {
  const errors = [];
  let count = 0;
  for (const [stageId, conceptId] of Object.entries(stages)) {
    const drillConceptIds = Array.isArray(conceptId) ? conceptId : [conceptId];
    const drills = drillConceptIds.flatMap((id) => GRAMMAR_PRACTICE_DRILLS[id]);
    assert.equal(drills.length, ["existence", "simple-negation", "request-quantity"].includes(stageId) ? 10 : stageId === "express-ability" ? 7 : 5, stageId);
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
  assert.equal(count, 217);
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
  assert.equal(resolveGrammarText("a1-validation", "Révision générale A1", "ja"), "A1総復習");
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
  assert.equal(positive.length, 217);
  assert.equal(new Set(positive).size, 217);
  assert.equal(positive.filter((copy) => copy.startsWith("正解。")).length, 0);
  for (const copy of positive) assert.match(copy, /[가-힣]/u);
  const wrong = Object.values(JAPANESE_GRAMMAR_WRONG_FEEDBACK).flatMap((byDrill) =>
    Object.values(byDrill).flatMap(Object.values),
  );
  assert.equal(wrong.length, 645); // 3 stage-one order permutations use a dynamic feedback resolver
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

const NEXT_GRAMMAR_STAGES = [
  "request-action", "polite-instructions", "direction-and-means",
  "express-desire", "express-ability",
];
test("stages 21–25 retain complete Japanese teaching guides, native terminology and stable Korean examples", () => {
  const expectedDrills = {"request-action":5,"polite-instructions":5,"direction-and-means":5,"express-desire":5,"express-ability":7};
  for (const stageId of NEXT_GRAMMAR_STAGES) {
    const translated = JAPANESE_GRAMMAR_GUIDES[stageId];
    const canonical = GRAMMAR_LESSON_GUIDES[stageId];
    assert.equal(translated.steps.length, canonical.steps.length, stageId);
    assert.equal(translated.examples.length, canonical.examples.length, stageId);
    assert.equal(translated.mistakes.length, canonical.commonMistakes.length, stageId);
    assert.equal(Object.keys(JAPANESE_GRAMMAR_DRILLS[stageId]).length, expectedDrills[stageId]);
    assert.ok(translated.introduction.length > 55, stageId);
    assert.ok(translated.mainRule.length > 35, stageId);
    assert.doesNotMatch(JSON.stringify(translated), /フランス語|français|orthographe/u, stageId);
    assert.notEqual(resolveGrammarText(stageId, GRAMMAR_STAGE_BY_ID[stageId].title, "ja"), GRAMMAR_STAGE_BY_ID[stageId].title);
    assert.equal(resolveGrammarText(stageId, GRAMMAR_STAGE_BY_ID[stageId].title, "fr"), GRAMMAR_STAGE_BY_ID[stageId].title);
    for (const example of canonical.examples) {
      assert.equal(resolveGrammarText(stageId, example.korean, "ja"), example.korean);
    }
  }
  assert.match(JAPANESE_GRAMMAR_GUIDES["request-action"].mainRule, /말해 주세요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["polite-instructions"].mainRule, /ㄹ/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["direction-and-means"].mainRule, /지하철로/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["express-desire"].formula.explanation, /갈게요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["express-ability"].steps[2][1], /許可/u);
});
test("all 27 stage 21–25 drills preserve display-only answer keys and targeted Japanese corrections", () => {
  let total = 0;
  for (const stageId of NEXT_GRAMMAR_STAGES) {
    const conceptIds = GRAMMAR_STAGE_BY_ID[stageId].conceptIds;
    const drills = conceptIds.flatMap((id) => GRAMMAR_PRACTICE_DRILLS[id]);
    for (const drill of drills) {
      total++;
      const copy = JAPANESE_GRAMMAR_DRILLS[stageId][drill.id];
      assert.ok(copy, stageId+"/"+drill.id);
      const question = {stageId,id:stageId+":drill-"+drill.id+"-1",answer:drill.answer};
      const right = getJapaneseGrammarFeedback(question,drill.answer,true);
      assert.ok(right && right.length >= 25,stageId+"/"+drill.id+"/right");
      assert.match(right, /[가-힣]/u);
      assert.equal(Object.keys(JAPANESE_GRAMMAR_WRONG_FEEDBACK[stageId][drill.id]).length,3,stageId+"/"+drill.id);
      for (const answer of drill.distractors) {
        const wrong = getJapaneseGrammarFeedback(question,answer,false);
        assert.ok(wrong && wrong.length >= 25,stageId+"/"+drill.id+"/"+answer);
        assert.match(wrong,/[가-힣]/u);
        assert.equal(resolveGrammarText(stageId,answer,"ja"),answer);
      }
      assert.equal(resolveGrammarText(stageId,drill.answer,"ja"),drill.answer);
      for (const field of ["context","prompt","explanation"]) {
        if (!drill[field] || !/[A-Za-zÀ-ÿ]/u.test(drill[field])) continue;
        assert.ok(typeof copy[field] === "string" && copy[field].length > 10,stageId+"/"+drill.id+"/"+field);
        assert.equal(resolveGrammarText(stageId,drill[field],"ja"),copy[field],stageId+"/"+drill.id+"/"+field);
        assert.equal(resolveGrammarText(stageId,drill[field],"fr"),drill[field]);
      }
      if (drill.vocabulary) {
        const original = drill.vocabulary.map((hint) => ({...hint}));
        const translated = getJapaneseGrammarVocabulary({stageId,vocabulary:drill.vocabulary});
        for (const hint of translated) {
          assert.match(hint.french,/[ぁ-ゔァ-ヴー一-龠]/u,stageId+"/"+drill.id+"/"+hint.korean);
          assert.doesNotMatch(hint.french,/[À-ÿ]|[a-z]/u,stageId+"/"+drill.id);
        }
        assert.deepEqual(drill.vocabulary,original);
      }
    }
  }
  assert.equal(total,27);
  assert.equal(Object.values(JAPANESE_GRAMMAR_WRONG_FEEDBACK).flatMap((stage) => Object.values(stage).flatMap(Object.values)).length,645);
});
test("21–25 teaching decisions distinguish requests, instructions, means, desire and permission", () => {
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["request-action"]["item-vs-action"]["주세요"], /動作/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["polite-instructions"]["instruction-vs-request"]["펴 주세요"], /指示/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["direction-and-means"]["subway-batchim"]["으로"], /ㄹ/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["express-desire"]["desire-vs-plan"]["갈 거예요"], /予定/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["express-ability"]["charge-ability"]["충전해도 돼요"], /許可/u);
  for (const stageId of NEXT_GRAMMAR_STAGES) {
    assert.equal(getContentLocalizationScope("/grammar/"+stageId).module,stageId);
  }
  for (const unchangedPath of ["../data/grammar/lessonGuides.ts","../data/grammar/practiceDrills.ts","../data/grammar/stages.ts"]) {
    assert.ok(read(unchangedPath).length > 10000);
  }
});

const STAGES_26_TO_30 = [
  "ask-permission", "express-inability", "add-item", "limit-request", "range-and-limit",
];
test("stage 26–30 guides are complete Japanese-first teaching material", () => {
  const expected = { "ask-permission":[5,2,2],"express-inability":[5,3,3],"add-item":[5,3,4],"limit-request":[5,2,2],"range-and-limit":[5,2,2] };
  for (const stageId of STAGES_26_TO_30) {
    const guide = JAPANESE_GRAMMAR_GUIDES[stageId];
    const source = GRAMMAR_LESSON_GUIDES[stageId];
    const [exerciseCount,exampleCount,mistakeCount] = expected[stageId];
    assert.equal(Object.keys(JAPANESE_GRAMMAR_DRILLS[stageId]).length,exerciseCount,stageId);
    assert.equal(guide.steps.length,source.steps.length,stageId);
    assert.equal(guide.examples.length,source.examples.length,stageId);
    assert.equal(guide.mistakes.length,source.commonMistakes.length,stageId);
    assert.equal(guide.examples.length,exampleCount,stageId);
    assert.equal(guide.mistakes.length,mistakeCount,stageId);
    assert.ok(guide.introduction.length > 50,stageId);
    assert.ok(guide.mainRule.length > 50,stageId);
    assert.doesNotMatch(JSON.stringify(guide),/フランス語|français|orthographe/u,stageId);
    assert.equal(resolveGrammarText(stageId,GRAMMAR_STAGE_BY_ID[stageId].title,"fr"),GRAMMAR_STAGE_BY_ID[stageId].title);
    assert.notEqual(resolveGrammarText(stageId,GRAMMAR_STAGE_BY_ID[stageId].title,"ja"),GRAMMAR_STAGE_BY_ID[stageId].title);
    for (const ex of source.examples) assert.equal(resolveGrammarText(stageId,ex.korean,"ja"),ex.korean);
  }
  assert.match(JAPANESE_GRAMMAR_GUIDES["ask-permission"].mainRule,/찍어도 돼요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["express-inability"].mainRule,/안/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["add-item"].mainRule,/저는도/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["limit-request"].formula.explanation,/밖에 없어요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["range-and-limit"].mainRule,/에서/u);
});
test("all 25 drills and 72 static distractors of stages 26–30 are localized with stable canonical answers", () => {
  let count=0,wrong=0,orders=0;
  for (const stageId of STAGES_26_TO_30) {
    const source=GRAMMAR_STAGE_BY_ID[stageId];
    const canonical=source.conceptIds.flatMap((id)=>GRAMMAR_PRACTICE_DRILLS[id]);
    assert.equal(canonical.length,5,stageId);
    for (const drill of canonical) {
      count++;
      const copy=JAPANESE_GRAMMAR_DRILLS[stageId][drill.id];
      assert.ok(copy,stageId+"/"+drill.id);
      const question={stageId,id:stageId+":1:drill-"+source.conceptIds[0]+"-"+drill.id+"-1",answer:drill.answer};
      const right=getJapaneseGrammarFeedback(question,drill.answer,true);
      assert.ok(right && right.length>=25,stageId+"/"+drill.id+"/correct");
      assert.match(right,/[가-힣]/u);
      for (const field of ["stimulus","context","prompt","explanation"]) {
        const original=drill[field];
        if (typeof original!=="string" || !/[A-Za-zÀ-ÿ]/u.test(original)) continue;
        if (field==="stimulus" && /[가-힣]/u.test(original) && !copy.stimulus) continue;
        if (field==="prompt" && !copy.prompt && resolveGrammarText(stageId,original,"ja")!==original) continue;
        assert.equal(resolveGrammarText(stageId,original,"ja"),copy[field],stageId+"/"+drill.id+"/"+field);
        assert.equal(resolveGrammarText(stageId,original,"fr"),original);
      }
      if (drill.kind==="order") {
        orders++;
        assert.deepEqual(Object.keys(JAPANESE_GRAMMAR_WRONG_FEEDBACK[stageId][drill.id]),[]);
        const reverse=[...drill.answer].reverse();
        const wrongCopy=getJapaneseGrammarFeedback(question,reverse,false);
        assert.ok(wrongCopy && wrongCopy.length>=25);
        assert.match(wrongCopy,/한 잔만/u);
        assert.deepEqual(drill.answer,["지금","한 잔만","있어요."]);
      } else {
        assert.equal(drill.distractors.length,3,stageId+"/"+drill.id);
        for (const answer of drill.distractors) {
          wrong++;
          const correction=getJapaneseGrammarFeedback(question,answer,false);
          assert.ok(correction && correction.length>=25,stageId+"/"+drill.id+"/"+answer);
          assert.match(correction,/[가-힣]/u);
          assert.equal(JAPANESE_GRAMMAR_WRONG_FEEDBACK[stageId][drill.id][answer],correction);
          if (!copy.choices?.[answer]) assert.equal(resolveGrammarText(stageId,answer,"ja"),answer);
        }
      }
      if (drill.vocabulary) {
        const original=drill.vocabulary.map((hint)=>({...hint}));
        const translated=getJapaneseGrammarVocabulary({stageId,vocabulary:drill.vocabulary});
        for (const hint of translated) {
          assert.match(hint.french,/[ぁ-ゔァ-ヴー一-龠]/u,stageId+"/"+drill.id+"/"+hint.korean);
          assert.doesNotMatch(hint.french,/[À-ÿ]|[a-z]/u,stageId+"/"+drill.id);
        }
        assert.deepEqual(drill.vocabulary,original);
      }
    }
  }
  assert.equal(count,25);
  assert.equal(orders,1);
  assert.equal(wrong,72);
});
test("French answer options for stages 28 and 29 are translated only for rendering", () => {
  for (const [stageId,conceptId,drillId] of [
    ["add-item","additive-do","me-too"],
    ["limit-request","restrictive-man","meaning-bread-only"],
  ]) {
    const drill=GRAMMAR_PRACTICE_DRILLS[conceptId].find((d)=>d.id===drillId);
    const choices=[drill.answer,...drill.distractors];
    const copy=JAPANESE_GRAMMAR_DRILLS[stageId][drillId].choices;
    assert.deepEqual(Object.keys(copy).sort(),[...choices].sort());
    for (const choice of choices) {
      assert.equal(resolveGrammarText(stageId,choice,"ja"),copy[choice]);
      assert.equal(resolveGrammarText(stageId,choice,"fr"),choice);
    }
  }
  assert.equal(resolveGrammarText("add-item","김치도 주세요.","ja"),"김치도 주세요.");
  assert.equal(resolveGrammarText("limit-request","빵만 있어요.","ja"),"빵만 있어요.");
});
test("stage 29 ordering feedback is contextual but scoring remains canonical", () => {
  const source=GRAMMAR_PRACTICE_DRILLS["restrictive-man"].find((d)=>d.id==="one-only-order");
  const q={stageId:"limit-request",id:"limit-request:1:drill-restrictive-man-one-only-order-1",answer:source.answer};
  assert.equal(getJapaneseGrammarFeedback(q,source.answer,true),JAPANESE_GRAMMAR_CORRECT_FEEDBACK["limit-request"]["one-only-order"]);
  for (const order of [[source.answer[2],source.answer[0],source.answer[1]],[source.answer[1],source.answer[0],source.answer[2]]]) {
    const correction=getJapaneseGrammarFeedback(q,order,false);
    assert.ok(correction && /한 잔만/u.test(correction));
  }
  assert.match(read("../data/localized/grammarFeedbackDisplay.ts"),/stageId === "limit-request"/u);
  assert.doesNotMatch(read("../lib/grammar/exercises.ts"),/JAPANESE_GRAMMAR_/u);
  assert.doesNotMatch(read("../lib/grammar/feedback.ts"),/JAPANESE_GRAMMAR_/u);
});
test("stage 26–30 pedagogical contrast feedback is specific rather than generic", () => {
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["ask-permission"]["photo-permission"]["사진을 찍을 수 있어요?"],/許可/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["express-inability"]["cannot-hear"]["듣고 싶지 않아요"],/聞きたく/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["add-item"]["water-too"]["만"],/水だけ/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["limit-request"]["sentence-seat-only"]["자리 두 개만 있어요."],/二つ/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["range-and-limit"]["hours-range-start"]["에"],/9時/u);
  for (const stage of STAGES_26_TO_30) assert.deepEqual(getContentLocalizationScope("/grammar/"+stage),{namespace:"grammar",module:stage});
});

const STAGES_31_TO_35 = [
  "past-event", "future-plan", "decision-and-promise", "link-actions", "give-reason",
];
test("31–35: Japanese-first guides fully cover the original lesson structure and terminology", () => {
  for (const stageId of STAGES_31_TO_35) {
    const guide = JAPANESE_GRAMMAR_GUIDES[stageId];
    const original = GRAMMAR_LESSON_GUIDES[stageId];
    assert.ok(guide.introduction.length > 60,stageId);
    assert.ok(guide.mainRule.length > 40,stageId);
    assert.equal(guide.steps.length, original.steps.length, stageId);
    assert.equal(guide.examples.length, original.examples.length, stageId);
    assert.equal(guide.mistakes.length, original.commonMistakes.length, stageId);
    assert.equal(Object.keys(JAPANESE_GRAMMAR_DRILLS[stageId]).length,5,stageId);
    assert.doesNotMatch(JSON.stringify(guide),/フランス語|français|orthographe/u,stageId);
    for (const example of original.examples) assert.equal(resolveGrammarText(stageId,example.korean,"ja"),example.korean);
    assert.notEqual(resolveGrammarText(stageId,GRAMMAR_STAGE_BY_ID[stageId].title,"ja"),GRAMMAR_STAGE_BY_ID[stageId].title);
    assert.equal(resolveGrammarText(stageId,GRAMMAR_STAGE_BY_ID[stageId].title,"fr"),GRAMMAR_STAGE_BY_ID[stageId].title);
  }
  assert.match(JAPANESE_GRAMMAR_GUIDES["past-event"].steps[2][1],/보았어요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["future-plan"].mainRule,/살다/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["decision-and-promise"].introduction,/相手/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["link-actions"].introduction,/必ず/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["give-reason"].formula.explanation,/時制/u);
});
test("31–35: all 25 drills and 75 distractors have exact-display translations and targeted feedback", () => {
  let count=0,wrong=0;
  const seenCorrect=new Set();
  for (const stageId of STAGES_31_TO_35) {
    const conceptIds=GRAMMAR_STAGE_BY_ID[stageId].conceptIds;
    const drills=conceptIds.flatMap((id)=>GRAMMAR_PRACTICE_DRILLS[id]);
    assert.equal(drills.length,5,stageId);
    for(const drill of drills) {
      count++;
      const copy=JAPANESE_GRAMMAR_DRILLS[stageId][drill.id];
      assert.ok(copy,stageId+"/"+drill.id);
      const question={stageId,id:stageId+":1:drill-"+conceptIds[0]+"-"+drill.id+"-1",answer:drill.answer};
      const correct=getJapaneseGrammarFeedback(question,drill.answer,true);
      assert.ok(correct && correct.length>=25,stageId+"/"+drill.id);
      assert.match(correct,/[가-힣]/u);
      assert.ok(!seenCorrect.has(correct),stageId+"/"+drill.id+"/duplicate");
      seenCorrect.add(correct);
      for (const field of ["stimulus","prompt","context","explanation"]) {
        const source=drill[field];
        if (typeof source!=="string" || !/[A-Za-zÀ-ÿ]/u.test(source)) continue;
        if(field==="stimulus" && /[가-힣]/u.test(source) && !copy.stimulus) continue;
        assert.equal(resolveGrammarText(stageId,source,"ja"),copy[field],stageId+"/"+drill.id+"/"+field);
        assert.equal(resolveGrammarText(stageId,source,"fr"),source);
      }
      for(const answer of drill.distractors) {
        wrong++;
        const explanation=getJapaneseGrammarFeedback(question,answer,false);
        assert.ok(explanation && explanation.length>=25,stageId+"/"+drill.id+"/"+answer);
        assert.match(explanation,/[가-힣]/u);
        assert.equal(JAPANESE_GRAMMAR_WRONG_FEEDBACK[stageId][drill.id][answer],explanation);
        assert.equal(resolveGrammarText(stageId,answer,"ja"),answer);
        assert.equal(resolveGrammarText(stageId,answer,"fr"),answer);
      }
      assert.equal(drill.distractors.length,3,stageId+"/"+drill.id);
      assert.equal(resolveGrammarText(stageId,drill.answer,"ja"),drill.answer);
      assert.equal(resolveGrammarText(stageId,drill.answer,"fr"),drill.answer);
      if (drill.vocabulary) {
        const original=drill.vocabulary.map((entry)=>({...entry}));
        const glosses=getJapaneseGrammarVocabulary({stageId,vocabulary:drill.vocabulary});
        for(const hint of glosses) {
          assert.match(hint.french,/[ぁ-ゔァ-ヴー一-龠]/u);
          assert.doesNotMatch(hint.french,/[À-ÿ]|[a-z]/u);
        }
        assert.deepEqual(drill.vocabulary,original);
      }
    }
    assert.deepEqual(getContentLocalizationScope("/grammar/"+stageId),{namespace:"grammar",module:stageId});
  }
  assert.equal(count,25);
  assert.equal(wrong,75);
  assert.equal(seenCorrect.size,25);
});
test("31–35: native Korean-Japanese pedagogical contrasts address the selected wrong option", () => {
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["past-event"]["see-past"]["보았을 거예요"],/推量/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["future-plan"]["go-future"]["가요"],/未来/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["decision-and-promise"]["pay-decision"]["계산할까요"],/提案/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["link-actions"]["sequence-vs-reason"]["먹어서"],/理由/u);
  assert.match(JAPANESE_GRAMMAR_WRONG_FEEDBACK["give-reason"]["rain-reason"]["오면"],/条件/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["past-event"].mistakes[0][1],/一律に誤りとはせず/u);
  for(const stage of STAGES_31_TO_35) assert.ok(!Object.values(JAPANESE_GRAMMAR_DRILLS[stage]).some((d)=>d.choices));
  assert.doesNotMatch(read("../lib/grammar/exercises.ts"),/JAPANESE_GRAMMAR_/u);
  assert.doesNotMatch(read("../lib/grammar/feedback.ts"),/JAPANESE_GRAMMAR_/u);
});

const STAGES_36_TO_40 = [
  "mark-contrast", "simple-condition", "necessity-and-obligation",
  "simple-comparison", "make-suggestion",
];
test("36–40: Japanese teaching guides cover complete original sections without altering Korean", () => {
  for(const stageId of STAGES_36_TO_40) {
    const original=GRAMMAR_LESSON_GUIDES[stageId],localized=JAPANESE_GRAMMAR_GUIDES[stageId];
    assert.ok(localized.introduction.length>60,stageId);
    assert.ok(localized.mainRule.length>60,stageId);
    assert.equal(localized.steps.length,original.steps.length,stageId);
    assert.equal(localized.examples.length,original.examples.length,stageId);
    assert.equal(localized.mistakes.length,original.commonMistakes.length,stageId);
    assert.equal(localized.examples.length,2,stageId);
    assert.equal(localized.mistakes.length,2,stageId);
    assert.equal(Object.keys(JAPANESE_GRAMMAR_DRILLS[stageId]).length,5,stageId);
    assert.doesNotMatch(JSON.stringify(localized),/フランス語|français|orthographe/u,stageId);
    for (const ex of original.examples) assert.equal(resolveGrammarText(stageId,ex.korean,"ja"),ex.korean);
    for (const ex of GRAMMAR_STAGE_BY_ID[stageId].canonicalExamples) assert.equal(resolveGrammarText(stageId,ex.korean,"ja"),ex.korean);
    assert.equal(resolveGrammarText(stageId,GRAMMAR_STAGE_BY_ID[stageId].title,"fr"),GRAMMAR_STAGE_BY_ID[stageId].title);
    assert.notEqual(resolveGrammarText(stageId,GRAMMAR_STAGE_BY_ID[stageId].title,"ja"),GRAMMAR_STAGE_BY_ID[stageId].title);
    assert.deepEqual(getContentLocalizationScope("/grammar/"+stageId),{namespace:"grammar",module:stageId});
  }
  assert.match(JAPANESE_GRAMMAR_GUIDES["mark-contrast"].formula.explanation,/맵지만/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["simple-condition"].formula.explanation,/내리면 돼요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["necessity-and-obligation"].mainRule,/여권이 필요해요/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["simple-comparison"].mainRule,/省略/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["make-suggestion"].introduction,/申し出/u);
});
test("36–40: every exercise has display-only Japanese explanations and all 75 distractor-specific corrections", () => {
  let total=0,incorrect=0;
  const correctTexts=new Set();
  for(const stageId of STAGES_36_TO_40) {
    const conceptId=GRAMMAR_STAGE_BY_ID[stageId].conceptIds[0];
    const drills=GRAMMAR_PRACTICE_DRILLS[conceptId];
    assert.equal(drills.length,5,stageId);
    const usedPrompts=new Map();
    for (const drill of drills) {
      total++;
      const localized=JAPANESE_GRAMMAR_DRILLS[stageId][drill.id];
      assert.ok(localized,stageId+"/"+drill.id);
      const q={stageId,id:stageId+":1:drill-"+conceptId+"-"+drill.id+"-1",answer:drill.answer};
      const success=getJapaneseGrammarFeedback(q,drill.answer,true);
      assert.ok(success && success.length>=25,stageId+"/"+drill.id+"/correct");
      assert.match(success,/[가-힣]/u);
      assert.ok(!correctTexts.has(success),"Repeated correct-feedback text: "+stageId+"/"+drill.id);
      correctTexts.add(success);
      for(const field of ["stimulus","context","prompt","explanation"]) {
        const source=drill[field];
        if(typeof source!=="string" || !/[A-Za-zÀ-ÿ]/u.test(source)) continue;
        if(field==="stimulus" && /[가-힣]/u.test(source) && !localized.stimulus) continue;
        assert.equal(resolveGrammarText(stageId,source,"ja"),localized[field],stageId+"/"+drill.id+"/"+field);
        assert.equal(resolveGrammarText(stageId,source,"fr"),source);
      }
      if(usedPrompts.has(drill.prompt)) assert.equal(localized.prompt,usedPrompts.get(drill.prompt),stageId+"/"+drill.id+"/shared prompt");
      usedPrompts.set(drill.prompt,localized.prompt);
      assert.equal(drill.distractors.length,3,stageId+"/"+drill.id);
      for(const answer of drill.distractors) {
        incorrect++;
        const correction=getJapaneseGrammarFeedback(q,answer,false);
        assert.ok(correction && correction.length>=25,stageId+"/"+drill.id+"/"+answer);
        assert.match(correction,/[가-힣]/u);
        assert.equal(JAPANESE_GRAMMAR_WRONG_FEEDBACK[stageId][drill.id][answer],correction);
        assert.equal(resolveGrammarText(stageId,answer,"ja"),answer);
      }
      assert.equal(resolveGrammarText(stageId,drill.answer,"ja"),drill.answer);
      if(drill.vocabulary) {
        const original=drill.vocabulary.map((entry)=>({...entry}));
        for(const hint of getJapaneseGrammarVocabulary({stageId,vocabulary:drill.vocabulary})) {
          assert.match(hint.french,/[ぁ-ゔァ-ヴー一-龠]/u);
          assert.doesNotMatch(hint.french,/[À-ÿ]|[a-z]/u);
        }
        assert.deepEqual(drill.vocabulary,original);
      }
    }
  }
  assert.equal(total,25);
  assert.equal(incorrect,75);
  assert.equal(correctTexts.size,25);
});
test("36–40: editorial concept and nuance translations are linked to the active stages", async () => {
  const {GRAMMAR_EDITORIAL} = await import("../data/grammar/editorial.ts");
  for(const stageId of STAGES_36_TO_40) {
    const conceptId=GRAMMAR_STAGE_BY_ID[stageId].conceptIds[0];
    const editorial=GRAMMAR_EDITORIAL[conceptId];
    assert.ok(editorial,stageId);
    assert.notEqual(resolveGrammarText(stageId,editorial.rule,"ja"),editorial.rule,stageId+"/rule");
    assert.equal(resolveGrammarText(stageId,editorial.rule,"fr"),editorial.rule);
    assert.notEqual(resolveGrammarText(stageId,editorial.practice.scenario,"ja"),editorial.practice.scenario,stageId+"/scenario");
    assert.notEqual(resolveGrammarText(stageId,editorial.practice.scene.french,"ja"),editorial.practice.scene.french,stageId+"/scene");
    for (const part of editorial.ruleParts??[]) {
      assert.notEqual(resolveGrammarText(stageId,part.explanation,"ja"),part.explanation,stageId+"/rulePart");
    }
  }
});
test("36–40: Japanese corrections preserve legitimate alternatives and distinguish meaning", () => {
  const wrong=JAPANESE_GRAMMAR_WRONG_FEEDBACK;
  assert.match(wrong["mark-contrast"]["spicy-delicious"]["매우면"],/条件形/u);
  assert.match(wrong["simple-condition"]["get-off-suffices"]["내리면 가요"],/降りたら/u);
  assert.match(wrong["necessity-and-obligation"]["show-passport-obligation"]["볼 수 있어요"],/見る/u);
  assert.match(wrong["simple-comparison"]["bag-comparison"]["제일"],/最上位/u);
  assert.match(wrong["make-suggestion"]["go-suggestion"]["갈게요"],/決意/u);
  assert.match(JAPANESE_GRAMMAR_GUIDES["simple-comparison"].steps[2][1],/二つだけの場合も文脈によって使えます/u);
  assert.equal(resolveGrammarText("simple-comparison","버스보다 지하철이 빨라요.","ja"),"버스보다 지하철이 빨라요.");
  assert.doesNotMatch(read("../lib/grammar/exercises.ts"),/JAPANESE_GRAMMAR_/u);
  assert.doesNotMatch(read("../lib/grammar/feedback.ts"),/JAPANESE_GRAMMAR_/u);
});
