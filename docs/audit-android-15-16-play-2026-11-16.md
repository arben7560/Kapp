# Audit Android 15/16 — préparation du prochain AAB

16 novembre 2026. Périmètre : Expo 58.0.22, React Native 0.88.1, cible Android 36. Aucun APK/AAB n'a été généré.

## Avant / après

| Avertissement Play | Constat dans le projet avant correction | Correction et état vérifiable |
| --- | --- | --- |
| Affichage bord à bord | `edgeToEdgeEnabled=true` était déjà actif. Les écrans principaux utilisent `react-native-safe-area-context` et les scènes IA ajoutent un padding inférieur basé sur `insets.bottom`. Les fenêtres `Modal` de bilan utilisaient toutefois les insets du navigateur parent et ne protégeaient pas tous les bords. | Les bilans Café, Métro, Aéroport et Listen mesurent leurs insets dans leur propre fenêtre, couvrent les barres système et protègent les quatre côtés. La célébration de mission fait de même. `AppDialog` protège les bords latéraux par défaut. La configuration Expo conserve `edgeToEdgeEnabled=true`. Validation visuelle sur le prochain binaire requise. |
| API d'affichage obsolètes | Le mod système d'Expo ajoutait `android:statusBarColor` et `android:navigationBarColor` à `AppTheme`. React Native 0.88.1 appelle encore ces API dans `WindowUtil.kt` pour sa compatibilité native. | Le plugin local retire les deux attributs du thème après les mods Expo. L'introspection Expo ne les contient plus. Les appels de React Native restent dans la dépendance et peuvent toujours être signalés par l'analyse statique de Play ; aucune dissimulation ni désactivation Edge-to-edge n'a été faite. |
| Orientation et redimensionnement | `orientation: "default"` produisait `android:screenOrientation="unspecified"`, sans verrou effectif. Aucun `useAndroidPhonePortraitLock.ts` ni appel à `expo-screen-orientation` n'existe dans cette version du projet. Aucun `resizeableActivity=false` ni ratio imposé n'a été trouvé dans l'application. | La déclaration d'orientation redondante a été retirée d'Expo et du manifeste local. L'introspection ne déclare plus `screenOrientation`. Les hooks de dimensions et les dispositions paysage existants restent en place. Le comportement actuel du téléphone, qui suit l'orientation du système, est conservé. |

Le manifeste **debug** fusionné avant cette passe ciblait bien l'API 36. Il contenait aussi deux activités `portrait` fournies par Expo Dev Launcher et Google Play Services Code Scanner ; elles ne sont pas la `MainActivity`. La fusion **release** doit être inspectée sur le prochain environnement de build pour établir si elles y figurent. Le test local `:app:processReleaseMainManifest --offline` s'est arrêté avant la fusion : plusieurs dépendances Gradle ne sont pas présentes dans le cache hors ligne.

## Portée des écrans

La racine Expo Router fournit déjà le contexte safe area aux écrans. Hangul, Vocabulaire, Grammaire, Listen, les hubs d'immersion et les scènes IA Café/Métro/Restaurant/Aéroport utilisent des dimensions réactives, des `SafeAreaView` et/ou des insets explicites. La présente passe a ciblé les fenêtres séparées et les déclarations natives ; elle n'a modifié ni le contenu pédagogique ni la navigation. Les rapports responsives précédents (`docs/audit-responsive-immersions-v2.md` et `docs/audit-responsive-android-ja-2026-11-13.md`) documentent des parcours téléphone et tablette, mais ne valident pas ce nouveau binaire.

## Vérifications de cette passe

- `npx expo config --type introspect --json` en configuration courante et production : `edgeToEdgeEnabled=true`, absence de couleurs de barres dans `AppTheme`, absence de `screenOrientation` sur `MainActivity`, paramètres R8 `android.enableMinifyInReleaseBuilds=true` et `android.enableShrinkResourcesInReleaseBuilds=true`.
- `npx tsc --noEmit --pretty false` : réussi.
- ESLint ciblé sur `AppDialog` et les quatre bilans : réussi. `GuidedMissionsHeader.tsx` conserve trois erreurs React Compiler dans `useFocusEffect` aux lignes 70–80, hors des lignes modifiées.
- `test:immersion` 9/9, `test:listen` 14/14, `test:hangul` 26/26, `test:vocabulary` 4/4 : réussis.
- `test:grammar`, `test:cafe-speech`, `test:metro-speech`, `test:restaurant-speech`, `test:aeroport-speech` et `validate:ui` : échecs existants sur des assertions de contenu ou de structure dans des fichiers non modifiés. Ils ne valident pas cette passe.
- `git diff --check` : réussi.
- Émulateur Android local : démarrage impossible (`emu-last-feature-flags.protobuf.lock`, accès refusé). Aucune nouvelle capture téléphone/tablette n'a pu être prise.

## Vérification requise avant publication

Sur un environnement disposant des dépendances Gradle et d'un émulateur fonctionnel, fusionner uniquement le manifeste **release**, puis examiner les attributs d'orientation de toutes les activités. Sur un binaire issu des nouvelles sources, parcourir Android 15 et 16 avec navigation gestuelle et à trois boutons, sur téléphone et tablette portrait/paysage, notamment les quatre bilans et la célébration. Après l'envoi du prochain AAB, consulter les trois diagnostics Play Console du **nouveau** bundle. Les changements de source ne prouvent pas à eux seuls que Play a retiré les avertissements du bundle version 3 déjà analysé.

Références : [Android 15 Edge-to-edge](https://developer.android.com/about/versions/15/behavior-changes-15), [Android 16 grands écrans](https://developer.android.com/about/versions/16/behavior-changes-16), [React Native Modal](https://reactnative.dev/docs/modal), [SafeAreaProvider](https://appandflow.github.io/react-native-safe-area-context/docs/api/safe-area-provider/).
