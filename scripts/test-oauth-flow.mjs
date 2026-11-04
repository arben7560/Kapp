import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import ts from "typescript";

import * as authCallback from "../lib/authCallback.ts";
import * as authErrors from "../lib/authErrors.ts";

const compile = async (path) => ts.transpileModule(
  await readFile(new URL(path, import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } },
).outputText;
const [providerCode, redirectsCode] = await Promise.all([
  compile("../lib/AuthProvider.tsx"),
  compile("../lib/authRedirects.ts"),
]);

function loadModule(code, mocks, logs = [], development = true) {
  const module = { exports: {} };
  const requireMock = (name) => {
    assert.ok(name in mocks, `Unexpected dependency: ${name}`);
    return mocks[name];
  };
  new Function("require", "module", "exports", "__DEV__", "console", code)(
    requireMock, module, module.exports, development,
    { info: (...args) => logs.push(args) },
  );
  return module.exports;
}

const guest = { user: { id: "guest-id", is_anonymous: true, app_metadata: { providers: ["anonymous"] } } };
const google = { user: { id: "google-id", is_anonymous: false, app_metadata: { providers: ["google"] } } };
const callbackUrl = "kapp://account?code=SECRET_CODE&action=oauth-login-google";
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

// Execute the real provider with lightweight hook/native adapters. No network,
// browser or Supabase service is used; the async OAuth control flow is unchanged.
async function mount(options = {}) {
  const states = [];
  const refs = [];
  const effects = [];
  const logs = [];
  const listeners = new Set();
  let stateIndex = 0;
  let refIndex = 0;
  let initialized = false;
  let authListener;
  let currentSession = guest;
  const calls = { exchange: 0, setSession: 0, getUser: 0, credentials: null, returnUrl: null };
  const react = {
    createContext: () => ({ Provider: "AuthContext.Provider" }),
    createElement: (_type, props) => props.value,
    useState: (initial) => {
      const index = stateIndex++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = value; }];
    },
    useRef: (initial) => {
      const index = refIndex++;
      return refs[index] ??= { current: initial };
    },
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useEffect: (fn) => { if (!initialized) effects.push(fn); },
  };
  const linking = {
    createURL: (path, { scheme, queryParams }) => {
      const base = scheme ? `${scheme}:/${path}` : `https://k-app.test${path}`;
      const query = new URLSearchParams(queryParams).toString();
      return `${base}${query ? `?${query}` : ""}`;
    },
    getInitialURL: async () => options.initialUrl ?? null,
    addEventListener: (_event, listener) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    },
  };
  const redirects = loadModule(redirectsCode, {
    "expo-linking": linking,
    "react-native": { Platform: { OS: options.platform ?? "android" } },
  });
  const establishSession = (nextSession) => {
    currentSession = nextSession;
    authListener(options.authEvent ?? "SIGNED_IN", currentSession);
    return { data: { session: nextSession }, error: null };
  };
  const client = { auth: {
    onAuthStateChange: (listener) => {
      authListener = listener;
      return { data: { subscription: { unsubscribe() {} } } };
    },
    getSession: async () => ({ data: { session: currentSession }, error: null }),
    getUser: async () => {
      calls.getUser++;
      return { data: { user: "user" in options ? options.user : currentSession?.user }, error: options.userError ?? null };
    },
    signInWithOAuth: async (credentials) => {
      calls.credentials = credentials;
      if (options.authorizationError) throw options.authorizationError;
      return { data: { url: "https://provider.test/authorize" }, error: null };
    },
    linkIdentity: async (credentials) => client.auth.signInWithOAuth(credentials),
    exchangeCodeForSession: async () => {
      calls.exchange++;
      if (options.exchange) return options.exchange(establishSession);
      return establishSession("callbackSession" in options ? options.callbackSession : google);
    },
    setSession: async () => {
      calls.setSession++;
      return establishSession(google);
    },
  } };
  const emit = (url) => { for (const listener of listeners) listener({ url }); };
  const { AuthProvider } = loadModule(providerCode, {
    react,
    "@react-native-async-storage/async-storage": {
      multiRemove: async () => {}, getItem: async () => null, removeItem: async () => {},
    },
    "expo-linking": linking,
    "expo-web-browser": {
      maybeCompleteAuthSession() {},
      openAuthSessionAsync: async (_startUrl, returnUrl) => {
        calls.returnUrl = returnUrl;
        if (options.browser) return options.browser({ emit, returnUrl });
        // Reproduce the installed Expo Android polyfill's recognition rule.
        return callbackUrl.startsWith(returnUrl)
          ? { type: "success", url: callbackUrl } : { type: "dismiss" };
      },
    },
    "./authCallback": authCallback,
    "./authErrors": authErrors,
    "./authRedirects": redirects,
    "./supabase": { isSupabaseConfigured: true, requireSupabaseClient: () => client, supabase: client },
    "../services/progressSync": { synchronizeProgressNow: async () => {}, isolateProgressAfterSignOut: async () => {} },
  }, logs, options.development ?? true);
  const render = () => {
    stateIndex = 0;
    refIndex = 0;
    const context = AuthProvider({ children: null });
    initialized = true;
    return context;
  };
  render();
  const cleanups = effects.map((effect) => effect());
  await setImmediate();
  return { render, calls, logs, emit, redirects, cleanup: () => cleanups.forEach((cleanup) => cleanup?.()) };
}

function assertIdle(app) {
  assert.equal(app.render().activeOAuthProvider, null);
  assert.equal(app.render().isHandlingDeepLink, false);
  assert.equal(app.render().isLoading, false);
  app.cleanup();
}

test("Android recognizes a query-reordered callback and preserves the Router action", async () => {
  const app = await mount();
  assert.equal(await app.render().signInWithOAuth("google"), "success");
  assert.equal(app.calls.returnUrl, "kapp://account");
  assert.equal(app.calls.credentials.options.redirectTo, "kapp://account?action=oauth-login-google");
  assert.equal(app.calls.exchange, 1);
  assert.equal(app.render().user.id, "google-id");
  assertIdle(app);
});

test("callback matching rejects other routes/actions and accepts query or fragment payloads", () => {
  const expected = "kapp://account?action=oauth-login-google";
  for (const url of [callbackUrl, "kapp://account#access_token=SECRET_ACCESS&refresh_token=SECRET_REFRESH"]) {
    assert.ok(authCallback.matchesAuthCallbackUrl(url, expected));
    assert.ok(authCallback.parseAuthCallbackUrl(url).hasAuthPayload);
  }
  for (const url of ["kapp://accounting?code=x", "other://account?code=x", "kapp://account?action=recovery&code=x", "invalid"]) {
    assert.equal(authCallback.matchesAuthCallbackUrl(url, expected), false);
  }
});

test("Linking and the browser share one PKCE exchange, including Android dismissal", async () => {
  for (const type of ["success", "dismiss"]) {
    const exchange = deferred();
    const app = await mount({
      exchange: async (establish) => { await exchange.promise; return establish(google); },
      browser: async ({ emit }) => { emit(callbackUrl); return { type, url: callbackUrl }; },
    });
    const operation = app.render().signInWithOAuth("google");
    await setImmediate();
    assert.equal(app.render().activeOAuthProvider, "google");
    assert.equal(app.render().isHandlingDeepLink, true);
    exchange.resolve();
    assert.equal(await operation, "success");
    assert.equal(app.calls.exchange, 1);
    assertIdle(app);
  }
});

test("an exchange failure received through Linking also releases the OAuth spinner", async () => {
  const app = await mount({
    exchange: async () => { throw new Error("Network request failed SECRET_ERROR"); },
    browser: async ({ emit }) => { emit(callbackUrl); return { type: "dismiss" }; },
  });
  await assert.rejects(app.render().signInWithOAuth("google"), { code: "network-unavailable" });
  assert.equal(app.calls.exchange, 1);
  assertIdle(app);
});

test("fragment token callbacks still establish a session", async () => {
  const app = await mount({ browser: async () => ({ type: "success", url: "kapp://account?action=oauth-login-google#access_token=SECRET_ACCESS&refresh_token=SECRET_REFRESH" }) });
  assert.equal(await app.render().signInWithOAuth("google"), "success");
  assert.equal(app.calls.setSession, 1);
  assert.equal(app.calls.exchange, 0);
  assertIdle(app);
});

test("cancel, dismiss and an unrecognized return release loading without accepting the guest", async () => {
  for (const type of ["cancel", "dismiss"]) {
    const app = await mount({ browser: async ({ emit }) => { emit("kapp://lesson/cafe?code=unrelated"); return { type }; } });
    assert.equal(await app.render().signInWithOAuth("google"), "cancelled");
    assert.equal(app.calls.exchange, 0);
    assert.equal(app.calls.getUser, 0);
    assert.equal(app.render().isAnonymous, true);
    assertIdle(app);
  }
});

test("missing/partial payloads, provider rejection and foreign callbacks cannot succeed", async () => {
  for (const url of [
    "kapp://account?action=oauth-login-google",
    "kapp://account#access_token=SECRET_ACCESS",
    "kapp://account?error=access_denied&error_description=SECRET_ERROR",
    "kapp://accounting?code=SECRET_CODE",
    "kapp://account?action=recovery&code=SECRET_CODE",
  ]) {
    const app = await mount({ browser: async () => ({ type: "success", url }) });
    await assert.rejects(app.render().signInWithOAuth("google"), authErrors.KappAuthError);
    assert.equal(app.calls.exchange, 0);
    assert.equal(app.calls.getUser, 0);
    assert.equal(app.render().isAnonymous, true);
    assertIdle(app);
  }
});

test("a guest, missing session, wrong provider or inconsistent server user cannot validate Google", async () => {
  for (const options of [
    { callbackSession: guest }, { callbackSession: null }, { user: guest.user }, { user: null },
    { user: { ...google.user, app_metadata: { providers: ["email"] } } },
    { user: { ...google.user, id: "different-id" } },
    { userError: new Error("Network request failed SECRET_ERROR") },
  ]) {
    const app = await mount(options);
    await assert.rejects(app.render().signInWithOAuth("google"), authErrors.KappAuthError);
    assertIdle(app);
  }
});

test("authorization/browser/exchange errors release loading and permit a retry", async () => {
  const options = {};
  const app = await mount(options);
  for (const stage of ["authorizationError", "browser", "exchange"]) {
    options[stage] = stage === "authorizationError" ? new Error("SECRET_ERROR") : async () => { throw new Error("SECRET_ERROR"); };
    await assert.rejects(app.render().signInWithOAuth("google"), authErrors.KappAuthError);
    assert.equal(app.render().activeOAuthProvider, null);
    assert.equal(app.render().isHandlingDeepLink, false);
    delete options[stage];
  }
  // Use a fresh code: a failed PKCE callback must never be exchanged twice.
  options.browser = async () => ({ type: "success", url: callbackUrl.replace("SECRET_CODE", "SECRET_RETRY") });
  assert.equal(await app.render().signInWithOAuth("google"), "success");
  assertIdle(app);
});

test("a double press cannot start or clear another active OAuth operation", async () => {
  const browser = deferred();
  const app = await mount({ browser: () => browser.promise });
  const operation = app.render().signInWithOAuth("google");
  await setImmediate();
  await assert.rejects(app.render().signInWithOAuth("google"), authErrors.KappAuthError);
  assert.equal(app.render().activeOAuthProvider, "google");
  browser.resolve({ type: "cancel" });
  assert.equal(await operation, "cancelled");
  assertIdle(app);
});

test("Apple linking preserves its UID check", async () => {
  for (const id of ["guest-id", "unexpected-id"]) {
    const apple = { user: { id, is_anonymous: false, identities: [{ provider: "apple" }] } };
    const app = await mount({ callbackSession: apple, browser: async () => ({ type: "success", url: "kapp://account?code=SECRET_APPLE&action=oauth-link-apple" }) });
    const operation = app.render().linkOAuthIdentity("apple");
    if (id === "guest-id") assert.equal(await operation, "success");
    else await assert.rejects(operation, authErrors.KappAuthError);
    assertIdle(app);
  }
});

test("cold-start recovery, protection and existing OAuth links still reach auth", async () => {
  for (const action of ["recovery", "protect", "oauth-login-google"]) {
    const app = await mount({ initialUrl: `kapp://account?action=${action}&code=SECRET_INITIAL`, authEvent: action === "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN" });
    assert.equal(app.calls.exchange, 1);
    assert.equal(app.render().isPasswordRecovery, action === "recovery");
    assert.equal(app.redirects.createAuthRedirectUrl(action), `kapp://account?action=${action}`);
    assertIdle(app);
  }
  const web = await mount({ platform: "web" });
  assert.equal(web.redirects.createAuthRedirectUrl("recovery"), "https://k-app.test/account?action=recovery");
  assertIdle(web);
});

test("diagnostics contain only safe labels/flags and are disabled in release", async () => {
  const app = await mount();
  await app.render().signInWithOAuth("google");
  app.emit("kapp://account#error=SECRET_ERROR&error_description=SECRET_DESCRIPTION");
  await setImmediate();
  const logged = JSON.stringify(app.logs);
  assert.match(logged, /callback.received/u);
  assert.match(logged, /loading.released/u);
  assert.doesNotMatch(logged, /SECRET_|kapp:\/\/|https:\/\/|google-id|guest-id/u);
  assertIdle(app);
  const release = await mount({ development: false });
  await release.render().signInWithOAuth("google");
  assert.equal(release.logs.length, 0);
  assertIdle(release);
});
