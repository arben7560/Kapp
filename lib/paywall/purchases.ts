import type { ProductSubscription } from "expo-iap";
import { Platform } from "react-native";
import {
  PREMIUM_PRODUCT_IDS,
  STORE_PACKAGE_NAME_ANDROID,
  SUBSCRIPTION_PRODUCT_IDS,
  type SubscriptionOfferId,
} from "./config";
import type { PaywallError } from "./types";

type ExpoIapModule = typeof import("expo-iap");
type RequestPurchase = ReturnType<ExpoIapModule["useIAP"]>["requestPurchase"];
type DeepLinkToSubscriptions = ExpoIapModule["deepLinkToSubscriptions"];

export const toPaywallError = (error: unknown): PaywallError => {
  if (error && typeof error === "object") {
    const maybeError = error as { code?: string; message?: string };
    return {
      code: maybeError.code,
      message: maybeError.message ?? "Une erreur est survenue.",
    };
  }

  return { message: "Une erreur est survenue." };
};

export function findSubscriptionOffer(
  subscriptions: ProductSubscription[],
  offerId: SubscriptionOfferId
) {
  const productId = SUBSCRIPTION_PRODUCT_IDS[offerId];
  return subscriptions.find((subscription) => subscription.id === productId);
}

export async function requestSubscriptionPurchase({
  offerId,
  requestPurchase,
  subscription,
}: {
  offerId: SubscriptionOfferId;
  requestPurchase: RequestPurchase;
  subscription?: ProductSubscription;
}) {
  const productId = SUBSCRIPTION_PRODUCT_IDS[offerId];
  const offerToken = getAndroidOfferToken(subscription);

  await requestPurchase({
    request: {
      apple: { sku: productId },
      google: {
        skus: [productId],
        subscriptionOffers: offerToken
          ? [{ sku: productId, offerToken }]
          : undefined,
      },
    },
    type: "subs",
  });
}

export async function openStoreSubscriptionManagement({
  deepLinkToSubscriptions,
  offerId,
}: {
  deepLinkToSubscriptions: DeepLinkToSubscriptions;
  offerId?: SubscriptionOfferId;
}) {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;

  await deepLinkToSubscriptions({
    packageNameAndroid: STORE_PACKAGE_NAME_ANDROID,
    skuAndroid: offerId ? SUBSCRIPTION_PRODUCT_IDS[offerId] : PREMIUM_PRODUCT_IDS[0],
  });
}

function getAndroidOfferToken(subscription?: ProductSubscription) {
  if (!subscription || subscription.platform !== "android") return undefined;
  return subscription.subscriptionOffers?.[0]?.offerTokenAndroid ?? undefined;
}
