import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  cafeDialogueData,
  type DialogueChoice,
  type DialogueNode,
  type DialogueScenario,
} from "./data/cafe/cafe";

// ==================== DESIGN SYSTEM ====================
const BG_DEEP = "#050508";
const BG_NAVY = "#0A0D1A";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.64)";
const SOFT = "rgba(255,255,255,0.48)";
const LINE = "rgba(255,255,255,0.08)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const PURPLE = "#A855F7";

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

// ==================== VIDEOS ====================
const welcomeCafeReal = require("../../assets/ai/cafe/welcomeCafeReal.mp4");
const orderConfirmationJuiceReal = require("../../assets/ai/cafe/orderConfirmationJuiceReal.mp4");
const orderConfirmationCakeReal = require("../../assets/ai/cafe/orderConfirmationCakeReal.mp4");
const pricePaimentChooseReal = require("../../assets/ai/cafe/pricePaimentChooseReal.mp4");
const byCashReceiptReal = require("../../assets/ai/cafe/byCashReceiptReal.mp4");
const byCardReceiptReal = require("../../assets/ai/cafe/byCardReceiptReal.mp4");
const takeOutThanksReal = require("../../assets/ai/cafe/takeOutThanksReal.mp4");
const jingdonbelReal = require("../../assets/ai/cafe/jingdonbelReal.mp4");

type ModeType = "guided" | "real";

type DialogueNodeWithVideo = DialogueNode & {
  videoSource?: number;
  videoSources?: number[];
};

// ==================== HELPERS ====================
function normalizeMode(rawMode: string | string[] | undefined): ModeType {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

function getProgressIndex(nodeId: string): number {
  const id = nodeId.toLowerCase();

  if (/welcome|start|intro|accueil|begin|ped_welcome|real_welcome/.test(id))
    return 0;

  if (
    /surplace|takeout|place|pickup|drinkhere|포장|매장|choice_place|order_type|confirm|order|choice|menu/.test(
      id,
    )
  ) {
    return 1;
  }

  if (/payment|pay|card|cash|receipt|결제|카드|현금/.test(id)) return 2;

  if (
    /final|finish|done|end|bell|wait|pickup_done|complete|완료|진동벨|ready/.test(
      id,
    )
  ) {
    return 3;
  }

  return 0;
}

function attachRealVideosToScenario(
  scenario: DialogueScenario,
): DialogueScenario {
  const clonedNodes: Record<string, DialogueNodeWithVideo> = {};

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    clonedNodes[nodeId] = { ...node };
  }

  if (clonedNodes.real_welcome)
    clonedNodes.real_welcome.videoSources = [welcomeCafeReal];

  if (clonedNodes.real_confirm)
    clonedNodes.real_confirm.videoSources = [orderConfirmationJuiceReal];

  if (clonedNodes.real_confirm_alt)
    clonedNodes.real_confirm_alt.videoSources = [orderConfirmationCakeReal];

  if (clonedNodes.real_payment_here)
    clonedNodes.real_payment_here.videoSources = [pricePaimentChooseReal];

  if (clonedNodes.real_payment_takeout)
    clonedNodes.real_payment_takeout.videoSources = [pricePaimentChooseReal];

  if (clonedNodes.real_cash_done_here)
    clonedNodes.real_cash_done_here.videoSources = [byCashReceiptReal];

  if (clonedNodes.real_cash_done_takeout)
    clonedNodes.real_cash_done_takeout.videoSources = [byCashReceiptReal];

  if (clonedNodes.real_card_done_here)
    clonedNodes.real_card_done_here.videoSources = [byCardReceiptReal];

  if (clonedNodes.real_card_done_takeout)
    clonedNodes.real_card_done_takeout.videoSources = [byCardReceiptReal];

  if (clonedNodes.real_takeout_end)
    clonedNodes.real_takeout_end.videoSources = [takeOutThanksReal];

  if (clonedNodes.real_here_end)
    clonedNodes.real_here_end.videoSources = [jingdonbelReal];

  return { ...scenario, nodes: clonedNodes };
}

function getAutoAdvanceDelay(node: DialogueNodeWithVideo, mode: ModeType) {
  const textLength = (node.korean?.length || 0) + (node.french?.length || 0);
  const base = mode === "real" ? 2600 : 2200;
  const byLength = Math.min(textLength * 20, 1800);
  return base + byLength;
}

// ==================== MAIN ====================
export default function CafeIaScreen() {
  const [displayedVideoSource, setDisplayedVideoSource] = useState<
    number | null
  >(null);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);

  const scrollRef = useRef<ScrollView>(null);
  const mountedRef = useRef(true);
  const iaAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedFromVideoRef = useRef(false);

  const [currentNodeId, setCurrentNodeId] = useState(
    cafeDialogueData.pedagogical.startNodeId,
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSceneEnded, setIsSceneEnded] = useState(false);

  const currentScenario = useMemo(() => {
    return mode === "real"
      ? attachRealVideosToScenario(cafeDialogueData.real)
      : cafeDialogueData.pedagogical;
  }, [mode]);

  const currentNode = currentScenario.nodes[currentNodeId] as
    | DialogueNodeWithVideo
    | undefined;

  const progressIndex = getProgressIndex(currentNodeId);
  const steps = ["Accueil", "Choix", "Paiement", "Final"];

  const videoSources =
    currentNode?.videoSources ||
    (currentNode?.videoSource ? [currentNode.videoSource] : []);

  const currentVideoSource = videoSources.length > 0 ? videoSources[0] : null;

  const player = useVideoPlayer(displayedVideoSource, (playerInstance) => {
    playerInstance.loop = false;
  });
  // 🔥 GARDE LA DERNIÈRE VIDÉO IA
  useEffect(() => {
    if (currentNode?.type === "ia" && currentVideoSource) {
      setDisplayedVideoSource(currentVideoSource);
    }
  }, [currentNode, currentVideoSource]);
  const videoHeight = Math.min(screenWidth * 0.9, screenHeight * 0.34);

  const goToNextNode = useCallback((node?: DialogueNodeWithVideo) => {
    if (!node || !mountedRef.current) return;

    if (node.nextNodeId) {
      setCurrentNodeId(node.nextNodeId);
    } else {
      setIsSceneEnded(true);
    }
  }, []);

  // Reset scenario on mode change
  useEffect(() => {
    setCurrentNodeId(currentScenario.startNodeId);
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    hasAdvancedFromVideoRef.current = false;
  }, [currentScenario]);

  // Track mount / cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (iaAutoTimerRef.current) clearTimeout(iaAutoTimerRef.current);
    };
  }, []);

  // Reset per node
  useEffect(() => {
    hasAdvancedFromVideoRef.current = false;

    if (iaAutoTimerRef.current) {
      clearTimeout(iaAutoTimerRef.current);
      iaAutoTimerRef.current = null;
    }
  }, [currentNodeId]);

  // Start / replace video when node changes
  useEffect(() => {
    if (!currentNode) return;
    if (!displayedVideoSource) return;

    try {
      player.replace(displayedVideoSource);

      // On ne relance la lecture que sur un vrai nœud IA avec vidéo.
      if (currentNode.type === "ia" && currentVideoSource) {
        player.play();
      } else {
        // En user_choice, on garde simplement l’image affichée.
        player.pause();
      }
    } catch {
      // ignore
    }
  }, [
    currentNode,
    currentNodeId,
    currentVideoSource,
    displayedVideoSource,
    player,
  ]);

  // Advance on video end for IA nodes with video
  // Advance on real video end for IA nodes with video
  useEffect(() => {
    if (!currentNode) return;
    if (currentNode.type !== "ia") return;
    if (!currentVideoSource) return;
    if (isTransitioning || isSceneEnded) return;

    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      if (hasAdvancedFromVideoRef.current) return;

      const duration = player.duration ?? 0;
      const currentTime = player.currentTime ?? 0;

      // attendre que la vidéo ait vraiment commencé
      if (duration <= 0) return;

      // marge de sécurité pour éviter les problèmes de précision
      const isNearEnd = currentTime >= duration - 0.08;

      if (isNearEnd) {
        hasAdvancedFromVideoRef.current = true;
        clearInterval(interval);
        goToNextNode(currentNode);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [
    currentNode,
    currentVideoSource,
    isTransitioning,
    isSceneEnded,
    player,
    goToNextNode,
  ]);
  // Auto-advance only for IA nodes without video
  useEffect(() => {
    if (!currentNode) return;
    if (currentNode.type !== "ia") return;
    if (currentVideoSource) return;
    if (isTransitioning || isSceneEnded) return;

    const delay = getAutoAdvanceDelay(currentNode, mode);

    iaAutoTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      goToNextNode(currentNode);
    }, delay);

    return () => {
      if (iaAutoTimerRef.current) {
        clearTimeout(iaAutoTimerRef.current);
        iaAutoTimerRef.current = null;
      }
    };
  }, [
    currentNode,
    currentVideoSource,
    mode,
    isTransitioning,
    isSceneEnded,
    goToNextNode,
  ]);

  // Scroll lower content into view on node change
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 180);
    return () => clearTimeout(t);
  }, [currentNodeId]);

  const handleChoice = (choice: DialogueChoice) => {
    if (isTransitioning || isSceneEnded) return;

    setIsTransitioning(true);
    setSelectedChoiceId(choice.id);

    setTimeout(() => {
      if (!mountedRef.current) return;
      setCurrentNodeId(choice.nextNodeId);
      setSelectedChoiceId(null);
      setIsTransitioning(false);
    }, 320);
  };

  const handleRestart = () => {
    setCurrentNodeId(currentScenario.startNodeId);
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    hasAdvancedFromVideoRef.current = false;
  };

  const isUserChoice = currentNode?.type === "user_choice";

  return (
    <LinearGradient colors={[BG_DEEP, BG_NAVY]} style={{ flex: 1 }}>
      <View
        style={[
          styles.glow,
          {
            top: -70,
            right: -60,
            backgroundColor:
              mode === "real"
                ? "rgba(34,211,238,0.08)"
                : "rgba(168,85,247,0.10)",
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            top: 120,
            left: -90,
            backgroundColor: "rgba(244,114,182,0.06)",
          },
        ]}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(6, insets.top * 0.15) },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>✕</Text>
          </Pressable>

          <View
            style={[
              styles.modeBadge,
              { borderColor: mode === "real" ? CYAN : PURPLE },
            ]}
          >
            <Text
              style={[
                styles.modeTxt,
                { color: mode === "real" ? CYAN : PURPLE },
              ]}
            >
              {mode === "real" ? "MODE RÉEL" : "MODE GUIDÉ"}
            </Text>
          </View>

          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.stepsContainer}>
            {steps.map((s, i) => {
              const active = i === progressIndex;
              const done = i <= progressIndex;
              const accent = mode === "real" ? CYAN : PURPLE;

              return (
                <View key={s} style={styles.stepWrapper}>
                  <View
                    style={[
                      styles.stepDot,
                      done && {
                        backgroundColor: accent,
                        opacity: active ? 1 : 0.7,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.stepLabel,
                      active && {
                        color: TXT,
                        fontFamily: fonts.bold,
                      },
                    ]}
                  >
                    {s}
                  </Text>
                </View>
              );
            })}
          </View>

          <View
            style={[
              styles.videoContainer,
              {
                height: videoHeight,
                borderColor:
                  mode === "real"
                    ? "rgba(34,211,238,0.40)"
                    : "rgba(168,85,247,0.42)",
              },
            ]}
          >
            {displayedVideoSource ? (
              <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
            ) : (
              <View style={styles.videoFallback}>
                <Text style={styles.videoFallbackEmoji}>👩‍🍳</Text>
              </View>
            )}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.62)"]}
              style={styles.videoOverlay}
            />
          </View>

          <View style={styles.aiCard}>
            <Text style={styles.aiKr}>{currentNode?.korean || "..."}</Text>

            {currentNode?.french ? (
              <Text style={styles.aiFr}>{currentNode.french}</Text>
            ) : null}
          </View>

          <View style={styles.interactionSection}>
            <Text style={styles.sectionTitle}>Ta réponse</Text>

            {isSceneEnded ? (
              <View style={styles.endCard}>
                <Text style={styles.endTitle}>Scène terminée</Text>
                <Text style={styles.endSubtitle}>
                  Tu peux rejouer cette scène ou revenir au menu.
                </Text>

                <View style={styles.endActions}>
                  <Pressable
                    onPress={handleRestart}
                    style={({ pressed }) => [
                      styles.endActionPrimary,
                      { opacity: pressed ? 0.92 : 1 },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        mode === "real" ? [CYAN, "#56CCF2"] : [PURPLE, PINK]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.endActionPrimaryInner}
                    >
                      <Text style={styles.endActionPrimaryText}>Rejouer</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                      styles.endActionSecondary,
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <Text style={styles.endActionSecondaryText}>Retour</Text>
                  </Pressable>
                </View>
              </View>
            ) : isUserChoice ? (
              <View style={styles.choicesGrid}>
                {currentNode?.choices?.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const accent = mode === "real" ? CYAN : PURPLE;

                  return (
                    <Pressable
                      key={choice.id}
                      onPress={() => handleChoice(choice)}
                      style={({ pressed }) => [
                        styles.choiceBtn,
                        isSelected && {
                          borderColor: accent,
                          backgroundColor: "rgba(255,255,255,0.08)",
                        },
                        pressed && { opacity: 0.92 },
                      ]}
                    >
                      <View
                        pointerEvents="none"
                        style={[
                          styles.choiceGlow,
                          {
                            backgroundColor:
                              mode === "real"
                                ? "rgba(34,211,238,0.08)"
                                : "rgba(168,85,247,0.10)",
                          },
                        ]}
                      />

                      <Text style={styles.choiceKr}>{choice.korean}</Text>
                      <Text style={styles.choiceFr}>{choice.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.waitingCard}>
                <View style={styles.waitingPulseRow}>
                  <View style={styles.waitingDot} />
                  <Text style={styles.waitingTxt}>
                    Écoute de l’interlocuteur...
                  </Text>
                </View>

                <Text style={styles.waitingSub}>
                  La scène continue automatiquement.
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: Math.max(22, insets.bottom + 8) }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  backTxt: {
    color: TXT,
    fontSize: 18,
  },

  modeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  modeTxt: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1.4,
  },

  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    marginTop: 6,
  },

  stepWrapper: {
    alignItems: "center",
    flex: 1,
  },

  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 8,
  },

  stepLabel: {
    color: MUTED,
    fontSize: 12,
    fontFamily: fonts.medium,
  },

  videoContainer: {
    width: "100%",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 1,
  },

  video: {
    flex: 1,
  },

  videoFallback: {
    flex: 1,
    backgroundColor: "#0F1220",
    alignItems: "center",
    justifyContent: "center",
  },

  videoFallbackEmoji: {
    fontSize: 56,
  },

  videoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
  },

  aiCard: {
    marginTop: -28,
    marginHorizontal: 18,
    backgroundColor: "rgba(10,13,26,0.96)",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  aiKr: {
    color: TXT,
    fontSize: 21,
    lineHeight: 31,
    fontFamily: fonts.kr,
    textAlign: "center",
    marginBottom: 10,
  },

  aiFr: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontStyle: "italic",
  },

  interactionSection: {
    marginTop: 26,
    minHeight: 220,
  },

  sectionTitle: {
    color: TXT,
    fontSize: 18,
    fontFamily: fonts.black,
    marginBottom: 14,
    marginLeft: 4,
  },

  choicesGrid: {
    gap: 12,
  },

  choiceBtn: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: LINE,
    overflow: "hidden",
  },

  choiceGlow: {
    position: "absolute",
    top: -20,
    right: -12,
    width: 86,
    height: 86,
    borderRadius: 43,
  },

  choiceKr: {
    color: TXT,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },

  choiceFr: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },

  waitingCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 132,
  },

  waitingPulseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.50)",
    marginRight: 10,
  },

  waitingTxt: {
    color: TXT,
    fontSize: 15,
    fontFamily: fonts.medium,
  },

  waitingSub: {
    color: SOFT,
    fontSize: 13,
    textAlign: "center",
  },

  endCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 18,
  },

  endTitle: {
    color: TXT,
    fontSize: 18,
    fontFamily: fonts.black,
    marginBottom: 6,
  },

  endSubtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  endActions: {
    gap: 10,
  },

  endActionPrimary: {
    borderRadius: 18,
    overflow: "hidden",
  },

  endActionPrimaryInner: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  endActionPrimaryText: {
    color: "white",
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  endActionSecondary: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  endActionSecondaryText: {
    color: TXT,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
