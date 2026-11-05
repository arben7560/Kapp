import type { AppLocale } from './config.ts';

/** Only the logo entry offers language selection; callbacks/deep links keep their route. */
export function shouldOfferLanguageSelection({
  preference,
  onboardingCompleted,
}: {
  preference: AppLocale | null;
  onboardingCompleted: boolean;
}): boolean {
  return preference === null && !onboardingCompleted;
}
