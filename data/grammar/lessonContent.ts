import { GRAMMAR_CONCEPTS_BY_ID } from "./concepts.ts";
import { GRAMMAR_STAGE_BY_ID } from "./stages.ts";
import type { GrammarExample, GrammarStageId } from "./types.ts";

export function getGrammarLessonExamples(
  stageId: GrammarStageId,
  supportingLimit = 3,
): readonly GrammarExample[] {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const seenKorean = new Set<string>();
  const examples: GrammarExample[] = [];

  for (const example of stage.canonicalExamples) {
    const key = example.korean.trim();
    if (seenKorean.has(key)) continue;
    seenKorean.add(key);
    examples.push(example);
  }

  let supportingCount = 0;
  for (const conceptId of stage.conceptIds) {
    for (const example of GRAMMAR_CONCEPTS_BY_ID[conceptId].examples) {
      const key = example.korean.trim();
      if (seenKorean.has(key)) continue;
      seenKorean.add(key);
      if (supportingCount >= supportingLimit) continue;
      examples.push(example);
      supportingCount += 1;
    }
  }

  return examples;
}

