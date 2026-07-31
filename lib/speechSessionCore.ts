export type SpeechSessionPhase =
  | "idle"
  | "requested"
  | "starting"
  | "active"
  | "stopping"
  | "quarantined"
  | "ended"
  | "error";

export type SpeechSessionTerminalReason =
  | "native-end"
  | "timeout"
  | "pre-native";

export type SpeechSessionTerminal = Readonly<{
  generation: number;
  phase: Extract<SpeechSessionPhase, "ended" | "error">;
  reason: SpeechSessionTerminalReason;
}>;

export type SpeechRecognizerNativeState =
  | "inactive"
  | "starting"
  | "stopping"
  | "recognizing";

type TimerHandle = ReturnType<typeof setTimeout>;

type SpeechSessionLifecycleOptions = Readonly<{
  clearTimer?: (timer: TimerHandle) => void;
  onPhaseChange?: (phase: SpeechSessionPhase) => void;
  onTerminal: (terminal: SpeechSessionTerminal) => void;
  scheduleTimer?: (callback: () => void, delayMs: number) => TimerHandle;
  stopTimeoutMs?: number;
}>;

type BeginStoppingOptions = Readonly<{
  acceptFinalResult: boolean;
  terminalPhase: SpeechSessionTerminal["phase"];
}>;

type ActiveSpeechSession = {
  acceptFinalResult: boolean;
  generation: number;
  resolveTerminal: () => void;
  stopTimer: TimerHandle | null;
  terminalEmitted: boolean;
  terminalPhase: SpeechSessionTerminal["phase"];
  terminalPromise: Promise<void>;
};

export type SpeechSessionLifecycle = Readonly<{
  acceptsResult: () => boolean;
  beginStopping: (
    generation: number,
    options: BeginStoppingOptions,
  ) => Promise<void>;
  end: () => boolean;
  failBeforeNativeStart: (generation: number) => boolean;
  finishWithoutNativeStart: (
    generation: number,
    terminalPhase?: SpeechSessionTerminal["phase"],
  ) => boolean;
  getGeneration: () => number;
  getPhase: () => SpeechSessionPhase;
  getQuarantinedGeneration: () => number | null;
  markActive: (generation: number) => boolean;
  markStarting: (generation: number) => boolean;
  recoverFromQuarantine: (generation: number) => boolean;
  request: () => number | null;
  suppressFurtherResults: (generation: number) => void;
  waitForTerminal: (generation: number) => Promise<void>;
}>;

type NativeEndDecision = Readonly<{
  currentGeneration: number;
  nativeState: SpeechRecognizerNativeState;
  observedGeneration: number;
}>;

type QuarantineRecoveryDecision = Readonly<{
  currentGeneration: number;
  expectedGeneration: number;
  firstState: SpeechRecognizerNativeState;
  phase: SpeechSessionPhase;
  secondState: SpeechRecognizerNativeState;
}>;

const DEFAULT_STOP_TIMEOUT_MS = 2_500;

/**
 * A native `end` may be queued after a timed-out session. Never let such an
 * event terminate a newer JS session while the native recognizer still reports
 * that the newer session is starting or recognizing.
 */
export function shouldAcceptNativeSpeechEnd({
  currentGeneration,
  nativeState,
  observedGeneration,
}: NativeEndDecision) {
  return currentGeneration === observedGeneration && nativeState === "inactive";
}

/**
 * Recovery is deliberately conservative: the user retries explicitly and the
 * native recognizer must report `inactive` twice, separated by a drain delay.
 */
export function canRecoverSpeechQuarantine({
  currentGeneration,
  expectedGeneration,
  firstState,
  phase,
  secondState,
}: QuarantineRecoveryDecision) {
  return (
    phase === "quarantined" &&
    currentGeneration === expectedGeneration &&
    firstState === "inactive" &&
    secondState === "inactive"
  );
}

/**
 * Session barrier for native recognizers whose events have no session id.
 *
 * A stop timeout emits a terminal diagnostic but deliberately keeps the
 * terminal barrier unresolved. This preserves the global recording ownership:
 * another media claimant remains blocked until the late native `end` is
 * absorbed or the caller verifies that the native recognizer is inactive and
 * explicitly recovers the matching generation.
 */
export function createSpeechSessionLifecycle({
  clearTimer = clearTimeout,
  onPhaseChange,
  onTerminal,
  scheduleTimer = setTimeout,
  stopTimeoutMs = DEFAULT_STOP_TIMEOUT_MS,
}: SpeechSessionLifecycleOptions): SpeechSessionLifecycle {
  let generation = 0;
  let phase: SpeechSessionPhase = "idle";
  let session: ActiveSpeechSession | null = null;

  const isCurrent = (expectedGeneration: number) =>
    session?.generation === expectedGeneration;

  const setPhase = (nextPhase: SpeechSessionPhase) => {
    phase = nextPhase;
    onPhaseChange?.(nextPhase);
  };

  const emitTerminal = (
    expectedGeneration: number,
    reason: SpeechSessionTerminalReason,
  ) => {
    if (!session || !isCurrent(expectedGeneration)) return false;
    if (session.terminalEmitted) return false;

    const completedSession = session;
    if (completedSession.stopTimer) {
      clearTimer(completedSession.stopTimer);
      completedSession.stopTimer = null;
    }

    completedSession.terminalEmitted = true;
    setPhase(
      reason === "timeout" ? "quarantined" : completedSession.terminalPhase,
    );
    if (reason !== "timeout") {
      completedSession.resolveTerminal();
    }
    onTerminal({
      generation: completedSession.generation,
      phase: completedSession.terminalPhase,
      reason,
    });
    return true;
  };

  const clearQuarantine = (expectedGeneration: number) => {
    if (
      !session ||
      !isCurrent(expectedGeneration) ||
      phase !== "quarantined" ||
      !session.terminalEmitted
    ) {
      return false;
    }

    const completedSession = session;
    const terminalPhase = completedSession.terminalPhase;
    session = null;
    setPhase(terminalPhase);
    completedSession.resolveTerminal();
    return true;
  };

  return {
    acceptsResult() {
      if (!session) return false;
      if (phase === "active") return true;
      return phase === "stopping" && session.acceptFinalResult;
    },

    beginStopping(expectedGeneration, options) {
      if (!session || !isCurrent(expectedGeneration)) {
        return Promise.resolve();
      }

      if (phase === "ended" || phase === "error" || phase === "quarantined") {
        return session.terminalPromise;
      }

      session.acceptFinalResult =
        session.acceptFinalResult && options.acceptFinalResult;
      if (options.terminalPhase === "error") {
        session.terminalPhase = "error";
      }
      setPhase("stopping");

      if (!session.stopTimer) {
        const timeoutGeneration = session.generation;
        session.stopTimer = scheduleTimer(() => {
          emitTerminal(timeoutGeneration, "timeout");
        }, stopTimeoutMs);
      }

      return session.terminalPromise;
    },

    end() {
      if (!session) return false;

      if (phase === "quarantined") {
        return clearQuarantine(session.generation);
      }

      if (phase !== "starting" && phase !== "active" && phase !== "stopping") {
        return false;
      }

      return emitTerminal(session.generation, "native-end");
    },

    failBeforeNativeStart(expectedGeneration) {
      if (
        !session ||
        !isCurrent(expectedGeneration) ||
        (phase !== "requested" && phase !== "starting")
      ) {
        return false;
      }

      session.acceptFinalResult = false;
      session.terminalPhase = "error";
      return emitTerminal(expectedGeneration, "pre-native");
    },

    finishWithoutNativeStart(expectedGeneration, terminalPhase = "ended") {
      if (
        !session ||
        !isCurrent(expectedGeneration) ||
        (phase !== "requested" && phase !== "starting" && phase !== "stopping")
      ) {
        return false;
      }

      session.acceptFinalResult = false;
      if (terminalPhase === "error") {
        session.terminalPhase = "error";
      }
      return emitTerminal(expectedGeneration, "pre-native");
    },

    getGeneration() {
      return generation;
    },

    getPhase() {
      return phase;
    },

    getQuarantinedGeneration() {
      return phase === "quarantined" && session ? session.generation : null;
    },

    markActive(expectedGeneration) {
      if (!session || !isCurrent(expectedGeneration) || phase !== "starting") {
        return false;
      }

      setPhase("active");
      return true;
    },

    markStarting(expectedGeneration) {
      if (!session || !isCurrent(expectedGeneration) || phase !== "requested") {
        return false;
      }

      setPhase("starting");
      return true;
    },

    recoverFromQuarantine(expectedGeneration) {
      return clearQuarantine(expectedGeneration);
    },

    request() {
      if (
        phase === "requested" ||
        phase === "starting" ||
        phase === "active" ||
        phase === "stopping" ||
        phase === "quarantined"
      ) {
        return null;
      }

      generation += 1;
      setPhase("requested");

      let resolveTerminal = () => {};
      const terminalPromise = new Promise<void>((resolve) => {
        resolveTerminal = resolve;
      });

      session = {
        acceptFinalResult: true,
        generation,
        resolveTerminal,
        stopTimer: null,
        terminalEmitted: false,
        terminalPhase: "ended",
        terminalPromise,
      };
      return generation;
    },

    suppressFurtherResults(expectedGeneration) {
      if (session && isCurrent(expectedGeneration)) {
        session.acceptFinalResult = false;
      }
    },

    waitForTerminal(expectedGeneration) {
      return session && isCurrent(expectedGeneration)
        ? session.terminalPromise
        : Promise.resolve();
    },
  };
}
