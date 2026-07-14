import type { DialogueChoice, DialogueScenario } from "./cafe";
import type { ImmersionMission } from "../../../lib/immersion/missions";

export type CafeMissionScenarioKey =
  | "order_simple"
  | "order_dessert"
  | "order_takeout"
  | "modify_order"
  | "ask_recommendation";

export type CafeMission = ImmersionMission<CafeMissionScenarioKey>;

export const DEFAULT_CAFE_MISSION_ID = "order-simple";

export const cafeMissions: CafeMission[] = [
  {
    id: DEFAULT_CAFE_MISSION_ID,
    title: "Commander un cafe simple",
    subtitle: "Une commande courte, sur place.",
    access: "free",
    duration: "2-3 min",
    objective: "Commander une boisson et payer.",
    skills: ["Commander", "Confirmer", "Payer"],
    goals: ["Commander", "Dire sur place", "Payer"],
    scenarioKey: "order_simple",
  },
  {
    id: "order-dessert",
    title: "Commander cafe + dessert",
    subtitle: "Ajoute un dessert a ta commande.",
    access: "premium",
    duration: "3-5 min",
    objective: "Commander une boisson + un dessert.",
    skills: ["Commander", "Ajouter", "Confirmer"],
    goals: ["Choisir", "Confirmer", "Payer"],
    scenarioKey: "order_dessert",
  },
  {
    id: "order-takeout",
    title: "Commander a emporter",
    subtitle: "Demande l'option a emporter.",
    access: "premium",
    duration: "3-5 min",
    objective: "Commander puis repartir avec ta commande.",
    skills: ["Commander", "A emporter", "Payer"],
    goals: ["Commander", "Demander a emporter", "Payer"],
    scenarioKey: "order_takeout",
  },
];

export function getCafeMissionById(
  missionId?: string | null,
): CafeMission | undefined {
  return cafeMissions.find((mission) => mission.id === missionId);
}

export function getDefaultCafeMission() {
  return cafeMissions[0];
}

function cloneScenario(scenario: DialogueScenario): DialogueScenario {
  const nodes: DialogueScenario["nodes"] = {};

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    nodes[nodeId] = {
      ...node,
      choices: node.choices?.map((choice) => ({ ...choice })),
    };
  }

  return { ...scenario, nodes };
}

function keepChoices(
  scenario: DialogueScenario,
  nodeId: string,
  choiceIds: string[],
) {
  const node = scenario.nodes[nodeId];
  if (!node?.choices) return;

  const allowed = new Set(choiceIds);
  node.choices = node.choices.filter((choice: DialogueChoice) =>
    allowed.has(choice.id),
  );
}

export function getCafeMissionScenario(
  scenario: DialogueScenario,
  scenarioKey: CafeMissionScenarioKey,
): DialogueScenario {
  const missionScenario = cloneScenario(scenario);

  switch (scenarioKey) {
    case "order_simple":
      keepChoices(missionScenario, "ped_choice1", ["ped_order1", "repeat_ped1"]);
      keepChoices(missionScenario, "ped_choice2_drink", [
        "ped_here_drink",
        "repeat_ped2_drink",
      ]);
      keepChoices(missionScenario, "real_choice1", [
        "real_order1",
        "repeat_real1",
      ]);
      keepChoices(missionScenario, "real_choice2_drink", [
        "real_here_drink",
        "repeat_real2_drink",
      ]);
      break;

    case "order_dessert":
      keepChoices(missionScenario, "ped_choice1", ["ped_order2", "repeat_ped1"]);
      keepChoices(missionScenario, "ped_choice2_cake", [
        "ped_here_cake",
        "repeat_ped2_cake",
      ]);
      keepChoices(missionScenario, "real_choice1", [
        "real_order2",
        "repeat_real1",
      ]);
      keepChoices(missionScenario, "real_choice2_cake", [
        "real_here_cake",
        "repeat_real2_cake",
      ]);
      break;

    case "order_takeout":
      keepChoices(missionScenario, "ped_choice2_drink", [
        "ped_takeout_drink",
        "repeat_ped2_drink",
      ]);
      keepChoices(missionScenario, "ped_choice2_cake", [
        "ped_takeout_cake",
        "repeat_ped2_cake",
      ]);
      keepChoices(missionScenario, "real_choice2_drink", [
        "real_takeout_drink",
        "repeat_real2_drink",
      ]);
      keepChoices(missionScenario, "real_choice2_cake", [
        "real_takeout_cake",
        "repeat_real2_cake",
      ]);
      break;

    case "modify_order":
    case "ask_recommendation":
      break;
  }

  return missionScenario;
}
