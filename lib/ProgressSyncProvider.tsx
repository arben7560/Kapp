import React from "react";

import { useStore } from "../_store";
import {
  isOfflineSyncError,
  progressFingerprint,
  registerProgressSynchronizer,
  synchronizeProgressSnapshot,
  type ProgressSyncStatus,
} from "../services/progressSync";
import { useAuth } from "./AuthProvider";
import {
  archiveUserProgressSnapshot,
  completeUserProgressIsolation,
  createEmptyUserProgressSnapshot,
  mergeArchivedUserProgressSnapshot,
  readLocalUserProgressSnapshot,
} from "./progressSnapshotStorage";
import {
  notifyProgressHydration,
  subscribeToLocalProgressMutations,
  withoutProgressMutationTracking,
} from "./progressSyncEvents";
import { persistDailyStreakSnapshot } from "./dailyStreak";
import { replaceHomeResumeContext } from "./homeResume";
import { mergeUserProgressSnapshots } from "./progressMerge";

type ProgressSyncContextValue = {
  status: ProgressSyncStatus;
  lastSyncedAt: string | null;
  errorMessage: string | null;
};

const ProgressSyncContext = React.createContext<
  ProgressSyncContextValue | undefined
>(undefined);

const AUTO_SYNC_DELAY_MS = 1_200;

export function ProgressSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const { progress, setProgress, isHydrated } = useStore();
  const progressRef = React.useRef(progress);
  const userIdRef = React.useRef<string | null>(auth.user?.id ?? null);
  const inFlightRef = React.useRef<{
    userId: string;
    operation: Promise<void>;
  } | null>(null);
  const lastSyncedFingerprintRef = React.useRef<string | null>(null);
  const mutationRevisionRef = React.useRef(0);
  const [mutationRevision, setMutationRevision] = React.useState(0);
  const [status, setStatus] = React.useState<ProgressSyncStatus>("pending");
  const [lastSyncedAt, setLastSyncedAt] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  React.useEffect(
    () => subscribeToLocalProgressMutations(
      () => {
        setStatus("pending");
        mutationRevisionRef.current += 1;
        setMutationRevision((revision) => revision + 1);
      },
    ),
    [],
  );

  const applyLocalSnapshot = React.useCallback(async (snapshot: Awaited<
    ReturnType<typeof readLocalUserProgressSnapshot>
  >) => {
    await withoutProgressMutationTracking(async () => {
      if (
        progressFingerprint({
          ...snapshot,
          dailyStreak: null,
          homeResume: null,
        }) !== progressFingerprint({
          pedagogicalProgress: progressRef.current,
          dailyStreak: null,
          homeResume: null,
        })
      ) {
        await setProgress(snapshot.pedagogicalProgress);
        progressRef.current = snapshot.pedagogicalProgress;
      }

      if (snapshot.dailyStreak) {
        await persistDailyStreakSnapshot(snapshot.dailyStreak);
      }
      await replaceHomeResumeContext(snapshot.homeResume);
    });
    notifyProgressHydration();
  }, [setProgress]);

  const isolateAfterSignOut = React.useCallback(async (userId: string) => {
    const snapshot = await readLocalUserProgressSnapshot(progressRef.current);
    await archiveUserProgressSnapshot(userId, snapshot);
    await applyLocalSnapshot(createEmptyUserProgressSnapshot());
    await completeUserProgressIsolation(userId);
    lastSyncedFingerprintRef.current = null;
    setLastSyncedAt(null);
    setStatus("pending");
  }, [applyLocalSnapshot]);

  React.useEffect(() => {
    const nextUserId = auth.user?.id ?? null;
    if (userIdRef.current !== nextUserId) {
      userIdRef.current = nextUserId;
      lastSyncedFingerprintRef.current = null;
      setLastSyncedAt(null);
      setStatus(nextUserId ? "pending" : "offline");
    }
  }, [auth.user?.id]);

  const synchronize = React.useCallback((): Promise<void> => {
    const userId = userIdRef.current;
    if (!auth.isConfigured || !userId || !isHydrated) {
      setStatus(auth.isConfigured ? "pending" : "offline");
      return Promise.resolve();
    }

    const startOperation = () => {
      const operation = (async () => {
        const startedAtMutationRevision = mutationRevisionRef.current;
        setStatus("syncing");
        setErrorMessage(null);

        try {
          const localSnapshot = await readLocalUserProgressSnapshot(
            progressRef.current,
          );
          if (userIdRef.current !== userId) return;
          const snapshotWithArchive = await mergeArchivedUserProgressSnapshot(
            userId,
            localSnapshot,
          );
          if (userIdRef.current !== userId) return;
          const result = await synchronizeProgressSnapshot(
            userId,
            snapshotWithArchive,
          );
          const mergedFingerprint = progressFingerprint(result.snapshot);

          // An auth transition may complete while the previous UID is still
          // synchronizing. Never apply that obsolete user's snapshot locally.
          if (userIdRef.current !== userId) return;

          const currentSnapshot = await readLocalUserProgressSnapshot(
            progressRef.current,
          );
          if (userIdRef.current !== userId) return;
          const safeLocalSnapshot = mergeUserProgressSnapshots(
            result.snapshot,
            currentSnapshot,
          );
          if (
            progressFingerprint(safeLocalSnapshot) !==
            progressFingerprint(currentSnapshot)
          ) {
            await applyLocalSnapshot(safeLocalSnapshot);
          }

          lastSyncedFingerprintRef.current = mergedFingerprint;
          setLastSyncedAt(result.syncedAt);
          setStatus(
            mutationRevisionRef.current === startedAtMutationRevision
              ? "synced"
              : "pending",
          );
        } catch (caught) {
          if (userIdRef.current !== userId) return;
          console.error("[progress-sync] Cloud snapshot synchronization failed.", caught);
          const offline = isOfflineSyncError(caught);
          setStatus(offline ? "offline" : "error");
          setErrorMessage(
            offline
              ? "La progression locale sera synchronisée au retour du réseau."
              : "La sauvegarde cloud n’a pas abouti. Votre progression locale reste intacte.",
          );
          throw caught;
        } finally {
          if (inFlightRef.current?.userId === userId) {
            inFlightRef.current = null;
          }
        }
      })();

      inFlightRef.current = { userId, operation };
      return operation;
    };

    const inFlight = inFlightRef.current;
    if (inFlight?.userId === userId) return inFlight.operation;
    if (!inFlight) return startOperation();

    return inFlight.operation.catch(() => undefined).then(() => {
      if (userIdRef.current !== userId) return;
      const nextInFlight = inFlightRef.current;
      return nextInFlight?.userId === userId
        ? nextInFlight.operation
        : startOperation();
    });
  }, [applyLocalSnapshot, auth.isConfigured, isHydrated]);

  React.useEffect(
    () => registerProgressSynchronizer(synchronize, isolateAfterSignOut),
    [isolateAfterSignOut, synchronize],
  );

  React.useEffect(() => {
    if (!auth.isConfigured || !auth.user || !isHydrated) return;

    const timer = setTimeout(() => {
      void synchronize().catch(() => undefined);
    }, AUTO_SYNC_DELAY_MS);

    return () => clearTimeout(timer);
  }, [
    auth.isConfigured,
    auth.user,
    isHydrated,
    mutationRevision,
    progress,
    synchronize,
  ]);

  const value = React.useMemo(
    () => ({ status, lastSyncedAt, errorMessage }),
    [errorMessage, lastSyncedAt, status],
  );

  return (
    <ProgressSyncContext.Provider value={value}>
      {children}
    </ProgressSyncContext.Provider>
  );
}

export function useProgressSync() {
  const context = React.useContext(ProgressSyncContext);

  if (!context) {
    throw new Error(
      "useProgressSync must be used inside ProgressSyncProvider.",
    );
  }

  return context;
}
