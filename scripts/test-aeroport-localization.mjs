import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { localizedContent } = await import("../data/localized/index.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { getContentLocalizationScope } = await import("../lib/i18n/contentLocalizationScope.ts");
const { resolveImmersionText } = await import("../lib/i18n/immersionText.ts");
const { immersionCopyId } = await import("../data/localized/immersionRegistryCafe.ts");
const { AEROPORT_IMMERSION_COPY } = await import("../data/localized/immersionRegistryAeroport.ts");
const { resources } = await import("../locales/index.ts");

test("Aéroport localizes its expression, mission and spoken dialogue screens", () => {
  for (const [route, filename] of [
    ["/lesson/airport", "airport"],
    ["/lesson/aeroportMissions", "aeroportMissions"],
    ["/lesson/aeroportIA", "aeroportIA"],
  ]) {
    assert.deepEqual(getContentLocalizationScope(route), { namespace: "immersion", module: "aeroport" });
    const code = readFileSync(new URL("../app/lesson/" + filename + ".tsx", import.meta.url), "utf8");
    assert.ok(code.includes('ContentLocalizationProvider pathname="' + route + '"'), route);
  }
  assert.deepEqual(getContentLocalizationScope("/lesson/airportIA"), { namespace: "immersion", module: "aeroport" });
  assert.deepEqual(getContentLocalizationScope("/lesson/cafe"), { namespace: "immersion", module: "cafe" });
  assert.deepEqual(getContentLocalizationScope("/lesson/metro"), { namespace: "immersion", module: "metro" });
  assert.deepEqual(getContentLocalizationScope("/lesson/restaurant"), { namespace: "immersion", module: "restaurant" });
});

test("Aéroport FR/JA catalogues align, and Korean expressions remain unchanged", () => {
  const fr = localizedContent.fr.immersion;
  const ja = localizedContent.ja.immersion;
  assert.ok(Object.keys(AEROPORT_IMMERSION_COPY).length >= 240);
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(resources.fr.immersion.content, fr);
  assert.deepEqual(resources.ja.immersion.content, ja);
  assert.ok(immersionCopyId("aeroport", "Centre de transport").startsWith("aeroport__"));
  for (const [source, translated] of Object.entries(AEROPORT_IMMERSION_COPY)) {
    for (const [hangul] of source.matchAll(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/gu)) {
      assert.ok(translated.includes(hangul), "Hangul changed: " + hangul + " in " + source);
    }
  }
});

test("AREX and airport arrival dialogues use natural Japanese with appropriate situational meaning", () => {
  for (const [source, japanese] of [
    ["AÉROPORT", "空港"],
    ["Côté agent", "案内係の表現"],
    ["Train standard", "一般列車（各駅停車）"],
    ["Train express direct", "直通列車"],
    ["Sous-sol 1", "地下１階"],
    ["Quai / plateforme", "乗り場・ホーム"],
    ["Où est le quai du train avec arrêts ?", "各駅停車のホームはどこですか？"],
    ["Je voudrais acheter une carte T-money.", "T-moneyカードを買いたいです。"],
    ["Aéroport d'Incheon → Seoul Station", "仁川空港 → ソウル駅"],
    ["Excusez-moi, comment aller à Seoul Station ?", "すみません、ソウル駅にはどう行けばいいですか？"],
    ["Bilan de la conversation", "会話の振り返り"],
    ["Réécouter la phrase à retenir", "覚えておきたいフレーズをもう一度聞く"],
  ]) {
    assert.equal(resolveImmersionText("aeroport", source, "ja"), japanese, source);
    assert.equal(resolveImmersionText("aeroport", source, "fr"), source);
  }
  assert.equal(resolveImmersionText("aeroport", "6 situations à pratiquer", "ja"), "6つの場面を練習");
  assert.equal(resolveImmersionText("aeroport", "Parler", "ja"), "話す");
  for (const korean of ["서울역까지 어떻게 가요?", "지하 1층", "승강장은 어디예요?"]) {
    assert.equal(resolveImmersionText("aeroport", korean, "ja"), korean);
  }
});

test("All canonical airport presentation fields have Japanese catalogue entries", () => {
  const paths = [
    "../app/lesson/airport.tsx",
    "../app/lesson/aeroportIA.tsx",
    "../data/lesson/aeroport/aeroport.ts",
    "../data/lesson/aeroport/aeroportMissions.ts",
  ];
  const regex = /\b(?:french|fr|label|title|shortTitle|subtitle|description|objective|mean|context|tab|scenarioTitle|scenarioDescription|pronunciationNote|understood|guidance)\s*:\s*"((?:\\.|[^"\\])*)"|\b(?:french|fr|label|title|shortTitle|subtitle|description|objective|mean|context|tab|scenarioTitle|scenarioDescription|pronunciationNote|understood|guidance)\s*:\s*'((?:\\.|[^'\\])*)'/gu;
  const missing = [];
  for (const path of paths) {
    const code = readFileSync(new URL(path, import.meta.url), "utf8");
    for (const m of code.matchAll(regex)) {
      const source = m[1] ?? m[2];
      if (source && /[A-Za-zÀ-ÿ]/u.test(source) && resolveImmersionText("aeroport", source, "ja") === source) {
        missing.push(path + " :: " + source);
      }
    }
  }
  assert.deepEqual(missing, [], missing.join("\n"));
});

test("Contextual spoken feedback translates at display time while retaining Korean phrases", () => {
  const context = "Ici, l’agent vient de présenter les trains AREX. Tu peux lui demander lequel il te conseille ou lui demander de répéter.";
  const messages = [
    "Tu as bien identifié l’AREX, mais il manque encore une demande claire. Ici, tu viens d’arriver à Incheon : l’objectif est de demander comment rejoindre Seoul Station.",
    "Tu as cité plusieurs repères d’étage (1층 et 지하 2층). Dans cette scène, l’agent a indiqué « 지하 1층 », le sous-sol 1. Garde un seul repère après une éventuelle auto-correction.",
    "Tu demandes un trajet vers 홍대, mais cette scène travaille le trajet vers Seoul Station. " + context,
    "J’ai compris : tu veux aller à Seoul Station. " + context + " La destination est claire, mais tu n’as pas encore demandé le chemin. Tu peux transformer l’idée en question : « 서울역까지 어떻게 가요? »",
    "Oui, ta formulation est suffisamment naturelle et précise pour cette situation. " + context,
    "Ta formulation est compréhensible : tu demandes une répétition. Elle ne correspond simplement pas à l’objectif de ce tour. " + context,
    "La transcription semble avoir déformé un mot (« 카기 » → « 가기 »). L’intention reste suffisamment claire, donc je ne le compte pas comme une faute certaine de ta part. Oui, cette réponse convient naturellement à cette étape.",
    "Ta phrase peut être comprise de plusieurs façons. " + context + " Réécoute l’agent et concentre-toi sur une seule intention — réponses proposées : « Quel train me conseillez-vous ? » · « Pouvez-vous répéter plus simplement ? ».",
    "Tu as exprimé plusieurs intentions à la fois. " + context + " Si tu bloques encore, affiche les réponses et choisis celle qui correspond à ce que tu veux dire. — réponses proposées : « Quel train me conseillez-vous ? ».",
  ];
  for (const source of messages) {
    const ja = resolveImmersionText("aeroport", source, "ja");
    assert.notEqual(ja, source, source);
    assert.ok(/[\u3040-\u30ff\u3400-\u9fff]/u.test(ja), ja);
    assert.ok(!/\b(?:Je|Tu|Ta|Elle|Ici|Oui|mais|réponses proposées|l’agent)\b/u.test(ja), "French remains in " + ja);
    for (const [hangul] of source.matchAll(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/gu)) {
      assert.ok(ja.includes(hangul), "Korean changed in " + ja);
    }
  }
});
