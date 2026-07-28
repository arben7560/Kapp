import type {
  HangulQuestion,
  HangulQuestionOption,
  HangulQuizSession,
} from "../data/hangul/types";

type ShuffleOptions = (
  options: HangulQuestionOption[],
) => HangulQuestionOption[];

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
  shuffleOptions: ShuffleOptions = (options) => options,
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
      .map((question) => ({
        ...question,
        options: shuffleOptions([...question.options]),
      }));

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
