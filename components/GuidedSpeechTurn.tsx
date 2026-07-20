import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { SpeechRecognitionState } from "../lib/speechRecognitionState";
import { AppText } from "./app-text";

type GuidedSpeechTurnProps = {
  accent: string;
  confirmationLabel: string | null;
  feedback: string | null;
  intentionLabels: readonly string[];
  interactionDisabled?: boolean;
  interactionDisabledLabel?: string;
  onConfirm: () => void;
  onHelp: () => void;
  onRetry: () => void;
  onStart: () => void;
  onStop: () => void;
  showChoices: boolean;
  speechState: SpeechRecognitionState;
  children: ReactNode;
};

function getStatusLabel(state: SpeechRecognitionState) {
  switch (state.status) {
    case "requesting-permission":
      return "Autorisation du micro…";
    case "starting":
      return "Activation du micro…";
    case "listening":
      return "Écoute en cours…";
    case "processing":
      return "Transcription en cours…";
    case "recognized":
      return "Transcription reconnue";
    case "permission-denied":
      return "Micro non autorisé";
    case "unavailable":
      return "Reconnaissance indisponible";
    case "empty":
      return "Aucune parole reconnue";
    case "error":
      return "Erreur du micro";
    case "idle":
      return "Réponds en coréen quand tu es prêt.";
  }
}

export function GuidedSpeechTurn({
  accent,
  confirmationLabel,
  feedback,
  intentionLabels,
  interactionDisabled = false,
  interactionDisabledLabel,
  onConfirm,
  onHelp,
  onRetry,
  onStart,
  onStop,
  showChoices,
  speechState,
  children,
}: GuidedSpeechTurnProps) {
  const isListening = speechState.status === "listening";
  const isBusy =
    interactionDisabled ||
    speechState.status === "requesting-permission" ||
    speechState.status === "starting" ||
    speechState.status === "processing";
  const canRetry =
    speechState.status !== "idle" && !isListening && !isBusy;
  const primaryLabel = interactionDisabledLabel || (isListening
    ? "Arrêter"
    : canRetry
      ? "Recommencer"
      : "Parler");
  const primaryIcon = isListening ? "stop" : "mic";
  const displayedFeedback = feedback || speechState.message;
  const needsConfirmation = confirmationLabel !== null;

  return (
    <View style={styles.container}>
      <View style={styles.intentionCard}>
        <AppText
          variant="caption"
          tone="soft"
          script="latin"
          style={[styles.eyebrow, { color: accent }]}
        >
          INTENTION EN FRANÇAIS
        </AppText>
        {intentionLabels.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.intentionRow}>
            <View style={[styles.intentionDot, { backgroundColor: accent }]} />
            <AppText
              variant="bodySecondary"
              tone="strong"
              script="latin"
              style={styles.intentionText}
            >
              {label}
            </AppText>
          </View>
        ))}
      </View>

      <View
        accessibilityLiveRegion="polite"
        style={[
          styles.statusCard,
          isListening && { borderColor: accent },
        ]}
      >
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isListening ? accent : "rgba(255,255,255,0.35)" },
            ]}
          />
          <AppText
            variant="bodyStrong"
            tone="strong"
            script="latin"
            style={styles.statusLabel}
          >
            {getStatusLabel(speechState)}
          </AppText>
        </View>

        {speechState.transcript ? (
          <View style={styles.transcriptBlock}>
            <AppText
              variant="caption"
              tone="soft"
              script="latin"
              style={styles.transcriptEyebrow}
            >
              TRANSCRIPTION
            </AppText>
            <AppText
              accessibilityLanguage="ko-KR"
              variant="koreanSecondary"
              tone="strong"
              script="korean"
              style={styles.transcriptText}
            >
              {speechState.transcript}
            </AppText>
          </View>
        ) : null}

        {displayedFeedback ? (
          <View style={styles.feedbackCard}>
            <AppText
              variant="bodySecondary"
              tone="strong"
              script="latin"
              style={styles.feedbackText}
            >
              {displayedFeedback}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {needsConfirmation ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Confirmer ${confirmationLabel}`}
              hitSlop={6}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: accent },
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                name="checkmark"
                size={20}
                color="#08080D"
              />
              <AppText
                variant="button"
                script="latin"
                align="center"
                style={styles.primaryButtonText}
              >
                Confirmer
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Recommencer"
              hitSlop={6}
              onPress={onRetry}
              style={({ pressed }) => [
                styles.helpButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                name="refresh"
                size={19}
                color="rgba(255,255,255,0.82)"
              />
              <AppText
                variant="button"
                tone="strong"
                script="latin"
                align="center"
                style={styles.helpButtonText}
              >
                Recommencer
              </AppText>
            </Pressable>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            accessibilityState={{ disabled: isBusy }}
            aria-disabled={isBusy}
            disabled={isBusy}
            hitSlop={6}
            onPress={isListening ? onStop : canRetry ? onRetry : onStart}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: accent },
              isBusy && styles.disabledButton,
              pressed && !isBusy && styles.pressedButton,
            ]}
          >
            <Ionicons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name={primaryIcon}
              size={20}
              color="#08080D"
            />
            <AppText
              variant="button"
              script="latin"
              align="center"
              style={styles.primaryButtonText}
            >
              {primaryLabel}
            </AppText>
          </Pressable>
        )}

        {!needsConfirmation && !showChoices ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Besoin d’aide"
            accessibilityState={{ disabled: interactionDisabled }}
            aria-disabled={interactionDisabled}
            disabled={interactionDisabled}
            hitSlop={6}
            onPress={onHelp}
            style={({ pressed }) => [
              styles.helpButton,
              interactionDisabled && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name="help-circle-outline"
              size={19}
              color="rgba(255,255,255,0.82)"
            />
            <AppText
              variant="button"
              tone="strong"
              script="latin"
              align="center"
              style={styles.helpButtonText}
            >
              Besoin d’aide
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {showChoices ? (
        <View style={styles.helpChoices}>
          <AppText
            variant="caption"
            tone="soft"
            script="latin"
            style={styles.helpChoicesLabel}
          >
            RÉPONSES PROPOSÉES
          </AppText>
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  intentionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.035)",
    padding: 16,
    gap: 8,
  },
  eyebrow: {
    marginBottom: 2,
  },
  intentionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  intentionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 8,
  },
  intentionText: {
    flex: 1,
  },
  statusCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(10,13,26,0.86)",
    padding: 16,
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusLabel: {
    flex: 1,
  },
  transcriptBlock: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 12,
  },
  transcriptEyebrow: {
    marginBottom: 5,
  },
  transcriptText: {
  },
  feedbackCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.30)",
    backgroundColor: "rgba(244,114,182,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackText: {
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 17,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#08080D",
  },
  helpButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  helpButtonText: {
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressedButton: {
    opacity: 0.88,
  },
  helpChoices: {
    gap: 10,
    marginTop: 4,
  },
  helpChoicesLabel: {
    marginLeft: 4,
  },
});
