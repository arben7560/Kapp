import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { localizedContent } = await import("../data/localized/index.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { getContentLocalizationScope } = await import("../lib/i18n/contentLocalizationScope.ts");
const { resolveImmersionText } = await import("../lib/i18n/immersionText.ts");
const { immersionCopyId } = await import("../data/localized/immersionRegistryCafe.ts");
const { resources } = await import("../locales/index.ts");

test("Café immersion uses its own namespace without changing navigation or Speak", () => {
  for (const route of ["/lesson/cafe", "/lesson/cafeMissions", "/lesson/cafeIA"]) {
    assert.deepEqual(getContentLocalizationScope(route), { namespace: "immersion", module: "cafe" });
    const name = route.split("/").at(-1);
    const source = readFileSync(new URL("../app/lesson/" + name + ".tsx", import.meta.url), "utf8");
    assert.ok(source.includes('ContentLocalizationProvider pathname="' + route + '"'), route);
  }
  assert.deepEqual(getContentLocalizationScope("/speak"), { namespace: "vocabulary", module: "speak" });
  assert.equal(getContentLocalizationScope("/lesson/metro"), null, "Other immersion scenes are out of scope");
});

test("Café has paired FR/JA catalogues with Korean kept in the original lesson data", () => {
  const fr = localizedContent.fr.immersion;
  const ja = localizedContent.ja.immersion;
  assert.ok(Object.keys(fr).length >= 200);
  assert.deepEqual(Object.keys(ja).sort(), Object.keys(fr).sort());
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(resources.ja.immersion.content, ja);
  assert.deepEqual(resources.fr.immersion.content, fr);
  for (const sample of ["Welcome", "Café", "Sur place.", "Vous consommez sur place ou à emporter ?", "Ta réponse", "Réussi"]) {
    if (sample === "Welcome") continue;
    assert.notEqual(resolveImmersionText("cafe", sample, "ja"), sample);
    assert.equal(resolveImmersionText("cafe", sample, "fr"), sample);
  }
  for (const original of ["먹고 갈게요.", "카드로 할게요.", "아니요, 괜찮아요."]) {
    assert.equal(resolveImmersionText("cafe", original, "ja"), original);
  }
  assert.equal(resolveImmersionText("cafe", "Sur place.", "ja"), "店内でお願いします。");
  assert.equal(resolveImmersionText("cafe", "Vous consommez sur place ou à emporter ?", "ja"), "店内でお召し上がりですか？お持ち帰りですか？");
  assert.equal(resolveImmersionText("cafe", "Un terme inconnu", "ja"), "Un terme inconnu");
});

test("All existing Café fields in the source catalogue have Japanese display entries", () => {
  const relevant = [
    "../app/lesson/cafe.tsx",
    "../data/lesson/cafe/cafe.ts",
    "../data/lesson/cafe/cafeMissions.ts",
  ];
  const regex = /\b(?:french|fr|label|title|subtitle|description|objective|mean|context|tab|scenarioDescription|scenarioTitle)\s*:\s*"(?:\\.|[^"\\])*"|\b(?:french|fr|label|title|subtitle|description|objective|mean|context|tab|scenarioDescription|scenarioTitle)\s*:\s*'(?:\\.|[^'\\])*'/gu;
  const failures = [];
  for (const path of relevant) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    for (const match of source.matchAll(regex)) {
      const original = match[0];
      const quote = original.match(/:\s*(['"])/u)?.[1];
      if (!quote) continue;
      const text = original.split(":").slice(1).join(":").trim().slice(1,-1).trim();
      if (!/[A-Za-zÀ-ÿ]/u.test(text)) continue;
      if (resolveImmersionText("cafe", text, "ja") === text) failures.push(path + " :: " + text);
    }
  }
  assert.deepEqual(failures, [], failures.join("\n"));
});

test("Dynamic indicators are localized without touching machine-readable values", () => {
  assert.equal(resolveImmersionText("cafe", "3 situations à pratiquer", "ja"), "3つの場面を練習");
  assert.equal(resolveImmersionText("cafe", "2 réponses validées sans correction", "ja"), "修正なしで2件正しく回答");
  assert.equal(resolveImmersionText("cafe", "1 difficulté résolue pendant la scène", "ja"), "このシーンで1件の課題を解決");
  assert.equal(resolveImmersionText("cafe", "Réécouter 먹고 갈게요.", "ja"), "もう一度聞く：먹고 갈게요.");
  assert.ok(immersionCopyId("cafe", "Sur place.").startsWith("cafe__"));
});
