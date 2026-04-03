import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — ALIGNÉ SUR SPEAK / HANGUL
// ──────────────────────────────────────────────
const BG_DEEP = "#050508";
const BG_NAVY = "#0A0D1A";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.68)";
const FAINT = "rgba(255,255,255,0.45)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const ORANGE = "#FB923C";
const PURPLE = "#C084FC";
const TEAL = "#14B8A6";

const NEON = {
  purple: {
    core: PURPLE,
    halo: "rgba(168,85,247,0.42)",
    ambient: "rgba(168,85,247,0.22)",
  },
  cyan: {
    core: CYAN,
    halo: "rgba(34,211,238,0.42)",
    ambient: "rgba(34,211,238,0.22)",
  },
  pink: {
    core: PINK,
    halo: "rgba(244,114,182,0.42)",
    ambient: "rgba(244,114,182,0.22)",
  },
  orange: {
    core: ORANGE,
    halo: "rgba(251,146,60,0.42)",
    ambient: "rgba(251,146,60,0.22)",
  },
  teal: {
    core: TEAL,
    halo: "rgba(20,184,166,0.40)",
    ambient: "rgba(20,184,166,0.20)",
  },
} as const;

const fonts = {
  medium: "Outfit_500Medium",
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  kr: "NotoSansKR_700Bold",
};

type NeonKey = keyof typeof NEON;

// ──────────────────────────────────────────────
// BACKGROUND
// ──────────────────────────────────────────────
function CinematicBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[BG_DEEP, BG_NAVY]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.pageGlow,
          {
            top: -140,
            left: -90,
            backgroundColor: "rgba(168,85,247,0.07)",
          },
        ]}
      />
      <View
        style={[
          styles.pageGlow,
          {
            bottom: 80,
            right: -100,
            backgroundColor: "rgba(34,211,238,0.05)",
          },
        ]}
      />

      <BlurView intensity={92} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

// ──────────────────────────────────────────────
// GLASS PILL
// ──────────────────────────────────────────────
function GlassPill({
  label,
  colorName = "cyan",
  active = true,
}: {
  label: string;
  colorName?: NeonKey;
  active?: boolean;
}) {
  const neon = NEON[colorName];

  return (
    <View style={styles.pillWrap}>
      <BlurView
        intensity={active ? 28 : 16}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.pillInner,
          {
            backgroundColor: active
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.045)",
            borderColor: active
              ? "rgba(255,255,255,0.14)"
              : "rgba(255,255,255,0.08)",
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            {
              color: active ? neon.core : TXT,
              textShadowColor: active ? neon.halo : "transparent",
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────
function Hero({ onExplorePress }: { onExplorePress: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, [pulseAnim]);

  return (
    <View style={styles.heroContainer}>
      <Text style={styles.heroEyebrow}>LEXIQUE ESSENTIEL</Text>
      <Text style={styles.heroTitle}>Vocabulaire</Text>

      <BlurView intensity={88} tint="dark" style={styles.glassCard}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.09)",
            "transparent",
            "rgba(251,146,60,0.07)",
          ]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardHeader}>
          <View style={[styles.statusDot, { backgroundColor: ORANGE }]} />
          <Text style={styles.cardHeaderText}>MOTS DU QUOTIDIEN</Text>
        </View>

        <View style={styles.cardMainContent}>
          <Animated.Text
            style={[
              styles.krBig,
              {
                transform: [{ scale: pulseAnim }],
                textShadowColor: ORANGE,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 28,
              },
            ]}
          >
            어휘
          </Animated.Text>

          <View style={styles.speechBubble}>
            <Text style={styles.bubbleText}>
              Apprends les mots essentiels par le thème de ton choix.
            </Text>
          </View>
        </View>

        <View style={styles.cardFooterWrap}>
          <View style={styles.cardFooterRow}>
            <GlassPill label="Quotidien" colorName="orange" active />
            <GlassPill label="Situations" colorName="cyan" active={false} />
            <GlassPill label="Oral naturel" colorName="pink" active={false} />
          </View>
        </View>
      </BlurView>
    </View>
  );
}

// ──────────────────────────────────────────────
// THEME CARD — MÊME PRINCIPE QUE SCENES / ÉTAPES
// ──────────────────────────────────────────────
function ThemeCard({
  title,
  subtitle,
  href,
  icon,
  colorName,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  colorName: NeonKey;
}) {
  const neon = NEON[colorName];

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
              colors={[neon.ambient, `${neon.core}08`, "transparent"]}
              start={{ x: 0.0, y: 0.5 }}
              end={{ x: 1.0, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[styles.cardAccentLine, { backgroundColor: neon.core }]}
            />

            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: `${neon.core}22`,
                  borderColor: `${neon.core}50`,
                },
              ]}
            >
              <Text style={styles.themeIcon}>{icon}</Text>
            </View>

            <View style={styles.stepTextWrap}>
              <Text style={styles.themeTitle}>{title}</Text>
              <Text style={styles.themeSub}>{subtitle}</Text>
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
// PAGE
// ──────────────────────────────────────────────
export default function VocabularyHub() {
  const scrollRef = useRef<ScrollView>(null);
  const [themesY, setThemesY] = useState(0);

  const handleThemesLayout = (e: LayoutChangeEvent) => {
    setThemesY(e.nativeEvent.layout.y);
  };

  const handleExplorePress = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(themesY - 14, 0),
      animated: true,
    });
  };

  const THEMES = [
    {
      title: "Météo",
      subtitle: "Temps, saisons, température, phrases utiles.",
      href: "/voc/meteo",
      icon: "🌦️",
      colorName: "cyan" as const,
    },
    {
      title: "Objets du quotidien",
      subtitle: "Maison, bureau, sac, tech… les mots les plus utiles.",
      href: "/voc/objets",
      icon: "👜",
      colorName: "orange" as const,
    },
    {
      title: "Animaux",
      subtitle: "Animaux courants et vocabulaire simple du quotidien.",
      href: "/voc/animals",
      icon: "🐾",
      colorName: "pink" as const,
    },
    {
      title: "Voyage",
      subtitle: "Aéroport, hôtel, transports, imprévus utiles.",
      href: "/voc/voyage",
      icon: "✈️",
      colorName: "cyan" as const,
    },
    {
      title: "Lieux & bâtiments",
      subtitle: "Repères, étages, bâtiments, orientation simple.",
      href: "/voc/lieux",
      icon: "🏢",
      colorName: "purple" as const,
    },
    {
      title: "Santé & corps humain",
      subtitle: "Corps, symptômes simples, pharmacie, urgences légères.",
      href: "/voc/health",
      icon: "🩺",
      colorName: "teal" as const,
    },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG_DEEP }} edges={["top"]}>
      <CinematicBackground />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Hero onExplorePress={handleExplorePress} />

        <View style={{ height: 48 }} />

        <View style={styles.section}>
          <Text onLayout={handleThemesLayout} style={styles.sectionTitle}>
            Thèmes
          </Text>

          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.href}
              title={theme.title}
              subtitle={theme.subtitle}
              href={theme.href}
              icon={theme.icon}
              colorName={theme.colorName}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  pageGlow: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },

  heroContainer: {
    alignItems: "center",
  },

  heroEyebrow: {
    color: ORANGE,
    fontFamily: fonts.bold,
    fontSize: 13.5,
    letterSpacing: 3.2,
    marginBottom: 8,
    textTransform: "uppercase",
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
    minHeight: 252,
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
    backgroundColor: "rgba(0,0,0,0.48)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    width: "100%",
    marginBottom: 18,
  },

  bubbleText: {
    color: MUTED,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: "center",
    fontFamily: fonts.medium,
  },

  heroButtonPressable: {
    marginTop: 2,
  },

  heroButtonShell: {
    minWidth: 230,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  heroButtonText: {
    color: TXT,
    fontSize: 16,
    fontFamily: fonts.bold,
  },

  cardFooterWrap: {
    marginTop: 10,
  },

  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  pillWrap: {
    overflow: "hidden",
    borderRadius: 999,
  },

  pillInner: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },

  pillText: {
    fontSize: 10,
    fontFamily: fonts.black,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    textShadowRadius: 6,
  },

  section: {
    width: "100%",
  },

  sectionTitle: {
    color: TXT,
    fontSize: 23,
    fontFamily: fonts.black,
    letterSpacing: -0.7,
    marginBottom: 20,
  },

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

  themeIcon: {
    fontSize: 26,
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
    lineHeight: 20,
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
