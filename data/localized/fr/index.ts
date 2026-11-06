import { buildHangulFrenchCopy } from '../hangulRegistry.ts';
import { frenchVocabularyContent } from '../vocabularyRegistry.ts';
import { frenchVocabularyExtraContent } from '../vocabularyRegistryExtra.ts';
import { frenchVocabularySupplementContent } from '../vocabularyRegistrySupplement.ts';
import type { ContentModule, LocalizedModule } from '../types.ts';
import { frenchCountingContent } from '../countingRegistry.ts';

// Canonical French vocabulary display strings are catalogued by source text; engine data stays in the lesson modules.
export const frenchContent = {
  hangul: buildHangulFrenchCopy(), vocabulary: { ...frenchVocabularyContent, ...frenchVocabularyExtraContent, ...frenchVocabularySupplementContent }, counting: frenchCountingContent, classifiers: {}, grammar: {},
  listening: {}, missions: {}, speechFeedback: {}, immersion: {},
} as const satisfies Record<ContentModule, LocalizedModule>;
