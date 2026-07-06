import { Stack } from "expo-router";
import React from "react";
import { StoreProvider } from "../_store";
import { useImmersionActiveTime } from "../hooks/useImmersionActiveTime";
import { PaywallProvider } from "../lib/paywall/PaywallProvider";
import { SubscriptionAccessGuard } from "../lib/paywall/SubscriptionAccessGuard";

/*const SCREEN_CAPTURE_PROTECTION_KEY = "k-app-global-protection";

function ScreenCaptureProtection() {
  React.useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    void ScreenCapture.preventScreenCaptureAsync(
      SCREEN_CAPTURE_PROTECTION_KEY
    ).catch((error) => {
      console.warn("Screen capture protection could not be enabled.", error);
    });

    if (Platform.OS === "ios") {
      void ScreenCapture.enableAppSwitcherProtectionAsync().catch((error) => {
        console.warn("App switcher protection could not be enabled.", error);
      });
    }

    return () => {
      void ScreenCapture.allowScreenCaptureAsync(
        SCREEN_CAPTURE_PROTECTION_KEY
      ).catch((error) => {
        console.warn("Screen capture protection could not be disabled.", error);
      });

      if (Platform.OS === "ios") {
        void ScreenCapture.disableAppSwitcherProtectionAsync().catch(
          (error) => {
            console.warn(
              "App switcher protection could not be disabled.",
              error
            );
          }
        );
      }
    };
  }, []);

  return null;
}*/

export default function RootLayout() {
  useImmersionActiveTime();

  return (
    <StoreProvider>
      <PaywallProvider>
        <SubscriptionAccessGuard />
        {/* <ScreenCaptureProtection /> */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="premium" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listen/teacherIA" />
          <Stack.Screen name="listen/teacherIARealtime" />
        </Stack>
      </PaywallProvider>
    </StoreProvider>
  );
}
