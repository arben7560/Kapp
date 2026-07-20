import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { HubHero } from "../../../components/hub/HubHero";
import { SectionHeader } from "../../../components/hub/SectionHeader";
import { ModuleCard } from "../../../components/ModuleCard";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { SeoulMidnightGlass } from "../../../constants/theme";
import { HANGUL_MODULES as HANGUL_CURRICULUM_MODULES } from "../../../data/hangul/curriculum";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SEOUL MIDNIGHT GLASS
// ──────────────────────────────────────────────
const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const CYAN = SeoulMidnightGlass.colors.cyan;

type HangulHubModule = {
  id: string;
  title: string;
  sub: string;
  icon: string;
  href: string;
  color?: string;
  isLocked?: boolean;
};

const HANGUL_MODULES: HangulHubModule[] = [
  ...HANGUL_CURRICULUM_MODULES.map((module) => ({
    id: module.id,
    title: module.title,
    sub: module.subtitle,
    href: module.route,
    icon: module.icon,
    color: module.accent,
    isLocked: false,
  })),
  {
    id: "hangul_assessment",
    title: "Évaluation Hangul",
    sub: "Décodage cumulatif sans romanisation",
    href: "/(tabs)/hangul/assessment",
    icon: "한",
    color: "#FDE047",
    isLocked: false,
  },
  {
    id: "hangul_bridge",
    title: "Passerelle de lecture",
    sub: "Lecture guidée, vocabulaire et écoute lente",
    href: "/(tabs)/hangul/bridge",
    icon: "읽",
    color: "#2DD4BF",
    isLocked: false,
  },
];

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function HangulHub() {
  const { progress } = useStore();
  const responsive = useResponsiveLayout({ maxWidth: 920 });
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
  const assessmentPassed = !!progress.hangulProgress.assessment?.passed;

  const requiredBefore = (index: number) => {
    if (index === 0) return undefined;
    if (index < HANGUL_CURRICULUM_MODULES.length) {
      const previous = HANGUL_CURRICULUM_MODULES[index - 1];
      return progress.completed[previous.id] ? undefined : { title: previous.title, route: previous.route };
    }
    if (index === HANGUL_CURRICULUM_MODULES.length) {
      const missing = HANGUL_CURRICULUM_MODULES.find((module) => !progress.completed[module.id]);
      return missing ? { title: missing.title, route: missing.route } : undefined;
    }
    return assessmentPassed ? undefined : { title: "l’évaluation Hangul", route: "/(tabs)/hangul/assessment" };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bgImage}
        resizeMode="contain"
      >
        <BlurView intensity={80} tint="dark" style={styles.bgBlur} />
        <View style={styles.vignetteOverlay} />
        <View style={styles.topFade} />
        <View style={styles.bottomFade} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
          <UnifiedNavHeader />

          <HubHero
            korean="한글"
            title="Hangul"
            subtitle={`"Apprendre l'alphabet pour lire l'âme de la ville."`}
            badgeLabel={`NIVEAU ${displayLevel}`}
            accentColor={CYAN}
            animateGlow
          />

          <SectionHeader title="TON PARCOURS DE DÉCRYPTAGE" />

          <View
            style={[
              styles.grid,
              gridColumns > 1 && styles.gridWide,
              { gap: responsive.gridGap },
            ]}
          >
            {HANGUL_MODULES.map((module, i) => {
              const requirement = requiredBefore(i);
              const completed = module.id === "hangul_assessment"
                ? assessmentPassed
                : !!progress.completed[module.id];
              return (
              <AnimatedFragment
                key={module.href}
                index={i}
                style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
              >
                <ModuleCard
                  title={module.title}
                  subtitle={requirement ? `À commencer après ${requirement.title}` : completed ? `Terminé · ${module.sub}` : module.sub}
                  icon={module.icon}
                  onPress={() => router.push((requirement?.route ?? module.href) as never)}
                  accentColor={module.color ?? CYAN}
                  requiresPremium={module.isLocked}
                  metaLabel="ÉTAPE HANGUL"
                  accessibilityContext="cette étape Hangul"
                  iconScript="korean"
                  visualVariant="legacyGlass"
                />
              </AnimatedFragment>
              );
            })}
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        onPress={() => router.back()}
        style={styles.backBtn}
      >
        <AppText aria-hidden variant="screenTitle" style={styles.backArrow}>
          ‹
        </AppText>
        <AppText variant="caption" style={styles.backText}>
          SÉOUL IMMERSION
        </AppText>
      </Pressable>

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
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 760,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 760,
        delay: index * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    anim.start();

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
          transform: [{ translateY: slideAnim }],
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
  safe: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  bgImage: {
    flex: 1,
    overflow: "hidden",
  },
  bgBlur: {
    ...ABSOLUTE_FILL,
  },

  vignetteOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.48)",
  },

  topFade: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
    backgroundColor: "rgba(2,3,6,0.32)",
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 120,
  },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },

  // NAV
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  backArrow: {
    color: TXT,
  },

  backText: {
    color: "rgba(255,255,255,0.92)",
  },

  // GRID
  grid: {
    gap: 12,
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
});
