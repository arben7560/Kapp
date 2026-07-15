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
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SEOUL MIDNIGHT GLASS
// ──────────────────────────────────────────────
const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const CYAN = SeoulMidnightGlass.colors.cyan;

type HangulModule = {
  title: string;
  sub: string;
  icon: string;
  href: string;
  color?: string;
  isLocked?: boolean;
};

const HANGUL_MODULES: HangulModule[] = [
  {
    title: "Voyelles de base",
    sub: "6 voyelles essentielles",
    href: "/(tabs)/hangul/vowels-basic",
    icon: "ㅏ",
    color: "#22D3EE",
    isLocked: false,
  },
  {
    title: "Les consonnes",
    sub: "14 signes fondamentaux",
    href: "/(tabs)/hangul/consonants-basic",
    icon: "ㄱ",
    color: "#60A5FA",
    isLocked: false,
  },
  {
    title: "Voyelles composées",
    sub: "Combinaisons fluides",
    href: "/(tabs)/hangul/vowels-compound",
    icon: "ㅘ",
    color: "#A78BFA",
    isLocked: true,
  },
  {
    title: "Consonnes doubles",
    sub: "L'intensité du son",
    href: "/(tabs)/hangul/consonants-tense",
    icon: "ㄲ",
    color: "#F472B6",
    isLocked: true,
  },
  {
    title: "Batchim",
    sub: "La structure finale",
    href: "/(tabs)/hangul/batchim",
    icon: "각",
    color: "#34D399",
    isLocked: true,
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
            badgeLabel={`IMMERSION NIVEAU ${displayLevel}`}
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
            {HANGUL_MODULES.map((module, i) => (
              <AnimatedFragment
                key={module.href}
                index={i}
                style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
              >
                <ModuleCard
                  title={module.title}
                  subtitle={module.sub}
                  icon={module.icon}
                  href={module.href}
                  accentColor={module.color ?? CYAN}
                  requiresPremium={module.isLocked}
                  metaLabel="PARCOURS HANGUL"
                  accessibilityContext="ce module Hangul"
                  iconScript="korean"
                  visualVariant="legacyGlass"
                />
              </AnimatedFragment>
            ))}
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Paramètres"
        accessibilityState={{ disabled: true }}
        aria-disabled={true}
        hitSlop={8}
        disabled
        style={styles.settingsShell}
      >
        <View style={styles.settingsOrb} />
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
    fontSize: 28,
    lineHeight: 28,
  },

  backText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    letterSpacing: 2.3,
  },

  settingsShell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  settingsOrb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.30)",
    opacity: 0.7,
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
