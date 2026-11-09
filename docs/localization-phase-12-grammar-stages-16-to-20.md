# Grammaire FR → JA : audit pédagogique et localisation des étapes 16–20

## Périmètre

La phase précédente couvre déjà l’étape 15. La présente phase complète les étapes **16–20**, dans le même registre source-chaîne que les étapes 1–15, sans modifier l’étape 15 et sans anticiper l’étape 21.

| Étape | ID | Contenu enseigné | Exercices |
|---|---|---|---|
| 16 | `request-item` | Demande d’un objet : nom + (좀) 주세요 versus 있습니다／있어요? et verbe + 아/어 주세요 | 5 |
| 17 | `request-quantity` | Nombres natifs raccourcis 한/두/세/네 et classificateurs 잔/개/명/장 ; 2인분 | 10 (deux groupes de cinq) |
| 18 | `sino-number-contexts` | Nombres sino-coréens : prix, minutes, mois, ligne de métro, numéro de téléphone | 5 |
| 19 | `coordinate-items` | Addition : 하고／(이)랑 « et / avec » versus (이)나 « ou » et 만 « seulement » | 5 |
| 20 | `choose-alternative` | Choix : (이)나 entre noms et 아니면 entre propositions | 5 |

Ce bloc ajoute **30 exercices**, ce qui porte à **115** le nombre d’exercices traduits en japonais sur les étapes 1–20.

## Points issus de l’audit

1. Le japonais des guides n’est pas un calque des phrases destinées aux francophones : l’explication s’appuie sur les repères naturels d’un apprenant japonais (ください, 杯, 個, 枚, 人, 漢数詞, 「と」, 「か」, 「だけ」).
2. Les commentaires pédagogiques distinguent systématiquement **commander**, **vérifier la disponibilité**, **demander une action** et **exprimer un besoin** ; ils n’effacent pas le rôle de 좀, qui adoucit une demande sans être obligatoire.
3. L’étape 17 possède **deux concepts canoniques** (`native-numbers` et `classifiers-basic`). Les dix exercices sont repris ; l’app distingue les formes autonomes et attributives et la lecture sino-coréenne de `2인분`.
4. L’étape 18 ne confond pas `2호선` (ligne 2), `2번 출구` (sortie 2), `3월` (mars), `삼 개월` (trois mois), ni la lecture chiffre par chiffre de `010`.
5. Les étapes 19–20 distinguent l’addition de deux articles, l’accompagnement d’une personne, une alternative et une restriction. Les mauvaises réponses sont expliquées selon la scène, et non déclarées arbitrairement incorrectes dans tous les contextes.
6. Le QCM de l’étape 16 `iced-americano-meaning` propose exceptionnellement des **choix en français** dans le contenu source. Ceux-ci sont traduits **uniquement à l’affichage** à travers le catalogue d’origine, sans toucher aux clés de réponse françaises utilisées par le moteur de notation.
7. Les libellés jusque-là manquants (prix à lire, mois, ligne, chiffres, question, suite) sont localisés. Les contenus coréens, IDs, réponses, exercices, navigation, progression et logique de paiement restent canoniques et inchangés.

## Organisation des fichiers

- `data/localized/grammarGuidesJapanese.ts` : guides complets japonais, dont explication, trois étapes, exemples, erreurs fréquentes et mémo.
- `data/localized/grammarDrillsJapanese.ts` : consignes, scènes, stimuli en français adaptés, explications et libellés français des options.
- `data/localized/grammarFeedbackJapanese.ts` : 30 feedbacks corrects et 90 feedbacks par distracteur.
- `data/localized/grammarRegistry.ts` : titres, objectifs, exemples canoniques, libellés et liaison à tous les IDs de concepts des étapes.
- `scripts/test-grammar-localization.mjs` : test étendu à 20 guides, 115 exercices, 342 distracteurs statiques (et les ordres expliqués dynamiquement pour l’étape 1).

## Validation

Vérifier via `npm run test:grammar-localization`, compilation TypeScript et CI GitHub. Une relecture éditoriale japonaise native sur les appareils reste distincte des tests automatisés.
