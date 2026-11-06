import "../scripts/i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { localizedContent } = await import("../data/localized/index.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resolveCountingText } = await import("../lib/i18n/countingText.ts");
const { COUNTING_COPY_BY_MODULE } = await import("../data/localized/countingRegistry.ts");
const manifest = JSON.parse(readFileSync(new URL("../locales/manifest.json", import.meta.url), "utf8"));
const modules = ["base", "sino", "heures", "prix", "phone", "dates", "age", "ordinals"];
const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");

test("phase 7 Japanese counting catalogues are complete and paired", () => {
  const fr = localizedContent.fr.counting, ja = localizedContent.ja.counting;
  assert.ok(Object.keys(ja).length >= 500);
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  for (const module of ["shared", "hub", ...modules]) {
    assert.ok(Object.hasOwn(COUNTING_COPY_BY_MODULE, module));
  }
});

test("each counting scene field and route-specific UI label is localized", () => {
  const missing = [];
  let checked = 0;
  for (const module of modules) {
    const source = read("../app/(tabs)/comptage/" + module + ".tsx");
    for (const match of source.matchAll(/\b(?:title|description|char|fr|mean|context)\s*:\s*"((?:\\.|[^"\\])*)"/gu)) {
      const text = JSON.parse('"' + match[1] + '"').trim();
      if (!/[A-Za-zÀ-ÿ]/u.test(text)) continue;
      checked++;
      if (resolveCountingText(module, text, "ja") === text) missing.push(module + ": " + text);
    }
    for (const match of source.matchAll(/\b(?:backLabel|badgeLabel|toolboxTitle)="([^"]+)"/gu)) {
      const text = match[1];
      if (text === "₩ KRW") continue;
      checked++;
      if (resolveCountingText(module, text, "ja") === text) missing.push(module + " UI: " + text);
    }
  }
  assert.ok(checked >= 500);
  assert.deepEqual(missing, [], "Untranslated counting scenes:\n" + missing.join("\n"));
});

test("hub cards, dynamic labels, accessibility text and shared dialogue copy are localized", () => {
  const source = read("../app/(tabs)/comptage/index.tsx");
  const missing = [];
  for (const match of source.matchAll(/\b(?:title|sub):\s*"((?:\\.|[^"\\])*)"/gu)) {
    const text = JSON.parse('"' + match[1] + '"').trim();
    if (resolveCountingText("hub", text, "ja") === text) missing.push(text);
  }
  for (const match of source.matchAll(/<AppText\b[^>]*>\s*([^<{][^<{}]*)\s*<\/AppText>/gsu)) {
    const text = match[1].replace(/\s+/gu, " ").trim();
    if (/[A-Za-zÀ-ÿ]/u.test(text) && resolveCountingText("hub", text, "ja") === text) missing.push(text);
  }
  for (const text of ["2 inclus", "6 Premium", "2 parcours essentiels",
    "6 parcours Premium · accès actif", "6 parcours Premium à débloquer",
    "Comptage ·", "PARCOURS", "En cours.", "À continuer", "Pour commencer", "Ouvre ce parcours",
    "Ouvre l'accès Premium"]) {
    if (resolveCountingText("hub", text, "ja") === text) missing.push(text);
  }
  for (const text of ["Expressions clés", "ÉCOUTER", "Toucher pour continuer",
    "Toucher pour recommencer l’étape", "Réponse en cours...", "RETOUR",
    "Retour à l’écran précédent", "Revient à l’écran précédent"]) {
    if (resolveCountingText("base", text, "ja") === text) missing.push(text);
  }
  assert.deepEqual(missing, [], "Untranslated hub/shared strings:\n" + missing.join("\n"));
});

test("translations follow actual Korean meaning and do not alter canonical data", () => {
  for (const [module, french, expected] of [
    ["base", "Formes naturelles avec le classificateur des boissons.", "잔"],
    ["sino", "Les trois premiers nombres du système sino-coréen.", "漢数詞"],
    ["heures", "Si (Natif) pour l'heure, Bun (Sino) pour la minute.", "固有数詞"],
    ["prix", "L'unité monétaire de base en Corée. 10 000 won ≈ 7 €.", "万"],
    ["phone", "Argot pour 'Vu' mais pas de réponse (très mal vu !).", "既読スルー"],
    ["dates", "Les mois sont simplement le chiffre + 'Wol'. (Janvier = Il-wol, etc.).", "유월"],
    ["age", "Règle générale civile et administrative fondée sur la date de naissance, avec des exceptions prévues par certaines lois.", "満年齢"],
    ["ordinals", "Nous allons aussi annoncer le deuxième participant.", "1位"],
  ]) {
    assert.ok(resolveCountingText(module, french, "ja").includes(expected), module);
    assert.equal(resolveCountingText(module, french, "fr"), french);
  }
  assert.equal(
    resolveCountingText("dates", "Mon anniversaire est le 24 avril 2026 (I-cheon-yuk-nyeon Sa-wol I-sip-sa-il).", "ja"),
    "私の誕生日は2006年4月24日です."
  .replace(".", "。"));
  assert.equal(resolveCountingText("base", "아메리카노 세 잔 주세요.", "ja"), "아메리카노 세 잔 주세요.");
  assert.equal(resolveCountingText("base", "Hana, Dul, Set", "ja"), "Hana, Dul, Set");
});

test("counting route provider is mounted and audio behavior remains canonical", () => {
  assert.match(read("../app/(tabs)/comptage/_layout.tsx"), /<ContentLocalizationProvider pathname=\{pathname\}>/u);
  assert.match(read("../lib/i18n/ContentLocalizationProvider.tsx"), /resolveCountingText\(scope.module, core, locale, i18n\)/u);
  assert.match(read("../components/comptage/CountingImmersionScreen.tsx"), /playAudio\(nextMessage.audio, nextMessageId\)/u);
  assert.match(read("../components/comptage/CountingImmersionScreen.tsx"), /playRecordedAudio\(exp.audio, cardId\)/u);
  assert.ok(manifest.phase >= 7);
  assert.ok(manifest.japaneseUiNamespaces.includes("counting"));
  assert.ok(!manifest.deferredNamespaces.includes("counting"));
  assert.equal(manifest.japaneseReleaseReady, false);
});
