export const COMPLETION_XP = 40;

export function reserveCompletion(
  completed: Readonly<Record<string, boolean>>,
  id: string,
  isHydrated: boolean,
): Record<string, boolean> | null {
  if (!isHydrated || completed[id]) {
    return null;
  }

  return {
    ...completed,
    [id]: true,
  };
}
