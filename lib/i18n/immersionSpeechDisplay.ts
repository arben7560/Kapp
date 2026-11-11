import type { SpeechRecognitionStatus } from "../speechRecognitionState.ts";
import type { AppLocale } from "./config.ts";

/**
 * Safety net for the spoken turn only (Café, Métro, Restaurant, Aéroport).
 * Canonical Korean transcripts and speech evaluation never go through here.
 * The scene-specific Japanese catalogue remains authoritative when present.
 */
const FRENCH_PROSE_PATTERN =
  /\b(?:je|j’ai|j'|tu|ta|tes|ton|vous|votre|ici|c’est|ce|cette|mais|pour|choisis|garde|essaie|réessaie|réécoute|réponse|phrase|transcription|comprends|compris|utilise|demande|veux|parles|reconnaissance|l’agent|l'agent|encore|plutôt|parce|avant|après|manque|correcte|correction)\b/iu;
const LATIN_PATTERN = /[A-Za-zÀ-ÿ]/u;
const JAPANESE_PATTERN = /[\u3040-\u30ff\u3400-\u9fff]/u;

const JAPANESE_RECOGNITION_FALLBACKS: Partial<
  Record<SpeechRecognitionStatus, string>
> = {
  "permission-denied":
    "マイクへのアクセスが許可されていません。端末の設定で許可するか、「ヒント」を使って進めてください。",
  unavailable:
    "この端末では音声認識を利用できません。「ヒント」から回答例を確認してください。",
  empty:
    "音声を聞き取れませんでした。もう一度話すか、回答例を表示してください。",
  error:
    "音声認識で問題が発生しました。もう一度話すか、回答例を表示してください。",
};

const JAPANESE_FEEDBACK_FALLBACK =
  "今の返答の表現をもう一度確認してみましょう。必要ならヒントを開いて、回答例を確認できます。";

/**
 * Reject unknown French feedback (including partially translated sentences)
 * without guessing whether the learner's Korean answer was right or wrong.
 * Only the displayed message is affected, never the original transcript.
 */
export function resolveImmersionSpeechDisplay(
  source: string | null,
  translated: string | null,
  locale: AppLocale,
  context: "feedback" | SpeechRecognitionStatus,
): string | null {
  if (source === null) return null;
  if (locale === "fr") return source;

  if (typeof translated === "string" && translated.trim()) {
    const hasFrenchProse = FRENCH_PROSE_PATTERN.test(translated);
    const isLocalized =
      translated !== source ||
      !LATIN_PATTERN.test(translated) ||
      JAPANESE_PATTERN.test(translated);
    if (isLocalized && !hasFrenchProse) return translated;
  }

  // A Korean-only response (or a prelocalized Japanese message) is not French.
  // Do not alter any Korean text that the speech engine legitimately provided.
  if (!LATIN_PATTERN.test(source) && !FRENCH_PROSE_PATTERN.test(source)) {
    return source;
  }
  if (JAPANESE_PATTERN.test(source) && !FRENCH_PROSE_PATTERN.test(source)) {
    return source;
  }

  return context === "feedback"
    ? JAPANESE_FEEDBACK_FALLBACK
    : JAPANESE_RECOGNITION_FALLBACKS[context] ??
        "音声認識の状態を確認できませんでした。もう一度お試しください。";
}
