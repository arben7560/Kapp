import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

const BG0 = "#070812";
const CARD = "rgba(255,255,255,0.06)";
const LINE = "rgba(255,255,255,0.10)";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.62)";

const CYAN = "rgba(34,211,238,0.55)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PURPLE = "rgba(124,58,237,0.55)";
const PURPLE_BG = "rgba(124,58,237,0.12)";
const GREEN = "rgba(34,197,94,0.55)";
const GREEN_BG = "rgba(34,197,94,0.12)";
const AMBER = "rgba(245,158,11,0.55)";
const AMBER_BG = "rgba(245,158,11,0.12)";
const RED = "rgba(239,68,68,0.55)";
const RED_BG = "rgba(239,68,68,0.12)";

type StepId = 0 | 1 | 2 | 3 | 4 | 5;

type BeatStep = {
  id: StepId;
  title: string;
  subtitle: string;
  beats: string[];
  focusLabel: string;
  focusValue: string;
  focusHint: string;
  question: string;
  options: { label: string; correct: boolean; explain: string }[];
  resultTitle: string;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: LINE,
        padding: 16,
      }}
    >
      {children}
    </View>
  );
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "cyan" | "purple" | "green" | "amber" | "red";
}) {
  const toneMap = {
    neutral: {
      bg: "rgba(255,255,255,0.05)",
      br: "rgba(255,255,255,0.14)",
    },
    cyan: {
      bg: CYAN_BG,
      br: CYAN,
    },
    purple: {
      bg: PURPLE_BG,
      br: PURPLE,
    },
    green: {
      bg: GREEN_BG,
      br: GREEN,
    },
    amber: {
      bg: AMBER_BG,
      br: AMBER,
    },
    red: {
      bg: RED_BG,
      br: RED,
    },
  };

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: toneMap[tone].br,
        backgroundColor: toneMap[tone].bg,
      }}
    >
      <Text style={{ color: TXT, fontSize: 12, fontWeight: "800" }}>
        {children}
      </Text>
    </View>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <View
          key={n}
          style={{
            width: n === step ? 22 : 10,
            height: 10,
            borderRadius: 999,
            backgroundColor:
              n <= step ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.18)",
          }}
        />
      ))}
    </View>
  );
}

function ChoiceCard({
  label,
  selected,
  reveal,
  correct,
  onPress,
}: {
  label: string;
  selected: boolean;
  reveal: boolean;
  correct: boolean;
  onPress: () => void;
}) {
  const borderColor = !reveal
    ? selected
      ? "rgba(255,255,255,0.24)"
      : LINE
    : correct
      ? GREEN
      : selected
        ? RED
        : LINE;

  const backgroundColor = !reveal
    ? selected
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.04)"
    : correct
      ? GREEN_BG
      : selected
        ? RED_BG
        : "rgba(255,255,255,0.04)";

  return (
    <Pressable
      onPress={onPress}
      disabled={reveal}
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor,
        backgroundColor,
        padding: 14,
        marginTop: 10,
      }}
    >
      <Text style={{ color: TXT, fontWeight: "800", lineHeight: 21 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function FocusCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(124,58,237,0.35)",
        backgroundColor: "rgba(124,58,237,0.12)",
        padding: 14,
      }}
    >
      <Text style={{ color: MUTED, fontSize: 12, fontWeight: "800" }}>
        {label}
      </Text>
      <Text
        style={{ color: TXT, fontSize: 22, fontWeight: "900", marginTop: 8 }}
      >
        {value}
      </Text>
      <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>{hint}</Text>
    </View>
  );
}

export default function GangnamRainRunScreen() {
  const steps: BeatStep[] = useMemo(
    () => [
      {
        id: 1,
        title: "Sortie 5",
        subtitle: "La ville apparaît d’un coup.",
        beats: [
          "Il est un peu plus de 20h quand tu remontes les escaliers de Gangnam Station.",
          "Les portes s’ouvrent sur une ville dense, brillante, saturée de lumière.",
          "Tu débouches à la sortie 5, parmi les écrans, les taxis et les passants pressés.",
          "Gangnam ne te parle pas encore, mais tout te dit déjà où tu es.",
        ],
        focusLabel: "Focus immersif",
        focusValue: "5번 출구",
        focusHint:
          "출구 = sortie, 번 = numéro. Ici, le décor urbain te guide déjà sans dialogue.",
        question: "Que signifie le panneau 5번 출구 ?",
        options: [
          {
            label: "La sortie numéro 5",
            correct: true,
            explain:
              "Oui. Dans le métro coréen, les sorties sont numérotées et deviennent de vrais repères mentaux.",
          },
          {
            label: "La ligne 5 du métro",
            correct: false,
            explain: "Non. Ici, 출구 indique une sortie, pas une ligne.",
          },
          {
            label: "Le quai numéro 5",
            correct: false,
            explain: "Non. Le mot important ici est bien 출구, sortie.",
          },
        ],
        resultTitle:
          "Tu viens d’apprendre à lire le premier repère de la scène.",
      },
      {
        id: 2,
        title: "La pluie",
        subtitle: "Le décor change de rythme.",
        beats: [
          "Tu avances à peine de quelques mètres quand la pluie commence.",
          "D’abord quelques gouttes sur le trottoir, puis une vraie averse d’été, lourde et rapide.",
          "Autour de toi, les parapluies s’ouvrent presque en même temps.",
          "Le sol devient miroir. Les néons glissent dans l’eau.",
        ],
        focusLabel: "Focus immersif",
        focusValue: "우산",
        focusHint:
          "우산 = parapluie. Le détail central de cette étape n’est pas la pluie elle-même, mais ce qui te manque pour continuer.",
        question: "Quel comportement paraît le plus naturel ici ?",
        options: [
          {
            label: "Rester au milieu du passage pour regarder autour de soi",
            correct: false,
            explain:
              "Non. Dans un flux dense, on évite de bloquer la circulation des autres.",
          },
          {
            label: "Continuer à avancer en gardant le flux, même sous la pluie",
            correct: true,
            explain:
              "Oui. L’un des codes implicites les plus visibles ici, c’est de ne pas casser le rythme collectif.",
          },
          {
            label: "S’arrêter net pour appeler quelqu’un en parlant fort",
            correct: false,
            explain:
              "Non. Ce serait en décalage avec l’énergie fluide du lieu.",
          },
        ],
        resultTitle:
          "Tu viens de lire un comportement urbain, pas seulement un mot.",
      },
      {
        id: 3,
        title: "Le niveau -1",
        subtitle: "Tu choisis d’agir, sans quitter la scène.",
        beats: [
          "Ton amie est presque arrivée au restaurant BBQ et t’appelle pour savoir où tu es.",
          "Tu regardes le GPS, mais la pluie rend chaque seconde plus inconfortable.",
          "Tu te rappelles alors qu’au niveau -1 de la gare, il y a souvent des commerces utiles.",
          "Tu redescends rapidement : ce n’est pas une fuite, c’est la logique du lieu.",
        ],
        focusLabel: "Focus immersif",
        focusValue: "지하 -1",
        focusHint:
          "Dans les grandes stations coréennes, les niveaux souterrains sont souvent pleins de commerces pratiques : cafés, convenience stores, snacks, parapluies.",
        question:
          "Pourquoi redescendre au niveau -1 est une décision réaliste ici ?",
        options: [
          {
            label:
              "Parce que les stations coréennes ont souvent des zones commerciales souterraines",
            correct: true,
            explain:
              "Oui. C’est une logique très réelle du décor urbain, surtout dans les grands pôles comme Gangnam.",
          },
          {
            label: "Parce qu’il faut toujours changer de ligne quand il pleut",
            correct: false,
            explain:
              "Non. Ici, le niveau -1 sert surtout de zone pratique et commerciale.",
          },
          {
            label: "Parce que les restaurants sont obligatoirement sous terre",
            correct: false,
            explain:
              "Non. Le restaurant est plus loin, dans les ruelles derrière les grands immeubles.",
          },
        ],
        resultTitle:
          "Tu comprends maintenant la géographie pratique de la station.",
      },
      {
        id: 4,
        title: "La caisse",
        subtitle: "Une interaction minimale, mais très coréenne.",
        beats: [
          "Tu repères rapidement une convenience store près de l’entrée souterraine.",
          "Juste à côté des produits de saison, un bac de parapluies transparents t’attend presque comme une évidence.",
          "Tu en prends un. Quelques secondes plus tard, tu es déjà à la caisse.",
          "Le vendeur parle peu. Tout est bref, clair, fonctionnel.",
        ],
        focusLabel: "Focus immersif",
        focusValue: "봉투 필요하세요?",
        focusHint:
          "Une question très typique à la caisse : besoin d’un sac ? Même quand tu achètes peu, ce type de phrase revient souvent.",
        question: "Que signifie 봉투 필요하세요 ?",
        options: [
          {
            label: "Vous voulez un reçu ?",
            correct: false,
            explain: "Non. La phrase concerne ici le sac.",
          },
          {
            label: "Vous avez besoin d’un sac ?",
            correct: true,
            explain:
              "Oui. 봉투 = sac. Tu reconnais maintenant une vraie phrase de caisse dans un contexte réel.",
          },
          {
            label: "Vous voulez réchauffer votre plat ?",
            correct: false,
            explain: "Non. Ce serait une autre logique de scène.",
          },
        ],
        resultTitle:
          "Tu viens de transformer une phrase entendue en compréhension réelle.",
      },
      {
        id: 5,
        title: "Les ruelles BBQ",
        subtitle: "Le décor se referme enfin autour du rendez-vous.",
        beats: [
          "Tu remontes à la surface. La pluie est toujours là, mais maintenant elle glisse sur ton parapluie transparent.",
          "Tu quittes l’avenue principale et t’engages dans les petites rues derrière les grands bâtiments.",
          "Les enseignes deviennent plus proches, les odeurs plus présentes, les restaurants plus visibles.",
          "Sous une enseigne rouge de 삼겹살, quelqu’un t’attend déjà à l’abri.",
        ],
        focusLabel: "Focus immersif",
        focusValue: "삼겹살",
        focusHint:
          "삼겹살 = poitrine de porc grillée. Dans les ruelles de Gangnam, les restaurants BBQ participent fortement à l’ambiance du soir.",
        question: "Qu’est-ce que cette dernière étape t’apprend surtout ?",
        options: [
          {
            label: "Que Gangnam n’est composé que de grandes avenues",
            correct: false,
            explain:
              "Non. Les petites rues derrière les grands axes font aussi partie de son identité.",
          },
          {
            label:
              "Que les ruelles cachées concentrent souvent restaurants, enseignes et vie du soir",
            correct: true,
            explain:
              "Oui. Tu lis maintenant la structure urbaine plus finement : grande avenue devant, vie sociale plus dense derrière.",
          },
          {
            label:
              "Qu’il faut forcément parler à quelqu’un pour trouver un restaurant",
            correct: false,
            explain:
              "Non. Ici, l’apprentissage passe par l’observation du décor et des repères.",
          },
        ],
        resultTitle:
          "Tu as traversé Gangnam comme un décor vivant, pas comme un exercice.",
      },
    ],
    [],
  );

  const [step, setStep] = useState<StepId>(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  const currentStep = step > 0 ? steps[step - 1] : null;

  useEffect(() => {
    if (!currentStep) return;
    setBeatIndex(1);

    let i = 1;
    const interval = setInterval(() => {
      i += 1;
      if (i <= currentStep.beats.length) {
        setBeatIndex(i);
      } else {
        clearInterval(interval);
      }
    }, 850);

    return () => clearInterval(interval);
  }, [step, currentStep]);

  function startStep(s: StepId) {
    setStep(s);
    setSelected(null);
    setRevealed(false);
  }

  function validateAnswer() {
    if (selected === null || !currentStep) return;
    const ok = currentStep.options[selected].correct;
    setRevealed(true);
    setAnswers((prev) => ({ ...prev, [currentStep.id]: ok }));
  }

  function nextStep() {
    if (step < 5) {
      startStep((step + 1) as StepId);
    } else {
      setStep(0);
    }
  }

  function replayAll() {
    setAnswers({});
    setSelected(null);
    setRevealed(false);
    setBeatIndex(0);
    setStep(0);
  }

  const score = Object.values(answers).filter(Boolean).length;

  return (
    <LinearGradient colors={[BG0, "#0b0f22", "#0e132d"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: LINE,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text style={{ color: TXT, fontWeight: "900" }}>← Retour</Text>
            </Pressable>

            <Pill tone="cyan">Capsule signature</Pill>
          </View>

          <View style={{ height: 14 }} />

          <View
            style={{
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: CARD,
            }}
          >
            <Image
              source={require("../../assets/immersion/gangnam.png")}
              resizeMode="cover"
              style={{ width: "100%", height: 240 }}
            />

            <View
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.18)",
              }}
            />

            <View
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <Pill tone="purple">Gangnam Rain Run</Pill>
                <Pill tone="amber">pluie</Pill>
                <Pill tone="green">observation réelle</Pill>
              </View>

              <Text style={{ color: TXT, fontSize: 26, fontWeight: "900" }}>
                🚇 Gangnam Rain Run
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.80)",
                  marginTop: 8,
                  lineHeight: 21,
                }}
              >
                Sors du métro, traverse la pluie, lis la ville et rejoins ton
                amie sans basculer dans un simple exercice.
              </Text>
            </View>
          </View>

          <View style={{ height: 16 }} />

          {step === 0 ? (
            <>
              <Card>
                <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
                  Une capsule pensée pour être vécue
                </Text>

                <Text style={{ color: MUTED, marginTop: 10, lineHeight: 22 }}>
                  Cette capsule ne t’apprend pas à demander ton chemin. Elle
                  t’apprend à lire Gangnam de nuit : ses sorties, sa pluie, ses
                  niveaux souterrains, ses convenience stores et ses ruelles
                  BBQ.
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 14,
                  }}
                >
                  <Pill tone="purple">scène vivante</Pill>
                  <Pill tone="cyan">1 détail fort / étape</Pill>
                  <Pill tone="green">débrief premium</Pill>
                </View>

                <Pressable
                  onPress={() => startStep(1)}
                  style={{
                    marginTop: 18,
                    borderRadius: 18,
                    paddingVertical: 14,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.18)",
                    backgroundColor: "rgba(255,255,255,0.92)",
                  }}
                >
                  <Text style={{ textAlign: "center", fontWeight: "900" }}>
                    Commencer l’expérience
                  </Text>
                </Pressable>
              </Card>

              {score > 0 && (
                <Card>
                  <Text style={{ color: TXT, fontSize: 17, fontWeight: "900" }}>
                    Dernière performance
                  </Text>
                  <Text style={{ color: MUTED, marginTop: 8 }}>
                    Tu avais reconnu {score}/5 détails clés de la capsule.
                  </Text>

                  <Pressable
                    onPress={replayAll}
                    style={{
                      marginTop: 14,
                      borderRadius: 16,
                      paddingVertical: 13,
                      borderWidth: 1,
                      borderColor: LINE,
                      backgroundColor: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <Text
                      style={{
                        color: TXT,
                        textAlign: "center",
                        fontWeight: "900",
                      }}
                    >
                      Rejouer depuis le début
                    </Text>
                  </Pressable>
                </Card>
              )}
            </>
          ) : (
            <>
              <Card>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: TXT, fontSize: 19, fontWeight: "900" }}
                    >
                      {currentStep?.title}
                    </Text>
                    <Text style={{ color: MUTED, marginTop: 4 }}>
                      {currentStep?.subtitle}
                    </Text>
                  </View>

                  <Pill tone="cyan">Étape {step}/5</Pill>
                </View>

                <View style={{ marginTop: 14 }}>
                  <ProgressDots step={step} />
                </View>

                <View style={{ marginTop: 16 }}>
                  {currentStep?.beats.slice(0, beatIndex).map((line, idx) => (
                    <Text
                      key={`${currentStep.id}_${idx}`}
                      style={{
                        color:
                          idx === beatIndex - 1
                            ? TXT
                            : "rgba(255,255,255,0.78)",
                        fontSize: 16,
                        lineHeight: 24,
                        marginTop: idx === 0 ? 0 : 12,
                      }}
                    >
                      {line}
                    </Text>
                  ))}
                </View>

                <FocusCard
                  label={currentStep?.focusLabel ?? ""}
                  value={currentStep?.focusValue ?? ""}
                  hint={currentStep?.focusHint ?? ""}
                />
              </Card>

              <View style={{ height: 16 }} />

              <Card>
                <Text style={{ color: TXT, fontSize: 17, fontWeight: "900" }}>
                  🎯 Mini lecture du réel
                </Text>

                <Text style={{ color: MUTED, marginTop: 8, lineHeight: 21 }}>
                  {currentStep?.question}
                </Text>

                {currentStep?.options.map((opt, idx) => (
                  <ChoiceCard
                    key={`${currentStep.id}_${idx}`}
                    label={opt.label}
                    selected={selected === idx}
                    reveal={revealed}
                    correct={opt.correct}
                    onPress={() => setSelected(idx)}
                  />
                ))}

                <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                  <Pressable
                    onPress={validateAnswer}
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      paddingVertical: 13,
                      borderWidth: 1,
                      borderColor: "rgba(34,211,238,0.32)",
                      backgroundColor: "rgba(34,211,238,0.12)",
                      opacity: selected === null ? 0.5 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: TXT,
                        textAlign: "center",
                        fontWeight: "900",
                      }}
                    >
                      Vérifier
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setSelected(null);
                      setRevealed(false);
                    }}
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      paddingVertical: 13,
                      borderWidth: 1,
                      borderColor: LINE,
                      backgroundColor: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <Text
                      style={{
                        color: TXT,
                        textAlign: "center",
                        fontWeight: "900",
                      }}
                    >
                      Rechoisir
                    </Text>
                  </Pressable>
                </View>

                {revealed && selected !== null && currentStep && (
                  <View
                    style={{
                      marginTop: 14,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: currentStep.options[selected].correct
                        ? GREEN
                        : RED,
                      backgroundColor: currentStep.options[selected].correct
                        ? GREEN_BG
                        : RED_BG,
                      padding: 14,
                    }}
                  >
                    <Text style={{ color: TXT, fontWeight: "900" }}>
                      {currentStep.options[selected].correct
                        ? "Bien vu"
                        : "Presque"}
                    </Text>
                    <Text
                      style={{ color: MUTED, marginTop: 8, lineHeight: 21 }}
                    >
                      {currentStep.options[selected].explain}
                    </Text>

                    <Text
                      style={{ color: TXT, marginTop: 10, fontWeight: "800" }}
                    >
                      {currentStep.resultTitle}
                    </Text>
                  </View>
                )}

                {revealed && (
                  <Pressable
                    onPress={nextStep}
                    style={{
                      marginTop: 14,
                      borderRadius: 16,
                      paddingVertical: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.20)",
                      backgroundColor: "rgba(255,255,255,0.92)",
                    }}
                  >
                    <Text style={{ textAlign: "center", fontWeight: "900" }}>
                      {step < 5 ? "Étape suivante" : "Voir le débrief final"}
                    </Text>
                  </Pressable>
                )}
              </Card>

              {step === 5 && revealed && (
                <>
                  <View style={{ height: 16 }} />

                  <Card>
                    <Text
                      style={{ color: TXT, fontSize: 18, fontWeight: "900" }}
                    >
                      ✨ Débrief premium
                    </Text>

                    <View style={{ marginTop: 14, gap: 10 }}>
                      <View
                        style={{
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: "rgba(124,58,237,0.35)",
                          backgroundColor: "rgba(124,58,237,0.12)",
                          padding: 14,
                        }}
                      >
                        <Text
                          style={{
                            color: MUTED,
                            fontSize: 12,
                            fontWeight: "800",
                          }}
                        >
                          Ce que tu as vécu
                        </Text>
                        <Text
                          style={{ color: TXT, marginTop: 8, lineHeight: 22 }}
                        >
                          Tu es sorti de Gangnam Station sous la pluie, tu as
                          redescendu vers le niveau -1, acheté un parapluie,
                          puis traversé les ruelles jusqu’au BBQ.
                        </Text>
                      </View>

                      <View
                        style={{
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: "rgba(34,211,238,0.35)",
                          backgroundColor: "rgba(34,211,238,0.10)",
                          padding: 14,
                        }}
                      >
                        <Text
                          style={{
                            color: MUTED,
                            fontSize: 12,
                            fontWeight: "800",
                          }}
                        >
                          Ce que tu as remarqué
                        </Text>
                        <Text
                          style={{ color: TXT, marginTop: 8, lineHeight: 22 }}
                        >
                          5번 출구, 우산, 지하 -1, 봉투 필요하세요?, 삼겹살.
                        </Text>
                      </View>

                      <View
                        style={{
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: "rgba(34,197,94,0.35)",
                          backgroundColor: "rgba(34,197,94,0.10)",
                          padding: 14,
                        }}
                      >
                        <Text
                          style={{
                            color: MUTED,
                            fontSize: 12,
                            fontWeight: "800",
                          }}
                        >
                          Ce que tu as compris du réel coréen
                        </Text>
                        <Text
                          style={{ color: TXT, marginTop: 8, lineHeight: 22 }}
                        >
                          À Gangnam, les sorties numérotées structurent
                          l’espace, les niveaux souterrains sont pratiques, les
                          interactions en caisse restent minimales, et la vraie
                          vie du soir se prolonge souvent dans les ruelles
                          derrière les grands axes.
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 14,
                      }}
                    >
                      <Pill tone="cyan">Score {score}/5</Pill>
                      <Pill tone="purple">immersion urbaine</Pill>
                      <Pill tone="green">lecture du réel</Pill>
                    </View>

                    <Pressable
                      onPress={replayAll}
                      style={{
                        marginTop: 16,
                        borderRadius: 16,
                        paddingVertical: 14,
                        borderWidth: 1,
                        borderColor: LINE,
                        backgroundColor: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <Text
                        style={{
                          color: TXT,
                          textAlign: "center",
                          fontWeight: "900",
                        }}
                      >
                        Rejouer la capsule
                      </Text>
                    </Pressable>
                  </Card>
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
