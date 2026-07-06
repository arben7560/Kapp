import type { ActiveSubscription, ProductSubscription } from "expo-iap";

export type EntitlementSource = "developer" | "store" | "none";

export type PremiumEntitlement = {
  hasAccess: boolean;
  source: EntitlementSource;
  productId?: string;
  expiresAt?: number | null;
  willAutoRenew?: boolean | null;
};

export type PaywallError = {
  code?: string;
  message: string;
};

export type PaywallContextValue = {
  hasPremiumAccess: boolean;
  entitlement: PremiumEntitlement;
  isDeveloperUnlocked: boolean;
  isReady: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  monthlySubscription?: ProductSubscription;
  displayPrice: string;
  error: PaywallError | null;
  activeSubscriptions: ActiveSubscription[];
  refreshEntitlements: () => Promise<void>;
  subscribeMonthly: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  openSubscriptionManagement: () => Promise<void>;
  clearError: () => void;
};
