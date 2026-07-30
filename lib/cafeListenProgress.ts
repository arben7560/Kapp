import { shuffleArray, type RandomSource } from "./choiceOrder.ts";

export type CafeListenProgress = {
  status: "question" | "round-summary" | "complete";
  totalQuestions: number;
  queue: string[];
  questionIndex: number;
  incorrectIds: string[];
  firstPassScore: number | null;
  remediationRound: number;
};

export function createCafeListenProgress(
  exerciseIds: readonly string[],
  random: RandomSource = Math.random,
): CafeListenProgress {
  return {
    status: exerciseIds.length === 0 ? "complete" : "question",
    totalQuestions: exerciseIds.length,
    queue: shuffleArray(exerciseIds, random),
    questionIndex: 0,
    incorrectIds: [],
    firstPassScore: null,
    remediationRound: 0,
  };
}

export function recordCafeListenAnswer(
  progress: CafeListenProgress,
  exerciseId: string,
  correct: boolean,
): CafeListenProgress {
  if (
    progress.status !== "question" ||
    progress.queue[progress.questionIndex] !== exerciseId
  ) {
    return progress;
  }

  const incorrectIds =
    correct || progress.incorrectIds.includes(exerciseId)
      ? progress.incorrectIds
      : [...progress.incorrectIds, exerciseId];
  const isLastQuestion = progress.questionIndex === progress.queue.length - 1;

  if (!isLastQuestion) {
    return {
      ...progress,
      questionIndex: progress.questionIndex + 1,
      incorrectIds,
    };
  }

  const firstPassScore =
    progress.firstPassScore ??
    progress.totalQuestions - incorrectIds.length;

  return {
    ...progress,
    status: incorrectIds.length === 0 ? "complete" : "round-summary",
    incorrectIds,
    firstPassScore,
  };
}

export function startCafeListenRemediation(
  progress: CafeListenProgress,
  random: RandomSource = Math.random,
): CafeListenProgress {
  if (progress.status !== "round-summary" || progress.incorrectIds.length === 0) {
    return progress;
  }

  return {
    ...progress,
    status: "question",
    queue: shuffleArray(progress.incorrectIds, random),
    questionIndex: 0,
    incorrectIds: [],
    remediationRound: progress.remediationRound + 1,
  };
}
