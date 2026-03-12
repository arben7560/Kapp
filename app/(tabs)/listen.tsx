import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import CafeAvatar from "../../components/ai/CafeAvatar";

const BG0 = "#070812";
const BG1 = "#0d1322";
const BG2 = "#151122";

const TXT = "rgba(255,255,255,0.94)";
const MUTED = "rgba(255,255,255,0.64)";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.06)";
const CYAN = "rgba(34,211,238,0.55)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PURPLE = "rgba(124,58,237,0.55)";
const PURPLE_BG = "rgba(124,58,237,0.12)";
const GREEN = "rgba(34,197,94,0.45)";
const GREEN_BG = "rgba(34,197,94,0.12)";
const RED = "rgba(239,68,68,0.45)";
const RED_BG = "rgba(239,68,68,0.12)";

type Exercise = {
  id: string;
  narrator?: string;
  audio: string;
  question: string;
  translation: string;
  choices: string[];
  correct: string;
  hint?: string;
};

const EXERCISES: Exercise[] = [
  {
    id: "1",
    narrator: "Tu entends une phrase simple dans un café à Séoul.",
    audio: "주문하시겠어요?",
    question: "Que veut dire cette phrase ?",
    translation: "Voulez-vous commander ?",
    choices: [
      "Voulez-vous commander ?",
      "Vous êtes combien ?",
      "Voulez-vous payer ?",
    ],
    correct: "Voulez-vous commander ?",
    hint: "On entend souvent cette phrase quand le serveur vient prendre la commande.",
  },
  {
    id: "2",
    narrator: "Annonce ou indication dans le métro.",
    audio: "몇 번 출구예요?",
    question: "Quel est le bon sens ?",
    translation: "C’est la sortie numéro combien ?",
    choices: [
      "Dans quelle direction allez-vous ?",
      "C’est la sortie numéro combien ?",
      "Où est la correspondance ?",
    ],
    correct: "C’est la sortie numéro combien ?",
    hint: "출구 = sortie.",
  },
  {
    id: "3",
    narrator:
      "Tu entends une réponse utile pour demander quelque chose de doux au restaurant.",
    audio: "안 매운 걸로 주세요.",
    question: "Que veut dire cette phrase ?",
    translation: "Quelque chose de non piquant, s'il vous plaît.",
    choices: [
      "Donnez-moi de l’eau, s'il vous plaît.",
      "Je voudrais payer par carte.",
      "Quelque chose de non piquant, s'il vous plaît.",
    ],
    correct: "Quelque chose de non piquant, s'il vous plaît.",
    hint: "매운 = épicé. 안 = ne pas.",
  },
  {
    id: "4",
    narrator: "Tu demandes une ligne dans le métro.",
    audio: "2호선 어디에서 타요?",
    question: "Que signifie cette phrase ?",
    translation: "Où est-ce que je prends la ligne 2 ?",
    choices: [
      "Où est-ce que je prends la ligne 2 ?",
      "La ligne 2 est fermée ?",
      "La ligne 2 arrive bientôt ?",
    ],
    correct: "Où est-ce que je prends la ligne 2 ?",
    hint: "타요 = prendre / monter.",
  },
];

function SmallAction({
  label,
  onPress,
  tone = "ghost",
}: {
  label: string;
  onPress: () => void;
  tone?: "ghost" | "cyan" | "purple";
}) {
  const style =
    tone === "cyan"
      ? { backgroundColor: CYAN_BG, borderColor: CYAN }
      : tone === "purple"
        ? { backgroundColor: PURPLE_BG, borderColor: PURPLE }
        : {
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.08)",
          };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.92 : 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...style,
      })}
    >
      <Text style={{ color: TXT, fontSize: 14, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ListenIaScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const speechTokenRef = useRef(0);

  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<null | { ok: boolean }>(null);
  const [score, setScore] = useState(0);

  const exercise = EXERCISES[index];
  const finished = !exercise;

  const progress = useMemo(() => {
    if (EXERCISES.length === 0) return 0;
    return (index / EXERCISES.length) * 100;
  }, [index]);

  useEffect(() => {
    if (!exercise) return;

    const id = setTimeout(() => {
      playAudio();
    }, 120);

    return () => clearTimeout(id);
  }, [index]);

  useEffect(() => {
    return () => {
      Speech.stop();
      speechTokenRef.current += 1;
    };
  }, []);

  const stopSpeech = () => {
    Speech.stop();
    speechTokenRef.current += 1;
    setSpeaking(false);
  };

  const playAudio = () => {
    if (!exercise) return;

    const token = speechTokenRef.current + 1;
    speechTokenRef.current = token;

    Speech.stop();
    setSpeaking(true);

    Speech.speak(exercise.audio, {
      language: "ko-KR",
      rate: 0.9,
      pitch: 1.0,
      onDone: () => {
        if (speechTokenRef.current !== token) return;
        setSpeaking(false);
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
  };

  const animateChange = (update: () => void) => {
    stopSpeech();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 8,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      update();

      fadeAnim.setValue(0);
      translateAnim.setValue(8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const submitAnswer = (answer: string) => {
    if (!exercise || result) return;

    const ok = answer === exercise.correct;
    setSelectedAnswer(answer);
    setResult({ ok });

    if (ok) {
      setScore((s) => s + 1);
    }
  };

  const nextExercise = () => {
    animateChange(() => {
      setSelectedAnswer(null);
      setResult(null);
      setIndex((prev) => prev + 1);
    });
  };

  const resetSession = () => {
    animateChange(() => {
      setSelectedAnswer(null);
      setResult(null);
      setScore(0);
      setIndex(0);
    });
  };

  const getChoiceStyle = (choice: string) => {
    if (!exercise || !result) {
      return {
        borderColor: LINE,
        backgroundColor: "rgba(255,255,255,0.04)",
      };
    }

    if (choice === exercise.correct) {
      return {
        borderColor: GREEN,
        backgroundColor: GREEN_BG,
      };
    }

    if (choice === selectedAnswer && choice !== exercise.correct) {
      return {
        borderColor: RED,
        backgroundColor: RED_BG,
      };
    }

    return {
      borderColor: LINE,
      backgroundColor: "rgba(255,255,255,0.04)",
    };
  };

  if (finished) {
    return (
      <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            padding: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: CARD,
              borderColor: LINE,
              borderWidth: 1,
              borderRadius: 24,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: TXT,
                fontSize: 26,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              Session IA terminée 🎉
            </Text>

            <Text
              style={{
                color: MUTED,
                marginTop: 10,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Bravo. Tu as terminé cette mini-session d’écoute immersive.
            </Text>

            <View style={{ height: 16 }} />

            <View
              style={{
                alignSelf: "center",
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: CYAN,
                backgroundColor: CYAN_BG,
              }}
            >
              <Text style={{ color: TXT, fontWeight: "900", fontSize: 15 }}>
                Score : {score} / {EXERCISES.length}
              </Text>
            </View>

            <View style={{ height: 16 }} />

            <SmallAction
              label="Recommencer"
              onPress={resetSession}
              tone="cyan"
            />

            <View style={{ height: 10 }} />

            <SmallAction
              label="Retour"
              onPress={() => router.back()}
              tone="ghost"
            />
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ paddingVertical: 8, marginBottom: 2 }}
          hitSlop={10}
        >
          <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
        </Pressable>

        <Text style={{ color: TXT, fontSize: 28, fontWeight: "900" }}>
          Écoute — IA immersive
        </Text>

        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Écoute une phrase, comprends rapidement, puis choisis le bon sens.
        </Text>

        <View style={{ height: 14 }} />

        <View
          style={{
            height: 10,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "rgba(34,211,238,0.78)",
            }}
          />
        </View>

        <View style={{ height: 12 }} />

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: CYAN,
              backgroundColor: CYAN_BG,
            }}
          >
            <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
              Exercice {index + 1} / {EXERCISES.length}
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: PURPLE,
              backgroundColor: PURPLE_BG,
            }}
          >
            <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
              Mode écoute guidée
            </Text>
          </View>
        </View>

        <View style={{ height: 14 }} />

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: LINE,
            overflow: "hidden",
            padding: 14,
            marginBottom: 12,
          }}
        >
          <LinearGradient
            colors={[
              "rgba(124,58,237,0.10)",
              "rgba(34,211,238,0.06)",
              "rgba(255,255,255,0.02)",
            ]}
            style={{
              alignItems: "center",
              borderRadius: 20,
            }}
          >
            <CafeAvatar speaking={speaking} compact={false} immersive />

            <Text
              style={{
                color: TXT,
                fontSize: 22,
                fontWeight: "900",
                marginTop: 12,
              }}
            >
              Listening Coach
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 13,
                marginTop: 4,
                marginBottom: 12,
              }}
            >
              Écoute courte et compréhension rapide
            </Text>

            <Animated.View
              style={{
                width: "100%",
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim }],
              }}
            >
              {!!exercise.narrator && (
                <View
                  style={{
                    width: "100%",
                    borderRadius: 18,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: TXT,
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: "700",
                    }}
                  >
                    {exercise.narrator}
                  </Text>
                </View>
              )}

              <View
                style={{
                  width: "100%",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  backgroundColor: "rgba(10,10,16,0.42)",
                  borderWidth: 1,
                  borderColor: speaking
                    ? "rgba(124,58,237,0.34)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.56)",
                    fontSize: 11,
                    fontWeight: "800",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Compréhension
                </Text>

                <Text
                  style={{
                    color: TXT,
                    fontSize: 19,
                    lineHeight: 27,
                    fontWeight: "900",
                  }}
                >
                  {exercise.question}
                </Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: LINE,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <SmallAction
            label={speaking ? "🔊 Lecture..." : "🔊 Écouter la phrase"}
            onPress={playAudio}
            tone="purple"
          />

          <View style={{ height: 12 }} />

          {exercise.choices.map((choice) => {
            const choiceStyle = getChoiceStyle(choice);

            return (
              <Pressable
                key={choice}
                disabled={!!result}
                onPress={() => submitAnswer(choice)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.92 : 1,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: choiceStyle.borderColor,
                  borderRadius: 16,
                  backgroundColor: choiceStyle.backgroundColor,
                })}
              >
                <Text
                  style={{
                    color: TXT,
                    fontSize: 16,
                    fontWeight: "800",
                  }}
                >
                  {choice}
                </Text>
              </Pressable>
            );
          })}

          {result && (
            <View
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: result.ok ? GREEN : RED,
                backgroundColor: result.ok ? GREEN_BG : RED_BG,
              }}
            >
              <Text
                style={{
                  color: TXT,
                  fontSize: 15,
                  fontWeight: "900",
                }}
              >
                {result.ok ? "✅ Correct" : "❌ Incorrect"}
              </Text>

              <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
                Phrase entendue
              </Text>
              <Text style={{ color: MUTED, marginTop: 4 }}>
                {exercise.audio}
              </Text>

              <Text style={{ color: TXT, marginTop: 12, fontWeight: "900" }}>
                Sens naturel
              </Text>
              <Text style={{ color: MUTED, marginTop: 4 }}>
                {exercise.translation}
              </Text>

              {!!exercise.hint && (
                <>
                  <Text
                    style={{ color: TXT, marginTop: 12, fontWeight: "900" }}
                  >
                    Indice
                  </Text>
                  <Text style={{ color: MUTED, marginTop: 4 }}>
                    {exercise.hint}
                  </Text>
                </>
              )}

              <View style={{ height: 14 }} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <SmallAction
                  label="🔁 Réécouter"
                  onPress={playAudio}
                  tone="purple"
                />
                <SmallAction
                  label="Suivant"
                  onPress={nextExercise}
                  tone="cyan"
                />
              </View>
            </View>
          )}
        </View>

        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.60)",
              textAlign: "center",
              lineHeight: 20,
              fontWeight: "700",
            }}
          >
            Astuce : écoute une première fois globalement, puis une seconde fois
            pour repérer les mots-clés.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
