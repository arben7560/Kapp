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
import { AppFontFamily } from "../constants/theme";

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

const CARD_GRID_LINES = Array.from({ length: 15 }, (_, index) => index);

type SceneKey = "cafe" | "metro" | "restaurant" | "airport";
type ModeKey = "text" | "guided";
type OnboardingStep = "scene" | "mode";

type SceneOption = {
  key: SceneKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  phrase: string;
  translation: string;
  accent: string;
  glowLeft: string;
  glowRight: string;
  image: number;
  badge: string;
  timelineSubtitle: string;
  icon: string;
};

const SCENES: SceneOption[] = [
  {
    key: "cafe",
    eyebrow: "HONGDAE",
    title: "Café",
    subtitle: "Commande comme si tu y étais, dans le bruit du comptoir et la pluie dehors.",
    phrase: "아메리카노 한 잔 주세요",
    translation: '"Un americano, s\'il vous plaît"',
    accent: PINK,
    glowLeft: "#1AB5C3",
    glowRight: "#E72C7D",
    image: CAFE_IMAGE,
    badge: "Idéal pour débuter",
    timelineSubtitle: "Ligne 2",
    icon: "☕",
  },
  {
    key: "metro",
    eyebrow: "LIGNE 2",
    title: "Métro",
    subtitle: "Trouve ton chemin dans Séoul et demande ta direction naturellement.",
    phrase: "2호선은 어디예요?",
    translation: '"Où est la ligne 2 ?"',
    accent: METRO_GREEN,
    glowLeft: "#1CB8B9",
    glowRight: "#2B8C73",
    image: METRO_IMAGE,
    badge: "Débutant +",
    timelineSubtitle: "Ligne 2",
    icon: "🚇",
  },
  {
    key: "restaurant",
    eyebrow: "ITAEWON",
    title: "Restaurant",
    subtitle: "Commande naturellement à table, comme dans un vrai restaurant coréen.",
    phrase: "이거 주세요",
    translation: '"Celui-ci, s\'il vous plaît"',
    accent: GOLD,
    glowLeft: "#7E5137",
    glowRight: "#D36B47",
    image: RESTAURANT_IMAGE,
    badge: "Débutant +",
    timelineSubtitle: "Itaewon",
    icon: "🍜",
  },
  {
    key: "airport",
    eyebrow: "INCHEON",
    title: "Aéroport",
    subtitle: "Repère-toi dès ton arrivée et trouve les transports pour rejoindre Séoul.",
    phrase: "지하철은 어디예요?",
    translation: '"Où est le métro ?"',
    accent: CYAN,
    glowLeft: "#1A8DAD",
    glowRight: "#615299",
    image: AIRPORT_IMAGE,
    badge: "Intermédiaire",
    timelineSubtitle: "Incheon",
    icon: "✈️",
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
        colors={["#090B16", NIGHT, "#050711"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function FeaturedSceneCard({
  scene,
  height,
  compact,
  horizontalPadding,
  verticalPadding,
}: {
  scene: SceneOption;
  height: number;
  compact: boolean;
  horizontalPadding: number;
  verticalPadding: number;
}) {
  const titleVariant = compact ? "featureTitle" : "sceneTitle";
  const bodyVariant = compact ? "bodySecondary" : "body";

  return (
    <View
      accessible
      accessibilityLabel={`${scene.title}, ${scene.eyebrow}. ${scene.badge}. ${scene.phrase}. ${scene.translation}.`}
      style={[styles.featuredCard, { height }]}
    >
      <LinearGradient
        colors={["#0D1823", "#17111B", "#080A15"]}
        locations={[0, 0.46, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[`${scene.glowLeft}70`, `${scene.glowLeft}24`, "transparent"]}
        locations={[0, 0.28, 0.66]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.62, y: 0.72 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[`${scene.glowRight}7A`, `${scene.glowRight}26`, "transparent"]}
        locations={[0, 0.28, 0.66]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.38, y: 0.72 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(4,6,15,0.00)", "rgba(5,7,17,0.08)", "rgba(5,6,16,0.66)", "rgba(5,6,16,0.97)"]}
        locations={[0, 0.34, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardGrid}>
        {CARD_GRID_LINES.map((line) => (
          <View key={line} style={styles.cardGridLine} />
        ))}
      </View>

      <LinearGradient
        colors={["rgba(34,211,238,0.24)", "rgba(255,255,255,0.02)", "rgba(255,47,125,0.42)"]}
        locations={[0, 0.48, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.cardBorderAccent}
      />

      <View
        style={[
          styles.featuredTopRow,
          {
            left: 0,
            right: 0,
            top: Math.max(14, verticalPadding + 2),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <View style={[styles.recommendedPill, { borderColor: `${scene.accent}66` }]}>
          <View style={[styles.recommendedDot, { backgroundColor: scene.accent }]} />
          <AppText variant="caption" style={styles.recommendedText}>
            {scene.badge}
          </AppText>
        </View>
        <AppText variant="sectionLabel" style={styles.featuredLocation}>
          {scene.eyebrow}
        </AppText>
      </View>

      <View
        style={[
          styles.featuredCopy,
          {
            left: 0,
            right: 0,
            bottom: Math.max(16, verticalPadding + 2),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <Text
          accessibilityLanguage="ko-KR"
          maxFontSizeMultiplier={1.2}
          style={[styles.featuredPhrase, compact && styles.featuredPhraseCompact]}
        >
          {scene.phrase}
        </Text>
        <AppText variant="bodySecondary" style={styles.featuredTranslation}>
          {scene.translation}
        </AppText>
        <AppText variant={titleVariant} style={styles.featuredTitle}>
          {scene.title}
        </AppText>
        <AppText variant={bodyVariant} style={styles.featuredSubtitle}>
          {scene.subtitle}
        </AppText>
      </View>
    </View>
  );
}

function JourneyTimeline({
  selectedScene,
  nodeSize,
  compact,
  onSelect,
}: {
  selectedScene: SceneKey;
  nodeSize: number;
  compact: boolean;
  onSelect: (scene: SceneKey) => void;
}) {
  const selectedIndex = SCENES.findIndex((scene) => scene.key === selectedScene);
  const activeWidth = `${(selectedIndex / (SCENES.length - 1)) * 100}%` as `${number}%`;

  return (
    <View style={styles.timelineWrap}>
      <View
        style={[
          styles.timelineRail,
          { left: nodeSize / 2, right: nodeSize / 2, top: nodeSize / 2 - 1 },
        ]}
      >
        <View style={[styles.timelineRailActive, { width: activeWidth }]} />
      </View>

      <View style={styles.timelineRow}>
        {SCENES.map((scene) => {
          const selected = scene.key === selectedScene;
          return (
            <Pressable
              key={scene.key}
              accessibilityRole="button"
              accessibilityLabel={`Afficher la scène ${scene.title}`}
              accessibilityState={{ selected }}
              hitSlop={9}
              onPress={() => onSelect(scene.key)}
              style={({ pressed }) => [styles.timelineStep, pressed && styles.timelineStepPressed]}
            >
              <View
                style={[
                  styles.timelineNode,
                  {
                    width: nodeSize,
                    height: nodeSize,
                    borderRadius: nodeSize / 2,
                    borderColor: scene.accent,
                    shadowColor: scene.accent,
                  },
                  selected && [styles.timelineNodeActive, { backgroundColor: scene.accent }],
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={[styles.timelineEmoji, compact && styles.timelineEmojiCompact]}
                >
                  {scene.icon}
                </Text>
              </View>
              <AppText variant={compact ? "caption" : "bodySecondary"} style={styles.timelineTitle}>
                {scene.title}
              </AppText>
              <AppText variant="caption" style={styles.timelineSubtitle}>
                {scene.timelineSubtitle}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<OnboardingStep>("scene");
  const [selectedScene, setSelectedScene] = useState<SceneKey>("cafe");
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
  const introTextWidth = isTablet
    ? 560
    : Math.min(360, Math.max(0, width - horizontalPadding * 2));

  const sceneLayout = useMemo(
    () => ({
      contentTop: Math.round(lerp(2, 10, verticalProgress)),
      contentBottom: Math.round(lerp(3, 12, verticalProgress)),
      headerHeight: Math.round(lerp(32, 38, verticalProgress)),
      headerBottom: Math.round(lerp(5, 13, verticalProgress)),
      eyebrowBottom: Math.round(lerp(4, 9, verticalProgress)),
      subtitleTop: Math.round(lerp(5, 10, verticalProgress)),
      introBottom: Math.round(lerp(6, 18, verticalProgress)),
      heroHeight: isTablet ? 382 : Math.round(lerp(198, 344, verticalProgress)),
      heroPaddingX: Math.round(lerp(14, 21, verticalProgress)),
      heroPaddingY: Math.round(lerp(10, 17, verticalProgress)),
      timelineTop: Math.round(lerp(9, 28, verticalProgress)),
      timelineLabelBottom: Math.round(lerp(6, 12, verticalProgress)),
      nodeSize: isTablet ? 45 : Math.round(lerp(36, 43, verticalProgress)),
      timelineBottom: Math.round(lerp(9, 31, verticalProgress)),
      primaryHeight: Math.round(lerp(48, 60, verticalProgress)),
      secondaryHeight: Math.round(lerp(34, 44, verticalProgress)),
      hubTop: Math.round(lerp(2, 8, verticalProgress)),
    }),
    [isTablet, verticalProgress],
  );

  const selectedSceneData = useMemo(
    () => SCENES.find((scene) => scene.key === selectedScene) ?? SCENES[0],
    [selectedScene],
  );

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
          outputRange: [7, 0],
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

  const selectScene = async (scene: SceneKey) => {
    if (scene === selectedScene) return;
    await lightTap();
    setSelectedScene(scene);
  };

  const openMode = async () => {
    await lightTap();
    setStep("mode");
  };

  const finish = async () => {
    await lightTap();
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    const route = ROUTES[selectedScene][selectedMode];
    const target =
      selectedMode === "text"
        ? route
        : { pathname: route, params: { mode: selectedMode } };
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
                {selectedSceneData.title}
              </AppText>
              <AppText variant="body" style={styles.modeSubtitle}>
                Choisis ton approche.
              </AppText>

              <View style={styles.modeHero}>
                <Image
                  source={selectedSceneData.image}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(2,3,7,0.94)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.modeHeroCopy}>
                  <AppText variant="sectionLabel" style={{ color: selectedSceneData.accent }}>
                    {selectedSceneData.eyebrow}
                  </AppText>
                  <AppText variant="cardTitle" style={styles.modeHeroTitle}>
                    {selectedSceneData.title}
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
              <View
                style={[
                  styles.header,
                  {
                    height: sceneLayout.headerHeight,
                    marginBottom: sceneLayout.headerBottom,
                  },
                ]}
              >
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
                    <ArrowLeft size={compact ? 16 : 17} color="#9FA1B7" strokeWidth={2} />
                  </Pressable>
                </View>

                <View
                  style={[styles.progressSegments, { gap: compact ? 6 : 8 }]}
                  accessibilityLabel="Étape 1 sur 3"
                >
                  <View
                    style={[
                      styles.progressSegment,
                      { width: compact ? 27 : 31 },
                      styles.progressSegmentActive,
                    ]}
                  />
                  <View style={[styles.progressSegment, { width: compact ? 27 : 31 }]} />
                  <View style={[styles.progressSegment, { width: compact ? 27 : 31 }]} />
                </View>

                <View style={[styles.headerSide, styles.headerSideRight]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Passer l'onboarding"
                    onPress={openHub}
                    hitSlop={10}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <AppText variant="bodySecondary" style={styles.skipText}>
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
                  style={[
                    styles.introSubtitle,
                    { marginTop: sceneLayout.subtitleTop, maxWidth: introTextWidth },
                  ]}
                >
                  Chaque scène est une situation réelle. On ne te note pas — on t'y met.
                </AppText>
              </View>

              <FeaturedSceneCard
                scene={selectedSceneData}
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
                <JourneyTimeline
                  selectedScene={selectedScene}
                  nodeSize={sceneLayout.nodeSize}
                  compact={compact}
                  onSelect={(scene) => void selectScene(scene)}
                />
              </View>

              <View style={{ marginTop: sceneLayout.timelineBottom }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Commencer par ${selectedSceneData.title}`}
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
                  <AppText variant={compact ? "button" : "bodyStrong"} style={styles.primaryButtonText}>
                    {`Commencer par ${selectedSceneData.title} →`}
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Explorer le Hub librement"
                  onPress={openHub}
                  style={({ pressed }) => [
                    styles.hubLink,
                    {
                      minHeight: sceneLayout.secondaryHeight,
                      marginTop: sceneLayout.hubTop,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText variant={compact ? "caption" : "bodySecondary"} style={styles.hubLinkText}>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.026)",
  },
  backButtonCompact: { width: 34, height: 34, borderRadius: 17 },
  progressSegments: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSegment: {
    height: 4,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  progressSegmentActive: {
    backgroundColor: PINK,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 2,
  },
  skipText: { color: "#AAAABC" },
  intro: { maxWidth: 520 },
  introEyebrow: { color: CYAN },
  introTitle: { color: "#F8F5F7" },
  introTitleAccent: { color: PINK },
  introSubtitle: { color: "#A8A7BA" },
  featuredCard: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(116,72,110,0.34)",
    backgroundColor: "#0B0D18",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  cardBorderAccent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    height: 1,
    opacity: 0.85,
  },
  cardGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 7,
    opacity: 0.78,
  },
  cardGridLine: {
    width: 1,
    height: "126%",
    marginTop: -20,
    backgroundColor: CARD_LINE,
    transform: [{ rotate: "7deg" }],
  },
  featuredTopRow: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  recommendedPill: {
    minHeight: 27,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(12,12,24,0.20)",
  },
  recommendedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  recommendedText: { color: "#DDD5DD" },
  featuredLocation: { color: "#BEB2BD", textAlign: "right" },
  featuredCopy: {
    position: "absolute",
    maxWidth: 560,
  },
  featuredPhrase: {
    color: "#F2EFED",
    fontFamily: AppFontFamily.korean.regular,
    fontSize: 23,
    lineHeight: 31,
    letterSpacing: 0,
    includeFontPadding: false,
    textShadowColor: "rgba(0,0,0,0.46)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredPhraseCompact: {
    fontSize: 19,
    lineHeight: 26,
  },
  featuredTranslation: {
    color: "#A5A3B4",
    marginTop: 2,
    fontStyle: "italic",
  },
  featuredTitle: {
    color: WHITE,
    marginTop: 9,
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  featuredSubtitle: {
    color: "#AAA9BA",
    marginTop: 8,
    maxWidth: 470,
  },
  journeyLabel: { color: "#696C84" },
  timelineWrap: { width: "100%", position: "relative" },
  timelineRail: {
    position: "absolute",
    height: 2,
    borderRadius: 99,
    backgroundColor: "#50546A",
    overflow: "hidden",
  },
  timelineRailActive: {
    height: "100%",
    backgroundColor: PINK,
  },
  timelineRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineStep: { flex: 1, alignItems: "center", minWidth: 0 },
  timelineStepPressed: { opacity: 0.76 },
  timelineNode: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#101321",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 1,
  },
  timelineNodeActive: {
    borderWidth: 0,
    shadowOpacity: 0.28,
    shadowRadius: 7,
    elevation: 3,
  },
  timelineEmoji: {
    fontSize: 15,
    lineHeight: 19,
    textAlign: "center",
    color: WHITE,
  },
  timelineEmojiCompact: { fontSize: 13, lineHeight: 17 },
  timelineTitle: {
    color: "#EDEAF0",
    marginTop: 5,
    textAlign: "center",
  },
  timelineSubtitle: {
    color: "#5E6077",
    marginTop: 0,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    borderRadius: 23,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryHighlight: {
    position: "absolute",
    top: 0,
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.23)",
  },
  primaryButtonText: { color: WHITE, textAlign: "center" },
  hubLink: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  hubLinkText: { color: "#8F8D9F", textAlign: "center" },
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
