# Audit final — accueil du module Grammaire en japonais

## Périmètre

Écran : `app/(tabs)/grammar/index.tsx`, route `/grammar` avec langue d'application `ja`. Objectif : l'ensemble des libellés de l'interface doit être naturel pour un utilisateur japonais, à l'exception des expressions **coréennes** étudiées et des noms de marque / niveaux internationaux (K-App Premium, A0, A1).

L'examen est strictement limité à la page d'accueil du module Grammaire. Aucune chaîne des leçons canoniques, phrase coréenne, validation, audio, progression, règle de déverrouillage ou navigation n'est modifiée.

## Audit avant modification

| Élément affiché | État initial | Mesure |
|---|---|---|
| En-tête `Grammaire`, description et panneau « Pour bien commencer » | Déjà localisés dans `SHARED_COPY` | Vérification de couverture |
| Six chapitres, titres de 41 étapes, objectifs pédagogiques | Déjà localisés | Contrôles exhaustifs |
| Boutons, statuts, reprise, Premium et labels d'accessibilité | Déjà localisés | Tests des états possibles |
| Compteur `x / 41 étapes` | Règle dynamique déjà présente dans `grammarText.ts` | Contrôle des 42 états, de 0 à 41 |
| En-têtes `CHAPITRE 01 · Fondations`, `n étapes · progression A0 → A1` | Règles dynamiques déjà présentes | Tests pour les six chapitres |
| Indications `ÉTAPE 01 · A0` et `ÉTAPE 01 · NIVEAU A0` | Règles dynamiques déjà présentes | Tests pour les 41 étapes |
| **Mention de grammaire « prédicat final ; sujet souvent omis »** | **Français persistant** : forme `concept.form`, non incluse dans la traduction du hub | Traduction japonaise `述語は文末・主語は省略できる` |
| **Notations mixtes `N에 있어요`, `N 주세요`, `V-아/어 주세요`** | **Métavariables latines N/V** | Harmonisation japonaise : `名詞＋...` et `動詞＋...` en gardant les terminaisons coréennes intactes |
| **Formes grammaticales composites (étapes avec 2 concepts, bilan A1)** | Plusieurs formes sont concaténées **avant** le traitement `AppText`, ce qui empêche la traduction exacte d'un élément au sein de la chaîne | Localisation de chaque `concept.form` **avant `.join(" · ")`** |
| **Prérequis « Pont après le Hangul »** | Libellé d'un `CONTENT_REFS` externe sans équivalent dans le scope `hub` | `ハングル学習後のステップ`, y compris dans `Ordre conseillé : après ...` et `Requis : ...` |

## Modifications

- `app/(tabs)/grammar/index.tsx` : traduction des libellés de formes grammaticales individuellement avant leur assemblage. Le registre et l'état des cartes, leur navigation et le calcul de progression sont inchangés.
- `data/localized/grammarRegistry.ts` : cinq chaînes complémentaires propres à `hub` (une description métalinguistique, trois notations N/V et un prérequis externe).
- `scripts/test-grammar-localization.mjs` : couverture exhaustive du hub : libellés statiques, états d'accès et d'avancement, titres/intentions des 41 cartes, formules des concepts des 41 étapes, 6 chapitres, 42 compteurs de progression, versions dynamiques des en-têtes et des prérequis. L'original français et les expressions coréennes sont vérifiés inchangés.

## Limites et critères de validation

Les tests vérifient les **chaînes de texte réellement produites par la logique de traduction** et la présence du pont i18n dans les composants. Les tests CI (TypeScript, catalogue franco-japonais, localisation grammaire et non-régression) doivent être verts avant fusion. Cela ne remplace pas une revue visuelle sur chaque appareil et chaque format d'écran. L'audit ne prétend pas couvrir les autres modules de K-App.
