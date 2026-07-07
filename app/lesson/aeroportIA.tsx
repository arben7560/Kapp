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
import { aeroportDialogueData } from "../../data/lesson/aeroport/aeroport";
import {
  applyAeroportMissionToScenario,
  DEFAULT_AEROPORT_MISSION_ID,
  getAeroportMissionById,
} from "../../data/lesson/aeroport/aeroportMissions";
import { useStore } from "../../_store";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import { buildProgressId } from "../../lib/progressIds";

// ==================== DESIGN SYSTEM ====================
const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.64)";
const SOFT = "rgba(255,255,255,0.48)";

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
const iaWelcome = require("../../assets/ai/aeroport/ia_welcome.mp4");
const iaWelcomeRepeat = require("../../assets/ai/aeroport/ia_welcome_repeat.mp4");
const iaLost = require("../../assets/ai/aeroport/ia_lost.mp4");
const iaLostRepeat = require("../../assets/ai/aeroport/ia_lost_repeat.mp4");
const iaTmoney = require("../../assets/ai/aeroport/ia_tmoney.mp4");
const iaTmoneyRepeat = require("../../assets/ai/aeroport/ia_tmoney_repeat.mp4");
const iaTmoneyCharge = require("../../assets/ai/aeroport/ia_tmoney_charge.mp4");
const iaTmoneyChargeRepeat = require("../../assets/ai/aeroport/ia_tmoney_charge_repeat.mp4");
const iaTmoneyArex = require("../../assets/ai/aeroport/ia_tmoney_arex.mp4");
const iaTmoneyArexRepeat = require("../../assets/ai/aeroport/ia_tmoney_arex_repeat.mp4");
const iaTransport = require("../../assets/ai/aeroport/ia_transport.mp4");
const iaTransportRepeat = require("../../assets/ai/aeroport/ia_transport_repeat.mp4");
const iaRecommend = require("../../assets/ai/aeroport/ia_recommend.mp4");
const iaRecommendRepeat = require("../../assets/ai/aeroport/ia_recommend_repeat.mp4");
const iaPlatform = require("../../assets/ai/aeroport/ia_platform.mp4");
const iaPlatformRepeat = require("../../assets/ai/aeroport/ia_platform_repeat.mp4");
const iaVerifyTrain = require("../../assets/ai/aeroport/ia_verify_train.mp4");
const iaVerifyTrainRepeat = require("../../assets/ai/aeroport/ia_verify_train_repeat.mp4");
const iaTime = require("../../assets/ai/aeroport/ia_time.mp4");
const iaTimeRepeat = require("../../assets/ai/aeroport/ia_time_repeat.mp4");
const iaSummary = require("../../assets/ai/aeroport/ia_summary.mp4");
const iaSummaryShort = require("../../assets/ai/aeroport/ia_summary_short.mp4");
const iaEnd = require("../../assets/ai/aeroport/ia_end.mp4");
const airportBackground = require("../../assets/images/airport.png");

// ==================== TYPES ====================
type ModeType = "guided" | "real";

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

type ScriptNode = {
  id: string;
  type: "ia" | "user_choice";
  korean?: string;
  french?: string;
  nextNodeId?: string | null;
  choices?: DialogueChoice[];
};

// ==================== HELPERS ====================
function normalizeMode(rawMode: string | string[] | undefined): ModeType {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

function normalizeParam(rawValue: string | string[] | undefined) {
  return Array.isArray(rawValue) ? rawValue[0] : rawValue;
}

function getProgressIndex(nodeId: string): number {
  const id = nodeId.toLowerCase();

  if (/welcome|lost/.test(id)) return 0;

  if (/tmoney|charge/.test(id)) return 1;

  if (/transport|arex|recommend|platform|verify|time/.test(id)) return 2;

  if (/summary|end/.test(id)) return 3;

  return 0;
}

function getAutoAdvanceDelay(node: DialogueNode, mode: ModeType) {
  const textLength = (node.korean?.length || 0) + (node.french?.length || 0);
  const base = mode === "real" ? 2600 : 2200;
  const byLength = Math.min(textLength * 20, 1800);

  return base + byLength;
}

function attachAeroportVideosToNode(nodeId: string): number[] | undefined {
  const videos: Record<string, number> = {
    ia_welcome: iaWelcome,
    ia_welcome_repeat: iaWelcomeRepeat,
    ia_lost: iaLost,
    ia_lost_repeat: iaLostRepeat,
    ia_tmoney: iaTmoney,
    ia_tmoney_repeat: iaTmoneyRepeat,
    ia_tmoney_charge: iaTmoneyCharge,
    ia_tmoney_charge_repeat: iaTmoneyChargeRepeat,
    ia_tmoney_arex: iaTmoneyArex,
    ia_tmoney_arex_repeat: iaTmoneyArexRepeat,
    ia_transport: iaTransport,
    ia_transport_repeat: iaTransportRepeat,
    ia_recommend: iaRecommend,
    ia_recommend_repeat: iaRecommendRepeat,
    ia_platform: iaPlatform,
    ia_platform_repeat: iaPlatformRepeat,
    ia_verify_train: iaVerifyTrain,
    ia_verify_train_repeat: iaVerifyTrainRepeat,
    ia_time: iaTime,
    ia_time_repeat: iaTimeRepeat,
    ia_summary: iaSummary,
    ia_summary_short: iaSummaryShort,
    ia_end: iaEnd,
  };

  return videos[nodeId] ? [videos[nodeId]] : undefined;
}

function buildAeroportScenarioFromScript(): DialogueScenario {
  const nodes: Record<string, DialogueNode> = {};
  const scriptNodes = aeroportDialogueData.nodes as Record<string, ScriptNode>;

  for (const [nodeId, node] of Object.entries(scriptNodes)) {
    nodes[nodeId] = {
      id: node.id,
      type: node.type,
      korean: node.korean,
      french: node.french,
      nextNodeId: node.nextNodeId || undefined,
      choices: node.choices?.map((choice) => ({
        id: choice.id,
        label: choice.label,
        korean: choice.korean,
        nextNodeId: choice.nextNodeId,
      })),
      videoSources: attachAeroportVideosToNode(nodeId),
    };
  }

  return {
    id: "aeroport",
    startNodeId: aeroportDialogueData.startNodeId,
    nodes,
  };
}

// ==================== MAIN ====================
export default function AeroportIaScreen() {
  const { complete } = useStore();
  const [displayedVideoSource, setDisplayedVideoSource] = useState<
    number | null
  >(iaWelcome);

  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const missionId =
    normalizeParam(params.mission as string | string[] | undefined) ??
    DEFAULT_AEROPORT_MISSION_ID;
  const currentMission =
    getAeroportMissionById(missionId) ??
    getAeroportMissionById(DEFAULT_AEROPORT_MISSION_ID);
  const { hasPremiumAccess, isLoading: isPaywallLoading } = usePaywall();
  const canEnterMission =
    currentMission?.access !== "premium" || hasPremiumAccess;

  const scrollRef = useRef<ScrollView>(null);
  const mountedRef = useRef(true);
  const iaAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedFromVideoRef = useRef(false);
  const hasReportedMissionCompleteRef = useRef(false);

  const currentScenario = useMemo(() => {
    const scenario = buildAeroportScenarioFromScript();
    return currentMission
      ? applyAeroportMissionToScenario(scenario, currentMission.scenarioKey)
      : scenario;
  }, [currentMission]);

  const [currentNodeId, setCurrentNodeId] = useState(
    currentScenario.startNodeId,
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSceneEnded, setIsSceneEnded] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [lastIaTranscript, setLastIaTranscript] = useState<{
    korean: string;
    french?: string;
  } | null>(null);

  const currentNode = currentScenario.nodes[currentNodeId];

  const progressIndex = getProgressIndex(currentNodeId);
  const steps = ["Accueil", "T-money", "Trajet", "Final"];

  const videoSources =
    currentNode?.videoSources ||
    (currentNode?.videoSource ? [currentNode.videoSource] : []);

  const currentVideoSource = videoSources.length > 0 ? videoSources[0] : null;

  const player = useVideoPlayer(null, (playerInstance) => {
    playerInstance.loop = false;
  });

  useEffect(() => {
    if (isPaywallLoading || canEnterMission) return;
    router.replace("/premium");
  }, [canEnterMission, isPaywallLoading]);

  const avatarFrameHeight = Math.min(screenWidth * 0.9, screenHeight * 0.54);
  const avatarVideoHeight = Math.min(screenWidth * 0.9, screenHeight * 0.34);

  const goToNextNode = useCallback((node?: DialogueNode) => {
    if (!node || !mountedRef.current) return;

    if (node.type === "ia") {
      setLastIaTranscript({
        korean: node.korean || "...",
        french: node.french,
      });
    }

    if (node.nextNodeId) {
      setIsTranscriptOpen(false);
      setCurrentNodeId(node.nextNodeId);
    } else {
      setIsSceneEnded(true);
    }
  }, []);

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
    hasReportedMissionCompleteRef.current = false;
  }, [currentScenario]);

  useEffect(() => {
    if (!isSceneEnded || hasReportedMissionCompleteRef.current) return;

    hasReportedMissionCompleteRef.current = true;
    complete(buildProgressId("aeroport", mode, missionId));
    void completeDailyActivity("ai_mission");
  }, [complete, isSceneEnded, missionId, mode]);

  useEffect(() => {
    hasAdvancedFromVideoRef.current = false;

    if (iaAutoTimerRef.current) {
      clearTimeout(iaAutoTimerRef.current);
      iaAutoTimerRef.current = null;
    }
  }, [currentNodeId]);

  useEffect(() => {
    if (!canEnterMission) return;
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
    canEnterMission,
    player,
  ]);

  useEffect(() => {
    if (!canEnterMission) return;
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
    canEnterMission,
    player,
    goToNextNode,
  ]);

  useEffect(() => {
    if (!canEnterMission) return;
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
    canEnterMission,
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

      const nextNode = currentScenario.nodes[choice.nextNodeId];
      const nextVideoSources =
        nextNode?.videoSources ||
        (nextNode?.videoSource ? [nextNode.videoSource] : []);

      if (nextNode?.type === "ia" && nextVideoSources.length > 0) {
        setDisplayedVideoSource(nextVideoSources[0]);
      }

      setIsTranscriptOpen(false);
      setCurrentNodeId(choice.nextNodeId);
      setSelectedChoiceId(null);
      setIsTransitioning(false);
    }, 320);
  };

  const handleRestart = () => {
    setCurrentNodeId(currentScenario.startNodeId);
    setDisplayedVideoSource(iaWelcome);
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setIsTranscriptOpen(false);
    setLastIaTranscript(null);
    hasAdvancedFromVideoRef.current = false;
    hasReportedMissionCompleteRef.current = false;
  };

  const isStartChoiceNode = currentNodeId === "welcome_choices";

  const isReviewableTranscript =
    currentNode?.type === "user_choice" &&
    !isStartChoiceNode &&
    !!lastIaTranscript;

  const shouldCollapseTranscript = isReviewableTranscript && !isTranscriptOpen;

  const transcriptKorean = isReviewableTranscript
    ? lastIaTranscript?.korean
    : currentNode?.korean;

  const transcriptFrench = isReviewableTranscript
    ? lastIaTranscript?.french
    : currentNode?.french;

  const displayedKoreanText = shouldCollapseTranscript
    ? "..."
    : transcriptKorean || "...";

  const shouldShowFrench =
    !shouldCollapseTranscript &&
    !isStartChoiceNode &&
    typeof transcriptFrench === "string" &&
    transcriptFrench.trim().length > 0;
  const isUserChoice = currentNode?.type === "user_choice";

  if (!isPaywallLoading && !canEnterMission) {
    return null;
  }

  return (
    <ImageBackground
      source={airportBackground}
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={0}
    >
      <View pointerEvents="none" style={styles.backgroundDarkOverlay} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(6, insets.top * 0.15) },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>x</Text>
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
                  <Text style={styles.aiFr}>{transcriptFrench}</Text>
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
              <Text style={styles.sectionTitle}>Ta reponse</Text>

              {isSceneEnded ? (
                <View style={styles.endCard}>
                  <Text style={styles.endTitle}>Scene terminee</Text>

                  <Text style={styles.endSubtitle}>
                    Tu peux rejouer cette scene ou revenir au menu.
                  </Text>

                  <Text style={styles.endSubtitle}>Serie conservee.</Text>

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
                      Ecoute de l&apos;interlocuteur...
                    </Text>
                  </View>

                  <Text style={styles.waitingSub}>
                    La scene continue automatiquement.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
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
    transform: [{ scale: 1.88 }, { translateY: 30 }],
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
