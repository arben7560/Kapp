import assert from "node:assert/strict";
import test from "node:test";

import {
  createPaywallOperationGuard,
  deriveRevenueCatEntitlement,
  hasActivePremiumEntitlement,
  mapSubscriptionPackages,
  toRevenueCatError,
} from "../lib/paywall/revenueCatLogic.ts";

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
