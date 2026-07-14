import { BlurView } from "expo-blur";
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
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ModuleCard } from "../../../components/ModuleCard";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { AppFontFamily, SeoulMidnightGlass } from "../../../constants/theme";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/vocabulaire.png");
const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SEOUL MIDNIGHT GLASS
// ──────────────────────────────────────────────
const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const SOFT = SeoulMidnightGlass.colors.soft;
const LINE_SOFT = SeoulMidnightGlass.colors.lineSoft;

const PINK = SeoulMidnightGlass.colors.pink;
const AMBER = "#F6C27A";

const HERO_CIRCLE = width * 0.76;

const fonts = {
  light: AppFontFamily.outfit.light,
  regular: AppFontFamily.outfit.regular,
  bold: AppFontFamily.outfit.bold,
  black: AppFontFamily.outfit.black,
  medium: AppFontFamily.outfit.medium,
  kr: AppFontFamily.korean.bold,
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

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bgImage}>
        <BlurView intensity={50} tint="dark" style={styles.bgBlur} />
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

          <UnifiedHeroHeader
            korean="어휘"
            title="Scènes guidées"
            subtitle={`"Chaque mot devient une scène."`}
            accent={AMBER}
          />

          <UnifiedSectionHeader title="COLLECTIONS THÉMATIQUES" />

          <View
            style={[
              styles.grid,
              gridColumns > 1 && styles.gridWide,
              { gap: responsive.gridGap },
            ]}
          >
            {THEMES.map((theme, i) => (
              <AnimatedFragment
                key={theme.id}
                index={i}
                style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
              >
                <ModuleCard
                  title={theme.title}
                  subtitle={theme.sub}
                  href={theme.route}
                  accentColor={theme.color}
                  icon={theme.title.charAt(0)}
                  requiresPremium={theme.isLocked}
                  metaLabel="COLLECTION VOCAB"
                  accessibilityContext="cette collection de vocabulaire"
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
      <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>

      <View style={styles.heroVisualWrap}>
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

        <BlurView intensity={50} tint="dark" style={styles.heroBadge}>
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
    backgroundColor: "rgba(2,3,6,0.46)",
  },

  topFade: {
    ...ABSOLUTE_FILL,
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

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 120,
  },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
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
    minHeight: 344,
    position: "relative",
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
    fontFamily: fonts.medium,
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
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
});
