import type { GrammarLearningProgress } from "../data/grammar/types.ts";
import {
  createEmptyHangulProgress,
  type HangulDetailedProgress,
} from "../data/hangul/types.ts";
import {
  createEmptyGrammarLearningProgress,
  normalizeGrammarLearningProgress,
} from "./grammar/learning.ts";

export type LearningTrack =
  | "hangul"
  | "grammar"
  | "vocab"
  | "numbers"
  | "classifier"
  | "dialogs"
  | "listen"
  | "immersion"
  | "cafe_ia"
  | "restaurant_ia"
  | "metro_ia"
  | "aeroport_ia"
  | null;

export type Progress = {
  learningTrack: LearningTrack;
  xp: number;
  streak: number;
  completed: Record<string, boolean>;
  hangulLevel: number;
  hangulProgress: HangulDetailedProgress;
  grammarProgress: GrammarLearningProgress;
};

export function createInitialPedagogicalProgress(): Progress {
  return {
    learningTrack: null,
    xp: 120,
    streak: 0,
    completed: {},
    hangulLevel: 1,
    hangulProgress: createEmptyHangulProgress(),
    grammarProgress: createEmptyGrammarLearningProgress(),
  };
}

export function normalizePedagogicalProgress(
  saved?: Partial<Progress> | null,
): Progress {
  const initial = createInitialPedagogicalProgress();
  const savedWithoutLegacyPremium = { ...(saved ?? {}) } as Partial<Progress> & {
    isPremium?: boolean;
  };
  delete savedWithoutLegacyPremium.isPremium;

  return {
    ...initial,
    ...savedWithoutLegacyPremium,
    learningTrack: savedWithoutLegacyPremium.learningTrack ?? null,
    xp:
      typeof savedWithoutLegacyPremium.xp === "number" &&
      Number.isFinite(savedWithoutLegacyPremium.xp)
        ? Math.max(0, savedWithoutLegacyPremium.xp)
        : initial.xp,
    streak:
      typeof savedWithoutLegacyPremium.streak === "number" &&
      Number.isFinite(savedWithoutLegacyPremium.streak)
        ? Math.max(0, savedWithoutLegacyPremium.streak)
        : initial.streak,
    hangulLevel:
      typeof savedWithoutLegacyPremium.hangulLevel === "number" &&
      Number.isFinite(savedWithoutLegacyPremium.hangulLevel)
        ? Math.min(5, Math.max(1, savedWithoutLegacyPremium.hangulLevel))
        : initial.hangulLevel,
    completed: {
      ...(savedWithoutLegacyPremium.completed ?? {}),
    },
    hangulProgress: {
      ...createEmptyHangulProgress(),
      ...(savedWithoutLegacyPremium.hangulProgress ?? {}),
      lessons: {
        ...(savedWithoutLegacyPremium.hangulProgress?.lessons ?? {}),
      },
      masteredCharacters: {
        ...(savedWithoutLegacyPremium.hangulProgress?.masteredCharacters ?? {}),
      },
    },
    grammarProgress: normalizeGrammarLearningProgress(
      savedWithoutLegacyPremium.grammarProgress,
    ),
  };
}
