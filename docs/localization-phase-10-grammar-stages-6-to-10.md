# Localisation japonaise — Grammaire, étapes 6 à 10

## Audit du contenu source

Le bloc précédent couvre déjà les étapes 1 à 5, dont l’étape 5 « Montrer et identifier ». Cette extension concerne uniquement les étapes 6 à 10.

| Étape | ID stable | Contenu pédagogique | Exercices |
|---|---|---|---|
| 6 | `nominal-questions` | 뭐／누구／몇 ; nombre + classificateur | 5 |
| 7 | `existence` | Sujet 이／가 ; existence 있어요／없어요 | 10 (2 groupes de 5) |
| 8 | `locate-thing` | Localisation + 에 ; différence avec 에서 | 5 |
| 9 | `present-actions` | Présent 해요体, conjugaisons et contractions | 5 |
| 10 | `object-actions` | Objet 을／를 ; thème 은／는 | 5 |

**30 exercices nouveaux localisés, pour 55 exercices couverts sur les étapes 1 à 10.**

## Principes appliqués

- Traduction libre et fidèle aux situations, en japonais naturel destiné à un élève japonais et non selon les repères de l’orthographe française.
- Référence aux repères grammaticaux japonais utiles (「は」「が」「に」「を」) sans présenter les particules coréennes comme toujours interchangeables.
- Terminologie stabilisée : パッチム, 助詞, 主格助詞, 目的格助詞, 述語, ヘヨ体, ハムニダ体, 助数詞.
- Explication contextualisée de la réponse attendue et de chaque distracteur (90 cas incorrects nouveaux), y compris les cas où une option est grammaticalement possible mais ne correspond pas à la scène.
- Rendu uniquement : les champs de données canoniques (`korean`, `stimulus`, `answer`, `options`, `id`, `score`, historique, audio) restent en coréen et fonctionnellement identiques.
- Les gloses de vocabulaire françaises résiduelles attachées à `bus-vowel` et `coffee-vowel` sont adaptées en japonais à l’affichage, sans modifier les métadonnées sources.
- La structure suit `JAPANESE_GRAMMAR_GUIDES`, `JAPANESE_GRAMMAR_DRILLS`, `JAPANESE_GRAMMAR_CORRECT_FEEDBACK`, `JAPANESE_GRAMMAR_WRONG_FEEDBACK`, `GRAMMAR_COPY_BY_MODULE` et `resolveGrammarText` utilisés par les étapes 1 à 5.

## Hors périmètre

Les étapes 11–41, les règles de scoring, la progression, la navigation et les ressources pédagogiques coréennes ne sont pas modifiées. Le statut global de publication japonaise n’est pas activé.

## Vérification

`npm run test:grammar-localization` couvre les 10 guides, les 55 exercices, leurs explications et distracteurs, les libellés de l’interface et les adaptations des gloses ; la CI exécute également TypeScript et le contrôle d’intégrité des catalogues FR/JA.

Cette validation automatique n’équivaut pas à une relecture par un professeur japonais natif sur appareil.
