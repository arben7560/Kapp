import { HANGUL_MODULES } from "../hangul/curriculum.ts";
import { HANGUL_ASSESSMENT_QUESTIONS } from "../hangul/assessment.ts";
import { applyHangulEditorialOverrides } from "../hangul/editorialOverrides.ts";
import type { HangulModule, HangulQuestion } from "../hangul/types.ts";
import type { LocalizedModule } from "./types.ts";

// Stable identifiers, never dependent on the order of shuffled questions or choices.
export function hangulCopyId(kind: "module" | "scene" | "card" | "question", ...ids: string[]): string {
  return [kind, ...ids].join("__");
}

// Only labels that carry spoken/written French need a translated display value.
// Korean choices, numeric results and phonetic distractors remain canonical.
export function needsHangulOptionTranslation(label: string): boolean {
  return /[A-Za-zÀ-ÖØ-öø-ÿ]/u.test(label) && !/^(?:ng|g)$/iu.test(label);
}

export function buildHangulFrenchCopy(): LocalizedModule {
  // Real app screens already apply these idempotent editorial corrections. The
  // catalogue must use the very same text as the UI, not stale source defaults.
  applyHangulEditorialOverrides();
  const items: Record<string, Record<string, string>> = {};
  for (const module of HANGUL_MODULES) {
    items[hangulCopyId("module", module.id)] = {
      title: module.title, subtitle: module.subtitle, eyebrow: module.eyebrow, nextLabel: module.nextLabel,
    };
    for (const scene of module.scenes) {
      items[hangulCopyId("scene", module.id, scene.id)] = {
        title: scene.title, description: scene.description, instruction: scene.instruction,
      };
      for (const card of scene.cards) {
        items[hangulCopyId("card", module.id, scene.id, card.id)] = {
          label: card.label, explanation: card.explanation,
        };
      }
      for (const question of scene.questions) {
        items[hangulCopyId("question", module.id, scene.id, question.id)] = questionDisplayFields(question);
      }
    }
  }
  for (const question of HANGUL_ASSESSMENT_QUESTIONS) {
    items[hangulCopyId("question", "assessment", question.id)] = questionDisplayFields(question);
  }
  return items;
}

function questionDisplayFields(question: HangulQuestion): Record<string, string> {
  const result: Record<string, string> = { prompt: question.prompt, explanation: question.explanation };
  question.options.forEach((option, index) => {
    if (needsHangulOptionTranslation(option.label)) result[`option${index}`] = option.label;
  });
  return result;
}

// Never mutate question.options: only resolve the display value by the original
// option VALUE (shuffled option indexes are not stable).
export function originalHangulOptionIndex(question: HangulQuestion, value: string): number {
  return question.options.findIndex(option => option.value === value);
}

export function findHangulQuestion(
  module: HangulModule,
  sceneId: string,
  questionId: string,
): HangulQuestion | undefined {
  return module.scenes.find(scene => scene.id === sceneId)?.questions.find(q => q.id === questionId);
}
