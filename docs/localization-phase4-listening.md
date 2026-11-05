# K-App — phase 4 : localisation du module Écoute (FR/JA)

## Périmètre livré

- Les 25 exercices actifs de `data/listen/activeExercises.ts`, répartis en cinq parcours (`dictation`, `situation`, `gap`, `order`, `reaction`), utilisent des champs d'affichage FR/JA sans modifier les exercices canoniques.
- Pour chaque exercice : contexte (`theme`), titre, consigne et explication pédagogique (100 champs par langue).
- Écran `app/(tabs)/listen.tsx` : sélecteur de parcours, consignes, commandes de lecture, états d'audio, messages de correction contextualisés, accessibilité, progression, rappel de série et navigation entre exercices.
- `components/listen/ListenTrainingCompletionModal.tsx` : bilans et compétences travaillées, actions « suivant » / « recommencer », statut de série.
- `app/(tabs)/index.tsx` : carte d'entrée Écoute et reprise d'exercice affichées dans la langue sélectionnée. Le titre de reprise est retrouvé par identifiant d'exercice, au rendu, sans modifier les valeurs sauvegardées.

## Choix linguistiques

La version japonaise vise un registre pédagogique clair, naturel et accessible. `dictation` devient « 聞き取り » (reconnaissance à l'écoute, l'élève ne réalise pas de dictée manuscrite), `reaction` devient « 応答 » (choix d'une réponse conversationnelle), `situation` devient « 場面理解 ». Les corrections incorrectes indiquent quoi réécouter plutôt que de répéter une formule générique. Les contenus français restent identiques à la source pour les 100 champs pédagogiques.

Tous les contenus japonais sont dans `locales/ja/listening.json`, avec les messages français correspondants dans `locales/fr/listening.json`. Aucune traduction n'est écrite dans l'objet exercice. Les 211 chaînes par langue sont organisées par écran, parcours, feedback, bilan, entrée du hub et exercice. Le rôle typographique japonais est activé sur les textes concernés, et le rôle coréen est préservé sur les réponses en hangul.

## Invariants

- IDs, `kind`, `answer`, `options`, `words`, `before`, `after`, `sourceText`, correspondances `LISTEN_AUDIO_BY_ID`, `audioAsset` et médias **inchangés**.
- Vérification de l'achèvement de la lecture audio, validation de la bonne réponse, progression, XP et série quotidienne **inchangées**.
- Les états pédagogiques et chemins de navigation restent indépendants de la langue ; la traduction s'applique à l'affichage, à la description des réponses et à l'accessibilité.
- Les 25 exercices et leurs quatre champs traduisibles sont vérifiés par `scripts/test-listen.mjs`. Les clés, paramètres et segments hangul doivent rester parallèles entre FR et JA via `validate:i18n`.
- Les dix autres namespaces différés et le verrou de publication JA restent inchangés.

## Contrôles à exécuter sur le dépôt local

```powershell
npm run validate:i18n
npm run test:listen
npm run test:i18n
npx tsc --noEmit
```

En plus des tests, contrôler sur Android : sélection FR/JA, cinq questions par parcours, audio obligatoire et rejeu, mauvaise puis bonne réponse, bilan et réentrée, retour au hub et reprise de session.

## Anomalies préexistantes hors périmètre

Deux `audioAsset` déclarés dans `data/listen/activeExercises.ts` ne correspondent pas au MP3 réellement sélectionné par `LISTEN_AUDIO_BY_ID` dans `app/(tabs)/listen.tsx` :

| Exercice | `audioAsset` (métadonnées) | MP3 réellement sélectionné dans l'écran |
|---|---|---|
| `cafe-situation-02` | `mwo-deurilkkayo.mp3` | `chumun-hasigesseoyeo.mp3` |
| `street-reaction-05` | `yeogiseo-oreunjjogeuro-gaseyo.mp3` | `yeogiseo-jjuk-gasimyeon-dwaeyo.mp3` |

Cette phase ne modifie **aucun** audio. Ces écarts doivent faire l'objet d'une vérification fonctionnelle séparée avant publication.
