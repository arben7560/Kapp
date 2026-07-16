import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useReducer, useRef } from "react";

import {
  classifySpeechRecognitionError,
  INITIAL_SPEECH_RECOGNITION_STATE,
  speechRecognitionReducer,
} from "../lib/speechRecognitionState";

type StartListeningOptions = {
  contextualStrings?: readonly string[];
};

type UseKoreanSpeechRecognitionOptions = {
  onFinalTranscript?: (transcript: string) => void;
};

export function useKoreanSpeechRecognition(
  options: UseKoreanSpeechRecognitionOptions = {},
) {
  const [state, dispatch] = useReducer(
    speechRecognitionReducer,
    INITIAL_SPEECH_RECOGNITION_STATE,
  );
  const activeRef = useRef(false);
  const sessionIdRef = useRef(0);
  const transcriptRef = useRef("");
  const onFinalTranscriptRef = useRef(options.onFinalTranscript);

  useEffect(() => {
    onFinalTranscriptRef.current = options.onFinalTranscript;
  }, [options.onFinalTranscript]);

  const finishWithTranscript = useCallback((transcript: string) => {
    if (!activeRef.current) return;

    const finalTranscript = transcript.trim();
    activeRef.current = false;
    transcriptRef.current = finalTranscript;
    dispatch({ type: "final", transcript: finalTranscript });

    if (finalTranscript) {
      onFinalTranscriptRef.current?.(finalTranscript);
    }
  }, []);

  useSpeechRecognitionEvent("start", () => {
    if (!activeRef.current) return;
    dispatch({ type: "native-start" });
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (!activeRef.current) return;

    const transcript = event.results[0]?.transcript?.trim() || "";
    transcriptRef.current = transcript;

    if (event.isFinal) {
      finishWithTranscript(transcript);
      return;
    }

    dispatch({ type: "partial", transcript });
  });

  useSpeechRecognitionEvent("nomatch", () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    dispatch({ type: "failure", failure: "empty" });
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (!activeRef.current) return;

    activeRef.current = false;
    const failure = classifySpeechRecognitionError(event.error);

    if (failure === "cancelled") {
      dispatch({ type: "reset" });
      return;
    }

    dispatch({ type: "failure", failure });
  });

  useSpeechRecognitionEvent("end", () => {
    if (!activeRef.current) return;
    finishWithTranscript(transcriptRef.current);
  });

  const cancelInternal = useCallback((resetState: boolean) => {
    sessionIdRef.current += 1;
    const wasActive = activeRef.current;
    activeRef.current = false;
    transcriptRef.current = "";

    if (wasActive) {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // The recognizer may already have disconnected.
      }
    }

    if (resetState) {
      dispatch({ type: "reset" });
    }
  }, []);

  const cancel = useCallback(() => {
    cancelInternal(true);
  }, [cancelInternal]);

  const startListening = useCallback(
    async (startOptions: StartListeningOptions = {}) => {
      cancelInternal(false);
      const sessionId = sessionIdRef.current;
      dispatch({ type: "request" });

      try {
        if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
          dispatch({ type: "failure", failure: "unavailable" });
          return;
        }

        const permission =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (sessionId !== sessionIdRef.current) return;

        dispatch({
          type: "permission-result",
          granted: permission.granted,
        });

        if (!permission.granted) return;

        transcriptRef.current = "";
        activeRef.current = true;

        ExpoSpeechRecognitionModule.start({
          lang: "ko-KR",
          interimResults: true,
          continuous: false,
          maxAlternatives: 1,
          contextualStrings: [...(startOptions.contextualStrings || [])],
        });
      } catch {
        if (sessionId !== sessionIdRef.current) return;
        activeRef.current = false;
        dispatch({ type: "failure", failure: "error" });
      }
    },
    [cancelInternal],
  );

  const stopListening = useCallback(() => {
    if (!activeRef.current) return;

    dispatch({ type: "stop" });

    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      activeRef.current = false;
      dispatch({ type: "failure", failure: "error" });
    }
  }, []);

  useEffect(() => {
    return () => cancelInternal(false);
  }, [cancelInternal]);

  return {
    state,
    startListening,
    stopListening,
    cancel,
    reset: cancel,
  };
}
