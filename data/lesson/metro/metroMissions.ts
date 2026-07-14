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
    title: "Hongik -> Gangnam",
    subtitle: "Un trajet direct pour demander la ligne, la duree et la sortie.",
    access: "free",
    duration: "5-7 min",
    objective: "Reussir un trajet complet jusqu'a Gangnam.",
    goals: ["Ligne", "Quai", "Duree", "Sortie"],
    scenarioKey: "hongik_to_gangnam_full",
    lessonId: "hongik_to_gangnam",
    missionKind: "complete",
  },
  {
    id: "myeongdong-itaewon",
    title: "Myeongdong -> Itaewon",
    subtitle: "Un vrai trajet avec changement de ligne et sortie finale.",
    access: "premium",
    duration: "6-8 min",
    objective: "Reussir tout le trajet Myeongdong vers Itaewon.",
    goals: ["Depart", "Direction", "Correspondance", "Duree", "Sortie"],
    scenarioKey: "myeongdong_to_itaewon_full",
    lessonId: "myeongdong_to_itaewon",
    missionKind: "complete",
  },
  {
    id: "seoul-jamsil",
    title: "Seoul Station -> Jamsil",
    subtitle: "Trouver le bon trajet, verifier le temps et aller jusqu'a Jamsil.",
    access: "premium",
    duration: "5-7 min",
    objective: "Demander un itineraire complet jusqu'a Jamsil.",
    goals: ["Demander", "Transfert", "Temps", "Sortie"],
    scenarioKey: "seoul_station_to_jamsil_full",
    lessonId: "seoul_station_to_jamsil",
    missionKind: "complete",
  },
  {
    id: "ask-exit",
    title: "Demander sa sortie",
    subtitle: "Trouve la bonne sortie.",
    access: "premium",
    duration: "3-5 min",
    objective: "Identifier la bonne sortie.",
    goals: ["Sortie", "Repere", "Merci"],
    scenarioKey: "ask_exit",
    lessonId: "hongik_to_gangnam",
    missionKind: "mini",
  },
  {
    id: "ask-transfer",
    title: "Verifier une correspondance",
    subtitle: "Demande ou changer.",
    access: "premium",
    duration: "3-5 min",
    objective: "Verifier la correspondance sans parler du reste du trajet.",
    goals: ["Correspondance", "Direction", "Merci"],
    scenarioKey: "ask_transfer",
    lessonId: "myeongdong_to_itaewon",
    missionKind: "mini",
  },
  {
    id: "ask-time",
    title: "Demander la duree",
    subtitle: "Temps de trajet et nombre d'arrets.",
    access: "premium",
    duration: "3-5 min",
    objective: "Demander uniquement la duree ou les arrets.",
    goals: ["Duree", "Arrets", "Merci"],
    scenarioKey: "ask_time",
    lessonId: "hongik_to_gangnam",
    missionKind: "mini",
  },
  {
    id: "ask-direction",
    title: "Confirmer la direction",
    subtitle: "Verifie le bon sens avant de monter.",
    access: "premium",
    duration: "3-5 min",
    objective: "Confirmer uniquement la direction a prendre.",
    goals: ["Direction", "Ligne", "Merci"],
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
    { stepId: "ia_intro_route", keepChoiceIds: ["repeat_intro", "ask_platform"] },
    {
      stepId: "ia_repeat_intro_route",
      keepChoiceIds: ["ask_platform_after_repeat"],
    },
    {
      stepId: "ia_platform_direction",
      keepChoiceIds: ["repeat_platform"],
      extraChoices: [
        getSourceChoice(
          lesson,
          "ia_repeat_platform_direction_short",
          "ask_trip_after_short_platform",
          "ia_trip_time",
        ),
      ],
    },
    {
      stepId: "ia_repeat_platform_direction",
      keepChoiceIds: [],
      extraChoices: [
        getSourceChoice(
          lesson,
          "ia_repeat_platform_direction_short",
          "ask_trip_after_short_platform",
          "ia_trip_time",
        ),
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
    { stepId: "ia_exit_info", keepChoiceIds: ["repeat_exit", "thank_final"] },
    {
      stepId: "ia_repeat_exit_info",
      keepChoiceIds: ["thank_after_exit_repeat"],
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
      keepChoiceIds: ["ask_time_after_line6_repeat"],
    },
    {
      stepId: "ia_trip_time",
      keepChoiceIds: ["repeat_trip_time", "ask_station_count"],
    },
    {
      stepId: "ia_repeat_trip_time",
      keepChoiceIds: ["ask_station_count_after_repeat"],
    },
    {
      stepId: "ia_station_count",
      keepChoiceIds: ["repeat_station_count", "ask_exit_after_station_count"],
    },
    {
      stepId: "ia_repeat_station_count",
      keepChoiceIds: ["ask_exit_after_station_repeat"],
    },
    {
      stepId: "ia_exit_info",
      keepChoiceIds: ["repeat_exit"],
      extraChoices: [createThankChoice("thank_after_exit", "ia_end")],
    },
    {
      stepId: "ia_repeat_exit_info",
      keepChoiceIds: ["thank_after_exit_repeat"],
    },
    { stepId: "ia_end" },
  ]);
}

function createSeoulJamsilCompleteLesson(lesson: MetroLesson): MetroLesson {
  return createFocusedLesson(lesson, [
    { stepId: "start", keepChoiceIds: ["ask1"] },
    { stepId: "ia_intro", keepChoiceIds: ["repeat_intro", "ask_transfer"] },
    {
      stepId: "ia_intro_repeat",
      keepChoiceIds: ["ask_transfer_after_repeat"],
    },
    {
      stepId: "ia_transfer",
      keepChoiceIds: ["repeat_transfer", "ask_time_from_transfer"],
    },
    {
      stepId: "ia_transfer_repeat",
      keepChoiceIds: ["ask_time_after_transfer_repeat"],
    },
    { stepId: "ia_time", keepChoiceIds: ["repeat_time", "ask_exit_after_time"] },
    {
      stepId: "ia_time_repeat",
      keepChoiceIds: ["ask_exit_after_time_repeat"],
    },
    { stepId: "ia_exit", keepChoiceIds: ["repeat_exit", "thank_after_exit"] },
    {
      stepId: "ia_exit_repeat",
      keepChoiceIds: ["thank_after_exit_repeat"],
    },
    { stepId: "ia_end" },
  ]);
}

function createAskExitLesson(): MetroLesson {
  const hongikLesson = getMetroLessonById("hongik_to_gangnam");
  const myeongdongLesson = getMetroLessonById("myeongdong_to_itaewon");

  return createMiniLesson({
    id: "ask_exit",
    title: "Demander sa sortie",
    shortTitle: "Quelle sortie ?",
    situation:
      "Vous etes dans le metro a Seoul. Votre objectif est simple : demander uniquement quelle sortie prendre.",
    objective:
      "Choisir un trajet, demander la bonne sortie, verifier si besoin, puis remercier.",
    startText: "Choisissez le trajet pour lequel vous voulez demander la sortie.",
    choices: [
      {
        id: "choose_hongik_gangnam",
        label: "Hongik vers Gangnam",
        korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
        romanization:
          "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
        nextId: "ask_exit_hongik_ia_exit_info",
      },
      {
        id: "choose_myeongdong_itaewon",
        label: "Myeongdong vers Itaewon",
        korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
        romanization:
          "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
        nextId: "ask_exit_myeongdong_ia_exit_info",
      },
    ],
    steps: [
      ...buildMiniRouteSteps(hongikLesson, "ask_exit_hongik", [
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
      ]),
      ...buildMiniRouteSteps(myeongdongLesson, "ask_exit_myeongdong", [
        {
          stepId: "ia_exit_info",
          keepChoiceIds: ["repeat_exit", "ask_landmark_exit"],
          extraChoices: [
            createThankChoice("thank_after_exit", "ask_exit_myeongdong_ia_end"),
          ],
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
      ]),
    ],
  });
}

function createAskTransferLesson(): MetroLesson {
  const myeongdongLesson = getMetroLessonById("myeongdong_to_itaewon");

  return createMiniLesson({
    id: "ask_transfer",
    title: "Verifier une correspondance",
    shortTitle: "Correspondance",
    situation:
      "Vous allez de Myeongdong a Itaewon. Vous voulez seulement verifier ou changer de ligne.",
    objective:
      "Confirmer la station de correspondance et la direction de la ligne 6.",
    startText: "Demandez uniquement ou faire la correspondance.",
    choices: [
      {
        id: "ask_transfer_myeongdong",
        label: "Verifier la correspondance vers Itaewon",
        korean: "환승은 어디서 하나요?",
        romanization: "Hwanseung-eun eodiseo hanayo?",
        nextId: "ask_transfer_myeongdong_ia_transfer_station",
      },
    ],
    steps: [
      ...buildMiniRouteSteps(myeongdongLesson, "ask_transfer_myeongdong", [
        {
          stepId: "ia_transfer_station",
          keepChoiceIds: ["repeat_transfer_station", "ask_line6_direction"],
          extraChoices: [
            createThankChoice(
              "thank_after_transfer",
              "ask_transfer_myeongdong_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_repeat_transfer_station",
          keepChoiceIds: ["ask_line6_after_transfer_repeat"],
          extraChoices: [
            createThankChoice(
              "thank_after_transfer_repeat",
              "ask_transfer_myeongdong_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_line6_direction",
          keepChoiceIds: ["repeat_line6_direction"],
          extraChoices: [
            createThankChoice(
              "thank_after_line6_direction",
              "ask_transfer_myeongdong_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_repeat_line6_direction",
          keepChoiceIds: [],
          extraChoices: [
            createThankChoice(
              "thank_after_line6_repeat",
              "ask_transfer_myeongdong_ia_end",
            ),
          ],
        },
        { stepId: "ia_end" },
      ]),
    ],
  });
}

function createAskTimeLesson(): MetroLesson {
  const hongikLesson = getMetroLessonById("hongik_to_gangnam");
  const myeongdongLesson = getMetroLessonById("myeongdong_to_itaewon");

  return createMiniLesson({
    id: "ask_time",
    title: "Demander la duree",
    shortTitle: "Duree",
    situation:
      "Vous connaissez deja votre destination. Vous voulez seulement demander le temps de trajet.",
    objective: "Demander la duree ou le nombre d'arrets sans changer de sujet.",
    startText: "Choisissez le trajet pour lequel demander la duree.",
    choices: [
      {
        id: "choose_hongik_time",
        label: "Hongik vers Gangnam",
        korean: "강남역까지 시간이 얼마나 걸리나요?",
        romanization: "Gangnam-yeokkkaji sigani eolmana geollinayo?",
        nextId: "ask_time_hongik_ia_trip_time",
      },
      {
        id: "choose_myeongdong_time",
        label: "Myeongdong vers Itaewon",
        korean: "이태원역까지 시간이 얼마나 걸리나요?",
        romanization: "Itaewon-yeokkkaji sigani eolmana geollinayo?",
        nextId: "ask_time_myeongdong_ia_trip_time",
      },
    ],
    steps: [
      ...buildMiniRouteSteps(hongikLesson, "ask_time_hongik", [
        {
          stepId: "ia_trip_time",
          keepChoiceIds: ["repeat_trip"],
          extraChoices: [
            createThankChoice("thank_after_time", "ask_time_hongik_ia_end"),
          ],
        },
        {
          stepId: "ia_repeat_trip_time",
          keepChoiceIds: [],
          extraChoices: [
            createThankChoice(
              "thank_after_time_repeat",
              "ask_time_hongik_ia_end",
            ),
          ],
        },
        { stepId: "ia_end" },
      ]),
      ...buildMiniRouteSteps(myeongdongLesson, "ask_time_myeongdong", [
        {
          stepId: "ia_trip_time",
          keepChoiceIds: ["repeat_trip_time", "ask_station_count"],
          extraChoices: [
            createThankChoice(
              "thank_after_time",
              "ask_time_myeongdong_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_repeat_trip_time",
          keepChoiceIds: ["ask_station_count_after_repeat"],
          extraChoices: [
            createThankChoice(
              "thank_after_time_repeat",
              "ask_time_myeongdong_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_station_count",
          keepChoiceIds: ["repeat_station_count"],
          extraChoices: [
            createThankChoice(
              "thank_after_station_count",
              "ask_time_myeongdong_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_repeat_station_count",
          keepChoiceIds: ["thank_after_station_repeat"],
        },
        { stepId: "ia_end" },
      ]),
    ],
  });
}

function createAskDirectionLesson(): MetroLesson {
  const hongikLesson = getMetroLessonById("hongik_to_gangnam");
  const myeongdongLesson = getMetroLessonById("myeongdong_to_itaewon");

  return createMiniLesson({
    id: "ask_direction",
    title: "Confirmer la direction",
    shortTitle: "Direction",
    situation:
      "Vous etes dans le metro. Vous voulez seulement confirmer la bonne direction avant de monter.",
    objective: "Verifier le bon quai ou le bon sens de ligne.",
    startText: "Choisissez le trajet pour lequel confirmer la direction.",
    choices: [
      {
        id: "choose_hongik_direction",
        label: "Hongik vers Gangnam",
        korean: "강남 방향은 어느 쪽이에요?",
        romanization: "Gangnam banghyang-eun eoneu jjog-ieyo?",
        nextId: "ask_direction_hongik_ia_platform_direction",
      },
      {
        id: "choose_myeongdong_direction",
        label: "Myeongdong vers Itaewon",
        korean: "이태원 가려면 어느 방향으로 타야 하나요?",
        romanization: "Itaewon garyeomyeon eoneu banghyang-euro taya hanayo?",
        nextId: "ask_direction_myeongdong_ia_line4_direction",
      },
    ],
    steps: [
      ...buildMiniRouteSteps(hongikLesson, "ask_direction_hongik", [
        {
          stepId: "ia_platform_direction",
          keepChoiceIds: ["repeat_platform"],
          extraChoices: [
            createThankChoice(
              "thank_after_direction",
              "ask_direction_hongik_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_repeat_platform_direction",
          keepChoiceIds: [],
          extraChoices: [
            createThankChoice(
              "thank_after_direction_repeat",
              "ask_direction_hongik_ia_end",
            ),
          ],
        },
        { stepId: "ia_end" },
      ]),
      ...buildMiniRouteSteps(myeongdongLesson, "ask_direction_myeongdong", [
        {
          stepId: "ia_line4_direction",
          keepChoiceIds: ["repeat_line4_direction"],
          extraChoices: [
            getSourceChoice(
              myeongdongLesson,
              "ia_transfer_station",
              "ask_line6_direction",
              "ask_direction_myeongdong_ia_line6_direction",
            ),
          ],
        },
        {
          stepId: "ia_repeat_line4_direction",
          keepChoiceIds: [],
          extraChoices: [
            getSourceChoice(
              myeongdongLesson,
              "ia_transfer_station",
              "ask_line6_direction",
              "ask_direction_myeongdong_ia_line6_direction",
            ),
          ],
        },
        {
          stepId: "ia_line6_direction",
          keepChoiceIds: ["repeat_line6_direction"],
          extraChoices: [
            createThankChoice(
              "thank_after_direction",
              "ask_direction_myeongdong_ia_end",
            ),
          ],
        },
        {
          stepId: "ia_repeat_line6_direction",
          keepChoiceIds: [],
          extraChoices: [
            createThankChoice(
              "thank_after_direction_repeat",
              "ask_direction_myeongdong_ia_end",
            ),
          ],
        },
        { stepId: "ia_end" },
      ]),
    ],
  });
}

type MiniLessonConfig = {
  id: string;
  title: string;
  shortTitle: string;
  situation: string;
  objective: string;
  startText: string;
  choices: MetroChoice[];
  steps: MetroStep[];
};

function createMiniLesson(config: MiniLessonConfig): MetroLesson {
  return {
    id: config.id,
    title: config.title,
    shortTitle: config.shortTitle,
    situation: config.situation,
    objective: config.objective,
    steps: [
      {
        id: "start",
        speaker: "ai",
        phase: "Accueil",
        text: config.startText,
        french: config.startText,
        choices: config.choices,
      },
      ...config.steps,
    ],
  };
}

function createFocusedLesson(
  lesson: MetroLesson,
  configs: MiniStepConfig[],
): MetroLesson {
  return {
    ...lesson,
    steps: configs
      .map((config) => createFocusedStep(lesson, config))
      .filter((step): step is MetroStep => !!step),
  };
}

type MiniStepConfig = {
  stepId: string;
  keepChoiceIds?: string[];
  extraChoices?: MetroChoice[];
};

function buildMiniRouteSteps(
  lesson: MetroLesson | undefined,
  prefix: string,
  configs: MiniStepConfig[],
): MetroStep[] {
  if (!lesson) return [];

  return configs
    .map((config) => createPrefixedStep(lesson, prefix, config))
    .filter((step): step is MetroStep => !!step);
}

function createFocusedStep(
  lesson: MetroLesson,
  config: MiniStepConfig,
): MetroStep | undefined {
  const sourceStep = lesson.steps.find((step) => step.id === config.stepId);
  if (!sourceStep) return undefined;

  const allowedChoiceIds = config.keepChoiceIds
    ? new Set(config.keepChoiceIds)
    : undefined;

  const choices = sourceStep.choices
    ?.filter((choice) => !allowedChoiceIds || allowedChoiceIds.has(choice.id))
    .map((choice) => ({ ...choice }));

  return {
    ...sourceStep,
    choices: [...(choices ?? []), ...(config.extraChoices ?? [])],
  };
}

function createPrefixedStep(
  lesson: MetroLesson,
  prefix: string,
  config: MiniStepConfig,
): MetroStep | undefined {
  const sourceStep = lesson.steps.find((step) => step.id === config.stepId);
  if (!sourceStep) return undefined;

  const allowedChoiceIds = config.keepChoiceIds
    ? new Set(config.keepChoiceIds)
    : undefined;

  const choices = sourceStep.choices
    ?.filter((choice) => !allowedChoiceIds || allowedChoiceIds.has(choice.id))
    .map((choice) => ({
      ...choice,
      nextId: `${prefix}_${choice.nextId}`,
    }));

  return {
    ...sourceStep,
    id: `${prefix}_${sourceStep.id}`,
    choices: [...(choices ?? []), ...(config.extraChoices ?? [])],
  };
}

function getSourceChoice(
  lesson: MetroLesson | undefined,
  stepId: string,
  choiceId: string,
  nextId?: string,
): MetroChoice {
  const choice = lesson?.steps
    .find((step) => step.id === stepId)
    ?.choices?.find((item) => item.id === choiceId);

  if (!choice) {
    throw new Error(`Missing metro choice ${stepId}.${choiceId}`);
  }

  return {
    ...choice,
    nextId: nextId ?? choice.nextId,
  };
}

function createThankChoice(id: string, nextId: string): MetroChoice {
  return {
    id,
    label: "Merci beaucoup, j'ai compris.",
    korean: "감사합니다, 이해했어요.",
    romanization: "Gamsahamnida, ihaehaesseoyo.",
    nextId,
  };
}
