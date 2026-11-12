import { router } from "expo-router";
import React from "react";
import { usePaywall } from "./PaywallProvider";
import { premiumRoute } from "./purchaseIntent";

export function usePremiumAccess() {
  const paywall = usePaywall();

  const requirePremiumAccess = React.useCallback(
    (onAllowed?: () => void, returnTo?: string) => {
      if (paywall.hasPremiumAccess) {
        onAllowed?.();
        return true;
      }

      router.push(premiumRoute(returnTo));
      return false;
    },
    [paywall.hasPremiumAccess]
  );

  return {
    ...paywall,
    requirePremiumAccess,
  };
}

export function PremiumGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPremiumAccess, isReady } = usePaywall();

  if (!isReady) {
    return null;
  }

  if (!hasPremiumAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
