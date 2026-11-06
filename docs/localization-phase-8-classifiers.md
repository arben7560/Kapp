# Phase 8 — Audit and Japanese localization of Classificateurs

## Coverage
Six category routes (`people`, `animals`, `objects`, `drinks`, `paper`, `machines`), 18 classroom dialogue scenes, 108 expression cards, the hub and the shared scene UI. The Japanese localization covers scene titles and descriptions, speakers, 72 dialogue interpretations, all word meanings and contextual teaching hints, hub cards, badges, labels and accessible control descriptions.

## Korean-to-Japanese pedagogical choices
- 명 is the ordinary classifier for people (Japanese 人). 분 is an honorific counter; in customer-service Japanese, 名様 or お一人様 is often the natural counterpart. The Korean speaker can ask 몇 분이세요? and receive 세 명이에요 without inconsistency: the honorific depends on whom one counts.
- 마리 is an animal counter used for species that in Japanese require 匹, 頭 or 羽. The Japanese interpretations follow the species in each dialogue (cats, dogs, tigers, cows, chickens and pigs).
- 개 is a general-purpose counter (roughly 個 or つ); distinguish an object's quantity, which typically uses native Korean numbers in these examples, from a price in won, which uses Sino-Korean numbers.
- 병 counts bottles and 잔 counts servings in cups/glasses (Japanese 本／瓶 versus 杯); '한 잔 해요' can be an invitation to drink alcohol.
- 권 is similar to 冊 for books and magazines; 장 is similar to 枚 for tickets, paper, photos and flat items.
- 대 is similar to 台 for vehicles, electronics and appliances.
- Contractions of the native numerals before counters are explained explicitly: 하나→한, 둘→두, 셋→세 and 넷→네.

## Issues in the canonical French/Korean source (kept unchanged)
1. **people/service:** the opening reception line asks whether the reservation is for two (`두 분`); the following lines mention one friend coming later and then a total of three (`총 세 분`). The relationship between the original two guests and the additional friend is implicit; Japanese preserves the Korean numbers without inventing a missing guest.
2. **people/solo:** the French scene description says 'without using a counter', although the Korean answer explicitly uses `한 명이에요`. The Japanese scene description instead teaches the contrast between `혼자` and `한 명`; the Korean remains unchanged.
3. **paper/cinema:** the Korean ticket agent gives four cinema tickets (`네 장`), but French translates them as 'four sheets'. Japanese says 'チケット4枚', matching the scene.
4. **paper/photo:** `제일 잘 나온 거 열 장 주세요` means ten prints of the best shot, not ten different best photos. Japanese makes the printed-copy interpretation explicit.
5. **drinks/cafe:** `차가운 라떼` means cold latte, not necessarily one served with ice. Japanese avoids asserting that ice is included.
6. **animals/farm:** `우리 집에 소 세 마리가 있단다` can mean 'we have three cows at home/on our property', not necessarily physically inside the house; Japanese uses 'うちには'.

## Implementation boundary
ClassifierLocalizationProvider supplies a route-scoped resolver to existing AppText and accessible labels. The ModuleCard change consumes the same resolver but is identity-preserving outside a localized route. No classifier scene IDs, Korean sentences, pronunciation data, animation, paywall conditions, progression keys or audio playback code are edited.

**Audio note:** unlike Comptage, Classificateurs uses Korean text-to-speech (`Speech.speak`, `ko-KR`) rather than MP3 clips; the speech implementation is unchanged.

The `/classificateur` release route remains hidden behind the existing release guard. This translation phase does not silently change that release/navigation decision. Full Japanese release remains blocked until other namespaces are audited.

## CI
`npm run validate:i18n`, `npm run test:i18n`, `npm run test:vocabulary`, `npm run test:counting-localization`, `npm run test:classifiers-localization`, `npx tsc --noEmit`, plus existing runtime checks. Visual QA on small and large Android devices remains advisable.
