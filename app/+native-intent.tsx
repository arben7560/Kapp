import { matchesAuthCallbackUrl, parseAuthCallbackUrl } from "../lib/authCallback";

/** AuthProvider and WebBrowser receive the original Linking event independently. */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    const url = new URL(path, "kapp:///");
    if (!matchesAuthCallbackUrl(url.href, "kapp://account") &&
        !matchesAuthCallbackUrl(url.href, "kapp:///account")) return path;
    const callback = parseAuthCallbackUrl(url.href);
    if (!callback.hasAuthPayload && !callback.accessToken && !callback.refreshToken) return path;

    // A warm callback is an auth event, not a request to push another Account
    // screen. In Expo Router 58 an empty href skips the navigation listener.
    if (!initial) return "";

    // Cold starts still open Account, but credentials never enter router state.
    const action = url.searchParams.get("action");
    const knownAction = action && /^(recovery|protect|oauth-(login|link)-(google|apple))$/u.test(action);
    return knownAction ? `/account?action=${action}` : "/account";
  } catch {
    return path;
  }
}
