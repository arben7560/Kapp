import assert from "node:assert/strict";
import test from "node:test";

import AsyncStorageModule from "@react-native-async-storage/async-storage";

const persistedValues = new Map();
const pendingWrites = [];

Object.assign(AsyncStorageModule, {
  async getItem(key) {
    return persistedValues.get(key) ?? null;
  },
  setItem(key, value) {
    return new Promise((resolve) => {
      pendingWrites.push(() => {
        persistedValues.set(key, value);
        resolve();
      });
    });
  },
});

const {
  PEDAGOGICAL_PROGRESS_STORAGE_KEY,
  persistPedagogicalProgress,
  readPedagogicalProgress,
} = await import("../lib/pedagogicalProgressStorage.ts");

test("pedagogical progress writes stay ordered and restore the latest snapshot", async () => {
  const firstWrite = persistPedagogicalProgress({ xp: 160 });
  const latestWrite = persistPedagogicalProgress({
    completed: { listen_first_exercise: true },
    xp: 200,
  });

  await Promise.resolve();
  assert.equal(pendingWrites.length, 1);

  pendingWrites.shift()();
  await firstWrite;
  await Promise.resolve();
  assert.equal(pendingWrites.length, 1);

  pendingWrites.shift()();
  await latestWrite;

  assert.deepEqual(await readPedagogicalProgress(), {
    completed: { listen_first_exercise: true },
    xp: 200,
  });
  assert.equal(
    persistedValues.has(PEDAGOGICAL_PROGRESS_STORAGE_KEY),
    true,
  );
});

test("hydration reads existing progress without scheduling an empty write", async () => {
  const savedProgress = {
    completed: { hangul_vowels_basic: true },
    xp: 240,
  };
  persistedValues.set(
    PEDAGOGICAL_PROGRESS_STORAGE_KEY,
    JSON.stringify(savedProgress),
  );

  const restored = await readPedagogicalProgress();

  assert.deepEqual(restored, savedProgress);
  assert.equal(pendingWrites.length, 0);
});
