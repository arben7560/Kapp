import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { createHookHarness } from "./helpers/hook-harness.mjs";
import { subscriptionDetails } from "../lib/paywall/subscriptionDetails.ts";
import { hasActivePremiumEntitlement, mapSubscriptionPackages, subscriptionManagementURL, calculateAnnualOfferMetrics } from "../lib/paywall/revenueCatLogic.ts";
import * as config from "../lib/paywall/config.ts";

const now = Date.now();
const iso = (offset) => new Date(now + offset).toISOString();
const entitlement = {
  identifier: "premium_all_access", isActive: true, store: "PLAY_STORE",
  productIdentifier: "kapp_premium_monthly", productPlanIdentifier: "monthly-plan",
  expirationDateMillis: now + 60_000, willRenew: true, periodType: "NORMAL",
  unsubscribeDetectedAt: null, billingIssueDetectedAt: null,
};
function info(ent = {}, sub = {}) {
  const premium = { ...entitlement, ...ent };
  return {
    entitlements: { all: { premium_all_access: premium }, active: premium.isActive ? { premium_all_access: premium } : {} },
    subscriptionsByProductIdentifier: { kapp_premium_monthly: {
      productIdentifier: "kapp_premium_monthly", productPlanIdentifier: "monthly-plan",
      gracePeriodExpiresDate: null, autoResumeDate: null, ...sub,
    } }, managementURL: null,
  };
}
const packages = { monthly: { product: { identifier: "kapp_premium_monthly:monthly-plan", subscriptionPeriod: "P1M", priceString: "8,99 €" } } };

test("états réels : actif, essai, résilié, expiré, grâce, paiement, suspension, indisponible", () => {
  const cases = [
    [info(), "active", true],
    [info({ periodType: "TRIAL" }), "trial", true],
    [info({ willRenew: false, unsubscribeDetectedAt: iso(-1000) }), "cancelled", true],
    [info({ isActive: false, expirationDateMillis: now - 1 }), "expired", false],
    [info({ expirationDateMillis: now - 1, billingIssueDetectedAt: iso(-1000) }, { gracePeriodExpiresDate: iso(60_000) }), "grace", true],
    [info({ isActive: false, billingIssueDetectedAt: iso(-1000) }), "billingIssue", false],
    [info({ isActive: false }, { autoResumeDate: iso(60_000) }), "paused", false],
    [info({ expirationDateMillis: now - 1 }), "verifying", false],
    [null, "unavailable", false],
    [{ entitlements: { all: {}, active: {} } }, "free", false],
  ];
  for (const [customer, state, access] of cases) {
    const details = subscriptionDetails(customer, packages, now);
    assert.equal(details.state, state);
    assert.equal(details.hasAccess, access);
  }
});

test("résiliation : aucune date inventée, accès jusqu’à l’échéance, aucun renouvellement affiché", () => {
  const customer = info({ willRenew: false, unsubscribeDetectedAt: iso(-1000) });
  assert.equal(hasActivePremiumEntitlement(customer, now + 59_999), true);
  assert.equal(hasActivePremiumEntitlement(customer, now + 60_000), false);
  const details = subscriptionDetails(customer, packages, now);
  assert.equal(details.renewalAt, null);
  assert.equal(details.expiresAt, entitlement.expirationDateMillis);
});

test("la grâce ne dépasse jamais la date fournie par RevenueCat", () => {
  const customer = info({ expirationDateMillis: now - 1000 }, { gracePeriodExpiresDate: iso(30_000) });
  assert.equal(hasActivePremiumEntitlement(customer, now), true);
  assert.equal(hasActivePremiumEntitlement(customer, now + 30_001), false);
  assert.equal(hasActivePremiumEntitlement(info({ isActive: false }, { gracePeriodExpiresDate: iso(30_000) }), now), false);
});

test("dates absentes ou invalides et prépaiement ne deviennent pas une résiliation inventée", () => {
  const prepaid = subscriptionDetails(info({ willRenew: false, unsubscribeDetectedAt: null }), packages, now);
  assert.equal(prepaid.state, "active");
  const missing = subscriptionDetails(info({ expirationDateMillis: null, expirationDate: null }), packages, now);
  assert.equal(missing.expiresAt, null);
  assert.equal(subscriptionDetails(info({ expirationDateMillis: NaN, expirationDate: "invalid" }), packages, now).expiresAt, null);
  assert.equal(subscriptionDetails(info({ willRenew: false, unsubscribeDetectedAt: "invalid" }), packages, now).state, "active");
});

test("prix : seulement le produit et base plan correspondants, présenté comme tarif courant", () => {
  assert.equal(subscriptionDetails(info(), packages, now).currentPrice, "8,99 €");
  assert.equal(subscriptionDetails(info(), {}, now).currentPrice, undefined);
  assert.equal(subscriptionDetails(info(), {}, now).plan, "monthly");
  assert.equal(subscriptionDetails(info({ productPlanIdentifier: "old-plan" }), packages, now).currentPrice, undefined);
  assert.equal(subscriptionDetails(info(), packages, now).plan, "monthly");
});

test("packages Google Play : base plans distingués, mauvaise période et ambiguïté refusées", () => {
  const monthly = { product: { identifier: "kapp_premium_monthly:monthly-plan", subscriptionPeriod: "P1M" } };
  const wrongPeriod = { product: { identifier: "kapp_premium_yearly:wrong", subscriptionPeriod: "P1M" } };
  assert.equal(mapSubscriptionPackages({ availablePackages: [monthly, wrongPeriod] }).monthly, monthly);
  assert.equal(mapSubscriptionPackages({ availablePackages: [monthly, wrongPeriod] }).yearly, undefined);
  const duplicate = { product: { identifier: "kapp_premium_monthly:other", subscriptionPeriod: "P1M" } };
  assert.equal(mapSubscriptionPackages({ availablePackages: [monthly, duplicate] }).monthly, undefined);
});

test("gestion : priorité au lien RevenueCat, repli Google ciblé, aucun lien fictif", () => {
  const customer = info();
  assert.equal(subscriptionManagementURL(customer), "https://play.google.com/store/account/subscriptions?sku=kapp_premium_monthly&package=com.arben60.kapp");
  customer.managementURL = "https://play.google.com/store/account/subscriptions";
  assert.equal(subscriptionManagementURL(customer), customer.managementURL);
  const specificURL = "https://play.google.com/store/account/subscriptions?sku=historical-plan";
  assert.equal(subscriptionManagementURL(info({}, { managementURL: specificURL })), specificURL);
  assert.equal(subscriptionManagementURL(info({ store: "TEST_STORE" })), null);
  assert.equal(subscriptionManagementURL(info({ store: "PROMOTIONAL" })), null);
  assert.equal(hasActivePremiumEntitlement(info({ store: "TEST_STORE" }), now), false);
  assert.equal(subscriptionManagementURL(info({ store: "APP_STORE" })), "https://apps.apple.com/account/subscriptions");
});

test("résiliation réservée aux abonnements Store actifs et renouvelables, même en sandbox Google", () => {
  for (const store of ["PLAY_STORE", "APP_STORE"]) {
    assert.equal(subscriptionDetails(info({ store, isSandbox: true }), {}, now).canCancel, true);
    assert.equal(subscriptionDetails(info({ store, willRenew: false }), {}, now).canCancel, false);
    assert.equal(subscriptionDetails(info({ store, isActive: false }), {}, now).canCancel, false);
  }
  for (const store of ["TEST_STORE", "PROMOTIONAL", "UNKNOWN_STORE"]) {
    assert.equal(subscriptionDetails(info({ store }), {}, now).canCancel, false);
  }
});

function load(file, dependencies, globals = {}, expose = "") {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { fileName: file, compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true,
  } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output + expose, { module, exports: module.exports, __DEV__: true,
    require: (name) => { assert.ok(name in dependencies, name); return dependencies[name]; }, ...globals });
  return module.exports;
}
function intentStorage() {
  const storage = new Map();
  const api = load("lib/paywall/purchaseIntent.ts", { "@react-native-async-storage/async-storage": {
    getItem: async (key) => storage.get(key) ?? null,
    setItem: async (key, value) => { storage.set(key, value); },
    removeItem: async (key) => { storage.delete(key); },
  } });
  api.takePurchaseIntent = async () => {
    let intent = null;
    await api.resumePurchaseIntent((value) => { intent = value; return true; });
    return intent;
  };
  return { storage, api };
}

test("la formule et la destination survivent à l’authentification et à un redémarrage", async () => {
  const { storage, api } = intentStorage();
  for (const offerId of ["monthly", "yearly"]) {
    await api.savePurchaseIntent({ offerId, returnTo: "/lesson/cafeIA?mode=guided&mission=order", action: "purchase" });
    assert.equal(storage.size, 1);
    const restored = await api.takePurchaseIntent();
    assert.equal(restored.offerId, offerId);
    assert.equal(restored.returnTo, "/lesson/cafeIA?mode=guided&mission=order");
    assert.equal(await api.takePurchaseIntent(), null);
  }
  assert.equal(api.premiumDestination("/account"), "/account");
  for (const path of ["https://evil.test", "//evil.test", "/account?redirect=evil", "/premium", "/lesson/../../account"]) {
    assert.equal(api.premiumDestination(path), undefined);
  }
  assert.equal(api.parsePurchaseIntent({ offerId: "monthly", action: "purchase", createdAt: 0 }), null);
});

test("un écran quitté ne consomme pas le choix et deux retours concurrents ne naviguent qu’une fois", async () => {
  const { api } = intentStorage();
  await api.savePurchaseIntent({ offerId: "yearly", action: "purchase" });
  await api.resumePurchaseIntent(() => false);
  let navigations = 0;
  const resume = () => api.resumePurchaseIntent(() => { navigations++; return true; });
  await Promise.all([resume(), resume()]);
  assert.equal(navigations, 1);
});

for (const [offerId, index, label] of [["monthly", 0, "Choisir l’abonnement mensuel"], ["yearly", 1, "Choisir l’abonnement annuel"]]) {
test(`invité → modale → Google → confirmation explicite : ${offerId}, annulation sans achat ni navigation`, async () => {
  const { api } = intentStorage();
  let permanent = false;
  let params = { returnTo: "/voc/kdrama" };
  const pushes = [], replacements = [], purchased = [];
  let authResult = "cancelled", authCalls = 0;
  const makeScreen = () => {
    const hook = createHookHarness();
    const react = { ...hook.react, createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }) };
    const { Screen } = load("app/premium.tsx", {
      react,
      "@expo/vector-icons": { Ionicons: "Icon" }, "expo-linear-gradient": { LinearGradient: "Gradient" },
      "expo-router": { router: { push: (r) => pushes.push(r), replace: (r) => replacements.push(r), canGoBack: () => false }, useLocalSearchParams: () => params },
      "react-native": { ActivityIndicator: "Spinner", Platform: { OS: "android" }, Pressable: "Pressable", ScrollView: "Scroll", View: "View", StyleSheet: { create: (s) => s } },
      "react-native-safe-area-context": { SafeAreaView: "Safe" },
      "../components/app-text": { AppText: "Text" }, "../components/ui/app-back-button": { AppBackButton: "Back" },
      "../components/premium/PremiumActionButton": { PremiumActionButton: "Button" },
      "../components/ui/app-dialog": { AppDialog: "Dialog", DialogActions: "Actions" },
      "react-i18next": { useTranslation: () => ({ t: (key) => key, i18n: { language: "fr" } }) },
      "../lib/i18n/PremiumLocalizationProvider": {}, "../lib/i18n/VocabularyTextContext": { useVocabularyText: () => (x) => x },
      "../lib/i18n/premiumText": { resolvePremiumError: (x) => x }, "../lib/i18n/config": { DEFAULT_LOCALE: "fr", isAppLocale: () => true },
      "../lib/paywall/config": config, "../hooks/useResponsiveLayout": { useResponsiveLayout: () => ({ maxWidth: 620 }) },
      "../lib/paywall/PaywallProvider": { usePaywall: () => ({
        displayPrices: { monthly: "8,99 €", yearly: "79,99 €" }, error: null, hasPremiumAccess: false,
        isLoading: false, isPurchasing: false, isRestoring: false,
        subscriptions: {
          monthly: { product: { priceString: "8,99 €", price: 8.99, currencyCode: "EUR" } },
          yearly: { product: { priceString: "79,99 €", price: 79.99, currencyCode: "EUR" } },
        },
        subscribe: async (offerId) => { purchased.push(offerId); return true; },
      }) },
      "../lib/paywall/revenueCatLogic": { calculateAnnualOfferMetrics },
      "../lib/AuthProvider": { useAuth: () => ({ isPermanentAccount: permanent, isLoading: false,
        user: permanent ? { id: "account-a" } : null,
        signInWithOAuth: async (provider) => { assert.equal(provider, "google"); authCalls++; return authResult; },
      }) },
      "../lib/paywall/purchaseIntent": api,
    }, {}, "\nexports.Screen = PremiumScreenContent;");
    const nodes = (root) => root && typeof root === "object" ? [root, ...root.children.flatMap(nodes)] : [];
    return { hook, render: () => nodes(hook.render(Screen)) };
  };
  const before = makeScreen();
  before.render().filter((n) => n.props.accessibilityRole === "radio")[index].props.onPress();
  before.render().find((n) => n.props.label === label).props.onPress();
  await new Promise(setImmediate);
  assert.equal(purchased.length, 0);
  assert.equal(pushes.length, 0);
  assert.equal(authCalls, 0);
  assert.equal(before.render().find((n) => n.type === "Dialog").props.visible, true);
  before.render().find((n) => n.props.label === "authentication.cancel").props.onPress();
  assert.equal(before.render().find((n) => n.type === "Dialog").props.visible, false);
  assert.equal(await api.takePurchaseIntent(), null);
  before.render().find((n) => n.props.label === label).props.onPress();
  before.render().find((n) => n.props.label === "authentication.signIn").props.onPress();
  await new Promise(setImmediate);
  assert.equal(authCalls, 1);
  assert.equal(replacements.length, 0);
  assert.equal(await api.takePurchaseIntent(), null);
  authResult = "success";
  before.render().find((n) => n.props.label === label).props.onPress();
  before.render().find((n) => n.props.label === "authentication.signIn").props.onPress();
  await new Promise(setImmediate);
  assert.equal(replacements[0].pathname, "/account");
  before.hook.cleanup();
  const pending = await api.takePurchaseIntent();
  permanent = true;
  params = { offerId: pending.offerId, returnTo: pending.returnTo, action: pending.action };
  const after = makeScreen();
  after.render();
  await new Promise(setImmediate);
  assert.equal(purchased.length, 0);
  after.render().find((n) => n.props.label === label).props.onPress();
  await new Promise(setImmediate);
  assert.equal(purchased.length, 0);
  const confirmation = () => after.render().find((n) => n.type === "Dialog" && n.props.accessibilityLabel === "confirmation.title");
  assert.equal(confirmation().props.visible, true);
  assert.ok(after.render().some(n => n.type === "Text" && n.children.includes(index === 0 ? "8,99 €" : "79,99 €")));
  assert.ok(after.render().some(n => n.type === "Text" && n.children.includes(`confirmation.${offerId}`)));
  confirmation().props.onRequestClose();
  assert.equal(confirmation().props.visible, false);
  assert.equal(purchased.length, 0);
  after.render().find((n) => n.props.label === label).props.onPress();
  after.render().find((n) => n.props.label === "confirmation.continue").props.onPress();
  await new Promise(setImmediate);
  assert.deepEqual(purchased, [offerId]);
  assert.equal(replacements.at(-1), "/account");
  after.hook.cleanup();
});
}

test("Account : actions actives, confirmation native, résiliation vérifiée et expiration", async () => {
  const hook = createHookHarness();
  const react = { ...hook.react, createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }) };
  let customer = info();
  let managementReturnStatus = "idle", error = null, opened = 0, refreshed = 0;
  const pushes = [];
  const auth = { user: { id: "account-a", email: "test@example.com" }, isPermanentAccount: true, providers: ["google"], clearError() {}, clearAccountProtectionSuccess() {} };
  const refreshSubscription = async () => { refreshed++; };
  const paywall = () => ({ customerInfo: customer, subscriptions: packages, refreshSubscription,
    hasPremiumAccess: !!customer && hasActivePremiumEntitlement(customer),
    managementReturnStatus, error, clearError() {}, openSubscriptionManagement: async () => { opened++; },
  });
  const t = (key, options = {}) => key + (options.date ? ` ${options.date}` : "");
  const { Screen } = load("app/account/index.tsx", {
    react,
    "@expo/vector-icons": { Ionicons: "Icon" }, "expo-blur": { BlurView: "Blur" },
    "expo-linear-gradient": { LinearGradient: "Gradient" },
    "expo-router": { router: { push: (route) => pushes.push(route) }, useLocalSearchParams: () => ({}), useFocusEffect: (fn) => react.useEffect(fn, [fn]) },
    "react-native": { Platform: { OS: "android" }, View: "View", ScrollView: "Scroll", Pressable: "Pressable", KeyboardAvoidingView: "Keyboard", StyleSheet: { create: (s) => s } },
    "react-native-safe-area-context": { SafeAreaView: "Safe" },
    "../../_store": { useStore: () => ({}) },
    "../../components/application-language-settings": {}, "../../components/language-selection-screen": {},
    "../../components/app-text": { AppText: "Text", AppTextInput: "Input" },
    "../../components/account/AccountActionButton": { AccountActionButton: "Button" },
    "../../components/ui/app-back-button": { AppBackButton: "Back" },
    "../../components/ui/app-dialog": { AppDialog: "Dialog", DialogActions: "Actions" },
    "../../components/premium/SubscriptionDetails": { SubscriptionDetails: "Details" },
    "../../components/premium/PurchaseSuccessNotice": { PurchaseSuccessNotice: "Notice" },
    "react-i18next": { useTranslation: () => ({ i18n: { language: "fr", t } }) },
    "../../lib/i18n/AccountLocalizationProvider": {},
    "../../lib/i18n/VocabularyTextContext": { useVocabularyText: () => (s) => s },
    "../../lib/i18n/accountText": { resolveAccountError: (s) => s },
    "../../lib/i18n/premiumText": { resolvePremiumError: (s) => s },
    "../../lib/i18n/config": { DEFAULT_LOCALE: "fr", isAppLocale: () => true },
    "../../constants/theme": { SeoulMidnightGlass: { colors: {}, radii: {} } },
    "../../hooks/useResponsiveLayout": { useResponsiveLayout: () => ({ maxWidth: 760 }) },
    "../../lib/AuthProvider": { useAuth: () => auth }, "../../lib/accountProtectionPromptStorage": {},
    "../../lib/authErrors": {}, "../../lib/ProgressSyncProvider": { useProgressSync: () => ({ status: "synced" }) },
    "../../lib/paywall/PaywallProvider": { usePaywall: paywall },
    "../../lib/paywall/subscriptionDetails": { subscriptionDetails },
    "../../lib/paywall/purchaseIntent": { resumePurchaseIntent: async () => {} },
    "../../services/progressSync": {},
  }, { setTimeout, clearTimeout }, "\nexports.Screen = AccountScreenContent;");
  const nodes = (root) => root && typeof root === "object" ? [root, ...root.children.flatMap(nodes)] : [];
  const render = () => nodes(hook.render(Screen));
  const button = (label) => render().find((node) => node.type === "Button" && node.props.label === label);
  const confirmation = () => render().some((node) => node.type === "Text" && node.children.includes("premium:subscription.cancelledTitle"));
  try {
    assert.equal(button("Restaurer mes achats"), undefined);
    assert.equal(refreshed, 1);
    assert.equal(button("premium:subscription.refresh"), undefined);
    button("premium:subscription.cancel").props.onPress();
    assert.equal(opened, 0);
    assert.equal(render().find((node) => node.type === "Dialog").props.visible, true);
    button("premium:subscription.keep").props.onPress();
    assert.equal(render().find((node) => node.type === "Dialog").props.visible, false);
    button("premium:subscription.cancel").props.onPress();
    button("premium:subscription.continueToStore").props.onPress();
    assert.equal(opened, 1);
    assert.equal(confirmation(), false);
    managementReturnStatus = "verified";
    assert.equal(confirmation(), false);
    assert.equal(render().some(n => n.type === "Text" && n.children.includes("premium:subscription.unconfirmedReturn")), false);
    customer = info({ willRenew: false, unsubscribeDetectedAt: iso(-1000) });
    assert.equal(confirmation(), true);
    managementReturnStatus = "unconfirmed";
    assert.equal(confirmation(), false);
    managementReturnStatus = "verified";
    error = { code: "network-unavailable", message: "offline" };
    assert.equal(confirmation(), false);
    customer = info({ isActive: false, expirationDateMillis: now - 1 });
    error = null;
    button("Découvrir Premium").props.onPress();
    assert.equal(pushes[0].pathname, "/premium");
    assert.equal(pushes[0].params.returnTo, "/account");
    assert.ok(button("Restaurer mes achats"));
  } finally { hook.cleanup(); }
});

test("notification Account : disparition automatique, aucun rejeu au retour, ni fuite entre comptes", async () => {
  const hook = createHookHarness();
  const react = { ...hook.react, createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }) };
  let focused = true, userId = "account-a", nextNotice = { userId, purchasedAt: Date.now() };
  const timers = new Map();
  let timerId = 0, takes = 0, animations = 0;
  const takePurchaseNotice = () => { takes++; const result = nextNotice; nextNotice = null; return result; };
  const { PurchaseSuccessNotice } = load("components/premium/PurchaseSuccessNotice.tsx", {
    react,
    "@expo/vector-icons": { Ionicons: "Icon" },
    "expo-router": { useFocusEffect: fn => react.useEffect(() => focused ? fn() : undefined, [fn, focused]) },
    "react-native": {
      View: "View", StyleSheet: { create: s => s },
      AccessibilityInfo: { isReduceMotionEnabled: async () => false },
      Animated: {
        View: "AnimatedView",
        Value: class { setValue() {} stopAnimation() {} },
        timing: () => ({ start: () => { animations++; } }),
      },
    },
    "react-i18next": { useTranslation: () => ({ t: key => key }) },
    "../app-text": { AppText: "Text" },
    "../../lib/AuthProvider": { useAuth: () => ({ user: { id: userId } }) },
    "../../lib/paywall/PaywallProvider": { usePaywall: () => ({ takePurchaseNotice, hasPremiumAccess: true }) },
  }, {
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
  });
  const render = () => { hook.render(PurchaseSuccessNotice); hook.render(PurchaseSuccessNotice); return hook.render(PurchaseSuccessNotice); };
  try {
    assert.equal(render().props.accessibilityRole, "alert");
    await new Promise(setImmediate);
    assert.equal(animations, 1);
    assert.equal(takes, 1);
    const timer = [...timers.values()][0];
    assert.equal(timer.delay, 6000);
    timer.callback();
    assert.equal(render(), null);
    assert.equal(timers.size, 0);
    focused = false; render();
    focused = true;
    assert.equal(render(), null);
    nextNotice = { userId, purchasedAt: Date.now() };
    focused = false; render();
    focused = true;
    assert.ok(render());
    userId = "account-b";
    assert.equal(render(), null);
    userId = "account-a";
    assert.equal(render(), null);
  } finally { hook.cleanup(); }
  assert.equal(timers.size, 0);
});
