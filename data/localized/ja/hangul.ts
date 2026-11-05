import { HANGUL_MODULES } from "../../hangul/curriculum.ts";
import { HANGUL_ASSESSMENT_QUESTIONS } from "../../hangul/assessment.ts";
import type { HangulQuestion } from "../../hangul/types.ts";
import {
  hangulCopyId, needsHangulOptionTranslation,
} from "../hangulRegistry.ts";
import type { LocalizedModule } from "../types.ts";
import { vowelsBasicJa } from "./hangulCopy/vowelsBasic";
import { consonantsBasicJa } from "./hangulCopy/consonantsBasic";
import { consonantsTenseJa } from "./hangulCopy/consonantsTense";
import { compoundVowelsJa } from "./hangulCopy/compoundVowels";
import { batchimJa } from "./hangulCopy/batchim";
import { assessmentQuestionsJa } from "./hangulCopy/assessment";
import type { JapaneseHangulModule } from "./hangulCopy/types";

const japaneseModules: Record<string, JapaneseHangulModule> = {
  hangul_vowels_basic: vowelsBasicJa,
  hangul_consonants_basic: consonantsBasicJa,
  hangul_consonants_tense: consonantsTenseJa,
  hangul_vowels_compound: compoundVowelsJa,
  hangul_batchim: batchimJa,
};

const translatedChoiceLabels: Record<string, string> = {
  "À gauche": "左側",
  "Au-dessus": "上側",
  "En dessous": "下側",
  "Aucun": "音は出ない",
  "Sous ㄴ": "ㄴ の下",
  "À droite de ㄴ": "ㄴ の右",
  "Au-dessus de ㄴ": "ㄴ の上",
  "Ils sont souvent prononcés pareil": "同じように発音されることが多い",
  "Ils doivent toujours être distingués à l’oreille": "必ず耳だけで聞き分けなければならない",
  "ㅐ est muet": "ㅐ は発音しない",
  "Reconnaître l’orthographe": "つづりの違いを見分ける",
  "Deviner uniquement à l’oreille": "音だけで推測する",
  "Les ignorer": "区別せずに覚えない",
  "Sa prononciation varie selon la position": "位置によって発音が変わる",
  "Il se prononce toujours eu-i": "いつも eu-i と発音する",
  "Il est muet": "発音しない",
  "Les écrire au hasard": "適当に書く",
  "Le son final se rattache à la voyelle": "終声の音が次の母音につながる",
  "Le mot devient muet": "単語全体が無音になる",
  "La voyelle disparaît": "母音が消える",
};

function translateOptionLabel(label: string): string {
  const number = /^Son (\d+)$/u.exec(label);
  if (number) return `音声 ${number[1]}`;
  const translation = translatedChoiceLabels[label];
  if (!translation) throw new Error(`Missing Japanese Hangul choice label: ${label}`);
  return translation;
}

function generatedRecognitionQuestion(
  question: HangulQuestion,
  cardCopy: readonly [string, string],
  consonant: boolean,
): readonly [string, string] {
  const isVisual = question.id.endsWith("-visual");
  const prompt = isVisual
    ? consonant
      ? "子音は ㅏ と組み合わせて再生されます。音声を順に聞き、合う子音を選ぼう。"
      : "音声を順に聞いて、この文字の音を選ぼう。"
    : consonant
      ? "子音は ㅏ と組み合わせて再生されます。聞こえた子音を選ぼう。"
      : "音声を聞いて、合う文字を選ぼう。";
  const explanation = isVisual
    ? `${question.answer}：${cardCopy[1]}`
    : `聞こえたのは ${question.answer}。${cardCopy[1]}`;
  return [prompt, explanation];
}

function buildJapaneseHangulCopy(): LocalizedModule {
  const localized: Record<string, Record<string, string>> = {};

  for (const module of HANGUL_MODULES) {
    const translatedModule = japaneseModules[module.id];
    if (!translatedModule) throw new Error(`Missing Japanese Hangul module ${module.id}`);
    localized[hangulCopyId("module", module.id)] = {
      title: translatedModule.title, subtitle: translatedModule.subtitle,
      eyebrow: translatedModule.eyebrow, nextLabel: translatedModule.nextLabel,
    };

    for (const scene of module.scenes) {
      const translatedScene = translatedModule.scenes[scene.id];
      if (!translatedScene) throw new Error(`Missing Japanese Hangul scene ${module.id}/${scene.id}`);
      localized[hangulCopyId("scene", module.id, scene.id)] = {
        title: translatedScene.title,
        description: translatedScene.description,
        instruction: translatedScene.instruction,
      };

      for (const card of scene.cards) {
        const text = translatedScene.cards[card.id];
        if (!text) throw new Error(`Missing Japanese Hangul card ${module.id}/${scene.id}/${card.id}`);
        localized[hangulCopyId("card", module.id, scene.id, card.id)] = {
          label: text[0], explanation: text[1],
        };
      }
      for (const question of scene.questions) {
        const copy = question.id.endsWith("-visual") || question.id.endsWith("-audio")
          ? (() => {
              const card = scene.cards.find(card => card.glyph === question.answer);
              if (!card) throw new Error(`Missing recognition card for ${question.id}`);
              return generatedRecognitionQuestion(
                question, translatedScene.cards[card.id], card.kind === "consonant",
              );
            })()
          : translatedScene.questions?.[question.id];
        if (!copy) throw new Error(`Missing Japanese Hangul question ${module.id}/${scene.id}/${question.id}`);
        const fields: Record<string, string> = { prompt: copy[0], explanation: copy[1] };
        question.options.forEach((option, index) => {
          if (needsHangulOptionTranslation(option.label)) fields[`option${index}`] = translateOptionLabel(option.label);
        });
        localized[hangulCopyId("question", module.id, scene.id, question.id)] = fields;
      }
    }
  }

  for (const question of HANGUL_ASSESSMENT_QUESTIONS) {
    const copy = assessmentQuestionsJa[question.id];
    if (!copy) throw new Error(`Missing Japanese assessment question ${question.id}`);
    const fields: Record<string, string> = { prompt: copy[0], explanation: copy[1] };
    question.options.forEach((option, index) => {
      if (needsHangulOptionTranslation(option.label)) fields[`option${index}`] = translateOptionLabel(option.label);
    });
    localized[hangulCopyId("question", "assessment", question.id)] = fields;
  }

  return localized;
}

export const japaneseHangulContent = buildJapaneseHangulCopy();
