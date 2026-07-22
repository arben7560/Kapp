export const GRAMMAR_CONCEPT_IDS = [
  "sentence-order",
  "copula-ieyo-yeyo",
  "polite-style-yo",
  "copula-imnida",
  "topic-eun-neun",
  "demonstratives-i-geu-jeo",
  "question-mwo-nugu-myeot",
  "subject-i-ga",
  "existence-isseoyo-eopseoyo",
  "location-e",
  "present-a-eoyo",
  "object-eul-reul",
  "action-location-eseo",
  "destination-time-e",
  "possession-ui-je-nae",
  "interrogatives-basic",
  "negation-an",
  "copula-negation-anieyo",
  "request-n-juseyo",
  "native-numbers",
  "classifiers-basic",
  "sino-korean-numbers",
  "noun-link-hago-irang",
  "alternative-ina-animyeon",
  "request-v-a-eo-juseyo",
  "polite-instruction-euseyo",
  "direction-means-ro-euro",
  "desire-go-sipeoyo",
  "ability-eul-su-isseoyo",
  "permission-a-eodo-dwaeyo",
  "inability-mot",
  "additive-do",
  "restrictive-man",
  "range-buteo-kkaji",
  "past-ass-eosseoyo",
  "future-eul-geoyeyo",
  "intention-eulgeyo",
  "sequence-go",
  "reason-a-eoseo",
  "contrast-jiman",
  "condition-eumyeon",
  "obligation-a-eoya-haeyo",
  "comparison-boda-deo-jeil",
  "suggestion-eulkkayo",
  "honorific-si",
] as const;

export type GrammarConceptId = (typeof GRAMMAR_CONCEPT_IDS)[number];

export const GRAMMAR_STAGE_IDS = [
  "sentence-structure",
  "identify-with-copula",
  "polite-register",
  "introduce-topic",
  "demonstratives",
  "nominal-questions",
  "existence",
  "locate-thing",
  "present-actions",
  "object-actions",
  "action-location",
  "destination-and-time",
  "possession",
  "information-questions",
  "simple-negation",
  "request-item",
  "request-quantity",
  "sino-number-contexts",
  "coordinate-items",
  "choose-alternative",
  "request-action",
  "polite-instructions",
  "direction-and-means",
  "express-desire",
  "express-ability",
  "ask-permission",
  "express-inability",
  "add-item",
  "limit-request",
  "range-and-limit",
  "past-event",
  "future-plan",
  "decision-and-promise",
  "link-actions",
  "give-reason",
  "mark-contrast",
  "simple-condition",
  "necessity-and-obligation",
  "simple-comparison",
  "make-suggestion",
  "a1-validation",
] as const;

export type GrammarStageId = (typeof GRAMMAR_STAGE_IDS)[number];

export const GRAMMAR_CHAPTER_IDS = [
  "foundations",
  "build-a-sentence",
  "daily-actions",
  "express-needs",
  "time-and-linking",
  "a1-validation",
] as const;

export type GrammarChapterId = (typeof GRAMMAR_CHAPTER_IDS)[number];
export type GrammarLevel = "pre-a1" | "a1" | "early-a2-receptive";
export type GrammarA1Usage = "productive" | "receptive";

export type GrammarContentRole =
  | "discovery"
  | "practice"
  | "listening"
  | "production"
  | "reuse"
  | "receptive";

export type ContentKind =
  | "hangul"
  | "vocabulary"
  | "counting"
  | "classifier"
  | "listening-exercise"
  | "scene"
  | "mission"
  | "speech-feedback"
  | "shared-example";

export type ContentAvailability =
  | "public"
  | "unlisted"
  | "release-hidden"
  | "internal";

export type ContentRef = {
  id: string;
  title: string;
  kind: ContentKind;
  sourcePath: string;
  route?: `/${string}`;
  sourceId?: string;
  availability: ContentAvailability;
};

export type GrammarContentLink = {
  conceptId: GrammarConceptId;
  contentRefId: string;
  role: GrammarContentRole;
};

export type GrammarExample = {
  korean: string;
  french: string;
  sourceRefId?: string;
  note?: string;
  format?: "sentence" | "dialogue";
};

export type GrammarPracticeProfile = {
  distractorGroup:
    | "identity"
    | "sentence"
    | "quantity-request"
      | "ability-needs"
      | "time-linking";
  focusForm: string;
  formDistractors: readonly [string, string, string];
  scenario: string;
  scene: GrammarExample;
};

export type GrammarRulePart = {
  form: string;
  explanation: string;
};

export type AdvancedRecognitionForm = {
  form: string;
  shortFunction: string;
  level: "early-a2-receptive";
  a1Usage: "receptive";
};

export type GrammarConcept = {
  id: GrammarConceptId;
  form: string;
  shortFunction: string;
  rule: string;
  ruleParts?: readonly GrammarRulePart[];
  practice: GrammarPracticeProfile;
  level: GrammarLevel;
  a1Usage: GrammarA1Usage;
  a1ReceptiveForms?: readonly string[];
  prerequisiteIds: readonly GrammarConceptId[];
  examples: readonly GrammarExample[];
  contentLinks: readonly GrammarContentLink[];
  advancedRecognitionForms?: readonly AdvancedRecognitionForm[];
};

export type GrammarMasteryState =
  | "unseen"
  | "discovered"
  | "practiced"
  | "mastered";

export type GrammarPrerequisitePolicy = "recommended" | "blocking";

export type GrammarPrerequisite =
  | {
      kind: "concept";
      conceptId: GrammarConceptId;
      minimum: Exclude<GrammarMasteryState, "unseen">;
      policy: GrammarPrerequisitePolicy;
    }
  | {
      kind: "stage";
      stageId: GrammarStageId;
      minimum: Exclude<GrammarMasteryState, "unseen">;
      policy: GrammarPrerequisitePolicy;
    }
  | {
      kind: "content";
      contentRefId: string;
      minimum: "completed";
      policy: GrammarPrerequisitePolicy;
    };

export type GrammarCriterion = "R" | "M" | "L" | "P" | "D";

export type GrammarStage = {
  id: GrammarStageId;
  number: number;
  chapterId: GrammarChapterId;
  title: string;
  communicativeGoal: string;
  conceptIds: readonly GrammarConceptId[];
  receptiveConceptIds?: readonly GrammarConceptId[];
  prerequisites: readonly GrammarPrerequisite[];
  canonicalExamples: readonly GrammarExample[];
  reuseContentRefIds: readonly string[];
  validationCriteria: readonly GrammarCriterion[];
  reviewAfterDays: readonly number[];
  status: GrammarLevel;
  mode?: "lesson" | "review";
};

export type GrammarChapter = {
  id: GrammarChapterId;
  number: number;
  title: string;
  stageIds: readonly GrammarStageId[];
};

export type GrammarLearningPhase =
  | "discovery"
  | "explanation"
  | "manipulation"
  | "listening"
  | "production"
  | "reuse"
  | "review"
  | "mastery";

export type GrammarExerciseKind =
  | "choice"
  | "matching"
  | "order"
  | "transformation"
  | "gap"
  | "dictation"
  | "speech"
  | "scene";

export type GrammarExercise = {
  id: string;
  stageId: GrammarStageId;
  conceptIds: readonly GrammarConceptId[];
  phase: GrammarLearningPhase;
  kind: GrammarExerciseKind;
  prompt: string;
  contentRefIds?: readonly string[];
  criterion?: GrammarCriterion;
};

export type GrammarPracticeAnswer = string | readonly string[];

export type GrammarPracticeQuestion = GrammarExercise & {
  display?: string;
  korean?: string;
  french?: string;
  options: readonly string[];
  answer: GrammarPracticeAnswer;
  explanation: string;
  memo?: string;
};

export type GrammarPracticeResponse = {
  questionId: string;
  answer: GrammarPracticeAnswer;
  correct: boolean;
};

export type GrammarPracticeSession = {
  id: string;
  stageId: GrammarStageId;
  attemptNumber: number;
  questions: readonly GrammarPracticeQuestion[];
  questionIndex: number;
  responses: readonly GrammarPracticeResponse[];
  draftAnswer?: GrammarPracticeAnswer;
  score: number;
  startedAt: string;
  completedAt?: string;
};

export type GrammarMilestoneProgress = {
  firstAt: string;
  lastAt: string;
  attempts: number;
  bestScore?: number;
};

export type GrammarCriteriaEvidence = {
  R?: {
    correct: number;
    total: number;
    usesNovelItems: boolean;
    evaluatedAt: string;
  };
  M?: {
    correct: number;
    total: number;
    isConstructionOrTransformation: boolean;
    evaluatedAt: string;
  };
  L?: {
    correct: number;
    total: number;
    textInitiallyHidden: boolean;
    evaluatedAt: string;
  };
  P?: {
    contextualized: boolean;
    acceptable: boolean;
    evaluatedAt: string;
  };
  D?: {
    successful: boolean;
    usesNovelItem: boolean;
    sessionId: string;
    previousSessionId: string;
    previousEvaluatedAt: string;
    evaluatedAt: string;
  };
};

export type GrammarReviewProgress = {
  anchorAt?: string;
  completedOffsets: number[];
  nextReviewAt?: string;
  lastReviewedAt?: string;
  lapses: number;
};

export type GrammarProgress = {
  schemaVersion: 1;
  milestones: Partial<Record<GrammarLearningPhase, GrammarMilestoneProgress>>;
  criteriaEvidence: GrammarCriteriaEvidence;
  review: GrammarReviewProgress;
  attempts: number;
  lastResult?: number;
};

export type GrammarProgressState = Partial<
  Record<GrammarConceptId, GrammarProgress>
>;

export type GrammarStagePracticeProgress = {
  attempts: number;
  bestScore: number;
  lastScore?: number;
  lastCompletedAt?: string;
  activeSession?: GrammarPracticeSession;
  completedSessionIds: readonly string[];
  streakSessionIds: readonly string[];
};

export type GrammarLearningProgress = {
  schemaVersion: 1;
  concepts: GrammarProgressState;
  stages: Partial<Record<GrammarStageId, GrammarStagePracticeProgress>>;
  lastStageId?: GrammarStageId;
};
