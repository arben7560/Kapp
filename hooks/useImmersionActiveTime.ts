import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { resetTodayIfNewDay, trackActiveTime } from "../lib/immersionStreak";

const FLUSH_INTERVAL_MS = 30_000;

export function useImmersionActiveTime() {
  const activeSinceRef = useRef<number | null>(null);

  useEffect(() => {
    activeSinceRef.current = Date.now();
    void resetTodayIfNewDay();

    function flushActiveTime() {
      const activeSince = activeSinceRef.current;
      if (!activeSince) return;

      const now = Date.now();
      const elapsedSeconds = Math.floor((now - activeSince) / 1000);

      if (elapsedSeconds > 0) {
        void trackActiveTime(elapsedSeconds);
      }

      activeSinceRef.current = now;
    }

    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === "active") {
        activeSinceRef.current = Date.now();
        void resetTodayIfNewDay();
        return;
      }

      flushActiveTime();
      activeSinceRef.current = null;
    }

    const interval = setInterval(flushActiveTime, FLUSH_INTERVAL_MS);
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      clearInterval(interval);
      flushActiveTime();
      subscription.remove();
    };
  }, []);
}
