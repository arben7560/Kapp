/** Bound native auth requests too: a UI deadline alone cannot abort a late
 * PKCE response that would otherwise install a session after a retry/logout. */
export function createAuthFetch(baseUrl: string, fetcher: typeof fetch = fetch): typeof fetch {
  const authPrefix = `${baseUrl.replace(/\/$/u, "")}/auth/v1/`;
  return async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(authPrefix)) return fetcher(input, init);

    const controller = new AbortController();
    const callerSignal = init?.signal ?? (typeof input === "object" && "signal" in input ? input.signal : null);
    const abortFromCaller = () => controller.abort();
    if (callerSignal?.aborted) controller.abort();
    else callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20_000);
    try {
      return await fetcher(input, { ...init, signal: controller.signal });
    } catch (caught) {
      if (timedOut) throw new Error("Authentication network timeout", { cause: caught });
      throw caught;
    } finally {
      clearTimeout(timer);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    }
  };
}
