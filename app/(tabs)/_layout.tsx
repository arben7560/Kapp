import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack } from "expo-router";
import React from "react";

const ONBOARDING_KEY = "kapp_onboarding_completed";

export default function Layout() {
  const [onboardingCompleted, setOnboardingCompleted] = React.useState<
    boolean | null
  >(null);

  React.useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        if (mounted) {
          setOnboardingCompleted(value === "true");
        }
      })
      .catch((error) => {
        console.warn("Tabs onboarding guard error:", error);
        if (mounted) {
          setOnboardingCompleted(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (onboardingCompleted === null) {
    return null;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#040509" },
      }}
    />
  );
}
