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

  if (
    routeRequiresPremium &&
    !DEV_UNLOCK_ALL &&
    (isLoading || !hasPremiumAccess)
  ) {
    return (
      <View
        accessibilityLabel="Vérification de l’accès Premium"
        accessibilityRole="progressbar"
        style={styles.loading}
      >
        <ActivityIndicator color="#FDE047" size="small" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: "#000000",
    flex: 1,
    justifyContent: "center",
  },
});
