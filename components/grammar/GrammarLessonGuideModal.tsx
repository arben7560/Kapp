import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ABSOLUTE_FILL } from "../../constants/layout";
import {
  HubModuleAccents,
  SeoulMidnightGlass,
} from "../../constants/theme";
import type { GrammarLessonGuide } from "../../data/grammar/lessonGuides";
import { AppText } from "../app-text";
import { ActionButton } from "../ui/action-button";
import { AppDialog, DialogActions } from "../ui/app-dialog";
import { GrammarLessonGuide as GrammarLessonGuideContent } from "./GrammarLessonGuide";
import { useGrammarModalLayout } from "./useGrammarModalLayout";

const COLORS = SeoulMidnightGlass.colors;
const GRAMMAR_ACCENT = HubModuleAccents.grammar;

const COMPACT_HEADER_SCROLL_Y = 72;
const EXPANDED_HEADER_SCROLL_Y = 1;
const HEADER_ANIMATION_DURATION = 320;
const HEADER_EXPANSION_LOCK_DURATION = 380;

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
  const [headerProgress] = React.useState(() => new Animated.Value(0));
  const [isHeaderCompact, setIsHeaderCompact] = React.useState(false);

  const bodyScrollRef = React.useRef<ScrollView>(null);
  const headerCompactRef = React.useRef(false);
  const compactStartedAtRef = React.useRef(0);
  const previousScrollYRef = React.useRef(0);

  const layout = useGrammarModalLayout();

  const updateHeaderCompactState = React.useCallback(
    (compact: boolean, animated = true) => {
      if (headerCompactRef.current === compact) return;

      headerCompactRef.current = compact;
      setIsHeaderCompact(compact);

      if (compact) {
        compactStartedAtRef.current = Date.now();
      }

      headerProgress.stopAnimation();

      if (!animated) {
        headerProgress.setValue(compact ? 1 : 0);
        return;
      }

      Animated.timing(headerProgress, {
        toValue: compact ? 1 : 0,
        duration: HEADER_ANIMATION_DURATION,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: false,
      }).start();
    },
    [headerProgress],
  );

  const handleBodyScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = Math.max(0, event.nativeEvent.contentOffset.y);
      const previousScrollY = previousScrollYRef.current;
      const isScrollingUp = scrollY < previousScrollY;

      previousScrollYRef.current = scrollY;

      if (!headerCompactRef.current && scrollY >= COMPACT_HEADER_SCROLL_Y) {
        updateHeaderCompactState(true);
        return;
      }

      if (!headerCompactRef.current) return;

      const compactDuration = Date.now() - compactStartedAtRef.current;
      const expansionUnlocked =
        compactDuration >= HEADER_EXPANSION_LOCK_DURATION;

      if (
        expansionUnlocked &&
        isScrollingUp &&
        scrollY <= EXPANDED_HEADER_SCROLL_Y
      ) {
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

      previousScrollYRef.current = 0;
      compactStartedAtRef.current = 0;
      updateHeaderCompactState(false, false);

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

    previousScrollYRef.current = 0;
    compactStartedAtRef.current = 0;
    updateHeaderCompactState(false, false);

    const frame = requestAnimationFrame(() => {
      bodyScrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [title, updateHeaderCompactState, visible]);

  const expandedHeroHeight = layout.isVeryShortHeight
    ? 150
    : layout.isShortHeight
      ? 190
      : layout.useWideLayout
        ? 268
        : layout.isCompactWidth
          ? 232
          : 250;

  const compactHeroHeight = layout.isCompactWidth ? 118 : 126;

  const expandedHeroPaddingTop = layout.isVeryShortHeight
    ? 11
    : layout.isShortHeight
      ? 17
      : layout.useWideLayout
        ? 26
        : layout.isCompactWidth
          ? 17
          : 22;

  const expandedHeroPaddingBottom = layout.isVeryShortHeight
    ? 12
    : layout.isShortHeight
      ? 20
      : layout.useWideLayout
        ? 30
        : layout.isCompactWidth
          ? 21
          : 26;

  const expandedTitlePaddingTop = layout.isVeryShortHeight ? 5 : 24;

  const animatedHeroHeight = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [expandedHeroHeight, compactHeroHeight],
  });

  const animatedHeroPaddingTop = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [expandedHeroPaddingTop, 12],
  });

  const animatedHeroPaddingBottom = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [expandedHeroPaddingBottom, 12],
  });

  const animatedTitlePaddingTop = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [expandedTitlePaddingTop, 8],
  });

  const animatedTitleScale = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.88],
  });

  const animatedTitleTranslateY = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const animatedGoalOpacity = headerProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0, 0],
  });

  const animatedGoalHeight = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [88, 0],
  });

  const animatedGoalMarginTop = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [17, 0],
  });

  const animatedOrbOpacity = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.55],
  });

  return (
    <AppDialog
      visible={visible}
      onRequestClose={onRequestClose}
      accentColor={GRAMMAR_ACCENT.base}
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
        <Animated.View
          style={[
            styles.hero,
            layout.isCompactWidth && styles.heroCompact,
            layout.useWideLayout && styles.heroWide,
            layout.isShortHeight && styles.heroShort,
            layout.isVeryShortHeight && styles.heroVeryShort,
            {
              height: animatedHeroHeight,
              paddingTop: animatedHeroPaddingTop,
              paddingBottom: animatedHeroPaddingBottom,
            },
          ]}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[
              GRAMMAR_ACCENT.surfaceStrong,
              GRAMMAR_ACCENT.decorative,
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.78, y: 1 }}
            style={ABSOLUTE_FILL}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.heroDecoration,
              {
                opacity: animatedOrbOpacity,
              },
            ]}
          >
            <View style={styles.heroOrbLarge} />
            <View style={styles.heroOrbSmall} />
          </Animated.View>

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

          <Animated.View
            style={[
              styles.heroCopy,
              layout.isVeryShortHeight && styles.heroCopyVeryShort,
              {
                paddingTop: animatedTitlePaddingTop,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.heroTitleWrapper,
                {
                  transform: [
                    {
                      translateY: animatedTitleTranslateY,
                    },
                    {
                      scale: animatedTitleScale,
                    },
                  ],
                },
              ]}
            >
              <AppText
                accessibilityRole="header"
                variant={
                  layout.isCompactWidth || layout.isVeryShortHeight
                    ? "featureTitle"
                    : "screenTitle"
                }
              >
                {title}
              </AppText>
            </Animated.View>

            <Animated.View
              pointerEvents={isHeaderCompact ? "none" : "auto"}
              accessibilityElementsHidden={isHeaderCompact}
              importantForAccessibility={
                isHeaderCompact ? "no-hide-descendants" : "auto"
              }
              style={[
                styles.goalAnimatedContainer,
                {
                  opacity: animatedGoalOpacity,
                  maxHeight: animatedGoalHeight,
                  marginTop: animatedGoalMarginTop,
                },
              ]}
            >
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
            </Animated.View>
          </Animated.View>
        </Animated.View>

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
            colors={[GRAMMAR_ACCENT.surface, GRAMMAR_ACCENT.decorative]}
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
              accentColor={GRAMMAR_ACCENT.base}
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
    borderColor: GRAMMAR_ACCENT.cardBorder,
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
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    overflow: "hidden",
  },

  heroCompact: {
    paddingHorizontal: 17,
  },

  heroWide: {
    paddingHorizontal: 30,
  },

  heroShort: {
    paddingHorizontal: 24,
  },

  heroVeryShort: {
    paddingHorizontal: 16,
  },

  heroDecoration: {
    ...StyleSheet.absoluteFillObject,
  },

  heroOrbLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -112,
    top: -138,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: GRAMMAR_ACCENT.decorative,
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
    borderColor: GRAMMAR_ACCENT.selectedShadow,
    backgroundColor: GRAMMAR_ACCENT.rain,
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
    backgroundColor: GRAMMAR_ACCENT.base,
  },

  accentText: {
    color: GRAMMAR_ACCENT.base,
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

  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 0,
    paddingTop: 24,
    maxWidth: 690,
  },

  heroCopyVeryShort: {
    flex: 0,
  },

  heroTitleWrapper: {
    minWidth: 0,
    alignSelf: "flex-start",
    transformOrigin: "left bottom",
  },

  goalAnimatedContainer: {
    overflow: "hidden",
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 11,
  },

  goalRail: {
    width: 2,
    borderRadius: 2,
    backgroundColor: GRAMMAR_ACCENT.mutedText,
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
    borderTopColor: GRAMMAR_ACCENT.cardBorder,
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
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: GRAMMAR_ACCENT.surface,
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
    shadowColor: GRAMMAR_ACCENT.base,
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
