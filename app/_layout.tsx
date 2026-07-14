import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";
import {
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { Text, TextInput } from "react-native";
import { StoreProvider } from "../_store";
import { AppFontFamily } from "../constants/theme";
import { useImmersionActiveTime } from "../hooks/useImmersionActiveTime";
import { DailyStreakProvider } from "../lib/DailyStreakProvider";
import { PaywallProvider } from "../lib/paywall/PaywallProvider";
import { SubscriptionAccessGuard } from "../lib/paywall/SubscriptionAccessGuard";

void SplashScreen.preventAutoHideAsync().catch(() => {});

const DEFAULT_TEXT_STYLE = { fontFamily: AppFontFamily.outfit.regular };
const DEFAULT_FONT_PATCH_KEY = "__kAppDefaultOutfitFontPatched";

type TextLikeComponent = {
  defaultProps?: { style?: unknown };
  render?: (
    this: unknown,
    ...args: unknown[]
  ) => React.ReactElement<{ style?: unknown }>;
};

function installDefaultOutfitFont() {
  const globalRef = globalThis as typeof globalThis & {
    [DEFAULT_FONT_PATCH_KEY]?: boolean;
  };

  if (globalRef[DEFAULT_FONT_PATCH_KEY]) return;

  globalRef[DEFAULT_FONT_PATCH_KEY] = true;

  [Text, TextInput].forEach((Component) => {
    const component = Component as TextLikeComponent;
    const render = component.render;

    if (typeof render !== "function") {
      component.defaultProps = {
        ...component.defaultProps,
        style: [DEFAULT_TEXT_STYLE, component.defaultProps?.style],
      };
      return;
    }

    component.render = function renderWithDefaultOutfitFont(
      this: unknown,
      ...args: unknown[]
    ) {
      const origin = render.apply(this, args);

      return React.cloneElement(origin, {
        style: [DEFAULT_TEXT_STYLE, origin.props.style],
      });
    };
  });
}

installDefaultOutfitFont();

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
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_900Black,
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
  });

  useImmersionActiveTime();

  React.useEffect(() => {
    if (!fontError) return;

    console.warn("App fonts could not be loaded; falling back to system fonts.", fontError);
  }, [fontError]);

  React.useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    void SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <StoreProvider>
      <DailyStreakProvider>
        <PaywallProvider>
          <SubscriptionAccessGuard />
          {/* <ScreenCaptureProtection /> */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="premium" />
            <Stack.Screen name="streak" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="listen/teacherIA" />
            <Stack.Screen name="listen/teacherIARealtime" />
          </Stack>
        </PaywallProvider>
      </DailyStreakProvider>
    </StoreProvider>
  );
}
