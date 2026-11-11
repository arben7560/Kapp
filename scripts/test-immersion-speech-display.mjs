import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { resolveImmersionText } = await import("../lib/i18n/immersionText.ts");
const { resolveImmersionSpeechDisplay } = await import("../lib/i18n/immersionSpeechDisplay.ts");

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const modules = ["cafe", "metro", "restaurant", "aeroport"];

const display = (module, source, context = "feedback", locale = "ja") =>
  resolveImmersionSpeechDisplay(
    source,
    source === null ? null : resolveImmersionText(module, source, locale),
    locale,
    context,
  );

test("Known voice pedagogical messages remain specific and preserve Korean in all four scenes", () => {
  const samples = [
    ["cafe", "Tu as cité plusieurs produits. Garde seulement celui que tu veux commander."],
    ["metro", "Tu as cité la ligne 3. Pour aller vers Gangnam dans cette scène, c’est la ligne 2 : demande où prendre « 2호선 » vers Gangnam."],
    ["restaurant", "Pour indiquer le moyen utilisé, « (으)로 » correspond ici à « avec/par ». Dis : « 카드로 할게요. »"],
    ["aeroport", "Tu as cité plusieurs repères d’étage (1층 et 지하 2층). Dans cette scène, l’agent a indiqué « 지하 1층 », le sous-sol 1. Garde un seul repère après une éventuelle auto-correction."],
  ];
  for (const [module, source] of samples) {
    const existing = resolveImmersionText(module, source, "ja");
    assert.notEqual(existing, source, "Missing existing copy " + module);
    const safe = display(module, source);
    assert.equal(safe, existing, "Existing Japanese teaching feedback changed for " + module);
    assert.match(safe, /[\u3040-\u30ff\u3400-\u9fff]/u);
    for (const match of source.matchAll(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/gu)) {
      assert.ok(safe.includes(match[0]), "Korean fragment lost in " + module);
    }
  }
});

test("New or unmatched French voice feedback gets a neutral Japanese-only display", () => {
  const novel = "J’ai compris ta réponse, mais ce mot inédit ne convient pas ici. Réessaie : « 먹고 갈게요. »";
  for (const module of modules) {
    assert.equal(resolveImmersionText(module, novel, "ja"), novel);
    const safe = display(module, novel);
    assert.match(safe, /今の返答の表現/u);
    assert.doesNotMatch(safe, /J’ai|compr[ei]|mais|Réessaie|convient|inédit/u);
    assert.equal(display(module, novel, "feedback", "fr"), novel);
  }
});

test("Mixed Japanese and residual French is never shown as an incomplete translation", () => {
  const source = "Ta réponse est ambiguë. Essaie de répondre simplement.";
  const partiallyTranslated = "答えを確認しましょう。 Ici, tu dois répondre à la question.";
  const result = resolveImmersionSpeechDisplay(source, partiallyTranslated, "ja", "feedback");
  assert.match(result, /今の返答の表現/u);
  assert.doesNotMatch(result, /Ici|tu|répondre|question/u);
  // Japanese text already authored on the native side is not treated as French.
  assert.equal(
    resolveImmersionSpeechDisplay("音声認識に失敗しました。", "音声認識に失敗しました。", "ja", "error"),
    "音声認識に失敗しました。",
  );
});

test("Recognizer and platform failures retain Japanese guidance without inventing evaluation", () => {
  for (const module of modules) {
    for (const [status, original, expected] of [
      ["permission-denied", "Permission to record was blocked by the operating system.", "マイクへのアクセス"],
      ["unavailable", "Speech API unavailable on this device.", "音声認識を利用"],
      ["empty", "No speech heard. Réessaie.", "音声を聞き取れませんでした"],
      ["error", "Unknown error while starting microphone.", "音声認識で問題"],
    ]) {
      const safe = display(module, original, status);
      assert.ok(safe.includes(expected), module + " / " + status + ": " + safe);
      assert.doesNotMatch(safe, /Permission|Speech API|No speech|Unknown error|Réessaie/u);
    }
  }
  assert.equal(resolveImmersionSpeechDisplay(null, null, "ja", "error"), null);
  assert.equal(resolveImmersionSpeechDisplay(null, null, "fr", "feedback"), null);
  assert.equal(resolveImmersionSpeechDisplay("먹고 갈게요.", "먹고 갈게요.", "ja", "feedback"), "먹고 갈게요.");
  assert.equal(resolveImmersionSpeechDisplay("카드로 할게요.", "카드로 할게요.", "ja", "feedback"), "카드로 할게요.");
});

test("Standard speech-recognition failure copy still resolves via the established Japanese catalogues", () => {
  const standard = [
    "L’accès au micro a été refusé. Tu peux autoriser le micro dans les réglages ou utiliser « Besoin d’aide ».",
    "La reconnaissance vocale n’est pas disponible sur cet appareil ou ce navigateur. Utilise « Besoin d’aide » pour continuer.",
    "Aucune parole n’a été reconnue. Réessaie ou affiche les réponses proposées.",
    "La reconnaissance vocale a rencontré un problème. Réessaie ou utilise les réponses proposées.",
  ];
  for (const module of modules) for (const source of standard) {
    const translation = resolveImmersionText(module, source, "ja");
    assert.notEqual(translation, source, "Standard ASR translation missing: " + module + " / " + source);
    const safe = display(module, source, "error");
    assert.equal(safe, translation, "Existing ASR diagnosis replaced: " + module);
  }
});

test("The common GuidedSpeechTurn protects all four scene outputs without touching speech engines", () => {
  const component = read("../components/GuidedSpeechTurn.tsx");
  assert.ok(component.includes('useTranslation("immersion")'));
  assert.ok(component.includes('resolveImmersionSpeechDisplay('));
  assert.ok(component.includes("japanese"));
  assert.ok(component.includes('feedback ? "feedback" : speechState.status'));
  assert.ok(component.includes("humanizeCafeSpeechFeedback(feedback)"));
  assert.ok(component.includes("{speechState.transcript}"), "Transcripts must stay raw Korean");
  for (const scene of ["cafeIA", "metroIA", "restaurantIA", "aeroportIA"]) {
    const page = read("../app/lesson/" + scene + ".tsx");
    assert.ok(page.includes("<GuidedSpeechTurn"), scene + ": common voice UI not used");
    assert.ok(page.includes('ContentLocalizationProvider pathname="/lesson/' + scene + '"'), scene);
  }
});
