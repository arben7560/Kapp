import type { LocalizedModule } from "./types.ts";
import { countingCoreCopy } from "./countingRegistryCore.ts";
import { countingEverydayCopy } from "./countingRegistryEveryday.ts";
import { countingContactsCopy } from "./countingRegistryContacts.ts";
import { countingLifeCopy } from "./countingRegistryLife.ts";

/** Display-only catalogue, keyed by counting route + exact source string.
 * Korean speech, audio, IDs, navigation, progress and canonical lesson data are not altered.
 */
export const COUNTING_COPY_BY_MODULE = {
  shared: {
  "Expressions clés": "重要表現",
  "ÉCOUTER": "音声を聞く",
  "Toucher pour continuer": "タップして続きを表示",
  "Toucher pour recommencer l’étape": "タップしてこの場面を最初から再生",
  "Réponse en cours...": "返答中…",
  "RETOUR": "戻る",
  "Retour": "戻る",
  "Retour à l’écran précédent": "前の画面に戻る",
  "Revient à l’écran précédent": "前の画面に戻ります",
  "Dialogue": "会話",
  "SYSTÈME NATIF": "固有数詞",
  "CORÉEN NATIF": "固有数詞",
  "SYSTÈME SINO-CORÉEN": "漢数詞",
  "OFFICIEL": "漢数詞",
  "SYSTÈME MIXTE": "数詞の使い分け",
  "HEURE RÉELLE": "時刻",
  "MAGASIN À SÉOUL": "ソウルで買い物",
  "SÉOUL CONNECTÉ": "ソウルの連絡手段",
  "5G ACTIVE": "5G通信",
  "DATES À SÉOUL": "韓国の日付",
  "AVRIL 2026": "2026年4月",
  "CYCLE DE VIE": "年齢と人生",
  "USAGES SOCIAUX": "社会的な習慣",
  "HIÉRARCHIE ET RANG": "順序と順位",
  "CLASSEMENT": "順位"
},
  hub: {
  "Nombres de base": "固有数詞の基本",
  "Système coréen natif": "韓国語の固有数詞",
  "Nombres sino-coréens": "漢数詞の基本",
  "Système sino-coréen": "韓国語の漢数詞",
  "Heures et minutes": "時間と分",
  "Le défi du système mixte": "固有数詞と漢数詞の使い分け",
  "Magasin et prix": "買い物と値段",
  "Gérer l'argent au quotidien": "日常の金額を読み取る",
  "Téléphone et contacts": "電話番号と連絡先",
  "Numéros, étages et bus": "電話番号・階数・バス番号",
  "Dates et calendrier": "日付とカレンダー",
  "Jours, mois et années": "日・月・年",
  "Âge et vie": "年齢と暮らし",
  "Le système coréen unique": "韓国ならではの年齢表現",
  "Ordinaux": "順序と順位",
  "Premier, deuxième, troisième...": "1番目、2番目、3番目…",
  "PARCOURS · COMPTAGE": "数字の学習コース",
  "Comptage": "数字",
  "Comptage ·": "数字 ·",
  "Comprends le rythme numérique de la ville.": "街で使う韓国語の数字を身につけましょう。",
  "NIVEAU 1": "レベル1",
  "2 inclus": "利用可能：2コース",
  "6 Premium": "プレミアム：6コース",
  "PARCOURS INCLUS": "利用できるコース",
  "2 parcours essentiels": "基本の2コース",
  "PARCOURS PREMIUM": "プレミアムコース",
  "6 parcours Premium · accès actif": "プレミアム6コース · 利用可能",
  "6 parcours Premium à débloquer": "プレミアム6コース · ロック中",
  "À continuer": "続きから",
  "Pour commencer": "はじめよう",
  "À CONTINUER": "続きから",
  "POUR COMMENCER": "はじめよう",
  "PREMIUM": "プレミアム",
  "Premium": "プレミアム",
  "ACCÈS ACTIF": "利用可能",
  "À DÉBLOQUER": "ロック中",
  "DÉBLOQUER PREMIUM": "プレミアムを解放",
  "OUVRIR LE PARCOURS": "コースを開く",
  "EN COURS": "学習中",
  "INCLUS": "利用可能",
  "Inclus": "利用可能",
  "Ouvre l'accès Premium": "プレミアムプランを開く",
  "Ouvre ce parcours": "このコースを開く",
  "PARCOURS 01": "コース 01",
  "PARCOURS 02": "コース 02",
  "PARCOURS 03": "コース 03",
  "PARCOURS 04": "コース 04",
  "PARCOURS 05": "コース 05",
  "PARCOURS 06": "コース 06",
  "PARCOURS 07": "コース 07",
  "PARCOURS 08": "コース 08"
},
  ...countingCoreCopy,
  ...countingEverydayCopy,
  ...countingContactsCopy,
  ...countingLifeCopy,
} as const;

export function countingCopyId(module: string, sourceText: string): string {
  return `${module}__${encodeURIComponent(sourceText).replace(/\./gu, "%2E")}`;
}

function buildCountingContent(locale: "fr" | "ja"): LocalizedModule {
  const content: Record<string, Record<string, string>> = {};
  for (const [module, entries] of Object.entries(COUNTING_COPY_BY_MODULE)) {
    for (const [sourceText, japaneseText] of Object.entries(entries)) {
      content[countingCopyId(module, sourceText)] = {
        text: locale === "fr" ? sourceText : japaneseText,
      };
    }
  }
  return content;
}

export const frenchCountingContent = buildCountingContent("fr");
export const japaneseCountingContent = buildCountingContent("ja");
