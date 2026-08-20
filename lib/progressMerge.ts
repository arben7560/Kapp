<<<<<<< HEAD
import {
  GRAMMAR_CONCEPT_IDS,
  GRAMMAR_STAGE_IDS,
  type GrammarCriteriaEvidence,
  type GrammarLearningPhase,
  type GrammarLearningProgress,
  type GrammarMilestoneProgress,
  type GrammarPracticeSession,
  type GrammarProgress,
  type GrammarReviewProgress,
  type GrammarStagePracticeProgress,
} from "../data/grammar/types.ts";
import {
  createEmptyHangulLessonProgress,
  type HangulAssessmentProgress,
  type HangulDetailedProgress,
  type HangulLessonProgress,
  type HangulQuizSession,
  type HangulSceneScore,
} from "../data/hangul/types.ts";
import type { DailyStreakDay, DailyStreakState } from "./dailyStreak.ts";
import {
  createDailyStreakState,
  normalizeDailyStreakState,
} from "./dailyStreak.ts";
import type { HomeResumeContext, HomeResumeTrack } from "./homeResume.ts";
import { normalizeGrammarLearningProgress } from "./grammar/learning.ts";
import {
  createInitialPedagogicalProgress,
  normalizePedagogicalProgress,
  type Progress,
} from "./pedagogicalProgress.ts";

export const PROGRESS_SCHEMA_VERSION = 1;

export type ProgressDocument = {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION;
  pedagogicalProgress: Progress;
  dailyStreak: DailyStreakState;
  homeResume: HomeResumeContext | null;
};

const GRAMMAR_PHASES: readonly GrammarLearningPhase[] = [
  "discovery",
  "explanation",
  "manipulation",
  "listening",
  "production",
  "reuse",
  "review",
  "mastery",
];

const HOME_RESUME_TRACKS = new Set<HomeResumeTrack>([
  "hangul",
  "grammar",
  "vocab",
  "numbers",
  "dialogs",
  "listen",
  "cafe_ia",
  "metro_ia",
  "restaurant_ia",
  "aeroport_ia",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function timestamp(value?: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function earlier(first?: string, second?: string): string | undefined {
  if (!first) return second;
  if (!second) return first;
  return timestamp(first) <= timestamp(second) ? first : second;
}

function later(first?: string, second?: string): string | undefined {
  if (!first) return second;
  if (!second) return first;
  return timestamp(first) >= timestamp(second) ? first : second;
}

function unionTrueRecords(
  local: Readonly<Record<string, boolean | true>> = {},
  cloud: Readonly<Record<string, boolean | true>> = {},
): Record<string, true> {
  const merged: Record<string, true> = {};
  for (const [key, value] of Object.entries({ ...cloud, ...local })) {
    if (value) merged[key] = true;
  }
  return merged;
}

function unionStrings(
  local: readonly string[] = [],
  cloud: readonly string[] = [],
): string[] {
  return [...new Set([...cloud, ...local])];
}

function chooseHangulQuizSession(
  local?: HangulQuizSession,
  cloud?: HangulQuizSession,
): HangulQuizSession | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  if (local.sceneId !== cloud.sceneId) return local;

  const score = (session: HangulQuizSession) =>
    session.round * 10_000 +
    session.questionIndex * 100 +
    Object.keys(session.correctQuestionIds).length * 10 +
    session.score;
  return score(local) >= score(cloud) ? local : cloud;
}

function mergeHangulSceneScore(
  local?: HangulSceneScore,
  cloud?: HangulSceneScore,
): HangulSceneScore | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  return {
    attempts: Math.max(local.attempts, cloud.attempts),
    bestScore: Math.max(local.bestScore, cloud.bestScore),
    total: Math.max(local.total, cloud.total),
=======
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
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
  };
}

function mergeHangulLesson(
<<<<<<< HEAD
  local?: HangulLessonProgress,
  cloud?: HangulLessonProgress,
): HangulLessonProgress {
  const left = local ?? createEmptyHangulLessonProgress();
  const right = cloud ?? createEmptyHangulLessonProgress();
  const scoreIds = new Set([
    ...Object.keys(left.scores),
    ...Object.keys(right.scores),
  ]);
  const characterIds = new Set([
    ...Object.keys(left.errorsByCharacter),
    ...Object.keys(right.errorsByCharacter),
  ]);
  const scores: Record<string, HangulSceneScore> = {};
  const errorsByCharacter: Record<string, number> = {};

  scoreIds.forEach((id) => {
    const merged = mergeHangulSceneScore(left.scores[id], right.scores[id]);
    if (merged) scores[id] = merged;
  });
  characterIds.forEach((id) => {
    errorsByCharacter[id] = Math.max(
      left.errorsByCharacter[id] ?? 0,
      right.errorsByCharacter[id] ?? 0,
    );
  });

  return {
    ...(right.currentSceneId ? { currentSceneId: right.currentSceneId } : {}),
    ...(left.currentSceneId ? { currentSceneId: left.currentSceneId } : {}),
    ...(chooseHangulQuizSession(left.activeQuiz, right.activeQuiz)
      ? { activeQuiz: chooseHangulQuizSession(left.activeQuiz, right.activeQuiz) }
      : {}),
    discovered: unionTrueRecords(left.discovered, right.discovered),
    completedScenes: unionTrueRecords(
      left.completedScenes,
      right.completedScenes,
    ),
    masteredScenes: unionTrueRecords(left.masteredScenes, right.masteredScenes),
    scores,
    errorsByCharacter,
  };
}

function mergeHangulAssessment(
  local?: HangulAssessmentProgress,
  cloud?: HangulAssessmentProgress,
): HangulAssessmentProgress | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  return {
    attempts: Math.max(local.attempts, cloud.attempts),
    bestScore: Math.max(local.bestScore, cloud.bestScore),
    total: Math.max(local.total, cloud.total),
    passed: local.passed || cloud.passed,
  };
}

export function mergeHangulProgress(
  local: HangulDetailedProgress,
  cloud: HangulDetailedProgress,
): HangulDetailedProgress {
  const lessonIds = new Set([
    ...Object.keys(local.lessons),
    ...Object.keys(cloud.lessons),
  ]);
  const lessons: HangulDetailedProgress["lessons"] = {};
  lessonIds.forEach((id) => {
    lessons[id] = mergeHangulLesson(local.lessons[id], cloud.lessons[id]);
  });

  const assessment = mergeHangulAssessment(local.assessment, cloud.assessment);
  return {
    lessons,
    masteredCharacters: unionTrueRecords(
      local.masteredCharacters,
      cloud.masteredCharacters,
    ),
    ...(assessment ? { assessment } : {}),
  };
}

function mergeMilestone(
  local?: GrammarMilestoneProgress,
  cloud?: GrammarMilestoneProgress,
): GrammarMilestoneProgress | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  return {
    firstAt: earlier(local.firstAt, cloud.firstAt) ?? local.firstAt,
    lastAt: later(local.lastAt, cloud.lastAt) ?? local.lastAt,
    attempts: Math.max(local.attempts, cloud.attempts),
    ...(local.bestScore !== undefined || cloud.bestScore !== undefined
      ? { bestScore: Math.max(local.bestScore ?? 0, cloud.bestScore ?? 0) }
      : {}),
  };
}

function evidenceQuality(value: Record<string, unknown> | undefined): number {
  if (!value) return -1;
  const correct = typeof value.correct === "number" ? value.correct : 0;
  const total = typeof value.total === "number" ? value.total : 0;
  const ratio = total > 0 ? correct / total : 0;
  const positiveFlags = Object.values(value).filter(
    (entry) => entry === true,
  ).length;
  return positiveFlags * 100 + ratio * 10 + correct / 1_000;
}

function chooseEvidence<T extends Record<string, unknown>>(
  local?: T,
  cloud?: T,
): T | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  const localQuality = evidenceQuality(local);
  const cloudQuality = evidenceQuality(cloud);
  if (localQuality !== cloudQuality) {
    return localQuality > cloudQuality ? local : cloud;
  }
  const localAt = typeof local.evaluatedAt === "string" ? local.evaluatedAt : "";
  const cloudAt = typeof cloud.evaluatedAt === "string" ? cloud.evaluatedAt : "";
  return timestamp(localAt) >= timestamp(cloudAt) ? local : cloud;
}

function mergeCriteriaEvidence(
  local: GrammarCriteriaEvidence,
  cloud: GrammarCriteriaEvidence,
): GrammarCriteriaEvidence {
  return {
    ...(chooseEvidence(local.R, cloud.R)
      ? { R: chooseEvidence(local.R, cloud.R) }
      : {}),
    ...(chooseEvidence(local.M, cloud.M)
      ? { M: chooseEvidence(local.M, cloud.M) }
      : {}),
    ...(chooseEvidence(local.L, cloud.L)
      ? { L: chooseEvidence(local.L, cloud.L) }
      : {}),
    ...(chooseEvidence(local.P, cloud.P)
      ? { P: chooseEvidence(local.P, cloud.P) }
      : {}),
    ...(chooseEvidence(local.D, cloud.D)
      ? { D: chooseEvidence(local.D, cloud.D) }
      : {}),
  };
}

function mergeReview(
  local: GrammarReviewProgress,
  cloud: GrammarReviewProgress,
): GrammarReviewProgress {
  return {
    ...(earlier(local.anchorAt, cloud.anchorAt)
      ? { anchorAt: earlier(local.anchorAt, cloud.anchorAt) }
      : {}),
    completedOffsets: [...new Set([
      ...cloud.completedOffsets,
      ...local.completedOffsets,
    ])].sort((a, b) => a - b),
    ...(later(local.nextReviewAt, cloud.nextReviewAt)
      ? { nextReviewAt: later(local.nextReviewAt, cloud.nextReviewAt) }
      : {}),
    ...(later(local.lastReviewedAt, cloud.lastReviewedAt)
      ? { lastReviewedAt: later(local.lastReviewedAt, cloud.lastReviewedAt) }
      : {}),
    lapses: Math.max(local.lapses, cloud.lapses),
  };
}

function mergeGrammarConcept(
  local?: GrammarProgress,
  cloud?: GrammarProgress,
): GrammarProgress | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  const milestones: GrammarProgress["milestones"] = {};
  GRAMMAR_PHASES.forEach((phase) => {
    const value = mergeMilestone(local.milestones[phase], cloud.milestones[phase]);
    if (value) milestones[phase] = value;
  });
  return {
    schemaVersion: 1,
    milestones,
    criteriaEvidence: mergeCriteriaEvidence(
      local.criteriaEvidence,
      cloud.criteriaEvidence,
    ),
    review: mergeReview(local.review, cloud.review),
    attempts: Math.max(local.attempts, cloud.attempts),
    ...(local.lastResult !== undefined || cloud.lastResult !== undefined
      ? { lastResult: Math.max(local.lastResult ?? 0, cloud.lastResult ?? 0) }
      : {}),
  };
}

function chooseGrammarSession(
  local?: GrammarPracticeSession,
  cloud?: GrammarPracticeSession,
): GrammarPracticeSession | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  if (local.id !== cloud.id) {
    return timestamp(local.startedAt) >= timestamp(cloud.startedAt)
      ? local
      : cloud;
  }
  const score = (session: GrammarPracticeSession) =>
    (session.completedAt ? 100_000 : 0) +
    session.questionIndex * 1_000 +
    session.responses.length * 100 +
    session.score;
  return score(local) >= score(cloud) ? local : cloud;
}

function mergeGrammarStage(
  local?: GrammarStagePracticeProgress,
  cloud?: GrammarStagePracticeProgress,
): GrammarStagePracticeProgress | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  const localIsLatest =
    timestamp(local.lastCompletedAt) >= timestamp(cloud.lastCompletedAt);
  const latest = localIsLatest ? local : cloud;
  const activeSession = chooseGrammarSession(
    local.activeSession,
    cloud.activeSession,
  );
  return {
    attempts: Math.max(local.attempts, cloud.attempts),
    bestScore: Math.max(local.bestScore, cloud.bestScore),
    ...(latest.lastScore !== undefined ? { lastScore: latest.lastScore } : {}),
    ...(later(local.lastCompletedAt, cloud.lastCompletedAt)
      ? { lastCompletedAt: later(local.lastCompletedAt, cloud.lastCompletedAt) }
      : {}),
    ...(activeSession ? { activeSession } : {}),
    completedSessionIds: unionStrings(
      local.completedSessionIds,
      cloud.completedSessionIds,
    ),
    streakSessionIds: unionStrings(
      local.streakSessionIds,
      cloud.streakSessionIds,
    ),
  };
}

export function mergeGrammarProgress(
  localValue: GrammarLearningProgress,
  cloudValue: GrammarLearningProgress,
): GrammarLearningProgress {
  const local = normalizeGrammarLearningProgress(localValue);
  const cloud = normalizeGrammarLearningProgress(cloudValue);
  const concepts: GrammarLearningProgress["concepts"] = {};
  const stages: GrammarLearningProgress["stages"] = {};

  GRAMMAR_CONCEPT_IDS.forEach((id) => {
    const value = mergeGrammarConcept(local.concepts[id], cloud.concepts[id]);
    if (value) concepts[id] = value;
  });
  GRAMMAR_STAGE_IDS.forEach((id) => {
    const value = mergeGrammarStage(local.stages[id], cloud.stages[id]);
    if (value) stages[id] = value;
  });

  return normalizeGrammarLearningProgress({
    schemaVersion: 1,
    concepts,
    stages,
    lastStageId: local.lastStageId ?? cloud.lastStageId,
  });
}

export function mergePedagogicalProgress(
  localValue: Progress,
  cloudValue: Progress,
): Progress {
  const local = normalizePedagogicalProgress(localValue);
  const cloud = normalizePedagogicalProgress(cloudValue);
  return normalizePedagogicalProgress({
    learningTrack: local.learningTrack ?? cloud.learningTrack,
    xp: Math.max(local.xp, cloud.xp),
    streak: Math.max(local.streak, cloud.streak),
    completed: unionTrueRecords(local.completed, cloud.completed),
    hangulLevel: Math.max(local.hangulLevel, cloud.hangulLevel),
    hangulProgress: mergeHangulProgress(
      local.hangulProgress,
      cloud.hangulProgress,
    ),
    grammarProgress: mergeGrammarProgress(
      local.grammarProgress,
      cloud.grammarProgress,
    ),
  });
}

function mergeStreakDay(
  local?: DailyStreakDay,
  cloud?: DailyStreakDay,
): DailyStreakDay | undefined {
  if (!local) return cloud;
  if (!cloud) return local;
  return {
    date: local.date || cloud.date,
    completedAt:
      earlier(local.completedAt, cloud.completedAt) ?? local.completedAt,
    activities: [...new Set([...cloud.activities, ...local.activities])],
  };
}

export function mergeDailyStreak(
  localValue: DailyStreakState,
  cloudValue: DailyStreakState,
): DailyStreakState {
  const local = normalizeDailyStreakState(localValue);
  const cloud = normalizeDailyStreakState(cloudValue);
  const completedDates: DailyStreakState["completedDates"] = {};
  const completedKeys = new Set([
    ...Object.keys(local.completedDates),
    ...Object.keys(cloud.completedDates),
  ]);
  completedKeys.forEach((date) => {
    const day = mergeStreakDay(
      local.completedDates[date],
      cloud.completedDates[date],
    );
    if (day) completedDates[date] = day;
  });

  const freezeDates = unionTrueRecords(local.freezeDates, cloud.freezeDates);
  const badges: DailyStreakState["badges"] = { ...cloud.badges };
  Object.entries(local.badges).forEach(([milestone, badge]) => {
    if (!badge) return;
    const numericMilestone = Number(milestone) as keyof typeof badges;
    const cloudBadge = badges[numericMilestone];
    badges[numericMilestone] =
      !cloudBadge || timestamp(badge.unlockedAt) < timestamp(cloudBadge.unlockedAt)
        ? badge
        : cloudBadge;
  });

  const localIsLatest =
    (local.lastCompletedDate ?? "") >= (cloud.lastCompletedDate ?? "");
  const latestState = localIsLatest ? local : cloud;
  const totalFreezeInventory = Math.max(
    local.freezesAvailable + local.freezesUsed,
    cloud.freezesAvailable + cloud.freezesUsed,
  );
  const freezesUsed = Math.max(
    local.freezesUsed,
    cloud.freezesUsed,
    Object.keys(freezeDates).length,
  );
  const lastCompletedDate = [
    local.lastCompletedDate,
    cloud.lastCompletedDate,
    ...Object.keys(completedDates),
  ]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  return normalizeDailyStreakState({
    ...createDailyStreakState(),
    completedDates,
    currentStreak:
      local.lastCompletedDate === cloud.lastCompletedDate
        ? Math.max(local.currentStreak, cloud.currentStreak)
        : latestState.currentStreak,
    longestStreak: Math.max(local.longestStreak, cloud.longestStreak),
    lastCompletedDate,
    totalCompletedDays: Math.max(
      local.totalCompletedDays,
      cloud.totalCompletedDays,
      Object.keys(completedDates).length,
    ),
    freezeDates,
    freezesAvailable: Math.max(0, totalFreezeInventory - freezesUsed),
    freezesUsed,
    badges,
    lastCompletionResult: latestState.lastCompletionResult,
  });
}

function normalizeHomeResume(value: unknown): HomeResumeContext | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.track !== "string" ||
    !HOME_RESUME_TRACKS.has(value.track as HomeResumeTrack) ||
    typeof value.title !== "string" ||
    typeof value.detail !== "string" ||
    typeof value.route !== "string" ||
    !value.route.startsWith("/") ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }
  const routeParams = isRecord(value.routeParams)
    ? Object.fromEntries(
        Object.entries(value.routeParams).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : undefined;
  return {
    track: value.track as HomeResumeTrack,
    title: value.title,
    detail: value.detail,
    route: value.route,
    ...(routeParams ? { routeParams } : {}),
    updatedAt: value.updatedAt,
  };
}

export function mergeHomeResume(
  local: HomeResumeContext | null,
  cloud: HomeResumeContext | null,
): HomeResumeContext | null {
  if (!local) return cloud;
  if (!cloud) return local;
  return timestamp(local.updatedAt) >= timestamp(cloud.updatedAt)
    ? local
    : cloud;
}

export function normalizeProgressDocument(value: unknown): ProgressDocument {
  const raw = isRecord(value) ? value : {};
  const schemaVersion =
    typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1;
  if (schemaVersion > PROGRESS_SCHEMA_VERSION) {
    throw new Error("unsupported-progress-schema");
  }
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    pedagogicalProgress: normalizePedagogicalProgress(
      isRecord(raw.pedagogicalProgress)
        ? (raw.pedagogicalProgress as Partial<Progress>)
        : createInitialPedagogicalProgress(),
    ),
    dailyStreak: normalizeDailyStreakState(
      isRecord(raw.dailyStreak)
        ? (raw.dailyStreak as DailyStreakState)
        : createDailyStreakState(),
    ),
    homeResume: normalizeHomeResume(raw.homeResume),
  };
}

export function mergeProgressDocuments(
  localValue: ProgressDocument,
  cloudValue: ProgressDocument,
): ProgressDocument {
  const local = normalizeProgressDocument(localValue);
  const cloud = normalizeProgressDocument(cloudValue);
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    pedagogicalProgress: mergePedagogicalProgress(
      local.pedagogicalProgress,
      cloud.pedagogicalProgress,
    ),
    dailyStreak: mergeDailyStreak(local.dailyStreak, cloud.dailyStreak),
    homeResume: mergeHomeResume(local.homeResume, cloud.homeResume),
  };
}

export type ProgressReconciliation = {
  merged: ProgressDocument;
  shouldWriteLocal: boolean;
  shouldUpload: boolean;
};

export function reconcileProgressDocuments(
  localValue: ProgressDocument,
  cloudValue: ProgressDocument | null,
): ProgressReconciliation {
  const local = normalizeProgressDocument(localValue);
  const cloud = cloudValue ? normalizeProgressDocument(cloudValue) : null;
  const merged = cloud ? mergeProgressDocuments(local, cloud) : local;
  const mergedFingerprint = JSON.stringify(merged);
  return {
    merged,
    shouldWriteLocal: mergedFingerprint !== JSON.stringify(local),
    shouldUpload:
      cloud === null || mergedFingerprint !== JSON.stringify(cloud),
=======
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
>>>>>>> 90924cf414d145e2066de5b63efe8194f63264d2
  };
}
