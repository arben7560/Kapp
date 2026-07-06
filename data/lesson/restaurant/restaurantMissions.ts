import type { ImmersionMission } from "../../../lib/immersion/missions";
import type { DialogueChoice, DialogueScenario } from "./restaurant";

export type RestaurantMissionScenarioKey =
  | "order_simple"
  | "ask_recommendation"
  | "choose_grill"
  | "add_sides"
  | "pay_receipt";

export type RestaurantMission = ImmersionMission<RestaurantMissionScenarioKey>;

export const DEFAULT_RESTAURANT_MISSION_ID = "order-simple";

export const restaurantMissions: RestaurantMission[] = [
  {
    id: DEFAULT_RESTAURANT_MISSION_ID,
    title: "Commander un plat simple",
    subtitle: "Choisis une viande et paie.",
    access: "free",
    duration: "3-4 min",
    objective: "Commander sans te perdre.",
    goals: ["Commander", "Confirmer", "Payer"],
    scenarioKey: "order_simple",
  },
  {
    id: "ask-recommendation",
    title: "Demander une recommandation",
    subtitle: "Laisse le serveur conseiller.",
    access: "premium",
    duration: "4-6 min",
    objective: "Choisir apres conseil.",
    goals: ["Demander", "Choisir", "Confirmer"],
    scenarioKey: "ask_recommendation",
  },
  {
    id: "choose-grill",
    title: "Gerer la cuisson",
    subtitle: "Demande de l'aide au grill.",
    access: "premium",
    duration: "4-6 min",
    objective: "Reagir pendant le repas.",
    goals: ["Commander", "Demander aide", "Continuer"],
    scenarioKey: "choose_grill",
  },
  {
    id: "add-sides",
    title: "Ajouter des accompagnements",
    subtitle: "Demande un extra.",
    access: "premium",
    duration: "4-6 min",
    objective: "Ajouter quelque chose naturellement.",
    goals: ["Choisir", "Ajouter", "Confirmer"],
    scenarioKey: "add_sides",
  },
  {
    id: "pay-receipt",
    title: "Payer et demander le ticket",
    subtitle: "Finis le repas proprement.",
    access: "premium",
    duration: "3-5 min",
    objective: "Payer sans hesitation.",
    goals: ["Payer", "Ticket", "Remercier"],
    scenarioKey: "pay_receipt",
  },
];

export function getRestaurantMissionById(
  missionId?: string | null,
): RestaurantMission | undefined {
  return restaurantMissions.find((mission) => mission.id === missionId);
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

export function getRestaurantMissionScenario(
  scenario: DialogueScenario,
  scenarioKey: RestaurantMissionScenarioKey,
): DialogueScenario {
  const missionScenario = cloneScenario(scenario);

  switch (scenarioKey) {
    case "order_simple":
      keepChoices(missionScenario, "ped_meat_choice", [
        "ped_order_samgyeopsal",
      ]);
      keepChoices(missionScenario, "ped_grill_choice_samgyeopsal", [
        "ped_self_grill_samgyeopsal",
      ]);
      keepChoices(missionScenario, "ped_side_choice", ["ped_no_side"]);
      keepChoices(missionScenario, "ped_extra_choice", ["ped_no_extra"]);
      break;
    case "ask_recommendation":
      keepChoices(missionScenario, "ped_meat_choice", [
        "ped_order_recommendation",
      ]);
      break;
    case "choose_grill":
      keepChoices(missionScenario, "ped_grill_choice_samgyeopsal", [
        "ped_staff_grill_samgyeopsal",
      ]);
      keepChoices(missionScenario, "ped_grill_choice_galbi", [
        "ped_staff_grill_galbi",
      ]);
      break;
    case "add_sides":
      keepChoices(missionScenario, "ped_side_choice", ["ped_add_doenjang"]);
      keepChoices(missionScenario, "ped_extra_choice", ["ped_more_lettuce"]);
      break;
    case "pay_receipt":
      keepChoices(missionScenario, "ped_payment_choice", ["ped_pay_card"]);
      keepChoices(missionScenario, "ped_receipt_choice", ["ped_receipt_yes"]);
      break;
  }

  return missionScenario;
}
