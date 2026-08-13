import type {
  AeroportSpeechCategory,
  AeroportSpeechIntent,
  AeroportSpeechMatch,
} from "./aeroportSpeechIntents";

export type AeroportConversationAttempt = Readonly<{
  id: string;
  nodeId: string;
  transcript: string;
  category: AeroportSpeechCategory;
  feedback: string;
  matched: boolean;
  understoodWithCorrection: boolean;
  interpretedIntent?: Exclude<AeroportSpeechIntent, "unknown">;
}>;

export type AeroportConversationMemory = Readonly<{
  attempts: readonly AeroportConversationAttempt[];
  helpRequests: number;
  audioReplays: number;
}>;

export type AeroportConversationSummary = Readonly<{
  speakingTurns: number;
  directSuccesses: number;
  understoodWithCorrection: number;
  errorsCorrected: number;
  helpRequests: number;
  audioReplays: number;
  achievements: readonly string[];
  vocabularyToReview: readonly string[];
}>;

export function createAeroportConversationMemory(): AeroportConversationMemory {
  return { attempts: [], helpRequests: 0, audioReplays: 0 };
}

export function recordAeroportSpeechAttempt(
  memory: AeroportConversationMemory,
  input: Readonly<{
    nodeId: string;
    transcript: string;
    result: AeroportSpeechMatch;
  }>,
): AeroportConversationMemory {
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
        interpretedIntent: input.result.interpretedIntent,
      },
    ],
  };
}

export function recordAeroportHelpRequest(
  memory: AeroportConversationMemory,
): AeroportConversationMemory {
  return { ...memory, helpRequests: memory.helpRequests + 1 };
}

export function recordAeroportAudioReplay(
  memory: AeroportConversationMemory,
): AeroportConversationMemory {
  return { ...memory, audioReplays: memory.audioReplays + 1 };
}

export function buildAeroportConversationSummary(
  memory: AeroportConversationMemory,
): AeroportConversationSummary {
  const directSuccesses = memory.attempts.filter(
    ({ matched, understoodWithCorrection }) =>
      matched && !understoodWithCorrection,
  ).length;
  const understoodWithCorrection = memory.attempts.filter(
    ({ matched, understoodWithCorrection: corrected }) => matched && corrected,
  ).length;
  const errorsCorrected = new Set(
    memory.attempts
      .filter(
        (attempt, index) =>
          !attempt.matched &&
          memory.attempts.slice(index + 1).some(
            (later) => later.nodeId === attempt.nodeId && later.matched,
          ),
      )
      .map(({ nodeId }) => nodeId),
  ).size;
  const categories = new Set(memory.attempts.map(({ category }) => category));
  const successfulIntents = new Set(
    memory.attempts
      .filter(({ matched }) => matched)
      .flatMap(({ interpretedIntent }) =>
        interpretedIntent ? [interpretedIntent] : [],
      ),
  );
  const achievements: string[] = [];
  const vocabularyToReview = new Set<string>();

  if (successfulIntents.has("route")) {
    achievements.push("Trajet vers Seoul Station demandé");
  }
  if (successfulIntents.has("continue")) {
    achievements.push("Étape suivante demandée");
  }
  if (successfulIntents.has("train-choice")) {
    achievements.push("Choix du train clarifié");
  }
  if (successfulIntents.has("platform")) {
    achievements.push("Quai de l’AREX demandé");
  }
  if (successfulIntents.has("repeat")) {
    achievements.push("Répétition demandée poliment");
  }
  if (successfulIntents.has("thanks")) {
    achievements.push("Échange terminé naturellement");
  }

  if (categories.has("contextual-interpretation")) {
    vocabularyToReview.add("Reformuler précisément l’intention comprise");
  }
  if (categories.has("wrong-destination")) {
    vocabularyToReview.add("Destination de la mission : 서울역");
  }
  if (categories.has("quantity-conflict")) {
    vocabularyToReview.add("Étage : ne donner qu’un seul numéro");
  }
  if (categories.has("negation-conflict")) {
    vocabularyToReview.add("Négation : vérifier l’intention affirmée ou refusée");
  }
  if (categories.has("incomplete")) {
    vocabularyToReview.add("Former une question complète avec 어디 / 어떻게");
  }
  if (categories.has("out-of-scope")) {
    vocabularyToReview.add("Répondre à l’étape actuelle de la conversation");
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
