import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { isCorrect } from "../../lib/answerCheck";
import { shuffleArray } from "../../lib/choiceOrder";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { buildProgressId } from "../../lib/progressIds";

type Exercise = {
  audio?: string;
  question: string;
  correct: string | string[];
  type: "choice" | "input";
  answers?: string[];
};

const SESSION: Exercise[] = [
  {
    audio: "주문하시겠어요?",
    question: "Que veut dire cette phrase ?",
    correct: "Voulez-vous commander ?",
    type: "choice",
    answers: [
      "Voulez-vous commander ?",
      "Vous êtes combien ?",
      "Voulez-vous payer ?",
    ],
  },
  {
    audio: "몇 번 출구예요?",
    question: "Que signifie cette phrase ?",
    correct: "C’est la sortie numéro combien ?",
    type: "choice",
    answers: [
      "Dans quelle direction allez-vous ?",
      "C’est la sortie numéro combien ?",
      "Où est la correspondance ?",
    ],
  },
  {
    audio: "안 매운 걸로 주세요.",
    question: "Que veut dire cette phrase ?",
    correct: "Quelque chose de non piquant, s'il vous plaît.",
    type: "choice",
    answers: [
      "Donnez-moi de l’eau, s'il vous plaît.",
      "Je voudrais payer par carte.",
      "Quelque chose de non piquant, s'il vous plaît.",
    ],
  },
  {
    audio: "2호선 어디에서 타요?",
    question: "Que signifie cette phrase ?",
    correct: "Où est-ce que je prends la ligne 2 ?",
    type: "choice",
    answers: [
      "Où est-ce que je prends la ligne 2 ?",
      "La ligne 2 est fermée ?",
      "La ligne 2 arrive bientôt ?",
    ],
  },
];

export default function ListeningScreen() {
  const { complete } = useStore();
  const responsive = useResponsiveLayout({ maxWidth: 680 });
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const isDailyActivityReportedRef = useRef(false);

  const exercise = SESSION[index];
  const displayedAnswers = useMemo(
    () => shuffleArray(exercise?.answers ?? []),
    [exercise],
  );

  useEffect(() => {
    if (exercise || isDailyActivityReportedRef.current) return;

    isDailyActivityReportedRef.current = true;
    complete(buildProgressId("listen", "index_quiz"));
    void completeDailyActivity("listen_exercise");
  }, [complete, exercise]);

  function playAudio() {
    if (!exercise?.audio) return;

    Speech.speak(exercise.audio, {
      language: "ko-KR",
      rate: 0.9,
    });
  }

  function check(answer: string) {
    if (!exercise) return;

    const ok = isCorrect(answer, exercise.correct);
    setResult(ok ? "Correct !" : "Incorrect");

    setTimeout(() => {
      setResult(null);
      setInput("");
      setIndex((i) => i + 1);
    }, 1200);
  }

  if (!exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#060816" }}>
        <View
          style={{
            alignSelf: "center",
            maxWidth: responsive.maxWidth,
            padding: responsive.horizontalPadding,
            width: "100%",
          }}
        >
        <AppText accessibilityRole="header" variant="sectionTitle">Session terminée 🎉</AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#060816" }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          alignSelf: "center",
          maxWidth: responsive.maxWidth,
          paddingBottom: 48,
          paddingHorizontal: responsive.horizontalPadding,
          paddingTop: 20,
          width: "100%",
        }}
      >
      <Pressable
        accessibilityRole="button"
        onPress={playAudio}
        style={{ justifyContent: "center", minHeight: 44 }}
      >
        <AppText variant="button">🔊 Écouter</AppText>
      </Pressable>

      <AppText variant="bodyStrong" style={{ marginTop: 20 }}>{exercise.question}</AppText>

      {exercise.type === "choice" &&
        displayedAnswers.map((a) => (
          <Pressable
            key={a}
            onPress={() => check(a)}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.16)",
              borderRadius: 16,
              padding: 12,
              marginTop: 10,
              borderWidth: 1,
            }}
          >
            <AppText variant="body">{a}</AppText>
          </Pressable>
        ))}

      {exercise.type === "input" && (
        <>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écris ta réponse"
            style={{
              borderWidth: 1,
              padding: 10,
              marginTop: 10,
            }}
          />

          <Pressable
            onPress={() => check(input)}
            style={{
              padding: 10,
              marginTop: 10,
              borderWidth: 1,
            }}
          >
            <AppText variant="button">Valider</AppText>
          </Pressable>
        </>
      )}

      {result && <AppText variant="bodyStrong" style={{ marginTop: 20 }}>{result}</AppText>}
      </ScrollView>
    </SafeAreaView>
  );
}
