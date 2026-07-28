import type {
  HangulQuestion,
  HangulQuizSession,
} from "../data/hangul/types";
import { shuffleArray, type RandomSource } from "./choiceOrder.ts";

const correctAnswerIndex = (question: HangulQuestion) =>
  question.options.findIndex((option) => option.value === question.answer);

const moveCorrectAnswerAwayFrom = (
  question: HangulQuestion,
  avoidedIndex: number,
  random: RandomSource,
): HangulQuestion => {
  const currentIndex = correctAnswerIndex(question);
  if (
    question.options.length < 2 ||
    currentIndex < 0 ||
    currentIndex !== avoidedIndex
  ) {
    return question;
  }

  const availableIndexes = question.options
    .map((_, index) => index)
    .filter((index) => index !== avoidedIndex);
  const targetIndex =
    availableIndexes[Math.floor(random() * availableIndexes.length)];
  const options = [...question.options];
  [options[currentIndex], options[targetIndex]] = [
    options[targetIndex],
    options[currentIndex],
  ];

  return { ...question, options };
};

export function shuffleHangulQuestions(
  questions: readonly HangulQuestion[],
  {
    random = Math.random,
    shuffleQuestions = false,
  }: {
    random?: RandomSource;
    shuffleQuestions?: boolean;
  } = {},
): HangulQuestion[] {
  let previousCorrectIndex = -1;
  let repeatedPositionCount = 0;
  const orderedQuestions = shuffleQuestions
    ? shuffleArray(questions, random)
    : [...questions];

  return orderedQuestions.map((question) => {
    let shuffledQuestion = {
      ...question,
      options: shuffleArray(question.options, random),
    };
    let nextCorrectIndex = correctAnswerIndex(shuffledQuestion);

    if (
      nextCorrectIndex >= 0 &&
      nextCorrectIndex === previousCorrectIndex &&
      repeatedPositionCount >= 2
    ) {
      shuffledQuestion = moveCorrectAnswerAwayFrom(
        shuffledQuestion,
        previousCorrectIndex,
        random,
      );
      nextCorrectIndex = correctAnswerIndex(shuffledQuestion);
    }

    if (nextCorrectIndex === previousCorrectIndex) {
      repeatedPositionCount += 1;
    } else {
      previousCorrectIndex = nextCorrectIndex;
      repeatedPositionCount = 1;
    }

    return shuffledQuestion;
  });
}

type LegacyHangulQuizSession = HangulQuizSession & {
  retrySourceIds?: Record<string, true>;
};

export type HangulQuizAdvance =
  | { status: "next-question"; session: HangulQuizSession }
  | { status: "next-round"; session: HangulQuizSession }
  | { status: "complete"; session: HangulQuizSession };

const countCorrectQuestions = (correctQuestionIds: Record<string, true>) =>
  Object.keys(correctQuestionIds).length;

export function createHangulQuizSession(
  sceneId: string,
  questions: HangulQuestion[],
): HangulQuizSession {
  const originalQuestionIds = questions.map((question) => question.id);

  return {
    sceneId,
    questions,
    questionIndex: 0,
    answered: null,
    score: 0,
    correctQuestionIds: {},
    roundIncorrectQuestionIds: [],
    round: 1,
    originalQuestionIds,
    originalQuestionCount: originalQuestionIds.length,
  };
}

export function answerHangulQuizQuestion(
  session: HangulQuizSession,
  value: string,
): HangulQuizSession {
  const currentQuestion = session.questions[session.questionIndex];
  if (!currentQuestion || session.answered !== null) return session;

  const isCorrect = value === currentQuestion.answer;
  const correctQuestionIds = isCorrect
    ? { ...session.correctQuestionIds, [currentQuestion.id]: true as const }
    : session.correctQuestionIds;
  const roundIncorrectQuestionIds =
    !isCorrect &&
    !session.roundIncorrectQuestionIds.includes(currentQuestion.id)
      ? [...session.roundIncorrectQuestionIds, currentQuestion.id]
      : session.roundIncorrectQuestionIds;

  return {
    ...session,
    answered: value,
    score: countCorrectQuestions(correctQuestionIds),
    correctQuestionIds,
    roundIncorrectQuestionIds,
  };
}

export function advanceHangulQuiz(
  session: HangulQuizSession,
  random: RandomSource = Math.random,
): HangulQuizAdvance {
  if (session.answered === null) {
    return { status: "next-question", session };
  }

  const nextQuestionIndex = session.questionIndex + 1;
  if (nextQuestionIndex < session.questions.length) {
    return {
      status: "next-question",
      session: {
        ...session,
        questionIndex: nextQuestionIndex,
        answered: null,
      },
    };
  }

  if (session.roundIncorrectQuestionIds.length > 0) {
    const incorrectIds = new Set(session.roundIncorrectQuestionIds);
    const retryQuestions = session.questions
      .filter((question) => incorrectIds.has(question.id))
      .map((question) => {
        const previousCorrectIndex = correctAnswerIndex(question);
        const shuffledQuestion = {
          ...question,
          options: shuffleArray(question.options, random),
        };
        return moveCorrectAnswerAwayFrom(
          shuffledQuestion,
          previousCorrectIndex,
          random,
        );
      });

    return {
      status: "next-round",
      session: {
        ...session,
        questions: retryQuestions,
        questionIndex: 0,
        answered: null,
        roundIncorrectQuestionIds: [],
        round: session.round + 1,
      },
    };
  }

  return { status: "complete", session };
}

export function restoreHangulQuizSession(
  session: HangulQuizSession,
  questionBank: HangulQuestion[],
): HangulQuizSession {
  if (
    session.correctQuestionIds &&
    Array.isArray(session.roundIncorrectQuestionIds) &&
    typeof session.round === "number"
  ) {
    return {
      ...session,
      questionIndex: Math.min(
        session.questionIndex,
        Math.max(session.questions.length - 1, 0),
      ),
      score: countCorrectQuestions(session.correctQuestionIds),
      correctQuestionIds: { ...session.correctQuestionIds },
      roundIncorrectQuestionIds: [...session.roundIncorrectQuestionIds],
    };
  }

  const legacySession = session as LegacyHangulQuizSession;
  const retrySourceIds = legacySession.retrySourceIds ?? {};
  const correctQuestionIds: Record<string, true> = {};
  const processedQuestions = legacySession.questions.slice(
    0,
    legacySession.questionIndex,
  );

  processedQuestions.forEach((question) => {
    if (
      legacySession.originalQuestionIds.includes(question.id) &&
      !retrySourceIds[question.id]
    ) {
      correctQuestionIds[question.id] = true;
    }
  });

  const currentQuestion =
    legacySession.questions[legacySession.questionIndex];
  if (
    currentQuestion &&
    legacySession.answered === currentQuestion.answer &&
    legacySession.originalQuestionIds.includes(currentQuestion.id)
  ) {
    correctQuestionIds[currentQuestion.id] = true;
  }

  const pendingQuestions = questionBank.filter(
    (question) => !correctQuestionIds[question.id],
  );

  return {
    sceneId: legacySession.sceneId,
    questions: pendingQuestions,
    questionIndex: 0,
    answered: null,
    score: countCorrectQuestions(correctQuestionIds),
    correctQuestionIds,
    roundIncorrectQuestionIds: [],
    round: Object.keys(retrySourceIds).length > 0 ? 2 : 1,
    originalQuestionIds: [...legacySession.originalQuestionIds],
    originalQuestionCount: legacySession.originalQuestionCount,
  };
}
