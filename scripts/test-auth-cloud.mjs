import assert from "node:assert/strict";
import test from "node:test";

import {
  KappAuthError,
  toKappAuthError,
  validateEmail,
  validatePassword,
} from "../lib/authErrors.ts";
import { matchesAuthCallbackUrl, parseAuthCallbackUrl } from "../lib/authCallback.ts";

test("les erreurs Supabase sont traduites sans exposer le message technique", () => {
  assert.equal(
    toKappAuthError({
      code: "invalid_credentials",
      message: "Invalid login credentials",
    }).message,
    "Email ou mot de passe incorrect.",
  );
  assert.equal(
    toKappAuthError({ code: "email_exists" }).code,
    "email-already-used",
  );
  assert.equal(
    toKappAuthError(new TypeError("Failed to fetch")).code,
    "network-unavailable",
  );
  assert.equal(
    toKappAuthError({ code: "unexpected_backend_detail" }).message,
    "L’opération n’a pas abouti. Réessayez dans quelques instants.",
  );
});

test("la validation locale bloque les identifiants incomplets", () => {
  assert.throws(() => validateEmail("pas-un-email"), KappAuthError);
  assert.equal(validateEmail("bonjour@k-app.fr"), "bonjour@k-app.fr");
  assert.throws(() => validatePassword("court"), KappAuthError);
  assert.doesNotThrow(() => validatePassword("assez-long"));
});

test("le callback PKCE conserve son intention de confirmation", () => {
  assert.deepEqual(
    parseAuthCallbackUrl("kapp://account?action=protect&code=pkce-code"),
    {
      code: "pkce-code",
      accessToken: null,
      refreshToken: null,
      errorCode: null,
      errorDescription: null,
      hasAuthPayload: true,
    },
  );
});

test("le callback de récupération accepte aussi les jetons dans le fragment", () => {
  const parsed = parseAuthCallbackUrl(
    "kapp://account?action=recovery#access_token=access&refresh_token=refresh&type=recovery",
  );
  assert.equal(matchesAuthCallbackUrl("kapp://account?action=recovery#access_token=access&refresh_token=refresh", "kapp://account?action=recovery"), true);
  assert.equal(parsed.accessToken, "access");
  assert.equal(parsed.refreshToken, "refresh");
});

test("un callback en erreur reste technique uniquement dans le parseur", () => {
  const parsed = parseAuthCallbackUrl(
    "kapp://account/callback#error=access_denied&error_description=Token%20expired",
  );
  assert.equal(parsed.errorCode, "access_denied");
  assert.equal(parsed.errorDescription, "Token expired");
  const safe = toKappAuthError(Object.assign(new Error(parsed.errorDescription), { code: parsed.errorCode }));
  assert.equal(safe.code, "oauth-access-denied");
  assert.doesNotMatch(safe.message, /Token expired/u);
});
