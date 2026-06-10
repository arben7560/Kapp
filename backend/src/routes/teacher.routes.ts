import { Router } from "express";
import { detectIntent } from "../ai/detectIntent.js";
import { generateAnswer } from "../ai/generateAnswer.js";
import { getAvatarJob, startLipSyncJob } from "../avatar/generateLipSync.js";
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
  const requestStartedAt = Date.now();

  try {
    const body = req.body as TeacherChatRequest;

    if (!body.message || typeof body.message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const userId = body.userId || "guest";
    const mode = detectIntent(body.message, body.mode);
    const memory = getUserMemory(userId);
    const scenarioContext = getScenarioContext(mode);
    const logStep = (step: string) => {
      console.log(
        `[teacher/chat] ${step} after ${Date.now() - requestStartedAt}ms`,
      );
    };

    // 1. On récupère l'historique AVANT de générer la réponse
    const history = getConversationHistory(userId);

    // 2. On génère la réponse avec le contexte précédent
    logStep("generating answer");
    const answer = await generateAnswer({
      message: body.message,
      mode,
      memory,
      scenarioContext,
      history,
    });
    logStep("answer generated");

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

    let audioUrl: string | undefined;
    let avatarJobId: string | undefined;
    let avatarError: string | undefined;

    try {
      logStep("generating voice");
      audioUrl = await generateVoice(answer.text);
      logStep(audioUrl ? "voice generated" : "voice skipped");
    } catch (error) {
      console.error("[teacher/chat] voice generation failed", error);
    }

    try {
      if (audioUrl) {
        logStep("starting lipsync job");
        const avatarJob = startLipSyncJob(audioUrl);
        avatarJobId = avatarJob?.id;
        logStep(avatarJobId ? "lipsync job started" : "lipsync skipped");
      } else {
        logStep("lipsync skipped because audioUrl is missing");
        avatarError = "audioUrl_missing";
      }
    } catch (error) {
      console.error("[teacher/chat] lipsync job start failed", error);
      avatarError = error instanceof Error ? error.message : String(error);
    }
    res.json({
      ...answer,
      audioUrl,
      avatarJobId,
      avatarError,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "teacher_chat_failed" });
  }
});

teacherRouter.get("/avatar/:jobId", (req, res) => {
  const job = getAvatarJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: "avatar_job_not_found" });
  }

  res.json({
    id: job.id,
    status: job.status,
    avatarVideoUrl: job.avatarVideoUrl,
    error: job.error,
  });
});
