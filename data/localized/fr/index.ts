import { buildHangulFrenchCopy } from '../hangulRegistry.ts';
import { frenchVocabularyContent } from '../vocabularyRegistry.ts';
import { frenchVocabularyExtraContent } from '../vocabularyRegistryExtra.ts';
import { frenchVocabularySupplementContent } from '../vocabularyRegistrySupplement.ts';
import { frenchSpeakContent } from '../vocabularyRegistrySpeak.ts';
import type { ContentModule, LocalizedModule } from '../types.ts';
import { frenchCountingContent } from '../countingRegistry.ts';
import { frenchClassifierContent } from '../classifiersRegistry.ts';
import { frenchGrammarContent } from '../grammarRegistry.ts';
import { frenchCafeImmersionContent } from '../immersionRegistryCafe.ts';
import { frenchMetroImmersionContent } from '../immersionRegistryMetro.ts';

// Canonical French vocabulary display strings are catalogued by source text; engine data stays in the lesson modules.
export const frenchContent = {
  hangul: buildHangulFrenchCopy(), vocabulary: { ...frenchVocabularyContent, ...frenchVocabularyExtraContent, ...frenchVocabularySupplementContent, ...frenchSpeakContent }, counting: frenchCountingContent, classifiers: frenchClassifierContent, grammar: frenchGrammarContent,
  listening: {}, missions: {}, speechFeedback: {}, immersion: { ...frenchCafeImmersionContent, ...frenchMetroImmersionContent },
} as const satisfies Record<ContentModule, LocalizedModule>;
