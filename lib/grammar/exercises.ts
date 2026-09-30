import {
  GRAMMAR_CONCEPTS,
  GRAMMAR_STAGE_BY_ID,
} from "../../data/grammar/index.ts";
import { GRAMMAR_VOCABULARY_HINTS_10_TO_19 } from "../../data/grammar/vocabularyHints10to19.ts";
import { shuffleArray, type RandomSource } from "../choiceOrder.ts";
import type {
  GrammarConcept,
  GrammarExample,
  GrammarPracticeAnswer,
  GrammarPracticeDrill,
  GrammarPracticeQuestion,
  GrammarPracticeSession,
  GrammarPracticeSkill,
  GrammarConceptId,
  GrammarStageId,
} from "../../data/grammar/types";
import { toIsoTimestamp, type TimestampInput } from "./progress.ts";

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function rotate<T>(values: readonly T[], amount: number): T[] {
  if (values.length === 0) return [];
  const offset = amount % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function buildOptions(
  answer: string,
  candidates: readonly string[],
  seed: string,
  random: RandomSource,
): string[] {
  const distractors = rotate(
    unique(candidates).filter((candidate) => candidate !== answer),
    hash(seed),
  ).slice(0, 3);
  return shuffleArray(unique([answer, ...distractors]), random);
}

function getConcepts(stageId: GrammarStageId): GrammarConcept[] {
  return GRAMMAR_STAGE_BY_ID[stageId].conceptIds.map((conceptId) => {
    const concept = GRAMMAR_CONCEPTS.find((item) => item.id === conceptId);
    if (!concept) {
      throw new RangeError(`Unknown grammar concept: ${conceptId}`);
    }
    return concept;
  });
}

function getExample(
  concepts: readonly GrammarConcept[],
  index: number,
) {
  const examples = concepts.flatMap((concept) =>
    concept.examples.map((example) => ({ concept, example })),
  );
  return examples[index % examples.length];
}

function isSimpleSentence(example: GrammarExample): boolean {
  if (example.format === "dialogue" || /[\r\n]/u.test(example.korean)) return false;
  return (example.korean.match(/[.!?]/gu) ?? []).length <= 1;
}

function getOrderSource(
  concepts: readonly GrammarConcept[],
  attemptNumber: number,
) {
  const candidates = concepts.flatMap((concept) =>
    concept.examples
      .filter(
        (example) =>
          isSimpleSentence(example) &&
          example.korean.split(/\s+/u).filter(Boolean).length > 1,
      )
      .map((example) => ({ concept, example })),
  );
  if (candidates.length === 0) return undefined;
  return candidates[(attemptNumber - 1) % candidates.length];
}

function formatPromptBlock(
  context: string | undefined,
  label: string,
  phrase: string,
) {
  return `${context ? `${context}\n\n` : ""}${label}\n« ${phrase} »`;
}

function formatScenario(scenario: string, label: string, phrase: string) {
  return formatPromptBlock(`CONTEXTE\n${scenario}`, label, phrase);
}

function formatExample(
  example: GrammarExample,
  label: string,
  phrase: string,
) {
  return formatPromptBlock(example.note, label, phrase);
}

function getConcept(conceptId: GrammarConceptId): GrammarConcept {
  const concept = GRAMMAR_CONCEPTS.find(({ id }) => id === conceptId);
  if (!concept) throw new RangeError(`Unknown grammar concept: ${conceptId}`);
  return concept;
}

function resolveDrillVocabulary(drill: GrammarPracticeDrill) {
  return GRAMMAR_VOCABULARY_HINTS_10_TO_19[drill.id] ?? drill.vocabulary;
}

function buildDrillQuestion(
  stageId: GrammarStageId,
  attemptNumber: number,
  concept: GrammarConcept,
  drill: GrammarPracticeDrill,
  index: number,
  phase: "manipulation" | "review",
  random: RandomSource,
): GrammarPracticeQuestion {
  const seed = `${stageId}:${attemptNumber}:drill-${concept.id}-${drill.id}`;
  const options = drill.kind === "order"
    ? shuffleArray(drill.answer, random)
    : buildOptions(drill.answer, drill.distractors, seed, random);
  const vocabulary = resolveDrillVocabulary(drill);
  return {
    id: `${seed}-${index + 1}`,
    stageId,
    conceptIds: [concept.id],
    phase,
    kind: drill.kind,
    criterion: drill.kind === "scene" ? "P" : drill.kind === "choice" ? "R" : "M",
    prompt: `${drill.prompt}\nObjectif : ${concept.shortFunction}`,
    display: drill.context
      ? formatScenario(drill.context, drill.displayLabel, drill.stimulus)
      : formatPromptBlock(undefined, drill.displayLabel, drill.stimulus),
    options,
    answer: drill.answer,
    explanation: drill.explanation,
    skill: drill.skill,
    ...(drill.ruleAspect ? { ruleAspect: drill.ruleAspect } : {}),
    ...(drill.contrastFamily ? { contrastFamily: drill.contrastFamily } : {}),
    ...(drill.exerciseGroup ? { exerciseGroup: drill.exerciseGroup } : {}),
    ...(vocabulary ? { vocabulary } : {}),
  };
}
