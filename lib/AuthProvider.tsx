import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  EmailOtpType,
  Session,
  User,
} from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import React from "react";
import { AppState } from "react-native";

import {
  KappAuthError,
  translateAuthError,
  validateEmail,
  validatePassword,
} from "./authErrors";
import { parseAuthCallbackUrl } from "./authCallback";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  retainSupabaseAuthLifecycle,
} from "./supabase";
import {
  clearLocalProgressAfterAccountExit,
  prepareProgressSyncForAccountExit,
  resumeProgressSyncAfterCancelledExit,
  stopProgressSync,
  synchronizeProgressNow,
} from "../services/progressSync";

const PENDING_ACCOUNT_PROTECTION_KEY =
  "@k_app/pending_account_protection_v1";
const AUTH_CALLBACK_PATH = "/account/callback";

export type AccountProtectionResult =
  | "protected"
  | "confirmation-required";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isHandlingDeepLink: boolean;
  isAnonymous: boolean;
  isPermanentAccount: boolean;
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;
  needsPasswordSetup: boolean;
  confirmationEmail: string | null;
  error: string | null;
  isConfigured: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  protectProgress: (
    email: string,
    password: string,
  ) => Promise<AccountProtectionResult>;
  completeAccountProtection: (password: string) => Promise<void>;
  resendProtectionEmail: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

let initializationPromise: Promise<Session | null> | null = null;
let anonymousSignInPromise: Promise<Session> | null = null;

function createRedirectUrl(intent: "confirm" | "recovery") {
  const callbackUrl = Linking.createURL(AUTH_CALLBACK_PATH.slice(1));
  return `${callbackUrl}${callbackUrl.includes("?") ? "&" : "?"}intent=${intent}`;
}

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new KappAuthError(
      "supabase-not-configured",
      "La sauvegarde cloud n’est pas encore configurée.",
    );
  }
  return client;
}

async function ensureAnonymousSession(): Promise<Session> {
  const client = requireClient();
  if (!anonymousSignInPromise) {
    anonymousSignInPromise = client.auth
      .signInAnonymously()
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data.session) throw new Error("anonymous-session-missing");
        return data.session;
      })
      .finally(() => {
        anonymousSignInPromise = null;
      });
  }
  return anonymousSignInPromise;
}

async function restoreOrCreateSession(): Promise<Session | null> {
  const client = requireClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session ?? ensureAnonymousSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(isSupabaseConfigured);
  const [isHandlingDeepLink, setIsHandlingDeepLink] = React.useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = React.useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = React.useState(false);
  const [confirmationEmail, setConfirmationEmail] = React.useState<
    string | null
  >(null);
  const [error, setError] = React.useState<string | null>(
    isSupabaseConfigured
      ? null
      : "La sauvegarde cloud n’est pas configurée. La progression locale reste disponible.",
  );
  const accountExitInProgressRef = React.useRef(false);
  const handledInitialUrlRef = React.useRef(false);

  const applyError = React.useCallback((caught: unknown) => {
    const translated = translateAuthError(caught);
    if (__DEV__) console.warn("[Auth] Opération impossible:", caught);
    setError(translated.message);
    return translated;
  }, []);

  const refreshPendingProtectionState = React.useCallback(
    async (nextUser?: User | null) => {
      const pendingEmail = await AsyncStorage.getItem(
        PENDING_ACCOUNT_PROTECTION_KEY,
      );
      setConfirmationEmail(pendingEmail);
      setNeedsPasswordSetup(Boolean(pendingEmail && nextUser && !nextUser.is_anonymous));
    },
    [],
  );

  const initialize = React.useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      initializationPromise ??= restoreOrCreateSession().finally(() => {
        initializationPromise = null;
      });
      const restoredSession = await initializationPromise;
      setSession(restoredSession);
      await refreshPendingProtectionState(restoredSession?.user);
      setError(null);
    } catch (caught) {
      applyError(caught);
    } finally {
      setIsLoading(false);
    }
  }, [applyError, refreshPendingProtectionState]);

  const handleAuthUrl = React.useCallback(
    async (url: string) => {
      const client = getSupabaseClient();
      if (!client) return;
      const {
        code,
        accessToken,
        refreshToken,
        tokenHash,
        type,
        intent,
        errorCode,
      } = parseAuthCallbackUrl(url);
      if (errorCode) {
        applyError(
          new KappAuthError(
            "invalid-auth-link",
            "Ce lien est invalide ou a expiré. Demandez un nouvel email depuis Mon profil.",
          ),
        );
        return;
      }
      if (!code && !accessToken && !tokenHash) return;

      setIsHandlingDeepLink(true);
      setError(null);
      try {
        if (code) {
          const { error: exchangeError } =
            await client.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        } else if (tokenHash && type) {
          const { error: verifyError } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (verifyError) throw verifyError;
        }

        const { data, error: userError } = await client.auth.getUser();
        if (userError) throw userError;
        const { data: sessionData } = await client.auth.getSession();
        setSession(sessionData.session);
        if (type === "recovery" || intent === "recovery") {
          setIsPasswordRecovery(true);
        }
        await refreshPendingProtectionState(data.user);
      } catch (caught) {
        applyError(caught);
      } finally {
        setIsHandlingDeepLink(false);
      }
    },
    [applyError, refreshPendingProtectionState],
  );

  React.useEffect(() => {
    const releaseLifecycle = retainSupabaseAuthLifecycle();
    const client = getSupabaseClient();
    if (!client) {
      return releaseLifecycle;
    }

    const { data: authListener } = client.auth.onAuthStateChange(
      (event, nextSession) => {
        setSession(nextSession);
        if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
        if (nextSession?.user) {
          void refreshPendingProtectionState(nextSession.user);
        }
        if (
          event === "SIGNED_OUT" &&
          !accountExitInProgressRef.current
        ) {
          void ensureAnonymousSession()
            .then(setSession)
            .catch(applyError);
        }
      },
    );

    const initializationTimer = setTimeout(() => {
      void initialize();
    }, 0);
    const urlSubscription = Linking.addEventListener("url", ({ url }) => {
      void handleAuthUrl(url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url && !handledInitialUrlRef.current) {
        handledInitialUrlRef.current = true;
        void handleAuthUrl(url);
      }
    });
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState !== "active" || accountExitInProgressRef.current) return;
        void client.auth.getSession().then(({ data }) => {
          if (!data.session) {
            void ensureAnonymousSession().then(setSession).catch(applyError);
          }
        });
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(initializationTimer);
      urlSubscription.remove();
      appStateSubscription.remove();
      releaseLifecycle();
    };
  }, [applyError, handleAuthUrl, initialize, refreshPendingProtectionState]);

  const protectProgress = React.useCallback(
    async (email: string, password: string): Promise<AccountProtectionResult> => {
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);
      if (emailError || passwordError) {
        throw new KappAuthError(
          emailError ? "invalid-email" : "weak-password",
          emailError ?? passwordError ?? "Données invalides.",
        );
      }
      const client = requireClient();
      if (!session?.user?.is_anonymous) {
        throw new KappAuthError(
          "not-anonymous",
          "Cette progression est déjà liée à un compte.",
        );
      }
      const normalizedEmail = email.trim().toLowerCase();
      setError(null);
      await AsyncStorage.setItem(
        PENDING_ACCOUNT_PROTECTION_KEY,
        normalizedEmail,
      );
      let emailUpdateAccepted = false;
      try {
        await synchronizeProgressNow();
        const { data, error: updateEmailError } = await client.auth.updateUser(
          { email: normalizedEmail },
          { emailRedirectTo: createRedirectUrl("confirm") },
        );
        if (updateEmailError) throw updateEmailError;
        emailUpdateAccepted = true;
        setSession((current) =>
          current && data.user
            ? { ...current, user: data.user }
            : current,
        );
        setConfirmationEmail(normalizedEmail);

        if (data.user && !data.user.is_anonymous) {
          const { error: passwordUpdateError } = await client.auth.updateUser({
            password,
          });
          if (passwordUpdateError) throw passwordUpdateError;
          await AsyncStorage.removeItem(PENDING_ACCOUNT_PROTECTION_KEY);
          setConfirmationEmail(null);
          setNeedsPasswordSetup(false);
          return "protected";
        }

        return "confirmation-required";
      } catch (caught) {
        if (!emailUpdateAccepted) {
          await AsyncStorage.removeItem(PENDING_ACCOUNT_PROTECTION_KEY);
          setConfirmationEmail(null);
        } else {
          setConfirmationEmail(normalizedEmail);
        }
        throw applyError(caught);
      }
    },
    [applyError, session],
  );

  const completeAccountProtection = React.useCallback(
    async (password: string) => {
      const passwordError = validatePassword(password);
      if (passwordError) throw new KappAuthError("weak-password", passwordError);
      const client = requireClient();
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw applyError(userError);
      if (!userData.user || userData.user.is_anonymous) {
        throw new KappAuthError(
          "email-confirmation-required",
          "Confirmez d’abord votre adresse depuis l’email reçu.",
        );
      }
      const { error: passwordUpdateError } = await client.auth.updateUser({
        password,
      });
      if (passwordUpdateError) throw applyError(passwordUpdateError);
      await AsyncStorage.removeItem(PENDING_ACCOUNT_PROTECTION_KEY);
      setConfirmationEmail(null);
      setNeedsPasswordSetup(false);
      setError(null);
    },
    [applyError],
  );

  const resendProtectionEmail = React.useCallback(async () => {
    const client = requireClient();
    if (!confirmationEmail) {
      throw new KappAuthError(
        "missing-email",
        "Aucune confirmation n’est en attente.",
      );
    }
    const { error: resendError } = await client.auth.resend({
      type: "email_change",
      email: confirmationEmail,
      options: { emailRedirectTo: createRedirectUrl("confirm") },
    });
    if (resendError) throw applyError(resendError);
  }, [applyError, confirmationEmail]);

  const signIn = React.useCallback(
    async (email: string, password: string) => {
      const emailError = validateEmail(email);
      if (emailError) throw new KappAuthError("invalid-email", emailError);
      if (!password) {
        throw new KappAuthError("missing-password", "Saisissez votre mot de passe.");
      }
      const client = requireClient();
      setError(null);
      await synchronizeProgressNow();
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) throw applyError(signInError);
      setSession(data.session);
      await AsyncStorage.removeItem(PENDING_ACCOUNT_PROTECTION_KEY);
      setConfirmationEmail(null);
      setNeedsPasswordSetup(false);
    },
    [applyError],
  );

  const resetPassword = React.useCallback(
    async (email: string) => {
      const emailError = validateEmail(email);
      if (emailError) throw new KappAuthError("invalid-email", emailError);
      const client = requireClient();
      const { error: resetError } = await client.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: createRedirectUrl("recovery") },
      );
      if (resetError) throw applyError(resetError);
      setError(null);
    },
    [applyError],
  );

  const updatePassword = React.useCallback(
    async (password: string) => {
      const passwordError = validatePassword(password);
      if (passwordError) throw new KappAuthError("weak-password", passwordError);
      const client = requireClient();
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw applyError(updateError);
      setIsPasswordRecovery(false);
      setError(null);
    },
    [applyError],
  );

  const signOut = React.useCallback(async () => {
    const client = requireClient();
    accountExitInProgressRef.current = true;
    try {
      await prepareProgressSyncForAccountExit();
      const previousUserId = session?.user.id;
      const { error: signOutError } = await client.auth.signOut({ scope: "local" });
      if (signOutError) throw signOutError;
      if (previousUserId) stopProgressSync(previousUserId);
      await clearLocalProgressAfterAccountExit();
      const anonymousSession = await ensureAnonymousSession();
      setSession(anonymousSession);
      setError(null);
    } catch (caught) {
      resumeProgressSyncAfterCancelledExit();
      throw applyError(caught);
    } finally {
      accountExitInProgressRef.current = false;
    }
  }, [applyError, session]);

  const deleteAccount = React.useCallback(async () => {
    const client = requireClient();
    accountExitInProgressRef.current = true;
    try {
      await prepareProgressSyncForAccountExit();
      const previousUserId = session?.user.id;
      const { error: functionError } = await client.functions.invoke(
        "delete-account",
        { body: {} },
      );
      if (functionError) throw functionError;
      await client.auth.signOut({ scope: "local" });
      if (previousUserId) stopProgressSync(previousUserId);
      await clearLocalProgressAfterAccountExit();
      const anonymousSession = await ensureAnonymousSession();
      setSession(anonymousSession);
      setError(null);
    } catch (caught) {
      resumeProgressSyncAfterCancelledExit();
      throw applyError(caught);
    } finally {
      accountExitInProgressRef.current = false;
    }
  }, [applyError, session]);

  const clearError = React.useCallback(() => setError(null), []);

  const user = session?.user ?? null;
  const isAnonymous = Boolean(user?.is_anonymous);
  const isPermanentAccount = Boolean(user && !isAnonymous && user.email);
  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isHandlingDeepLink,
      isAnonymous,
      isPermanentAccount,
      isAuthenticated: Boolean(user && session),
      isPasswordRecovery,
      needsPasswordSetup,
      confirmationEmail,
      error,
      isConfigured: isSupabaseConfigured,
      initialize,
      signIn,
      protectProgress,
      completeAccountProtection,
      resendProtectionEmail,
      signOut,
      resetPassword,
      updatePassword,
      deleteAccount,
      clearError,
    }),
    [
      completeAccountProtection,
      clearError,
      confirmationEmail,
      deleteAccount,
      error,
      initialize,
      isAnonymous,
      isHandlingDeepLink,
      isLoading,
      isPasswordRecovery,
      isPermanentAccount,
      needsPasswordSetup,
      protectProgress,
      resendProtectionEmail,
      resetPassword,
      session,
      signIn,
      signOut,
      updatePassword,
      user,
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
