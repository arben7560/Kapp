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
        minWidth: 110,
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
        Appuie sur “Écouter”, puis choisis l’objet correct.
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

export default function DailyObjects() {
  const speak = React.useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ko-KR", rate: 0.92, pitch: 1.0 });
  }, []);

  // ✅ Vocab “core” (très utile)
  const essentials = [
    { kr: "휴대폰", fr: "téléphone", say: "휴대폰" },
    { kr: "지갑", fr: "portefeuille", say: "지갑" },
    { kr: "열쇠", fr: "clé(s)", say: "열쇠" },
    { kr: "가방", fr: "sac", say: "가방" },
    { kr: "우산", fr: "parapluie", say: "우산" },
    { kr: "물", fr: "eau", say: "물" },
    { kr: "컵", fr: "tasse/verre", say: "컵" },
    { kr: "책", fr: "livre", say: "책" },
    { kr: "노트", fr: "cahier", say: "노트" },
    { kr: "펜", fr: "stylo", say: "펜" },
    { kr: "충전기", fr: "chargeur", say: "충전기" },
    { kr: "이어폰", fr: "écouteurs", say: "이어폰" },
  ] as const;

  // ✅ Phrases courtes (vocab + usage minimal, pas “module dialogues”)
  const phrases = [
    { kr: "이거 뭐예요?", fr: "C’est quoi, ça ?", say: "이거 뭐예요?" },
    {
      kr: "제 휴대폰이에요.",
      fr: "C’est mon téléphone.",
      say: "제 휴대폰이에요.",
    },
    {
      kr: "지갑이 없어요.",
      fr: "Je n’ai pas mon portefeuille.",
      say: "지갑이 없어요.",
    },
    {
      kr: "열쇠 어디 있어요?",
      fr: "Où sont les clés ?",
      say: "열쇠 어디 있어요?",
    },
    { kr: "충전기 있어요?", fr: "Tu as un chargeur ?", say: "충전기 있어요?" },
  ];

  // ✅ Quiz écoute : objet ou phrase la plus proche
  const quizItems: QuizItem[] = [
    {
      id: "q1",
      prompt: "Quel mot veux dire “parapluie” ?",
      say: "우산",
      choices: ["우산", "지갑"],
      correctIndex: 0,
      explain: "우산 = parapluie. Très utile avec la météo.",
    },
    {
      id: "q2",
      prompt: "Quel mot veux dire “chargeur” ?",
      say: "충전기",
      choices: ["충전기", "이어폰"],
      correctIndex: 0,
      explain: "충전 = charger ; 충전기 = chargeur (machine/objet).",
    },
    {
      id: "q3",
      prompt: "Quelle phrase signifie “Je n’ai pas mon portefeuille” ?",
      say: "지갑이 없어요",
      choices: ["지갑이 없어요", "이거 뭐예요?"],
      correctIndex: 0,
      explain: "~이/가 없어요 = je n’ai pas / il n’y a pas.",
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
          Objets du quotidien
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Mots ultra fréquents + phrases courtes. Tap pour écouter et répéter.
        </Text>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🎒 Essentiels
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Les 10–15 objets les plus utiles au quotidien (sac, métro, café…).
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
              speak("휴대폰 지갑 열쇠 가방 우산 물 컵 책 노트 펜 충전기 이어폰")
            }
          />
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🗣️ Phrases courtes
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Juste assez pour utiliser le vocab dans la vraie vie.
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
