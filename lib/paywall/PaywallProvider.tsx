import React from "react";
import { AppState, Linking } from "react-native";
import type {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";
import Purchases from "react-native-purchases";
import { configureRevenueCat } from "../../services/revenueCat";

import {
  DEV_UNLOCK_ALL,
  ENABLE_NATIVE_IAP,
  PREMIUM_PRICE_FALLBACKS,
  type SubscriptionOfferId,
} from "./config";
import { createDeveloperEntitlement } from "./entitlements";
import {
  createPaywallOperationGuard,
  deriveRevenueCatEntitlement,
  hasActivePremiumEntitlement,
  mapSubscriptionPackages,
  toRevenueCatError,
} from "./revenueCatLogic";
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
const succeedAsync = async (): Promise<boolean> => true;
function DevPaywallProvider({ children }: { children: React.ReactNode }) {
  const entitlement = React.useMemo(() => createDeveloperEntitlement(), []);

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
      restorePurchases: succeedAsync,
      subscribe: succeedAsync,
      subscribeMonthly: succeedAsync,
      subscribeYearly: succeedAsync,
      subscriptions: emptySubscriptions,
    }),
    [entitlement],
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

  const failNativeSubscription = React.useCallback(async () => {
    await showNativeRuntimeError();
    return false;
  }, [showNativeRuntimeError]);

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
      restorePurchases: failNativeSubscription,
      subscribe: failNativeSubscription,
      subscribeMonthly: failNativeSubscription,
      subscribeYearly: failNativeSubscription,
      subscriptions: emptySubscriptions,
    }),
    [entitlement, error, failNativeSubscription, showNativeRuntimeError],
  );

  return (
    <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>
  );
}

function StorePaywallProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = React.useState<CustomerInfo | null>(
    null,
  );

  const [subscriptions, setSubscriptions] =
    React.useState<Partial<Record<SubscriptionOfferId, PurchasesPackage>>>(
      emptySubscriptions,
    );

  const [error, setError] = React.useState<PaywallError | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const isMountedRef = React.useRef(true);
  const isConfiguredRef = React.useRef(false);
  const refreshInFlightRef = React.useRef(false);
  const operationGuardRef = React.useRef(createPaywallOperationGuard());

  const updateCustomerInfo = React.useCallback(
    (nextCustomerInfo: CustomerInfo) => {
      if (isMountedRef.current) setCustomerInfo(nextCustomerInfo);
    },
    [],
  );

  const refreshCustomerInfo = React.useCallback(
    async (showLoader: boolean) => {
      if (
        !isConfiguredRef.current ||
        refreshInFlightRef.current ||
        operationGuardRef.current.isBusy()
      ) {
        return;
      }

      refreshInFlightRef.current = true;
      if (isMountedRef.current && showLoader) {
        setError(null);
        setIsLoading(true);
      }

      try {
        const nextCustomerInfo = await Purchases.getCustomerInfo();
        updateCustomerInfo(nextCustomerInfo);
      } catch (refreshError) {
        if (isMountedRef.current && showLoader) {
          setError(toRevenueCatError(refreshError));
        }
      } finally {
        refreshInFlightRef.current = false;
        if (isMountedRef.current && showLoader) setIsLoading(false);
      }
    },
    [updateCustomerInfo],
  );

  const refreshEntitlements = React.useCallback(
    () => refreshCustomerInfo(true),
    [refreshCustomerInfo],
  );

  const loadRevenueCatState = React.useCallback(async () => {
    if (isMountedRef.current) {
      setError(null);
      setIsLoading(true);
    }

    try {
      const nextCustomerInfo = await Purchases.getCustomerInfo();
      updateCustomerInfo(nextCustomerInfo);
    } catch (customerInfoError) {
      if (isMountedRef.current) {
        setError(toRevenueCatError(customerInfoError));
      }
    }

    try {
      const offerings = await Purchases.getOfferings();
      const nextSubscriptions = mapSubscriptionPackages(offerings.current);

      if (isMountedRef.current) {
        setSubscriptions(nextSubscriptions);

        if (!offerings.current) {
          setError({
            code: "offering-unavailable",
            message: "Aucune offre RevenueCat active n’est disponible.",
          });
        } else if (Object.keys(nextSubscriptions).length === 0) {
          setError({
            code: "packages-unavailable",
            message:
              "Aucune formule Premium compatible n’est disponible sur le Store.",
          });
        }
      }
    } catch (offeringsError) {
      if (isMountedRef.current) {
        setSubscriptions({});
        setError({
          code: "offerings-load-failed",
          message:
            toRevenueCatError(offeringsError).code === "network-unavailable"
              ? "Les abonnements ne peuvent pas être chargés hors ligne. Ton accès Premium existant reste disponible."
              : "Les abonnements sont momentanément indisponibles.",
        });
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  React.useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;
    let listenerInstalled = false;
    let previousAppState = AppState.currentState;

    const initializeRevenueCatState = async () => {
      await Promise.resolve();
      if (cancelled) return;

      try {
        isConfiguredRef.current = configureRevenueCat();

        if (!isConfiguredRef.current) {
          setSubscriptions({});
          setError({
            code: "revenuecat-not-configured",
            message:
              "Le service d’abonnement n’est pas configuré pour cette plateforme.",
          });
          setIsLoading(false);
        } else {
          Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);
          listenerInstalled = true;
          await loadRevenueCatState();
        }
      } catch (initializationError) {
        if (!cancelled) {
          setError(toRevenueCatError(initializationError));
          setIsLoading(false);
        }
      }
    };

    void initializeRevenueCatState();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        const becameActive =
          nextAppState === "active" && previousAppState !== "active";
        previousAppState = nextAppState;

        if (becameActive) void refreshCustomerInfo(false);
      },
    );

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      appStateSubscription.remove();
      if (listenerInstalled) {
        Purchases.removeCustomerInfoUpdateListener(updateCustomerInfo);
      }
    };
  }, [loadRevenueCatState, refreshCustomerInfo, updateCustomerInfo]);

  const subscribe = React.useCallback(
    async (offerId: SubscriptionOfferId) => {
      const selectedPackage = subscriptions[offerId];

      if (!selectedPackage) {
        setError({
          code: "package-unavailable",
          message: "Cette formule d’abonnement est momentanément indisponible.",
        });
        return false;
      }

      if (!operationGuardRef.current.begin("purchase")) return false;

      setError(null);
      setIsPurchasing(true);

      try {
        const { customerInfo: purchasedCustomerInfo } =
          await Purchases.purchasePackage(selectedPackage);

        updateCustomerInfo(purchasedCustomerInfo);

        const hasPremium = hasActivePremiumEntitlement(purchasedCustomerInfo);

        if (!hasPremium && isMountedRef.current) {
          setError({
            code: "entitlement-not-granted",
            message:
              "L’achat a été enregistré, mais l’accès Premium n’a pas encore été activé. Utilise « Restaurer mes achats » dans quelques instants.",
          });
        }

        return hasPremium;
      } catch (purchaseError) {
        const mappedError = toRevenueCatError(purchaseError);

        // Une annulation volontaire ne doit pas apparaître comme une erreur.
        if (mappedError.code !== "purchase-cancelled") {
          if (isMountedRef.current) setError(mappedError);
        }
        return false;
      } finally {
        operationGuardRef.current.end("purchase");
        if (isMountedRef.current) setIsPurchasing(false);
      }
    },
    [subscriptions, updateCustomerInfo],
  );

  const restorePurchases = React.useCallback(async () => {
    if (!operationGuardRef.current.begin("restore")) return false;

    setError(null);
    setIsRestoring(true);

    try {
      const restoredCustomerInfo = await Purchases.restorePurchases();

      updateCustomerInfo(restoredCustomerInfo);

      const hasPremium = hasActivePremiumEntitlement(restoredCustomerInfo);

      if (!hasPremium && isMountedRef.current) {
        setError({
          code: "no-purchases-found",
          message:
            "Aucun abonnement Premium actif n’a été trouvé pour ce compte.",
        });
      }

      return hasPremium;
    } catch (restoreError) {
      if (isMountedRef.current) setError(toRevenueCatError(restoreError));
      return false;
    } finally {
      operationGuardRef.current.end("restore");
      if (isMountedRef.current) setIsRestoring(false);
    }
  }, [updateCustomerInfo]);

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
          message: "Aucun abonnement actif ne peut être géré pour le moment.",
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
      if (isMountedRef.current) setError(toRevenueCatError(managementError));
    }
  }, [customerInfo, updateCustomerInfo]);

  const displayPrices = React.useMemo<Record<SubscriptionOfferId, string>>(
    () => ({
      monthly:
        subscriptions.monthly?.product.priceString ??
        (isLoading ? PREMIUM_PRICE_FALLBACKS.monthly : "Indisponible"),
      yearly:
        subscriptions.yearly?.product.priceString ??
        (isLoading ? PREMIUM_PRICE_FALLBACKS.yearly : "Indisponible"),
    }),
    [isLoading, subscriptions],
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

export function usePaywall(): PaywallContextValue {
  const context = React.useContext(PaywallContext);

  if (!context) {
    throw new Error("usePaywall must be used inside PaywallProvider.");
  }

  return context;
}
