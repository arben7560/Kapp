import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { createHookHarness } from "./helpers/hook-harness.mjs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const eas = JSON.parse(read("eas.json"));
const testEnv = { ...eas.build.iapTest.env, EAS_BUILD_PROFILE: "iapTest" };
// Deliberately fake SDK keys. Never load .env in these tests.
const testKey = "test_fixture_not_a_real_key";
const googleKey = "goog_fixture_not_a_real_key";
const appleKey = "appl_fixture_not_a_real_key";
const outputs = new Map();

function load(file, dependencies = {}, globals = {}, expose = "") {
  if (!outputs.has(file)) {
    outputs.set(file, ts.transpileModule(read(file), {
      fileName: file,
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
    }).outputText);
  }
  const module = { exports: {} };
  vm.runInNewContext(outputs.get(file) + expose, {
    module, exports: module.exports, __DEV__: true,
    process: { env: {} },
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  }, { filename: file });
  return module.exports;
}

function appConfig(env) {
  const module = { exports: {} };
  vm.runInNewContext(read("app.config.js"), { module, process: { env } });
  return module.exports({ config: JSON.parse(read("app.json")).expo });
}

function config(env = testEnv, isDevelopment = true) {
  return load("lib/paywall/config.ts", {}, { process: { env }, __DEV__: isDevelopment });
}

function logic(configuration = config(), globals = {}) {
  return load("lib/paywall/revenueCatLogic.ts", { "./config.ts": configuration }, globals);
}

test("iapTest est un APK debug distinct, sans bypass et sans clé dans eas.json", () => {
  assert.equal(eas.build.iapTest.developmentClient, true);
  assert.equal(eas.build.iapTest.distribution, "internal");
  assert.equal(eas.build.iapTest.environment, "development");
  assert.equal(eas.build.iapTest.android.gradleCommand, ":app:assembleDebug");
  assert.equal(testEnv.KAPP_BUILD_PROFILE, "iapTest");
  assert.equal(testEnv.EXPO_PUBLIC_DEV_UNLOCK_ALL, "0");
  assert.equal(testEnv.EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS, "0");
  assert.equal(testEnv.EXPO_PUBLIC_ENABLE_NATIVE_IAP, "1");
  assert.equal(testEnv.EXPO_PUBLIC_REVENUECAT_TEST_KEY, undefined);
  for (const [name, profile] of Object.entries(eas.build)) {
    if (name !== "iapTest") assert.notEqual(profile.env?.EXPO_PUBLIC_REVENUECAT_STORE, "test");
  }
  // Local Metro must receive the EAS profile; the native dev client doesn't
  // automatically transfer EAS environment variables to the local JS server.
  const starter = read("scripts/start-iap-test.cjs");
  assert.match(starter, /build\.iapTest\.env/u);
  assert.match(starter, /EAS_BUILD_PROFILE: "iapTest"/u);
  assert.match(starter, /"--dev-client"/u);
  assert.match(starter, /"--clear"/u);
});

test("la configuration publique exclut la clé Test Store de tous les autres profils", () => {
  for (const [profile, settings] of Object.entries(eas.build)) {
    if (profile === "iapTest") continue;
    const result = appConfig({ ...settings.env, EAS_BUILD_PROFILE: profile, EXPO_PUBLIC_REVENUECAT_TEST_KEY: testKey });
    assert.equal(JSON.stringify(result).includes(testKey), false);
    assert.equal(result.extra.revenueCatTestStore, undefined);
    assert.equal(result.android.package, "com.arben60.kapp");
  }
  const result = appConfig({ ...testEnv, EXPO_PUBLIC_REVENUECAT_TEST_KEY: testKey });
  assert.equal(result.extra.revenueCatTestStore.apiKey, testKey);
  assert.equal(result.extra.revenueCatTestStore.profile, "iapTest");
  assert.equal(result.extra.eas.projectId, JSON.parse(read("app.json")).expo.extra.eas.projectId);
  const localResult = appConfig({ ...eas.build.iapTest.env, EXPO_PUBLIC_REVENUECAT_TEST_KEY: testKey });
  assert.equal(localResult.extra.revenueCatTestStore.profile, "iapTest");
  assert.doesNotMatch(read("services/revenueCat.ts"), /process\.env\.EXPO_PUBLIC_REVENUECAT_TEST_KEY/u);
});

test("les configurations mélangées et les bypass accidentels sont refusés", () => {
  for (const profile of [undefined, "production", "closedTest", "development"]) {
    assert.throws(() => appConfig({ ...testEnv, KAPP_BUILD_PROFILE: undefined, EAS_BUILD_PROFILE: profile }), /iapTest/u);
  }
  assert.throws(() => appConfig({ ...testEnv, EAS_BUILD_PROFILE: "production" }), /iapTest/u);
  assert.throws(() => appConfig({ EAS_BUILD_PROFILE: "iapTest" }), /iapTest/u);
  for (const name of ["EXPO_PUBLIC_DEV_UNLOCK_ALL", "EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS"]) {
    assert.throws(() => appConfig({ ...testEnv, [name]: "1" }), /bypasses/u);
    assert.equal(config({ ...testEnv, [name]: "1" }).DEV_UNLOCK_ALL, false);
  }
  assert.throws(() => appConfig({ ...testEnv, EXPO_PUBLIC_ENABLE_NATIVE_IAP: "0" }), /native IAP/u);
  assert.throws(() => appConfig({ ...testEnv, EXPO_PUBLIC_REVENUECAT_TEST_KEY: googleKey }), /public SDK key/u);
  for (const name of ["EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY", "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY"]) {
    assert.throws(() => appConfig({ EAS_BUILD_PROFILE: "production", [name]: testKey }), /platform RevenueCat/u);
  }
});

function service({ env = testEnv, platform = "android", isDevelopment = true, extra = {} } = {}) {
  const calls = [];
  const messages = [];
  const sdk = { configure: (options) => calls.push(options), setLogLevel() {} };
  const result = load("services/revenueCat.ts", {
    "react-native-purchases": { __esModule: true, default: sdk, LOG_LEVEL: { WARN: "warn", ERROR: "error" } },
    "react-native": { Platform: { OS: platform } },
    "expo-constants": { expoConfig: { extra } },
    "../lib/paywall/config": config(env, isDevelopment),
  }, { __DEV__: isDevelopment, process: { env }, console: { warn: (message) => messages.push(message), error: (message) => messages.push(message) } });
  return { ...result, calls, messages };
}

test("le SDK utilise exclusivement la clé Test Store explicite et configure une seule fois", () => {
  const instance = service({ env: { ...testEnv, EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googleKey }, extra: { revenueCatTestStore: { profile: "iapTest", apiKey: testKey } } });
  assert.equal(instance.configureRevenueCat(), true);
  assert.equal(instance.configureRevenueCat(), true);
  assert.equal(instance.calls.length, 1);
  assert.equal(instance.calls[0].apiKey, testKey);
});

test("clé absente, mauvais préfixe, mauvais profil ou JS release : aucun SDK d'achat configuré", () => {
  for (const options of [
    {},
    { extra: { revenueCatTestStore: { profile: "iapTest", apiKey: googleKey } } },
    { extra: { revenueCatTestStore: { profile: "production", apiKey: testKey } } },
    { isDevelopment: false, extra: { revenueCatTestStore: { profile: "iapTest", apiKey: testKey } } },
    { env: { EXPO_PUBLIC_REVENUECAT_TEST_KEY: testKey } },
    { env: { EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: testKey } },
  ]) {
    const instance = service(options);
    assert.equal(instance.configureRevenueCat(), false);
    assert.equal(instance.calls.length, 0);
    assert.equal(instance.messages.join("").includes(testKey), false);
    assert.equal(instance.messages.join("").includes(googleKey), false);
  }
});

test("les plateformes de production gardent leurs clés et produits existants", () => {
  const env = { ...eas.build.production.env, EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googleKey, EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: appleKey, EXPO_PUBLIC_REVENUECAT_TEST_KEY: testKey };
  for (const [platform, expected] of [["android", googleKey], ["ios", appleKey]]) {
    const instance = service({ env, platform, isDevelopment: false });
    assert.equal(instance.configureRevenueCat(), true);
    assert.equal(instance.calls[0].apiKey, expected);
  }
  const production = config(env, false);
  assert.equal(production.SUBSCRIPTION_PRODUCT_IDS.monthly, "kapp_premium_monthly");
  assert.equal(production.SUBSCRIPTION_PRODUCT_IDS.yearly, "kapp_premium_yearly");
  assert.equal(production.DEV_UNLOCK_ALL, false);
  assert.equal(production.ENABLE_NATIVE_IAP, true);
});

const storePackage = (id) => ({ identifier: `$rc_${id}`, product: { identifier: id, priceString: "7,99 €" } });
const monthly = storePackage("monthly");
const yearly = storePackage("yearly");
const offering = { monthly, annual: yearly, availablePackages: [yearly, monthly] };
const info = (active = false, expiration = Date.now() + 300_000) => ({
  entitlements: { active: active ? { premium_all_access: { isActive: true, expirationDateMillis: expiration, productIdentifier: "monthly", willRenew: true } } : {} },
  activeSubscriptions: active ? ["monthly"] : [],
});

test("Test Store utilise default et ses produits sans accepter ceux de Google Play", () => {
  const testLogic = logic();
  const productionLogic = logic(config({}));
  const other = { ...offering, identifier: "other" };
  assert.equal(testLogic.selectSubscriptionOffering({ all: { default: offering }, current: other }), offering);
  assert.equal(testLogic.selectSubscriptionOffering({ all: {}, current: other }), null);
  assert.equal(productionLogic.selectSubscriptionOffering({ all: { default: offering }, current: other }), other);
  const mapped = testLogic.mapSubscriptionPackages({ ...offering, monthly: yearly, annual: monthly });
  assert.equal(mapped.monthly, monthly);
  assert.equal(mapped.yearly, yearly);
  assert.equal(Object.keys(productionLogic.mapSubscriptionPackages(offering)).length, 0);
  assert.equal(Object.keys(testLogic.mapSubscriptionPackages({ monthly: null, annual: null, availablePackages: [storePackage("kapp_premium_monthly")] })).length, 0);
});

test("Test Store refuse un entitlement périmé, inactif ou absent même avec un produit acheté", () => {
  const testLogic = logic();
  const now = Date.now();
  assert.equal(testLogic.hasActivePremiumEntitlement(info(true, now), now), false);
  assert.equal(testLogic.deriveRevenueCatEntitlement(info(true, now - 1), now).hasAccess, false);
  assert.equal(testLogic.hasActivePremiumEntitlement(info(true, now + 1), now), true);
  assert.equal(testLogic.hasActivePremiumEntitlement(info(true, null), now), true);
  const inactive = info(true);
  inactive.entitlements.active.premium_all_access.isActive = false;
  assert.equal(testLogic.hasActivePremiumEntitlement(inactive), false);
  assert.equal(testLogic.hasActivePremiumEntitlement({ ...info(), activeSubscriptions: ["monthly"] }), false);
  // Preserve production's RevenueCat grace-period policy.
  assert.equal(logic(config({})).hasActivePremiumEntitlement(info(true, now - 1), now), true);
});

async function provider({ initial = info(), offerings = { current: offering, all: { default: offering } }, configured = true } = {}) {
  const hook = createHookHarness();
  let currentInfo = initial;
  let now = Date.now();
  class Clock extends Date { static now() { return now; } }
  const timers = new Map();
  let nextTimer = 0;
  const calls = { purchases: [], invalidations: 0 };
  let listener;
  let appStateListener;
  const sdk = {
    async getCustomerInfo() { return currentInfo; },
    async getOfferings() { return offerings; },
    async invalidateCustomerInfoCache() { calls.invalidations++; },
    async purchasePackage(selected) { calls.purchases.push(selected); return { customerInfo: currentInfo }; },
    async restorePurchases() { return currentInfo; },
    addCustomerInfoUpdateListener(callback) { listener = callback; },
    removeCustomerInfoUpdateListener(callback) { assert.equal(callback, listener); listener = undefined; },
  };
  const configuration = config();
  const loaded = load("lib/paywall/PaywallProvider.tsx", {
    react: hook.react,
    "react-native": { Linking: {}, AppState: { currentState: "active", addEventListener(_event, callback) { appStateListener = callback; return { remove() {} }; } } },
    "react-native-purchases": sdk,
    "../../services/revenueCat": { configureRevenueCat: () => configured },
    "../../services/revenueCatIdentity": { synchronizeRevenueCatIdentity: async () => null },
    "../AuthProvider": { useAuth: () => ({ user: null }) },
    "./config": configuration,
    "./entitlements": { createDeveloperEntitlement: () => { throw new Error("Unexpected bypass"); } },
    "./revenueCatLogic": logic(configuration, { Date: Clock }),
  }, {
    Date: Clock,
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  }, "\nexports.StorePaywallProvider = StorePaywallProvider;");
  const render = () => hook.render(loaded.StorePaywallProvider);
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  render();
  await flush();
  render();
  return {
    render, flush, sdk, calls, timers,
    setInfo(value) { currentInfo = value; },
    emit(value) { currentInfo = value; listener(value); },
    appState(value) { appStateListener(value); },
    advance(ms) { now += ms; },
    cleanup() { hook.cleanup(); assert.equal(timers.size, 0); },
  };
}

test("le fournisseur reste verrouillé avant achat, achète le mensuel et ne déverrouille que sur entitlement", async () => {
  const p = await provider();
  try {
    assert.equal(p.render().hasPremiumAccess, false);
    assert.equal(p.render().isDeveloperUnlocked, false);
    assert.equal(await p.render().subscribeMonthly(), false);
    assert.equal(p.render().error.code, "entitlement-not-granted");
    assert.equal(p.render().hasPremiumAccess, false);
    p.setInfo(info(true));
    assert.equal(await p.render().subscribeMonthly(), true);
    assert.equal(p.calls.purchases.at(-1), monthly);
    assert.equal(p.render().hasPremiumAccess, true);
    assert.equal(p.render().entitlement.source, "store");
    assert.equal(await p.render().subscribeYearly(), true);
    assert.equal(p.calls.purchases.at(-1), yearly);
  } finally { p.cleanup(); }
});

test("annulation, refus et paiement en attente ne donnent aucun accès; un nouvel achat reste possible", async () => {
  const p = await provider();
  try {
    for (const [failure, expected] of [[{ userCancelled: true, code: "1" }, null], [{ code: "2" }, "store-unavailable"], [{ code: "3" }, "purchase-not-allowed"], [{ code: "20" }, "payment-pending"]]) {
      p.sdk.purchasePackage = async () => { throw failure; };
      assert.equal(await p.render().subscribeMonthly(), false);
      assert.equal(p.render().hasPremiumAccess, false);
      assert.equal(p.render().error?.code ?? null, expected);
      assert.equal(p.render().isPurchasing, false);
    }
    p.sdk.purchasePackage = async () => ({ customerInfo: info(true) });
    assert.equal(await p.render().subscribeMonthly(), true);
    assert.equal(p.render().hasPremiumAccess, true);
  } finally { p.cleanup(); }
});

test("restauration : actif déverrouillé, absent ou expiré verrouillé, réseau en erreur sans accès", async () => {
  const p = await provider();
  try {
    p.setInfo(info(true));
    assert.equal(await p.render().restorePurchases(), true);
    assert.equal(p.render().hasPremiumAccess, true);
    for (const restored of [info(), info(true, 1)]) {
      p.setInfo(restored);
      assert.equal(await p.render().restorePurchases(), false);
      assert.equal(p.render().hasPremiumAccess, false);
      assert.equal(p.render().error.code, "no-purchases-found");
    }
    p.sdk.restorePurchases = async () => { throw { code: "10" }; };
    assert.equal(await p.render().restorePurchases(), false);
    assert.equal(p.render().hasPremiumAccess, false);
    assert.equal(p.render().isRestoring, false);
  } finally { p.cleanup(); }
});

test("expiration au premier plan : accès retiré même si le rafraîchissement réseau échoue", async () => {
  const p = await provider({ initial: info(true, Date.now() + 1_000) });
  try {
    assert.equal(p.render().hasPremiumAccess, true);
    p.sdk.getCustomerInfo = async () => { throw { code: "10" }; };
    p.advance(2_000);
    const timer = [...p.timers.values()][0];
    assert.ok(timer);
    timer.callback();
    await p.flush();
    assert.equal(p.render().hasPremiumAccess, false);
    assert.ok(p.calls.invalidations >= 2);
  } finally { p.cleanup(); }
});

test("retour au premier plan et listener réconcilient expiration puis renouvellement", async () => {
  const p = await provider({ initial: info(true, Date.now() + 1_000) });
  try {
    p.appState("background");
    p.advance(2_000);
    p.setInfo(info());
    p.appState("active");
    assert.equal(p.render().hasPremiumAccess, false);
    await p.flush();
    assert.equal(p.render().hasPremiumAccess, false);
    p.emit(info(true, Date.now() + 300_000));
    assert.equal(p.render().hasPremiumAccess, true);
    p.emit(info());
    assert.equal(p.render().hasPremiumAccess, false);
  } finally { p.cleanup(); }
});

test("configuration et offering manquants échouent sans achat ni déverrouillage", async () => {
  for (const options of [{ configured: false }, { offerings: { current: offering, all: {} } }, { offerings: { current: null, all: { default: { availablePackages: [] } } } }]) {
    const p = await provider(options);
    try {
      assert.equal(p.render().hasPremiumAccess, false);
      assert.ok(p.render().error);
      assert.equal(await p.render().subscribeMonthly(), false);
      assert.equal(p.calls.purchases.length, 0);
    } finally { p.cleanup(); }
  }
});

test("un contenu verrouillé ouvre le paywall, puis devient accessible après entitlement", () => {
  let hasPremiumAccess = false;
  const pushed = [];
  let allowed = 0;
  const hook = createHookHarness();
  const access = load("lib/paywall/access.tsx", {
    react: hook.react,
    "expo-router": { router: { push: (route) => pushed.push(route) } },
    "./PaywallProvider": { usePaywall: () => ({ hasPremiumAccess, isReady: true }) },
  });
  assert.equal(hook.render(access.usePremiumAccess).requirePremiumAccess(() => allowed++), false);
  assert.deepEqual(pushed, ["/premium"]);
  assert.equal(allowed, 0);
  hasPremiumAccess = true;
  assert.equal(hook.render(access.usePremiumAccess).requirePremiumAccess(() => allowed++), true);
  assert.equal(allowed, 1);
  hasPremiumAccess = false;
  assert.equal(hook.render(access.usePremiumAccess).requirePremiumAccess(() => allowed++), false);
  assert.equal(allowed, 1);
  hook.cleanup();
});

test("le lanceur Metro résout le CLI Expo installé", () => {
  assert.ok(createRequire(import.meta.url).resolve("expo/bin/cli"));
});
