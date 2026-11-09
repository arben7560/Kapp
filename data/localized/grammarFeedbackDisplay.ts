import type {
  GrammarPracticeAnswer,
  GrammarPracticeQuestion,
} from "../grammar/types.ts";
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
  if (Array.isArray(selected)) {
    // Only the first lesson has an ordering task; explain the actual placement.
    if (stageId !== "sentence-structure" || !Array.isArray(question.answer)) return undefined;
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
