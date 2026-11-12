import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { createHookHarness } from "./helpers/hook-harness.mjs";
import { createNavigationHarness } from "./helpers/oauth-navigation-harness.mjs";
import * as progressMerge from "../lib/progressMerge.ts";
import * as progressCore from "../lib/progressSyncCore.ts";
import * as progressSnapshot from "../lib/progressSnapshot.ts";
import * as pedagogical from "../lib/pedagogicalProgress.ts";
import * as syncEvents from "../lib/progressSyncEvents.ts";
import { createDailyStreakState } from "../lib/dailyStreak.ts";

import {
  KappAuthError,
  toKappAuthError,
  validateEmail,
  validatePassword,
} from "../lib/authErrors.ts";
import { mergeProgressSnapshots } from "../lib/progressMerge.ts";

const rootLayoutSource = await readFile(
  new URL("../app/_layout.tsx", import.meta.url),
  "utf8",
);
const authProviderSource = await readFile(
  new URL("../lib/AuthProvider.tsx", import.meta.url),
  "utf8",
);
const syncProviderSource = await readFile(
  new URL("../lib/ProgressSyncProvider.tsx", import.meta.url),
  "utf8",
);
const accountSource = await readFile(
  new URL("../app/account/index.tsx", import.meta.url),
  "utf8",
);
const hubSource = await readFile(
  new URL("../app/(tabs)/index.tsx", import.meta.url),
  "utf8",
);

test("email and password validation keep the account boundary explicit", () => {
  assert.equal(validateEmail("  APPRENANT@EXEMPLE.COM "), "apprenant@exemple.com");
  assert.throws(() => validateEmail("invalide"), KappAuthError);
  assert.doesNotThrow(() => validatePassword("huit-caracteres"));
  assert.throws(() => validatePassword("court"), KappAuthError);
});

test("Supabase errors are translated without leaking backend messages", () => {
  assert.equal(
    toKappAuthError(new Error("Invalid login credentials")).code,
    "invalid-credentials",
  );
  assert.equal(
    toKappAuthError(new TypeError("Network request failed")).code,
    "network-unavailable",
  );
});

test("Auth and Sync providers are mounted inside the persisted store", () => {
  assert.match(
    rootLayoutSource,
    /<StoreProvider>[\s\S]*?<AuthProvider>[\s\S]*?<ProgressSyncProvider>/u,
  );
  assert.match(
    rootLayoutSource,
    /<\/ProgressSyncProvider>[\s\S]*?<\/AuthProvider>[\s\S]*?<\/StoreProvider>/u,
  );
});

test("anonymous auth, account conversion and password recovery stay centralized", () => {
  assert.match(authProviderSource, /signInAnonymously\(\)/u);
  assert.match(authProviderSource, /auth\.updateUser\([\s\S]*?email/u);
  assert.match(authProviderSource, /resetPasswordForEmail/u);
  assert.match(authProviderSource, /PASSWORD_RECOVERY/u);
  assert.match(authProviderSource, /exchangeCodeForSession/u);
});

test("sync remains local-first and exposes the account retry contract", () => {
  assert.match(syncProviderSource, /useStore\(\)/u);
  assert.match(syncProviderSource, /applyLocalSnapshot\(safeLocalSnapshot\)/u);
  assert.match(syncProviderSource, /subscribeToLocalProgressMutations/u);
  assert.match(syncProviderSource, /readLocalUserProgressSnapshot/u);
  assert.match(accountSource, /synchronizeProgressNow\(\)/u);
});

test("cloud and local snapshots keep both sets of completed learning", () => {
  const emptyGrammar = {
    schemaVersion: 1,
    concepts: {},
    stages: {},
  };
  const emptyHangul = { lessons: {}, masteredCharacters: {} };
  const remote = {
    learningTrack: "grammar",
    xp: 160,
    streak: 2,
    completed: { grammar_sentence_structure: true },
    hangulLevel: 1,
    hangulProgress: emptyHangul,
    grammarProgress: emptyGrammar,
  };
  const local = {
    learningTrack: "hangul",
    xp: 200,
    streak: 1,
    completed: { hangul_vowels_basic: true },
    hangulLevel: 2,
    hangulProgress: emptyHangul,
    grammarProgress: emptyGrammar,
  };

  const merged = mergeProgressSnapshots(remote, local);

  assert.deepEqual(merged.completed, {
    grammar_sentence_structure: true,
    hangul_vowels_basic: true,
  });
  assert.equal(merged.learningTrack, "hangul");
  assert.equal(merged.xp, 200);
  assert.equal(merged.hangulLevel, 2);
});

test("the Hub exposes profile access and keeps protection in the account route", () => {
  assert.match(hubSource, /accessibilityLabel=\{translate\("Ouvrir mon profil"\)\}/u);
  assert.match(hubSource, /onOpenProfile=\{\(\) => router\.push\("\/account"\)\}/u);
  assert.match(hubSource, /pathname: "\/account",[\s\S]*?action: "protect"/u);
  assert.match(hubSource, /useAuth\(\)/u);
  assert.doesNotMatch(hubSource, /protectProgress\(/u);
});

test("profile and protection controls keep compact responsive contracts", () => {
  assert.match(
    hubSource,
    /profileButton:\s*\{[\s\S]*?width: 44,[\s\S]*?height: 44,/u,
  );
  assert.match(
    hubSource,
    /compact && styles\.protectionActionsCompact/u,
  );
  assert.match(
    hubSource,
    /protectionActionsCompact:\s*\{[\s\S]*?flexDirection: "column"/u,
  );
});

test("the real sync provider merges a Google UID, isolates logout and restores reconnection without touching locale/navigation", async () => {
  const compile = async (path) => ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
  const load = (code, mocks) => {
    const module = { exports: {} };
    new Function("require", "module", "exports", code)((name) => {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    }, module, module.exports);
    return module.exports;
  };
  const [providerCode, serviceCode, storageCode] = await Promise.all([
    compile("../lib/ProgressSyncProvider.tsx"), compile("../services/progressSync.ts"), compile("../lib/progressSnapshotStorage.ts"),
  ]);
  const hook = createHookHarness();
  const nav = createNavigationHarness();
  const entries = new Map([["kapp:locale:v1", "ja"]]);
  const cloud = new Map();
  const writes = [];
  const reads = [];
  const snapshot = (pedagogicalProgress) => ({ pedagogicalProgress, dailyStreak: createDailyStreakState(), homeResume: null });
  const store = {
    isHydrated: true,
    progress: { ...pedagogical.createInitialPedagogicalProgress(), xp: 100, completed: { guest_lesson: true } },
    setProgress: async (next) => { store.progress = next; },
  };
  const auth = { isConfigured: true, user: { id: "guest-id" } };
  cloud.set("google-id", { user_id: "google-id", schema_version: 2, progress_data: snapshot({ ...pedagogical.createInitialPedagogicalProgress(), xp: 420, completed: { google_lesson: true } }), created_at: "2026-11-06T10:00:00.000Z", updated_at: "2026-11-06T10:00:00.000Z" });
  const service = load(serviceCode, {
    "../lib/progressSyncCore": progressCore,
    "../lib/progressSnapshot": progressSnapshot,
    "../lib/supabase": { requireSupabaseClient: () => ({ from: () => ({
      select: () => ({ eq: (_column, id) => ({ maybeSingle: async () => { reads.push(id); return { data: cloud.get(id) ?? null, error: null }; } }) }),
      upsert: (payload) => ({ select: () => ({ single: async () => {
        writes.push(payload.user_id);
        const row = { ...payload, created_at: "2026-11-06T10:00:00.000Z", updated_at: "2026-11-06T11:00:00.000Z" };
        cloud.set(payload.user_id, row);
        return { data: row, error: null };
      } }) }),
    }) }) },
  });
  const daily = { createDailyStreakState, readDailyStreakSnapshot: async () => createDailyStreakState(), persistDailyStreakSnapshot: async () => {} };
  const resume = { readHomeResumeContext: async () => null, replaceHomeResumeContext: async () => {} };
  const storage = load(storageCode, {
    "@react-native-async-storage/async-storage": {
      getItem: async (key) => entries.get(key) ?? null,
      setItem: async (key, value) => { entries.set(key, value); },
      removeItem: async (key) => { entries.delete(key); },
    },
    "./pedagogicalProgress.ts": pedagogical,
    "./dailyStreak.ts": daily,
    "./homeResume.ts": resume,
    "./progressSnapshot.ts": progressSnapshot,
    "./progressMerge.ts": progressMerge,
  });
  const { ProgressSyncProvider } = load(providerCode, {
    react: hook.react,
    "../_store": { useStore: () => store },
    "../services/progressSync": service,
    "./AuthProvider": { useAuth: () => auth },
    "./progressSnapshotStorage": storage,
    "./progressSyncEvents": syncEvents,
    "./dailyStreak": daily,
    "./homeResume": resume,
    "./progressMerge": progressMerge,
  });
  const verify = () => {
    hook.render(ProgressSyncProvider);
    assert.equal(entries.get("kapp:locale:v1"), "ja");
    nav.assertModulesRemainAccessible();
  };
  try {
    verify();
    await service.synchronizeProgressNow();
    assert.equal(cloud.get("guest-id").progress_data.pedagogicalProgress.xp, 100);
    auth.user = { id: "google-id" };
    verify();
    await service.synchronizeProgressNow();
    assert.equal(store.progress.xp, 420);
    assert.deepEqual(store.progress.completed, { google_lesson: true, guest_lesson: true });
    verify();
    await service.isolateProgressAfterSignOut("google-id");
    assert.equal(store.progress.xp, pedagogical.createInitialPedagogicalProgress().xp);
    auth.user = { id: "new-guest-id" };
    verify();
    await service.synchronizeProgressNow();
    assert.deepEqual(cloud.get("new-guest-id").progress_data.pedagogicalProgress.completed, {});
    auth.user = { id: "google-id" };
    verify();
    await service.synchronizeProgressNow();
    assert.equal(store.progress.xp, 420);
    assert.deepEqual(store.progress.completed, { google_lesson: true, guest_lesson: true });
    assert.deepEqual(writes, ["guest-id", "google-id", "new-guest-id"]);
    assert.deepEqual(reads, ["guest-id", "google-id", "new-guest-id", "google-id"]);
    verify();
  } finally {
    hook.cleanup();
  }
});
