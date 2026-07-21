import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "kapp:daily-streak:v1";
const LEGACY_STORAGE_KEY = "kapp:immersion-streak:v1";
const STREAK_DAY_START_HOUR = 4;
const INITIAL_FREEZES = 1;

export const STREAK_BADGE_MILESTONES = [3, 7, 14, 30, 50, 100, 365] as const;

export type StreakBadgeMilestone = (typeof STREAK_BADGE_MILESTONES)[number];

export type DailyActivityType =
  | "listen_exercise"
  | "ai_mission"
  | "voice_immersion"
  | "guided_dialogue"
  | "hangul_exercise"
  | "grammar_exercise"
  | "counting_scene"
  | "classifier_scene"
  | "pedagogical_activity";

export type DailyStreakCompletionResult =
  | "already_completed"
  | "completed"
  | "completed_with_freeze"
  | "restarted";

export type DailyStreakDay = {
  date: string;
  completedAt: string;
  activities: DailyActivityType[];
};

export type StreakBadge = {
  milestone: StreakBadgeMilestone;
  unlockedAt: string;
};

export type DailyStreakState = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  isTodayCompleted: boolean;
  todayDate: string;
  totalCompletedDays: number;
  completedDates: Record<string, DailyStreakDay>;
  freezeDates: Record<string, true>;
  freezesAvailable: number;
  freezesUsed: number;
  badges: Partial<Record<StreakBadgeMilestone, StreakBadge>>;
  lastCompletionResult?: DailyStreakCompletionResult;
};

type LegacyImmersionState = {
  currentStreak?: number;
  longestStreak?: number;
  lastValidatedDate?: string | null;
  totalImmersionDays?: number;
};

export function getStreakDateKey(date = new Date()): string {
  const adjustedDate = new Date(date);
  adjustedDate.setHours(adjustedDate.getHours() - STREAK_DAY_START_HOUR);

  const year = adjustedDate.getFullYear();
  const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
  const day = String(adjustedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createDailyStreakState(
  now = new Date(),
): DailyStreakState {
  const todayDate = getStreakDateKey(now);

  return {
    badges: {},
    completedDates: {},
    currentStreak: 0,
    freezeDates: {},
    freezesAvailable: INITIAL_FREEZES,
    freezesUsed: 0,
    isTodayCompleted: false,
    lastCompletedDate: null,
    longestStreak: 0,
    todayDate,
    totalCompletedDays: 0,
  };
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

function getDayDistance(fromDate: string, toDate: string): number {
  const from = parseDateKey(fromDate);
  const to = parseDateKey(toDate);
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.round((to.getTime() - from.getTime()) / dayMs);
}

function getUnlockedBadges(
  currentStreak: number,
  previousBadges: DailyStreakState["badges"],
  now: Date,
): DailyStreakState["badges"] {
  const unlockedAt = now.toISOString();

  return STREAK_BADGE_MILESTONES.reduce(
    (badges, milestone) => {
      if (currentStreak < milestone || badges[milestone]) return badges;

      return {
        ...badges,
        [milestone]: {
          milestone,
          unlockedAt,
        },
      };
    },
    { ...previousBadges },
  );
}

export function normalizeDailyStreakState(
  state: DailyStreakState,
  now = new Date(),
): DailyStreakState {
  const todayDate = getStreakDateKey(now);
  const isTodayCompleted = !!state.completedDates?.[todayDate];

  return {
    ...createDailyStreakState(now),
    ...state,
    badges: state.badges ?? {},
    completedDates: state.completedDates ?? {},
    currentStreak: Math.max(0, state.currentStreak ?? 0),
    freezeDates: state.freezeDates ?? {},
    freezesAvailable: Math.max(0, state.freezesAvailable ?? 0),
    freezesUsed: Math.max(0, state.freezesUsed ?? 0),
    isTodayCompleted,
    longestStreak: Math.max(0, state.longestStreak ?? 0),
    todayDate,
    totalCompletedDays: Object.keys(state.completedDates ?? {}).length,
  };
}

function migrateLegacyState(legacy: LegacyImmersionState): DailyStreakState {
  const initialState = createDailyStreakState();
  const lastCompletedDate = legacy.lastValidatedDate ?? null;
  const currentStreak = Math.max(0, legacy.currentStreak ?? 0);
  const longestStreak = Math.max(currentStreak, legacy.longestStreak ?? 0);

  return normalizeDailyStreakState({
    ...initialState,
    currentStreak,
    lastCompletedDate,
    longestStreak,
    totalCompletedDays: Math.max(0, legacy.totalImmersionDays ?? 0),
  });
}

async function readState(): Promise<DailyStreakState> {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (rawValue) {
    try {
      return normalizeDailyStreakState(
        JSON.parse(rawValue) as DailyStreakState,
      );
    } catch {
      return createDailyStreakState();
    }
  }

  const legacyValue = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyValue) return createDailyStreakState();

  try {
    return migrateLegacyState(JSON.parse(legacyValue) as LegacyImmersionState);
  } catch {
    return createDailyStreakState();
  }
}

async function writeState(state: DailyStreakState): Promise<DailyStreakState> {
  const normalizedState = normalizeDailyStreakState(state);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
  return normalizedState;
}

let stateOperationQueue: Promise<void> = Promise.resolve();

function enqueueStateOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = stateOperationQueue.then(operation, operation);
  stateOperationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function updateState(
  updater: (state: DailyStreakState) => DailyStreakState,
): Promise<DailyStreakState> {
  return enqueueStateOperation(async () => {
    const currentState = await readState();
    return writeState(updater(currentState));
  });
}

export async function getDailyStreakState(): Promise<DailyStreakState> {
  return enqueueStateOperation(async () => writeState(await readState()));
}

export function completeDailyStreakState(
  currentState: DailyStreakState,
  activityType: DailyActivityType = "pedagogical_activity",
  now = new Date(),
): DailyStreakState {
  const state = normalizeDailyStreakState(currentState, now);
  const todayDate = getStreakDateKey(now);
  const existingToday = state.completedDates[todayDate];

  if (existingToday) {
    const existingActivities = existingToday.activities ?? [];
    const activities = existingActivities.includes(activityType)
      ? existingActivities
      : [...existingActivities, activityType];

    return normalizeDailyStreakState({
      ...state,
      completedDates: {
        ...state.completedDates,
        [todayDate]: {
          ...existingToday,
          activities,
        },
      },
      isTodayCompleted: true,
      lastCompletionResult: "already_completed",
      todayDate,
    }, now);
  }

  const lastCompletedDate = state.lastCompletedDate;
  const distance = lastCompletedDate
    ? getDayDistance(lastCompletedDate, todayDate)
    : undefined;
  const canUseFreeze =
    distance === 2 && state.freezesAvailable > 0 && !!lastCompletedDate;
  const missedDate = canUseFreeze ? addDays(lastCompletedDate, 1) : undefined;
  const nextCurrentStreak =
    !lastCompletedDate || !distance
      ? 1
      : distance === 1
        ? state.currentStreak + 1
        : canUseFreeze
          ? state.currentStreak + 2
          : 1;
  const result: DailyStreakCompletionResult =
    !lastCompletedDate || !distance || distance === 1
      ? "completed"
      : canUseFreeze
        ? "completed_with_freeze"
        : "restarted";
  const nextFreezeDates = missedDate
    ? { ...state.freezeDates, [missedDate]: true as const }
    : state.freezeDates;

  return normalizeDailyStreakState({
    ...state,
    badges: getUnlockedBadges(nextCurrentStreak, state.badges, now),
    completedDates: {
      ...state.completedDates,
      [todayDate]: {
        activities: [activityType],
        completedAt: now.toISOString(),
        date: todayDate,
      },
    },
    currentStreak: nextCurrentStreak,
    freezeDates: nextFreezeDates,
    freezesAvailable: canUseFreeze
      ? state.freezesAvailable - 1
      : state.freezesAvailable,
    freezesUsed: canUseFreeze ? state.freezesUsed + 1 : state.freezesUsed,
    isTodayCompleted: true,
    lastCompletedDate: todayDate,
    lastCompletionResult: result,
    longestStreak: Math.max(state.longestStreak, nextCurrentStreak),
    todayDate,
    totalCompletedDays: Object.keys(state.completedDates).length + 1,
  }, now);
}

export async function completeDailyActivity(
  activityType: DailyActivityType = "pedagogical_activity",
): Promise<DailyStreakState> {
  return updateState((state) =>
    completeDailyStreakState(state, activityType, new Date()),
  );
}

export async function applyStreakFreeze(dateToRepair?: string) {
  return updateState((state) => {
    if (state.freezesAvailable <= 0) return state;

    const todayDate = getStreakDateKey();
    const fallbackDate =
      state.lastCompletedDate && getDayDistance(state.lastCompletedDate, todayDate) > 1
        ? addDays(state.lastCompletedDate, 1)
        : addDays(todayDate, -1);
    const freezeDate = dateToRepair ?? fallbackDate;

    if (state.completedDates[freezeDate] || state.freezeDates[freezeDate]) {
      return state;
    }

    return {
      ...state,
      freezeDates: {
        ...state.freezeDates,
        [freezeDate]: true,
      },
      freezesAvailable: state.freezesAvailable - 1,
      freezesUsed: state.freezesUsed + 1,
    };
  });
}

export async function grantStreakFreeze(count = 1): Promise<DailyStreakState> {
  return updateState((state) => ({
    ...state,
    freezesAvailable: state.freezesAvailable + Math.max(0, Math.floor(count)),
  }));
}

export async function resetDailyStreak(): Promise<DailyStreakState> {
  return enqueueStateOperation(() => writeState(createDailyStreakState()));
}
