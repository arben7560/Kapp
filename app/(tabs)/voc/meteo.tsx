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
        minWidth: 86,
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
        Appuie sur “Écouter”, puis choisis la phrase la plus proche.
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

export default function Meteo() {
  const speak = React.useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ko-KR", rate: 0.92, pitch: 1.0 });
  }, []);

  const essentials = [
    { kr: "날씨", fr: "météo", say: "날씨" },
    { kr: "맑아요", fr: "ciel clair", say: "맑아요" },
    { kr: "흐려요", fr: "nuageux", say: "흐려요" },
    { kr: "비", fr: "pluie", say: "비" },
    { kr: "비가 와요", fr: "il pleut", say: "비가 와요" },
    { kr: "눈", fr: "neige", say: "눈" },
    { kr: "눈이 와요", fr: "il neige", say: "눈이 와요" },
    { kr: "바람", fr: "vent", say: "바람" },
    { kr: "바람이 불어요", fr: "il y a du vent", say: "바람이 불어요" },
    { kr: "더워요", fr: "il fait chaud", say: "더워요" },
    { kr: "추워요", fr: "il fait froid", say: "추워요" },
  ] as const;

  const phrases = [
    {
      kr: "오늘 날씨 어때요?",
      fr: "Quel temps fait-il aujourd’hui ?",
      say: "오늘 날씨 어때요?",
    },
    {
      kr: "오늘은 맑아요.",
      fr: "Aujourd’hui il fait beau.",
      say: "오늘은 맑아요.",
    },
    {
      kr: "비 올 것 같아요.",
      fr: "Je crois qu’il va pleuvoir.",
      say: "비 올 것 같아요.",
    },
    { kr: "우산 있어요?", fr: "Tu as un parapluie ?", say: "우산 있어요?" },
    {
      kr: "내일은 더울까요?",
      fr: "Demain il fera chaud ?",
      say: "내일은 더울까요?",
    },
  ];

  const quizItems: QuizItem[] = [
    {
      id: "q1",
      prompt: "Quelle phrase signifie “il pleut” ?",
      say: "비가 와요",
      choices: ["비가 와요", "추워요"],
      correctIndex: 0,
      explain: "비 = pluie ; 비가 와요 = la pluie vient → il pleut.",
    },
    {
      id: "q2",
      prompt: "Quelle phrase signifie “il fait froid” ?",
      say: "추워요",
      choices: ["더워요", "추워요"],
      correctIndex: 1,
      explain: "더워요 = chaud ; 추워요 = froid.",
    },
    {
      id: "q3",
      prompt: "Quelle phrase signifie “Quel temps fait-il aujourd’hui ?”",
      say: "오늘 날씨 어때요?",
      choices: ["오늘 날씨 어때요?", "우산 있어요?"],
      correctIndex: 0,
      explain: "어때요? = comment c’est ? donc “météo comment ?”.",
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
          Météo (날씨)
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Vocabulaire + phrases courtes. Tap pour écouter. Objectif : comprendre
          et répondre vite.
        </Text>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            ☁️ Essentiels
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Commence par ces mots. Répète à voix haute après chaque clic.
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
                "날씨 맑아요 흐려요 비 비가 와요 눈 눈이 와요 바람 바람이 불어요 더워요 추워요",
              )
            }
          />
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🗣️ Phrases prêtes
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Courtes et naturelles. (Idéal pour small talk.)
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
