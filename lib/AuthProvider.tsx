import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import React from "react";

import {
  KappAuthError,
  toKappAuthError,
  validateEmail,
  validatePassword,
} from "./authErrors";
import {
  isSupabaseConfigured,
  requireSupabaseClient,
  supabase,
} from "./supabase";
import { synchronizeProgressNow } from "../services/progressSync";

const PENDING_PROTECTION_EMAIL_KEY =
  "@k_app/auth/pending_protection_email_v1";
const DELETE_ACCOUNT_FUNCTION =
  process.env.EXPO_PUBLIC_SUPABASE_DELETE_ACCOUNT_FUNCTION?.trim() ||
  "delete-account";

export type ProtectProgressResult = "protected" | "confirmation-required";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isConfigured: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isPermanentAccount: boolean;
  needsPasswordSetup: boolean;
  isPasswordRecovery: boolean;
  confirmationEmail: string | null;
  error: string | null;
  clearError: () => void;
  protectProgress: (
    email: string,
    password: string,
  ) => Promise<ProtectProgressResult>;
  completeAccountProtection: (password: string) => Promise<void>;
  resendProtectionEmail: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

function isAnonymousUser(user: User | null) {
  return Boolean(user?.is_anonymous);
}

function requireConfiguredAuth() {
  if (!isSupabaseConfigured) {
    throw new KappAuthError(
      "auth-not-configured",
      "La sauvegarde cloud n’est pas configurée dans cette version de K-App.",
    );
  }

  return requireSupabaseClient();
}

function protectionRedirectUrl() {
  return Linking.createURL("/account", {
    queryParams: { action: "protect" },
  });
}

function recoveryRedirectUrl() {
  return Linking.createURL("/account", {
    queryParams: { action: "recovery" },
  });
}

async function createAnonymousSession() {
  const client = requireConfiguredAuth();
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

async function applyAuthUrl(url: string) {
  const client = requireConfiguredAuth();
  const parsedUrl = new URL(url);
  const fragment = new URLSearchParams(parsedUrl.hash.replace(/^#/u, ""));
  const errorDescription =
    parsedUrl.searchParams.get("error_description") ||
    fragment.get("error_description");

  if (errorDescription) throw new Error(errorDescription);

  const code = parsedUrl.searchParams.get("code");
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const accessToken = fragment.get("access_token");
  const refreshToken = fragment.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(isSupabaseConfigured);
  const [error, setError] = React.useState<string | null>(
    isSupabaseConfigured
      ? null
      : "La sauvegarde cloud n’est pas configurée dans cet environnement.",
  );
  const [confirmationEmail, setConfirmationEmail] = React.useState<
    string | null
  >(null);
  const [needsPasswordSetup, setNeedsPasswordSetup] = React.useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = React.useState(false);

  const captureError = React.useCallback((caught: unknown) => {
    const mapped = toKappAuthError(caught);
    setError(mapped.message);
    return mapped;
  }, []);

  React.useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let mounted = true;
    const { data: authListener } = client.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        setIsLoading(false);

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        }

        if (event === "USER_UPDATED" || event === "SIGNED_IN") {
          void AsyncStorage.getItem(PENDING_PROTECTION_EMAIL_KEY).then(
            (pendingEmail) => {
              if (!mounted || !pendingEmail) return;
              setConfirmationEmail(pendingEmail);
              setNeedsPasswordSetup(
                Boolean(nextSession?.user) &&
                  !isAnonymousUser(nextSession?.user ?? null),
              );
            },
          );
        }
      },
    );

    const initialize = async () => {
      try {
        const [sessionResult, pendingEmail, initialUrl] = await Promise.all([
          client.auth.getSession(),
          AsyncStorage.getItem(PENDING_PROTECTION_EMAIL_KEY),
          Linking.getInitialURL(),
        ]);
        if (sessionResult.error) throw sessionResult.error;

        if (pendingEmail && mounted) setConfirmationEmail(pendingEmail);
        if (initialUrl) await applyAuthUrl(initialUrl);

        const refreshedSession = (await client.auth.getSession()).data.session;
        const resolvedSession = refreshedSession ?? sessionResult.data.session;
        const activeSession = resolvedSession ?? (await createAnonymousSession());

        if (mounted) {
          setSession(activeSession);
          setNeedsPasswordSetup(
            Boolean(pendingEmail && activeSession?.user) &&
              !isAnonymousUser(activeSession?.user ?? null),
          );
        }
      } catch (caught) {
        if (mounted) captureError(caught);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void initialize();

    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      void applyAuthUrl(url).catch(captureError);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [captureError]);

  const clearError = React.useCallback(() => setError(null), []);

  const protectProgress = React.useCallback(
    async (rawEmail: string, password: string) => {
      const client = requireConfiguredAuth();
      const email = validateEmail(rawEmail);
      validatePassword(password);

      if (!session?.user || !isAnonymousUser(session.user)) {
        throw new KappAuthError(
          "anonymous-session-required",
          "Cette progression est déjà associée à un compte.",
        );
      }

      setError(null);
      try {
        const { data, error: updateError } = await client.auth.updateUser(
          { email },
          { emailRedirectTo: protectionRedirectUrl() },
        );
        if (updateError) throw updateError;

        await AsyncStorage.setItem(PENDING_PROTECTION_EMAIL_KEY, email);
        setConfirmationEmail(email);

        if (data.user && !isAnonymousUser(data.user)) {
          const { error: passwordError } = await client.auth.updateUser({
            password,
          });
          if (passwordError) throw passwordError;
          await AsyncStorage.removeItem(PENDING_PROTECTION_EMAIL_KEY);
          setConfirmationEmail(null);
          setNeedsPasswordSetup(false);
          return "protected" as const;
        }

        return "confirmation-required" as const;
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError, session],
  );

  const completeAccountProtection = React.useCallback(
    async (password: string) => {
      const client = requireConfiguredAuth();
      validatePassword(password);
      setError(null);

      try {
        const { error: updateError } = await client.auth.updateUser({
          password,
        });
        if (updateError) throw updateError;
        await AsyncStorage.removeItem(PENDING_PROTECTION_EMAIL_KEY);
        setConfirmationEmail(null);
        setNeedsPasswordSetup(false);
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError],
  );

  const resendProtectionEmail = React.useCallback(async () => {
    const client = requireConfiguredAuth();
    const email =
      confirmationEmail ??
      (await AsyncStorage.getItem(PENDING_PROTECTION_EMAIL_KEY));

    if (!email) {
      throw new KappAuthError(
        "confirmation-email-missing",
        "Aucune adresse en attente de confirmation n’a été trouvée.",
      );
    }

    setError(null);
    try {
      const { error: resendError } = await client.auth.resend({
        type: "email_change",
        email,
        options: { emailRedirectTo: protectionRedirectUrl() },
      });
      if (resendError) throw resendError;
    } catch (caught) {
      throw captureError(caught);
    }
  }, [captureError, confirmationEmail]);

  const signIn = React.useCallback(
    async (rawEmail: string, password: string) => {
      const client = requireConfiguredAuth();
      const email = validateEmail(rawEmail);
      validatePassword(password);
      setError(null);

      try {
        await synchronizeProgressNow().catch(() => undefined);
        const { error: signInError } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError],
  );

  const signOut = React.useCallback(async () => {
    const client = requireConfiguredAuth();
    setError(null);

    try {
      await synchronizeProgressNow();
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) throw signOutError;
      const anonymousSession = await createAnonymousSession();
      setSession(anonymousSession);
      setIsPasswordRecovery(false);
      setNeedsPasswordSetup(false);
    } catch (caught) {
      throw captureError(caught);
    }
  }, [captureError]);

  const resetPassword = React.useCallback(
    async (rawEmail: string) => {
      const client = requireConfiguredAuth();
      const email = validateEmail(rawEmail);
      setError(null);

      try {
        const { error: resetError } = await client.auth.resetPasswordForEmail(
          email,
          { redirectTo: recoveryRedirectUrl() },
        );
        if (resetError) throw resetError;
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError],
  );

  const updatePassword = React.useCallback(
    async (password: string) => {
      const client = requireConfiguredAuth();
      validatePassword(password);
      setError(null);

      try {
        const { error: updateError } = await client.auth.updateUser({
          password,
        });
        if (updateError) throw updateError;
        setIsPasswordRecovery(false);
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError],
  );

  const deleteAccount = React.useCallback(async () => {
    const client = requireConfiguredAuth();
    setError(null);

    try {
      const { error: deletionError } = await client.functions.invoke(
        DELETE_ACCOUNT_FUNCTION,
        { method: "POST" },
      );
      if (deletionError) {
        throw new KappAuthError(
          "delete-account-unavailable",
          "La suppression sécurisée du compte est momentanément indisponible.",
          { cause: deletionError },
        );
      }

      await client.auth.signOut({ scope: "local" });
      const anonymousSession = await createAnonymousSession();
      setSession(anonymousSession);
      setIsPasswordRecovery(false);
      setNeedsPasswordSetup(false);
    } catch (caught) {
      throw captureError(caught);
    }
  }, [captureError]);

  const user = session?.user ?? null;
  const isAnonymous = isAnonymousUser(user);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isConfigured: isSupabaseConfigured,
      isLoading,
      isAuthenticated: Boolean(user),
      isAnonymous,
      isPermanentAccount: Boolean(user && !isAnonymous),
      needsPasswordSetup,
      isPasswordRecovery,
      confirmationEmail,
      error,
      clearError,
      protectProgress,
      completeAccountProtection,
      resendProtectionEmail,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      deleteAccount,
    }),
    [
      session,
      user,
      isLoading,
      isAnonymous,
      needsPasswordSetup,
      isPasswordRecovery,
      confirmationEmail,
      error,
      clearError,
      protectProgress,
      completeAccountProtection,
      resendProtectionEmail,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
