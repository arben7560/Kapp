import type { TeacherMode } from "../types/teacher.types.js";
import { cafeScenarioContext } from "./cafeScenario.js";
import { restaurantScenarioContext } from "./restaurantScenario.js";
import { metroScenarioContext } from "./metroScenario.js";

export function getScenarioContext(mode: TeacherMode): string | undefined {
  if (mode === "cafe") return cafeScenarioContext;
  if (mode === "restaurant") return restaurantScenarioContext;
  if (mode === "metro") return metroScenarioContext;
  return undefined;
}
