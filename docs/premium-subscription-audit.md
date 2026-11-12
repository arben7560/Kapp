# Premium — audit et validation avant publication

Audit et correctif du 12 novembre 2026. Le commit source inclut les modifications Premium préexistantes autorisées par le propriétaire. Aucune publication d’application ni modification dans Google Play Console, Supabase ou RevenueCat.

## Correctif Account, connexion et résiliation

- Le choix Premium en invité ouvre le dialogue « Connexion nécessaire ». « Se connecter » appelle le parcours Google existant ; « Annuler » ferme le dialogue sans achat ni navigation. L’annulation OAuth efface l’intention en attente. Après succès, Account reprend la formule mensuelle/annuelle et la destination conservées ; une nouvelle confirmation manuelle reste obligatoire avant achat.
- Avec Premium actif, Account masque les boutons de restauration et d’actualisation. Un abonnement renouvelable propose « Résilier mon abonnement » et un dialogue Seoul Midnight Glass. La restauration explicite reste disponible sans Premium ; synchronisation, contrôle d’échéance et persistance SDK restent en place.
- « Continuer vers Google Play » ouvre l’abonnement exact, avec le produit RevenueCat existant et `com.arben60.kapp`. Aucune mutation locale du renouvellement ni des droits n’est effectuée. Les achats `TEST_STORE` ne proposent jamais cette action.
- Au retour, le fournisseur invalide le cache et relit CustomerInfo pour la même identité. Une lecture antérieure en vol est terminée avant cette vérification. Une réponse dont `requestDate` n’a pas avancé, une erreur réseau ou un changement de compte ne peut pas produire une confirmation verte.
- La confirmation requiert un accès encore actif, `willRenew=false` et une date `unsubscribeDetectedAt` valide. Le statut affiche « Résilié — accès Premium maintenu ». L’échéance vient des données SDK ; si elle manque, le texte le dit explicitement. Le prix affiché est uniquement le tarif courant du produit/base plan correspondant.
- Une résiliation non confirmée conserve les droits réels et affiche une invitation neutre à vérifier dans le Store. Après expiration effective, « Découvrir Premium » ouvre de nouveau le paywall avec retour sur Account.

Références vérifiées : [gestion officielle Google Play et lien produit/package](https://developer.android.com/google/play/billing/subscriptions), [CustomerInfo et droits RevenueCat](https://www.revenuecat.com/docs/customers/customer-info), [cache SDK](https://www.revenuecat.com/docs/test-and-launch/debugging/caching).

## Décision de publication

**Le code Premium a été corrigé et testé, mais Google Play Billing n’est pas encore validé sur appareil. La publication reste conditionnée aux opérations décrites ci-dessous.**

La configuration `.env` locale contient une clé publique Test Store, mais aucune clé publique RevenueCat Android/iOS. Aucune valeur de clé n’a été copiée dans ce rapport. Les variables distantes EAS et les consoles externes n’ont pas été consultées.

| Sujet | État à la livraison |
| --- | --- |
| Achats fictifs RevenueCat | Réussite déjà observée par le propriétaire dans Sandbox. Tests automatisés avec SDK simulé réussis ; aucune nouvelle transaction réelle effectuée pendant cet audit. |
| Invité → compte → choix conservé → confirmation | Implémenté ; navigation et absence d’achat automatique testées avec adaptateurs. Parcours natif et email/OAuth à revalider sur appareil. |
| Rattachement au compte | UUID Supabase, identification attendue et opérations sérialisées. Absence de fuite vérifiée dans les tests de concurrence ; historiques/alias distants à auditer. |
| Gestion/résiliation | Bouton Account et lien officiel implémentés. Aucune résiliation locale. Vérification du lien et de la résiliation effective à faire sur Google Play. |
| Expiration/grâce | Échéances réelles RevenueCat, contrôle au retour au premier plan et pendant la session. Tests réussis ; renouvellements accélérés et grâce Google à tester. |
| Google Play natif | **Non validé** : aucun appareil connecté, aucune transaction Google Play exécutée. |
| Publication | **En attente** : configuration des clés/produits/politique, reconstruction native, tests Google et résolution des vérifications globales restantes. |

## Diagnostic et corrections

| Constat initial | Cause | Correction / fichiers |
| --- | --- | --- |
| Achat possible en invité | `purchasePackage` sans vérification du compte Supabase | Garde dans le fournisseur, rejet des utilisateurs anonymes/nuls, authentification depuis `app/premium.tsx`. |
| Choix et contenu perdus après connexion | Aucun contexte de reprise persistant ; liens `/premium` sans destination | `lib/paywall/purchaseIntent.ts` : intention locale limitée à 24 h, formule, action et destination interne validée ; consommation sérialisée. Retour depuis Account, confirmation manuelle obligatoire. |
| Risque de droits du compte précédent | Identification et lecture concurrentes, erreurs d’identité ignorées, listener sans propriétaire | `PaywallProvider.tsx` : CustomerInfo associé à l’UUID et à une génération de session ; masquage immédiat au changement ; réponses anciennes ignorées. |
| Restauration implicite | `synchronizeRevenueCatIdentity` restaurait un achat anonyme après `logIn` | Suppression. Les mutations d’identité et de paiement partagent une file, y compris pendant un changement de compte. |
| Alias anonymes historiques | `logIn` peut fusionner un profil anonyme acheté avec un autre compte | Détection avant `logIn`, message de récupération ; au redémarrage connecté, configuration directe avec l’UUID. Les anciens achats ne sont pas supprimés. |
| Account incomplet | Gestion déjà présente mais sans dates/statuts détaillés, restauration absente | Section existante complétée, `SubscriptionDetails.tsx` et modèle `subscriptionDetails.ts`. |
| Expiration locale limitée au Test Store | Pas de contrôle de date en mode plateforme | Borne d’accès depuis les dates d’expiration/grâce réelles ; synchronisation périodique des abonnés et à l’échéance. Une erreur réseau n’efface pas des droits encore valides. |
| Bypass de production | `INTERNAL_PREMIUM_ACCESS=1` accepté hors développement | Les deux bypass sont désormais limités à `__DEV__`. Préparation de `closedTest` avec IAP natif, sans bypass ; contrôles dans `app.config.js`. |
| Distinction des formules Google fragile | Correspondance exacte ne couvrant pas `produit:base-plan` | Correspondance de produit/période ; refus des cas ambigus ; identifiants complets configurables par environnement. |
| `ui_config` | Régression du SDK Android embarqué par RN Purchases 10.6.0 | Mise à jour ciblée des deux paquets RevenueCat vers **10.7.2**, versions épinglées et lockfile mis à jour. |

Les changements dans les hubs vocabulaire/comptage/grammaire, les listes de missions et les écrans IA se limitent aux destinations de retour du paywall. Les critères pédagogiques, prérequis, évaluations et déroulés des missions restent identiques. Le retour à une mission sélectionnée rouvre son écran de préparation avant son lancement.

Le paywall et les composants de boutons/typographie existants sont conservés. Les nouvelles informations et actions sont traduites en français et japonais. Aucun deuxième système de paiement n’a été ajouté.

## Identités et politique de restauration : étape obligatoire

La politique RevenueCat s’applique aux restaurations **et à certains achats lorsqu’un reçu est déjà associé à un autre utilisateur**. Le SDK client ne permet pas de lire cette politique. Le comportement par défaut peut transférer les droits. Voir [Restore Behavior](https://www.revenuecat.com/docs/projects/restore-behavior).

Pour cette raison, les achats et restaurations du mode plateforme restent bloqués tant que la variable suivante n’atteste pas la vérification du projet :

```dotenv
EXPO_PUBLIC_REVENUECAT_ACCOUNT_POLICY=keep-original-verified
```

Cette variable **ne modifie pas RevenueCat** et ne prouve pas techniquement sa configuration distante. Elle doit être renseignée par le responsable du projet uniquement après les étapes suivantes. La consultation des droits existants et leur gestion restent disponibles sans cette attestation. Le profil Test Store permet les simulations sans cette variable.

1. Dans RevenueCat, relever la politique actuelle dans Project settings → General → Restore Behavior, ainsi que l’éventuelle politique distincte Sandbox.
2. Inventorier les profils `$RCAnonymousID:…`, les UUID Supabase, leurs alias et les événements TRANSFER. Comparer des comptes Premium, des comptes gratuits et les anciens achats invités. `originalAppUserId` peut rester anonyme après un alias légitime : ce champ seul ne suffit pas à vérifier le compte courant.
3. Évaluer l’impact sur **toutes les applications du projet** avant un changement. La règle demandée par K-App correspond à « Keep with original App User ID » entre comptes identifiés. Ne pas basculer une politique historique partagée sans plan de récupération des utilisateurs concernés.
4. Préparer l’assistance pour les anciens achats anonymes : vérifier le reçu, l’identité et les alias avant récupération. La politique stricte n’empêche pas l’alias d’un reçu encore anonyme lors d’une restauration explicite. Ne pas créer de comptes supplémentaires pour contourner une erreur de propriété.
5. Vérifier aussi les options de création de clients via notifications Google. Ne pas associer une méthode de détection d’App User ID incompatible avec la politique stricte ; consulter [les notifications Google RevenueCat](https://www.revenuecat.com/docs/platform-resources/server-notifications/google-server-notifications).
6. Tester A Premium → déconnexion → B gratuit → restauration sur le même compte Google : B doit rester gratuit, avec un message de compte propriétaire. A doit retrouver son accès sans nouvel achat.
7. Après vérification, définir l’attestation dans les environnements EAS `preview` et `production` concernés, puis reconstruire le binaire.

Les alias déjà présents côté serveur ne peuvent pas être dissociés par cette correction mobile. Leur traitement reste une opération de support/migration RevenueCat, avec vérification du propriétaire. Aucune politique distante n’a été modifiée pendant cet audit.

## Interprétation des abonnements

- L’accès requiert `premium_all_access` actif pour l’identité courante, dans le bon environnement. Un simple produit acheté, une opération réussie ou un cache local de progression ne débloque pas le Premium.
- `TEST_STORE` est distinct de `PLAY_STORE`. Un achat Google de test demeure un achat `PLAY_STORE` avec indicateur Sandbox ; il est gérable dans Google Play. Les achats Test Store n’affichent aucun bouton de résiliation Google.
- La formule/prix viennent du produit courant correspondant au produit **et au base plan**. Le prix est explicitement présenté comme « Tarif actuel du Store » : le SDK ne garantit pas le montant historique facturé à un abonné bénéficiant d’un ancien tarif. Les informations indisponibles restent absentes.
- La résiliation est reconnue à partir du renouvellement désactivé et du signal de désabonnement. Elle ne coupe pas l’accès avant son terme. Un prépaiement ou un droit à vie n’est pas automatiquement qualifié de résiliation.
- Essai, grâce, incident de facturation et suspension utilisent respectivement `periodType`, `gracePeriodExpiresDate`, les indicateurs de facturation et `autoResumeDate`. Aucun état de grâce/suspension n’est déduit d’une seule erreur réseau.
- À une échéance connue, une synchronisation est demandée. Sans prolongation ou grâce confirmée, l’application ne prolonge pas artificiellement l’accès ; un état SDK encore actif mais dépassé est présenté comme « Statut à vérifier ». Une coupure réseau avant une échéance valide conserve l’accès du même compte.
- Les abonnés/historiques sont vérifiés au plus toutes les 60 secondes pendant une session active, ainsi qu’au retour dans l’application. RevenueCat ne pousse pas spontanément les changements du serveur au SDK : voir [CustomerInfo](https://www.revenuecat.com/docs/customers/customer-info).
- `CustomerInfo.managementURL` est prioritaire. En son absence, repli Google officiel avec SKU et `com.arben60.kapp`, ou gestion Apple pour un abonnement Apple. Aucun bouton ne modifie localement les droits.

## Erreur native `ui_config`

Versions constatées avant intervention : Expo **58.0.22**, React Native **0.88.1**, `react-native-purchases` et `react-native-purchases-ui` **10.6.0**, hybrid-common **18.28.0**, Android Purchases **10.16.0**. Le paywall K-App utilise ses composants React Native ; aucun import de paywall RevenueCat UI n’a été trouvé.

Le message indiquant la poursuite sans `ui_config` correspond au [signalement RN 10.6.0 #1891](https://github.com/RevenueCat/react-native-purchases/issues/1891). Le problème se situe dans la préparation de configuration UI native ; la référence JavaScript du log n’est pas, à elle seule, une erreur de catalogue ou d’enregistrement des achats.

Les versions Android [10.16.1](https://github.com/RevenueCat/purchases-android/releases/tag/10.16.1) et [10.16.2](https://github.com/RevenueCat/purchases-android/releases/tag/10.16.2) corrigent le traitement des projets sans configuration de paywall et les avertissements correspondants. [RN Purchases 10.7.2](https://github.com/RevenueCat/react-native-purchases/releases/tag/10.7.2) embarque hybrid-common **18.31.0**, Android **10.17.0** et Google Billing **8.3.0**, incluant ces corrections. Les deux paquets RN sont alignés sur cette version.

Les erreurs n’ont pas été masquées par une suppression de logs. La configuration native existante (permission BILLING, plugin Android, `singleTop` en IAP) est conservée. **Une mise à jour Metro/OTA seule ne remplace pas le SDK natif : reconstruire et réinstaller le développement client et la build Play.** La disparition effective du log doit encore être observée sur ce nouveau binaire ; le fonctionnement natif complet n’a pas été prétendu validé.

## Validations exécutées

| Vérification | Résultat |
| --- | --- |
| Premium, configuration Test Store, cycle d’abonnement, concurrence, navigation après authentification | **55 tests réussis** avec SDK et vues adaptés/simulés, incluant mensuel/annuel, annulation OAuth, dialogues Account, retour Google, cache ancien et erreur réseau. |
| Localisation Premium/Account et navigation OAuth | **17 tests réussis**. |
| Authentification, synchronisation, contrats cloud et OAuth existants | **64 tests réussis**. Une ancienne assertion de texte brut du profil a été adaptée à sa localisation déjà existante. |
| Total de la commande de validation regroupée | **136 réussis, 0 échec, 0 ignoré**. |
| ESLint sur `app/premium.tsx`, `app/account/index.tsx`, `lib/paywall`, les deux services RevenueCat et `SubscriptionDetails.tsx` | Réussi, aucun avertissement. |
| Export Android, compilation Hermes | `npx expo export --platform android --output-dir .premium-export` réussi sur le correctif final, configuration locale chargée. Les fichiers générés ne sont pas inclus dans le commit. L’export ne valide ni la facturation Google ni une compilation Gradle/APK. |
| `git diff --check` | Réussi. |
| TypeScript global, `npx tsc --noEmit` | Échec sur **2 erreurs préexistantes** `lib/i18n/immersionText.ts:225` (valeurs potentiellement indéfinies). Ce fichier est inchangé. |
| Vérification globale `npm run validate:ui` | **52 signalements préexistants**, identiques à ceux d’une extraction du commit `4acadf1` après normalisation des numéros de ligne. Aucun nouveau signalement. |
| `npm run validate:i18n` | Réussi : 15 namespaces vérifiés ; 6 autres restent explicitement différés pour la version japonaise complète. |
| Lint étendu aux écrans pédagogiques touchés uniquement pour les liens | Signale aussi une apostrophe JSX préexistante dans `grammar/[stageId].tsx` et une constante inutilisée dans le hub grammaire. |
| Achat natif, renouvellement/résiliation Google, redémarrage natif et visuel Android téléphone/tablette | Non exécutés pendant ce correctif ; aucune session Google Play ni appareil de test disponible via les outils utilisés. |

La suite de tests utilise des adaptateurs de hooks et du SDK. Elle vérifie les embranchements et les protections de concurrence ; elle ne reproduit ni le moteur de rendu natif, ni Supabase distant, ni Google Play. L’adaptateur de tests i18n résout maintenant les imports TypeScript sans extension comme Metro, et ajoute les attributs JSON requis par Node.

Commande regroupée :

```powershell
node --test --test-isolation=none --experimental-strip-types scripts/test-premium.mjs scripts/test-revenuecat-test-store.mjs scripts/test-premium-lifecycle.mjs scripts/test-premium-localization.mjs scripts/test-account-localization.mjs scripts/test-oauth-navigation.mjs scripts/test-auth-sync.mjs scripts/test-auth-production.mjs scripts/test-auth-cloud.mjs scripts/test-oauth-flow.mjs
```

## Google Play / RevenueCat : préparation manuelle

1. Vérifier l’application Google Play `com.arben60.kapp`, la signature et son association à l’application Android RevenueCat.
2. Activer les abonnements mensuel et annuel, leurs base plans, disponibilités géographiques, prix et éventuelles offres d’essai. Les périodes attendues sont `P1M` et `P1Y`.
3. Importer/associer les produits dans RevenueCat ; rattacher les deux à `premium_all_access`. Dans l’offering **courant**, associer les packages mensuel/annuel aux bons produits. Le Test Store utilise séparément l’offering `default` et les produits `monthly`/`yearly`.
4. Les valeurs par défaut plateforme sont `kapp_premium_monthly` et `kapp_premium_yearly`. Si la console utilise d’autres identifiants ou plusieurs base plans, renseigner `EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID` et `EXPO_PUBLIC_REVENUECAT_YEARLY_PRODUCT_ID`, éventuellement en format `produit:base-plan`. Ne pas renommer des produits déjà vendus pour satisfaire le code.
5. Vérifier les autorisations du compte de service Google dans RevenueCat et les notifications serveur. Les secrets de compte de service restent dans les consoles, jamais dans `EXPO_PUBLIC_*` ni dans le dépôt.
6. Renseigner **la clé publique SDK Android RevenueCat `goog_…`** dans `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`, dans l’environnement EAS utilisé. Ne pas utiliser une clé `test_…`, une clé secrète RevenueCat ou le JSON du compte de service. L’iOS nécessite séparément une clé `appl_…`.
7. Terminer l’audit de politique décrit plus haut, puis renseigner `EXPO_PUBLIC_REVENUECAT_ACCOUNT_POLICY=keep-original-verified`. Tant que cette étape n’est pas effectuée, l’app bloque explicitement les nouvelles mutations plateforme.
8. Construire un nouvel AAB via `eas build --platform android --profile closedTest`. Ce profil utilise l’environnement EAS `preview`, IAP activé et aucun bypass. Distribuer sur une piste interne/fermée de Google Play ; le nom local du profil ne détermine pas la piste Console.
9. Ajouter les comptes Google aux **testeurs de licence** et à la piste concernée. Accepter le lien de participation et installer depuis Play avec le compte testeur. Vérifier le compte affiché dans la feuille de paiement.
10. Le profil `iapTest` reste un développement client séparé pour les achats fictifs. Après reconstruction, `npm run dev-client:iapTest` démarre son environnement Metro. Ne pas utiliser ce profil pour valider Google Billing.

Procédure officielle de test : [Google Play Billing](https://developer.android.com/google/play/billing/test). Le test de licence utilise le vrai flux natif avec moyens de paiement de test. La durée accélérée dépend de la période/du scénario et peut être pilotée avec Play Billing Lab ; attendre les dates réellement retournées par RevenueCat, sans les recalculer arbitrairement.

## Recette sur appareil à signer avant publication

Pour chaque essai, relever la version/build, le compte K-App/UUID et le compte Google de test dans un registre privé, l’environnement/store RevenueCat, le produit/base plan, l’entitlement, les dates et le résultat. Ne pas mettre de token d’achat ou d’identifiant personnel dans des captures publiques.

| Scénarios demandés | Procédure / résultat attendu |
| --- | --- |
| 1–7 : gratuit, paywall invité, connexion/création | Ouvrir un contenu gratuit puis Premium ; choisir mensuel puis refaire en annuel. Authentifier par email et OAuth, y compris retour de validation email et redémarrage. Retrouver la formule et la destination ; aucune feuille de paiement avant un nouveau clic. |
| 8–9 : simulations Test Store | Sur le nouveau client `iapTest`, achat mensuel puis annuel avec deux comptes propres. Observer Sandbox, UUID et `store=TEST_STORE`. Ne pas les chercher dans les ventes de production. |
| 10–14 : annulation/échec/succès/double achat | Sur la build Play, ouvrir la feuille Google native ; annuler, refuser, mettre en attente puis réussir avec les moyens de test. Aucun accès sur annulation/refus/en attente. Après confirmation de l’entitlement, ouvrir le contenu demandé. Un compte déjà Premium propose Continuer, sans rachat. |
| 15–18 : déconnexion, reconnexion, autre compte, restauration | A Premium → déconnexion → invité verrouillé → B gratuit → restauration refusée si propriété A → A retrouve ses droits. Réinstaller ou utiliser un second appareil et le même compte K-App/Google. Restaurer explicitement ; vérifier les messages aucun achat, expiré et erreur réseau. |
| 19–21 : résiliation et expiration | Depuis Account, ouvrir Google Play, résilier. Revenir : renouvellement désactivé, accès maintenu jusqu’à la date RevenueCat. Attendre l’échéance accélérée ; vérifier le verrouillage des contenus et l’absence de renouvellement. |
| 22 : réseau | Couper le réseau avant une échéance valide : ne pas afficher Expiré par simple erreur réseau. Vérifier aussi l’échéance dépassée sans confirmation et la récupération après reconnexion. |
| 23 : fermeture complète | Forcer l’arrêt puis relancer avec A et avec B, séparément. Aucun flash Premium de l’autre compte ; droits du compte courant après synchronisation. |
| 24–28 : contrôle RevenueCat | Vérifier UUID, entitlement exact, historique cohérent, mensuel/annuel, dates et store. Inspecter les alias/TRANSFERS ; aucun rattachement automatique à un autre compte identifié. |
| États complémentaires | Avec Play Billing Lab/console, vérifier essai, grâce, problème de paiement, suspension/reprise et renouvellements accélérés. Contrôler Account puis les contenus. |
| Visuel/régression | Petit/grand téléphone et tablette Android, français/japonais, grand texte : libellés longs, dates, boutons et défilement. Vérifier les animations, les contenus gratuits et les écrans de préparation des missions. |

Ne déclarer Google Play validé qu’après observation de sa feuille native, de l’achat sur le compte testeur et des événements/entitlements `PLAY_STORE` correspondants. Une simulation « Test Valid Purchase » ne remplit pas ce critère.

## Fichiers et limites du périmètre

- Identité/configuration : `services/revenueCat.ts`, `services/revenueCatIdentity.ts`, `lib/paywall/config.ts`, `app.config.js`, `eas.json`, `.env.example`, dépendances et lockfile.
- Droits/états/navigation : fournisseur, logique RevenueCat, modèle d’abonnement, intention d’achat, garde Premium et helper d’accès dans `lib/paywall/`.
- Interface : `app/premium.tsx`, `app/account/index.tsx`, `components/premium/SubscriptionDetails.tsx`, catalogues `locales/fr` et `locales/ja` pour Premium/Account.
- Destinations : hubs vocabulaire/comptage/grammaire, leçon grammaire, quatre listes de missions et quatre écrans IA ; modifications limitées aux liens et au retour de sélection.
- Tests : suites Premium et nouvelle suite lifecycle, tests de localisation/navigation, assertion d’authentification et adaptateurs de hooks/imports.

Les changements locaux présents au départ dans `services/revenueCat.ts`, le lanceur `scripts/start-iap-test.cjs`, ses tests et `docs/revenuecat-test-store.md` ont été préservés. Le lanceur et cette documentation préexistante n’ont pas été remplacés.

Les protections décrites sécurisent les flux de l’application et leur association d’identité. Elles ne constituent pas une autorisation serveur pour de futures API payantes : ces API devraient vérifier leurs propres droits côté serveur. Aucun nouveau backend ou mécanisme de paiement n’a été introduit.

## Liste exacte des fichiers du correctif

- `.env.example`
- `app.config.js`
- `app/(tabs)/comptage/index.tsx`
- `app/(tabs)/grammar/[stageId].tsx`
- `app/(tabs)/grammar/index.tsx`
- `app/(tabs)/voc/index.tsx`
- `app/account/index.tsx`
- `app/lesson/aeroportIA.tsx`
- `app/lesson/aeroportMissions.tsx`
- `app/lesson/cafeIA.tsx`
- `app/lesson/cafeMissions.tsx`
- `app/lesson/metroIA.tsx`
- `app/lesson/metroMissions.tsx`
- `app/lesson/restaurantIA.tsx`
- `app/lesson/restaurantMissions.tsx`
- `app/premium.tsx`
- `components/premium/SubscriptionDetails.tsx`
- `docs/premium-subscription-audit.md`
- `docs/revenuecat-test-store.md`
- `eas.json`
- `lib/paywall/PaywallProvider.tsx`
- `lib/paywall/SubscriptionAccessGuard.tsx`
- `lib/paywall/access.tsx`
- `lib/paywall/config.ts`
- `lib/paywall/purchaseIntent.ts`
- `lib/paywall/revenueCatLogic.ts`
- `lib/paywall/subscriptionDetails.ts`
- `lib/paywall/types.ts`
- `locales/fr/account.json`
- `locales/fr/premium.json`
- `locales/ja/account.json`
- `locales/ja/premium.json`
- `package-lock.json`
- `package.json`
- `scripts/helpers/hook-harness.mjs`
- `scripts/i18n-node-loader.mjs`
- `scripts/start-iap-test.cjs`
- `scripts/test-account-localization.mjs`
- `scripts/test-auth-sync.mjs`
- `scripts/test-oauth-navigation.mjs`
- `scripts/test-premium-lifecycle.mjs`
- `scripts/test-premium-localization.mjs`
- `scripts/test-premium.mjs`
- `scripts/test-revenuecat-test-store.mjs`
- `services/revenueCat.ts`
- `services/revenueCatIdentity.ts`
