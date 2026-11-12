import type { User } from "@supabase/supabase-js";
import type { CustomerInfo } from "react-native-purchases";
import Purchases from "react-native-purchases";

// All identity changes, reads and transactions share one queue, including
// across provider remounts. A login cannot overtake an in-flight purchase.
let sdkQueue: Promise<unknown> = Promise.resolve();
export function runRevenueCatOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = sdkQueue.catch(() => undefined).then(operation);
  sdkQueue = result.catch(() => undefined);
  return result;
}

function isRevenueCatAnonymousId(appUserId: string) {
  return appUserId.startsWith("$RCAnonymousID:");
}

export async function synchronizeRevenueCatIdentity(
  user: User | null,
): Promise<CustomerInfo | null> {
  const currentAppUserId = await Purchases.getAppUserID();

  if (!user || user.is_anonymous) {
    if (isRevenueCatAnonymousId(currentAppUserId)) return null;
    return Purchases.logOut();
  }

  if (currentAppUserId === user.id) return null;
  if (isRevenueCatAnonymousId(currentAppUserId)) {
    const anonymousInfo = await Purchases.getCustomerInfo();
    if (anonymousInfo.allPurchasedProductIdentifiers.length > 0 ||
        Object.keys(anonymousInfo.entitlements.all).length > 0) {
      // logIn would alias historical anonymous receipts to this account.
      // Preserve them for explicit recovery after a restart configured with
      // the authenticated UUID; never claim them merely because login occurred.
      throw { code: "legacy-anonymous-purchases" };
    }
  }
  return (await Purchases.logIn(user.id)).customerInfo;
}
