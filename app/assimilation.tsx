import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AppMixedText, AppText } from "../components/app-text";

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
          <AppText variant="button" style={{ color: TXT }}>← Retour</AppText>
        </Pressable>

        <AppText accessibilityRole="header" variant="screenTitle" style={{ color: TXT }}>
          Assimilation (lecture naturelle)
        </AppText>
        <AppText variant="body" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
          Liaisons, nasalisation, sons tendus… pour comprendre les natifs.
        </AppText>

        <View style={{ height: 14 }} />

        <Card>
          <AppMixedText variant="sectionTitle" style={{ color: TXT }} segments={[
            { text: "1) Liaison (", script: "latin" },
            { text: "연음", script: "korean" },
            { text: ")", script: "latin" },
          ]} />
          <AppMixedText variant="body" tone="muted" style={{ color: MUTED, marginTop: 6 }} segments={[
            { text: "Batchim + ", script: "latin" },
            { text: "ㅇ", script: "korean" },
            { text: " (muet) → la consonne finale se lie à la syllabe suivante.", script: "latin" },
          ]} />
          <AppText variant="koreanSecondary" script="korean" style={{ color: TXT, marginTop: 10 }}>
            예) 한국어 → 한구거
          </AppText>
        </Card>

        <Card>
          <AppMixedText variant="sectionTitle" style={{ color: TXT }} segments={[
            { text: "2) Nasalisation (", script: "latin" },
            { text: "비음화", script: "korean" },
            { text: ")", script: "latin" },
          ]} />
          <AppMixedText variant="body" tone="muted" style={{ color: MUTED, marginTop: 6 }} segments={[
            { text: "Devant ", script: "latin" },
            { text: "ㄴ/ㅁ : ㅂ→ㅁ, ㄱ→ㅇ, ㄷ→ㄴ", script: "korean" },
            { text: "…", script: "latin" },
          ]} />
          <AppText variant="koreanSecondary" script="korean" style={{ color: TXT, marginTop: 10 }}>
            예) 합니다 → 함니다 / 한국말 → 한궁말
          </AppText>
        </Card>

        <Card>
          <AppMixedText variant="sectionTitle" style={{ color: TXT }} segments={[
            { text: "3) Sons tendus (", script: "latin" },
            { text: "된소리", script: "korean" },
            { text: ")", script: "latin" },
          ]} />
          <AppText variant="body" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
            Après certains batchim, la consonne suivante peut devenir “tendue”.
          </AppText>
          <AppText variant="koreanSecondary" script="korean" style={{ color: TXT, marginTop: 10 }}>
            예) 없다 → 업따 / 고맙습니다 → 고맙씀니다
          </AppText>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
