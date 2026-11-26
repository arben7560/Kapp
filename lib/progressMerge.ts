import type { Progress } from "../_store";
import type {
  HangulDetailedProgress,
  HangulLessonProgress,
  HangulSceneScore,
} from "../data/hangul/types";
import type {
  GrammarLearningProgress,
  GrammarProgress,
  GrammarCriterion,
  GrammarCriteriaEvidence,
  GrammarLearningPhase,
  GrammarStagePracticeProgress,
} from "../data/grammar/types";
import {
  normalizeDailyStreakState,
  STREAK_BADGE_MILESTONES,
  type DailyStreakDay,
  type DailyStreakState,
  type StreakBadge,
  type StreakBadgeMilestone,
} from "./dailyStreak.ts";
import type { HomeResumeContext } from "./homeResume.ts";
import type { UserProgressSnapshot } from "./progressSnapshot.ts";
import { COMPLETION_XP } from "./progressCompletion.ts";
import { normalizeGrammarProgress } from "./grammar/progress.ts";

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

  const completedSessionIds = [...new Set([...remote.completedSessionIds, ...local.completedSessionIds])].sort();
  const localSessionDate =
    local.activeSession?.completedAt ?? local.activeSession?.startedAt;
  const remoteSessionDate =
    remote.activeSession?.completedAt ?? remote.activeSession?.startedAt;
  const localSession = local.activeSession;
  const remoteSession = remote.activeSession;
  const activeSession = !remoteSession ? localSession : !localSession ? remoteSession :
    localSession.id === remoteSession.id
      ? (Boolean(localSession.completedAt) !== Boolean(remoteSession.completedAt)
        ? (localSession.completedAt ? localSession : remoteSession)
        : localSession.responses.length !== remoteSession.responses.length
          ? (localSession.responses.length > remoteSession.responses.length ? localSession : remoteSession)
          : localSession.questionIndex >= remoteSession.questionIndex ? localSession : remoteSession)
      : laterDate(localSessionDate, remoteSessionDate) === localSessionDate ? localSession : remoteSession;
  const latest = laterDate(local.lastCompletedAt, remote.lastCompletedAt) === local.lastCompletedAt
    ? local : remote;

  return {
    attempts: completedSessionIds.length + Math.max(0,
      remote.attempts - new Set(remote.completedSessionIds).size,
      local.attempts - new Set(local.completedSessionIds).size),
    bestScore: Math.max(remote.bestScore, local.bestScore),
    lastScore: latest.lastScore ?? (latest === local ? remote.lastScore : local.lastScore),
    lastCompletedAt: laterDate(
      remote.lastCompletedAt,
      local.lastCompletedAt,
    ),
    activeSession,
    completedSessionIds,
    streakSessionIds: [...new Set([...remote.streakSessionIds, ...local.streakSessionIds])].sort(),
  };
}

function mergeCriterion<K extends GrammarCriterion>(
  key: K,
  remote: GrammarCriteriaEvidence,
  local: GrammarCriteriaEvidence,
): GrammarCriteriaEvidence[K] {
  const left = remote[key];
  const right = local[key];
  if (!left) return right;
  if (!right) return left;
  // An evaluation is atomic: never mix scores, flags or session IDs from two tests.
  return Date.parse(right.evaluatedAt) >= Date.parse(left.evaluatedAt) ? right : left;
}

function mergeGrammarConcept(remote: GrammarProgress, local: GrammarProgress): GrammarProgress {
  const milestones: GrammarProgress["milestones"] = {};
  const phases = new Set([
    ...Object.keys(remote.milestones), ...Object.keys(local.milestones),
  ] as GrammarLearningPhase[]);
  phases.forEach((phase) => {
    const left = remote.milestones[phase];
    const right = local.milestones[phase];
    if (!left || !right) {
      milestones[phase] = left ?? right;
      return;
    }
    const bestScore = left.bestScore === undefined ? right.bestScore :
      right.bestScore === undefined ? left.bestScore : Math.max(left.bestScore, right.bestScore);
    milestones[phase] = {
      firstAt: Date.parse(left.firstAt) <= Date.parse(right.firstAt) ? left.firstAt : right.firstAt,
      lastAt: laterDate(left.lastAt, right.lastAt) ?? left.lastAt,
      attempts: Math.max(left.attempts, right.attempts),
      ...(bestScore === undefined ? {} : { bestScore }),
    };
  });
  const leftReview = remote.review;
  const rightReview = local.review;
  // Review offsets are only comparable within the same review cycle.
  const review = leftReview.anchorAt === rightReview.anchorAt
    ? {
        ...rightReview,
        completedOffsets: [...new Set([...leftReview.completedOffsets, ...rightReview.completedOffsets])].sort((a, b) => a - b),
        lastReviewedAt: laterDate(leftReview.lastReviewedAt, rightReview.lastReviewedAt),
        lapses: Math.max(leftReview.lapses, rightReview.lapses),
      }
    : {
        ...(laterDate(leftReview.anchorAt, rightReview.anchorAt) === rightReview.anchorAt
          ? rightReview : leftReview),
        lapses: Math.max(leftReview.lapses, rightReview.lapses),
      };
  const lastAttemptAt = (value: GrammarProgress) => value.milestones.discovery?.lastAt ??
    Object.values(value.milestones).reduce<string | undefined>(
      (latest, milestone) => laterDate(latest, milestone?.lastAt), undefined);
  const latest = laterDate(lastAttemptAt(remote), lastAttemptAt(local)) === lastAttemptAt(local)
    ? local : remote;
  return normalizeGrammarProgress({
    schemaVersion: 1,
    milestones,
    criteriaEvidence: {
      R: mergeCriterion("R", remote.criteriaEvidence, local.criteriaEvidence),
      M: mergeCriterion("M", remote.criteriaEvidence, local.criteriaEvidence),
      L: mergeCriterion("L", remote.criteriaEvidence, local.criteriaEvidence),
      P: mergeCriterion("P", remote.criteriaEvidence, local.criteriaEvidence),
      D: mergeCriterion("D", remote.criteriaEvidence, local.criteriaEvidence),
    },
    review,
    attempts: Math.max(remote.attempts, local.attempts),
    lastResult: latest.lastResult ?? (latest === local ? remote.lastResult : local.lastResult),
  });
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
    const selected = remoteConcept && localConcept
      ? mergeGrammarConcept(remoteConcept, localConcept)
      : remoteConcept ?? localConcept;
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
  const completed = { ...remote.completed, ...local.completed };
  for (const id of Object.keys(completed)) {
    completed[id] = remote.completed[id] === true || local.completed[id] === true;
  }
  // XP are awarded once per completion ID. Preserve the largest historical
  // balance not explained by those IDs (including the starting balance).
  // Unlike summing totals, this union is safe to merge repeatedly.
  const completionCount = (record: Progress["completed"]) => Object.values(record).filter((value) => value === true).length;
  const baseline = Math.max(
    remote.xp - completionCount(remote.completed) * COMPLETION_XP,
    local.xp - completionCount(local.completed) * COMPLETION_XP,
  );
  return {
    learningTrack: local.learningTrack ?? remote.learningTrack,
    xp: baseline + completionCount(completed) * COMPLETION_XP,
    streak: Math.max(remote.streak, local.streak),
    completed,
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

// Date keys are local calendar days; use UTC arithmetic to avoid DST shifts.
function streakDayNumber(key: string): number {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? Date.parse(key + "T00:00:00Z") / 86_400_000 : NaN;
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
  const freezeDates = { ...remote.freezeDates, ...local.freezeDates };
  const days = Object.keys(completedDates).filter((date) => Number.isFinite(streakDayNumber(date))).sort();
  const covered = [...new Set([...days, ...Object.keys(freezeDates).filter((date) => Number.isFinite(streakDayNumber(date)))])].sort();
  let run = 0;
  let previous = NaN;
  let currentStreak = 0;
  let currentRunStart = NaN;
  let runStart = NaN;
  let longestStreak = Math.max(remote.longestStreak, local.longestStreak);
  for (const date of covered) {
    const number = streakDayNumber(date);
    if (number !== previous + 1) {
      run = 0;
      runStart = NaN;
    }
    if (completedDates[date]) {
      if (run === 0) runStart = number;
      run++;
      currentStreak = run;
      currentRunStart = runStart;
      longestStreak = Math.max(longestStreak, run);
      for (const milestone of STREAK_BADGE_MILESTONES) {
        if (run >= milestone && !badges[milestone]) {
          badges[milestone] = { milestone, unlockedAt: completedDates[date].completedAt };
        }
      }
    } else if (run > 0) {
      // A recorded freeze bridges a gap, but cannot start a streak by itself.
      run++;
    }
    previous = number;
  }
  const lastCompletedDate = days.at(-1) ?? recent.lastCompletedDate;
  const latestDay = lastCompletedDate ? streakDayNumber(lastCompletedDate) : NaN;
  const sources = [remote, local];
  // Old migrated snapshots may have a streak count but no complete date list.
  // Preserve that known count only when its last day connects to the latest run.
  // Never synthesize missing dates or award badges on inferred history.
  const totalCompletedDays = Math.max(days.length, ...sources.map((source) =>
    source.totalCompletedDays + (source.lastCompletedDate
      ? days.filter((date) => date > source.lastCompletedDate!).length : 0)));
  if (totalCompletedDays > days.length) {
    for (const source of sources) {
      if (source.totalCompletedDays <= Object.keys(source.completedDates).length || !source.lastCompletedDate) continue;
      const last = streakDayNumber(source.lastCompletedDate);
      if (last >= currentRunStart && last <= latestDay) {
        currentStreak = Math.max(currentStreak, source.currentStreak + latestDay - last);
      }
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);
  // A freeze spent on the same date on two devices is counted once. A stale
  // snapshot must not restore a spent freeze. Historical untracked grants
  // cannot be added safely; retain the largest known total allowance.
  const freezesUsed = Math.max(
    remote.freezesUsed, local.freezesUsed, Object.keys(freezeDates).length,
  );
  const freezeAllowance = Math.max(
    remote.freezesAvailable + remote.freezesUsed,
    local.freezesAvailable + local.freezesUsed,
  );
  return normalizeDailyStreakState({
    ...recent,
    badges,
    completedDates,
    lastCompletedDate,
    currentStreak,
    freezeDates,
    freezesAvailable: Math.max(0, freezeAllowance - freezesUsed),
    freezesUsed,
    longestStreak,
    totalCompletedDays,
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
