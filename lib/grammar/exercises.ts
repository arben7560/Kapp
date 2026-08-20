import {
  GRAMMAR_CONCEPTS,
  GRAMMAR_STAGE_BY_ID,
} from "../../data/grammar/index.ts";
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
  };
}

function getInterleavedDrills(
  concepts: readonly GrammarConcept[],
  attemptNumber: number,
) {
  if (concepts.some(({ practice }) => practice.drills.length < 5)) return [];

  const pools = concepts.map((concept) => ({
    concept,
    drills: rotate(concept.practice.drills, Math.max(0, attemptNumber - 1)),
  }));
  const result: { concept: GrammarConcept; drill: GrammarPracticeDrill }[] = [];
  const maximum = Math.max(...pools.map(({ drills }) => drills.length));

  for (let drillIndex = 0; drillIndex < maximum; drillIndex += 1) {
    for (const pool of pools) {
      const drill = pool.drills[drillIndex];
      if (drill) result.push({ concept: pool.concept, drill });
    }
  }
  return result;
}

const REVIEW_SECTIONS: readonly {
  skill: GrammarPracticeSkill;
  count: number;
  conceptIds: readonly GrammarConceptId[];
}[] = [
  {
    skill: "particles",
    count: 3,
    conceptIds: [
      "topic-eun-neun",
      "object-eul-reul",
      "action-location-eseo",
      "destination-time-e",
      "direction-means-ro-euro",
      "subject-i-ga",
    ],
  },
  {
    skill: "conjugation",
    count: 3,
    conceptIds: ["present-a-eoyo", "past-ass-eosseoyo", "future-eul-geoyeyo"],
  },
  {
    skill: "modality",
    count: 1,
    conceptIds: ["request-v-a-eo-juseyo", "polite-instruction-euseyo"],
  },
  {
    skill: "modality",
    count: 1,
    conceptIds: [
      "negation-an",
      "inability-mot",
      "ability-eul-su-isseoyo",
      "permission-a-eodo-dwaeyo",
      "obligation-a-eoya-haeyo",
      "suggestion-eulkkayo",
    ],
  },
  {
    skill: "connectors",
    count: 2,
    conceptIds: ["sequence-go", "reason-a-eoseo", "contrast-jiman", "condition-eumyeon"],
  },
  {
    skill: "register",
    count: 1,
    conceptIds: ["polite-style-yo", "possession-ui-je-nae", "honorific-si"],
  },
  {
    skill: "syntax",
    count: 1,
    conceptIds: ["comparison-boda-deo-jeil"],
  },
] as const;

function buildReviewQuestions(
  stageId: GrammarStageId,
  attemptNumber: number,
  random: RandomSource,
): readonly GrammarPracticeQuestion[] {
  const questions: GrammarPracticeQuestion[] = [];
  let questionIndex = 0;

  for (const [sectionIndex, section] of REVIEW_SECTIONS.entries()) {
    for (let localIndex = 0; localIndex < section.count; localIndex += 1) {
      const concept = getConcept(
        section.conceptIds[
          (Math.max(0, attemptNumber - 1) + localIndex) % section.conceptIds.length
        ],
      );
      const matchingDrills = concept.practice.drills.filter(
        ({ skill }) => skill === section.skill,
      );
      if (matchingDrills.length === 0) {
        throw new RangeError(`Missing ${section.skill} review drill for ${concept.id}`);
      }
      const drill = matchingDrills[
        (Math.max(0, attemptNumber - 1) + localIndex + sectionIndex) %
          matchingDrills.length
      ];
      questions.push(
        buildDrillQuestion(
          stageId,
          attemptNumber,
          concept,
          drill,
          questionIndex,
          "review",
          random,
        ),
      );
      questionIndex += 1;
    }
  }

  return questions;
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
  const drillEntries = getInterleavedDrills(concepts, attemptNumber);
  if (drillEntries.length >= 5) {
    return drillEntries
      .slice(0, 5)
      .map(({ concept, drill }, index) =>
        buildDrillQuestion(
          stageId,
          attemptNumber,
          concept,
          drill,
          index,
          "manipulation",
          random,
        ),
      );
  }

  const first = getExample(concepts, Math.max(0, attemptNumber - 1));
  const second = getExample(concepts, attemptNumber);
  const formConcept = concepts[(attemptNumber - 1) % concepts.length];
  const sceneConcept = concepts[attemptNumber % concepts.length];
  const order = getOrderSource(concepts, attemptNumber);
  const orderTokens = order?.example.korean.split(/\s+/u).filter(Boolean) ?? [];
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
      explanation: `Ici, « ${first.example.korean} » signifie « ${first.example.french} ».`,
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
      explanation: `Dans ce contexte, on dit « ${second.example.korean} ».`,
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
      explanation: `Ici, retiens surtout la forme « ${formConcept.practice.focusForm} ».`,
    },
    order && orderTokens.length > 1
      ? {
          id: `${seed}:order`,
          stageId,
          conceptIds: [order.concept.id],
          phase: "manipulation",
          kind: "order",
          criterion: "M",
          prompt: "Remets les éléments dans l’ordre pour former la phrase coréenne indiquée.",
          display: formatExample(order.example, "PHRASE À FORMER", order.example.french),
          korean: order.example.korean,
          french: order.example.french,
          options: shuffleArray(orderTokens, random),
          answer: orderTokens,
          explanation: `L’ordre naturel est « ${order.example.korean} ».`,
          ...(order.example.note ? { memo: order.example.note } : {}),
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
          explanation: `Dans ce contexte, on dit « ${first.example.korean} ».`,
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
      explanation: `Dans cette situation, « ${sceneConcept.practice.scene.korean} » est la formulation naturelle.`,
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
