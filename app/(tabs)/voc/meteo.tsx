import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useRef, useState } from "react";
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

const { width } = Dimensions.get("window");
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
const speakKo = (text) => {
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

  const animateChange = (direction) => {
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
        style={StyleSheet.absoluteFill}
        blurRadius={15}
      >
        <LinearGradient
          colors={["rgba(5,5,12,0.88)", "rgba(10,13,28,0.98)"]}
          style={StyleSheet.absoluteFill}
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
                <Text style={styles.backArrow}>‹</Text>
              </Pressable>
              <View>
                <Text style={styles.navEyebrow}>SÉOUL IMMERSION</Text>
                <Text style={styles.navTitle}>Centre d'apprentissage</Text>
              </View>
            </View>

            {/* Hero Title */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Météo</Text>
              <View style={styles.neonBar} />
            </View>

            {/* Interactive Flashcard */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={65} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.12)", "transparent"]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>IMMERSIVE AUDIO</Text>
                  </View>
                  <Text style={styles.counterText}>
                    {wordIndex + 1} / {WORDS.length}
                  </Text>
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
                    <Text style={styles.krBig}>{currentWord.kr}</Text>
                    <Text style={styles.romanBig}>
                      {currentWord.roman.toUpperCase()}
                    </Text>
                    <View style={styles.translationBadge}>
                      <Text style={styles.frBig}>{currentWord.fr}</Text>
                    </View>
                  </Animated.View>
                </View>

                {/* Control Bar */}
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.navBtnSmall}
                    onPress={() => animateChange(-1)}
                  >
                    <Text style={styles.navBtnIcon}>‹</Text>
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
                      <Text style={styles.playBtnText}>ÉCOUTER</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    style={styles.navBtnSmall}
                    onPress={() => animateChange(1)}
                  >
                    <Text style={styles.navBtnIcon}>›</Text>
                  </Pressable>
                </View>
              </BlurView>
            </View>

            {/* List of phrases */}
            <Text style={styles.sectionLabel}>EXPRESSIONS USUELLES</Text>
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
                    <Text style={styles.phraseKr}>{item.kr}</Text>
                    <Text style={styles.phraseFr}>{item.fr}</Text>
                  </View>
                  <View
                    style={[styles.miniPlayIcon, { borderColor: item.accent }]}
                  >
                    <Text style={{ color: item.accent, fontSize: 10 }}>▶</Text>
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
    gap: 16,
    marginBottom: 24,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  backArrow: { color: "#fff", fontSize: 28, marginTop: -3 },
  navEyebrow: {
    color: PINK,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  navTitle: { color: TXT_SECONDARY, fontSize: 13, fontWeight: "500" },

  // Hero Section
  heroSection: { marginBottom: 32 },
  heroTitle: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "900",
    letterSpacing: -1.5,
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
  liveText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  counterText: { color: MUTED, fontSize: 12, fontWeight: "700" },

  cardBody: { alignItems: "center", justifyContent: "center", minHeight: 180 },
  wordContent: { alignItems: "center" },
  krBig: {
    color: "#fff",
    fontSize: 74,
    fontWeight: "800",
    textShadowColor: "rgba(34, 211, 238, 0.35)",
    textShadowRadius: 15,
  },
  romanBig: {
    color: CYAN,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
    letterSpacing: 4,
  },
  translationBadge: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  frBig: { color: TXT_PRIMARY, fontSize: 16, fontWeight: "500", opacity: 0.9 },

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
  navBtnIcon: { color: "#fff", fontSize: 24, fontWeight: "300" },
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
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  waveContainer: { flexDirection: "row", gap: 3, alignItems: "center" },
  waveBar: { width: 3, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9 },

  // Phrases List Style
  sectionLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
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
  phraseKr: { color: "#fff", fontSize: 17, fontWeight: "700" },
  phraseFr: { color: TXT_SECONDARY, fontSize: 14, marginTop: 4 },
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
