import { japaneseHangulContent } from './hangul.ts';
import { japaneseVocabularyContent } from '../vocabularyRegistry.ts';
import { japaneseVocabularyExtraContent } from '../vocabularyRegistryExtra.ts';
import { japaneseVocabularySupplementContent } from '../vocabularyRegistrySupplement.ts';
import { japaneseSpeakContent } from '../vocabularyRegistrySpeak.ts';
import type { ContentModule, LocalizedModule } from '../types.ts';
import { japaneseCountingContent } from '../countingRegistry.ts';
import { japaneseClassifierContent } from '../classifiersRegistry.ts';
import { japaneseGrammarContent } from '../grammarRegistry.ts';
import { japaneseCafeImmersionContent } from '../immersionRegistryCafe.ts';
import { japaneseMetroImmersionContent } from '../immersionRegistryMetro.ts';
import { japaneseRestaurantImmersionContent } from '../immersionRegistryRestaurant.ts';

// Japanese vocabulary copy is display-only; Korean source data and exercise contracts remain unchanged.
export const japaneseContent = {
  hangul: japaneseHangulContent, vocabulary: { ...japaneseVocabularyContent, ...japaneseVocabularyExtraContent, ...japaneseVocabularySupplementContent, ...japaneseSpeakContent }, counting: japaneseCountingContent, classifiers: japaneseClassifierContent, grammar: japaneseGrammarContent,
  listening: {}, missions: {}, speechFeedback: {}, immersion: { ...japaneseCafeImmersionContent, ...japaneseMetroImmersionContent, ...japaneseRestaurantImmersionContent },
} as const satisfies Record<ContentModule, LocalizedModule>;
