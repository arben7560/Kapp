import type { CafeSpeechIntentMatch } from "./cafeSpeechIntents";

export type CafeSpeechAttemptResult =
  | "correct"
  | "understood-with-grammar-correction"
  | "word-order-error"
  | "probable-transcription-error"
  | "ambiguous"
  | "not-understood";

export type CafeSpeechAttempt = Readonly<{
  id: string;
  nodeId: string;
  stepIndex: number;
  stepLabel: string;
  recordedTranscript: string;
  intentId: string | null;
  detectedIntent: string | null;
  canonicalFormulation: string | null;
  resultType: CafeSpeechAttemptResult;
  feedback: string | null;
  attemptNumber: number;
  correctedDuringScene: boolean;
  correctedByAttemptId: string | null;
}>;

export type CafeConversationMemory = Readonly<{
  attempts: readonly CafeSpeechAttempt[];
}>;

export type CafeGroupedImperfection = Readonly<{
  id: string;
  nodeId: string;
  stepLabel: string;
  recordedTranscripts: readonly string[];
  intentId: string | null;
  detectedIntent: string | null;
  canonicalFormulation: string | null;
  resultType: Exclude<CafeSpeechAttemptResult, "correct">;
  explanation: string;
  feedback: string | null;
  attemptCount: number;
  correctedDuringScene: boolean;
}>;

export type CafeConversationSummary = Readonly<{
  directSuccesses: number;
  understoodWithCorrection: number;
  newAttempts: number;
  notUnderstood: number;
  successfulPoints: readonly string[];
  improvements: readonly CafeGroupedImperfection[];
  uncertainRecognition: readonly CafeGroupedImperfection[];
  canonicalReferencePhrases: readonly string[];
}>;

type RecordCafeSpeechAttemptInput = Readonly<{
  nodeId: string;
  stepIndex: number;
  stepLabel: string;
  recordedTranscript: string;
  result: CafeSpeechIntentMatch;
  intent?: Readonly<{
    intentId: string;
    detectedIntent: string;
    canonicalFormulation: string;
  }> | null;
}>;

export const EMPTY_CAFE_CONVERSATION_MEMORY: CafeConversationMemory = {
  attempts: [],
};

export function createCafeConversationMemory(): CafeConversationMemory {
  return { attempts: [] };
}

function classifyResult(
  result: CafeSpeechIntentMatch,
): CafeSpeechAttemptResult {
  switch (result.reason) {
    case "word-order-error":
      return "word-order-error";
    case "uncertain":
      return "probable-transcription-error";
    case "ambiguous":
      return "ambiguous";
    case "out-of-scope":
    case "empty":
      return "not-understood";
    case "matched":
      if (result.recoveryEvent) return "probable-transcription-error";
      if (result.feedback) return "understood-with-grammar-correction";
      return "correct";
  }
}

function normalizeDuplicateKey(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[\s\p{P}\p{S}]+/gu, "")
    .trim();
}

export function recordCafeSpeechAttempt(
  memory: CafeConversationMemory,
  input: RecordCafeSpeechAttemptInput,
): CafeConversationMemory {
  const resultType = classifyResult(input.result);
  const attemptNumber =
    memory.attempts.filter(({ nodeId }) => nodeId === input.nodeId).length + 1;
  const id = `${input.nodeId}:${attemptNumber}`;
  const choice = input.result.choice;

  const attempts = memory.attempts.map((attempt) => {
    const repeatsSameImperfection =
      attempt.resultType === resultType &&
      attempt.intentId === (input.intent?.intentId ?? null);
    const isLaterSuccess =
      input.result.reason === "matched" &&
      attempt.nodeId === input.nodeId &&
      attempt.resultType !== "correct" &&
      !attempt.correctedDuringScene &&
      !repeatsSameImperfection;

    return isLaterSuccess
      ? {
          ...attempt,
          correctedDuringScene: true,
          correctedByAttemptId: id,
        }
      : attempt;
  });

  return {
    attempts: [
      ...attempts,
      {
        id,
        nodeId: input.nodeId,
        stepIndex: input.stepIndex,
        stepLabel: input.stepLabel,
        recordedTranscript: input.recordedTranscript.trim(),
        intentId: input.intent?.intentId ?? null,
        detectedIntent:
          input.intent?.detectedIntent ?? choice?.label ?? null,
        canonicalFormulation:
          input.intent?.canonicalFormulation ?? choice?.korean ?? null,
        resultType,
        feedback: input.result.feedback,
        attemptNumber,
        correctedDuringScene: false,
        correctedByAttemptId: null,
      },
    ],
  };
}

export function markCafeSpeechNodeCorrected(
  memory: CafeConversationMemory,
  nodeId: string,
  successfulAttemptId: string,
): CafeConversationMemory {
  return {
    attempts: memory.attempts.map((attempt) =>
      attempt.nodeId === nodeId &&
      attempt.id !== successfulAttemptId &&
      attempt.resultType !== "correct" &&
      !attempt.correctedDuringScene
        ? {
            ...attempt,
            correctedDuringScene: true,
            correctedByAttemptId: successfulAttemptId,
          }
        : attempt,
    ),
  };
}

function getExplanation(attempt: CafeSpeechAttempt) {
  if (attempt.resultType === "word-order-error") {
    return "Mets 먹고 avant 갈게요 dans cette expression.";
  }
  if (attempt.resultType === "probable-transcription-error") {
    return "Le micro a peut-être déformé un mot.";
  }
  if (attempt.resultType === "ambiguous") {
    return attempt.feedback ?? "Choisis une seule réponse.";
  }
  if (attempt.resultType === "not-understood") {
    return attempt.feedback ?? "Cette réponse ne convient pas ici.";
  }
  return attempt.feedback ?? "Essaie une formulation plus naturelle.";
}

function getImperfectionGroupKey(attempt: CafeSpeechAttempt) {
  const detailKey =
    attempt.intentId ??
    normalizeDuplicateKey(attempt.feedback ?? attempt.recordedTranscript);
  return [attempt.nodeId, attempt.resultType, detailKey].join("::");
}

export function groupCafeImperfections(
  attempts: readonly CafeSpeechAttempt[],
): readonly CafeGroupedImperfection[] {
  const groups = new Map<string, CafeSpeechAttempt[]>();

  for (const attempt of attempts) {
    if (attempt.resultType === "correct") continue;
    const key = getImperfectionGroupKey(attempt);
    groups.set(key, [...(groups.get(key) ?? []), attempt]);
  }

  return Array.from(groups.entries()).map(([id, groupedAttempts]) => {
    const first = groupedAttempts[0];
    const recordedTranscripts = Array.from(
      new Set(
        groupedAttempts
          .map(({ recordedTranscript }) => recordedTranscript.trim())
          .filter(Boolean),
      ),
    );

    return {
      id,
      nodeId: first.nodeId,
      stepLabel: first.stepLabel,
      recordedTranscripts,
      intentId: first.intentId,
      detectedIntent: first.detectedIntent,
      canonicalFormulation: first.canonicalFormulation,
      resultType: first.resultType as Exclude<
        CafeSpeechAttemptResult,
        "correct"
      >,
      explanation: getExplanation(first),
      feedback: first.feedback,
      attemptCount: groupedAttempts.length,
      correctedDuringScene: groupedAttempts.some(
        ({ correctedDuringScene }) => correctedDuringScene,
      ),
    };
  });
}

function getSuccessfulPoints(attempts: readonly CafeSpeechAttempt[]) {
  const understoodIntentIds = new Set(
    attempts
      .filter(
        ({ resultType }) =>
          resultType === "correct" ||
          resultType === "understood-with-grammar-correction" ||
          resultType === "word-order-error" ||
          resultType === "probable-transcription-error",
      )
      .map(({ intentId }) => intentId)
      .filter((intentId): intentId is string => Boolean(intentId)),
  );
  const points: string[] = [];

  if (
    [
      "americano-order",
      "orange-juice-order",
      "latte-order",
      "cheesecake-order",
    ].some((id) => understoodIntentIds.has(id))
  ) {
    points.push("Produit correctement commandé");
  }
  if (
    understoodIntentIds.has("eat-here") ||
    understoodIntentIds.has("takeout")
  ) {
    points.push("Choix sur place ou à emporter compris");
  }
  if (
    understoodIntentIds.has("card-payment") ||
    understoodIntentIds.has("cash-payment")
  ) {
    points.push("Moyen de paiement correctement exprimé");
  }
  if (attempts.some(({ resultType }) => resultType === "correct")) {
    points.push("Réponse naturelle et polie");
  }

  return points;
}

export function buildCafeConversationSummary(
  memory: CafeConversationMemory,
): CafeConversationSummary {
  const groupedImperfections = groupCafeImperfections(memory.attempts);
  const canonicalReferencePhrases = Array.from(
    new Set(
      memory.attempts
        .map(({ canonicalFormulation }) => canonicalFormulation)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  return {
    directSuccesses: memory.attempts.filter(
      ({ resultType, attemptNumber }) =>
        resultType === "correct" && attemptNumber === 1,
    ).length,
    understoodWithCorrection: memory.attempts.filter(
      ({ resultType }) =>
        resultType === "understood-with-grammar-correction",
    ).length,
    newAttempts: memory.attempts.filter(
      ({ attemptNumber }) => attemptNumber > 1,
    ).length,
    notUnderstood: memory.attempts.filter(
      ({ resultType }) =>
        resultType === "ambiguous" || resultType === "not-understood",
    ).length,
    successfulPoints: getSuccessfulPoints(memory.attempts),
    improvements: groupedImperfections.filter(
      ({ resultType }) => resultType !== "probable-transcription-error",
    ),
    uncertainRecognition: groupedImperfections.filter(
      ({ resultType }) => resultType === "probable-transcription-error",
    ),
    canonicalReferencePhrases,
  };
}
