import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";

let revenueCatConfigured = false;

const IS_DEVELOPMENT =
  typeof __DEV__ === "boolean"
    ? __DEV__
    : process.env.NODE_ENV !== "production";

function getPlatformApiKey(): string | undefined {
  const platformKey =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      : Platform.OS === "android"
        ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
        : undefined;

  return (
    platformKey?.trim() ||
    (IS_DEVELOPMENT
      ? process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY?.trim()
      : undefined)
  );
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

  if (!IS_DEVELOPMENT && apiKey.startsWith("test_")) {
    console.error(
      "[RevenueCat] Une clé Test Store ne peut pas être utilisée dans un build de release.",
    );
    return false;
  }

  const expectedPrefix = Platform.OS === "ios" ? "appl_" : "goog_";
  if (!apiKey.startsWith("test_") && !apiKey.startsWith(expectedPrefix)) {
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
