import type { Progress, LearningTrack } from "../_store";
import type {
  HangulDetailedProgress,
  HangulLessonProgress,
  HangulQuestion,
  HangulQuizSession,
  HangulSceneScore,
} from "../data/hangul/types";
import { normalizeGrammarLearningProgress } from "./grammar/learning.ts";

export const CURRENT_PROGRESS_SCHEMA_VERSION = 1 as const;

const LEARNING_TRACKS: ReadonlySet<string> = new Set([
  "hangul",
  "grammar",
  "vocab",
  "numbers",
  "classifier",
  "dialogs",
  "listen",
  "immersion",
  "cafe_ia",
  "restaurant_ia",
  "metro_ia",
  "aeroport_ia",
]);

const HANGUL_QUESTION_TYPES = new Set([
  "audio-to-character",
  "character-to-sound",
  "assemble",
  "layout",
  "read",
  "batchim",
  "contrast",
]);

export class InvalidProgressSnapshotError extends Error {
  constructor(message: string) {
    super(`Invalid progress snapshot: ${message}`);
    this.name = "InvalidProgressSnapshotError";
  }
}

export class UnsupportedProgressSchemaVersionError extends Error {
  readonly schemaVersion: number;

  constructor(schemaVersion: number) {
    super(
      `Unsupported progress schema version ${schemaVersion}; ` +
        `this app supports ${CURRENT_PROGRESS_SCHEMA_VERSION}.`,
    );
    this.name = "UnsupportedProgressSchemaVersionError";
    this.schemaVersion = schemaVersion;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return isFiniteNonNegativeNumber(value) && Number.isInteger(value);
}

function isLearningTrack(value: unknown): value is LearningTrack {
  return value === null ||
    (typeof value === "string" &&
      LEARNING_TRACKS.has(value));
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === "boolean");
}

function isTrueRecord(value: unknown): value is Record<string, true> {
  return isRecord(value) && Object.values(value).every((entry) => entry === true);
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) &&
    Object.values(value).every(isFiniteNonNegativeNumber);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.every((entry) => typeof entry === "string");
}

function isHangulSceneScore(value: unknown): value is HangulSceneScore {
  return isRecord(value) &&
    isFiniteNonNegativeNumber(value.bestScore) &&
    isNonNegativeInteger(value.total) &&
    isNonNegativeInteger(value.attempts);
}

function isHangulQuestion(value: unknown): value is HangulQuestion {
  if (!isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.type !== "string" ||
    !HANGUL_QUESTION_TYPES.has(value.type) ||
    typeof value.prompt !== "string" ||
    !Array.isArray(value.options) ||
    typeof value.answer !== "string" ||
    typeof value.explanation !== "string" ||
    !isStringArray(value.characters)) {
    return false;
  }

  if (value.display !== undefined && typeof value.display !== "string") {
    return false;
  }
  if (value.audio !== undefined && typeof value.audio !== "string") {
    return false;
  }

  return value.options.every(
    (option) =>
      isRecord(option) &&
      typeof option.value === "string" &&
      typeof option.label === "string" &&
      (option.audio === undefined || typeof option.audio === "string"),
  );
}

function isHangulQuizSession(value: unknown): value is HangulQuizSession {
  return isRecord(value) &&
    typeof value.sceneId === "string" &&
    Array.isArray(value.questions) &&
    value.questions.every(isHangulQuestion) &&
    isNonNegativeInteger(value.questionIndex) &&
    (value.answered === null || typeof value.answered === "string") &&
    isFiniteNonNegativeNumber(value.score) &&
    isTrueRecord(value.correctQuestionIds) &&
    isStringArray(value.roundIncorrectQuestionIds) &&
    isNonNegativeInteger(value.round) &&
    isStringArray(value.originalQuestionIds) &&
    isNonNegativeInteger(value.originalQuestionCount);
}

function isHangulLessonProgress(value: unknown): value is HangulLessonProgress {
  if (!isRecord(value) ||
    !isTrueRecord(value.discovered) ||
    !isTrueRecord(value.completedScenes) ||
    !isTrueRecord(value.masteredScenes) ||
    !isRecord(value.scores) ||
    !Object.values(value.scores).every(isHangulSceneScore) ||
    !isNumberRecord(value.errorsByCharacter)) {
    return false;
  }

  return (value.currentSceneId === undefined ||
      typeof value.currentSceneId === "string") &&
    (value.activeQuiz === undefined || isHangulQuizSession(value.activeQuiz));
}

function isHangulDetailedProgress(
  value: unknown,
): value is HangulDetailedProgress {
  if (!isRecord(value) ||
    !isRecord(value.lessons) ||
    !Object.values(value.lessons).every(isHangulLessonProgress) ||
    !isTrueRecord(value.masteredCharacters)) {
    return false;
  }

  const assessment = value.assessment;
  return assessment === undefined ||
    (isRecord(assessment) &&
      isNonNegativeInteger(assessment.attempts) &&
      isFiniteNonNegativeNumber(assessment.bestScore) &&
      isNonNegativeInteger(assessment.total) &&
      typeof assessment.passed === "boolean");
}

function requireProgressV1Root(data: unknown): Record<string, unknown> {
  if (!isRecord(data)) {
    throw new InvalidProgressSnapshotError("progress_data must be an object.");
  }

  return data;
}

export function loadProgressV1(data: unknown): Progress {
  const raw = requireProgressV1Root(data);

  if (!isLearningTrack(raw.learningTrack)) {
    throw new InvalidProgressSnapshotError("learningTrack is invalid.");
  }
  if (!isFiniteNonNegativeNumber(raw.xp)) {
    throw new InvalidProgressSnapshotError("xp must be a non-negative number.");
  }
  if (!isFiniteNonNegativeNumber(raw.streak)) {
    throw new InvalidProgressSnapshotError(
      "streak must be a non-negative number.",
    );
  }
  if (!isBooleanRecord(raw.completed)) {
    throw new InvalidProgressSnapshotError(
      "completed must be a boolean record.",
    );
  }
  if (!isNonNegativeInteger(raw.hangulLevel)) {
    throw new InvalidProgressSnapshotError(
      "hangulLevel must be a non-negative integer.",
    );
  }
  if (!isHangulDetailedProgress(raw.hangulProgress)) {
    throw new InvalidProgressSnapshotError(
      "hangulProgress has an invalid structure.",
    );
  }
  if (!isRecord(raw.grammarProgress) ||
    raw.grammarProgress.schemaVersion !== 1 ||
    !isRecord(raw.grammarProgress.concepts) ||
    !isRecord(raw.grammarProgress.stages)) {
    throw new InvalidProgressSnapshotError(
      "grammarProgress must be a valid internal schemaVersion 1 envelope.",
    );
  }

  return {
    learningTrack: raw.learningTrack,
    xp: raw.xp,
    streak: raw.streak,
    completed: raw.completed,
    hangulLevel: raw.hangulLevel,
    hangulProgress: raw.hangulProgress,
    grammarProgress: normalizeGrammarLearningProgress(raw.grammarProgress),
  };
}

export function migrateProgressSnapshot(
  schemaVersion: number,
  progressData: unknown,
): Progress {
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new InvalidProgressSnapshotError(
      "schema_version must be a positive integer.",
    );
  }

  switch (schemaVersion) {
    case 1:
      return loadProgressV1(progressData);
    default:
      throw new UnsupportedProgressSchemaVersionError(schemaVersion);
  }
}
