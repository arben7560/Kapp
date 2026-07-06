import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React, { useEffect, useRef } from "react";
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
import { usePaywall } from "../../../lib/paywall/PaywallProvider";

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SEOUL MIDNIGHT GLASS
// ──────────────────────────────────────────────
const BG_DEEP = "#020306";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.66)";
const SOFT = "rgba(255,255,255,0.46)";
const LINE = "rgba(255,255,255,0.10)";
const LINE_SOFT = "rgba(255,255,255,0.07)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const GOLD = "#FDE047"; // Teinte Premium

const HERO_CIRCLE = width * 0.76;
const CARD_HEIGHT = 124;
const CARD_RADIUS = 28;

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
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
                <HangulFamilyCard
                  title={module.title}
                  subtitle={module.sub}
                  icon={module.icon}
                  href={module.href}
                  color={module.color ?? CYAN}
                  isLocked={module.isLocked}
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
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>SÉOUL IMMERSION</Text>
      </Pressable>

      <View style={styles.settingsShell}>
        <View style={styles.settingsOrb} />
      </View>
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
  const glowAnim = useRef(new Animated.Value(0)).current;

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

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
// CARD
// ──────────────────────────────────────────────
function HangulFamilyCard({
  title,
  subtitle,
  icon,
  href,
  color,
  isLocked,
}: {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  color: string;
  isLocked?: boolean;
}) {
  const { hasPremiumAccess } = usePaywall();
  const targetHref = isLocked && !hasPremiumAccess ? "/premium" : href;

  return (
    <Link href={targetHref as any} asChild>
      <Pressable style={styles.cardPressable}>
        <BlurView
          intensity={40}
          tint="dark"
          style={[styles.themeCard, isLocked && styles.premiumCardBorder]}
        >
          <LinearGradient
            colors={[
              isLocked ? "rgba(253,224,71,0.18)" : `${color}18`,
              "rgba(2,3,6,0.48)",
              "rgba(255,255,255,0.035)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <LinearGradient
            colors={[
              "rgba(255,255,255,0.13)",
              "rgba(255,255,255,0.025)",
              "transparent",
            ]}
            locations={[0, 0.35, 1]}
            style={styles.cardTopReflect}
          />

          <View style={styles.cardRainA} />
          <View
            style={[
              styles.cardRainB,
              { backgroundColor: `${isLocked ? GOLD : color}14` },
            ]}
          />
          <View style={styles.cardRainC} />
          <View
            style={[
              styles.cardRainDrop,
              { backgroundColor: isLocked ? GOLD : color },
            ]}
          />

          <View
            style={[
              styles.cardAccent,
              {
                backgroundColor: isLocked ? GOLD : color,
                shadowColor: isLocked ? GOLD : color,
              },
            ]}
          />

          <View style={styles.cardIconZone}>
            <View
              style={[
                styles.cardIconBox,
                {
                  borderColor: `${isLocked ? GOLD : color}55`,
                  backgroundColor: `${isLocked ? GOLD : color}12`,
                  shadowColor: isLocked ? GOLD : color,
                  shadowOpacity: isLocked ? 0.28 : 0.22,
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.24)",
                  "rgba(255,255,255,0.05)",
                  "transparent",
                ]}
                locations={[0, 0.45, 1]}
                style={styles.cardIconLight}
              />

              <Text
                style={[
                  styles.cardIcon,
                  {
                    color: isLocked ? GOLD : color,
                    textShadowColor: isLocked ? GOLD : color,
                  },
                ]}
              >
                {icon}
              </Text>
            </View>
          </View>

          <View style={styles.cardDividerLine} />

          {isLocked && (
            <View style={styles.premiumTag}>
              <Text style={styles.premiumTagText}>PREMIUM 🔒</Text>
            </View>
          )}

          <View style={styles.cardTextContent}>
            <Text style={[styles.cardMeta, isLocked && styles.cardMetaPremium]}>
              {isLocked ? "MODULE PREMIUM" : "PARCOURS HANGUL"}
            </Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSub}>
              {isLocked ? "Débloquer ce module exclusif" : subtitle}
            </Text>
          </View>

          <Text
            style={[
              styles.cardArrow,
              isLocked && { color: GOLD, opacity: 0.8 },
            ]}
          >
            {isLocked ? "✧" : "›"}
          </Text>
        </BlurView>
      </Pressable>
    </Link>
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

  bgImage: { flex: 1 },
  bgBlur: {
    ...StyleSheet.absoluteFillObject,
  },

  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.48)",
  },

  topFade: {
    ...StyleSheet.absoluteFillObject,
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

  // CARD
  cardPressable: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(2,3,6,0.26)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  themeCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    position: "relative",
  },

  cardTopReflect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    opacity: 0.55,
  },

  cardRainA: {
    position: "absolute",
    top: 0,
    left: "18%",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  cardRainB: {
    position: "absolute",
    top: 0,
    left: "54%",
    width: 1,
    height: "100%",
  },

  cardRainC: {
    position: "absolute",
    top: 0,
    right: "18%",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  cardRainDrop: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.65,
  },

  premiumCardBorder: {
    borderColor: "rgba(253,224,71,0.28)",
  },

  cardAccent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  cardIconZone: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginRight: 10,
    position: "relative",
  },

  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },

  cardIconLight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "58%",
    borderRadius: 22,
  },

  cardIcon: {
    fontSize: 21,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },

  cardDividerLine: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 12,
  },

  premiumTag: {
    position: "absolute",
    top: 10,
    right: 18,
    backgroundColor: GOLD,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },

  premiumTagText: {
    color: "#000",
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 0.5,
  },

  cardTextContent: {
    flex: 1,
  },

  cardMeta: {
    fontSize: 7.8,
    fontFamily: fonts.bold,
    color: "rgba(255,255,255,0.44)",
    letterSpacing: 2.1,
    marginBottom: 4,
  },

  cardMetaPremium: {
    color: "rgba(253,224,71,0.78)",
  },

  cardTitle: {
    color: TXT,
    fontSize: 18,
    fontFamily: fonts.bold,
  },

  cardSub: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: MUTED,
    marginTop: 2,
  },

  cardArrow: {
    color: SOFT,
    fontSize: 22,
    opacity: 0.3,
  },
});
