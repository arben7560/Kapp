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
import {
  DarkTheme,
  Redirect,
  Stack,
  ThemeProvider,
  router,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { StoreProvider } from "../_store";
import { AppTextProvider } from "../components/app-text";
import { useMediaSessionLifecycle } from "../hooks/useMediaSessionLifecycle";
import { AuthProvider } from "../lib/AuthProvider";
import { DailyStreakProvider } from "../lib/DailyStreakProvider";
import { ProgressSyncProvider } from "../lib/ProgressSyncProvider";
import { PaywallProvider } from "../lib/paywall/PaywallProvider";
import { SubscriptionAccessGuard } from "../lib/paywall/SubscriptionAccessGuard";
import { ProgressSyncProvider } from "../lib/ProgressSyncProvider";

void SplashScreen.preventAutoHideAsync().catch(() => {});

const ONBOARDING_KEY = "kapp_onboarding_completed";

const KAPP_NAVIGATION_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#000000",
    card: "#000000",
  },
};

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

        if (
          completed !== "true" &&
          pathname !== "/" &&
          pathname !== "/onboarding"
        ) {
          router.replace("/onboarding");
        }
      } catch (error) {
        hasCheckedInitialRoute.current = true;

        console.warn("Unable to read the onboarding state.", error);
        if (active && pathname !== "/" && pathname !== "/onboarding") {
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

  useMediaSessionLifecycle();

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
    <ThemeProvider value={KAPP_NAVIGATION_THEME}>
      <AppTextProvider customFontsAvailable={customFontsAvailable}>
<<<<<<< HEAD
        <AuthProvider>
          <StoreProvider>
            <DailyStreakProvider>
              <ProgressSyncProvider>
=======
        <StoreProvider>
          <AuthProvider>
            <ProgressSyncProvider>
              <DailyStreakProvider>
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
                <PaywallProvider>
                  <SubscriptionAccessGuard>
                    <ReleaseRouteGuard>
                      <InitialOnboardingRoute />

                      <Stack
                        initialRouteName="index"
                        screenOptions={{
                          headerShown: false,
                          contentStyle: {
                            backgroundColor: "#000000",
                          },
                          animation: "fade",
                          animationDuration: 220,
                        }}
                      >
                        <Stack.Screen
                          name="index"
                          options={{ animation: "none" }}
                        />
<<<<<<< HEAD
                        <Stack.Screen
                          name="onboarding"
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen name="account" />
=======
                        <Stack.Screen name="onboarding" />
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
                        <Stack.Screen name="premium" />
                        <Stack.Screen name="streak" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen
                          name="listen/teacherIA"
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen name="listen/teacherIARealtime" />
                      </Stack>
                    </ReleaseRouteGuard>
                  </SubscriptionAccessGuard>
                </PaywallProvider>
<<<<<<< HEAD
              </ProgressSyncProvider>
            </DailyStreakProvider>
          </StoreProvider>
        </AuthProvider>
=======
              </DailyStreakProvider>
            </ProgressSyncProvider>
          </AuthProvider>
        </StoreProvider>
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
      </AppTextProvider>
    </ThemeProvider>
  );
}