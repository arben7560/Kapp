export type SpeechRecognitionStatus =
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

export type SpeechRecognitionFailure =
  | "permission-denied"
  | "unavailable"
  | "empty"
  | "error"
  | "cancelled";

export type SpeechRecognitionState = {
  status: SpeechRecognitionStatus;
  transcript: string;
  message: string | null;
};

export type SpeechRecognitionAction =
  | { type: "request" }
  | { type: "permission-result"; granted: boolean }
  | { type: "native-start" }
  | { type: "partial"; transcript: string }
  | { type: "stop" }
  | { type: "final"; transcript: string }
  | {
      type: "failure";
      failure: Exclude<SpeechRecognitionFailure, "cancelled">;
      message?: string;
    }
  | { type: "reset" };

export const INITIAL_SPEECH_RECOGNITION_STATE: SpeechRecognitionState = {
  status: "idle",
  transcript: "",
  message: null,
};

export function getSpeechRecognitionFailureMessage(
  failure: Exclude<SpeechRecognitionFailure, "cancelled">,
) {
  switch (failure) {
    case "permission-denied":
      return "L’accès au micro a été refusé. Tu peux autoriser le micro dans les réglages ou utiliser « Besoin d’aide ».";
    case "unavailable":
      return "La reconnaissance vocale n’est pas disponible sur cet appareil ou ce navigateur. Utilise « Besoin d’aide » pour continuer.";
    case "empty":
      return "Aucune parole n’a été reconnue. Réessaie ou affiche les réponses proposées.";
    case "error":
      return "La reconnaissance vocale a rencontré un problème. Réessaie ou utilise les réponses proposées.";
  }
}

export function classifySpeechRecognitionError(
  errorCode: string,
): SpeechRecognitionFailure {
  switch (errorCode) {
    case "aborted":
      return "cancelled";
    case "not-allowed":
      return "permission-denied";
    case "service-not-allowed":
    case "language-not-supported":
      return "unavailable";
    case "no-speech":
    case "speech-timeout":
      return "empty";
    default:
      return "error";
  }
}

export function speechRecognitionReducer(
  state: SpeechRecognitionState,
  action: SpeechRecognitionAction,
): SpeechRecognitionState {
  switch (action.type) {
    case "request":
      return {
        status: "requesting-permission",
        transcript: "",
        message: null,
      };
    case "permission-result":
      if (action.granted) {
        return { ...state, status: "starting", message: null };
      }

      return {
        status: "permission-denied",
        transcript: "",
        message: getSpeechRecognitionFailureMessage("permission-denied"),
      };
    case "native-start":
      return { ...state, status: "listening", message: null };
    case "partial":
      return {
        status: "listening",
        transcript: action.transcript,
        message: null,
      };
    case "stop":
      return { ...state, status: "processing", message: null };
    case "final": {
      const transcript = action.transcript.trim();

      if (!transcript) {
        return {
          status: "empty",
          transcript: "",
          message: getSpeechRecognitionFailureMessage("empty"),
        };
      }

      return {
        status: "recognized",
        transcript,
        message: null,
      };
    }
    case "failure":
      return {
        status: action.failure,
        transcript: state.transcript,
        message:
          action.message || getSpeechRecognitionFailureMessage(action.failure),
      };
    case "reset":
      return { ...INITIAL_SPEECH_RECOGNITION_STATE };
  }
}
