export type MediaSessionMode =
  | "inactive"
  | "shortPlayback"
  | "videoPlayback"
  | "recording";

export type MediaInterruptionReason =
  | "background"
  | "blur"
  | "interruption"
  | "microphone"
  | "new-owner"
  | "unmount";

export type MediaSessionOwner = Readonly<{
  id: string;
  mode: Exclude<MediaSessionMode, "inactive">;
  onInterrupt: (reason: MediaInterruptionReason) => void | Promise<void>;
}>;

export type MediaSessionLease = Readonly<{
  ownerId: string;
  generation: number;
}>;

type ActiveMediaSession = Readonly<{
  lease: MediaSessionLease;
  owner: MediaSessionOwner;
}>;

export type MediaSessionAdapter = Readonly<{
  applyMode: (mode: MediaSessionMode) => Promise<void>;
}>;

export type MediaSessionCoordinator = Readonly<{
  claim: (owner: MediaSessionOwner) => Promise<MediaSessionLease | null>;
  getGeneration: () => number;
  getMode: () => MediaSessionMode;
  getOwnerId: () => string | null;
  interruptActive: (reason: MediaInterruptionReason) => Promise<void>;
  release: (lease: MediaSessionLease) => Promise<void>;
  restorePlaybackSession: (lease: MediaSessionLease) => Promise<void>;
}>;

/**
 * Owners can throw this error when an interruption races with an already
 * completed native cleanup. Other errors are treated as real stop failures.
 */
export class MediaAlreadyStoppedError extends Error {
  constructor(message = "The native media owner is already stopped.") {
    super(message);
    this.name = "MediaAlreadyStoppedError";
  }
}

function isSameLease(
  active: ActiveMediaSession | null,
  lease: MediaSessionLease,
) {
  return (
    active?.lease.ownerId === lease.ownerId &&
    active.lease.generation === lease.generation
  );
}

function isBenignInterruptionError(error: unknown) {
  return (
    error instanceof MediaAlreadyStoppedError ||
    (error instanceof Error && error.name === "MediaAlreadyStoppedError")
  );
}

/**
 * Serializes ownership and native mode transactions. Every successful claim
 * receives an immutable lease; cleanup from an older generation is a no-op.
 */
export function createMediaSessionCoordinator(
  adapter: MediaSessionAdapter,
): MediaSessionCoordinator {
  let activeSession: ActiveMediaSession | null = null;
  let mode: MediaSessionMode = "inactive";
  let generation = 0;
  let operation = Promise.resolve();

  const enqueue = <T>(transaction: () => Promise<T>) => {
    const result = operation
      .catch(() => {
        // A failed transaction must not poison later ownership changes.
      })
      .then(transaction);

    operation = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };

  const applyMode = async (nextMode: MediaSessionMode) => {
    await adapter.applyMode(nextMode);
    mode = nextMode;
  };

  const interruptOwner = async (
    session: ActiveMediaSession,
    reason: MediaInterruptionReason,
  ) => {
    try {
      await session.owner.onInterrupt(reason);
      return;
    } catch (error) {
      if (isBenignInterruptionError(error)) return;

      // A real stop failure refuses the incoming owner. If possible, force the
      // shared native session inactive so two physical owners cannot coexist.
      try {
        await applyMode("inactive");
        if (isSameLease(activeSession, session.lease)) {
          activeSession = null;
        }
      } catch {
        // Keep the previous logical owner when even the safe fallback fails.
      }

      throw error;
    }
  };

  const restoreLease = async (lease: MediaSessionLease) => {
    // A newer request already exists. The operation owning that generation is
    // solely responsible for the current or next native mode.
    if (!isSameLease(activeSession, lease) || generation !== lease.generation) {
      return;
    }

    const restoreGeneration = ++generation;

    await enqueue(async () => {
      if (
        generation !== restoreGeneration ||
        !isSameLease(activeSession, lease)
      ) {
        return;
      }

      await applyMode("inactive");

      if (
        generation === restoreGeneration &&
        isSameLease(activeSession, lease)
      ) {
        activeSession = null;
      }
    });
  };

  return {
    async claim(owner) {
      const requestGeneration = ++generation;
      const lease: MediaSessionLease = {
        ownerId: owner.id,
        generation: requestGeneration,
      };

      return enqueue(async () => {
        if (generation !== requestGeneration) return null;

        const previousSession = activeSession;
        if (previousSession && previousSession.owner.id !== owner.id) {
          await interruptOwner(previousSession, "new-owner");
        }

        if (generation !== requestGeneration) return null;

        activeSession = { lease, owner };

        try {
          await applyMode(owner.mode);
        } catch (error) {
          // Roll back only the acquisition that failed. A newer request owns
          // all subsequent cleanup and must never be overwritten here.
          if (
            generation === requestGeneration &&
            isSameLease(activeSession, lease)
          ) {
            activeSession = null;
            try {
              await applyMode("inactive");
            } catch {
              // Best effort only; preserve and rethrow the acquisition error.
            }
          }

          throw error;
        }

        return generation === requestGeneration &&
          isSameLease(activeSession, lease)
          ? lease
          : null;
      });
    },

    getGeneration() {
      return generation;
    },

    getMode() {
      return mode;
    },

    getOwnerId() {
      return activeSession?.owner.id ?? null;
    },

    async interruptActive(reason) {
      const expectedSession = activeSession;
      if (!expectedSession) return;

      const requestGeneration = ++generation;

      await enqueue(async () => {
        if (
          generation !== requestGeneration ||
          !isSameLease(activeSession, expectedSession.lease)
        ) {
          return;
        }

        await interruptOwner(expectedSession, reason);

        if (
          generation !== requestGeneration ||
          !isSameLease(activeSession, expectedSession.lease)
        ) {
          return;
        }

        await applyMode("inactive");

        if (
          generation === requestGeneration &&
          isSameLease(activeSession, expectedSession.lease)
        ) {
          activeSession = null;
        }
      });
    },

    release: restoreLease,
    restorePlaybackSession: restoreLease,
  };
}
