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

export type PurchaseNotice = {
  userId: string;
  purchasedAt: number;
};

export type PaywallContextValue = {
  hasPremiumAccess: boolean;
  entitlement: PremiumEntitlement;
  isDeveloperUnlocked: boolean;
  isReady: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  managementReturnStatus: "idle" | "checking" | "verified" | "unconfirmed";

  customerInfo: CustomerInfo | null;

  subscriptions: Partial<
    Record<SubscriptionOfferId, PurchasesPackage>
  >;

  displayPrices: Record<SubscriptionOfferId, string>;
  error: PaywallError | null;

  activeSubscriptions: string[];

  refreshEntitlements: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  takePurchaseNotice: () => PurchaseNotice | null;
  subscribeMonthly: () => Promise<boolean>;
  subscribeYearly: () => Promise<boolean>;
  subscribe: (
    offerId: SubscriptionOfferId,
  ) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openSubscriptionManagement: () => Promise<void>;
  clearError: () => void;
};
