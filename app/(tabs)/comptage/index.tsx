import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");
const HERO_CIRCLE = width * 0.76;

// ──────────────────────────────────────────────
// DESIGN TOKENS
// ──────────────────────────────────────────────
const BG_DEEP = "#020306";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.60)";
const SOFT = "rgba(255,255,255,0.45)";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const GOLD = "#FDE047"; // Teinte Premium

const fonts = {
  medium: "Outfit_500Medium",
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  krBold: "NotoSansKR_700Bold",
};

// ──────────────────────────────────────────────
// MODULES (STRATÉGIE PRODUIT OPTIMISÉE)
// ──────────────────────────────────────────────
const MODULES = [
  {
    title: "Nombres de base",
    sub: "Système coréen natif",
    color: CYAN,
    route: "/comptage/base",
    isLocked: false,
  },
  {
    title: "Nombres sino-coréens",
    sub: "Système numérique officiel",
    color: "#818CF8",
    route: "/comptage/sino",
    isLocked: false,
  },
  {
    title: "Heures & Minutes",
    sub: "Le défi du système mixte",
    color: "#F472B6",
    route: "/comptage/heures",
    isLocked: true,
  },
  {
    title: "Shopping & Prix",
    sub: "Gérer l'argent au quotidien",
    color: "#34D399",
    route: "/comptage/prix",
    isLocked: true,
  },
  {
    title: "Téléphone & Contact",
    sub: "Numéros, étages et bus",
    color: "#2DD4BF",
    route: "/comptage/phone",
    isLocked: true,
  },
  {
    title: "Dates & Calendrier",
    sub: "Jours, mois et années",
    color: "#FB7185",
    route: "/comptage/dates",
    isLocked: true,
  },
  {
    title: "Âge & Vie",
    sub: "Le système coréen unique",
    color: "#FBBF24",
    route: "/comptage/age",
    isLocked: true,
  },
  {
    title: "Ordinaux",
    sub: "Premier, deuxième, troisième...",
    color: "#A78BFA",
    route: "/comptage/ordinals",
    isLocked: true,
  },
];

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function ComptageHub() {
  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bgImage}>
        <View style={styles.vignetteOverlay} />
        <View style={styles.topFade} />
        <View style={styles.bottomFade} />

        <View style={[styles.globalGlowLeft, { backgroundColor: PINK }]} />
        <View style={[styles.globalGlowRight, { backgroundColor: CYAN }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL</Text>
            </Pressable>
            <View style={styles.settingsIcon} />
          </View>

          {/* HERO */}
          <View style={styles.heroBlock}>
            <View style={styles.heroVisualWrap}>
              <View style={[styles.heroCirclePink, { backgroundColor: PINK }]} />
              <View style={[styles.heroCircleCyan, { backgroundColor: CYAN }]} />

              <BlurView intensity={22} tint="dark" style={styles.heroCircleGlass}>
                <LinearGradient
                  colors={[
                    "rgba(255,255,255,0.06)",
                    "rgba(255,255,255,0.02)",
                    "rgba(255,255,255,0.01)",
                  ]}
                  start={{ x: 0.12, y: 0.08 }}
                  end={{ x: 0.88, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </BlurView>

              <View
                style={[
                  styles.heroLine,
                  { backgroundColor: "rgba(34,211,238,0.34)" },
                ]}
              />

              <Text style={styles.kr}>숫자</Text>
              <Text style={styles.title}>Comptage</Text>

              <BlurView intensity={18} tint="dark" style={styles.badge}>
                <Text style={styles.badgeText}>IMMERSION NIVEAU 1</Text>
              </BlurView>

              <Text style={styles.subtitle}>
                "Comprendre le rythme numérique de la ville."
              </Text>
            </View>
          </View>

          {/* SECTION */}
          <View style={styles.divider}>
            <Text style={styles.sectionTitle}>FONDATIONS NUMÉRIQUES</Text>
            <View style={styles.line} />
          </View>

          {/* CARDS */}
          <View style={styles.grid}>
            {MODULES.map((m, i) => (
              <AnimatedItem key={i} index={i}>
                <Pressable
                  style={styles.cardWrap}
                  onPress={() => router.push(m.route)}
                >
                  <BlurView
                    intensity={30}
                    tint="dark"
                    style={[
                      styles.card,
                      m.isLocked && styles.premiumCardBorder,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        m.isLocked
                          ? ["rgba(253,224,71,0.12)", "transparent"]
                          : [`${m.color}18`, "transparent"]
                      }
                      style={StyleSheet.absoluteFill}
                    />

                    <View
                      style={[
                        styles.accent,
                        { backgroundColor: m.isLocked ? GOLD : m.color },
                      ]}
                    />

                    {m.isLocked && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>PREMIUM 🔒</Text>
                      </View>
                    )}

                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{m.title}</Text>
                      <Text style={styles.cardSub}>
                        {m.isLocked ? "Débloquer ce module exclusif" : m.sub}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.arrow,
                        m.isLocked && { color: GOLD, opacity: 0.8 },
                      ]}
                    >
                      {m.isLocked ? "✧" : "›"}
                    </Text>
                  </BlurView>
                </Pressable>
              </AnimatedItem>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// ANIMATION
// ──────────────────────────────────────────────
function AnimatedItem({ children, index }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 700,
        delay: index * 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateY: translate }],
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
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1 },

  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.80)",
  },

  topFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.10)",
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: "rgba(2,3,6,0.24)",
  },

  globalGlowLeft: {
    position: "absolute",
    top: 140,
    left: -90,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.08,
  },

  globalGlowRight: {
    position: "absolute",
    top: 300,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.08,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  backArrow: { color: SOFT, fontSize: 28 },
  backText: {
    color: SOFT,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
  },

  settingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: MUTED,
    opacity: 0.3,
  },

  heroBlock: {
    marginTop: 8,
    marginBottom: 18,
  },

  heroVisualWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 330,
    marginBottom: 8,
  },

  heroCirclePink: {
    position: "absolute",
    width: HERO_CIRCLE,
    height: HERO_CIRCLE,
    borderRadius: HERO_CIRCLE / 2,
    left: -20,
    top: 2,
    opacity: 0.12,
  },

  heroCircleCyan: {
    position: "absolute",
    width: HERO_CIRCLE,
    height: HERO_CIRCLE,
    borderRadius: HERO_CIRCLE / 2,
    right: -20,
    top: 2,
    opacity: 0.1,
  },

  heroCircleGlass: {
    position: "absolute",
    width: HERO_CIRCLE,
    height: HERO_CIRCLE,
    borderRadius: HERO_CIRCLE / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  heroLine: {
    position: "absolute",
    top: 84,
    left: 56,
    right: 56,
    height: 1,
  },

  kr: {
    fontSize: 74,
    fontFamily: fonts.krBold,
    color: "rgba(245,252,255,0.98)",
    marginBottom: 2,
  },

  title: {
    marginTop: 6,
    fontSize: 34,
    lineHeight: 38,
    fontFamily: fonts.black,
    color: TXT,
    letterSpacing: -0.8,
  },

  badge: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  badgeText: {
    color: SOFT,
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 20,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: MUTED,
    textAlign: "center",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: SOFT,
    letterSpacing: 2,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  grid: {
    gap: 12,
  },

  cardWrap: {
    borderRadius: 20,
    overflow: "hidden",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: 90,
  },

  premiumCardBorder: {
    borderColor: "rgba(253,224,71,0.25)",
  },

  premiumBadge: {
    position: "absolute",
    top: 10,
    right: 18,
    backgroundColor: GOLD,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },

  premiumBadgeText: {
    color: "#000",
    fontSize: 8,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },

  accent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  cardText: {
    flex: 1,
    marginLeft: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: TXT,
  },

  cardSub: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: MUTED,
    marginTop: 2,
  },

  arrow: {
    color: SOFT,
    fontSize: 22,
    opacity: 0.3,
  },
});
