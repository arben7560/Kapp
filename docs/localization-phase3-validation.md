# Validation de la phase 3 FR/JA — 5 novembre 2026

Référence : `42c70fa` (`feat(i18n): add FR/JA localization foundations`),
présente et HEAD au démarrage. Arbre de travail initial propre. Les deux documents
de phase 2 ont été consultés avant modification. Aucun push n'est effectué.

## Comportement livré

- Les interfaces migrées acceptent désormais FR et JA via l'instance i18next,
  le contrôleur, le provider et la clé `kapp:locale:v1` existants.
- Après l'animation du logo, un premier utilisateur sans choix explicite voit
  `Choose your language` / `언어를 선택해 주세요`, les deux autonymes et un bouton
  de confirmation. La détection du téléphone présélectionne FR/JA ; une langue
  non prise en charge utilise FR. Toucher une langue prévisualise le bouton et
  les erreurs dans cette langue ; seule la confirmation réussie la mémorise.
- Le choix ne touche jamais `kapp_onboarding_completed`. La suite reste l'accueil
  initial, les scènes d'onboarding, le choix de mode, puis la destination actuelle
  (Hub ou module, avec les mêmes règles de paywall).
- Une écriture impossible conserve l'écran et permet de réessayer. Après une
  confirmation, une relance ne repropose pas le sélecteur, même si l'onboarding
  reste inachevé.
- **Mise à jour d'un utilisateur existant :** si l'onboarding est déjà terminé,
  le sélecteur n'est pas imposé. Aucune préférence n'est fabriquée pour lui.
  L'accueil et les redirections existants restent en place ; la langue détectée
  s'applique aux surfaces migrées. Le choix explicite reste disponible dans le compte.
- Le sélecteur est un état local de l'entrée `/`, pas une nouvelle route ni une
  garde globale. Les accès directs, callbacks d'authentification, retours depuis
  les modules et exceptions des gardes existantes conservent leurs mécanismes.
  Un échec de lecture de l'état d'onboarding contourne le sélecteur, afin de ne
  pas imposer une première utilisation à tort ; un prochain démarrage retente la lecture.
- Dans `/account`, une carte de langue est accessible indépendamment de l'état
  invité/connecté. Le changement s'applique immédiatement après l'enregistrement,
  sans navigation, reconnexion, modification de progression ou reprise d'onboarding.
- Les fontes JP préparées en phase 2 sont maintenant chargées avant le montage
  initial. Le rôle japonais existant est explicite sur les textes migrés ; les
  runs coréens gardent leur rôle KR. Aucun `key={locale}` ne remonte les écrans.
  Les cartes JA peuvent grandir avec leur texte ; le défilement et les safe areas
  des écrans existants restent utilisés.

## Périmètre linguistique

Les catalogues `common`, `onboarding` et `account` reçoivent **60 nouveaux messages
par langue** (les deux autonymes existaient déjà). Ils couvrent les messages du
sélecteur, de l'accueil initial, des quatre cartes de scènes, des deux approches,
des actions/accessibilités d'onboarding et de la seule carte de langue du compte.
Les chaînes françaises existantes ont été conservées, y compris les libellés de
lieux et la graphie `INTERMEDIAIRE`. Les nouveaux messages japonais sont rédigés
pour ce parcours. Le titre anglais et le sous-titre coréen du sélecteur sont
identiques dans les deux catalogues, conformément à la demande.

Le reste de `/account`, le Hub principal, la navigation partagée, le paywall et
les modules pédagogiques restent dans leur état français actuel. Les namespaces
pédagogiques restent différés et les registres de contenu restent vides. La
présence de clés `account` signifie uniquement que la carte de langue est migrée.
La publication d'une application entièrement japonaise reste bloquée par
`validate:i18n:release-ja` ; l'activation partielle de l'UI ne déclare pas une
couverture japonaise complète.

## Fichiers modifiés ou ajoutés

| Fichier | Intervention |
|---|---|
| `app/index.tsx` | Sélecteur après logo et accueil localisé |
| `app/onboarding.tsx` | Textes d'affichage FR/JA, accessibilité et cartes JA adaptables |
| `app/account/index.tsx` | Carte de langue hors condition d'authentification |
| `components/language-selection-screen.tsx` (ajout) | Sélection explicite, transition, sauvegarde et erreur |
| `components/language-choices.tsx` (ajout) | Choix radio/autonymes communs aux deux interfaces |
| `components/application-language-settings.tsx` (ajout) | Application immédiate depuis le compte |
| `lib/i18n/firstRun.ts` (ajout) | Règle pure d'apparition du sélecteur |
| `lib/i18n/config.ts` | Activation de l'UI FR/JA |
| `locales/fr/common.json`, `locales/ja/common.json` | Messages du sélecteur |
| `locales/fr/onboarding.json`, `locales/ja/onboarding.json` | Accueil et onboarding |
| `locales/fr/account.json`, `locales/ja/account.json` | Carte de langue |
| `locales/manifest.json` | Phase 3, surfaces UI disponibles et couverture complète différée |
| `scripts/validate-i18n.mjs` | Séparation de l'activation UI partielle et de la publication JA complète |
| `scripts/test-i18n-first-run.mjs` (ajout) | Détection, choix, relance, compte et contrats des écrans |
| `package.json` | Ajout des nouveaux tests à `test:i18n`, déjà exécuté en CI |
| `docs/localization-phase3-validation.md` (ajout) | Présent rapport |

Aucune dépendance n'est ajoutée. Les gardes, providers d'authentification/progression,
configuration native, paywall et ancien `/profile` ne sont pas modifiés.

## Tests automatisés

| Contrôle | Phase 2 | Phase 3 |
|---|---:|---:|
| `npm run test:i18n` | 20/20 | **33/33** |
| `npm run validate:i18n` | 14 namespaces, 13 différés | Réussite : 14 namespaces, 11 différés |
| `npm run validate:i18n:release-ja` | Échec attendu | Échec attendu : couverture complète différée |
| `npx tsc --noEmit` | Réussite | Réussite |
| ESLint ciblé sur tous les fichiers TS/TSX/MJS modifiés/ajoutés | Réussite | Réussite |
| `npm run lint` | 221 erreurs, 7 avertissements | Identique |
| `npm run validate:ui` | 48 signalements | Identique |
| `git diff --check` | Réussite | Réussite |
| Export JS Android, sans bytecode, un worker | Réussite | Bundle et ressources générés, 4 369 modules, environ 7,7 Mo |

Les 13 nouveaux tests couvrent les trois langues de téléphone, l'absence de choix
implicite, la persistance et la relance, l'utilisateur existant, l'onboarding
inachevé, les comptes invité/connecté avec sessions/progression simulées, l'échec
de sauvegarde et sa reprise. Ils vérifient aussi les chaînes visibles/accessibles
hors catalogues dans les écrans migrés, leurs clés, les quatre phrases coréennes,
les huit destinations originales et l'accès au réglage hors condition auth.
Les tests de comptes connectés utilisent des fixtures ; ils ne sont pas une
connexion réelle à Supabase.

Les suites existantes ont été relancées avec les mêmes groupements que le rapport
de phase 2 : Hangul 24/24 ; grammaire 107/107 ; choix 5/5 ; comptage audio 2/3 ;
Premium 13/13 ; auth sync 8/8 ; auth production 22/22 ; OAuth 13/13 ; progression
cloud contractuelle 8/8 ; protection compte 6/6 ; série 9/9 ; progression pédagogique
2/2 ; ancien auth : échec de chargement ; ancien cloud 0/4 ; groupe oral/écoute/
médias/immersion 507/557. **726 réussites sur 782**, identique à la phase 2.
Les échecs préexistants n'ont pas été corrigés.

Les journaux, l'export Android et les artefacts de vérification temporaires sont
dans `.expo/localization-phase3/`, ignoré par Git. L'export Android est un bundle
JavaScript et ses assets ; aucun APK/development build natif n'est produit.
La CLI est restée active après le message `Exported` et la création de
`metadata.json` et du bundle ; les processus d'export ont été arrêtés après cette
génération. On ne présente donc pas cette commande comme une terminaison normale
avec code zéro. Le dernier bundle contient les sources finales de la phase 3.

## Vérification visuelle et manuelle

Contrôle exécuté dans Chrome headless isolé, avec les vrais composants React Native
Web, fontes embarquées et stockage local. Le serveur Expo utilise un environnement
sans configuration Supabase ; aucune connexion réelle ou opération cloud n'est
effectuée. Un chargeur client temporaire dans `.expo/` contourne le rendu serveur
et le chargement différé web, qui ont rencontré un écran vide puis une erreur
Metro `Requiring unknown module "1019"`. Aucune configuration de production n'a
été changée pour ce contrôle ; le problème web n'a pas été corrigé ni attribué
à cette phase sans preuve comparative. La limitation SSR/Supabase de phase 2
reste également hors périmètre.

Contrôles web réussis : détection FR/JA/autre, présélection et absence de préférence
implicite ; prévisualisation JA ; confirmation ; échec d'écriture simulé et nouvelle
tentative ; relance sans sélecteur et sans fin d'onboarding implicite ; ouverture
des quatre scènes, choix d'approche et retours ; sortie réelle vers `/lesson/cafe`
en mode texte avec la clé d'onboarding validée ; réglage invité, persistance après
réouverture ; utilisateur existant sans nouveau sélecteur ; deep link
`/account?action=recovery` conservé. Aucun événement d'exception JavaScript non
interceptée dans la séquence finale enregistrée.

Un contrôle supplémentaire du compte invité exécute **FR → JA → FR**, avec échec
d'écriture simulé puis reprise. La route `/account` reste active et l'ensemble du
stockage local hors `kapp:locale:v1` est identique avant et après ce contrôle.

Captures FR/JA de l'onboarding générées à **320 × 640, 360 × 800, 412 × 915 et
768 × 1024 pixels CSS**, avec absence de débordement horizontal vérifiée en JA.
Captures du sélecteur, de l'accueil, des quatre approches JA et de la carte de
langue également générées. Inspection visuelle des vues étroites FR/JA, de
l'onboarding JA sur tablette, de l'accueil JA, du sélecteur et du compte : pas de
texte tronqué constaté sur ces vues. Les captures sont dans
`.expo/localization-phase3/` ; le journal de la séquence finale est
`browser-results.json`. Ces contrôles web ne constituent pas une validation du
rendu Android natif, des safe areas Android ou de l'agrandissement système du texte.

À vérifier sur un **development build Android reconstruit** intégrant
`expo-localization` de phase 2 :

- Détection du téléphone FR/JA/autre et relance après fermeture forcée.
- Petits/grands téléphones et tablette : retours à la ligne, safe areas, gestes,
  fontes JP chargées et fallback en cas d'échec ; texte système agrandi et TalkBack.
- Transitions réelles et option système de réduction des animations.
- Compte connecté réel, OAuth/protection/récupération et deep links natifs,
  conservation des jetons, synchronisation et progression cloud.
- Navigation vers les huit destinations, règles Premium et reprises existantes.
- Écoute avant/après changement de langue sur appareil, avec les mêmes audios,
  associations et déclenchements. Aucun effet média ne dépend de la langue.
- Relecture des formulations japonaises par un locuteur natif avant publication.

## Intégrité protégée

Aucun diff par rapport à `42c70fa` dans `assets`, `data`, `hooks`, `services`,
`_store.tsx`, `lib/AuthProvider.tsx`, `lib/paywall`, les routes pédagogiques et le Hub.
Les phrases coréennes de l'accueil et des quatre scènes restent exactes. Aucun
audio, fichier vidéo, association texte/média, moteur de réponse, score, branche,
mécanisme de reprise ou comportement de paywall n'est modifié.
