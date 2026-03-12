import React from "react";

export type Progress = {
  learningTrack: "hangul" | "vocab" | "dialogs" | null;
  xp: number;
  streak: number;
  isPremium: boolean;
  completed: Record<string, boolean>;
  hangulLevel: number;
};

const initialProgress: Progress = {
  learningTrack: null,
  xp: 120,
  streak: 2,
  isPremium: false,
  completed: { cafe_americano: true },
  hangulLevel: 1,
};

type StoreValue = {
  setTrack: (t: Progress["learningTrack"]) => void;
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  complete: (id: string) => void;
  togglePremium: () => void;
  bumpHangul: () => void;
};

const StoreContext = React.createContext<StoreValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = React.useState<Progress>(initialProgress);

  const setTrack = (t: Progress["learningTrack"]) => {
    setProgress((p) => ({ ...p, learningTrack: t }));
  };

  const complete = (id: string) => {
    setProgress((p) => {
      if (p.completed[id]) return p;
      return { ...p, completed: { ...p.completed, [id]: true }, xp: p.xp + 40 };
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
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx)
    throw new Error("StoreProvider missing. Wrap app in StoreProvider.");
  return ctx;
}