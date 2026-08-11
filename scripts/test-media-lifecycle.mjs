import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { releaseAudioResources } from "../lib/audioPlayerLifecycle.ts";
import { runIfCurrentGeneration } from "../lib/callbackGeneration.ts";
import { createSerializedLatestRequest } from "../lib/latestMediaRequest.ts";
import { shouldStartVideoPlayback } from "../lib/mediaPlaybackPolicy.ts";
import { canAdvanceAfterRequiredVideo } from "../lib/mediaProgression.ts";
import {
  createMediaSessionCoordinator,
  MediaAlreadyStoppedError,
} from "../lib/mediaSessionCore.ts";
import { reserveCompletion } from "../lib/progressCompletion.ts";
import {
  canRecoverSpeechQuarantine,
  createSpeechSessionLifecycle,
  shouldAcceptNativeSpeechEnd,
} from "../lib/speechSessionCore.ts";
import { createVideoSourceGenerationController } from "../lib/videoSourceGeneration.ts";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const source = (path) => readFileSync(resolve(projectRoot, path), "utf8");

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function owner(id, mode, onInterrupt = () => {}) {
  return { id, mode, onInterrupt };
}

function createSpeechHarness() {
  const timers = [];
  const terminals = [];
  const phases = [];

  const lifecycle = createSpeechSessionLifecycle({
    onPhaseChange(phase) {
      phases.push(phase);
    },

    onTerminal(terminal) {
      terminals.push(terminal);
    },

    scheduleTimer(callback) {
      const timer = {
        callback,
        cleared: false,
      };

      timers.push(timer);
      return timer;
    },

    clearTimer(timer) {
      timer.cleared = true;
    },
  });

  return {
    lifecycle,
    phases,
    terminals,
    timers,
  };
}

test("an old owner can never release a newer owner", async () => {
  const coordinator = createMediaSessionCoordinator({
    async applyMode() {},
  });

  const oldLease = await coordinator.claim(owner("audio", "shortPlayback"));

  const newLease = await coordinator.claim(owner("video", "videoPlayback"));

  assert.ok(oldLease);
  assert.ok(newLease);

  await coordinator.release(oldLease);

  assert.equal(coordinator.getOwnerId(), "video");
  assert.equal(coordinator.getMode(), "videoPlayback");
});

test("an old generation of the same owner cannot release its replacement", async () => {
  const appliedModes = [];

  const coordinator = createMediaSessionCoordinator({
    async applyMode(mode) {
      appliedModes.push(mode);
    },
  });

  const oldLease = await coordinator.claim(owner("audio", "shortPlayback"));

  const newLease = await coordinator.claim(owner("audio", "shortPlayback"));

  assert.ok(oldLease);
  assert.ok(newLease);
  assert.notEqual(oldLease.generation, newLease.generation);

  await coordinator.release(oldLease);

  assert.equal(coordinator.getOwnerId(), "audio");
  assert.equal(coordinator.getMode(), "shortPlayback");

  assert.deepEqual(appliedModes, ["shortPlayback", "shortPlayback"]);
});

test("double release is idempotent", async () => {
  const appliedModes = [];

  const coordinator = createMediaSessionCoordinator({
    async applyMode(mode) {
      appliedModes.push(mode);
    },
  });

  const lease = await coordinator.claim(owner("audio", "shortPlayback"));

  assert.ok(lease);

  await coordinator.release(lease);
  await coordinator.release(lease);

  assert.equal(coordinator.getOwnerId(), null);

  assert.deepEqual(appliedModes, ["shortPlayback", "inactive"]);
});

test("a late restoration cannot clear a newly requested video", async () => {
  const restoreGate = deferred();
  const restoreStarted = deferred();
  const appliedModes = [];

  let delayInactive = false;

  const coordinator = createMediaSessionCoordinator({
    async applyMode(mode) {
      appliedModes.push(mode);

      if (mode === "inactive" && delayInactive) {
        restoreStarted.resolve();
        await restoreGate.promise;
      }
    },
  });

  const oldLease = await coordinator.claim(owner("micro", "recording"));

  assert.ok(oldLease);

  delayInactive = true;

  const restoration = coordinator.restorePlaybackSession(oldLease);

  await restoreStarted.promise;

  const videoClaim = coordinator.claim(owner("video", "videoPlayback"));

  restoreGate.resolve();

  await restoration;

  const videoLease = await videoClaim;

  assert.ok(videoLease);
  assert.equal(coordinator.getOwnerId(), "video");
  assert.equal(coordinator.getMode(), "videoPlayback");

  assert.deepEqual(appliedModes, ["recording", "inactive", "videoPlayback"]);
});

test("failed recording mode rolls back without leaving a ghost owner", async () => {
  const originalError = new Error("recording category failed");

  const appliedModes = [];

  const coordinator = createMediaSessionCoordinator({
    async applyMode(mode) {
      appliedModes.push(mode);

      if (mode === "recording") {
        throw originalError;
      }
    },
  });

  await assert.rejects(
    coordinator.claim(owner("micro", "recording")),
    (error) => error === originalError,
  );

  assert.equal(coordinator.getOwnerId(), null);
  assert.equal(coordinator.getMode(), "inactive");

  assert.deepEqual(appliedModes, ["recording", "inactive"]);
});

test("a real interruption failure refuses the new owner after safe fallback", async () => {
  const stopError = new Error("native player still active");

  const appliedModes = [];

  const coordinator = createMediaSessionCoordinator({
    async applyMode(mode) {
      appliedModes.push(mode);
    },
  });

  await coordinator.claim(
    owner("audio", "shortPlayback", () => {
      throw stopError;
    }),
  );

  await assert.rejects(
    coordinator.claim(owner("video", "videoPlayback")),
    (error) => error === stopError,
  );

  assert.equal(coordinator.getOwnerId(), null);
  assert.equal(coordinator.getMode(), "inactive");

  assert.deepEqual(appliedModes, ["shortPlayback", "inactive"]);
});

test("benign double cleanup still permits the next owner", async () => {
  const coordinator = createMediaSessionCoordinator({
    async applyMode() {},
  });

  await coordinator.claim(
    owner("audio", "shortPlayback", () => {
      throw new MediaAlreadyStoppedError();
    }),
  );

  const videoLease = await coordinator.claim(owner("video", "videoPlayback"));

  assert.ok(videoLease);
  assert.equal(coordinator.getOwnerId(), "video");
});

test("abort waits for end and releases exactly once", async () => {
  const { lifecycle, terminals, timers } = createSpeechHarness();

  const generation = lifecycle.request();

  assert.ok(generation);

  assert.equal(lifecycle.markStarting(generation), true);

  assert.equal(lifecycle.markActive(generation), true);

  const terminal = lifecycle.beginStopping(generation, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  assert.equal(lifecycle.getPhase(), "stopping");

  assert.equal(terminals.length, 0);
  assert.equal(lifecycle.end(), true);

  await terminal;

  assert.equal(lifecycle.end(), false);
  assert.equal(timers[0].cleared, true);

  assert.deepEqual(terminals, [
    {
      generation,
      phase: "ended",
      reason: "native-end",
    },
  ]);
});

test("error waits for end before reaching the error terminal", async () => {
  const { lifecycle, terminals } = createSpeechHarness();

  const generation = lifecycle.request();

  lifecycle.markStarting(generation);
  lifecycle.markActive(generation);

  const terminal = lifecycle.beginStopping(generation, {
    acceptFinalResult: false,
    terminalPhase: "error",
  });

  assert.equal(lifecycle.getPhase(), "stopping");

  assert.equal(terminals.length, 0);

  lifecycle.end();

  await terminal;

  assert.equal(lifecycle.getPhase(), "error");

  assert.deepEqual(terminals, [
    {
      generation,
      phase: "error",
      reason: "native-end",
    },
  ]);
});

test("a final result is accepted before end but further results are ignored", async () => {
  const { lifecycle } = createSpeechHarness();

  const generation = lifecycle.request();

  lifecycle.markStarting(generation);
  lifecycle.markActive(generation);

  assert.equal(lifecycle.acceptsResult(), true);

  lifecycle.suppressFurtherResults(generation);

  const terminal = lifecycle.beginStopping(generation, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  assert.equal(lifecycle.acceptsResult(), false);

  lifecycle.end();

  await terminal;

  assert.equal(lifecycle.getPhase(), "ended");
});

test("results are rejected before native start and during quarantine", () => {
  const { lifecycle, timers } = createSpeechHarness();

  const generation = lifecycle.request();

  lifecycle.markStarting(generation);

  assert.equal(lifecycle.acceptsResult(), false);

  lifecycle.markActive(generation);

  void lifecycle.beginStopping(generation, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  timers[0].callback();

  assert.equal(lifecycle.getPhase(), "quarantined");

  assert.equal(lifecycle.acceptsResult(), false);
});

test("session B and a double microphone press are blocked while A is live", () => {
  const { lifecycle } = createSpeechHarness();

  const generationA = lifecycle.request();

  assert.ok(generationA);

  assert.equal(lifecycle.request(), null, "double press while requested");

  lifecycle.markStarting(generationA);

  assert.equal(lifecycle.request(), null, "double press while starting");

  lifecycle.markActive(generationA);

  assert.equal(lifecycle.request(), null, "second session while active");

  void lifecycle.beginStopping(generationA, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  assert.equal(lifecycle.request(), null, "session B while A is stopping");

  lifecycle.end();

  const generationB = lifecycle.request();

  assert.ok(generationB > generationA);
});

test("a speech timeout quarantines A and blocks B until A end is absorbed", () => {
  const { lifecycle, terminals, timers } = createSpeechHarness();

  const generationA = lifecycle.request();

  lifecycle.markStarting(generationA);
  lifecycle.markActive(generationA);

  void lifecycle.beginStopping(generationA, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  timers[0].callback();

  assert.equal(lifecycle.getPhase(), "quarantined");

  assert.equal(lifecycle.getQuarantinedGeneration(), generationA);

  assert.equal(lifecycle.request(), null);

  assert.deepEqual(terminals, [
    {
      generation: generationA,
      phase: "ended",
      reason: "timeout",
    },
  ]);

  assert.equal(lifecycle.end(), true, "absorb A's delayed native end");

  assert.equal(lifecycle.getPhase(), "ended");

  assert.equal(lifecycle.getQuarantinedGeneration(), null);

  const generationB = lifecycle.request();

  assert.ok(generationB > generationA);

  lifecycle.markStarting(generationB);
  lifecycle.markActive(generationB);

  assert.equal(lifecycle.getPhase(), "active");

  assert.equal(terminals.length, 1);
});

test("a speech timeout keeps the interruption barrier pending until native drain", async () => {
  const { lifecycle, timers } = createSpeechHarness();

  const generation = lifecycle.request();

  lifecycle.markStarting(generation);
  lifecycle.markActive(generation);

  let terminalSettled = false;

  const terminal = lifecycle.beginStopping(generation, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  void terminal.then(() => {
    terminalSettled = true;
  });

  timers[0].callback();

  await Promise.resolve();

  assert.equal(lifecycle.getPhase(), "quarantined");

  assert.equal(terminalSettled, false);

  assert.equal(lifecycle.end(), true);

  await terminal;

  assert.equal(terminalSettled, true);
});

test("a quarantined microphone blocks video ownership until native drain", async () => {
  const appliedModes = [];

  const coordinator = createMediaSessionCoordinator({
    async applyMode(mode) {
      appliedModes.push(mode);
    },
  });

  const { lifecycle, timers } = createSpeechHarness();

  const generation = lifecycle.request();

  lifecycle.markStarting(generation);
  lifecycle.markActive(generation);

  const microphoneLease = await coordinator.claim(
    owner("microphone", "recording", () =>
      lifecycle.beginStopping(generation, {
        acceptFinalResult: false,
        terminalPhase: "ended",
      }),
    ),
  );

  assert.ok(microphoneLease);

  let videoSettled = false;

  const videoClaim = coordinator.claim(owner("video", "videoPlayback"));

  void videoClaim.then(() => {
    videoSettled = true;
  });

  while (timers.length === 0) {
    await Promise.resolve();
  }

  timers[0].callback();

  await Promise.resolve();

  assert.equal(lifecycle.getPhase(), "quarantined");

  assert.equal(videoSettled, false);

  assert.equal(coordinator.getOwnerId(), "microphone");

  assert.equal(coordinator.getMode(), "recording");

  lifecycle.end();

  const videoLease = await videoClaim;

  assert.ok(videoLease);

  assert.equal(coordinator.getOwnerId(), "video");

  assert.equal(coordinator.getMode(), "videoPlayback");

  assert.deepEqual(appliedModes, ["recording", "videoPlayback"]);
});

test("verified native inactivity can explicitly recover a quarantined session", () => {
  const { lifecycle, timers } = createSpeechHarness();

  const generationA = lifecycle.request();

  lifecycle.markStarting(generationA);
  lifecycle.markActive(generationA);

  void lifecycle.beginStopping(generationA, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  timers[0].callback();

  assert.equal(
    canRecoverSpeechQuarantine({
      currentGeneration: lifecycle.getGeneration(),
      expectedGeneration: generationA,
      firstState: "inactive",
      phase: lifecycle.getPhase(),
      secondState: "inactive",
    }),
    true,
  );

  assert.equal(lifecycle.recoverFromQuarantine(generationA), true);

  const generationB = lifecycle.request();

  assert.ok(generationB > generationA);
});

test("a queued old end cannot terminate a recognizer that is still native-active", () => {
  assert.equal(
    shouldAcceptNativeSpeechEnd({
      currentGeneration: 2,
      nativeState: "recognizing",
      observedGeneration: 2,
    }),
    false,
  );

  assert.equal(
    shouldAcceptNativeSpeechEnd({
      currentGeneration: 2,
      nativeState: "inactive",
      observedGeneration: 1,
    }),
    false,
  );

  assert.equal(
    shouldAcceptNativeSpeechEnd({
      currentGeneration: 2,
      nativeState: "inactive",
      observedGeneration: 2,
    }),
    true,
  );
});

test("stale speech results are rejected after cancellation", () => {
  const { lifecycle } = createSpeechHarness();

  const generation = lifecycle.request();

  lifecycle.markStarting(generation);
  lifecycle.markActive(generation);
  lifecycle.suppressFurtherResults(generation);

  void lifecycle.beginStopping(generation, {
    acceptFinalResult: false,
    terminalPhase: "ended",
  });

  assert.equal(lifecycle.acceptsResult(), false);
});

test("late TTS callbacks are never forwarded", () => {
  let currentGeneration = 2;
  let callbackCount = 0;

  assert.equal(
    runIfCurrentGeneration(
      1,
      () => currentGeneration,
      () => {
        callbackCount += 1;
      },
    ),
    false,
  );

  assert.equal(callbackCount, 0);

  assert.equal(
    runIfCurrentGeneration(
      2,
      () => currentGeneration,
      () => {
        callbackCount += 1;
      },
    ),
    true,
  );

  assert.equal(callbackCount, 1);

  currentGeneration = 3;
});

test("a native Hangul error cleans the player and releases shortPlayback", async () => {
  const coordinator = createMediaSessionCoordinator({
    async applyMode() {},
  });

  const lease = await coordinator.claim(owner("hangul", "shortPlayback"));

  assert.ok(lease);

  let listenerRemovals = 0;
  let playerRemovals = 0;

  releaseAudioResources(
    {
      pause() {
        throw new Error("native player already failed");
      },

      remove() {
        playerRemovals += 1;
      },
    },

    {
      remove() {
        listenerRemovals += 1;
      },
    },
  );

  await coordinator.release(lease);

  assert.equal(listenerRemovals, 1);
  assert.equal(playerRemovals, 1);
  assert.equal(coordinator.getOwnerId(), null);
  assert.equal(coordinator.getMode(), "inactive");

  const hangulHook = source("hooks/useHangulAudio.ts");

  assert.match(hangulHook, /if \(status\.error\)/u);

  assert.match(hangulHook, /\.catch\(\(\) =>/u);

  assert.match(hangulHook, /releaseAudioResources/u);
});

test("late video events from source A cannot affect source B", () => {
  const controller = createVideoSourceGenerationController();

  const sourceA = controller.beginReplacement();

  assert.equal(controller.confirmReplacement(sourceA), true);

  assert.equal(controller.shouldHandleEvent(sourceA), true);

  const sourceB = controller.beginReplacement();

  assert.equal(controller.confirmReplacement(sourceB), true);

  assert.equal(
    controller.shouldHandleEvent(sourceA),
    false,
    "late playToEnd/playingChange from A",
  );

  assert.equal(controller.shouldHandleEvent(sourceB), true);
});

test("rapid replaceAsync operations apply only the latest requested source", async () => {
  const controller = createSerializedLatestRequest();

  const appliedSources = [];
  const firstGate = deferred();

  const first = controller.run(async () => {
    await firstGate.promise;

    appliedSources.push("A");

    return "A";
  });

  await Promise.resolve();

  const second = controller.run(async () => {
    appliedSources.push("B");

    return "B";
  });

  const third = controller.run(async () => {
    appliedSources.push("C");

    return "C";
  });

  firstGate.resolve();

  const [firstResult, secondResult, thirdResult] = await Promise.all([
    first,
    second,
    third,
  ]);

  assert.equal(firstResult.current, false);

  assert.equal(secondResult.current, false);

  assert.deepEqual(thirdResult, {
    current: true,
    value: "C",
  });

  assert.deepEqual(appliedSources, ["C"]);
});

test("video never auto-resumes after backgrounding", () => {
  const common = {
    appState: "active",
    hasSource: true,
    isFocused: true,
    nativeReady: true,
    shouldPlay: true,
  };

  assert.equal(
    shouldStartVideoPlayback({
      ...common,
      resumeRequired: true,
    }),
    false,
  );

  assert.equal(
    shouldStartVideoPlayback({
      ...common,
      resumeRequired: false,
    }),
    true,
  );

  const lifecycle = source("hooks/useImmersiveVideoLifecycle.ts");

  assert.doesNotMatch(lifecycle, /AppState\.addEventListener/u);

  assert.match(lifecycle, /coordinatorOwnsRelease/u);

  assert.match(lifecycle, /shouldHandleEvent\(sourceGeneration\)/u);
});

test("required video errors never grant progression", () => {
  assert.equal(
    canAdvanceAfterRequiredVideo({
      hasRequiredVideo: true,
      status: "error",
    }),
    false,
  );

  assert.equal(
    canAdvanceAfterRequiredVideo({
      hasRequiredVideo: true,
      status: "interrupted",
    }),
    false,
  );

  assert.equal(
    canAdvanceAfterRequiredVideo({
      hasRequiredVideo: true,
      status: "ended",
    }),
    true,
  );
});

test("only the root media policy owns AppState playback interruption", () => {
  const globalLifecycle = source("hooks/useMediaSessionLifecycle.ts");

  const videoLifecycle = source("hooks/useImmersiveVideoLifecycle.ts");

  assert.match(globalLifecycle, /AppState\.addEventListener/u);

  assert.match(globalLifecycle, /interruptActive\("background"\)/u);

  assert.doesNotMatch(videoLifecycle, /AppState\.addEventListener/u);
});

test("speech recognition uses an explicit safe iOS category", () => {
  const hook = source("hooks/useKoreanSpeechRecognition.nativeImpl.ts");

  assert.match(hook, /category: "playAndRecord"/u);

  assert.match(hook, /"defaultToSpeaker", "allowBluetooth"/u);

  assert.match(hook, /mode: "measurement"/u);

  assert.match(hook, /useSpeechRecognitionEvent\("audioend"/u);

  assert.match(hook, /useSpeechRecognitionEvent\("end"/u);

  assert.match(hook, /reason === "timeout"/u);

  assert.match(hook, /coordinatorOwnsReleaseGenerationRef/u);

  assert.match(hook, /return lifecycle\.waitForTerminal\(generation\)/u);

  assert.match(hook, /Native events have no session id[\s\S]*?return;/u);
});

test("Expo Go speech recognition stays behind a dependency-free facade", () => {
  const facade = source("hooks/useKoreanSpeechRecognition.ts");
  const fallback = source("hooks/useKoreanSpeechRecognition.expoGo.ts");
  const nativeImplementation = source(
    "hooks/useKoreanSpeechRecognition.nativeImpl.ts",
  );

  assert.match(facade, /isRunningInExpoGo\(\)/u);
  assert.match(
    facade,
    /isRunningInExpoGo\(\)[\s\S]*?\?[\s\S]*?useExpoGoSpeechRecognition[\s\S]*?:[\s\S]*?require\("\.\/useKoreanSpeechRecognition\.nativeImpl"\)/u,
  );
  assert.doesNotMatch(facade, /from "expo-speech-recognition"/u);
  assert.doesNotMatch(fallback, /expo-speech-recognition/u);
  assert.match(fallback, /Utilisez un Development Build/u);
  assert.match(
    nativeImplementation,
    /from "expo-speech-recognition"/u,
  );
});

test("all immersive speech starts carry the current node context", () => {
  for (const path of ["app/lesson/cafeIA.tsx", "app/lesson/metroIA.tsx"]) {
    const scene = source(path);

    assert.match(scene, /from "\.\.\/\.\.\/hooks\/useKoreanSpeechRecognition"/u, path);
    assert.doesNotMatch(scene, /hooks\/hooks\/useKoreanSpeechRecognition/u, path);
    assert.match(scene, /contextId: currentNodeId/u, path);

    assert.match(scene, /session\.contextId !== currentNodeId/u, path);
  }
});

test("all centralized TTS callbacks are generation-gated", () => {
  const speech = source("lib/speechPlayback.ts");

  for (const callback of ["onStart", "onDone", "onStopped", "onError"]) {
    assert.match(speech, new RegExp(`${callback}:`, "u"));
  }

  assert.match(speech, /runIfCurrentGeneration/u);
});

test("completion remains idempotent after media completion", () => {
  const first = reserveCompletion({}, "media_scene", true);

  assert.ok(first);

  assert.equal(reserveCompletion(first, "media_scene", true), null);
});

test("native configuration contains no background audio capability", () => {
  const config = JSON.parse(source("app.json"));

  const plugins = config.expo.plugins;

  const audio = plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "expo-audio",
  );

  const video = plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "expo-video",
  );

  assert.equal(config.expo.ios.bundleIdentifier, "com.arben60.kapp");

  assert.equal(audio[1].enableBackgroundPlayback, false);

  assert.equal(audio[1].enableBackgroundRecording, false);

  assert.equal(video[1].supportsBackgroundPlayback, false);

  assert.equal(video[1].supportsPictureInPicture, false);

  assert.ok(
    !config.expo.android.permissions.includes(
      "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
    ),
  );
});
