import type { CustomerInfo, PurchasesPackage } from "react-native-purchases";
import { PREMIUM_ENTITLEMENT_ID, SUBSCRIPTION_PRODUCT_IDS, type SubscriptionOfferId } from "./config.ts";
import { getPremiumSubscription, hasActivePremiumEntitlement, subscriptionManagementURL } from "./revenueCatLogic.ts";

export function subscriptionDetails(
  info: CustomerInfo | null,
  packages: Partial<Record<SubscriptionOfferId, PurchasesPackage>>,
  now = Date.now(),
) {
  const entitlement = info?.entitlements.all?.[PREMIUM_ENTITLEMENT_ID] ??
    info?.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  const subscription = getPremiumSubscription(info);
  const hasAccess = !!info && hasActivePremiumEntitlement(info, now);
  const date = (value: string | null | undefined) => {
    const parsed = value ? Date.parse(value) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  };
  const expiresAt = typeof entitlement?.expirationDateMillis === "number" && Number.isFinite(entitlement.expirationDateMillis)
    ? entitlement.expirationDateMillis : date(entitlement?.expirationDate) ?? date(subscription?.expiresDate);
  const graceExpiresAt = date(subscription?.gracePeriodExpiresDate);
  const autoResumeAt = date(subscription?.autoResumeDate);
  const billingIssue = !!(entitlement?.billingIssueDetectedAt || subscription?.billingIssuesDetectedAt);
  const isTestStore = entitlement?.store === "TEST_STORE";
  const cancelled = entitlement?.willRenew === false && date(entitlement.unsubscribeDetectedAt) !== null;
  const state = !info ? "unavailable" : !entitlement ? "free"
    : !hasAccess && autoResumeAt && autoResumeAt > now ? "paused"
    : hasAccess && graceExpiresAt && graceExpiresAt > now ? "grace"
    : billingIssue ? "billingIssue"
    : hasAccess && cancelled ? "cancelled"
    : hasAccess && entitlement.periodType === "TRIAL" ? "trial"
    : hasAccess ? "active"
    : entitlement.isActive ? "verifying" : "expired";
  const matchingPackages = Object.values(packages).filter(({ product }) => {
    const [productId, planId] = product.identifier.split(":");
    return productId === entitlement?.productIdentifier.split(":")[0] &&
      (!entitlement.productPlanIdentifier || planId === entitlement.productPlanIdentifier ||
        product.defaultOption?.id === entitlement.productPlanIdentifier);
  });
  const matchingPackage = matchingPackages.length === 1 ? matchingPackages[0] : undefined;
  const period = matchingPackage?.product.subscriptionPeriod;
  const knownPlans = (Object.entries(SUBSCRIPTION_PRODUCT_IDS) as [SubscriptionOfferId, string][]).filter(([, id]) => {
    const [product, basePlan] = id.split(":");
    return product === entitlement?.productIdentifier.split(":")[0] &&
      (!basePlan || basePlan === entitlement.productPlanIdentifier);
  });
  const plan = period === "P1M" ? "monthly" as const : period === "P1Y" ? "yearly" as const
    : knownPlans.length === 1 ? knownPlans[0][0] : null;
  const canManage = !!info && !!subscriptionManagementURL(info);
  return {
    state, hasAccess, isTestStore, plan, store: entitlement?.store,
    // A current catalogue price, never represented as the historical amount
    // charged to a grandfathered subscriber or the price of an introductory offer.
    currentPrice: plan ? matchingPackage?.product.priceString : undefined,
    expiresAt, graceExpiresAt, autoResumeAt,
    willRenew: entitlement?.willRenew,
    renewalAt: hasAccess && entitlement?.willRenew && !billingIssue ? expiresAt : null,
    canManage,
    canCancel: hasAccess && entitlement?.willRenew === true && canManage,
    hasHistory: !!entitlement,
  } as const;
}
