import type { Progress } from "../_store";
import {
  REMOTE_PROGRESS_COLUMNS,
  synchronizeProgressSnapshotWithRepository,
  type ProgressSnapshotRepository,
  type ProgressUpsertPayload,
} from "../lib/progressSyncCore";
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

const PROGRESS_TABLE = "user_progress";

let activeSynchronizer: ProgressSynchronizer | null = null;

export function registerProgressSynchronizer(
  synchronizer: ProgressSynchronizer,
) {
  activeSynchronizer = synchronizer;

  return () => {
    if (activeSynchronizer === synchronizer) {
      activeSynchronizer = null;
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
  localProgress: Progress,
): Promise<{ progress: Progress; syncedAt: string }> {
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
    localProgress,
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
