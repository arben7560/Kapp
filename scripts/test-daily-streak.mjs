import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import AsyncStorageModule from "@react-native-async-storage/async-storage";

const persistedValues = new Map();

Object.assign(AsyncStorageModule, {
  async getItem(key) {
    return persistedValues.get(key) ?? null;
  },
  async setItem(key, value) {
    persistedValues.set(key, value);
  },
});

const {
  completeDailyActivity,
  getDailyStreakState,
  getStreakDateKey,
  resetDailyStreak,
} = await import("../lib/dailyStreak.ts");

const JULY_21 = new Date(2026, 6, 21, 12);

beforeEach(async () => {
  persistedValues.clear();
  await resetDailyStreak();
});

test("la première activité valide exactement un jour", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: JULY_21 });

  const state = await completeDailyActivity("grammar_exercise");

  assert.equal(state.currentStreak, 1);
  assert.equal(state.totalCompletedDays, 1);
  assert.equal(state.isTodayCompleted, true);
  assert.equal(state.lastCompletionResult, "completed");
  assert.deepEqual(state.completedDates["2026-07-21"].activities, [
    "grammar_exercise",
  ]);
});

test("plusieurs activités simultanées le même jour ne comptent qu'un jour", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: JULY_21 });

  await Promise.all([
    completeDailyActivity("hangul_exercise"),
    completeDailyActivity("voice_immersion"),
    completeDailyActivity("hangul_exercise"),
  ]);
  const state = await getDailyStreakState();

  assert.equal(state.currentStreak, 1);
  assert.equal(state.totalCompletedDays, 1);
  assert.equal(Object.keys(state.completedDates).length, 1);
  assert.deepEqual(
    [...state.completedDates["2026-07-21"].activities].sort(),
    ["hangul_exercise", "voice_immersion"],
  );
  assert.equal(state.lastCompletionResult, "already_completed");
});

test("la même activité Hangul répétée le jour suivant prolonge la série", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: JULY_21 });
  await completeDailyActivity("hangul_exercise");

  t.mock.timers.setTime(new Date(2026, 6, 22, 12).getTime());
  const beforeActivity = await getDailyStreakState();
  assert.equal(beforeActivity.todayDate, "2026-07-22");
  assert.equal(beforeActivity.isTodayCompleted, false);

  const state = await completeDailyActivity("hangul_exercise");
  assert.equal(state.currentStreak, 2);
  assert.equal(state.totalCompletedDays, 2);
  assert.equal(state.lastCompletionResult, "completed");
});

test("l'état persisté est restauré après une fermeture logique", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: JULY_21 });
  const completed = await completeDailyActivity("hangul_exercise");

  const restored = await getDailyStreakState();

  assert.notEqual(restored, completed);
  assert.equal(restored.currentStreak, 1);
  assert.equal(restored.lastCompletedDate, "2026-07-21");
  assert.deepEqual(restored.completedDates, completed.completedDates);
});

test("un jour manqué utilise la protection disponible sans double comptage", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: JULY_21 });
  await completeDailyActivity("hangul_exercise");

  t.mock.timers.setTime(new Date(2026, 6, 23, 12).getTime());
  const state = await completeDailyActivity("voice_immersion");

  assert.equal(state.currentStreak, 3);
  assert.equal(state.totalCompletedDays, 2);
  assert.equal(state.freezesAvailable, 0);
  assert.equal(state.freezesUsed, 1);
  assert.equal(state.freezeDates["2026-07-22"], true);
  assert.equal(state.lastCompletionResult, "completed_with_freeze");
});

test("une interruption trop longue redémarre la série", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: JULY_21 });
  await completeDailyActivity("hangul_exercise");

  t.mock.timers.setTime(new Date(2026, 6, 24, 12).getTime());
  const state = await completeDailyActivity("grammar_exercise");

  assert.equal(state.currentStreak, 1);
  assert.equal(state.longestStreak, 1);
  assert.equal(state.totalCompletedDays, 2);
  assert.equal(state.lastCompletionResult, "restarted");
});

test("la journée de streak bascule à 4 h, comme auparavant", () => {
  assert.equal(getStreakDateKey(new Date(2026, 6, 22, 3, 59)), "2026-07-21");
  assert.equal(getStreakDateKey(new Date(2026, 6, 22, 4, 0)), "2026-07-22");
});
