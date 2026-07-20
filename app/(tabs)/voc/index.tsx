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
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../components/app-text";
import { HubHero } from "../../../components/hub/HubHero";
import { SectionHeader } from "../../../components/hub/SectionHeader";
import { ModuleCard } from "../../../components/ModuleCard";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { SeoulMidnightGlass } from "../../../constants/theme";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/vocabulaire.png");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SEOUL MIDNIGHT GLASS
// ──────────────────────────────────────────────
const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const AMBER = "#F6C27A";

const THEMES = [
  {
    id: 1,
    title: "Gastronomie",
    sub: "Restaurants et cuisine de rue",
    color: "#F87171",
    route: "/voc/gastronomie",
    image: {
      uri: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: false,
  },
  {
    id: 2,
    title: "Premiers pas",
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
    title: "Transports et ville",
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
    title: "Culture des K-dramas",
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
    title: "Rencontres",
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
    title: "Vie nocturne",
    sub: "Sorties, bars et soju",
    color: "#818CF8",
    route: "/voc/nuit",
    image: {
      uri: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=600&q=80",
    },
    isLocked: true,
  },
  {
    id: 7,
    title: "Urgences et santé",
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
    title: "Vie professionnelle",
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
          <View
            style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}
          >
            <UnifiedNavHeader />

            <HubHero
              korean="어휘"
              title="Vocabulaire"
              subtitle={`"Chaque mot devient une scène."`}
              badgeLabel="COLLECTIONS · NIVEAU 1"
              accentColor={AMBER}
              layeredGlow={false}
              badgeBlurIntensity={50}
              style={styles.hero}
              koreanStyle={styles.heroKorean}
            />

            <SectionHeader title="COLLECTIONS THÉMATIQUES" />

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
                    metaLabel="COLLECTION DE VOCABULAIRE"
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
        <AppText aria-hidden variant="screenTitle" style={styles.backArrow}>
          ‹
        </AppText>
        <AppText variant="caption" style={styles.backText}>
          SÉOUL IMMERSION
        </AppText>
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
    marginBottom: 0,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  backArrow: {
    color: TXT,
  },

  backText: {
    color: "rgba(255,255,255,0.92)",
  },

  hero: {
    marginTop: 0,
  },

  heroKorean: {
    color: "rgba(255,248,236,0.98)",
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
