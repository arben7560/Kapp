# Audit iPhone audio/vidéo

## Politique livrée

- `expo-audio` et `expo-video` utilisent une session de lecture sans
  arrière-plan, audible avec le commutateur silencieux pour les fichiers MP3 et
  les pistes vidéo.
- Le microphone prend temporairement l’unique propriété de la session, arrête
  le média actif, puis restaure explicitement une session de lecture avec
  `allowsRecording: false` et `shouldRouteThroughEarpiece: false`.
- Un blur, un démontage ou un passage hors de l’état `active` arrête les MP3,
  interrompt la reconnaissance, stoppe le TTS et met la vidéo en pause au
  timestamp courant.
- Le retour au premier plan ne relance rien. Une vidéo interrompue expose
  l’action manuelle « Reprendre ».

Ces changements de plugins et de permissions exigent une nouvelle build iOS et
Android. Ils ne peuvent pas être validés complètement dans Expo Go.

## Inventaire `expo-speech`

Les 17 consommateurs recensés passent désormais par le coordinateur commun et
le nettoyage blur/démontage :

1. `app/(tabs)/voc/emotion.tsx`
2. `app/(tabs)/voc/famille.tsx`
3. `app/(tabs)/voc/health.tsx`
4. `app/(tabs)/voc/lieux.tsx`
5. `app/(tabs)/voc/meteo.tsx`
6. `app/(tabs)/voc/objets.tsx`
7. `app/(tabs)/voc/voyage.tsx`
8. `app/lesson/airport.tsx`
9. `app/lesson/cafe.tsx`
10. `app/lesson/magasin.tsx`
11. `app/lesson/metro.tsx`
12. `app/lesson/restaurant.tsx`
13. `app/listen/index-quiz.tsx`
14. `components/cafe/CafeConversationSummaryModal.tsx`
15. `components/classificateur/ClassifierImmersionScreen.tsx`
16. `components/comptage/CountingImmersionScreen.tsx`
17. `components/metro/MetroConversationSummaryModal.tsx`

`expo-speech` ne garantit toujours pas que la synthèse iOS soit audible avec le
commutateur silencieux. Le coordinateur utilise la session de l’application
lorsque l’API le permet, mais cela ne remplace pas un fichier audio contrôlé.

À migrer ultérieurement vers des fichiers `expo-audio`, par priorité :

- les phrases sources des exercices d’écoute (`app/listen/index-quiz.tsx`) ;
- les répliques centrales des leçons Café, Métro, Restaurant et Aéroport ;
- les phrases « à retenir » des bilans Café et Métro ;
- les nombres ou consignes dont l’écoute conditionne une réponse pédagogique.

Les aperçus lexicaux secondaires peuvent rester en TTS tant qu’ils ne
conditionnent ni validation, ni progression, ni XP.

## Vidéos atypiques

Inspection des tables MP4 `stsd` et des descripteurs `esds` :

- `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_landmark_info.mp4` :
  `avc1` (H.264) + `mp4a`, object type `0x40`, audio object type `2`
  (AAC-LC) ;
- `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info.mp4` :
  `avc1` (H.264) + AAC-LC ;
- `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station.mp4` :
  `avc1` (H.264) + AAC-LC.

Des chaînes `ac-3` ou `alac` existent dans les octets de certains fichiers,
mais ne sont pas les entrées codec des pistes. Aucune conversion ni
modification des originaux n’est donc nécessaire.

Si une future source comporte réellement une entrée audio `ac-3` ou `alac`, la
conversion recommandée est :

```bash
ffmpeg -i input.mp4 -map 0:v:0 -map 0:a:0 -c:v libx264 -crf 18 -preset slow -c:a aac -profile:a aac_low -b:a 192k -movflags +faststart output-h264-aac.mp4
```

## Validation iPhone restante

À vérifier sur un vrai iPhone avec une development build :

- commutateur silencieux pour chaque MP3 et chaque vidéo ;
- appel entrant, Siri, verrouillage et changement d’application ;
- retrait d’écouteurs et changement Bluetooth/haut-parleur ;
- retour du son sur le haut-parleur après chaque fin, erreur et abort micro ;
- absence de reprise automatique et reprise manuelle au timestamp exact ;
- comportement `expo-speech`, qui reste dépendant d’iOS.
