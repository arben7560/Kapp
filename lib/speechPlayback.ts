import * as NativeSpeech from "expo-speech";
import type { SpeechOptions } from "expo-speech";

import { runIfCurrentGeneration } from "./callbackGeneration";
import { hasKoreanReviewText, selectKoreanReviewVoice } from "./koreanReviewVoice";
import { mediaSession } from "./mediaSession";
import type { MediaSessionLease } from "./mediaSessionCore";

const SPEECH_OWNER_ID = "expo-speech";
let speechGeneration = 0;
let speechOperation = Promise.resolve();
let activeLease: MediaSessionLease | null = null;

export function speak(text: string, options: SpeechOptions = {}) {
  queueSpeech(text, options);
}

export function speakKoreanReview(
  text: string,
  callbacks: Readonly<{ onStart: () => void; onUnavailable: () => void }>,
) {
  queueSpeech(
    text,
    {
      rate: 0.95,
      pitch: 1,
      onStart: callbacks.onStart,
      onError: callbacks.onUnavailable,
    },
    callbacks.onUnavailable,
  );
}

function queueSpeech(
  text: string,
  options: SpeechOptions,
  onKoreanUnavailable?: () => void,
) {
  const generation = ++speechGeneration;

  speechOperation = speechOperation
    .catch(() => {
      // A failed utterance must not poison later stop/speak operations.
    })
    .then(async () => {
      const lease = await mediaSession.claim({
        id: SPEECH_OWNER_ID,
        mode: "shortPlayback",
        onInterrupt: () => NativeSpeech.stop(),
      });

      if (!lease || generation !== speechGeneration) return;
      activeLease = lease;

      await NativeSpeech.stop().catch(() => {});
      if (generation !== speechGeneration) return;

      const releaseIfCurrent = () => {
        if (generation === speechGeneration) {
          if (activeLease === lease) {
            activeLease = null;
          }
          void mediaSession.release(lease);
        }
      };

      let selectedOptions = options;
      if (onKoreanUnavailable) {
        const voice = hasKoreanReviewText(text)
          ? await NativeSpeech.getAvailableVoicesAsync()
              .then(selectKoreanReviewVoice)
              .catch(() => undefined)
          : undefined;
        if (generation !== speechGeneration) return;
        if (!voice) {
          releaseIfCurrent();
          onKoreanUnavailable();
          return;
        }
        selectedOptions = {
          ...options,
          language: "ko-KR",
          voice: voice.identifier,
        };
      }

      try {
        NativeSpeech.speak(text, {
          ...selectedOptions,
          // This lets expo-speech share the explicitly configured app session.
          // iOS still does not guarantee TTS playback through the silent switch.
          useApplicationAudioSession: true,
          onDone: (...args) => {
            releaseIfCurrent();
            const callback = options.onDone;
            if (typeof callback === "function") {
              runIfCurrentGeneration(
                generation,
                () => speechGeneration,
                callback as (...callbackArgs: unknown[]) => void,
                ...args,
              );
            }
          },
          onError: (error) => {
            releaseIfCurrent();
            runIfCurrentGeneration(
              generation,
              () => speechGeneration,
              options.onError,
              error,
            );
          },
          onStart: (...args) => {
            const callback = options.onStart;
            if (typeof callback === "function") {
              runIfCurrentGeneration(
                generation,
                () => speechGeneration,
                callback as (...callbackArgs: unknown[]) => void,
                ...args,
              );
            }
          },
          onStopped: (...args) => {
            releaseIfCurrent();
            const callback = options.onStopped;
            if (typeof callback === "function") {
              runIfCurrentGeneration(
                generation,
                () => speechGeneration,
                callback as (...callbackArgs: unknown[]) => void,
                ...args,
              );
            }
          },
        });
      } catch (error) {
        releaseIfCurrent();
        throw error;
      }
    })
    .catch(() => {
      if (generation === speechGeneration && onKoreanUnavailable) {
        onKoreanUnavailable();
      }
      // Other TTS consumers keep their current UI.
    });
}

export function stop() {
  const generation = ++speechGeneration;

  speechOperation = speechOperation
    .catch(() => {})
    .then(async () => {
      await NativeSpeech.stop().catch(() => {});

      if (generation === speechGeneration) {
        const lease = activeLease;
        activeLease = null;
        if (lease) {
          await mediaSession.release(lease);
        }
      }
    });

  return speechOperation;
}
