import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import CafeAvatar from "../../components/ai/CafeAvatar";
import ChoiceChips, { ChoiceItem } from "../../components/ai/ChoiceChips";

const BG0 = "#070812";
const BG1 = "#0d1322";
const BG2 = "#151122";

const TXT = "rgba(255,255,255,0.94)";
const MUTED = "rgba(255,255,255,0.64)";
const SOFT = "rgba(255,255,255,0.78)";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.06)";
const CARD_DARK = "rgba(8,10,18,0.42)";

const PURPLE_SOFT = "rgba(168,85,247,0.18)";
const CYAN_SOFT = "rgba(34,211,238,0.14)";
const GLOW_LINE = "rgba(168,85,247,0.34)";

type SceneChoice = ChoiceItem & {
  userText: string;
  hint?: string;
};

type Step = {
  id: string;
  phase: string;
  narrator?: string;
  ai: string;
  aiRomanized?: string;
  aiMeaning: string;
  choices: SceneChoice[];
};

const STEPS: Step[] = [
  {
    id: "step-1",
    phase: "Accueil",
    ai: "어서 오세요. 무엇을 도와드릴까요?",
    aiRomanized: "Eoseo oseyo. Mueoseul dowadeurilkkayo?",
    aiMeaning: "Bienvenue. Que puis-je faire pour vous ?",
    choices: [
      {
        id: "americano",
        label: "Je voudrais un americano glacé",
        korean: "아이스 아메리카노 한 잔 주세요.",
        userText: "아이스 아메리카노 한 잔 주세요.",
        hint: "Une façon naturelle de commander une boisson.",
        correct: true,
      },
      {
        id: "latte",
        label: "Je voudrais un café latte",
        korean: "카페라테 한 잔 주세요.",
        userText: "카페라테 한 잔 주세요.",
        hint: "Même structure, avec une autre boisson.",
        correct: true,
      },
      {
        id: "wait",
        label: "Je regarde encore",
        korean: "조금 더 볼게요.",
        userText: "조금 더 볼게요.",
        hint: "Utile si tu veux encore regarder le menu.",
        correct: true,
      },
    ],
  },
  {
    id: "step-2",
    phase: "Commande",
    narrator: "Minji note calmement ta commande et attend ta réponse.",
    ai: "매장에서 드시나요, 가지고 가시나요?",
    aiRomanized: "Maejangeseo deusinayo, gajigo gasinayo?",
    aiMeaning: "Sur place ou à emporter ?",
    choices: [
      {
        id: "takeaway",
        label: "À emporter",
        korean: "가지고 갈게요.",
        userText: "가지고 갈게요.",
        hint: "Forme naturelle, conversationnelle.",
        correct: true,
      },
      {
        id: "here",
        label: "Sur place",
        korean: "여기서 마실게요.",
        userText: "여기서 마실게요.",
        hint: "Très intuitif pour dire que tu bois ici.",
        correct: true,
      },
      {
        id: "simple",
        label: "À emporter (forme très courante)",
        korean: "포장이에요.",
        userText: "포장이에요.",
        hint: "Très fréquent dans les cafés en Corée.",
        correct: true,
      },
    ],
  },
  {
    id: "step-3",
    phase: "Nom",
    narrator: "Minji prépare le gobelet et te demande ton nom.",
    ai: "네, 성함이 어떻게 되세요?",
    aiRomanized: "Ne, seonghami eotteoke doeseyo?",
    aiMeaning: "D'accord, quel est votre nom ?",
    choices: [
      {
        id: "name",
        label: "Répondre avec ton prénom",
        korean: "민수예요.",
        userText: "민수예요.",
        hint: "Remplace 민수 par ton propre prénom.",
        correct: true,
      },
      {
        id: "name-polite",
        label: "Répondre de façon plus polie",
        korean: "제 이름은 민수예요.",
        userText: "제 이름은 민수예요.",
        hint: "Remplace 민수 par ton propre prénom.",
        correct: true,
      },
      {
        id: "repeat",
        label: "Faire répéter",
        korean: "죄송한데 다시 말씀해 주세요.",
        userText: "죄송한데 다시 말씀해 주세요.",
        hint: "Très utile si tu n'as pas bien entendu.",
        correct: true,
      },
    ],
  },
];

const FINAL_STEP = {
  phase: "Terminé",
  narrator: "Minji finalise tranquillement la commande.",
  ai: "주문이 완료됐어요. 감사합니다.",
  aiRomanized: "Jumuni wallyo dwaesseoyo. Gamsahamnida.",
  aiMeaning: "La commande est terminée. Merci.",
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
        borderRadius: 16,
        paddingVertical: 13,
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

function ProgressPill({ label, active }: { label: string; active: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? CYAN_SOFT : "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: active
          ? "rgba(34,211,238,0.34)"
          : "rgba(255,255,255,0.08)",
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : MUTED,
          fontSize: 12,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function HintCard({ text }: { text: string }) {
  return (
    <View
      style={{
        marginTop: 12,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text
        style={{
          color: SOFT,
          fontSize: 13,
          lineHeight: 18,
          fontWeight: "600",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export default function CafeIaScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const [stepIndex, setStepIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");
  const [currentNarrator, setCurrentNarrator] = useState("");
  const [currentAi, setCurrentAi] = useState("");
  const [currentAiRomanized, setCurrentAiRomanized] = useState("");
  const [currentAiMeaning, setCurrentAiMeaning] = useState("");
  const [currentChoices, setCurrentChoices] = useState<SceneChoice[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedChoiceHint, setSelectedChoiceHint] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const speechTokenRef = useRef(0);

  const progressLabels = useMemo(() => ["Accueil", "Commande", "Nom"], []);

  useEffect(() => {
    initScene();

    return () => {
      Speech.stop();
      speechTokenRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (speaking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 420,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 420,
            useNativeDriver: false,
          }),
        ]),
      );
      loop.start();

      return () => {
        loop.stop();
      };
    }

    pulseAnim.stopAnimation();
    pulseAnim.setValue(0);
  }, [speaking, pulseAnim]);

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
    setCurrentPhase(step.phase);
    setCurrentNarrator(step.narrator ?? "");
    setCurrentAi(step.ai);
    setCurrentAiRomanized(step.aiRomanized ?? "");
    setCurrentAiMeaning(step.aiMeaning);
    setCurrentChoices(step.choices);
    setSelectedChoiceId(null);
    setSelectedChoiceHint("");

    setTimeout(() => {
      speakAi(step.ai);
    }, 80);
  };

  const playFinalStep = () => {
    setCurrentPhase(FINAL_STEP.phase);
    setCurrentNarrator(FINAL_STEP.narrator);
    setCurrentAi(FINAL_STEP.ai);
    setCurrentAiRomanized(FINAL_STEP.aiRomanized);
    setCurrentAiMeaning(FINAL_STEP.aiMeaning);
    setCurrentChoices([]);
    setSelectedChoiceId(null);
    setSelectedChoiceHint("");

    setTimeout(() => {
      speakAi(FINAL_STEP.ai);
    }, 80);
  };

  const initScene = () => {
    stopSpeech();
    setStepIndex(0);
    playStep(STEPS[0]);
  };

  const animateSceneChange = (update: () => void) => {
    setIsTransitioning(true);
    stopSpeech();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      update();

      fadeAnim.setValue(0);
      translateAnim.setValue(10);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 190,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 190,
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
    setSelectedChoiceHint(choice.hint ?? "");

    setTimeout(() => {
      const nextIndex = stepIndex + 1;

      if (nextIndex < STEPS.length) {
        animateSceneChange(() => {
          setStepIndex(nextIndex);
          playStep(STEPS[nextIndex]);
        });
      } else {
        animateSceneChange(() => {
          setStepIndex(STEPS.length);
          playFinalStep();
        });
      }
    }, 220);
  };

  const replayAi = () => {
    if (!currentAi) return;
    speakAi(currentAi);
  };

  const resetScene = () => {
    initScene();
  };

  const speakingBorderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.08)", GLOW_LINE],
  });

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            marginBottom: 14,
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
              backgroundColor: PURPLE_SOFT,
              borderWidth: 1,
              borderColor: "rgba(168,85,247,0.36)",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>
              Étape {Math.min(stepIndex + 1, STEPS.length)}/{STEPS.length}
            </Text>
          </View>

          <Text style={{ color: MUTED, fontSize: 12, fontWeight: "700" }}>
            Gangnam Cafe • Seoul
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {progressLabels.map((label, index) => (
            <ProgressPill
              key={label}
              label={label}
              active={stepIndex >= index}
            />
          ))}
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 26,
            borderWidth: 1,
            borderColor: LINE,
            overflow: "hidden",
            padding: 14,
            marginBottom: 18,
          }}
        >
          <LinearGradient
            colors={[
              "rgba(168,85,247,0.10)",
              "rgba(34,211,238,0.06)",
              "rgba(255,255,255,0.02)",
            ]}
            style={{
              borderRadius: 22,
              paddingBottom: 10,
              alignItems: "center",
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
              Minji • 바리스타
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 13,
                marginTop: 4,
                marginBottom: 14,
              }}
            >
              Gangnam Cafe • Seoul
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
                    paddingHorizontal: 13,
                    paddingVertical: 11,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: SOFT,
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: "700",
                    }}
                  >
                    {currentNarrator}
                  </Text>
                </View>
              )}

              <Animated.View
                style={{
                  width: "100%",
                  borderRadius: 22,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  backgroundColor: CARD_DARK,
                  borderWidth: 1,
                  borderColor: speaking
                    ? speakingBorderColor
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: speaking ? "#fff" : "rgba(255,255,255,0.56)",
                      fontSize: 11,
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                    }}
                  >
                    Minji
                  </Text>

                  <View
                    style={{
                      paddingHorizontal: 9,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor: speaking
                        ? PURPLE_SOFT
                        : "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor: speaking
                        ? "rgba(168,85,247,0.34)"
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text
                      style={{
                        color: speaking ? "#fff" : MUTED,
                        fontSize: 11,
                        fontWeight: "800",
                      }}
                    >
                      {currentPhase}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: TXT,
                    fontSize: 20,
                    lineHeight: 29,
                    fontWeight: "900",
                  }}
                >
                  {currentAi}
                </Text>

                {!!currentAiRomanized && (
                  <Text
                    style={{
                      color: "rgba(34,211,238,0.92)",
                      fontSize: 13,
                      lineHeight: 19,
                      marginTop: 8,
                      fontStyle: "italic",
                    }}
                  >
                    {currentAiRomanized}
                  </Text>
                )}

                {!!currentAiMeaning && (
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.74)",
                      fontSize: 14,
                      lineHeight: 21,
                      marginTop: 10,
                    }}
                  >
                    {currentAiMeaning}
                  </Text>
                )}
              </Animated.View>
            </Animated.View>
          </LinearGradient>
        </View>

        {currentChoices.length > 0 && (
          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: LINE,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: TXT,
                fontSize: 18,
                fontWeight: "900",
                marginBottom: 6,
              }}
            >
              Que dis-tu à Minji ?
            </Text>

            <Text
              style={{
                color: MUTED,
                fontSize: 13,
                lineHeight: 18,
                marginBottom: 14,
              }}
            >
              Choisis la réponse qui te semble la plus naturelle dans ce
              contexte.
            </Text>

            <ChoiceChips
              choices={currentChoices}
              disabled={isTransitioning}
              selectedId={selectedChoiceId}
              onSelect={(choice) => handleChoice(choice as SceneChoice)}
            />

            {!!selectedChoiceHint && <HintCard text={selectedChoiceHint} />}
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <SmallAction label="🔊 Réécouter" onPress={replayAi} />
          <SmallAction label="↺ Recommencer" onPress={resetScene} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
