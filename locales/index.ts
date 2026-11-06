import frCommon from './fr/common.json';
import jaCommon from './ja/common.json';
import frNavigation from './fr/navigation.json';
import jaNavigation from './ja/navigation.json';
import frOnboarding from './fr/onboarding.json';
import jaOnboarding from './ja/onboarding.json';
import frAccount from './fr/account.json';
import jaAccount from './ja/account.json';
import frPremium from './fr/premium.json';
import jaPremium from './ja/premium.json';
import frHangul from './fr/hangul.json';
import jaHangul from './ja/hangul.json';
import frVocabulary from './fr/vocabulary.json';
import jaVocabulary from './ja/vocabulary.json';
import frCounting from './fr/counting.json';
import jaCounting from './ja/counting.json';
import frClassifiers from './fr/classifiers.json';
import jaClassifiers from './ja/classifiers.json';
import frGrammar from './fr/grammar.json';
import jaGrammar from './ja/grammar.json';
import frListening from './fr/listening.json';
import jaListening from './ja/listening.json';
import frMissions from './fr/missions.json';
import jaMissions from './ja/missions.json';
import frSpeechFeedback from './fr/speechFeedback.json';
import jaSpeechFeedback from './ja/speechFeedback.json';
import frImmersion from './fr/immersion.json';
import jaImmersion from './ja/immersion.json';
import { frenchContent } from '../data/localized/fr/index.ts';
import { japaneseContent } from '../data/localized/ja/index.ts';

export const resources = {
  fr: {
    common: frCommon,
    navigation: frNavigation,
    onboarding: frOnboarding,
    account: frAccount,
    premium: frPremium,
    hangul: frHangul,
    vocabulary: { ...frVocabulary, content: frenchContent.vocabulary },
    counting: { ...frCounting, content: frenchContent.counting },
    classifiers: { ...frClassifiers, content: frenchContent.classifiers },
    grammar: frGrammar,
    listening: frListening,
    missions: frMissions,
    speechFeedback: frSpeechFeedback,
    immersion: frImmersion,
  },
  ja: {
    common: jaCommon,
    navigation: jaNavigation,
    onboarding: jaOnboarding,
    account: jaAccount,
    premium: jaPremium,
    hangul: jaHangul,
    vocabulary: { ...jaVocabulary, content: japaneseContent.vocabulary },
    counting: { ...jaCounting, content: japaneseContent.counting },
    classifiers: { ...jaClassifiers, content: japaneseContent.classifiers },
    grammar: jaGrammar,
    listening: jaListening,
    missions: jaMissions,
    speechFeedback: jaSpeechFeedback,
    immersion: jaImmersion,
  },
} as const;

export type AppNamespace = keyof typeof resources.fr;
