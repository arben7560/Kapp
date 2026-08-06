import Purchases, { LOG_LEVEL } from "react-native-purchases";

let revenueCatConfigured = false;

export function configureRevenueCat(): void {
  if (revenueCatConfigured) {
    return;
  }

  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY;

  if (!apiKey) {
    console.warn("[RevenueCat] EXPO_PUBLIC_REVENUECAT_TEST_KEY est absente.");
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  }

  Purchases.configure({
    apiKey,
  });

  revenueCatConfigured = true;
}
