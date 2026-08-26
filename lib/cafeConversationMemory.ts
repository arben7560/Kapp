import type { CafeSpeechIntentMatch } from "./cafeSpeechIntents";

export type CafeSpeechAttemptResult =
  | "correct"
  | "understood-with-grammar-correction"
  | "word-order-error"
  | "probable-transcription-error"
  | "needs-confirmation"
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
  needsConfirmation: readonly CafeGroupedImperfection[];
  uncertainRecognition: readonly CafeGroupedImperfection[];
  canonicalReferencePhrases: readonly string[];
  recommendedPhrase: string | null;
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
      // Une intention à confirmer n'est pas automatiquement une erreur du micro.
      // On réserve cette étiquette aux cas où le moteur a réellement récupéré
      // une transcription et expose un recoveryEvent.
      return "needs-confirmation";
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

function getAttemptDiagnosticKey(
  resultType: CafeSpeechAttemptResult,
  intentId: string | null,
  feedback: string | null,
  transcript: string,
) {
  return [
    resultType,
    intentId ?? "no-intent",
    normalizeDuplicateKey(feedback ?? transcript),
  ].join("::");
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
  const inputIntentId = input.intent?.intentId ?? null;
  const currentDiagnosticKey = getAttemptDiagnosticKey(
    resultType,
    inputIntentId,
    input.result.feedback,
    input.recordedTranscript,
  );

  const attempts = memory.attempts.map((attempt) => {
    const previousDiagnosticKey = getAttemptDiagnosticKey(
      attempt.resultType,
      attempt.intentId,
      attempt.feedback,
      attempt.recordedTranscript,
    );
    const repeatsSameImperfection =
      previousDiagnosticKey === currentDiagnosticKey;
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
        intentId: inputIntentId,
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
    return attempt.feedback ?? "Mets 먹고 avant 갈게요 dans cette expression.";
  }
  if (attempt.resultType === "probable-transcription-error") {
    return (
      attempt.feedback ??
      "La reconnaissance vocale a probablement déformé un mot alors que l’intention restait identifiable."
    );
  }
  if (attempt.resultType === "needs-confirmation") {
    return (
      attempt.feedback ??
      "L’intention semble plausible, mais il manque assez de certitude pour la valider automatiquement."
    );
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
  // Deux diagnostics différents sur une même intention doivent rester séparés.
  // Seules les répétitions du même problème sont regroupées.
  return [
    attempt.nodeId,
    attempt.resultType,
    attempt.intentId ?? "no-intent",
    normalizeDuplicateKey(attempt.feedback ?? attempt.recordedTranscript),
  ].join("::");
}

const IMPERFECTION_PRIORITY: Readonly<Record<Exclude<CafeSpeechAttemptResult, "correct">, number>> = {
  "not-understood": 0,
  ambiguous: 1,
  "word-order-error": 2,
  "understood-with-grammar-correction": 3,
  "needs-confirmation": 4,
  "probable-transcription-error": 5,
};

export function groupCafeImperfections(
  attempts: readonly CafeSpeechAttempt[],
): readonly CafeGroupedImperfection[] {
  const groups = new Map<string, CafeSpeechAttempt[]>();

  for (const attempt of attempts) {
    if (attempt.resultType === "correct") continue;
    const key = getImperfectionGroupKey(attempt);
    groups.set(key, [...(groups.get(key) ?? []), attempt]);
  }

  return Array.from(groups.entries())
    .map(([id, groupedAttempts]) => {
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
    })
    .sort((left, right) => {
      if (left.correctedDuringScene !== right.correctedDuringScene) {
        return left.correctedDuringScene ? 1 : -1;
      }
      return (
        IMPERFECTION_PRIORITY[left.resultType] -
        IMPERFECTION_PRIORITY[right.resultType]
      );
    });
}

function getSuccessfulPoints(attempts: readonly CafeSpeechAttempt[]) {
  const acceptedResultTypes = new Set<CafeSpeechAttemptResult>([
    "correct",
    "understood-with-grammar-correction",
    "probable-transcription-error",
  ]);
  const acceptedAttempts = attempts.filter(({ resultType }) =>
    acceptedResultTypes.has(resultType),
  );
  const understoodIntentIds = new Set(
    acceptedAttempts
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
  if (
    understoodIntentIds.has("receipt-yes") ||
    understoodIntentIds.has("receipt-no")
  ) {
    points.push("Décision concernant le reçu comprise");
  }

  const directCorrectCount = attempts.filter(
    ({ resultType }) => resultType === "correct",
  ).length;
  if (directCorrectCount > 0) {
    points.push(
      `${directCorrectCount} ${directCorrectCount > 1 ? "réponses validées" : "réponse validée"} sans correction`,
    );
  }

  const resolvedCount = attempts.filter(
    ({ resultType, correctedDuringScene }) =>
      resultType !== "correct" && correctedDuringScene,
  ).length;
  if (resolvedCount > 0) {
    points.push(
      `${resolvedCount} ${resolvedCount > 1 ? "difficultés résolues" : "difficulté résolue"} pendant la scène`,
    );
  }

  return points;
}

function pickRecommendedPhrase(
  improvements: readonly CafeGroupedImperfection[],
  needsConfirmation: readonly CafeGroupedImperfection[],
  uncertainRecognition: readonly CafeGroupedImperfection[],
  canonicalReferencePhrases: readonly string[],
) {
  const priorityItems = [
    ...improvements.filter(({ correctedDuringScene }) => !correctedDuringScene),
    ...improvements.filter(({ correctedDuringScene }) => correctedDuringScene),
    ...needsConfirmation,
    ...uncertainRecognition,
  ];
  const priorityPhrase = priorityItems.find(
    ({ canonicalFormulation }) => Boolean(canonicalFormulation),
  )?.canonicalFormulation;

  return priorityPhrase ?? canonicalReferencePhrases[0] ?? null;
}

export function buildCafeConversationSummary(
  memory: CafeConversationMemory,
): CafeConversationSummary {
  const groupedImperfections = groupCafeImperfections(memory.attempts);
  const improvements = groupedImperfections.filter(
    ({ resultType }) =>
      resultType !== "probable-transcription-error" &&
      resultType !== "needs-confirmation",
  );
  const needsConfirmation = groupedImperfections.filter(
    ({ resultType }) => resultType === "needs-confirmation",
  );
  const uncertainRecognition = groupedImperfections.filter(
    ({ resultType }) => resultType === "probable-transcription-error",
  );
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
    improvements,
    needsConfirmation,
    uncertainRecognition,
    canonicalReferencePhrases,
    recommendedPhrase: pickRecommendedPhrase(
      improvements,
      needsConfirmation,
      uncertainRecognition,
      canonicalReferencePhrases,
    ),
  };
}
