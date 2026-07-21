import type {
  GrammarConceptId,
  GrammarMasteryState,
  GrammarPrerequisite,
  GrammarStageId,
} from "../../data/grammar/types";

export type GrammarPrerequisiteContext = {
  conceptStates?: Partial<Record<GrammarConceptId, GrammarMasteryState>>;
  stageStates?: Partial<Record<GrammarStageId, GrammarMasteryState>>;
  completedContentRefIds?: ReadonlySet<string>;
  getConceptState?: (conceptId: GrammarConceptId) => GrammarMasteryState;
  getStageState?: (stageId: GrammarStageId) => GrammarMasteryState;
  isContentCompleted?: (contentRefId: string) => boolean;
};

export type GrammarPrerequisiteActualState =
  | GrammarMasteryState
  | "completed"
  | "not-completed";

export type MissingGrammarPrerequisite = {
  prerequisite: GrammarPrerequisite;
  actual: GrammarPrerequisiteActualState;
};

export type GrammarPrerequisiteEvaluation = {
  missingRecommended: readonly MissingGrammarPrerequisite[];
  missingBlocking: readonly MissingGrammarPrerequisite[];
  canOpen: boolean;
};

const MASTERY_STATE_RANK = {
  unseen: 0,
  discovered: 1,
  practiced: 2,
  mastered: 3,
} as const satisfies Record<GrammarMasteryState, number>;

function getConceptState(
  conceptId: GrammarConceptId,
  context: GrammarPrerequisiteContext,
): GrammarMasteryState {
  return (
    context.getConceptState?.(conceptId) ??
    context.conceptStates?.[conceptId] ??
    "unseen"
  );
}

function getStageState(
  stageId: GrammarStageId,
  context: GrammarPrerequisiteContext,
): GrammarMasteryState {
  return (
    context.getStageState?.(stageId) ??
    context.stageStates?.[stageId] ??
    "unseen"
  );
}

function isContentCompleted(
  contentRefId: string,
  context: GrammarPrerequisiteContext,
): boolean {
  return (
    context.isContentCompleted?.(contentRefId) ??
    context.completedContentRefIds?.has(contentRefId) ??
    false
  );
}

function evaluatePrerequisite(
  prerequisite: GrammarPrerequisite,
  context: GrammarPrerequisiteContext,
): { met: boolean; actual: GrammarPrerequisiteActualState } {
  switch (prerequisite.kind) {
    case "concept": {
      const actual = getConceptState(prerequisite.conceptId, context);
      return {
        actual,
        met:
          MASTERY_STATE_RANK[actual] >=
          MASTERY_STATE_RANK[prerequisite.minimum],
      };
    }
    case "stage": {
      const actual = getStageState(prerequisite.stageId, context);
      return {
        actual,
        met:
          MASTERY_STATE_RANK[actual] >=
          MASTERY_STATE_RANK[prerequisite.minimum],
      };
    }
    case "content": {
      const completed = isContentCompleted(
        prerequisite.contentRefId,
        context,
      );
      return {
        actual: completed ? "completed" : "not-completed",
        met: completed,
      };
    }
  }
}

export function isGrammarPrerequisiteMet(
  prerequisite: GrammarPrerequisite,
  context: GrammarPrerequisiteContext = {},
): boolean {
  return evaluatePrerequisite(prerequisite, context).met;
}

export function evaluateGrammarPrerequisites(
  prerequisites: readonly GrammarPrerequisite[],
  context: GrammarPrerequisiteContext = {},
): GrammarPrerequisiteEvaluation {
  const missingRecommended: MissingGrammarPrerequisite[] = [];
  const missingBlocking: MissingGrammarPrerequisite[] = [];

  for (const prerequisite of prerequisites) {
    const result = evaluatePrerequisite(prerequisite, context);
    if (result.met) continue;

    const missing = {
      prerequisite,
      actual: result.actual,
    } satisfies MissingGrammarPrerequisite;

    if (prerequisite.policy === "blocking") {
      missingBlocking.push(missing);
    } else {
      missingRecommended.push(missing);
    }
  }

  return {
    missingRecommended,
    missingBlocking,
    canOpen: missingBlocking.length === 0,
  };
}
