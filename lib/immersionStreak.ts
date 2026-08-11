import {
  completeDailyActivity,
  getDailyStreakState,
  type DailyStreakState,
} from "./dailyStreak";

/**
 * Compatibility entry point for screens that still use the former immersion
 * streak module. The durable source of truth is now the daily streak state.
 */
export function getImmersionStreakState(): Promise<DailyStreakState> {
  return getDailyStreakState();
}

export function trackSceneCompleted(
  _sceneId: string,
): Promise<DailyStreakState> {
  return completeDailyActivity("guided_dialogue");
}

export function trackHangulExerciseCompleted(
  _exerciseId: string,
): Promise<DailyStreakState> {
  return completeDailyActivity("hangul_exercise");
}
