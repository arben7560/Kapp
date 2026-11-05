import type { ContentModule, LocalizedModule } from '../types.ts';

// Intentionally empty in phase 2: no pedagogical translations or canonical copies.
export const japaneseContent = {
  hangul: {}, vocabulary: {}, counting: {}, classifiers: {}, grammar: {},
  listening: {}, missions: {}, speechFeedback: {}, immersion: {},
} as const satisfies Record<ContentModule, LocalizedModule>;
