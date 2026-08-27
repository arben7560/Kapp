import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Coffee,
  Compass,
  MoveRight,
  Plane,
  TrainFront,
  Utensils,
} from "lucide-react-native";
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
import Svg, {
  Defs,
  Stop,
  RadialGradient as SvgRadialGradient,
  Rect as SvgRect,
} from "react-native-svg";

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
  meta: string;
  accent: string;
  glowLeft: string;
  glowRight: string;
  image: number;
  badge: string;
  timelineSubtitle: string;
};

const SCENES: SceneOption[] = [
  {
    key: "cafe",
    eyebrow: "HONGDAE",
    title: "Café",
    subtitle:
      "Commande comme si tu y étais, dans le bruit du comptoir et la pluie dehors.",
    phrase: "아메리카노 한 잔 주세요",
    translation: '"Un americano, s\'il vous plaît"',
    meta: "Aucun prérequis · ~4 min",
    accent: PINK,
    glowLeft: "#1AB5C3",
    glowRight: "#E72C7D",
    image: CAFE_IMAGE,
    badge: "Idéal pour débuter",
    timelineSubtitle: "Pour commencer",
  },
  {
    key: "metro",
    eyebrow: "LIGNE 2",
    title: "Métro",
    subtitle:
      "Trouve ton chemin dans Séoul et demande ta direction naturellement.",
    phrase: "2호선은 어디예요?",
    translation: '"Où est la ligne 2 ?"',
    meta: "Débutant · ~5 min",
    accent: METRO_GREEN,
    glowLeft: "#1CB8B9",
    glowRight: "#2B8C73",
    image: METRO_IMAGE,
    badge: "Débutant +",
    timelineSubtitle: "Débutant +",
  },
  {
    key: "restaurant",
    eyebrow: "ITAEWON",
    title: "Restaurant",
    subtitle:
      "Commande naturellement à table, comme dans un vrai restaurant coréen.",
    phrase: "이거 주세요",
    translation: '"Celui-ci, s\'il vous plaît"',
    meta: "Débutant · ~5 min",
    accent: GOLD,
    glowLeft: "#7E5137",
    glowRight: "#D36B47",
    image: RESTAURANT_IMAGE,
    badge: "Débutant +",
    timelineSubtitle: "Débutant +",
  },
  {
    key: "airport",
    eyebrow: "INCHEON",
    title: "Aéroport",
    subtitle:
      "Repère-toi dès ton arrivée et trouve les transports pour rejoindre Séoul.",
    phrase: "지하철은 어디예요?",
    translation: '"Où est le métro ?"',
    meta: "Intermédiaire · ~6 min",
    accent: CYAN,
    glowLeft: "#1A8DAD",
    glowRight: "#615299",
    image: AIRPORT_IMAGE,
    badge: "Intermédiaire",
    timelineSubtitle: "Intermédiaire",
  },
];

const SELECTABLE_SCENE_KEYS: SceneKey[] = [
  "cafe",
  "metro",
  "restaurant",
  "airport",
];

const ROUTES: Record<SceneKey, Record<ModeKey, string>> = {
  cafe: { text: "/lesson/cafe", guided: "/lesson/cafeMissions" },
  metro: { text: "/lesson/metro", guided: "/lesson/metroMissions" },
  restaurant: {
    text: "/lesson/restaurant",
    guided: "/lesson/restaurantMissions",
  },
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

function CardAtmosphere({ scene }: { scene: SceneOption }) {
  const leftId = `left-halo-${scene.key}`;
  const rightId = `right-halo-${scene.key}`;
  const warmId = `warm-halo-${scene.key}`;

  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <Defs>
        <SvgRadialGradient id={leftId} cx="12%" cy="8%" r="74%">
          <Stop offset="0%" stopColor={scene.glowLeft} stopOpacity={0.42} />
          <Stop offset="38%" stopColor={scene.glowLeft} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={scene.glowLeft} stopOpacity={0} />
        </SvgRadialGradient>
        <SvgRadialGradient id={rightId} cx="88%" cy="8%" r="72%">
          <Stop offset="0%" stopColor={scene.glowRight} stopOpacity={0.48} />
          <Stop offset="40%" stopColor={scene.glowRight} stopOpacity={0.2} />
          <Stop offset="100%" stopColor={scene.glowRight} stopOpacity={0} />
        </SvgRadialGradient>
        <SvgRadialGradient id={warmId} cx="56%" cy="66%" r="46%">
          <Stop offset="0%" stopColor="#C67B4A" stopOpacity={0.16} />
          <Stop offset="58%" stopColor="#9B5236" stopOpacity={0.07} />
          <Stop offset="100%" stopColor="#9B5236" stopOpacity={0} />
        </SvgRadialGradient>
      </Defs>

      <SvgRect x="0" y="0" width="100" height="100" fill={`url(#${leftId})`} />
      <SvgRect x="0" y="0" width="100" height="100" fill={`url(#${rightId})`} />
      <SvgRect x="0" y="0" width="100" height="100" fill={`url(#${warmId})`} />

      <SvgRect x="0" y="84" width="9" height="16" fill="#050713" opacity={0.88} />
      <SvgRect x="9" y="78" width="10" height="22" fill="#060814" opacity={0.84} />
      <SvgRect x="19" y="87" width="7" height="13" fill="#050713" opacity={0.9} />
      <SvgRect x="26" y="74" width="12" height="26" fill="#060814" opacity={0.88} />
      <SvgRect x="38" y="82" width="8" height="18" fill="#050713" opacity={0.92} />
      <SvgRect x="46" y="70" width="11" height="30" fill="#060814" opacity={0.9} />
      <SvgRect x="57" y="80" width="10" height="20" fill="#050713" opacity={0.92} />
      <SvgRect x="67" y="76" width="7" height="24" fill="#060814" opacity={0.9} />
      <SvgRect x="74" y="85" width="10" height="15" fill="#050713" opacity={0.92} />
      <SvgRect x="84" y="72" width="8" height="28" fill="#060814" opacity={0.9} />
      <SvgRect x="92" y="82" width="8" height="18" fill="#050713" opacity={0.92} />
    </Svg>
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
  const titleVariant = compact ? "featureTitle" : "screenTitle";
  const bodyVariant = compact ? "bodySecondary" : "body";

  return (
    <View
      accessible
      accessibilityLabel={`${scene.title}, ${scene.eyebrow}. ${scene.badge}. ${scene.phrase}. ${scene.translation}. ${scene.meta}.`}
      style={[styles.featuredCard, { height }]}
    >
      <LinearGradient
        colors={["#0A111B", "#12101A", "#070913"]}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CardAtmosphere scene={scene} />

      <LinearGradient
        colors={[
          "rgba(4,6,15,0.02)",
          "rgba(5,7,17,0.10)",
          "rgba(5,6,16,0.56)",
          "rgba(5,6,16,0.90)",
        ]}
        locations={[0, 0.38, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardRain}>
        {CARD_GRID_LINES.map((line) => (
          <View key={line} style={styles.cardRainLine} />
        ))}
      </View>

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
        <View
          style={[styles.recommendedPill, { borderColor: `${scene.accent}66` }]}
        >
          <View
            style={[styles.recommendedDot, { backgroundColor: scene.accent }]}
          />
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
            bottom: Math.max(14, verticalPadding),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <Text
          accessibilityLanguage="ko-KR"
          maxFontSizeMultiplier={1.2}
          style={[
            styles.featuredPhrase,
            compact && styles.featuredPhraseCompact,
          ]}
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
        <AppText variant="caption" style={styles.featuredMeta}>
          {scene.meta}
        </AppText>
      </View>
    </View>
  );
}

function SceneGlyph({
  sceneKey,
  size,
  color,
}: {
  sceneKey: SceneKey;
  size: number;
  color: string;
}) {
  if (sceneKey === "cafe") {
    return <Coffee size={size} color={color} strokeWidth={2} />;
  }
  if (sceneKey === "metro") {
    return <TrainFront size={size} color={color} strokeWidth={2} />;
  }
  if (sceneKey === "restaurant") {
    return <Utensils size={size} color={color} strokeWidth={2} />;
  }
  return <Plane size={size} color={color} strokeWidth={2} />;
}

function SceneSelector({
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
  const selectableScenes = SCENES.filter((scene) =>
    SELECTABLE_SCENE_KEYS.includes(scene.key),
  );

  return (
    <View style={styles.sceneSelectorWrap}>
      <View style={styles.sceneSelectorRow}>
        {selectableScenes.map((scene) => {
          const selected = scene.key === selectedScene;
          const iconSize = compact ? 15 : 17;

          return (
            <Pressable
              key={scene.key}
              accessibilityRole="button"
              accessibilityLabel={`Afficher la scène ${scene.title}`}
              accessibilityState={{ selected }}
              hitSlop={7}
              onPress={() => onSelect(scene.key)}
              style={({ pressed }) => [
                styles.sceneSelectorStep,
                pressed && styles.sceneSelectorStepPressed,
              ]}
            >
              <View
                style={[
                  styles.sceneSelectorNode,
                  {
                    width: nodeSize,
                    height: nodeSize,
                    borderRadius: nodeSize / 2,
                    borderColor: scene.accent,
                    backgroundColor: selected ? scene.accent : "#0D101C",
                    shadowColor: scene.accent,
                  },
                  selected
                    ? styles.sceneSelectorNodeSelected
                    : styles.sceneSelectorNodeIdle,
                ]}
              >
                <SceneGlyph
                  sceneKey={scene.key}
                  size={iconSize}
                  color={selected ? WHITE : scene.accent}
                />
              </View>
              <AppText
                variant={compact ? "caption" : "bodySecondary"}
                numberOfLines={1}
                style={[
                  styles.sceneSelectorTitle,
                  selected && styles.sceneSelectorTitleSelected,
                ]}
              >
                {scene.title}
              </AppText>
              <AppText
                variant="caption"
                numberOfLines={1}
                style={[
                  styles.sceneSelectorSubtitle,
                  scene.key === "cafe" && styles.sceneSelectorRecommended,
                ]}
              >
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
  const horizontalPadding = isTablet
    ? 30
    : width <= 370
      ? 16
      : width >= 425
        ? 24
        : 21;
  const introTextWidth = isTablet
    ? 560
    : Math.min(360, Math.max(0, width - horizontalPadding * 2));

  const sceneLayout = useMemo(
    () => ({
      contentTop: Math.round(lerp(2, 10, verticalProgress)),
      contentBottom: Math.round(lerp(12, 24, verticalProgress)),
      headerHeight: Math.round(lerp(32, 38, verticalProgress)),
      headerBottom: Math.round(lerp(5, 13, verticalProgress)),
      eyebrowBottom: Math.round(lerp(4, 9, verticalProgress)),
      subtitleTop: Math.round(lerp(5, 10, verticalProgress)),
      introBottom: Math.round(lerp(6, 18, verticalProgress)),
      heroHeight: isTablet ? 382 : Math.round(lerp(198, 344, verticalProgress)),
      heroPaddingX: Math.round(lerp(14, 21, verticalProgress)),
      heroPaddingY: Math.round(lerp(10, 17, verticalProgress)),
      selectorTop: Math.round(lerp(9, 28, verticalProgress)),
      selectorLabelBottom: Math.round(lerp(6, 12, verticalProgress)),
      nodeSize: isTablet ? 45 : Math.round(lerp(36, 43, verticalProgress)),
      selectorBottom: Math.round(lerp(11, 34, verticalProgress)),
      primaryHeight: Math.round(lerp(48, 60, verticalProgress)),
      secondaryHeight: Math.round(lerp(38, 46, verticalProgress)),
      hubTop: Math.round(lerp(7, 11, verticalProgress)),
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
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <SceneBackground dimmed />
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View
            style={[styles.modePage, { paddingHorizontal: horizontalPadding }]}
          >
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
                  <AppText
                    variant="sectionLabel"
                    style={{ color: selectedSceneData.accent }}
                  >
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
                    <AppText
                      variant="bodySecondary"
                      style={styles.modeChoiceText}
                    >
                      Écoute et réponds comme si tu étais sur place.
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selectedMode === "guided" && styles.radioActive,
                    ]}
                  />
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
                    <AppText
                      variant="bodySecondary"
                      style={styles.modeChoiceText}
                    >
                      Revois d’abord les mots et expressions de la situation.
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selectedMode === "text" && styles.radioActive,
                    ]}
                  />
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={finish}
                style={({ pressed }) => [
                  styles.modePrimary,
                  pressed && styles.pressed,
                ]}
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
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <OnboardingBackground />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View
          style={[styles.scenePage, { paddingHorizontal: horizontalPadding }]}
        >
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
                    <ArrowLeft
                      size={compact ? 16 : 17}
                      color="#9FA1B7"
                      strokeWidth={2}
                    />
                  </Pressable>
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

              <View
                style={[
                  styles.intro,
                  { marginBottom: sceneLayout.introBottom },
                ]}
              >
                <AppText
                  variant="sectionLabel"
                  style={[
                    styles.introEyebrow,
                    { marginBottom: sceneLayout.eyebrowBottom },
                  ]}
                >
                  SÉOUL · NUIT 01
                </AppText>
                <AppText
                  accessibilityRole="header"
                  variant={titleVariant}
                  style={styles.introTitle}
                >
                  Pose le pied{"\n"}à{" "}
                  <Text style={styles.introTitleAccent}>Séoul.</Text>
                </AppText>
                <AppText
                  variant={introVariant}
                  style={[
                    styles.introSubtitle,
                    {
                      marginTop: sceneLayout.subtitleTop,
                      maxWidth: introTextWidth,
                    },
                  ]}
                >
                  Chaque scène est une situation réelle. On ne te note pas — on
                  t'y met.
                </AppText>
              </View>

              <FeaturedSceneCard
                scene={selectedSceneData}
                height={sceneLayout.heroHeight}
                compact={compact}
                horizontalPadding={sceneLayout.heroPaddingX}
                verticalPadding={sceneLayout.heroPaddingY}
              />

              <View style={{ marginTop: sceneLayout.selectorTop }}>
                <AppText
                  variant="sectionLabel"
                  style={[
                    styles.selectorLabel,
                    { marginBottom: sceneLayout.selectorLabelBottom },
                  ]}
                >
                  CHOISIS TA PREMIÈRE IMMERSION
                </AppText>
                <SceneSelector
                  selectedScene={selectedScene}
                  nodeSize={sceneLayout.nodeSize}
                  compact={compact}
                  onSelect={(scene) => void selectScene(scene)}
                />
              </View>

              <View style={{ marginTop: sceneLayout.selectorBottom }}>
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
                  <AppText
                    variant={compact ? "button" : "bodyStrong"}
                    style={styles.primaryButtonText}
                  >
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
                  <Compass
                    size={compact ? 14 : 16}
                    color="#8F8D9F"
                    strokeWidth={1.8}
                  />
                  <AppText
                    variant={compact ? "caption" : "bodySecondary"}
                    style={styles.hubLinkText}
                  >
                    Explorer le Hub librement
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
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#0B0D18",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  cardRain: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 7,
    opacity: 0.58,
  },
  cardRainLine: {
    width: 1,
    height: "130%",
    marginTop: -24,
    backgroundColor: CARD_LINE,
    transform: [{ rotate: "9deg" }],
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
    fontFamily: AppFontFamily.outfit.medium,
    textShadowColor: "rgba(0,0,0,0.34)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredSubtitle: {
    color: "#AAA9BA",
    marginTop: 8,
    maxWidth: 470,
  },
  featuredMeta: {
    color: "#777A90",
    marginTop: 7,
    letterSpacing: 0.3,
  },
  selectorLabel: { color: "#696C84" },
  sceneSelectorWrap: { width: "100%" },
  sceneSelectorRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  sceneSelectorStep: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  sceneSelectorStepPressed: { opacity: 0.76 },
  sceneSelectorNode: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
  },
  sceneSelectorNodeIdle: {
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
  },
  sceneSelectorNodeSelected: {
    borderWidth: 0,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sceneSelectorTitle: {
    color: "#C9C7D0",
    marginTop: 5,
    textAlign: "center",
  },
  sceneSelectorTitleSelected: { color: WHITE },
  sceneSelectorSubtitle: {
    color: "#5E6077",
    marginTop: 0,
    textAlign: "center",
  },
  sceneSelectorRecommended: {
    color: "#C997AA",
    fontFamily: AppFontFamily.outfit.medium,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
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