import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  calculateAnnualOfferMetrics,
  createPaywallOperationGuard,
  deriveRevenueCatEntitlement,
  decideSubscriptionPurchase,
  hasActivePremiumEntitlement,
  mapSubscriptionPackages,
  toRevenueCatError,
} from "../lib/paywall/revenueCatLogic.ts";
import {
  isDeveloperPremiumUnlockEnabled,
  isPremiumRoutePath,
  PREMIUM_PRICE_FALLBACKS,
} from "../lib/paywall/config.ts";

const entitlement = (isActive = true) => ({
  isActive,
  store: "PLAY_STORE",
  productIdentifier: "kapp_premium_monthly",
  expirationDateMillis: 1_800_000_000_000,
  willRenew: false,
});

const customerInfo = (premiumEntitlement) => ({
  entitlements: {
    active: premiumEntitlement
      ? { premium_all_access: premiumEntitlement }
      : {},
  },
});

const storePackage = (identifier, productIdentifier) => ({
  identifier,
  product: {
    identifier: productIdentifier,
    priceString: identifier,
  },
});

const monthlyPackage = storePackage("$rc_monthly", "kapp_premium_monthly");
const yearlyPackage = storePackage("$rc_annual", "kapp_premium_yearly");
const paywallProviderSource = readFileSync(
  new URL("../lib/paywall/PaywallProvider.tsx", import.meta.url),
  "utf8",
);
const premiumGuardSource = readFileSync(
  new URL("../lib/paywall/SubscriptionAccessGuard.tsx", import.meta.url),
  "utf8",
);

test("monthly et yearly sélectionnent leurs produits respectifs", () => {
  const packages = mapSubscriptionPackages({
    monthly: monthlyPackage,
    annual: yearlyPackage,
    availablePackages: [yearlyPackage, monthlyPackage],
  });

  assert.equal(packages.monthly, monthlyPackage);
  assert.equal(packages.yearly, yearlyPackage);
});

test("une inversion des packages standard ne peut pas inverser les achats", () => {
  const packages = mapSubscriptionPackages({
    monthly: yearlyPackage,
    annual: monthlyPackage,
    availablePackages: [yearlyPackage, monthlyPackage],
  });

  assert.equal(packages.monthly, monthlyPackage);
  assert.equal(packages.yearly, yearlyPackage);
});

test("les offerings absents ou partiels restent utilisables sans package undefined", () => {
  assert.deepEqual(mapSubscriptionPackages(null), {});

  const packages = mapSubscriptionPackages({
    monthly: monthlyPackage,
    annual: null,
    availablePackages: [monthlyPackage],
  });

  assert.equal(packages.monthly, monthlyPackage);
  assert.equal(packages.yearly, undefined);
});

test("un achat réussi ne déverrouille que l’entitlement actif attendu", () => {
  assert.equal(hasActivePremiumEntitlement(customerInfo()), false);
  assert.equal(
    hasActivePremiumEntitlement(customerInfo(entitlement(false))),
    false,
  );
  assert.equal(
    hasActivePremiumEntitlement(customerInfo(entitlement(true))),
    true,
  );
  assert.equal(
    hasActivePremiumEntitlement({
      entitlements: { active: { another_entitlement: entitlement(true) } },
    }),
    false,
  );
});

test("Google Play : nouveau, formule possédée, remplacement et états incertains", () => {
  const play = (product, active = [product], expiry = Date.now() + 60_000) => ({
    activeSubscriptions: active,
    entitlements: { active: { premium_all_access: {
      isActive: true, store: "PLAY_STORE", productIdentifier: product,
      expirationDateMillis: expiry,
    } } },
  });
  assert.equal(decideSubscriptionPurchase({ activeSubscriptions: [], entitlements: { active: {} } }, "monthly").kind, "new");
  assert.equal(decideSubscriptionPurchase(play("kapp_premium_monthly:base"), "monthly").kind, "owned");
  const change = decideSubscriptionPurchase(play("kapp_premium_monthly:base"), "yearly");
  assert.equal(change.kind, "change");
  assert.equal(change.oldProductIdentifier, "kapp_premium_monthly:base");
  assert.equal(decideSubscriptionPurchase(play("kapp_premium_yearly"), "monthly").kind, "change");
  assert.equal(decideSubscriptionPurchase(play("kapp_premium_monthly", ["kapp_premium_monthly", "kapp_premium_yearly"]), "yearly").kind, "blocked");
  assert.equal(decideSubscriptionPurchase(play("kapp_premium_monthly", ["unknown"]), "yearly").kind, "blocked");
  assert.equal(decideSubscriptionPurchase(play("kapp_premium_monthly", []), "yearly").kind, "blocked");
  assert.equal(decideSubscriptionPurchase({ activeSubscriptions: ["unknown"], entitlements: { active: {} } }, "yearly").kind, "blocked");
  assert.equal(decideSubscriptionPurchase(play("kapp_premium_monthly", [], Date.now() - 1), "yearly").kind, "blocked");
  const expired = play("kapp_premium_monthly", [], Date.now() - 1);
  expired.entitlements.active = {};
  assert.equal(decideSubscriptionPurchase(expired, "yearly").kind, "new");
});

test("restauration, expiration et CustomerInfo Premium vers Free sont réconciliées", () => {
  const restored = deriveRevenueCatEntitlement(customerInfo(entitlement()));
  assert.equal(restored.hasAccess, true);
  assert.equal(restored.willAutoRenew, false);

  const expired = deriveRevenueCatEntitlement(customerInfo());
  assert.deepEqual(expired, { hasAccess: false, source: "none" });
});

test("l’annulation, le réseau et le paiement en attente ont des erreurs dédiées", () => {
  assert.equal(toRevenueCatError({ code: "1" }).code, "purchase-cancelled");
  assert.equal(
    toRevenueCatError({ userCancelled: true }).code,
    "purchase-cancelled",
  );
  assert.equal(toRevenueCatError({ code: "10" }).code, "network-unavailable");
  assert.equal(toRevenueCatError({ code: "35" }).code, "network-unavailable");
  assert.equal(toRevenueCatError({ code: "20" }).code, "payment-pending");
  assert.equal(toRevenueCatError({ code: "2" }).code, "store-unavailable");
  assert.equal(toRevenueCatError({ code: "5" }).code, "product-unavailable");
});

test("le garde d’opération bloque double achat et restore concurrent", () => {
  const guard = createPaywallOperationGuard();

  assert.equal(guard.begin("purchase"), true);
  assert.equal(guard.begin("purchase"), false);
  assert.equal(guard.begin("restore"), false);
  guard.end("purchase");
  assert.equal(guard.begin("restore"), true);
  guard.end("restore");
  assert.equal(guard.isBusy(), false);
});

test("les métriques annuelles utilisent les prix numériques et localisés du Store", () => {
  const metrics = calculateAnnualOfferMetrics(
    { currencyCode: "EUR", price: 7.99 },
    {
      currencyCode: "EUR",
      price: 69.99,
      pricePerMonth: 5.8325,
      pricePerMonthString: "5,83 €",
    },
  );

  assert.equal(metrics?.savingsPercent, 27);
  assert.equal(metrics?.monthlyEquivalentPrice, 5.8325);
  assert.equal(metrics?.monthlyEquivalentPriceString, "5,83 €");
  assert.equal(
    calculateAnnualOfferMetrics(
      { currencyCode: "EUR", price: 7.99 },
      {
        currencyCode: "USD",
        price: 69.99,
        pricePerMonth: null,
        pricePerMonthString: null,
      },
    ),
    null,
  );
});

test("les fallbacks tarifaires de référence correspondent à la nouvelle offre", () => {
  assert.equal(PREMIUM_PRICE_FALLBACKS.monthly, "8,99 € / mois");
  assert.equal(PREMIUM_PRICE_FALLBACKS.yearly, "69,99 € / an");
});

test("aucun bypass Premium ne fonctionne dans une build release", () => {
  assert.equal(isDeveloperPremiumUnlockEnabled(false, "1", "1"), false);
  assert.equal(isDeveloperPremiumUnlockEnabled(false, "1", "0"), false);
  assert.equal(isDeveloperPremiumUnlockEnabled(true, "1", "0"), true);
  assert.equal(isDeveloperPremiumUnlockEnabled(true, "false", "0"), false);
  assert.equal(isDeveloperPremiumUnlockEnabled(true, undefined, "0"), false);
  assert.equal(isDeveloperPremiumUnlockEnabled(true, "0", "1"), true);

  const eas = JSON.parse(readFileSync(new URL("../eas.json", import.meta.url)));
  assert.equal(eas.build.closedTest.env.EXPO_PUBLIC_DEV_UNLOCK_ALL, "0");
  assert.equal(
    eas.build.closedTest.env.EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS,
    "0",
  );
  assert.equal(eas.build.closedTest.env.EXPO_PUBLIC_ENABLE_NATIVE_IAP, "1");
  assert.equal(eas.build.production.env.EXPO_PUBLIC_DEV_UNLOCK_ALL, "0");
  assert.equal(
    eas.build.production.env.EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS,
    "0",
  );
  assert.equal(eas.build.production.env.EXPO_PUBLIC_ENABLE_NATIVE_IAP, "1");

  const envExample = readFileSync(
    new URL("../.env.example", import.meta.url),
    "utf8",
  );
  assert.match(envExample, /^EXPO_PUBLIC_DEV_UNLOCK_ALL=0$/mu);
  assert.match(envExample, /^EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS=0$/mu);
});

test("les routes Premium déclarées sont bloquées sans inclure les contenus gratuits", () => {
  assert.equal(isPremiumRoutePath("/voc/kdrama"), true);
  assert.equal(isPremiumRoutePath("/comptage/heures"), true);
  assert.equal(isPremiumRoutePath("/voc/basics"), false);
  assert.equal(isPremiumRoutePath("/comptage/base"), false);
  assert.equal(isPremiumRoutePath("/premium"), false);
});

test("le Premium Guard masque le contenu avec un écran de chargement non vide", () => {
  assert.match(premiumGuardSource, /<ActivityIndicator/u);
  assert.match(premiumGuardSource, /accessibilityRole="progressbar"/u);
  assert.match(premiumGuardSource, /backgroundColor: "#000000"/u);
  assert.doesNotMatch(premiumGuardSource, /return null;/u);
});
