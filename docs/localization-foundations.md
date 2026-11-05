# Fondations FR/JA — phase 2

Référence validée : audit du 5 novembre 2026 dans
`C:\Users\arben\AppData\Local\Temp\kapp-localization-audit-20261105\`.
Le rapport, l'inventaire CSV et le ZIP ont été vérifiés accessibles avant intervention.
L'inventaire de 7 944 unités candidates dans 162 fichiers reste un inventaire de
migration : cette phase ne prétend pas les couvrir ni les traduire.

## Moteur et démarrage

`lib/i18n/instance.ts` crée une instance i18next avec des ressources embarquées,
initialisées sans backend réseau. `LanguageProvider` fournit cette instance à
react-i18next avec `I18nextProvider`. Le chargement est synchrone pour les catalogues ;
Suspense est désactivé. Le provider reste à la même place pendant toute la session.
Voir les documentations officielles des [options i18next](https://www.i18next.com/overview/configuration-options)
et du [provider React](https://react.i18next.com/latest/i18nextprovider).

`useLanguageBootstrap()` hydrate la préférence en parallèle des fontes, avant le
montage des routes et la fermeture du splash. Il n'ajoute aucune route et ne modifie
ni les gardes onboarding/auth/paywall ni leurs exceptions. Les animations existantes
commencent après cette hydratation ; leurs durées restent identiques.

Le contrôleur conserve deux notions différentes :

- `preference` : choix explicite `fr` / `ja`, ou `null` pour suivre le téléphone ;
- `deviceLocale` : première langue prise en charge dans la liste du téléphone ;
- `locale` : langue d'affichage autorisée dans cette version.

Le choix explicite prime sur le téléphone. Les variantes `fr-CA`, `ja-JP`, etc.
sont ramenées à `fr` / `ja`. Sans langue prise en charge, le défaut est `fr`.
Le système est lu au démarrage et lors du retour explicite à la langue du téléphone.
Il n'y a pas encore de suivi des changements système à chaud.

La seule clé de persistance est **`kapp:locale:v1`** dans AsyncStorage. La détection
ne crée pas de choix explicite. `useAppLanguage().setPreference(locale)` mémorise un
choix ; `setPreference(null)` supprime uniquement cette clé. Les écritures sont
sérialisées ; un échec d'écriture laisse la langue active intacte et est renvoyé à
l'appelant pour son futur écran de paramètres. Une lecture impossible est signalée
en console et ne bloque pas le démarrage. Aucun stockage de progression, onboarding,
compte ou synchronisation cloud n'est utilisé par cette couche.

**Le japonais public reste désactivé** : `ENABLED_UI_LOCALES = ['fr']`.
La détection et une éventuelle préférence JA sont conservées, mais cette version
continue d'afficher le français. Cela évite d'exposer une interface japonaise
incomplète. Ne pas ajouter `ja` avant la migration et la validation linguistique.
Il n'existe dans cette phase aucun sélecteur ni modification de `/account`.

## Catalogues et types

Chaque langue possède les mêmes 14 fichiers JSON dans `locales/fr` et `locales/ja` :

`common`, `navigation`, `onboarding`, `account`, `premium`, `hangul`, `vocabulary`,
`counting`, `classifiers`, `grammar`, `listening`, `missions`, `speechFeedback`, `immersion`.

Seuls les autonymes `Français` et `日本語` sont renseignés dans `common`. Les 13 autres
namespaces sont vides, déclarés différés dans `locales/manifest.json`. Aucun écran
existant n'a été extrait ou traduit. Les clés i18next sont typées par augmentation
de `CustomTypeOptions` dans `lib/i18n/types.d.ts` à partir du catalogue français.
Chaque nouvelle clé doit être introduite dans les deux langues, avec les mêmes
paramètres et les formes plurielles propres à chaque langue.

`data/localized/{fr,ja}/index.ts` prépare les registres pédagogiques latéraux.
Ils sont vides et couvrent neuf familles de modules. Les futurs fichiers par leçon
doivent exporter uniquement des champs d'affichage indexés par les IDs existants.
Ne pas recopier les graphes, le coréen, les choix canoniques ni les médias.

## Résolution d'affichage

`resolveDisplayMessage({ namespace, key, values })` résout un message complet dans
la langue courante. Les messages, diagnostics et bilans futurs doivent conserver
une référence et des paramètres plutôt qu'un texte traduit dans l'état pédagogique.
La fonction vérifie la ressource de la langue demandée, y compris la forme plurielle
effectivement utilisée. Une clé absente, vide, brute ou un paramètre manquant lève
une erreur. Le fallback interlangue est désactivé ; une absence JA ne peut donc pas
être cachée par le français. Le contrôle reste explicite même si un fallback est
ultérieurement ajouté à une instance par erreur.

`resolveContentText({ module, entityId, field }, canonicalFrench, locale)` renvoie
le français original exactement en FR et cherche la copie par ID en JA. Une absence
JA lève une erreur. Le résolveur retourne une chaîne et ne reconstruit aucun objet
de moteur. Les futurs paramètres d'explications mixtes doivent préserver les segments
coréens exacts et être rendus via `AppMixedText` lorsque nécessaire.

Exemple pour une future migration, sans changer le choix soumis au moteur :

```tsx
const label = resolveContentText(
  { module: 'hangul', entityId: question.id, field: `option-${option.id}` },
  option.label,
  locale,
);
// Afficher label ; continuer à valider option.value, jamais label.
```

Ce schéma est indicatif : employer les identifiants réellement disponibles dans
chaque famille, sans inventer un ID instable dépendant de l'ordre après mélange.
Ne jamais traduire les sentinelles fonctionnelles (`Moi`, `CONTEXTE`, `Son n`, etc.)
avant les décisions canoniques. Ne pas reconstruire une session/question/scène ni
utiliser `key={locale}` sur un écran. Ne pas ajouter la locale aux effets audio,
vidéo, STT/TTS, calculs de durée, scores ou branches.

`formatDisplayDate` et `formatDisplayNumber` sont réservés à la présentation.
Le fuseau doit rester celui du cas d'usage existant, notamment Séoul pour la série.
Aucune conversion de devise, timestamp ni valeur enseignée n'est effectuée.

## Typographie

Le système existant possède désormais le rôle explicite `script="japanese"`,
utilisable par `AppText`, `AppTextInput` et les segments de `AppMixedText`.
Le parent `AppMixedText` accepte aussi `script="japanese"` pour appliquer les
métriques japonaises à une phrase mêlant japonais et coréen.
Il sélectionne Noto Sans JP 400/700, sans capitalisation ni espacement latin forcé.
Les runs Hangul restent rendus avec Noto Sans KR. Les autres scripts conservent
leurs familles, tailles, hauteurs, espacements et transformations précédents.
Il n'y a pas de détection automatique qui réinterpréterait les caractères de la
version française. Les futurs appelants japonais devront sélectionner ce rôle.

Les deux fontes JP sont importées par sous-chemin pour éviter d'embarquer les neuf
graisses du paquet. Elles représentent environ **11,46 Mo** de fichiers TTF avant
compression. Elles ne sont pas enregistrées/chargées au démarrage tant que JA est
désactivé. Quand JA sera activé au niveau de la version, leur chargement précédera
le montage initial ; changer de langue ne fera pas démonter les routes. Leur état
de disponibilité est indépendant des fontes françaises et coréennes. En cas d'échec,
le fallback japonais est Hiragino Sans sur iOS, le sans-serif système sur Android et
une pile japonaise sur le web. Les variantes de glyphes du fallback Android devront
être examinées sur appareil ; Noto Sans JP embarqué est le chemin nominal.

## Contrôles et limites

- `npm run validate:i18n` : fichiers/ressources embarquées, namespaces attendus,
  parité directe des clés, valeurs non vides, structures, paramètres, pluriels et
  conservation des runs Hangul ; mêmes contrôles pour les registres pédagogiques.
- `npm run test:i18n` : préférence, hydratation, persistance indépendante, erreurs,
  concurrence, résolution stricte, pluriels, formats et contrat typographique.
- `npm run validate:i18n:release-ja` : échoue volontairement tant que la publication
  japonaise est différée. `validate:i18n` échoue aussi si JA est activé prématurément.

La validation des catalogues et les tests de localisation sont ajoutés au job
bloquant existant de `.github/workflows/ci.yml`. Le contrôle `release-ja` devra être
exécuté pour toute future publication japonaise ; il est volontairement rouge ici.
La parité des registres encore vides ne démontre pas la couverture du corpus.
Les lots suivants devront ajouter leurs contrats par scène/carte/question/drill/nœud,
le repérage AST des nouvelles chaînes hors catalogues, les tests de rendu des états,
la relecture native et la QA petit/grand téléphone/tablette avec texte agrandi.

`expo-localization` est installé en `~58.0.5`, version indiquée par le SDK Expo 58
présent dans `node_modules/expo/bundledNativeModules.json`.
La lecture du téléphone utilise [`getLocales()`](https://docs.expo.dev/versions/latest/sdk/localization/).
Une reconstruction du development build natif est nécessaire pour intégrer ce
nouveau module ; aucun build iOS/Android ni déploiement n'est produit par ce lot.
Les langues natives exposées aux réglages OS et les descriptions de permissions
ne sont pas modifiées avant la phase de couverture des surfaces natives.

L'ordre de migration de l'audit demeure : sélecteur/paramètres/UI partagée et accueil,
puis écoute active pilote, vocabulaire/comptage/oral, Hangul, grammaire et enfin
missions/diagnostics, surfaces externes et QA complète. Les écrans masqués restent masqués.
