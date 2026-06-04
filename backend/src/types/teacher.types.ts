export type TeacherMode =
  | "free"
  | "cafe"
  | "restaurant"
  | "metro"
  | "grammar"
  | "correction"
  | "translation";

export type UserLevel =
  | "beginner"
  | "false_beginner"
  | "intermediate"
  | "advanced";

export interface TeacherChatRequest {
  userId?: string;
  message: string;
  mode?: TeacherMode;
}

export interface UserMemory {
  userId: string;
  level: UserLevel;
  knownDifficulties: string[];
  learningGoals: string[];
  preferredStyle: "short" | "detailed";
}

export interface TeacherAnswer {
  text: string;
  korean?: string;
  romanization?: string;
  translation?: string;
  nextQuestion?: string;
  mode: TeacherMode;
  emotion: "neutral" | "encouraging" | "corrective" | "warm";
  audioUrl?: string;
  avatarVideoUrl?: string;
}
