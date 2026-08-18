type AuthErrorCode =
  | "auth-not-configured"
  | "invalid-email"
  | "invalid-credentials"
  | "password-too-short"
  | "password-mismatch"
  | "email-already-used"
  | "anonymous-session-required"
  | "confirmation-email-missing"
  | "delete-account-unavailable"
  | "oauth-cancelled"
  | "oauth-provider-disabled"
  | "oauth-linking-disabled"
  | "identity-already-used"
  | "auth-link-invalid"
  | "auth-link-expired"
  | "rate-limited"
  | "session-expired"
  | "network-unavailable"
  | "auth-operation-failed";

export class KappAuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "KappAuthError";
    this.code = code;
  }
}

function normalizedMessage(error: unknown) {
  if (error instanceof Error) return error.message.toLowerCase();
  if (typeof error === "string") return error.toLowerCase();
  return "";
}

function normalizedCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code.toLowerCase();
  }
  return "";
}

export function toKappAuthError(error: unknown): KappAuthError {
  if (error instanceof KappAuthError) return error;

  const message = normalizedMessage(error);
  const code = normalizedCode(error);
  const detail = `${code} ${message}`;

  if (
    detail.includes("network") ||
    detail.includes("fetch") ||
    detail.includes("offline") ||
    detail.includes("timeout")
  ) {
    return new KappAuthError(
      "network-unavailable",
      "Connexion indisponible. Votre progression reste enregistrée sur cet appareil.",
      { cause: error },
    );
  }

  if (detail.includes("provider_disabled")) {
    return new KappAuthError(
      "oauth-provider-disabled",
      "Ce mode de connexion n’est pas encore activé pour K-App.",
      { cause: error },
    );
  }

  if (
    detail.includes("manual_linking_disabled") ||
    detail.includes("manual linking is disabled")
  ) {
    return new KappAuthError(
      "oauth-linking-disabled",
      "La liaison de compte doit être activée dans la configuration Supabase.",
      { cause: error },
    );
  }

  if (
    detail.includes("identity_already_exists") ||
    detail.includes("identity is already linked") ||
    detail.includes("already linked to another user")
  ) {
    return new KappAuthError(
      "identity-already-used",
      "Cette identité est déjà associée à un autre compte K-App.",
      { cause: error },
    );
  }

  if (
    detail.includes("flow_state_not_found") ||
    detail.includes("bad_code_verifier") ||
    detail.includes("exchange_code_not_found")
  ) {
    return new KappAuthError(
      "auth-link-invalid",
      "Ce lien de connexion n’est plus valide ou a déjà été utilisé. Relancez l’opération depuis K-App.",
      { cause: error },
    );
  }

  if (
    detail.includes("otp_expired") ||
    detail.includes("expired") && detail.includes("link")
  ) {
    return new KappAuthError(
      "auth-link-expired",
      "Ce lien a expiré. Demandez-en un nouveau depuis K-App.",
      { cause: error },
    );
  }

  if (
    detail.includes("over_email_send_rate_limit") ||
    detail.includes("rate limit") ||
    detail.includes("too many requests")
  ) {
    return new KappAuthError(
      "rate-limited",
      "Trop de tentatives rapprochées. Patientez quelques minutes avant de réessayer.",
      { cause: error },
    );
  }

  if (
    detail.includes("session_not_found") ||
    detail.includes("refresh_token_not_found") ||
    detail.includes("invalid refresh token")
  ) {
    return new KappAuthError(
      "session-expired",
      "Votre session a expiré. Reconnectez-vous pour reprendre la synchronisation.",
      { cause: error },
    );
  }

  if (
    detail.includes("invalid login credentials") ||
    detail.includes("invalid credentials")
  ) {
    return new KappAuthError(
      "invalid-credentials",
      "Email ou mot de passe incorrect.",
      { cause: error },
    );
  }

  if (
    detail.includes("already registered") ||
    detail.includes("already been registered") ||
    detail.includes("email_exists") ||
    detail.includes("user_already_exists")
  ) {
    return new KappAuthError(
      "email-already-used",
      "Cette adresse est déjà associée à un compte. Utilisez « J’ai déjà un compte ».",
      { cause: error },
    );
  }

  if (
    detail.includes("weak_password") ||
    detail.includes("password") && detail.includes("characters")
  ) {
    return new KappAuthError(
      "password-too-short",
      "Le mot de passe doit contenir au moins 8 caractères.",
      { cause: error },
    );
  }

  return new KappAuthError(
    "auth-operation-failed",
    "L’opération n’a pas abouti. Réessayez dans quelques instants.",
    { cause: error },
  );
}

export function validateEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalized)) {
    throw new KappAuthError(
      "invalid-email",
      "Saisissez une adresse email valide.",
    );
  }

  return normalized;
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    throw new KappAuthError(
      "password-too-short",
      "Le mot de passe doit contenir au moins 8 caractères.",
    );
  }
}
