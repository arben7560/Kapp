import {
  createAudioPlayer,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Vibration } from "react-native";
import {
  pauseAudioResources,
  releaseAudioResources,
  type RemovableAudioSubscription,
} from "../lib/audioPlayerLifecycle";
import { mediaSession } from "../lib/mediaSession";
import type { MediaSessionLease } from "../lib/mediaSessionCore";

type AudioAsset = number;

type SetSelectedAudio = (id: string | null) => void;

export type VocAudioPlaybackState =
  | "idle"
  | "starting"
  | "playing"
  | "interrupted"
  | "completed"
  | "error";

export type VocAudioPlaybackCallbacks = Readonly<{
  onCompleted?: () => void;
  onError?: (playbackError: Error) => void;
  onInterrupted?: () => void;
  onStarted?: () => void;
}>;

type ActivePlaybackListener = {
  player: AudioPlayer;
  subscription: RemovableAudioSubscription;
};

let audioOwnerSequence = 0;

function toPlaybackError(error: unknown) {
  if (error instanceof Error) return error;
  return new Error("La lecture audio a échoué.");
}

function normalizeCallbacks(
  callbacks?: VocAudioPlaybackCallbacks | ((playbackError: Error) => void),
): VocAudioPlaybackCallbacks {
  return typeof callbacks === "function"
    ? { onError: callbacks }
    : callbacks ?? {};
}

export function useVocAudio(
  setSelectedAudio: SetSelectedAudio,
) {
  const ownerIdRef = useRef(`expo-audio-${++audioOwnerSequence}`);
  const playerRef = useRef<AudioPlayer | null>(null);
  const playbackListenerRef = useRef<ActivePlaybackListener | null>(null);
  const playbackCallbacksRef = useRef<VocAudioPlaybackCallbacks>({});
  const playbackStartedRef = useRef(false);
  const requestIdRef = useRef(0);
  const leaseRef = useRef<MediaSessionLease | null>(null);
  const mountedRef = useRef(true);
  const [error, setError] = useState<Error | null>(null);
  const [playbackState, setPlaybackState] =
    useState<VocAudioPlaybackState>("idle");

  const clearError = useCallback(() => {
    if (mountedRef.current) {
      setError(null);
    }
  }, []);

  const stopPlayer = useCallback(
    (
      player: AudioPlayer,
      nextState: VocAudioPlaybackState,
      updateSelection = true,
    ) => {
      const activeListener =
        playbackListenerRef.current?.player === player
          ? playbackListenerRef.current.subscription
          : null;

      if (activeListener) {
        playbackListenerRef.current = null;
      }

      pauseAudioResources(player, activeListener);

      if (playerRef.current === player) {
        playbackStartedRef.current = false;

        if (updateSelection && mountedRef.current) {
          setSelectedAudio(null);
        }

        if (mountedRef.current) {
          setPlaybackState(nextState);
        }
      }
    },
    [setSelectedAudio],
  );

  const discardPlayer = useCallback(
    (
      player: AudioPlayer,
      nextState: VocAudioPlaybackState,
      updateSelection = true,
    ) => {
      const activeListener =
        playbackListenerRef.current?.player === player
          ? playbackListenerRef.current.subscription
          : null;

      if (activeListener) {
        playbackListenerRef.current = null;
      }

      releaseAudioResources(player, activeListener);

      if (playerRef.current === player) {
        playerRef.current = null;
        playbackStartedRef.current = false;

        if (updateSelection && mountedRef.current) {
          setSelectedAudio(null);
        }

        if (mountedRef.current) {
          setPlaybackState(nextState);
        }
      }
    },
    [setSelectedAudio],
  );

  const stopAudio = useCallback(() => {
    requestIdRef.current += 1;
    const player = playerRef.current;

    if (player) {
      stopPlayer(player, "idle");
    } else {
      const orphanedListener =
        playbackListenerRef.current?.subscription ?? null;
      playbackListenerRef.current = null;
      releaseAudioResources(null, orphanedListener);

      if (mountedRef.current) {
        setSelectedAudio(null);
        setPlaybackState("idle");
      }
    }

    const lease = leaseRef.current;
    leaseRef.current = null;
    if (lease) {
      void mediaSession.release(lease);
    }
  }, [setSelectedAudio, stopPlayer]);

  const playAudio = useCallback(
    async (
      audioSource?: AudioAsset,
      id?: string,
      callbacks?:
        | VocAudioPlaybackCallbacks
        | ((playbackError: Error) => void),
    ) => {
      const playbackCallbacks = normalizeCallbacks(callbacks);

      if (!audioSource) {
        const playbackError = new Error("Aucune source audio n’est disponible.");
        stopAudio();

        if (mountedRef.current) {
          setError(playbackError);
          setPlaybackState("error");
        }

        playbackCallbacks.onError?.(playbackError);
        return;
      }

      let player: AudioPlayer | null = null;
      stopAudio();
      const requestId = requestIdRef.current;
      playbackCallbacksRef.current = playbackCallbacks;
      playbackStartedRef.current = false;

      try {
        clearError();

        if (mountedRef.current) {
          setPlaybackState("starting");
        }

        const lease = await mediaSession.claim({
          id: ownerIdRef.current,
          mode: "shortPlayback",
          onInterrupt: () => {
            if (requestId !== requestIdRef.current) return;

            requestIdRef.current += 1;
            leaseRef.current = null;
            const interruptedPlayer = playerRef.current;
            if (interruptedPlayer) {
              stopPlayer(interruptedPlayer, "interrupted");
            }
            playbackCallbacksRef.current.onInterrupted?.();
          },
        });

        if (!lease) return;
        if (requestId !== requestIdRef.current) {
          void mediaSession.release(lease);
          return;
        }
        leaseRef.current = lease;

        if (playerRef.current) {
          player = playerRef.current;
          player.replace(audioSource);
        } else {
          player = createAudioPlayer(audioSource, {
            updateInterval: 250,
          });
          playerRef.current = player;
        }
        const activePlayer = player;

        await activePlayer.seekTo(0);
        if (
          requestId !== requestIdRef.current ||
          playerRef.current !== activePlayer
        ) {
          stopPlayer(activePlayer, "idle");
          return;
        }

        const subscription = activePlayer.addListener(
          "playbackStatusUpdate",
          (status) => {
            if (playerRef.current !== activePlayer) return;

            if (status.error) {
              const playbackError = toPlaybackError(status.error);
              requestIdRef.current += 1;
              discardPlayer(activePlayer, "error");
              const currentLease = leaseRef.current;
              leaseRef.current = null;
              if (currentLease) {
                void mediaSession.release(currentLease);
              }

              if (mountedRef.current) {
                setError(playbackError);
              }

              playbackCallbacksRef.current.onError?.(playbackError);
              return;
            }

            const statusAny = status as AudioStatus;
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

            if (statusAny.playing && !playbackStartedRef.current) {
              playbackStartedRef.current = true;

              if (id && mountedRef.current) {
                setSelectedAudio(id);
              }

              if (mountedRef.current) {
                setPlaybackState("playing");
              }

              Vibration.vibrate(8);
              playbackCallbacksRef.current.onStarted?.();
            }

            if (didFinish) {
              requestIdRef.current += 1;
              const completedAfterNativeStart = playbackStartedRef.current;
              stopPlayer(activePlayer, "completed");
              const currentLease = leaseRef.current;
              leaseRef.current = null;
              if (currentLease) {
                void mediaSession.release(currentLease);
              }

              if (completedAfterNativeStart) {
                playbackCallbacksRef.current.onCompleted?.();
              }
              return;
            }

            const wasInterrupted =
              playbackStartedRef.current &&
              !statusAny.playing &&
              !statusAny.isBuffering &&
              statusAny.isLoaded &&
              statusAny.duration > 0 &&
              statusAny.currentTime < statusAny.duration - 0.05;

            if (wasInterrupted) {
              requestIdRef.current += 1;
              stopPlayer(activePlayer, "interrupted");
              const currentLease = leaseRef.current;
              leaseRef.current = null;
              if (currentLease) {
                void mediaSession.release(currentLease);
              }
              playbackCallbacksRef.current.onInterrupted?.();
            }
          },
        );

        playbackListenerRef.current = {
          player: activePlayer,
          subscription,
        };

        activePlayer.play();
      } catch (caughtError) {
        if (requestId !== requestIdRef.current) return;

        const playbackError = toPlaybackError(caughtError);
        requestIdRef.current += 1;

        if (player) {
          discardPlayer(player, "error");
        } else {
          if (mountedRef.current) {
            setSelectedAudio(null);
            setPlaybackState("error");
          }
        }
        const currentLease = leaseRef.current;
        leaseRef.current = null;
        if (currentLease) {
          void mediaSession.release(currentLease);
        }

        if (mountedRef.current) {
          setError(playbackError);
        }

        playbackCallbacks.onError?.(playbackError);
      }
    },
    [
      clearError,
      discardPlayer,
      setSelectedAudio,
      stopPlayer,
      stopAudio,
    ],
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (playerRef.current && playbackStartedRef.current) {
          playbackCallbacksRef.current.onInterrupted?.();
        }
        stopAudio();
      };
    }, [stopAudio]),
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;

      const player = playerRef.current;
      if (player) {
        discardPlayer(player, "idle", false);
      } else {
        const orphanedListener =
          playbackListenerRef.current?.subscription ?? null;
        playbackListenerRef.current = null;
        releaseAudioResources(null, orphanedListener);
      }
      const lease = leaseRef.current;
      leaseRef.current = null;
      if (lease) {
        void mediaSession.release(lease);
      }
    };
  }, [discardPlayer]);

  return {
    playAudio,
    stopAudio,
    error,
    clearError,
    playbackState,
  };
}
