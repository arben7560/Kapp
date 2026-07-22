import { useCallback, useEffect, useState } from "react";

import { IMMERSIVE_MEDIA_LOAD_TIMEOUT_MS } from "../constants/immersive-layout";

export type ImmersiveMediaStatus = "idle" | "loading" | "ready" | "error";

export function useImmersiveMediaStatus(source: number | null) {
  const [resolvedState, setResolvedState] = useState<{
    source: number;
    status: "ready" | "error";
  } | null>(null);
  const status: ImmersiveMediaStatus = !source
    ? "idle"
    : resolvedState?.source === source
      ? resolvedState.status
      : "loading";

  useEffect(() => {
    if (!source) return;

    const timeout = setTimeout(() => {
      setResolvedState((current) =>
        current?.source === source && current.status === "ready"
          ? current
          : { source, status: "error" },
      );
    }, IMMERSIVE_MEDIA_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [source]);

  const markReady = useCallback((loadedSource: number | null) => {
    if (loadedSource) setResolvedState({ source: loadedSource, status: "ready" });
  }, []);

  const markError = useCallback((failedSource: number | null) => {
    if (failedSource) setResolvedState({ source: failedSource, status: "error" });
  }, []);

  return { status, markReady, markError };
}
