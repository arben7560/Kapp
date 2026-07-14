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
import {
  DEV_UNLOCK_ALL,
  PAYWALL_COPY,
  PREMIUM_SUBSCRIPTION_OFFERS,
} from "../lib/paywall/config";
import { AppFontFamily } from "../constants/theme";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
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
const fonts = AppFontFamily.outfit;

const FEATURES = [
  "Tous les modules actuels debloques",
  "Tous les exercices et programmes Premium",
  "Toutes les futures fonctionnalites Premium incluses",
  "Restaurable sur tes appareils via ton compte Store",
];

const isAnnualOffer = (offer: (typeof PREMIUM_SUBSCRIPTION_OFFERS)[number]) => {
  const label = `${offer.id} ${offer.title}`.toLowerCase();
  return (
    label.includes("year") ||
    label.includes("annual") ||
    label.includes("annuel")
  );
};

export default function PremiumScreen() {
  const responsive = useResponsiveLayout({ maxWidth: 620 });
  const {
    displayPrices,
    error,
    hasPremiumAccess,
    isDeveloperUnlocked,
    isLoading,
    isPurchasing,
    isRestoring,
    openSubscriptionManagement,
    restorePurchases,
    subscribe,
  } = usePaywall();

  const busy = isPurchasing || isRestoring;
  const highlightedOfferId =
    PREMIUM_SUBSCRIPTION_OFFERS.find(isAnnualOffer)?.id ??
    PREMIUM_SUBSCRIPTION_OFFERS[1]?.id ??
    PREMIUM_SUBSCRIPTION_OFFERS[0]?.id;
  const [selectedOfferId, setSelectedOfferId] =
    React.useState(highlightedOfferId);
  const selectedOffer = React.useMemo(
    () =>
      PREMIUM_SUBSCRIPTION_OFFERS.find(
        (offer) => offer.id === selectedOfferId,
      ) ?? PREMIUM_SUBSCRIPTION_OFFERS[0],
    [selectedOfferId],
  );
  const canSubscribe = !!selectedOffer && !busy && !hasPremiumAccess;

  return (
    <LinearGradient
      colors={[COLORS.bg, "#0b0b1d", "#0b0f22"]}
      style={styles.screen}
    >
      <SafeAreaView style={styles.safe}>
        <View
          style={[
            styles.header,
            styles.contentFrame,
            {
              maxWidth: responsive.maxWidth,
              paddingHorizontal: responsive.horizontalPadding,
            },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.iconButtonGhost} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
          <View style={styles.heroCard}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={15} color={COLORS.gold} />
              <Text style={styles.badgeText}>ACCES TOTAL</Text>
            </View>

            <Text style={styles.title}>{PAYWALL_COPY.title}</Text>
            <Text style={styles.subtitle}>{PAYWALL_COPY.subtitle}</Text>

            <View style={styles.offers}>
              {PREMIUM_SUBSCRIPTION_OFFERS.map((offer) => (
                <Pressable
                  key={offer.id}
                  disabled={busy || hasPremiumAccess}
                  onPress={() => setSelectedOfferId(offer.id)}
                  style={({ pressed }) => [
                    styles.priceBox,
                    offer.id === highlightedOfferId && styles.priceBoxFeatured,
                    offer.id === selectedOfferId && styles.priceBoxSelected,
                    pressed && !busy && !hasPremiumAccess && styles.planPressed,
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.text} />
                  ) : (
                    <>
                      <View style={styles.offerHeader}>
                        <View style={styles.offerTitleWrap}>
                          <Text style={styles.offerTitle}>{offer.title}</Text>
                          {offer.id === highlightedOfferId && (
                            <View style={styles.savingBadge}>
                              <Text style={styles.savingBadgeText}>
                                Economisez 17%
                              </Text>
                            </View>
                          )}
                        </View>

                        <Ionicons
                          name={
                            offer.id === selectedOfferId
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={22}
                          color={
                            offer.id === selectedOfferId
                              ? COLORS.cyan
                              : COLORS.faint
                          }
                        />
                      </View>

                      <Text style={styles.price}>
                        {displayPrices[offer.id]}
                      </Text>
                      <Text style={styles.priceCaption}>{offer.caption}</Text>
                    </>
                  )}
                </Pressable>
              ))}
            </View>

            {DEV_UNLOCK_ALL && (
              <View style={styles.devBox}>
                <Text style={styles.devText}>
                  Mode developpeur actif : tout est debloque sans achat.
                </Text>
              </View>
            )}

            {hasPremiumAccess && (
              <View style={styles.activeBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.cyan}
                />
                <Text style={styles.activeText}>
                  {isDeveloperUnlocked
                    ? "Acces complet active en developpement."
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
            disabled={!canSubscribe}
            onPress={() => selectedOffer && subscribe(selectedOffer.id)}
            style={({ pressed }) => [
              styles.primaryButton,
              !canSubscribe && styles.buttonDisabled,
              pressed && canSubscribe && styles.buttonPressed,
            ]}
          >
            {isPurchasing ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {hasPremiumAccess ? "Premium actif" : "Continuer"}
              </Text>
            )}
          </Pressable>

          {!hasPremiumAccess && selectedOffer && (
            <Text style={styles.selectedPlanText}>
              Offre selectionnee : {selectedOffer.title}
            </Text>
          )}

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
              <Text style={styles.secondaryButtonText}>
                {PAYWALL_COPY.restore}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={openSubscriptionManagement}
            style={styles.textButton}
          >
            <Text style={styles.textButtonText}>{PAYWALL_COPY.manage}</Text>
          </Pressable>

          <Text style={styles.legalText}>
            {
              "Le paiement est traite par l'App Store ou Google Play. Le renouvellement et l'expiration de l'abonnement sont geres par ton compte Store."
            }
          </Text>
          </View>
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
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },
  header: {
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
    fontFamily: fonts.black,
  },
  content: {
    paddingTop: 20,
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
    fontFamily: fonts.bold,
    letterSpacing: 1.8,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.black,
    marginTop: 18,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    marginTop: 10,
  },
  offers: {
    gap: 12,
    marginTop: 20,
  },
  priceBox: {
    minHeight: 94,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 16,
    justifyContent: "center",
  },
  priceBoxFeatured: {
    borderColor: "rgba(251,191,36,0.42)",
    backgroundColor: "rgba(251,191,36,0.08)",
  },
  priceBoxSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: "rgba(34,211,238,0.1)",
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  offerTitleWrap: {
    flex: 1,
    gap: 8,
  },
  offerTitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
  },
  savingBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(251,191,36,0.18)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.42)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  savingBadgeText: {
    color: COLORS.gold,
    fontSize: 11,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
  },
  price: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: fonts.black,
    marginTop: 5,
  },
  priceCaption: {
    color: COLORS.faint,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.medium,
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.bold,
  },
  errorText: {
    color: COLORS.muted,
    lineHeight: 19,
    fontFamily: fonts.medium,
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
  primaryButtonSecondary: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,99,132,0.28)",
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  selectedPlanText: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: fonts.bold,
    marginTop: 10,
    textAlign: "center",
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
    fontFamily: fonts.bold,
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  textButtonText: {
    color: COLORS.muted,
    fontFamily: fonts.bold,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  planPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  legalText: {
    color: COLORS.faint,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.medium,
    textAlign: "center",
    marginTop: 8,
  },
});
