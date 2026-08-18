import type { Progress } from "../_store";

export const ACCOUNT_PROTECTION_PROMPT_COOLDOWN_MS =
  7 * 24 * 60 * 60 * 1_000;
export const ACCOUNT_PROTECTION_LOGOUT_GUARD_MS = 24 * 60 * 60 * 1_000;

export type AccountProtectionPromptState = {
  dismissedAt: string | null;
  dismissedProgressCount: number;
  suppressedUntil: string | null;
};

type MeaningfulProgress = Pick<
  Progress,
  "completed" | "hangulProgress" | "grammarProgress"
>;

export function getMeaningfulProgressCount(progress: MeaningfulProgress) {
  const completedItems = Object.values(progress.completed).filter(Boolean).length;

  const completedHangulScenes = Object.values(
    progress.hangulProgress.lessons,
  ).reduce(
    (total, lesson) =>
      total + Object.values(lesson.completedScenes).filter(Boolean).length,
    0,
  );

  const completedGrammarSessions = Object.values(
    progress.grammarProgress.stages,
  ).reduce(
    (total, stage) => total + (stage?.completedSessionIds.length ?? 0),
    0,
  );

  return completedItems + completedHangulScenes + completedGrammarSessions;
}

export function hasMeaningfulProgress(progress: MeaningfulProgress) {
  return getMeaningfulProgressCount(progress) > 0;
}

export function shouldShowAccountProtectionPrompt({
  isAnonymous,
  meaningfulProgressCount,
  promptState,
  now = Date.now(),
}: {
  isAnonymous: boolean;
  meaningfulProgressCount: number;
  promptState: AccountProtectionPromptState;
  now?: number;
}) {
  if (!isAnonymous || meaningfulProgressCount <= 0) return false;

  const suppressedUntil = promptState.suppressedUntil
    ? Date.parse(promptState.suppressedUntil)
    : Number.NaN;

  if (Number.isFinite(suppressedUntil) && now < suppressedUntil) return false;

  if (!promptState.dismissedAt) return true;

  const dismissedAt = Date.parse(promptState.dismissedAt);
  if (!Number.isFinite(dismissedAt)) return true;

  return (
    now - dismissedAt >= ACCOUNT_PROTECTION_PROMPT_COOLDOWN_MS &&
    meaningfulProgressCount > promptState.dismissedProgressCount
  );
}

export function createAccountProtectionPromptSessionGuard() {
  let hasVisitedHub = false;
  let hasShownPrompt = false;

  return {
    beginHubVisit() {
      if (!hasVisitedHub) {
        hasVisitedHub = true;
        return false;
      }

      return !hasShownPrompt;
    },
    markPromptShown() {
      hasShownPrompt = true;
    },
  };
}
