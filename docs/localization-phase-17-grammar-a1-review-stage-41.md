# K-App — Audit et adaptation native japonaise du bilan A1, étape 41

## 1. Audit préalable des sources canoniques

Le bilan est défini par `data/grammar/stages.ts` (étape `a1-validation`) et construit par `lib/grammar/exercises.ts`. Il ne s'agit **pas** d'une série de 25 questions fixes : **25 positions de compétences**, réparties entre cinq domaines, sont combinées à une sélection de notions et de questions variables selon la tentative. Certaines positions alternent entre deux notions. Le score de validation reste celui du programme d'origine : **20/25**. Le dispositif évalue la grammaire écrite, **pas** la prononciation ni la compréhension orale.

| Domaine | Emplacements | Échantillons de compétences |
|---|---:|---|
| Fondations | 5 | Ordre des mots, formes nominales, registre poli, interrogatifs, démonstratifs |
| Construire la phrase | 5 | Thème et sujet, objet, lieux, destination, existence |
| Quantités et échanges | 5 | Nombres, compteurs, coordinations, commandes, demandes |
| Choix et intentions | 5 | Désir et capacité, permission/obligation, négation, addition/restriction, passé/futur |
| Temps, liens et nuances | 5 | Engagement/proposition, succession/cause, opposition/condition, honorifiques, comparaison |

En plus des exercices hérités des 40 étapes, le générateur comporte **huit variantes originales de remises en ordre** : destination, transport, commande d'eau, commande café/eau, passé, futur, enchaînement, raison. L'exercice inaugural de construction d'une phrase peut également provenir de l'un des exercices de l'étape 1. Il existe **cinq exercices honorifiques** dans la banque `honorific-si` qui n'étaient pas couverts par les étapes 1–40.

## 2. Choix pédagogiques japonais-coréen

- Réécriture intégrale en japonais du guide A1, y compris la règle du score, la notion d'échantillon renouvelé, les quatre exemples découpés et les trois erreurs fréquentes. Les deux dialogues coréens sont intacts, avec traduction et notes japonaises.
- Pour chaque question réutilisée : localisation des instructions, contextes, phrases à restituer en japonais, explications, choix de réponse *français* éventuels (traduction à l'écran uniquement) et réutilisation du feedback ciblé par distracteur des étapes sources.
- Les en-têtes dynamiques `BILAN A1 · [famille]\n[question]` deviennent `A1総復習・[分野]\n[設問]`, sans toucher au texte original utilisé pour répartir les scores par domaine.
- Huit questions de remise en ordre disposent de consignes, stimuli, contextes, explications, succès et **retours sur l'ordre de mots réellement choisi**. Le feedback distingue un verbe mal positionné des groupes nominaux à réordonner.
- Les **cinq exercices honorifiques** disposent de textes et de corrections propres à chaque erreur. Nuances explicites : `몇 명이세요?` et `이름이 어떻게 되세요?` sont polis et valides, mais `분` et `성함` permettent de témoigner davantage de respect ; `있어요` est poli et valide, mais `계세요` marque l'honneur du sujet.
- Harmonisation des consignes communes et de la terminologie japonaise entre tous les domaines : sujet / thème / objet, formes en `-요`, comparaison, permission/capacité/obligation, projet/promesse/proposition et condition/suffisance.
- Les gloses de vocabulaire en français, lorsqu'elles accompagnent des exercices empruntés aux étapes précédentes, sont aussi rendues en japonais.

## 3. Mise en œuvre

| Fichier | Nature de l'ajout |
|---|---|
| `data/localized/grammarReviewJapanese.ts` | Référentiel d'affichage des 25 positions, huit reconstructions, cinq questions honorifiques et feedbacks ciblés |
| `data/localized/grammarGuidesJapanese.ts` | Guide japonais complet de l'étape 41 |
| `data/localized/grammarRegistry.ts` | Résolution japonaise du guide, des dialogues, de toutes les variantes de questions et des consignes dynamiques |
| `data/localized/grammarFeedbackDisplay.ts` | Distribution des retours japonais pour l'examen, au rendu seulement |
| `data/localized/grammarVocabularyJapanese.ts` | Traduction des indications lexicales réutilisées dans le bilan |
| `scripts/test-grammar-localization.mjs` | Couverture du bilan et tests de non-régression multi-tentatives |

Le générateur de questions, les `conceptIds`, les tokens coréens, les distracteurs originaux, la validation, la comparaison des réponses, les scores, le seuil de réussite, la progression, les audios et la navigation restent **strictement inchangés**.

## 4. Validation

Tests : 12 tentatives générées × 25 questions = **300 affichages de questions** contrôlés ; toutes les familles, les huit compositions, les cinq exercices honorifiques, les bons et mauvais choix, les gloses, la stabilité des options et l'intégrité du texte français. Vérifications supplémentaires du guide, des dialogues, des notes pédagogiques et des réponses coréennes.

Les contrôles automatisés ne remplacent pas une relecture par des enseignants natifs japonais/coréens sur l'interface mobile, mais ils détectent les retours français non localisés, les erreurs de registre et les conflits de chaînes.
