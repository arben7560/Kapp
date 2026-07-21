import {
  GRAMMAR_CONCEPT_IDS,
  GRAMMAR_STAGE_BY_ID,
  GRAMMAR_STAGE_IDS,
} from "../../data/grammar/index.ts";
import type {
  GrammarConceptId,
  GrammarLearningProgress,
  GrammarMasteryState,
  GrammarMilestoneProgress,
  GrammarPracticeSession,
  GrammarProgress,
  GrammarStageId,
  GrammarStagePracticeProgress,
} from "../../data/grammar/types";
import { evaluateGrammarPrerequisites } from "./prerequisites.ts";
import {
  createEmptyGrammarProgress,
  getGrammarMasteryState,
  normalizeGrammarProgress,
  toIsoTimestamp,
  type TimestampInput,
} from "./progress.ts";

export const GRAMMAR_PRACTICE_PASS_RATIO = 4 / 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : 0;
}

function toScore(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : 0;
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

function normalizeStageProgress(
  value: unknown,
  stageId: GrammarStageId,
): GrammarStagePracticeProgress {
  const raw = isRecord(value) ? value : {};
  const activeSession = isRecord(raw.activeSession) &&
    raw.activeSession.stageId === stageId &&
    typeof raw.activeSession.id === "string" &&
    Array.isArray(raw.activeSession.questions) &&
    Array.isArray(raw.activeSession.responses)
      ? raw.activeSession as unknown as GrammarPracticeSession
      : undefined;
  return {
    attempts: toNonNegativeInteger(raw.attempts),
    bestScore: toScore(raw.bestScore),
    ...(typeof raw.lastScore === "number" ? { lastScore: toScore(raw.lastScore) } : {}),
    ...(typeof raw.lastCompletedAt === "string"
      ? { lastCompletedAt: raw.lastCompletedAt }
      : {}),
    ...(activeSession ? { activeSession } : {}),
    completedSessionIds: uniqueStrings(raw.completedSessionIds),
    streakSessionIds: uniqueStrings(raw.streakSessionIds),
  };
}

export function createEmptyGrammarLearningProgress(): GrammarLearningProgress {
  return {
    schemaVersion: 1,
    concepts: {},
    stages: {},
  };
}

export function normalizeGrammarLearningProgress(
  value: unknown,
): GrammarLearningProgress {
  const raw = isRecord(value) ? value : {};
  const rawConcepts = isRecord(raw.concepts) ? raw.concepts : {};
  const rawStages = isRecord(raw.stages) ? raw.stages : {};
  const concepts: GrammarLearningProgress["concepts"] = {};
  const stages: GrammarLearningProgress["stages"] = {};

  for (const conceptId of GRAMMAR_CONCEPT_IDS) {
    if (rawConcepts[conceptId] !== undefined) {
      concepts[conceptId] = normalizeGrammarProgress(rawConcepts[conceptId]);
    }
  }
  for (const stageId of GRAMMAR_STAGE_IDS) {
    if (rawStages[stageId] !== undefined) {
      stages[stageId] = normalizeStageProgress(rawStages[stageId], stageId);
    }
  }
  const lastStageId = GRAMMAR_STAGE_IDS.find((stageId) => stageId === raw.lastStageId);
  return {
    schemaVersion: 1,
    concepts,
    stages,
    ...(lastStageId ? { lastStageId } : {}),
  };
}

function updateMilestone(
  milestone: GrammarMilestoneProgress | undefined,
  evaluatedAt: string,
  score: number,
): GrammarMilestoneProgress {
  return {
    firstAt: milestone?.firstAt ?? evaluatedAt,
    lastAt: evaluatedAt,
    attempts: (milestone?.attempts ?? 0) + 1,
    bestScore: Math.max(milestone?.bestScore ?? 0, score),
  };
}

function recordConceptAttempt(
  progress: GrammarProgress | undefined,
  session: GrammarPracticeSession,
  passed: boolean,
): GrammarProgress {
  const current = normalizeGrammarProgress(progress ?? createEmptyGrammarProgress());
  const completedAt = session.completedAt ?? toIsoTimestamp();
  const ratio = session.questions.length > 0 ? session.score / session.questions.length : 0;
  const milestones = {
    ...current.milestones,
    discovery: updateMilestone(current.milestones.discovery, completedAt, ratio),
    ...(passed
      ? {
          manipulation: updateMilestone(
            current.milestones.manipulation,
            completedAt,
            ratio,
          ),
        }
      : {}),
  };
  return normalizeGrammarProgress({
    ...current,
    milestones,
    criteriaEvidence: passed
      ? {
          ...current.criteriaEvidence,
          M: {
            correct: session.score,
            total: session.questions.length,
            isConstructionOrTransformation: true,
            evaluatedAt: completedAt,
          },
        }
      : current.criteriaEvidence,
    attempts: current.attempts + 1,
    lastResult: ratio,
  });
}

export function setGrammarActiveSession(
  value: GrammarLearningProgress,
  session: GrammarPracticeSession,
): GrammarLearningProgress {
  const current = normalizeGrammarLearningProgress(value);
  const stage = normalizeStageProgress(current.stages[session.stageId], session.stageId);
  return {
    ...current,
    lastStageId: session.stageId,
    stages: {
      ...current.stages,
      [session.stageId]: { ...stage, activeSession: session },
    },
  };
}

export function recordGrammarSessionCompletion(
  value: GrammarLearningProgress,
  session: GrammarPracticeSession,
): GrammarLearningProgress {
  const current = normalizeGrammarLearningProgress(value);
  if (!session.completedAt) return setGrammarActiveSession(current, session);
  const stageProgress = normalizeStageProgress(
    current.stages[session.stageId],
    session.stageId,
  );
  if (stageProgress.completedSessionIds.includes(session.id)) {
    return setGrammarActiveSession(current, session);
  }
  const ratio = session.questions.length > 0 ? session.score / session.questions.length : 0;
  const passed = ratio >= GRAMMAR_PRACTICE_PASS_RATIO;
  const stage = GRAMMAR_STAGE_BY_ID[session.stageId];
  const concepts = { ...current.concepts };
  for (const conceptId of stage.conceptIds) {
    concepts[conceptId] = recordConceptAttempt(concepts[conceptId], session, passed);
  }
  return {
    ...current,
    concepts,
    lastStageId: session.stageId,
    stages: {
      ...current.stages,
      [session.stageId]: {
        ...stageProgress,
        attempts: stageProgress.attempts + 1,
        bestScore: Math.max(stageProgress.bestScore, ratio),
        lastScore: ratio,
        lastCompletedAt: session.completedAt,
        activeSession: session,
        completedSessionIds: [...stageProgress.completedSessionIds, session.id],
      },
    },
  };
}

export function markGrammarSessionStreakRecorded(
  value: GrammarLearningProgress,
  stageId: GrammarStageId,
  sessionId: string,
): GrammarLearningProgress {
  const current = normalizeGrammarLearningProgress(value);
  const stage = normalizeStageProgress(current.stages[stageId], stageId);
  if (stage.streakSessionIds.includes(sessionId)) return current;
  return {
    ...current,
    stages: {
      ...current.stages,
      [stageId]: {
        ...stage,
        streakSessionIds: [...stage.streakSessionIds, sessionId],
      },
    },
  };
}

export function getGrammarConceptState(
  progress: GrammarLearningProgress,
  conceptId: GrammarConceptId,
): GrammarMasteryState {
  return getGrammarMasteryState(progress.concepts[conceptId]);
}

export function getGrammarStageState(
  progress: GrammarLearningProgress,
  stageId: GrammarStageId,
): GrammarMasteryState {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const states = stage.conceptIds.map((conceptId) =>
    getGrammarMasteryState(progress.concepts[conceptId], stage.validationCriteria),
  );
  if (states.length === 0 || states.every((state) => state === "unseen")) return "unseen";
  if (states.every((state) => state === "mastered")) return "mastered";
  if (states.every((state) => state === "practiced" || state === "mastered")) {
    return "practiced";
  }
  return "discovered";
}

export function getGrammarStageStates(
  progress: GrammarLearningProgress,
): Partial<Record<GrammarStageId, GrammarMasteryState>> {
  return Object.fromEntries(
    GRAMMAR_STAGE_IDS.map((stageId) => [stageId, getGrammarStageState(progress, stageId)]),
  );
}

export function getGrammarStageAccess(
  progress: GrammarLearningProgress,
  stageId: GrammarStageId,
  completedContentRefIds: ReadonlySet<string> = new Set(),
) {
  return evaluateGrammarPrerequisites(GRAMMAR_STAGE_BY_ID[stageId].prerequisites, {
    conceptStates: Object.fromEntries(
      GRAMMAR_CONCEPT_IDS.map((conceptId) => [
        conceptId,
        getGrammarConceptState(progress, conceptId),
      ]),
    ),
    stageStates: getGrammarStageStates(progress),
    completedContentRefIds,
  });
}

export function getGrammarJourneyCompletion(
  progress: GrammarLearningProgress,
): number {
  const completed = GRAMMAR_STAGE_IDS.filter((stageId) => {
    const state = getGrammarStageState(progress, stageId);
    return state === "practiced" || state === "mastered";
  }).length;
  return completed / GRAMMAR_STAGE_IDS.length;
}

export function createGrammarSessionTimestamp(
  value: TimestampInput = Date.now(),
) {
  return toIsoTimestamp(value);
}
