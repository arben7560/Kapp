# Validation UI et cycle de vie des routes

## Routes de production

Le parcours publié part de `/`, passe par `/onboarding` si nécessaire, puis
arrive sur `/(tabs)`. Les points d'entrée actifs sont Hangul, Grammaire,
Vocabulaire, Comptage, Speak, Listen, Premium et Streak. L'évaluation et la passerelle
Hangul, ainsi que le parcours Grammaire A0 → A1 et ses leçons dynamiques,
font partie du parcours actif. Les sous-routes listées par
`scripts/validate-ui-contracts.mjs` font partie de ce contrat.

Shopping conserve son mémo sur `/lesson/magasin`, mais n'est pas affiché dans
le hub tant que sa scène guidée n'est pas finalisée. Les anciennes routes
inexistantes `/lesson/shopping` et `/lesson/shoppingIA` ne sont pas utilisées.

## Prototypes conservés hors navigation

Ces routes restent dans le dépôt pour ne pas perdre le travail produit, mais
sont redirigées vers l'accueil par le garde de release dans `app/_layout.tsx`.
Elles ne doivent pas être reliées à un point d'entrée de production avant leur
revue :

- `/voc/emotion` : prototype de collection émotionnelle, absent du tableau
  `THEMES` du hub Vocabulaire ;
- `/voc/famille` : prototype de collection familiale, absent du tableau
  `THEMES` du hub Vocabulaire ;
- `/voc/health` : ancien prototype santé conservé distinct de la collection
  active `/voc/sante`, sans alias ni entrée de navigation ;
- `/voc/lieux` : prototype de collection de lieux, absent du tableau
  `THEMES` du hub Vocabulaire ;
- `/voc/meteo` : prototype de collection météo, absent du tableau `THEMES`
  du hub Vocabulaire ;
- `/voc/objets` : prototype de collection d'objets, absent du tableau
  `THEMES` du hub Vocabulaire ;
- `/voc/voyage` : prototype de collection de voyage, absent du tableau
  `THEMES` du hub Vocabulaire ;
- `/classificateur` et ses sous-routes : prototype conservé hors navigation ;
- `/immersion` et `/immersion/*` : ancien prototype de capsules ;
- `/profile`, `/review` et `/assimilation` : outils/prototypes internes ;
- `/listen/CafeListen`, `/listen/MetroListen`, `/listen/RestaurantListen` et
  `/listen/index-quiz` : anciennes variantes d'écoute ;
- `/lesson/health`, `/lesson/help`, `/lesson/hotel`, `/lesson/late` et
  `/lesson/taxi` : placeholders sans contenu final.

Les routes `/lesson/airportIA`, `/listen/teacherIA` et
`/listen/teacherIARealtime` sont des alias de compatibilité. Elles restent
volontairement de simples réexports/redirections.

Les routes de démonstration Expo `/explore` et `/modal`, ainsi que leurs
composants et hooks exclusivement associés, ont été supprimées.

## Contrats statiques automatisés

`scripts/validate-ui-contracts.mjs` est la source de vérité du cycle de vie des
routes. Chaque fichier `.tsx` ou `.jsx` sous `app/`, hors layouts, doit être
classé exactement une fois comme route active, prototype/orpheline ou alias de
compatibilité. Une nouvelle route non classée, une entrée absente ou un doublon
fait échouer la validation.

Pour les routes actives, le script suit récursivement les imports locaux. Le
contrôle couvre donc aussi les composants partagés réellement rendus par ces
routes. Il vérifie notamment :

- l'usage de `AppText` par chaque route et l'absence de `Text`, `Animated.Text`
  ou d'un alias de `Text` importé depuis `react-native` ;
- l'absence de `fontFamily`, `fontWeight`, Outfit ou Noto Sans KR déclarés en
  direct dans le graphe actif ;
- la structure complète des tokens `AppTypography`, l'enregistrement des
  variantes Outfit/Noto Sans KR et le scénario de fallback ;
- le filtrage par `AppText` de `fontFamily`, `fontSize`, `lineHeight`,
  `letterSpacing`, `fontWeight` et `textTransform`, avant l'éventuel
  `typographyOverride` explicite ;
- l'emploi effectif des contrats `lineContract` et le refus de
  `numberOfLines`/`ellipsizeMode` directement sur `AppText` ;
- les mélanges latin/coréen statiquement détectables dans un même `AppText`,
  qui doivent passer par `AppMixedText`.

La seule exception au `Text` natif est
`components/app-text.tsx` : c'est le wrapper central et il utilise des nœuds
natifs internes pour produire un seul arbre accessible dans `AppMixedText`.
Les déclarations de fontes sont limitées à ce wrapper, à `constants/theme.ts`
et à leur enregistrement dans `app/_layout.tsx`. Il n'existe aucune exception
par route.

Le contrôle des références de routes autorise `PREMIUM_ROUTE_PATHS`, qui est
uniquement un inventaire de droits d'accès et ne navigue pas. Toute référence
issue du graphe actif vers un prototype fait échouer la commande.

## Matrice de validation

Exécuter d'abord :

```sh
npx tsc --noEmit
npm run validate:ui
npm run lint
```

Pour chaque parcours actif, contrôler les largeurs 320, 375, 390 et 430 px,
une tablette (768 × 1024 minimum), puis un paysage mobile (844 × 390) et
tablette. `app.json` utilise `orientation: default`, le paysage natif est donc
testable.

Répéter le contrôle avec le texte à 100 %, 130 % et 200 %. Les attentes sont :
aucun texte coupé, CTA extensibles, titres qui se replient, aucune carte qui
dépasse horizontalement et toutes les actions encore accessibles au scroll.

Valider sur Android, iOS et Web :

1. chargement normal des fontes Outfit et Noto Sans KR ;
2. repli simulé avec `npm run web:font-fallback` ;
3. alignement d'une ligne mixte coréen/latin et absence de rognage ;
4. Android avec `includeFontPadding: false`, centralisé dans `AppText` et des
   `lineHeight` explicites dans les tokens.

La validation Web peut couvrir automatiquement les viewports. Les résultats
iOS/Android doivent être consignés après un passage sur simulateur ou appareil ;
un export Web réussi ne vaut pas validation native.
