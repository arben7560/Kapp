# K-App — localisation japonaise Grammaire, bloc 1 (étapes 1–5)

## Périmètre livré
Cinq étapes :
1. **L’ordre de la phrase** → 文の語順
2. **Dire ce que c’est** → 「〜です」と言う
3. **Parler avec politesse** → 丁寧に話す
4. **Dire ce dont on parle** → 話題を示す
5. **Montrer et identifier** → これ・それ・あれ

Inclus : libellés de parcours, titres, objectifs, mini-leçons (règle, formule, décomposition, erreurs, astuces), exemples interprétés, scénarios, consignes, 25 exercices canoniques, explications des 25 bonnes réponses, corrections contextualisées pour chaque réponse incorrecte et bilans. Les corrections de réordonnancement sont construites à partir des mots réellement choisis.

## Protocole
Identique à Vocabulaire / Comptage / Classificateurs : les traductions restent dans des registres *display-only* indexés par les textes français et les identifiants d’étape. Le `ContentLocalizationProvider` associé à la route `/grammar` lit la langue de l’application depuis i18next, sans reconstruction des routes ou des sessions. FR rend les chaînes sources d’origine ; JA rend les textes du registre japonais. L’opération de traduction n’intervient jamais dans la validation des réponses.

Les sources pédagogiques demeurent inchangées : phrases coréennes, particules, prononciation, choix, distracteurs, valeurs de réponse, IDs de question, scores, progression, paywall, audio, médias. Le module garde son URL et ses clés de progression. La typographie utilise la gestion des segments japonais et Hangul déjà assurée par `AppText`.

## Adaptations linguistiques et pédagogiques
- En japonais, la logique sujet/objet/verbe est déjà familière : expliquer l’ordre coréen par les notions de **話題**, **目的語**, **述語**, sans présenter le japonais comme une traduction du français.
- Expliquer 이에요/예요 en fonction du **パッチム** du mot coréen, et non de la traduction.
- Clarifier la distinction entre **日常の丁寧体** et **格式ばった丁寧体** pour -요 / -습니다 ; ne pas faire croire que -습니다 est incorrect.
- Rendre 은/는 par le thème et le contraste, plutôt que par une prétendue particule japonaise exactement équivalente.
- Pour 이／그／저, distinguer la proximité du locuteur, la proximité de l’interlocuteur et l’éloignement des deux ; le rôle de 그 comme référence déjà évoquée est précisé dans les corrections.

## Limites explicites
Les étapes 6–41 ne sont pas traduites dans ce bloc. Le japonais global reste marqué comme non prêt pour une publication intégrale dans `locales/manifest.json`. D’éventuelles sessions archivées issues d’une ancienne banque d’exercices peuvent encore afficher des textes français hors de ce premier catalogue. Il n’y a pas de modification du programme grammatical ni des autres modules.

## Vérifications
`npm run test:grammar-localization` vérifie :
- la parité des catalogues FR/JA ;
- la couverture des cinq mini-leçons, de leurs exemples et notes ;
- la couverture des 25 exercices et de leurs réponses contextualisées ;
- les traductions de la route, le retour au français et la conservation du coréen.

À exécuter avec les tests existants `npm run validate:i18n`, `npm run test:grammar`, `npm run test:i18n` et `npx tsc --noEmit`. Vérifier manuellement le rendu sur petit téléphone Android, grand écran et tablette avant diffusion.
