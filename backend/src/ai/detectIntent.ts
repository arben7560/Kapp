import type { TeacherMode } from "../types/teacher.types.js";

export function detectIntent(message: string, requestedMode?: TeacherMode): TeacherMode {
  if (requestedMode && requestedMode !== "free") return requestedMode;

  const lower = message.toLowerCase();

  if (lower.includes("café") || lower.includes("cafe") || lower.includes("americano")) return "cafe";
  if (
    lower.includes("restaurant") ||
    lower.includes("bibimbap") ||
    lower.includes("commande") ||
    lower.includes("samgyeopsal") ||
    lower.includes("galbi") ||
    lower.includes("bbq") ||
    lower.includes("viande") ||
    lower.includes("griller") ||
    lower.includes("cuisson") ||
    lower.includes("banchan") ||
    lower.includes("accompagnement") ||
    lower.includes("addition") ||
    lower.includes("paiement") ||
    lower.includes("reçu") ||
    lower.includes("recu")
  ) {
    return "restaurant";
  }
  if (
    lower.includes("métro") ||
    lower.includes("metro") ||
    lower.includes("station") ||
    lower.includes("gangnam") ||
    lower.includes("hongik") ||
    lower.includes("ligne") ||
    lower.includes("quai") ||
    lower.includes("sortie") ||
    lower.includes("trajet") ||
    lower.includes("transfert") ||
    lower.includes("correspondance")
  ) {
    return "metro";
  }
  if (lower.includes("corrige") || lower.includes("correction")) return "correction";
  if (lower.includes("traduis") || lower.includes("traduction") || lower.includes("comment dire")) return "translation";
  if (lower.includes("grammaire") || lower.includes("particule") || lower.includes("différence")) return "grammar";

  return "free";
}
