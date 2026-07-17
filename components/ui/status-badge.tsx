import { BlurView } from "expo-blur";
import React from "react";
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
  View,
} from "react-native";

import { AppText } from "@/components/app-text";
import { SeoulMidnightGlass } from "@/constants/theme";

const colors = SeoulMidnightGlass.colors;

export type StatusBadgeTone = "neutral" | "accent" | "premium";
export type StatusBadgeAppearance = "glass" | "soft" | "solid";
export type StatusBadgeSize = "compact" | "regular";

export type StatusBadgeProps = Omit<ViewProps, "children" | "style"> & {
  label: string;
  tone?: StatusBadgeTone;
  appearance?: StatusBadgeAppearance;
  size?: StatusBadgeSize;
  accentColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  blurIntensity?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function colorWithAlpha(color: string, alpha: string, fallback: string) {
  return /^#[\da-f]{6}$/i.test(color) ? `${color}${alpha}` : fallback;
}

export function StatusBadge({
  label,
  tone = "neutral",
  appearance = "soft",
  size = "regular",
  accentColor = colors.cyan,
  borderColor,
  backgroundColor,
  textColor,
  blurIntensity,
  style,
  textStyle,
  ...viewProps
}: StatusBadgeProps) {
  const activeColor = tone === "premium" ? colors.premiumGold : accentColor;
  const resolvedTextColor =
    textColor ??
    (appearance === "solid"
      ? colors.premiumInk
      : tone === "neutral"
        ? colors.muted
        : activeColor);
  const resolvedBorderColor =
    borderColor ??
    (tone === "premium"
      ? colors.premiumBorder
      : tone === "neutral"
        ? "rgba(255,255,255,0.16)"
        : colorWithAlpha(
            activeColor,
            "66",
            "rgba(255,255,255,0.18)",
          ));
  const resolvedBackgroundColor =
    backgroundColor ??
    (appearance === "solid"
      ? activeColor
      : tone === "premium"
        ? colors.premiumSurface
        : tone === "accent"
          ? colorWithAlpha(
              activeColor,
              "1A",
              "rgba(255,255,255,0.07)",
            )
          : "rgba(255,255,255,0.06)");
  const containerStyle = [
    styles.badge,
    size === "compact" ? styles.compactBadge : styles.regularBadge,
    {
      borderColor: resolvedBorderColor,
      backgroundColor: resolvedBackgroundColor,
    },
    style,
  ];
  const content = (
    <AppText
      variant="label"
      align="center"
      style={[
        { color: resolvedTextColor },
        textStyle,
      ]}
    >
      {label}
    </AppText>
  );

  if (blurIntensity !== undefined) {
    return (
      <BlurView
        {...viewProps}
        intensity={blurIntensity}
        tint="dark"
        style={containerStyle}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View {...viewProps} style={containerStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    borderRadius: SeoulMidnightGlass.radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  compactBadge: {
    minHeight: 22,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  regularBadge: {
    minHeight: SeoulMidnightGlass.badge.minHeight,
    paddingHorizontal: SeoulMidnightGlass.spacing.badgePaddingX,
    paddingVertical: SeoulMidnightGlass.spacing.badgePaddingY,
  },
});
