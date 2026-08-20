import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  assertLinkedUserId,
  authProvidersFromUser,
  parseAuthCallbackUrl,
} from "../lib/authCallback.ts";
import { toKappAuthError } from "../lib/authErrors.ts";
import {
  synchronizeProgressSnapshotWithRepository,
} from "../lib/progressSyncCore.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [authSource, accountSource, redirectsSource, syncProviderSource, syncServiceSource, migration, deletionFunction, supabaseSource, appConfig, rootLayoutSource] =
  await Promise.all([
    read("../lib/AuthProvider.tsx"),
    read("../app/account/index.tsx"),
    read("../lib/authRedirects.ts"),
    read("../lib/ProgressSyncProvider.tsx"),
    read("../services/progressSync.ts"),
    read("../supabase/migrations/20260818120000_user_progress.sql"),
    read("../supabase/functions/delete-account/index.ts"),
    read("../lib/supabase.ts"),
    read("../app.json"),
    read("../app/_layout.tsx"),
  ]);

const USER_ID = "11111111-1111-4111-8111-111111111111";
const NOW = "2026-08-18T12:00:00.000Z";

function progress(overrides = {}) {
  return {
    learningTrack: "hangul",
    xp: 0,
    streak: 0,
    completed: {},
    hangulLevel: 1,
    hangulProgress: { lessons: {}, masteredCharacters: {} },
    grammarProgress: { schemaVersion: 1, concepts: {}, stages: {} },
    ...overrides,
  };
}

function snapshot(progressOverrides = {}) {
  return {
    pedagogicalProgress: progress(progressOverrides),
    dailyStreak: {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      isTodayCompleted: false,
      todayDate: "2026-08-18",
      totalCompletedDays: 0,
      completedDates: {},
      freezeDates: {},
      freezesAvailable: 1,
      freezesUsed: 0,
      badges: {},
    },
    homeResume: null,
  };
}

function row(snapshotValue) {
  return {
    user_id: USER_ID,
    schema_version: 2,
    progress_data: snapshotValue,
    created_at: NOW,
    updated_at: NOW,
  };
}

test("1. a missing persisted session creates one anonymous Supabase session", () => {
  assert.match(authSource, /getSession\(\)[\s\S]*?createAnonymousSession\(\)/u);
  assert.match(authSource, /auth\.signInAnonymously\(\)/u);
});

test("2. user_progress is read and upserted only for the active UID", () => {
  assert.match(syncServiceSource, /\.eq\("user_id", id\)/u);
  assert.match(syncServiceSource, /\.upsert\(payload, \{ onConflict: "user_id" \}\)/u);
  assert.match(migration, /auth\.uid\(\)\) = user_id/iu);
});

test("3. anonymous to email keeps the chosen password through confirmation", () => {
  assert.match(authSource, /auth\.updateUser\([\s\S]*?\{ email, password \}/u);
  assert.match(accountSource, /auth\.protectProgress\(email,\s*password\)/u);
  assert.match(accountSource, /Compte créé avec succès/u);
  assert.match(authSource, /setDidCompleteAccountProtection\(true\)/u);
  // Keep completing protection available for confirmations started by older builds.
  assert.match(
    authSource,
    /const completeAccountProtection[\s\S]*?auth\.updateUser\(\{[\s\S]*?password/u,
  );
  assert.match(
    authSource,
    /pendingProtectionRevision\.current \+= 1;[\s\S]*?removeItem\(PENDING_PROTECTION_EMAIL_KEY\)[\s\S]*?pendingProtectionRevision\.current \+= 1;/u,
  );
});

test("4. new and existing Google identities use the same OAuth sign-in", () => {
  assert.match(
    accountSource,
    /provider === "google" \|\| existingAccount[\s\S]*?auth\.signInWithOAuth\(provider\)/u,
  );
  assert.match(
    accountSource,
    /provider="google"[\s\S]*?continueWithProvider\("google"\)/u,
  );
  assert.match(authSource, /auth\.signInWithOAuth\(credentials\)/u);
});

test("4b. Google sign-in keeps guest progress available for the target UID merge", () => {
  const oauthImplementation = authSource.slice(
    authSource.indexOf("const runOAuth"),
    authSource.indexOf("const signOut"),
  );
  assert.match(
    oauthImplementation,
    /intent === "login"[\s\S]*?synchronizeProgressNow\(\)[\s\S]*?auth\.signInWithOAuth\(credentials\)/u,
  );
  assert.match(
    syncProviderSource,
    /userIdRef\.current !== nextUserId[\s\S]*?lastSyncedFingerprintRef\.current = null/u,
  );
});

test("5. anonymous to Apple uses linking and is exposed only on iOS", () => {
  assert.match(authSource, /intent === "link"/u);
  assert.match(accountSource, /Platform\.OS === "ios"[\s\S]*?provider="apple"/u);
});

test("6. linking rejects any unexpected UID change", () => {
  assert.doesNotThrow(() => assertLinkedUserId(USER_ID, USER_ID));
  assert.throws(() => assertLinkedUserId(USER_ID, "other-user"));
  assert.match(authSource, /assertLinkedUserId\(expectedUserId, userResult\.user\.id\)/u);
});

test("7. identity linking keeps the same user_progress ownership", () => {
  const providers = authProvidersFromUser({
    app_metadata: { providers: ["anonymous", "google"] },
    identities: [{ provider: "google" }],
  });
  assert.ok(providers.includes("google"));
  const oauthImplementation = authSource.slice(
    authSource.indexOf("const runOAuth"),
    authSource.indexOf("const signOut"),
  );
  assert.doesNotMatch(oauthImplementation, /auth\.signOut\(/u);
});

test("8. a blank device restores the permanent account cloud snapshot", async () => {
  const cloud = snapshot({ xp: 420, completed: { cafe_order: true }, hangulLevel: 3 });
  const uploads = [];
  const result = await synchronizeProgressSnapshotWithRepository(
    {
      async read() { return row(cloud); },
      async upsert(payload) { uploads.push(payload); return row(payload.progress_data); },
    },
    USER_ID,
    snapshot(),
  );
  assert.equal(result.snapshot.pedagogicalProgress.xp, 420);
  assert.equal(result.snapshot.pedagogicalProgress.completed.cafe_order, true);
  assert.equal(result.snapshot.pedagogicalProgress.hangulLevel, 3);
  assert.equal(uploads.length, 1);
});

test("9. restoration applies the merged snapshot to the local store", () => {
  assert.match(syncProviderSource, /applyLocalSnapshot\(safeLocalSnapshot\)/u);
  assert.match(syncProviderSource, /userIdRef\.current !== userId/u);
});

test("10. logout synchronizes first and then creates a new guest session", () => {
  assert.match(authSource, /const signOut[\s\S]*?synchronizeProgressNow\(\)[\s\S]*?auth\.signOut\(\)[\s\S]*?isolateProgressAfterSignOut[\s\S]*?createAnonymousSession\(\)/u);
  assert.match(authSource, /catch \(syncError\)[\s\S]*?syncDeferred = true[\s\S]*?auth\.signOut\(\)/u);
  assert.match(authSource, /scope: "local"/u);
});

test("11. classic reconnection supports password and OAuth accounts", () => {
  assert.match(authSource, /signInWithPassword/u);
  assert.match(authSource, /auth\.signInWithOAuth\(credentials\)/u);
  assert.match(accountSource, /J’ai déjà un compte/u);
});

test("12. password reset uses the K-App recovery callback", () => {
  assert.match(authSource, /resetPasswordForEmail[\s\S]*?createAuthRedirectUrl\("recovery"\)/u);
  assert.match(authSource, /event === "PASSWORD_RECOVERY"/u);
});

test("13. PKCE and token callbacks parse safely without a native localhost fallback", () => {
  assert.equal(parseAuthCallbackUrl("kapp://account?code=abc").code, "abc");
  assert.equal(
    parseAuthCallbackUrl("kapp://account#access_token=a&refresh_token=r").refreshToken,
    "r",
  );
  assert.equal(JSON.parse(appConfig).expo.scheme, "kapp");
  assert.match(redirectsSource, /parsed\.protocol !== `\$\{NATIVE_SCHEME\}:`/u);
  assert.match(redirectsSource, /localhost/u);
});

test("14. network and provider failures have precise French messages", () => {
  assert.equal(toKappAuthError(new TypeError("Network request failed")).code, "network-unavailable");
  assert.equal(toKappAuthError({ code: "provider_disabled" }).code, "oauth-provider-disabled");
  const linkedIdentityError = toKappAuthError({ code: "identity_already_exists" });
  assert.equal(linkedIdentityError.code, "identity-already-used");
  assert.doesNotMatch(linkedIdentityError.message, /J’ai déjà un compte/u);
  assert.equal(toKappAuthError({ code: "over_email_send_rate_limit" }).code, "rate-limited");
});

test("15. local/cloud conflict merge never silently loses further progress", async () => {
  const cloud = snapshot({ xp: 500, completed: { grammar_a: true }, hangulLevel: 2 });
  const local = snapshot({ xp: 300, completed: { hangul_a: true }, hangulLevel: 4 });
  const result = await synchronizeProgressSnapshotWithRepository(
    {
      async read() { return row(cloud); },
      async upsert(payload) { return row(payload.progress_data); },
    },
    USER_ID,
    local,
  );
  assert.equal(result.snapshot.pedagogicalProgress.xp, 500);
  assert.equal(result.snapshot.pedagogicalProgress.hangulLevel, 4);
  assert.deepEqual(result.snapshot.pedagogicalProgress.completed, { grammar_a: true, hangul_a: true });
});

test("16. account deletion authenticates the caller and cascades progress deletion", () => {
  assert.match(deletionFunction, /auth\.getUser\(token\)/u);
  assert.match(deletionFunction, /admin\.auth\.admin\.deleteUser\([\s\S]*?data\.user\.id/u);
  assert.match(migration, /references auth\.users\(id\) on delete cascade/iu);
  assert.match(accountSource, /deleteAccount\(\)[\s\S]*?resetProgress\(\)/u);
});

test("the client contains no service-role credential", () => {
  assert.doesNotMatch(supabaseSource, /service_role|SERVICE_ROLE/u);
  assert.doesNotMatch(supabaseSource, /EXPO_PUBLIC_SUPABASE_ANON_KEY/u);
  assert.match(supabaseSource, /EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/u);
});

test("a stale UID synchronization cannot overwrite the newly signed-in user", () => {
  assert.match(syncProviderSource, /inFlight\?\.userId === userId/u);
  assert.match(syncProviderSource, /if \(userIdRef\.current !== userId\) return;/u);
});

test("auth deep links bypass only the initial onboarding redirect", () => {
  for (const action of [
    "recovery",
    "protect",
    "oauth-link-google",
    "oauth-link-apple",
    "oauth-login-google",
    "oauth-login-apple",
  ]) {
    assert.match(rootLayoutSource, new RegExp(`"${action}"`, "u"));
  }
  assert.match(
    rootLayoutSource,
    /pathname === "\/account"[\s\S]*?AUTH_ONBOARDING_BYPASS_ACTIONS\.has\(authAction\)/u,
  );
  assert.match(
    rootLayoutSource,
    /completed !== "true"[\s\S]*?pathname !== "\/onboarding"[\s\S]*?!isAuthAccountCallback[\s\S]*?router\.replace\("\/onboarding"\)/u,
  );
});
