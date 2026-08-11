import type { Scene, Step } from "../data/immersionScenes";

export type AutomaticScenePath = Readonly<{
  cursor: string;
  transcriptSteps: readonly Step[];
}>;

/**
 * Resolves the non-interactive part of a scene branch. A line can explicitly
 * redirect to another step; otherwise the legacy declaration order remains
 * the continuation. Resolution stops before the next choice.
 */
export function resolveAutomaticScenePath(
  scene: Scene,
  startStepId: string,
): AutomaticScenePath {
  const stepById = new Map(scene.steps.map((step) => [step.id, step]));
  const indexById = new Map(
    scene.steps.map((step, index) => [step.id, index] as const),
  );
  const transcriptSteps: Step[] = [];
  const visited = new Set<string>();
  let cursor = startStepId;

  while (cursor && !visited.has(cursor)) {
    visited.add(cursor);
    const current = stepById.get(cursor);
    if (!current) break;

    if (current.type === "choice") {
      return { cursor: current.id, transcriptSteps };
    }

    transcriptSteps.push(current);
    if (current.type === "end") {
      return { cursor: current.id, transcriptSteps };
    }

    const currentIndex = indexById.get(current.id);
    const nextStepId =
      current.goTo ??
      (currentIndex === undefined ? undefined : scene.steps[currentIndex + 1]?.id);

    if (!nextStepId) {
      return { cursor: current.id, transcriptSteps };
    }

    cursor = nextStepId;
  }

  return { cursor, transcriptSteps };
}
