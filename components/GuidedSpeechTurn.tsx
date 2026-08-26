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

const CAFE_EXACT_FEEDBACK_REWRITES: Readonly<Record<string, string>> = {
  "Tu as cité plusieurs produits. Garde seulement celui que tu veux commander.":
    "J’ai entendu plusieurs produits dans ta réponse, donc je ne sais pas lequel tu veux réellement commander. Choisis-en un seul et redis simplement ta commande.",
  "J’entends à la fois « sur place » et « à emporter ». Choisis l’un des deux.":
    "J’ai entendu à la fois « sur place » et « à emporter ». Les deux se contredisent ici : choisis simplement l’option que tu veux.",
  "Tu as cité la carte et les espèces. Dis simplement lequel tu veux utiliser.":
    "J’ai entendu à la fois la carte et les espèces. Dis simplement lequel des deux tu veux utiliser.",
  "Ta réponse dit à la fois oui et non pour le reçu. Choisis l’un des deux.":
    "J’ai entendu à la fois une acceptation et un refus du reçu. Choisis simplement une réponse : oui ou non.",
  "Je reconnais les bons mots, mais pas dans l’ordre naturel. Dis simplement : « 먹고 갈게요. »":
    "Les bons mots sont là, mais leur ordre ne sonne pas naturel en coréen. Reprends-les simplement dans cet ordre : « 먹고 갈게요. »",
  "« 영수증이 있어요 » veut dire que tu as déjà un reçu, pas que tu en demandes un. Ici, réponds plutôt « 네, 영수증 주세요 » ou « 아니요, 괜찮아요 ».":
    "Attention au sens ici : « 영수증이 있어요 » signifie que tu as déjà un reçu, pas que tu réponds à la question du serveur. Réponds plutôt « 네, 영수증 주세요 » ou « 아니요, 괜찮아요 ».",
  "Ce produit n’est pas proposé dans cette scène. Ici, tu peux commander un americano, un jus d’orange, un latte ou un cheesecake.":
    "Ce produit n’est pas disponible dans cette scène. Pour continuer la conversation, choisis simplement parmi l’americano, le jus d’orange, le latte ou le cheesecake.",
  "Je reconnais « 먹고 » et « 갈게요 », mais la phrase reste trop mélangée pour être sûre. Reprends simplement : « 먹고 갈게요. »":
    "Je reconnais bien « 먹고 » et « 갈게요 », mais l’ordre est trop mélangé pour former une phrase naturelle. Reprends simplement : « 먹고 갈게요. »",
  "J’entends plusieurs quantités dans la même commande. Garde-en une seule avant de continuer.":
    "J’ai entendu plusieurs quantités dans la même commande. Choisis celle que tu veux vraiment donner, puis redis la commande avec une seule quantité.",
};

const CAFE_CANONICAL_ORDER_PATTERN =
  /« (아메리카노 한 잔 주세요\.|오렌지 주스 한 잔 주세요\.|라떼 한 잔 주세요\.|치즈케이크 한 조각 주세요\.) »/u;

function humanizeCafeSpeechFeedback(message: string) {
  const exactRewrite = CAFE_EXACT_FEEDBACK_REWRITES[message];
  if (exactRewrite) return exactRewrite;

  if (
    /^C’est compris\. Pour une commande complète :/u.test(message) &&
    CAFE_CANONICAL_ORDER_PATTERN.test(message)
  ) {
    return message.replace(
      /^C’est compris\. Pour une commande complète :/u,
      "Oui, ta commande est claire. Pour la formuler de façon plus complète et naturelle, tu peux dire :",
    );
  }

  if (
    /^Je t’ai compris malgré le mélange de langues \((.+)\)\. Pour rester en coréen :/u.test(
      message,
    )
  ) {
    return message.replace(
      /^Je t’ai compris malgré le mélange de langues \((.+)\)\. Pour rester en coréen :/u,
      "J’ai compris ce que tu voulais dire, même avec le mélange de langues ($1). Si tu veux rester entièrement en coréen, dis plutôt :",
    );
  }

  if (
    /^Je t’ai compris : (.+?)\. La reconnaissance a probablement accroché sur un mot ; la phrase attendue est :/u.test(
      message,
    )
  ) {
    return message.replace(
      /^Je t’ai compris : (.+?)\. La reconnaissance a probablement accroché sur un mot ; la phrase attendue est :/u,
      "Oui, j’ai bien compris : $1. Le micro a probablement mal accroché un mot. La formulation attendue ici est :",
    );
  }

  if (
    /^Je t’ai compris : (americano|jus d’orange|latte|cheesecake)\. Pour compter ce produit,/u.test(
      message,
    )
  ) {
    return message.replace(
      /^Je t’ai compris : (americano|jus d’orange|latte|cheesecake)\. Pour compter ce produit,/u,
      "Oui, j’ai bien compris que tu voulais $1. Pour compter ce produit,",
    );
  }

  if (
    /^Je pense avoir entendu « (un americano|un jus d’orange|un latte|un cheesecake|demander de répéter|sur place|à emporter) », mais je ne suis pas assez sûr\. Confirme si c’est bien ça, sinon réessaie\.$/u.test(
      message,
    )
  ) {
    return message.replace(
      /^Je pense avoir entendu « ([^»]+) », mais je ne suis pas assez sûr\. Confirme si c’est bien ça, sinon réessaie\.$/u,
      "J’ai l’impression d’avoir entendu « $1 », mais je préfère vérifier plutôt que deviner. Confirme si c’est bien ça ; sinon, réessaie.",
    );
  }

  if (
    /^Tu demandes bien de répéter, mais cette forme est familière\. Avec le personnel, préfère :/u.test(
      message,
    )
  ) {
    return message.replace(
      /^Tu demandes bien de répéter, mais cette forme est familière\. Avec le personnel, préfère :/u,
      "Oui, tu demandes bien à la personne de répéter. Cette tournure est cependant trop familière avec le personnel. Préfère :",
    );
  }

  if (
    /^Tu demandes bien de répéter\. La formule polie à retenir :/u.test(message)
  ) {
    return message.replace(
      /^Tu demandes bien de répéter\. La formule polie à retenir :/u,
      "Oui, tu demandes bien à la personne de répéter. Avec le personnel, retiens plutôt :",
    );
  }

  if (/^Tu veux rester sur place\. Réponse naturelle ici :/u.test(message)) {
    return message.replace(
      /^Tu veux rester sur place\. Réponse naturelle ici :/u,
      "Oui, tu indiques que tu restes sur place. Dans ce contexte, la tournure la plus naturelle est :",
    );
  }

  if (/^Tu veux l’emporter\. Tu peux dire naturellement :/u.test(message)) {
    return message.replace(
      /^Tu veux l’emporter\. Tu peux dire naturellement :/u,
      "Oui, tu prends la commande à emporter. Au café, tu peux dire tout simplement :",
    );
  }

  if (/^Tu veux payer par carte\. Tu peux dire simplement :/u.test(message)) {
    return message.replace(
      /^Tu veux payer par carte\. Tu peux dire simplement :/u,
      "Oui, tu choisis de payer par carte. Dans ce contexte, tu peux dire tout simplement :",
    );
  }

  if (/^Tu veux payer en espèces\. Tu peux dire simplement :/u.test(message)) {
    return message.replace(
      /^Tu veux payer en espèces\. Tu peux dire simplement :/u,
      "Oui, tu choisis de payer en espèces. Dans ce contexte, tu peux dire tout simplement :",
    );
  }

  if (/^Tu veux le reçu\. Tu peux répondre :/u.test(message)) {
    return message.replace(
      /^Tu veux le reçu\. Tu peux répondre :/u,
      "Oui, tu veux le reçu. La réponse la plus simple ici est :",
    );
  }

  if (/^Tu ne veux pas le reçu\. Tu peux répondre simplement :/u.test(message)) {
    return message.replace(
      /^Tu ne veux pas le reçu\. Tu peux répondre simplement :/u,
      "D’accord, tu refuses le reçu. Tu peux répondre naturellement :",
    );
  }

  if (
    /^(Je t’ai compris\.|Je t’ai compris, mais|Ça se comprend, mais|Je comprends l’idée, mais|L’intention est claire, mais|On te comprend\.)/u.test(
      message,
    ) &&
    /(아메리카노|오렌지 주스|라떼|치즈케이크|먹고 갈게요|포장해 주세요|테이크아웃이요|카드로 할게요|현금으로 할게요|영수증 주세요|아니요, 괜찮아요|조각|잔)/u.test(
      message,
    )
  ) {
    return message
      .replace(/^Je t’ai compris, mais /u, "Je vois ce que tu veux dire. ")
      .replace(/^Je t’ai compris\./u, "Oui, je vois ce que tu veux dire.")
      .replace(/^Ça se comprend, mais /u, "La phrase se comprend bien. ")
      .replace(/^Je comprends l’idée, mais /u, "L’idée est bonne. ")
      .replace(/^L’intention est claire, mais /u, "Oui, ton intention est claire. ")
      .replace(/^On te comprend\./u, "Oui, la réponse est compréhensible.");
  }

  return message;
}

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
      ? "Réessayer"
      : "Parler");
  const primaryIcon = isListening ? "stop" : "mic";
  const displayedFeedback = feedback
    ? humanizeCafeSpeechFeedback(feedback)
    : speechState.message;
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
          CE QUE TU VEUX DIRE
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
              accessibilityLabel="Réessayer"
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
                Réessayer
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