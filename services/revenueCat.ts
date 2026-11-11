import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { IS_REVENUECAT_TEST_STORE } from "../lib/paywall/config";

let revenueCatConfigured = false;

const IS_DEVELOPMENT =
  typeof __DEV__ === "boolean"
    ? __DEV__
    : process.env.NODE_ENV !== "production";

function getPlatformApiKey(): string | undefined {
  if (IS_REVENUECAT_TEST_STORE) {
    const testConfig = Constants.expoConfig?.extra?.revenueCatTestStore;
    return IS_DEVELOPMENT && testConfig?.profile === "iapTest" &&
      typeof testConfig.apiKey === "string"
      ? testConfig.apiKey.trim()
      : undefined;
  }

  const platformKey =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      : Platform.OS === "android"
        ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
        : undefined;

  return platformKey?.trim();
}

export function configureRevenueCat(): boolean {
  if (revenueCatConfigured) {
    return true;
  }

  const apiKey = getPlatformApiKey();

  if (!apiKey) {
    console.warn(
      `[RevenueCat] Clé publique ${Platform.OS} absente pour cet environnement.`,
    );
    return false;
  }

  if (!IS_REVENUECAT_TEST_STORE && apiKey.startsWith("test_")) {
    console.error(
      "[RevenueCat] Une clé Test Store ne peut pas être utilisée dans un build de release.",
    );
    return false;
  }

  const expectedPrefix = IS_REVENUECAT_TEST_STORE
    ? "test_"
    : Platform.OS === "ios" ? "appl_" : "goog_";
  if (!apiKey.startsWith(expectedPrefix)) {
    console.error(
      `[RevenueCat] La clé publique ne correspond pas à la plateforme ${Platform.OS}.`,
    );
    return false;
  }

  Purchases.setLogLevel(IS_DEVELOPMENT ? LOG_LEVEL.WARN : LOG_LEVEL.ERROR);

  Purchases.configure({
    apiKey,
  });

  revenueCatConfigured = true;
  return true;
}
