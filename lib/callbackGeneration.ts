export function runIfCurrentGeneration<TArgs extends unknown[]>(
  eventGeneration: number,
  getCurrentGeneration: () => number,
  callback: ((...args: TArgs) => void) | undefined,
  ...args: TArgs
) {
  if (eventGeneration !== getCurrentGeneration()) return false;

  callback?.(...args);
  return true;
}
