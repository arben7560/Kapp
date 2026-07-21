import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/app-text";
import { ActionButton } from "../components/ui/action-button";
import {
  PAYWALL_COPY,
  PREMIUM_SUBSCRIPTION_OFFERS,
} from "../lib/paywall/config";
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

const FEATURES = [
  "Tous les parcours disponibles débloqués",
  "Exercices et programmes Premium inclus",
  "Toutes les missions Premium disponibles",
  "Achats restaurables via ton compte App Store ou Google Play",
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer Premium"
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <AppText variant="sectionLabel" style={styles.headerTitle}>Premium</AppText>
          <View style={styles.iconButtonGhost} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
          <View
            style={[
              styles.heroCard,
              responsive.isCompact && styles.heroCardCompact,
            ]}
          >
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={15} color={COLORS.gold} />
              <AppText variant="label" style={styles.badgeText}>ACCÈS TOTAL</AppText>
            </View>

            <AppText accessibilityRole="header" variant="screenTitle" style={styles.title}>{PAYWALL_COPY.title}</AppText>
            <AppText variant="subtitle" tone="muted" style={styles.subtitle}>{PAYWALL_COPY.subtitle}</AppText>

            <View style={styles.offers}>
              {PREMIUM_SUBSCRIPTION_OFFERS.map((offer) => (
                <Pressable
                  key={offer.id}
                  disabled={busy || hasPremiumAccess}
                  onPress={() => setSelectedOfferId(offer.id)}
                  style={({ pressed }) => [
                    styles.priceBox,
                    responsive.isCompact && styles.priceBoxCompact,
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
                          <AppText variant="cardTitle" style={styles.offerTitle}>{offer.title}</AppText>
                          {offer.id === highlightedOfferId && (
                            <View style={styles.savingBadge}>
                              <AppText variant="caption" style={styles.savingBadgeText}>
                                Économisez 17 %
                              </AppText>
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

                      <AppText
                        variant={
                          responsive.isCompact
                            ? "priceCompact"
                            : responsive.screenClass === "phone"
                              ? "priceValue"
                              : "numericValue"
                        }
                        style={styles.price}
                      >
                        {displayPrices[offer.id]}
                      </AppText>
                      <AppText variant="bodySecondary" tone="muted" style={styles.priceCaption}>{offer.caption}</AppText>
                    </>
                  )}
                </Pressable>
              ))}
            </View>

            {hasPremiumAccess && (
              <View style={styles.activeBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.cyan}
                />
                <AppText variant="bodyStrong" style={styles.activeText}>
                  L’accès Premium est actif.
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.featuresCard}>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark" size={18} color={COLORS.cyan} />
                <AppText variant="body" style={styles.featureText}>{feature}</AppText>
              </View>
            ))}
          </View>

          {!!error && (
            <View style={styles.errorCard}>
              <AppText variant="bodyStrong" style={styles.errorTitle}>Impossible de continuer</AppText>
              <AppText variant="bodySecondary" style={styles.errorText}>{error.message}</AppText>
            </View>
          )}

          <ActionButton
            label={hasPremiumAccess ? "Premium actif" : selectedOffer?.cta ?? PAYWALL_COPY.cta}
            size="large"
            accentColor={COLORS.pink}
            labelColor={COLORS.text}
            disabled={!canSubscribe}
            loading={isPurchasing}
            loadingIndicatorColor={COLORS.text}
            onPress={() => selectedOffer && subscribe(selectedOffer.id)}
            style={styles.primaryAction}
          />

          {!hasPremiumAccess && selectedOffer && (
            <AppText variant="caption" style={styles.selectedPlanText}>
              Offre sélectionnée : {selectedOffer.title}
            </AppText>
          )}

          <ActionButton
            label={PAYWALL_COPY.restore}
            variant="secondary"
            size="large"
            disabled={busy}
            loading={isRestoring}
            loadingIndicatorColor={COLORS.text}
            onPress={restorePurchases}
            style={styles.secondaryAction}
          />

          <ActionButton
            label={PAYWALL_COPY.manage}
            variant="ghost"
            onPress={openSubscriptionManagement}
            style={styles.manageAction}
          />

          <AppText variant="caption" tone="soft" style={styles.legalText}>
            {
              "Le paiement est traité par l’App Store ou Google Play. Le renouvellement et l’expiration de l’abonnement sont gérés par le compte associé."
            }
          </AppText>
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
  heroCardCompact: {
    padding: 18,
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
  },
  title: {
    color: COLORS.text,
    marginTop: 18,
  },
  subtitle: {
    color: COLORS.muted,
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
  priceBoxCompact: {
    padding: 14,
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
  },
  price: {
    color: COLORS.text,
    marginTop: 5,
  },
  priceCaption: {
    color: COLORS.faint,
    marginTop: 5,
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
  },
  errorText: {
    color: COLORS.muted,
    marginTop: 4,
  },
  primaryAction: {
    marginTop: 18,
    minHeight: 56,
  },
  selectedPlanText: {
    color: COLORS.muted,
    marginTop: 10,
    textAlign: "center",
  },
  secondaryAction: {
    marginTop: 12,
  },
  manageAction: {
    marginTop: 4,
  },
  planPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  legalText: {
    color: COLORS.faint,
    textAlign: "center",
    marginTop: 8,
  },
});
