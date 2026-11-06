import "../scripts/i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { localizedContent } = await import("../data/localized/index.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resolveVocabularyText } = await import("../lib/i18n/vocabularyText.ts");


const manifest = JSON.parse(
  readFileSync(new URL("../locales/manifest.json", import.meta.url), "utf8"),
);

const REQUIRED_MODULES = [
  "hub", "basics", "gastronomie", "transport", "kdrama", "nuit",
  "romance", "sante", "work", "emotion", "famille", "health",
  "lieux", "meteo", "objets", "voyage",
];

test("Japanese vocabulary catalogue covers the existing vocabulary routes", () => {
  const french = localizedContent.fr.vocabulary;
  const japanese = localizedContent.ja.vocabulary;
  const frenchKeys = Object.keys(french).sort();
  const japaneseKeys = Object.keys(japanese).sort();

  assert.ok(japaneseKeys.length >= 650, "Expected a substantial vocabulary catalogue, got " + japaneseKeys.length);
  assert.deepEqual(japaneseKeys, frenchKeys);
  assert.deepEqual(
    validateCataloguePair(french, japanese, { koreanSegments: "display-adaptation" }),
    [],
  );

  for (const module of REQUIRED_MODULES) {
    assert.ok(
      japaneseKeys.some((key) => key.startsWith(module + "__")),
      "Missing Japanese vocabulary copy for route module: " + module,
    );
  }
});

test("Japanese vocabulary copy includes contextual explanations for Japanese learners", () => {
  const samples = [
    ["hub", "Vocabulaire", "語彙"],
    ["basics", "Forme polie mais plus naturelle au quotidien.", "日本語の「です・ます」"],
    ["transport", "Carte type T-Money.", "Suica"],
    ["romance", "Le 'Some'", "恋人未満"],
    ["work", "Formule extrêmement fréquente dans les mails coréens.", "韓国語のビジネスメール"],
    ["famille", "Les termes comme", "韓国語では"],
    ["health", "Utilisez la particule de sujet \"", "主格助詞"],
    ["lieux", "À Séoul, les numéros d'étages sont cruciaux. \"", "ソウルでは階数"],
    ["work", "Le message", "メッセージ"],
    ["shared", "Toucher pour continuer", "タップして続ける"],
    ["shared", "Toucher pour recommencer l’étape", "タップしてこの場面を最初から再生"],
    ["shared", "Réponse en cours...", "返答中…"],
    ["shared", "La lecture audio a échoué.", "音声の再生に失敗しました。"],
    ["shared", "Aucune source audio n’est disponible.", "音声データがありません。"],
  ];

  for (const [module, sourceText, expectedFragment] of samples) {
    const translated = resolveVocabularyText(module, sourceText, "ja");
    assert.notEqual(translated, sourceText, "Untranslated copy: " + module + "/" + sourceText);
    assert.ok(
      translated.includes(expectedFragment),
      "Unexpected Japanese copy for " + module + "/" + sourceText + ": " + translated,
    );
  }

  const familyExample = resolveVocabularyText("famille", "동생 = cadet(te). 부모님 = parents.", "ja");
  assert.ok(familyExample.includes("동생"));
  assert.ok(familyExample.includes("부모님"));
  assert.ok(familyExample.includes("年下のきょうだい"));

  const travelExample = resolveVocabularyText("voyage", "여권 = passeport. 예약 = réservation.", "ja");
  assert.ok(travelExample.includes("여권"));
  assert.ok(travelExample.includes("예약"));

  assert.equal(resolveVocabularyText("basics", "Mirae", "ja"), "Mirae",
    "Names not in the copy catalogue must remain unchanged.");
  assert.equal(resolveVocabularyText("basics", "안녕하세요", "ja"), "안녕하세요",
    "Canonical Korean source strings must remain unchanged.");
  assert.equal(resolveVocabularyText("basics", "Merci", "fr"), "Merci",
    "The French display locale must remain unchanged.");
  assert.equal(resolveVocabularyText("basics", "Je compte sur vous", "ja"), "どうぞよろしくお願いします");
  assert.equal(resolveVocabularyText("work", "Je compte sur vous", "ja"), "どうぞよろしくお願いいたします",
    "Module-specific business-register copy must override shared wording.");
});

test("all French pedagogical fields on vocabulary routes have Japanese display copy", () => {
  const screens = {
    hub: "../app/(tabs)/voc/index.tsx",
    basics: "../app/(tabs)/voc/basics.tsx",
    gastronomie: "../app/(tabs)/voc/gastronomie.tsx",
    transport: "../app/(tabs)/voc/transport.tsx",
    kdrama: "../app/(tabs)/voc/kdrama.tsx",
    nuit: "../app/(tabs)/voc/nuit.tsx",
    romance: "../app/(tabs)/voc/romance.tsx",
    sante: "../app/(tabs)/voc/sante.tsx",
    work: "../app/(tabs)/voc/work.tsx",
    emotion: "../app/(tabs)/voc/emotion.tsx",
    famille: "../app/(tabs)/voc/famille.tsx",
    health: "../app/(tabs)/voc/health.tsx",
    lieux: "../app/(tabs)/voc/lieux.tsx",
    meteo: "../app/(tabs)/voc/meteo.tsx",
    objets: "../app/(tabs)/voc/objets.tsx",
    voyage: "../app/(tabs)/voc/voyage.tsx",
  };
  const fieldPattern = /\b(?:fr|title|sub|description|mean|context|prompt|explain|tab|text|mood|mission|realLife|cultureHint)\s*:\s*"((?:\\.|[^"\\])*)"/g;
  const missing = [];

  for (const [module, relativePath] of Object.entries(screens)) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    for (const match of source.matchAll(fieldPattern)) {
      const sourceText = JSON.parse('"' + match[1] + '"').trim();
      if (!/[A-Za-zÀ-ÿ]/u.test(sourceText)) {
        continue;
      }
      if (resolveVocabularyText(module, sourceText, "ja") === sourceText) {
        missing.push(module + ": " + sourceText);
      }
    }
  }

  const plainTextPattern = /<AppText\b[^>]*>\s*([^<{][^<{}]*)\s*<\/AppText>/gs;
  for (const [module, relativePath] of Object.entries(screens)) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    for (const match of source.matchAll(plainTextPattern)) {
      const sourceText = match[1].replace(/\s+/gu, " ").trim();
      if (!/[A-Za-zÀ-ÿ]/u.test(sourceText)) {
        continue;
      }
      if (resolveVocabularyText(module, sourceText, "ja") === sourceText) {
        missing.push(module + " AppText: " + sourceText);
      }
    }
  }

  assert.deepEqual(missing, [], "Missing Japanese translations for vocabulary display copy:\n" + missing.join("\n"));
});

test("vocabulary UI namespace and phase gate are aligned", () => {
  const frenchUi = JSON.parse(readFileSync(new URL("../locales/fr/vocabulary.json", import.meta.url), "utf8"));
  const japaneseUi = JSON.parse(readFileSync(new URL("../locales/ja/vocabulary.json", import.meta.url), "utf8"));
  assert.deepEqual(validateCataloguePair(frenchUi, japaneseUi), []);
  assert.equal(manifest.phase, 6);
  assert.ok(manifest.japaneseUiNamespaces.includes("vocabulary"));
  assert.ok(!manifest.deferredNamespaces.includes("vocabulary"));
  assert.equal(manifest.japaneseReleaseReady, false);
});
