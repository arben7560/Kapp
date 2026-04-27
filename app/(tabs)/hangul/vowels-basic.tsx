import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Image de fond typée "Séoul de nuit / Cyber"
const BACKGROUND_SOURCE = require("../../../assets/images/hangul-bg.png");

const COLORS = {
  bg: "#020306",
  hangulCyan: "#22D3EE",
  premiumGold: "#FDE047",
  successGreen: "#4ADE80",
  errorRed: "#F87171",
  pureWhite: "#F8FAFC",
  txt: "rgba(255,255,255,0.98)",
  muted: "rgba(255,255,255,0.75)",
  pink: "#F472B6",
};

type Expression = {
  id: string;
  word: string;
  rom: string;
  mean: string;
  context: string;
  type: "vowel" | "rule" | "word";
  speak: string;
  symbolic?: string; // Cheon-Ji-In Logic
  strokeSteps?: number;
};

type Scene = {
  id: string;
  title: string;
  koreanTitle: string;
  description: string;
  accent: string;
  curiosityHook: string;
  instruction: string;
  teaser: string;
  expressions: Expression[];
};

type QuizQuestion = {
  expression: Expression;
  options: string[];
  correctAnswer: string;
  questionType: "meaning" | "sound";
};

const SCENES: Scene[] = [
  {
    id: "basic_vowels",
    title: "Origine Zen",
    koreanTitle: "천지인 (Cheon-Ji-In)",
    description:
      "Le Hangeul mime l'univers : le Ciel (·), la Terre (ㅡ) et l'Homme (ㅣ).",
    accent: COLORS.hangulCyan,
    curiosityHook:
      "Chaque voyelle est une combinaison de ces 3 éléments sacrés. Rien n'est décoratif.",
    instruction:
      "Touche une voyelle pour entendre son âme et comprendre sa forme.",
    teaser:
      "Impressionnant ! Tu maîtrises les éléments. Voyons comment les protéger avec le 'Gardien Silencieux'.",
    expressions: [
      {
        id: "v-i",
        word: "ㅣ",
        rom: "i",
        mean: "L'Homme",
        symbolic: "Un être humain debout entre ciel et terre.",
        context: "Son direct : 'i' comme dans 'Idée'.",
        type: "vowel",
        speak: "이",
        strokeSteps: 1,
      },
      {
        id: "v-eu",
        word: "ㅡ",
        rom: "eu",
        mean: "La Terre",
        symbolic: "L'horizon plat, le sol sur lequel on marche.",
        context: "Son neutre : 'eu' comme dans 'Oeuf'.",
        type: "vowel",
        speak: "으",
        strokeSteps: 1,
      },
      {
        id: "v-a",
        word: "ㅏ",
        rom: "a",
        mean: "Homme + Ciel",
        symbolic: "Le soleil (point) se lève à l'Est de l'homme.",
        context: "Son ouvert : 'a' comme dans 'Ami'.",
        type: "vowel",
        speak: "아",
        strokeSteps: 2,
      },
      {
        id: "v-eo",
        word: "ㅓ",
        rom: "eo",
        mean: "Ciel + Homme",
        symbolic: "Le soleil se couche à l'Ouest de l'homme.",
        context: "Son profond : 'o' ouvert (comme 'Pomme').",
        type: "vowel",
        speak: "어",
        strokeSteps: 2,
      },
      {
        id: "v-o",
        word: "ㅗ",
        rom: "o",
        mean: "Ciel sur Terre",
        symbolic: "Le soleil brille au-dessus de l'horizon.",
        context: "Son fermé : 'o' comme dans 'Vélo'.",
        type: "vowel",
        speak: "오",
        strokeSteps: 2,
      },
      {
        id: "v-u",
        word: "ㅜ",
        rom: "u",
        mean: "Ciel sous Terre",
        symbolic: "L'eau qui coule sous l'horizon.",
        context: "Son 'ou' : comme dans 'Loup'.",
        type: "vowel",
        speak: "우",
        strokeSteps: 2,
      },
    ],
  },
  {
    id: "silent_guardian",
    title: "Le Gardien",
    koreanTitle: "이응 (ㅇ)",
    description:
      "Une voyelle ne reste jamais seule. Le cercle 'ㅇ' est son support invisible.",
    accent: COLORS.premiumGold,
    curiosityHook:
      "Au début d'une syllabe, ce cercle est muet. Il sert de 'garde du corps' graphique.",
    instruction:
      "Observe comment la voyelle devient une syllabe complète et lisible.",
    teaser:
      "Parfait. Ton œil est prêt. Assemblons maintenant ces blocs pour tes premiers mots.",
    expressions: [
      {
        id: "g-a",
        word: "아",
        rom: "a",
        mean: "A (Complet)",
        context: "Le gardien se place à gauche des voyelles verticales.",
        type: "rule",
        speak: "아",
        strokeSteps: 3,
      },
      {
        id: "g-eo",
        word: "어",
        rom: "eo",
        mean: "EO (Complet)",
        context: "Le gardien se place à gauche des voyelles verticales.",
        type: "rule",
        speak: "어",
        strokeSteps: 3,
      },
      {
        id: "g-o",
        word: "오",
        rom: "o",
        mean: "O (Complet)",
        context: "Le gardien se place au-dessus des voyelles horizontales.",
        type: "rule",
        speak: "오",
        strokeSteps: 3,
      },
      {
        id: "g-u",
        word: "우",
        rom: "u",
        mean: "U (Complet)",
        context: "Le gardien se place au-dessus des voyelles horizontales.",
        type: "rule",
        speak: "우",
        strokeSteps: 3,
      },
      {
        id: "g-eu",
        word: "으",
        rom: "eu",
        mean: "EU (Complet)",
        context: "Le gardien se place au-dessus des voyelles horizontales.",
        type: "rule",
        speak: "으",
        strokeSteps: 2,
      },
      {
        id: "g-i",
        word: "이",
        rom: "i",
        mean: "I (Complet)",
        context: "Simple, élégant, protégé par son gardien.",
        type: "rule",
        speak: "이",
        strokeSteps: 2,
      },
    ],
  },
  {
    id: "first_words",
    title: "Premiers Mots",
    koreanTitle: "첫 단어",
    description:
      "Tu ne lis plus des traits, tu lis du sens. C'est ici que l'aventure commence.",
    accent: COLORS.pink,
    curiosityHook:
      "Avec seulement 6 voyelles et un cercle muet, tu peux déjà nommer le monde.",
    instruction: "Écoute la mélodie des syllabes combinées.",
    teaser:
      "C'est une victoire ! Tu es prêt à débloquer les consonnes pour lire 100% de Séoul.",
    expressions: [
      {
        id: "w-ai",
        word: "아이",
        rom: "a-i",
        mean: "Enfant",
        context: "Combinaison de 'A' et 'I'.",
        type: "word",
        speak: "아이",
      },
      {
        id: "w-oi",
        word: "오이",
        rom: "o-i",
        mean: "Concombre",
        context: "Un mot frais, typique des marchés coréens.",
        type: "word",
        speak: "오이",
      },
      {
        id: "w-ua",
        word: "우아",
        rom: "u-a",
        mean: "Élégant",
        context: "Se dit d'une chose pleine de grâce.",
        type: "word",
        speak: "우아",
      },
    ],
  },
];

const generateQuiz = (scene: Scene): QuizQuestion[] => {
  const allExpressions = SCENES.flatMap((s) => s.expressions);
  return scene.expressions.map((exp) => {
    const useSound = Math.random() > 0.5;
    const correct = useSound ? exp.rom : exp.mean;
    const distractors = allExpressions
      .filter((e) => e.id !== exp.id)
      .map((e) => (useSound ? e.rom : e.mean))
      .filter((v, i, arr) => arr.indexOf(v) === i && v !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    while (distractors.length < 2) distractors.push(useSound ? "..." : "Autre");
    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
    return {
      expression: exp,
      options,
      correctAnswer: correct,
      questionType: useSound ? "sound" : "meaning",
    };
  });
};

const getQuizResultMessage = (score: number, total: number) => {
  if (total <= 0) return "RÉVISION EN COURS";
  if (score === total) return "MAÎTRISE PARFAITE";

  const ratio = score / total;

  if (ratio >= 0.8) return "TRÈS BONNE MAÎTRISE";
  if (ratio >= 0.6) return "BONNE PROGRESSION";
  if (ratio >= 0.4) return "BASES EN CONSTRUCTION";
  return "ON REPREND EN DOUCEUR";
};

export default function HybridHangulExperience() {
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [ambientMode, setAmbientMode] = useState(false);
  const [masteredScenes, setMasteredScenes] = useState<Record<string, boolean>>(
    {},
  );
  const [showTeaser, setShowTeaser] = useState<Record<string, boolean>>({});
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const quizSlideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
    Speech.stop();
  }, [activeScene]);

  const currentCompleted = Object.keys(completedItems).length;
  const totalToComplete = SCENES.reduce(
    (acc, s) => acc + s.expressions.length,
    0,
  );

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ko-KR", rate: 0.75, pitch: 1 });
  };

  const startQuiz = () => {
    setQuizQuestions(generateQuiz(activeScene));
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(null);
    setQuizComplete(false);
    setQuizActive(true);
    Animated.spring(quizSlideAnim, {
      toValue: 0,
      tension: 50,
      friction: 9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressItem = (exp: Expression) => {
    const isFirstTime = !completedItems[exp.id];
    speak(exp.speak);
    Vibration.vibrate(isFirstTime ? [0, 20, 10, 20] : 8);
    const newCompleted = { ...completedItems, [exp.id]: true };
    setCompletedItems(newCompleted);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.03,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (
      isFirstTime &&
      activeScene.expressions.every((e) => newCompleted[e.id]) &&
      !masteredScenes[activeScene.id]
    ) {
      setTimeout(() => startQuiz(), 1000);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (quizAnswered !== null) return;
    const isCorrect = answer === quizQuestions[quizIndex].correctAnswer;
    setQuizAnswered(answer);

    if (isCorrect) {
      setQuizScore((s) => s + 1);
      Vibration.vibrate(15);
    } else {
      Vibration.vibrate([0, 60]);
      setTimeout(() => speak(quizQuestions[quizIndex].expression.speak), 400);
    }

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex((i) => i + 1);
        setQuizAnswered(null);
      } else {
        setQuizComplete(true);
        setMasteredScenes((p) => ({ ...p, [activeScene.id]: true }));
        setShowTeaser((p) => ({ ...p, [activeScene.id]: true }));
      }
    }, 900);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bg}>
        <LinearGradient
          colors={["rgba(2,3,6,0.62)", "rgba(2,3,6,0.82)", "rgba(2,3,6,0.92)"]}
          style={StyleSheet.absoluteFillObject}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Top Bar */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>MORPHOLOGIE</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAmbientMode(!ambientMode);
                Vibration.vibrate(5);
              }}
              style={[
                styles.premiumToggle,
                ambientMode && styles.premiumToggleActive,
              ]}
            >
              <Text style={styles.premiumToggleText}>
                {ambientMode ? "✨ SOUND ON" : "🔇 FOCUS"}
              </Text>
            </Pressable>
          </View>

          {/* Hero Section */}
          <View style={styles.heroIntro}>
            <View style={styles.progressRow}>
              <View style={styles.miniProgressBg}>
                <View
                  style={[
                    styles.miniProgressFill,
                    {
                      width: `${(currentCompleted / totalToComplete) * 100}%`,
                      backgroundColor: activeScene.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentCompleted}/{totalToComplete}
              </Text>
            </View>
            <Text style={[styles.eyebrow, { color: activeScene.accent }]}>
              SÉOUL IMMERSION
            </Text>
          </View>

          {/* Stepper Tabs */}
          <View style={styles.tabBar}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    borderColor: scene.accent,
                    backgroundColor: "rgba(255,255,255,0.12)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.title}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Narrative Content Card */}
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
          >
            <BlurView intensity={70} tint="dark" style={styles.mainCard}>
              <Text style={styles.toolboxSceneTitle}>{activeScene.title}</Text>
              <View
                style={[
                  styles.hookBanner,
                  { borderColor: `${activeScene.accent}30` },
                ]}
              >
                <Text style={styles.hookText}>
                  💡 {activeScene.curiosityHook}
                </Text>
              </View>
              <Text style={[styles.krTitle, { color: activeScene.accent }]}>
                {activeScene.koreanTitle}
              </Text>
              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <View
                style={[
                  styles.instructionBox,
                  { borderLeftColor: activeScene.accent },
                ]}
              >
                <Text style={styles.instructionText}>
                  {activeScene.instruction}
                </Text>
              </View>
            </BlurView>
          </Animated.View>

          {/* Alphabet Toolbox / Items Grid */}
          <View style={styles.grid}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.sectionTitle}>ALPHABET TOOLBOX</Text>
            </View>
            {activeScene.expressions.map((exp) => (
              <Pressable
                key={exp.id}
                onPress={() => handlePressItem(exp)}
                style={styles.cardWrapper}
              >
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={[
                    styles.expCard,
                    completedItems[exp.id] && {
                      borderColor: activeScene.accent,
                    },
                  ]}
                >
                  <View style={styles.expCardMain}>
                    <Text
                      style={[
                        styles.expWord,
                        {
                          color: completedItems[exp.id]
                            ? activeScene.accent
                            : COLORS.pureWhite,
                        },
                      ]}
                    >
                      {exp.word}
                    </Text>
                    <View style={styles.expCardRight}>
                      {exp.strokeSteps && (
                        <View style={styles.strokeBadge}>
                          <Text style={styles.strokeText}>
                            {exp.strokeSteps} TRAITS
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.romBox,
                          { backgroundColor: `${activeScene.accent}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.romText,
                            { color: activeScene.accent },
                          ]}
                        >
                          {exp.rom}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {completedItems[exp.id] && (
                    <View style={styles.expDetail}>
                      <Text style={styles.expSymbolic}>
                        {exp.symbolic || "Composition Syllabique"}
                      </Text>
                      <Text style={styles.expMean}>{exp.mean}</Text>
                      <Text style={styles.expCtx}>{exp.context}</Text>
                    </View>
                  )}
                </BlurView>
              </Pressable>
            ))}
          </View>

          {/* Teaser / Next Step */}
          {showTeaser[activeScene.id] && (
            <Pressable
              onPress={() => {
                const nextIdx =
                  SCENES.findIndex((s) => s.id === activeScene.id) + 1;
                if (nextIdx < SCENES.length) setActiveScene(SCENES[nextIdx]);
              }}
              style={styles.teaserBox}
            >
              <Text style={styles.teaserText}>✨ {activeScene.teaser}</Text>
              <Text style={[styles.teaserBtn, { color: activeScene.accent }]}>
                DÉBLOQUER LA SUITE →
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Quiz Overlay (Dopamine Loop) */}
        {quizActive && (
          <BlurView intensity={100} tint="dark" style={styles.quizOverlay}>
            <Animated.View
              style={[
                styles.quizSheet,
                { transform: [{ translateY: quizSlideAnim }] },
              ]}
            >
              {!quizComplete ? (
                <>
                  <Text style={styles.quizTitle}>DÉFI DE MÉMORISATION</Text>
                  <View style={styles.quizQBox}>
                    <Text
                      style={[styles.quizChar, { color: activeScene.accent }]}
                    >
                      {quizQuestions[quizIndex]?.expression.word}
                    </Text>
                    <Text style={styles.quizInstruction}>
                      Quelle est la signification correcte ?
                    </Text>
                  </View>
                  <View style={styles.optionsGrid}>
                    {quizQuestions[quizIndex]?.options.map((opt, i) => (
                      <Pressable
                        key={i}
                        onPress={() => handleQuizAnswer(opt)}
                        style={[
                          styles.optBtn,
                          quizAnswered === opt &&
                            (opt === quizQuestions[quizIndex].correctAnswer
                              ? styles.optCorrect
                              : styles.optWrong),
                        ]}
                      >
                        <Text style={styles.optText}>{opt}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.resultBox}>
                  <Text style={styles.resultIcon}>🌟</Text>
                  <Text style={styles.resultTitle}>
                    {getQuizResultMessage(quizScore, quizQuestions.length)}
                  </Text>
                  <Text style={styles.resultScore}>
                    {quizScore} / {quizQuestions.length} réponses correctes
                  </Text>
                  <Pressable
                    onPress={() => setQuizActive(false)}
                    style={[
                      styles.closeBtn,
                      { backgroundColor: activeScene.accent },
                    ]}
                  >
                    <Text style={styles.closeBtnText}>
                      CONTINUER L'IMMERSION
                    </Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </BlurView>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 120 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 32, marginRight: 5 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  premiumToggle: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  premiumToggleActive: {
    backgroundColor: COLORS.premiumGold,
    borderColor: COLORS.premiumGold,
  },
  premiumToggleText: {
    color: "#FFF",
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
  },
  heroIntro: { marginBottom: 25 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  miniProgressBg: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    marginRight: 12,
  },
  miniProgressFill: { height: "100%", borderRadius: 2 },
  progressText: {
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.txt,
    fontSize: 38,
    letterSpacing: -1.2,
  },
  tabBar: { flexDirection: "row", gap: 10, marginBottom: 28 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: COLORS.muted,
  },
  mainCard: {
    padding: 25,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  hookBanner: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  hookText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Outfit_500Medium",
  },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 13,
    letterSpacing: 3,
    marginBottom: 12,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 22,
  },
  instructionBox: { paddingLeft: 18, borderLeftWidth: 4 },
  instructionText: {
    color: COLORS.txt,
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
    fontStyle: "italic",
  },
  grid: { marginTop: 35, gap: 18 },
  toolboxHeader: { marginBottom: 8 },
  toolboxSceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    letterSpacing: 3,
  },
  cardWrapper: { width: "100%" },
  expCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  expCardMain: {
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expCardRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  strokeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  strokeText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
  },
  romBox: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  romText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
  expDetail: {
    padding: 22,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  expSymbolic: {
    color: COLORS.pink,
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    marginTop: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 4,
  },
  expCtx: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  teaserBox: {
    marginTop: 30,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    borderDashArray: [5, 5],
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  teaserText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Outfit_500Medium",
  },
  teaserBtn: {
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
    letterSpacing: 1,
  },
  quizOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  quizSheet: {
    backgroundColor: "#080A12",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 35,
    paddingBottom: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  quizTitle: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 25,
  },
  quizQBox: { alignItems: "center", marginBottom: 35 },
  quizChar: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  quizInstruction: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 12,
  },
  optionsGrid: { gap: 15 },
  optBtn: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  optText: {
    color: COLORS.txt,
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  optCorrect: {
    borderColor: COLORS.successGreen,
    backgroundColor: "rgba(74,222,128,0.12)",
  },
  optWrong: {
    borderColor: COLORS.errorRed,
    backgroundColor: "rgba(248,113,113,0.12)",
  },
  resultBox: { alignItems: "center", paddingVertical: 30 },
  resultIcon: { fontSize: 70, marginBottom: 20 },
  resultTitle: {
    color: COLORS.pureWhite,
    fontSize: 28,
    fontFamily: "Outfit_900Black",
    letterSpacing: -0.5,
  },
  resultScore: {
    color: COLORS.muted,
    fontSize: 17,
    marginVertical: 12,
    fontFamily: "Outfit_500Medium",
  },
  closeBtn: {
    marginTop: 25,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 24,
    elevation: 10,
  },
  closeBtnText: {
    color: COLORS.bg,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
  },
});
