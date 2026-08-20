import { Ionicons } from "@expo/vector-icons";
import { router, type Href, usePathname } from "expo-router";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "../app-text";

const SPEAK_EXPRESSION_ROUTES = new Set([
  "/lesson/cafe",
  "/lesson/metro",
  "/lesson/restaurant",
  "/lesson/airport",
]);

type AppBackButtonProps = {
  accessibilityLabel?: string;
  fallbackHref?: Href;
  iconColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppBackButton({
  accessibilityLabel = "Retour à l’écran précédent",
  fallbackHref = "/(tabs)",
  iconColor = "#FFFFFF",
  onPress,
  style,
}: AppBackButtonProps) {
  const pathname = usePathname();

  const handlePress = () => {
    if (SPEAK_EXPRESSION_ROUTES.has(pathname)) {
      router.replace("/(tabs)/speak");
      return;
    }

    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <View style={[styles.control, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Revient à l’écran précédent"
        hitSlop={8}
        onPress={handlePress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={24} color={iconColor} />
      </Pressable>
      <AppText
        accessible={false}
        variant="caption"
        lineContract="singleLine"
        style={styles.label}
      >
        RETOUR
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  control: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  label: {
    color: "rgba(255,255,255,0.62)",
  },
});
