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
const AMBER = "#FFB347";
const MUTED = "rgba(255,255,255,0.60)";

// --- DATA ---
const ESSENTIALS = [
  { id: "1", kr: "가족", roman: "gajok", fr: "famille" },
  { id: "2", kr: "부모님", roman: "bumonim", fr: "parents (poli)" },
  { id: "3", kr: "엄마", roman: "eomma", fr: "maman" },
  { id: "4", kr: "아빠", roman: "appa", fr: "papa" },
  { id: "5", kr: "형제", roman: "hyeongje", fr: "frères / sœurs" },
  { id: "6", kr: "오빠", roman: "oppa", fr: "grand frère (femme → homme)" },
  { id: "7", kr: "동생", roman: "dongsaeng", fr: "petit frère / sœur" },
  { id: "8", kr: "딸", roman: "ttal", fr: "fille" },
];

const PHRASES = [
  { id: "p1", kr: "가족이 있어요.", fr: "J’ai une famille.", accent: PINK },
  {
    id: "p3",
    kr: "형제가 있어요?",
    fr: "Tu as des frères/sœurs ?",
    accent: CYAN,
  },
  {
    id: "p5",
    kr: "가족이 몇 명이에요?",
    fr: "Vous êtes combien ?",
    accent: AMBER,
  },
];

const QUIZ_ITEMS = [
  {
    id: "q1",
    prompt: "Quel mot veut dire “petit frère/petite sœur” ?",
    say: "동생",
    choices: ["동생", "부모님"],
    correctIndex: 0,
    explain: "동생 = cadet(te). 부모님 = parents.",
  },
  {
    id: "q3",
    prompt: "Phrase pour “Tu as des frères/sœurs ?”",
    say: "형제가 있어요?",
    choices: ["형제가 있어요?", "가족이 있어요."],
    correctIndex: 0,
    explain: "~가 있어요? = est-ce que tu as… ?",
  },
];

// --- UTILS ---
const triggerHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: "ko-KR", rate: 0.9 });
};

export default function FamilyCyber() {
  const [wordIndex, setWordIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentWord = ESSENTIALS[wordIndex];
  const currentQuiz = QUIZ_ITEMS[quizIndex];

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
          colors={["rgba(7,8,18,0.58)", "rgba(11,15,34,0.76)"]}
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
                <AppText variant="cardTitle" style={styles.navTitle}>Relations & Liens</AppText>
              </View>
            </View>

            <View style={styles.heroSection}>
              <AppText variant="screenTitle" style={styles.heroTitle}>Famille</AppText>
              <View style={styles.neonBar} />
            </View>

            {/* --- MAIN INTERACTIVE CARD --- */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(34,211,238,0.1)", "transparent"]}
                  style={ABSOLUTE_FILL}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <AppText variant="label" style={styles.liveText}>FAMILY SCANNER</AppText>
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
                    colors={[CYAN, "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.playGradient}
                  >
                    <AppText variant="button" style={styles.playBtnText}>ÉCOUTER ET RÉPÉTER</AppText>
                  </LinearGradient>
                </Pressable>
              </BlurView>
            </View>

            {/* --- INSIGHT CARD --- */}
            <BlurView intensity={20} tint="dark" style={styles.insightCard}>
              <View
                style={[styles.insightAccent, { backgroundColor: AMBER }]}
              />
              <AppText variant="sectionTitle" style={styles.insightTitle}>💡 Nuance culturelle</AppText>
              <AppMixedText variant="body" style={styles.insightText} segments={[
                { text: "Les termes comme ", script: "latin" },
                { text: "오빠", script: "korean" },
                { text: " ou ", script: "latin" },
                { text: "형", script: "korean" },
                { text: " dépendent de votre genre. Pas de panique : concentrez-vous d'abord sur ", script: "latin" },
                { text: "부모님", script: "korean" },
                { text: " (parents) et ", script: "latin" },
                { text: "동생", script: "korean" },
                { text: " (cadet).", script: "latin" },
              ]} />
            </BlurView>

            {/* --- PHRASES SECTION --- */}
            <AppText variant="sectionLabel" style={styles.sectionLabel}>CONVERSATION</AppText>
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
                    <AppText variant="button" style={{ color: item.accent}}>▶</AppText>
                  </View>
                </BlurView>
              </Pressable>
            ))}

            {/* --- MINI QUIZ SECTION --- */}
            <AppText variant="sectionLabel" style={styles.sectionLabel}>{"TEST D'ÉCOUTE"}</AppText>
            <BlurView intensity={25} tint="dark" style={styles.quizCard}>
              <AppText variant="bodyStrong" style={styles.quizPrompt}>{currentQuiz.prompt}</AppText>

              <Pressable
                style={styles.quizListenBtn}
                onPress={() => {
                  triggerHaptic();
                  speakKo(currentQuiz.say);
                }}
              >
                <AppText variant="button" style={styles.quizListenText}>🔊 ÉCOUTER LE MOT</AppText>
              </Pressable>

              <View style={styles.choiceColumn}>
                {currentQuiz.choices.map((choice, i) => (
                  <Pressable
                    key={i}
                    style={[
                      styles.choiceBtn,
                      selectedChoice === i && styles.choiceBtnSelected,
                      showAnswer &&
                        i === currentQuiz.correctIndex &&
                        styles.choiceBtnCorrect,
                    ]}
                    onPress={() => {
                      triggerHaptic();
                      setSelectedChoice(i);
                    }}
                    disabled={showAnswer}
                  >
                    <AppText
                      variant="body"
                      style={[
                        styles.choiceText,
                        selectedChoice === i && { color: "#fff" },
                      ]}
                    >
                      {choice}
                    </AppText>
                  </Pressable>
                ))}
              </View>

              {!showAnswer ? (
                <Pressable
                  style={[
                    styles.verifyBtn,
                    selectedChoice === null && { opacity: 0.5 },
                  ]}
                  onPress={() => setShowAnswer(true)}
                  disabled={selectedChoice === null}
                >
                  <AppText variant="button" style={styles.verifyBtnText}>VÉRIFIER</AppText>
                </Pressable>
              ) : (
                <View style={styles.answerArea}>
                  <AppText variant="bodySecondary" style={styles.explainText}>{currentQuiz.explain}</AppText>
                  <Pressable
                    style={styles.nextBtn}
                    onPress={() => {
                      setQuizIndex((prev) => (prev + 1) % QUIZ_ITEMS.length);
                      setSelectedChoice(null);
                      setShowAnswer(false);
                    }}
                  >
                    <AppText variant="button" style={styles.nextBtnText}>SUIVANT ➡️</AppText>
                  </Pressable>
                </View>
              )}
            </BlurView>

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
    backgroundColor: CYAN,
    borderRadius: 2,
    shadowColor: CYAN,
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
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CYAN },
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
    textShadowColor: CYAN,
    textShadowRadius: 15,
  },
  romanBig: {
    color: CYAN,
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
    borderColor: "rgba(255,255,255,0.08)",
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
    color: AMBER,
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
    borderColor: "rgba(34,211,238,0.2)",
    overflow: "hidden",
  },
  quizPrompt: {
    color: "#fff",
    marginBottom: 15,
  },
  quizListenBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  quizListenText: { color: "#fff"},
  choiceColumn: { gap: 10, marginBottom: 20 },
  choiceBtn: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  choiceBtnSelected: {
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  choiceBtnCorrect: {
    borderColor: CYAN,
    backgroundColor: "rgba(34,211,238,0.1)",
  },
  choiceText: { color: MUTED},
  verifyBtn: {
    backgroundColor: CYAN,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  verifyBtnText: { color: "#000"},
  answerArea: { marginTop: 10 },
  explainText: {
    color: MUTED,
    marginBottom: 15,
    fontStyle: "italic",
  },
  nextBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff"},
});
