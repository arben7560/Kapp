import type { ActiveSubscription, Purchase } from "expo-iap";
import { PREMIUM_ENTITLEMENT_ID, PREMIUM_PRODUCT_IDS } from "./config";
import type { PremiumEntitlement } from "./types";

export function isPremiumProduct(productId?: string | null) {
  return !!productId && PREMIUM_PRODUCT_IDS.some((id) => id === productId);
}

export function createDeveloperEntitlement(): PremiumEntitlement {
  return {
    hasAccess: true,
    productId: PREMIUM_ENTITLEMENT_ID,
    source: "developer",
    willAutoRenew: null,
  };
}

export function createEmptyEntitlement(): PremiumEntitlement {
  return {
    hasAccess: false,
    source: "none",
  };
}

export function derivePremiumEntitlement(
  subscriptions: ActiveSubscription[]
): PremiumEntitlement {
  const activeSubscription = subscriptions.find(
    (subscription) =>
      subscription.isActive && isPremiumProduct(subscription.productId)
  );

  if (!activeSubscription) {
    return createEmptyEntitlement();
  }

  return {
    hasAccess: true,
    source: "store",
    productId: activeSubscription.productId,
    expiresAt: activeSubscription.expirationDateIOS ?? null,
    willAutoRenew:
      activeSubscription.autoRenewingAndroid ??
      activeSubscription.renewalInfoIOS?.willAutoRenew ??
      null,
  };
}

export function isPremiumPurchase(purchase: Purchase) {
  return isPremiumProduct(purchase.productId);
}
