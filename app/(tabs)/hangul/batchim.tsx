import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

// Optionnel: npx expo install expo-haptics
let Haptics: any = null;
try {
   
  Haptics = require("expo-haptics");
} catch {}

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.68)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";
const NEON = "rgba(34,211,238,0.55)";
const NEON_BG = "rgba(34,211,238,0.14)";
const PINK = "rgba(251,113,133,0.55)";
const PINK_BG = "rgba(251,113,133,0.12)";
const ACTIVE_BG = "rgba(34,211,238,0.22)";
const ACTIVE_BORDER = "rgba(34,211,238,0.75)";

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
        borderRadius: 16,
        alignItems: "center",
        ...style,
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function PillButton({
  label,
  active,
  onPress,
  disabled,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        alignItems: "center",
        backgroundColor: active ? ACTIVE_BG : "rgba(255,255,255,0.05)",
        borderColor: active ? ACTIVE_BORDER : LINE,
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: "rgba(255,255,255,0.05)",
      })}
    >
      <Text style={{ color: TXT, fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}

type QuizChoice = {
  label: string; // ce que l'utilisateur voit
  value: string; // valeur "phonétique" interne (ou label aussi)
};

type QuizItem = {
  id: string;
  prompt: string;
  say: string; // TTS
  choices: QuizChoice[];
  correctIndex: number;
  explain: string;
};

function Quiz({
  title,
  subtitle,
  items,
  settings,
}: {
  title: string;
  subtitle: string;
  items: QuizItem[];
  settings: { rate: number; gapMs: number; repeat: 1 | 2 };
}) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [order, setOrder] = React.useState<number[]>(() =>
    items.map((_, i) => i),
  );

  const item = items[order[index]];

  const speakOnce = React.useCallback(
    (text: string) => {
      Speech.stop();
      Speech.speak(text, {
        language: "ko-KR",
        rate: settings.rate,
        pitch: 1.0,
      });
    },
    [settings.rate],
  );

  const speakTwice = React.useCallback(
    (text: string) => {
      Speech.stop();
      Speech.speak(text, {
        language: "ko-KR",
        rate: settings.rate,
        pitch: 1.0,
        onDone: () => {
          if (settings.repeat === 2) {
            setTimeout(() => {
              Speech.speak(text, {
                language: "ko-KR",
                rate: settings.rate,
                pitch: 1.0,
              });
            }, settings.gapMs);
          }
        },
      });
    },
    [settings.gapMs, settings.rate, settings.repeat],
  );

  const next = () => {
    setSelected(null);
    setShowAnswer(false);
    setIndex((i) => (i + 1) % items.length);
  };

  const newRandom = () => {
    const nextIndex = Math.floor(Math.random() * items.length);
    setSelected(null);
    setShowAnswer(false);
    setIndex(nextIndex);
  };

  const shuffleOrder = () => {
    const arr = items.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr);
    setIndex(0);
    setSelected(null);
    setShowAnswer(false);
  };

  return (
    <Card>
      <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
        {title}
      </Text>
      <Text style={{ color: MUTED, marginTop: 6 }}>{subtitle}</Text>

      <View style={{ height: 10 }} />

      <Text style={{ color: MUTED, fontWeight: "800" }}>
        Question {index + 1}/{items.length}
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
        <Text style={{ color: MUTED, marginTop: 6 }}>
          Appuie sur “Écouter”, puis choisis la prononciation la plus proche.
        </Text>

        <View style={{ height: 12 }} />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Button label="🔊 Écouter" onPress={() => speakTwice(item.say)} />
          <Button tone="ghost" label="🔁 Nouveau" onPress={newRandom} />
          <Button tone="ghost" label="🔀 Mélanger" onPress={shuffleOrder} />
        </View>

        <View style={{ height: 12 }} />

        {item.choices.map((c, i) => {
          const isSel = selected === i;
          const isCorrect = i === item.correctIndex;

          const borderColor =
            showAnswer && isCorrect
              ? NEON
              : showAnswer && isSel && !isCorrect
                ? PINK
                : isSel
                  ? "rgba(255,255,255,0.35)"
                  : LINE;

          const backgroundColor =
            showAnswer && isCorrect
              ? "rgba(34,211,238,0.10)"
              : showAnswer && isSel && !isCorrect
                ? "rgba(251,113,133,0.10)"
                : "rgba(255,255,255,0.04)";

          return (
            <Pressable
              key={`${item.id}_${i}`}
              disabled={showAnswer}
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
                {c.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={{ height: 12 }} />

        <Button
          tone="ghost"
          label={showAnswer ? "Réponse affichée" : "✅ Vérifier"}
          disabled={selected === null || showAnswer}
          onPress={() => setShowAnswer(true)}
        />

        {showAnswer && (
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
                Réponse : {item.choices[item.correctIndex].label}
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

type PairItem = {
  id: string;
  base: string; // forme écrite
  linked?: string; // forme avec voyelle suivante (liaison)
  sayBase: string; // TTS pour base
  sayLinked?: string; // TTS pour liaison
  hint: string; // règle courte
  phonBase: string; // prononciation type [..]
  phonLinked?: string; // prononciation en liaison
};

export default function BatchimModule() {
  // ===== Controls globaux =====
  const [rate, setRate] = React.useState<0.75 | 0.85 | 0.92>(0.85);
  const [gapMs, setGapMs] = React.useState<200 | 320 | 420>(320);
  const [repeatCount, setRepeatCount] = React.useState<1 | 2>(1);

  // ===== Audio state =====
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const haptic = React.useCallback(async () => {
    try {
      if (Haptics?.selectionAsync) await Haptics.selectionAsync();
    } catch {}
  }, []);

  const stopAll = React.useCallback(async () => {
    Speech.stop();
    setIsSpeaking(false);
    await haptic();
  }, [haptic]);

  // Queue séquencée fiable pour "écouter tout"
  const speakParts = React.useCallback(
    (parts: string[], opts?: { repeat?: number; onDoneAll?: () => void }) => {
      const repeat = opts?.repeat ?? 1;

      Speech.stop();
      setIsSpeaking(true);

      let i = 0;

      const step = () => {
        if (i >= parts.length) {
          setIsSpeaking(false);
          opts?.onDoneAll?.();
          return;
        }

        const p = parts[i];

        Speech.speak(p, {
          language: "ko-KR",
          rate,
          pitch: 1.0,
          onDone: () => {
            if (repeat === 2) {
              setTimeout(() => {
                Speech.speak(p, {
                  language: "ko-KR",
                  rate,
                  pitch: 1.0,
                  onDone: () => {
                    i += 1;
                    setTimeout(step, gapMs);
                  },
                  onStopped: () => setIsSpeaking(false),
                  onError: () => setIsSpeaking(false),
                });
              }, gapMs);
              return;
            }

            i += 1;
            setTimeout(step, gapMs);
          },
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      };

      step();
    },
    [gapMs, rate],
  );

  const speakOne = React.useCallback(
    async (text: string) => {
      await haptic();
      Speech.stop();
      setIsSpeaking(true);

      Speech.speak(text, {
        language: "ko-KR",
        rate,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    },
    [haptic, rate],
  );

  // ===== DATA =====

  // 7 sons finaux (mini cours)
  const sevenFinals = [
    { k: "ㄱ", desc: "k coupé", ex: "책 [chaek] → [chaek̚]" },
    { k: "ㄴ", desc: "n", ex: "문 [mun]" },
    { k: "ㄷ", desc: "t coupé", ex: "옷 [ot̚]" },
    { k: "ㄹ", desc: "l", ex: "달 [dal]" },
    { k: "ㅁ", desc: "m", ex: "밤 [bam]" },
    { k: "ㅂ", desc: "p coupé", ex: "밥 [bap̚]" },
    { k: "ㅇ", desc: "ng", ex: "방 [bang]" },
  ];

  // Simples (exemples)
  const batchimSimple = ["밥", "집", "문", "한국", "책", "꽃"];

  // Doubles / clusters (exemples)
  const batchimCluster = ["읽다", "없다", "앉다", "값", "닭", "많다"];

  // Liaison / coupure (paires)
  const pairs: PairItem[] = [
    {
      id: "p1",
      base: "옷",
      linked: "옷이",
      sayBase: "옷",
      sayLinked: "옷이",
      hint: "Finale ㅅ/ㅈ/ㅊ/ㅆ → souvent ‘t’ (ㄷ final). En liaison, ça redevient ‘s/j/ch/ss’ selon la consonne.",
      phonBase: "[ot̚]",
      phonLinked: "[o-si]",
    },
    {
      id: "p2",
      base: "낮",
      linked: "낮에",
      sayBase: "낮",
      sayLinked: "낮에",
      hint: "ㅈ final → ‘t’ coupé. Avec voyelle suivante, liaison → ‘j’.",
      phonBase: "[nat̚]",
      phonLinked: "[na-je]",
    },
    {
      id: "p3",
      base: "꽃",
      linked: "꽃이",
      sayBase: "꽃",
      sayLinked: "꽃이",
      hint: "ㅊ final → ‘t’ coupé. En liaison, peut se ré-entendre.",
      phonBase: "[kkot̚]",
      phonLinked: "[kko-chi]",
    },
    {
      id: "p4",
      base: "값",
      linked: "값이",
      sayBase: "값",
      sayLinked: "값이",
      hint: "ㅄ : souvent seul ㅂ ressort en finale. Avec voyelle, la seconde consonne peut apparaître en liaison.",
      phonBase: "[kap̚]",
      phonLinked: "[gap-si]",
    },
  ];

  // Quiz lecture réelle (3 choix propres, sans annotations dans les choices)
  const batchimQuiz: QuizItem[] = [
    {
      id: "b1",
      prompt: "Écoute : quelle prononciation est la plus proche ?",
      say: "읽다",
      choices: [
        { label: "일다  [ilda]", value: "ilda" },
        { label: "익다  [ikda]", value: "ikda" },
        { label: "익따  [ik-tta]", value: "iktta" },
      ],
      correctIndex: 2,
      explain:
        "읽다 → 익따 : ㄺ + ㄷ → ㄱ ressort + ㄷ se tend (ㄸ). (Lecture réelle / tensification)",
    },
    {
      id: "b2",
      prompt: "Écoute : quelle prononciation est la plus proche ?",
      say: "없다",
      choices: [
        { label: "업다  [eop-da]", value: "eopda" },
        { label: "업따  [eop-tta]", value: "eoptta" },
        { label: "어따  [eo-tta]", value: "eotta" },
      ],
      correctIndex: 1,
      explain: "없다 → 업따 : 받침 ㅂ + ㄷ → ㄸ (tensification).",
    },
    {
      id: "b3",
      prompt: "Écoute : quelle prononciation est la plus proche ?",
      say: "앉다",
      choices: [
        { label: "안다  [an-da]", value: "anda" },
        { label: "안따  [an-tta]", value: "antta" },
        { label: "앋다  [at-da]", value: "atda" },
      ],
      correctIndex: 1,
      explain: "앉다 → 안따 : ㄵ + ㄷ → ㄴ 유지 + ㄷ→ㄸ (tensification).",
    },
    {
      id: "b4",
      prompt: "Écoute : quelle prononciation est la plus proche ?",
      say: "한국말",
      choices: [
        { label: "한궁말  [han-gung-mal]", value: "hangungmal" },
        { label: "한굳말  [han-gut-mal]", value: "hangutmal" },
        { label: "한군말  [han-gun-mal]", value: "hangunmal" },
      ],
      correctIndex: 0,
      explain: "한국말 → 한궁말 : ㄱ + ㅁ → ㅇ (nasalisation).",
    },
    {
      id: "b5",
      prompt: "Écoute : quelle prononciation est la plus proche ?",
      say: "합니다",
      choices: [
        { label: "함니다  [ham-ni-da]", value: "hamnida" },
        { label: "합니다  [hap-ni-da]", value: "hapnida" },
        { label: "합니다  [hab-ni-da]", value: "habnida" },
      ],
      correctIndex: 0,
      explain: "합니다 → 함니다 : ㅂ + ㄴ → ㅁ (nasalisation).",
    },
  ];

  // Quiz finales coupées (notation phonétique au lieu de faux mots)
  const finalCutQuiz: QuizItem[] = [
    {
      id: "fc1",
      prompt: "Finale coupée : quelle prononciation est la plus proche ?",
      say: "옷",
      choices: [
        { label: "옷 → [os] (soufflé)", value: "os" },
        { label: "옷 → [ot̚] (coupé)", value: "ot" },
        { label: "옷 → [oʃ] (ch)", value: "osh" },
      ],
      correctIndex: 1,
      explain:
        "받침 ㅅ/ㅈ/ㅊ/ㅆ se neutralisent souvent en ‘t’ (ㄷ final), sans souffle final.",
    },
    {
      id: "fc2",
      prompt: "Finale coupée : quelle prononciation est la plus proche ?",
      say: "낮",
      choices: [
        { label: "낮 → [naj] (j final audible)", value: "naj" },
        { label: "낮 → [nat̚] (coupé)", value: "nat" },
        { label: "낮 → [nan] (n)", value: "nan" },
      ],
      correctIndex: 1,
      explain: "받침 ㅈ → ‘t’ (ㄷ final) en finale.",
    },
    {
      id: "fc3",
      prompt: "Finale coupée : quelle prononciation est la plus proche ?",
      say: "꽃",
      choices: [
        { label: "꽃 → [kkot̚] (coupé)", value: "kkot" },
        { label: "꽃 → [kkoch] (ch final)", value: "kkoch" },
        { label: "꽃 → [kkon] (n)", value: "kkon" },
      ],
      correctIndex: 0,
      explain: "받침 ㅊ → ‘t’ (ㄷ final) en finale (son coupé).",
    },
    {
      id: "fc4",
      prompt: "Liaison : si une voyelle suit, le son peut “sauter”",
      say: "옷이",
      choices: [
        { label: "옷이 → [o-si] (liaison)", value: "osi" },
        { label: "옷이 → [ot-i] (coupé + i)", value: "oti" },
        { label: "옷이 → [o-chi]", value: "ochi" },
      ],
      correctIndex: 0,
      explain: "옷이 → 오시 : ㅅ final se lie à la voyelle suivante → ‘s’.",
    },
  ];

  // ===== UI =====
  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Link href="/hangul" asChild>
          <Pressable style={{ paddingVertical: 8 }} hitSlop={10}>
            <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
          </Pressable>
        </Link>

        <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
          Batchim — cours + exercices
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Clique un mot → écoute. Puis fais les quiz de lecture réelle. Le point
          clé :
          <Text style={{ color: TXT, fontWeight: "900" }}>
            {" "}
            finale souvent “coupée”
          </Text>
          , et
          <Text style={{ color: TXT, fontWeight: "900" }}> liaison</Text> si une
          voyelle suit.
        </Text>

        <View style={{ height: 12 }} />

        {/* Controls globaux */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>
            🎛️ Réglages audio
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Ralentis et répète x2 pour bien entendre la coupure.
          </Text>

          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <PillButton
              label={`Vitesse : ${rate}`}
              active
              onPress={async () => {
                await haptic();
                setRate((r) => (r === 0.75 ? 0.85 : r === 0.85 ? 0.92 : 0.75));
              }}
            />
            <PillButton
              label={`Pause : ${gapMs}ms`}
              active
              onPress={async () => {
                await haptic();
                setGapMs((g) => (g === 200 ? 320 : g === 320 ? 420 : 200));
              }}
            />
            <PillButton
              label={repeatCount === 2 ? "Répéter : x2" : "Répéter : x1"}
              active={repeatCount === 2}
              onPress={async () => {
                await haptic();
                setRepeatCount((c) => (c === 1 ? 2 : 1));
              }}
            />
            {!isSpeaking ? (
              <PillButton label="⏹ Stop" onPress={stopAll} disabled />
            ) : (
              <PillButton label="⏹ Stop" onPress={stopAll} />
            )}
          </View>
        </Card>

        {/* Mini cours: 7 sons finaux */}
        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            Mini-cours — Les 7 sons finaux
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            En finale, beaucoup de consonnes se “neutralisent” vers 7 sons.
            Objectif : reconnaître la catégorie (k/t/p/n/m/ng/l) plutôt que
            chaque lettre.
          </Text>

          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {sevenFinals.map((x) => (
              <Pressable
                key={x.k}
                onPress={() => speakOne(x.k)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                })}
              >
                <Text style={{ color: TXT, fontWeight: "900" }}>
                  {x.k} — {x.desc}
                </Text>
                <Text style={{ color: MUTED, marginTop: 4, fontWeight: "700" }}>
                  {x.ex}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Batchim simples */}
        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            Batchim (simples)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            La consonne finale est “coupée” (pas de souffle final).
          </Text>

          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {batchimSimple.map((x) => (
              <Chip key={x} label={x} onPress={() => speakOne(x)} />
            ))}
          </View>

          <View style={{ height: 12 }} />

          {!isSpeaking ? (
            <Button
              tone="ghost"
              label="🔊 Écouter tout (simples, séquencé)"
              onPress={() => speakParts(batchimSimple, { repeat: repeatCount })}
            />
          ) : (
            <Button tone="danger" label="⏹ Stop audio" onPress={stopAll} />
          )}
        </Card>

        {/* Batchim doubles / clusters */}
        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            Batchim doubles (clusters)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Une partie disparaît souvent en finale, sauf si une voyelle suit
            (liaison).
          </Text>

          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {batchimCluster.map((x) => (
              <Chip key={x} label={x} onPress={() => speakOne(x)} />
            ))}
          </View>

          <View style={{ height: 12 }} />

          {!isSpeaking ? (
            <Button
              tone="ghost"
              label="🔊 Écouter tout (clusters, séquencé)"
              onPress={() =>
                speakParts(batchimCluster, { repeat: repeatCount })
              }
            />
          ) : (
            <Button tone="danger" label="⏹ Stop audio" onPress={stopAll} />
          )}
        </Card>

        {/* Liaison vs coupure */}
        <Card>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            Exercice guidé — Coupure vs liaison
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Compare “mot seul” vs “mot + voyelle”. C’est le déclencheur n°1 pour
            comprendre les batchim.
          </Text>

          <View style={{ height: 12 }} />

          {pairs.map((p) => (
            <View
              key={p.id}
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: LINE,
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
                {p.base} <Text style={{ color: MUTED }}> {p.phonBase}</Text>
                {p.linked ? (
                  <>
                    <Text style={{ color: MUTED }}> → </Text>
                    <Text style={{ color: TXT, fontWeight: "900" }}>
                      {p.linked}
                    </Text>
                    <Text style={{ color: MUTED }}> {p.phonLinked}</Text>
                  </>
                ) : null}
              </Text>

              <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
                {p.hint}
              </Text>

              <View style={{ height: 10 }} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <Button
                  label="🔊 Mot seul"
                  onPress={() => speakOne(p.sayBase)}
                  disabled={isSpeaking}
                />
                {!!p.sayLinked && (
                  <Button
                    tone="ghost"
                    label="🔊 + Voyelle"
                    onPress={() => speakOne(p.sayLinked!)}
                    disabled={isSpeaking}
                  />
                )}
                <Button tone="danger" label="⏹ Stop" onPress={stopAll} />
              </View>
            </View>
          ))}
        </Card>

        {/* Quiz lecture réelle */}
        <Quiz
          title="Exercice — Batchim (lecture réelle)"
          subtitle="Écoute un mot courant et choisis la prononciation la plus proche."
          items={batchimQuiz}
          settings={{ rate, gapMs, repeat: repeatCount }}
        />

        {/* Quiz finales coupées */}
        <Quiz
          title="Mini-exercice — Finales coupées (받침)"
          subtitle="Quand ㅅ/ㅈ/ㅊ/ㅆ sont en finale, le son est souvent ‘t’ (ㄷ final), sauf liaison."
          items={finalCutQuiz}
          settings={{ rate, gapMs, repeat: repeatCount }}
        />

        <Card>
          <Button tone="danger" label="⏹ Stop audio" onPress={stopAll} />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
