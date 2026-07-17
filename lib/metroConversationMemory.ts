import type {
  MetroSpeechCategory,
  MetroSpeechMatch,
} from "./metroSpeechIntents";

export type MetroConversationAttempt = {
  id: string;
  nodeId: string;
  transcript: string;
  category: MetroSpeechCategory;
  matched: boolean;
  understoodWithCorrection: boolean;
};

export type MetroConversationMemory = {
  attempts: MetroConversationAttempt[];
  helpRequests: number;
  audioReplays: number;
};

export type MetroConversationSummary = {
  speakingTurns: number;
  directSuccesses: number;
  understoodWithCorrection: number;
  errorsCorrected: number;
  helpRequests: number;
  audioReplays: number;
  vocabularyToReview: string[];
};

export function createMetroConversationMemory(): MetroConversationMemory {
  return { attempts: [], helpRequests: 0, audioReplays: 0 };
}

export function recordMetroSpeechAttempt(
  memory: MetroConversationMemory,
  input: {
    nodeId: string;
    transcript: string;
    result: MetroSpeechMatch;
  },
): MetroConversationMemory {
  return {
    ...memory,
    attempts: [
      ...memory.attempts,
      {
        id: `${input.nodeId}-${memory.attempts.length + 1}`,
        nodeId: input.nodeId,
        transcript: input.transcript,
        category: input.result.category,
        matched: input.result.reason === "matched",
        understoodWithCorrection: input.result.understoodWithCorrection,
      },
    ],
  };
}

export function recordMetroHelpRequest(memory: MetroConversationMemory) {
  return { ...memory, helpRequests: memory.helpRequests + 1 };
}

export function recordMetroAudioReplay(memory: MetroConversationMemory) {
  return { ...memory, audioReplays: memory.audioReplays + 1 };
}

export function buildMetroConversationSummary(
  memory: MetroConversationMemory,
): MetroConversationSummary {
  const directSuccesses = memory.attempts.filter(
    (attempt) => attempt.matched && !attempt.understoodWithCorrection,
  ).length;
  const understoodWithCorrection = memory.attempts.filter(
    (attempt) => attempt.matched && attempt.understoodWithCorrection,
  ).length;
  const errorsCorrected = new Set(
    memory.attempts
      .filter(
        (attempt) =>
          !attempt.matched &&
          memory.attempts.some(
            (later) =>
              later.nodeId === attempt.nodeId &&
              later.matched &&
              Number(later.id.split("-").at(-1)) >
                Number(attempt.id.split("-").at(-1)),
          ),
      )
      .map((attempt) => attempt.nodeId),
  ).size;
  const categories = new Set(memory.attempts.map(({ category }) => category));
  const vocabularyToReview = ["강남 방향", "어느 쪽이에요?", "가는 쪽"];

  if (categories.has("exit-confusion")) {
    vocabularyToReview.push("방향 (direction) ≠ 출구 (sortie)");
  }
  if (categories.has("duration-confusion")) {
    vocabularyToReview.push("direction ≠ durée du trajet");
  }
  if (categories.has("transfer-confusion")) {
    vocabularyToReview.push("방향 (direction) ≠ 환승 (correspondance)");
  }

  return {
    speakingTurns: memory.attempts.length,
    directSuccesses,
    understoodWithCorrection,
    errorsCorrected,
    helpRequests: memory.helpRequests,
    audioReplays: memory.audioReplays,
    vocabularyToReview,
  };
}
