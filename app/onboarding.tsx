import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, MoveRight } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppText } from "../components/app-text";

const SCENE_BACKGROUND = require("../assets/images/onboarding-scene-v2.webp");
const CAFE_IMAGE = require("../assets/images/cafeIA.jpg");
const METRO_IMAGE = require("../assets/images/metroIA.jpg");
const RESTAURANT_IMAGE = require("../assets/images/restaurantIA.jpg");
const AIRPORT_IMAGE = require("../assets/images/airport.jpg");

const ONBOARDING_KEY = "kapp_onboarding_completed";
const PINK = "#FF2F7D";
const CYAN = "#3DD6C6";
const METRO_GREEN = "#31C78A";
const GOLD = "#D58D4D";
const WHITE = "#FFFFFF";
const NIGHT = "#070916";
const CARD_LINE = "rgba(255,255,255,0.065)";

const CARD_GRID_LINES = Array.from({ length: 13 }, (_, index) => index);

type SceneKey = "cafe" | "metro" | "restaurant" | "airport";
type ModeKey = "text" | "guided";
type OnboardingStep = "scene" | "mode";

type SceneOption = {
  key: SceneKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  phrase: string;
  accent: string;
  image: number;
};

const SCENES: SceneOption[] = [
  {
    key: "cafe",
    eyebrow: "HONGDAE",
    title: "Café",
    subtitle: "Commande comme si tu y étais, dans le bruit du comptoir et la pluie dehors.",
    phrase: "아메리카노 한 잔 주세요",
    accent: PINK,
    image: CAFE_IMAGE,
  },
  {
    key: "metro",
    eyebrow: "LIGNE 2",
    title: "Métro",
    subtitle: "Trouve ton chemin dans Séoul.",
    phrase: "2호선은 어디예요?",
    accent: CYAN,
    image: METRO_IMAGE,
  },
  {
    key: "restaurant",
    eyebrow: "ITAEWON",
    title: "Restaurant",
    subtitle: "Commande naturellement à table.",
    phrase: "이거 주세요",
    accent: GOLD,
    image: RESTAURANT_IMAGE,
  },
  {
    key: "airport",
    eyebrow: "INCHEON",
    title: "Aéroport",
    subtitle: "Repère-toi dès ton arrivée en Corée.",
    phrase: "지하철은 어디예요?",
    accent: CYAN,
    image: AIRPORT_IMAGE,
  },
];

const ROUTES: Record<SceneKey, Record<ModeKey, string>> = {
  cafe: { text: "/lesson/cafe", guided: "/lesson/cafeMissions" },
  metro: { text: "/lesson/metro", guided: "/lesson/metroMissions" },
  restaurant: { text: "/lesson/restaurant", guided: "/lesson/restaurantMissions" },
  airport: { text: "/lesson/airport", guided: "/lesson/aeroportMissions" },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const lerp = (min: number, max: number, amount: number) =>
  min + (max - min) * amount;

async function lightTap() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics are intentionally non-blocking on unsupported devices.
  }
}

function SceneBackground({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={SCENE_BACKGROUND}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <LinearGradient
        colors={[
          dimmed ? "rgba(2,3,10,0.42)" : "rgba(2,3,10,0.04)",
          dimmed ? "rgba(2,3,10,0.62)" : "rgba(2,3,10,0.06)",
          "rgba(2,3,10,0.28)",
          "rgba(2,3,10,0.64)",
        ]}
        locations={[0, 0.34, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function OnboardingBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#0A0C18", NIGHT, "#050711"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.backgroundPinkGlow} />
      <View style={styles.backgroundCyanGlow} />
    </View>
  );
}

function FeaturedCafeCard({
  height,
  compact,
  horizontalPadding,
  verticalPadding,
}: {
  height: number;
  compact: boolean;
  horizontalPadding: number;
  verticalPadding: number;
}) {
  const phraseVariant = compact ? "koreanSecondary" : "koreanPrimary";
  const titleVariant = compact ? "featureTitle" : "sceneTitle";
  const bodyVariant = compact ? "bodySecondary" : "body";

  return (
    <View
      accessible
      accessibilityLabel="Café à Hongdae. Idéal pour débuter. 아메리카노 한 잔 주세요. Un americano, s'il vous plaît."
      style={[styles.featuredCard, { height }]}
    >
      <LinearGradient
        colors={["#123940", "#351A32", "#24151D", "#090B18"]}
        locations={[0, 0.34, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardCyanGlow} />
      <View style={styles.cardPinkGlow} />
      <View style={styles.cardWarmGlow} />
      <LinearGradient
        colors={["rgba(3,6,15,0.00)", "rgba(5,7,18,0.08)", "rgba(5,6,16,0.52)", "rgba(5,6,16,0.90)"]}
        locations={[0, 0.44, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardGrid}>
        {CARD_GRID_LINES.map((line) => (
          <View key={line} style={styles.cardGridLine} />
        ))}
      </View>

      <View
        style={[
          styles.featuredTopRow,
          { paddingHorizontal: horizontalPadding, paddingTop: verticalPadding },
        ]}
      >
        <View style={styles.recommendedPill}>
          <View style={styles.recommendedDot} />
          <AppText variant="label" style={styles.recommendedText}>
            Idéal pour débuter
          </AppText>
        </View>
        <AppText variant="sectionLabel" style={styles.featuredLocation}>
          HONGDAE
        </AppText>
      </View>

      <View
        style={[
          styles.featuredCopy,
          { paddingHorizontal: horizontalPadding, paddingBottom: verticalPadding },
        ]}
      >
        <AppText
          accessibilityLanguage="ko-KR"
          variant={phraseVariant}
          script="korean"
          style={styles.featuredPhrase}
        >
          아메리카노 한 잔 주세요
        </AppText>
        <AppText variant="bodySecondary" style={styles.featuredTranslation}>
          "Un americano, s'il vous plaît"
        </AppText>
        <AppText variant={titleVariant} style={styles.featuredTitle}>
          Café
        </AppText>
        <AppText variant={bodyVariant} style={styles.featuredSubtitle}>
          Commande comme si tu y étais, dans le bruit du comptoir et la pluie dehors.
        </AppText>
      </View>
    </View>
  );
}

const JOURNEY_STEPS = [
  { key: "cafe", icon: "☕", title: "Café", subtitle: "Ligne 2", accent: PINK, active: true },
  { key: "metro", icon: "🚇", title: "Métro", subtitle: "Ligne 2", accent: METRO_GREEN },
  { key: "restaurant", icon: "🍜", title: "Restaurant", subtitle: "Itaewon", accent: GOLD },
  { key: "later", icon: "•••", title: "À venir", subtitle: "verrouillé", accent: "#62647E", locked: true },
] as const;

function JourneyTimeline({ nodeSize, compact }: { nodeSize: number; compact: boolean }) {
  return (
    <View style={styles.timelineWrap}>
      <View style={[styles.timelineRail, { left: nodeSize / 2, right: nodeSize / 2, top: nodeSize / 2 - 1 }]}>
        <View style={styles.timelineRailActive} />
      </View>

      <View style={styles.timelineRow}>
        {JOURNEY_STEPS.map((step) => (
          <View key={step.key} style={styles.timelineStep}>
            <View
              style={[
                styles.timelineNode,
                {
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: nodeSize / 2,
                  borderColor: step.accent,
                  shadowColor: step.accent,
                },
                step.active && styles.timelineNodeActive,
                step.locked && styles.timelineNodeLocked,
              ]}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.timelineEmoji,
                  compact && styles.timelineEmojiCompact,
                  step.locked && styles.timelineLockedDots,
                ]}
              >
                {step.icon}
              </Text>
            </View>
            <AppText variant={compact ? "caption" : "bodyStrong"} style={styles.timelineTitle}>
              {step.title}
            </AppText>
            <AppText variant="caption" style={styles.timelineSubtitle}>
              {step.subtitle}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<OnboardingStep>("scene");
  const [selectedMode, setSelectedMode] = useState<ModeKey>("guided");
  const entrance = useRef(new Animated.Value(0)).current;

  const isTablet = width >= 768;
  const largeText = fontScale > 1.15;
  const viewportHeight = Math.max(0, height - insets.top - insets.bottom);
  const verticalProgress = isTablet
    ? 1
    : clamp((viewportHeight - 590) / 290, 0, 1);
  const compact = !isTablet && !largeText && viewportHeight < 690;
  const horizontalPadding = isTablet ? 30 : width <= 370 ? 16 : width >= 425 ? 24 : 21;

  const sceneLayout = useMemo(
    () => ({
      contentTop: Math.round(lerp(2, 14, verticalProgress)),
      contentBottom: Math.round(lerp(3, 12, verticalProgress)),
      headerHeight: Math.round(lerp(38, 48, verticalProgress)),
      headerBottom: Math.round(lerp(6, 20, verticalProgress)),
      eyebrowBottom: Math.round(lerp(4, 9, verticalProgress)),
      subtitleTop: Math.round(lerp(5, 10, verticalProgress)),
      introBottom: Math.round(lerp(6, 20, verticalProgress)),
      heroHeight: isTablet ? 390 : Math.round(lerp(198, 352, verticalProgress)),
      heroPaddingX: Math.round(lerp(14, 22, verticalProgress)),
      heroPaddingY: Math.round(lerp(10, 18, verticalProgress)),
      timelineTop: Math.round(lerp(8, 24, verticalProgress)),
      timelineLabelBottom: Math.round(lerp(4, 10, verticalProgress)),
      nodeSize: isTablet ? 60 : Math.round(lerp(44, 58, verticalProgress)),
      timelineBottom: Math.round(lerp(5, 20, verticalProgress)),
      primaryHeight: Math.round(lerp(48, 64, verticalProgress)),
      secondaryHeight: Math.round(lerp(32, 44, verticalProgress)),
    }),
    [isTablet, verticalProgress],
  );

  const cafeScene = SCENES[0];

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 430,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const entranceStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  const openHub = async () => {
    await lightTap();
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)" as any);
  };

  const goBack = async () => {
    await lightTap();
    router.back();
  };

  const openMode = async () => {
    await lightTap();
    setStep("mode");
  };

  const finish = async () => {
    await lightTap();
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    const route = ROUTES.cafe[selectedMode];
    const target = selectedMode === "text" ? route : { pathname: route, params: { mode: selectedMode } };
    router.replace(target as any);
  };

  if (step === "mode") {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <SceneBackground dimmed />
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={[styles.modePage, { paddingHorizontal: horizontalPadding }]}>
            <ScrollView
              style={styles.modeScroll}
              contentContainerStyle={styles.modeContent}
              showsVerticalScrollIndicator={false}
            >
              <AppText variant="sectionLabel" style={styles.modeEyebrow}>
                SCÈNE CHOISIE
              </AppText>
              <AppText variant="screenTitle" style={styles.modeTitle}>
                {cafeScene.title}
              </AppText>
              <AppText variant="body" style={styles.modeSubtitle}>
                Choisis ton approche.
              </AppText>

              <View style={styles.modeHero}>
                <Image source={cafeScene.image} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient
                  colors={["transparent", "rgba(2,3,7,0.94)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.modeHeroCopy}>
                  <AppText variant="sectionLabel" style={{ color: cafeScene.accent }}>
                    {cafeScene.eyebrow}
                  </AppText>
                  <AppText variant="cardTitle" style={styles.modeHeroTitle}>
                    {cafeScene.title}
                  </AppText>
                </View>
              </View>

              <View style={styles.modeChoices}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedMode === "guided" }}
                  onPress={async () => {
                    await lightTap();
                    setSelectedMode("guided");
                  }}
                  style={[
                    styles.modeChoice,
                    selectedMode === "guided" && styles.modeChoiceActive,
                  ]}
                >
                  <View style={styles.modeChoiceCopy}>
                    <AppText variant="cardTitle" style={styles.modeChoiceTitle}>
                      Entre dans la scène
                    </AppText>
                    <AppText variant="bodySecondary" style={styles.modeChoiceText}>
                      Écoute et réponds comme si tu étais sur place.
                    </AppText>
                  </View>
                  <View style={[styles.radio, selectedMode === "guided" && styles.radioActive]} />
                </Pressable>

                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedMode === "text" }}
                  onPress={async () => {
                    await lightTap();
                    setSelectedMode("text");
                  }}
                  style={[
                    styles.modeChoice,
                    selectedMode === "text" && styles.modeChoiceActive,
                  ]}
                >
                  <View style={styles.modeChoiceCopy}>
                    <AppText variant="cardTitle" style={styles.modeChoiceTitle}>
                      Expressions utiles
                    </AppText>
                    <AppText variant="bodySecondary" style={styles.modeChoiceText}>
                      Revois d’abord les mots et expressions de la situation.
                    </AppText>
                  </View>
                  <View style={[styles.radio, selectedMode === "text" && styles.radioActive]} />
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={finish}
                style={({ pressed }) => [styles.modePrimary, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={["#E65D9D", "#8C426C", "#3F263A"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
                <AppText variant="button" style={styles.buttonText}>
                  Commencer
                </AppText>
                <MoveRight size={19} color={WHITE} strokeWidth={2.2} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={async () => {
                  await lightTap();
                  setStep("scene");
                }}
                style={styles.modeBack}
              >
                <AppText variant="button" style={styles.modeBackText}>
                  Retour aux immersions
                </AppText>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const titleVariant = compact ? "featureTitle" : "screenTitle";
  const introVariant = compact ? "bodySecondary" : "body";

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <OnboardingBackground />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={[styles.scenePage, { paddingHorizontal: horizontalPadding }]}>
          <ScrollView
            style={styles.sceneScroll}
            contentContainerStyle={[
              styles.sceneScrollContent,
              {
                paddingTop: sceneLayout.contentTop,
                paddingBottom: sceneLayout.contentBottom,
              },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View style={[styles.sceneInner, entranceStyle]}>
              <View style={[styles.header, { height: sceneLayout.headerHeight, marginBottom: sceneLayout.headerBottom }]}>
                <View style={styles.headerSide}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retour"
                    onPress={goBack}
                    hitSlop={10}
                    style={({ pressed }) => [
                      styles.backButton,
                      compact && styles.backButtonCompact,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ArrowLeft size={compact ? 18 : 20} color="#A5A6BC" strokeWidth={2} />
                  </Pressable>
                </View>

                <View
                  style={[styles.progressSegments, { gap: compact ? 7 : 10 }]}
                  accessibilityLabel="Étape 1 sur 3"
                >
                  <View
                    style={[
                      styles.progressSegment,
                      { width: compact ? 30 : 36 },
                      styles.progressSegmentActive,
                    ]}
                  />
                  <View style={[styles.progressSegment, { width: compact ? 30 : 36 }]} />
                  <View style={[styles.progressSegment, { width: compact ? 30 : 36 }]} />
                </View>

                <View style={[styles.headerSide, styles.headerSideRight]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Passer l'onboarding"
                    onPress={openHub}
                    hitSlop={10}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <AppText variant={compact ? "bodySecondary" : "bodyStrong"} style={styles.skipText}>
                      Passer
                    </AppText>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.intro, { marginBottom: sceneLayout.introBottom }]}>
                <AppText
                  variant="sectionLabel"
                  style={[styles.introEyebrow, { marginBottom: sceneLayout.eyebrowBottom }]}
                >
                  SÉOUL · NUIT 01
                </AppText>
                <AppText accessibilityRole="header" variant={titleVariant} style={styles.introTitle}>
                  Pose le pied{"\n"}à <Text style={styles.introTitleAccent}>Séoul.</Text>
                </AppText>
                <AppText
                  variant={introVariant}
                  style={[styles.introSubtitle, { marginTop: sceneLayout.subtitleTop }]}
                >
                  Chaque scène est une situation réelle. On ne te note pas — on t'y met.
                </AppText>
              </View>

              <FeaturedCafeCard
                height={sceneLayout.heroHeight}
                compact={compact}
                horizontalPadding={sceneLayout.heroPaddingX}
                verticalPadding={sceneLayout.heroPaddingY}
              />

              <View style={{ marginTop: sceneLayout.timelineTop }}>
                <AppText
                  variant="sectionLabel"
                  style={[styles.journeyLabel, { marginBottom: sceneLayout.timelineLabelBottom }]}
                >
                  TON PARCOURS CE SOIR
                </AppText>
                <JourneyTimeline nodeSize={sceneLayout.nodeSize} compact={compact} />
              </View>

              <View style={{ marginTop: sceneLayout.timelineBottom }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Commencer par Café"
                  onPress={openMode}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { minHeight: sceneLayout.primaryHeight },
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#FF2F7D", "#D81668", "#C10C59"]}
                    locations={[0, 0.58, 1]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.primaryHighlight} />
                  <AppText variant={compact ? "button" : "cardTitle"} style={styles.primaryButtonText}>
                    Commencer par Café →
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Explorer le Hub librement"
                  onPress={openHub}
                  style={({ pressed }) => [
                    styles.hubLink,
                    { minHeight: sceneLayout.secondaryHeight },
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText variant={compact ? "caption" : "bodyStrong"} style={styles.hubLinkText}>
                    ◇ Explorer le Hub librement
                  </AppText>
                </Pressable>
              </View>

              {largeText ? <View style={styles.largeTextSpacer} /> : null}
            </Animated.View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NIGHT },
  safe: { flex: 1 },
  backgroundPinkGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -130,
    top: 110,
    backgroundColor: "rgba(217,22,102,0.035)",
  },
  backgroundCyanGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -145,
    top: 300,
    backgroundColor: "rgba(34,211,238,0.025)",
  },
  scenePage: {
    flex: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  sceneScroll: { flex: 1 },
  sceneScrollContent: { flexGrow: 1, width: "100%" },
  sceneInner: { width: "100%" },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  headerSide: { flex: 1, alignItems: "flex-start", justifyContent: "center" },
  headerSideRight: { alignItems: "flex-end" },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
  },
  backButtonCompact: { width: 40, height: 40, borderRadius: 20 },
  progressSegments: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSegment: {
    height: 6,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  progressSegmentActive: {
    backgroundColor: PINK,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
    elevation: 3,
  },
  skipText: { color: "#B7B7C9" },
  intro: { maxWidth: 560 },
  introEyebrow: { color: CYAN },
  introTitle: { color: "#F8F5F7" },
  introTitleAccent: { color: PINK },
  introSubtitle: { color: "#A9A8BE", maxWidth: 560 },
  featuredCard: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(187,60,124,0.42)",
    backgroundColor: "#0B0D18",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 6,
  },
  cardCyanGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -150,
    left: -115,
    backgroundColor: "rgba(27,201,215,0.22)",
  },
  cardPinkGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -165,
    right: -105,
    backgroundColor: "rgba(255,35,125,0.24)",
  },
  cardWarmGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -80,
    right: 34,
    backgroundColor: "rgba(183,101,48,0.11)",
  },
  cardGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    opacity: 0.8,
  },
  cardGridLine: {
    width: 1,
    height: "125%",
    marginTop: -18,
    backgroundColor: CARD_LINE,
    transform: [{ rotate: "8deg" }],
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  recommendedPill: {
    minHeight: 31,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,47,125,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(18,16,29,0.28)",
  },
  recommendedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PINK,
  },
  recommendedText: { color: "#E8DDE6" },
  featuredLocation: { color: "#C4B6C2", textAlign: "right" },
  featuredCopy: { maxWidth: 560 },
  featuredPhrase: {
    color: "#F7F3F0",
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  featuredTranslation: {
    color: "#AAA8BA",
    marginTop: 2,
    fontStyle: "italic",
  },
  featuredTitle: {
    color: WHITE,
    marginTop: 8,
    textShadowColor: "rgba(0,0,0,0.48)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 7,
  },
  featuredSubtitle: {
    color: "#B2B0C2",
    marginTop: 7,
    maxWidth: 470,
  },
  journeyLabel: { color: "#686B85" },
  timelineWrap: { width: "100%", position: "relative" },
  timelineRail: {
    position: "absolute",
    height: 3,
    borderRadius: 99,
    backgroundColor: "#555970",
    overflow: "hidden",
  },
  timelineRailActive: {
    width: "27%",
    height: "100%",
    backgroundColor: PINK,
  },
  timelineRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineStep: { flex: 1, alignItems: "center" },
  timelineNode: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111423",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineNodeActive: {
    borderWidth: 0,
    backgroundColor: PINK,
    shadowOpacity: 0.48,
    shadowRadius: 12,
    elevation: 6,
  },
  timelineNodeLocked: {
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  timelineEmoji: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    color: WHITE,
  },
  timelineEmojiCompact: { fontSize: 17, lineHeight: 21 },
  timelineLockedDots: {
    fontSize: 16,
    letterSpacing: 1,
    color: "#73758F",
  },
  timelineTitle: {
    color: "#F0EDF0",
    marginTop: 6,
    textAlign: "center",
  },
  timelineSubtitle: {
    color: "#5E6077",
    marginTop: 1,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.36,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryHighlight: {
    position: "absolute",
    top: 0,
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  primaryButtonText: { color: WHITE, textAlign: "center" },
  hubLink: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  hubLinkText: { color: "#A6A4B7", textAlign: "center" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.992 }] },
  largeTextSpacer: { height: 18 },
  buttonText: { color: WHITE, textAlign: "center" },
  modePage: { flex: 1, width: "100%", maxWidth: 620, alignSelf: "center" },
  modeScroll: { flex: 1 },
  modeContent: { paddingTop: 24, paddingBottom: 18 },
  modeEyebrow: { color: CYAN, marginBottom: 10 },
  modeTitle: { color: WHITE },
  modeSubtitle: { color: "rgba(255,255,255,0.66)", marginTop: 7 },
  modeHero: {
    height: 170,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginTop: 24,
    justifyContent: "flex-end",
  },
  modeHeroCopy: { padding: 18 },
  modeHeroTitle: { color: WHITE, marginTop: 3 },
  modeChoices: { gap: 12, marginTop: 18 },
  modeChoice: {
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    backgroundColor: "rgba(4,6,12,0.72)",
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  modeChoiceActive: {
    borderColor: "rgba(112,174,184,0.62)",
    backgroundColor: "rgba(19,38,46,0.76)",
  },
  modeChoiceCopy: { flex: 1 },
  modeChoiceTitle: { color: WHITE },
  modeChoiceText: { color: "rgba(255,255,255,0.58)", marginTop: 3 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.36)",
  },
  radioActive: {
    borderWidth: 5,
    borderColor: CYAN,
    backgroundColor: "rgba(255,255,255,0.90)",
  },
  modePrimary: {
    minHeight: 58,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  modeBack: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  modeBackText: { color: "rgba(255,255,255,0.58)" },
});
