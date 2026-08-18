import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ACCOUNT_PROTECTION_LOGOUT_GUARD_MS,
  type AccountProtectionPromptState,
} from "./accountProtectionPrompt";

export const ACCOUNT_PROTECTION_PROMPT_STORAGE_KEY =
  "kapp:account-protection-prompt:v1";

const EMPTY_PROMPT_STATE: AccountProtectionPromptState = {
  dismissedAt: null,
  dismissedProgressCount: 0,
  suppressedUntil: null,
};

function normalizePromptState(value: unknown): AccountProtectionPromptState {
  if (!value || typeof value !== "object") return EMPTY_PROMPT_STATE;

  const candidate = value as Partial<AccountProtectionPromptState>;

  return {
    dismissedAt:
      typeof candidate.dismissedAt === "string"
        ? candidate.dismissedAt
        : null,
    dismissedProgressCount:
      typeof candidate.dismissedProgressCount === "number" &&
      Number.isFinite(candidate.dismissedProgressCount)
        ? Math.max(0, candidate.dismissedProgressCount)
        : 0,
    suppressedUntil:
      typeof candidate.suppressedUntil === "string"
        ? candidate.suppressedUntil
        : null,
  };
}

export async function readAccountProtectionPromptState() {
  const stored = await AsyncStorage.getItem(
    ACCOUNT_PROTECTION_PROMPT_STORAGE_KEY,
  );

  if (!stored) return EMPTY_PROMPT_STATE;

  try {
    return normalizePromptState(JSON.parse(stored));
  } catch {
    return EMPTY_PROMPT_STATE;
  }
}

export async function dismissAccountProtectionPrompt(
  meaningfulProgressCount: number,
  now = Date.now(),
) {
  const current = await readAccountProtectionPromptState();
  const next: AccountProtectionPromptState = {
    ...current,
    dismissedAt: new Date(now).toISOString(),
    dismissedProgressCount: Math.max(0, meaningfulProgressCount),
  };

  await AsyncStorage.setItem(
    ACCOUNT_PROTECTION_PROMPT_STORAGE_KEY,
    JSON.stringify(next),
  );
}

export async function suppressAccountProtectionPromptAfterLogout(
  now = Date.now(),
) {
  const current = await readAccountProtectionPromptState();
  const next: AccountProtectionPromptState = {
    ...current,
    suppressedUntil: new Date(
      now + ACCOUNT_PROTECTION_LOGOUT_GUARD_MS,
    ).toISOString(),
  };

  await AsyncStorage.setItem(
    ACCOUNT_PROTECTION_PROMPT_STORAGE_KEY,
    JSON.stringify(next),
  );
}
