import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Check,
  ChevronRight,
  LockKeyhole
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { AppBackButton } from "../../../components/ui/app-back-button";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { HubModuleAccents, SeoulMidnightGlass } from "../../../constants/theme";
import { HANGUL_MODULES as HANGUL_CURRICULUM_MODULES } from "../../../data/hangul/curriculum";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.jpg");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SEOUL MIDNIGHT GLASS / HANGUL
// ──────────────────────────────────────────────

const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;

const MUTED = "rgba(241,245,249,0.70)";
const SOFT = "rgba(241,245,249,0.48)";
const VERY_SOFT = "rgba(241,245,249,0.34)";
const HAIRLINE = "rgba(255,255,255,0.085)";

const HANGUL_ACCENT = HubModuleAccents.hangul.base;

const HANGUL_SECONDARY = "#5EEAD4";
const SUCCESS_ACCENT = "#2DD4BF";
const ASSESSMENT_ACCENT = "#FDE047";

const FUTURE_ACCENT = "rgba(148,163,184,0.42)";
const FUTURE_TEXT = "rgba(241,245,249,0.46)";

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────

type HangulHubModule = {
  id: string;
  title: string;
  sub: string;
  icon: string;
  href: string;
  isLocked?: boolean;
  kind?: "lesson" | "assessment" | "bridge";
};

type Requirement = {
  title: string;
  route: string;
};

// ──────────────────────────────────────────────
// MODULES
// ──────────────────────────────────────────────

const HANGUL_MODULES: HangulHubModule[] = [
  ...HANGUL_CURRICULUM_MODULES.map((module) => ({
    id: module.id,
    title: module.title,
    sub: module.subtitle,
    href: module.route,
    icon: module.icon,
    isLocked: false,
    kind: "lesson" as const,
  })),

  {
    id: "hangul_assessment",
    title: "Évaluation Hangul",
    sub: "Décodage cumulatif sans romanisation",
    href: "/(tabs)/hangul/assessment",
    icon: "한",
    isLocked: false,
    kind: "assessment",
  },

  {
    id: "hangul_bridge",
    title: "Lecture guidée",
    sub: "Lecture guidée, vocabulaire et écoute lente",
    href: "/(tabs)/hangul/bridge",
    icon: "읽",
    isLocked: false,
    kind: "bridge",
  },
];

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

function getModuleCompletion(
  module: HangulHubModule,
  progress: any,
  assessmentPassed: boolean,
) {
  if (module.id === "hangul_assessment") {
    return assessmentPassed;
  }

  return !!progress.completed?.[module.id];
}

function getModuleProgress(
  module: HangulHubModule,
  progress: any,
  assessmentPassed: boolean,
) {
  if (getModuleCompletion(module, progress, assessmentPassed)) {
    return 1;
  }

  if (module.kind !== "lesson") {
    return 0;
  }

  const curriculumModule = HANGUL_CURRICULUM_MODULES.find(
    (candidate) => candidate.id === module.id,
  );

  if (!curriculumModule || curriculumModule.scenes.length === 0) {
    return 0;
  }

  const lesson = progress.hangulProgress?.lessons?.[module.id];

  const completedScenes = curriculumModule.scenes.filter(
    (scene) => !!lesson?.completedScenes?.[scene.id],
  ).length;

  return Math.min(1, completedScenes / curriculumModule.scenes.length);
}

function getCurrentSceneTitle(module: HangulHubModule, progress: any) {
  if (module.kind !== "lesson") {
    return null;
  }

  const curriculumModule = HANGUL_CURRICULUM_MODULES.find(
    (candidate) => candidate.id === module.id,
  );

  if (!curriculumModule) {
    return null;
  }

  const lesson = progress.hangulProgress?.lessons?.[module.id];

  const sceneId = lesson?.activeQuiz?.sceneId ?? lesson?.currentSceneId;

  if (sceneId) {
    const currentScene = curriculumModule.scenes.find(
      (scene) => scene.id === sceneId,
    );

    if (currentScene) {
      return currentScene.title;
    }
  }

  const nextScene = curriculumModule.scenes.find(
    (scene) => !lesson?.completedScenes?.[scene.id],
  );

  return nextScene?.title ?? null;
}

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────

export default function HangulHub() {
  const { progress } = useStore();

  const responsive = useResponsiveLayout({
    maxWidth: 920,
  });

  const gridColumns = responsive.getColumns({
    minColumnWidth: 330,
    maxColumns: 2,
    gap: responsive.gridGap,
  });

  const gridItemWidth = responsive.getGridItemWidth(
    gridColumns,
    responsive.gridGap,
  );

  const displayLevel = Math.max(1, progress?.hangulLevel ?? 1);

  const assessmentPassed = !!progress.hangulProgress?.assessment?.passed;

  const requiredBefore = (index: number): Requirement | undefined => {
    if (index === 0) {
      return undefined;
    }

    if (index < HANGUL_CURRICULUM_MODULES.length) {
      const previous = HANGUL_CURRICULUM_MODULES[index - 1];

      return progress.completed?.[previous.id]
        ? undefined
        : {
            title: previous.title,
            route: previous.route,
          };
    }

    // Assessment
    if (index === HANGUL_CURRICULUM_MODULES.length) {
      const missing = HANGUL_CURRICULUM_MODULES.find(
        (module) => !progress.completed?.[module.id],
      );

      return missing
        ? {
            title: missing.title,
            route: missing.route,
          }
        : undefined;
    }

    // Guided reading
    return assessmentPassed
      ? undefined
      : {
          title: "l’évaluation Hangul",
          route: "/(tabs)/hangul/assessment",
        };
  };

  const moduleStates = HANGUL_MODULES.map((module, index) => ({
    module,
    requirement: requiredBefore(index),
    completed: getModuleCompletion(module, progress, assessmentPassed),
    progress: getModuleProgress(module, progress, assessmentPassed),
  }));

  const completedCount = moduleStates.filter((state) => state.completed).length;

  const overallProgress =
    HANGUL_MODULES.length > 0 ? completedCount / HANGUL_MODULES.length : 0;

  const firstIncompleteIndex = moduleStates.findIndex(
    (state) => !state.completed,
  );

  const journeyCompleted = firstIncompleteIndex === -1;

  const continueIndex = journeyCompleted
    ? HANGUL_MODULES.length - 1
    : firstIncompleteIndex;

  const continueState = moduleStates[continueIndex];

  const continueModule = continueState.module;

  const currentSceneTitle = getCurrentSceneTitle(continueModule, progress);

  const continueTitle = journeyCompleted
    ? continueModule.title
    : (currentSceneTitle ?? continueModule.title);

  const continueSubtitle = journeyCompleted
    ? "Parcours Hangul terminé · Revoir la lecture guidée"
    : currentSceneTitle
      ? `Hangul · ${continueModule.title}`
      : continueModule.sub;

  const continueProgress = journeyCompleted ? 1 : continueState.progress;

  const openModule = (module: HangulHubModule, requirement?: Requirement) => {
    router.push((requirement?.route ?? module.href) as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bgImage}
        resizeMode="cover"
      >
        {/* BACKGROUND */}

        <BlurView intensity={18} tint="dark" style={styles.bgBlur} />

        <View style={styles.vignetteOverlay} />

        <LinearGradient
          colors={["rgba(2,3,6,0.10)", "rgba(2,3,6,0.22)", "rgba(2,3,6,0.72)"]}
          locations={[0, 0.44, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.ambientGlowTop} pointerEvents="none" />

        <View style={styles.ambientGlowBottom} pointerEvents="none" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,

            {
              paddingHorizontal: responsive.horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.contentFrame,

              {
                maxWidth: responsive.maxWidth,
              },
            ]}
          >
            {/* NAVIGATION */}

            <UnifiedNavHeader />

            {/* HERO */}

            <HangulHero
              compact={responsive.isCompact}
              level={displayLevel}
              progress={overallProgress}
              completedCount={completedCount}
              totalCount={HANGUL_MODULES.length}
            />

            {/* CONTINUE */}

            <AnimatedFragment index={0}>
              <ContinueCard
                title={continueTitle}
                subtitle={continueSubtitle}
                progress={continueProgress}
                completed={journeyCompleted}
                onPress={() =>
                  openModule(continueModule, continueState.requirement)
                }
              />
            </AnimatedFragment>

            {/* JOURNEY */}

            <JourneySectionHeader
              completedCount={completedCount}
              totalCount={HANGUL_MODULES.length}
            />

            <View
              style={[
                styles.grid,

                gridColumns > 1 && styles.gridWide,

                {
                  gap: Math.max(16, responsive.gridGap),
                },
              ]}
            >
              {moduleStates.map(
                (
                  { module, requirement, completed, progress: moduleProgress },
                  index,
                ) => {
                  const active = !journeyCompleted && index === continueIndex;

                  return (
                    <AnimatedFragment
                      key={module.href}
                      index={index + 1}
                      style={
                        gridColumns > 1
                          ? {
                              width: gridItemWidth,
                            }
                          : undefined
                      }
                    >
                      <HangulPathCard
                        module={module}
                        index={index}
                        active={active}
                        completed={completed}
                        requirement={requirement}
                        progress={moduleProgress}
                        onPress={() => openModule(module, requirement)}
                      />
                    </AnimatedFragment>
                  );
                },
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// NAV HEADER
// ──────────────────────────────────────────────

function UnifiedNavHeader() {
  return (
    <View style={styles.navHeader}>
      <AppBackButton />
    </View>
  );
}

// ──────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────

function HangulHero({
  compact,
  level,
  progress,
  completedCount,
  totalCount,
}: {
  compact: boolean;
  level: number;
  progress: number;
  completedCount: number;
  totalCount: number;
}) {
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.hero}>
      <View style={styles.heroEyebrowRow}>
        <View style={styles.heroDot} />

        <AppText variant="sectionLabel" style={styles.heroEyebrow}>
          PARCOURS · HANGUL
        </AppText>
      </View>

      <AppText
        variant="koreanPrimary"
        script="korean"
        lineContract="singleLine"
        style={[styles.heroKorean, compact && styles.heroKoreanCompact]}
      >
        한글
      </AppText>

      <AppText variant="featureTitle" style={styles.heroTitle}>
        Hangul
      </AppText>

      <AppText variant="bodySecondary" style={styles.heroSubtitle}>
        Lis le coréen. Décode la ville.
      </AppText>

      <View style={styles.heroMetaRow}>
        <View style={styles.levelPill}>
          <View style={styles.levelDot} />

          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={styles.levelText}
          >
            NIVEAU {level}
          </AppText>
        </View>

        <AppText variant="caption" style={styles.heroCompletion}>
          {completedCount} / {totalCount} étapes
        </AppText>
      </View>

      <View style={styles.heroProgress}>
        <View style={styles.heroProgressMeta}>
          <AppText variant="caption" style={styles.heroProgressLabel}>
            PROGRESSION HANGUL
          </AppText>

          <AppText
            variant="bodyStrong"
            style={[
              styles.heroProgressValue,

              percentage === 0 && styles.heroProgressStart,
            ]}
          >
            {percentage === 0 ? "Commencer" : `${percentage}%`}
          </AppText>
        </View>

        <AnimatedProgressBar progress={progress} accentColor={HANGUL_ACCENT} />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// CONTINUE CARD
// ──────────────────────────────────────────────

function ContinueCard({
  title,
  subtitle,
  progress,
  completed,
  onPress,
}: {
  title: string;
  subtitle: string;
  progress: number;
  completed: boolean;
  onPress: () => void;
}) {
  const percentage = Math.round(progress * 100);

  const valueLabel = completed
    ? "Revoir"
    : percentage === 0
      ? "Commencer"
      : `${percentage}%`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`À continuer. ${title}. ${subtitle}.`}
      accessibilityHint="Ouvre l'étape Hangul"
      onPress={onPress}
      style={({ pressed }) => [
        styles.continueWrap,

        pressed && styles.pressablePressed,
      ]}
    >
      <BlurView intensity={68} tint="dark" style={styles.continueCard}>
        <LinearGradient
          colors={[
            "rgba(52,166,203,0.20)",
            "rgba(7,13,21,0.72)",
            "rgba(2,3,6,0.88)",
          ]}
          locations={[0, 0.44, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.continueGlow} />

        <View style={styles.glassTopHairline} />

        <View style={styles.continueTopRow}>
          <View style={styles.continueKicker}>
            <View style={styles.continueKickerDot} />

            <AppText variant="sectionLabel" style={styles.continueKickerText}>
              {completed ? "PARCOURS TERMINÉ" : "À CONTINUER"}
            </AppText>
          </View>

          <View style={styles.continueArrow}>
            <ChevronRight size={19} strokeWidth={2.25} color={HANGUL_ACCENT} />
          </View>
        </View>

        <View style={styles.continueContent}>
          <AppText variant="featureTitle" style={styles.continueTitle}>
            {title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.continueSubtitle}
          >
            {subtitle}
          </AppText>
        </View>

        <View style={styles.continueProgressBlock}>
          <View style={styles.continueProgressMeta}>
            <AppText variant="caption" style={styles.continueProgressLabel}>
              PROGRESSION DE L'ÉTAPE
            </AppText>

            <AppText
              variant="bodyStrong"
              style={[
                styles.continueProgressValue,

                percentage === 0 && !completed && styles.continueProgressStart,
              ]}
            >
              {valueLabel}
            </AppText>
          </View>

          <AnimatedProgressBar
            progress={progress}
            accentColor={HANGUL_ACCENT}
          />
        </View>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// JOURNEY HEADER
// ──────────────────────────────────────────────

function JourneySectionHeader({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <AppText variant="sectionLabel" style={styles.sectionTitle}>
          TON PARCOURS
        </AppText>

        <AppText variant="caption" style={styles.sectionSubtitle}>
          {completedCount} sur {totalCount} étapes terminées
        </AppText>
      </View>

      <View style={styles.sectionLineWrap}>
        <View style={styles.sectionLineBase} />

        <LinearGradient
          colors={["transparent", HANGUL_ACCENT, HANGUL_SECONDARY]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={styles.sectionLineGlow}
        />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// PATH CARD
// ──────────────────────────────────────────────

function HangulPathCard({
  module,
  index,
  active,
  completed,
  requirement,
  progress,
  onPress,
}: {
  module: HangulHubModule;
  index: number;
  active: boolean;
  completed: boolean;
  requirement?: Requirement;
  progress: number;
  onPress: () => void;
}) {
  const isFuture = !!requirement;

  const percentage = Math.round(progress * 100);

  const accent = completed
    ? SUCCESS_ACCENT
    : active && module.kind === "assessment"
      ? ASSESSMENT_ACCENT
      : active
        ? HANGUL_ACCENT
        : FUTURE_ACCENT;

  const subtitle = requirement
    ? `Après « ${requirement.title} »`
    : completed
      ? `Terminé · ${module.sub}`
      : module.sub;

  const statusLabel = completed
    ? "TERMINÉ"
    : isFuture
      ? "À VENIR"
      : percentage > 0
        ? "EN COURS"
        : "À COMMENCER";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${module.title}. ${subtitle}. ${statusLabel}.`}
      accessibilityHint={
        isFuture
          ? `Ouvre d'abord ${requirement?.title}`
          : "Ouvre cette étape Hangul"
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.pathCardWrap,

        active && styles.pathCardWrapActive,

        completed && styles.pathCardWrapCompleted,

        isFuture && styles.pathCardWrapFuture,

        {
          borderColor: active
            ? "rgba(103,232,249,0.26)"
            : completed
              ? "rgba(45,212,191,0.16)"
              : HAIRLINE,
        },

        pressed && styles.pressablePressed,
      ]}
    >
      <BlurView
        intensity={active ? 60 : isFuture ? 34 : 46}
        tint="dark"
        style={styles.pathCard}
      >
        <LinearGradient
          colors={
            active
              ? [
                  "rgba(34,126,164,0.16)",
                  "rgba(5,8,14,0.72)",
                  "rgba(2,3,6,0.80)",
                ]
              : completed
                ? [
                    "rgba(28,126,117,0.09)",
                    "rgba(5,8,14,0.72)",
                    "rgba(2,3,6,0.82)",
                  ]
                : [
                    "rgba(255,255,255,0.025)",
                    "rgba(5,8,14,0.68)",
                    "rgba(2,3,6,0.82)",
                  ]
          }
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />

        {!isFuture ? (
          <View
            style={[
              styles.pathAmbientGlow,

              {
                backgroundColor: accent,
              },
            ]}
          />
        ) : null}

        <View style={styles.glassTopHairline} />

        <View
          style={[
            styles.pathAccentLine,

            {
              backgroundColor: accent,
            },
          ]}
        />

        <View style={styles.pathTopRow}>
          <View
            style={[
              styles.pathIconBox,

              {
                borderColor: active
                  ? "rgba(103,232,249,0.25)"
                  : completed
                    ? "rgba(45,212,191,0.18)"
                    : "rgba(148,163,184,0.10)",

                backgroundColor: active
                  ? "rgba(103,232,249,0.08)"
                  : completed
                    ? "rgba(45,212,191,0.055)"
                    : "rgba(148,163,184,0.035)",
              },
            ]}
          >
            <AppText
              variant="symbol"
              script="korean"
              style={[
                styles.pathIconText,

                {
                  color: accent,
                },
              ]}
            >
              {module.icon}
            </AppText>
          </View>

          <View style={styles.pathTopMeta}>
            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={[
                styles.pathStepLabel,

                isFuture && styles.pathStepLabelFuture,
              ]}
            >
              ÉTAPE {index + 1} · HANGUL
            </AppText>

            <View style={styles.pathStatusRow}>
              {completed ? (
                <Check size={12} strokeWidth={2.5} color={SUCCESS_ACCENT} />
              ) : isFuture ? (
                <LockKeyhole size={11} strokeWidth={2} color={FUTURE_ACCENT} />
              ) : (
                <View
                  style={[
                    styles.pathStatusDot,

                    {
                      backgroundColor: accent,
                    },
                  ]}
                />
              )}

              <AppText
                variant="caption"
                lineContract="singleLine"
                style={[
                  styles.pathStatusText,

                  completed && styles.pathStatusCompleted,

                  isFuture && styles.pathStatusFuture,
                ]}
              >
                {statusLabel}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.pathTextBlock}>
          <AppText
            variant="cardTitle"
            style={[styles.pathTitle, isFuture && styles.pathTitleFuture]}
          >
            {module.title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={[styles.pathSubtitle, isFuture && styles.pathSubtitleFuture]}
          >
            {subtitle}
          </AppText>
        </View>

        <View style={styles.pathFooter}>
          <View style={styles.pathFooterLine}>
            {!isFuture ? (
              <View
                style={[
                  styles.pathFooterAccent,

                  {
                    backgroundColor: accent,
                  },
                ]}
              />
            ) : null}
          </View>

          <View style={[styles.pathArrow, active && styles.pathArrowActive]}>
            {isFuture ? (
              <LockKeyhole
                size={15}
                strokeWidth={2}
                color="rgba(148,163,184,0.34)"
              />
            ) : (
              <ChevronRight
                size={17}
                strokeWidth={2.2}
                color={
                  completed
                    ? SUCCESS_ACCENT
                    : active
                      ? HANGUL_ACCENT
                      : "rgba(241,245,249,0.46)"
                }
              />
            )}
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// ANIMATED PROGRESS BAR
// ──────────────────────────────────────────────

function AnimatedProgressBar({
  progress,
  accentColor,
}: {
  progress: number;
  accentColor: string;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const safeProgress = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    progressAnim.setValue(0);

    const animation = Animated.timing(progressAnim, {
      toValue: safeProgress,
      duration: 780,
      delay: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [progressAnim, safeProgress]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width,
          },
        ]}
      >
        <LinearGradient
          colors={[accentColor, HANGUL_SECONDARY]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// ──────────────────────────────────────────────
// ANIMATED FRAGMENT
// ──────────────────────────────────────────────

function AnimatedFragment({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: StyleProp<ViewStyle>;
}) {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const slideAnim = useMemo(() => new Animated.Value(18), []);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 620,
        delay: index * 85,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 720,
        delay: index * 85,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        style,

        {
          opacity: fadeAnim,

          transform: [
            {
              translateY: slideAnim,
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  // ─────────────────────────────
  // ROOT
  // ─────────────────────────────

  safe: {
    flex: 1,

    backgroundColor: BG_DEEP,
  },

  bgImage: {
    flex: 1,

    overflow: "hidden",

    backgroundColor: BG_DEEP,
  },

  bgBlur: {
    ...ABSOLUTE_FILL,
  },

  vignetteOverlay: {
    ...ABSOLUTE_FILL,

    backgroundColor: "rgba(2,3,6,0.52)",
  },

  ambientGlowTop: {
    position: "absolute",

    top: 100,
    right: -110,

    width: 250,
    height: 250,

    borderRadius: 125,

    backgroundColor: "rgba(103,232,249,0.05)",

    boxShadow: "0px 0px 90px rgba(103,232,249,0.10)",
  },

  ambientGlowBottom: {
    position: "absolute",

    top: 510,
    left: -130,

    width: 260,
    height: 260,

    borderRadius: 130,

    backgroundColor: "rgba(94,234,212,0.035)",

    boxShadow: "0px 0px 100px rgba(94,234,212,0.07)",
  },

  scrollContent: {
    paddingTop: 8,

    paddingBottom: 120,
  },

  contentFrame: {
    width: "100%",

    alignSelf: "center",
  },

  pressablePressed: {
    opacity: 0.84,

    transform: [
      {
        scale: 0.992,
      },
    ],
  },

  glassTopHairline: {
    position: "absolute",

    top: 0,
    left: 18,
    right: 18,

    height: 1,

    backgroundColor: "rgba(255,255,255,0.16)",

    opacity: 0.68,
  },

  // ─────────────────────────────
  // NAV
  // ─────────────────────────────

  navHeader: {
    minHeight: 60,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 12,
  },

  // ─────────────────────────────
  // HERO
  // ─────────────────────────────

  hero: {
    paddingHorizontal: 2,

    marginTop: 12,

    marginBottom: 30,
  },

  heroEyebrowRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 12,
  },

  heroDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    marginRight: 8,

    backgroundColor: HANGUL_ACCENT,

    boxShadow: "0px 0px 8px rgba(103,232,249,0.72)",
  },

  heroEyebrow: {
    color: "rgba(226,242,254,0.58)",

    letterSpacing: 1.35,
  },

  heroKorean: {
    color: "rgba(255,250,243,0.98)",

    fontSize: 74,

    lineHeight: 80,

    textShadowColor: "rgba(103,232,249,0.15)",

    textShadowOffset: {
      width: 0,
      height: 0,
    },

    textShadowRadius: 18,
  },

  heroKoreanCompact: {
    fontSize: 62,

    lineHeight: 68,
  },

  heroTitle: {
    color: TXT,

    marginTop: -4,
  },

  heroSubtitle: {
    maxWidth: 520,

    marginTop: 8,

    color: MUTED,
  },

  heroMetaRow: {
    marginTop: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 14,
  },

  levelPill: {
    minHeight: 32,

    paddingHorizontal: 12,

    borderRadius: 999,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.15)",

    backgroundColor: "rgba(103,232,249,0.045)",
  },

  levelDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    marginRight: 7,

    backgroundColor: HANGUL_ACCENT,
  },

  levelText: {
    color: "rgba(150,226,255,0.76)",
  },

  heroCompletion: {
    color: SOFT,
  },

  heroProgress: {
    marginTop: 19,
  },

  heroProgressMeta: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 9,
  },

  heroProgressLabel: {
    color: SOFT,

    letterSpacing: 0.6,
  },

  heroProgressValue: {
    color: TXT,
  },

  heroProgressStart: {
    color: "rgba(103,232,249,0.82)",

    fontSize: 14,
  },

  // ─────────────────────────────
  // CONTINUE
  // ─────────────────────────────

  continueWrap: {
    marginBottom: 8,

    borderRadius: 30,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.24)",

    backgroundColor: "rgba(2,3,6,0.32)",

    boxShadow: "0px 12px 30px rgba(41,151,203,0.14)",
  },

  continueCard: {
    minHeight: 214,

    padding: 20,

    position: "relative",

    overflow: "hidden",
  },

  continueGlow: {
    position: "absolute",

    top: -86,
    right: -66,

    width: 190,
    height: 190,

    borderRadius: 95,

    opacity: 0.08,

    backgroundColor: HANGUL_ACCENT,

    boxShadow: "0px 0px 64px rgba(103,232,249,0.28)",
  },

  continueTopRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 24,
  },

  continueKicker: {
    minHeight: 30,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 11,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.09)",

    backgroundColor: "rgba(255,255,255,0.035)",
  },

  continueKickerDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    marginRight: 7,

    backgroundColor: HANGUL_ACCENT,
  },

  continueKickerText: {
    color: "rgba(241,245,249,0.56)",
  },

  continueArrow: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.18)",

    backgroundColor: "rgba(103,232,249,0.045)",
  },

  continueContent: {
    maxWidth: 600,
  },

  continueTitle: {
    color: TXT,

    marginBottom: 6,
  },

  continueSubtitle: {
    color: MUTED,

    maxWidth: 560,
  },

  continueProgressBlock: {
    marginTop: 25,
  },

  continueProgressMeta: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 9,
  },

  continueProgressLabel: {
    color: SOFT,

    letterSpacing: 0.55,
  },

  continueProgressValue: {
    color: TXT,
  },

  continueProgressStart: {
    color: "rgba(103,232,249,0.82)",

    fontSize: 14,
  },

  // ─────────────────────────────
  // PROGRESS
  // ─────────────────────────────

  progressTrack: {
    width: "100%",

    height: 4,

    borderRadius: 2,

    overflow: "hidden",

    backgroundColor: "rgba(255,255,255,0.075)",
  },

  progressFill: {
    height: "100%",

    borderRadius: 2,

    overflow: "hidden",
  },

  // ─────────────────────────────
  // SECTION HEADER
  // ─────────────────────────────

  sectionHeader: {
    marginTop: 32,

    marginBottom: 16,

    flexDirection: "row",

    alignItems: "flex-end",

    gap: 14,
  },

  sectionTitle: {
    color: "rgba(241,245,249,0.60)",

    letterSpacing: 1.2,
  },

  sectionSubtitle: {
    marginTop: 3,

    color: "rgba(241,245,249,0.38)",
  },

  sectionLineWrap: {
    flex: 1,

    height: 10,

    position: "relative",

    justifyContent: "center",

    marginBottom: 2,
  },

  sectionLineBase: {
    height: 1,

    backgroundColor: "rgba(255,255,255,0.055)",
  },

  sectionLineGlow: {
    position: "absolute",

    right: 0,

    width: 96,

    height: 1,

    opacity: 0.82,
  },

  // ─────────────────────────────
  // GRID
  // ─────────────────────────────

  grid: {
    gap: 16,
  },

  gridWide: {
    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "stretch",
  },

  // ─────────────────────────────
  // PATH CARD
  // ─────────────────────────────

  pathCardWrap: {
    minHeight: 172,

    borderRadius: 25,

    overflow: "hidden",

    borderWidth: 1,

    backgroundColor: "rgba(2,3,6,0.31)",

    boxShadow: "0px 10px 24px rgba(0,0,0,0.22)",
  },

  pathCardWrapActive: {
    boxShadow: "0px 12px 28px rgba(48,167,215,0.12)",
  },

  pathCardWrapCompleted: {
    opacity: 0.96,
  },

  pathCardWrapFuture: {
    opacity: 0.76,
  },

  pathCard: {
    flex: 1,

    minHeight: 172,

    padding: 16,

    position: "relative",

    overflow: "hidden",
  },

  pathAmbientGlow: {
    position: "absolute",

    top: -64,
    right: -48,

    width: 135,
    height: 135,

    borderRadius: 68,

    opacity: 0.055,
  },

  pathAccentLine: {
    position: "absolute",

    left: 0,

    top: 22,

    bottom: 22,

    width: 2,

    borderRadius: 2,

    opacity: 0.9,
  },

  pathTopRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 13,
  },

  pathIconBox: {
    width: 48,
    height: 48,

    borderRadius: 17,

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,

    borderWidth: 1,

    overflow: "hidden",
  },

  pathIconText: {
    fontSize: 25,

    lineHeight: 30,
  },

  pathTopMeta: {
    flex: 1,

    minWidth: 0,
  },

  pathStepLabel: {
    color: "rgba(241,245,249,0.48)",

    letterSpacing: 1.05,
  },

  pathStepLabelFuture: {
    color: "rgba(241,245,249,0.32)",
  },

  pathStatusRow: {
    marginTop: 5,

    flexDirection: "row",

    alignItems: "center",

    gap: 5,
  },

  pathStatusDot: {
    width: 4,
    height: 4,

    borderRadius: 2,
  },

  pathStatusText: {
    color: "rgba(103,232,249,0.58)",

    letterSpacing: 0.4,
  },

  pathStatusCompleted: {
    color: "rgba(45,212,191,0.66)",
  },

  pathStatusFuture: {
    color: "rgba(148,163,184,0.42)",
  },

  pathTextBlock: {
    marginTop: 18,

    paddingRight: 8,
  },

  pathTitle: {
    color: TXT,
  },

  pathTitleFuture: {
    color: "rgba(241,245,249,0.72)",
  },

  pathSubtitle: {
    marginTop: 5,

    color: MUTED,

    maxWidth: 560,
  },

  pathSubtitleFuture: {
    color: FUTURE_TEXT,
  },

  pathFooter: {
    marginTop: "auto",

    paddingTop: 16,

    flexDirection: "row",

    alignItems: "center",

    gap: 10,
  },

  pathFooterLine: {
    flex: 1,

    height: 1,

    overflow: "hidden",

    backgroundColor: "rgba(255,255,255,0.055)",
  },

  pathFooterAccent: {
    width: 38,

    height: 1,

    opacity: 0.82,
  },

  pathArrow: {
    width: 31,
    height: 31,

    borderRadius: 16,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.065)",

    backgroundColor: "rgba(255,255,255,0.025)",
  },

  pathArrowActive: {
    borderColor: "rgba(103,232,249,0.18)",

    backgroundColor: "rgba(103,232,249,0.045)",
  },
});
