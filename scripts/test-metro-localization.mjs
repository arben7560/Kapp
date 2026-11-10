import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { localizedContent } = await import("../data/localized/index.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { getContentLocalizationScope } = await import("../lib/i18n/contentLocalizationScope.ts");
const { resolveImmersionText } = await import("../lib/i18n/immersionText.ts");
const { immersionCopyId } = await import("../data/localized/immersionRegistryCafe.ts");
const { METRO_IMMERSION_COPY } = await import("../data/localized/immersionRegistryMetro.ts");
const { resources } = await import("../locales/index.ts");

test("Métro is scoped to three screens without changing Café, Speak or other lessons", () => {
  for (const route of ["/lesson/metro", "/lesson/metroMissions", "/lesson/metroIA"]) {
    assert.deepEqual(getContentLocalizationScope(route), { namespace: "immersion", module: "metro" });
    const filename = route.split("/").at(-1);
    const source = readFileSync(new URL("../app/lesson/" + filename + ".tsx", import.meta.url), "utf8");
    assert.ok(source.includes('ContentLocalizationProvider pathname="' + route + '"'), route);
  }
  assert.deepEqual(getContentLocalizationScope("/lesson/cafe"), { namespace: "immersion", module: "cafe" });
  assert.deepEqual(getContentLocalizationScope("/speak"), { namespace: "vocabulary", module: "speak" });
  assert.deepEqual(getContentLocalizationScope("/lesson/restaurant"), { namespace: "immersion", module: "restaurant" });
});

test("Métro FR and JA catalogues are paired and share the existing i18next immersion namespace", () => {
  const fr = localizedContent.fr.immersion;
  const ja = localizedContent.ja.immersion;
  assert.ok(Object.keys(METRO_IMMERSION_COPY).length >= 350);
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(resources.fr.immersion.content, fr);
  assert.deepEqual(resources.ja.immersion.content, ja);
  assert.ok(immersionCopyId("metro", "Correspondance").startsWith("metro__"));
  assert.ok(immersionCopyId("cafe", "Correspondance").startsWith("cafe__"));
});

test("Métro route, mission, and useful-expression copy is idiomatic Japanese", () => {
  const examples = [
    ["MÉTRO", "地下鉄"],
    ["Correspondance", "乗り換え"],
    ["Où est-ce que je change ?", "どこで乗り換えますか？"],
    ["Quelle sortie dois-je prendre à Itaewon ?", "梨泰院では何番出口を使えばいいですか？"],
    ["Vous êtes à Hongik University et cherchez le quai vers Gangnam. Demandez de quel côté prendre le train.", "弘大入口駅で江南方面のホームを探しています。どちら側から乗るか尋ねてください。"],
    ["Réussi", "できたこと"],
    ["Fiche vocabulaire", "単語・表現一覧"],
  ];
  for (const [fr, ja] of examples) {
    assert.equal(resolveImmersionText("metro", fr, "ja"), ja, fr);
    assert.equal(resolveImmersionText("metro", fr, "fr"), fr, fr);
  }
  for (const hangul of ["강남 방향은 어느 쪽이에요?", "환승은 어디서 하나요?", "이태원역까지 가세요"]) {
    assert.equal(resolveImmersionText("metro", hangul, "ja"), hangul);
  }
  assert.equal(resolveImmersionText("metro", "Texte inconnu", "ja"), "Texte inconnu");
  for (const [source, japanese] of Object.entries(METRO_IMMERSION_COPY)) {
    const syllables = [...source.matchAll(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/gu)]
      .map(([syllable]) => syllable);
    for (const syllable of syllables) {
      assert.ok(japanese.includes(syllable), "Korean segment changed in: " + source);
    }
  }
});

test("All canonical French Métro copy fields are covered while romanization is preserved", () => {
  const files = [
    "../app/lesson/metro.tsx",
    "../data/lesson/metro/metro.ts",
    "../data/lesson/metro/metroMissions.ts",
    "../components/metro/MetroConversationSummaryModal.tsx",
  ];
  const regex = /\b(?:french|fr|label|title|subtitle|description|objective|mean|context|tab|scenarioDescription|scenarioTitle|situation|narrator|startText)\s*:\s*"(?:\\.|[^"\\])*"|\b(?:french|fr|label|title|subtitle|description|objective|mean|context|tab|scenarioDescription|scenarioTitle|situation|narrator|startText)\s*:\s*'(?:\\.|[^'\\])*'/gu;
  const missing = [];
  for (const relativePath of files) {
    const code = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    for (const match of code.matchAll(regex)) {
      const original = match[0];
      const value = original.split(":").slice(1).join(":").trim().slice(1, -1).trim();
      if (!/[A-Za-zÀ-ÿ]/u.test(value)) continue;
      if (value === "Gangnam station eotteoke gaya haeyo ?") continue; // Korean romanization, not French
      if (resolveImmersionText("metro", value, "ja") === value) missing.push(relativePath + " :: " + value);
    }
  }
  assert.deepEqual(missing, [], missing.join("\n"));
});

test("Composed Métro voice feedback retains Korean, intent and translated help choices", () => {
  const dynamic = [
    "Ici, les choix proposés te permettent de demander la durée, demander s’il faut changer de ligne.",
    "Tu as cité la ligne 3. Pour aller vers Gangnam dans cette scène, c’est la ligne 2 : demande où prendre « 2호선 » vers Gangnam.",
    "Tu as cité plusieurs lignes (1호선 et 3호선). Pour aller vers Gangnam dans cette scène, c’est la ligne 2.",
    "Ta demande semble bien concerner un trajet, mais tu as donné 이태원 au lieu de Gangnam. Ici, l’erreur porte sur la destination, pas sur la structure de ta question.",
    "J’ai compris : tu demandes combien de temps il faut pour arriver à Gangnam. Ici, le plus naturel est de demander simplement comment aller vers Gangnam depuis Hongik University. Ta question fonctionne très bien. Une autre tournure passe-partout serait : « 강남까지 얼마나 걸려요? »",
    "Ta phrase peut vouloir dire plusieurs choses ici. Ici, les choix proposés te permettent de demander la durée. — réponses proposées : « Combien de temps dure le trajet ? ».",
    "Tu as bien donné Gangnam, mais pas encore une demande de trajet ou de direction. La destination seule ne suffit pas à déterminer l’intention — Mots utiles : 강남 · 방향 · 어느 쪽.",
  ];
  for (const original of dynamic) {
    const ja = resolveImmersionText("metro", original, "ja");
    assert.notEqual(ja, original, original);
    assert.ok(/[\u3040-\u30ff\u3400-\u9fff]/u.test(ja), ja);
    for (const [segment] of original.matchAll(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/gu)) {
      assert.ok(ja.includes(segment), "Korean changed: " + segment + " in " + original);
    }
  }
  assert.ok(resolveImmersionText("metro", dynamic[5], "ja").includes("選べる返答"));
});
