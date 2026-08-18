import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  REMOTE_PROGRESS_COLUMNS,
  synchronizeProgressSnapshotWithRepository,
} from "../lib/progressSyncCore.ts";
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
    learningTrack: "hangul",
    xp: 240,
    streak: 4,
    completed: { hangul_vowels_basic: true },
    hangulLevel: 2,
    hangulProgress: {
      lessons: {},
      masteredCharacters: { "ㅏ": true },
    },
    grammarProgress: {
      schemaVersion: 1,
      concepts: {},
      stages: {},
    },
    ...overrides,
  };
}

function createRemoteRow(progressData, schemaVersion = 1) {
  return {
    user_id: USER_ID,
    schema_version: schemaVersion,
    progress_data: progressData,
    created_at: CREATED_AT,
    updated_at: UPDATED_AT,
  };
}

test("the V1 loader preserves a valid complete progress snapshot", () => {
  const snapshot = createProgress({
    completed: {
      hangul_vowels_basic: true,
      grammar_sentence_structure: true,
    },
  });

  assert.equal(CURRENT_PROGRESS_SCHEMA_VERSION, 1);
  assert.deepEqual(migrateProgressSnapshot(1, snapshot), snapshot);
});

test("local full and cloud empty uploads V1 without resetting local data", async () => {
  const local = createProgress();
  const payloads = [];
  const repository = {
    async read() {
      return null;
    },
    async upsert(payload) {
      payloads.push(payload);
      return createRemoteRow(payload.progress_data);
    },
  };

  const result = await synchronizeProgressSnapshotWithRepository(
    repository,
    USER_ID,
    local,
  );

  assert.deepEqual(result.progress, local);
  assert.equal(result.syncedAt, UPDATED_AT);
  assert.equal(payloads.length, 1);
  assert.deepEqual(Object.keys(payloads[0]).sort(), [
    "progress_data",
    "schema_version",
    "user_id",
  ]);
  assert.deepEqual(payloads[0], {
    user_id: USER_ID,
    schema_version: 1,
    progress_data: local,
  });
  assert.equal("created_at" in payloads[0], false);
  assert.equal("updated_at" in payloads[0], false);
});

test("a valid cloud V1 snapshot is loaded, merged and uploaded as V1", async () => {
  const remote = createProgress({
    learningTrack: "grammar",
    xp: 280,
    completed: { grammar_sentence_structure: true },
  });
  const local = createProgress({
    xp: 320,
    completed: { hangul_vowels_basic: true },
  });
  const payloads = [];
  const repository = {
    async read() {
      return createRemoteRow(remote);
    },
    async upsert(payload) {
      payloads.push(payload);
      return createRemoteRow(payload.progress_data);
    },
  };

  const result = await synchronizeProgressSnapshotWithRepository(
    repository,
    USER_ID,
    local,
  );

  assert.deepEqual(result.progress.completed, {
    grammar_sentence_structure: true,
    hangul_vowels_basic: true,
  });
  assert.equal(result.progress.xp, 320);
  assert.equal(payloads[0].schema_version, 1);
});

test("an unknown root version is rejected before its payload and never uploaded", async () => {
  let uploads = 0;
  const repository = {
    async read() {
      return createRemoteRow(null, 99);
    },
    async upsert() {
      uploads += 1;
      throw new Error("must not upload");
    },
  };

  await assert.rejects(
    synchronizeProgressSnapshotWithRepository(
      repository,
      USER_ID,
      createProgress(),
    ),
    (error) =>
      error instanceof UnsupportedProgressSchemaVersionError &&
      error.schemaVersion === 99,
  );
  assert.equal(uploads, 0);
});

test("an invalid V1 payload keeps local untouched and never overwrites cloud", async () => {
  const local = createProgress();
  let uploads = 0;
  const repository = {
    async read() {
      return createRemoteRow(null);
    },
    async upsert() {
      uploads += 1;
      throw new Error("must not upload");
    },
  };

  await assert.rejects(
    synchronizeProgressSnapshotWithRepository(repository, USER_ID, local),
    InvalidProgressSnapshotError,
  );
  assert.deepEqual(local, createProgress());
  assert.equal(uploads, 0);
  assert.throws(
    () => migrateProgressSnapshot(1, { xp: 10 }),
    InvalidProgressSnapshotError,
  );
});

test("SQL and TypeScript expose the same strict five-column contract", async () => {
  const migration = await readFile(
    new URL(
      "../supabase/migrations/20260818120000_user_progress.sql",
      import.meta.url,
    ),
    "utf8",
  );
  const syncSource = await readFile(
    new URL("../services/progressSync.ts", import.meta.url),
    "utf8",
  );

  assert.deepEqual(REMOTE_PROGRESS_COLUMNS.split(", "), [
    "user_id",
    "schema_version",
    "progress_data",
    "created_at",
    "updated_at",
  ]);
  for (const column of REMOTE_PROGRESS_COLUMNS.split(", ")) {
    assert.match(migration, new RegExp(`\\b${column}\\b`, "u"));
  }
  assert.match(syncSource, /\.select\(REMOTE_PROGRESS_COLUMNS\)/u);
  assert.match(syncSource, /\.upsert\(payload, \{ onConflict: "user_id" \}\)/u);
  assert.match(syncSource, /const PROGRESS_TABLE = "user_progress"/u);
  assert.doesNotMatch(syncSource, /EXPO_PUBLIC_SUPABASE_PROGRESS_TABLE/u);
  assert.doesNotMatch(syncSource, /new Date\(/u);
  assert.doesNotMatch(migration, /if\s+not\s+exists/iu);
  assert.match(migration, /enable row level security/iu);
  assert.match(migration, /new\.updated_at = now\(\)/u);
});
