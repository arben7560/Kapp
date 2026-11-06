# Japanese localization — Phase 6: Vocabulary

## Scope

Phase 6 adds Japanese display copy to the existing vocabulary area. It covers the hub and the 15 existing vocabulary routes:

- basics, gastronomie, transport
- kdrama, nuit, romance
- sante, work
- emotion, famille, health, lieux, meteo, objets, voyage

The work localizes the visible interface and teaching copy: collection names, scene titles and descriptions, vocabulary meanings, contextual explanations, dialogue lines, quiz prompts, quiz explanations, action labels, and accessibility labels.

## Localization boundary

Japanese is applied through a route-scoped `VocabularyLocalizationProvider` and the existing `AppText` / `AppMixedText` components. Copy keys are derived from the vocabulary route and canonical French display string. This keeps the existing Korean lesson arrays, IDs, answer keys, audio sources, speech triggers, shuffle logic, completion state, and progress persistence unchanged.

Uncatalogued values intentionally fall back to their source text. This protects Korean words, romanization, character names, and engine values from accidental translation. French remains unchanged.

## Japanese typography

`AppText` now detects Japanese runs in mixed content and uses the loaded Noto Sans JP face. Hangul runs continue to use Noto Sans KR. The parent text component remains responsible for size, line height, spacing, and layout, so mixed-script content does not change the existing typographic contract.

## Pedagogical adaptation

Explanations are written for a French-speaking learner who reads Japanese. They make useful comparisons without treating the languages as interchangeable, including:

- Korean polite endings and the Japanese です・ます register;
- the topic marker 은/는 and Japanese は;
- Korean kinship terms whose choice depends on the speaker's gender;
- the Korean concept 썸, which does not map exactly to a single Japanese expression;
- T-money compared with Suica / PASMO;
- Korean floor numbering and Japanese 1階;
- Korean business-mail formulas and Japanese business etiquette.

The explanations may repeat Korean examples for clarity. Canonical Korean exercise data remains outside the localization catalogue and is not modified.

## Validation

Run:

- `npm run validate:i18n`
- `npm run test:i18n`
- `npm run test:vocabulary`

The Japanese release gate remains closed. Counting, classifiers, grammar, listening, missions, speech feedback, immersion, and the remaining deferred namespaces still require their own implementation and audit.
