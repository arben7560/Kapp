import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trackHangulExerciseCompleted } from "../../../lib/immersionStreak";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { HANGUL_ASSESSMENT_QUESTIONS } from "../../../data/hangul/assessment";
import {
  HANGUL_ASSESSMENT_PASS_SCORE,
  HANGUL_MODULES,
} from "../../../data/hangul/curriculum";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import { shuffleArray } from "../../../lib/choiceOrder";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");
const createAssessmentQuestions = () =>
  HANGUL_ASSESSMENT_QUESTIONS.map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));

export default function HangulAssessmentScreen() {
  const { progress, updateHangulProgress, complete } = useStore();
  const responsive = useResponsiveLayout({ maxWidth: 760 });
  const [started, setStarted] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [answered, setAnswered] = React.useState<string | null>(null);
  const [finished, setFinished] = React.useState(false);
  const [questions, setQuestions] = React.useState(createAssessmentQuestions);
  const current = questions[index];
  const correctAnswerLabel = current?.options.find(
    (option) => option.value === current.answer,
  )?.label ?? current?.answer;
  const saved = progress.hangulProgress.assessment;
  const missingModule = HANGUL_MODULES.find((module) => !progress.completed[module.id]);
  const curriculumReady = !missingModule || !!saved?.passed;

  const speak = React.useCallback((value: string) => {
    Speech.stop();
    Speech.speak(value, { language: "ko-KR", rate: 0.72 });
  }, []);

  React.useEffect(() => {
    if (started && !finished && answered === null && current.audio) {
      const timer = setTimeout(() => speak(current.audio!), 250);
      return () => clearTimeout(timer);
    }
  }, [answered, current, finished, speak, started]);

  React.useEffect(() => () => {
    void Speech.stop();
  }, []);

  const start = () => {
    if (missingModule && !saved?.passed) {
      router.replace(missingModule.route as never);
      return;
    }
    setIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setQuestions(createAssessmentQuestions());
    setStarted(true);
  };

  const answer = (value: string) => {
    if (answered !== null) return;
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
    const finalScore = score;
    if (index + 1 < HANGUL_ASSESSMENT_QUESTIONS.length) {
      setIndex((value) => value + 1);
      setAnswered(null);
      return;
    }
    const passed = finalScore >= HANGUL_ASSESSMENT_PASS_SCORE;
    updateHangulProgress((state) => ({
      ...state,
      assessment: {
        attempts: (state.assessment?.attempts ?? 0) + 1,
        bestScore: Math.max(state.assessment?.bestScore ?? 0, finalScore),
        total: HANGUL_ASSESSMENT_QUESTIONS.length,
        passed: state.assessment?.passed || passed,
      },
    }));
    if (passed) {
      complete("hangul_assessment");
      void trackHangulExerciseCompleted("hangul_assessment");
    }
    setFinished(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.background} resizeMode="cover">
        <LinearGradient colors={["rgba(2,3,6,0.68)", "rgba(2,3,6,0.93)"]} style={StyleSheet.absoluteFillObject} />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: responsive.horizontalPadding }]}>
          <View style={[styles.frame, { maxWidth: responsive.maxWidth }]}>
            <Pressable onPress={() => router.back()} style={styles.back}>
              <AppText variant="screenTitle">‹</AppText>
              <AppText variant="sectionLabel">PARCOURS HANGUL</AppText>
            </Pressable>
            <AppText variant="sectionLabel" style={styles.gold}>VALIDATION FINALE</AppText>
            <AppText variant="screenTitle" style={styles.title}>Lire sans romanisation</AppText>
            <AppText variant="bodySecondary" tone="muted">
              12 défis, majoritairement inédits. Il faut 11 bonnes réponses pour réussir.
            </AppText>

            {!started ? (
              <BlurView intensity={55} tint="dark" style={styles.card}>
                <AppText variant="sceneTitle">Au programme</AppText>
                <AppText variant="body">Reconnaissance visuelle · écoute · assemblage · lecture inédite · batchim · liaison</AppText>
                {saved ? <AppText variant="bodySecondary" tone="muted">Meilleur résultat : {saved.bestScore}/{saved.total} · {saved.attempts} tentative(s)</AppText> : null}
                {!curriculumReady && missingModule ? <AppText variant="bodySecondary" style={styles.warning}>Termine d’abord « {missingModule.title} ».</AppText> : null}
                <Pressable onPress={start} style={styles.button}><AppText variant="button" style={styles.buttonText}>{curriculumReady ? "Commencer sans aide latine" : `Ouvrir ${missingModule?.title}`}</AppText></Pressable>
              </BlurView>
            ) : finished ? (
              <BlurView intensity={55} tint="dark" style={styles.card}>
                <AppText variant="sectionLabel" style={{ color: score >= HANGUL_ASSESSMENT_PASS_SCORE ? "#4ADE80" : "#FDE047" }}>{score >= HANGUL_ASSESSMENT_PASS_SCORE ? "LECTURE RÉUSSIE" : "SONS À REVOIR"}</AppText>
                <AppText variant="numericValue">{score}/{HANGUL_ASSESSMENT_QUESTIONS.length}</AppText>
                <AppText variant="bodySecondary" tone="muted" align="center">{score >= HANGUL_ASSESSMENT_PASS_SCORE ? "Tu peux maintenant lire des phrases guidées." : "Revois les sons concernés avant une nouvelle tentative."}</AppText>
                <Pressable onPress={() => score >= HANGUL_ASSESSMENT_PASS_SCORE ? router.push("/(tabs)/hangul/bridge" as never) : start()} style={styles.button}><AppText variant="button" style={styles.buttonText}>{score >= HANGUL_ASSESSMENT_PASS_SCORE ? "OUVRIR LA LECTURE GUIDÉE" : "RECOMMENCER L’ÉVALUATION"}</AppText></Pressable>
              </BlurView>
            ) : (
              <BlurView intensity={70} tint="dark" style={styles.card}>
                <View style={styles.questionHeader}>
                  <AppText variant="sectionLabel" style={styles.gold}>QUESTION {index + 1}/12</AppText>
                  {current.audio ? <Pressable onPress={() => speak(current.audio!)} style={styles.replay}><AppText variant="caption">🔊 RÉÉCOUTER</AppText></Pressable> : null}
                </View>
                {current.display ? <AppText variant="koreanHero" script="korean" align="center" style={styles.display}>{current.display}</AppText> : null}
                <AppText variant="sceneTitle" align="center">{current.prompt}</AppText>
                <View style={styles.options}>
                  {current.options.map((option) => {
                    const correct = answered !== null && option.value === current.answer;
                    const wrong = answered === option.value && option.value !== current.answer;
                    return <Pressable key={option.value} onPress={() => answer(option.value)} style={[styles.option, correct && styles.correct, wrong && styles.wrong]}><AppText variant="bodyStrong" align="center">{option.label}</AppText></Pressable>;
                  })}
                </View>
                {answered !== null ? <View style={styles.feedback}><AppText variant="bodyStrong" style={{ color: answered === current.answer ? "#4ADE80" : "#F87171" }}>{answered === current.answer ? "Correct" : `Bonne réponse : ${correctAnswerLabel}`}</AppText><AppText variant="bodySecondary">{current.explanation}</AppText><Pressable onPress={next} style={styles.button}><AppText variant="button" style={styles.buttonText}>{index + 1 < HANGUL_ASSESSMENT_QUESTIONS.length ? "SUIVANT" : "TERMINER"}</AppText></Pressable></View> : null}
              </BlurView>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020306" },
  background: { flex: 1 },
  scroll: { paddingTop: 16, paddingBottom: 100 },
  frame: { width: "100%", alignSelf: "center" },
  back: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 26 },
  gold: { color: "#FDE047" },
  title: { marginTop: 6, marginBottom: 8 },
  card: { marginTop: 24, borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 22, gap: 16, overflow: "hidden" },
  button: { marginTop: 8, borderRadius: 15, paddingVertical: 15, paddingHorizontal: 18, alignItems: "center", backgroundColor: "#FDE047" },
  buttonText: { color: "#020306" },
  questionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  replay: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.08)" },
  display: { color: "#FDE047", marginVertical: 10 },
  options: { gap: 10 },
  option: { borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 15, padding: 15 },
  correct: { borderColor: "#4ADE80", backgroundColor: "rgba(74,222,128,0.14)" },
  wrong: { borderColor: "#F87171", backgroundColor: "rgba(248,113,113,0.14)" },
  feedback: { gap: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)", paddingTop: 15 },
  warning: { color: "#FDE047" },
});
