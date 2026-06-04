import type { UserMemory } from "../types/teacher.types.js";

const memoryStore = new Map<string, UserMemory>();

export function getUserMemory(userId = "guest"): UserMemory {
  const existing = memoryStore.get(userId);
  if (existing) return existing;

  const created: UserMemory = {
    userId,
    level: "false_beginner",
    knownDifficulties: ["particules coréennes", "vocabulaire long terme"],
    learningGoals: [
      "conversation naturelle",
      "situations café restaurant métro",
    ],
    preferredStyle: "short",
  };

  memoryStore.set(userId, created);
  return created;
}

export const defaultUserMemory = {
  level: "débutant avancé",
  knownDifficulties: [
    "romanisation",
    "particules 은/는 et 이/가",
    "formules naturelles en café/restaurant",
  ],
  learningGoals: [
    "parler naturellement en Corée",
    "comprendre les phrases de service",
    "répondre rapidement dans une situation réelle",
  ],
  preferredStyle: "court, naturel, avec exemples",
};
