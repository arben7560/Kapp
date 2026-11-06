import assert from "node:assert/strict";
import { test } from "node:test";
import { getContentLocalizationScope } from "../lib/i18n/contentLocalizationScope.ts";

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
