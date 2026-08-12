import { useFocusEffect } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { mediaSession } from "../lib/mediaSession";
import type { MediaSessionLease } from "../lib/mediaSessionCore";
import {
  classifySpeechRecognitionError,
  INITIAL_SPEECH_RECOGNITION_STATE,
  speechRecognitionReducer,
} from "../lib/speechRecognitionState";
import {
  canRecoverSpeechQuarantine,
  createSpeechSessionLifecycle,
  shouldAcceptNativeSpeechEnd,
  type SpeechSessionLifecycle,
  type SpeechSessionPhase,
  type SpeechSessionTerminal,
} from "../lib/speechSessionCore";
import type {
  SpeechTranscriptSession,
  StartListeningOptions,
  UseKoreanSpeechRecognitionOptions,
} from "./useKoreanSpeechRecognition.types";

type StopNativeOptions = Readonly<{
  abort: boolean;
  acceptFinalResult: boolean;
  terminalPhase: "ended" | "error";
}>;

const IOS_RECOGNITION_CATEGORY = {
  category: "playAndRecord" as const,
  categoryOptions: ["defaultToSpeaker", "allowBluetooth"] as const,
  mode: "measurement" as const,
};

const QUARANTINE_DRAIN_DELAY_MS = 250;

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

let speechRecognitionOwnerSequence = 0;

export function useKoreanSpeechRecognition(
  options: UseKoreanSpeechRecognitionOptions = {},
) {
  const ownerIdRef = useRef(
    `expo-speech-recognition-${++speechRecognitionOwnerSequence}`,
  );
  const [state, dispatch] = useReducer(
    speechRecognitionReducer,
    INITIAL_SPEECH_RECOGNITION_STATE,
  );
  const [phase, setPhase] = useState<SpeechSessionPhase>("idle");
  const mountedRef = useRef(true);
  const leaseRef = useRef<{
    generation: number;
    lease: MediaSessionLease;
  } | null>(null);
  const nativeStartGenerationRef = useRef<number | null>(null);
  const nativeActiveGenerationRef = useRef<number | null>(null);
  const nativeStopGenerationRef = useRef<number | null>(null);
  const coordinatorOwnsReleaseGenerationRef = useRef<number | null>(null);
  const leaseReleaseRef = useRef<{
    generation: number;
    promise: Promise<boolean>;
  } | null>(null);
  const quarantineRecoveryRunnerRef = useRef<(generation: number) => void>(
    () => {},
  );
  const transcriptRef = useRef("");
  const contextRef = useRef<SpeechTranscriptSession | null>(null);
  const pendingFinalTranscriptRef = useRef<{
    generation: number;
    transcript: string;
    session: SpeechTranscriptSession;
  } | null>(null);
  const onFinalTranscriptRef = useRef(options.onFinalTranscript);

  const handlePhaseChange = useCallback((nextPhase: SpeechSessionPhase) => {
    if (mountedRef.current) {
      setPhase(nextPhase);
    }
  }, []);

  const clearNativeGenerationRefs = useCallback((generation: number) => {
    nativeStartGenerationRef.current =
      nativeStartGenerationRef.current === generation
        ? null
        : nativeStartGenerationRef.current;
    nativeActiveGenerationRef.current =
      nativeActiveGenerationRef.current === generation
        ? null
        : nativeActiveGenerationRef.current;
    nativeStopGenerationRef.current =
      nativeStopGenerationRef.current === generation
        ? null
        : nativeStopGenerationRef.current;
  }, []);

  const dropOwnedLeaseForCoordinator = useCallback((generation: number) => {
    if (leaseRef.current?.generation === generation) {
      leaseRef.current = null;
    }
    if (coordinatorOwnsReleaseGenerationRef.current === generation) {
      coordinatorOwnsReleaseGenerationRef.current = null;
    }
  }, []);

  const restoreOwnedLease = useCallback((generation: number) => {
    const pendingRelease = leaseReleaseRef.current;
    if (pendingRelease?.generation === generation) {
      return pendingRelease.promise;
    }

    const ownedSession = leaseRef.current;
    if (ownedSession?.generation !== generation) {
      return Promise.resolve(true);
    }

    const promise = mediaSession
      .restorePlaybackSession(ownedSession.lease)
      .then(() => {
        if (leaseRef.current?.generation === generation) {
          leaseRef.current = null;
        }
        return true;
      })
      .catch(() => false)
      .finally(() => {
        if (leaseReleaseRef.current?.generation === generation) {
          leaseReleaseRef.current = null;
        }
      });

    leaseReleaseRef.current = { generation, promise };
    return promise;
  }, []);

  const flushPendingFinalTranscript = useCallback((generation: number) => {
    const pending = pendingFinalTranscriptRef.current;
    if (!pending || pending.generation !== generation) return false;

    pendingFinalTranscriptRef.current = null;
    if (!mountedRef.current) return false;

    onFinalTranscriptRef.current?.(pending.transcript, pending.session);
    return true;
  }, []);

  const handleTerminal = useCallback(
    ({ generation, reason }: SpeechSessionTerminal) => {
      if (reason === "timeout") {
        quarantineRecoveryRunnerRef.current(generation);
        return;
      }

      clearNativeGenerationRefs(generation);

      if (coordinatorOwnsReleaseGenerationRef.current === generation) {
        dropOwnedLeaseForCoordinator(generation);
        if (pendingFinalTranscriptRef.current?.generation === generation) {
          pendingFinalTranscriptRef.current = null;
        }
        return;
      }

      /*
       * The dialogue must not advance until the recording lease has been
       * restored. Otherwise the next NPC video races the microphone session.
       */
      void restoreOwnedLease(generation).then((released) => {
        if (!released) return;
        flushPendingFinalTranscript(generation);
      });
    },
    [
      clearNativeGenerationRefs,
      dropOwnedLeaseForCoordinator,
      flushPendingFinalTranscript,
      restoreOwnedLease,
    ],
  );

  // Callbacks are stored by the controller and run only on later native/timer events.
  // eslint-disable-next-line react-hooks/refs
  const [lifecycle] = useState<SpeechSessionLifecycle>(() =>
    createSpeechSessionLifecycle({
      onPhaseChange: handlePhaseChange,
      onTerminal: handleTerminal,
    }),
  );

  useEffect(() => {
    onFinalTranscriptRef.current = options.onFinalTranscript;
  }, [options.onFinalTranscript]);

  const requestNativeStop = useCallback(
    (generation: number, stopOptions: StopNativeOptions) => {
      const terminal = lifecycle.beginStopping(generation, {
        acceptFinalResult: stopOptions.acceptFinalResult,
        terminalPhase: stopOptions.terminalPhase,
      });

      if (nativeStopGenerationRef.current === generation) {
        return terminal;
      }

      nativeStopGenerationRef.current = generation;
      try {
        if (stopOptions.abort) {
          ExpoSpeechRecognitionModule.abort();
        } else {
          ExpoSpeechRecognitionModule.stop();
        }
      } catch {
        // Native teardown can already be underway. Ownership remains held
        // until `end` or the generation-bound safety timeout.
      }

      return terminal;
    },
    [lifecycle],
  );

  const interruptSession = useCallback(
    (generation: number) => {
      if (lifecycle.getGeneration() !== generation) {
        return Promise.resolve();
      }

      coordinatorOwnsReleaseGenerationRef.current = generation;

      if (mountedRef.current) {
        dispatch({ type: "reset" });
      }

      transcriptRef.current = "";
      if (pendingFinalTranscriptRef.current?.generation === generation) {
        pendingFinalTranscriptRef.current = null;
      }
      lifecycle.suppressFurtherResults(generation);

      const currentPhase = lifecycle.getPhase();
      if (currentPhase === "quarantined") {
        try {
          ExpoSpeechRecognitionModule.abort();
        } catch {
          // The original native stop can already be draining.
        }
        return lifecycle.waitForTerminal(generation);
      }

      if (
        currentPhase === "idle" ||
        currentPhase === "ended" ||
        currentPhase === "error"
      ) {
        dropOwnedLeaseForCoordinator(generation);
        return Promise.resolve();
      }

      if (nativeStartGenerationRef.current !== generation) {
        lifecycle.finishWithoutNativeStart(generation);
        return lifecycle.waitForTerminal(generation);
      }

      return requestNativeStop(generation, {
        abort: true,
        acceptFinalResult: false,
        terminalPhase: "ended",
      });
    },
    [dropOwnedLeaseForCoordinator, lifecycle, requestNativeStop],
  );

  const deliverFinalTranscript = useCallback(
    (transcript: string) => {
      if (!lifecycle.acceptsResult()) return false;

      const generation = lifecycle.getGeneration();
      const finalTranscript = transcript.trim();
      transcriptRef.current = finalTranscript;
      lifecycle.suppressFurtherResults(generation);
      dispatch({ type: "final", transcript: finalTranscript });

      const session = contextRef.current;
      if (finalTranscript && session?.generation === generation) {
        pendingFinalTranscriptRef.current = {
          generation,
          transcript: finalTranscript,
          session,
        };
      }

      return true;
    },
    [lifecycle],
  );

  useSpeechRecognitionEvent("start", () => {
    const generation = lifecycle.getGeneration();
    if (lifecycle.markActive(generation)) {
      nativeActiveGenerationRef.current = generation;
      dispatch({ type: "native-start" });
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (!lifecycle.acceptsResult()) return;

    const transcript = event.results[0]?.transcript?.trim() || "";
    transcriptRef.current = transcript;

    if (event.isFinal) {
      const generation = lifecycle.getGeneration();

      if (deliverFinalTranscript(transcript)) {
        /*
         * `continuous: false` already makes Android finish the recognizer when
         * a final result is emitted. Calling ExpoSpeechRecognitionModule.stop()
         * again here can leave the native service permanently in "stopping".
         *
         * We only move the JS lifecycle into `stopping` and wait for the native
         * `end` event that naturally follows the final result.
         */
        void lifecycle.beginStopping(generation, {
          acceptFinalResult: false,
          terminalPhase: "ended",
        });
      }

      return;
    }

    dispatch({ type: "partial", transcript });
  });

  useSpeechRecognitionEvent("nomatch", () => {
    if (!lifecycle.acceptsResult()) return;

    const generation = lifecycle.getGeneration();
    lifecycle.suppressFurtherResults(generation);
    dispatch({ type: "failure", failure: "empty" });
    void requestNativeStop(generation, {
      abort: true,
      acceptFinalResult: false,
      terminalPhase: "ended",
    });
  });

  useSpeechRecognitionEvent("error", (event) => {
    const currentPhase = lifecycle.getPhase();
    if (
      currentPhase !== "starting" &&
      currentPhase !== "active" &&
      currentPhase !== "stopping"
    ) {
      return;
    }

    const generation = lifecycle.getGeneration();
    const failure = classifySpeechRecognitionError(event.error);
    lifecycle.suppressFurtherResults(generation);

    if (failure === "cancelled") {
      dispatch({ type: "reset" });
      void requestNativeStop(generation, {
        abort: true,
        acceptFinalResult: false,
        terminalPhase: "ended",
      });
      return;
    }

    dispatch({ type: "failure", failure });
    void requestNativeStop(generation, {
      abort: true,
      acceptFinalResult: false,
      terminalPhase: "error",
    });
  });

  useSpeechRecognitionEvent("audioend", () => {
    // `audioend` confirms capture stopped, but the recognizer can still emit
    // its final result. The lease is deliberately retained until `end`.
  });

  const finalizeNativeEnd = useCallback(() => {
    if (lifecycle.acceptsResult()) {
      const transcript = transcriptRef.current.trim();
      if (transcript) {
        deliverFinalTranscript(transcript);
      } else if (mountedRef.current) {
        dispatch({ type: "failure", failure: "empty" });
      }
    }

    lifecycle.end();
  }, [deliverFinalTranscript, lifecycle]);

  const completeQuarantinedSession = useCallback(
    async (generation: number, clearLifecycle: () => boolean) => {
      if (
        lifecycle.getGeneration() !== generation ||
        lifecycle.getPhase() !== "quarantined"
      ) {
        return false;
      }

      if (coordinatorOwnsReleaseGenerationRef.current === generation) {
        clearNativeGenerationRefs(generation);
        dropOwnedLeaseForCoordinator(generation);
        return clearLifecycle();
      }

      const released = await restoreOwnedLease(generation);
      if (!released) return false;

      if (
        lifecycle.getGeneration() !== generation ||
        lifecycle.getPhase() !== "quarantined"
      ) {
        return true;
      }

      clearNativeGenerationRefs(generation);
      const cleared = clearLifecycle();
      if (cleared) {
        flushPendingFinalTranscript(generation);
      }
      return cleared;
    },
    [
      clearNativeGenerationRefs,
      dropOwnedLeaseForCoordinator,
      flushPendingFinalTranscript,
      lifecycle,
      restoreOwnedLease,
    ],
  );

  const handleNativeEnd = useCallback(async () => {
    if (lifecycle.getPhase() === "quarantined") {
      const generation = lifecycle.getQuarantinedGeneration();
      if (generation !== null) {
        await completeQuarantinedSession(generation, () => lifecycle.end());
      }
      return;
    }

    const observedGeneration = lifecycle.getGeneration();
    const observedPhase = lifecycle.getPhase();

    if (observedPhase === "requested") return;
    if (
      observedPhase === "starting" &&
      nativeActiveGenerationRef.current !== observedGeneration
    ) {
      return;
    }

    const pendingFinal = pendingFinalTranscriptRef.current;

    /*
     * A final result in `continuous: false` is followed by the recognizer's own
     * native `end`. On some Android services getStateAsync() still reports
     * "stopping" while that `end` event is being dispatched. The event itself
     * is the stronger signal here: it is documented as the final event after
     * the recognition service disconnects.
     *
     * This fast path is generation-bound and only applies when this exact
     * session already produced the final transcript that is waiting to advance
     * the dialogue.
     */
    if (
      observedPhase === "stopping" &&
      pendingFinal?.generation === observedGeneration &&
      lifecycle.getGeneration() === observedGeneration
    ) {
      finalizeNativeEnd();
      return;
    }

    try {
      const nativeState = await ExpoSpeechRecognitionModule.getStateAsync();

      if (
        !shouldAcceptNativeSpeechEnd({
          currentGeneration: lifecycle.getGeneration(),
          nativeState,
          observedGeneration,
        })
      ) {
        return;
      }
    } catch {
      // Native events have no session id. When the state probe fails, accepting
      // the event would risk terminating a newer recognizer generation.
      return;
    }

    finalizeNativeEnd();
  }, [completeQuarantinedSession, finalizeNativeEnd, lifecycle]);

  useSpeechRecognitionEvent("end", () => {
    void handleNativeEnd();
  });

  const recoverQuarantinedGeneration = useCallback(
    async (
      expectedGeneration: number,
      {
        attempts,
        requireMounted,
      }: {
        attempts: number;
        requireMounted: boolean;
      },
    ) => {
      let previousState: Awaited<
        ReturnType<typeof ExpoSpeechRecognitionModule.getStateAsync>
      > | null = null;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (
          lifecycle.getGeneration() !== expectedGeneration ||
          lifecycle.getPhase() !== "quarantined"
        ) {
          return lifecycle.getPhase() !== "quarantined";
        }

        if (requireMounted && !mountedRef.current) return false;

        try {
          const currentState =
            await ExpoSpeechRecognitionModule.getStateAsync();

          if (
            previousState !== null &&
            canRecoverSpeechQuarantine({
              currentGeneration: lifecycle.getGeneration(),
              expectedGeneration,
              firstState: previousState,
              phase: lifecycle.getPhase(),
              secondState: currentState,
            })
          ) {
            return completeQuarantinedSession(expectedGeneration, () =>
              lifecycle.recoverFromQuarantine(expectedGeneration),
            );
          }

          previousState = currentState;
        } catch {
          previousState = null;
        }

        if (attempt + 1 < attempts) {
          await delay(QUARANTINE_DRAIN_DELAY_MS);
        }
      }

      return false;
    },
    [completeQuarantinedSession, lifecycle],
  );

  const tryRecoverQuarantinedSession = useCallback(async () => {
    const expectedGeneration = lifecycle.getQuarantinedGeneration();
    if (expectedGeneration === null) {
      return lifecycle.getPhase() !== "quarantined";
    }

    return recoverQuarantinedGeneration(expectedGeneration, {
      attempts: 2,
      requireMounted: true,
    });
  }, [lifecycle, recoverQuarantinedGeneration]);

  useEffect(() => {
    quarantineRecoveryRunnerRef.current = (generation) => {
      void recoverQuarantinedGeneration(generation, {
        attempts: 8,
        requireMounted: false,
      });
    };
  }, [recoverQuarantinedGeneration]);

  const cancelInternal = useCallback(
    (resetState: boolean) => {
      const currentPhase = lifecycle.getPhase();
      const generation = lifecycle.getGeneration();

      if (resetState && mountedRef.current) {
        dispatch({ type: "reset" });
      }

      transcriptRef.current = "";
      if (pendingFinalTranscriptRef.current?.generation === generation) {
        pendingFinalTranscriptRef.current = null;
      }
      lifecycle.suppressFurtherResults(generation);

      if (currentPhase === "quarantined") {
        try {
          ExpoSpeechRecognitionModule.abort();
        } catch {
          // The recognizer can already be fully stopped.
        }
        void recoverQuarantinedGeneration(generation, {
          attempts: 8,
          requireMounted: false,
        });
        return;
      }

      if (
        currentPhase === "requested" ||
        (currentPhase === "starting" &&
          nativeStartGenerationRef.current !== generation)
      ) {
        lifecycle.finishWithoutNativeStart(generation);
        return;
      }

      if (
        currentPhase === "starting" ||
        currentPhase === "active" ||
        currentPhase === "stopping"
      ) {
        void requestNativeStop(generation, {
          abort: true,
          acceptFinalResult: false,
          terminalPhase: "ended",
        });
      }
    },
    [lifecycle, recoverQuarantinedGeneration, requestNativeStop],
  );

  const cancel = useCallback(() => {
    cancelInternal(true);
  }, [cancelInternal]);

  const startListening = useCallback(
    async (startOptions: StartListeningOptions = {}) => {
      const currentPhase = lifecycle.getPhase();
      const staleLease = leaseRef.current;
      if (
        staleLease &&
        (currentPhase === "idle" ||
          currentPhase === "ended" ||
          currentPhase === "error")
      ) {
        const released = await restoreOwnedLease(staleLease.generation);
        if (!released) return false;
      }

      let generation = lifecycle.request();

      if (generation === null && lifecycle.getPhase() === "quarantined") {
        const recovered = await tryRecoverQuarantinedSession();
        if (!recovered) return false;
        generation = lifecycle.request();
      }

      if (generation === null) return false;

      pendingFinalTranscriptRef.current = null;
      transcriptRef.current = "";
      contextRef.current = {
        contextId: startOptions.contextId ?? null,
        generation,
      };
      dispatch({ type: "request" });

      try {
        if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
          dispatch({ type: "failure", failure: "unavailable" });
          lifecycle.failBeforeNativeStart(generation);
          return false;
        }

        const permission =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (
          lifecycle.getGeneration() !== generation ||
          lifecycle.getPhase() !== "requested"
        ) {
          return false;
        }

        dispatch({
          type: "permission-result",
          granted: permission.granted,
        });

        if (!permission.granted) {
          lifecycle.failBeforeNativeStart(generation);
          return false;
        }

        if (!lifecycle.markStarting(generation)) return false;

        const lease = await mediaSession.claim({
          id: ownerIdRef.current,
          mode: "recording",
          onInterrupt: () => interruptSession(generation),
        });

        if (!lease) {
          lifecycle.failBeforeNativeStart(generation);
          return false;
        }

        if (
          lifecycle.getGeneration() !== generation ||
          lifecycle.getPhase() !== "starting"
        ) {
          void mediaSession.release(lease).catch(() => {
            // A newer media generation owns the next cleanup attempt.
          });
          return false;
        }

        leaseRef.current = { generation, lease };
        nativeStartGenerationRef.current = generation;

        ExpoSpeechRecognitionModule.start({
          lang: "ko-KR",
          interimResults: true,
          continuous: false,
          maxAlternatives: 1,
          contextualStrings: [...(startOptions.contextualStrings || [])],
          iosCategory: {
            ...IOS_RECOGNITION_CATEGORY,
            categoryOptions: [...IOS_RECOGNITION_CATEGORY.categoryOptions],
          },
        });
        return true;
      } catch {
        if (lifecycle.getGeneration() !== generation) return false;

        dispatch({ type: "failure", failure: "error" });
        if (nativeStartGenerationRef.current === generation) {
          void requestNativeStop(generation, {
            abort: true,
            acceptFinalResult: false,
            terminalPhase: "error",
          });
        } else {
          lifecycle.failBeforeNativeStart(generation);
        }
        return false;
      }
    },
    [
      interruptSession,
      lifecycle,
      requestNativeStop,
      restoreOwnedLease,
      tryRecoverQuarantinedSession,
    ],
  );

  const stopListening = useCallback(() => {
    const currentPhase = lifecycle.getPhase();
    if (currentPhase !== "starting" && currentPhase !== "active") return;

    const generation = lifecycle.getGeneration();
    dispatch({ type: "stop" });
    void requestNativeStop(generation, {
      abort: false,
      acceptFinalResult: true,
      terminalPhase: "ended",
    });
  }, [lifecycle, requestNativeStop]);

  useFocusEffect(
    useCallback(() => {
      return () => cancelInternal(false);
    }, [cancelInternal]),
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelInternal(false);
    };
  }, [cancelInternal]);

  return {
    cancel,
    phase,
    reset: cancel,
    startListening,
    state,
    stopListening,
  };
}
