import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: resolve(currentDir, "../.env")
});

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is missing or empty`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value || undefined;
}
