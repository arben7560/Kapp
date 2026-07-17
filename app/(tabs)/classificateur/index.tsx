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

import { AppText } from "@/components/app-text";
import { HubHero } from "@/components/hub/HubHero";
import { SectionHeader } from "@/components/hub/SectionHeader";
import { ModuleCard } from "@/components/ModuleCard";
import { ABSOLUTE_FILL } from "@/constants/layout";
import { SeoulMidnightGlass } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/classificateur.png");

const colors = SeoulMidnightGlass.colors;

type ClassifierModule = Readonly<{
  id: number;
  title: string;
  subtitle: string;
  accentColor: string;
  href: string;
  requiresPremium: boolean;
}>;

const CLASSIFIERS = [
  {
    id: 1,
    title: "Objets divers",
    subtitle: "Le classificateur universel (개)",
    accentColor: colors.cyan,
    href: "/classificateur/objects",
    requiresPremium: false,
  },
  {
    id: 2,
    title: "Personnes",
    subtitle: "Compter les humains (명 / 분)",
    accentColor: "#818CF8",
    href: "/classificateur/people",
    requiresPremium: false,
  },
  {
    id: 3,
    title: "Animaux",
    subtitle: "Êtres vivants (마리)",
    accentColor: colors.pink,
    href: "/classificateur/animals",
    requiresPremium: true,
  },
  {
    id: 4,
    title: "Livres & Papier",
    subtitle: "Supports écrits (권 / 장)",
    accentColor: "#34D399",
    href: "/classificateur/paper",
    requiresPremium: true,
  },
  {
    id: 5,
    title: "Bouteilles & Verres",
    subtitle: "Boissons et contenants (병 / 잔)",
    accentColor: "#FBBF24",
    href: "/classificateur/drinks",
    requiresPremium: true,
  },
  {
    id: 6,
    title: "Machines & Véhicules",
    subtitle: "Technologie et transport (대)",
    accentColor: "#A78BFA",
    href: "/classificateur/machines",
    requiresPremium: true,
  },
] as const satisfies readonly ClassifierModule[];

export default function ClassifiersHub() {
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
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.background}>
        <BlurView intensity={70} tint="dark" style={styles.backgroundBlur} />
        <View pointerEvents="none" style={styles.vignette} />
        <View pointerEvents="none" style={styles.bottomFade} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
            <HubNavigation />

            <HubHero
              korean="단위 명사"
              title="Classificateurs"
              subtitle={'"L’art de compter avec précision."'}
              eyebrow="GRAMMAIRE VISUELLE"
              badgeLabel="IMMERSION NIVEAU 1"
              accentColor={colors.cyan}
              badgeBlurIntensity={18}
            />

            <SectionHeader title="UNITÉS DE MESURE CORÉENNES" />

            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.wideGrid,
                { gap: responsive.gridGap },
              ]}
            >
              {CLASSIFIERS.map((module, index) => (
                <AnimatedModule
                  key={module.href}
                  index={index}
                  style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
                >
                  <ModuleCard
                    title={module.title}
                    subtitle={module.subtitle}
                    href={module.href}
                    accentColor={module.accentColor}
                    icon={module.title.charAt(0)}
                    requiresPremium={module.requiresPremium}
                    metaLabel="UNITÉ DE MESURE"
                    accessibilityContext="ce classificateur coréen"
                    visualVariant="legacyGlass"
                  />
                </AnimatedModule>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function HubNavigation() {
  return (
    <View style={styles.navigation}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <AppText aria-hidden variant="screenTitle" style={styles.backArrow}>
          ‹
        </AppText>
        <AppText variant="caption" style={styles.backLabel}>
          SÉOUL IMMERSION
        </AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Paramètres"
        accessibilityState={{ disabled: true }}
        aria-disabled
        hitSlop={8}
        disabled
        style={styles.settingsButton}
      >
        <View style={styles.settingsOrb} />
      </Pressable>
    </View>
  );
}

type AnimatedModuleProps = React.PropsWithChildren<{
  index: number;
  style?: StyleProp<ViewStyle>;
}>;

function AnimatedModule({ children, index, style }: AnimatedModuleProps) {
  const opacity = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(18), []);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 760,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 760,
        delay: index * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => {
      animation.stop();
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [index, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  background: {
    flex: 1,
    overflow: "hidden",
  },
  backgroundBlur: {
    ...ABSOLUTE_FILL,
  },
  vignette: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.46)",
  },
  bottomFade: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
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
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backArrow: {
  },
  backLabel: {
  },
  settingsButton: {
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
  grid: {
    gap: SeoulMidnightGlass.spacing.cardGap,
  },
  wideGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
});
