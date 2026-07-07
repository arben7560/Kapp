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
  | "guided_dialogue"
  | "hangul_exercise"
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

function createInitialState(): DailyStreakState {
  const todayDate = getStreakDateKey();

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
): DailyStreakState["badges"] {
  const now = new Date().toISOString();

  return STREAK_BADGE_MILESTONES.reduce(
    (badges, milestone) => {
      if (currentStreak < milestone || badges[milestone]) return badges;

      return {
        ...badges,
        [milestone]: {
          milestone,
          unlockedAt: now,
        },
      };
    },
    { ...previousBadges },
  );
}

function normalizeState(state: DailyStreakState): DailyStreakState {
  const todayDate = getStreakDateKey();
  const isTodayCompleted = !!state.completedDates?.[todayDate];

  return {
    ...createInitialState(),
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
  const initialState = createInitialState();
  const lastCompletedDate = legacy.lastValidatedDate ?? null;
  const currentStreak = Math.max(0, legacy.currentStreak ?? 0);
  const longestStreak = Math.max(currentStreak, legacy.longestStreak ?? 0);

  return normalizeState({
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
      return normalizeState(JSON.parse(rawValue) as DailyStreakState);
    } catch {
      return createInitialState();
    }
  }

  const legacyValue = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyValue) return createInitialState();

  try {
    return migrateLegacyState(JSON.parse(legacyValue) as LegacyImmersionState);
  } catch {
    return createInitialState();
  }
}

async function writeState(state: DailyStreakState): Promise<DailyStreakState> {
  const normalizedState = normalizeState(state);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
  return normalizedState;
}

async function updateState(
  updater: (state: DailyStreakState) => DailyStreakState,
): Promise<DailyStreakState> {
  const currentState = await readState();
  return writeState(updater(currentState));
}

export async function getDailyStreakState(): Promise<DailyStreakState> {
  return writeState(await readState());
}

export async function completeDailyActivity(
  activityType: DailyActivityType = "pedagogical_activity",
): Promise<DailyStreakState> {
  return updateState((state) => {
    const todayDate = getStreakDateKey();
    const existingToday = state.completedDates[todayDate];

    if (existingToday) {
      const activities = existingToday.activities.includes(activityType)
        ? existingToday.activities
        : [...existingToday.activities, activityType];

      return {
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
      };
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

    return {
      ...state,
      badges: getUnlockedBadges(nextCurrentStreak, state.badges),
      completedDates: {
        ...state.completedDates,
        [todayDate]: {
          activities: [activityType],
          completedAt: new Date().toISOString(),
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
    };
  });
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
  return writeState(createInitialState());
}
