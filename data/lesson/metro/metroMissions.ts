import type { ImmersionMission } from "../../../lib/immersion/missions";
import { getMetroLessonById } from "./metro";
import type { MetroChoice, MetroLesson } from "./type";

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
    title: "Demander la sortie",
    subtitle: "Trouve la bonne sortie.",
    access: "premium",
    duration: "3-5 min",
    objective: "Identifier ou sortir.",
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
    case "ask_exit":
    case "ask_transfer":
      break;
  }

  return lesson;
}
