import type { ImmersionMission } from "../../../lib/immersion/missions";
import { getMetroLessonById } from "./metro";
import type { MetroChoice, MetroLesson, MetroStep } from "./type";

export type MetroMissionScenarioKey =
  | "hongik_to_gangnam"
  | "myeongdong_to_itaewon"
  | "seoul_station_to_jamsil"
  | "ask_exit"
  | "ask_transfer";

export type MetroMission = ImmersionMission<MetroMissionScenarioKey> & {
  lessonId: string;
};

export const DEFAULT_METRO_MISSION_ID = "hongik-gangnam";

export const metroMissions: MetroMission[] = [
  {
    id: DEFAULT_METRO_MISSION_ID,
    title: "Hongik vers Gangnam",
    subtitle: "Demande ton chemin en metro.",
    access: "free",
    duration: "3-5 min",
    objective: "Comprendre la ligne et la duree.",
    goals: ["Demander", "Ligne", "Duree"],
    scenarioKey: "hongik_to_gangnam",
    lessonId: "hongik_to_gangnam",
  },
  {
    id: "myeongdong-itaewon",
    title: "Myeongdong vers Itaewon",
    subtitle: "Gere une correspondance.",
    access: "premium",
    duration: "4-6 min",
    objective: "Changer de ligne sans paniquer.",
    goals: ["Ligne", "Correspondance", "Sortie"],
    scenarioKey: "myeongdong_to_itaewon",
    lessonId: "myeongdong_to_itaewon",
  },
  {
    id: "seoul-jamsil",
    title: "Seoul Station vers Jamsil",
    subtitle: "Trouve le bon trajet.",
    access: "premium",
    duration: "4-6 min",
    objective: "Demander un itineraire complet.",
    goals: ["Demander", "Transfert", "Temps"],
    scenarioKey: "seoul_station_to_jamsil",
    lessonId: "seoul_station_to_jamsil",
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
  },
  {
    id: "ask-transfer",
    title: "Verifier une correspondance",
    subtitle: "Demande ou changer.",
    access: "premium",
    duration: "3-5 min",
    objective: "Verifier avant de monter.",
    goals: ["Ligne", "Direction", "Transfert"],
    scenarioKey: "ask_transfer",
    lessonId: "myeongdong_to_itaewon",
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

function keepStepChoices(
  lesson: MetroLesson,
  stepId: string,
  choiceIds: string[],
) {
  const step = lesson.steps.find((item) => item.id === stepId);
  if (!step?.choices) return;

  const allowed = new Set(choiceIds);
  step.choices = step.choices.filter((choice: MetroChoice) =>
    allowed.has(choice.id),
  );
}

function applyMetroMissionToLesson(
  lesson: MetroLesson,
  scenarioKey: MetroMissionScenarioKey,
): MetroLesson {
  switch (scenarioKey) {
    case "hongik_to_gangnam":
      keepStepChoices(lesson, "start", ["ask1"]);
      keepStepChoices(lesson, "ia_intro_route", ["ask_trip"]);
      keepStepChoices(lesson, "ia_repeat_intro_route", [
        "ask_trip_after_repeat",
      ]);
      keepStepChoices(lesson, "ia_repeat_intro_route_slow", [
        "go_trip_after_slow",
      ]);
      keepStepChoices(lesson, "ia_trip_time", ["repeat_trip"]);
      keepStepChoices(lesson, "ia_repeat_trip_time", ["repeat_trip_2"]);
      keepStepChoices(lesson, "ia_repeat_trip_time_short", [
        "thank_after_trip_short",
      ]);
      break;
    case "myeongdong_to_itaewon":
    case "seoul_station_to_jamsil":
    case "ask_transfer":
      break;
    case "ask_exit":
      return createAskExitLesson();
  }

  return lesson;
}

function createAskExitLesson(): MetroLesson {
  const hongikLesson = getMetroLessonById("hongik_to_gangnam");
  const myeongdongLesson = getMetroLessonById("myeongdong_to_itaewon");

  const hongikPrefix = "ask_exit_hongik";
  const myeongdongPrefix = "ask_exit_myeongdong";

  return {
    id: "ask_exit",
    title: "Demander sa sortie",
    shortTitle: "Quelle sortie ?",
    situation:
      "Vous etes dans le metro a Seoul. Votre objectif est simple : demander uniquement quelle sortie prendre.",
    objective:
      "Choisir un trajet, demander la bonne sortie, verifier si besoin, puis remercier.",
    steps: [
      {
        id: "start",
        speaker: "ai",
        phase: "Accueil",
        text: "Choisissez le trajet pour lequel vous voulez demander la sortie.",
        french:
          "Choisissez le trajet pour lequel vous voulez demander la sortie.",
        choices: [
          {
            id: "choose_hongik_gangnam",
            label: "Hongik vers Gangnam",
            korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
            romanization:
              "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
            nextId: `${hongikPrefix}_ia_exit_info`,
          },
          {
            id: "choose_myeongdong_itaewon",
            label: "Myeongdong vers Itaewon",
            korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
            romanization:
              "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
            nextId: `${myeongdongPrefix}_ia_exit_info`,
          },
        ],
      },
      ...buildAskExitRouteSteps(hongikLesson, hongikPrefix, [
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
      ...buildAskExitRouteSteps(myeongdongLesson, myeongdongPrefix, [
        {
          stepId: "ia_exit_info",
          keepChoiceIds: ["repeat_exit", "ask_landmark_exit"],
          extraChoices: [
            {
              id: "thank_after_exit",
              label: "Merci beaucoup, j'ai tout compris !",
              korean: "감사합니다, 다 이해했어요!",
              romanization: "Gamsahamnida, da ihaehaesseoyo!",
              nextId: `${myeongdongPrefix}_ia_end`,
            },
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
  };
}

type AskExitStepConfig = {
  stepId: string;
  keepChoiceIds?: string[];
  extraChoices?: MetroChoice[];
};

function buildAskExitRouteSteps(
  lesson: MetroLesson | undefined,
  prefix: string,
  configs: AskExitStepConfig[],
): MetroStep[] {
  if (!lesson) return [];

  return configs
    .map((config) => createPrefixedStep(lesson, prefix, config))
    .filter((step): step is MetroStep => !!step);
}

function createPrefixedStep(
  lesson: MetroLesson,
  prefix: string,
  config: AskExitStepConfig,
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
