import React from "react";
import { AppState } from "react-native";
import {
  completeDailyActivity as completeDailyActivityStorage,
  getDailyStreakState,
  grantStreakFreeze,
  resetDailyStreak,
  applyStreakFreeze,
  type DailyActivityType,
  type DailyStreakState,
} from "./dailyStreak";

type DailyStreakContextValue = {
  streak: DailyStreakState | null;
  isLoading: boolean;
  refreshStreak: () => Promise<DailyStreakState>;
  completeDailyActivity: (
    activityType?: DailyActivityType,
  ) => Promise<DailyStreakState>;
  applyFreeze: (dateToRepair?: string) => Promise<DailyStreakState>;
  grantFreeze: (count?: number) => Promise<DailyStreakState>;
  resetStreak: () => Promise<DailyStreakState>;
};

const DailyStreakContext = React.createContext<
  DailyStreakContextValue | undefined
>(undefined);

export function DailyStreakProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [streak, setStreak] = React.useState<DailyStreakState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshStreak = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const nextState = await getDailyStreakState();
      setStreak(nextState);
      return nextState;
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void refreshStreak();
    }, 0);
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshStreak();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [refreshStreak]);

  const completeDailyActivity = React.useCallback(
    async (activityType: DailyActivityType = "pedagogical_activity") => {
      const nextState = await completeDailyActivityStorage(activityType);
      setStreak(nextState);
      return nextState;
    },
    [],
  );

  const applyFreeze = React.useCallback(async (dateToRepair?: string) => {
    const nextState = await applyStreakFreeze(dateToRepair);
    setStreak(nextState);
    return nextState;
  }, []);

  const grantFreeze = React.useCallback(async (count = 1) => {
    const nextState = await grantStreakFreeze(count);
    setStreak(nextState);
    return nextState;
  }, []);

  const resetStreak = React.useCallback(async () => {
    const nextState = await resetDailyStreak();
    setStreak(nextState);
    return nextState;
  }, []);

  const value = React.useMemo<DailyStreakContextValue>(
    () => ({
      completeDailyActivity,
      grantFreeze,
      isLoading,
      refreshStreak,
      resetStreak,
      streak,
      applyFreeze,
    }),
    [
      completeDailyActivity,
      grantFreeze,
      isLoading,
      refreshStreak,
      resetStreak,
      streak,
      applyFreeze,
    ],
  );

  return (
    <DailyStreakContext.Provider value={value}>
      {children}
    </DailyStreakContext.Provider>
  );
}

export function useDailyStreak() {
  const context = React.useContext(DailyStreakContext);

  if (!context) {
    throw new Error("useDailyStreak must be used inside DailyStreakProvider.");
  }

  return context;
}
