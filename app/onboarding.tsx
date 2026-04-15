import { BlurView } from "expo-blur";
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
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {}

const HERO_IMAGE = require("../assets/images/hero.png");
const CAFE_IMAGE = require("../assets/images/cafe.png");
const METRO_IMAGE = require("../assets/images/metro.png");
const RESTAURANT_IMAGE = require("../assets/images/restaurant.png");

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.97)";
const TXT_SOFT = "rgba(255,255,255,0.82)";
const LINE = "rgba(255,255,255,0.16)";
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
    title: "Version texte",
    subtitle: "Lire et comprendre à ton rythme",
    accent: "rgba(255,255,255,0.88)",
  },
  {
    key: "guided",
    title: "Simulation guidée",
    subtitle: "Avancer étape par étape avec de l’aide",
    accent: CYAN,
  },
  {
    key: "real",
    title: "Simulation réelle",
    subtitle: "Entrer dans une interaction plus naturelle",
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
}: {
  source: any;
  blur?: number;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.38)", "rgba(0,0,0,0.72)", "rgba(5,5,8,0.97)"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          "rgba(244,114,182,0.16)",
          "rgba(34,211,238,0.10)",
          "transparent",
        ]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <BlurView intensity={blur} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>("arrival");
  const [selectedScene, setSelectedScene] = useState<SceneKey>("cafe");
  const [selectedMode, setSelectedMode] = useState<ModeKey>("guided");

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const selectedSceneData = useMemo(
    () => SCENES.find((scene) => scene.key === selectedScene) ?? SCENES[0],
    [selectedScene],
  );

  const backgroundSource = useMemo(() => {
    if (step === "arrival") return HERO_IMAGE;
    return selectedSceneData.image;
  }, [step, selectedSceneData.image]);

  useEffect(() => {
    animateIn();
  }, [step]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2400,
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
    translateY.setValue(24);

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
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 12,
        duration: 320,
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

    animateOutAnd(() => setStep("transition"));

    setTimeout(() => {
      router.replace(targetRoute as any);
    }, 1400);
  };

  const openMoreScenes = async () => {
    await tap();
    router.push("/(tabs)" as any);
  };

  const openBasics = async () => {
    await tap();
    router.push("/(tabs)" as any);
  };

  const animatedStyle = {
    opacity: fade,
    transform: [{ translateY }],
  };

  const cardFloat = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, -6],
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <BackgroundLayer
        source={backgroundSource}
        blur={step === "transition" ? 28 : step === "arrival" ? 20 : 22}
      />

      <SafeAreaView style={styles.safe}>
        {step === "arrival" && (
          <Animated.View style={[styles.page, animatedStyle]}>
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>SÉOUL IMMERSION</Text>
              </View>
            </View>

            <View style={styles.arrivalCenter}>
              <Text style={styles.koreanLine}>어서 오세요</Text>
              <Text style={styles.bigTitle}>Bienvenue à Séoul</Text>
              <Text style={styles.subtitle}>
                Tu n’apprends pas le coréen. Tu entres dans des scènes réelles.
              </Text>

              <Animated.View
                style={[
                  styles.heroCardWrap,
                  { transform: [{ translateY: cardFloat }] },
                ]}
              >
                <BlurView intensity={40} tint="dark" style={styles.heroCard}>
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,0.06)",
                      "rgba(255,255,255,0.03)",
                      "rgba(255,255,255,0.015)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <LinearGradient
                    colors={[
                      "rgba(244,114,182,0.10)",
                      "rgba(34,211,238,0.06)",
                      "transparent",
                    ]}
                    start={{ x: 0.08, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <Text style={styles.heroEyebrow}>IMMERSION LIVE</Text>
                  <Text style={styles.heroTitle}>
                    La ville s’ouvre devant toi
                  </Text>
                  <Text style={styles.heroText}>
                    Choisis une scène recommandée pour commencer, ou prépare-toi
                    d’abord avec les bases essentielles.
                  </Text>
                </BlurView>
              </Animated.View>
            </View>

            <View style={styles.bottomCtaArea}>
              <Pressable
                style={styles.primaryWrap}
                onPress={() => goToStep("scene")}
              >
                <BlurView
                  intensity={24}
                  tint="dark"
                  style={styles.primaryButton}
                >
                  <LinearGradient
                    colors={["rgba(244,114,182,0.38)", "rgba(34,211,238,0.26)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.primaryText}>Commencer l’expérience</Text>
                </BlurView>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === "scene" && (
          <Animated.View style={[styles.page, animatedStyle]}>
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <View style={[styles.badgeDot, { backgroundColor: PINK }]} />
                <Text style={styles.badgeText}>SCÈNES RECOMMANDÉES</Text>
              </View>
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionEyebrow}>
                WHERE DO YOU WANT TO ENTER?
              </Text>
              <Text style={styles.sectionTitle}>Choisis ta scène</Text>
              <Text style={styles.sectionText}>
                Trois scènes recommandées pour commencer immédiatement dans les
                meilleures conditions.
              </Text>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.sceneList}
              showsVerticalScrollIndicator={false}
            >
              {SCENES.map((scene) => {
                const active = selectedScene === scene.key;

                return (
                  <Pressable
                    key={scene.key}
                    style={styles.scenePress}
                    onPress={async () => {
                      await tap();
                      setSelectedScene(scene.key);
                    }}
                  >
                    <View
                      style={[
                        styles.sceneCardOuter,
                        active && { transform: [{ scale: 1.015 }] },
                      ]}
                    >
                      <BlurView
                        intensity={26}
                        tint="dark"
                        style={styles.sceneCard}
                      >
                        <Image
                          source={scene.image}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />

                        <LinearGradient
                          colors={[
                            "rgba(0,0,0,0.28)",
                            "rgba(0,0,0,0.55)",
                            "rgba(5,5,8,0.90)",
                          ]}
                          locations={[0, 0.45, 1]}
                          style={StyleSheet.absoluteFill}
                        />

                        <LinearGradient
                          colors={[
                            active
                              ? `${scene.accent}33`
                              : "rgba(255,255,255,0.08)",
                            "transparent",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />

                        <View
                          style={[
                            styles.sceneAccent,
                            {
                              backgroundColor: scene.accent,
                              opacity: active ? 1 : 0.5,
                            },
                          ]}
                        />

                        <View style={styles.sceneContent}>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.sceneEyebrow,
                                active && { color: scene.accent },
                              ]}
                            >
                              {scene.eyebrow}
                            </Text>
                            <Text style={styles.sceneTitle}>{scene.title}</Text>
                            <Text style={styles.sceneSubtitle}>
                              {scene.subtitle}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.radioWrap,
                              active && {
                                borderColor: scene.accent,
                                backgroundColor: "rgba(255,255,255,0.06)",
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

              <Pressable style={styles.discreetAction} onPress={openMoreScenes}>
                <Text style={styles.discreetActionText}>
                  Voir plus de scènes
                </Text>
              </Pressable>

              <Pressable style={styles.basicsCardWrap} onPress={openBasics}>
                <BlurView intensity={24} tint="dark" style={styles.basicsCard}>
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,0.05)",
                      "rgba(255,255,255,0.02)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View style={styles.basicsPill}>
                    <Text style={styles.basicsPillText}>
                      BASES ESSENTIELLES
                    </Text>
                  </View>

                  <Text style={styles.basicsTitle}>
                    Ou commencer par les bases essentielles
                  </Text>
                  <Text style={styles.basicsText}>
                    Hangul, vocabulaire, fondations utiles pour entrer ensuite
                    dans les scènes avec plus d’aisance.
                  </Text>
                </BlurView>
              </Pressable>
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => goToStep("arrival")}
              >
                <Text style={styles.secondaryText}>Retour</Text>
              </Pressable>

              <Pressable
                style={styles.primaryInlineWrap}
                onPress={() => goToStep("mode")}
              >
                <BlurView
                  intensity={24}
                  tint="dark"
                  style={styles.primaryInlineButton}
                >
                  <LinearGradient
                    colors={[
                      `${selectedSceneData.accent}55`,
                      "rgba(255,255,255,0.08)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.primaryText}>Continuer</Text>
                </BlurView>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === "mode" && (
          <Animated.View style={[styles.page, animatedStyle]}>
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <View style={[styles.badgeDot, { backgroundColor: CYAN }]} />
                <Text style={styles.badgeText}>CHOIX DU MODE</Text>
              </View>
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionEyebrow}>
                HOW DO YOU WANT TO EXPERIENCE?
              </Text>
              <Text style={styles.sectionTitle}>Choisis ton intensité</Text>
              <Text style={styles.sectionText}>
                La scène reste la même. Le mode change la façon d’y entrer.
              </Text>
            </View>

            <View style={styles.modeList}>
              {MODES.map((mode) => {
                const active = selectedMode === mode.key;

                return (
                  <Pressable
                    key={mode.key}
                    style={styles.modePress}
                    onPress={async () => {
                      await tap();
                      setSelectedMode(mode.key);
                    }}
                  >
                    <BlurView
                      intensity={34}
                      tint="dark"
                      style={styles.modeCard}
                    >
                      <LinearGradient
                        colors={[
                          active
                            ? `${mode.accent}28`
                            : "rgba(255,255,255,0.05)",
                          "rgba(255,255,255,0.015)",
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
                            opacity: active ? 1 : 0.45,
                          },
                        ]}
                      />

                      <View style={styles.modeContent}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.modeTitle,
                              active && { color: mode.accent },
                            ]}
                          >
                            {mode.title}
                          </Text>
                          <Text style={styles.modeSubtitle}>
                            {mode.subtitle}
                          </Text>
                        </View>

                        {mode.highlighted && (
                          <View style={styles.signatureBadge}>
                            <Text style={styles.signatureText}>
                              MODE SIGNATURE
                            </Text>
                          </View>
                        )}
                      </View>

                      {active && (
                        <View
                          style={[
                            styles.modeActiveRing,
                            { borderColor: `${mode.accent}88` },
                          ]}
                        />
                      )}
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>

            <BlurView intensity={30} tint="dark" style={styles.previewCard}>
              <LinearGradient
                colors={[
                  `${selectedSceneData.accent}22`,
                  "rgba(255,255,255,0.04)",
                  "rgba(255,255,255,0.02)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <Text style={styles.previewEyebrow}>TA PROJECTION</Text>
              <Text style={styles.previewTitle}>
                {selectedSceneData.title} ·{" "}
                {MODES.find((m) => m.key === selectedMode)?.title}
              </Text>
              <Text style={styles.previewText}>
                Une entrée claire, naturelle, et immédiatement alignée avec
                l’expérience que tu veux vivre maintenant.
              </Text>
            </BlurView>

            <View style={styles.bottomBar}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => goToStep("scene")}
              >
                <Text style={styles.secondaryText}>Retour</Text>
              </Pressable>

              <Pressable
                style={styles.primaryInlineWrap}
                onPress={finishOnboarding}
              >
                <BlurView
                  intensity={24}
                  tint="dark"
                  style={styles.primaryInlineButton}
                >
                  <LinearGradient
                    colors={["rgba(244,114,182,0.38)", "rgba(34,211,238,0.26)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.primaryText}>Commencer</Text>
                </BlurView>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === "transition" && (
          <Animated.View
            style={[styles.page, styles.transitionPage, animatedStyle]}
          >
            <View style={styles.transitionGlowWrap}>
              <LinearGradient
                colors={[
                  "rgba(244,114,182,0.26)",
                  "rgba(34,211,238,0.18)",
                  "transparent",
                ]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.transitionGlow}
              />
            </View>

            <Text style={styles.transitionEyebrow}>SCÈNE EN COURS</Text>
            <Text style={styles.transitionTitle}>Tu es prêt.</Text>
            <Text style={styles.transitionText}>La conversation commence.</Text>
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

  page: {
    flex: 1,
  },

  topRow: {
    paddingTop: 8,
    alignItems: "flex-start",
  },

  badge: {
    height: 32,
    borderRadius: 999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: CYAN,
  },

  badgeText: {
    color: TXT_SOFT,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
  },

  krBig: {
    color: TXT,
    fontSize: 37,
    fontFamily: "NotoSansKR_700Bold",
    marginBottom: 16,
  },

  arrivalCenter: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 36,
  },

  koreanLine: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 20,
    fontWeight: "300",
    letterSpacing: 1.2,
    textAlign: "center",
    marginBottom: 10,
  },

  bigTitle: {
    color: TXT,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -0.8,
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 14,
    maxWidth: 300,
    alignSelf: "center",
  },

  heroCardWrap: {
    marginTop: 34,
  },

  heroCard: {
    borderRadius: 30,
    overflow: "hidden",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.04)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },

  heroEyebrow: {
    color: TXT_SOFT,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
  },

  heroTitle: {
    color: TXT,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  heroText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 10,
  },

  bottomCtaArea: {
    paddingBottom: 20,
  },

  primaryWrap: {
    borderRadius: 999,
    overflow: "hidden",
  },

  primaryButton: {
    height: 60,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  sectionHead: {
    marginTop: 22,
    marginBottom: 18,
  },

  sectionEyebrow: {
    color: TXT_SOFT,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 8,
  },

  sectionTitle: {
    color: TXT,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  sectionText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: "92%",
  },

  scroll: {
    flex: 1,
  },

  sceneList: {
    gap: 14,
    paddingBottom: 10,
  },

  scenePress: {
    borderRadius: 26,
  },

  sceneCardOuter: {
    borderRadius: 26,
  },

  sceneCard: {
    minHeight: 138,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  sceneAccent: {
    position: "absolute",
    top: 16,
    bottom: 16,
    left: 0,
    width: 3,
    borderRadius: 999,
  },

  sceneContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },

  sceneEyebrow: {
    color: TXT_SOFT,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  sceneTitle: {
    color: TXT,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  sceneSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },

  radioWrap: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    alignItems: "center",
    justifyContent: "center",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },

  discreetAction: {
    paddingTop: 2,
    paddingBottom: 2,
    alignSelf: "center",
  },

  discreetActionText: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  basicsCardWrap: {
    marginTop: 6,
    borderRadius: 22,
    overflow: "hidden",
  },

  basicsCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 18,
  },

  basicsPill: {
    alignSelf: "flex-start",
    height: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  basicsPillText: {
    color: TXT_SOFT,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  basicsTitle: {
    color: TXT,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  basicsText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 7,
  },

  bottomBar: {
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  secondaryButton: {
    height: 54,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: TXT_SOFT,
    fontSize: 14,
    fontWeight: "700",
  },

  primaryInlineWrap: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
  },

  primaryInlineButton: {
    height: 54,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  modeList: {
    gap: 14,
    marginTop: 6,
  },

  modePress: {
    borderRadius: 24,
    overflow: "hidden",
  },

  modeCard: {
    minHeight: 104,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    padding: 18,
  },

  modeAccent: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderRadius: 999,
  },

  modeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 8,
  },

  modeTitle: {
    color: TXT,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  modeSubtitle: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 5,
  },

  signatureBadge: {
    height: 28,
    borderRadius: 999,
    paddingHorizontal: 11,
    backgroundColor: "rgba(244,114,182,0.10)",
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },

  signatureText: {
    color: "#FFD9EA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  modeActiveRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
  },

  previewCard: {
    marginTop: 18,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 18,
  },

  previewEyebrow: {
    color: TXT_SOFT,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  previewTitle: {
    color: TXT,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  previewText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13.5,
    lineHeight: 21,
    marginTop: 8,
  },

  transitionPage: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 28,
  },

  transitionGlowWrap: {
    marginBottom: 24,
  },

  transitionGlow: {
    width: 180,
    height: 180,
    borderRadius: 999,
  },

  transitionEyebrow: {
    color: TXT_SOFT,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 10,
  },

  transitionTitle: {
    color: TXT,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  transitionText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
});
