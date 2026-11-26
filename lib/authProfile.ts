import type { User } from "@supabase/supabase-js";

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Supabase keeps OIDC claims in user metadata and on the provider identity. */
export function authProfileFromUser(user: User | null) {
  const claims = user?.user_metadata ?? {};
  const lineIdentity = user?.identities?.find((item) => item.provider === "custom:line");
  const identity = lineIdentity?.identity_data ?? {};
  const displayName = nonEmptyString(claims.full_name) ?? nonEmptyString(claims.name) ??
    nonEmptyString(identity.name) ?? null;
  const picture = nonEmptyString(claims.avatar_url) ?? nonEmptyString(claims.picture) ??
    nonEmptyString(identity.picture);
  return {
    id: user?.id ?? null,
    lineUserId: nonEmptyString(identity.sub),
    displayName,
    avatarUrl: picture && /^https:\/\//u.test(picture) ? picture : null,
    email: nonEmptyString(user?.email),
  };
}
