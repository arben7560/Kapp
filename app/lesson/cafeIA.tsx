import { useEventListener } from "expo";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ChoiceChips from "../../components/ai/ChoiceChips";
import {
  cafeDialogueData,
  type DialogueChoice,
  type DialogueNode,
  type DialogueScenario,
} from "./data/cafe/cafe";

type ModeType = "guided" | "real";
type DialogueNodeWithVideo = DialogueNode & {
  videoSources?: number[];
};

// ==================== VIDEOS ====================
const welcomeCafeReal = require("../../assets/ai/cafe/welcomeCafeReal.mp4");
const orderConfirmationJuiceReal = require("../../assets/ai/cafe/orderConfirmationJuiceReal.mp4");
const orderConfirmationCakeReal = require("../../assets/ai/cafe/orderConfirmationCakeReal.mp4");

// ==================== CONFIG VIDEO ====================
const VIDEO_MAX_SIZE = 270;

// ==================== COLORS ====================
const BG0 = "#05070F";
const BG1 = "#09111D";
const BG2 = "#100D1A";

const TXT_PRIMARY = "rgba(255,255,255,0.98)";
const TXT_SECONDARY = "rgba(255,255,255,0.78)";
const TXT_MUTED = "rgba(255,255,255,0.58)";
const TXT_KOREAN = "rgba(255,255,255,0.94)";

const LINE = "rgba(255,255,255,0.09)";
const CARD = "rgba(255,255,255,0.045)";
const CARD_DARK = "rgba(7,9,17,0.85)";
const CARD_SOFT = "rgba(255,255,255,0.035)";

const PURPLE_SOFT = "rgba(139,92,246,0.14)";
const PURPLE_LINE = "rgba(168,85,247,0.34)";
const CYAN_SOFT = "rgba(34,211,238,0.14)";
const CYAN_LINE = "rgba(34,211,238,0.34)";
const ACTIVE_LINE = "rgba(168,85,247,0.45)";

const ACCENT_GUIDED = "#C4B5FD";
const ACCENT_REAL = "#67E8F9";

// ==================== HELPERS ====================
function normalizeMode(rawMode: string | string[] | undefined): ModeType {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

function getDisplayKorean(node: DialogueNode): string {
  return node.korean ?? "";
}

function getDisplayFrench(node: DialogueNode): string {
  return node.french ?? "";
}

function getProgressIndex(nodeId: string): number {
  const id = nodeId.toLowerCase();

  if (/welcome|start|intro|accueil|begin|ped_welcome|real_welcome/.test(id)) {
    return 0;
  }

  if (
    /final|finish|done|end|bell|wait|pickup_done|complete|완료|진동벨|ready/.test(
      id,
    )
  ) {
    return 3;
  }

  if (/payment|pay|card|cash|receipt|결제|카드|현금/.test(id)) {
    return 2;
  }

  if (
    /surplace|takeout|place|pickup|drinkhere|포장|매장|choice_place|order_type/.test(
      id,
    )
  ) {
    return 1;
  }

  return 0;
}

// On attache ici les vidéos réelles aux bons nœuds de cafe.ts
function attachRealVideosToScenario(
  scenario: DialogueScenario,
): DialogueScenario {
  const clonedNodes: Record<string, DialogueNodeWithVideo> = {};

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    clonedNodes[nodeId] = { ...node };
  }

  if (clonedNodes.real_welcome) {
    clonedNodes.real_welcome.videoSources = [welcomeCafeReal];
  }

  if (clonedNodes.real_confirm) {
    clonedNodes.real_confirm.videoSources = [orderConfirmationJuiceReal];
  }

  if (clonedNodes.real_confirm_alt) {
    clonedNodes.real_confirm_alt.videoSources = [orderConfirmationCakeReal];
  }

  return {
    ...scenario,
    nodes: clonedNodes,
  };
}

// ==================== UI ====================
function SmallAction({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 52,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: disabled
          ? "rgba(255,255,255,0.025)"
          : pressed
            ? "rgba(255,255,255,0.09)"
            : "rgba(255,255,255,0.055)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
      })}
    >
      <Text
        style={{
          color: TXT_PRIMARY,
          fontSize: 13.5,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CurrentStepIndicator({
  label,
  mode,
}: {
  label: string;
  mode: ModeType;
}) {
  return (
    <View style={{ alignItems: "center", marginBottom: 20 }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 9,
          borderRadius: 999,
          backgroundColor: mode === "real" ? CYAN_SOFT : PURPLE_SOFT,
          borderWidth: 1,
          borderColor: mode === "real" ? CYAN_LINE : PURPLE_LINE,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function HintCard({ text }: { text: string }) {
  return (
    <View
      style={{
        marginTop: 12,
        borderRadius: 16,
        padding: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
      }}
    >
      <Text
        style={{
          color: TXT_SECONDARY,
          fontSize: 12.8,
          lineHeight: 19,
          fontWeight: "600",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function KoreanInteractiveText({ text }: { text: string }) {
  return (
    <Text
      style={{
        color: TXT_KOREAN,
        fontSize: 17.5,
        lineHeight: 26,
        fontWeight: "700",
      }}
    >
      {text}
    </Text>
  );
}

// ==================== SCREEN ====================
export default function CafeIaScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const params = useLocalSearchParams();

  const mode = normalizeMode(params.mode as string | string[] | undefined);

  const currentScenario: DialogueScenario = useMemo(() => {
    return mode === "real"
      ? attachRealVideosToScenario(cafeDialogueData.real)
      : cafeDialogueData.pedagogical;
  }, [mode]);

  const iaAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const choiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [currentNodeId, setCurrentNodeId] = useState(
    currentScenario.startNodeId,
  );
  const [currentAi, setCurrentAi] = useState("");
  const [currentAiMeaning, setCurrentAiMeaning] = useState("");
  const [currentNarrator, setCurrentNarrator] = useState("");
  const [currentChoices, setCurrentChoices] = useState<DialogueChoice[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedChoiceHint, setSelectedChoiceHint] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSceneEnded, setIsSceneEnded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const currentNode = useMemo<DialogueNodeWithVideo | undefined>(() => {
    return currentScenario.nodes[currentNodeId] as
      | DialogueNodeWithVideo
      | undefined;
  }, [currentScenario.nodes, currentNodeId]);

  const currentVideoSources = useMemo(() => {
    if (!currentNode || currentNode.type !== "ia") return undefined;

    if (currentNode.videoSources && currentNode.videoSources.length > 0) {
      return currentNode.videoSources;
    }

    if (currentNode.videoSource) {
      return [currentNode.videoSource];
    }

    return undefined;
  }, [currentNode]);

  const currentVideoSource =
    currentVideoSources && currentVideoSources.length > 0
      ? currentVideoSources[currentVideoIndex]
      : null;

  const contentWidth = Math.min(screenWidth - 24, 360);
  const videoSize = Math.min(contentWidth, VIDEO_MAX_SIZE);

  const modeAccentBg = mode === "real" ? CYAN_SOFT : PURPLE_SOFT;
  const modeAccentBorder = mode === "real" ? CYAN_LINE : PURPLE_LINE;
  const currentActiveLine = mode === "real" ? CYAN_LINE : ACTIVE_LINE;

  const clearIaAutoTimer = useCallback(() => {
    if (iaAutoTimerRef.current) {
      clearTimeout(iaAutoTimerRef.current);
      iaAutoTimerRef.current = null;
    }
  }, []);

  const clearChoiceTimer = useCallback(() => {
    if (choiceTimerRef.current) {
      clearTimeout(choiceTimerRef.current);
      choiceTimerRef.current = null;
    }
  }, []);

  const resetUiState = useCallback(() => {
    setSelectedChoiceId(null);
    setSelectedChoiceHint("");
    setCurrentChoices([]);
    setCurrentAi("");
    setCurrentAiMeaning("");
    setCurrentNarrator("");
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setIsVideoPlaying(false);
    setCurrentVideoIndex(0);
  }, []);

  const getCurrentStepLabel = useCallback((): string => {
    if (progressIndex === 0) return "Accueil";
    if (progressIndex === 1) return "Choix";
    if (progressIndex === 2) return "Paiement";
    if (progressIndex === 3) return "Finalisation";
    return "Accueil";
  }, [progressIndex]);

  const syncNodeToUi = useCallback(
    (nodeId: string) => {
      clearIaAutoTimer();
      clearChoiceTimer();

      const node = currentScenario.nodes[nodeId] as
        | DialogueNodeWithVideo
        | undefined;

      if (!node) {
        setCurrentAi("Erreur de dialogue");
        setCurrentAiMeaning(`Nœud "${nodeId}" introuvable.`);
        setCurrentNarrator("");
        setCurrentChoices([]);
        setIsSceneEnded(true);
        setIsTransitioning(false);
        setIsVideoPlaying(false);
        setCurrentVideoIndex(0);
        return;
      }

      setProgressIndex(getProgressIndex(nodeId));
      setSelectedChoiceHint("");
      setIsSceneEnded(false);

      const displayKorean = getDisplayKorean(node);
      const displayFrench = getDisplayFrench(node);

      if (node.type === "ia") {
        setCurrentNarrator("");
        setCurrentAi(displayKorean);
        setCurrentAiMeaning(displayFrench);
        setCurrentVideoIndex(0);

        const nextNode = node.nextNodeId
          ? (currentScenario.nodes[node.nextNodeId] as
              | DialogueNodeWithVideo
              | undefined)
          : undefined;

        if (nextNode?.type === "user_choice") {
          setCurrentChoices(nextNode.choices ?? []);
        } else {
          setCurrentChoices([]);
        }

        setIsVideoPlaying(!!node.videoSources?.length);

        if (!node.nextNodeId) {
          setIsSceneEnded(true);
          setIsTransitioning(false);
          return;
        }

        if (nextNode?.type === "ia") {
          setIsTransitioning(true);
          iaAutoTimerRef.current = setTimeout(
            () => {
              if (mountedRef.current) {
                setCurrentNodeId(node.nextNodeId as string);
              }
            },
            mode === "real" ? 1550 : 1850,
          );
        } else {
          setIsTransitioning(false);
        }

        return;
      }

      setCurrentNarrator("Choisis la réponse la plus adaptée.");
      setCurrentAi(
        mode === "real"
          ? "어떻게 대답할까요?"
          : "가장 적절한 표현을 골라 보세요.",
      );
      setCurrentAiMeaning(
        mode === "real"
          ? "Réponds comme dans une interaction simple et naturelle."
          : "Choisis la formulation la plus adaptée.",
      );
      setCurrentChoices(node.choices ?? []);
      setIsTransitioning(false);
      setIsVideoPlaying(false);
      setCurrentVideoIndex(0);
    },
    [clearChoiceTimer, clearIaAutoTimer, currentScenario.nodes, mode],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearIaAutoTimer();
      clearChoiceTimer();
    };
  }, [clearChoiceTimer, clearIaAutoTimer]);

  useEffect(() => {
    clearIaAutoTimer();
    clearChoiceTimer();
    resetUiState();
    setCurrentNodeId(currentScenario.startNodeId);
  }, [
    clearChoiceTimer,
    clearIaAutoTimer,
    currentScenario.startNodeId,
    resetUiState,
  ]);

  useEffect(() => {
    syncNodeToUi(currentNodeId);
  }, [currentNodeId, syncNodeToUi]);

  const handleChoice = useCallback(
    (choice: DialogueChoice) => {
      if (isTransitioning) return;

      clearIaAutoTimer();
      clearChoiceTimer();
      setIsTransitioning(true);

      setSelectedChoiceId(choice.id);
      setSelectedChoiceHint(
        choice.romanization
          ? `${choice.korean}\n${choice.romanization}`
          : choice.korean,
      );

      choiceTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setCurrentNodeId(choice.nextNodeId);
          setSelectedChoiceId(null);
        }
      }, 220);
    },
    [clearChoiceTimer, clearIaAutoTimer, isTransitioning],
  );

  const restartScene = useCallback(() => {
    clearIaAutoTimer();
    clearChoiceTimer();
    resetUiState();
    setCurrentNodeId(currentScenario.startNodeId);
  }, [
    clearChoiceTimer,
    clearIaAutoTimer,
    currentScenario.startNodeId,
    resetUiState,
  ]);

  const firstSource =
    currentVideoSources && currentVideoSources.length > 0
      ? currentVideoSources[0]
      : null;

  const secondSource =
    currentVideoSources && currentVideoSources.length > 1
      ? currentVideoSources[1]
      : null;

  const playerA = useVideoPlayer(firstSource, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  const playerB = useVideoPlayer(secondSource, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  const [activePlayerKey, setActivePlayerKey] = useState<"A" | "B">("A");

  const activePlayer = activePlayerKey === "A" ? playerA : playerB;
  const standbyPlayer = activePlayerKey === "A" ? playerB : playerA;

  useEffect(() => {
    setActivePlayerKey("A");
    setCurrentVideoIndex(0);

    if (!currentVideoSources || currentVideoSources.length === 0) {
      setIsVideoPlaying(false);
      return;
    }

    // Charge la première vidéo sur A
    playerA.replace(currentVideoSources[0]);
    playerA.play();

    // Précharge la deuxième si elle existe
    if (currentVideoSources.length > 1) {
      playerB.replace(currentVideoSources[1]);
    }

    setIsVideoPlaying(true);
  }, [currentNodeId, currentVideoSources, playerA, playerB]);

  useEventListener(playerA, "playingChange", ({ isPlaying }) => {
    if (activePlayerKey === "A") {
      setIsVideoPlaying(isPlaying);
    }
  });

  useEventListener(playerB, "playingChange", ({ isPlaying }) => {
    if (activePlayerKey === "B") {
      setIsVideoPlaying(isPlaying);
    }
  });

  useEventListener(playerA, "playToEnd", () => {
    if (activePlayerKey !== "A") return;

    if (currentVideoSources && currentVideoSources.length > 1) {
      setActivePlayerKey("B");
      playerB.play();
      setCurrentVideoIndex(1);
      return;
    }

    setIsVideoPlaying(false);
  });

  useEventListener(playerB, "playToEnd", () => {
    if (activePlayerKey !== "B") return;
    setIsVideoPlaying(false);
  });

  const restartCurrentVideo = useCallback(() => {
    if (!currentVideoSources || currentVideoSources.length === 0) return;

    setActivePlayerKey("A");
    setCurrentVideoIndex(0);

    playerA.replace(currentVideoSources[0]);
    playerA.play();

    if (currentVideoSources.length > 1) {
      playerB.replace(currentVideoSources[1]);
    }

    setIsVideoPlaying(true);
  }, [currentVideoSources, playerA, playerB]);
  const currentStepLabel = getCurrentStepLabel();

  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: insets.bottom + 110,
          }}
        >
          <View style={{ width: contentWidth, alignSelf: "center" }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: modeAccentBg,
                  borderWidth: 1,
                  borderColor: modeAccentBorder,
                }}
              >
                <Text
                  style={{
                    color: TXT_PRIMARY,
                    fontWeight: "900",
                    fontSize: 13.5,
                  }}
                >
                  {mode === "real"
                    ? "Mode Réel • Immersif"
                    : "Mode Guidé • Pédagogique"}
                </Text>
              </View>
            </View>

            <CurrentStepIndicator label={currentStepLabel} mode={mode} />

            {!!currentNarrator && (
              <View
                style={{
                  borderRadius: 18,
                  padding: 16,
                  backgroundColor: CARD_SOFT,
                  borderWidth: 1,
                  borderColor: LINE,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    color: TXT_SECONDARY,
                    fontSize: 13.2,
                    lineHeight: 19,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {currentNarrator}
                </Text>
              </View>
            )}

            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: videoSize,
                  height: videoSize,
                  backgroundColor: "#000",
                  borderRadius: 24,
                  overflow: "hidden",
                  borderWidth: 2,
                  borderColor: isVideoPlaying
                    ? currentActiveLine
                    : "rgba(255,255,255,0.12)",
                }}
              >
                {currentVideoSource ? (
                  <VideoView
                    player={activePlayer}
                    useExoShutter={false}
                    style={{ flex: 1, backgroundColor: "#000" }}
                    contentFit="cover"
                    nativeControls={false}
                    allowsFullscreen={false}
                    allowsPictureInPicture={false}
                    surfaceType="textureView"
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#000",
                    }}
                  >
                    <Text
                      style={{
                        color: TXT_MUTED,
                        fontSize: 13,
                        textAlign: "center",
                        paddingHorizontal: 18,
                      }}
                    >
                      Aucune vidéo disponible pour cette réplique.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View
              style={{
                backgroundColor: CARD_DARK,
                borderRadius: 24,
                padding: 18,
                borderWidth: 1,
                borderColor: isVideoPlaying ? currentActiveLine : LINE,
                marginBottom: 18,
              }}
            >
              <KoreanInteractiveText text={currentAi} />

              {!!currentAiMeaning && (
                <Text
                  style={{
                    color: mode === "real" ? ACCENT_REAL : ACCENT_GUIDED,
                    fontSize: 14.2,
                    lineHeight: 21,
                    marginTop: 10,
                  }}
                >
                  {currentAiMeaning}
                </Text>
              )}
            </View>

            {currentChoices.length > 0 && (
              <View
                style={{
                  backgroundColor: CARD,
                  borderRadius: 24,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: LINE,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: TXT_PRIMARY,
                    fontSize: 17,
                    fontWeight: "900",
                    marginBottom: 12,
                  }}
                >
                  Ta réponse
                </Text>

                <ChoiceChips
                  choices={currentChoices}
                  disabled={isTransitioning}
                  selectedId={selectedChoiceId}
                  onSelect={handleChoice}
                />

                {!!selectedChoiceHint && <HintCard text={selectedChoiceHint} />}
              </View>
            )}

            {isSceneEnded && (
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <SmallAction
                    label="🔊 Rejouer la vidéo"
                    onPress={restartCurrentVideo}
                    disabled={!currentVideoSource}
                  />
                  <SmallAction
                    label="↺ Nouvelle scène"
                    onPress={restartScene}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
