import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../components/app-text";
import { ActionButton } from "../../components/ui/action-button";
import { SeoulMidnightGlass } from "../../constants/theme";
import { useAuth } from "../../lib/AuthProvider";

export default function AccountCallbackScreen() {
  const { error, isHandlingDeepLink, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading || isHandlingDeepLink || error) return;
    const timer = setTimeout(() => router.replace("/account" as Href), 250);
    return () => clearTimeout(timer);
  }, [error, isHandlingDeepLink, isLoading]);

  return (
    <LinearGradient
      colors={["#020306", "#080B14", "#050711"]}
      style={styles.screen}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.card}>
          {error ? (
            <Ionicons name="alert-circle-outline" size={34} color="#FB7185" />
          ) : (
            <ActivityIndicator color={SeoulMidnightGlass.colors.cyan} />
          )}
          <AppText variant="sectionTitle" align="center" style={styles.title}>
            {error ? "Lien non validé" : "Validation en cours"}
          </AppText>
          <AppText variant="bodySecondary" align="center" tone="muted">
            {error ?? "K-App sécurise votre session puis ouvre Mon profil."}
          </AppText>
          {error ? (
            <ActionButton
              label="Retour à Mon profil"
              variant="secondary"
              onPress={() => router.replace("/account" as Href)}
              style={styles.action}
            />
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    gap: 12,
    padding: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: SeoulMidnightGlass.colors.line,
    backgroundColor: "rgba(255,255,255,0.055)",
  },
  title: { marginTop: 4 },
  action: { marginTop: 8 },
});
