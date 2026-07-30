export type VideoSourceGeneration = Readonly<{
  generation: number;
}>;

export type VideoSourceGenerationController = Readonly<{
  beginReplacement: () => VideoSourceGeneration;
  confirmReplacement: (source: VideoSourceGeneration) => boolean;
  invalidate: () => void;
  isCurrent: (source: VideoSourceGeneration) => boolean;
  shouldHandleEvent: (source: VideoSourceGeneration) => boolean;
}>;

/**
 * Binds replacement completion and every native player callback to one source
 * generation. Events are ignored until that exact replacement is confirmed.
 */
export function createVideoSourceGenerationController(): VideoSourceGenerationController {
  let generation = 0;
  let confirmedGeneration: number | null = null;

  const isCurrent = (source: VideoSourceGeneration) =>
    generation === source.generation;

  return {
    beginReplacement() {
      generation += 1;
      confirmedGeneration = null;
      return { generation };
    },

    confirmReplacement(source) {
      if (!isCurrent(source)) return false;
      confirmedGeneration = source.generation;
      return true;
    },

    invalidate() {
      generation += 1;
      confirmedGeneration = null;
    },

    isCurrent,

    shouldHandleEvent(source) {
      return (
        isCurrent(source) &&
        confirmedGeneration === source.generation
      );
    },
  };
}
