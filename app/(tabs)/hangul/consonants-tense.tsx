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

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  violet: "#A78BFA",
  premiumGold: "#FDE047",
  successGreen: "#4ADE80",
  errorRed: "#F87171",
  pureWhite: "#F8FAFC",
  txt: "rgba(255,255,255,0.98)",
  muted: "rgba(255,255,255,0.75)",
};

type Expression = {
  id: string;
  word: string;
  rom: string;
  mean: string;
  context: string;
  type: "tense" | "contrast" | "word";
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
  questionType: "meaning" | "contrast" | "tense";
};

type QuizResult = {
  score: number;
  total: number;
};

const NEXT_HANGUL_ROUTE = "/(tabs)/hangul/batchim";
const NEXT_HANGUL_LABEL = "BATCHIM";
const CURRENT_HANGUL_MODULE_ID = "hangul_consonants_tense";
const HANGUL_PREREQUISITES = [
  { id: "hangul_vowels_basic", title: "Voyelles de base" },
  { id: "hangul_consonants_basic", title: "Les consonnes" },
  { id: "hangul_vowels_compound", title: "Voyelles composées" },
];

const SCENES: Scene[] = [
  {
    id: "tense-force",
    title: "La Tension",
    koreanTitle: "쌍자음",
    description:
      "Les consonnes doubles créent un son plus sec, contracté et sans souffle.",
    accent: COLORS.pink,
    curiosityHook:
      "Doubler une consonne ne veut pas dire parler plus fort : l’air se bloque et le son devient tendu.",
    instruction: "Touche une consonne tendue pour entendre son attaque sèche.",
    teaser:
      "Très bien. Tu sens maintenant la tension. Passons aux contrastes avec les consonnes simples.",
    expressions: [
      {
        id: "t-kk",
        word: "ㄲ",
        rom: "kk",
        mean: "K tendu",
        symbolic: "Version contractée de ㄱ : l’air reste bloqué.",
        context: "Son sec, comme une attaque courte sans expiration.",
        type: "tense",
        speak: "까",
        strokeSteps: 4,
      },
      {
        id: "t-tt",
        word: "ㄸ",
        rom: "tt",
        mean: "T tendu",
        symbolic: "Version contractée de ㄷ : attaque nette et tendue.",
        context: "Son fort mais sans souffle aspiré.",
        type: "tense",
        speak: "따",
        strokeSteps: 6,
      },
      {
        id: "t-pp",
        word: "ㅃ",
        rom: "pp",
        mean: "P tendu",
        symbolic:
          "Version contractée de ㅂ : lèvres fermées puis relâchement sec.",
        context: "Explosion labiale tendue.",
        type: "tense",
        speak: "빠",
        strokeSteps: 8,
      },
      {
        id: "t-ss",
        word: "ㅆ",
        rom: "ss",
        mean: "S tendu",
        symbolic: "Version intensifiée de ㅅ : friction plus serrée.",
        context: "Sifflante intense et précise.",
        type: "tense",
        speak: "싸",
        strokeSteps: 4,
      },
      {
        id: "t-jj",
        word: "ㅉ",
        rom: "jj",
        mean: "J tendu",
        symbolic: "Version contractée de ㅈ : son très marqué.",
        context: "Son proche de 'dj', mais plus sec.",
        type: "tense",
        speak: "짜",
        strokeSteps: 8,
      },
    ],
  },
  {
    id: "contrast",
    title: "Le Contraste",
    koreanTitle: "소리 구별",
    description:
      "La vraie difficulté est de distinguer consonne simple, aspirée et tendue.",
    accent: COLORS.cyan,
    curiosityHook:
      "Pour une oreille française, ㄱ et ㄲ semblent proches. En coréen, ce contraste peut changer le mot.",
    instruction:
      "Écoute les trios : simple, tendu, puis aspiré avec plus de souffle.",
    teaser:
      "Parfait. Ton oreille commence à distinguer les nuances. Voyons ces sons dans des mots.",
    expressions: [
      {
        id: "c-ga-kka-ka",
        word: "가 / 까 / 카",
        rom: "ga / kka / ka",
        mean: "Simple / tendu / aspiré",
        symbolic:
          "ㄱ laisse le son sortir naturellement, ㄲ le contracte, ㅋ ajoute du souffle.",
        context:
          "Compare une attaque douce, une attaque tendue, puis une attaque aspirée.",
        type: "contrast",
        speak: "가|까|카",
      },
      {
        id: "c-da-tta-ta",
        word: "다 / 따 / 타",
        rom: "da / tta / ta",
        mean: "Simple / tendu / aspiré",
        symbolic:
          "ㄷ est naturel, ㄸ est bloqué puis relâché, ㅌ ajoute une poussée d'air.",
        context:
          "La différence vient de la tension et du souffle, pas seulement du volume.",
        type: "contrast",
        speak: "다|따|타",
      },
      {
        id: "c-ba-ppa-pa",
        word: "바 / 빠 / 파",
        rom: "ba / ppa / pa",
        mean: "Simple / tendu / aspiré",
        symbolic:
          "ㅂ est plus doux, ㅃ est plus explosif, ㅍ relâche l'air plus fort.",
        context:
          "Les lèvres passent d'une attaque douce à une tension sèche, puis à un souffle clair.",
        type: "contrast",
        speak: "바|빠|파",
      },
      {
        id: "c-ja-jja-cha",
        word: "자 / 짜 / 차",
        rom: "ja / jja / cha",
        mean: "Simple / tendu / aspiré",
        symbolic:
          "ㅈ est naturel, ㅉ contracte le son, ㅊ ajoute une aspiration nette.",
        context:
          "Le son passe d'une attaque douce à une attaque tendue, puis soufflée.",
        type: "contrast",
        speak: "자|짜|차",
      },
    ],
  },
  {
    id: "tense-words",
    title: "Mots tendus",
    koreanTitle: "된소리 단어",
    description:
      "Les consonnes tendues apparaissent dans beaucoup de mots très courants.",
    accent: COLORS.violet,
    curiosityHook:
      "Quand tu reconnais les consonnes tendues, les mots deviennent plus nets à l’oreille.",
    instruction:
      "Touche chaque mot pour entendre la tension dans un vrai mot coréen.",
    teaser:
      "Victoire. Tu peux maintenant reconnaître les consonnes tendues dans les mots coréens.",
    expressions: [
      {
        id: "w-kka",
        word: "꼬리",
        rom: "kko-ri",
        mean: "Queue",
        symbolic: "Le mot commence par ㄲ.",
        context: "La première syllabe contient une attaque tendue très nette.",
        type: "word",
        speak: "꼬리",
      },
      {
        id: "w-tta",
        word: "따다",
        rom: "tta-da",
        mean: "Cueillir / obtenir",
        symbolic: "Le mot commence par ㄸ.",
        context: "Le T est tendu, sans souffle.",
        type: "word",
        speak: "따다",
      },
      {
        id: "w-ppang",
        word: "빵",
        rom: "ppang",
        mean: "Pain",
        symbolic: "Le mot commence par ㅃ.",
        context: "Mot très courant en Corée.",
        type: "word",
        speak: "빵",
      },
      {
        id: "w-ssa",
        word: "싸다",
        rom: "ssa-da",
        mean: "Être bon marché / emballer",
        symbolic: "Le mot commence par ㅆ.",
        context: "Le sens dépend du contexte.",
        type: "word",
        speak: "싸다",
      },
      {
        id: "w-jjigae",
        word: "찌개",
        rom: "jji-gae",
        mean: "Ragoût coréen",
        symbolic: "Le mot commence par ㅉ.",
        context: "Mot très fréquent dans les restaurants coréens.",
        type: "word",
        speak: "찌개",
      },
    ],
  },
];

const shuffle = <T,>(items: T[]) => {
  return [...items].sort(() => Math.random() - 0.5);
};

const buildTenseQuestion = (
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
    id: `tense-${exp.id}`,
    expression: exp,
    prompt: "Quelle consonne tendue correspond à ce son ?",
    options: shuffle([correct, ...distractors]).slice(0, 4),
    correctAnswer: correct,
    questionType: "tense",
  };
};

const buildContrastQuestion = (
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
    id: `contrast-${exp.id}`,
    expression: exp,
    prompt: "Quel trio simple / tendu / aspiré correspond à ces sons ?",
    options: shuffle([correct, ...distractors]).slice(0, 4),
    correctAnswer: correct,
    questionType: "contrast",
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

const generateQuiz = (scene: Scene): QuizQuestion[] => {
  if (scene.id === "tense-force") {
    return scene.expressions.map((exp) =>
      buildTenseQuestion(exp, scene.expressions),
    );
  }

  if (scene.id === "contrast") {
    return scene.expressions.map((exp) =>
      buildContrastQuestion(exp, scene.expressions),
    );
  }

  if (scene.id === "tense-words") {
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
    return "Tu as parfaitement reconnu les tensions, les contrastes ou le sens. Tu peux continuer vers la suite !";
  }

  if (total - score <= 1) {
    return "Très solide. La séquence est validée, mais tu peux la refaire pour viser la maîtrise parfaite.";
  }

  if (ratio >= 0.8) {
    return "Tu es très proche. Recommence la séquence pour descendre à une seule erreur maximum.";
  }

  if (ratio >= 0.6) {
    return "Résultat encourageant. Revois encore quelques cartes pour stabiliser ton oreille.";
  }

  if (ratio >= 0.4) {
    return "Quelques bases sont là, mais il faut reprendre calmement la séquence.";
  }

  return "Ce n'est pas encore maîtrisé. Revois le cours, écoute les sons et prends ton temps.";
};

const getQuizTitle = (question?: QuizQuestion) => {
  if (!question) return "DÉFI DE MÉMORISATION";

  if (question.questionType === "tense") return "DÉFI DE TENSION";
  if (question.questionType === "contrast") return "DÉFI DE CONTRASTE";

  return "DÉFI DE COMPRÉHENSION";
};

export default function ConsonantsDoubleScreen() {
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
  const [activeSpeechSegment, setActiveSpeechSegment] = useState<{
    expressionId: string;
    index: number;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const quizSlideAnim = useRef(new Animated.Value(600)).current;
  const speechTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

    Speech.stop();

    speechTimers.current.forEach((timer) => clearTimeout(timer));
    speechTimers.current = [];
    setActiveSpeechSegment(null);
  }, [activeScene, fadeAnim]);

  useEffect(() => {
    return () => {
      speechTimers.current.forEach((timer) => clearTimeout(timer));
      speechTimers.current = [];
      setActiveSpeechSegment(null);
      Speech.stop();
    };
  }, []);

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

  const speak = (text: string, expressionId?: string) => {
    speechTimers.current.forEach((timer) => clearTimeout(timer));
    speechTimers.current = [];
    setActiveSpeechSegment(null);

    Speech.stop();

    const segments = text
      .split("|")
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length <= 1) {
      Speech.speak(text, {
        language: "ko-KR",
        rate: 0.75,
        pitch: 1,
        onDone: () => setActiveSpeechSegment(null),
        onStopped: () => setActiveSpeechSegment(null),
        onError: () => setActiveSpeechSegment(null),
      });
      return;
    }

    segments.forEach((segment, index) => {
      const timer = setTimeout(() => {
        if (expressionId) {
          setActiveSpeechSegment({ expressionId, index });
        }

        Speech.stop();
        Speech.speak(segment, {
          language: "ko-KR",
          rate: 0.75,
          pitch: 1,
        });
      }, index * 850);

      speechTimers.current.push(timer);
    });

    const clearHighlightTimer = setTimeout(() => {
      setActiveSpeechSegment(null);
    }, segments.length * 850);

    speechTimers.current.push(clearHighlightTimer);
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

    speak(exp.speak, exp.id);
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
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
              <AppText variant="sectionLabel" lineContract="singleLine" style={styles.backText}>TENSION</AppText>
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
              <AppText variant="label" style={styles.premiumToggleText}>
                {ambientMode ? "✨ MODE CALME" : "🔇 FOCUS"}
              </AppText>
            </Pressable>
          </View>

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

          <View style={styles.grid}>
            <View style={styles.toolboxHeader}>
              <AppText variant="sectionTitle" style={styles.sectionTitle}>TENSE TOOLBOX</AppText>
            </View>

            {activeScene.expressions.map((exp) => {
              const contrastParts =
                exp.type === "contrast"
                  ? exp.word.split("/").map((part) => part.trim())
                  : [];
              const activeSegmentIndex =
                activeSpeechSegment?.expressionId === exp.id
                  ? activeSpeechSegment.index
                  : -1;

              return (
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
                      {contrastParts.length > 0 ? (
                        <View style={styles.contrastWordRow}>
                          {contrastParts.map((part, index) => {
                            const isListening = activeSegmentIndex === index;

                            return (
                              <React.Fragment key={`${exp.id}-${part}`}>
                                <AppText variant="koreanPrimary" script="korean"
                                  style={[
                                    styles.expWord,
                                    styles.contrastWord,
                                    {
                                      color: isListening
                                        ? COLORS.bg
                                        : completedItems[exp.id]
                                          ? activeScene.accent
                                          : COLORS.pureWhite,
                                      backgroundColor: isListening
                                        ? activeScene.accent
                                        : "transparent",
                                      borderColor: isListening
                                        ? activeScene.accent
                                        : "rgba(255,255,255,0.08)",
                                    },
                                  ]}
                                >
                                  {part}
                                </AppText>

                                {index < contrastParts.length - 1 && (
                                  <AppText variant="bodyStrong" style={styles.contrastSlash}>/</AppText>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </View>
                      ) : (
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
                      )}

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
              );
            })}
          </View>

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
  backArrow: { color: COLORS.txt, marginRight: 5 },
  backText: {
    color: COLORS.muted,
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
  },
  eyebrow: {
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
  },
  krTitle: {
    marginBottom: 12,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontStyle: "italic",
    marginBottom: 22,
  },
  instructionBox: { paddingLeft: 18, borderLeftWidth: 4 },
  instructionText: {
    color: COLORS.txt,
    fontStyle: "italic",
  },

  grid: { marginTop: 35, gap: 18 },
  toolboxHeader: { marginBottom: 8 },
  sectionTitle: {
    color: "rgba(255,255,255,0.4)",
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
    marginBottom: 2,
  },
  contrastWordRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flexShrink: 1,
    gap: 7,
    maxWidth: "62%",
  },
  contrastWord: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  contrastSlash: {
    color: "rgba(255,255,255,0.38)",
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
  },
  romBox: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  romText: {
  },
  expDetail: {
    padding: 22,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  expSymbolic: {
    marginTop: 18,
  },
  expMean: {
    color: COLORS.txt,
    marginTop: 6,
    marginBottom: 4,
  },
  expCtx: {
    color: COLORS.muted,
    marginTop: 6,
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
    textAlign: "center",
    marginBottom: 12,
  },
  teaserBtn: {
  },

  quizOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
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
    textAlign: "center",
    marginBottom: 25,
  },
  quizQBox: { alignItems: "center", marginBottom: 35 },
  quizChar: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  quizInstruction: {
    color: COLORS.muted,
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
  },
  resultScoreTotal: {
    color: "rgba(255,255,255,0.45)",
    marginTop: 14,
  },
  resultTitle: {
    color: COLORS.pureWhite,
    textAlign: "center",
    marginBottom: 10,
  },
  resultTitleSmall: {
  },
  resultSubtitle: {
    color: "rgba(255,255,255,0.62)",
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
    marginBottom: 28,
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
  },
});
