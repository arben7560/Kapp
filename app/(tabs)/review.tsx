import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";

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
        <AppText accessibilityRole="header" variant="screenTitle" style={{ color: TXT, marginTop: 8 }}>
          Carnet
        </AppText>
        <AppText variant="subtitle" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
          Révision intelligente (prototype)
        </AppText>

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
          <AppText variant="sectionTitle" style={{ color: TXT }}>Stats</AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
            Missions validées : {done.length}
          </AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 2 }}>XP : {progress.xp}</AppText>
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
          <AppText variant="sectionTitle" style={{ color: TXT }}>
            Réviser maintenant (2 min)
          </AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
            3 chunks utiles à répéter.
          </AppText>

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
                <AppText variant="cardTitle" style={{ color: TXT }}>{s.title}</AppText>
                <AppText
                  variant="koreanSecondary"
                  script="korean"
                  style={{
                    color: TXT,
                    marginTop: 6,
                  }}
                >
                  {s.chunk}
                </AppText>
                <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
                  {isDone ? "Déjà validé ✅" : "Pas encore validé"}
                </AppText>

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
                      <AppText variant="button" align="center" style={{ color: TXT }}>
                        Marquer comme validé
                      </AppText>
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
