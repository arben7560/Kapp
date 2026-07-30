import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppText } from "../app-text";

export function HangulAudioBadge({
  accent,
  label,
}: {
  accent: string;
  label?: string;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={[
        styles.badge,
        label && styles.badgeWithLabel,
        {
          borderColor: `${accent}52`,
          backgroundColor: `${accent}12`,
          shadowColor: accent,
        },
      ]}
    >
      <View
        style={[
          styles.iconWell,
          {
            borderColor: `${accent}45`,
            backgroundColor: `${accent}20`,
          },
        ]}
      >
        <Ionicons name="volume-medium-outline" size={17} color={accent} />
      </View>
      {label ? (
        <AppText variant="caption" style={{ color: accent }}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: 1,
    padding: 4,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 2,
  },
  badgeWithLabel: {
    width: "auto",
    flexDirection: "row",
    gap: 7,
    paddingRight: 12,
  },
  iconWell: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
  },
});
