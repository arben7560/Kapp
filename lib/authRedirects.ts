import * as Linking from "expo-linking";
import { Platform } from "react-native";

const NATIVE_SCHEME = "kapp";

export type AuthRedirectAction =
  | "protect"
  | "recovery"
  | "oauth-link-google"
  | "oauth-link-apple"
  | "oauth-login-google"
  | "oauth-login-apple";

export function createAuthRedirectUrl(action: AuthRedirectAction) {
  const url = Linking.createURL("/account", {
    ...(Platform.OS === "web" ? {} : { scheme: NATIVE_SCHEME }),
    queryParams: { action },
  });

  if (Platform.OS !== "web") {
    const parsed = new URL(url);
    if (parsed.protocol !== `${NATIVE_SCHEME}:`) {
      throw new Error("K-App native authentication deep link is misconfigured.");
    }
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      throw new Error("K-App native authentication cannot redirect to localhost.");
    }
  }

  return url;
}
