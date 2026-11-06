import { router, usePathname } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { DEV_UNLOCK_ALL, isPremiumRoutePath } from "./config";
import { usePaywall } from "./PaywallProvider";

export function SubscriptionAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { hasPremiumAccess, isLoading } = usePaywall();

  React.useEffect(() => {
    if (DEV_UNLOCK_ALL || isLoading || hasPremiumAccess) return;
    if (!isPremiumRoutePath(pathname)) return;

    router.replace("/premium");
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
          accessibilityLabel="Vérification de l’accès Premium"
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
