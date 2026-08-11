import type {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";

import type { SubscriptionOfferId } from "./config";

export type EntitlementSource =
  | "developer"
  | "store"
  | "none";

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

  customerInfo: CustomerInfo | null;

  subscriptions: Partial<
    Record<SubscriptionOfferId, PurchasesPackage>
  >;

  displayPrices: Record<SubscriptionOfferId, string>;
  error: PaywallError | null;

  activeSubscriptions: string[];

  refreshEntitlements: () => Promise<void>;
  subscribeMonthly: () => Promise<boolean>;
  subscribeYearly: () => Promise<boolean>;
  subscribe: (
    offerId: SubscriptionOfferId,
  ) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openSubscriptionManagement: () => Promise<void>;
  clearError: () => void;
};
