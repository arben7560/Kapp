import type { AppLocale } from '../../lib/i18n/config.ts';

export const CONTENT_MODULES = [
  'hangul', 'vocabulary', 'counting', 'classifiers', 'grammar',
  'listening', 'missions', 'speechFeedback', 'immersion',
] as const;
export type ContentModule = (typeof CONTENT_MODULES)[number];

// Each lesson file exports ONLY display fields indexed by existing entity IDs.
// Never copy canonical answers, graph objects, Korean, media or timing fields.
export type LocalizedModule = Readonly<Record<string, Readonly<Record<string, string>>>>;
export type LocalizedContent = Readonly<Record<
  AppLocale,
  Readonly<Record<ContentModule, LocalizedModule>>
>>;
