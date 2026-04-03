import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../../_store";

// ──────────────────────────────────────────────
// DESIGN SYSTEM
// ──────────────────────────────────────────────
const BG_DEEP = "#050508";
const BG_NAVY = "#0A0D1A";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.68)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const ORANGE = "#FB923C";
const PURPLE = "#C084FC";

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
  accent: string;
  gradient: string[];
};

const HANGUL_MODULES: HangulModule[] = [
  {
    title: "Voyelles de base",
    sub: "6 voyelles",
    href: "/(tabs)/hangul/vowels-basic",
    icon: "ㅏ",
    accent: PINK,
    gradient: [
      "rgba(244, 114, 182, 0.22)",
      "rgba(244, 114, 182, 0.08)",
      "transparent",
    ],
  },
  {
    title: "Consonnes de base",
    sub: "14 consonnes",
    href: "/(tabs)/hangul/consonants-basic",
    icon: "ㄱ",
    accent: CYAN,
    gradient: [
      "rgba(34, 211, 238, 0.22)",
      "rgba(34, 211, 238, 0.08)",
      "transparent",
    ],
  },
  {
    title: "Voyelles composées",
    sub: "Combinaisons avancées",
    href: "/(tabs)/hangul/vowels-compound",
    icon: "ㅘ",
    accent: PURPLE,
    gradient: [
      "rgba(192, 132, 252, 0.22)",
      "rgba(192, 132, 252, 0.08)",
      "transparent",
    ],
  },
  {
    title: "Consonnes doubles",
    sub: "Sons tendus",
    href: "/(tabs)/hangul/consonants-tense",
    icon: "ㄲ",
    accent: PINK,
    gradient: [
      "rgba(244, 114, 182, 0.22)",
      "rgba(244, 114, 182, 0.08)",
      "transparent",
    ],
  },
  {
    title: "Batchim",
    sub: "Consonnes finales",
    href: "/(tabs)/hangul/batchim",
    icon: "각",
    accent: CYAN,
    gradient: [
      "rgba(34, 211, 238, 0.22)",
      "rgba(34, 211, 238, 0.08)",
      "transparent",
    ],
  },
];

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function HangulHub() {
  const { progress } = useStore();
  const displayLevel = Math.max(1, progress.hangulLevel ?? 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG_DEEP }}>
      <LinearGradient colors={[BG_DEEP, BG_NAVY]} style={{ flex: 1 }}>
        <View
          style={[
            styles.pageGlow,
            { top: -140, left: -100, backgroundColor: "rgba(168,85,247,0.07)" },
          ]}
        />
        <View
          style={[
            styles.pageGlow,
            {
              bottom: 100,
              right: -90,
              backgroundColor: "rgba(34,211,238,0.05)",
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <HangulHero displayLevel={displayLevel} />

          <View style={{ height: 48 }} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Étapes d'apprentissage</Text>

            {HANGUL_MODULES.map((module) => (
              <HangulStepCard
                key={module.href}
                title={module.title}
                sub={module.sub}
                icon={module.icon}
                href={module.href}
                accent={module.accent}
                gradient={module.gradient}
              />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────
function HangulHero({ displayLevel }: { displayLevel: number }) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.heroContainer}>
      <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
      <Text style={styles.heroTitle}>Hangul</Text>

      <BlurView intensity={88} tint="dark" style={styles.glassCard}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.09)",
            "transparent",
            "rgba(244,114,182,0.07)",
          ]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardHeader}>
          <View style={[styles.statusDot, { backgroundColor: "#F472B6" }]} />
          <Text style={styles.cardHeaderText}>FONDATIONS CORÉENNES</Text>
        </View>

        <View style={styles.cardMainContent}>
          {/* 🔥 VERSION ANIMÉE */}
          <Animated.Text
            style={[
              styles.krBig,
              {
                transform: [{ scale: pulseAnim }],
                textShadowColor: "#F472B6",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 28,
              },
            ]}
          >
            한글
          </Animated.Text>

          <View style={styles.speechBubble}>
            <Text style={styles.bubbleText}>
              Apprendre l'alphabet coréen par étape.
            </Text>
          </View>
        </View>

        {/* footer inchangé */}
      </BlurView>
    </View>
  );
}

// ──────────────────────────────────────────────
// STEP CARD — EXACTEMENT MÊME LOGIQUE QUE SCENES
// ──────────────────────────────────────────────
function HangulStepCard({
  title,
  sub,
  icon,
  href,
  accent,
  gradient,
}: {
  title: string;
  sub: string;
  icon: string;
  href: string;
  accent: string;
  gradient: string[];
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.themeCard,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View style={styles.themeCardShell}>
          <BlurView intensity={80} tint="dark" style={styles.themeCardBlur}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0.0, y: 0.5 }}
              end={{ x: 1.0, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[styles.cardAccentLine, { backgroundColor: accent }]}
            />

            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: `${accent}22`,
                  borderColor: `${accent}50`,
                },
              ]}
            >
              <Text style={styles.hangulIcon}>{icon}</Text>
            </View>

            <View style={styles.stepTextWrap}>
              <Text style={styles.themeTitle}>{title}</Text>
              <Text style={styles.themeSub}>{sub}</Text>
            </View>

            <View style={styles.arrowWrap}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </BlurView>
        </View>
      </Pressable>
    </Link>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },

  pageGlow: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
  },

  heroContainer: {
    alignItems: "center",
  },

  heroEyebrow: {
    color: PINK,
    fontFamily: fonts.bold,
    fontSize: 13.5,
    letterSpacing: 3.2,
    marginBottom: 8,
  },

  heroTitle: {
    color: TXT,
    fontSize: 46,
    fontFamily: fonts.black,
    letterSpacing: -1.4,
    marginTop: 15,
    marginBottom: 35,
  },

  glassCard: {
    width: 340,
    minHeight: 242,
    borderRadius: 34,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
    padding: 24,
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  cardHeaderText: {
    color: MUTED,
    fontSize: 11.5,
    fontFamily: fonts.bold,
    letterSpacing: 1.6,
  },

  cardMainContent: {
    alignItems: "center",
    marginVertical: 12,
  },

  krBig: {
    color: TXT,
    fontSize: 56,
    fontFamily: fonts.kr,
    marginBottom: 16,
  },

  speechBubble: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.48)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    width: "100%",
  },

  bubbleText: {
    color: MUTED,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: "center",
    fontFamily: fonts.medium,
  },

  cardFooterWrap: {
    marginTop: 8,
  },

  cardFooterRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 10,
  },

  cardFooterSingle: {
    flexDirection: "row",
    justifyContent: "center",
  },

  miniTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },

  miniTagText: {
    color: TXT,
    fontSize: 11.5,
    fontFamily: fonts.medium,
  },

  section: {
    width: "100%",
  },

  sectionTitle: {
    color: TXT,
    fontSize: 23,
    fontFamily: fonts.black,
    marginBottom: 28,
    letterSpacing: -0.7,
  },

  // conteneur qui force la vraie séparation visuelle carte par carte
  themeCardShell: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.02)",
    marginBottom: 14,
  },

  themeCardBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    position: "relative",
    minHeight: 94,
  },

  cardAccentLine: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.9,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  hangulIcon: {
    fontSize: 28,
    fontFamily: fonts.kr,
    color: TXT,
  },

  stepTextWrap: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 12,
  },

  themeTitle: {
    color: TXT,
    fontSize: 19,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
  },

  themeSub: {
    color: MUTED,
    fontSize: 14,
    marginTop: 4,
    fontFamily: fonts.medium,
  },

  arrowWrap: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 24,
    alignSelf: "stretch",
  },

  arrow: {
    color: MUTED,
    fontSize: 26,
    fontWeight: "300",
  },
});
