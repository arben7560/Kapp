# Audit OAuth, Account et navigation — 6 novembre 2026

## Conclusion et niveau de preuve

Plusieurs défauts du parcours sont reproduits par des tests exécutant le code
du dépôt. Ils sont corrigés et protégés par des régressions. **La reproduction
complète sur Android du retour systématique des deux hubs gratuits n’a pas été
effectuée dans cet environnement. Il serait donc incorrect d’affirmer que sa
cause unique ou sa résolution définitive sont démontrées.**

Les tests ne se connectent pas à Google ni à un projet Supabase réel. Aucun
identifiant, paramètre de production ou catalogue de traduction n’est modifié.

## Diagnostic établi avant les corrections

| Code responsable | Preuve reproductible avec le code initial | Conséquence |
| --- | --- | --- |
| `AuthProvider.runOAuth` attendait d’abord `openAuthSessionAsync` et n’examinait `attempt.callback` qu’immédiatement après | Le navigateur renvoie `dismiss`, puis Linking livre le callback 10 ms après : résultat `cancelled`, attendu `success` | Faux état d’annulation sur Android ; l’auth peut continuer après le retour de l’appelant |
| `applyAuthUrlOnce` utilisait l’URL complète comme clé | Même code PKCE livré avec paramètres réordonnés : **2 échanges**, attendu **1** | Un code à usage unique peut être consommé deux fois ; un échec peut suivre une session pourtant installée |
| `runOAuth` dépendait du résultat navigateur même quand Linking avait reçu et validé le callback | Callback livré ; promesse navigateur non résolue : la connexion reste en attente | Chargement Account bloqué malgré un callback exploitable |
| `SubscriptionAccessGuard` retournait seulement un chargement à la place de `children` | Sur `/voc/kdrama` avec entitlement en attente, le sous-arbre retourné ne contient plus le navigateur racine | Le navigateur est retiré avant sa redirection vers Premium ; son état peut être perdu |
| Aucun `+native-intent` ne filtrait le callback | Le véritable `Linking.subscribe` d’Expo Router 58.0.29 transmet l’URL OAuth brute à son listener de navigation | Une opération d’auth est aussi traitée comme une navigation, avec ses paramètres sensibles |

Les trois premières régressions ont été exécutées avant modification et ont
échoué. Le test du guard a également échoué avant sa correction. Tous passent
avec le correctif.

`AccountScreen.continueWithProvider` conservait aussi sa notice uniquement en
state local : une instance remontée n’avait pas le résultat de l’appel précédent.
Le callback de démarrage n’effectuait pas la même vérification serveur que le
parcours lancé depuis le bouton. Enfin, `initialize` pouvait appliquer le résultat
d’une lecture de session devenue obsolète après un événement Auth plus récent.

## Ce qui provoquait, ou pouvait provoquer, le retour au hub

Les boutons du hub appellent bien `router.push('/voc')` et
`router.push('/comptage')`. Les deux pages d’accueil ne contiennent pas de
redirection automatique au hub. Les layouts de ces modules ne font que fournir
le contexte de traduction autour de `Slot`.

Les redirections globales examinées sont :

- `ReleaseRouteGuard` : vers `/` pour des routes explicitement masquées ; `/voc`
  et `/comptage` ne figurent pas dans cette liste.
- `SubscriptionAccessGuard` : vers `/premium` pour les cours Premium ; les deux
  hubs gratuits n’en font pas partie.
- Les guards d’onboarding : vers `/onboarding`, avec exception pour les callbacks
  d’auth connus.
- L’écran historique `account/callback` : vers `/account`. Le callback généré
  actuellement cible `/account`, pas cet écran.

Le retrait du navigateur par le guard Premium est un mécanisme concret de perte
d’état. Le traitement du callback par le listener du routeur ajoute une mutation
de navigation indépendante de l’échange Auth. **Aucun test ici ne démontre que
l’un d’eux explique, à lui seul, le symptôme exact sur les deux hubs gratuits.**
La trace Android ci-dessous doit établir si la destination est atteinte, puis
quittée, ou si son navigateur est remonté sur une autre route.

## Parcours après correction

1. Account demande une connexion Google standard, ou une liaison Apple invitée.
2. AuthProvider réserve une tentative et sauvegarde la progression invitée avant
   Google. L’échec de cette sauvegarde ne supprime pas le snapshot local.
3. Supabase crée l’URL d’autorisation avec le callback `kapp://account?action=…`.
   Le navigateur utilise toujours `kapp://account` comme préfixe de retour.
4. Linking, l’URL initiale et le résultat navigateur passent par `handleAuthUrl`.
   La clé de déduplication est le code ou la paire de jetons, indépendamment de
   l’ordre des paramètres. Le cache appartient au provider ; un replay d’une
   tentative précédente ne valide pas une reconnexion.
5. Le retour natif à chaud ne déclenche aucune navigation du routeur. À froid,
   le routeur reçoit seulement `/account?action=…` ; AuthProvider lit séparément
   l’URL originale pour l’échange PKCE.
6. Le callback doit produire une session non anonyme ; `getUser` doit confirmer
   le même UID et le fournisseur demandé. Une liaison Apple vérifie aussi l’UID
   invité attendu lorsque la tentative est encore en mémoire.
7. Les événements SDK permanents pendant cette validation ne publient pas
   prématurément le nouvel UID. Le contexte publie ensuite la session vérifiée
   et un résultat durable ; Account affiche l’email, le fournisseur et la notice.
8. La synchronisation fusionne la progression vers le nouvel UID. Aucun appel
   Auth n’altère la langue ni les identifiants pédagogiques.

Les délais sont : 1,5 seconde pour laisser arriver un événement natif après
`dismiss`, 20 secondes pour une requête HTTP Auth, 30 secondes pour une opération
de préparation/validation, cinq minutes pour l’attente navigateur/callback.
Une validation déjà commencée reste attendue après la période de grâce. Un
callback encore plus tardif est vérifié et actualise Account indépendamment de
l’ancien appel du bouton. Les timers JavaScript peuvent être suspendus par Android.

Le navigateur racine reste monté sous le guard Premium. Un masque opaque bloque
les interactions et l’accessibilité du contenu en attente ; la politique
d’accès et la destination `/premium` sont conservées. Déconnexion, suppression
et nouvelle connexion ne peuvent pas concurrencer un callback en traitement.

## Périmètre des modifications

- `lib/AuthProvider.tsx` : coordination, vérification commune, état durable,
  protection contre les lectures de session obsolètes, délais et erreurs sûres.
- `lib/authCallback.ts` : clé de callback et identification du fournisseur.
- `lib/authFetch.ts`, `lib/supabase.ts` : interruption des requêtes HTTP Auth
  bloquées ; le comportement des appels REST de progression reste inchangé.
- `app/+native-intent.tsx` : séparation entre événement Auth et navigation.
- `app/account/index.tsx` : notices issues du contexte, erreurs visibles aussi
  pour un compte permanent, contrôles pendant la validation, protection après
  démontage de l’écran.
- `lib/authErrors.ts` : refus d’autorisation et session non vérifiée explicites.
- `lib/paywall/SubscriptionAccessGuard.tsx` : navigateur conservé sous le masque.
- Scripts de régression, leurs adaptateurs, `package.json` et documentation.

`authRedirects`, les réglages Google/Supabase, `app.json`, le store pédagogique,
les layouts des cours, les catalogues FR/JA et les audios restent inchangés.

## Vérifications automatisées

Résultats exécutés le 6 novembre 2026 :

| Commande | Résultat |
| --- | --- |
| `npm run test:oauth` | 26 réussis |
| `npm run test:auth-production` | 29 réussis, dont les 5 tests `test-auth-cloud` remis à jour |
| `npm run test:auth-sync` | 9 réussis |
| `npm run test:content-locale` | 10 réussis |
| `npm run test:premium` | 13 réussis |
| `npm run test:progress-cloud` | 8 réussis |
| `npx tsc --noEmit` | Réussi |
| ESLint sur les fichiers TypeScript/TSX et scripts modifiés | Réussi |

Total : **95 tests réussis, aucun échec**. Les avertissements Node sur l’absence
de `type: module` sont préexistants et n’empêchent pas l’exécution. Le script
historique `test-auth-cloud.mjs` référençait un export supprimé et d’anciens
contrats de validation ; il est aligné sur l’API actuelle et intégré à
`test:auth-production`.

L’export Android (`npx expo export --platform android --output-dir
dist/oauth-audit --max-workers 1 --no-bytecode`) a généré le bundle de 4 403
modules et ses assets, avec le message `Exported: dist/oauth-audit`. Le processus
CLI est resté actif après cet export dans l’environnement et a été interrompu ;
ce n’est donc pas une validation par code de sortie zéro du CLI ni un APK testé.
Les fichiers générés sous `dist/` sont ignorés par Git.

Les suites `test:oauth`, `test:auth-production`, `test:auth-sync` et
`test:content-locale` couvrent les transitions demandées : succès vérifié,
annulation, doublons, ordres de livraison, retour Android simulé, interruption,
changement d’UID, progression, langues et reconnexion. `test:premium` et
`test:progress-cloud` vérifient les contrats d’accès et de sauvegarde existants.

- OAuth : code réel d’AuthProvider avec adaptateurs de hooks, stockage, Linking,
  navigateur et Supabase ; contrôle du fournisseur, de l’email et du résultat.
- Navigation : arbre des routes découvert dans `app/` par Expo Router, véritable
  `Linking.subscribe`, parseur de chemins, résolveur de destinations et
  réducteurs Stack de la version installée. Le sous-arbre du guard
  est inspecté pour vérifier que le navigateur y reste présent.
- FR/JA : véritables ressources i18next et résolveurs Vocabulaire/Comptage,
  vérifiés avant et après les transitions.
- Synchronisation : véritable provider, service, fusion et archivage local,
  avec stockage et transport cloud simulés. L’invité suivant n’hérite pas de la
  progression privée ; la reconnexion retrouve l’archive et la progression cloud.

Ces adaptateurs ne montent pas les vues React Native et ne simulent pas le cycle
de vie natif complet. Le fait qu’une route soit sélectionnée par un réducteur
ne prouve pas, à lui seul, que son écran s’affiche correctement sur Android.

## Protocole Android restant obligatoire

Utiliser un development build ou une release contenant ce bundle ; Expo Go ne
valide pas le callback de production. `adb devices -l` ne détectait aucun appareil
connecté lors de l’audit. Pour les traces de développement :

```powershell
$env:EXPO_PUBLIC_DEBUG_OAUTH_NAV = "1"
npm run dev-client:clear
```

Pour **chaque ligne**, exécuter le scénario une fois en français et une fois en
japonais. Revenir au hub et ouvrir **Vocabulaire → Premiers pas**, puis
**Comptage → Base**, avant et après la transition.

| Scénario | Résultat à vérifier |
| --- | --- |
| Invité, application fraîchement lancée | Les deux modules s’affichent dans la langue choisie |
| Google nouveau compte puis compte existant | Email et fournisseur Google visibles ; réussite seulement après vérification ; progression fusionnée |
| Retour/fermeture du sélecteur, puis nouvelle tentative | Annulation reconnue ; boutons réutilisables ; modules accessibles |
| Autorisation refusée | Message explicite sans détail secret ; possibilité de réessayer |
| Réseau lent pendant le callback ; mise en arrière-plan puis retour | Pas de faux succès ni de session invitée substituée ; validation ou délai explicite |
| Mode avion pendant l’échange | Chargements libérés après reprise des timers ; progression locale conservée |
| Double livraison du même callback | Un seul `callback.exchange-code`, aucune navigation supplémentaire |
| Android « Ne pas conserver les activités », puis processus tué pendant Google | Retour à Account ; tentative de validation de l’URL initiale ; sinon message exploitable, jamais faux succès |
| Retour manuel dans l’application sans callback | Annulation/délai explicite ; réessai après fermeture de l’onglet navigateur |
| Compte Google puis déconnexion et reconnexion | Nouvel invité isolé ; progression du compte restaurée ; langue inchangée |
| Vérification Premium sur une route Premium | Masque et éventuelle page Premium, navigateur racine conservé |

Vérifier les traces sûres existantes : `hub.openSequence`,
`navigation.snapshot`, `diagnostics.mounted/unmounted`, `appstate`,
`callback.received`, `callback.exchange-code`, `callback.verified` et
`loading.released`. Ne jamais copier un callback brut, un code, un jeton ou
une session dans les logs. Si le retour au hub persiste, relever la route demandée,
la route obtenue et le changement éventuel de clé du navigateur. Ce constat est
nécessaire pour attribuer définitivement la redirection restante à son origine.

Vérifier séparément dans les consoles : Google activé dans Supabase, callback
Supabase exact autorisé dans Google Cloud, client Web renseigné et
`kapp://**` autorisé dans Supabase. Aucun accès à ces consoles n’est présumé.
Un redémarrage sans callback après une destruction totale du processus ne prouve
pas une authentification ; la connexion doit alors être relancée.

Références primaires : [traitement natif des liens Expo Router](https://docs.expo.dev/router/advanced/native-intent/),
[événements Auth Supabase](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).
Le listener Auth reste synchrone et n’attend aucun appel Supabase.
