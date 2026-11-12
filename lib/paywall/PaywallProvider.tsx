import React from "react";
import { AppState, Linking } from "react-native";
import type {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";
import Purchases from "react-native-purchases";
import { configureRevenueCat } from "../../services/revenueCat";
import { runRevenueCatOperation, synchronizeRevenueCatIdentity } from "../../services/revenueCatIdentity";
import { useAuth } from "../AuthProvider";

import {
  DEV_UNLOCK_ALL,
  ENABLE_NATIVE_IAP,
  ACCOUNT_PURCHASE_POLICY_VERIFIED,
  PREMIUM_PRICE_FALLBACKS,
  PREMIUM_ENTITLEMENT_ID,
  type SubscriptionOfferId,
} from "./config";
import { createDeveloperEntitlement } from "./entitlements";
import {
  createPaywallOperationGuard,
  deriveRevenueCatEntitlement,
  hasActivePremiumEntitlement,
  mapSubscriptionPackages,
  selectSubscriptionOffering,
  subscriptionManagementURL,
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
      managementReturnStatus: "idle",
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
      displayPrices: { monthly: "Indisponible", yearly: "Indisponible" },
      entitlement,
      error,
      hasPremiumAccess: false,
      isDeveloperUnlocked: false,
      isLoading: false,
      isPurchasing: false,
      isReady: true,
      isRestoring: false,
      managementReturnStatus: "idle",
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
  const { user, isLoading: authLoading } = useAuth();
  const identityKey = user && !user.is_anonymous ? user.id : "guest";
  const [identity, setIdentity] = React.useState({ key: identityKey, generation: 0 });
  const currentIdentity = identity.key === identityKey
    ? identity : { key: identityKey, generation: identity.generation + 1 };
  if (identity !== currentIdentity) {
    // React re-renders this provider before committing its children. Masking
    // also uses the new identity in this render, including in concurrent mode.
    setIdentity(currentIdentity);
  }
  const authRef = React.useRef({ user, ...currentIdentity });
  React.useLayoutEffect(() => {
    authRef.current = { user, key: identityKey, generation: currentIdentity.generation };
  }, [user, identityKey, currentIdentity.generation]);
  const [ownedInfo, setOwnedInfo] = React.useState<{
    key: string; generation: number; info: CustomerInfo;
  } | null>(null);
  const customerInfo = identityKey !== "guest" &&
    ownedInfo?.key === identityKey && ownedInfo.generation === currentIdentity.generation
    ? ownedInfo.info : null;
  const [entitlementCheckedAt, setEntitlementCheckedAt] = React.useState(Date.now);
  const [subscriptions, setSubscriptions] = React.useState<
    Partial<Record<SubscriptionOfferId, PurchasesPackage>>
  >(emptySubscriptions);
  const [error, setError] = React.useState<PaywallError | null>(null);
  const [loadedGeneration, setLoadedGeneration] = React.useState(-1);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = React.useState(true);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const isMountedRef = React.useRef(true);
  const isConfiguredRef = React.useRef(false);
  const processingRef = React.useRef(false);
  const lastCustomerInfoRef = React.useRef<CustomerInfo | null>(null);
  const refreshInFlightRef = React.useRef<Promise<CustomerInfo | null> | null>(null);
  const pendingManagementRef = React.useRef<{ snapshot: typeof authRef.current; requestDate: number } | null>(null);
  const [managementReturn, setManagementReturn] = React.useState<{
    key: string; generation: number; requestDate: number; status: PaywallContextValue["managementReturnStatus"];
  } | null>(null);
  const managementReturnStatus = managementReturn?.key === identityKey &&
    managementReturn.generation === currentIdentity.generation ? managementReturn.status : "idle";
  const operationGuardRef = React.useRef(createPaywallOperationGuard());
  const isLoading = authLoading || loadedGeneration !== currentIdentity.generation || isRefreshing || isLoadingOffers;

  const isCurrent = React.useCallback((snapshot: typeof authRef.current) =>
    isMountedRef.current && snapshot.key === authRef.current.key &&
    snapshot.generation === authRef.current.generation, []);

  const updateCustomerInfo = React.useCallback(
    (info: CustomerInfo, snapshot: typeof authRef.current) => {
      if (!isCurrent(snapshot) || snapshot.key === "guest") return;
      lastCustomerInfoRef.current = info;
      setOwnedInfo({ key: snapshot.key, generation: snapshot.generation, info });
      setEntitlementCheckedAt(Date.now());
      setManagementReturn((current) => current?.key === snapshot.key &&
        current.generation === snapshot.generation && current.status === "unconfirmed" &&
        Date.parse(info.requestDate) > current.requestDate
        ? { ...current, status: "verified" } : current);
      if (hasActivePremiumEntitlement(info)) {
        setError((current) => current?.code === "payment-pending" ||
          current?.code === "entitlement-not-granted" ? null : current);
      }
    }, [isCurrent],
  );

  const withIdentity = React.useCallback(async <T,>(
    snapshot: typeof authRef.current,
    operation: () => Promise<T>,
  ): Promise<T> => runRevenueCatOperation(async () => {
    if (!isCurrent(snapshot)) throw { code: "identity-changed" };
    processingRef.current = true;
    try {
      await synchronizeRevenueCatIdentity(snapshot.user);
      if (!isCurrent(snapshot)) throw { code: "identity-changed" };
      if (snapshot.key !== "guest" && await Purchases.getAppUserID() !== snapshot.key) {
        throw { code: "identity-changed" };
      }
      if (!isCurrent(snapshot)) throw { code: "identity-changed" };
      return await operation();
    } finally {
      processingRef.current = false;
    }
  }), [isCurrent]);

  const loadOfferings = React.useCallback(async () => {
    if (isMountedRef.current) setIsLoadingOffers(true);
    try {
      const offering = selectSubscriptionOffering(await Purchases.getOfferings());
      const packages = mapSubscriptionPackages(offering);
      if (!isMountedRef.current) return;
      setSubscriptions(packages);
      if (!Object.keys(packages).length) {
        setError({ code: "packages-unavailable", message: "Aucune formule Premium compatible n’est disponible sur le Store." });
      }
    } catch (caught) {
      if (isMountedRef.current) setError(toRevenueCatError(caught));
    } finally {
      if (isMountedRef.current) setIsLoadingOffers(false);
    }
  }, []);

  const refreshCustomerInfo = React.useCallback(async (showLoader: boolean) => {
    if (!isConfiguredRef.current) return null;
    if (refreshInFlightRef.current) return refreshInFlightRef.current;
    const snapshot = { ...authRef.current };
    const operation = (async () => {
      if (showLoader) { setIsRefreshing(true); setError(null); }
      try {
        return await withIdentity(snapshot, async () => {
          if (snapshot.key === "guest") return null;
          // Refresh on foreground, at expiry and on explicit request; never
          // interpret a network failure as a new expired CustomerInfo.
          await Purchases.invalidateCustomerInfoCache();
          const info = await Purchases.getCustomerInfo();
          updateCustomerInfo(info, snapshot);
          if (isCurrent(snapshot)) setError((current) => current?.code === "network-unavailable" ? null : current);
          return isCurrent(snapshot) ? info : null;
        });
      } catch (caught) {
        if (isCurrent(snapshot)) setError(toRevenueCatError(caught));
        return null;
      } finally {
        if (isCurrent(snapshot)) {
          setLoadedGeneration(snapshot.generation);
          if (showLoader) setIsRefreshing(false);
        }
      }
    })();
    refreshInFlightRef.current = operation;
    try { return await operation; } finally { refreshInFlightRef.current = null; }
  }, [isCurrent, updateCustomerInfo, withIdentity]);

  const refreshEntitlements = React.useCallback(async () => {
    await refreshCustomerInfo(true);
    await loadOfferings();
  }, [loadOfferings, refreshCustomerInfo]);

  React.useEffect(() => {
    isMountedRef.current = true;
    let previousAppState = AppState.currentState;
    const listener = (info: CustomerInfo) => {
      // Listener payloads do not identify the current App User ID. Never apply
      // a delayed payload to a newly signed-in account.
      // Native events may arrive after the request promise resolves. Ignore
      // that echo to avoid an invalidate -> fetch -> listener refresh loop.
      if (!processingRef.current &&
          JSON.stringify(info) !== JSON.stringify(lastCustomerInfoRef.current)) {
        void refreshCustomerInfo(false);
      }
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    const subscription = AppState.addEventListener("change", (nextState) => {
      const becameActive = nextState === "active" && previousAppState !== "active";
      previousAppState = nextState;
      if (becameActive) {
        setEntitlementCheckedAt(Date.now());
        const pending = pendingManagementRef.current;
        pendingManagementRef.current = null;
        if (pending && isCurrent(pending.snapshot)) {
          setManagementReturn({ ...pending.snapshot, requestDate: pending.requestDate, status: "checking" });
          // Finish an older in-flight read first, then request a fresh state.
          void (async () => {
            await refreshInFlightRef.current;
            const info = await refreshCustomerInfo(false);
            if (!isCurrent(pending.snapshot)) return;
            const fresh = !!info && Date.parse(info.requestDate) > pending.requestDate;
            setManagementReturn({ ...pending.snapshot, requestDate: pending.requestDate, status: fresh ? "verified" : "unconfirmed" });
          })();
        } else {
          void refreshCustomerInfo(false);
        }
      }
    });
    return () => {
      isMountedRef.current = false;
      subscription.remove();
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isCurrent, refreshCustomerInfo]);

  React.useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    const snapshot = { ...authRef.current };
    const initialize = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setError(null);
      setIsRefreshing(false);
      try {
        // On a cold start, use the authenticated UUID directly, without
        // merging an old anonymous RevenueCat identity.
        isConfiguredRef.current = configureRevenueCat(
          snapshot.key === "guest" ? undefined : snapshot.key,
        );
        if (!isConfiguredRef.current) {
          setIsLoadingOffers(false);
          throw { code: "23" };
        }
        // Offerings are independent of account entitlements; guests can browse.
        void loadOfferings();
        await withIdentity(snapshot, async () => {
          if (snapshot.key === "guest") return;
          const info = await Purchases.getCustomerInfo();
          updateCustomerInfo(info, snapshot);
        });
      } catch (caught) {
        if (!cancelled && isCurrent(snapshot)) setError(toRevenueCatError(caught));
      } finally {
        if (!cancelled && isCurrent(snapshot)) setLoadedGeneration(snapshot.generation);
      }
    };
    void initialize();
    return () => { cancelled = true; };
  }, [authLoading, identityKey, isCurrent, loadOfferings, updateCustomerInfo, withIdentity]);

  const transact = React.useCallback(async (
    operation: "purchase" | "restore", offerId?: SubscriptionOfferId,
  ) => {
    const snapshot = { ...authRef.current };
    if (snapshot.key === "guest" || authLoading) {
      setError(toRevenueCatError({ code: "authentication-required" }));
      return false;
    }
    if (!isConfiguredRef.current) {
      setError(toRevenueCatError({ code: "23" }));
      return false;
    }
    if (!ACCOUNT_PURCHASE_POLICY_VERIFIED) {
      setError(toRevenueCatError({ code: "account-policy-unverified" }));
      return false;
    }
    if (!operationGuardRef.current.begin(operation)) return false;
    setError(null);
    if (operation === "purchase") setIsPurchasing(true);
    else setIsRestoring(true);
    try {
      return await withIdentity(snapshot, async () => {
        const existing = await Purchases.getCustomerInfo();
        if (!isCurrent(snapshot)) return false;
        updateCustomerInfo(existing, snapshot);
        if (operation === "purchase" && hasActivePremiumEntitlement(existing)) return true;
        const selectedPackage = offerId ? subscriptions[offerId] : undefined;
        if (operation === "purchase" && !selectedPackage) {
          setError({ code: "package-unavailable", message: "Cette formule d’abonnement est momentanément indisponible." });
          return false;
        }
        // No await between the final identity check and native billing.
        if (!isCurrent(snapshot)) return false;
        const info = operation === "restore"
          ? await Purchases.restorePurchases()
          : (await Purchases.purchasePackage(selectedPackage!)).customerInfo;
        if (!isCurrent(snapshot)) return false;
        updateCustomerInfo(info, snapshot);
        const hasPremium = hasActivePremiumEntitlement(info);
        if (!hasPremium) {
          const historical = info.entitlements.all?.[PREMIUM_ENTITLEMENT_ID];
          setError(operation === "purchase"
            ? { code: "entitlement-not-granted", message: "L’achat a été enregistré, mais l’accès Premium n’a pas encore été activé. Utilise « Restaurer mes achats » dans quelques instants." }
            : historical
              ? { code: "subscription-expired", message: "L’abonnement retrouvé a expiré. Aucun accès Premium actif n’est disponible." }
              : { code: "no-purchases-found", message: "Aucun abonnement Premium actif n’a été trouvé pour ce compte." });
        }
        return hasPremium;
      });
    } catch (caught) {
      const mapped = toRevenueCatError(caught);
      if (isCurrent(snapshot) && mapped.code !== "purchase-cancelled") setError(mapped);
      return false;
    } finally {
      operationGuardRef.current.end(operation);
      if (isMountedRef.current) {
        setIsPurchasing(false);
        setIsRestoring(false);
      }
    }
  }, [authLoading, isCurrent, subscriptions, updateCustomerInfo, withIdentity]);

  const subscribe = React.useCallback(
    (offerId: SubscriptionOfferId) => transact("purchase", offerId), [transact],
  );
  const restorePurchases = React.useCallback(() => transact("restore"), [transact]);

  const openSubscriptionManagement = React.useCallback(async () => {
    const snapshot = { ...authRef.current };
    setError(null);
    if (snapshot.key === "guest") {
      setError(toRevenueCatError({ code: "authentication-required" }));
      return;
    }
    if (!isConfiguredRef.current) return;
    try {
      await withIdentity(snapshot, async () => {
        const info = await Purchases.getCustomerInfo();
        if (!isCurrent(snapshot)) return;
        updateCustomerInfo(info, snapshot);
        const url = subscriptionManagementURL(info);
        if (!url) {
          setError({ code: "management-url-unavailable", message: "Aucun abonnement actif ne peut être géré pour le moment." });
          return;
        }
        pendingManagementRef.current = { snapshot, requestDate: Date.parse(info.requestDate) };
        setManagementReturn({ ...snapshot, requestDate: Date.parse(info.requestDate), status: "idle" });
        await Linking.openURL(url);
      });
    } catch (caught) {
      pendingManagementRef.current = null;
      if (isCurrent(snapshot)) setError(toRevenueCatError(caught));
    }
  }, [isCurrent, updateCustomerInfo, withIdentity]);

  const displayPrices = React.useMemo<Record<SubscriptionOfferId, string>>(() => ({
    monthly: subscriptions.monthly ? `${subscriptions.monthly.product.priceString} / mois` : "Indisponible",
    yearly: subscriptions.yearly ? `${subscriptions.yearly.product.priceString} / an` : "Indisponible",
  }), [subscriptions]);
  const entitlement = React.useMemo(
    () => deriveRevenueCatEntitlement(customerInfo, entitlementCheckedAt),
    [customerInfo, entitlementCheckedAt],
  );

  React.useEffect(() => {
    if (!customerInfo || (!customerInfo.entitlements.all?.[PREMIUM_ENTITLEMENT_ID] &&
        !customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID])) return;
    // Poll only identified subscribers/history. Expiration is a real SDK date,
    // including a reported grace period; no invented 30-day extension.
    const expiry = entitlement.expiresAt;
    const delay = expiry && expiry > Date.now()
      ? Math.min(expiry - Date.now() + 1, 60_000) : 60_000;
    const timer = setTimeout(() => {
      setEntitlementCheckedAt(Date.now());
      void refreshCustomerInfo(Boolean(expiry && expiry <= Date.now()));
    }, delay);
    return () => clearTimeout(timer);
  }, [customerInfo, entitlement.expiresAt, entitlementCheckedAt, refreshCustomerInfo]);

  const value = React.useMemo<PaywallContextValue>(() => ({
    activeSubscriptions: customerInfo?.activeSubscriptions ?? [],
    clearError: () => setError(null),
    customerInfo, displayPrices, entitlement, error,
    hasPremiumAccess: entitlement.hasAccess,
    isDeveloperUnlocked: false, isLoading, isPurchasing,
    isReady: !isLoading, isRestoring, managementReturnStatus,
    openSubscriptionManagement, refreshEntitlements, restorePurchases, subscribe,
    subscribeMonthly: () => subscribe("monthly"),
    subscribeYearly: () => subscribe("yearly"),
    subscriptions,
  }), [customerInfo, displayPrices, entitlement, error, isLoading, isPurchasing,
    isRestoring, managementReturnStatus, openSubscriptionManagement, refreshEntitlements, restorePurchases,
    subscribe, subscriptions]);

  return <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>;
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
