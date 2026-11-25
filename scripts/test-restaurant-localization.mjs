import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { localizedContent } = await import("../data/localized/index.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { getContentLocalizationScope } = await import("../lib/i18n/contentLocalizationScope.ts");
const { resolveImmersionText } = await import("../lib/i18n/immersionText.ts");
const { immersionCopyId } = await import("../data/localized/immersionRegistryCafe.ts");
const { RESTAURANT_IMMERSION_COPY } = await import("../data/localized/immersionRegistryRestaurant.ts");
const { resources } = await import("../locales/index.ts");

test("Restaurant localization covers its three lesson routes only", () => {
  for (const route of ["/lesson/restaurant", "/lesson/restaurantMissions", "/lesson/restaurantIA"]) {
    assert.deepEqual(getContentLocalizationScope(route), { namespace: "immersion", module: "restaurant" });
    const filename = route.split("/").at(-1);
    const code = readFileSync(new URL("../app/lesson/" + filename + ".tsx", import.meta.url), "utf8");
    assert.ok(code.includes('ContentLocalizationProvider pathname="' + route + '"'), route);
  }
  assert.deepEqual(getContentLocalizationScope("/lesson/cafe"), { namespace: "immersion", module: "cafe" });
  assert.deepEqual(getContentLocalizationScope("/lesson/metro"), { namespace: "immersion", module: "metro" });
  assert.deepEqual(getContentLocalizationScope("/speak"), { namespace: "vocabulary", module: "speak" });
  assert.deepEqual(getContentLocalizationScope("/lesson/aeroportIA"), { namespace: "immersion", module: "aeroport" });
});

test("Restaurant French and Japanese immersion catalogues match and retain all Hangul segments", () => {
  const fr = localizedContent.fr.immersion;
  const ja = localizedContent.ja.immersion;
  assert.ok(Object.keys(RESTAURANT_IMMERSION_COPY).length >= 290);
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(ja).sort());
  assert.deepEqual(validateCataloguePair(fr, ja, { koreanSegments: "display-adaptation" }), []);
  assert.deepEqual(resources.fr.immersion.content, fr);
  assert.deepEqual(resources.ja.immersion.content, ja);
  assert.ok(immersionCopyId("restaurant", "Commande").startsWith("restaurant__"));
  for (const [source, japanese] of Object.entries(RESTAURANT_IMMERSION_COPY)) {
    for (const [hangul] of source.matchAll(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/gu)) {
      assert.ok(japanese.includes(hangul), "Korean segment changed in " + source);
    }
  }
});

test("Restaurant labels and BBQ explanations are localized, with Korean audio/script unchanged", () => {
  for (const [fr, ja] of [
    ["RESTAURANT", "韓国料理店"],
    ["Côté serveur", "店員の表現"],
    ["Commande dans un BBQ à Séoul", "ソウルの焼肉店で注文"],
    ["Deux portions de samgyeopsal, s’il vous plaît.", "サムギョプサルを２人前お願いします。"],
    ["Moins épicé, s’il vous plaît.", "辛さ控えめでお願いします。"],
    ["Vous avez besoin de plus de salade ou d’accompagnements ?", "サンチュやおかずのおかわりはいかがですか？"],
    ["Fiche vocabulaire", "単語・表現一覧"],
    ["Le reçu, s’il vous plaît.", "レシートをお願いします。"],
    ["Demander un numéro de sortie", "出口番号を尋ねる"],
  ]) {
    assert.equal(resolveImmersionText("restaurant", fr, "ja"), ja, fr);
    assert.equal(resolveImmersionText("restaurant", fr, "fr"), fr, fr);
  }
  for (const korean of ["삼겹살 2인분 주세요.", "추천 메뉴가 있어요?", "영수증 주세요."]) {
    assert.equal(resolveImmersionText("restaurant", korean, "ja"), korean);
  }
  assert.equal(resolveImmersionText("restaurant", "Unrecognized restaurant copy", "ja"), "Unrecognized restaurant copy");
  assert.equal(resolveImmersionText("restaurant", "Parler", "ja"), "話す");
});

test("Canonical Restaurant French display fields have Japanese entries", () => {
  const files = [
    "../app/lesson/restaurant.tsx",
    "../data/lesson/restaurant/restaurant.ts",
    "../data/lesson/restaurant/restaurantMissions.ts",
    "../app/lesson/restaurantIA.tsx",
  ];
  const regex = /\b(?:french|fr|label|title|shortTitle|subtitle|description|objective|mean|context|tab|scenarioTitle|scenarioDescription|situation|narrator|startText)\s*:\s*"(?:\\.|[^"\\])*"|\b(?:french|fr|label|title|shortTitle|subtitle|description|objective|mean|context|tab|scenarioTitle|scenarioDescription|situation|narrator|startText)\s*:\s*'(?:\\.|[^'\\])*'/gu;
  const missing = [];
  for (const relativePath of files) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    for (const match of source.matchAll(regex)) {
      const text = match[0].split(":").slice(1).join(":").trim().slice(1, -1).trim();
      if (!/[A-Za-zÀ-ÿ]/u.test(text)) continue;
      if (resolveImmersionText("restaurant", text, "ja") === text) missing.push(relativePath + " :: " + text);
    }
  }
  assert.deepEqual(missing, [], missing.join("\n"));
});

test("Restaurant feedback dynamically translates ASR corrections and contextual help without editing Korean", () => {
  const dynamic = [
    "Pour indiquer le moyen utilisé, « (으)로 » correspond ici à « avec/par ». Dis : « 카드로 할게요. »",
    "Le plat est clair. Il manque seulement la quantité : « 삼겹살 2인분 주세요. »",
    "Je t’ai compris : la reconnaissance a probablement accroché sur un mot. La phrase visée est « 갈비 2인분 주세요. »",
    "Tu parles bien de la cuisson, mais on ne sait pas clairement qui doit s’en charger. Elle te demande maintenant qui va griller la viande : le personnel ou vous-mêmes.",
    "Ta phrase peut correspondre à plusieurs réponses. Elle te demande maintenant si tu veux le reçu. Garde une seule intention.",
    "J’ai compris : tu veux demander une recommandation. À ce moment-là, la serveuse attend ton choix de viande ou une demande de recommandation.",
    "Ta phrase est correcte en coréen, mais la quantité ne correspond pas à la commande de cette scène. Ici, il faut 2 portions : « 삼겹살 2인분 주세요. »",
    "Ta demande est claire. Pour des portions de viande au restaurant, « 인분 » est le compteur naturel ; « 명 » ne convient pas ici.",
    "Tu as donné plusieurs préférences de piquant qui se contredisent. Garde-en une seule — phrase modèle : « 맵게 해 주세요 » ou « 덜 맵게 해 주세요 ».",
    "Je ne retrouve pas encore une réponse adaptée à ce que la serveuse vient de demander — tu peux répondre : « Deux portions de samgyeopsal, s’il vous plaît. » · « Demander une recommandation. ».",
  ];
  for (const source of dynamic) {
    const ja = resolveImmersionText("restaurant", source, "ja");
    assert.notEqual(ja, source, source);
    assert.ok(/[\u3040-\u30ff\u3400-\u9fff]/u.test(ja), ja);
    assert.ok(!/\b(?:Je|Tu|Ta|Elle|Ici|La|Le|Les)\b/u.test(ja), "Residual French: " + ja);
    for (const [hangul] of source.matchAll(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/gu)) {
      assert.ok(ja.includes(hangul), "Korean changed in: " + ja);
    }
  }
  assert.ok(resolveImmersionText("restaurant", dynamic.at(-1), "ja").includes("サムギョプサル"));
});

test("Restaurant Japanese service copy preserves the context and polite wording", () => {
  for (const [french, japanese] of [
    ["Voulez-vous que je vous le fasse ?", "こちらでお焼きしましょうか？"],
    ["Pour le ragoût, vous le voulez épicé ou moins épicé ?", "チゲは辛めと辛さ控えめ、どちらになさいますか？"],
    ["Très bien, en espèces. Avez-vous besoin du reçu ?", "かしこまりました。現金でのお支払いですね。レシートは必要ですか？"],
    ["Très bien, je lance le paiement par carte. Avez-vous besoin du reçu ?", "かしこまりました。カードでのお支払いですね。レシートは必要ですか？"],
  ]) {
    assert.equal(resolveImmersionText("restaurant", french, "ja"), japanese);
  }
});

test("Restaurant contextual feedback is fully Japanese and preserves the original Korean", () => {
  for (const [source, expected] of [
    [
      "J’ai compris : tu demandes quel plat choisir. Ta question fonctionne très bien. Une autre façon simple de demander une recommandation est : « 추천 메뉴가 있어요? » À ce moment-là, la serveuse attend ton choix de viande ou une demande de recommandation.",
      "「どの料理がおすすめか尋ねている」という意図は伝わりました。自然な質問です。おすすめを尋ねるなら「추천 메뉴가 있어요?」とも言えます。今は、お肉を注文するか、おすすめを尋ねるかを選ぶ場面です。",
    ],
    [
      "J’ai compris : tu veux demander une recommandation. À ce moment-là, la serveuse attend ton choix de viande ou une demande de recommandation.",
      "「おすすめを尋ねる」という意図は伝わりました。今は、お肉を注文するか、おすすめを尋ねるかを選ぶ場面です。",
    ],
    [
      "Tu demandes d’ajouter des légumes, mais cela ne précise pas si tu veux plus de feuilles de salade pour les ssam. Elle te demande maintenant si tu veux davantage de salade, davantage d’accompagnements, ou rien d’autre. Si c’est bien ton choix, dis : « 상추 좀 더 주세요. »",
      "野菜を加えてほしいという意図は伝わりますが、サム用のサンチュをもっと欲しいのかはまだ分かりません。今は、サンチュやおかずをおかわりするか、それとも追加は不要かを聞かれています。サンチュが欲しいなら「상추 좀 더 주세요.」と言いましょう。",
    ],
    [
      "Tu demandes d’ajouter des légumes. À ce moment-là, la serveuse attend ton choix de viande ou une demande de recommandation.",
      "野菜を加えてほしいと頼んでいます。今は、お肉を注文するか、おすすめを尋ねるかを選ぶ場面です。",
    ],
  ]) {
    const japanese = resolveImmersionText("restaurant", source, "ja");
    assert.equal(japanese, expected);
    assert.doesNotMatch(japanese, /«|»| — |\b(?:Je|Tu|Ta|Elle|Pour|Ici)\b/iu);
  }
  assert.equal(
    resolveImmersionText("restaurant", "Le plat est clair. Il manque seulement la quantité : « 삼겹살 2인분 주세요. »", "ja"),
    "料理名はきちんと伝わっています。今回のミッションでは２人前の注文が目標なので、「삼겹살 2인분 주세요.」のように数量も伝えてみましょう。",
  );
});

test("Restaurant progressive feedback translates models, word hints and choices", () => {
  const model = resolveImmersionText(
    "restaurant",
    "Ta phrase nie le choix que tu es en train d’exprimer. Reformule en disant directement ce que tu veux — phrase modèle : « 삼겹살 2인분 주세요. » ou « 갈비 2인분 주세요. ».",
    "ja",
  );
  assert.match(model, /お手本のフレーズ：「삼겹살 2인분 주세요\.」／「갈비 2인분 주세요\.」/u);
  assert.doesNotMatch(model, /«|»| — |phrase modèle/u);
  const words = resolveImmersionText(
    "restaurant",
    "Je ne retrouve pas encore une réponse adaptée à ce que la serveuse vient de demander — mots utiles : 삼겹살 · 갈비.",
    "ja",
  );
  assert.match(words, /単語のヒント：삼겹살・갈비/u);
  const choices = resolveImmersionText(
    "restaurant",
    "Je ne retrouve pas encore une réponse adaptée à ce que la serveuse vient de demander — tu peux répondre : « Commander du samgyeopsal pour deux personnes. » · « Demander une recommandation. ».",
    "ja",
  );
  assert.match(choices, /選べる返答：「サムギョプサルを２人前注文する」／「おすすめを尋ねる」/u);
  assert.doesNotMatch(choices, /«|»| — |tu peux répondre/u);
  const combined = resolveImmersionText(
    "restaurant",
    "Je ne retrouve pas encore une réponse adaptée à ce que la serveuse vient de demander — mots utiles : 삼겹살 · 갈비 — tu peux répondre : « Commander du samgyeopsal pour deux personnes. » · « Demander une recommandation. ».",
    "ja",
  );
  assert.match(combined, /単語のヒント：삼겹살・갈비/u);
  assert.match(combined, /選べる返答：「サムギョプサルを２人前注文する」／「おすすめを尋ねる」/u);
});
