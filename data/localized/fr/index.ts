import type { ContentModule, LocalizedModule } from '../types.ts';

// Future imports: one file per existing lesson/module, indexed by stable IDs.
export const frenchContent = {
  hangul: {}, vocabulary: {}, counting: {}, classifiers: {}, grammar: {},
  listening: {}, missions: {}, speechFeedback: {}, immersion: {},
} as const satisfies Record<ContentModule, LocalizedModule>;
