import assert from "node:assert/strict";
import { test } from "node:test";
import { getContentLocalizationScope } from "../lib/i18n/contentLocalizationScope.ts";
import { createInstance } from "i18next";
import {
  vocabularyCopyId,
  frenchVocabularyContent,
  japaneseVocabularyContent,
} from "../data/localized/vocabularyRegistry.ts";
import {
  countingCopyId,
  frenchCountingContent,
  japaneseCountingContent,
} from "../data/localized/countingRegistry.ts";

test("Vocabulaire routes select the same content for FR and JA", () => {
  assert.deepEqual(getContentLocalizationScope("/voc"), {
    namespace: "vocabulary", module: "hub",
  });
  assert.deepEqual(getContentLocalizationScope("/voc/gastronomie"), {
    namespace: "vocabulary", module: "gastronomie",
  });
  assert.deepEqual(getContentLocalizationScope("/voc/basics"), {
    namespace: "vocabulary", module: "basics",
  });
});
test("Comptage routes select their own content without changing route identity", () => {
  assert.deepEqual(getContentLocalizationScope("/comptage"), {
    namespace: "counting", module: "hub",
  });
  assert.deepEqual(getContentLocalizationScope("/comptage/base"), {
    namespace: "counting", module: "base",
  });
  assert.deepEqual(getContentLocalizationScope("/comptage/sino"), {
    namespace: "counting", module: "sino",
  });
});
test("Unrelated routes are never localized with another lesson's catalogue", () => {
  assert.equal(getContentLocalizationScope("/"), null);
  assert.equal(getContentLocalizationScope("/hangul"), null);
  assert.equal(getContentLocalizationScope("/listen"), null);
  assert.deepEqual(getContentLocalizationScope("/classificateur/objets"), {
    namespace: "classifiers", module: "objets",
  });
});

test("FR and JA resolve from i18next with the same canonical lesson identifiers", async () => {
  const i18n = createInstance();
  await i18n.init({
    lng: "fr",
    initAsync: false,
    fallbackLng: false,
    resources: {
      fr: {
        vocabulary: { content: frenchVocabularyContent },
        counting: { content: frenchCountingContent },
      },
      ja: {
        vocabulary: { content: japaneseVocabularyContent },
        counting: { content: japaneseCountingContent },
      },
    },
  });

  const vocabHubId = vocabularyCopyId("hub", "Vocabulaire");
  const countingHubId = countingCopyId("hub", "Comptage");
  assert.equal(i18n.getResource("fr", "vocabulary", `content.${vocabHubId}.text`), "Vocabulaire");
  assert.equal(i18n.getResource("ja", "vocabulary", `content.${vocabHubId}.text`), "語彙");
  assert.equal(i18n.getResource("fr", "counting", `content.${countingHubId}.text`), "Comptage");
  assert.equal(i18n.getResource("ja", "counting", `content.${countingHubId}.text`), "数字");

  const lessonId = vocabularyCopyId("gastronomie", "Le K-BBQ");
  assert.equal(i18n.getResource("fr", "vocabulary", `content.${lessonId}.text`), "Le K-BBQ");
  assert.equal(i18n.getResource("ja", "vocabulary", `content.${lessonId}.text`), "韓国式焼肉");
});
