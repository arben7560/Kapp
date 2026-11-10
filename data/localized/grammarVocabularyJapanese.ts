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

/** Japanese equivalents for canonical vocabulary hints reused in the mixed A1 exam. */
const A1_REVIEW_GLOSSES: Readonly<Record<string, string>> = {
  "커피": "コーヒー",
  "차": "お茶",
  "빵": "パン",
  "케이크": "ケーキ",
  "먹어요": "食べます",
  "버스": "バス",
  "지하철": "地下鉄",
  "가요": "行きます／出発します",
  "물": "水",
  "마셔요": "飲みます",
  "지금": "今",
  "집": "家／自宅",
  "있어요": "います／あります",
  "말하다": "話す",
  "보여 주다": "見せる",
  "기다리다": "待つ",
  "열다": "開ける",
  "문": "ドア",
  "앉다": "座る",
  "가다": "行く",
  "읽다": "読む",
  "오다": "来る",
  "책": "本",
  "자동차": "車",
  "오른쪽": "右",
  "카드": "カード",
  "먹다": "食べる",
  "사다": "買う",
  "배우다": "学ぶ／習う",
  "한국": "韓国",
  "한국어": "韓国語",
  "운전하다": "運転する",
  "여기서": "ここで",
  "사진을 찍다": "写真を撮る",
  "화장실": "トイレ",
  "휴대폰": "携帯電話",
  "오늘": "今日",
  "운전": "運転",
  "매운 음식": "辛い料理",
  "귀": "耳",
  "소리": "音",
  "너무 빨라서": "速すぎるので",
  "저": "私",
  "아홉 시": "9時",
  "다섯 시": "5時",
  "월요일": "月曜日",
  "금요일": "金曜日",
  "서울역": "ソウル駅",
  "밥": "ご飯",
  "영화": "映画",
  "카페": "カフェ",
  "학교": "学校",
  "도서관": "図書館",
  "식당": "食堂／レストラン",
  "친구": "友達",
  "서울": "ソウル",
  "두 시": "2時",
  "아침": "朝",
  "여덟 시": "8時",
  "표": "切符",
  "이름": "名前",
  "여권": "パスポート",
  "가방": "かばん",
  "기차": "列車",
  "택시": "タクシー",
  "음식": "料理",
  "학생": "学生",
  "의사": "医師",
  "영수증": "レシート",
  "아이스 아메리카노": "アイスアメリカーノ",
  "분": "分",
  "후에": "〜後に",
  "출발해요": "出発します",
  "사과": "リンゴ",
  "삼겹살": "サムギョプサル",
  "우유": "牛乳",
  "국": "スープ",
  "좋다": "良い",
  "괜찮다": "大丈夫だ",
  "신발": "靴",
  "건물": "建物",
  "뭐": "何",
  "이거": "これ",
  "사람": "人",
  "비": "雨",
  "시간": "時間",
  "채식 메뉴": "ベジタリアンメニュー",
  "선생님": "先生",
  "2층": "2階",
  "마시다": "飲む",
  "공부하다": "勉強する",
  "보다": "見る",
  "다음 주": "来週",
  "부산": "釜山",
  "여기": "ここ",
  "비빔밥": "ビビンバ",
  "못 가요": "行けません",
  "죄송해요": "すみません",
  "안 사요": "買いません",
  "편해요": "快適です",
  "맛있어요": "おいしいです",
  "자주": "よく／頻繁に",
  "만나다": "会う",
  "같이": "一緒に"
};

export function getJapaneseGrammarVocabulary(
  question: GrammarPracticeQuestion,
): GrammarPracticeQuestion["vocabulary"] {
  // A1 final review reuses drills from all 40 lessons. Their French
  // vocabulary hints must still appear in Japanese for every attempt.
  // This changes display glosses only, never Korean text or evaluation.
  const lexicon = question.stageId === "a1-validation"
    ? Object.assign({}, ...Object.values(JAPANESE_GLOSSES), A1_REVIEW_GLOSSES)
    : JAPANESE_GLOSSES[question.stageId];
  if (!lexicon || !question.vocabulary) return question.vocabulary;
  return question.vocabulary.map((hint) => ({
    ...hint,
    french: lexicon[hint.korean] ?? hint.french,
  }));
}
