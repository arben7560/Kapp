import { Audio } from "expo-av";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function TestAudio() {
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./test.mp3"), // adapte le chemin si besoin
      );
      await sound.playAsync();
    } catch (e) {
      console.log("Erreur audio :", e);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
      }}
    >
      <Pressable
        onPress={playSound}
        style={{
          backgroundColor: "#7c3aed",
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          ▶️ Tester le son
        </Text>
      </Pressable>
    </View>
  );
}
