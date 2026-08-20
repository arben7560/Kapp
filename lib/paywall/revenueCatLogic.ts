import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct,
} from "react-native-purchases";

import {
  PREMIUM_ENTITLEMENT_ID,
  SUBSCRIPTION_PRODUCT_IDS,
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

export function hasActivePremiumEntitlement(customerInfo: CustomerInfo) {
  return getPremiumEntitlementInfo(customerInfo)?.isActive === true;
}

export function deriveRevenueCatEntitlement(
  customerInfo: CustomerInfo | null,
): PremiumEntitlement {
  if (!customerInfo) {
    return { hasAccess: false, source: "none" };
  }

  const entitlementInfo = getPremiumEntitlementInfo(customerInfo);

  if (!entitlementInfo?.isActive) {
    return { hasAccess: false, source: "none" };
  }

  return {
    hasAccess: true,
    source: "store",
    productId: entitlementInfo.productIdentifier,
    expiresAt: entitlementInfo.expirationDateMillis,
    willAutoRenew: entitlementInfo.willRenew,
  };
}

export function mapSubscriptionPackages(
  currentOffering: PurchasesOffering | null,
): Partial<Record<SubscriptionOfferId, PurchasesPackage>> {
  if (!currentOffering || !Array.isArray(currentOffering.availablePackages)) {
    return {};
  }

  const findPackage = (
    offerId: SubscriptionOfferId,
    standardPackage: PurchasesPackage | null,
  ) => {
    const expectedProductId = SUBSCRIPTION_PRODUCT_IDS[offerId];

    if (standardPackage?.product.identifier === expectedProductId) {
      return standardPackage;
    }

    return currentOffering.availablePackages.find(
      (storePackage) =>
        storePackage?.product?.identifier === expectedProductId,
    );
  };

  return {
    monthly: findPackage("monthly", currentOffering.monthly),
    yearly: findPackage("yearly", currentOffering.annual),
  };
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
