import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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

import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { GuidedSpeechTurn } from "../../components/GuidedSpeechTurn";
import { MetroConversationSummaryModal } from "../../components/metro/MetroConversationSummaryModal";
import { ABSOLUTE_FILL } from "../../constants/layout";
import { metroLessons } from "../../data/lesson/metro/metro";
import {
  DEFAULT_METRO_MISSION_ID,
  getMetroMissionById,
  getMetroMissionLesson,
} from "../../data/lesson/metro/metroMissions";
import { useKoreanSpeechRecognition } from "../../hooks/useKoreanSpeechRecognition";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { completeDailyActivity } from "../../lib/dailyStreak";
import {
  createMetroConversationMemory,
  recordMetroAudioReplay,
  recordMetroHelpRequest,
  recordMetroSpeechAttempt,
} from "../../lib/metroConversationMemory";
import { usePaywall } from "../../lib/paywall/PaywallProvider";
import { buildProgressId } from "../../lib/progressIds";
import {
  getMetroSpeechContextualStrings,
  matchMetroSpeechIntent,
  METRO_SPEECH_PILOT_MISSION_ID,
} from "../../lib/metroSpeechIntents";

// ==================== DESIGN SYSTEM ====================
const BG_DEEP = "#050508";
// Ancien background gradient : const BG_NAVY = "#0A0D1A";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const PURPLE = "#A855F7";
const VIDEO_OVERSCAN_SCALE = 1;

// ==================== VIDEOS ====================
const iaTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_transfer_info.mp4");
const iaRepeatTransferInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info.mp4");
const iaRepeatTransferInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_transfer_info_short.mp4");

const iaExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_info.mp4");
const iaRepeatExitInfo = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info.mp4");
const iaRepeatExitInfoShort = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_info_short.mp4");

const iaEnd = require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4");
const metroBackground = require("../../assets/images/metrobg.png");

type VideoMap = Record<string, number>;

const hongikToGangnamVideos: VideoMap = {
  ia_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_intro_route.mp4"),
  ia_repeat_intro_route: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_intro_route.mp4"),

  ia_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4"),
  ia_repeat_platform_direction: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4"),

  ia_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_trip_time.mp4"),
  ia_repeat_trip_time: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_trip_time.mp4"),

  ia_transfer_info: iaTransferInfo,
  ia_repeat_transfer_info: iaRepeatTransferInfo,
  ia_repeat_transfer_info_short: iaRepeatTransferInfoShort,

  ia_exit_info: iaExitInfo,
  ia_repeat_exit_info: iaRepeatExitInfo,
  ia_repeat_exit_info_short: iaRepeatExitInfoShort,

  ia_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_exit_landmark_info.mp4"),
  ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_exit_landmark_info.mp4"),

  ia_end_summary: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary.mp4"),
  ia_end_summary_short: require("../../assets/ai/metro/Hongik-to-Gangnam/ia_end_summary_short.mp4"),
  ia_end: iaEnd,
};

const myeongdongToItaewonVideos: VideoMap = {
  ia_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_info_route.mp4"),
  ia_repeat_intro_route: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_intro_route.mp4"),

  ia_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line4_direction.mp4"),
  ia_repeat_line4_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line4_direction.mp4"),

  ia_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_station.mp4"),
  ia_repeat_transfer_station: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_station.mp4"),

  ia_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_line6_direction.mp4"),
  ia_repeat_line6_direction: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_line6_direction.mp4"),

  ia_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_trip_time.mp4"),
  ia_repeat_trip_time: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_trip_time.mp4"),

  ia_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_station_count.mp4"),
  ia_repeat_station_count: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_station_count.mp4"),

  ia_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_info.mp4"),
  ia_repeat_exit_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_info.mp4"),

  ia_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_exit_landmark_info.mp4"),
  ia_repeat_exit_landmark_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_exit_landmark_info.mp4"),

  ia_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_transfer_count_info.mp4"),
  ia_repeat_transfer_count_info: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_repeat_transfer_count_info.mp4"),

  ia_end_summary: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary.mp4"),
  ia_end_summary_short: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end_summary_short.mp4"),
  ia_end: require("../../assets/ai/metro/Myeongdong-To-Itaewon/ia_end.mp4"),
};

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

function normalizeParam(rawValue: string | string[] | undefined) {
  return Array.isArray(rawValue) ? rawValue[0] : rawValue;
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

function getMetroVideosForLesson(lessonId: string): VideoMap {
  if (lessonId === "myeongdong_to_itaewon") {
    return myeongdongToItaewonVideos;
  }

  if (lessonId === "hongik_to_gangnam") {
    return hongikToGangnamVideos;
  }

  return {};
}

function getMetroIntroVideoSource(lessonId: string): number | null {
  return getMetroVideosForLesson(lessonId).ia_intro_route ?? null;
}

function getScenarioInitialVideoSource(scenario: DialogueScenario) {
  const intro = getMetroIntroVideoSource(scenario.id);
  if (intro) return intro;

  for (const node of Object.values(scenario.nodes)) {
    const source = node.videoSources?.[0] ?? node.videoSource;
    if (source) return source;
  }

  return null;
}

function attachMetroVideosToNode(
  nodeId: string,
  lessonId: string,
): number[] | undefined {
  const prefixedVideo = getPrefixedMetroVideoSource(nodeId);
  if (prefixedVideo) {
    return [prefixedVideo];
  }

  const videos = getMetroVideosForLesson(lessonId);

  return videos[nodeId] ? [videos[nodeId]] : undefined;
}

function getPrefixedMetroVideoSource(nodeId: string): number | undefined {
  const prefixVideoMaps: { prefix: string; videos: VideoMap }[] = [
    { prefix: "ask_exit_hongik_", videos: hongikToGangnamVideos },
    { prefix: "ask_time_hongik_", videos: hongikToGangnamVideos },
    { prefix: "ask_direction_hongik_", videos: hongikToGangnamVideos },
    { prefix: "ask_exit_myeongdong_", videos: myeongdongToItaewonVideos },
    { prefix: "ask_transfer_myeongdong_", videos: myeongdongToItaewonVideos },
    { prefix: "ask_time_myeongdong_", videos: myeongdongToItaewonVideos },
    { prefix: "ask_direction_myeongdong_", videos: myeongdongToItaewonVideos },
  ];

  for (const item of prefixVideoMaps) {
    if (nodeId.startsWith(item.prefix)) {
      return item.videos[nodeId.slice(item.prefix.length)];
    }
  }

  return undefined;
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
      videoSources: attachMetroVideosToNode(step.id, lesson.id),
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
  const { complete } = useStore();

  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const responsive = useResponsiveLayout({ maxWidth: 760 });
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const missionId =
    normalizeParam(params.mission as string | string[] | undefined) ??
    DEFAULT_METRO_MISSION_ID;
  const currentMission =
    getMetroMissionById(missionId) ??
    getMetroMissionById(DEFAULT_METRO_MISSION_ID);
  const isMetroSpeechPilot =
    mode === "guided" &&
    currentMission?.id === METRO_SPEECH_PILOT_MISSION_ID;
  const { hasPremiumAccess, isLoading: isPaywallLoading } = usePaywall();
  const canEnterMission =
    currentMission?.access !== "premium" || hasPremiumAccess;

  const scrollRef = useRef<ScrollView>(null);
  const mountedRef = useRef(true);
  const iaAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedFromVideoRef = useRef(false);
  const hasReportedMissionCompleteRef = useRef(false);
  const speechAttemptCountRef = useRef<Record<string, number>>({});

  const metroScenario = useMemo(() => {
    const lesson =
      getMetroMissionLesson(currentMission) ??
      metroLessons.find((item) => item.id === "hongik_to_gangnam") ??
      metroLessons[0];

    return buildMetroScenario(lesson as MetroLesson);
  }, [currentMission]);

  const initialVideoSource = useMemo(
    () => getScenarioInitialVideoSource(metroScenario),
    [metroScenario],
  );
  const loadedVideoSourceRef = useRef<number | null>(initialVideoSource);
  const videoLoadRef = useRef<{
    source: number;
    promise: Promise<void>;
  } | null>(null);

  const [displayedVideoSource, setDisplayedVideoSource] = useState<
    number | null
  >(() => initialVideoSource);

  const [currentNodeId, setCurrentNodeId] = useState(metroScenario.startNodeId);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSceneEnded, setIsSceneEnded] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [showSpeechChoices, setShowSpeechChoices] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [speechUiNodeId, setSpeechUiNodeId] = useState<string | null>(null);
  const [pendingSpeechChoice, setPendingSpeechChoice] =
    useState<DialogueChoice | null>(null);
  const [lastIaVideoSource, setLastIaVideoSource] = useState<number | null>(null);
  const [isReplayingLastIa, setIsReplayingLastIa] = useState(false);
  const [conversationMemory, setConversationMemory] = useState(
    createMetroConversationMemory,
  );
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

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
  const isAvatarSpeaking =
    currentNode?.type === "ia" && Boolean(currentVideoSource) && !isSceneEnded;

  const player = useVideoPlayer(initialVideoSource, (playerInstance) => {
    playerInstance.loop = false;
  });

  useEffect(() => {
    if (isPaywallLoading || canEnterMission) return;
    router.replace("/premium");
  }, [canEnterMission, isPaywallLoading]);

  const avatarVideoHeight = Math.min(
    responsive.contentWidth * 1.2,
    screenWidth * 1,
    screenHeight * 1,
    420,
  );

  const avatarFrameHeight = avatarVideoHeight;
  const avatarFrameWidth = Math.min(
    responsive.contentWidth * 0.88,
    avatarVideoHeight * 0.8,
  );

  const goToNextNode = useCallback((node?: DialogueNode) => {
    if (!node || !mountedRef.current) return;

    if (node.type === "ia") {
      const source = node.videoSources?.[0] ?? node.videoSource ?? null;
      if (source) setLastIaVideoSource(source);
    }

    if (node.nextNodeId) {
      const nextNode = currentScenario.nodes[node.nextNodeId];
      const nextVideo =
        nextNode?.videoSources?.[0] ?? nextNode?.videoSource ?? null;
      if (nextVideo) setDisplayedVideoSource(nextVideo);
      setCurrentNodeId(node.nextNodeId);
    } else {
      setIsSceneEnded(true);
      if (isMetroSpeechPilot) setIsSummaryOpen(true);
    }
  }, [currentScenario, isMetroSpeechPilot]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Route parameters select a new mission and require one atomic local reset.
    setCurrentNodeId(currentScenario.startNodeId);
    setDisplayedVideoSource(getScenarioInitialVideoSource(currentScenario));
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setShowSpeechChoices(false);
    setSpeechFeedback(null);
    setSpeechUiNodeId(null);
    setPendingSpeechChoice(null);
    setLastIaVideoSource(null);
    setIsReplayingLastIa(false);
    setConversationMemory(createMetroConversationMemory());
    setIsSummaryOpen(false);
    speechAttemptCountRef.current = {};
    hasAdvancedFromVideoRef.current = false;
    hasReportedMissionCompleteRef.current = false;
  }, [currentScenario]);

  useEffect(() => {
    if (!isSceneEnded || hasReportedMissionCompleteRef.current) return;

    hasReportedMissionCompleteRef.current = true;
    complete(buildProgressId("metro", mode, missionId));
    void completeDailyActivity("ai_mission");
  }, [complete, isSceneEnded, missionId, mode]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Node-scoped transcript and speech UI must not leak into the next turn.
    setIsTranscriptOpen(false);
    setShowSpeechChoices(false);
    setSpeechFeedback(null);
    setSpeechUiNodeId(null);
    setPendingSpeechChoice(null);
    setIsReplayingLastIa(false);

    if (iaAutoTimerRef.current) {
      clearTimeout(iaAutoTimerRef.current);
      iaAutoTimerRef.current = null;
    }
  }, [currentNodeId]);

  /* eslint-disable react-hooks/immutability -- expo-video exposes an imperative player handle by design. */
  useEffect(() => {
    if (!canEnterMission) return;

    let isCancelled = false;

    async function updateVideoSource() {
      try {
        if (!displayedVideoSource) {
          player.pause();
          return;
        }

        player.pause();

        if (loadedVideoSourceRef.current !== displayedVideoSource) {
          if (videoLoadRef.current?.source !== displayedVideoSource) {
            const source = displayedVideoSource;
            const promise = player.replaceAsync(source).then(() => {
              loadedVideoSourceRef.current = source;
            });
            videoLoadRef.current = { source, promise };
            const clearPendingLoad = () => {
              if (videoLoadRef.current?.promise === promise) {
                videoLoadRef.current = null;
              }
            };
            void promise.then(clearPendingLoad, clearPendingLoad);
          }

          await videoLoadRef.current.promise;
        }

        if (isCancelled) return;

        if (isAvatarSpeaking || isReplayingLastIa) {
          player.currentTime = 0;
          player.play();
        } else {
          if (player.currentTime <= 0.01) player.currentTime = 0.12;
        }
      } catch {
        if (!isCancelled) player.pause();
      }
    }

    void updateVideoSource();

    return () => {
      isCancelled = true;
    };
  }, [
    displayedVideoSource,
    isAvatarSpeaking,
    isReplayingLastIa,
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
        player.pause();
        player.currentTime = Math.max(0, duration - 0.08);
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
    if (!isReplayingLastIa) return;

    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      const duration = player.duration ?? 0;
      if (duration <= 0 || player.currentTime < duration - 0.08) return;

      player.pause();
      player.currentTime = Math.max(0, duration - 0.08);
      setIsReplayingLastIa(false);
    }, 120);

    return () => clearInterval(interval);
  }, [isReplayingLastIa, player]);
  /* eslint-enable react-hooks/immutability */

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

  const handleChoice = useCallback((choice: DialogueChoice, delay = 320) => {
    if (isTransitioning || isSceneEnded || isReplayingLastIa) return;

    setIsTransitioning(true);
    setSelectedChoiceId(choice.id);

    setTimeout(() => {
      if (!mountedRef.current) return;

      const nextNode = currentScenario.nodes[choice.nextNodeId];
      const nextVideo =
        nextNode?.videoSources?.[0] ?? nextNode?.videoSource ?? null;
      if (nextVideo) setDisplayedVideoSource(nextVideo);
      setCurrentNodeId(choice.nextNodeId);
      setSelectedChoiceId(null);
      setIsTransitioning(false);
    }, delay);
  }, [currentScenario, isReplayingLastIa, isSceneEnded, isTransitioning]);

  const isUserChoice = currentNode?.type === "user_choice";
  const speechChoices = useMemo(
    () => (isUserChoice ? currentNode.choices || [] : []),
    [currentNode, isUserChoice],
  );
  const speechContextualStrings = useMemo(
    () => getMetroSpeechContextualStrings(speechChoices),
    [speechChoices],
  );

  const handleSpeechTranscript = useCallback(
    (transcript: string) => {
      if (!isMetroSpeechPilot || currentNode?.type !== "user_choice") return;

      const attemptNumber =
        (speechAttemptCountRef.current[currentNode.id] ?? 0) + 1;
      speechAttemptCountRef.current[currentNode.id] = attemptNumber;
      const result = matchMetroSpeechIntent(
        transcript,
        currentNode.choices || [],
        attemptNumber,
      );

      setConversationMemory((memory) =>
        recordMetroSpeechAttempt(memory, {
          nodeId: currentNode.id,
          transcript,
          result,
        }),
      );

      setSpeechUiNodeId(currentNode.id);
      setSpeechFeedback(result.feedback);

      if (result.reason === "matched" && result.choice) {
        setPendingSpeechChoice(null);
        handleChoice(result.choice, result.feedback ? 1750 : 320);
        return;
      }

      setPendingSpeechChoice(
        result.reason === "uncertain" ? result.choice : null,
      );
    },
    [currentNode, handleChoice, isMetroSpeechPilot],
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
    if (
      !isMetroSpeechPilot ||
      currentNode?.type !== "user_choice" ||
      isTransitioning ||
      isReplayingLastIa
    ) {
      return;
    }

    setSpeechUiNodeId(currentNodeId);
    setShowSpeechChoices(false);
    setSpeechFeedback(null);
    setPendingSpeechChoice(null);
    void startListening({ contextualStrings: speechContextualStrings });
  }, [
    currentNode,
    currentNodeId,
    isMetroSpeechPilot,
    isReplayingLastIa,
    isTransitioning,
    speechContextualStrings,
    startListening,
  ]);

  const handleNeedHelp = useCallback(() => {
    cancelSpeechRecognition();
    setSpeechUiNodeId(currentNodeId);
    setShowSpeechChoices(true);
    setPendingSpeechChoice(null);
    setConversationMemory(recordMetroHelpRequest);
  }, [cancelSpeechRecognition, currentNodeId]);

  const handleConfirmSpeechIntent = useCallback(() => {
    if (!pendingSpeechChoice || speechUiNodeId !== currentNodeId) return;

    const confirmedChoice = pendingSpeechChoice;
    setSpeechFeedback(null);
    setPendingSpeechChoice(null);
    handleChoice(confirmedChoice);
  }, [currentNodeId, handleChoice, pendingSpeechChoice, speechUiNodeId]);

  const handleReplayLastIa = useCallback(() => {
    if (!lastIaVideoSource || currentNode?.type !== "user_choice") return;

    cancelSpeechRecognition();
    setDisplayedVideoSource(lastIaVideoSource);
    setIsReplayingLastIa(true);
    setConversationMemory(recordMetroAudioReplay);
  }, [cancelSpeechRecognition, currentNode, lastIaVideoSource]);

  const handleRestart = () => {
    cancelSpeechRecognition();
    setCurrentNodeId(currentScenario.startNodeId);
    setDisplayedVideoSource(getScenarioInitialVideoSource(currentScenario));
    setSelectedChoiceId(null);
    setIsTransitioning(false);
    setIsSceneEnded(false);
    setShowSpeechChoices(false);
    setSpeechFeedback(null);
    setSpeechUiNodeId(null);
    setPendingSpeechChoice(null);
    setLastIaVideoSource(null);
    setIsReplayingLastIa(false);
    setConversationMemory(createMetroConversationMemory());
    setIsSummaryOpen(false);
    speechAttemptCountRef.current = {};
    hasAdvancedFromVideoRef.current = false;
    hasReportedMissionCompleteRef.current = false;
  };

  const handleExit = useCallback(() => {
    cancelSpeechRecognition();
    router.back();
  }, [cancelSpeechRecognition]);

  const isStartChoiceNode = currentNodeId === "start";

  const isReviewableTranscript =
    currentNode?.type === "user_choice" && !isStartChoiceNode;

  const shouldCollapseTranscript = isReviewableTranscript && !isTranscriptOpen;

  const displayedKoreanText = shouldCollapseTranscript
    ? "..."
    : currentNode?.korean || "...";

  const shouldShowFrench =
    !shouldCollapseTranscript && !isStartChoiceNode && !!currentNode?.french;
  const displayedSpeechFeedback =
    speechUiNodeId === currentNodeId ? speechFeedback : null;
  const displayedConfirmationLabel =
    speechUiNodeId === currentNodeId && pendingSpeechChoice
      ? "la direction vers Gangnam"
      : null;
  const shouldShowSpeechChoices =
    showSpeechChoices ||
    speechState.status === "permission-denied" ||
    speechState.status === "unavailable";
  const currentChoicesGrid = (
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
  );

  if (!isPaywallLoading && !canEnterMission) {
    return null;
  }

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
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
                    width: avatarFrameWidth,
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
                  accessibilityLabel="Video de l'interlocuteur metro"
                  player={player}
                  style={[styles.video, { height: avatarVideoHeight }]}
                  contentFit="cover"
                  surfaceType="textureView"
                  useExoShutter={false}
                  nativeControls={false}
                  allowsPictureInPicture={false}
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
                    {currentNode?.french}
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
                    Scène terminée
                  </AppText>

                  <AppText
                    variant="bodySecondary"
                    tone="muted"
                    script="latin"
                    style={styles.endSubtitle}
                  >
                    Tu peux rejouer cette scène ou revenir au menu.
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
                        Retour
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              ) : isUserChoice ? (
                isMetroSpeechPilot ? (
                  <View style={styles.speechTurnBlock}>
                    {lastIaVideoSource ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Réécouter la dernière intervention"
                        accessibilityState={{ disabled: isReplayingLastIa }}
                        aria-disabled={isReplayingLastIa}
                        disabled={isReplayingLastIa}
                        onPress={handleReplayLastIa}
                        style={({ pressed }) => [
                          styles.replayButton,
                          pressed && { opacity: 0.88 },
                          isReplayingLastIa && { opacity: 0.55 },
                        ]}
                      >
                        <AppText
                          variant="button"
                          tone="strong"
                          script="latin"
                          align="center"
                        >
                          {isReplayingLastIa
                            ? "Lecture en cours…"
                            : "Réécouter l’interlocuteur"}
                        </AppText>
                      </Pressable>
                    ) : null}

                    <GuidedSpeechTurn
                      accent={PURPLE}
                      confirmationLabel={displayedConfirmationLabel}
                      feedback={displayedSpeechFeedback}
                      interactionDisabled={isReplayingLastIa || isTransitioning}
                      interactionDisabledLabel={
                        isReplayingLastIa ? "Écoute l’interlocuteur…" : undefined
                      }
                      intentionLabels={speechChoices.map((choice) =>
                        choice.id === "choose_hongik_direction"
                          ? "Demander de quel côté prendre le train vers Gangnam"
                          : choice.label,
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
                  </View>
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
      {/*
        Fermeture du background précédent :
        </LinearGradient>
      */}
      <MetroConversationSummaryModal
        memory={conversationMemory}
        onClose={() => setIsSummaryOpen(false)}
        visible={isMetroSpeechPilot && isSummaryOpen}
      />
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
    marginBottom: 0,
  },

  stepLabel: {
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

  speechTurnBlock: {
    gap: 12,
  },

  replayButton: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
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
