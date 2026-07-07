import type { ProductSubscription } from "expo-iap";
import React from "react";
import {
  DEV_UNLOCK_ALL,
  ENABLE_NATIVE_IAP,
  PREMIUM_PRICE_FALLBACKS,
  PREMIUM_PRODUCT_IDS,
  PREMIUM_SUBSCRIPTION_OFFERS,
  type SubscriptionOfferId,
} from "./config";
import {
  createDeveloperEntitlement,
  derivePremiumEntitlement,
  isPremiumPurchase,
} from "./entitlements";
import {
  findSubscriptionOffer,
  openStoreSubscriptionManagement,
  requestSubscriptionPurchase,
  toPaywallError,
} from "./purchases";
import type { PaywallContextValue, PaywallError } from "./types";

const PaywallContext = React.createContext<PaywallContextValue | undefined>(
  undefined
);

const emptySubscriptions = {} as Partial<
  Record<SubscriptionOfferId, ProductSubscription>
>;

const noopAsync = async () => undefined;

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
        "Apercu du paywall actif. Pour tester un achat reel, utilise un dev client reconstruit et passe ENABLE_NATIVE_IAP a true.",
    });
  }, []);

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions: [],
      clearError: () => setError(null),
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
    subscriptions: nativeSubscriptions,
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

  const subscriptions = React.useMemo(
    () =>
      PREMIUM_SUBSCRIPTION_OFFERS.reduce(
        (mappedSubscriptions, offer) => ({
          ...mappedSubscriptions,
          [offer.id]: findSubscriptionOffer(nativeSubscriptions, offer.id),
        }),
        {} as Partial<Record<SubscriptionOfferId, ProductSubscription>>
      ),
    [nativeSubscriptions]
  );

  const displayPrices = React.useMemo(
    () =>
      PREMIUM_SUBSCRIPTION_OFFERS.reduce(
        (prices, offer) => ({
          ...prices,
          [offer.id]:
            subscriptions[offer.id]?.displayPrice ??
            PREMIUM_PRICE_FALLBACKS[offer.id],
        }),
        {} as Record<SubscriptionOfferId, string>
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

  const subscribe = React.useCallback(
    async (offerId: SubscriptionOfferId) => {
      setError(null);
      setIsPurchasing(true);

      try {
        await requestSubscriptionPurchase({
          offerId,
          requestPurchase,
          subscription: subscriptions[offerId],
        });
      } catch (purchaseError) {
        setError(toPaywallError(purchaseError));
        setIsPurchasing(false);
      }
    },
    [requestPurchase, subscriptions]
  );

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
      await openStoreSubscriptionManagement({
        deepLinkToSubscriptions,
        offerId: entitlement.productId
          ? PREMIUM_SUBSCRIPTION_OFFERS.find(
              (offer) => offer.productId === entitlement.productId
            )?.id
          : undefined,
      });
    } catch (managementError) {
      setError(toPaywallError(managementError));
    }
  }, [deepLinkToSubscriptions, entitlement.productId]);

  const value = React.useMemo<PaywallContextValue>(
    () => ({
      activeSubscriptions,
      clearError: () => setError(null),
      displayPrices,
      entitlement,
      error,
      hasPremiumAccess: entitlement.hasAccess,
      isDeveloperUnlocked: false,
      isLoading,
      isPurchasing,
      isReady: connected && !isLoading,
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
      connected,
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
    ]
  );

  return (
    <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>
  );
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
