import * as Linking from "expo-linking";
import { Platform } from "react-native";

const NATIVE_SCHEME = "kapp";

export type AuthRedirectAction =
  | "oauth-login-google"
  | "oauth-login-azure"
  | "oauth-login-line";

export function createAuthRedirectUrl(action?: AuthRedirectAction) {
  const url = Linking.createURL("/account", {
    ...(Platform.OS === "web" ? {} : { scheme: NATIVE_SCHEME }),
    queryParams: action ? { action } : {},
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
