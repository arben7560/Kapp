import { aeroportMissions } from "../../data/lesson/aeroport/aeroportMissions";
import { cafeMissions } from "../../data/lesson/cafe/cafeMissions";
import { metroMissions } from "../../data/lesson/metro/metroMissions";
import { restaurantMissions } from "../../data/lesson/restaurant/restaurantMissions";
import { buildProgressId } from "../progressIds";

export type MissionMasteryScene =
  | "cafe"
  | "metro"
  | "restaurant"
  | "aeroport";

export type MissionMasteryMode = "guided" | "real";

type MasteryMission = {
  id: string;
  title: string;
  objective?: string;
};

type MissionMasterySceneConfig = {
  title: string;
  location: string;
  missions: readonly MasteryMission[];
  excludedMissionIds?: ReadonlySet<string>;
};

const SCENE_CONFIG: Record<MissionMasteryScene, MissionMasterySceneConfig> = {
  cafe: {
    title: "Café",
    location: "Hongdae",
    missions: cafeMissions,
  },
  metro: {
    title: "Métro",
    location: "Séoul · Ligne 2",
    missions: metroMissions,
    // Cette mission est affichée comme « prochainement » : elle ne doit pas
    // rendre le compteur de maîtrise impossible à compléter.
    excludedMissionIds: new Set(["myeongdong-itaewon"]),
  },
  restaurant: {
    title: "Restaurant",
    location: "Itaewon",
    missions: restaurantMissions,
  },
  aeroport: {
    title: "Aéroport",
    location: "Incheon",
    missions: aeroportMissions,
  },
};

export type MissionMasteryCelebration = {
  scene: MissionMasteryScene;
  mode: MissionMasteryMode;
  missionId: string;
  missionTitle: string;
  objective?: string;
  sceneTitle: string;
  location: string;
  firstMastery: boolean;
};

let pendingCelebrations: MissionMasteryCelebration[] = [];

export function normalizeMissionMasteryMode(
  rawMode: string | string[] | undefined,
): MissionMasteryMode {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

export function getMissionMasterySceneFromTitle(
  title: string,
): MissionMasteryScene | null {
  const normalized = title.trim().toLocaleLowerCase("fr-FR");

  if (normalized === "café" || normalized === "cafe") return "cafe";
  if (normalized === "métro" || normalized === "metro") return "metro";
  if (normalized === "restaurant") return "restaurant";
  if (normalized === "aéroport" || normalized === "aeroport") return "aeroport";

  return null;
}

export function getMissionMasterySceneFromPathname(
  pathname: string,
): MissionMasteryScene | null {
  if (pathname.includes("/cafeMissions")) return "cafe";
  if (pathname.includes("/metroMissions")) return "metro";
  if (pathname.includes("/restaurantMissions")) return "restaurant";
  if (pathname.includes("/aeroportMissions")) return "aeroport";
  return null;
}

export function getMissionMasterySceneMeta(scene: MissionMasteryScene) {
  const { title, location } = SCENE_CONFIG[scene];
  return { title, location };
}

export function getMasteryMissions(scene: MissionMasteryScene) {
  const config = SCENE_CONFIG[scene];
  return config.missions.filter(
    (mission) => !config.excludedMissionIds?.has(mission.id),
  );
}

export function getMissionMasteryProgressId(
  scene: MissionMasteryScene,
  mode: MissionMasteryMode,
  missionId: string,
) {
  return buildProgressId(scene, mode, missionId);
}

export function isImmersionMissionMastered(
  completed: Readonly<Record<string, boolean>>,
  scene: MissionMasteryScene,
  mode: MissionMasteryMode,
  missionId: string,
) {
  return Boolean(
    completed[getMissionMasteryProgressId(scene, mode, missionId)],
  );
}

export function getMissionMasteryProgress(
  completed: Readonly<Record<string, boolean>>,
  scene: MissionMasteryScene,
  mode: MissionMasteryMode,
) {
  const missions = getMasteryMissions(scene);
  const masteredMissionIds = missions
    .filter((mission) =>
      isImmersionMissionMastered(completed, scene, mode, mission.id),
    )
    .map((mission) => mission.id);

  return {
    completedCount: masteredMissionIds.length,
    total: missions.length,
    missionIds: missions.map((mission) => mission.id),
    masteredMissionIds,
  };
}

function resolveCelebrationFromProgressId(
  progressId: string,
  firstMastery: boolean,
): MissionMasteryCelebration | null {
  const scenes = Object.keys(SCENE_CONFIG) as MissionMasteryScene[];
  const modes: MissionMasteryMode[] = ["guided", "real"];

  for (const scene of scenes) {
    const config = SCENE_CONFIG[scene];

    for (const mode of modes) {
      for (const mission of config.missions) {
        if (
          progressId !== getMissionMasteryProgressId(scene, mode, mission.id)
        ) {
          continue;
        }

        return {
          scene,
          mode,
          missionId: mission.id,
          missionTitle: mission.title,
          objective: mission.objective,
          sceneTitle: config.title,
          location: config.location,
          firstMastery,
        };
      }
    }
  }

  return null;
}

export function queueMissionMasteryCelebration(
  progressId: string,
  firstMastery: boolean,
) {
  const celebration = resolveCelebrationFromProgressId(
    progressId,
    firstMastery,
  );

  if (!celebration) return;

  pendingCelebrations = [
    ...pendingCelebrations.filter(
      (item) =>
        item.scene !== celebration.scene ||
        item.mode !== celebration.mode ||
        item.missionId !== celebration.missionId,
    ),
    celebration,
  ];
}

export function consumeMissionMasteryCelebration(
  scene: MissionMasteryScene,
  mode: MissionMasteryMode,
) {
  const index = pendingCelebrations.findIndex(
    (item) => item.scene === scene && item.mode === mode,
  );

  if (index < 0) return null;

  const [celebration] = pendingCelebrations.splice(index, 1);
  return celebration ?? null;
}
