import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Check, Compass, MoveRight } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";

const HERO_IMAGE = require("../assets/images/hero.jpg");
const CAFE_IMAGE = require("../assets/images/cafeIA.jpg");
const METRO_IMAGE = require("../assets/images/metroIA.jpg");
const RESTAURANT_IMAGE = require("../assets/images/restaurantIA.jpg");

const TXT = "rgba(255,255,255,0.98)";
const TXT_SOFT = "rgba(255,255,255,0.76)";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const GOLD = "#F59E0B";
const MODE_PEARL = "#C7D2D4";
const MODE_CYAN = "#70AEB8";

const STEP_DURATION = 760;
const ONBOARDING_KEY = "kapp_onboarding_completed";
type Step = "arrival" | "scene" | "mode" | "transition";
type SceneKey = "cafe" | "metro" | "restaurant";
type ModeKey = "text" | "guided";

type SceneOption = {
  key: SceneKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  phrase: string;
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
    title: "Café",
    subtitle: "Commande comme si tu étais à Hongdae.",
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
];

const MODES: ModeOption[] = [
  {
    key: "text",
    title: "Expressions utiles",
    subtitle: "Revois les mots et expressions utilisés couramment",
    accent: MODE_PEARL,
  },
  {
    key: "guided",
    title: "Entre dans la scène",
    subtitle: "Entre dans la situation, écoute et réponds comme sur place",
    accent: MODE_CYAN,
    highlighted: true,
  },
];

const ROUTES: Record<SceneKey, Record<ModeKey, string>> = {
  cafe: {
    text: "/lesson/cafe",
    guided: "/lesson/cafeMissions",
  },
  metro: {
    text: "/lesson/metro",
    guided: "/lesson/metroMissions",
  },
  restaurant: {
    text: "/lesson/restaurant",
    guided: "/lesson/restaurantMissions",
  },
};

function BackgroundLayer({
  source,
  blur = 20,
  imageBlurRadius = 0,
  darkOverlayOpacity = 0,
  abstract = false,
  onLoad,
}: {
  source: any;
  blur?: number;
  imageBlurRadius?: number;
  darkOverlayOpacity?: number;
  abstract?: boolean;
  onLoad?: () => void;
}) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.backgroundBase]}
    >
      {abstract ? (
        <>
          <LinearGradient
            colors={["#050609", "#07101A", "#050609"]}
            locations={[0, 0.48, 1]}
            start={{ x: 0.08, y: 0 }}
            end={{ x: 0.92, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              "transparent",
              "rgba(244,114,182,0.10)",
              "rgba(244,114,182,0.035)",
              "transparent",
            ]}
            locations={[0, 0.34, 0.58, 1]}
            start={{ x: 0, y: 0.02 }}
            end={{ x: 1, y: 0.72 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              "transparent",
              "rgba(34,211,238,0.045)",
              "rgba(34,211,238,0.075)",
              "transparent",
            ]}
            locations={[0, 0.48, 0.72, 1]}
            start={{ x: 1, y: 0.38 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.34)",
              "transparent",
              "transparent",
              "rgba(0,0,0,0.34)",
            ]}
            locations={[0, 0.18, 0.82, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["transparent", "rgba(5,6,9,0.36)", "#050609"]}
            locations={[0, 0.72, 1]}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        <>
          <Image
            source={source}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={imageBlurRadius}
            onLoad={onLoad}
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

          <BlurView
            intensity={blur}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </>
      )}
    </View>
  );
}

export default function OnboardingScreen() {
  const { fontScale, height, width } = useWindowDimensions();
  const responsive = useResponsiveLayout({ maxWidth: 860 });
  const [step, setStep] = useState<Step>("arrival");
  const [selectedScene, setSelectedScene] = useState<SceneKey>("cafe");
  const [selectedMode, setSelectedMode] = useState<ModeKey>("guided");
  const isCompactScreen = height <= 700 || width <= 380;
  const isShortScreen = height <= 700;
  const isLargeText = fontScale > 1.15;
  const isWideSceneLayout =
    responsive.isLandscape && responsive.width >= 760 && !isLargeText;
  const sceneHeroHeight = isWideSceneLayout
    ? 350
    : isShortScreen
      ? 210
      : width <= 380
        ? 244
        : responsive.isTablet
          ? 320
          : height >= 820
            ? 286
            : 270;
  const alternativeSceneHeight = isShortScreen
    ? 96
    : width <= 380
      ? 108
      : responsive.isTablet
        ? 128
        : 116;

  const fade = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(24), []);
  const pulse = useMemo(() => new Animated.Value(0), []);
  const entryOverlayOpacity = useMemo(() => new Animated.Value(1), []);
  const [entryBackgroundReady, setEntryBackgroundReady] = useState(false);

  const selectedSceneData = useMemo(
    () => SCENES.find((scene) => scene.key === selectedScene) ?? SCENES[0],
    [selectedScene],
  );

  const selectedModeData = useMemo(
    () => MODES.find((mode) => mode.key === selectedMode) ?? MODES[1],
    [selectedMode],
  );

  const alternativeScenes = useMemo(
    () => SCENES.filter((scene) => scene.key !== selectedScene),
    [selectedScene],
  );

  const backgroundSource = useMemo(() => {
    if (step === "arrival") return HERO_IMAGE;
    return selectedSceneData.image;
  }, [step, selectedSceneData.image]);

  const animateIn = useCallback(() => {
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
  }, [fade, translateY]);

  useEffect(() => {
    animateIn();
  }, [animateIn, step]);

  useEffect(() => {
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let entrance: Animated.CompositeAnimation | null = null;

    const reveal = () => {
      entrance = Animated.sequence([
        Animated.delay(40),
        Animated.timing(entryOverlayOpacity, {
          toValue: 0,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

      entrance.start();
    };

    if (entryBackgroundReady) {
      reveal();
    } else {
      // Safety fallback: never leave the onboarding covered if image loading
      // doesn't emit an event in a specific Expo/runtime environment.
      fallbackTimer = setTimeout(reveal, 900);
    }

    return () => {
      entrance?.stop();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [entryBackgroundReady, entryOverlayOpacity]);

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
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
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
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.push("/(tabs)" as any);
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
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent
      />

      <BackgroundLayer
        source={backgroundSource}
        abstract={step === "scene"}
        blur={step === "transition" ? 32 : step === "arrival" ? 18 : 24}
        onLoad={
          step === "arrival" ? () => setEntryBackgroundReady(true) : undefined
        }
      />

      <SafeAreaView
        style={[
          styles.safe,
          {
            paddingHorizontal:
              step === "scene"
                ? responsive.horizontalPadding
                : isCompactScreen
                  ? 16
                  : 24,
          },
        ]}
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
                  <AppText
                    variant="label"
                    lineContract="singleLine"
                    style={styles.badgeText}
                  >
                    SÉOUL IMMERSION
                  </AppText>
                </View>
              </View>

              <View style={styles.arrivalCenter}>
                <AppText
                  variant="koreanPrimary"
                  script="korean"
                  style={styles.koreanLine}
                >
                  어서 오세요
                </AppText>
                <AppText
                  accessibilityRole="header"
                  variant="display"
                  style={styles.bigTitle}
                >
                  Bienvenue à Séoul
                </AppText>
                <AppText variant="subtitle" style={styles.subtitle}>
                  Tu n’apprends pas le coréen. Tu entres dans des scènes
                  réelles.
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

                    <AppText variant="sectionLabel" style={styles.heroEyebrow}>
                      IMMERSION
                    </AppText>
                    <AppText variant="sceneTitle" style={styles.heroTitle}>
                      La ville s’ouvre devant toi
                    </AppText>
                    <AppText variant="body" style={styles.heroText}>
                      Choisis une scène recommandée pour commencer, ou
                      prépare-toi d’abord avec les bases essentielles.
                    </AppText>
                  </BlurView>
                </Animated.View>
              </View>

              <View style={styles.bottomCtaArea}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choisir une scène"
                  accessibilityHint="Ouvre le choix de la scène de départ"
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
                      Choisir une scène
                    </AppText>
                  </BlurView>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {step === "scene" && (
          <Animated.View style={[styles.page, styles.scenePage, animatedStyle]}>
            <View style={styles.sceneTopNav}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour à l’écran de bienvenue"
                hitSlop={10}
                style={({ pressed }) => [
                  styles.sceneBackButton,
                  pressed && styles.pressedControl,
                ]}
                onPress={() => goToStep("arrival")}
              >
                <ArrowLeft size={18} color={TXT} strokeWidth={2} />
              </Pressable>

              <View
                style={styles.sceneProgress}
                accessibilityLabel="Étape 2 sur 3"
              >
                <View style={styles.sceneProgressLine} />
                <View
                  style={[
                    styles.sceneProgressLine,
                    styles.sceneProgressLineActive,
                  ]}
                />
                <View style={styles.sceneProgressLine} />
              </View>

              <View style={styles.sceneNavSpacer} />
            </View>

            <ScrollView
              style={styles.stepScroll}
              contentContainerStyle={[
                styles.sceneScrollContent,
                isCompactScreen && styles.sceneScrollContentCompact,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.sceneIntro}>
                <AppText
                  variant="sectionLabel"
                  style={styles.sceneIntroEyebrow}
                >
                  TON POINT DE DÉPART
                </AppText>
                <AppText
                  accessibilityRole="header"
                  variant="screenTitle"
                  style={styles.sceneIntroTitle}
                >
                  Choisis ta première expérience
                </AppText>
                <AppText variant="body" style={styles.sceneIntroText}>
                  Lance une scène guidée ou explore librement le Hub.
                </AppText>
              </View>

              <View
                style={[
                  styles.sceneExperienceLayout,
                  isWideSceneLayout && styles.sceneExperienceLayoutWide,
                ]}
              >
                <View
                  accessibilityLabel={`${selectedSceneData.title}, scène sélectionnée. ${selectedSceneData.subtitle}${
                    selectedScene === "cafe"
                      ? " Guidée pas à pas, sans prérequis."
                      : ""
                  }`}
                  accessibilityState={{ selected: true }}
                  accessible
                  style={[
                    styles.featuredScene,
                    isWideSceneLayout && styles.featuredSceneWide,
                    { height: sceneHeroHeight },
                  ]}
                >
                  <Image
                    source={selectedSceneData.image}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={[
                      "rgba(2,3,6,0.02)",
                      "rgba(2,3,6,0.08)",
                      "rgba(2,3,6,0.54)",
                      "rgba(2,3,6,0.97)",
                    ]}
                    locations={[0, 0.48, 0.72, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  <LinearGradient
                    colors={[`${selectedSceneData.accent}24`, "transparent"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0.78, y: 0.2 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View style={styles.featuredTopRow}>
                    <View
                      style={[
                        styles.recommendedPill,
                        { borderColor: `${selectedSceneData.accent}72` },
                      ]}
                    >
                      <View
                        style={[
                          styles.recommendedDot,
                          { backgroundColor: selectedSceneData.accent },
                        ]}
                      />
                      <AppText variant="label" style={styles.recommendedText}>
                        {selectedScene === "cafe"
                          ? "IDÉAL POUR DÉBUTER"
                          : isCompactScreen
                            ? "SÉLECTIONNÉE"
                            : "TON IMMERSION"}
                      </AppText>
                    </View>
                    <AppText
                      variant="sectionLabel"
                      style={styles.featuredLocation}
                    >
                      {selectedSceneData.eyebrow}
                    </AppText>
                  </View>

                  <View style={styles.featuredCopy}>
                    <AppText
                      accessibilityLanguage="ko-KR"
                      variant="koreanSecondary"
                      script="korean"
                      style={[
                        styles.featuredPhrase,
                        { color: selectedSceneData.accent },
                      ]}
                    >
                      {selectedSceneData.phrase}
                    </AppText>
                    <AppText variant="sceneTitle" style={styles.featuredTitle}>
                      {selectedSceneData.title}
                    </AppText>
                    <AppText
                      variant="bodyStrong"
                      style={styles.featuredSubtitle}
                    >
                      {selectedSceneData.subtitle}
                    </AppText>
                    {selectedScene === "cafe" && (
                      <View style={styles.beginnerNote}>
                        <Check
                          size={13}
                          color="rgba(255,255,255,0.82)"
                          strokeWidth={2.2}
                        />
                        <AppText
                          variant="caption"
                          style={styles.beginnerNoteText}
                        >
                          Aucun prérequis
                        </AppText>
                      </View>
                    )}
                  </View>
                </View>

                <View
                  style={[
                    styles.alternativeRail,
                    isWideSceneLayout && styles.alternativeRailWide,
                  ]}
                >
                  <View style={styles.alternativeHeading}>
                    <View style={styles.alternativeRule} />
                    <AppText
                      variant="sectionLabel"
                      style={styles.alternativeLabel}
                    >
                      AUTRES IMMERSIONS
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.alternativeList,
                      isWideSceneLayout && styles.alternativeListWide,
                    ]}
                  >
                    {alternativeScenes.map((scene) => (
                      <Pressable
                        key={scene.key}
                        accessibilityRole="radio"
                        accessibilityLabel={`${scene.title}. ${scene.subtitle}`}
                        accessibilityState={{ checked: false, selected: false }}
                        aria-checked={false}
                        aria-selected={false}
                        style={({ pressed }) => [
                          styles.alternativeScene,
                          { height: alternativeSceneHeight },
                          isWideSceneLayout && styles.alternativeSceneWide,
                          pressed && styles.alternativeScenePressed,
                        ]}
                        onPress={async () => {
                          await tap();
                          setSelectedScene(scene.key);
                        }}
                      >
                        <Image
                          source={scene.image}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />
                        <LinearGradient
                          colors={[
                            "rgba(2,3,6,0.02)",
                            "rgba(2,3,6,0.18)",
                            "rgba(2,3,6,0.94)",
                          ]}
                          locations={[0, 0.45, 1]}
                          style={StyleSheet.absoluteFill}
                        />
                        <LinearGradient
                          colors={[`${scene.accent}1F`, "transparent"]}
                          start={{ x: 0, y: 1 }}
                          end={{ x: 0.72, y: 0.18 }}
                          style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.alternativeCopy}>
                          <AppText
                            variant="sectionLabel"
                            style={[
                              styles.alternativePlace,
                              { color: scene.accent },
                            ]}
                          >
                            {scene.eyebrow}
                          </AppText>
                          <AppText
                            variant="cardTitle"
                            style={styles.alternativeTitle}
                          >
                            {scene.title}
                          </AppText>
                        </View>
                        <View style={styles.alternativeArrow}>
                          <MoveRight size={16} color={TXT} strokeWidth={2} />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.sceneBottomDock}>
              <View
                style={[
                  styles.sceneActions,
                  isLargeText && styles.sceneActionsStacked,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    selectedScene === "cafe"
                      ? "Essayer l’expérience Café"
                      : `Continuer avec la scène ${selectedSceneData.title}`
                  }
                  accessibilityHint="Ouvre le choix entre expressions utiles et scène guidée"
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.scenePrimaryWrap,
                    pressed && styles.scenePrimaryPressed,
                  ]}
                  onPress={() => goToStep("mode")}
                >
                  <BlurView
                    intensity={24}
                    tint="dark"
                    style={styles.scenePrimaryButton}
                  >
                    <LinearGradient
                      colors={[
                        `${selectedSceneData.accent}A8`,
                        `${selectedSceneData.accent}52`,
                        "rgba(255,255,255,0.08)",
                      ]}
                      start={{ x: 0, y: 0.4 }}
                      end={{ x: 1, y: 0.6 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <AppText variant="button" style={styles.primaryText}>
                      {selectedScene === "cafe"
                        ? "Commencer par Café"
                        : isCompactScreen
                          ? "Continuer"
                          : `Continuer avec ${selectedSceneData.title}`}
                    </AppText>
                    {!isCompactScreen && !isLargeText && (
                      <MoveRight size={18} color="#FFFFFF" strokeWidth={2.2} />
                    )}
                  </BlurView>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Explorer le Hub"
                  accessibilityHint="Quitte l’onboarding et ouvre l’accueil de l’application"
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.sceneHubButton,
                    isCompactScreen && styles.sceneHubButtonCompact,
                    isLargeText && styles.sceneHubButtonStacked,
                    pressed && styles.scenePrimaryPressed,
                  ]}
                  onPress={openMoreScenes}
                >
                  {!isCompactScreen && (
                    <Compass size={16} color={TXT} strokeWidth={2} />
                  )}
                  <AppText variant="button" style={styles.sceneHubButtonText}>
                    Explorer le Hub
                  </AppText>
                </Pressable>
              </View>
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
                  <AppText
                    variant="label"
                    lineContract="singleLine"
                    style={styles.badgeText}
                  >
                    CONVERSATION
                  </AppText>
                </View>
              </View>

              <View
                style={[
                  styles.sectionHead,
                  (isCompactScreen || isLargeText) && styles.sectionHeadCompact,
                ]}
              >
                <AppText variant="sectionLabel" style={styles.sectionEyebrow}>
                  SCÈNE CHOISIE
                </AppText>
                <AppText
                  accessibilityRole="header"
                  variant="screenTitle"
                  style={styles.sectionTitle}
                >
                  {selectedSceneData.title}
                </AppText>
                <AppText variant="body" style={styles.sectionText}>
                  Choisis ton approche.
                </AppText>
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
                        style={styles.modeCard}
                      >
                        <LinearGradient
                          colors={[
                            active
                              ? `${mode.accent}16`
                              : "rgba(255,255,255,0.025)",
                            "rgba(4,8,13,0.20)",
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
                              opacity: active ? 0.82 : 0.24,
                            },
                          ]}
                        />

                        <View style={styles.modeContent}>
                          <View style={styles.modeCopy}>
                            <AppText
                              variant="cardTitle"
                              style={styles.modeTitle}
                            >
                              {mode.title}
                            </AppText>
                            <AppText
                              variant="bodySecondary"
                              tone="muted"
                              style={styles.modeSubtitle}
                            >
                              {mode.subtitle}
                            </AppText>
                          </View>

                          {mode.highlighted && (
                            <View style={styles.signatureBadge}>
                              <AppText
                                variant="sectionLabel"
                                style={styles.signatureText}
                              >
                                SIGNATURE
                              </AppText>
                            </View>
                          )}
                        </View>

                        {active && (
                          <View
                            style={[
                              styles.modeActiveRing,
                              { borderColor: `${mode.accent}4A` },
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
                  colors={["rgba(112,174,184,0.07)", "rgba(255,255,255,0.015)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <AppText variant="sectionLabel" style={styles.previewEyebrow}>
                  PRÊT À ENTRER
                </AppText>
                <AppText variant="cardTitle" style={styles.previewTitle}>
                  {selectedSceneData.title} · {selectedModeData.title}
                </AppText>
              </BlurView>

              <View style={styles.bottomBar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retour au choix de scène"
                  hitSlop={6}
                  style={styles.secondaryButton}
                  onPress={() => goToStep("scene")}
                >
                  <AppText variant="button" style={styles.secondaryText}>
                    Retour aux scènes
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Commencer la scène choisie"
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
                        "rgba(125,63,96,0.42)",
                        "rgba(45,72,94,0.40)",
                        "rgba(35,91,102,0.34)",
                      ]}
                      locations={[0, 0.52, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <AppText variant="button" style={styles.primaryText}>
                      Commencer
                    </AppText>
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

            <AppText variant="sectionLabel" style={styles.transitionEyebrow}>
              SCÈNE EN COURS
            </AppText>
            <AppText
              accessibilityRole="header"
              variant="screenTitle"
              style={styles.transitionTitle}
            >
              Tu es prêt.
            </AppText>
            <AppText variant="body" style={styles.transitionText}>
              La conversation commence.
            </AppText>
          </Animated.View>
        )}
      </SafeAreaView>

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.entryOverlay,
          { opacity: entryOverlayOpacity },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundBase: {
    backgroundColor: "#000000",
  },
  entryOverlay: {
    backgroundColor: "#000000",
    zIndex: 1000,
    elevation: 1000,
  },
  safe: {
    flex: 1,
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
    textAlign: "center",
    marginBottom: 12,
  },
  bigTitle: {
    color: TXT,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
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
    marginBottom: 10,
  },
  heroTitle: {
    color: TXT,
  },
  heroText: {
    color: "rgba(255,255,255,0.60)",
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
    textAlign: "center",
  },
  scenePage: {
    maxWidth: 920,
  },
  sceneTopNav: {
    minHeight: 54,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sceneBackButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(2,3,6,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressedControl: {
    opacity: 0.68,
  },
  sceneProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sceneProgressLine: {
    width: 16,
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  sceneProgressLineActive: {
    width: 28,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  sceneNavSpacer: {
    width: 40,
    height: 40,
  },
  sceneScrollContent: {
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    paddingTop: 16,
    paddingBottom: 22,
  },
  sceneScrollContentCompact: {
    paddingTop: 10,
    paddingBottom: 18,
  },
  sceneIntro: {
    maxWidth: 620,
    marginBottom: 24,
  },
  sceneIntroEyebrow: {
    color: PINK,
    marginBottom: 7,
  },
  sceneIntroTitle: {
    color: TXT,
  },
  sceneIntroText: {
    maxWidth: 520,
    color: "rgba(255,255,255,0.64)",
    marginTop: 8,
  },
  sceneExperienceLayout: {
    gap: 22,
  },
  sceneExperienceLayoutWide: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 18,
  },
  featuredScene: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    backgroundColor: "rgba(2,3,6,0.60)",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 6,
  },
  featuredSceneWide: {
    flex: 1.9,
    width: "auto",
  },
  featuredTopRow: {
    paddingHorizontal: 17,
    paddingTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  recommendedPill: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(2,3,6,0.68)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recommendedDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  recommendedText: {
    color: "rgba(255,255,255,0.92)",
  },
  featuredLocation: {
    color: "rgba(255,255,255,0.72)",
    textAlign: "right",
  },
  featuredCopy: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    maxWidth: 520,
  },
  featuredPhrase: {
    marginBottom: 3,
    textShadowColor: "rgba(0,0,0,0.78)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  featuredTitle: {
    color: TXT,
    textShadowColor: "rgba(0,0,0,0.78)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  featuredSubtitle: {
    color: "rgba(255,255,255,0.82)",
    marginTop: 5,
    maxWidth: 380,
  },
  beginnerNote: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  beginnerNoteText: {
    color: "rgba(255,255,255,0.74)",
  },
  alternativeRail: {
    gap: 13,
  },
  alternativeRailWide: {
    flex: 1,
    minWidth: 0,
  },
  alternativeHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alternativeRule: {
    width: 20,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  alternativeLabel: {
    color: "rgba(255,255,255,0.52)",
  },
  alternativeList: {
    flexDirection: "row",
    gap: 11,
  },
  alternativeListWide: {
    flex: 1,
    flexDirection: "column",
  },
  alternativeScene: {
    flex: 1,
    minWidth: 0,
    height: 108,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(2,3,6,0.58)",
    justifyContent: "flex-end",
  },
  alternativeSceneWide: {
    height: "auto",
  },
  alternativeScenePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  alternativeCopy: {
    paddingLeft: 14,
    paddingRight: 38,
    paddingBottom: 13,
  },
  alternativePlace: {
    marginBottom: 2,
  },
  alternativeTitle: {
    color: TXT,
  },
  alternativeArrow: {
    position: "absolute",
    right: 10,
    bottom: 12,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(4,6,10,0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  sceneBottomDock: {
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    paddingTop: 11,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(5,6,9,0.62)",
  },
  sceneActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sceneActionsStacked: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  scenePrimaryWrap: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    overflow: "hidden",
  },
  scenePrimaryPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.994 }],
  },
  scenePrimaryButton: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderTopWidth: 1.2,
    borderColor: "rgba(255,255,255,0.15)",
    borderTopColor: "rgba(255,255,255,0.28)",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sceneHubButton: {
    width: 138,
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "rgba(255,255,255,0.055)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sceneHubButtonCompact: {
    width: 118,
    paddingHorizontal: 10,
  },
  sceneHubButtonStacked: {
    width: "100%",
  },
  sceneHubButtonText: {
    color: TXT,
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
    marginBottom: 6,
  },
  sectionTitle: {
    color: TXT,
  },
  sectionText: {
    color: "rgba(255,255,255,0.65)",
    marginTop: 6,
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
    borderColor: "rgba(255,255,255,0.085)",
    backgroundColor: "rgba(4,8,13,0.66)",
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
  },
  modeSubtitle: {
    color: "rgba(255,255,255,0.52)",
    marginTop: 2,
  },
  signatureBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(184,140,164,0.07)",
    borderWidth: 1,
    borderColor: "rgba(215,174,195,0.18)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  signatureText: {
    color: "rgba(232,199,215,0.78)",
  },
  modeActiveRing: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 20,
    borderWidth: 1,
    pointerEvents: "none",
  },
  previewCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(4,8,13,0.48)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: "auto",
  },
  previewEyebrow: {
    color: "rgba(255,255,255,0.40)",
    marginBottom: 2,
  },
  previewTitle: {
    color: TXT,
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
  secondaryButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: {
    color: "rgba(255,255,255,0.55)",
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
    borderColor: "rgba(255,255,255,0.13)",
    borderTopColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(5,9,15,0.62)",
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
    marginBottom: 12,
  },
  transitionTitle: {
    color: TXT,
  },
  transitionText: {
    color: TXT_SOFT,
    marginTop: 8,
    textAlign: "center",
  },
});
