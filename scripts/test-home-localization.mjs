import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { createAppI18n } = await import("../lib/i18n/instance.ts");
const { resolveHomeText } = await import("../lib/i18n/homeText.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resources } = await import("../locales/index.ts");
const { localizedContent } = await import("../data/localized/index.ts");
const { HANGUL_MODULES } = await import("../data/hangul/curriculum.ts");
const { hangulCopyId } = await import("../data/localized/hangulRegistry.ts");
// Avoid importing the runtime mission graph: it uses Metro-only path resolution.
const { GRAMMAR_STAGE_BY_ID } = await import("../data/grammar/stages.ts");
const { GRAMMAR_STAGE_IDS } = await import("../data/grammar/types.ts");

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const fr = JSON.parse(read("../locales/fr/navigation.json"));
const ja = JSON.parse(read("../locales/ja/navigation.json"));
const i18n = createAppI18n("ja");
const translate = (source) => resolveHomeText(source, "ja", i18n);

test("Home navigation copy is aligned in FR and JA without malformed IDs or interpolation", () => {
  assert.deepEqual(validateCataloguePair(resources.fr.navigation, resources.ja.navigation), []);
  assert.deepEqual(Object.keys(fr.copy).sort(), Object.keys(ja.copy).sort());
  const entries = Object.entries(fr.copy).flatMap(([section, values]) =>
    Object.entries(values).map(([key, source]) => ({ section, key, source })),
  );
  assert.ok(entries.length >= 90);
  for (const { section, key, source } of entries) {
    assert.equal(key, encodeURIComponent(source).replaceAll(".", "%2E"), source);
    const translated = ja.copy[section][key];
    assert.ok(translated && translated.trim(), "Missing Japanese Home copy: " + source);
    assert.equal(translate(source), translated, "Mismatched Home translation: " + source);
    assert.equal(resolveHomeText(source, "fr", i18n), source, "French changed: " + source);
  }
});

test("Home hero, courses, sections, descriptions and progress use situational Japanese", () => {
  const cases = [
    ["Tu es à", "ここは"],
    ["Séoul.", "ソウル。"],
    ["{{time}} là-bas. La ville devient ton terrain d'apprentissage.", "ソウルの現地時刻は{{time}}。街そのものが学びの舞台になります。"],
    ["PARCOURS", "学習コース"],
    ["Construis tes bases", "基礎から身につけよう"],
    ["Vis le coréen", "韓国語を実際の場面で使ってみよう"],
    ["Grammaire", "文法"],
    ["Comptage", "数と数え方"],
    ["Vocabulaire", "語彙"],
    ["CENTRE D'APPRENTISSAGE", "学習センター"],
    ["Décrypte l'âme visuelle de la ville.", "街にあふれるハングルを読み解こう。"],
    ["Maîtrise les nombres dans le réel.", "日常の場面で韓国語の数え方を使いこなそう。"],
    ["Écoute", "リスニング"],
    ["PROGRESSION", "進捗"],
    ["Commencer", "はじめる"],
    ["RYTHME DU JOUR", "今日の学習"],
    ["Journée validée", "今日の学習は完了"],
    ["Continue ta journée", "今日の学習を続けよう"],
    ["Ouvrir mon profil", "マイアカウントを開く"],
  ];
  for (const [source, expected] of cases) {
    assert.equal(translate(source), expected, source);
  }
});

test("Four mission resume types and dynamically composed descriptions localize correctly", () => {
  for (const [source, expected] of [
    ["Mission café", "カフェミッション"],
    ["Mission métro", "地下鉄ミッション"],
    ["Mission restaurant", "レストランミッション"],
    ["Mission aéroport", "空港ミッション"],
    ["Reprends ta dernière mission aéroport.", "前回の空港ミッションを再開しよう。"],
    ["Conversation · Aéroport · Simulation réelle", "会話・空港・実践シミュレーション"],
    ["Conversation · Café · Simulation guidée", "会話・カフェ・ガイド付きシミュレーション"],
    ["Grammaire · Exercice 3 / 8", "文法・問題 3／8"],
    ["Grammaire · Étape 5 / 41", "文法・ステップ 5／41"],
    ["Hangul · Quiz 2 / 7", "ハングル・クイズ 2／7"],
    ["Écoute · Parcours terminé · Révision libre", "リスニング・コース完了・自由復習"],
  ]) {
    assert.equal(translate(source), expected, source);
  }
});

test("Stored Hangul, grammar and mission titles reuse existing pedagogical translations", () => {
  const module = HANGUL_MODULES[0];
  const scene = module.scenes[0];
  const id = hangulCopyId("scene", module.id, scene.id);
  const canonicalHangul = localizedContent.fr.hangul[id]?.title;
  const japaneseHangul = localizedContent.ja.hangul[id]?.title;
  assert.equal(canonicalHangul, scene.title);
  assert.ok(japaneseHangul && japaneseHangul !== canonicalHangul);
  assert.equal(translate(canonicalHangul), japaneseHangul);

  const stage = GRAMMAR_STAGE_BY_ID[GRAMMAR_STAGE_IDS[0]];
  const entry = Object.keys(localizedContent.fr.grammar).find((key) =>
    localizedContent.fr.grammar[key]?.text === stage.title &&
    localizedContent.ja.grammar[key]?.text);
  assert.ok(entry, "Missing grammar resume title in existing catalogue");
  assert.equal(
    translate(stage.title),
    localizedContent.ja.grammar[entry].text,
  );

  const cafeTitle = "Commander un café simple";
  assert.ok(cafeTitle);
  const item = Object.keys(localizedContent.fr.immersion).find((key) =>
    localizedContent.fr.immersion[key]?.text === cafeTitle &&
    localizedContent.ja.immersion[key]?.text);
  assert.ok(item, "Missing café mission title in existing translation");
  assert.equal(translate(cafeTitle), localizedContent.ja.immersion[item].text);
});

test("Screen and nested cards keep navigation untouched and localize all accessible names", () => {
  const home = read("../app/(tabs)/index.tsx");
  assert.match(home, /<HomeLocalizationProvider>/u);
  assert.match(home, /const translate = useVocabularyText\(\)/u);
  assert.match(home, /translate\("Tu es à"\)/u);
  assert.match(home, /translate\("Séoul\."\)/u);
  assert.match(home, /translate\("Heure à Séoul : \{\{time\}\}"\)/u);
  assert.match(home, /accessibilityLabel=\{translate\("Ouvrir mon profil"\)\}/u);
  assert.match(home, /accessibilityHint=\{translate\("Ouvre la page Mon profil"\)\}/u);
  assert.match(home, /accessibilityLabel=\{dailySummary\}/u);
  assert.ok(home.includes('accessibilityLabel={`${translate(item.title)}. ${translate(item.narrative)}`}'));
  assert.match(home, /accessibilityHint=\{isListening \? listenText\("home\.resumeHint"\) : translate\("Ouvre le parcours actif"\)\}/u);
  assert.match(home, /listenText\("home\.title"\)/u);
  assert.match(home, /resolveAccountText\(source, locale, i18n\)/u);
  assert.match(home, /router\.push\(sequence\.route\)/u);
  assert.match(home, /setTrack\(sequence\.trackKey\)/u);
  assert.match(home, /readHomeResumeContext\(\)/u);
  assert.doesNotMatch(home, /saveHomeResumeContext\(/u);
});

test("Home TSX and provider transpile without syntax diagnostics", () => {
  for (const source of [
    "../app/(tabs)/index.tsx",
    "../lib/i18n/HomeLocalizationProvider.tsx",
    "../lib/i18n/homeText.ts",
  ]) {
    const code = read(source);
    const result = ts.transpileModule(code, {
      fileName: source,
      reportDiagnostics: true,
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    });
    const errors = (result.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
    assert.deepEqual(errors, [], "Syntax errors in " + source);
  }
});
