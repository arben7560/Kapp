import { StyleSheet, View } from "react-native";

import { AppText } from "../app-text";
import { AppBackButton } from "../ui/app-back-button";

type GuidedMissionsHeaderProps = {
  accent: string;
  compact?: boolean;
  intro: string;
  onBack?: () => void;
  title: string;
};

export function GuidedMissionsHeader({
  accent,
  compact = false,
  intro,
  onBack,
  title,
}: GuidedMissionsHeaderProps) {
  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <AppBackButton
        accessibilityLabel={`Retour depuis les missions ${title}`}
        onPress={onBack}
        style={[styles.backButton, compact && styles.backButtonCompact]}
      />

      <View style={styles.copy}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowMarker, { backgroundColor: accent }]} />
          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={{ color: accent }}
          >
            SCÈNE GUIDÉE
          </AppText>
        </View>

        <AppText
          accessibilityRole="header"
          variant="screenTitle"
          tone="strong"
        >
          {title}
        </AppText>

        <AppText variant="body" tone="muted" style={styles.intro}>
          {intro}
        </AppText>
      </View>

      <View style={[styles.divider, compact && styles.dividerCompact]}>
        <View style={[styles.dividerAccent, { backgroundColor: accent }]} />
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 8,
    marginBottom: 26,
  },
  rootCompact: {
    paddingTop: 4,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 28,
  },
  backButtonCompact: {
    marginBottom: 20,
  },
  copy: {
    width: "100%",
    maxWidth: 620,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 9,
  },
  eyebrowMarker: {
    width: 4,
    height: 18,
    borderRadius: 999,
  },
  intro: {
    maxWidth: 580,
    marginTop: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 26,
  },
  dividerCompact: {
    marginTop: 20,
  },
  dividerAccent: {
    width: 44,
    height: 2,
    borderRadius: 999,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
