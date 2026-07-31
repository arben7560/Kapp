import { useCallback, useState } from "react";
import { Alert } from "react-native";

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

type SpeechStatus =
  | "idle"
  | "requesting-permission"
  | "starting"
  | "listening"
  | "processing"
  | "recognized"
  | "permission-denied"
  | "unavailable"
  | "empty"
  | "error";

const INITIAL_STATE = {
  status: "idle" as SpeechStatus,
  transcript: "",
  message: null as string | null,
};

export function useKoreanSpeechRecognition(
  _options: UseKoreanSpeechRecognitionOptions = {},
) {
  const [state, setState] = useState(INITIAL_STATE);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const startListening = useCallback(
    async (_startOptions: StartListeningOptions = {}) => {
      setState({
        status: "unavailable",
        transcript: "",
        message: null,
      });

      Alert.alert(
        "Reconnaissance vocale indisponible",
        "La reconnaissance vocale ne peut pas être utilisée dans Expo Go.",
      );

      return false;
    },
    [],
  );

  const stopListening = useCallback(() => {
    // Aucun module vocal dans Expo Go.
  }, []);

  return {
    cancel: reset,
    phase: "idle" as const,
    reset,
    startListening,
    state,
    stopListening,
  };
}
