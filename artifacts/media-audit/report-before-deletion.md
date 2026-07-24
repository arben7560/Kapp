# Audit des médias K-App — rapport avant suppression

Généré le 2026-07-23T21:59:26.580Z.

## Périmètre et méthode

- 710 médias inspectés sous `assets` (482 908 533 octets).
- 596 fichiers texte du projet inspectés, y compris application, données, scripts, documentation, configuration et sources natives Android.
- Recherche des chemins complets, littéraux relatifs résolus depuis chaque fichier, noms de fichiers seuls, registres/dictionnaires, configurations Expo, scripts et constructions dynamiques.
- Les sorties générées, dépendances et anciens artefacts (`node_modules`, `dist`, `.expo*`, `artifacts`, `tmp`, `.git`) sont exclus comme sources d’usage.
- Le glob Expo `assetBundlePatterns: ["assets/**/*"]` est une règle d’empaquetage générale, pas une preuve d’usage fonctionnel individuel. Les chemins explicites de configuration sont comptés comme utilisés.
- Principe conservateur : tout chemin dynamique, nom dupliqué ambigu ou membre non référencé d’une séquence numérotée partiellement utilisée est classé « à vérifier manuellement ».

## Synthèse

- Médias utilisés : **642**.
- Médias certainement orphelins : **58** (56 971 617 octets).
- Médias à vérifier manuellement : **10**.

## 1. Médias utilisés

### `assets/ai/aeroport/ia_end.mp4`

- `app/lesson/aeroportIA.tsx:98` — direct-path — `const iaEnd = require("../../assets/ai/aeroport/ia_end.mp4");`
- `app/lesson/aeroportIA.tsx:98` — direct-resolved-literal — `const iaEnd = require("../../assets/ai/aeroport/ia_end.mp4");`
- `app/lesson/aeroportIA.tsx:98` — indirect-filename-with-parent — `const iaEnd = require("../../assets/ai/aeroport/ia_end.mp4");`

### `assets/ai/aeroport/ia_lost_repeat.mp4`

- `app/lesson/aeroportIA.tsx:79` — direct-path — `const iaLostRepeat = require("../../assets/ai/aeroport/ia_lost_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:79` — direct-resolved-literal — `const iaLostRepeat = require("../../assets/ai/aeroport/ia_lost_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:79` — indirect-unique-filename — `const iaLostRepeat = require("../../assets/ai/aeroport/ia_lost_repeat.mp4");`

### `assets/ai/aeroport/ia_lost.mp4`

- `app/lesson/aeroportIA.tsx:78` — direct-path — `const iaLost = require("../../assets/ai/aeroport/ia_lost.mp4");`
- `app/lesson/aeroportIA.tsx:78` — direct-resolved-literal — `const iaLost = require("../../assets/ai/aeroport/ia_lost.mp4");`
- `app/lesson/aeroportIA.tsx:78` — indirect-unique-filename — `const iaLost = require("../../assets/ai/aeroport/ia_lost.mp4");`

### `assets/ai/aeroport/ia_platform_repeat.mp4`

- `app/lesson/aeroportIA.tsx:91` — direct-path — `const iaPlatformRepeat = require("../../assets/ai/aeroport/ia_platform_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:91` — direct-resolved-literal — `const iaPlatformRepeat = require("../../assets/ai/aeroport/ia_platform_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:91` — indirect-unique-filename — `const iaPlatformRepeat = require("../../assets/ai/aeroport/ia_platform_repeat.mp4");`

### `assets/ai/aeroport/ia_platform.mp4`

- `app/lesson/aeroportIA.tsx:90` — direct-path — `const iaPlatform = require("../../assets/ai/aeroport/ia_platform.mp4");`
- `app/lesson/aeroportIA.tsx:90` — direct-resolved-literal — `const iaPlatform = require("../../assets/ai/aeroport/ia_platform.mp4");`
- `app/lesson/aeroportIA.tsx:90` — indirect-unique-filename — `const iaPlatform = require("../../assets/ai/aeroport/ia_platform.mp4");`

### `assets/ai/aeroport/ia_recommend_repeat.mp4`

- `app/lesson/aeroportIA.tsx:89` — direct-path — `const iaRecommendRepeat = require("../../assets/ai/aeroport/ia_recommend_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:89` — direct-resolved-literal — `const iaRecommendRepeat = require("../../assets/ai/aeroport/ia_recommend_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:89` — indirect-unique-filename — `const iaRecommendRepeat = require("../../assets/ai/aeroport/ia_recommend_repeat.mp4");`

### `assets/ai/aeroport/ia_recommend.mp4`

- `app/lesson/aeroportIA.tsx:88` — direct-path — `const iaRecommend = require("../../assets/ai/aeroport/ia_recommend.mp4");`
- `app/lesson/aeroportIA.tsx:88` — direct-resolved-literal — `const iaRecommend = require("../../assets/ai/aeroport/ia_recommend.mp4");`
- `app/lesson/aeroportIA.tsx:88` — indirect-unique-filename — `const iaRecommend = require("../../assets/ai/aeroport/ia_recommend.mp4");`

### `assets/ai/aeroport/ia_summary_short.mp4`

- `app/lesson/aeroportIA.tsx:97` — direct-path — `const iaSummaryShort = require("../../assets/ai/aeroport/ia_summary_short.mp4");`
- `app/lesson/aeroportIA.tsx:97` — direct-resolved-literal — `const iaSummaryShort = require("../../assets/ai/aeroport/ia_summary_short.mp4");`
- `app/lesson/aeroportIA.tsx:97` — indirect-unique-filename — `const iaSummaryShort = require("../../assets/ai/aeroport/ia_summary_short.mp4");`

### `assets/ai/aeroport/ia_summary.mp4`

- `app/lesson/aeroportIA.tsx:96` — direct-path — `const iaSummary = require("../../assets/ai/aeroport/ia_summary.mp4");`
- `app/lesson/aeroportIA.tsx:96` — direct-resolved-literal — `const iaSummary = require("../../assets/ai/aeroport/ia_summary.mp4");`
- `app/lesson/aeroportIA.tsx:96` — indirect-unique-filename — `const iaSummary = require("../../assets/ai/aeroport/ia_summary.mp4");`

### `assets/ai/aeroport/ia_time_repeat.mp4`

- `app/lesson/aeroportIA.tsx:95` — direct-path — `const iaTimeRepeat = require("../../assets/ai/aeroport/ia_time_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:95` — direct-resolved-literal — `const iaTimeRepeat = require("../../assets/ai/aeroport/ia_time_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:95` — indirect-unique-filename — `const iaTimeRepeat = require("../../assets/ai/aeroport/ia_time_repeat.mp4");`

### `assets/ai/aeroport/ia_time.mp4`

- `app/lesson/aeroportIA.tsx:94` — direct-path — `const iaTime = require("../../assets/ai/aeroport/ia_time.mp4");`
- `app/lesson/aeroportIA.tsx:94` — direct-resolved-literal — `const iaTime = require("../../assets/ai/aeroport/ia_time.mp4");`
- `app/lesson/aeroportIA.tsx:94` — indirect-unique-filename — `const iaTime = require("../../assets/ai/aeroport/ia_time.mp4");`

### `assets/ai/aeroport/ia_tmoney_arex_repeat.mp4`

- `app/lesson/aeroportIA.tsx:85` — direct-path — `const iaTmoneyArexRepeat = require("../../assets/ai/aeroport/ia_tmoney_arex_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:85` — direct-resolved-literal — `const iaTmoneyArexRepeat = require("../../assets/ai/aeroport/ia_tmoney_arex_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:85` — indirect-unique-filename — `const iaTmoneyArexRepeat = require("../../assets/ai/aeroport/ia_tmoney_arex_repeat.mp4");`

### `assets/ai/aeroport/ia_tmoney_arex.mp4`

- `app/lesson/aeroportIA.tsx:84` — direct-path — `const iaTmoneyArex = require("../../assets/ai/aeroport/ia_tmoney_arex.mp4");`
- `app/lesson/aeroportIA.tsx:84` — direct-resolved-literal — `const iaTmoneyArex = require("../../assets/ai/aeroport/ia_tmoney_arex.mp4");`
- `app/lesson/aeroportIA.tsx:84` — indirect-unique-filename — `const iaTmoneyArex = require("../../assets/ai/aeroport/ia_tmoney_arex.mp4");`

### `assets/ai/aeroport/ia_tmoney_charge_repeat.mp4`

- `app/lesson/aeroportIA.tsx:83` — direct-path — `const iaTmoneyChargeRepeat = require("../../assets/ai/aeroport/ia_tmoney_charge_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:83` — direct-resolved-literal — `const iaTmoneyChargeRepeat = require("../../assets/ai/aeroport/ia_tmoney_charge_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:83` — indirect-unique-filename — `const iaTmoneyChargeRepeat = require("../../assets/ai/aeroport/ia_tmoney_charge_repeat.mp4");`

### `assets/ai/aeroport/ia_tmoney_charge.mp4`

- `app/lesson/aeroportIA.tsx:82` — direct-path — `const iaTmoneyCharge = require("../../assets/ai/aeroport/ia_tmoney_charge.mp4");`
- `app/lesson/aeroportIA.tsx:82` — direct-resolved-literal — `const iaTmoneyCharge = require("../../assets/ai/aeroport/ia_tmoney_charge.mp4");`
- `app/lesson/aeroportIA.tsx:82` — indirect-unique-filename — `const iaTmoneyCharge = require("../../assets/ai/aeroport/ia_tmoney_charge.mp4");`

### `assets/ai/aeroport/ia_tmoney_repeat.mp4`

- `app/lesson/aeroportIA.tsx:81` — direct-path — `const iaTmoneyRepeat = require("../../assets/ai/aeroport/ia_tmoney_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:81` — direct-resolved-literal — `const iaTmoneyRepeat = require("../../assets/ai/aeroport/ia_tmoney_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:81` — indirect-unique-filename — `const iaTmoneyRepeat = require("../../assets/ai/aeroport/ia_tmoney_repeat.mp4");`

### `assets/ai/aeroport/ia_tmoney.mp4`

- `app/lesson/aeroportIA.tsx:80` — direct-path — `const iaTmoney = require("../../assets/ai/aeroport/ia_tmoney.mp4");`
- `app/lesson/aeroportIA.tsx:80` — direct-resolved-literal — `const iaTmoney = require("../../assets/ai/aeroport/ia_tmoney.mp4");`
- `app/lesson/aeroportIA.tsx:80` — indirect-unique-filename — `const iaTmoney = require("../../assets/ai/aeroport/ia_tmoney.mp4");`

### `assets/ai/aeroport/ia_transport_repeat.mp4`

- `app/lesson/aeroportIA.tsx:87` — direct-path — `const iaTransportRepeat = require("../../assets/ai/aeroport/ia_transport_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:87` — direct-resolved-literal — `const iaTransportRepeat = require("../../assets/ai/aeroport/ia_transport_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:87` — indirect-unique-filename — `const iaTransportRepeat = require("../../assets/ai/aeroport/ia_transport_repeat.mp4");`

### `assets/ai/aeroport/ia_transport.mp4`

- `app/lesson/aeroportIA.tsx:86` — direct-path — `const iaTransport = require("../../assets/ai/aeroport/ia_transport.mp4");`
- `app/lesson/aeroportIA.tsx:86` — direct-resolved-literal — `const iaTransport = require("../../assets/ai/aeroport/ia_transport.mp4");`
- `app/lesson/aeroportIA.tsx:86` — indirect-unique-filename — `const iaTransport = require("../../assets/ai/aeroport/ia_transport.mp4");`

### `assets/ai/aeroport/ia_verify_train_repeat.mp4`

- `app/lesson/aeroportIA.tsx:93` — direct-path — `const iaVerifyTrainRepeat = require("../../assets/ai/aeroport/ia_verify_train_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:93` — direct-resolved-literal — `const iaVerifyTrainRepeat = require("../../assets/ai/aeroport/ia_verify_train_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:93` — indirect-unique-filename — `const iaVerifyTrainRepeat = require("../../assets/ai/aeroport/ia_verify_train_repeat.mp4");`

### `assets/ai/aeroport/ia_verify_train.mp4`

- `app/lesson/aeroportIA.tsx:92` — direct-path — `const iaVerifyTrain = require("../../assets/ai/aeroport/ia_verify_train.mp4");`
- `app/lesson/aeroportIA.tsx:92` — direct-resolved-literal — `const iaVerifyTrain = require("../../assets/ai/aeroport/ia_verify_train.mp4");`
- `app/lesson/aeroportIA.tsx:92` — indirect-unique-filename — `const iaVerifyTrain = require("../../assets/ai/aeroport/ia_verify_train.mp4");`

### `assets/ai/aeroport/ia_welcome_repeat.mp4`

- `app/lesson/aeroportIA.tsx:77` — direct-path — `const iaWelcomeRepeat = require("../../assets/ai/aeroport/ia_welcome_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:77` — direct-resolved-literal — `const iaWelcomeRepeat = require("../../assets/ai/aeroport/ia_welcome_repeat.mp4");`
- `app/lesson/aeroportIA.tsx:77` — indirect-unique-filename — `const iaWelcomeRepeat = require("../../assets/ai/aeroport/ia_welcome_repeat.mp4");`

### `assets/ai/aeroport/ia_welcome.mp4`

- `app/lesson/aeroportIA.tsx:76` — direct-path — `const iaWelcome = require("../../assets/ai/aeroport/ia_welcome.mp4");`
- `app/lesson/aeroportIA.tsx:76` — direct-resolved-literal — `const iaWelcome = require("../../assets/ai/aeroport/ia_welcome.mp4");`
- `app/lesson/aeroportIA.tsx:76` — indirect-unique-filename — `const iaWelcome = require("../../assets/ai/aeroport/ia_welcome.mp4");`

### `assets/ai/cafe/byCardReceipt.mp4`

- `data/lesson/cafe/cafe.ts:37` — direct-path — `const byCardReceiptVideo = require("../../../assets/ai/cafe/byCardReceipt.mp4");`
- `data/lesson/cafe/cafe.ts:37` — direct-resolved-literal — `const byCardReceiptVideo = require("../../../assets/ai/cafe/byCardReceipt.mp4");`
- `data/lesson/cafe/cafe.ts:37` — indirect-unique-filename — `const byCardReceiptVideo = require("../../../assets/ai/cafe/byCardReceipt.mp4");`

### `assets/ai/cafe/byCardReceiptReal.mp4`

- `app/lesson/cafeIA.tsx:84` — direct-path — `const byCardReceiptReal = require("../../assets/ai/cafe/byCardReceiptReal.mp4");`
- `app/lesson/cafeIA.tsx:84` — direct-resolved-literal — `const byCardReceiptReal = require("../../assets/ai/cafe/byCardReceiptReal.mp4");`
- `app/lesson/cafeIA.tsx:84` — indirect-unique-filename — `const byCardReceiptReal = require("../../assets/ai/cafe/byCardReceiptReal.mp4");`

### `assets/ai/cafe/byCashReceipt.mp4`

- `data/lesson/cafe/cafe.ts:38` — direct-path — `const byCashReceiptVideo = require("../../../assets/ai/cafe/byCashReceipt.mp4");`
- `data/lesson/cafe/cafe.ts:38` — direct-resolved-literal — `const byCashReceiptVideo = require("../../../assets/ai/cafe/byCashReceipt.mp4");`
- `data/lesson/cafe/cafe.ts:38` — indirect-unique-filename — `const byCashReceiptVideo = require("../../../assets/ai/cafe/byCashReceipt.mp4");`

### `assets/ai/cafe/byCashReceiptReal.mp4`

- `app/lesson/cafeIA.tsx:83` — direct-path — `const byCashReceiptReal = require("../../assets/ai/cafe/byCashReceiptReal.mp4");`
- `app/lesson/cafeIA.tsx:83` — direct-resolved-literal — `const byCashReceiptReal = require("../../assets/ai/cafe/byCashReceiptReal.mp4");`
- `app/lesson/cafeIA.tsx:83` — indirect-unique-filename — `const byCashReceiptReal = require("../../assets/ai/cafe/byCashReceiptReal.mp4");`

### `assets/ai/cafe/jingdonbel.mp4`

- `data/lesson/cafe/cafe.ts:39` — direct-path — `const jingdonbelVideo = require("../../../assets/ai/cafe/jingdonbel.mp4");`
- `data/lesson/cafe/cafe.ts:39` — direct-resolved-literal — `const jingdonbelVideo = require("../../../assets/ai/cafe/jingdonbel.mp4");`
- `data/lesson/cafe/cafe.ts:39` — indirect-unique-filename — `const jingdonbelVideo = require("../../../assets/ai/cafe/jingdonbel.mp4");`

### `assets/ai/cafe/jingdonbelReal.mp4`

- `app/lesson/cafeIA.tsx:86` — direct-path — `const jingdonbelReal = require("../../assets/ai/cafe/jingdonbelReal.mp4");`
- `app/lesson/cafeIA.tsx:86` — direct-resolved-literal — `const jingdonbelReal = require("../../assets/ai/cafe/jingdonbelReal.mp4");`
- `app/lesson/cafeIA.tsx:86` — indirect-unique-filename — `const jingdonbelReal = require("../../assets/ai/cafe/jingdonbelReal.mp4");`

### `assets/ai/cafe/orderConfirmation.mp4`

- `data/lesson/cafe/cafe.ts:35` — direct-path — `const orderConfirmationVideo = require("../../../assets/ai/cafe/orderConfirmation.mp4");`
- `data/lesson/cafe/cafe.ts:35` — direct-resolved-literal — `const orderConfirmationVideo = require("../../../assets/ai/cafe/orderConfirmation.mp4");`
- `data/lesson/cafe/cafe.ts:35` — indirect-unique-filename — `const orderConfirmationVideo = require("../../../assets/ai/cafe/orderConfirmation.mp4");`
- `scripts/test-cafe-speech.mjs:1601` — direct-path — `"../assets/ai/cafe/orderConfirmation.mp4",`
- `scripts/test-cafe-speech.mjs:1601` — direct-resolved-literal — `"../assets/ai/cafe/orderConfirmation.mp4",`
- `scripts/test-cafe-speech.mjs:1601` — indirect-unique-filename — `"../assets/ai/cafe/orderConfirmation.mp4",`

### `assets/ai/cafe/orderConfirmationCake.mp4`

- `data/lesson/cafe/cafe.ts:34` — direct-path — `const orderConfirmationCakeVideo = require("../../../assets/ai/cafe/orderConfirmationCake.mp4");`
- `data/lesson/cafe/cafe.ts:34` — direct-resolved-literal — `const orderConfirmationCakeVideo = require("../../../assets/ai/cafe/orderConfirmationCake.mp4");`
- `data/lesson/cafe/cafe.ts:34` — indirect-unique-filename — `const orderConfirmationCakeVideo = require("../../../assets/ai/cafe/orderConfirmationCake.mp4");`

### `assets/ai/cafe/orderConfirmationCakeReal.mp4`

- `app/lesson/cafeIA.tsx:81` — direct-path — `const orderConfirmationCakeReal = require("../../assets/ai/cafe/orderConfirmationCakeReal.mp4");`
- `app/lesson/cafeIA.tsx:81` — direct-resolved-literal — `const orderConfirmationCakeReal = require("../../assets/ai/cafe/orderConfirmationCakeReal.mp4");`
- `app/lesson/cafeIA.tsx:81` — indirect-unique-filename — `const orderConfirmationCakeReal = require("../../assets/ai/cafe/orderConfirmationCakeReal.mp4");`

### `assets/ai/cafe/orderConfirmationJuice.mp4`

- `data/lesson/cafe/cafe.ts:33` — direct-path — `const orderConfirmationJuiceVideo = require("../../../assets/ai/cafe/orderConfirmationJuice.mp4");`
- `data/lesson/cafe/cafe.ts:33` — direct-resolved-literal — `const orderConfirmationJuiceVideo = require("../../../assets/ai/cafe/orderConfirmationJuice.mp4");`
- `data/lesson/cafe/cafe.ts:33` — indirect-unique-filename — `const orderConfirmationJuiceVideo = require("../../../assets/ai/cafe/orderConfirmationJuice.mp4");`

### `assets/ai/cafe/orderConfirmationJuiceReal.mp4`

- `app/lesson/cafeIA.tsx:80` — direct-path — `const orderConfirmationJuiceReal = require("../../assets/ai/cafe/orderConfirmationJuiceReal.mp4");`
- `app/lesson/cafeIA.tsx:80` — direct-resolved-literal — `const orderConfirmationJuiceReal = require("../../assets/ai/cafe/orderConfirmationJuiceReal.mp4");`
- `app/lesson/cafeIA.tsx:80` — indirect-unique-filename — `const orderConfirmationJuiceReal = require("../../assets/ai/cafe/orderConfirmationJuiceReal.mp4");`

### `assets/ai/cafe/pricePaimentChoose.mp4`

- `app/lesson/cafeIA.tsx:82` — direct-path — `const pricePaimentChooseVideo = require("../../assets/ai/cafe/pricePaimentChoose.mp4");`
- `app/lesson/cafeIA.tsx:82` — direct-resolved-literal — `const pricePaimentChooseVideo = require("../../assets/ai/cafe/pricePaimentChoose.mp4");`
- `app/lesson/cafeIA.tsx:82` — indirect-unique-filename — `const pricePaimentChooseVideo = require("../../assets/ai/cafe/pricePaimentChoose.mp4");`
- `data/lesson/cafe/cafe.ts:36` — direct-path — `const pricePaimentChooseVideo = require("../../../assets/ai/cafe/pricePaimentChoose.mp4");`
- `data/lesson/cafe/cafe.ts:36` — direct-resolved-literal — `const pricePaimentChooseVideo = require("../../../assets/ai/cafe/pricePaimentChoose.mp4");`
- `data/lesson/cafe/cafe.ts:36` — indirect-unique-filename — `const pricePaimentChooseVideo = require("../../../assets/ai/cafe/pricePaimentChoose.mp4");`
- `scripts/test-cafe-speech.mjs:1670` — direct-path — `"../assets/ai/cafe/pricePaimentChoose.mp4",`
- `scripts/test-cafe-speech.mjs:1670` — direct-resolved-literal — `"../assets/ai/cafe/pricePaimentChoose.mp4",`
- `scripts/test-cafe-speech.mjs:1670` — indirect-unique-filename — `"../assets/ai/cafe/pricePaimentChoose.mp4",`

### `assets/ai/cafe/takeOutThanks.mp4`

- `data/lesson/cafe/cafe.ts:40` — direct-path — `const takeOutThanksVideo = require("../../../assets/ai/cafe/takeOutThanks.mp4");`
- `data/lesson/cafe/cafe.ts:40` — direct-resolved-literal — `const takeOutThanksVideo = require("../../../assets/ai/cafe/takeOutThanks.mp4");`
- `data/lesson/cafe/cafe.ts:40` — indirect-unique-filename — `const takeOutThanksVideo = require("../../../assets/ai/cafe/takeOutThanks.mp4");`

### `assets/ai/cafe/takeOutThanksReal.mp4`

- `app/lesson/cafeIA.tsx:85` — direct-path — `const takeOutThanksReal = require("../../assets/ai/cafe/takeOutThanksReal.mp4");`
- `app/lesson/cafeIA.tsx:85` — direct-resolved-literal — `const takeOutThanksReal = require("../../assets/ai/cafe/takeOutThanksReal.mp4");`
- `app/lesson/cafeIA.tsx:85` — indirect-unique-filename — `const takeOutThanksReal = require("../../assets/ai/cafe/takeOutThanksReal.mp4");`

### `assets/ai/cafe/welcomeCafe.mp4`

- `app/lesson/cafeIA.tsx:87` — direct-path — `const cafeIdleVideo = require("../../assets/ai/cafe/welcomeCafe.mp4");`
- `app/lesson/cafeIA.tsx:87` — direct-resolved-literal — `const cafeIdleVideo = require("../../assets/ai/cafe/welcomeCafe.mp4");`
- `app/lesson/cafeIA.tsx:87` — indirect-unique-filename — `const cafeIdleVideo = require("../../assets/ai/cafe/welcomeCafe.mp4");`
- `data/lesson/cafe/cafe.ts:32` — direct-path — `const welcomeCafeVideo = require("../../../assets/ai/cafe/welcomeCafe.mp4");`
- `data/lesson/cafe/cafe.ts:32` — direct-resolved-literal — `const welcomeCafeVideo = require("../../../assets/ai/cafe/welcomeCafe.mp4");`
- `data/lesson/cafe/cafe.ts:32` — indirect-unique-filename — `const welcomeCafeVideo = require("../../../assets/ai/cafe/welcomeCafe.mp4");`

### `assets/ai/cafe/welcomeCafeReal.mp4`

- `app/lesson/cafeIA.tsx:79` — direct-path — `const welcomeCafeReal = require("../../assets/ai/cafe/welcomeCafeReal.mp4");`
- `app/lesson/cafeIA.tsx:79` — direct-resolved-literal — `const welcomeCafeReal = require("../../assets/ai/cafe/welcomeCafeReal.mp4");`
- `app/lesson/cafeIA.tsx:79` — indirect-unique-filename — `const welcomeCafeReal = require("../../assets/ai/cafe/welcomeCafeReal.mp4");`

### `assets/ai/listen/cafe/cafe-1.mp3`

- `data/listen/cafe.ts:18` — direct-path — `"cafe-1": require("../../assets/ai/listen/cafe/cafe-1.mp3"),`
- `data/listen/cafe.ts:18` — direct-resolved-literal — `"cafe-1": require("../../assets/ai/listen/cafe/cafe-1.mp3"),`
- `data/listen/cafe.ts:18` — indirect-unique-filename — `"cafe-1": require("../../assets/ai/listen/cafe/cafe-1.mp3"),`

### `assets/ai/listen/cafe/cafe-10.mp3`

- `data/listen/cafe.ts:27` — direct-path — `"cafe-10": require("../../assets/ai/listen/cafe/cafe-10.mp3"),`
- `data/listen/cafe.ts:27` — direct-resolved-literal — `"cafe-10": require("../../assets/ai/listen/cafe/cafe-10.mp3"),`
- `data/listen/cafe.ts:27` — indirect-unique-filename — `"cafe-10": require("../../assets/ai/listen/cafe/cafe-10.mp3"),`

### `assets/ai/listen/cafe/cafe-2.mp3`

- `data/listen/cafe.ts:19` — direct-path — `"cafe-2": require("../../assets/ai/listen/cafe/cafe-2.mp3"),`
- `data/listen/cafe.ts:19` — direct-resolved-literal — `"cafe-2": require("../../assets/ai/listen/cafe/cafe-2.mp3"),`
- `data/listen/cafe.ts:19` — indirect-unique-filename — `"cafe-2": require("../../assets/ai/listen/cafe/cafe-2.mp3"),`

### `assets/ai/listen/cafe/cafe-3.mp3`

- `data/listen/cafe.ts:20` — direct-path — `"cafe-3": require("../../assets/ai/listen/cafe/cafe-3.mp3"),`
- `data/listen/cafe.ts:20` — direct-resolved-literal — `"cafe-3": require("../../assets/ai/listen/cafe/cafe-3.mp3"),`
- `data/listen/cafe.ts:20` — indirect-unique-filename — `"cafe-3": require("../../assets/ai/listen/cafe/cafe-3.mp3"),`

### `assets/ai/listen/cafe/cafe-4.mp3`

- `data/listen/cafe.ts:21` — direct-path — `"cafe-4": require("../../assets/ai/listen/cafe/cafe-4.mp3"),`
- `data/listen/cafe.ts:21` — direct-resolved-literal — `"cafe-4": require("../../assets/ai/listen/cafe/cafe-4.mp3"),`
- `data/listen/cafe.ts:21` — indirect-unique-filename — `"cafe-4": require("../../assets/ai/listen/cafe/cafe-4.mp3"),`

### `assets/ai/listen/cafe/cafe-5.mp3`

- `data/listen/cafe.ts:22` — direct-path — `"cafe-5": require("../../assets/ai/listen/cafe/cafe-5.mp3"),`
- `data/listen/cafe.ts:22` — direct-resolved-literal — `"cafe-5": require("../../assets/ai/listen/cafe/cafe-5.mp3"),`
- `data/listen/cafe.ts:22` — indirect-unique-filename — `"cafe-5": require("../../assets/ai/listen/cafe/cafe-5.mp3"),`

### `assets/ai/listen/cafe/cafe-6.mp3`

- `data/listen/cafe.ts:23` — direct-path — `"cafe-6": require("../../assets/ai/listen/cafe/cafe-6.mp3"),`
- `data/listen/cafe.ts:23` — direct-resolved-literal — `"cafe-6": require("../../assets/ai/listen/cafe/cafe-6.mp3"),`
- `data/listen/cafe.ts:23` — indirect-unique-filename — `"cafe-6": require("../../assets/ai/listen/cafe/cafe-6.mp3"),`

### `assets/ai/listen/cafe/cafe-7.mp3`

- `data/listen/cafe.ts:24` — direct-path — `"cafe-7": require("../../assets/ai/listen/cafe/cafe-7.mp3"),`
- `data/listen/cafe.ts:24` — direct-resolved-literal — `"cafe-7": require("../../assets/ai/listen/cafe/cafe-7.mp3"),`
- `data/listen/cafe.ts:24` — indirect-unique-filename — `"cafe-7": require("../../assets/ai/listen/cafe/cafe-7.mp3"),`

### `assets/ai/listen/cafe/cafe-8.mp3`

- `data/listen/cafe.ts:25` — direct-path — `"cafe-8": require("../../assets/ai/listen/cafe/cafe-8.mp3"),`
- `data/listen/cafe.ts:25` — direct-resolved-literal — `"cafe-8": require("../../assets/ai/listen/cafe/cafe-8.mp3"),`
- `data/listen/cafe.ts:25` — indirect-unique-filename — `"cafe-8": require("../../assets/ai/listen/cafe/cafe-8.mp3"),`

### `assets/ai/listen/cafe/cafe-9.mp3`

- `data/listen/cafe.ts:26` — direct-path — `"cafe-9": require("../../assets/ai/listen/cafe/cafe-9.mp3"),`
- `data/listen/cafe.ts:26` — direct-resolved-literal — `"cafe-9": require("../../assets/ai/listen/cafe/cafe-9.mp3"),`
- `data/listen/cafe.ts:26` — indirect-unique-filename — `"cafe-9": require("../../assets/ai/listen/cafe/cafe-9.mp3"),`
- `docs/audit-responsive-immersions-v2.md:51` — indirect-unique-filename — `- Listen Café : lecture automatique, fin, réécoute, sortie et lecture de \`cafe-9.mp3\`, le média le plus volumineux de la session active.`
- `docs/audit-responsive-immersions-v2.md:96` — indirect-unique-filename — `- Aucun audio réellement long n'est fourni par les écrans Listen actifs. Le plus grand fichier de la session Café, \`cafe-9.mp3\`, ne pèse que 23 661 octets ; il a été lu jusqu'à la fin et rejoué, mais ne permet pas un test d'endurance longue durée.`

### `assets/ai/metro/Hongik-to-Gangnam/ia_end_summary_short.mp4`

- `app/lesson/metroIA.tsx:101` — direct-path — `ia_end_summary_short: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary_short.mp4"),`
- `app/lesson/metroIA.tsx:101` — direct-resolved-literal — `ia_end_summary_short: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary_short.mp4"),`
- `app/lesson/metroIA.tsx:101` — indirect-filename-with-parent — `ia_end_summary_short: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary_short.mp4"),`

### `assets/ai/metro/Hongik-to-Gangnam/ia_end_summary.mp4`

- `app/lesson/metroIA.tsx:100` — direct-path — `ia_end_summary: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary.mp4"),`
- `app/lesson/metroIA.tsx:100` — direct-resolved-literal — `ia_end_summary: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary.mp4"),`
- `app/lesson/metroIA.tsx:100` — indirect-filename-with-parent — `ia_end_summary: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary.mp4"),`

### `assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4`

- `app/lesson/metroIA.tsx:74` — direct-path — `const iaEnd = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4");`
- `app/lesson/metroIA.tsx:74` — direct-resolved-literal — `const iaEnd = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4");`
- `app/lesson/metroIA.tsx:74` — indirect-filename-with-parent — `const iaEnd = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4");`
- `scripts/test-metro-speech.mjs:765` — direct-path — `"../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4",`
- `scripts/test-metro-speech.mjs:765` — direct-resolved-literal — `"../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4",`
- `scripts/test-metro-speech.mjs:765` — indirect-filename-with-parent — `"../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4",`

### `assets/ai/metro/Hongik-to-Gangnam/ia_exit_info.mp4`

- `app/lesson/metroIA.tsx:70` — direct-path — `const iaExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_info.mp4");`
- `app/lesson/metroIA.tsx:70` — direct-resolved-literal — `const iaExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_info.mp4");`
- `app/lesson/metroIA.tsx:70` — indirect-filename-with-parent — `const iaExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_info.mp4");`

### `assets/ai/metro/Hongik-to-Gangnam/ia_exit_landmark_info.mp4`

- `app/lesson/metroIA.tsx:97` — direct-path — `ia_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:97` — direct-resolved-literal — `ia_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:97` — indirect-filename-with-parent — `ia_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_landmark_info.mp4"),`

### `assets/ai/metro/Hongik-to-Gangnam/ia_intro_route.mp4`

- `app/lesson/metroIA.tsx:80` — direct-path — `ia_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_intro_route.mp4"),`
- `app/lesson/metroIA.tsx:80` — direct-resolved-literal — `ia_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_intro_route.mp4"),`
- `app/lesson/metroIA.tsx:80` — indirect-unique-filename — `ia_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_intro_route.mp4"),`

### `assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4`

- `app/lesson/metroIA.tsx:83` — direct-path — `ia_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4"),`
- `app/lesson/metroIA.tsx:83` — direct-resolved-literal — `ia_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4"),`
- `app/lesson/metroIA.tsx:83` — indirect-unique-filename — `ia_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4"),`
- `scripts/test-metro-speech.mjs:763` — direct-path — `"../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4",`
- `scripts/test-metro-speech.mjs:763` — direct-resolved-literal — `"../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4",`
- `scripts/test-metro-speech.mjs:763` — indirect-unique-filename — `"../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4",`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info_short.mp4`

- `app/lesson/metroIA.tsx:72` — direct-path — `const iaRepeatExitInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info_short.mp4");`
- `app/lesson/metroIA.tsx:72` — direct-resolved-literal — `const iaRepeatExitInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info_short.mp4");`
- `app/lesson/metroIA.tsx:72` — indirect-unique-filename — `const iaRepeatExitInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info_short.mp4");`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info.mp4`

- `app/lesson/metroIA.tsx:71` — direct-path — `const iaRepeatExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info.mp4");`
- `app/lesson/metroIA.tsx:71` — direct-resolved-literal — `const iaRepeatExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info.mp4");`
- `app/lesson/metroIA.tsx:71` — indirect-filename-with-parent — `const iaRepeatExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info.mp4");`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info.mp4`

- `app/lesson/metroIA.tsx:98` — direct-path — `ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:98` — direct-resolved-literal — `ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:98` — indirect-filename-with-parent — `ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info.mp4"),`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_intro_route.mp4`

- `app/lesson/metroIA.tsx:81` — direct-path — `ia_repeat_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_intro_route.mp4"),`
- `app/lesson/metroIA.tsx:81` — direct-resolved-literal — `ia_repeat_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_intro_route.mp4"),`
- `app/lesson/metroIA.tsx:81` — indirect-filename-with-parent — `ia_repeat_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_intro_route.mp4"),`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4`

- `app/lesson/metroIA.tsx:84` — direct-path — `ia_repeat_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4"),`
- `app/lesson/metroIA.tsx:84` — direct-resolved-literal — `ia_repeat_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4"),`
- `app/lesson/metroIA.tsx:84` — indirect-unique-filename — `ia_repeat_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4"),`
- `scripts/test-metro-speech.mjs:764` — direct-path — `"../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4",`
- `scripts/test-metro-speech.mjs:764` — direct-resolved-literal — `"../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4",`
- `scripts/test-metro-speech.mjs:764` — indirect-unique-filename — `"../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4",`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info_short.mp4`

- `app/lesson/metroIA.tsx:68` — direct-path — `const iaRepeatTransferInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info_short.mp4");`
- `app/lesson/metroIA.tsx:68` — direct-resolved-literal — `const iaRepeatTransferInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info_short.mp4");`
- `app/lesson/metroIA.tsx:68` — indirect-unique-filename — `const iaRepeatTransferInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info_short.mp4");`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info.mp4`

- `app/lesson/metroIA.tsx:67` — direct-path — `const iaRepeatTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info.mp4");`
- `app/lesson/metroIA.tsx:67` — direct-resolved-literal — `const iaRepeatTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info.mp4");`
- `app/lesson/metroIA.tsx:67` — indirect-unique-filename — `const iaRepeatTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info.mp4");`
- `scripts/test-metro-speech.mjs:739` — indirect-unique-filename — `"ia_repeat_transfer_info.mp4",`

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_trip_time.mp4`

- `app/lesson/metroIA.tsx:87` — direct-path — `ia_repeat_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:87` — direct-resolved-literal — `ia_repeat_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:87` — indirect-filename-with-parent — `ia_repeat_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_trip_time.mp4"),`

### `assets/ai/metro/Hongik-to-Gangnam/ia_transfer_info.mp4`

- `app/lesson/metroIA.tsx:66` — direct-path — `const iaTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_transfer_info.mp4");`
- `app/lesson/metroIA.tsx:66` — direct-resolved-literal — `const iaTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_transfer_info.mp4");`
- `app/lesson/metroIA.tsx:66` — indirect-unique-filename — `const iaTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_transfer_info.mp4");`
- `scripts/test-metro-speech.mjs:738` — indirect-unique-filename — `"ia_transfer_info.mp4",`

### `assets/ai/metro/Hongik-to-Gangnam/ia_trip_time.mp4`

- `app/lesson/metroIA.tsx:86` — direct-path — `ia_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:86` — direct-resolved-literal — `ia_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:86` — indirect-filename-with-parent — `ia_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_trip_time.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary_short.mp4`

- `app/lesson/metroIA.tsx:134` — direct-path — `ia_end_summary_short: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary_short.mp4"),`
- `app/lesson/metroIA.tsx:134` — direct-resolved-literal — `ia_end_summary_short: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary_short.mp4"),`
- `app/lesson/metroIA.tsx:134` — indirect-filename-with-parent — `ia_end_summary_short: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary_short.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary.mp4`

- `app/lesson/metroIA.tsx:133` — direct-path — `ia_end_summary: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary.mp4"),`
- `app/lesson/metroIA.tsx:133` — direct-resolved-literal — `ia_end_summary: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary.mp4"),`
- `app/lesson/metroIA.tsx:133` — indirect-filename-with-parent — `ia_end_summary: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_end.mp4`

- `app/lesson/metroIA.tsx:135` — direct-path — `ia_end: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end.mp4"),`
- `app/lesson/metroIA.tsx:135` — direct-resolved-literal — `ia_end: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end.mp4"),`
- `app/lesson/metroIA.tsx:135` — indirect-filename-with-parent — `ia_end: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_info.mp4`

- `app/lesson/metroIA.tsx:124` — direct-path — `ia_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_info.mp4"),`
- `app/lesson/metroIA.tsx:124` — direct-resolved-literal — `ia_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_info.mp4"),`
- `app/lesson/metroIA.tsx:124` — indirect-filename-with-parent — `ia_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_info.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_landmark_info.mp4`

- `app/lesson/metroIA.tsx:127` — direct-path — `ia_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:127` — direct-resolved-literal — `ia_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:127` — indirect-filename-with-parent — `ia_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_landmark_info.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_info_route.mp4`

- `app/lesson/metroIA.tsx:106` — direct-path — `ia_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_info_route.mp4"),`
- `app/lesson/metroIA.tsx:106` — direct-resolved-literal — `ia_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_info_route.mp4"),`
- `app/lesson/metroIA.tsx:106` — indirect-unique-filename — `ia_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_info_route.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_line4_direction.mp4`

- `app/lesson/metroIA.tsx:109` — direct-path — `ia_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line4_direction.mp4"),`
- `app/lesson/metroIA.tsx:109` — direct-resolved-literal — `ia_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line4_direction.mp4"),`
- `app/lesson/metroIA.tsx:109` — indirect-unique-filename — `ia_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line4_direction.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_line6_direction.mp4`

- `app/lesson/metroIA.tsx:115` — direct-path — `ia_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line6_direction.mp4"),`
- `app/lesson/metroIA.tsx:115` — direct-resolved-literal — `ia_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line6_direction.mp4"),`
- `app/lesson/metroIA.tsx:115` — indirect-unique-filename — `ia_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line6_direction.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_info.mp4`

- `app/lesson/metroIA.tsx:125` — direct-path — `ia_repeat_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_info.mp4"),`
- `app/lesson/metroIA.tsx:125` — direct-resolved-literal — `ia_repeat_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_info.mp4"),`
- `app/lesson/metroIA.tsx:125` — indirect-filename-with-parent — `ia_repeat_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_info.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_landmark_info.mp4`

- `app/lesson/metroIA.tsx:128` — direct-path — `ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:128` — direct-resolved-literal — `ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_landmark_info.mp4"),`
- `app/lesson/metroIA.tsx:128` — indirect-filename-with-parent — `ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_landmark_info.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_intro_route.mp4`

- `app/lesson/metroIA.tsx:107` — direct-path — `ia_repeat_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_intro_route.mp4"),`
- `app/lesson/metroIA.tsx:107` — direct-resolved-literal — `ia_repeat_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_intro_route.mp4"),`
- `app/lesson/metroIA.tsx:107` — indirect-filename-with-parent — `ia_repeat_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_intro_route.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line4_direction.mp4`

- `app/lesson/metroIA.tsx:110` — direct-path — `ia_repeat_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line4_direction.mp4"),`
- `app/lesson/metroIA.tsx:110` — direct-resolved-literal — `ia_repeat_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line4_direction.mp4"),`
- `app/lesson/metroIA.tsx:110` — indirect-unique-filename — `ia_repeat_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line4_direction.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line6_direction.mp4`

- `app/lesson/metroIA.tsx:116` — direct-path — `ia_repeat_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line6_direction.mp4"),`
- `app/lesson/metroIA.tsx:116` — direct-resolved-literal — `ia_repeat_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line6_direction.mp4"),`
- `app/lesson/metroIA.tsx:116` — indirect-unique-filename — `ia_repeat_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line6_direction.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_station_count.mp4`

- `app/lesson/metroIA.tsx:122` — direct-path — `ia_repeat_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_station_count.mp4"),`
- `app/lesson/metroIA.tsx:122` — direct-resolved-literal — `ia_repeat_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_station_count.mp4"),`
- `app/lesson/metroIA.tsx:122` — indirect-unique-filename — `ia_repeat_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_station_count.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_count_info.mp4`

- `app/lesson/metroIA.tsx:131` — direct-path — `ia_repeat_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_count_info.mp4"),`
- `app/lesson/metroIA.tsx:131` — direct-resolved-literal — `ia_repeat_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_count_info.mp4"),`
- `app/lesson/metroIA.tsx:131` — indirect-unique-filename — `ia_repeat_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_count_info.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station.mp4`

- `app/lesson/metroIA.tsx:113` — direct-path — `ia_repeat_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station.mp4"),`
- `app/lesson/metroIA.tsx:113` — direct-resolved-literal — `ia_repeat_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station.mp4"),`
- `app/lesson/metroIA.tsx:113` — indirect-unique-filename — `ia_repeat_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_trip_time.mp4`

- `app/lesson/metroIA.tsx:119` — direct-path — `ia_repeat_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:119` — direct-resolved-literal — `ia_repeat_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:119` — indirect-filename-with-parent — `ia_repeat_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_trip_time.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_station_count.mp4`

- `app/lesson/metroIA.tsx:121` — direct-path — `ia_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_station_count.mp4"),`
- `app/lesson/metroIA.tsx:121` — direct-resolved-literal — `ia_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_station_count.mp4"),`
- `app/lesson/metroIA.tsx:121` — indirect-unique-filename — `ia_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_station_count.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_count_info.mp4`

- `app/lesson/metroIA.tsx:130` — direct-path — `ia_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_count_info.mp4"),`
- `app/lesson/metroIA.tsx:130` — direct-resolved-literal — `ia_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_count_info.mp4"),`
- `app/lesson/metroIA.tsx:130` — indirect-unique-filename — `ia_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_count_info.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_station.mp4`

- `app/lesson/metroIA.tsx:112` — direct-path — `ia_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_station.mp4"),`
- `app/lesson/metroIA.tsx:112` — direct-resolved-literal — `ia_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_station.mp4"),`
- `app/lesson/metroIA.tsx:112` — indirect-unique-filename — `ia_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_station.mp4"),`

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_trip_time.mp4`

- `app/lesson/metroIA.tsx:118` — direct-path — `ia_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:118` — direct-resolved-literal — `ia_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_trip_time.mp4"),`
- `app/lesson/metroIA.tsx:118` — indirect-filename-with-parent — `ia_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_trip_time.mp4"),`

### `assets/ai/restaurant/ped_confirm_galb.mp4`

- `app/lesson/restaurantIA.tsx:85` — direct-path — `const pedConfirmGalb = require("../../assets/ai/restaurant/ped_confirm_galb.mp4");`
- `app/lesson/restaurantIA.tsx:85` — direct-resolved-literal — `const pedConfirmGalb = require("../../assets/ai/restaurant/ped_confirm_galb.mp4");`
- `app/lesson/restaurantIA.tsx:85` — indirect-unique-filename — `const pedConfirmGalb = require("../../assets/ai/restaurant/ped_confirm_galb.mp4");`

### `assets/ai/restaurant/ped_confirm_samgyeopsal.mp4`

- `app/lesson/restaurantIA.tsx:86` — direct-path — `const pedConfirmSamgyeopsal = require("../../assets/ai/restaurant/ped_confirm_samgyeopsal.mp4");`
- `app/lesson/restaurantIA.tsx:86` — direct-resolved-literal — `const pedConfirmSamgyeopsal = require("../../assets/ai/restaurant/ped_confirm_samgyeopsal.mp4");`
- `app/lesson/restaurantIA.tsx:86` — indirect-unique-filename — `const pedConfirmSamgyeopsal = require("../../assets/ai/restaurant/ped_confirm_samgyeopsal.mp4");`

### `assets/ai/restaurant/ped_extra_bring.mp4.mp4`

- `app/lesson/restaurantIA.tsx:87` — direct-path — `const pedExtraBring = require("../../assets/ai/restaurant/ped_extra_bring.mp4.mp4");`
- `app/lesson/restaurantIA.tsx:87` — direct-resolved-literal — `const pedExtraBring = require("../../assets/ai/restaurant/ped_extra_bring.mp4.mp4");`
- `app/lesson/restaurantIA.tsx:87` — indirect-unique-filename — `const pedExtraBring = require("../../assets/ai/restaurant/ped_extra_bring.mp4.mp4");`

### `assets/ai/restaurant/ped_extra_prompt.mp4`

- `app/lesson/restaurantIA.tsx:88` — direct-path — `const pedExtraPrompt = require("../../assets/ai/restaurant/ped_extra_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:88` — direct-resolved-literal — `const pedExtraPrompt = require("../../assets/ai/restaurant/ped_extra_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:88` — indirect-unique-filename — `const pedExtraPrompt = require("../../assets/ai/restaurant/ped_extra_prompt.mp4");`

### `assets/ai/restaurant/ped_goodbye.mp4`

- `app/lesson/restaurantIA.tsx:94` — direct-path — `const pedGoodbye = require("../../assets/ai/restaurant/ped_goodbye.mp4");`
- `app/lesson/restaurantIA.tsx:94` — direct-resolved-literal — `const pedGoodbye = require("../../assets/ai/restaurant/ped_goodbye.mp4");`
- `app/lesson/restaurantIA.tsx:94` — indirect-unique-filename — `const pedGoodbye = require("../../assets/ai/restaurant/ped_goodbye.mp4");`

### `assets/ai/restaurant/ped_payment_prompt.mp4`

- `app/lesson/restaurantIA.tsx:91` — direct-path — `const pedPaymentPrompt = require("../../assets/ai/restaurant/ped_payment_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:91` — direct-resolved-literal — `const pedPaymentPrompt = require("../../assets/ai/restaurant/ped_payment_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:91` — indirect-unique-filename — `const pedPaymentPrompt = require("../../assets/ai/restaurant/ped_payment_prompt.mp4");`

### `assets/ai/restaurant/ped_receipt_card.mp4`

- `app/lesson/restaurantIA.tsx:92` — direct-path — `const pedReceiptCard = require("../../assets/ai/restaurant/ped_receipt_card.mp4");`
- `app/lesson/restaurantIA.tsx:92` — direct-resolved-literal — `const pedReceiptCard = require("../../assets/ai/restaurant/ped_receipt_card.mp4");`
- `app/lesson/restaurantIA.tsx:92` — indirect-unique-filename — `const pedReceiptCard = require("../../assets/ai/restaurant/ped_receipt_card.mp4");`

### `assets/ai/restaurant/ped_receipt_cash.mp4`

- `app/lesson/restaurantIA.tsx:93` — direct-path — `const pedReceiptCash = require("../../assets/ai/restaurant/ped_receipt_cash.mp4");`
- `app/lesson/restaurantIA.tsx:93` — direct-resolved-literal — `const pedReceiptCash = require("../../assets/ai/restaurant/ped_receipt_cash.mp4");`
- `app/lesson/restaurantIA.tsx:93` — indirect-unique-filename — `const pedReceiptCash = require("../../assets/ai/restaurant/ped_receipt_cash.mp4");`

### `assets/ai/restaurant/ped_recommendation.mp4`

- `app/lesson/restaurantIA.tsx:84` — direct-path — `const pedRecommendation = require("../../assets/ai/restaurant/ped_recommendation.mp4");`
- `app/lesson/restaurantIA.tsx:84` — direct-resolved-literal — `const pedRecommendation = require("../../assets/ai/restaurant/ped_recommendation.mp4");`
- `app/lesson/restaurantIA.tsx:84` — indirect-unique-filename — `const pedRecommendation = require("../../assets/ai/restaurant/ped_recommendation.mp4");`

### `assets/ai/restaurant/ped_side_prompt.mp4`

- `app/lesson/restaurantIA.tsx:90` — direct-path — `const pedSidePrompt = require("../../assets/ai/restaurant/ped_side_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:90` — direct-resolved-literal — `const pedSidePrompt = require("../../assets/ai/restaurant/ped_side_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:90` — indirect-unique-filename — `const pedSidePrompt = require("../../assets/ai/restaurant/ped_side_prompt.mp4");`

### `assets/ai/restaurant/ped_spicy_prompt.mp4`

- `app/lesson/restaurantIA.tsx:89` — direct-path — `const pedSpicyPrompt = require("../../assets/ai/restaurant/ped_spicy_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:89` — direct-resolved-literal — `const pedSpicyPrompt = require("../../assets/ai/restaurant/ped_spicy_prompt.mp4");`
- `app/lesson/restaurantIA.tsx:89` — indirect-unique-filename — `const pedSpicyPrompt = require("../../assets/ai/restaurant/ped_spicy_prompt.mp4");`

### `assets/ai/restaurant/ped_welcome.mp4`

- `app/lesson/restaurantIA.tsx:83` — direct-path — `const pedWelcome = require("../../assets/ai/restaurant/ped_welcome.mp4");`
- `app/lesson/restaurantIA.tsx:83` — direct-resolved-literal — `const pedWelcome = require("../../assets/ai/restaurant/ped_welcome.mp4");`
- `app/lesson/restaurantIA.tsx:83` — indirect-unique-filename — `const pedWelcome = require("../../assets/ai/restaurant/ped_welcome.mp4");`

### `assets/audio/comptage/age/hierarchie/hierarchie-bulle-1.mp3`

- `app/(tabs)/comptage/age.tsx:39` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:39` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:39` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-1.mp3"),`

### `assets/audio/comptage/age/hierarchie/hierarchie-bulle-2.mp3`

- `app/(tabs)/comptage/age.tsx:40` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:40` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:40` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-2.mp3"),`

### `assets/audio/comptage/age/hierarchie/hierarchie-bulle-3.mp3`

- `app/(tabs)/comptage/age.tsx:41` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:41` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:41` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-3.mp3"),`

### `assets/audio/comptage/age/hierarchie/hierarchie-bulle-4.mp3`

- `app/(tabs)/comptage/age.tsx:42` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:42` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:42` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-4.mp3"),`

### `assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-1.mp3`

- `app/(tabs)/comptage/age.tsx:45` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:45` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:45` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-1.mp3"),`

### `assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-2.mp3`

- `app/(tabs)/comptage/age.tsx:46` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:46` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:46` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-2.mp3"),`

### `assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-3.mp3`

- `app/(tabs)/comptage/age.tsx:47` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:47` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:47` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-3.mp3"),`

### `assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-4.mp3`

- `app/(tabs)/comptage/age.tsx:48` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:48` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:48` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-4.mp3"),`

### `assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-5.mp3`

- `app/(tabs)/comptage/age.tsx:49` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-5.mp3"),`
- `app/(tabs)/comptage/age.tsx:49` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-5.mp3"),`
- `app/(tabs)/comptage/age.tsx:49` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-5.mp3"),`

### `assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-6.mp3`

- `app/(tabs)/comptage/age.tsx:50` — direct-path — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-6.mp3"),`
- `app/(tabs)/comptage/age.tsx:50` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-6.mp3"),`
- `app/(tabs)/comptage/age.tsx:50` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-6.mp3"),`

### `assets/audio/comptage/age/majorité/majorité-bulle-1.mp3`

- `app/(tabs)/comptage/age.tsx:73` — direct-path — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:73` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:73` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-1.mp3"),`

### `assets/audio/comptage/age/majorité/majorité-bulle-2.mp3`

- `app/(tabs)/comptage/age.tsx:74` — direct-path — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:74` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:74` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-2.mp3"),`

### `assets/audio/comptage/age/majorité/majorité-bulle-3.mp3`

- `app/(tabs)/comptage/age.tsx:75` — direct-path — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:75` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:75` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-3.mp3"),`

### `assets/audio/comptage/age/majorité/majorité-bulle-4.mp3`

- `app/(tabs)/comptage/age.tsx:76` — direct-path — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:76` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:76` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/majorité-bulle-4.mp3"),`

### `assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-1.mp3`

- `app/(tabs)/comptage/age.tsx:79` — direct-path — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:79` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:79` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-1.mp3"),`

### `assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-2.mp3`

- `app/(tabs)/comptage/age.tsx:80` — direct-path — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:80` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:80` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-2.mp3"),`

### `assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-3.mp3`

- `app/(tabs)/comptage/age.tsx:81` — direct-path — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:81` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:81` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-3.mp3"),`

### `assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-4.mp3`

- `app/(tabs)/comptage/age.tsx:82` — direct-path — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:82` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:82` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-4.mp3"),`

### `assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-5.mp3`

- `app/(tabs)/comptage/age.tsx:83` — direct-path — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-5.mp3"),`
- `app/(tabs)/comptage/age.tsx:83` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-5.mp3"),`
- `app/(tabs)/comptage/age.tsx:83` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-5.mp3"),`

### `assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-6.mp3`

- `app/(tabs)/comptage/age.tsx:84` — direct-path — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-6.mp3"),`
- `app/(tabs)/comptage/age.tsx:84` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-6.mp3"),`
- `app/(tabs)/comptage/age.tsx:84` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-6.mp3"),`

### `assets/audio/comptage/age/system/system-bulle-1.mp3`

- `app/(tabs)/comptage/age.tsx:56` — direct-path — `require("../../../assets/audio/comptage/age/system/system-bulle-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:56` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/system-bulle-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:56` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/system-bulle-1.mp3"),`

### `assets/audio/comptage/age/system/system-bulle-2.mp3`

- `app/(tabs)/comptage/age.tsx:57` — direct-path — `require("../../../assets/audio/comptage/age/system/system-bulle-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:57` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/system-bulle-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:57` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/system-bulle-2.mp3"),`

### `assets/audio/comptage/age/system/system-bulle-3.mp3`

- `app/(tabs)/comptage/age.tsx:58` — direct-path — `require("../../../assets/audio/comptage/age/system/system-bulle-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:58` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/system-bulle-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:58` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/system-bulle-3.mp3"),`

### `assets/audio/comptage/age/system/system-bulle-4.mp3`

- `app/(tabs)/comptage/age.tsx:59` — direct-path — `require("../../../assets/audio/comptage/age/system/system-bulle-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:59` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/system-bulle-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:59` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/system-bulle-4.mp3"),`

### `assets/audio/comptage/age/system/toolbox/system-toolbox-1.mp3`

- `app/(tabs)/comptage/age.tsx:62` — direct-path — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:62` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-1.mp3"),`
- `app/(tabs)/comptage/age.tsx:62` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-1.mp3"),`

### `assets/audio/comptage/age/system/toolbox/system-toolbox-2.mp3`

- `app/(tabs)/comptage/age.tsx:63` — direct-path — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:63` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-2.mp3"),`
- `app/(tabs)/comptage/age.tsx:63` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-2.mp3"),`

### `assets/audio/comptage/age/system/toolbox/system-toolbox-3.mp3`

- `app/(tabs)/comptage/age.tsx:64` — direct-path — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:64` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-3.mp3"),`
- `app/(tabs)/comptage/age.tsx:64` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-3.mp3"),`

### `assets/audio/comptage/age/system/toolbox/system-toolbox-4.mp3`

- `app/(tabs)/comptage/age.tsx:65` — direct-path — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:65` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-4.mp3"),`
- `app/(tabs)/comptage/age.tsx:65` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-4.mp3"),`

### `assets/audio/comptage/age/system/toolbox/system-toolbox-5.mp3`

- `app/(tabs)/comptage/age.tsx:66` — direct-path — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-5.mp3"),`
- `app/(tabs)/comptage/age.tsx:66` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-5.mp3"),`
- `app/(tabs)/comptage/age.tsx:66` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-5.mp3"),`

### `assets/audio/comptage/age/system/toolbox/system-toolbox-6.mp3`

- `app/(tabs)/comptage/age.tsx:67` — direct-path — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-6.mp3"),`
- `app/(tabs)/comptage/age.tsx:67` — direct-resolved-literal — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-6.mp3"),`
- `app/(tabs)/comptage/age.tsx:67` — indirect-unique-filename — `require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-6.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-1.mp3`

- `app/(tabs)/comptage/dates.tsx:41` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:41` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:41` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-1.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-2.mp3`

- `app/(tabs)/comptage/dates.tsx:42` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:42` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:42` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-2.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-3.mp3`

- `app/(tabs)/comptage/dates.tsx:43` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:43` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:43` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-3.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-4.mp3`

- `app/(tabs)/comptage/dates.tsx:44` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:44` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:44` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-4.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-1.mp3`

- `app/(tabs)/comptage/dates.tsx:47` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:47` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:47` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-1.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-2.mp3`

- `app/(tabs)/comptage/dates.tsx:48` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:48` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:48` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-2.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-3.mp3`

- `app/(tabs)/comptage/dates.tsx:49` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:49` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:49` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-3.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-4.mp3`

- `app/(tabs)/comptage/dates.tsx:50` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:50` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:50` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-4.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-5.mp3`

- `app/(tabs)/comptage/dates.tsx:51` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-5.mp3"),`
- `app/(tabs)/comptage/dates.tsx:51` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-5.mp3"),`
- `app/(tabs)/comptage/dates.tsx:51` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-5.mp3"),`

### `assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-6.mp3`

- `app/(tabs)/comptage/dates.tsx:52` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-6.mp3"),`
- `app/(tabs)/comptage/dates.tsx:52` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-6.mp3"),`
- `app/(tabs)/comptage/dates.tsx:52` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-6.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/semaine-bulle-1.mp3`

- `app/(tabs)/comptage/dates.tsx:75` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:75` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:75` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-1.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/semaine-bulle-2.mp3`

- `app/(tabs)/comptage/dates.tsx:76` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:76` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:76` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-2.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/semaine-bulle-3.mp3`

- `app/(tabs)/comptage/dates.tsx:77` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:77` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:77` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-3.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/semaine-bulle-4.mp3`

- `app/(tabs)/comptage/dates.tsx:78` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:78` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:78` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-4.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-1.mp3`

- `app/(tabs)/comptage/dates.tsx:81` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:81` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:81` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-1.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-2.mp3`

- `app/(tabs)/comptage/dates.tsx:82` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:82` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:82` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-2.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-3.mp3`

- `app/(tabs)/comptage/dates.tsx:83` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:83` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:83` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-3.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-4.mp3`

- `app/(tabs)/comptage/dates.tsx:84` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:84` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:84` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-4.mp3"),`

### `assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-5.mp3`

- `app/(tabs)/comptage/dates.tsx:85` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-5.mp3"),`
- `app/(tabs)/comptage/dates.tsx:85` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-5.mp3"),`
- `app/(tabs)/comptage/dates.tsx:85` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-5.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-1.mp3`

- `app/(tabs)/comptage/dates.tsx:64` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:64` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:64` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-1.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-2.mp3`

- `app/(tabs)/comptage/dates.tsx:65` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:65` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:65` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-2.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-3.mp3`

- `app/(tabs)/comptage/dates.tsx:66` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:66` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:66` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-3.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-4.mp3`

- `app/(tabs)/comptage/dates.tsx:67` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:67` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:67` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-4.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-5.mp3`

- `app/(tabs)/comptage/dates.tsx:68` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-5.mp3"),`
- `app/(tabs)/comptage/dates.tsx:68` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-5.mp3"),`
- `app/(tabs)/comptage/dates.tsx:68` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-5.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-6.mp3`

- `app/(tabs)/comptage/dates.tsx:69` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-6.mp3"),`
- `app/(tabs)/comptage/dates.tsx:69` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-6.mp3"),`
- `app/(tabs)/comptage/dates.tsx:69` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-6.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/voyage-bulle-1.mp3`

- `app/(tabs)/comptage/dates.tsx:58` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:58` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-1.mp3"),`
- `app/(tabs)/comptage/dates.tsx:58` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-1.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/voyage-bulle-2.mp3`

- `app/(tabs)/comptage/dates.tsx:59` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:59` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-2.mp3"),`
- `app/(tabs)/comptage/dates.tsx:59` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-2.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/voyage-bulle-3.mp3`

- `app/(tabs)/comptage/dates.tsx:60` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:60` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-3.mp3"),`
- `app/(tabs)/comptage/dates.tsx:60` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-3.mp3"),`

### `assets/audio/comptage/date-calendrier/voyage/voyage-bulle-4.mp3`

- `app/(tabs)/comptage/dates.tsx:61` — direct-path — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:61` — direct-resolved-literal — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-4.mp3"),`
- `app/(tabs)/comptage/dates.tsx:61` — indirect-unique-filename — `require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-4.mp3"),`

### `assets/audio/comptage/heure/aube/aube-bulle-1.mp3`

- `app/(tabs)/comptage/heures.tsx:73` — direct-path — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:73` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:73` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-1.mp3"),`

### `assets/audio/comptage/heure/aube/aube-bulle-2.mp3`

- `app/(tabs)/comptage/heures.tsx:74` — direct-path — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:74` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:74` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-2.mp3"),`

### `assets/audio/comptage/heure/aube/aube-bulle-3.mp3`

- `app/(tabs)/comptage/heures.tsx:75` — direct-path — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:75` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:75` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-3.mp3"),`

### `assets/audio/comptage/heure/aube/aube-bulle-4.mp3`

- `app/(tabs)/comptage/heures.tsx:76` — direct-path — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:76` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:76` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/aube-bulle-4.mp3"),`

### `assets/audio/comptage/heure/aube/toolbox/aube-toolbox-1.mp3`

- `app/(tabs)/comptage/heures.tsx:79` — direct-path — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:79` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:79` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-1.mp3"),`

### `assets/audio/comptage/heure/aube/toolbox/aube-toolbox-2.mp3`

- `app/(tabs)/comptage/heures.tsx:80` — direct-path — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:80` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:80` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-2.mp3"),`

### `assets/audio/comptage/heure/aube/toolbox/aube-toolbox-3.mp3`

- `app/(tabs)/comptage/heures.tsx:81` — direct-path — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:81` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:81` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-3.mp3"),`

### `assets/audio/comptage/heure/aube/toolbox/aube-toolbox-4.mp3`

- `app/(tabs)/comptage/heures.tsx:82` — direct-path — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:82` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:82` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-4.mp3"),`

### `assets/audio/comptage/heure/aube/toolbox/aube-toolbox-5.mp3`

- `app/(tabs)/comptage/heures.tsx:83` — direct-path — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-5.mp3"),`
- `app/(tabs)/comptage/heures.tsx:83` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-5.mp3"),`
- `app/(tabs)/comptage/heures.tsx:83` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-5.mp3"),`

### `assets/audio/comptage/heure/aube/toolbox/aube-toolbox-6.mp3`

- `app/(tabs)/comptage/heures.tsx:84` — direct-path — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-6.mp3"),`
- `app/(tabs)/comptage/heures.tsx:84` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-6.mp3"),`
- `app/(tabs)/comptage/heures.tsx:84` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-6.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/metro-bulle-1.mp3`

- `app/(tabs)/comptage/heures.tsx:56` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:56` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:56` — indirect-filename-with-parent — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-1.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/metro-bulle-2.mp3`

- `app/(tabs)/comptage/heures.tsx:57` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:57` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:57` — indirect-filename-with-parent — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-2.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/metro-bulle-3.mp3`

- `app/(tabs)/comptage/heures.tsx:58` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:58` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:58` — indirect-filename-with-parent — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-3.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/metro-bulle-4.mp3`

- `app/(tabs)/comptage/heures.tsx:59` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:59` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:59` — indirect-filename-with-parent — `require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-4.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-1.mp3`

- `app/(tabs)/comptage/heures.tsx:62` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:62` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:62` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-1.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-2.mp3`

- `app/(tabs)/comptage/heures.tsx:63` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:63` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:63` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-2.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-3.mp3`

- `app/(tabs)/comptage/heures.tsx:64` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:64` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:64` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-3.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-4.mp3`

- `app/(tabs)/comptage/heures.tsx:65` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:65` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:65` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-4.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-5.mp3`

- `app/(tabs)/comptage/heures.tsx:66` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-5.mp3"),`
- `app/(tabs)/comptage/heures.tsx:66` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-5.mp3"),`
- `app/(tabs)/comptage/heures.tsx:66` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-5.mp3"),`

### `assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-6.mp3`

- `app/(tabs)/comptage/heures.tsx:67` — direct-path — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-6.mp3"),`
- `app/(tabs)/comptage/heures.tsx:67` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-6.mp3"),`
- `app/(tabs)/comptage/heures.tsx:67` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-6.mp3"),`

### `assets/audio/comptage/heure/rdv/heure-bulle-1.mp3`

- `app/(tabs)/comptage/heures.tsx:39` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:39` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:39` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-1.mp3"),`

### `assets/audio/comptage/heure/rdv/heure-bulle-2.mp3`

- `app/(tabs)/comptage/heures.tsx:40` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:40` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:40` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-2.mp3"),`

### `assets/audio/comptage/heure/rdv/heure-bulle-3.mp3`

- `app/(tabs)/comptage/heures.tsx:41` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:41` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:41` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-3.mp3"),`

### `assets/audio/comptage/heure/rdv/heure-bulle-4.mp3`

- `app/(tabs)/comptage/heures.tsx:42` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:42` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:42` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/heure-bulle-4.mp3"),`

### `assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-1.mp3`

- `app/(tabs)/comptage/heures.tsx:45` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:45` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-1.mp3"),`
- `app/(tabs)/comptage/heures.tsx:45` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-1.mp3"),`

### `assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-2.mp3`

- `app/(tabs)/comptage/heures.tsx:46` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:46` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-2.mp3"),`
- `app/(tabs)/comptage/heures.tsx:46` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-2.mp3"),`

### `assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-3.mp3`

- `app/(tabs)/comptage/heures.tsx:47` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:47` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-3.mp3"),`
- `app/(tabs)/comptage/heures.tsx:47` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-3.mp3"),`

### `assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-4.mp3`

- `app/(tabs)/comptage/heures.tsx:48` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:48` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-4.mp3"),`
- `app/(tabs)/comptage/heures.tsx:48` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-4.mp3"),`

### `assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-5.mp3`

- `app/(tabs)/comptage/heures.tsx:49` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-5.mp3"),`
- `app/(tabs)/comptage/heures.tsx:49` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-5.mp3"),`
- `app/(tabs)/comptage/heures.tsx:49` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-5.mp3"),`

### `assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-6.mp3`

- `app/(tabs)/comptage/heures.tsx:50` — direct-path — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-6.mp3"),`
- `app/(tabs)/comptage/heures.tsx:50` — direct-resolved-literal — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-6.mp3"),`
- `app/(tabs)/comptage/heures.tsx:50` — indirect-unique-filename — `require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-6.mp3"),`

### `assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-1.mp3`

- `app/(tabs)/comptage/base.tsx:41` — direct-path — `message1: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:41` — direct-resolved-literal — `message1: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:41` — indirect-unique-filename — `message1: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-1.mp3"),`

### `assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-2.mp3`

- `app/(tabs)/comptage/base.tsx:42` — direct-path — `message2: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:42` — direct-resolved-literal — `message2: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:42` — indirect-unique-filename — `message2: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-2.mp3"),`

### `assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-3.mp3`

- `app/(tabs)/comptage/base.tsx:43` — direct-path — `message3: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:43` — direct-resolved-literal — `message3: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:43` — indirect-unique-filename — `message3: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-3.mp3"),`

### `assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-4.mp3`

- `app/(tabs)/comptage/base.tsx:44` — direct-path — `message4: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:44` — direct-resolved-literal — `message4: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:44` — indirect-unique-filename — `message4: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-4.mp3"),`

### `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-1.mp3`

- `app/(tabs)/comptage/base.tsx:45` — direct-path — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:45` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:45` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-1.mp3"),`

### `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-6.mp3`

- `app/(tabs)/comptage/base.tsx:50` — direct-path — `toolbox6: require("../../../assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-6.mp3"),`
- `app/(tabs)/comptage/base.tsx:50` — direct-resolved-literal — `toolbox6: require("../../../assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-6.mp3"),`
- `app/(tabs)/comptage/base.tsx:50` — indirect-unique-filename — `toolbox6: require("../../../assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-6.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-1.mp3`

- `app/(tabs)/comptage/base.tsx:14` — direct-path — `message1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:14` — direct-resolved-literal — `message1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:14` — indirect-unique-filename — `message1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-1.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-2.mp3`

- `app/(tabs)/comptage/base.tsx:15` — direct-path — `message2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:15` — direct-resolved-literal — `message2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:15` — indirect-unique-filename — `message2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-2.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-3.mp3`

- `app/(tabs)/comptage/base.tsx:16` — direct-path — `message3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:16` — direct-resolved-literal — `message3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:16` — indirect-unique-filename — `message3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-3.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-4.mp3`

- `app/(tabs)/comptage/base.tsx:17` — direct-path — `message4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:17` — direct-resolved-literal — `message4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:17` — indirect-unique-filename — `message4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-4.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-1.mp3`

- `app/(tabs)/comptage/base.tsx:18` — direct-path — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:18` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:18` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-1.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-2.mp3`

- `app/(tabs)/comptage/base.tsx:19` — direct-path — `toolbox2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:19` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:19` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-2.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-3.mp3`

- `app/(tabs)/comptage/base.tsx:20` — direct-path — `toolbox3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:20` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:20` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-3.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-4.mp3`

- `app/(tabs)/comptage/base.tsx:21` — direct-path — `toolbox4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:21` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:21` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-4.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-5.mp3`

- `app/(tabs)/comptage/base.tsx:22` — direct-path — `toolbox5: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-5.mp3"),`
- `app/(tabs)/comptage/base.tsx:22` — direct-resolved-literal — `toolbox5: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-5.mp3"),`
- `app/(tabs)/comptage/base.tsx:22` — indirect-unique-filename — `toolbox5: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-5.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-6.mp3`

- `app/(tabs)/comptage/base.tsx:23` — direct-path — `toolbox6: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-6.mp3"),`
- `app/(tabs)/comptage/base.tsx:23` — direct-resolved-literal — `toolbox6: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-6.mp3"),`
- `app/(tabs)/comptage/base.tsx:23` — indirect-unique-filename — `toolbox6: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-6.mp3"),`

### `assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-7.mp3`

- `app/(tabs)/comptage/base.tsx:24` — direct-path — `toolbox7: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-7.mp3"),`
- `app/(tabs)/comptage/base.tsx:24` — direct-resolved-literal — `toolbox7: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-7.mp3"),`
- `app/(tabs)/comptage/base.tsx:24` — indirect-unique-filename — `toolbox7: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-7.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-1.mp3`

- `app/(tabs)/comptage/base.tsx:28` — direct-path — `message1: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:28` — direct-resolved-literal — `message1: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:28` — indirect-unique-filename — `message1: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-1.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-2.mp3`

- `app/(tabs)/comptage/base.tsx:29` — direct-path — `message2: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:29` — direct-resolved-literal — `message2: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:29` — indirect-unique-filename — `message2: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-2.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-3.mp3`

- `app/(tabs)/comptage/base.tsx:30` — direct-path — `message3: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:30` — direct-resolved-literal — `message3: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:30` — indirect-unique-filename — `message3: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-3.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-4.mp3`

- `app/(tabs)/comptage/base.tsx:31` — direct-path — `message4: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:31` — direct-resolved-literal — `message4: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:31` — indirect-unique-filename — `message4: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-4.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-1.mp3`

- `app/(tabs)/comptage/base.tsx:32` — direct-path — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:32` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-1.mp3"),`
- `app/(tabs)/comptage/base.tsx:32` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-1.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-2.mp3`

- `app/(tabs)/comptage/base.tsx:33` — direct-path — `toolbox2: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:33` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-2.mp3"),`
- `app/(tabs)/comptage/base.tsx:33` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-2.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-3.mp3`

- `app/(tabs)/comptage/base.tsx:34` — direct-path — `toolbox3: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:34` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-3.mp3"),`
- `app/(tabs)/comptage/base.tsx:34` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-3.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-4.mp3`

- `app/(tabs)/comptage/base.tsx:35` — direct-path — `toolbox4: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:35` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-4.mp3"),`
- `app/(tabs)/comptage/base.tsx:35` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-4.mp3"),`

### `assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-5.mp3`

- `app/(tabs)/comptage/base.tsx:36` — direct-path — `toolbox5: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-5.mp3"),`
- `app/(tabs)/comptage/base.tsx:36` — direct-resolved-literal — `toolbox5: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-5.mp3"),`
- `app/(tabs)/comptage/base.tsx:36` — indirect-unique-filename — `toolbox5: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-5.mp3"),`

### `assets/audio/comptage/ordinal/classement/classement-bulle-1.mp3`

- `app/(tabs)/comptage/ordinals.tsx:39` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:39` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:39` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-1.mp3"),`

### `assets/audio/comptage/ordinal/classement/classement-bulle-2.mp3`

- `app/(tabs)/comptage/ordinals.tsx:40` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:40` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:40` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-2.mp3"),`

### `assets/audio/comptage/ordinal/classement/classement-bulle-3.mp3`

- `app/(tabs)/comptage/ordinals.tsx:41` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:41` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:41` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-3.mp3"),`

### `assets/audio/comptage/ordinal/classement/classement-bulle-4.mp3`

- `app/(tabs)/comptage/ordinals.tsx:42` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:42` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:42` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-4.mp3"),`

### `assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-1.mp3`

- `app/(tabs)/comptage/ordinals.tsx:45` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:45` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:45` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-1.mp3"),`

### `assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-2.mp3`

- `app/(tabs)/comptage/ordinals.tsx:46` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:46` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:46` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-2.mp3"),`

### `assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-3.mp3`

- `app/(tabs)/comptage/ordinals.tsx:47` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:47` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:47` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-3.mp3"),`

### `assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-4.mp3`

- `app/(tabs)/comptage/ordinals.tsx:48` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:48` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:48` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-4.mp3"),`

### `assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-5.mp3`

- `app/(tabs)/comptage/ordinals.tsx:49` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-5.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:49` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-5.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:49` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-5.mp3"),`

### `assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-6.mp3`

- `app/(tabs)/comptage/ordinals.tsx:50` — direct-path — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-6.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:50` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-6.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:50` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-6.mp3"),`

### `assets/audio/comptage/ordinal/famille/famille-bulle-1.mp3`

- `app/(tabs)/comptage/ordinals.tsx:56` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:56` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:56` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-1.mp3"),`

### `assets/audio/comptage/ordinal/famille/famille-bulle-2.mp3`

- `app/(tabs)/comptage/ordinals.tsx:57` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:57` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:57` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-2.mp3"),`

### `assets/audio/comptage/ordinal/famille/famille-bulle-3.mp3`

- `app/(tabs)/comptage/ordinals.tsx:58` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:58` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:58` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-3.mp3"),`

### `assets/audio/comptage/ordinal/famille/famille-bulle-4.mp3`

- `app/(tabs)/comptage/ordinals.tsx:59` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:59` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:59` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-4.mp3"),`

### `assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-1.mp3`

- `app/(tabs)/comptage/ordinals.tsx:62` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:62` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:62` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-1.mp3"),`

### `assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-2.mp3`

- `app/(tabs)/comptage/ordinals.tsx:63` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:63` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:63` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-2.mp3"),`

### `assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-3.mp3`

- `app/(tabs)/comptage/ordinals.tsx:64` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:64` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:64` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-3.mp3"),`

### `assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-4.mp3`

- `app/(tabs)/comptage/ordinals.tsx:65` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:65` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:65` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-4.mp3"),`

### `assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-5.mp3`

- `app/(tabs)/comptage/ordinals.tsx:66` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-5.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:66` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-5.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:66` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-5.mp3"),`

### `assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-6.mp3`

- `app/(tabs)/comptage/ordinals.tsx:67` — direct-path — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-6.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:67` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-6.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:67` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-6.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-1.mp3`

- `app/(tabs)/comptage/ordinals.tsx:73` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:73` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:73` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-1.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-2.mp3`

- `app/(tabs)/comptage/ordinals.tsx:74` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:74` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:74` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-2.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-3.mp3`

- `app/(tabs)/comptage/ordinals.tsx:75` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:75` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:75` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-3.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-4.mp3`

- `app/(tabs)/comptage/ordinals.tsx:76` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:76` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:76` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-4.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-1.mp3`

- `app/(tabs)/comptage/ordinals.tsx:79` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:79` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-1.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:79` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-1.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-2.mp3`

- `app/(tabs)/comptage/ordinals.tsx:80` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:80` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-2.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:80` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-2.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-3.mp3`

- `app/(tabs)/comptage/ordinals.tsx:81` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:81` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-3.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:81` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-3.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-4.mp3`

- `app/(tabs)/comptage/ordinals.tsx:82` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:82` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-4.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:82` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-4.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-5.mp3`

- `app/(tabs)/comptage/ordinals.tsx:83` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-5.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:83` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-5.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:83` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-5.mp3"),`

### `assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-6.mp3`

- `app/(tabs)/comptage/ordinals.tsx:84` — direct-path — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-6.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:84` — direct-resolved-literal — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-6.mp3"),`
- `app/(tabs)/comptage/ordinals.tsx:84` — indirect-unique-filename — `require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-6.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/convenience-bulle-1.mp3`

- `app/(tabs)/comptage/prix.tsx:73` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:73` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:73` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-1.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/convenience-bulle-2.mp3`

- `app/(tabs)/comptage/prix.tsx:74` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:74` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:74` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-2.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/convenience-bulle-3.mp3`

- `app/(tabs)/comptage/prix.tsx:75` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:75` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:75` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-3.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/convenience-bulle-4.mp3`

- `app/(tabs)/comptage/prix.tsx:76` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:76` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:76` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-4.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toobox-1.mp3`

- `app/(tabs)/comptage/prix.tsx:79` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toobox-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:79` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toobox-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:79` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toobox-1.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-2.mp3`

- `app/(tabs)/comptage/prix.tsx:80` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:80` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:80` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-2.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-3.mp3`

- `app/(tabs)/comptage/prix.tsx:81` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:81` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:81` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-3.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-4.mp3`

- `app/(tabs)/comptage/prix.tsx:82` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:82` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:82` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-4.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-5.mp3`

- `app/(tabs)/comptage/prix.tsx:83` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-5.mp3"),`
- `app/(tabs)/comptage/prix.tsx:83` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-5.mp3"),`
- `app/(tabs)/comptage/prix.tsx:83` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-5.mp3"),`

### `assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-6.mp3`

- `app/(tabs)/comptage/prix.tsx:84` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-6.mp3"),`
- `app/(tabs)/comptage/prix.tsx:84` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-6.mp3"),`
- `app/(tabs)/comptage/prix.tsx:84` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-6.mp3"),`

### `assets/audio/comptage/shopping-prix/market/market-bulle-1.mp3`

- `app/(tabs)/comptage/prix.tsx:56` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:56` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:56` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-1.mp3"),`

### `assets/audio/comptage/shopping-prix/market/market-bulle-2.mp3`

- `app/(tabs)/comptage/prix.tsx:57` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:57` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:57` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-2.mp3"),`

### `assets/audio/comptage/shopping-prix/market/market-bulle-3.mp3`

- `app/(tabs)/comptage/prix.tsx:58` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:58` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:58` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-3.mp3"),`

### `assets/audio/comptage/shopping-prix/market/market-bulle-4.mp3`

- `app/(tabs)/comptage/prix.tsx:59` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:59` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:59` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-4.mp3"),`

### `assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-1.mp3`

- `app/(tabs)/comptage/prix.tsx:62` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:62` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:62` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-1.mp3"),`

### `assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-2.mp3`

- `app/(tabs)/comptage/prix.tsx:63` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:63` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:63` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-2.mp3"),`

### `assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-3.mp3`

- `app/(tabs)/comptage/prix.tsx:64` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:64` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:64` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-3.mp3"),`

### `assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-4.mp3`

- `app/(tabs)/comptage/prix.tsx:65` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:65` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:65` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-4.mp3"),`

### `assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-5.mp3`

- `app/(tabs)/comptage/prix.tsx:66` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-5.mp3"),`
- `app/(tabs)/comptage/prix.tsx:66` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-5.mp3"),`
- `app/(tabs)/comptage/prix.tsx:66` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-5.mp3"),`

### `assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-6.mp3`

- `app/(tabs)/comptage/prix.tsx:67` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-6.mp3"),`
- `app/(tabs)/comptage/prix.tsx:67` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-6.mp3"),`
- `app/(tabs)/comptage/prix.tsx:67` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-6.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-1.mp3`

- `app/(tabs)/comptage/prix.tsx:39` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:39` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:39` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-1.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-2.mp3`

- `app/(tabs)/comptage/prix.tsx:40` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:40` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:40` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-2.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-3.mp3`

- `app/(tabs)/comptage/prix.tsx:41` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:41` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:41` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-3.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-4.mp3`

- `app/(tabs)/comptage/prix.tsx:42` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:42` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:42` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-4.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-1.mp3`

- `app/(tabs)/comptage/prix.tsx:45` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:45` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-1.mp3"),`
- `app/(tabs)/comptage/prix.tsx:45` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-1.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-2.mp3`

- `app/(tabs)/comptage/prix.tsx:46` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:46` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-2.mp3"),`
- `app/(tabs)/comptage/prix.tsx:46` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-2.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-3.mp3`

- `app/(tabs)/comptage/prix.tsx:47` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:47` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-3.mp3"),`
- `app/(tabs)/comptage/prix.tsx:47` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-3.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-4.mp3`

- `app/(tabs)/comptage/prix.tsx:48` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:48` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-4.mp3"),`
- `app/(tabs)/comptage/prix.tsx:48` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-4.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-5.mp3`

- `app/(tabs)/comptage/prix.tsx:49` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-5.mp3"),`
- `app/(tabs)/comptage/prix.tsx:49` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-5.mp3"),`
- `app/(tabs)/comptage/prix.tsx:49` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-5.mp3"),`

### `assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-6.mp3`

- `app/(tabs)/comptage/prix.tsx:50` — direct-path — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-6.mp3"),`
- `app/(tabs)/comptage/prix.tsx:50` — direct-resolved-literal — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-6.mp3"),`
- `app/(tabs)/comptage/prix.tsx:50` — indirect-unique-filename — `require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-6.mp3"),`

### `assets/audio/comptage/sino/coordonnée/coordonnée-bulle-1.mp3`

- `app/(tabs)/comptage/sino.tsx:78` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:78` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:78` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-1.mp3"),`

### `assets/audio/comptage/sino/coordonnée/coordonnée-bulle-2.mp3`

- `app/(tabs)/comptage/sino.tsx:79` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:79` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:79` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-2.mp3"),`

### `assets/audio/comptage/sino/coordonnée/coordonnée-bulle-3.mp3`

- `app/(tabs)/comptage/sino.tsx:80` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:80` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:80` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-3.mp3"),`

### `assets/audio/comptage/sino/coordonnée/coordonnée-bulle-4.mp3`

- `app/(tabs)/comptage/sino.tsx:81` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:81` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:81` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-4.mp3"),`

### `assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-1.mp3`

- `app/(tabs)/comptage/sino.tsx:84` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:84` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:84` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-1.mp3"),`

### `assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-2.mp3`

- `app/(tabs)/comptage/sino.tsx:85` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:85` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:85` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-2.mp3"),`

### `assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-3.mp3`

- `app/(tabs)/comptage/sino.tsx:86` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:86` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:86` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-3.mp3"),`

### `assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-4.mp3`

- `app/(tabs)/comptage/sino.tsx:87` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:87` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:87` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-4.mp3"),`

### `assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-5.mp3`

- `app/(tabs)/comptage/sino.tsx:88` — direct-path — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-5.mp3"),`
- `app/(tabs)/comptage/sino.tsx:88` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-5.mp3"),`
- `app/(tabs)/comptage/sino.tsx:88` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-5.mp3"),`

### `assets/audio/comptage/sino/rdv/rdv-bulle-1.mp3`

- `app/(tabs)/comptage/sino.tsx:61` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:61` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:61` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-1.mp3"),`

### `assets/audio/comptage/sino/rdv/rdv-bulle-2.mp3`

- `app/(tabs)/comptage/sino.tsx:62` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:62` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:62` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-2.mp3"),`

### `assets/audio/comptage/sino/rdv/rdv-bulle-3.mp3`

- `app/(tabs)/comptage/sino.tsx:63` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:63` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:63` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-3.mp3"),`

### `assets/audio/comptage/sino/rdv/rdv-bulle-4.mp3`

- `app/(tabs)/comptage/sino.tsx:64` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:64` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:64` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-4.mp3"),`

### `assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-1.mp3`

- `app/(tabs)/comptage/sino.tsx:67` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:67` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:67` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-1.mp3"),`

### `assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-2.mp3`

- `app/(tabs)/comptage/sino.tsx:68` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:68` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:68` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-2.mp3"),`

### `assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-3.mp3`

- `app/(tabs)/comptage/sino.tsx:69` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:69` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:69` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-3.mp3"),`

### `assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-4.mp3`

- `app/(tabs)/comptage/sino.tsx:70` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:70` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:70` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-4.mp3"),`

### `assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-5.mp3`

- `app/(tabs)/comptage/sino.tsx:71` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-5.mp3"),`
- `app/(tabs)/comptage/sino.tsx:71` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-5.mp3"),`
- `app/(tabs)/comptage/sino.tsx:71` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-5.mp3"),`

### `assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-6.mp3`

- `app/(tabs)/comptage/sino.tsx:72` — direct-path — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-6.mp3"),`
- `app/(tabs)/comptage/sino.tsx:72` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-6.mp3"),`
- `app/(tabs)/comptage/sino.tsx:72` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-6.mp3"),`

### `assets/audio/comptage/sino/shooping/shopping-bulle-1.mp3`

- `app/(tabs)/comptage/sino.tsx:44` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:44` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:44` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-1.mp3"),`

### `assets/audio/comptage/sino/shooping/shopping-bulle-2.mp3`

- `app/(tabs)/comptage/sino.tsx:45` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:45` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:45` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-2.mp3"),`

### `assets/audio/comptage/sino/shooping/shopping-bulle-3.mp3`

- `app/(tabs)/comptage/sino.tsx:46` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:46` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:46` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-3.mp3"),`

### `assets/audio/comptage/sino/shooping/shopping-bulle-4.mp3`

- `app/(tabs)/comptage/sino.tsx:47` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:47` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:47` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-4.mp3"),`

### `assets/audio/comptage/sino/shooping/toolbox/shooping-toolbox-5.mp3`

- `app/(tabs)/comptage/sino.tsx:54` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shooping-toolbox-5.mp3"),`
- `app/(tabs)/comptage/sino.tsx:54` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shooping-toolbox-5.mp3"),`
- `app/(tabs)/comptage/sino.tsx:54` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shooping-toolbox-5.mp3"),`

### `assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-1.mp3`

- `app/(tabs)/comptage/sino.tsx:50` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:50` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-1.mp3"),`
- `app/(tabs)/comptage/sino.tsx:50` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-1.mp3"),`

### `assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-2.mp3`

- `app/(tabs)/comptage/sino.tsx:51` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:51` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-2.mp3"),`
- `app/(tabs)/comptage/sino.tsx:51` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-2.mp3"),`

### `assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-3.mp3`

- `app/(tabs)/comptage/sino.tsx:52` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:52` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-3.mp3"),`
- `app/(tabs)/comptage/sino.tsx:52` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-3.mp3"),`

### `assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-4.mp3`

- `app/(tabs)/comptage/sino.tsx:53` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:53` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-4.mp3"),`
- `app/(tabs)/comptage/sino.tsx:53` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-4.mp3"),`

### `assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-6.mp3`

- `app/(tabs)/comptage/sino.tsx:55` — direct-path — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-6.mp3"),`
- `app/(tabs)/comptage/sino.tsx:55` — direct-resolved-literal — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-6.mp3"),`
- `app/(tabs)/comptage/sino.tsx:55` — indirect-unique-filename — `require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-6.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/echange-bulle-1.mp3`

- `app/(tabs)/comptage/phone.tsx:39` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:39` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:39` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-1.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/echange-bulle-2.mp3`

- `app/(tabs)/comptage/phone.tsx:40` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:40` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:40` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-2.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/echange-bulle-3.mp3`

- `app/(tabs)/comptage/phone.tsx:41` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:41` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:41` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-3.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/echange-bulle-4.mp3`

- `app/(tabs)/comptage/phone.tsx:42` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:42` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:42` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-4.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-1.mp3`

- `app/(tabs)/comptage/phone.tsx:45` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:45` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:45` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-1.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-2.mp3`

- `app/(tabs)/comptage/phone.tsx:46` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:46` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:46` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-2.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-3.mp3`

- `app/(tabs)/comptage/phone.tsx:47` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:47` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:47` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-3.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-4.mp3`

- `app/(tabs)/comptage/phone.tsx:48` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:48` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:48` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-4.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-5.mp3`

- `app/(tabs)/comptage/phone.tsx:49` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-5.mp3"),`
- `app/(tabs)/comptage/phone.tsx:49` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-5.mp3"),`
- `app/(tabs)/comptage/phone.tsx:49` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-5.mp3"),`

### `assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-6.mp3`

- `app/(tabs)/comptage/phone.tsx:50` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-6.mp3"),`
- `app/(tabs)/comptage/phone.tsx:50` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-6.mp3"),`
- `app/(tabs)/comptage/phone.tsx:50` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-6.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-1.mp3`

- `app/(tabs)/comptage/phone.tsx:73` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:73` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:73` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-1.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-2.mp3`

- `app/(tabs)/comptage/phone.tsx:74` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:74` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:74` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-2.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-3.mp3`

- `app/(tabs)/comptage/phone.tsx:75` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:75` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:75` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-3.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-4.mp3`

- `app/(tabs)/comptage/phone.tsx:76` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:76` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:76` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-4.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-1.mp3`

- `app/(tabs)/comptage/phone.tsx:79` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:79` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:79` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-1.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-2.mp3`

- `app/(tabs)/comptage/phone.tsx:80` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:80` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:80` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-2.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-3.mp3`

- `app/(tabs)/comptage/phone.tsx:81` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:81` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:81` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-3.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-4.mp3`

- `app/(tabs)/comptage/phone.tsx:82` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:82` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:82` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-4.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-5.mp3`

- `app/(tabs)/comptage/phone.tsx:83` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-5.mp3"),`
- `app/(tabs)/comptage/phone.tsx:83` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-5.mp3"),`
- `app/(tabs)/comptage/phone.tsx:83` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-5.mp3"),`

### `assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-6.mp3`

- `app/(tabs)/comptage/phone.tsx:84` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-6.mp3"),`
- `app/(tabs)/comptage/phone.tsx:84` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-6.mp3"),`
- `app/(tabs)/comptage/phone.tsx:84` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-6.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/telephone-bulle-1.mp3`

- `app/(tabs)/comptage/phone.tsx:56` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:56` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:56` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-1.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/telephone-bulle-2.mp3`

- `app/(tabs)/comptage/phone.tsx:57` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:57` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:57` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-2.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/telephone-bulle-3.mp3`

- `app/(tabs)/comptage/phone.tsx:58` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:58` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:58` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-3.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/telephone-bulle-4.mp3`

- `app/(tabs)/comptage/phone.tsx:59` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:59` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:59` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-4.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-1.mp3`

- `app/(tabs)/comptage/phone.tsx:62` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:62` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-1.mp3"),`
- `app/(tabs)/comptage/phone.tsx:62` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-1.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-2.mp3`

- `app/(tabs)/comptage/phone.tsx:63` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:63` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-2.mp3"),`
- `app/(tabs)/comptage/phone.tsx:63` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-2.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-3.mp3`

- `app/(tabs)/comptage/phone.tsx:64` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:64` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-3.mp3"),`
- `app/(tabs)/comptage/phone.tsx:64` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-3.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-4.mp3`

- `app/(tabs)/comptage/phone.tsx:65` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:65` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-4.mp3"),`
- `app/(tabs)/comptage/phone.tsx:65` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-4.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-5.mp3`

- `app/(tabs)/comptage/phone.tsx:66` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-5.mp3"),`
- `app/(tabs)/comptage/phone.tsx:66` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-5.mp3"),`
- `app/(tabs)/comptage/phone.tsx:66` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-5.mp3"),`

### `assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-6.mp3`

- `app/(tabs)/comptage/phone.tsx:67` — direct-path — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-6.mp3"),`
- `app/(tabs)/comptage/phone.tsx:67` — direct-resolved-literal — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-6.mp3"),`
- `app/(tabs)/comptage/phone.tsx:67` — indirect-unique-filename — `require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-6.mp3"),`

### `assets/audio/listen/bbq-situation-01.mp3`

- `app/(tabs)/listen.tsx:93` — direct-path — `"bbq-situation-01": require("../../assets/audio/listen/bbq-situation-01.mp3"),`
- `app/(tabs)/listen.tsx:93` — direct-resolved-literal — `"bbq-situation-01": require("../../assets/audio/listen/bbq-situation-01.mp3"),`
- `app/(tabs)/listen.tsx:93` — indirect-unique-filename — `"bbq-situation-01": require("../../assets/audio/listen/bbq-situation-01.mp3"),`

### `assets/audio/listen/cafe-dictation-01.mp3`

- `app/(tabs)/listen.tsx:88` — direct-path — `"cafe-dictation-01": require("../../assets/audio/listen/cafe-dictation-01.mp3"),`
- `app/(tabs)/listen.tsx:88` — direct-resolved-literal — `"cafe-dictation-01": require("../../assets/audio/listen/cafe-dictation-01.mp3"),`
- `app/(tabs)/listen.tsx:88` — indirect-unique-filename — `"cafe-dictation-01": require("../../assets/audio/listen/cafe-dictation-01.mp3"),`

### `assets/audio/listen/cafe-dictation-02.mp3`

- `app/(tabs)/listen.tsx:89` — direct-path — `"cafe-dictation-02": require("../../assets/audio/listen/cafe-dictation-02.mp3"),`
- `app/(tabs)/listen.tsx:89` — direct-resolved-literal — `"cafe-dictation-02": require("../../assets/audio/listen/cafe-dictation-02.mp3"),`
- `app/(tabs)/listen.tsx:89` — indirect-unique-filename — `"cafe-dictation-02": require("../../assets/audio/listen/cafe-dictation-02.mp3"),`

### `assets/audio/listen/cafe-gap-02.mp3`

- `app/(tabs)/listen.tsx:99` — direct-path — `"cafe-gap-02": require("../../assets/audio/listen/cafe-gap-02.mp3"),`
- `app/(tabs)/listen.tsx:99` — direct-resolved-literal — `"cafe-gap-02": require("../../assets/audio/listen/cafe-gap-02.mp3"),`
- `app/(tabs)/listen.tsx:99` — indirect-unique-filename — `"cafe-gap-02": require("../../assets/audio/listen/cafe-gap-02.mp3"),`

### `assets/audio/listen/cafe-order-02.mp3`

- `app/(tabs)/listen.tsx:104` — direct-path — `"cafe-order-02": require("../../assets/audio/listen/cafe-order-02.mp3"),`
- `app/(tabs)/listen.tsx:104` — direct-resolved-literal — `"cafe-order-02": require("../../assets/audio/listen/cafe-order-02.mp3"),`
- `app/(tabs)/listen.tsx:104` — indirect-unique-filename — `"cafe-order-02": require("../../assets/audio/listen/cafe-order-02.mp3"),`

### `assets/audio/listen/cafe-reaction-01.mp3`

- `app/(tabs)/listen.tsx:108` — direct-path — `"cafe-reaction-01": require("../../assets/audio/listen/cafe-reaction-01.mp3"),`
- `app/(tabs)/listen.tsx:108` — direct-resolved-literal — `"cafe-reaction-01": require("../../assets/audio/listen/cafe-reaction-01.mp3"),`
- `app/(tabs)/listen.tsx:108` — indirect-unique-filename — `"cafe-reaction-01": require("../../assets/audio/listen/cafe-reaction-01.mp3"),`

### `assets/audio/listen/cafe-situation-02.mp3`

- `app/(tabs)/listen.tsx:94` — direct-path — `"cafe-situation-02": require("../../assets/audio/listen/cafe-situation-02.mp3"),`
- `app/(tabs)/listen.tsx:94` — direct-resolved-literal — `"cafe-situation-02": require("../../assets/audio/listen/cafe-situation-02.mp3"),`
- `app/(tabs)/listen.tsx:94` — indirect-filename-with-parent — `"cafe-situation-02": require("../../assets/audio/listen/cafe-situation-02.mp3"),`

### `assets/audio/listen/hotel-dictation-05.mp3`

- `app/(tabs)/listen.tsx:92` — direct-path — `"hotel-dictation-05": require("../../assets/audio/listen/hotel-dictation-05.mp3"),`
- `app/(tabs)/listen.tsx:92` — direct-resolved-literal — `"hotel-dictation-05": require("../../assets/audio/listen/hotel-dictation-05.mp3"),`
- `app/(tabs)/listen.tsx:92` — indirect-unique-filename — `"hotel-dictation-05": require("../../assets/audio/listen/hotel-dictation-05.mp3"),`

### `assets/audio/listen/hotel-gap-05.mp3`

- `app/(tabs)/listen.tsx:102` — direct-path — `"hotel-gap-05": require("../../assets/audio/listen/hotel-gap-05.mp3"),`
- `app/(tabs)/listen.tsx:102` — direct-resolved-literal — `"hotel-gap-05": require("../../assets/audio/listen/hotel-gap-05.mp3"),`
- `app/(tabs)/listen.tsx:102` — indirect-unique-filename — `"hotel-gap-05": require("../../assets/audio/listen/hotel-gap-05.mp3"),`

### `assets/audio/listen/hotel-reaction-04.mp3`

- `app/(tabs)/listen.tsx:111` — direct-path — `"hotel-reaction-04": require("../../assets/audio/listen/hotel-reaction-04.mp3"),`
- `app/(tabs)/listen.tsx:111` — direct-resolved-literal — `"hotel-reaction-04": require("../../assets/audio/listen/hotel-reaction-04.mp3"),`
- `app/(tabs)/listen.tsx:111` — indirect-unique-filename — `"hotel-reaction-04": require("../../assets/audio/listen/hotel-reaction-04.mp3"),`

### `assets/audio/listen/metro-dictation-03.mp3`

- `app/(tabs)/listen.tsx:90` — direct-path — `"metro-dictation-03": require("../../assets/audio/listen/metro-dictation-03.mp3"),`
- `app/(tabs)/listen.tsx:90` — direct-resolved-literal — `"metro-dictation-03": require("../../assets/audio/listen/metro-dictation-03.mp3"),`
- `app/(tabs)/listen.tsx:90` — indirect-unique-filename — `"metro-dictation-03": require("../../assets/audio/listen/metro-dictation-03.mp3"),`

### `assets/audio/listen/metro-gap-04.mp3`

- `app/(tabs)/listen.tsx:101` — direct-path — `"metro-gap-04": require("../../assets/audio/listen/metro-gap-04.mp3"),`
- `app/(tabs)/listen.tsx:101` — direct-resolved-literal — `"metro-gap-04": require("../../assets/audio/listen/metro-gap-04.mp3"),`
- `app/(tabs)/listen.tsx:101` — indirect-unique-filename — `"metro-gap-04": require("../../assets/audio/listen/metro-gap-04.mp3"),`

### `assets/audio/listen/metro-order-01.mp3`

- `app/(tabs)/listen.tsx:103` — direct-path — `"metro-order-01": require("../../assets/audio/listen/metro-order-01.mp3"),`
- `app/(tabs)/listen.tsx:103` — direct-resolved-literal — `"metro-order-01": require("../../assets/audio/listen/metro-order-01.mp3"),`
- `app/(tabs)/listen.tsx:103` — indirect-unique-filename — `"metro-order-01": require("../../assets/audio/listen/metro-order-01.mp3"),`

### `assets/audio/listen/metro-situation-03.mp3`

- `app/(tabs)/listen.tsx:95` — direct-path — `"metro-situation-03": require("../../assets/audio/listen/metro-situation-03.mp3"),`
- `app/(tabs)/listen.tsx:95` — direct-resolved-literal — `"metro-situation-03": require("../../assets/audio/listen/metro-situation-03.mp3"),`
- `app/(tabs)/listen.tsx:95` — indirect-unique-filename — `"metro-situation-03": require("../../assets/audio/listen/metro-situation-03.mp3"),`

### `assets/audio/listen/restaurant-gap-01.mp3`

- `app/(tabs)/listen.tsx:98` — direct-path — `"restaurant-gap-01": require("../../assets/audio/listen/restaurant-gap-01.mp3"),`
- `app/(tabs)/listen.tsx:98` — direct-resolved-literal — `"restaurant-gap-01": require("../../assets/audio/listen/restaurant-gap-01.mp3"),`
- `app/(tabs)/listen.tsx:98` — indirect-unique-filename — `"restaurant-gap-01": require("../../assets/audio/listen/restaurant-gap-01.mp3"),`

### `assets/audio/listen/restaurant-order-04.mp3`

- `app/(tabs)/listen.tsx:106` — direct-path — `"restaurant-order-04": require("../../assets/audio/listen/restaurant-order-04.mp3"),`
- `app/(tabs)/listen.tsx:106` — direct-resolved-literal — `"restaurant-order-04": require("../../assets/audio/listen/restaurant-order-04.mp3"),`
- `app/(tabs)/listen.tsx:106` — indirect-unique-filename — `"restaurant-order-04": require("../../assets/audio/listen/restaurant-order-04.mp3"),`

### `assets/audio/listen/restaurant-reaction-02.mp3`

- `app/(tabs)/listen.tsx:109` — direct-path — `"restaurant-reaction-02": require("../../assets/audio/listen/restaurant-reaction-02.mp3"),`
- `app/(tabs)/listen.tsx:109` — direct-resolved-literal — `"restaurant-reaction-02": require("../../assets/audio/listen/restaurant-reaction-02.mp3"),`
- `app/(tabs)/listen.tsx:109` — indirect-unique-filename — `"restaurant-reaction-02": require("../../assets/audio/listen/restaurant-reaction-02.mp3"),`

### `assets/audio/listen/shop-dictation-04.mp3`

- `app/(tabs)/listen.tsx:91` — direct-path — `"shop-dictation-04": require("../../assets/audio/listen/shop-dictation-04.mp3"),`
- `app/(tabs)/listen.tsx:91` — direct-resolved-literal — `"shop-dictation-04": require("../../assets/audio/listen/shop-dictation-04.mp3"),`
- `app/(tabs)/listen.tsx:91` — indirect-unique-filename — `"shop-dictation-04": require("../../assets/audio/listen/shop-dictation-04.mp3"),`

### `assets/audio/listen/shop-gap-03.mp3`

- `app/(tabs)/listen.tsx:100` — direct-path — `"shop-gap-03": require("../../assets/audio/listen/shop-gap-03.mp3"),`
- `app/(tabs)/listen.tsx:100` — direct-resolved-literal — `"shop-gap-03": require("../../assets/audio/listen/shop-gap-03.mp3"),`
- `app/(tabs)/listen.tsx:100` — indirect-unique-filename — `"shop-gap-03": require("../../assets/audio/listen/shop-gap-03.mp3"),`

### `assets/audio/listen/shop-order-03.mp3`

- `app/(tabs)/listen.tsx:105` — direct-path — `"shop-order-03": require("../../assets/audio/listen/shop-order-03.mp3"),`
- `app/(tabs)/listen.tsx:105` — direct-resolved-literal — `"shop-order-03": require("../../assets/audio/listen/shop-order-03.mp3"),`
- `app/(tabs)/listen.tsx:105` — indirect-unique-filename — `"shop-order-03": require("../../assets/audio/listen/shop-order-03.mp3"),`

### `assets/audio/listen/shop-reaction-03.mp3`

- `app/(tabs)/listen.tsx:110` — direct-path — `"shop-reaction-03": require("../../assets/audio/listen/shop-reaction-03.mp3"),`
- `app/(tabs)/listen.tsx:110` — direct-resolved-literal — `"shop-reaction-03": require("../../assets/audio/listen/shop-reaction-03.mp3"),`
- `app/(tabs)/listen.tsx:110` — indirect-unique-filename — `"shop-reaction-03": require("../../assets/audio/listen/shop-reaction-03.mp3"),`

### `assets/audio/listen/shop-situation-04.mp3`

- `app/(tabs)/listen.tsx:96` — direct-path — `"shop-situation-04": require("../../assets/audio/listen/shop-situation-04.mp3"),`
- `app/(tabs)/listen.tsx:96` — direct-resolved-literal — `"shop-situation-04": require("../../assets/audio/listen/shop-situation-04.mp3"),`
- `app/(tabs)/listen.tsx:96` — indirect-unique-filename — `"shop-situation-04": require("../../assets/audio/listen/shop-situation-04.mp3"),`

### `assets/audio/listen/street-order-05.mp3`

- `app/(tabs)/listen.tsx:107` — direct-path — `"street-order-05": require("../../assets/audio/listen/street-order-05.mp3"),`
- `app/(tabs)/listen.tsx:107` — direct-resolved-literal — `"street-order-05": require("../../assets/audio/listen/street-order-05.mp3"),`
- `app/(tabs)/listen.tsx:107` — indirect-unique-filename — `"street-order-05": require("../../assets/audio/listen/street-order-05.mp3"),`

### `assets/audio/listen/street-reaction-05.mp3`

- `app/(tabs)/listen.tsx:112` — direct-path — `"street-reaction-05": require("../../assets/audio/listen/street-reaction-05.mp3"),`
- `app/(tabs)/listen.tsx:112` — direct-resolved-literal — `"street-reaction-05": require("../../assets/audio/listen/street-reaction-05.mp3"),`
- `app/(tabs)/listen.tsx:112` — indirect-unique-filename — `"street-reaction-05": require("../../assets/audio/listen/street-reaction-05.mp3"),`

### `assets/audio/listen/street-situation-05.mp3`

- `app/(tabs)/listen.tsx:97` — direct-path — `"street-situation-05": require("../../assets/audio/listen/street-situation-05.mp3"),`
- `app/(tabs)/listen.tsx:97` — direct-resolved-literal — `"street-situation-05": require("../../assets/audio/listen/street-situation-05.mp3"),`
- `app/(tabs)/listen.tsx:97` — indirect-unique-filename — `"street-situation-05": require("../../assets/audio/listen/street-situation-05.mp3"),`

### `assets/audio/voc/after/after-bulle-1.mp3`

- `app/(tabs)/voc/nuit.tsx:56` — direct-path — `message1: require("../../../assets/audio/voc/after/after-bulle-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:56` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/after/after-bulle-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:56` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/after/after-bulle-1.mp3"),`

### `assets/audio/voc/after/after-bulle-2.mp3`

- `app/(tabs)/voc/nuit.tsx:57` — direct-path — `message2: require("../../../assets/audio/voc/after/after-bulle-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:57` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/after/after-bulle-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:57` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/after/after-bulle-2.mp3"),`

### `assets/audio/voc/after/after-bulle-3.mp3`

- `app/(tabs)/voc/nuit.tsx:58` — direct-path — `message3: require("../../../assets/audio/voc/after/after-bulle-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:58` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/after/after-bulle-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:58` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/after/after-bulle-3.mp3"),`

### `assets/audio/voc/after/after-bulle-4.mp3`

- `app/(tabs)/voc/nuit.tsx:59` — direct-path — `message4: require("../../../assets/audio/voc/after/after-bulle-4.mp3"),`
- `app/(tabs)/voc/nuit.tsx:59` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/after/after-bulle-4.mp3"),`
- `app/(tabs)/voc/nuit.tsx:59` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/after/after-bulle-4.mp3"),`

### `assets/audio/voc/after/toolbox/after-toolbox-1.mp3`

- `app/(tabs)/voc/nuit.tsx:60` — direct-path — `toolbox1: require("../../../assets/audio/voc/after/toolbox/after-toolbox-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:60` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/after/toolbox/after-toolbox-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:60` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/after/toolbox/after-toolbox-1.mp3"),`

### `assets/audio/voc/after/toolbox/after-toolbox-2.mp3`

- `app/(tabs)/voc/nuit.tsx:61` — direct-path — `toolbox2: require("../../../assets/audio/voc/after/toolbox/after-toolbox-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:61` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/after/toolbox/after-toolbox-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:61` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/after/toolbox/after-toolbox-2.mp3"),`

### `assets/audio/voc/after/toolbox/after-toolbox-3.mp3`

- `app/(tabs)/voc/nuit.tsx:62` — direct-path — `toolbox3: require("../../../assets/audio/voc/after/toolbox/after-toolbox-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:62` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/after/toolbox/after-toolbox-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:62` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/after/toolbox/after-toolbox-3.mp3"),`

### `assets/audio/voc/Bbq/bbq-bulle-1.mp3`

- `app/(tabs)/voc/gastronomie.tsx:61` — direct-path — `message1: require("../../../assets/audio/voc/Bbq/bbq-bulle-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:61` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Bbq/bbq-bulle-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:61` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/Bbq/bbq-bulle-1.mp3"),`

### `assets/audio/voc/Bbq/bbq-bulle-2.mp3`

- `app/(tabs)/voc/gastronomie.tsx:62` — direct-path — `message2: require("../../../assets/audio/voc/Bbq/bbq-bulle-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:62` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Bbq/bbq-bulle-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:62` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/Bbq/bbq-bulle-2.mp3"),`

### `assets/audio/voc/Bbq/bbq-bulle-3.mp3`

- `app/(tabs)/voc/gastronomie.tsx:63` — direct-path — `message3: require("../../../assets/audio/voc/Bbq/bbq-bulle-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:63` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Bbq/bbq-bulle-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:63` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/Bbq/bbq-bulle-3.mp3"),`

### `assets/audio/voc/Bbq/bbq-bulle-4.mp3`

- `app/(tabs)/voc/gastronomie.tsx:64` — direct-path — `message4: require("../../../assets/audio/voc/Bbq/bbq-bulle-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:64` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Bbq/bbq-bulle-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:64` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/Bbq/bbq-bulle-4.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-1.mp3`

- `app/(tabs)/voc/gastronomie.tsx:66` — direct-path — `bonAppetit: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:66` — direct-resolved-literal — `bonAppetit: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:66` — indirect-unique-filename — `bonAppetit: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-1.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-2.mp3`

- `app/(tabs)/voc/gastronomie.tsx:67` — direct-path — `unePortion: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:67` — direct-resolved-literal — `unePortion: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:67` — indirect-unique-filename — `unePortion: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-2.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-3.mp3`

- `app/(tabs)/voc/gastronomie.tsx:68` — direct-path — `deuxPortions: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:68` — direct-resolved-literal — `deuxPortions: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:68` — indirect-unique-filename — `deuxPortions: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-3.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-4.mp3`

- `app/(tabs)/voc/gastronomie.tsx:69` — direct-path — `poitrinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:69` — direct-resolved-literal — `poitrinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:69` — indirect-unique-filename — `poitrinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-4.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-5.mp3`

- `app/(tabs)/voc/gastronomie.tsx:70` — direct-path — `echinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-5.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:70` — direct-resolved-literal — `echinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-5.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:70` — indirect-unique-filename — `echinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-5.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-6.mp3`

- `app/(tabs)/voc/gastronomie.tsx:71` — direct-path — `laitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-6.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:71` — direct-resolved-literal — `laitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-6.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:71` — indirect-unique-filename — `laitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-6.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-7.mp3`

- `app/(tabs)/voc/gastronomie.tsx:72` — direct-path — `wrapLaitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-7.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:72` — direct-resolved-literal — `wrapLaitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-7.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:72` — indirect-unique-filename — `wrapLaitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-7.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-8.mp3`

- `app/(tabs)/voc/gastronomie.tsx:73` — direct-path — `sauceWrap: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-8.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:73` — direct-resolved-literal — `sauceWrap: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-8.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:73` — indirect-unique-filename — `sauceWrap: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-8.mp3"),`

### `assets/audio/voc/Bbq/Toolbox/bbq-toolbox-9.mp3`

- `app/(tabs)/voc/gastronomie.tsx:74` — direct-path — `changerPlaque: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-9.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:74` — direct-resolved-literal — `changerPlaque: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-9.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:74` — indirect-unique-filename — `changerPlaque: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-9.mp3"),`

### `assets/audio/voc/couple/couple-bulle-1.mp3`

- `app/(tabs)/voc/romance.tsx:56` — direct-path — `message1: require("../../../assets/audio/voc/couple/couple-bulle-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:56` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/couple/couple-bulle-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:56` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/couple/couple-bulle-1.mp3"),`

### `assets/audio/voc/couple/couple-bulle-2.mp3`

- `app/(tabs)/voc/romance.tsx:57` — direct-path — `message2: require("../../../assets/audio/voc/couple/couple-bulle-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:57` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/couple/couple-bulle-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:57` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/couple/couple-bulle-2.mp3"),`

### `assets/audio/voc/couple/couple-bulle-3.mp3`

- `app/(tabs)/voc/romance.tsx:58` — direct-path — `message3: require("../../../assets/audio/voc/couple/couple-bulle-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:58` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/couple/couple-bulle-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:58` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/couple/couple-bulle-3.mp3"),`

### `assets/audio/voc/couple/couple-bulle-4.mp3`

- `app/(tabs)/voc/romance.tsx:59` — direct-path — `message4: require("../../../assets/audio/voc/couple/couple-bulle-4.mp3"),`
- `app/(tabs)/voc/romance.tsx:59` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/couple/couple-bulle-4.mp3"),`
- `app/(tabs)/voc/romance.tsx:59` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/couple/couple-bulle-4.mp3"),`

### `assets/audio/voc/couple/toolbox/couple-toolbox-1.mp3`

- `app/(tabs)/voc/romance.tsx:60` — direct-path — `toolbox1: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:60` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:60` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-1.mp3"),`

### `assets/audio/voc/couple/toolbox/couple-toolbox-2.mp3`

- `app/(tabs)/voc/romance.tsx:61` — direct-path — `toolbox2: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:61` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:61` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-2.mp3"),`

### `assets/audio/voc/couple/toolbox/couple-toolbox-3.mp3`

- `app/(tabs)/voc/romance.tsx:62` — direct-path — `toolbox3: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:62` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:62` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-3.mp3"),`

### `assets/audio/voc/CultureCafe/culture-cafe-bulle-1.mp3`

- `app/(tabs)/voc/gastronomie.tsx:94` — direct-path — `message1: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:94` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:94` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-1.mp3"),`

### `assets/audio/voc/CultureCafe/culture-cafe-bulle-2.mp3`

- `app/(tabs)/voc/gastronomie.tsx:95` — direct-path — `message2: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:95` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:95` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-2.mp3"),`

### `assets/audio/voc/CultureCafe/culture-cafe-bulle-3.mp3`

- `app/(tabs)/voc/gastronomie.tsx:96` — direct-path — `message3: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:96` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:96` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-3.mp3"),`

### `assets/audio/voc/CultureCafe/culture-cafe-bulle-4.mp3`

- `app/(tabs)/voc/gastronomie.tsx:97` — direct-path — `message4: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:97` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:97` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-4.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-1.mp3`

- `app/(tabs)/voc/gastronomie.tsx:99` — direct-path — `ahAh: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:99` — direct-resolved-literal — `ahAh: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:99` — indirect-unique-filename — `ahAh: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-1.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-2.mp3`

- `app/(tabs)/voc/gastronomie.tsx:100` — direct-path — `iceAmericano: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:100` — direct-resolved-literal — `iceAmericano: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:100` — indirect-unique-filename — `iceAmericano: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-2.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-3.mp3`

- `app/(tabs)/voc/gastronomie.tsx:101` — direct-path — `unVerreSvp: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:101` — direct-resolved-literal — `unVerreSvp: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:101` — indirect-unique-filename — `unVerreSvp: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-3.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-4.mp3`

- `app/(tabs)/voc/gastronomie.tsx:102` — direct-path — `surPlace: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:102` — direct-resolved-literal — `surPlace: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:102` — indirect-unique-filename — `surPlace: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-4.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-5.mp3`

- `app/(tabs)/voc/gastronomie.tsx:103` — direct-path — `takeout: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-5.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:103` — direct-resolved-literal — `takeout: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-5.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:103` — indirect-unique-filename — `takeout: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-5.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-6.mp3`

- `app/(tabs)/voc/gastronomie.tsx:104` — direct-path — `jindongbel: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-6.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:104` — direct-resolved-literal — `jindongbel: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-6.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:104` — indirect-unique-filename — `jindongbel: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-6.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-7.mp3`

- `app/(tabs)/voc/gastronomie.tsx:105` — direct-path — `ambiance: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-7.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:105` — direct-resolved-literal — `ambiance: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-7.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:105` — indirect-unique-filename — `ambiance: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-7.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-8.mp3`

- `app/(tabs)/voc/gastronomie.tsx:106` — direct-path — `photo: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-8.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:106` — direct-resolved-literal — `photo: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-8.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:106` — indirect-unique-filename — `photo: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-8.mp3"),`

### `assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-9.mp3`

- `app/(tabs)/voc/gastronomie.tsx:107` — direct-path — `placeCalme: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-9.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:107` — direct-resolved-literal — `placeCalme: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-9.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:107` — indirect-unique-filename — `placeCalme: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-9.mp3"),`

### `assets/audio/voc/Excuser/excuser-bulle-1.mp3`

- `app/(tabs)/voc/basics.tsx:89` — direct-path — `message1: require("../../../assets/audio/voc/Excuser/excuser-bulle-1.mp3"),`
- `app/(tabs)/voc/basics.tsx:89` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Excuser/excuser-bulle-1.mp3"),`
- `app/(tabs)/voc/basics.tsx:89` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/Excuser/excuser-bulle-1.mp3"),`

### `assets/audio/voc/Excuser/excuser-bulle-2.mp3`

- `app/(tabs)/voc/basics.tsx:90` — direct-path — `message2: require("../../../assets/audio/voc/Excuser/excuser-bulle-2.mp3"),`
- `app/(tabs)/voc/basics.tsx:90` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Excuser/excuser-bulle-2.mp3"),`
- `app/(tabs)/voc/basics.tsx:90` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/Excuser/excuser-bulle-2.mp3"),`

### `assets/audio/voc/Excuser/excuser-bulle-3.mp3`

- `app/(tabs)/voc/basics.tsx:91` — direct-path — `message3: require("../../../assets/audio/voc/Excuser/excuser-bulle-3.mp3"),`
- `app/(tabs)/voc/basics.tsx:91` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Excuser/excuser-bulle-3.mp3"),`
- `app/(tabs)/voc/basics.tsx:91` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/Excuser/excuser-bulle-3.mp3"),`

### `assets/audio/voc/Excuser/excuser-bulle-4.mp3`

- `app/(tabs)/voc/basics.tsx:92` — direct-path — `message4: require("../../../assets/audio/voc/Excuser/excuser-bulle-4.mp3"),`
- `app/(tabs)/voc/basics.tsx:92` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Excuser/excuser-bulle-4.mp3"),`
- `app/(tabs)/voc/basics.tsx:92` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/Excuser/excuser-bulle-4.mp3"),`

### `assets/audio/voc/Excuser/toolbox/anieyo.mp3`

- `app/(tabs)/voc/basics.tsx:94` — direct-path — `anieyo: require("../../../assets/audio/voc/Excuser/toolbox/anieyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:94` — direct-resolved-literal — `anieyo: require("../../../assets/audio/voc/Excuser/toolbox/anieyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:94` — indirect-unique-filename — `anieyo: require("../../../assets/audio/voc/Excuser/toolbox/anieyo.mp3"),`

### `assets/audio/voc/Excuser/toolbox/ca-va.mp3`

- `app/(tabs)/voc/basics.tsx:100` — direct-path — `caVa: require("../../../assets/audio/voc/Excuser/toolbox/ca-va.mp3"),`
- `app/(tabs)/voc/basics.tsx:100` — direct-resolved-literal — `caVa: require("../../../assets/audio/voc/Excuser/toolbox/ca-va.mp3"),`
- `app/(tabs)/voc/basics.tsx:100` — indirect-unique-filename — `caVa: require("../../../assets/audio/voc/Excuser/toolbox/ca-va.mp3"),`

### `assets/audio/voc/Excuser/toolbox/desole.mp3`

- `app/(tabs)/voc/basics.tsx:95` — direct-path — `desole: require("../../../assets/audio/voc/Excuser/toolbox/desole.mp3"),`
- `app/(tabs)/voc/basics.tsx:95` — direct-resolved-literal — `desole: require("../../../assets/audio/voc/Excuser/toolbox/desole.mp3"),`
- `app/(tabs)/voc/basics.tsx:95` — indirect-unique-filename — `desole: require("../../../assets/audio/voc/Excuser/toolbox/desole.mp3"),`

### `assets/audio/voc/Excuser/toolbox/mianhae.mp3`

- `app/(tabs)/voc/basics.tsx:96` — direct-path — `mianhae: require("../../../assets/audio/voc/Excuser/toolbox/mianhae.mp3"),`
- `app/(tabs)/voc/basics.tsx:96` — direct-resolved-literal — `mianhae: require("../../../assets/audio/voc/Excuser/toolbox/mianhae.mp3"),`
- `app/(tabs)/voc/basics.tsx:96` — indirect-unique-filename — `mianhae: require("../../../assets/audio/voc/Excuser/toolbox/mianhae.mp3"),`

### `assets/audio/voc/Excuser/toolbox/mianhaeyo.mp3`

- `app/(tabs)/voc/basics.tsx:97` — direct-path — `mianhaeyo: require("../../../assets/audio/voc/Excuser/toolbox/mianhaeyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:97` — direct-resolved-literal — `mianhaeyo: require("../../../assets/audio/voc/Excuser/toolbox/mianhaeyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:97` — indirect-unique-filename — `mianhaeyo: require("../../../assets/audio/voc/Excuser/toolbox/mianhaeyo.mp3"),`

### `assets/audio/voc/Excuser/toolbox/retard-desole.mp3`

- `app/(tabs)/voc/basics.tsx:98` — direct-path — `retardDesole: require("../../../assets/audio/voc/Excuser/toolbox/retard-desole.mp3"),`
- `app/(tabs)/voc/basics.tsx:98` — direct-resolved-literal — `retardDesole: require("../../../assets/audio/voc/Excuser/toolbox/retard-desole.mp3"),`
- `app/(tabs)/voc/basics.tsx:98` — indirect-unique-filename — `retardDesole: require("../../../assets/audio/voc/Excuser/toolbox/retard-desole.mp3"),`

### `assets/audio/voc/Excuser/toolbox/vraiment-desole.mp3`

- `app/(tabs)/voc/basics.tsx:99` — direct-path — `vraimentDesole: require("../../../assets/audio/voc/Excuser/toolbox/vraiment-desole.mp3"),`
- `app/(tabs)/voc/basics.tsx:99` — direct-resolved-literal — `vraimentDesole: require("../../../assets/audio/voc/Excuser/toolbox/vraiment-desole.mp3"),`
- `app/(tabs)/voc/basics.tsx:99` — indirect-unique-filename — `vraimentDesole: require("../../../assets/audio/voc/Excuser/toolbox/vraiment-desole.mp3"),`

### `assets/audio/voc/hopital/hopital-bulle-1.mp3`

- `app/(tabs)/voc/sante.tsx:42` — direct-path — `message1: require("../../../assets/audio/voc/hopital/hopital-bulle-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:42` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/hopital/hopital-bulle-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:42` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/hopital/hopital-bulle-1.mp3"),`

### `assets/audio/voc/hopital/hopital-bulle-2.mp3`

- `app/(tabs)/voc/sante.tsx:43` — direct-path — `message2: require("../../../assets/audio/voc/hopital/hopital-bulle-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:43` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/hopital/hopital-bulle-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:43` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/hopital/hopital-bulle-2.mp3"),`

### `assets/audio/voc/hopital/hopital-bulle-3.mp3`

- `app/(tabs)/voc/sante.tsx:44` — direct-path — `message3: require("../../../assets/audio/voc/hopital/hopital-bulle-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:44` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/hopital/hopital-bulle-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:44` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/hopital/hopital-bulle-3.mp3"),`

### `assets/audio/voc/hopital/hopital-bulle-4.mp3`

- `app/(tabs)/voc/sante.tsx:45` — direct-path — `message4: require("../../../assets/audio/voc/hopital/hopital-bulle-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:45` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/hopital/hopital-bulle-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:45` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/hopital/hopital-bulle-4.mp3"),`

### `assets/audio/voc/hopital/toolbox/hopital-toolbox-1.mp3`

- `app/(tabs)/voc/sante.tsx:46` — direct-path — `toolbox1: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:46` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:46` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-1.mp3"),`

### `assets/audio/voc/hopital/toolbox/hopital-toolbox-2.mp3`

- `app/(tabs)/voc/sante.tsx:47` — direct-path — `toolbox2: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:47` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:47` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-2.mp3"),`

### `assets/audio/voc/hopital/toolbox/hopital-toolbox-3.mp3`

- `app/(tabs)/voc/sante.tsx:48` — direct-path — `toolbox3: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:48` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:48` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-3.mp3"),`

### `assets/audio/voc/interview/interview-bulle-1.mp3`

- `app/(tabs)/voc/work.tsx:65` — direct-path — `message1: require("../../../assets/audio/voc/interview/interview-bulle-1.mp3"),`
- `app/(tabs)/voc/work.tsx:65` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/interview/interview-bulle-1.mp3"),`
- `app/(tabs)/voc/work.tsx:65` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/interview/interview-bulle-1.mp3"),`

### `assets/audio/voc/interview/interview-bulle-2.mp3`

- `app/(tabs)/voc/work.tsx:66` — direct-path — `message2: require("../../../assets/audio/voc/interview/interview-bulle-2.mp3"),`
- `app/(tabs)/voc/work.tsx:66` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/interview/interview-bulle-2.mp3"),`
- `app/(tabs)/voc/work.tsx:66` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/interview/interview-bulle-2.mp3"),`

### `assets/audio/voc/interview/interview-bulle-3.mp3`

- `app/(tabs)/voc/work.tsx:67` — direct-path — `message3: require("../../../assets/audio/voc/interview/interview-bulle-3.mp3"),`
- `app/(tabs)/voc/work.tsx:67` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/interview/interview-bulle-3.mp3"),`
- `app/(tabs)/voc/work.tsx:67` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/interview/interview-bulle-3.mp3"),`

### `assets/audio/voc/interview/interview-bulle-4.mp3`

- `app/(tabs)/voc/work.tsx:68` — direct-path — `message4: require("../../../assets/audio/voc/interview/interview-bulle-4.mp3"),`
- `app/(tabs)/voc/work.tsx:68` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/interview/interview-bulle-4.mp3"),`
- `app/(tabs)/voc/work.tsx:68` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/interview/interview-bulle-4.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-1.mp3`

- `app/(tabs)/voc/work.tsx:69` — direct-path — `toolbox1: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-1.mp3"),`
- `app/(tabs)/voc/work.tsx:69` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-1.mp3"),`
- `app/(tabs)/voc/work.tsx:69` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-1.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-2.mp3`

- `app/(tabs)/voc/work.tsx:70` — direct-path — `toolbox2: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-2.mp3"),`
- `app/(tabs)/voc/work.tsx:70` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-2.mp3"),`
- `app/(tabs)/voc/work.tsx:70` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-2.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-3.mp3`

- `app/(tabs)/voc/work.tsx:71` — direct-path — `toolbox3: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-3.mp3"),`
- `app/(tabs)/voc/work.tsx:71` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-3.mp3"),`
- `app/(tabs)/voc/work.tsx:71` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-3.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-4.mp3`

- `app/(tabs)/voc/work.tsx:72` — direct-path — `toolbox4: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-4.mp3"),`
- `app/(tabs)/voc/work.tsx:72` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-4.mp3"),`
- `app/(tabs)/voc/work.tsx:72` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-4.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-5.mp3`

- `app/(tabs)/voc/work.tsx:73` — direct-path — `toolbox5: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-5.mp3"),`
- `app/(tabs)/voc/work.tsx:73` — direct-resolved-literal — `toolbox5: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-5.mp3"),`
- `app/(tabs)/voc/work.tsx:73` — indirect-unique-filename — `toolbox5: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-5.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-6.mp3`

- `app/(tabs)/voc/work.tsx:74` — direct-path — `toolbox6: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-6.mp3"),`
- `app/(tabs)/voc/work.tsx:74` — direct-resolved-literal — `toolbox6: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-6.mp3"),`
- `app/(tabs)/voc/work.tsx:74` — indirect-unique-filename — `toolbox6: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-6.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-7.mp3`

- `app/(tabs)/voc/work.tsx:75` — direct-path — `toolbox7: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-7.mp3"),`
- `app/(tabs)/voc/work.tsx:75` — direct-resolved-literal — `toolbox7: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-7.mp3"),`
- `app/(tabs)/voc/work.tsx:75` — indirect-unique-filename — `toolbox7: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-7.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-8.mp3`

- `app/(tabs)/voc/work.tsx:76` — direct-path — `toolbox8: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-8.mp3"),`
- `app/(tabs)/voc/work.tsx:76` — direct-resolved-literal — `toolbox8: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-8.mp3"),`
- `app/(tabs)/voc/work.tsx:76` — indirect-unique-filename — `toolbox8: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-8.mp3"),`

### `assets/audio/voc/interview/toolbox/interview-toolbox-9.mp3`

- `app/(tabs)/voc/work.tsx:77` — direct-path — `toolbox9: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-9.mp3"),`
- `app/(tabs)/voc/work.tsx:77` — direct-resolved-literal — `toolbox9: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-9.mp3"),`
- `app/(tabs)/voc/work.tsx:77` — indirect-unique-filename — `toolbox9: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-9.mp3"),`

### `assets/audio/voc/le-some/flirt-bulle-1.mp3`

- `app/(tabs)/voc/romance.tsx:46` — direct-path — `message1: require("../../../assets/audio/voc/le-some/flirt-bulle-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:46` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/le-some/flirt-bulle-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:46` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/le-some/flirt-bulle-1.mp3"),`

### `assets/audio/voc/le-some/flirt-bulle-2.mp3`

- `app/(tabs)/voc/romance.tsx:47` — direct-path — `message2: require("../../../assets/audio/voc/le-some/flirt-bulle-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:47` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/le-some/flirt-bulle-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:47` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/le-some/flirt-bulle-2.mp3"),`

### `assets/audio/voc/le-some/flirt-bulle-3.mp3`

- `app/(tabs)/voc/romance.tsx:48` — direct-path — `message3: require("../../../assets/audio/voc/le-some/flirt-bulle-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:48` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/le-some/flirt-bulle-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:48` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/le-some/flirt-bulle-3.mp3"),`

### `assets/audio/voc/le-some/flirt-bulle-4.mp3`

- `app/(tabs)/voc/romance.tsx:49` — direct-path — `message4: require("../../../assets/audio/voc/le-some/flirt-bulle-4.mp3"),`
- `app/(tabs)/voc/romance.tsx:49` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/le-some/flirt-bulle-4.mp3"),`
- `app/(tabs)/voc/romance.tsx:49` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/le-some/flirt-bulle-4.mp3"),`

### `assets/audio/voc/le-some/toolbox/some-toolbox-1.mp3`

- `app/(tabs)/voc/romance.tsx:50` — direct-path — `toolbox1: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:50` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:50` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-1.mp3"),`

### `assets/audio/voc/le-some/toolbox/some-toolbox-2.mp3`

- `app/(tabs)/voc/romance.tsx:51` — direct-path — `toolbox2: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:51` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:51` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-2.mp3"),`

### `assets/audio/voc/le-some/toolbox/some-toolbox-3.mp3`

- `app/(tabs)/voc/romance.tsx:52` — direct-path — `toolbox3: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:52` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:52` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-3.mp3"),`

### `assets/audio/voc/mail/mail-bulle-1.mp3`

- `app/(tabs)/voc/work.tsx:49` — direct-path — `message1: require("../../../assets/audio/voc/mail/mail-bulle-1.mp3"),`
- `app/(tabs)/voc/work.tsx:49` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/mail/mail-bulle-1.mp3"),`
- `app/(tabs)/voc/work.tsx:49` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/mail/mail-bulle-1.mp3"),`

### `assets/audio/voc/mail/mail-bulle-2.mp3`

- `app/(tabs)/voc/work.tsx:50` — direct-path — `message2: require("../../../assets/audio/voc/mail/mail-bulle-2.mp3"),`
- `app/(tabs)/voc/work.tsx:50` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/mail/mail-bulle-2.mp3"),`
- `app/(tabs)/voc/work.tsx:50` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/mail/mail-bulle-2.mp3"),`

### `assets/audio/voc/mail/mail-bulle-3.mp3`

- `app/(tabs)/voc/work.tsx:51` — direct-path — `message3: require("../../../assets/audio/voc/mail/mail-bulle-3.mp3"),`
- `app/(tabs)/voc/work.tsx:51` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/mail/mail-bulle-3.mp3"),`
- `app/(tabs)/voc/work.tsx:51` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/mail/mail-bulle-3.mp3"),`

### `assets/audio/voc/mail/mail-bulle-4.mp3`

- `app/(tabs)/voc/work.tsx:52` — direct-path — `message4: require("../../../assets/audio/voc/mail/mail-bulle-4.mp3"),`
- `app/(tabs)/voc/work.tsx:52` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/mail/mail-bulle-4.mp3"),`
- `app/(tabs)/voc/work.tsx:52` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/mail/mail-bulle-4.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-1.mp3`

- `app/(tabs)/voc/work.tsx:53` — direct-path — `toolbox1: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-1.mp3"),`
- `app/(tabs)/voc/work.tsx:53` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-1.mp3"),`
- `app/(tabs)/voc/work.tsx:53` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-1.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-2.mp3`

- `app/(tabs)/voc/work.tsx:54` — direct-path — `toolbox2: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-2.mp3"),`
- `app/(tabs)/voc/work.tsx:54` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-2.mp3"),`
- `app/(tabs)/voc/work.tsx:54` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-2.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-3.mp3`

- `app/(tabs)/voc/work.tsx:55` — direct-path — `toolbox3: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-3.mp3"),`
- `app/(tabs)/voc/work.tsx:55` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-3.mp3"),`
- `app/(tabs)/voc/work.tsx:55` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-3.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-4.mp3`

- `app/(tabs)/voc/work.tsx:56` — direct-path — `toolbox4: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-4.mp3"),`
- `app/(tabs)/voc/work.tsx:56` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-4.mp3"),`
- `app/(tabs)/voc/work.tsx:56` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-4.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-5.mp3`

- `app/(tabs)/voc/work.tsx:57` — direct-path — `toolbox5: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-5.mp3"),`
- `app/(tabs)/voc/work.tsx:57` — direct-resolved-literal — `toolbox5: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-5.mp3"),`
- `app/(tabs)/voc/work.tsx:57` — indirect-unique-filename — `toolbox5: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-5.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-6.mp3`

- `app/(tabs)/voc/work.tsx:58` — direct-path — `toolbox6: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-6.mp3"),`
- `app/(tabs)/voc/work.tsx:58` — direct-resolved-literal — `toolbox6: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-6.mp3"),`
- `app/(tabs)/voc/work.tsx:58` — indirect-unique-filename — `toolbox6: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-6.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-7.mp3`

- `app/(tabs)/voc/work.tsx:59` — direct-path — `toolbox7: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-7.mp3"),`
- `app/(tabs)/voc/work.tsx:59` — direct-resolved-literal — `toolbox7: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-7.mp3"),`
- `app/(tabs)/voc/work.tsx:59` — indirect-unique-filename — `toolbox7: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-7.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-8.mp3`

- `app/(tabs)/voc/work.tsx:60` — direct-path — `toolbox8: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-8.mp3"),`
- `app/(tabs)/voc/work.tsx:60` — direct-resolved-literal — `toolbox8: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-8.mp3"),`
- `app/(tabs)/voc/work.tsx:60` — indirect-unique-filename — `toolbox8: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-8.mp3"),`

### `assets/audio/voc/mail/toolbox/message-toolbox-9.mp3`

- `app/(tabs)/voc/work.tsx:61` — direct-path — `toolbox9: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-9.mp3"),`
- `app/(tabs)/voc/work.tsx:61` — direct-resolved-literal — `toolbox9: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-9.mp3"),`
- `app/(tabs)/voc/work.tsx:61` — indirect-unique-filename — `toolbox9: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-9.mp3"),`

### `assets/audio/voc/Metro/metro-bulle-1.mp3`

- `app/(tabs)/voc/transport.tsx:65` — direct-path — `message1: require("../../../assets/audio/voc/Metro/metro-bulle-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:65` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Metro/metro-bulle-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:65` — indirect-filename-with-parent — `message1: require("../../../assets/audio/voc/Metro/metro-bulle-1.mp3"),`

### `assets/audio/voc/Metro/metro-bulle-2.mp3`

- `app/(tabs)/voc/transport.tsx:66` — direct-path — `message2: require("../../../assets/audio/voc/Metro/metro-bulle-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:66` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Metro/metro-bulle-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:66` — indirect-filename-with-parent — `message2: require("../../../assets/audio/voc/Metro/metro-bulle-2.mp3"),`

### `assets/audio/voc/Metro/metro-bulle-3.mp3`

- `app/(tabs)/voc/transport.tsx:67` — direct-path — `message3: require("../../../assets/audio/voc/Metro/metro-bulle-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:67` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Metro/metro-bulle-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:67` — indirect-filename-with-parent — `message3: require("../../../assets/audio/voc/Metro/metro-bulle-3.mp3"),`

### `assets/audio/voc/Metro/metro-bulle-4.mp3`

- `app/(tabs)/voc/transport.tsx:68` — direct-path — `message4: require("../../../assets/audio/voc/Metro/metro-bulle-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:68` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Metro/metro-bulle-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:68` — indirect-filename-with-parent — `message4: require("../../../assets/audio/voc/Metro/metro-bulle-4.mp3"),`

### `assets/audio/voc/Metro/toolbox/carte-transport.mp3`

- `app/(tabs)/voc/transport.tsx:70` — direct-path — `carteTransport: require("../../../assets/audio/voc/Metro/toolbox/carte-transport.mp3"),`
- `app/(tabs)/voc/transport.tsx:70` — direct-resolved-literal — `carteTransport: require("../../../assets/audio/voc/Metro/toolbox/carte-transport.mp3"),`
- `app/(tabs)/voc/transport.tsx:70` — indirect-unique-filename — `carteTransport: require("../../../assets/audio/voc/Metro/toolbox/carte-transport.mp3"),`

### `assets/audio/voc/Metro/toolbox/cette-station.mp3`

- `app/(tabs)/voc/transport.tsx:78` — direct-path — `cetteStation: require("../../../assets/audio/voc/Metro/toolbox/cette-station.mp3"),`
- `app/(tabs)/voc/transport.tsx:78` — direct-resolved-literal — `cetteStation: require("../../../assets/audio/voc/Metro/toolbox/cette-station.mp3"),`
- `app/(tabs)/voc/transport.tsx:78` — indirect-unique-filename — `cetteStation: require("../../../assets/audio/voc/Metro/toolbox/cette-station.mp3"),`

### `assets/audio/voc/Metro/toolbox/correspondance.mp3`

- `app/(tabs)/voc/transport.tsx:71` — direct-path — `correspondance: require("../../../assets/audio/voc/Metro/toolbox/correspondance.mp3"),`
- `app/(tabs)/voc/transport.tsx:71` — direct-resolved-literal — `correspondance: require("../../../assets/audio/voc/Metro/toolbox/correspondance.mp3"),`
- `app/(tabs)/voc/transport.tsx:71` — indirect-unique-filename — `correspondance: require("../../../assets/audio/voc/Metro/toolbox/correspondance.mp3"),`

### `assets/audio/voc/Metro/toolbox/hongdaeibguyeok.mp3`

- `app/(tabs)/voc/transport.tsx:72` — direct-path — `hongdaeipguyeok: require("../../../assets/audio/voc/Metro/toolbox/hongdaeibguyeok.mp3"),`
- `app/(tabs)/voc/transport.tsx:72` — direct-resolved-literal — `hongdaeipguyeok: require("../../../assets/audio/voc/Metro/toolbox/hongdaeibguyeok.mp3"),`
- `app/(tabs)/voc/transport.tsx:72` — indirect-unique-filename — `hongdaeipguyeok: require("../../../assets/audio/voc/Metro/toolbox/hongdaeibguyeok.mp3"),`

### `assets/audio/voc/Metro/toolbox/hwanseung.mp3`

- `app/(tabs)/voc/transport.tsx:73` — direct-path — `hwangseug: require("../../../assets/audio/voc/Metro/toolbox/hwanseung.mp3"),`
- `app/(tabs)/voc/transport.tsx:73` — direct-resolved-literal — `hwangseug: require("../../../assets/audio/voc/Metro/toolbox/hwanseung.mp3"),`
- `app/(tabs)/voc/transport.tsx:73` — indirect-unique-filename — `hwangseug: require("../../../assets/audio/voc/Metro/toolbox/hwanseung.mp3"),`

### `assets/audio/voc/Metro/toolbox/ligne2.mp3`

- `app/(tabs)/voc/transport.tsx:74` — direct-path — `ligne2: require("../../../assets/audio/voc/Metro/toolbox/ligne2.mp3"),`
- `app/(tabs)/voc/transport.tsx:74` — direct-resolved-literal — `ligne2: require("../../../assets/audio/voc/Metro/toolbox/ligne2.mp3"),`
- `app/(tabs)/voc/transport.tsx:74` — indirect-unique-filename — `ligne2: require("../../../assets/audio/voc/Metro/toolbox/ligne2.mp3"),`

### `assets/audio/voc/Metro/toolbox/metro.mp3`

- `app/(tabs)/voc/transport.tsx:77` — direct-path — `metro: require("../../../assets/audio/voc/Metro/toolbox/metro.mp3"),`
- `app/(tabs)/voc/transport.tsx:77` — direct-resolved-literal — `metro: require("../../../assets/audio/voc/Metro/toolbox/metro.mp3"),`
- `app/(tabs)/voc/transport.tsx:77` — indirect-filename-with-parent — `metro: require("../../../assets/audio/voc/Metro/toolbox/metro.mp3"),`

### `assets/audio/voc/Metro/toolbox/station-metro.mp3`

- `app/(tabs)/voc/transport.tsx:75` — direct-path — `stationMetro: require("../../../assets/audio/voc/Metro/toolbox/station-metro.mp3"),`
- `app/(tabs)/voc/transport.tsx:75` — direct-resolved-literal — `stationMetro: require("../../../assets/audio/voc/Metro/toolbox/station-metro.mp3"),`
- `app/(tabs)/voc/transport.tsx:75` — indirect-unique-filename — `stationMetro: require("../../../assets/audio/voc/Metro/toolbox/station-metro.mp3"),`

### `assets/audio/voc/Metro/toolbox/taeumyeok.mp3`

- `app/(tabs)/voc/transport.tsx:76` — direct-path — `taeumyeok: require("../../../assets/audio/voc/Metro/toolbox/taeumyeok.mp3"),`
- `app/(tabs)/voc/transport.tsx:76` — direct-resolved-literal — `taeumyeok: require("../../../assets/audio/voc/Metro/toolbox/taeumyeok.mp3"),`
- `app/(tabs)/voc/transport.tsx:76` — indirect-unique-filename — `taeumyeok: require("../../../assets/audio/voc/Metro/toolbox/taeumyeok.mp3"),`

### `assets/audio/voc/noraebang/noraebang-bulle-1.mp3`

- `app/(tabs)/voc/nuit.tsx:46` — direct-path — `message1: require("../../../assets/audio/voc/noraebang/noraebang-bulle-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:46` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/noraebang/noraebang-bulle-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:46` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/noraebang/noraebang-bulle-1.mp3"),`

### `assets/audio/voc/noraebang/noraebang-bulle-2.mp3`

- `app/(tabs)/voc/nuit.tsx:47` — direct-path — `message2: require("../../../assets/audio/voc/noraebang/noraebang-bulle-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:47` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/noraebang/noraebang-bulle-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:47` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/noraebang/noraebang-bulle-2.mp3"),`

### `assets/audio/voc/noraebang/noraebang-bulle-3.mp3`

- `app/(tabs)/voc/nuit.tsx:48` — direct-path — `message3: require("../../../assets/audio/voc/noraebang/noraebang-bulle-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:48` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/noraebang/noraebang-bulle-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:48` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/noraebang/noraebang-bulle-3.mp3"),`

### `assets/audio/voc/noraebang/noraebang-bulle-4.mp3`

- `app/(tabs)/voc/nuit.tsx:49` — direct-path — `message4: require("../../../assets/audio/voc/noraebang/noraebang-bulle-4.mp3"),`
- `app/(tabs)/voc/nuit.tsx:49` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/noraebang/noraebang-bulle-4.mp3"),`
- `app/(tabs)/voc/nuit.tsx:49` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/noraebang/noraebang-bulle-4.mp3"),`

### `assets/audio/voc/noraebang/toolbox/noraebang-toolbox-1.mp3`

- `app/(tabs)/voc/nuit.tsx:50` — direct-path — `toolbox1: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:50` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:50` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-1.mp3"),`

### `assets/audio/voc/noraebang/toolbox/noraebang-toolbox-2.mp3`

- `app/(tabs)/voc/nuit.tsx:51` — direct-path — `toolbox2: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:51` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:51` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-2.mp3"),`

### `assets/audio/voc/noraebang/toolbox/noraebang-toolbox-3.mp3`

- `app/(tabs)/voc/nuit.tsx:52` — direct-path — `toolbox3: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:52` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:52` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-3.mp3"),`

### `assets/audio/voc/nuit/pocha-bulle-1.mp3`

- `app/(tabs)/voc/nuit.tsx:36` — direct-path — `message1: require("../../../assets/audio/voc/nuit/pocha-bulle-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:36` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/nuit/pocha-bulle-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:36` — indirect-filename-with-parent — `message1: require("../../../assets/audio/voc/nuit/pocha-bulle-1.mp3"),`

### `assets/audio/voc/nuit/pocha-bulle-2.mp3`

- `app/(tabs)/voc/nuit.tsx:37` — direct-path — `message2: require("../../../assets/audio/voc/nuit/pocha-bulle-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:37` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/nuit/pocha-bulle-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:37` — indirect-filename-with-parent — `message2: require("../../../assets/audio/voc/nuit/pocha-bulle-2.mp3"),`

### `assets/audio/voc/nuit/pocha-bulle-3.mp3`

- `app/(tabs)/voc/nuit.tsx:38` — direct-path — `message3: require("../../../assets/audio/voc/nuit/pocha-bulle-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:38` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/nuit/pocha-bulle-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:38` — indirect-filename-with-parent — `message3: require("../../../assets/audio/voc/nuit/pocha-bulle-3.mp3"),`

### `assets/audio/voc/nuit/pocha-bulle-4.mp3`

- `app/(tabs)/voc/nuit.tsx:39` — direct-path — `message4: require("../../../assets/audio/voc/nuit/pocha-bulle-4.mp3"),`
- `app/(tabs)/voc/nuit.tsx:39` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/nuit/pocha-bulle-4.mp3"),`
- `app/(tabs)/voc/nuit.tsx:39` — indirect-filename-with-parent — `message4: require("../../../assets/audio/voc/nuit/pocha-bulle-4.mp3"),`

### `assets/audio/voc/nuit/toolbox/pocha-toolbox-1.mp3`

- `app/(tabs)/voc/nuit.tsx:40` — direct-path — `toolbox1: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:40` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-1.mp3"),`
- `app/(tabs)/voc/nuit.tsx:40` — indirect-filename-with-parent — `toolbox1: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-1.mp3"),`

### `assets/audio/voc/nuit/toolbox/pocha-toolbox-2.mp3`

- `app/(tabs)/voc/nuit.tsx:41` — direct-path — `toolbox2: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:41` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-2.mp3"),`
- `app/(tabs)/voc/nuit.tsx:41` — indirect-filename-with-parent — `toolbox2: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-2.mp3"),`

### `assets/audio/voc/nuit/toolbox/pocha-toolbox-3.mp3`

- `app/(tabs)/voc/nuit.tsx:42` — direct-path — `toolbox3: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:42` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-3.mp3"),`
- `app/(tabs)/voc/nuit.tsx:42` — indirect-filename-with-parent — `toolbox3: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-3.mp3"),`

### `assets/audio/voc/pharmacie/pharmacie-bulle-1.mp3`

- `app/(tabs)/voc/sante.tsx:31` — direct-path — `message1: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:31` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:31` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-1.mp3"),`

### `assets/audio/voc/pharmacie/pharmacie-bulle-2.mp3`

- `app/(tabs)/voc/sante.tsx:32` — direct-path — `message2: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:32` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:32` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-2.mp3"),`

### `assets/audio/voc/pharmacie/pharmacie-bulle-3.mp3`

- `app/(tabs)/voc/sante.tsx:33` — direct-path — `message3: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:33` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:33` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-3.mp3"),`

### `assets/audio/voc/pharmacie/pharmacie-bulle-4.mp3`

- `app/(tabs)/voc/sante.tsx:34` — direct-path — `message4: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:34` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:34` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-4.mp3"),`

### `assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-1.mp3`

- `app/(tabs)/voc/sante.tsx:35` — direct-path — `toolbox1: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:35` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:35` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-1.mp3"),`

### `assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-2.mp3`

- `app/(tabs)/voc/sante.tsx:36` — direct-path — `toolbox2: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:36` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:36` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-2.mp3"),`

### `assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-3.mp3`

- `app/(tabs)/voc/sante.tsx:37` — direct-path — `toolbox3: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:37` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:37` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-3.mp3"),`

### `assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-4.mp3`

- `app/(tabs)/voc/sante.tsx:38` — direct-path — `toolbox4: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:38` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:38` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-4.mp3"),`

### `assets/audio/voc/pocha/pocha-bulle-1.mp3`

- `app/(tabs)/voc/kdrama.tsx:56` — direct-path — `message1: require("../../../assets/audio/voc/pocha/pocha-bulle-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:56` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/pocha/pocha-bulle-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:56` — indirect-filename-with-parent — `message1: require("../../../assets/audio/voc/pocha/pocha-bulle-1.mp3"),`

### `assets/audio/voc/pocha/pocha-bulle-2.mp3`

- `app/(tabs)/voc/kdrama.tsx:57` — direct-path — `message2: require("../../../assets/audio/voc/pocha/pocha-bulle-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:57` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/pocha/pocha-bulle-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:57` — indirect-filename-with-parent — `message2: require("../../../assets/audio/voc/pocha/pocha-bulle-2.mp3"),`

### `assets/audio/voc/pocha/pocha-bulle-3.mp3`

- `app/(tabs)/voc/kdrama.tsx:58` — direct-path — `message3: require("../../../assets/audio/voc/pocha/pocha-bulle-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:58` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/pocha/pocha-bulle-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:58` — indirect-filename-with-parent — `message3: require("../../../assets/audio/voc/pocha/pocha-bulle-3.mp3"),`

### `assets/audio/voc/pocha/pocha-bulle-4.mp3`

- `app/(tabs)/voc/kdrama.tsx:59` — direct-path — `message4: require("../../../assets/audio/voc/pocha/pocha-bulle-4.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:59` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/pocha/pocha-bulle-4.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:59` — indirect-filename-with-parent — `message4: require("../../../assets/audio/voc/pocha/pocha-bulle-4.mp3"),`

### `assets/audio/voc/pocha/toolbox/pocha-toolbox-1.mp3`

- `app/(tabs)/voc/kdrama.tsx:60` — direct-path — `toolbox1: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:60` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:60` — indirect-filename-with-parent — `toolbox1: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-1.mp3"),`

### `assets/audio/voc/pocha/toolbox/pocha-toolbox-2.mp3`

- `app/(tabs)/voc/kdrama.tsx:61` — direct-path — `toolbox2: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:61` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:61` — indirect-filename-with-parent — `toolbox2: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-2.mp3"),`

### `assets/audio/voc/pocha/toolbox/pocha-toolbox-3.mp3`

- `app/(tabs)/voc/kdrama.tsx:62` — direct-path — `toolbox3: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:62` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:62` — indirect-filename-with-parent — `toolbox3: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-3.mp3"),`

### `assets/audio/voc/Politesse/politesse-bulle-1.mp3`

- `app/(tabs)/voc/basics.tsx:75` — direct-path — `message1: require("../../../assets/audio/voc/Politesse/politesse-bulle-1.mp3"),`
- `app/(tabs)/voc/basics.tsx:75` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Politesse/politesse-bulle-1.mp3"),`
- `app/(tabs)/voc/basics.tsx:75` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/Politesse/politesse-bulle-1.mp3"),`

### `assets/audio/voc/Politesse/politesse-bulle-2.mp3`

- `app/(tabs)/voc/basics.tsx:76` — direct-path — `message2: require("../../../assets/audio/voc/Politesse/politesse-bulle-2.mp3"),`
- `app/(tabs)/voc/basics.tsx:76` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Politesse/politesse-bulle-2.mp3"),`
- `app/(tabs)/voc/basics.tsx:76` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/Politesse/politesse-bulle-2.mp3"),`

### `assets/audio/voc/Politesse/politesse-bulle-3.mp3`

- `app/(tabs)/voc/basics.tsx:77` — direct-path — `message3: require("../../../assets/audio/voc/Politesse/politesse-bulle-3.mp3"),`
- `app/(tabs)/voc/basics.tsx:77` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Politesse/politesse-bulle-3.mp3"),`
- `app/(tabs)/voc/basics.tsx:77` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/Politesse/politesse-bulle-3.mp3"),`

### `assets/audio/voc/Politesse/politesse-bulle-4.mp3`

- `app/(tabs)/voc/basics.tsx:78` — direct-path — `message4: require("../../../assets/audio/voc/Politesse/politesse-bulle-4.mp3"),`
- `app/(tabs)/voc/basics.tsx:78` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Politesse/politesse-bulle-4.mp3"),`
- `app/(tabs)/voc/basics.tsx:78` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/Politesse/politesse-bulle-4.mp3"),`

### `assets/audio/voc/Politesse/toolbox/excusez-moi.mp3`

- `app/(tabs)/voc/basics.tsx:80` — direct-path — `excusezMoi: require("../../../assets/audio/voc/Politesse/toolbox/excusez-moi.mp3"),`
- `app/(tabs)/voc/basics.tsx:80` — direct-resolved-literal — `excusezMoi: require("../../../assets/audio/voc/Politesse/toolbox/excusez-moi.mp3"),`
- `app/(tabs)/voc/basics.tsx:80` — indirect-unique-filename — `excusezMoi: require("../../../assets/audio/voc/Politesse/toolbox/excusez-moi.mp3"),`

### `assets/audio/voc/Politesse/toolbox/gomawoyo.mp3`

- `app/(tabs)/voc/basics.tsx:81` — direct-path — `gomawoyo: require("../../../assets/audio/voc/Politesse/toolbox/gomawoyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:81` — direct-resolved-literal — `gomawoyo: require("../../../assets/audio/voc/Politesse/toolbox/gomawoyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:81` — indirect-unique-filename — `gomawoyo: require("../../../assets/audio/voc/Politesse/toolbox/gomawoyo.mp3"),`

### `assets/audio/voc/Politesse/toolbox/jeogiyo.mp3`

- `app/(tabs)/voc/basics.tsx:82` — direct-path — `jeogiyo: require("../../../assets/audio/voc/Politesse/toolbox/jeogiyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:82` — direct-resolved-literal — `jeogiyo: require("../../../assets/audio/voc/Politesse/toolbox/jeogiyo.mp3"),`
- `app/(tabs)/voc/basics.tsx:82` — indirect-unique-filename — `jeogiyo: require("../../../assets/audio/voc/Politesse/toolbox/jeogiyo.mp3"),`

### `assets/audio/voc/Politesse/toolbox/merci.mp3`

- `app/(tabs)/voc/basics.tsx:83` — direct-path — `merci: require("../../../assets/audio/voc/Politesse/toolbox/merci.mp3"),`
- `app/(tabs)/voc/basics.tsx:83` — direct-resolved-literal — `merci: require("../../../assets/audio/voc/Politesse/toolbox/merci.mp3"),`
- `app/(tabs)/voc/basics.tsx:83` — indirect-unique-filename — `merci: require("../../../assets/audio/voc/Politesse/toolbox/merci.mp3"),`

### `assets/audio/voc/Politesse/toolbox/pas-grave.mp3`

- `app/(tabs)/voc/basics.tsx:86` — direct-path — `pasGrave: require("../../../assets/audio/voc/Politesse/toolbox/pas-grave.mp3"),`
- `app/(tabs)/voc/basics.tsx:86` — direct-resolved-literal — `pasGrave: require("../../../assets/audio/voc/Politesse/toolbox/pas-grave.mp3"),`
- `app/(tabs)/voc/basics.tsx:86` — indirect-unique-filename — `pasGrave: require("../../../assets/audio/voc/Politesse/toolbox/pas-grave.mp3"),`

### `assets/audio/voc/Politesse/toolbox/un-instant.mp3`

- `app/(tabs)/voc/basics.tsx:84` — direct-path — `unInstant: require("../../../assets/audio/voc/Politesse/toolbox/un-instant.mp3"),`
- `app/(tabs)/voc/basics.tsx:84` — direct-resolved-literal — `unInstant: require("../../../assets/audio/voc/Politesse/toolbox/un-instant.mp3"),`
- `app/(tabs)/voc/basics.tsx:84` — indirect-unique-filename — `unInstant: require("../../../assets/audio/voc/Politesse/toolbox/un-instant.mp3"),`

### `assets/audio/voc/Politesse/toolbox/voici.mp3`

- `app/(tabs)/voc/basics.tsx:85` — direct-path — `voici: require("../../../assets/audio/voc/Politesse/toolbox/voici.mp3"),`
- `app/(tabs)/voc/basics.tsx:85` — direct-resolved-literal — `voici: require("../../../assets/audio/voc/Politesse/toolbox/voici.mp3"),`
- `app/(tabs)/voc/basics.tsx:85` — indirect-unique-filename — `voici: require("../../../assets/audio/voc/Politesse/toolbox/voici.mp3"),`

### `assets/audio/voc/Rencontre/rencontre-bulle-1.mp3`

- `app/(tabs)/voc/basics.tsx:60` — direct-path — `message1: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-1.mp3"),`
- `app/(tabs)/voc/basics.tsx:60` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-1.mp3"),`
- `app/(tabs)/voc/basics.tsx:60` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-1.mp3"),`

### `assets/audio/voc/Rencontre/rencontre-bulle-2.mp3`

- `app/(tabs)/voc/basics.tsx:61` — direct-path — `message2: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-2.mp3"),`
- `app/(tabs)/voc/basics.tsx:61` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-2.mp3"),`
- `app/(tabs)/voc/basics.tsx:61` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-2.mp3"),`

### `assets/audio/voc/Rencontre/rencontre-bulle-3.mp3`

- `app/(tabs)/voc/basics.tsx:62` — direct-path — `message3: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-3.mp3"),`
- `app/(tabs)/voc/basics.tsx:62` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-3.mp3"),`
- `app/(tabs)/voc/basics.tsx:62` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-3.mp3"),`

### `assets/audio/voc/Rencontre/rencontre-bulle-4.mp3`

- `app/(tabs)/voc/basics.tsx:63` — direct-path — `message4: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-4.mp3"),`
- `app/(tabs)/voc/basics.tsx:63` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-4.mp3"),`
- `app/(tabs)/voc/basics.tsx:63` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-4.mp3"),`

### `assets/audio/voc/Rencontre/toolbox/bonjour.mp3`

- `app/(tabs)/voc/basics.tsx:65` — direct-path — `bonjour: require("../../../assets/audio/voc/Rencontre/toolbox/bonjour.mp3"),`
- `app/(tabs)/voc/basics.tsx:65` — direct-resolved-literal — `bonjour: require("../../../assets/audio/voc/Rencontre/toolbox/bonjour.mp3"),`
- `app/(tabs)/voc/basics.tsx:65` — indirect-unique-filename — `bonjour: require("../../../assets/audio/voc/Rencontre/toolbox/bonjour.mp3"),`

### `assets/audio/voc/Rencontre/toolbox/enchante-rencontre.mp3`

- `app/(tabs)/voc/basics.tsx:66` — direct-path — `enchanteRencontre: require("../../../assets/audio/voc/Rencontre/toolbox/enchante-rencontre.mp3"),`
- `app/(tabs)/voc/basics.tsx:66` — direct-resolved-literal — `enchanteRencontre: require("../../../assets/audio/voc/Rencontre/toolbox/enchante-rencontre.mp3"),`
- `app/(tabs)/voc/basics.tsx:66` — indirect-unique-filename — `enchanteRencontre: require("../../../assets/audio/voc/Rencontre/toolbox/enchante-rencontre.mp3"),`

### `assets/audio/voc/Rencontre/toolbox/je-compte-sur-vous.mp3`

- `app/(tabs)/voc/basics.tsx:71` — direct-path — `jeCompteSurVous: require("../../../assets/audio/voc/Rencontre/toolbox/je-compte-sur-vous.mp3"),`
- `app/(tabs)/voc/basics.tsx:71` — direct-resolved-literal — `jeCompteSurVous: require("../../../assets/audio/voc/Rencontre/toolbox/je-compte-sur-vous.mp3"),`
- `app/(tabs)/voc/basics.tsx:71` — indirect-unique-filename — `jeCompteSurVous: require("../../../assets/audio/voc/Rencontre/toolbox/je-compte-sur-vous.mp3"),`

### `assets/audio/voc/Rencontre/toolbox/je-mappelle.mp3`

- `app/(tabs)/voc/basics.tsx:67` — direct-path — `jeMappelle: require("../../../assets/audio/voc/Rencontre/toolbox/je-mappelle.mp3"),`
- `app/(tabs)/voc/basics.tsx:67` — direct-resolved-literal — `jeMappelle: require("../../../assets/audio/voc/Rencontre/toolbox/je-mappelle.mp3"),`
- `app/(tabs)/voc/basics.tsx:67` — indirect-unique-filename — `jeMappelle: require("../../../assets/audio/voc/Rencontre/toolbox/je-mappelle.mp3"),`

### `assets/audio/voc/Rencontre/toolbox/je-suis-francais.mp3`

- `app/(tabs)/voc/basics.tsx:68` — direct-path — `jeSuisFrancais: require("../../../assets/audio/voc/Rencontre/toolbox/je-suis-francais.mp3"),`
- `app/(tabs)/voc/basics.tsx:68` — direct-resolved-literal — `jeSuisFrancais: require("../../../assets/audio/voc/Rencontre/toolbox/je-suis-francais.mp3"),`
- `app/(tabs)/voc/basics.tsx:68` — indirect-unique-filename — `jeSuisFrancais: require("../../../assets/audio/voc/Rencontre/toolbox/je-suis-francais.mp3"),`

### `assets/audio/voc/Rencontre/toolbox/ravi-de-te-rencontrer.mp3`

- `app/(tabs)/voc/basics.tsx:69` — direct-path — `raviDeTeRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-te-rencontrer.mp3"),`
- `app/(tabs)/voc/basics.tsx:69` — direct-resolved-literal — `raviDeTeRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-te-rencontrer.mp3"),`
- `app/(tabs)/voc/basics.tsx:69` — indirect-unique-filename — `raviDeTeRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-te-rencontrer.mp3"),`

### `assets/audio/voc/Rencontre/toolbox/ravi-de-vous-rencontrer.mp3`

- `app/(tabs)/voc/basics.tsx:70` — direct-path — `raviDeVousRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-vous-rencontrer.mp3"),`
- `app/(tabs)/voc/basics.tsx:70` — direct-resolved-literal — `raviDeVousRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-vous-rencontrer.mp3"),`
- `app/(tabs)/voc/basics.tsx:70` — indirect-unique-filename — `raviDeVousRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-vous-rencontrer.mp3"),`

### `assets/audio/voc/reunion/reunion-bulle-1.mp3`

- `app/(tabs)/voc/work.tsx:33` — direct-path — `message1: require("../../../assets/audio/voc/reunion/reunion-bulle-1.mp3"),`
- `app/(tabs)/voc/work.tsx:33` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/reunion/reunion-bulle-1.mp3"),`
- `app/(tabs)/voc/work.tsx:33` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/reunion/reunion-bulle-1.mp3"),`

### `assets/audio/voc/reunion/reunion-bulle-2.mp3`

- `app/(tabs)/voc/work.tsx:34` — direct-path — `message2: require("../../../assets/audio/voc/reunion/reunion-bulle-2.mp3"),`
- `app/(tabs)/voc/work.tsx:34` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/reunion/reunion-bulle-2.mp3"),`
- `app/(tabs)/voc/work.tsx:34` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/reunion/reunion-bulle-2.mp3"),`

### `assets/audio/voc/reunion/reunion-bulle-3.mp3`

- `app/(tabs)/voc/work.tsx:35` — direct-path — `message3: require("../../../assets/audio/voc/reunion/reunion-bulle-3.mp3"),`
- `app/(tabs)/voc/work.tsx:35` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/reunion/reunion-bulle-3.mp3"),`
- `app/(tabs)/voc/work.tsx:35` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/reunion/reunion-bulle-3.mp3"),`

### `assets/audio/voc/reunion/reunion-bulle-4.mp3`

- `app/(tabs)/voc/work.tsx:36` — direct-path — `message4: require("../../../assets/audio/voc/reunion/reunion-bulle-4.mp3"),`
- `app/(tabs)/voc/work.tsx:36` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/reunion/reunion-bulle-4.mp3"),`
- `app/(tabs)/voc/work.tsx:36` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/reunion/reunion-bulle-4.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-1.mp3`

- `app/(tabs)/voc/work.tsx:37` — direct-path — `toolbox1: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-1.mp3"),`
- `app/(tabs)/voc/work.tsx:37` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-1.mp3"),`
- `app/(tabs)/voc/work.tsx:37` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-1.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-2.mp3`

- `app/(tabs)/voc/work.tsx:38` — direct-path — `toolbox2: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-2.mp3"),`
- `app/(tabs)/voc/work.tsx:38` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-2.mp3"),`
- `app/(tabs)/voc/work.tsx:38` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-2.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-3.mp3`

- `app/(tabs)/voc/work.tsx:39` — direct-path — `toolbox3: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-3.mp3"),`
- `app/(tabs)/voc/work.tsx:39` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-3.mp3"),`
- `app/(tabs)/voc/work.tsx:39` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-3.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-4.mp3`

- `app/(tabs)/voc/work.tsx:40` — direct-path — `toolbox4: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-4.mp3"),`
- `app/(tabs)/voc/work.tsx:40` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-4.mp3"),`
- `app/(tabs)/voc/work.tsx:40` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-4.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-5.mp3`

- `app/(tabs)/voc/work.tsx:41` — direct-path — `toolbox5: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-5.mp3"),`
- `app/(tabs)/voc/work.tsx:41` — direct-resolved-literal — `toolbox5: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-5.mp3"),`
- `app/(tabs)/voc/work.tsx:41` — indirect-unique-filename — `toolbox5: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-5.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-6.mp3`

- `app/(tabs)/voc/work.tsx:42` — direct-path — `toolbox6: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-6.mp3"),`
- `app/(tabs)/voc/work.tsx:42` — direct-resolved-literal — `toolbox6: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-6.mp3"),`
- `app/(tabs)/voc/work.tsx:42` — indirect-unique-filename — `toolbox6: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-6.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-7.mp3`

- `app/(tabs)/voc/work.tsx:43` — direct-path — `toolbox7: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-7.mp3"),`
- `app/(tabs)/voc/work.tsx:43` — direct-resolved-literal — `toolbox7: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-7.mp3"),`
- `app/(tabs)/voc/work.tsx:43` — indirect-unique-filename — `toolbox7: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-7.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-8.mp3`

- `app/(tabs)/voc/work.tsx:44` — direct-path — `toolbox8: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-8.mp3"),`
- `app/(tabs)/voc/work.tsx:44` — direct-resolved-literal — `toolbox8: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-8.mp3"),`
- `app/(tabs)/voc/work.tsx:44` — indirect-unique-filename — `toolbox8: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-8.mp3"),`

### `assets/audio/voc/reunion/toolbox/reunion-toolbox-9.mp3`

- `app/(tabs)/voc/work.tsx:45` — direct-path — `toolbox9: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-9.mp3"),`
- `app/(tabs)/voc/work.tsx:45` — direct-resolved-literal — `toolbox9: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-9.mp3"),`
- `app/(tabs)/voc/work.tsx:45` — indirect-unique-filename — `toolbox9: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-9.mp3"),`

### `assets/audio/voc/romance/confession-bulle-1.mp3`

- `app/(tabs)/voc/kdrama.tsx:36` — direct-path — `message1: require("../../../assets/audio/voc/romance/confession-bulle-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:36` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/romance/confession-bulle-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:36` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/romance/confession-bulle-1.mp3"),`

### `assets/audio/voc/romance/confession-bulle-2.mp3`

- `app/(tabs)/voc/kdrama.tsx:37` — direct-path — `message2: require("../../../assets/audio/voc/romance/confession-bulle-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:37` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/romance/confession-bulle-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:37` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/romance/confession-bulle-2.mp3"),`

### `assets/audio/voc/romance/confession-bulle-3.mp3`

- `app/(tabs)/voc/kdrama.tsx:38` — direct-path — `message3: require("../../../assets/audio/voc/romance/confession-bulle-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:38` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/romance/confession-bulle-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:38` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/romance/confession-bulle-3.mp3"),`

### `assets/audio/voc/romance/confession-bulle-4.mp3`

- `app/(tabs)/voc/kdrama.tsx:39` — direct-path — `message4: require("../../../assets/audio/voc/romance/confession-bulle-4.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:39` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/romance/confession-bulle-4.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:39` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/romance/confession-bulle-4.mp3"),`

### `assets/audio/voc/romance/toolbox/confession-toolbox-1.mp3`

- `app/(tabs)/voc/kdrama.tsx:40` — direct-path — `toolbox1: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:40` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:40` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-1.mp3"),`

### `assets/audio/voc/romance/toolbox/confession-toolbox-2.mp3`

- `app/(tabs)/voc/kdrama.tsx:41` — direct-path — `toolbox2: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:41` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:41` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-2.mp3"),`

### `assets/audio/voc/romance/toolbox/confession-toolbox-3.mp3`

- `app/(tabs)/voc/kdrama.tsx:42` — direct-path — `toolbox3: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:42` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:42` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-3.mp3"),`

### `assets/audio/voc/sogaeting/sogaeting-bulle-1.mp3`

- `app/(tabs)/voc/romance.tsx:36` — direct-path — `message1: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:36` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:36` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-1.mp3"),`

### `assets/audio/voc/sogaeting/sogaeting-bulle-2.mp3`

- `app/(tabs)/voc/romance.tsx:37` — direct-path — `message2: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:37` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:37` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-2.mp3"),`

### `assets/audio/voc/sogaeting/sogaeting-bulle-3.mp3`

- `app/(tabs)/voc/romance.tsx:38` — direct-path — `message3: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:38` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:38` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-3.mp3"),`

### `assets/audio/voc/sogaeting/sogaeting-bulle-4.mp3`

- `app/(tabs)/voc/romance.tsx:39` — direct-path — `message4: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-4.mp3"),`
- `app/(tabs)/voc/romance.tsx:39` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-4.mp3"),`
- `app/(tabs)/voc/romance.tsx:39` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-4.mp3"),`

### `assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-1.mp3`

- `app/(tabs)/voc/romance.tsx:40` — direct-path — `toolbox1: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:40` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-1.mp3"),`
- `app/(tabs)/voc/romance.tsx:40` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-1.mp3"),`

### `assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-2.mp3`

- `app/(tabs)/voc/romance.tsx:41` — direct-path — `toolbox2: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:41` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-2.mp3"),`
- `app/(tabs)/voc/romance.tsx:41` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-2.mp3"),`

### `assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-3.mp3`

- `app/(tabs)/voc/romance.tsx:42` — direct-path — `toolbox3: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:42` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-3.mp3"),`
- `app/(tabs)/voc/romance.tsx:42` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-3.mp3"),`

### `assets/audio/voc/Street/street-bulle-1.mp3`

- `app/(tabs)/voc/transport.tsx:98` — direct-path — `message1: require("../../../assets/audio/voc/Street/street-bulle-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:98` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Street/street-bulle-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:98` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/Street/street-bulle-1.mp3"),`

### `assets/audio/voc/Street/street-bulle-2.mp3`

- `app/(tabs)/voc/transport.tsx:99` — direct-path — `message2: require("../../../assets/audio/voc/Street/street-bulle-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:99` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Street/street-bulle-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:99` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/Street/street-bulle-2.mp3"),`

### `assets/audio/voc/Street/street-bulle-3.mp3`

- `app/(tabs)/voc/transport.tsx:100` — direct-path — `message3: require("../../../assets/audio/voc/Street/street-bulle-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:100` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Street/street-bulle-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:100` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/Street/street-bulle-3.mp3"),`

### `assets/audio/voc/Street/street-bulle-4.mp3`

- `app/(tabs)/voc/transport.tsx:101` — direct-path — `message4: require("../../../assets/audio/voc/Street/street-bulle-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:101` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Street/street-bulle-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:101` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/Street/street-bulle-4.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-1.mp3`

- `app/(tabs)/voc/transport.tsx:102` — direct-path — `toolbox1: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:102` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:102` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-1.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-2.mp3`

- `app/(tabs)/voc/transport.tsx:103` — direct-path — `toolbox2: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:103` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:103` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-2.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-3.mp3`

- `app/(tabs)/voc/transport.tsx:104` — direct-path — `toolbox3: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:104` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:104` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-3.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-4.mp3`

- `app/(tabs)/voc/transport.tsx:105` — direct-path — `toolbox4: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:105` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:105` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-4.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-5.mp3`

- `app/(tabs)/voc/transport.tsx:106` — direct-path — `toolbox5: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-5.mp3"),`
- `app/(tabs)/voc/transport.tsx:106` — direct-resolved-literal — `toolbox5: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-5.mp3"),`
- `app/(tabs)/voc/transport.tsx:106` — indirect-unique-filename — `toolbox5: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-5.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-6.mp3`

- `app/(tabs)/voc/transport.tsx:107` — direct-path — `toolbox6: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-6.mp3"),`
- `app/(tabs)/voc/transport.tsx:107` — direct-resolved-literal — `toolbox6: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-6.mp3"),`
- `app/(tabs)/voc/transport.tsx:107` — indirect-unique-filename — `toolbox6: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-6.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-7.mp3`

- `app/(tabs)/voc/transport.tsx:108` — direct-path — `toolbox7: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-7.mp3"),`
- `app/(tabs)/voc/transport.tsx:108` — direct-resolved-literal — `toolbox7: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-7.mp3"),`
- `app/(tabs)/voc/transport.tsx:108` — indirect-unique-filename — `toolbox7: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-7.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-8.mp3`

- `app/(tabs)/voc/transport.tsx:109` — direct-path — `toolbox8: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-8.mp3"),`
- `app/(tabs)/voc/transport.tsx:109` — direct-resolved-literal — `toolbox8: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-8.mp3"),`
- `app/(tabs)/voc/transport.tsx:109` — indirect-unique-filename — `toolbox8: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-8.mp3"),`

### `assets/audio/voc/Street/toolbox/street-toolbox-9.mp3`

- `app/(tabs)/voc/transport.tsx:110` — direct-path — `toolbox9: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-9.mp3"),`
- `app/(tabs)/voc/transport.tsx:110` — direct-resolved-literal — `toolbox9: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-9.mp3"),`
- `app/(tabs)/voc/transport.tsx:110` — indirect-unique-filename — `toolbox9: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-9.mp3"),`

### `assets/audio/voc/StreetFood/streetfood-bulle-1.mp3`

- `app/(tabs)/voc/gastronomie.tsx:78` — direct-path — `message1: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:78` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:78` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-1.mp3"),`

### `assets/audio/voc/StreetFood/streetfood-bulle-2.mp3`

- `app/(tabs)/voc/gastronomie.tsx:79` — direct-path — `message2: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:79` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:79` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-2.mp3"),`

### `assets/audio/voc/StreetFood/streetfood-bulle-3.mp3`

- `app/(tabs)/voc/gastronomie.tsx:80` — direct-path — `message3: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:80` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:80` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-3.mp3"),`

### `assets/audio/voc/StreetFood/streetfood-bulle-4.mp3`

- `app/(tabs)/voc/gastronomie.tsx:81` — direct-path — `message4: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:81` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:81` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-4.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-1.mp3`

- `app/(tabs)/voc/gastronomie.tsx:83` — direct-path — `epice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:83` — direct-resolved-literal — `epice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-1.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:83` — indirect-unique-filename — `epice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-1.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-2.mp3`

- `app/(tabs)/voc/gastronomie.tsx:84` — direct-path — `pasEpice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:84` — direct-resolved-literal — `pasEpice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-2.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:84` — indirect-unique-filename — `pasEpice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-2.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-3.mp3`

- `app/(tabs)/voc/gastronomie.tsx:85` — direct-path — `cestCombien: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:85` — direct-resolved-literal — `cestCombien: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-3.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:85` — indirect-unique-filename — `cestCombien: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-3.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-4.mp3`

- `app/(tabs)/voc/gastronomie.tsx:86` — direct-path — `unSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:86` — direct-resolved-literal — `unSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-4.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:86` — indirect-unique-filename — `unSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-4.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-5.mp3`

- `app/(tabs)/voc/gastronomie.tsx:87` — direct-path — `tteokbokki: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-5.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:87` — direct-resolved-literal — `tteokbokki: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-5.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:87` — indirect-unique-filename — `tteokbokki: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-5.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-6.mp3`

- `app/(tabs)/voc/gastronomie.tsx:88` — direct-path — `eomuk: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-6.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:88` — direct-resolved-literal — `eomuk: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-6.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:88` — indirect-unique-filename — `eomuk: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-6.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-7.mp3`

- `app/(tabs)/voc/gastronomie.tsx:89` — direct-path — `hotteok: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-7.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:89` — direct-resolved-literal — `hotteok: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-7.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:89` — indirect-unique-filename — `hotteok: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-7.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-8.mp3`

- `app/(tabs)/voc/gastronomie.tsx:90` — direct-path — `aEmporter: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-8.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:90` — direct-resolved-literal — `aEmporter: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-8.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:90` — indirect-unique-filename — `aEmporter: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-8.mp3"),`

### `assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-9.mp3`

- `app/(tabs)/voc/gastronomie.tsx:91` — direct-path — `eauSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-9.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:91` — direct-resolved-literal — `eauSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-9.mp3"),`
- `app/(tabs)/voc/gastronomie.tsx:91` — indirect-unique-filename — `eauSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-9.mp3"),`

### `assets/audio/voc/Taxi/taxi-bulle-1.mp3`

- `app/(tabs)/voc/transport.tsx:82` — direct-path — `message1: require("../../../assets/audio/voc/Taxi/taxi-bulle-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:82` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Taxi/taxi-bulle-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:82` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/Taxi/taxi-bulle-1.mp3"),`

### `assets/audio/voc/Taxi/taxi-bulle-2.mp3`

- `app/(tabs)/voc/transport.tsx:83` — direct-path — `message2: require("../../../assets/audio/voc/Taxi/taxi-bulle-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:83` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Taxi/taxi-bulle-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:83` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/Taxi/taxi-bulle-2.mp3"),`

### `assets/audio/voc/Taxi/taxi-bulle-3.mp3`

- `app/(tabs)/voc/transport.tsx:84` — direct-path — `message3: require("../../../assets/audio/voc/Taxi/taxi-bulle-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:84` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Taxi/taxi-bulle-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:84` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/Taxi/taxi-bulle-3.mp3"),`

### `assets/audio/voc/Taxi/taxi-bulle-4.mp3`

- `app/(tabs)/voc/transport.tsx:85` — direct-path — `message4: require("../../../assets/audio/voc/Taxi/taxi-bulle-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:85` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Taxi/taxi-bulle-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:85` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/Taxi/taxi-bulle-4.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-1.mp3`

- `app/(tabs)/voc/transport.tsx:86` — direct-path — `toolbox1: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:86` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-1.mp3"),`
- `app/(tabs)/voc/transport.tsx:86` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-1.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-2.mp3`

- `app/(tabs)/voc/transport.tsx:87` — direct-path — `toolbox2: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:87` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-2.mp3"),`
- `app/(tabs)/voc/transport.tsx:87` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-2.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-3.mp3`

- `app/(tabs)/voc/transport.tsx:88` — direct-path — `toolbox3: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:88` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-3.mp3"),`
- `app/(tabs)/voc/transport.tsx:88` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-3.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-4.mp3`

- `app/(tabs)/voc/transport.tsx:89` — direct-path — `toolbox4: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:89` — direct-resolved-literal — `toolbox4: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-4.mp3"),`
- `app/(tabs)/voc/transport.tsx:89` — indirect-unique-filename — `toolbox4: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-4.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-5.mp3`

- `app/(tabs)/voc/transport.tsx:90` — direct-path — `toolbox5: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-5.mp3"),`
- `app/(tabs)/voc/transport.tsx:90` — direct-resolved-literal — `toolbox5: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-5.mp3"),`
- `app/(tabs)/voc/transport.tsx:90` — indirect-unique-filename — `toolbox5: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-5.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-6.mp3`

- `app/(tabs)/voc/transport.tsx:91` — direct-path — `toolbox6: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-6.mp3"),`
- `app/(tabs)/voc/transport.tsx:91` — direct-resolved-literal — `toolbox6: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-6.mp3"),`
- `app/(tabs)/voc/transport.tsx:91` — indirect-unique-filename — `toolbox6: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-6.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-7.mp3`

- `app/(tabs)/voc/transport.tsx:92` — direct-path — `toolbox7: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-7.mp3"),`
- `app/(tabs)/voc/transport.tsx:92` — direct-resolved-literal — `toolbox7: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-7.mp3"),`
- `app/(tabs)/voc/transport.tsx:92` — indirect-unique-filename — `toolbox7: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-7.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-8.mp3`

- `app/(tabs)/voc/transport.tsx:93` — direct-path — `toolbox8: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-8.mp3"),`
- `app/(tabs)/voc/transport.tsx:93` — direct-resolved-literal — `toolbox8: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-8.mp3"),`
- `app/(tabs)/voc/transport.tsx:93` — indirect-unique-filename — `toolbox8: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-8.mp3"),`

### `assets/audio/voc/Taxi/toolbox/taxi-toolbox-9.mp3`

- `app/(tabs)/voc/transport.tsx:94` — direct-path — `toolbox9: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-9.mp3"),`
- `app/(tabs)/voc/transport.tsx:94` — direct-resolved-literal — `toolbox9: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-9.mp3"),`
- `app/(tabs)/voc/transport.tsx:94` — indirect-unique-filename — `toolbox9: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-9.mp3"),`

### `assets/audio/voc/Tension/tension-bulle-1.mp3`

- `app/(tabs)/voc/kdrama.tsx:46` — direct-path — `message1: require("../../../assets/audio/voc/Tension/tension-bulle-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:46` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/Tension/tension-bulle-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:46` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/Tension/tension-bulle-1.mp3"),`

### `assets/audio/voc/Tension/tension-bulle-2.mp3`

- `app/(tabs)/voc/kdrama.tsx:47` — direct-path — `message2: require("../../../assets/audio/voc/Tension/tension-bulle-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:47` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/Tension/tension-bulle-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:47` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/Tension/tension-bulle-2.mp3"),`

### `assets/audio/voc/Tension/tension-bulle-3.mp3`

- `app/(tabs)/voc/kdrama.tsx:48` — direct-path — `message3: require("../../../assets/audio/voc/Tension/tension-bulle-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:48` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/Tension/tension-bulle-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:48` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/Tension/tension-bulle-3.mp3"),`

### `assets/audio/voc/Tension/tension-bulle-4.mp3`

- `app/(tabs)/voc/kdrama.tsx:49` — direct-path — `message4: require("../../../assets/audio/voc/Tension/tension-bulle-4.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:49` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/Tension/tension-bulle-4.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:49` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/Tension/tension-bulle-4.mp3"),`

### `assets/audio/voc/Tension/toolbox/tension-toolbox-1.mp3`

- `app/(tabs)/voc/kdrama.tsx:50` — direct-path — `toolbox1: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:50` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-1.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:50` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-1.mp3"),`

### `assets/audio/voc/Tension/toolbox/tension-toolbox-2.mp3`

- `app/(tabs)/voc/kdrama.tsx:51` — direct-path — `toolbox2: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:51` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-2.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:51` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-2.mp3"),`

### `assets/audio/voc/Tension/toolbox/tension-toolbox-3.mp3`

- `app/(tabs)/voc/kdrama.tsx:52` — direct-path — `toolbox3: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:52` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-3.mp3"),`
- `app/(tabs)/voc/kdrama.tsx:52` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-3.mp3"),`

### `assets/audio/voc/urgence/toolbox/urgence-toolbox-1.mp3`

- `app/(tabs)/voc/sante.tsx:56` — direct-path — `toolbox1: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:56` — direct-resolved-literal — `toolbox1: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:56` — indirect-unique-filename — `toolbox1: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-1.mp3"),`

### `assets/audio/voc/urgence/toolbox/urgence-toolbox-2.mp3`

- `app/(tabs)/voc/sante.tsx:57` — direct-path — `toolbox2: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:57` — direct-resolved-literal — `toolbox2: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:57` — indirect-unique-filename — `toolbox2: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-2.mp3"),`

### `assets/audio/voc/urgence/toolbox/urgence-toolbox-3.mp3`

- `app/(tabs)/voc/sante.tsx:58` — direct-path — `toolbox3: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:58` — direct-resolved-literal — `toolbox3: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:58` — indirect-unique-filename — `toolbox3: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-3.mp3"),`

### `assets/audio/voc/urgence/urgence-bulle-1.mp3`

- `app/(tabs)/voc/sante.tsx:52` — direct-path — `message1: require("../../../assets/audio/voc/urgence/urgence-bulle-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:52` — direct-resolved-literal — `message1: require("../../../assets/audio/voc/urgence/urgence-bulle-1.mp3"),`
- `app/(tabs)/voc/sante.tsx:52` — indirect-unique-filename — `message1: require("../../../assets/audio/voc/urgence/urgence-bulle-1.mp3"),`

### `assets/audio/voc/urgence/urgence-bulle-2.mp3`

- `app/(tabs)/voc/sante.tsx:53` — direct-path — `message2: require("../../../assets/audio/voc/urgence/urgence-bulle-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:53` — direct-resolved-literal — `message2: require("../../../assets/audio/voc/urgence/urgence-bulle-2.mp3"),`
- `app/(tabs)/voc/sante.tsx:53` — indirect-unique-filename — `message2: require("../../../assets/audio/voc/urgence/urgence-bulle-2.mp3"),`

### `assets/audio/voc/urgence/urgence-bulle-3.mp3`

- `app/(tabs)/voc/sante.tsx:54` — direct-path — `message3: require("../../../assets/audio/voc/urgence/urgence-bulle-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:54` — direct-resolved-literal — `message3: require("../../../assets/audio/voc/urgence/urgence-bulle-3.mp3"),`
- `app/(tabs)/voc/sante.tsx:54` — indirect-unique-filename — `message3: require("../../../assets/audio/voc/urgence/urgence-bulle-3.mp3"),`

### `assets/audio/voc/urgence/urgence-bulle-4.mp3`

- `app/(tabs)/voc/sante.tsx:55` — direct-path — `message4: require("../../../assets/audio/voc/urgence/urgence-bulle-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:55` — direct-resolved-literal — `message4: require("../../../assets/audio/voc/urgence/urgence-bulle-4.mp3"),`
- `app/(tabs)/voc/sante.tsx:55` — indirect-unique-filename — `message4: require("../../../assets/audio/voc/urgence/urgence-bulle-4.mp3"),`

### `assets/hero.png`

- `app/onboarding.tsx:21` — indirect-filename-with-parent — `const HERO_IMAGE = require("../assets/images/hero.png");`

### `assets/images/2cha.png`

- `app/(tabs)/voc/nuit.tsx:234` — direct-path — `image: require("../../../assets/images/2cha.png"),`
- `app/(tabs)/voc/nuit.tsx:234` — direct-resolved-literal — `image: require("../../../assets/images/2cha.png"),`
- `app/(tabs)/voc/nuit.tsx:234` — indirect-unique-filename — `image: require("../../../assets/images/2cha.png"),`

### `assets/images/airport.png`

- `app/(tabs)/speak.tsx:35` — direct-path — `airport: require("../../assets/images/airport.png"),`
- `app/(tabs)/speak.tsx:35` — direct-resolved-literal — `airport: require("../../assets/images/airport.png"),`
- `app/(tabs)/speak.tsx:35` — indirect-unique-filename — `airport: require("../../assets/images/airport.png"),`
- `app/lesson/aeroportIA.tsx:99` — direct-path — `const airportBackground = require("../../assets/images/airport.png");`
- `app/lesson/aeroportIA.tsx:99` — direct-resolved-literal — `const airportBackground = require("../../assets/images/airport.png");`
- `app/lesson/aeroportIA.tsx:99` — indirect-unique-filename — `const airportBackground = require("../../assets/images/airport.png");`
- `app/lesson/aeroportMissions.tsx:27` — direct-path — `const airportBackground = require("../../assets/images/airport.png");`
- `app/lesson/aeroportMissions.tsx:27` — direct-resolved-literal — `const airportBackground = require("../../assets/images/airport.png");`
- `app/lesson/aeroportMissions.tsx:27` — indirect-unique-filename — `const airportBackground = require("../../assets/images/airport.png");`
- `app/lesson/airport.tsx:30` — direct-path — `const AIRPORT_IMAGE = require("../../assets/images/airport.png");`
- `app/lesson/airport.tsx:30` — direct-resolved-literal — `const AIRPORT_IMAGE = require("../../assets/images/airport.png");`
- `app/lesson/airport.tsx:30` — indirect-unique-filename — `const AIRPORT_IMAGE = require("../../assets/images/airport.png");`

### `assets/images/android-icon-background.png`

- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-path — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-resolved-literal — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — indirect-unique-filename — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `app.json:25` — configuration — `"backgroundImage": "./assets/images/android-icon-background.png",`
- `app.json:25` — direct-resolved-literal — `"backgroundImage": "./assets/images/android-icon-background.png",`
- `app.json:25` — indirect-unique-filename — `"backgroundImage": "./assets/images/android-icon-background.png",`

### `assets/images/android-icon-foreground.png`

- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-path — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-resolved-literal — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — indirect-unique-filename — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `app.json:24` — configuration — `"foregroundImage": "./assets/images/android-icon-foreground.png",`
- `app.json:24` — direct-resolved-literal — `"foregroundImage": "./assets/images/android-icon-foreground.png",`
- `app.json:24` — indirect-unique-filename — `"foregroundImage": "./assets/images/android-icon-foreground.png",`

### `assets/images/android-icon-monochrome.png`

- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-path — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-resolved-literal — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — indirect-unique-filename — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `app.json:26` — configuration — `"monochromeImage": "./assets/images/android-icon-monochrome.png"`
- `app.json:26` — direct-resolved-literal — `"monochromeImage": "./assets/images/android-icon-monochrome.png"`
- `app.json:26` — indirect-unique-filename — `"monochromeImage": "./assets/images/android-icon-monochrome.png"`

### `assets/images/bbq.png`

- `app/(tabs)/voc/gastronomie.tsx:117` — direct-path — `image: require("../../../assets/images/bbq.png"),`
- `app/(tabs)/voc/gastronomie.tsx:117` — direct-resolved-literal — `image: require("../../../assets/images/bbq.png"),`
- `app/(tabs)/voc/gastronomie.tsx:117` — indirect-unique-filename — `image: require("../../../assets/images/bbq.png"),`

### `assets/images/bg-bukchon-alley.png`

- `app/(tabs)/voc/transport.tsx:62` — direct-path — `const BUKCHON_BG = require("../../../assets/images/bg-bukchon-alley.png");`
- `app/(tabs)/voc/transport.tsx:62` — direct-resolved-literal — `const BUKCHON_BG = require("../../../assets/images/bg-bukchon-alley.png");`
- `app/(tabs)/voc/transport.tsx:62` — indirect-unique-filename — `const BUKCHON_BG = require("../../../assets/images/bg-bukchon-alley.png");`

### `assets/images/bg-metro-station.png`

- `app/(tabs)/voc/transport.tsx:60` — direct-path — `const METRO_BG = require("../../../assets/images/bg-metro-station.png");`
- `app/(tabs)/voc/transport.tsx:60` — direct-resolved-literal — `const METRO_BG = require("../../../assets/images/bg-metro-station.png");`
- `app/(tabs)/voc/transport.tsx:60` — indirect-unique-filename — `const METRO_BG = require("../../../assets/images/bg-metro-station.png");`

### `assets/images/bg-taxi-night.png`

- `app/(tabs)/voc/transport.tsx:61` — direct-path — `const TAXI_BG = require("../../../assets/images/bg-taxi-night.png");`
- `app/(tabs)/voc/transport.tsx:61` — direct-resolved-literal — `const TAXI_BG = require("../../../assets/images/bg-taxi-night.png");`
- `app/(tabs)/voc/transport.tsx:61` — indirect-unique-filename — `const TAXI_BG = require("../../../assets/images/bg-taxi-night.png");`

### `assets/images/businessinterview.png`

- `app/(tabs)/voc/work.tsx:315` — direct-path — `image: require("../../../assets/images/businessinterview.png"),`
- `app/(tabs)/voc/work.tsx:315` — direct-resolved-literal — `image: require("../../../assets/images/businessinterview.png"),`
- `app/(tabs)/voc/work.tsx:315` — indirect-unique-filename — `image: require("../../../assets/images/businessinterview.png"),`

### `assets/images/businessmail.png`

- `app/(tabs)/voc/work.tsx:201` — direct-path — `image: require("../../../assets/images/businessmail.png"),`
- `app/(tabs)/voc/work.tsx:201` — direct-resolved-literal — `image: require("../../../assets/images/businessmail.png"),`
- `app/(tabs)/voc/work.tsx:201` — indirect-unique-filename — `image: require("../../../assets/images/businessmail.png"),`

### `assets/images/businessmeeting.png`

- `app/(tabs)/voc/work.tsx:88` — direct-path — `image: require("../../../assets/images/businessmeeting.png"),`
- `app/(tabs)/voc/work.tsx:88` — direct-resolved-literal — `image: require("../../../assets/images/businessmeeting.png"),`
- `app/(tabs)/voc/work.tsx:88` — indirect-unique-filename — `image: require("../../../assets/images/businessmeeting.png"),`

### `assets/images/cafe.png`

- `app/lesson/cafe.tsx:30` — direct-path — `const CAFE_IMAGE = require("../../assets/images/cafe.png");`
- `app/lesson/cafe.tsx:30` — direct-resolved-literal — `const CAFE_IMAGE = require("../../assets/images/cafe.png");`
- `app/lesson/cafe.tsx:30` — indirect-unique-filename — `const CAFE_IMAGE = require("../../assets/images/cafe.png");`
- `app/lesson/cafeIA.tsx:88` — direct-path — `const cafeBackground = require("../../assets/images/cafe.png");`
- `app/lesson/cafeIA.tsx:88` — direct-resolved-literal — `const cafeBackground = require("../../assets/images/cafe.png");`
- `app/lesson/cafeIA.tsx:88` — indirect-unique-filename — `const cafeBackground = require("../../assets/images/cafe.png");`
- `app/lesson/cafeMissions.tsx:28` — direct-path — `const cafeBackground = require("../../assets/images/cafe.png");`
- `app/lesson/cafeMissions.tsx:28` — direct-resolved-literal — `const cafeBackground = require("../../assets/images/cafe.png");`
- `app/lesson/cafeMissions.tsx:28` — indirect-unique-filename — `const cafeBackground = require("../../assets/images/cafe.png");`
- `app/onboarding.tsx:22` — direct-path — `const CAFE_IMAGE = require("../assets/images/cafe.png");`
- `app/onboarding.tsx:22` — direct-resolved-literal — `const CAFE_IMAGE = require("../assets/images/cafe.png");`
- `app/onboarding.tsx:22` — indirect-unique-filename — `const CAFE_IMAGE = require("../assets/images/cafe.png");`

### `assets/images/cafeIA.png`

- `app/(tabs)/speak.tsx:32` — direct-path — `cafe: require("../../assets/images/cafeIA.png"),`
- `app/(tabs)/speak.tsx:32` — direct-resolved-literal — `cafe: require("../../assets/images/cafeIA.png"),`
- `app/(tabs)/speak.tsx:32` — indirect-unique-filename — `cafe: require("../../assets/images/cafeIA.png"),`

### `assets/images/classificateur.png`

- `app/(tabs)/classificateur/index.tsx:25` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/classificateur.png");`
- `app/(tabs)/classificateur/index.tsx:25` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/classificateur.png");`
- `app/(tabs)/classificateur/index.tsx:25` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/classificateur.png");`

### `assets/images/comptage.png`

- `app/(tabs)/comptage/index.tsx:23` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/comptage.png");`
- `app/(tabs)/comptage/index.tsx:23` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/comptage.png");`
- `app/(tabs)/comptage/index.tsx:23` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/comptage.png");`
- `components/comptage/CountingImmersionScreen.tsx:67` — direct-path — `const BACKGROUND_SOURCE = require("../../assets/images/comptage.png");`
- `components/comptage/CountingImmersionScreen.tsx:67` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../assets/images/comptage.png");`
- `components/comptage/CountingImmersionScreen.tsx:67` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../assets/images/comptage.png");`

### `assets/images/culturecafe.png`

- `app/(tabs)/voc/gastronomie.tsx:323` — direct-path — `image: require("../../../assets/images/culturecafe.png"),`
- `app/(tabs)/voc/gastronomie.tsx:323` — direct-resolved-literal — `image: require("../../../assets/images/culturecafe.png"),`
- `app/(tabs)/voc/gastronomie.tsx:323` — indirect-unique-filename — `image: require("../../../assets/images/culturecafe.png"),`

### `assets/images/favicon.png`

- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-path — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-resolved-literal — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — indirect-unique-filename — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `app.json:45` — configuration — `"favicon": "./assets/images/favicon.png"`
- `app.json:45` — direct-resolved-literal — `"favicon": "./assets/images/favicon.png"`
- `app.json:45` — indirect-unique-filename — `"favicon": "./assets/images/favicon.png"`

### `assets/images/han.png`

- `app/(tabs)/voc/romance.tsx:151` — direct-path — `image: require("../../../assets/images/han.png"),`
- `app/(tabs)/voc/romance.tsx:151` — direct-resolved-literal — `image: require("../../../assets/images/han.png"),`
- `app/(tabs)/voc/romance.tsx:151` — indirect-unique-filename — `image: require("../../../assets/images/han.png"),`

### `assets/images/hero.png`

- `app/onboarding.tsx:21` — direct-path — `const HERO_IMAGE = require("../assets/images/hero.png");`
- `app/onboarding.tsx:21` — direct-resolved-literal — `const HERO_IMAGE = require("../assets/images/hero.png");`
- `app/onboarding.tsx:21` — indirect-filename-with-parent — `const HERO_IMAGE = require("../assets/images/hero.png");`

### `assets/images/icon.png`

- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-path — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-resolved-literal — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — indirect-unique-filename — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `app.json:7` — configuration — `"icon": "./assets/images/icon.png",`
- `app.json:7` — direct-resolved-literal — `"icon": "./assets/images/icon.png",`
- `app.json:7` — indirect-unique-filename — `"icon": "./assets/images/icon.png",`

### `assets/images/love.png`

- `app/(tabs)/voc/kdrama.tsx:78` — direct-path — `image: require("../../../assets/images/love.png"),`
- `app/(tabs)/voc/kdrama.tsx:78` — direct-resolved-literal — `image: require("../../../assets/images/love.png"),`
- `app/(tabs)/voc/kdrama.tsx:78` — indirect-unique-filename — `image: require("../../../assets/images/love.png"),`

### `assets/images/meet.png`

- `app/(tabs)/voc/basics.tsx:109` — direct-path — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:109` — direct-resolved-literal — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:109` — indirect-unique-filename — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:198` — direct-path — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:198` — direct-resolved-literal — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:198` — indirect-unique-filename — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:287` — direct-path — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:287` — direct-resolved-literal — `image: require("../../../assets/images/meet.png"),`
- `app/(tabs)/voc/basics.tsx:287` — indirect-unique-filename — `image: require("../../../assets/images/meet.png"),`

### `assets/images/metro.png`

- `app/onboarding.tsx:23` — direct-path — `const METRO_IMAGE = require("../assets/images/metro.png");`
- `app/onboarding.tsx:23` — direct-resolved-literal — `const METRO_IMAGE = require("../assets/images/metro.png");`
- `app/onboarding.tsx:23` — indirect-unique-filename — `const METRO_IMAGE = require("../assets/images/metro.png");`

### `assets/images/metrobg.png`

- `app/lesson/metro.tsx:32` — direct-path — `const METRO_IMAGE = require("../../assets/images/metrobg.png");`
- `app/lesson/metro.tsx:32` — direct-resolved-literal — `const METRO_IMAGE = require("../../assets/images/metrobg.png");`
- `app/lesson/metro.tsx:32` — indirect-unique-filename — `const METRO_IMAGE = require("../../assets/images/metrobg.png");`
- `app/lesson/metroIA.tsx:75` — direct-path — `const metroBackground = require("../../assets/images/metrobg.png");`
- `app/lesson/metroIA.tsx:75` — direct-resolved-literal — `const metroBackground = require("../../assets/images/metrobg.png");`
- `app/lesson/metroIA.tsx:75` — indirect-unique-filename — `const metroBackground = require("../../assets/images/metrobg.png");`
- `app/lesson/metroMissions.tsx:27` — direct-path — `const metroBackground = require("../../assets/images/metrobg.png");`
- `app/lesson/metroMissions.tsx:27` — direct-resolved-literal — `const metroBackground = require("../../assets/images/metrobg.png");`
- `app/lesson/metroMissions.tsx:27` — indirect-unique-filename — `const metroBackground = require("../../assets/images/metrobg.png");`

### `assets/images/metroIA.png`

- `app/(tabs)/speak.tsx:33` — direct-path — `metro: require("../../assets/images/metroIA.png"),`
- `app/(tabs)/speak.tsx:33` — direct-resolved-literal — `metro: require("../../assets/images/metroIA.png"),`
- `app/(tabs)/speak.tsx:33` — indirect-unique-filename — `metro: require("../../assets/images/metroIA.png"),`

### `assets/images/noraebang.png`

- `app/(tabs)/voc/nuit.tsx:153` — direct-path — `image: require("../../../assets/images/noraebang.png"),`
- `app/(tabs)/voc/nuit.tsx:153` — direct-resolved-literal — `image: require("../../../assets/images/noraebang.png"),`
- `app/(tabs)/voc/nuit.tsx:153` — indirect-unique-filename — `image: require("../../../assets/images/noraebang.png"),`

### `assets/images/office.png`

- `app/(tabs)/voc/kdrama.tsx:162` — direct-path — `image: require("../../../assets/images/office.png"),`
- `app/(tabs)/voc/kdrama.tsx:162` — direct-resolved-literal — `image: require("../../../assets/images/office.png"),`
- `app/(tabs)/voc/kdrama.tsx:162` — indirect-unique-filename — `image: require("../../../assets/images/office.png"),`

### `assets/images/pocha.png`

- `app/(tabs)/voc/kdrama.tsx:247` — direct-path — `image: require("../../../assets/images/pocha.png"),`
- `app/(tabs)/voc/kdrama.tsx:247` — direct-resolved-literal — `image: require("../../../assets/images/pocha.png"),`
- `app/(tabs)/voc/kdrama.tsx:247` — indirect-unique-filename — `image: require("../../../assets/images/pocha.png"),`

### `assets/images/pocha2.png`

- `app/(tabs)/voc/nuit.tsx:73` — direct-path — `image: require("../../../assets/images/pocha2.png"),`
- `app/(tabs)/voc/nuit.tsx:73` — direct-resolved-literal — `image: require("../../../assets/images/pocha2.png"),`
- `app/(tabs)/voc/nuit.tsx:73` — indirect-unique-filename — `image: require("../../../assets/images/pocha2.png"),`

### `assets/images/restaurant.png`

- `app/lesson/restaurant.tsx:32` — direct-path — `const RESTAURANT_IMAGE = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurant.tsx:32` — direct-resolved-literal — `const RESTAURANT_IMAGE = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurant.tsx:32` — indirect-unique-filename — `const RESTAURANT_IMAGE = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurantIA.tsx:95` — direct-path — `const restaurantBackground = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurantIA.tsx:95` — direct-resolved-literal — `const restaurantBackground = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurantIA.tsx:95` — indirect-unique-filename — `const restaurantBackground = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurantMissions.tsx:27` — direct-path — `const restaurantBackground = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurantMissions.tsx:27` — direct-resolved-literal — `const restaurantBackground = require("../../assets/images/restaurant.png");`
- `app/lesson/restaurantMissions.tsx:27` — indirect-unique-filename — `const restaurantBackground = require("../../assets/images/restaurant.png");`
- `app/onboarding.tsx:24` — direct-path — `const RESTAURANT_IMAGE = require("../assets/images/restaurant.png");`
- `app/onboarding.tsx:24` — direct-resolved-literal — `const RESTAURANT_IMAGE = require("../assets/images/restaurant.png");`
- `app/onboarding.tsx:24` — indirect-unique-filename — `const RESTAURANT_IMAGE = require("../assets/images/restaurant.png");`

### `assets/images/restaurantIA.png`

- `app/(tabs)/speak.tsx:34` — direct-path — `restaurant: require("../../assets/images/restaurantIA.png"),`
- `app/(tabs)/speak.tsx:34` — direct-resolved-literal — `restaurant: require("../../assets/images/restaurantIA.png"),`
- `app/(tabs)/speak.tsx:34` — indirect-unique-filename — `restaurant: require("../../assets/images/restaurantIA.png"),`

### `assets/images/safety.png`

- `app/(tabs)/voc/sante.tsx:68` — direct-path — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:68` — direct-resolved-literal — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:68` — indirect-unique-filename — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:136` — direct-path — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:136` — direct-resolved-literal — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:136` — indirect-unique-filename — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:215` — direct-path — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:215` — direct-resolved-literal — `image: require("../../../assets/images/safety.png"),`
- `app/(tabs)/voc/sante.tsx:215` — indirect-unique-filename — `image: require("../../../assets/images/safety.png"),`

### `assets/images/seoul-hub-bg.jpg`

- `app/(tabs)/voc/emotion.tsx:21` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/emotion.tsx:21` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/emotion.tsx:21` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/famille.tsx:22` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/famille.tsx:22` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/famille.tsx:22` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/health.tsx:22` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/health.tsx:22` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/health.tsx:22` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/lieux.tsx:21` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/lieux.tsx:21` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/lieux.tsx:21` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/meteo.tsx:21` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/meteo.tsx:21` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/meteo.tsx:21` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/objets.tsx:22` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/objets.tsx:22` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/objets.tsx:22` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/voyage.tsx:22` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/voyage.tsx:22` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`
- `app/(tabs)/voc/voyage.tsx:22` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");`

### `assets/images/seoulhub.png`

- `app/(tabs)/index.tsx:27` — direct-path — `const BACKGROUND_SOURCE = require("../../assets/images/seoulhub.png");`
- `app/(tabs)/index.tsx:27` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../assets/images/seoulhub.png");`
- `app/(tabs)/index.tsx:27` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../assets/images/seoulhub.png");`
- `app/streak.tsx:37` — direct-path — `const BACKGROUND_SOURCE = require("../assets/images/seoulhub.png");`
- `app/streak.tsx:37` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../assets/images/seoulhub.png");`
- `app/streak.tsx:37` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../assets/images/seoulhub.png");`

### `assets/images/shopping.png`

- `app/(tabs)/speak.tsx:36` — direct-path — `shopping: require("../../assets/images/shopping.png"),`
- `app/(tabs)/speak.tsx:36` — direct-resolved-literal — `shopping: require("../../assets/images/shopping.png"),`
- `app/(tabs)/speak.tsx:36` — indirect-unique-filename — `shopping: require("../../assets/images/shopping.png"),`

### `assets/images/sogeting.png`

- `app/(tabs)/voc/romance.tsx:72` — direct-path — `image: require("../../../assets/images/sogeting.png"),`
- `app/(tabs)/voc/romance.tsx:72` — direct-resolved-literal — `image: require("../../../assets/images/sogeting.png"),`
- `app/(tabs)/voc/romance.tsx:72` — indirect-unique-filename — `image: require("../../../assets/images/sogeting.png"),`

### `assets/images/speak.png`

- `app/(tabs)/speak.tsx:23` — direct-path — `const BACKGROUND_SOURCE = require("../../assets/images/speak.png");`
- `app/(tabs)/speak.tsx:23` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../assets/images/speak.png");`
- `app/(tabs)/speak.tsx:23` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../assets/images/speak.png");`

### `assets/images/splash-icon.png`

- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-path — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — direct-resolved-literal — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `android/app/build/intermediates/assets/debug/mergeDebugAssets/app.config:1` — indirect-unique-filename — `{"name":"k-app","slug":"k-app","version":"1.0.0","orientation":"default","icon":"./assets/images/icon.png","scheme":"kapp","userInterfaceStyle":"automatic","assetBundlePatterns":["assets/**/*"],"ios":{"supportsTablet":true,"infoPlist":{"NSSpeechRecognitionUsageDescription":"Allow $(PRODUCT_NAME) to use speech recognition.","NSMicrophoneUsageDescription":"Allow $(PRODUCT_NAME) to use the microphone."},"bitcode":false},"android":{"adaptiveIcon":{"backgroundColor":"#E6F4FE","foregroundImage":"./assets/images/android-icon-foreground.png","backgroundImage":"./assets/images/android-icon-background.png","monochromeImage":"./assets/images/android-icon-monochrome.png"},"predictiveBackGestureEnabled":false,"permissions":["android.permission.RECORD_AUDIO","android.permission.MODIFY_AUDIO_SETTINGS","android.permission.FOREGROUND_SERVICE","android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.ACCESS_NETWORK_STATE","android.permission.CAMERA","android.permission.INTERNET","android.permission.SYSTEM_ALERT_WINDOW","android.permission.WAKE_LOCK","android.permission.BLUETOOTH"],"package":"com.arben60.kapp"},"web":{"output":"static","favicon":"./assets/images/favicon.png"},"plugins":["expo-router","expo-speech-recognition",["expo-splash-screen",{"image":"./assets/images/splash-icon.png","imageWidth":200,"resizeMode":"contain","backgroundColor":"#ffffff","dark":{"backgroundColor":"#000000"}}],"expo-font","expo-image","expo-web-browser","expo-video","expo-audio","expo-status-bar","@config-plugins/react-native-webrtc","expo-iap"],"experiments":{"typedRoutes":true,"reactCompiler":true},"extra":{"router":{},"eas":{"projectId":"c5a0f75b-8753-4b3b-be78-dcf5769d8344"}},"sdkVersion":"56.0.0","platforms":["ios","android","web"]}`
- `app.json:53` — configuration — `"image": "./assets/images/splash-icon.png",`
- `app.json:53` — direct-resolved-literal — `"image": "./assets/images/splash-icon.png",`
- `app.json:53` — indirect-unique-filename — `"image": "./assets/images/splash-icon.png",`

### `assets/images/streetfood.png`

- `app/(tabs)/voc/gastronomie.tsx:220` — direct-path — `image: require("../../../assets/images/streetfood.png"),`
- `app/(tabs)/voc/gastronomie.tsx:220` — direct-resolved-literal — `image: require("../../../assets/images/streetfood.png"),`
- `app/(tabs)/voc/gastronomie.tsx:220` — indirect-unique-filename — `image: require("../../../assets/images/streetfood.png"),`

### `assets/images/tower.png`

- `app/(tabs)/voc/romance.tsx:230` — direct-path — `image: require("../../../assets/images/tower.png"),`
- `app/(tabs)/voc/romance.tsx:230` — direct-resolved-literal — `image: require("../../../assets/images/tower.png"),`
- `app/(tabs)/voc/romance.tsx:230` — indirect-unique-filename — `image: require("../../../assets/images/tower.png"),`

### `assets/images/vocabulaire.png`

- `app/(tabs)/voc/index.tsx:24` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/vocabulaire.png");`
- `app/(tabs)/voc/index.tsx:24` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/vocabulaire.png");`
- `app/(tabs)/voc/index.tsx:24` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/vocabulaire.png");`

### `assets/images/vowelbasic.png`

- `app/(tabs)/grammar/[stageId].tsx:50` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/grammar/[stageId].tsx:50` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/grammar/[stageId].tsx:50` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/grammar/index.tsx:33` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/grammar/index.tsx:33` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/grammar/index.tsx:33` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/assessment.tsx:20` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/assessment.tsx:20` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/assessment.tsx:20` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/bridge.tsx:13` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/bridge.tsx:13` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/bridge.tsx:13` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/index.tsx:26` — direct-path — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/index.tsx:26` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `app/(tabs)/hangul/index.tsx:26` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");`
- `components/hangul/HangulLessonScreen.tsx:32` — direct-path — `const BACKGROUND_SOURCE = require("../../assets/images/vowelbasic.png");`
- `components/hangul/HangulLessonScreen.tsx:32` — direct-resolved-literal — `const BACKGROUND_SOURCE = require("../../assets/images/vowelbasic.png");`
- `components/hangul/HangulLessonScreen.tsx:32` — indirect-unique-filename — `const BACKGROUND_SOURCE = require("../../assets/images/vowelbasic.png");`

### `assets/immersion/convenience-night.png`

- `app/(tabs)/immersion.tsx:140` — direct-path — `imageSource={require("../../assets/immersion/convenience-night.png")}`
- `app/(tabs)/immersion.tsx:140` — direct-resolved-literal — `imageSource={require("../../assets/immersion/convenience-night.png")}`
- `app/(tabs)/immersion.tsx:140` — indirect-unique-filename — `imageSource={require("../../assets/immersion/convenience-night.png")}`

### `assets/immersion/gangnam.png`

- `app/(tabs)/immersion.tsx:149` — direct-path — `imageSource={require("../../assets/immersion/gangnam.png")}`
- `app/(tabs)/immersion.tsx:149` — direct-resolved-literal — `imageSource={require("../../assets/immersion/gangnam.png")}`
- `app/(tabs)/immersion.tsx:149` — indirect-unique-filename — `imageSource={require("../../assets/immersion/gangnam.png")}`
- `app/immersion/convenience-night.tsx:518` — direct-path — `source={require("../../assets/immersion/gangnam.png")}`
- `app/immersion/convenience-night.tsx:518` — direct-resolved-literal — `source={require("../../assets/immersion/gangnam.png")}`
- `app/immersion/convenience-night.tsx:518` — indirect-unique-filename — `source={require("../../assets/immersion/gangnam.png")}`
- `app/immersion/gangnam.tsx:6` — direct-path — `imageSource={require("../../assets/immersion/gangnam.png")}`
- `app/immersion/gangnam.tsx:6` — direct-resolved-literal — `imageSource={require("../../assets/immersion/gangnam.png")}`
- `app/immersion/gangnam.tsx:6` — indirect-unique-filename — `imageSource={require("../../assets/immersion/gangnam.png")}`

### `assets/immersion/myeongdong.png`

- `app/(tabs)/immersion.tsx:167` — direct-path — `imageSource={require("../../assets/immersion/myeongdong.png")}`
- `app/(tabs)/immersion.tsx:167` — direct-resolved-literal — `imageSource={require("../../assets/immersion/myeongdong.png")}`
- `app/(tabs)/immersion.tsx:167` — indirect-unique-filename — `imageSource={require("../../assets/immersion/myeongdong.png")}`
- `app/immersion/myeongdong.tsx:6` — direct-path — `imageSource={require("../../assets/immersion/myeongdong.png")}`
- `app/immersion/myeongdong.tsx:6` — direct-resolved-literal — `imageSource={require("../../assets/immersion/myeongdong.png")}`
- `app/immersion/myeongdong.tsx:6` — indirect-unique-filename — `imageSource={require("../../assets/immersion/myeongdong.png")}`

### `assets/immersion/seongsu.png`

- `app/(tabs)/immersion.tsx:158` — direct-path — `imageSource={require("../../assets/immersion/seongsu.png")}`
- `app/(tabs)/immersion.tsx:158` — direct-resolved-literal — `imageSource={require("../../assets/immersion/seongsu.png")}`
- `app/(tabs)/immersion.tsx:158` — indirect-unique-filename — `imageSource={require("../../assets/immersion/seongsu.png")}`
- `app/immersion/seongsu.tsx:6` — direct-path — `imageSource={require("../../assets/immersion/seongsu.png")}`
- `app/immersion/seongsu.tsx:6` — direct-resolved-literal — `imageSource={require("../../assets/immersion/seongsu.png")}`
- `app/immersion/seongsu.tsx:6` — indirect-unique-filename — `imageSource={require("../../assets/immersion/seongsu.png")}`

### `assets/immersion/social.png`

- `app/(tabs)/immersion.tsx:176` — direct-path — `imageSource={require("../../assets/immersion/social.png")}`
- `app/(tabs)/immersion.tsx:176` — direct-resolved-literal — `imageSource={require("../../assets/immersion/social.png")}`
- `app/(tabs)/immersion.tsx:176` — indirect-unique-filename — `imageSource={require("../../assets/immersion/social.png")}`
- `app/immersion/social.tsx:6` — direct-path — `imageSource={require("../../assets/immersion/social.png")}`
- `app/immersion/social.tsx:6` — direct-resolved-literal — `imageSource={require("../../assets/immersion/social.png")}`
- `app/immersion/social.tsx:6` — indirect-unique-filename — `imageSource={require("../../assets/immersion/social.png")}`

## 2. Médias certainement orphelins

### `assets/ai/cafe/followUp.mp4` (347 763 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/cafe/minji_base.png` (455 325 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/cafe/mouth_mid.png` (456 740 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/cafe/mouth_open.png` (456 534 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/cafe/pricePaimentChooseReal.mp4` (1 989 530 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/listen/cafe/cafe-situation-02.mp3` (16 749 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_intro_route_short.mp4` (3 980 535 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line4_direction_short.mp4` (4 336 382 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station_short.mp4` (3 889 994 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ambience/cafe.mp3` (0 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ambience/metro.mp3` (0 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/ambience/restaurant.mp3` (0 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/가.mp3` (46 328 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/나.mp3` (46 328 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/다.mp3` (48 000 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/라.mp3` (43 403 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/마.mp3` (46 328 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/바.mp3` (46 328 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/사.mp3` (46 328 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/아.mp3` (45 075 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/자.mp3` (44 239 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/차.mp3` (46 328 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/카.mp3` (47 164 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/타.mp3` (45 911 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/파.mp3` (46 328 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-basic/하.mp3` (43 403 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-tense/까.mp3` (47 164 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-tense/따.mp3` (45 911 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-tense/빠.mp3` (44 239 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-tense/싸.mp3` (49 254 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/hangul/consonants-tense/짜.mp3` (48 836 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/audio/listen/hiérarchie-bulle-2.mp3` (30 861 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/avatarIA.png` (2 173 237 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/back.png` (1 546 338 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/bg-speak.png` (2 111 918 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/bg-speak1.png` (2 650 541 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/bg.png` (1 972 547 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/bgtest.png` (2 643 192 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/cafebg.png` (2 220 996 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/class.png` (2 127 875 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/gyeongbokgung-palace.png` (11 878 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/hangul-bg.png` (1 789 561 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/minji.png` (455 325 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/partial-react-logo.png` (5 075 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/react-logo.png` (6 341 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/react-logo@2x.png` (14 225 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/react-logo@3x.png` (21 252 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/seoul-bg.png` (2 489 117 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/seoul-bg1.jpg` (242 756 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/seoul-bg1.png` (8 616 192 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/seoul-bg2.png.png` (2 599 579 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/seoulbg.png` (2 650 541 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/seoulbg1.jpg` (313 599 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/seoulhub.jpg` (200 286 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/titre.jpg` (237 518 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/titre.png` (2 250 283 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/images/titrepng.png` (770 069 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

### `assets/M1Yed.png` (14 068 octets)

- Recherches effectuées : chemin complet avec séparateurs Unix/Windows, littéraux relatifs résolus, nom de fichier seul, données/registres, configurations, scripts, sources natives et motifs de construction dynamique.
- Preuve : aucune occurrence directe ou indirecte dans les fichiers texte du projet ; aucun préfixe dynamique correspondant ; aucun homonyme ambigu mentionné ; aucune séquence numérotée partiellement utilisée nécessitant une conservation.

## 3. Médias à vérifier manuellement

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info_short.mp4`

- chemin construit dynamiquement depuis scripts/test-metro-speech.mjs:743 (new URL(`../assets/ai/metro/Hongik-to-Gangnam/${video}`, import.meta.url),)

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_intro_route_slow.mp4`

- chemin construit dynamiquement depuis scripts/test-metro-speech.mjs:743 (new URL(`../assets/ai/metro/Hongik-to-Gangnam/${video}`, import.meta.url),)

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction_short.mp4`

- chemin construit dynamiquement depuis scripts/test-metro-speech.mjs:743 (new URL(`../assets/ai/metro/Hongik-to-Gangnam/${video}`, import.meta.url),)

### `assets/ai/metro/Hongik-to-Gangnam/ia_repeat_trip_time_short.mp4`

- chemin construit dynamiquement depuis scripts/test-metro-speech.mjs:743 (new URL(`../assets/ai/metro/Hongik-to-Gangnam/${video}`, import.meta.url),)

### `assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-6.mp3`

- membre non référencé d’une séquence numérotée partiellement utilisée

### `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-2.mp3`

- membre non référencé d’une séquence numérotée partiellement utilisée

### `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-3.mp3`

- membre non référencé d’une séquence numérotée partiellement utilisée

### `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-4.mp3`

- membre non référencé d’une séquence numérotée partiellement utilisée

### `assets/audio/comptage/nombres de bases/anniversaire/toolbox/anniversaire-toolbox-5.mp3`

- membre non référencé d’une séquence numérotée partiellement utilisée

### `assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-6.mp3`

- membre non référencé d’une séquence numérotée partiellement utilisée
