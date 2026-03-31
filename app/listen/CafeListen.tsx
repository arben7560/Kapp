import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CafeAvatar from "../../components/ai/CafeAvatar";
import { isCorrect } from "../../lib/answerCheck";
import { CAFE_SESSION, type ListenExercise } from "./data/cafe";

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

function shuffleArray<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
      <Text
        style={{
          color: TXT,
          fontSize: 13,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
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
      <Text
        style={{
          color: TXT,
          fontSize: 16,
          lineHeight: 22,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
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
      <Text style={{ color: TXT, fontSize: 14, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CafeListenScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const speechTokenRef = useRef(0);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [session, setSession] = useState<ListenExercise[]>(() =>
    shuffleArray(CAFE_SESSION),
  );
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<null | { ok: boolean }>(null);
  const [score, setScore] = useState(0);
  const [wrongExercises, setWrongExercises] = useState<ListenExercise[]>([]);

  const exercise = session[index];
  const finished = !exercise;

  const progressLabel = useMemo(() => {
    if (!exercise) return "Terminé";
    return `Étape ${index + 1}/${session.length}`;
  }, [exercise, index, session.length]);

  function clearSpeechTimeout() {
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  }

  function stopSpeech() {
    speechTokenRef.current += 1;
    clearSpeechTimeout();
    Speech.stop();
    setSpeaking(false);
  }

  function playAudio() {
    if (!exercise?.audio) return;

    stopSpeech();

    const token = speechTokenRef.current + 1;
    speechTokenRef.current = token;
    setSpeaking(true);

    Speech.speak(exercise.audio, {
      language: "ko-KR",
      rate: 0.9,
      pitch: 1,
      onDone: () => {
        if (speechTokenRef.current !== token) return;
        finishTimeoutRef.current = setTimeout(() => {
          if (speechTokenRef.current !== token) return;
          setSpeaking(false);
        }, 220);
      },
      onStopped: () => {
        if (speechTokenRef.current !== token) return;
        setSpeaking(false);
      },
      onError: () => {
        if (speechTokenRef.current !== token) return;
        setSpeaking(false);
      },
    });
  }

  useEffect(() => {
    if (!exercise) return;

    const id = setTimeout(() => {
      playAudio();
    }, 180);

    return () => clearTimeout(id);
  }, [index, exercise]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  function animateToNext(update: () => void) {
    stopSpeech();

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
    if (!exercise || result) return;

    const ok = isCorrect(answer, exercise.correct);
    setSelectedAnswer(answer);
    setResult({ ok });

    if (ok) {
      setScore((s) => s + 1);
    } else {
      setWrongExercises((prev) => {
        const exists = prev.some((item) => item.id === exercise.id);
        return exists ? prev : [...prev, exercise];
      });
    }
  }

  function nextExercise() {
    animateToNext(() => {
      setSelectedAnswer(null);
      setResult(null);
      setIndex((prev) => prev + 1);
    });
  }

  function restart() {
    animateToNext(() => {
      setSession(shuffleArray(CAFE_SESSION));
      setIndex(0);
      setSelectedAnswer(null);
      setResult(null);
      setScore(0);
      setWrongExercises([]);
    });
  }

  function replayMistakes() {
    if (wrongExercises.length === 0) return;

    animateToNext(() => {
      setSession(shuffleArray(wrongExercises));
      setIndex(0);
      setSelectedAnswer(null);
      setResult(null);
      setScore(0);
      setWrongExercises([]);
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

  if (finished) {
    return (
      <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 18,
            }}
          >
            <View
              style={{
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
                <Text
                  style={{
                    color: TXT,
                    fontSize: 28,
                    fontWeight: "900",
                    textAlign: "center",
                  }}
                >
                  Session terminée 🎉
                </Text>

                <Text
                  style={{
                    color: MUTED,
                    textAlign: "center",
                    marginTop: 10,
                    lineHeight: 22,
                  }}
                >
                  Tu as terminé la scène Café.
                </Text>

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
                  <Text
                    style={{
                      color: TXT,
                      fontWeight: "900",
                      fontSize: 15,
                    }}
                  >
                    Score : {score} / {session.length}
                  </Text>
                </View>

                <View style={{ height: 12 }} />

                <Text
                  style={{
                    color: MUTED,
                    textAlign: "center",
                    lineHeight: 21,
                  }}
                >
                  Erreurs à revoir : {wrongExercises.length}
                </Text>

                <View style={{ height: 18 }} />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <ActionButton
                    label="Recommencer"
                    onPress={restart}
                    tone="cyan"
                  />
                  <ActionButton
                    label="Retour"
                    onPress={() => router.back()}
                    tone="ghost"
                  />
                </View>

                {wrongExercises.length > 0 && (
                  <>
                    <View style={{ height: 10 }} />
                    <ActionButton
                      label="Rejouer les erreurs"
                      onPress={replayMistakes}
                      tone="purple"
                    />
                  </>
                )}
              </LinearGradient>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 6,
            paddingBottom: 28,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 6,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
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
            <Text
              style={{
                color: MUTED,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {exercise.place}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
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
                    width: 162,
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

                <Text
                  style={{
                    color: TXT,
                    fontSize: 20,
                    fontWeight: "900",
                    marginTop: 14,
                  }}
                >
                  {exercise.speaker}
                </Text>

                <Text
                  style={{
                    color: MUTED,
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  {exercise.place}
                </Text>
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
                  <Text
                    style={{
                      color: SOFT,
                      fontSize: 12,
                      fontWeight: "900",
                      letterSpacing: 1,
                    }}
                  >
                    {exercise.speaker.toUpperCase()}
                  </Text>

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
                    <Text
                      style={{
                        color: TXT,
                        fontSize: 12,
                        fontWeight: "800",
                      }}
                    >
                      {exercise.category}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.48)",
                    fontSize: 11,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 6,
                  }}
                >
                  Phrase entendue
                </Text>

                <Text
                  style={{
                    color: TXT,
                    fontSize: 17,
                    lineHeight: 24,
                    fontWeight: "900",
                  }}
                >
                  {exercise.audio}
                </Text>

                <View style={{ height: 12 }} />

                <Pressable
                  disabled={speaking}
                  onPress={playAudio}
                  style={({ pressed }) => ({
                    opacity: speaking ? 0.9 : pressed ? 0.94 : 1,
                    alignSelf: "flex-start",
                    minHeight: 42,
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
                  <Text
                    style={{
                      color: TXT,
                      fontSize: 14,
                      fontWeight: "800",
                    }}
                  >
                    {speaking ? "🔊 Lecture..." : "🔊 Réécouter"}
                  </Text>
                </Pressable>
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
            <Text
              style={{
                color: TXT,
                fontSize: 18,
                lineHeight: 24,
                fontWeight: "900",
              }}
            >
              {exercise.question}
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 15,
                lineHeight: 22,
                marginTop: 8,
                marginBottom: 14,
              }}
            >
              Choisis la réponse qui te semble correcte pour cette phrase.
            </Text>

            <View style={{ gap: 12 }}>
              {(exercise.answers ?? []).map((answer) => (
                <ChoiceButton
                  key={answer}
                  label={answer}
                  disabled={!!result}
                  state={getChoiceState(answer)}
                  onPress={() => submitAnswer(answer)}
                />
              ))}
            </View>

            {result && (
              <View
                style={{
                  marginTop: 16,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: result.ok ? GREEN : RED,
                  backgroundColor: result.ok ? GREEN_BG : RED_BG,
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    color: TXT,
                    fontSize: 15,
                    fontWeight: "900",
                  }}
                >
                  {result.ok ? "✅ Correct" : "❌ Pas tout à fait"}
                </Text>

                <Text
                  style={{
                    color: TXT,
                    marginTop: 12,
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  Sens naturel
                </Text>
                <Text
                  style={{
                    color: MUTED,
                    marginTop: 4,
                    lineHeight: 20,
                  }}
                >
                  {exercise.translation}
                </Text>

                <Text
                  style={{
                    color: TXT,
                    marginTop: 12,
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  Réponse attendue
                </Text>
                <Text
                  style={{
                    color: MUTED,
                    marginTop: 4,
                    lineHeight: 20,
                  }}
                >
                  {Array.isArray(exercise.correct)
                    ? exercise.correct.join(" / ")
                    : exercise.correct}
                </Text>

                {!!exercise.hint && (
                  <>
                    <Text
                      style={{
                        color: TXT,
                        marginTop: 12,
                        fontSize: 13,
                        fontWeight: "900",
                      }}
                    >
                      Indice
                    </Text>
                    <Text
                      style={{
                        color: MUTED,
                        marginTop: 4,
                        lineHeight: 20,
                      }}
                    >
                      {exercise.hint}
                    </Text>
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
                    label="Suivant"
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
            <Text
              style={{
                color: SOFT,
                textAlign: "center",
                lineHeight: 20,
                fontWeight: "700",
              }}
            >
              Astuce : écoute d’abord la phrase globalement, puis associe le bon
              sens.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
