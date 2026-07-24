import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { ImmersiveMediaStatusOverlay } from "../../components/immersion/ImmersiveMediaStatusOverlay";
import { ImmersiveStepProgress } from "../../components/immersion/ImmersiveStepProgress";
import {
  getImmersiveBottomPadding,
  getImmersivePortraitMediaLayout,
  IMMERSIVE_CONTENT_MAX_WIDTH,
  IMMERSIVE_MIN_TOUCH_TARGET,
  IMMERSIVE_VIDEO_VIEW_PROPS,
} from "../../constants/immersive-layout";
import { ABSOLUTE_FILL } from "../../constants/layout";
import { aeroportDialogueData } from "../../data/lesson/aeroport/aeroport";
import {
  applyAeroportMissionToScenario,
  DEFAULT_AEROPORT_MISSION_ID,
  getAeroportMissionById,
} from "../../data/lesson/aeroport/aeroportMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useImmersiveMediaStatus } from "../../hooks/useImmersiveMediaStatus";
import { useImmersiveVideoLifecycle } from "../../hooks/useImmersiveVideoLifecycle";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import { buildProgressId } from "../../lib/progressIds";

// ==================== DESIGN SYSTEM ====================
const BG_DEEP = "#050508";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const PURPLE = "#A855F7";
const VIDEO_OVERSCAN_SCALE = 1.06;

const AEROPORT_MISSION_PHRASES: Record<
  string,
  Readonly<{ korean: string; french: string }>
> = {
  "go-seoul-station": {
    korean: "실례합니다, 서울역까지 어떻게 가요?",
    french: "Excusez-moi, comment aller à Seoul Station ?",
  },
  "buy-tmoney": {
    korean: "티머니 카드를 사고 싶어요.",
    french: "Je voudrais acheter une carte T-money.",
  },
  "choose-arex": {
    korean: "어느 열차를 타는 게 좋을까요?",
    french: "Quel train me conseillez-vous ?",
  },
  "find-platform": {
    korean: "플랫폼은 어디예요?",
    french: "Où se trouve le quai ?",
  },
  "lost-help": {
    korean: "길을 잃으면 어떻게 해요?",
    french: "Que faire si je me perds ?",
  },
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
const airportBackground = require("../../assets/images/airport.jpg");

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
  const progressByNodeId: Record<string, number> = {
    user_start: 0,
    ia_welcome: 0,
    user_after_welcome: 0,
    ia_welcome_repeat: 0,

    ia_tmoney: 1,
    user_after_tmoney: 1,
    ia_tmoney_repeat: 1,
    ia_tmoney_charge: 1,
    user_after_tmoney_charge: 1,
    ia_tmoney_charge_repeat: 1,
    ia_tmoney_arex: 1,
    user_after_tmoney_arex: 1,
    ia_tmoney_arex_repeat: 1,

    ia_transport: 2,
    user_after_transport: 2,
    ia_transport_repeat: 2,
    ia_recommend: 2,
    user_after_recommend: 2,
    ia_recommend_repeat: 2,
    ia_platform: 2,
    user_after_platform: 2,
    ia_platform_repeat: 2,
    ia_verify_train: 2,
    user_after_verify_train: 2,
    ia_verify_train_repeat: 2,
    ia_time: 2,
    user_after_time: 2,
    ia_time_repeat: 2,

    ia_lost: 3,
    user_after_lost: 3,
    ia_lost_repeat: 3,
    ia_summary: 3,
    user_after_summary: 3,
    ia_summary_short: 3,
    user_after_summary_short: 3,
    ia_end: 3,
  };

  return progressByNodeId[nodeId] ?? 0;
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
  const responsive = useResponsiveLayout({ maxWidth: IMMERSIVE_CONTENT_MAX_WIDTH });
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const missionId =
    normalizeParam(params.mission as string | string[] | undefined) ??
    DEFAULT_AEROPORT_MISSION_ID;
  const currentMission =
    getAeroportMissionById(missionId) ??
    getAeroportMissionById(DEFAULT_AEROPORT_MISSION_ID);
  const missionPhrase =
    AEROPORT_MISSION_PHRASES[currentMission?.id ?? ""] ??
    AEROPORT_MISSION_PHRASES[DEFAULT_AEROPORT_MISSION_ID];
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

  const currentNode = currentScenario.nodes[currentNodeId];

  const progressIndex = Math.max(
    maxProgressIndex,
    getProgressIndex(currentNodeId),
  );
  const steps = ["Accueil", "T-money", "Trajet", "Final"];

  const videoSources =
    currentNode?.videoSources ||
    (currentNode?.videoSource ? [currentNode.videoSource] : []);

  const currentVideoSource = videoSources.length > 0 ? videoSources[0] : null;

  const player = useVideoPlayer(null, (playerInstance) => {
    playerInstance.loop = false;
  });
  const {
    status: mediaStatus,
    markReady: markMediaReady,
    markError: markMediaError,
  } = useImmersiveMediaStatus(displayedVideoSource);
  useImmersiveVideoLifecycle(
    player,
    currentNode?.type === "ia" &&
      Boolean(currentVideoSource) &&
      mediaStatus === "ready",
  );

  useEffect(() => {
    if (isPaywallLoading || canEnterMission) return;
    router.replace("/premium");
  }, [canEnterMission, isPaywallLoading]);

  const { width: avatarFrameWidth, height: avatarFrameHeight } =
    getImmersivePortraitMediaLayout({
      contentWidth: responsive.contentWidth,
      viewportHeight: responsive.height,
    });
  const avatarVideoHeight = avatarFrameHeight;

  const goToNextNode = useCallback((node?: DialogueNode) => {
    if (!node || !mountedRef.current) return;

    if (node.type === "ia") {
      setLastIaTranscript({
        korean: node.korean || "...",
        french: node.french,
      });
    }

    const nextNodeId = node.nextNodeId;

    if (nextNodeId) {
      setIsTranscriptOpen(false);
      setMaxProgressIndex((current) =>
        Math.max(current, getProgressIndex(nextNodeId)),
      );
      setCurrentNodeId(nextNodeId);
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
      const nextVideoSource = displayedVideoSource;

      try {
        await player.replaceAsync(nextVideoSource);

        if (isCancelled) return;

        markMediaReady(nextVideoSource);

        if (currentNode?.type === "ia" && currentVideoSource) {
          player.play();
        } else {
          player.pause();
        }
      } catch {
        if (!isCancelled) {
          player.pause();
          markMediaError(nextVideoSource);
        }
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
    markMediaError,
    markMediaReady,
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
    if (currentVideoSource && mediaStatus !== "error") return;
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
    mediaStatus,
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitter la scène"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <AppText
              variant="button"
              tone="strong"
              script="latin"
              style={styles.backTxt}
            >
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
              <ImmersiveStepProgress
                steps={steps}
                activeIndex={progressIndex}
                accent={mode === "real" ? CYAN : PURPLE}
              />

              <View
                style={[
                  styles.videoContainer,
                  {
                    width: avatarFrameWidth,
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

                <VideoView
                  player={player}
                  style={[styles.video, { height: avatarVideoHeight }]}
                  {...IMMERSIVE_VIDEO_VIEW_PROPS}
                />

                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(10,13,26,0.32)",
                    "rgba(10,13,26,0.50)",
                  ]}
                  locations={[0, 0.62, 1]}
                  style={styles.videoOverlay}
                />
                <ImmersiveMediaStatusOverlay status={mediaStatus} />
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
                <AppText
                  variant="koreanSecondary"
                  tone="strong"
                  script="korean"
                  accessibilityLanguage="ko-KR"
                  align="center"
                  style={[
                    styles.aiKr,
                    isStartChoiceNode && styles.aiIntroText,
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
              { paddingBottom: getImmersiveBottomPadding(insets.bottom) },
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
                Ta réponse
              </AppText>

              {isSceneEnded ? (
                <View style={styles.endCard}>
                  <AppText
                    variant="sectionTitle"
                    tone="strong"
                    script="latin"
                    style={styles.endTitle}
                  >
                    Mission terminée
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="muted"
                    script="latin"
                    style={styles.endSubtitle}
                  >
                    Phrase à retenir
                  </AppText>

                  <AppText
                    variant="koreanSecondary"
                    tone="strong"
                    script="korean"
                    accessibilityLanguage="ko-KR"
                    style={styles.endSubtitle}
                  >
                    {missionPhrase.korean}
                  </AppText>

                  <AppText
                    variant="bodySecondary"
                    tone="muted"
                    script="latin"
                    style={styles.endSubtitle}
                  >
                    {missionPhrase.french}
                  </AppText>

                  <View style={styles.endActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Rejouer la scène"
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
                          Rejouer la scène
                        </AppText>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Retour aux missions"
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
                        Retour aux missions
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
                      Écoute de l&apos;interlocuteur...
                    </AppText>
                  </View>

                  <AppText
                    variant="bodySecondary"
                    tone="soft"
                    script="latin"
                    align="center"
                    style={styles.waitingSub}
                  >
                    La scène continue automatiquement.
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

// ==================== STYLES ====================
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: BG_DEEP,
    overflow: "hidden",
  },
  backgroundDarkOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(5,5,8,0.74)",
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
    width: IMMERSIVE_MIN_TOUCH_TARGET,
    height: IMMERSIVE_MIN_TOUCH_TARGET,
    borderRadius: IMMERSIVE_MIN_TOUCH_TARGET / 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  backTxt: {
  },

  aiIntroText: {
    marginBottom: 0,
  },

  videoContainer: {
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
    marginBottom: 4,
  },

  transcriptHint: {
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
    marginBottom: 10,
  },

  aiFr: {
  },

  interactionSection: {
    minHeight: 220,
    width: "100%",
    alignSelf: "center",
  },

  sectionTitle: {
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
    marginBottom: 6,
  },

  choiceFr: {
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
  },

  waitingSub: {
  },

  endCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 18,
  },

  endTitle: {
    marginBottom: 6,
  },

  endSubtitle: {
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
  },
});
