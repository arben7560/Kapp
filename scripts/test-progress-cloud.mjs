import assert from "node:assert/strict";
import test from "node:test";

import AsyncStorageModule from "@react-native-async-storage/async-storage";

const persistedValues = new Map();
Object.assign(AsyncStorageModule, {
  async getItem(key) {
    return persistedValues.get(key) ?? null;
  },
  async setItem(key, value) {
    persistedValues.set(key, value);
  },
  async removeItem(key) {
    persistedValues.delete(key);
  },
});

const {
  normalizeProgressDocument,
  reconcileProgressDocuments,
} = await import("../lib/progressMerge.ts");

function document(value = {}) {
  return normalizeProgressDocument(value);
}

test("première migration: une progression locale riche est uploadée vers un cloud vide", () => {
  const local = document({
    pedagogicalProgress: {
      xp: 520,
      completed: {
        hangul_vowels_basic: true,
        listen_cafe_session: true,
        cafe_guided_mission_1: true,
      },
      hangulLevel: 3,
      hangulProgress: {
        masteredCharacters: { "ㄱ": true },
        lessons: {},
      },
    },
    dailyStreak: {
      currentStreak: 4,
      longestStreak: 7,
      lastCompletedDate: "2026-08-17",
      completedDates: {
        "2026-08-17": {
          date: "2026-08-17",
          completedAt: "2026-08-17T10:00:00.000Z",
          activities: ["hangul_exercise"],
        },
      },
      freezeDates: {},
      freezesAvailable: 1,
      freezesUsed: 0,
      badges: {},
      totalCompletedDays: 4,
    },
  });

  const plan = reconcileProgressDocuments(local, null);
  assert.equal(plan.shouldWriteLocal, false);
  assert.equal(plan.shouldUpload, true);
  assert.equal(plan.merged.pedagogicalProgress.xp, 520);
  assert.equal(
    plan.merged.pedagogicalProgress.completed.listen_cafe_session,
    true,
  );
  assert.equal(plan.merged.dailyStreak.longestStreak, 7);
});

test("restauration: un cloud riche réhydrate un stockage local neuf", () => {
  const local = document();
  const cloud = document({
    pedagogicalProgress: {
      xp: 880,
      completed: { grammar_sentence_structure: true },
      hangulLevel: 5,
    },
    homeResume: {
      track: "grammar",
      title: "Structure de phrase",
      detail: "Continuer",
      route: "/grammar/sentence-structure",
      updatedAt: "2026-08-17T12:00:00.000Z",
    },
  });

  const plan = reconcileProgressDocuments(local, cloud);
  assert.equal(plan.shouldWriteLocal, true);
  assert.equal(plan.merged.pedagogicalProgress.xp, 880);
  assert.equal(
    plan.merged.pedagogicalProgress.completed.grammar_sentence_structure,
    true,
  );
  assert.equal(plan.merged.homeResume?.track, "grammar");
});

test("les conflits fusionnent complétions, meilleurs scores et activités de streak", () => {
  const local = document({
    pedagogicalProgress: {
      xp: 300,
      completed: { local_lesson: true },
      hangulProgress: {
        masteredCharacters: { "ㄱ": true },
        lessons: {
          basics: {
            discovered: { scene_a: true },
            completedScenes: { scene_a: true },
            masteredScenes: {},
            scores: { scene_a: { bestScore: 7, total: 10, attempts: 2 } },
            errorsByCharacter: { "ㄱ": 2 },
          },
        },
      },
    },
    dailyStreak: {
      completedDates: {
        "2026-08-17": {
          date: "2026-08-17",
          completedAt: "2026-08-17T09:00:00.000Z",
          activities: ["hangul_exercise"],
        },
      },
      currentStreak: 2,
      longestStreak: 3,
      lastCompletedDate: "2026-08-17",
      freezeDates: {},
      freezesAvailable: 1,
      freezesUsed: 0,
      badges: {},
      totalCompletedDays: 2,
    },
  });
  const cloud = document({
    pedagogicalProgress: {
      xp: 420,
      completed: { cloud_lesson: true },
      hangulProgress: {
        masteredCharacters: { "ㅏ": true },
        lessons: {
          basics: {
            discovered: { scene_b: true },
            completedScenes: { scene_b: true },
            masteredScenes: { scene_b: true },
            scores: { scene_a: { bestScore: 9, total: 10, attempts: 3 } },
            errorsByCharacter: { "ㄱ": 4 },
          },
        },
      },
    },
    dailyStreak: {
      completedDates: {
        "2026-08-17": {
          date: "2026-08-17",
          completedAt: "2026-08-17T10:00:00.000Z",
          activities: ["grammar_exercise"],
        },
      },
      currentStreak: 3,
      longestStreak: 5,
      lastCompletedDate: "2026-08-17",
      freezeDates: {},
      freezesAvailable: 1,
      freezesUsed: 0,
      badges: {},
      totalCompletedDays: 3,
    },
  });

  const merged = reconcileProgressDocuments(local, cloud).merged;
  assert.equal(merged.pedagogicalProgress.xp, 420);
  assert.equal(merged.pedagogicalProgress.completed.local_lesson, true);
  assert.equal(merged.pedagogicalProgress.completed.cloud_lesson, true);
  assert.equal(
    merged.pedagogicalProgress.hangulProgress.lessons.basics.scores.scene_a.bestScore,
    9,
  );
  assert.deepEqual(
    [...merged.dailyStreak.completedDates["2026-08-17"].activities].sort(),
    ["grammar_exercise", "hangul_exercise"],
  );
  assert.equal(merged.dailyStreak.longestStreak, 5);
});

test("une migration rejouée après interruption devient idempotente", () => {
  const local = document({
    pedagogicalProgress: {
      xp: 360,
      completed: { counting_market: true },
    },
  });
  const firstAttempt = reconcileProgressDocuments(local, null);
  assert.equal(firstAttempt.shouldUpload, true);

  const resumedAttempt = reconcileProgressDocuments(
    firstAttempt.merged,
    firstAttempt.merged,
  );
  assert.equal(resumedAttempt.shouldWriteLocal, false);
  assert.equal(resumedAttempt.shouldUpload, false);
});
