# Audit responsive Android — interface japonaise

13 novembre 2026 · émulateur Pixel_7 · application `com.arben60.kapp` · interface 日本語

## Méthode et environnement

K-App a été lancée sur l'émulateur avec Metro accessible sur `127.0.0.1:8081` (`packager-status:running`). Les profils sont des simulations de contraintes d'affichage, pas des reproductions certifiées de Xperia, AQUOS ou Pixel. La langue japonaise a été sélectionnée dans l'application. Les captures ont été prises avec ADB puis examinées à l'écran. Le chargement des fontes `NotoSansJP_400Regular` et `NotoSansJP_700Bold` est configuré dans `app/_layout.tsx` ; les captures montrent les glyphes japonais sans caractères manquants visibles. Cela ne constitue pas une vérification exhaustive de tous les glyphes.

La résolution native initiale était **1080×2400, 420 dpi** ; la taille de police Android initiale était **1,0**. React Native donne une fenêtre de **411,43×914,29 dp** sur cette configuration. Les insets de safe area étaient **51,81 dp en haut** et **24 dp en bas**. L'application utilise un affichage bord à bord : les dimensions de `useWindowDimensions()` incluent les zones des barres système. La hauteur utilisable doit donc retrancher les insets.

| Profil | Pixels / dpi | Fenêtre logique (dp) | Barre haute / basse (dp) | Origine des mesures |
| --- | ---: | ---: | ---: | --- |
| Compact Android | 1080×2340 / 480 | 360×780 | 44,33 / 24 | React Native, `useWindowDimensions` et `useSafeAreaInsets` |
| Compact japonais | 1080×2340 / 440 | 392,73×850,91 | 44,33 / 24 | React Native |
| Économique japonais | 720×1612 / 320 | 360×806 | 45,5 / 24 | Fenêtre RN observée ; barres par `dumpsys window` (91 / 48 px) |
| Pixel intermédiaire | 1080×2424 / 420 | 411,43×923,43 | 51,81 / 18,29 | Fenêtre calculée à partir des pixels et dpi ; barres par `dumpsys window` (136 / 48 px) |
| Plus / grand format | 1080×2400 / 400 | 432×960 | 54,4 / 24 | Fenêtre calculée ; barres par `dumpsys window` (136 / 60 px) |
| Très petit espace logique | 720×1600 / 360 | 320×711,11 | 40,44 / 24 | React Native |

Les valeurs `dumpsys` du profil Pixel intermédiaire sont un instantané après changement de densité ; la barre basse est à recontrôler sur un appareil réel ou un émulateur démarré directement dans ce profil.

## Écrans réellement parcourus et examinés

| Profil | Parcours vérifiés par capture |
| --- | --- |
| 1080×2340 / 480 | Sélection de langue et accueil, [Hangul](../artifacts/responsive-audit/p1-after-hangul.png), vocabulaire et collection de base, Listen, scènes d'immersion, compte et langue, Premium, série quotidienne |
| 1080×2340 / 440 | [Hangul](../artifacts/responsive-audit/p2-hangul.png), [vocabulaire](../artifacts/responsive-audit/p2-voc.png), [Listen](../artifacts/responsive-audit/p2-listen.png), [dialogue café](../artifacts/responsive-audit/p2-lesson-cafe.png), compte et langue, Premium |
| 720×1612 / 320 | Sélection de langue et accueil, [grammaire](../artifacts/responsive-audit/p3-grammar.png), [comptage](../artifacts/responsive-audit/p3-comptage.png), Listen, compte, Premium, série quotidienne |
| 1080×2424 / 420 | [Hangul](../artifacts/responsive-audit/p4-hangul.png), [vocabulaire](../artifacts/responsive-audit/p4-voc.png), [Listen](../artifacts/responsive-audit/p4-listen.png), [compte et langue](../artifacts/responsive-audit/p4-account.png) |
| 1080×2400 / 400 | [Hangul](../artifacts/responsive-audit/p5-hangul.png), [grammaire](../artifacts/responsive-audit/p5-grammar.png), [comptage](../artifacts/responsive-audit/p5-comptage.png), [compte et langue](../artifacts/responsive-audit/p5-account.png) |
| 720×1600 / 360 | Hangul et [leçon de voyelles](../artifacts/responsive-audit/p6-hangul-vowels-basic.png), vocabulaire et collection de base, Listen et ses commandes après défilement, dialogue café, grammaire et [mini-leçon](../artifacts/responsive-audit/p6-grammar-stage-clear.png), comptage et [cours de base](../artifacts/responsive-audit/p6-comptage-base.png), [Speak](../artifacts/responsive-audit/p6-speak.png), compte et langue, Premium, série quotidienne, modale de protection du compte |

Les captures du dernier profil ont également été prises avec `font_scale=1.3` sur Hangul, Listen, grammaire, [mini-leçon de grammaire](../artifacts/responsive-audit/p6-large-grammar-stage-clear.png), comptage, compte et la modale de protection. Le [bas du questionnaire Listen](../artifacts/responsive-audit/p6-large-listen-bottom.png) reste accessible après défilement. Les boutons de la modale de protection sont visibles à 130 % dans la [capture](../artifacts/responsive-audit/p6-large-protect.png).

## Problèmes observés et corrections

| Problème constaté | Avant | Après | Correction |
| --- | --- | --- | --- |
| Titre de la carte « Continuer » Hangul terminé par un caractère isolé à 360 et 320 dp | [360 dp](../artifacts/responsive-audit/p1-hangul.png) | [360 dp](../artifacts/responsive-audit/p1-after-hangul.png), [320 dp](../artifacts/responsive-audit/p6-after2-hangul.png) | Variante typographique du projet plus compacte et padding horizontal réduit sur petit écran |
| Ligne de disponibilité du comptage coupée à droite | [Avant](../artifacts/responsive-audit/p3-comptage.png) | [Après](../artifacts/responsive-audit/p6-after-comptage.png) | Ligne Flexbox autorisée à passer à la ligne ; texte réductible |
| Actions de la carte vedette de grammaire débordant à 320 dp | [Avant](../artifacts/responsive-audit/p6-grammar-verified.png) | [Après](../artifacts/responsive-audit/p6-after-grammar.png) | Retour à la ligne des actions, alignement à droite conservé |
| Titre du questionnaire Listen coupé sur un caractère final à 320 dp | [Avant](../artifacts/responsive-audit/p6-listen.png) | [Après](../artifacts/responsive-audit/p6-after-listen.png) | Espace entre titre et compteur réduit, largeur disponible rendue au titre |
| Titre « Mon compte » et titre de carte mal répartis à 320 dp | [Avant](../artifacts/responsive-audit/p6-after-account.png) | [Après](../artifacts/responsive-audit/p6-after2-account.png) | Variantes typographiques existantes plus adaptées au format compact |
| Nombre d'étapes Hangul coupé avec police Android à 130 % sur 320 dp | [Avant](../artifacts/responsive-audit/p6-large-hangul.png) | [Après](../artifacts/responsive-audit/p6-large-after-hangul.png) | Métadonnées autorisées à passer sur deux lignes |

La même règle Flexbox a été appliquée à la ligne de métadonnées du vocabulaire, qui partage le comportement du comptage. Les correctifs restent limités aux styles et variantes typographiques ; la logique pédagogique, les textes, les achats et les règles Premium n'ont pas été modifiés.

Fichiers modifiés :

- `app/(tabs)/hangul/index.tsx` : carte compacte et métadonnées adaptatives ;
- `app/(tabs)/comptage/index.tsx` et `app/(tabs)/voc/index.tsx` : lignes de métadonnées adaptatives ;
- `app/(tabs)/grammar/index.tsx` : actions de la carte vedette adaptatives ;
- `app/(tabs)/listen.tsx` : place disponible pour le titre du questionnaire ;
- `app/account/index.tsx` : hiérarchie typographique compacte.

## Validation et limites

- `git diff --check` : réussi.
- `npx tsc --noEmit --pretty false` : échec sur deux erreurs préexistantes `TS2532` dans `lib/i18n/immersionText.ts:225`, sans erreur dans les fichiers modifiés.
- Les captures de développement comportent parfois un bandeau Expo sur les liens/navigation et une icône d'outils flottante. Ce bandeau masque ponctuellement le bas des pages ; il ne fait pas partie de l'interface de production.
- L'émulateur ADB s'est déconnecté brièvement lors de plusieurs changements de profil. Les captures vides ou prises pendant une transition n'ont pas été retenues comme preuve.
- Le clavier virtuel complet n'a pas pu être affiché : l'émulateur a présenté la barre d'outils du clavier matériel même avec l'option Android d'affichage du clavier logiciel activée. Les champs et la modale ont été inspectés, mais l'occlusion par le clavier virtuel reste à valider.
- Les parcours détaillés de toutes les leçons Hangul, vocabulaire, grammaire et comptage, les autres scènes d'immersion, les exercices internes de Speak, les fenêtres et menus secondaires, ainsi que tous les états Premium/authentifiés n'ont pas été parcourus sur chacun des six profils. Les captures documentent une couverture partielle, pas une certification responsive exhaustive. La police agrandie n'a été vérifiée que sur le profil de 320 dp. Aucun appareil Android physique ni tablette n'a été testé.

Les paramètres initiaux de résolution, densité, échelle de police et clavier ont été restaurés après l'audit. Les données de l'application n'ont pas été réinitialisées.
