import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../../_store";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";

const SUGGEST = [
  {
    id: "cafe_americano",
    title: "Café — americano",
    chunk: "아이스 아메리카노 하나 주세요",
  },
  { id: "metro_line2", title: "Métro — ligne 2", chunk: "2호선 어디예요?" },
  {
    id: "restaurant_order",
    title: "Restaurant — commande",
    chunk: "이거 주세요",
  },
];

export default function Review() {
  const { progress, complete } = useStore();

  const done = Object.keys(progress.completed);

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text
          style={{ color: TXT, fontSize: 22, fontWeight: "900", marginTop: 8 }}
        >
          Carnet
        </Text>
        <Text style={{ color: MUTED, marginTop: 6 }}>
          Révision intelligente (prototype)
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
          <Text style={{ color: TXT, fontWeight: "900" }}>Stats</Text>
          <Text style={{ color: MUTED, marginTop: 6 }}>
            Missions validées : {done.length}
          </Text>
          <Text style={{ color: MUTED, marginTop: 2 }}>XP : {progress.xp}</Text>
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
            Réviser maintenant (2 min)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6 }}>
            3 chunks utiles à répéter.
          </Text>

          <View style={{ height: 12 }} />

          {SUGGEST.map((s) => {
            const isDone = !!progress.completed[s.id];
            return (
              <View
                key={s.id}
                style={{
                  borderWidth: 1,
                  borderColor: LINE,
                  borderRadius: 18,
                  padding: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: TXT, fontWeight: "900" }}>{s.title}</Text>
                <Text
                  style={{
                    color: TXT,
                    marginTop: 6,
                    fontSize: 18,
                    fontWeight: "900",
                  }}
                >
                  {s.chunk}
                </Text>
                <Text style={{ color: MUTED, marginTop: 6 }}>
                  {isDone ? "Déjà validé ✅" : "Pas encore validé"}
                </Text>

                {!isDone && (
                  <>
                    <View style={{ height: 10 }} />
                    <Pressable
                      onPress={() => complete(s.id)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.9 : 1,
                        backgroundColor: "rgba(34,211,238,0.14)",
                        borderColor: "rgba(34,211,238,0.55)",
                        borderWidth: 1,
                        paddingVertical: 10,
                        borderRadius: 14,
                        alignItems: "center",
                      })}
                    >
                      <Text style={{ color: TXT, fontWeight: "900" }}>
                        Marquer comme validé
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
