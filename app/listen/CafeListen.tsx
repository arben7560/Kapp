import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AppText } from "../../components/app-text";
import CafeAvatar from "../../components/ai/CafeAvatar";
import {
  getImmersiveBottomPadding,
  IMMERSIVE_CONTENT_MAX_WIDTH,
  IMMERSIVE_MIN_TOUCH_TARGET,
} from "../../constants/immersive-layout";
import { useStore } from "../../_store";
import { CAFE_SESSION } from "../../data/listen/cafe";
import { useVocAudio } from "../../hooks/useVocAudio";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { isCorrect } from "../../lib/answerCheck";
import {
  createCafeListenProgress,
  recordCafeListenAnswer,
  startCafeListenRemediation,
} from "../../lib/cafeListenProgress";
import { shuffleArray } from "../../lib/choiceOrder";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { canValidateListenAnswer } from "../../lib/listenValidation";
import { buildProgressId } from "../../lib/progressIds";

const BG0 = "#060816";
const BG1 = "#090D1D";
const BG2 = "#0B1123";

const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.74)";
const SOFT = "rgba(255,255,255,0.56)";

const CARD = "rgba(255,255,255,0.06)";
const CARD_SOFT = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.10)";
const LINE_STRONG = "rgba(255,255,255,0.16)";

const CYAN = "#22D3EE";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PURPLE = "#8B5CF6";
const PURPLE_BG = "rgba(139,92,246,0.14)";
const PINK = "#F472B6";
const PINK_BG = "rgba(244,114,182,0.12)";
const GREEN = "rgba(34,197,94,0.45)";
const GREEN_BG = "rgba(34,197,94,0.12)";
const RED = "rgba(239,68,68,0.45)";
const RED_BG = "rgba(239,68,68,0.12)";

const CAFE_SESSION_BY_ID = new Map(
  CAFE_SESSION.map((exercise) => [exercise.id, exercise]),
);

function SmallPill({
  label,
  active = false,
  tone = "cyan",
}: {
  label: string;
  active?: boolean;
  tone?: "cyan" | "purple" | "pink";
}) {
  const palette =
    tone === "purple"
      ? {
          borderColor: active ? PURPLE : "rgba(255,255,255,0.08)",
          backgroundColor: active ? PURPLE_BG : "rgba(255,255,255,0.04)",
        }
      : tone === "pink"
        ? {
            borderColor: active ? PINK : "rgba(255,255,255,0.08)",
            backgroundColor: active ? PINK_BG : "rgba(255,255,255,0.04)",
          }
        : {
            borderColor: active ? CYAN : "rgba(255,255,255,0.08)",
            backgroundColor: active ? CYAN_BG : "rgba(255,255,255,0.04)",
          };

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        ...palette,
      }}
    >
      <AppText variant="label"
        style={{
          color: TXT,
        }}
      >
        {label}
      </AppText>
    </View>
  );
}

function ChoiceButton({
  label,
  onPress,
  disabled,
  state = "idle",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  state?: "idle" | "correct" | "wrong";
}) {
  const style =
    state === "correct"
      ? { borderColor: GREEN, backgroundColor: GREEN_BG }
      : state === "wrong"
        ? { borderColor: RED, backgroundColor: RED_BG }
        : {
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.04)",
          };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label}. ${
        state === "correct"
          ? "Bonne reponse"
          : state === "wrong"
            ? "Reponse incorrecte"
            : "Choix disponible"
      }`}
      accessibilityState={{ disabled: !!disabled, checked: state === "correct" }}
      aria-disabled={!!disabled}
      aria-checked={state === "correct"}
      hitSlop={6}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.94 : 1,
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 15,
        ...style,
      })}
    >
      <AppText variant="bodyStrong"
        style={{
          color: TXT,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  tone = "ghost",
}: {
  label: string;
  onPress: () => void;
  tone?: "ghost" | "cyan" | "purple";
}) {
  const palette =
    tone === "cyan"
      ? { borderColor: CYAN, backgroundColor: CYAN_BG }
      : tone === "purple"
        ? { borderColor: PURPLE, backgroundColor: PURPLE_BG }
        : {
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.04)",
          };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.94 : 1,
        minHeight: 48,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        ...palette,
      })}
    >
      <AppText variant="button" style={{ color: TXT }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function CafeListenScreen() {
  const { complete, isHydrated } = useStore();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout({ maxWidth: IMMERSIVE_CONTENT_MAX_WIDTH });
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const completionAttemptedRef = useRef(false);
  const validationLockRef = useRef(false);
  const [didAwardXp, setDidAwardXp] = useState<boolean | null>(null);
  const [listenProgress, setListenProgress] = useState(() =>
    createCafeListenProgress(CAFE_SESSION.map(({ id }) => id)),
  );
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [missingAudioError, setMissingAudioError] = useState(false);
  const [completedAudioId, setCompletedAudioId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<null | { ok: boolean }>(null);
  const {
    playAudio: playAssetAudio,
    stopAudio,
    error: playbackError,
    clearError: clearAudioError,
  } = useVocAudio(setActiveAudioId);

  const exerciseId =
    listenProgress.status === "question"
      ? listenProgress.queue[listenProgress.questionIndex]
      : undefined;
  const exercise = exerciseId
    ? CAFE_SESSION_BY_ID.get(exerciseId)
    : undefined;
  const showingSummary = listenProgress.status !== "question";
  const hasAudioError = missingAudioError || !!playbackError;
  const speaking = activeAudioId === exercise?.id;
  const hasCompletedAudio = completedAudioId === exercise?.id;
  const displayedAnswers = useMemo(
    () => shuffleArray(exercise?.answers ?? []),
    [exercise],
  );

  const progressLabel = useMemo(() => {
    if (!exercise) {
      return listenProgress.status === "complete"
        ? "Terminé"
        : "Bilan";
    }

    const prefix =
      listenProgress.remediationRound === 0
        ? "Premier passage"
        : `Correction ${listenProgress.remediationRound}`;

    return `${prefix} · ${listenProgress.questionIndex + 1}/${listenProgress.queue.length}`;
  }, [exercise, listenProgress]);

  const playAudio = useCallback(() => {
    if (!exercise?.audioSource) {
      setMissingAudioError(true);
      return;
    }

    setMissingAudioError(false);
    clearAudioError();
    void playAssetAudio(exercise.audioSource, exercise.id, {
      onCompleted: () => setCompletedAudioId(exercise.id),
    });
  }, [clearAudioError, exercise, playAssetAudio]);

  useEffect(() => {
    if (
      listenProgress.status !== "complete" ||
      completionAttemptedRef.current ||
      !isHydrated
    ) {
      return;
    }

    completionAttemptedRef.current = true;
    const awarded = complete(buildProgressId("listen", "cafe_session"));
    setDidAwardXp(awarded);
    void completeDailyActivity("listen_exercise");
  }, [complete, isHydrated, listenProgress.status]);

  useEffect(() => {
    if (!exercise) return;

    const id = setTimeout(() => {
      playAudio();
    }, 180);

    return () => clearTimeout(id);
  }, [exercise, playAudio]);

  useEffect(() => {
    return stopAudio;
  }, [stopAudio]);

  function animateToNext(update: () => void) {
    stopAudio();

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      update();
      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }

  function submitAnswer(answer: string) {
    if (!exercise || !canValidateListenAnswer({
      hasAnswer: true,
      hasCompletedRequiredMedia: hasCompletedAudio,
      isHydrated,
      isLocked: !!result || validationLockRef.current,
    })) {
      return;
    }

    validationLockRef.current = true;
    const ok = isCorrect(answer, exercise.correct);
    setSelectedAnswer(answer);
    setResult({ ok });
  }

  function nextExercise() {
    if (!exercise || !result) return;

    animateToNext(() => {
      setMissingAudioError(false);
      clearAudioError();
      setListenProgress((current) =>
        recordCafeListenAnswer(current, exercise.id, result.ok),
      );
      setSelectedAnswer(null);
      setResult(null);
      validationLockRef.current = false;
    });
  }

  function restart() {
    animateToNext(() => {
      setMissingAudioError(false);
      clearAudioError();
      setListenProgress(
        createCafeListenProgress(CAFE_SESSION.map(({ id }) => id)),
      );
      setSelectedAnswer(null);
      setResult(null);
      setDidAwardXp(null);
      validationLockRef.current = false;
      completionAttemptedRef.current = false;
    });
  }

  function replayMistakes() {
    if (
      listenProgress.status !== "round-summary" ||
      listenProgress.incorrectIds.length === 0
    ) {
      return;
    }

    animateToNext(() => {
      setMissingAudioError(false);
      clearAudioError();
      setListenProgress((current) => startCafeListenRemediation(current));
      setSelectedAnswer(null);
      setResult(null);
      validationLockRef.current = false;
    });
  }

  function getChoiceState(choice: string): "idle" | "correct" | "wrong" {
    if (!exercise || !result) return "idle";

    if (isCorrect(choice, exercise.correct)) {
      return "correct";
    }

    if (selectedAnswer === choice) {
      return "wrong";
    }

    return "idle";
  }

  if (showingSummary) {
    const remainingCount = listenProgress.incorrectIds.length;
    const completed = listenProgress.status === "complete";

    return (
      <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: responsive.horizontalPadding,
              paddingTop: 24,
              paddingBottom: getImmersiveBottomPadding(
                insets.bottom,
                28,
                20,
              ),
            }}
          >
            <View
            style={{
              width: "100%",
              maxWidth: responsive.maxWidth,
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: responsive.maxWidth,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: LINE,
                backgroundColor: CARD,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(139,92,246,0.12)",
                  "rgba(34,211,238,0.06)",
                  "rgba(255,255,255,0.02)",
                ]}
                style={{ padding: 20 }}
              >
                <AppText variant="screenTitle"
                  style={{
                    color: TXT,
                    textAlign: "center",
                  }}
                >
                  {completed
                    ? "Session validée 🎉"
                    : listenProgress.remediationRound === 0
                      ? "Premier passage terminé"
                      : `Correction ${listenProgress.remediationRound} terminée`}
                </AppText>

                <AppText variant="bodySecondary"
                  style={{
                    color: MUTED,
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  {completed
                    ? "Toutes les questions ont été réussies."
                    : "On reprend uniquement les questions à corriger."}
                </AppText>

                <View style={{ height: 16 }} />

                <View
                  style={{
                    alignSelf: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: CYAN,
                    backgroundColor: CYAN_BG,
                  }}
                >
                  <AppText variant="bodyStrong"
                    style={{
                      color: TXT,
                    }}
                  >
                    Premier score : {listenProgress.firstPassScore ?? 0} /{" "}
                    {listenProgress.totalQuestions}
                  </AppText>
                </View>

                <View style={{ height: 12 }} />

                <AppText variant="bodySecondary"
                  style={{
                    color: MUTED,
                    textAlign: "center",
                  }}
                >
                  Questions restant à corriger : {remainingCount}
                </AppText>

                {completed && (
                  <AppText
                    variant="bodyStrong"
                    style={{
                      color: didAwardXp ? CYAN : MUTED,
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    {didAwardXp === null
                      ? "Enregistrement de la progression…"
                      : didAwardXp
                        ? "+40 XP · progression enregistrée"
                        : "Progression déjà enregistrée"}
                  </AppText>
                )}

                <View style={{ height: 18 }} />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <ActionButton
                    label="Recommencer la leçon"
                    onPress={restart}
                    tone="cyan"
                  />
                  <ActionButton
                    label="Retour à l’écoute"
                    onPress={() => router.back()}
                    tone="ghost"
                  />
                </View>

                {!completed && remainingCount > 0 && (
                  <>
                    <View style={{ height: 10 }} />
                    <ActionButton
                      label={`Corriger ${remainingCount} question${
                        remainingCount > 1 ? "s" : ""
                      }`}
                      onPress={replayMistakes}
                      tone="purple"
                    />
                  </>
                )}
              </LinearGradient>
            </View>
          </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!exercise) {
    return null;
  }

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: responsive.horizontalPadding,
            paddingTop: 6,
            paddingBottom: getImmersiveBottomPadding(insets.bottom, 28, 20),
          }}
        >
          <View style={{ width: "100%", maxWidth: responsive.maxWidth }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitter la scène"
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              alignSelf: "flex-start",
              minHeight: IMMERSIVE_MIN_TOUCH_TARGET,
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <AppText variant="button" style={{ color: MUTED }}>← Quitter la scène</AppText>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <SmallPill label={progressLabel} active tone="purple" />
            <AppText variant="label"
              style={{
                color: MUTED,
              }}
            >
              {exercise.place}
            </AppText>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <SmallPill
              label="Accueil"
              active={exercise.category === "Accueil"}
              tone="cyan"
            />
            <SmallPill
              label="Commande"
              active={exercise.category === "Commande"}
              tone="cyan"
            />
            <SmallPill
              label="Nom"
              active={exercise.category === "Nom"}
              tone="cyan"
            />
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: CARD,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={[
                "rgba(26,22,56,0.96)",
                "rgba(10,24,42,0.94)",
                "rgba(8,18,30,0.98)",
              ]}
              style={{
                padding: 16,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: 180,
                  height: 180,
                  borderRadius: 999,
                  backgroundColor: "rgba(139,92,246,0.10)",
                  top: -44,
                  left: -40,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  width: 170,
                  height: 170,
                  borderRadius: 999,
                  backgroundColor: "rgba(34,211,238,0.08)",
                  bottom: -56,
                  right: -44,
                }}
              />

              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 176,
                    height: 192,
                    borderRadius: 22,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.10)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CafeAvatar speaking={speaking} compact={false} immersive />
                  </View>
                </View>

                <AppText variant="sectionTitle"
                  style={{
                    color: TXT,
                    marginTop: 14,
                  }}
                >
                  {exercise.speaker}
                </AppText>

                <AppText variant="bodySecondary"
                  style={{
                    color: MUTED,
                    marginTop: 4,
                  }}
                >
                  {exercise.place}
                </AppText>
              </View>

              <View style={{ height: 14 }} />

              <View
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: speaking ? CYAN : LINE,
                  backgroundColor: "rgba(8,10,18,0.44)",
                  padding: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <AppText variant="sectionLabel"
                    style={{
                      color: SOFT,
                    }}
                  >
                    {exercise.speaker.toUpperCase()}
                  </AppText>

                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        exercise.category === "Accueil"
                          ? CYAN
                          : exercise.category === "Commande"
                            ? PURPLE
                            : PINK,
                      backgroundColor:
                        exercise.category === "Accueil"
                          ? CYAN_BG
                          : exercise.category === "Commande"
                            ? PURPLE_BG
                            : PINK_BG,
                    }}
                  >
                    <AppText variant="caption"
                      style={{
                        color: TXT,
                      }}
                    >
                      {exercise.category}
                    </AppText>
                  </View>
                </View>

                <AppText variant="label"
                  style={{
                    color: "rgba(255,255,255,0.48)",
                    marginBottom: 6,
                  }}
                >
                  Transcription
                </AppText>

                <AppText variant="bodySecondary"
                  style={{
                    color: MUTED,
                  }}
                >
                  Masquée jusqu’à ta réponse.
                </AppText>

                <View style={{ height: 12 }} />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    speaking ? "Lecture audio en cours" : "Reecouter l'audio"
                  }
                  accessibilityState={{ disabled: speaking }}
                  aria-disabled={speaking}
                  hitSlop={6}
                  disabled={speaking}
                  onPress={playAudio}
                  style={({ pressed }) => ({
                    opacity: speaking ? 0.9 : pressed ? 0.94 : 1,
                    alignSelf: "flex-start",
                    minHeight: IMMERSIVE_MIN_TOUCH_TARGET,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: speaking ? CYAN : "rgba(255,255,255,0.08)",
                    backgroundColor: speaking
                      ? CYAN_BG
                      : "rgba(255,255,255,0.04)",
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <AppText variant="button"
                    style={{
                      color: TXT,
                    }}
                  >
                    {speaking ? "🔊 Lecture..." : "🔊 Réécouter"}
                  </AppText>
                </Pressable>

                {hasAudioError ? (
                  <View
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    style={{
                      marginTop: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: RED,
                      backgroundColor: RED_BG,
                      padding: 12,
                    }}
                  >
                    <AppText
                      variant="bodySecondary"
                      style={{ color: TXT, marginBottom: 8 }}
                    >
                      Impossible de lire l’audio. Vérifie le volume, puis
                      réessaie.
                    </AppText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Réessayer la lecture audio"
                      hitSlop={6}
                      onPress={playAudio}
                      style={{
                        alignSelf: "flex-start",
                        minHeight: IMMERSIVE_MIN_TOUCH_TARGET,
                        borderRadius: 12,
                        backgroundColor: PURPLE_BG,
                        borderColor: PURPLE,
                        borderWidth: 1,
                        justifyContent: "center",
                        paddingHorizontal: 14,
                      }}
                    >
                      <AppText variant="button" style={{ color: TXT }}>
                        Réessayer
                      </AppText>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={{ height: 18 }} />

          <Animated.View
            style={{
              opacity: fadeAnim,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: CARD_SOFT,
              padding: 16,
            }}
          >
            <AppText variant="sectionTitle"
              style={{
                color: TXT,
              }}
            >
              {exercise.question}
            </AppText>

            <AppText variant="body"
              style={{
                color: MUTED,
                marginTop: 8,
                marginBottom: 14,
              }}
            >
              Choisis la réponse qui te semble correcte pour cette phrase.
            </AppText>

            <View style={{ gap: 12 }}>
              {displayedAnswers.map((answer) => (
                <ChoiceButton
                  key={answer}
                  label={answer}
                  disabled={
                    !!result || !hasCompletedAudio || !isHydrated
                  }
                  state={getChoiceState(answer)}
                  onPress={() => submitAnswer(answer)}
                />
              ))}
            </View>

            {!hasCompletedAudio && !hasAudioError ? (
              <AppText
                accessibilityLiveRegion="polite"
                variant="caption"
                style={{
                  color: SOFT,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Écoute l’audio jusqu’au bout pour pouvoir répondre.
              </AppText>
            ) : null}

            {!isHydrated && (
              <AppText
                accessibilityLiveRegion="polite"
                variant="caption"
                style={{
                  color: SOFT,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Synchronisation de ta progression… Tu peux déjà écouter.
              </AppText>
            )}

            {result && (
              <View
                accessibilityLiveRegion="polite"
                accessible
                accessibilityRole="alert"
                accessibilityLabel={`${result.ok ? "Correct" : "Pas tout a fait"}. Phrase entendue : ${
                  exercise.sourceText
                }. Reponse attendue : ${
                  Array.isArray(exercise.correct)
                    ? exercise.correct.join(" / ")
                    : exercise.correct
                }. ${!result.ok && exercise.hint ? exercise.hint : ""}`}
                style={{
                  marginTop: 16,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: result.ok ? GREEN : RED,
                  backgroundColor: result.ok ? GREEN_BG : RED_BG,
                  padding: 14,
                }}
              >
                <AppText variant="bodyStrong"
                  style={{
                    color: TXT,
                  }}
                >
                  {result.ok ? "✅ Correct" : "❌ Pas tout à fait"}
                </AppText>

                <AppText variant="label"
                  style={{
                    color: TXT,
                    marginTop: 12,
                  }}
                >
                  Phrase entendue
                </AppText>
                <AppText
                  variant="koreanSecondary"
                  script="korean"
                  accessibilityLanguage="ko"
                  style={{
                    color: TXT,
                    marginTop: 4,
                  }}
                >
                  {exercise.sourceText}
                </AppText>

                <AppText variant="label"
                  style={{
                    color: TXT,
                    marginTop: 12,
                  }}
                >
                  Sens naturel
                </AppText>
                <AppText variant="bodySecondary"
                  style={{
                    color: MUTED,
                    marginTop: 4,
                  }}
                >
                  {exercise.translation}
                </AppText>

                <AppText variant="label"
                  style={{
                    color: TXT,
                    marginTop: 12,
                  }}
                >
                  Réponse attendue
                </AppText>
                <AppText variant="bodySecondary"
                  style={{
                    color: MUTED,
                    marginTop: 4,
                  }}
                >
                  {Array.isArray(exercise.correct)
                    ? exercise.correct.join(" / ")
                    : exercise.correct}
                </AppText>

                {!result.ok && !!exercise.hint && (
                  <>
                    <AppText variant="label"
                      style={{
                        color: TXT,
                        marginTop: 12,
                      }}
                    >
                      Explication
                    </AppText>
                    <AppText variant="bodySecondary"
                      style={{
                        color: MUTED,
                        marginTop: 4,
                      }}
                    >
                      {exercise.hint}
                    </AppText>
                  </>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  <ActionButton
                    label="🔁 Réécouter"
                    onPress={playAudio}
                    tone="purple"
                  />
                  <ActionButton
                    label={
                      listenProgress.questionIndex ===
                      listenProgress.queue.length - 1
                        ? "Voir le bilan"
                        : "Suivant"
                    }
                    onPress={nextExercise}
                    tone="cyan"
                  />
                </View>
              </View>
            )}
          </Animated.View>

          <View style={{ height: 14 }} />

          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: LINE_STRONG,
              backgroundColor: "rgba(255,255,255,0.03)",
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <AppText variant="bodyStrong"
              style={{
                color: SOFT,
                textAlign: "center",
              }}
            >
              Astuce : écoute d’abord la phrase globalement, puis associe le bon
              sens.
            </AppText>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
