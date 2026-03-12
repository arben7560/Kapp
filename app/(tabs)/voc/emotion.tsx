import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";
const CYAN = "rgba(34,211,238,0.50)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PINK = "rgba(255,99,132,0.40)";
const PINK_BG = "rgba(255,99,132,0.10)";
const PURPLE = "rgba(124,58,237,0.50)";
const PURPLE_BG = "rgba(124,58,237,0.12)";

function speakKR(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1,
  });
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 22,
        padding: 14,
      }}
    >
      {children}
    </View>
  );
}

function Pill({
  label,
  accent = "cyan",
}: {
  label: string;
  accent?: "cyan" | "pink" | "purple";
}) {
  const borderColor =
    accent === "pink" ? PINK : accent === "purple" ? PURPLE : CYAN;
  const backgroundColor =
    accent === "pink" ? PINK_BG : accent === "purple" ? PURPLE_BG : CYAN_BG;

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor,
        backgroundColor,
      }}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

function AudioButton({ text }: { text: string }) {
  return (
    <Pressable
      onPress={() => speakKR(text)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: PURPLE,
        backgroundColor: PURPLE_BG,
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        🔊 Écouter
      </Text>
    </Pressable>
  );
}

function ExprRow({
  kr,
  roman,
  fr,
  nuance,
}: {
  kr: string;
  roman: string;
  fr: string;
  nuance?: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.035)",
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            {kr}
          </Text>
          <Text style={{ color: MUTED, marginTop: 4 }}>{roman}</Text>
          <Text style={{ color: "rgba(255,255,255,0.82)", marginTop: 6 }}>
            {fr}
          </Text>
          {!!nuance && (
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 19 }}>
              {nuance}
            </Text>
          )}
        </View>
        <AudioButton text={kr} />
      </View>
    </View>
  );
}

export default function EmotionsPage() {
  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -120,
          left: -90,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: "rgba(124,58,237,0.18)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -150,
          right: -110,
          width: 320,
          height: 320,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.14)",
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
        </Pressable>

        <View style={{ height: 14 }} />

        <Text style={{ color: TXT, fontSize: 31, fontWeight: "900" }}>
          Émotions & personnalité
        </Text>

        <Text style={{ color: MUTED, marginTop: 8, lineHeight: 22 }}>
          Nuances très utiles à l’oral pour parler de ton ressenti, de ton
          humeur et de ta personnalité.
        </Text>

        <View style={{ height: 14 }} />

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Pill label="Premium" accent="pink" />
          <Pill label="Oral naturel" />
          <Pill label="Nuances utiles" accent="purple" />
        </View>

        <View style={{ height: 18 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 21, fontWeight: "900" }}>
            💎 Contenu Premium
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Cette page va au-delà du vocabulaire simple : elle t’aide à exprimer
            une nuance, une ambiance et une personnalité plus naturelle en
            coréen.
          </Text>
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            🙂 Humeur / ressenti
          </Text>
          <View style={{ height: 12 }} />
          <ExprRow
            kr="기분이 좋아요"
            roman="gibuni joayo"
            fr="Je me sens bien / je suis de bonne humeur."
            nuance="Très naturel pour parler de ton humeur du moment."
          />
          <ExprRow
            kr="조금 피곤해요"
            roman="jogeum pigonhaeyo"
            fr="Je suis un peu fatigué."
            nuance="Simple, fréquent, très utile en conversation."
          />
          <ExprRow
            kr="긴장돼요"
            roman="ginjangdwaeyo"
            fr="Je suis nerveux / tendu."
            nuance="Très utile avant un rendez-vous, un examen, une rencontre."
          />
          <ExprRow
            kr="마음이 편해요"
            roman="maeumi pyeonhaeyo"
            fr="Je me sens apaisé / soulagé."
            nuance="Plus doux et plus émotionnel que juste 'ça va'."
          />
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            🧠 Personnalité / manière d’être
          </Text>
          <View style={{ height: 12 }} />
          <ExprRow
            kr="차분한 편이에요"
            roman="chabunhan pyeonieyo"
            fr="Je suis plutôt calme."
            nuance="Le pattern ~편이에요 est très naturel pour décrire une tendance."
          />
          <ExprRow
            kr="조용한 편이에요"
            roman="joyonghan pyeonieyo"
            fr="Je suis plutôt discret / silencieux."
            nuance="Très utile si tu veux nuancer sans être trop direct."
          />
          <ExprRow
            kr="낯을 좀 가려요"
            roman="nacheul jom garyeoyo"
            fr="Je suis un peu réservé avec les inconnus."
            nuance="Expression très coréenne et très naturelle."
          />
          <ExprRow
            kr="생각이 많은 편이에요"
            roman="saenggagi maneun pyeonieyo"
            fr="J’ai tendance à beaucoup réfléchir."
            nuance="Nuance introspective, très naturelle à l’oral."
          />
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
            💬 Mini phrases naturelles
          </Text>
          <View style={{ height: 12 }} />

          <ExprRow
            kr="오늘은 기분이 좀 좋아요"
            roman="oneureun gibuni jom joayo"
            fr="Aujourd’hui je me sens plutôt bien."
          />
          <ExprRow
            kr="처음에는 좀 긴장돼요"
            roman="cheoeumeneun jom ginjangdwaeyo"
            fr="Au début je suis un peu nerveux."
          />
          <ExprRow
            kr="저는 차분한 편이에요"
            roman="jeoneun chabunhan pyeonieyo"
            fr="Moi, je suis plutôt calme."
          />
          <ExprRow
            kr="낯을 좀 가리지만 친해지면 괜찮아요"
            roman="nacheul jom garijiman chinaejimyeon gwaenchanayo"
            fr="Je suis un peu réservé, mais quand je me rapproche des gens ça va."
          />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
