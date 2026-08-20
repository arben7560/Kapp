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
  const [status, setStatus] = React.useState<ProgressSyncStatus>("pending");
  const [lastSyncedAt, setLastSyncedAt] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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
        setStatus("syncing");
        setErrorMessage(null);

        try {
          const result = await synchronizeProgressSnapshot(
            userId,
            progressRef.current,
          );
          const mergedFingerprint = progressFingerprint(result.progress);

          // An auth transition may complete while the previous UID is still
          // synchronizing. Never apply that obsolete user's snapshot locally.
          if (userIdRef.current !== userId) return;

          if (mergedFingerprint !== progressFingerprint(progressRef.current)) {
            await setProgress(result.progress);
            progressRef.current = result.progress;
          }

          lastSyncedFingerprintRef.current = mergedFingerprint;
          setLastSyncedAt(result.syncedAt);
          setStatus("synced");
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
  }, [auth.isConfigured, isHydrated, setProgress]);

  React.useEffect(
    () => registerProgressSynchronizer(synchronize),
    [synchronize],
  );

  React.useEffect(() => {
    if (!auth.isConfigured || !auth.user || !isHydrated) return;

    const fingerprint = progressFingerprint(progress);
    if (fingerprint === lastSyncedFingerprintRef.current) return;

    setStatus("pending");
    const timer = setTimeout(() => {
      void synchronize().catch(() => undefined);
    }, AUTO_SYNC_DELAY_MS);

    return () => clearTimeout(timer);
  }, [auth.isConfigured, auth.user, isHydrated, progress, synchronize]);

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
