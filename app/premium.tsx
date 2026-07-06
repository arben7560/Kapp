import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DEV_UNLOCK_ALL, PAYWALL_COPY } from "../lib/paywall/config";
import { usePaywall } from "../lib/paywall/PaywallProvider";

const COLORS = {
  bg: "#070812",
  card: "rgba(255,255,255,0.07)",
  line: "rgba(255,255,255,0.12)",
  text: "rgba(255,255,255,0.94)",
  muted: "rgba(255,255,255,0.66)",
  faint: "rgba(255,255,255,0.44)",
  pink: "#ff6384",
  gold: "#fbbf24",
  cyan: "#22d3ee",
};

const FEATURES = [
  "Tous les modules actuels débloqués",
  "Tous les exercices et programmes Premium",
  "Toutes les futures fonctionnalités Premium incluses",
  "Restaurable sur tes appareils via ton compte Store",
];

export default function PremiumScreen() {
  const {
    displayPrice,
    error,
    hasPremiumAccess,
    isDeveloperUnlocked,
    isLoading,
    isPurchasing,
    isRestoring,
    openSubscriptionManagement,
    restorePurchases,
    subscribeMonthly,
  } = usePaywall();

  const busy = isPurchasing || isRestoring;

  return (
    <LinearGradient colors={[COLORS.bg, "#0b0b1d", "#0b0f22"]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.iconButtonGhost} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={15} color={COLORS.gold} />
              <Text style={styles.badgeText}>ACCÈS TOTAL</Text>
            </View>

            <Text style={styles.title}>{PAYWALL_COPY.title}</Text>
            <Text style={styles.subtitle}>{PAYWALL_COPY.subtitle}</Text>

            <View style={styles.priceBox}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <>
                  <Text style={styles.price}>{displayPrice}</Text>
                  <Text style={styles.priceCaption}>
                    Abonnement mensuel, résiliable depuis le Store.
                  </Text>
                </>
              )}
            </View>

            {DEV_UNLOCK_ALL && (
              <View style={styles.devBox}>
                <Text style={styles.devText}>
                  Mode développeur actif : tout est débloqué sans achat.
                </Text>
              </View>
            )}

            {hasPremiumAccess && (
              <View style={styles.activeBox}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.cyan} />
                <Text style={styles.activeText}>
                  {isDeveloperUnlocked
                    ? "Accès complet activé en développement."
                    : "Ton abonnement Premium est actif."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.featuresCard}>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark" size={18} color={COLORS.cyan} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {!!error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Impossible de continuer</Text>
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}

          <Pressable
            disabled={busy || hasPremiumAccess}
            onPress={subscribeMonthly}
            style={({ pressed }) => [
              styles.primaryButton,
              (busy || hasPremiumAccess) && styles.buttonDisabled,
              pressed && !busy && !hasPremiumAccess && styles.buttonPressed,
            ]}
          >
            {isPurchasing ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {hasPremiumAccess ? "Premium actif" : PAYWALL_COPY.cta}
              </Text>
            )}
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={restorePurchases}
            style={({ pressed }) => [
              styles.secondaryButton,
              busy && styles.buttonDisabled,
              pressed && !busy && styles.buttonPressed,
            ]}
          >
            {isRestoring ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.secondaryButtonText}>{PAYWALL_COPY.restore}</Text>
            )}
          </Pressable>

          <Pressable onPress={openSubscriptionManagement} style={styles.textButton}>
            <Text style={styles.textButtonText}>{PAYWALL_COPY.manage}</Text>
          </Pressable>

          <Text style={styles.legalText}>
            Le paiement est traité par l’App Store ou Google Play. Le renouvellement
            et l’expiration de l’abonnement sont gérés par ton compte Store.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  iconButtonGhost: {
    width: 46,
    height: 46,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  content: {
    padding: 20,
    paddingBottom: 42,
  },
  heroCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,99,132,0.24)",
    backgroundColor: COLORS.card,
    padding: 22,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.35)",
    backgroundColor: "rgba(251,191,36,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 18,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  priceBox: {
    minHeight: 84,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(0,0,0,0.22)",
    marginTop: 20,
    padding: 16,
    justifyContent: "center",
  },
  price: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
  },
  priceCaption: {
    color: COLORS.faint,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  devBox: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.3)",
    backgroundColor: "rgba(34,211,238,0.1)",
    padding: 12,
  },
  devText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  activeBox: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  activeText: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "800",
  },
  featuresCard: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },
  errorCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,99,132,0.45)",
    backgroundColor: "rgba(255,99,132,0.12)",
    padding: 14,
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  errorText: {
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 18,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.pink,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  secondaryButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  textButtonText: {
    color: COLORS.muted,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  legalText: {
    color: COLORS.faint,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },
});
