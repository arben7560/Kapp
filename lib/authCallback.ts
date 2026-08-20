<<<<<<< HEAD
export type AuthCallbackParameters = {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenHash: string | null;
  type: string | null;
  intent: string | null;
  errorCode: string | null;
  errorDescription: string | null;
};

export function parseAuthCallbackUrl(url: string): AuthCallbackParameters {
  const queryStart = url.indexOf("?");
  const hashStart = url.indexOf("#");
  const query =
    queryStart >= 0
      ? url.slice(queryStart + 1, hashStart >= 0 ? hashStart : undefined)
      : "";
  const hash = hashStart >= 0 ? url.slice(hashStart + 1) : "";
  const params = new URLSearchParams(
    [query, hash].filter(Boolean).join("&"),
  );
  return {
    code: params.get("code"),
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    tokenHash: params.get("token_hash"),
    type: params.get("type"),
    intent: params.get("intent"),
    errorCode: params.get("error_code") ?? params.get("error"),
    errorDescription: params.get("error_description"),
  };
}
=======
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
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
