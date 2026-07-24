# Audit des médias K-App — bilan après suppression

## Résultat

- Inventaire initial : 710 médias, 482 908 533 octets.
- Médias utilisés et conservés : 642.
- Médias conservés par précaution : 10.
- Médias certainement orphelins supprimés : 58.
- Espace économisé : 56 971 617 octets, soit 56,97 MB ou 54,33 MiB.
- Inventaire final : 652 médias, 425 936 916 octets.
- Fichiers applicatifs modifiés par l’audit : aucun.
- Références cassées détectées : aucune.
- Références cassées corrigées : aucune correction nécessaire.

Le rapport préalable exhaustif, avec chaque média utilisé et ses fichiers/lignes de
référence, se trouve dans `report-before-deletion.md`. Les données structurées complètes
se trouvent dans `audit.json`.

## Médias supprimés

### Vidéos et images IA

- `assets/ai/cafe/followUp.mp4`
- `assets/ai/cafe/minji_base.png`
- `assets/ai/cafe/mouth_mid.png`
- `assets/ai/cafe/mouth_open.png`
- `assets/ai/cafe/pricePaimentChooseReal.mp4`
- `assets/ai/listen/cafe/cafe-situation-02.mp3`
- `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_intro_route_short.mp4`
- `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line4_direction_short.mp4`
- `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station_short.mp4`

### Ambiances

- `assets/ambience/cafe.mp3`
- `assets/ambience/metro.mp3`
- `assets/ambience/restaurant.mp3`

Ces trois fichiers étaient vides et ne possédaient aucune référence résolue.

### Audios Hangeul

- `assets/audio/hangul/consonants-basic/가.mp3`
- `assets/audio/hangul/consonants-basic/나.mp3`
- `assets/audio/hangul/consonants-basic/다.mp3`
- `assets/audio/hangul/consonants-basic/라.mp3`
- `assets/audio/hangul/consonants-basic/마.mp3`
- `assets/audio/hangul/consonants-basic/바.mp3`
- `assets/audio/hangul/consonants-basic/사.mp3`
- `assets/audio/hangul/consonants-basic/아.mp3`
- `assets/audio/hangul/consonants-basic/자.mp3`
- `assets/audio/hangul/consonants-basic/차.mp3`
- `assets/audio/hangul/consonants-basic/카.mp3`
- `assets/audio/hangul/consonants-basic/타.mp3`
- `assets/audio/hangul/consonants-basic/파.mp3`
- `assets/audio/hangul/consonants-basic/하.mp3`
- `assets/audio/hangul/consonants-tense/까.mp3`
- `assets/audio/hangul/consonants-tense/따.mp3`
- `assets/audio/hangul/consonants-tense/빠.mp3`
- `assets/audio/hangul/consonants-tense/싸.mp3`
- `assets/audio/hangul/consonants-tense/짜.mp3`

Les écrans Hangeul utilisent `expo-speech` avec des chaînes coréennes et ne résolvent
aucun de ces fichiers.

### Autre audio

- `assets/audio/listen/hiérarchie-bulle-2.mp3`

### Images

- `assets/images/avatarIA.png`
- `assets/images/back.png`
- `assets/images/bg-speak.png`
- `assets/images/bg-speak1.png`
- `assets/images/bg.png`
- `assets/images/bgtest.png`
- `assets/images/cafebg.png`
- `assets/images/class.png`
- `assets/images/gyeongbokgung-palace.png`
- `assets/images/hangul-bg.png`
- `assets/images/minji.png`
- `assets/images/partial-react-logo.png`
- `assets/images/react-logo.png`
- `assets/images/react-logo@2x.png`
- `assets/images/react-logo@3x.png`
- `assets/images/seoul-bg.png`
- `assets/images/seoul-bg1.jpg`
- `assets/images/seoul-bg1.png`
- `assets/images/seoul-bg2.png.png`
- `assets/images/seoulbg.png`
- `assets/images/seoulbg1.jpg`
- `assets/images/seoulhub.jpg`
- `assets/images/titre.jpg`
- `assets/images/titre.png`
- `assets/images/titrepng.png`
- `assets/M1Yed.png`

## Médias conservés par précaution

### Chemin construit par un script

Le script `scripts/test-metro-speech.mjs` construit un chemin avec
`Hongik-to-Gangnam/${video}`. Les quatre variantes suivantes sont donc conservées,
même si aucune référence statique individuelle n’a été établie :

- `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info_short.mp4`
- `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_intro_route_slow.mp4`
- `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction_short.mp4`
- `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_trip_time_short.mp4`

### Séquences numérotées partiellement utilisées

Ces fichiers ne possèdent pas de référence individuelle, mais appartiennent à des
séquences numérotées dont d’autres membres sont utilisés. Ils sont conservés par
prudence :

- `assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-6.mp3`
- `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-2.mp3`
- `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-3.mp3`
- `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-4.mp3`
- `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-5.mp3`
- `assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-6.mp3`

## Contrôles exécutés

- `node .\tmp\check-media-references.mjs`
  - 681 références littérales résolues.
  - 0 référence vers un fichier manquant.
- Recherche exacte de tous les noms supprimés dans les sources.
  - Trois homonymes/sous-chaînes ont été contrôlés manuellement.
  - Aucun ne vise un média supprimé.
- `npx tsc --noEmit`
  - Réussi, 0 erreur.
- `npm run test:cafe-speech`
  - Réussi, 357/357 tests.
- `npm run test:metro-speech`
  - Réussi, 29/29 tests.
- `npm run test:hangul`
  - Réussi, 12/12 tests.
- `npm run test:grammar`
  - Réussi, 28/28 tests.
- `npm run test:choices`
  - Réussi, 5/5 tests.
- `npm run test:streak`
  - Réussi, 7/7 tests.
- `npx expo export --platform all --output-dir tmp/media-audit-export --clear`
  - Réussi pour iOS, Android et Web.
  - 133 routes statiques exportées.
  - Aucun asset manquant signalé.
- `npm run validate:ui`
  - Échec préexistant hors périmètre : `app/index.tsx` ne passe pas par `AppText`.
- `npm run lint`
  - Échec préexistant hors périmètre : 220 erreurs et 3 avertissements React Hooks
    dans des fichiers non modifiés par l’audit.

## Contrôle final du diff

`git diff --name-status -- assets` contient exactement 58 suppressions et aucune
création ou modification de média. Les autres modifications déjà présentes dans le
worktree ont été laissées intactes.
