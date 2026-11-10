import type { i18n } from "i18next";
import { immersionCopyId } from "../../data/localized/immersionRegistryCafe.ts";
import type { AppLocale } from "./config.ts";
import { appI18n } from "./instance.ts";
/** Café presentation copy, resolved only at render time. No dialogue or speech-engine mutation. */
export function resolveImmersionText(module: string, source: string, locale: AppLocale, instance: i18n = appI18n): string {
  if (locale === "fr") return source;
  const exact = (text: string): string | undefined => {
    const resolved = instance.getResource(locale, "immersion", "content." + immersionCopyId(module, text) + ".text");
    if (typeof resolved === "string" && resolved.trim()) return resolved;
    // Reuse common presentation strings already translated for Café, but only as a Métro fallback.
    if (module === "metro" || module === "restaurant") {
      const sharedModules = module === "restaurant" ? ["cafe", "metro"] : ["cafe"];
      for (const sharedModule of sharedModules) {
        const shared = instance.getResource(locale, "immersion", "content." + immersionCopyId(sharedModule, text) + ".text");
        if (typeof shared === "string" && shared.trim()) return shared;
      }
    }
    return undefined;
  };
  const direct = exact(source);
  if (direct) return direct;
  // Restaurant feedback is produced by the Korean-only intent engine.
  // Translate it *after* evaluation, keeping its Korean examples and decisions.
  if (module === "restaurant") {
    const ja = (value: string): string => {
      const key = value.trim();
      return exact(key) ?? exact(key + ".") ?? value;
    };
    const m1 = (re: RegExp) => source.match(re);
    let r: RegExpMatchArray | null;

    r = m1(/^(.*) — tu peux répondre : (.+)\.$/u);
    if (r) return resolveImmersionText(module, r[1] + ".", locale, instance) +
      " — 例えば " + r[2].split(" · ").map((p) => {
        const label = p.match(/^« (.+) »$/u);
        return label ? "「" + ja(label[1]) + "」" : ja(p);
      }).join("・") + " と答えられます。";

    r = m1(/^(.*) — phrase modèle : (.+)\.$/u);
    if (r) return resolveImmersionText(module, r[1] + ".", locale, instance) +
      " — お手本のフレーズ：" + r[2].replaceAll(" ou ", " または ") + "。";

    r = m1(/^Je t’ai compris malgré le mélange de langues\. Pour rester en coréen : (.+)\.$/u);
    if (r) return "複数の言語が混ざっていますが、意図は伝わりました。韓国語だけで言うなら「" + r[1] + "」です。";

    r = m1(/^Pour indiquer le moyen utilisé, « \(으\)로 » correspond ici à « avec\/par »\. Dis : « (.+?) 할게요\. »$/u);
    if (r) return "手段を表す助詞は「(으)로」です。「" + r[1] + " 할게요.」と言いましょう。";

    r = m1(/^Je t’ai compris, mais l’ordre des mots sonne inversé\. Garde le plat ou le choix avant la demande : « (.+?) »$/u);
    if (r) return "意図は伝わりますが、語順が逆になっています。料理名や選択を先に置いて、「" + r[1] + "」のように言いましょう。";

    r = m1(/^Le plat est clair\. Il manque seulement la quantité : « (.+?) »$/u);
    if (r) return "料理は分かりますが、数量がまだ指定されていません。「" + r[1] + "」と言いましょう。";

    r = m1(/^Je t’ai compris : la reconnaissance a probablement accroché sur un mot\. La phrase visée est « (.+?) »$/u);
    if (r) return "意図は伝わりますが、音声認識が一部の単語を聞き違えた可能性があります。お手本は「" + r[1] + "」です。";

    r = m1(/^Oui, le moyen de paiement est clair\. Une tournure plus naturelle ici est : « (.+?) »$/u);
    if (r) return "はい、支払い方法は伝わっています。この場面では「" + r[1] + "」と言うほうが自然です。";

    r = m1(/^Tu demandes bien l’accompagnement\. Ajoute « 더 » pour dire que tu en veux davantage : « (.+?) »$/u);
    if (r) return "おかずを頼んでいることは伝わっています。「もっと」を表す「더」を加えて、「" + r[1] + "」と言いましょう。";

    r = m1(/^Ta demande est claire\. Pour des portions de viande au restaurant, « 인분 » est le compteur naturel ; « (.+?) » ne convient pas ici\.$/u);
    if (r) return "注文の意図は伝わりますが、肉を人数分で注文するときは助数詞「인분」を使います。ここでは「" + r[1] + "」は適切ではありません。";

    r = m1(/^Ta demande est claire\. Pour ce plat, « (.+?) » est plus naturel que « (.+?) »\.$/u);
    if (r) return "注文の意図は伝わります。この料理には「" + r[2] + "」より「" + ja(r[1]) + "」が自然です。";

    r = m1(/^La quantité est comprise, mais il manque le compteur\. Pour des portions au restaurant, ajoute « 인분 » : « (.+?) »$/u);
    if (r) return "数量は伝わっていますが、助数詞が抜けています。人数分を注文するときは「인분」を付けて、「" + r[1] + "」と言いましょう。";

    r = m1(/^Ta phrase est correcte en coréen, mais la quantité ne correspond pas à la commande de cette scène\. Ici, il faut (\d+) portions? : « (.+?) »$/u);
    if (r) return "韓国語としては正しいですが、今回の注文で必要な数量と違います。ここでは" + r[1] + "人前なので「" + r[2] + "」と言いましょう。";

    r = m1(/^Ta phrase peut correspondre à plusieurs réponses\. (.+?) Garde une seule intention\.$/u);
    if (r) return "返答が複数の選択肢に当てはまる可能性があります。" + ja(r[1]) + " 伝えたいことを一つに絞りましょう。";

    r = m1(/^J’ai compris : tu veux (.+?)\. (.+)$/u);
    if (r) return "「" + ja(r[1]) + "」という意図は伝わりました。" + ja(r[2]);

    r = m1(/^Tu veux bien commander de la viande, mais on ne sait pas encore laquelle\. (.+)$/u);
    if (r) return "肉を注文したいことは伝わりますが、どの肉かまだ分かりません。" + ja(r[1]);

    const incompletePrefixes: Readonly<Record<string, string>> = {
      "Tu parles bien de la cuisson, mais on ne sait pas clairement qui doit s’en charger.": "焼き方について話していますが、誰が焼くかまだ分かりません。",
      "Tu veux ajouter un accompagnement, mais tu ne l’as pas identifié.": "おかずを追加したいことは伝わりますが、何を追加するかまだ分かりません。",
      "Tu demandes un goût standard, mais ce n’est pas assez précis pour distinguer les trois niveaux de piquant proposés.": "通常の味付けを希望していますが、ここで提示された３段階の辛さのどれか分かりません。",
      "Tu en veux davantage, mais tu n’as pas précisé quoi.": "追加したいことは伝わりますが、何を追加するかまだ分かりません。",
      "Tu veux payer, mais tu n’as pas indiqué le moyen de paiement.": "支払いたいことは伝わりますが、支払い方法がまだ分かりません。",
      "Tu demandes qu’on te donne quelque chose, mais tu n’as pas nommé le reçu.": "何かを渡してほしいと伝えていますが、レシートだとは分かりません。",
    };
    for (const [prefix, japanese] of Object.entries(incompletePrefixes)) {
      if (source.startsWith(prefix + " ")) {
        return japanese + ja(source.slice(prefix.length + 1));
      }
    }

    // Composed feedback uses a contextual explanation followed by a fixed
    // pedagogical instruction. The context is already mapped by source.
    r = m1(/^(.+?)\. (.+)$/u);
    if (r && exact(r[1] + ".") && exact(r[2])) {
      return exact(r[1] + ".") + exact(r[2]);
    }
  }
  // Metro voice feedback is assembled at runtime from selected intents, suggested
  // answers and incremental hints. Translate presentation fragments only; never
  // alter the evaluator's original French feedback or Korean transcript.
  if (module === "metro") {
    const translatePart = (part: string): string => {
      const translated = resolveImmersionText(module, part, locale, instance);
      if (translated !== part) return translated;
      if (!part.endsWith(".")) {
        const punctuated = part + ".";
        const retry = resolveImmersionText(module, punctuated, locale, instance);
        if (retry !== punctuated) return retry;
      }
      return part;
    };

    const answerSeparator = " — réponses proposées : ";
    const answerIndex = source.lastIndexOf(answerSeparator);
    if (answerIndex >= 0) {
      const feedback = source.slice(0, answerIndex);
      const options = source.slice(answerIndex + answerSeparator.length)
        .replace(/[.]$/u, "")
        .split(" · ")
        .map((option) => {
          const choice = option.match(/^« (.+) »$/u);
          return choice ? "「" + translatePart(choice[1]) + "」" : translatePart(option);
        })
        .join("・");
      return translatePart(feedback) + " — 選べる返答：" + options;
    }

    const guidanceSeparator = " — ";
    const guidanceIndex = source.lastIndexOf(guidanceSeparator);
    if (guidanceIndex >= 0) {
      return translatePart(source.slice(0, guidanceIndex)) + " — " +
        translatePart(source.slice(guidanceIndex + guidanceSeparator.length));
    }

    let metroMatch = source.match(/^Ici, les choix proposés te permettent de (.+)\.$/u);
    if (metroMatch) {
      const options = metroMatch[1].split(", ").map(translatePart).join("、");
      return "この場面では、次の行動から選べます：" + options + "。";
    }

    metroMatch = source.match(/^J’ai compris : (.+?)\. (Ici, .+)$/u);
    if (metroMatch) {
      const rest = metroMatch[2];
      const expectation = rest.match(
        /^(?:Ici, le plus naturel est de demander simplement comment aller vers Gangnam depuis Hongik University\.|Ici, reste simplement sur ce que tu peux répondre à cette étape\.|Ici, les choix proposés te permettent de [^.]+\.)/u,
      );
      if (expectation) {
        const guidance = rest.slice(expectation[0].length).trim();
        return "「" + translatePart(metroMatch[1]) + "」という意図が伝わりました。" +
          translatePart(expectation[0]) + (guidance ? " " + translatePart(guidance) : "");
      }
    }

    const expectationIndex = source.indexOf(" Ici, ");
    if (expectationIndex >= 0) {
      const preceding = source.slice(0, expectationIndex);
      const expectation = source.slice(expectationIndex + 1);
      const translatedPreceding = translatePart(preceding);
      const translatedExpectation = translatePart(expectation);
      if (translatedPreceding !== preceding || translatedExpectation !== expectation) {
        return translatedPreceding + " " + translatedExpectation;
      }
    }

    metroMatch = source.match(/^Ta phrase peut vouloir dire plusieurs choses ici\. (Ici, .+)$/u);
    if (metroMatch) return "この場面では複数の意味に取れる返答です。" + translatePart(metroMatch[1]);

    metroMatch = source.match(/^Tu as cité plusieurs lignes \((.+)\)\. Pour aller vers Gangnam dans cette scène, c’est la ligne 2\.$/u);
    if (metroMatch) return "「" + metroMatch[1].replaceAll(" et ", "」「") +
      "」という複数の路線を挙げていますが、この場面で江南へ向かうのは２号線です。";

    metroMatch = source.match(/^Tu as cité la ligne (\d+)\. Pour aller vers Gangnam dans cette scène, c’est la ligne 2 : demande où prendre « 2호선 » vers Gangnam\.$/u);
    if (metroMatch) return metroMatch[1] + "号線と言いましたが、この場面で江南へ向かうのは２号線です。「2호선」でどちらに乗るか尋ねましょう。";

    metroMatch = source.match(/^Ta demande semble bien concerner un trajet, mais tu as donné (.+?) au lieu de Gangnam\. Ici, l’erreur porte sur la destination, pas sur la structure de ta question\.$/u);
    if (metroMatch) return "移動について尋ねていることは伝わりますが、江南ではなく「" +
      metroMatch[1] + "」と言っています。文の形ではなく目的地が違っています。";
  }
  let m = source.match(/^(\d+) situations à pratiquer$/u);
  if (m) return m[1] + "つの場面を練習";
  m = source.match(/^(\d+) tentatives avec le même diagnostic$/u);
  if (m) return "同じ指摘が" + m[1] + "回ありました";
  m = source.match(/^(\d+) réponses? validées? sans correction$/u);
  if (m) return "修正なしで" + m[1] + "件正しく回答";
  m = source.match(/^(\d+) difficultés? résolues? pendant la scène$/u);
  if (m) return "このシーンで" + m[1] + "件の課題を解決";
  m = source.match(/^(\d+) missions maîtrisées sur (\d+)$/u);
  if (m) return m[2] + "件中" + m[1] + "件のミッションを習得";
  m = source.match(/^Retour depuis les missions (.+)$/u);
  if (m) return (exact(m[1]) ?? m[1]) + "のミッション一覧から戻る";
  m = source.match(/^Lancer la mission (.+)$/u);
  if (m) return "「" + (exact(m[1]) ?? m[1]) + "」を始める";
  m = source.match(/^Objectif maîtrisé : (.+)$/u);
  if (m) return "目標達成：" + (exact(m[1]) ?? m[1]);
  m = source.match(/^(\d+) \/ (\d+) maîtrisées$/u);
  if (m) return m[2] + "件中" + m[1] + "件習得";
  m = source.match(/^Confirmer (.+)$/u);
  if (m) return "「" + (exact(m[1]) ?? m[1]) + "」と確認する";
  m = source.match(/^(Réécouter|Écouter) (.+)$/u);
  if (m && /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(m[2])) return (exact(m[1]) ?? m[1]) + "：" + m[2];
  // Dynamic teaching feedback is translated only at display time. Korean examples are interpolated verbatim.
  const jaTerm = (value: string) => exact(value) ?? value;
  const jaExamples = (value: string) => value.split(/( ou |, )/gu).map((part) =>
    part === " ou " ? " または " : part === ", " ? "、" : jaTerm(part),
  ).join("");
  m = source.match(/^Je t’ai compris malgré le mélange de langues \((.+)\)\. Pour rester en coréen : “(.+?)”(?: (.+))?$/u);
  if (m) return "複数の言語が混ざっていましたが、意味は伝わりました（" + m[1] + "）。韓国語だけで言うなら「" + m[2] + "」です。" + (m[3] ? " " + resolveImmersionText(module, m[3], locale, instance) : "");
  m = source.match(/^Je t’ai compris : (.+?)\. Pour compter ce produit, utilise ([^ ]+) plutôt que ([^ ]+) : “(.+?)”$/u);
  if (m) return jaTerm(m[1]) + "を注文したいのですね。この商品を数える助数詞は「" + m[3] + "」ではなく「" + m[2] + "」です。「" + m[4] + "」と言いましょう。";
  m = source.match(/^Je t’ai compris : (.+?)\. La reconnaissance a probablement accroché sur un mot ; la phrase attendue est : “(.+?)”$/u);
  if (m) return "「" + jaTerm(m[1]) + "」という意図は伝わりました。音声認識が単語を聞き違えた可能性があります。この場面では「" + m[2] + "」と言います。";
  m = source.match(/^Je pense avoir entendu « (.+?) », mais je ne suis pas assez sûr\. Confirme si c’est bien ça, sinon réessaie\.$/u);
  if (m) return "「" + jaTerm(m[1]) + "」と聞こえましたが、確信が持てません。合っていれば確定し、違えばもう一度話してください。";
  m = source.match(/^Le produit est clair : tu demandes (.+?)\. En revanche, ta phrase en commande plusieurs alors que ce choix de la mission correspond à une seule unité\. Ce n’est pas une faute de coréen : c’est la quantité qui ne correspond pas à cette branche\. Si tu voulais bien une seule unité, confirme ou reformule : « (.+?) »$/u);
  if (m) return jaTerm(m[1]) + "の注文だと分かります。ただし、この選択肢では１つの注文を想定しているのに、複数の数量を伝えています。韓国語そのものの間違いではありません。１つ注文したい場合は確定するか「" + m[2] + "」と言い直しましょう。";
  m = source.match(/^Le mot « 영수증 » est bien identifié, mais « 룰 » n’est pas la particule attendue ici\. Avec un objet, utilise « 을\/를 », ou omets simplement la particule : « (.+?) »$/u);
  if (m) return "「영수증」は正しく聞き取れましたが、ここで「룰」は使いません。目的語の助詞「을/를」を使うか、省略して「" + m[1] + "」と答えましょう。";
  m = source.match(/^La demande de répétition est comprise, mais « (.+?) » ne sert pas à compter le nombre de répétitions\. Pour dire « (.+?) fois », utilise « 번 », par exemple : « 다시 한 번 말씀해 주세요\. »$/u);
  if (m) return "もう一度言ってほしい意図は伝わりますが、回数を数えるのに「" + m[1] + "」は使いません。「" + m[2] + "回」と言うには「번」を使います。例えば「다시 한 번 말씀해 주세요.」です。";
  m = source.match(/^Le moyen de paiement est clair, mais « (.+?)번 » signifie que l’action est répétée (.+?) fois\. Ce nombre n’est pas utile pour répondre à la question du paiement\. Dis simplement : « (.+?) »$/u);
  if (m) return "支払い方法は伝わりますが、「" + m[1] + "번」は行為を" + m[2] + "回行うという意味になります。支払い方法を答えるのに回数は不要です。「" + m[3] + "」と言いましょう。";
  m = source.match(/^L’option à emporter est claire, mais « (.+?)번 » compte le nombre de fois où l’action est répétée\. Ici, ce nombre n’est pas nécessaire : « (.+?) »$/u);
  if (m) return "持ち帰りの意図は伝わっていますが、「" + m[1] + "번」は行為の回数を表します。ここでは回数は不要なので「" + m[2] + "」と言いましょう。";
  m = source.match(/^Ta décision concernant le reçu est comprise, mais « (.+?)번 » ajoute l’idée de répéter l’action plusieurs fois\. Pour répondre simplement au serveur : « (.+?) »$/u);
  if (m) return "レシートの要否は伝わりますが、「" + m[1] + "번」を付けると何回も行う意味になります。店員には「" + m[2] + "」と答えましょう。";
  m = source.match(/^L’intention « à emporter » est comprise, mais « (.+?) » sert à compter un objet ou une personne, pas l’option à emporter\. Dis simplement : « (.+?) »$/u);
  if (m) return "持ち帰りたい意図は伝わりますが、「" + m[1] + "」は物や人を数える助数詞で、持ち帰りの選択には使いません。「" + m[2] + "」と答えましょう。";
  m = source.match(/^Le moyen de paiement est bien compris, mais le compteur « (.+?) » n’a pas de rôle dans cette réponse\. Dis simplement : « (.+?) »$/u);
  if (m) return "支払い方法は伝わっていますが、この返答に助数詞「" + m[1] + "」は不要です。「" + m[2] + "」と言いましょう。";
  m = source.match(/^Ta décision concernant le reçu est comprise, mais le compteur « (.+?) » n’est pas nécessaire ici\. Réponds simplement : « (.+?) »$/u);
  if (m) return "レシートの要否は伝わっていますが、ここでは助数詞「" + m[1] + "」は不要です。「" + m[2] + "」と答えましょう。";
  m = source.match(/^L’intention est compréhensible, mais ta phrase se termine à une forme de dictionnaire ou à une forme neutre\. Dans un échange avec le personnel, transforme-la en réponse polie et conversationnelle\. Par exemple : « (.+?) »$/u);
  if (m) return "言いたいことは伝わりますが、文末が辞書形または普通体になっています。店員との会話では丁寧な文末を使いましょう。例えば「" + m[1] + "」です。";
  m = source.match(/^Ta commande est comprise, mais tu n’as pas précisé la quantité\. Au café, pense à indiquer combien tu en veux avec le compteur adapté\.(.*)$/u);
  if (m) return "注文の内容は伝わりますが、数量が指定されていません。カフェでは適切な助数詞を使って、いくつ欲しいかを伝えましょう。" + (m[1] ? " " + m[1] : "");
  m = source.match(/^Ta phrase peut correspondre à plusieurs réponses\. Ici, (.+?)\. Garde une seule intention\.$/u);
  if (m) return "返答が複数の選択肢に当てはまります。この場面では" + jaTerm(m[1]) + "。１つの意図に絞りましょう。";
  m = source.match(/^Je vois que tu veux (.+?), mais il manque le produit précis\. (.+?)\. Tu peux dire (.+?)\.$/u);
  if (m) return jaTerm(m[1]) + "を頼みたいことは伝わりますが、具体的な商品が分かりません。" + jaTerm(m[2]) + "。例えば" + jaExamples(m[3]) + "と言えます。";
  m = source.match(/^Je comprends que tu vas consommer la commande, mais il manque l’information essentielle : sur place ou à emporter\. Tu peux répondre (.+?)\.$/u);
  if (m) return "飲食する意図は伝わっていますが、店内利用か持ち帰りかが分かりません。" + jaExamples(m[1]) + "のように答えましょう。";
  m = source.match(/^Je comprends que tu veux payer, mais il manque le moyen de paiement\. Dis simplement carte ou espèces, par exemple (.+?)\.$/u);
  if (m) return "支払う意図は伝わっていますが、カードか現金かが分かりません。" + jaExamples(m[1]) + "のように答えましょう。";
  m = source.match(/^Tu réponds déjà à la question du reçu, mais on est encore au paiement\. Choisis d’abord carte ou espèces : (.+?)\.$/u);
  if (m) return "レシートについて答えていますが、まだ支払い方法を選ぶ場面です。先にカードか現金を選びましょう：" + jaExamples(m[1]) + "。";
  m = source.match(/^Je comprends ce que tu veux dire, mais la formulation ne permet pas encore de valider l’étape sans ambiguïté\. Tu peux répondre (.+?)\.$/u);
  if (m) return "言いたいことは伝わりますが、この言い方ではまだ判定しきれません。" + jaExamples(m[1]) + "のように答えてみましょう。";
  m = source.match(/^Cette réponse correspond à une autre étape\. Ici, (.+?)\. Tu peux répondre (.+?)\.$/u);
  if (m) return "その返答は別の場面に合っています。今は" + jaTerm(m[1]) + "。" + jaExamples(m[2]) + "のように答えましょう。";
  m = source.match(/^Je pense que (.+?), mais je préfère vérifier\. (.+)$/u);
  if (m) return "「" + jaTerm(m[1]) + "」という意味だと思いますが、念のため確認しましょう。" + jaTerm(m[2]);
  m = source.match(/^Je vois ce que tu veux dire : (.+?), mais ce n’est pas la question actuelle\. (.+?)\. Tu peux répondre (.+?)\.$/u);
  if (m) return "「" + jaTerm(m[1]) + "」という意味ですね。ただ、今の質問への返答ではありません。" + jaTerm(m[2]) + "。" + jaExamples(m[3]) + "のように答えましょう。";
  m = source.match(/^(.+?)\. C’est compréhensible, mais ce n’est pas ce que le serveur te demande ici\. Tu peux répondre (.+?)\.$/u);
  if (m && exact(m[1])) return jaTerm(m[1]) + "。意味は伝わりますが、店員が今尋ねていることとは違います。" + jaExamples(m[2]) + "のように答えましょう。";
  m = source.match(/^Ta négation change le sens de la réponse, donc je ne peux pas valider ce choix\. Ici, (.+?)\. Tu peux dire (.+?)\.$/u);
  if (m) return "否定が入ると意味が変わるため、この選択肢としては判定できません。今は" + jaTerm(m[1]) + "。" + jaExamples(m[2]) + "と言ってみましょう。";
  m = source.match(/^Tu demandes « (.+?) »\. La phrase se comprend, mais elle ne répond pas à la question actuelle\. Ici, (.+?)\. Tu peux répondre (.+?)\.$/u);
  if (m) return "「" + m[1] + "」を求めていますね。表現としては伝わりますが、今の質問への返答ではありません。今は" + jaTerm(m[2]) + "。" + jaExamples(m[3]) + "のように答えましょう。";
  m = source.match(/^Je ne vois pas encore (.+?) dans ta réponse\. Tu peux dire (.+?)\.$/u);
  if (m) return "まだ" + jaTerm(m[1]) + "が返答から読み取れません。" + jaExamples(m[2]) + "のように答えましょう。";
  m = source.match(/^Cette réponse correspond à autre chose\. Ici, tu peux (.+?)\.$/u);
  if (m) return "その返答は別の内容に当てはまります。ここでは" + jaExamples(m[1]) + "と言ってみましょう。";
  m = source.match(/^Je n’ai pas assez d’éléments pour valider cette réponse\. Tu peux (.+?), réessayer ou utiliser l’aide\.$/u);
  if (m) return "返答を判定するには情報が足りません。" + jaExamples(m[1]) + "と答えるか、もう一度話すか、ヒントを使ってみましょう。";
  m = source.match(/^D’accord, je prends ta correction : (.+?)\. Forme naturelle : “(.+?)”$/u);
  if (m) return "訂正を反映しました：「" + jaTerm(m[1]) + "」。自然な言い方は「" + m[2] + "」です。";
  m = source.match(/^Je t’ai compris : (.+?)\. (.+)$/u);
  if (m && exact(m[2])) return "「" + jaTerm(m[1]) + "」という意図が伝わりました。" + exact(m[2]);
  m = source.match(/^Je vois ce que tu veux dire : (.+?)\. (.+)$/u);
  if (m && exact(m[2])) return "「" + jaTerm(m[1]) + "」という意味ですね。" + exact(m[2]);
  m = source.match(/^Le micro a peut-être déformé un mot\. (.+)$/u);
  if (m) return "音声認識で一部の単語が正しく聞き取られなかった可能性があります。" + resolveImmersionText(module, m[1], locale, instance);
  return source;
}
