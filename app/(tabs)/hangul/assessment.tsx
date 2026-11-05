import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AppBackButton } from "../../../components/ui/app-back-button";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { trackHangulExerciseCompleted } from "../../../lib/immersionStreak";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { HangulReplayButton } from "../../../components/hangul/HangulReplayButton";
import { HANGUL_ASSESSMENT_QUESTIONS } from "../../../data/hangul/assessment";
import {
  HANGUL_ASSESSMENT_PASS_SCORE,
  HANGUL_MODULES,
} from "../../../data/hangul/curriculum";
import { useHangulAudio } from "../../../hooks/useHangulAudio";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import { hangulUiText, hangulContentText, type HangulUiKey } from "../../../lib/i18n/hangulDisplay";
import { needsHangulOptionTranslation, originalHangulOptionIndex } from "../../../data/localized/hangulRegistry";
import { shuffleHangulQuestions } from "../../../lib/hangulQuiz";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.jpg");
const createAssessmentQuestions = () =>
  shuffleHangulQuestions(HANGUL_ASSESSMENT_QUESTIONS);

export default function HangulAssessmentScreen() {
  const { i18n } = useTranslation("hangul");
  const uiScript = i18n.resolvedLanguage === "ja" ? "japanese" : "latin";
  const l = (key: HangulUiKey, values?: Record<string, string | number>) => hangulUiText(i18n, key, values);
  const q = (id: string, field: string, original: string) => hangulContentText(i18n, "question", ["assessment", id], field, original);
  const moduleTitle = (id: string, original: string) => hangulContentText(i18n, "module", [id], "title", original);
  const { progress, updateHangulProgress, complete, isHydrated } = useStore();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const responsive = useResponsiveLayout({ maxWidth: isLandscape ? 1040 : 760 });
  const landscapeGap = height <= 380 ? 20 : 28;
  const safeContentWidth = Math.min(
    responsive.maxWidth,
    Math.max(
      0,
      width -
        insets.left -
        insets.right -
        responsive.horizontalPadding * 2,
    ),
  );
  const useLandscapeLayout = isLandscape && safeContentWidth >= 600;
  const introWidth = Math.min(300, Math.max(220, safeContentWidth * 0.34));
  const assessmentWidth = Math.max(
    0,
    safeContentWidth - introWidth - landscapeGap,
  );
  const useLandscapeOptionGrid =
    useLandscapeLayout && assessmentWidth >= 440;
  const landscapeOptionWidth =
    (assessmentWidth - 36 - 10) / 2;
  const { playAudio } = useHangulAudio();
  const [started, setStarted] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [answered, setAnswered] = React.useState<string | null>(null);
  const [finished, setFinished] = React.useState(false);
  const [questions, setQuestions] = React.useState(createAssessmentQuestions);
  const completionReportedRef = React.useRef(false);
  const current = questions[index];
  const correctAnswerLabel = current?.options.find(
    (option) => option.value === current.answer,
  )?.label ?? current?.answer;
  const isCurrentAnswerCorrect = answered !== null && answered === current?.answer;
  const teacherFeedback = current
    ? l(`feedback.${current.type}.${isCurrentAnswerCorrect ? "correct" : "incorrect"}` as HangulUiKey)
    : "";
  const saved = progress.hangulProgress.assessment;
  const missingModule = HANGUL_MODULES.find((module) => !progress.completed[module.id]);
  const curriculumReady = !missingModule || !!saved?.passed;

  React.useEffect(() => {
    if (started && !finished && answered === null && current.audio) {
      const timer = setTimeout(() => playAudio(current.audio!), 250);
      return () => clearTimeout(timer);
    }
  }, [answered, current, finished, playAudio, started]);

  const start = () => {
    if (!isHydrated) return;
    if (missingModule && !saved?.passed) {
      router.replace(missingModule.route as never);
      return;
    }
    setIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setQuestions(createAssessmentQuestions());
    completionReportedRef.current = false;
    setStarted(true);
  };

  const answer = (value: string) => {
    if (!isHydrated || answered !== null) return;
    setAnswered(value);
    if (value === current.answer) setScore((value) => value + 1);
    else {
      updateHangulProgress((state) => {
        const lesson = state.lessons.hangul_assessment_errors;
        const errors = { ...(lesson?.errorsByCharacter ?? {}) };
        current.characters.forEach((character) => {
          errors[character] = (errors[character] ?? 0) + 1;
        });
        return {
          ...state,
          lessons: {
            ...state.lessons,
            hangul_assessment_errors: {
              currentSceneId: "assessment",
              discovered: {},
              completedScenes: {},
              masteredScenes: {},
              scores: {},
              errorsByCharacter: errors,
            },
          },
        };
      });
    }
  };

  const next = () => {
    if (!isHydrated) return;
    const finalScore = score;
    if (index + 1 < HANGUL_ASSESSMENT_QUESTIONS.length) {
      setIndex((value) => value + 1);
      setAnswered(null);
      return;
    }
    if (completionReportedRef.current) return;
    completionReportedRef.current = true;
    const passed = finalScore >= HANGUL_ASSESSMENT_PASS_SCORE;
    const progressWrite = updateHangulProgress((state) => ({
      ...state,
      assessment: {
        attempts: (state.assessment?.attempts ?? 0) + 1,
        bestScore: Math.max(state.assessment?.bestScore ?? 0, finalScore),
        total: HANGUL_ASSESSMENT_QUESTIONS.length,
        passed: state.assessment?.passed || passed,
      },
    }));
    void Promise.all([
      progressWrite,
      passed ? complete("hangul_assessment") : Promise.resolve(false),
      trackHangulExerciseCompleted("hangul_assessment"),
    ]);
    setFinished(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bgImage} resizeMode="cover">
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
        <ScrollView
          showsVerticalScrollIndicator={!useLandscapeLayout}
          contentContainerStyle={[
            styles.scroll,
            useLandscapeLayout && styles.scrollLandscape,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View
            style={[
              styles.frame,
              useLandscapeLayout && styles.frameLandscape,
              useLandscapeLayout && { gap: landscapeGap },
              { maxWidth: responsive.maxWidth },
            ]}
          >
            <View
              style={
                useLandscapeLayout
                  ? [styles.introColumn, { width: introWidth }]
                  : undefined
              }
            >
              <View style={[styles.back, useLandscapeLayout && styles.backLandscape]}>
                <AppBackButton label={l("common.back")} labelScript={uiScript} accessibilityLabel={l("common.backA11y")} accessibilityHint={l("common.backHint")} />
              </View>
              <AppText script={uiScript} variant="sectionLabel" style={styles.gold}>{l("assessment.eyebrow")}</AppText>
              <AppText script={uiScript}
                variant="screenTitle"
                style={[styles.title, useLandscapeLayout && styles.titleLandscape]}
              >
                {l("assessment.title")}
              </AppText>
              <AppText script={uiScript} variant="bodySecondary" tone="muted">
                {l("assessment.description")}
              </AppText>
            </View>

            <View style={useLandscapeLayout ? styles.assessmentColumn : undefined}>
              {!started ? (
              <BlurView
                intensity={55}
                tint="dark"
                style={[styles.card, useLandscapeLayout && styles.cardLandscape]}
              >
                <AppText script={uiScript} variant="sceneTitle">{l("assessment.programTitle")}</AppText>
                <AppText script={uiScript} variant="body">{l("assessment.program")}</AppText>
                {saved ? <AppText script={uiScript} variant="bodySecondary" tone="muted">{l("assessment.best", { score: saved.bestScore, total: saved.total, attempts: saved.attempts })}</AppText> : null}
                {!curriculumReady && missingModule ? <AppText script={uiScript} variant="bodySecondary" style={styles.warning}>{l("assessment.completePrerequisite", { title: moduleTitle(missingModule.id, missingModule.title) })}</AppText> : null}
                <Pressable onPress={start} style={styles.button}><AppText script={uiScript} variant="button" style={styles.buttonText}>{curriculumReady ? l("assessment.start") : l("assessment.openPrerequisite", { title: missingModule ? moduleTitle(missingModule.id, missingModule.title) : "" })}</AppText></Pressable>
              </BlurView>
              ) : finished ? (
              <BlurView
                intensity={55}
                tint="dark"
                style={[styles.card, useLandscapeLayout && styles.cardLandscape]}
              >
                <AppText script={uiScript} variant="sectionLabel" style={{ color: score >= HANGUL_ASSESSMENT_PASS_SCORE ? "#4ADE80" : "#FDE047" }}>{score >= HANGUL_ASSESSMENT_PASS_SCORE ? l("assessment.passed") : l("assessment.failed")}</AppText>
                <AppText script={uiScript} variant="numericValue">{score}/{HANGUL_ASSESSMENT_QUESTIONS.length}</AppText>
                <AppText script={uiScript} variant="bodySecondary" tone="muted" align="center">{score >= HANGUL_ASSESSMENT_PASS_SCORE ? l("assessment.passedDescription") : l("assessment.failedDescription")}</AppText>
                <Pressable onPress={() => score >= HANGUL_ASSESSMENT_PASS_SCORE ? router.push("/(tabs)/hangul/bridge" as never) : start()} style={styles.button}><AppText script={uiScript} variant="button" style={styles.buttonText}>{score >= HANGUL_ASSESSMENT_PASS_SCORE ? l("assessment.openBridge") : l("assessment.restart")}</AppText></Pressable>
              </BlurView>
              ) : (
              <BlurView
                intensity={70}
                tint="dark"
                style={[styles.card, useLandscapeLayout && styles.cardLandscape]}
              >
                <View style={styles.questionHeader}>
                  <AppText script={uiScript} variant="sectionLabel" style={styles.gold}>{l("assessment.question", { current: index + 1, total: HANGUL_ASSESSMENT_QUESTIONS.length })}</AppText>
                  {current.audio ? <HangulReplayButton accent="#FDE047" onPress={() => playAudio(current.audio!)} /> : null}
                </View>
                {current.display ? <AppText variant="koreanHero" script="korean" align="center" style={styles.display}>{current.display}</AppText> : null}
                <AppText script={uiScript} variant="sceneTitle" align="center">{q(current.id, "prompt", current.prompt)}</AppText>
                <View
                  style={[
                    styles.options,
                    useLandscapeOptionGrid && styles.optionsLandscape,
                  ]}
                >
                  {current.options.map((option) => {
                    const correct = answered !== null && option.value === current.answer;
                    const wrong = answered === option.value && option.value !== current.answer;
                    return <Pressable key={option.value} onPress={() => answer(option.value)} style={[styles.option, useLandscapeOptionGrid && { width: landscapeOptionWidth }, correct && styles.correct, wrong && styles.wrong]}><AppText script={uiScript} variant="bodyStrong" align="center">{needsHangulOptionTranslation(option.label) ? q(current.id, `option${originalHangulOptionIndex(HANGUL_ASSESSMENT_QUESTIONS.find(item => item.id === current.id)!, option.value)}`, option.label) : option.label}</AppText></Pressable>;
                  })}
                </View>
                {answered !== null ? (
                  <View style={styles.feedback}>
                    <AppText script={uiScript} variant="bodyStrong" style={{ color: isCurrentAnswerCorrect ? "#4ADE80" : "#F87171" }}>
                      {isCurrentAnswerCorrect ? l("assessment.correct") : l("assessment.incorrect")}
                    </AppText>
                    <AppText script={uiScript} variant="bodyStrong">{teacherFeedback}</AppText>
                    {!isCurrentAnswerCorrect ? (
                      <AppText script={uiScript} variant="bodySecondary">{l("assessment.remember", { answer: correctAnswerLabel })}</AppText>
                    ) : null}
                    <AppText script={uiScript} variant="bodySecondary">{q(current.id, "explanation", current.explanation)}</AppText>
                    <Pressable onPress={next} style={styles.button}><AppText script={uiScript} variant="button" style={styles.buttonText}>{index + 1 < HANGUL_ASSESSMENT_QUESTIONS.length ? l("assessment.next") : l("assessment.finish")}</AppText></Pressable>
                  </View>
                ) : null}
              </BlurView>
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020306" },
  bgImage: { flex: 1, overflow: "hidden", backgroundColor: "#020306" },
  bgBlur: { ...ABSOLUTE_FILL },
  vignetteOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.52)",
  },
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
  scroll: { paddingTop: 16, paddingBottom: 100 },
  scrollLandscape: { paddingTop: 8, paddingBottom: 36 },
  frame: { width: "100%", alignSelf: "center" },
  frameLandscape: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  introColumn: { flexShrink: 0, paddingTop: 2 },
  assessmentColumn: { flex: 1, minWidth: 0 },
  back: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 26 },
  backLandscape: { marginBottom: 18 },
  gold: { color: "#FDE047" },
  title: { marginTop: 15, marginBottom: 18 },
  titleLandscape: { marginTop: 10, marginBottom: 12 },
  card: { marginTop: 24, borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 22, gap: 16, overflow: "hidden" },
  cardLandscape: { marginTop: 0, padding: 18, gap: 12 },
  button: { marginTop: 8, borderRadius: 15, paddingVertical: 15, paddingHorizontal: 18, alignItems: "center", backgroundColor: "#FDE047" },
  buttonText: { color: "#020306" },
  questionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  display: { color: "#FDE047", marginVertical: 10 },
  options: { gap: 10 },
  optionsLandscape: { flexDirection: "row", flexWrap: "wrap" },
  option: { borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 15, padding: 15 },
  correct: { borderColor: "#4ADE80", backgroundColor: "rgba(74,222,128,0.14)" },
  wrong: { borderColor: "#F87171", backgroundColor: "rgba(248,113,113,0.14)" },
  feedback: { gap: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)", paddingTop: 15 },
  warning: { color: "#FDE047" },
});
