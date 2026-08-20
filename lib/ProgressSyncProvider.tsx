import React from "react";
import { AppState } from "react-native";

import { useStore } from "../_store";
import {
  getProgressSyncSnapshot,
  startProgressSync,
  stopProgressSync,
  subscribeToProgressSync,
  synchronizeProgressNow,
} from "../services/progressSync";
import { useAuth } from "./AuthProvider";
import { useDailyStreak } from "./DailyStreakProvider";

export function ProgressSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id;
  const { isHydrated } = useStore();
  const { isLoading: isStreakLoading } = useDailyStreak();

  React.useEffect(() => {
    if (!userId || !isHydrated || isStreakLoading) return;
    void startProgressSync(userId);
    return () => stopProgressSync(userId);
  }, [isHydrated, isStreakLoading, userId]);

  React.useEffect(() => {
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && previousState !== "active") {
        void synchronizeProgressNow();
      }
      previousState = nextState;
    });
    return () => subscription.remove();
  }, []);

  return <>{children}</>;
}

export function useProgressSync() {
  return React.useSyncExternalStore(
    subscribeToProgressSync,
    getProgressSyncSnapshot,
    getProgressSyncSnapshot,
  );
}
