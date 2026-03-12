import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

// (Optionnel) Haptics si tu l'as déjà installé : npx expo install expo-haptics
let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {}

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.68)"; // un poil plus lisible
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";
const NEON = "rgba(34,211,238,0.55)";
const NEON_BG = "rgba(34,211,238,0.14)";
const ACTIVE_BG = "rgba(34,211,238,0.22)";
const ACTIVE_BORDER = "rgba(34,211,238,0.75)";

type Consonant =
  | "ㄱ"
  | "ㄴ"
  | "ㄷ"
  | "ㄹ"
  | "ㅁ"
  | "ㅂ"
  | "ㅅ"
  | "ㅇ"
  | "ㅈ"
  | "ㅎ";

type SampleMeta = {
  label: string; // romanisation hint
  sayParts: string[]; // syllabes jouées séparément
  note?: string; // mini note pédagogique (optionnel)
};

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

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
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
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: "center",
        backgroundColor: NEON_BG,
        borderColor: NEON,
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderColor: LINE,
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: "center",
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Tile({
  ch,
  label,
  isActive,
  isTouched,
  showLabel,
  onPress,
}: {
  ch: Consonant;
  label: string;
  isActive: boolean;
  isTouched: boolean;
  showLabel: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => ({
        opacity: pressed ? 0.86 : 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: isActive ? ACTIVE_BORDER : LINE,
        backgroundColor: isActive
          ? ACTIVE_BG
          : isTouched
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.05)",
        minWidth: 72,
        alignItems: "center",
      })}
    >
      <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>{ch}</Text>

      {showLabel && (
        <View style={{ marginTop: 6 }}>
          <Text
            style={{
              color: MUTED,
              fontSize: 12,
              fontWeight: "800",
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ConsonantsBasic() {
  // ===== Data =====
  const samples = React.useMemo(
    () => ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅎ"] as const,
    [],
  );

  const meta: Record<Consonant, SampleMeta> = React.useMemo(
    () => ({
      // 4 contextes (ㅏ/ㅓ/ㅗ/ㅜ) => meilleur entraînement auditif
      ㄱ: { label: "g/k", sayParts: ["가", "거", "고", "구"] },
      ㄴ: { label: "n", sayParts: ["나", "너", "노", "누"] },
      ㄷ: { label: "d/t", sayParts: ["다", "더", "도", "두"] },
      ㄹ: {
        label: "r/l",
        sayParts: ["라", "러", "로", "루"],
        note: "Entre voyelles ≈ r léger, en fin de syllabe ≈ l.",
      },
      ㅁ: { label: "m", sayParts: ["마", "머", "모", "무"] },
      ㅂ: { label: "b/p", sayParts: ["바", "버", "보", "부"] },
      ㅅ: { label: "s", sayParts: ["사", "서", "소", "수"] },
      ㅇ: {
        label: "∅ / ng",
        // initial = silence → on entraîne surtout la voyelle (c'est OK si c'est clairement expliqué)
        sayParts: ["아", "어", "오", "우"],
        note: "Au début : consonne muette (∅). En fin : son 'ng'.",
      },
      ㅈ: { label: "j", sayParts: ["자", "저", "조", "주"] },
      ㅎ: { label: "h", sayParts: ["하", "허", "호", "후"] },
    }),
    [],
  );

  // ===== Controls =====
  const [rate, setRate] = React.useState<0.75 | 0.85 | 0.92>(0.85);
  const [gapMs, setGapMs] = React.useState<200 | 320 | 420>(320);
  const [repeatCount, setRepeatCount] = React.useState<1 | 2>(1);
  const [showLabel, setShowLabel] = React.useState(true);

  // ===== Audio state =====
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<Consonant | null>(null);

  // ===== Progress =====
  const [touched, setTouched] = React.useState<Record<Consonant, boolean>>({
    ㄱ: false,
    ㄴ: false,
    ㄷ: false,
    ㄹ: false,
    ㅁ: false,
    ㅂ: false,
    ㅅ: false,
    ㅇ: false,
    ㅈ: false,
    ㅎ: false,
  });

  const touchedCount = React.useMemo(() => {
    return samples.reduce((acc, c) => acc + (touched[c] ? 1 : 0), 0);
  }, [samples, touched]);

  // ===== Quiz =====
  const [quizOn, setQuizOn] = React.useState(false);
  const [quizTarget, setQuizTarget] = React.useState<Consonant | null>(null);
  const [quizReveal, setQuizReveal] = React.useState(false);
  const [quizFeedback, setQuizFeedback] = React.useState<
    "correct" | "wrong" | null
  >(null);

  // ===== Helpers =====
  const haptic = React.useCallback(async () => {
    try {
      if (Haptics?.selectionAsync) await Haptics.selectionAsync();
    } catch {}
  }, []);

  const stopAll = React.useCallback(async () => {
    Speech.stop();
    setIsSpeaking(false);
    setActiveKey(null);
    await haptic();
  }, [haptic]);

  /**
   * Queue TTS fiable: on enchaîne via onDone (pas de timers de durée)
   * Options:
   * - highlightKey: si fourni => surlignage (mode normal)
   * - repeatCount: répète chaque item x2 (avec gap)
   */
  const speakParts = React.useCallback(
    (
      parts: string[],
      opts?: {
        highlightKey?: Consonant;
        repeat?: number;
        onDoneAll?: () => void;
      },
    ) => {
      const repeat = opts?.repeat ?? 1;

      Speech.stop();
      setIsSpeaking(true);

      let i = 0;

      const speakOnePart = () => {
        if (i >= parts.length) {
          setIsSpeaking(false);
          // on ne reset activeKey que si on l’utilise
          if (opts?.highlightKey) setActiveKey(null);
          opts?.onDoneAll?.();
          return;
        }

        const p = parts[i];

        Speech.speak(p, {
          language: "ko-KR",
          rate,
          pitch: 1.0,
          onDone: () => {
            // répétition x2 optionnelle
            if (repeat === 2) {
              setTimeout(() => {
                Speech.speak(p, {
                  language: "ko-KR",
                  rate,
                  pitch: 1.0,
                  onDone: () => {
                    i += 1;
                    setTimeout(speakOnePart, gapMs);
                  },
                  onStopped: () => {
                    setIsSpeaking(false);
                    if (opts?.highlightKey) setActiveKey(null);
                  },
                  onError: () => {
                    setIsSpeaking(false);
                    if (opts?.highlightKey) setActiveKey(null);
                  },
                });
              }, gapMs);
              return;
            }

            i += 1;
            setTimeout(speakOnePart, gapMs);
          },
          onStopped: () => {
            setIsSpeaking(false);
            if (opts?.highlightKey) setActiveKey(null);
          },
          onError: () => {
            setIsSpeaking(false);
            if (opts?.highlightKey) setActiveKey(null);
          },
        });
      };

      speakOnePart();
    },
    [gapMs, rate],
  );

  const playConsonant = React.useCallback(
    async (c: Consonant) => {
      await haptic();

      // Progress
      setTouched((prev) => ({ ...prev, [c]: true }));

      // Highlight (uniquement hors quiz)
      if (!quizOn) setActiveKey(c);

      speakParts(meta[c].sayParts, {
        highlightKey: quizOn ? undefined : c,
        repeat: repeatCount,
      });
    },
    [haptic, meta, quizOn, repeatCount, speakParts],
  );
  const playAll = React.useCallback(async () => {
    await haptic();

    const reps: { key: Consonant; syll: string }[] = [
      { key: "ㄱ", syll: "가" },
      { key: "ㄴ", syll: "나" },
      { key: "ㄷ", syll: "다" },
      { key: "ㄹ", syll: "라" },
      { key: "ㅁ", syll: "마" },
      { key: "ㅂ", syll: "바" },
      { key: "ㅅ", syll: "사" },
      { key: "ㅇ", syll: "아" },
      { key: "ㅈ", syll: "자" },
      { key: "ㅎ", syll: "하" },
    ];

    let idx = 0;

    Speech.stop();
    setIsSpeaking(true);
    setActiveKey(null);

    const next = () => {
      if (idx >= reps.length) {
        setIsSpeaking(false);
        setActiveKey(null);
        return;
      }

      const { key, syll } = reps[idx];

      if (!quizOn) setActiveKey(key);
      setTouched((prev) => ({ ...prev, [key]: true }));

      Speech.speak(syll, {
        language: "ko-KR",
        rate,
        pitch: 1.0,
        onDone: () => {
          idx += 1;
          setTimeout(next, gapMs);
        },
        onStopped: () => {
          setIsSpeaking(false);
          setActiveKey(null);
        },
        onError: () => {
          setIsSpeaking(false);
          setActiveKey(null);
        },
      });
    };

    next();
  }, [gapMs, haptic, quizOn, rate]);
  // NOTE: on retire pitchFix, je laisse un correctif juste en dessous.

  // ✅ Correctif: pitchFix n'existe pas, on ne l'utilise pas.
  // (TS/ESLint peuvent râler si ton projet refuse les variables inutilisées)
  // -> ignore ce commentaire, le pitch est fixé à 1.0 partout.

  const resetProgress = React.useCallback(async () => {
    await haptic();
    setTouched({
      ㄱ: false,
      ㄴ: false,
      ㄷ: false,
      ㄹ: false,
      ㅁ: false,
      ㅂ: false,
      ㅅ: false,
      ㅇ: false,
      ㅈ: false,
      ㅎ: false,
    });
  }, [haptic]);

  // ===== Quiz logic (sans spoiler: aucun highlight pendant le son) =====
  const startQuiz = React.useCallback(async () => {
    await haptic();
    setQuizOn(true);
    setQuizReveal(false);
    setQuizFeedback(null);

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setQuizTarget(pick);

    // IMPORTANT: pas de setActiveKey(pick) => aucun indice visuel
    Speech.stop();
    setIsSpeaking(true);

    speakParts(meta[pick].sayParts, {
      // pas de highlight en quiz
      repeat: repeatCount,
      onDoneAll: () => setIsSpeaking(false),
    });
  }, [haptic, meta, repeatCount, samples, speakParts]);

  const replayQuiz = React.useCallback(async () => {
    if (!quizTarget) return;
    await haptic();

    Speech.stop();
    setIsSpeaking(true);

    speakParts(meta[quizTarget].sayParts, {
      repeat: repeatCount,
      onDoneAll: () => setIsSpeaking(false),
    });
  }, [haptic, meta, quizTarget, repeatCount, speakParts]);

  const exitQuiz = React.useCallback(async () => {
    await haptic();
    setQuizOn(false);
    setQuizTarget(null);
    setQuizReveal(false);
    setQuizFeedback(null);
  }, [haptic]);

  const answerQuiz = React.useCallback(
    async (choice: Consonant) => {
      if (!quizTarget) return;

      const ok = choice === quizTarget;
      setQuizFeedback(ok ? "correct" : "wrong");
      setQuizReveal(true);

      // Progress
      setTouched((prev) => ({ ...prev, [choice]: true }));

      try {
        if (Haptics?.notificationAsync) {
          await Haptics.notificationAsync(
            ok
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Error,
          );
        }
      } catch {}
    },
    [quizTarget],
  );

  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

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
          Consonnes de base
        </Text>

        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Clique une consonne → tu entends des syllabes exemples jouées une par
          une. Objectif : reconnaître une{" "}
          <Text style={{ color: TXT, fontWeight: "900" }}>
            catégorie de son
          </Text>
          , pas un équivalent FR parfait.
        </Text>

        <View style={{ height: 12 }} />

        {/* Progress + status */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: TXT, fontWeight: "900" }}>
            Progression : {touchedCount}/10{touchedCount === 10 ? " ✅" : ""}
          </Text>
          <Text style={{ color: MUTED, fontWeight: "800" }}>
            {isSpeaking ? "🔊 Lecture…" : "🎧 Casque conseillé"}
          </Text>
        </View>

        {/* Controls */}
        <Card>
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(34,211,238,0.35)",
              backgroundColor: "rgba(34,211,238,0.08)",
              padding: 12,
            }}
          >
            <Text style={{ color: TXT, fontWeight: "900" }}>
              💡 Comment apprendre
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Le son exact dépend du contexte. Ici on entraîne l’oreille avec 4
              voyelles (ㅏ/ㅓ/ㅗ/ㅜ). Répète à voix haute après chaque syllabe.
              {"\n"}
              <Text style={{ color: TXT, fontWeight: "900" }}>ㅇ</Text> au début
              = consonne muette (∅).
              <Text style={{ color: TXT, fontWeight: "900" }}> ㄹ</Text> est
              souvent perçu r/l selon la position.
            </Text>
          </View>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <PillButton
              label={showLabel ? "Label : ON" : "Label : OFF"}
              active={showLabel}
              onPress={async () => {
                await haptic();
                setShowLabel((v) => !v);
              }}
            />

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

            <PillButton
              label={quizOn ? "Quiz : ON" : "Quiz : OFF"}
              active={quizOn}
              onPress={quizOn ? exitQuiz : startQuiz}
              disabled={isSpeaking}
            />
          </View>
        </Card>

        {/* Quiz card */}
        {quizOn && (
          <Card>
            <Text style={{ color: TXT, fontWeight: "900" }}>
              🎯 Quiz — Quelle consonne est-ce ?
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Appuie sur{" "}
              <Text style={{ color: TXT, fontWeight: "900" }}>Rejouer</Text> si
              besoin, puis choisis la consonne. (Aucun indice visuel pendant le
              son.)
            </Text>

            <View style={{ height: 10 }} />

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <PillButton label="🔁 Rejouer" onPress={replayQuiz} active />
              <PillButton label="➡️ Nouveau" onPress={startQuiz} />
              <PillButton
                label="⏹ Stop"
                onPress={stopAll}
                disabled={!isSpeaking}
              />
            </View>

            {quizReveal && quizTarget && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: TXT, fontWeight: "900" }}>
                  {quizFeedback === "correct" ? "✅ Correct" : "❌ Presque"}
                </Text>
                <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
                  Réponse :{" "}
                  <Text style={{ color: TXT, fontWeight: "900" }}>
                    {quizTarget}
                  </Text>{" "}
                  ({meta[quizTarget].label}){"  "}→{" "}
                  {meta[quizTarget].sayParts.join(" / ")}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Main tiles */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900", marginBottom: 10 }}>
            {quizOn ? "Choisis la consonne" : "Boutons — écoute rapide"}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {samples.map((c) => {
              // highlight seulement hors quiz (évite tout “spoiler”)
              const isActive = !quizOn && activeKey === c;

              return (
                <Tile
                  key={c}
                  ch={c}
                  label={meta[c].label}
                  isActive={isActive}
                  isTouched={touched[c]}
                  showLabel={showLabel}
                  onPress={() => {
                    if (quizOn) answerQuiz(c);
                    else playConsonant(c);
                  }}
                />
              );
            })}
          </View>

          <View style={{ height: 12 }} />

          {!isSpeaking ? (
            <PrimaryButton
              label="🔊 Écouter tout (séquencé)"
              onPress={playAll}
              disabled={quizOn}
            />
          ) : (
            <PrimaryButton label="⏹ Stop" onPress={stopAll} />
          )}

          <View style={{ height: 10 }} />

          <GhostButton
            label="🔁 Reset progression (0/10)"
            onPress={resetProgress}
            disabled={isSpeaking}
          />
        </Card>

        {/* Extra hints */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>
            ⚡ Conseils rapides
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            • Tapote vite{" "}
            <Text style={{ color: TXT, fontWeight: "900" }}>ㄱ/ㄷ/ㅂ</Text> pour
            sentir les “stops”.{"\n"}•{" "}
            <Text style={{ color: TXT, fontWeight: "900" }}>ㅅ</Text> devient
            plus “doux” devant ㅣ (tu verras plus tard : 시).{"\n"}•{" "}
            <Text style={{ color: TXT, fontWeight: "900" }}>ㅇ</Text> au début
            est silencieux : écoute surtout la voyelle.
          </Text>
        </Card>

        {/* Compatibility stop block (si tu veux garder un stop toujours visible) */}
        <Card>
          <GhostButton label="⏹ Stop audio" onPress={stopAll} />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
