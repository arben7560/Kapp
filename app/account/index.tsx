import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { AppText, AppTextInput } from "../../components/app-text";
import { ActionButton } from "../../components/ui/action-button";
import { AppBackButton } from "../../components/ui/app-back-button";
import { AppDialog, DialogActions } from "../../components/ui/app-dialog";
import { SeoulMidnightGlass } from "../../constants/theme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useAuth } from "../../lib/AuthProvider";
import type { KappOAuthProvider } from "../../lib/authCallback";
import {
  suppressAccountProtectionPromptAfterLogout,
} from "../../lib/accountProtectionPromptStorage";
import { KappAuthError } from "../../lib/authErrors";
import { useProgressSync } from "../../lib/ProgressSyncProvider";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import { synchronizeProgressNow } from "../../services/progressSync";

type FormMode =
  | "protect"
  | "sign-in"
  | "reset"
  | "confirmation"
  | "set-password"
  | "change-password"
  | null;

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

function friendlyCaughtMessage(caught: unknown) {
  return caught instanceof KappAuthError
    ? caught.message
    : "L’opération n’a pas abouti. Réessayez dans quelques instants.";
}

function formatSyncDate(value: string | null) {
  if (!value) return "Aucune synchronisation réussie";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date indisponible";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
  const label = provider === "google" ? "Continuer avec Google" : "Continuer avec Apple";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerButton,
        pressed && styles.providerButtonPressed,
        (disabled || loading) && styles.providerButtonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text} size="small" />
      ) : (
        <Ionicons
          name={provider === "google" ? "logo-google" : "logo-apple"}
          color={COLORS.text}
          size={20}
        />
      )}
      <AppText variant="button" style={styles.providerButtonLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

function providerSummary(providers: string[]) {
  const labels = providers
    .filter((provider) => provider !== "anonymous")
    .map((provider) => {
      if (provider === "google") return "Google";
      if (provider === "apple") return "Apple";
      if (provider === "email") return "Email + mot de passe";
      return provider;
    });
  return labels.length > 0 ? labels.join(" • ") : "Compte K-App";
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoComplete?: React.ComponentProps<typeof AppTextInput>["autoComplete"];
}) {
  const [isSecureTextVisible, setIsSecureTextVisible] = React.useState(false);

  return (
    <View style={styles.fieldGroup}>
      <AppText variant="label" tone="soft">
        {label}
      </AppText>
      <View style={styles.inputShell}>
        <AppTextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          keyboardType={label === "EMAIL" ? "email-address" : "default"}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.30)"
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          variant="bodyStrong"
          style={[styles.input, secureTextEntry && styles.inputWithToggle]}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSecureTextVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            accessibilityState={{ checked: isSecureTextVisible }}
            hitSlop={8}
            onPress={() => setIsSecureTextVisible((visible) => !visible)}
            style={styles.passwordToggle}
          >
            <Ionicons
              name={isSecureTextVisible ? "eye-off-outline" : "eye-outline"}
              size={21}
              color={COLORS.soft}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const auth = useAuth();
  const paywall = usePaywall();
  const sync = useProgressSync();
  const { resetProgress } = useStore();
  const params = useLocalSearchParams<{ action?: string | string[] }>();
  const responsive = useResponsiveLayout({ maxWidth: 760 });
  const [mode, setMode] = React.useState<FormMode>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const didHandleProtectAction = React.useRef(false);
  const clearAuthError = auth.clearError;

  const resetForm = React.useCallback(() => {
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setFormError(null);
    setFormSuccess(null);
    clearAuthError();
  }, [clearAuthError]);

  const openMode = React.useCallback(
    (nextMode: FormMode) => {
      resetForm();
      if ((nextMode === "sign-in" || nextMode === "reset") && auth.user?.email) {
        setEmail(auth.user.email);
      }
      setMode(nextMode);
    },
    [auth.user, resetForm],
  );

  const closeDialog = React.useCallback(() => {
    if (isSubmitting || auth.activeOAuthProvider) return;
    setMode(null);
    resetForm();
  }, [auth.activeOAuthProvider, isSubmitting, resetForm]);

  const continueWithProvider = React.useCallback(
    async (provider: KappOAuthProvider, existingAccount = false) => {
      setFormError(null);
      try {
        const result = provider === "google" || existingAccount
          ? await auth.signInWithOAuth(provider)
          : await auth.linkOAuthIdentity(provider);
        if (result === "success" && existingAccount) setMode(null);
      } catch (caught) {
        setFormError(friendlyCaughtMessage(caught));
      }
    },
    [auth],
  );

  const requestedAction = Array.isArray(params.action)
    ? params.action[0]
    : params.action;

  React.useEffect(() => {
    if (
      didHandleProtectAction.current ||
      requestedAction !== "protect" ||
      auth.isLoading ||
      !auth.isAnonymous
    ) {
      return;
    }

    didHandleProtectAction.current = true;
    const timer = setTimeout(() => openMode("protect"), 0);
    return () => clearTimeout(timer);
  }, [auth.isAnonymous, auth.isLoading, openMode, requestedAction]);

  React.useEffect(() => {
    if (!auth.needsPasswordSetup) return;
    const timer = setTimeout(() => openMode("set-password"), 0);
    return () => clearTimeout(timer);
  }, [auth.needsPasswordSetup, openMode]);

  React.useEffect(() => {
    if (!auth.isPasswordRecovery) return;
    const timer = setTimeout(() => openMode("change-password"), 0);
    return () => clearTimeout(timer);
  }, [auth.isPasswordRecovery, openMode]);

  const ensureMatchingPasswords = React.useCallback(() => {
    if (password !== passwordConfirmation) {
      throw new KappAuthError(
        "password-mismatch",
        "Les deux mots de passe ne correspondent pas.",
      );
    }
  }, [password, passwordConfirmation]);

  const submit = React.useCallback(async () => {
    if (!mode) return;
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      if (mode === "protect") {
        const result = await auth.protectProgress(email);
        if (result === "confirmation-required") {
          setMode("confirmation");
        } else {
          setMode("set-password");
        }
      } else if (mode === "sign-in") {
        await auth.signIn(email, password);
        setMode(null);
      } else if (mode === "reset") {
        await auth.resetPassword(email);
        setFormSuccess(
          "Email envoyé. Ouvrez le lien sur cet appareil pour choisir un nouveau mot de passe.",
        );
      } else if (mode === "set-password") {
        ensureMatchingPasswords();
        await auth.completeAccountProtection(password);
        setMode(null);
      } else if (mode === "change-password") {
        ensureMatchingPasswords();
        await auth.updatePassword(password);
        setFormSuccess("Votre mot de passe a été mis à jour.");
        setPassword("");
        setPasswordConfirmation("");
      }
    } catch (caught) {
      setFormError(friendlyCaughtMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  }, [auth, email, ensureMatchingPasswords, mode, password]);

  const requestSignOut = () => {
    Alert.alert(
      "Se déconnecter ?",
      "K-App synchronisera d’abord les modifications en attente, puis créera une nouvelle session invitée sur cet appareil.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          onPress: () => {
            setIsSubmitting(true);
            void auth
              .signOut()
              .then(() =>
                suppressAccountProtectionPromptAfterLogout().catch((error) =>
                  console.warn(
                    "Impossible d’enregistrer le délai après déconnexion:",
                    error,
                  ),
                ),
              )
              .catch((caught) => Alert.alert("Déconnexion suspendue", friendlyCaughtMessage(caught)))
              .finally(() => setIsSubmitting(false));
          },
        },
      ],
    );
  };

  const requestDeletion = () => {
    Alert.alert(
      "Supprimer définitivement le compte ?",
      "La progression cloud et le compte seront supprimés. Cette action n’annule pas un abonnement App Store ou Google Play.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
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
              .catch((caught) => Alert.alert("Suppression impossible", friendlyCaughtMessage(caught)))
              .finally(() => setIsSubmitting(false));
          },
        },
      ],
    );
  };

  const syncPresentation = React.useMemo(() => {
    switch (sync.status) {
      case "synced":
        return { label: "Progression synchronisée", color: COLORS.green, icon: "checkmark-circle" as const };
      case "syncing":
        return { label: "Synchronisation", color: COLORS.cyan, icon: "sync" as const };
      case "pending":
        return { label: "Modifications en attente", color: COLORS.amber, icon: "time" as const };
      case "offline":
        return { label: "Hors ligne", color: COLORS.soft, icon: "cloud-offline" as const };
      default:
        return { label: "Erreur de synchronisation", color: COLORS.red, icon: "alert-circle" as const };
    }
  }, [sync.status]);

  const dialogTitle =
    mode === "protect"
      ? "Protéger ma progression"
      : mode === "sign-in"
        ? "J’ai déjà un compte"
        : mode === "reset"
          ? "Mot de passe oublié"
          : mode === "confirmation"
            ? "Confirmez votre email"
            : mode === "set-password"
              ? "Finaliser votre compte"
              : "Nouveau mot de passe";

  const requiresEmail = mode === "protect" || mode === "sign-in" || mode === "reset";
  const requiresPassword =
    mode === "sign-in" ||
    mode === "set-password" ||
    mode === "change-password";
  const requiresConfirmation =
    mode === "protect" || mode === "set-password" || mode === "change-password";
  const activePlanLabel =
    paywall.entitlement.productId === "kapp_premium_monthly"
      ? "Formule mensuelle"
      : paywall.entitlement.productId === "kapp_premium_yearly"
        ? "Formule annuelle"
        : null;

  const handleSubscriptionAction = () => {
    paywall.clearError();
    if (paywall.hasPremiumAccess && !paywall.isDeveloperUnlocked) {
      void paywall.openSubscriptionManagement();
      return;
    }

    router.push("/premium");
  };

  return (
    <LinearGradient
      colors={["#020306", "#070A12", "#090817", "#020306"]}
      locations={[0, 0.34, 0.72, 1]}
      style={styles.screen}
    >
      <View pointerEvents="none" style={styles.ambientTop} />
      <View pointerEvents="none" style={styles.ambientBottom} />
      <SafeAreaView style={styles.safe}>
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

            <View style={styles.headingRow}>
              <View style={styles.headingCopy}>
                <AppText variant="sectionLabel" tone="soft">
                  COMPTE K-APP
                </AppText>
                <AppText accessibilityRole="header" variant="screenTitle">
                  Mon profil
                </AppText>
              </View>
              <View style={styles.profileGlyph}>
                <Ionicons name="person-outline" size={22} color={COLORS.cyan} />
              </View>
            </View>

            {!auth.isPermanentAccount ? (
              <GlassCard>
                <StatusPill
                  color={auth.isAuthenticated ? COLORS.amber : COLORS.soft}
                  icon={auth.isAuthenticated ? "phone-portrait-outline" : "cloud-offline-outline"}
                  label={auth.isLoading ? "Initialisation" : "SUR CET APPAREIL"}
                />
                <AppText variant="featureTitle" style={styles.cardTitle}>
                  Progression enregistrée sur cet appareil
                </AppText>
                <AppText variant="body" tone="muted" style={styles.cardBody}>
                  Créez un compte ou connectez-vous pour retrouver votre progression après une réinstallation ou sur un autre appareil.
                </AppText>
                {auth.error ? (
                  <View style={styles.inlineNotice}>
                    <Ionicons name="information-circle-outline" size={18} color={COLORS.amber} />
                    <AppText variant="bodySecondary" style={styles.noticeCopy}>
                      {auth.error}
                    </AppText>
                  </View>
                ) : null}
                <View style={styles.primaryActions}>
                  <ProviderButton
                    provider="google"
                    loading={auth.activeOAuthProvider === "google"}
                    disabled={!auth.isConfigured || auth.isLoading || Boolean(auth.activeOAuthProvider)}
                    onPress={() => void continueWithProvider("google")}
                  />
                  {Platform.OS === "ios" ? (
                    <ProviderButton
                      provider="apple"
                      loading={auth.activeOAuthProvider === "apple"}
                      disabled={!auth.isConfigured || auth.isLoading || Boolean(auth.activeOAuthProvider)}
                      onPress={() => void continueWithProvider("apple")}
                    />
                  ) : null}
                  <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <AppText variant="caption" tone="soft">OU</AppText>
                    <View style={styles.orLine} />
                  </View>
                  <ActionButton
                    label="Créer un compte avec mon email"
                    size="large"
                    accentColor={COLORS.cyan}
                    disabled={!auth.isConfigured || auth.isLoading}
                    onPress={() => openMode("protect")}
                  />
                  <ActionButton
                    label="J’ai déjà un compte"
                    variant="secondary"
                    size="large"
                    disabled={!auth.isConfigured || auth.isLoading}
                    onPress={() => openMode("sign-in")}
                  />
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
                  <StatusPill
                    color={syncPresentation.color}
                    icon={syncPresentation.icon}
                    label={syncPresentation.label}
                  />
                  <AppText variant="featureTitle" style={styles.cardTitle}>
                    Compte protégé
                  </AppText>
                  {sync.errorMessage ? (
                    <AppText variant="body" tone="muted" style={styles.cardBody}>
                      {sync.errorMessage}
                    </AppText>
                  ) : null}
                  <View style={styles.accountLine}>
                    <View style={styles.lineIcon}>
                      <Ionicons name="person-circle-outline" size={17} color={COLORS.cyan} />
                    </View>
                    <View style={styles.lineCopy}>
                      <AppText variant="caption" tone="soft">CONNEXION</AppText>
                      <AppText variant="bodyStrong">
                        {providerSummary(auth.providers)}
                      </AppText>
                    </View>
                  </View>
                  {auth.user?.email ? (
                    <View style={styles.accountLine}>
                      <View style={styles.lineIcon}>
                        <Ionicons name="mail-outline" size={17} color={COLORS.cyan} />
                      </View>
                      <View style={styles.lineCopy}>
                        <AppText variant="caption" tone="soft">EMAIL</AppText>
                        <AppText variant="bodyStrong" lineContract="singleLine">
                          {auth.user.email}
                        </AppText>
                      </View>
                    </View>
                  ) : null}
                  <View style={styles.accountLine}>
                    <View style={styles.lineIcon}>
                      <Ionicons name="cloud-done-outline" size={17} color={syncPresentation.color} />
                    </View>
                    <View style={styles.lineCopy}>
                      <AppText variant="caption" tone="soft">DERNIÈRE SYNCHRONISATION</AppText>
                      <AppText variant="bodySecondary">
                        {formatSyncDate(sync.lastSyncedAt)}
                      </AppText>
                    </View>
                  </View>
                  <ActionButton
                    label={sync.status === "error" || sync.status === "offline"
                      ? "Réessayer la synchronisation"
                      : "Synchroniser maintenant"}
                    variant="secondary"
                    loading={sync.status === "syncing"}
                    onPress={() => void synchronizeProgressNow().catch(() => undefined)}
                    style={styles.retryButton}
                  />
                </GlassCard>

                {auth.hasEmailIdentity ? (
                  <View style={styles.sectionCard}>
                  <AppText variant="sectionLabel" tone="soft">SÉCURITÉ</AppText>
                  <Pressable style={styles.settingsRow} onPress={() => openMode("change-password")}>
                    <View style={styles.settingsIcon}>
                      <Ionicons name="key-outline" size={19} color={COLORS.text} />
                    </View>
                    <View style={styles.settingsCopy}>
                      <AppText variant="bodyStrong">Modifier le mot de passe</AppText>
                      <AppText variant="caption" tone="soft">Sécuriser l’accès à votre compte</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.soft} />
                  </Pressable>
                  <View style={styles.rowDivider} />
                  <Pressable style={styles.settingsRow} onPress={() => openMode("reset")}>
                    <View style={styles.settingsIcon}>
                      <Ionicons name="mail-unread-outline" size={19} color={COLORS.text} />
                    </View>
                    <View style={styles.settingsCopy}>
                      <AppText variant="bodyStrong">Email de récupération</AppText>
                      <AppText variant="caption" tone="soft">Recevoir un lien de réinitialisation</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.soft} />
                  </Pressable>
                  </View>
                ) : null}

                <View style={styles.secondaryActions}>
                  <ActionButton
                    label="Se déconnecter"
                    variant="secondary"
                    loading={isSubmitting}
                    onPress={requestSignOut}
                  />
                  <Pressable style={styles.deleteButton} onPress={requestDeletion} disabled={isSubmitting}>
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

            <View style={styles.sectionCard}>
              <AppText variant="sectionLabel" tone="soft">ABONNEMENT</AppText>
              <View style={styles.subscriptionStatusRow}>
                <View
                  style={[
                    styles.settingsIcon,
                    paywall.hasPremiumAccess && styles.subscriptionActiveIcon,
                  ]}
                >
                  <Ionicons
                    name={paywall.hasPremiumAccess ? "sparkles" : "diamond-outline"}
                    size={19}
                    color={paywall.hasPremiumAccess ? COLORS.green : COLORS.cyan}
                  />
                </View>
                <View style={styles.settingsCopy}>
                  <AppText variant="bodyStrong">
                    {paywall.isLoading
                      ? "Vérification de Premium…"
                      : paywall.hasPremiumAccess
                        ? "Premium actif"
                        : "K-App Premium"}
                  </AppText>
                  <AppText variant="caption" tone="soft">
                    {paywall.isDeveloperUnlocked
                      ? "Accès de développement"
                      : activePlanLabel ??
                        (paywall.hasPremiumAccess
                          ? "Accès Premium confirmé"
                          : "Découvrir tous les parcours Premium")}
                  </AppText>
                </View>
              </View>
              <ActionButton
                label={
                  paywall.hasPremiumAccess && !paywall.isDeveloperUnlocked
                    ? "Gérer mon abonnement"
                    : paywall.hasPremiumAccess
                      ? "Voir l’offre Premium"
                      : "Découvrir Premium"
                }
                variant="secondary"
                disabled={paywall.isLoading}
                onPress={handleSubscriptionAction}
                style={styles.subscriptionAction}
              />
              {paywall.error ? (
                <AppText variant="caption" style={styles.subscriptionError}>
                  {paywall.error.message}
                </AppText>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AppDialog
        visible={mode !== null}
        onRequestClose={closeDialog}
        accessibilityLabel={dialogTitle}
        accentColor={mode === "confirmation" ? COLORS.amber : COLORS.cyan}
      >
        <View style={styles.dialogHeader}>
          <View style={styles.dialogIcon}>
            <Ionicons
              name={
                mode === "confirmation"
                  ? "mail-outline"
                  : mode === "sign-in"
                    ? "log-in-outline"
                    : "shield-checkmark-outline"
              }
              size={22}
              color={mode === "confirmation" ? COLORS.amber : COLORS.cyan}
            />
          </View>
          <View style={styles.dialogHeadingCopy}>
            <AppText variant="sectionTitle">{dialogTitle}</AppText>
            <AppText variant="bodySecondary" tone="muted" style={styles.dialogSubtitle}>
              {mode === "confirmation"
                ? `Un lien a été envoyé à ${auth.confirmationEmail ?? "votre adresse"}.`
                : mode === "reset"
                  ? "Nous vous enverrons un lien sécurisé, sans révéler si le compte existe."
                  : mode === "set-password"
                    ? "Votre email est confirmé. Choisissez maintenant votre mot de passe."
                    : "Vos données locales restent disponibles pendant cette opération."}
            </AppText>
          </View>
        </View>

        {mode === "confirmation" ? (
          <View style={styles.confirmationPanel}>
            <AppText variant="body" tone="muted">
              Ouvrez le lien sur cet appareil. K-App conservera le même identifiant utilisateur et vous demandera ensuite de définir le mot de passe.
            </AppText>
          </View>
        ) : (
          <View>
            {mode === "sign-in" ? (
              <View style={styles.dialogProviders}>
                <ProviderButton
                  provider="google"
                  loading={auth.activeOAuthProvider === "google"}
                  disabled={Boolean(auth.activeOAuthProvider)}
                  onPress={() => void continueWithProvider("google", true)}
                />
                {Platform.OS === "ios" ? (
                  <ProviderButton
                    provider="apple"
                    loading={auth.activeOAuthProvider === "apple"}
                    disabled={Boolean(auth.activeOAuthProvider)}
                    onPress={() => void continueWithProvider("apple", true)}
                  />
                ) : null}
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <AppText variant="caption" tone="soft">EMAIL</AppText>
                  <View style={styles.orLine} />
                </View>
              </View>
            ) : null}
            <View style={styles.fields}>
            {requiresEmail ? (
              <Field
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="vous@exemple.com"
                autoComplete="email"
              />
            ) : null}
            {requiresPassword ? (
              <Field
                label={mode === "sign-in" ? "MOT DE PASSE" : "NOUVEAU MOT DE PASSE"}
                value={password}
                onChangeText={setPassword}
                placeholder="8 caractères minimum"
                secureTextEntry
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              />
            ) : null}
            {requiresConfirmation ? (
              <Field
                label="CONFIRMATION"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="Répétez le mot de passe"
                secureTextEntry
                autoComplete="new-password"
              />
            ) : null}
            </View>
          </View>
        )}

        {formError || auth.error ? (
          <View style={styles.formMessage}>
            <Ionicons name="alert-circle-outline" size={17} color={COLORS.red} />
            <AppText variant="bodySecondary" style={styles.formMessageCopy}>
              {formError ?? auth.error}
            </AppText>
          </View>
        ) : null}
        {formSuccess ? (
          <View style={[styles.formMessage, styles.successMessage]}>
            <Ionicons name="checkmark-circle-outline" size={17} color={COLORS.green} />
            <AppText variant="bodySecondary" style={styles.formMessageCopy}>
              {formSuccess}
            </AppText>
          </View>
        ) : null}

        <DialogActions style={styles.dialogActions}>
          {mode === "confirmation" ? (
            <ActionButton
              label="Renvoyer l’email"
              variant="secondary"
              loading={isSubmitting}
              onPress={() => {
                setIsSubmitting(true);
                setFormError(null);
                void auth
                  .resendProtectionEmail()
                  .then(() => setFormSuccess("Un nouvel email vient d’être envoyé."))
                  .catch((caught) => setFormError(friendlyCaughtMessage(caught)))
                  .finally(() => setIsSubmitting(false));
              }}
            />
          ) : (
            <ActionButton
              label={
                mode === "protect"
                  ? "Envoyer l’email de confirmation"
                  : mode === "sign-in"
                    ? "Se connecter"
                    : mode === "reset"
                      ? "Envoyer le lien"
                      : "Enregistrer le mot de passe"
              }
              loading={isSubmitting}
              onPress={() => void submit()}
            />
          )}
          {mode === "sign-in" ? (
            <ActionButton
              label="Mot de passe oublié"
              variant="ghost"
              onPress={() => {
                setPassword("");
                setFormError(null);
                setMode("reset");
              }}
            />
          ) : null}
          <ActionButton label="Fermer" variant="ghost" disabled={isSubmitting || Boolean(auth.activeOAuthProvider)} onPress={closeDialog} />
        </DialogActions>
      </AppDialog>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  orRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 2,
  },
  orLine: { flex: 1, height: 1, backgroundColor: SeoulMidnightGlass.colors.lineSoft },
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
  retryButton: { marginTop: 20 },
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
  subscriptionError: { color: COLORS.red, marginTop: 10 },
  rowDivider: {
    height: 1,
    marginLeft: 52,
    backgroundColor: SeoulMidnightGlass.colors.lineSoft,
  },
  secondaryActions: { marginTop: 22, gap: 8 },
  deleteButton: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  subscriptionWarning: { maxWidth: 460, alignSelf: "center", marginTop: 2 },
  dialogHeader: { flexDirection: "row", alignItems: "flex-start", gap: 13 },
  dialogIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,211,238,0.09)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.20)",
  },
  dialogHeadingCopy: { flex: 1 },
  dialogSubtitle: { marginTop: 5 },
  fields: { gap: 14, marginTop: 22 },
  dialogProviders: { gap: 10, marginTop: 22 },
  fieldGroup: { gap: 7 },
  inputShell: { position: "relative" },
  input: {
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.055)",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  inputWithToggle: { paddingRight: 52 },
  passwordToggle: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmationPanel: {
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(247,200,115,0.20)",
    backgroundColor: "rgba(247,200,115,0.06)",
  },
  formMessage: {
    marginTop: 14,
    padding: 11,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(251,113,133,0.08)",
  },
  successMessage: { backgroundColor: "rgba(103,232,168,0.08)" },
  formMessageCopy: { flex: 1 },
  dialogActions: { marginTop: 20 },
});
