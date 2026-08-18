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

export function toKappAuthError(error: unknown): KappAuthError {
  if (error instanceof KappAuthError) return error;

  const message = normalizedMessage(error);

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("offline")
  ) {
    return new KappAuthError(
      "network-unavailable",
      "Connexion indisponible. Votre progression reste enregistrée sur cet appareil.",
      { cause: error },
    );
  }

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return new KappAuthError(
      "invalid-credentials",
      "Email ou mot de passe incorrect.",
      { cause: error },
    );
  }

  if (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("already exists")
  ) {
    return new KappAuthError(
      "email-already-used",
      "Cette adresse est déjà associée à un compte. Utilisez « J’ai déjà un compte ».",
      { cause: error },
    );
  }

  if (message.includes("password") && message.includes("characters")) {
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
