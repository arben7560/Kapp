import type {
  CustomerInfo,
  PurchasesEntitlementInfo,
  PurchasesError,
  PurchasesPackage,
} from "react-native-purchases";
import Purchases from "react-native-purchases";
import { Linking } from "react-native";
import React from "react";

import {
  DEV_UNLOCK_ALL,
  ENABLE_NATIVE_IAP,
  PREMIUM_ENTITLEMENT_ID,
  PREMIUM_PRICE_FALLBACKS,
  type SubscriptionOfferId,
} from "./config";
import { createDeveloperEntitlement } from "./entitlements";
import type {
  PaywallContextValue,
  PaywallError,
  PremiumEntitlement,
} from "./types";

const PaywallContext = React.createContext<PaywallContextValue | undefined>(
  undefined,
);

const emptySubscriptions: Partial<
  Record<SubscriptionOfferId, PurchasesPackage>
> = {};

const noopAsync = async (): Promise<void> => undefined;

function toRevenueCatError(error: unknown): PaywallError {
  if (
    typeof error === "object" &&
    error !== null &&
    "userCancelled" in error &&
    (error as PurchasesError).userCancelled
  ) {
    return {
      code: "purchase-cancelled",
      message: "",
    };
  }

  if (error instanceof Error) {
    return {
      code:
        "code" in error && typeof error.code === "string"
          ? error.code
          : "revenuecat-error",
      message:
        error.message ||
        "Une erreur est survenue pendant la gestion de l’abonnement.",
    };
  }

  return {
    code: "revenuecat-error",
    message:
      "Une erreur est survenue pendant la gestion de l’abonnement.",
  };
}

function getPremiumEntitlementInfo(
  customerInfo: CustomerInfo,
): PurchasesEntitlementInfo | null {
  return (
    customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] ?? null
  );
}

function deriveRevenueCatEntitlement(
  customerInfo: CustomerInfo | null,
): PremiumEntitlement {
  if (!customerInfo) {
    return {
      hasAccess: false,
      source: "none",
    };
  }

  const entitlementInfo = getPremiumEntitlementInfo(customerInfo);

  if (!entitlementInfo) {
    return {
      hasAccess: false,
      source: "none",
    };
  }

  return {
    hasAccess: entitlementInfo.isActive,
    source: "store",
    productId: entitlementInfo.productIdentifier,
    expiresAt: entitlementInfo.expirationDate
      ? Date.parse(entitlementInfo.expirationDate)
      : null,
    willAutoRenew: entitlementInfo.willRenew,
  };
}

function mapPackages(
  currentOffering:
    | Awaited<ReturnType<typeof Purchases.getOfferings>>["current"]
    | null,
): Partial<Record<SubscriptionOfferId, PurchasesPackage>> {
  if (!currentOffering) {
    return {};
  }

  return {
    monthly: currentOffering.monthly ?? undefined,
    yearly: currentOffering.annual ?? undefined,
  };
}

function DevPaywallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const entitlement = React.useMemo(
    () => createDeveloperEntitlement(),
    [],
  );

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions: [],
      clearError: () => undefined,
      customerInfo: null,
      displayPrices: PREMIUM_PRICE_FALLBACKS,
      entitlement,
      error: null,
      hasPremiumAccess: true,
      isDeveloperUnlocked: true,
      isLoading: false,
      isPurchasing: false,
      isReady: true,
      isRestoring: false,
      openSubscriptionManagement: noopAsync,
      refreshEntitlements: noopAsync,
      restorePurchases: noopAsync,
      subscribe: noopAsync,
      subscribeMonthly: noopAsync,
      subscribeYearly: noopAsync,
      subscriptions: emptySubscriptions,
    }),
    [entitlement],
  );

  return (
    <PaywallContext.Provider value={value}>
      {children}
    </PaywallContext.Provider>
  );
}

function LockedPreviewPaywallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = React.useState<PaywallError | null>(null);

  const entitlement = React.useMemo<PremiumEntitlement>(
    () => ({
      hasAccess: false,
      source: "none",
    }),
    [],
  );

  const showNativeRuntimeError = React.useCallback(async () => {
    setError({
      code: "native-iap-disabled",
      message:
        "Le système d’abonnement est indisponible dans cet environnement.",
    });
  }, []);

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions: [],
      clearError: () => setError(null),
      customerInfo: null,
      displayPrices: PREMIUM_PRICE_FALLBACKS,
      entitlement,
      error,
      hasPremiumAccess: false,
      isDeveloperUnlocked: false,
      isLoading: false,
      isPurchasing: false,
      isReady: true,
      isRestoring: false,
      openSubscriptionManagement: showNativeRuntimeError,
      refreshEntitlements: noopAsync,
      restorePurchases: showNativeRuntimeError,
      subscribe: showNativeRuntimeError,
      subscribeMonthly: showNativeRuntimeError,
      subscribeYearly: showNativeRuntimeError,
      subscriptions: emptySubscriptions,
    }),
    [entitlement, error, showNativeRuntimeError],
  );

  return (
    <PaywallContext.Provider value={value}>
      {children}
    </PaywallContext.Provider>
  );
}

function StorePaywallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customerInfo, setCustomerInfo] =
    React.useState<CustomerInfo | null>(null);

  const [subscriptions, setSubscriptions] = React.useState<
    Partial<Record<SubscriptionOfferId, PurchasesPackage>>
  >(emptySubscriptions);

  const [error, setError] = React.useState<PaywallError | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);

  const updateCustomerInfo = React.useCallback(
    (nextCustomerInfo: CustomerInfo) => {
      setCustomerInfo(nextCustomerInfo);
    },
    [],
  );

  const refreshEntitlements = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const nextCustomerInfo = await Purchases.getCustomerInfo();
      updateCustomerInfo(nextCustomerInfo);
    } catch (refreshError) {
      setError(toRevenueCatError(refreshError));
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  const loadRevenueCatState = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const [offerings, nextCustomerInfo] = await Promise.all([
        Purchases.getOfferings(),
        Purchases.getCustomerInfo(),
      ]);

      setSubscriptions(mapPackages(offerings.current));
      updateCustomerInfo(nextCustomerInfo);

      if (!offerings.current) {
        setError({
          code: "offering-unavailable",
          message:
            "Les abonnements sont momentanément indisponibles.",
        });
      }
    } catch (loadError) {
      setError(toRevenueCatError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  React.useEffect(() => {
    void loadRevenueCatState();

    Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(updateCustomerInfo);
    };
  }, [loadRevenueCatState, updateCustomerInfo]);

  const subscribe = React.useCallback(
    async (offerId: SubscriptionOfferId) => {
      if (isPurchasing || isRestoring) {
        return;
      }

      const selectedPackage = subscriptions[offerId];

      if (!selectedPackage) {
        setError({
          code: "package-unavailable",
          message:
            "Cette formule d’abonnement est momentanément indisponible.",
        });
        return;
      }

      setError(null);
      setIsPurchasing(true);

      try {
        const { customerInfo: purchasedCustomerInfo } =
          await Purchases.purchasePackage(selectedPackage);

        updateCustomerInfo(purchasedCustomerInfo);

        const hasPremium =
          purchasedCustomerInfo.entitlements.active[
            PREMIUM_ENTITLEMENT_ID
          ] !== undefined;

        if (!hasPremium) {
          setError({
            code: "entitlement-not-granted",
            message:
              "L’achat a été enregistré, mais l’accès Premium n’a pas encore été activé. Utilise « Restaurer mes achats » dans quelques instants.",
          });
        }
      } catch (purchaseError) {
        const mappedError = toRevenueCatError(purchaseError);

        // Une annulation volontaire ne doit pas apparaître comme une erreur.
        if (mappedError.code !== "purchase-cancelled") {
          setError(mappedError);
        }
      } finally {
        setIsPurchasing(false);
      }
    },
    [
      isPurchasing,
      isRestoring,
      subscriptions,
      updateCustomerInfo,
    ],
  );

  const restorePurchases = React.useCallback(async () => {
    if (isPurchasing || isRestoring) {
      return;
    }

    setError(null);
    setIsRestoring(true);

    try {
      const restoredCustomerInfo =
        await Purchases.restorePurchases();

      updateCustomerInfo(restoredCustomerInfo);

      const hasPremium =
        restoredCustomerInfo.entitlements.active[
          PREMIUM_ENTITLEMENT_ID
        ] !== undefined;

      if (!hasPremium) {
        setError({
          code: "no-purchases-found",
          message:
            "Aucun abonnement Premium actif n’a été trouvé pour ce compte.",
        });
      }
    } catch (restoreError) {
      setError(toRevenueCatError(restoreError));
    } finally {
      setIsRestoring(false);
    }
  }, [
    isPurchasing,
    isRestoring,
    updateCustomerInfo,
  ]);

  const openSubscriptionManagement = React.useCallback(async () => {
    setError(null);

    try {
      const latestCustomerInfo =
        customerInfo ?? (await Purchases.getCustomerInfo());

      if (!customerInfo) {
        updateCustomerInfo(latestCustomerInfo);
      }

      const managementUrl = latestCustomerInfo.managementURL;

      if (!managementUrl) {
        setError({
          code: "management-url-unavailable",
          message:
            "Aucun abonnement actif ne peut être géré pour le moment.",
        });
        return;
      }

      const canOpen = await Linking.canOpenURL(managementUrl);

      if (!canOpen) {
        throw new Error(
          "Le lien de gestion de l’abonnement ne peut pas être ouvert.",
        );
      }

      await Linking.openURL(managementUrl);
    } catch (managementError) {
      setError(toRevenueCatError(managementError));
    }
  }, [customerInfo, updateCustomerInfo]);

  const displayPrices = React.useMemo<
    Record<SubscriptionOfferId, string>
  >(
    () => ({
      monthly:
        subscriptions.monthly?.product.priceString ??
        PREMIUM_PRICE_FALLBACKS.monthly,
      yearly:
        subscriptions.yearly?.product.priceString ??
        PREMIUM_PRICE_FALLBACKS.yearly,
    }),
    [subscriptions],
  );

  const entitlement = React.useMemo(
    () => deriveRevenueCatEntitlement(customerInfo),
    [customerInfo],
  );

  const activeSubscriptions = React.useMemo(
    () => customerInfo?.activeSubscriptions ?? [],
    [customerInfo],
  );

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions,
      clearError: () => setError(null),
      customerInfo,
      displayPrices,
      entitlement,
      error,
      hasPremiumAccess: entitlement.hasAccess,
      isDeveloperUnlocked: false,
      isLoading,
      isPurchasing,
      isReady: !isLoading,
      isRestoring,
      openSubscriptionManagement,
      refreshEntitlements,
      restorePurchases,
      subscribe,
      subscribeMonthly: () => subscribe("monthly"),
      subscribeYearly: () => subscribe("yearly"),
      subscriptions,
    }),
    [
      activeSubscriptions,
      customerInfo,
      displayPrices,
      entitlement,
      error,
      isLoading,
      isPurchasing,
      isRestoring,
      openSubscriptionManagement,
      refreshEntitlements,
      restorePurchases,
      subscribe,
      subscriptions,
    ],
  );

  return (
    <PaywallContext.Provider value={value}>
      {children}
    </PaywallContext.Provider>
  );
}

export function PaywallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (DEV_UNLOCK_ALL) {
    return (
      <DevPaywallProvider>
        {children}
      </DevPaywallProvider>
    );
  }

  if (!ENABLE_NATIVE_IAP) {
    return (
      <LockedPreviewPaywallProvider>
        {children}
      </LockedPreviewPaywallProvider>
    );
  }

  return (
    <StorePaywallProvider>
      {children}
    </StorePaywallProvider>
  );
}

export function usePaywall(): PaywallContextValue {
  const context = React.useContext(PaywallContext);

  if (!context) {
    throw new Error(
      "usePaywall must be used inside PaywallProvider.",
    );
  }

  return context;
}