import { useIsFocused } from "expo-router";
import type { VideoPlayer, VideoSource } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { createSerializedLatestRequest } from "../lib/latestMediaRequest";
import { mediaSession } from "../lib/mediaSession";
import type { MediaSessionLease } from "../lib/mediaSessionCore";
import { shouldStartVideoPlayback } from "../lib/mediaPlaybackPolicy";
import {
  createVideoSourceGenerationController,
  type VideoSourceGeneration,
} from "../lib/videoSourceGeneration";

/* eslint-disable react-hooks/immutability -- expo-video exposes an imperative native SharedObject by design. */

export type ImmersiveVideoPlaybackStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "playing"
  | "interrupted"
  | "ended"
  | "error";

type ImmersiveVideoLifecycleOptions = Readonly<{
  onError?: (message: string) => void;
  onPlayToEnd?: () => void;
}>;

type VideoSubscription = { remove: () => void };

let videoOwnerSequence = 0;

function pauseSafely(player: VideoPlayer) {
  try {
    player.pause();
  } catch {
    // The SharedObject can already be released during route teardown.
  }
}

function removeSubscriptions(subscriptions: readonly VideoSubscription[]) {
  for (const subscription of subscriptions) {
    try {
      subscription.remove();
    } catch {
      // A native subscription can already be gone during player teardown.
    }
  }
}

/**
 * Event-driven video lifecycle. Every replacement installs generation-bound
 * native callbacks only after `replaceAsync` confirms the current source.
 */
export function useImmersiveVideoLifecycle(
  player: VideoPlayer,
  source: number | null,
  shouldPlay: boolean,
  options: ImmersiveVideoLifecycleOptions = {},
) {
  const isFocused = useIsFocused();
  const ownerIdRef = useRef(`expo-video-${++videoOwnerSequence}`);
  const sourceRef = useRef(source);
  const shouldPlayRef = useRef(shouldPlay);
  const focusedRef = useRef(isFocused);
  const playbackRequestRef = useRef(0);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const resumeRequiredRef = useRef(false);
  const confirmedSourceGenerationRef =
    useRef<VideoSourceGeneration | null>(null);
  const leaseRef = useRef<{
    lease: MediaSessionLease;
    sourceGeneration: number;
  } | null>(null);
  const subscriptionsRef = useRef<VideoSubscription[]>([]);
  const replacementQueueRef = useRef(createSerializedLatestRequest());
  const sourceGenerationRef = useRef(
    createVideoSourceGenerationController(),
  );
  const onErrorRef = useRef(options.onError);
  const onPlayToEndRef = useRef(options.onPlayToEnd);
  const beginPlaybackRef = useRef<(manual: boolean) => Promise<boolean>>(
    async () => false,
  );
  const [status, setStatus] = useState<ImmersiveVideoPlaybackStatus>(
    source ? "loading" : "idle",
  );

  const releaseLease = useCallback(
    (expectedGeneration?: VideoSourceGeneration) => {
      const ownedSession = leaseRef.current;
      if (!ownedSession) return;
      if (
        expectedGeneration &&
        ownedSession.sourceGeneration !== expectedGeneration.generation
      ) {
        return;
      }

      leaseRef.current = null;
      void mediaSession.release(ownedSession.lease);
    },
    [],
  );

  const interruptPlayback = useCallback(
    (
      requireManualResume: boolean,
      expectedGeneration?: VideoSourceGeneration,
      coordinatorOwnsRelease = false,
    ) => {
      if (
        expectedGeneration &&
        !sourceGenerationRef.current.isCurrent(expectedGeneration)
      ) {
        return;
      }

      playbackRequestRef.current += 1;
      pauseSafely(player);
      if (coordinatorOwnsRelease) {
        leaseRef.current = null;
      } else {
        releaseLease(expectedGeneration);
      }

      if (
        requireManualResume &&
        sourceRef.current &&
        shouldPlayRef.current &&
        !endedRef.current
      ) {
        resumeRequiredRef.current = true;
        setStatus("interrupted");
      }
    },
    [player, releaseLease],
  );

  const beginPlayback = useCallback(
    async (manual: boolean) => {
      const confirmedGeneration = confirmedSourceGenerationRef.current;
      const generationForPlayback =
        confirmedGeneration &&
        sourceGenerationRef.current.shouldHandleEvent(confirmedGeneration)
          ? confirmedGeneration
          : null;

      if (
        !generationForPlayback ||
        !shouldStartVideoPlayback({
          appState: AppState.currentState,
          hasSource: Boolean(sourceRef.current),
          isFocused: focusedRef.current,
          resumeRequired: manual ? false : resumeRequiredRef.current,
          shouldPlay: shouldPlayRef.current,
        })
      ) {
        return false;
      }

      const requestId = ++playbackRequestRef.current;
      if (manual) {
        resumeRequiredRef.current = false;
      }

      let lease: MediaSessionLease | null;
      try {
        lease = await mediaSession.claim({
          id: ownerIdRef.current,
          mode: "videoPlayback",
          onInterrupt: () => {
            if (requestId !== playbackRequestRef.current) return;
            interruptPlayback(
              true,
              generationForPlayback,
              true,
            );
          },
        });
      } catch (error) {
        if (
          requestId === playbackRequestRef.current &&
          sourceGenerationRef.current.shouldHandleEvent(
            generationForPlayback,
          )
        ) {
          const message =
            error instanceof Error
              ? error.message
              : "La vidéo n’a pas pu démarrer.";
          setStatus("error");
          onErrorRef.current?.(message);
        }
        return false;
      }

      if (!lease) return false;
      if (
        requestId !== playbackRequestRef.current ||
        !sourceGenerationRef.current.shouldHandleEvent(
          generationForPlayback,
        ) ||
        !sourceRef.current ||
        !shouldPlayRef.current ||
        !focusedRef.current ||
        AppState.currentState !== "active"
      ) {
        void mediaSession.release(lease);
        return false;
      }

      leaseRef.current = {
        lease,
        sourceGeneration: generationForPlayback.generation,
      };

      try {
        player.play();
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "La vidéo n’a pas pu démarrer.";
        setStatus("error");
        onErrorRef.current?.(message);
        releaseLease(generationForPlayback);
        return false;
      }
    },
    [interruptPlayback, player, releaseLease],
  );

  useEffect(() => {
    beginPlaybackRef.current = beginPlayback;
  }, [beginPlayback]);

  const installGenerationListeners = useCallback(
    (sourceGeneration: VideoSourceGeneration) => {
      removeSubscriptions(subscriptionsRef.current);

      const isCurrentEvent = () =>
        sourceGenerationRef.current.shouldHandleEvent(sourceGeneration);

      const statusSubscription = player.addListener(
        "statusChange",
        ({ status: nativeStatus, error }) => {
          if (!isCurrentEvent() || !sourceRef.current) return;

          if (nativeStatus === "error") {
            playbackRequestRef.current += 1;
            pauseSafely(player);
            setStatus("error");
            onErrorRef.current?.(
              error?.message || "Impossible de lire cette vidéo.",
            );
            releaseLease(sourceGeneration);
            return;
          }

          if (nativeStatus === "loading") {
            setStatus("loading");
            return;
          }

          if (nativeStatus === "readyToPlay") {
            setStatus((current) =>
              current === "playing" || current === "interrupted"
                ? current
                : "loaded",
            );
            void beginPlaybackRef.current(false);
          }
        },
      );

      const playingSubscription = player.addListener(
        "playingChange",
        ({ isPlaying }) => {
          if (!isCurrentEvent() || !sourceRef.current) return;

          if (isPlaying) {
            startedRef.current = true;
            endedRef.current = false;
            setStatus("playing");
            return;
          }

          if (
            startedRef.current &&
            shouldPlayRef.current &&
            !endedRef.current
          ) {
            resumeRequiredRef.current = true;
            setStatus("interrupted");
            releaseLease(sourceGeneration);
          }
        },
      );

      const endSubscription = player.addListener("playToEnd", () => {
        if (
          !isCurrentEvent() ||
          !sourceRef.current ||
          !startedRef.current ||
          endedRef.current
        ) {
          return;
        }

        endedRef.current = true;
        resumeRequiredRef.current = false;
        setStatus("ended");
        releaseLease(sourceGeneration);
        onPlayToEndRef.current?.();
      });

      subscriptionsRef.current = [
        statusSubscription,
        playingSubscription,
        endSubscription,
      ];
    },
    [player, releaseLease],
  );

  const replaceSource = useCallback(
    async (nextSource: VideoSource) => {
      const sourceGeneration =
        sourceGenerationRef.current.beginReplacement();
      confirmedSourceGenerationRef.current = null;
      playbackRequestRef.current += 1;
      startedRef.current = false;
      endedRef.current = false;
      resumeRequiredRef.current = false;
      removeSubscriptions(subscriptionsRef.current);
      subscriptionsRef.current = [];
      pauseSafely(player);
      releaseLease();
      setStatus(nextSource ? "loading" : "idle");

      try {
        const replacement = await replacementQueueRef.current.run(() =>
          player.replaceAsync(nextSource),
        );

        if (
          !replacement.current ||
          !sourceGenerationRef.current.confirmReplacement(sourceGeneration)
        ) {
          return false;
        }

        confirmedSourceGenerationRef.current = sourceGeneration;
        installGenerationListeners(sourceGeneration);

        if (!nextSource) return true;

        player.currentTime = 0;
        if (player.status === "readyToPlay") {
          setStatus("loaded");
          void beginPlaybackRef.current(false);
        }
        return true;
      } catch (error) {
        if (!sourceGenerationRef.current.isCurrent(sourceGeneration)) {
          return false;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Impossible de lire cette vidéo.";
        setStatus("error");
        onErrorRef.current?.(message);
        releaseLease(sourceGeneration);
        return false;
      }
    },
    [installGenerationListeners, player, releaseLease],
  );

  useEffect(() => {
    onErrorRef.current = options.onError;
    onPlayToEndRef.current = options.onPlayToEnd;
  }, [options.onError, options.onPlayToEnd]);

  useEffect(() => {
    sourceRef.current = source;
    sourceGenerationRef.current.invalidate();
    confirmedSourceGenerationRef.current = null;
    replacementQueueRef.current.invalidate();
    playbackRequestRef.current += 1;
    startedRef.current = false;
    endedRef.current = false;
    resumeRequiredRef.current = false;
    removeSubscriptions(subscriptionsRef.current);
    subscriptionsRef.current = [];
    pauseSafely(player);
    releaseLease();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- A source change starts a new native playback transaction.
    setStatus(source ? "loading" : "idle");
  }, [player, releaseLease, source]);

  useEffect(() => {
    shouldPlayRef.current = shouldPlay;

    if (!shouldPlay) {
      interruptPlayback(false);
      return;
    }

    void Promise.resolve().then(() => beginPlayback(false));
  }, [beginPlayback, interruptPlayback, shouldPlay]);

  useEffect(() => {
    focusedRef.current = isFocused;
    if (!isFocused) {
      interruptPlayback(true);
    }
    // Returning focus deliberately does not restart playback.
  }, [interruptPlayback, isFocused]);

  useEffect(() => {
    const sourceGeneration = sourceGenerationRef.current;
    const replacementQueue = replacementQueueRef.current;

    player.staysActiveInBackground = false;
    player.showNowPlayingNotification = false;
    player.audioMixingMode = "doNotMix";
    player.allowsExternalPlayback = false;
    player.timeUpdateEventInterval = 0.25;

    return () => {
      sourceGeneration.invalidate();
      confirmedSourceGenerationRef.current = null;
      replacementQueue.invalidate();
      playbackRequestRef.current += 1;
      removeSubscriptions(subscriptionsRef.current);
      subscriptionsRef.current = [];
      releaseLease();
    };
  }, [player, releaseLease]);

  const resume = useCallback(() => beginPlayback(true), [beginPlayback]);

  const markLoading = useCallback(() => {
    setStatus(sourceRef.current ? "loading" : "idle");
  }, []);

  const markError = useCallback(
    (message = "Impossible de lire cette vidéo.") => {
      sourceGenerationRef.current.invalidate();
      confirmedSourceGenerationRef.current = null;
      replacementQueueRef.current.invalidate();
      playbackRequestRef.current += 1;
      removeSubscriptions(subscriptionsRef.current);
      subscriptionsRef.current = [];
      pauseSafely(player);
      setStatus("error");
      onErrorRef.current?.(message);
      releaseLease();
    },
    [player, releaseLease],
  );

  return {
    markError,
    markLoading,
    replaceSource,
    resume,
    status,
  };
}

/* eslint-enable react-hooks/immutability */
