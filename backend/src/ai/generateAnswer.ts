import OpenAI from "openai";
import { getRequiredEnv } from "../env.js";
import type { ChatMessage } from "../memory/conversationMemory.js";
import type {
  TeacherAnswer,
  TeacherMode,
  UserMemory,
} from "../types/teacher.types.js";
import { buildKoreanTeacherPrompt } from "./koreanTeacherPrompt.js";

const openai = new OpenAI({
  apiKey: getRequiredEnv("OPENAI_API_KEY"),
  maxRetries: 1,
  timeout: 25_000,
});

function buildCurrentTurnInstruction(params: {
  message: string;
  mode: TeacherMode;
  hasScenarioContext: boolean;
}): string {
  const normalizedMessage = params.message
    .trim()
    .toLowerCase()
    .replace(/[!.?。！？\s]+/g, " ");
  const isSimpleGreeting = /^(bonjour|salut|hello|coucou|안녕|안녕하세요)$/.test(
    normalizedMessage.trim(),
  );

  if (params.mode === "free") {
    return isSimpleGreeting
      ? `Instruction du tour actuel :
L'utilisateur vient seulement de saluer. Réponds comme Mina, pas comme un personnage de scénario.
Ne continue pas un ancien scénario de l'historique.
Pose une question ouverte et propose quelques pistes : traduction, correction, conversation libre, café, métro ou restaurant.`
      : `Instruction du tour actuel :
Mode libre. Réponds à la demande actuelle sans continuer automatiquement un ancien scénario.
Si l'objectif est flou, pose une question ouverte.`;
  }

  if (params.mode === "metro") {
    return `Instruction du tour actuel :
Le mode actuel est métro. Réutilise le script métro actif quand c'est pertinent, en particulier Hongik University vers Gangnam, ligne 2, direction, quai, durée, transfert et sortie 2.
Ne réponds pas comme une employée de café.`;
  }

  if (params.mode === "restaurant") {
    return `Instruction du tour actuel :
Le mode actuel est restaurant. Réutilise le script restaurant actif quand c'est pertinent, en particulier BBQ coréen, samgyeopsal, galbi, recommandation, cuisson, doenjang jjigae, 계란찜, épice, banchan, paiement et reçu.
Ne réponds pas comme une employée de café ou comme un passant du métro.`;
  }

  if (params.hasScenarioContext) {
    return `Instruction du tour actuel :
Le scénario actif est ${params.mode}. Utilise uniquement ce scénario comme contexte de scène.
Ne bascule pas vers un autre scénario sauf si l'utilisateur le demande clairement.`;
  }

  return `Instruction du tour actuel :
Réponds à la demande actuelle comme Mina, prof de coréen. Ne continue pas automatiquement un ancien scénario.`;
}

export async function generateAnswer(params: {
  message: string;
  mode: TeacherMode;
  memory: UserMemory;
  scenarioContext?: string;
  history?: ChatMessage[];
}): Promise<TeacherAnswer> {
  const systemPrompt = buildKoreanTeacherPrompt(params.mode, params.memory);
  const scenarioContext = params.scenarioContext ?? "";
  const currentTurnInstruction = buildCurrentTurnInstruction({
    message: params.message,
    mode: params.mode,
    hasScenarioContext: !!scenarioContext,
  });

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
        role: "system",
        content: `CONTRAINTE AVATAR VIDEO :
La reponse sera lue par un avatar video.
Reponds en 1 a 3 phrases maximum.
Ne fais pas de liste.
Ne mets pas de titres.
Privilegie une phrase coreenne + une traduction courte.
Ne depasse pas environ 15 secondes de parole.`,
      },
      {
        role: "system",
        content: currentTurnInstruction,
      },
      {
        role: "user",
        content: params.message,
      },
    ],
    temperature: 0.7,
    max_tokens: 120,
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
