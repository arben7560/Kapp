# K-App — Audit et traduction japonaise des étapes 11 à 15 de Grammaire

## Périmètre

L’étape 10 (« Agir sur un objet ») est déjà traduite, relue et conservée à l’identique. Ce troisième bloc de localisation porte exclusivement sur les étapes 11–15 dans le même protocole que les étapes 1–10.

| Étape | Route / ID | Notion | Exercices |
|---|---|---|---|
| 11 | `action-location` | Lieu d’une action : 에서 versus 에 pour la présence | 5 |
| 12 | `destination-and-time` | Destination, heure et jour : 에 versus 에서・부터・까지 | 5 |
| 13 | `possession` | Possession : 의・제・내 | 5 |
| 14 | `information-questions` | Questions : 어디・언제・왜・어떻게・얼마 | 5 |
| 15 | `simple-negation` | Négation courte 안 et nominale 이／가 아니에요 | 10 |

**30 exercices localisés supplémentaires, pour 85 exercices localisés dans les étapes 1–15.**

## Constats de l’audit

- Les règles pour les étapes 11–12 gagnent à être présentées avec les repères du japonais **「で」「に」「へ」「から」「まで」**, sans les assimiler mécaniquement aux particules coréennes.
- Pour l’étape 13, présenter 의 comme proche de 「の」 et **제 / 내** selon le registre, sans les confondre avec les pronoms 저 ou 제가.
- Pour l’étape 14, rejeter les recommandations source basées sur « l’ordre français » : le japonais permet au contraire d’expliquer naturellement la position des interrogatifs au sein de la phrase.
- L’étape 15 contient deux familles de cinq exercices chacune, avec le contraste essentiel **安（안）/ 못 / -지 않아요 / 아니에요 / 없어요**. Certains distracteurs sont grammaticalement corrects, mais ne répondent pas à la consigne spécifique. Les feedbacks doivent reconnaître ces variantes.
- Pour **안 공부해요**, forme attendue par l’exercice canonique, la version japonaise signale aussi que **공부 안 해요** est fréquent à l’oral, sans modifier la réponse attendue.
- Plusieurs exercices de l’étape 15 réemploient exactement la même consigne française : chaque source identique reçoit donc une **traduction japonaise identique**, conformément au registre de localisation par chaîne source.

## Organisation retenue

Traductions de présentation uniquement dans :
- `data/localized/grammarGuidesJapanese.ts` : introductions, règles, formules, étapes, exemples analysés, erreurs et moyens mnémotechniques ;
- `data/localized/grammarDrillsJapanese.ts` : scènes, consignes, phrases d’indice, explications ;
- `data/localized/grammarFeedbackJapanese.ts` : feedback positif par exercice et explication spécifique pour chaque distracteur ;
- `data/localized/grammarRegistry.ts` : titres, objectifs, exemples canoniques, termes issus du concept éditorial, enregistrement de la totalité des concepts canoniques de chaque étape ;
- `scripts/test-grammar-localization.mjs` : contrôle d’exhaustivité, parité FR/JA, 85 exercices, 15 guides et deux familles de négation.

Aucun changement apporté aux données coréennes canoniques, aux réponses attendues, à l’audio, à la navigation, aux règles de progression et de score, ni aux étapes 16–41.

## Vérifications

- `npm run test:grammar-localization`
- Validation de l’intégrité des catalogues FR/JA.
- TypeScript et suite CI générale du dépôt.

Ces tests automatisés ne remplacent pas une relecture manuelle sur l’appareil par un enseignant japonais natif.
