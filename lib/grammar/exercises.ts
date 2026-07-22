import {
  GRAMMAR_CONCEPTS,
  GRAMMAR_STAGE_BY_ID,
} from "../../data/grammar/index.ts";
import { shuffleArray, type RandomSource } from "../choiceOrder.ts";
import type {
  GrammarConcept,
  GrammarExample,
  GrammarPracticeAnswer,
  GrammarPracticeQuestion,
  GrammarPracticeSession,
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
      .filter(isSimpleSentence)
      .map((example) => ({ concept, example })),
  );
  return candidates[(attemptNumber - 1) % candidates.length];
}

function conceptReason(concept: GrammarConcept, lead: string) {
  return `${lead} ${concept.rule}`;
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

function buildReviewQuestions(
  stageId: GrammarStageId,
  attemptNumber: number,
  random: RandomSource,
): readonly GrammarPracticeQuestion[] {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const offset = Math.max(0, attemptNumber - 1) * 5;
  const concepts = Array.from({ length: 5 }, (_, index) =>
    GRAMMAR_CONCEPTS.find(
      ({ id }) => id === stage.conceptIds[(offset + index * 9) % stage.conceptIds.length],
    ),
  ).filter((concept): concept is GrammarConcept => !!concept);

  return concepts.map((concept, index) => {
    const { scene, scenario } = concept.practice;
    const base = {
      id: `${stageId}:${attemptNumber}:review-${index + 1}`,
      stageId,
      conceptIds: [concept.id],
      phase: "review",
    } as const;
    const seed = `${stageId}:${attemptNumber}:review-${concept.id}`;

    if (index === 2) {
      return {
        ...base,
        kind: "transformation",
        criterion: "M",
        prompt: "Choisis la forme qui exprime précisément cette phrase.",
        display: formatScenario(scenario, "PHRASE À EXPRIMER", scene.french),
        korean: scene.korean,
        french: scene.french,
        options: buildOptions(
          concept.practice.focusForm,
          concept.practice.formDistractors,
          `${seed}:form`,
          random,
        ),
        answer: concept.practice.focusForm,
        explanation: conceptReason(
          concept,
          `Dans cet exemple, la forme ciblée est ${concept.practice.focusForm}.`,
        ),
      };
    }
    if (index === 1) {
      return {
        ...base,
        kind: "choice",
        criterion: "R",
        prompt: "Choisis la phrase coréenne qui exprime exactement la situation.",
        display: formatScenario(scenario, "PHRASE À TRADUIRE", scene.french),
        korean: scene.korean,
        french: scene.french,
        options: buildOptions(
          scene.korean,
          concept.examples.map((example) => example.korean),
          `${seed}:ko`,
          random,
        ),
        answer: scene.korean,
        explanation: conceptReason(
          concept,
          `La phrase attendue est « ${scene.korean} ».`,
        ),
      };
    }
    if (index === 3) {
      return {
        ...base,
        kind: "scene",
        criterion: "P",
        prompt: "Choisis la phrase adaptée à la situation.",
        display: formatScenario(scenario, "PHRASE À EXPRIMER", scene.french),
        korean: scene.korean,
        french: scene.french,
        options: buildOptions(
          scene.korean,
          concept.examples.map((example) => example.korean),
          `${seed}:scene`,
          random,
        ),
        answer: scene.korean,
        explanation: conceptReason(
          concept,
          `Ici, « ${scene.korean} » répond précisément à la situation.`,
        ),
      };
    }
    return {
      ...base,
      kind: "matching",
      criterion: "R",
      prompt: "Choisis la traduction adaptée à cette situation.",
      display: formatScenario(scenario, "PHRASE CORÉENNE", scene.korean),
      korean: scene.korean,
      french: scene.french,
      options: buildOptions(
        scene.french,
        concept.examples.map((example) => example.french),
        `${seed}:fr`,
        random,
      ),
      answer: scene.french,
      explanation: conceptReason(
        concept,
        `« ${scene.korean} » signifie « ${scene.french} ».`,
      ),
    };
  });
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
  if (stage.mode === "review") {
    return buildReviewQuestions(stageId, attemptNumber, random);
  }

  const concepts = getConcepts(stageId);
  const first = getExample(concepts, Math.max(0, attemptNumber - 1));
  const second = getExample(concepts, attemptNumber);
  const formConcept = concepts[(attemptNumber - 1) % concepts.length];
  const sceneConcept = concepts[attemptNumber % concepts.length];
  const order = getOrderSource(concepts, attemptNumber);
  const orderConcept = order.concept;
  const orderSource = order.example;
  const orderTokens = orderSource.korean.split(/\s+/u).filter(Boolean);
  const seed = `${stageId}:${attemptNumber}`;

  const questions: GrammarPracticeQuestion[] = [
    {
      id: `${seed}:meaning-fr`,
      stageId,
      conceptIds: [first.concept.id],
      phase: "manipulation",
      kind: "matching",
      criterion: "R",
      prompt: "Choisis la traduction exacte dans le contexte indiqué.",
      display: formatExample(first.example, "PHRASE CORÉENNE", first.example.korean),
      french: first.example.french,
      korean: first.example.korean,
      options: buildOptions(
        first.example.french,
        [
          ...first.concept.examples.map((example) => example.french),
          first.concept.practice.scene.french,
        ],
        `${seed}:fr`,
        random,
      ),
      answer: first.example.french,
      explanation: conceptReason(
        first.concept,
        `« ${first.example.korean} » signifie « ${first.example.french} ».`,
      ),
      ...(first.example.note ? { memo: first.example.note } : {}),
    },
    {
      id: `${seed}:meaning-ko`,
      stageId,
      conceptIds: [second.concept.id],
      phase: "manipulation",
      kind: "choice",
      criterion: "R",
      prompt: "Choisis la phrase coréenne qui exprime exactement le sens indiqué.",
      display: formatExample(second.example, "PHRASE À TRADUIRE", second.example.french),
      korean: second.example.korean,
      french: second.example.french,
      options: buildOptions(
        second.example.korean,
        [
          ...second.concept.examples.map((example) => example.korean),
          second.concept.practice.scene.korean,
        ],
        `${seed}:ko`,
        random,
      ),
      answer: second.example.korean,
      explanation: conceptReason(
        second.concept,
        `La phrase attendue est « ${second.example.korean} ».`,
      ),
      ...(second.example.note ? { memo: second.example.note } : {}),
    },
    {
      id: `${seed}:form`,
      stageId,
      conceptIds: [formConcept.id],
      phase: "manipulation",
      kind: "transformation",
      criterion: "M",
      prompt: "Choisis la forme qui exprime précisément cette phrase.",
      display: formatScenario(
        formConcept.practice.scenario,
        "PHRASE À EXPRIMER",
        formConcept.practice.scene.french,
      ),
      options: buildOptions(
        formConcept.practice.focusForm,
        formConcept.practice.formDistractors,
        `${seed}:form`,
        random,
      ),
      answer: formConcept.practice.focusForm,
      explanation: conceptReason(
        formConcept,
        `Dans cet exemple, la forme ciblée est ${formConcept.practice.focusForm}.`,
      ),
    },
    orderTokens.length > 1
      ? {
          id: `${seed}:order`,
          stageId,
          conceptIds: [orderConcept.id],
          phase: "manipulation",
          kind: "order",
          criterion: "M",
          prompt: "Remets les éléments dans l’ordre pour former la phrase coréenne indiquée.",
          display: formatExample(orderSource, "PHRASE À FORMER", orderSource.french),
          korean: orderSource.korean,
          french: orderSource.french,
          options: shuffleArray(orderTokens, random),
          answer: orderTokens,
          explanation: conceptReason(
            orderConcept,
            `L’ordre attendu donne « ${orderSource.korean} ».`,
          ),
          ...(orderSource.note ? { memo: orderSource.note } : {}),
        }
      : {
          id: `${seed}:order-fallback`,
          stageId,
          conceptIds: [first.concept.id],
          phase: "manipulation",
          kind: "gap",
          criterion: "M",
          prompt: "Choisis la phrase coréenne qui exprime exactement le sens indiqué.",
          display: formatExample(first.example, "PHRASE À TRADUIRE", first.example.french),
          options: buildOptions(
            first.example.korean,
            [
              ...first.concept.examples.map((example) => example.korean),
              first.concept.practice.scene.korean,
            ],
            `${seed}:gap`,
            random,
          ),
          answer: first.example.korean,
          explanation: conceptReason(
            first.concept,
            `La phrase complète est « ${first.example.korean} ».`,
          ),
        },
    {
      id: `${seed}:context`,
      stageId,
      conceptIds: [sceneConcept.id],
      phase: "production",
      kind: "scene",
      criterion: "P",
      prompt: "Choisis l’unique phrase coréenne adaptée à la situation.",
      display: formatScenario(
        sceneConcept.practice.scenario,
        "PHRASE À EXPRIMER",
        sceneConcept.practice.scene.french,
      ),
      korean: sceneConcept.practice.scene.korean,
      french: sceneConcept.practice.scene.french,
      options: buildOptions(
        sceneConcept.practice.scene.korean,
        sceneConcept.examples.map((example) => example.korean),
        `${seed}:context`,
        random,
      ),
      answer: sceneConcept.practice.scene.korean,
      explanation: conceptReason(
        sceneConcept,
        `Dans cette situation, la réponse naturelle est « ${sceneConcept.practice.scene.korean} ».`,
      ),
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
