import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/app-text";

const HERO_IMAGE = require("../assets/images/hero.png");
const CAFE_IMAGE = require("../assets/images/cafe.png");
const METRO_IMAGE = require("../assets/images/metro.png");
const RESTAURANT_IMAGE = require("../assets/images/restaurant.png");

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.98)";
const TXT_SOFT = "rgba(255,255,255,0.76)";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const GOLD = "#F59E0B";

const STEP_DURATION = 760;
type Step = "arrival" | "scene" | "mode" | "transition";
type SceneKey = "cafe" | "metro" | "restaurant";
type ModeKey = "text" | "guided" | "real";

type SceneOption = {
  key: SceneKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string;
  image: any;
};

type ModeOption = {
  key: ModeKey;
  title: string;
  subtitle: string;
  accent: string;
  highlighted?: boolean;
};

const SCENES: SceneOption[] = [
  {
    key: "cafe",
    eyebrow: "HONGDAE",
    title: "Le Café",
    subtitle: "Commander comme un local",
    accent: PINK,
    image: CAFE_IMAGE,
  },
  {
    key: "metro",
    eyebrow: "LIGNE 2",
    title: "Le Métro",
    subtitle: "Te déplacer dans Séoul",
    accent: CYAN,
    image: METRO_IMAGE,
  },
  {
    key: "restaurant",
    eyebrow: "ITAEWON",
    title: "Le Restaurant",
    subtitle: "Dîner et échanger",
    accent: GOLD,
    image: RESTAURANT_IMAGE,
  },
];

const MODES: ModeOption[] = [
  {
    key: "text",
    title: "Texte",
    subtitle: "Lire et comprendre",
    accent: "rgba(255,255,255,0.85)",
  },
  {
    key: "guided",
    title: "Guidé",
    subtitle: "Avancer avec aide",
    accent: CYAN,
  },
  {
    key: "real",
    title: "Réel",
    subtitle: "Répondre naturellement",
    accent: PINK,
    highlighted: true,
  },
];

const ROUTES: Record<SceneKey, Record<ModeKey, string>> = {
  cafe: {
    text: "/lesson/cafe",
    guided: "/lesson/cafeIA",
    real: "/lesson/cafeIA",
  },
  metro: {
    text: "/lesson/metro",
    guided: "/lesson/metroIA",
    real: "/lesson/metroIA",
  },
  restaurant: {
    text: "/lesson/restaurant",
    guided: "/lesson/restaurantIA",
    real: "/lesson/restaurantIA",
  },
};

function BackgroundLayer({
  source,
  blur = 20,
  imageBlurRadius = 0,
  darkOverlayOpacity = 0,
}: {
  source: any;
  blur?: number;
  imageBlurRadius?: number;
  darkOverlayOpacity?: number;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={imageBlurRadius}
      />

      {darkOverlayOpacity > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0,0,0,${darkOverlayOpacity})` },
          ]}
        />
      )}

      <LinearGradient
        colors={["rgba(5,5,8,0.25)", "rgba(5,5,8,0.65)", "#050508"]}
        locations={[0, 0.45, 0.95]}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          "rgba(244,114,182,0.12)",
          "rgba(34,211,238,0.08)",
          "transparent",
        ]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />

      <BlurView intensity={blur} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

export default function OnboardingScreen() {
  const { fontScale, height, width } = useWindowDimensions();
  const [step, setStep] = useState<Step>("arrival");
  const [selectedScene, setSelectedScene] = useState<SceneKey>("cafe");
  const [selectedMode, setSelectedMode] = useState<ModeKey>("guided");
  const isCompactScreen = height <= 700 || width <= 380;
  const isLargeText = fontScale > 1.15;

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const selectedSceneData = useMemo(
    () => SCENES.find((scene) => scene.key === selectedScene) ?? SCENES[0],
    [selectedScene],
  );

  const selectedModeData = useMemo(
    () => MODES.find((mode) => mode.key === selectedMode) ?? MODES[1],
    [selectedMode],
  );

  const backgroundSource = useMemo(() => {
    if (step === "arrival") return HERO_IMAGE;
    return selectedSceneData.image;
  }, [step, selectedSceneData.image]);

  const backgroundImageBlurRadius =
    step !== "arrival" && selectedScene === "cafe" ? 2 : 0;
  const backgroundDarkOverlayOpacity =
    step !== "arrival" && selectedScene === "cafe" ? 0.34 : 0;

  useEffect(() => {
    animateIn();
  }, [step]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const animateIn = () => {
    fade.setValue(0);
    translateY.setValue(20);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: STEP_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: STEP_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOutAnd = (next: () => void) => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 8,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(next);
  };

  const tap = async () => {
    try {
      if (Haptics?.impactAsync) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
  };

  const goToStep = async (nextStep: Step) => {
    await tap();
    animateOutAnd(() => setStep(nextStep));
  };

  const getSceneRoute = (scene: SceneKey, mode: ModeKey) => {
    return ROUTES[scene]?.[mode] ?? "/(tabs)";
  };

  const finishOnboarding = async () => {
    await tap();
    const targetRoute = getSceneRoute(selectedScene, selectedMode);
    const target =
      selectedMode === "text"
        ? targetRoute
        : {
            pathname: targetRoute,
            params: { mode: selectedMode },
          };
    animateOutAnd(() => setStep("transition"));

    setTimeout(() => {
      router.replace(target as any);
    }, 1400);
  };

  const openMoreScenes = async () => {
    await tap();
    router.push("/(tabs)" as any);
  };

  const openBasics = async () => {
    await tap();
    router.replace("/(tabs)" as any);
  };

  const animatedStyle = {
    opacity: fade,
    transform: [{ translateY }],
  };

  const cardFloat = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent />

      <BackgroundLayer
        source={backgroundSource}
        blur={step === "transition" ? 32 : step === "arrival" ? 18 : 24}
        imageBlurRadius={backgroundImageBlurRadius}
        darkOverlayOpacity={backgroundDarkOverlayOpacity}
      />

      <SafeAreaView
        style={[styles.safe, isCompactScreen && styles.safeCompact]}
        edges={["top", "bottom"]}
      >
        {step === "arrival" && (
          <Animated.View style={[styles.page, animatedStyle]}>
            <ScrollView
              style={styles.stepScroll}
              contentContainerStyle={[
                styles.arrivalScrollContent,
                (isCompactScreen || isLargeText) &&
                  styles.stepScrollContentCompact,
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.topRow}>
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <AppText variant="label" lineContract="singleLine" style={styles.badgeText}>SÉOUL IMMERSION</AppText>
                </View>
              </View>

              <View style={styles.arrivalCenter}>
                <AppText variant="koreanPrimary" script="korean" style={styles.koreanLine}>어서 오세요</AppText>
                <AppText accessibilityRole="header" variant="display" style={styles.bigTitle}>Bienvenue à Séoul</AppText>
                <AppText variant="subtitle" style={styles.subtitle}>
                  Tu n’apprends pas le coréen. Tu entres dans des scènes réelles.
                </AppText>

                <Animated.View
                  style={[
                    styles.heroCardWrap,
                    { transform: [{ translateY: cardFloat }] },
                  ]}
                >
                  <BlurView intensity={35} tint="dark" style={styles.heroCard}>
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.08)",
                        "rgba(255,255,255,0.03)",
                        "rgba(255,255,255,0.01)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />

                    <LinearGradient
                      colors={[
                        "rgba(244,114,182,0.08)",
                        "rgba(34,211,238,0.04)",
                        "transparent",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />

                    <AppText variant="sectionLabel" style={styles.heroEyebrow}>IMMERSION LIVE</AppText>
                    <AppText variant="sceneTitle" style={styles.heroTitle}>
                      La ville s’ouvre devant toi
                    </AppText>
                    <AppText variant="body" style={styles.heroText}>
                      Choisis une scène recommandée pour commencer, ou prépare-toi
                      d’abord avec les bases essentielles.
                    </AppText>
                  </BlurView>
                </Animated.View>
              </View>

              <View style={styles.bottomCtaArea}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Commencer l'experience"
                  accessibilityHint="Ouvre le choix de la scene de depart"
                  hitSlop={6}
                  style={styles.primaryWrap}
                  onPress={() => goToStep("scene")}
                >
                  <BlurView
                    intensity={20}
                    tint="dark"
                    style={styles.primaryButton}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(244,114,182,0.45)",
                        "rgba(34,211,238,0.30)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <AppText variant="button" style={styles.primaryText}>
                      Commencer l’expérience
                    </AppText>
                  </BlurView>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {step === "scene" && (
          <Animated.View style={[styles.page, animatedStyle]}>
            <ScrollView
              style={styles.stepScroll}
              contentContainerStyle={[
                styles.stepScrollContent,
                isCompactScreen && styles.stepScrollContentCompact,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <View style={[styles.badgeDot, { backgroundColor: PINK }]} />
                <AppText variant="label" lineContract="singleLine" style={styles.badgeText}>POINT DE DÉPART</AppText>
              </View>
            </View>

            <View
              style={[
                styles.sectionHead,
                isCompactScreen && styles.sectionHeadCompact,
              ]}
            >
              <AppText variant="sectionLabel" style={styles.sectionEyebrow}>START HERE</AppText>
              <AppText accessibilityRole="header" variant="screenTitle"
                style={[
                  styles.sectionTitle,
                  styles.sectionTitleScene,
                  isCompactScreen && styles.sectionTitleCompact,
                ]}
              >
                Où veux-tu commencer ?
              </AppText>
            </View>

            <View
              style={[
                styles.pathGrid,
                isCompactScreen && styles.pathGridCompact,
              ]}
            >
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Choisir ton parcours. Hangul, vocabulaire et autres bases"
                accessibilityHint="Ouvre l'accueil des parcours"
                hitSlop={6}
                style={styles.pathPress}
                onPress={openBasics}
              >
                <BlurView
                  intensity={25}
                  tint="dark"
                  style={[
                    styles.pathCard,
                    isCompactScreen && styles.pathCardCompact,
                  ]}
                >
                  <LinearGradient
                    colors={["rgba(34,211,238,0.12)", "rgba(255,255,255,0.02)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View
                    style={[
                      styles.pathTopRow,
                      isCompactScreen && styles.pathTopRowCompact,
                    ]}
                  >
                    <View
                      style={[styles.pathIcon, { borderColor: `${CYAN}33` }]}
                    >
                      <AppText variant="sectionTitle" style={styles.pathIconText}>⌂</AppText>
                    </View>
                    <AppText variant="sectionLabel" style={[styles.pathStep, { color: CYAN }]}>
                      ACCUEIL
                    </AppText>
                  </View>

                  <AppText variant="sectionTitle"
                    style={[
                      styles.pathTitle,
                      isCompactScreen && styles.pathTitleCompact,
                    ]}
                  >
                    Choisis ton parcours
                  </AppText>
                  <AppText variant="bodySecondary" tone="muted"
                    style={[
                      styles.pathText,
                      isCompactScreen && styles.pathTextCompact,
                    ]}
                  >
                    Hangul , vocabulaires et autres
                  </AppText>

                  <View
                    style={[
                      styles.pathBottomRow,
                      isCompactScreen && styles.pathBottomRowCompact,
                    ]}
                  >
                    <AppText variant="label" style={styles.pathAction}>Entrer</AppText>
                    <AppText variant="sectionTitle" lineContract="singleLine" style={[styles.pathArrow, { color: CYAN }]}>→</AppText>
                  </View>
                </BlurView>
              </Pressable>

              <View
                accessibilityRole="summary"
                accessibilityLabel="Immersion directe. Choisis une scene cafe, metro ou restaurant"
                style={styles.pathPress}
              >
                <BlurView
                  intensity={25}
                  tint="dark"
                  style={[
                    styles.pathCard,
                    isCompactScreen && styles.pathCardCompact,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(244,114,182,0.12)",
                      "rgba(255,255,255,0.02)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View
                    style={[
                      styles.pathTopRow,
                      isCompactScreen && styles.pathTopRowCompact,
                    ]}
                  >
                    <View
                      style={[styles.pathIcon, { borderColor: `${PINK}33` }]}
                    >
                      <AppText variant="sectionTitle" style={styles.pathIconText}>●</AppText>
                    </View>
                    <AppText variant="sectionLabel" style={[styles.pathStep, { color: PINK }]}>
                      IMMERSION
                    </AppText>
                  </View>

                  <AppText variant="sectionTitle"
                    style={[
                      styles.pathTitle,
                      isCompactScreen && styles.pathTitleCompact,
                    ]}
                  >
                    Choisis ta scène
                  </AppText>
                  <AppText variant="bodySecondary" tone="muted"
                    style={[
                      styles.pathText,
                      isCompactScreen && styles.pathTextCompact,
                    ]}
                  >
                    Café · métro · restaurant
                  </AppText>

                  <View
                    style={[
                      styles.pathBottomRow,
                      isCompactScreen && styles.pathBottomRowCompact,
                    ]}
                  >
                    <AppText variant="label" style={styles.pathAction}>Choisir</AppText>
                    <AppText variant="sectionTitle" lineContract="singleLine" style={[styles.pathArrow, { color: PINK }]}>↓</AppText>
                  </View>
                </BlurView>
              </View>
            </View>

            <View
              style={[
                styles.subSectionHead,
                isCompactScreen && styles.subSectionHeadCompact,
              ]}
            >
              <AppText variant="sectionLabel" style={styles.subSectionEyebrow}>IMMERSION DIRECTE</AppText>
              <AppText variant="sectionTitle" style={styles.subSectionTitle}>Choisis une scène</AppText>
            </View>

            <View
              style={[
                styles.sceneList,
                isCompactScreen && styles.sceneListCompact,
              ]}
            >
              {SCENES.map((scene) => {
                const active = selectedScene === scene.key;
                const sceneImageBlurRadius = scene.key === "cafe" ? 2 : 0;

                return (
                  <Pressable
                    key={scene.key}
                    accessibilityRole="radio"
                    accessibilityLabel={`${scene.title}. ${scene.subtitle}`}
                    accessibilityState={{ checked: active, selected: active }}
                    aria-checked={active}
                    aria-selected={active}
                    hitSlop={6}
                    style={styles.scenePress}
                    onPress={async () => {
                      await tap();
                      setSelectedScene(scene.key);
                    }}
                  >
                    <View
                      style={[
                        styles.sceneCardOuter,
                        active && { transform: [{ scale: 1.012 }] },
                      ]}
                    >
                      <BlurView
                        intensity={30}
                        tint="dark"
                        style={[
                          styles.sceneCard,
                          isCompactScreen && styles.sceneCardCompact,
                          active && { borderColor: "rgba(255,255,255,0.28)" },
                        ]}
                      >
                        <Image
                          source={scene.image}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                          blurRadius={sceneImageBlurRadius}
                        />

                        <LinearGradient
                          colors={[
                            "rgba(0,0,0,0.15)",
                            "rgba(5,5,8,0.50)",
                            "rgba(5,5,8,0.92)",
                          ]}
                          locations={[0, 0.4, 0.95]}
                          style={StyleSheet.absoluteFill}
                        />

                        <LinearGradient
                          colors={[
                            active
                              ? `${scene.accent}25`
                              : "rgba(255,255,255,0.04)",
                            "transparent",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0.6, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />

                        <View
                          style={[
                            styles.sceneAccent,
                            {
                              backgroundColor: scene.accent,
                              opacity: active ? 1 : 0.4,
                            },
                          ]}
                        />

                        <View style={styles.sceneContent}>
                          <View style={{ flex: 1 }}>
                            <View style={styles.sceneTopLine}>
                              <AppText variant="sectionLabel"
                                style={[
                                  styles.sceneEyebrow,
                                  active && { color: scene.accent },
                                ]}
                              >
                                {scene.eyebrow}
                              </AppText>

                              {active && (
                                <View
                                  style={[
                                    styles.selectedPill,
                                    { borderColor: `${scene.accent}44` },
                                  ]}
                                >
                                  <AppText variant="label" style={styles.selectedPillText}>
                                    SÉLECTIONNÉ
                                  </AppText>
                                </View>
                              )}
                            </View>

                            <AppText variant="cardTitle" style={styles.sceneTitleText}>
                              {scene.title}
                            </AppText>
                            <AppText variant="bodySecondary" tone="muted" style={styles.sceneSubtitle}>
                              {scene.subtitle}
                            </AppText>
                          </View>

                          <View
                            style={[
                              styles.radioWrap,
                              active && {
                                borderColor: scene.accent,
                                backgroundColor: "rgba(255,255,255,0.04)",
                              },
                            ]}
                          >
                            {active && (
                              <View
                                style={[
                                  styles.radioDot,
                                  { backgroundColor: scene.accent },
                                ]}
                              />
                            )}
                          </View>
                        </View>
                      </BlurView>
                    </View>
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Voir plus de scenes"
                hitSlop={8}
                style={styles.discreetAction}
                onPress={openMoreScenes}
              >
                <AppText variant="link" style={styles.discreetActionText}>
                  Voir plus de scènes
                </AppText>
              </Pressable>
            </View>
            </ScrollView>

            <View style={[styles.bottomBar, styles.bottomBarContained]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour a l'ecran de bienvenue"
                hitSlop={6}
                style={styles.secondaryButton}
                onPress={() => goToStep("arrival")}
              >
                <AppText variant="button" style={styles.secondaryText}>Retour</AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Choisir ${selectedSceneData.title.toLowerCase()}`}
                hitSlop={6}
                style={styles.primaryInlineWrap}
                onPress={() => goToStep("mode")}
              >
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={styles.primaryInlineButton}
                >
                  <LinearGradient
                    colors={[
                      `${selectedSceneData.accent}45`,
                      "rgba(255,255,255,0.04)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <AppText variant="button" style={styles.primaryText}>
                    Choisir {selectedSceneData.title.toLowerCase()}
                  </AppText>
                </BlurView>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === "mode" && (
          <Animated.View style={[styles.page, animatedStyle]}>
            <ScrollView
              style={styles.stepScroll}
              contentContainerStyle={[
                styles.modeScrollContent,
                (isCompactScreen || isLargeText) &&
                  styles.stepScrollContentCompact,
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.topRow}>
                <View style={styles.badge}>
                  <View style={[styles.badgeDot, { backgroundColor: CYAN }]} />
                  <AppText variant="label" lineContract="singleLine" style={styles.badgeText}>MODE D’IMMERSION</AppText>
                </View>
              </View>

              <View
                style={[
                  styles.sectionHead,
                  (isCompactScreen || isLargeText) && styles.sectionHeadCompact,
                ]}
              >
                <AppText variant="sectionLabel" style={styles.sectionEyebrow}>SCÈNE CHOISIE</AppText>
                <AppText accessibilityRole="header" variant="screenTitle" style={styles.sectionTitle}>{selectedSceneData.title}</AppText>
                <AppText variant="body" style={styles.sectionText}>Choisis ton niveau d’aide.</AppText>
              </View>

              <View style={styles.modeList}>
                {MODES.map((mode) => {
                  const active = selectedMode === mode.key;

                  return (
                    <Pressable
                      key={mode.key}
                      accessibilityRole="radio"
                      accessibilityLabel={`${mode.title}. ${mode.subtitle}`}
                      accessibilityState={{ checked: active, selected: active }}
                      aria-checked={active}
                      aria-selected={active}
                      hitSlop={6}
                      style={styles.modePress}
                      onPress={async () => {
                        await tap();
                        setSelectedMode(mode.key);
                      }}
                    >
                      <BlurView
                        intensity={25}
                        tint="dark"
                        style={[
                          styles.modeCard,
                          active && { borderColor: "rgba(255,255,255,0.22)" },
                        ]}
                      >
                        <LinearGradient
                          colors={[
                            active
                              ? `${mode.accent}20`
                              : "rgba(255,255,255,0.03)",
                            "rgba(255,255,255,0.01)",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />

                        <View
                          style={[
                            styles.modeAccent,
                            {
                              backgroundColor: mode.accent,
                              opacity: active ? 1 : 0.35,
                            },
                          ]}
                        />

                        <View style={styles.modeContent}>
                          <View style={styles.modeCopy}>
                            <AppText variant="cardTitle"
                              style={[
                                styles.modeTitle,
                                active && { color: mode.accent },
                              ]}
                            >
                              {mode.title}
                            </AppText>
                            <AppText variant="bodySecondary" tone="muted" style={styles.modeSubtitle}>
                              {mode.subtitle}
                            </AppText>
                          </View>

                          {mode.highlighted && (
                            <View style={styles.signatureBadge}>
                              <AppText variant="caption" style={styles.signatureText}>SIGNATURE</AppText>
                            </View>
                          )}
                        </View>

                        {active && (
                          <View
                            style={[
                              styles.modeActiveRing,
                              { borderColor: `${mode.accent}66` },
                            ]}
                          />
                        )}
                      </BlurView>
                    </Pressable>
                  );
                })}
              </View>

              <BlurView intensity={20} tint="dark" style={styles.previewCard}>
                <LinearGradient
                  colors={[
                    `${selectedSceneData.accent}15`,
                    "rgba(255,255,255,0.02)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <AppText variant="sectionLabel" style={styles.previewEyebrow}>PRÊT À ENTRER</AppText>
                <AppText variant="sectionTitle" style={styles.previewTitle}>
                  {selectedSceneData.title} · {selectedModeData.title}
                </AppText>
              </BlurView>

              <View style={styles.bottomBar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retour au choix de scene"
                  hitSlop={6}
                  style={styles.secondaryButton}
                  onPress={() => goToStep("scene")}
                >
                  <AppText variant="button" style={styles.secondaryText}>Retour</AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Commencer la scene choisie"
                  hitSlop={6}
                  style={styles.primaryInlineWrap}
                  onPress={finishOnboarding}
                >
                  <BlurView
                    intensity={20}
                    tint="dark"
                    style={styles.primaryInlineButton}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(244,114,182,0.45)",
                        "rgba(34,211,238,0.30)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <AppText variant="button" style={styles.primaryText}>Commencer</AppText>
                  </BlurView>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {step === "transition" && (
          <Animated.View
            style={[styles.page, styles.transitionPage, animatedStyle]}
          >
            <View style={styles.transitionGlowWrap}>
              <LinearGradient
                colors={[
                  "rgba(244,114,182,0.22)",
                  "rgba(34,211,238,0.14)",
                  "transparent",
                ]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.transitionGlow}
              />
            </View>

            <AppText variant="sectionLabel" style={styles.transitionEyebrow}>SCÈNE EN COURS</AppText>
            <AppText accessibilityRole="header" variant="screenTitle" style={styles.transitionTitle}>Tu es prêt.</AppText>
            <AppText variant="body" style={styles.transitionText}>La conversation commence.</AppText>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  safeCompact: {
    paddingHorizontal: 16,
  },
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  topRow: {
    paddingTop: 16,
    alignItems: "flex-start",
  },
  badge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: CYAN,
  },
  badgeText: {
    color: TXT_SOFT,
    fontSize: 10.5,
    letterSpacing: 1.8,
  },
  arrivalCenter: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 24,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  koreanLine: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 22,
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 12,
  },
  bigTitle: {
    color: TXT,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -1,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 14,
    maxWidth: 290,
    alignSelf: "center",
  },
  heroCardWrap: {
    marginTop: 38,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  heroEyebrow: {
    color: TXT_SOFT,
    fontSize: 10.5,
    letterSpacing: 2.2,
    marginBottom: 10,
  },
  heroTitle: {
    color: TXT,
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  heroText: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  bottomCtaArea: {
    paddingBottom: 24,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  primaryWrap: {
    borderRadius: 999,
    overflow: "hidden",
  },
  primaryButton: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderTopWidth: 1.2,
    borderColor: "rgba(255,255,255,0.18)",
    borderTopColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: 0.6,
    textAlign: "center",
  },
  sectionHead: {
    marginTop: 26,
    marginBottom: 20,
  },
  sectionHeadCompact: {
    marginTop: 18,
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: TXT_SOFT,
    fontSize: 10.5,
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionTitle: {
    color: TXT,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  sectionTitleScene: {
    maxWidth: 320,
  },
  sectionTitleCompact: {
    fontSize: 25,
    lineHeight: 31,
    maxWidth: 300,
  },
  sectionText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  pathGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  pathGridCompact: {
    gap: 8,
    marginBottom: 16,
  },
  pathPress: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  pathCard: {
    minHeight: 168,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 18,
  },
  pathCardCompact: {
    minHeight: 108,
    borderRadius: 20,
    padding: 12,
  },
  pathTopRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 20,
  },
  pathTopRowCompact: {
    marginBottom: 8,
  },
  pathIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  pathIconText: {
    color: TXT,
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
  pathStep: {
    fontSize: 9.5,
    letterSpacing: 1.5,
    marginLeft: 10,
  },
  pathTitle: {
    color: TXT,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  pathTitleCompact: {
    fontSize: 15,
    lineHeight: 19,
  },
  pathText: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  pathTextCompact: {
    display: "none",
  },
  pathBottomRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  pathBottomRowCompact: {
    paddingTop: 6,
  },
  pathAction: {
    color: TXT_SOFT,
    fontSize: 12.5,
    letterSpacing: 0.4,
  },
  pathArrow: {
    fontSize: 15,
    lineHeight: 18,
  },
  subSectionHead: {
    marginBottom: 14,
  },
  subSectionHeadCompact: {
    marginBottom: 10,
  },
  subSectionEyebrow: {
    color: TXT_SOFT,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subSectionTitle: {
    color: TXT,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
    marginHorizontal: -4,
  },
  stepScroll: {
    flex: 1,
  },
  stepScrollContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingBottom: 14,
  },
  arrivalScrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingBottom: 14,
  },
  modeScrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingBottom: 14,
  },
  stepScrollContentCompact: {
    paddingBottom: 10,
  },
  sceneList: {
    paddingHorizontal: 4,
    gap: 12,
    paddingBottom: 24,
  },
  sceneListCompact: {
    gap: 8,
    paddingBottom: 84,
  },
  scenePress: {
    borderRadius: 24,
    overflow: "hidden",
  },
  sceneCardOuter: {
    borderRadius: 24,
    overflow: "hidden",
  },
  sceneCard: {
    minHeight: 104,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
  },
  sceneCardCompact: {
    minHeight: 80,
    borderRadius: 20,
  },
  sceneAccent: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  sceneContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 18,
    paddingVertical: 12,
  },
  sceneTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sceneEyebrow: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 9.5,
    letterSpacing: 1.6,
  },
  selectedPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  selectedPillText: {
    color: TXT,
    fontSize: 8,
    letterSpacing: 1,
  },
  sceneTitleText: {
    color: TXT,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  sceneSubtitle: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    marginTop: 2,
  },
  radioWrap: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  discreetAction: {
    alignSelf: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  discreetActionText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  modeList: {
    gap: 12,
    marginBottom: 20,
  },
  modePress: {
    borderRadius: 20,
    overflow: "hidden",
  },
  modeCard: {
    minHeight: 76,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
  },
  modeAccent: {
    width: 3,
    height: 28,
    borderRadius: 999,
    position: "absolute",
    left: 0,
  },
  modeContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 16,
    paddingVertical: 12,
    gap: 12,
  },
  modeCopy: {
    flex: 1,
    minWidth: 0,
  },
  modeTitle: {
    color: TXT,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  modeSubtitle: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 13,
    marginTop: 2,
  },
  signatureBadge: {
    borderRadius: 6,
    backgroundColor: "rgba(254,190,224,0.15)",
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  signatureText: {
    color: PINK,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  modeActiveRing: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 20,
    borderWidth: 1.5,
    pointerEvents: "none",
  },
  previewCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    marginBottom: "auto",
  },
  previewEyebrow: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 9.5,
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  previewTitle: {
    color: TXT,
    fontSize: 15,
  },
  bottomBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    paddingBottom: 20,
    paddingTop: 12,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  bottomBarContained: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  secondaryButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  primaryInlineWrap: {
    flex: 1,
    minWidth: 160,
    borderRadius: 999,
    overflow: "hidden",
  },
  primaryInlineButton: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderTopWidth: 1.2,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  transitionPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  transitionGlowWrap: {
    position: "absolute",
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  transitionGlow: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  transitionEyebrow: {
    color: PINK,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 12,
  },
  transitionTitle: {
    color: TXT,
    fontSize: 32,
    letterSpacing: -0.8,
  },
  transitionText: {
    color: TXT_SOFT,
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
});
