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
        Appuie sur “Écouter”, puis choisis la bonne réponse.
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

export default function Travel() {
  const speak = React.useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ko-KR", rate: 0.92, pitch: 1.0 });
  }, []);

  // ✅ Essentiels (voyage “survie” en vocab)
  const essentials = [
    { kr: "여행", fr: "voyage", say: "여행" },
    { kr: "공항", fr: "aéroport", say: "공항" },
    { kr: "비행기", fr: "avion", say: "비행기" },
    { kr: "여권", fr: "passeport", say: "여권" },
    { kr: "짐", fr: "bagages", say: "짐" },
    { kr: "호텔", fr: "hôtel", say: "호텔" },
    { kr: "예약", fr: "réservation", say: "예약" },
    { kr: "지도", fr: "carte", say: "지도" },
    { kr: "주소", fr: "adresse", say: "주소" },
    { kr: "화장실", fr: "toilettes", say: "화장실" },
    { kr: "표", fr: "billet", say: "표" },
    { kr: "현금", fr: "argent liquide", say: "현금" },
  ] as const;

  // ✅ Phrases courtes (vocab + usage minimal)
  const phrases = [
    {
      kr: "여권이 어디 있어요?",
      fr: "Où est mon passeport ?",
      say: "여권이 어디 있어요?",
    },
    { kr: "예약했어요.", fr: "J’ai réservé.", say: "예약했어요." },
    {
      kr: "체크인 어디예요?",
      fr: "Où est le check-in ?",
      say: "체크인 어디예요?",
    },
    {
      kr: "화장실 어디예요?",
      fr: "Où sont les toilettes ?",
      say: "화장실 어디예요?",
    },
    {
      kr: "이 주소로 가 주세요.",
      fr: "S’il vous plaît, allez à cette adresse.",
      say: "이 주소로 가 주세요.",
    },
  ];

  // ✅ Quiz écoute
  const quizItems: QuizItem[] = [
    {
      id: "q1",
      prompt: "Quel mot veut dire “passeport” ?",
      say: "여권",
      choices: ["여권", "예약"],
      correctIndex: 0,
      explain: "여권 = passeport. 예약 = réservation.",
    },
    {
      id: "q2",
      prompt: "Quel mot veut dire “toilettes” ?",
      say: "화장실",
      choices: ["화장실", "지도"],
      correctIndex: 0,
      explain: "화장실 = toilettes. 지도 = carte.",
    },
    {
      id: "q3",
      prompt: "Quelle phrase signifie “J’ai réservé” ?",
      say: "예약했어요",
      choices: ["예약했어요", "표가 있어요"],
      correctIndex: 0,
      explain: "예약 = réservation ; 예약했어요 = j’ai réservé.",
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
          Voyage (여행)
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Vocab survie + phrases courtes utiles (aéroport, hôtel, déplacements).
        </Text>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🧳 Essentiels
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Les mots à connaître pour survivre dès le jour 1.
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
                "여행 공항 비행기 여권 짐 호텔 예약 지도 주소 화장실 표 현금",
              )
            }
          />
        </Card>

        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🗣️ Phrases courtes
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Très courtes, très utiles. (Encore “vocab usage”, pas un scénario
            complet.)
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
