# Correctif du parcours d'entrée FR/JA

## Cause et correction

Dans `553139c`, `shouldOfferLanguageSelection` exigeait à la fois une préférence
absente et un onboarding non terminé. Un utilisateur existant sans choix explicite
ne voyait donc pas le sélecteur. Ensuite, `SplashScreenPage` redirigeait vers
`/(tabs)` si `kapp_onboarding_completed` valait `true`, avant de monter l'accueil
« Bienvenue à Séoul ».

`d101450` dissociait déjà le choix explicite de la fin d'onboarding, mais conservait
cette redirection vers le hub. Les anciens tests attendaient même cette redirection.

Le correctif conserve le sélecteur immédiatement après la fin du logo lorsque
`preference === null`, sans attendre la lecture de l'onboarding. La détection du
téléphone reste une présélection sans écriture. La confirmation persistante utilise
toujours exclusivement `kapp:locale:v1`.

Après confirmation, ou si une préférence explicite existe déjà, l'accueil existant
est toujours monté. Son bouton et son accessibilité réutilisent les messages FR/JA
existants : choix d'une scène pour un onboarding non terminé ; entrée dans le hub
pour un onboarding terminé. La navigation intervient seulement après l'action de
l'utilisateur et la transition existante. Une lecture d'onboarding en erreur conserve
le traitement prudent existant (ne pas imposer sa répétition), tout en montrant
le sélecteur si nécessaire puis l'accueil.

L'animation du logo, les étapes d'onboarding, les gardes de route, l'authentification,
le paywall, les préférences, la progression, les contenus coréens et les audios
ne sont pas modifiés. Aucun catalogue ni contenu pédagogique n'est traduit.

## Succession des écrans

Les flèches après l'accueil représentent une action explicite sur son bouton.

| Scénario | Succession |
| --- | --- |
| Première ouverture FR | Logo → Français / 日本語 → confirmation Français → Bienvenue à Séoul → choix de scène → choix d'approche si immersion choisie, ou hub via son bouton |
| Première ouverture JA | Logo → Français / 日本語 → confirmation 日本語 → ソウルへようこそ → choix de scène en JA → choix d'approche si immersion choisie, ou hub via son bouton |
| Utilisateur existant sans langue confirmée, onboarding terminé | Logo → sélecteur → confirmation FR ou JA → accueil dans cette langue → hub, sans refaire l'onboarding |
| Langue déjà confirmée, onboarding terminé | Logo → accueil dans la langue enregistrée → hub ; aucun sélecteur automatique |
| Langue déjà confirmée, onboarding non terminé | Logo → accueil dans la langue enregistrée → choix de scène → suite existante |
| Fermeture après confirmation puis réouverture | Logo → accueil dans la langue enregistrée → hub ou onboarding selon son état conservé |
| Fermeture avant confirmation | Logo → sélecteur à nouveau → confirmation → accueil ; aucune préférence implicite |
| Changement dans `/account` | Compte → sélection FR/JA → même écran de compte, sans remise à zéro ; à la relance : logo → accueil dans la nouvelle langue → suite selon l'état d'onboarding |
| Deep link/session existante | Destination et gardes existantes conservées ; aucun nouveau sélecteur global. Les callbacks autorisés dans `/account?action=…` gardent leur exception d'onboarding |

La sortie immersion conserve les destinations des scènes et modes existants ; la
sortie vers le hub conserve l'écriture de fin d'onboarding par son bouton existant.
Le sélecteur et l'accueil n'écrivent jamais ce drapeau.

## Vérifications exécutées

- `npm run test:i18n` : **59/59**. Les composants réels sont exécutés avec des
  adaptateurs de hooks/native : logo terminé ou interrompu, animations réduites,
  FR/JA, onboarding absent/`false`/`true`, confirmation par le sélecteur,
  accueil traduit, continuation explicite, redémarrage du contrôleur persistant,
  lecture lente ou impossible, et changement de langue dans le compte.
- Auth production, OAuth, auth sync et Premium : **56/56**, dont les callbacks
  à froid et les exceptions de garde d'onboarding.
- `npx tsc --noEmit` : réussi.
- `npm run validate:i18n` : réussi pour le périmètre FR/JA existant ; les modules
  pédagogiques différés restent hors périmètre.
- Interface React Native Web dans Chrome : **10 contrôles réussis**, aucune
  exception JavaScript non interceptée. Première ouverture FR/JA, confirmation,
  rechargement persistant, scène → approche → retour → hub, relance après fin
  d'onboarding, utilisateur existant sans langue confirmée, compte FR → JA → FR
  → JA sans changement des autres données, et route `/account?action=recovery`
  sans interception. Ce dernier contrôle vérifie la route, sans effectuer de
  récupération réelle. Accueil JA contrôlé à 320, 360, 412 et 768 pixels CSS,
  sans débordement horizontal ; captures FR/JA inspectées.
- Lint du fichier `app/index.tsx` : aucune erreur ni avertissement applicatif.
  Le lint global reste à **221 erreurs et 7 avertissements**, comme dans le journal
  de phase 3 avant correction. `validate:ui` conserve les **48 mêmes diagnostics**
  après normalisation des numéros de ligne (aucun ajouté ou supprimé).

Les preuves de navigateur et journaux temporaires sont dans
`.expo/entry-flow-fix/`, ignoré par Git. Le contrôle utilise les composants React
Native Web réels, un profil Chrome isolé et un aperçu client local sans Supabase,
avec le même contournement SSR/chargement différé que la validation de phase 3.
Ce contrôle ne réalise aucune opération de compte ou cloud réel.

Limite : `adb devices` ne liste aucun appareil. La fermeture forcée/réouverture,
les transitions et le rendu sur Android natif restent à vérifier sur un development
build intégrant ces sources. Les relances automatisées recréent le contrôleur de
langue ou rechargent l'interface avec son stockage persistant ; elles ne sont pas
présentées comme une fermeture du processus Android.
