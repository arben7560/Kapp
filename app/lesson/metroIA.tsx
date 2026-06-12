import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
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

import { ABSOLUTE_FILL } from "../../constants/layout";
import { metroLessons } from "../../data/lesson/metro/metro";

// ==================== DESIGN SYSTEM ====================
const BG_DEEP = "#050508";
// Ancien background gradient : const BG_NAVY = "#0A0D1A";
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
const iaIntroRoute = require("../../assets/ai/metro/ia_intro_route.mp4");
const iaRepeatIntroRoute = require("../../assets/ai/metro/ia_repeat_intro_route.mp4");
const iaRepeatIntroRouteSlow = require("../../assets/ai/metro/ia_repeat_intro_route_slow.mp4");

const iaPlatformDirection = require("../../assets/ai/metro/ia_platform_direction.mp4");
const iaRepeatPlatformDirection = require("../../assets/ai/metro/ia_repeat_platform_direction.mp4");
const iaRepeatPlatformDirectionShort = require("../../assets/ai/metro/ia_repeat_platform_direction_short.mp4");

const iaTripTime = require("../../assets/ai/metro/ia_trip_time.mp4");
const iaRepeatTripTime = require("../../assets/ai/metro/ia_repeat_trip_time.mp4");
const iaRepeatTripTimeShort = require("../../assets/ai/metro/ia_repeat_trip_time_short.mp4");

const iaTransferInfo = require("../../assets/ai/metro/ia_transfer_info.mp4");
const iaRepeatTransferInfo = require("../../assets/ai/metro/ia_repeat_transfer_info.mp4");
const iaRepeatTransferInfoShort = require("../../assets/ai/metro/ia_repeat_transfer_info_short.mp4");

const iaExitInfo = require("../../assets/ai/metro/ia_exit_info.mp4");
const iaRepeatExitInfo = require("../../assets/ai/metro/ia_repeat_exit_info.mp4");
const iaRepeatExitInfoShort = require("../../assets/ai/metro/ia_repeat_exit_info_short.mp4");

const iaExitLandmarkInfo = require("../../assets/ai/metro/ia_exit_landmark_info.mp4");
const iaRepeatExitLandmarkInfo = require("../../assets/ai/metro/ia_repeat_exit_landmark_info.mp4");
const iaRepeatExitLandmarkInfoShort = require("../../assets/ai/metro/ia_repeat_exit_landmark_info_short.mp4");

const iaEndSummary = require("../../assets/ai/metro/ia_end_summary.mp4");
const iaEndSummaryShort = require("../../assets/ai/metro/ia_end_summary_short.mp4");
const iaEnd = require("../../assets/ai/metro/ia_end.mp4");
const metroBackground = require("../../assets/images/metrobg.png");

// ==================== TYPES ====================
type ModeType = "guided" | "real";

type MetroChoice = {
  id: string;
  label: string;
  korean: string;
  romanization?: string;
  nextId: string;
};

type MetroStep = {
  id: string;
  speaker: "ai" | "user";
  phase?: string;
  narrator?: string;
  text?: string;
  korean?: string;
  french?: string;
  romanization?: string;
  choices?: MetroChoice[];
};

type MetroLesson = {
  id: string;
  title: string;
  shortTitle: string;
  situation: string;
  objective: string;
  steps: MetroStep[];
};

type DialogueChoice = {
  id: string;
  label: string;
  korean: string;
  nextNodeId: string;
};

type DialogueNode = {
  id: string;
  type: "ia" | "user_choice";
  korean?: string;
  french?: string;
  nextNodeId?: string;
  choices?: DialogueChoice[];
  videoSource?: number;
  videoSources?: number[];
};

type DialogueScenario = {
  id: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
};

// ==================== HELPERS ====================
function normalizeMode(rawMode: string | string[] | undefined): ModeType {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

function getProgressIndex(nodeId: string): number {
  const id = nodeId.toLowerCase();

  if (/start|intro|welcome|accueil|route/.test(id)) return 0;

  if (/platform|direction|ligne|quai/.test(id)) return 1;

  if (/trip|transfer|time|trajet|환승|시간/.test(id)) return 2;

  if (/exit|landmark|summary|end|sortie|fin|coex|teheran/.test(id)) return 3;

  return 0;
}

function getAutoAdvanceDelay(node: DialogueNode, mode: ModeType) {
  const textLength = (node.korean?.length || 0) + (node.french?.length || 0);
  const base = mode === "real" ? 2600 : 2200;
  const byLength = Math.min(textLength * 20, 1800);

  return base + byLength;
}

function attachMetroVideosToNode(nodeId: string): number[] | undefined {
  const videos: Record<string, number> = {
    ia_intro_route: iaIntroRoute,
    ia_repeat_intro_route: iaRepeatIntroRoute,
    ia_repeat_intro_route_slow: iaRepeatIntroRouteSlow,

    ia_platform_direction: iaPlatformDirection,
    ia_repeat_platform_direction: iaRepeatPlatformDirection,
    ia_repeat_platform_direction_short: iaRepeatPlatformDirectionShort,

    ia_trip_time: iaTripTime,
    ia_repeat_trip_time: iaRepeatTripTime,
    ia_repeat_trip_time_short: iaRepeatTripTimeShort,

    ia_transfer_info: iaTransferInfo,
    ia_repeat_transfer_info: iaRepeatTransferInfo,
    ia_repeat_transfer_info_short: iaRepeatTransferInfoShort,

    ia_exit_info: iaExitInfo,
    ia_repeat_exit_info: iaRepeatExitInfo,
    ia_repeat_exit_info_short: iaRepeatExitInfoShort,

    ia_exit_landmark_info: iaExitLandmarkInfo,
    ia_repeat_exit_landmark_info: iaRepeatExitLandmarkInfo,
    ia_repeat_exit_landmark_info_short: iaRepeatExitLandmarkInfoShort,

    ia_end_summary: iaEndSummary,
    ia_end_summary_short: iaEndSummaryShort,
    ia_end: iaEnd,
  };

  return videos[nodeId] ? [videos[nodeId]] : undefined;
}

function buildMetroScenario(lesson: MetroLesson): DialogueScenario {
  const nodes: Record<string, DialogueNode> = {};

  for (const step of lesson.steps) {
    const hasChoices = !!step.choices?.length;

    /**
     * Cas spécial :
     * Le début de la scène doit afficher directement les choix utilisateur.
     * L'utilisateur commence la discussion, donc on ne crée pas de node IA
     * avec délai automatique avant les réponses.
     */
    if (step.id === "start" && hasChoices && step.choices) {
      nodes[step.id] = {
        id: step.id,
        type: "user_choice",
        korean: step.korean || step.text || "...",
        french: step.french || step.text,
        choices: step.choices.map((choice) => ({
          id: choice.id,
          label: choice.label,
          korean: choice.korean,
          nextNodeId: choice.nextId,
        })),
      };

      continue;
    }

    const choiceNodeId = `${step.id}_choices`;

    nodes[step.id] = {
      id: step.id,
      type: "ia",
      korean: step.korean || step.text || "...",
      french: step.french || step.text,
      nextNodeId: hasChoices ? choiceNodeId : undefined,
      videoSources: attachMetroVideosToNode(step.id),
    };

    if (hasChoices && step.choices) {
      nodes[choiceNodeId] = {
        id: choiceNodeId,
        type: "user_choice",
        korean: step.korean || step.text || "...",
        french: step.french || step.text,
        choices: step.choices.map((choice) => ({
          id: choice.id,
          label: choice.label,
          korean: choice.korean,
          nextNodeId: choice.nextId,
        })),
      };
    }
  }

  return {
    id: lesson.id,
    startNodeId: lesson.steps[0]?.id || "start",
    nodes,
  };
}

// ==================== MAIN ====================
export default function MetroIaScreen() {
  /**
   * Important :
   * On initialise directement avec iaIntroRoute.
   * Comme le node "start" n'a pas de vidéo propre, cela permet d'afficher
   * l'avatar immédiatement au lieu d'afficher une icône fallback.
   */
  const [displayedVideoSource, setDisplayedVideoSource] = useState<
    number | null
  >(iaIntroRoute);

  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);

  const scrollRef = useRef<ScrollView>(null);
  const mountedRef = useRef(true);
  const iaAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedFromVideoRef = useRef(false);

  const metroScenario = useMemo(() => {
    const hongikToGangnamLesson =
      metroLessons.find((lesson) => lesson.id === "hongik_to_gangnam") ??
      metroLessons[0];

    return buildMetroScenario(hongikToGangnamLesson as MetroLesson);
  }, []);

  const [currentNodeId, setCurrentNodeId] = useState(metroScenario.startNodeId);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSceneEnded, setIsSceneEnded] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const currentScenario = useMemo(() => {
    return metroScenario;
  }, [metroScenario]);

  const currentNode = currentScenario.nodes[currentNodeId];

  const progressIndex = getProgressIndex(currentNodeId);
  const steps = ["Accueil", "Ligne", "Trajet", "Sortie"];

  const videoSources =
    currentNode?.videoSources ||
    (currentNode?.videoSource ? [currentNode.videoSource] : []);

  const currentVideoSource = videoSources.length > 0 ? videoSources[0] : null;

  const player = useVideoPlayer(null, (playerInstance) => {
    playerInstance.loop = false;
  });

  useEffect(() => {
    if (currentNode?.type === "ia" && currentVideoSource) {
      setDisplayedVideoSource(currentVideoSource);
    }
  }, [currentNode, currentVideoSource]);

  const avatarFrameHeight = Math.min(screenWidth * 0.9, screenHeight * 0.54);
  const avatarVideoHeight = Math.min(screenWidth * 0.9, screenHeight * 0.34);

  const goToNextNode = useCallback((node?: DialogueNode) => {
    if (!node || !mountedRef.current) return;

    if (node.nextNodeId) {
      setCurrentNodeId(node.nextNodeId);
    } else {
      setIsSceneEnded(true);
    }
  }, []);

  useEffect(() => {
    setCurrentNodeId(currentScenario.startNodeId);
    setDisplayedVideoSource(iaIntroRoute);
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    hasAdvancedFromVideoRef.current = false;
  }, [currentScenario]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (iaAutoTimerRef.current) {
        clearTimeout(iaAutoTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    hasAdvancedFromVideoRef.current = false;
    setIsTranscriptOpen(false);

    if (iaAutoTimerRef.current) {
      clearTimeout(iaAutoTimerRef.current);
      iaAutoTimerRef.current = null;
    }
  }, [currentNodeId]);

  useEffect(() => {
    if (!currentNode) return;
    if (!displayedVideoSource) return;

    let isCancelled = false;

    async function updateVideoSource() {
      try {
        await player.replaceAsync(displayedVideoSource);

        if (isCancelled) return;

        if (currentNode?.type === "ia" && currentVideoSource) {
          player.play();
        } else {
          /**
           * Sur le node "start", il n'y a pas encore de vidéo de node,
           * mais on garde iaIntroRoute affichée comme avatar visuel de départ.
           */
          player.pause();
        }
      } catch {
        // ignore
      }
    }

    void updateVideoSource();

    return () => {
      isCancelled = true;
    };
  }, [
    currentNode,
    currentNodeId,
    currentVideoSource,
    displayedVideoSource,
    player,
  ]);

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

      if (duration <= 0) return;

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

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 80);

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
    setDisplayedVideoSource(iaIntroRoute);
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    hasAdvancedFromVideoRef.current = false;
  };

  const isStartChoiceNode = currentNodeId === "start";

  const isReviewableTranscript =
    currentNode?.type === "user_choice" && !isStartChoiceNode;

  const shouldCollapseTranscript = isReviewableTranscript && !isTranscriptOpen;

  const displayedKoreanText = shouldCollapseTranscript
    ? "..."
    : currentNode?.korean || "...";

  const shouldShowFrench =
    !shouldCollapseTranscript && !isStartChoiceNode && !!currentNode?.french;
  const isUserChoice = currentNode?.type === "user_choice";

  return (
    <ImageBackground
      source={metroBackground}
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={0}
    >
      <View pointerEvents="none" style={styles.backgroundDarkOverlay} />

      {/*
        Background précédent :
        <LinearGradient colors={[BG_DEEP, BG_NAVY]} style={{ flex: 1 }}>
      */}

      {/*
        Halo de background précédent :
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
      */}

      {/*
        Halo de background précédent :
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
      */}

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
        </View>

        <View style={styles.body}>
          <View style={styles.topFixedSection}>
            <View style={styles.topInner}>
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
                    height: avatarFrameHeight,
                    borderColor:
                      mode === "real"
                        ? "rgba(34,211,238,0.40)"
                        : "rgba(168,85,247,0.42)",
                  },
                ]}
              >
                <VideoView
                  player={player}
                  style={[styles.video, { height: avatarVideoHeight }]}
                  contentFit="contain"
                  nativeControls={false}
                  allowsPictureInPicture={false}
                />

                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.62)"]}
                  style={styles.videoOverlay}
                />
              </View>

              <Pressable
                disabled={!isReviewableTranscript}
                onPress={() => {
                  if (!isReviewableTranscript) return;
                  setIsTranscriptOpen((prev) => !prev);
                }}
                style={[
                  styles.aiCard,
                  isStartChoiceNode && styles.aiCardCompact,
                  shouldCollapseTranscript && styles.aiCardCollapsed,
                ]}
              >
                <Text
                  style={[
                    styles.aiKr,
                    isStartChoiceNode && styles.aiIntroText,
                    shouldCollapseTranscript && styles.aiDotsText,
                  ]}
                >
                  {displayedKoreanText}
                </Text>

                {shouldShowFrench ? (
                  <Text style={styles.aiFr}>{currentNode?.french}</Text>
                ) : null}

                {isReviewableTranscript ? (
                  <Text style={styles.transcriptHint}>
                    {isTranscriptOpen
                      ? "Appuyer pour refermer"
                      : "Appuyer pour revoir"}
                  </Text>
                ) : null}
              </Pressable>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.interactionScroll,
              { paddingBottom: Math.max(22, insets.bottom + 8) },
            ]}
          >
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
                            backgroundColor: "rgba(5,5,8,0.92)",
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
          </ScrollView>
        </View>
      </SafeAreaView>
      {/*
        Fermeture du background précédent :
        </LinearGradient>
      */}
    </ImageBackground>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },
  backgroundDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(5,5,8,0.74)",
  },

  body: {
    flex: 1,
  },

  topFixedSection: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  topInner: {
    flexShrink: 0,
  },

  interactionScroll: {
    paddingHorizontal: 20,
    paddingTop: 26,
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
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 0,
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

  aiIntroText: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.medium,
    marginBottom: 0,
  },

  stepLabel: {
    color: MUTED,
    fontSize: 12,
    fontFamily: fonts.medium,
  },

  videoContainer: {
    width: "88%",
    alignSelf: "center",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#050508",
    borderWidth: 1,
  },
  video: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
    transform: [{ scale: 1.76 }, { translateX: -4 }, { translateY: 55 }],
  },

  videoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
  },

  aiCardCollapsed: {
    paddingVertical: 12,
  },

  aiDotsText: {
    fontSize: 24,
    lineHeight: 28,
    marginBottom: 4,
    letterSpacing: 2,
  },

  transcriptHint: {
    color: SOFT,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    fontFamily: fonts.medium,
    marginTop: 2,
  },

  aiCardCompact: {
    marginTop: -20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
  },

  aiCard: {
    marginTop: -20,
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
    fontSize: 19,
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
    backgroundColor: "rgba(5,5,8,0.74)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
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
