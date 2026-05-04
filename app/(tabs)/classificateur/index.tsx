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
const BACKGROUND_SOURCE = require("../../../assets/images/classificateur.png");

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
const CARD_HEIGHT = 100;
const CARD_RADIUS = 24;

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

const CLASSIFIERS = [
  {
    id: 1,
    title: "Objets divers",
    sub: "Le classificateur universel (개)",
    color: CYAN,
    route: "/classificateur/objects",
    isLocked: false,
  },
  {
    id: 2,
    title: "Personnes",
    sub: "Compter les humains (명 / 분)",
    color: "#818CF8",
    route: "/classificateur/people",
    isLocked: false,
  },
  {
    id: 3,
    title: "Animaux",
    sub: "Êtres vivants (마리)",
    color: "#F472B6",
    route: "/classificateur/animals",
    isLocked: true,
  },
  {
    id: 4,
    title: "Livres & Papier",
    sub: "Supports écrits (권 / 장)",
    color: "#34D399",
    route: "/classificateur/paper",
    isLocked: true,
  },
  {
    id: 5,
    title: "Bouteilles & Verres",
    sub: "Boissons et contenants (병 / 잔)",
    color: "#FBBF24",
    route: "/classificateur/drinks",
    isLocked: true,
  },
  {
    id: 6,
    title: "Machines & Véhicules",
    sub: "Technologie et transport (대)",
    color: "#A78BFA",
    route: "/classificateur/machines",
    isLocked: true,
  },
];

export default function ClassifiersHub() {
  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bgImage}>
        <BlurView intensity={70} tint="dark" style={styles.bgBlur} />
        <View style={styles.vignetteOverlay} />
        <View style={styles.topFade} />
        <View style={styles.bottomFade} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <UnifiedNavHeader />

          <UnifiedHeroHeader
            korean="단위 명사"
            title="Classificateurs"
            subtitle={`"L'art de compter avec précision."`}
            accent={CYAN}
          />

          <UnifiedSectionHeader title="UNITÉS DE MESURE CORÉENNES" />

          <View style={styles.grid}>
            {CLASSIFIERS.map((item, i) => (
              <AnimatedFragment key={item.id} index={i}>
                <ClassifierCard
                  title={item.title}
                  subtitle={item.sub}
                  color={item.color}
                  route={item.route}
                  isLocked={item.isLocked}
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
// COMPONENTS
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

function UnifiedHeroHeader({ korean, title, subtitle, accent }: any) {
  return (
    <View style={styles.heroBlock}>
      <Text style={styles.heroEyebrow}>GRAMMAIRE VISUELLE</Text>
      <View style={styles.heroVisualWrap}>
        <View style={styles.heroKoreanWrap}>
          <Text style={[styles.heroKorean, styles.heroKoreanGlowOuter]}>
            {korean}
          </Text>
          <Text style={[styles.heroKorean, styles.heroKoreanGlowInner]}>
            {korean}
          </Text>
          <Text style={[styles.heroKorean, { textShadowColor: accent }]}>
            {korean}
          </Text>
        </View>
        <Text style={styles.heroTitle}>{title}</Text>
        <BlurView intensity={18} tint="dark" style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>IMMERSION NIVEAU 1</Text>
        </BlurView>
        <Text style={styles.heroQuote}>{subtitle}</Text>
      </View>
    </View>
  );
}

function UnifiedSectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionDivider}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.titleLine} />
    </View>
  );
}

function AnimatedFragment({ children, index }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      {children}
    </Animated.View>
  );
}

function ClassifierCard({ title, subtitle, color, route, isLocked }: any) {
  const icon = title.charAt(0);

  return (
    <Pressable style={styles.cardPressable} onPress={() => router.push(route)}>
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
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PREMIUM 🔒</Text>
          </View>
        )}

        <View style={styles.cardTextContent}>
          <Text style={[styles.cardMeta, isLocked && styles.cardMetaPremium]}>
            {isLocked ? "MODULE PREMIUM" : "UNITÉ DE MESURE"}
          </Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSub}>
            {isLocked ? "Débloquer ce module exclusif" : subtitle}
          </Text>
        </View>

        <Text
          style={[styles.cardArrow, isLocked && { color: GOLD, opacity: 0.8 }]}
        >
          {isLocked ? "✧" : "›"}
        </Text>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1 },
  bgBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topFade: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: "rgba(2,3,6,0.24)",
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 120 },
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  backArrow: { color: TXT, fontSize: 28 },
  backText: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 2,
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
    borderColor: "rgba(255,255,255,0.3)",
    opacity: 0.7,
  },
  heroBlock: { marginTop: 34, alignItems: "center" },
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
  heroKoreanWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  heroKorean: {
    fontSize: 74,
    fontFamily: fonts.kr,
    color: "rgba(245,252,255,0.98)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    marginBottom: 2,
  },
  heroKoreanGlowOuter: {
    position: "absolute",
    color: "rgba(56,189,248,0.18)",
    textShadowColor: "rgba(56,189,248,1)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 42,
  },
  heroKoreanGlowInner: {
    position: "absolute",
    color: "rgba(180,238,255,0.36)",
    textShadowColor: "rgba(103,232,249,0.95)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
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
  titleLine: { flex: 1, height: 1, backgroundColor: LINE_SOFT },
  grid: { gap: 12 },
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
  premiumCardBorder: { borderColor: "rgba(253,224,71,0.28)" },
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
  cardTitle: { color: TXT, fontSize: 18, fontFamily: fonts.bold },
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
});
