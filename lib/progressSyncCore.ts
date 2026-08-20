import { mergeUserProgressSnapshots } from "./progressMerge.ts";
import {
  CURRENT_PROGRESS_SCHEMA_VERSION,
  InvalidProgressSnapshotError,
  migrateProgressSnapshot,
  type UserProgressSnapshot,
} from "./progressSnapshot.ts";

export const REMOTE_PROGRESS_COLUMNS =
  "user_id, schema_version, progress_data, created_at, updated_at" as const;

export type RemoteProgressRow = {
  user_id: string;
  schema_version: number;
  progress_data: unknown;
  created_at: string;
  updated_at: string;
};

export type ProgressUpsertPayload = {
  user_id: string;
  schema_version: typeof CURRENT_PROGRESS_SCHEMA_VERSION;
  progress_data: UserProgressSnapshot;
};

export type ProgressSnapshotRepository = {
  read(userId: string): Promise<unknown | null>;
  upsert(payload: ProgressUpsertPayload): Promise<unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRemoteProgressRow(value: unknown): RemoteProgressRow {
  if (!isRecord(value)) {
    throw new InvalidProgressSnapshotError(
      "the user_progress row must be an object.",
    );
  }
  if (typeof value.user_id !== "string" || value.user_id.length === 0) {
    throw new InvalidProgressSnapshotError("user_id is missing or invalid.");
  }
  if (typeof value.schema_version !== "number" ||
    !Number.isInteger(value.schema_version) ||
    value.schema_version < 1) {
    throw new InvalidProgressSnapshotError(
      "schema_version is missing or invalid.",
    );
  }
  if (!Object.prototype.hasOwnProperty.call(value, "progress_data")) {
    throw new InvalidProgressSnapshotError("progress_data is missing.");
  }
  if (typeof value.created_at !== "string" || value.created_at.length === 0) {
    throw new InvalidProgressSnapshotError("created_at is missing or invalid.");
  }
  if (typeof value.updated_at !== "string" || value.updated_at.length === 0) {
    throw new InvalidProgressSnapshotError("updated_at is missing or invalid.");
  }

  return {
    user_id: value.user_id,
    schema_version: value.schema_version,
    progress_data: value.progress_data,
    created_at: value.created_at,
    updated_at: value.updated_at,
  };
}

export function progressFingerprint(snapshot: UserProgressSnapshot) {
  return JSON.stringify(snapshot);
}

export async function synchronizeProgressSnapshotWithRepository(
  repository: ProgressSnapshotRepository,
  userId: string,
  localSnapshot: UserProgressSnapshot,
): Promise<{ snapshot: UserProgressSnapshot; syncedAt: string }> {
  const remoteValue = await repository.read(userId);
  const remoteRow = remoteValue === null
    ? null
    : parseRemoteProgressRow(remoteValue);
  if (remoteRow && remoteRow.user_id !== userId) {
    throw new InvalidProgressSnapshotError(
      "the returned user_id does not match the requested user.",
    );
  }
  const remoteSnapshot = remoteRow
    ? migrateProgressSnapshot(
        remoteRow.schema_version,
        remoteRow.progress_data,
      )
    : null;
  const mergedSnapshot = remoteSnapshot
    ? mergeUserProgressSnapshots(remoteSnapshot, localSnapshot)
    : localSnapshot;
  const storedFingerprint = remoteRow
    ? JSON.stringify(remoteRow.progress_data)
    : null;
  const mergedFingerprint = progressFingerprint(mergedSnapshot);

  if (storedFingerprint === mergedFingerprint && remoteRow) {
    return {
      snapshot: mergedSnapshot,
      syncedAt: remoteRow.updated_at,
    };
  }

  const persistedValue = await repository.upsert({
    user_id: userId,
    schema_version: CURRENT_PROGRESS_SCHEMA_VERSION,
    progress_data: mergedSnapshot,
  });
  const persistedRow = parseRemoteProgressRow(persistedValue);
  if (persistedRow.user_id !== userId) {
    throw new InvalidProgressSnapshotError(
      "the persisted user_id does not match the requested user.",
    );
  }

  // Validate the server-returned version before trusting its JSON or timestamp.
  migrateProgressSnapshot(
    persistedRow.schema_version,
    persistedRow.progress_data,
  );

  return {
    snapshot: mergedSnapshot,
    syncedAt: persistedRow.updated_at,
  };
}
