import type { GrammarStage } from "../../data/grammar/types.ts";

type GrammarAccessTarget = Pick<GrammarStage, "access">;

export function canAccessGrammarStage(
  stage: GrammarAccessTarget,
  isPremium: boolean,
): boolean {
  return stage.access === "free" || isPremium;
}

export function canRepeatGrammarPractice(
  stage: GrammarAccessTarget,
  isPremium: boolean,
): boolean {
  return canAccessGrammarStage(stage, isPremium);
}
