import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { AppText } from "../app-text";
import {
  createEmptyHangulLessonProgress,
  type HangulLessonProgress,
  type HangulQuestion,
} from "../../data/hangul/types";
import {
  getHangulModule,
  HANGUL_MASTERY_THRESHOLD,
  HANGUL_MODULES,
} from "../../data/hangul/curriculum";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { shuffleArray } from "../../lib/choiceOrder";
import { trackHangulExerciseCompleted } from "../../lib/immersionStreak";

const BACKGROUND_SOURCE = require("../../assets/images/vowelbasic.png");

const normalizeLesson = (value?: Partial<HangulLessonProgress>): HangulLessonProgress => ({
  ...createEmptyHangulLessonProgress(),
  ...value,
  discovered: { ...(value?.discovered ?? {}) },
  completedScenes: { ...(value?.completedScenes ?? {}) },
  masteredScenes: { ...(value?.masteredScenes ?? {}) },
  scores: { ...(value?.scores ?? {}) },
  errorsByCharacter: { ...(value?.errorsByCharacter ?? {}) },
});

export function HangulLessonScreen({ moduleId }: { moduleId: string }) {
  const module = getHangulModule(moduleId);
  const { progress, updateHangulProgress, complete, isHydrated } = useStore();
  const responsive = useResponsiveLayout({ maxWidth: 920 });
  const savedLesson = normalizeLesson(progress.hangulProgress.lessons[module.id]);
  const savedSceneIndex = module.scenes.findIndex((scene) => scene.id === savedLesson.currentSceneId);
  const savedSceneUnlocked = savedSceneIndex <= 0 || !!savedLesson.masteredScenes[module.scenes[savedSceneIndex - 1]?.id];
  const initialScene = savedSceneUnlocked && savedSceneIndex >= 0 ? module.scenes[savedSceneIndex] : module.scenes[0];
  const [activeSceneId, setActiveSceneId] = React.useState(initialScene.id);
  const [showRomanization, setShowRomanization] = React.useState(module.romanizationDefault);
  const [quizActive, setQuizActive] = React.useState(false);
  const [questions, setQuestions] = React.useState<HangulQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [answered, setAnswered] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const [quizComplete, setQuizComplete] = React.useState(false);
  const [result, setResult] = React.useState({ score: 0, total: 0, mastered: false });
  const [retrySourceIds, setRetrySourceIds] = React.useState<Record<string, true>>({});
  const [originalQuestionCount, setOriginalQuestionCount] = React.useState(0);
  const originalQuestionIds = React.useRef(new Set<string>());
  const restoredQuizRef = React.useRef(false);

  const activeScene = module.scenes.find((scene) => scene.id === activeSceneId) ?? module.scenes[0];
  const lesson = normalizeLesson(progress.hangulProgress.lessons[module.id]);
  const currentQuestion = questions[questionIndex];
  const correctAnswerLabel = currentQuestion?.options.find(
    (option) => option.value === currentQuestion.answer,
  )?.label ?? currentQuestion?.answer;
  const useCompactOptions = (currentQuestion?.options.length ?? 0) > 4;
  const discoveredCount = activeScene.cards.filter((item) => lesson.discovered[item.id]).length;
  const sceneMastered = !!lesson.masteredScenes[activeScene.id];
  const allScenesMastered = module.scenes.every((scene) => lesson.masteredScenes[scene.id]);
  const activeSceneIndex = module.scenes.findIndex((scene) => scene.id === activeScene.id);
  const hasNextScene = activeSceneIndex < module.scenes.length - 1;
  const willAddRetryQuestion = !!currentQuestion &&
    answered !== null &&
    answered !== currentQuestion.answer &&
    !currentQuestion.id.endsWith("__retry") &&
    !retrySourceIds[currentQuestion.id];
  const willContinueQuiz = questionIndex + 1 < questions.length || willAddRetryQuestion;
  const canStartQuiz = discoveredCount === activeScene.cards.length;
  const moduleIndex = HANGUL_MODULES.findIndex((item) => item.id === module.id);
  const prerequisite = moduleIndex > 0 ? HANGUL_MODULES[moduleIndex - 1] : undefined;
  const moduleUnlocked = !prerequisite || !!progress.completed[prerequisite.id];

  React.useEffect(() => {
    if (!isHydrated || restoredQuizRef.current) return;
    restoredQuizRef.current = true;

    const saved = normalizeLesson(progress.hangulProgress.lessons[module.id]);
    const session = saved.activeQuiz;
    if (!session) return;

    const sceneIndex = module.scenes.findIndex((scene) => scene.id === session.sceneId);
    const sceneUnlocked = sceneIndex <= 0 || !!saved.masteredScenes[module.scenes[sceneIndex - 1]?.id];
    if (sceneIndex < 0 || !sceneUnlocked || session.questions.length === 0) return;

    // Hydration is the external synchronization point for restoring a paused quiz.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSceneId(session.sceneId);
    setQuestions(session.questions);
    setQuestionIndex(Math.min(session.questionIndex, session.questions.length - 1));
    setAnswered(session.answered);
    setScore(session.score);
    setRetrySourceIds({ ...session.retrySourceIds });
    setOriginalQuestionCount(session.originalQuestionCount);
    originalQuestionIds.current = new Set(session.originalQuestionIds);
    setQuizComplete(false);
    setQuizActive(true);
  }, [isHydrated, module.id, module.scenes, progress.hangulProgress.lessons]);

  const speak = React.useCallback((value: string) => {
    Speech.stop();
    const segments = value.split("|").map((item) => item.trim()).filter(Boolean);
    segments.forEach((segment, index) => {
      setTimeout(() => {
        Speech.speak(segment, { language: "ko-KR", rate: 0.72, pitch: 1 });
      }, index * 900);
    });
  }, []);

  React.useEffect(() => () => {
    void Speech.stop();
  }, []);

  React.useEffect(() => {
    if (quizActive && !quizComplete && currentQuestion?.audio && answered === null) {
      const timer = setTimeout(() => speak(currentQuestion.audio!), 250);
      return () => clearTimeout(timer);
    }
  }, [answered, currentQuestion, quizActive, quizComplete, speak]);

  React.useEffect(() => {
    if (allScenesMastered) complete(module.id);
  }, [allScenesMastered, complete, module.id]);

  const updateLesson = (updater: (current: HangulLessonProgress) => HangulLessonProgress) => {
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
    if (index > 0 && !lesson.masteredScenes[module.scenes[index - 1].id]) return;
    setActiveSceneId(sceneId);
    setQuizActive(false);
    Speech.stop();
    updateLesson((current) => ({ ...current, currentSceneId: sceneId }));
  };

  const discover = (cardId: string, audio: string) => {
    speak(audio);
    Vibration.vibrate(8);
    updateLesson((current) => ({
      ...current,
      currentSceneId: activeScene.id,
      discovered: { ...current.discovered, [cardId]: true },
    }));
  };

  const startQuiz = () => {
    if (!canStartQuiz) return;
    const baseQuestions = shuffleArray(activeScene.questions).map((item) => ({
      ...item,
      options: shuffleArray(item.options),
    }));
    const originalIds = baseQuestions.map((item) => item.id);
    originalQuestionIds.current = new Set(originalIds);
    setOriginalQuestionCount(baseQuestions.length);
    setQuestions(baseQuestions);
    setQuestionIndex(0);
    setAnswered(null);
    setScore(0);
    setQuizComplete(false);
    setRetrySourceIds({});
    setQuizActive(true);
    updateLesson((current) => ({
      ...current,
      currentSceneId: activeScene.id,
      activeQuiz: {
        sceneId: activeScene.id,
        questions: baseQuestions,
        questionIndex: 0,
        answered: null,
        score: 0,
        retrySourceIds: {},
        originalQuestionIds: originalIds,
        originalQuestionCount: baseQuestions.length,
      },
    }));
  };

  const answerQuestion = (value: string) => {
    if (!currentQuestion || answered !== null) return;
    setAnswered(value);
    const isCorrect = value === currentQuestion.answer;
    const isOriginal = originalQuestionIds.current.has(currentQuestion.id);
    const nextScore = isCorrect && isOriginal ? score + 1 : score;
    if (isCorrect && isOriginal) {
      setScore((current) => current + 1);
      Vibration.vibrate(15);
    }
    if (!isCorrect) {
      Vibration.vibrate([0, 60]);
    }
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
        activeQuiz: current.activeQuiz
          ? { ...current.activeQuiz, answered: value, score: nextScore }
          : current.activeQuiz,
      };
    });
  };

  const finishQuiz = (finalScore: number) => {
    const total = originalQuestionIds.current.size;
    const mastered = total > 0 && finalScore / total >= HANGUL_MASTERY_THRESHOLD;
    setResult({ score: finalScore, total, mastered });
    setQuizComplete(true);
    updateLesson((current) => {
      const previousScore = current.scores[activeScene.id];
      const next: HangulLessonProgress = {
        ...current,
        currentSceneId: activeScene.id,
        activeQuiz: undefined,
        completedScenes: { ...current.completedScenes, [activeScene.id]: true },
        masteredScenes: mastered
          ? { ...current.masteredScenes, [activeScene.id]: true }
          : current.masteredScenes,
        scores: {
          ...current.scores,
          [activeScene.id]: {
            bestScore: Math.max(previousScore?.bestScore ?? 0, finalScore),
            total,
            attempts: (previousScore?.attempts ?? 0) + 1,
          },
        },
      };
      return next;
    });
    complete(`${module.id}_${activeScene.id}`);
    void trackHangulExerciseCompleted(`${module.id}_${activeScene.id}`);
    if (mastered) {
      updateHangulProgress((current) => ({
        ...current,
        masteredCharacters: {
          ...current.masteredCharacters,
          ...Object.fromEntries(
            [
              ...(activeScene.introducedConsonants ?? []),
              ...(activeScene.introducedVowels ?? []),
              ...(activeScene.introducedFinals ?? []),
            ].map((item) => [item, true as const]),
          ),
        },
      }));
    }
  };

  const continueQuiz = () => {
    if (!currentQuestion || answered === null) return;
    const isCorrect = answered === currentQuestion.answer;
    const isOriginal = originalQuestionIds.current.has(currentQuestion.id);
    let nextQuestions = questions;
    if (!isCorrect && isOriginal && !retrySourceIds[currentQuestion.id]) {
      const retry = {
        ...currentQuestion,
        id: `${currentQuestion.id}__retry`,
        prompt: `Révision : ${currentQuestion.prompt}`,
        options: shuffleArray(currentQuestion.options),
      };
      nextQuestions = [...questions, retry];
      setQuestions(nextQuestions);
      setRetrySourceIds((current) => ({ ...current, [currentQuestion.id]: true }));
    }
    const nextIndex = questionIndex + 1;
    if (nextIndex < nextQuestions.length) {
      setQuestionIndex(nextIndex);
      setAnswered(null);
      updateLesson((current) => ({
        ...current,
        activeQuiz: current.activeQuiz
          ? {
              ...current.activeQuiz,
              questions: nextQuestions,
              questionIndex: nextIndex,
              answered: null,
              retrySourceIds: !isCorrect && isOriginal
                ? { ...current.activeQuiz.retrySourceIds, [currentQuestion.id]: true }
                : current.activeQuiz.retrySourceIds,
            }
          : current.activeQuiz,
      }));
      return;
    }
    // The score state has already been committed before the user taps Continue.
    // Adding the last answer again would over-count the final question.
    finishQuiz(score);
  };

  const closeResult = () => {
    setQuizActive(false);
    if (!result.mastered) return;
    const index = module.scenes.findIndex((scene) => scene.id === activeScene.id);
    const nextScene = module.scenes[index + 1];
    if (nextScene) selectScene(nextScene.id);
  };

  if (!moduleUnlocked && prerequisite) {
    return (
      <SafeAreaView style={styles.safe}>
        <ImageBackground source={BACKGROUND_SOURCE} style={styles.background} resizeMode="cover">
          <LinearGradient colors={["rgba(2,3,6,0.72)", "rgba(2,3,6,0.96)"]} style={StyleSheet.absoluteFillObject} />
          <View style={[styles.gateFrame, { paddingHorizontal: responsive.horizontalPadding, maxWidth: responsive.maxWidth }]}>
            <BlurView intensity={65} tint="dark" style={styles.introCard}>
              <AppText variant="sectionLabel" style={{ color: module.accent }}>PROGRESSION GUIDÉE</AppText>
              <AppText variant="screenTitle">Une étape avant celle-ci</AppText>
              <AppText variant="bodySecondary" tone="muted">
                Termine d’abord « {prerequisite.title} ». Les exemples n’utilisent que les caractères déjà étudiés.
              </AppText>
              <Pressable onPress={() => router.replace(prerequisite.route as never)} style={styles.primaryButton}>
                <LinearGradient colors={[prerequisite.accent, module.accent]} style={styles.primaryGradient}>
                  <AppText variant="button" style={styles.primaryText}>OUVRIR {prerequisite.title.toUpperCase()}</AppText>
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
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.background} resizeMode="cover">
        <LinearGradient colors={["rgba(2,3,6,0.62)", "rgba(2,3,6,0.88)"]} style={StyleSheet.absoluteFillObject} />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: responsive.horizontalPadding }]}>
          <View style={[styles.frame, { maxWidth: responsive.maxWidth }]}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                <AppText variant="screenTitle" style={styles.backArrow}>‹</AppText>
                <AppText variant="sectionLabel">HANGUL</AppText>
              </Pressable>
              <Pressable onPress={() => setShowRomanization((current) => !current)} style={styles.helpToggle}>
                <AppText variant="caption" style={{ color: showRomanization ? module.accent : "rgba(255,255,255,0.7)" }}>
                  {showRomanization
                    ? "Aide latine · activée"
                    : "Aide latine · désactivée"}
                </AppText>
              </Pressable>
            </View>

            <AppText variant="sectionLabel" style={{ color: module.accent }}>{module.eyebrow}</AppText>
            <AppText variant="screenTitle" style={styles.title}>{module.title}</AppText>
            <AppText variant="bodySecondary" tone="muted" style={styles.romanizationNotice}>
              La romanisation est un repère temporaire. Désactive-la dès que la forme devient familière.
            </AppText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
              {module.scenes.map((scene, index) => {
                const mastered = !!lesson.masteredScenes[scene.id];
                const completed = !!lesson.completedScenes[scene.id];
                const unlocked = index === 0 || !!lesson.masteredScenes[module.scenes[index - 1].id];
                return (
                  <Pressable
                    key={scene.id}
                    disabled={!unlocked}
                    onPress={() => selectScene(scene.id)}
                    style={[
                      styles.tab,
                      !unlocked && styles.tabLocked,
                      activeScene.id === scene.id && { borderColor: scene.accent, backgroundColor: `${scene.accent}20` },
                    ]}
                  >
                    <AppText variant="caption" style={styles.tabText}>
                      {!unlocked ? "🔒" : mastered ? "✓" : completed ? "•" : index + 1} {scene.title}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <BlurView intensity={55} tint="dark" style={styles.introCard}>
              <View
                style={[
                  styles.introHeader,
                  responsive.isCompact && styles.introHeaderCompact,
                ]}
              >
                <View style={styles.introCopy}>
                  <AppText variant="sceneTitle">{activeScene.title}</AppText>
                  <AppText variant="koreanSecondary" script="korean" style={{ color: activeScene.accent }}>
                    {activeScene.koreanTitle}
                  </AppText>
                </View>
                <View style={[styles.stateBadge, { borderColor: `${activeScene.accent}88` }]}>
                  <AppText variant="caption" style={{ color: activeScene.accent }}>
                    {sceneMastered ? "RÉUSSI" : lesson.completedScenes[activeScene.id] ? "TERMINÉ" : "À COMMENCER"}
                  </AppText>
                </View>
              </View>
              <AppText variant="body" style={styles.description}>{activeScene.description}</AppText>
              <View style={[styles.instruction, { borderLeftColor: activeScene.accent }]}>
                <AppText variant="bodySecondary">{activeScene.instruction}</AppText>
              </View>
            </BlurView>

            <View style={styles.sectionHeader}>
              <AppText variant="sectionTitle">DÉCOUVERTE</AppText>
              <AppText variant="caption" tone="muted">{discoveredCount}/{activeScene.cards.length}</AppText>
            </View>

            <View style={styles.cardGrid}>
              {activeScene.cards.map((item) => {
                const discovered = !!lesson.discovered[item.id];
                return (
                  <Pressable key={item.id} onPress={() => discover(item.id, item.audio)} style={styles.cardPressable}>
                    <BlurView intensity={40} tint="dark" style={[styles.card, discovered && { borderColor: activeScene.accent }]}>
                      <View style={styles.cardTop}>
                        <AppText variant="koreanPrimary" script="korean" style={[styles.glyph, { color: discovered ? activeScene.accent : "#F8FAFC" }]}>
                          {item.glyph}
                        </AppText>
                        <AppText variant="caption" style={styles.audioMark}>🔊</AppText>
                      </View>
                      {showRomanization && item.romanization ? (
                        <AppText variant="caption" style={{ color: activeScene.accent }}>{item.romanization}</AppText>
                      ) : null}
                      <AppText variant="bodyStrong" style={styles.cardLabel}>{item.label}</AppText>
                      {discovered ? <AppText variant="bodySecondary" tone="muted">{item.explanation}</AppText> : null}
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>

            <Pressable disabled={!canStartQuiz} onPress={startQuiz} style={[styles.primaryButton, !canStartQuiz && styles.buttonDisabled]}>
              <LinearGradient colors={[activeScene.accent, module.accent]} style={styles.primaryGradient}>
                <AppText variant="button" style={styles.primaryText}>
                  {!canStartQuiz ? `ÉCOUTE LES ${activeScene.cards.length} CARTES` : sceneMastered ? "RECOMMENCER L’ÉTAPE" : "COMMENCER L’ÉTAPE"}
                </AppText>
              </LinearGradient>
            </Pressable>

            {allScenesMastered ? (
              <Pressable onPress={() => router.push(module.nextRoute as never)} style={styles.nextCard}>
                <AppText variant="bodyStrong">Toutes les étapes sont terminées.</AppText>
                <AppText variant="button" style={{ color: module.accent }}>OUVRIR {module.nextLabel} →</AppText>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        {quizActive ? (
          <View style={styles.overlay}>
            <BlurView intensity={100} tint="dark" style={styles.quizSheet}>
              <ScrollView
                bounces={false}
                style={styles.quizScroll}
                contentContainerStyle={styles.quizContent}
                showsVerticalScrollIndicator={false}
              >
              {!quizComplete && currentQuestion ? (
                <>
                  <View style={styles.quizHeader}>
                    <AppText variant="sectionLabel" style={{ color: activeScene.accent }}>
                      QUESTION {Math.min(questionIndex + 1, originalQuestionCount)} / {originalQuestionCount}
                    </AppText>
                    {currentQuestion.audio ? (
                      <Pressable onPress={() => speak(currentQuestion.audio!)} style={styles.replayButton}>
                        <AppText variant="caption">🔊 RÉÉCOUTER</AppText>
                      </Pressable>
                    ) : null}
                  </View>
                  {currentQuestion.display ? (
                    <AppText variant="koreanHero" script="korean" align="center" style={[styles.questionDisplay, { color: activeScene.accent }]}>
                      {currentQuestion.display}
                    </AppText>
                  ) : null}
                  <AppText variant="sceneTitle" align="center" style={styles.prompt}>{currentQuestion.prompt}</AppText>
                  <View style={[styles.options, useCompactOptions && styles.compactOptions]}>
                    {currentQuestion.options.map((item, index) => {
                      const isSelected = answered === item.value;
                      const isCorrect = answered !== null && item.value === currentQuestion.answer;
                      if (item.audio) {
                        return (
                          <View key={`${currentQuestion.id}-${item.value}-${index}`} style={[styles.option, styles.audioOption, isSelected && styles.optionWrong, isCorrect && styles.optionCorrect]}>
                            <Pressable onPress={() => speak(item.audio!)} style={styles.audioListen}>
                              <AppText variant="bodyStrong">🔊 {item.label}</AppText>
                            </Pressable>
                            <Pressable disabled={answered !== null} onPress={() => answerQuestion(item.value)} style={[styles.audioChoose, { borderColor: activeScene.accent }]}>
                              <AppText variant="caption" style={{ color: activeScene.accent }}>CHOISIR</AppText>
                            </Pressable>
                          </View>
                        );
                      }
                      return (
                        <Pressable
                          key={`${currentQuestion.id}-${item.value}-${index}`}
                          disabled={answered !== null}
                          onPress={() => answerQuestion(item.value)}
                          style={[
                            styles.option,
                            useCompactOptions && styles.compactOption,
                            isSelected && styles.optionWrong,
                            isCorrect && styles.optionCorrect,
                          ]}
                        >
                          <AppText variant="bodyStrong" align="center">{item.label}</AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                  {answered !== null ? (
                    <View style={[styles.feedback, { borderColor: answered === currentQuestion.answer ? "#4ADE80" : "#F87171" }]}>
                      <AppText variant="bodyStrong" style={{ color: answered === currentQuestion.answer ? "#4ADE80" : "#F87171" }}>
                        {answered === currentQuestion.answer ? "Bonne lecture" : `Bonne réponse : ${correctAnswerLabel}`}
                      </AppText>
                      <AppText variant="bodySecondary">{currentQuestion.explanation}</AppText>
                      <Pressable onPress={continueQuiz} style={[styles.continueButton, { backgroundColor: activeScene.accent }]}>
                        <AppText variant="button" style={styles.primaryText}>{willContinueQuiz ? "SUIVANT" : "TERMINER"}</AppText>
                      </Pressable>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.result}>
                  <AppText variant="sectionLabel" style={{ color: result.mastered ? "#4ADE80" : "#FDE047" }}>
                    {result.mastered ? "LECTURE RÉUSSIE" : "ÉTAPE TERMINÉE"}
                  </AppText>
                  <AppText variant="numericValue" style={styles.resultScore}>{result.score}/{result.total}</AppText>
                  <AppText variant="bodySecondary" align="center" tone="muted">
                    {result.mastered
                      ? Object.keys(retrySourceIds).length > 0
                        ? "Les sons manqués sont revenus dans la session. Tu peux continuer."
                        : "Lecture réussie. Tu peux continuer."
                      : "Revois les caractères signalés, puis recommence."}
                  </AppText>
                  <Pressable onPress={closeResult} style={[styles.continueButton, { backgroundColor: activeScene.accent }]}>
                    <AppText variant="button" style={styles.primaryText}>{result.mastered ? hasNextScene ? "SUIVANT" : "TERMINER" : "REVOIR L’ÉTAPE"}</AppText>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020306" },
  background: { flex: 1 },
  gateFrame: { width: "100%", alignSelf: "center", justifyContent: "center", flex: 1 },
  scroll: { paddingTop: 10, paddingBottom: 120 },
  frame: { width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  headerButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  backArrow: { color: "#fff" },
  helpToggle: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.06)" },
  title: { marginTop: 5 },
  romanizationNotice: { marginTop: 8, maxWidth: 650 },
  tabs: { gap: 8, paddingVertical: 18 },
  tab: { borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  tabLocked: { opacity: 0.45 },
  tabText: { color: "rgba(255,255,255,0.9)" },
  introCard: { borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.13)", padding: 20, overflow: "hidden" },
  introHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 },
  introHeaderCompact: { flexDirection: "column", gap: 10 },
  introCopy: { flex: 1, gap: 4 },
  stateBadge: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  description: { marginTop: 14 },
  instruction: { marginTop: 14, borderLeftWidth: 3, paddingLeft: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 12 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cardPressable: { flexGrow: 1, flexBasis: 280, minWidth: 0 },
  card: { minHeight: 150, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 18, overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  glyph: { flexShrink: 1 },
  audioMark: { opacity: 0.8 },
  cardLabel: { marginTop: 8, marginBottom: 5 },
  primaryButton: { marginTop: 24, borderRadius: 18, overflow: "hidden" },
  buttonDisabled: { opacity: 0.45 },
  primaryGradient: { paddingVertical: 17, paddingHorizontal: 20, alignItems: "center" },
  primaryText: { color: "#020306" },
  nextCard: { marginTop: 16, borderRadius: 18, padding: 18, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.07)" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2,3,6,0.8)", justifyContent: "flex-end" },
  quizSheet: { height: "92%", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  quizScroll: { flex: 1 },
  quizContent: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 34 },
  quizHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  replayButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.08)" },
  questionDisplay: { marginTop: 20 },
  prompt: { marginTop: 18, marginBottom: 18 },
  options: { gap: 10 },
  compactOptions: { flexDirection: "row", flexWrap: "wrap" },
  option: { borderRadius: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.07)", paddingHorizontal: 16, paddingVertical: 15 },
  compactOption: { width: "46%" },
  audioOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 9 },
  audioListen: { flex: 1, paddingVertical: 6 },
  audioChoose: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  optionWrong: { borderColor: "#F87171", backgroundColor: "rgba(248,113,113,0.14)" },
  optionCorrect: { borderColor: "#4ADE80", backgroundColor: "rgba(74,222,128,0.14)" },
  feedback: { marginTop: 18, borderWidth: 1, borderRadius: 18, padding: 16, gap: 9 },
  continueButton: { marginTop: 12, borderRadius: 14, alignItems: "center", paddingVertical: 14, paddingHorizontal: 18 },
  result: { alignItems: "center", gap: 16, paddingVertical: 24 },
  resultScore: { color: "#fff" },
});
