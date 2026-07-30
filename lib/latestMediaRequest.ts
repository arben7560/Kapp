export type LatestRequestGuard = Readonly<{
  invalidate: () => void;
  isCurrent: (generation: number) => boolean;
  next: () => number;
}>;

export type LatestRequestResult<T> =
  | Readonly<{ current: true; value: T }>
  | Readonly<{ current: false }>;

export type SerializedLatestRequest = Readonly<{
  invalidate: () => void;
  run: <T>(operation: () => Promise<T>) => Promise<LatestRequestResult<T>>;
}>;

export function createLatestRequestGuard(): LatestRequestGuard {
  let generation = 0;

  return {
    invalidate() {
      generation += 1;
    },
    isCurrent(requestGeneration) {
      return generation === requestGeneration;
    },
    next() {
      generation += 1;
      return generation;
    },
  };
}

/**
 * Runs replacements one at a time. Stale queued work is skipped, while a newer
 * request waits for an in-flight native replacement and therefore wins last.
 */
export function createSerializedLatestRequest(): SerializedLatestRequest {
  const guard = createLatestRequestGuard();
  let operationQueue = Promise.resolve();

  return {
    invalidate() {
      guard.invalidate();
    },

    async run<T>(operation: () => Promise<T>) {
      const generation = guard.next();
      let result: LatestRequestResult<T> = { current: false };

      operationQueue = operationQueue
        .catch(() => {
          // A failed replacement must not block the next requested source.
        })
        .then(async () => {
          if (!guard.isCurrent(generation)) return;

          const value = await operation();
          result = guard.isCurrent(generation)
            ? { current: true, value }
            : { current: false };
        });

      await operationQueue;
      return result;
    },
  };
}
