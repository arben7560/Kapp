import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { Compass, MessageCircleMore } from "lucide-react-native";
import React, { useCallback, useEffect, useRef } from "react";
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
import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { AppTypography } from "../../constants/theme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useDailyStreak } from "../../lib/DailyStreakProvider";
import type { DailyStreakState } from "../../lib/dailyStreak";
import { HANGUL_PROGRESS_IDS } from "../../data/hangul/curriculum";

const BACKGROUND_SOURCE = require("../../assets/images/seoulhub.png");

// ──────────────────────────────────────────────
// DESIGN TOKENS
// ──────────────────────────────────────────────
const BG_DEEP = "#020306";
const TXT = "#F1F5F9";
const MUTED = "rgba(241, 245, 249, 0.62)";
const SOFT = "rgba(241, 245, 249, 0.45)";
const HUB_BACKGROUND_DARKNESS = 0.58;

const CYAN = "#67E8F9";
const PINK = "#F472B6";

const ABSOLUTE_FILL = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

function textGlow(color: string, radius: number) {
  return {
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: radius,
  };
}

const HANGUL_PROGRESS_TOTAL = HANGUL_PROGRESS_IDS.length;

const SEQUENCES: any[] = [
  {
    title: "Hangul",
    label: "Hangul",
    color: CYAN,
    route: "/hangul",
    trackKey: "hangul",
    place: "CENTRE D'APPRENTISSAGE",
    narrative: "Décrypte l'âme visuelle de la ville.",
    type: "pedagogical",
  },
  {
    title: "Vocabulaire",
    label: "Vocabulaire",
    color: "#F59E0B",
    route: "/voc",
    trackKey: "vocab",
    place: "SÉOUL • VOCABULAIRE",
    narrative: "Apprends le vocabulaire selon le contexte.",
    type: "pedagogical",
  },
  {
    title: "Comptage",
    label: "Comptage",
    color: CYAN,
    route: "/comptage",
    trackKey: "numbers",
    place: "HONGDAE • QUANTITÉS",
    narrative: "Maîtrise les nombres dans le réel.",
    type: "pedagogical",
  },
  {
    title: "Conversation",
    label: "Conversation",
    color: PINK,
    route: "/speak",
    trackKey: "dialogs",
    place: "SÉOUL • CONVERSATION",
    narrative: "Parle dans des situations du quotidien.",
    type: "immersion",
  },
  {
    title: "Écoute",
    label: "Écoute",
    color: "#8B5CF6",
    route: "/listen",
    trackKey: "listen",
    place: "LIGNE 2 • ÉCOUTER",
    narrative: "Affûte ton oreille au rythme de Séoul.",
    type: "immersion",
  },
];

const RESUME_SEQUENCES: Record<string, any> = {
  aeroport_ia: {
    title: "Mission aéroport",
    label: "Mission aéroport",
    color: CYAN,
    route: "/lesson/aeroportMissions",
    routeParams: { mode: "guided" },
    trackKey: "aeroport_ia",
    place: "INCHEON - ARRIVÉE",
    narrative: "Reprends ta dernière mission aéroport.",
    type: "immersion",
  },
  cafe_ia: {
    title: "Mission café",
    label: "Mission café",
    color: PINK,
    route: "/lesson/cafeMissions",
    routeParams: { mode: "guided" },
    trackKey: "cafe_ia",
    place: "HONGDAE - CAFÉ",
    narrative: "Reprends ta dernière mission café.",
    type: "immersion",
  },
  metro_ia: {
    title: "Mission métro",
    label: "Mission métro",
    color: CYAN,
    route: "/lesson/metroMissions",
    routeParams: { mode: "guided" },
    trackKey: "metro_ia",
    place: "LIGNE 2 - SE DÉPLACER",
    narrative: "Reprends ta dernière mission métro.",
    type: "immersion",
  },
  restaurant_ia: {
    title: "Mission restaurant",
    label: "Mission restaurant",
    color: "#F59E0B",
    route: "/lesson/restaurantMissions",
    routeParams: { mode: "guided" },
    trackKey: "restaurant_ia",
    place: "ITAEWON - DÎNER",
    narrative: "Reprends ta dernière mission restaurant.",
    type: "immersion",
  },
};

export default function Home() {
  const { progress, setTrack } = useStore();
  const { refreshStreak, streak } = useDailyStreak();
  const responsive = useResponsiveLayout({ maxWidth: 900 });
  const gridColumns = responsive.getColumns({
    minColumnWidth: 330,
    maxColumns: 2,
    gap: responsive.gridGap,
  });
  const gridItemWidth = responsive.getGridItemWidth(
    gridColumns,
    responsive.gridGap,
  );
  const heroTextWidth = Math.max(0, responsive.contentWidth - 8);
  const heroSubtitleWidth = Math.min(430, heroTextWidth);
  const heroSeoulVariant = responsive.isCompact
    ? "display"
    : responsive.screenClass === "phone"
      ? "koreanPhraseHero"
      : "koreanHero";
  const heroTitleVariant = responsive.isCompact ? "screenTitle" : "display";
  const currentTrack = progress.learningTrack;
  const activeSeq =
    (currentTrack ? RESUME_SEQUENCES[currentTrack] : undefined) ??
    SEQUENCES.find((s) => s.trackKey === currentTrack) ??
    SEQUENCES[0];
  const activeSeqProgress = getSequenceProgress(activeSeq.trackKey, progress);
  const activeSeqNarrative =
    activeSeq.trackKey === "hangul" && (activeSeqProgress ?? 0) > 0
      ? "Reprends ta session Hangul."
      : activeSeq.narrative;

  const pedagogicalSequences = SEQUENCES.filter(
    (s) => s.type === "pedagogical",
  );
  const immersionSequences = SEQUENCES.filter((s) => s.type === "immersion");

  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      refreshStreak()
        .then(() => {
          if (!isMounted) return;
        })
        .catch(() => null);

      return () => {
        isMounted = false;
      };
    }, [refreshStreak]),
  );

  const openSequence = (sequence: any) => {
    setTrack(sequence.trackKey);
    if (sequence.routeParams) {
      router.push({
        pathname: sequence.route,
        params: sequence.routeParams,
      } as any);
      return;
    }

    router.push(sequence.route);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bgImage}
        resizeMode="cover"
        blurRadius={0}
      >
        <BlurView intensity={18} tint="dark" style={styles.bgBlur} />
        <View style={styles.hubDarkOverlay} />
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
            {/* TOP HEADER */}
            <View
              style={[
                styles.header,
                responsive.isCompact && styles.headerCompact,
              ]}
            >
              <View style={styles.headerIdentity}>
                <View style={styles.brandGroup}>
                  <AppText
                    variant="koreanPrimary"
                    script="korean"
                    lineContract="singleLine"
                    style={styles.headerCityKr}
                  >
                    서울
                  </AppText>
                  <AppText
                    variant="sectionLabel"
                    lineContract="singleLine"
                    style={styles.headerCityEn}
                  >
                    SÉOUL
                  </AppText>
                </View>

                <View
                  style={[
                    styles.headerDivider,
                    responsive.isCompact && styles.headerDividerCompact,
                  ]}
                />

                <View style={styles.statusGroup}>
                  <View style={styles.liveIndicatorRow}>
                    <Animated.View
                      style={[styles.liveDot, { opacity: pulseAnim }]}
                    />
                    <AppText
                      variant="caption"
                      lineContract="singleLine"
                      style={styles.statusText}
                    >
                      IMMERSION ACTIVE
                    </AppText>
                  </View>
                  <AppText
                    variant="caption"
                    lineContract="singleLine"
                    style={styles.locationText}
                  >
                    HEURE DE SÉOUL
                  </AppText>
                </View>
              </View>
            </View>

            {/* HERO - SEOUL IMMERSION */}
            <View
              style={[
                styles.heroBlock,
                responsive.isCompact && styles.heroBlockCompact,
              ]}
            >
              <View
                style={[
                  styles.heroWrap,
                  responsive.isCompact && styles.heroWrapCompact,
                ]}
              >
                <View style={styles.heroContent}>
                  <AppText
                    variant="sectionLabel"
                    style={styles.heroLabel}
                  >
                    SÉOUL IMMERSION
                  </AppText>

                  <View
                    style={[
                      styles.heroSeoulTitleWrap,
                      responsive.isCompact && styles.heroSeoulTitleWrapCompact,
                    ]}
                  >
                    <AppText
                      variant={heroSeoulVariant}
                      script="korean"
                      lineContract="singleLine"
                      style={[
                        styles.heroSeoulShadow,
                        {
                          maxWidth: heroTextWidth,
                          top: "50%",
                          transform: [
                            {
                              translateY:
                                1 - AppTypography[heroSeoulVariant].lineHeight / 2,
                            },
                          ],
                        },
                      ]}
                    >
                      어서 오세요.
                    </AppText>
                    <AppText
                      variant={heroSeoulVariant}
                      script="korean"
                      lineContract="singleLine"
                      style={[
                        styles.heroSeoulTitle,
                        { maxWidth: heroTextWidth },
                      ]}
                    >
                      어서 오세요.
                    </AppText>
                  </View>

                  <AppText
                    accessibilityRole="header"
                    variant={heroTitleVariant}
                    style={styles.heroTitle}
                  >
                    Entre dans la ville.
                  </AppText>

                  <AppText
                    variant="subtitle"
                    style={[
                      styles.heroSubtitle,
                      { maxWidth: heroSubtitleWidth },
                    ]}
                  >
                    Apprends le coréen comme si tu y étais déjà.
                  </AppText>

                  <LinearGradient
                    colors={[CYAN, PINK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.heroLine}
                  />
                </View>
              </View>
            </View>

            {/* LIST CONTENT */}
            <AnimatedFragment index={0}>
              <MainActionCard
                sequence={activeSeq}
                narrative={activeSeqNarrative}
                progress={activeSeqProgress}
                onPress={() => openSequence(activeSeq)}
              />
            </AnimatedFragment>

            <DailyStreakCard
              streak={streak}
              onPress={() => router.push("/streak")}
            />

            <View style={styles.sectionDivider}>
              <AppText
                variant="sectionLabel"
                style={styles.sectionTitle}
              >
                PARCOURS
              </AppText>
              <View style={styles.titleLineWrap}>
                <View style={styles.titleLine} />
                <LinearGradient
                  colors={["transparent", CYAN, PINK]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.5, y: 0 }}
                  style={styles.titleLineGlow}
                />
              </View>
            </View>

            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.gridWide,
                { gap: responsive.gridGap },
              ]}
            >
              {pedagogicalSequences.map((seq, i) => (
                <AnimatedFragment
                  key={seq.trackKey}
                  index={i + 1}
                  style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
                >
                  <SequenceCard
                    item={seq}
                    isActive={seq.trackKey === currentTrack}
                    onPress={() => openSequence(seq)}
                  />
                </AnimatedFragment>
              ))}
            </View>

            <View style={styles.sectionDivider}>
              <AppText
                variant="sectionLabel"
                style={styles.sectionTitle}
              >
                IMMERSION
              </AppText>
              <View style={styles.titleLineWrap}>
                <View style={styles.titleLine} />
                <LinearGradient
                  colors={["transparent", "#8B5CF6", PINK]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.5, y: 0 }}
                  style={styles.titleLineGlow}
                />
              </View>
            </View>

            <View
              style={[
                styles.grid,
                gridColumns > 1 && styles.gridWide,
                { gap: responsive.gridGap },
              ]}
            >
              {immersionSequences.map((seq, i) => (
                <AnimatedFragment
                  key={seq.trackKey}
                  index={i + 1 + pedagogicalSequences.length}
                  style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
                >
                  <SequenceCard
                    item={seq}
                    isActive={seq.trackKey === currentTrack}
                    onPress={() => openSequence(seq)}
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
// COMPONENTS
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: index * 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: index * 180,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start(() => startFloating());
  }, []);

  const startFloating = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3400 + index * 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3400 + index * 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const translateY = Animated.add(
    slideAnim,
    floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }),
  );

  return (
    <Animated.View
      style={[style, { opacity: fadeAnim, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}

function MainActionCard({ sequence, narrative, progress, onPress }: any) {
  const displayLabel = sequence.label;
  const isMission = sequence.trackKey.endsWith("_ia");

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Reprendre ${isMission ? "la mission" : "le parcours"} ${displayLabel}. ${narrative}`}
      accessibilityHint="Ouvre le parcours actif"
      hitSlop={6}
      onPress={onPress}
      style={[
        styles.mainCardWrap,
        {
          borderColor: `${sequence.color}70`,
          boxShadow: `0px 8px 18px ${sequence.color}3D`,
        },
      ]}
    >
      <BlurView intensity={60} tint="dark" style={styles.mainCard}>
        <View style={styles.cardContent}>
          <AppText
            variant="sectionLabel"
            style={styles.cardKicker}
          >
            {isMission ? "REPRENDRE LA MISSION" : "REPRENDRE LE PARCOURS"}
          </AppText>
          <AppText
            variant="featureTitle"
            style={styles.cardTitle}
          >
            {displayLabel}
          </AppText>
          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.cardNarrative}
          >
            {narrative}
          </AppText>
          {typeof progress === "number" ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: sequence.color,
                    },
                  ]}
                />
              </View>
              <AppText variant="caption" style={styles.progressText}>
                {Math.round(progress * 100)} % du parcours
              </AppText>
            </View>
          ) : null}
        </View>
      </BlurView>
    </Pressable>
  );
}

function DailyStreakCard({
  onPress,
  streak,
}: {
  onPress: () => void;
  streak: DailyStreakState | null;
}) {
  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const isValidated = streak?.isTodayCompleted ?? false;
  const freezesAvailable = streak?.freezesAvailable ?? 0;
  const statusLabel = isValidated ? "Terminé" : "À commencer";
  const helperText = isValidated
    ? "Ta série est conservée. Les autres activités du jour restent du bonus."
    : "Termine une activité aujourd'hui pour conserver ta série.";

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Série quotidienne. ${currentStreak} ${currentStreak > 1 ? "jours" : "jour"}. ${statusLabel}`}
      accessibilityState={{ selected: isValidated }}
      aria-selected={isValidated}
      accessibilityHint="Ouvre le calendrier de série"
      hitSlop={6}
      onPress={onPress}
    >
      <BlurView intensity={42} tint="dark" style={styles.streakCard}>
        <LinearGradient
          colors={[
            "rgba(103,232,249,0.16)",
            "rgba(244,114,182,0.08)",
            "rgba(2,3,6,0.16)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.streakAccent} />

        <View style={styles.streakTopRow}>
          <View style={styles.streakCounterBlock}>
            <AppText
              variant="sectionLabel"
              style={styles.streakKicker}
            >
              SÉRIE QUOTIDIENNE
            </AppText>
            <View style={styles.streakNumberRow}>
              <View style={styles.streakSymbol}>
                <AppText
                  variant="caption"
                  style={styles.streakSymbolText}
                >
                  ST
                </AppText>
              </View>
              <AppText
                variant="numericValue"
                style={styles.streakNumber}
              >
                {currentStreak}
              </AppText>
              <AppText
                variant="caption"
                style={styles.streakUnit}
              >
                {currentStreak > 1 ? "jours" : "jour"}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.streakStatus,
              isValidated && styles.streakStatusValidated,
            ]}
          >
            <AppText
              variant="label"
              style={[
                styles.streakStatusText,
                isValidated && styles.streakStatusTextValidated,
              ]}
            >
              {statusLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.streakMessageBox}>
          <AppText
            variant="bodyStrong"
            style={styles.streakMessageTitle}
          >
            {isValidated ? "Objectif du jour atteint" : "Objectif du jour"}
          </AppText>
          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.streakGoal}
          >
            {helperText}
          </AppText>
        </View>

        <View style={styles.streakMetrics}>
          <View style={styles.streakMetricCard}>
            <AppText
              variant="bodyStrong"
              style={styles.streakMetricValue}
            >
              {longestStreak} j
            </AppText>
            <AppText
              variant="caption"
              tone="muted"
              style={styles.streakMetricLabel}
            >
              Record
            </AppText>
          </View>
          <View style={styles.streakMetricCard}>
            <AppText
              variant="bodyStrong"
              style={styles.streakMetricValue}
            >
              {freezesAvailable}
            </AppText>
            <AppText
              variant="caption"
              tone="muted"
              style={styles.streakMetricLabel}
            >
              Protection de série
            </AppText>
          </View>
          <View style={styles.streakMetricCard}>
            <AppText
              variant="bodyStrong"
              style={styles.streakMetricValue}
            >
              {isValidated ? "OK" : "1"}
            </AppText>
            <AppText
              variant="caption"
              tone="muted"
              style={styles.streakMetricLabel}
            >
              {isValidated ? "Terminée" : "activité"}
            </AppText>
          </View>
        </View>

        <AppText
          variant="caption"
          tone="soft"
          style={styles.streakOpenHint}
        >
          Voir le calendrier et les badges
        </AppText>
      </BlurView>
    </Pressable>
  );
}

function getSequenceProgress(trackKey: string, progress: any) {
  if (trackKey !== "hangul") return null;

  const completedHangulItems = HANGUL_PROGRESS_IDS.filter(
    (id) => progress.completed?.[id],
  ).length;

  return Math.min(1, completedHangulItems / HANGUL_PROGRESS_TOTAL);
}

function getSequenceIcon(trackKey: string) {
  switch (trackKey) {
    case "hangul":
      return "가";
    case "vocab":
      return "dialogue";
    case "numbers":
      return "123";
    case "dialogs":
      return "compass";
    case "listen":
      return "음";
    default:
      return "•";
  }
}

function SequenceIconGlyph({ icon, color }: { icon: string; color: string }) {
  if (icon === "dialogue") {
    return <MessageCircleMore color={color} size={23} strokeWidth={2.25} />;
  }

  if (icon === "compass") {
    return <Compass color={color} size={23} strokeWidth={2.25} />;
  }

  return (
    <AppText
      variant="symbol"
      style={[
        styles.seqIcon,
        {
          color,
        },
        textGlow(color, 10),
      ]}
    >
      {icon}
    </AppText>
  );
}

function SequenceCard({ item, isActive, onPress }: any) {
  const icon = getSequenceIcon(item.trackKey);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${item.title}. ${item.narrative}`}
      accessibilityState={{ selected: isActive }}
      aria-selected={isActive}
      accessibilityHint="Ouvre ce parcours"
      hitSlop={6}
      onPress={onPress}
      style={[
        styles.seqCard,
        isActive && {
          borderColor: `${item.color}66`,
          boxShadow: `0px 8px 18px ${item.color}38`,
        },
      ]}
    >
      <BlurView
        intensity={isActive ? 52 : 40}
        tint="dark"
        style={[
          styles.seqBlur,
          isActive && {
            borderColor: `${item.color}55`,
          },
        ]}
      >
        <LinearGradient
          colors={[
            `${item.color}18`,
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
          style={styles.seqTopReflect}
        />

        <View style={styles.seqRainA} />
        <View
          style={[styles.seqRainB, { backgroundColor: `${item.color}14` }]}
        />
        <View style={styles.seqRainC} />
        <View style={[styles.seqRainDrop, { backgroundColor: item.color }]} />

        <View
          style={[
            styles.seqAccent,
            {
              backgroundColor: item.color,
              opacity: isActive ? 1 : 0.9,
              boxShadow: `0px 0px 10px ${item.color}BF`,
            },
          ]}
        />

        <View style={styles.seqIconZone}>
          <View
            style={[
              styles.seqIconBox,
              {
                borderColor: `${item.color}55`,
                backgroundColor: `${item.color}12`,
                boxShadow: `0px 0px 12px ${item.color}${isActive ? "57" : "38"}`,
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
              style={styles.seqIconLight}
            />

            <SequenceIconGlyph icon={icon} color={item.color} />
          </View>
        </View>

        <View style={styles.seqDividerLine} />

        <View style={styles.seqText}>
          <AppText
            variant="sectionLabel"
            style={styles.seqPlace}
          >
            {item.place}
          </AppText>
          <AppText
            variant="cardTitle"
            style={styles.seqTitle}
          >
            {item.title}
          </AppText>
          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.seqSub}
          >
            {item.narrative}
          </AppText>
        </View>

        <AppText
          variant="symbol"
          lineContract="singleLine"
          style={[
            styles.seqArrow,
            isActive && {
              color: item.color,
              opacity: 0.9,
            },
            isActive && textGlow(item.color, 8),
          ]}
        >
          ›
        </AppText>

      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1, backgroundColor: BG_DEEP, overflow: "hidden" },
  bgBlur: {
    ...ABSOLUTE_FILL,
  },
  hubDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: `rgba(2,3,6,${HUB_BACKGROUND_DARKNESS})`,
  },
  topFade: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
    backgroundColor: "rgba(2,3,6,0.40)",
  },
  scrollContent: { paddingTop: 12, paddingBottom: 100 },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
    paddingHorizontal: 4,
    position: "relative",
  },
  headerCompact: {
    marginBottom: 16,
  },
  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },
  brandGroup: { alignItems: "flex-start" },
  headerCityKr: {
    color: TXT,
  },
  headerCityEn: {
    color: "rgba(255,255,255,0.65)",
    marginTop: -1,
  },
  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: 18,
  },
  headerDividerCompact: {
    marginHorizontal: 10,
  },
  statusGroup: { justifyContent: "center", flexShrink: 1 },
  liveIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CYAN,
    marginRight: 7,
  },
  statusText: {
    color: "#E0F2FE",
  },
  locationText: {
    color: "rgba(224, 242, 254, 0.55)",
  },
  // HERO - SEOUL IMMERSION
  heroBlock: {
    marginBottom: 20,
  },
  heroBlockCompact: {
    marginBottom: 12,
  },
  heroWrap: {
    minHeight: 300,
    justifyContent: "center",
    position: "relative",
  },
  heroWrapCompact: {
    minHeight: 250,
  },
  heroContent: {
    paddingHorizontal: 4,
    alignItems: "flex-start",
    position: "relative",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.70)",
    textAlign: "left",
  },

  heroSeoulTitleWrap: {
    position: "relative",
    marginTop: 6,
    minHeight: 115,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  heroSeoulTitleWrapCompact: {
    minHeight: 88,
  },
  heroSeoulShadow: {
    position: "absolute",
    left: 1,
    color: "rgba(103,232,249,0.16)",
    ...textGlow("rgba(199,184,255,0.30)", 26),
  },
  heroSeoulTitle: {
    color: "rgba(215,247,255,0.84)",
    ...textGlow("rgba(103,232,249,0.38)", 18),
  },

  heroTitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 0,
    marginBottom: 10,
    maxWidth: 620,
    textAlign: "left",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.65)",
    marginBottom: 20,
    textAlign: "left",
  },
  heroLine: {
    width: 60,
    height: 2,
    borderRadius: 2,
  },
  rainLine: {
    position: "absolute",
    top: 0,
    width: 1,
    height: 200,
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 20,
  },

  mainCardWrap: {
    marginBottom: 32,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  mainCard: { padding: 20 },
  cardContent: {},
  cardKicker: {
    color: SOFT,
    marginBottom: 6,
  },
  cardTitle: {
    color: TXT,
    marginBottom: 7,
  },
  cardNarrative: {
    color: MUTED,
    maxWidth: 560,
    marginBottom: 22,
  },
  progressContainer: { gap: 10 },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { color: SOFT },

  streakCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.20)",
    padding: 18,
    marginTop: -14,
    marginBottom: 28,
  },
  streakAccent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: CYAN,
    opacity: 0.85,
  },
  streakTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  streakCounterBlock: {
    flex: 1,
  },
  streakKicker: {
    color: "rgba(241,245,249,0.48)",
    marginBottom: 6,
  },
  streakNumberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 7,
  },
  streakSymbol: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.45)",
    backgroundColor: "rgba(103,232,249,0.12)",
    marginBottom: 6,
  },
  streakSymbolText: {
    color: CYAN,
  },
  streakNumber: {
    color: TXT,
  },
  streakUnit: {
    color: "rgba(241,245,249,0.72)",
    paddingBottom: 7,
  },
  streakStatus: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  streakStatusValidated: {
    borderColor: "rgba(103,232,249,0.55)",
    backgroundColor: "rgba(103,232,249,0.12)",
  },
  streakStatusText: {
    color: "rgba(241,245,249,0.55)",
  },
  streakStatusTextValidated: {
    color: CYAN,
  },
  streakMessageBox: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(2,3,6,0.22)",
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  streakMessageTitle: {
    color: TXT,
    marginBottom: 5,
  },
  streakGoal: {
    color: MUTED,
    maxWidth: 620,
  },
  streakMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  streakMetricCard: {
    flex: 1,
    minWidth: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  streakMetricValue: {
    color: TXT,
  },
  streakMetricLabel: {
    color: "rgba(241,245,249,0.50)",
    marginTop: 2,
  },
  streakOpenHint: {
    color: "rgba(103,232,249,0.72)",
    marginTop: 12,
    textAlign: "center",
  },

  // SECTION DIVIDERS
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 16,
    marginTop: 22,
  },
  sectionTitle: {
    color: "rgba(241,245,249,0.48)",
  },
  titleLineWrap: {
    flex: 1,
    height: 8,
    justifyContent: "center",
    position: "relative",
  },
  titleLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.055)",
  },
  titleLineGlow: {
    position: "absolute",
    right: 0,
    width: 70,
    height: 1,
    borderRadius: 2,
    opacity: 0.85,
  },

  grid: { gap: 10 },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },

  // SEQUENCE CARDS
  seqCard: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(2,3,6,0.26)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    boxShadow: "0px 8px 14px rgba(0,0,0,0.28)",
  },
  seqBlur: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    position: "relative",
  },
  seqTopReflect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    opacity: 0.55,
  },
  seqAccent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  seqIconZone: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginRight: 10,
    position: "relative",
  },
  seqIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  seqIconLight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "58%",
    borderRadius: 22,
  },
  seqIcon: {
  },
  seqDividerLine: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 12,
  },
  seqText: {
    flex: 1,
    minWidth: 0,
  },
  seqPlace: {
    color: "rgba(241,245,249,0.34)",
    marginBottom: 3,
  },
  seqTitle: {
    color: TXT,
  },
  seqSub: {
    color: "rgba(241,245,249,0.62)",
    marginTop: 3,
  },
  seqArrow: {
    color: "rgba(255,255,255,0.36)",
    opacity: 0.52,
    marginLeft: 8,
  },
  seqRainA: {
    position: "absolute",
    top: 6,
    bottom: 8,
    left: "34%",
    width: 1,
    backgroundColor: "rgba(255,255,255,0.045)",
  },
  seqRainB: {
    position: "absolute",
    top: 10,
    bottom: 16,
    left: "66%",
    width: 1,
  },
  seqRainC: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 40,
    width: 1,
    backgroundColor: "rgba(244,114,182,0.035)",
  },
  seqRainDrop: {
    position: "absolute",
    top: 16,
    left: "72%",
    width: 3,
    height: 15,
    borderRadius: 2,
    opacity: 0.065,
  },
});
