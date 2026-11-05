# Validation de la phase 2 FR/JA — 5 novembre 2026

Point de départ : `6843696` (`verification du comportement supabase`).
L'arbre de travail était propre avant intervention. Les trois livrables demandés
de l'audit ont été vérifiés accessibles, puis le rapport et l'inventaire consultés.
Aucun échec antérieur n'a été corrigé.

## Fichiers modifiés

| Fichier existant | Modification |
|---|---|
| `.github/workflows/ci.yml` | Validation des catalogues et tests i18n dans le job bloquant existant |
| `app/_layout.tsx` | Provider stable, hydratation avant routes, préparation du chargement JP séparé |
| `components/app-text.tsx` | Rôle japonais explicite, disponibilité séparée des fontes JP, accessibilité JA |
| `constants/theme.ts` | Familles/rôles et fallbacks japonais dans le système existant |
| `package.json` | Quatre dépendances directes et trois commandes de contrôle |
| `package-lock.json` | Verrouillage des dépendances ci-dessous |

Fichiers ajoutés :

- `lib/i18n/config.ts`, `languageController.ts`, `instance.ts`, `types.d.ts`,
  `LanguageProvider.tsx`, `displayText.ts`, `formats.ts`, `catalogValidation.ts` ;
- `locales/index.ts`, `locales/manifest.json` ;
- dans **chacun** de `locales/fr/` et `locales/ja/` : `common.json`,
  `navigation.json`, `onboarding.json`, `account.json`, `premium.json`,
  `hangul.json`, `vocabulary.json`, `counting.json`, `classifiers.json`,
  `grammar.json`, `listening.json`, `missions.json`, `speechFeedback.json`,
  `immersion.json` (28 fichiers au total) ;
- `data/localized/types.ts`, `data/localized/index.ts`,
  `data/localized/fr/index.ts`, `data/localized/ja/index.ts` ;
- `scripts/i18n-node-loader.mjs`, `scripts/validate-i18n.mjs`,
  `scripts/test-i18n.mjs`, `scripts/test-i18n-typography.mjs` ;
- `docs/localization-foundations.md`, `docs/localization-phase2-validation.md`.

Le lot contient 6 fichiers existants modifiés et 48 fichiers ajoutés, soit 54 fichiers.
Aucune autre route, donnée pédagogique, association média, règle de validation,
réponse canonique, temporisation ou configuration native n'est modifiée.
Les seuls textes de catalogue renseignés sont les deux autonymes ; aucun module
pédagogique n'est traduit et aucun sélecteur n'est créé.

## Dépendances

| Directe | Version déclarée | Version verrouillée |
|---|---|---|
| `i18next` | `^26.7.1` | `26.7.1` |
| `react-i18next` | `^17.1.12` | `17.1.12` |
| `expo-localization` | `~58.0.5` | `58.0.5` |
| `@expo-google-fonts/noto-sans-jp` | `^0.4.4` | `0.4.4` |

La version d'expo-localization correspond au manifeste du SDK Expo installé.
Dépendances transitives ajoutées : `html-parse-stringify@4.0.1`,
`rtl-detect@1.1.2`, `use-sync-external-store@1.7.0`.
`@babel/runtime` passe de `7.29.2` à `7.29.13`, car react-i18next exige `^7.29.7`.
Les autres dépendances existantes restent aux versions verrouillées précédentes.
L'installation a nécessité l'accès au registre npm après un échec initial du cache
hors ligne ; aucune publication ni mise à jour générale des dépendances n'a été faite.

## Comparaison des tests existants

Commandes Node 24.13.1, sans réseau :

```text
node --test --test-isolation=none --experimental-strip-types ./scripts/<fichier>.mjs
```

Les suites à plusieurs fichiers sont lancées ensemble dans l'ordre ci-dessous.
L'option d'isolation est la même adaptation au bac à sable que lors de l'audit.
Chaque ligne a été exécutée avant et après les changements ; les nombres et noms
des tests en échec sont identiques à la baseline de l'audit.

| Fichiers sous `scripts/` | Audit | Avant | Après |
|---|---:|---:|---:|
| `test-hangul-curriculum.mjs` | 24/24 | 24/24 | 24/24 |
| `test-grammar-registry.mjs`, `test-grammar-experience.mjs`, `test-grammar-responsive.mjs` | 107/107 | 107/107 | 107/107 |
| `test-choice-order.mjs` | 5/5 | 5/5 | 5/5 |
| `test-counting-audio.mjs` | 2/3 | 2/3 | 2/3 |
| `test-premium.mjs` | 13/13 | 13/13 | 13/13 |
| `test-auth-sync.mjs` | 8/8 | 8/8 | 8/8 |
| `test-auth-production.mjs` | 22/22 | 22/22 | 22/22 |
| `test-oauth-flow.mjs` | 13/13 | 13/13 | 13/13 |
| `test-progress-cloud-contract.mjs` | 8/8 | 8/8 | 8/8 |
| `test-account-protection-prompt.mjs` | 6/6 | 6/6 | 6/6 |
| `test-daily-streak.mjs` | 9/9 | 9/9 | 9/9 |
| `test-pedagogical-progress.mjs` | 2/2 | 2/2 | 2/2 |
| `test-auth-cloud.mjs` (ancien) | échec chargement | identique | identique |
| `test-progress-cloud.mjs` (ancien) | 0/4 | 0/4 | 0/4 |
| Groupe oral/écoute/médias/immersion | 507/557 | 507/557 | 507/557 |

Ordre du dernier groupe : `test-cafe-speech.mjs`,
`test-cafe-speech-diagnostics.mjs`, `test-cafe-conversation-summary.mjs`,
`test-metro-speech.mjs`, `test-restaurant-speech.mjs`,
`test-aeroport-speech.mjs`, `test-aeroport-intent-regressions.mjs`,
`test-listen.mjs`, `test-media-lifecycle.mjs`, `test-immersion-scenes.mjs`.
Ce groupement conserve le hook de résolution nécessaire aux imports café sans
extension, signalé dans l'audit.

Les échecs conservés sont : comptage MP3 (attendu 240, présents 245, référencés 243),
ancien import `translateAuthError` absent, ancien contrat `normalizeProgressDocument`
absent, puis les mêmes 50 échecs du groupe oral. Au total : **726 réussites sur
782 tests comptabilisés**, dont l'échec de chargement de l'ancien test auth.

## Nouveaux contrôles et contrôles transversaux

| Commande / contrôle | Résultat |
|---|---|
| `npm run test:i18n` | **20/20** |
| `npm run validate:i18n` | Réussite : 14 namespaces, 13 explicitement différés |
| `npm run validate:i18n:release-ja` | Échec attendu : publication JA bloquée, couverture différée |
| `npx tsc --noEmit` | Réussite avant et après |
| `npx eslint lib/i18n data/localized locales/index.ts components/app-text.tsx constants/theme.ts app/_layout.tsx scripts/*i18n*.mjs` | Réussite, aucun signalement |
| `npm run lint` | Avant = après : 228 signalements, 221 erreurs et 7 avertissements préexistants |
| `npm run validate:ui` | Avant = après : mêmes 48 signalements préexistants |
| `git diff --check` | Réussite |
| Empreintes SHA-256 de 910 fichiers de corpus et médias | Aucun changement ; aucun diff dans les fichiers pédagogiques/médias existants |

Les tests nouveaux vérifient notamment la priorité du choix mémorisé, la relance,
le retour au téléphone, les erreurs de stockage, les demandes concurrentes, le
maintien du français public en phase 2, l'indépendance des clés de progression et
d'onboarding, la résolution stricte sans fallback caché, les pluriels, paramètres,
formats et l'absence de mutation des valeurs canoniques. Les paramètres
d'interpolation ne peuvent pas remplacer les options de langue/namespace.

Le test typographique rend les vrais composants AppText avec un adaptateur React
Native minimal côté Node. Il vérifie chaque token existant, les familles FR/KR,
les runs Hangul, le rôle JP, les inputs, les segments explicites et le fallback.
Ce contrôle ne remplace pas une inspection visuelle sur appareil.

Les journaux avant/après sont conservés dans
`C:\Users\arben\AppData\Local\Temp\kapp-localization-phase2\`.
Ils ne sont pas ajoutés au dépôt.

## Vérifications Expo supplémentaires

- `npx expo export --platform android --no-bytecode --max-workers 1 --output-dir .expo/localization-phase2-android`
  a généré le bundle JS Android (4 365 modules, environ 7,7 Mo) et ses ressources.
  Le manifeste référence seulement les deux fontes JP choisies, soit environ
  11,46 Mo avant compression. Il s'agit d'un export JavaScript, sans build natif
  ni validation du module sur un appareil.
- `npx expo export --platform web --output-dir .expo/localization-phase2-web`
  compile le rendu serveur, puis échoue sur **`ReferenceError: window is not defined`**
  lors de l'initialisation Supabase avec AsyncStorage web.
- Cette erreur web a été reproduite avec les **sources du commit initial 6843696**
  extraites dans `.expo/localization-phase2-baseline`, les mêmes dépendances
  installées et le même environnement chargé, via l'exporteur Expo, avec un worker.
  Elle ne dépend donc pas de la nouvelle couche de localisation. L'extraction tar
  Windows ayant altéré certains noms de médias accentués, les assets inchangés ont
  été recopiés dans cette copie de vérification avant la comparaison concluante.
- Une tentative `--no-ssg` a été refusée par la configuration Expo actuelle
  (`static` sans `apiRoutes: true`). La configuration n'a pas été modifiée pour
  contourner cette limitation.

Les exports et la copie isolée sont dans `.expo/`, ignoré par Git. Aucun fichier
de production n'est déployé et aucun push n'est effectué.

## Portée de la conclusion

Aucune régression détectée dans les tests existants, les contrats typographiques
vérifiés et les données protégées. L'export web conserve une limitation antérieure.
Le fonctionnement natif d'expo-localization et le rendu japonais sur appareils,
petits/grands téléphones, tablettes et avec texte agrandi restent à valider dans un
development build reconstruit. La couverture linguistique complète, les écrans de
langue, la déclaration des langues OS et la QA audio lors de vrais changements de
langue appartiennent aux phases suivantes. Le japonais reste désactivé d'ici là.
