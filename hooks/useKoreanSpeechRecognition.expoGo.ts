import { useCallback, useState } from "react";
import { Alert } from "react-native";

import {
  INITIAL_SPEECH_RECOGNITION_STATE,
  type SpeechRecognitionState,
} from "../lib/speechRecognitionState";
import type {
  StartListeningOptions,
  UseKoreanSpeechRecognition,
  UseKoreanSpeechRecognitionOptions,
} from "./useKoreanSpeechRecognition.types";

export const EXPO_GO_SPEECH_RECOGNITION_MESSAGE =
  "La reconnaissance vocale n’est pas disponible dans Expo Go. Utilisez un Development Build pour tester cette fonctionnalité.";

export const useKoreanSpeechRecognition: UseKoreanSpeechRecognition = (
  _options: UseKoreanSpeechRecognitionOptions = {},
) => {
  const [state, setState] = useState<SpeechRecognitionState>(
    INITIAL_SPEECH_RECOGNITION_STATE,
  );

  const reset = useCallback(() => {
    setState({ ...INITIAL_SPEECH_RECOGNITION_STATE });
  }, []);

  const startListening = useCallback(
    async (_startOptions: StartListeningOptions = {}) => {
      setState({
        status: "unavailable",
        transcript: "",
        message: EXPO_GO_SPEECH_RECOGNITION_MESSAGE,
      });

      Alert.alert(
        "Reconnaissance vocale indisponible",
        EXPO_GO_SPEECH_RECOGNITION_MESSAGE,
      );

      return false;
    },
    [],
  );

  const stopListening = useCallback(() => {}, []);

  return {
    cancel: reset,
    phase: "idle",
    reset,
    startListening,
    state,
    stopListening,
  };
};
