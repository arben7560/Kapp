import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../components/app-text";

const BG_DEEP = "#050508";
const ONBOARDING_KEY = "kapp_onboarding_completed";

export default function IndexGate() {
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (!mounted) return;

        if (done === "true") {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.warn("IndexGate error:", error);
        if (!mounted) return;
        router.replace("/onboarding");
      }
    };

    boot();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="small" color="rgba(255,255,255,0.72)" />
      <AppText variant="sectionTitle" tone="strong">
        K-App
      </AppText>
      <AppText variant="bodySecondary" tone="muted" align="center">
        Chargement de Séoul…
      </AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DEEP,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});
