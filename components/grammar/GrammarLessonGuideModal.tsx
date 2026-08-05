import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  AccessibilityInfo,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ABSOLUTE_FILL } from "../../constants/layout";
import { SeoulMidnightGlass } from "../../constants/theme";
import type { GrammarLessonGuide } from "../../data/grammar/lessonGuides";
import { AppText } from "../app-text";
import { ActionButton } from "../ui/action-button";
import { AppDialog, DialogActions } from "../ui/app-dialog";
import { GrammarLessonGuide as GrammarLessonGuideContent } from "./GrammarLessonGuide";
import { useGrammarModalLayout } from "./useGrammarModalLayout";

const COLORS = SeoulMidnightGlass.colors;
const ACCENT = "#2DD4BF";

const COMPACT_HEADER_SCROLL_Y = 56;
const EXPANDED_HEADER_SCROLL_Y = 16;

type GrammarLessonGuideModalProps = React.PropsWithChildren<{
  visible: boolean;
  title: string;
  communicativeGoal: string;
  guide?: GrammarLessonGuide;
  onRequestClose: () => void;
  onAccessExercises: () => void;
}>;

export function GrammarLessonGuideModal({
  visible,
  title,
  communicativeGoal,
  guide,
  onRequestClose,
  onAccessExercises,
  children,
}: GrammarLessonGuideModalProps) {
  const [entrance] = React.useState(() => new Animated.Value(0));
  const [isHeaderCompact, setIsHeaderCompact] = React.useState(false);

  const bodyScrollRef = React.useRef<ScrollView>(null);
  const headerCompactRef = React.useRef(false);
  const layout = useGrammarModalLayout();

  const updateHeaderCompactState = React.useCallback((compact: boolean) => {
    if (headerCompactRef.current === compact) return;

    headerCompactRef.current = compact;
    setIsHeaderCompact(compact);
  }, []);

  const handleBodyScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = Math.max(0, event.nativeEvent.contentOffset.y);

      if (!headerCompactRef.current && scrollY >= COMPACT_HEADER_SCROLL_Y) {
        updateHeaderCompactState(true);
        return;
      }

      if (headerCompactRef.current && scrollY <= EXPANDED_HEADER_SCROLL_Y) {
        updateHeaderCompactState(false);
      }
    },
    [updateHeaderCompactState],
  );

  React.useEffect(() => {
    let active = true;

    if (!visible) {
      entrance.stopAnimation();
      entrance.setValue(0);
      updateHeaderCompactState(false);

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
  }, [entrance, updateHeaderCompactState, visible]);

  React.useEffect(() => {
    if (!visible) return;

    updateHeaderCompactState(false);

    const frame = requestAnimationFrame(() => {
      bodyScrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [title, updateHeaderCompactState, visible]);

  return (
    <AppDialog
      visible={visible}
      onRequestClose={onRequestClose}
      accentColor={ACCENT}
      animationType="fade"
      accessibilityLabel={`Explication de la leçon ${title}`}
      maxWidth={920}
      maxHeight={1040}
      fillAvailableHeight
      respectHorizontalSafeArea
      scrollable={false}
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
            layout.isCompactWidth && styles.heroCompact,
            layout.useWideLayout && styles.heroWide,
            layout.isShortHeight && styles.heroShort,
            layout.isVeryShortHeight && styles.heroVeryShort,
            isHeaderCompact && styles.heroCollapsed,
            isHeaderCompact &&
              layout.isCompactWidth &&
              styles.heroCollapsedCompact,
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
                isHeaderCompact && styles.closeButtonCompact,
                pressed && styles.pressed,
              ]}
            >
              <AppText aria-hidden variant="symbol" tone="muted">
                ×
              </AppText>
            </Pressable>
          </View>

          <View
            style={[
              styles.heroCopy,
              layout.isVeryShortHeight && styles.heroCopyVeryShort,
              isHeaderCompact && styles.heroCopyCollapsed,
            ]}
          >
            <View style={styles.heroTitleWrapper}>
              <AppText
                accessibilityRole="header"
                variant={
                  isHeaderCompact ||
                  layout.isCompactWidth ||
                  layout.isVeryShortHeight
                    ? "featureTitle"
                    : "screenTitle"
                }
              >
                {title}
              </AppText>
            </View>

            {!isHeaderCompact && (
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
            )}
          </View>
        </View>

        <ScrollView
          ref={bodyScrollRef}
          style={styles.bodyScroller}
          contentContainerStyle={[
            styles.body,
            layout.isCompactWidth && styles.bodyCompact,
            layout.useWideLayout && styles.bodyWide,
            layout.isShortHeight && styles.bodyShort,
          ]}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentInsetAdjustmentBehavior="never"
          scrollEventThrottle={16}
          onScroll={handleBodyScroll}
        >
          {guide ? <GrammarLessonGuideContent guide={guide} /> : children}
        </ScrollView>

        <View
          style={[
            styles.exerciseFooter,
            layout.useHorizontalFooter && styles.exerciseFooterHorizontal,
            layout.isVeryShortHeight && styles.exerciseFooterVeryShort,
          ]}
        >
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(45,212,191,0.12)", "rgba(45,212,191,0.035)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={ABSOLUTE_FILL}
          />

          <View
            style={[
              styles.exerciseCalloutTop,
              layout.useHorizontalFooter && styles.exerciseCalloutTopHorizontal,
            ]}
          >
            <View
              style={[
                styles.exerciseGlyph,
                layout.isVeryShortHeight && styles.exerciseGlyphVeryShort,
              ]}
            >
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

          <DialogActions
            style={[
              styles.actions,
              layout.useHorizontalFooter && styles.actionsHorizontal,
            ]}
          >
            <ActionButton
              label="Accéder aux exercices"
              accessibilityHint="Ferme l’explication et ouvre les exercices de cette leçon"
              size={layout.isVeryShortHeight ? "regular" : "large"}
              accentColor={ACCENT}
              onPress={onAccessExercises}
              style={styles.exerciseButton}
            />
          </DialogActions>
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
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.48,
    shadowRadius: 38,
    elevation: 20,
  },

  modalContent: {
    padding: 0,
    flex: 1,
    minHeight: 0,
  },

  animatedContent: {
    width: "100%",
    flex: 1,
    minHeight: 0,
  },

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

  heroWide: {
    minHeight: 268,
    paddingHorizontal: 30,
    paddingTop: 26,
    paddingBottom: 30,
  },

  heroShort: {
    minHeight: 190,
    paddingTop: 17,
    paddingBottom: 20,
  },

  heroVeryShort: {
    minHeight: 0,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 12,
  },

  heroCollapsed: {
    minHeight: 0,
    paddingTop: 14,
    paddingBottom: 14,
  },

  heroCollapsedCompact: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
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

  accentText: {
    color: ACCENT,
  },

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

  closeButtonCompact: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 17,
    paddingTop: 24,
    maxWidth: 690,
  },

  heroCopyVeryShort: {
    flex: 0,
    gap: 6,
    paddingTop: 5,
  },

  heroCopyCollapsed: {
    flex: 0,
    paddingTop: 10,
    gap: 0,
  },

  heroTitleWrapper: {
    minWidth: 0,
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 11,
  },

  goalRail: {
    width: 2,
    borderRadius: 2,
    backgroundColor: "rgba(45,212,191,0.62)",
  },

  goalCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  bodyScroller: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },

  body: {
    padding: 22,
    gap: 26,
  },

  bodyCompact: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    gap: 22,
  },

  bodyWide: {
    padding: 30,
    gap: 30,
  },

  bodyShort: {
    paddingVertical: 16,
  },

  exerciseFooter: {
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(45,212,191,0.28)",
    paddingHorizontal: 22,
    paddingVertical: 16,
    gap: 14,
    overflow: "hidden",
  },

  exerciseFooterHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  exerciseFooterVeryShort: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 12,
  },

  exerciseCalloutTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  exerciseCalloutTopHorizontal: {
    flex: 1,
    minWidth: 0,
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

  exerciseGlyphVeryShort: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  exerciseCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  actions: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  actionsHorizontal: {
    width: 250,
    flexShrink: 0,
  },

  exerciseButton: {
    borderRadius: 18,
    shadowColor: ACCENT,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
