import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { selectKoreanReviewVoice, hasKoreanReviewText } from "../lib/koreanReviewVoice.ts";

const voice = (identifier, language, quality = "Default") => ({ identifier, language, quality });

test("review selects only Korean voices and prefers enhanced quality", () => {
  const voices = [
    voice("en", "en-US", "Enhanced"),
    voice("ja", "ja-JP", "Enhanced"),
    voice("kr-standard", "ko-KR"),
    voice("kr-enhanced", "ko_KR", "Enhanced"),
  ];
  assert.equal(selectKoreanReviewVoice(voices)?.identifier, "kr-enhanced");
  assert.equal(voices[0].identifier, "en");
});

test("generic Korean voices are accepted, never foreign or missing identifiers", () => {
  assert.equal(selectKoreanReviewVoice([voice("ko", "ko")])?.identifier, "ko");
  assert.equal(selectKoreanReviewVoice([voice("", "ko-KR"), voice("fr", "fr-FR")]), undefined);
  assert.equal(selectKoreanReviewVoice([]), undefined);
});

test("exact Korean locale breaks equal-quality ties", () => {
  assert.equal(selectKoreanReviewVoice([voice("ko", "ko"), voice("kr", "ko-KR")])?.identifier, "kr");
});

test("review requires Hangul, allows Korean phrases with numbers and punctuation", () => {
  assert.equal(hasKoreanReviewText("먹고 갈게요."), true);
  assert.equal(hasKoreanReviewText("삼겹살 2인분 주세요."), true);
  assert.equal(hasKoreanReviewText("meog go gaelkeyo"), false);
  assert.equal(hasKoreanReviewText("À emporter."), false);
});

test("all four vocal reviews use the strict playback entry point", () => {
  for (const path of [
    "components/cafe/CafeConversationSummaryModal.tsx",
    "components/metro/MetroConversationSummaryModal.tsx",
    "components/aeroport/AeroportConversationSummaryModal.tsx",
    "app/lesson/restaurantIA.tsx",
  ]) {
    const source = readFileSync(new URL("../" + path, import.meta.url), "utf8");
    assert.match(source, /playKoreanReviewPhrase\(/u, path);
    assert.doesNotMatch(source, /Speech\.speak\(/u, path);
  }
});
