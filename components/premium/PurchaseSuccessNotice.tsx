import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppText } from "../app-text";
import { useAuth } from "../../lib/AuthProvider";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import type { PurchaseNotice } from "../../lib/paywall/types";

export function PurchaseSuccessNotice() {
  const { t } = useTranslation("premium");
  const { user } = useAuth();
  const { takePurchaseNotice, hasPremiumAccess } = usePaywall();
  const [focused, setFocused] = React.useState(false);
  const [notice, setNotice] = React.useState<PurchaseNotice | null>(null);
  const [opacity] = React.useState(() => new Animated.Value(0));

  useFocusEffect(React.useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));

  React.useEffect(() => {
    const next = focused ? takePurchaseNotice() : null;
    // Synchronize the external one-shot purchase queue with navigation focus.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotice((current) => focused ? next ?? (current?.userId === user?.id ? current : null) : null);
  }, [focused, takePurchaseNotice, user?.id]);

  const visible = focused && notice?.userId === user?.id && !!notice && hasPremiumAccess;
  React.useEffect(() => {
    if (!visible) return;
    let active = true;
    opacity.setValue(0);
    void AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then((reduceMotion) => {
      if (!active) return;
      if (reduceMotion) opacity.setValue(1);
      else Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
    const timer = setTimeout(() => setNotice(null), 6_000);
    return () => { active = false; clearTimeout(timer); opacity.stopAnimation(); };
  }, [visible, notice, opacity]);

  if (!visible) return null;
  return (
    <Animated.View accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.card, { opacity }]}>
      <Ionicons name="checkmark-circle" color="#67E8A8" size={22} />
      <View style={styles.copy}>
        <AppText variant="bodyStrong" style={styles.title}>{t("purchaseSuccess.title")}</AppText>
        <AppText variant="bodySecondary" tone="muted">{t("purchaseSuccess.message")}</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(103,232,168,0.3)",
    backgroundColor: "rgba(103,232,168,0.10)",
  },
  copy: { flex: 1, gap: 4 },
  title: { color: "#67E8A8" },
});
