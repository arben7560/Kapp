import { useFocusEffect } from "expo-router";
import type { VideoPlayer } from "expo-video";
import { useCallback } from "react";
import { AppState } from "react-native";

/** Pauses immersive media off-screen and resumes the active scene on return. */
export function useImmersiveVideoLifecycle(
  player: VideoPlayer,
  shouldPlay: boolean,
) {
  useFocusEffect(
    useCallback(() => {
      if (AppState.currentState === "active" && shouldPlay) {
        player.play();
      } else {
        player.pause();
      }

      const subscription = AppState.addEventListener("change", (nextState) => {
        if (nextState === "active" && shouldPlay) {
          player.play();
        } else {
          player.pause();
        }
      });

      return () => {
        subscription.remove();
        player.pause();
      };
    }, [player, shouldPlay]),
  );
}
