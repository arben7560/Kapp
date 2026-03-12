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

export default function Family() {
  const speak = React.useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ko-KR", rate: 0.92, pitch: 1.0 });
  }, []);

  // ✅ Essentiels (A1)
  const essentials = [
    { kr: "가족", fr: "famille", say: "가족" },
    { kr: "부모님", fr: "parents (poli)", say: "부모님" },
    { kr: "엄마", fr: "maman", say: "엄마" },
    { kr: "아빠", fr: "papa", say: "아빠" },
    { kr: "형제", fr: "frères/soeurs", say: "형제" },
    { kr: "오빠", fr: "grand frère (femme→homme)", say: "오빠" },
    { kr: "형", fr: "grand frère (homme→homme)", say: "형" },
    { kr: "누나", fr: "grande soeur (homme→femme)", say: "누나" },
    { kr: "언니", fr: "grande soeur (femme→femme)", say: "언니" },
    { kr: "동생", fr: "petit frère/soeur", say: "동생" },
    { kr: "아들", fr: "fils", say: "아들" },
    { kr: "딸", fr: "fille", say: "딸" },
  ] as const;

  // ✅ Phrases “courtes” (encore vocab, pas scénarios)
  const phrases = [
    { kr: "가족이 있어요.", fr: "J’ai une famille.", say: "가족이 있어요." },
    {
      kr: "부모님은 한국에 있어요.",
      fr: "Mes parents sont en Corée.",
      say: "부모님은 한국에 있어요.",
    },
    {
      kr: "형제가 있어요?",
      fr: "Tu as des frères/soeurs ?",
      say: "형제가 있어요?",
    },
    {
      kr: "저는 동생이 있어요.",
      fr: "J’ai un petit frère/une petite soeur.",
      say: "저는 동생이 있어요.",
    },
    {
      kr: "가족이 몇 명이에요?",
      fr: "Vous êtes combien dans la famille ?",
      say: "가족이 몇 명이에요?",
    },
  ];

  // ✅ Quiz écoute
  const quizItems: QuizItem[] = [
    {
      id: "q1",
      prompt: "Quel mot veut dire “petit frère/petite soeur” ?",
      say: "동생",
      choices: ["동생", "부모님"],
      correctIndex: 0,
      explain: "동생 = cadet(e). 부모님 = parents (poli).",
    },
    {
      id: "q2",
      prompt: "Quel mot veut dire “parents (poli)” ?",
      say: "부모님",
      choices: ["엄마", "부모님"],
      correctIndex: 1,
      explain: "부모님 est poli/neutre (utile dans la conversation).",
    },
    {
      id: "q3",
      prompt: "Quelle phrase signifie “Tu as des frères/soeurs ?”",
      say: "형제가 있어요?",
      choices: ["형제가 있어요?", "가족이 있어요."],
      correctIndex: 0,
      explain: "~가 있어요? = est-ce que tu as… ?",
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
          Famille (가족)
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Vocab essentiel + phrases courtes. Tap pour écouter et répéter.
        </Text>

        <View style={{ height: 14 }} />

        {/* Astuce importante (sans devenir “cours long”) */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>
            💡 Petite nuance utile
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            오빠/형/누나/언니 dépendent de ton genre et de la personne. Pas
            besoin de tout maîtriser aujourd’hui : apprends d’abord “부모님,
            가족, 동생”.
          </Text>
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            👪 Essentiels
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Les mots les plus fréquents pour parler de ta famille.
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
              speak("가족 부모님 엄마 아빠 형제 오빠 형 누나 언니 동생 아들 딸")
            }
          />
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🗣️ Phrases courtes
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Juste assez pour utiliser le vocab dans une conversation simple.
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
