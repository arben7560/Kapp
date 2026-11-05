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
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { ABSOLUTE_FILL } from "../../constants/layout";
import { HubModuleAccents, SeoulMidnightGlass } from "../../constants/theme";
import { getHangulModule, HANGUL_MODULES } from "../../data/hangul/curriculum";
import {
  createEmptyHangulLessonProgress,
  type HangulLessonProgress,
} from "../../data/hangul/types";
import { useHangulAudio } from "../../hooks/useHangulAudio";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { hangulUiText, hangulContentText, type HangulUiKey } from "../../lib/i18n/hangulDisplay";
import { needsHangulOptionTranslation } from "../../data/localized/hangulRegistry";
import type { HangulQuestionOption, HangulScene, HangulCard } from "../../data/hangul/types";
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

const BACKGROUND_SOURCE = require("../../assets/images/vowelbasic.jpg");

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

const normalizeLesson = (
  value?: Partial<HangulLessonProgress>,
): HangulLessonProgress => ({
  ...createEmptyHangulLessonProgress(),
  ...value,
  discovered: { ...(value?.discovered ?? {}) },
  completedScenes: { ...(value?.completedScenes ?? {}) },
  masteredScenes: { ...(value?.masteredScenes ?? {}) },
  scores: { ...(value?.scores ?? {}) },
  errorsByCharacter: { ...(value?.errorsByCharacter ?? {}) },
});

export function HangulLessonScreen({ moduleId }: { moduleId: string }) {
  const { i18n } = useTranslation("hangul");
  const uiScript = i18n.resolvedLanguage === "ja" ? "japanese" : "latin";
  const l = (key: HangulUiKey, values?: Record<string, string | number>) => hangulUiText(i18n, key, values);
  const module = getHangulModule(moduleId);
  const mc = (field: string, original: string) => hangulContentText(i18n, "module", [module.id], field, original);
  const sc = (scene: HangulScene, field: string, original: string) =>
    hangulContentText(i18n, "scene", [module.id, scene.id], field, original);
  const cc = (card: HangulCard, field: string, original: string) =>
    hangulContentText(i18n, "card", [module.id, activeScene.id, card.id], field, original);
  const qc = (questionId: string, field: string, original: string) =>
    hangulContentText(i18n, "question", [module.id, activeScene.id, questionId], field, original);

  const { progress, updateHangulProgress, complete } = useStore();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const responsive = useResponsiveLayout({
    maxWidth: isLandscape ? 1120 : 920,
  });
  const discoveryGridGap = 14;
  const discoveryMinCardWidth = 220;
  const safeContentWidth = Math.min(
    responsive.maxWidth,
    Math.max(
      0,
      width - insets.left - insets.right - responsive.horizontalPadding * 2,
    ),
  );
  const landscapeDiscoveryColumns = !isLandscape
    ? 1
    : Math.max(
        1,
        Math.min(
          3,
          Math.floor(
            (responsive.contentWidth + discoveryGridGap) /
              (discoveryMinCardWidth + discoveryGridGap),
          ),
        ),
      );
  const landscapeCardWidth =
    isLandscape && landscapeDiscoveryColumns > 1
      ? responsive.getGridItemWidth(landscapeDiscoveryColumns, discoveryGridGap)
      : "100%";
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
  const originalQuestion = activeScene.questions.find(question => question.id === currentQuestion?.id);
  const displayedOption = (option: HangulQuestionOption): string => {
    if (!currentQuestion || !needsHangulOptionTranslation(option.label)) return option.label;
    const originalIndex = originalQuestion?.options.findIndex(item => item.value === option.value) ?? -1;
    if (originalIndex < 0) throw new Error(`Unknown option for Hangul question ${currentQuestion.id}`);
    return qc(currentQuestion.id, `option${originalIndex}`, option.label);
  };
  const correctAnswerOption = currentQuestion?.options.find(
    option => option.value === currentQuestion.answer,
  );
  const correctAnswerLabel = correctAnswerOption
    ? displayedOption(correctAnswerOption)
    : currentQuestion?.answer;
  const isCurrentAnswerCorrect =
    answered !== null && answered === currentQuestion?.answer;
  const teacherFeedback = currentQuestion
    ? l(`feedback.${currentQuestion.type}.${isCurrentAnswerCorrect ? "correct" : "incorrect"}` as HangulUiKey)
    : "";
  const useCompactOptions = (currentQuestion?.options.length ?? 0) > 4;
  const useLandscapeQuizLayout = isLandscape && safeContentWidth >= 680;
  const useLandscapeQuizOptionGrid =
    useLandscapeQuizLayout &&
    !currentQuestion?.options.some((option) => !!option.audio);
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
  const sceneStatus = l(sceneMastered
    ? "lesson.statusMastered"
    : sceneCompleted
      ? "lesson.statusReview"
      : discoveredCount > 0
        ? "lesson.statusActive"
        : "lesson.statusNew");

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
      return () => clearTimeout(timer);
    }
  }, [answered, currentQuestion, playAudio, quizActive, quizComplete]);

  React.useEffect(() => {
    if (allScenesMastered) void complete(module.id);
  }, [allScenesMastered, complete, module.id]);

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

  const selectScene = (sceneId: string) => {
    const index = module.scenes.findIndex((scene) => scene.id === sceneId);
    if (index > 0 && !lesson.masteredScenes[module.scenes[index - 1].id])
      return;
    setActiveSceneId(sceneId);
    setQuizActive(false);
    setQuizSession(null);
    setQuizComplete(false);
    stopAudio();
    updateLesson((current) => ({ ...current, currentSceneId: sceneId }));
  };

  const discover = (cardId: string, audio?: string) => {
    if (audio) playAudio(audio);
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

  const startQuiz = () => {
    if (!canStartQuiz) return;
    const saved = normalizeLesson(progress.hangulProgress.lessons[module.id]);
    const savedSession = saved.activeQuiz;

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

  const answerQuestion = (value: string) => {
    if (!quizSession || !currentQuestion || answered !== null) return;
    const isCorrect = value === currentQuestion.answer;
    const nextSession = answerHangulQuizQuestion(quizSession, value);
    setQuizSession(nextSession);
    if (isCorrect) Vibration.vibrate(15);
    else Vibration.vibrate([0, 60]);

    updateLesson((current) => {
      const errors = { ...current.errorsByCharacter };
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
            bestScore: Math.max(previousScore?.bestScore ?? 0, finalScore),
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

  const continueQuiz = () => {
    if (!quizSession || !currentQuestion || answered === null) return;
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

  const closeResult = () => {
    setQuizActive(false);
    if (!result.mastered) return;
    const index = module.scenes.findIndex(
      (scene) => scene.id === activeScene.id,
    );
    const nextScene = module.scenes[index + 1];
    if (nextScene) selectScene(nextScene.id);
  };

  const BackgroundLayers = () => (
    <>
      <BlurView intensity={18} tint="dark" style={styles.bgBlur} />
      <View style={styles.vignetteOverlay} />
      <LinearGradient
        colors={["rgba(2,3,6,0.10)", "rgba(2,3,6,0.22)", "rgba(2,3,6,0.72)"]}
        locations={[0, 0.44, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.ambientGlowTop} pointerEvents="none" />
      <View style={styles.ambientGlowBottom} pointerEvents="none" />
    </>
  );

  if (!moduleUnlocked && prerequisite) {
    return (
      <SafeAreaView style={styles.safe}>
        <ImageBackground
          source={BACKGROUND_SOURCE}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <BackgroundLayers />
          <View
            style={[
              styles.gateFrame,
              isLandscape && styles.gateFrameLandscape,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: isLandscape ? 680 : responsive.maxWidth,
              },
            ]}
          >
            <BlurView
              intensity={72}
              tint="dark"
              style={[styles.gateCard, isLandscape && styles.gateCardLandscape]}
            >
              <LinearGradient
                colors={[
                  "rgba(103,232,249,0.08)",
                  "rgba(5,10,16,0.90)",
                  "rgba(2,3,6,0.97)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.glassTopHairline} />
              <View style={styles.gateIcon}>
                <LockKeyhole size={26} color={HANGUL_ACCENT} strokeWidth={2} />
              </View>
              <AppText script={uiScript} variant="sectionLabel" style={styles.gateEyebrow}>
                {l("lesson.gateEyebrow")}
              </AppText>
              <AppText script={uiScript} variant="screenTitle" style={styles.gateTitle}>
                {l("lesson.gateTitle")}
              </AppText>
              <AppText script={uiScript}
                variant="bodySecondary"
                tone="muted"
                style={styles.gateText}
              >
                {l("lesson.gateDescription", { title: hangulContentText(i18n, "module", [prerequisite.id], "title", prerequisite.title) })}
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
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.primaryGradient,
                    isLandscape && styles.primaryGradientLandscape,
                  ]}
                >
                  <AppText script={uiScript} variant="button" style={styles.primaryText}>
                    {l("lesson.gateOpen", { title: hangulContentText(i18n, "module", [prerequisite.id], "title", uiScript === "latin" ? prerequisite.title.toUpperCase() : prerequisite.title) })}
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

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <BackgroundLayers />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            isLandscape && styles.scrollLandscape,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.frame, { maxWidth: responsive.maxWidth }]}>
            <View
              style={[styles.header, isLandscape && styles.headerLandscape]}
            >
              <View style={isLandscape ? styles.headerSide : undefined}>
                <AppBackButton />
              </View>

              {isLandscape ? (
                <View style={styles.headerCenter} pointerEvents="none">
                  <AppText script={uiScript}
                    variant="screenTitle"
                    lineContract="singleLine"
                    style={styles.headerLandscapeTitle}
                  >
                    {mc("title", module.title)}
                  </AppText>
                </View>
              ) : null}

              <View style={isLandscape ? styles.headerSideRight : undefined}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showRomanization
                      ? l("lesson.disableRomanization")
                      : l("lesson.enableRomanization")
                  }
                  onPress={() => setShowRomanization((current) => !current)}
                  style={({ pressed }) => [
                    styles.helpToggle,
                    isLandscape && styles.helpToggleLandscape,
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
                  <AppText script={uiScript}
                    variant="caption"
                    lineContract="singleLine"
                    style={[
                      styles.helpText,
                      showRomanization && styles.helpTextActive,
                    ]}
                  >
                    {showRomanization
                      ? l("lesson.romanizationOn")
                      : l("lesson.romanizationOff")}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <View style={[styles.hero, isLandscape && styles.heroLandscape]}>
              <View
                style={[
                  styles.heroEyebrowRow,
                  isLandscape && styles.heroEyebrowRowLandscape,
                ]}
              >
                <View style={styles.heroDot} />
                <AppText script={uiScript} variant="sectionLabel" style={styles.heroEyebrow}>
                  {l("lesson.heroEyebrow", { title: mc("eyebrow", module.eyebrow) })}
                </AppText>
              </View>
              {!isLandscape ? (
                <AppText script={uiScript} variant="screenTitle" style={styles.heroTitle}>
                  {mc("title", module.title)}
                </AppText>
              ) : null}
              <AppText script={uiScript}
                variant="bodySecondary"
                tone="muted"
                style={[
                  styles.heroSubtitle,
                  isLandscape && styles.heroSubtitleLandscape,
                ]}
              >
                {mc("subtitle", module.subtitle)}
              </AppText>
              <View
                style={[
                  styles.heroMetaRow,
                  isLandscape && styles.heroMetaRowLandscape,
                ]}
              >
                <View style={styles.heroLevelPill}>
                  <Sparkles size={15} strokeWidth={2} color={HANGUL_ACCENT} />
                  <AppText script={uiScript}
                    variant="sectionLabel"
                    lineContract="singleLine"
                    style={styles.heroLevelText}
                  >
                    {l("lesson.stage")}
                  </AppText>
                </View>
                <AppText script={uiScript} variant="caption" style={styles.heroSceneCount}>
                  {l("lesson.scenesMastered", { count: masteredSceneCount, total: module.scenes.length })}
                </AppText>
              </View>
              <View
                style={[
                  styles.heroProgressBlock,
                  isLandscape && styles.heroProgressBlockLandscape,
                ]}
              >
                <View style={styles.heroProgressMeta}>
                  <AppText script={uiScript} variant="caption" style={styles.heroProgressLabel}>
                    {l("lesson.stepProgress")}
                  </AppText>
                  <AppText script={uiScript}
                    variant="bodyStrong"
                    style={[
                      styles.heroProgressValue,
                      modulePercentage === 0 && styles.heroProgressStart,
                    ]}
                  >
                    {modulePercentage === 0
                      ? l("lesson.start")
                      : `${modulePercentage}%`}
                  </AppText>
                </View>
                <AnimatedProgressBar progress={moduleProgress} />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.tabs,
                isLandscape && styles.tabsLandscape,
              ]}
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
                      isLandscape && styles.tabLandscape,
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
                        <AppText script={uiScript}
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
                    <AppText script={uiScript}
                      variant="caption"
                      lineContract="singleLine"
                      style={[
                        styles.tabText,
                        selected && styles.tabTextActive,
                        !unlocked && styles.tabTextLocked,
                      ]}
                    >
                      {sc(scene, "title", scene.title)}
                    </AppText>
                    {completed && !mastered ? (
                      <View style={styles.tabReviewDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>

            <BlurView
              intensity={68}
              tint="dark"
              style={[
                styles.sceneCard,
                isLandscape && styles.sceneCardLandscape,
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(34,211,238,0.10)",
                  "rgba(7,13,20,0.84)",
                  "rgba(2,3,6,0.95)",
                ]}
                locations={[0, 0.4, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.sceneGlow} />
              <View style={styles.glassTopHairline} />
              <View
                style={[
                  styles.sceneTopRow,
                  isLandscape && styles.sceneTopRowLandscape,
                ]}
              >
                <View style={styles.sceneKicker}>
                  <View style={styles.sceneKickerDot} />
                  <AppText script={uiScript}
                    variant="sectionLabel"
                    style={styles.sceneKickerText}
                  >
                    {l("lesson.sceneLabel", { number: activeSceneIndex + 1 })}
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
                  <AppText script={uiScript}
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
                <AppText script={uiScript} variant="sceneTitle" style={styles.sceneTitle}>
                  {sc(activeScene, "title", activeScene.title)}
                </AppText>
                <AppText
                  variant="koreanSecondary"
                  script="korean"
                  style={styles.sceneKorean}
                >
                  {activeScene.koreanTitle}
                </AppText>
              </View>
              <AppText script={uiScript}
                variant="body"
                style={[
                  styles.sceneDescription,
                  isLandscape && styles.sceneDescriptionLandscape,
                ]}
              >
                {sc(activeScene, "description", activeScene.description)}
              </AppText>
              <View
                style={[
                  styles.instruction,
                  isLandscape && styles.instructionLandscape,
                ]}
              >
                <View style={styles.instructionAccent} />
                <AppText script={uiScript}
                  variant="bodySecondary"
                  style={[
                    styles.instructionText,
                    isLandscape && styles.instructionTextLandscape,
                  ]}
                >
                  {sc(activeScene, "instruction", activeScene.instruction)}
                </AppText>
              </View>
              <View
                style={[
                  styles.sceneProgressBlock,
                  isLandscape && styles.sceneProgressBlockLandscape,
                ]}
              >
                <View style={styles.sceneProgressMeta}>
                  <AppText script={uiScript} variant="caption" style={styles.sceneProgressLabel}>
                    {l("lesson.discovery")}
                  </AppText>
                  <AppText script={uiScript}
                    variant="bodyStrong"
                    style={styles.sceneProgressValue}
                  >
                    {discoveredCount} / {activeScene.cards.length}
                  </AppText>
                </View>
                <AnimatedProgressBar progress={discoveryProgress} />
              </View>
            </BlurView>

            <View
              style={[
                styles.sectionHeader,
                isLandscape && styles.sectionHeaderLandscape,
              ]}
            >
              <View>
                <AppText script={uiScript} variant="sectionLabel" style={styles.sectionEyebrow}>
                  {l("lesson.discovery")}
                </AppText>
                <AppText script={uiScript} variant="caption" style={styles.sectionSubtitle}>
                  {l("lesson.discoveryHint")}
                </AppText>
              </View>
              <View style={styles.sectionLineWrap}>
                <View style={styles.sectionLineBase} />
                <LinearGradient
                  colors={["transparent", HANGUL_ACCENT, HANGUL_SECONDARY]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sectionLineGlow}
                />
              </View>
              <AppText script={uiScript} variant="bodyStrong" style={styles.sectionCount}>
                {discoveredCount}/{activeScene.cards.length}
              </AppText>
            </View>

            <View
              style={[styles.cardGrid, isLandscape && styles.cardGridLandscape]}
            >
              {activeScene.cards.map((item) => {
                const discovered = !!lesson.discovered[item.id];
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => discover(item.id, item.audio)}
                    style={({ pressed }) => [
                      styles.cardPressable,
                      isLandscape && {
                        width: landscapeCardWidth,
                        flexBasis: "auto",
                        flexGrow: 0,
                      },
                      pressed && styles.pressablePressed,
                    ]}
                  >
                    <BlurView
                      intensity={discovered ? 58 : 48}
                      tint="dark"
                      style={[
                        styles.card,
                        isLandscape && styles.cardLandscape,
                        discovered && styles.cardDiscovered,
                      ]}
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
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.glassTopHairline} />
                      {discovered ? <View style={styles.cardGlow} /> : null}
                      <View
                        style={[
                          styles.cardTop,
                          isLandscape && styles.cardTopLandscape,
                        ]}
                      >
                        <View
                          style={
                            isLandscape ? styles.glyphGroupLandscape : undefined
                          }
                        >
                          <AppText
                            variant="koreanPrimary"
                            script="korean"
                            align={isLandscape ? "center" : undefined}
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
                            <AppText script={uiScript}
                              variant="caption"
                              align={isLandscape ? "center" : undefined}
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
                      <View
                        style={[
                          styles.cardCopy,
                          isLandscape && styles.cardCopyLandscape,
                        ]}
                      >
                        <AppText script={uiScript}
                          variant="bodyStrong"
                          align={isLandscape ? "center" : undefined}
                          style={styles.cardLabel}
                        >
                          {cc(item, "label", item.label)}
                        </AppText>
                        {discovered ? (
                          <AppText script={uiScript}
                            variant="bodySecondary"
                            tone="muted"
                            align={isLandscape ? "center" : undefined}
                            style={styles.cardExplanation}
                          >
                            {cc(item, "explanation", item.explanation)}
                          </AppText>
                        ) : (
                          <AppText script={uiScript}
                            variant="caption"
                            align={isLandscape ? "center" : undefined}
                            style={styles.cardRevealHint}
                          >
                            {l("lesson.tapReveal")}
                          </AppText>
                        )}
                      </View>
                      <View
                        style={[
                          styles.cardFooter,
                          isLandscape && styles.cardFooterLandscape,
                        ]}
                      >
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

            <Pressable
              disabled={!canStartQuiz}
              onPress={startQuiz}
              style={({ pressed }) => [
                styles.primaryButton,
                isLandscape && styles.primaryButtonLandscape,
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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.primaryGradient,
                  isLandscape && styles.primaryGradientLandscape,
                ]}
              >
                <AppText script={uiScript}
                  variant="button"
                  style={[
                    styles.primaryText,
                    !canStartQuiz && styles.primaryTextDisabled,
                  ]}
                >
                  {!canStartQuiz
                    ? l("lesson.listenCards", { count: activeScene.cards.length })
                    : hasSavedQuiz
                      ? l("lesson.resumeQuiz")
                      : sceneMastered
                        ? l("lesson.restartStage")
                        : sceneCompleted
                          ? l("lesson.reviewStage")
                          : l("lesson.startStage")}
                </AppText>
                {canStartQuiz ? (
                  <ChevronRight size={18} strokeWidth={2.3} color="#020306" />
                ) : null}
              </LinearGradient>
            </Pressable>

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
                    <AppText script={uiScript}
                      variant="sectionLabel"
                      style={styles.nextCardEyebrow}
                    >
                      {l("lesson.stageCompleted")}
                    </AppText>
                    <AppText script={uiScript} variant="bodyStrong" style={styles.nextCardTitle}>
                      {l("lesson.allScenesMastered")}
                    </AppText>
                    <AppText script={uiScript} variant="caption" style={styles.nextCardAction}>
                      {l("lesson.openNext", { title: mc("nextLabel", module.nextLabel) })}
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

        {quizActive ? (
          <View
            style={[
              styles.overlay,
              useLandscapeQuizLayout && styles.overlayLandscape,
            ]}
          >
            <BlurView
              intensity={100}
              tint="dark"
              style={[
                styles.quizSheet,
                useLandscapeQuizLayout && styles.quizSheetLandscape,
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(15,27,36,0.98)",
                  "rgba(4,8,13,0.99)",
                  "rgba(2,3,6,1)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.quizTopHairline} />
              <ScrollView
                bounces={false}
                style={styles.quizScroll}
                contentContainerStyle={[
                  styles.quizContent,
                  useLandscapeQuizLayout && styles.quizContentLandscape,
                ]}
                showsVerticalScrollIndicator={false}
              >
                {!quizComplete && currentQuestion ? (
                  <View
                    style={[
                      styles.quizQuestionLayout,
                      useLandscapeQuizLayout &&
                        styles.quizQuestionLayoutLandscape,
                    ]}
                  >
                    <View
                      style={
                        useLandscapeQuizLayout
                          ? styles.quizPromptColumnLandscape
                          : undefined
                      }
                    >
                      <View style={styles.quizHeader}>
                        <View>
                          <AppText script={uiScript}
                            variant="sectionLabel"
                            style={styles.quizEyebrow}
                          >
                            {l("lesson.quizQuestion", { current: questionIndex + 1, total: questions.length })}
                          </AppText>
                          <AppText script={uiScript} variant="caption" style={styles.quizContext}>
                            {sc(activeScene, "title", activeScene.title)}
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
                          style={[
                            styles.questionDisplay,
                            useLandscapeQuizLayout &&
                              styles.questionDisplayLandscape,
                          ]}
                        >
                          {currentQuestion.display}
                        </AppText>
                      ) : null}
                      <AppText script={uiScript}
                        variant="sceneTitle"
                        align="center"
                        style={[
                          styles.prompt,
                          useLandscapeQuizLayout && styles.promptLandscape,
                        ]}
                      >
                        {qc(currentQuestion.id, "prompt", currentQuestion.prompt)}
                      </AppText>
                    </View>

                    <View
                      style={
                        useLandscapeQuizLayout
                          ? styles.quizAnswersColumnLandscape
                          : undefined
                      }
                    >
                      <View
                        style={[
                          styles.options,
                          useCompactOptions && styles.compactOptions,
                          useLandscapeQuizOptionGrid && styles.optionsLandscape,
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
                                    <AppText script={uiScript}
                                      variant="caption"
                                      style={styles.audioListenLabel}
                                    >
                                      {l("lesson.listen")}
                                    </AppText>
                                    <AppText script={uiScript} variant="bodyStrong">
                                      {displayedOption(item)}
                                    </AppText>
                                  </View>
                                </Pressable>
                                <Pressable
                                  disabled={answered !== null}
                                  onPress={() => answerQuestion(item.value)}
                                  style={styles.audioChoose}
                                >
                                  <AppText script={uiScript}
                                    variant="caption"
                                    style={styles.audioChooseText}
                                  >
                                    {l("lesson.choose")}
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
                                useLandscapeQuizOptionGrid &&
                                  styles.optionLandscape,
                                isSelected && styles.optionWrong,
                                isCorrect && styles.optionCorrect,
                                pressed &&
                                  answered === null &&
                                  styles.optionPressed,
                              ]}
                            >
                              <AppText script={uiScript} variant="bodyStrong" align="center">
                                {displayedOption(item)}
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
                            useLandscapeQuizLayout && styles.feedbackLandscape,
                            isCurrentAnswerCorrect
                              ? styles.feedbackCorrect
                              : styles.feedbackWrong,
                          ]}
                        >
                          <AppText script={uiScript}
                            variant="bodyStrong"
                            style={{
                              color: isCurrentAnswerCorrect ? SUCCESS : ERROR,
                            }}
                          >
                            {l(isCurrentAnswerCorrect ? "lesson.correct" : "lesson.incorrect")}
                          </AppText>
                          {isCurrentAnswerCorrect ? (
                            <AppText script={uiScript}
                              variant="bodyStrong"
                              style={styles.teacherFeedbackText}
                            >
                              {teacherFeedback}
                            </AppText>
                          ) : (
                            <>
                              <AppText script={uiScript}
                                variant="bodySecondary"
                                style={styles.expectedAnswerText}
                              >
                                {l("lesson.remember", { answer: correctAnswerLabel ?? "" })}
                              </AppText>
                              <AppText script={uiScript}
                                variant="bodySecondary"
                                style={styles.feedbackText}
                              >
                                {qc(currentQuestion.id, "explanation", currentQuestion.explanation)}
                              </AppText>
                            </>
                          )}
                          <Pressable
                            onPress={continueQuiz}
                            style={styles.continueButton}
                          >
                            <LinearGradient
                              colors={[HANGUL_ACCENT, HANGUL_SECONDARY]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.continueGradient}
                            >
                              <AppText script={uiScript}
                                variant="button"
                                style={styles.primaryText}
                              >
                                {l(willContinueQuiz ? "lesson.next" : "lesson.finish")}
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
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.result,
                      useLandscapeQuizLayout && styles.resultLandscape,
                    ]}
                  >
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
                    <AppText script={uiScript}
                      variant="sectionLabel"
                      style={{ color: result.mastered ? SUCCESS : WARNING }}
                    >
                      {l(result.mastered ? "lesson.quizSuccess" : "lesson.stageCompleted")}
                    </AppText>
                    <AppText script={uiScript} variant="numericValue" style={styles.resultScore}>
                      {result.score}/{result.total}
                    </AppText>
                    <AppText script={uiScript}
                      variant="bodySecondary"
                      align="center"
                      tone="muted"
                      style={styles.resultText}
                    >
                      {l(result.mastered
                        ? (result.hadCorrections ? "lesson.resultMasteredAfterCorrections" : "lesson.resultMastered")
                        : "lesson.resultTryAgain")}
                    </AppText>
                    <Pressable
                      onPress={closeResult}
                      style={[
                        styles.resultButton,
                        useLandscapeQuizLayout && styles.resultButtonLandscape,
                      ]}
                    >
                      <LinearGradient
                        colors={[HANGUL_ACCENT, HANGUL_SECONDARY]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.continueGradient}
                      >
                        <AppText script={uiScript} variant="button" style={styles.primaryText}>
                          {l(result.mastered ? (hasNextScene ? "lesson.next" : "lesson.finish") : "lesson.reviewStage")}
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
    return () => animation.stop();
  }, [animatedProgress, safeProgress]);

  const width = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width }]}>
        <LinearGradient
          colors={[HANGUL_ACCENT, HANGUL_SECONDARY]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1, overflow: "hidden", backgroundColor: BG_DEEP },
  bgBlur: { ...ABSOLUTE_FILL },
  vignetteOverlay: { ...ABSOLUTE_FILL, backgroundColor: "rgba(2,3,6,0.52)" },
  ambientGlowTop: {
    position: "absolute",
    top: 100,
    right: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(103,232,249,0.05)",
    boxShadow: "0px 0px 90px rgba(103,232,249,0.10)",
  },
  ambientGlowBottom: {
    position: "absolute",
    top: 510,
    left: -130,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(94,234,212,0.035)",
    boxShadow: "0px 0px 100px rgba(94,234,212,0.07)",
  },
  scroll: { paddingTop: 8, paddingBottom: 120 },
  scrollLandscape: { paddingTop: 4, paddingBottom: 64 },
  frame: { width: "100%", alignSelf: "center" },
  pressablePressed: { opacity: 0.84, transform: [{ scale: 0.992 }] },
  glassTopHairline: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    opacity: 0.72,
  },
  header: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 28,
  },
  headerLandscape: {
    minHeight: 52,
    marginBottom: 10,
  },
  headerSide: { flex: 1, alignItems: "flex-start" },
  headerSideRight: { flex: 1, alignItems: "flex-end" },
  headerCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerLandscapeTitle: {
    color: TXT,
    textAlign: "center",
    fontSize: 24,
    lineHeight: 30,
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
  helpToggleLandscape: { minHeight: 34, paddingHorizontal: 11 },
  helpToggleActive: {
    borderColor: "rgba(103,232,249,0.22)",
    backgroundColor: "rgba(12,28,38,0.76)",
  },
  helpTogglePressed: { opacity: 0.75 },
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
  helpText: { color: "rgba(241,245,249,0.66)" },
  helpTextActive: { color: "rgba(103,232,249,0.88)" },
  hero: { paddingHorizontal: 2, marginBottom: 20 },
  heroLandscape: { marginBottom: 8, paddingHorizontal: 0 },
  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },
  heroEyebrowRowLandscape: { marginBottom: 5 },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 8,
    backgroundColor: HANGUL_ACCENT,
    boxShadow: "0px 0px 8px rgba(103,232,249,0.72)",
  },
  heroEyebrow: { color: "rgba(226,242,254,0.68)", letterSpacing: 1.3 },
  heroTitle: { color: TXT, maxWidth: 700 },
  heroSubtitle: { marginTop: 8, maxWidth: 600, color: MUTED },
  heroSubtitleLandscape: { marginTop: 0, maxWidth: 760 },
  heroMetaRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  heroMetaRowLandscape: { marginTop: 10 },
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
  heroLevelText: { marginLeft: 7, color: "rgba(150,226,255,0.84)" },
  heroSceneCount: { color: "rgba(241,245,249,0.62)", textAlign: "right" },
  heroProgressBlock: { marginTop: 17 },
  heroProgressBlockLandscape: { marginTop: 9 },
  heroProgressMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  heroProgressLabel: { color: SOFT, letterSpacing: 0.55 },
  heroProgressValue: { color: TXT },
  heroProgressStart: { color: "rgba(103,232,249,0.90)", fontSize: 14 },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.095)",
  },
  progressFill: { height: "100%", borderRadius: 2, overflow: "hidden" },
  tabs: { gap: 8, paddingTop: 12, paddingBottom: 18 },
  tabsLandscape: { paddingTop: 6, paddingBottom: 10 },
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
  tabLandscape: { minHeight: 36, paddingHorizontal: 10 },
  tabActive: {
    borderColor: "rgba(103,232,249,0.26)",
    backgroundColor: "rgba(12,28,38,0.82)",
  },
  tabMastered: {
    borderColor: "rgba(74,222,128,0.18)",
    backgroundColor: "rgba(5,20,18,0.74)",
  },
  tabLocked: { opacity: 0.48 },
  tabPressed: { opacity: 0.74 },
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
  tabNumber: { color: "rgba(241,245,249,0.64)" },
  tabNumberActive: { color: HANGUL_ACCENT },
  tabText: { color: "rgba(241,245,249,0.70)" },
  tabTextActive: { color: "rgba(241,245,249,0.95)" },
  tabTextLocked: { color: "rgba(148,163,184,0.60)" },
  tabReviewDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 7,
    backgroundColor: WARNING,
  },
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
  sceneCardLandscape: { minHeight: 0, padding: 16, borderRadius: 24 },
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
  sceneTopRowLandscape: { marginBottom: 10 },
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
  sceneKickerText: { color: "rgba(241,245,249,0.66)" },
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
  stateBadgeText: { marginLeft: 5 },
  stateBadgeTextActive: { color: "rgba(103,232,249,0.90)" },
  stateBadgeTextReview: { color: "rgba(253,224,71,0.84)" },
  stateBadgeTextSuccess: { color: "rgba(74,222,128,0.88)" },
  sceneTitleBlock: { maxWidth: 620 },
  sceneTitle: { color: TXT },
  sceneKorean: {
    marginTop: 5,
    color: HANGUL_ACCENT,
    textShadowColor: "rgba(103,232,249,0.18)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sceneDescription: {
    marginTop: 18,
    maxWidth: 650,
    color: "rgba(245,247,250,0.90)",
  },
  sceneDescriptionLandscape: { marginTop: 9, maxWidth: 900 },
  instruction: {
    marginTop: 17,
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(7,12,18,0.68)",
  },
  instructionLandscape: { marginTop: 10 },
  instructionAccent: { width: 3, backgroundColor: HANGUL_ACCENT },
  instructionText: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: "rgba(241,245,249,0.82)",
  },
  instructionTextLandscape: { paddingVertical: 9 },
  sceneProgressBlock: { marginTop: 22 },
  sceneProgressBlockLandscape: { marginTop: 11 },
  sceneProgressMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sceneProgressLabel: { color: "rgba(241,245,249,0.62)", letterSpacing: 0.55 },
  sceneProgressValue: { color: TXT },
  sectionHeader: {
    marginTop: 30,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  sectionHeaderLandscape: { marginTop: 16, marginBottom: 10 },
  sectionEyebrow: { color: "rgba(241,245,249,0.72)", letterSpacing: 1.15 },
  sectionSubtitle: { marginTop: 3, color: "rgba(241,245,249,0.54)" },
  sectionLineWrap: {
    flex: 1,
    height: 10,
    justifyContent: "center",
    marginBottom: 2,
    position: "relative",
  },
  sectionLineBase: { height: 1, backgroundColor: "rgba(255,255,255,0.075)" },
  sectionLineGlow: {
    position: "absolute",
    right: 0,
    width: 92,
    height: 1,
    opacity: 0.82,
  },
  sectionCount: { color: "rgba(241,245,249,0.86)", marginBottom: 1 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  cardGridLandscape: { alignItems: "stretch" },
  cardPressable: { flexGrow: 1, flexBasis: 280, minWidth: 0 },
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
  cardLandscape: {
    minHeight: 138,
    padding: 14,
    borderRadius: 20,
    justifyContent: "space-between",
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
  cardTopLandscape: { alignItems: "center" },
  glyphGroupLandscape: { flex: 1, alignItems: "center", paddingLeft: 34 },
  glyph: { flexShrink: 1 },
  glyphIdle: { color: "rgba(241,245,249,0.82)" },
  glyphDiscovered: {
    color: HANGUL_ACCENT,
    textShadowColor: "rgba(103,232,249,0.20)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 9,
  },
  romanization: { marginTop: 2, color: "rgba(103,232,249,0.86)" },
  cardCopy: { marginTop: 14, maxWidth: 540 },
  cardCopyLandscape: { marginTop: 6, maxWidth: "100%", alignItems: "center" },
  cardLabel: { color: TXT },
  cardExplanation: { marginTop: 6, color: "rgba(241,245,249,0.84)" },
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
  cardFooterLandscape: { paddingTop: 8 },
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
  primaryButton: {
    marginTop: 24,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.18)",
  },
  primaryButtonLandscape: { marginTop: 16 },
  buttonDisabled: { borderColor: "rgba(148,163,184,0.10)" },
  primaryGradient: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  primaryGradientLandscape: { minHeight: 50, paddingVertical: 13 },
  primaryText: { color: "#020306" },
  primaryTextDisabled: { color: "rgba(241,245,249,0.48)" },
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
  nextCardCopy: { flex: 1, minWidth: 0 },
  nextCardEyebrow: { color: "rgba(74,222,128,0.80)" },
  nextCardTitle: { marginTop: 3, color: TXT },
  nextCardAction: { marginTop: 6, color: "rgba(74,222,128,0.80)" },
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
  gateFrame: {
    width: "100%",
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
  gateFrameLandscape: { paddingVertical: 12 },
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
  gateCardLandscape: {
    minHeight: 0,
    padding: 20,
    borderRadius: 24,
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
  gateEyebrow: { color: "rgba(103,232,249,0.82)" },
  gateTitle: { marginTop: 10, color: TXT },
  gateText: { marginTop: 10, maxWidth: 580, color: MUTED },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.84)",
    justifyContent: "flex-end",
  },
  overlayLandscape: {
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
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
  quizSheetLandscape: {
    width: "100%",
    maxWidth: 1040,
    height: "100%",
    alignSelf: "center",
    borderRadius: 24,
    borderBottomWidth: 1,
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
  quizScroll: { flex: 1 },
  quizContent: { paddingHorizontal: 22, paddingTop: 25, paddingBottom: 38 },
  quizContentLandscape: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    justifyContent: "center",
  },
  quizQuestionLayout: { width: "100%" },
  quizQuestionLayoutLandscape: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 28,
  },
  quizPromptColumnLandscape: {
    flex: 0.9,
    minWidth: 0,
  },
  quizAnswersColumnLandscape: {
    flex: 1.1,
    minWidth: 0,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  quizEyebrow: { color: "rgba(103,232,249,0.86)", letterSpacing: 1 },
  quizContext: { marginTop: 3, color: SOFT },
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
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  questionDisplayLandscape: { marginTop: 16 },
  prompt: { marginTop: 20, marginBottom: 22, color: TXT },
  promptLandscape: { marginTop: 12, marginBottom: 0 },
  options: { gap: 11 },
  compactOptions: { flexDirection: "row", flexWrap: "wrap" },
  optionsLandscape: { flexDirection: "row", flexWrap: "wrap" },
  option: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "rgba(7,12,18,0.82)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  compactOption: { width: "46%" },
  optionLandscape: { width: "47%" },
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
  audioListenCopy: { gap: 2 },
  audioListenLabel: { color: "rgba(103,232,249,0.84)" },
  audioChoose: {
    borderWidth: 1,
    borderRadius: 999,
    borderColor: "rgba(103,232,249,0.24)",
    backgroundColor: "rgba(6,24,32,0.78)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  audioChooseText: { color: "rgba(103,232,249,0.90)" },
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
  feedbackLandscape: { marginTop: 14, padding: 15 },
  feedbackCorrect: {
    borderColor: "rgba(74,222,128,0.26)",
    backgroundColor: "rgba(7,30,19,0.78)",
  },
  feedbackWrong: {
    borderColor: "rgba(248,113,113,0.26)",
    backgroundColor: "rgba(38,10,15,0.80)",
  },
  teacherFeedbackText: { marginTop: 7, color: TXT },
  expectedAnswerText: { marginTop: 7, color: "rgba(241,245,249,0.90)" },
  feedbackText: { marginTop: 7, color: "rgba(241,245,249,0.82)" },
  continueButton: { marginTop: 15, borderRadius: 16, overflow: "hidden" },
  continueGradient: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  result: { alignItems: "center", paddingVertical: 34 },
  resultLandscape: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingVertical: 16,
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
  resultScore: { marginTop: 14, color: TXT },
  resultText: { maxWidth: 520, marginTop: 12, color: MUTED },
  resultButton: {
    width: "100%",
    marginTop: 25,
    borderRadius: 16,
    overflow: "hidden",
  },
  resultButtonLandscape: { maxWidth: 420 },
});
