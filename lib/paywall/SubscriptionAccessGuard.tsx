import { router, usePathname } from "expo-router";
import React from "react";
import { DEV_UNLOCK_ALL, PREMIUM_ROUTE_PATHS } from "./config";
import { usePaywall } from "./PaywallProvider";

export function SubscriptionAccessGuard() {
  const pathname = usePathname();
  const { hasPremiumAccess, isLoading } = usePaywall();

  React.useEffect(() => {
    if (DEV_UNLOCK_ALL || isLoading || hasPremiumAccess) return;
    if (!PREMIUM_ROUTE_PATHS.has(pathname)) return;

    router.replace("/premium");
  }, [hasPremiumAccess, isLoading, pathname]);

  return null;
}
