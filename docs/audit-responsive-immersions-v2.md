# Audit responsive V2 — passe 2 Android

## Périmètre et état avant correction

Cette passe cible les immersions Café, Métro, Restaurant et Aéroport, leurs hubs de missions, dialogues guidés et vocaux, les vidéos, les modales associées et l'écran Listen Café. L'audit général déjà validé n'est pas rejoué, sauf pour les composants partagés touchés par cette passe.

Formats Android contrôlés :

- 320 × 700 dp — téléphone petit ;
- 360 × 800 dp — téléphone compact ;
- 390 × 844 dp — téléphone de référence ;
- 430 × 932 dp — grand téléphone ;
- 800 × 1280 dp — tablette portrait ;
- 1280 × 800 dp — tablette paysage.

## Problèmes observés avant correction

1. Sur tablette portrait, les cadres vidéo Café et Restaurant s'élargissent presque jusqu'à la largeur maximale du contenu. Comme les sources sont verticales et affichées en `cover`, ce ratio trop horizontal produit un recadrage très excessif du visage et du décor.
2. L'écran Listen Café ne possède pas de largeur maximale sur tablette paysage : la carte s'étire sur presque 1 250 dp, tandis que l'avatar et les contenus restent petits et isolés dans un grand espace vide.
3. Le cadre figé de l'avatar Listen mesure 162 dp alors que l'avatar immersif interne en demande environ 170 ; ses bords sont visuellement coupés.
4. Dans Restaurant sur grand téléphone, le libellé d'étape « Commande » passe sur deux lignes avec une lettre isolée, ce qui déstabilise la barre de progression entre deux scènes.
5. Plusieurs contrôles fréquents sont sous le minimum tactile de 44 dp : retours des quatre scènes (42 dp), sortie Listen (environ 30 dp), répétition Listen (42 dp) et fermetures de bilans (40 dp).
6. Le composant partagé de dialogue limite sa hauteur à partir d'une marge visuelle fixe, sans inclure explicitement les insets de barre système. Sur un petit écran ou avec une barre de navigation haute, la marge sûre n'est donc pas garantie.
7. Une source vidéo déclarée mais lente, absente ou illisible ne déclenche pas le secours réservé aux scènes sans source. La scène peut rester bloquée sur un média non chargé, car l'échec de remplacement est seulement ignoré.
8. Les règles de ratio média, de largeur immersive, de cible tactile et d'état de chargement sont dupliquées entre les quatre scènes, avec des résultats différents selon la largeur.
9. La modale de bilan Métro combine `presentationStyle="pageSheet"` et `transparent`, combinaison non prise en charge par React Native et signalée à chaque rendu Android.
10. Dans le lecteur audio partagé, une erreur native asynchrone n'est nettoyée que si l'appelant fournit un callback. Listen Café n'en fournissant pas, son état « Lecture… » peut rester actif après une erreur média.
11. Une vidéo mise en pause par Android lors d'un passage très bref en arrière-plan ne repart pas au retour dans l'application. Le dialogue reste alors bloqué sur « Écoute de l'interlocuteur… ».

## Comportements déjà conformes avant correction

- Les modales de lancement tiennent intégralement sur 320 × 700 dp et leur contenu est scrollable.
- Les choix, sous-titres, textes coréens et feedbacks vocaux longs restent lisibles et accessibles par défilement.
- Les doubles validations sont déjà bloquées par l'état de transition dans les quatre moteurs de dialogue.
- L'ouverture du microphone Android, l'écoute, l'arrêt, l'erreur sans parole, l'aide et la nouvelle tentative fonctionnent sur appareil émulé.
- Une rotation réelle pendant une mission Métro conserve l'état courant ; le contenu paysage reste accessible par défilement.
- Les transitions guidées Café et Métro, la répétition et les bilans n'ont pas laissé de contenu de l'écran précédent visible.
- Les lectures audio et vidéo disposent déjà d'un nettoyage à la sortie ; une vérification après correction reste prévue.

Les captures et hiérarchies Android de l'état initial sont conservées dans `artifacts/responsive-v2/` sous le préfixe `pass2-before-`.

## Parcours réellement exécutés

- Café `order-simple`, guidé, jusqu'au bilan : commande, demande de répétition, choix sur place/à emporter, paiement, reçu, fin et retour.
- Café `order-takeout`, vocal, jusqu'au bilan : permission Android réelle, écoute, arrêt, erreur sans parole, nouvelle tentative, aide, reformulation proposée puis fin de mission.
- Métro `hongik-gangnam`, guidé, jusqu'au bilan : ligne, quai, durée, correspondance, sortie, repère, remerciement et fin alternative ; la répétition a été rejouée séparément.
- Métro `ask-direction`, vocal : ouverture de l'aide, conservation de l'état pendant une rotation portrait/paysage.
- Restaurant `order-meat` : introduction, commande de samgyeopsal et branche de répétition.
- Aéroport `go-seoul-station` : introduction et premier choix long coréen/français.
- Mission Café `order-dessert` avec accès Premium verrouillé : carte verrouillée puis ouverture de l'écran Premium.
- Listen Café : lecture automatique, fin, réécoute, sortie et lecture de `cafe-9.mp3`, le média le plus volumineux de la session active.
- Navigation complexe : double appui à 40 ms pendant une transition Métro, sortie anticipée pendant lecture/écoute, arrière-plan puis reprise, retour et rotation réelle.

## Corrections appliquées

- Ajout d'une règle commune de cadre portrait : ratio stable, hauteur bornée par le viewport et largeur explicite. Les téléphones gardent un média généreux, tandis que les tablettes n'étirent plus la vidéo verticalement dans un cadre presque carré.
- Centralisation des propriétés `VideoView`, de la largeur immersive maximale, du padding inférieur sûr et du minimum tactile de 44 dp.
- Ajout d'un état média partagé `loading / ready / error`, d'un watchdog de huit secondes et d'un overlay non bloquant. Une vidéo absente ou en échec rejoint ensuite le mécanisme d'avance textuelle existant au lieu de bloquer la scène.
- Ajout d'un cycle vidéo partagé : pause hors écran/arrière-plan, reprise de la vidéo active au retour, pause à la sortie.
- Remplacement des quatre barres d'étapes dupliquées par une progression partagée mono-ligne ; le mode dense à cinq étapes utilise la variante typographique compacte du projet.
- Dialogue partagé rendu explicitement compatible avec les safe areas supérieure et inférieure, y compris avec barre de navigation Android haute.
- Suppression de la combinaison Android invalide `pageSheet + transparent` du bilan Métro ; largeur maximale de 680 dp sur tablette.
- Cibles retour/fermeture/répétition portées à 44 dp sur scènes, hubs, bilans et Listen.
- Listen Café recentré dans une colonne de 760 dp sur tablette, avatar figé élargi pour ne plus être rogné, catégories autorisées à revenir proprement à la ligne et padding inférieur lié à la safe area.
- Nettoyage audio exécuté pour toute erreur native asynchrone, même sans callback ; Listen affiche désormais un feedback d'erreur et rend immédiatement la réécoute disponible.

## Vérifications après correction

Appareil : émulateur Android `sdk_gphone64_x86_64`, Android 16 / API 36.

| Profil | Résolution logique | Scènes de contrôle après correction |
| --- | ---: | --- |
| Petit téléphone | 320 × 700 dp | Aéroport, Restaurant, Listen, hub Café, lancement, verrouillage Premium |
| Téléphone compact | 360 × 800 dp | Café vocal : idle, écoute, erreur, actions, sortie |
| Téléphone de référence | 390 × 844 dp | Métro guidé, double appui, transition, répétition |
| Grand téléphone | 430 × 932 dp | Restaurant, vidéo, progression dense, choix longs |
| Tablette portrait | 800 × 1280 dp | Café, Restaurant et Métro vocal |
| Tablette paysage | 1280 × 800 dp | Listen Café et rotation réelle d'une mission Métro vocale |

Contrôles techniques exécutés :

- `npx tsc --noEmit` : réussi ;
- ESLint ciblé sur les nouvelles primitives, Listen, les modales et les hubs modifiés : réussi ;
- `npm run test:cafe-speech` : 357/357 ;
- `npm run test:metro-speech` : 29/29 ;
- `npm run test:choices` : 5/5 ;
- inventaire de 135 médias IA/Listen : aucun fichier vide ;
- `git diff --check` : réussi ;
- inspection Android `dumpsys media_session` : état `PLAYING` supprimé après sortie ; pause réelle en arrière-plan, puis reprise `PLAYING` après correction ;
- captures PNG et arbres UIAutomator après correction : préfixe `pass2-after-`, sans overflow sur les captures retenues.

Le lint global reste en échec sur des erreurs React Compiler déjà présentes hors périmètre, notamment dans `app/(tabs)/index.tsx` et plusieurs écrans vocabulaire. `validate:ui` reste également en échec car la route active `app/index.tsx` ne passe pas par `AppText`. Aucun de ces deux échecs ne provient des fichiers de cette passe.

## Limites restantes

- Aucun audio réellement long n'est fourni par les écrans Listen actifs. Le plus grand fichier de la session Café, `cafe-9.mp3`, ne pèse que 23 661 octets ; il a été lu jusqu'à la fin et rejoué, mais ne permet pas un test d'endurance longue durée.
- Les écrans Listen Métro et Restaurant sont actuellement des placeholders sans média, donc aucun scénario audio complet n'y est exécutable.
- Une source média réellement corrompue n'a pas été injectée dans les assets afin de ne pas altérer le bundle. Les branches d'erreur et de timeout sont couvertes par le runtime commun et le lecteur audio, mais le test Android a conservé les médias livrés intacts.
- Le lancement d'un second serveur Metro avec `EXPO_PUBLIC_DEV_UNLOCK_ALL=0` a été refusé par le dev-client. L'état verrouillé a donc été testé avec la bascule de prévisualisation existante, restaurée immédiatement à sa valeur initiale après les captures.
- Après certains changements forcés `wm size/density`, le premier `screencap` pouvait encore montrer la frame du profil précédent alors que l'arbre UI était déjà à jour. Le phénomène disparaissait après stabilisation et n'a pas été reproduit lors d'une navigation normale dans l'application ; seules les captures `settled` sont retenues comme preuves.
