import type { ImmersionMission } from "../../../lib/immersion/missions";
import { getMetroLessonById } from "./metro";
import type { MetroChoice, MetroLesson, MetroStep } from "./type";

export type MetroMissionScenarioKey =
  | "hongik_to_gangnam_full"
  | "myeongdong_to_itaewon_full"
  | "seoul_station_to_jamsil_full"
  | "ask_exit"
  | "ask_transfer"
  | "ask_time"
  | "ask_direction";

export type MetroMission = ImmersionMission<MetroMissionScenarioKey> & {
  lessonId: string;
  missionKind: "complete" | "mini";
};

export const DEFAULT_METRO_MISSION_ID = "hongik-gangnam";

export const metroMissions: MetroMission[] = [
  {
    id: DEFAULT_METRO_MISSION_ID,
    title: "Hongik → Gangnam",
    subtitle: "Un trajet direct pour demander la ligne, la durée et la sortie.",
    access: "free",
    duration: "5-7 min",
    objective: "Réussir un trajet complet jusqu’à Gangnam.",
    goals: ["Ligne", "Quai", "Durée", "Sortie"],
    scenarioKey: "hongik_to_gangnam_full",
    lessonId: "hongik_to_gangnam",
    missionKind: "complete",
  },
  {
    id: "myeongdong-itaewon",
    title: "Myeongdong → Itaewon",
    subtitle: "Un vrai trajet avec changement de ligne et sortie finale.",
    access: "premium",
    duration: "6-8 min",
    objective: "Réussir tout le trajet Myeongdong vers Itaewon.",
    goals: ["Départ", "Direction", "Correspondance", "Durée", "Sortie"],
    scenarioKey: "myeongdong_to_itaewon_full",
    lessonId: "myeongdong_to_itaewon",
    missionKind: "complete",
  },
  {
    id: "ask-exit",
    title: "Demander sa sortie",
    subtitle: "Trouve la bonne sortie.",
    access: "premium",
    duration: "3-5 min",
    objective: "Identifier la bonne sortie.",
    goals: ["Sortie", "Repère", "Merci"],
    scenarioKey: "ask_exit",
    lessonId: "hongik_to_gangnam",
    missionKind: "mini",
  },
  {
    id: "ask-transfer",
    title: "Vérifier une correspondance",
    subtitle: "Demande où changer.",
    access: "premium",
    duration: "3-5 min",
    objective: "Vérifier la correspondance sans parler du reste du trajet.",
    goals: ["Correspondance", "Direction", "Merci"],
    scenarioKey: "ask_transfer",
    lessonId: "myeongdong_to_itaewon",
    missionKind: "mini",
  },
  {
    id: "ask-time",
    title: "Demander la durée",
    subtitle: "Temps de trajet et nombre d’arrêts.",
    access: "premium",
    duration: "3-5 min",
    objective: "Demander uniquement la durée ou les arrêts.",
    goals: ["Durée", "Arrêts", "Merci"],
    scenarioKey: "ask_time",
    lessonId: "hongik_to_gangnam",
    missionKind: "mini",
  },
  {
    id: "ask-direction",
    title: "Direction vers Gangnam",
    subtitle: "Exprime toi et demande des renseignements",
    access: "premium",
    duration: "3-5 min",
    objective:
      "Demander oralement la direction de Gangnam, puis éventuellement la durée ou la correspondance.",
    goals: ["Direction", "Durée", "Correspondance", "Merci"],
    scenarioKey: "ask_direction",
    lessonId: "hongik_to_gangnam",
    missionKind: "mini",
  },
];

export function getMetroMissionById(
  missionId?: string | null,
): MetroMission | undefined {
  return metroMissions.find((mission) => mission.id === missionId);
}

export function getMetroMissionLesson(
  mission: MetroMission | undefined,
): MetroLesson | undefined {
  if (!mission) return undefined;

  const lesson = getMetroLessonById(mission.lessonId);
  if (!lesson) return undefined;

  return applyMetroMissionToLesson(cloneLesson(lesson), mission.scenarioKey);
}

function cloneLesson(lesson: MetroLesson): MetroLesson {
  return {
    ...lesson,
    steps: lesson.steps.map((step) => ({
      ...step,
      choices: step.choices?.map((choice) => ({ ...choice })),
    })),
  };
}

function applyMetroMissionToLesson(
  lesson: MetroLesson,
  scenarioKey: MetroMissionScenarioKey,
): MetroLesson {
  switch (scenarioKey) {
    case "hongik_to_gangnam_full":
      return createHongikCompleteLesson(lesson);
    case "myeongdong_to_itaewon_full":
      return createMyeongdongCompleteLesson(lesson);
    case "seoul_station_to_jamsil_full":
      return createSeoulJamsilCompleteLesson(lesson);
    case "ask_exit":
      return createAskExitLesson();
    case "ask_transfer":
      return createAskTransferLesson();
    case "ask_time":
      return createAskTimeLesson();
    case "ask_direction":
      return createAskDirectionLesson();
  }
}

function createHongikCompleteLesson(lesson: MetroLesson): MetroLesson {
  return createFocusedLesson(lesson, [
    { stepId: "start", keepChoiceIds: ["ask1"] },

    {
      stepId: "ia_intro_route",
      keepChoiceIds: ["repeat_intro", "ask_platform"],
    },

    {
      stepId: "ia_repeat_intro_route",
      keepChoiceIds: ["ask_platform_after_repeat"],
    },

    {
      stepId: "ia_platform_direction",
      keepChoiceIds: ["repeat_platform"],
      extraChoices: [
        getSourceChoice(lesson, "ia_intro_route", "ask_trip", "ia_trip_time"),
      ],
    },

    {
      stepId: "ia_repeat_platform_direction",
      keepChoiceIds: [],
      extraChoices: [
        getSourceChoice(lesson, "ia_intro_route", "ask_trip", "ia_trip_time"),
      ],
    },

    {
      stepId: "ia_trip_time",
      keepChoiceIds: ["repeat_trip", "ask_transfer_from_trip"],
    },

    {
      stepId: "ia_repeat_trip_time",
      keepChoiceIds: ["ask_transfer_after_trip_repeat"],
    },

    {
      stepId: "ia_transfer_info",
      keepChoiceIds: ["repeat_transfer", "ask_exit_after_transfer"],
    },

    {
      stepId: "ia_repeat_transfer_info",
      keepChoiceIds: ["ask_exit_after_transfer_repeat"],
    },

    {
      stepId: "ia_exit_info",
      keepChoiceIds: ["repeat_exit", "ask_more_exit", "thank_final"],
    },

    {
      stepId: "ia_repeat_exit_info",
      keepChoiceIds: [
        "ask_landmark_after_exit_repeat",
        "thank_after_exit_repeat",
      ],
    },

    {
      stepId: "ia_exit_landmark_info",
      keepChoiceIds: ["repeat_landmark", "thank_after_landmark"],
    },

    {
      stepId: "ia_repeat_exit_landmark_info",
      keepChoiceIds: ["thank_after_landmark_repeat"],
    },

    { stepId: "ia_end" },
  ]);
}

function createMyeongdongCompleteLesson(lesson: MetroLesson): MetroLesson {
  return createFocusedLesson(lesson, [
    { stepId: "start", keepChoiceIds: ["ask1"] },
    {
      stepId: "ia_intro_route",
      keepChoiceIds: ["repeat_intro", "ask_direction"],
    },
    {
      stepId: "ia_repeat_intro_route",
      keepChoiceIds: ["ask_direction_after_repeat"],
    },
    {
      stepId: "ia_line4_direction",
      keepChoiceIds: ["repeat_line4_direction", "ask_transfer_from_direction"],
    },
    {
      stepId: "ia_repeat_line4_direction",
      keepChoiceIds: ["ask_transfer_after_direction_repeat"],
    },
    {
      stepId: "ia_transfer_station",
      keepChoiceIds: ["repeat_transfer_station", "ask_line6_direction"],
    },
    {
      stepId: "ia_repeat_transfer_station",
      keepChoiceIds: ["ask_line6_after_transfer_repeat"],
    },
    {
      stepId: "ia_line6_direction",
      keepChoiceIds: ["repeat_line6_direction"],
      extraChoices: [
        getSourceChoice(
          lesson,
          "ia_transfer_station",
          "ask_time_from_transfer",
          "ia_trip_time",
        ),
      ],
    },
    {
      stepId: "ia_repeat_line6_direction",
      keepChoiceIds: [],
      extraChoices: [
        getSourceChoice(
          lesson,
          "ia_transfer_station",
          "ask_time_from_transfer",
          "ia_trip_time",
        ),
      ],
    },
    {
      stepId: "ia_trip_time",
      keepChoiceIds: ["repeat_trip", "ask_exit_from_trip"],
    },
    {
      stepId: "ia_repeat_trip_time",
      keepChoiceIds: ["ask_exit_after_trip_repeat"],
    },
    {
      stepId: "ia_exit_info",
      keepChoiceIds: ["repeat_exit", "thank_final"],
    },
    {
      stepId: "ia_repeat_exit_info",
      keepChoiceIds: ["thank_after_exit_repeat"],
    },
    { stepId: "ia_end" },
  ]);
}

function createSeoulJamsilCompleteLesson(lesson: MetroLesson): MetroLesson {
  return lesson;
}

function createAskExitLesson(): MetroLesson {
  return getRequiredLesson("hongik_to_gangnam", [
    { stepId: "start", keepChoiceIds: ["ask1"] },
    { stepId: "ia_intro_route", keepChoiceIds: ["ask_exit_direct"] },
    { stepId: "ia_exit_info", keepChoiceIds: ["repeat_exit", "thank_final"] },
    {
      stepId: "ia_repeat_exit_info",
      keepChoiceIds: ["thank_after_exit_repeat"],
    },
    { stepId: "ia_end" },
  ]);
}

function createAskTransferLesson(): MetroLesson {
  return getRequiredLesson("myeongdong_to_itaewon", [
    { stepId: "start", keepChoiceIds: ["ask1"] },
    { stepId: "ia_intro_route", keepChoiceIds: ["ask_transfer_direct"] },
    {
      stepId: "ia_transfer_station",
      keepChoiceIds: ["repeat_transfer_station", "thank_after_transfer"],
    },
    {
      stepId: "ia_repeat_transfer_station",
      keepChoiceIds: ["thank_after_transfer_repeat"],
    },
    { stepId: "ia_end" },
  ]);
}

function createAskTimeLesson(): MetroLesson {
  return getRequiredLesson("hongik_to_gangnam", [
    { stepId: "start", keepChoiceIds: ["ask1"] },
    { stepId: "ia_intro_route", keepChoiceIds: ["ask_trip"] },
    { stepId: "ia_trip_time", keepChoiceIds: ["repeat_trip", "thank_after_trip"] },
    {
      stepId: "ia_repeat_trip_time",
      keepChoiceIds: ["thank_after_trip_repeat"],
    },
    { stepId: "ia_end" },
  ]);
}

function createAskDirectionLesson(): MetroLesson {
  return getRequiredLesson("hongik_to_gangnam", [
    { stepId: "start", keepChoiceIds: ["ask1"] },
    {
      stepId: "ia_intro_route",
      keepChoiceIds: ["repeat_intro", "ask_platform", "ask_trip"],
    },
    {
      stepId: "ia_repeat_intro_route",
      keepChoiceIds: ["ask_platform_after_repeat"],
    },
    {
      stepId: "ia_platform_direction",
      keepChoiceIds: ["repeat_platform", "thank_after_platform"],
      extraChoices: [
        getSourceChoice(lessonFromId("hongik_to_gangnam"), "ia_intro_route", "ask_trip", "ia_trip_time"),
      ],
    },
    {
      stepId: "ia_repeat_platform_direction",
      keepChoiceIds: ["thank_after_platform_repeat"],
      extraChoices: [
        getSourceChoice(lessonFromId("hongik_to_gangnam"), "ia_intro_route", "ask_trip", "ia_trip_time"),
      ],
    },
    {
      stepId: "ia_trip_time",
      keepChoiceIds: ["repeat_trip", "ask_transfer_from_trip", "thank_after_trip"],
    },
    {
      stepId: "ia_repeat_trip_time",
      keepChoiceIds: ["ask_transfer_after_trip_repeat", "thank_after_trip_repeat"],
    },
    {
      stepId: "ia_transfer_info",
      keepChoiceIds: ["repeat_transfer", "thank_after_transfer"],
    },
    {
      stepId: "ia_repeat_transfer_info",
      keepChoiceIds: ["thank_after_transfer_repeat"],
    },
    { stepId: "ia_end" },
  ]);
}

function lessonFromId(lessonId: string): MetroLesson {
  const lesson = getMetroLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Missing metro lesson: ${lessonId}`);
  }
  return lesson;
}

function getRequiredLesson(
  lessonId: string,
  steps: Parameters<typeof createFocusedLesson>[1],
): MetroLesson {
  return createFocusedLesson(cloneLesson(lessonFromId(lessonId)), steps);
}

type FocusedStepConfig = {
  stepId: string;
  keepChoiceIds?: string[];
  extraChoices?: MetroChoice[];
};

function createFocusedLesson(
  lesson: MetroLesson,
  stepConfigs: FocusedStepConfig[],
): MetroLesson {
  const steps = stepConfigs.map((config) => {
    const sourceStep = lesson.steps.find((step) => step.id === config.stepId);
    if (!sourceStep) {
      throw new Error(`Missing metro step: ${config.stepId}`);
    }

    const keepChoiceIds = config.keepChoiceIds;
    const filteredChoices = keepChoiceIds
      ? (sourceStep.choices ?? []).filter((choice) => keepChoiceIds.includes(choice.id))
      : sourceStep.choices;

    return {
      ...sourceStep,
      choices: [...(filteredChoices ?? []), ...(config.extraChoices ?? [])],
    };
  });

  return {
    ...lesson,
    steps,
  };
}

function getSourceChoice(
  lesson: MetroLesson,
  stepId: string,
  choiceId: string,
  nextStepId?: string,
): MetroChoice {
  const step = lesson.steps.find((item) => item.id === stepId);
  const choice = step?.choices?.find((item) => item.id === choiceId);

  if (!choice) {
    throw new Error(`Missing metro choice: ${stepId}/${choiceId}`);
  }

  return nextStepId ? { ...choice, next: nextStepId } : { ...choice };
}
