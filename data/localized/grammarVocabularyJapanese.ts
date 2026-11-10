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
  "request-action": {
    "말하다": "話す・言う",
    "보여 주다": "見せる",
    "기다리다": "待つ",
    "열다": "開ける",
    "문": "ドア"
  },
  "polite-instructions": {
    "앉다": "座る",
    "가다": "行く",
    "읽다": "読む",
    "오다": "来る",
    "책": "本"
  },
  "direction-and-means": {
    "버스": "バス",
    "지하철": "地下鉄",
    "자동차": "車",
    "오른쪽": "右側・右方向",
    "카드": "カード"
  },
  "express-desire": {
    "먹다": "食べる",
    "가다": "行く",
    "사다": "買う",
    "배우다": "習う・学ぶ",
    "한국": "韓国"
  },
  "express-ability": {
    "읽다": "読む",
    "한국어": "韓国語",
    "말하다": "話す",
    "운전하다": "運転する",
    "가다": "行く",
    "여기서": "ここで",
    "카드": "カード",
    "버스": "バス"
  },
  "ask-permission": {
    "열다": "開ける",
    "앉다": "座る",
    "사진을 찍다": "写真を撮る",
    "화장실": "トイレ",
    "여기서": "ここで",
    "휴대폰": "携帯電話"
  },
  "express-inability": {
    "오늘": "今日",
    "운전": "運転",
    "매운 음식": "辛い料理",
    "귀": "耳",
    "소리": "音",
    "너무 빨라서": "速すぎるので"
  },
  "add-item": {
    "물": "水",
    "저": "私",
    "김치": "キムチ",
    "커피": "コーヒー",
    "빵": "パン"
  },
  "limit-request": {
    "물": "水",
    "빵": "パン",
    "커피": "コーヒー"
  },
  "range-and-limit": {
    "아홉 시": "9時",
    "다섯 시": "5時",
    "월요일": "月曜日",
    "금요일": "金曜日",
    "서울역": "ソウル駅"
  }

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
