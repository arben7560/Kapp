import type { Progress } from "../_store";
import type {
  HangulDetailedProgress,
  HangulLessonProgress,
  HangulSceneScore,
} from "../data/hangul/types";
import type {
  GrammarLearningProgress,
  GrammarStagePracticeProgress,
} from "../data/grammar/types";
import {
  normalizeDailyStreakState,
  type DailyStreakDay,
  type DailyStreakState,
  type StreakBadge,
  type StreakBadgeMilestone,
} from "./dailyStreak.ts";
import type { HomeResumeContext } from "./homeResume.ts";
import type { UserProgressSnapshot } from "./progressSnapshot.ts";

function mergeTrueRecord(
  remote: Record<string, true> | undefined,
  local: Record<string, true> | undefined,
) {
  return { ...(remote ?? {}), ...(local ?? {}) };
}

function mergeNumberRecord(
  remote: Record<string, number> | undefined,
  local: Record<string, number> | undefined,
) {
  const result = { ...(remote ?? {}) };

  Object.entries(local ?? {}).forEach(([key, value]) => {
    result[key] = Math.max(result[key] ?? 0, value);
  });

  return result;
}

function mergeHangulScore(
  remote: HangulSceneScore | undefined,
  local: HangulSceneScore | undefined,
): HangulSceneScore | undefined {
  if (!remote) return local;
  if (!local) return remote;

  return {
    bestScore: Math.max(remote.bestScore, local.bestScore),
    total: Math.max(remote.total, local.total),
    attempts: Math.max(remote.attempts, local.attempts),
  };
}

function mergeHangulLesson(
  remote: HangulLessonProgress | undefined,
  local: HangulLessonProgress | undefined,
): HangulLessonProgress | undefined {
  if (!remote) return local;
  if (!local) return remote;

  const scoreIds = new Set([
    ...Object.keys(remote.scores),
    ...Object.keys(local.scores),
  ]);
  const scores: Record<string, HangulSceneScore> = {};

  scoreIds.forEach((id) => {
    const score = mergeHangulScore(remote.scores[id], local.scores[id]);
    if (score) scores[id] = score;
  });

  return {
    ...remote,
    ...local,
    currentSceneId: local.currentSceneId ?? remote.currentSceneId,
    activeQuiz: local.activeQuiz ?? remote.activeQuiz,
    discovered: mergeTrueRecord(remote.discovered, local.discovered),
    completedScenes: mergeTrueRecord(
      remote.completedScenes,
      local.completedScenes,
    ),
    masteredScenes: mergeTrueRecord(
      remote.masteredScenes,
      local.masteredScenes,
    ),
    scores,
    errorsByCharacter: mergeNumberRecord(
      remote.errorsByCharacter,
      local.errorsByCharacter,
    ),
  };
}

function mergeHangulProgress(
  remote: HangulDetailedProgress,
  local: HangulDetailedProgress,
): HangulDetailedProgress {
  const lessonIds = new Set([
    ...Object.keys(remote.lessons),
    ...Object.keys(local.lessons),
  ]);
  const lessons: HangulDetailedProgress["lessons"] = {};

  lessonIds.forEach((id) => {
    const lesson = mergeHangulLesson(remote.lessons[id], local.lessons[id]);
    if (lesson) lessons[id] = lesson;
  });

  const remoteAssessment = remote.assessment;
  const localAssessment = local.assessment;

  return {
    lessons,
    masteredCharacters: mergeTrueRecord(
      remote.masteredCharacters,
      local.masteredCharacters,
    ),
    assessment:
      remoteAssessment || localAssessment
        ? {
            attempts: Math.max(
              remoteAssessment?.attempts ?? 0,
              localAssessment?.attempts ?? 0,
            ),
            bestScore: Math.max(
              remoteAssessment?.bestScore ?? 0,
              localAssessment?.bestScore ?? 0,
            ),
            total: Math.max(
              remoteAssessment?.total ?? 0,
              localAssessment?.total ?? 0,
            ),
            passed: Boolean(
              remoteAssessment?.passed || localAssessment?.passed,
            ),
          }
        : undefined,
  };
}

function laterDate(left?: string, right?: string) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

function mergeGrammarStage(
  remote: GrammarStagePracticeProgress | undefined,
  local: GrammarStagePracticeProgress | undefined,
): GrammarStagePracticeProgress | undefined {
  if (!remote) return local;
  if (!local) return remote;

  const localSessionDate =
    local.activeSession?.completedAt ?? local.activeSession?.startedAt;
  const remoteSessionDate =
    remote.activeSession?.completedAt ?? remote.activeSession?.startedAt;
  const activeSession =
    !remote.activeSession ||
    (local.activeSession &&
      Date.parse(localSessionDate ?? "") >= Date.parse(remoteSessionDate ?? ""))
      ? local.activeSession
      : remote.activeSession;

  return {
    attempts: Math.max(remote.attempts, local.attempts),
    bestScore: Math.max(remote.bestScore, local.bestScore),
    lastScore: local.lastScore ?? remote.lastScore,
    lastCompletedAt: laterDate(
      remote.lastCompletedAt,
      local.lastCompletedAt,
    ),
    activeSession,
    completedSessionIds: [
      ...new Set([
        ...remote.completedSessionIds,
        ...local.completedSessionIds,
      ]),
    ],
    streakSessionIds: [
      ...new Set([...remote.streakSessionIds, ...local.streakSessionIds]),
    ],
  };
}

function grammarEvidence(value: unknown): number {
  if (!value || typeof value !== "object") return 0;

  return Object.entries(value).reduce((score, [key, entry]) => {
    if (
      (key.endsWith("At") && typeof entry === "string") ||
      (key === "attempts" && typeof entry === "number")
    ) {
      return score + 1;
    }

    return score + grammarEvidence(entry);
  }, 0);
}

function mergeGrammarProgress(
  remote: GrammarLearningProgress,
  local: GrammarLearningProgress,
): GrammarLearningProgress {
  const conceptIds = new Set([
    ...Object.keys(remote.concepts),
    ...Object.keys(local.concepts),
  ]);
  const concepts: GrammarLearningProgress["concepts"] = {};

  conceptIds.forEach((id) => {
    const remoteConcept = remote.concepts[id as keyof typeof remote.concepts];
    const localConcept = local.concepts[id as keyof typeof local.concepts];
    const selected =
      grammarEvidence(localConcept) >= grammarEvidence(remoteConcept)
        ? localConcept
        : remoteConcept;
    if (selected) concepts[id as keyof typeof concepts] = selected;
  });

  const stageIds = new Set([
    ...Object.keys(remote.stages),
    ...Object.keys(local.stages),
  ]);
  const stages: GrammarLearningProgress["stages"] = {};

  stageIds.forEach((id) => {
    const stageId = id as keyof typeof stages;
    const stage = mergeGrammarStage(remote.stages[stageId], local.stages[stageId]);
    if (stage) stages[stageId] = stage;
  });

  return {
    schemaVersion: 1,
    concepts,
    stages,
    lastStageId: local.lastStageId ?? remote.lastStageId,
  };
}

export function mergeProgressSnapshots(
  remote: Progress,
  local: Progress,
): Progress {
  return {
    learningTrack: local.learningTrack ?? remote.learningTrack,
    xp: Math.max(remote.xp, local.xp),
    streak: Math.max(remote.streak, local.streak),
    completed: { ...remote.completed, ...local.completed },
    hangulLevel: Math.max(remote.hangulLevel, local.hangulLevel),
    hangulProgress: mergeHangulProgress(
      remote.hangulProgress,
      local.hangulProgress,
    ),
    grammarProgress: mergeGrammarProgress(
      remote.grammarProgress,
      local.grammarProgress,
    ),
  };
}

function mergeDailyStreakDay(
  remote: DailyStreakDay | undefined,
  local: DailyStreakDay | undefined,
): DailyStreakDay | undefined {
  if (!remote) return local;
  if (!local) return remote;

  return {
    date: local.date || remote.date,
    completedAt:
      Date.parse(local.completedAt) >= Date.parse(remote.completedAt)
        ? local.completedAt
        : remote.completedAt,
    activities: [...new Set([...remote.activities, ...local.activities])],
  };
}

function mergeStreakBadge(
  remote: StreakBadge | undefined,
  local: StreakBadge | undefined,
): StreakBadge | undefined {
  if (!remote) return local;
  if (!local) return remote;
  return Date.parse(local.unlockedAt) <= Date.parse(remote.unlockedAt)
    ? local
    : remote;
}

function moreRecentStreakState(
  remote: DailyStreakState,
  local: DailyStreakState,
) {
  const remoteDate = remote.lastCompletedDate ?? "";
  const localDate = local.lastCompletedDate ?? "";
  return localDate >= remoteDate ? local : remote;
}

export function mergeDailyStreakSnapshots(
  remote: DailyStreakState | null,
  local: DailyStreakState | null,
): DailyStreakState | null {
  if (!remote) return local;
  if (!local) return remote;

  const completedDates: DailyStreakState["completedDates"] = {};
  new Set([
    ...Object.keys(remote.completedDates),
    ...Object.keys(local.completedDates),
  ]).forEach((date) => {
    const day = mergeDailyStreakDay(
      remote.completedDates[date],
      local.completedDates[date],
    );
    if (day) completedDates[date] = day;
  });

  const badges: DailyStreakState["badges"] = {};
  new Set([
    ...Object.keys(remote.badges),
    ...Object.keys(local.badges),
  ]).forEach((rawMilestone) => {
    const milestone = Number(rawMilestone) as StreakBadgeMilestone;
    const badge = mergeStreakBadge(
      remote.badges[milestone],
      local.badges[milestone],
    );
    if (badge) badges[milestone] = badge;
  });

  const recent = moreRecentStreakState(remote, local);
  const sameLastCompletedDate =
    remote.lastCompletedDate === local.lastCompletedDate;

  return normalizeDailyStreakState({
    ...recent,
    badges,
    completedDates,
    currentStreak: sameLastCompletedDate
      ? Math.max(remote.currentStreak, local.currentStreak)
      : recent.currentStreak,
    freezeDates: { ...remote.freezeDates, ...local.freezeDates },
    freezesAvailable: Math.max(
      remote.freezesAvailable,
      local.freezesAvailable,
    ),
    freezesUsed: Math.max(remote.freezesUsed, local.freezesUsed),
    longestStreak: Math.max(remote.longestStreak, local.longestStreak),
    totalCompletedDays: Math.max(
      remote.totalCompletedDays,
      local.totalCompletedDays,
      Object.keys(completedDates).length,
    ),
  });
}

export function mergeHomeResumeContexts(
  remote: HomeResumeContext | null,
  local: HomeResumeContext | null,
): HomeResumeContext | null {
  if (!remote) return local;
  if (!local) return remote;
  return Date.parse(local.updatedAt) >= Date.parse(remote.updatedAt)
    ? local
    : remote;
}

export function mergeUserProgressSnapshots(
  remote: UserProgressSnapshot,
  local: UserProgressSnapshot,
): UserProgressSnapshot {
  return {
    pedagogicalProgress: mergeProgressSnapshots(
      remote.pedagogicalProgress,
      local.pedagogicalProgress,
    ),
    dailyStreak: mergeDailyStreakSnapshots(
      remote.dailyStreak,
      local.dailyStreak,
    ),
    homeResume: mergeHomeResumeContexts(remote.homeResume, local.homeResume),
  };
}
