import { BlurView } from "expo-blur";
import { AppBackButton } from "../../../components/ui/app-back-button";
import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HubHero } from "../../../components/hub/HubHero";
import { SectionHeader } from "../../../components/hub/SectionHeader";
import { ModuleCard } from "../../../components/ModuleCard";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import {
  HubModuleAccents,
  SeoulMidnightGlass,
} from "../../../constants/theme";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/comptage.jpg");

// ----------------------------------------------
// DESIGN TOKENS
// ----------------------------------------------
const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const COUNTING_ACCENT = HubModuleAccents.counting.base;

// ----------------------------------------------
// MODULES (STRATÉGIE PRODUIT OPTIMISÉE)
// ----------------------------------------------
const MODULES = [
  {
    title: "Nombres de base",
    sub: "Système coréen natif",
    color: COUNTING_ACCENT,
    route: "/comptage/base",
    isLocked: false,
  },
  {
    title: "Nombres sino-coréens",
    sub: "Système sino-coréen",
    color: "#818CF8",
    route: "/comptage/sino",
    isLocked: false,
  },
  {
    title: "Heures et minutes",
    sub: "Le défi du système mixte",
    color: "#F472B6",
    route: "/comptage/heures",
    isLocked: true,
  },
  {
    title: "Magasin et prix",
    sub: "Gérer l'argent au quotidien",
    color: "#34D399",
    route: "/comptage/prix",
    isLocked: true,
  },
  {
    title: "Téléphone et contacts",
    sub: "Numéros, étages et bus",
    color: "#2DD4BF",
    route: "/comptage/phone",
    isLocked: true,
  },
  {
    title: "Dates et calendrier",
    sub: "Jours, mois et années",
    color: "#FB7185",
    route: "/comptage/dates",
    isLocked: true,
  },
  {
    title: "Âge et vie",
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
              korean="숫자"
              title="Comptage"
              subtitle={'"Comprendre le rythme numérique de la ville."'}
              badgeLabel="PARCOURS · NIVEAU 1"
              accentColor={COUNTING_ACCENT}
              accentBadge
              layeredGlow={false}
              badgeBlurIntensity={50}
              style={styles.hero}
              koreanStyle={styles.heroKorean}
            />

            <SectionHeader
              title="FONDATIONS NUMÉRIQUES"
              accentColor={COUNTING_ACCENT}
            />

            {/* CARDS */}
            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.gridWide,
                { gap: responsive.gridGap },
              ]}
            >
              {MODULES.map((m, i) => (
                <AnimatedItem
                  key={m.route}
                  index={i}
                  style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
                >
                  <ModuleCard
                    title={m.title}
                    subtitle={m.sub}
                    href={m.route}
                    accentColor={m.color}
                    icon={m.title.charAt(0)}
                    requiresPremium={m.isLocked}
                    metaLabel="PARCOURS DE COMPTAGE"
                    accessibilityContext="ce parcours de comptage"
                    visualVariant="legacyGlass"
                  />
                </AnimatedItem>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function UnifiedNavHeader() {
  return (
    <View style={styles.navHeader}>
      <View style={styles.backBtn}>
        <AppBackButton />
      </View>
    </View>
  );
}

// ----------------------------------------------
// ANIMATION
// ----------------------------------------------
function AnimatedItem({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: StyleProp<ViewStyle>;
}) {
  const fade = useMemo(() => new Animated.Value(0), []);
  const translate = useMemo(() => new Animated.Value(18), []);

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 760,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 760,
        delay: index * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    anim.start();

    return () => {
      fade.stopAnimation();
      translate.stopAnimation();
    };
  }, [fade, translate, index]);

  return (
    <Animated.View
      style={[style, { opacity: fade, transform: [{ translateY: translate }] }]}
    >
      {children}
    </Animated.View>
  );
}

// ----------------------------------------------
// STYLES
// ----------------------------------------------
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
