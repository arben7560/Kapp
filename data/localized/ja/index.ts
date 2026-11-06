import { japaneseHangulContent } from './hangul.ts';
import { japaneseVocabularyContent } from '../vocabularyRegistry.ts';
import { japaneseVocabularyExtraContent } from '../vocabularyRegistryExtra.ts';
import { japaneseVocabularySupplementContent } from '../vocabularyRegistrySupplement.ts';
import type { ContentModule, LocalizedModule } from '../types.ts';

// Japanese vocabulary copy is display-only; Korean source data and exercise contracts remain unchanged.
export const japaneseContent = {
  hangul: japaneseHangulContent, vocabulary: { ...japaneseVocabularyContent, ...japaneseVocabularyExtraContent, ...japaneseVocabularySupplementContent }, counting: {}, classifiers: {}, grammar: {},
  listening: {}, missions: {}, speechFeedback: {}, immersion: {},
} as const satisfies Record<ContentModule, LocalizedModule>;
