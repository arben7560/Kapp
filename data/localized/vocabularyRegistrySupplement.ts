import type { LocalizedModule } from "./types.ts";
import { vocabularyCopyId } from "./vocabularyRegistry.ts";

const COPY = {
  [vocabularyCopyId("work", "Le message")]: { fr: "Le message", ja: "メッセージ" },
  [vocabularyCopyId("kdrama", "Pluie • Silence • Aveu")]: {
    fr: "Pluie • Silence • Aveu",
    ja: "雨・静けさ・告白",
  },
  [vocabularyCopyId("kdrama", "Comprendre une confession douce et savoir répondre naturellement.")]: {
    fr: "Comprendre une confession douce et savoir répondre naturellement.",
    ja: "やさしい告白の意味を理解し、自然な返事ができるようにしましょう。",
  },
  [vocabularyCopyId("kdrama", "À utiliser quand tu veux exprimer un sentiment sans être trop direct.")]: {
    fr: "À utiliser quand tu veux exprimer un sentiment sans être trop direct.",
    ja: "気持ちを伝えたいけれど、あまり直接的な言い方を避けたいときに使います。",
  },
  [vocabularyCopyId("kdrama", "Bureau • Pression • Silence")]: {
    fr: "Bureau • Pression • Silence",
    ja: "職場・プレッシャー・沈黙",
  },
  [vocabularyCopyId("kdrama", "Reconnaître une phrase de tension et répondre avec respect.")]: {
    fr: "Reconnaître une phrase de tension et répondre avec respect.",
    ja: "緊張感のある表現を理解し、相手への敬意を保って返答しましょう。",
  },
  [vocabularyCopyId("kdrama", "Utile dans les situations sérieuses, au travail ou face à une critique.")]: {
    fr: "Utile dans les situations sérieuses, au travail ou face à une critique.",
    ja: "職場での重要なやり取りや、批判を受けた場面などで役立ちます。",
  },
  [vocabularyCopyId("kdrama", "Nuit • Amitié • Après-travail")]: {
    fr: "Nuit • Amitié • Après-travail",
    ja: "夜・友情・仕事終わり",
  },
  [vocabularyCopyId("kdrama", "Comprendre une scène chaleureuse entre amis après une journée difficile.")]: {
    fr: "Comprendre une scène chaleureuse entre amis après une journée difficile.",
    ja: "大変な一日のあと、友人同士で交わす温かいやり取りを理解しましょう。",
  },
  [vocabularyCopyId("kdrama", "Très naturel pour encourager quelqu’un ou célébrer un petit moment.")]: {
    fr: "Très naturel pour encourager quelqu’un ou célébrer un petit moment.",
    ja: "相手を励ましたり、ささやかな出来事を一緒に喜んだりするときに自然に使えます。",
  },
  [vocabularyCopyId("nuit", "On sert souvent le verre des autres avant le sien.")]: {
    fr: "On sert souvent le verre des autres avant le sien.",
    ja: "韓国では、自分のグラスより先に相手のグラスへお酒を注ぐことがよくあります。",
  },
  [vocabularyCopyId("nuit", "Le tambourin fait presque partie du rituel.")]: {
    fr: "Le tambourin fait presque partie du rituel.",
    ja: "韓国のカラオケでは、タンバリンも場を盛り上げる定番アイテムです。",
  },
  [vocabularyCopyId("nuit", "2차 signifie passer à un autre endroit après le premier lieu.")]: {
    fr: "2차 signifie passer à un autre endroit après le premier lieu.",
    ja: "「2차」は、最初の店のあとに別の店へ移動して二次会をすることです。",
  },

  [vocabularyCopyId("gastronomie", "L'art de griller la viande et de partager les accompagnements.")]: {
    fr: "L'art de griller la viande et de partager les accompagnements.",
    ja: "肉を焼き、さまざまなおかずを分け合って楽しむ食文化を体験する場面です。",
  },
  [vocabularyCopyId("transport", "Donner des instructions précises au chauffeur à la tombée de la nuit.")]: {
    fr: "Donner des instructions précises au chauffeur à la tombée de la nuit.",
    ja: "夜、タクシーの運転手に行き先や道順を具体的に伝える場面です。",
  },
  [vocabularyCopyId("transport", "Chauffeur")]: {
    fr: "Chauffeur",
    ja: "運転手",
  },
  [vocabularyCopyId("transport", "S'orienter et demander son chemin dans les ruelles de Bukchon.")]: {
    fr: "S'orienter et demander son chemin dans les ruelles de Bukchon.",
    ja: "北村の路地で道を尋ね、目的地への行き方を確認する場面です。",
  },
  [vocabularyCopyId("kdrama", "Exprime le fait d’être séduit ou attiré par quelqu’un ou quelque chose.")]: {
    fr: "Exprime le fait d’être séduit ou attiré par quelqu’un ou quelque chose.",
    ja: "人や物に心を引かれたり、魅力を感じたりしていることを表します。",
  },
  [vocabularyCopyId("kdrama", "Je suis désolé")]: {
    fr: "Je suis désolé",
    ja: "申し訳ありません",
  },
  [vocabularyCopyId("work", "Donner son avis, demander une explication et participer avec respect.")]: {
    fr: "Donner son avis, demander une explication et participer avec respect.",
    ja: "自分の意見を述べたり、説明を求めたりしながら、敬意を持って会議に参加する場面です。",
  },
  [vocabularyCopyId("work", "Demander, confirmer et répondre avec une formule professionnelle.")]: {
    fr: "Demander, confirmer et répondre avec une formule professionnelle.",
    ja: "依頼や確認を行い、ビジネスにふさわしい表現で返信する場面です。",
  },
  [vocabularyCopyId("work", "Se présenter, répondre avec confiance et laisser une bonne impression.")]: {
    fr: "Se présenter, répondre avec confiance et laisser une bonne impression.",
    ja: "自己紹介や質問への回答を通じて、自信を持って好印象を与える場面です。",
  },
  [vocabularyCopyId("hub", "PREMIUM")]: { fr: "PREMIUM", ja: "プレミアム" },
  [vocabularyCopyId("hub", "À DÉBLOQUER")]: { fr: "À DÉBLOQUER", ja: "ロックを解除" },
  [vocabularyCopyId("basics", "Premiers pas")]: { fr: "Premiers pas", ja: "はじめの一歩" },
  [vocabularyCopyId("gastronomie", "Gastronomie")]: { fr: "Gastronomie", ja: "食文化" },
  [vocabularyCopyId("kdrama", "Culture des K-dramas")]: { fr: "Culture des K-dramas", ja: "韓国ドラマ文化" },
  [vocabularyCopyId("nuit", "Vie nocturne")]: { fr: "Vie nocturne", ja: "夜の楽しみ方" },
  [vocabularyCopyId("romance", "Rencontres")]: { fr: "Rencontres", ja: "出会い・恋愛" },
  [vocabularyCopyId("sante", "Urgences et santé")]: { fr: "Urgences et santé", ja: "緊急時と健康" },
  [vocabularyCopyId("work", "Vie professionnelle")]: { fr: "Vie professionnelle", ja: "仕事・ビジネス" },
  [vocabularyCopyId("famille", "💡 Nuance culturelle")]: { fr: "💡 Nuance culturelle", ja: "💡 文化のポイント" },
} as const;

function build(locale: "fr" | "ja"): LocalizedModule {
  return Object.fromEntries(
    Object.entries(COPY).map(([id, values]) => [id, { text: values[locale] }]),
  );
}

export const frenchVocabularySupplementContent = build("fr");
export const japaneseVocabularySupplementContent = build("ja");
