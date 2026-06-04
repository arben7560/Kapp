import { Router } from "express";
import { detectIntent } from "../ai/detectIntent.js";
import { generateAnswer } from "../ai/generateAnswer.js";
import { generateLipSync } from "../avatar/generateLipSync.js";
import {
  addMessageToHistory,
  getConversationHistory,
} from "../memory/conversationMemory.js";
import { getUserMemory } from "../memory/userMemory.js";
import { getScenarioContext } from "../scenarios/getScenarioContext.js";
import { generateVoice } from "../tts/generateVoice.js";
import type { TeacherChatRequest } from "../types/teacher.types.js";

export const teacherRouter = Router();

teacherRouter.post("/chat", async (req, res) => {
  try {
    const body = req.body as TeacherChatRequest;

    if (!body.message || typeof body.message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const userId = body.userId || "guest";
    const mode = detectIntent(body.message, body.mode);
    const memory = getUserMemory(userId);
    const scenarioContext = getScenarioContext(mode);

    // 1. On récupère l'historique AVANT de générer la réponse
    const history = getConversationHistory(userId);

    // 2. On génère la réponse avec le contexte précédent
    const answer = await generateAnswer({
      message: body.message,
      mode,
      memory,
      scenarioContext,
      history,
    });

    // 3. On sauvegarde le message utilisateur
    addMessageToHistory(userId, {
      role: "user",
      content: body.message,
    });

    // 4. On sauvegarde la réponse IA
    addMessageToHistory(userId, {
      role: "assistant",
      content: answer.text,
    });

    const audioUrl = await generateVoice(answer.text);
    const avatarVideoUrl = await generateLipSync(audioUrl);

    res.json({
      ...answer,
      audioUrl,
      avatarVideoUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "teacher_chat_failed" });
  }
});
