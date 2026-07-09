import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Compass, MessageCircleMore } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";
import { useDailyStreak } from "../../lib/DailyStreakProvider";
import type { DailyStreakState } from "../../lib/dailyStreak";

const { width } = Dimensions.get("window");
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

const fonts = {
  medium: "Outfit_500Medium",
  bold: "Outfit_700Bold",
  krBold: "NotoSansKR_700Bold",
};

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

const HANGUL_PROGRESS_TOTAL = 20;

const SEQUENCES: any[] = [
  {
    title: "L'alphabet coréen",
    label: "Hangul",
    color: CYAN,
    route: "/hangul",
    trackKey: "hangul",
    place: "CENTRE D'APPRENTISSAGE",
    narrative: "Décrypte l'âme visuelle de la ville.",
    type: "pedagogical",
  },
  {
    title: "Scènes interactives",
    label: "Restaurant",
    color: "#F59E0B",
    route: "/voc",
    trackKey: "vocab",
    place: "ITAEWON • DINER",
    narrative: "Apprends le vocabulaire selon le contexte",
    type: "pedagogical",
  },
  {
    title: "Les nombres coréens",
    label: "Comptage",
    color: CYAN,
    route: "/comptage",
    trackKey: "numbers",
    place: "HONGDAE • QUANTITÉS",
    narrative: "Maîtrise les nombres dans le réel.",
    type: "pedagogical",
  },
  {
    title: "Compter le monde réel",
    label: "Classificateurs",
    color: "#34D399",
    route: "/classificateur",
    trackKey: "classifier",
    isComingSoon: true,
    place: "MARCHÉ • QUANTITÉS",
    narrative: "Donne une forme aux objets et aux personnes.",
    type: "pedagogical",
  },
  {
    title: "Apprends en immersion",
    label: "Le Métro",
    color: PINK,
    route: "/speak",
    trackKey: "dialogs",
    place: "LIGNE 2 • SE DÉPLACER",
    narrative: "Navigue dans le flux de la capitale.",
    type: "immersion",
  },
  {
    title: "Développe ton écoute",
    label: "Listen",
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
    label: "Aéroport",
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
    label: "Café",
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
    label: "Le Métro",
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
    label: "Restaurant",
    color: "#F59E0B",
    route: "/lesson/restaurantMissions",
    routeParams: { mode: "guided" },
    trackKey: "restaurant_ia",
    place: "ITAEWON - DINER",
    narrative: "Reprends ta dernière mission restaurant.",
    type: "immersion",
  },
};

export default function Home() {
  const { progress, setTrack } = useStore();
  const { refreshStreak, streak } = useDailyStreak();
  const currentTrack = progress.learningTrack;
  const activeSeq =
    (currentTrack ? RESUME_SEQUENCES[currentTrack] : undefined) ??
    SEQUENCES.find((s) => s.trackKey === currentTrack) ??
    SEQUENCES[0];
  const activeSeqProgress = getSequenceProgress(activeSeq.trackKey, progress);
  const activeSeqNarrative =
    activeSeq.trackKey === "hangul" && activeSeqProgress > 0
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
          contentContainerStyle={styles.scrollContent}
        >
          {/* TOP HEADER */}
          <View style={styles.header}>
            <View style={styles.headerIdentity}>
              <View style={styles.brandGroup}>
                <Text style={styles.headerCityKr}>서울</Text>
                <Text style={styles.headerCityEn}>SEOUL</Text>
              </View>

              <View style={styles.headerDivider} />

              <View style={styles.statusGroup}>
                <View style={styles.liveIndicatorRow}>
                  <Animated.View
                    style={[styles.liveDot, { opacity: pulseAnim }]}
                  />
                  <Text style={styles.statusText}>IMMERSION ACTIVE</Text>
                </View>
                <Text style={styles.locationText}>KOREA STANDARD TIME</Text>
              </View>
            </View>

            <Pressable style={styles.settingsTrigger}>
              <BlurView intensity={80} tint="dark" style={styles.settingsBlur}>
                <View style={styles.settingsInner} />
              </BlurView>
            </Pressable>
          </View>

          {/* HERO - SEOUL IMMERSION */}
          <View style={styles.heroBlock}>
            <View style={styles.heroWrap}>
              <View style={styles.heroContent}>
                <Text style={styles.heroLabel}>SÉOUL IMMERSION</Text>

                <View style={styles.heroSeoulTitleWrap}>
                  <Text style={styles.heroSeoulShadow}>어서 오세요.</Text>
                  <Text style={styles.heroSeoulTitle}>어서 오세요.</Text>
                </View>

                <Text style={styles.heroTitle}>Entre dans la ville.</Text>

                <Text style={styles.heroSubtitle}>
                  Apprends le coréen comme si tu y étais déjà.
                </Text>

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
            <Text style={styles.sectionTitle}>{"POINTS D'ENTRÉE"}</Text>
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

          <View style={styles.grid}>
            {pedagogicalSequences.map((seq, i) => (
              <AnimatedFragment key={seq.trackKey} index={i + 1}>
                <SequenceCard
                  item={seq}
                  isActive={seq.trackKey === currentTrack}
                  onPress={() => openSequence(seq)}
                />
              </AnimatedFragment>
            ))}
          </View>

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>IMMERSION</Text>
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

          <View style={styles.grid}>
            {immersionSequences.map((seq, i) => (
              <AnimatedFragment
                key={seq.trackKey}
                index={i + 1 + pedagogicalSequences.length}
              >
                <SequenceCard
                  item={seq}
                  isActive={seq.trackKey === currentTrack}
                  onPress={() => openSequence(seq)}
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
// COMPONENTS
// ──────────────────────────────────────────────
function AnimatedFragment({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
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
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function MainActionCard({ sequence, narrative, progress, onPress }: any) {
  const displayLabel =
    sequence.trackKey === "numbers" ? "Les nombres" : sequence.label;

  return (
    <Pressable
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
          <Text style={styles.cardKicker}>REPRENDRE LA SÉQUENCE</Text>
          <Text style={styles.cardTitle}>{displayLabel}</Text>
          <Text style={styles.cardNarrative}>{narrative}</Text>
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
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}% {"d'immersion"}
            </Text>
          </View>
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
  const statusLabel = isValidated ? "Jour valide" : "À faire";
  const helperText = isValidated
    ? "Ta série est conservée. Les autres activités du jour restent du bonus."
    : "Termine une activité aujourd'hui pour conserver ta série.";

  return (
    <Pressable onPress={onPress}>
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
            <Text style={styles.streakKicker}>SÉRIE QUOTIDIENNE</Text>
            <View style={styles.streakNumberRow}>
              <View style={styles.streakSymbol}>
                <Text style={styles.streakSymbolText}>ST</Text>
              </View>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakUnit}>
                {currentStreak > 1 ? "jours" : "jour"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.streakStatus,
              isValidated && styles.streakStatusValidated,
            ]}
          >
            <Text
              style={[
                styles.streakStatusText,
                isValidated && styles.streakStatusTextValidated,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.streakMessageBox}>
          <Text style={styles.streakMessageTitle}>
            {isValidated ? "Objectif du jour atteint" : "Objectif du jour"}
          </Text>
          <Text style={styles.streakGoal}>{helperText}</Text>
        </View>

        <View style={styles.streakMetrics}>
          <View style={styles.streakMetricCard}>
            <Text style={styles.streakMetricValue}>{longestStreak} j</Text>
            <Text style={styles.streakMetricLabel}>Record</Text>
          </View>
          <View style={styles.streakMetricCard}>
            <Text style={styles.streakMetricValue}>{freezesAvailable}</Text>
            <Text style={styles.streakMetricLabel}>Freezes</Text>
          </View>
          <View style={styles.streakMetricCard}>
            <Text style={styles.streakMetricValue}>
              {isValidated ? "OK" : "1"}
            </Text>
            <Text style={styles.streakMetricLabel}>
              {isValidated ? "Valide" : "activité"}
            </Text>
          </View>
        </View>

        <Text style={styles.streakOpenHint}>
          Voir le calendrier et les badges
        </Text>
      </BlurView>
    </Pressable>
  );
}

function getSequenceProgress(trackKey: string, progress: any) {
  if (trackKey !== "hangul") return 0.45;

  const completedHangulItems = Object.keys(progress.completed ?? {}).filter(
    (id) => id.startsWith("hangul_"),
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
    case "classifier":
      return "○";
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
    <Text
      style={[
        styles.seqIcon,
        {
          color,
        },
        textGlow(color, 10),
      ]}
    >
      {icon}
    </Text>
  );
}

function SequenceCard({ item, isActive, onPress }: any) {
  const icon = getSequenceIcon(item.trackKey);
  const isComingSoon = !!item.isComingSoon;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.seqCard,
        isComingSoon && styles.seqCardDisabled,
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
          <Text style={styles.seqPlace}>{item.place}</Text>
          <Text style={styles.seqTitle}>{item.title}</Text>
          <Text style={styles.seqSub}>{item.narrative}</Text>
        </View>

        <Text
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
        </Text>

        {isComingSoon && (
          <View pointerEvents="none" style={styles.comingSoonOverlay}>
            <View style={styles.comingSoonScrim} />
            <View
              style={[
                styles.comingSoonBadge,
                {
                  borderColor: `${item.color}70`,
                  backgroundColor: `${item.color}18`,
                },
              ]}
            >
              <Text style={[styles.comingSoonText, { color: item.color }]}>
                PROCHAINEMENT
              </Text>
            </View>
          </View>
        )}
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1, backgroundColor: BG_DEEP },
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 100 },

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
  headerIdentity: { flexDirection: "row", alignItems: "center" },
  brandGroup: { alignItems: "flex-start" },
  headerCityKr: {
    fontSize: 17.5,
    fontFamily: fonts.krBold,
    color: TXT,
    letterSpacing: -0.5,
  },
  headerCityEn: {
    fontSize: 9.8,
    fontFamily: fonts.bold,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 4,
    marginTop: -3,
  },
  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: 18,
  },
  statusGroup: { justifyContent: "center" },
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
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.6,
  },
  locationText: {
    color: "rgba(224, 242, 254, 0.55)",
    fontFamily: fonts.medium,
    fontSize: 8.2,
    letterSpacing: 0.6,
  },
  settingsTrigger: {
    position: "absolute",
    right: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  settingsBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#F1F5F9",
    opacity: 0.85,
  },

  // HERO - SEOUL IMMERSION
  heroBlock: {
    marginBottom: 40,
  },
  heroWrap: {
    height: 300,
    justifyContent: "center",
    position: "relative",
  },
  heroContent: {
    paddingHorizontal: 4,
    alignItems: "flex-start",
    position: "relative",
  },
  heroLabel: {
    fontSize: 9,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.70)",
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: "center",
  },

  heroSeoulTitleWrap: {
    position: "absolute",
    top: 18,
    left: -4,
    width: width - 48,
    height: 115,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  heroSeoulShadow: {
    position: "absolute",
    left: 2,
    top: 4,
    fontSize: 60,
    lineHeight: 108,
    fontFamily: fonts.krBold,
    color: "rgba(103,232,249,0.16)",
    ...textGlow("rgba(199,184,255,0.30)", 26),
  },
  heroSeoulTitle: {
    fontSize: 60,
    lineHeight: 108,
    fontFamily: fonts.krBold,
    color: "rgba(215,247,255,0.84)",
    ...textGlow("rgba(103,232,249,0.38)", 18),
  },

  heroTitle: {
    fontSize: 21,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 120,
    marginBottom: 6,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 22,
    marginBottom: 18,
    maxWidth: width - 96,
    textAlign: "center",
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
    fontSize: 10,
    fontFamily: fonts.bold,
    color: SOFT,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: TXT,
    marginBottom: 8,
  },
  cardNarrative: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: MUTED,
    lineHeight: 22,
    marginBottom: 24,
  },
  progressContainer: { gap: 10 },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 12, fontFamily: fonts.medium, color: SOFT },

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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  streakCounterBlock: {
    flex: 1,
  },
  streakKicker: {
    color: "rgba(241,245,249,0.48)",
    fontSize: 9,
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
    marginBottom: 5,
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
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
  },
  streakNumber: {
    color: TXT,
    fontSize: 42,
    fontFamily: fonts.bold,
    lineHeight: 46,
    letterSpacing: -1,
  },
  streakUnit: {
    color: "rgba(241,245,249,0.72)",
    fontSize: 14,
    fontFamily: fonts.bold,
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
    fontSize: 9,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
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
    fontSize: 13,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  streakGoal: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.medium,
  },
  streakMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  streakMetricCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  streakMetricValue: {
    color: TXT,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  streakMetricLabel: {
    color: "rgba(241,245,249,0.50)",
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 3,
  },
  streakOpenHint: {
    color: "rgba(103,232,249,0.72)",
    fontFamily: fonts.bold,
    fontSize: 11,
    marginTop: 12,
    textAlign: "center",
  },

  // SECTION DIVIDERS
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: "rgba(241,245,249,0.48)",
    letterSpacing: 3,
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

  // SEQUENCE CARDS
  seqCard: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(2,3,6,0.26)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    boxShadow: "0px 8px 14px rgba(0,0,0,0.28)",
  },
  seqCardDisabled: {
    opacity: 0.82,
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
    fontSize: 21,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
  },
  seqDividerLine: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 12,
  },
  seqText: {
    flex: 1,
  },
  seqPlace: {
    fontSize: 7.8,
    fontFamily: fonts.bold,
    color: "rgba(241,245,249,0.34)",
    letterSpacing: 1.45,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  seqTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: TXT,
    letterSpacing: -0.25,
  },
  seqSub: {
    fontSize: 12.2,
    fontFamily: fonts.medium,
    color: "rgba(241,245,249,0.62)",
    marginTop: 3,
    lineHeight: 16.5,
  },
  seqArrow: {
    color: "rgba(255,255,255,0.36)",
    fontSize: 28,
    opacity: 0.52,
    marginLeft: 8,
  },
  comingSoonOverlay: {
    ...ABSOLUTE_FILL,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 14,
  },
  comingSoonScrim: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.88)",
  },
  comingSoonBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  comingSoonText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.4,
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
