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
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";

// Même logique que vowels-basic : background local immersif
const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

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
  id: string;
  expression: Expression;
  prompt: string;
  options: string[];
  correctAnswer: string;
  questionType: "sound" | "meaning" | "rule" | "aspiration";
};

type QuizResult = {
  score: number;
  total: number;
};

const NEXT_HANGUL_ROUTE = "/(tabs)/hangul/vowels-compound";
const NEXT_HANGUL_LABEL = "VOYELLES COMPOSÉES";
const CURRENT_HANGUL_MODULE_ID = "hangul_consonants_basic";
const HANGUL_PREREQUISITES = [
  { id: "hangul_vowels_basic", title: "Voyelles de base" },
];

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

const buildOrganRuleQuestion = (exp: Expression): QuizQuestion => {
  return {
    id: `rule-${exp.id}`,
    expression: exp,
    prompt: "Quel est le rôle de ㅇ en coréen ?",
    options: shuffle([
      "Muet au début, ng en fin",
      "Toujours muet",
      "Toujours prononcé g",
      "Il remplace une voyelle",
    ]),
    correctAnswer: "Muet au début, ng en fin",
    questionType: "rule",
  };
};

const buildAspirationQuestion = (
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
    id: `aspiration-${exp.id}`,
    expression: exp,
    prompt: "Quel son aspiré correspond à cette consonne ?",
    options: shuffle([correct, ...distractors]).slice(0, 4),
    correctAnswer: correct,
    questionType: "aspiration",
  };
};

const generateQuiz = (scene: Scene): QuizQuestion[] => {
  if (scene.id === "vocal-organs") {
    const regularQuestions = scene.expressions
      .filter((exp) => exp.id !== "c-ng")
      .map((exp) => buildSoundQuestion(exp, scene.expressions));

    const ngExpression =
      scene.expressions.find((exp) => exp.id === "c-ng") ||
      scene.expressions[0];

    const ngQuestion = buildOrganRuleQuestion(ngExpression);

    return shuffle([...regularQuestions, ngQuestion]);
  }

  if (scene.id === "air-force") {
    return scene.expressions.map((exp) =>
      buildAspirationQuestion(exp, scene.expressions),
    );
  }

  if (scene.id === "syllable-build") {
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

  if (total - score <= 1) return "SÉQUENCE VALIDÉE";
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
    return "Tu as parfaitement reconnu les sons, les règles ou le sens. Tu peux continuer vers la suite !";
  }

  if (total - score <= 1) {
    return "Très solide. La séquence est validée, mais tu peux la refaire pour viser la maîtrise parfaite.";
  }

  if (ratio >= 0.8) {
    return "Tu es très proche. Recommence la séquence pour descendre à une seule erreur maximum.";
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
  if (question.questionType === "rule") return "DÉFI DE RÈGLE";
  if (question.questionType === "aspiration") return "DÉFI DE SOUFFLE";

  return "DÉFI DE COMPRÉHENSION";
};

export default function ConsonantsBasicImmersion() {
  const { progress, complete } = useStore();
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [ambientMode, setAmbientMode] = useState(false);
  const [masteredScenes, setMasteredScenes] = useState<Record<string, boolean>>(
    {},
  );
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>(
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
  const activeSceneIndex = SCENES.findIndex(
    (scene) => scene.id === activeScene.id,
  );
  const isLastScene = activeSceneIndex === SCENES.length - 1;
  const isStrongQuizResult = (result?: QuizResult) =>
    !!result && result.total > 0 && result.total - result.score <= 1;
  const allScenesStrong = SCENES.every((scene) =>
    isStrongQuizResult(quizResults[scene.id]),
  );
  const hasCompletedAllSceneQuizzes = SCENES.every(
    (scene) => !!quizResults[scene.id],
  );
  const failedScenesToRetry = SCENES.filter((scene) => {
    const result = quizResults[scene.id];
    return result && result.total - result.score > 1;
  });
  const failedSceneToRetry = failedScenesToRetry[0];
  const shouldMarkModuleComplete = hasCompletedAllSceneQuizzes && allScenesStrong;
  const shouldSuggestNextSection = shouldMarkModuleComplete && isLastScene;
  const shouldRetryBeforeNextSection =
    hasCompletedAllSceneQuizzes &&
    !!failedSceneToRetry &&
    activeScene.id !== failedSceneToRetry.id;
  const shouldShowProgressionTeaser =
    showTeaser[activeScene.id] ||
    shouldSuggestNextSection ||
    shouldRetryBeforeNextSection;
  const skippedPrerequisites = HANGUL_PREREQUISITES.filter(
    (module) => !progress.completed[module.id],
  );
  const hasSkippedPrerequisites = skippedPrerequisites.length > 0;
  const skippedPrerequisiteMessage =
    skippedPrerequisites.length === 1
      ? `Petit conseil : tu as validé ce parcours, mais le parcours "${skippedPrerequisites[0].title}" semble avoir été sauté. Tu peux y revenir avant de continuer, ou poursuivre si tu te sens prêt.`
      : `Petit conseil : tu as validé ce parcours, mais les parcours ${skippedPrerequisites.map((module) => `"${module.title}"`).join(", ")} semblent avoir été sautés. Tu peux y revenir avant de continuer, ou poursuivre si tu te sens prêt.`;

  useEffect(() => {
    if (shouldMarkModuleComplete) {
      complete(CURRENT_HANGUL_MODULE_ID);
    }
  }, [complete, shouldMarkModuleComplete]);

  const resetSceneToolbox = (sceneToReset = activeScene) => {
    setCompletedItems((prev) => {
      const next = { ...prev };

      sceneToReset.expressions.forEach((exp) => {
        delete next[exp.id];
      });

      return next;
    });

    setReadyForQuiz((prev) => ({
      ...prev,
      [sceneToReset.id]: false,
    }));

    setMasteredScenes((prev) => ({
      ...prev,
      [sceneToReset.id]: false,
    }));

    setShowTeaser((prev) => ({
      ...prev,
      [sceneToReset.id]: false,
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
    if (!currentQuestion) return;

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
      const passed = total > 0 && total - finalScore <= 1;

      setQuizComplete(true);
      setQuizResults((prev) => ({
        ...prev,
        [activeScene.id]: { score: finalScore, total },
      }));

      setMasteredScenes((prev) => ({
        ...prev,
        [activeScene.id]: passed,
      }));

      setShowTeaser((prev) => ({
        ...prev,
        [activeScene.id]: passed,
      }));

      if (passed) {
        complete(`${CURRENT_HANGUL_MODULE_ID}_${activeScene.id}`);
      }
    }, 900);
  };

  const currentQuestion = quizQuestions[quizIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bg}
        resizeMode="contain"
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
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
              <AppText variant="sectionLabel" lineContract="singleLine" style={styles.backText}>ARCHITECTURE</AppText>
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
              <AppText variant="label"
                style={[
                  styles.premiumToggleText,
                  ambientMode && styles.premiumToggleTextActive,
                ]}
              >
                {ambientMode ? "✨ MODE CALME" : "🔇 FOCUS"}
              </AppText>
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

              <AppText variant="caption" lineContract="singleLine" style={styles.progressText}>
                {currentCompleted}/{totalToComplete}
              </AppText>
            </View>

            <AppText variant="sectionLabel" style={[styles.eyebrow, { color: activeScene.accent }]}>
              SÉOUL IMMERSION
            </AppText>
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
                <AppText variant="label" lineContract="singleLine"
                  style={[
                    styles.tabLabel,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.title}
                </AppText>
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
              <AppText accessibilityRole="header" variant="sceneTitle" lineContract="twoLines" style={styles.toolboxSceneTitle}>{activeScene.title}</AppText>

              <View
                style={[
                  styles.hookBanner,
                  { borderColor: `${activeScene.accent}30` },
                ]}
              >
                <AppText variant="bodyStrong" style={styles.hookText}>
                  💡 {activeScene.curiosityHook}
                </AppText>
              </View>

              <AppText variant="koreanPrimary" script="korean" style={[styles.krTitle, { color: activeScene.accent }]}>
                {activeScene.koreanTitle}
              </AppText>

              <AppText variant="body" style={styles.sceneDesc}>{activeScene.description}</AppText>

              <View
                style={[
                  styles.instructionBox,
                  { borderLeftColor: activeScene.accent },
                ]}
              >
                <AppText variant="body" style={styles.instructionText}>
                  {activeScene.instruction}
                </AppText>
              </View>
            </BlurView>
          </Animated.View>

          {/* Consonant Toolbox / Items Grid */}
          <View style={styles.grid}>
            <View style={styles.toolboxHeader}>
              <AppText variant="sectionTitle" style={styles.sectionTitle}>CONSONANT TOOLBOX</AppText>
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
                    <AppText variant="koreanPrimary" script="korean"
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
                    </AppText>

                    <View style={styles.expCardRight}>
                      {exp.strokeSteps && (
                        <View style={styles.strokeBadge}>
                          <AppText variant="caption" style={styles.strokeText}>
                            {exp.strokeSteps} TRAITS
                          </AppText>
                        </View>
                      )}

                      <View
                        style={[
                          styles.romBox,
                          { backgroundColor: `${activeScene.accent}20` },
                        ]}
                      >
                        <AppText variant="caption"
                          style={[
                            styles.romText,
                            { color: activeScene.accent },
                          ]}
                        >
                          {exp.rom}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {completedItems[exp.id] && (
                    <View style={styles.expDetail}>
                      <AppText variant="caption"
                        style={[
                          styles.expSymbolic,
                          { color: activeScene.accent },
                        ]}
                      >
                        {exp.symbolic || "Composition syllabique"}
                      </AppText>

                      <AppText variant="bodyStrong" style={styles.expMean}>{exp.mean}</AppText>
                      <AppText variant="bodySecondary" tone="muted" style={styles.expCtx}>{exp.context}</AppText>
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
                <AppText variant="body" style={styles.teaserText}>
                  ✨ Tous les éléments sont découverts. Teste maintenant ta
                  reconnaissance.
                </AppText>

                <AppText variant="button" style={[styles.teaserBtn, { color: activeScene.accent }]}>
                  DÉMARRER LE DÉFI →
                </AppText>
              </Pressable>
            )}

          {/* Teaser / Next Step */}
          {shouldShowProgressionTeaser && (
            <Pressable
              onPress={() => {
                if (shouldSuggestNextSection) {
                  router.push(NEXT_HANGUL_ROUTE as any);
                  return;
                }

                if (shouldRetryBeforeNextSection) {
                  if (failedSceneToRetry) {
                    setActiveScene(failedSceneToRetry);
                    resetSceneToolbox(failedSceneToRetry);
                  }
                  return;
                }

                const nextIdx = activeSceneIndex + 1;

                if (nextIdx < SCENES.length) {
                  setActiveScene(SCENES[nextIdx]);
                }
              }}
              style={styles.teaserBox}
            >
              <AppText variant="body" style={styles.teaserText}>
                ✨{" "}
                {shouldSuggestNextSection
                  ? hasSkippedPrerequisites
                    ? skippedPrerequisiteMessage
                    : "Tu as validé les 3 thèmes avec au maximum une erreur chacun. Tu peux passer à la section suivante."
                  : shouldRetryBeforeNextSection
                    ? failedScenesToRetry.length > 1
                      ? `Tu as terminé les 3 thèmes, mais ${failedScenesToRetry.length} thèmes doivent encore être corrigés : ${failedScenesToRetry.map((scene) => `"${scene.title}"`).join(", ")}. Reprends "${failedSceneToRetry?.title}" d'abord.`
                      : `Bien, maintenant il ne te reste plus qu'à corriger le thème "${failedSceneToRetry?.title}" pour débloquer la suite.`
                  : activeScene.teaser}
              </AppText>

              <AppText variant="button" style={[styles.teaserBtn, { color: activeScene.accent }]}>
                {shouldSuggestNextSection
                  ? `PASSER À ${NEXT_HANGUL_LABEL} →`
                  : shouldRetryBeforeNextSection
                    ? `RECOMMENCER ${failedSceneToRetry?.title.toUpperCase()} →`
                  : "DÉBLOQUER LA SUITE →"}
              </AppText>
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
                  <AppText variant="sectionTitle" style={styles.quizTitle}>
                    {getQuizTitle(currentQuestion)}
                  </AppText>

                  <View style={styles.quizQBox}>
                    <AppText variant="koreanPrimary" script="korean"
                      style={[styles.quizChar, { color: activeScene.accent }]}
                    >
                      {currentQuestion?.expression.word}
                    </AppText>

                    <AppText variant="body" style={styles.quizInstruction}>
                      {currentQuestion?.prompt}
                    </AppText>
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
                        <AppText variant="bodyStrong" style={styles.optText}>{opt}</AppText>
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

                    <AppText variant="sectionLabel" style={styles.resultLabelText}>
                      {quizQuestions.length - quizScore <= 1
                        ? "SÉQUENCE VALIDÉE"
                        : "SÉQUENCE À REVOIR"}
                    </AppText>
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
                        <AppText variant="numericValue" style={styles.resultScoreBig}>{quizScore}</AppText>
                        <AppText variant="sectionTitle" style={styles.resultScoreTotal}>
                          /{quizQuestions.length}
                        </AppText>
                      </View>
                    </LinearGradient>
                  </View>

                  <AppText accessibilityRole="header" variant="sceneTitle"
                    style={[
                      styles.resultTitle,
                      quizScore <= 1 && styles.resultTitleSmall,
                    ]}
                  >
                    {getQuizResultMessage(quizScore, quizQuestions.length)}
                  </AppText>

                  <AppText variant="bodySecondary" tone="muted" style={styles.resultSubtitle}>
                    {getQuizResultSubtitle(quizScore, quizQuestions.length)}
                  </AppText>

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

                  <AppText variant="bodyStrong" style={styles.resultScore}>
                    {quizScore} / {quizQuestions.length} réponses correctes
                  </AppText>

                  <Pressable
                    onPress={() => {
                      setQuizActive(false);
                      if (quizQuestions.length - quizScore > 1) {
                        resetSceneToolbox();
                      }
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
                      <AppText variant="button" style={styles.closeBtnText}>
                        {quizQuestions.length - quizScore <= 1
                          ? "CONTINUER L'IMMERSION"
                          : "RECOMMENCER LA SÉQUENCE"}
                      </AppText>
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
  },
  premiumToggleTextActive: {
    color: COLORS.bg,
  },

  heroIntro: { marginBottom: 25 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  miniProgressBg: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    marginRight: 12,
    overflow: "hidden",
  },
  miniProgressFill: { height: "100%", borderRadius: 2 },
  progressText: {
    color: COLORS.muted,
    fontSize: 11,
  },
  eyebrow: {
    fontSize: 10,
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
  },
  krTitle: {
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
    fontStyle: "italic",
    lineHeight: 21,
  },

  grid: { marginTop: 35, gap: 18 },
  toolboxHeader: { marginBottom: 8 },
  sectionTitle: {
    color: "rgba(255,255,255,0.4)",
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
  },
  romBox: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  romText: {
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
    marginTop: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
    lineHeight: 16,
  },
  expMean: {
    color: COLORS.txt,
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
    lineHeight: 21,
  },
  teaserBtn: {
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
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 25,
  },
  quizQBox: { alignItems: "center", marginBottom: 35 },
  quizChar: {
    color: COLORS.txt,
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
    fontSize: 42,
    letterSpacing: -1,
  },
  resultScoreTotal: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 18,
    marginTop: 14,
  },
  resultTitle: {
    color: COLORS.pureWhite,
    fontSize: 24,
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
    fontSize: 12,
    letterSpacing: 1.8,
  },
});
