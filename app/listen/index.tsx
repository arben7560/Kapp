import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { isCorrect } from "../../lib/answerCheck";
import { generateDailySession } from "../../lib/sessionGenerator";

export default function ListeningScreen() {
  const [session] = useState(() => generateDailySession());

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const exercise = session[index];

  async function playAmbience() {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/ambience/cafe.mp3"),
    );
    setSound(sound);
    await sound.setIsLoopingAsync(true); // boucle continue
    await sound.playAsync();
  }

  // Lance l’ambiance quand l’écran s’ouvre
  useEffect(() => {
    playAmbience();

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  function playAudio() {
    Speech.speak(exercise.audio, { language: "ko-KR" });
  }

  function check(answer: string) {
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
