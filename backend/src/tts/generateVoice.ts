import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { getRequiredEnv } from "../env.js";

const openai = new OpenAI({
  apiKey: getRequiredEnv("OPENAI_API_KEY"),
  maxRetries: 1,
  timeout: 45_000,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDir = path.resolve(__dirname, "..", "..", "public", "audio");

const hangulPattern = /\p{Script=Hangul}/u;

function hasHangul(value: string): boolean {
  return hangulPattern.test(value);
}

function sanitizeSpeechText(text: string): string {
  return text.trim().slice(0, 3500);
}

export async function generateVoice(text: string): Promise<string | undefined> {
  const speechText = sanitizeSpeechText(text);

  if (!speechText) return undefined;

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const fileName = `mina-${Date.now()}.mp3`;
  const filePath = path.join(audioDir, fileName);
  const containsKorean = hasHangul(speechText);

  const mp3 = await openai.audio.speech.create(
    {
      model: "gpt-4o-mini-tts",
      voice: "nova",
      input: speechText,
      instructions: containsKorean
        ? "Read the entire script exactly as written. Speak French text with natural French pronunciation. When the script contains Hangul, switch to natural native Korean pronunciation, rhythm, and intonation for the Korean text. Do not pronounce Hangul as French or romanized text. Keep a warm Korean teacher voice."
        : "Read the entire script exactly as written in natural French with a warm Korean teacher voice.",
      response_format: "mp3",
    },
    {
      timeout: 30_000,
    },
  );

  const buffer = Buffer.from(await mp3.arrayBuffer());

  fs.writeFileSync(filePath, buffer);

  return `/audio/${fileName}`;
}
