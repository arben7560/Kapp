import { useEffect } from "react";
import { AppState } from "react-native";

import { mediaSession } from "../lib/mediaSession";

export function useMediaSessionLifecycle() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") return;

      void mediaSession.interruptActive("background");
    });

    return () => {
      subscription.remove();
      void mediaSession.interruptActive("unmount");
    };
  }, []);
}
