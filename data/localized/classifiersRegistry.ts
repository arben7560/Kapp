import type { LocalizedModule } from "./types.ts";
import { classifierPeopleAnimalsCopy } from "./classifiersPeopleAnimals.ts";
import { classifierObjectsDrinksCopy } from "./classifiersObjectsDrinks.ts";
import { classifierPaperMachinesCopy } from "./classifiersPaperMachines.ts";

/** Display-only Classifiers content. The Korean learning material is canonical. */
export const CLASSIFIER_COPY_BY_MODULE = {
  shared: {
  "RETOUR": "戻る",
  "Retour": "戻る",
  "Retour à l’écran précédent": "前の画面に戻る",
  "Revient à l’écran précédent": "前の画面に戻ります",
  "Toucher pour continuer": "タップして続きを表示",
  "Toucher pour recommencer l’étape": "タップして最初からやり直す",
  "Réponse en cours...": "返答中…",
  "ÉCOUTER": "音声を聞く",
  "Retour à l'écran précédent": "前の画面に戻る",
  "ÉTICKETTES SOCIALES": "人の数え方と敬語",
  "HUMAN COUNT": "人の数え方",
  "HUMAN TOOLBOX": "人に関する重要表現",
  "VIE SAUVAGE": "動物の世界",
  "LIVING BEINGS": "動物の数え方",
  "ANIMAL TOOLBOX": "動物に関する重要表現",
  "CLASSIFICATEURS": "助数詞",
  "GENERAL": "いろいろな物",
  "\"GAE\" TOOLBOX": "「개」の重要表現",
  "CONVIVIALITÉ": "飲み物の注文",
  "DRINKS": "飲み物の数え方",
  "BEVERAGE TOOLBOX": "飲み物に関する重要表現",
  "SAVOIR-FAIRE": "本と紙の数え方",
  "BOUND & FLAT": "冊と枚",
  "LITERARY TOOLBOX": "本・紙の重要表現",
  "SÉOUL MODERNE": "ソウルの街と機器",
  "TECH COUNTER": "機器と車両の数え方",
  "TECH TOOLBOX": "機械・乗り物の重要表現"
},
  hub: {
  "Objets divers": "いろいろな物",
  "Le classificateur universel (개)": "幅広く使える助数詞「개」",
  "Personnes": "人",
  "Compter les humains (명 / 분)": "人の数え方「명／분」",
  "Animaux": "動物",
  "Êtres vivants (마리)": "動物の数え方「마리」",
  "Livres & Papier": "本と紙",
  "Supports écrits (권 / 장)": "冊と枚の使い分け「권／장」",
  "Bouteilles & Verres": "瓶とグラス",
  "Boissons et contenants (병 / 잔)": "瓶と杯「병／잔」",
  "Machines & Véhicules": "機械と乗り物",
  "Technologie et transport (대)": "機器・車両の台数「대」",
  "Classificateurs": "助数詞",
  "\"L’art de compter avec précision.\"": "物に合わせた数え方を学びましょう。",
  "GRAMMAIRE VISUELLE": "目で学ぶ文法",
  "IMMERSION NIVEAU 1": "レベル1・実践",
  "UNITÉS DE MESURE CORÉENNES": "韓国語の助数詞",
  "UNITÉ DE MESURE": "助数詞",
  "UNITÉ DE MESURE · PREMIUM": "助数詞 · プレミアム",
  "ce classificateur coréen": "この韓国語の助数詞",
  "Ouvre ce classificateur coréen": "この助数詞の学習を開きます",
  "Paramètres": "設定",
  "Découvrir Premium": "プレミアムを見る",
  "Accès Premium verrouillé": "プレミアムはロック中",
  "Accès Premium inclus": "プレミアム利用可能",
  "Accès gratuit": "無料で利用可能",
  "Sélectionné": "選択中",
  "PREMIUM": "プレミアム",
  "PREMIUM 🔒": "プレミアム 🔒",
  "Ouvrir": "開く",
  "RETOUR": "戻る"
},
  ...classifierPeopleAnimalsCopy,
  ...classifierObjectsDrinksCopy,
  ...classifierPaperMachinesCopy,
} as const;

export function classifierCopyId(module: string, sourceText: string): string {
  return `${module}__${encodeURIComponent(sourceText).replace(/\./gu, "%2E")}`;
}
function buildClassifierContent(locale: "fr" | "ja"): LocalizedModule {
  const content: Record<string, Record<string, string>> = {};
  for (const [module, translations] of Object.entries(CLASSIFIER_COPY_BY_MODULE)) {
    for (const [french, japanese] of Object.entries(translations)) {
      content[classifierCopyId(module, french)] = {
        text: locale === "fr" ? french : japanese,
      };
    }
  }
  return content;
}
export const frenchClassifierContent = buildClassifierContent("fr");
export const japaneseClassifierContent = buildClassifierContent("ja");
