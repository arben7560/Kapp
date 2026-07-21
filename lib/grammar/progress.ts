import type {
  GrammarCriteriaEvidence,
  GrammarCriterion,
  GrammarLearningPhase,
  GrammarMasteryState,
  GrammarMilestoneProgress,
  GrammarProgress,
  GrammarReviewProgress,
} from "../../data/grammar/types";
import {
  getNextPlannedReview,
  normalizeReviewOffsets,
} from "../srs.ts";

export const GRAMMAR_REVIEW_OFFSETS = [3, 10, 30] as const;

export const GRAMMAR_REQUIRED_CRITERIA = [
  "R",
  "M",
  "L",
  "P",
  "D",
] as const satisfies readonly GrammarCriterion[];

export const GRAMMAR_MASTERY_THRESHOLDS = {
  R: { minimumCorrect: 4, minimumTotal: 5, minimumRatio: 4 / 5 },
  M: { minimumCorrect: 4, minimumTotal: 5, minimumRatio: 4 / 5 },
  L: { minimumCorrect: 3, minimumTotal: 4, minimumRatio: 3 / 4 },
} as const;

export type GrammarCriteriaResult = Record<GrammarCriterion, boolean>;

export type GrammarReviewCheckpoint = {
  offsetDays: number;
  dueAt: string;
  isDue: boolean;
};

export type GrammarProgressNormalizationOptions = {
  legacyCompleted?: boolean;
  legacyCompletedAt?: TimestampInput;
  requiredCriteria?: readonly GrammarCriterion[];
};

export type TimestampInput = string | number | Date;

const GRAMMAR_PHASES = [
  "discovery",
  "explanation",
  "manipulation",
  "listening",
  "production",
  "reuse",
  "review",
  "mastery",
] as const satisfies readonly GrammarLearningPhase[];

const PRACTICE_PHASES = [
  "manipulation",
  "listening",
  "production",
  "reuse",
  "review",
] as const satisfies readonly GrammarLearningPhase[];

const REVIEW_OFFSET_SET = new Set<number>(GRAMMAR_REVIEW_OFFSETS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toTimestamp(value: unknown): number | undefined {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string" || !value.trim()) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function requireTimestamp(value: TimestampInput): number {
  const timestamp = toTimestamp(value);
  if (timestamp === undefined) {
    throw new RangeError("Invalid grammar progress timestamp");
  }
  return timestamp;
}

export function toIsoTimestamp(value: TimestampInput = Date.now()): string {
  return new Date(requireTimestamp(value)).toISOString();
}

export function parseIsoTimestamp(value?: string): number | undefined {
  return toTimestamp(value);
}

function normalizeIsoTimestamp(value: unknown): string | undefined {
  const timestamp = toTimestamp(value);
  return timestamp === undefined
    ? undefined
    : new Date(timestamp).toISOString();
}

function toNonNegativeInteger(value: unknown, fallback = 0): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
    ? value
    : fallback;
}

function toFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeMilestone(
  value: unknown,
): GrammarMilestoneProgress | undefined {
  if (!isRecord(value)) return undefined;

  const firstAt = normalizeIsoTimestamp(value.firstAt);
  const lastAt = normalizeIsoTimestamp(value.lastAt);
  if (!firstAt && !lastAt) return undefined;
  const normalizedFirstAt = firstAt ?? lastAt;
  const normalizedLastAt = lastAt ?? firstAt;
  if (!normalizedFirstAt || !normalizedLastAt) return undefined;

  const bestScore = toFiniteNumber(value.bestScore);
  return {
    firstAt: normalizedFirstAt,
    lastAt: normalizedLastAt,
    attempts: toNonNegativeInteger(value.attempts),
    ...(bestScore === undefined ? {} : { bestScore }),
  };
}

function normalizeCriteriaEvidence(value: unknown): GrammarCriteriaEvidence {
  if (!isRecord(value)) return {};

  const evidence: GrammarCriteriaEvidence = {};
  const recognition = value.R;
  if (isRecord(recognition)) {
    const correct = toNonNegativeInteger(recognition.correct, -1);
    const total = toNonNegativeInteger(recognition.total, -1);
    const evaluatedAt = normalizeIsoTimestamp(recognition.evaluatedAt);
    if (correct >= 0 && total > 0 && correct <= total && evaluatedAt) {
      evidence.R = {
        correct,
        total,
        usesNovelItems: recognition.usesNovelItems === true,
        evaluatedAt,
      };
    }
  }

  const manipulation = value.M;
  if (isRecord(manipulation)) {
    const correct = toNonNegativeInteger(manipulation.correct, -1);
    const total = toNonNegativeInteger(manipulation.total, -1);
    const evaluatedAt = normalizeIsoTimestamp(manipulation.evaluatedAt);
    if (correct >= 0 && total > 0 && correct <= total && evaluatedAt) {
      evidence.M = {
        correct,
        total,
        isConstructionOrTransformation:
          manipulation.isConstructionOrTransformation === true,
        evaluatedAt,
      };
    }
  }

  const listening = value.L;
  if (isRecord(listening)) {
    const correct = toNonNegativeInteger(listening.correct, -1);
    const total = toNonNegativeInteger(listening.total, -1);
    const evaluatedAt = normalizeIsoTimestamp(listening.evaluatedAt);
    if (correct >= 0 && total > 0 && correct <= total && evaluatedAt) {
      evidence.L = {
        correct,
        total,
        textInitiallyHidden: listening.textInitiallyHidden === true,
        evaluatedAt,
      };
    }
  }

  const production = value.P;
  if (isRecord(production)) {
    const evaluatedAt = normalizeIsoTimestamp(production.evaluatedAt);
    if (evaluatedAt) {
      evidence.P = {
        contextualized: production.contextualized === true,
        acceptable: production.acceptable === true,
        evaluatedAt,
      };
    }
  }

  const delayed = value.D;
  if (isRecord(delayed)) {
    const evaluatedAt = normalizeIsoTimestamp(delayed.evaluatedAt);
    const previousEvaluatedAt = normalizeIsoTimestamp(
      delayed.previousEvaluatedAt,
    );
    const sessionId =
      typeof delayed.sessionId === "string" ? delayed.sessionId.trim() : "";
    const previousSessionId =
      typeof delayed.previousSessionId === "string"
        ? delayed.previousSessionId.trim()
        : "";
    if (evaluatedAt && previousEvaluatedAt && sessionId && previousSessionId) {
      evidence.D = {
        successful: delayed.successful === true,
        usesNovelItem: delayed.usesNovelItem === true,
        sessionId,
        previousSessionId,
        previousEvaluatedAt,
        evaluatedAt,
      };
    }
  }

  return evidence;
}

function passesScoredCriterion(
  evidence: { correct: number; total: number } | undefined,
  threshold: {
    minimumCorrect: number;
    minimumTotal: number;
    minimumRatio: number;
  },
): boolean {
  if (!evidence || evidence.total <= 0) return false;
  return (
    evidence.correct >= threshold.minimumCorrect &&
    evidence.total >= threshold.minimumTotal &&
    evidence.correct / evidence.total >= threshold.minimumRatio
  );
}

function isLaterDelayedEvaluation(
  evidence: GrammarCriteriaEvidence["D"],
): boolean {
  if (!evidence) return false;
  const evaluatedAt = parseIsoTimestamp(evidence.evaluatedAt);
  const previousEvaluatedAt = parseIsoTimestamp(
    evidence.previousEvaluatedAt,
  );
  return (
    evaluatedAt !== undefined &&
    previousEvaluatedAt !== undefined &&
    evaluatedAt > previousEvaluatedAt
  );
}

export function evaluateGrammarCriteria(
  evidence: GrammarCriteriaEvidence,
): GrammarCriteriaResult {
  return {
    R:
      evidence.R?.usesNovelItems === true &&
      passesScoredCriterion(evidence.R, GRAMMAR_MASTERY_THRESHOLDS.R),
    M:
      evidence.M?.isConstructionOrTransformation === true &&
      passesScoredCriterion(evidence.M, GRAMMAR_MASTERY_THRESHOLDS.M),
    L:
      evidence.L?.textInitiallyHidden === true &&
      passesScoredCriterion(evidence.L, GRAMMAR_MASTERY_THRESHOLDS.L),
    P:
      evidence.P?.contextualized === true &&
      evidence.P.acceptable === true,
    D:
      evidence.D?.successful === true &&
      evidence.D.usesNovelItem === true &&
      evidence.D.sessionId !== evidence.D.previousSessionId &&
      isLaterDelayedEvaluation(evidence.D),
  };
}

function uniqueRequiredCriteria(
  requiredCriteria: readonly GrammarCriterion[],
): GrammarCriterion[] {
  return Array.from(new Set(requiredCriteria));
}

export function meetsGrammarMasteryCriteria(
  evidence: GrammarCriteriaEvidence,
  requiredCriteria: readonly GrammarCriterion[] = GRAMMAR_REQUIRED_CRITERIA,
): boolean {
  const required = uniqueRequiredCriteria(requiredCriteria);
  if (required.length === 0) return false;

  const result = evaluateGrammarCriteria(evidence);
  return required.every((criterion) => result[criterion]);
}

export function isGrammarMastered(
  progress: Pick<GrammarProgress, "criteriaEvidence"> | null | undefined,
  requiredCriteria: readonly GrammarCriterion[] = GRAMMAR_REQUIRED_CRITERIA,
): boolean {
  return Boolean(
    progress &&
      meetsGrammarMasteryCriteria(progress.criteriaEvidence, requiredCriteria),
  );
}

export function createEmptyGrammarReviewProgress(): GrammarReviewProgress {
  return {
    completedOffsets: [],
    lapses: 0,
  };
}

export function createGrammarReviewProgress(
  anchorAt: TimestampInput,
): GrammarReviewProgress {
  const review: GrammarReviewProgress = {
    ...createEmptyGrammarReviewProgress(),
    anchorAt: toIsoTimestamp(anchorAt),
  };
  return withDerivedNextReview(review);
}

export function getNextGrammarReview(
  review: GrammarReviewProgress,
  now: TimestampInput = Date.now(),
): GrammarReviewCheckpoint | undefined {
  const anchorAt = parseIsoTimestamp(review.anchorAt);
  if (anchorAt === undefined) return undefined;

  const planned = getNextPlannedReview(
    anchorAt,
    GRAMMAR_REVIEW_OFFSETS,
    review.completedOffsets,
    requireTimestamp(now),
  );
  if (!planned) return undefined;

  return {
    offsetDays: planned.offsetDays,
    dueAt: new Date(planned.dueAt).toISOString(),
    isDue: planned.isDue,
  };
}

export function isGrammarReviewDue(
  review: GrammarReviewProgress,
  now: TimestampInput = Date.now(),
): boolean {
  return getNextGrammarReview(review, now)?.isDue ?? false;
}

function withDerivedNextReview(
  review: GrammarReviewProgress,
): GrammarReviewProgress {
  const nextReviewAt = getNextGrammarReview(review, 0)?.dueAt;
  return {
    ...review,
    ...(nextReviewAt ? { nextReviewAt } : { nextReviewAt: undefined }),
  };
}

function normalizeReviewProgress(value: unknown): GrammarReviewProgress {
  if (!isRecord(value)) return createEmptyGrammarReviewProgress();

  const anchorAt = normalizeIsoTimestamp(value.anchorAt);
  const rawOffsets = Array.isArray(value.completedOffsets)
    ? value.completedOffsets.filter(
        (offset): offset is number => typeof offset === "number",
      )
    : [];
  const completedOffsets = anchorAt
    ? normalizeReviewOffsets(rawOffsets).filter((offset) =>
        REVIEW_OFFSET_SET.has(offset),
      )
    : [];
  const lastReviewedAt = normalizeIsoTimestamp(value.lastReviewedAt);

  return withDerivedNextReview({
    ...(anchorAt ? { anchorAt } : {}),
    completedOffsets,
    ...(lastReviewedAt ? { lastReviewedAt } : {}),
    lapses: toNonNegativeInteger(value.lapses),
  });
}

export function createEmptyGrammarProgress(): GrammarProgress {
  return {
    schemaVersion: 1,
    milestones: {},
    criteriaEvidence: {},
    review: createEmptyGrammarReviewProgress(),
    attempts: 0,
  };
}

export function createGrammarProgressFromLegacyCompleted(
  completed: boolean,
  completedAt: TimestampInput = Date.now(),
): GrammarProgress {
  const progress = createEmptyGrammarProgress();
  if (!completed) return progress;

  const timestamp = toIsoTimestamp(completedAt);
  return {
    ...progress,
    milestones: {
      discovery: {
        firstAt: timestamp,
        lastAt: timestamp,
        attempts: 1,
      },
    },
  };
}

function latestCriteriaTimestamp(
  evidence: GrammarCriteriaEvidence,
  requiredCriteria: readonly GrammarCriterion[],
): string | undefined {
  const timestamps = uniqueRequiredCriteria(requiredCriteria)
    .map((criterion) => evidence[criterion]?.evaluatedAt)
    .map((value) => parseIsoTimestamp(value))
    .filter((value): value is number => value !== undefined);
  if (timestamps.length === 0) return undefined;
  return new Date(Math.max(...timestamps)).toISOString();
}

export function normalizeGrammarProgress(
  value: unknown,
  options: GrammarProgressNormalizationOptions = {},
): GrammarProgress {
  const raw = isRecord(value) ? value : {};
  const milestones: GrammarProgress["milestones"] = {};
  const rawMilestones = isRecord(raw.milestones) ? raw.milestones : {};

  for (const phase of GRAMMAR_PHASES) {
    const milestone = normalizeMilestone(rawMilestones[phase]);
    if (milestone) milestones[phase] = milestone;
  }

  if (options.legacyCompleted && !milestones.discovery) {
    const timestamp = toIsoTimestamp(
      options.legacyCompletedAt ?? Date.now(),
    );
    milestones.discovery = {
      firstAt: timestamp,
      lastAt: timestamp,
      attempts: 1,
    };
  }

  const criteriaEvidence = normalizeCriteriaEvidence(raw.criteriaEvidence);
  const requiredCriteria =
    options.requiredCriteria ?? GRAMMAR_REQUIRED_CRITERIA;
  const mastered = meetsGrammarMasteryCriteria(
    criteriaEvidence,
    requiredCriteria,
  );

  if (!mastered) {
    delete milestones.mastery;
  } else if (!milestones.mastery) {
    const masteredAt = latestCriteriaTimestamp(
      criteriaEvidence,
      requiredCriteria,
    );
    if (masteredAt) {
      milestones.mastery = {
        firstAt: masteredAt,
        lastAt: masteredAt,
        attempts: 1,
      };
    }
  }

  let review = normalizeReviewProgress(raw.review);
  if (mastered && !review.anchorAt && milestones.mastery) {
    review = createGrammarReviewProgress(milestones.mastery.firstAt);
  }

  const lastResult = toFiniteNumber(raw.lastResult);
  return {
    schemaVersion: 1,
    milestones,
    criteriaEvidence,
    review,
    attempts: toNonNegativeInteger(raw.attempts),
    ...(lastResult === undefined ? {} : { lastResult }),
  };
}

export function getGrammarMasteryState(
  progress: GrammarProgress | null | undefined,
  requiredCriteria: readonly GrammarCriterion[] = GRAMMAR_REQUIRED_CRITERIA,
): GrammarMasteryState {
  if (!progress) return "unseen";
  if (isGrammarMastered(progress, requiredCriteria)) return "mastered";

  const hasCriteriaEvidence = GRAMMAR_REQUIRED_CRITERIA.some(
    (criterion) => progress.criteriaEvidence[criterion] !== undefined,
  );
  const hasPracticeMilestone = PRACTICE_PHASES.some(
    (phase) => progress.milestones[phase] !== undefined,
  );
  if (
    hasCriteriaEvidence ||
    hasPracticeMilestone ||
    progress.review.completedOffsets.length > 0 ||
    progress.review.lastReviewedAt !== undefined
  ) {
    return "practiced";
  }

  if (
    progress.attempts > 0 ||
    Object.keys(progress.milestones).length > 0
  ) {
    return "discovered";
  }

  return "unseen";
}
