import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { IS_REVENUECAT_TEST_STORE } from "../lib/paywall/config";

let revenueCatConfigured = false;

const IS_DEVELOPMENT =
  typeof __DEV__ === "boolean"
    ? __DEV__
    : process.env.NODE_ENV !== "production";

export function configureRevenueCat(appUserID?: string): boolean {
  if (revenueCatConfigured) {
    return true;
  }

  const testConfig = Constants.expoConfig?.extra?.revenueCatTestStore;
  const testKey = typeof testConfig?.apiKey === "string"
    ? testConfig.apiKey.trim()
    : undefined;
  const platformKey = Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    : Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
      : undefined;
  const apiKey = IS_REVENUECAT_TEST_STORE ? testKey : platformKey?.trim();

  // Only whitelisted flags/reason codes. Never log a key, a manifest, an env
  // object or a native SDK exception (which may contain credentials).
  const diagnostic = (reason: string) => {
    if (!IS_DEVELOPMENT) return;
    console.info(`[RevenueCat] ${JSON.stringify({
      platform: Platform.OS,
      development: IS_DEVELOPMENT,
      store: IS_REVENUECAT_TEST_STORE ? "test" : "platform",
      manifestProfile: testConfig?.profile === "iapTest" ? "iapTest" : "other-or-missing",
      manifestTestKeyPresent: !!testKey,
      selectedKeyPresent: !!apiKey,
      reason,
    })}`);
  };

  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    diagnostic("unsupported-platform");
    return false;
  }
  if (IS_REVENUECAT_TEST_STORE && !IS_DEVELOPMENT) return false;
  if (IS_REVENUECAT_TEST_STORE && testConfig?.profile !== "iapTest") {
    diagnostic("test-manifest-missing-restart-iapTest-metro");
    return false;
  }
  if (!IS_REVENUECAT_TEST_STORE && testConfig?.profile === "iapTest") {
    diagnostic("bundle-manifest-mismatch-restart-iapTest-metro");
    return false;
  }

  if (!apiKey) {
    diagnostic(IS_REVENUECAT_TEST_STORE
      ? "test-key-missing-in-manifest"
      : "platform-key-missing-use-iapTest-launcher-for-test-store");
    console.warn(
      `[RevenueCat] Clé publique ${Platform.OS} absente pour cet environnement.`,
    );
    return false;
  }

  if (!IS_REVENUECAT_TEST_STORE && apiKey.startsWith("test_")) {
    diagnostic("test-key-rejected-in-platform-mode");
    console.error(
      "[RevenueCat] Une clé Test Store ne peut pas être utilisée dans un build de release.",
    );
    return false;
  }

  const expectedPrefix = IS_REVENUECAT_TEST_STORE
    ? "test_"
    : Platform.OS === "ios" ? "appl_" : "goog_";
  if (!apiKey.startsWith(expectedPrefix)) {
    diagnostic("key-prefix-mismatch");
    console.error(
      `[RevenueCat] La clé publique ne correspond pas à la plateforme ${Platform.OS}.`,
    );
    return false;
  }

  try {
    Purchases.setLogLevel(IS_DEVELOPMENT ? LOG_LEVEL.WARN : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey, ...(appUserID ? { appUserID } : {}) });
  } catch (error) {
    diagnostic("sdk-configure-threw");
    throw error;
  }

  revenueCatConfigured = true;
  diagnostic("configured");
  return true;
}
