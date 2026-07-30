import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";

import { stop as stopSpeech } from "../lib/speechPlayback";

/** Stops TTS on route blur and component unmount. */
export function useSpeechLifecycle() {
  useFocusEffect(
    useCallback(() => {
      return () => {
        void stopSpeech();
      };
    }, []),
  );

  useEffect(() => {
    return () => {
      void stopSpeech();
    };
  }, []);
}
