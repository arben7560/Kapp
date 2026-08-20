import {
  REMOTE_PROGRESS_COLUMNS,
  synchronizeProgressSnapshotWithRepository,
  type ProgressSnapshotRepository,
  type ProgressUpsertPayload,
} from "../lib/progressSyncCore";
import type { UserProgressSnapshot } from "../lib/progressSnapshot";
import { requireSupabaseClient } from "../lib/supabase";

export {
  CURRENT_PROGRESS_SCHEMA_VERSION,
  InvalidProgressSnapshotError,
  loadProgressV1,
  migrateProgressSnapshot,
  UnsupportedProgressSchemaVersionError,
} from "../lib/progressSnapshot";
export {
  progressFingerprint,
  REMOTE_PROGRESS_COLUMNS,
  type ProgressUpsertPayload,
  type RemoteProgressRow,
} from "../lib/progressSyncCore";
export type ProgressSyncStatus =
  | "synced"
  | "syncing"
  | "pending"
  | "offline"
  | "error";

type ProgressSynchronizer = () => Promise<void>;
type ProgressIsolationHandler = (userId: string) => Promise<void>;

const PROGRESS_TABLE = "user_progress";

let activeSynchronizer: ProgressSynchronizer | null = null;
let activeIsolationHandler: ProgressIsolationHandler | null = null;

export function registerProgressSynchronizer(
  synchronizer: ProgressSynchronizer,
  isolationHandler: ProgressIsolationHandler,
) {
  activeSynchronizer = synchronizer;
  activeIsolationHandler = isolationHandler;

  return () => {
    if (activeSynchronizer === synchronizer) {
      activeSynchronizer = null;
      activeIsolationHandler = null;
    }
  };
}

export async function synchronizeProgressNow() {
  if (!activeSynchronizer) {
    throw new Error("ProgressSyncProvider is not mounted.");
  }

  await activeSynchronizer();
}

export async function synchronizeProgressSnapshot(
  userId: string,
  localSnapshot: UserProgressSnapshot,
): Promise<{ snapshot: UserProgressSnapshot; syncedAt: string }> {
  const client = requireSupabaseClient();
  const repository: ProgressSnapshotRepository = {
    async read(id) {
      const { data, error } = await client
        .from(PROGRESS_TABLE)
        .select(REMOTE_PROGRESS_COLUMNS)
        .eq("user_id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    async upsert(payload: ProgressUpsertPayload) {
      const { data, error } = await client
        .from(PROGRESS_TABLE)
        .upsert(payload, { onConflict: "user_id" })
        .select(REMOTE_PROGRESS_COLUMNS)
        .single();

      if (error) throw error;
      return data;
    },
  };

  return synchronizeProgressSnapshotWithRepository(
    repository,
    userId,
    localSnapshot,
  );
}

export function isOfflineSyncError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("offline")
  );
}

export async function isolateProgressAfterSignOut(userId: string) {
  if (!activeIsolationHandler) {
    throw new Error("ProgressSyncProvider is not mounted.");
  }

  await activeIsolationHandler(userId);
}
