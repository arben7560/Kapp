import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { getRequiredEnv } from "../env.js";

const openai = new OpenAI({
  apiKey: getRequiredEnv("OPENAI_API_KEY"),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDir = path.resolve(__dirname, "..", "..", "public", "audio");

export async function generateVoice(text: string): Promise<string | undefined> {
  if (!text.trim()) return undefined;

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const fileName = `mina-${Date.now()}.mp3`;
  const filePath = path.join(audioDir, fileName);

  const mp3 = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "nova",
    input: text,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  fs.writeFileSync(filePath, buffer);

  return `/audio/${fileName}`;
}
