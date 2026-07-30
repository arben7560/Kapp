import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import type { ImmersiveVideoPlaybackStatus } from "../../hooks/useImmersiveVideoLifecycle";
import { AppText } from "../app-text";

type Props = Readonly<{
  onExit?: () => void;
  onResume?: () => void;
  onRetry?: () => void;
  status: ImmersiveVideoPlaybackStatus;
}>;

export function ImmersiveMediaStatusOverlay({
  onExit,
  onResume,
  onRetry,
  status,
}: Props) {
  if (
    status === "idle" ||
    status === "loaded" ||
    status === "playing" ||
    status === "ended"
  ) {
    return null;
  }

  const isError = status === "error";
  const isInterrupted = status === "interrupted";

  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.overlay}
    >
      {isError || isInterrupted ? null : (
        <ActivityIndicator color="#FFFFFF" size="small" />
      )}
      <AppText
        variant="caption"
        tone="strong"
        script="latin"
        align="center"
      >
        {isError
          ? "Impossible de lire la vidéo"
          : isInterrupted
            ? "Lecture interrompue"
          : "Chargement du média…"}
      </AppText>

      {isInterrupted && onResume ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reprendre la vidéo"
          onPress={onResume}
          style={styles.primaryAction}
        >
          <AppText variant="button" tone="strong">
            Reprendre
          </AppText>
        </Pressable>
      ) : null}

      {isError ? (
        <View style={styles.actions}>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Réessayer la vidéo"
              onPress={onRetry}
              style={styles.primaryAction}
            >
              <AppText variant="button" tone="strong">
                Réessayer
              </AppText>
            </Pressable>
          ) : null}
          {onExit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quitter la scène"
              onPress={onExit}
              style={styles.secondaryAction}
            >
              <AppText variant="button" tone="strong">
                Quitter la scène
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
  actions: {
    alignItems: "center",
    gap: 8,
  },
  primaryAction: {
    minHeight: 44,
    minWidth: 116,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: "rgba(124,58,237,0.92)",
    paddingHorizontal: 16,
  },
  secondaryAction: {
    minHeight: 44,
    minWidth: 142,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(5,5,8,0.78)",
    paddingHorizontal: 16,
  },
});
