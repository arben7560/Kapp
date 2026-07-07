import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { trackHangulExerciseCompleted } from "./lib/immersionStreak";

export type LearningTrack =
  | "hangul"
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
};

const STORE_KEY = "@k_app/pedagogical_progress_v1";

const initialProgress: Progress = {
  learningTrack: null,
  xp: 120,
  streak: 0,
  isPremium: false,
  completed: {},
  hangulLevel: 1,
};

type StoreValue = {
  setTrack: (t: LearningTrack) => void;
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  complete: (id: string) => void;
  togglePremium: () => void;
  bumpHangul: () => void;
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

    if (id.startsWith("hangul_")) {
      void trackHangulExerciseCompleted(id);
    }

    setProgress((p) => {
      if (p.completed[id]) return p;

      return {
        ...p,
        completed: { ...p.completed, [id]: true },
        xp: p.xp + 40,
      };
    });
  };

  const togglePremium = () => {
    setProgress((p) => ({ ...p, isPremium: !p.isPremium }));
  };

  const bumpHangul = () => {
    setProgress((p) => ({
      ...p,
      hangulLevel: Math.min(4, p.hangulLevel + 1),
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
