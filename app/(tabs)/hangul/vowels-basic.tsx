import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.68)"; // un poil plus lisible
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";
const NEON = "rgba(34,211,238,0.55)";
const NEON_BG = "rgba(34,211,238,0.14)";
const ACTIVE_BG = "rgba(34,211,238,0.22)";
const ACTIVE_BORDER = "rgba(34,211,238,0.75)";

type Sample = "ㅏ" | "ㅓ" | "ㅗ" | "ㅜ" | "ㅡ" | "ㅣ";

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
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
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
  isActive,
  isTouched,
  labelTop,
  labelBottom,
  onPress,
}: {
  v: Sample;
  isActive: boolean;
  isTouched: boolean;
  labelTop: string;
  labelBottom: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
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
      <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
        {labelTop}
      </Text>
      <Text style={{ color: MUTED, marginTop: 4, fontWeight: "800" }}>
        {labelBottom}
      </Text>
    </Pressable>
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function VowelsBasic() {
  // ====== Data ======
  const samples = React.useMemo(
    () => ["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅡ", "ㅣ"] as const,
    [],
  );

  // Syllabe prononcée (plus naturel que la voyelle seule)
  const sayMap: Record<Sample, string> = React.useMemo(
    () => ({
      ㅏ: "아",
      ㅓ: "어",
      ㅗ: "오",
      ㅜ: "우",
      ㅡ: "으",
      ㅣ: "이",
    }),
    [],
  );

  // Romanisation (simple et efficace)
  const romaMap: Record<Sample, string> = React.useMemo(
    () => ({
      ㅏ: "a",
      ㅓ: "eo",
      ㅗ: "o",
      ㅜ: "u",
      ㅡ: "eu",
      ㅣ: "i",
    }),
    [],
  );

  // “Écoute → devine” : on joue la syllabe (아/어/...) et on choisit la voyelle (ㅏ/ㅓ/..)
  // (Ça force la reconnaissance auditive)
  const quizPool = React.useMemo(() => [...samples], [samples]);

  // ====== State ======
  const [showRoman, setShowRoman] = React.useState(true);
  const [rate, setRate] = React.useState<0.85 | 0.92 | 1.0>(0.92);
  const [repeatCount, setRepeatCount] = React.useState<1 | 2>(1);

  const [active, setActive] = React.useState<Sample | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  // progression : quelles voyelles ont été “touchées”
  const [touched, setTouched] = React.useState<Record<Sample, boolean>>({
    ㅏ: false,
    ㅓ: false,
    ㅗ: false,
    ㅜ: false,
    ㅡ: false,
    ㅣ: false,
  });

  // mode quiz
  const [quizOn, setQuizOn] = React.useState(false);
  const [quizTarget, setQuizTarget] = React.useState<Sample | null>(null);
  const [quizReveal, setQuizReveal] = React.useState(false);
  const [quizFeedback, setQuizFeedback] = React.useState<
    "correct" | "wrong" | null
  >(null);

  // ====== Speech helpers ======
  const stopAll = React.useCallback(async () => {
    Speech.stop();
    setIsSpeaking(false);
    setActive(null);
    try {
      await Haptics.selectionAsync();
    } catch {}
  }, []);

  const speakOne = React.useCallback(
    async (v: Sample, opts?: { noStop?: boolean }) => {
      const isSame = active === v && isSpeaking;

      try {
        await Haptics.selectionAsync();
      } catch {}

      if (!opts?.noStop) Speech.stop();
      else if (isSame) Speech.stop();

      setActive(v);
      setIsSpeaking(true);
      setTouched((prev) => ({ ...prev, [v]: true }));

      const phrase = sayMap[v];

      Speech.speak(phrase, {
        language: "ko-KR",
        rate,
        pitch: 1.0,
        onDone: () => {
          if (repeatCount === 2) {
            // ✅ pas d'async ici → pas de Promise
            setTimeout(() => {
              Speech.speak(phrase, {
                language: "ko-KR",
                rate,
                pitch: 1.0,
                onDone: () => {
                  setIsSpeaking(false);
                  setActive(null);
                },
                onStopped: () => {
                  setIsSpeaking(false);
                  setActive(null);
                },
                onError: () => {
                  setIsSpeaking(false);
                  setActive(null);
                },
              });
            }, 260);
            return;
          }

          setIsSpeaking(false);
          setActive(null);
        },
        onStopped: () => {
          setIsSpeaking(false);
          setActive(null);
        },
        onError: () => {
          setIsSpeaking(false);
          setActive(null);
        },
      });
    },
    [active, isSpeaking, rate, repeatCount, sayMap],
  );
  const speakSequence = React.useCallback(
    async (seq: Sample[]) => {
      try {
        await Haptics.selectionAsync();
      } catch {}

      Speech.stop();
      setIsSpeaking(true);

      for (let i = 0; i < seq.length; i++) {
        const v = seq[i];
        setActive(v);
        setTouched((prev) => ({ ...prev, [v]: true }));

        // speakOne “inline” sans stop automatique
        await new Promise<void>((resolve) => {
          const phrase = sayMap[v];
          Speech.speak(phrase, {
            language: "ko-KR",
            rate,
            pitch: 1.0,
            onDone: () => resolve(),
            onStopped: () => resolve(),
            onError: () => resolve(),
          });
        });

        // petite pause entre items (améliore l’imitation)
        await wait(260);

        // répétition x2 optionnelle pour la séquence aussi
        if (repeatCount === 2) {
          await new Promise<void>((resolve) => {
            const phrase = sayMap[v];
            Speech.speak(phrase, {
              language: "ko-KR",
              rate,
              pitch: 1.0,
              onDone: () => resolve(),
              onStopped: () => resolve(),
              onError: () => resolve(),
            });
          });
          await wait(260);
        }
      }

      setIsSpeaking(false);
      setActive(null);
    },
    [rate, repeatCount, sayMap],
  );

  // ====== Progress ======
  const touchedCount = React.useMemo(() => {
    return samples.reduce((acc, v) => acc + (touched[v] ? 1 : 0), 0);
  }, [samples, touched]);

  // ====== Quiz ======
  const startQuiz = React.useCallback(async () => {
    setQuizOn(true);
    setQuizReveal(false);
    setQuizFeedback(null);

    const pick = quizPool[Math.floor(Math.random() * quizPool.length)];
    setQuizTarget(pick);

    try {
      await Haptics.selectionAsync();
    } catch {}

    // IMPORTANT : ne pas révéler la bonne réponse
    Speech.stop();
    setIsSpeaking(true);

    Speech.speak(sayMap[pick], {
      language: "ko-KR",
      rate,
      pitch: 1.0,
      onDone: () => {
        setIsSpeaking(false);
      },
      onStopped: () => {
        setIsSpeaking(false);
      },
      onError: () => {
        setIsSpeaking(false);
      },
    });
  }, [quizPool, rate, sayMap]);

  // petite correction : pas besoin de pitchFix, on garde pitch constant
  // (On ne peut pas utiliser une variable non définie : je laisse simple)

  const replayQuiz = React.useCallback(() => {
    if (!quizTarget) return;
    Speech.stop();
    setIsSpeaking(true);
    setActive(quizTarget);
    Speech.speak(sayMap[quizTarget], {
      language: "ko-KR",
      rate,
      pitch: 1.0,
      onDone: () => {
        setIsSpeaking(false);
        setActive(null);
      },
      onStopped: () => {
        setIsSpeaking(false);
        setActive(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setActive(null);
      },
    });
  }, [quizTarget, rate, sayMap]);

  const answerQuiz = React.useCallback(
    async (choice: Sample) => {
      if (!quizTarget) return;

      const ok = choice === quizTarget;
      setQuizFeedback(ok ? "correct" : "wrong");
      setQuizReveal(true);

      try {
        if (ok)
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        else
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
      } catch {}

      // progression aussi
      setTouched((prev) => ({ ...prev, [choice]: true }));
    },
    [quizTarget],
  );

  const exitQuiz = React.useCallback(async () => {
    setQuizOn(false);
    setQuizTarget(null);
    setQuizReveal(false);
    setQuizFeedback(null);
    try {
      await Haptics.selectionAsync();
    } catch {}
  }, []);

  // ====== Cleanup ======
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
          Voyelles de base
        </Text>

        <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
          Clique une voyelle → tu entends la syllabe correspondante (plus
          naturel que “ㅏ” seul). Objectif : reconnaître les sons à l’oreille.
        </Text>

        <View style={{ height: 12 }} />

        {/* Progress */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: TXT, fontWeight: "900" }}>
            Progression : {touchedCount}/6
            {touchedCount === 6 ? " ✅" : ""}
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
              1) Écoute. 2) Répète à voix haute. 3) Compare vite “ㅓ vs ㅗ” et
              “ㅡ”. Active la romanisation si besoin, puis essaie sans.
            </Text>
          </View>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <PillButton
              label={showRoman ? "Romanisation : ON" : "Romanisation : OFF"}
              active={showRoman}
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                setShowRoman((v) => !v);
              }}
            />

            <PillButton
              label={`Vitesse : ${rate}`}
              active
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                setRate((r) => (r === 0.85 ? 0.92 : r === 0.92 ? 1.0 : 0.85));
              }}
            />

            <PillButton
              label={repeatCount === 2 ? "Répéter : x2" : "Répéter : x1"}
              active={repeatCount === 2}
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                setRepeatCount((c) => (c === 1 ? 2 : 1));
              }}
            />

            <PillButton
              label={quizOn ? "Quiz : ON" : "Quiz : OFF"}
              active={quizOn}
              onPress={quizOn ? exitQuiz : startQuiz}
            />
          </View>
        </Card>

        {/* Main tiles */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900", marginBottom: 10 }}>
            {quizOn ? "🎯 Quiz — Quel son est-ce ?" : "Boutons — écoute rapide"}
          </Text>

          {quizOn && (
            <View style={{ marginBottom: 12, gap: 10 }}>
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: LINE,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <Text style={{ color: MUTED, lineHeight: 20 }}>
                  Appuie sur{" "}
                  <Text style={{ color: TXT, fontWeight: "900" }}>
                    🔁 Rejouer
                  </Text>{" "}
                  si besoin, puis choisis la voyelle correspondante.
                </Text>

                <View style={{ height: 10 }} />

                <View
                  style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                >
                  <PillButton label="🔁 Rejouer" onPress={replayQuiz} active />
                  <PillButton label="➡️ Nouveau" onPress={startQuiz} />
                </View>

                {quizReveal && quizTarget && (
                  <>
                    <View style={{ height: 10 }} />
                    <Text style={{ color: TXT, fontWeight: "900" }}>
                      {quizFeedback === "correct" ? "✅ Correct" : "❌ Presque"}
                    </Text>
                    <Text
                      style={{ color: MUTED, marginTop: 4, lineHeight: 20 }}
                    >
                      Réponse :{" "}
                      <Text style={{ color: TXT, fontWeight: "900" }}>
                        {quizTarget}
                      </Text>{" "}
                      ={" "}
                      <Text style={{ color: TXT, fontWeight: "900" }}>
                        {sayMap[quizTarget]}
                      </Text>
                      {showRoman ? ` (${romaMap[quizTarget]})` : ""}
                    </Text>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {samples.map((v) => {
              const top = v;
              const bottom = showRoman
                ? `${sayMap[v]} • ${romaMap[v]}`
                : sayMap[v];

              return (
                <Tile
                  key={v}
                  v={v}
                  isActive={active === v}
                  isTouched={touched[v]}
                  labelTop={top}
                  labelBottom={bottom}
                  onPress={() => {
                    if (quizOn) {
                      // en quiz : réponse
                      answerQuiz(v);
                    } else {
                      // normal : écouter
                      speakOne(v);
                    }
                  }}
                />
              );
            })}
          </View>

          <View style={{ height: 12 }} />

          {/* Listen all / Stop */}
          {!isSpeaking ? (
            <PrimaryButton
              label="🔊 Écouter tout (séquencé)"
              onPress={() => speakSequence([...samples])}
              disabled={quizOn}
            />
          ) : (
            <PrimaryButton label="⏹ Stop" onPress={stopAll} />
          )}

          <View style={{ height: 10 }} />

          <GhostButton
            label="🔁 Reset progression (0/6)"
            disabled={isSpeaking}
            onPress={async () => {
              try {
                await Haptics.selectionAsync();
              } catch {}
              setTouched({
                ㅏ: false,
                ㅓ: false,
                ㅗ: false,
                ㅜ: false,
                ㅡ: false,
                ㅣ: false,
              });
            }}
          />
        </Card>

        {/* Extra: quick contrast hints */}
        <Card>
          <Text style={{ color: TXT, fontWeight: "900" }}>
            ⚡ Pièges fréquents
          </Text>
          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            • <Text style={{ color: TXT, fontWeight: "900" }}>ㅓ (eo)</Text> ≠
            ㅗ (o) : compare-les vite en alternant.{"\n"}•{" "}
            <Text style={{ color: TXT, fontWeight: "900" }}>ㅡ (eu)</Text> : son
            “centré”, bouche peu arrondie (très différent de “u”).{"\n"}• Passe
            en mode quiz quand tu connais visuellement les formes.
          </Text>
        </Card>

        {/* Compatibility: explicit stop block (comme ton ancien code) */}
        <Card>
          <GhostButton label="⏹ Stop audio" onPress={stopAll} />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}
