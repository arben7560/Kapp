# Grammaire FR → JA : audit pédagogique et localisation des étapes 26–30

## Périmètre confirmé sur la source canonique
| Étape | ID | Concept | Exercices |
|---|---|---|---:|
| 26 | `ask-permission` | `permission-a-eodo-dwaeyo` | 5 |
| 27 | `express-inability` | `inability-mot` | 5 |
| 28 | `add-item` | `additive-do` | 5 |
| 29 | `limit-request` | `restrictive-man` | 5 (dont un exercice d'ordre) |
| 30 | `range-and-limit` | `range-buteo-kkaji` | 5 |

**25 exercices**, **25 feedbacks positifs individualisés**, **72 feedbacks statiques spécifiques aux distracteurs**, plus un retour dynamique localisé pour l'exercice d'ordre. Cumul des étapes 1–30 : **167 exercices** et **495 distracteurs statiques**.

## Résultats de l'audit avant traduction

1. **Étape 26 — Permission** : `-아/어도 돼요?` vérifie la permission de photographier, de s'asseoir, d'utiliser les toilettes ou de charger son téléphone. Les distracteurs `-(으)ㄹ 수 있어요?` (capacité ou faisabilité), `-(으)세요` (consigne) et `-아/어야 해요` (obligation) ne sont pas grammaticalement faux en soi ; les retours expliquent l'intention contextuelle.
2. **Étape 27 — Incapacité** : distinguer `못` (impossibilité ou incapacité) de `안` (négation simple ou choix). Le contenu canonique signale à juste titre que `잘 안 들려요` peut être naturel lorsqu'on entend mal. La version japonaise conserve explicitement cette nuance, sans transformer `안` en faute universelle. `운전을 못 해요` respecte la structure de `하다`.
3. **Étape 28 — Addition** : `도` = «も» (ajout d'un élément déjà mis en contexte), contre `만` = «だけ», `하고` = «と», et les particules neutres de thème/sujet/objet. L'exercice `me-too` possède quatre choix **en français** : toutes les options sont localisées uniquement à l'affichage, les valeurs sources restant utilisées pour noter.
4. **Étape 29 — Limitation** : `만` + `있어요` exprime une restriction **dans une phrase affirmative**. Ne pas la confondre avec `밖에 없어요`, forme négative parfois plus naturelle dans d'autres contextes (notamment certaines possessions). Le QCM `meaning-bread-only` conserve ses clés françaises et affiche des choix japonais. L'exercice d'ordre `one-only-order` nécessite un feedback japonais spécifique même si la sélection est un tableau de segments.
5. **Étape 30 — De... à...** : `부터` et `까지` bornent une période ou un trajet. `까지` peut s'employer seul. `-에서 ... 까지` est aussi attesté pour certaines plages horaires ; les corrections évitent d'en faire un « faux coréen » et rappellent l'objectif didactique de pratiquer `부터`.

## Modifications limitées à la localisation

- `data/localized/grammarGuidesJapanese.ts` : cinq guides pédagogiques natifs japonais (introduction, règle, trois étapes, exemples, fautes courantes, mémorisation).
- `data/localized/grammarDrillsJapanese.ts` : scènes, consignes, stimuli français localisés, explicatifs contextualisés et deux QCM avec choix français localisés au rendu.
- `data/localized/grammarFeedbackJapanese.ts` : feedback de réussite par exercice et correction des **72 distracteurs textuels**.
- `data/localized/grammarFeedbackDisplay.ts` : traitement *uniquement à l'affichage* des permutations de `one-only-order`, sans changer la validation du moteur.
- `data/localized/grammarVocabularyJapanese.ts` : micro-gloses japonaises des mots coréens des cinq étapes.
- `data/localized/grammarRegistry.ts` : registration des cinq étapes, correspondances avec les concepts, titres/intentions, textes dérivés et gloses.
- `scripts/test-grammar-localization.mjs` : couverture étendue aux étapes 1–30, 167 exercices, 495 distracteurs, tests spécifiques aux deux QCM et à l'ordre.

## Invariants et contrôles
**Aucun changement** à `data/grammar/`, aux stimuli coréens canoniques, aux audios, réponses, distracteurs, règles de notation, identifiants, navigation ou progression. Toutes les traductions se branchent sur la couche d'affichage déjà existante. Vérifications statiques préalables : 25 exercices, 24 questionnaires à 3 distracteurs canoniques (72 identifiants vérifiés), 1 ordre dynamique, 5 guides et leurs structures. La CI doit confirmer `npm run test:grammar-localization`, la compilation TypeScript, les catalogues FR/JA et les non-régressions.
