import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React from "react";

import {
  assertLinkedUserId,
  authCallbackKey,
  authProvidersFromUser,
  matchesAuthCallbackUrl,
  oauthProviderFromCallback,
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
import {
  isolateProgressAfterSignOut,
  synchronizeProgressNow,
} from "../services/progressSync";

const PENDING_PROTECTION_EMAIL_KEY =
  "@k_app/auth/pending_protection_email_v1";
const PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY =
  "@k_app/auth/pending_protection_with_password_email_v2";
const DELETE_ACCOUNT_FUNCTION =
  process.env.EXPO_PUBLIC_SUPABASE_DELETE_ACCOUNT_FUNCTION?.trim() ||
  "delete-account";

export type ProtectProgressResult =
  | "confirmation-required"
  | "success";
export type OAuthResult = "success" | "cancelled";
type OAuthOutcome = { provider: KappOAuthProvider; result: OAuthResult };
export type SignOutResult = {
  syncDeferred: boolean;
  guestSessionPending: boolean;
};

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isConfigured: boolean;
  isLoading: boolean;
  isHandlingDeepLink: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isPermanentAccount: boolean;
  needsPasswordSetup: boolean;
  didCompleteAccountProtection: boolean;
  isPasswordRecovery: boolean;
  confirmationEmail: string | null;
  providers: string[];
  hasEmailIdentity: boolean;
  activeOAuthProvider: KappOAuthProvider | null;
  oauthOutcome: OAuthOutcome | null;
  error: string | null;
  clearError: () => void;
  clearAccountProtectionSuccess: () => void;
  protectProgress: (email: string, password: string) => Promise<ProtectProgressResult>;
  completeAccountProtection: (password: string) => Promise<void>;
  resendProtectionEmail: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  linkOAuthIdentity: (provider: KappOAuthProvider) => Promise<OAuthResult>;
  signInWithOAuth: (provider: KappOAuthProvider) => Promise<OAuthResult>;
  signOut: () => Promise<SignOutResult>;
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

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

function pendingEmailMatchesUser(
  pendingEmail: string | null,
  user: User | null,
) {
  const normalizedPendingEmail = normalizeEmail(pendingEmail);
  const normalizedUserEmail = normalizeEmail(user?.email);
  return Boolean(
    normalizedPendingEmail &&
      normalizedUserEmail &&
      normalizedPendingEmail === normalizedUserEmail,
  );
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
  const existing = await client.auth.getSession();
  if (existing.error) throw existing.error;
  if (existing.data.session) return existing.data.session;
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

// Temporary development diagnostics: only fixed labels and payload-presence
// flags. Never pass URLs, sessions, provider errors or credentials here.
function logOAuthStep(
  step: string,
  details: Record<string, string | boolean | null> = {},
) {
  if (__DEV__) console.info("[auth:oauth]", step, details);
}

const OAUTH_RESUME_GRACE_MS = 1_500;
const AUTH_OPERATION_TIMEOUT_MS = 30_000;

function withAuthTimeout<T>(operation: Promise<T>, timeoutMs = AUTH_OPERATION_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    operation,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new KappAuthError(
        "network-unavailable",
        "La validation de connexion a pris trop de temps. Vérifiez votre connexion puis réessayez.",
      )), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function applyAuthUrl(url: string) {
  const client = requireConfiguredAuth();
  const callback = parseAuthCallbackUrl(url);

  if (!callback.hasAuthPayload) return null;
  if (callback.errorDescription || callback.errorCode) {
    const callbackError = new Error(
      callback.errorDescription ?? "Authentication provider rejected the request.",
    ) as Error & { code?: string };
    callbackError.code = callback.errorCode ?? undefined;
    throw callbackError;
  }

  if (callback.code) {
    logOAuthStep("callback.exchange-code");
    const { data, error } = await client.auth.exchangeCodeForSession(callback.code);
    if (error) throw error;
    return data.session;
  }

  if (callback.accessToken && callback.refreshToken) {
    logOAuthStep("callback.set-session");
    const { data, error } = await client.auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });
    if (error) throw error;
    return data.session;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(isSupabaseConfigured);
  const [isHandlingDeepLink, setIsHandlingDeepLink] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    isSupabaseConfigured
      ? null
      : "La sauvegarde cloud n’est pas configurée dans cet environnement.",
  );
  const [confirmationEmail, setConfirmationEmail] = React.useState<
    string | null
  >(null);
  const [needsPasswordSetup, setNeedsPasswordSetup] = React.useState(false);
  const [didCompleteAccountProtection, setDidCompleteAccountProtection] =
    React.useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = React.useState(false);
  const [activeOAuthProvider, setActiveOAuthProvider] =
    React.useState<KappOAuthProvider | null>(null);
  const [oauthOutcome, setOAuthOutcome] = React.useState<OAuthOutcome | null>(null);
  const mountedRef = React.useRef(false);
  const sessionRevision = React.useRef(0);
  const handledAuthUrls = React.useRef(new Map<string, {
    operation: Promise<Session | null>;
    attempt: object | null;
    settled: boolean;
  }>());
  const pendingProtectionRevision = React.useRef(0);
  const activeOAuthAttempt = React.useRef<{
    redirectTo: string;
    provider: KappOAuthProvider;
    expectedUserId: string | null;
    callback: Promise<Session | null> | null;
    notifyCallback: (operation: Promise<Session | null>) => void;
  } | null>(null);
  const pendingAuthUrls = React.useRef(0);
  const assertAuthIdle = React.useCallback(() => {
    if (activeOAuthAttempt.current || pendingAuthUrls.current > 0) {
      throw new KappAuthError("auth-operation-failed", "Une connexion est déjà en cours.");
    }
  }, []);

  const captureError = React.useCallback((caught: unknown) => {
    const mapped = toKappAuthError(caught);
    if (mountedRef.current) setError(mapped.message);
    return mapped;
  }, []);

  const clearPendingProtectionState = React.useCallback(async () => {
    pendingProtectionRevision.current += 1;
    await AsyncStorage.multiRemove([
      PENDING_PROTECTION_EMAIL_KEY,
      PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY,
    ]);
    if (!mountedRef.current) return;
    pendingProtectionRevision.current += 1;
    setConfirmationEmail(null);
    setNeedsPasswordSetup(false);
    setDidCompleteAccountProtection(false);
  }, []);

  const handleAuthUrl = React.useCallback(async (
    url: string,
    source: "initial" | "linking" | "browser" = "linking",
  ) => {
    if (!mountedRef.current) return null;
    if (!matchesAuthCallbackUrl(url, createAuthRedirectUrl())) return null;
    const callback = parseAuthCallbackUrl(url);
    logOAuthStep("callback.received", {
      source,
      hasCode: Boolean(callback.code),
      hasTokenPair: Boolean(callback.accessToken && callback.refreshToken),
      hasError: Boolean(callback.errorCode || callback.errorDescription),
    });
    // Unrelated deep links never enter the auth loading state.
    if (!callback.hasAuthPayload) return null;
    const attempt = activeOAuthAttempt.current;
    // A different auth action must not mutate the session under an active flow.
    if (attempt && !matchesAuthCallbackUrl(url, attempt.redirectTo)) return null;
    const key = authCallbackKey(callback);
    const existing = handledAuthUrls.current.get(key);
    // Replays from an earlier operation cannot complete a retry or reconnect.
    if (existing && existing.attempt !== attempt) return null;
    pendingAuthUrls.current += 1;
    setIsHandlingDeepLink(true);
    try {
      let operation = existing?.operation;
      if (!operation) {
        operation = withAuthTimeout((async () => {
          const callbackSession = await applyAuthUrl(url);
          const provider = attempt?.provider ?? oauthProviderFromCallback(url, callbackSession?.user ?? null);
          if (provider) {
            if (!callbackSession || isAnonymousUser(callbackSession.user)) {
              throw new KappAuthError("oauth-session-unverified", "Aucune session de compte n’a été confirmée. Relancez la connexion depuis K-App.");
            }
            const { data: userResult, error: userError } = await requireConfiguredAuth().auth.getUser();
            if (userError) throw userError;
            if (!userResult.user || isAnonymousUser(userResult.user) ||
                userResult.user.id !== callbackSession.user.id ||
                !authProvidersFromUser(userResult.user).includes(provider)) {
              throw new KappAuthError("oauth-session-unverified", "La connexion à ce compte n’a pas pu être vérifiée. Vérifiez votre connexion puis réessayez.");
            }
            if (attempt?.expectedUserId) {
              assertLinkedUserId(attempt.expectedUserId, userResult.user.id);
            }
            return { ...callbackSession, user: userResult.user };
          }
          return callbackSession;
        })()).then((nextSession) => {
          if (mountedRef.current && nextSession) {
            sessionRevision.current += 1;
            setSession(nextSession);
            const provider = attempt?.provider ?? oauthProviderFromCallback(url, nextSession.user);
            if (provider === "google" || provider === "apple") {
              setOAuthOutcome({ provider, result: "success" });
              setError(null);
              logOAuthStep("callback.verified", { provider });
            }
          }
          return nextSession;
        });
        const entry = { operation, attempt, settled: false };
        handledAuthUrls.current.set(key, entry);
        // Keep recent single-use callbacks for replay rejection without retaining
        // every session for the lifetime of the application. Never evict in flight.
        void operation.finally(() => {
          entry.settled = true;
          for (const [oldKey, oldEntry] of handledAuthUrls.current) {
            if (handledAuthUrls.current.size <= 24) break;
            if (oldEntry.settled) handledAuthUrls.current.delete(oldKey);
          }
        }).catch(() => undefined);
      } else {
        logOAuthStep("callback.already-handled");
      }
      if (attempt) {
        attempt.callback = operation;
        attempt.notifyCallback(operation);
      }
      return await operation;
    } finally {
      pendingAuthUrls.current -= 1;
      if (mountedRef.current) setIsHandlingDeepLink(pendingAuthUrls.current > 0);
    }
  }, []);

  React.useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let mounted = true;
    mountedRef.current = true;
    const { data: authListener } = client.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!mounted) return;
        sessionRevision.current += 1;
        // SDK SIGNED_IN precedes getUser verification. Publish the OAuth session
        // once, through handleAuthUrl, so cloud sync cannot race verification.
        if (!((activeOAuthAttempt.current || pendingAuthUrls.current > 0) &&
              nextSession && !isAnonymousUser(nextSession.user))) {
          setSession(nextSession);
        }
        setIsLoading(false);
        if (activeOAuthAttempt.current) {
          logOAuthStep("session.event", {
            event,
            hasSession: Boolean(nextSession),
            isAnonymous: isAnonymousUser(nextSession?.user ?? null),
          });
        }

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
          setNeedsPasswordSetup(false);
          setDidCompleteAccountProtection(false);
          pendingProtectionRevision.current += 1;
          void AsyncStorage.multiRemove([
            PENDING_PROTECTION_EMAIL_KEY,
            PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY,
          ]).catch(() => undefined);
        }

        if (event === "USER_UPDATED" || event === "SIGNED_IN") {
          const revision = pendingProtectionRevision.current;
          void Promise.all([
            AsyncStorage.getItem(PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY),
            AsyncStorage.getItem(PENDING_PROTECTION_EMAIL_KEY),
          ]).then(
            async ([pendingEmailWithPassword, legacyPendingEmail]) => {
              if (!mounted || revision !== pendingProtectionRevision.current) {
                return;
              }

              if (legacyPendingEmail) {
                await AsyncStorage.removeItem(PENDING_PROTECTION_EMAIL_KEY);
              }

              const isPermanent =
                Boolean(nextSession?.user) &&
                !isAnonymousUser(nextSession?.user ?? null);

              if (!pendingEmailWithPassword) {
                if (legacyPendingEmail && mounted) {
                  pendingProtectionRevision.current += 1;
                  setConfirmationEmail(null);
                  setNeedsPasswordSetup(false);
                }
                return;
              }

              if (!isPermanent) {
                setConfirmationEmail(pendingEmailWithPassword);
                setNeedsPasswordSetup(false);
                return;
              }

              const didCompleteCurrentProtection = pendingEmailMatchesUser(
                pendingEmailWithPassword,
                nextSession?.user ?? null,
              );
              pendingProtectionRevision.current += 1;
              await AsyncStorage.removeItem(
                PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY,
              );
              if (!mounted) return;
              setConfirmationEmail(null);
              setNeedsPasswordSetup(false);
              setDidCompleteAccountProtection(didCompleteCurrentProtection);
            },
          );
        }
      },
    );

    const initialize = async () => {
      try {
        const initialRevision = sessionRevision.current;
        const [
          sessionResult,
          pendingEmailWithPassword,
          legacyPendingEmail,
          initialUrl,
        ] = await withAuthTimeout(Promise.all([
          client.auth.getSession(),
          AsyncStorage.getItem(PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY),
          AsyncStorage.getItem(PENDING_PROTECTION_EMAIL_KEY),
          Linking.getInitialURL(),
        ]));
        if (!mounted) return;
        if (sessionResult.error) throw sessionResult.error;

        if (legacyPendingEmail) {
          await AsyncStorage.removeItem(PENDING_PROTECTION_EMAIL_KEY);
        }
        if (pendingEmailWithPassword && mounted) {
          setConfirmationEmail(pendingEmailWithPassword);
        }
        if (mounted && sessionRevision.current === initialRevision && sessionResult.data.session) {
          setSession(sessionResult.data.session);
        }
        if (initialUrl) {
          try {
            await handleAuthUrl(initialUrl, "initial");
          } catch (caught) {
            if (mounted) captureError(caught);
            // Do not replace a failed verification with the SDK's unverified
            // stored result, and never start an anonymous sign-in over it.
            return;
          }
        }

        const refreshRevision = sessionRevision.current;
        const refreshedResult = await withAuthTimeout(client.auth.getSession());
        if (refreshedResult.error) throw refreshedResult.error;
        // A newer auth event wins over a session read started before it.
        if (!mounted || refreshRevision !== sessionRevision.current) return;
        const resolvedSession = refreshedResult.data.session ??
          (initialRevision === sessionRevision.current ? sessionResult.data.session : null);
        if (!resolvedSession && activeOAuthAttempt.current) return;
        const activeSession = resolvedSession ?? (await withAuthTimeout(createAnonymousSession()));

        if (mounted) {
          setSession(activeSession);
          const isPermanent =
            Boolean(activeSession?.user) &&
            !isAnonymousUser(activeSession?.user ?? null);
          if (pendingEmailWithPassword && isPermanent) {
            const didCompleteCurrentProtection = pendingEmailMatchesUser(
              pendingEmailWithPassword,
              activeSession?.user ?? null,
            );
            pendingProtectionRevision.current += 1;
            await AsyncStorage.removeItem(
              PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY,
            );
            setConfirmationEmail(null);
            setNeedsPasswordSetup(false);
            setDidCompleteAccountProtection(didCompleteCurrentProtection);
          } else {
            setNeedsPasswordSetup(false);
          }
        }
      } catch (caught) {
        if (mounted) captureError(caught);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void initialize();

    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      void handleAuthUrl(url).catch(captureError);
    });

    return () => {
      mounted = false;
      mountedRef.current = false;
      authListener.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [captureError, handleAuthUrl]);

  const clearError = React.useCallback(() => setError(null), []);
  const clearAccountProtectionSuccess = React.useCallback(
    () => setDidCompleteAccountProtection(false),
    [],
  );

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
      await clearPendingProtectionState();
      try {
        const { data, error: updateError } = await client.auth.updateUser(
          { email, password },
          { emailRedirectTo: createAuthRedirectUrl("protect") },
        );
        if (updateError) throw updateError;

        if (data.user && !isAnonymousUser(data.user)) {
          setConfirmationEmail(null);
          setNeedsPasswordSetup(false);
          setDidCompleteAccountProtection(true);
          return "success" as const;
        }

        await AsyncStorage.setItem(
          PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY,
          email,
        );
        setConfirmationEmail(email);
        return "confirmation-required" as const;
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError, clearPendingProtectionState, session],
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
        await clearPendingProtectionState();
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError, clearPendingProtectionState],
  );

  const resendProtectionEmail = React.useCallback(async () => {
    const client = requireConfiguredAuth();
    const email =
      confirmationEmail ??
      (await AsyncStorage.getItem(
        PENDING_PROTECTION_WITH_PASSWORD_EMAIL_KEY,
      ));

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
      assertAuthIdle();
      const client = requireConfiguredAuth();
      const email = validateEmail(rawEmail);
      validatePassword(password);
      setError(null);

      try {
        await clearPendingProtectionState();
        setIsPasswordRecovery(false);
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
    [assertAuthIdle, captureError, clearPendingProtectionState],
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

      assertAuthIdle();
      const attempt = {
        redirectTo: createAuthRedirectUrl(`oauth-${intent}-${provider}`),
        provider,
        expectedUserId: expectedUserId ?? null,
        callback: null as Promise<Session | null> | null,
        notifyCallback: (_operation: Promise<Session | null>) => {},
      };
      const callbackReceived = new Promise<Session | null>((resolve, reject) => {
        attempt.notifyCallback = (operation) => { void operation.then(resolve, reject); };
      });
      // A callback can fail before authorization or browser startup finishes.
      void callbackReceived.catch(() => undefined);
      activeOAuthAttempt.current = attempt;
      setError(null);
      setOAuthOutcome(null);
      setActiveOAuthProvider(provider);
      logOAuthStep("start", { provider, intent });
      try {
        if (intent === "login") {
          await withAuthTimeout(clearPendingProtectionState());
          setIsPasswordRecovery(false);
          // The local snapshot remains available for the post-login merge even
          // if the guest cloud sync is temporarily unavailable.
          await withAuthTimeout(synchronizeProgressNow()).catch(() => undefined);
        }
        if (!mountedRef.current) return "cancelled";

        const redirectTo = attempt.redirectTo;
        const credentials = {
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        } as const;
        const result = await withAuthTimeout(
          intent === "link"
            ? client.auth.linkIdentity(credentials)
            : client.auth.signInWithOAuth(credentials));

        if (result.error) throw result.error;
        if (!result.data.url) {
          throw new Error("OAuth provider did not return an authorization URL.");
        }

        logOAuthStep("browser.open", { provider, intent });
        const browserOperation = WebBrowser.openAuthSessionAsync(
          result.data.url,
          // Expo's Android polyfill uses startsWith(returnUrl). Keep the
          // matching URL free of query params; retain action in redirectTo
          // for Expo Router and the onboarding bypass on cold starts.
          createAuthRedirectUrl(),
        );
        const completion = await withAuthTimeout(Promise.race([
          browserOperation.then((browserResult) => ({ browserResult })),
          callbackReceived.then((callbackSession) => ({ callbackSession })),
        ]), 5 * 60_000);
        let callbackSession: Session | null;
        if ("callbackSession" in completion) {
          callbackSession = completion.callbackSession;
        } else {
          const browserResult = completion.browserResult;
          logOAuthStep("browser.result", { type: browserResult.type });

          // Linking may already be exchanging the callback when Android reports
          // that the browser was dismissed on app resume. Await that exchange.
          if (browserResult.type === "success") {
            if (!matchesAuthCallbackUrl(browserResult.url, redirectTo)) {
              throw new Error("OAuth returned an unexpected callback destination.");
            }
            callbackSession = await handleAuthUrl(browserResult.url, "browser");
          } else if (attempt.callback) {
            callbackSession = await attempt.callback;
          } else {
            // Android AppState(active) can win Expo's internal Promise.race
            // before the URL event is delivered on the next native bridge turn.
            let timer: ReturnType<typeof setTimeout> | undefined;
            try {
              callbackSession = await Promise.race([
                callbackReceived,
                new Promise<null>((resolve) => {
                  timer = setTimeout(() => resolve(null), OAUTH_RESUME_GRACE_MS);
                }),
              ]);
              if (attempt.callback) callbackSession = await attempt.callback;
            } finally {
              clearTimeout(timer);
            }
            if (!callbackSession) {
              if (mountedRef.current) setOAuthOutcome({ provider, result: "cancelled" });
              logOAuthStep("cancelled", { provider, intent });
              return "cancelled";
            }
          }
        }

        if (!callbackSession || isAnonymousUser(callbackSession.user)) {
          throw new Error("OAuth callback did not establish a permanent session.");
        }
        logOAuthStep("success", { provider, intent });
        return "success";
      } catch (caught) {
        logOAuthStep("failed", { provider, intent, error: toKappAuthError(caught).code });
        throw captureError(caught);
      } finally {
        activeOAuthAttempt.current = null;
        if (mountedRef.current) setActiveOAuthProvider(null);
        logOAuthStep("loading.released", { provider, intent });
      }
    },
    [assertAuthIdle, captureError, clearPendingProtectionState, handleAuthUrl, session],
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
    assertAuthIdle();
    const client = requireConfiguredAuth();
    const signedOutUserId = session?.user.id;
    setError(null);
    setOAuthOutcome(null);

    let syncDeferred = false;
    try {
      await synchronizeProgressNow();
    } catch (syncError) {
      syncDeferred = true;
      console.warn("[auth] Synchronisation différée avant déconnexion.", toKappAuthError(syncError).code);
    }

    try {
      await clearPendingProtectionState();
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) {
        const mappedSignOutError = toKappAuthError(signOutError);
        if (mappedSignOutError.code !== "network-unavailable") {
          throw signOutError;
        }

        const { error: localSignOutError } = await client.auth.signOut({
          scope: "local",
        });
        if (localSignOutError) throw localSignOutError;
      }

      if (signedOutUserId) {
        try {
          await isolateProgressAfterSignOut(signedOutUserId);
        } catch (isolationError) {
          console.error("[auth] Isolation locale impossible.", toKappAuthError(isolationError).code);
          setSession(null);
          setError(
            "Vous êtes déconnecté. Votre progression reste conservée localement ; la session invitée sera créée au retour du réseau.",
          );
          return { syncDeferred: true, guestSessionPending: true };
        }
      }

      try {
        const anonymousSession = await createAnonymousSession();
        setSession(anonymousSession);
      } catch (anonymousError) {
        setSession(null);
        setError(
          "Vous êtes déconnecté. La nouvelle session invitée sera créée au retour du réseau.",
        );
        console.warn("[auth] Session invitée différée.", toKappAuthError(anonymousError).code);
        setIsPasswordRecovery(false);
        setNeedsPasswordSetup(false);
        return { syncDeferred, guestSessionPending: true };
      }

      setIsPasswordRecovery(false);
      setNeedsPasswordSetup(false);
      return { syncDeferred, guestSessionPending: false };
    } catch (caught) {
      throw captureError(caught);
    }
  }, [assertAuthIdle, captureError, clearPendingProtectionState, session?.user.id]);

  const resetPassword = React.useCallback(
    async (rawEmail: string) => {
      const client = requireConfiguredAuth();
      const email = validateEmail(rawEmail);
      setError(null);

      try {
        await clearPendingProtectionState();
        setIsPasswordRecovery(false);
        const { error: resetError } = await client.auth.resetPasswordForEmail(
          email,
          { redirectTo: createAuthRedirectUrl("recovery") },
        );
        if (resetError) throw resetError;
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError, clearPendingProtectionState],
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
        setNeedsPasswordSetup(false);
      } catch (caught) {
        throw captureError(caught);
      }
    },
    [captureError],
  );

  const deleteAccount = React.useCallback(async () => {
    assertAuthIdle();
    const client = requireConfiguredAuth();
    setError(null);

    try {
      await clearPendingProtectionState();
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
  }, [assertAuthIdle, captureError, clearPendingProtectionState]);

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
      isHandlingDeepLink,
      isAuthenticated: Boolean(user),
      isAnonymous,
      isPermanentAccount: Boolean(user && !isAnonymous),
      needsPasswordSetup,
      didCompleteAccountProtection,
      isPasswordRecovery,
      confirmationEmail,
      providers,
      hasEmailIdentity,
      activeOAuthProvider,
      oauthOutcome,
      error,
      clearError,
      clearAccountProtectionSuccess,
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
    }),
    [
      session,
      user,
      isLoading,
      isHandlingDeepLink,
      isAnonymous,
      needsPasswordSetup,
      didCompleteAccountProtection,
      isPasswordRecovery,
      confirmationEmail,
      providers,
      hasEmailIdentity,
      activeOAuthProvider,
      oauthOutcome,
      error,
      clearError,
      clearAccountProtectionSuccess,
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
