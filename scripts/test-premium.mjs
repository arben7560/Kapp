import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  calculateAnnualOfferMetrics,
  createPaywallOperationGuard,
  deriveRevenueCatEntitlement,
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
  assert.equal(PREMIUM_PRICE_FALLBACKS.monthly, "7,99 € / mois");
  assert.equal(PREMIUM_PRICE_FALLBACKS.yearly, "69,99 € / an");
});

test("aucun accès interne ne peut déverrouiller Premium en production", () => {
  assert.equal(isDeveloperPremiumUnlockEnabled(false, "1", "1"), false);
  assert.equal(isDeveloperPremiumUnlockEnabled(true, "1", "0"), true);
  assert.equal(isDeveloperPremiumUnlockEnabled(true, "0", "1"), true);

  const eas = JSON.parse(readFileSync(new URL("../eas.json", import.meta.url)));
  assert.equal(
    eas.build.production.env.EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS,
    "0",
  );
  assert.equal(eas.build.production.env.EXPO_PUBLIC_ENABLE_NATIVE_IAP, "1");
});

test("les routes Premium déclarées sont bloquées sans inclure les contenus gratuits", () => {
  assert.equal(isPremiumRoutePath("/voc/kdrama"), true);
  assert.equal(isPremiumRoutePath("/comptage/heures"), true);
  assert.equal(isPremiumRoutePath("/voc/basics"), false);
  assert.equal(isPremiumRoutePath("/comptage/base"), false);
  assert.equal(isPremiumRoutePath("/premium"), false);
});
