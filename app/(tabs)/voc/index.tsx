import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
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
const AMBER = "#F6C27A";
const GOLD = "#FDE047"; // Teinte Premium

const HERO_CIRCLE = width * 0.76;
const CARD_HEIGHT = 112;
const CARD_RADIUS = 28;

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

const THEMES = [
  {
    id: 1,
    title: "Gastronomie",
    sub: "Restaurants et Street Food",
    color: "#F87171",
    route: "/voc/gastronomie",
    image: {
      uri: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: false,
  },
  {
    id: 2,
    title: "Premiers Pas",
    sub: "Salutations et survie",
    color: "#60A5FA",
    route: "/voc/basics",
    image: {
      uri: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: false,
  },
  {
    id: 6,
    title: "Transport & Ville",
    sub: "S'orienter dans Séoul",
    color: "#2DD4BF",
    route: "/voc/transport",
    image: {
      uri: "https://images.unsplash.com/photo-1538669715515-5c3b99613101?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: false,
  },
  {
    id: 3,
    title: "K-Drama Culture",
    sub: "Expressions cultes et argot",
    color: "#A78BFA",
    route: "/voc/kdrama",
    image: {
      uri: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: true,
  },
  {
    id: 4,
    title: "Romance & Dating",
    sub: "Sentiments et rencontres",
    color: "#F472B6",
    route: "/voc/romance",
    image: {
      uri: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: true,
  },
  {
    id: 5,
    title: "Vie Nocturne",
    sub: "Sorties, Bars et Soju",
    color: "#818CF8",
    route: "/voc/nuit",
    image: {
      uri: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: true,
  },
  {
    id: 7,
    title: "Urgence & Santé",
    sub: "Hôpital et pharmacie",
    color: "#34D399",
    route: "/voc/sante",
    image: {
      uri: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: true,
  },
  {
    id: 8,
    title: "Business",
    sub: "Travail et réseautage",
    color: "#FB7185",
    route: "/voc/work",
    image: {
      uri: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: true,
  },
];
export default function VocabHub() {
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
          contentContainerStyle={styles.scrollContent}
        >
          <UnifiedNavHeader />

          <UnifiedHeroHeader
            korean="어휘"
            title="Vocabulaire"
            subtitle={`"Le lexique, l’essence de la ville."`}
            accent={AMBER}
          />

          <View style={styles.tabRow}>
            <BlurView intensity={26} tint="dark" style={styles.activeTab}>
              <LinearGradient
                colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.tabText}>Thèmes</Text>
            </BlurView>

            <Pressable style={styles.inactiveTab}>
              <Text style={styles.inactiveTabText}>Favoris</Text>
            </Pressable>

            <Pressable style={styles.inactiveTab}>
              <Text style={styles.inactiveTabText}>Quiz</Text>
            </Pressable>
          </View>

          <UnifiedSectionHeader title="COLLECTIONS THÉMATIQUES" />

          <View style={styles.grid}>
            {THEMES.map((theme, i) => (
              <AnimatedFragment key={theme.id} index={i}>
                <FamilyCard
                  variant="tertiary"
                  title={theme.title}
                  subtitle={theme.sub}
                  color={theme.color}
                  route={theme.route}
                  image={theme.image}
                  isLocked={theme.isLocked}
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
// HERO / HEADER UNIFIÉ
// ──────────────────────────────────────────────
function UnifiedHeroHeader({
  korean,
  title,
  subtitle,
  accent,
}: {
  korean: string;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <View style={styles.heroBlock}>
      <View style={styles.heroTopLineRow}>
        <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
      </View>

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

        <View style={styles.heroLine} />

        <Text
          style={[
            styles.heroKorean,
            {
              textShadowColor: accent,
            },
          ]}
        >
          {korean}
        </Text>

        <Text style={styles.heroTitle}>{title}</Text>

        <BlurView intensity={18} tint="dark" style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>IMMERSION NIVEAU 1</Text>
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
// CARD FAMILY
// ──────────────────────────────────────────────
function FamilyCard({
  title,
  subtitle,
  color,
  route,
  image,
  isLocked,
  variant = "tertiary",
}: {
  title: string;
  subtitle: string;
  color: string;
  route: string;
  image: { uri: string };
  isLocked?: boolean;
  variant?: "hero" | "secondary" | "tertiary";
}) {
  return (
    <Pressable style={styles.cardPressable} onPress={() => router.push(route)}>
      <BlurView
        intensity={30}
        tint="dark"
        style={[styles.themeCard, isLocked && styles.premiumCardBorder]}
      >
        <LinearGradient
          colors={
            isLocked
              ? ["rgba(253,224,71,0.12)", "transparent"]
              : [`${color}18`, "transparent"]
          }
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.cardAccent,
            { backgroundColor: isLocked ? GOLD : color },
          ]}
        />

        {isLocked && (
          <View style={styles.premiumTag}>
            <Text style={styles.premiumTagText}>PREMIUM 🔒</Text>
          </View>
        )}

        <View style={styles.cardTextContent}>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  bgImage: {
    flex: 1,
  },

  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.82)",
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

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 120,
  },

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

  heroBlock: {
    marginTop: 8,
    marginBottom: 18,
  },

  heroTopLineRow: {
    alignItems: "center",
    marginBottom: 14,
  },

  heroEyebrow: {
    color: PINK,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 4,
    textAlign: "center",
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
    backgroundColor: "rgba(246,194,122,0.35)",
  },

  heroKorean: {
    fontSize: 74,
    fontFamily: fonts.kr,
    color: "rgba(255,248,236,0.98)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    marginBottom: 2,
  },

  heroTitle: {
    marginTop: 6,
    fontSize: 34,
    lineHeight: 38,
    fontFamily: fonts.black,
    color: TXT,
    letterSpacing: -0.8,
  },

  heroBadge: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  heroBadgeText: {
    color: "rgba(255,255,255,0.58)",
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2.1,
  },

  heroQuote: {
    marginTop: 20,
    maxWidth: "78%",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: MUTED,
    fontFamily: fonts.medium,
    fontStyle: "italic",
  },

  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: -2,
    marginBottom: 28,
  },

  activeTab: {
    minWidth: 116,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    color: TXT,
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  inactiveTab: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  inactiveTabText: {
    color: SOFT,
    fontFamily: fonts.bold,
    fontSize: 12,
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

  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: LINE_SOFT,
  },

  grid: {
    gap: 12,
  },

  cardPressable: {
    borderRadius: 20,
    overflow: "hidden",
  },

  themeCard: {
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

  cardAccent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
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
    marginLeft: 10,
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
