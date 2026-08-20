import AsyncStorage from "@react-native-async-storage/async-storage";
import { notifyLocalProgressMutation } from "./progressSyncEvents.ts";

export const PEDAGOGICAL_PROGRESS_STORAGE_KEY =
  "@k_app/pedagogical_progress_v1";

let persistenceQueue: Promise<void> = Promise.resolve();

function enqueuePersistence<T>(operation: () => Promise<T>): Promise<T> {
  const result = persistenceQueue.then(operation, operation);
  persistenceQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function readPedagogicalProgress<T>(): Promise<T | null> {
  return enqueuePersistence(async () => {
    const raw = await AsyncStorage.getItem(PEDAGOGICAL_PROGRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  });
}

export function persistPedagogicalProgress(
  progress: unknown,
): Promise<void> {
  const serializedProgress = JSON.stringify(progress);

  return enqueuePersistence(async () => {
    await AsyncStorage.setItem(
      PEDAGOGICAL_PROGRESS_STORAGE_KEY,
      serializedProgress,
    );
    notifyLocalProgressMutation("pedagogical");
  });
}
