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
const NEON = "rgba(34,211,238,0.55)";
const NEON_BG = "rgba(34,211,238,0.14)";
const PINK = "rgba(251,113,133,0.45)";
const PINK_BG = "rgba(251,113,133,0.12)";

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

function Button({
  label,
  onPress,
  tone = "neon",
  disabled,
}: {
  label: string;
  onPress?: () => void;
  tone?: "neon" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const style =
    tone === "neon"
      ? { backgroundColor: NEON_BG, borderColor: NEON }
      : tone === "danger"
        ? { backgroundColor: PINK_BG, borderColor: PINK }
        : { backgroundColor: "rgba(255,255,255,0.06)", borderColor: LINE };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: "center",
        ...style,
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Chip({ kr, fr, say }: { kr: string; fr: string; say: string }) {
  return (
    <Pressable
      onPress={() => {
        Speech.stop();
        Speech.speak(say, { language: "ko-KR", rate: 0.92, pitch: 1.0 });
      }}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: "rgba(255,255,255,0.05)",
        minWidth: 120,
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>{kr}</Text>
      <Text
        style={{ color: MUTED, marginTop: 4, fontWeight: "800", fontSize: 12 }}
      >
        {fr}
      </Text>
    </Pressable>
  );
}

type QuizItem = {
  id: string;
  prompt: string;
  say: string;
  choices: string[];
  correctIndex: number;
  explain: string;
};

function Quiz({ items }: { items: QuizItem[] }) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [show, setShow] = React.useState(false);

  const item = items[index];

  const next = () => {
    setSelected(null);
    setShow(false);
    setIndex((i) => (i + 1) % items.length);
  };

  return (
    <Card>
      <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
        🎧 Mini-quiz écoute
      </Text>
      <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
        Appuie sur “Écouter”, puis choisis la réponse correcte.
      </Text>

      <View style={{ height: 12 }} />
      <View
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: LINE,
          backgroundColor: "rgba(255,255,255,0.05)",
          padding: 12,
        }}
      >
        <Text style={{ color: TXT, fontWeight: "900" }}>{item.prompt}</Text>

        <View style={{ height: 12 }} />
        <Button
          label="🔊 Écouter"
          onPress={() => {
            Speech.stop();
            Speech.speak(item.say, {
              language: "ko-KR",
              rate: 0.92,
              pitch: 1.0,
            });
          }}
        />

        {item.choices.map((c, i) => {
          const isSel = selected === i;
          const isCorrect = i === item.correctIndex;

          const borderColor =
            show && isCorrect
              ? NEON
              : show && isSel && !isCorrect
                ? PINK
                : isSel
                  ? "rgba(255,255,255,0.35)"
                  : LINE;

          const backgroundColor =
            show && isCorrect
              ? "rgba(34,211,238,0.10)"
              : show && isSel && !isCorrect
                ? "rgba(251,113,133,0.10)"
                : "rgba(255,255,255,0.04)";

          return (
            <Pressable
              key={`${item.id}_${i}`}
              disabled={show}
              onPress={() => setSelected(i)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor,
                backgroundColor,
                paddingVertical: 12,
                paddingHorizontal: 12,
                marginTop: 10,
              })}
            >
              <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
                {c}
              </Text>
            </Pressable>
          );
        })}

        <View style={{ height: 12 }} />
        <Button
          tone="ghost"
          label={show ? "Réponse affichée" : "✅ Vérifier"}
          disabled={selected === null || show}
          onPress={() => setShow(true)}
        />

        {show && (
          <>
            <View style={{ height: 12 }} />
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: LINE,
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: 12,
              }}
            >
              <Text style={{ color: TXT, fontWeight: "900" }}>
                Réponse : {item.choices[item.correctIndex]}
              </Text>
              <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
                {item.explain}
              </Text>
            </View>

            <View style={{ height: 12 }} />
            <Button label="➡️ Suivant" onPress={next} />
          </>
        )}

        <View style={{ height: 10 }} />
        <Button
          tone="danger"
          label="⏹ Stop audio"
          onPress={() => Speech.stop()}
        />
      </View>
    </Card>
  );
}

export default function Buildings() {
  const speak = React.useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ko-KR", rate: 0.92, pitch: 1.0 });
  }, []);

  // ✅ Essentiels : lieux + bâtiments + étages (vraiment utile en Corée)
  const essentials = [
    { kr: "건물", fr: "bâtiment", say: "건물" },
    { kr: "가게", fr: "magasin", say: "가게" },
    { kr: "카페", fr: "café", say: "카페" },
    { kr: "식당", fr: "restaurant", say: "식당" },
    { kr: "편의점", fr: "supérette", say: "편의점" },
    { kr: "병원", fr: "hôpital", say: "병원" },
    { kr: "약국", fr: "pharmacie", say: "약국" },
    { kr: "호텔", fr: "hôtel", say: "호텔" },
    { kr: "학교", fr: "école", say: "학교" },
    { kr: "회사", fr: "entreprise", say: "회사" },
    { kr: "1층", fr: "1er étage (RDC)", say: "일 층" },
    { kr: "2층", fr: "2e étage", say: "이 층" },
    { kr: "지하", fr: "sous-sol", say: "지하" },
    { kr: "엘리베이터", fr: "ascenseur", say: "엘리베이터" },
  ] as const;

  // ✅ Phrases courtes : localisation + étage (hyper fréquent)
  const phrases = [
    { kr: "여기 어디예요?", fr: "On est où, ici ?", say: "여기 어디예요?" },
    {
      kr: "화장실이 어디예요?",
      fr: "Où sont les toilettes ?",
      say: "화장실이 어디예요?",
    },
    {
      kr: "이 건물 1층에 있어요.",
      fr: "C’est au RDC de ce bâtiment.",
      say: "이 건물 일 층에 있어요.",
    },
    {
      kr: "2층으로 가 주세요.",
      fr: "Allez au 2e étage, s’il vous plaît.",
      say: "이 층으로 가 주세요.",
    },
    {
      kr: "지하철역 근처예요.",
      fr: "C’est près de la station de métro.",
      say: "지하철역 근처예요.",
    },
  ];

  // ✅ Quiz écoute
  const quizItems: QuizItem[] = [
    {
      id: "q1",
      prompt: "Quel mot veut dire “sous-sol” ?",
      say: "지하",
      choices: ["지하", "2층"],
      correctIndex: 0,
      explain: "지하 = sous-sol. 2층 = 2e étage.",
    },
    {
      id: "q2",
      prompt: "Quel mot veut dire “pharmacie” ?",
      say: "약국",
      choices: ["약국", "병원"],
      correctIndex: 0,
      explain: "약국 = pharmacie. 병원 = hôpital.",
    },
    {
      id: "q3",
      prompt: "Quelle phrase signifie “C’est au RDC de ce bâtiment” ?",
      say: "이 건물 1층에 있어요",
      choices: ["이 건물 1층에 있어요", "지하철역 근처예요"],
      correctIndex: 0,
      explain: "1층 = RDC/1er niveau. ~에 있어요 = c’est à / c’est situé à.",
    },
  ];

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ paddingVertical: 8 }}
          hitSlop={10}
        >
          <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
        </Pressable>

        <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
          Lieux & bâtiments (건물/장소)
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Vocab utile + étages (1층/2층/지하) + phrases courtes pour se repérer.
        </Text>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>💡 Astuce Corée</Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            En Corée, beaucoup de commerces sont en étage (2층/3층) ou en
            sous-sol (지하). Apprendre 1층/2층/지하 + “~에 있어요” te sauve
            partout.
          </Text>
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🏢 Essentiels
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Lieux fréquents + vocab “étage/ascenseur”.
          </Text>

          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {essentials.map((x) => (
              <Chip key={x.kr} kr={x.kr} fr={x.fr} say={x.say} />
            ))}
          </View>

          <View style={{ height: 12 }} />
          <Button
            label="🔊 Écouter tout (rapide)"
            onPress={() =>
              speak(
                "건물 가게 카페 식당 편의점 병원 약국 호텔 학교 회사 일 층 이 층 지하 엘리베이터",
              )
            }
          />
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🗣️ Phrases courtes
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Très courtes, très utiles pour demander/indiquer un endroit.
          </Text>

          {phrases.map((p, i) => (
            <Pressable
              key={i}
              onPress={() => speak(p.say)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                marginTop: 10,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: LINE,
                backgroundColor: "rgba(255,255,255,0.04)",
              })}
            >
              <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
                {p.kr}
              </Text>
              <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
                {p.fr}
              </Text>
            </Pressable>
          ))}

          <View style={{ height: 12 }} />
          <Button
            tone="danger"
            label="⏹ Stop audio"
            onPress={() => Speech.stop()}
          />
        </Card>

        <Quiz items={quizItems} />
      </ScrollView>
    </LinearGradient>
  );
}
