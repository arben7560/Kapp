export type MissionAccess = "free" | "premium";

export type ImmersionMission<TScenarioKey extends string = string> = {
  id: string;
  title: string;
  subtitle: string;
  access: MissionAccess;
  duration?: string;
  objective?: string;
  goals?: string[];
  skills?: string[];
  scenarioKey: TScenarioKey;
};

export function canOpenImmersionMission(
  mission: Pick<ImmersionMission, "access">,
  hasPremiumAccess: boolean,
) {
  return mission.access === "free" || hasPremiumAccess;
}
