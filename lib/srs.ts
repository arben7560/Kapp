export type SRSData = {
  lastSeen: number;
  interval: number;
};

export type SRSReviewPlan = readonly number[];

export type SRSPlannedReview = {
  offsetDays: number;
  dueAt: number;
  isDue: boolean;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function nextInterval(correct: boolean, current: number): number {
  if (!correct) return 1;

  if (current === 0) return 1;
  if (current === 1) return 3;
  if (current === 3) return 7;
  if (current === 7) return 14;

  return current * 2;
}

export function getReviewDueAt(lastSeen: number, interval: number): number {
  return lastSeen + interval * DAY_IN_MS;
}

export function shouldReview(
  lastSeen: number,
  interval: number,
  now = Date.now(),
): boolean {
  return now >= getReviewDueAt(lastSeen, interval);
}

export function normalizeReviewOffsets(
  offsets: SRSReviewPlan,
): number[] {
  return Array.from(
    new Set(
      offsets.filter(
        (offset) => Number.isFinite(offset) && offset >= 0,
      ),
    ),
  ).sort((left, right) => left - right);
}

export function getNextReviewOffset(
  offsets: SRSReviewPlan,
  completedOffsets: readonly number[],
): number | undefined {
  const completed = new Set(completedOffsets);
  return normalizeReviewOffsets(offsets).find(
    (offset) => !completed.has(offset),
  );
}

/**
 * Resolves the next checkpoint in a plan whose offsets are all measured from
 * the same anchor. This supports schedules such as J+3, J+10 and J+30 without
 * turning them into drifting intervals after a late review.
 */
export function getNextPlannedReview(
  anchorAt: number,
  offsets: SRSReviewPlan,
  completedOffsets: readonly number[],
  now = Date.now(),
): SRSPlannedReview | undefined {
  const offsetDays = getNextReviewOffset(offsets, completedOffsets);
  if (offsetDays === undefined) return undefined;

  return {
    offsetDays,
    dueAt: getReviewDueAt(anchorAt, offsetDays),
    isDue: shouldReview(anchorAt, offsetDays, now),
  };
}
