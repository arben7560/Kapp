import {
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

import {
  getHangulAudioSequence,
  hasHangulAudio,
  type HangulAudioSource,
} from "../data/hangul/audio";
import { releaseAudioResources } from "../lib/audioPlayerLifecycle";
import { mediaSession } from "../lib/mediaSession";
import type { MediaSessionLease } from "../lib/mediaSessionCore";

type AudioSubscription = { remove: () => void };

const HANGUL_AUDIO_SEQUENCE_GAP_MS = 220;
let hangulOwnerSequence = 0;

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
  const ownerIdRef = useRef(`hangul-audio-${++hangulOwnerSequence}`);
  const playerRef = useRef<AudioPlayer | null>(null);
  const listenerRef = useRef<AudioSubscription | null>(null);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const leaseRef = useRef<MediaSessionLease | null>(null);

  const releasePlayer = useCallback(() => {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }

    const listener = listenerRef.current;
    listenerRef.current = null;
    const player = playerRef.current;
    playerRef.current = null;
    releaseAudioResources(player, listener);
  }, []);

  const stopAudio = useCallback(() => {
    requestIdRef.current += 1;
    releasePlayer();
    const lease = leaseRef.current;
    leaseRef.current = null;
    if (lease) {
      void mediaSession.release(lease);
    }
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
        if (source === undefined) {
          const lease = leaseRef.current;
          leaseRef.current = null;
          if (lease) {
            void mediaSession.release(lease);
          }
          return;
        }

        releasePlayer();

        try {
          const player = createAudioPlayer(source, { updateInterval: 100 });
          playerRef.current = player;
          listenerRef.current = player.addListener(
            "playbackStatusUpdate",
            (status) => {
              if (requestId !== requestIdRef.current) {
                releasePlayer();
                return;
              }

              if (status.error) {
                requestIdRef.current += 1;
                releasePlayer();
                const lease = leaseRef.current;
                leaseRef.current = null;
                if (lease) {
                  void mediaSession.release(lease);
                }
                return;
              }

              if (!didPlaybackFinish(status)) return;

              releasePlayer();
              if (index + 1 >= sources.length) {
                const lease = leaseRef.current;
                leaseRef.current = null;
                if (lease) {
                  void mediaSession.release(lease);
                }
                return;
              }

              sequenceTimerRef.current = setTimeout(() => {
                sequenceTimerRef.current = null;
                playSegment(index + 1);
              }, HANGUL_AUDIO_SEQUENCE_GAP_MS);
            },
          );
          player.play();
        } catch {
          releasePlayer();
          const lease = leaseRef.current;
          leaseRef.current = null;
          if (lease) {
            void mediaSession.release(lease);
          }
        }
      };

      void mediaSession
        .claim({
          id: ownerIdRef.current,
          mode: "shortPlayback",
          onInterrupt: () => {
            if (requestId !== requestIdRef.current) return;
            requestIdRef.current += 1;
            leaseRef.current = null;
            releasePlayer();
          },
        })
        .then((lease) => {
          if (!lease) return;

          if (requestId !== requestIdRef.current) {
            void mediaSession.release(lease);
            return;
          }

          leaseRef.current = lease;
          playSegment(0);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          requestIdRef.current += 1;
          leaseRef.current = null;
          releasePlayer();
        });
      return true;
    },
    [releasePlayer, stopAudio],
  );

  useFocusEffect(
    useCallback(() => {
      return stopAudio;
    }, [stopAudio]),
  );

  useEffect(() => {
    return stopAudio;
  }, [stopAudio]);

  return { hasAudio: hasHangulAudio, playAudio, stopAudio };
}
