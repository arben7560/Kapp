import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Progress } from "../_store";
import { createInitialPedagogicalProgress } from "./pedagogicalProgress.ts";
import {
  createDailyStreakState,
  readDailyStreakSnapshot,
} from "./dailyStreak.ts";
import { readHomeResumeContext } from "./homeResume.ts";
import {
  migrateProgressSnapshot,
  type UserProgressSnapshot,
} from "./progressSnapshot.ts";
import { mergeUserProgressSnapshots } from "./progressMerge.ts";

const USER_SNAPSHOT_ARCHIVE_PREFIX = "kapp:user-snapshot-archive:v2:";
const DETACHED_SNAPSHOT_OWNER_KEY = "kapp:detached-snapshot-owner:v1";

function archiveKey(userId: string) {
  return `${USER_SNAPSHOT_ARCHIVE_PREFIX}${userId}`;
}

export async function readLocalUserProgressSnapshot(
  pedagogicalProgress: Progress,
): Promise<UserProgressSnapshot> {
  const [dailyStreak, homeResume] = await Promise.all([
    readDailyStreakSnapshot(),
    readHomeResumeContext(),
  ]);

  return { pedagogicalProgress, dailyStreak, homeResume };
}

export function createEmptyUserProgressSnapshot(): UserProgressSnapshot {
  return {
    pedagogicalProgress: createInitialPedagogicalProgress(),
    dailyStreak: createDailyStreakState(),
    homeResume: null,
  };
}

export async function archiveUserProgressSnapshot(
  userId: string,
  snapshot: UserProgressSnapshot,
) {
  await AsyncStorage.setItem(archiveKey(userId), JSON.stringify(snapshot));
  await AsyncStorage.setItem(DETACHED_SNAPSHOT_OWNER_KEY, userId);
}

export async function completeUserProgressIsolation(userId: string) {
  const detachedOwner = await AsyncStorage.getItem(
    DETACHED_SNAPSHOT_OWNER_KEY,
  );
  if (detachedOwner === userId) {
    await AsyncStorage.removeItem(DETACHED_SNAPSHOT_OWNER_KEY);
  }
}

export async function mergeArchivedUserProgressSnapshot(
  userId: string,
  localSnapshot: UserProgressSnapshot,
): Promise<UserProgressSnapshot> {
  const detachedOwner = await AsyncStorage.getItem(
    DETACHED_SNAPSHOT_OWNER_KEY,
  );
  if (detachedOwner && detachedOwner !== userId) {
    return createEmptyUserProgressSnapshot();
  }

  const raw = await AsyncStorage.getItem(archiveKey(userId));
  if (!raw) return localSnapshot;

  try {
    const archived = migrateProgressSnapshot(2, JSON.parse(raw));
    return mergeUserProgressSnapshots(archived, localSnapshot);
  } catch (error) {
    console.warn("Impossible de restaurer le snapshot local archivé:", error);
    return localSnapshot;
  }
}
