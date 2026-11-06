import React from "react";
import { usePathname, useRootNavigationState } from "expo-router";
import { AppState } from "react-native";

import { useAuth } from "../../lib/AuthProvider";
import { useAppLanguage } from "../../lib/i18n/LanguageProvider";

/** Opt-in development traces; never log URLs, authorization codes, emails, or tokens. */
const DEBUG = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_OAUTH_NAV === "1";

export function OAuthNavigationDiagnostics() {
  const pathname = usePathname();
  const navState = useRootNavigationState();
  const auth = useAuth();
  const { locale } = useAppLanguage();

  React.useEffect(() => {
    if (!DEBUG) return;
    console.info("[kapp:oauth-nav]", "diagnostics.mounted");
    return () => console.info("[kapp:oauth-nav]", "diagnostics.unmounted");
  }, []);

  React.useEffect(() => {
    if (!DEBUG) return;
    console.info("[kapp:oauth-nav]", "navigation.snapshot", {
      pathname,
      navigatorKey: navState?.key ?? null,
      routeIndex: navState?.index ?? null,
      locale,
      authenticated: auth.isAuthenticated,
      permanentAccount: auth.isPermanentAccount,
      authLoading: auth.isLoading,
      handlingCallback: auth.isHandlingDeepLink,
      activeOAuth: auth.activeOAuthProvider,
    });
  }, [
    pathname,
    navState?.key,
    navState?.index,
    locale,
    auth.isAuthenticated,
    auth.isPermanentAccount,
    auth.isLoading,
    auth.isHandlingDeepLink,
    auth.activeOAuthProvider,
  ]);

  React.useEffect(() => {
    if (!DEBUG) return;
    const subscription = AppState.addEventListener("change", (state) => {
      console.info("[kapp:oauth-nav]", "appstate", { state });
    });
    return () => subscription.remove();
  }, []);

  return null;
}
