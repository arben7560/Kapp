import OpenAI from "openai";
import { getRequiredEnv } from "../env.js";
import type { ChatMessage } from "../memory/conversationMemory.js";
import { getCafeScenarioForPrompt } from "../scenarios/cafeScenario.js";
import type {
  TeacherAnswer,
  TeacherMode,
  UserMemory,
} from "../types/teacher.types.js";
import { buildKoreanTeacherPrompt } from "./koreanTeacherPrompt.js";

const openai = new OpenAI({
  apiKey: getRequiredEnv("OPENAI_API_KEY"),
});

function getScenarioContext(mode: TeacherMode): string {
  if (mode === "cafe") {
    return getCafeScenarioForPrompt();
  }

  return "";
}

export async function generateAnswer(params: {
  message: string;
  mode: TeacherMode;
  memory: UserMemory;
  scenarioContext?: string;
  history?: ChatMessage[];
}): Promise<TeacherAnswer> {
  const systemPrompt = buildKoreanTeacherPrompt(params.mode, params.memory);
  const scenarioContext = getScenarioContext(params.mode);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "system",
        content: scenarioContext
          ? `SCÉNARIO ACTIF À UTILISER :
${scenarioContext}

MODE HYBRIDE :
Tu es à la fois personnage de la scène et prof de coréen.
Priorité 1 : faire avancer la scène naturellement.
Priorité 2 : aider l'utilisateur s'il pose une question, hésite ou fait une erreur.
Après chaque aide, reviens immédiatement à la scène.
Ne donne jamais une longue leçon sauf si l'utilisateur le demande explicitement.
Garde les réponses courtes pour un avatar vidéo.`
          : "Aucun scénario spécifique.",
      },

      // Historique précédent
      ...(params.history ?? []).map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: params.message,
      },
    ],
    temperature: 0.7,
    max_tokens: 350,
  });

  const text =
    completion.choices[0]?.message?.content?.trim() ||
    "Je n'ai pas bien compris. Peux-tu reformuler simplement ?";

  return {
    text,
    mode: params.mode,
    emotion: "warm",
  };
}
