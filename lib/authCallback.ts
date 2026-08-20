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
