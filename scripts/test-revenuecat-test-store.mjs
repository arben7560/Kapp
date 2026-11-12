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
    assert.throws(() => appConfig({ ...eas.build.production.env, EAS_BUILD_PROFILE: "production", [name]: testKey }), /platform RevenueCat/u);
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
  }, { __DEV__: isDevelopment, process: { env }, console: { info: (message) => messages.push(message), warn: (message) => messages.push(message), error: (message) => messages.push(message) } });
  return { ...result, calls, messages, sdk };
}

test("les diagnostics distinguent profil, manifeste, clé et SDK sans divulguer les valeurs", () => {
  const cases = [
    [{ env: { EXPO_PUBLIC_REVENUECAT_TEST_KEY: testKey } }, "platform-key-missing-use-iapTest-launcher-for-test-store"],
    [{}, "test-manifest-missing-restart-iapTest-metro"],
    [{ extra: { revenueCatTestStore: { profile: "iapTest" } } }, "test-key-missing-in-manifest"],
    [{ env: { EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googleKey }, extra: { revenueCatTestStore: { profile: "iapTest", apiKey: testKey } } }, "bundle-manifest-mismatch-restart-iapTest-metro"],
    [{ extra: { revenueCatTestStore: { profile: "iapTest", apiKey: googleKey } } }, "key-prefix-mismatch"],
  ];
  for (const [options, reason] of cases) {
    const instance = service(options);
    assert.equal(instance.configureRevenueCat(), false);
    assert.ok(instance.messages.some(message => message.includes(reason)));
    assert.equal(instance.calls.length, 0);
    for (const key of [testKey, googleKey]) assert.equal(instance.messages.join("").includes(key), false);
  }
  const instance = service({ extra: { revenueCatTestStore: { profile: "iapTest", apiKey: testKey } } });
  instance.sdk.configure = () => { throw new Error(testKey); };
  assert.throws(() => instance.configureRevenueCat());
  assert.ok(instance.messages.some(message => message.includes("sdk-configure-threw")));
  assert.equal(instance.messages.join("").includes(testKey), false);
  const production = service({ isDevelopment: false, env: { EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googleKey } });
  assert.equal(production.configureRevenueCat(), true);
  assert.equal(production.messages.length, 0);
});

function runLauncher({ env = {}, dotenvKey = testKey, args = [], deliveredKey = dotenvKey } = {}) {
  const messages = [];
  const calls = [];
  const events = [];
  const fakeProcess = { env: { ...env }, argv: ["node", "launcher", ...args], execPath: "node", exit(code) { throw { exitCode: code }; } };
  const dependencies = {
    "node:child_process": { spawn(command, args, options) { calls.push({ command, args, options }); return { on() {} }; } },
    "node:path": { resolve: () => "project-root" },
    "../eas.json": eas,
    "../app.json": JSON.parse(read("app.json")),
    "@expo/env": { loadProjectEnv(_root, options) {
      events.push("dotenv");
      assert.equal(options.mode, "development");
      assert.equal(options.silent, true);
      assert.equal(fakeProcess.env.EXPO_PUBLIC_REVENUECAT_STORE, "test");
      fakeProcess.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY ??= dotenvKey;
    } },
    "@expo/config": { getConfig() { events.push("config"); return { exp: { extra: { revenueCatTestStore: { apiKey: deliveredKey } } } }; } },
  };
  const require = Object.assign((name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected launcher dependency: ${name}`);
    return dependencies[name];
  }, { resolve: () => "expo-cli" });
  let exitCode;
  try {
    vm.runInNewContext(read("scripts/start-iap-test.cjs"), {
      require, __dirname: "scripts", process: fakeProcess,
      console: { info: message => messages.push(message), error: message => messages.push(message) },
    });
  } catch (error) {
    if (typeof error.exitCode !== "number") throw error;
    exitCode = error.exitCode;
  }
  assert.equal(messages.join("").includes(testKey), false);
  return { messages, calls, events, exitCode };
}

test("le lanceur charge dotenv avant la configuration et transmet le profil à Metro", () => {
  const result = runLauncher({ env: { EXPO_PUBLIC_REVENUECAT_STORE: "platform", EXPO_PUBLIC_DEV_UNLOCK_ALL: "1" } });
  assert.deepEqual(result.events, ["dotenv", "config"]);
  assert.equal(result.calls.length, 1);
  const { args, options } = result.calls[0];
  assert.equal(options.env.EXPO_PUBLIC_REVENUECAT_STORE, "test");
  assert.equal(options.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY, testKey);
  assert.equal(options.env.EXPO_PUBLIC_DEV_UNLOCK_ALL, "0");
  assert.equal(options.env.EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS, "0");
  assert.equal(args[args.indexOf("--scheme") + 1], "kapp");
  const check = runLauncher({ args: ["--check"] });
  assert.equal(check.exitCode, 0);
  assert.equal(check.calls.length, 0);
});

test("le lanceur arrête les configurations incomplètes avant d'ouvrir Metro", () => {
  for (const options of [
    { dotenvKey: "" },
    { dotenvKey: googleKey },
    { env: { EXPO_NO_DOTENV: "1" } },
    { env: { EXPO_NO_CLIENT_ENV_VARS: "1" } },
    { deliveredKey: "" },
  ]) {
    const result = runLauncher(options);
    assert.equal(result.exitCode, 1);
    assert.equal(result.calls.length, 0);
    assert.equal(result.messages.join("").includes(googleKey), false);
  }
});

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
  entitlements: { all: {}, active: active ? { premium_all_access: { isActive: true, store: "TEST_STORE", expirationDateMillis: expiration, productIdentifier: "monthly", willRenew: true } } : {} },
  activeSubscriptions: active ? ["monthly"] : [],
  allPurchasedProductIdentifiers: active ? ["monthly"] : [],
});

test("les invités, y compris Supabase anonymous, ne peuvent jamais acheter ni restaurer", async () => {
  for (const user of [null, { id: "guest-uuid", is_anonymous: true }]) {
    const p = await provider({ user, initial: info(true) });
    try {
      assert.equal(p.render().hasPremiumAccess, false);
      assert.equal(await p.render().subscribeMonthly(), false);
      assert.equal(await p.render().restorePurchases(), false);
      assert.equal(p.render().error.code, "authentication-required");
      assert.equal(p.calls.purchases.length, 0);
      assert.equal(p.calls.restores, 0);
    } finally { p.cleanup(); }
  }
});

test("une politique de transfert non vérifiée bloque les mutations mais conserve les droits existants", async () => {
  const p = await provider({ policyVerified: false, initial: info(true) });
  try {
    assert.equal(p.render().hasPremiumAccess, true);
    assert.equal(await p.render().subscribeMonthly(), false);
    assert.equal(await p.render().restorePurchases(), false);
    assert.equal(p.render().error.code, "account-policy-unverified");
    assert.equal(p.calls.purchases.length, 0);
    assert.equal(p.calls.restores, 0);
  } finally { p.cleanup(); }
});

test("un abonné existant ne peut pas déclencher un second achat", async () => {
  const p = await provider({ initial: info(true) });
  try {
    assert.equal(await p.render().subscribeYearly(), true);
    assert.equal(p.calls.purchases.length, 0);
  } finally { p.cleanup(); }
});

for (const offerId of ["monthly", "yearly"]) {
  test(`achat Google Play ${offerId} : notification unique seulement après entitlement actif`, async () => {
    const storeOffer = { availablePackages: [storePackage("kapp_premium_monthly"), storePackage("kapp_premium_yearly")] };
    const p = await provider({ platformStore: true, offerings: { current: storeOffer } });
    const purchasedInfo = info(true);
    const active = purchasedInfo.entitlements.active.premium_all_access;
    active.store = "PLAY_STORE";
    active.productIdentifier = `kapp_premium_${offerId}`;
    active.willRenew = true;
    try {
      assert.equal(p.render().takePurchaseNotice(), null);
      p.sdk.purchasePackage = async (selected) => {
        p.calls.purchases.push(selected);
        p.setInfo(purchasedInfo);
        return { customerInfo: purchasedInfo };
      };
      const beforePurchase = p.calls.invalidations;
      assert.equal(await p.render().subscribe(offerId), true);
      assert.equal(p.calls.purchases[0].product.identifier, `kapp_premium_${offerId}`);
      assert.equal(p.render().hasPremiumAccess, true);
      await p.render().refreshSubscription();
      assert.equal(p.calls.invalidations, beforePurchase, "Account reuses the purchase response");
      assert.equal(p.render().takePurchaseNotice().userId, "account-a");
      assert.equal(p.render().takePurchaseNotice(), null);
      assert.equal(await p.render().subscribe(offerId), true);
      assert.equal(p.calls.purchases.length, 1, "existing subscribers do not repurchase");
      assert.equal(p.render().takePurchaseNotice(), null);
    } finally { p.cleanup(); }
  });
}

test("aucune notification après annulation, refus, attente, entitlement absent ou restauration", async () => {
  const p = await provider();
  try {
    for (const code of ["1", "2", "20"]) {
      p.sdk.purchasePackage = async () => { throw { code }; };
      assert.equal(await p.render().subscribeMonthly(), false);
      assert.equal(p.render().takePurchaseNotice(), null);
    }
    p.sdk.purchasePackage = async () => ({ customerInfo: info() });
    assert.equal(await p.render().subscribeMonthly(), false);
    assert.equal(p.render().takePurchaseNotice(), null);
    p.sdk.restorePurchases = async () => info(true);
    assert.equal(await p.render().restorePurchases(), true);
    assert.equal(p.render().takePurchaseNotice(), null);
  } finally { p.cleanup(); }
});

test("notification perdue au changement de compte et absente au redémarrage avec abonnement", async () => {
  const p = await provider();
  try {
    p.sdk.purchasePackage = async () => ({ customerInfo: info(true) });
    assert.equal(await p.render().subscribeMonthly(), true);
    p.setUser({ id: "account-b", is_anonymous: false });
    p.render();
    await p.flush();
    assert.equal(p.render().takePurchaseNotice(), null);
  } finally { p.cleanup(); }
  const restarted = await provider({ initial: info(true) });
  try {
    assert.equal(restarted.render().hasPremiumAccess, true);
    assert.equal(restarted.render().takePurchaseNotice(), null);
    assert.equal(restarted.calls.invalidations, 1, "startup forces a fresh read");
  } finally { restarted.cleanup(); }
});

test("Account : lectures récentes partagées, nouvelle ouverture actualisée et concurrence dédupliquée", async () => {
  const p = await provider({ initial: info(true) });
  try {
    const initial = p.calls.invalidations;
    await p.render().refreshSubscription();
    assert.equal(p.calls.invalidations, initial);
    p.advance(5_001);
    p.setInfo(info());
    await Promise.all([p.render().refreshSubscription(), p.render().refreshSubscription()]);
    assert.equal(p.calls.invalidations, initial + 1);
    assert.equal(p.render().hasPremiumAccess, false);
  } finally { p.cleanup(); }
});

test("déconnexion immédiate, nouveau compte verrouillé, puis reconnexion au même UUID", async () => {
  const p = await provider({ initial: info(true) });
  try {
    assert.equal(p.render().hasPremiumAccess, true);
    p.setUser(null);
    assert.equal(p.render().hasPremiumAccess, false);
    assert.equal(p.render().customerInfo, null);
    await p.flush();
    assert.equal(p.calls.logouts, 1);
    p.setInfo(info());
    p.setUser({ id: "account-b", is_anonymous: false });
    assert.equal(p.render().hasPremiumAccess, false);
    await p.flush();
    assert.equal(p.sdkIdentity(), "account-b");
    assert.equal(p.render().hasPremiumAccess, false);
    p.setInfo(info(true));
    p.setUser({ id: "account-a", is_anonymous: false });
    assert.equal(p.render().hasPremiumAccess, false);
    await p.flush();
    assert.equal(p.sdkIdentity(), "account-a");
    assert.equal(p.render().hasPremiumAccess, true);
    assert.equal(p.calls.restores, 0);
  } finally { p.cleanup(); }
});

test("une réponse retardée du compte A n’accorde aucun droit au compte B", async () => {
  const p = await provider({ initial: info(true) });
  let resolveRead;
  try {
    let first = true;
    p.sdk.getCustomerInfo = () => first
      ? (first = false, new Promise((resolve) => { resolveRead = resolve; }))
      : Promise.resolve(info());
    const refresh = p.render().refreshEntitlements();
    await p.flush();
    p.setUser({ id: "account-b", is_anonymous: false });
    assert.equal(p.render().hasPremiumAccess, false);
    resolveRead(info(true));
    await refresh;
    await p.flush();
    assert.equal(p.render().hasPremiumAccess, false);
    assert.equal(p.sdkIdentity(), "account-b");
  } finally { p.cleanup(); }
});

test("changement de compte pendant achat : pas de login concurrent ni droit appliqué au nouveau compte", async () => {
  const p = await provider();
  let completePurchase;
  try {
    p.sdk.purchasePackage = () => new Promise((resolve) => { completePurchase = resolve; });
    const purchase = p.render().subscribeMonthly();
    await p.flush();
    assert.equal(p.sdkIdentity(), "account-a");
    assert.equal(await p.render().subscribeYearly(), false);
    assert.equal(await p.render().restorePurchases(), false);
    p.setUser({ id: "account-b", is_anonymous: false });
    assert.equal(p.render().hasPremiumAccess, false);
    await p.flush();
    assert.equal(p.sdkIdentity(), "account-a");
    completePurchase({ customerInfo: info(true) });
    assert.equal(await purchase, false);
    await p.flush();
    assert.equal(p.sdkIdentity(), "account-b");
    assert.equal(p.render().hasPremiumAccess, false);
  } finally { p.cleanup(); }
});

test("un échec d’identification interdit achat et lecture des droits du précédent utilisateur", async () => {
  const p = await provider({ initial: info(true) });
  try {
    p.sdk.logIn = async () => { throw { code: "10" }; };
    p.setUser({ id: "account-b", is_anonymous: false });
    p.render();
    await p.flush();
    assert.equal(p.render().hasPremiumAccess, false);
    assert.equal(await p.render().subscribeMonthly(), false);
    assert.equal(p.calls.purchases.length, 0);
    assert.equal(p.render().error.code, "network-unavailable");
  } finally { p.cleanup(); }
});

test("réseau indisponible avant expiration : conserver les droits du même compte", async () => {
  const p = await provider({ initial: info(true) });
  try {
    p.sdk.getCustomerInfo = async () => { throw { code: "10" }; };
    await p.render().refreshEntitlements();
    assert.equal(p.render().hasPremiumAccess, true);
    assert.equal(p.render().error.code, "network-unavailable");
  } finally { p.cleanup(); }
});

test("un événement SDK identique après getCustomerInfo ne provoque pas de boucle réseau", async () => {
  const current = info(true);
  const p = await provider({ initial: current });
  try {
    const before = p.calls.invalidations;
    p.emit(JSON.parse(JSON.stringify(current)));
    await p.flush();
    assert.equal(p.calls.invalidations, before);
  } finally { p.cleanup(); }
});

test("restauration appartenant à un autre compte : message explicite sans accès", async () => {
  const p = await provider();
  try {
    for (const code of ["7", "13"]) {
      p.sdk.restorePurchases = async () => { throw { code }; };
      assert.equal(await p.render().restorePurchases(), false);
      assert.equal(p.render().error.code, "purchase-owned-by-another-account");
      assert.equal(p.render().hasPremiumAccess, false);
    }
  } finally { p.cleanup(); }
});

test("les achats anonymes historiques ne sont ni fusionnés ni restaurés implicitement", async () => {
  const calls = [];
  const identity = load("services/revenueCatIdentity.ts", { "react-native-purchases": {
    getAppUserID: async () => "$RCAnonymousID:legacy",
    getCustomerInfo: async () => ({ ...info(true), entitlements: { all: { premium_all_access: {} } } }),
    logIn: async () => { calls.push("login"); },
    restorePurchases: async () => { calls.push("restore"); },
  } });
  await assert.rejects(identity.synchronizeRevenueCatIdentity({ id: "account-a", is_anonymous: false }),
    (error) => error.code === "legacy-anonymous-purchases");
  assert.deepEqual(calls, []);
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
  // Expiration applies in every environment; a grace extension must come from RevenueCat.
  assert.equal(logic(config({})).hasActivePremiumEntitlement(info(true, now - 1), now), false);
});

async function provider({ initial = info(), offerings = { current: offering, all: { default: offering } }, configured = true, user = { id: "account-a", is_anonymous: false }, policyVerified = true, platformStore = false } = {}) {
  const hook = createHookHarness();
  let currentInfo = initial;
  let now = Date.now();
  class Clock extends Date { static now() { return now; } }
  const timers = new Map();
  let nextTimer = 0;
  const calls = { purchases: [], invalidations: 0, logins: [], logouts: 0, restores: 0, management: [] };
  let authUser = user;
  let sdkUserId = user?.is_anonymous || !user ? "$RCAnonymousID:guest" : user.id;
  let listener;
  let appStateListener;
  const sdk = {
    async getCustomerInfo() { return currentInfo; },
    async getAppUserID() { return sdkUserId; },
    async logIn(id) { calls.logins.push(id); sdkUserId = id; return { customerInfo: currentInfo }; },
    async logOut() { calls.logouts++; sdkUserId = "$RCAnonymousID:guest"; return info(); },
    async getOfferings() { return offerings; },
    async invalidateCustomerInfoCache() { calls.invalidations++; },
    async purchasePackage(selected) { calls.purchases.push(selected); return { customerInfo: currentInfo }; },
    async restorePurchases() { calls.restores++; return currentInfo; },
    addCustomerInfoUpdateListener(callback) { listener = callback; },
    removeCustomerInfoUpdateListener(callback) { assert.equal(callback, listener); listener = undefined; },
  };
  const configuration = platformStore ? config({}) : config();
  configuration.ACCOUNT_PURCHASE_POLICY_VERIFIED = policyVerified;
  const loaded = load("lib/paywall/PaywallProvider.tsx", {
    react: hook.react,
    "react-native": { Linking: { async openURL(url) { calls.management.push(url); } }, AppState: { currentState: "active", addEventListener(_event, callback) { appStateListener = callback; return { remove() {} }; } } },
    "react-native-purchases": sdk,
    "../../services/revenueCat": { configureRevenueCat: () => configured },
    "../../services/revenueCatIdentity": load("services/revenueCatIdentity.ts", { "react-native-purchases": sdk }),
    "../AuthProvider": { useAuth: () => ({ user: authUser, isLoading: false }) },
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
    setUser(value) { authUser = value; },
    sdkIdentity() { return sdkUserId; },
    emit(value) { currentInfo = value; listener(value); },
    appState(value) { appStateListener(value); },
    advance(ms) { now += ms; },
    cleanup() { hook.cleanup(); assert.equal(timers.size, 0); },
  };
}

test("Google Play : ouverture sans résiliation locale, retour vérifié, cache ancien et réseau sans confirmation", async () => {
  const startedAt = Date.now();
  const customer = (cancelled = false, requestOffset = 0) => {
    const value = info(true);
    const entitlement = { ...value.entitlements.active.premium_all_access,
      store: "PLAY_STORE", productIdentifier: "kapp_premium_monthly",
      willRenew: !cancelled, unsubscribeDetectedAt: cancelled ? new Date(startedAt).toISOString() : null,
    };
    return { ...value, requestDate: new Date(startedAt + requestOffset).toISOString(),
      entitlements: { active: { premium_all_access: entitlement }, all: { premium_all_access: entitlement } } };
  };
  const platformOffer = { availablePackages: [{ product: {
    identifier: "kapp_premium_monthly", subscriptionPeriod: "P1M", priceString: "7,99 €",
  } }] };
  const p = await provider({ platformStore: true, initial: customer(), offerings: { current: platformOffer } });
  try {
    await p.render().openSubscriptionManagement();
    assert.equal(p.calls.management[0], "https://play.google.com/store/account/subscriptions?sku=kapp_premium_monthly&package=com.arben60.kapp");
    assert.equal(p.render().hasPremiumAccess, true);
    assert.equal(p.render().entitlement.willAutoRenew, true);
    p.appState("background");
    p.setInfo(customer(true, 1000));
    p.appState("active");
    assert.equal(p.render().managementReturnStatus, "checking");
    await p.flush();
    assert.equal(p.render().managementReturnStatus, "verified");
    assert.equal(p.render().entitlement.willAutoRenew, false);
    assert.equal(p.render().hasPremiumAccess, true);
    assert.ok(p.calls.invalidations > 0);

    // Returning with unchanged cached data does not confirm any new action.
    await p.render().openSubscriptionManagement();
    p.appState("background"); p.appState("active"); await p.flush();
    assert.equal(p.render().managementReturnStatus, "unconfirmed");
    assert.equal(p.render().hasPremiumAccess, true);

    await p.render().openSubscriptionManagement();
    p.appState("background");
    p.sdk.getCustomerInfo = async () => { throw { code: "10" }; };
    p.appState("active"); await p.flush();
    assert.equal(p.render().managementReturnStatus, "unconfirmed");
    assert.equal(p.render().error.code, "network-unavailable");
    assert.equal(p.render().hasPremiumAccess, true);

    // Account changes mask both the previous rights and management result.
    p.setUser({ id: "account-b", is_anonymous: false });
    assert.equal(p.render().managementReturnStatus, "idle");
    assert.equal(p.render().hasPremiumAccess, false);
    await p.flush();
  } finally { p.cleanup(); }
});

test("le fournisseur reste verrouillé avant achat, achète le mensuel et ne déverrouille que sur entitlement", async () => {
  const p = await provider();
  try {
    assert.equal(p.render().hasPremiumAccess, false);
    assert.equal(p.render().isDeveloperUnlocked, false);
    assert.equal(await p.render().subscribeMonthly(), false);
    assert.equal(p.render().error.code, "entitlement-not-granted");
    assert.equal(p.render().hasPremiumAccess, false);
    p.sdk.purchasePackage = async (selected) => { p.calls.purchases.push(selected); return { customerInfo: info(true) }; };
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
    assert.ok(p.calls.invalidations >= 1);
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
    await p.flush();
    assert.equal(p.render().hasPremiumAccess, true);
    p.emit(info());
    await p.flush();
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
    "./purchaseIntent": { premiumRoute: (returnTo) => ({ pathname: "/premium", params: { returnTo: returnTo ?? "" } }) },
  });
  assert.equal(hook.render(access.usePremiumAccess).requirePremiumAccess(() => allowed++), false);
  assert.deepEqual(pushed, [{ pathname: "/premium", params: { returnTo: "" } }]);
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
