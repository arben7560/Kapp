import type { Voice } from "expo-speech";

function normalizeLanguage(language: string) {
  return language.trim().replace(/_/g, "-").toLowerCase();
}

/** Only accept identifiable Korean voices. Prefer enhanced quality, then ko-KR. */
export function selectKoreanReviewVoice<T extends Pick<Voice, "identifier" | "language" | "quality">>(
  voices: readonly T[],
): T | undefined {
  const candidates = voices.filter((voice) => {
    const language = normalizeLanguage(voice.language);
    return Boolean(voice.identifier.trim()) && (language === "ko" || language === "ko-kr");
  });
  return candidates.sort((a, b) => {
    const quality = Number(b.quality === "Enhanced") - Number(a.quality === "Enhanced");
    const locale = Number(normalizeLanguage(b.language) === "ko-kr") -
      Number(normalizeLanguage(a.language) === "ko-kr");
    return quality || locale;
  })[0];
}

/** Review audio must speak the Korean text, not a romanization or translation. */
export function hasKoreanReviewText(text: string) {
  return /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7a3]/u.test(text);
}
