import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Check,
  ChevronRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { HubModuleAccents, SeoulMidnightGlass } from "../../constants/theme";
import { getHangulModule, HANGUL_MODULES } from "../../data/hangul/curriculum";
import {
  createEmptyHangulLessonProgress,
  type HangulLessonProgress,
} from "../../data/hangul/types";
import { useHangulAudio } from "../../hooks/useHangulAudio";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import {
  advanceHangulQuiz,
  answerHangulQuizQuestion,
  createHangulQuizSession,
  restoreHangulQuizSession,
  shuffleHangulQuestions,
} from "../../lib/hangulQuiz";
import { trackHangulExerciseCompleted } from "../../lib/immersionStreak";
import { AppText } from "../app-text";
import { AppBackButton } from "../ui/app-back-button";
import { HangulAudioBadge } from "./HangulAudioBadge";
import { HangulReplayButton } from "./HangulReplayButton";

// ──────────────────────────────────────────────
// ASSETS
// ──────────────────────────────────────────────

const BACKGROUND_SOURCE = require("../../assets/images/vowelbasic.jpg");

// ──────────────────────────────────────────────
// SEOUL MIDNIGHT GLASS — HANGUL LESSON
// ──────────────────────────────────────────────

const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;

const MUTED = "rgba(241,245,249,0.78)";
const SOFT = "rgba(241,245,249,0.58)";
const HAIRLINE = "rgba(255,255,255,0.12)";

const HANGUL_ACCENT = HubModuleAccents.hangul.base;
const HANGUL_SECONDARY = "#5EEAD4";

const SUCCESS = "#4ADE80";
const WARNING = "#FDE047";
const ERROR = "#F87171";

const FUTURE = "rgba(148,163,184,0.42)";

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

const normalizeLesson = (
  value?: Partial<HangulLessonProgress>,
): HangulLessonProgress => ({
  ...createEmptyHangulLessonProgress(),
  ...value,

  discovered: {
    ...(value?.discovered ?? {}),
  },

  completedScenes: {
    ...(value?.completedScenes ?? {}),
  },

  masteredScenes: {
    ...(value?.masteredScenes ?? {}),
  },

  scores: {
    ...(value?.scores ?? {}),
  },

  errorsByCharacter: {
    ...(value?.errorsByCharacter ?? {}),
  },
});

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────

export function HangulLessonScreen({ moduleId }: { moduleId: string }) {
  const module = getHangulModule(moduleId);

  const { progress, updateHangulProgress, complete } = useStore();

  const responsive = useResponsiveLayout({
    maxWidth: 920,
  });

  const { playAudio, stopAudio } = useHangulAudio();

  const savedLesson = normalizeLesson(
    progress.hangulProgress.lessons[module.id],
  );

  const savedSceneIndex = module.scenes.findIndex(
    (scene) => scene.id === savedLesson.currentSceneId,
  );

  const savedSceneUnlocked =
    savedSceneIndex <= 0 ||
    !!savedLesson.masteredScenes[module.scenes[savedSceneIndex - 1]?.id];

  const initialScene =
    savedSceneUnlocked && savedSceneIndex >= 0
      ? module.scenes[savedSceneIndex]
      : module.scenes[0];

  const [activeSceneId, setActiveSceneId] = React.useState(initialScene.id);

  const [showRomanization, setShowRomanization] = React.useState(
    module.romanizationDefault,
  );

  const [quizActive, setQuizActive] = React.useState(false);

  const [quizSession, setQuizSession] = React.useState<
    HangulLessonProgress["activeQuiz"] | null
  >(null);

  const [quizComplete, setQuizComplete] = React.useState(false);

  const [result, setResult] = React.useState({
    score: 0,
    total: 0,
    mastered: false,
    hadCorrections: false,
  });

  const activeScene =
    module.scenes.find((scene) => scene.id === activeSceneId) ??
    module.scenes[0];

  const lesson = normalizeLesson(progress.hangulProgress.lessons[module.id]);

  const questions = quizSession?.questions ?? [];

  const questionIndex = quizSession?.questionIndex ?? 0;

  const answered = quizSession?.answered ?? null;

  const currentQuestion = questions[questionIndex];

  const correctAnswerLabel =
    currentQuestion?.options.find(
      (option) => option.value === currentQuestion.answer,
    )?.label ?? currentQuestion?.answer;

  const useCompactOptions = (currentQuestion?.options.length ?? 0) > 4;

  const discoveredCount = activeScene.cards.filter(
    (item) => lesson.discovered[item.id],
  ).length;

  const sceneMastered = !!lesson.masteredScenes[activeScene.id];

  const sceneCompleted = !!lesson.completedScenes[activeScene.id];

  const allScenesMastered = module.scenes.every(
    (scene) => !!lesson.masteredScenes[scene.id],
  );

  const masteredSceneCount = module.scenes.filter(
    (scene) => !!lesson.masteredScenes[scene.id],
  ).length;

  const activeSceneIndex = module.scenes.findIndex(
    (scene) => scene.id === activeScene.id,
  );

  const hasNextScene = activeSceneIndex < module.scenes.length - 1;

  const willContinueQuiz =
    questionIndex + 1 < questions.length ||
    (quizSession?.roundIncorrectQuestionIds.length ?? 0) > 0;

  const canStartQuiz = discoveredCount === activeScene.cards.length;

  const hasSavedQuiz =
    !!lesson.activeQuiz &&
    lesson.activeQuiz.sceneId === activeScene.id &&
    lesson.activeQuiz.questions.length > 0;

  const moduleIndex = HANGUL_MODULES.findIndex((item) => item.id === module.id);

  const prerequisite =
    moduleIndex > 0 ? HANGUL_MODULES[moduleIndex - 1] : undefined;

  const moduleUnlocked = !prerequisite || !!progress.completed[prerequisite.id];

  const moduleProgress =
    module.scenes.length > 0 ? masteredSceneCount / module.scenes.length : 0;

  const discoveryProgress =
    activeScene.cards.length > 0
      ? discoveredCount / activeScene.cards.length
      : 0;

  const modulePercentage = Math.round(moduleProgress * 100);

  const sceneStatus = sceneMastered
    ? "RÉUSSI"
    : sceneCompleted
      ? "À REVOIR"
      : discoveredCount > 0
        ? "EN COURS"
        : "À COMMENCER";

  // ──────────────────────────────────────────────
  // AUTO PLAY QUESTION AUDIO
  // ──────────────────────────────────────────────

  React.useEffect(() => {
    if (
      quizActive &&
      !quizComplete &&
      currentQuestion?.audio &&
      answered === null
    ) {
      const timer = setTimeout(() => {
        playAudio(currentQuestion.audio!);
      }, 250);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [answered, currentQuestion, playAudio, quizActive, quizComplete]);

  // ──────────────────────────────────────────────
  // MODULE COMPLETION
  // ──────────────────────────────────────────────

  React.useEffect(() => {
    if (allScenesMastered) {
      void complete(module.id);
    }
  }, [allScenesMastered, complete, module.id]);

  // ──────────────────────────────────────────────
  // PROGRESS UPDATE
  // ──────────────────────────────────────────────

  const updateLesson = (
    updater: (current: HangulLessonProgress) => HangulLessonProgress,
  ) => {
    updateHangulProgress((current) => ({
      ...current,

      lessons: {
        ...current.lessons,

        [module.id]: updater(normalizeLesson(current.lessons[module.id])),
      },
    }));
  };

  // ──────────────────────────────────────────────
  // SELECT SCENE
  // ──────────────────────────────────────────────

  const selectScene = (sceneId: string) => {
    const index = module.scenes.findIndex((scene) => scene.id === sceneId);

    if (index > 0 && !lesson.masteredScenes[module.scenes[index - 1].id]) {
      return;
    }

    setActiveSceneId(sceneId);

    setQuizActive(false);
    setQuizSession(null);
    setQuizComplete(false);

    stopAudio();

    updateLesson((current) => ({
      ...current,
      currentSceneId: sceneId,
    }));
  };

  // ──────────────────────────────────────────────
  // DISCOVER CARD
  // ──────────────────────────────────────────────

  const discover = (cardId: string, audio?: string) => {
    if (audio) {
      playAudio(audio);
    }

    Vibration.vibrate(8);

    updateLesson((current) => ({
      ...current,

      currentSceneId: activeScene.id,

      discovered: {
        ...current.discovered,

        [cardId]: true,
      },
    }));
  };

  // ──────────────────────────────────────────────
  // START / RESUME QUIZ
  // ──────────────────────────────────────────────

  const startQuiz = () => {
    if (!canStartQuiz) {
      return;
    }

    const saved = normalizeLesson(progress.hangulProgress.lessons[module.id]);

    const savedSession = saved.activeQuiz;

    // Reprendre une session existante uniquement
    // lorsque l'utilisateur appuie volontairement
    // sur "REPRENDRE L'EXERCICE".
    if (
      savedSession &&
      savedSession.sceneId === activeScene.id &&
      savedSession.questions.length > 0
    ) {
      const restoredSession = restoreHangulQuizSession(
        savedSession,
        activeScene.questions,
      );

      setQuizSession(restoredSession);
      setQuizComplete(false);
      setQuizActive(true);

      updateLesson((current) => ({
        ...current,

        currentSceneId: activeScene.id,

        activeQuiz: restoredSession,
      }));

      return;
    }

    // Nouvelle session.
    const baseQuestions = shuffleHangulQuestions(activeScene.questions, {
      shuffleQuestions: true,
    });

    const session = createHangulQuizSession(activeScene.id, baseQuestions);

    setQuizSession(session);
    setQuizComplete(false);
    setQuizActive(true);

    updateLesson((current) => ({
      ...current,

      currentSceneId: activeScene.id,

      activeQuiz: session,
    }));
  };

  // ──────────────────────────────────────────────
  // ANSWER QUIZ
  // ──────────────────────────────────────────────

  const answerQuestion = (value: string) => {
    if (!quizSession || !currentQuestion || answered !== null) {
      return;
    }

    const isCorrect = value === currentQuestion.answer;

    const nextSession = answerHangulQuizQuestion(quizSession, value);

    setQuizSession(nextSession);

    if (isCorrect) {
      Vibration.vibrate(15);
    } else {
      Vibration.vibrate([0, 60]);
    }

    updateLesson((current) => {
      const errors = {
        ...current.errorsByCharacter,
      };

      if (!isCorrect) {
        currentQuestion.characters.forEach((character) => {
          errors[character] = (errors[character] ?? 0) + 1;
        });
      }

      return {
        ...current,

        errorsByCharacter: errors,

        activeQuiz: nextSession,
      };
    });
  };

  // ──────────────────────────────────────────────
  // FINISH QUIZ
  // ──────────────────────────────────────────────

  const finishQuiz = (completedSession: NonNullable<typeof quizSession>) => {
    const total = completedSession.originalQuestionCount;

    const finalScore = completedSession.score;

    const mastered = total > 0 && finalScore === total;

    setResult({
      score: finalScore,
      total,
      mastered,
      hadCorrections: completedSession.round > 1,
    });

    setQuizComplete(true);

    const progressWrite = updateHangulProgress((current) => {
      const currentLesson = normalizeLesson(current.lessons[module.id]);

      const previousScore = currentLesson.scores[activeScene.id];

      const nextLesson: HangulLessonProgress = {
        ...currentLesson,

        currentSceneId: activeScene.id,

        activeQuiz: undefined,

        completedScenes: {
          ...currentLesson.completedScenes,

          [activeScene.id]: true,
        },

        masteredScenes: mastered
          ? {
              ...currentLesson.masteredScenes,

              [activeScene.id]: true,
            }
          : currentLesson.masteredScenes,

        scores: {
          ...currentLesson.scores,

          [activeScene.id]: {
            bestScore: Math.max(
              previousScore?.bestScore ?? 0,

              finalScore,
            ),

            total,

            attempts: (previousScore?.attempts ?? 0) + 1,
          },
        },
      };

      return {
        ...current,

        lessons: {
          ...current.lessons,

          [module.id]: nextLesson,
        },

        masteredCharacters: mastered
          ? {
              ...current.masteredCharacters,

              ...Object.fromEntries(
                [
                  ...(activeScene.introducedConsonants ?? []),

                  ...(activeScene.introducedVowels ?? []),

                  ...(activeScene.introducedFinals ?? []),
                ].map((item) => [item, true as const]),
              ),
            }
          : current.masteredCharacters,
      };
    });

    void Promise.all([
      progressWrite,

      complete(`${module.id}_${activeScene.id}`),

      trackHangulExerciseCompleted(`${module.id}_${activeScene.id}`),
    ]);
  };

  // ──────────────────────────────────────────────
  // CONTINUE QUIZ
  // ──────────────────────────────────────────────

  const continueQuiz = () => {
    if (!quizSession || !currentQuestion || answered === null) {
      return;
    }

    const advancement = advanceHangulQuiz(quizSession);

    if (advancement.status === "complete") {
      finishQuiz(advancement.session);

      return;
    }

    setQuizSession(advancement.session);

    updateLesson((current) => ({
      ...current,

      activeQuiz: advancement.session,
    }));
  };

  // ──────────────────────────────────────────────
  // CLOSE RESULT
  // ──────────────────────────────────────────────

  const closeResult = () => {
    setQuizActive(false);

    if (!result.mastered) {
      return;
    }

    const index = module.scenes.findIndex(
      (scene) => scene.id === activeScene.id,
    );

    const nextScene = module.scenes[index + 1];

    if (nextScene) {
      selectScene(nextScene.id);
    }
  };

  // ──────────────────────────────────────────────
  // LOCKED MODULE
  // ──────────────────────────────────────────────

  if (!moduleUnlocked && prerequisite) {
    return (
      <SafeAreaView style={styles.safe}>
        <ImageBackground
          source={BACKGROUND_SOURCE}
          style={styles.background}
          resizeMode="cover"
        >
          <BlurView
            intensity={28}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />

          <LinearGradient
            colors={[
              "rgba(2,3,6,0.62)",
              "rgba(2,3,6,0.82)",
              "rgba(2,3,6,0.97)",
            ]}
            locations={[0, 0.48, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <View
            style={[
              styles.gateFrame,

              {
                paddingHorizontal: responsive.horizontalPadding,

                maxWidth: responsive.maxWidth,
              },
            ]}
          >
            <BlurView intensity={72} tint="dark" style={styles.gateCard}>
              <LinearGradient
                colors={[
                  "rgba(103,232,249,0.08)",
                  "rgba(5,10,16,0.90)",
                  "rgba(2,3,6,0.97)",
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.glassTopHairline} />

              <View style={styles.gateIcon}>
                <LockKeyhole size={26} color={HANGUL_ACCENT} strokeWidth={2} />
              </View>

              <AppText variant="sectionLabel" style={styles.gateEyebrow}>
                PROGRESSION GUIDÉE
              </AppText>

              <AppText variant="screenTitle" style={styles.gateTitle}>
                Une étape avant celle-ci
              </AppText>

              <AppText
                variant="bodySecondary"
                tone="muted"
                style={styles.gateText}
              >
                Termine d’abord « {prerequisite.title} ». Les exemples
                n’utilisent que les caractères déjà étudiés.
              </AppText>

              <Pressable
                onPress={() => router.replace(prerequisite.route as never)}
                style={({ pressed }) => [
                  styles.primaryButton,

                  pressed && styles.pressablePressed,
                ]}
              >
                <LinearGradient
                  colors={[HANGUL_ACCENT, HANGUL_SECONDARY]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 0,
                  }}
                  style={styles.primaryGradient}
                >
                  <AppText variant="button" style={styles.primaryText}>
                    OUVRIR {prerequisite.title.toUpperCase()}
                  </AppText>

                  <ChevronRight size={18} strokeWidth={2.3} color="#020306" />
                </LinearGradient>
              </Pressable>
            </BlurView>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────
  // MAIN SCREEN
  // ──────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.background}
        resizeMode="cover"
      >
        {/* BACKGROUND */}

        <BlurView
          intensity={26}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />

        <LinearGradient
          colors={["rgba(2,3,6,0.42)", "rgba(2,3,6,0.66)", "rgba(2,3,6,0.92)"]}
          locations={[0, 0.46, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <View style={styles.ambientGlowTop} pointerEvents="none" />

        <View style={styles.ambientGlowBottom} pointerEvents="none" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,

            {
              paddingHorizontal: responsive.horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.frame,

              {
                maxWidth: responsive.maxWidth,
              },
            ]}
          >
            {/* HEADER */}

            <View style={styles.header}>
              <AppBackButton />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showRomanization
                    ? "Désactiver l'aide latine"
                    : "Activer l'aide latine"
                }
                onPress={() => setShowRomanization((current) => !current)}
                style={({ pressed }) => [
                  styles.helpToggle,

                  showRomanization && styles.helpToggleActive,

                  pressed && styles.helpTogglePressed,
                ]}
              >
                <View
                  style={[
                    styles.helpDot,

                    showRomanization && styles.helpDotActive,
                  ]}
                />

                <AppText
                  variant="caption"
                  lineContract="singleLine"
                  style={[
                    styles.helpText,

                    showRomanization && styles.helpTextActive,
                  ]}
                >
                  {showRomanization
                    ? "Aide latine · activée"
                    : "Aide latine · désactivée"}
                </AppText>
              </Pressable>
            </View>

            {/* HERO */}

            <View style={styles.hero}>
              <View style={styles.heroEyebrowRow}>
                <View style={styles.heroDot} />

                <AppText variant="sectionLabel" style={styles.heroEyebrow}>
                  HANGUL · {module.eyebrow}
                </AppText>
              </View>

              <AppText variant="screenTitle" style={styles.heroTitle}>
                {module.title}
              </AppText>

              <AppText
                variant="bodySecondary"
                tone="muted"
                style={styles.heroSubtitle}
              >
                {module.subtitle}
              </AppText>

              <View style={styles.heroMetaRow}>
                <View style={styles.heroLevelPill}>
                  <Sparkles size={15} strokeWidth={2} color={HANGUL_ACCENT} />

                  <AppText
                    variant="sectionLabel"
                    lineContract="singleLine"
                    style={styles.heroLevelText}
                  >
                    ÉTAPE HANGUL
                  </AppText>
                </View>

                <AppText variant="caption" style={styles.heroSceneCount}>
                  {masteredSceneCount} / {module.scenes.length} scènes
                  maîtrisées
                </AppText>
              </View>

              <View style={styles.heroProgressBlock}>
                <View style={styles.heroProgressMeta}>
                  <AppText variant="caption" style={styles.heroProgressLabel}>
                    PROGRESSION DE L'ÉTAPE
                  </AppText>

                  <AppText
                    variant="bodyStrong"
                    style={[
                      styles.heroProgressValue,

                      modulePercentage === 0 && styles.heroProgressStart,
                    ]}
                  >
                    {modulePercentage === 0
                      ? "Commencer"
                      : `${modulePercentage}%`}
                  </AppText>
                </View>

                <AnimatedProgressBar progress={moduleProgress} />
              </View>
            </View>

            {/* SCENE NAVIGATION */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {module.scenes.map((scene, index) => {
                const mastered = !!lesson.masteredScenes[scene.id];

                const completed = !!lesson.completedScenes[scene.id];

                const unlocked =
                  index === 0 ||
                  !!lesson.masteredScenes[module.scenes[index - 1].id];

                const selected = activeScene.id === scene.id;

                return (
                  <Pressable
                    key={scene.id}
                    disabled={!unlocked}
                    onPress={() => selectScene(scene.id)}
                    style={({ pressed }) => [
                      styles.tab,

                      selected && styles.tabActive,

                      mastered && styles.tabMastered,

                      !unlocked && styles.tabLocked,

                      pressed && unlocked && styles.tabPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.tabIndex,

                        selected && styles.tabIndexActive,

                        mastered && styles.tabIndexMastered,
                      ]}
                    >
                      {mastered ? (
                        <Check size={13} strokeWidth={2.5} color={SUCCESS} />
                      ) : !unlocked ? (
                        <LockKeyhole size={12} strokeWidth={2} color={FUTURE} />
                      ) : (
                        <AppText
                          variant="caption"
                          style={[
                            styles.tabNumber,

                            selected && styles.tabNumberActive,
                          ]}
                        >
                          {index + 1}
                        </AppText>
                      )}
                    </View>

                    <AppText
                      variant="caption"
                      lineContract="singleLine"
                      style={[
                        styles.tabText,

                        selected && styles.tabTextActive,

                        !unlocked && styles.tabTextLocked,
                      ]}
                    >
                      {scene.title}
                    </AppText>

                    {completed && !mastered ? (
                      <View style={styles.tabReviewDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* CURRENT SCENE */}

            <BlurView intensity={68} tint="dark" style={styles.sceneCard}>
              <LinearGradient
                colors={[
                  "rgba(34,211,238,0.10)",
                  "rgba(7,13,20,0.84)",
                  "rgba(2,3,6,0.95)",
                ]}
                locations={[0, 0.4, 1]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.sceneGlow} />

              <View style={styles.glassTopHairline} />

              <View style={styles.sceneTopRow}>
                <View style={styles.sceneKicker}>
                  <View style={styles.sceneKickerDot} />

                  <AppText
                    variant="sectionLabel"
                    style={styles.sceneKickerText}
                  >
                    SCÈNE {activeSceneIndex + 1}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.stateBadge,

                    sceneMastered
                      ? styles.stateBadgeSuccess
                      : sceneCompleted
                        ? styles.stateBadgeReview
                        : styles.stateBadgeActive,
                  ]}
                >
                  {sceneMastered ? (
                    <Check size={12} strokeWidth={2.4} color={SUCCESS} />
                  ) : null}

                  <AppText
                    variant="caption"
                    lineContract="singleLine"
                    style={[
                      styles.stateBadgeText,

                      sceneMastered
                        ? styles.stateBadgeTextSuccess
                        : sceneCompleted
                          ? styles.stateBadgeTextReview
                          : styles.stateBadgeTextActive,
                    ]}
                  >
                    {sceneStatus}
                  </AppText>
                </View>
              </View>

              <View style={styles.sceneTitleBlock}>
                <AppText variant="sceneTitle" style={styles.sceneTitle}>
                  {activeScene.title}
                </AppText>

                <AppText
                  variant="koreanSecondary"
                  script="korean"
                  style={styles.sceneKorean}
                >
                  {activeScene.koreanTitle}
                </AppText>
              </View>

              <AppText variant="body" style={styles.sceneDescription}>
                {activeScene.description}
              </AppText>

              <View style={styles.instruction}>
                <View style={styles.instructionAccent} />

                <AppText variant="bodySecondary" style={styles.instructionText}>
                  {activeScene.instruction}
                </AppText>
              </View>

              <View style={styles.sceneProgressBlock}>
                <View style={styles.sceneProgressMeta}>
                  <AppText variant="caption" style={styles.sceneProgressLabel}>
                    DÉCOUVERTE
                  </AppText>

                  <AppText
                    variant="bodyStrong"
                    style={styles.sceneProgressValue}
                  >
                    {discoveredCount} / {activeScene.cards.length}
                  </AppText>
                </View>

                <AnimatedProgressBar progress={discoveryProgress} />
              </View>
            </BlurView>

            {/* DISCOVERY HEADER */}

            <View style={styles.sectionHeader}>
              <View>
                <AppText variant="sectionLabel" style={styles.sectionEyebrow}>
                  DÉCOUVERTE
                </AppText>

                <AppText variant="caption" style={styles.sectionSubtitle}>
                  Écoute et révèle chaque carte
                </AppText>
              </View>

              <View style={styles.sectionLineWrap}>
                <View style={styles.sectionLineBase} />

                <LinearGradient
                  colors={["transparent", HANGUL_ACCENT, HANGUL_SECONDARY]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 0,
                  }}
                  style={styles.sectionLineGlow}
                />
              </View>

              <AppText variant="bodyStrong" style={styles.sectionCount}>
                {discoveredCount}/{activeScene.cards.length}
              </AppText>
            </View>

            {/* DISCOVERY CARDS */}

            <View style={styles.cardGrid}>
              {activeScene.cards.map((item) => {
                const discovered = !!lesson.discovered[item.id];

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => discover(item.id, item.audio)}
                    style={({ pressed }) => [
                      styles.cardPressable,

                      pressed && styles.pressablePressed,
                    ]}
                  >
                    <BlurView
                      intensity={discovered ? 58 : 48}
                      tint="dark"
                      style={[styles.card, discovered && styles.cardDiscovered]}
                    >
                      <LinearGradient
                        colors={
                          discovered
                            ? [
                                "rgba(34,211,238,0.08)",
                                "rgba(5,9,15,0.84)",
                                "rgba(2,3,6,0.94)",
                              ]
                            : [
                                "rgba(255,255,255,0.015)",
                                "rgba(5,9,15,0.82)",
                                "rgba(2,3,6,0.94)",
                              ]
                        }
                        start={{
                          x: 0,
                          y: 0,
                        }}
                        end={{
                          x: 1,
                          y: 1,
                        }}
                        style={StyleSheet.absoluteFillObject}
                      />

                      <View style={styles.glassTopHairline} />

                      {discovered ? <View style={styles.cardGlow} /> : null}

                      <View style={styles.cardTop}>
                        <View>
                          <AppText
                            variant="koreanPrimary"
                            script="korean"
                            style={[
                              styles.glyph,

                              discovered
                                ? styles.glyphDiscovered
                                : styles.glyphIdle,
                            ]}
                          >
                            {item.glyph}
                          </AppText>

                          {showRomanization && item.romanization ? (
                            <AppText
                              variant="caption"
                              style={styles.romanization}
                            >
                              {item.romanization}
                            </AppText>
                          ) : null}
                        </View>

                        {item.audio ? (
                          <HangulAudioBadge accent={HANGUL_ACCENT} />
                        ) : null}
                      </View>

                      <View style={styles.cardCopy}>
                        <AppText variant="bodyStrong" style={styles.cardLabel}>
                          {item.label}
                        </AppText>

                        {discovered ? (
                          <AppText
                            variant="bodySecondary"
                            tone="muted"
                            style={styles.cardExplanation}
                          >
                            {item.explanation}
                          </AppText>
                        ) : (
                          <AppText
                            variant="caption"
                            style={styles.cardRevealHint}
                          >
                            TOUCHER POUR DÉCOUVRIR
                          </AppText>
                        )}
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={styles.cardFooterLine}>
                          {discovered ? (
                            <View style={styles.cardFooterAccent} />
                          ) : null}
                        </View>

                        {discovered ? (
                          <View style={styles.discoveredBadge}>
                            <Check
                              size={12}
                              strokeWidth={2.5}
                              color={HANGUL_ACCENT}
                            />
                          </View>
                        ) : null}
                      </View>
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>

            {/* EXERCISE CTA */}

            <Pressable
              disabled={!canStartQuiz}
              onPress={startQuiz}
              style={({ pressed }) => [
                styles.primaryButton,

                !canStartQuiz && styles.buttonDisabled,

                pressed && canStartQuiz && styles.pressablePressed,
              ]}
            >
              <LinearGradient
                colors={
                  canStartQuiz
                    ? [HANGUL_ACCENT, HANGUL_SECONDARY]
                    : ["rgba(148,163,184,0.18)", "rgba(148,163,184,0.10)"]
                }
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={styles.primaryGradient}
              >
                <AppText
                  variant="button"
                  style={[
                    styles.primaryText,

                    !canStartQuiz && styles.primaryTextDisabled,
                  ]}
                >
                  {!canStartQuiz
                    ? `ÉCOUTE LES ${activeScene.cards.length} CARTES`
                    : hasSavedQuiz
                      ? "REPRENDRE L’EXERCICE"
                      : sceneMastered
                        ? "RECOMMENCER L’ÉTAPE"
                        : sceneCompleted
                          ? "REVOIR L’ÉTAPE"
                          : "COMMENCER L’ÉTAPE"}
                </AppText>

                {canStartQuiz ? (
                  <ChevronRight size={18} strokeWidth={2.3} color="#020306" />
                ) : null}
              </LinearGradient>
            </Pressable>

            {/* NEXT MODULE */}

            {allScenesMastered ? (
              <Pressable
                onPress={() => router.push(module.nextRoute as never)}
                style={({ pressed }) => [
                  styles.nextCardWrap,

                  pressed && styles.pressablePressed,
                ]}
              >
                <BlurView intensity={62} tint="dark" style={styles.nextCard}>
                  <LinearGradient
                    colors={[
                      "rgba(45,212,191,0.08)",
                      "rgba(5,9,15,0.86)",
                      "rgba(2,3,6,0.95)",
                    ]}
                    style={StyleSheet.absoluteFillObject}
                  />

                  <View style={styles.nextCardIcon}>
                    <Check size={18} strokeWidth={2.4} color={SUCCESS} />
                  </View>

                  <View style={styles.nextCardCopy}>
                    <AppText
                      variant="sectionLabel"
                      style={styles.nextCardEyebrow}
                    >
                      ÉTAPE TERMINÉE
                    </AppText>

                    <AppText variant="bodyStrong" style={styles.nextCardTitle}>
                      Toutes les scènes sont maîtrisées.
                    </AppText>

                    <AppText variant="caption" style={styles.nextCardAction}>
                      OUVRIR {module.nextLabel}
                    </AppText>
                  </View>

                  <View style={styles.nextCardArrow}>
                    <ChevronRight size={18} strokeWidth={2.3} color={SUCCESS} />
                  </View>
                </BlurView>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        {/* QUIZ */}

        {quizActive ? (
          <View style={styles.overlay}>
            <BlurView intensity={100} tint="dark" style={styles.quizSheet}>
              <LinearGradient
                colors={[
                  "rgba(15,27,36,0.98)",
                  "rgba(4,8,13,0.99)",
                  "rgba(2,3,6,1)",
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.quizTopHairline} />

              <ScrollView
                bounces={false}
                style={styles.quizScroll}
                contentContainerStyle={styles.quizContent}
                showsVerticalScrollIndicator={false}
              >
                {!quizComplete && currentQuestion ? (
                  <>
                    <View style={styles.quizHeader}>
                      <View>
                        <AppText
                          variant="sectionLabel"
                          style={styles.quizEyebrow}
                        >
                          QUESTION {questionIndex + 1} / {questions.length}
                        </AppText>

                        <AppText variant="caption" style={styles.quizContext}>
                          {activeScene.title}
                        </AppText>
                      </View>

                      {currentQuestion.audio ? (
                        <HangulReplayButton
                          accent={HANGUL_ACCENT}
                          onPress={() => playAudio(currentQuestion.audio!)}
                        />
                      ) : null}
                    </View>

                    <View style={styles.quizProgressTrack}>
                      <View
                        style={[
                          styles.quizProgressFill,

                          {
                            width: `${
                              ((questionIndex + 1) /
                                Math.max(questions.length, 1)) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>

                    {currentQuestion.display ? (
                      <AppText
                        variant="koreanHero"
                        script="korean"
                        align="center"
                        style={styles.questionDisplay}
                      >
                        {currentQuestion.display}
                      </AppText>
                    ) : null}

                    <AppText
                      variant="sceneTitle"
                      align="center"
                      style={styles.prompt}
                    >
                      {currentQuestion.prompt}
                    </AppText>

                    <View
                      style={[
                        styles.options,

                        useCompactOptions && styles.compactOptions,
                      ]}
                    >
                      {currentQuestion.options.map((item, index) => {
                        const isSelected = answered === item.value;

                        const isCorrect =
                          answered !== null &&
                          item.value === currentQuestion.answer;

                        if (item.audio) {
                          return (
                            <View
                              key={`${currentQuestion.id}-${item.value}-${index}`}
                              style={[
                                styles.option,
                                styles.audioOption,

                                isSelected && styles.optionWrong,

                                isCorrect && styles.optionCorrect,
                              ]}
                            >
                              <Pressable
                                onPress={() => playAudio(item.audio!)}
                                style={styles.audioListen}
                              >
                                <HangulAudioBadge accent={HANGUL_ACCENT} />

                                <View style={styles.audioListenCopy}>
                                  <AppText
                                    variant="caption"
                                    style={styles.audioListenLabel}
                                  >
                                    ÉCOUTER
                                  </AppText>

                                  <AppText variant="bodyStrong">
                                    {item.label}
                                  </AppText>
                                </View>
                              </Pressable>

                              <Pressable
                                disabled={answered !== null}
                                onPress={() => answerQuestion(item.value)}
                                style={styles.audioChoose}
                              >
                                <AppText
                                  variant="caption"
                                  style={styles.audioChooseText}
                                >
                                  CHOISIR
                                </AppText>
                              </Pressable>
                            </View>
                          );
                        }

                        return (
                          <Pressable
                            key={`${currentQuestion.id}-${item.value}-${index}`}
                            disabled={answered !== null}
                            onPress={() => answerQuestion(item.value)}
                            style={({ pressed }) => [
                              styles.option,

                              useCompactOptions && styles.compactOption,

                              isSelected && styles.optionWrong,

                              isCorrect && styles.optionCorrect,

                              pressed &&
                                answered === null &&
                                styles.optionPressed,
                            ]}
                          >
                            <AppText variant="bodyStrong" align="center">
                              {item.label}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>

                    {answered !== null ? (
                      <BlurView
                        intensity={52}
                        tint="dark"
                        style={[
                          styles.feedback,

                          answered === currentQuestion.answer
                            ? styles.feedbackCorrect
                            : styles.feedbackWrong,
                        ]}
                      >
                        <AppText
                          variant="bodyStrong"
                          style={{
                            color:
                              answered === currentQuestion.answer
                                ? SUCCESS
                                : ERROR,
                          }}
                        >
                          {answered === currentQuestion.answer
                            ? "Bonne lecture"
                            : `Bonne réponse : ${correctAnswerLabel}`}
                        </AppText>

                        <AppText
                          variant="bodySecondary"
                          style={styles.feedbackText}
                        >
                          {currentQuestion.explanation}
                        </AppText>

                        <Pressable
                          onPress={continueQuiz}
                          style={styles.continueButton}
                        >
                          <LinearGradient
                            colors={[HANGUL_ACCENT, HANGUL_SECONDARY]}
                            start={{
                              x: 0,
                              y: 0,
                            }}
                            end={{
                              x: 1,
                              y: 0,
                            }}
                            style={styles.continueGradient}
                          >
                            <AppText
                              variant="button"
                              style={styles.primaryText}
                            >
                              {willContinueQuiz ? "SUIVANT" : "TERMINER"}
                            </AppText>

                            <ChevronRight
                              size={17}
                              strokeWidth={2.3}
                              color="#020306"
                            />
                          </LinearGradient>
                        </Pressable>
                      </BlurView>
                    ) : null}
                  </>
                ) : (
                  <View style={styles.result}>
                    <View
                      style={[
                        styles.resultIcon,

                        result.mastered
                          ? styles.resultIconSuccess
                          : styles.resultIconReview,
                      ]}
                    >
                      {result.mastered ? (
                        <Check size={28} strokeWidth={2.5} color={SUCCESS} />
                      ) : (
                        <Sparkles size={26} strokeWidth={2} color={WARNING} />
                      )}
                    </View>

                    <AppText
                      variant="sectionLabel"
                      style={{
                        color: result.mastered ? SUCCESS : WARNING,
                      }}
                    >
                      {result.mastered ? "LECTURE RÉUSSIE" : "ÉTAPE TERMINÉE"}
                    </AppText>

                    <AppText variant="numericValue" style={styles.resultScore}>
                      {result.score}/{result.total}
                    </AppText>

                    <AppText
                      variant="bodySecondary"
                      align="center"
                      tone="muted"
                      style={styles.resultText}
                    >
                      {result.mastered
                        ? result.hadCorrections
                          ? "Les sons manqués sont revenus dans la session. Tu peux continuer."
                          : "Lecture réussie. Tu peux continuer."
                        : "Revois les caractères signalés, puis recommence."}
                    </AppText>

                    <Pressable
                      onPress={closeResult}
                      style={styles.resultButton}
                    >
                      <LinearGradient
                        colors={[HANGUL_ACCENT, HANGUL_SECONDARY]}
                        start={{
                          x: 0,
                          y: 0,
                        }}
                        end={{
                          x: 1,
                          y: 0,
                        }}
                        style={styles.continueGradient}
                      >
                        <AppText variant="button" style={styles.primaryText}>
                          {result.mastered
                            ? hasNextScene
                              ? "SUIVANT"
                              : "TERMINER"
                            : "REVOIR L’ÉTAPE"}
                        </AppText>

                        {result.mastered ? (
                          <ChevronRight
                            size={17}
                            strokeWidth={2.3}
                            color="#020306"
                          />
                        ) : null}
                      </LinearGradient>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </BlurView>
          </View>
        ) : null}
      </ImageBackground>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// ANIMATED PROGRESS BAR
// ──────────────────────────────────────────────

function AnimatedProgressBar({ progress }: { progress: number }) {
  const animatedProgress = React.useRef(new Animated.Value(0)).current;

  const safeProgress = Math.max(0, Math.min(1, progress));

  React.useEffect(() => {
    animatedProgress.setValue(0);

    const animation = Animated.timing(animatedProgress, {
      toValue: safeProgress,

      duration: 760,

      delay: 140,

      easing: Easing.out(Easing.cubic),

      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedProgress, safeProgress]);

  const width = animatedProgress.interpolate({
    inputRange: [0, 1],

    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,

          {
            width,
          },
        ]}
      >
        <LinearGradient
          colors={[HANGUL_ACCENT, HANGUL_SECONDARY]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  // ─────────────────────────────
  // ROOT
  // ─────────────────────────────

  safe: {
    flex: 1,

    backgroundColor: BG_DEEP,
  },

  background: {
    flex: 1,

    backgroundColor: BG_DEEP,

    overflow: "hidden",
  },

  scroll: {
    paddingTop: 8,

    paddingBottom: 120,
  },

  frame: {
    width: "100%",

    alignSelf: "center",
  },

  pressablePressed: {
    opacity: 0.84,

    transform: [
      {
        scale: 0.992,
      },
    ],
  },

  glassTopHairline: {
    position: "absolute",

    top: 0,

    left: 18,

    right: 18,

    height: 1,

    backgroundColor: "rgba(255,255,255,0.18)",

    opacity: 0.72,
  },

  ambientGlowTop: {
    position: "absolute",

    top: 120,

    right: -110,

    width: 250,

    height: 250,

    borderRadius: 125,

    backgroundColor: "rgba(103,232,249,0.025)",

    boxShadow: "0px 0px 70px rgba(103,232,249,0.05)",
  },

  ambientGlowBottom: {
    position: "absolute",

    top: 590,

    left: -140,

    width: 280,

    height: 280,

    borderRadius: 140,

    backgroundColor: "rgba(94,234,212,0.018)",

    boxShadow: "0px 0px 80px rgba(94,234,212,0.04)",
  },

  // ─────────────────────────────
  // HEADER
  // ─────────────────────────────

  header: {
    minHeight: 60,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 14,

    marginBottom: 28,
  },

  helpToggle: {
    minHeight: 38,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 13,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.12)",

    backgroundColor: "rgba(3,8,14,0.66)",
  },

  helpToggleActive: {
    borderColor: "rgba(103,232,249,0.22)",

    backgroundColor: "rgba(12,28,38,0.76)",
  },

  helpTogglePressed: {
    opacity: 0.75,
  },

  helpDot: {
    width: 5,

    height: 5,

    borderRadius: 3,

    marginRight: 7,

    backgroundColor: "rgba(148,163,184,0.52)",
  },

  helpDotActive: {
    backgroundColor: HANGUL_ACCENT,

    boxShadow: "0px 0px 7px rgba(103,232,249,0.70)",
  },

  helpText: {
    color: "rgba(241,245,249,0.66)",
  },

  helpTextActive: {
    color: "rgba(103,232,249,0.88)",
  },

  // ─────────────────────────────
  // HERO
  // ─────────────────────────────

  hero: {
    paddingHorizontal: 2,

    marginBottom: 20,
  },

  heroEyebrowRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 13,
  },

  heroDot: {
    width: 5,

    height: 5,

    borderRadius: 3,

    marginRight: 8,

    backgroundColor: HANGUL_ACCENT,

    boxShadow: "0px 0px 8px rgba(103,232,249,0.72)",
  },

  heroEyebrow: {
    color: "rgba(226,242,254,0.68)",

    letterSpacing: 1.3,
  },

  heroTitle: {
    color: TXT,

    maxWidth: 700,
  },

  heroSubtitle: {
    marginTop: 8,

    maxWidth: 600,

    color: MUTED,
  },

  heroMetaRow: {
    marginTop: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 14,
  },

  heroLevelPill: {
    minHeight: 32,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 11,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.20)",

    backgroundColor: "rgba(5,17,25,0.70)",
  },

  heroLevelText: {
    marginLeft: 7,

    color: "rgba(150,226,255,0.84)",
  },

  heroSceneCount: {
    color: "rgba(241,245,249,0.62)",

    textAlign: "right",
  },

  heroProgressBlock: {
    marginTop: 17,
  },

  heroProgressMeta: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 9,
  },

  heroProgressLabel: {
    color: SOFT,

    letterSpacing: 0.55,
  },

  heroProgressValue: {
    color: TXT,
  },

  heroProgressStart: {
    color: "rgba(103,232,249,0.90)",

    fontSize: 14,
  },

  progressTrack: {
    width: "100%",

    height: 4,

    borderRadius: 2,

    overflow: "hidden",

    backgroundColor: "rgba(255,255,255,0.095)",
  },

  progressFill: {
    height: "100%",

    borderRadius: 2,

    overflow: "hidden",
  },

  // ─────────────────────────────
  // SCENE TABS
  // ─────────────────────────────

  tabs: {
    gap: 8,

    paddingTop: 12,

    paddingBottom: 18,
  },

  tab: {
    minHeight: 42,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.10)",

    backgroundColor: "rgba(3,8,14,0.68)",
  },

  tabActive: {
    borderColor: "rgba(103,232,249,0.26)",

    backgroundColor: "rgba(12,28,38,0.82)",
  },

  tabMastered: {
    borderColor: "rgba(74,222,128,0.18)",

    backgroundColor: "rgba(5,20,18,0.74)",
  },

  tabLocked: {
    opacity: 0.48,
  },

  tabPressed: {
    opacity: 0.74,
  },

  tabIndex: {
    width: 22,

    height: 22,

    borderRadius: 11,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 7,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.10)",

    backgroundColor: "rgba(2,5,9,0.72)",
  },

  tabIndexActive: {
    borderColor: "rgba(103,232,249,0.26)",

    backgroundColor: "rgba(103,232,249,0.10)",
  },

  tabIndexMastered: {
    borderColor: "rgba(74,222,128,0.22)",

    backgroundColor: "rgba(74,222,128,0.07)",
  },

  tabNumber: {
    color: "rgba(241,245,249,0.64)",
  },

  tabNumberActive: {
    color: HANGUL_ACCENT,
  },

  tabText: {
    color: "rgba(241,245,249,0.70)",
  },

  tabTextActive: {
    color: "rgba(241,245,249,0.95)",
  },

  tabTextLocked: {
    color: "rgba(148,163,184,0.60)",
  },

  tabReviewDot: {
    width: 4,

    height: 4,

    borderRadius: 2,

    marginLeft: 7,

    backgroundColor: WARNING,
  },

  // ─────────────────────────────
  // CURRENT SCENE
  // ─────────────────────────────

  sceneCard: {
    minHeight: 250,

    padding: 20,

    borderRadius: 30,

    overflow: "hidden",

    position: "relative",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.24)",

    backgroundColor: "rgba(2,3,6,0.56)",

    boxShadow: "0px 12px 30px rgba(10,18,28,0.30)",
  },

  sceneGlow: {
    position: "absolute",

    top: -84,

    right: -58,

    width: 185,

    height: 185,

    borderRadius: 93,

    backgroundColor: HANGUL_ACCENT,

    opacity: 0.04,

    boxShadow: "0px 0px 48px rgba(103,232,249,0.12)",
  },

  sceneTopRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 12,

    marginBottom: 22,
  },

  sceneKicker: {
    minHeight: 30,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 10,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.11)",

    backgroundColor: "rgba(2,7,12,0.68)",
  },

  sceneKickerDot: {
    width: 5,

    height: 5,

    borderRadius: 3,

    marginRight: 7,

    backgroundColor: HANGUL_ACCENT,
  },

  sceneKickerText: {
    color: "rgba(241,245,249,0.66)",
  },

  stateBadge: {
    minHeight: 29,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 10,

    borderRadius: 999,

    borderWidth: 1,
  },

  stateBadgeActive: {
    borderColor: "rgba(103,232,249,0.25)",

    backgroundColor: "rgba(6,25,34,0.78)",
  },

  stateBadgeReview: {
    borderColor: "rgba(253,224,71,0.22)",

    backgroundColor: "rgba(31,28,8,0.72)",
  },

  stateBadgeSuccess: {
    borderColor: "rgba(74,222,128,0.22)",

    backgroundColor: "rgba(5,27,17,0.72)",
  },

  stateBadgeText: {
    marginLeft: 5,
  },

  stateBadgeTextActive: {
    color: "rgba(103,232,249,0.90)",
  },

  stateBadgeTextReview: {
    color: "rgba(253,224,71,0.84)",
  },

  stateBadgeTextSuccess: {
    color: "rgba(74,222,128,0.88)",
  },

  sceneTitleBlock: {
    maxWidth: 620,
  },

  sceneTitle: {
    color: TXT,
  },

  sceneKorean: {
    marginTop: 5,

    color: HANGUL_ACCENT,

    textShadowColor: "rgba(103,232,249,0.18)",

    textShadowOffset: {
      width: 0,

      height: 0,
    },

    textShadowRadius: 10,
  },

  sceneDescription: {
    marginTop: 18,

    maxWidth: 650,

    color: "rgba(245,247,250,0.90)",
  },

  instruction: {
    marginTop: 17,

    flexDirection: "row",

    borderRadius: 16,

    overflow: "hidden",

    backgroundColor: "rgba(7,12,18,0.68)",
  },

  instructionAccent: {
    width: 3,

    backgroundColor: HANGUL_ACCENT,
  },

  instructionText: {
    flex: 1,

    paddingHorizontal: 13,

    paddingVertical: 12,

    color: "rgba(241,245,249,0.82)",
  },

  sceneProgressBlock: {
    marginTop: 22,
  },

  sceneProgressMeta: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 8,
  },

  sceneProgressLabel: {
    color: "rgba(241,245,249,0.62)",

    letterSpacing: 0.55,
  },

  sceneProgressValue: {
    color: TXT,
  },

  // ─────────────────────────────
  // SECTION HEADER
  // ─────────────────────────────

  sectionHeader: {
    marginTop: 30,

    marginBottom: 14,

    flexDirection: "row",

    alignItems: "flex-end",

    gap: 12,
  },

  sectionEyebrow: {
    color: "rgba(241,245,249,0.72)",

    letterSpacing: 1.15,
  },

  sectionSubtitle: {
    marginTop: 3,

    color: "rgba(241,245,249,0.54)",
  },

  sectionLineWrap: {
    flex: 1,

    height: 10,

    justifyContent: "center",

    marginBottom: 2,

    position: "relative",
  },

  sectionLineBase: {
    height: 1,

    backgroundColor: "rgba(255,255,255,0.075)",
  },

  sectionLineGlow: {
    position: "absolute",

    right: 0,

    width: 92,

    height: 1,

    opacity: 0.82,
  },

  sectionCount: {
    color: "rgba(241,245,249,0.86)",

    marginBottom: 1,
  },

  // ─────────────────────────────
  // DISCOVERY CARDS
  // ─────────────────────────────

  cardGrid: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 14,
  },

  cardPressable: {
    flexGrow: 1,

    flexBasis: 280,

    minWidth: 0,
  },

  card: {
    minHeight: 168,

    padding: 18,

    borderRadius: 24,

    overflow: "hidden",

    position: "relative",

    borderWidth: 1,

    borderColor: HAIRLINE,

    backgroundColor: "rgba(2,3,6,0.56)",

    boxShadow: "0px 10px 24px rgba(0,0,0,0.28)",
  },

  cardDiscovered: {
    borderColor: "rgba(103,232,249,0.26)",

    boxShadow: "0px 12px 26px rgba(12,20,30,0.30)",
  },

  cardGlow: {
    position: "absolute",

    top: -55,

    right: -45,

    width: 125,

    height: 125,

    borderRadius: 63,

    backgroundColor: HANGUL_ACCENT,

    opacity: 0.035,
  },

  cardTop: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "space-between",

    gap: 14,
  },

  glyph: {
    flexShrink: 1,
  },

  glyphIdle: {
    color: "rgba(241,245,249,0.82)",
  },

  glyphDiscovered: {
    color: HANGUL_ACCENT,

    textShadowColor: "rgba(103,232,249,0.20)",

    textShadowOffset: {
      width: 0,

      height: 0,
    },

    textShadowRadius: 9,
  },

  romanization: {
    marginTop: 2,

    color: "rgba(103,232,249,0.86)",
  },

  cardCopy: {
    marginTop: 14,

    maxWidth: 540,
  },

  cardLabel: {
    color: TXT,
  },

  cardExplanation: {
    marginTop: 6,

    color: "rgba(241,245,249,0.84)",
  },

  cardRevealHint: {
    marginTop: 8,

    color: "rgba(241,245,249,0.46)",

    letterSpacing: 0.7,
  },

  cardFooter: {
    marginTop: "auto",

    paddingTop: 16,

    flexDirection: "row",

    alignItems: "center",

    gap: 10,
  },

  cardFooterLine: {
    flex: 1,

    height: 1,

    overflow: "hidden",

    backgroundColor: "rgba(255,255,255,0.075)",
  },

  cardFooterAccent: {
    width: 38,

    height: 1,

    backgroundColor: HANGUL_ACCENT,

    opacity: 0.84,
  },

  discoveredBadge: {
    width: 28,

    height: 28,

    borderRadius: 14,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.22)",

    backgroundColor: "rgba(6,24,32,0.74)",
  },

  // ─────────────────────────────
  // PRIMARY CTA
  // ─────────────────────────────

  primaryButton: {
    marginTop: 24,

    borderRadius: 20,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.18)",
  },

  buttonDisabled: {
    borderColor: "rgba(148,163,184,0.10)",
  },

  primaryGradient: {
    minHeight: 56,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 8,

    paddingHorizontal: 20,

    paddingVertical: 16,
  },

  primaryText: {
    color: "#020306",
  },

  primaryTextDisabled: {
    color: "rgba(241,245,249,0.48)",
  },

  // ─────────────────────────────
  // NEXT MODULE
  // ─────────────────────────────

  nextCardWrap: {
    marginTop: 16,

    borderRadius: 24,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(74,222,128,0.17)",

    backgroundColor: "rgba(2,3,6,0.50)",
  },

  nextCard: {
    minHeight: 112,

    flexDirection: "row",

    alignItems: "center",

    padding: 17,

    overflow: "hidden",

    position: "relative",
  },

  nextCardIcon: {
    width: 44,

    height: 44,

    borderRadius: 16,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 13,

    borderWidth: 1,

    borderColor: "rgba(74,222,128,0.20)",

    backgroundColor: "rgba(5,25,17,0.70)",
  },

  nextCardCopy: {
    flex: 1,

    minWidth: 0,
  },

  nextCardEyebrow: {
    color: "rgba(74,222,128,0.80)",
  },

  nextCardTitle: {
    marginTop: 3,

    color: TXT,
  },

  nextCardAction: {
    marginTop: 6,

    color: "rgba(74,222,128,0.80)",
  },

  nextCardArrow: {
    width: 34,

    height: 34,

    borderRadius: 17,

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 12,

    borderWidth: 1,

    borderColor: "rgba(74,222,128,0.20)",

    backgroundColor: "rgba(5,25,17,0.70)",
  },

  // ─────────────────────────────
  // LOCKED GATE
  // ─────────────────────────────

  gateFrame: {
    width: "100%",

    flex: 1,

    alignSelf: "center",

    justifyContent: "center",
  },

  gateCard: {
    minHeight: 280,

    padding: 24,

    borderRadius: 30,

    overflow: "hidden",

    position: "relative",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.20)",

    backgroundColor: "rgba(2,3,6,0.70)",
  },

  gateIcon: {
    width: 52,

    height: 52,

    borderRadius: 18,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 20,

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.20)",

    backgroundColor: "rgba(6,24,32,0.72)",
  },

  gateEyebrow: {
    color: "rgba(103,232,249,0.82)",
  },

  gateTitle: {
    marginTop: 10,

    color: TXT,
  },

  gateText: {
    marginTop: 10,

    maxWidth: 580,

    color: MUTED,
  },

  // ─────────────────────────────
  // QUIZ OVERLAY
  // ─────────────────────────────

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(2,3,6,0.84)",

    justifyContent: "flex-end",
  },

  quizSheet: {
    height: "92%",

    borderTopLeftRadius: 30,

    borderTopRightRadius: 30,

    overflow: "hidden",

    borderWidth: 1,

    borderBottomWidth: 0,

    borderColor: "rgba(103,232,249,0.14)",

    backgroundColor: BG_DEEP,
  },

  quizTopHairline: {
    position: "absolute",

    top: 0,

    left: 36,

    right: 36,

    height: 1,

    zIndex: 2,

    backgroundColor: "rgba(103,232,249,0.34)",
  },

  quizScroll: {
    flex: 1,
  },

  quizContent: {
    paddingHorizontal: 22,

    paddingTop: 25,

    paddingBottom: 38,
  },

  quizHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 12,
  },

  quizEyebrow: {
    color: "rgba(103,232,249,0.86)",

    letterSpacing: 1,
  },

  quizContext: {
    marginTop: 3,

    color: SOFT,
  },

  quizProgressTrack: {
    height: 3,

    marginTop: 18,

    borderRadius: 2,

    overflow: "hidden",

    backgroundColor: "rgba(255,255,255,0.09)",
  },

  quizProgressFill: {
    height: "100%",

    borderRadius: 2,

    backgroundColor: HANGUL_ACCENT,
  },

  questionDisplay: {
    marginTop: 25,

    color: HANGUL_ACCENT,

    textShadowColor: "rgba(103,232,249,0.18)",

    textShadowOffset: {
      width: 0,

      height: 0,
    },

    textShadowRadius: 12,
  },

  prompt: {
    marginTop: 20,

    marginBottom: 22,

    color: TXT,
  },

  options: {
    gap: 11,
  },

  compactOptions: {
    flexDirection: "row",

    flexWrap: "wrap",
  },

  option: {
    borderRadius: 18,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.13)",

    backgroundColor: "rgba(7,12,18,0.82)",

    paddingHorizontal: 16,

    paddingVertical: 16,
  },

  compactOption: {
    width: "46%",
  },

  optionPressed: {
    backgroundColor: "rgba(15,40,50,0.86)",

    borderColor: "rgba(103,232,249,0.22)",
  },

  audioOption: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 12,

    paddingVertical: 10,
  },

  audioListen: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    gap: 11,

    paddingVertical: 3,
  },

  audioListenCopy: {
    gap: 2,
  },

  audioListenLabel: {
    color: "rgba(103,232,249,0.84)",
  },

  audioChoose: {
    borderWidth: 1,

    borderRadius: 999,

    borderColor: "rgba(103,232,249,0.24)",

    backgroundColor: "rgba(6,24,32,0.78)",

    paddingHorizontal: 12,

    paddingVertical: 8,
  },

  audioChooseText: {
    color: "rgba(103,232,249,0.90)",
  },

  optionWrong: {
    borderColor: "rgba(248,113,113,0.52)",

    backgroundColor: "rgba(78,20,25,0.76)",
  },

  optionCorrect: {
    borderColor: "rgba(74,222,128,0.52)",

    backgroundColor: "rgba(9,57,34,0.72)",
  },

  feedback: {
    marginTop: 20,

    borderRadius: 22,

    borderWidth: 1,

    padding: 17,

    overflow: "hidden",
  },

  feedbackCorrect: {
    borderColor: "rgba(74,222,128,0.26)",

    backgroundColor: "rgba(7,30,19,0.78)",
  },

  feedbackWrong: {
    borderColor: "rgba(248,113,113,0.26)",

    backgroundColor: "rgba(38,10,15,0.80)",
  },

  feedbackText: {
    marginTop: 7,

    color: "rgba(241,245,249,0.82)",
  },

  continueButton: {
    marginTop: 15,

    borderRadius: 16,

    overflow: "hidden",
  },

  continueGradient: {
    minHeight: 50,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    paddingHorizontal: 18,

    paddingVertical: 14,
  },

  // ─────────────────────────────
  // RESULT
  // ─────────────────────────────

  result: {
    alignItems: "center",

    paddingVertical: 34,
  },

  resultIcon: {
    width: 62,

    height: 62,

    borderRadius: 22,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 19,

    borderWidth: 1,
  },

  resultIconSuccess: {
    borderColor: "rgba(74,222,128,0.24)",

    backgroundColor: "rgba(6,30,18,0.78)",
  },

  resultIconReview: {
    borderColor: "rgba(253,224,71,0.24)",

    backgroundColor: "rgba(32,28,7,0.76)",
  },

  resultScore: {
    marginTop: 14,

    color: TXT,
  },

  resultText: {
    maxWidth: 520,

    marginTop: 12,

    color: MUTED,
  },

  resultButton: {
    width: "100%",

    marginTop: 25,

    borderRadius: 16,

    overflow: "hidden",
  },
});
