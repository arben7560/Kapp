import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ABSOLUTE_FILL } from "../../constants/layout";
import { AppText } from "../../components/app-text";
import {
  restaurantDialogueData,
  type DialogueChoice,
  type DialogueNode,
  type DialogueScenario,
} from "../../data/lesson/restaurant/restaurant";
import {
  DEFAULT_RESTAURANT_MISSION_ID,
  getRestaurantMissionById,
  getRestaurantMissionScenario,
} from "../../data/lesson/restaurant/restaurantMissions";
import { useStore } from "../../_store";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import { buildProgressId } from "../../lib/progressIds";

// ==================== DESIGN SYSTEM ====================
const BG_DEEP = "#050508";
const LINE = "rgba(255,255,255,0.08)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const PURPLE = "#A855F7";
const VIDEO_OVERSCAN_SCALE = 1.06;

// ==================== VIDEOS ====================
const pedWelcome = require("../../assets/ai/restaurant/ped_welcome.mp4");
const pedRecommendation = require("../../assets/ai/restaurant/ped_recommendation.mp4");
const pedConfirmGalb = require("../../assets/ai/restaurant/ped_confirm_galb.mp4");
const pedConfirmSamgyeopsal = require("../../assets/ai/restaurant/ped_confirm_samgyeopsal.mp4");
const pedExtraBring = require("../../assets/ai/restaurant/ped_extra_bring.mp4.mp4");
const pedExtraPrompt = require("../../assets/ai/restaurant/ped_extra_prompt.mp4");
const pedSpicyPrompt = require("../../assets/ai/restaurant/ped_spicy_prompt.mp4");
const pedSidePrompt = require("../../assets/ai/restaurant/ped_side_prompt.mp4");
const pedPaymentPrompt = require("../../assets/ai/restaurant/ped_payment_prompt.mp4");
const pedReceiptCard = require("../../assets/ai/restaurant/ped_receipt_card.mp4");
const pedReceiptCash = require("../../assets/ai/restaurant/ped_receipt_cash.mp4");
const pedGoodbye = require("../../assets/ai/restaurant/ped_goodbye.mp4");
const restaurantBackground = require("../../assets/images/restaurant.png");

const videoByNodeId: Record<string, number> = {
  ped_welcome: pedWelcome,
  ped_recommendation: pedRecommendation,
  ped_confirm_galbi: pedConfirmGalb,
  ped_confirm_samgyeopsal: pedConfirmSamgyeopsal,
  ped_extra_bring: pedExtraBring,
  ped_extra_prompt: pedExtraPrompt,
  ped_spicy_prompt: pedSpicyPrompt,
  ped_side_prompt: pedSidePrompt,
  ped_payment_prompt: pedPaymentPrompt,
  ped_receipt_card: pedReceiptCard,
  ped_receipt_cash: pedReceiptCash,
  ped_goodbye: pedGoodbye,
};

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

function normalizeParam(rawValue: string | string[] | undefined) {
  return Array.isArray(rawValue) ? rawValue[0] : rawValue;
}

function getProgressIndex(nodeId: string): number {
  const progressByNodeId: Record<string, number> = {
    ped_welcome: 0,
    ped_meat_choice: 0,
    ped_recommendation: 0,
    ped_after_recommendation_choice: 0,

    ped_confirm_samgyeopsal: 1,
    ped_confirm_galbi: 1,
    ped_grill_choice_samgyeopsal: 1,
    ped_grill_choice_galbi: 1,

    ped_side_prompt: 2,
    ped_side_choice: 2,
    ped_spicy_prompt: 2,
    ped_spicy_choice: 2,
    ped_extra_prompt: 2,
    ped_extra_choice: 2,
    ped_extra_bring: 2,

    ped_payment_prompt: 3,
    ped_payment_choice: 3,
    ped_receipt_card: 3,
    ped_receipt_cash: 3,
    ped_receipt_choice: 3,

    ped_goodbye: 4,
  };

  return progressByNodeId[nodeId] ?? 0;
}

function attachRestaurantVideosToScenario(
  scenario: DialogueScenario,
): DialogueScenario {
  const nodes: Record<string, DialogueNodeWithVideo> = {};

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    nodes[nodeId] = {
      ...node,
      ...(videoByNodeId[nodeId]
        ? { videoSources: [videoByNodeId[nodeId]] }
        : {}),
    };
  }

  return { ...scenario, nodes };
}

function getAutoAdvanceDelay(node: DialogueNodeWithVideo, mode: ModeType) {
  const textLength = (node.korean?.length || 0) + (node.french?.length || 0);
  const base = mode === "real" ? 2600 : 2200;
  const byLength = Math.min(textLength * 20, 1800);
  return base + byLength;
}

// ==================== MAIN ====================
export default function RestaurantIaScreen() {
  const { complete } = useStore();
  const [displayedVideoSource, setDisplayedVideoSource] = useState<
    number | null
  >(null);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const responsive = useResponsiveLayout({ maxWidth: 760 });
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const missionId =
    normalizeParam(params.mission as string | string[] | undefined) ??
    DEFAULT_RESTAURANT_MISSION_ID;
  const currentMission =
    getRestaurantMissionById(missionId) ??
    getRestaurantMissionById(DEFAULT_RESTAURANT_MISSION_ID);
  const { hasPremiumAccess, isLoading: isPaywallLoading } = usePaywall();
  const canEnterMission =
    currentMission?.access !== "premium" || hasPremiumAccess;

  const scrollRef = useRef<ScrollView>(null);
  const mountedRef = useRef(true);
  const iaAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedFromVideoRef = useRef(false);
  const hasReportedMissionCompleteRef = useRef(false);

  const currentScenario = useMemo(() => {
    const missionScenario = currentMission
      ? getRestaurantMissionScenario(
          restaurantDialogueData.pedagogical,
          currentMission.scenarioKey,
        )
      : restaurantDialogueData.pedagogical;

    return attachRestaurantVideosToScenario(missionScenario);
  }, [currentMission]);

  const [currentNodeId, setCurrentNodeId] = useState(
    currentScenario.startNodeId,
  );
  const [maxProgressIndex, setMaxProgressIndex] = useState(() =>
    getProgressIndex(currentScenario.startNodeId),
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSceneEnded, setIsSceneEnded] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const [lastIaTranscript, setLastIaTranscript] = useState<{
    korean: string;
    french?: string;
  } | null>(null);

  const currentNode = currentScenario.nodes[currentNodeId] as
    | DialogueNodeWithVideo
    | undefined;

  const progressIndex = Math.max(
    maxProgressIndex,
    getProgressIndex(currentNodeId),
  );
  const steps = ["Commande", "Viande", "Accomp.", "Paiement", "Final"];

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

  useEffect(() => {
    if (!canEnterMission) return;
    if (currentNode?.type === "ia" && currentVideoSource) {
      setDisplayedVideoSource(currentVideoSource);
    }
  }, [canEnterMission, currentNode, currentVideoSource]);

  const avatarFrameHeight = Math.min(
    responsive.contentWidth * 0.95,
    screenWidth * 0.9,
    screenHeight * 0.54,
    420,
  );
  const avatarVideoHeight = avatarFrameHeight;

  const goToNextNode = useCallback((node?: DialogueNodeWithVideo) => {
    if (!node || !mountedRef.current) return;

    if (node.type === "ia") {
      setLastIaTranscript({
        korean: node.korean || "...",
        french: node.french,
      });
    }

    const nextNodeId = node.nextNodeId;

    if (nextNodeId) {
      setMaxProgressIndex((current) =>
        Math.max(current, getProgressIndex(nextNodeId)),
      );
      setCurrentNodeId(nextNodeId);
    } else {
      setIsSceneEnded(true);
    }
  }, []);

  useEffect(() => {
    setCurrentNodeId(currentScenario.startNodeId);
    setMaxProgressIndex(getProgressIndex(currentScenario.startNodeId));
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setIsTranscriptOpen(false);
    setLastIaTranscript(null);
    hasAdvancedFromVideoRef.current = false;
    hasReportedMissionCompleteRef.current = false;
  }, [currentScenario]);

  useEffect(() => {
    if (!isSceneEnded || hasReportedMissionCompleteRef.current) return;

    hasReportedMissionCompleteRef.current = true;
    complete(buildProgressId("restaurant", mode, missionId));
    void completeDailyActivity("ai_mission");
  }, [complete, isSceneEnded, missionId, mode]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (iaAutoTimerRef.current) clearTimeout(iaAutoTimerRef.current);
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
      setMaxProgressIndex((current) =>
        Math.max(current, getProgressIndex(choice.nextNodeId)),
      );
      setCurrentNodeId(choice.nextNodeId);
      setSelectedChoiceId(null);
      setIsTransitioning(false);
    }, 320);
  };

  const handleRestart = () => {
    setCurrentNodeId(currentScenario.startNodeId);
    setMaxProgressIndex(getProgressIndex(currentScenario.startNodeId));
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setIsTranscriptOpen(false);
    setLastIaTranscript(null);
    hasAdvancedFromVideoRef.current = false;
    hasReportedMissionCompleteRef.current = false;
  };

  const isUserChoice = currentNode?.type === "user_choice";

  const isReviewableTranscript =
    currentNode?.type === "user_choice" && !!lastIaTranscript;

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
    typeof transcriptFrench === "string" &&
    transcriptFrench.trim().length > 0;

  if (!isPaywallLoading && !canEnterMission) {
    return null;
  }

  return (
    <ImageBackground
      source={restaurantBackground}
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={2}
    >
      <View pointerEvents="none" style={styles.backgroundDarkOverlay} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(6, insets.top * 0.15) },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <AppText variant="button" tone="strong" script="latin" style={styles.backTxt}>
              x
            </AppText>
          </Pressable>
        </View>

        <View style={styles.body}>
          <View
            style={[
              styles.topFixedSection,
              { paddingHorizontal: responsive.horizontalPadding },
            ]}
          >
            <View style={[styles.topInner, { maxWidth: responsive.maxWidth }]}>
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
                      <AppText
                        variant={active ? "bodyStrong" : "bodySecondary"}
                        tone={active ? "strong" : "muted"}
                        script="latin"
                        style={styles.stepLabel}
                      >
                        {s}
                      </AppText>
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
                <LinearGradient
                  colors={[
                    "rgba(34,211,238,0.14)",
                    "rgba(10,13,26,0.96)",
                    "rgba(244,114,182,0.10)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                {displayedVideoSource ? (
                  <VideoView
                    accessible
                    accessibilityRole="image"
                    accessibilityLabel="Video de l'interlocuteur restaurant"
                    player={player}
                    style={[styles.video, { height: avatarVideoHeight }]}
                    contentFit="cover"
                    surfaceType="textureView"
                    useExoShutter={false}
                    nativeControls={false}
                    allowsPictureInPicture={false}
                  />
                ) : (
                  <View style={styles.videoFallback}>
                    <AppText
                      variant="display"
                      tone="soft"
                      script="latin"
                      align="center"
                      style={styles.videoFallbackEmoji}
                    >
                      ...
                    </AppText>
                  </View>
                )}

                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(10,13,26,0.32)",
                    "rgba(10,13,26,0.50)",
                  ]}
                  locations={[0, 0.62, 1]}
                  style={styles.videoOverlay}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isTranscriptOpen
                    ? "Refermer la transcription"
                    : "Revoir la transcription"
                }
                accessibilityState={{
                  disabled: !isReviewableTranscript,
                  expanded: isTranscriptOpen,
                }}
                aria-disabled={!isReviewableTranscript}
                aria-expanded={isTranscriptOpen}
                hitSlop={6}
                disabled={!isReviewableTranscript}
                onPress={() => {
                  if (!isReviewableTranscript) return;
                  setIsTranscriptOpen((prev) => !prev);
                }}
                style={[
                  styles.aiCard,
                  shouldCollapseTranscript && styles.aiCardCollapsed,
                ]}
              >
                <AppText
                  variant="koreanSecondary"
                  tone="strong"
                  script="korean"
                  accessibilityLanguage="ko-KR"
                  align="center"
                  style={[
                    styles.aiKr,
                    shouldCollapseTranscript && styles.aiDotsText,
                  ]}
                >
                  {displayedKoreanText}
                </AppText>

                {shouldShowFrench ? (
                  <AppText
                    variant="bodySecondary"
                    tone="muted"
                    script="latin"
                    align="center"
                    style={styles.aiFr}
                  >
                    {transcriptFrench}
                  </AppText>
                ) : null}

                {isReviewableTranscript ? (
                  <AppText
                    variant="caption"
                    tone="soft"
                    script="latin"
                    align="center"
                    style={styles.transcriptHint}
                  >
                    {isTranscriptOpen
                      ? "Appuyer pour refermer"
                      : "Appuyer pour revoir"}
                  </AppText>
                ) : null}
              </Pressable>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.interactionScroll,
              { paddingHorizontal: responsive.horizontalPadding },
              { paddingBottom: Math.max(22, insets.bottom + 8) },
            ]}
          >
            <View
              style={[
                styles.interactionSection,
                { maxWidth: responsive.maxWidth },
              ]}
            >
              <AppText
                variant="sectionTitle"
                tone="strong"
                script="latin"
                style={styles.sectionTitle}
              >
                Ta reponse
              </AppText>

              {isSceneEnded ? (
                <View style={styles.endCard}>
                  <AppText
                    variant="sectionTitle"
                    tone="strong"
                    script="latin"
                    style={styles.endTitle}
                  >
                    Scene terminee
                  </AppText>
                  <AppText
                    variant="bodySecondary"
                    tone="muted"
                    script="latin"
                    style={styles.endSubtitle}
                  >
                    Tu peux rejouer cette scene ou revenir au menu.
                  </AppText>

                  <AppText
                    variant="bodySecondary"
                    tone="muted"
                    script="latin"
                    style={styles.endSubtitle}
                  >
                    Serie conservee.
                  </AppText>

                  <View style={styles.endActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Rejouer la scene"
                      hitSlop={6}
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
                        <AppText
                          variant="button"
                          tone="strong"
                          script="latin"
                          align="center"
                          style={styles.endActionPrimaryText}
                        >
                          Rejouer
                        </AppText>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Retour"
                      hitSlop={6}
                      onPress={() => router.back()}
                      style={({ pressed }) => [
                        styles.endActionSecondary,
                        { opacity: pressed ? 0.9 : 1 },
                      ]}
                    >
                      <AppText
                        variant="button"
                        tone="strong"
                        script="latin"
                        align="center"
                        style={styles.endActionSecondaryText}
                      >
                        Retour
                      </AppText>
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
                        accessibilityRole="button"
                        accessibilityLabel={`${choice.korean}. ${choice.label}`}
                        accessibilityState={{ selected: isSelected }}
                        aria-selected={isSelected}
                        hitSlop={6}
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

                        <AppText
                          variant="koreanSecondary"
                          tone="strong"
                          script="korean"
                          accessibilityLanguage="ko-KR"
                          style={styles.choiceKr}
                        >
                          {choice.korean}
                        </AppText>
                        <AppText
                          variant="bodySecondary"
                          tone="muted"
                          script="latin"
                          style={styles.choiceFr}
                        >
                          {choice.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.waitingCard}>
                  <View style={styles.waitingPulseRow}>
                    <View style={styles.waitingDot} />
                    <AppText
                      variant="body"
                      tone="strong"
                      script="latin"
                      style={styles.waitingTxt}
                    >
                      {"Ecoute de l'interlocuteur..."}
                    </AppText>
                  </View>

                  <AppText
                    variant="bodySecondary"
                    tone="soft"
                    script="latin"
                    align="center"
                    style={styles.waitingSub}
                  >
                    La scene continue automatiquement.
                  </AppText>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: BG_DEEP,
    overflow: "hidden",
  },
  backgroundDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(5,5,8,0.54)",
  },

  body: {
    flex: 1,
  },

  topFixedSection: {
    paddingTop: 6,
  },

  topInner: {
    flexShrink: 0,
    width: "100%",
    alignSelf: "center",
  },

  interactionScroll: {
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

  stepLabel: {
    fontSize: 12,
  },

  videoContainer: {
    width: "88%",
    alignSelf: "center",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(10,13,26,0.96)",
    borderWidth: 1,
  },

  video: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
    height: "100%",
    transform: [{ scale: VIDEO_OVERSCAN_SCALE }],
  },

  videoFallback: {
    flex: 1,
    backgroundColor: "#0F1220",
    alignItems: "center",
    justifyContent: "center",
  },

  videoFallbackEmoji: {
    fontSize: 32,
  },

  videoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
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
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
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
    fontSize: 21,
    lineHeight: 31,
    marginBottom: 10,
  },

  aiFr: {
    fontSize: 14,
    lineHeight: 21,
  },

  interactionSection: {
    minHeight: 220,
    width: "100%",
    alignSelf: "center",
  },

  sectionTitle: {
    fontSize: 18,
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
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },

  choiceFr: {
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
    fontSize: 15,
  },

  waitingSub: {
    fontSize: 13,
  },

  endCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 18,
  },

  endTitle: {
    fontSize: 18,
    marginBottom: 6,
  },

  endSubtitle: {
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
    fontSize: 14,
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
    fontSize: 14,
  },
});
