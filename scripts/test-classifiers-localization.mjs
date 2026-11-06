import "../scripts/i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { localizedContent } = await import("../data/localized/index.ts");
const { CLASSIFIER_COPY_BY_MODULE } = await import("../data/localized/classifiersRegistry.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resolveClassifierText } = await import("../lib/i18n/classifierText.ts");
const manifest = JSON.parse(readFileSync(new URL("../locales/manifest.json", import.meta.url), "utf8"));
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const modules = ["objects", "people", "animals", "paper", "drinks", "machines"];

test("the classifier catalogue covers every route and retains strict FR/JA parity", () => {
  const fr = localizedContent.fr.classifiers;
  const ja = localizedContent.ja.classifiers;
  assert.ok(Object.keys(fr).length >= 400, "Expected all six classifiers and their hub");
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  for (const module of ["hub", "shared", ...modules]) {
    assert.ok(Object.hasOwn(CLASSIFIER_COPY_BY_MODULE, module), module);
  }
});

test("all 18 classifier scenes have Japanese dialogue, speakers and teaching hints", () => {
  const missing = [];
  let checked = 0;
  let sceneCount = 0;
  for (const module of modules) {
    const source = read("../app/(tabs)/classificateur/" + module + ".tsx");
    sceneCount += [...source.matchAll(/\bid:\s*"[^"]+"(?=,\s*\n\s*title:)/gu)].length;
    for (const match of source.matchAll(/\b(?:title|description|char|fr|mean|context)\s*:\s*"((?:\\.|[^"\\])*)"/gu)) {
      const value = JSON.parse('"' + match[1] + '"').trim();
      if (!/[A-Za-zÀ-ÿ]/u.test(value)) continue;
      checked++;
      if (resolveClassifierText(module, value, "ja") === value) missing.push(module + ": " + value);
    }
    for (const match of source.matchAll(/\b(?:backLabel|badgeLabel|toolboxTitle)=(?:"([^"]+)"|'([^']+)')/gu)) {
      const value = match[1] ?? match[2];
      checked++;
      if (resolveClassifierText(module, value, "ja") === value) missing.push(module + " UI: " + value);
    }
  }
  assert.equal(sceneCount, 18);
  assert.ok(checked >= 410, "Expected scene labels and all 396 dialogue/expression fields");
  assert.deepEqual(missing, [], "Untranslated classifier copy:\n" + missing.join("\n"));
});

test("classifier hub copy, premium labels, statuses and accessibility are translated", () => {
  const source = read("../app/(tabs)/classificateur/index.tsx");
  const missing = [];
  for (const match of source.matchAll(/\b(?:title|subtitle)\s*:\s*"((?:\\.|[^"\\])*)"/gu)) {
    const value = JSON.parse('"' + match[1] + '"');
    if (resolveClassifierText("hub", value, "ja") === value) missing.push(value);
  }
  for (const value of [
    "Classificateurs", '"L’art de compter avec précision."',
    "GRAMMAIRE VISUELLE", "IMMERSION NIVEAU 1", "UNITÉS DE MESURE CORÉENNES",
    "UNITÉ DE MESURE", "UNITÉ DE MESURE · PREMIUM", "Paramètres",
    "Découvrir Premium", "Accès gratuit", "Accès Premium inclus",
    "Accès Premium verrouillé", "Sélectionné", "PREMIUM", "PREMIUM 🔒",
    "Ouvre ce classificateur coréen",
  ]) {
    if (resolveClassifierText("hub", value, "ja") === value) missing.push(value);
  }
  assert.deepEqual(missing, [], "Untranslated classifier hub copy:\n" + missing.join("\n"));
  const card = read("../components/ModuleCard.tsx");
  assert.match(card, /useVocabularyText\(\)/u);
  assert.match(card, /translate\(title\)/u);
  assert.match(card, /label=\{translate\(isLocked/u);
  assert.match(card, /translate\(isLocked\s*\?\s*"Accès Premium verrouillé"/u);
  assert.match(card, /translate\(isLocked\s*\?\s*"Découvrir Premium"/u);
  assert.match(source, /badgeLabel=\{translate\("IMMERSION NIVEAU 1"\)\}/u);
  assert.match(source, /icon=\{translate\(module\.title\)\.charAt\(0\)\}/u);
  assert.match(source, /iconScript=\{translate\(module\.title\) === module\.title \? "latin" : "japanese"\}/u);
});

test("shared lesson labels and Korean speech remain unchanged", () => {
  for (const module of modules) {
    for (const value of ["RETOUR", "Toucher pour continuer",
      "Toucher pour recommencer l’étape", "Réponse en cours..."]) {
      assert.notEqual(resolveClassifierText(module, value, "ja"), value, module + ": " + value);
      assert.equal(resolveClassifierText(module, value, "fr"), value);
    }
  }
  assert.equal(resolveClassifierText("people", "몇 분이세요?", "ja"), "몇 분이세요?");
  assert.equal(resolveClassifierText("animals", "마리", "ja"), "마리");
  assert.equal(resolveClassifierText("paper", "두 권", "ja"), "두 권");
  assert.equal(resolveClassifierText("machines", "Du dae", "ja"), "Du dae");
  const screen = read("../components/classificateur/ClassifierImmersionScreen.tsx");
  assert.match(screen, /speak\(line\.kr, dialogueId\)/u);
  assert.match(screen, /speak\(exp\.speak \?\? exp\.word, cardId\)/u);
  assert.match(screen, /language: "ko-KR"/u);
  assert.match(screen, /buildProgressId\(completionPrefix, activeScene\.id\)/u);
});

test("Japanese descriptions follow the Korean statements, not misleading French text", () => {
  for (const [module, original, expected] of [
    ["people", "Savoir dire que l'on est seul sans utiliser de compteur.", "한 명"],
    ["people", "À utiliser pour compter les clients, les professeurs ou les aînés.", "名様"],
    ["animals", "Utilisé pour tous les animaux, des insectes aux éléphants.", "匹・頭・羽"],
    ["objects", "Le classificateur universel pour les choses sans catégorie spécifique.", "「個」「つ」"],
    ["drinks", "Pour tout ce qui se boit dans un récipient ouvert.", "「杯」"],
    ["paper", "Oui, voici les quatre feuilles (ne-jang). Bon film !", "チケット4枚"],
    ["paper", "Donnez-moi dix photos (yeol-jang) de la meilleure.", "10枚"],
    ["machines", "Utilisé pour les ordinateurs, téléphones, voitures et gros appareils.", "「台」"],
  ]) {
    const translated = resolveClassifierText(module, original, "ja");
    assert.notEqual(translated, original);
    assert.ok(translated.includes(expected), module + ": " + translated);
  }
});

test("the route-scoped display provider preserves the release gate and earlier phases", () => {
  const root = read("../app/_layout.tsx");
  for (const module of ["classificateur", "comptage", "voc"]) {
    assert.match(read(`../app/(tabs)/${module}/_layout.tsx`), /<ContentLocalizationProvider pathname=\{pathname\}>/u);
  }
  assert.doesNotMatch(root, /<ContentLocalizationProvider/u);
  assert.match(root, /"\/classificateur"/u);
  assert.match(read("../lib/i18n/ClassifierLocalizationProvider.tsx"), /VocabularyTextContext.Provider/u);
  assert.equal(manifest.phase, 8);
  assert.ok(!manifest.deferredNamespaces.includes("classifiers"));
  assert.ok(manifest.japaneseUiNamespaces.includes("classifiers"));
  assert.equal(manifest.japaneseReleaseReady, false);
});
