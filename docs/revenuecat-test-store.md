# RevenueCat Test Store sur Android

Cette configuration prépare les essais sur téléphone. Les tests automatisés
utilisent un SDK simulé : ils ne prouvent ni l'ouverture de la fenêtre native,
ni un achat effectué sur appareil. La recette ci-dessous reste à exécuter.

## Configuration

- Profil EAS : `iapTest`, development client, distribution interne, APK **debug**.
- `KAPP_BUILD_PROFILE=iapTest` : marqueur explicite utilisable aussi par EAS CLI localement.
- `EXPO_PUBLIC_DEV_UNLOCK_ALL=0`
- `EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS=0`
- `EXPO_PUBLIC_ENABLE_NATIVE_IAP=1`
- `EXPO_PUBLIC_REVENUECAT_STORE=test`
- Produits Test Store : `monthly` et `yearly`, dans l'offering `default`, tous
  deux associés à l'entitlement `premium_all_access`.
- Clé : `EXPO_PUBLIC_REVENUECAT_TEST_KEY`, dans le `.env` local ignoré par Git.
  Renseigner sa valeur uniquement dans ce fichier, jamais dans une commande,
  un log, une capture ou un fichier versionné. Ne pas modifier les clés de plateforme.

`app.config.js` expose la clé au development client uniquement lorsque le profil
`iapTest` et la sélection `test` concordent. Une sélection incohérente ou un bypass
activé interrompt la résolution de configuration. Le client refuse Test Store
en JS release, une clé absente ou de mauvais type, sans repli vers Google Play.
La clé Test Store n'est référencée par aucune expression `EXPO_PUBLIC` du code
client : elle n'est donc pas injectée dans les bundles des autres profils.
Comme toute clé SDK publique, elle reste lisible dans la configuration du build
de test ; ne pas publier un dump de `expo config` pour ce profil.

La clé n'a pas besoin d'être envoyée à EAS pour construire cet APK debug : Metro
la charge localement au lancement. Ne pas la définir dans l'environnement EAS
de production. Si elle est déjà définie dans un environnement EAS distant,
la configuration des profils hors `iapTest` ne l'ajoute pas au manifeste public.

Les profils `production` et `closedTest` restent inchangés. En production, les
clés de plateforme, l'offering courant, les produits `kapp_premium_monthly` et
`kapp_premium_yearly`, et la politique d'entitlement RevenueCat sont conservés.

## Construire, installer, lancer (PowerShell, depuis D:\k-app)

Après connexion au compte Expo approprié :

```powershell
npx eas-cli@latest build --platform android --profile iapTest
```

Télécharger l'APK depuis le lien retourné par EAS et le sauvegarder sous
`D:\k-app\.expo\kapp-iapTest.apk` (dossier ignoré par Git). Brancher le téléphone, activer le débogage USB et
autoriser cet ordinateur, puis (Android SDK Platform-Tools / `adb` requis) :

```powershell
adb devices
adb install -r .\.expo\kapp-iapTest.apk
npm run dev-client:iapTest
```

Ouvrir le development client installé et scanner le QR code de Metro. Le téléphone
et le PC doivent pouvoir communiquer sur le réseau. Si nécessaire, lancer
`npm run dev-client:iapTest -- --tunnel` à la place. Expo Go ne valide pas le parcours
natif demandé. En cas de problème d'ouverture automatique, ouvrir le development
client manuellement et saisir l'adresse Metro affichée.

Le lanceur applique les variables du profil EAS au serveur Metro local et vide
son cache. Un simple `npm run dev-client` ne sélectionne pas le profil `iapTest`.
Il ne modifie pas `.env` ni l'environnement des autres terminaux.

L'identifiant Android reste `com.arben60.kapp`. Une application déjà installée
avec une autre signature peut empêcher `adb install -r` ; ne pas la désinstaller
sans avoir préservé ses données. On peut aussi installer l'APK directement depuis
le lien EAS sur le téléphone. Ne pas envoyer cet APK sur une piste Google Play.

## Recette sur téléphone — non exécutée par les tests locaux

Utiliser une identité de test dédiée, sans entitlement Premium existant. Conserver
la même identité RevenueCat pour la restauration. Les données Test Store sont
visibles en sandbox dans RevenueCat ; ne pas réutiliser un compte client réel.
Vérifier dans RevenueCat que les réglages « Sandbox Testing Access » autorisent
les entitlements pour cette identité.

| Étape | Action | Résultat attendu |
| --- | --- | --- |
| 1 | Ouvrir un contenu Premium verrouillé, par exemple le vocabulaire K-drama | Paywall existant affiché ; contenu inaccessible |
| 2 | Choisir la formule mensuelle | Formule `monthly` sélectionnée, prix fourni par Test Store |
| 3 | Appuyer sur le bouton d'abonnement | Fenêtre **RevenueCat Test Store**, produit `monthly` ; aucun paiement Google Play |
| 4 | Choisir la réussite fictive | Achat sandbox visible dans RevenueCat |
| 5 | Contrôler l'identité de test dans RevenueCat | `premium_all_access` actif ; un simple achat sans cet entitlement ne suffit pas |
| 6 | Revenir au contenu Premium | Paywall fermé et accès autorisé ; vérifier aussi après relancement |
| 7 | Avec une identité sans Premium, annuler volontairement un achat | Paywall conservé, pas d'erreur d'annulation affichée, contenu verrouillé |
| 8 | Avec une identité sans Premium, simuler l'échec dans la fenêtre RevenueCat | Erreur existante affichée, aucun déverrouillage ; un nouvel essai reste possible |
| 9 | Restaurer avec la même identité possédant un abonnement actif, puis avec une identité sans achat | Accès accordé uniquement pour l'entitlement actif ; absence d'achat signalée sinon |
| 10 | Attendre l'expiration effective dans RevenueCat | Contenu de nouveau verrouillé ; tester app ouverte, retour d'arrière-plan, relancement et restauration après expiration |

Rejouer également la sélection/confirmation avec `yearly`. Pour annulation et refus,
un utilisateur déjà Premium doit conserver son entitlement existant : tester un
utilisateur sans accès permet de vérifier qu'aucun accès nouveau n'est accordé.

Les renouvellements sont accélérés : selon la documentation RevenueCat, le mensuel
se renouvelle toutes les 5 minutes, avec fin annoncée vers 25 minutes ; l'annuel
toutes les heures, avec fin annoncée vers 5 heures. Attendre que l'entitlement soit
réellement inactif dans RevenueCat. L'app invalide le cache Test Store au chargement,
au retour au premier plan et à l'échéance connue. Elle retire l'accès Test Store
à cette échéance tant qu'un entitlement renouvelé n'a pas été récupéré, y compris
hors ligne. Cette règle stricte de test ne change pas les périodes de grâce de production.

## Vérifications locales

```powershell
npm run test:premium
npm run test:premium-localization
npx tsc --noEmit
```

Les tests couvrent la séparation des profils et des clés, le choix des produits,
les transitions du fournisseur avec SDK simulé, la navigation vers le paywall,
l'annulation, le refus, la restauration et l'expiration. Ils ne contactent pas
RevenueCat, n'utilisent aucune clé réelle et ne remplacent pas cette recette.

Validation locale du 11 novembre 2026 : 29 tests Premium réussis, lint ciblé
réussi, résolution réelle de la configuration Expo `iapTest` réussie (sans
afficher la clé). Un export JavaScript Android de production avec des clés
factices contient la clé Google Play factice et aucune clé Test Store factice.
Cet export n'est pas un APK et ne valide pas une transaction Google Play.

Deux limites préexistantes restent présentes : `tsc --noEmit` signale deux
erreurs TS2532 dans `lib/i18n/immersionText.ts:225`, identiques avant et après
les changements ; le test de localisation Premium s'arrête sur l'import sans
extension `./instance` de `lib/i18n/premiumText.ts` (`ERR_MODULE_NOT_FOUND`).
Aucune modification de ces fichiers n'a été effectuée.

Sources : [RevenueCat Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store),
[installation APK sur un appareil](https://docs.expo.dev/build-reference/apk/),
[variables Expo](https://docs.expo.dev/guides/environment-variables/).
