import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import {
  Check,
  ChevronRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { AppBackButton } from "../../../components/ui/app-back-button";
import { HubModuleAccents, SeoulMidnightGlass } from "../../../constants/theme";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import {
  readHomeResumeContext,
  saveHomeResumeContext,
  type HomeResumeContext,
} from "../../../lib/homeResume";
import { usePaywall } from "../../../lib/paywall/PaywallProvider";

const BACKGROUND_SOURCE = require("../../../assets/images/comptage.jpg");

const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const MUTED = "rgba(241,245,249,0.76)";
const SOFT = "rgba(241,245,249,0.54)";

const COUNTING = HubModuleAccents.counting;
const COUNTING_ACCENT = COUNTING.base;
const COUNTING_LIGHT = "#B8C6DA";

const PREMIUM_GOLD = SeoulMidnightGlass.colors.premiumGold;
const PREMIUM_LIGHT = "#FFF1A8";
const PREMIUM_SOFT = "#D8C89A";
const ACTIVE_PEARL = "#E8E3D8";

type CountingModule = {
  id: number;
  title: string;
  sub: string;
  route: string;
  isLocked: boolean;
  background: ImageSourcePropType;
};

const MODULES: CountingModule[] = [
  {
    id: 1,
    title: "Nombres de base",
    sub: "Système coréen natif",
    route: "/comptage/base",
    isLocked: false,
    background: require("../../../assets/images/counting-base-card.png"),
  },
  {
    id: 2,
    title: "Nombres sino-coréens",
    sub: "Système sino-coréen",
    route: "/comptage/sino",
    isLocked: false,
    background: require("../../../assets/images/counting-sino-card.png"),
  },
  {
    id: 3,
    title: "Heures et minutes",
    sub: "Le défi du système mixte",
    route: "/comptage/heures",
    isLocked: true,
    background: require("../../../assets/images/counting-hours-card.png"),
  },
  {
    id: 4,
    title: "Magasin et prix",
    sub: "Gérer l'argent au quotidien",
    route: "/comptage/prix",
    isLocked: true,
    background: require("../../../assets/images/counting-prices-card.png"),
  },
  {
    id: 5,
    title: "Téléphone et contacts",
    sub: "Numéros, étages et bus",
    route: "/comptage/phone",
    isLocked: true,
    background: require("../../../assets/images/counting-phone-card.png"),
  },
  {
    id: 6,
    title: "Dates et calendrier",
    sub: "Jours, mois et années",
    route: "/comptage/dates",
    isLocked: true,
    background: require("../../../assets/images/counting-dates-card.png"),
  },
  {
    id: 7,
    title: "Âge et vie",
    sub: "Le système coréen unique",
    route: "/comptage/age",
    isLocked: true,
    background: require("../../../assets/images/counting-age-card.png"),
  },
  {
    id: 8,
    title: "Ordinaux",
    sub: "Premier, deuxième, troisième...",
    route: "/comptage/ordinals",
    isLocked: true,
    background: require("../../../assets/images/counting-ordinals-card.png"),
  },
];

const INCLUDED_MODULES = MODULES.filter((module) => !module.isLocked);
const PREMIUM_MODULES = MODULES.filter((module) => module.isLocked);

export default function ComptageHub() {
  const responsive = useResponsiveLayout({ maxWidth: 920 });
  const { hasPremiumAccess } = usePaywall();
  const { setTrack } = useStore();
  const [resumeContext, setResumeContext] = useState<HomeResumeContext | null>(
    null,
  );

  const gridColumns = responsive.getColumns({
    minColumnWidth: 330,
    maxColumns: 2,
    gap: responsive.gridGap,
  });
  const gridItemWidth = responsive.getGridItemWidth(
    gridColumns,
    responsive.gridGap,
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void readHomeResumeContext().then((context) => {
        if (!cancelled) {
          setResumeContext(context);
        }
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const resumeModule = useMemo(() => {
    if (resumeContext?.track !== "numbers") {
      return null;
    }

    return MODULES.find((module) => module.route === resumeContext.route) ?? null;
  }, [resumeContext]);

  const featuredModule = resumeModule ?? INCLUDED_MODULES[0];
  const isResume = !!resumeModule;

  const openModule = async (module: CountingModule) => {
    if (module.isLocked && !hasPremiumAccess) {
      router.push("/premium");
      return;
    }

    await Promise.all([
      setTrack("numbers"),
      saveHomeResumeContext({
        track: "numbers",
        title: module.title,
        detail: module.sub,
        route: module.route,
      }),
    ]);

    router.push(module.route as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView
          intensity={24}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={["rgba(2,3,6,0.40)", "rgba(2,3,6,0.61)", "rgba(2,3,6,0.91)"]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.ambientGlowTop} pointerEvents="none" />
        <View style={styles.ambientGlowBottom} pointerEvents="none" />

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
            <View style={styles.navHeader}>
              <AppBackButton />
            </View>

            <CountingHero compact={responsive.isCompact} />

            <AnimatedFragment index={0}>
              <FeaturedPathCard
                module={featuredModule}
                isResume={isResume}
                hasPremiumAccess={hasPremiumAccess}
                onPress={() => void openModule(featuredModule)}
              />
            </AnimatedFragment>

            <PathSectionHeader
              title="PARCOURS INCLUS"
              subtitle={`${INCLUDED_MODULES.length} parcours essentiels`}
            />

            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.gridWide,
                { gap: Math.max(15, responsive.gridGap) },
              ]}
            >
              {INCLUDED_MODULES.map((module, index) => (
                <AnimatedFragment
                  key={module.id}
                  index={index + 1}
                  style={
                    gridColumns > 1 ? { width: gridItemWidth } : undefined
                  }
                >
                  <CountingPathCard
                    module={module}
                    order={index + 1}
                    hasPremiumAccess={hasPremiumAccess}
                    isCurrent={resumeModule?.id === module.id}
                    onPress={() => void openModule(module)}
                  />
                </AnimatedFragment>
              ))}
            </View>

            <PathSectionHeader
              title="PARCOURS PREMIUM"
              subtitle={
                hasPremiumAccess
                  ? `${PREMIUM_MODULES.length} parcours Premium · accès actif`
                  : `${PREMIUM_MODULES.length} parcours Premium à débloquer`
              }
              premium
              premiumActive={hasPremiumAccess}
            />

            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.gridWide,
                { gap: Math.max(16, responsive.gridGap) },
              ]}
            >
              {PREMIUM_MODULES.map((module, index) => (
                <AnimatedFragment
                  key={module.id}
                  index={INCLUDED_MODULES.length + index + 1}
                  style={
                    gridColumns > 1 ? { width: gridItemWidth } : undefined
                  }
                >
                  <CountingPathCard
                    module={module}
                    order={INCLUDED_MODULES.length + index + 1}
                    hasPremiumAccess={hasPremiumAccess}
                    isCurrent={resumeModule?.id === module.id}
                    onPress={() => void openModule(module)}
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

function CountingHero({ compact }: { compact: boolean }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroEyebrowRow}>
        <View style={styles.heroDot} />
        <AppText variant="sectionLabel" style={styles.heroEyebrow}>
          PARCOURS · COMPTAGE
        </AppText>
      </View>

      <AppText
        variant="koreanPrimary"
        script="korean"
        lineContract="singleLine"
        style={[styles.heroKorean, compact && styles.heroKoreanCompact]}
      >
        숫자
      </AppText>

      <AppText variant="screenTitle" style={styles.heroTitle}>
        Comptage
      </AppText>

      <AppText variant="bodySecondary" style={styles.heroSubtitle}>
        Comprends le rythme numérique de la ville.
      </AppText>

      <View style={styles.heroMetaRow}>
        <View style={styles.levelPill}>
          <Sparkles size={15} strokeWidth={2} color={COUNTING_ACCENT} />
          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={styles.levelText}
          >
            NIVEAU 1
          </AppText>
        </View>

        <AppText variant="caption" style={styles.heroCollectionCount}>
          {INCLUDED_MODULES.length} inclus
          {" · "}
          {PREMIUM_MODULES.length} Premium
        </AppText>
      </View>
    </View>
  );
}

function FeaturedPathCard({
  module,
  isResume,
  hasPremiumAccess,
  onPress,
}: {
  module: CountingModule;
  isResume: boolean;
  hasPremiumAccess: boolean;
  onPress: () => void;
}) {
  const isPremium = module.isLocked;
  const premiumLocked = isPremium && !hasPremiumAccess;
  const premiumActive = isPremium && hasPremiumAccess;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${
        isResume ? "À continuer" : "Pour commencer"
      }. ${module.title}. ${module.sub}.`}
      accessibilityHint={
        premiumLocked ? "Ouvre l'accès Premium" : "Ouvre ce parcours"
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredWrap,
        premiumLocked && styles.featuredWrapPremiumLocked,
        premiumActive && styles.featuredWrapPremiumActive,
        pressed && styles.pressablePressed,
      ]}
    >
      <View style={styles.featuredCard}>
        <ImageBackground
          source={module.background}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
          imageStyle={styles.featuredImage}
        />

        <BlurView
          intensity={8}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={["rgba(3,5,8,0.28)", "rgba(3,5,8,0.48)", "rgba(2,3,6,0.72)"]}
          locations={[0, 0.52, 1]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={
            premiumLocked
              ? ["rgba(253,224,71,0.08)", "rgba(0,0,0,0)", "rgba(2,3,6,0.18)"]
              : premiumActive
                ? [
                    "rgba(216,200,154,0.05)",
                    "rgba(0,0,0,0)",
                    "rgba(2,3,6,0.16)",
                  ]
                : ["rgba(130,148,175,0.09)", "rgba(0,0,0,0)", "rgba(2,3,6,0.16)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.glassTopHairline} />
        <View
          style={[
            styles.featuredGlow,
            premiumLocked && styles.featuredGlowPremiumLocked,
            premiumActive && styles.featuredGlowPremiumActive,
          ]}
        />

        <View style={styles.featuredTopRow}>
          <View style={styles.featuredKicker}>
            <View
              style={[
                styles.featuredKickerDot,
                premiumLocked && styles.premiumDotLocked,
                premiumActive && styles.premiumDotActive,
              ]}
            />
            <AppText variant="sectionLabel" style={styles.featuredKickerText}>
              {isResume ? "À CONTINUER" : "POUR COMMENCER"}
            </AppText>
          </View>

          <View style={styles.featuredTopActions}>
            {premiumLocked ? (
              <View style={styles.featuredPremiumBadgeLocked}>
                <Sparkles size={12} strokeWidth={2} color={PREMIUM_GOLD} />
                <AppText
                  variant="caption"
                  style={styles.featuredPremiumTextLocked}
                >
                  PREMIUM
                </AppText>
              </View>
            ) : premiumActive ? (
              <View style={styles.featuredAccessBadgeActive}>
                <Check size={11} strokeWidth={2.5} color={ACTIVE_PEARL} />
                <AppText
                  variant="caption"
                  style={styles.featuredAccessTextActive}
                >
                  ACCÈS ACTIF
                </AppText>
              </View>
            ) : null}

            <View
              style={[
                styles.featuredArrow,
                premiumLocked && styles.featuredArrowPremiumLocked,
                premiumActive && styles.featuredArrowPremiumActive,
              ]}
            >
              {premiumLocked ? (
                <LockKeyhole size={17} strokeWidth={2} color={PREMIUM_GOLD} />
              ) : (
                <ChevronRight
                  size={19}
                  strokeWidth={2.25}
                  color={premiumActive ? PREMIUM_SOFT : COUNTING_LIGHT}
                />
              )}
            </View>
          </View>
        </View>

        {premiumActive ? (
          <AppText variant="caption" style={styles.featuredPremiumMicroLabel}>
            PARCOURS PREMIUM
          </AppText>
        ) : null}

        <View style={styles.featuredContent}>
          <AppText variant="featureTitle" style={styles.featuredTitle}>
            {module.title}
          </AppText>
          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.featuredSubtitle}
          >
            Comptage · {module.sub}
          </AppText>
        </View>

        <View style={styles.featuredFooter}>
          <AppText
            variant="caption"
            style={[
              styles.featuredFooterLabel,
              premiumLocked && styles.featuredFooterLabelPremiumLocked,
              premiumActive && styles.featuredFooterLabelPremiumActive,
            ]}
          >
            {premiumLocked ? "DÉBLOQUER PREMIUM" : "OUVRIR LE PARCOURS"}
          </AppText>

          <View style={styles.featuredFooterLine}>
            <LinearGradient
              colors={
                premiumLocked
                  ? [PREMIUM_GOLD, PREMIUM_LIGHT, "transparent"]
                  : premiumActive
                    ? [PREMIUM_SOFT, "rgba(216,200,154,0.34)", "transparent"]
                    : [COUNTING_ACCENT, COUNTING_LIGHT, "transparent"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function PathSectionHeader({
  title,
  subtitle,
  premium = false,
  premiumActive = false,
}: {
  title: string;
  subtitle: string;
  premium?: boolean;
  premiumActive?: boolean;
}) {
  const headerAccent = premiumActive ? PREMIUM_SOFT : PREMIUM_GOLD;

  return (
    <View
      style={[styles.sectionHeader, premium && styles.sectionHeaderPremium]}
    >
      <View style={styles.sectionCopy}>
        <View style={styles.sectionTitleRow}>
          {premium ? (
            <Sparkles size={15} strokeWidth={2} color={headerAccent} />
          ) : null}
          <AppText
            variant="sectionLabel"
            style={[
              styles.sectionTitle,
              premium && styles.sectionTitlePremium,
              premiumActive && styles.sectionTitlePremiumActive,
            ]}
          >
            {title}
          </AppText>
        </View>

        <AppText
          variant="caption"
          style={[
            styles.sectionSubtitle,
            premium && styles.sectionSubtitlePremium,
            premiumActive && styles.sectionSubtitlePremiumActive,
          ]}
        >
          {subtitle}
        </AppText>
      </View>

      <View style={styles.sectionLineWrap}>
        <View style={styles.sectionLineBase} />
        <LinearGradient
          colors={
            premium
              ? premiumActive
                ? ["transparent", "rgba(216,200,154,0.24)", PREMIUM_SOFT]
                : ["transparent", "rgba(253,224,71,0.46)", PREMIUM_GOLD]
              : ["transparent", COUNTING_ACCENT, COUNTING_LIGHT]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionLineGlow}
        />
      </View>
    </View>
  );
}

function CountingPathCard({
  module,
  order,
  hasPremiumAccess,
  isCurrent,
  onPress,
}: {
  module: CountingModule;
  order: number;
  hasPremiumAccess: boolean;
  isCurrent: boolean;
  onPress: () => void;
}) {
  const isPremium = module.isLocked;
  const premiumLocked = isPremium && !hasPremiumAccess;
  const premiumActive = isPremium && hasPremiumAccess;
  const unlocked = !isPremium || hasPremiumAccess;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${module.title}. ${module.sub}. ${
        isPremium ? "Premium" : "Inclus"
      }.${isCurrent ? " En cours." : ""}`}
      accessibilityHint={
        unlocked ? "Ouvre ce parcours" : "Ouvre l'accès Premium"
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.collectionWrap,
        premiumLocked && styles.collectionWrapPremiumLocked,
        premiumActive && styles.collectionWrapPremiumActive,
        isCurrent && styles.collectionWrapCurrent,
        pressed && styles.pressablePressed,
      ]}
    >
      <View style={styles.collectionCard}>
        <ImageBackground
          source={module.background}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
          imageStyle={styles.collectionImage}
        />

        <BlurView
          intensity={7}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={["rgba(2,4,7,0.30)", "rgba(2,4,7,0.50)", "rgba(2,3,6,0.72)"]}
          locations={[0, 0.52, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={
            premiumLocked
              ? ["rgba(253,224,71,0.07)", "rgba(0,0,0,0)", "rgba(2,3,6,0.16)"]
              : premiumActive
                ? [
                    "rgba(216,200,154,0.04)",
                    "rgba(0,0,0,0)",
                    "rgba(2,3,6,0.14)",
                  ]
                : ["rgba(130,148,175,0.07)", "rgba(0,0,0,0)", "rgba(2,3,6,0.14)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View
          style={[
            styles.cardTopHairline,
            premiumLocked && styles.cardTopHairlinePremiumLocked,
            premiumActive && styles.cardTopHairlinePremiumActive,
          ]}
        />

        <View
          style={[
            styles.collectionAmbientGlow,
            premiumLocked && styles.collectionAmbientGlowPremiumLocked,
            premiumActive && styles.collectionAmbientGlowPremiumActive,
          ]}
        />

        {isPremium ? (
          <View
            style={[
              styles.premiumRail,
              premiumLocked && styles.premiumRailLocked,
              premiumActive && styles.premiumRailActive,
            ]}
          />
        ) : null}

        <View style={styles.collectionTopRow}>
          <View style={styles.collectionTopMeta}>
            <View style={styles.collectionIdentity}>
              <AppText
                variant="sectionLabel"
                lineContract="singleLine"
                style={[
                  styles.collectionIndex,
                  premiumLocked && styles.collectionIndexPremiumLocked,
                  premiumActive && styles.collectionIndexPremiumActive,
                ]}
              >
                PARCOURS {String(order).padStart(2, "0")}
              </AppText>

              {isPremium ? (
                <AppText
                  variant="caption"
                  lineContract="singleLine"
                  style={[
                    styles.premiumMicroLabel,
                    premiumLocked && styles.premiumMicroLabelLocked,
                  ]}
                >
                  PREMIUM
                </AppText>
              ) : null}
            </View>

            {isPremium ? (
              premiumLocked ? (
                <View style={styles.premiumBadgeLocked}>
                  <LockKeyhole size={10} strokeWidth={2} color={PREMIUM_GOLD} />
                  <AppText
                    variant="caption"
                    lineContract="singleLine"
                    style={styles.premiumBadgeTextLocked}
                  >
                    À DÉBLOQUER
                  </AppText>
                </View>
              ) : (
                <View
                  style={[
                    styles.accessBadgeActive,
                    isCurrent && styles.accessBadgeCurrent,
                  ]}
                >
                  {isCurrent ? (
                    <View style={styles.currentDot} />
                  ) : (
                    <Check size={10} strokeWidth={2.5} color={ACTIVE_PEARL} />
                  )}
                  <AppText
                    variant="caption"
                    lineContract="singleLine"
                    style={[
                      styles.accessBadgeActiveText,
                      isCurrent && styles.accessBadgeCurrentText,
                    ]}
                  >
                    {isCurrent ? "EN COURS" : "ACCÈS ACTIF"}
                  </AppText>
                </View>
              )
            ) : (
              <View
                style={[
                  styles.includedBadge,
                  isCurrent && styles.includedBadgeCurrent,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isCurrent && styles.currentDotIncluded,
                  ]}
                />
                <AppText
                  variant="caption"
                  lineContract="singleLine"
                  style={styles.includedBadgeText}
                >
                  {isCurrent ? "EN COURS" : "INCLUS"}
                </AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.collectionCopy}>
          <AppText variant="cardTitle" style={styles.collectionTitle}>
            {module.title}
          </AppText>
          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.collectionSubtitle}
          >
            {module.sub}
          </AppText>
        </View>

        <View style={styles.collectionFooter}>
          <View style={styles.collectionFooterLine} />
          <View
            style={[
              styles.collectionArrow,
              premiumLocked && styles.collectionArrowPremiumLocked,
              premiumActive && styles.collectionArrowPremiumActive,
            ]}
          >
            {premiumLocked ? (
              <LockKeyhole size={15} strokeWidth={2} color={PREMIUM_GOLD} />
            ) : (
              <ChevronRight
                size={17}
                strokeWidth={2.2}
                color={premiumActive ? PREMIUM_SOFT : COUNTING_LIGHT}
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

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
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 620,
        delay: index * 78,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 720,
        delay: index * 78,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

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
  background: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: BG_DEEP,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },
  pressablePressed: {
    opacity: 0.84,
    transform: [{ scale: 0.992 }],
  },
  glassTopHairline: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    opacity: 0.7,
  },
  ambientGlowTop: {
    position: "absolute",
    top: 120,
    right: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(130,148,175,0.025)",
    boxShadow: "0px 0px 70px rgba(130,148,175,0.05)",
  },
  ambientGlowBottom: {
    position: "absolute",
    top: 640,
    left: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(184,198,218,0.018)",
    boxShadow: "0px 0px 80px rgba(184,198,218,0.04)",
  },
  navHeader: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  hero: {
    paddingHorizontal: 2,
    marginTop: 12,
    marginBottom: 28,
  },
  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 8,
    backgroundColor: COUNTING_ACCENT,
    boxShadow: "0px 0px 8px rgba(130,148,175,0.72)",
  },
  heroEyebrow: {
    color: "rgba(224,231,241,0.64)",
    letterSpacing: 1.3,
  },
  heroKorean: {
    color: "rgba(247,250,255,0.98)",
    fontSize: 40,
    lineHeight: 48,
    textShadowColor: "rgba(130,148,175,0.18)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  heroKoreanCompact: {
    fontSize: 36,
    lineHeight: 44,
  },
  heroTitle: {
    color: TXT,
    marginTop: -2,
  },
  heroSubtitle: {
    maxWidth: 520,
    marginTop: 8,
    color: MUTED,
  },
  heroMetaRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  levelPill: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(130,148,175,0.24)",
    backgroundColor: "rgba(14,18,25,0.72)",
  },
  levelText: {
    marginLeft: 7,
    color: "rgba(184,198,218,0.90)",
  },
  heroCollectionCount: {
    color: SOFT,
    textAlign: "right",
  },
  featuredWrap: {
    marginBottom: 8,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COUNTING.featuredBorder,
    backgroundColor: "rgba(2,3,6,0.48)",
    boxShadow: `0px 12px 30px ${COUNTING.featuredShadow}`,
  },
  featuredWrapPremiumLocked: {
    borderColor: "rgba(253,224,71,0.25)",
    boxShadow: "0px 12px 32px rgba(253,224,71,0.06)",
  },
  featuredWrapPremiumActive: {
    borderColor: "rgba(216,200,154,0.18)",
    boxShadow: "0px 12px 30px rgba(0,0,0,0.28)",
  },
  featuredCard: {
    minHeight: 214,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  featuredImage: {
    borderRadius: 29,
  },
  featuredGlow: {
    position: "absolute",
    top: -86,
    right: -66,
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.055,
    backgroundColor: COUNTING_ACCENT,
    boxShadow: `0px 0px 58px ${COUNTING.glow}`,
  },
  featuredGlowPremiumLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.045,
    boxShadow: "0px 0px 58px rgba(253,224,71,0.12)",
  },
  featuredGlowPremiumActive: {
    backgroundColor: PREMIUM_SOFT,
    opacity: 0.022,
    boxShadow: "0px 0px 42px rgba(216,200,154,0.07)",
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  featuredTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredKicker: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(3,6,10,0.62)",
  },
  featuredKickerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 7,
    backgroundColor: COUNTING_ACCENT,
  },
  premiumDotLocked: {
    backgroundColor: PREMIUM_GOLD,
  },
  premiumDotActive: {
    backgroundColor: PREMIUM_SOFT,
  },
  featuredKickerText: {
    color: "rgba(241,245,249,0.62)",
  },
  featuredPremiumBadgeLocked: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.28)",
    backgroundColor: "rgba(253,224,71,0.07)",
  },
  featuredPremiumTextLocked: {
    color: PREMIUM_LIGHT,
    letterSpacing: 0.5,
  },
  featuredAccessBadgeActive: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(232,227,216,0.19)",
    backgroundColor: "rgba(232,227,216,0.045)",
  },
  featuredAccessTextActive: {
    color: "rgba(232,227,216,0.86)",
    letterSpacing: 0.4,
  },
  featuredPremiumMicroLabel: {
    color: "rgba(216,200,154,0.54)",
    letterSpacing: 1,
    marginBottom: 6,
  },
  featuredArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(130,148,175,0.26)",
    backgroundColor: "rgba(14,18,25,0.70)",
  },
  featuredArrowPremiumLocked: {
    borderColor: "rgba(253,224,71,0.22)",
    backgroundColor: "rgba(253,224,71,0.04)",
  },
  featuredArrowPremiumActive: {
    borderColor: "rgba(216,200,154,0.16)",
    backgroundColor: "rgba(216,200,154,0.025)",
  },
  featuredContent: {
    maxWidth: 600,
  },
  featuredTitle: {
    color: TXT,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.60)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  featuredSubtitle: {
    color: MUTED,
    maxWidth: 560,
    textShadowColor: "rgba(0,0,0,0.70)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredFooter: {
    marginTop: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featuredFooterLabel: {
    color: "rgba(184,198,218,0.82)",
    letterSpacing: 0.45,
  },
  featuredFooterLabelPremiumLocked: {
    color: PREMIUM_LIGHT,
  },
  featuredFooterLabelPremiumActive: {
    color: "rgba(216,200,154,0.72)",
  },
  featuredFooterLine: {
    flex: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0.78,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },
  sectionHeaderPremium: {
    marginTop: 38,
  },
  sectionCopy: {
    flexShrink: 0,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sectionTitle: {
    color: "rgba(241,245,249,0.64)",
    letterSpacing: 1.15,
  },
  sectionTitlePremium: {
    color: PREMIUM_LIGHT,
  },
  sectionTitlePremiumActive: {
    color: "rgba(216,200,154,0.82)",
  },
  sectionSubtitle: {
    marginTop: 3,
    color: "rgba(241,245,249,0.46)",
  },
  sectionSubtitlePremium: {
    color: "rgba(255,241,168,0.56)",
  },
  sectionSubtitlePremiumActive: {
    color: "rgba(216,200,154,0.52)",
  },
  sectionLineWrap: {
    flex: 1,
    height: 10,
    position: "relative",
    justifyContent: "center",
    marginBottom: 2,
  },
  sectionLineBase: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sectionLineGlow: {
    position: "absolute",
    right: 0,
    width: 96,
    height: 1,
    opacity: 0.82,
  },
  grid: {
    gap: 15,
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  collectionWrap: {
    minHeight: 174,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(130,148,175,0.20)",
    backgroundColor: "rgba(2,3,6,0.50)",
    boxShadow: "0px 10px 24px rgba(0,0,0,0.26)",
  },
  collectionWrapPremiumLocked: {
    borderColor: "rgba(253,224,71,0.18)",
    backgroundColor: "rgba(10,9,5,0.56)",
    boxShadow: "0px 10px 26px rgba(253,224,71,0.035)",
  },
  collectionWrapPremiumActive: {
    borderColor: "rgba(216,200,154,0.105)",
    backgroundColor: "rgba(5,6,7,0.58)",
    boxShadow: "0px 10px 24px rgba(0,0,0,0.28)",
  },
  collectionWrapCurrent: {
    borderColor: "rgba(184,198,218,0.24)",
  },
  collectionCard: {
    flex: 1,
    minHeight: 174,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  collectionImage: {
    borderRadius: 24,
  },
  cardTopHairline: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    opacity: 0.62,
  },
  cardTopHairlinePremiumLocked: {
    backgroundColor: "rgba(253,224,71,0.28)",
    opacity: 0.72,
  },
  cardTopHairlinePremiumActive: {
    backgroundColor: "rgba(216,200,154,0.14)",
    opacity: 0.58,
  },
  premiumRail: {
    position: "absolute",
    top: 18,
    bottom: 18,
    left: 0,
    width: 2,
    borderRadius: 2,
  },
  premiumRailLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.82,
    boxShadow: "0px 0px 10px rgba(253,224,71,0.22)",
  },
  premiumRailActive: {
    backgroundColor: PREMIUM_SOFT,
    opacity: 0.48,
    boxShadow: "0px 0px 6px rgba(216,200,154,0.08)",
  },
  collectionAmbientGlow: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COUNTING_ACCENT,
    opacity: 0.032,
  },
  collectionAmbientGlowPremiumLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.035,
  },
  collectionAmbientGlowPremiumActive: {
    backgroundColor: PREMIUM_SOFT,
    opacity: 0.012,
  },
  collectionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  collectionTopMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
  },
  collectionIdentity: {
    flex: 1,
    minWidth: 0,
  },
  collectionIndex: {
    color: "rgba(241,245,249,0.58)",
    letterSpacing: 0.95,
  },
  collectionIndexPremiumLocked: {
    color: "rgba(255,241,168,0.60)",
  },
  collectionIndexPremiumActive: {
    color: "rgba(216,200,154,0.56)",
  },
  premiumMicroLabel: {
    marginTop: 3,
    color: "rgba(216,200,154,0.52)",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  premiumMicroLabelLocked: {
    color: "rgba(253,224,71,0.72)",
  },
  includedBadge: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(130,148,175,0.26)",
    backgroundColor: "rgba(14,18,25,0.76)",
  },
  includedBadgeCurrent: {
    borderColor: "rgba(184,198,218,0.34)",
    backgroundColor: "rgba(18,23,31,0.80)",
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
    backgroundColor: COUNTING_ACCENT,
  },
  currentDotIncluded: {
    backgroundColor: COUNTING_LIGHT,
  },
  includedBadgeText: {
    color: "rgba(184,198,218,0.88)",
  },
  premiumBadgeLocked: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.26)",
    backgroundColor: "rgba(25,21,7,0.74)",
  },
  premiumBadgeTextLocked: {
    color: PREMIUM_LIGHT,
    letterSpacing: 0.35,
  },
  accessBadgeActive: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(232,227,216,0.18)",
    backgroundColor: "rgba(16,16,15,0.74)",
  },
  accessBadgeCurrent: {
    borderColor: "rgba(216,200,154,0.22)",
    backgroundColor: "rgba(25,22,17,0.74)",
  },
  currentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PREMIUM_SOFT,
  },
  accessBadgeActiveText: {
    color: "rgba(232,227,216,0.86)",
    fontSize: 10,
    letterSpacing: 0.25,
  },
  accessBadgeCurrentText: {
    color: "rgba(216,200,154,0.88)",
  },
  collectionCopy: {
    marginTop: 18,
    paddingRight: 8,
  },
  collectionTitle: {
    color: TXT,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  collectionSubtitle: {
    marginTop: 5,
    color: "rgba(241,245,249,0.82)",
    maxWidth: 560,
    textShadowColor: "rgba(0,0,0,0.72)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  collectionFooter: {
    marginTop: "auto",
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  collectionFooterLine: {
    flex: 1,
    height: 1,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  collectionArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(130,148,175,0.28)",
    backgroundColor: "rgba(14,18,25,0.78)",
  },
  collectionArrowPremiumLocked: {
    borderColor: "rgba(253,224,71,0.22)",
    backgroundColor: "rgba(25,21,7,0.76)",
  },
  collectionArrowPremiumActive: {
    borderColor: "rgba(216,200,154,0.16)",
    backgroundColor: "rgba(16,16,15,0.76)",
  },
});