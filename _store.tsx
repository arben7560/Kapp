import React from "react";
import type { HangulDetailedProgress } from "./data/hangul/types";
import type { GrammarLearningProgress } from "./data/grammar/types";
import {
  COMPLETION_XP,
  reserveCompletion,
} from "./lib/progressCompletion";
import {
  createInitialPedagogicalProgress,
  normalizePedagogicalProgress,
  type LearningTrack,
  type Progress,
} from "./lib/pedagogicalProgress";
import {
  persistPedagogicalProgress,
  readPedagogicalProgress,
} from "./lib/pedagogicalProgressStorage";
import { subscribeToProgressHydration } from "./lib/progressSyncEvents";

export type { LearningTrack, Progress } from "./lib/pedagogicalProgress";

const initialProgress = createInitialPedagogicalProgress();

type StoreValue = {
  setTrack: (t: LearningTrack) => Promise<void>;
  progress: Progress;
  setProgress: (updater: React.SetStateAction<Progress>) => Promise<void>;
  resetProgress: () => Promise<void>;
  complete: (id: string) => Promise<boolean>;
  bumpHangul: () => Promise<void>;
  updateHangulProgress: (
    updater: (current: HangulDetailedProgress) => HangulDetailedProgress,
  ) => Promise<void>;
  updateGrammarProgress: (
    updater: (current: GrammarLearningProgress) => GrammarLearningProgress,
  ) => Promise<void>;
  isHydrated: boolean;
};

const StoreContext = React.createContext<StoreValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgressState] = React.useState<Progress>(initialProgress);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const isHydratedRef = React.useRef(false);
  const progressRef = React.useRef(initialProgress);
  const completedRef = React.useRef<Record<string, boolean>>(
    initialProgress.completed,
  );

  React.useEffect(() => {
    let mounted = true;

    async function hydrateStore() {
      try {
        const saved = await readPedagogicalProgress<Partial<Progress>>();

        if (!mounted) return;

        if (saved) {
          const restoredProgress = normalizePedagogicalProgress(saved);

          progressRef.current = restoredProgress;
          completedRef.current = restoredProgress.completed;
          setProgressState(restoredProgress);
        }
      } catch (error) {
        console.warn("Impossible de restaurer le store pédagogique:", error);
      } finally {
        if (mounted) {
          isHydratedRef.current = true;
          setIsHydrated(true);
        }
      }
    }

    void hydrateStore();

    return () => {
      mounted = false;
    };
  }, []);

  const persistProgress = React.useCallback(async (next: Progress) => {
    try {
      await persistPedagogicalProgress(next);
    } catch (error) {
      console.warn("Impossible de sauvegarder le store pédagogique:", error);
    }
  }, []);

  React.useEffect(
    () =>
      subscribeToProgressHydration(() => {
        void readPedagogicalProgress<Partial<Progress>>()
          .then((saved) => {
            const restoredProgress = normalizePedagogicalProgress(saved);
            progressRef.current = restoredProgress;
            completedRef.current = restoredProgress.completed;
            setProgressState(restoredProgress);
          })
          .catch((error) => {
            console.warn(
              "Impossible de recharger la progression synchronisée:",
              error,
            );
          });
      }),
    [],
  );

  const setProgress = React.useCallback(
    (updater: React.SetStateAction<Progress>) => {
      if (!isHydratedRef.current) return Promise.resolve();

      const current = progressRef.current;
      const next = typeof updater === "function" ? updater(current) : updater;

      if (Object.is(current, next)) return Promise.resolve();

      progressRef.current = next;
      completedRef.current = next.completed;
      setProgressState(next);
      return persistProgress(next);
    },
    [persistProgress],
  );

  const setTrack = React.useCallback(
    (t: LearningTrack) =>
      setProgress((current) => ({ ...current, learningTrack: t })),
    [setProgress],
  );

  const resetProgress = React.useCallback(
    () => setProgress(mergeProgress({})),
    [setProgress],
  );

  const complete = React.useCallback(async (id: string) => {
    const nextCompleted = reserveCompletion(
      completedRef.current,
      id,
      isHydratedRef.current,
    );

    if (!nextCompleted) return false;

    completedRef.current = nextCompleted;

    const current = progressRef.current;
    const completedCoreModules = [
      "hangul_vowels_basic",
      "hangul_consonants_basic",
      "hangul_consonants_tense",
      "hangul_vowels_compound",
      "hangul_batchim",
    ].filter((moduleId) => nextCompleted[moduleId]).length;
    const next = {
      ...current,
      completed: nextCompleted,
      xp: current.xp + COMPLETION_XP,
      hangulLevel: Math.min(5, Math.max(1, completedCoreModules)),
    };

    progressRef.current = next;
    setProgressState(next);
    await persistProgress(next);

    return true;
  }, [persistProgress]);

  const bumpHangul = React.useCallback(
    () =>
      setProgress((current) => ({
        ...current,
        hangulLevel: Math.min(5, current.hangulLevel + 1),
      })),
    [setProgress],
  );

  const updateHangulProgress = React.useCallback(
    (updater: (current: HangulDetailedProgress) => HangulDetailedProgress) =>
      setProgress((current) => ({
        ...current,
        hangulProgress: updater(current.hangulProgress),
      })),
    [setProgress],
  );

  const updateGrammarProgress = React.useCallback(
    (updater: (current: GrammarLearningProgress) => GrammarLearningProgress) =>
      setProgress((current) => ({
        ...current,
        grammarProgress: updater(current.grammarProgress),
      })),
    [setProgress],
  );

  return (
    <StoreContext.Provider
      value={{
        progress,
        setProgress,
        resetProgress,
        complete,
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
