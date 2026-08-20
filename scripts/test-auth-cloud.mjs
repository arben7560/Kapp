import assert from "node:assert/strict";
import test from "node:test";

import {
  translateAuthError,
  validateEmail,
  validatePassword,
} from "../lib/authErrors.ts";
import { parseAuthCallbackUrl } from "../lib/authCallback.ts";

test("les erreurs Supabase sont traduites sans exposer le message technique", () => {
  assert.equal(
    translateAuthError({
      code: "invalid_credentials",
      message: "Invalid login credentials",
    }).message,
    "Email ou mot de passe incorrect.",
  );
  assert.equal(
    translateAuthError({ code: "email_exists" }).code,
    "email-already-used",
  );
  assert.equal(
    translateAuthError({ message: "TypeError: Failed to fetch" }).code,
    "network-unavailable",
  );
  assert.equal(
    translateAuthError({ code: "unexpected_backend_detail" }).message,
    "Une erreur inattendue est survenue. Réessayez dans quelques instants.",
  );
});

test("la validation locale bloque les identifiants incomplets", () => {
  assert.ok(validateEmail("pas-un-email"));
  assert.equal(validateEmail("bonjour@k-app.fr"), null);
  assert.ok(validatePassword("court"));
  assert.equal(validatePassword("assez-long"), null);
});

test("le callback PKCE conserve son intention de confirmation", () => {
  assert.deepEqual(
    parseAuthCallbackUrl("kapp://account/callback?intent=confirm&code=pkce-code"),
    {
      code: "pkce-code",
      accessToken: null,
      refreshToken: null,
      tokenHash: null,
      type: null,
      intent: "confirm",
      errorCode: null,
      errorDescription: null,
    },
  );
});

test("le callback de récupération accepte aussi les jetons dans le fragment", () => {
  const parsed = parseAuthCallbackUrl(
    "kapp://account/callback?intent=recovery#access_token=access&refresh_token=refresh&type=recovery",
  );
  assert.equal(parsed.intent, "recovery");
  assert.equal(parsed.type, "recovery");
  assert.equal(parsed.accessToken, "access");
  assert.equal(parsed.refreshToken, "refresh");
});

test("un callback en erreur reste technique uniquement dans le parseur", () => {
  const parsed = parseAuthCallbackUrl(
    "kapp://account/callback#error=access_denied&error_description=Token%20expired",
  );
  assert.equal(parsed.errorCode, "access_denied");
  assert.equal(parsed.errorDescription, "Token expired");
});
