import AsyncStorage from "@react-native-async-storage/async-storage";
<<<<<<< HEAD
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
=======
import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React from "react";

import {
  assertLinkedUserId,
  authProvidersFromUser,
  parseAuthCallbackUrl,
  type KappOAuthProvider,
} from "./authCallback";
import {
  KappAuthError,
  toKappAuthError,
  validateEmail,
  validatePassword,
} from "./authErrors";
import { createAuthRedirectUrl } from "./authRedirects";
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

export type ProtectProgressResult =
  | "confirmation-required"
  | "password-required";
export type OAuthResult = "success" | "cancelled";

WebBrowser.maybeCompleteAuthSession();

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
  providers: string[];
  hasEmailIdentity: boolean;
  activeOAuthProvider: KappOAuthProvider | null;
  error: string | null;
  clearError: () => void;
  protectProgress: (email: string) => Promise<ProtectProgressResult>;
  completeAccountProtection: (password: string) => Promise<void>;
  resendProtectionEmail: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  linkOAuthIdentity: (provider: KappOAuthProvider) => Promise<OAuthResult>;
  signInWithOAuth: (provider: KappOAuthProvider) => Promise<OAuthResult>;
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
<<<<<<< HEAD
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
=======
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

async function createAnonymousSession() {
  const client = requireConfiguredAuth();
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

const handledAuthUrls = new Map<string, Promise<void>>();

async function applyAuthUrl(url: string) {
  const client = requireConfiguredAuth();
  const callback = parseAuthCallbackUrl(url);

  if (!callback.hasAuthPayload) return;
  if (callback.errorDescription || callback.errorCode) {
    const callbackError = new Error(
      callback.errorDescription ?? "Authentication provider rejected the request.",
    ) as Error & { code?: string };
    callbackError.code = callback.errorCode ?? undefined;
    throw callbackError;
  }

  if (callback.code) {
    const { error } = await client.auth.exchangeCodeForSession(callback.code);
    if (error) throw error;
    return;
  }

  if (callback.accessToken && callback.refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });
    if (error) throw error;
  }
}

function applyAuthUrlOnce(url: string) {
  const existing = handledAuthUrls.get(url);
  if (existing) return existing;

  const operation = applyAuthUrl(url);
  handledAuthUrls.set(url, operation);
  if (handledAuthUrls.size > 12) {
    const oldestUrl = handledAuthUrls.keys().next().value;
    if (typeof oldestUrl === "string") handledAuthUrls.delete(oldestUrl);
  }
  return operation;
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(isSupabaseConfigured);
<<<<<<< HEAD
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
=======
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
  const [activeOAuthProvider, setActiveOAuthProvider] =
    React.useState<KappOAuthProvider | null>(null);
  const pendingProtectionRevision = React.useRef(0);

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
          const revision = pendingProtectionRevision.current;
          void AsyncStorage.getItem(PENDING_PROTECTION_EMAIL_KEY).then(
            (pendingEmail) => {
              if (
                !mounted ||
                !pendingEmail ||
                revision !== pendingProtectionRevision.current
              ) {
                return;
              }
              setConfirmationEmail(pendingEmail);
              setNeedsPasswordSetup(
                Boolean(nextSession?.user) &&
                  !isAnonymousUser(nextSession?.user ?? null),
              );
            },
          );
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
        }
      },
    );

<<<<<<< HEAD
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
=======
    const initialize = async () => {
      try {
        const [sessionResult, pendingEmail, initialUrl] = await Promise.all([
          client.auth.getSession(),
          AsyncStorage.getItem(PENDING_PROTECTION_EMAIL_KEY),
          Linking.getInitialURL(),
        ]);
        if (sessionResult.error) throw sessionResult.error;

        if (pendingEmail && mounted) setConfirmationEmail(pendingEmail);
        if (initialUrl) {
          try {
            await applyAuthUrlOnce(initialUrl);
          } catch (caught) {
            if (mounted) captureError(caught);
          }
        }

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
      void applyAuthUrlOnce(url).catch(captureError);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [captureError]);

  const clearError = React.useCallback(() => setError(null), []);

  const protectProgress = React.useCallback(
    async (rawEmail: string) => {
      const client = requireConfiguredAuth();
      const email = validateEmail(rawEmail);

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
          { emailRedirectTo: createAuthRedirectUrl("protect") },
        );
        if (updateError) throw updateError;

        await AsyncStorage.setItem(PENDING_PROTECTION_EMAIL_KEY, email);
        setConfirmationEmail(email);

        if (data.user && !isAnonymousUser(data.user)) {
          setNeedsPasswordSetup(true);
          return "password-required" as const;
        }

        return "confirmation-required" as const;
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError, session],
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
  );

  const completeAccountProtection = React.useCallback(
    async (password: string) => {
<<<<<<< HEAD
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
=======
      const client = requireConfiguredAuth();
      validatePassword(password);
      setError(null);

      try {
        const { error: updateError } = await client.auth.updateUser({
          password,
        });
        if (updateError) throw updateError;
        pendingProtectionRevision.current += 1;
        await AsyncStorage.removeItem(PENDING_PROTECTION_EMAIL_KEY);
        pendingProtectionRevision.current += 1;
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
        options: { emailRedirectTo: createAuthRedirectUrl("protect") },
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

  const runOAuth = React.useCallback(
    async (
      provider: KappOAuthProvider,
      intent: "link" | "login",
    ): Promise<OAuthResult> => {
      const client = requireConfiguredAuth();
      const expectedUserId = intent === "link" ? session?.user.id : null;

      if (
        intent === "link" &&
        (!session?.user || !isAnonymousUser(session.user))
      ) {
        throw new KappAuthError(
          "anonymous-session-required",
          "Cette progression est déjà associée à un compte.",
        );
      }

      setError(null);
      setActiveOAuthProvider(provider);
      try {
        if (intent === "login") {
          // The local snapshot remains available for the post-login merge even
          // if the guest cloud sync is temporarily unavailable.
          await synchronizeProgressNow().catch(() => undefined);
        }

        const redirectTo = createAuthRedirectUrl(
          `oauth-${intent}-${provider}`,
        );
        const credentials = {
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        } as const;
        const result =
          intent === "link"
            ? await client.auth.linkIdentity(credentials)
            : await client.auth.signInWithOAuth(credentials);

        if (result.error) throw result.error;
        if (!result.data.url) {
          throw new Error("OAuth provider did not return an authorization URL.");
        }

        const browserResult = await WebBrowser.openAuthSessionAsync(
          result.data.url,
          redirectTo,
        );
        if (browserResult.type !== "success") return "cancelled";

        await applyAuthUrlOnce(browserResult.url);
        const { data: userResult, error: userError } =
          await client.auth.getUser();
        if (userError) throw userError;
        if (!userResult.user) {
          throw new Error("OAuth callback did not create an authenticated user.");
        }

        if (expectedUserId) {
          assertLinkedUserId(expectedUserId, userResult.user.id);
          if (!authProvidersFromUser(userResult.user).includes(provider)) {
            throw new Error("OAuth identity was not linked to the current user.");
          }
        }

        return "success";
      } catch (caught) {
        throw captureError(caught);
      } finally {
        setActiveOAuthProvider(null);
      }
    },
    [captureError, session],
  );

  const linkOAuthIdentity = React.useCallback(
    (provider: KappOAuthProvider) => runOAuth(provider, "link"),
    [runOAuth],
  );

  const signInWithOAuth = React.useCallback(
    (provider: KappOAuthProvider) => runOAuth(provider, "login"),
    [runOAuth],
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
          { redirectTo: createAuthRedirectUrl("recovery") },
        );
        if (resetError) throw resetError;
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError],
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
  );

  const updatePassword = React.useCallback(
    async (password: string) => {
<<<<<<< HEAD
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
=======
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
  const providers = React.useMemo(() => authProvidersFromUser(user), [user]);
  const hasEmailIdentity = providers.includes("email");

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
      providers,
      hasEmailIdentity,
      activeOAuthProvider,
      error,
      clearError,
      protectProgress,
      completeAccountProtection,
      resendProtectionEmail,
      signIn,
      linkOAuthIdentity,
      signInWithOAuth,
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
      signOut,
      resetPassword,
      updatePassword,
      deleteAccount,
<<<<<<< HEAD
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
=======
    }),
    [
      session,
      user,
      isLoading,
      isAnonymous,
      needsPasswordSetup,
      isPasswordRecovery,
      confirmationEmail,
      providers,
      hasEmailIdentity,
      activeOAuthProvider,
      error,
      clearError,
      protectProgress,
      completeAccountProtection,
      resendProtectionEmail,
      signIn,
      linkOAuthIdentity,
      signInWithOAuth,
      signOut,
      resetPassword,
      updatePassword,
      deleteAccount,
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
<<<<<<< HEAD
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
=======

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
  return context;
}
