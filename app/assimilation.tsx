import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";

function Card({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </View>
  );
}

export default function AssimilationScreen() {
  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
          paddingTop: 56,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: LINE,
            backgroundColor: "rgba(255,255,255,0.06)",
            marginBottom: 14,
          }}
        >
          <Text style={{ color: TXT, fontWeight: "900" }}>← Retour</Text>
        </Pressable>

        <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
          Assimilation (lecture naturelle)
        </Text>
        <Text style={{ color: MUTED, marginTop: 6 }}>
          Liaisons, nasalisation, sons tendus… pour comprendre les natifs.
        </Text>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            1) Liaison (연음)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Batchim + ㅇ (muet) → la consonne finale se lie à la syllabe
            suivante.
          </Text>
          <Text style={{ color: TXT, marginTop: 10, fontWeight: "900" }}>
            예) 한국어 → 한구거
          </Text>
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            2) Nasalisation (비음화)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Devant ㄴ/ㅁ : ㅂ→ㅁ, ㄱ→ㅇ, ㄷ→ㄴ…
          </Text>
          <Text style={{ color: TXT, marginTop: 10, fontWeight: "900" }}>
            예) 합니다 → 함니다 / 한국말 → 한궁말
          </Text>
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            3) Sons tendus (된소리)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Après certains batchim, la consonne suivante peut devenir “tendue”.
          </Text>
          <Text style={{ color: TXT, marginTop: 10, fontWeight: "900" }}>
            예) 없다 → 업따 / 고맙습니다 → 고맙씀니다
          </Text>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
