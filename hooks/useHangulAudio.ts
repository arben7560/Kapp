import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { useCallback, useEffect, useRef } from "react";

import {
  getHangulAudioSequence,
  hasHangulAudio,
  type HangulAudioSource,
} from "../data/hangul/audio";

type AudioSubscription = { remove: () => void };

const HANGUL_AUDIO_SEQUENCE_GAP_MS = 220;

const didPlaybackFinish = (status: unknown) => {
  const value = status as {
    didJustFinish?: boolean;
    playbackState?: string;
    timeControlStatus?: string;
    currentTime?: number;
    duration?: number;
    playing?: boolean;
  };

  return (
    value.didJustFinish === true ||
    value.playbackState === "ended" ||
    value.playbackState === "finished" ||
    value.timeControlStatus === "ended" ||
    (typeof value.currentTime === "number" &&
      typeof value.duration === "number" &&
      value.duration > 0 &&
      value.currentTime >= value.duration - 0.05 &&
      value.playing === false)
  );
};

export function useHangulAudio() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const listenerRef = useRef<AudioSubscription | null>(null);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const releasePlayer = useCallback(() => {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }

    listenerRef.current?.remove();
    listenerRef.current = null;

    if (!playerRef.current) return;

    try {
      playerRef.current.pause();
      playerRef.current.remove();
    } catch {
      // The native player can already be released during navigation cleanup.
    }

    playerRef.current = null;
  }, []);

  const stopAudio = useCallback(() => {
    requestIdRef.current += 1;
    releasePlayer();
  }, [releasePlayer]);

  const playAudio = useCallback(
    (value: string) => {
      const sources = getHangulAudioSequence(value);
      stopAudio();

      if (!sources) {
        if (__DEV__) {
          console.warn(`[Hangul audio] Fichier local manquant pour « ${value} ».`);
        }
        return false;
      }

      const requestId = requestIdRef.current;

      const playSegment = (index: number) => {
        if (requestId !== requestIdRef.current) return;

        const source: HangulAudioSource | undefined = sources[index];
        if (source === undefined) return;

        releasePlayer();

        try {
          const player = createAudioPlayer(source, { updateInterval: 100 });
          playerRef.current = player;
          listenerRef.current = player.addListener(
            "playbackStatusUpdate",
            (status) => {
              if (requestId !== requestIdRef.current || status.error) {
                releasePlayer();
                return;
              }

              if (!didPlaybackFinish(status)) return;

              releasePlayer();
              if (index + 1 >= sources.length) return;

              sequenceTimerRef.current = setTimeout(() => {
                sequenceTimerRef.current = null;
                playSegment(index + 1);
              }, HANGUL_AUDIO_SEQUENCE_GAP_MS);
            },
          );
          player.play();
        } catch {
          releasePlayer();
        }
      };

      playSegment(0);
      return true;
    },
    [releasePlayer, stopAudio],
  );

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
    }).catch(() => null);

    return stopAudio;
  }, [stopAudio]);

  return { hasAudio: hasHangulAudio, playAudio, stopAudio };
}
