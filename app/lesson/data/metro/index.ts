import hongikToGangnamLesson from "./hongikToGangnam";
import myeongdongToItaewonLesson from "./myeongdongToItaewon";
import seoulStationToJamsilLesson from "./seoulStationToJamsil";
import type { MetroLesson, MetroState, MetroStep } from "./type";

export type {
  MetroChoice,
  MetroLesson,
  MetroPhase,
  MetroState,
  MetroStep
} from "./type";

export const metroLessons: MetroLesson[] = [
  hongikToGangnamLesson,
  myeongdongToItaewonLesson,
  seoulStationToJamsilLesson,
];

export const metroLessonsMap: Record<string, MetroLesson> = {
  [hongikToGangnamLesson.id]: hongikToGangnamLesson,
  [myeongdongToItaewonLesson.id]: myeongdongToItaewonLesson,
  [seoulStationToJamsilLesson.id]: seoulStationToJamsilLesson,
};

export function getMetroLessonById(id: string): MetroLesson | undefined {
  return metroLessonsMap[id];
}

export function getMetroStepById(
  lesson: MetroLesson,
  stepId: string,
): MetroStep | undefined {
  return lesson.steps.find((step) => step.id === stepId);
}

export function createInitialMetroState(lesson: MetroLesson): MetroState {
  const firstStep = getMetroStepById(lesson, "start");

  return {
    lessonId: lesson.id,
    currentStepId: "start",
    history: firstStep ? [firstStep] : [],
    finished: false,
  };
}

export function getNextMetroState(
  lesson: MetroLesson,
  currentState: MetroState,
  nextStepId: string,
): MetroState {
  const nextStep = getMetroStepById(lesson, nextStepId);

  if (!nextStep) {
    return currentState;
  }

  return {
    ...currentState,
    lessonId: lesson.id,
    currentStepId: nextStepId,
    history: [...currentState.history, nextStep],
    finished: nextStepId === "ia_end",
  };
}
