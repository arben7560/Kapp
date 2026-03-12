import { cafeSteps } from "./cafeScenario";

export function getCafeStep(stepId: string) {
  return cafeSteps[stepId];
}

export function getNextCafeStepId(stepId: string, choiceId: string) {
  const step = cafeSteps[stepId];
  return step?.nextStepByChoice?.[choiceId] ?? "end";
}
