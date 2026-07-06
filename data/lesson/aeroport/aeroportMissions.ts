import type { ImmersionMission } from "../../../lib/immersion/missions";

export type AeroportMissionScenarioKey =
  | "go_seoul_station"
  | "buy_tmoney"
  | "choose_arex"
  | "find_platform"
  | "lost_help";

export type AeroportMission = ImmersionMission<AeroportMissionScenarioKey>;

export const DEFAULT_AEROPORT_MISSION_ID = "go-seoul-station";

export const aeroportMissions: AeroportMission[] = [
  {
    id: DEFAULT_AEROPORT_MISSION_ID,
    title: "Aller a Seoul Station",
    subtitle: "Demande le chemin depuis Incheon.",
    access: "free",
    duration: "3-5 min",
    objective: "Trouver le train vers Seoul Station.",
    goals: ["Demander", "Comprendre", "Partir"],
    scenarioKey: "go_seoul_station",
  },
  {
    id: "buy-tmoney",
    title: "Acheter une T-money",
    subtitle: "Demande et recharge une carte.",
    access: "premium",
    duration: "4-6 min",
    objective: "Gerer la carte transport.",
    goals: ["Acheter", "Recharger", "Continuer"],
    scenarioKey: "buy_tmoney",
  },
  {
    id: "choose-arex",
    title: "Choisir l'AREX",
    subtitle: "Demande le bon train.",
    access: "premium",
    duration: "4-6 min",
    objective: "Choisir le train adapte.",
    goals: ["AREX", "Quai", "Temps"],
    scenarioKey: "choose_arex",
  },
  {
    id: "find-platform",
    title: "Trouver le quai",
    subtitle: "Verifie ou monter.",
    access: "premium",
    duration: "3-5 min",
    objective: "Rejoindre le bon quai.",
    goals: ["Quai", "Verifier", "Monter"],
    scenarioKey: "find_platform",
  },
  {
    id: "lost-help",
    title: "Demander de l'aide",
    subtitle: "Tu es perdu dans l'aeroport.",
    access: "premium",
    duration: "3-5 min",
    objective: "Retrouver ton chemin.",
    goals: ["Expliquer", "Comprendre", "Repartir"],
    scenarioKey: "lost_help",
  },
];

export function getAeroportMissionById(
  missionId?: string | null,
): AeroportMission | undefined {
  return aeroportMissions.find((mission) => mission.id === missionId);
}

type ChoiceLike = {
  id: string;
};

type NodeLike = {
  choices?: ChoiceLike[];
};

type ScenarioLike = {
  nodes: Record<string, NodeLike>;
};

function keepChoices(
  scenario: ScenarioLike,
  nodeId: string,
  choiceIds: string[],
) {
  const node = scenario.nodes[nodeId];
  if (!node?.choices) return;

  const allowed = new Set(choiceIds);
  node.choices = node.choices.filter((choice) => allowed.has(choice.id));
}

export function applyAeroportMissionToScenario<TScenario extends ScenarioLike>(
  scenario: TScenario,
  scenarioKey: AeroportMissionScenarioKey,
): TScenario {
  switch (scenarioKey) {
    case "go_seoul_station":
      keepChoices(scenario, "user_start", ["choice_ask_seoul_station"]);
      keepChoices(scenario, "user_after_welcome", ["choice_ready"]);
      keepChoices(scenario, "user_after_transport", ["choice_which_train"]);
      keepChoices(scenario, "user_after_recommend", [
        "choice_time_after_recommend",
      ]);
      keepChoices(scenario, "user_after_time", ["choice_summary_after_time"]);
      keepChoices(scenario, "user_after_summary", [
        "choice_thanks_after_summary",
      ]);
      break;
    case "buy_tmoney":
      keepChoices(scenario, "user_after_welcome", ["choice_tmoney"]);
      keepChoices(scenario, "user_after_tmoney", ["choice_charge"]);
      break;
    case "choose_arex":
      keepChoices(scenario, "user_start", ["choice_ask_arex"]);
      keepChoices(scenario, "user_after_welcome", ["choice_tmoney"]);
      keepChoices(scenario, "user_after_tmoney", ["choice_tmoney_arex"]);
      break;
    case "find_platform":
      keepChoices(scenario, "user_after_transport", ["choice_platform"]);
      keepChoices(scenario, "user_after_platform", ["choice_verify_train"]);
      break;
    case "lost_help":
      keepChoices(scenario, "user_after_time", ["choice_lost_after_time"]);
      keepChoices(scenario, "user_after_lost", ["choice_summary_after_lost"]);
      break;
  }

  return scenario;
}
