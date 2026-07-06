import type { ProductSubscription } from "expo-iap";
import React from "react";
import { Platform } from "react-native";
import {
  DEV_UNLOCK_ALL,
  ENABLE_NATIVE_IAP,
  PREMIUM_MONTHLY_PRICE_FALLBACK,
  PREMIUM_PRODUCT_IDS,
  STORE_PACKAGE_NAME_ANDROID,
  SUBSCRIPTION_PRODUCT_IDS,
} from "./config";
import {
  createDeveloperEntitlement,
  derivePremiumEntitlement,
  isPremiumPurchase,
} from "./entitlements";
import type { PaywallContextValue, PaywallError } from "./types";

const PaywallContext = React.createContext<PaywallContextValue | undefined>(
  undefined
);

const toPaywallError = (error: unknown): PaywallError => {
  if (error && typeof error === "object") {
    const maybeError = error as { code?: string; message?: string };
    return {
      code: maybeError.code,
      message: maybeError.message ?? "Une erreur est survenue.",
    };
  }

  return { message: "Une erreur est survenue." };
};

const getExpoIap = () => {
  // Keep the native module out of Expo Go / preview runtimes.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-iap") as typeof import("expo-iap");
};

function DevPaywallProvider({ children }: { children: React.ReactNode }) {
  const entitlement = React.useMemo(() => createDeveloperEntitlement(), []);

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions: [],
      clearError: () => null,
      displayPrice: PREMIUM_MONTHLY_PRICE_FALLBACK,
      entitlement,
      error: null,
      hasPremiumAccess: true,
      isDeveloperUnlocked: true,
      isLoading: false,
      isPurchasing: false,
      isReady: true,
      isRestoring: false,
      monthlySubscription: undefined,
      openSubscriptionManagement: async () => undefined,
      refreshEntitlements: async () => undefined,
      restorePurchases: async () => undefined,
      subscribeMonthly: async () => undefined,
    }),
    [entitlement]
  );

  return (
    <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>
  );
}

function LockedPreviewPaywallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = React.useState<PaywallError | null>(null);
  const entitlement = React.useMemo(
    () => ({
      hasAccess: false,
      source: "none" as const,
    }),
    []
  );

  const showNativeRuntimeError = React.useCallback(async () => {
    setError({
      code: "native-iap-disabled",
      message:
        "Aperçu du paywall actif. Pour tester un achat réel, utilise un dev client reconstruit et passe ENABLE_NATIVE_IAP à true.",
    });
  }, []);

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions: [],
      clearError: () => setError(null),
      displayPrice: PREMIUM_MONTHLY_PRICE_FALLBACK,
      entitlement,
      error,
      hasPremiumAccess: false,
      isDeveloperUnlocked: false,
      isLoading: false,
      isPurchasing: false,
      isReady: true,
      isRestoring: false,
      monthlySubscription: undefined,
      openSubscriptionManagement: showNativeRuntimeError,
      refreshEntitlements: async () => undefined,
      restorePurchases: showNativeRuntimeError,
      subscribeMonthly: showNativeRuntimeError,
    }),
    [entitlement, error, showNativeRuntimeError]
  );

  return (
    <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>
  );
}

function StorePaywallProvider({ children }: { children: React.ReactNode }) {
  const { deepLinkToSubscriptions, useIAP } = getExpoIap();
  const [error, setError] = React.useState<PaywallError | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);

  const {
    activeSubscriptions,
    connected,
    fetchProducts,
    finishTransaction,
    getActiveSubscriptions,
    requestPurchase,
    restorePurchases: restoreNativePurchases,
    subscriptions,
  } = useIAP({
    onError: (iapError) => {
      setError(toPaywallError(iapError));
      setIsLoading(false);
      setIsPurchasing(false);
      setIsRestoring(false);
    },
    onPurchaseError: (purchaseError) => {
      setError(toPaywallError(purchaseError));
      setIsPurchasing(false);
    },
    onPurchaseSuccess: async (purchase) => {
      try {
        if (isPremiumPurchase(purchase)) {
          await finishTransaction({ purchase, isConsumable: false });
          await getActiveSubscriptions(PREMIUM_PRODUCT_IDS);
        }
      } catch (finishError) {
        setError(toPaywallError(finishError));
      } finally {
        setIsPurchasing(false);
      }
    },
  });

  const monthlySubscription = React.useMemo(
    () =>
      subscriptions.find(
        (subscription) => subscription.id === SUBSCRIPTION_PRODUCT_IDS.monthly
      ),
    [subscriptions]
  );

  const entitlement = React.useMemo(
    () => derivePremiumEntitlement(activeSubscriptions),
    [activeSubscriptions]
  );

  const refreshEntitlements = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await getActiveSubscriptions(PREMIUM_PRODUCT_IDS);
    } catch (refreshError) {
      setError(toPaywallError(refreshError));
    } finally {
      setIsLoading(false);
    }
  }, [getActiveSubscriptions]);

  React.useEffect(() => {
    if (!connected) return;

    let mounted = true;

    const loadStoreState = async () => {
      setError(null);
      setIsLoading(true);

      try {
        await fetchProducts({
          skus: PREMIUM_PRODUCT_IDS,
          type: "subs",
        });
        await getActiveSubscriptions(PREMIUM_PRODUCT_IDS);
      } catch (loadError) {
        if (mounted) {
          setError(toPaywallError(loadError));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStoreState();

    return () => {
      mounted = false;
    };
  }, [connected, fetchProducts, getActiveSubscriptions]);

  const subscribeMonthly = React.useCallback(async () => {
    setError(null);
    setIsPurchasing(true);

    try {
      const offerToken = getAndroidOfferToken(monthlySubscription);

      await requestPurchase({
        request: {
          apple: { sku: SUBSCRIPTION_PRODUCT_IDS.monthly },
          google: {
            skus: [SUBSCRIPTION_PRODUCT_IDS.monthly],
            subscriptionOffers: offerToken
              ? [{ sku: SUBSCRIPTION_PRODUCT_IDS.monthly, offerToken }]
              : undefined,
          },
        },
        type: "subs",
      });
    } catch (purchaseError) {
      setError(toPaywallError(purchaseError));
      setIsPurchasing(false);
    }
  }, [monthlySubscription, requestPurchase]);

  const restorePurchases = React.useCallback(async () => {
    setError(null);
    setIsRestoring(true);

    try {
      await restoreNativePurchases();
      await getActiveSubscriptions(PREMIUM_PRODUCT_IDS);
    } catch (restoreError) {
      setError(toPaywallError(restoreError));
    } finally {
      setIsRestoring(false);
    }
  }, [getActiveSubscriptions, restoreNativePurchases]);

  const openSubscriptionManagement = React.useCallback(async () => {
    setError(null);

    try {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        await deepLinkToSubscriptions({
          packageNameAndroid: STORE_PACKAGE_NAME_ANDROID,
          skuAndroid: SUBSCRIPTION_PRODUCT_IDS.monthly,
        });
      }
    } catch (managementError) {
      setError(toPaywallError(managementError));
    }
  }, [deepLinkToSubscriptions]);

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions,
      clearError: () => setError(null),
      displayPrice:
        monthlySubscription?.displayPrice ?? PREMIUM_MONTHLY_PRICE_FALLBACK,
      entitlement,
      error,
      hasPremiumAccess: entitlement.hasAccess,
      isDeveloperUnlocked: false,
      isLoading,
      isPurchasing,
      isReady: connected && !isLoading,
      isRestoring,
      monthlySubscription,
      openSubscriptionManagement,
      refreshEntitlements,
      restorePurchases,
      subscribeMonthly,
    }),
    [
      activeSubscriptions,
      connected,
      entitlement,
      error,
      isLoading,
      isPurchasing,
      isRestoring,
      monthlySubscription,
      openSubscriptionManagement,
      refreshEntitlements,
      restorePurchases,
      subscribeMonthly,
    ]
  );

  return (
    <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>
  );
}

function getAndroidOfferToken(subscription?: ProductSubscription) {
  if (!subscription || subscription.platform !== "android") return undefined;
  return subscription.subscriptionOffers?.[0]?.offerTokenAndroid ?? undefined;
}

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  if (DEV_UNLOCK_ALL) {
    return <DevPaywallProvider>{children}</DevPaywallProvider>;
  }

  if (!ENABLE_NATIVE_IAP) {
    return (
      <LockedPreviewPaywallProvider>{children}</LockedPreviewPaywallProvider>
    );
  }

  return <StorePaywallProvider>{children}</StorePaywallProvider>;
}

export function usePaywall() {
  const context = React.useContext(PaywallContext);

  if (!context) {
    throw new Error("usePaywall must be used inside PaywallProvider.");
  }

  return context;
}
