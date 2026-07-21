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
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "../../../components/app-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ABSOLUTE_FILL } from "../../../constants/layout";

const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");

// --- DESIGN SYSTEM ---
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const PURPLE = "#A855F7";
const MUTED = "rgba(255,255,255,0.60)";

// --- DATA ---
const MOOD_ESSENTIALS = [
  {
    id: "1",
    kr: "기분이 좋아요",
    roman: "gibuni joayo",
    fr: "Je me sens bien",
  },
  {
    id: "2",
    kr: "조금 피곤해요",
    roman: "jogeum pigonhaeyo",
    fr: "Je suis fatigué",
  },
  { id: "3", kr: "긴장돼요", roman: "ginjangdwaeyo", fr: "Je suis nerveux" },
  {
    id: "4",
    kr: "마음이 편해요",
    roman: "maeumi pyeonhaeyo",
    fr: "Je suis apaisé",
  },
];

const PERSONALITY = [
  { id: "p1", kr: "차분한 편이에요", fr: "Plutôt calme", accent: PURPLE },
  { id: "p2", kr: "조용한 편이에요", fr: "Plutôt discret", accent: CYAN },
  { id: "p3", kr: "낯을 좀 가려요", fr: "Un peu réservé", accent: PINK },
];

const CONTEXT_PHRASES = [
  {
    id: "c1",
    kr: "오늘은 기분이 좀 좋아요",
    fr: "Aujourd'hui je me sens bien.",
    accent: CYAN,
  },
  {
    id: "c2",
    kr: "처음에는 좀 긴장돼요",
    fr: "Au début je suis nerveux.",
    accent: PURPLE,
  },
  {
    id: "c3",
    kr: "낯을 좀 가리지만 친해지면 괜찮아요",
    fr: "Réservé, mais ça va après.",
    accent: PINK,
  },
];

// --- UTILS ---
const triggerHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: "ko-KR", rate: 0.9 });
};

export default function EmotionCyber() {
  const [wordIndex, setWordIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentMood = MOOD_ESSENTIALS[wordIndex];

  const animateChange = (direction: number) => {
    triggerHaptic();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction * 25,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 1)
        setWordIndex((prev) => (prev + 1) % MOOD_ESSENTIALS.length);
      else
        setWordIndex(
          (prev) =>
            (prev - 1 + MOOD_ESSENTIALS.length) % MOOD_ESSENTIALS.length,
        );

      slideAnim.setValue(direction * -25);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={ABSOLUTE_FILL}
        blurRadius={4}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(7,8,18,0.58)", "rgba(20,10,35,0.76)"]}
          style={ABSOLUTE_FILL}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Navigation */}
            <View style={styles.topNav}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backCircle}
              >
                <AppText variant="symbol" style={styles.backArrow}>‹</AppText>
              </Pressable>
              <View>
                <AppText variant="sectionLabel" style={styles.navEyebrow}>SÉOUL IMMERSION</AppText>
                <AppText variant="cardTitle" style={styles.navTitle}>Neural Mood Map</AppText>
              </View>
            </View>

            <View style={styles.heroSection}>
              <AppText variant="screenTitle" style={styles.heroTitle}>Émotions</AppText>
              <View style={styles.neonBar} />
            </View>

            {/* --- MAIN INTERACTIVE EMOTION CARD --- */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(168,85,247,0.15)", "transparent"]}
                  style={ABSOLUTE_FILL}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <AppText variant="label" style={styles.liveText}>EMOTIVE SCANNER</AppText>
                  </View>
                  <AppText variant="caption" style={styles.counterText}>
                    {wordIndex + 1} / {MOOD_ESSENTIALS.length}
                  </AppText>
                </View>

                <View style={styles.cardBody}>
                  <Pressable
                    style={styles.navBtn}
                    onPress={() => animateChange(-1)}
                  >
                    <BlurView intensity={20} style={styles.navBtnBlur}>
                      <AppText variant="symbol" style={styles.navBtnText}>‹</AppText>
                    </BlurView>
                  </Pressable>

                  <Animated.View
                    style={[
                      styles.wordContent,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                      },
                    ]}
                  >
                    <AppText variant="koreanPrimary" script="korean" style={styles.krBig}>{currentMood.kr}</AppText>
                    <AppText variant="caption" style={styles.romanBig}>{currentMood.roman}</AppText>
                    <AppText variant="cardTitle" style={styles.frBig}>{currentMood.fr}</AppText>
                  </Animated.View>

                  <Pressable
                    style={styles.navBtn}
                    onPress={() => animateChange(1)}
                  >
                    <BlurView intensity={20} style={styles.navBtnBlur}>
                      <AppText variant="symbol" style={styles.navBtnText}>›</AppText>
                    </BlurView>
                  </Pressable>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.bigPlayBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    speakKo(currentMood.kr);
                  }}
                >
                  <LinearGradient
                    colors={[PURPLE, PINK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.playGradient}
                  >
                    <AppText variant="button" style={styles.playBtnText}>ÉCOUTER</AppText>
                  </LinearGradient>
                </Pressable>
              </BlurView>
            </View>

            {/* --- TAGS PILLS --- */}
            <View style={styles.pillsRow}>
              <View style={[styles.pill, { borderColor: PINK }]}>
                <AppText variant="label" style={[styles.pillText, { color: PINK }]}>Premium</AppText>
              </View>
              <View style={[styles.pill, { borderColor: CYAN }]}>
                <AppText variant="label" style={[styles.pillText, { color: CYAN }]}>
                  Oral Naturel
                </AppText>
              </View>
              <View style={[styles.pill, { borderColor: PURPLE }]}>
                <AppText variant="label" style={[styles.pillText, { color: PURPLE }]}>
                  Introspectif
                </AppText>
              </View>
            </View>

            {/* --- PERSONALITY SECTION --- */}
            <AppText variant="sectionLabel" style={styles.sectionLabel}>PERSONNALITÉ & TENDANCES</AppText>
            {PERSONALITY.map((item) => (
              <Pressable
                key={item.id}
                style={styles.phraseItem}
                onPress={() => {
                  triggerHaptic();
                  speakKo(item.kr);
                }}
              >
                <BlurView intensity={20} tint="dark" style={styles.phraseBlur}>
                  <View
                    style={[
                      styles.phraseAccentLine,
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
                    <AppText variant="bodySecondary" style={{ color: item.accent}}>▶</AppText>
                  </View>
                </BlurView>
              </Pressable>
            ))}

            {/* --- CONTEXT PHRASES SECTION --- */}
            <AppText variant="sectionLabel" style={[styles.sectionLabel, { marginTop: 20 }]}>
              MINI PHRASES RÉELLES
            </AppText>
            {CONTEXT_PHRASES.map((item) => (
              <Pressable
                key={item.id}
                style={styles.phraseItem}
                onPress={() => {
                  triggerHaptic();
                  speakKo(item.kr);
                }}
              >
                <BlurView intensity={20} tint="dark" style={styles.phraseBlur}>
                  <View
                    style={[
                      styles.phraseAccentLine,
                      { backgroundColor: item.accent },
                    ]}
                  />
                  <View style={styles.phraseTextContainer}>
                    <AppText variant="koreanSecondary" script="korean" style={styles.phraseKr}>
                      {item.kr}
                    </AppText>
                    <AppText variant="bodySecondary" style={styles.phraseFr}>{item.fr}</AppText>
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
  container: { flex: 1, backgroundColor: "#070812" },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },

  // Header
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

  // Hero
  heroSection: { marginBottom: 35 },
  heroTitle: {
    color: "#fff",
  },
  neonBar: {
    width: 50,
    height: 4,
    backgroundColor: PURPLE,
    borderRadius: 2,
    shadowColor: PURPLE,
    shadowRadius: 12,
    shadowOpacity: 0.8,
  },

  // Main Card
  mainCardContainer: { marginBottom: 25 },
  glassCard: {
    borderRadius: 35,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PURPLE },
  liveText: { color: "#fff"},
  counterText: { color: MUTED},

  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  navBtnBlur: { flex: 1, alignItems: "center", justifyContent: "center" },
  navBtnText: { color: "#fff"},

  wordContent: { flex: 1, alignItems: "center" },
  krBig: {
    color: "#fff",
    textShadowColor: PURPLE,
    textShadowRadius: 15,
    textAlign: "center",
  },
  romanBig: {
    color: PURPLE,
    marginTop: 6,
  },
  frBig: { color: MUTED, marginTop: 4, textAlign: "center" },

  bigPlayBtn: {
    height: 58,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 25,
  },
  playGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  playBtnText: {
    color: "#fff",
  },

  // Pills
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  pillText: { },

  // Phrases
  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    marginBottom: 15,
  },
  phraseItem: {
    marginBottom: 12,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  phraseBlur: { flexDirection: "row", alignItems: "center", padding: 18 },
  phraseAccentLine: {
    width: 3,
    height: "100%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  phraseTextContainer: { flex: 1, marginLeft: 10 },
  phraseKr: { color: "#fff"},
  phraseFr: { color: MUTED, marginTop: 3 },
  miniPlayIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
});
