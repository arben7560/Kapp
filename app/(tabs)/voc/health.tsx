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
import { AppMixedText, AppText } from "../../../components/app-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ABSOLUTE_FILL } from "../../../constants/layout";

const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");

// --- DESIGN SYSTEM ---
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const MUTED = "rgba(255,255,255,0.60)";

// --- DATA ---
const ESSENTIALS = [
  { id: "1", kr: "몸", roman: "mom", fr: "corps" },
  { id: "2", kr: "머리", roman: "meori", fr: "tête" },
  { id: "3", kr: "목", roman: "mok", fr: "gorge / cou" },
  { id: "4", kr: "배", roman: "bae", fr: "ventre" },
  { id: "5", kr: "손", roman: "son", fr: "main" },
  { id: "6", kr: "발", roman: "bal", fr: "pied" },
  { id: "7", kr: "눈", roman: "nun", fr: "œil" },
  { id: "8", kr: "병원", roman: "byeongwon", fr: "hôpital" },
];

const PHRASES = [
  { id: "p1", kr: "아파요.", fr: "J’ai mal.", accent: PINK },
  { id: "p2", kr: "머리가 아파요.", fr: "Mal à la tête.", accent: CYAN },
  { id: "p3", kr: "열이 있어요.", fr: "J’ai de la fièvre.", accent: "#A855F7" },
];

const QUIZ_ITEMS = [
  {
    id: "q1",
    prompt: "Quel mot veut dire “corps” ?",
    say: "몸",
    choices: ["몸", "눈"],
    correctIndex: 0,
  },
  {
    id: "q2",
    prompt: "Phrase pour “J’ai mal au ventre” ?",
    say: "배가 아파요",
    choices: ["배가 아파요", "목이 아파요"],
    correctIndex: 0,
  },
];

// --- UTILS ---
const triggerHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: "ko-KR", rate: 0.9 });
};

export default function HealthCyber() {
  const [wordIndex, setWordIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentWord = ESSENTIALS[wordIndex];

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
        setWordIndex((prev) => (prev + 1) % ESSENTIALS.length);
      else
        setWordIndex(
          (prev) => (prev - 1 + ESSENTIALS.length) % ESSENTIALS.length,
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
          colors={["rgba(5,5,8,0.58)", "rgba(15,10,20,0.76)"]}
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
                onPress={() => router.back()}
                style={styles.backCircle}
              >
                <AppText variant="symbol" style={styles.backArrow}>‹</AppText>
              </Pressable>
              <View>
                <AppText variant="sectionLabel" style={styles.navEyebrow}>SÉOUL IMMERSION</AppText>
                <AppText variant="cardTitle" style={styles.navTitle}>Vitalité & Soins</AppText>
              </View>
            </View>

            <View style={styles.heroSection}>
              <AppText variant="screenTitle" style={styles.heroTitle}>Santé</AppText>
              <View style={styles.neonBar} />
            </View>

            {/* --- MAIN INTERACTIVE BIOMETRIC CARD --- */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(244,114,182,0.1)", "transparent"]}
                  style={ABSOLUTE_FILL}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <AppText variant="label" style={styles.liveText}>BIOMETRIC SCAN</AppText>
                  </View>
                  <AppText variant="caption" style={styles.counterText}>
                    {wordIndex + 1} / {ESSENTIALS.length}
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
                    <AppText variant="koreanPrimary" script="korean" style={styles.krBig}>{currentWord.kr}</AppText>
                    <AppText variant="caption" style={styles.romanBig}>{currentWord.roman}</AppText>
                    <AppText variant="cardTitle" style={styles.frBig}>{currentWord.fr}</AppText>
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
                    speakKo(currentWord.kr);
                  }}
                >
                  <LinearGradient
                    colors={[PINK, "#9333EA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.playGradient}
                  >
                    <AppText variant="button" style={styles.playBtnText}>
                      ÉCOUTER
                    </AppText>
                  </LinearGradient>
                </Pressable>
              </BlurView>
            </View>

            {/* --- INSIGHT CARD --- */}
            <BlurView intensity={20} tint="dark" style={styles.insightCard}>
              <View style={[styles.insightAccent, { backgroundColor: PINK }]} />
              <AppText variant="sectionTitle" style={styles.insightTitle}>Protocole Verbal</AppText>
              <AppMixedText variant="body" style={styles.insightText} segments={[
                { text: "Utilisez la particule de sujet \"", script: "latin" },
                { text: "가/이", script: "korean" },
                { text: "\" suivie de \"", script: "latin" },
                { text: "아파요", script: "korean" },
                { text: "\" (afayo) pour indiquer une douleur. Exemple: \"", script: "latin" },
                { text: "머리", script: "korean" },
                { text: "(tête) + ", script: "latin" },
                { text: "가 + 아파요", script: "korean" },
                { text: "\".", script: "latin" },
              ]} />
            </BlurView>

            {/* --- PHRASES SECTION --- */}
            <AppText variant="sectionLabel" style={styles.sectionLabel}>SYMPTÔMES & RÉPONSES</AppText>
            {PHRASES.map((item) => (
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
                    <AppText variant="body" style={{ color: item.accent}}>▶</AppText>
                  </View>
                </BlurView>
              </Pressable>
            ))}

            {/* --- MINI QUIZ SECTION --- */}
            <AppText variant="sectionLabel" style={styles.sectionLabel}>TEST DE DIAGNOSTIC</AppText>
            <BlurView intensity={25} tint="dark" style={styles.quizCard}>
              <AppText variant="bodyStrong" style={styles.quizPrompt}>{QUIZ_ITEMS[1].prompt}</AppText>
              <View style={styles.choiceRow}>
                {QUIZ_ITEMS[1].choices.map((choice, i) => (
                  <Pressable
                    key={i}
                    style={styles.choiceBtn}
                    onPress={() => {
                      triggerHaptic();
                      speakKo(choice);
                    }}
                  >
                    <AppText variant="body" style={styles.choiceText}>{choice}</AppText>
                  </Pressable>
                ))}
              </View>
            </BlurView>

            <View style={{ height: 80 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050508" },
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
    backgroundColor: PINK,
    borderRadius: 2,
    shadowColor: PINK,
    shadowRadius: 12,
    shadowOpacity: 0.8,
  },

  // Main Card
  mainCardContainer: { marginBottom: 30 },
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
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PINK },
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
    textShadowColor: PINK,
    textShadowRadius: 15,
  },
  romanBig: {
    color: PINK,
    marginTop: 4,
  },
  frBig: { color: MUTED, marginTop: 4 },

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

  // Insight Card
  insightCard: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.2)",
    overflow: "hidden",
  },
  insightAccent: {
    position: "absolute",
    left: 0,
    top: 20,
    bottom: 20,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  insightTitle: {
    color: PINK,
    marginBottom: 8,
  },
  insightText: { color: MUTED},

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

  // Quiz Card
  quizCard: {
    padding: 22,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.2)",
    overflow: "hidden",
  },
  quizPrompt: {
    color: "#fff",
    marginBottom: 20,
  },
  choiceRow: { flexDirection: "row", gap: 12 },
  choiceBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  choiceText: { color: PINK},
});
