import * as Speech from "expo-speech";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { isCorrect } from "../../lib/answerCheck";

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
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const exercise = SESSION[index];

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
      <View style={{ padding: 20 }}>
        <Text>Session terminée 🎉</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Pressable onPress={playAudio}>
        <Text style={{ fontSize: 22 }}>🔊 Écouter</Text>
      </Pressable>

      <Text style={{ marginTop: 20 }}>{exercise.question}</Text>

      {exercise.type === "choice" &&
        exercise.answers?.map((a) => (
          <Pressable
            key={a}
            onPress={() => check(a)}
            style={{
              padding: 12,
              marginTop: 10,
              borderWidth: 1,
            }}
          >
            <Text>{a}</Text>
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
            <Text>Valider</Text>
          </Pressable>
        </>
      )}

      {result && <Text style={{ marginTop: 20 }}>{result}</Text>}
    </View>
  );
}
