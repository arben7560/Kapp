import type { User } from "@supabase/supabase-js";
import type { CustomerInfo } from "react-native-purchases";
import Purchases from "react-native-purchases";
import { hasActivePremiumEntitlement } from "../lib/paywall/revenueCatLogic";

function isRevenueCatAnonymousId(appUserId: string) {
  return appUserId.startsWith("$RCAnonymousID:");
}

export async function synchronizeRevenueCatIdentity(
  user: User,
): Promise<CustomerInfo | null> {
  const currentAppUserId = await Purchases.getAppUserID();

  if (user.is_anonymous) {
    if (isRevenueCatAnonymousId(currentAppUserId)) return null;
    return Purchases.logOut();
  }

  if (currentAppUserId === user.id) return null;
  const anonymousCustomerInfo = isRevenueCatAnonymousId(currentAppUserId)
    ? await Purchases.getCustomerInfo()
    : null;
  const result = await Purchases.logIn(user.id);
  if (
    anonymousCustomerInfo &&
    hasActivePremiumEntitlement(anonymousCustomerInfo) &&
    !hasActivePremiumEntitlement(result.customerInfo)
  ) {
    return Purchases.restorePurchases();
  }
  return result.customerInfo;
}
