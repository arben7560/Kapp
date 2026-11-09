import type { LocalizedModule } from "./types.ts";
import { GRAMMAR_STAGE_BY_ID } from "../grammar/stages.ts";
import { GRAMMAR_LESSON_GUIDES } from "../grammar/lessonGuides.ts";
import { GRAMMAR_CONCEPTS } from "../grammar/concepts.ts";
import { GRAMMAR_PRACTICE_DRILLS } from "../grammar/practiceDrills.ts";
import { JAPANESE_GRAMMAR_GUIDES } from "./grammarGuidesJapanese.ts";
import { JAPANESE_GRAMMAR_DRILLS } from "./grammarDrillsJapanese.ts";

/**
 * Phase 9, block 1: grammar stages 1–5 only. A source-string display
 * catalogue, following Vocabulary/Counting/Classifiers. No questions,
 * Korean, answers, scores, navigation IDs or stored progress are translated.
 */
const STAGE_CONCEPTS = {
  "sentence-structure": "sentence-order",
  "identify-with-copula": "copula-ieyo-yeyo",
  "polite-register": "polite-style-yo",
  "introduce-topic": "topic-eun-neun",
  "demonstratives": "demonstratives-i-geu-jeo",
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
  "REGISTRE": "丁寧さ",
  "Poli courant": "日常の丁寧体",
  "Formel": "格式ばった丁寧体",
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
  "Revoir l’explication sans quitter les exercices": "練習を続けたまま解説を見直す",
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
    "La terminaison 요 marque le style poli courant. Utilise-la avec un adulte ou une personne que tu connais peu.": "文末の 요 は日常の丁寧体の目印。初対面の人やあまり親しくない相手に使います。",
    "Un serveur te propose une table calme et tu acceptes poliment.": "店員さんの席の提案を丁寧に受け入れます。",
    "Ça me va.": "それでお願いします。",
    "Ça va.": "大丈夫です。",
    "Ce plat est délicieux.": "この料理はおいしいです。",
    "Je suis étudiant.": "学生です。",
    "CONTEXTE\nUn proche s’inquiète pour toi.": "場面\n親しい人が心配してくれています。",
    "Reconnaître des nuances polies fréquentes.": "よく使う丁寧な言い回しの違いを聞き分ける。",
    "Reconnaître un registre familier sans le produire.": "くだけた話し方を聞いて理解する。",
    "반말 et contractions de dialogue": "반말 と会話での省略形",
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
  const drills = GRAMMAR_PRACTICE_DRILLS[STAGE_CONCEPTS[stageId]] ?? [];
  const localizedDrills = JAPANESE_GRAMMAR_DRILLS[stageId];
  for (const [drillId, entry] of Object.entries(localizedDrills)) {
    const drill = drills.find((candidate) => candidate.id === drillId);
    if (!drill) throw new Error(`Unknown Japanese grammar drill: ${stageId}/${drillId}`);
    const translated = entry as Partial<Record<"stimulus" | "prompt" | "context" | "explanation", string>>;
    add(stageId, drill.stimulus, translated.stimulus);
    add(stageId, drill.explanation, translated.explanation);
    if (drill.context) add(stageId, drill.context, translated.context);
    // Some stage-one drills put their French instruction in prompt, with no context.
    if (translated.prompt) add(stageId, drill.prompt, translated.prompt);
    else if (!drill.context && translated.context) add(stageId, drill.prompt, translated.context);
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
