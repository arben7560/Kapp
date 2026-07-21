import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  createEmptyHangulProgress,
  type HangulDetailedProgress,
} from "./data/hangul/types";
import type { GrammarLearningProgress } from "./data/grammar/types";
import {
  createEmptyGrammarLearningProgress,
  normalizeGrammarLearningProgress,
} from "./lib/grammar/learning";

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
  isPremium: boolean;
  completed: Record<string, boolean>;
  hangulLevel: number;
  hangulProgress: HangulDetailedProgress;
  grammarProgress: GrammarLearningProgress;
};

const STORE_KEY = "@k_app/pedagogical_progress_v1";

const initialProgress: Progress = {
  learningTrack: null,
  xp: 120,
  streak: 0,
  isPremium: false,
  completed: {},
  hangulLevel: 1,
  hangulProgress: createEmptyHangulProgress(),
  grammarProgress: createEmptyGrammarLearningProgress(),
};

type StoreValue = {
  setTrack: (t: LearningTrack) => void;
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  complete: (id: string) => void;
  togglePremium: () => void;
  bumpHangul: () => void;
  updateHangulProgress: (
    updater: (current: HangulDetailedProgress) => HangulDetailedProgress,
  ) => void;
  updateGrammarProgress: (
    updater: (current: GrammarLearningProgress) => GrammarLearningProgress,
  ) => void;
  isHydrated: boolean;
};

const StoreContext = React.createContext<StoreValue | undefined>(undefined);

function mergeProgress(saved: Partial<Progress>): Progress {
  return {
    ...initialProgress,
    ...saved,
    completed: {
      ...(saved.completed ?? {}),
    },
    hangulProgress: {
      ...createEmptyHangulProgress(),
      ...(saved.hangulProgress ?? {}),
      lessons: {
        ...(saved.hangulProgress?.lessons ?? {}),
      },
      masteredCharacters: {
        ...(saved.hangulProgress?.masteredCharacters ?? {}),
      },
    },
    grammarProgress: normalizeGrammarLearningProgress(saved.grammarProgress),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = React.useState<Progress>(initialProgress);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const completedRef = React.useRef<Record<string, boolean>>(
    initialProgress.completed,
  );

  React.useEffect(() => {
    let mounted = true;

    async function hydrateStore() {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);

        if (!mounted) return;

        if (raw) {
          const saved = JSON.parse(raw) as Partial<Progress>;
          const restoredProgress = mergeProgress(saved);

          setProgress(restoredProgress);
          completedRef.current = restoredProgress.completed;
        }
      } catch (error) {
        console.warn("Impossible de restaurer le store pédagogique:", error);
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateStore();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    completedRef.current = progress.completed;
  }, [progress.completed]);

  React.useEffect(() => {
    if (!isHydrated) return;

    async function persistStore() {
      try {
        await AsyncStorage.setItem(STORE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.warn("Impossible de sauvegarder le store pédagogique:", error);
      }
    }

    void persistStore();
  }, [progress, isHydrated]);

  const setTrack = (t: LearningTrack) => {
    setProgress((p) => ({ ...p, learningTrack: t }));
  };

  const complete = (id: string) => {
    if (completedRef.current[id]) return;

    completedRef.current = {
      ...completedRef.current,
      [id]: true,
    };

    setProgress((p) => {
      if (p.completed[id]) return p;

      const nextCompleted = { ...p.completed, [id]: true };
      const completedCoreModules = [
        "hangul_vowels_basic",
        "hangul_consonants_basic",
        "hangul_consonants_tense",
        "hangul_vowels_compound",
        "hangul_batchim",
      ].filter((moduleId) => nextCompleted[moduleId]).length;

      return {
        ...p,
        completed: nextCompleted,
        xp: p.xp + 40,
        hangulLevel: Math.min(5, Math.max(1, completedCoreModules)),
      };
    });
  };

  const togglePremium = () => {
    setProgress((p) => ({ ...p, isPremium: !p.isPremium }));
  };

  const bumpHangul = () => {
    setProgress((p) => ({
      ...p,
      hangulLevel: Math.min(5, p.hangulLevel + 1),
    }));
  };

  const updateHangulProgress = (
    updater: (current: HangulDetailedProgress) => HangulDetailedProgress,
  ) => {
    setProgress((current) => ({
      ...current,
      hangulProgress: updater(current.hangulProgress),
    }));
  };

  const updateGrammarProgress = (
    updater: (current: GrammarLearningProgress) => GrammarLearningProgress,
  ) => {
    setProgress((current) => ({
      ...current,
      grammarProgress: updater(current.grammarProgress),
    }));
  };

  return (
    <StoreContext.Provider
      value={{
        progress,
        setProgress,
        complete,
        togglePremium,
        bumpHangul,
        updateHangulProgress,
        updateGrammarProgress,
        setTrack,
        isHydrated,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = React.useContext(StoreContext);

  if (!ctx) {
    throw new Error("StoreProvider missing. Wrap app in StoreProvider.");
  }

  return ctx;
}
