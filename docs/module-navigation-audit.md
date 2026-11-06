# Navigation Vocabulaire / Comptage — 6 novembre 2026

## Cause démontrée et limite de la conclusion

Les chemins `/voc`, `/voc/basics`, `/comptage` et `/comptage/base` sont
correctement résolus par Expo Router. `Home.openSequence` appelle bien
`router.push` avec les routes canoniques, indépendamment de la langue et du
compte. Les guards de release, Premium et onboarding ne remplacent pas les
deux hubs gratuits par l'accueil.

Un échec **natif** a été reproduit pendant le parcours monté sur Android :

```text
Animated node 441 is already attached to a view: 6440
```

Le navigateur est retiré après l'erreur (`diagnostics.unmounted`). La route est
donc atteinte avant l'échec de rendu ; ce n'est pas un `router.push` annulé.
Le test web équivalent passe, car il n'exécute pas le gestionnaire Animated
Android.

Le défaut se trouve dans React Native **0.88.1**,
`Libraries/Animated/nodes/AnimatedProps.js`, fonction `setNativeView` :
un changement d'instance native remplace `_target` puis connecte le même nœud
Animated à la nouvelle vue, sans déconnecter la précédente.
`PropsAnimatedNode.connectToView` côté Android refuse ce second attachement.
Les écrans K-App utilisent des vues et textes Animated, notamment dans les
hubs et les indications animées des leçons.

Le [correctif amont React Native](https://github.com/react/react-native/commit/856661ff37632e74fce1914224cd527750475410)
ajoute exactement la déconnexion manquante avant le remplacement de `_target`.
Les tests exécutent la vraie classe installée, compilée avec le parseur Hermes,
avec un adaptateur natif qui applique la même contrainte qu'Android : la version
publiée reproduit l'erreur ; la version corrigée déconnecte puis reconnecte dans
le bon ordre, ignore une instance inchangée et libère la dernière vue.

Un essai avec des `Stack` à la place des deux `Slot` a reproduit la même erreur
native. Il a été annulé. Les layouts d'origine sont donc conservés, avec leurs
providers de traduction. `Slot` est une structure autorisée par
[Expo Router](https://docs.expo.dev/router/basics/navigation-layouts/).

**Le retour immédiat au hub dès le tout premier appui, sur l'APK de développement
du téléphone de l'utilisateur, n'a pas été reproduit à l'identique.** Le crash
natif ci-dessus est démontré ; il ne faut pas affirmer qu'il explique à lui seul
toutes les manifestations rapportées avant confirmation sur cet APK.

## Correctif livré

- `scripts/patch-react-native-animated.cjs` applique les trois lignes amont au
  fichier installé, sans nouvelle dépendance. Il est idempotent, préserve les
  fins de ligne et refuse une version/source différente non reconnue.
- `postinstall` applique le correctif après installation des dépendances.
- `metro.config.js` l'applique aussi **avant** l'indexation des sources par Metro.
  Un checkout existant mis à jour par `git pull` bénéficie donc du correctif au
  prochain démarrage de Metro, même sans `npm install`. La configuration Expo
  par défaut est conservée.
- Les diagnostics existants incluent maintenant toute la chaîne des
  navigateurs actifs, avec les clés/indices des piles imbriquées. L'indice du
  navigateur racine seul restait à zéro pendant les changements de module.
  Les paramètres de route et les identifiants d'authentification sont exclus.
- `ContentLocalizationProvider` trace sa portée et sa langue uniquement avec
  le diagnostic de développement déjà existant.
- Deux anciens tests de localisation attendaient encore les providers
  historiques dans le layout racine. Leurs assertions suivent désormais les
  providers réellement présents dans les layouts des modules.

Aucun changement des routes, du contenu pédagogique, des catalogues FR/JA,
des MP3, d'Account, d'OAuth, de Supabase, de la synchronisation, du paywall ou
de l'onboarding. La modification locale préexistante d'`app.json` n'est pas
incluse dans le commit.

## Vérifications

Les suites se lancent séparément : certains anciens tests partagent et mutent
des fixtures en mémoire lorsqu'on les rassemble artificiellement dans un seul
processus avec `--test-isolation=none`.

| Commande | Couverture |
| --- | --- |
| `npm run test:navigation` | 16 tests : routes réelles Expo Router, callbacks simulés, invariants Animated, chaîne de diagnostic |
| `npm run test:vocabulary` | 4 tests FR/JA |
| `npm run test:counting-localization` | 5 tests FR/JA et contrats audio |
| `npm run test:classifiers-localization` | 6 tests de compatibilité des catalogues/providers |
| `npm run test:hangul` | 26 tests pédagogiques et FR/JA |
| `npm run test:listen` | 14 tests pédagogiques et FR/JA |
| `node --test --test-isolation=none scripts/test-counting-audio.mjs` | 3 tests des MP3 intégrés ; l'isolation par processus est refusée par le sandbox local |
| `npm run test:navigation:browser` | Application React Native Web montée, vrais boutons, retours, FR↔JA sans redémarrage et réouverture |
| `npm run test:navigation:native` | Application React Native montée sous Hermes, handlers réels, composants actifs, piles et traductions |

Le test natif utilise le runtime connecté via l'inspecteur Metro et les fibres
React DevTools. Il appelle les handlers des `Pressable` montés : il teste le
rendu et les piles natives, **pas l'injection d'un geste tactile physique**.
Le test navigateur clique les éléments réellement rendus et passe par le vrai
contrôleur de préférence linguistique. Le test natif change directement
l'instance i18next, sans redémarrer l'application.

Le runtime Android disponible est Expo Go 58.0.5, React Native 0.88.1, sur un
émulateur Android 16/API 36 x86_64. Le compte utilisé est invité. Les transitions
OAuth sont simulées dans les tests existants ; aucune connexion Google réelle
n'a été lancée. La compilation d'un APK local a rencontré un refus d'accès du
daemon Kotlin puis a été interrompue pour libérer les ressources. Aucun APK de
développement nouvellement compilé n'est annoncé comme validé.

Résultat final : **74 tests de contrat/régression, 3 tests navigateur et
3 tests natifs réussis (80 au total)**. Les parcours montés vérifient l'ouverture
des deux hubs et de leurs premières leçons, les retours, la réouverture et les
contenus FR/JA sans redémarrage. Les clés des navigateurs parents restent
identiques. Un appui tactile injecté sur la carte Vocabulaire de l'émulateur
a également ouvert son hub.

Le rechargement direct du gros bundle dans Expo Go a rencontré des erreurs de
transport/compilation au démarrage. Pour terminer le contrôle natif, une copie
complète du même bundle **JavaScript**, dont la syntaxe a aussi été validée par
le parseur et le compilateur Hermes installés, a été servie par un serveur local
de test avec l'inspecteur Metro. Ce serveur de test n'est pas livré dans le
correctif. Ces résultats ne remplacent pas le contrôle du development build
du téléphone.

TypeScript et ESLint sur les fichiers modifiés sont vérifiés séparément.
`npm run lint` global rencontre des erreurs préexistantes dans des fichiers
inchangés (218 erreurs, 9 avertissements, notamment règles refs et entités JSX).
Elles ne sont pas corrigées dans ce changement de navigation.

### Relancer les tests montés

Ouvrir un serveur Expo de développement et un Chromium dédié avec un port de
debugging distant. Le navigateur de test crée un contexte isolé, puis le ferme.
Exemple PowerShell, en adaptant le chemin de Chrome :

```powershell
npx expo start --port 8085 --clear
# Dans un autre terminal :
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -WindowStyle Hidden -ArgumentList '--headless=new','--remote-debugging-port=9224','--user-data-dir=D:\k-app\dist\navigation-audit\chrome'
$env:KAPP_NAV_TEST_URL = 'http://127.0.0.1:8085'
npm run test:navigation:browser
```

Pour le test natif, ouvrir l'application sur un **appareil de test** connecté à
Metro, avec React DevTools disponible, et fermer son menu de développement
avant de lancer la suite. Le script attend le chargement des polices et du
navigateur racine, puis prépare le marqueur local
d'onboarding de cet appareil de test et navigue vers le hub. Il ne faut pas le
pointer sur une session personnelle en cours.

```powershell
$env:KAPP_NATIVE_TEST_URL = 'http://127.0.0.1:8085'
$env:KAPP_NATIVE_TEST_APP_ID = 'com.arben60.kapp' # host.exp.exponent pour Expo Go
npm run test:navigation:native
```

## Confirmation restant obligatoire sur téléphone

Après récupération du commit :

```powershell
git pull origin main
$env:EXPO_PUBLIC_DEBUG_OAUTH_NAV = '1'
npm run dev-client:clear
```

Ouvrir le development build sur ce serveur Metro. Le correctif est JavaScript ;
la version de React Native et le code natif ne sont pas mis à niveau.

1. En invité, ouvrir Vocabulaire depuis sa carte, puis Premiers pas ; revenir au
   module puis au hub et recommencer plusieurs fois, y compris rapidement.
2. Faire de même avec Comptage puis Nombres de base.
3. Répéter en japonais, et après un changement de langue sans redémarrage.
4. Vérifier quelques lectures des MP3 coréens et les retours Android physiques.
5. Avec un compte Google déjà connecté, refaire ces parcours sans modifier le
   système d'authentification ; vérifier aussi Hangul et Écoute.

Si le retour immédiat persiste, relever `hub.openSequence`,
`navigation.snapshot` (avec `routeChain`), `content.scope` et une éventuelle
erreur native. Une destination atteinte suivie d'une erreur de rendu se distingue
ainsi d'une redirection ou d'une perte de pile, sans enregistrer d'URL OAuth.
