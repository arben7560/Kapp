import type { AppLocale } from './config.ts';

/** Only the logo entry offers language selection; callbacks/deep links keep their route. */
export function shouldOfferLanguageSelection({
  preference,
}: {
  preference: AppLocale | null;
}): boolean {
  return preference === null;
}
