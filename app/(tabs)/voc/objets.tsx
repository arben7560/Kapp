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
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");

// --- DESIGN SYSTEM ---
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const AMBER = "#FFB347";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.60)";

// --- DATA ---
const ESSENTIALS = [
  { id: "1", kr: "휴대폰", roman: "hyudaepon", fr: "téléphone" },
  { id: "2", kr: "지갑", roman: "jigap", fr: "portefeuille" },
  { id: "3", kr: "열쇠", roman: "yeolsoe", fr: "clé(s)" },
  { id: "4", kr: "가방", roman: "gabang", fr: "sac" },
  { id: "5", kr: "우산", roman: "usan", fr: "parapluie" },
  { id: "6", kr: "물", roman: "mul", fr: "eau" },
  { id: "7", kr: "책", roman: "chaek", fr: "livre" },
  { id: "8", kr: "충전기", roman: "chungjeongi", fr: "chargeur" },
];

const PHRASES = [
  { id: "p1", kr: "이거 뭐예요?", fr: "C’est quoi, ça ?", accent: PINK },
  {
    id: "p2",
    kr: "제 휴대폰이에요.",
    fr: "C’est mon téléphone.",
    accent: CYAN,
  },
  {
    id: "p4",
    kr: "열쇠 어디 있어요?",
    fr: "Où sont les clés ?",
    accent: AMBER,
  },
];

const QUIZ_ITEMS = [
  {
    id: "q1",
    prompt: "Quel mot veut dire “parapluie” ?",
    say: "우산",
    choices: ["우산", "지갑"],
    correctIndex: 0,
    explain: "우산 = parapluie. Indispensable pour les averses à Séoul.",
  },
  {
    id: "q2",
    prompt: "Phrase pour “C’est quoi, ça ?”",
    say: "이거 뭐예요?",
    choices: ["이거 뭐예요?", "지갑이 없어요"],
    correctIndex: 0,
    explain: "Phrase de base pour désigner n'importe quel objet.",
  },
];

// --- UTILS ---
const triggerHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: "ko-KR", rate: 0.9 });
};

export default function ObjectsCyber() {
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
        style={StyleSheet.absoluteFill}
        blurRadius={10}
      >
        <LinearGradient
          colors={["rgba(5,5,10,0.85)", "rgba(10,10,30,0.96)"]}
          style={StyleSheet.absoluteFill}
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
                <Text style={styles.backArrow}>‹</Text>
              </Pressable>
              <View>
                <Text style={styles.navEyebrow}>SÉOUL IMMERSION</Text>
                <Text style={styles.navTitle}>Inventaire Quotidien</Text>
              </View>
            </View>

            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Objets</Text>
              <View style={styles.neonBar} />
            </View>

            {/* --- MAIN INTERACTIVE SCANNER CARD --- */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(255,179,71,0.1)", "transparent"]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>OBJECT RECOGNITION</Text>
                  </View>
                  <Text style={styles.counterText}>
                    {wordIndex + 1} / {ESSENTIALS.length}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Pressable
                    style={styles.navBtn}
                    onPress={() => animateChange(-1)}
                  >
                    <BlurView intensity={20} style={styles.navBtnBlur}>
                      <Text style={styles.navBtnText}>‹</Text>
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
                    <Text style={styles.krBig}>{currentWord.kr}</Text>
                    <Text style={styles.romanBig}>{currentWord.roman}</Text>
                    <Text style={styles.frBig}>{currentWord.fr}</Text>
                  </Animated.View>

                  <Pressable
                    style={styles.navBtn}
                    onPress={() => animateChange(1)}
                  >
                    <BlurView intensity={20} style={styles.navBtnBlur}>
                      <Text style={styles.navBtnText}>›</Text>
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
                    colors={[AMBER, "#D97706"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.playGradient}
                  >
                    <Text style={styles.playBtnText}>
                      DÉCODER LA PRONONCIATION
                    </Text>
                  </LinearGradient>
                </Pressable>
              </BlurView>
            </View>

            {/* --- PHRASES SECTION --- */}
            <Text style={styles.sectionLabel}>SITUATIONS RÉELLES</Text>
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

            {/* --- MINI QUIZ SECTION --- */}
            <Text style={styles.sectionLabel}>SYNCHRONISATION NEURALE</Text>
            <BlurView intensity={25} tint="dark" style={styles.quizCard}>
              <Text style={styles.quizPrompt}>{currentQuiz.prompt}</Text>

              <Pressable
                style={styles.quizListenBtn}
                onPress={() => {
                  triggerHaptic();
                  speakKo(currentQuiz.say);
                }}
              >
                <Text style={styles.quizListenText}>🔊 ÉCOUTER LE MOT</Text>
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
                    <Text
                      style={[
                        styles.choiceText,
                        selectedChoice === i && { color: "#fff" },
                      ]}
                    >
                      {choice}
                    </Text>
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
                  <Text style={styles.verifyBtnText}>VÉRIFIER</Text>
                </Pressable>
              ) : (
                <View style={styles.answerArea}>
                  <Text style={styles.explainText}>{currentQuiz.explain}</Text>
                  <Pressable
                    style={styles.nextBtn}
                    onPress={() => {
                      setQuizIndex((prev) => (prev + 1) % QUIZ_ITEMS.length);
                      setSelectedChoice(null);
                      setShowAnswer(false);
                    }}
                  >
                    <Text style={styles.nextBtnText}>CONTINUER ➡️</Text>
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
  backArrow: { color: "#fff", fontSize: 24, marginTop: -2 },
  navEyebrow: {
    color: PINK,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  navTitle: { color: "#fff", fontSize: 14, fontWeight: "600", opacity: 0.8 },

  // Hero
  heroSection: { marginBottom: 35 },
  heroTitle: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "900",
    letterSpacing: -2,
  },
  neonBar: {
    width: 50,
    height: 4,
    backgroundColor: AMBER,
    borderRadius: 2,
    shadowColor: AMBER,
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
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: AMBER },
  liveText: { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  counterText: { color: MUTED, fontSize: 11, fontWeight: "700" },

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
  navBtnText: { color: "#fff", fontSize: 24, fontWeight: "300" },

  wordContent: { flex: 1, alignItems: "center" },
  krBig: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "800",
    textShadowColor: AMBER,
    textShadowRadius: 15,
  },
  romanBig: {
    color: AMBER,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 1.5,
  },
  frBig: { color: MUTED, fontSize: 15, marginTop: 4 },

  bigPlayBtn: {
    height: 58,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 25,
  },
  playGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  playBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  // Phrases
  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
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
  phraseKr: { color: "#fff", fontSize: 16, fontWeight: "700" },
  phraseFr: { color: MUTED, fontSize: 13, marginTop: 3 },
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
    borderColor: "rgba(255,179,71,0.2)",
    overflow: "hidden",
  },
  quizPrompt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
  quizListenText: { color: "#fff", fontSize: 12, fontWeight: "800" },
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
    borderColor: AMBER,
    backgroundColor: "rgba(255,179,71,0.1)",
  },
  choiceText: { color: MUTED, fontWeight: "700", fontSize: 15 },
  verifyBtn: {
    backgroundColor: AMBER,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  verifyBtnText: { color: "#000", fontWeight: "900", letterSpacing: 1 },
  answerArea: { marginTop: 10 },
  explainText: {
    color: MUTED,
    fontSize: 14,
    marginBottom: 15,
    fontStyle: "italic",
  },
  nextBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontWeight: "800" },
});
