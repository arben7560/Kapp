export function canValidateListenAnswer({
  hasAnswer,
  hasCompletedRequiredMedia,
  isHydrated,
  isLocked,
}: {
  hasAnswer: boolean;
  hasCompletedRequiredMedia: boolean;
  isHydrated: boolean;
  isLocked: boolean;
}) {
  return hasAnswer && hasCompletedRequiredMedia && isHydrated && !isLocked;
}
