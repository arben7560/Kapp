import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { ABSOLUTE_FILL } from "../../constants/layout";
import { SeoulMidnightGlass } from "../../constants/theme";
import type { GrammarLessonGuide } from "../../data/grammar/lessonGuides";
import { AppText } from "../app-text";
import { ActionButton } from "../ui/action-button";
import { AppDialog, DialogActions } from "../ui/app-dialog";
import { GrammarLessonGuide as GrammarLessonGuideContent } from "./GrammarLessonGuide";

const COLORS = SeoulMidnightGlass.colors;
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
  const [entrance] = React.useState(() => new Animated.Value(0));
  const { width } = useWindowDimensions();
  const isCompact = width <= 380;

  React.useEffect(() => {
    let active = true;

    if (!visible) {
      entrance.stopAnimation();
      entrance.setValue(0);
      return () => {
        active = false;
      };
    }

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotionEnabled) => {
        if (!active) return;

        if (reduceMotionEnabled) {
          entrance.setValue(1);
          return;
        }

        entrance.setValue(0);
        Animated.spring(entrance, {
          toValue: 1,
          damping: 22,
          stiffness: 185,
          mass: 0.85,
          useNativeDriver: true,
        }).start();
      });

    return () => {
      active = false;
      entrance.stopAnimation();
    };
  }, [entrance, visible]);

  return (
    <AppDialog
      visible={visible}
      onRequestClose={onRequestClose}
      accentColor={ACCENT}
      animationType="fade"
      accessibilityLabel={`Explication de la leçon ${title}`}
      maxWidth={920}
      cardStyle={styles.modalCard}
      contentContainerStyle={styles.modalContent}
    >
      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0],
                }),
              },
              {
                scale: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.985, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.hero,
            isCompact && styles.heroCompact,
            isTablet && styles.heroTablet,
          ]}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[
              "rgba(45,212,191,0.19)",
              "rgba(45,212,191,0.045)",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.78, y: 1 }}
            style={ABSOLUTE_FILL}
          />
          <View style={styles.heroOrbLarge} />
          <View style={styles.heroOrbSmall} />

          <View style={styles.headerTopRow}>
            <View style={styles.lessonBadge}>
              <View style={styles.lessonBadgeDot} />
              <AppText variant="sectionLabel" style={styles.accentText}>
                GRAMMAIRE · MINI-LEÇON
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
              <AppText aria-hidden variant="symbol" tone="muted">
                ×
              </AppText>
            </Pressable>
          </View>

          <View style={styles.heroCopy}>
            <AppText
              accessibilityRole="header"
              variant={isCompact ? "featureTitle" : "screenTitle"}
            >
              {title}
            </AppText>
            <View style={styles.goalRow}>
              <View style={styles.goalRail} />
              <View style={styles.goalCopy}>
                <AppText variant="sectionLabel" tone="soft">
                  OBJECTIF DE LA LEÇON
                </AppText>
                <AppText variant="bodySecondary" tone="muted">
                  {communicativeGoal}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.body,
            isCompact && styles.bodyCompact,
            isTablet && styles.bodyTablet,
          ]}
        >
          {guide ? (
            <GrammarLessonGuideContent guide={guide} isTablet={isTablet} />
          ) : (
            children
          )}

          <LinearGradient
            colors={["rgba(45,212,191,0.12)", "rgba(45,212,191,0.035)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.exerciseCallout}
          >
            <View style={styles.exerciseCalloutTop}>
              <View style={styles.exerciseGlyph}>
                <AppText
                  aria-hidden
                  variant="symbol"
                  style={styles.accentText}
                  align="center"
                >
                  →
                </AppText>
              </View>
              <View style={styles.exerciseCopy}>
                <AppText variant="bodyStrong">Passe à la pratique</AppText>
                <AppText variant="bodySecondary" tone="muted">
                  Applique ces repères dans une série d’exercices guidés.
                </AppText>
              </View>
            </View>

            <DialogActions style={styles.actions}>
              <ActionButton
                label="Accéder aux exercices"
                accessibilityHint="Ferme l’explication et ouvre les exercices de cette leçon"
                size="large"
                accentColor={ACCENT}
                onPress={onAccessExercises}
                style={styles.exerciseButton}
              />
            </DialogActions>
          </LinearGradient>
        </View>
      </Animated.View>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  modalCard: {
    borderColor: "rgba(45,212,191,0.28)",
    backgroundColor: "rgba(5,7,13,0.985)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.48,
    shadowRadius: 38,
    elevation: 20,
  },
  modalContent: { padding: 0 },
  animatedContent: { width: "100%" },
  hero: {
    minHeight: 250,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    overflow: "hidden",
  },
  heroCompact: {
    minHeight: 232,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 21,
  },
  heroTablet: {
    minHeight: 268,
    paddingHorizontal: 30,
    paddingTop: 26,
    paddingBottom: 30,
  },
  heroOrbLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -112,
    top: -138,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.12)",
    backgroundColor: "rgba(45,212,191,0.025)",
  },
  heroOrbSmall: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 46,
    right: 76,
    top: 62,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  lessonBadge: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.25)",
    backgroundColor: "rgba(45,212,191,0.075)",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 1,
  },
  lessonBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  accentText: { color: ACCENT },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(2,3,6,0.38)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 17,
    paddingTop: 24,
    maxWidth: 690,
  },
  goalRow: { flexDirection: "row", alignItems: "stretch", gap: 11 },
  goalRail: {
    width: 2,
    borderRadius: 2,
    backgroundColor: "rgba(45,212,191,0.62)",
  },
  goalCopy: { flex: 1, minWidth: 0, gap: 4 },
  body: { padding: 22, gap: 26 },
  bodyCompact: { paddingHorizontal: 14, paddingVertical: 18, gap: 22 },
  bodyTablet: { padding: 30, gap: 30 },
  exerciseCallout: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.3)",
    padding: 18,
    gap: 17,
    overflow: "hidden",
  },
  exerciseCalloutTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  exerciseGlyph: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.27)",
    backgroundColor: "rgba(45,212,191,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseCopy: { flex: 1, minWidth: 0, gap: 3 },
  actions: { paddingTop: 0, paddingBottom: 0 },
  exerciseButton: {
    borderRadius: 18,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
});
