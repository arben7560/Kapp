# Périmètre TypeScript et variantes historiques

L'application démarre via `expo-router/entry` (`package.json`). Les écrans actifs
sont `app/index.tsx` et `app/onboarding.tsx` ; `app/_layout.tsx` déclare la route
`onboarding`. Le catalogue de `scripts/validate-ui-contracts.mjs` et le script
`scripts/apply-onboarding-audit.mjs` ciblent également ces fichiers dans `app/`.

Les cinq fichiers suivants sont des variantes historiques conservées à la racine,
hors de l'arborescence des routes :

| Fichiers | Commit d'ajout | Usage historique |
| --- | --- | --- |
| `app-index-hdplus-patch.tsx`, `app-onboarding-hdplus-patch.tsx` | `f2756f3` | Ajustements responsive Realme HD+ |
| `app-index-tall-layout.tsx`, `app-onboarding-tall-layout.tsx` | `b78776a` | Variantes verticales S23 Ultra |
| `onboarding.tsx` | `5dbce54` | Variante de refonte de l'onboarding |

L'audit des références suivies par Git ne trouve aucun import de ces cinq fichiers,
ni de script qui les applique. Leur comparaison avec les écrans actifs montre des
versions antérieures des ajustements responsive. Leurs chemins `../components`
et `../assets` supposent un emplacement dans `app/`, et leurs propriétés
`StatusBar.translucent` / `backgroundColor` ne correspondent plus aux types React
Native installés. Les écrans actifs ont déjà été adaptés.

Ces variantes restent disponibles comme références, sans modification ni
suppression. `tsconfig.json` les exclut individuellement du contrôle TypeScript
et conserve les exclusions de la configuration de base Expo. Les écrans actifs
et les autres sources TypeScript restent contrôlés en mode strict.

Avant toute réutilisation d'une variante, adapter ses chemins et ses API à la
version courante, puis la valider avec `npx tsc --noEmit`. Une exclusion ne protège
pas un fichier importé par une source active : TypeScript le contrôle à nouveau.
