import type { ScrollViewInstance } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AccessibilityInfo,
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { ListenTrainingCompletionModal } from "../../components/listen/ListenTrainingCompletionModal";
import { AppBackButton } from "../../components/ui/app-back-button";
import { HubModuleAccents } from "../../constants/theme";
import {
  EXERCISES_BY_KIND,
  TRAINING_ORDER,
  type ExerciseKind,
} from "../../data/listen/activeExercises";
import { useVocAudio } from "../../hooks/useVocAudio";
import {
  completeDailyActivity,
  type DailyStreakCompletionResult,
} from "../../lib/dailyStreak";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { resolveDisplayMessage, type DisplayMessage } from "../../lib/i18n/displayText";
import { shuffleListenChoices } from "../../lib/listenExerciseChoices";
import { canValidateListenAnswer } from "../../lib/listenValidation";
import { recordListenTrainingSuccess } from "../../lib/listenTrainingCompletion";
import { buildProgressId } from "../../lib/progressIds";

const BG_URL =
  "https://images.unsplash.com/photo-1741533911359-943221043128?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=75&w=1600";

const COLORS = {
  bg: "#07080d",
  card: "rgba(14, 17, 28, 0.78)",
  cardSoft: "rgba(255,255,255,0.08)",
  line: "rgba(255,255,255,0.14)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.66)",
  faint: "rgba(255,255,255,0.42)",
  red: "#ff4f66",
  redSoft: "rgba(255,79,102,0.18)",
  green: "#8df0b5",
};
const LISTEN_ACCENT = HubModuleAccents.listening;

const LISTEN_AUDIO_BY_ID: Partial<Record<string, number>> = {
  "cafe-dictation-01": require("../../assets/audio/listen/myeot-buniseyo-1.mp3"),
  "cafe-dictation-02": require("../../assets/audio/listen/aiseu-amerikano-juseyo-1.mp3"),
  "metro-dictation-03": require("../../assets/audio/listen/igoseuro-gaseyo.mp3"),
  "shop-dictation-04": require("../../assets/audio/listen/eolmayeyo.mp3"),
  "hotel-dictation-05": require("../../assets/audio/listen/yeyakhaesseoyo-1.mp3"),
  "bbq-situation-01": require("../../assets/audio/listen/myeot-buniseyo-2.mp3"),
  "cafe-situation-02": require("../../assets/audio/listen/chumun-hasigesseoyeo.mp3"),
  "metro-situation-03": require("../../assets/audio/listen/ibeon-yeogeun-hongdaeipguyeogimnida.mp3"),
  "shop-situation-04": require("../../assets/audio/listen/kadeuro-hasigesseoyo-hyeongeumeuro-hasigesseoyo.mp3"),
  "street-situation-05": require("../../assets/audio/listen/yeogiseo-jjuk-gasimyeon-dwaeyo.mp3"),
  "restaurant-gap-01": require("../../assets/audio/listen/samgyeopsal-iinbun-juseyo.mp3"),
  "cafe-gap-02": require("../../assets/audio/listen/aiseu-ratte-juseyo.mp3"),
  "shop-gap-03": require("../../assets/audio/listen/kadeuro-gyesanhalgeyo.mp3"),
  "metro-gap-04": require("../../assets/audio/listen/hongdaeipgueseo-naeryeoyo.mp3"),
  "hotel-gap-05": require("../../assets/audio/listen/yeyakhaesseoyo-2.mp3"),
  "metro-order-01": require("../../assets/audio/listen/ijjogeuro-jjuk-gaseyo.mp3"),
  "cafe-order-02": require("../../assets/audio/listen/aiseu-amerikano-juseyo-2.mp3"),
  "shop-order-03": require("../../assets/audio/listen/igeo-eolmayeyo.mp3"),
  "restaurant-order-04": require("../../assets/audio/listen/mul-jom-juseyo.mp3"),
  "street-order-05": require("../../assets/audio/listen/hwajangsiri-eodiyeyo.mp3"),
  "cafe-reaction-01": require("../../assets/audio/listen/mwo-deurilkkayo.mp3"),
  "restaurant-reaction-02": require("../../assets/audio/listen/deo-piryohan-geo-isseuseyo.mp3"),
  "shop-reaction-03": require("../../assets/audio/listen/mwo-chajeusineun-geo-isseuseyo.mp3"),
  "hotel-reaction-04": require("../../assets/audio/listen/yeyakhasyeosseoyo.mp3"),
  "street-reaction-05": require("../../assets/audio/listen/yeogiseo-jjuk-gasimyeon-dwaeyo.mp3"),
};

type ListeningKey = Extract<DisplayMessage, { namespace: "listening" }>["key"];

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getRequestedListenPosition(
  trainingParam: string | undefined,
  exerciseParam: string | undefined,
) {
  const requestedTrainingIndex = TRAINING_ORDER.indexOf(
    trainingParam as ExerciseKind,
  );
  const trainingIndex = requestedTrainingIndex >= 0 ? requestedTrainingIndex : 0;
  const trainingKind = TRAINING_ORDER[trainingIndex];
  const exercises = EXERCISES_BY_KIND[trainingKind];
  const parsedExerciseIndex = Number.parseInt(exerciseParam ?? "", 10);
  const exerciseIndex =
    Number.isInteger(parsedExerciseIndex) &&
    parsedExerciseIndex >= 0 &&
    parsedExerciseIndex < exercises.length
      ? parsedExerciseIndex
      : 0;

  return { trainingIndex, exerciseIndex };
}

export default function ListenScreen() {
  const { i18n } = useTranslation("listening");
  const uiScript = i18n.resolvedLanguage === "ja" ? "japanese" : "latin";
  const l = (key: ListeningKey, values?: Record<string, string | number>) =>
    resolveDisplayMessage({ namespace: "listening", key, values }, i18n);
  const params = useLocalSearchParams<{
    training?: string | string[];
    exercise?: string | string[];
  }>();
  const requestedTraining = normalizeParam(params.training);
  const requestedExercise = normalizeParam(params.exercise);
  const requestedPosition = getRequestedListenPosition(
    requestedTraining,
    requestedExercise,
  );
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const isShortLandscape = isLandscape && height <= 430;
  const { complete, isHydrated, setTrack } = useStore();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const [scrollY] = useState(() => new Animated.Value(0));
  const validationLockRef = useRef(false);
  const listenSessionRef = useRef(0);
  const trainingCompletedIdsRef = useRef<Set<string>>(new Set());
  const [trainingCorrectCount, setTrainingCorrectCount] = useState(0);
  const [isTrainingSummaryOpen, setIsTrainingSummaryOpen] = useState(false);
  const [trainingStreakOutcome, setTrainingStreakOutcome] = useState<
    Exclude<DailyStreakCompletionResult, "already_completed"> | null
  >(null);
  const resumeRequestKeyRef = useRef(
    `${requestedTraining ?? ""}:${requestedExercise ?? ""}`,
  );
  const [trainingIndex, setTrainingIndex] = useState(
    requestedPosition.trainingIndex,
  );
  const [exerciseIndex, setExerciseIndex] = useState(
    requestedPosition.exerciseIndex,
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playedAudioIds, setPlayedAudioIds] = useState<Record<string, true>>(
    {},
  );
  const [completedAudioIds, setCompletedAudioIds] = useState<
    Record<string, true>
  >({});
  const {
    playAudio: playMp3,
    stopAudio,
    error: audioPlaybackError,
    clearError: clearAudioError,
  } = useVocAudio(setPlayingAudioId);

  const trainingKind = TRAINING_ORDER[trainingIndex];
  const exercises = EXERCISES_BY_KIND[trainingKind];
  const sourceItem = exercises[exerciseIndex];
  const item = useMemo(() => shuffleListenChoices(sourceItem), [sourceItem]);
  const meta = {
    mini: l(`kinds.${trainingKind}.mini` as ListeningKey),
    skill: l(`kinds.${trainingKind}.skill` as ListeningKey),
  };
  // These are presentation fields only; canonical questions and audio are untouched.
  const displayItem = {
    theme: l(`exercises.${item.id}.theme` as ListeningKey),
    title: l(`exercises.${item.id}.title` as ListeningKey),
    instruction: l(`exercises.${item.id}.instruction` as ListeningKey),
    explanation: l(`exercises.${item.id}.explanation` as ListeningKey),
  };
  const audioSource = LISTEN_AUDIO_BY_ID[item.id];
  const hasAttempt =
    item.kind === "order" ? picked.length > 0 : selected !== null;
  const hasPlayedCurrentAudio = !!playedAudioIds[item.id];
  const hasCompletedCurrentAudio = !!completedAudioIds[item.id];
  const isPlayingCurrentAudio = playingAudioId === item.id;
  const isLastExercise = exerciseIndex === exercises.length - 1;
  const isTrainingComplete = trainingCorrectCount === exercises.length;
  const landscapeHeaderStyle = useMemo(() => {
    if (!isLandscape) return undefined;

    const collapseDistance = isShortLandscape ? 48 : 72;
    const compactPadding = isShortLandscape ? 4 : 8;

    return {
      paddingTop: scrollY.interpolate({
        inputRange: [0, collapseDistance],
        outputRange: [35, compactPadding],
        extrapolate: "clamp" as const,
      }),
      paddingBottom: scrollY.interpolate({
        inputRange: [0, collapseDistance],
        outputRange: [18, compactPadding],
        extrapolate: "clamp" as const,
      }),
    };
  }, [isLandscape, isShortLandscape, scrollY]);
  const handleScroll = useMemo(
    () =>
      isLandscape
        ? Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )
        : undefined,
    [isLandscape, scrollY],
  );

  useEffect(() => {
    const requestKey = `${requestedTraining ?? ""}:${requestedExercise ?? ""}`;
    if (!requestedTraining || requestKey === resumeRequestKeyRef.current) return;

    const nextPosition = getRequestedListenPosition(
      requestedTraining,
      requestedExercise,
    );
    resumeRequestKeyRef.current = requestKey;
    validationLockRef.current = false;
    listenSessionRef.current += 1;
    trainingCompletedIdsRef.current.clear();
    setTrainingCorrectCount(0);
    setTrainingStreakOutcome(null);
    setIsTrainingSummaryOpen(false);
    clearAudioError();
    setTrainingIndex(nextPosition.trainingIndex);
    setExerciseIndex(nextPosition.exerciseIndex);
    setSelected(null);
    setPicked([]);
    setChecked(false);
  }, [clearAudioError, requestedExercise, requestedTraining]);

  useEffect(() => {
    void Promise.all([
      setTrack("listen"),
      saveHomeResumeContext({
        track: "listen",
        title: item.title,
        detail: `${meta.mini} · ${item.theme} · Exercice ${exerciseIndex + 1} / ${exercises.length}`,
        route: "/listen",
        routeParams: {
          training: trainingKind,
          exercise: String(exerciseIndex),
        },
      }),
    ]).catch(() => null);
  }, [
    exerciseIndex,
    exercises.length,
    item.theme,
    item.title,
    meta.mini,
    setTrack,
    trainingKind,
  ]);

  useEffect(() => {
    return stopAudio;
  }, [item.id, stopAudio]);

  useEffect(() => {
    if (!audioSource) {
      console.warn(
        `[Listen] Source audio manquante pour l’exercice ${item.id}.`,
      );
    }
  }, [audioSource, item.id]);

  const canCheck = useMemo(() => {
    if (item.kind === "order") return picked.length === item.words.length;
    return selected !== null;
  }, [item, picked.length, selected]);

  const isAnswerCorrect = () => {
    if (item.kind === "order") {
      const sentence = picked.map((id) => item.words[id]);
      return sentence.join(" ") === item.answer.join(" ");
    }

    if (item.kind === "gap") {
      return item.options[selected ?? -1] === item.answer;
    }

    return selected === item.answer;
  };

  const getExpectedAnswer = () => {
    if (item.kind === "order") return item.answer.join(" ");
    if (item.kind === "gap") return item.answer;
    return item.options[item.answer] ?? "";
  };

  const isCorrect = checked && isAnswerCorrect();
  const teacherFeedback = l(`feedback.${item.kind}.${isCorrect ? "correct" : "incorrect"}` as ListeningKey);

  const resetAnswer = () => {
    validationLockRef.current = false;
    setSelected(null);
    setPicked([]);
    setChecked(false);
  };

  const goNext = () => {
    const nextIndex =
      exerciseIndex === exercises.length - 1 ? 0 : exerciseIndex + 1;
    clearAudioError();
    setExerciseIndex(nextIndex);
    resetAnswer();
  };

  const resetTrainingSession = () => {
    listenSessionRef.current += 1;
    trainingCompletedIdsRef.current.clear();
    setTrainingCorrectCount(0);
    setTrainingStreakOutcome(null);
    setIsTrainingSummaryOpen(false);
    setDailyMessage(null);
  };

  const restartTraining = () => {
    resetTrainingSession();
    clearAudioError();
    setExerciseIndex(0);
    resetAnswer();
  };

  const changeTraining = (direction: -1 | 1) => {
    const nextTrainingIndex =
      (trainingIndex + direction + TRAINING_ORDER.length) %
      TRAINING_ORDER.length;

    resetTrainingSession();
    clearAudioError();
    setTrainingIndex(nextTrainingIndex);
    setExerciseIndex(0);
    resetAnswer();
  };

  const goToNextExercise = () => {
    changeTraining(1);
  };

  const handleValidate = () => {
    if (
      !canValidateListenAnswer({
        hasAnswer: canCheck,
        hasCompletedRequiredMedia: hasCompletedCurrentAudio,
        isHydrated,
        isLocked: checked || validationLockRef.current,
      })
    ) {
      return;
    }

    validationLockRef.current = true;
    const correct = isAnswerCorrect();
    const feedback = l(`feedback.${item.kind}.${correct ? "correct" : "incorrect"}` as ListeningKey);
    const sessionId = listenSessionRef.current;

    setChecked(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);

    AccessibilityInfo.announceForAccessibility(
      correct
        ? l("ui.accessibilityCorrect", { feedback, explanation: displayItem.explanation })
        : l("ui.accessibilityIncorrect", { feedback }),
    );

    if (correct) {
      // Le streak ne doit être attribué qu'après une bonne réponse.
      // Le stockage quotidien est idempotent, même si l'utilisateur rejoue.
      void Promise.all([
        complete(buildProgressId("listen", item.id)),
        completeDailyActivity("listen_exercise"),
      ])
        .then(([, state]) => {
          // Ignorer les résultats tardifs d'une ancienne session de navigation.
          if (listenSessionRef.current !== sessionId) return;

          const outcome = state.lastCompletionResult;
          if (outcome && outcome !== "already_completed") {
            setTrainingStreakOutcome((previous) => previous ?? outcome);
            setDailyMessage(outcome);
            setTimeout(
              () => scrollRef.current?.scrollToEnd({ animated: true }),
              80,
            );
            setTimeout(() => setDailyMessage(null), 2200);
          }

          // Le bilan apparaît après cinq réussites distinctes par entraînement,
          // même si les questions ont été consultées dans le désordre.
          const progress = recordListenTrainingSuccess(
            trainingKind,
            trainingCompletedIdsRef.current,
            item.id,
          );
          trainingCompletedIdsRef.current = progress.ids;
          setTrainingCorrectCount(progress.completedCount);
          if (progress.justCompletedTraining) {
            setDailyMessage(null);
            setIsTrainingSummaryOpen(true);
          }
        })
        .catch((error) => {
          console.warn("[Listen] Impossible d'enregistrer l'exercice :", error);
        });
    }
  };

  const playAudio = () => {
    if (!audioSource || isPlayingCurrentAudio) return;
    void playMp3(audioSource, item.id, {
      onCompleted: () => {
        setCompletedAudioIds((current) => ({
          ...current,
          [item.id]: true,
        }));
      },
      onStarted: () => {
        setPlayedAudioIds((current) => ({ ...current, [item.id]: true }));
      },
    });
  };

  const pickOrderWord = (wordIndex: number) => {
    if ((checked && isCorrect) || picked.includes(wordIndex)) return;

    if (checked) {
      validationLockRef.current = false;
      setChecked(false);
    }

    setPicked((prev) => [...prev, wordIndex]);
  };

  const removeOrderWord = (wordIndex: number) => {
    if (checked && isCorrect) return;

    if (checked) {
      validationLockRef.current = false;
      setChecked(false);
    }

    setPicked((prev) => prev.filter((id) => id !== wordIndex));
  };

  const renderChoices = () => {
    if (item.kind === "order") {
      return (
        <View>
          <View style={styles.sentenceBox}>
            {picked.length === 0 ? (
              <AppText script={uiScript} variant="body" tone="soft" style={styles.placeholder}>
                {l("ui.constructSentence")}
              </AppText>
            ) : (
              picked.map((wordIndex) => (
                <Pressable
                  key={wordIndex}
                  accessibilityRole="button"
                  accessibilityLabel={l("ui.removeWord", { word: item.words[wordIndex] })}
                  accessibilityState={{ selected: true }}
                  aria-selected={true}
                  hitSlop={6}
                  onPress={() => removeOrderWord(wordIndex)}
                  style={styles.wordSelected}
                >
                  <AppText
                    variant="koreanSecondary"
                    tone="strong"
                    script="korean"
                    accessibilityLanguage="ko"
                    style={styles.wordText}
                  >
                    {item.words[wordIndex]}
                  </AppText>
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.wordGrid}>
            {item.words.map((word, wordIndex) => {
              const used = picked.includes(wordIndex);
              return (
                <Pressable
                  key={`${word}-${wordIndex}`}
                  accessibilityRole="button"
                  accessibilityLabel={l("ui.addWord", { word })}
                  accessibilityState={{
                    disabled: used || (checked && isCorrect),
                    selected: used,
                  }}
                  aria-disabled={used || (checked && isCorrect)}
                  aria-selected={used}
                  hitSlop={6}
                  disabled={used || (checked && isCorrect)}
                  onPress={() => pickOrderWord(wordIndex)}
                  style={[styles.wordOption, used && styles.disabledOption]}
                >
                  <AppText
                    variant="koreanSecondary"
                    tone={used ? "soft" : "strong"}
                    script="korean"
                    accessibilityLanguage="ko"
                    style={[styles.optionText, used && styles.disabledText]}
                  >
                    {word}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (item.kind === "gap") {
      return (
        <View>
          <View style={styles.gapSentence}>
            <AppText
              variant="koreanPrimary"
              tone="strong"
              script="korean"
              accessibilityLanguage="ko"
              style={styles.koreanInline}
            >
              {item.before}
            </AppText>
            <View style={styles.blank} />
            <AppText
              variant="koreanPrimary"
              tone="strong"
              script="korean"
              accessibilityLanguage="ko"
              style={styles.koreanInline}
            >
              {item.after}
            </AppText>
          </View>

          <View style={styles.choiceStack}>
            {item.options.map((option, optionIndex) => (
              <ChoiceButton
                key={`${option}-${optionIndex}`}
                label={option}
                active={selected === optionIndex}
                locked={checked && isCorrect}
                correct={
                  checked &&
                  isCorrect &&
                  selected === optionIndex &&
                  option === item.answer
                }
                wrong={checked && !isCorrect && selected === optionIndex}
                onPress={() => {
                  if (!isCorrect) {
                    validationLockRef.current = false;
                    setSelected(optionIndex);
                    setChecked(false);
                  }
                }}
              />
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.choiceStack}>
        {item.options.map((option, optionIndex) => (
          <ChoiceButton
            key={option}
            label={option}
            active={selected === optionIndex}
            locked={checked && isCorrect}
            correct={
              checked &&
              isCorrect &&
              selected === optionIndex &&
              optionIndex === item.answer
            }
            wrong={checked && !isCorrect && selected === optionIndex}
            onPress={() => {
              if (!isCorrect) {
                validationLockRef.current = false;
                setSelected(optionIndex);
                setChecked(false);
              }
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <ImageBackground
      source={{ uri: BG_URL }}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.header, landscapeHeaderStyle]}>
          <AppBackButton />
        </Animated.View>

        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          scrollEventThrottle={isLandscape ? 16 : undefined}
          onScroll={handleScroll}
        >
          <View style={styles.modePill}>
            <Ionicons
              name="volume-high"
              size={16}
              color={LISTEN_ACCENT.base}
            />
            <AppText script={uiScript} variant="label" tone="strong" style={styles.modeText}>
              {l("ui.module")}
            </AppText>
          </View>

          <View style={styles.modeSwitcherWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={l("ui.previousTraining")}
              hitSlop={8}
              onPress={() => changeTraining(-1)}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.text} />
            </Pressable>

            <View style={styles.modeCenterPill}>
              <AppText script={uiScript}
                variant="label"
                tone="soft"
                style={styles.modeCenterMini}
              >
                {l("ui.training")}
              </AppText>
              <AppText script={uiScript}
                variant="bodyStrong"
                tone="strong"
                style={styles.modeCenterLabel}
              >
                {meta.mini}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={l("ui.nextTraining")}
              hitSlop={8}
              onPress={() => changeTraining(1)}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-forward" size={22} color={COLORS.text} />
            </Pressable>
          </View>

          <View style={styles.progressRow}>
            {exercises.map((exercise, currentExerciseIndex) => (
              <Pressable
                key={exercise.id}
                accessibilityRole="button"
                accessibilityLabel={l("ui.questionPosition", { current: currentExerciseIndex + 1, total: exercises.length })}
                accessibilityState={{
                  selected: currentExerciseIndex === exerciseIndex,
                }}
                aria-selected={currentExerciseIndex === exerciseIndex}
                onPress={() => {
                  clearAudioError();
                  setExerciseIndex(currentExerciseIndex);
                  resetAnswer();
                }}
                style={styles.dotButton}
              >
                <View
                  style={[
                    styles.dot,
                    currentExerciseIndex === exerciseIndex && styles.dotActive,
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopTitleWrap}>
                <AppText script={uiScript}
                  variant="sectionLabel"
                  tone="brand"
                  style={styles.theme}
                >
                  {displayItem.theme}
                </AppText>
                <AppText script={uiScript}
                  variant="sectionTitle"
                  tone="strong"
                  style={styles.title}
                >
                  {displayItem.title}
                </AppText>
              </View>
              <AppText script={uiScript}
                variant="caption"
                tone="soft"
                align="end"
                style={styles.counter}
              >
                {String(exerciseIndex + 1).padStart(2, "0")} /{" "}
                {String(exercises.length).padStart(2, "0")}
              </AppText>
            </View>

            <View style={styles.skillRow}>
              <AppText script={uiScript} variant="label" tone="strong" style={styles.skillPill}>
                {meta.mini}
              </AppText>
              <AppText script={uiScript} variant="caption" tone="muted" style={styles.skillText}>
                {meta.skill}
              </AppText>
            </View>

            <AppText script={uiScript} variant="body" tone="muted" style={styles.instruction}>
              {displayItem.instruction}
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={l("ui.questionAudio", { action: l(hasPlayedCurrentAudio ? "ui.relisten" : "ui.listen") })}
              accessibilityState={{
                disabled: !audioSource || isPlayingCurrentAudio,
              }}
              aria-disabled={!audioSource || isPlayingCurrentAudio}
              hitSlop={6}
              disabled={!audioSource || isPlayingCurrentAudio}
              onPress={playAudio}
              style={[
                styles.listenButton,
                (!audioSource || isPlayingCurrentAudio) &&
                  styles.disabledButton,
              ]}
            >
              <Ionicons name="play" size={18} color={COLORS.text} />
              <AppText script={uiScript} variant="button" tone="strong" style={styles.listenText}>
                {l(hasPlayedCurrentAudio ? "ui.relisten" : "ui.listen")}
              </AppText>
            </Pressable>

            <AppText script={uiScript}
              variant="caption"
              tone="soft"
              align="center"
              style={styles.audioHint}
            >
              {audioSource
                ? isPlayingCurrentAudio
                  ? l("ui.playing")
                  : hasCompletedCurrentAudio
                    ? ""
                    : hasPlayedCurrentAudio
                      ? l("ui.interrupted")
                      : ""
                : l("ui.unavailable")}
            </AppText>

            {!!audioPlaybackError && (
              <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.audioError}
              >
                <AppText script={uiScript}
                  variant="body"
                  tone="strong"
                  style={styles.audioErrorText}
                >
                  {l("ui.audioError")}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={l("ui.retryAudioLabel")}
                  hitSlop={6}
                  onPress={playAudio}
                  style={styles.audioRetryButton}
                >
                  <AppText script={uiScript} variant="button" tone="strong">
                    {l("ui.retry")}
                  </AppText>
                </Pressable>
              </View>
            )}

            {renderChoices()}

            {checked && (
              <View
                accessibilityLiveRegion="polite"
                accessible
                accessibilityRole="alert"
                accessibilityLabel={
                  isCorrect
                    ? l("ui.accessibilityCorrectDetail", {
                        feedback: teacherFeedback,
                        source: item.kind === "situation" || item.kind === "reaction"
                          ? l("ui.accessibilitySource", { phrase: item.sourceText })
                          : "",
                        answer: getExpectedAnswer(),
                        explanation: displayItem.explanation,
                      })
                    : l("ui.accessibilityIncorrect", { feedback: teacherFeedback })
                }
                style={[styles.feedback, isCorrect ? styles.good : styles.bad]}
              >
                <AppText script={uiScript}
                  variant="bodyStrong"
                  tone="strong"
                  style={styles.feedbackTitle}
                >
                  {l(isCorrect ? "ui.good" : "ui.review")}
                </AppText>

                <AppText script={uiScript}
                  variant="body"
                  tone="strong"
                  style={styles.teacherFeedbackText}
                >
                  {teacherFeedback}
                </AppText>

                {isCorrect ? (
                  <>
                    {(item.kind === "situation" ||
                      item.kind === "reaction") && (
                      <>
                        <AppText script={uiScript}
                          variant="label"
                          tone="strong"
                          style={styles.expectedLabel}
                        >
                          {l("ui.heardPhrase")}
                        </AppText>

                        <AppText
                          variant="koreanSecondary"
                          tone="accent"
                          script="korean"
                          accessibilityLanguage="ko"
                          style={styles.expectedText}
                        >
                          {item.sourceText}
                        </AppText>
                      </>
                    )}

                    <AppText script={uiScript}
                      variant="label"
                      tone="strong"
                      style={styles.expectedLabel}
                    >
                      {l("ui.remember")}
                    </AppText>

                    <AppText
                      variant="koreanSecondary"
                      tone="accent"
                      script="korean"
                      accessibilityLanguage="ko"
                      style={styles.expectedText}
                    >
                      {getExpectedAnswer()}
                    </AppText>

                    <AppText script={uiScript}
                      variant="body"
                      tone="muted"
                      style={styles.feedbackText}
                    >
                      {displayItem.explanation}
                    </AppText>
                  </>
                ) : null}
              </View>
            )}

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  checked && isCorrect && isLastExercise
                    ? l("ui.restartTraining")
                    : l("ui.retryQuestion")
                }
                accessibilityState={{
                  disabled:
                    checked && isCorrect && isLastExercise
                      ? false
                      : !hasAttempt,
                }}
                aria-disabled={
                  checked && isCorrect && isLastExercise ? false : !hasAttempt
                }
                hitSlop={6}
                disabled={
                  checked && isCorrect && isLastExercise ? false : !hasAttempt
                }
                onPress={
                  checked && isCorrect && isLastExercise
                    ? restartTraining
                    : resetAnswer
                }
                style={[
                  styles.actionButton,
                  styles.secondaryButton,
                  !(checked && isCorrect && isLastExercise) &&
                    !hasAttempt &&
                    styles.disabledButton,
                ]}
              >
                <AppText script={uiScript}
                  variant="button"
                  tone="muted"
                  style={styles.secondaryText}
                >
                  {checked && isCorrect && isLastExercise
                    ? l("ui.restartTraining")
                    : l("ui.retry")}
                </AppText>
              </Pressable>

              {!checked ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={l("ui.validateLabel")}
                  accessibilityState={{
                    disabled:
                      !canCheck || !hasCompletedCurrentAudio || !isHydrated,
                  }}
                  aria-disabled={
                    !canCheck || !hasCompletedCurrentAudio || !isHydrated
                  }
                  hitSlop={6}
                  disabled={
                    !canCheck || !hasCompletedCurrentAudio || !isHydrated
                  }
                  onPress={handleValidate}
                  style={[
                    styles.actionButton,
                    (!canCheck || !hasCompletedCurrentAudio || !isHydrated) &&
                      styles.disabledButton,
                  ]}
                >
                  <AppText script={uiScript}
                    variant="button"
                    tone="strong"
                    style={styles.actionText}
                  >
                    {l("ui.validate")}
                  </AppText>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    !isCorrect
                      ? l("ui.blockedNext")
                      : isLastExercise
                        ? isTrainingComplete
                          ? l("ui.openSummary")
                          : l("ui.requireFive")
                        : l("ui.nextQuestion")
                  }
                  accessibilityState={{
                    disabled: !isCorrect || (isLastExercise && !isTrainingComplete),
                  }}
                  aria-disabled={!isCorrect || (isLastExercise && !isTrainingComplete)}
                  hitSlop={6}
                  disabled={!isCorrect || (isLastExercise && !isTrainingComplete)}
                  onPress={
                    isLastExercise
                      ? () => setIsTrainingSummaryOpen(true)
                      : goNext
                  }
                  style={[
                    styles.actionButton,
                    (!isCorrect || (isLastExercise && !isTrainingComplete)) &&
                      styles.disabledButton,
                  ]}
                >
                  <AppText script={uiScript}
                    variant="button"
                    tone="strong"
                    style={styles.actionText}
                  >
                    {l(isLastExercise ? "ui.summary" : "ui.next")}
                  </AppText>
                </Pressable>
              )}
            </View>
            {!isHydrated && (
              <AppText script={uiScript}
                accessibilityLiveRegion="polite"
                variant="caption"
                tone="soft"
                align="center"
                style={styles.hydrationMessage}
              >
                {l("ui.sync")}
              </AppText>
            )}

            {!!dailyMessage && (
              <View style={styles.streakToast}>
                <Ionicons name="flame" size={16} color={COLORS.green} />
                <AppText script={uiScript}
                  variant="caption"
                  tone="accent"
                  style={styles.streakToastText}
                >
                  {l(dailyMessage === "completed_with_freeze" ? "ui.streakFreeze" : dailyMessage === "restarted" ? "ui.streakRestart" : "ui.streakDone")}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.footerNote}>
            <AppText script={uiScript}
              variant="sectionLabel"
              tone="brand"
              style={styles.footerTitle}
            >
              {l("ui.objective")}
            </AppText>
            <AppText script={uiScript} variant="body" tone="muted" style={styles.footerText}>
              {l("ui.objectiveDescription")}
            </AppText>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
      <ListenTrainingCompletionModal
        trainingKind={trainingKind}
        visible={isTrainingSummaryOpen}
        streakOutcome={trainingStreakOutcome}
        onClose={() => setIsTrainingSummaryOpen(false)}
        onRestart={restartTraining}
        onNext={goToNextExercise}
      />
    </ImageBackground>
  );
}

function ChoiceButton({
  label,
  active,
  locked,
  correct,
  wrong,
  onPress,
}: {
  label: string;
  active: boolean;
  locked: boolean;
  correct: boolean;
  wrong: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation("listening");
  const stateLabel = t(
    correct ? "ui.choiceCorrect" : wrong ? "ui.choiceWrong" : active ? "ui.choiceSelected" : "ui.choiceUnselected",
  );

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label}. ${stateLabel}`}
      accessibilityState={{
        checked: active,
        selected: active,
        disabled: locked,
      }}
      aria-checked={active}
      aria-selected={active}
      aria-disabled={locked}
      hitSlop={6}
      disabled={locked}
      onPress={onPress}
      style={[
        styles.choice,
        active && styles.choiceActive,
        correct && styles.choiceCorrect,
        wrong && styles.choiceWrong,
      ]}
    >
      <AppText
        variant="koreanSecondary"
        tone="strong"
        script="korean"
        accessibilityLanguage="ko"
        align="center"
        style={styles.optionText}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.66)",
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
  kicker: {
    color: COLORS.red,
  },
  headerTitle: {
    color: COLORS.text,
    marginTop: 3,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    paddingTop: 14,
  },
  modePill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LISTEN_ACCENT.iconBorder,
    backgroundColor: LISTEN_ACCENT.iconSurface,
    marginBottom: 22,
  },
  modeText: {
    color: COLORS.text,
  },
  modeSwitcherWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 28,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  modeCenterPill: {
    flex: 1,
    minWidth: 0,
    maxWidth: 158,
    minHeight: 54,
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(14,17,28,0.58)",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  modeCenterMini: {
    color: COLORS.faint,
    marginBottom: 1,
  },
  modeCenterLabel: {
    color: COLORS.text,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  dotButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  dotActive: {
    backgroundColor: LISTEN_ACCENT.base,
    transform: [{ scale: 1.2 }],
  },
  card: {
    borderRadius: 32,
    paddingTop: 24,
    paddingBottom: 26,
    paddingLeft: 22,
    paddingRight: 28,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTopTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  theme: {
    color: LISTEN_ACCENT.base,
  },
  title: {
    color: COLORS.text,
    marginTop: 7,
  },
  counter: {
    color: COLORS.faint,
    paddingTop: 4,
    minWidth: 48,
    textAlign: "right",
  },
  skillRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skillPill: {
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: LISTEN_ACCENT.surface,
    overflow: "hidden",
  },
  skillText: {
    color: COLORS.muted,
  },
  instruction: {
    color: COLORS.muted,
    marginTop: 18,
  },
  listenButton: {
    marginTop: 22,
    minHeight: 56,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: LISTEN_ACCENT.surface,
    borderWidth: 1,
    borderColor: LISTEN_ACCENT.selectedBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  listenText: {
    color: COLORS.text,
  },
  audioHint: {
    color: COLORS.faint,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  audioError: {
    alignItems: "center",
    backgroundColor: "rgba(255,79,102,0.12)",
    borderColor: "rgba(255,79,102,0.42)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginBottom: 18,
    padding: 14,
  },
  audioErrorText: {
    color: COLORS.text,
    textAlign: "center",
  },
  audioRetryButton: {
    alignItems: "center",
    backgroundColor: COLORS.red,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 18,
  },
  choiceStack: {
    gap: 12,
  },
  choice: {
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.cardSoft,
    justifyContent: "center",
  },
  choiceActive: {
    borderColor: LISTEN_ACCENT.base,
    backgroundColor: LISTEN_ACCENT.surface,
  },
  choiceCorrect: {
    borderColor: COLORS.green,
    backgroundColor: "rgba(141,240,181,0.14)",
  },
  choiceWrong: {
    borderColor: COLORS.red,
    backgroundColor: "rgba(255,79,102,0.22)",
  },
  optionText: {
    color: COLORS.text,
    textAlign: "center",
  },
  gapSentence: {
    minHeight: 76,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  koreanInline: {
    color: COLORS.text,
  },
  blank: {
    width: 82,
    height: 3,
    borderRadius: 3,
    backgroundColor: LISTEN_ACCENT.base,
    marginHorizontal: 8,
    marginTop: 18,
  },
  sentenceBox: {
    minHeight: 88,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  placeholder: {
    color: COLORS.faint,
  },
  wordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  wordOption: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.cardSoft,
  },
  wordSelected: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: LISTEN_ACCENT.surface,
    borderWidth: 1,
    borderColor: LISTEN_ACCENT.base,
  },
  wordText: {
    color: COLORS.text,
  },
  disabledOption: {
    opacity: 0.26,
  },
  disabledText: {
    color: COLORS.faint,
  },
  feedback: {
    marginTop: 14,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
  },
  good: {
    backgroundColor: "rgba(141,240,181,0.12)",
    borderColor: "rgba(141,240,181,0.42)",
  },
  bad: {
    backgroundColor: "rgba(255,79,102,0.12)",
    borderColor: "rgba(255,79,102,0.45)",
  },
  feedbackTitle: {
    color: COLORS.text,
    marginBottom: 4,
  },
  teacherFeedbackText: {
    color: COLORS.text,
    marginBottom: 4,
  },
  expectedLabel: {
    color: COLORS.text,
    marginTop: 6,
    marginBottom: 3,
  },
  expectedText: {
    color: COLORS.green,
    marginBottom: 6,
  },
  feedbackText: {
    color: COLORS.muted,
  },
  streakToast: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(141,240,181,0.12)",
    borderColor: "rgba(141,240,181,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  streakToastText: {
    color: COLORS.green,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: LISTEN_ACCENT.base,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  actionText: {
    color: COLORS.bg,
  },
  secondaryText: {
    color: COLORS.muted,
  },
  disabledButton: {
    opacity: 0.35,
  },
  hydrationMessage: {
    color: COLORS.faint,
    marginTop: 12,
    textAlign: "center",
  },
  footerNote: {
    marginTop: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.24)",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  footerTitle: {
    color: LISTEN_ACCENT.base,
    marginBottom: 8,
  },
  footerText: {
    color: COLORS.muted,
  },
});
