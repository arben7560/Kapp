import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { AppBackButton } from "../../components/ui/app-back-button";
import { HubModuleAccents } from "../../constants/theme";
import {
  EXERCISES_BY_KIND,
  TRAINING_ORDER,
  type ExerciseKind,
} from "../../data/listen/activeExercises";
import { useVocAudio } from "../../hooks/useVocAudio";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { shuffleListenChoices } from "../../lib/listenExerciseChoices";
import { canValidateListenAnswer } from "../../lib/listenValidation";
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
  "metro-order-01": require("../../assets/audio/listen/jjuk-ijjogeuro-gaseyo.mp3"),
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

const KIND_LABEL: Record<ExerciseKind, { mini: string; skill: string }> = {
  dictation: { mini: "Orthographe", skill: "Écoute + Hangul" },
  situation: { mini: "Situation", skill: "Compréhension" },
  gap: { mini: "Mot manquant", skill: "Vocabulaire" },
  order: { mini: "Ordre", skill: "Syntaxe" },
  reaction: { mini: "Réaction", skill: "Conversation" },
};

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
  const { complete, isHydrated, setTrack } = useStore();
  const scrollRef = useRef<ScrollView | null>(null);
  const validationLockRef = useRef(false);
  const dailyActivityPromiseRef = useRef<ReturnType<
    typeof completeDailyActivity
  > | null>(null);
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
  const meta = KIND_LABEL[trainingKind];
  const audioSource = LISTEN_AUDIO_BY_ID[item.id];
  const hasAttempt =
    item.kind === "order" ? picked.length > 0 : selected !== null;
  const hasPlayedCurrentAudio = !!playedAudioIds[item.id];
  const hasCompletedCurrentAudio = !!completedAudioIds[item.id];
  const isPlayingCurrentAudio = playingAudioId === item.id;
  const isLastExercise = exerciseIndex === exercises.length - 1;

  useEffect(() => {
    const requestKey = `${requestedTraining ?? ""}:${requestedExercise ?? ""}`;
    if (!requestedTraining || requestKey === resumeRequestKeyRef.current) return;

    const nextPosition = getRequestedListenPosition(
      requestedTraining,
      requestedExercise,
    );
    resumeRequestKeyRef.current = requestKey;
    validationLockRef.current = false;
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

  const restartTraining = () => {
    clearAudioError();
    setExerciseIndex(0);
    resetAnswer();
  };

  const changeTraining = (direction: -1 | 1) => {
    const nextTrainingIndex =
      (trainingIndex + direction + TRAINING_ORDER.length) %
      TRAINING_ORDER.length;

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
    const expectedAnswer = getExpectedAnswer();
    const dailyActivityPromise =
      dailyActivityPromiseRef.current ??
      completeDailyActivity("listen_exercise");
    dailyActivityPromiseRef.current = dailyActivityPromise;

    setChecked(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);

    AccessibilityInfo.announceForAccessibility(
      correct
        ? `Correct. Réponse attendue : ${expectedAnswer}.`
        : "À revoir. Ce n’est pas la bonne réponse. Réessaie.",
    );

    if (correct) {
      void Promise.all([
        complete(buildProgressId("listen", item.id)),
        dailyActivityPromise,
      ]).then(([, state]) => {
        setDailyMessage(
          state.lastCompletionResult === "completed_with_freeze"
            ? "Protection de série utilisée. Série conservée."
            : "Série conservée.",
        );
        setTimeout(
          () => scrollRef.current?.scrollToEnd({ animated: true }),
          80,
        );
        setTimeout(() => setDailyMessage(null), 2200);
      });
    } else {
      void dailyActivityPromise;
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
              <AppText variant="body" tone="soft" style={styles.placeholder}>
                Construis la phrase ici
              </AppText>
            ) : (
              picked.map((wordIndex) => (
                <Pressable
                  key={wordIndex}
                  accessibilityRole="button"
                  accessibilityLabel={`Retirer ${item.words[wordIndex]} de la phrase`}
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
                  accessibilityLabel={`Ajouter ${word} a la phrase`}
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
        <View style={styles.header}>
          <AppBackButton />
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.modePill}>
            <Ionicons
              name="volume-high"
              size={16}
              color={LISTEN_ACCENT.base}
            />
            <AppText variant="label" tone="strong" style={styles.modeText}>
              ÉCOUTE
            </AppText>
          </View>

          <View style={styles.modeSwitcherWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entraînement précédent"
              hitSlop={8}
              onPress={() => changeTraining(-1)}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.text} />
            </Pressable>

            <View style={styles.modeCenterPill}>
              <AppText
                variant="label"
                tone="soft"
                style={styles.modeCenterMini}
              >
                ENTRAÎNEMENT
              </AppText>
              <AppText
                variant="bodyStrong"
                tone="strong"
                style={styles.modeCenterLabel}
              >
                {meta.mini}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entraînement suivant"
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
                accessibilityLabel={`Question ${currentExerciseIndex + 1} sur ${exercises.length}`}
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
                <AppText
                  variant="sectionLabel"
                  tone="brand"
                  style={styles.theme}
                >
                  {item.theme}
                </AppText>
                <AppText
                  variant="sectionTitle"
                  tone="strong"
                  style={styles.title}
                >
                  {item.title}
                </AppText>
              </View>
              <AppText
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
              <AppText variant="label" tone="strong" style={styles.skillPill}>
                {meta.mini}
              </AppText>
              <AppText variant="caption" tone="muted" style={styles.skillText}>
                {meta.skill}
              </AppText>
            </View>

            <AppText variant="body" tone="muted" style={styles.instruction}>
              {item.instruction}
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${hasPlayedCurrentAudio ? "Réécouter" : "Écouter"} l’audio de la question`}
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
              <AppText variant="button" tone="strong" style={styles.listenText}>
                {hasPlayedCurrentAudio ? "Réécouter" : "Écouter"}
              </AppText>
            </Pressable>

            <AppText
              variant="caption"
              tone="soft"
              align="center"
              style={styles.audioHint}
            >
              {audioSource
                ? isPlayingCurrentAudio
                  ? "Lecture en cours"
                  : hasCompletedCurrentAudio
                    ? ""
                    : hasPlayedCurrentAudio
                      ? "Lecture interrompue · réessaie"
                      : ""
                : "Audio indisponible"}
            </AppText>

            {!!audioPlaybackError && (
              <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.audioError}
              >
                <AppText
                  variant="body"
                  tone="strong"
                  style={styles.audioErrorText}
                >
                  Impossible de lire l’audio. Vérifie le volume, puis réessaie.
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Réessayer la lecture audio"
                  hitSlop={6}
                  onPress={playAudio}
                  style={styles.audioRetryButton}
                >
                  <AppText variant="button" tone="strong">
                    Réessayer
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
                    ? `Correct. ${
                        item.kind === "situation" || item.kind === "reaction"
                          ? `Phrase entendue : ${item.sourceText}. `
                          : ""
                      }Réponse attendue : ${getExpectedAnswer()}. ${item.explanation}`
                    : "À revoir. Ce n’est pas la bonne réponse. Réessaie."
                }
                style={[styles.feedback, isCorrect ? styles.good : styles.bad]}
              >
                <AppText
                  variant="bodyStrong"
                  tone="strong"
                  style={styles.feedbackTitle}
                >
                  {isCorrect ? "Correct" : "À revoir"}
                </AppText>

                {isCorrect ? (
                  <>
                    {(item.kind === "situation" ||
                      item.kind === "reaction") && (
                      <>
                        <AppText
                          variant="label"
                          tone="strong"
                          style={styles.expectedLabel}
                        >
                          Phrase entendue
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

                    <AppText
                      variant="label"
                      tone="strong"
                      style={styles.expectedLabel}
                    >
                      Réponse attendue
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

                    <AppText
                      variant="body"
                      tone="muted"
                      style={styles.feedbackText}
                    >
                      {item.explanation}
                    </AppText>
                  </>
                ) : (
                  <AppText
                    variant="body"
                    tone="muted"
                    style={styles.feedbackText}
                  >
                    Ce n’est pas la bonne réponse. Réessaie.
                  </AppText>
                )}
              </View>
            )}

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  checked && isCorrect && isLastExercise
                    ? "Recommencer l’entraînement"
                    : "Réessayer cette question"
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
                <AppText
                  variant="button"
                  tone="muted"
                  style={styles.secondaryText}
                >
                  {checked && isCorrect && isLastExercise
                    ? "Recommencer l’entraînement"
                    : "Réessayer"}
                </AppText>
              </Pressable>

              {!checked ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Valider la réponse"
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
                  <AppText
                    variant="button"
                    tone="strong"
                    style={styles.actionText}
                  >
                    Valider
                  </AppText>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    !isCorrect
                      ? "Question suivante indisponible tant que la réponse est incorrecte"
                      : isLastExercise
                        ? "Passer à l’exercice suivant"
                        : "Passer à la question suivante"
                  }
                  accessibilityState={{ disabled: !isCorrect }}
                  aria-disabled={!isCorrect}
                  hitSlop={6}
                  disabled={!isCorrect}
                  onPress={isLastExercise ? goToNextExercise : goNext}
                  style={[
                    styles.actionButton,
                    !isCorrect && styles.disabledButton,
                  ]}
                >
                  <AppText
                    variant="button"
                    tone="strong"
                    style={styles.actionText}
                  >
                    {isLastExercise ? "Exercice suivant" : "Suivant"}
                  </AppText>
                </Pressable>
              )}
            </View>
            {!isHydrated && (
              <AppText
                accessibilityLiveRegion="polite"
                variant="caption"
                tone="soft"
                align="center"
                style={styles.hydrationMessage}
              >
                Synchronisation de ta progression… Tu peux déjà écouter.
              </AppText>
            )}

            {!!dailyMessage && (
              <View style={styles.streakToast}>
                <Ionicons name="flame" size={16} color={COLORS.green} />
                <AppText
                  variant="caption"
                  tone="accent"
                  style={styles.streakToastText}
                >
                  {dailyMessage}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.footerNote}>
            <AppText
              variant="sectionLabel"
              tone="brand"
              style={styles.footerTitle}
            >
              Objectif
            </AppText>
            <AppText variant="body" tone="muted" style={styles.footerText}>
              Comprendre avant de lire. La traduction n’apparaît qu’après
              validation.
            </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  const stateLabel = correct
    ? "Bonne réponse"
    : wrong
      ? "Réponse choisie incorrecte"
      : active
        ? "Selectionnee"
        : "Non sélectionnée";

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
    backgroundColor: "rgba(255,255,255,0.08)",
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
