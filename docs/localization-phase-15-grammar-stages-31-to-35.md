# Grammaire FR → JA — Audit pédagogique et localisation des étapes 31–35

## Périmètre
| Étape | Stage | Concept | Exercices |
|---|---|---|---:|
| 31 | `past-event` | `past-ass-eosseoyo` | 5 |
| 32 | `future-plan` | `future-eul-geoyeyo` | 5 |
| 33 | `decision-and-promise` | `intention-eulgeyo` | 5 |
| 34 | `link-actions` | `sequence-go` | 5 |
| 35 | `give-reason` | `reason-a-eoseo` | 5 |

**Nouveau bloc : 25 exercices, 25 feedbacks corrects individualisés et 75 corrections propres à chaque réponse incorrecte.** Total couvert : **35 étapes, 192 exercices, 570 distracteurs statiques** (les exercices d'ordre antérieurs utilisent aussi leur feedback dynamique).

## Audit pédagogique préalable et décisions d'adaptation native

1. **31 — Passé `-았/었어요`** : adaptation en japonais pour des apprenants familiers du passé et de la forme polie. Mettre en avant `먹었어요`, `갔어요`, `봤어요`, `공부했어요` et `마셨어요`. L'origine française mentionne une contraction fréquente ; `보았어요` est une forme longue grammaticalement acceptable, et non une faute absolue. Les distracteurs distinguent des erreurs morphologiques, le présent, le futur et la conjecture passée `보았을 거예요`.
2. **32 — Projet/prévision `-(으)ㄹ 거예요`** : présenter la nuance de planification par rapport à `-(으)ㄹ게요` (volonté adressée à autrui). Les réponses au présent comme `가요` peuvent également désigner le futur en contexte naturel : les feedbacks indiquent précisément qu'il s'agit ici de travailler la structure cible, sans condamner l'alternative hors contexte.
3. **33 — Décision/promesse `-(으)ㄹ게요`** : scénarios particuliers : ouvrir la porte, payer, rappeler, se porter volontaire, accepter d'attendre. La nuance de réponse/mise à disposition à l'interlocuteur est explicitée. `-(으)ㄹ까요` propose ou interroge ; la simple projection `-(으)ㄹ 거예요` n'a pas le même rôle dans ces scènes.
4. **34 — Liaison `-고`** : une liaison entre actions ne présuppose pas *toujours* un ordre chronologique, même si les exercices illustrent une succession. Comparaison avec `-아서` causal, `-지만` concessif, `-(으)면` conditionnel et `-니까` causal. Les erreurs reçoivent des retours propres à chaque alternative et scène.
5. **35 — Cause/conséquence `-아/어서`** : causes variées (pluie, maladie, retard, prix, fatigue) et conséquences contextualisées ; distinction entre explication causale, simple liaison `-고`, contraste `-지만` et condition `-(으)면`. Formes irrégulières ou contractées nécessaires (`오다→와서`, `아프다→아파서`) expliquées. Les séquences lexicales coréennes restent canoniques.

## Fichiers et invariants
- `data/localized/grammarGuidesJapanese.ts` : cinq guides japonais, chacun avec introduction, règle, formule, trois étapes, deux exemples décomposés, deux erreurs fréquentes et astuce.
- `data/localized/grammarDrillsJapanese.ts` : 25 activités adaptées au japonais pour leurs consignes, explications et contextes. Les prompts source identiques reçoivent une formulation japonaise **identique** pour éviter les collisions du registre source-texte.
- `data/localized/grammarFeedbackJapanese.ts` : 25 retours corrects et 75 retours incorrects spécifiques à chaque réponse/distracteur.
- `data/localized/grammarRegistry.ts` : routes d'étapes, titres, objectifs, descriptions conceptuelles, exemples français et notes localisés en japonais au rendu.
- `scripts/test-grammar-localization.mjs` : extension à 35 étapes, 192 exercices et 570 distracteurs statiques, plus régressions ciblées, invariants français et coréens, contrôle des réponses.

Aucun fichier `data/grammar/`, audio, réponse coréenne, distracteur source, ID, navigation, scoring, logique de validation ou suivi d'apprentissage n'est modifié. Les transformations sont **uniquement d'affichage** et les bonnes réponses continuent d'être évaluées avec le contenu canonique.

## Contrôles

Analyse des données canoniques : **25 exercices sources** et **75 distracteurs** correspondent strictement aux identifiants des traductions ; structure des cinq guides cohérente. Tests automatiques : `npm run test:grammar-localization` et pipeline CI (TypeScript, intégrité des catalogues FR/JA, tests d'authentification/premium et autres non-régressions disponibles). La validation éditoriale sur appareils avec locuteurs japonais reste une étape complémentaire.
