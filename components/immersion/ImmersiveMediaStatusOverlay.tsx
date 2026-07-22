import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { ImmersiveMediaStatus } from "../../hooks/useImmersiveMediaStatus";
import { AppText } from "../app-text";

type Props = Readonly<{
  status: ImmersiveMediaStatus;
}>;

export function ImmersiveMediaStatusOverlay({ status }: Props) {
  if (status === "idle" || status === "ready") return null;

  const isError = status === "error";

  return (
    <View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={styles.overlay}
    >
      {isError ? null : <ActivityIndicator color="#FFFFFF" size="small" />}
      <AppText
        variant="caption"
        tone="strong"
        script="latin"
        align="center"
      >
        {isError
          ? "Média indisponible · La scène continue"
          : "Chargement du média…"}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
    backgroundColor: "rgba(5,5,8,0.48)",
  },
});
