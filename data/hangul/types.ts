export type HangulScriptKind = "consonant" | "vowel" | "syllable" | "word";

export type HangulCard = {
  id: string;
  glyph: string;
  romanization?: string;
  label: string;
  explanation: string;
  audio: string;
  kind: HangulScriptKind;
};

export type HangulQuestionType =
  | "audio-to-character"
  | "character-to-sound"
  | "assemble"
  | "layout"
  | "read"
  | "batchim"
  | "contrast";

export type HangulQuestionOption = {
  value: string;
  label: string;
  audio?: string;
};

export type HangulQuestion = {
  id: string;
  type: HangulQuestionType;
  prompt: string;
  display?: string;
  audio?: string;
  options: HangulQuestionOption[];
  answer: string;
  explanation: string;
  characters: string[];
};

export type HangulScene = {
  id: string;
  title: string;
  koreanTitle: string;
  description: string;
  instruction: string;
  accent: string;
  introducedConsonants?: string[];
  introducedVowels?: string[];
  introducedFinals?: string[];
  cards: HangulCard[];
  questions: HangulQuestion[];
};

export type HangulModule = {
  id: string;
  route: string;
  nextRoute: string;
  nextLabel: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  eyebrow: string;
  romanizationDefault: boolean;
  scenes: HangulScene[];
};

export type HangulSceneScore = {
  bestScore: number;
  total: number;
  attempts: number;
};

export type HangulQuizSession = {
  sceneId: string;
  questions: HangulQuestion[];
  questionIndex: number;
  answered: string | null;
  score: number;
  retrySourceIds: Record<string, true>;
  originalQuestionIds: string[];
  originalQuestionCount: number;
};

export type HangulLessonProgress = {
  currentSceneId?: string;
  activeQuiz?: HangulQuizSession;
  discovered: Record<string, true>;
  completedScenes: Record<string, true>;
  masteredScenes: Record<string, true>;
  scores: Record<string, HangulSceneScore>;
  errorsByCharacter: Record<string, number>;
};

export type HangulAssessmentProgress = {
  attempts: number;
  bestScore: number;
  total: number;
  passed: boolean;
};

export type HangulDetailedProgress = {
  lessons: Record<string, HangulLessonProgress>;
  masteredCharacters: Record<string, true>;
  assessment?: HangulAssessmentProgress;
};

export const createEmptyHangulLessonProgress = (): HangulLessonProgress => ({
  discovered: {},
  completedScenes: {},
  masteredScenes: {},
  scores: {},
  errorsByCharacter: {},
});

export const createEmptyHangulProgress = (): HangulDetailedProgress => ({
  lessons: {},
  masteredCharacters: {},
});
