import {
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Redirect, Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { StoreProvider } from "../_store";
import { AppTextProvider } from "../components/app-text";
import { useImmersionActiveTime } from "../hooks/useImmersionActiveTime";
import { DailyStreakProvider } from "../lib/DailyStreakProvider";
import { PaywallProvider } from "../lib/paywall/PaywallProvider";
import { SubscriptionAccessGuard } from "../lib/paywall/SubscriptionAccessGuard";

void SplashScreen.preventAutoHideAsync().catch(() => {});

const ONBOARDING_KEY = "kapp_onboarding_completed";

const forceFontFallback = process.env.EXPO_PUBLIC_FORCE_FONT_FALLBACK === "1";

const enableHiddenRoutesQa =
  __DEV__ && process.env.EXPO_PUBLIC_ENABLE_HIDDEN_ROUTES_QA === "1";

const RELEASE_HIDDEN_PATHS = new Set([
  "/profile",
  "/review",
  "/assimilation",
  "/listen/CafeListen",
  "/listen/MetroListen",
  "/listen/RestaurantListen",
  "/listen/index-quiz",
  "/lesson/health",
  "/lesson/help",
  "/lesson/hotel",
  "/lesson/late",
  "/lesson/taxi",
  "/voc/emotion",
  "/voc/famille",
  "/voc/health",
  "/voc/lieux",
  "/voc/meteo",
  "/voc/objets",
  "/voc/voyage",
]);

const RELEASE_HIDDEN_PREFIXES = ["/classificateur", "/immersion"] as const;

function ReleaseRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (enableHiddenRoutesQa) {
    return children;
  }

  const isHidden =
    RELEASE_HIDDEN_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) || RELEASE_HIDDEN_PATHS.has(pathname);

  if (isHidden) {
    return <Redirect href="/" />;
  }

  return children;
}

function InitialOnboardingRoute() {
  const pathname = usePathname();
  const hasCheckedInitialRoute = React.useRef(false);

  React.useEffect(() => {
    if (hasCheckedInitialRoute.current) {
      return;
    }

    let active = true;

    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (!active) {
          return;
        }

        hasCheckedInitialRoute.current = true;

        if (completed !== "true" && pathname !== "/onboarding") {
          router.replace("/onboarding");
        }
      } catch (error) {
        hasCheckedInitialRoute.current = true;

        console.warn("Unable to read the onboarding state.", error);

        if (active && pathname !== "/onboarding") {
          router.replace("/onboarding");
        }
      }
    };

    void checkOnboarding();

    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}

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

  const customFontsAvailable = fontsLoaded && !fontError && !forceFontFallback;

  const appReady = fontsLoaded || Boolean(fontError) || forceFontFallback;

  React.useEffect(() => {
    if (!fontError && !forceFontFallback) {
      return;
    }

    console.warn(
      forceFontFallback
        ? "App font fallback forced for visual validation."
        : "App fonts could not be loaded; falling back to system fonts.",
      fontError ?? "EXPO_PUBLIC_FORCE_FONT_FALLBACK=1",
    );
  }, [fontError]);

  React.useEffect(() => {
    if (!appReady) {
      return;
    }

    void SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <AppTextProvider customFontsAvailable={customFontsAvailable}>
      <StoreProvider>
        <DailyStreakProvider>
          <PaywallProvider>
            <SubscriptionAccessGuard />

            <ReleaseRouteGuard>
              <InitialOnboardingRoute />

              <Stack
                initialRouteName="onboarding"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="premium" />
                <Stack.Screen name="streak" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="listen/teacherIA" />
                <Stack.Screen name="listen/teacherIARealtime" />
              </Stack>
            </ReleaseRouteGuard>
          </PaywallProvider>
        </DailyStreakProvider>
      </StoreProvider>
    </AppTextProvider>
  );
}
