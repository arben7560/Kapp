import AsyncStorage from "@react-native-async-storage/async-storage";

import { KappAuthError } from "../lib/authErrors";
import {
  createDailyStreakState,
  persistDailyStreakSnapshot,
  readDailyStreakSnapshot,
} from "../lib/dailyStreak";
import {
  readHomeResumeContext,
  replaceHomeResumeContext,
} from "../lib/homeResume";
import {
  createInitialPedagogicalProgress,
  type Progress,
} from "../lib/pedagogicalProgress";
import {
  persistPedagogicalProgress,
  readPedagogicalProgress,
} from "../lib/pedagogicalProgressStorage";
import {
  normalizeProgressDocument,
  PROGRESS_SCHEMA_VERSION,
  reconcileProgressDocuments,
  type ProgressDocument,
} from "../lib/progressMerge";
import {
  notifyProgressHydration,
  subscribeToLocalProgressMutations,
  withoutProgressMutationTracking,
} from "../lib/progressSyncEvents";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";

export type ProgressSyncStatus =
  | "synced"
  | "syncing"
  | "pending"
  | "offline"
  | "error";

export type ProgressSyncSnapshot = {
  status: ProgressSyncStatus;
  pendingChanges: boolean;
  lastSyncedAt: string | null;
  errorMessage: string | null;
};

type UserSyncMetadata = {
  migrationVersion: number;
  lastSyncedAt: string | null;
  dirty: boolean;
};

type SyncMetadata = {
  schemaVersion: 1;
  users: Record<string, UserSyncMetadata>;
};

const SYNC_METADATA_KEY = "@k_app/progress_sync_meta_v1";
const SYNC_MIGRATION_VERSION = 1;
const DEBOUNCE_MS = 2_500;
const RETRY_DELAYS_MS = [5_000, 15_000, 60_000] as const;

let snapshot: ProgressSyncSnapshot = {
  status: "pending",
  pendingChanges: true,
  lastSyncedAt: null,
  errorMessage: null,
};
const listeners = new Set<() => void>();
let currentUserId: string | null = null;
let generation = 0;
let localRevision = 0;
let retryAttempt = 0;
let suspended = false;
let inFlight: Promise<boolean> | null = null;
let syncRequestedDuringFlight = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let metadataQueue: Promise<void> = Promise.resolve();

function updateSnapshot(next: Partial<ProgressSyncSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

export function getProgressSyncSnapshot(): ProgressSyncSnapshot {
  return snapshot;
}

export function subscribeToProgressSync(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function clearTimer(timer: ReturnType<typeof setTimeout> | null) {
  if (timer) clearTimeout(timer);
}

function isNetworkError(error: unknown) {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String(error.message).toLowerCase()
      : String(error).toLowerCase();
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("offline") ||
    message.includes("timed out")
  );
}

async function readMetadata(): Promise<SyncMetadata> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_METADATA_KEY);
    if (!raw) return { schemaVersion: 1, users: {} };
    const parsed = JSON.parse(raw) as Partial<SyncMetadata>;
    return {
      schemaVersion: 1,
      users:
        parsed.users && typeof parsed.users === "object" ? parsed.users : {},
    };
  } catch {
    return { schemaVersion: 1, users: {} };
  }
}

async function updateUserMetadata(
  userId: string,
  next: Partial<UserSyncMetadata>,
) {
  const operation = metadataQueue.then(async () => {
    const metadata = await readMetadata();
    const previous = metadata.users[userId] ?? {
      migrationVersion: 0,
      lastSyncedAt: null,
      dirty: true,
    };
    metadata.users[userId] = { ...previous, ...next };
    await AsyncStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(metadata));
  });
  metadataQueue = operation.catch(() => undefined);
  await operation;
}

async function readLocalProgressDocument(): Promise<ProgressDocument> {
  const [pedagogicalProgress, dailyStreak, homeResume] = await Promise.all([
    readPedagogicalProgress<Partial<Progress>>(),
    readDailyStreakSnapshot(),
    readHomeResumeContext(),
  ]);
  return normalizeProgressDocument({
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    pedagogicalProgress,
    dailyStreak,
    homeResume,
  });
}

async function writeLocalProgressDocument(document: ProgressDocument) {
  const normalized = normalizeProgressDocument(document);
  await withoutProgressMutationTracking(async () => {
    await Promise.all([
      persistPedagogicalProgress(normalized.pedagogicalProgress),
      persistDailyStreakSnapshot(normalized.dailyStreak),
      replaceHomeResumeContext(normalized.homeResume),
    ]);
  });
  notifyProgressHydration();
}

function scheduleRetry() {
  clearTimer(retryTimer);
  const delay =
    RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)];
  retryAttempt += 1;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void synchronizeProgressNow();
  }, delay);
}

async function performSynchronization(
  userId: string,
  startedGeneration: number,
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    updateSnapshot({
      status: "error",
      pendingChanges: true,
      errorMessage: "La sauvegarde cloud n’est pas configurée.",
    });
    return false;
  }

  const revisionAtStart = localRevision;
  updateSnapshot({ status: "syncing", errorMessage: null });

  try {
    const local = await readLocalProgressDocument();
    const { data, error } = await client
      .from("user_progress")
      .select("schema_version, progress_data, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (startedGeneration !== generation || userId !== currentUserId) {
      return false;
    }

    if (
      data &&
      typeof data.schema_version === "number" &&
      data.schema_version > PROGRESS_SCHEMA_VERSION
    ) {
      throw new Error("unsupported-progress-schema");
    }

    const cloud = data ? normalizeProgressDocument(data.progress_data) : null;
    const reconciliation = reconcileProgressDocuments(local, cloud);
    const { merged } = reconciliation;

    if (reconciliation.shouldWriteLocal) {
      await writeLocalProgressDocument(merged);
    }

    if (reconciliation.shouldUpload) {
      const { error: upsertError } = await client.from("user_progress").upsert(
        {
          user_id: userId,
          schema_version: PROGRESS_SCHEMA_VERSION,
          progress_data: merged,
        },
        { onConflict: "user_id" },
      );
      if (upsertError) throw upsertError;
    }

    if (startedGeneration !== generation || userId !== currentUserId) {
      return false;
    }

    const completedAt = new Date().toISOString();
    const hasNewerLocalChanges = localRevision !== revisionAtStart;
    retryAttempt = 0;
    clearTimer(retryTimer);
    retryTimer = null;
    await updateUserMetadata(userId, {
      migrationVersion: SYNC_MIGRATION_VERSION,
      lastSyncedAt: completedAt,
      dirty: hasNewerLocalChanges,
    });
    updateSnapshot({
      status: hasNewerLocalChanges ? "pending" : "synced",
      pendingChanges: hasNewerLocalChanges,
      lastSyncedAt: completedAt,
      errorMessage: null,
    });
    if (hasNewerLocalChanges) scheduleProgressSync();
    return !hasNewerLocalChanges;
  } catch (error) {
    if (startedGeneration !== generation || userId !== currentUserId) {
      return false;
    }
    const incompatible =
      error instanceof Error && error.message === "unsupported-progress-schema";
    updateSnapshot({
      status: isNetworkError(error) ? "offline" : "error",
      pendingChanges: true,
      errorMessage: incompatible
        ? "Cette sauvegarde utilise une version plus récente de K-App. Mettez l’application à jour."
        : isNetworkError(error)
          ? "Hors ligne. Les modifications restent enregistrées sur cet appareil."
          : "La sauvegarde cloud a échoué. Vos données locales sont conservées.",
    });
    await updateUserMetadata(userId, { dirty: true }).catch(() => undefined);
    if (!incompatible) scheduleRetry();
    if (__DEV__) console.warn("[ProgressSync] Synchronisation impossible:", error);
    return false;
  }
}

export function scheduleProgressSync() {
  if (!currentUserId || suspended || !isSupabaseConfigured) return;
  clearTimer(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void synchronizeProgressNow();
  }, DEBOUNCE_MS);
}

export async function synchronizeProgressNow(): Promise<boolean> {
  if (!currentUserId || suspended) return false;
  if (inFlight) {
    syncRequestedDuringFlight = true;
    return inFlight;
  }
  clearTimer(debounceTimer);
  debounceTimer = null;
  const userId = currentUserId;
  const startedGeneration = generation;
  inFlight = performSynchronization(userId, startedGeneration).finally(() => {
    inFlight = null;
    if (syncRequestedDuringFlight) {
      syncRequestedDuringFlight = false;
      scheduleProgressSync();
    }
  });
  return inFlight;
}

export async function startProgressSync(userId: string) {
  if (currentUserId === userId && !suspended) {
    scheduleProgressSync();
    return;
  }
  generation += 1;
  currentUserId = userId;
  suspended = false;
  retryAttempt = 0;
  clearTimer(debounceTimer);
  clearTimer(retryTimer);
  const metadata = await readMetadata();
  const userMetadata = metadata.users[userId];
  updateSnapshot({
    status: "pending",
    pendingChanges: true,
    lastSyncedAt: userMetadata?.lastSyncedAt ?? null,
    errorMessage: null,
  });
  await synchronizeProgressNow();
}

export function stopProgressSync(userId?: string) {
  if (userId && currentUserId !== userId) return;
  generation += 1;
  currentUserId = null;
  clearTimer(debounceTimer);
  clearTimer(retryTimer);
  debounceTimer = null;
  retryTimer = null;
}

export async function prepareProgressSyncForAccountExit() {
  const synchronized = await synchronizeProgressNow();
  if (!synchronized || snapshot.pendingChanges) {
    throw new KappAuthError(
      "unsynced-progress",
      "La déconnexion est suspendue car des modifications ne sont pas encore sauvegardées. Réessayez avec une connexion réseau.",
    );
  }
  suspended = true;
  clearTimer(debounceTimer);
  clearTimer(retryTimer);
}

export function resumeProgressSyncAfterCancelledExit() {
  suspended = false;
  scheduleProgressSync();
}

export async function clearLocalProgressAfterAccountExit() {
  await writeLocalProgressDocument({
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    pedagogicalProgress: createInitialPedagogicalProgress(),
    dailyStreak: createDailyStreakState(),
    homeResume: null,
  });
  localRevision += 1;
  updateSnapshot({
    status: "pending",
    pendingChanges: true,
    lastSyncedAt: null,
    errorMessage: null,
  });
}

subscribeToLocalProgressMutations(() => {
  localRevision += 1;
  if (!currentUserId || suspended) return;
  updateSnapshot({
    status: "pending",
    pendingChanges: true,
    errorMessage: null,
  });
  void updateUserMetadata(currentUserId, { dirty: true }).catch(() => undefined);
  scheduleProgressSync();
});
