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

/** Runtime only: persisted or cloud-hydrated progress must never trigger the Hub CTA. */
const learningActivityListeners = new Set<() => void>();
let sessionLearningActivity = false;
let permanentLearningAccount = false;

export function hasSessionLearningActivity() {
  return sessionLearningActivity;
}

export function recordSessionLearningActivity() {
  if (suppressedMutationDepth > 0 || permanentLearningAccount || sessionLearningActivity) return;
  sessionLearningActivity = true;
  learningActivityListeners.forEach((listener) => listener());
}

export function resetSessionLearningActivity() {
  if (!sessionLearningActivity) return;
  sessionLearningActivity = false;
  learningActivityListeners.forEach((listener) => listener());
}

export function setSessionLearningAccountProtected(isPermanentAccount: boolean) {
  permanentLearningAccount = isPermanentAccount;
  if (isPermanentAccount) resetSessionLearningActivity();
}

export function subscribeToSessionLearningActivity(listener: () => void) {
  learningActivityListeners.add(listener);
  return () => { learningActivityListeners.delete(listener); };
}
