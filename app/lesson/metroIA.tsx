import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import CafeAvatar from "../../components/ai/CafeAvatar";
import ChoiceChips, { ChoiceItem } from "../../components/ai/ChoiceChips";

const BG0 = "#070812";
const BG1 = "#0d1322";
const BG2 = "#151122";

const TXT = "rgba(255,255,255,0.94)";
const MUTED = "rgba(255,255,255,0.64)";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.06)";
const NEON = "rgba(34,211,238,0.55)";
const NEON_SOFT = "rgba(34,211,238,0.16)";

type SceneChoice = ChoiceItem & {
  userText: string;
};

type Step = {
  id: string;
  narrator?: string;
  ai: string;
  aiMeaning: string;
  choices: SceneChoice[];
};

const STEPS: Step[] = [
  {
    id: "step-1",
    narrator: "Tu arrives dans la station et tu veux prendre la ligne 2.",
    ai: "저기요, 2호선 어디에서 타요?",
    aiMeaning: "Excusez-moi, où est-ce que je prends la ligne 2 ?",
    choices: [
      {
        id: "line2",
        label: "Demander la ligne 2",
        korean: "저기요, 2호선 어디에서 타요?",
        userText: "저기요, 2호선 어디에서 타요?",
        correct: true,
      },
      {
        id: "exit",
        label: "Demander la sortie",
        korean: "몇 번 출구예요?",
        userText: "몇 번 출구예요?",
      },
      {
        id: "ticket",
        label: "Demander la carte",
        korean: "교통카드는 어디에서 사요?",
        userText: "교통카드는 어디에서 사요?",
      },
    ],
  },
  {
    id: "step-2",
    narrator:
      "Un passant t’indique le bon quai. Tu veux vérifier la direction.",
    ai: "강남 방향 맞아요?",
    aiMeaning: "C’est bien dans la direction de Gangnam ?",
    choices: [
      {
        id: "gangnam",
        label: "Vérifier la direction",
        korean: "강남 방향 맞아요?",
        userText: "강남 방향 맞아요?",
        correct: true,
      },
      {
        id: "wrong-way",
        label: "Demander le terminus",
        korean: "종착역이 어디예요?",
        userText: "종착역이 어디예요?",
      },
      {
        id: "platform",
        label: "Demander le quai",
        korean: "이쪽 플랫폼이에요?",
        userText: "이쪽 플랫폼이에요?",
      },
    ],
  },
  {
    id: "step-3",
    narrator: "Tu dois sortir au bon endroit une fois arrivé.",
    ai: "몇 번 출구로 나가야 해요?",
    aiMeaning: "Je dois sortir par quelle sortie ?",
    choices: [
      {
        id: "exit-number",
        label: "Demander la sortie",
        korean: "몇 번 출구로 나가야 해요?",
        userText: "몇 번 출구로 나가야 해요?",
        correct: true,
      },
      {
        id: "left",
        label: "Demander gauche/droite",
        korean: "왼쪽으로 가면 돼요?",
        userText: "왼쪽으로 가면 돼요?",
      },
      {
        id: "transfer",
        label: "Demander correspondance",
        korean: "환승은 어디예요?",
        userText: "환승은 어디예요?",
      },
    ],
  },
];

const FINAL_STEP = {
  narrator: "Tu as trouvé le bon quai, la bonne direction et la bonne sortie.",
  ai: "네, 2번 출구로 나가세요. 좋은 하루 보내세요.",
  aiMeaning: "Oui, sortez par la sortie 2. Passez une bonne journée.",
};

function SmallAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color: TXT, fontSize: 14, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function MetroIaScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const speechTokenRef = useRef(0);

  const [stepIndex, setStepIndex] = useState(0);
  const [currentNarrator, setCurrentNarrator] = useState("");
  const [currentAi, setCurrentAi] = useState("");
  const [currentAiMeaning, setCurrentAiMeaning] = useState("");
  const [currentChoices, setCurrentChoices] = useState<SceneChoice[]>([]);

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    initScene();

    return () => {
      Speech.stop();
      speechTokenRef.current += 1;
    };
  }, []);

  const stopSpeech = () => {
    Speech.stop();
    speechTokenRef.current += 1;
    setSpeaking(false);
  };

  const speakAi = (text: string) => {
    const token = speechTokenRef.current + 1;
    speechTokenRef.current = token;

    Speech.stop();
    setSpeaking(true);

    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.92,
      pitch: 1.0,
      onDone: () => {
        if (speechTokenRef.current !== token) return;
        setSpeaking(false);
      },
      onStopped: () => {
        if (speechTokenRef.current !== token) return;
        setSpeaking(false);
      },
      onError: () => {
        if (speechTokenRef.current !== token) return;
        setSpeaking(false);
      },
    });
  };

  const playStep = (step: Step) => {
    setCurrentNarrator(step.narrator ?? "");
    setCurrentAi(step.ai);
    setCurrentAiMeaning(step.aiMeaning);
    setCurrentChoices(step.choices);
    setSelectedChoiceId(null);

    setTimeout(() => {
      speakAi(step.ai);
    }, 60);
  };

  const playFinalStep = () => {
    setCurrentNarrator(FINAL_STEP.narrator);
    setCurrentAi(FINAL_STEP.ai);
    setCurrentAiMeaning(FINAL_STEP.aiMeaning);
    setCurrentChoices([]);
    setSelectedChoiceId(null);

    setTimeout(() => {
      speakAi(FINAL_STEP.ai);
    }, 60);
  };

  const initScene = () => {
    stopSpeech();
    const first = STEPS[0];
    setStepIndex(0);
    playStep(first);
  };

  const animateSceneChange = (update: () => void) => {
    setIsTransitioning(true);
    stopSpeech();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 8,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      update();

      fadeAnim.setValue(0);
      translateAnim.setValue(8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const handleChoice = (choice: SceneChoice) => {
    if (isTransitioning) return;

    setSelectedChoiceId(choice.id);

    setTimeout(() => {
      const nextIndex = stepIndex + 1;

      if (nextIndex < STEPS.length) {
        const next = STEPS[nextIndex];

        animateSceneChange(() => {
          setStepIndex(nextIndex);
          playStep(next);
        });
      } else {
        animateSceneChange(() => {
          setStepIndex(STEPS.length);
          playFinalStep();
        });
      }
    }, 140);
  };

  const replayAi = () => {
    if (!currentAi) return;
    speakAi(currentAi);
  };

  const resetScene = () => {
    initScene();
  };

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ paddingVertical: 8, marginBottom: 2 }}
          hitSlop={10}
        >
          <Text style={{ color: MUTED, fontWeight: "800" }}>← Retour</Text>
        </Pressable>

        <View
          style={{
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: NEON_SOFT,
              borderWidth: 1,
              borderColor: "rgba(34,211,238,0.36)",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>
              Etape {Math.min(stepIndex + 1, STEPS.length)}/{STEPS.length}
            </Text>
          </View>

          <Text style={{ color: MUTED, fontSize: 12, fontWeight: "700" }}>
            Metro Seoul
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: LINE,
            overflow: "hidden",
            padding: 14,
            marginBottom: 12,
          }}
        >
          <LinearGradient
            colors={[
              "rgba(34,211,238,0.08)",
              "rgba(59,130,246,0.06)",
              "rgba(255,255,255,0.02)",
            ]}
            style={{
              alignItems: "center",
              borderRadius: 20,
            }}
          >
            <CafeAvatar speaking={speaking} compact={false} immersive />

            <Text
              style={{
                color: TXT,
                fontSize: 22,
                fontWeight: "900",
                marginTop: 12,
              }}
            >
              Subway Helper - 지하철
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 13,
                marginTop: 4,
                marginBottom: 12,
              }}
            >
              Conversation guidée dans le métro
            </Text>

            <Animated.View
              style={{
                width: "100%",
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim }],
              }}
            >
              {!!currentNarrator && (
                <View
                  style={{
                    width: "100%",
                    borderRadius: 18,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: TXT,
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: "700",
                    }}
                  >
                    {currentNarrator}
                  </Text>
                </View>
              )}

              <View
                style={{
                  width: "100%",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  backgroundColor: "rgba(10,10,16,0.42)",
                  borderWidth: 1,
                  borderColor: speaking
                    ? "rgba(34,211,238,0.34)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.56)",
                    fontSize: 11,
                    fontWeight: "800",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Dialogue
                </Text>

                <Text
                  style={{
                    color: TXT,
                    fontSize: 19,
                    lineHeight: 27,
                    fontWeight: "900",
                  }}
                >
                  {currentAi}
                </Text>

                {!!currentAiMeaning && (
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.72)",
                      fontSize: 14,
                      lineHeight: 20,
                      marginTop: 8,
                    }}
                  >
                    {currentAiMeaning}
                  </Text>
                )}
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        {currentChoices.length > 0 && (
          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: LINE,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: TXT,
                fontSize: 18,
                fontWeight: "900",
                marginBottom: 12,
              }}
            >
              Choisis une réponse
            </Text>

            <ChoiceChips
              choices={currentChoices}
              disabled={isTransitioning}
              selectedId={selectedChoiceId}
              onSelect={(choice) => handleChoice(choice as SceneChoice)}
            />
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <SmallAction label="Réécouter" onPress={replayAi} />
          <SmallAction label="Recommencer" onPress={resetScene} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
