import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { ApplicationLanguageSettings } from "../../components/application-language-settings";
import { LanguageSelectionScreen } from "../../components/language-selection-screen";
import { AppText } from "../../components/app-text";
import { AccountActionButton as ActionButton } from "../../components/account/AccountActionButton";
import { MicrosoftLogo } from "../../components/account/MicrosoftLogo";
import { authProfileFromUser } from "../../lib/authProfile";
import { AppBackButton } from "../../components/ui/app-back-button";
import { useTranslation } from "react-i18next";
import { AccountLocalizationProvider } from "../../lib/i18n/AccountLocalizationProvider";
import { useVocabularyText } from "../../lib/i18n/VocabularyTextContext";
import { resolveAccountError } from "../../lib/i18n/accountText";
import { resolvePremiumError } from "../../lib/i18n/premiumText";
import { DEFAULT_LOCALE, isAppLocale } from "../../lib/i18n/config";
import { AppDialog, DialogActions } from "../../components/ui/app-dialog";
import { SeoulMidnightGlass } from "../../constants/theme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useAuth } from "../../lib/AuthProvider";
import type { KappOAuthProvider } from "../../lib/authCallback";
import { KappAuthError } from "../../lib/authErrors";
import {
  suppressAccountProtectionPromptAfterLogout,
} from "../../lib/accountProtectionPromptStorage";
import { useProgressSync } from "../../lib/ProgressSyncProvider";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import { subscriptionDetails } from "../../lib/paywall/subscriptionDetails";
import { resumePurchaseIntent } from "../../lib/paywall/purchaseIntent";
import { SubscriptionDetails } from "../../components/premium/SubscriptionDetails";
import { PurchaseSuccessNotice } from "../../components/premium/PurchaseSuccessNotice";
import { synchronizeProgressNow } from "../../services/progressSync";

const COLORS = {
  cyan: SeoulMidnightGlass.colors.cyan,
  green: "#67E8A8",
  amber: "#F7C873",
  red: "#FB7185",
  text: SeoulMidnightGlass.colors.text,
  muted: SeoulMidnightGlass.colors.muted,
  soft: SeoulMidnightGlass.colors.soft,
  line: SeoulMidnightGlass.colors.line,
};

const PRIVACY_POLICY_URL = "https://arben7560.github.io/Kapp/politique-confidentialite/";

function friendlyCaughtMessage(caught: unknown) {
  return caught instanceof KappAuthError
    ? caught.message
    : "L’opération n’a pas abouti. Réessayez dans quelques instants.";
}

function StatusPill({
  color,
  icon,
  label,
}: {
  color: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <View style={[styles.statusPill, { borderColor: `${color}4D` }]}>
      <Ionicons name={icon} size={14} color={color} />
      <AppText variant="caption" style={{ color }}>
        {label}
      </AppText>
    </View>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.glassFrame}>
      <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(34,211,238,0.10)", "rgba(255,255,255,0.025)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glassContent}>{children}</View>
    </View>
  );
}

function ProviderButton({
  provider,
  loading,
  disabled,
  onPress,
}: {
  provider: KappOAuthProvider;
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const translate = useVocabularyText();
  const label = provider === "google" ? "Continuer avec Google" :
    provider === "azure" ? "Se connecter avec Microsoft" : "Continuer avec LINE";
  const isLine = provider === "line";
  const lineDisabled = isLine && disabled && !loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate(label)}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerButton,
        isLine && styles.lineProviderButton,
        pressed && (isLine ? styles.lineProviderButtonPressed : styles.providerButtonPressed),
        lineDisabled && styles.lineProviderButtonDisabled,
        !isLine && (disabled || loading) && styles.providerButtonDisabled,
      ]}
    >
      {({ pressed }) => (
        <>
          {loading ? (
            <ActivityIndicator color={isLine ? "#FFFFFF" : COLORS.text} size="small" />
          ) : isLine ? (
            <Image
              source={lineDisabled ? require("../../assets/images/line-login-disabled.png") :
                pressed ? require("../../assets/images/line-login-press.png") :
                  require("../../assets/images/line-login-base.png")}
              style={styles.lineProviderIcon}
              accessibilityIgnoresInvertColors
            />
          ) : provider === "azure" ? (
            <MicrosoftLogo />
          ) : (
            <Ionicons name="logo-google" color={COLORS.text} size={20} />
          )}
          <AppText variant="button" style={[styles.providerButtonLabel, lineDisabled && styles.lineProviderLabelDisabled]}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

function AccountScreenContent() {
  const translate = useVocabularyText();
  const { i18n, t } = useTranslation("account");
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(activeLanguage) ? activeLanguage : DEFAULT_LOCALE;
  const localizeError = React.useCallback(
    (message: string) => resolveAccountError(message, locale, i18n),
    [locale, i18n],
  );
  const friendlyError = React.useCallback(
    (caught: unknown) => localizeError(friendlyCaughtMessage(caught)),
    [localizeError],
  );
  const auth = useAuth();
  const profile = authProfileFromUser(auth.user);
  const paywall = usePaywall();
  const sync = useProgressSync();
  const { resetProgress } = useStore();
  const responsive = useResponsiveLayout({ maxWidth: 760 });
  const [showLanguagePreview, setShowLanguagePreview] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [profileFocused, setProfileFocused] = React.useState(false);
  const clearOAuthOutcome = auth.clearOAuthOutcome;
  const latestOAuthOutcome = React.useRef(auth.oauthOutcome);
  React.useEffect(() => {
    latestOAuthOutcome.current = auth.oauthOutcome;
  }, [auth.oauthOutcome]);
  useFocusEffect(React.useCallback(() => {
    setProfileFocused(true);
    return () => {
      setProfileFocused(false);
      if (latestOAuthOutcome.current) clearOAuthOutcome?.(latestOAuthOutcome.current);
    };
  }, [clearOAuthOutcome]));
  React.useEffect(() => {
    const outcome = auth.oauthOutcome;
    if (!profileFocused || !outcome) return;
    const timer = setTimeout(() => clearOAuthOutcome?.(outcome), 4_000);
    return () => clearTimeout(timer);
  }, [profileFocused, auth.oauthOutcome, clearOAuthOutcome]);
  const oauthNotice = !profileFocused ? null : auth.oauthOutcome?.result === "cancelled"
    ? "Connexion annulée. Aucun changement de compte."
    : auth.isPermanentAccount && auth.oauthOutcome?.result === "success"
      ? `Connexion ${auth.oauthOutcome.provider === "google" ? "Google" : auth.oauthOutcome.provider === "azure" ? "Microsoft" : "LINE"} réussie.`
      : null;
  const continueWithProvider = React.useCallback(
    async (provider: KappOAuthProvider) => {
      try {
        await auth.signInWithOAuth(provider);
      } catch {
        // AuthProvider publishes a localized error on Account.
      }
    },
    [auth],
  );

  const canResumePurchase = auth.isPermanentAccount && !auth.isLoading && !paywall.isLoading &&
    !auth.isHandlingDeepLink;
  const purchaseResumeError = translate("Impossible de retrouver la formule sélectionnée. Rouvre Premium pour continuer.");
  const refreshSubscription = paywall.refreshSubscription;
  useFocusEffect(React.useCallback(() => {
    if (auth.isPermanentAccount && auth.user?.id && !auth.isLoading) void refreshSubscription();
  }, [auth.isPermanentAccount, auth.isLoading, auth.user?.id, refreshSubscription]));
  useFocusEffect(React.useCallback(() => {
    if (!canResumePurchase) return;
    let active = true;
    void resumePurchaseIntent((intent) => {
      if (!active) return false;
      router.replace({ pathname: "/premium", params: {
        offerId: intent.offerId, returnTo: intent.returnTo ?? "", action: intent.action,
      } });
      return true;
    }).catch(() => {
      if (active) Alert.alert(purchaseResumeError);
    });
    return () => { active = false; };
  }, [canResumePurchase, purchaseResumeError]));

  const requestSignOut = () => {
    Alert.alert(
      translate("Se déconnecter ?"),
      translate("K-App synchronisera d’abord les modifications en attente, puis créera une nouvelle session invitée sur cet appareil."),
      [
        { text: translate("Annuler"), style: "cancel" },
        {
          text: translate("Se déconnecter"),
          onPress: () => {
            setIsSubmitting(true);
            void auth
              .signOut()
              .then((result) => {
                void suppressAccountProtectionPromptAfterLogout().catch((error) =>
                  console.warn(
                    "Impossible d’enregistrer le délai après déconnexion:",
                    error,
                  ),
                );
                if (result.syncDeferred || result.guestSessionPending) {
                  Alert.alert(
                    translate("Déconnexion effectuée"),
                    result.guestSessionPending
                      ? translate("Votre progression reste conservée localement. La session invitée sera créée lorsque le réseau sera disponible.")
                      : translate("Certaines modifications restent conservées localement et seront synchronisées ultérieurement."),
                  );
                }
              })
              .catch((caught) => Alert.alert(translate("Déconnexion suspendue"), friendlyError(caught)))
              .finally(() => setIsSubmitting(false));
          },
        },
      ],
    );
  };

  const requestDeletion = () => {
    Alert.alert(
      translate("Supprimer définitivement le compte ?"),
      translate("La progression cloud et le compte seront supprimés. Cette action n’annule pas un abonnement App Store ou Google Play."),
      [
        { text: translate("Annuler"), style: "cancel" },
        {
          text: translate("Supprimer"),
          style: "destructive",
          onPress: () => {
            setIsSubmitting(true);
            void auth
              .deleteAccount()
              .then(async () => {
                await resetProgress();
                await suppressAccountProtectionPromptAfterLogout().catch((error) =>
                  console.warn(
                    "Impossible d’enregistrer le délai après suppression:",
                    error,
                  ),
                );
              })
              .catch((caught) => Alert.alert(translate("Suppression impossible"), friendlyError(caught)))
              .finally(() => setIsSubmitting(false));
          },
        },
      ],
    );
  };

  const syncPresentation = React.useMemo(() => {
    switch (sync.status) {
      case "synced":
        if (sync.lastSyncedAt) return { label: "Progression sauvegardée", color: COLORS.green, icon: "checkmark-circle" as const };
        return { label: "Modifications en attente", color: COLORS.amber, icon: "time" as const };
      case "syncing":
        return { label: "Synchronisation", color: COLORS.cyan, icon: "sync" as const };
      case "pending":
        return { label: "Modifications en attente", color: COLORS.amber, icon: "time" as const };
      case "offline":
        return { label: "Hors ligne", color: COLORS.soft, icon: "cloud-offline" as const };
      default:
        return { label: "Erreur de synchronisation", color: COLORS.red, icon: "alert-circle" as const };
    }
  }, [sync.status, sync.lastSyncedAt]);
  const isProgressSaved = sync.status === "synced" && Boolean(sync.lastSyncedAt);
  const canRetrySync = !isProgressSaved && sync.status !== "syncing";

  const details = subscriptionDetails(paywall.customerInfo, paywall.subscriptions);
  const activePlanLabel = details.plan ? i18n.t(`premium:subscription.plan.${details.plan}`) : null;
  const isTestStoreSubscription = details.isTestStore;
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = React.useState(false);
  const [cancellationUserId, setCancellationUserId] = React.useState<string | null>(null);
  React.useEffect(() => {
    setSubscriptionDialogOpen(false);
    setCancellationUserId(null);
  }, [auth.user?.id]);
  const canManageAccountSubscription = auth.isPermanentAccount && Boolean(auth.user?.id) && !auth.isLoading;
  React.useEffect(() => {
    if (!canManageAccountSubscription) {
      setSubscriptionDialogOpen(false);
      setCancellationUserId(null);
    }
  }, [canManageAccountSubscription]);
  const canCancelSubscription = details.canCancel && !paywall.isDeveloperUnlocked;
  const cancellationVisible = canCancelSubscription && cancellationUserId !== null && cancellationUserId === auth.user?.id;
  const subscriptionText = (key: "cancel" | "manage" | "cancelledTitle" | "cancelledNotice" |
    "cancelledUnknownDate" | "checkingReturn" | "unconfirmedReturn" | "cancelIntro" |
    "cancelAccess" | "cancelAccessUnknown" | "keep" | "continueToStore" |
    "planLabel" | "statusLabel" | "planUnknown" | "noPlan" | "checking" | "close",
    options: Record<string, unknown> = {}) => i18n.t(`premium:subscription.${key}`, options);
  const endDate = details.expiresAt ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(details.expiresAt) : null;
  const cancellationConfirmed = details.state === "cancelled" && !paywall.error &&
    paywall.managementReturnStatus !== "checking" && paywall.managementReturnStatus !== "unconfirmed";
  const storeName = details.store === "PLAY_STORE" ? "Google Play" : "App Store";
  const [restoredUserId, setRestoredUserId] = React.useState<string | null>(null);
  const handleRestore = async () => {
    setRestoredUserId(null);
    if (!auth.isPermanentAccount) { setSubscriptionDialogOpen(false); return; }
    if (await paywall.restorePurchases()) setRestoredUserId(auth.user?.id ?? null);
  };

  const handleSubscriptionAction = () => {
    paywall.clearError();
    setSubscriptionDialogOpen(false);
    if (canCancelSubscription) {
      setCancellationUserId(auth.user?.id ?? null);
      return;
    }
    if (paywall.hasPremiumAccess && details.canManage && !paywall.isDeveloperUnlocked) {
      void paywall.openSubscriptionManagement();
      return;
    }

    router.push({ pathname: "/premium", params: { returnTo: "/account" } });
  };

  if (__DEV__ && showLanguagePreview) {
    return (
      <LanguageSelectionScreen
        onComplete={() => setShowLanguagePreview(false)}
        onCancel={() => setShowLanguagePreview(false)}
      />
    );
  }

  return (
    <LinearGradient
      colors={["#020306", "#070A12", "#090817", "#020306"]}
      locations={[0, 0.34, 0.72, 1]}
      style={styles.screen}
    >
      <View pointerEvents="none" style={styles.ambientTop} />
      <View pointerEvents="none" style={styles.ambientBottom} />
      <SafeAreaView style={styles.safe}>
        <View style={{ width: "100%", maxWidth: responsive.maxWidth, alignSelf: "center", paddingHorizontal: responsive.horizontalPadding }}>
          <PurchaseSuccessNotice />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.safe}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              {
                maxWidth: responsive.maxWidth,
                paddingHorizontal: responsive.horizontalPadding,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AppBackButton fallbackHref="/(tabs)" style={styles.back} />
            {auth.isHandlingDeepLink && !auth.activeOAuthProvider ? (
              <View style={styles.inlineNotice}>
                <ActivityIndicator color={COLORS.cyan} size="small" />
                <AppText variant="bodySecondary" style={styles.noticeCopy}>
                  Validation de votre connexion…
                </AppText>
              </View>
            ) : null}
            {auth.error ? (
              <View style={styles.inlineNotice}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.amber} />
                <AppText variant="bodySecondary" style={styles.noticeCopy}>
                  {localizeError(auth.error)}
                </AppText>
              </View>
            ) : null}
            {oauthNotice ? (
              <View style={styles.inlineNotice}>
                <Ionicons
                  name={auth.isPermanentAccount ? "checkmark-circle-outline" : "information-circle-outline"}
                  size={18}
                  color={auth.isPermanentAccount ? COLORS.green : COLORS.amber}
                />
                <AppText variant="bodySecondary" style={styles.noticeCopy}>
                  {oauthNotice}
                </AppText>
              </View>
            ) : null}

            <View style={styles.headingRow}>
              <View style={styles.headingCopy}>
                <AppText variant="sectionLabel" tone="soft">
                  COMPTE K-APP
                </AppText>
                <AppText accessibilityRole="header" variant={responsive.isCompact ? "featureTitle" : "screenTitle"}>
                  Mon profil
                </AppText>
              </View>
              <View style={styles.profileGlyph}>
                <Ionicons name="person-outline" size={22} color={COLORS.cyan} />
              </View>
            </View>

            <GlassCard>
              <ApplicationLanguageSettings />
            </GlassCard>

            {__DEV__ ? (
              <GlassCard>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={translate("Tester l'écran de sélection de langue")}
                  onPress={() => setShowLanguagePreview(true)}
                  style={styles.settingsRow}
                >
                  <View style={styles.settingsCopy}>
                    <AppText variant="bodyStrong">{"Tester l'écran de sélection de langue"}</AppText>
                    <AppText variant="caption" tone="soft">Prévisualisation — développement uniquement</AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.soft} />
                </Pressable>
              </GlassCard>
            ) : null}

            {!auth.isPermanentAccount ? (
              <GlassCard>
                <StatusPill
                  color={auth.isAuthenticated ? COLORS.amber : COLORS.soft}
                  icon={auth.isAuthenticated ? "phone-portrait-outline" : "cloud-offline-outline"}
                  label={auth.isLoading ? "Initialisation" : "SUR CET APPAREIL"}
                />
                <AppText variant={responsive.isCompact ? "sectionTitle" : "featureTitle"} style={styles.cardTitle}>
                  Progression enregistrée sur cet appareil
                </AppText>
                <AppText variant="body" tone="muted" style={styles.cardBody}>
                  Connectez-vous avec Google, Microsoft ou LINE pour retrouver votre progression après une réinstallation ou sur un autre appareil.
                </AppText>
                <View style={styles.primaryActions}>
                  <ProviderButton
                    provider="google"
                    loading={auth.activeOAuthProvider === "google"}
                    disabled={!auth.isConfigured || auth.isLoading || auth.isHandlingDeepLink || Boolean(auth.activeOAuthProvider)}
                    onPress={() => void continueWithProvider("google")}
                  />
                  <ProviderButton
                    provider="azure"
                    loading={auth.activeOAuthProvider === "azure"}
                    disabled={!auth.isConfigured || auth.isLoading || auth.isHandlingDeepLink || Boolean(auth.activeOAuthProvider)}
                    onPress={() => void continueWithProvider("azure")}
                  />
                  <ProviderButton
                    provider="line"
                    loading={auth.activeOAuthProvider === "line"}
                    disabled={!auth.isConfigured || auth.isLoading || auth.isHandlingDeepLink || Boolean(auth.activeOAuthProvider)}
                    onPress={() => void continueWithProvider("line")}
                  />
                  <View style={styles.linePrivacyNotice}>
                    <AppText variant="caption" tone="soft">
                      {t("lineEmailNotice")}
                    </AppText>
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={t("privacyPolicy")}
                      onPress={() => void Linking.openURL(PRIVACY_POLICY_URL).catch(() =>
                        Alert.alert(t("privacyPolicyOpenError")),
                      )}
                      style={styles.privacyLink}
                    >
                      <AppText variant="caption" style={styles.privacyLinkText}>
                        {t("privacyPolicy")}
                      </AppText>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.securityNote}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.soft} />
                  <AppText variant="caption" tone="soft" style={styles.securityCopy}>
                    La session invitée sauvegarde dans le cloud quand le réseau est disponible, mais elle ne peut pas être récupérée après suppression des données locales.
                  </AppText>
                </View>
              </GlassCard>
            ) : (
              <>
                <GlassCard>
                  <AppText accessibilityRole="header" variant="sectionTitle">
                    Mon compte
                  </AppText>
                  {profile.email ? (
                    <View style={styles.accountLine}>
                      <View style={styles.lineIcon}>
                        <Ionicons name="mail-outline" size={17} color={COLORS.cyan} />
                      </View>
                      <View style={styles.lineCopy}>
                        <AppText variant="caption" tone="soft">Adresse e-mail</AppText>
                        <AppText variant="bodyStrong">
                          {profile.email}
                        </AppText>
                      </View>
                    </View>
                  ) : null}
                  <View style={styles.progressStatus}>
                    <StatusPill
                      color={syncPresentation.color}
                      icon={syncPresentation.icon}
                      label={syncPresentation.label}
                    />
                  </View>
                  {!isProgressSaved && sync.errorMessage ? (
                    <AppText variant="body" tone="muted" style={styles.cardBody}>
                      {localizeError(sync.errorMessage)}
                    </AppText>
                  ) : null}
                  {canRetrySync ? (
                    <ActionButton
                      label={sync.status === "error" || sync.status === "offline"
                        ? "Réessayer la synchronisation"
                        : "Synchroniser maintenant"}
                      variant="secondary"
                      onPress={() => void synchronizeProgressNow().catch(() => undefined)}
                      style={styles.retryButton}
                    />
                  ) : null}
                </GlassCard>

                <View style={styles.secondaryActions}>
                  <ActionButton
                    label="Se déconnecter"
                    variant="secondary"
                    loading={isSubmitting}
                    disabled={Boolean(auth.activeOAuthProvider) || auth.isHandlingDeepLink}
                    onPress={requestSignOut}
                  />
                  <Pressable style={styles.deleteButton} onPress={requestDeletion} disabled={isSubmitting || Boolean(auth.activeOAuthProvider) || auth.isHandlingDeepLink}>
                    <AppText variant="button" align="center" style={{ color: COLORS.red }}>
                      Supprimer mon compte
                    </AppText>
                  </Pressable>
                  <AppText variant="caption" align="center" tone="soft" style={styles.subscriptionWarning}>
                    Supprimer le compte n’annule pas automatiquement un abonnement App Store ou Google Play.
                  </AppText>
                </View>
              </>
            )}

            {canManageAccountSubscription ? (
            <>
            <ActionButton
              label={subscriptionText("manage")}
              variant="secondary"
              onPress={() => {
                paywall.clearError();
                setSubscriptionDialogOpen(true);
              }}
              style={styles.subscriptionManageButton}
            />
            {cancellationConfirmed ? (
              <View accessibilityLiveRegion="polite" style={styles.cancellationConfirmation}>
                <AppText variant="bodyStrong" style={{ color: COLORS.green }}>
                  {subscriptionText("cancelledTitle")}
                </AppText>
                <AppText variant="bodySecondary" tone="muted">
                  {subscriptionText(endDate ? "cancelledNotice" : "cancelledUnknownDate", { date: endDate })}
                </AppText>
              </View>
            ) : null}
            {paywall.managementReturnStatus === "checking" || paywall.managementReturnStatus === "unconfirmed" ? (
              <AppText variant="caption" tone="soft" accessibilityLiveRegion="polite" style={styles.subscriptionAction}>
                {subscriptionText(paywall.managementReturnStatus === "checking" ? "checkingReturn" : "unconfirmedReturn", { store: storeName })}
              </AppText>
            ) : null}
            </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AppDialog
        visible={canManageAccountSubscription && (subscriptionDialogOpen || cancellationVisible)}
        onRequestClose={() => {
          setSubscriptionDialogOpen(false);
          setCancellationUserId(null);
        }}
        accessibilityLabel={subscriptionText(cancellationVisible ? "cancel" : "manage")}
        accentColor={COLORS.cyan}
      >
        {cancellationVisible ? (
          <>
            <AppText variant="cardTitle" accessibilityRole="header">{subscriptionText("cancel")}</AppText>
            <AppText variant="body" tone="muted" style={styles.subscriptionAction}>
              {subscriptionText("cancelIntro")}
            </AppText>
            <AppText variant="body" tone="muted" style={styles.subscriptionAction}>
              {subscriptionText(endDate ? "cancelAccess" : "cancelAccessUnknown", { date: endDate, store: storeName })}
            </AppText>
            <DialogActions style={styles.dialogActions}>
              <ActionButton label={subscriptionText("keep")} onPress={() => {
                setCancellationUserId(null);
                setSubscriptionDialogOpen(true);
              }} />
              <ActionButton
                label={subscriptionText("continueToStore", { store: storeName })}
                variant="secondary"
                onPress={() => {
                  setCancellationUserId(null);
                  setSubscriptionDialogOpen(false);
                  void paywall.openSubscriptionManagement();
                }}
              />
            </DialogActions>
          </>
        ) : (
          <>
            <AppText variant="cardTitle" accessibilityRole="header">{subscriptionText("manage")}</AppText>
            <View style={styles.subscriptionDialogSummary}>
              <AppText variant="label" tone="soft">{subscriptionText("planLabel")}</AppText>
              <AppText variant="bodyStrong">
                {paywall.isDeveloperUnlocked
                  ? subscriptionText("planUnknown")
                  : activePlanLabel ?? subscriptionText(paywall.hasPremiumAccess ? "planUnknown" : "noPlan")}
              </AppText>
              <AppText variant="label" tone="soft" style={styles.subscriptionDialogStatusLabel}>
                {subscriptionText("statusLabel")}
              </AppText>
              <AppText variant="bodyStrong" style={{ color: paywall.hasPremiumAccess ? COLORS.green : COLORS.text }}>
                {paywall.isLoading
                  ? subscriptionText("checking")
                  : paywall.isDeveloperUnlocked
                    ? "Accès de développement"
                    : i18n.t(`premium:subscription.states.${details.state}`)}
              </AppText>
              <SubscriptionDetails details={details} />
            </View>
            <DialogActions style={styles.dialogActions}>
              {(!paywall.hasPremiumAccess ||
                (details.canManage && !isTestStoreSubscription && !paywall.isDeveloperUnlocked)) ? (
                <ActionButton
                  label={!paywall.hasPremiumAccess
                    ? "Découvrir Premium"
                    : subscriptionText(canCancelSubscription ? "cancel" : "manage")}
                  variant="secondary"
                  disabled={paywall.isLoading || paywall.isPurchasing || paywall.isRestoring ||
                    paywall.managementReturnStatus === "checking"}
                  onPress={handleSubscriptionAction}
                />
              ) : null}
              {!paywall.hasPremiumAccess ? (
                <>
                  <ActionButton
                    label="Restaurer mes achats"
                    variant="secondary"
                    loading={paywall.isRestoring}
                    disabled={paywall.isLoading || paywall.isPurchasing || paywall.isRestoring}
                    onPress={() => void handleRestore()}
                  />
                  <ActionButton
                    label={i18n.t("premium:subscription.refresh")}
                    variant="ghost"
                    disabled={paywall.isLoading || paywall.isPurchasing || paywall.isRestoring}
                    onPress={() => void paywall.refreshEntitlements()}
                  />
                </>
              ) : null}
              {restoredUserId === auth.user?.id && paywall.hasPremiumAccess ? (
                <AppText variant="caption" tone="soft">{i18n.t("premium:subscription.restored")}</AppText>
              ) : null}
              {paywall.error &&
                !(isTestStoreSubscription && paywall.error.code === "management-url-unavailable") ? (
                  <AppText variant="caption" style={styles.subscriptionError}>
                    {resolvePremiumError(paywall.error.message, locale, i18n)}
                  </AppText>
                ) : null}
              <ActionButton label={subscriptionText("close")} variant="ghost"
                onPress={() => setSubscriptionDialogOpen(false)} />
            </DialogActions>
          </>
        )}
      </AppDialog>

    </LinearGradient>
  );
}

export default function AccountScreen() {
  return (
    <AccountLocalizationProvider>
      <AccountScreenContent />
    </AccountLocalizationProvider>
  );
}

const styles = StyleSheet.create({
  cancellationConfirmation: {
    gap: 8,
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.24)",
    backgroundColor: "rgba(74,222,128,0.08)",
  },
  screen: { flex: 1, backgroundColor: "#020306" },
  safe: { flex: 1 },
  ambientTop: {
    position: "absolute",
    top: -160,
    right: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(34,211,238,0.075)",
  },
  ambientBottom: {
    position: "absolute",
    bottom: -180,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(116,91,255,0.07)",
  },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 8,
    paddingBottom: 56,
  },
  back: { marginBottom: 24 },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  },
  headingCopy: { flex: 1, gap: 5 },
  profileGlyph: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.24)",
    backgroundColor: "rgba(34,211,238,0.09)",
  },
  glassFrame: {
    marginBottom: 14,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(6,8,14,0.72)",
  },
  glassContent: { padding: 22 },
  statusPill: {
    alignSelf: "flex-start",
    minHeight: 28,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: { marginTop: 18, maxWidth: 520 },
  cardBody: { marginTop: 9, maxWidth: 560 },
  inlineNotice: {
    marginTop: 18,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(247,200,115,0.22)",
    backgroundColor: "rgba(247,200,115,0.07)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  noticeCopy: { flex: 1, color: COLORS.amber },
  primaryActions: { gap: 10, marginTop: 24 },
  providerButton: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.075)",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
  },
  providerButtonPressed: { backgroundColor: "rgba(255,255,255,0.12)" },
  providerButtonDisabled: { opacity: 0.48 },
  providerButtonLabel: { color: COLORS.text },
  lineProviderButton: { backgroundColor: "#4CC764", borderColor: "#4CC764" },
  lineProviderButtonPressed: { backgroundColor: "#358B46", borderColor: "#358B46" },
  lineProviderButtonDisabled: { backgroundColor: "#FFFFFF", borderColor: "#E5E5E5" },
  lineProviderIcon: { width: 40, height: 40 },
  lineProviderLabelDisabled: { color: "rgba(30,30,30,0.20)" },
  linePrivacyNotice: { gap: 4, paddingHorizontal: 2 },
  privacyLink: { alignSelf: "flex-start", paddingVertical: 4 },
  privacyLinkText: { color: COLORS.cyan, textDecorationLine: "underline" },
  securityNote: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  securityCopy: { flex: 1 },
  accountLine: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lineIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(255,255,255,0.045)",
  },
  lineCopy: { flex: 1, minWidth: 0, gap: 2 },
  progressStatus: { marginTop: 14 },
  retryButton: { marginTop: 12 },
  sectionCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(255,255,255,0.038)",
  },
  settingsRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 14,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.065)",
  },
  settingsCopy: { flex: 1, gap: 2 },
  subscriptionManageButton: { marginTop: 14, minHeight: 62 },
  subscriptionDialogSummary: {
    marginTop: 18,
    padding: 17,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "rgba(103,232,168,0.18)",
    backgroundColor: "rgba(103,232,168,0.045)",
  },
  subscriptionDialogStatusLabel: { marginTop: 14 },
  subscriptionStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  subscriptionActiveIcon: {
    borderColor: "rgba(103,232,168,0.28)",
    backgroundColor: "rgba(103,232,168,0.08)",
  },
  subscriptionAction: { marginTop: 16 },
  subscriptionTestNotice: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(103,232,168,0.20)",
    backgroundColor: "rgba(103,232,168,0.06)",
    gap: 6,
  },
  subscriptionTestTitle: { color: COLORS.green },
  subscriptionError: { color: COLORS.red, marginTop: 10 },
  rowDivider: {
    height: 1,
    marginLeft: 52,
    backgroundColor: SeoulMidnightGlass.colors.lineSoft,
  },
  secondaryActions: { marginTop: 22, gap: 8 },
  deleteButton: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  subscriptionWarning: { maxWidth: 460, alignSelf: "center", marginTop: 2 },
  dialogActions: { marginTop: 20 },
});
