# Grammaire FR → JA — Étapes 21–25 (audit pédagogique et intégration)

## Périmètre audité
| Étape | ID de stage | Concept canonique | Exercices |
|---|---|---|---:|
| 21 | `request-action` | `request-v-a-eo-juseyo` | 5 |
| 22 | `polite-instructions` | `polite-instruction-euseyo` | 5 |
| 23 | `direction-and-means` | `direction-means-ro-euro` | 5 |
| 24 | `express-desire` | `desire-go-sipeoyo` | 5 |
| 25 | `express-ability` | `ability-eul-su-isseoyo` | 7 |

La traduction couvre **5 guides complets, 27 exercices, 27 feedbacks corrects et 81 feedbacks incorrects spécifiques à chaque distracteur**. Le cumul Grammaire en japonais atteint **25 étapes / 142 exercices / 423 distracteurs statiques** (les variantes dynamiques d'ordre de l'étape 1 sont traitées par le résolveur existant).

## Résultat de l'audit pédagogique

1. **Étape 21 : demande d'action.** Traduction centrée sur « faire quelque chose pour le locuteur » : `-아/어 주세요`, versus `-(으)세요` (instruction) et nom + `주세요` (objet). Respect des nuances : les deux formulations peuvent être grammaticales selon le contexte, mais l'exercice évalue la demande de service.
2. **Étape 22 : consigne/invitation polie.** `-(으)세요`, choix selon la finale du radical, et suppression de `ㄹ` si nécessaire. L'emploi `앉으세요` peut être une invitation respectueuse ; `앉아 주세요` insiste davantage sur une demande.
3. **Étape 23 : direction ou moyen.** `-(으)로` versus `에/에서`. `지하철` finit par `ㄹ` et prend `로` : exception explicitée. `자동차` finit en réalité par une voyelle, malgré l'ID technique historique `car-batchim`, que cette phase laisse intact.
4. **Étape 24 : souhait.** `-고 싶어요` signifie un souhait, distinct de `-(으)ㄹ 거예요` (plan/prédiction), `-(으)ㄹ게요` (volonté envers l'interlocuteur) et `-(으)ㄹ까요` (proposition/question). Les mauvais choix ne sont pas présentés comme des formes grammaticalement invalides.
5. **Étape 25 : capacité et faisabilité.** `-(으)ㄹ 수 있어요` pour savoir-faire et disponibilité réelle (paiement, recharge, transport), par opposition à `-아/어도 돼요?` pour demander l'autorisation dans les exercices ciblés. Ce contraste est contextuel, pas une interdiction absolue de recouvrement dans la langue naturelle.

## Organisation des modifications

- `data/localized/grammarGuidesJapanese.ts` : guides natifs japonais (règle, formule, trois étapes, exemples décomposés, erreurs fréquentes, mémorisation).
- `data/localized/grammarDrillsJapanese.ts` : scènes, consignes, explications spécifiques ; les consignes sources partagées par plusieurs exercices reçoivent une traduction commune compatible avec le résolveur source-texte.
- `data/localized/grammarFeedbackJapanese.ts` : feedback positif propre à chaque exercice et explication individualisée de chaque mauvaise réponse.
- `data/localized/grammarRegistry.ts` : ajout des cinq ID de stage, titres, buts, correspondances conceptuelles et éléments d'interface.
- `data/localized/grammarVocabularyJapanese.ts` : gloses japonaises des mots des exercices, sans modifier les métadonnées canoniques.
- `scripts/test-grammar-localization.mjs` : 20 → 25 étapes, 115 → 142 exercices, 342 → 423 distracteurs et tests ciblés supplémentaires.

## Invariants de sécurité

Cette phase ne change **aucun fichier canonique** sous `data/grammar/`, ni les audios, les phrases coréennes, les réponses, les distracteurs, les identifiants, les scores, la validation, les routes ou le paiement. La traduction se fait uniquement **au rendu** et les ID sources restent stables.

## Vérifications

- Audit de correspondance des 27 exercices canoniques avec leurs identifiants et 81 choix incorrects : effectué avant intégration.
- Contrôle structurel des cinq guides (3 étapes, 2 exemples, 2 erreurs fréquentes chacun) : effectué avant intégration.
- Scripts à exécuter en CI ou en local : `npm run test:grammar-localization`, `npx tsc --noEmit` et les tests i18n existants.
- Relecture éditoriale par un enseignant japonais natif sur appareils : **non remplacée** par la couverture automatisée.
