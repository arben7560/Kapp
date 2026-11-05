import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { IMMERSIVE_MIN_TOUCH_TARGET } from "../../constants/immersive-layout";
import { EXERCISES_BY_KIND, type ExerciseKind } from "../../data/listen/activeExercises";
import type { DailyStreakCompletionResult } from "../../lib/dailyStreak";
import { resolveDisplayMessage, type DisplayMessage } from "../../lib/i18n/displayText";
import { getListenTrainingNextAction } from "../../lib/listenTrainingCompletion";
import { AppText } from "../app-text";

type NewDailyStreakResult = Exclude<DailyStreakCompletionResult, "already_completed">;
type ListeningKey = Extract<DisplayMessage, { namespace: "listening" }>["key"];

type Props = Readonly<{
  trainingKind: ExerciseKind;
  visible: boolean;
  streakOutcome: NewDailyStreakResult | null;
  onClose: () => void;
  onRestart: () => void;
  onNext: () => void;
}>;

const ACCENT = "#A855F7";
const TEXT = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.70)";
export function ListenTrainingCompletionModal({
  trainingKind,
  visible,
  streakOutcome,
  onClose,
  onRestart,
  onNext,
}: Props) {
  const { i18n } = useTranslation("listening");
  const uiScript = i18n.resolvedLanguage === "ja" ? "japanese" : "latin";
  const l = (key: ListeningKey, values?: Record<string, string | number>) =>
    resolveDisplayMessage({ namespace: "listening", key, values }, i18n);
  const summary = {
    title: l(`summary.trainings.${trainingKind}.title` as ListeningKey),
    achievement: l(`summary.trainings.${trainingKind}.achievement` as ListeningKey),
    learning: l(`summary.trainings.${trainingKind}.learning` as ListeningKey),
  };
  const totalQuestions = EXERCISES_BY_KIND[trainingKind].length;
  const nextKind = getListenTrainingNextAction(trainingKind).nextKind;
  const nextTitle = l(`summary.trainings.${nextKind}.title` as ListeningKey);
  const nextActionLabel = l(trainingKind === "reaction" ? "summary.back" : "summary.next", { title: nextTitle });
  const streakTitle = l(streakOutcome === "completed_with_freeze"
    ? "summary.freezeTitle" : streakOutcome === "restarted" ? "summary.restartTitle" : "summary.doneTitle");
  const streakDescription = l(streakOutcome === "completed_with_freeze"
    ? "summary.freezeDescription" : "summary.doneDescription");

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
              <AppText script={uiScript} variant="caption" tone="premium" style={styles.eyebrow}>
                {l("summary.header", { title: uiScript === "japanese" ? summary.title : summary.title.toUpperCase() })}
              </AppText>
              <AppText script={uiScript} variant="sectionTitle" tone="strong">
                {l("summary.heading")}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={l("summary.close", { title: summary.title })}
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
              <AppText script={uiScript} variant="sectionTitle" tone="strong" align="center">
                {l("summary.congratulations")}
              </AppText>
              <AppText script={uiScript}
                variant="bodySecondary"
                tone="muted"
                align="center"
                style={styles.heroDescription}
              >
                {summary.achievement}
              </AppText>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <AppText script={uiScript} variant="bodyStrong" tone="strong">
                  {l("summary.progress")}
                </AppText>
                <AppText script={uiScript} variant="bodyStrong" style={styles.accentText}>
                  {totalQuestions} / {totalQuestions}
                </AppText>
              </View>
              <View
                style={styles.progressSegments}
                accessible
                accessibilityLabel={l("summary.progressA11y", { total: totalQuestions })}
              >
                {Array.from({ length: totalQuestions }, (_, index) => (
                  <View key={index} style={styles.progressSegment} />
                ))}
              </View>
              <View style={styles.inlineRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#A3E4BF" />
                <AppText script={uiScript} variant="caption" tone="muted" style={styles.flexText}>
                  {l("summary.allValidated")}
                </AppText>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.inlineRow}>
                <Ionicons name="book-outline" size={20} color="#C4A3FF" />
                <AppText script={uiScript} variant="bodyStrong" tone="strong" style={styles.flexText}>
                  {l("summary.learned")}
                </AppText>
              </View>
              <AppText script={uiScript} variant="bodySecondary" tone="muted">
                {summary.learning}
              </AppText>
            </View>

            {streakOutcome !== null ? (
              <View style={styles.streakCard}>
                <View style={styles.inlineRow}>
                  <Ionicons name="flame" size={21} color="#D5B6FF" />
                  <View style={styles.flexText}>
                    <AppText script={uiScript} variant="bodyStrong" tone="strong">
                      {streakTitle}
                    </AppText>
                    <AppText script={uiScript} variant="caption" style={styles.mutedText}>
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
              accessibilityLabel={nextActionLabel}
              onPress={onNext}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <AppText script={uiScript} variant="button" style={styles.primaryActionText}>
                {nextActionLabel}
              </AppText>
              <Ionicons name="arrow-forward" size={19} color="#050508" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={l("summary.restartA11y", { title: summary.title })}
              onPress={onRestart}
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="refresh" size={18} color={TEXT} />
              <AppText script={uiScript} variant="button" tone="strong">
                {l("summary.restart", { title: summary.title })}
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
