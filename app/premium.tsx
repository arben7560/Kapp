import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, type Href } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/app-text";
import { AppBackButton } from "../components/ui/app-back-button";
import { AppDialog, DialogActions } from "../components/ui/app-dialog";
import { PremiumActionButton as ActionButton } from "../components/premium/PremiumActionButton";
import { useTranslation } from "react-i18next";
import { PremiumLocalizationProvider } from "../lib/i18n/PremiumLocalizationProvider";
import { useVocabularyText } from "../lib/i18n/VocabularyTextContext";
import { resolvePremiumError } from "../lib/i18n/premiumText";
import { DEFAULT_LOCALE, isAppLocale } from "../lib/i18n/config";
import {
  PAYWALL_COPY,
  PREMIUM_SUBSCRIPTION_OFFERS,
  PREMIUM_PRICE_FALLBACKS,
  IS_REVENUECAT_TEST_STORE,
} from "../lib/paywall/config";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { usePaywall } from "../lib/paywall/PaywallProvider";
import { calculateAnnualOfferMetrics } from "../lib/paywall/revenueCatLogic";
import { useAuth } from "../lib/AuthProvider";
import { clearPurchaseIntent, premiumDestination, savePurchaseIntent } from "../lib/paywall/purchaseIntent";

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

function PremiumScreenContent() {
  const auth = useAuth();
  const signInWithOAuth = auth.signInWithOAuth;
  const params = useLocalSearchParams<{ offerId?: string; returnTo?: string; action?: string }>();
  const returnTo = premiumDestination(params.returnTo);
  const [intentError, setIntentError] = React.useState<string | null>(null);
  const [isPreparingAuth, setIsPreparingAuth] = React.useState(false);
  const [authenticationAction, setAuthenticationAction] = React.useState<"purchase" | "restore" | null>(null);
  const [confirmationUserId, setConfirmationUserId] = React.useState<string | null>(null);
  const authNavigationRef = React.useRef(false);
  const translate = useVocabularyText();
  const { t, i18n } = useTranslation("premium");
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(activeLanguage) ? activeLanguage : DEFAULT_LOCALE;
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
    subscriptions,
    refreshEntitlements,
  } = usePaywall();
  const isMountedRef = React.useRef(true);

  const busy = isPurchasing || isRestoring || isPreparingAuth;
  const highlightedOfferId =
    PREMIUM_SUBSCRIPTION_OFFERS.find(isAnnualOffer)?.id ??
    PREMIUM_SUBSCRIPTION_OFFERS[1]?.id ??
    PREMIUM_SUBSCRIPTION_OFFERS[0]?.id;
  const [selectedOfferId, setSelectedOfferId] =
    React.useState(params.offerId === "monthly" || params.offerId === "yearly" ? params.offerId : highlightedOfferId);
  const effectiveSelectedOfferId = selectedOfferId;
  const selectedOffer = React.useMemo(
    () =>
      PREMIUM_SUBSCRIPTION_OFFERS.find(
        (offer) => offer.id === effectiveSelectedOfferId,
      ) ?? PREMIUM_SUBSCRIPTION_OFFERS[0],
    [effectiveSelectedOfferId],
  );
  const displayedPrice = (offerId: (typeof PREMIUM_SUBSCRIPTION_OFFERS)[number]["id"]) => {
    const price = displayPrices[offerId];
    // Display-only localization for the development fallback. Prices returned
    // by App Store / Google Play remain exactly as provided by the store.
    return price === PREMIUM_PRICE_FALLBACKS[offerId] ? translate(price) : price;
  };
  const canSubscribe =
    !!selectedOffer &&
    !!subscriptions[selectedOffer.id] &&
    !isLoading && !auth.isLoading &&
    !busy &&
    !hasPremiumAccess;
  const annualMetrics = React.useMemo(() => {
    return calculateAnnualOfferMetrics(
      subscriptions.monthly?.product ?? null,
      subscriptions.yearly?.product ?? null,
    );
  }, [subscriptions]);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const closePaywall = React.useCallback(() => {
    if (returnTo) {
      router.replace(returnTo as Href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [returnTo]);

  const requestAuthentication = React.useCallback(async (action: "purchase" | "restore") => {
    if (authNavigationRef.current) return;
    authNavigationRef.current = true;
    setIsPreparingAuth(true);
    try {
      setIntentError(null);
      await savePurchaseIntent({ offerId: selectedOfferId, returnTo, action });
      setAuthenticationAction(null);
      const result = await signInWithOAuth("google");
      if (result !== "success") {
        await clearPurchaseIntent();
      } else if (isMountedRef.current) {
        // Account already owns the guarded, single-consumption resume flow.
        router.replace({ pathname: "/account", params: { action: "subscribe" } });
      }
    } catch {
      await clearPurchaseIntent().catch(() => undefined);
      setIntentError("Impossible de préparer la connexion. Réessaie dans quelques instants.");
    } finally {
      authNavigationRef.current = false;
      if (isMountedRef.current) setIsPreparingAuth(false);
    }
  }, [signInWithOAuth, returnTo, selectedOfferId]);

  const handleSubscribe = React.useCallback(() => {
    if (!canSubscribe) return;
    if (!auth.isPermanentAccount) { setAuthenticationAction("purchase"); return; }
    setConfirmationUserId(auth.user?.id ?? null);
  }, [auth.isPermanentAccount, auth.user?.id, canSubscribe]);

  const confirmSubscription = React.useCallback(async () => {
    if (!canSubscribe || !confirmationUserId || confirmationUserId !== auth.user?.id) return;
    setConfirmationUserId(null);
    const premiumGranted = await subscribe(selectedOffer.id);
    if (premiumGranted && isMountedRef.current) router.replace("/account");
  }, [auth.user?.id, canSubscribe, confirmationUserId, selectedOffer.id, subscribe]);

  const handleRestore = React.useCallback(async () => {
    if (!auth.isPermanentAccount) { setAuthenticationAction("restore"); return; }
    const premiumRestored = await restorePurchases();
    if (premiumRestored && isMountedRef.current) closePaywall();
  }, [auth.isPermanentAccount, closePaywall, restorePurchases]);

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
          <AppBackButton accessibilityLabel="Fermer Premium" />
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
                  accessibilityRole="radio"
                  accessibilityLabel={`${translate(offer.title)}. ${displayedPrice(offer.id)}`}
                  accessibilityState={{ selected: offer.id === effectiveSelectedOfferId, disabled: busy || hasPremiumAccess || (!isLoading && !subscriptions[offer.id]) }}
                  disabled={
                    busy ||
                    hasPremiumAccess ||
                    (!isLoading && !subscriptions[offer.id])
                  }
                  onPress={() => setSelectedOfferId(offer.id)}
                  style={({ pressed }) => [
                    styles.priceBox,
                    responsive.isCompact && styles.priceBoxCompact,
                    offer.id === highlightedOfferId && styles.priceBoxFeatured,
                    offer.id === effectiveSelectedOfferId &&
                      styles.priceBoxSelected,
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
                          {offer.id === highlightedOfferId &&
                            annualMetrics?.savingsPercent !== null &&
                            annualMetrics?.savingsPercent !== undefined && (
                            <View style={styles.savingBadge}>
                              <AppText variant="caption" style={styles.savingBadgeText}>
                                {`Économisez ${annualMetrics.savingsPercent} %`}
                              </AppText>
                            </View>
                          )}
                        </View>

                        <Ionicons
                          name={
                            offer.id === effectiveSelectedOfferId
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={22}
                          color={
                            offer.id === effectiveSelectedOfferId
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
                        {displayedPrice(offer.id)}
                      </AppText>
                      <AppText variant="bodySecondary" tone="muted" style={styles.priceCaption}>
                        {offer.id === "yearly" && annualMetrics
                          ? `Soit ${annualMetrics.monthlyEquivalentPriceString} / mois. ${offer.caption}`
                          : offer.caption}
                      </AppText>
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

          {(error || intentError) && (
            <View style={styles.errorCard}>
              <AppText variant="bodyStrong" style={styles.errorTitle}>Impossible de continuer</AppText>
              <AppText variant="bodySecondary" style={styles.errorText}>{error ? resolvePremiumError(error.message, locale, i18n) : translate(intentError ?? "")}</AppText>
              <ActionButton label="Réessayer" variant="ghost" disabled={busy || isLoading} onPress={() => void refreshEntitlements()} />
            </View>
          )}

          <ActionButton
            label={hasPremiumAccess ? "Continuer" : selectedOffer?.cta ?? PAYWALL_COPY.cta}
            size="large"
            accentColor={COLORS.pink}
            labelColor={COLORS.text}
            disabled={hasPremiumAccess ? busy : !canSubscribe}
            loading={isPurchasing || isPreparingAuth}
            loadingIndicatorColor={COLORS.text}
            onPress={() => hasPremiumAccess ? closePaywall() : void handleSubscribe()}
            style={styles.primaryAction}
          />

          {!hasPremiumAccess && selectedOffer && (
            <AppText variant="caption" style={styles.selectedPlanText}>
              {`Offre sélectionnée : ${selectedOffer.title}`}
            </AppText>
          )}
          {!auth.isPermanentAccount ? (
            <AppText variant="caption" tone="soft" style={styles.selectedPlanText}>
              Connecte-toi ou crée un compte pour continuer. Tu confirmeras ton achat après la connexion.
            </AppText>
          ) : params.action ? (
            <AppText variant="caption" tone="soft" style={styles.selectedPlanText}>
              Ton choix a été conservé. Confirme ton achat ou ta restauration pour continuer.
            </AppText>
          ) : null}

          <ActionButton
            label={PAYWALL_COPY.restore}
            variant="secondary"
            size="large"
            disabled={busy}
            loading={isRestoring}
            loadingIndicatorColor={COLORS.text}
            onPress={() => void handleRestore()}
            style={styles.secondaryAction}
          />

          {hasPremiumAccess && !IS_REVENUECAT_TEST_STORE ? <ActionButton
            label={PAYWALL_COPY.manage}
            variant="ghost"
            disabled={busy}
            onPress={() => void openSubscriptionManagement()}
            style={styles.manageAction}
          /> : null}

          <AppText variant="caption" tone="soft" style={styles.legalText}>
            {IS_REVENUECAT_TEST_STORE
              ? "Achat fictif RevenueCat Test Store. Aucun paiement réel ni abonnement résiliable dans Google Play."
              : Platform.OS === "android"
              ? "Le paiement est effectué via Google Play. L’abonnement est renouvelé automatiquement sauf résiliation. Vous pouvez le gérer ou l’annuler depuis votre compte Google Play. Les achats peuvent être restaurés avec le même compte."
              : "Le paiement est effectué via l’App Store. L’abonnement est renouvelé automatiquement sauf résiliation. Vous pouvez le gérer ou l’annuler depuis votre compte App Store. Les achats peuvent être restaurés avec le même compte."}
          </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
      <AppDialog
        visible={authenticationAction !== null}
        onRequestClose={() => setAuthenticationAction(null)}
        accessibilityLabel={t("authentication.title")}
      >
        <AppText variant="cardTitle" accessibilityRole="header">{t("authentication.title")}</AppText>
        <AppText variant="body" tone="muted" style={styles.subtitle}>
          {t(authenticationAction === "restore" ? "authentication.restoreMessage" : "authentication.message")}
        </AppText>
        <DialogActions>
          <ActionButton label={t("authentication.signIn")} disabled={busy}
            onPress={() => authenticationAction && void requestAuthentication(authenticationAction)} />
          <ActionButton label={t("authentication.cancel")} variant="secondary"
            onPress={() => setAuthenticationAction(null)} />
        </DialogActions>
      </AppDialog>
      <AppDialog
        visible={confirmationUserId !== null && confirmationUserId === auth.user?.id && auth.isPermanentAccount && !hasPremiumAccess}
        onRequestClose={() => setConfirmationUserId(null)}
        accessibilityLabel={t("confirmation.title")}
        accentColor={COLORS.cyan}
      >
        <AppText variant="cardTitle" accessibilityRole="header">{t("confirmation.title")}</AppText>
        <View style={styles.confirmationSummary}>
          <AppText variant="bodyStrong">{t(`subscription.plan.${selectedOffer.id}`)}</AppText>
          <AppText variant="cardTitle">{subscriptions[selectedOffer.id]?.product.priceString}</AppText>
          <AppText variant="bodySecondary" tone="muted">{t(`confirmation.${selectedOffer.id}`)}</AppText>
        </View>
        <AppText variant="bodySecondary" tone="muted" style={styles.confirmationNotice}>
          {t(IS_REVENUECAT_TEST_STORE ? "subscription.testNotice" : "confirmation.autoRenew")}
        </AppText>
        <DialogActions>
          <ActionButton
            label={t("confirmation.continue", { store: IS_REVENUECAT_TEST_STORE ? "RevenueCat Test Store" : Platform.OS === "android" ? "Google Play" : "App Store" })}
            disabled={!canSubscribe}
            onPress={() => void confirmSubscription()}
          />
          <ActionButton label={t("authentication.cancel")} variant="secondary" onPress={() => setConfirmationUserId(null)} />
        </DialogActions>
      </AppDialog>
    </LinearGradient>
  );
}

export default function PremiumScreen() {
  return (
    <PremiumLocalizationProvider>
      <PremiumScreenContent />
    </PremiumLocalizationProvider>
  );
}

const styles = StyleSheet.create({
  confirmationSummary: {
    gap: 8,
    marginVertical: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.card,
  },
  confirmationNotice: { marginBottom: 20 },
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
