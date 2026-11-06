# Japanese localization — Phase 7: Comptage

## Audited scope
Eight routes (base, sino, heures, prix, phone, dates, age, ordinals) with 24 interactive dialogue scenes and the counting hub. Display-only Japanese covers scene names, dialogue translations, speaker labels, expression meanings, learning notes, navigation, status badges and accessibility labels.

## Context-sensitive translation decisions
- Distinguish Korean native numerals (固有数詞) and Sino-Korean numerals (漢数詞), including mixed hours and minutes.
- Explain classifier contractions 하나→한, 둘→두, 셋→세 and 넷→네, and the difference between 잔 (cups), 개 (general objects), 조각 (slices), 장 (flat items) and 켤레 (pairs).
- Teach 만 as the ten-thousand unit 万, rather than calling it a monetary unit. Avoid the outdated fixed won/euro conversion in the original French note.
- Explain year-month-day ordering, irregular month readings 유월 and 시월, the difference between age marked by 살 and formal 세, and Korean full-age rules.
- Distinguish 일등 (first place), 이등 (second place), and 첫 번째 / 두 번째 (first / second occurrence).
- Translate KakaoTalk 이모티콘 appropriately as stickers and 읽씹 as 既読スルー; adjust honorifics to the actual speaker context.

## Source discrepancies discovered — not silently corrected
1. **dates.tsx, birthday scene:** The Korean dialogue says 이천육년 (2006), whereas its French subtitle says 2026 and references Friday, April 24, which corresponds to 2026. Japanese faithfully renders 2006. A separate curriculum-and-MP3 correction should reconcile the Korean line, recorded audio, and date.
2. **ordinals.tsx, ranking scene:** The Korean speaker says 일등 참가자 (first-place participant), whereas the French subtitle says second participant. The Japanese dialogue follows the Korean line; the Korean scenario could be edited separately if required.
3. Some original French pedagogical notes overstate age-number rules, conflate money and number units, or rely on unstable price examples. The Japanese explanations replace those with more precise and durable guidance.

## Scope boundary
Route-scoped CountingLocalizationProvider supplies Japanese display text via the same AppText resolver as the prior vocabulary phase. Korean language-learning examples, romanization, audio files, playback behavior, scene IDs, access gating, routes and progress storage remain untouched. French remains unchanged. Other deferred localization modules and the whole-app Japanese release gate remain pending.

## Checks
- npm run validate:i18n
- npm run test:i18n
- npm run test:vocabulary
- npm run test:counting-localization
- npm run test:counting-audio
- npx tsc --noEmit

Manual visual verification is still recommended on small and large Android screens before a full Japanese release.
