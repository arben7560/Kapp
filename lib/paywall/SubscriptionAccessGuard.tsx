import { router, usePathname } from "expo-router";
import React from "react";
import { DEV_UNLOCK_ALL, PREMIUM_ROUTE_PATHS } from "./config";
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
    if (!PREMIUM_ROUTE_PATHS.has(pathname)) return;

    router.replace("/premium");
  }, [hasPremiumAccess, isLoading, pathname]);

  const routeRequiresPremium = PREMIUM_ROUTE_PATHS.has(pathname);

  if (
    routeRequiresPremium &&
    !DEV_UNLOCK_ALL &&
    (isLoading || !hasPremiumAccess)
  ) {
    return null;
  }

  return <>{children}</>;
}
