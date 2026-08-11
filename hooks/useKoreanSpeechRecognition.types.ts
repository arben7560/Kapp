import type { SpeechRecognitionState } from "../lib/speechRecognitionState";
import type { SpeechSessionPhase } from "../lib/speechSessionCore";

export type SpeechTranscriptSession = Readonly<{
  contextId: string | null;
  generation: number;
}>;

export type StartListeningOptions = Readonly<{
  contextualStrings?: readonly string[];
  contextId?: string;
}>;

export type UseKoreanSpeechRecognitionOptions = Readonly<{
  onFinalTranscript?: (
    transcript: string,
    session: SpeechTranscriptSession,
  ) => void;
}>;

export type KoreanSpeechRecognitionController = Readonly<{
  cancel: () => void;
  phase: SpeechSessionPhase;
  reset: () => void;
  startListening: (options?: StartListeningOptions) => Promise<boolean>;
  state: SpeechRecognitionState;
  stopListening: () => void;
}>;

export type UseKoreanSpeechRecognition = (
  options?: UseKoreanSpeechRecognitionOptions,
) => KoreanSpeechRecognitionController;
