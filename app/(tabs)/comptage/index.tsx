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
const BACKGROUND_SOURCE = require("../../../assets/images/comptage.png");
const HERO_CIRCLE = width * 0.76;

// ----------------------------------------------
// DESIGN TOKENS
// ----------------------------------------------
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

// ----------------------------------------------
// MODULES (STRATÉGIE PRODUIT OPTIMISÉE)
// ----------------------------------------------
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

// ----------------------------------------------
// SCREEN
// ----------------------------------------------
export default function ComptageHub() {
  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <BlurView intensity={30} tint="dark" style={styles.bgBlur} />
        <View style={styles.vignetteOverlay} />
        <View style={styles.topFade} />
        <View style={styles.bottomFade} />

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
            <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
            <View style={styles.heroVisualWrap}>
              <View style={styles.krWrap}>
                <Text style={[styles.kr, styles.krGlowOuter]}>숫자</Text>
                <Text style={[styles.kr, styles.krGlowInner]}>숫자</Text>
                <Text style={styles.kr}>숫자</Text>
              </View>
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
                    intensity={40}
                    tint="dark"
                    style={[
                      styles.card,
                      m.isLocked && styles.premiumCardBorder,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        m.isLocked ? "rgba(253,224,71,0.18)" : `${m.color}18`,
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
                        { backgroundColor: `${m.isLocked ? GOLD : m.color}14` },
                      ]}
                    />
                    <View style={styles.cardRainC} />
                    <View
                      style={[
                        styles.cardRainDrop,
                        { backgroundColor: m.isLocked ? GOLD : m.color },
                      ]}
                    />

                    <View
                      style={[
                        styles.accent,
                        {
                          backgroundColor: m.isLocked ? GOLD : m.color,
                          shadowColor: m.isLocked ? GOLD : m.color,
                        },
                      ]}
                    />

                    <View style={styles.cardIconZone}>
                      <View
                        style={[
                          styles.cardIconBox,
                          {
                            borderColor: `${m.isLocked ? GOLD : m.color}55`,
                            backgroundColor: `${m.isLocked ? GOLD : m.color}12`,
                            shadowColor: m.isLocked ? GOLD : m.color,
                            shadowOpacity: m.isLocked ? 0.28 : 0.22,
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
                              color: m.isLocked ? GOLD : m.color,
                              textShadowColor: m.isLocked ? GOLD : m.color,
                            },
                          ]}
                        >
                          {m.title.charAt(0)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDividerLine} />

                    {m.isLocked && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>PREMIUM 🔒</Text>
                      </View>
                    )}

                    <View style={styles.cardText}>
                      <Text
                        style={[
                          styles.cardMeta,
                          m.isLocked && styles.cardMetaPremium,
                        ]}
                      >
                        {m.isLocked ? "MODULE PREMIUM" : "FONDATION NUMÉRIQUE"}
                      </Text>
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

// ----------------------------------------------
// ANIMATION
// ----------------------------------------------
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

// ----------------------------------------------
// STYLES
// ----------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1 },
  bgBlur: {
    ...StyleSheet.absoluteFillObject,
  },

  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.46)",
  },

  topFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
    backgroundColor: "rgba(2,3,6,0.30)",
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

  heroVisualWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 360,
    position: "relative",
  },

  kr: {
    fontSize: 74,
    fontFamily: fonts.krBold,
    color: "rgba(245,252,255,0.98)",
    textShadowColor: "rgba(56,189,248,0.92)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    marginBottom: 2,
  },

  krWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  krGlowOuter: {
    position: "absolute",
    color: "rgba(56,189,248,0.18)",
    textShadowColor: "rgba(56,189,248,1)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 42,
  },

  krGlowInner: {
    position: "absolute",
    color: "rgba(180,238,255,0.36)",
    textShadowColor: "rgba(103,232,249,0.95)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  title: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.96)",
    letterSpacing: -0.7,
    textAlign: "center",
  },

  badge: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  badgeText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 3,
  },

  subtitle: {
    marginTop: 30,
    maxWidth: "82%",
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    fontStyle: "italic",
  },

  divider: {
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

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  grid: {
    gap: 12,
  },

  cardWrap: {
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

  card: {
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

  premiumCardBorder: {
    borderColor: "rgba(253,224,71,0.28)",
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
    width: 4,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
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

  cardText: {
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
