import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Check, Compass, MoveRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../components/app-text";

const SCENE_BACKGROUND = require("../assets/images/onboarding-scene-v2.webp");
const CAFE_IMAGE = require("../assets/images/cafeIA.jpg");
const METRO_IMAGE = require("../assets/images/metroIA.jpg");
const RESTAURANT_IMAGE = require("../assets/images/restaurantIA.jpg");
const AIRPORT_IMAGE = require("../assets/images/airport.jpg");

const ONBOARDING_KEY = "kapp_onboarding_completed";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const GOLD = "#F59E0B";
const WHITE = "#FFFFFF";

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
  badge: string;
  guidance: string;
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
    badge: "IDÉAL POUR DÉBUTER",
    guidance: "Aucun prérequis",
  },
  {
    key: "metro",
    eyebrow: "LIGNE 2",
    title: "Métro",
    subtitle: "Trouve ton chemin dans Séoul.",
    phrase: "2호선은 어디예요?",
    accent: CYAN,
    image: METRO_IMAGE,
    badge: "DÉBUTANT +",
    guidance: "Scène guidée",
  },
  {
    key: "restaurant",
    eyebrow: "ITAEWON",
    title: "Restaurant",
    subtitle: "Commande naturellement à table.",
    phrase: "이거 주세요",
    accent: GOLD,
    image: RESTAURANT_IMAGE,
    badge: "DÉBUTANT +",
    guidance: "Scène guidée",
  },
  {
    key: "airport",
    eyebrow: "INCHEON",
    title: "Aéroport",
    subtitle: "Repère-toi dès ton arrivée en Corée.",
    phrase: "지하철은 어디예요?",
    accent: CYAN,
    image: AIRPORT_IMAGE,
    badge: "INTERMEDIAIRE",
    guidance: "Vocabulaire + grammaire guidés",
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
  airport: {
    text: "/lesson/airport",
    guided: "/lesson/aeroportMissions",
  },
};

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

function ProgressDots({ active }: { active: 0 | 1 | 2 }) {
  return (
    <View
      style={styles.progress}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: 3, now: active + 1 }}
      accessibilityLabel={`Étape ${active + 1} sur 3`}
    >
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.progressLine,
            index === active && styles.progressLineActive,
          ]}
        />
      ))}
    </View>
  );
}

function FeaturedScene({
  scene,
  height,
}: {
  scene: SceneOption;
  height: number;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${scene.title}. ${scene.subtitle} ${scene.guidance}.`}
      style={[
        styles.featuredCard,
        {
          height,
          borderColor: `${scene.accent}72`,
          shadowColor: scene.accent,
        },
      ]}
    >
      <Image
        source={scene.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <LinearGradient
        colors={[
          "rgba(2,3,7,0.00)",
          "rgba(2,3,7,0.06)",
          "rgba(2,3,7,0.48)",
          "rgba(2,3,7,0.96)",
        ]}
        locations={[0, 0.38, 0.66, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(3,3,8,0.56)", "rgba(3,3,8,0.18)", "transparent"]}
        locations={[0, 0.54, 1]}
        start={{ x: 0, y: 0.6 }}
        end={{ x: 1, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[`${scene.accent}1C`, "transparent", "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.84, y: 0.15 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.featuredTopRow}>
        <View
          style={[styles.recommendedPill, { borderColor: `${scene.accent}88` }]}
        >
          <View
            style={[styles.recommendedDot, { backgroundColor: scene.accent }]}
          />
          <AppText variant="label" style={styles.recommendedText}>
            {scene.badge}
          </AppText>
        </View>

        <AppText variant="sectionLabel" style={styles.featuredLocation}>
          {scene.eyebrow}
        </AppText>
      </View>

      <View style={styles.featuredCopy}>
        <AppText
          accessibilityLanguage="ko-KR"
          variant="koreanSecondary"
          script="korean"
          style={[styles.featuredPhrase, { color: scene.accent }]}
        >
          {scene.phrase}
        </AppText>
        <AppText variant="sceneTitle" style={styles.featuredTitle}>
          {scene.title}
        </AppText>
        <AppText variant="bodyStrong" style={styles.featuredSubtitle}>
          {scene.subtitle}
        </AppText>

        <View style={styles.beginnerRow}>
          <View
            style={[styles.beginnerIcon, { borderColor: `${scene.accent}B8` }]}
          >
            <Check size={12} color={scene.accent} strokeWidth={2.3} />
          </View>
          <AppText variant="caption" style={styles.beginnerText}>
            {scene.guidance}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function AlternativeScene({
  scene,
  height,
  width,
  onPress,
}: {
  scene: SceneOption;
  height: number;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choisir ${scene.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.alternativeCard,
        { height, width },
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={scene.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(2,3,7,0.00)", "rgba(2,3,7,0.16)", "rgba(2,3,7,0.88)"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[`${scene.accent}1F`, "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.72, y: 0.12 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.alternativeCopy}>
        <AppText
          variant="sectionLabel"
          style={[styles.alternativeEyebrow, { color: scene.accent }]}
        >
          {scene.eyebrow}
        </AppText>
        <AppText variant="cardTitle" style={styles.alternativeTitle}>
          {scene.title}
        </AppText>
      </View>

      <View style={styles.alternativeArrow}>
        <MoveRight size={19} color={WHITE} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const { width, height, fontScale } = useWindowDimensions();
  const [step, setStep] = useState<OnboardingStep>("scene");
  const [selectedScene, setSelectedScene] = useState<SceneKey>("cafe");
  const [selectedMode, setSelectedMode] = useState<ModeKey>("guided");

  const isCompact = width <= 380 || height <= 720;
  const isShort = height <= 700;
  const isTablet = width >= 768;
  const largeText = fontScale > 1.15;

  const selectedSceneData = useMemo(
    () => SCENES.find((scene) => scene.key === selectedScene) ?? SCENES[0],
    [selectedScene],
  );

  const alternativeScenes = useMemo(
    () => SCENES.filter((scene) => scene.key !== selectedScene),
    [selectedScene],
  );

  const heroHeight = isTablet
    ? 378
    : isShort
      ? 252
      : height >= 850
        ? 320
        : height >= 790
          ? 304
          : 286;

  const alternativeHeight = isTablet ? 142 : isShort ? 102 : 118;
  const alternativeWidth = isTablet
    ? 244
    : Math.min(190, Math.max(154, width * 0.43));
  const horizontalPadding = isTablet ? 30 : width <= 380 ? 18 : 22;

  const selectScene = async (scene: SceneKey) => {
    await lightTap();
    setSelectedScene(scene);
  };

  const openHub = async () => {
    await lightTap();
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)" as any);
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
            <View style={styles.modeProgressWrap}>
              <ProgressDots active={1} />
            </View>

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

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <SceneBackground />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View
          style={[styles.scenePage, { paddingHorizontal: horizontalPadding }]}
        >
          <View style={styles.sceneTopNav}>
            <ProgressDots active={0} />
          </View>

          <ScrollView
            style={styles.sceneScroll}
            contentContainerStyle={[
              styles.sceneScrollContent,
              isCompact && styles.sceneScrollContentCompact,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.intro}>
              <AppText variant="sectionLabel" style={styles.introEyebrow}>
                TON POINT DE DÉPART
              </AppText>
              <AppText
                accessibilityRole="header"
                variant="screenTitle"
                style={styles.introTitle}
              >
                Choisis ta première expérience
              </AppText>
              <AppText variant="body" style={styles.introSubtitle}>
                Lance une scène guidée ou explore librement le Hub.
              </AppText>
            </View>

            <FeaturedScene scene={selectedSceneData} height={heroHeight} />

            <View style={styles.alternativeSection}>
              <View style={styles.alternativeHeader}>
                <AppText variant="sectionLabel" style={styles.alternativeLabel}>
                  AUTRES IMMERSIONS
                </AppText>
                <AppText variant="caption" style={styles.swipeHint}>
                  Fais glisser pour explorer
                </AppText>
              </View>

              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.alternativeList}
              >
                {alternativeScenes.map((scene) => (
                  <AlternativeScene
                    key={scene.key}
                    scene={scene}
                    height={alternativeHeight}
                    width={alternativeWidth}
                    onPress={() => void selectScene(scene.key)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Commencer par ${selectedSceneData.title}`}
                onPress={openMode}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <LinearGradient
                  colors={[
                    selectedScene === "cafe"
                      ? "#E95B9C"
                      : selectedSceneData.accent,
                    selectedScene === "cafe"
                      ? "#9A476F"
                      : `${selectedSceneData.accent}B8`,
                    "#3A2838",
                  ]}
                  locations={[0, 0.58, 1]}
                  start={{ x: 0, y: 0.45 }}
                  end={{ x: 1, y: 0.55 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.primaryHighlight} />
                <AppText variant="button" style={styles.buttonText}>
                  {`Commencer par ${selectedSceneData.title}`}
                </AppText>
                <MoveRight size={20} color={WHITE} strokeWidth={2.2} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Explorer le Hub"
                onPress={openHub}
                style={({ pressed }) => [
                  styles.hubButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.hubIcon}>
                  <Compass size={16} color={WHITE} strokeWidth={2.1} />
                </View>
                <AppText variant="button" style={styles.hubButtonText}>
                  Explorer le Hub
                </AppText>
              </Pressable>
            </View>

            {largeText ? <View style={styles.largeTextSpacer} /> : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#02030A",
  },
  safe: {
    flex: 1,
  },
  scenePage: {
    flex: 1,
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
  },
  sceneTopNav: {
    height: 50,
    paddingTop: 11,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  progress: {
    minHeight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  progressLine: {
    width: 26,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  progressLineActive: {
    width: 38,
    backgroundColor: PINK,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 3,
  },
  sceneScroll: {
    flex: 1,
  },
  sceneScrollContent: {
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    paddingTop: 24,
    paddingBottom: 12,
  },
  sceneScrollContentCompact: {
    paddingTop: 14,
  },
  intro: {
    maxWidth: 650,
    marginBottom: 24,
  },
  introEyebrow: {
    color: PINK,
    marginBottom: 12,
    textShadowColor: "rgba(244,114,182,0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  introTitle: {
    color: "#FFF9FC",
    maxWidth: 560,
    textShadowColor: "rgba(0,0,0,0.44)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  introSubtitle: {
    color: "rgba(255,255,255,0.68)",
    maxWidth: 560,
    marginTop: 12,
  },
  featuredCard: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "rgba(2,3,7,0.62)",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.13,
    shadowRadius: 22,
    elevation: 7,
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  recommendedPill: {
    minHeight: 31,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(7,5,11,0.67)",
  },
  recommendedDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  recommendedText: {
    color: "rgba(255,255,255,0.97)",
  },
  featuredLocation: {
    color: "rgba(255,255,255,0.80)",
    textAlign: "right",
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  featuredCopy: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    maxWidth: 540,
  },
  featuredPhrase: {
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  featuredTitle: {
    color: WHITE,
    textShadowColor: "rgba(0,0,0,0.90)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  featuredSubtitle: {
    color: "rgba(255,255,255,0.88)",
    marginTop: 8,
    maxWidth: 410,
    textShadowColor: "rgba(0,0,0,0.78)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  beginnerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  beginnerIcon: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.2,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  beginnerText: {
    color: "rgba(255,255,255,0.78)",
  },
  alternativeSection: {
    marginTop: 22,
  },
  alternativeHeader: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  alternativeLabel: {
    color: "rgba(255,255,255,0.52)",
    marginLeft: 1,
  },
  swipeHint: {
    color: "rgba(255,255,255,0.38)",
    textAlign: "right",
  },
  alternativeList: {
    gap: 12,
    paddingRight: 18,
  },
  alternativeCard: {
    flexShrink: 0,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "rgba(2,3,7,0.62)",
    justifyContent: "flex-end",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 4,
  },
  alternativeCopy: {
    paddingLeft: 15,
    paddingRight: 49,
    paddingBottom: 14,
  },
  alternativeEyebrow: {
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  alternativeTitle: {
    color: WHITE,
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  alternativeArrow: {
    position: "absolute",
    right: 12,
    bottom: 13,
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(3,4,8,0.58)",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    minHeight: 62,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    overflow: "hidden",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryHighlight: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.48)",
  },
  buttonText: {
    color: WHITE,
    textAlign: "center",
  },
  hubButton: {
    minHeight: 58,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    backgroundColor: "rgba(4,6,12,0.70)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
  },
  hubIcon: {
    width: 27,
    height: 27,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.34)",
    alignItems: "center",
    justifyContent: "center",
  },
  hubButtonText: {
    color: WHITE,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.992 }],
  },
  largeTextSpacer: {
    height: 16,
  },
  modePage: {
    flex: 1,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  modeProgressWrap: {
    height: 50,
    paddingTop: 11,
    alignItems: "center",
  },
  modeScroll: {
    flex: 1,
  },
  modeContent: {
    paddingTop: 24,
    paddingBottom: 18,
  },
  modeEyebrow: {
    color: CYAN,
    marginBottom: 10,
  },
  modeTitle: {
    color: WHITE,
  },
  modeSubtitle: {
    color: "rgba(255,255,255,0.66)",
    marginTop: 7,
  },
  modeHero: {
    height: 170,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginTop: 24,
    justifyContent: "flex-end",
  },
  modeHeroCopy: {
    padding: 18,
  },
  modeHeroTitle: {
    color: WHITE,
    marginTop: 3,
  },
  modeChoices: {
    gap: 12,
    marginTop: 18,
  },
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
  modeChoiceCopy: {
    flex: 1,
  },
  modeChoiceTitle: {
    color: WHITE,
  },
  modeChoiceText: {
    color: "rgba(255,255,255,0.58)",
    marginTop: 3,
  },
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
  modeBackText: {
    color: "rgba(255,255,255,0.58)",
  },
});
