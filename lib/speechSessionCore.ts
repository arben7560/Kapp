export type SpeechSessionPhase =
  | "idle"
  | "requested"
  | "starting"
  | "active"
  | "stopping"
  | "ended"
  | "error";

export type SpeechSessionTerminal = Readonly<{
  generation: number;
  phase: Extract<SpeechSessionPhase, "ended" | "error">;
}>;

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
  markActive: (generation: number) => boolean;
  markStarting: (generation: number) => boolean;
  request: () => number | null;
  suppressFurtherResults: (generation: number) => void;
  waitForTerminal: (generation: number) => Promise<void>;
}>;

const DEFAULT_STOP_TIMEOUT_MS = 2_500;

/**
 * Session barrier for native recognizers whose events have no session id.
 * A second request cannot exist until the previous native `end` (or its
 * generation-bound safety timeout) has completed.
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

  const finish = (expectedGeneration: number) => {
    if (!session || !isCurrent(expectedGeneration)) return false;
    if (phase === "ended" || phase === "error") return false;

    const completedSession = session;
    if (completedSession.stopTimer) {
      clearTimer(completedSession.stopTimer);
      completedSession.stopTimer = null;
    }

    setPhase(completedSession.terminalPhase);
    completedSession.resolveTerminal();
    onTerminal({
      generation: completedSession.generation,
      phase: completedSession.terminalPhase,
    });
    return true;
  };

  return {
    acceptsResult() {
      if (!session) return false;
      if (phase === "starting" || phase === "active") return true;
      return phase === "stopping" && session.acceptFinalResult;
    },

    beginStopping(expectedGeneration, options) {
      if (!session || !isCurrent(expectedGeneration)) {
        return Promise.resolve();
      }

      if (phase === "ended" || phase === "error") {
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
          finish(timeoutGeneration);
        }, stopTimeoutMs);
      }

      return session.terminalPromise;
    },

    end() {
      if (!session) return false;

      if (
        phase !== "starting" &&
        phase !== "active" &&
        phase !== "stopping"
      ) {
        return false;
      }

      return finish(session.generation);
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
      return finish(expectedGeneration);
    },

    finishWithoutNativeStart(expectedGeneration, terminalPhase = "ended") {
      if (
        !session ||
        !isCurrent(expectedGeneration) ||
        (phase !== "requested" &&
          phase !== "starting" &&
          phase !== "stopping")
      ) {
        return false;
      }

      session.acceptFinalResult = false;
      if (terminalPhase === "error") {
        session.terminalPhase = "error";
      }
      return finish(expectedGeneration);
    },

    getGeneration() {
      return generation;
    },

    getPhase() {
      return phase;
    },

    markActive(expectedGeneration) {
      if (
        !session ||
        !isCurrent(expectedGeneration) ||
        phase !== "starting"
      ) {
        return false;
      }

      setPhase("active");
      return true;
    },

    markStarting(expectedGeneration) {
      if (
        !session ||
        !isCurrent(expectedGeneration) ||
        phase !== "requested"
      ) {
        return false;
      }

      setPhase("starting");
      return true;
    },

    request() {
      if (
        phase === "requested" ||
        phase === "starting" ||
        phase === "active" ||
        phase === "stopping"
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
