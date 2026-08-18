export type KappOAuthProvider = "google" | "apple";

export type ParsedAuthCallback = {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  errorCode: string | null;
  errorDescription: string | null;
  hasAuthPayload: boolean;
};

export function parseAuthCallbackUrl(url: string): ParsedAuthCallback {
  const parsedUrl = new URL(url);
  const fragment = new URLSearchParams(parsedUrl.hash.replace(/^#/u, ""));
  const read = (key: string) =>
    parsedUrl.searchParams.get(key) ?? fragment.get(key);
  const code = read("code");
  const accessToken = read("access_token");
  const refreshToken = read("refresh_token");
  const errorCode = read("error_code") ?? read("error");
  const errorDescription = read("error_description");

  return {
    code,
    accessToken,
    refreshToken,
    errorCode,
    errorDescription,
    hasAuthPayload: Boolean(
      code ||
        (accessToken && refreshToken) ||
        errorCode ||
        errorDescription,
    ),
  };
}

export function authProvidersFromUser(
  user:
    | {
        app_metadata?: { provider?: unknown; providers?: unknown };
        identities?: { provider?: string }[] | null;
      }
    | null,
) {
  if (!user) return [];

  const providers = new Set<string>();
  const metadataProviders = user.app_metadata?.providers;
  if (Array.isArray(metadataProviders)) {
    for (const provider of metadataProviders) {
      if (typeof provider === "string") providers.add(provider);
    }
  }
  if (typeof user.app_metadata?.provider === "string") {
    providers.add(user.app_metadata.provider);
  }
  for (const identity of user.identities ?? []) {
    if (identity.provider) providers.add(identity.provider);
  }

  return [...providers];
}

export function assertLinkedUserId(expectedUserId: string, actualUserId: string) {
  if (expectedUserId !== actualUserId) {
    throw new Error("linked identity changed the authenticated user id");
  }
}
