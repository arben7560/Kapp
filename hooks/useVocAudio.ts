import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { Vibration } from "react-native";
import { trackAudioPlayed } from "../lib/immersionStreak";

type AudioAsset = number;

type SetSelectedAudio = (id: string | null) => void;

export function useVocAudio(setSelectedAudio: SetSelectedAudio) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const activeAudioIdRef = useRef<string | null>(null);
  const playbackListenerRef = useRef<{ remove: () => void } | null>(null);

  const cleanupAudioListener = useCallback(() => {
    if (playbackListenerRef.current) {
      playbackListenerRef.current.remove();
      playbackListenerRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    try {
      cleanupAudioListener();

      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
        playerRef.current = null;
      }

      activeAudioIdRef.current = null;
    } catch {
      playerRef.current = null;
      activeAudioIdRef.current = null;
    }
  }, [cleanupAudioListener]);

  const playAudio = useCallback(
    (audioSource?: AudioAsset, id?: string, onError?: () => void) => {
      if (!audioSource) return;

      try {
        stopAudio();

        if (id) {
          activeAudioIdRef.current = id;
          setSelectedAudio(id);
        }

        Vibration.vibrate(8);
        void trackAudioPlayed();

        const player = createAudioPlayer(audioSource, {
          updateInterval: 250,
        });

        playerRef.current = player;

        playbackListenerRef.current = player.addListener(
          "playbackStatusUpdate",
          (status) => {
            const currentId = activeAudioIdRef.current;

            if (status.error && onError && playerRef.current === player) {
              cleanupAudioListener();

              try {
                player.remove();
              } catch {
                // Player may already be released after a native playback error.
              }

              playerRef.current = null;
              activeAudioIdRef.current = null;
              setSelectedAudio(null);
              onError?.();
              return;
            }

            const statusAny = status as any;

            const didFinish =
              statusAny.didJustFinish === true ||
              statusAny.playbackState === "ended" ||
              statusAny.playbackState === "finished" ||
              statusAny.timeControlStatus === "ended" ||
              (typeof statusAny.currentTime === "number" &&
                typeof statusAny.duration === "number" &&
                statusAny.duration > 0 &&
                statusAny.currentTime >= statusAny.duration - 0.05 &&
                statusAny.playing === false);

            if (!didFinish) return;

            if (currentId) {
              setSelectedAudio(null);
            }

            cleanupAudioListener();

            try {
              player.remove();
            } catch {
              // Player may already be released by navigation cleanup.
            }

            if (playerRef.current === player) {
              playerRef.current = null;
            }

            activeAudioIdRef.current = null;
          },
        );

        player.seekTo(0);
        player.play();
      } catch {
        if (onError) {
          stopAudio();
        }
        setSelectedAudio(null);
        activeAudioIdRef.current = null;
        onError?.();
      }
    },
    [cleanupAudioListener, setSelectedAudio, stopAudio],
  );

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
    }).catch(() => null);

    return stopAudio;
  }, [stopAudio]);

  return { playAudio, stopAudio };
}
