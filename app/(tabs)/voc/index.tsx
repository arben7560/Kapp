import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import {
  Check,
  ChevronRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { AppBackButton } from "../../../components/ui/app-back-button";
import {
  HubModuleAccents,
  SeoulMidnightGlass,
} from "../../../constants/theme";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import {
  readHomeResumeContext,
  saveHomeResumeContext,
  type HomeResumeContext,
} from "../../../lib/homeResume";
import { usePaywall } from "../../../lib/paywall/PaywallProvider";

const BACKGROUND_SOURCE = require("../../../assets/images/vocabulaire.jpg");

// ──────────────────────────────────────────────
// SEOUL MIDNIGHT GLASS — VOCABULARY
// ──────────────────────────────────────────────

const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const MUTED = "rgba(241,245,249,0.76)";
const SOFT = "rgba(241,245,249,0.54)";
const HAIRLINE = "rgba(255,255,255,0.10)";

const VOCABULARY = HubModuleAccents.vocabulary;
const VOCABULARY_ACCENT = VOCABULARY.base;
const VOCABULARY_LIGHT = "#E2BE7D";
const PREMIUM_GOLD = SeoulMidnightGlass.colors.premiumGold;

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────

type VocabularyTheme = {
  id: number;
  title: string;
  sub: string;
  route: string;
  isLocked: boolean;
};

const THEMES: VocabularyTheme[] = [
  {
    id: 1,
    title: "Gastronomie",
    sub: "Restaurants et cuisine de rue",
    route: "/voc/gastronomie",
    isLocked: false,
  },
  {
    id: 2,
    title: "Premiers pas",
    sub: "Salutations et survie",
    route: "/voc/basics",
    isLocked: false,
  },
  {
    id: 6,
    title: "Transports et ville",
    sub: "S'orienter dans Séoul",
    route: "/voc/transport",
    isLocked: false,
  },
  {
    id: 3,
    title: "Culture des K-dramas",
    sub: "Expressions cultes et argot",
    route: "/voc/kdrama",
    isLocked: true,
  },
  {
    id: 4,
    title: "Rencontres",
    sub: "Sentiments et rencontres",
    route: "/voc/romance",
    isLocked: true,
  },
  {
    id: 5,
    title: "Vie nocturne",
    sub: "Sorties, bars et soju",
    route: "/voc/nuit",
    isLocked: true,
  },
  {
    id: 7,
    title: "Urgences et santé",
    sub: "Hôpital et pharmacie",
    route: "/voc/sante",
    isLocked: true,
  },
  {
    id: 8,
    title: "Vie professionnelle",
    sub: "Travail et réseautage",
    route: "/voc/work",
    isLocked: true,
  },
];

const INCLUDED_THEMES = THEMES.filter((theme) => !theme.isLocked);
const PREMIUM_THEMES = THEMES.filter((theme) => theme.isLocked);

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────

export default function VocabHub() {
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
        if (!cancelled) setResumeContext(context);
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const resumeTheme = useMemo(() => {
    if (resumeContext?.track !== "vocab") return null;
    return THEMES.find((theme) => theme.route === resumeContext.route) ?? null;
  }, [resumeContext]);

  const featuredTheme = resumeTheme ?? INCLUDED_THEMES[0];
  const isResume = !!resumeTheme;

  const openTheme = async (theme: VocabularyTheme) => {
    if (theme.isLocked && !hasPremiumAccess) {
      router.push("/premium");
      return;
    }

    await Promise.all([
      setTrack("vocab"),
      saveHomeResumeContext({
        track: "vocab",
        title: theme.title,
        detail: theme.sub,
        route: theme.route,
      }),
    ]);

    router.push(theme.route as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />

        <LinearGradient
          colors={[
            "rgba(2,3,6,0.40)",
            "rgba(2,3,6,0.61)",
            "rgba(2,3,6,0.91)",
          ]}
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
            <UnifiedNavHeader />

            <VocabularyHero
              compact={responsive.isCompact}
              hasPremiumAccess={hasPremiumAccess}
            />

            <AnimatedFragment index={0}>
              <FeaturedCollectionCard
                theme={featuredTheme}
                isResume={isResume}
                hasPremiumAccess={hasPremiumAccess}
                onPress={() => {
                  void openTheme(featuredTheme);
                }}
              />
            </AnimatedFragment>

            <CollectionSectionHeader
              title="COLLECTIONS INCLUSES"
              subtitle={`${INCLUDED_THEMES.length} collections essentielles`}
            />

            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.gridWide,
                { gap: Math.max(15, responsive.gridGap) },
              ]}
            >
              {INCLUDED_THEMES.map((theme, index) => (
                <AnimatedFragment
                  key={theme.id}
                  index={index + 1}
                  style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
                >
                  <VocabularyCollectionCard
                    theme={theme}
                    order={index + 1}
                    hasPremiumAccess={hasPremiumAccess}
                    onPress={() => {
                      void openTheme(theme);
                    }}
                  />
                </AnimatedFragment>
              ))}
            </View>

            <CollectionSectionHeader
              title="COLLECTIONS PREMIUM"
              subtitle={
                hasPremiumAccess
                  ? `${PREMIUM_THEMES.length} collections déverrouillées`
                  : `${PREMIUM_THEMES.length} collections pour aller plus loin`
              }
              premium
            />

            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.gridWide,
                { gap: Math.max(15, responsive.gridGap) },
              ]}
            >
              {PREMIUM_THEMES.map((theme, index) => (
                <AnimatedFragment
                  key={theme.id}
                  index={INCLUDED_THEMES.length + index + 1}
                  style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
                >
                  <VocabularyCollectionCard
                    theme={theme}
                    order={INCLUDED_THEMES.length + index + 1}
                    hasPremiumAccess={hasPremiumAccess}
                    onPress={() => {
                      void openTheme(theme);
                    }}
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
// NAVIGATION
// ──────────────────────────────────────────────

function UnifiedNavHeader() {
  return (
    <View style={styles.navHeader}>
      <AppBackButton />
    </View>
  );
}

// ──────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────

function VocabularyHero({
  compact,
  hasPremiumAccess,
}: {
  compact: boolean;
  hasPremiumAccess: boolean;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroEyebrowRow}>
        <View style={styles.heroDot} />

        <AppText variant="sectionLabel" style={styles.heroEyebrow}>
          COLLECTIONS · VOCABULAIRE
        </AppText>
      </View>

      <AppText
        variant="koreanPrimary"
        script="korean"
        lineContract="singleLine"
        style={[styles.heroKorean, compact && styles.heroKoreanCompact]}
      >
        어휘
      </AppText>

      <AppText variant="screenTitle" style={styles.heroTitle}>
        Vocabulaire
      </AppText>

      <AppText variant="bodySecondary" style={styles.heroSubtitle}>
        Apprends les mots dans leur contexte.
      </AppText>

      <View style={styles.heroMetaRow}>
        <View style={styles.levelPill}>
          <Sparkles size={15} strokeWidth={2} color={VOCABULARY_ACCENT} />

          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={styles.levelText}
          >
            NIVEAU 1
          </AppText>
        </View>

        <AppText variant="caption" style={styles.heroCollectionCount}>
          {hasPremiumAccess
            ? `${THEMES.length} collections accessibles`
            : `${INCLUDED_THEMES.length} incluses · ${PREMIUM_THEMES.length} premium`}
        </AppText>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// FEATURED / RESUME COLLECTION
// ──────────────────────────────────────────────

function FeaturedCollectionCard({
  theme,
  isResume,
  hasPremiumAccess,
  onPress,
}: {
  theme: VocabularyTheme;
  isResume: boolean;
  hasPremiumAccess: boolean;
  onPress: () => void;
}) {
  const premiumLocked = theme.isLocked && !hasPremiumAccess;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isResume ? "À continuer" : "Pour commencer"}. ${theme.title}. ${theme.sub}.`}
      accessibilityHint={
        premiumLocked
          ? "Ouvre l'accès Premium"
          : "Ouvre cette collection de vocabulaire"
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredWrap,
        pressed && styles.pressablePressed,
      ]}
    >
      <BlurView intensity={68} tint="dark" style={styles.featuredCard}>
        <LinearGradient
          colors={[
            "rgba(198,154,88,0.18)",
            "rgba(9,12,17,0.86)",
            "rgba(2,3,6,0.96)",
          ]}
          locations={[0, 0.44, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.featuredGlow} />
        <View style={styles.glassTopHairline} />

        <View style={styles.featuredTopRow}>
          <View style={styles.featuredKicker}>
            <View style={styles.featuredKickerDot} />

            <AppText variant="sectionLabel" style={styles.featuredKickerText}>
              {isResume ? "À CONTINUER" : "POUR COMMENCER"}
            </AppText>
          </View>

          <View style={styles.featuredArrow}>
            {premiumLocked ? (
              <LockKeyhole
                size={17}
                strokeWidth={2}
                color={PREMIUM_GOLD}
              />
            ) : (
              <ChevronRight
                size={19}
                strokeWidth={2.25}
                color={VOCABULARY_LIGHT}
              />
            )}
          </View>
        </View>

        <View style={styles.featuredContent}>
          <AppText variant="featureTitle" style={styles.featuredTitle}>
            {theme.title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.featuredSubtitle}
          >
            Vocabulaire · {theme.sub}
          </AppText>
        </View>

        <View style={styles.featuredFooter}>
          <AppText variant="caption" style={styles.featuredFooterLabel}>
            {premiumLocked ? "DÉCOUVRIR PREMIUM" : "OUVRIR LA COLLECTION"}
          </AppText>

          <View style={styles.featuredFooterLine}>
            <LinearGradient
              colors={[VOCABULARY_ACCENT, VOCABULARY_LIGHT, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// SECTION HEADER
// ──────────────────────────────────────────────

function CollectionSectionHeader({
  title,
  subtitle,
  premium = false,
}: {
  title: string;
  subtitle: string;
  premium?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <AppText
          variant="sectionLabel"
          style={[
            styles.sectionTitle,
            premium && styles.sectionTitlePremium,
          ]}
        >
          {title}
        </AppText>

        <AppText variant="caption" style={styles.sectionSubtitle}>
          {subtitle}
        </AppText>
      </View>

      <View style={styles.sectionLineWrap}>
        <View style={styles.sectionLineBase} />

        <LinearGradient
          colors={
            premium
              ? ["transparent", VOCABULARY_ACCENT, PREMIUM_GOLD]
              : ["transparent", VOCABULARY_ACCENT, VOCABULARY_LIGHT]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionLineGlow}
        />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// COLLECTION CARD
// ──────────────────────────────────────────────

function VocabularyCollectionCard({
  theme,
  order,
  hasPremiumAccess,
  onPress,
}: {
  theme: VocabularyTheme;
  order: number;
  hasPremiumAccess: boolean;
  onPress: () => void;
}) {
  const isPremium = theme.isLocked;
  const unlocked = !isPremium || hasPremiumAccess;

  const statusLabel = isPremium
    ? unlocked
      ? "DÉVERROUILLÉ"
      : "PREMIUM"
    : "INCLUSE";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${theme.title}. ${theme.sub}. ${statusLabel}.`}
      accessibilityHint={
        unlocked
          ? "Ouvre cette collection de vocabulaire"
          : "Ouvre l'accès Premium"
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.collectionWrap,
        isPremium && styles.collectionWrapPremium,
        pressed && styles.pressablePressed,
      ]}
    >
      <BlurView
        intensity={isPremium ? 56 : 62}
        tint="dark"
        style={styles.collectionCard}
      >
        <LinearGradient
          colors={
            isPremium
              ? [
                  "rgba(198,154,88,0.07)",
                  "rgba(6,9,14,0.88)",
                  "rgba(2,3,6,0.96)",
                ]
              : [
                  "rgba(198,154,88,0.11)",
                  "rgba(6,10,15,0.86)",
                  "rgba(2,3,6,0.95)",
                ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.glassTopHairline} />
        <View style={styles.collectionAmbientGlow} />

        <View style={styles.collectionTopRow}>
          <View
            style={[
              styles.collectionIcon,
              isPremium && styles.collectionIconPremium,
            ]}
          >
            <AppText
              variant="symbol"
              style={[
                styles.collectionIconText,
                isPremium && styles.collectionIconTextPremium,
              ]}
            >
              {theme.title.charAt(0)}
            </AppText>
          </View>

          <View style={styles.collectionTopMeta}>
            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={styles.collectionIndex}
            >
              COLLECTION {String(order).padStart(2, "0")}
            </AppText>

            <View
              style={[
                styles.statusPill,
                isPremium && styles.statusPillPremium,
                isPremium && unlocked && styles.statusPillUnlocked,
              ]}
            >
              {isPremium ? (
                unlocked ? (
                  <Check size={11} strokeWidth={2.5} color={VOCABULARY_LIGHT} />
                ) : (
                  <LockKeyhole
                    size={11}
                    strokeWidth={2}
                    color={PREMIUM_GOLD}
                  />
                )
              ) : (
                <View style={styles.statusDot} />
              )}

              <AppText
                variant="caption"
                lineContract="singleLine"
                style={[
                  styles.statusText,
                  isPremium && styles.statusTextPremium,
                  isPremium && unlocked && styles.statusTextUnlocked,
                ]}
              >
                {statusLabel}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.collectionCopy}>
          <AppText variant="cardTitle" style={styles.collectionTitle}>
            {theme.title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.collectionSubtitle}
          >
            {theme.sub}
          </AppText>
        </View>

        <View style={styles.collectionFooter}>
          <View style={styles.collectionFooterLine}>
            <View
              style={[
                styles.collectionFooterAccent,
                isPremium && styles.collectionFooterAccentPremium,
              ]}
            />
          </View>

          <View
            style={[
              styles.collectionArrow,
              isPremium && styles.collectionArrowPremium,
            ]}
          >
            {isPremium && !unlocked ? (
              <LockKeyhole size={15} strokeWidth={2} color={PREMIUM_GOLD} />
            ) : (
              <ChevronRight
                size={17}
                strokeWidth={2.2}
                color={VOCABULARY_LIGHT}
              />
            )}
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// ANIMATION
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

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────

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
    backgroundColor: "rgba(198,154,88,0.025)",
    boxShadow: "0px 0px 70px rgba(198,154,88,0.05)",
  },

  ambientGlowBottom: {
    position: "absolute",
    top: 640,
    left: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(226,190,125,0.018)",
    boxShadow: "0px 0px 80px rgba(226,190,125,0.04)",
  },

  // NAV

  navHeader: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  // HERO

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
    backgroundColor: VOCABULARY_ACCENT,
    boxShadow: "0px 0px 8px rgba(198,154,88,0.72)",
  },

  heroEyebrow: {
    color: "rgba(244,232,212,0.62)",
    letterSpacing: 1.3,
  },

  heroKorean: {
    color: "rgba(255,248,236,0.98)",
    fontSize: 40,
    lineHeight: 48,
    textShadowColor: "rgba(198,154,88,0.16)",
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
    borderColor: "rgba(198,154,88,0.20)",
    backgroundColor: "rgba(28,21,12,0.68)",
  },

  levelText: {
    marginLeft: 7,
    color: "rgba(226,190,125,0.86)",
  },

  heroCollectionCount: {
    color: SOFT,
    textAlign: "right",
  },

  // FEATURED

  featuredWrap: {
    marginBottom: 8,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: VOCABULARY.featuredBorder,
    backgroundColor: "rgba(2,3,6,0.48)",
    boxShadow: `0px 12px 30px ${VOCABULARY.featuredShadow}`,
  },

  featuredCard: {
    minHeight: 214,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },

  featuredGlow: {
    position: "absolute",
    top: -86,
    right: -66,
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.055,
    backgroundColor: VOCABULARY_ACCENT,
    boxShadow: `0px 0px 58px ${VOCABULARY.glow}`,
  },

  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
    backgroundColor: VOCABULARY_ACCENT,
  },

  featuredKickerText: {
    color: "rgba(241,245,249,0.62)",
  },

  featuredArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198,154,88,0.22)",
    backgroundColor: "rgba(28,21,12,0.62)",
  },

  featuredContent: {
    maxWidth: 600,
  },

  featuredTitle: {
    color: TXT,
    marginBottom: 6,
  },

  featuredSubtitle: {
    color: MUTED,
    maxWidth: 560,
  },

  featuredFooter: {
    marginTop: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  featuredFooterLabel: {
    color: "rgba(226,190,125,0.76)",
    letterSpacing: 0.45,
  },

  featuredFooterLine: {
    flex: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0.74,
  },

  // SECTION HEADER

  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },

  sectionCopy: {
    flexShrink: 0,
  },

  sectionTitle: {
    color: "rgba(241,245,249,0.64)",
    letterSpacing: 1.15,
  },

  sectionTitlePremium: {
    color: "rgba(226,190,125,0.76)",
  },

  sectionSubtitle: {
    marginTop: 3,
    color: "rgba(241,245,249,0.46)",
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
    opacity: 0.8,
  },

  // GRID

  grid: {
    gap: 15,
  },

  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },

  // COLLECTION CARD

  collectionWrap: {
    minHeight: 174,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(198,154,88,0.18)",
    backgroundColor: "rgba(2,3,6,0.50)",
    boxShadow: "0px 10px 24px rgba(0,0,0,0.26)",
  },

  collectionWrapPremium: {
    borderColor: "rgba(198,154,88,0.14)",
  },

  collectionCard: {
    flex: 1,
    minHeight: 174,
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },

  collectionAmbientGlow: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: VOCABULARY_ACCENT,
    opacity: 0.032,
  },

  collectionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "rgba(198,154,88,0.24)",
    backgroundColor: "rgba(198,154,88,0.075)",
    boxShadow: `0px 0px 18px ${VOCABULARY.iconShadow}`,
  },

  collectionIconPremium: {
    borderColor: "rgba(253,224,71,0.16)",
    backgroundColor: "rgba(198,154,88,0.045)",
    boxShadow: "0px 0px 14px rgba(198,154,88,0.10)",
  },

  collectionIconText: {
    color: VOCABULARY_LIGHT,
  },

  collectionIconTextPremium: {
    color: "rgba(226,190,125,0.72)",
  },

  collectionTopMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
  },

  collectionIndex: {
    flexShrink: 1,
    color: "rgba(241,245,249,0.46)",
    letterSpacing: 0.95,
  },

  statusPill: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(198,154,88,0.16)",
    backgroundColor: "rgba(198,154,88,0.045)",
  },

  statusPillPremium: {
    borderColor: "rgba(253,224,71,0.18)",
    backgroundColor: "rgba(253,224,71,0.04)",
  },

  statusPillUnlocked: {
    borderColor: "rgba(198,154,88,0.20)",
    backgroundColor: "rgba(198,154,88,0.055)",
  },

  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
    backgroundColor: VOCABULARY_ACCENT,
  },

  statusText: {
    color: "rgba(226,190,125,0.74)",
  },

  statusTextPremium: {
    marginLeft: 5,
    color: "rgba(253,224,71,0.80)",
  },

  statusTextUnlocked: {
    color: "rgba(226,190,125,0.80)",
  },

  collectionCopy: {
    marginTop: 18,
    paddingRight: 8,
  },

  collectionTitle: {
    color: TXT,
  },

  collectionSubtitle: {
    marginTop: 5,
    color: MUTED,
    maxWidth: 560,
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
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  collectionFooterAccent: {
    width: 40,
    height: 1,
    backgroundColor: VOCABULARY_ACCENT,
    opacity: 0.82,
  },

  collectionFooterAccentPremium: {
    width: 26,
    opacity: 0.52,
  },

  collectionArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198,154,88,0.18)",
    backgroundColor: "rgba(198,154,88,0.045)",
  },

  collectionArrowPremium: {
    borderColor: "rgba(253,224,71,0.15)",
    backgroundColor: "rgba(253,224,71,0.025)",
  },
});
