import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ChoiceChips from "../../components/ai/ChoiceChips";
import {
  createInitialMetroState,
  getMetroLessonById,
  getMetroStepById,
  getNextMetroState,
  metroLessons,
  type MetroChoice,
  type MetroLesson,
  type MetroPhase,
  type MetroState,
  type MetroStep,
} from "./data/metro/index";

const BG0 = "#070812";
const BG1 = "#0D1322";
const BG2 = "#151122";

const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.64)";
const SOFT = "rgba(255,255,255,0.80)";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.06)";
const CARD_SOFT = "rgba(255,255,255,0.04)";
const BUBBLE = "rgba(15,18,35,0.78)";
const USER_BUBBLE = "rgba(255,255,255,0.05)";

const CYAN_SOFT = "rgba(34,211,238,0.16)";
const CYAN_LINE = "rgba(34,211,238,0.34)";
const CYAN_TEXT = "#8BE9F9";
const CYAN_ACTIVE_BG = "rgba(34,211,238,0.22)";
const CYAN_ACTIVE_BORDER = "rgba(34,211,238,0.72)";

const PURPLE_TEXT = "#D8B4FE";
const AMBER_TEXT = "#FCD34D";

const PROGRESS_LABELS = ["Accueil", "Ligne", "Direction", "Trajet", "Sortie"];

type ChatMessage =
  | {
      id: string;
      role: "ai";
      korean?: string;
      romanization?: string;
      french?: string;
      phase?: MetroPhase;
    }
  | {
      id: string;
      role: "user";
      label: string;
      korean?: string;
      romanization?: string;
    };

type ScenarioMeta = {
  subtitle: string;
  badge: string | null;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
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
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 14,
        paddingVertical: 13,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: CARD_SOFT,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        opacity: pressed ? 0.94 : 1,
      })}
    >
      <Text style={{ color: TXT, fontSize: 13, fontWeight: "900" }}>
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
        borderColor: active ? CYAN_LINE : "rgba(255,255,255,0.08)",
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : MUTED,
          fontSize: 11,
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
        marginTop: 10,
        borderRadius: 14,
        paddingHorizontal: 11,
        paddingVertical: 10,
        backgroundColor: CARD_SOFT,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text
        style={{
          color: SOFT,
          fontSize: 12,
          lineHeight: 17,
          fontWeight: "600",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          color: TXT,
          fontSize: 22,
          lineHeight: 27,
          fontWeight: "900",
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {title}
      </Text>

      {!!subtitle && (
        <Text
          style={{
            color: SOFT,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function getLessonMeta(lessonId: string): ScenarioMeta {
  switch (lessonId) {
    case "hongik_to_gangnam":
      return {
        subtitle: "Direct • facile",
        badge: "Recommandé",
        badgeBg: "rgba(34,211,238,0.16)",
        badgeBorder: "rgba(34,211,238,0.38)",
        badgeText: CYAN_TEXT,
      };
    case "myeongdong_to_itaewon":
      return {
        subtitle: "1 correspondance • moyen",
        badge: "Populaire",
        badgeBg: "rgba(168,85,247,0.16)",
        badgeBorder: "rgba(168,85,247,0.34)",
        badgeText: PURPLE_TEXT,
      };
    case "seoul_station_to_jamsil":
      return {
        subtitle: "Plus long • intermédiaire",
        badge: "Challenge",
        badgeBg: "rgba(245,158,11,0.16)",
        badgeBorder: "rgba(245,158,11,0.34)",
        badgeText: AMBER_TEXT,
      };
    default:
      return {
        subtitle: "Cas pratique",
        badge: null,
        badgeBg: "rgba(255,255,255,0.06)",
        badgeBorder: "rgba(255,255,255,0.10)",
        badgeText: "#fff",
      };
  }
}

function ScenarioCard({
  lesson,
  selectedLessonId,
  onPress,
  disabled,
}: {
  lesson: MetroLesson;
  selectedLessonId: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const meta = getLessonMeta(lesson.id);
  const isActive = lesson.id === selectedLessonId;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        borderRadius: 20,
        padding: 16,
        backgroundColor: isActive ? CYAN_ACTIVE_BG : "rgba(255,255,255,0.05)",
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? CYAN_ACTIVE_BORDER : "rgba(255,255,255,0.08)",
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 7,
            }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.16)"
                  : "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: isActive
                  ? "rgba(255,255,255,0.20)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13 }}>🚇</Text>
            </View>

            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                lineHeight: 20,
                fontWeight: "900",
                flexShrink: 1,
              }}
            >
              {lesson.shortTitle}
            </Text>
          </View>

          <Text
            style={{
              color: isActive ? "rgba(255,255,255,0.90)" : MUTED,
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            {meta.subtitle}
          </Text>
        </View>

        {!!meta.badge && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: meta.badgeBg,
              borderWidth: 1,
              borderColor: meta.badgeBorder,
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                color: meta.badgeText,
                fontSize: 11,
                fontWeight: "900",
              }}
            >
              {meta.badge}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function getProgressIndexFromPhase(phase?: MetroPhase): number {
  switch (phase) {
    case "Ligne":
      return 1;
    case "Direction":
      return 2;
    case "Trajet":
      return 3;
    case "Sortie":
      return 4;
    case "Fin":
      return 4;
    default:
      return 0;
  }
}

function buildChoiceHint(label: string): string {
  const lowered = label.toLowerCase();

  if (lowered.includes("répéter")) {
    return "Vous demandez à l'agent de reformuler l'information.";
  }
  if (
    lowered.includes("quai") ||
    lowered.includes("direction") ||
    lowered.includes("sens")
  ) {
    return "Vous vérifiez le bon quai ou la bonne direction.";
  }
  if (
    lowered.includes("temps") ||
    lowered.includes("trajet") ||
    lowered.includes("arrêts")
  ) {
    return "Vous demandez une précision sur le trajet.";
  }
  if (
    lowered.includes("transfert") ||
    lowered.includes("correspondance") ||
    lowered.includes("changer")
  ) {
    return "Vous demandez une précision sur la correspondance.";
  }
  if (
    lowered.includes("sortie") ||
    lowered.includes("restaurant") ||
    lowered.includes("coex")
  ) {
    return "Vous demandez comment sortir ou rejoindre la zone voulue.";
  }
  if (lowered.includes("merci")) {
    return "Vous terminez naturellement la conversation.";
  }

  return "Vous poursuivez la conversation.";
}

export default function MetroIaScreen() {
  const insets = useSafeAreaInsets();

  const goBackSafely = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/onboarding");
  };

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const speechTokenRef = useRef(0);

  const safeLessons = Array.isArray(metroLessons) ? metroLessons : [];
  const firstLesson = safeLessons.length > 0 ? safeLessons[0] : undefined;

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    firstLesson?.id ?? "",
  );
  const [hasEnteredScene, setHasEnteredScene] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedChoiceHint, setSelectedChoiceHint] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);

  const currentLesson = useMemo(() => {
    if (!firstLesson) return undefined;
    return getMetroLessonById(selectedLessonId) ?? firstLesson;
  }, [selectedLessonId, firstLesson]);

  const [metroState, setMetroState] = useState<MetroState>({
    lessonId: firstLesson?.id ?? "",
    currentStepId: "start",
    history: [],
    finished: false,
  });

  const [currentStep, setCurrentStep] = useState<MetroStep | undefined>(
    firstLesson ? getMetroStepById(firstLesson, "start") : undefined,
  );

  const [displayedStep, setDisplayedStep] = useState<MetroStep | undefined>(
    firstLesson ? getMetroStepById(firstLesson, "start") : undefined,
  );

  const progressIndex = useMemo(() => {
    return hasEnteredScene ? getProgressIndexFromPhase(currentStep?.phase) : 0;
  }, [currentStep?.phase, hasEnteredScene]);

  const lastUserMessage = useMemo(() => {
    for (let i = chatLog.length - 1; i >= 0; i -= 1) {
      const item = chatLog[i];
      if (item?.role === "user") {
        return item as Extract<ChatMessage, { role: "user" }>;
      }
    }
    return null;
  }, [chatLog]);

  useEffect(() => {
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
      return () => loop.stop();
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
    if (!text) return;

    const token = speechTokenRef.current + 1;
    speechTokenRef.current = token;

    Speech.stop();
    setSpeaking(true);

    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.92,
      pitch: 1,
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

  const initializeLesson = (lesson: MetroLesson, enterScene: boolean) => {
    const initialState = createInitialMetroState(lesson);
    const firstStepInLesson = getMetroStepById(
      lesson,
      initialState.currentStepId,
    );

    setMetroState(initialState);
    setCurrentStep(firstStepInLesson);
    setDisplayedStep(firstStepInLesson);
    setSelectedChoiceId(null);
    setSelectedChoiceHint("");
    setChatLog([]);
    fadeAnim.setValue(1);
    translateAnim.setValue(0);

    if (enterScene && firstStepInLesson?.korean) {
      setTimeout(() => {
        speakAi(firstStepInLesson.korean ?? "");
      }, 120);
    }
  };

  const startSelectedLesson = () => {
    if (isTransitioning || !currentLesson) return;

    stopSpeech();
    setHasEnteredScene(true);
    initializeLesson(currentLesson, true);
  };

  const returnToLessonPicker = () => {
    stopSpeech();
    setHasEnteredScene(false);
    setSelectedChoiceId(null);
    setSelectedChoiceHint("");
    setChatLog([]);
    fadeAnim.setValue(1);
    translateAnim.setValue(0);
  };

  const handleChoice = (choice: MetroChoice) => {
    if (isTransitioning || !currentLesson) return;

    setSelectedChoiceId(choice.id);
    setSelectedChoiceHint(buildChoiceHint(choice.label));

    const userMessage: ChatMessage = {
      id: `${choice.id}-user-${Date.now()}`,
      role: "user",
      label: choice.label,
      korean: choice.korean,
      romanization: choice.romanization,
    };

    const nextState = getNextMetroState(
      currentLesson,
      metroState,
      choice.nextId,
    );

    const nextStep = getMetroStepById(currentLesson, nextState.currentStepId);

    const nextMessages: ChatMessage[] = [userMessage];
    if (nextStep) {
      nextMessages.push({
        id: `${nextStep.id}-ai-${Date.now()}`,
        role: "ai",
        korean: nextStep.korean,
        romanization: nextStep.romanization,
        french: nextStep.french ?? nextStep.text,
        phase: nextStep.phase,
      });
    }

    setTimeout(() => {
      animateSceneChange(() => {
        setMetroState(nextState);
        setCurrentStep(nextStep);
        setDisplayedStep(nextStep);
        setChatLog((prev) => [...prev, ...nextMessages]);

        if (nextStep?.korean) {
          setTimeout(() => {
            speakAi(nextStep.korean ?? "");
          }, 80);
        }
      });
    }, 220);
  };

  const replayAi = () => {
    if (!displayedStep?.korean) return;
    speakAi(displayedStep.korean);
  };

  const restartScene = () => {
    if (!currentLesson) return;
    stopSpeech();
    initializeLesson(currentLesson, true);
  };

  const speakingBorderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.10)", CYAN_LINE],
  });

  const currentChoices =
    hasEnteredScene && currentStep?.choices
      ? currentStep.choices.map((choice) => ({
          id: choice.id,
          label: choice.label,
        }))
      : [];

  if (!firstLesson || !currentLesson) {
    return (
      <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
        <SafeAreaView
          style={{ flex: 1, justifyContent: "center", padding: 20 }}
        >
          <Text
            style={{
              color: TXT,
              fontSize: 20,
              fontWeight: "900",
              marginBottom: 10,
            }}
          >
            Aucune leçon métro disponible
          </Text>
          <Text style={{ color: SOFT, fontSize: 14, lineHeight: 20 }}>
            Vérifie les exports dans le dossier data/metro.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(24, insets.bottom + 24),
          }}
        >
          <View style={{ paddingBottom: 10 }}>
            <Pressable onPress={goBackSafely} hitSlop={10}>
              <Text style={{ color: MUTED, fontWeight: "800", fontSize: 15 }}>
                ← Retour
              </Text>
            </Pressable>

            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: CYAN_SOFT,
                  borderWidth: 1,
                  borderColor: CYAN_LINE,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "900" }}
                >
                  Metro Seoul
                </Text>
              </View>

              <Text style={{ color: MUTED, fontSize: 12, fontWeight: "700" }}>
                Conversation guidée
              </Text>
            </View>

            {!hasEnteredScene && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                {PROGRESS_LABELS.map((label, index) => (
                  <ProgressPill
                    key={`${label}-${index}`}
                    label={label}
                    active={index <= progressIndex}
                  />
                ))}
              </View>
            )}
          </View>

          {!hasEnteredScene ? (
            <>
              <View
                style={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: CARD_SOFT,
                  overflow: "hidden",
                  marginBottom: 20,
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(34,211,238,0.08)",
                    "rgba(59,130,246,0.05)",
                    "rgba(168,85,247,0.04)",
                    "rgba(255,255,255,0.02)",
                  ]}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 124,
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <View
                        style={{
                          width: 112,
                          height: 136,
                          borderRadius: 22,
                          overflow: "hidden",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.12)",
                          backgroundColor: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <View
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            zIndex: 2,
                            paddingHorizontal: 9,
                            paddingVertical: 5,
                            borderRadius: 999,
                            backgroundColor: "rgba(8,10,18,0.70)",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.12)",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: "900",
                            }}
                          >
                            AI
                          </Text>
                        </View>

                        <View
                          style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        ></View>
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: TXT,
                          fontSize: 18,
                          lineHeight: 24,
                          fontWeight: "900",
                          marginBottom: 8,
                        }}
                      >
                        Demande ton chemin dans le métro
                      </Text>

                      <Text
                        style={{
                          color: SOFT,
                          fontSize: 13,
                          lineHeight: 19,
                          marginBottom: 12,
                        }}
                      >
                        Choisis un trajet puis lance une scène guidée avec des
                        réponses prêtes à l'emploi.
                      </Text>

                      <View
                        style={{
                          alignSelf: "flex-start",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.08)",
                        }}
                      >
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.82)",
                            fontSize: 11,
                            fontWeight: "800",
                          }}
                        >
                          3 trajets • aide FR
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={{ marginBottom: 20 }}>
                <SectionTitle
                  title="Choisissez votre scénario"
                  subtitle="Sélectionnez un trajet pour commencer un dialogue simple et guidé."
                />

                <View style={{ gap: 12 }}>
                  {safeLessons.map((lesson) => (
                    <ScenarioCard
                      key={lesson.id}
                      lesson={lesson}
                      selectedLessonId={selectedLessonId}
                      onPress={() => setSelectedLessonId(lesson.id)}
                      disabled={isTransitioning}
                    />
                  ))}
                </View>

                <Pressable
                  onPress={startSelectedLesson}
                  disabled={isTransitioning}
                  style={({ pressed }) => ({
                    marginTop: 16,
                    marginBottom: 8,
                    borderRadius: 18,
                    overflow: "hidden",
                    opacity: pressed ? 0.94 : 1,
                  })}
                >
                  <LinearGradient
                    colors={["rgba(124,58,237,0.95)", "rgba(34,211,238,0.92)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      minHeight: 58,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 16,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 15 }}>▶</Text>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: "900",
                          letterSpacing: 0.2,
                        }}
                      >
                        Démarrer la conversation
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View
                style={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: CARD_SOFT,
                  overflow: "hidden",
                  marginBottom: 14,
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(34,211,238,0.08)",
                    "rgba(59,130,246,0.05)",
                    "rgba(168,85,247,0.04)",
                    "rgba(255,255,255,0.02)",
                  ]}
                  style={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: 138,
                        height: 164,
                        borderRadius: 26,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          zIndex: 2,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          paddingHorizontal: 9,
                          paddingVertical: 5,
                          borderRadius: 999,
                          backgroundColor: "rgba(8,10,18,0.70)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.12)",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 11 }}>🎙️</Text>
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: "900",
                          }}
                        >
                          AI
                        </Text>
                      </View>
                    </View>

                    {!!lastUserMessage && (
                      <View
                        style={{
                          width: "92%",
                          alignSelf: "center",
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          backgroundColor: USER_BUBBLE,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.08)",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 14,
                            lineHeight: 19,
                            fontWeight: "900",
                          }}
                        >
                          {lastUserMessage.label}
                        </Text>
                      </View>
                    )}

                    <Animated.View
                      style={{
                        width: "94%",
                        alignSelf: "center",
                        opacity: fadeAnim,
                        transform: [{ translateY: translateAnim }],
                      }}
                    >
                      <Animated.View
                        style={{
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 11,
                          backgroundColor: BUBBLE,
                          borderWidth: 1,
                          borderColor: speaking
                            ? speakingBorderColor
                            : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <Text
                          style={{
                            color: TXT,
                            fontSize: 15,
                            lineHeight: 20,
                            fontWeight: "900",
                          }}
                        >
                          {displayedStep?.korean ?? ""}
                        </Text>

                        {!!displayedStep?.romanization && (
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.58)",
                              fontSize: 11,
                              lineHeight: 16,
                              marginTop: 5,
                              fontStyle: "italic",
                            }}
                          >
                            {displayedStep.romanization}
                          </Text>
                        )}

                        {!!displayedStep?.french && (
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.72)",
                              fontSize: 12,
                              lineHeight: 17,
                              marginTop: 5,
                            }}
                          >
                            {displayedStep.french}
                          </Text>
                        )}
                      </Animated.View>
                    </Animated.View>

                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: SOFT,
                          fontSize: 12,
                          fontWeight: "800",
                        }}
                      >
                        {currentLesson.shortTitle}
                      </Text>

                      <Pressable
                        onPress={returnToLessonPicker}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          borderRadius: 999,
                          backgroundColor: CARD,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.08)",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "900",
                          }}
                        >
                          Changer
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View
                style={{
                  borderRadius: 22,
                  padding: 14,
                  backgroundColor: "rgba(10,12,22,0.96)",
                  borderWidth: 1,
                  borderColor: LINE,
                  marginBottom: 8,
                }}
              >
                {metroState.finished ? (
                  <>
                    <Text
                      style={{
                        color: TXT,
                        fontSize: 16,
                        fontWeight: "900",
                        marginBottom: 8,
                      }}
                    >
                      Scène terminée
                    </Text>

                    <Text
                      style={{
                        color: SOFT,
                        fontSize: 13,
                        lineHeight: 18,
                        marginBottom: 12,
                      }}
                    >
                      Vous pouvez réécouter, recommencer ou changer de trajet.
                    </Text>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <SmallAction label="🔊 Réécouter" onPress={replayAi} />
                      <SmallAction
                        label="↺ Recommencer"
                        onPress={restartScene}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        color: TXT,
                        fontSize: 16,
                        fontWeight: "900",
                        marginBottom: 10,
                      }}
                    >
                      Ta réponse
                    </Text>

                    <ChoiceChips
                      choices={currentChoices}
                      disabled={isTransitioning}
                      selectedId={selectedChoiceId}
                      onSelect={(choice) => {
                        const fullChoice = currentStep?.choices?.find(
                          (item) => item.id === choice.id,
                        );
                        if (fullChoice) {
                          handleChoice(fullChoice);
                        }
                      }}
                    />

                    {!!selectedChoiceHint && (
                      <HintCard text={selectedChoiceHint} />
                    )}

                    <View
                      style={{ flexDirection: "row", gap: 8, marginTop: 12 }}
                    >
                      <SmallAction label="🔊 Réécouter" onPress={replayAi} />
                      <SmallAction
                        label="↺ Recommencer"
                        onPress={restartScene}
                      />
                    </View>
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
