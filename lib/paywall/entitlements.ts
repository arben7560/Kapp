import type { PremiumEntitlement } from "./types";

export function createDeveloperEntitlement(): PremiumEntitlement {
  return {
    hasAccess: true,
    source: "developer",
    productId: "developer-unlock",
    expiresAt: null,
    willAutoRenew: false,
  };
}
