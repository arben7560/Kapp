import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IMMERSIVE_MIN_TOUCH_TARGET } from "../../constants/immersive-layout";
import type { DailyStreakCompletionResult } from "../../lib/dailyStreak";
import { AppText } from "../app-text";

type NewDailyStreakResult = Exclude<DailyStreakCompletionResult, "already_completed">;

type Props = Readonly<{
  visible: boolean;
  streakOutcome: NewDailyStreakResult | null;
  onClose: () => void;
  onRestart: () => void;
  onNext: () => void;
}>;

const ACCENT = "#A855F7";
const TEXT = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.70)";
const TOTAL_QUESTIONS = 5;

export function OrthographyCompletionModal({
  visible,
  streakOutcome,
  onClose,
  onRestart,
  onNext,
}: Props) {
  const streakTitle =
    streakOutcome === "completed_with_freeze"
      ? "Série protégée"
      : streakOutcome === "restarted"
        ? "Nouvelle série commencée"
        : "Journée validée";

  const streakDescription =
    streakOutcome === "completed_with_freeze"
      ? "Une protection a préservé ta série."
      : "Ton activité du jour est enregistrée.";

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <AppText variant="caption" tone="premium" style={styles.eyebrow}>
                ÉCOUTE · ORTHOGRAPHE
              </AppText>
              <AppText variant="sectionTitle" tone="strong">
                Entraînement terminé
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer le bilan d'orthographe"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={TEXT} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.hero}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={44} color="#C4A3FF" />
              </View>
              <AppText variant="sectionTitle" tone="strong" align="center">
                Bien joué !
              </AppText>
              <AppText
                variant="bodySecondary"
                tone="muted"
                align="center"
                style={styles.heroDescription}
              >
                Tu as reconnu les cinq phrases coréennes de cet entraînement.
              </AppText>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <AppText variant="bodyStrong" tone="strong">
                  Ta progression
                </AppText>
                <AppText variant="bodyStrong" style={styles.accentText}>
                  5 / 5
                </AppText>
              </View>
              <View style={styles.progressSegments} accessible accessibilityLabel="5 questions validées sur 5">
                {Array.from({ length: TOTAL_QUESTIONS }, (_, index) => (
                  <View key={index} style={styles.progressSegment} />
                ))}
              </View>
              <View style={styles.inlineRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#A3E4BF" />
                <AppText variant="caption" tone="muted" style={styles.flexText}>
                  Toutes les questions sont validées.
                </AppText>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.inlineRow}>
                <Ionicons name="book-outline" size={20} color="#C4A3FF" />
                <AppText variant="bodyStrong" tone="strong" style={styles.flexText}>
                  Ce que tu as travaillé
                </AppText>
              </View>
              <AppText variant="bodySecondary" tone="muted">
                Identifier des phrases courantes à l'oreille, distinguer des
                expressions proches et reconnaître leur écriture en hangul.
              </AppText>
            </View>

            {streakOutcome !== null ? (
              <View style={styles.streakCard}>
                <View style={styles.inlineRow}>
                  <Ionicons name="flame" size={21} color="#D5B6FF" />
                  <View style={styles.flexText}>
                    <AppText variant="bodyStrong" tone="strong">
                      {streakTitle}
                    </AppText>
                    <AppText variant="caption" style={styles.mutedText}>
                      {streakDescription}
                    </AppText>
                  </View>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Passer à l'entraînement Situation"
              onPress={onNext}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <AppText variant="button" style={styles.primaryActionText}>
                Passer à Situation
              </AppText>
              <Ionicons name="arrow-forward" size={19} color="#050508" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Recommencer l'entraînement Orthographe"
              onPress={onRestart}
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="refresh" size={18} color={TEXT} />
              <AppText variant="button" tone="strong">
                Recommencer Orthographe
              </AppText>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.68)",
  },
  sheet: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 680,
    maxHeight: "92%",
    backgroundColor: "#0A0D1A",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerText: { flex: 1, paddingRight: 12, gap: 5 },
  eyebrow: { color: "#C4A3FF" },
  closeButton: {
    width: IMMERSIVE_MIN_TOUCH_TARGET,
    height: IMMERSIVE_MIN_TOUCH_TARGET,
    borderRadius: IMMERSIVE_MIN_TOUCH_TARGET / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  content: { padding: 20, gap: 14 },
  hero: { alignItems: "center", paddingVertical: 8, gap: 10 },
  successIcon: {
    borderRadius: 100,
    padding: 13,
    backgroundColor: "rgba(168,85,247,0.12)",
  },
  heroDescription: { maxWidth: 330 },
  card: {
    gap: 13,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  accentText: { color: "#C4A3FF" },
  progressSegments: { flexDirection: "row", gap: 5, height: 7 },
  progressSegment: { flex: 1, borderRadius: 10, backgroundColor: ACCENT },
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  flexText: { flex: 1 },
  mutedText: { color: MUTED, marginTop: 3 },
  streakCard: {
    borderRadius: 18,
    padding: 15,
    backgroundColor: "rgba(168,85,247,0.075)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
  },
  actions: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  primaryAction: {
    minHeight: IMMERSIVE_MIN_TOUCH_TARGET,
    borderRadius: 16,
    backgroundColor: ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryActionText: { color: "#050508" },
  secondaryAction: {
    minHeight: IMMERSIVE_MIN_TOUCH_TARGET,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pressed: { opacity: 0.85 },
});
