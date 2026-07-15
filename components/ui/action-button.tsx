import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/app-text";
import { SeoulMidnightGlass } from "@/constants/theme";

export type ActionButtonVariant = "primary" | "secondary" | "ghost";
export type ActionButtonSize = "regular" | "large";

export type ActionButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  accentColor?: string;
  labelColor?: string;
  fullWidth?: boolean;
  loading?: boolean;
  loadingIndicatorColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function ActionButton({
  label,
  variant = "primary",
  size = "regular",
  accentColor = SeoulMidnightGlass.colors.cyan,
  labelColor,
  fullWidth = true,
  loading = false,
  loadingIndicatorColor,
  disabled,
  style,
  accessibilityLabel,
  ...pressableProps
}: ActionButtonProps) {
  const resolvedLabelColor =
    labelColor ??
    (variant === "primary"
      ? SeoulMidnightGlass.colors.premiumInk
      : SeoulMidnightGlass.colors.textStrong);
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        size === "large" ? styles.largeButton : styles.regularButton,
        fullWidth && styles.fullWidth,
        variant === "primary" && { backgroundColor: accentColor },
        variant === "secondary" && styles.secondaryButton,
        variant === "ghost" && styles.ghostButton,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={loadingIndicatorColor ?? resolvedLabelColor}
        />
      ) : (
        <AppText
          variant="button"
          align="center"
          typographyOverride={{ textTransform: "uppercase" }}
          style={{ color: resolvedLabelColor }}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 18,
  },
  regularButton: {
    minHeight: 48,
    paddingVertical: 13,
  },
  largeButton: {
    minHeight: 52,
    paddingVertical: 15,
  },
  fullWidth: {
    width: "100%",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: SeoulMidnightGlass.colors.line,
    backgroundColor: SeoulMidnightGlass.colors.surface,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.48,
  },
});
