import { router, usePathname } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { DEV_UNLOCK_ALL, isPremiumRoutePath } from "./config";
import { usePaywall } from "./PaywallProvider";
import { premiumRoute } from "./purchaseIntent";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isAppLocale } from "../i18n/config";
import { resolvePremiumText } from "../i18n/premiumText";

export function SubscriptionAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { i18n } = useTranslation("premium");
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(activeLanguage) ? activeLanguage : DEFAULT_LOCALE;
  const { hasPremiumAccess, isLoading } = usePaywall();

  React.useEffect(() => {
    if (DEV_UNLOCK_ALL || isLoading || hasPremiumAccess) return;
    if (!isPremiumRoutePath(pathname)) return;

    router.replace(premiumRoute(pathname));
  }, [hasPremiumAccess, isLoading, pathname]);

  const routeRequiresPremium = isPremiumRoutePath(pathname);

  const isBlocked =
    routeRequiresPremium &&
    !DEV_UNLOCK_ALL &&
    (isLoading || !hasPremiumAccess);

  // Keep the root Stack at the same position through entitlement/UID changes.
  // Removing it here destroys navigation state before router.replace can run.
  return (
    <View style={styles.container}>
      <View
        style={styles.container}
        pointerEvents={isBlocked ? "none" : "auto"}
        accessibilityElementsHidden={isBlocked}
        importantForAccessibility={isBlocked ? "no-hide-descendants" : "auto"}
      >
        {children}
      </View>
      {isBlocked ? (
        <View
          accessibilityLabel={resolvePremiumText("Vérification de l’accès Premium", locale, i18n)}
          accessibilityRole="progressbar"
          style={styles.loading}
        >
          <ActivityIndicator color="#FDE047" size="small" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#000000",
    flex: 1,
    justifyContent: "center",
  },
});
