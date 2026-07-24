import { useIsFocused } from "expo-router";
import type { VideoPlayer } from "expo-video";
import { useEffect } from "react";
import { AppState } from "react-native";

/** Pauses immersive media off-screen and resumes the active scene on return. */
export function useImmersiveVideoLifecycle(
  player: VideoPlayer,
  shouldPlay: boolean,
) {
  const isFocused = useIsFocused();

  useEffect(() => {
    const updatePlayback = (appState = AppState.currentState) => {
      if (isFocused && appState === "active" && shouldPlay) {
        player.play();
      } else {
        player.pause();
      }
    };

    updatePlayback();

    const subscription = AppState.addEventListener("change", updatePlayback);

    return () => {
      subscription.remove();
      // useVideoPlayer releases its native SharedObject earlier during unmount.
      // Playback is already stopped by that release; calling pause here would
      // target the released object when leaving an immersion scene.
    };
  }, [isFocused, player, shouldPlay]);
}
