import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "kapp:immersion-streak:v1";
const ACTIVE_SECONDS_TARGET = 5 * 60;
const AUDIO_TARGET = 3;

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

export type ImmersionStreakState = {
  currentStreak: number;
  longestStreak: number;
  lastValidatedDate: string | null;
  totalImmersionDays: number;
  today: ImmersionStreakToday;
};

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyToday(date = getLocalDateKey()): ImmersionStreakToday {
  return {
    date,
    activeSeconds: 0,
    toolboxOpened: 0,
    audiosPlayed: 0,
    scenesCompleted: 0,
    hangulExercisesCompleted: 0,
    subModulesVisited: 0,
    validated: false,
  };
}

function createInitialState(): ImmersionStreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastValidatedDate: null,
    totalImmersionDays: 0,
    today: createEmptyToday(),
  };
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDayDistance(fromDate: string, toDate: string): number {
  const from = parseDateKey(fromDate);
  const to = parseDateKey(toDate);
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.round((to.getTime() - from.getTime()) / dayMs);
}

function hasValidationSignal(today: ImmersionStreakToday): boolean {
  // One meaningful signal is enough: the app rewards immersion,
  // not only formal quizzes or exercises.
  return (
    today.activeSeconds >= ACTIVE_SECONDS_TARGET ||
    today.toolboxOpened > 0 ||
    today.audiosPlayed >= AUDIO_TARGET ||
    today.scenesCompleted > 0 ||
    today.hangulExercisesCompleted > 0 ||
    today.subModulesVisited > 0
  );
}

function normalizeState(state: ImmersionStreakState): ImmersionStreakState {
  const todayDate = getLocalDateKey();

  if (state.today.date === todayDate) return state;

  return {
    ...state,
    today: createEmptyToday(todayDate),
  };
}

function validateStateIfNeeded(
  state: ImmersionStreakState,
): ImmersionStreakState {
  const normalizedState = normalizeState(state);
  const today = normalizedState.today;

  if (today.validated || !hasValidationSignal(today)) {
    return normalizedState;
  }

  const isAlreadyValidatedToday =
    normalizedState.lastValidatedDate === today.date;
  // Yesterday extends the streak; a longer gap restarts it at 1.
  const dayDistance = normalizedState.lastValidatedDate
    ? getDayDistance(normalizedState.lastValidatedDate, today.date)
    : undefined;
  const nextCurrentStreak = isAlreadyValidatedToday
    ? normalizedState.currentStreak
    : dayDistance === 1
      ? normalizedState.currentStreak + 1
      : 1;

  return {
    ...normalizedState,
    currentStreak: nextCurrentStreak,
    longestStreak: Math.max(normalizedState.longestStreak, nextCurrentStreak),
    lastValidatedDate: today.date,
    totalImmersionDays: isAlreadyValidatedToday
      ? normalizedState.totalImmersionDays
      : normalizedState.totalImmersionDays + 1,
    today: {
      ...today,
      validated: true,
    },
  };
}

async function readState(): Promise<ImmersionStreakState> {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawValue) return createInitialState();

  try {
    return normalizeState(JSON.parse(rawValue) as ImmersionStreakState);
  } catch {
    return createInitialState();
  }
}

async function writeState(
  state: ImmersionStreakState,
): Promise<ImmersionStreakState> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

async function updateState(
  updater: (state: ImmersionStreakState) => ImmersionStreakState,
): Promise<ImmersionStreakState> {
  const currentState = await readState();
  const updatedState = validateStateIfNeeded(updater(currentState));

  return writeState(updatedState);
}

export async function getImmersionStreakState(): Promise<ImmersionStreakState> {
  const state = validateStateIfNeeded(await readState());
  return writeState(state);
}

export async function resetTodayIfNewDay(): Promise<ImmersionStreakState> {
  return updateState((state) => normalizeState(state));
}

export async function validateTodayIfNeeded(): Promise<ImmersionStreakState> {
  return updateState((state) => state);
}

export async function trackActiveTime(
  seconds: number,
): Promise<ImmersionStreakState> {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return getImmersionStreakState();
  }

  return updateState((state) => ({
    ...state,
    today: {
      ...state.today,
      activeSeconds: state.today.activeSeconds + Math.floor(seconds),
    },
  }));
}

export async function trackToolboxOpened(): Promise<ImmersionStreakState> {
  return updateState((state) => ({
    ...state,
    today: {
      ...state.today,
      toolboxOpened: state.today.toolboxOpened + 1,
    },
  }));
}

export async function trackAudioPlayed(): Promise<ImmersionStreakState> {
  return updateState((state) => ({
    ...state,
    today: {
      ...state.today,
      audiosPlayed: state.today.audiosPlayed + 1,
    },
  }));
}

export async function trackSceneCompleted(
  _sceneId: string,
): Promise<ImmersionStreakState> {
  return updateState((state) => ({
    ...state,
    today: {
      ...state.today,
      scenesCompleted: state.today.scenesCompleted + 1,
    },
  }));
}

export async function trackHangulExerciseCompleted(
  _exerciseId: string,
): Promise<ImmersionStreakState> {
  return updateState((state) => ({
    ...state,
    today: {
      ...state.today,
      hangulExercisesCompleted: state.today.hangulExercisesCompleted + 1,
    },
  }));
}

export async function trackSubModuleVisited(
  _subModuleId: string,
): Promise<ImmersionStreakState> {
  return updateState((state) => ({
    ...state,
    today: {
      ...state.today,
      subModulesVisited: state.today.subModulesVisited + 1,
    },
  }));
}
