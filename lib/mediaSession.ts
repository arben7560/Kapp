import { setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";

import {
  createMediaSessionCoordinator,
  type MediaSessionMode,
} from "./mediaSessionCore";

const PLAYBACK_AUDIO_MODE = {
  allowsBackgroundRecording: false,
  allowsRecording: false,
  interruptionMode: "doNotMix" as const,
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
};

const RECORDING_AUDIO_MODE = {
  allowsBackgroundRecording: false,
  allowsRecording: true,
  interruptionMode: "doNotMix" as const,
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
};

async function applyNativeMode(mode: MediaSessionMode) {
  if (mode === "recording") {
    await setAudioModeAsync(RECORDING_AUDIO_MODE);
    return;
  }

  if (mode === "inactive") {
    // Re-activating after applying a non-recording category forces iOS away
    // from the receiver route left behind by play-and-record sessions.
    await setIsAudioActiveAsync(false).catch(() => {});
    await setAudioModeAsync(PLAYBACK_AUDIO_MODE);
    await setIsAudioActiveAsync(true);
    return;
  }

  await setAudioModeAsync(PLAYBACK_AUDIO_MODE);
}

export const mediaSession = createMediaSessionCoordinator({
  applyMode: applyNativeMode,
});

export const NORMAL_PLAYBACK_AUDIO_MODE = PLAYBACK_AUDIO_MODE;
export const RECORDING_SESSION_AUDIO_MODE = RECORDING_AUDIO_MODE;
