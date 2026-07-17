import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "../../../components/app-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ABSOLUTE_FILL } from "../../../constants/layout";

// Note: Remplacez par votre chemin d'image local
const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");

// --- DESIGN SYSTEM PREMIUM ---
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const AMBER = "#FFB347";
const TXT_PRIMARY = "rgba(255,255,255,1)";
const TXT_SECONDARY = "rgba(255,255,255,0.80)";
const MUTED = "rgba(255,255,255,0.45)";
const GLASS_BORDER = "rgba(255,255,255,0.15)";

// --- DATA ---
const WORDS = [
  { id: "1", kr: "날씨", roman: "nalssi", fr: "météo" },
  { id: "2", kr: "하늘", roman: "haneul", fr: "ciel" },
  { id: "3", kr: "구름", roman: "gureum", fr: "nuage" },
  { id: "4", kr: "비", roman: "bi", fr: "pluie" },
  { id: "5", kr: "눈", roman: "nun", fr: "neige" },
  { id: "6", kr: "바람", roman: "baram", fr: "vent" },
  { id: "7", kr: "우산", roman: "usan", fr: "parapluie" },
  { id: "8", kr: "해", roman: "hae", fr: "soleil" },
];

const PHRASES = [
  {
    id: "p1",
    kr: "오늘 날씨 어때요?",
    fr: "Quel temps fait-il ?",
    accent: PINK,
  },
  {
    id: "p2",
    kr: "오늘은 맑아요.",
    fr: "Il fait beau aujourd'hui.",
    accent: CYAN,
  },
  { id: "p4", kr: "비가 와요.", fr: "Il pleut.", accent: "#3B82F6" },
  { id: "p7", kr: "오늘은 더워요.", fr: "Il fait chaud.", accent: AMBER },
];

// --- UTILS ---
const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: "ko-KR", rate: 0.85 });
};

const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Medium) =>
  Haptics.impactAsync(style);

// --- MINI COMPONENT: AUDIO VISUALIZER ---
const AudioVisualizer = () => (
  <View style={styles.waveContainer}>
    {[1, 2, 3, 4].map((i) => (
      <View
        key={i}
        style={[styles.waveBar, { height: 8 + Math.random() * 12 }]}
      />
    ))}
  </View>
);

export default function MeteoCyberScreen() {
  const [wordIndex, setWordIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentWord = WORDS[wordIndex];

  const animateChange = (direction: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction * 25,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 1) setWordIndex((prev) => (prev + 1) % WORDS.length);
      else setWordIndex((prev) => (prev - 1 + WORDS.length) % WORDS.length);

      slideAnim.setValue(direction * -25);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={ABSOLUTE_FILL}
        blurRadius={4}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(5,5,12,0.58)", "rgba(10,13,28,0.76)"]}
          style={ABSOLUTE_FILL}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Navigation Header */}
            <View style={styles.topNav}>
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  router.back();
                }}
                style={styles.backCircle}
              >
                <AppText variant="symbol" style={styles.backArrow}>‹</AppText>
              </Pressable>
              <View>
                <AppText variant="sectionLabel" style={styles.navEyebrow}>SÉOUL IMMERSION</AppText>
                <AppText variant="cardTitle" style={styles.navTitle}>{"Centre d'apprentissage"}</AppText>
              </View>
            </View>

            {/* Hero Title */}
            <View style={styles.heroSection}>
              <AppText variant="screenTitle" style={styles.heroTitle}>Météo</AppText>
              <View style={styles.neonBar} />
            </View>

            {/* Interactive Flashcard */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={65} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.12)", "transparent"]}
                  style={ABSOLUTE_FILL}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <AppText variant="label" style={styles.liveText}>IMMERSIVE AUDIO</AppText>
                  </View>
                  <AppText variant="caption" style={styles.counterText}>
                    {wordIndex + 1} / {WORDS.length}
                  </AppText>
                </View>

                <View style={styles.cardBody}>
                  <Animated.View
                    style={[
                      styles.wordContent,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                      },
                    ]}
                  >
                    <AppText variant="koreanPrimary" script="korean" style={styles.krBig}>{currentWord.kr}</AppText>
                    <AppText variant="caption" style={styles.romanBig}>
                      {currentWord.roman.toUpperCase()}
                    </AppText>
                    <View style={styles.translationBadge}>
                      <AppText variant="cardTitle" style={styles.frBig}>{currentWord.fr}</AppText>
                    </View>
                  </Animated.View>
                </View>

                {/* Control Bar */}
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.navBtnSmall}
                    onPress={() => animateChange(-1)}
                  >
                    <AppText variant="symbol" style={styles.navBtnIcon}>‹</AppText>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.mainPlayBtn,
                      pressed && { transform: [{ scale: 0.97 }] },
                    ]}
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
                      speakKo(currentWord.kr);
                    }}
                  >
                    <LinearGradient
                      colors={[CYAN, "#3B82F6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.playGradient}
                    >
                      <AudioVisualizer />
                      <AppText variant="button" style={styles.playBtnText}>ÉCOUTER</AppText>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    style={styles.navBtnSmall}
                    onPress={() => animateChange(1)}
                  >
                    <AppText variant="symbol" style={styles.navBtnIcon}>›</AppText>
                  </Pressable>
                </View>
              </BlurView>
            </View>

            {/* List of phrases */}
            <AppText variant="sectionLabel" style={styles.sectionLabel}>EXPRESSIONS USUELLES</AppText>
            {PHRASES.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.phraseItem,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  triggerHaptic();
                  speakKo(item.kr);
                }}
              >
                <BlurView intensity={30} tint="dark" style={styles.phraseBlur}>
                  <View
                    style={[
                      styles.phraseAccent,
                      { backgroundColor: item.accent },
                    ]}
                  />
                  <View style={styles.phraseTextContainer}>
                    <AppText variant="koreanSecondary" script="korean" style={styles.phraseKr}>{item.kr}</AppText>
                    <AppText variant="bodySecondary" style={styles.phraseFr}>{item.fr}</AppText>
                  </View>
                  <View
                    style={[styles.miniPlayIcon, { borderColor: item.accent }]}
                  >
                    <AppText variant="label" style={{ color: item.accent}}>▶</AppText>
                  </View>
                </BlurView>
              </Pressable>
            ))}

            <View style={{ height: 80 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050508" },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12 },

  // Header Style
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  backArrow: { color: "#fff", marginTop: -2 },
  navEyebrow: {
    color: PINK,
  },
  navTitle: { color: "#fff", opacity: 0.8 },

  // Hero Section
  heroSection: { marginBottom: 32 },
  heroTitle: {
    color: "#fff",
  },
  neonBar: {
    width: 45,
    height: 4,
    backgroundColor: CYAN,
    borderRadius: 2,
    shadowColor: CYAN,
    shadowRadius: 12,
    shadowOpacity: 0.8,
  },

  // Main Interactive Card
  mainCardContainer: { marginBottom: 38 },
  glassCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  liveText: { color: "#fff"},
  counterText: { color: MUTED},

  cardBody: { alignItems: "center", justifyContent: "center", minHeight: 180 },
  wordContent: { alignItems: "center" },
  krBig: {
    color: "#fff",
    textShadowColor: "rgba(34, 211, 238, 0.35)",
    textShadowRadius: 15,
  },
  romanBig: {
    color: CYAN,
    marginTop: 6,
  },
  translationBadge: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  frBig: { color: TXT_PRIMARY, opacity: 0.9 },

  // Action Buttons
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
  },
  navBtnSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  navBtnIcon: { color: "#fff"},
  mainPlayBtn: {
    flex: 1,
    height: 56,
    marginHorizontal: 14,
    borderRadius: 18,
    overflow: "hidden",
  },
  playGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  playBtnText: {
    color: "#fff",
  },
  waveContainer: { flexDirection: "row", gap: 3, alignItems: "center" },
  waveBar: { width: 3, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9 },

  // Phrases List Style
  sectionLabel: {
    color: MUTED,
    marginBottom: 16,
    marginLeft: 4,
  },
  phraseItem: {
    marginBottom: 14,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  phraseBlur: { flexDirection: "row", alignItems: "center", padding: 18 },
  phraseAccent: {
    width: 4,
    height: "60%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  phraseTextContainer: { flex: 1, marginLeft: 12 },
  phraseKr: { color: "#fff"},
  phraseFr: { color: TXT_SECONDARY, marginTop: 4 },
  miniPlayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
