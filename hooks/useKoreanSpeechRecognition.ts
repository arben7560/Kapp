import { isRunningInExpoGo } from "expo";

import {
  useKoreanSpeechRecognition as useExpoGoSpeechRecognition,
} from "./useKoreanSpeechRecognition.expoGo";
import type { UseKoreanSpeechRecognition } from "./useKoreanSpeechRecognition.types";

type SpeechRecognitionImplementation = Readonly<{
  useKoreanSpeechRecognition: UseKoreanSpeechRecognition;
}>;

/*
 * Metro includes the native implementation in the bundle, but does not evaluate
 * it until this guarded require runs. Expo Go always selects the dependency-free
 * fallback; Development Builds and standalone native builds load the real module.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const implementation: SpeechRecognitionImplementation = isRunningInExpoGo()
  ? { useKoreanSpeechRecognition: useExpoGoSpeechRecognition }
  : (require("./useKoreanSpeechRecognition.nativeImpl") as SpeechRecognitionImplementation);
/* eslint-enable @typescript-eslint/no-require-imports */

export const useKoreanSpeechRecognition =
  implementation.useKoreanSpeechRecognition;

export type { SpeechTranscriptSession } from "./useKoreanSpeechRecognition.types";
