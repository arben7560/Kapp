# Correctif ciblé du parcours Premium — 12 novembre 2026

Suite du commit `252fe02`. Le dépôt était propre au début de cette session.
Les identifiants de produits, prix configurés, SDK natifs, restauration, identité
Supabase/RevenueCat et règles pédagogiques sont conservés.

## Diagnostic du bouton absent

Les libellés « Test valid purchase / Test failed purchase » cités dans le
signalement correspondent à la fenêtre **RevenueCat Test Store**. RevenueCat
documente ces boutons dans son [exemple officiel de Test Store](https://www-docs.revenuecat.com/blog/engineering/testing-test-store/).
Ils ne prouvent pas un achat Google Play Billing, même sur un téléphone Android.
La fenêtre du SDK est conservée, sans remplacement ni contournement.

Le profil `iapTest` du dépôt sélectionne explicitement Test Store, les produits
`monthly` / `yearly` et une clé de type `test_`. Dans le code du commit précédent,
`subscriptionManagementURL` renvoyait déjà `null` pour `store=TEST_STORE`.
Account masquait donc le bouton : `canManage=false` et exclusion explicite du
Test Store. C'est le comportement correct pour un abonnement fictif, qui
n'existe pas dans la gestion Google Play. Le message explicatif est conservé.

Pour `store=PLAY_STORE`, les conditions existantes permettaient déjà la
résiliation si l'entitlement était actif, non expiré et `willRenew=true`.
`isSandbox=true` ne masque pas ce bouton : les achats de test de licence Google
restent gérables. Les accès développeur et promotionnels ne proposent pas de
fausse résiliation.

Deux défauts complémentaires ont été confirmés dans le code : Account ne
rafraîchissait pas les droits à sa prise de focus ; les traductions récemment
ajoutées avaient des caractères `?`, dont « R?silier mon abonnement » et des
chaînes japonaises illisibles. Ces défauts sont corrigés.

L'identité RevenueCat reste synchronisée avec l'UUID Supabase avant toute
transaction. Les réponses d'un autre compte sont rejetées. Aucune valeur
`isPremium` n'est forcée : seul l'entitlement `premium_all_access` actif accorde
l'accès. Un achat sans cet entitlement conserve l'erreur explicite existante.

**Limite du diagnostic :** aucun CustomerInfo du téléphone, journal de
transaction ou accès à la console RevenueCat n'a été fourni. L'explication
Test Store correspond aux libellés et à la configuration du dépôt ; le store
effectif de la transaction signalée reste à confirmer sur appareil. Si cette
transaction porte réellement `PLAY_STORE`, relever son entitlement, `isActive`,
`willRenew`, expiration, produit/base plan et identité courante dans RevenueCat.

## Comportement livré

- Récapitulatif Seoul Midnight Glass avant l'appel natif : formule, prix
  `product.priceString`, périodicité et renouvellement automatique, Continuer et
  Annuler. Le bouton indique Google Play sur Android, App Store sur iOS et
  RevenueCat Test Store dans l'environnement fictif.
- Achat nouvellement confirmé : redirection vers Account et notification verte
  en haut de l'écran, apparition de 220 ms (réduction des animations respectée),
  disparition après 6 secondes. L'événement est en mémoire, à usage unique,
  lié au compte et périmé après une minute s'il n'a pas été affiché.
- Aucun événement de réussite pour restauration, abonnement préexistant,
  annulation, refus, paiement en attente ou entitlement non accordé.
- Résiliation : règle explicite partagée `canCancel`, modale existante puis
  lien officiel. Priorité à `CustomerInfo.managementURL`, puis au lien de la
  souscription, puis au lien Google ciblant les identifiants existants.
  Cette priorité suit la [documentation RevenueCat](https://www.revenuecat.com/docs/customers/customer-info).
- Account actualise les droits à son ouverture sans recharger les offres. Une
  lecture datant de moins de 5 secondes peut être partagée avec le démarrage,
  l'achat ou le retour au premier plan ; les requêtes simultanées sont groupées.
  Le démarrage invalide explicitement le cache. Le retour de gestion Google
  conserve la vérification fraîche existante. Un retour vérifié sans résiliation
  n'affiche plus le message erroné de résiliation non confirmée.
- Les droits d'un abonnement résilié restent déterminés par l'expiration et la
  grâce réellement transmises par RevenueCat, indépendamment de `willRenew`.

## Validation locale

| Contrôle | Résultat |
| --- | --- |
| Premium, lifecycle, Test Store, localisation Premium/Account, auth, OAuth et navigation | 144 tests réussis, aucun échec ; SDK et vues simulés |
| Lifecycle après ajustements finaux de lint | 14 tests réussis |
| ESLint sur les écrans, composants Premium et `lib/paywall` | Réussi, aucun avertissement |
| Lint global | 217 erreurs, 9 avertissements dans 27 fichiers non modifiés ; aucun fichier du correctif signalé |
| TypeScript `npx tsc --noEmit` | Deux erreurs TS2532 préexistantes dans `lib/i18n/immersionText.ts:225`, fichier inchangé et erreurs déjà documentées dans l'audit précédent |
| `npm run validate:i18n` | Réussi : 15 namespaces FR/JA vérifiés ; 6 restent différés dans le projet |
| Export Android + Hermes | Réussi, 4 442 modules ; sortie locale ignorée `.expo/premium-validation`, `.env` non chargé |
| `git diff --check` | Réussi |

L'export Hermes a nécessité une relance hors bac à sable après `spawn EPERM`.
Il ne constitue ni un APK, ni une validation de facturation ou de rendu natif.
Les problèmes globaux hors Premium n'ont pas été intégrés à ce correctif.

Les neuf scénarios demandés sont couverts par des tests locaux : mensuel,
annuel, annulation/refus, redirection et notification unique, bouton de
résiliation renouvelable, lien Google, retour après résiliation, accès jusqu'à
l'expiration et redémarrage avec abonnement. **Aucun de ces scénarios n'est
déclaré validé sur Google Play réel.** La recette téléphone reste à exécuter
sur une build Google Play (profil `closedTest`), avec compte testeur de licence,
CustomerInfo `PLAY_STORE` et contrôle des événements dans RevenueCat. Vérifier
aussi le rendu sur petit/grand téléphone, tablette et avec texte agrandi.

## Fichiers du correctif

- `app/premium.tsx`
- `app/account/index.tsx`
- `components/premium/PurchaseSuccessNotice.tsx`
- `components/premium/SubscriptionDetails.tsx`
- `lib/paywall/PaywallProvider.tsx`
- `lib/paywall/revenueCatLogic.ts`
- `lib/paywall/subscriptionDetails.ts`
- `lib/paywall/types.ts`
- `locales/fr/premium.json`
- `locales/ja/premium.json`
- `scripts/test-premium-lifecycle.mjs`
- `scripts/test-premium-localization.mjs`
- `scripts/test-revenuecat-test-store.mjs`
- `docs/premium-purchase-follow-up.md`
