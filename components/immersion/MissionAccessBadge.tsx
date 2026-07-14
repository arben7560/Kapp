import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppFontFamily, SeoulMidnightGlass } from "../../constants/theme";
import type { MissionAccess } from "../../lib/immersion/missions";

type MissionAccessBadgeProps = {
  access: MissionAccess;
  accent: string;
  featured?: boolean;
};

export function MissionAccessBadge({
  access,
  accent,
  featured = false,
}: MissionAccessBadgeProps) {
  const isPremium = access === "premium";
  const borderColor = isPremium
    ? SeoulMidnightGlass.colors.premiumBorder
    : featured
      ? `${accent}66`
      : `${accent}55`;
  const backgroundColor = isPremium
    ? SeoulMidnightGlass.colors.premiumSurface
    : featured
      ? `${accent}1A`
      : "rgba(255,255,255,0.07)";

  return (
    <View style={[styles.badge, { borderColor, backgroundColor }]}>
      <Text
        style={[
          styles.badgeText,
          { color: isPremium ? SeoulMidnightGlass.colors.premiumGold : accent },
        ]}
      >
        {isPremium ? "PREMIUM" : "GRATUIT"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: SeoulMidnightGlass.badge.minHeight,
    borderRadius: SeoulMidnightGlass.radii.pill,
    borderWidth: 1,
    paddingHorizontal: SeoulMidnightGlass.spacing.badgePaddingX,
    paddingVertical: SeoulMidnightGlass.spacing.badgePaddingY,
    justifyContent: "center",
  },
  badgeText: {
    fontSize: SeoulMidnightGlass.badge.fontSize,
    fontFamily: AppFontFamily.outfit.bold,
    letterSpacing: SeoulMidnightGlass.badge.letterSpacing,
  },
});
