# Audit pédagogique et localisation japonais-coréen — Grammaire, étapes 36–40

## Périmètre pédagogique contrôlé avant traduction

| Étape | ID de l'étape | Concept canonique | Exercices | Distracteurs |
|---|---|---|---:|---:|
| 36 | `mark-contrast` | `contrast-jiman` | 5 | 15 |
| 37 | `simple-condition` | `condition-eumyeon` | 5 | 15 |
| 38 | `necessity-and-obligation` | `obligation-a-eoya-haeyo` | 5 | 15 |
| 39 | `simple-comparison` | `comparison-boda-deo-jeil` | 5 | 15 |
| 40 | `make-suggestion` | `suggestion-eulkkayo` | 5 | 15 |

**Ce groupe : 25 exercices, 25 feedbacks positifs individualisés, 75 feedbacks erronés par distracteur.** Périmètre global après intégration : **40 étapes, 217 exercices, 645 distracteurs statiques**. La révision générale A1, étape 41, demeure en dehors du groupe demandé.

## Audit effectué avant traduction : points à préserver

1. **`-지만` — Opposition** : comparer deux informations vraies malgré leur contraste, et non leur simple addition par `-고`, leur cause par `-아서` ni une condition par `-(으)면`. Attention aux racines des adjectifs à ㅂ irrégulier : `맵다 → 맵지만` directement devant `-지만`, mais `맵다 → 매우면` devant `-(으)면`. **`매우면` est une forme grammaticale conditionnelle, pas une faute** : le distracteur est inadapté à *l'intention d'opposition* de la scène. Les explications japonaises sont explicites sur ce point.
2. **`-(으)면` et `-(으)면 돼요` — Condition et suffisance** : `시간이 있으면 가요` indique la condition de la sortie, tandis que `여기에서 내리면 돼요` indique qu'une action suffit. Le feedback différencie clairement `내리면 가요` (« si je descends, j'y vais ») de `내리면 돼요` (« descendre suffit »). Les radicaux finissant en ㄹ ne reçoivent pas un 으 additionnel : `살면`.
3. **`-아/어야 해요` et `이/가 필요해요` — Obligation et nécessité** : `사야 해요` oblige à *faire* une action ; `여권이 필요해요` concerne un *objet nécessaire*. Les corrections distinguent la permission `-아/어도 돼요`, la capacité `-(으)ㄹ 수 있어요`, les consignes `-(으)세요`, ainsi que `보여 주다` (« montrer ») et `보다` (« voir »).
4. **`보다, 더, 제일` — Comparatif et superlatif** : `보다` se place derrière la référence, `더` devant la propriété comparée et `제일` désigne le plus haut degré d'une sélection. La phrase canonique `버스보다 지하철이 빨라요`, **sans** `더`, reste correcte : `더` est souvent facultatif. `이 식당이 제일 좋아요` peut décrire une **préférence subjective**, sans classement objectif. Éviter d'affirmer que `제일` est systématiquement incorrect lorsqu'il n'y a que deux candidats ; l'exercice privilégie la comparaison explicitement construite avec `보다`.
5. **`-(으)ㄹ까요?` — Proposition et offre** : `같이 갈까요?` demande l'avis de l'interlocuteur sur une action commune ; la même terminaison peut proposer l'action du **locuteur** (« je vous aide ? »). Les distracteurs `-(으)ㄹ 거예요` (projet), `-(으)ㄹ게요` (engagement) et `-아/어도 돼요` (permission) sont expliqués *dans leur scène*, sans être présentés comme grammaticalement faux dans tous les contextes.

## Réalisation et invariants

- `data/localized/grammarGuidesJapanese.ts` : cinq guides rédigés **en japonais pour un apprenant japonais du coréen** : introduction, règle, formule, trois étapes, deux exemples détaillés, deux pièges fréquents, moyen mnémotechnique.
- `data/localized/grammarDrillsJapanese.ts` : contexte et explication contextualisés pour chacun des 25 exercices, et consignes japonaises stables lorsqu'elles proviennent d'une même chaîne française.
- `data/localized/grammarFeedbackJapanese.ts` : **25 retours de réussite uniques** et **75 retours d'erreur spécifiques à la réponse choisie**. La correction de `매우면` reconnaît sa validité morphologique.
- `data/localized/grammarRegistry.ts` : cinq nouveaux modules, leurs titres/intentions, exemples et **notes des règles et sous-règles** reliés au catalogue d'affichage japonais.
- `scripts/test-grammar-localization.mjs` : 40 étapes, 217 exercices, 645 distracteurs statiques, vérification de tous les champs pédagogiques, des chaînes sources partagées, des sous-règles, des valeurs de réponses et des messages de correction par réponse.

**Aucune modification** aux exercices ou guides canoniques de `data/grammar/`, ni aux phrases coréennes, audios, clés de réponses, distracteurs originaux, scoring, navigation, validation ou progression. Les fichiers concernés appartiennent seulement à la couche d'affichage, aux tests et à la documentation.

## Contrôles

Contrôle statique en amont : 5 guides conformes (3 étapes explicatives, 2 exemples, 2 erreurs), 25 ID d'exercices exacts, 75 distracteurs alignés sur les valeurs canoniques. La CI GitHub exécute ensuite la suite de localisation et les contrôles TypeScript et non-régression du dépôt. Une vérification manuelle sur des appareils avec locuteurs japonais reste complémentaire aux tests automatiques.

Référence morphologique externe utilisée uniquement pour confirmer la nuance autour du ㅂ irrégulier `맵다→매우면` : <https://www.korean.go.kr/common/download.do?c_file_name=de1a9a29-2540-4eb0-a417-9b2aa87d5b72_1.pdf&file_path=reportData&o_file_name=%EC%B4%88%EA%B8%89+%ED%95%9C%EA%B5%AD%EC%96%B4%28%EC%9D%BD%EA%B8%B0%29+%EA%B5%90%EC%9B%90%EC%9A%A9+%EC%A7%80%EC%B9%A8%EC%84%9C+%EA%B0%9C%EB%B0%9C+%EB%B3%B4%EA%B3%A0%EC%84%9C_2.pdf>.
