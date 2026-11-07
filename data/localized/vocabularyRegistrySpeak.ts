import type { LocalizedModule } from "./types.ts";
import { vocabularyCopyId } from "./vocabularyRegistry.ts";

/** Display-only Speak catalogue. Routes, Korean labels and lesson state remain canonical. */
export const SPEAK_COPY = {
  "Café": "カフェ",
  "Hongdae • 14:00": "弘大・14:00",
  "Métro": "地下鉄",
  "Ligne 2 • Gangnam": "2号線・江南",
  "Restaurant": "レストラン",
  "Itaewon • Dîner": "梨泰院・夕食",
  "Aéroport": "空港",
  "Incheon • Arrivée": "仁川・到着",
  "Magasin": "ショップ",
  "Jamsil • Boutique": "蚕室・ショップ",
  "SCÈNES DISPONIBLES": "練習できるシーン",
  "4 situations immersives": "4つの没入型シーン",
  "IMMERSION · CONVERSATION": "イマージョン・会話",
  "Scène guidée": "ガイド付き会話",
  "Choisis un lieu, vis la situation, parle coréen.": "場面を選び、現地にいる気分で韓国語を話そう。",
  "PRATIQUE ORALE": "スピーキング練習",
  "scènes": "シーン",
  "SCÈNE": "シーン",
  "IMMERSION": "イマージョン",
  "EXPLORER LA SCÈNE": "シーンを見てみる",
  "Glisse horizontalement pour changer de scène.": "左右にスワイプしてシーンを切り替えます。",
  "SCÈNE IMMERSIVE": "没入型シーン",
  "Guidé": "ガイド付き",
  "Interactif": "インタラクティブ",
  "Choisis ton approche": "学習方法を選ぶ",
  "Entre dans la situation ou révise d’abord les expressions utiles.": "シーンを体験するか、先に役立つ表現を復習しましょう。",
  "Choisis la scène": "シーンを体験する",
  "Entre dans la situation, écoute et réponds comme sur place.": "実際の場面にいるつもりで、聞いて答えましょう。",
  "Expressions utiles": "役立つ表現",
  "Revois les mots et expressions utilisés couramment.": "日常でよく使う単語や表現を復習しましょう。",
  "Fermer": "閉じる",
  "Ouvrir les options de la scène.": "シーンのオプションを開きます。",
  "Sélection des scènes": "シーンの選択",
  "Retour depuis la sélection de scène": "シーン選択画面から戻る"
} as const;

function buildSpeakContent(locale: "fr" | "ja"): LocalizedModule {
  return Object.fromEntries(
    Object.entries(SPEAK_COPY).map(([sourceText, japaneseText]) => [
      vocabularyCopyId("speak", sourceText),
      { text: locale === "fr" ? sourceText : japaneseText },
    ]),
  );
}

export const frenchSpeakContent = buildSpeakContent("fr");
export const japaneseSpeakContent = buildSpeakContent("ja");
