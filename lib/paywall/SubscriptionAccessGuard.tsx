import { router, usePathname } from "expo-router";
import React from "react";
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
    return null;
  }

  return <>{children}</>;
}
