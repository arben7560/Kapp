export const DEV_UNLOCK_ALL = false;

export const ENABLE_NATIVE_IAP = false;

export const PREMIUM_ENTITLEMENT_ID = "premium_all_access";

export type SubscriptionOfferId = "monthly" | "yearly";

export type PremiumSubscriptionOffer = {
  id: SubscriptionOfferId;
  productId: string;
  title: string;
  cta: string;
  fallbackPrice: string;
  caption: string;
};

export const PREMIUM_SUBSCRIPTION_OFFERS = [
  {
    id: "monthly",
    productId: "kapp_premium_monthly",
    title: "Premium Mensuel",
    cta: "S'abonner au mensuel",
    fallbackPrice: "5,99 EUR / mois",
    caption: "Abonnement mensuel, resiliable depuis le Store.",
  },
  {
    id: "yearly",
    productId: "kapp_premium_yearly",
    title: "Premium Annuel",
    cta: "S'abonner a l'annuel",
    fallbackPrice: "59,99 EUR / an",
    caption: "Environ 5 EUR / mois. Abonnement annuel, resiliable depuis le Store.",
  },
] as const satisfies readonly PremiumSubscriptionOffer[];

export const SUBSCRIPTION_PRODUCT_IDS = PREMIUM_SUBSCRIPTION_OFFERS.reduce(
  (productIds, offer) => ({
    ...productIds,
    [offer.id]: offer.productId,
  }),
  {} as Record<SubscriptionOfferId, string>
);

export const PREMIUM_PRODUCT_IDS = PREMIUM_SUBSCRIPTION_OFFERS.map(
  (offer) => offer.productId
);

export const PREMIUM_PRICE_FALLBACKS = PREMIUM_SUBSCRIPTION_OFFERS.reduce(
  (fallbacks, offer) => ({
    ...fallbacks,
    [offer.id]: offer.fallbackPrice,
  }),
  {} as Record<SubscriptionOfferId, string>
);

export const STORE_PACKAGE_NAME_ANDROID = "com.arben60.kapp";

export const PAYWALL_COPY = {
  title: "K-app Premium",
  subtitle:
    "Debloque toute l'application et toutes les futures nouveautes Premium.",
  cta: "S'abonner",
  restore: "Restaurer mes achats",
  manage: "Gerer mon abonnement",
};

export const PREMIUM_ROUTE_PATHS = new Set([
  "/voc/kdrama",
  "/voc/romance",
  "/voc/nuit",
  "/voc/sante",
  "/voc/work",
  "/hangul/vowels-compound",
  "/hangul/consonants-tense",
  "/hangul/batchim",
  "/(tabs)/hangul/vowels-compound",
  "/(tabs)/hangul/consonants-tense",
  "/(tabs)/hangul/batchim",
  "/comptage/heures",
  "/comptage/prix",
  "/comptage/phone",
  "/comptage/dates",
  "/comptage/age",
  "/comptage/ordinals",
  "/classificateur/animals",
  "/classificateur/paper",
  "/classificateur/drinks",
  "/classificateur/machines",
]);
