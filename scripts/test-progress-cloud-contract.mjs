import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { REMOTE_PROGRESS_COLUMNS, synchronizeProgressSnapshotWithRepository } from "../lib/progressSyncCore.ts";
import {
  CURRENT_PROGRESS_SCHEMA_VERSION,
  InvalidProgressSnapshotError,
  migrateProgressSnapshot,
  UnsupportedProgressSchemaVersionError,
} from "../lib/progressSnapshot.ts";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CREATED_AT = "2026-08-18T10:00:00.000Z";
const UPDATED_AT = "2026-08-18T10:05:00.000Z";

function createProgress(overrides = {}) {
  return {
    learningTrack: "hangul", xp: 240, streak: 4,
    completed: { hangul_vowels_basic: true }, hangulLevel: 2,
    hangulProgress: { lessons: {}, masteredCharacters: { "ㅏ": true } },
    grammarProgress: { schemaVersion: 1, concepts: {}, stages: {} },
    ...overrides,
  };
}

function createDailyStreak(overrides = {}) {
  return {
    currentStreak: 1, longestStreak: 1,
    lastCompletedDate: "2026-08-18", isTodayCompleted: false,
    todayDate: "2026-08-18", totalCompletedDays: 1,
    completedDates: {
      "2026-08-18": {
        date: "2026-08-18", completedAt: "2026-08-18T08:00:00.000Z",
        activities: ["hangul_exercise"],
      },
    },
    freezeDates: {}, freezesAvailable: 1, freezesUsed: 0, badges: {},
    ...overrides,
  };
}

function createSnapshot(overrides = {}) {
  return {
    pedagogicalProgress: createProgress(),
    dailyStreak: createDailyStreak(),
    homeResume: null,
    ...overrides,
  };
}

function createRemoteRow(progressData, schemaVersion = 2) {
  return {
    user_id: USER_ID, schema_version: schemaVersion, progress_data: progressData,
    created_at: CREATED_AT, updated_at: UPDATED_AT,
  };
}

test("V1 pedagogical rows migrate into a backward-compatible V2 envelope", () => {
  const progress = createProgress();
  assert.equal(CURRENT_PROGRESS_SCHEMA_VERSION, 2);
  assert.deepEqual(migrateProgressSnapshot(1, progress), {
    pedagogicalProgress: progress, dailyStreak: null, homeResume: null,
  });
});

test("local full and cloud empty upload the complete V2 snapshot", async () => {
  const local = createSnapshot();
  const payloads = [];
  const result = await synchronizeProgressSnapshotWithRepository(
    {
      async read() { return null; },
      async upsert(payload) { payloads.push(payload); return createRemoteRow(payload.progress_data); },
    },
    USER_ID,
    local,
  );

  assert.deepEqual(result.snapshot, local);
  assert.equal(result.syncedAt, UPDATED_AT);
  assert.deepEqual(payloads[0], {
    user_id: USER_ID, schema_version: 2, progress_data: local,
  });
});

test("a V1 cloud row merges monotonically and is upgraded to V2", async () => {
  const cloudV1 = createProgress({
    learningTrack: "grammar", xp: 280,
    completed: { grammar_sentence_structure: true },
  });
  const local = createSnapshot({
    pedagogicalProgress: createProgress({ xp: 320 }),
  });
  const payloads = [];
  const result = await synchronizeProgressSnapshotWithRepository(
    {
      async read() { return createRemoteRow(cloudV1, 1); },
      async upsert(payload) { payloads.push(payload); return createRemoteRow(payload.progress_data); },
    },
    USER_ID,
    local,
  );

  assert.deepEqual(result.snapshot.pedagogicalProgress.completed, {
    grammar_sentence_structure: true, hangul_vowels_basic: true,
  });
  assert.equal(result.snapshot.pedagogicalProgress.xp, 320);
  assert.deepEqual(result.snapshot.dailyStreak, local.dailyStreak);
  assert.equal(payloads[0].schema_version, 2);
});

test("cloud full and local full merge without losing any subsystem", async () => {
  const cloud = createSnapshot({
    pedagogicalProgress: createProgress({ xp: 500, completed: { grammar_a: true } }),
    dailyStreak: createDailyStreak({
      longestStreak: 7,
      freezeDates: { "2026-08-17": true },
      freezesAvailable: 0, freezesUsed: 1,
      badges: { 3: { milestone: 3, unlockedAt: "2026-08-10T08:00:00.000Z" } },
    }),
  });
  const local = createSnapshot({
    pedagogicalProgress: createProgress({
      xp: 300, completed: { hangul_a: true }, hangulLevel: 4,
    }),
    dailyStreak: createDailyStreak({ freezesAvailable: 2 }),
  });
  const result = await synchronizeProgressSnapshotWithRepository(
    {
      async read() { return createRemoteRow(cloud); },
      async upsert(payload) { return createRemoteRow(payload.progress_data); },
    }, USER_ID, local,
  );

  assert.equal(result.snapshot.pedagogicalProgress.xp, 500);
  assert.equal(result.snapshot.pedagogicalProgress.hangulLevel, 4);
  assert.deepEqual(result.snapshot.pedagogicalProgress.completed, { grammar_a: true, hangul_a: true });
  assert.equal(result.snapshot.dailyStreak.longestStreak, 7);
  assert.equal(result.snapshot.dailyStreak.freezeDates["2026-08-17"], true);
  assert.equal(result.snapshot.dailyStreak.freezesAvailable, 2);
  assert.ok(result.snapshot.dailyStreak.badges[3]);
});

test("an older cloud streak cannot replace a more recent local streak", async () => {
  const oldCloud = createSnapshot({
    dailyStreak: createDailyStreak({ currentStreak: 20, longestStreak: 20 }),
  });
  const local = createSnapshot({
    dailyStreak: createDailyStreak({
      currentStreak: 3, longestStreak: 8, lastCompletedDate: "2026-08-20",
      completedDates: {
        "2026-08-20": {
          date: "2026-08-20", completedAt: "2026-08-20T08:00:00.000Z",
          activities: ["grammar_exercise"],
        },
      },
    }),
  });
  const result = await synchronizeProgressSnapshotWithRepository(
    {
      async read() { return createRemoteRow(oldCloud); },
      async upsert(payload) { return createRemoteRow(payload.progress_data); },
    }, USER_ID, local,
  );

  assert.equal(result.snapshot.dailyStreak.currentStreak, 3);
  assert.equal(result.snapshot.dailyStreak.longestStreak, 20);
  assert.equal(result.snapshot.dailyStreak.lastCompletedDate, "2026-08-20");
  assert.ok(result.snapshot.dailyStreak.completedDates["2026-08-18"]);
  assert.ok(result.snapshot.dailyStreak.completedDates["2026-08-20"]);
});

test("home resume keeps the context with the newest updatedAt", async () => {
  const cloud = createSnapshot({
    homeResume: {
      track: "grammar", title: "Cloud ancien", detail: "Étape cloud",
      route: "/grammar", updatedAt: "2026-08-18T08:00:00.000Z",
    },
  });
  const localResume = {
    track: "hangul", title: "Local récent", detail: "Étape locale",
    route: "/hangul", updatedAt: "2026-08-20T08:00:00.000Z",
  };
  const result = await synchronizeProgressSnapshotWithRepository(
    {
      async read() { return createRemoteRow(cloud); },
      async upsert(payload) { return createRemoteRow(payload.progress_data); },
    }, USER_ID, createSnapshot({ homeResume: localResume }),
  );
  assert.deepEqual(result.snapshot.homeResume, localResume);
});

test("unknown and invalid cloud schemas never overwrite local", async () => {
  let uploads = 0;
  await assert.rejects(
    synchronizeProgressSnapshotWithRepository(
      {
        async read() { return createRemoteRow(null, 99); },
        async upsert() { uploads += 1; throw new Error("must not upload"); },
      }, USER_ID, createSnapshot(),
    ),
    (error) => error instanceof UnsupportedProgressSchemaVersionError && error.schemaVersion === 99,
  );
  assert.equal(uploads, 0);
  assert.throws(
    () => migrateProgressSnapshot(2, { pedagogicalProgress: createProgress() }),
    InvalidProgressSnapshotError,
  );
});

test("SQL and TypeScript keep the same five-column storage contract", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260818120000_user_progress.sql", import.meta.url), "utf8");
  const syncSource = await readFile(new URL("../services/progressSync.ts", import.meta.url), "utf8");
  assert.deepEqual(REMOTE_PROGRESS_COLUMNS.split(", "), [
    "user_id", "schema_version", "progress_data", "created_at", "updated_at",
  ]);
  for (const column of REMOTE_PROGRESS_COLUMNS.split(", ")) {
    assert.match(migration, new RegExp(`\\b${column}\\b`, "u"));
  }
  assert.match(syncSource, /\.select\(REMOTE_PROGRESS_COLUMNS\)/u);
  assert.match(syncSource, /\.upsert\(payload, \{ onConflict: "user_id" \}\)/u);
  assert.match(migration, /schema_version integer not null check \(schema_version >= 1\)/u);
});
