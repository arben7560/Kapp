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
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../components/app-text";
import { HubHero } from "../../../components/hub/HubHero";
import { SectionHeader } from "../../../components/hub/SectionHeader";
import { ModuleCard } from "../../../components/ModuleCard";
import { SeoulMidnightGlass } from "../../../constants/theme";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/comptage.png");

// ----------------------------------------------
// DESIGN TOKENS
// ----------------------------------------------
const BG_DEEP = "#020306";
const MUTED = "rgba(255,255,255,0.60)";
const SOFT = SeoulMidnightGlass.colors.soft;
const CYAN = "#22D3EE";

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
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <AppText aria-hidden variant="screenTitle" tone="soft" style={styles.backArrow}>
                ‹
              </AppText>
              <AppText variant="caption" tone="soft" style={styles.backText}>
                SÉOUL
              </AppText>
            </Pressable>
            <View style={styles.settingsIcon} />
          </View>

          <HubHero
            korean="숫자"
            title="Les nombres"
            subtitle={'"Comprendre le rythme numérique de la ville."'}
            badgeLabel="IMMERSION NIVEAU 1"
            accentColor={CYAN}
            badgeBlurIntensity={18}
          />

          <SectionHeader title="FONDATIONS NUMÉRIQUES" />

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
                  metaLabel="FONDATION NUMÉRIQUE"
                  accessibilityContext="cette fondation numérique"
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
    paddingTop: 10,
    paddingBottom: 100,
  },

  contentFrame: {
    width: "100%",
    alignSelf: "center",
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

  grid: {
    gap: 12,
  },

  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
});
