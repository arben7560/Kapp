import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
import { CafeConversationSummaryModal } from "../../components/cafe/CafeConversationSummaryModal";
import { GuidedSpeechTurn } from "../../components/GuidedSpeechTurn";
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
import {
  cafeDialogueData,
  type DialogueChoice,
  type DialogueNode,
  type DialogueScenario,
} from "../../data/lesson/cafe/cafe";
import {
  DEFAULT_CAFE_MISSION_ID,
  getCafeMissionById,
  getCafeMissionScenario,
} from "../../data/lesson/cafe/cafeMissions";
import { useKoreanSpeechRecognition } from "../../hooks/useKoreanSpeechRecognition";
import { useImmersiveMediaStatus } from "../../hooks/useImmersiveMediaStatus";
import { useImmersiveVideoLifecycle } from "../../hooks/useImmersiveVideoLifecycle";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import {
  createCafeConversationMemory,
  markCafeSpeechNodeCorrected,
  recordCafeSpeechAttempt,
} from "../../lib/cafeConversationMemory";
import {
  CAFE_SPEECH_PILOT_MISSION_ID,
  getCafeSpeechAttemptPedagogy,
  getCafeSpeechContextualStrings,
  matchCafeSpeechIntent,
  recordCafeSpeechRecoveryEvent,
} from "../../lib/cafeSpeechIntents";
import {
  applyCafeOrderProductSelection,
  EMPTY_CAFE_ORDER_STATE,
  type CafeOrderState,
} from "../../lib/cafeOrderState";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import { buildProgressId } from "../../lib/progressIds";

// ==================== DESIGN SYSTEM ====================
const BG_DEEP = "#050508";
// Ancien background gradient : const BG_NAVY = "#0A0D1A";
const LINE = "rgba(255,255,255,0.08)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const PURPLE = "#A855F7";
const VIDEO_OVERSCAN_SCALE = 1;
const CAFE_STEPS = ["Accueil", "Choix", "Paiement", "Final"] as const;

// ==================== VIDEOS ====================
const welcomeCafeReal = require("../../assets/ai/cafe/welcomeCafeReal.mp4");
const orderConfirmationJuiceReal = require("../../assets/ai/cafe/orderConfirmationJuiceReal.mp4");
const orderConfirmationCakeReal = require("../../assets/ai/cafe/orderConfirmationCakeReal.mp4");
const pricePaimentChooseVideo = require("../../assets/ai/cafe/pricePaimentChoose.mp4");
const byCashReceiptReal = require("../../assets/ai/cafe/byCashReceiptReal.mp4");
const byCardReceiptReal = require("../../assets/ai/cafe/byCardReceiptReal.mp4");
const takeOutThanksReal = require("../../assets/ai/cafe/takeOutThanksReal.mp4");
const jingdonbelReal = require("../../assets/ai/cafe/jingdonbelReal.mp4");
const cafeIdleVideo = require("../../assets/ai/cafe/welcomeCafe.mp4");
const cafeBackground = require("../../assets/images/cafe.png");

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
    real_welcome: 0,

    ped_choice1: 1,
    ped_confirm: 1,
    ped_confirm_alt: 1,
    ped_choice2_drink: 1,
    ped_choice2_cake: 1,
    real_choice1: 1,
    real_confirm: 1,
    real_confirm_alt: 1,
    real_choice2_drink: 1,
    real_choice2_cake: 1,

    ped_payment_here: 2,
    ped_payment_takeout: 2,
    ped_choice3_here: 2,
    ped_choice3_takeout: 2,
    ped_receipt_card_here: 2,
    ped_receipt_cash_here: 2,
    ped_receipt_card_takeout: 2,
    ped_receipt_cash_takeout: 2,
    ped_receipt_choice_here: 2,
    ped_receipt_choice_takeout: 2,
    real_payment_here: 2,
    real_payment_takeout: 2,
    real_choice3_here: 2,
    real_choice3_takeout: 2,
    real_card_done_here: 2,
    real_cash_done_here: 2,
    real_card_done_takeout: 2,
    real_cash_done_takeout: 2,
    real_receipt_choice_here: 2,
    real_receipt_choice_takeout: 2,

    ped_bell: 3,
    ped_takeout_end: 3,
    real_here_end: 3,
    real_takeout_end: 3,
  };

  return progressByNodeId[nodeId] ?? 0;
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
    clonedNodes.real_payment_here.videoSources = [pricePaimentChooseVideo];

  if (clonedNodes.real_payment_takeout)
    clonedNodes.real_payment_takeout.videoSources = [pricePaimentChooseVideo];

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
  const { complete } = useStore();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout({ maxWidth: IMMERSIVE_CONTENT_MAX_WIDTH });
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const missionId =
    normalizeParam(params.mission as string | string[] | undefined) ??
    DEFAULT_CAFE_MISSION_ID;
  const currentMission =
    getCafeMissionById(missionId) ??
    getCafeMissionById(DEFAULT_CAFE_MISSION_ID);
  const isCafeSpeechPilot =
    mode === "guided" &&
    currentMission?.id === CAFE_SPEECH_PILOT_MISSION_ID;
  const { hasPremiumAccess, isLoading: isPaywallLoading } = usePaywall();
  const canEnterMission =
    currentMission?.access !== "premium" || hasPremiumAccess;

  const scrollRef = useRef<ScrollView>(null);
  const mountedRef = useRef(true);
  const iaAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedFromVideoRef = useRef(false);
  const hasReportedMissionCompleteRef = useRef(false);
  const loadedAvatarVideoSourceRef = useRef<number>(cafeIdleVideo);

  const [currentNodeId, setCurrentNodeId] = useState(
    cafeDialogueData.pedagogical.startNodeId,
  );
  const [orderState, setOrderState] = useState<CafeOrderState>(
    EMPTY_CAFE_ORDER_STATE,
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSceneEnded, setIsSceneEnded] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [showSpeechChoices, setShowSpeechChoices] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [speechUiNodeId, setSpeechUiNodeId] = useState<string | null>(null);
  const [pendingSpeechChoice, setPendingSpeechChoice] =
    useState<DialogueChoice | null>(null);
  const [conversationMemory, setConversationMemory] = useState(
    createCafeConversationMemory,
  );
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [lastIaTranscript, setLastIaTranscript] = useState<{
    korean: string;
    french?: string;
  } | null>(null);
  const currentScenario = useMemo(() => {
    const baseScenario =
      mode === "real" ? cafeDialogueData.real : cafeDialogueData.pedagogical;
    const missionScenario = currentMission
      ? getCafeMissionScenario(baseScenario, currentMission.scenarioKey)
      : baseScenario;

    return mode === "real"
      ? attachRealVideosToScenario(missionScenario)
      : missionScenario;
  }, [currentMission, mode]);

  const currentNode = currentScenario.nodes[currentNodeId] as
    | DialogueNodeWithVideo
    | undefined;

  const progressIndex = getProgressIndex(currentNodeId);

  const videoSources =
    currentNode?.videoSources ||
    (currentNode?.videoSource ? [currentNode.videoSource] : []);

  const currentVideoSource = videoSources.length > 0 ? videoSources[0] : null;
  const isAvatarSpeaking =
    currentNode?.type === "ia" && Boolean(currentVideoSource) && !isSceneEnded;
  const displayedVideoSource = isAvatarSpeaking
    ? currentVideoSource
    : cafeIdleVideo;
  const {
    status: mediaStatus,
    markReady: markMediaReady,
    markError: markMediaError,
  } = useImmersiveMediaStatus(displayedVideoSource);

  const player = useVideoPlayer(cafeIdleVideo, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.pause();
  });
  useImmersiveVideoLifecycle(
    player,
    isAvatarSpeaking && mediaStatus === "ready",
  );

  useEffect(() => {
    if (isPaywallLoading || canEnterMission) return;
    router.replace("/premium");
  }, [canEnterMission, isPaywallLoading]);

  const { width: avatarFrameWidth, height: avatarFrameHeight } =
    getImmersivePortraitMediaLayout({
      contentWidth: responsive.contentWidth,
      viewportHeight: responsive.height,
      maxHeight: 420,
    });
  const avatarVideoHeight = avatarFrameHeight;

  const goToNextNode = useCallback((node?: DialogueNodeWithVideo) => {
    if (!node || !mountedRef.current) return;

    if (node.type === "ia") {
      setLastIaTranscript({
        korean: node.korean || "...",
        french: node.french,
      });
    }

    if (node.nextNodeId) {
      setCurrentNodeId(node.nextNodeId);
    } else {
      setIsSceneEnded(true);
      setIsSummaryOpen(true);
    }
  }, []);

  useEffect(() => {
    setCurrentNodeId(currentScenario.startNodeId);
    setOrderState(EMPTY_CAFE_ORDER_STATE);
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setIsTranscriptOpen(false);
    setLastIaTranscript(null);
    setConversationMemory(createCafeConversationMemory());
    setIsSummaryOpen(false);
    hasAdvancedFromVideoRef.current = false;
    hasReportedMissionCompleteRef.current = false;
  }, [currentScenario]);

  useEffect(() => {
    if (!isSceneEnded || hasReportedMissionCompleteRef.current) return;

    hasReportedMissionCompleteRef.current = true;
    complete(buildProgressId("cafe", mode, missionId));
    void completeDailyActivity(
      isCafeSpeechPilot ? "voice_immersion" : "ai_mission",
    );
  }, [complete, isCafeSpeechPilot, isSceneEnded, missionId, mode]);

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

    let isCancelled = false;

    async function updateVideoSource() {
      const nextVideoSource = displayedVideoSource;

      try {
        if (!isAvatarSpeaking) player.pause();

        if (loadedAvatarVideoSourceRef.current !== nextVideoSource) {
          await player.replaceAsync(nextVideoSource);
          loadedAvatarVideoSourceRef.current = nextVideoSource;
        }

        if (isCancelled) return;

        markMediaReady(nextVideoSource);

        if (isAvatarSpeaking) {
          player.play();
        } else {
          player.currentTime = 0;
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
    displayedVideoSource,
    isAvatarSpeaking,
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

  const handleChoice = useCallback(
    (choice: DialogueChoice, transitionDelay = 320) => {
      if (isTransitioning || isSceneEnded) return;

      setIsTransitioning(true);
      setSelectedChoiceId(choice.id);
      setOrderState((state) =>
        applyCafeOrderProductSelection(state, choice),
      );

      setTimeout(() => {
        if (!mountedRef.current) return;
        setCurrentNodeId(choice.nextNodeId);
        setSelectedChoiceId(null);
        setIsTransitioning(false);
      }, transitionDelay);
    },
    [isSceneEnded, isTransitioning],
  );

  const isUserChoice = currentNode?.type === "user_choice";
  const speechChoices = useMemo(
    () => (isUserChoice ? currentNode.choices || [] : []),
    [currentNode, isUserChoice],
  );
  const speechContextualStrings = useMemo(
    () => getCafeSpeechContextualStrings(speechChoices),
    [speechChoices],
  );

  const handleSpeechTranscript = useCallback(
    (transcript: string) => {
      if (!isCafeSpeechPilot || currentNode?.type !== "user_choice") return;

      const result = matchCafeSpeechIntent(
        transcript,
        currentNode.choices || [],
      );

      setConversationMemory((memory) =>
        recordCafeSpeechAttempt(memory, {
          nodeId: currentNode.id,
          stepIndex: progressIndex,
          stepLabel: CAFE_STEPS[progressIndex] ?? "Conversation",
          recordedTranscript: transcript,
          result,
          intent: getCafeSpeechAttemptPedagogy(
            result,
            currentNode.choices || [],
            transcript,
          ),
        }),
      );

      if (result.reason === "matched") {
        if (result.recoveryEvent) {
          recordCafeSpeechRecoveryEvent(currentNode.id, result.recoveryEvent);
        }
        setSpeechUiNodeId(currentNode.id);
        setSpeechFeedback(result.feedback);
        setPendingSpeechChoice(null);
        handleChoice(result.choice, result.feedback ? 1800 : 320);
        return;
      }

      setSpeechUiNodeId(currentNode.id);
      setSpeechFeedback(result.feedback);
      setPendingSpeechChoice(
        result.reason === "uncertain" || result.reason === "word-order-error"
          ? result.choice
          : null,
      );
    },
    [currentNode, handleChoice, isCafeSpeechPilot, progressIndex],
  );

  const {
    state: speechState,
    startListening,
    stopListening,
    cancel: cancelSpeechRecognition,
  } = useKoreanSpeechRecognition({
    onFinalTranscript: handleSpeechTranscript,
  });

  useEffect(() => {
    cancelSpeechRecognition();
  }, [cancelSpeechRecognition, currentNodeId, currentScenario]);

  useFocusEffect(
    useCallback(() => {
      return () => cancelSpeechRecognition();
    }, [cancelSpeechRecognition]),
  );

  const handleStartSpeech = useCallback(() => {
    setSpeechUiNodeId(currentNodeId);
    setShowSpeechChoices(false);
    setSpeechFeedback(null);
    setPendingSpeechChoice(null);
    void startListening({ contextualStrings: speechContextualStrings });
  }, [currentNodeId, speechContextualStrings, startListening]);

  const handleNeedHelp = useCallback(() => {
    cancelSpeechRecognition();
    setSpeechUiNodeId(currentNodeId);
    setShowSpeechChoices(true);
    setPendingSpeechChoice(null);
  }, [cancelSpeechRecognition, currentNodeId]);

  const handleConfirmSpeechIntent = useCallback(() => {
    if (!pendingSpeechChoice || speechUiNodeId !== currentNodeId) return;

    const confirmedChoice = pendingSpeechChoice;
    setConversationMemory((memory) => {
      const latestAttempt = [...memory.attempts]
        .reverse()
        .find(({ nodeId }) => nodeId === currentNodeId);
      return latestAttempt
        ? markCafeSpeechNodeCorrected(
            memory,
            currentNodeId,
            latestAttempt.id,
          )
        : memory;
    });
    setSpeechFeedback(null);
    setPendingSpeechChoice(null);
    handleChoice(confirmedChoice);
  }, [currentNodeId, handleChoice, pendingSpeechChoice, speechUiNodeId]);

  const handleRestart = () => {
    cancelSpeechRecognition();
    setCurrentNodeId(currentScenario.startNodeId);
    setOrderState(EMPTY_CAFE_ORDER_STATE);
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setIsTranscriptOpen(false);
    setLastIaTranscript(null);
    setPendingSpeechChoice(null);
    setConversationMemory(createCafeConversationMemory());
    setIsSummaryOpen(false);
    hasAdvancedFromVideoRef.current = false;
    hasReportedMissionCompleteRef.current = false;
  };

  const handleExit = useCallback(() => {
    cancelSpeechRecognition();
    router.back();
  }, [cancelSpeechRecognition]);

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

  const shouldShowPremiumSuggestion =
    currentMission?.access === "free" && (!hasPremiumAccess || __DEV__);
  const speechUiMatchesCurrentNode = speechUiNodeId === currentNodeId;
  const displayedSpeechFeedback = speechUiMatchesCurrentNode
    ? speechFeedback
    : null;
  const displayedConfirmationLabel =
    speechUiMatchesCurrentNode && pendingSpeechChoice
      ? pendingSpeechChoice.label
          .replace(/[.!?]+$/u, "")
          .toLocaleLowerCase("fr-FR")
      : null;
  const shouldShowSpeechChoices =
    speechUiMatchesCurrentNode && showSpeechChoices;

  const currentChoicesGrid = isUserChoice ? (
    <View style={styles.choicesGrid}>
      {currentNode.choices?.map((choice) => {
        const isSelected =
          selectedChoiceId === choice.id ||
          (isTransitioning && orderState.product === choice.orderProduct);
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
  ) : null;

  if (!isPaywallLoading && !canEnterMission) {
    return null;
  }

  return (
    <ImageBackground
      source={cafeBackground}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitter la scène"
            hitSlop={8}
            onPress={handleExit}
            style={styles.backBtn}
          >
            <AppText
              variant="button"
              tone="strong"
              script="latin"
              style={styles.backTxt}
            >
              ✕
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
                steps={CAFE_STEPS}
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
                  accessible
                  accessibilityRole="image"
                  accessibilityLabel="Vidéo de l’interlocutrice du café"
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
                    variant="bodySecondary"
                    tone="muted"
                    script="latin"
                    style={styles.endSubtitle}
                  >
                    Tu peux rejouer cette scène ou revenir aux missions.
                  </AppText>

                  <AppText
                    variant="bodySecondary"
                    tone="muted"
                    script="latin"
                    style={styles.endSubtitle}
                  >
                    Série conservée.
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
                      onPress={handleExit}
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

                  {shouldShowPremiumSuggestion ? (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel="Découvrir Premium"
                      hitSlop={6}
                      onPress={() => router.push("/premium")}
                      style={({ pressed }) => [
                        styles.endPremiumLink,
                        { opacity: pressed ? 0.82 : 1 },
                      ]}
                    >
                      <AppText
                        variant="button"
                        tone="premium"
                        script="latin"
                        align="center"
                        style={styles.endPremiumLinkText}
                      >
                        Découvrir Premium
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
              ) : isUserChoice ? (
                isCafeSpeechPilot ? (
                  <GuidedSpeechTurn
                    accent={PURPLE}
                    confirmationLabel={displayedConfirmationLabel}
                    feedback={displayedSpeechFeedback}
                    intentionLabels={speechChoices.map(
                      (choice) => choice.label,
                    )}
                    onConfirm={handleConfirmSpeechIntent}
                    onHelp={handleNeedHelp}
                    onRetry={handleStartSpeech}
                    onStart={handleStartSpeech}
                    onStop={stopListening}
                    showChoices={shouldShowSpeechChoices}
                    speechState={speechState}
                  >
                    {currentChoicesGrid}
                  </GuidedSpeechTurn>
                ) : (
                  currentChoicesGrid
                )
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
                      Écoute de l’interlocuteur...
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
      {isCafeSpeechPilot ? (
        <CafeConversationSummaryModal
          memory={conversationMemory}
          visible={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          onFinish={handleExit}
        />
      ) : null}
      {/*
        Fermeture du background précédent :
        </LinearGradient>
      */}
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

  aiCardCompact: {
    marginTop: -20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
  },

  aiIntroText: {
    marginBottom: 0,
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

  endPremiumLink: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.28)",
    backgroundColor: "rgba(253,224,71,0.08)",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  endPremiumLinkText: {
  },
});
