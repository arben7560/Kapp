import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import {
  Compass,
  Flame,
  MessageCircleMore,
  ShieldCheck,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { HubModuleAccents } from "../../constants/theme";
import { HANGUL_PROGRESS_IDS } from "../../data/hangul/curriculum";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useDailyStreak } from "../../lib/DailyStreakProvider";
import type { DailyStreakState } from "../../lib/dailyStreak";
import { getGrammarJourneyCompletion } from "../../lib/grammar";
import {
  readHomeResumeContext,
  type HomeResumeContext,
} from "../../lib/homeResume";

const BACKGROUND_SOURCE = require("../../assets/images/seoulhub.jpg");

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
const STREAK_ACCENT = HubModuleAccents.streak;

const SEOUL_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Seoul",
});

function formatSeoulTime(date = new Date()) {
  return SEOUL_TIME_FORMATTER.format(date);
}

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
    hubAccent: HubModuleAccents.hangul,
    route: "/hangul",
    trackKey: "hangul",
    place: "CENTRE D'APPRENTISSAGE",
    narrative: "Décrypte l'âme visuelle de la ville.",
    type: "pedagogical",
  },
  {
    title: "Grammaire",
    label: "Grammaire",
    hubAccent: HubModuleAccents.grammar,
    route: "/grammar",
    trackKey: "grammar",
    place: "SÉOUL • A0 → A1",
    narrative: "Construis des phrases naturelles, étape par étape.",
    type: "pedagogical",
  },
  {
    title: "Vocabulaire",
    label: "Vocabulaire",
    hubAccent: HubModuleAccents.vocabulary,
    route: "/voc",
    trackKey: "vocab",
    place: "SÉOUL • VOCABULAIRE",
    narrative: "Apprends le vocabulaire selon le contexte.",
    type: "pedagogical",
  },
  {
    title: "Comptage",
    label: "Comptage",
    hubAccent: HubModuleAccents.counting,
    route: "/comptage",
    trackKey: "numbers",
    place: "HONGDAE • QUANTITÉS",
    narrative: "Maîtrise les nombres dans le réel.",
    type: "pedagogical",
  },
  {
    title: "Conversation",
    label: "Conversation",
    hubAccent: HubModuleAccents.conversation,
    route: "/speak",
    trackKey: "dialogs",
    place: "SÉOUL • CONVERSATION",
    narrative: "Parle dans des situations du quotidien.",
    type: "immersion",
  },
  {
    title: "Écoute",
    label: "Écoute",
    hubAccent: HubModuleAccents.listening,
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
    hubAccent: HubModuleAccents.hangul,
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
    hubAccent: HubModuleAccents.conversation,
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
    hubAccent: HubModuleAccents.counting,
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
    hubAccent: HubModuleAccents.vocabulary,
    route: "/lesson/restaurantMissions",
    routeParams: { mode: "guided" },
    trackKey: "restaurant_ia",
    place: "ITAEWON - DÎNER",
    narrative: "Reprends ta dernière mission restaurant.",
    type: "immersion",
  },
};

// ──────────────────────────────────────────────
// SEOUL HERO
// ──────────────────────────────────────────────

type HeroCopy = {
  pre: string;
  accent: string;
  sub: (cityTime: string) => string;
};

const heroCopyVariants: Record<string, HeroCopy> = {
  presentTense: {
    pre: "Tu es à ",
    accent: "Séoul.",
    sub: (t) => `Il est ${t} là-bas, avec toi.`,
  },
  poetic: {
    pre: "La ville commence ",
    accent: "à te parler.",
    sub: (t) => `${t} · Séoul, maintenant.`,
  },
  identity: {
    pre: "Ta version coréenne ",
    accent: "commence ici.",
    sub: (t) => `${t} · heure de Séoul`,
  },
};

type SeoulHeroProps = {
  cityTime: string;
  variant?: keyof typeof heroCopyVariants;
};

function SeoulHero({ cityTime, variant = "presentTense" }: SeoulHeroProps) {
  const copy = heroCopyVariants[variant];

  return (
    <View style={styles.seoulHeroContainer}>
      <LinearGradient
        colors={["rgba(4,8,20,0)", "rgba(4,8,20,0.4)"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.seoulHeroTitleRow}>
        <Text
          style={[styles.seoulHeroTitleStatic, styles.seoulHeroTitleShadow]}
        >
          {copy.pre}
        </Text>

        <MaskedView
          maskElement={
            <Text style={styles.seoulHeroTitleStatic}>{copy.accent}</Text>
          }
        >
          <LinearGradient
            colors={["#5EEAD4", "#F472B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={[
                styles.seoulHeroTitleStatic,
                styles.seoulHeroAccentPlaceholder,
              ]}
            >
              {copy.accent}
            </Text>
          </LinearGradient>
        </MaskedView>
      </View>

      <Text style={styles.seoulHeroSubtitle}>{copy.sub(cityTime)}</Text>
    </View>
  );
}

// ──────────────────────────────────────────────
// HOME
// ──────────────────────────────────────────────

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

  const [resumeContext, setResumeContext] = useState<HomeResumeContext | null>(
    null,
  );
  const currentTrack = progress.learningTrack;

  const baseActiveSeq =
    (currentTrack ? RESUME_SEQUENCES[currentTrack] : undefined) ??
    SEQUENCES.find((s) => s.trackKey === currentTrack) ??
    SEQUENCES[0];

  const activeSeq =
    currentTrack === "vocab" && resumeContext?.track === "vocab"
      ? {
          ...baseActiveSeq,
          title: resumeContext.title,
          label: resumeContext.title,
          route: resumeContext.route,
          resumeMeta: `Vocabulaire · ${resumeContext.detail}`,
        }
      : baseActiveSeq;

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
  const streakPulse = useRef(new Animated.Value(1)).current;
  const [seoulTime, setSeoulTime] = useState(formatSeoulTime);

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
  }, [pulseAnim]);

  useEffect(() => {
    streakPulse.setValue(1);
    Animated.sequence([
      Animated.timing(streakPulse, {
        toValue: 1.06,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(streakPulse, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [streak?.currentStreak, streak?.isTodayCompleted, streakPulse]);

  useEffect(() => {
    let minuteInterval: ReturnType<typeof setInterval> | undefined;
    let minuteTimeout: ReturnType<typeof setTimeout> | undefined;

    const updateSeoulTime = () => {
      setSeoulTime(formatSeoulTime());
    };

    const delayUntilNextMinute = 60_000 - (Date.now() % 60_000);

    updateSeoulTime();

    minuteTimeout = setTimeout(() => {
      updateSeoulTime();

      minuteInterval = setInterval(updateSeoulTime, 60_000);
    }, delayUntilNextMinute);

    return () => {
      if (minuteTimeout) {
        clearTimeout(minuteTimeout);
      }

      if (minuteInterval) {
        clearInterval(minuteInterval);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      refreshStreak()
        .then(() => {
          if (!isMounted) {
            return;
          }
        })
        .catch(() => null);

      return () => {
        isMounted = false;
      };
    }, [refreshStreak]),
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      readHomeResumeContext()
        .then((context) => {
          if (isMounted) {
            setResumeContext(context);
          }
        })
        .catch(() => {
          if (isMounted) {
            setResumeContext(null);
          }
        });

      return () => {
        isMounted = false;
      };
    }, []),
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
            {
              paddingHorizontal: responsive.horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.contentFrame,
              {
                maxWidth: responsive.maxWidth,
              },
            ]}
          >
            {/* TOP HEADER */}
            <View
              style={[
                styles.header,
                responsive.isCompact && styles.headerCompact,
              ]}
            >
              <View
                style={[
                  styles.headerIdentity,
                  responsive.isCompact && styles.headerIdentityCompact,
                ]}
              >
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
                      style={[
                        styles.liveDot,
                        {
                          opacity: pulseAnim,
                        },
                      ]}
                    />

                    <AppText
                      variant="sectionLabel"
                      lineContract="singleLine"
                      style={styles.statusText}
                    >
                      IMMERSION ACTIVE
                    </AppText>
                  </View>

                  <AppText
                    accessibilityLabel={`Heure à Séoul : ${seoulTime}`}
                    variant="label"
                    lineContract="singleLine"
                    style={styles.locationText}
                  >
                    {seoulTime} · SÉOUL
                  </AppText>
                </View>
              </View>

              <Animated.View
                style={[
                  styles.streakHeaderSlot,
                  responsive.isCompact && styles.streakHeaderSlotCompact,
                  { transform: [{ scale: streakPulse }] },
                ]}
              >
                <StreakHeaderBadge
                  compact={responsive.isCompact}
                  streak={streak}
                  onPress={() => router.push("/streak")}
                />
              </Animated.View>
            </View>

            {/* HERO H1 */}
            <SeoulHero cityTime={seoulTime} variant="presentTense" />

            {/* CURRENT IMMERSION */}

            <AnimatedFragment index={0}>
              <MainActionCard
                sequence={activeSeq}
                narrative={activeSeqNarrative}
                progress={activeSeqProgress}
                onPress={() => openSequence(activeSeq)}
              />
            </AnimatedFragment>

            {/* PARCOURS */}
            <View style={styles.sectionDivider}>
              <AppText variant="sectionLabel" style={styles.sectionTitle}>
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
                {
                  gap: responsive.gridGap,
                },
              ]}
            >
              {pedagogicalSequences.map((seq, i) => (
                <AnimatedFragment
                  key={seq.trackKey}
                  index={i + 1}
                  style={
                    gridColumns > 1
                      ? {
                          width: gridItemWidth,
                        }
                      : undefined
                  }
                >
                  <SequenceCard
                    item={seq}
                    isActive={seq.trackKey === currentTrack}
                    onPress={() => openSequence(seq)}
                  />
                </AnimatedFragment>
              ))}
            </View>

            {/* IMMERSION */}
            <View style={styles.sectionDivider}>
              <AppText variant="sectionLabel" style={styles.sectionTitle}>
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
                {
                  gap: responsive.gridGap,
                },
              ]}
            >
              {immersionSequences.map((seq, i) => (
                <AnimatedFragment
                  key={seq.trackKey}
                  index={i + 1 + pedagogicalSequences.length}
                  style={
                    gridColumns > 1
                      ? {
                          width: gridItemWidth,
                        }
                      : undefined
                  }
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

  const startFloating = useCallback(() => {
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
  }, [floatAnim, index]);

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
  }, [fadeAnim, index, slideAnim, startFloating]);

  const translateY = Animated.add(
    slideAnim,
    floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -5],
    }),
  );

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY,
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function MainActionCard({ sequence, narrative, progress, onPress }: any) {
  const displayLabel = sequence.label;
  const resumeMeta = sequence.resumeMeta as string | undefined;
  const isMission = sequence.trackKey.endsWith("_ia");
  const accent = sequence.hubAccent;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Reprendre ${
        isMission ? "la mission" : "le parcours"
      } ${displayLabel}. ${narrative}`}
      accessibilityHint="Ouvre le parcours actif"
      hitSlop={6}
      onPress={onPress}
      style={[
        styles.mainCardWrap,
        {
          borderColor: accent.featuredBorder,
          boxShadow: `0px 8px 18px ${accent.featuredShadow}`,
        },
      ]}
    >
      <BlurView intensity={60} tint="dark" style={styles.mainCard}>
        <View style={styles.cardContent}>
          <AppText variant="sectionLabel" style={styles.cardKicker}>
            {isMission ? "REPRENDRE LA MISSION" : "REPRENDRE LE PARCOURS"}
          </AppText>

          <AppText variant="featureTitle" style={styles.cardTitle}>
            {displayLabel}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.cardNarrative}
          >
            {resumeMeta ?? narrative}
          </AppText>

          {typeof progress === "number" ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: accent.base,
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

function StreakHeaderBadge({
  compact,
  onPress,
  streak,
}: {
  compact: boolean;
  onPress: () => void;
  streak: DailyStreakState | null;
}) {
  const currentStreak = streak?.currentStreak ?? 0;
  const freezesAvailable = streak?.freezesAvailable ?? 0;
  const isValidated = streak?.isTodayCompleted ?? false;
  const dayLabel = currentStreak > 1 ? "jours" : "jour";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Série quotidienne : ${currentStreak} ${dayLabel}. ${
        isValidated
          ? "Objectif du jour atteint."
          : "Objectif du jour à compléter."
      } ${freezesAvailable} ${
        freezesAvailable > 1
          ? "protections disponibles"
          : "protection disponible"
      }.`}
      accessibilityHint="Ouvre le calendrier de série"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.streakBadgePressable,
        pressed && styles.streakBadgePressed,
      ]}
    >
      <BlurView intensity={44} tint="dark" style={styles.streakBadgeBlur}>
        <LinearGradient
          colors={[
            STREAK_ACCENT.surfaceStrong,
            STREAK_ACCENT.surface,
            "rgba(2,3,6,0.32)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.streakBadgePrimary}>
          <Flame
            size={16}
            strokeWidth={2.25}
            color={isValidated ? STREAK_ACCENT.base : "rgba(241,245,249,0.58)"}
            fill={isValidated ? STREAK_ACCENT.base : "transparent"}
          />

          <AppText
            variant="bodyStrong"
            lineContract="singleLine"
            style={[
              styles.streakBadgeValue,
              isValidated && styles.streakBadgeValueActive,
            ]}
          >
            {currentStreak}
          </AppText>
        </View>

        {!compact ? (
          <>
            <View style={styles.streakBadgeDivider} />

            <View style={styles.streakBadgeSecondary}>
              <ShieldCheck
                size={14}
                strokeWidth={2.15}
                color="rgba(103,232,249,0.72)"
              />

              <AppText
                variant="caption"
                lineContract="singleLine"
                style={styles.streakBadgeFreezeValue}
              >
                {freezesAvailable}
              </AppText>
            </View>
          </>
        ) : null}

        <View
          style={[
            styles.streakBadgeStatusDot,
            isValidated && styles.streakBadgeStatusDotActive,
          ]}
        />
      </BlurView>
    </Pressable>
  );
}

function getSequenceProgress(trackKey: string, progress: any) {
  if (trackKey === "grammar") {
    return getGrammarJourneyCompletion(progress.grammarProgress);
  }

  if (trackKey !== "hangul") {
    return null;
  }

  const completedHangulItems = HANGUL_PROGRESS_IDS.filter(
    (id) => progress.completed?.[id],
  ).length;

  return Math.min(1, completedHangulItems / HANGUL_PROGRESS_TOTAL);
}

function getSequenceIcon(trackKey: string) {
  switch (trackKey) {
    case "hangul":
      return "가";

    case "grammar":
      return "문";

    case "vocab":
      return "dialogue";

    case "numbers":
      return "123";

    case "dialogs":
      return "compass";

    case "listen":
      return "소리";

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

  const accent = item.hubAccent;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${item.title}. ${item.narrative}`}
      accessibilityState={{
        selected: isActive,
      }}
      aria-selected={isActive}
      accessibilityHint="Ouvre ce parcours"
      hitSlop={6}
      onPress={onPress}
      style={[
        styles.seqCard,
        isActive && {
          borderColor: accent.selectedBorder,
          boxShadow: `0px 8px 18px ${accent.selectedShadow}`,
        },
      ]}
    >
      <BlurView
        intensity={isActive ? 52 : 40}
        tint="dark"
        style={[
          styles.seqBlur,
          isActive && {
            borderColor: accent.iconBorder,
          },
        ]}
      >
        <LinearGradient
          colors={[
            accent.surface,
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
          style={[
            styles.seqRainB,
            {
              backgroundColor: accent.rain,
            },
          ]}
        />

        <View
          style={[
            styles.seqRainC,
            {
              backgroundColor: accent.decorative,
            },
          ]}
        />

        <View
          style={[
            styles.seqRainDrop,
            {
              backgroundColor: accent.base,
            },
          ]}
        />

        <View
          style={[
            styles.seqAccent,
            {
              backgroundColor: accent.base,
              opacity: isActive ? 1 : 0.9,
              boxShadow: `0px 0px 10px ${accent.glow}`,
            },
          ]}
        />

        <View style={styles.seqIconZone}>
          <View
            style={[
              styles.seqIconBox,
              {
                borderColor: accent.iconBorder,
                backgroundColor: accent.iconSurface,
                boxShadow: `0px 0px 12px ${
                  isActive ? accent.iconShadowSelected : accent.iconShadow
                }`,
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

            <SequenceIconGlyph icon={icon} color={accent.base} />
          </View>
        </View>

        <View style={styles.seqDividerLine} />

        <View style={styles.seqText}>
          <AppText variant="sectionLabel" style={styles.seqPlace}>
            {item.place}
          </AppText>

          <AppText variant="cardTitle" style={styles.seqTitle}>
            {item.title}
          </AppText>

          <AppText variant="bodySecondary" tone="muted" style={styles.seqSub}>
            {item.narrative}
          </AppText>
        </View>

        <AppText
          variant="symbol"
          lineContract="singleLine"
          style={[
            styles.seqArrow,
            isActive && {
              color: accent.base,
              opacity: 0.9,
            },
            isActive && textGlow(accent.base, 8),
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
  safe: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  bgImage: {
    flex: 1,
    backgroundColor: BG_DEEP,
    overflow: "hidden",
  },

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

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },

  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 40,
    marginTop: 4,
    marginBottom: 38,
    paddingHorizontal: 4,
    position: "relative",
  },

  headerCompact: {
    marginTop: 2,
    marginBottom: 16,
  },

  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },

  headerIdentityCompact: {
    paddingRight: 0,
  },

  brandGroup: {
    alignItems: "flex-start",
  },

  headerCityKr: {
    color: TXT,
  },

  headerCityEn: {
    color: "rgba(255,255,255,0.65)",
    marginTop: -1,
  },

  headerDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.09)",
    marginHorizontal: 16,
  },

  headerDividerCompact: {
    height: 22,
    marginHorizontal: 9,
  },

  statusGroup: {
    justifyContent: "center",
    flexShrink: 1,
  },

  liveIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: CYAN,
    marginRight: 6,
  },

  statusText: {
    color: "rgba(224,242,254,0.74)",
  },

  locationText: {
    color: "rgba(224,242,254,0.40)",
    marginLeft: 11,
  },

  streakHeaderSlot: {
    marginLeft: 12,
    flexShrink: 0,
  },

  streakHeaderSlotCompact: {
    marginLeft: 8,
  },

  streakBadgePressable: {
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: STREAK_ACCENT.cardBorder,
    backgroundColor: "rgba(2,3,6,0.34)",
    boxShadow: `0px 4px 16px ${STREAK_ACCENT.featuredShadow}`,
  },

  streakBadgePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  streakBadgeBlur: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: "relative",
    overflow: "hidden",
  },

  streakBadgePrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  streakBadgeValue: {
    color: "rgba(241,245,249,0.78)",
  },

  streakBadgeValueActive: {
    color: TXT,
    ...textGlow(STREAK_ACCENT.selectedShadow, 8),
  },

  streakBadgeDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginHorizontal: 8,
  },

  streakBadgeSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  streakBadgeFreezeValue: {
    color: "rgba(224,242,254,0.66)",
  },

  streakBadgeStatusDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(241,245,249,0.20)",
  },

  streakBadgeStatusDotActive: {
    backgroundColor: STREAK_ACCENT.base,
    boxShadow: `0px 0px 7px ${STREAK_ACCENT.glow}`,
  },

  // HERO H1
  seoulHeroContainer: {
    position: "relative",
    paddingHorizontal: 0,
    marginTop: 78,
    marginBottom: 78,
  },

  seoulHeroTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },

  seoulHeroTitleStatic: {
    fontSize: 42,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#F5F7FA",
  },

  seoulHeroTitleShadow: {
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 6,
  },

  seoulHeroAccentPlaceholder: {
    opacity: 0,
  },

  seoulHeroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
    color: "rgba(245,247,250,0.72)",
  },

  heroLabel: {
    color: "rgba(255,255,255,0.70)",
    textAlign: "left",
    marginBottom: 12,
    paddingHorizontal: 4,
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
    marginBottom: 12,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  mainCard: {
    padding: 20,
  },

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

  progressContainer: {
    gap: 10,
  },

  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },

  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  progressText: {
    color: SOFT,
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

  grid: {
    gap: 10,
  },

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

  seqIcon: {},

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
