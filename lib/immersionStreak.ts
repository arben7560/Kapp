import {
  completeDailyActivity,
  getDailyStreakState,
  type DailyStreakState,
} from "./dailyStreak";

export type ImmersionStreakToday = {
  date: string;
  activeSeconds: number;
  toolboxOpened: number;
  audiosPlayed: number;
  scenesCompleted: number;
  hangulExercisesCompleted: number;
  subModulesVisited: number;
  validated: boolean;
};

export type ImmersionStreakState = DailyStreakState & {
  lastValidatedDate: string | null;
  totalImmersionDays: number;
  today: ImmersionStreakToday;
};

const todayCounters: Omit<ImmersionStreakToday, "date" | "validated"> = {
  activeSeconds: 0,
  audiosPlayed: 0,
  hangulExercisesCompleted: 0,
  scenesCompleted: 0,
  subModulesVisited: 0,
  toolboxOpened: 0,
};

function toImmersionState(state: DailyStreakState): ImmersionStreakState {
  return {
    ...state,
    lastValidatedDate: state.lastCompletedDate,
    today: {
      ...todayCounters,
      date: state.todayDate,
      validated: state.isTodayCompleted,
    },
    totalImmersionDays: state.totalCompletedDays,
  };
}

export async function getImmersionStreakState(): Promise<ImmersionStreakState> {
  return toImmersionState(await getDailyStreakState());
}

export async function resetTodayIfNewDay(): Promise<ImmersionStreakState> {
  return getImmersionStreakState();
}

export async function validateTodayIfNeeded(): Promise<ImmersionStreakState> {
  return getImmersionStreakState();
}

export async function trackActiveTime(
  _seconds: number,
): Promise<ImmersionStreakState> {
  return getImmersionStreakState();
}

export async function trackToolboxOpened(): Promise<ImmersionStreakState> {
  return getImmersionStreakState();
}

export async function trackAudioPlayed(): Promise<ImmersionStreakState> {
  return getImmersionStreakState();
}

export async function trackSceneCompleted(
  _sceneId: string,
): Promise<ImmersionStreakState> {
  return toImmersionState(await completeDailyActivity("guided_dialogue"));
}

export async function trackHangulExerciseCompleted(
  _exerciseId: string,
): Promise<ImmersionStreakState> {
  return toImmersionState(await completeDailyActivity("hangul_exercise"));
}

export async function trackSubModuleVisited(
  _subModuleId: string,
): Promise<ImmersionStreakState> {
  return getImmersionStreakState();
}
