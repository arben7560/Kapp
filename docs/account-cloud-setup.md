# K-App — Authentification et progression cloud

## Architecture exécutée dans l’application

K-App reste local-first. Une action pédagogique met d’abord à jour le contexte
React puis AsyncStorage. Le service `services/progressSync.ts` observe ensuite
les écritures pertinentes, les regroupe pendant 2,5 secondes et réconcilie le
document local avec `public.user_progress`.

Les couches ont les responsabilités suivantes :

- runtime (`StoreProvider` et `DailyStreakProvider`) : état affiché ;
- AsyncStorage : autorité immédiate et hors ligne ;
- `progressSync` : seule couche autorisée à lire/écrire la progression Supabase ;
- Supabase : sauvegarde distante récupérable pour un compte permanent ;
- RevenueCat : seule autorité pour Premium et les abonnements.

Une erreur cloud ne réinitialise jamais les stores. Le service conserve l’état
`pending`, `offline` ou `error`, puis réessaie avec un backoff et au retour au
premier plan.

## Données synchronisées

Le document JSON versionné (`schema_version: 2`) contient :

- progression pédagogique centrale : piste active, XP, complétions,
  progression séquentielle de tous les modules ;
- Hangul : scènes, découverte, maîtrise, scores, erreurs, assessment et reprise
  de quiz ;
- Grammaire : concepts, jalons, critères, SRS, scores, sessions terminées et
  session active ;
- complétions Vocabulaire, Comptage, Listen, Classificateurs et immersions IA,
  toutes déjà représentées par les IDs du store central ;
- streak quotidien, activités, freezes et badges ;
- contexte de reprise du Hub.

Sont exclus : onboarding, flags de modales, état des paywalls, caches média,
états visuels temporaires, erreurs techniques, session Supabase et entitlement
Premium.

## Fusion et migration

La première synchronisation lit toujours le local avant le cloud. Si la ligne
cloud n’existe pas, le document local est uploadé. L’upsert et la fusion sont
rejouables après crash sans doublon.

Les règles conservatrices sont :

- ensembles terminés/découverts/maîtrisés : union ;
- flags irréversibles : `true` conservé ;
- XP, niveau et meilleurs scores : maximum ;
- tentatives et compteurs non idempotents : maximum, jamais somme ;
- reprises : session la plus avancée, puis la plus récente quand nécessaire ;
- dates de dernière activité : plus récente ;
- streak : union des journées/activités, record maximum, état courant du jeu de
  données ayant la dernière journée ; aucune nouvelle règle métier inventée ;
- contexte de reprise : `updatedAt` le plus récent.

Un schéma cloud supérieur à celui compris par l’application n’est jamais
écrasé : la synchronisation passe en erreur et demande une mise à jour de
K-App.

## Configuration Supabase manuelle

1. Créer/sélectionner le projet Supabase.
2. Exécuter la migration
   `supabase/migrations/202608170001_user_progress.sql` avec la CLI ou le SQL
   Editor.
3. Dans **Authentication > Providers** :
   - activer Email ;
   - activer Anonymous Sign-Ins ;
   - activer Manual Linking, requis pour convertir le même utilisateur
     anonyme ;
   - conserver Confirm Email activé en production.
4. Dans **Authentication > URL Configuration**, autoriser au minimum :
   - `kapp://account/callback` ;
   - les URL `exp://.../--/account/callback` propres aux appareils de test si
     Expo Go est utilisé ;
   - l’URL HTTPS de preview éventuelle.
5. Vérifier que les templates de confirmation/changement d’email et de
   récupération respectent `RedirectTo`/`ConfirmationURL` afin de revenir vers
   le callback autorisé.
6. Déployer manuellement la fonction avec
   `supabase functions deploy delete-account`. Ne pas utiliser
   `--no-verify-jwt`.
7. Activer CAPTCHA/Turnstile pour la création anonyme en production et régler
   les limites Auth pour éviter la création automatisée de comptes anonymes.
8. Prévoir une politique de purge serveur des utilisateurs anonymes anciens
   si nécessaire ; ne jamais supprimer ceux qui ont une activité à conserver
   sans politique produit explicite.

Variables publiques Expo :

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key
```

`EXPO_PUBLIC_SUPABASE_ANON_KEY` reste accepté comme nom de transition. Aucune
clé `service_role` ne doit être ajoutée à Expo/EAS ; elle n’est utilisée que par
l’environnement sécurisé de l’Edge Function.

## Confirmation email et mot de passe

Supabase exige que l’email d’un utilisateur anonyme soit vérifié avant de lui
ajouter un mot de passe. K-App envoie donc d’abord le changement d’email avec
le callback `kapp://account/callback?intent=confirm`. Après validation, la page
demande le mot de passe une seconde fois ; aucun mot de passe en attente n’est
stocké localement.

Si Confirm Email est désactivé dans un environnement de test, `updateUser`
convertit immédiatement l’utilisateur et K-App définit le mot de passe dans la
même interaction. Cette configuration ne doit pas être reproduite
silencieusement en production.

La récupération utilise le même callback avec `intent=recovery`, échange le
code PKCE (ou les jetons legacy), puis appelle `updateUser({ password })` depuis
une session de récupération valide.

## RevenueCat

Avant cette fonctionnalité, `Purchases.configure({ apiKey })` ne fournissait
aucun App User ID : RevenueCat créait donc un ID `$RCAnonymousID:` persistant
sur l’installation. Ce comportement est conservé pour tous les utilisateurs
Supabase anonymes, y compris les utilisateurs K-App existants.

Quand le compte devient permanent, K-App appelle `Purchases.logIn(auth.uid())`
sans logout préalable. L’ID RevenueCat anonyme et ses achats peuvent ainsi être
aliasés vers l’UUID Supabase. Si l’anonyme avait Premium mais que le résultat du
login ne le contient pas, K-App tente immédiatement `restorePurchases()`.

Au logout Supabase, la nouvelle session invitée provoque `Purchases.logOut()`
uniquement si RevenueCat était identifié par un UUID permanent. Restore
Purchases reste disponible dans le paywall existant.

Réglage RevenueCat manuel recommandé : dans **Project settings > General >
Restore behavior**, utiliser **Transfer to new App User ID**. C’est le réglage
adapté à une application où l’achat peut précéder la création du compte.
Vérifier ce réglage d’abord en sandbox. Aucune migration distante d’App User ID
n’est à exécuter en masse : les IDs anonymes historiques migrent au prochain
login/protection de compte.

## Limites de validation locale

Sans URL/clé d’un projet Supabase et sans comptes Store sandbox, les scénarios
réseau, emails réels, désinstallation physique, achat et transfert RevenueCat
ne peuvent pas être certifiés localement. Les tests du dépôt couvrent la
validation Auth/callback, les cas local plein/cloud vide, local vide/cloud
plein, les conflits et l’idempotence de migration. Les scénarios distants
doivent être rejoués sur un projet Supabase de staging et sur les sandboxes
Apple/Google avant publication.
