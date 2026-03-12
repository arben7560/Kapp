import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";
const CARD2 = "rgba(255,255,255,0.09)";
const NEON = "rgba(34,211,238,0.55)";
const NEON_BG = "rgba(34,211,238,0.14)";
const PINK = "rgba(251,113,133,0.45)";
const PINK_BG = "rgba(251,113,133,0.12)";

// (Optionnel) TTS : npx expo install expo-speech
let Speech: any = null;
try {
  Speech = require("expo-speech");
} catch {}

type TabKey = "Essentiels" | "Itinéraire" | "Sorties" | "Dialogues" | "Quiz";

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

function Badge({
  text,
  tone = "neon",
}: {
  text: string;
  tone?: "neon" | "pink" | "ghost";
}) {
  const bg =
    tone === "neon"
      ? "rgba(34,211,238,0.10)"
      : tone === "pink"
        ? "rgba(251,113,133,0.10)"
        : "rgba(255,255,255,0.06)";
  const border =
    tone === "neon"
      ? "rgba(34,211,238,0.35)"
      : tone === "pink"
        ? "rgba(251,113,133,0.28)"
        : LINE;

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: bg,
      }}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        {text}
      </Text>
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

function Tab({
  label,
  active,
  onPress,
}: {
  label: TabKey;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "rgba(34,211,238,0.65)" : LINE,
        backgroundColor: active
          ? "rgba(34,211,238,0.12)"
          : "rgba(255,255,255,0.05)",
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function RowItem({
  left,
  right,
  sub,
  onPress,
}: {
  left: string;
  right: string;
  sub?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: "rgba(255,255,255,0.04)",
        marginTop: 10,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
          {left}
        </Text>
        <Text style={{ color: MUTED, fontWeight: "900", fontSize: 14 }}>
          {right}
        </Text>
      </View>
      {!!sub && (
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 18 }}>
          {sub}
        </Text>
      )}
    </Pressable>
  );
}

function speakKo(text: string, rate = 0.9) {
  if (!Speech) return;
  Speech.stop();
  Speech.speak(text, { language: "ko-KR", rate, pitch: 1.0 });
}

type Vocab = {
  kr: string;
  fr: string;
  roman?: string;
  note?: string;
  say?: string;
  tags?: ("débutant" | "intermédiaire" | "annonce" | "signalétique")[];
};

type DialogueLine = {
  who: "Toi" | "Agent" | "Passant" | "Annonce";
  kr: string;
  fr: string;
  roman?: string;
  say?: string;
  tip?: string;
};

type QuizQ = {
  id: string;
  prompt: string;
  say: string; // TTS
  choices: string[];
  correctIndex: number;
  explain: string;
};

export default function MetroLesson() {
  const params = useLocalSearchParams();
  const lessonId = String(params?.lessonId ?? params?.id ?? "metro_line2");

  const [tab, setTab] = useState<TabKey>("Essentiels");

  // --- “Skin” selon ligne (très simple, juste du texte / badges)
  const lessonMeta = useMemo(() => {
    const map: Record<
      string,
      { title: string; subtitle: string; lineLabel: string; vibe: string }
    > = {
      metro_line2: {
        title: "Métro — Line 2 (cercle)",
        subtitle:
          "Directions, correspondances, sorties (출구), et dialogues utiles.",
        lineLabel: "Line 2",
        vibe: "Trajets fréquents (Hongdae ↔ City Hall ↔ Gangnam).",
      },
      metro_generic: {
        title: "Métro — Essentials",
        subtitle: "Les phrases qui te sauvent partout dans Séoul.",
        lineLabel: "Métro",
        vibe: "Mode universel.",
      },
    };
    return map[lessonId] ?? map.metro_generic;
  }, [lessonId]);

  const essentials = useMemo<Vocab[]>(
    () => [
      {
        kr: "지하철",
        fr: "métro",
        roman: "jihacheol",
        tags: ["débutant"],
        say: "지하철",
      },
      {
        kr: "노선",
        fr: "ligne",
        roman: "noseon",
        tags: ["débutant"],
        say: "노선",
      },
      {
        kr: "2호선",
        fr: "ligne 2",
        roman: "i-ho-seon",
        tags: ["débutant"],
        say: "이호선",
      },
      {
        kr: "환승",
        fr: "correspondance",
        roman: "hwanseung",
        tags: ["débutant"],
        say: "환승",
      },
      {
        kr: "방향",
        fr: "direction",
        roman: "banghyang",
        tags: ["débutant"],
        say: "방향",
      },
      {
        kr: "출구",
        fr: "sortie (numéro)",
        roman: "chulgu",
        tags: ["débutant"],
        say: "출구",
      },
      {
        kr: "몇 번 출구예요?",
        fr: "C’est la sortie numéro combien ?",
        roman: "myeot beon chulguyeyo?",
        tags: ["débutant"],
        say: "몇 번 출구예요?",
      },
      {
        kr: "여기서 갈아타요",
        fr: "On change ici (correspondance).",
        roman: "yeogiseo garatayo",
        tags: ["débutant"],
        say: "여기서 갈아타요",
      },
      {
        kr: "반대 방향",
        fr: "direction opposée",
        roman: "bandae banghyang",
        tags: ["intermédiaire"],
        say: "반대 방향",
      },
      {
        kr: "급행",
        fr: "express",
        roman: "geuphaeng",
        tags: ["intermédiaire"],
        say: "급행",
      },
      {
        kr: "종착역",
        fr: "terminus",
        roman: "jongchag-yeok",
        tags: ["intermédiaire", "annonce"],
        say: "종착역",
      },
      {
        kr: "다음 역",
        fr: "prochaine station",
        roman: "daeum yeok",
        tags: ["débutant", "annonce"],
        say: "다음 역",
      },
      {
        kr: "내리실 문은 오른쪽입니다",
        fr: "Les portes s’ouvrent à droite.",
        roman: "naerisil muneun oreunjjog-imnida",
        tags: ["intermédiaire", "annonce"],
        say: "내리실 문은 오른쪽입니다",
      },
    ],
    [],
  );

  // Itinéraire = “mini-plan” de décisions (débutant → intermédiaire)
  const routeSteps = useMemo(
    () => [
      {
        title: "1) Trouver la bonne ligne",
        kr: "2호선(초록색) 타세요",
        fr: "Prenez la ligne 2 (verte).",
        tip: "Dans Séoul, les lignes ont une couleur. 2호선 est souvent verte.",
        say: "이호선 타세요",
      },
      {
        title: "2) Vérifier la direction (terminus)",
        kr: "○○행(방향) 맞아요?",
        fr: "C’est bien en direction de ○○ ?",
        tip: "La direction est souvent indiquée par le terminus (…행).",
        say: "강남행 맞아요?",
      },
      {
        title: "3) Faire une correspondance",
        kr: "환승은 어디예요?",
        fr: "La correspondance, c’est où ?",
        tip: "환승 = correspondance. Ajoute la ligne: ‘9호선 환승…’",
        say: "환승은 어디예요?",
      },
      {
        title: "4) Sorties (출구) : choisir la bonne",
        kr: "몇 번 출구로 나가요?",
        fr: "Je sors par quelle sortie ?",
        tip: "En Corée, les sorties numérotées sont cruciales. On te répond ‘2번/3번…’",
        say: "몇 번 출구로 나가요?",
      },
    ],
    [],
  );

  const exitTrainer = useMemo(
    () => [
      {
        area: "Station (exemple)",
        exits: [
          {
            out: "2번 출구",
            fr: "sortie 2",
            hint: "vers café / bus stop",
            say: "이번 출구",
          },
          {
            out: "8번 출구",
            fr: "sortie 8",
            hint: "vers shopping street",
            say: "팔번 출구",
          },
          {
            out: "11번 출구",
            fr: "sortie 11",
            hint: "vers parc / office",
            say: "십일번 출구",
          },
        ],
      },
      {
        area: "Directions rapides",
        exits: [
          { out: "왼쪽", fr: "à gauche", hint: "왼쪽으로 가세요", say: "왼쪽" },
          {
            out: "오른쪽",
            fr: "à droite",
            hint: "오른쪽으로 가세요",
            say: "오른쪽",
          },
          { out: "직진", fr: "tout droit", hint: "쭉 가세요", say: "직진" },
        ],
      },
    ],
    [],
  );

  const dialogues = useMemo<DialogueLine[]>(
    () => [
      {
        who: "Toi",
        kr: "저기요, 2호선 어디에서 타요?",
        fr: "Excusez-moi, où est-ce que je prends la ligne 2 ?",
        roman: "jeogiyo, i-hoseon eodieseo tayo?",
        say: "저기요, 이호선 어디에서 타요?",
      },
      {
        who: "Passant",
        kr: "저쪽으로 가서 내려가면 돼요.",
        fr: "Allez par là-bas et descendez (les escaliers).",
        roman: "jeojjogeuro gaseo naeryeogamyeon dwaeyo",
        say: "저쪽으로 가서 내려가면 돼요.",
        tip: "‘~면 돼요’ = ‘il suffit de…’ (super utile).",
      },
      {
        who: "Toi",
        kr: "강남 방향 맞아요?",
        fr: "C’est bien direction Gangnam ?",
        roman: "gangnam banghyang majayo?",
        say: "강남 방향 맞아요?",
      },
      {
        who: "Agent",
        kr: "네, 이쪽 플랫폼이에요. 반대는 저쪽이에요.",
        fr: "Oui, c’est ce quai-ci. L’autre direction est là-bas.",
        roman: "ne, ijjok peullaetpomieyo. bandaeneun jeojjogieyo.",
        say: "네, 이쪽 플랫폼이에요. 반대는 저쪽이에요.",
      },
      {
        who: "Annonce",
        kr: "다음 역은 시청, 시청역입니다.",
        fr: "Prochaine station : City Hall (Si-cheong).",
        roman: "daeum yeogeun sichyeong, sichyeong-yeog-imnida",
        say: "다음 역은 시청, 시청역입니다.",
        tip: "Pattern d’annonce très courant : ‘다음 역은 …입니다’.",
      },
      {
        who: "Toi",
        kr: "몇 번 출구로 나가야 해요?",
        fr: "Je dois sortir par quelle sortie ?",
        roman: "myeot beon chulguro nagaya haeyo?",
        say: "몇 번 출구로 나가야 해요?",
      },
      {
        who: "Passant",
        kr: "2번 출구로 나가세요.",
        fr: "Sortez par la sortie 2.",
        roman: "i-beon chulguro nagaseyo",
        say: "이번 출구로 나가세요.",
      },
    ],
    [],
  );

  // Quiz “sans spoiler” : on joue le son, l’utilisateur choisit la phrase/meaning
  const quiz = useMemo<QuizQ[]>(
    () => [
      {
        id: "q1",
        prompt: "Écoute : quelle phrase veut dire “correspondance” ?",
        say: "환승",
        choices: ["환승", "출구", "방향"],
        correctIndex: 0,
        explain: "환승 = correspondance / changer de ligne.",
      },
      {
        id: "q2",
        prompt: "Écoute : quelle phrase veut dire “sortie numéro combien ?”",
        say: "몇 번 출구예요?",
        choices: ["몇 번 출구예요?", "어디에서 타요?", "반대 방향이에요?"],
        correctIndex: 0,
        explain: "몇 번 = quel numéro ; 출구 = sortie.",
      },
      {
        id: "q3",
        prompt: "Écoute : l’annonce dit quoi ?",
        say: "다음 역은 시청, 시청역입니다",
        choices: [
          "Les portes s’ouvrent à gauche",
          "Prochaine station : City Hall",
          "Terminus",
        ],
        correctIndex: 1,
        explain: "다음 역은 …입니다 = prochaine station : …",
      },
    ],
    [],
  );

  const [qIndex, setQIndex] = useState(0);
  const [qSelected, setQSelected] = useState<number | null>(null);
  const [qShow, setQShow] = useState(false);
  const q = quiz[qIndex];

  const nextQ = () => {
    setQSelected(null);
    setQShow(false);
    setQIndex((i) => (i + 1) % quiz.length);
  };

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Header */}
        <Pressable
          onPress={() => router.back()}
          style={{ paddingVertical: 8 }}
          hitSlop={10}
        >
          <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
        </Pressable>

        <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
          {lessonMeta.title}
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          {lessonMeta.subtitle}
        </Text>

        <View style={{ height: 10 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Badge text={lessonMeta.lineLabel} tone="neon" />
          <Badge text="Seoul Subway" tone="ghost" />
          <Badge text={lessonMeta.vibe} tone="pink" />
        </View>

        <View style={{ height: 14 }} />

        {/* Tabs */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>
            🗺️ Mode immersif
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Apprends comme si tu étais à Séoul : signes → choix → phrases →
            écoute → mini-quiz.
          </Text>

          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {(
              [
                "Essentiels",
                "Itinéraire",
                "Sorties",
                "Dialogues",
                "Quiz",
              ] as TabKey[]
            ).map((t) => (
              <Tab
                key={t}
                label={t}
                active={tab === t}
                onPress={() => setTab(t)}
              />
            ))}
          </View>
        </Card>

        {/* TAB: Essentiels */}
        {tab === "Essentiels" && (
          <Card>
            <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
              📌 Vocab essentiel
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Tap sur une ligne → tu vois le sens + romanisation + tu peux
              écouter.
            </Text>

            {essentials.map((v, idx) => (
              <View key={`${v.kr}_${idx}`}>
                <RowItem
                  left={v.kr}
                  right={v.fr}
                  sub={[
                    v.roman ? `• ${v.roman}` : "",
                    v.tags?.length ? `• ${v.tags.join(" • ")}` : "",
                    v.note ? `• ${v.note}` : "",
                  ]
                    .filter(Boolean)
                    .join("\n")}
                  onPress={() => speakKo(v.say ?? v.kr, 0.9)}
                />
              </View>
            ))}

            <View style={{ height: 12 }} />
            <Button
              label="🔊 Écouter pack (rapide)"
              onPress={() =>
                speakKo("지하철 노선 환승 방향 출구 몇 번 출구예요", 0.9)
              }
            />
            <View style={{ height: 10 }} />
            <Button
              tone="danger"
              label="⏹ Stop audio"
              onPress={() => Speech?.stop?.()}
            />
          </Card>
        )}

        {/* TAB: Itinéraire */}
        {tab === "Itinéraire" && (
          <Card>
            <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
              🧭 Itinéraire guidé
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              4 étapes “comme en vrai”. Lis → écoute → répète.
            </Text>

            {routeSteps.map((s, idx) => (
              <View
                key={idx}
                style={{
                  marginTop: 10,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: 12,
                }}
              >
                <Text style={{ color: TXT, fontWeight: "900" }}>{s.title}</Text>
                <Text
                  style={{
                    color: TXT,
                    marginTop: 8,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  {s.kr}
                </Text>
                <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
                  {s.fr}
                </Text>
                <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
                  💡 {s.tip}
                </Text>

                <View style={{ height: 10 }} />
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  <Button
                    label="🔊 Écouter"
                    onPress={() => speakKo(s.say ?? s.kr, 0.9)}
                  />
                  <Button
                    tone="ghost"
                    label="🗣️ Répéter x2"
                    onPress={() =>
                      speakKo(`${s.say ?? s.kr}… ${s.say ?? s.kr}`, 0.85)
                    }
                  />
                </View>
              </View>
            ))}
            <View style={{ height: 10 }} />
            <Button
              tone="danger"
              label="⏹ Stop audio"
              onPress={() => Speech?.stop?.()}
            />
          </Card>
        )}

        {/* TAB: Sorties */}
        {tab === "Sorties" && (
          <Card>
            <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
              🚪 Sorties & directions
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              En Corée, la sortie (출구) est la clé. Entraîne-toi avec des
              sorties + directions.
            </Text>

            {exitTrainer.map((block, idx) => (
              <View
                key={idx}
                style={{
                  marginTop: 12,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: TXT, fontWeight: "900" }}>
                    {block.area}
                  </Text>
                  <Badge text="train like IRL" tone="neon" />
                </View>

                {block.exits.map((e, j) => (
                  <RowItem
                    key={j}
                    left={e.out}
                    right={e.fr}
                    sub={e.hint ? `💡 ${e.hint}` : undefined}
                    onPress={() => speakKo(e.say ?? e.out, 0.9)}
                  />
                ))}
              </View>
            ))}

            <View style={{ height: 12 }} />
            <Button
              label="🔊 Drill : sorties"
              onPress={() =>
                speakKo("몇 번 출구예요? 이번 출구 팔번 출구 십일번 출구", 0.85)
              }
            />
            <View style={{ height: 10 }} />
            <Button
              tone="danger"
              label="⏹ Stop audio"
              onPress={() => Speech?.stop?.()}
            />
          </Card>
        )}

        {/* TAB: Dialogues */}
        {tab === "Dialogues" && (
          <Card>
            <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
              💬 Dialogues immersifs
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Mode “roleplay” : lis la ligne, écoute, puis répète. (Très
              efficace pour parler vite en vrai.)
            </Text>

            {dialogues.map((d, idx) => {
              const tone =
                d.who === "Toi"
                  ? "rgba(34,211,238,0.08)"
                  : "rgba(255,255,255,0.04)";
              const border = d.who === "Toi" ? "rgba(34,211,238,0.25)" : LINE;

              return (
                <View
                  key={idx}
                  style={{
                    marginTop: 10,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: tone,
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: TXT, fontWeight: "900" }}>
                      {d.who}
                    </Text>
                    <Badge
                      text={
                        d.who === "Annonce"
                          ? "announcement"
                          : d.who === "Toi"
                            ? "you"
                            : "npc"
                      }
                      tone="ghost"
                    />
                  </View>

                  <Text
                    style={{
                      color: TXT,
                      marginTop: 8,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    {d.kr}
                  </Text>
                  <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
                    {d.fr}
                  </Text>
                  {d.roman && (
                    <Text style={{ color: MUTED, marginTop: 6 }}>
                      {d.roman}
                    </Text>
                  )}
                  {d.tip && (
                    <Text
                      style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}
                    >
                      💡 {d.tip}
                    </Text>
                  )}

                  <View style={{ height: 10 }} />
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                  >
                    <Button
                      label="🔊 Écouter"
                      onPress={() => speakKo(d.say ?? d.kr, 0.9)}
                    />
                    <Button
                      tone="ghost"
                      label="🗣️ Shadow x2"
                      onPress={() =>
                        speakKo(`${d.say ?? d.kr}… ${d.say ?? d.kr}`, 0.85)
                      }
                    />
                  </View>
                </View>
              );
            })}

            <View style={{ height: 10 }} />
            <Button
              tone="danger"
              label="⏹ Stop audio"
              onPress={() => Speech?.stop?.()}
            />
          </Card>
        )}

        {/* TAB: Quiz */}
        {tab === "Quiz" && (
          <Card>
            <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
              🎯 Mini-quiz (sans spoil)
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Appuie sur “Écouter”, puis répond. Pas de highlight automatique.
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
              <Text style={{ color: TXT, fontWeight: "900" }}>
                Question {qIndex + 1}/{quiz.length}
              </Text>
              <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
                {q.prompt}
              </Text>

              <View style={{ height: 12 }} />
              <Button label="🔊 Écouter" onPress={() => speakKo(q.say, 0.9)} />
              <View style={{ height: 12 }} />

              {q.choices.map((c, i) => {
                const isSel = qSelected === i;
                const isCorrect = i === q.correctIndex;

                const borderColor =
                  qShow && isCorrect
                    ? NEON
                    : qShow && isSel && !isCorrect
                      ? PINK
                      : isSel
                        ? "rgba(255,255,255,0.35)"
                        : LINE;

                const backgroundColor =
                  qShow && isCorrect
                    ? "rgba(34,211,238,0.10)"
                    : qShow && isSel && !isCorrect
                      ? "rgba(251,113,133,0.10)"
                      : "rgba(255,255,255,0.04)";

                return (
                  <Pressable
                    key={`${q.id}_${i}`}
                    disabled={qShow}
                    onPress={() => setQSelected(i)}
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
                    <Text
                      style={{ color: TXT, fontWeight: "900", fontSize: 16 }}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}

              <View style={{ height: 12 }} />
              <Button
                tone="ghost"
                label={qShow ? "Réponse affichée" : "✅ Vérifier"}
                disabled={qSelected === null || qShow}
                onPress={() => setQShow(true)}
              />

              {qShow && (
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
                      Réponse : {q.choices[q.correctIndex]}
                    </Text>
                    <Text
                      style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}
                    >
                      {q.explain}
                    </Text>
                  </View>

                  <View style={{ height: 12 }} />
                  <Button label="➡️ Suivant" onPress={nextQ} />
                </>
              )}

              <View style={{ height: 10 }} />
              <Button
                tone="danger"
                label="⏹ Stop audio"
                onPress={() => Speech?.stop?.()}
              />
            </View>
          </Card>
        )}

        {/* Footer */}
        <Card>
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: CARD2,
              padding: 12,
            }}
          >
            <Text style={{ color: TXT, fontWeight: "900" }}>
              ✅ Prochain upgrade recommandé
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Ajoute une “mini-carte métro” (2–3 stations) où l’utilisateur
              choisit : direction → correspondance → sortie, puis un dialogue
              final.
            </Text>
            <View style={{ height: 10 }} />
            <Button label="Retour" onPress={() => router.back()} tone="ghost" />
          </View>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
