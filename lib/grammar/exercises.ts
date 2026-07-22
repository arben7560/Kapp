import {
  GRAMMAR_CONCEPTS,
  GRAMMAR_STAGE_BY_ID,
} from "../../data/grammar/index.ts";
import { shuffleArray, type RandomSource } from "../choiceOrder.ts";
import type {
  GrammarConcept,
  GrammarPracticeAnswer,
  GrammarPracticeQuestion,
  GrammarPracticeSession,
  GrammarStageId,
} from "../../data/grammar/types";
import { toIsoTimestamp, type TimestampInput } from "./progress.ts";

const GLOBAL_EXAMPLES = GRAMMAR_CONCEPTS.flatMap((concept) =>
  concept.examples.map((example) => ({ concept, example })),
);

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

function explanationFor(concept: GrammarConcept, memo?: string) {
  return memo
    ? `${concept.form} — ${concept.shortFunction} ${memo}`
    : `${concept.form} — ${concept.shortFunction}`;
}

export function areGrammarAnswersEqual(
  answer: GrammarPracticeAnswer,
  expected: GrammarPracticeAnswer,
): boolean {
  if (Array.isArray(answer) || Array.isArray(expected)) {
    return (
      Array.isArray(answer) &&
      Array.isArray(expected) &&
      answer.length === expected.length &&
      answer.every((value, index) => value === expected[index])
    );
  }
  return answer === expected;
}

export function buildGrammarPracticeQuestions(
  stageId: GrammarStageId,
  attemptNumber = 1,
  random: RandomSource = Math.random,
): readonly GrammarPracticeQuestion[] {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const concepts = getConcepts(stageId);
  const first = getExample(concepts, Math.max(0, attemptNumber - 1));
  const second = getExample(concepts, attemptNumber);
  const formConcept = concepts[(attemptNumber - 1) % concepts.length];
  const orderSource = stage.canonicalExamples[0] ?? first.example;
  const orderTokens = orderSource.korean.split(/\s+/u).filter(Boolean);
  const koreanCandidates = GLOBAL_EXAMPLES.map(({ example }) => example.korean);
  const frenchCandidates = GLOBAL_EXAMPLES.map(({ example }) => example.french);
  const formCandidates = GRAMMAR_CONCEPTS.map((concept) => concept.form);
  const seed = `${stageId}:${attemptNumber}`;

  const questions: GrammarPracticeQuestion[] = [
    {
      id: `${seed}:meaning-ko`,
      stageId,
      conceptIds: [first.concept.id],
      phase: "manipulation",
      kind: "choice",
      criterion: "R",
      prompt: "Choisis la phrase coréenne qui correspond.",
      display: first.example.french,
      french: first.example.french,
      korean: first.example.korean,
      options: buildOptions(first.example.korean, koreanCandidates, `${seed}:ko`, random),
      answer: first.example.korean,
      explanation: explanationFor(first.concept, first.example.note),
      ...(first.example.note ? { memo: first.example.note } : {}),
    },
    {
      id: `${seed}:meaning-fr`,
      stageId,
      conceptIds: [second.concept.id],
      phase: "manipulation",
      kind: "matching",
      criterion: "R",
      prompt: "Retrouve le sens de cette phrase.",
      display: second.example.korean,
      korean: second.example.korean,
      french: second.example.french,
      options: buildOptions(second.example.french, frenchCandidates, `${seed}:fr`, random),
      answer: second.example.french,
      explanation: explanationFor(second.concept, second.example.note),
      ...(second.example.note ? { memo: second.example.note } : {}),
    },
    {
      id: `${seed}:form`,
      stageId,
      conceptIds: [formConcept.id],
      phase: "manipulation",
      kind: "transformation",
      criterion: "M",
      prompt: "Quelle forme sert à exprimer cette intention ?",
      display: formConcept.shortFunction,
      options: buildOptions(formConcept.form, formCandidates, `${seed}:form`, random),
      answer: formConcept.form,
      explanation: explanationFor(formConcept),
    },
    orderTokens.length > 1
      ? {
          id: `${seed}:order`,
          stageId,
          conceptIds: stage.conceptIds,
          phase: "manipulation",
          kind: "order",
          criterion: "M",
          prompt: "Remets les éléments dans l’ordre coréen.",
          display: orderSource.french,
          korean: orderSource.korean,
          french: orderSource.french,
          options: shuffleArray(orderTokens, random),
          answer: orderTokens,
          explanation: `En coréen, le prédicat vient à la fin : ${orderSource.korean}`,
          ...(orderSource.note ? { memo: orderSource.note } : {}),
        }
      : {
          id: `${seed}:order-fallback`,
          stageId,
          conceptIds: [first.concept.id],
          phase: "manipulation",
          kind: "gap",
          criterion: "M",
          prompt: "Complète l’idée avec la bonne phrase.",
          display: first.example.french,
          options: buildOptions(first.example.korean, koreanCandidates, `${seed}:gap`, random),
          answer: first.example.korean,
          explanation: explanationFor(first.concept, first.example.note),
        },
    {
      id: `${seed}:context`,
      stageId,
      conceptIds: [second.concept.id],
      phase: "production",
      kind: "scene",
      criterion: "P",
      prompt: "Dans cette situation, quelle réponse est la plus naturelle ?",
      display: second.example.french,
      korean: second.example.korean,
      french: second.example.french,
      options: buildOptions(second.example.korean, koreanCandidates, `${seed}:context`, random),
      answer: second.example.korean,
      explanation: explanationFor(second.concept, second.example.note),
      ...(second.example.note ? { memo: second.example.note } : {}),
    },
  ];

  return questions;
}

export function createGrammarPracticeSession(
  stageId: GrammarStageId,
  attemptNumber: number,
  startedAt: TimestampInput = Date.now(),
): GrammarPracticeSession {
  const startedAtIso = toIsoTimestamp(startedAt);
  return {
    id: `${stageId}:${startedAtIso}:${attemptNumber}`,
    stageId,
    attemptNumber,
    questions: buildGrammarPracticeQuestions(stageId, attemptNumber),
    questionIndex: 0,
    responses: [],
    score: 0,
    startedAt: startedAtIso,
  };
}

export function answerGrammarPracticeQuestion(
  session: GrammarPracticeSession,
  answer: GrammarPracticeAnswer,
): GrammarPracticeSession {
  if (session.completedAt) return session;
  const question = session.questions[session.questionIndex];
  if (!question || session.responses.some((item) => item.questionId === question.id)) {
    return session;
  }
  const correct = areGrammarAnswersEqual(answer, question.answer);
  return {
    ...session,
    responses: [...session.responses, { questionId: question.id, answer, correct }],
    draftAnswer: answer,
    score: session.score + (correct ? 1 : 0),
  };
}

export function setGrammarPracticeDraft(
  session: GrammarPracticeSession,
  answer: GrammarPracticeAnswer,
): GrammarPracticeSession {
  if (session.completedAt) return session;
  const question = session.questions[session.questionIndex];
  if (!question || session.responses.some((item) => item.questionId === question.id)) {
    return session;
  }
  return { ...session, draftAnswer: answer };
}

export function advanceGrammarPracticeSession(
  session: GrammarPracticeSession,
  completedAt: TimestampInput = Date.now(),
): GrammarPracticeSession {
  if (session.completedAt) return session;
  const question = session.questions[session.questionIndex];
  if (!question || !session.responses.some((item) => item.questionId === question.id)) {
    return session;
  }
  if (session.questionIndex < session.questions.length - 1) {
    return {
      ...session,
      questionIndex: session.questionIndex + 1,
      draftAnswer: undefined,
    };
  }
  return { ...session, completedAt: toIsoTimestamp(completedAt) };
}
