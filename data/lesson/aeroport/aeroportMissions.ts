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
  nextNodeId: string;
  [key: string]: unknown;
};

type NodeLike = {
  id: string;
  nextNodeId?: string | null;
  choices?: ChoiceLike[];
  [key: string]: unknown;
};

type ScenarioLike = {
  startNodeId: string;
  nodes: Record<string, NodeLike>;
};

function cloneChoice(choice: ChoiceLike | undefined): ChoiceLike | undefined {
  return choice ? { ...choice } : undefined;
}

function getChoice(
  scenario: ScenarioLike,
  nodeId: string,
  choiceId: string,
) {
  return scenario.nodes[nodeId]?.choices?.find(
    (choice) => choice.id === choiceId,
  );
}

function selectChoices(
  node: NodeLike | undefined,
  choiceIds: string[],
  extraChoices: ChoiceLike[] = [],
): ChoiceLike[] {
  const allowed = new Set(choiceIds);
  const choices =
    node?.choices
      ?.filter((choice) => allowed.has(choice.id))
      .map((choice) => ({ ...choice })) ?? [];

  const usedIds = new Set(choices.map((choice) => choice.id));

  for (const choice of extraChoices) {
    if (usedIds.has(choice.id)) continue;
    choices.push({ ...choice });
    usedIds.add(choice.id);
  }

  return choices;
}

function keepChoices(
  scenario: ScenarioLike,
  nodeId: string,
  choiceIds: string[],
  extraChoices: ChoiceLike[] = [],
) {
  const node = scenario.nodes[nodeId];
  if (!node?.choices) return;

  node.choices = selectChoices(node, choiceIds, extraChoices);
}

function redirectRepeatToCleanChoices(
  scenario: ScenarioLike,
  repeatNodeId: string,
  sourceChoiceNodeId: string,
  cleanChoiceNodeId: string,
  continuationChoiceIds: string[],
  extraChoices: ChoiceLike[] = [],
) {
  const repeatNode = scenario.nodes[repeatNodeId];
  const sourceChoiceNode = scenario.nodes[sourceChoiceNodeId];
  if (!repeatNode || !sourceChoiceNode) return;

  scenario.nodes[cleanChoiceNodeId] = {
    ...sourceChoiceNode,
    id: cleanChoiceNodeId,
    choices: selectChoices(
      sourceChoiceNode,
      continuationChoiceIds,
      extraChoices,
    ),
  };
  repeatNode.nextNodeId = cleanChoiceNodeId;
}

function getThanksChoice(scenario: ScenarioLike) {
  return cloneChoice(
    getChoice(scenario, "user_after_lost", "choice_thanks_after_lost"),
  );
}

function pruneUnreachableNodes(scenario: ScenarioLike) {
  const reachable = new Set<string>();
  const stack = [scenario.startNodeId];

  while (stack.length > 0) {
    const nodeId = stack.pop();
    if (!nodeId || reachable.has(nodeId)) continue;

    const node = scenario.nodes[nodeId];
    if (!node) continue;

    reachable.add(nodeId);

    if (node.nextNodeId) {
      stack.push(node.nextNodeId);
    }

    for (const choice of node.choices ?? []) {
      if (choice.nextNodeId) {
        stack.push(choice.nextNodeId);
      }
    }
  }

  for (const nodeId of Object.keys(scenario.nodes)) {
    if (!reachable.has(nodeId)) {
      delete scenario.nodes[nodeId];
    }
  }
}

export function applyAeroportMissionToScenario<TScenario extends ScenarioLike>(
  scenario: TScenario,
  scenarioKey: AeroportMissionScenarioKey,
): TScenario {
  const thanksChoice = getThanksChoice(scenario);

  switch (scenarioKey) {
    case "go_seoul_station":
      keepChoices(scenario, "user_start", ["choice_ask_seoul_station"]);
      keepChoices(scenario, "user_after_welcome", [
        "repeat_welcome",
        "choice_ready",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_welcome_repeat",
        "user_after_welcome",
        "user_after_welcome_after_repeat",
        ["choice_ready"],
      );
      keepChoices(scenario, "user_after_transport", [
        "repeat_transport",
        "choice_which_train",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_transport_repeat",
        "user_after_transport",
        "user_after_transport_after_repeat",
        ["choice_which_train"],
      );
      keepChoices(scenario, "user_after_recommend", [
        "repeat_recommend",
        "choice_time_after_recommend",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_recommend_repeat",
        "user_after_recommend",
        "user_after_recommend_after_repeat",
        ["choice_time_after_recommend"],
      );
      keepChoices(
        scenario,
        "user_after_time",
        ["repeat_time"],
        thanksChoice ? [thanksChoice] : [],
      );
      redirectRepeatToCleanChoices(
        scenario,
        "ia_time_repeat",
        "user_after_time",
        "user_after_time_after_repeat",
        [],
        thanksChoice ? [thanksChoice] : [],
      );
      break;
    case "buy_tmoney":
      keepChoices(scenario, "user_start", ["choice_want_seoul_station"]);
      keepChoices(scenario, "user_after_welcome", [
        "repeat_welcome",
        "choice_tmoney",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_welcome_repeat",
        "user_after_welcome",
        "user_after_welcome_after_repeat",
        ["choice_tmoney"],
      );
      keepChoices(scenario, "user_after_tmoney", [
        "repeat_tmoney",
        "choice_charge",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_tmoney_repeat",
        "user_after_tmoney",
        "user_after_tmoney_after_repeat",
        ["choice_charge"],
      );
      keepChoices(
        scenario,
        "user_after_tmoney_charge",
        ["repeat_tmoney_charge"],
        thanksChoice ? [thanksChoice] : [],
      );
      redirectRepeatToCleanChoices(
        scenario,
        "ia_tmoney_charge_repeat",
        "user_after_tmoney_charge",
        "user_after_tmoney_charge_after_repeat",
        [],
        thanksChoice ? [thanksChoice] : [],
      );
      break;
    case "choose_arex":
      keepChoices(scenario, "user_start", ["choice_ask_arex"]);
      keepChoices(scenario, "user_after_welcome", [
        "repeat_welcome",
        "choice_ready",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_welcome_repeat",
        "user_after_welcome",
        "user_after_welcome_after_repeat",
        ["choice_ready"],
      );
      keepChoices(scenario, "user_after_transport", [
        "repeat_transport",
        "choice_which_train",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_transport_repeat",
        "user_after_transport",
        "user_after_transport_after_repeat",
        ["choice_which_train"],
      );
      keepChoices(scenario, "user_after_recommend", [
        "repeat_recommend",
        "choice_platform_after_recommend",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_recommend_repeat",
        "user_after_recommend",
        "user_after_recommend_after_repeat",
        ["choice_platform_after_recommend"],
      );
      keepChoices(scenario, "user_after_platform", [
        "repeat_platform",
        "choice_verify_train",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_platform_repeat",
        "user_after_platform",
        "user_after_platform_after_repeat",
        ["choice_verify_train"],
      );
      keepChoices(scenario, "user_after_verify_train", [
        "repeat_verify_train",
        "choice_time_after_verify",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_verify_train_repeat",
        "user_after_verify_train",
        "user_after_verify_train_after_repeat",
        ["choice_time_after_verify"],
      );
      keepChoices(
        scenario,
        "user_after_time",
        ["repeat_time"],
        thanksChoice ? [thanksChoice] : [],
      );
      redirectRepeatToCleanChoices(
        scenario,
        "ia_time_repeat",
        "user_after_time",
        "user_after_time_after_repeat",
        [],
        thanksChoice ? [thanksChoice] : [],
      );
      break;
    case "find_platform":
      keepChoices(scenario, "user_start", ["choice_ask_arex"]);
      keepChoices(scenario, "user_after_welcome", [
        "repeat_welcome",
        "choice_ready",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_welcome_repeat",
        "user_after_welcome",
        "user_after_welcome_after_repeat",
        ["choice_ready"],
      );
      keepChoices(scenario, "user_after_transport", [
        "repeat_transport",
        "choice_platform",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_transport_repeat",
        "user_after_transport",
        "user_after_transport_after_repeat",
        ["choice_platform"],
      );
      keepChoices(scenario, "user_after_platform", [
        "repeat_platform",
        "choice_verify_train",
      ]);
      redirectRepeatToCleanChoices(
        scenario,
        "ia_platform_repeat",
        "user_after_platform",
        "user_after_platform_after_repeat",
        ["choice_verify_train"],
      );
      keepChoices(
        scenario,
        "user_after_verify_train",
        ["repeat_verify_train"],
        thanksChoice ? [thanksChoice] : [],
      );
      redirectRepeatToCleanChoices(
        scenario,
        "ia_verify_train_repeat",
        "user_after_verify_train",
        "user_after_verify_train_after_repeat",
        [],
        thanksChoice ? [thanksChoice] : [],
      );
      break;
    case "lost_help":
      {
        const lostChoice = cloneChoice(
          getChoice(
            scenario,
            "user_after_verify_train",
            "choice_lost_after_verify",
          ),
        );

        keepChoices(scenario, "user_start", ["choice_want_seoul_station"]);
        keepChoices(
          scenario,
          "user_after_welcome",
          ["repeat_welcome"],
          lostChoice ? [lostChoice] : [],
        );
        redirectRepeatToCleanChoices(
          scenario,
          "ia_welcome_repeat",
          "user_after_welcome",
          "user_after_welcome_after_repeat",
          [],
          lostChoice ? [lostChoice] : [],
        );
        keepChoices(
          scenario,
          "user_after_lost",
          ["repeat_lost"],
          thanksChoice ? [thanksChoice] : [],
        );
        redirectRepeatToCleanChoices(
          scenario,
          "ia_lost_repeat",
          "user_after_lost",
          "user_after_lost_after_repeat",
          [],
          thanksChoice ? [thanksChoice] : [],
        );
      }
      break;
  }

  pruneUnreachableNodes(scenario);

  return scenario;
}
