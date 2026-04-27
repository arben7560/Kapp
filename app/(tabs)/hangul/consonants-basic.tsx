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

// Même logique que vowels-basic : background local immersif
const BACKGROUND_SOURCE = require("../../../assets/images/hangul-bg.png");

const COLORS = {
  bg: "#020306",
  consonantBlue: "#60A5FA",
  electricIndigo: "#6366F1",
  premiumGold: "#FDE047",
  successGreen: "#4ADE80",
  errorRed: "#F87171",
  pureWhite: "#F8FAFC",
  txt: "rgba(255,255,255,0.98)",
  muted: "rgba(255,255,255,0.75)",
  pink: "#F472B6",
  green: "#34D399",
};

type Expression = {
  id: string;
  word: string;
  rom: string;
  mean: string;
  context: string;
  type: "consonant" | "rule" | "word";
  speak: string;
  symbolic?: string;
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
    id: "vocal-organs",
    title: "L'Organe Vocal",
    koreanTitle: "발성 기관",
    description:
      "Les consonnes de base imitent la position de la langue, de la bouche et de la gorge.",
    accent: COLORS.consonantBlue,
    curiosityHook:
      "Le Hangeul n’invente pas des formes au hasard : il dessine directement les organes qui produisent le son.",
    instruction:
      "Touche une consonne pour entendre sa force et comprendre sa forme.",
    teaser:
      "Très bien. Tu comprends maintenant l’architecture des sons. Passons au souffle aspiré.",
    expressions: [
      {
        id: "c-g",
        word: "ㄱ",
        rom: "g/k",
        mean: "Le palais",
        symbolic: "Le dos de la langue se lève et touche le palais.",
        context: "Son entre G et K selon la position dans le mot.",
        type: "consonant",
        speak: "그",
        strokeSteps: 2,
      },
      {
        id: "c-n",
        word: "ㄴ",
        rom: "n",
        mean: "La langue",
        symbolic: "La pointe de la langue touche les dents du haut.",
        context: "Son N clair, comme dans 'nez'.",
        type: "consonant",
        speak: "느",
        strokeSteps: 2,
      },
      {
        id: "c-m",
        word: "ㅁ",
        rom: "m",
        mean: "La bouche",
        symbolic: "Un carré qui représente les lèvres fermées.",
        context: "Son M, produit avec les lèvres fermées.",
        type: "consonant",
        speak: "므",
        strokeSteps: 4,
      },
      {
        id: "c-s",
        word: "ㅅ",
        rom: "s",
        mean: "Les dents",
        symbolic: "La forme évoque les dents où l’air glisse.",
        context: "Son S doux, proche de 'sourire'.",
        type: "consonant",
        speak: "스",
        strokeSteps: 2,
      },
      {
        id: "c-ng",
        word: "ㅇ",
        rom: "ng / muet",
        mean: "La gorge",
        symbolic: "Un cercle qui représente la gorge ouverte.",
        context: "Muet au début, son NG en fin de syllabe.",
        type: "consonant",
        speak: "응",
        strokeSteps: 1,
      },
    ],
  },
  {
    id: "air-force",
    title: "Le Souffle",
    koreanTitle: "격음",
    description:
      "Ajouter un trait à une consonne signifie souvent ajouter une poussée d’air.",
    accent: COLORS.electricIndigo,
    curiosityHook:
      "Un simple trait transforme un son calme en son aspiré : le Hangeul encode l’énergie de la prononciation.",
    instruction: "Écoute la différence : ces consonnes demandent plus d’air.",
    teaser:
      "Parfait. Tu sens maintenant la puissance du souffle. Fusionnons les consonnes avec les voyelles.",
    expressions: [
      {
        id: "c-k",
        word: "ㅋ",
        rom: "k",
        mean: "K aspiré",
        symbolic:
          "ㄱ reçoit un trait supplémentaire : l’air devient plus fort.",
        context: "Comme un K très clair avec expiration.",
        type: "rule",
        speak: "크",
        strokeSteps: 3,
      },
      {
        id: "c-t",
        word: "ㅌ",
        rom: "t",
        mean: "T aspiré",
        symbolic: "Dérivé de ㄴ / ㄷ avec une pression d’air.",
        context: "Un T plus explosif et soufflé.",
        type: "rule",
        speak: "트",
        strokeSteps: 4,
      },
      {
        id: "c-p",
        word: "ㅍ",
        rom: "p",
        mean: "P aspiré",
        symbolic: "Les lèvres s’ouvrent avec une poussée d’air.",
        context: "Un P clair, plus fort que ㅂ.",
        type: "rule",
        speak: "프",
        strokeSteps: 4,
      },
      {
        id: "c-h",
        word: "ㅎ",
        rom: "h",
        mean: "Le souffle",
        symbolic: "La gorge laisse passer l’air avec un son H.",
        context: "Son H doux, comme une expiration.",
        type: "rule",
        speak: "흐",
        strokeSteps: 3,
      },
    ],
  },
  {
    id: "syllable-build",
    title: "La Fusion",
    koreanTitle: "글자 만들기",
    description:
      "Les consonnes et voyelles se combinent en blocs pour créer de vrais mots.",
    accent: COLORS.green,
    curiosityHook:
      "Tu ne lis plus des lettres isolées : tu commences à lire des blocs coréens complets.",
    instruction:
      "Touche chaque mot pour entendre comment les blocs deviennent du sens.",
    teaser:
      "Victoire. Tu peux maintenant fusionner consonnes et voyelles pour lire tes premiers mots coréens.",
    expressions: [
      {
        id: "w-gasu",
        word: "가수",
        rom: "ga-su",
        mean: "Chanteur",
        symbolic: "ㄱ + ㅏ puis ㅅ + ㅜ.",
        context: "Un mot simple pour comprendre la fusion des blocs.",
        type: "word",
        speak: "가수",
      },
      {
        id: "w-nara",
        word: "나라",
        rom: "na-ra",
        mean: "Pays",
        symbolic: "ㄴ + ㅏ puis ㄹ + ㅏ.",
        context: "Mot courant avec un rythme fluide.",
        type: "word",
        speak: "나라",
      },
      {
        id: "w-dari",
        word: "다리",
        rom: "da-ri",
        mean: "Pont / jambe",
        symbolic: "ㄷ + ㅏ puis ㄹ + ㅣ.",
        context: "Un mot fréquent avec deux sens selon le contexte.",
        type: "word",
        speak: "다리",
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

    while (distractors.length < 2) {
      distractors.push(useSound ? "..." : "Autre");
    }

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

export default function ConsonantsBasicImmersion() {
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
    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.75,
      pitch: 1,
    });
  };

  const startQuiz = () => {
    setQuizQuestions(generateQuiz(activeScene));
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(null);
    setQuizComplete(false);
    setQuizActive(true);

    quizSlideAnim.setValue(600);

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

    const currentQuestion = quizQuestions[quizIndex];
    if (!currentQuestion) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    setQuizAnswered(answer);

    if (isCorrect) {
      setQuizScore((s) => s + 1);
      Vibration.vibrate(15);
    } else {
      Vibration.vibrate([0, 60]);
      setTimeout(() => speak(currentQuestion.expression.speak), 400);
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
          colors={["rgba(2,3,6,0.62)", "rgba(2,3,6,0.82)", "rgba(2,3,6,0.94)"]}
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
              <Text style={styles.backText}>ARCHITECTURE</Text>
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

          {/* Consonant Toolbox / Items Grid */}
          <View style={styles.grid}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.sectionTitle}>CONSONANT TOOLBOX</Text>
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
                      <Text
                        style={[
                          styles.expSymbolic,
                          { color: activeScene.accent },
                        ]}
                      >
                        {exp.symbolic || "Composition syllabique"}
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

                if (nextIdx < SCENES.length) {
                  setActiveScene(SCENES[nextIdx]);
                }
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

        {/* Quiz Overlay */}
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
                      {quizQuestions[quizIndex]?.questionType === "sound"
                        ? "Quel est le son correct ?"
                        : "Quelle est la signification correcte ?"}
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
  toolboxSceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
    marginBottom: 14,
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
    lineHeight: 20,
  },
  instructionBox: { paddingLeft: 18, borderLeftWidth: 4 },
  instructionText: {
    color: COLORS.txt,
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
    fontStyle: "italic",
    lineHeight: 21,
  },

  grid: { marginTop: 35, gap: 18 },
  toolboxHeader: { marginBottom: 8 },
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
    fontSize: 28,
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
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    marginTop: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
    lineHeight: 16,
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed",
  },
  teaserText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Outfit_500Medium",
    lineHeight: 21,
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
    fontSize: 48,
    marginBottom: 2,
  },
  quizInstruction: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
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
    textAlign: "center",
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
