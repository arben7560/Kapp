import type { TeacherMode } from "../types/teacher.types.js";

export function detectIntent(message: string, requestedMode?: TeacherMode): TeacherMode {
  if (requestedMode && requestedMode !== "free") return requestedMode;

  const lower = message.toLowerCase();

  if (lower.includes("café") || lower.includes("cafe") || lower.includes("americano")) return "cafe";
  if (lower.includes("restaurant") || lower.includes("bibimbap") || lower.includes("commande")) return "restaurant";
  if (lower.includes("métro") || lower.includes("metro") || lower.includes("station")) return "metro";
  if (lower.includes("corrige") || lower.includes("correction")) return "correction";
  if (lower.includes("traduis") || lower.includes("traduction") || lower.includes("comment dire")) return "translation";
  if (lower.includes("grammaire") || lower.includes("particule") || lower.includes("différence")) return "grammar";

  return "free";
}
