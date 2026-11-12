import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesStoreProduct,
} from "react-native-purchases";

import {
  PREMIUM_ENTITLEMENT_ID,
  IS_REVENUECAT_TEST_STORE,
  SUBSCRIPTION_PRODUCT_IDS,
  STORE_PACKAGE_NAME_ANDROID,
  type SubscriptionOfferId,
} from "./config.ts";
import type { PaywallError, PremiumEntitlement } from "./types.ts";

const REVENUECAT_ERROR_CODES = {
  configuration: "23",
  invalidCredentials: "11",
  network: "10",
  offline: "35",
  operationInProgress: "15",
  paymentPending: "20",
  productUnavailable: "5",
  purchaseCancelled: "1",
  purchaseNotAllowed: "3",
  storeProblem: "2",
} as const;

function getErrorProperty(
  error: unknown,
  property: "code" | "message" | "userCancelled",
): unknown {
  if (typeof error !== "object" || error === null || !(property in error)) {
    return undefined;
  }

  return error[property as keyof typeof error];
}

export function toRevenueCatError(error: unknown): PaywallError {
  const rawCode = getErrorProperty(error, "code");
  const code = typeof rawCode === "number" ? String(rawCode) : rawCode;
  const userCancelled = getErrorProperty(error, "userCancelled") === true;

  if (userCancelled || code === REVENUECAT_ERROR_CODES.purchaseCancelled) {
    return { code: "purchase-cancelled", message: "" };
  }

  switch (code) {
    case "7":
    case "13":
      return { code: "purchase-owned-by-another-account", message: "Cet achat est associé à un autre compte K-App. Connecte-toi au compte utilisé lors de l’achat." };
    case "authentication-required":
    case "identity-changed":
      return { code, message: "Connecte-toi à ton compte K-App pour continuer." };
    case "legacy-anonymous-purchases":
      return { code, message: "Un ancien achat invité a été détecté. Ferme puis rouvre K-App en restant connecté, puis utilise Restaurer mes achats. Si nécessaire, contacte l’assistance pour retrouver le compte d’origine." };
    case "account-policy-unverified":
      return { code, message: "Les achats et restaurations sont temporairement indisponibles. Ton abonnement existant reste associé à ton compte." };
    case REVENUECAT_ERROR_CODES.network:
    case REVENUECAT_ERROR_CODES.offline:
      return {
        code: "network-unavailable",
        message:
          "Connexion indisponible. Vérifie ta connexion puis réessaie.",
      };
    case REVENUECAT_ERROR_CODES.storeProblem:
      return {
        code: "store-unavailable",
        message:
          "L’App Store ou Google Play est momentanément indisponible.",
      };
    case REVENUECAT_ERROR_CODES.productUnavailable:
      return {
        code: "product-unavailable",
        message: "Cette formule n’est pas disponible sur le Store.",
      };
    case REVENUECAT_ERROR_CODES.purchaseNotAllowed:
      return {
        code: "purchase-not-allowed",
        message: "Les achats ne sont pas autorisés sur cet appareil.",
      };
    case REVENUECAT_ERROR_CODES.paymentPending:
      return {
        code: "payment-pending",
        message:
          "Le paiement est en attente de validation. Premium sera activé dès sa confirmation par le Store.",
      };
    case REVENUECAT_ERROR_CODES.operationInProgress:
      return {
        code: "operation-in-progress",
        message: "Une opération d’achat est déjà en cours.",
      };
    case REVENUECAT_ERROR_CODES.configuration:
    case REVENUECAT_ERROR_CODES.invalidCredentials:
      return {
        code: "revenuecat-configuration",
        message: "Le service d’abonnement n’est pas correctement configuré.",
      };
    default:
      return {
        code: typeof code === "string" ? code : "revenuecat-error",
        message:
          "Une erreur est survenue pendant la gestion de l’abonnement. Réessaie dans quelques instants.",
      };
  }
}

export function getPremiumEntitlementInfo(customerInfo: CustomerInfo) {
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] ?? null;
}

export function hasActivePremiumEntitlement(customerInfo: CustomerInfo, now = Date.now()) {
  const entitlement = getPremiumEntitlementInfo(customerInfo);
  if (entitlement?.isActive !== true) return false;
  if (IS_REVENUECAT_TEST_STORE
    ? entitlement.store !== "TEST_STORE"
    : entitlement.store === "TEST_STORE") return false;
  const deadline = getPremiumAccessDeadline(customerInfo);
  return deadline === null || deadline > now;
}

export function getPremiumSubscription(customerInfo: CustomerInfo | null) {
  const entitlement = customerInfo?.entitlements.all?.[PREMIUM_ENTITLEMENT_ID] ??
    customerInfo?.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  if (!entitlement || !customerInfo) return null;
  const subscriptions = Object.values(customerInfo.subscriptionsByProductIdentifier ?? {});
  return subscriptions.find((subscription) =>
    subscription.productIdentifier.split(":")[0] === entitlement.productIdentifier.split(":")[0] &&
    (!entitlement.productPlanIdentifier || subscription.productPlanIdentifier === entitlement.productPlanIdentifier),
  ) ?? null;
}

export function getPremiumAccessDeadline(customerInfo: CustomerInfo): number | null {
  const entitlement = getPremiumEntitlementInfo(customerInfo);
  if (!entitlement) return 0;
  const expiry = entitlement.expirationDateMillis;
  const graceDate = getPremiumSubscription(customerInfo)?.gracePeriodExpiresDate;
  const grace = graceDate ? Date.parse(graceDate) : 0;
  if (expiry === null) return null;
  return Math.max(Number.isFinite(expiry) ? expiry : 0, Number.isFinite(grace) ? grace : 0);
}

export function deriveRevenueCatEntitlement(
  customerInfo: CustomerInfo | null,
  now = Date.now(),
): PremiumEntitlement {
  if (!customerInfo) {
    return { hasAccess: false, source: "none" };
  }

  const entitlementInfo = getPremiumEntitlementInfo(customerInfo);

  if (!entitlementInfo || !hasActivePremiumEntitlement(customerInfo, now)) {
    return { hasAccess: false, source: "none" };
  }

  return {
    hasAccess: true,
    source: "store",
    productId: entitlementInfo.productIdentifier,
    expiresAt: getPremiumAccessDeadline(customerInfo),
    willAutoRenew: entitlementInfo.willRenew,
  };
}

export function selectSubscriptionOffering(offerings: PurchasesOfferings) {
  return IS_REVENUECAT_TEST_STORE
    ? offerings.all.default ?? null
    : offerings.current;
}

export function mapSubscriptionPackages(
  currentOffering: PurchasesOffering | null,
): Partial<Record<SubscriptionOfferId, PurchasesPackage>> {
  if (!currentOffering || !Array.isArray(currentOffering.availablePackages)) {
    return {};
  }

  const findPackage = (
    offerId: SubscriptionOfferId,
  ) => {
    const expectedProductId = SUBSCRIPTION_PRODUCT_IDS[offerId];

    const matches = (storePackage: PurchasesPackage) => {
      const product = storePackage?.product;
      if (!product) return false;
      const idMatches = product.identifier === expectedProductId ||
        (!expectedProductId.includes(":") && product.identifier.startsWith(`${expectedProductId}:`));
      return idMatches && (!product.subscriptionPeriod ||
        product.subscriptionPeriod === (offerId === "monthly" ? "P1M" : "P1Y"));
    };
    const candidates = currentOffering.availablePackages.filter(matches);
    // An ambiguous base plan must be configured using its full product:plan ID.
    return candidates.length === 1 ? candidates[0] : undefined;
  };

  const packages: Partial<Record<SubscriptionOfferId, PurchasesPackage>> = {};
  const monthly = findPackage("monthly");
  const yearly = findPackage("yearly");
  if (monthly) packages.monthly = monthly;
  if (yearly) packages.yearly = yearly;
  return packages;
}

export function subscriptionManagementURL(customerInfo: CustomerInfo): string | null {
  const entitlement = customerInfo.entitlements.all?.[PREMIUM_ENTITLEMENT_ID] ??
    getPremiumEntitlementInfo(customerInfo);
  if (!entitlement || entitlement.store === "TEST_STORE") return null;
  const subscription = getPremiumSubscription(customerInfo);
  if (entitlement.store === "PLAY_STORE") {
    // CustomerInfo.managementURL can point to the generic subscription list.
    // Target this entitlement explicitly, keeping the existing package/product.
    return `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(entitlement.productIdentifier.split(":")[0])}&package=${encodeURIComponent(STORE_PACKAGE_NAME_ANDROID)}`;
  }
  if (entitlement.store === "APP_STORE" || entitlement.store === "MAC_APP_STORE") {
    return customerInfo.managementURL || subscription?.managementURL || "https://apps.apple.com/account/subscriptions";
  }
  return null;
}

export type AnnualOfferMetrics = {
  monthlyEquivalentPrice: number;
  monthlyEquivalentPriceString: string;
  savingsPercent: number | null;
};

function formatStoreCurrency(value: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      currency: currencyCode,
      style: "currency",
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currencyCode}`;
  }
}

export function calculateAnnualOfferMetrics(
  monthlyProduct: Pick<
    PurchasesStoreProduct,
    "currencyCode" | "price"
  > | null,
  yearlyProduct: Pick<
    PurchasesStoreProduct,
    | "currencyCode"
    | "price"
    | "pricePerMonth"
    | "pricePerMonthString"
  > | null,
): AnnualOfferMetrics | null {
  if (
    !monthlyProduct ||
    !yearlyProduct ||
    monthlyProduct.currencyCode !== yearlyProduct.currencyCode ||
    monthlyProduct.price <= 0 ||
    yearlyProduct.price <= 0
  ) {
    return null;
  }

  const monthlyEquivalentPrice =
    yearlyProduct.pricePerMonth && yearlyProduct.pricePerMonth > 0
      ? yearlyProduct.pricePerMonth
      : yearlyProduct.price / 12;
  const rawSavingsPercent = Math.round(
    (1 - yearlyProduct.price / (monthlyProduct.price * 12)) * 100,
  );

  return {
    monthlyEquivalentPrice,
    monthlyEquivalentPriceString:
      yearlyProduct.pricePerMonthString ||
      formatStoreCurrency(
        monthlyEquivalentPrice,
        yearlyProduct.currencyCode,
      ),
    savingsPercent: rawSavingsPercent > 0 ? rawSavingsPercent : null,
  };
}

export type PaywallOperation = "purchase" | "restore";

export function createPaywallOperationGuard() {
  let activeOperation: PaywallOperation | null = null;

  return {
    begin(operation: PaywallOperation) {
      if (activeOperation !== null) return false;
      activeOperation = operation;
      return true;
    },
    end(operation: PaywallOperation) {
      if (activeOperation === operation) activeOperation = null;
    },
    isBusy() {
      return activeOperation !== null;
    },
  };
}
