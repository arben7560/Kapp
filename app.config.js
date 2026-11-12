// Test Store credentials are resolved here, never in client-side EXPO_PUBLIC
// expressions: Expo would inline those expressions even in a production bundle.
module.exports = ({ config }) => {
  // EAS_BUILD_PROFILE is supplied on the builder. The explicit profile env
  // also works during EAS CLI's local config resolution and local Metro.
  const profile = process.env.EAS_BUILD_PROFILE ?? process.env.KAPP_BUILD_PROFILE;
  const testStore = process.env.EXPO_PUBLIC_REVENUECAT_STORE === "test";

  if (["production", "closedTest", "preview"].includes(profile) &&
      (process.env.EXPO_PUBLIC_DEV_UNLOCK_ALL === "1" ||
       process.env.EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS === "1")) {
    throw new Error("Release profiles cannot enable Premium development bypasses.");
  }
  if (["production", "closedTest"].includes(profile) &&
      process.env.EXPO_PUBLIC_ENABLE_NATIVE_IAP !== "1") {
    throw new Error("Store builds require native IAP.");
  }

  if (testStore !== (profile === "iapTest")) {
    throw new Error("RevenueCat Test Store requires the iapTest profile and explicit test store selection.");
  }

  for (const name of ["EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY", "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY"]) {
    if (process.env[name]?.trim().startsWith("test_")) {
      throw new Error("A platform RevenueCat API key must not contain a Test Store key.");
    }
  }

  if (!testStore) return config;

  if (
    process.env.EXPO_PUBLIC_DEV_UNLOCK_ALL !== "0" ||
    process.env.EXPO_PUBLIC_INTERNAL_PREMIUM_ACCESS !== "0" ||
    process.env.EXPO_PUBLIC_ENABLE_NATIVE_IAP !== "1"
  ) {
    throw new Error("iapTest requires both Premium bypasses disabled and native IAP enabled.");
  }

  // EAS CLI need not have the local .env key when preparing the native build.
  // Metro resolves it when serving the development client. Missing keys fail
  // closed in configureRevenueCat; they never fall back to Google Play.
  const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY?.trim();
  if (testKey && !testKey.startsWith("test_")) {
    throw new Error("EXPO_PUBLIC_REVENUECAT_TEST_KEY must be a Test Store public SDK key.");
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      revenueCatTestStore: { profile: "iapTest", apiKey: testKey },
    },
  };
};
