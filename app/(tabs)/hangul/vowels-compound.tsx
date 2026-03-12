import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

// (Optionnel) Haptics : npx expo install expo-haptics
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

type Vowel = "ㅐ" | "ㅔ" | "ㅘ" | "ㅝ" | "ㅚ" | "ㅟ" | "ㅢ";

type Meta = {
  ex: string; // exemple syllabique (애, 에, 와...)
  roma: string; // romanisation (ae, e, wa...)
  build: string; // composition (ㅗ+ㅏ, ㅡ+ㅣ...)
  tip?: string; // note courte
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
  v,
  meta,
  isActive,
  isTouched,
  showRoman,
  showBuild,
  onPress,
}: {
  v: Vowel;
  meta: Meta;
  isActive: boolean;
  isTouched: boolean;
  showRoman: boolean;
  showBuild: boolean;
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
      <Text style={{ color: TXT, fontSize: 20, fontWeight: "900" }}>{v}</Text>

      {/* Exemple syllabique */}
      <Text style={{ color: MUTED, marginTop: 4, fontWeight: "900" }}>
        {meta.ex}
        {showRoman ? ` • ${meta.roma}` : ""}
      </Text>

      {/* Composition */}
      {showBuild && (
        <Text
          style={{
            color: MUTED,
            marginTop: 4,
            fontSize: 12,
            fontWeight: "800",
          }}
        >
          {meta.build}
        </Text>
      )}
    </Pressable>
  );
}

export default function VowelsCompound() {
  const samples = React.useMemo(
    () => ["ㅐ", "ㅔ", "ㅘ", "ㅝ", "ㅚ", "ㅟ", "ㅢ"] as const,
    [],
  );

  const meta = React.useMemo<Record<Vowel, Meta>>(
    () => ({
      ㅐ: {
        ex: "애",
        roma: "ae",
        build: "ㅏ + ㅣ",
        tip: "Souvent très proche de ㅔ.",
      },
      ㅔ: {
        ex: "에",
        roma: "e",
        build: "ㅓ + ㅣ",
        tip: "Souvent très proche de ㅐ.",
      },
      ㅘ: { ex: "와", roma: "wa", build: "ㅗ + ㅏ" },
      ㅝ: { ex: "워", roma: "wo", build: "ㅜ + ㅓ" },
      ㅚ: {
        ex: "외",
        roma: "oe",
        build: "ㅗ + ㅣ",
        tip: "En moderne, souvent proche de ‘we’.",
      },
      ㅟ: { ex: "위", roma: "wi", build: "ㅜ + ㅣ" },
      ㅢ: {
        ex: "의",
        roma: "ui",
        build: "ㅡ + ㅣ",
        tip: "Souvent prononcé ‘i’ selon le contexte.",
      },
    }),
    [],
  );

  // ===== Controls =====
  const [showRoman, setShowRoman] = React.useState(true);
  const [showBuild, setShowBuild] = React.useState(true);
  const [rate, setRate] = React.useState<0.75 | 0.85 | 0.92>(0.85);
  const [gapMs, setGapMs] = React.useState<200 | 320 | 420>(320);
  const [repeatCount, setRepeatCount] = React.useState<1 | 2>(1);

  // ===== State audio =====
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<Vowel | null>(null);

  // ===== Progress =====
  const [touched, setTouched] = React.useState<Record<Vowel, boolean>>({
    ㅐ: false,
    ㅔ: false,
    ㅘ: false,
    ㅝ: false,
    ㅚ: false,
    ㅟ: false,
    ㅢ: false,
  });

  const touchedCount = React.useMemo(() => {
    return samples.reduce((acc, v) => acc + (touched[v] ? 1 : 0), 0);
  }, [samples, touched]);

  // ===== Quiz (optionnel, simple) =====
  const [quizOn, setQuizOn] = React.useState(false);
  const [quizTarget, setQuizTarget] = React.useState<Vowel | null>(null);
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

  // Queue TTS via onDone (pas de timers de durée)
  const speakParts = React.useCallback(
    (
      parts: string[],
      opts?: { highlight?: Vowel; repeat?: number; onDoneAll?: () => void },
    ) => {
      const repeat = opts?.repeat ?? 1;

      Speech.stop();
      setIsSpeaking(true);

      let i = 0;

      const step = () => {
        if (i >= parts.length) {
          setIsSpeaking(false);
          if (opts?.highlight) setActiveKey(null);
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
                    if (opts?.highlight) setActiveKey(null);
                  },
                  onError: () => {
                    setIsSpeaking(false);
                    if (opts?.highlight) setActiveKey(null);
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
            if (opts?.highlight) setActiveKey(null);
          },
          onError: () => {
            setIsSpeaking(false);
            if (opts?.highlight) setActiveKey(null);
          },
        });
      };

      step();
    },
    [gapMs, rate],
  );

  const playOne = React.useCallback(
    async (v: Vowel) => {
      await haptic();

      setTouched((prev) => ({ ...prev, [v]: true }));

      // Pas de highlight en quiz => pas d'indice
      if (!quizOn) setActiveKey(v);

      speakParts([meta[v].ex], {
        highlight: quizOn ? undefined : v,
        repeat: repeatCount,
      });
    },
    [haptic, meta, quizOn, repeatCount, speakParts],
  );

  const playAll = React.useCallback(async () => {
    await haptic();

    // Séquence: ex syllabiques
    const seq: { key: Vowel; syll: string }[] = samples.map((v) => ({
      key: v,
      syll: meta[v].ex,
    }));

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
  }, [gapMs, haptic, meta, quizOn, rate, samples]);

  const resetProgress = React.useCallback(async () => {
    await haptic();
    setTouched({
      ㅐ: false,
      ㅔ: false,
      ㅘ: false,
      ㅝ: false,
      ㅚ: false,
      ㅟ: false,
      ㅢ: false,
    });
  }, [haptic]);

  // ===== Contrast mode =====
  const playContrast = React.useCallback(
    async (a: Vowel, b: Vowel) => {
      await haptic();
      // Contraste A B A B
      const parts = [meta[a].ex, meta[b].ex, meta[a].ex, meta[b].ex];

      // Pas d'highlight ici (on peut, mais ça “guide” un peu trop)
      // Si tu veux le highlight, je te le fais en version “didactique”.
      setTouched((prev) => ({ ...prev, [a]: true, [b]: true }));
      setActiveKey(null);

      speakParts(parts, { repeat: 1 });
    },
    [haptic, meta, speakParts],
  );

  // ===== Quiz logic =====
  const startQuiz = React.useCallback(async () => {
    await haptic();
    setQuizOn(true);
    setQuizReveal(false);
    setQuizFeedback(null);

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setQuizTarget(pick);

    // IMPORTANT: pas de setActiveKey(pick)
    Speech.stop();
    setIsSpeaking(true);
    setActiveKey(null);

    speakParts([meta[pick].ex], {
      repeat: repeatCount,
      onDoneAll: () => setIsSpeaking(false),
    });
  }, [haptic, meta, repeatCount, samples, speakParts]);

  const replayQuiz = React.useCallback(async () => {
    if (!quizTarget) return;
    await haptic();

    Speech.stop();
    setIsSpeaking(true);
    setActiveKey(null);

    speakParts([meta[quizTarget].ex], {
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
    async (choice: Vowel) => {
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
          Voyelles composées
        </Text>

        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Clique une voyelle composée → tu entends l’exemple syllabique (애, 에,
          와…). Active la composition + romanisation si tu veux comprendre le
          “pourquoi”.
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
            Progression : {touchedCount}/{samples.length}
            {touchedCount === samples.length ? " ✅" : ""}
          </Text>
          <Text style={{ color: MUTED, fontWeight: "800" }}>
            {isSpeaking ? "🔊 Lecture…" : "🎧 Casque conseillé"}
          </Text>
        </View>

        {/* Controls + tips */}
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
            <Text style={{ color: TXT, fontWeight: "900" }}>💡 À retenir</Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              • Les voyelles composées sont souvent la fusion de 2 voyelles (ex:
              ㅗ+ㅏ=ㅘ).{"\n"}• ㅐ et ㅔ sont souvent très proches à l’oral :
              l’important est de les reconnaître visuellement.{"\n"}• 의 (ㅢ)
              varie selon le contexte : tu entendras parfois “ui”, parfois “i”.
            </Text>
          </View>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <PillButton
              label={showRoman ? "Romanisation : ON" : "Romanisation : OFF"}
              active={showRoman}
              onPress={async () => {
                await haptic();
                setShowRoman((v) => !v);
              }}
            />
            <PillButton
              label={showBuild ? "Composition : ON" : "Composition : OFF"}
              active={showBuild}
              onPress={async () => {
                await haptic();
                setShowBuild((v) => !v);
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

        {/* Contrast */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>
            ⚡ Contrastes (paires pièges)
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Entraîne l’oreille en alternant A/B. (Très efficace pour éviter les
            confusions.)
          </Text>

          <View style={{ height: 10 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <PillButton
              label="ㅐ ↔ ㅔ"
              onPress={() => playContrast("ㅐ", "ㅔ")}
            />
            <PillButton
              label="ㅘ ↔ ㅝ"
              onPress={() => playContrast("ㅘ", "ㅝ")}
            />
            <PillButton
              label="ㅚ ↔ ㅟ"
              onPress={() => playContrast("ㅚ", "ㅟ")}
            />
            <PillButton
              label="ㅢ ↔ ㅣ"
              onPress={() => playContrast("ㅢ", "ㅟ")}
              disabled
            />
          </View>

          <View style={{ height: 10 }} />
          <Text style={{ color: MUTED, lineHeight: 20 }}>
            (Astuce) “ㅢ ↔ ㅣ” varie trop selon contexte/TTS, donc je préfère te
            le mettre dans une leçon dédiée plus tard.
          </Text>
        </Card>

        {/* Quiz card */}
        {quizOn && (
          <Card>
            <Text style={{ color: TXT, fontWeight: "900" }}>
              🎯 Quiz — Quel son est-ce ?
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Appuie sur{" "}
              <Text style={{ color: TXT, fontWeight: "900" }}>Rejouer</Text> si
              besoin, puis choisis la voyelle. (Aucun highlight pendant le son.)
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
                  ={" "}
                  <Text style={{ color: TXT, fontWeight: "900" }}>
                    {meta[quizTarget].ex}
                  </Text>
                  {showRoman ? ` (${meta[quizTarget].roma})` : ""}
                  {"  "}— {meta[quizTarget].build}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Main tiles */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900", marginBottom: 10 }}>
            {quizOn ? "Choisis la voyelle" : "Boutons — écoute rapide"}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {samples.map((v) => (
              <Tile
                key={v}
                v={v}
                meta={meta[v]}
                isActive={!quizOn && activeKey === v}
                isTouched={touched[v]}
                showRoman={showRoman}
                showBuild={showBuild}
                onPress={() => {
                  if (quizOn) answerQuiz(v);
                  else playOne(v);
                }}
              />
            ))}
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
            label="🔁 Reset progression"
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
