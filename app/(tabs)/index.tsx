import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronRight,
  Compass,
  Flame,
  Headphones,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore, type Progress } from "../../_store";
import { AppText } from "../../components/app-text";
import { ActionButton } from "../../components/ui/action-button";
import { HubModuleAccents } from "../../constants/theme";
import { GRAMMAR_STAGE_BY_ID, GRAMMAR_STAGE_IDS } from "../../data/grammar";
import {
  HANGUL_MODULES,
  HANGUL_PROGRESS_IDS,
} from "../../data/hangul/curriculum";
import { aeroportMissions } from "../../data/lesson/aeroport/aeroportMissions";
import { cafeMissions } from "../../data/lesson/cafe/cafeMissions";
import { metroMissions } from "../../data/lesson/metro/metroMissions";
import { restaurantMissions } from "../../data/lesson/restaurant/restaurantMissions";
import {
  EXERCISES_BY_KIND,
  TRAINING_ORDER,
  type ExerciseKind,
} from "../../data/listen/activeExercises";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useAuth } from "../../lib/AuthProvider";
import { useDailyStreak } from "../../lib/DailyStreakProvider";
import {
  createAccountProtectionPromptSessionGuard,
  getMeaningfulProgressCount,
  shouldShowAccountProtectionPrompt,
} from "../../lib/accountProtectionPrompt";
import {
  dismissAccountProtectionPrompt,
  readAccountProtectionPromptState,
} from "../../lib/accountProtectionPromptStorage";
import type { DailyStreakState } from "../../lib/dailyStreak";
import {
  getGrammarJourneyCompletion,
  getGrammarStageState,
} from "../../lib/grammar";
import {
  readHomeResumeContext,
  type HomeResumeContext,
} from "../../lib/homeResume";
import { buildProgressId } from "../../lib/progressIds";

const BACKGROUND_SOURCE = require("../../assets/images/seoulhub.jpg");

// ──────────────────────────────────────────────
// SEOUL MIDNIGHT GLASS — TEST HOME
// ──────────────────────────────────────────────

const BG_DEEP = "#020306";
const TXT = "#F5F7FA";
const MUTED = "rgba(241,245,249,0.70)";
const SOFT = "rgba(241,245,249,0.48)";
const HAIRLINE = "rgba(255,255,255,0.10)";

const CYAN = "#67E8F9";
const PINK = "#F472B6";
const TEAL = "#5EEAD4";

const STREAK_ACCENT = HubModuleAccents.streak;

const HUB_BACKGROUND_DARKNESS = 0.54;

const accountProtectionPromptSessionGuard =
  createAccountProtectionPromptSessionGuard();

const SEOUL_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Seoul",
});

function formatSeoulTime(date = new Date()) {
  return SEOUL_TIME_FORMATTER.format(date);
}

const ABSOLUTE_FILL = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

function textGlow(color: string, radius: number) {
  return {
    textShadowColor: color,
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: radius,
  };
}

const HANGUL_PROGRESS_TOTAL = HANGUL_PROGRESS_IDS.length;

// ──────────────────────────────────────────────
// SEQUENCES
// ──────────────────────────────────────────────

const SEQUENCES: any[] = [
  {
    title: "Hangul",
    label: "Hangul",
    hubAccent: HubModuleAccents.hangul,
    route: "/hangul",
    trackKey: "hangul",
    place: "CENTRE D'APPRENTISSAGE",
    narrative: "Décrypte l'âme visuelle de la ville.",
    type: "pedagogical",
  },
  {
    title: "Grammaire",
    label: "Grammaire",
    hubAccent: HubModuleAccents.grammar,
    route: "/grammar",
    trackKey: "grammar",
    place: "NIVEAU • A0 → A1",
    narrative: "Construis des phrases naturelles, étape par étape.",
    type: "pedagogical",
  },
  {
    title: "Vocabulaire",
    label: "Vocabulaire",
    hubAccent: HubModuleAccents.vocabulary,
    route: "/voc",
    trackKey: "vocab",
    place: "SÉOUL • VOCABULAIRE",
    narrative: "Apprends le vocabulaire selon le contexte.",
    type: "pedagogical",
  },
  {
    title: "Comptage",
    label: "Comptage",
    hubAccent: HubModuleAccents.counting,
    route: "/comptage",
    trackKey: "numbers",
    place: "HONGDAE • QUANTITÉS",
    narrative: "Maîtrise les nombres dans le réel.",
    background: require("../../assets/images/count-card.png"),
    type: "pedagogical",
  },
  {
    title: "Conversation",
    label: "Conversation",
    hubAccent: HubModuleAccents.conversation,
    route: "/speak",
    trackKey: "dialogs",
    place: "IMMERSION",
    narrative: "Parle dans des situations du quotidien.",
    type: "immersion",
  },
  {
    title: "Écoute",
    label: "Écoute",
    hubAccent: HubModuleAccents.listening,
    route: "/listen",
    trackKey: "listen",
    place: "LIGNE 2 • ÉCOUTER",
    narrative: "Affûte ton oreille au rythme de Séoul.",
    type: "immersion",
  },
];

// ──────────────────────────────────────────────
// RESUME CONFIG
// ──────────────────────────────────────────────

const RESUME_SEQUENCES: Record<string, any> = {
  aeroport_ia: {
    title: "Mission aéroport",
    label: "Mission aéroport",
    hubAccent: HubModuleAccents.hangul,
    route: "/lesson/aeroportMissions",
    routeParams: {
      mode: "guided",
    },
    trackKey: "aeroport_ia",
    place: "INCHEON - ARRIVÉE",
    narrative: "Reprends ta dernière mission aéroport.",
    type: "immersion",
  },

  cafe_ia: {
    title: "Mission café",
    label: "Mission café",
    hubAccent: HubModuleAccents.conversation,
    route: "/lesson/cafeMissions",
    routeParams: {
      mode: "guided",
    },
    trackKey: "cafe_ia",
    place: "HONGDAE - CAFÉ",
    narrative: "Reprends ta dernière mission café.",
    type: "immersion",
  },

  metro_ia: {
    title: "Mission métro",
    label: "Mission métro",
    hubAccent: HubModuleAccents.counting,
    route: "/lesson/metroMissions",
    routeParams: {
      mode: "guided",
    },
    trackKey: "metro_ia",
    place: "LIGNE 2 - SE DÉPLACER",
    narrative: "Reprends ta dernière mission métro.",
    type: "immersion",
  },

  restaurant_ia: {
    title: "Mission restaurant",
    label: "Mission restaurant",
    hubAccent: HubModuleAccents.vocabulary,
    route: "/lesson/restaurantMissions",
    routeParams: {
      mode: "guided",
    },
    trackKey: "restaurant_ia",
    place: "ITAEWON - DÎNER",
    narrative: "Reprends ta dernière mission restaurant.",
    type: "immersion",
  },
};

const RESUME_TRACK_LABELS: Record<string, string> = {
  hangul: "Hangul",
  grammar: "Grammaire",
  vocab: "Vocabulaire",
  numbers: "Comptage",
  dialogs: "Conversation",
  listen: "Écoute",
  cafe_ia: "Conversation · Café",
  metro_ia: "Conversation · Métro",
  restaurant_ia: "Conversation · Restaurant",
  aeroport_ia: "Conversation · Aéroport",
};

const LISTEN_KIND_LABELS: Record<ExerciseKind, string> = {
  dictation: "Orthographe",
  situation: "Compréhension",
  gap: "Mot manquant",
  order: "Syntaxe",
  reaction: "Réaction",
};

const MISSION_RESUME_CONFIG: Record<
  string,
  {
    prefix: string;
    place: string;
    route: string;
    missions: readonly {
      id: string;
      title: string;
    }[];
  }
> = {
  cafe_ia: {
    prefix: "cafe",
    place: "Café",
    route: "/lesson/cafeIA",
    missions: cafeMissions,
  },

  metro_ia: {
    prefix: "metro",
    place: "Métro",
    route: "/lesson/metroIA",
    missions: metroMissions,
  },

  restaurant_ia: {
    prefix: "restaurant",
    place: "Restaurant",
    route: "/lesson/restaurantIA",
    missions: restaurantMissions,
  },

  aeroport_ia: {
    prefix: "aeroport",
    place: "Aéroport",
    route: "/lesson/aeroportIA",
    missions: aeroportMissions,
  },
};

// ──────────────────────────────────────────────
// RESUME LOGIC
// ──────────────────────────────────────────────

function getStoredResumeSequence(
  currentTrack: string | null,
  resumeContext: HomeResumeContext | null,
  baseSequence: any,
) {
  if (!currentTrack || resumeContext?.track !== currentTrack) {
    return null;
  }

  const trackLabel = RESUME_TRACK_LABELS[currentTrack] ?? "Parcours";

  return {
    ...baseSequence,
    title: resumeContext.title,
    label: resumeContext.title,
    route: resumeContext.route,
    routeParams: resumeContext.routeParams,
    resumeMeta: `${trackLabel} · ${resumeContext.detail}`,
  };
}

function getHangulResumeSequence(progress: any, baseSequence: any) {
  const lessons = progress.hangulProgress?.lessons ?? {};

  const activeQuizModule = HANGUL_MODULES.find(
    (module) => lessons[module.id]?.activeQuiz,
  );

  const activeSceneModule = [...HANGUL_MODULES]
    .reverse()
    .find(
      (module) =>
        lessons[module.id]?.currentSceneId && !progress.completed?.[module.id],
    );

  const activeModule =
    activeQuizModule ??
    activeSceneModule ??
    HANGUL_MODULES.find((module) => !progress.completed?.[module.id]) ??
    HANGUL_MODULES[HANGUL_MODULES.length - 1];

  if (!activeModule) {
    return null;
  }

  const lesson = lessons[activeModule.id];

  const sceneId = lesson?.activeQuiz?.sceneId ?? lesson?.currentSceneId;

  const activeScene =
    activeModule.scenes.find((scene) => scene.id === sceneId) ??
    activeModule.scenes.find((scene) => !lesson?.completedScenes?.[scene.id]) ??
    activeModule.scenes[activeModule.scenes.length - 1];

  if (!activeScene) {
    return null;
  }

  const activeQuiz =
    lesson?.activeQuiz?.sceneId === activeScene.id
      ? lesson.activeQuiz
      : undefined;

  const questionNumber = activeQuiz
    ? Math.min(activeQuiz.questionIndex + 1, activeQuiz.questions.length)
    : null;

  const detail = questionNumber
    ? `Hangul · ${activeModule.title} · Quiz ${questionNumber} / ${activeQuiz.questions.length}`
    : `Hangul · ${activeModule.title}`;

  return {
    ...baseSequence,
    title: activeScene.title,
    label: activeScene.title,
    route: activeModule.route,
    resumeMeta: detail,
  };
}

function getGrammarResumeSequence(progress: Progress, baseSequence: any) {
  const grammarProgress = progress.grammarProgress;

  const resumableStageId =
    grammarProgress.lastStageId &&
    grammarProgress.stages[grammarProgress.lastStageId]?.activeSession &&
    !grammarProgress.stages[grammarProgress.lastStageId]?.activeSession
      ?.completedAt
      ? grammarProgress.lastStageId
      : undefined;

  const stageId =
    resumableStageId ??
    GRAMMAR_STAGE_IDS.find((candidate) => {
      const state = getGrammarStageState(grammarProgress, candidate);

      return state !== "practiced" && state !== "mastered";
    }) ??
    grammarProgress.lastStageId ??
    GRAMMAR_STAGE_IDS[GRAMMAR_STAGE_IDS.length - 1];

  const stage = GRAMMAR_STAGE_BY_ID[stageId];

  if (!stage) {
    return null;
  }

  const session = grammarProgress.stages[stageId]?.activeSession;

  const questionNumber =
    session && !session.completedAt
      ? Math.min(session.questionIndex + 1, session.questions.length)
      : null;

  const detail = questionNumber && session
    ? `Grammaire · Exercice ${questionNumber} / ${session.questions.length}`
    : `Grammaire · Étape ${stage.number} / ${GRAMMAR_STAGE_IDS.length}`;

  return {
    ...baseSequence,
    title: stage.title,
    label: stage.title,
    route: "/grammar/[stageId]",
    routeParams: {
      stageId,
    },
    resumeMeta: detail,
  };
}

function getListenResumeSequence(progress: any, baseSequence: any) {
  for (
    let trainingIndex = 0;
    trainingIndex < TRAINING_ORDER.length;
    trainingIndex += 1
  ) {
    const kind = TRAINING_ORDER[trainingIndex];

    const exercises = EXERCISES_BY_KIND[kind];

    for (
      let exerciseIndex = 0;
      exerciseIndex < exercises.length;
      exerciseIndex += 1
    ) {
      const exercise = exercises[exerciseIndex];

      const progressId = buildProgressId("listen", exercise.id);

      if (!progress.completed?.[progressId]) {
        return {
          ...baseSequence,

          title: exercise.title,
          label: exercise.title,

          route: "/listen",

          routeParams: {
            training: kind,
            exercise: String(exerciseIndex),
          },

          resumeMeta:
            `Écoute · ${LISTEN_KIND_LABELS[kind]} · ` +
            `${exercise.theme} · ` +
            `Exercice ${exerciseIndex + 1} / ${exercises.length}`,
        };
      }
    }
  }

  return {
    ...baseSequence,
    title: "Révision d'écoute",
    label: "Révision d'écoute",
    route: "/listen",
    resumeMeta: "Écoute · Parcours terminé · Révision libre",
  };
}

function getMissionResumeSequence(
  currentTrack: string | null,
  progress: any,
  baseSequence: any,
) {
  if (!currentTrack) {
    return null;
  }

  const config = MISSION_RESUME_CONFIG[currentTrack];

  if (!config) {
    return null;
  }

  const resumeByProgressId = new Map<
    string,
    {
      mission: {
        id: string;
        title: string;
      };
      mode: "guided" | "real";
    }
  >();

  for (const mission of config.missions) {
    for (const mode of ["guided", "real"] as const) {
      resumeByProgressId.set(buildProgressId(config.prefix, mode, mission.id), {
        mission,
        mode,
      });
    }
  }

  const completedIds = Object.keys(progress.completed ?? {});

  let match:
    | {
        mission: {
          id: string;
          title: string;
        };
        mode: "guided" | "real";
      }
    | undefined;

  for (let index = completedIds.length - 1; index >= 0; index -= 1) {
    const candidate = resumeByProgressId.get(completedIds[index]);

    if (candidate) {
      match = candidate;
      break;
    }
  }

  if (!match) {
    return null;
  }

  return {
    ...baseSequence,

    title: match.mission.title,
    label: match.mission.title,

    route: config.route,

    routeParams: {
      mode: match.mode,
      mission: match.mission.id,
    },

    resumeMeta: `Conversation · ${config.place} · ${
      match.mode === "real" ? "Simulation réelle" : "Simulation guidée"
    }`,
  };
}

function getDerivedResumeSequence(
  currentTrack: string | null,
  progress: any,
  baseSequence: any,
) {
  switch (currentTrack) {
    case "hangul":
      return getHangulResumeSequence(progress, baseSequence);

    case "grammar":
      return getGrammarResumeSequence(progress, baseSequence);

    case "listen":
      return getListenResumeSequence(progress, baseSequence);

    case "cafe_ia":
    case "metro_ia":
    case "restaurant_ia":
    case "aeroport_ia":
      return getMissionResumeSequence(currentTrack, progress, baseSequence);

    default:
      return null;
  }
}

// ──────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────

type SeoulHeroProps = {
  cityTime: string;
};

function SeoulHero({ cityTime }: SeoulHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroEyebrowRow}>
        <View style={styles.heroLiveDot} />

        <AppText variant="sectionLabel" style={styles.heroEyebrow}>
          LIVE FROM SEOUL
        </AppText>
      </View>

      <View style={styles.heroTitleRow}>
        <Text style={[styles.heroTitle, styles.heroTitleShadow]}>Tu es à </Text>

        <MaskedView maskElement={<Text style={styles.heroTitle}>Séoul.</Text>}>
          <LinearGradient
            colors={[TEAL, CYAN, PINK]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
          >
            <Text style={[styles.heroTitle, styles.heroAccentPlaceholder]}>
              Séoul.
            </Text>
          </LinearGradient>
        </MaskedView>
      </View>

      <AppText variant="bodySecondary" style={styles.heroSubtitle}>
        {cityTime} là-bas. La ville devient ton terrain d'apprentissage.
      </AppText>
    </View>
  );
}

// ──────────────────────────────────────────────
// HOME
// ──────────────────────────────────────────────

export default function Home() {
  const { progress, setTrack, isHydrated } = useStore();

  const auth = useAuth();

  const { refreshStreak, streak } = useDailyStreak();

  const responsive = useResponsiveLayout({
    maxWidth: 900,
  });

  const gridColumns = responsive.getColumns({
    minColumnWidth: 330,
    maxColumns: 2,
    gap: responsive.gridGap,
  });

  const gridItemWidth = responsive.getGridItemWidth(
    gridColumns,
    responsive.gridGap,
  );

  const [resumeContext, setResumeContext] = useState<HomeResumeContext | null>(
    null,
  );

  const [seoulTime, setSeoulTime] = useState(formatSeoulTime);

  const [showProtectionPrompt, setShowProtectionPrompt] = useState(false);

  const meaningfulProgressCount = getMeaningfulProgressCount(progress);

  const promptContextRef = useRef({
    isAnonymous: auth.isAnonymous,
    isHydrated,
    meaningfulProgressCount,
  });

  useEffect(() => {
    promptContextRef.current = {
      isAnonymous: auth.isAnonymous,
      isHydrated,
      meaningfulProgressCount,
    };
  }, [auth.isAnonymous, isHydrated, meaningfulProgressCount]);

  const currentTrack = progress.learningTrack;

  const baseActiveSeq =
    (currentTrack ? RESUME_SEQUENCES[currentTrack] : undefined) ??
    SEQUENCES.find((sequence) => sequence.trackKey === currentTrack) ??
    SEQUENCES[0];

  const storedResumeSequence = getStoredResumeSequence(
    currentTrack,
    resumeContext,
    baseActiveSeq,
  );

  const derivedResumeSequence = getDerivedResumeSequence(
    currentTrack,
    progress,
    baseActiveSeq,
  );

  const activeSeq =
    storedResumeSequence ?? derivedResumeSequence ?? baseActiveSeq;

  const activeSeqProgress = getSequenceProgress(activeSeq.trackKey, progress);

  const activeSeqNarrative =
    activeSeq.trackKey === "hangul" && (activeSeqProgress ?? 0) > 0
      ? "Reprends ta session Hangul."
      : activeSeq.narrative;

  const pedagogicalSequences = SEQUENCES.filter(
    (sequence) => sequence.type === "pedagogical",
  );

  const immersionSequences = SEQUENCES.filter(
    (sequence) => sequence.type === "immersion",
  );

  const livePulse = useRef(new Animated.Value(0.35)).current;

  // Live status pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(livePulse, {
          toValue: 0.35,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [livePulse]);

  // Seoul time
  useEffect(() => {
    let minuteInterval: ReturnType<typeof setInterval> | undefined;

    let minuteTimeout: ReturnType<typeof setTimeout> | undefined;

    const updateSeoulTime = () => {
      setSeoulTime(formatSeoulTime());
    };

    const delayUntilNextMinute = 60_000 - (Date.now() % 60_000);

    updateSeoulTime();

    minuteTimeout = setTimeout(() => {
      updateSeoulTime();

      minuteInterval = setInterval(updateSeoulTime, 60_000);
    }, delayUntilNextMinute);

    return () => {
      if (minuteTimeout) {
        clearTimeout(minuteTimeout);
      }

      if (minuteInterval) {
        clearInterval(minuteInterval);
      }
    };
  }, []);

  // Refresh streak
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      refreshStreak()
        .then(() => {
          if (!isMounted) {
            return;
          }
        })
        .catch(() => null);

      return () => {
        isMounted = false;
      };
    }, [refreshStreak]),
  );

  // Resume context
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      readHomeResumeContext()
        .then((context) => {
          if (isMounted) {
            setResumeContext(context);
          }
        })
        .catch(() => {
          if (isMounted) {
            setResumeContext(null);
          }
        });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  // The first Hub visit of an app session is intentionally quiet. On later
  // visits, eligibility is read from local storage and evaluated once.
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!accountProtectionPromptSessionGuard.beginHubVisit()) {
        setShowProtectionPrompt(false);
        return () => {
          isMounted = false;
        };
      }

      const context = promptContextRef.current;
      if (
        !context.isHydrated ||
        !context.isAnonymous ||
        context.meaningfulProgressCount <= 0
      ) {
        setShowProtectionPrompt(false);
        return () => {
          isMounted = false;
        };
      }

      void readAccountProtectionPromptState()
        .then((promptState) => {
          if (!isMounted) return;

          const shouldShow = shouldShowAccountProtectionPrompt({
            isAnonymous: context.isAnonymous,
            meaningfulProgressCount: context.meaningfulProgressCount,
            promptState,
          });

          setShowProtectionPrompt(shouldShow);
          if (shouldShow) {
            accountProtectionPromptSessionGuard.markPromptShown();
          }
        })
        .catch((error) => {
          console.warn(
            "Impossible de lire la préférence de protection du compte:",
            error,
          );
          if (isMounted) setShowProtectionPrompt(false);
        });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const openSequence = (sequence: any) => {
    setTrack(sequence.trackKey);

    if (sequence.routeParams) {
      router.push({
        pathname: sequence.route,

        params: sequence.routeParams,
      } as any);

      return;
    }

    router.push(sequence.route);
  };

  const dismissProtectionPrompt = useCallback(() => {
    setShowProtectionPrompt(false);
    void dismissAccountProtectionPrompt(meaningfulProgressCount).catch(
      (error) => {
        console.warn(
          "Impossible d’enregistrer le rappel de protection du compte:",
          error,
        );
      },
    );
  }, [meaningfulProgressCount]);

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bgImage}
        resizeMode="cover"
      >
        {/* Background blur */}

        <BlurView intensity={12} tint="dark" style={styles.bgBlur} />

        {/* Main smoked overlay */}

        <View style={styles.hubDarkOverlay} />

        {/* Cinematic depth */}

        <LinearGradient
          colors={["rgba(2,3,6,0.14)", "rgba(2,3,6,0.16)", "rgba(2,3,6,0.74)"]}
          locations={[0, 0.46, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Ambient glass lighting */}

        <View style={styles.ambientGlowCyan} pointerEvents="none" />

        <View style={styles.ambientGlowPink} pointerEvents="none" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,

            {
              paddingHorizontal: responsive.horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.contentFrame,

              {
                maxWidth: responsive.maxWidth,
              },
            ]}
          >
            {/* HEADER */}

            <GlassHeader
              compact={responsive.isCompact}
              cityTime={seoulTime}
              livePulse={livePulse}
              isProtected={auth.isPermanentAccount}
              onOpenProfile={() => router.push("/account")}
            />

            {/* HERO */}

            <SeoulHero cityTime={seoulTime} />

            {/* DAILY RHYTHM */}

            <AnimatedFragment index={0}>
              <DailyMomentumCard
                compact={responsive.isCompact}
                streak={streak}
                onPress={() => router.push("/streak")}
              />
            </AnimatedFragment>

            {/* ACTIVE JOURNEY */}

            <AnimatedFragment index={1}>
              <MainActionCard
                sequence={activeSeq}
                narrative={activeSeqNarrative}
                progress={activeSeqProgress}
                onPress={() => openSequence(activeSeq)}
              />
            </AnimatedFragment>

            {showProtectionPrompt && auth.isAnonymous ? (
              <AnimatedFragment index={0}>
                <AccountProtectionCard
                  compact={responsive.isCompact}
                  onProtect={() => {
                    setShowProtectionPrompt(false);
                    router.push({
                      pathname: "/account",
                      params: { action: "protect" },
                    });
                  }}
                  onDismiss={dismissProtectionPrompt}
                />
              </AnimatedFragment>
            ) : null}

            {/* PEDAGOGICAL */}

            <SectionHeader
              title="PARCOURS"
              subtitle="Construis tes bases"
              colors={[TEAL, CYAN]}
            />

            <View
              style={[
                styles.grid,

                gridColumns > 1 && styles.gridWide,

                {
                  gap: responsive.gridGap,
                },
              ]}
            >
              {pedagogicalSequences.map((sequence, index) => (
                <AnimatedFragment
                  key={sequence.trackKey}
                  index={index + 2}
                  style={
                    gridColumns > 1
                      ? {
                          width: gridItemWidth,
                        }
                      : undefined
                  }
                >
                  <SequenceCard
                    item={sequence}
                    isActive={sequence.trackKey === currentTrack}
                    onPress={() => openSequence(sequence)}
                  />
                </AnimatedFragment>
              ))}
            </View>

            {/* IMMERSION */}

            <SectionHeader
              title="IMMERSION"
              subtitle="Vis le coréen"
              colors={[CYAN, PINK]}
            />

            <View
              style={[
                styles.grid,

                gridColumns > 1 && styles.gridWide,

                {
                  gap: responsive.gridGap,
                },
              ]}
            >
              {immersionSequences.map((sequence, index) => (
                <AnimatedFragment
                  key={sequence.trackKey}
                  index={index + 2 + pedagogicalSequences.length}
                  style={
                    gridColumns > 1
                      ? {
                          width: gridItemWidth,
                        }
                      : undefined
                  }
                >
                  <SequenceCard
                    item={sequence}
                    isActive={sequence.trackKey === currentTrack}
                    onPress={() => openSequence(sequence)}
                  />
                </AnimatedFragment>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// GLASS HEADER
// ──────────────────────────────────────────────

function GlassHeader({
  compact,
  cityTime,
  livePulse,
  isProtected,
  onOpenProfile,
}: {
  compact: boolean;
  cityTime: string;
  livePulse: Animated.Value;
  isProtected: boolean;
  onOpenProfile: () => void;
}) {
  return (
    <View style={styles.headerShell}>
      <BlurView intensity={48} tint="dark" style={styles.headerBlur}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.10)",
            "rgba(255,255,255,0.025)",
            "rgba(4,8,18,0.26)",
          ]}
          locations={[0, 0.28, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.brandGroup}>
          <AppText
            variant="koreanPrimary"
            script="korean"
            lineContract="singleLine"
            style={styles.headerCityKr}
          >
            서울
          </AppText>

          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={styles.headerCityEn}
          >
            SÉOUL
          </AppText>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.headerLiveRow}>
            <Animated.View
              style={[
                styles.headerLiveDot,

                {
                  opacity: livePulse,
                },
              ]}
            />

            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={styles.headerLiveText}
            >
              IMMERSION ACTIVE
            </AppText>
          </View>

          {!compact ? (
            <AppText
              accessibilityLabel={`Heure à Séoul : ${cityTime}`}
              variant="label"
              lineContract="singleLine"
              style={styles.headerTime}
            >
              {cityTime} · SEOUL
            </AppText>
          ) : null}
        </View>

        <View style={styles.headerActionSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir mon profil"
            accessibilityValue={{ text: isProtected ? "Compte protégé" : "Compte local" }}
            accessibilityHint="Ouvre la page Mon profil"
            hitSlop={4}
            onPress={onOpenProfile}
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.profileButtonPressed,
            ]}
          >
            <UserRound size={20} strokeWidth={1.9} color={CYAN} />
            {isProtected ? (
              <View style={styles.profileStatusDot} pointerEvents="none">
                <View style={styles.profileStatusDotCore} />
              </View>
            ) : null}
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

function AccountProtectionCard({
  compact,
  onProtect,
  onDismiss,
}: {
  compact: boolean;
  onProtect: () => void;
  onDismiss: () => void;
}) {
  return (
    <View style={styles.protectionCardShell}>
      <BlurView intensity={56} tint="dark" style={styles.protectionCard}>
        <LinearGradient
          colors={[
            "rgba(103,232,249,0.11)",
            "rgba(9,13,20,0.76)",
            "rgba(2,3,6,0.84)",
          ]}
          locations={[0, 0.48, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glassTopHairline} />
        <View style={styles.protectionContent}>
          <View style={styles.protectionIcon}>
            <ShieldCheck size={20} strokeWidth={2} color={CYAN} />
          </View>
          <View style={styles.protectionCopy}>
            <AppText variant="sectionTitle" style={styles.protectionTitle}>
              Protégez votre progression
            </AppText>
            <AppText
              variant="bodySecondary"
              tone="muted"
              style={styles.protectionBody}
            >
              Retrouvez votre apprentissage après une réinstallation ou sur un
              autre appareil.
            </AppText>
          </View>
        </View>
        <View
          style={[
            styles.protectionActions,
            compact && styles.protectionActionsCompact,
          ]}
        >
          <ActionButton
            accessibilityLabel="Protéger ma progression maintenant"
            label="Protéger maintenant"
            accentColor={CYAN}
            fullWidth={compact}
            onPress={onProtect}
            style={compact ? undefined : styles.protectionPrimaryAction}
          />
          <ActionButton
            accessibilityLabel="Me le rappeler plus tard"
            label="Plus tard"
            variant="secondary"
            fullWidth={compact}
            onPress={onDismiss}
            style={compact ? undefined : styles.protectionSecondaryAction}
          />
        </View>
      </BlurView>
    </View>
  );
}

// ──────────────────────────────────────────────
// DAILY MOMENTUM
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// DAILY MOMENTUM
// ──────────────────────────────────────────────

function DailyMomentumCard({
  compact,
  streak,
  onPress,
}: {
  compact: boolean;
  streak: DailyStreakState | null;
  onPress: () => void;
}) {
  const currentStreak = streak?.currentStreak ?? 0;
  const freezesAvailable = streak?.freezesAvailable ?? 0;
  const isValidated = streak?.isTodayCompleted ?? false;

  const dayLabel = currentStreak > 1 ? "jours" : "jour";
  const protectionLabel = freezesAvailable > 1 ? "protections" : "protection";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Rythme du jour. ${
        isValidated ? "Journée validée." : "Journée à compléter."
      } Série de ${currentStreak} ${dayLabel}. ${freezesAvailable} ${protectionLabel}.`}
      accessibilityHint="Ouvre le détail de la série quotidienne"
      onPress={onPress}
      style={({ pressed }) => [
        styles.dailyCardWrap,
        pressed && styles.pressablePressed,
      ]}
    >
      <BlurView
        intensity={58}
        tint="dark"
        style={[styles.dailyCard, compact && styles.dailyCardCompact]}
      >
        <LinearGradient
          colors={[
            STREAK_ACCENT.surfaceStrong,
            "rgba(7,16,22,0.76)",
            "rgba(2,3,6,0.88)",
          ]}
          locations={[0, 0.46, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />

        {/* Halo d'ambiance */}

        <View style={styles.dailyGlow} />

        <View style={styles.glassTopHairline} />

        {/* HEADER */}

        <View style={styles.dailyHeader}>
          <View style={styles.dailyKickerRow}>
            <Sparkles size={18} strokeWidth={2} color={CYAN} />

            <AppText variant="sectionLabel" style={styles.dailyKicker}>
              RYTHME DU JOUR
            </AppText>
          </View>

          <View style={styles.dailyArrow}>
            <ChevronRight
              size={19}
              strokeWidth={2.2}
              color="rgba(241,245,249,0.48)"
            />
          </View>
        </View>

        {/* INFORMATION PRINCIPALE */}

        <View style={styles.dailyMain}>
          <AppText variant="featureTitle" style={styles.dailyTitle}>
            {isValidated ? "Journée validée" : "Continue ta journée"}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.dailySubtitle}
          >
            {isValidated
              ? "Ta série est protégée pour aujourd'hui."
              : "Une activité suffit pour protéger ta série."}
          </AppText>
        </View>

        {/* STATISTIQUES */}

        <View style={styles.dailyStats}>
          <View style={styles.dailyStat}>
            <View
              style={[
                styles.dailyIconOrb,
                isValidated && styles.dailyIconOrbActive,
              ]}
            >
              <Flame
                size={21}
                strokeWidth={2.2}
                color={
                  isValidated ? STREAK_ACCENT.base : "rgba(241,245,249,0.48)"
                }
                fill={isValidated ? STREAK_ACCENT.base : "transparent"}
              />
            </View>

            <View style={styles.dailyStatText}>
              <AppText
                variant="bodyStrong"
                lineContract="singleLine"
                style={styles.dailyStreakValue}
              >
                {currentStreak}
              </AppText>

              <AppText
                variant="caption"
                lineContract="singleLine"
                style={styles.dailyStatLabel}
              >
                {dayLabel}
              </AppText>
            </View>
          </View>

          <View style={styles.dailyDivider} />

          <View style={styles.dailyStat}>
            <View style={styles.dailyIconOrb}>
              <ShieldCheck size={21} strokeWidth={2.1} color={CYAN} />
            </View>

            <View style={styles.dailyStatText}>
              <AppText
                variant="bodyStrong"
                lineContract="singleLine"
                style={styles.dailyFreezeValue}
              >
                {freezesAvailable}
              </AppText>

              <AppText
                variant="caption"
                lineContract="singleLine"
                style={styles.dailyStatLabel}
              >
                {protectionLabel}
              </AppText>
            </View>
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// MAIN ACTION
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// MAIN ACTION
// ──────────────────────────────────────────────

function MainActionCard({ sequence, narrative, progress, onPress }: any) {
  const displayLabel = sequence.label;

  const resumeMeta = sequence.resumeMeta as string | undefined;

  const isMission = sequence.trackKey.endsWith("_ia");

  const accent = sequence.hubAccent;

  const progressAnim = useRef(new Animated.Value(0)).current;

  const hasProgress = typeof progress === "number";
  const progressValue = hasProgress ? Math.max(0, Math.min(1, progress)) : 0;

  useEffect(() => {
    if (!hasProgress) {
      progressAnim.setValue(0);
      return;
    }

    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 720,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [hasProgress, progressAnim, progressValue]);

  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const displayedProgress = Math.round(progressValue * 100);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Reprendre ${
        isMission ? "la mission" : "le parcours"
      } ${displayLabel}. ${narrative}`}
      accessibilityHint="Ouvre le parcours actif"
      onPress={onPress}
      style={({ pressed }) => [
        styles.mainCardWrap,

        {
          borderColor: accent.featuredBorder,

          boxShadow: `0px 12px 28px ${accent.featuredShadow}`,
        },

        pressed && styles.pressablePressed,
      ]}
    >
      <BlurView intensity={72} tint="dark" style={styles.mainCard}>
        <LinearGradient
          colors={[
            accent.surfaceStrong,
            "rgba(8,10,16,0.64)",
            "rgba(2,3,6,0.70)",
          ]}
          locations={[0, 0.46, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.mainAmbientGlow,

            {
              backgroundColor: accent.base,

              boxShadow: `0px 0px 54px ${accent.glow}`,
            },
          ]}
        />

        <View style={styles.glassTopHairline} />

        <View style={styles.mainCardTopRow}>
          <View style={styles.mainCardKickerPill}>
            <View
              style={[
                styles.mainCardKickerDot,

                {
                  backgroundColor: accent.base,
                },
              ]}
            />

            <AppText variant="sectionLabel" style={styles.mainCardKicker}>
              {isMission ? "MISSION EN COURS" : "À CONTINUER"}
            </AppText>
          </View>

          <View
            style={[
              styles.mainArrowButton,

              {
                borderColor: accent.iconBorder,

                backgroundColor: accent.iconSurface,
              },
            ]}
          >
            <ChevronRight size={19} color={accent.base} strokeWidth={2.3} />
          </View>
        </View>

        <View style={styles.mainContent}>
          <AppText variant="featureTitle" style={styles.mainTitle}>
            {displayLabel}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.mainNarrative}
          >
            {resumeMeta ?? narrative}
          </AppText>
        </View>

        {hasProgress ? (
          <View style={styles.mainProgressBlock}>
            <View style={styles.mainProgressMeta}>
              <AppText variant="caption" style={styles.mainProgressLabel}>
                PROGRESSION
              </AppText>

              <AppText
                variant="bodyStrong"
                style={[
                  styles.mainProgressValue,
                  displayedProgress === 0 && styles.mainProgressValueStart,
                ]}
              >
                {displayedProgress === 0
                  ? "Commencer"
                  : `${displayedProgress}%`}
              </AppText>
            </View>

            <View style={styles.mainProgressTrack}>
              <Animated.View
                style={[
                  styles.mainProgressFill,

                  {
                    width: animatedProgressWidth,
                  },
                ]}
              >
                <LinearGradient
                  colors={[accent.base, "rgba(255,255,255,0.90)"]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 0,
                  }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </View>
        ) : (
          <View style={styles.mainFooterMeta}>
            <AppText variant="caption" style={styles.mainFooterLabel}>
              REPRENDRE L'IMMERSION
            </AppText>

            <View
              style={[
                styles.mainFooterLine,

                {
                  backgroundColor: accent.base,
                },
              ]}
            />
          </View>
        )}
      </BlurView>
    </Pressable>
  );
}
// ──────────────────────────────────────────────
// SECTION HEADER
// ──────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: [string, string];
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <AppText variant="sectionLabel" style={styles.sectionTitle}>
          {title}
        </AppText>

        <AppText variant="caption" style={styles.sectionSubtitle}>
          {subtitle}
        </AppText>
      </View>

      <View style={styles.sectionLineWrap}>
        <View style={styles.sectionLineBase} />

        <LinearGradient
          colors={["transparent", colors[0], colors[1]]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={styles.sectionLineGlow}
        />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// ANIMATION WRAPPER
// ──────────────────────────────────────────────

function AnimatedFragment({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: StyleProp<ViewStyle>;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 620,
        delay: index * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 720,
        delay: index * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  return (
    <Animated.View
      style={[
        style,

        {
          opacity: fadeAnim,

          transform: [
            {
              translateY: slideAnim,
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ──────────────────────────────────────────────
// PROGRESS
// ──────────────────────────────────────────────

function getSequenceProgress(trackKey: string, progress: any) {
  if (trackKey === "grammar") {
    return getGrammarJourneyCompletion(progress.grammarProgress);
  }

  if (trackKey !== "hangul") {
    return null;
  }

  const completedHangulItems = HANGUL_PROGRESS_IDS.filter(
    (id) => progress.completed?.[id],
  ).length;

  return Math.min(1, completedHangulItems / HANGUL_PROGRESS_TOTAL);
}

// ──────────────────────────────────────────────
// ICONS
// ──────────────────────────────────────────────

function getSequenceIcon(trackKey: string) {
  switch (trackKey) {
    case "hangul":
      return "가";

    case "grammar":
      return "문";

    case "vocab":
      return "dialogue";

    case "numbers":
      return "123";

    case "dialogs":
      return "compass";

    case "listen":
      return "headphones";

    default:
      return "•";
  }
}

function SequenceIconGlyph({ icon, color }: { icon: string; color: string }) {
  if (icon === "dialogue") {
    return <MessageCircleMore color={color} size={22} strokeWidth={2.15} />;
  }

  if (icon === "compass") {
    return <Compass color={color} size={22} strokeWidth={2.15} />;
  }

  if (icon === "headphones") {
    return <Headphones color={color} size={21} strokeWidth={2.15} />;
  }

  return (
    <AppText
      variant="symbol"
      style={[
        styles.sequenceIconText,

        {
          color,
        },

        textGlow(color, 9),
      ]}
    >
      {icon}
    </AppText>
  );
}

// ──────────────────────────────────────────────
// SEQUENCE CARD
// ──────────────────────────────────────────────

function SequenceCard({ item, isActive, onPress }: any) {
  const accent = item.hubAccent;

  const icon = getSequenceIcon(item.trackKey);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${item.title}. ${item.narrative}`}
      accessibilityState={{
        selected: isActive,
      }}
      accessibilityHint="Ouvre ce parcours"
      aria-selected={isActive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sequenceCardWrap,

        isActive && {
          borderColor: accent.selectedBorder,

          boxShadow: `0px 12px 24px ${accent.selectedShadow}`,
        },

        pressed && styles.pressablePressed,
      ]}
    >
      <BlurView
        intensity={isActive ? 62 : 48}
        tint="dark"
        style={styles.sequenceCard}
      >
        <LinearGradient
          colors={[accent.surface, "rgba(5,7,12,0.62)", "rgba(2,3,6,0.66)"]}
          locations={[0, 0.5, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.sequenceAmbientGlow,

            {
              backgroundColor: accent.base,

              boxShadow: `0px 0px 42px ${accent.glow}`,
            },
          ]}
        />

        <View style={styles.glassTopHairline} />

        <View style={styles.sequenceTopRow}>
          <View
            style={[
              styles.sequenceIconBox,

              {
                borderColor: accent.iconBorder,

                backgroundColor: accent.iconSurface,

                boxShadow: `0px 0px 14px ${
                  isActive ? accent.iconShadowSelected : accent.iconShadow
                }`,
              },
            ]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.18)",
                "rgba(255,255,255,0.025)",
                "transparent",
              ]}
              style={StyleSheet.absoluteFill}
            />

            <SequenceIconGlyph icon={icon} color={accent.base} />
          </View>

          <View style={styles.sequencePlacePill}>
            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={styles.sequencePlace}
            >
              {item.place}
            </AppText>
          </View>
        </View>

        <View style={styles.sequenceTextBlock}>
          <AppText variant="cardTitle" style={styles.sequenceTitle}>
            {item.title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.sequenceNarrative}
          >
            {item.narrative}
          </AppText>
        </View>

        <View style={styles.sequenceFooter}>
          <View style={styles.sequenceFooterLine}>
            <View
              style={[
                styles.sequenceFooterAccent,

                {
                  backgroundColor: accent.base,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.sequenceArrow,

              isActive && {
                borderColor: accent.iconBorder,

                backgroundColor: accent.iconSurface,
              },
            ]}
          >
            <ChevronRight
              size={17}
              strokeWidth={2.2}
              color={isActive ? accent.base : "rgba(241,245,249,0.48)"}
            />
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  // ─────────────────────────────
  // ROOT
  // ─────────────────────────────

  safe: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  bgImage: {
    flex: 1,
    backgroundColor: BG_DEEP,
    overflow: "hidden",
  },

  bgBlur: {
    ...ABSOLUTE_FILL,
  },

  hubDarkOverlay: {
    ...ABSOLUTE_FILL,

    backgroundColor: `rgba(2,3,6,${HUB_BACKGROUND_DARKNESS})`,
  },

  ambientGlowCyan: {
    position: "absolute",

    top: 105,
    right: -95,

    width: 220,
    height: 220,

    borderRadius: 110,

    backgroundColor: "rgba(103,232,249,0.055)",

    boxShadow: "0px 0px 80px rgba(103,232,249,0.10)",
  },

  ambientGlowPink: {
    position: "absolute",

    top: 360,
    left: -120,

    width: 240,
    height: 240,

    borderRadius: 120,

    backgroundColor: "rgba(244,114,182,0.04)",

    boxShadow: "0px 0px 90px rgba(244,114,182,0.08)",
  },

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 112,
  },

  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },

  pressablePressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.992,
      },
    ],
  },

  glassTopHairline: {
    position: "absolute",

    top: 0,
    left: 18,
    right: 18,

    height: 1,

    backgroundColor: "rgba(255,255,255,0.17)",

    opacity: 0.72,
  },

  // ─────────────────────────────
  // HEADER
  // ─────────────────────────────

  headerShell: {
    marginTop: 4,

    borderRadius: 22,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.09)",

    backgroundColor: "rgba(2,3,6,0.28)",

    boxShadow: "0px 8px 24px rgba(0,0,0,0.20)",
  },

  headerBlur: {
    minHeight: 58,

    paddingHorizontal: 14,
    paddingVertical: 10,

    flexDirection: "row",

    alignItems: "center",

    position: "relative",

    overflow: "hidden",
  },

  brandGroup: {
    minWidth: 56,
    alignItems: "flex-start",
  },

  headerCityKr: {
    color: TXT,
  },

  headerCityEn: {
    color: "rgba(255,255,255,0.48)",

    marginTop: -1,
  },

  headerCenter: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 10,
  },

  headerLiveRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerLiveDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: CYAN,

    marginRight: 7,

    boxShadow: "0px 0px 8px rgba(103,232,249,0.65)",
  },

  headerLiveText: {
    color: "rgba(226,242,254,0.76)",
  },

  headerTime: {
    marginTop: 3,

    color: "rgba(226,242,254,0.38)",
  },

  headerActionSlot: {
    width: 56,
    minHeight: 44,

    alignItems: "flex-end",
    justifyContent: "flex-end",
  },

  profileButton: {
    width: 44,
    height: 44,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.20)",

    backgroundColor: "rgba(103,232,249,0.075)",

    boxShadow: "0px 5px 16px rgba(0,0,0,0.20)",
  },

  profileStatusDot: {
    position: "absolute",
    right: 5,
    bottom: 5,

    width: 12,
    height: 12,
    borderRadius: 6,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(2,3,6,0.94)",

    boxShadow: "0px 0px 8px rgba(74,222,128,0.42)",
  },

  profileStatusDotCore: {
    width: 7,
    height: 7,
    borderRadius: 4,

    backgroundColor: "#4ADE80",
  },

  profileButtonPressed: {
    opacity: 0.74,

    transform: [{ scale: 0.96 }],
  },

  // ─────────────────────────────
  // HERO
  // ─────────────────────────────

  hero: {
    paddingHorizontal: 2,

    marginTop: 66,
    marginBottom: 34,
  },

  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 11,
  },

  heroLiveDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: TEAL,

    marginRight: 7,

    boxShadow: "0px 0px 8px rgba(94,234,212,0.72)",
  },

  heroEyebrow: {
    color: "rgba(226,242,254,0.48)",

    letterSpacing: 1.35,
  },

  heroTitleRow: {
    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "baseline",
  },

  heroTitle: {
    fontSize: 42,
    lineHeight: 44,

    fontWeight: "800",

    letterSpacing: -0.8,

    color: TXT,
  },

  heroTitleShadow: {
    textShadowColor: "rgba(0,0,0,0.38)",

    textShadowOffset: {
      width: 0,
      height: 2,
    },

    textShadowRadius: 8,
  },

  heroAccentPlaceholder: {
    opacity: 0,
  },

  heroSubtitle: {
    maxWidth: 560,

    marginTop: 12,

    color: "rgba(245,247,250,0.68)",
  },

  // ─────────────────────────────
  // DAILY MOMENTUM
  // ─────────────────────────────

  // ─────────────────────────────
  // DAILY MOMENTUM
  // ─────────────────────────────

  dailyCardWrap: {
    marginBottom: 14,

    borderRadius: 28,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.16)",

    backgroundColor: "rgba(3,4,8,0.38)",

    boxShadow: `0px 12px 30px ${STREAK_ACCENT.featuredShadow}`,
  },

  dailyCard: {
    minHeight: 194,

    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 20,

    position: "relative",

    overflow: "hidden",
  },

  dailyCardCompact: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },

  dailyGlow: {
    position: "absolute",

    top: -78,
    left: -54,

    width: 190,
    height: 190,

    borderRadius: 95,

    backgroundColor: STREAK_ACCENT.base,

    opacity: 0.07,

    boxShadow: `0px 0px 72px ${STREAK_ACCENT.glow}`,
  },

  dailyHeader: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 17,
  },

  dailyKickerRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    flexShrink: 1,
  },

  dailyKicker: {
    color: "rgba(241,245,249,0.52)",

    letterSpacing: 1.35,
  },

  dailyArrow: {
    width: 34,
    height: 34,

    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.075)",

    backgroundColor: "rgba(255,255,255,0.025)",

    marginLeft: 12,
  },

  dailyMain: {
    width: "100%",

    paddingRight: 4,

    marginBottom: 21,
  },

  dailyTitle: {
    color: TXT,

    marginBottom: 5,
  },
  dailySubtitle: {
    color: MUTED,

    maxWidth: 480,

    paddingRight: 10,
  },

  dailyStats: {
    width: "100%",

    minHeight: 54,

    flexDirection: "row",

    alignItems: "center",

    borderTopWidth: 1,

    borderTopColor: "rgba(255,255,255,0.07)",

    paddingTop: 15,
  },

  dailyStat: {
    flex: 1,

    minWidth: 0,

    flexDirection: "row",

    alignItems: "center",
  },

  dailyIconOrb: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    borderWidth: 1,

    borderColor: "rgba(103,232,249,0.10)",

    backgroundColor: "rgba(103,232,249,0.045)",

    marginRight: 10,
  },

  dailyIconOrbActive: {
    borderColor: "rgba(103,232,249,0.18)",

    backgroundColor: "rgba(103,232,249,0.075)",

    boxShadow: `0px 0px 20px ${STREAK_ACCENT.glow}`,
  },

  dailyStatText: {
    flexDirection: "row",

    alignItems: "baseline",

    flexShrink: 1,

    minWidth: 0,
  },

  dailyStreakValue: {
    color: TXT,

    lineHeight: 20,

    marginRight: 5,
  },

  dailyStatLabel: {
    color: SOFT,

    flexShrink: 1,
  },

  dailyDivider: {
    width: 1,
    height: 30,

    flexShrink: 0,

    backgroundColor: "rgba(255,255,255,0.08)",

    marginHorizontal: 16,
  },

  dailyFreezeValue: {
    color: TXT,

    lineHeight: 20,

    marginRight: 5,
  },
  // ─────────────────────────────
  // MAIN ACTIVE CARD
  // ─────────────────────────────

  mainCardWrap: {
    marginBottom: 6,

    borderRadius: 30,

    overflow: "hidden",

    borderWidth: 1,

    backgroundColor: "rgba(2,3,6,0.30)",
  },

  mainCard: {
    minHeight: 206,

    padding: 20,

    position: "relative",

    overflow: "hidden",
  },

  mainAmbientGlow: {
    position: "absolute",

    top: -90,
    right: -62,

    width: 180,
    height: 180,

    borderRadius: 90,

    opacity: 0.08,
  },

  mainCardTopRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 22,
  },

  mainCardKickerPill: {
    minHeight: 30,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 10,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.08)",

    backgroundColor: "rgba(255,255,255,0.038)",
  },

  mainCardKickerDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    marginRight: 7,
  },

  mainCardKicker: {
    color: "rgba(241,245,249,0.52)",
  },

  mainArrowButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,
  },

  mainContent: {
    maxWidth: 620,
  },

  mainTitle: {
    color: TXT,

    marginBottom: 6,
  },

  mainNarrative: {
    color: MUTED,

    maxWidth: 560,
  },

  mainProgressBlock: {
    marginTop: 24,
  },

  mainProgressMeta: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 8,
  },

  mainProgressLabel: {
    color: SOFT,

    letterSpacing: 0.8,
  },

  mainProgressValue: {
    color: TXT,
  },

  mainProgressValueStart: {
    color: "rgba(103,232,249,0.78)",

    fontSize: 14,

    letterSpacing: 0.15,
  },

  mainProgressTrack: {
    height: 4,

    borderRadius: 2,

    overflow: "hidden",

    backgroundColor: "rgba(255,255,255,0.08)",
  },

  mainProgressFill: {
    height: "100%",

    borderRadius: 2,
  },

  mainFooterMeta: {
    marginTop: 26,

    flexDirection: "row",

    alignItems: "center",

    gap: 9,
  },

  mainFooterLabel: {
    color: SOFT,

    letterSpacing: 0.65,
  },

  mainFooterLine: {
    width: 34,
    height: 1,

    opacity: 0.72,
  },

  // ─────────────────────────────
  // SECTIONS
  // ─────────────────────────────

  protectionCardShell: {
    marginTop: 14,

    borderRadius: 24,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.16)",

    backgroundColor: "rgba(2,3,6,0.34)",

    boxShadow: "0px 10px 26px rgba(0,0,0,0.24)",
  },

  protectionCard: {
    padding: 18,

    position: "relative",

    overflow: "hidden",
  },

  protectionContent: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 13,
  },

  protectionIcon: {
    width: 42,
    height: 42,

    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.18)",

    backgroundColor: "rgba(103,232,249,0.075)",
  },

  protectionCopy: {
    flex: 1,
    minWidth: 0,
  },

  protectionTitle: {
    color: TXT,
  },

  protectionBody: {
    maxWidth: 600,

    marginTop: 5,

    color: MUTED,
  },

  protectionActions: {
    marginTop: 16,

    flexDirection: "row",
    justifyContent: "flex-end",

    gap: 10,
  },

  protectionActionsCompact: {
    flexDirection: "column",
  },

  protectionPrimaryAction: {
    minWidth: 176,
  },

  protectionSecondaryAction: {
    minWidth: 112,
  },

  sectionHeader: {
    marginTop: 30,
    marginBottom: 14,

    flexDirection: "row",

    alignItems: "flex-end",

    gap: 14,
  },

  sectionTitle: {
    color: "rgba(241,245,249,0.54)",

    letterSpacing: 1.15,
  },

  sectionSubtitle: {
    color: "rgba(241,245,249,0.30)",

    marginTop: 2,
  },

  sectionLineWrap: {
    flex: 1,

    height: 10,

    justifyContent: "center",

    position: "relative",

    marginBottom: 2,
  },

  sectionLineBase: {
    height: 1,

    backgroundColor: "rgba(255,255,255,0.055)",
  },

  sectionLineGlow: {
    position: "absolute",

    right: 0,

    width: 88,
    height: 1,

    opacity: 0.78,
  },

  // ─────────────────────────────
  // GRID
  // ─────────────────────────────

  grid: {
    gap: 15,
  },

  gridWide: {
    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "stretch",
  },

  // ─────────────────────────────
  // MODULE CARDS
  // ─────────────────────────────

  sequenceCardWrap: {
    minHeight: 150,

    borderRadius: 24,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: HAIRLINE,

    backgroundColor: "rgba(2,3,6,0.30)",

    boxShadow: "0px 10px 24px rgba(0,0,0,0.24)",
  },

  sequenceCard: {
    flex: 1,

    minHeight: 150,

    padding: 15,

    position: "relative",

    overflow: "hidden",
  },

  sequenceAmbientGlow: {
    position: "absolute",

    top: -52,
    right: -46,

    width: 126,
    height: 126,

    borderRadius: 63,

    opacity: 0.07,
  },

  sequenceTopRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 10,
  },

  sequenceIconBox: {
    width: 42,
    height: 42,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    overflow: "hidden",
  },

  sequenceIconText: {},

  sequencePlacePill: {
    maxWidth: "72%",

    paddingHorizontal: 9,

    paddingVertical: 5,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.06)",

    backgroundColor: "rgba(255,255,255,0.028)",
  },

  sequencePlace: {
    color: "rgba(241,245,249,0.34)",
  },

  sequenceTextBlock: {
    marginTop: 17,

    paddingRight: 8,
  },

  sequenceTitle: {
    color: TXT,
  },

  sequenceNarrative: {
    marginTop: 4,

    color: "rgba(241,245,249,0.68)",
  },

  sequenceFooter: {
    marginTop: "auto",

    paddingTop: 15,

    flexDirection: "row",

    alignItems: "center",

    gap: 10,
  },

  sequenceFooterLine: {
    flex: 1,

    height: 1,

    backgroundColor: "rgba(255,255,255,0.055)",

    overflow: "hidden",
  },

  sequenceFooterAccent: {
    width: 34,
    height: 1,

    opacity: 0.7,
  },

  sequenceArrow: {
    width: 30,
    height: 30,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.065)",

    backgroundColor: "rgba(255,255,255,0.025)",
  },
});
