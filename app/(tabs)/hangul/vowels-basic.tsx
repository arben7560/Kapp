import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Image de fond typée "Séoul de nuit / Cyber"
const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

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
  symbolic?: string;
  strokeSteps?: number;
  baseVowel?: string;
};

type Scene = {
  id: string;
  title: string;
  tabTitle: string;
  koreanTitle: string;
  description: string;
  accent: string;
  curiosityHook: string;
  instruction: string;
  teaser: string;
  expressions: Expression[];
};

type QuizQuestion = {
  id: string;
  expression: Expression;
  prompt: string;
  options: string[];
  correctAnswer: string;
  questionType: "sound" | "meaning" | "form" | "rule";
};

const SCENES: Scene[] = [
  {
    id: "basic_vowels",
    title: "Voyelles de base",
    tabTitle: "Voyelles",
    koreanTitle: "천지인",
    description:
      "Le Hangeul part de trois formes : ciel, terre et être humain.",
    accent: COLORS.hangulCyan,
    curiosityHook:
      "Chaque voyelle naît d’une forme simple. Regarde, écoute, retiens.",
    instruction:
      "Touche une voyelle pour entendre son son et comprendre sa forme.",
    teaser:
      "Très bien. Tu connais les formes. Découvre maintenant le gardien silencieux.",
    expressions: [
      {
        id: "v-i",
        word: "ㅣ",
        rom: "i",
        mean: "L'être humain",
        symbolic: "Une ligne verticale : l’humain debout.",
        context: "Son direct : 'i' comme dans 'Idée'.",
        type: "vowel",
        speak: "이",
        strokeSteps: 1,
      },
      {
        id: "v-eu",
        word: "ㅡ",
        rom: "eu",
        mean: "La terre",
        symbolic: "Une ligne horizontale : le sol.",
        context: "Son neutre : proche de 'eu', lèvres détendues.",
        type: "vowel",
        speak: "으",
        strokeSteps: 1,
      },
      {
        id: "v-a",
        word: "ㅏ",
        rom: "a",
        mean: "Homme + ciel",
        symbolic: "Le point se place à droite de l’humain.",
        context: "Son ouvert : 'a' comme dans 'Ami'.",
        type: "vowel",
        speak: "아",
        strokeSteps: 2,
      },
      {
        id: "v-eo",
        word: "ㅓ",
        rom: "eo",
        mean: "Ciel + homme",
        symbolic: "Le point se place à gauche de l’humain.",
        context: "Son ouvert : proche du 'o' de 'pomme'.",
        type: "vowel",
        speak: "어",
        strokeSteps: 2,
      },
      {
        id: "v-o",
        word: "ㅗ",
        rom: "o",
        mean: "Ciel sur terre",
        symbolic: "Le point est au-dessus de l’horizon.",
        context: "Son fermé : proche du 'o' de 'vélo'.",
        type: "vowel",
        speak: "오",
        strokeSteps: 2,
      },
      {
        id: "v-u",
        word: "ㅜ",
        rom: "u",
        mean: "Ciel sous terre",
        symbolic: "Le point est sous l’horizon.",
        context: "Son 'ou' : comme dans 'Loup'.",
        type: "vowel",
        speak: "우",
        strokeSteps: 2,
      },
    ],
  },
  {
    id: "silent_guardian",
    title: "Gardien silencieux  ",
    tabTitle: "Gardien ㅇ",
    koreanTitle: "이응 (ㅇ)",
    description:
      "Une voyelle seule reçoit ㅇ pour devenir une syllabe complète.",
    accent: COLORS.premiumGold,
    curiosityHook:
      "Au début d’une syllabe, ㅇ ne se prononce pas. Il soutient la voyelle.",
    instruction: "Observe comment chaque voyelle devient lisible avec ㅇ.",
    teaser: "Parfait. Ton œil est prêt. Lis maintenant tes premiers mots.",
    expressions: [
      {
        id: "g-a",
        word: "아",
        rom: "a",
        mean: "Syllabe complète : a",
        context: "ㅇ est muet au début. Il accompagne ㅏ.",
        type: "rule",
        speak: "아",
        strokeSteps: 3,
        baseVowel: "ㅏ",
      },
      {
        id: "g-eo",
        word: "어",
        rom: "eo",
        mean: "Syllabe complète : eo",
        context: "ㅇ est muet au début. Il accompagne ㅓ.",
        type: "rule",
        speak: "어",
        strokeSteps: 3,
        baseVowel: "ㅓ",
      },
      {
        id: "g-o",
        word: "오",
        rom: "o",
        mean: "Syllabe complète : o",
        context: "ㅇ se place au-dessus des voyelles horizontales.",
        type: "rule",
        speak: "오",
        strokeSteps: 3,
        baseVowel: "ㅗ",
      },
      {
        id: "g-u",
        word: "우",
        rom: "u",
        mean: "Syllabe complète : u",
        context: "ㅇ se place au-dessus des voyelles horizontales.",
        type: "rule",
        speak: "우",
        strokeSteps: 3,
        baseVowel: "ㅜ",
      },
      {
        id: "g-eu",
        word: "으",
        rom: "eu",
        mean: "Syllabe complète : eu",
        context: "ㅇ soutient la voyelle ㅡ.",
        type: "rule",
        speak: "으",
        strokeSteps: 2,
        baseVowel: "ㅡ",
      },
      {
        id: "g-i",
        word: "이",
        rom: "i",
        mean: "Syllabe complète : i",
        context:
          "Au début, ㅇ est silencieux. En fin de syllabe, il pourra sonner 'ng'.",
        type: "rule",
        speak: "이",
        strokeSteps: 2,
        baseVowel: "ㅣ",
      },
    ],
  },
  {
    id: "first_words",
    title: "Premiers mots",
    tabTitle: "Mots",
    koreanTitle: "첫 단어",
    description: "Tu passes des signes aux mots simples.",
    accent: COLORS.pink,
    curiosityHook: "Avec quelques voyelles et ㅇ, tu peux déjà lire du coréen.",
    instruction: "Écoute chaque mot et repère les syllabes.",
    teaser: "C'est une victoire. Tu es prêt à découvrir les consonnes.",
    expressions: [
      {
        id: "w-ai",
        word: "아이",
        rom: "a-i",
        mean: "Enfant",
        context: "Deux syllabes simples : 아 + 이.",
        type: "word",
        speak: "아이",
      },
      {
        id: "w-oi",
        word: "오이",
        rom: "o-i",
        mean: "Concombre",
        context: "Deux sons nets : 오 + 이.",
        type: "word",
        speak: "오이",
      },
      {
        id: "w-ua",
        word: "우아",
        rom: "u-a",
        mean: "Élégance / gracieux",
        context: "Base de 우아해요 : c’est élégant.",
        type: "word",
        speak: "우아",
      },
    ],
  },
];

const shuffle = <T,>(items: T[]) => {
  return [...items].sort(() => Math.random() - 0.5);
};

const buildSoundQuestion = (
  exp: Expression,
  sceneExpressions: Expression[],
): QuizQuestion => {
  const correct = exp.rom;

  const distractors = sceneExpressions
    .filter((item) => item.id !== exp.id)
    .map((item) => item.rom)
    .filter(
      (value, index, arr) => arr.indexOf(value) === index && value !== correct,
    )
    .slice(0, 3);

  return {
    id: `sound-${exp.id}`,
    expression: exp,
    prompt: "Quel est le son correct ?",
    options: shuffle([correct, ...distractors]).slice(0, 4),
    correctAnswer: correct,
    questionType: "sound",
  };
};

const buildFormQuestion = (
  exp: Expression,
  sceneExpressions: Expression[],
): QuizQuestion => {
  const correct = exp.word;
  const base = exp.baseVowel || exp.word;

  const distractors = sceneExpressions
    .filter((item) => item.id !== exp.id)
    .map((item) => item.word)
    .filter(
      (value, index, arr) => arr.indexOf(value) === index && value !== correct,
    )
    .slice(0, 3);

  return {
    id: `form-${exp.id}`,
    expression: {
      ...exp,
      word: base,
    },
    prompt: `Quelle syllabe complète correspond à ${base} ?`,
    options: shuffle([correct, ...distractors]).slice(0, 4),
    correctAnswer: correct,
    questionType: "form",
  };
};

const buildMeaningQuestion = (
  exp: Expression,
  sceneExpressions: Expression[],
): QuizQuestion => {
  const correct = exp.mean;

  const distractors = sceneExpressions
    .filter((item) => item.id !== exp.id)
    .map((item) => item.mean)
    .filter(
      (value, index, arr) => arr.indexOf(value) === index && value !== correct,
    )
    .slice(0, 3);

  return {
    id: `meaning-${exp.id}`,
    expression: exp,
    prompt: "Quelle est la signification correcte ?",
    options: shuffle([correct, ...distractors]).slice(0, 4),
    correctAnswer: correct,
    questionType: "meaning",
  };
};

const buildGuardianRuleQuestion = (exp: Expression): QuizQuestion => {
  return {
    id: `rule-${exp.id}`,
    expression: exp,
    prompt: "Dans cette syllabe, quel est le rôle de ㅇ au début ?",
    options: shuffle([
      "Il est muet au début",
      "Il se prononce toujours ng",
      "Il remplace la voyelle",
      "Il transforme la voyelle en consonne",
    ]),
    correctAnswer: "Il est muet au début",
    questionType: "rule",
  };
};

const generateQuiz = (scene: Scene): QuizQuestion[] => {
  if (scene.id === "basic_vowels") {
    return scene.expressions.map((exp) =>
      buildSoundQuestion(exp, scene.expressions),
    );
  }

  if (scene.id === "silent_guardian") {
    const formQuestions = scene.expressions.map((exp) =>
      buildFormQuestion(exp, scene.expressions),
    );

    const ruleQuestion = buildGuardianRuleQuestion(scene.expressions[0]);

    return shuffle([...formQuestions, ruleQuestion]);
  }

  if (scene.id === "first_words") {
    return scene.expressions.map((exp) =>
      buildMeaningQuestion(exp, scene.expressions),
    );
  }

  return scene.expressions.map((exp) =>
    buildMeaningQuestion(exp, scene.expressions),
  );
};

const getQuizResultMessage = (score: number, total: number) => {
  if (total <= 0) return "RÉVISION EN COURS";
  if (score === total) return "MAÎTRISE PARFAITE";

  const ratio = score / total;

  if (ratio >= 0.8) return "SÉQUENCE VALIDÉE";
  if (ratio >= 0.6) return "BONNE PROGRESSION";
  if (ratio >= 0.4) return "BASES EN CONSTRUCTION";
  return "ON REPREND EN DOUCEUR";
};

const getQuizResultSubtitle = (score: number, total: number) => {
  if (total <= 0) {
    return "Reprends calmement la séquence pour consolider tes repères.";
  }

  const ratio = score / total;

  if (score === total) {
    return "Tu as parfaitement reconnu les sons, les formes ou le sens. Tu peux continuer vers la suite !";
  }

  if (ratio >= 0.8) {
    return "Très solide. La séquence est validée, mais tu peux la refaire pour viser la maîtrise parfaite.";
  }

  if (ratio >= 0.6) {
    return "Résultat encourageant. Revois encore quelques cartes pour stabiliser tes repères.";
  }

  if (ratio >= 0.4) {
    return "Quelques bases sont là, mais il faut reprendre calmement la séquence.";
  }

  return "Ce n'est pas encore maîtrisé. Revois le cours, écoute les sons et prends ton temps.";
};

const getQuizTitle = (question?: QuizQuestion) => {
  if (!question) return "DÉFI DE MÉMORISATION";

  if (question.questionType === "sound") return "DÉFI DE PRONONCIATION";
  if (question.questionType === "form") return "DÉFI DE FORME";
  if (question.questionType === "rule") return "DÉFI DE RÈGLE";

  return "DÉFI DE COMPRÉHENSION";
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
  const [readyForQuiz, setReadyForQuiz] = useState<Record<string, boolean>>({});
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
  }, [activeScene, fadeAnim]);

  const currentCompleted = Object.keys(completedItems).length;

  const totalToComplete = SCENES.reduce(
    (acc, scene) => acc + scene.expressions.length,
    0,
  );

  const resetSceneToolbox = () => {
    setCompletedItems((prev) => {
      const next = { ...prev };

      activeScene.expressions.forEach((exp) => {
        delete next[exp.id];
      });

      return next;
    });

    setReadyForQuiz((prev) => ({
      ...prev,
      [activeScene.id]: false,
    }));
  };

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.75,
      pitch: 1,
    });
  };

  const startQuiz = () => {
    quizSlideAnim.setValue(600);

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
      activeScene.expressions.every((item) => newCompleted[item.id])
    ) {
      setReadyForQuiz((prev) => ({
        ...prev,
        [activeScene.id]: true,
      }));
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (quizAnswered !== null) return;

    const currentQuestion = quizQuestions[quizIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    setQuizAnswered(answer);

    if (isCorrect) {
      setQuizScore((score) => score + 1);
      Vibration.vibrate(15);
    } else {
      Vibration.vibrate([0, 60]);

      setTimeout(() => {
        speak(currentQuestion.expression.speak);
      }, 400);
    }

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex((index) => index + 1);
        setQuizAnswered(null);
        return;
      }

      const finalScore = quizScore + (isCorrect ? 1 : 0);
      const total = quizQuestions.length;
      const passed = total > 0 && finalScore / total >= 0.8;

      setQuizComplete(true);

      setMasteredScenes((prev) => ({
        ...prev,
        [activeScene.id]: passed,
      }));

      setShowTeaser((prev) => ({
        ...prev,
        [activeScene.id]: passed,
      }));
    }, 900);
  };

  const currentQuestion = quizQuestions[quizIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(2,3,6,0.52)", "rgba(2,3,6,0.72)", "rgba(2,3,6,0.84)"]}
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
                {ambientMode ? "✨ MODE CALME" : "🔇 FOCUS"}
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
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  style={[
                    styles.tabLabel,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.tabTitle}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Narrative Content Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <BlurView intensity={70} tint="dark" style={styles.mainCard}>
              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.86}
                style={styles.toolboxSceneTitle}
              >
                {activeScene.title}
              </Text>

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

          {/* Quiz Ready Transition */}
          {readyForQuiz[activeScene.id] &&
            !showTeaser[activeScene.id] &&
            !masteredScenes[activeScene.id] && (
              <Pressable onPress={startQuiz} style={styles.teaserBox}>
                <Text style={styles.teaserText}>
                  ✨ Tous les éléments sont découverts. Teste maintenant ta
                  reconnaissance.
                </Text>

                <Text style={[styles.teaserBtn, { color: activeScene.accent }]}>
                  DÉMARRER LE DÉFI →
                </Text>
              </Pressable>
            )}

          {/* Teaser / Next Step */}
          {showTeaser[activeScene.id] && (
            <Pressable
              onPress={() => {
                const nextIdx =
                  SCENES.findIndex((scene) => scene.id === activeScene.id) + 1;

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
                {
                  transform: [{ translateY: quizSlideAnim }],
                },
              ]}
            >
              {!quizComplete ? (
                <>
                  <Text style={styles.quizTitle}>
                    {getQuizTitle(currentQuestion)}
                  </Text>

                  <View style={styles.quizQBox}>
                    <Text
                      style={[styles.quizChar, { color: activeScene.accent }]}
                    >
                      {currentQuestion?.expression.word}
                    </Text>

                    <Text style={styles.quizInstruction}>
                      {currentQuestion?.prompt}
                    </Text>
                  </View>

                  <View style={styles.optionsGrid}>
                    {currentQuestion?.options.map((opt, index) => (
                      <Pressable
                        key={`${currentQuestion.id}-${index}`}
                        onPress={() => handleQuizAnswer(opt)}
                        style={[
                          styles.optBtn,
                          quizAnswered === opt &&
                            (opt === currentQuestion.correctAnswer
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
                  <View
                    style={[
                      styles.resultAmbientGlow,
                      { backgroundColor: `${activeScene.accent}1A` },
                    ]}
                  />

                  <View style={styles.resultTopLabel}>
                    <View
                      style={[
                        styles.resultLabelDot,
                        { backgroundColor: activeScene.accent },
                      ]}
                    />

                    <Text style={styles.resultLabelText}>
                      {quizScore / quizQuestions.length >= 0.8
                        ? "SÉQUENCE VALIDÉE"
                        : "SÉQUENCE À REVOIR"}
                    </Text>
                  </View>

                  <View style={styles.resultMedalWrap}>
                    <LinearGradient
                      colors={[
                        `${activeScene.accent}55`,
                        "rgba(255,255,255,0.08)",
                        "rgba(255,255,255,0.02)",
                      ]}
                      style={styles.resultMedalAura}
                    />

                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.22)",
                        "rgba(255,255,255,0.05)",
                        "rgba(255,255,255,0.02)",
                      ]}
                      style={styles.resultMedal}
                    >
                      <View
                        style={[
                          styles.resultMedalInner,
                          { borderColor: `${activeScene.accent}66` },
                        ]}
                      >
                        <Text style={styles.resultScoreBig}>{quizScore}</Text>

                        <Text style={styles.resultScoreTotal}>
                          /{quizQuestions.length}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>

                  <Text
                    style={[
                      styles.resultTitle,
                      quizScore <= 1 && styles.resultTitleSmall,
                    ]}
                  >
                    {getQuizResultMessage(quizScore, quizQuestions.length)}
                  </Text>

                  <Text style={styles.resultSubtitle}>
                    {getQuizResultSubtitle(quizScore, quizQuestions.length)}
                  </Text>

                  <View style={styles.resultProgressTrack}>
                    <View
                      style={[
                        styles.resultProgressFill,
                        {
                          width: `${(quizScore / quizQuestions.length) * 100}%`,
                          backgroundColor: activeScene.accent,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.resultScore}>
                    {quizScore} / {quizQuestions.length} réponses correctes
                  </Text>

                  <Pressable
                    onPress={() => {
                      setQuizActive(false);
                      resetSceneToolbox();
                    }}
                    style={styles.closeBtn}
                  >
                    <LinearGradient
                      colors={[
                        activeScene.accent,
                        "rgba(96,165,250,0.92)",
                        "rgba(186,230,253,0.95)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.closeBtnGradient}
                    >
                      <Text style={styles.closeBtnText}>
                        {"CONTINUER L'IMMERSION"}
                      </Text>
                    </LinearGradient>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  bg: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  backArrow: {
    color: COLORS.txt,
    fontSize: 32,
    marginRight: 5,
  },

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

  heroIntro: {
    marginBottom: 25,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  miniProgressBg: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    marginRight: 12,
  },

  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },

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
    fontSize: 35,
    letterSpacing: -1.2,
  },

  tabBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  tabLabel: {
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    color: COLORS.muted,
    textAlign: "center",
    includeFontPadding: false,
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
    fontSize: 13,
    lineHeight: 20,
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
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 20,
  },

  instructionBox: {
    paddingLeft: 18,
    borderLeftWidth: 4,
  },

  instructionText: {
    color: COLORS.txt,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Outfit_500Medium",
    fontStyle: "italic",
  },

  grid: {
    marginTop: 35,
    gap: 18,
  },

  toolboxHeader: {
    marginBottom: 8,
  },

  toolboxSceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 14,
  },

  sectionTitle: {
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    letterSpacing: 3,
  },

  cardWrapper: {
    width: "100%",
  },

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

  expCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

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

  romBox: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

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

  quizOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },

  quizSheet: {
    backgroundColor: "rgba(4,7,14,0.96)",
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 54,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    overflow: "hidden",
  },

  quizTitle: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 25,
  },

  quizQBox: {
    alignItems: "center",
    marginBottom: 35,
  },

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
    textAlign: "center",
  },

  optionsGrid: {
    gap: 15,
  },

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

  resultBox: {
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 4,
    position: "relative",
  },

  resultAmbientGlow: {
    position: "absolute",
    top: 66,
    width: 130,
    height: 130,
    borderRadius: 999,
    opacity: 0.55,
  },

  resultTopLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 20,
  },

  resultLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },

  resultLabelText: {
    color: "rgba(255,255,255,0.58)",
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 2,
  },

  resultMedalWrap: {
    width: 118,
    height: 118,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  resultMedalAura: {
    position: "absolute",
    width: 118,
    height: 118,
    borderRadius: 999,
    opacity: 0.65,
  },

  resultMedal: {
    width: 96,
    height: 96,
    borderRadius: 999,
    padding: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  resultMedalInner: {
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2,3,6,0.78)",
    borderWidth: 1,
    flexDirection: "row",
  },

  resultScoreBig: {
    color: COLORS.pureWhite,
    fontFamily: "Outfit_900Black",
    fontSize: 42,
    letterSpacing: -1,
  },

  resultScoreTotal: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    marginTop: 14,
  },

  resultTitle: {
    color: COLORS.pureWhite,
    fontSize: 24,
    fontFamily: "Outfit_900Black",
    letterSpacing: -0.6,
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  resultTitleSmall: {
    fontSize: 20,
  },

  resultSubtitle: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Outfit_500Medium",
    textAlign: "center",
    maxWidth: 310,
    marginBottom: 22,
  },

  resultProgressTrack: {
    width: "82%",
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 12,
  },

  resultProgressFill: {
    height: "100%",
    borderRadius: 999,
  },

  resultScore: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    marginBottom: 28,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.5,
  },

  closeBtn: {
    width: "88%",
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  closeBtnGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },

  closeBtnText: {
    color: "#020306",
    fontFamily: "Outfit_900Black",
    fontSize: 12,
    letterSpacing: 1.8,
  },
});
