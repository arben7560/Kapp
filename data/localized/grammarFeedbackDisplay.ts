import type {
  GrammarPracticeAnswer,
  GrammarPracticeQuestion,
} from "../grammar/types.ts";
import { getJapaneseA1ReviewFeedback } from "./grammarReviewJapanese.ts";
import {
  JAPANESE_GRAMMAR_WRONG_FEEDBACK,
  JAPANESE_GRAMMAR_CORRECT_FEEDBACK,
} from "./grammarFeedbackJapanese.ts";

/**
 * Localize the already-computed feedback only when rendering it. Never use
 * translated feedback or labels to decide whether an answer is correct.
 * Distractor explanations are keyed by stable drill ID + Korean answer.
 */
export function getJapaneseGrammarFeedback(
  question: GrammarPracticeQuestion,
  selected: GrammarPracticeAnswer,
  correct: boolean,
): string | undefined {
  if (question.stageId === "a1-validation")
    return getJapaneseA1ReviewFeedback(question, selected, correct);
  const stageId = question.stageId as keyof typeof JAPANESE_GRAMMAR_CORRECT_FEEDBACK;
  const correctByDrill = JAPANESE_GRAMMAR_CORRECT_FEEDBACK[stageId];
  const wrongByDrill = JAPANESE_GRAMMAR_WRONG_FEEDBACK[stageId];
  if (!correctByDrill || !wrongByDrill) return undefined;

  const drillId = Object.keys(correctByDrill).find((candidate) =>
    question.id.includes(`-${candidate}-`),
  );
  if (!drillId) return undefined;
  if (correct) {
    return (correctByDrill as Record<string, string>)[drillId];
  }
  if (typeof selected !== "string") {
    if (!Array.isArray(selected) || !Array.isArray(question.answer)) return undefined;
    // Stage 29 is also a canonical order task. Explain its actual ordering
    // only in the Japanese display layer; do not touch answer evaluation.
    if (stageId === "limit-request" && drillId === "one-only-order") {
      const words = selected.map((part) => part.replace(/[.!?]+$/u, ""));
      const expected = question.answer.map((part) => part.replace(/[.!?]+$/u, ""));
      const chosen = `「${words.join(" ")}.」`;
      const [time, quantity, verb] = expected;
      if (words.indexOf(verb) !== words.length - 1) {
        return `${chosen} は「あります」の ${verb} が文末にありません。場所や時点 ${time} と数量 ${quantity} の後に置きましょう。`;
      }
      if (words.indexOf(quantity) !== 1) {
        return `${chosen} では、限定する数量 ${quantity} の位置に注目しましょう。「今」${time} の後、述語 ${verb} の前に置きます。`;
      }
      return `${chosen} を見直しましょう。この練習では ${time} → ${quantity} → ${verb} の順です。`;
    }
    // Stage one: explain the actual verb position, not the score.
    if (stageId !== "sentence-structure") return undefined;
    const words = selected.map((word) => word.replace(/[.!?]+$/u, ""));
    const expected = question.answer.map((word) => word.replace(/[.!?]+$/u, ""));
    const verb = expected[expected.length - 1];
    const position = words.indexOf(verb);
    const chosen = `「${words.join(" ")}.」`;
    if (position === 0) {
      return `${chosen} では動詞 ${verb} が先頭に来ています。この練習では、話題と目的語の後に動詞を置きましょう。`;
    }
    if (position > 0 && position < words.length - 1) {
      return `${chosen} では動詞 ${verb} の後ろにも語が続いています。基本語順では動詞を最後に置きます。`;
    }
    if (position === words.length - 1 && words[0] !== expected[0]) {
      return `${chosen} は動詞が最後ですが、話題 ${expected[0]} と目的語 ${expected[1]} の順が逆です。この練習では基本語順にしましょう。`;
    }
    return `${chosen} の語順をもう一度確認しましょう。ここでは話題→目的語→動詞の順に並べます。`;
  }
  return (
    (wrongByDrill as Record<string, Record<string, string>>)[drillId]?.[selected]
  );
}

/**
 * Safe Japanese-only fallback for a missing / older drill feedback entry.
 * Keep the specific correction whenever it exists. If the canonical
 * explanation has a proven Japanese display translation, reuse it;
 * never expose the French source explanation as the fallback.
 */
export function getJapaneseGrammarFeedbackOrFallback(
  question: GrammarPracticeQuestion,
  selected: GrammarPracticeAnswer,
  correct: boolean,
  localizedExplanation?: string,
): string {
  const specific = getJapaneseGrammarFeedback(question, selected, correct);
  if (typeof specific === "string" && specific.trim()) return specific;

  const explanation =
    localizedExplanation &&
    localizedExplanation !== question.explanation &&
    /[\u3040-\u30ff\u3400-\u9fff]/u.test(localizedExplanation)
      ? localizedExplanation
      : undefined;

  if (correct) {
    return explanation
      ? `正解です。${explanation}`
      : "正解です。答えの意味や形を確認して、次の問題に進みましょう。";
  }

  if (Array.isArray(selected)) {
    return explanation
      ? `正しい語順を確認しましょう。${explanation}`
      : "正解の文と比べて、語句の並び方をもう一度確認しましょう。";
  }

  return explanation
    ? `正解と見比べてみましょう。${explanation}`
    : "正解と見比べて、文の意味や形の違いを確認しましょう。";
}
