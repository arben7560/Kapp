/** Display-only Japanese A1 final-review catalogue and feedback.
 * Source questions, Korean tokens and scoring are owned exclusively by the
 * canonical grammar exercise engine; these are render-time annotations. */
import type { GrammarPracticeAnswer, GrammarPracticeQuestion } from "../grammar/types.ts";
import { GRAMMAR_PRACTICE_DRILLS } from "../grammar/practiceDrills.ts";
import { GRAMMAR_STAGE_BY_ID } from "../grammar/stages.ts";
import { JAPANESE_GRAMMAR_CORRECT_FEEDBACK, JAPANESE_GRAMMAR_WRONG_FEEDBACK } from "./grammarFeedbackJapanese.ts";

export const A1_REVIEW_SLOTS_JAPANESE = [
  {
    "family": "Fondations",
    "japaneseFamily": "基礎",
    "conceptIds": [
      "sentence-order"
    ]
  },
  {
    "family": "Fondations",
    "japaneseFamily": "基礎",
    "conceptIds": [
      "copula-ieyo-yeyo",
      "copula-negation-anieyo"
    ]
  },
  {
    "family": "Fondations",
    "japaneseFamily": "基礎",
    "conceptIds": [
      "present-a-eoyo",
      "polite-style-yo"
    ]
  },
  {
    "family": "Fondations",
    "japaneseFamily": "基礎",
    "conceptIds": [
      "question-mwo-nugu-myeot",
      "interrogatives-basic"
    ]
  },
  {
    "family": "Fondations",
    "japaneseFamily": "基礎",
    "conceptIds": [
      "demonstratives-i-geu-jeo",
      "possession-ui-je-nae"
    ]
  },
  {
    "family": "Construire la phrase",
    "japaneseFamily": "文の組み立て",
    "conceptIds": [
      "topic-eun-neun",
      "subject-i-ga"
    ]
  },
  {
    "family": "Construire la phrase",
    "japaneseFamily": "文の組み立て",
    "conceptIds": [
      "object-eul-reul"
    ]
  },
  {
    "family": "Construire la phrase",
    "japaneseFamily": "文の組み立て",
    "conceptIds": [
      "location-e",
      "action-location-eseo"
    ]
  },
  {
    "family": "Construire la phrase",
    "japaneseFamily": "文の組み立て",
    "conceptIds": [
      "destination-time-e",
      "direction-means-ro-euro"
    ]
  },
  {
    "family": "Construire la phrase",
    "japaneseFamily": "文の組み立て",
    "conceptIds": [
      "existence-isseoyo-eopseoyo"
    ]
  },
  {
    "family": "Quantités et échanges",
    "japaneseFamily": "数とやり取り",
    "conceptIds": [
      "native-numbers",
      "classifiers-basic"
    ]
  },
  {
    "family": "Quantités et échanges",
    "japaneseFamily": "数とやり取り",
    "conceptIds": [
      "sino-korean-numbers",
      "range-buteo-kkaji"
    ]
  },
  {
    "family": "Quantités et échanges",
    "japaneseFamily": "数とやり取り",
    "conceptIds": [
      "noun-link-hago-irang",
      "alternative-ina-animyeon"
    ]
  },
  {
    "family": "Quantités et échanges",
    "japaneseFamily": "数とやり取り",
    "conceptIds": [
      "request-n-juseyo"
    ]
  },
  {
    "family": "Quantités et échanges",
    "japaneseFamily": "数とやり取り",
    "conceptIds": [
      "request-v-a-eo-juseyo",
      "polite-instruction-euseyo"
    ]
  },
  {
    "family": "Choix et intentions",
    "japaneseFamily": "選択と意志",
    "conceptIds": [
      "desire-go-sipeoyo",
      "ability-eul-su-isseoyo"
    ]
  },
  {
    "family": "Choix et intentions",
    "japaneseFamily": "選択と意志",
    "conceptIds": [
      "permission-a-eodo-dwaeyo",
      "obligation-a-eoya-haeyo"
    ]
  },
  {
    "family": "Choix et intentions",
    "japaneseFamily": "選択と意志",
    "conceptIds": [
      "negation-an",
      "inability-mot"
    ]
  },
  {
    "family": "Choix et intentions",
    "japaneseFamily": "選択と意志",
    "conceptIds": [
      "additive-do",
      "restrictive-man"
    ]
  },
  {
    "family": "Choix et intentions",
    "japaneseFamily": "選択と意志",
    "conceptIds": [
      "past-ass-eosseoyo",
      "future-eul-geoyeyo"
    ]
  },
  {
    "family": "Temps, liens et nuances",
    "japaneseFamily": "時・接続・ニュアンス",
    "conceptIds": [
      "intention-eulgeyo",
      "suggestion-eulkkayo"
    ]
  },
  {
    "family": "Temps, liens et nuances",
    "japaneseFamily": "時・接続・ニュアンス",
    "conceptIds": [
      "sequence-go",
      "reason-a-eoseo"
    ]
  },
  {
    "family": "Temps, liens et nuances",
    "japaneseFamily": "時・接続・ニュアンス",
    "conceptIds": [
      "contrast-jiman",
      "condition-eumyeon"
    ]
  },
  {
    "family": "Temps, liens et nuances",
    "japaneseFamily": "時・接続・ニュアンス",
    "conceptIds": [
      "honorific-si"
    ]
  },
  {
    "family": "Temps, liens et nuances",
    "japaneseFamily": "時・接続・ニュアンス",
    "conceptIds": [
      "comparison-boda-deo-jeil"
    ]
  }
] as const;

export const A1_REVIEW_COMPOSED_JAPANESE = {
  "review-destination-order": {
    "source": {
      "prompt": "Reconstruis la phrase entière : moment, destination, puis verbe.",
      "stimulus": "Demain, je vais à la gare de Séoul.",
      "context": "Tu indiques ton programme de demain et la destination du trajet.",
      "explanation": "내일 indique demain, 서울역에 la destination et 가요 le verbe final : 내일 서울역에 가요."
    },
    "ja": {
      "prompt": "時点・行き先・動詞の順に、韓国語の文を組み立てましょう。",
      "stimulus": "明日、ソウル駅に行きます。",
      "context": "明日の予定と目的地を伝えます。",
      "explanation": "내일 は「明日」、서울역에 はソウル駅という行き先、가요 は「行きます」。自然な基本語順は 내일 서울역에 가요. です。"
    },
    "correct": "내일 서울역에 가요. ができました。時点・行き先の後に、行く動作を表す 가요 を置けています。",
    "orderHint": "내일（明日）→ 서울역에（ソウル駅へ）→ 가요（行きます）を基本語順に並べます。"
  },
  "review-transport-order": {
    "source": {
      "prompt": "Reconstruis la phrase entière en indiquant le moyen et la destination.",
      "stimulus": "Je vais à la gare de Séoul en métro.",
      "context": "Tu précises comment tu rejoins la gare de Séoul.",
      "explanation": "지하철로 indique le moyen et 서울역에 la destination : 지하철로 서울역에 가요."
    },
    "ja": {
      "prompt": "交通手段と行き先を入れて、韓国語の文を組み立てましょう。",
      "stimulus": "地下鉄でソウル駅に行きます。",
      "context": "ソウル駅までの移動手段を説明します。",
      "explanation": "지하철로 は「地下鉄で」という手段、서울역에 は目的地です。動詞 가요 を最後に置きます。"
    },
    "correct": "지하철로 서울역에 가요. ですね。로 で手段、에 で目的地を示し、最後に 가요 を置けています。",
    "orderHint": "지하철로（地下鉄で）→ 서울역에（ソウル駅へ）→ 가요（行きます）の順に確認しましょう。"
  },
  "review-water-order": {
    "source": {
      "prompt": "Construis une demande polie en précisant la quantité.",
      "stimulus": "Un verre d’eau, s’il vous plaît.",
      "context": "Au café, tu commandes un verre d’eau.",
      "explanation": "물 est l’eau demandée, 한 잔 précise un verre et 주세요 formule la demande : 물 한 잔 주세요."
    },
    "ja": {
      "prompt": "数量を指定した、丁寧な注文の文を組み立てましょう。",
      "stimulus": "お水を1杯お願いします。",
      "context": "カフェで水を1杯注文します。",
      "explanation": "물 は水、한 잔 は飲み物を数える「1杯」、주세요 は丁寧な「ください」です。물 한 잔 주세요. と並べます。"
    },
    "correct": "물 한 잔 주세요. ができました。水＋1杯＋丁寧な依頼の順で、自然に注文できています。",
    "orderHint": "물（水）→ 한 잔（1杯）→ 주세요（ください）の順が、今回の注文の基本です。"
  },
  "review-coffee-water-order": {
    "source": {
      "prompt": "Construis une commande avec une quantité et un ajout.",
      "stimulus": "Deux cafés et de l’eau aussi, s’il vous plaît.",
      "context": "Au café, tu commandes deux cafés et ajoutes de l’eau.",
      "explanation": "두 잔 compte les cafés, 하고 relie les éléments, 도 ajoute l’eau : 커피 두 잔하고 물도 주세요."
    },
    "ja": {
      "prompt": "数を指定し、別の品物も追加して注文する文を組み立てましょう。",
      "stimulus": "コーヒーを2杯と、お水もお願いします。",
      "context": "カフェでコーヒー2杯を注文し、水も追加します。",
      "explanation": "커피 두 잔하고 はコーヒー2杯と、물도 は水も、주세요 は「お願いします」。하고 と 도 の役割を区別します。"
    },
    "correct": "커피 두 잔하고 물도 주세요. ですね。두 잔（2杯）と 하고（と）、도（も）の使い方が合っています。",
    "orderHint": "커피 두 잔하고（コーヒー2杯と）→ 물도（水も）→ 주세요（お願いします）の順です。"
  },
  "review-past-order": {
    "source": {
      "prompt": "Construis une phrase complète au passé.",
      "stimulus": "Hier, j’ai regardé un film.",
      "context": "Tu racontes ce que tu as fait hier.",
      "explanation": "어제 situe l’action hier, 영화를 désigne l’objet et 봤어요 le passé : 어제 영화를 봤어요."
    },
    "ja": {
      "prompt": "過去形を使って、時点・目的語・動詞のある文を組み立てましょう。",
      "stimulus": "昨日、映画を見ました。",
      "context": "昨日の出来事を友達に伝えます。",
      "explanation": "어제 は昨日、영화를 は映画を、봤어요 は 보다（見る）の過去形です。어제 영화를 봤어요. とします。"
    },
    "correct": "어제 영화를 봤어요. ができました。어제 で過去の時点を示し、봤어요 で見たことを伝えています。",
    "orderHint": "어제（昨日）→ 영화를（映画を）→ 봤어요（見ました）。過去形の述語は最後です。"
  },
  "review-future-order": {
    "source": {
      "prompt": "Construis une phrase complète au futur.",
      "stimulus": "Demain, je regarderai un film.",
      "context": "Tu annonces un projet prévu pour demain.",
      "explanation": "내일 annonce demain, 영화를 l’objet et 볼 거예요 le futur prévu : 내일 영화를 볼 거예요."
    },
    "ja": {
      "prompt": "決まっている予定を表す未来形で、一文を組み立てましょう。",
      "stimulus": "明日、映画を見る予定です。",
      "context": "明日予定していることを伝えます。",
      "explanation": "내일 は明日、영화를 は映画を、볼 거예요 は「見る予定です」。未来の予定を表す語尾を最後に置きます。"
    },
    "correct": "내일 영화를 볼 거예요. ですね。明日の予定を -(으)ㄹ 거예요 で正しく表せています。",
    "orderHint": "내일（明日）→ 영화를（映画を）→ 볼 거예요（見る予定です）を順に置きます。"
  },
  "review-sequence-order": {
    "source": {
      "prompt": "Construis une phrase avec deux actions qui s’enchaînent.",
      "stimulus": "Je mange, puis je bois un café.",
      "context": "Tu décris simplement deux actions successives.",
      "explanation": "먹고 relie les actions avec -고, puis 마셔요 ferme la phrase : 밥을 먹고 커피를 마셔요."
    },
    "ja": {
      "prompt": "二つの動作を -고 でつないだ文を組み立てましょう。",
      "stimulus": "ご飯を食べてから、コーヒーを飲みます。",
      "context": "食事とコーヒーの二つの行動を続けて伝えます。",
      "explanation": "밥을 はご飯を、먹고 は食べて、커피를 はコーヒーを、마셔요 は飲みます。-고 はここでは動作をつなぎます。"
    },
    "correct": "밥을 먹고 커피를 마셔요. ができました。먹고 で二つの動作をつなぎ、文末を 마셔요 で締めています。",
    "orderHint": "밥을（ご飯を）→ 먹고（食べて）→ 커피를（コーヒーを）→ 마셔요（飲みます）の順です。"
  },
  "review-reason-order": {
    "source": {
      "prompt": "Construis une phrase en reliant une raison et sa conséquence.",
      "stimulus": "Comme il pleut, je prends un taxi.",
      "context": "Tu expliques pourquoi tu prends un taxi.",
      "explanation": "비가 와서 donne la cause, 택시를 l’objet et 타요 l’action : 비가 와서 택시를 타요."
    },
    "ja": {
      "prompt": "理由と結果を -아／어서 でつないだ文を組み立てましょう。",
      "stimulus": "雨が降っているので、タクシーに乗ります。",
      "context": "雨を理由にタクシーを利用すると説明します。",
      "explanation": "비가 와서 は「雨が降るので」という理由、택시를 はタクシーを、타요 は乗ります。理由を先に置きます。"
    },
    "correct": "비가 와서 택시를 타요. ですね。비가 와서 が理由、택시를 타요 がその結果という関係を表せています。",
    "orderHint": "비가 와서（雨が降るので）→ 택시를（タクシーを）→ 타요（乗ります）の順に並べます。"
  }
} as const;

export const A1_REVIEW_HONORIFIC_JAPANESE = {
  "teacher-arrives": {
    "prompt": "先生に敬意を示す現在形を選びましょう。",
    "context": "受付で、先生が今いらっしゃることを丁寧に伝えます。",
    "explanation": "선생님이 오세요. は先生を高めた「先生がいらっしゃいます」。오세요 には尊敬の -시- が含まれます。오셨어요 は過去、오실 거예요 は未来です。",
    "correct": "선생님이 오세요. ですね。今いらっしゃる先生に対して、尊敬の -시- を使えています。",
    "wrong": {
      "와요": "와요 は一般的な丁寧形「来ます」。先生への敬意を積極的に表す場面なので -시- を含む 오세요 を選びます。",
      "오셨어요": "오셨어요 は尊敬の過去形「いらっしゃいました」。先生が今来る場面では現在形 오세요 です。",
      "오실 거예요": "오실 거예요 は「いらっしゃる予定です」という未来形。現在の到着なら 오세요 を使います。"
    }
  },
  "honorific-people": {
    "prompt": "お客様の人数を、敬意を示す助数詞で尋ねましょう。",
    "context": "飲食店のスタッフが、お客様の人数をより丁寧に尋ねます。",
    "explanation": "몇 분이세요? の 분 は人を数える尊敬の助数詞。몇 명이세요? も丁寧ですが、ここではお客様を高めて分を使います。",
    "correct": "몇 분이세요? が適切です。人を敬って数える助数詞 분 を選べました。",
    "wrong": {
      "명": "몇 명이세요? も丁寧で文法的に正しい表現です。今回はお客様を特に尊重するため、人数の助数詞に 분 を使います。",
      "개": "개 は物を数える助数詞。お客様の人数を敬って尋ねるなら 분 を使います。",
      "잔": "잔 は飲み物の「杯」を数える助数詞。人数なら尊敬の 분 が適切です。"
    }
  },
  "teacher-present": {
    "prompt": "先生が今いることを、尊敬の現在形で表しましょう。",
    "context": "今、教室にいる先生に対して敬意を込めて話します。",
    "explanation": "선생님은 교실에 계세요. は「先生は教室にいらっしゃいます」。계세요 は 있다 の尊敬語です。있어요 も文法的には正しいですが、尊敬を明示する練習では 계세요 を使います。",
    "correct": "선생님은 교실에 계세요. ですね。先生の存在を尊敬語 계세요 で表せています。",
    "wrong": {
      "있어요": "선생님은 교실에 있어요 も丁寧で文法的には正しい文です。今回は先生への尊敬を表す条件があるため 계세요 を選びます。",
      "계셨어요": "계셨어요 は「いらっしゃいました」という過去。現在教室にいらっしゃる先生には 계세요 が合います。",
      "계실 거예요": "계실 거예요 は「いらっしゃるでしょう／予定です」という未来・推量。現在の所在には 계세요 です。"
    }
  },
  "customer-name": {
    "prompt": "お客様の名前を尋ねる、敬語の名詞を選びましょう。",
    "context": "店員がお客様の名前を、特に敬意を込めた言い方で尋ねます。",
    "explanation": "성함이 어떻게 되세요? は「お名前をお伺いしてもよろしいですか」に近い表現です。성함 は 이름 の尊敬語です。",
    "correct": "성함이 어떻게 되세요? が適切です。お客様の名前を尊敬語 성함 で尋ねられています。",
    "wrong": {
      "이름": "이름이 어떻게 되세요? も一般的な丁寧表現です。ただし今回は敬意の高い名詞を選ぶ指定なので 성함 を使います。",
      "말씀": "말씀 は「お言葉／お話」の尊敬表現で、名前という意味ではありません。お名前には 성함 を使います。",
      "나이": "나이 は「年齢」です。名前を敬意を込めて尋ねるなら 성함 が適切です。"
    }
  },
  "repeat-respectfully": {
    "prompt": "目上の人にもう一度言っていただく、丁寧な依頼を選びましょう。",
    "context": "年上の方や上司に、言った内容をもう一度お願いしたい場面です。",
    "explanation": "다시 한번 말씀해 주시겠어요? は「もう一度おっしゃっていただけますか」。말씀 と -주시겠어요 が丁寧な依頼になります。",
    "correct": "다시 한번 말씀해 주시겠어요? ですね。相手に配慮した丁寧な聞き返しができています。",
    "wrong": {
      "말해요": "말해요 は普通の現在形「話します」で、今回求める丁寧な依頼になりません。말씀해 주시겠어요? が適切です。",
      "말씀하세요": "말씀하세요 は丁寧な「お話しください」ですが、指示・促しに近く、今回は「言っていただけますか」という依頼の 말씀해 주시겠어요? が合います。",
      "말할까요": "말할까요 は「（私が）話しましょうか」という提案。相手に繰り返してもらう依頼には 말씀해 주시겠어요? を使います。"
    }
  }
} as const;

type ComposedId = keyof typeof A1_REVIEW_COMPOSED_JAPANESE;
type HonorificId = keyof typeof A1_REVIEW_HONORIFIC_JAPANESE;

function findReviewDrillId(question: GrammarPracticeQuestion): string | undefined {
  const conceptId = question.conceptIds[0];
  const marker = `:drill-${conceptId}-`;
  const pos = question.id.indexOf(marker);
  if (pos < 0) return undefined;
  const suffix = question.id.slice(pos + marker.length);
  return suffix.replace(/-\d+$/u, "");
}

/** The source slot chooses the concept, while its Japanese feedback comes from
 * the corresponding already-localized lesson. The mapping is derived from the
 * canonical concept-to-stage relations rather than from response text. */
export function getA1ReviewSourceStage(conceptId: string): string | undefined {
  if (conceptId === "honorific-si") return undefined;
  for (const stage of Object.values(GRAMMAR_STAGE_BY_ID)) {
    if (stage.mode === "review") continue;
    if (stage.conceptIds.includes(conceptId as never)) return stage.id;
  }
  return undefined;
}

export function getJapaneseA1ReviewFeedback(
  question: GrammarPracticeQuestion,
  selected: GrammarPracticeAnswer,
  correct: boolean,
): string | undefined {
  if (question.stageId !== "a1-validation") return undefined;
  const drillId = findReviewDrillId(question);
  if (!drillId) return undefined;

  if (drillId in A1_REVIEW_COMPOSED_JAPANESE || Array.isArray(question.answer)) {
    const special = A1_REVIEW_COMPOSED_JAPANESE[drillId as ComposedId];
    const sourceStage = getA1ReviewSourceStage(question.conceptIds[0]);
    const original = sourceStage
      ? GRAMMAR_PRACTICE_DRILLS[question.conceptIds[0] as keyof typeof GRAMMAR_PRACTICE_DRILLS]
        ?.find((drill) => drill.id === drillId)
      : undefined;
    const stageCorrect = sourceStage && original
      ? (JAPANESE_GRAMMAR_CORRECT_FEEDBACK as Record<string, Record<string, string>>)[sourceStage]?.[drillId]
      : undefined;
    const target = Array.isArray(question.answer) ? question.answer : [];
    if (correct) {
      return special?.correct ?? stageCorrect ??
        `正しく並べられました。「${target.join(" ")}」は述語が文末に来る基本語順です。`;
    }
    if (!Array.isArray(selected) || !Array.isArray(question.answer)) return undefined;
    const actual = selected.join(" ");
    const expected = target.join(" ");
    const last = target.at(-1);
    const prefix = `「${actual}」と並べましたね。`;
    if (last && selected.at(-1) !== last) {
      return `${prefix}この文では述語「${last}」を最後に置きます。${special?.orderHint ?? `「${expected}」の順を確認しましょう。`}`;
    }
    return `${prefix}述語の位置は合っていますが、前の語句の順番を確認しましょう。${special?.orderHint ?? `この問題の基本語順は「${expected}」です。`}`;
  }

  if (question.conceptIds[0] === "honorific-si") {
    const entry = A1_REVIEW_HONORIFIC_JAPANESE[drillId as HonorificId];
    if (!entry) return undefined;
    if (correct) return entry.correct;
    return typeof selected === "string"
      ? (entry.wrong as Record<string, string>)[selected]
      : undefined;
  }

  const sourceStage = getA1ReviewSourceStage(question.conceptIds[0]);
  if (!sourceStage) return undefined;
  if (correct) {
    return (JAPANESE_GRAMMAR_CORRECT_FEEDBACK as Record<string, Record<string, string>>)[sourceStage]?.[drillId];
  }
  return typeof selected === "string"
    ? (JAPANESE_GRAMMAR_WRONG_FEEDBACK as Record<string, Record<string, Record<string, string>>>)[sourceStage]?.[drillId]?.[selected]
    : undefined;
}
