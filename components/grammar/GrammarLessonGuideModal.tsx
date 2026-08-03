import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { GrammarLessonGuide } from "../../data/grammar/lessonGuides";
import { AppText } from "../app-text";
import { ActionButton } from "../ui/action-button";
import { AppDialog, DialogActions } from "../ui/app-dialog";
import { GrammarLessonGuide as GrammarLessonGuideContent } from "./GrammarLessonGuide";

const ACCENT = "#2DD4BF";

type GrammarLessonGuideModalProps = React.PropsWithChildren<{
  visible: boolean;
  title: string;
  communicativeGoal: string;
  guide?: GrammarLessonGuide;
  isTablet: boolean;
  onRequestClose: () => void;
  onAccessExercises: () => void;
}>;

export function GrammarLessonGuideModal({
  visible,
  title,
  communicativeGoal,
  guide,
  isTablet,
  onRequestClose,
  onAccessExercises,
  children,
}: GrammarLessonGuideModalProps) {
  return (
    <AppDialog
      visible={visible}
      onRequestClose={onRequestClose}
      accentColor={ACCENT}
      animationType="slide"
      accessibilityLabel={`Explication de la leçon ${title}`}
      maxWidth={900}
      cardStyle={styles.modalCard}
      contentContainerStyle={styles.modalContent}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <AppText variant="sectionLabel" style={styles.accentText}>
            MINI-LEÇON
          </AppText>
          <AppText accessibilityRole="header" variant="featureTitle">
            {title}
          </AppText>
          <AppText variant="bodySecondary" tone="muted">
            {communicativeGoal}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer l’explication"
          hitSlop={8}
          onPress={onRequestClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.pressed,
          ]}
        >
          <AppText aria-hidden variant="symbol" tone="muted">×</AppText>
        </Pressable>
      </View>

      {guide ? (
        <GrammarLessonGuideContent guide={guide} isTablet={isTablet} />
      ) : (
        children
      )}

      <DialogActions style={styles.actions}>
        <ActionButton
          label="Accéder aux exercices"
          size="large"
          accentColor={ACCENT}
          onPress={onAccessExercises}
        />
      </DialogActions>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  modalCard: { borderColor: "rgba(45,212,191,0.25)" },
  modalContent: { gap: 22 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  headerCopy: { flex: 1, minWidth: 0, gap: 5 },
  accentText: { color: ACCENT },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.055)",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
