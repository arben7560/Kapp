import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { createAppI18n } = await import("../lib/i18n/instance.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resolvePremiumText, resolvePremiumError } = await import("../lib/i18n/premiumText.ts");
const { resources } = await import("../locales/index.ts");
const {
  PAYWALL_COPY, PREMIUM_SUBSCRIPTION_OFFERS, PREMIUM_PRICE_FALLBACKS,
} = await import("../lib/paywall/config.ts");
const { toRevenueCatError, calculateAnnualOfferMetrics } = await import("../lib/paywall/revenueCatLogic.ts");

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const fr = JSON.parse(read("../locales/fr/premium.json"));
const ja = JSON.parse(read("../locales/ja/premium.json"));
const instance = createAppI18n();
const translate = (source) => resolvePremiumText(source, "ja", instance);

test("Premium uses structured aligned French/Japanese copy with stable source IDs", () => {
  assert.deepEqual(validateCataloguePair(resources.fr.premium, resources.ja.premium), []);
  assert.deepEqual(Object.keys(fr.copy).sort(), Object.keys(ja.copy).sort());
  const entries = Object.entries(fr.copy).flatMap(([section, group]) =>
    Object.entries(group).map(([id, value]) => ({ section, id, value })),
  );
  assert.ok(entries.length >= 50);
  for (const { section, id, value } of entries) {
    assert.equal(id, encodeURIComponent(value).replaceAll(".", "%2E"), value);
    assert.equal(translate(value), ja.copy[section][id], section + ": " + value);
    assert.equal(resolvePremiumText(value, "fr", instance), value);
    assert.ok(ja.copy[section][id].length > 0);
  }
});

test("Paywall and account subscription errors are localized only at display time", () => {
  const paywall = read("../app/premium.tsx");
  const account = read("../app/account/index.tsx");
  const guard = read("../lib/paywall/SubscriptionAccessGuard.tsx");
  assert.match(paywall, /<PremiumLocalizationProvider>/u);
  assert.match(paywall, /PremiumActionButton as ActionButton/u);
  assert.match(paywall, /resolvePremiumError\(error\.message, locale, i18n\)/u);
  assert.match(account, /resolvePremiumError\(paywall\.error\.message, locale, i18n\)/u);
  assert.match(guard, /resolvePremiumText\("Vérification de l’accès Premium", locale, i18n\)/u);
  assert.match(paywall, /accessibilityRole="radio"/u);
  assert.match(paywall, /accessibilityState=\{\{ selected:/u);
  assert.match(paywall, /displayedPrice\(offer\.id\)/u);
});

test("Offers and the paywall retain their original IDs and currency amounts", () => {
  assert.equal(PREMIUM_SUBSCRIPTION_OFFERS.length, 2);
  assert.deepEqual(PREMIUM_SUBSCRIPTION_OFFERS.map(o => o.id), ["monthly", "yearly"]);
  assert.deepEqual(PREMIUM_SUBSCRIPTION_OFFERS.map(o => o.productId),
    ["kapp_premium_monthly", "kapp_premium_yearly"]);
  assert.deepEqual(PREMIUM_SUBSCRIPTION_OFFERS.map(o => o.title),
    ["Premium mensuel", "Premium annuel"]);
  assert.equal(PREMIUM_PRICE_FALLBACKS.monthly, "7,99 € / mois");
  assert.equal(PREMIUM_PRICE_FALLBACKS.yearly, "69,99 € / an");
  assert.equal(translate("7,99 € / mois"), "7,99 €／月");
  assert.equal(translate("69,99 € / an"), "69,99 €／年");
  assert.equal(translate(PAYWALL_COPY.restore), "購入情報を復元");
  assert.equal(translate(PAYWALL_COPY.manage), "サブスクリプションを管理");
});

test("Savings, monthly equivalent and selected plan are adapted to natural Japanese", () => {
  assert.equal(translate("Économisez 17 %"), "17%お得");
  assert.equal(translate("Économisez 25 %"), "25%お得");
  assert.equal(
    translate("Offre sélectionnée : Premium annuel"),
    "選択中のプラン：年額Premiumプラン",
  );
  assert.equal(
    translate("Soit 5,83 € / mois. Abonnement annuel, résiliable depuis l’App Store ou Google Play."),
    "月額換算 5,83 €。 年額サブスクリプションです。App StoreまたはGoogle Playから解約できます。",
  );
  const computed = calculateAnnualOfferMetrics(
    { currencyCode: "EUR", price: 7.99 },
    { currencyCode: "EUR", price: 69.99, pricePerMonth: 5.83, pricePerMonthString: "5,83 €" },
  );
  assert.ok(computed);
  assert.equal(computed.monthlyEquivalentPriceString, "5,83 €");
  assert.equal(computed.savingsPercent, 27);
});

test("Every canonical feature, offer and important legal explanation has a Japanese copy", () => {
  const paywall = read("../app/premium.tsx");
  const config = read("../lib/paywall/config.ts");
  const runtime = read("../lib/paywall/PaywallProvider.tsx");
  const errors = read("../lib/paywall/revenueCatLogic.ts");
  const displayLiterals = [
    ...[...paywall.matchAll(/"([^"\n]{5,350})"/gu)].map(m => m[1]),
    ...[...config.matchAll(/"([^"\n]{5,350})"/gu)].map(m => m[1]),
    ...[...runtime.matchAll(/"([^"\n]{5,350})"/gu)].map(m => m[1]),
    ...[...errors.matchAll(/"([^"\n]{5,350})"/gu)].map(m => m[1]),
  ];
  const userFacing = displayLiterals.filter(x =>
    /[éèêàâîïôçœ]/iu.test(x) &&
    !x.includes("[RevenueCat]") && !x.includes("console") &&
    !x.startsWith(".") && !x.startsWith("/"));
  assert.ok(userFacing.length >= 25, "Premium literal scan no longer covers relevant source");
  for (const source of userFacing) {
    assert.notEqual(translate(source), source, "Untranslated Premium literal: " + source);
  }
  const textNodes = [...paywall.matchAll(/<AppText\b[^>]*>\s*([^<{][^<{}]*?)\s*<\/AppText>/gu)]
    .map(m=>m[1].replace(/\s+/gu, " ").trim())
    .filter(v=>v && /[éèêàâîïôçœ]/iu.test(v));
  for (const source of textNodes) {
    assert.notEqual(translate(source), source, "Untranslated Premium label: " + source);
  }
});

test("Error mapping retains RevenueCat operational codes while displaying Japanese", () => {
  const mapped = toRevenueCatError({ code: "20" });
  assert.equal(mapped.code, "payment-pending");
  assert.equal(translate(mapped.message),
    "決済の確認待ちです。ストアで承認されるとPremiumが有効になります。");
  assert.equal(translate("Aucun abonnement Premium actif n’a été trouvé pour ce compte."),
    "このアカウントで有効なPremiumサブスクリプションが見つかりませんでした。");
  assert.equal(
    translate("L’achat a été enregistré, mais l’accès Premium n’a pas encore été activé. Utilise « Restaurer mes achats » dans quelques instants."),
    "購入は記録されましたが、Premiumの利用権はまだ有効になっていません。少し待ってから「購入情報を復元」をお試しください。",
  );
  assert.equal(resolvePremiumError("Unexpected vendor exception", "ja", instance),
    "サブスクリプションの処理中にエラーが発生しました。しばらくしてからもう一度お試しください。");
  assert.equal(resolvePremiumError("", "ja", instance), "");
  assert.equal(resolvePremiumText("Restaurer mes achats", "fr", instance), "Restaurer mes achats");
});
