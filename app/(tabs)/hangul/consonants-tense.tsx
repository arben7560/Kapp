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
const ACTIVE_BG = "rgba(34,211,238,0.22)";
const ACTIVE_BORDER = "rgba(34,211,238,0.75)";

type Tense = "ㄲ" | "ㄸ" | "ㅃ" | "ㅆ" | "ㅉ";
type Plain = "ㄱ" | "ㄷ" | "ㅂ" | "ㅅ" | "ㅈ";
type Key = Tense | Plain;

type Meta = {
  label: string; // kk/tt...
  examples: string[]; // 까 꺼 꼬 꾸
  base?: Plain; // correspondance simple
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
  text,
  label,
  isActive,
  isTouched,
  onPress,
}: {
  text: string;
  label?: string;
  isActive: boolean;
  isTouched: boolean;
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
        minWidth: 78,
        alignItems: "center",
      })}
    >
      <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>
        {text}
      </Text>
      {!!label && (
        <Text
          style={{
            color: MUTED,
            marginTop: 4,
            fontSize: 12,
            fontWeight: "800",
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export default function ConsonantsTense() {
  const tense = React.useMemo(
    () => ["ㄲ", "ㄸ", "ㅃ", "ㅆ", "ㅉ"] as const,
    [],
  );
  const plain = React.useMemo(
    () => ["ㄱ", "ㄷ", "ㅂ", "ㅅ", "ㅈ"] as const,
    [],
  );
  const vowels4 = React.useMemo(() => ["ㅏ", "ㅓ", "ㅗ", "ㅜ"] as const, []);

  const meta = React.useMemo<Record<Tense, Meta>>(
    () => ({
      ㄲ: { label: "kk", examples: ["까", "꺼", "꼬", "꾸"], base: "ㄱ" },
      ㄸ: { label: "tt", examples: ["따", "떠", "또", "뚜"], base: "ㄷ" },
      ㅃ: { label: "pp", examples: ["빠", "뻐", "뽀", "뿌"], base: "ㅂ" },
      ㅆ: { label: "ss", examples: ["싸", "써", "쏘", "쑤"], base: "ㅅ" },
      ㅉ: { label: "jj", examples: ["짜", "쩌", "쪼", "쭈"], base: "ㅈ" },
    }),
    [],
  );

  // Pour comparaison: syllabes simples correspondantes (ga/geo/go/gu etc.)
  const plainExamples = React.useMemo<Record<Plain, string[]>>(
    () => ({
      ㄱ: ["가", "거", "고", "구"],
      ㄷ: ["다", "더", "도", "두"],
      ㅂ: ["바", "버", "보", "부"],
      ㅅ: ["사", "서", "소", "수"],
      ㅈ: ["자", "저", "조", "주"],
    }),
    [],
  );

  // ===== Controls =====
  const [rate, setRate] = React.useState<0.75 | 0.85 | 0.92>(0.85);
  const [gapMs, setGapMs] = React.useState<200 | 320 | 420>(320);
  const [repeatCount, setRepeatCount] = React.useState<1 | 2>(1);
  const [showLabels, setShowLabels] = React.useState(true);

  // ===== Audio state =====
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  // ===== Progress =====
  const [touched, setTouched] = React.useState<Record<Tense, boolean>>({
    ㄲ: false,
    ㄸ: false,
    ㅃ: false,
    ㅆ: false,
    ㅉ: false,
  });

  const touchedCount = React.useMemo(
    () => tense.reduce((acc, k) => acc + (touched[k] ? 1 : 0), 0),
    [tense, touched],
  );

  // ===== Quiz =====
  const [quizOn, setQuizOn] = React.useState(false);
  const [quizTarget, setQuizTarget] = React.useState<Tense | null>(null);
  const [quizReveal, setQuizReveal] = React.useState(false);
  const [quizFeedback, setQuizFeedback] = React.useState<
    "correct" | "wrong" | null
  >(null);

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

  // ===== Queue TTS via onDone (fiable, pas de timers de durée) =====
  const speakParts = React.useCallback(
    (
      parts: string[],
      opts?: { highlightKey?: string; repeat?: number; onDoneAll?: () => void },
    ) => {
      const repeat = opts?.repeat ?? 1;

      Speech.stop();
      setIsSpeaking(true);

      let i = 0;

      const step = () => {
        if (i >= parts.length) {
          setIsSpeaking(false);
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
            setTimeout(step, gapMs);
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

      step();
    },
    [gapMs, rate],
  );

  // ===== Play functions =====
  const playTenseLetter = React.useCallback(
    async (k: Tense) => {
      await haptic();

      setTouched((prev) => ({ ...prev, [k]: true }));

      if (!quizOn) setActiveKey(k);

      // On joue les exemples syllabiques (4 voyelles) pour sentir la tension
      speakParts(meta[k].examples, {
        highlightKey: quizOn ? undefined : k,
        repeat: repeatCount,
      });
    },
    [haptic, meta, quizOn, repeatCount, speakParts],
  );

  const playTenseSyllable = React.useCallback(
    async (syllable: string) => {
      await haptic();
      if (!quizOn) setActiveKey(syllable);
      speakParts([syllable], {
        highlightKey: quizOn ? undefined : syllable,
        repeat: repeatCount,
      });
    },
    [haptic, quizOn, repeatCount, speakParts],
  );

  // Comparaison A/B alternée (clé pédagogique)
  const playCompare = React.useCallback(
    async (base: Plain, tenseKey: Tense) => {
      await haptic();

      const a = plainExamples[base]; // ex: 가 거 고 구
      const b = meta[tenseKey].examples; // ex: 까 꺼 꼬 꾸

      // A/B sur chaque voyelle + retour
      // 가 까 거 꺼 고 꼬 구 꾸 (puis répète le bloc une 2e fois)
      const parts: string[] = [];
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        parts.push(a[i], b[i]);
      }
      // On rajoute un second passage (contraste plus clair)
      parts.push(...parts);

      setTouched((prev) => ({ ...prev, [tenseKey]: true }));
      setActiveKey(null); // pas de spoiler/guide trop fort

      speakParts(parts, { repeat: 1 });
    },
    [haptic, meta, plainExamples, speakParts],
  );

  const playAll = React.useCallback(async () => {
    await haptic();

    // “Écouter tout” tendu = une syllabe repère par lettre (séquencé)
    const seq: { key: Tense; syll: string }[] = [
      { key: "ㄲ", syll: "까" },
      { key: "ㄸ", syll: "따" },
      { key: "ㅃ", syll: "빠" },
      { key: "ㅆ", syll: "싸" },
      { key: "ㅉ", syll: "짜" },
    ];

    let idx = 0;

    Speech.stop();
    setIsSpeaking(true);
    setActiveKey(null);

    const next = () => {
      if (idx >= seq.length) {
        setIsSpeaking(false);
        setActiveKey(null);
        return;
      }

      const { key, syll } = seq[idx];

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

  const resetProgress = React.useCallback(async () => {
    await haptic();
    setTouched({ ㄲ: false, ㄸ: false, ㅃ: false, ㅆ: false, ㅉ: false });
  }, [haptic]);

  // ===== Quiz (sans highlight pendant audio) =====
  const startQuiz = React.useCallback(async () => {
    await haptic();
    setQuizOn(true);
    setQuizReveal(false);
    setQuizFeedback(null);

    const pick = tense[Math.floor(Math.random() * tense.length)];
    setQuizTarget(pick);

    Speech.stop();
    setIsSpeaking(true);
    setActiveKey(null);

    speakParts([meta[pick].examples[0]], {
      // ex: 까 / 따 / 빠 / 싸 / 짜
      repeat: repeatCount,
      onDoneAll: () => setIsSpeaking(false),
    });
  }, [haptic, meta, repeatCount, speakParts, tense]);

  const replayQuiz = React.useCallback(async () => {
    if (!quizTarget) return;
    await haptic();

    Speech.stop();
    setIsSpeaking(true);
    setActiveKey(null);

    speakParts([meta[quizTarget].examples[0]], {
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
    async (choice: Tense) => {
      if (!quizTarget) return;

      const ok = choice === quizTarget;
      setQuizFeedback(ok ? "correct" : "wrong");
      setQuizReveal(true);

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

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Link href="/hangul" asChild>
          <Pressable style={{ paddingVertical: 8 }} hitSlop={10}>
            <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
          </Pressable>
        </Link>

        <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
          Consonnes doubles (tendues)
        </Text>

        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Les consonnes tendues sonnent plus{" "}
          <Text style={{ color: TXT, fontWeight: "900" }}>sèches</Text> et
          <Text style={{ color: TXT, fontWeight: "900" }}> comprimées</Text>. Le
          plus efficace est la comparaison directe (가 ↔ 까, 다 ↔ 따…).
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
            Progression : {touchedCount}/5{touchedCount === 5 ? " ✅" : ""}
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
              • “Double” ≠ plus fort : c’est surtout{" "}
              <Text style={{ color: TXT, fontWeight: "900" }}>
                sans aspiration
              </Text>
              et plus “serré”.{"\n"}• Compare toujours avec la simple (가/까,
              다/따…).{"\n"}• Ne souffle pas : l’air sort moins que ㅋ/ㅌ/ㅍ/ㅊ.
            </Text>
          </View>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <PillButton
              label={showLabels ? "Labels : ON" : "Labels : OFF"}
              active={showLabels}
              onPress={async () => {
                await haptic();
                setShowLabels((v) => !v);
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

        {/* Comparaison (section clé) */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>
            ⚡ Comparer (simple ↔ tendue)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Clique une paire pour entendre l’alternance. (C’est le meilleur
            exercice.)
          </Text>

          <View style={{ height: 10 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <PillButton
              label="ㄱ ↔ ㄲ"
              onPress={() => playCompare("ㄱ", "ㄲ")}
            />
            <PillButton
              label="ㄷ ↔ ㄸ"
              onPress={() => playCompare("ㄷ", "ㄸ")}
            />
            <PillButton
              label="ㅂ ↔ ㅃ"
              onPress={() => playCompare("ㅂ", "ㅃ")}
            />
            <PillButton
              label="ㅅ ↔ ㅆ"
              onPress={() => playCompare("ㅅ", "ㅆ")}
            />
            <PillButton
              label="ㅈ ↔ ㅉ"
              onPress={() => playCompare("ㅈ", "ㅉ")}
            />
          </View>

          <View style={{ height: 12 }} />

          {!isSpeaking ? (
            <PrimaryButton
              label="🔊 Écouter tout (repères)"
              onPress={playAll}
              disabled={quizOn}
            />
          ) : (
            <PrimaryButton label="⏹ Stop" onPress={stopAll} />
          )}
        </Card>

        {/* Quiz */}
        {quizOn && (
          <Card>
            <Text style={{ color: TXT, fontWeight: "900" }}>
              🎯 Quiz — Quelle consonne est-ce ?
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Appuie sur{" "}
              <Text style={{ color: TXT, fontWeight: "900" }}>Rejouer</Text>,
              puis choisis la consonne. (Pas de highlight pendant le son.)
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
                  ({meta[quizTarget].label}){"  "}→ ex:{" "}
                  {meta[quizTarget].examples[0]}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Section A: Lettres tendues */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900", marginBottom: 10 }}>
            A — Lettres tendues
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {tense.map((k) => (
              <Tile
                key={k}
                text={k}
                label={showLabels ? meta[k].label : undefined}
                isActive={!quizOn && activeKey === k}
                isTouched={touched[k]}
                onPress={() => {
                  if (quizOn) answerQuiz(k);
                  else playTenseLetter(k);
                }}
              />
            ))}
          </View>
        </Card>

        {/* Section B: Syllabes exemples */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900", marginBottom: 10 }}>
            B — Exemples syllabiques (4 voyelles)
          </Text>

          <Text style={{ color: MUTED, marginBottom: 10, lineHeight: 20 }}>
            Tapote une syllabe pour l’imiter (x2 si activé). Puis compare via
            les boutons au-dessus.
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {tense.flatMap((k) =>
              meta[k].examples.map((syll) => (
                <Tile
                  key={`${k}-${syll}`}
                  text={syll}
                  label={showLabels ? meta[k].label : undefined}
                  isActive={!quizOn && activeKey === syll}
                  isTouched={touched[k]}
                  onPress={() => playTenseSyllable(syll)}
                />
              )),
            )}
          </View>

          <View style={{ height: 12 }} />

          <GhostButton
            label="🔁 Reset progression (0/5)"
            onPress={resetProgress}
            disabled={isSpeaking}
          />
        </Card>

        {/* Always available stop */}
        <Card>
          <GhostButton label="⏹ Stop audio" onPress={stopAll} />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
