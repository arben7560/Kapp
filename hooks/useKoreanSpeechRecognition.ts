import { useFocusEffect } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  classifySpeechRecognitionError,
  INITIAL_SPEECH_RECOGNITION_STATE,
  speechRecognitionReducer,
} from "../lib/speechRecognitionState";
import { mediaSession } from "../lib/mediaSession";
import type { MediaSessionLease } from "../lib/mediaSessionCore";
import {
  createSpeechSessionLifecycle,
  type SpeechSessionLifecycle,
  type SpeechSessionPhase,
} from "../lib/speechSessionCore";

export type SpeechTranscriptSession = Readonly<{
  contextId: string | null;
  generation: number;
}>;

type StartListeningOptions = {
  contextualStrings?: readonly string[];
  contextId?: string;
};

type UseKoreanSpeechRecognitionOptions = {
  onFinalTranscript?: (
    transcript: string,
    session: SpeechTranscriptSession,
  ) => void;
};

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
  const nativeStopGenerationRef = useRef<number | null>(null);
  const transcriptRef = useRef("");
  const contextRef = useRef<SpeechTranscriptSession | null>(null);
  const onFinalTranscriptRef = useRef(options.onFinalTranscript);

  const handlePhaseChange = useCallback((nextPhase: SpeechSessionPhase) => {
    if (mountedRef.current) {
      setPhase(nextPhase);
    }
  }, []);

  const handleTerminal = useCallback(({ generation }: { generation: number }) => {
    nativeStartGenerationRef.current =
      nativeStartGenerationRef.current === generation
        ? null
        : nativeStartGenerationRef.current;
    nativeStopGenerationRef.current =
      nativeStopGenerationRef.current === generation
        ? null
        : nativeStopGenerationRef.current;

    const ownedSession = leaseRef.current;
    if (ownedSession?.generation !== generation) return;

    leaseRef.current = null;
    void mediaSession.restorePlaybackSession(ownedSession.lease);
  }, []);

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

      if (mountedRef.current) {
        dispatch({ type: "reset" });
      }

      transcriptRef.current = "";
      lifecycle.suppressFurtherResults(generation);

      if (nativeStartGenerationRef.current !== generation) {
        lifecycle.finishWithoutNativeStart(generation);
        return Promise.resolve();
      }

      return requestNativeStop(generation, {
        abort: true,
        acceptFinalResult: false,
        terminalPhase: "ended",
      });
    },
    [lifecycle, requestNativeStop],
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
      if (
        finalTranscript &&
        session?.generation === generation
      ) {
        onFinalTranscriptRef.current?.(finalTranscript, session);
      }

      return true;
    },
    [lifecycle],
  );

  useSpeechRecognitionEvent("start", () => {
    const generation = lifecycle.getGeneration();
    lifecycle.markActive(generation);
    if (lifecycle.getPhase() === "active") {
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
        void requestNativeStop(generation, {
          abort: false,
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

  useSpeechRecognitionEvent("end", () => {
    if (lifecycle.acceptsResult()) {
      const transcript = transcriptRef.current.trim();
      if (transcript) {
        deliverFinalTranscript(transcript);
      } else {
        dispatch({ type: "failure", failure: "empty" });
      }
    }

    lifecycle.end();
  });

  const cancelInternal = useCallback(
    (resetState: boolean) => {
      const currentPhase = lifecycle.getPhase();
      const generation = lifecycle.getGeneration();

      if (resetState && mountedRef.current) {
        dispatch({ type: "reset" });
      }

      transcriptRef.current = "";
      lifecycle.suppressFurtherResults(generation);

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
    [lifecycle, requestNativeStop],
  );

  const cancel = useCallback(() => {
    cancelInternal(true);
  }, [cancelInternal]);

  const startListening = useCallback(
    async (startOptions: StartListeningOptions = {}) => {
      const generation = lifecycle.request();
      if (generation === null) return false;

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
          void mediaSession.release(lease);
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
    [interruptSession, lifecycle, requestNativeStop],
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
