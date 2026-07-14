import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../../_store";
import { ModuleCard } from "../../../components/ModuleCard";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { AppFontFamily, SeoulMidnightGlass } from "../../../constants/theme";

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SEOUL MIDNIGHT GLASS
// ──────────────────────────────────────────────
const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const SOFT = SeoulMidnightGlass.colors.soft;
const LINE_SOFT = SeoulMidnightGlass.colors.lineSoft;

const PINK = SeoulMidnightGlass.colors.pink;
const CYAN = SeoulMidnightGlass.colors.cyan;

const HERO_CIRCLE = width * 0.76;

const fonts = {
  bold: AppFontFamily.outfit.bold,
  black: AppFontFamily.outfit.black,
  medium: AppFontFamily.outfit.medium,
  kr: AppFontFamily.korean.bold,
};

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
          contentContainerStyle={styles.scrollContent}
        >
          <UnifiedNavHeader />

          <UnifiedHeroHeader
            korean="한글"
            title="Hangul"
            subtitle={`"Apprendre l'alphabet pour lire l'âme de la ville."`}
            badgeText={`IMMERSION NIVEAU ${displayLevel}`}
            accent={CYAN}
          />

          <UnifiedSectionHeader title="TON PARCOURS DE DÉCRYPTAGE" />

          <View style={styles.grid}>
            {HANGUL_MODULES.map((module, i) => (
              <AnimatedFragment key={module.href} index={i}>
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
                />
              </AnimatedFragment>
            ))}
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
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>SÉOUL IMMERSION</Text>
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
// HERO / HEADER
// ──────────────────────────────────────────────
function UnifiedHeroHeader({
  korean,
  title,
  subtitle,
  badgeText,
  accent,
}: {
  korean: string;
  title: string;
  subtitle: string;
  badgeText: string;
  accent: string;
}) {
  const glowAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [glowAnim]);

  const glowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 34],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const pulseScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1.025],
  });

  const outerGlowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.52],
  });

  const innerGlowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 0.72],
  });

  return (
    <View style={styles.heroBlock}>
      <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>

      <View style={styles.heroVisualWrap}>
        <Animated.View
          style={[
            styles.heroKoreanPulseWrap,
            {
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.heroKoreanGlowOuter,
              {
                opacity: outerGlowOpacity,
              },
            ]}
          >
            {korean}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.heroKoreanGlowInner,
              {
                opacity: innerGlowOpacity,
              },
            ]}
          >
            {korean}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.heroKorean,
              {
                textShadowColor: "rgba(56,189,248,0.92)",
                textShadowRadius: glowRadius,
                opacity: glowOpacity,
              },
            ]}
          >
            {korean}
          </Animated.Text>
        </Animated.View>

        <Text style={styles.heroTitle}>{title}</Text>

        <BlurView intensity={28} tint="dark" style={styles.heroBadge}>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.08)",
              "rgba(255,255,255,0.02)",
              "rgba(255,255,255,0.04)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.heroBadgeText}>{badgeText}</Text>
        </BlurView>

        <Text style={styles.heroQuote}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// SECTION HEADER
// ──────────────────────────────────────────────
function UnifiedSectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionDivider}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.titleLine} />
    </View>
  );
}

// ──────────────────────────────────────────────
// ANIMATED FRAGMENT
// ──────────────────────────────────────────────
function AnimatedFragment({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
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
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 120,
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
    fontFamily: fonts.bold,
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

  // HERO
  heroBlock: {
    marginTop: 34,
    alignItems: "center",
  },

  heroEyebrow: {
    color: PINK,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 5.5,
    textAlign: "center",
    marginBottom: 28,
    opacity: 0.9,
  },

  heroKoreanPulseWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  heroKorean: {
    fontSize: 74,
    fontFamily: fonts.kr,
    color: "rgba(225,248,255,0.98)",
    textShadowColor: "rgba(56,189,248,0.92)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    marginBottom: 2,
  },

  heroKoreanGlowOuter: {
    position: "absolute",
    fontSize: 74,
    fontFamily: fonts.kr,
    color: "rgba(56,189,248,0.18)",
    textShadowColor: "rgba(56,189,248,1)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 42,
    marginBottom: 2,
  },

  heroKoreanGlowInner: {
    position: "absolute",
    fontSize: 74,
    fontFamily: fonts.kr,
    color: "rgba(180,238,255,0.36)",
    textShadowColor: "rgba(103,232,249,0.95)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    marginBottom: 2,
  },

  heroVisualWrap: {
    width: "100%",
    minHeight: 360,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },

  heroHaloPink: {
    position: "absolute",
    top: -18,
    left: -92,
    width: HERO_CIRCLE * 0.95,
    height: HERO_CIRCLE * 0.95,
    borderRadius: HERO_CIRCLE,
    backgroundColor: PINK,
    opacity: 0.105,
  },

  heroHaloCyan: {
    position: "absolute",
    top: -20,
    right: -84,
    width: HERO_CIRCLE * 1.02,
    height: HERO_CIRCLE * 1.02,
    borderRadius: HERO_CIRCLE,
    backgroundColor: CYAN,
    opacity: 0.105,
  },

  heroHaloCenter: {
    position: "absolute",
    top: 28,
    width: HERO_CIRCLE * 0.82,
    height: HERO_CIRCLE * 0.82,
    borderRadius: HERO_CIRCLE,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.055)",
  },

  heroRingA: {
    position: "absolute",
    top: 18,
    width: HERO_CIRCLE * 0.88,
    height: HERO_CIRCLE * 0.88,
    borderRadius: HERO_CIRCLE,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.16)",
    transform: [{ rotate: "-8deg" }],
  },

  heroRingB: {
    position: "absolute",
    top: 40,
    width: HERO_CIRCLE * 0.72,
    height: HERO_CIRCLE * 0.72,
    borderRadius: HERO_CIRCLE,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.12)",
    transform: [{ rotate: "12deg" }],
  },

  heroTitle: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.96)",
    letterSpacing: -0.7,
    textAlign: "center",
  },

  heroBadge: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  heroBadgeText: {
    color: "rgba(255,255,255,0.66)",
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 3,
  },

  heroQuote: {
    marginTop: 30,
    maxWidth: "82%",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(255,255,255,0.72)",
    fontFamily: fonts.medium,
    fontStyle: "italic",
  },
  // SECTION
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: SOFT,
    letterSpacing: 3,
  },

  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: LINE_SOFT,
  },

  // GRID
  grid: {
    gap: 12,
  },
});
