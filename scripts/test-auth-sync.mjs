import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.match(syncProviderSource, /setProgress\(result\.progress\)/u);
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

test("this restoration does not integrate account UX into the Hub", () => {
  assert.doesNotMatch(hubSource, /router\.(?:push|replace)\("\/account/u);
  assert.doesNotMatch(hubSource, /useAuth\(/u);
});
