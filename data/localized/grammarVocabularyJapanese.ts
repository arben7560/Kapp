import type { GrammarPracticeQuestion } from "../grammar/types.ts";

/**
 * Some reused drill IDs carry French vocabulary glosses in the canonical
 * exercise metadata. Adapt those hints only for display on localized stages;
 * Korean examples, answers and exercise scoring are never changed.
 */
const JAPANESE_GLOSSES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  existence: {
    버스: "バス",
    지하철: "地下鉄",
  },
  "object-actions": {
    커피: "コーヒー",
    차: "お茶",
  },
  "choose-alternative": {
    커피: "コーヒー",
    차: "お茶",
    빵: "パン",
    케이크: "ケーキ",
    먹어요: "食べます",
    버스: "バス",
    지하철: "地下鉄",
    가요: "行きます",
    물: "水",
    마셔요: "飲みます",
    지금: "今",
    집: "家",
    있어요: "います・あります",
  },
};

export function getJapaneseGrammarVocabulary(
  question: GrammarPracticeQuestion,
): GrammarPracticeQuestion["vocabulary"] {
  const lexicon = JAPANESE_GLOSSES[question.stageId];
  if (!lexicon || !question.vocabulary) return question.vocabulary;
  return question.vocabulary.map((hint) => ({
    ...hint,
    french: lexicon[hint.korean] ?? hint.french,
  }));
}
