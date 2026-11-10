import type { LocalizedModule } from "./types.ts";
import { GRAMMAR_STAGE_BY_ID } from "../grammar/stages.ts";
import { GRAMMAR_LESSON_GUIDES } from "../grammar/lessonGuides.ts";
import { GRAMMAR_CONCEPTS } from "../grammar/concepts.ts";
import { GRAMMAR_PRACTICE_DRILLS } from "../grammar/practiceDrills.ts";
import { JAPANESE_GRAMMAR_GUIDES } from "./grammarGuidesJapanese.ts";
import { JAPANESE_GRAMMAR_DRILLS } from "./grammarDrillsJapanese.ts";

/**
 * Grammar localization blocks 1–7: stages 1–35. A source-string display
 * catalogue, following Vocabulary/Counting/Classifiers. No questions,
 * Korean, answers, scores, navigation IDs or stored progress are translated.
 */
const STAGE_CONCEPTS = {
  "sentence-structure": "sentence-order",
  "identify-with-copula": "copula-ieyo-yeyo",
  "polite-register": "polite-style-yo",
  "introduce-topic": "topic-eun-neun",
  "demonstratives": "demonstratives-i-geu-jeo",
  "nominal-questions": "question-mwo-nugu-myeot",
  "existence": "subject-i-ga",
  "locate-thing": "location-e",
  "present-actions": "present-a-eoyo",
  "object-actions": "object-eul-reul",
  "action-location": "action-location-eseo",
  "destination-and-time": "destination-time-e",
  "possession": "possession-ui-je-nae",
  "information-questions": "interrogatives-basic",
  "simple-negation": "negation-an",
  "request-item": "request-n-juseyo",
  "request-quantity": "native-numbers",
  "sino-number-contexts": "sino-korean-numbers",
  "coordinate-items": "noun-link-hago-irang",
  "choose-alternative": "alternative-ina-animyeon",
  "request-action": "request-v-a-eo-juseyo",
  "polite-instructions": "polite-instruction-euseyo",
  "direction-and-means": "direction-means-ro-euro",
  "express-desire": "desire-go-sipeoyo",
  "express-ability": "ability-eul-su-isseoyo",
  "ask-permission": "permission-a-eodo-dwaeyo",
  "express-inability": "inability-mot",
  "add-item": "additive-do",
  "limit-request": "restrictive-man",
  "range-and-limit": "range-buteo-kkaji",
  "past-event": "past-ass-eosseoyo",
  "future-plan": "future-eul-geoyeyo",
  "decision-and-promise": "intention-eulgeyo",
  "link-actions": "sequence-go",
  "give-reason": "reason-a-eoseo",
} as const;

const STAGE_COPY = {
  "sentence-structure": {
    title: "文の語順",
    goal: "韓国語の文がどんな順番でできているかを知る",
    examples: ["私はコーヒーを飲みます。"],
  },
  "identify-with-copula": {
    title: "「〜です」と言う",
    goal: "人や物が何なのかを丁寧に伝える",
    examples: ["学生です。", "マークです。"],
  },
  "polite-register": {
    title: "丁寧に話す",
    goal: "普段の会話に合った丁寧な表現を使う",
    examples: ["学生です。", "学生です。"],
  },
  "introduce-topic": {
    title: "話題を示す",
    goal: "自己紹介をし、何について話すかを示す",
    examples: ["私はフランス人です。"],
  },
  "demonstratives": {
    title: "これ・それ・あれ",
    goal: "近くの物や遠くの物を指して説明する",
    examples: ["これは何ですか。"],
  },
  "nominal-questions": {
    title: "誰・何・いくつを尋ねる",
    goal: "人・物・数について丁寧に質問する",
    examples: ["誰ですか？", "何人ですか？"],
  },
  "existence": {
    title: "ある・ないを伝える",
    goal: "人や物、時間の有無を伝える",
    examples: ["時間がありません。"],
  },
  "locate-thing": {
    title: "人や物の場所を伝える",
    goal: "人や物がどこにいる・あるかを説明する",
    examples: ["トイレは２階にあります。"],
  },
  "present-actions": {
    title: "現在形で話す",
    goal: "今の動作や普段の習慣を丁寧に伝える",
    examples: ["毎日勉強します。"],
  },
  "object-actions": {
    title: "「〜を」を使って話す",
    goal: "何をするかを目的格助詞で伝える",
    examples: ["コーヒーを飲みます。"],
  },
  "action-location": {
    title: "動作の場所を表す",
    goal: "どこで何をするかを伝える",
    examples: ["カフェで勉強します。"],
  },
  "destination-and-time": {
    title: "行き先と時刻を伝える",
    goal: "目的地や具体的な時刻・曜日を伝える",
    examples: ["３時にソウル駅へ行きます。"],
  },
  "possession": {
    title: "持ち主を表す",
    goal: "自分や友達の持ち物について話す",
    examples: ["私の名前はマークです。"],
  },
  "information-questions": {
    title: "質問して情報を聞く",
    goal: "場所・時間・理由・方法・値段を尋ねる",
    examples: ["トイレはどこですか？"],
  },
  "simple-negation": {
    title: "否定の言い方",
    goal: "動作・状態・名詞の否定を使い分ける",
    examples: ["辛くありません。", "学生ではありません。"],
  },
  "request-item": {
    title: "品物を注文する",
    goal: "欲しい飲み物や品物を丁寧に頼む",
    examples: ["お水をください。"],
  },
  "request-quantity": {
    title: "数を指定して注文する",
    goal: "品物の数を助数詞と一緒に伝える",
    examples: ["アメリカーノを１杯ください。"],
  },
  "sino-number-contexts": {
    title: "日常生活の漢数詞",
    goal: "値段・時間・日付・番号を正しく読む",
    examples: ["これは１万ウォンです。"],
  },
  "coordinate-items": {
    title: "品物を「と」でつなぐ",
    goal: "複数の品物を一緒に注文する",
    examples: ["コーヒーとケーキをください。"],
  },
  "choose-alternative": {
    title: "「または」を使って選ぶ",
    goal: "２つの選択肢を示す",
    examples: ["コーヒーかお茶はありますか？"],
  },
  "request-action": {
    "title": "動作をお願いする",
    "goal": "相手にしてほしい動作を丁寧に頼む",
    "examples": [
      "もう一度言ってください。"
    ]
  },
  "polite-instructions": {
    "title": "丁寧な指示・案内",
    "goal": "-(으)세요 を使って案内や指示をする",
    "examples": [
      "ここで降りてください。"
    ]
  },
  "direction-and-means": {
    "title": "方向と手段を表す",
    "goal": "進む方向や交通・支払いの手段を伝える",
    "examples": [
      "カードにします。"
    ]
  },
  "express-desire": {
    "title": "「〜したい」を伝える",
    "goal": "自分の希望や、やってみたいことを表す",
    "examples": [
      "T-moneyカードを買いたいです。"
    ]
  },
  "express-ability": {
    "title": "できる・可能を表す",
    "goal": "自分の能力と、その場での実行可能性を伝える",
    "examples": [
      "ここでカードをチャージできますか？"
    ]
  },
  "ask-permission": {
    "title": "「〜してもいいですか」",
    "goal": "相手に行動の許可を求める",
    "examples": [
      "写真を撮ってもいいですか？"
    ]
  },
  "express-inability": {
    "title": "「〜できない」を伝える",
    "goal": "しないことと、事情があってできないことを区別する",
    "examples": [
      "具合が悪くて、今日は行けません。"
    ]
  },
  "add-item": {
    "title": "「〜も」を使って追加する",
    "goal": "すでにある物や人に、別の要素を加える",
    "examples": [
      "水もください。"
    ]
  },
  "limit-request": {
    "title": "「〜だけ」を表す",
    "goal": "ある物や数量がそれだけだと伝える",
    "examples": [
      "水だけあります。"
    ]
  },
  "range-and-limit": {
    "title": "「〜から〜まで」を表す",
    "goal": "時間の範囲や移動の到達点を示す",
    "examples": [
      "営業時間は9時から5時までです。"
    ]
  },
  "past-event": {
    "title": "過去形で話す",
    "goal": "終わった出来事をヘヨ体の過去形で伝える",
    "examples": [
      "予約しました。"
    ]
  },
  "future-plan": {
    "title": "これからの予定を話す",
    "goal": "自分の計画や未来の予想を伝える",
    "examples": [
      "明日、ソウルへ行く予定です。"
    ]
  },
  "decision-and-promise": {
    "title": "決意・約束を伝える",
    "goal": "会話の中で決めたことや約束を相手に伝える",
    "examples": [
      "カードで払いますね。"
    ]
  },
  "link-actions": {
    "title": "二つの動作をつなぐ",
    "goal": "「〜して、〜する」と二つの動作をつなげる",
    "examples": [
      "ここで食べてから行きます。"
    ]
  },
  "give-reason": {
    "title": "理由を説明する",
    "goal": "ある出来事の理由と結果をつなげて伝える",
    "examples": [
      "遅れてすみません。"
    ]
  }

} as const;

/** Shared UI wording and display-only labels for the first localized block.
 * The same catalogue can be extended to later stages without changing routing. */
const SHARED_COPY: Record<string, string> = {
  "Grammaire": "文法",
  "PARCOURS · GRAMMAIRE": "文法コース",
  "GRAMMAIRE · MINI-LEÇON": "文法・ミニレッスン",
  "Construis des phrases naturelles, étape par étape.": "一歩ずつ、自然な韓国語の文を作ろう。",
  "À CONTINUER": "学習の続き",
  "PROCHAINE ÉTAPE": "次のステップ",
  "PRÉREQUIS": "前提条件",
  "ACCÈS ACTIF": "学習できます",
  "PREMIUM": "プレミアム",
  "GRATUIT": "無料",
  "À DÉBLOQUER": "ロック中",
  "À VENIR": "未解放",
  "MAÎTRISÉE": "習得済み",
  "TERMINÉE": "完了",
  "EN COURS": "学習中",
  "DISPONIBLE": "学習可能",
  "DÉBLOQUER PREMIUM": "プレミアムを解放",
  "PRÉREQUIS À TERMINER": "前提ステップを完了",
  "REPRENDRE LA LEÇON": "学習を再開",
  "COMMENCER LA LEÇON": "レッスンを始める",
  "POUR BIEN COMMENCER": "まずはここから",
  "Commencer par une phrase simple": "簡単な文から始める",
  "Avant d’étudier la grammaire, découvre d’abord la structure de la phrase coréenne.": "文法に入る前に、まず韓国語の文のしくみを見てみましょう。",
  "Fondations": "基礎",
  "Construire une phrase": "文を組み立てる",
  "Agir au quotidien": "日常の行動を話す",
  "Exprimer ses besoins": "希望や要望を伝える",
  "Parler du temps et relier ses idées": "時間と文のつなぎ方",
  "Révision générale A1": "A1総復習",
  "Inclus avec K-App Premium": "K-App Premiumで利用できます",
  "Retour à l’accueil": "ホームに戻る",
  "Retour au parcours Grammaire": "文法コースに戻る",
  "Cette leçon n’existe pas.": "このレッスンは見つかりません。",
  "RETOUR AU PARCOURS": "コースに戻る",
  "NIVEAU A0": "A0レベル",
  "NIVEAU A1": "A1レベル",
  "ÉTAPE": "ステップ",
  "À QUOI ÇA SERT": "何のために使う？",
  "LA RÈGLE POUR LES EXERCICES": "練習で使うルール",
  "UN EXEMPLE": "例を見てみよう",
  "Masquer les explications détaillées": "詳しい説明を閉じる",
  "Afficher les explications détaillées": "詳しい説明を開く",
  "Voir les explications détaillées": "詳しく見る",
  "Formule, décomposition, erreurs fréquentes et astuce mémoire": "文の形、分解、よくある間違い、覚え方",
  "L’IDÉE ESSENTIELLE": "大事なポイント",
  "REGISTRE": "話し方",
  "PRIX À LIRE": "値段を読もう",
  "SUITE À COMPLÉTER": "続きを入れよう",
  "LIGNE À IDENTIFIER": "路線を選ぼう",
  "MOIS À IDENTIFIER": "月を選ぼう",
  "CHIFFRES À LIRE": "数字を読もう",
  "QUESTION À EXPRIMER": "質問を韓国語にしよう",
  "PHRASE CORÉENNE": "韓国語の文",
  "PHRASE À TRADUIRE": "韓国語にしてみよう",
  "EXERCICE": "問題",
  "Revoir l’explication sans quitter les exercices": "練習を続けながら解説を見直す",
  "Repères A2 Premium verrouillés. Ouvre l’offre Premium": "A2の応用ポイントはプレミアム限定です。プレミアムのご案内を開きます",
  "Ouvre l’offre Premium": "プレミアムのご案内を開きます",
  "A2 · PREMIUM": "A2・プレミアム",
  "Ferme l’explication et ouvre les exercices de cette leçon": "解説を閉じて、このレッスンの練習問題に進みます",
  "Poli courant": "ヘヨ体",
  "Formel": "ハムニダ体",
  "RÈGLE PRINCIPALE": "基本ルール",
  "À RETENIR": "覚えておこう",
  "MÉTHODE DE RÉVISION": "復習の進め方",
  "LA FORMULE": "基本の形",
  "STRUCTURE": "文のしくみ",
  "ÉTAPE PAR ÉTAPE": "順番に確認",
  "Une construction en trois mouvements": "３つの手順で組み立てよう",
  "EXEMPLES DÉCOMPOSÉS": "文を分けて見よう",
  "Lis la phrase comme une architecture": "一つひとつの役割を確かめよう",
  "ERREURS FRÉQUENTES": "よくある間違い",
  "Compare le réflexe et la forme juste": "間違いやすい形と正しい形を比べよう",
  "À ÉVITER": "ここに注意",
  "FORME JUSTE": "正しい形",
  "ASTUCE MÉMOIRE": "覚え方のコツ",
  "OBJECTIF DE LA LEÇON": "このレッスンの目標",
  "Fermer l’explication": "説明を閉じる",
  "Accéder aux exercices": "練習に進む",
  "LA RÈGLE": "ルール",
  "REPÈRES DE RÉVISION": "復習のポイント",
  "À comprendre et à utiliser": "理解して使えるように",
  "À reconnaître": "見て分かるように",
  "À RECONNAÎTRE": "見て分かるように",
  "EXEMPLES": "例文",
  "Repères avancés à reconnaître": "一歩進んだ表現",
  "Débloque les nuances A2 réceptives et leurs exemples.": "A2レベルのニュアンスと例文はプレミアムで学べます。",
  "AVANT DE COMMENCER": "始める前に",
  "Comprends la logique, puis entraîne-toi": "しくみを理解してから練習しよう",
  "Relis les repères de cette leçon": "このレッスンのポイントを確認しよう",
  "L’explication s’ouvre dans une mini-leçon dédiée. Tu pourras la consulter à nouveau pendant les exercices sans perdre ta progression.": "解説はミニレッスンで確認できます。練習の途中でも、進み具合を失わずに見直せます。",
  "COMMENCER LES EXERCICES": "練習を始める",
  "Revoir l’explication": "解説を見直す",
  "Revoir l’explication avant de commencer": "始める前に解説を見直す",
  "OUVRIR L’EXPLICATION": "解説を開く",
  "CONTEXTE": "場面",
  "PHRASE À FORMER": "文を作ろう",
  "PHRASE À COMPLÉTER": "文を完成させよう",
  "PHRASE À EXPRIMER": "言ってみよう",
  "RÉPLIQUE À COMPLÉTER": "返答を完成させよう",
  "FORME À TRANSFORMER": "形を変えよう",
  "INDICE": "ヒント",
  "QUESTION À COMPLÉTER": "質問を完成させよう",
  "Remets les éléments dans l’ordre pour former la phrase coréenne indiquée.": "単語を正しい順番に並べて、韓国語の文を作りましょう。",
  "Choisis la forme qui exprime exactement le sens demandé.": "場面に合う表現を選びましょう。",
  "Complète la phrase avec la forme grammaticalement correcte.": "文法に合う形を選んで、文を完成させましょう。",
  "Transforme la forme du dictionnaire selon la consigne.": "辞書形を、指示された形に変えましょう。",
  "Touche les éléments dans le bon ordre.": "正しい順番にタップしましょう。",
  "VALIDER LA PHRASE": "この文で答える",
  "BONNE RÉPONSE": "正解！",
  "TON CHOIX EXPLIQUÉ": "選んだ答えを確認",
  "POUR CET EXERCICE": "この問題の正解",
  "RÉPONSE ATTENDUE": "正解",
  "CONTINUER": "次へ",
  "VOIR MON BILAN": "結果を見る",
  "ÉTAPE TERMINÉE": "ステップ完了",
  "ÉTAPE À REPRENDRE": "もう一度チャレンジ",
  "Objectif atteint. Tu peux poursuivre ou refaire la leçon.": "目標達成！ 次に進んでも、もう一度練習しても大丈夫です。",
  "Revois les corrections ci-dessous, puis essaie de nouveau.": "下の解説を確認してから、もう一度挑戦しましょう。",
  "PRÉCISION": "正答率",
  "POINTS À REVOIR": "復習する問題",
  "TENTATIVE": "挑戦回数",
  "TES POINTS À REVOIR": "復習したいポイント",
  "REFAIRE LA LEÇON": "もう一度練習",
  "RÉESSAYER": "再挑戦",
  "ÉTAPE SUIVANTE": "次のステップ",
  "ÉTAPE VERROUILLÉE": "ロック中のステップ",
  "Cette étape n’est pas encore accessible.": "このステップはまだ学習できません。",
  "VOIR LE PARCOURS": "コースを見る",
  "DÉCOUVRIR PREMIUM": "プレミアムを見る",
  "Observe, choisis, puis construis": "見て、選んで、組み立てよう",
  "Repère la particule ou la terminaison utile, vérifie sa place, puis lis la phrase entière avant de répondre.": "必要な助詞や語尾を見つけて、位置を確認しましょう。答える前に文全体を読んでみてください。",
  "CONSTRUCTION": "文を組み立てよう",
  "COMPRÉHENSION": "意味を確認",
  "FORME": "形を選ぼう",
  "Passe à la pratique": "練習に進もう",
  "Applique ces repères dans une série d’exercices guidés.": "学んだポイントを、練習問題で使ってみましょう。",
  "RÉSULTATS PAR FAMILLE": "分野別の結果",
  "Chaque tentative évalue cinq familles de compétences. Les variantes changent pour approfondir les notions non encore rencontrées.": "毎回5つの分野を確認します。繰り返すと別の問題にも取り組めます。",
  "Cette session date de l'ancienne révision A1. Refais le bilan pour retrouver les 25 questions et les résultats par famille.": "以前のA1復習結果です。もう一度受けると25問と分野別の結果を確認できます。",
  "VERBE FINAL": "動詞は最後",
  "CHOIX GUIDÉ": "選択問題",
  "MISE EN SITUATION": "場面に合う表現",
  "TRANSFORMATION": "活用問題",
  "PHRASE À RECONSTRUIRE": "語順の問題",
  "FORME À CHOISIR": "形を選ぼう",
  "ÉCOUTE": "聞き取り",
  "PARTICULES": "助詞",
  "CONJUGAISON": "活用",
  "CAPACITÉ PERSONNELLE": "本人の能力",
  "FAISABILITÉ DANS CETTE SITUATION": "この場面でできるか",
};

const CONCEPT_COPY: Record<string, Record<string, string>> = {
  "sentence-structure": {
    "prédicat final ; sujet souvent omis": "述語は最後・主語は省略できる",
    "Organiser une phrase coréenne.": "韓国語の語順を理解する。",
    "Le verbe ou l’adjectif se place à la fin. Le sujet peut être omis quand le contexte suffit.": "動詞や形容詞は文の最後に来ます。誰のことか分かるときは、主語を省くこともできます。",
    "Au café, tu expliques simplement ce que tu bois.": "カフェで自分が飲んでいる物を伝えます。",
    "Je bois du thé.": "お茶を飲みます。",
    "Moi, je bois du café.": "私はコーヒーを飲みます。",
    "Je rentre à la maison.": "家に帰ります。",
  },
  "identify-with-copula": {
    "Dire ce qu’est une personne ou une chose.": "人や物について「〜です」と言う。",
    "Ajoute 이에요 après une consonne et 예요 après une voyelle pour identifier une personne ou une chose.": "人や物について「〜です」と言うとき、パッチムがあれば 이에요、母音で終われば 예요 を付けます。",
    "Tu te présentes à une nouvelle collègue et tu lui donnes ton prénom.": "初対面の同僚に名前を伝えます。",
    "Je m’appelle Sophie.": "ソフィーです。",
    "Je suis étudiant.": "学生です。",
    "C’est Marc.": "マークです。",
  },
  "polite-register": {
    "Parler poliment au quotidien.": "普段の会話で丁寧に話す。",
    "La terminaison 요 marque le style poli courant. Utilise-la avec un adulte ou une personne que tu connais peu.": "ヘヨ体は、普段の会話でよく使う丁寧な話し方。文末の -요 が目印です。",
    "Un serveur te propose une table calme et tu acceptes poliment.": "店員さんの席の提案を丁寧に受け入れます。",
    "Ça me va.": "それでお願いします。",
    "Ça va.": "大丈夫です。",
    "Ce plat est délicieux.": "この料理はおいしいです。",
    "Je suis étudiant.": "学生です。",
    "CONTEXTE\nUn proche s’inquiète pour toi.": "場面\n親しい人が心配してくれています。",
    "Reconnaître des nuances polies fréquentes.": "よく使う丁寧な言い回しの違いを聞き分ける。",
    "Reconnaître un registre familier sans le produire.": "くだけた話し方を聞いて理解する。",
    "반말 et contractions de dialogue": "반말（パンマル）と会話での省略形",
  },
  "introduce-topic": {
    "Annoncer le thème d’une phrase.": "文の話題を示す。",
    "Ajoute 은 après une consonne et 는 après une voyelle pour annoncer le thème ou créer un contraste.": "話題や対比を示すには、パッチムの後に 은、母音の後に 는 を付けます。",
    "Tu précises ce que tu fais aujourd’hui, par contraste avec les autres jours.": "ほかの日とは違って、今日は何をするかを伝えます。",
    "Aujourd’hui, je me repose.": "今日は休みます。",
    "Moi, je suis français.": "私はフランス人です。",
  },
  "demonstratives": {
    "Désigner une personne ou une chose selon sa position.": "物の位置に応じて指し示す。",
    "Place 이, 그 ou 저 devant un nom : près de toi, de l’interlocuteur ou loin des deux.": "名詞の前に 이／그／저 を置きます。自分の近く・相手の近く・二人から遠い所を区別します。",
    "Dans un magasin, tu désignes les chaussures proches de la vendeuse.": "お店で、店員さんの近くにある靴を指します。",
    "C’est cette paire de chaussures-là.": "その靴です。",
    "Qu’est-ce que cet objet-ci ?": "これは何ですか。",
    "Je suis étudiant.": "学生です。",
  },
  "nominal-questions": {
    "Demander qui, quoi ou combien.": "誰・何・数について尋ねる。",
    "Qui est cette personne ?": "誰ですか？",
    "Vous êtes combien ?": "何人ですか？",
  },
  "existence": {
    "Marquer ce qui est ou ce qui arrive.": "何が起こるか・何があるかを示す。",
    "Dire qu’une chose existe ou manque.": "人や物の有無を伝える。",
    "Je n’ai pas le temps.": "時間がありません。",
    "Où sont les toilettes ?": "トイレはどこですか？",
    "Avez-vous un plat à recommander ?": "おすすめの料理はありますか？",
  },
  "locate-thing": {
    "Situer une personne ou une chose.": "人や物のいる場所・ある場所を伝える。",
    "Les toilettes sont au deuxième étage.": "トイレは２階にあります。",
    "La carte est dans le sac.": "カードはかばんの中にあります。",
  },
  "present-actions": {
    "Parler d’une action présente ou habituelle.": "今の動作や普段の習慣について話す。",
    "J’étudie tous les jours.": "毎日勉強します。",
    "Je bois du café.": "コーヒーを飲みます。",
    "Reconnaître une proposition qui précise un nom.": "名詞を詳しく説明する表現を見分ける。",
  },
  "object-actions": {
    "Marquer ce que l’action concerne.": "動作の対象を目的格助詞で示す。",
    "Je bois du café.": "コーヒーを飲みます。",
    "J’étudie le coréen.": "韓国語を勉強します。",
  },
  "action-location": {
    "Situer l’endroit où une action se déroule.": "動作が行われる場所を示す。",
    "Ajoute 에서 au lieu où une action se déroule, puis place le verbe à la fin. Avec 있어요 ou 없어요, utilise 에 : 카페에서 공부해요, mais 카페에 있어요. La distinction dépend donc du verbe.": "動作が行われる場所には 에서 を付けます。카페에서 공부해요.（カフェで勉強します）と、카페에 있어요.（カフェにいます）を比べましょう。",
    "On te demande où tu lis habituellement.": "普段どこで読書するかを聞かれています。",
    "Je lis un livre à la bibliothèque.": "図書館で本を読みます。",
    "J’étudie au café.": "カフェで勉強します。",
    "Je descends à Hongdae.": "弘大入口で降ります。",
  },
  "destination-and-time": {
    "Indiquer une destination ou un moment.": "行き先や時刻を示す。",
    "Ajoute 에 après une destination avec un verbe de déplacement, ou après un moment précis. Le contexte distingue les deux emplois : 서울에 가요 signifie aller à Séoul ; 세 시에 만나요, se retrouver à trois heures.": "移動の目的地や特定の時刻には 에 を付けます。서울에 가요.（ソウルへ行きます）と 세 시에 만나요.（３時に会います）を比べましょう。",
    "destination + 에 + déplacement": "目的地＋에＋移動の動詞",
    "에 marque le lieu vers lequel on va.": "에 は向かう先を表します。",
    "moment précis + 에": "特定の時刻＋에",
    "에 marque l’heure ou le moment d’une action.": "에 は動作の時刻を表します。",
    "Tu confirmes à quelle heure tu retrouves un ami.": "友達と会う時刻を確認しています。",
    "Je retrouve un ami à deux heures.": "２時に友達と会います。",
    "Je vais à la gare de Séoul à trois heures.": "３時にソウル駅へ行きます。",
    "Je rentre à la maison.": "家に帰ります。",
  },
  "possession": {
    "Dire à qui une chose appartient.": "物の持ち主を表す。",
    "Place 의 entre le possesseur et l’objet. 제 et 내 signifient respectivement « mon » en style poli et familier.": "持ち主と物の間に 의 を付けます。「私の」は丁寧な 제 と、くだけた 내 を使い分けます。",
    "À bord, tu confirmes qu’il s’agit bien de ton billet.": "車内で、自分のチケットだと確認します。",
    "C’est mon billet.": "私のチケットです。",
    "Mon nom est Marc.": "私の名前はマークです。",
    "C’est le sac de mon ami.": "友達のかばんです。",
  },
  "information-questions": {
    "Demander une information simple.": "必要な情報を質問する。",
    "Garde le mot interrogatif à la place de l’information inconnue : 어디 pour un lieu, 언제 pour un moment, 왜 pour une raison.": "知りたい情報に合わせて疑問詞を置きます。場所は 어디、時間は 언제、理由は 왜 です。",
    "Sur le quai, tu demandes l’heure d’arrivée du train.": "ホームで、列車の到着時刻を尋ねます。",
    "Quand arrive le train ?": "列車はいつ来ますか？",
    "Où sont les toilettes ?": "トイレはどこですか？",
    "Combien coûte cet article-ci ?": "これはいくらですか？",
  },
  "simple-negation": {
    "Dire qu’une action ou un état ne se réalise pas.": "動作や状態を否定する。",
    "Corriger une identité ou une catégorie.": "名詞の内容を否定する。",
    "Place 안 juste avant le verbe ou l’adjectif conjugué. Avec 하다, la forme naturelle est souvent 안 해요.": "短い否定は動詞や形容詞の前に 안 を付けます。하다 動詞では 공부 안 해요. のような言い方もよく使います。",
    "Pour nier un nom, ajoute 이/가 puis 아니에요. N’utilise pas 안 devant 이에요 ou 예요.": "名詞を否定するには 이／가 아니에요 を使います。이에요／예요 の前に 안 を付けることはできません。",
    "On t’invite à sortir aujourd’hui, mais tu déclines simplement.": "今日は誘われましたが、出かけないと答えます。",
    "Je n’y vais pas aujourd’hui.": "今日は行きません。",
    "Dans le train, tu indiques que le siège montré n’est pas le tien.": "車内で、示された座席が自分の席ではないと伝えます。",
    "Ce n’est pas ma place.": "私の席ではありません。",
    "Ce n’est pas épicé.": "辛くありません。",
    "Je ne bois pas de café.": "コーヒーは飲みません。",
    "Je ne suis pas étudiant.": "学生ではありません。",
    "Ce n’est pas du café.": "コーヒーではありません。",
    "Reconnaître l’idée de « seulement » avec une négation.": "「〜しか〜ない」に近い否定表現を見分ける。",
  },
  "request-item": {
    "Demander une chose simplement.": "欲しい品物を丁寧に頼む。",
    "Place le nom demandé devant 주세요. 좀 peut adoucir la demande, mais il n’est pas obligatoire.": "注文したい物の後ろに 주세요 を付けます。좀 を加えると少し柔らかい依頼になります。",
    "Après avoir payé, tu demandes le reçu au vendeur.": "支払いの後、店員さんにレシートを渡してもらいます。",
    "Le reçu, s’il vous plaît.": "レシートをください。",
    "De l’eau, s’il vous plaît.": "お水をください。",
    "Un americano glacé, s’il vous plaît.": "アイスアメリカーノをください。",
  },
  "request-quantity": {
    "Devant un classificateur, 하나, 둘, 셋 et 넷 deviennent 한, 두, 세 et 네 devant les noms comptés.": "助数詞の前では 하나・둘・셋・넷 が 한・두・세・네 に変わります。",
    "Place le nombre puis le classificateur après le nom : 개 pour les objets, 명 pour les personnes, 잔 pour les boissons.": "物の個数は 개、人は 명、飲み物の杯数は 잔。名詞の後に数詞と助数詞を続けます。",
    "Au marché, tu commandes trois pommes.": "市場でリンゴを３個注文します。",
    "Trois pommes, s’il vous plaît.": "リンゴを３個ください。",
    "Au guichet, tu commandes deux billets.": "窓口でチケットを２枚注文します。",
    "Deux billets, s’il vous plaît.": "チケットを２枚ください。",
    "Un americano, s’il vous plaît.": "アメリカーノを１杯ください。",
  },
  "sino-number-contexts": {
    "Utilise les nombres sino-coréens pour les prix, les minutes, les dates, les étages, les lignes et les numéros.": "値段・分・日付・階・路線番号などには韓国語の漢数詞を使います。",
    "Le vendeur annonce un prix de cinq mille wons.": "店員さんが5,000ウォンだと伝えています。",
    "Cela coûte cinq mille wons.": "5,000ウォンです。",
    "Cela coûte dix mille wons.": "１万ウォンです。",
  },
  "coordinate-items": {
    "Ajoute 하고 ou (이)랑 au premier nom pour dire « et » ou « avec » ; (이)랑 suit la présence d’une consonne. 와/과 exprime le même lien dans un registre plus écrit ou formel.": "名詞に 하고／(이)랑 を付けて「と・一緒に」を表します。パッチムがあれば 이랑、なければ 랑。와／과 はより書き言葉的なつなぎ方です。",
    "À l’épicerie, tu demandes du pain et du lait.": "お店でパンと牛乳の両方を注文します。",
    "Du pain et du lait, s’il vous plaît.": "パンと牛乳をください。",
    "Un café et un gâteau, s’il vous plaît.": "コーヒーとケーキをください。",
  },
  "choose-alternative": {
    "Ajoute 이나 après une consonne et 나 après une voyelle pour relier des noms possibles. 아니면 relie plutôt deux propositions ou introduit une autre possibilité : 커피나 차, mais 가요? 아니면 집에 있어요?": "名詞にパッチムがあれば 이나、なければ 나 を付けて２択を示します。２つの質問を「それとも」でつなぐには 아니면 を使います。",
    "N(이)나 N": "名詞＋(이)나＋名詞",
    "(이)나 relie directement deux noms possibles.": "(이)나 は２つの名詞を選択肢としてつなぎます。",
    "proposition + 아니면 + proposition": "文＋아니면＋文",
    "아니면 introduit une autre proposition ou une nouvelle option.": "아니면 は「それとも」と、別の選択肢を示します。",
    "Pour le trajet, tu proposes le bus ou le métro comme possibilités.": "移動手段としてバスか地下鉄のどちらかを提案します。",
    "J’y vais en bus ou en métro.": "バスか地下鉄で行きます。",
    "Avez-vous du café ou du thé ?": "コーヒーかお茶はありますか？",
  },
  "request-action": {
    "Demander à quelqu’un de faire une action.": "相手に動作をしてもらうよう丁寧に頼む。",
    "Conjugue le verbe en -아/어, puis ajoute 주세요 pour demander une action au destinataire. Cette construction porte sur une action ; pour demander un objet, place simplement le nom devant 주세요.": "動詞を아／어形にして 주세요 を続けます。物が欲しいときの名詞＋주세요 と、動作をしてほしいときの動詞＋아／어 주세요 を区別しましょう。",
    "Ton interlocuteur parle trop vite ; tu lui demandes de ralentir.": "相手の話す速度が速いので、ゆっくり話してもらいます。",
    "Parlez lentement, s’il vous plaît.": "ゆっくり話してください。",
    "Répétez, s’il vous plaît.": "もう一度言ってください。",
    "Emballez cette commande pour l’emporter, s’il vous plaît.": "持ち帰り用に包んでください。",
    "Reconnaître une action faite humblement pour quelqu’un.": "相手のために謙譲的に行動する表現を聞き取る。",
    "Reconnaître des requêtes plus nuancées.": "より丁寧で控えめなお願いの言い方を見分ける。"
  },
  "polite-instructions": {
    "Parler à l’impératif de façon polie.": "相手に丁寧に指示したり案内したりする。",
    "Ajoute 으세요 après une consonne et 세요 après une voyelle pour parler à l’impératif de façon polie. En coréen courant, la forme peut aussi servir à inviter respectueusement quelqu’un à agir : 앉으세요 signifie « asseyez-vous ».": "語幹が母音で終われば 세요、パッチムで終われば 으세요（ㄹは脱落）。앉으세요 は丁寧な指示だけでなく、席を勧める言い方にもなります。",
    "Tu demandes poliment à une personne de s’asseoir ici.": "来客にこの席へ座るよう丁寧に案内します。",
    "Asseyez-vous ici.": "ここにお座りください。",
    "Descendez ici.": "ここで降りてください。",
    "Allez dans cette direction.": "こちらへ進んでください。"
  },
  "direction-and-means": {
    "Indiquer une direction ou un moyen.": "進む方向や利用する手段を示す。",
    "Ajoute 으로 après une consonne, sauf ㄹ, et 로 après une voyelle ou ㄹ. La particule indique une direction ou un moyen : 오른쪽으로 가요, 카드로 계산해요. Le nom précède toujours la particule.": "母音・ㄹ の後は 로、それ以外のパッチムの後は 으로。오른쪽으로 は進む方向、카드로 は支払いの手段です。",
    "direction + (으)로": "方向＋(으)로",
    "(으)로 indique la direction suivie.": "(으)로 は進む方向を表します。",
    "moyen + (으)로": "手段＋(으)로",
    "(으)로 indique le moyen utilisé pour agir.": "(으)로 は交通・支払いなどの手段を表します。",
    "Dans la rue, tu indiques à quelqu’un de partir vers la droite.": "道で相手に右へ進むよう案内します。",
    "Allez à droite.": "右へ進んでください。",
    "Ce sera par carte.": "カードにします。",
    "J’y vais en métro.": "地下鉄で行きます。",
    "CONTEXTE\nOn te demande : « Carte ou espèces ? »": "場面\n「カードですか、現金ですか」と聞かれています。",
    "CONTEXTE\nLa destination du trajet est déjà connue.": "場面\n行き先はすでに共有しています。"
  },
  "express-desire": {
    "Dire ce que l’on souhaite faire.": "自分の「〜したい」という希望を表す。",
    "Retire 다 de la forme du dictionnaire, puis ajoute 고 싶어요 pour exprimer ton propre souhait. Avec une autre personne, préfère une question ou une formulation indirecte : 뭐 먹고 싶어요?": "辞書形の 다 を取り、語幹に 고 싶어요 を続けます。相手の希望を聞くなら 뭐 먹고 싶어요? のように質問しましょう。",
    "Au restaurant, tu dis ce que tu aimerais manger.": "レストランで食べたい物を伝えます。",
    "Je veux manger du bibimbap.": "ビビンバを食べたいです。",
    "Je voudrais acheter une carte T-money.": "T-moneyカードを買いたいです。",
    "Je veux aller en Corée.": "韓国へ行きたいです。"
  },
  "express-ability": {
    "Dire ce qu’on peut faire ou ce qui est faisable dans une situation.": "能力や、その場で実行できる可能性を伝える。",
    "Ajoute ㄹ 수 있어요 après une voyelle et 을 수 있어요 après une consonne pour exprimer une capacité ou une possibilité. La forme vérifie si l’action est réalisable, jamais si elle est autorisée. Remplace 있어요 par 없어요 quand elle est impossible.": "語幹が母音で終われば ㄹ 수 있어요、パッチムで終われば 을 수 있어요。能力・状況上の可能性を表し、없어요 にすると不可能です。この練習では許可を求める -아／어도 돼요? と区別します。",
    "À la caisse, tu demandes si le paiement par carte est possible ici.": "レジでカード決済が利用できるかを確認します。",
    "Le paiement par carte est-il possible ici ?": "ここでカード決済できますか？",
    "Est-il possible de recharger ma carte ici ?": "ここでカードをチャージできますか？",
    "Je sais lire le coréen.": "韓国語を読めます。",
    "CONTEXTE\nTu es à un guichet T-money avec ta carte.": "場面\nT-moneyカードを持って窓口に来ています。",
    "Reconnaître une possibilité parmi d’autres.": "複数の可能性のうちの一つであることを見分ける。"
  },
  "ask-permission": {
    "Demander si une action est autorisée.": "ある行動をしてもよいか尋ねる。",
    "Conjugue le verbe en -아/어도 돼요? pour demander si une action est autorisée. Cette forme demande une permission, tandis que -(으)ㄹ 수 있어요? vérifie plutôt une possibilité ou une capacité.": "動詞を아／어形にして 도 돼요? を付けると「〜してもいいですか」と許可を尋ねられます。(으)ㄹ 수 있어요? は主に可能性・能力を尋ねます。",
    "Dans une chambre, tu demandes l’autorisation d’ouvrir la fenêtre.": "部屋の窓を開けてもよいか管理者に聞きます。",
    "Puis-je ouvrir la fenêtre ?": "窓を開けてもいいですか？",
    "Puis-je prendre une photo ?": "写真を撮ってもいいですか？",
    "Puis-je m’asseoir ici ?": "ここに座ってもいいですか？",
    "INTENTION\nDemande d’autorisation": "意図\n行動の許可を求める"
  },
  "express-inability": {
    "Dire que l’on ne peut pas faire quelque chose.": "できない事情があることを伝える。",
    "Ce module entraîne 못 : place-le avant le verbe quand l’action est impossible ou hors de tes capacités. 안 exprime un choix ; un son trop faible se décrit avec 잘 안 들려요. Retiens 못 가요 : « je ne peux pas y aller ».": "못 は動詞の前に置き、事情や能力の問題で「できない」ことを表します。안 は単なる否定にも使われ、聞こえにくいときには 잘 안 들려요 も自然です。못 가요 は「行けません」。",
    "Tu expliques que tu voudrais venir, mais qu’une urgence t’en empêche.": "行きたいのに急用のため行けないと説明します。",
    "Je ne peux pas y aller aujourd’hui.": "今日は行けません。",
    "Je ne comprends pas bien.": "よく聞き取れません。",
    "Je ne peux pas manger de plats épicés.": "辛い料理は食べられません。",
    "Je ne peux pas y aller aujourd’hui parce que je suis malade.": "具合が悪くて、今日は行けません。"
  },
  "add-item": {
    "Ajouter une personne ou une chose.": "人や物をもう一つ加える。",
    "Ajoute 도 directement au nom pour signifier « aussi » ou « même ». La particule remplace généralement 은/는, 이/가 ou 을/를 : 저도 가요 signifie « moi aussi, j’y vais ». Compare 물도 주세요 et 물만 주세요.": "도 を名詞に直接付けると「〜も」と追加を表します。通常は 은／는、이／가、을／를 と置き換えます。저도 가요 は「私も行きます」。물도 と 물만 の違いも押さえましょう。",
    "Après une première commande, tu ajoutes du kimchi.": "最初の注文にキムチを追加します。",
    "Du kimchi aussi, s’il vous plaît.": "キムチもください。",
    "De l’eau aussi, s’il vous plaît.": "水もください。",
    "Moi aussi, j’y vais.": "私も行きます。"
  },
  "limit-request": {
    "Dire qu’un seul élément est disponible.": "利用できる物・数量を「〜だけ」と限定して伝える。",
    "Ajoute 만 au groupe disponible et garde la phrase affirmative : 물만 있어요, « il n’y a que de l’eau ». Pour annoncer une disponibilité, 만 convient ; pour une possession exclusive, 밖에 없어요 peut être plus naturel.": "存在する物のまとまりに 만 を付け、肯定文の 있어요 を続けます。물만 있어요 は「水だけあります」。所有物がそれしかない場合は 밖에 없어요 が自然なこともあります。",
    "On te demande quelle boisson est disponible ; tu l’annonces directement avec la forme positive de la leçon.": "提供できる飲み物を、レッスンの肯定文の形で答えます。",
    "Il n’y a que de l’eau.": "水だけあります。",
    "Il n’y a que du café.": "コーヒーだけあります。"
  },
  "range-and-limit": {
    "Donner un début, une fin ou une limite.": "開始点・終点・到達点を伝える。",
    "Ajoute 부터 au point de départ et 까지 au point d’arrivée d’une période ou d’un trajet. Tu peux employer les deux ensemble ou seulement 까지 : 아홉 시부터 다섯 시까지.": "期間の始まりに 부터、終わりや到達点に 까지 を付けます。両方を使うほか、서울역까지 のように 까지 だけでも使えます。",
    "Tu indiques les jours entre lesquels tu travailles.": "勤務する曜日の範囲を伝えます。",
    "Je travaille du lundi au vendredi.": "月曜日から金曜日まで働きます。",
    "Les horaires sont de neuf heures à cinq heures.": "営業時間は9時から5時までです。",
    "Je vais jusqu’à la gare de Séoul.": "ソウル駅まで行きます。",
    "CONTEXTE\nTu indiques les horaires d’ouverture d’un lieu.": "場面\n施設の営業時間を案内しています。",
    "Reconnaître l’idée de répétition à chaque occasion.": "「〜するたびに」という繰り返しの意味を見分ける。"
  },
  "past-event": {
    "Parler d’un événement terminé.": "終わった出来事を伝える。",
    "Ajoute 았어요 si la dernière voyelle est ㅏ ou ㅗ, sinon 었어요 ; 하다 devient 했어요. Cette terminaison présente une action ou un état comme achevé : 어제 영화를 봤어요.": "語幹の最後の母音が ㅏ・ㅗ なら 았어요、それ以外なら 었어요 が基本。하다 は 했어요。어제 영화를 봤어요. のように過去の出来事を表します。",
    "Tu racontes ce que tu as regardé hier.": "昨日見た映画について話します。",
    "J’ai regardé un film hier.": "昨日、映画を見ました。",
    "J’ai réservé.": "予約しました。",
    "J’ai mangé hier.": "昨日、食べました。"
  },
  "future-plan": {
    "Parler d’un projet simple.": "これからの計画を伝える。",
    "Ajoute ㄹ 거예요 après une voyelle et 을 거예요 après une consonne pour annoncer un projet ou une prévision. Cette forme présente un plan, sans la nuance de décision adressée à quelqu’un portée par -(으)ㄹ게요.": "母音終わりの語幹には ㄹ 거예요、ㄹ以外のパッチムには 을 거예요 を付けます。予定・予想を伝える形で、相手に向けた申し出の -(으)ㄹ게요 と区別します。",
    "Tu annonces ton projet de voyage pour la semaine prochaine.": "来週の旅行予定を伝えます。",
    "Je vais aller à Busan la semaine prochaine.": "来週、釜山へ行く予定です。",
    "Demain, j’irai à Séoul.": "明日、ソウルへ行く予定です。",
    "Je vais voir un ami ce week-end.": "週末、友達に会う予定です。"
  },
  "decision-and-promise": {
    "Annoncer une décision ou une promesse.": "自分が引き受けることや約束を伝える。",
    "Ajoute ㄹ게요 après une voyelle et 을게요 après une consonne pour annoncer une décision prise par le locuteur, souvent en réaction à l’interlocuteur. Pour un simple projet déjà prévu, utilise plutôt -(으)ㄹ 거예요.": "相手への返事として決意・約束を伝えるには、母音終わりの語幹に ㄹ게요、それ以外のパッチムに 을게요 を付けます。予定の報告は -(으)ㄹ 거예요 と区別します。",
    "Quelqu’un doit ouvrir la porte ; tu proposes de t’en charger.": "ドアを開ける人が必要なので、自分が引き受けると申し出ます。",
    "Je vais ouvrir la porte.": "私がドアを開けますね。",
    "Je vais régler par carte.": "カードで払いますね。",
    "Je m’en charge.": "私がやります。",
    "NUANCE\nDécision prise maintenant": "ニュアンス\nその場で決めたこと",
    "CONTEXTE\nQuelqu’un demande qui accomplira l’action.": "場面\n誰がその作業をするか尋ねられています。"
  },
  "link-actions": {
    "Relier deux actions.": "二つの動作をつなげる。",
    "Ajoute 고 au radical du premier verbe, puis conjugue seulement le dernier pour relier deux actions. L’ordre peut suivre la chronologie, mais 고 signifie d’abord simplement « et » : 먹고 가요.": "一つ目の動詞の語幹に 고 を付け、文末の動詞だけを活用します。-고 は動作をつなぎ、文脈によって時間の順番も表しますが、それ自体は必ずしも順序を示しません。",
    "Tu décris deux actions successives de ton repas.": "食事をして、コーヒーを飲むという二つの動作を伝えます。",
    "Je mange, puis je bois un café.": "ご飯を食べて、コーヒーを飲みます。",
    "Je vais manger ici avant de partir.": "ここで食べてから行きます。",
    "Je prends le métro, puis je change de ligne.": "地下鉄に乗って、乗り換えます。",
    "CONTEXTE\nAu restaurant, on te demande : « Sur place ou à emporter ? »": "場面\n飲食店で「店内で召し上がりますか、お持ち帰りですか」と聞かれています。",
    "Reconnaître deux actions reliées avec une nuance.": "二つの動作をつなぐ表現の違いを聞き分ける。",
    "Reconnaître une parole rapportée.": "人が話した内容を間接的に伝える表現を理解する。"
  },
  "give-reason": {
    "Donner une raison simple.": "理由を簡単に説明する。",
    "Ajoute 아서 si la dernière voyelle est ㅏ ou ㅗ, sinon 어서, pour relier une cause à sa conséquence. Dans cette construction, ne marque généralement pas le passé sur la première proposition : 늦어서 죄송해요.": "理由を表すとき、語幹の母音が ㅏ・ㅗ なら 아서、それ以外なら 어서、하다 なら 해서 です。늦어서 죄송해요. のように理由を先に示し、この初級構文では時制は通常文末で表します。",
    "Comme il pleut, tu expliques pourquoi tu prends un taxi.": "雨が降っているのでタクシーに乗ると説明します。",
    "Je prends un taxi parce qu’il pleut.": "雨が降っているので、タクシーに乗ります。",
    "Désolé d’être en retard.": "遅れてすみません。",
    "Je ne peux pas y aller parce que je suis malade.": "具合が悪いので行けません。"
  }

};

export const GRAMMAR_COPY_BY_MODULE: Record<string, Record<string, string>> = {
  shared: SHARED_COPY,
  hub: {
    ...SHARED_COPY,
    "Commencer par une phrase simple": "簡単な文から始める",
  },
};

function add(module: string, source: string | undefined, japanese: string | undefined) {
  if (!source || !japanese || !japanese.trim() || source === japanese) return;
  (GRAMMAR_COPY_BY_MODULE[module] ??= {})[source] = japanese;
}

for (const stageId of Object.keys(STAGE_CONCEPTS) as (keyof typeof STAGE_CONCEPTS)[]) {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const stageTranslation = STAGE_COPY[stageId];
  const guide = GRAMMAR_LESSON_GUIDES[stageId];
  const translatedGuide = JAPANESE_GRAMMAR_GUIDES[stageId];
  const concept = GRAMMAR_CONCEPTS.find((item) => item.id === STAGE_CONCEPTS[stageId]);

  add(stageId, stage.title, stageTranslation.title);
  add("hub", stage.title, stageTranslation.title);
  add(stageId, stage.communicativeGoal, stageTranslation.goal);
  add("hub", stage.communicativeGoal, stageTranslation.goal);
  stage.canonicalExamples.forEach((example, index) =>
    add(stageId, example.french, stageTranslation.examples[index]));

  add(stageId, guide.introduction, translatedGuide.introduction);
  add(stageId, guide.mainRule, translatedGuide.mainRule);
  add(stageId, guide.formula.pattern, translatedGuide.formula.pattern);
  add(stageId, guide.formula.explanation, translatedGuide.formula.explanation);
  guide.steps.forEach((step, index) => {
    const translation = translatedGuide.steps[index];
    if (!translation) throw new Error(`Missing Japanese grammar guide step: ${stageId}/${index}`);
    add(stageId, step.title, translation[0]);
    add(stageId, step.explanation, translation[1]);
  });
  guide.examples.forEach((example, index) => {
    const translation = translatedGuide.examples[index];
    if (!translation || translation[1].length !== example.parts.length)
      throw new Error(`Mismatched Japanese grammar example: ${stageId}/${index}`);
    add(stageId, example.french, translation[0]);
    example.parts.forEach((part, partIndex) => {
      add(stageId, part.french, translation[1][partIndex][0]);
      add(stageId, part.role, translation[1][partIndex][1]);
    });
  });
  guide.commonMistakes.forEach((mistake, index) => {
    const translation = translatedGuide.mistakes[index];
    if (!translation) throw new Error(`Missing Japanese grammar mistake: ${stageId}/${index}`);
    add(stageId, mistake.mistake, translation[0]);
    add(stageId, mistake.correction, translation[1]);
  });
  add(stageId, guide.memoryTip, translatedGuide.memoryTip);
  if (concept) {
    for (const [source, japanese] of Object.entries(CONCEPT_COPY[stageId])) {
      add(stageId, source, japanese);
    }
  }
  // Each stage owns its canonical concept IDs (stages 7 and 15 have two).
  // Keep all source drills; translations affect display text only.
  const drills = stage.conceptIds.flatMap((id) => GRAMMAR_PRACTICE_DRILLS[id] ?? []);
  const localizedDrills = JAPANESE_GRAMMAR_DRILLS[stageId];
  for (const [drillId, entry] of Object.entries(localizedDrills)) {
    const drill = drills.find((candidate) => candidate.id === drillId);
    if (!drill) throw new Error(`Unknown Japanese grammar drill: ${stageId}/${drillId}`);
    const translated = entry as Partial<Record<"stimulus" | "prompt" | "context" | "explanation", string>> & {
      choices?: Readonly<Record<string, string>>;
    };
    add(stageId, drill.stimulus, translated.stimulus);
    add(stageId, drill.explanation, translated.explanation);
    if (drill.context) add(stageId, drill.context, translated.context);
    // Some stage-one drills put their French instruction in prompt, with no context.
    if (translated.prompt) add(stageId, drill.prompt, translated.prompt);
    else if (!drill.context && translated.context) add(stageId, drill.prompt, translated.context);
    // French answer choices are display strings only. Keep the untouched source
    // values for selection and scoring, and translate via the same AppText lookup.
    if (translated.choices) {
      if (drill.kind === "order") throw new Error(`Unexpected localizable choices: ${stageId}/${drillId}`);
      const choices = [drill.answer, ...drill.distractors];
      for (const [source, japanese] of Object.entries(translated.choices)) {
        if (!choices.includes(source)) throw new Error(`Unknown option translation: ${stageId}/${drillId}/${source}`);
        add(stageId, source, japanese);
      }
    }
  }
}

export function grammarCopyId(module: string, sourceText: string): string {
  return `${module}__${encodeURIComponent(sourceText).replace(/\./gu, "%2E")}`;
}

function buildGrammarContent(locale: "fr" | "ja"): LocalizedModule {
  const content: Record<string, Record<string, string>> = {};
  for (const [module, entries] of Object.entries(GRAMMAR_COPY_BY_MODULE)) {
    for (const [sourceText, japanese] of Object.entries(entries)) {
      content[grammarCopyId(module, sourceText)] = {
        text: locale === "fr" ? sourceText : japanese,
      };
    }
  }
  return content;
}
export const frenchGrammarContent = buildGrammarContent("fr");
export const japaneseGrammarContent = buildGrammarContent("ja");
