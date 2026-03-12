import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../../_store";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";

export default function Profile() {
  const { progress, setProgress, togglePremium } = useStore();

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text
          style={{ color: TXT, fontSize: 22, fontWeight: "900", marginTop: 8 }}
        >
          Profil
        </Text>
        <Text style={{ color: MUTED, marginTop: 6 }}>
          Objectifs, premium, debug
        </Text>

        <View style={{ height: 14 }} />

        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 22,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
            Stats
          </Text>
          <Text style={{ color: MUTED, marginTop: 6 }}>XP : {progress.xp}</Text>
          <Text style={{ color: MUTED, marginTop: 2 }}>
            Streak : {progress.streak} 🔥
          </Text>
          <Text style={{ color: MUTED, marginTop: 2 }}>
            Hangul : niveau {progress.hangulLevel}/4
          </Text>
          <Text style={{ color: MUTED, marginTop: 2 }}>
            Premium : {progress.isPremium ? "Actif ✅" : "Non"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 22,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
            Premium
          </Text>
          <Text style={{ color: MUTED, marginTop: 6 }}>
            Débloque dialogues avancés + prononciation intensive.
          </Text>

          <View style={{ height: 12 }} />

          <Pressable
            onPress={togglePremium}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              backgroundColor: "rgba(34,211,238,0.14)",
              borderColor: "rgba(34,211,238,0.55)",
              borderWidth: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: "center",
            })}
          >
            <Text style={{ color: TXT, fontWeight: "900" }}>
              {progress.isPremium
                ? "Désactiver Premium (prototype)"
                : "Activer Premium (prototype)"}
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 22,
            padding: 14,
          }}
        >
          <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
            Outils
          </Text>
          <Text style={{ color: MUTED, marginTop: 6 }}>
            (Prototype) pour tester vite.
          </Text>

          <View style={{ height: 12 }} />

          <Pressable
            onPress={() => {
              Alert.alert("Reset", "Réinitialiser la progression ?", [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Oui",
                  style: "destructive",
                  onPress: () =>
                    setProgress({
                      xp: 0,
                      streak: 0,
                      isPremium: false,
                      completed: {},
                      hangulLevel: 1,
                    }),
                },
              ]);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              backgroundColor: "rgba(251,113,133,0.12)",
              borderColor: "rgba(251,113,133,0.45)",
              borderWidth: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: "center",
            })}
          >
            <Text style={{ color: TXT, fontWeight: "900" }}>Réinitialiser</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
