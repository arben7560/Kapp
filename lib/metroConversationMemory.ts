import type {
  MetroSpeechCategory,
  MetroSpeechMatch,
} from "./metroSpeechIntents";

export type MetroConversationAttempt = {
  id: string;
  nodeId: string;
  transcript: string;
  category: MetroSpeechCategory;
  feedback: string;
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
  achievements: string[];
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
        feedback: input.result.feedback,
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
  const successfulCategories = new Set(
    memory.attempts
      .filter(({ matched }) => matched)
      .map(({ category }) => category),
  );
  const achievements: string[] = [];
  const vocabularyToReview = new Set([
    "강남에 어떻게 가요?",
    "강남 방향",
    "강남 방향은 어느 쪽이에요?",
  ]);

  if (
    [...successfulCategories].some((category) =>
      [
        "natural",
        "minor-imperfection",
        "particle-imperfection",
        "word-order",
        "go-come-confusion",
        "mixed-language",
      ].includes(category),
    )
  ) {
    achievements.push("Demande vers Gangnam comprise");
  }
  if (
    [...successfulCategories].some((category) =>
      [
        "repeat",
        "repeat-informal",
        "repeat-word-order",
        "not-understood",
      ].includes(category),
    )
  ) {
    achievements.push("Demande de répétition réussie");
  }
  if (successfulCategories.has("duration") || successfulCategories.has("duration-imperfection")) {
    achievements.push("Durée du trajet demandée");
  }
  if (successfulCategories.has("transfer") || successfulCategories.has("transfer-imperfection")) {
    achievements.push("Correspondance vérifiée");
  }
  if (
    [...successfulCategories].some((category) =>
      ["thanks", "understood", "thanks-informal"].includes(category),
    )
  ) {
    achievements.push("Échange terminé naturellement");
  }

  if (categories.has("particle-imperfection")) {
    vocabularyToReview.add("Destination : 강남에 / 강남까지");
  }
  if (categories.has("word-order")) {
    vocabularyToReview.add("Ordre naturel : 강남에 어떻게 가요?");
  }
  if (categories.has("go-come-confusion")) {
    vocabularyToReview.add("가요 (aller) ≠ 와요 (venir)");
  }
  if (categories.has("incomplete")) {
    vocabularyToReview.add("Compléter : 강남 가려면 어떻게 해요?");
  }
  if (categories.has("mixed-language")) {
    vocabularyToReview.add("Destination en coréen : 강남");
  }
  if (categories.has("repeat-informal")) {
    vocabularyToReview.add("Politesse : 다시 말해 주세요");
  }
  if (categories.has("repeat-word-order")) {
    vocabularyToReview.add("Ordre naturel : 다시 말해 주세요");
  }
  if (categories.has("thanks-informal")) {
    vocabularyToReview.add("Avec un inconnu : 감사합니다 / 알겠습니다");
  }
  if (categories.has("ambiguous-acknowledgement")) {
    vocabularyToReview.add("네 seul : préciser 알겠습니다 ou 다시요");
  }
  if (categories.has("not-understood")) {
    vocabularyToReview.add("다시요 · 못 들었어요 · 이해 못 했어요");
  }
  if (categories.has("relevant-question")) {
    vocabularyToReview.add("Clarifier : 다시 한번 말씀해 주세요");
  }
  if (categories.has("duration-imperfection")) {
    vocabularyToReview.add("Durée : 얼마나 걸려요?");
  }
  if (categories.has("transfer-imperfection")) {
    vocabularyToReview.add("Correspondance : 환승해야 해요?");
  }

  if (categories.has("exit-confusion")) {
    vocabularyToReview.add("방향 (direction) ≠ 출구 (sortie)");
  }
  if (categories.has("duration-confusion")) {
    vocabularyToReview.add("direction ≠ durée du trajet");
  }
  if (categories.has("transfer-confusion")) {
    vocabularyToReview.add("방향 (direction) ≠ 환승 (correspondance)");
  }

  return {
    speakingTurns: memory.attempts.length,
    directSuccesses,
    understoodWithCorrection,
    errorsCorrected,
    helpRequests: memory.helpRequests,
    audioReplays: memory.audioReplays,
    achievements,
    vocabularyToReview: [...vocabularyToReview],
  };
}
