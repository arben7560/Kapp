export const DEV_UNLOCK_ALL = false;

export const ENABLE_NATIVE_IAP = false;

export const PREMIUM_ENTITLEMENT_ID = "premium_all_access";

export const SUBSCRIPTION_PRODUCT_IDS = {
  monthly: "kapp_premium_monthly",
} as const;

export const PREMIUM_PRODUCT_IDS = Object.values(SUBSCRIPTION_PRODUCT_IDS);

export const PREMIUM_MONTHLY_PRICE_FALLBACK = "8 € / mois";

export const STORE_PACKAGE_NAME_ANDROID = "com.arben60.kapp";

export const PAYWALL_COPY = {
  title: "K-app Premium",
  subtitle:
    "Débloque toute l'application et toutes les futures nouveautés Premium.",
  cta: "S'abonner",
  restore: "Restaurer mes achats",
  manage: "Gérer mon abonnement",
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
