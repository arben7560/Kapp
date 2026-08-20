type AuthLikeError = {
  code?: string;
  message?: string;
  status?: number;
};

export class KappAuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "KappAuthError";
    this.code = code;
  }
}

export function translateAuthError(error: unknown): KappAuthError {
  if (error instanceof KappAuthError) return error;
  const authError =
    typeof error === "object" && error !== null
      ? (error as AuthLikeError)
      : {};
  const code = (authError.code ?? "").toLowerCase();
  const technicalMessage = (authError.message ?? "").toLowerCase();
  const status = authError.status;

  if (
    code.includes("network") ||
    technicalMessage.includes("fetch") ||
    technicalMessage.includes("network") ||
    technicalMessage.includes("offline")
  ) {
    return new KappAuthError(
      "network-unavailable",
      "Connexion indisponible. Vérifiez votre réseau puis réessayez.",
    );
  }
  if (
    code === "invalid_credentials" ||
    technicalMessage.includes("invalid login credentials")
  ) {
    return new KappAuthError(
      "invalid-credentials",
      "Email ou mot de passe incorrect.",
    );
  }
  if (code.includes("email") && code.includes("invalid")) {
    return new KappAuthError("invalid-email", "Saisissez une adresse email valide.");
  }
  if (
    code === "email_exists" ||
    code === "user_already_exists" ||
    technicalMessage.includes("already registered") ||
    technicalMessage.includes("already been registered") ||
    technicalMessage.includes("already exists")
  ) {
    return new KappAuthError(
      "email-already-used",
      "Un compte utilise déjà cette adresse. Choisissez « J’ai déjà un compte ».",
    );
  }
  if (
    code.includes("weak_password") ||
    technicalMessage.includes("password should") ||
    technicalMessage.includes("password must")
  ) {
    return new KappAuthError(
      "weak-password",
      "Choisissez un mot de passe d’au moins 8 caractères.",
    );
  }
  if (
    code === "email_not_confirmed" ||
    technicalMessage.includes("email not confirmed")
  ) {
    return new KappAuthError(
      "email-confirmation-required",
      "Confirmez d’abord votre adresse depuis l’email reçu.",
    );
  }
  if (code.includes("over_request_rate_limit") || status === 429) {
    return new KappAuthError(
      "too-many-attempts",
      "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
    );
  }
  if (
    code.includes("session") ||
    code.includes("refresh_token") ||
    status === 401
  ) {
    return new KappAuthError(
      "session-expired",
      "Votre session a expiré. Reconnectez-vous pour continuer.",
    );
  }
  if (code === "anonymous_provider_disabled") {
    return new KappAuthError(
      "anonymous-disabled",
      "La session invitée n’est pas encore activée pour ce projet.",
    );
  }
  if (code === "manual_linking_disabled") {
    return new KappAuthError(
      "manual-linking-disabled",
      "La protection de progression doit être activée dans Supabase.",
    );
  }
  return new KappAuthError(
    "unknown",
    "Une erreur inattendue est survenue. Réessayez dans quelques instants.",
  );
}

export function validateEmail(email: string): string | null {
  const normalized = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Saisissez une adresse email valide.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  return null;
}
