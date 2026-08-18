import assert from "node:assert/strict";
import test from "node:test";

import {
  ACCOUNT_PROTECTION_LOGOUT_GUARD_MS,
  ACCOUNT_PROTECTION_PROMPT_COOLDOWN_MS,
  createAccountProtectionPromptSessionGuard,
  getMeaningfulProgressCount,
  hasMeaningfulProgress,
  shouldShowAccountProtectionPrompt,
} from "../lib/accountProtectionPrompt.ts";

function progressFixture(overrides = {}) {
  return {
    completed: {},
    hangulProgress: { lessons: {}, masteredCharacters: {} },
    grammarProgress: { schemaVersion: 1, concepts: {}, stages: {} },
    ...overrides,
  };
}

const emptyPromptState = {
  dismissedAt: null,
  dismissedProgressCount: 0,
  suppressedUntil: null,
};

test("meaningful progress ignores passive or initial store values", () => {
  const progress = progressFixture({ learningTrack: "hangul", xp: 120 });

  assert.equal(getMeaningfulProgressCount(progress), 0);
  assert.equal(hasMeaningfulProgress(progress), false);
});

test("completed learning records, Hangul scenes and grammar sessions count", () => {
  const progress = progressFixture({
    completed: { listen_dictation_1: true, ignored_false_value: false },
    hangulProgress: {
      masteredCharacters: {},
      lessons: {
        vowels: {
          discovered: {},
          completedScenes: { introduction: true },
          masteredScenes: {},
          scores: {},
          errorsByCharacter: {},
        },
      },
    },
    grammarProgress: {
      schemaVersion: 1,
      concepts: {},
      stages: {
        "sentence-structure": {
          attempts: 1,
          bestScore: 80,
          completedSessionIds: ["session-1"],
          streakSessionIds: [],
        },
      },
    },
  });

  assert.equal(getMeaningfulProgressCount(progress), 3);
  assert.equal(hasMeaningfulProgress(progress), true);
});

test("the prompt requires an anonymous user with completed learning", () => {
  assert.equal(
    shouldShowAccountProtectionPrompt({
      isAnonymous: true,
      meaningfulProgressCount: 1,
      promptState: emptyPromptState,
    }),
    true,
  );
  assert.equal(
    shouldShowAccountProtectionPrompt({
      isAnonymous: false,
      meaningfulProgressCount: 1,
      promptState: emptyPromptState,
    }),
    false,
  );
  assert.equal(
    shouldShowAccountProtectionPrompt({
      isAnonymous: true,
      meaningfulProgressCount: 0,
      promptState: emptyPromptState,
    }),
    false,
  );
});

test("dismissal needs both seven days and new meaningful progress", () => {
  const now = Date.UTC(2026, 7, 18, 12);
  const promptState = {
    dismissedAt: new Date(now).toISOString(),
    dismissedProgressCount: 2,
    suppressedUntil: null,
  };

  assert.equal(
    shouldShowAccountProtectionPrompt({
      isAnonymous: true,
      meaningfulProgressCount: 3,
      promptState,
      now: now + ACCOUNT_PROTECTION_PROMPT_COOLDOWN_MS - 1,
    }),
    false,
  );
  assert.equal(
    shouldShowAccountProtectionPrompt({
      isAnonymous: true,
      meaningfulProgressCount: 2,
      promptState,
      now: now + ACCOUNT_PROTECTION_PROMPT_COOLDOWN_MS,
    }),
    false,
  );
  assert.equal(
    shouldShowAccountProtectionPrompt({
      isAnonymous: true,
      meaningfulProgressCount: 3,
      promptState,
      now: now + ACCOUNT_PROTECTION_PROMPT_COOLDOWN_MS,
    }),
    true,
  );
});

test("the post-logout guard blocks the prompt for 24 hours", () => {
  const now = Date.UTC(2026, 7, 18, 12);
  const promptState = {
    ...emptyPromptState,
    suppressedUntil: new Date(
      now + ACCOUNT_PROTECTION_LOGOUT_GUARD_MS,
    ).toISOString(),
  };

  assert.equal(
    shouldShowAccountProtectionPrompt({
      isAnonymous: true,
      meaningfulProgressCount: 2,
      promptState,
      now: now + ACCOUNT_PROTECTION_LOGOUT_GUARD_MS - 1,
    }),
    false,
  );
});

test("the session guard skips the first Hub visit and prevents repeats", () => {
  const guard = createAccountProtectionPromptSessionGuard();

  assert.equal(guard.beginHubVisit(), false);
  assert.equal(guard.beginHubVisit(), true);
  guard.markPromptShown();
  assert.equal(guard.beginHubVisit(), false);
});
