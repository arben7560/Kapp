import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { hangulUiText } from "../../lib/i18n/hangulDisplay";

import { AppText } from "../app-text";

export function HangulReplayButton({
  accent,
  onPress,
}: {
  accent: string;
  onPress: () => void;
}) {
  const { i18n } = useTranslation("hangul");
  const uiScript = i18n.resolvedLanguage === "ja" ? "japanese" : "latin";
  return (
    <Pressable
      accessibilityLabel={hangulUiText(i18n, "replay.accessibility")}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: `${accent}70`,
          backgroundColor: `${accent}12`,
          shadowColor: accent,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconWell,
          {
            borderColor: `${accent}55`,
            backgroundColor: `${accent}20`,
          },
        ]}
      >
        <Ionicons name="volume-high" size={17} color={accent} />
      </View>
      <AppText script={uiScript} variant="caption" style={styles.label}>
        {hangulUiText(i18n, "replay.label")}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 999,
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 14,
    paddingVertical: 5,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWell: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 1,
  },
  label: {
    color: "rgba(255,255,255,0.94)",
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
