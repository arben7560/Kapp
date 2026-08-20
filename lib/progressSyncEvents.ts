export type LocalProgressArea = "pedagogical" | "streak" | "resume";

type LocalMutationListener = (area: LocalProgressArea) => void;
type HydrationListener = () => void;

const localMutationListeners = new Set<LocalMutationListener>();
const hydrationListeners = new Set<HydrationListener>();
let suppressedMutationDepth = 0;

export function notifyLocalProgressMutation(area: LocalProgressArea) {
  if (suppressedMutationDepth > 0) return;
  localMutationListeners.forEach((listener) => listener(area));
}

export function subscribeToLocalProgressMutations(
  listener: LocalMutationListener,
) {
  localMutationListeners.add(listener);
  return () => {
    localMutationListeners.delete(listener);
  };
}

export async function withoutProgressMutationTracking<T>(
  operation: () => Promise<T>,
): Promise<T> {
  suppressedMutationDepth += 1;
  try {
    return await operation();
  } finally {
    suppressedMutationDepth -= 1;
  }
}

export function notifyProgressHydration() {
  hydrationListeners.forEach((listener) => listener());
}

export function subscribeToProgressHydration(listener: HydrationListener) {
  hydrationListeners.add(listener);
  return () => {
    hydrationListeners.delete(listener);
  };
}
