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

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");

const COLORS = {
  bg: "#020306",
  cyan: "#22D3EE",
  pink: "#F472B6",
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
  type: "batchim" | "contrast" | "word";
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
  questionType: "sound" | "meaning" | "batchim" | "contrast";
};

const SCENES: Scene[] = [
  {
    id: "final-sounds",
    title: "La Finale",
    koreanTitle: "받침",
    description:
      "Le batchim est la consonne placée en bas d’une syllabe coréenne.",
    accent: COLORS.cyan,
    curiosityHook:
      "La fin d’une syllabe change toute la sensation du mot. Le batchim ferme le bloc sonore.",
    instruction: "Touche une finale pour entendre comment le son se ferme.",
    teaser:
      "Très bien. Tu comprends maintenant la consonne finale. Passons aux contrastes auditifs.",
    expressions: [
      {
        id: "b-k",
        word: "책",
        rom: "chaek",
        mean: "Livre",
        symbolic: "ㄱ en position finale donne un son K coupé.",
        context: "La bouche ferme le son rapidement à la fin.",
        type: "batchim",
        speak: "책",
        strokeSteps: 2,
      },
      {
        id: "b-n",
        word: "안",
        rom: "an",
        mean: "Intérieur / ne pas",
        symbolic: "ㄴ en finale donne un son N nasal.",
        context: "Le son finit dans le nez, doucement.",
        type: "batchim",
        speak: "안",
        strokeSteps: 2,
      },
      {
        id: "b-l",
        word: "달",
        rom: "dal",
        mean: "Lune / mois",
        symbolic: "ㄹ en finale donne un son L liquide.",
        context: "La langue reste placée pour fermer la syllabe.",
        type: "batchim",
        speak: "달",
        strokeSteps: 5,
      },
      {
        id: "b-m",
        word: "밤",
        rom: "bam",
        mean: "Son M final",
        symbolic: "ㅁ ferme le son avec les lèvres.",
        context: "La syllabe se termine bouche fermée.",
        type: "batchim",
        speak: "밤",
        strokeSteps: 4,
      },
      {
        id: "b-p",
        word: "입",
        rom: "ip",
        mean: "Bouche",
        symbolic: "ㅂ en finale donne un son P bloqué.",
        context: "Les lèvres ferment le son sans explosion forte.",
        type: "batchim",
        speak: "입",
        strokeSteps: 4,
      },
      {
        id: "b-ng",
        word: "강",
        rom: "gang",
        mean: "Rivière",
        symbolic: "ㅇ en finale donne le son NG.",
        context: "Le son finit dans la gorge, comme dans 'parking'.",
        type: "batchim",
        speak: "강",
        strokeSteps: 1,
      },
    ],
  },
  {
    id: "nasal-contrast",
    title: "N ou NG",
    koreanTitle: "ㄴ / ㅇ 구별",
    description:
      "ㄴ et ㅇ en finale sont proches, mais ils ne résonnent pas au même endroit.",
    accent: COLORS.pink,
    curiosityHook:
      "Le N finit devant, près de la langue. Le NG finit plus loin, dans la gorge.",
    instruction:
      "Écoute les paires : la deuxième syllabe descend plus profondément dans la gorge.",
    teaser:
      "Parfait. Ton oreille commence à entendre la profondeur du batchim. Passons aux mots utiles.",
    expressions: [
      {
        id: "c-gan-gang",
        word: "간 / 강",
        rom: "gan / gang",
        mean: "N final / NG final",
        symbolic: "간 finit avec la langue, 강 finit dans la gorge.",
        context: "Même départ, mais finale différente.",
        type: "contrast",
        speak: "간|강",
      },
      {
        id: "c-san-sang",
        word: "산 / 상",
        rom: "san / sang",
        mean: "N final / NG final",
        symbolic: "산 ferme devant, 상 résonne derrière.",
        context: "Contraste très utile pour entraîner l’oreille.",
        type: "contrast",
        speak: "산|상",
      },
      {
        id: "c-hyeon-hyeong",
        word: "현 / 형",
        rom: "hyeon / hyeong",
        mean: "N final / NG final",
        symbolic: "현 finit en N, 형 finit en NG.",
        context: "형 signifie grand frère pour un homme.",
        type: "contrast",
        speak: "현|형",
      },
      {
        id: "c-ban-bang",
        word: "반 / 방",
        rom: "ban / bang",
        mean: "Moitié / pièce",
        symbolic: "반 et 방 changent de sens avec la finale.",
        context: "Un seul batchim peut changer le mot entier.",
        type: "contrast",
        speak: "반|방",
      },
      {
        id: "c-mun-mung",
        word: "문 / 뭉",
        rom: "mun / mung",
        mean: "N final / NG final",
        symbolic: "문 finit avec ㄴ, 뭉 finit avec ㅇ.",
        context: "Très bon contraste pour sentir la gorge.",
        type: "contrast",
        speak: "문|뭉",
      },
    ],
  },
  {
    id: "daily-batchim",
    title: "Mots Fermés",
    koreanTitle: "받침 단어",
    description:
      "Les mots coréens du quotidien utilisent constamment des consonnes finales.",
    accent: COLORS.violet,
    curiosityHook:
      "Quand tu reconnais le batchim, le coréen devient moins flou : tu entends où la syllabe se ferme.",
    instruction: "Touche chaque mot pour entendre la fermeture finale.",
    teaser:
      "Victoire. Tu peux maintenant reconnaître les finales coréennes dans des mots réels.",
    expressions: [
      {
        id: "w-bap",
        word: "밥",
        rom: "bap",
        mean: "Riz cuit / repas",
        symbolic: "Le mot finit avec ㅂ, prononcé P final.",
        context: "Mot essentiel dans la vie quotidienne coréenne.",
        type: "word",
        speak: "밥",
      },
      {
        id: "w-jip",
        word: "집",
        rom: "jip",
        mean: "Maison",
        symbolic: "Le mot finit avec ㅂ, fermé par les lèvres.",
        context: "집 signifie maison ou chez-soi.",
        type: "word",
        speak: "집",
      },
      {
        id: "w-mul",
        word: "물",
        rom: "mul",
        mean: "Eau",
        symbolic: "Le mot finit avec ㄹ.",
        context: "La finale L est très fréquente en coréen.",
        type: "word",
        speak: "물",
      },
      {
        id: "w-bam",
        word: "밤",
        rom: "bam",
        mean: "Nuit / châtaigne",
        symbolic: "Le mot finit avec ㅁ.",
        context: "Le sens dépend du contexte.",
        type: "word",
        speak: "밤",
      },
      {
        id: "w-saram",
        word: "사람",
        rom: "sa-ram",
        mean: "Personne",
        symbolic: "La dernière syllabe finit avec ㅁ.",
        context: "Un mot fondamental en coréen.",
        type: "word",
        speak: "사람",
      },
    ],
  },
];

const shuffle = <T,>(items: T[]) => {
  return [...items].sort(() => Math.random() - 0.5);
};

const buildBatchimQuestion = (
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
    id: `batchim-${exp.id}`,
    expression: exp,
    prompt: "Quelle finale ou signification correspond à ce mot ?",
    options: shuffle([correct, ...distractors]).slice(0, 4),
    correctAnswer: correct,
    questionType: "batchim",
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
    prompt: "Quelle paire N / NG correspond à ces sons ?",
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
  if (scene.id === "final-sounds") {
    return scene.expressions.map((exp) =>
      buildBatchimQuestion(exp, scene.expressions),
    );
  }

  if (scene.id === "nasal-contrast") {
    return scene.expressions.map((exp) =>
      buildContrastQuestion(exp, scene.expressions),
    );
  }

  if (scene.id === "daily-batchim") {
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
    return "Tu as parfaitement reconnu les finales, les contrastes ou le sens. Tu peux continuer vers la suite !";
  }

  if (ratio >= 0.8) {
    return "Très solide. La séquence est validée, mais tu peux la refaire pour viser la maîtrise parfaite.";
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

  if (question.questionType === "batchim") return "DÉFI DE FINALE";
  if (question.questionType === "contrast") return "DÉFI N / NG";
  if (question.questionType === "sound") return "DÉFI DE PRONONCIATION";

  return "DÉFI DE COMPRÉHENSION";
};

export default function BatchimScreen() {
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
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>FINALES</Text>
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

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
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

          <View style={styles.grid}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.sectionTitle}>BATCHIM TOOLBOX</Text>
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
                                <Text
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
                                </Text>

                                {index < contrastParts.length - 1 && (
                                  <Text style={styles.contrastSlash}>/</Text>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </View>
                      ) : (
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
                      )}

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
                          {exp.symbolic || "Structure syllabique"}
                        </Text>

                        <Text style={styles.expMean}>{exp.mean}</Text>
                        <Text style={styles.expCtx}>{exp.context}</Text>
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
                <Text style={styles.teaserText}>
                  ✨ Tous les éléments sont découverts. Teste maintenant ta
                  reconnaissance.
                </Text>

                <Text style={[styles.teaserBtn, { color: activeScene.accent }]}>
                  DÉMARRER LE DÉFI →
                </Text>
              </Pressable>
            )}

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
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
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
  quizQBox: { alignItems: "center", marginBottom: 35 },
  quizChar: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 48,
    marginBottom: 2,
    textAlign: "center",
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
