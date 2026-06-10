import { randomUUID } from "node:crypto";
import { getOptionalEnv } from "../env.js";

const DID_API_BASE_URL = "https://api.d-id.com";
const DEFAULT_AVATAR_PATH = "/avatar/avatarIA.png";
const CREATE_TIMEOUT_MS = 30_000;
const POLL_TIMEOUT_MS = 300_000;
const POLL_INTERVAL_MS = 2_000;
const JOB_TTL_MS = 30 * 60_000;

export type AvatarJobStatus = "queued" | "processing" | "done" | "error";

export type AvatarJob = {
  id: string;
  status: AvatarJobStatus;
  createdAt: number;
  updatedAt: number;
  avatarVideoUrl?: string;
  didTalkId?: string;
  error?: string;
};

type DidTalkStatus =
  | "created"
  | "started"
  | "done"
  | "error"
  | "rejected"
  | string;

type DidCreateTalkResponse = {
  id?: string;
  status?: DidTalkStatus;
  result_url?: string;
  error?: unknown;
};

type DidTalkResponse = DidCreateTalkResponse & {
  created_at?: string;
  modified_at?: string;
};

const avatarJobs = new Map<string, AvatarJob>();

function updateJob(jobId: string, patch: Partial<AvatarJob>): AvatarJob | undefined {
  const currentJob = avatarJobs.get(jobId);
  if (!currentJob) return undefined;

  const nextJob = {
    ...currentJob,
    ...patch,
    updatedAt: Date.now(),
  };

  avatarJobs.set(jobId, nextJob);
  return nextJob;
}

function cleanupOldJobs() {
  const now = Date.now();

  for (const [jobId, job] of avatarJobs.entries()) {
    if (now - job.createdAt > JOB_TTL_MS) {
      avatarJobs.delete(jobId);
    }
  }
}

function getPublicBaseUrl(): string | undefined {
  return getOptionalEnv("PUBLIC_BASE_URL")?.replace(/\/+$/, "");
}

function toPublicUrl(pathOrUrl: string): string | undefined {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const publicBaseUrl = getPublicBaseUrl();
  if (!publicBaseUrl) return undefined;

  return `${publicBaseUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function getDidAuthorizationHeader(): string | undefined {
  const rawValue = getOptionalEnv("D_ID_API_KEY");
  if (!rawValue) return undefined;

  if (/^(basic|bearer)\s+/i.test(rawValue)) {
    return rawValue;
  }

  const encodedValue = rawValue.includes(":")
    ? Buffer.from(rawValue, "utf8").toString("base64")
    : rawValue;

  return `Basic ${encodedValue}`;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `D-ID request failed (${response.status}): ${text || response.statusText}`,
    );
  }

  return (text ? JSON.parse(text) : {}) as T;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function createTalk(params: {
  audioUrl: string;
  sourceUrl: string;
  authorizationHeader: string;
}): Promise<DidCreateTalkResponse> {
  const response = await fetch(`${DID_API_BASE_URL}/talks`, {
    method: "POST",
    headers: {
      Authorization: params.authorizationHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_url: params.sourceUrl,
      script: {
        type: "audio",
        audio_url: params.audioUrl,
      },
      config: {
        stitch: true,
      },
    }),
    signal: AbortSignal.timeout(CREATE_TIMEOUT_MS),
  });

  return readJsonResponse<DidCreateTalkResponse>(response);
}

async function getTalk(params: {
  talkId: string;
  authorizationHeader: string;
}): Promise<DidTalkResponse> {
  const response = await fetch(`${DID_API_BASE_URL}/talks/${params.talkId}`, {
    headers: {
      Authorization: params.authorizationHeader,
    },
    signal: AbortSignal.timeout(CREATE_TIMEOUT_MS),
  });

  return readJsonResponse<DidTalkResponse>(response);
}

async function waitForTalkResult(params: {
  talkId: string;
  authorizationHeader: string;
}): Promise<string | undefined> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const talk = await getTalk(params);

    if (talk.status === "done") {
      return talk.result_url;
    }

    if (talk.status === "error" || talk.status === "rejected") {
      throw new Error(`D-ID talk failed: ${JSON.stringify(talk.error ?? talk)}`);
    }

    await wait(POLL_INTERVAL_MS);
  }

  throw new Error("D-ID talk timed out before a video was ready");
}

export async function generateLipSync(
  audioUrl?: string,
): Promise<string | undefined> {
  if (!audioUrl) return undefined;

  const authorizationHeader = getDidAuthorizationHeader();
  const publicAudioUrl = toPublicUrl(audioUrl);
  const sourceUrl = toPublicUrl(DEFAULT_AVATAR_PATH);

  if (!authorizationHeader) {
    console.warn("[avatar] D_ID_API_KEY is missing, skipping lipsync");
    return undefined;
  }

  if (!publicAudioUrl || !sourceUrl) {
    console.warn("[avatar] PUBLIC_BASE_URL is missing, skipping lipsync");
    return undefined;
  }

  const createdTalk = await createTalk({
    audioUrl: publicAudioUrl,
    sourceUrl,
    authorizationHeader,
  });

  if (createdTalk.result_url) {
    return createdTalk.result_url;
  }

  if (!createdTalk.id) {
    throw new Error(`D-ID did not return a talk id: ${JSON.stringify(createdTalk)}`);
  }

  return waitForTalkResult({
    talkId: createdTalk.id,
    authorizationHeader,
  });
}

async function runLipSyncJob(jobId: string, audioUrl: string) {
  try {
    updateJob(jobId, { status: "processing" });

    const authorizationHeader = getDidAuthorizationHeader();
    const publicAudioUrl = toPublicUrl(audioUrl);
    const sourceUrl = toPublicUrl(DEFAULT_AVATAR_PATH);

    if (!authorizationHeader) {
      throw new Error("D_ID_API_KEY is missing");
    }

    if (!publicAudioUrl || !sourceUrl) {
      throw new Error("PUBLIC_BASE_URL is missing");
    }

    const createdTalk = await createTalk({
      audioUrl: publicAudioUrl,
      sourceUrl,
      authorizationHeader,
    });

    updateJob(jobId, { didTalkId: createdTalk.id });

    const avatarVideoUrl =
      createdTalk.result_url ??
      (createdTalk.id
        ? await waitForTalkResult({
            talkId: createdTalk.id,
            authorizationHeader,
          })
        : undefined);

    if (!avatarVideoUrl) {
      throw new Error(
        `D-ID did not return a video URL: ${JSON.stringify(createdTalk)}`,
      );
    }

    updateJob(jobId, {
      avatarVideoUrl,
      status: "done",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[avatar] lipsync job ${jobId} failed`, error);
    updateJob(jobId, {
      error: message,
      status: "error",
    });
  }
}

export function startLipSyncJob(audioUrl?: string): AvatarJob | undefined {
  if (!audioUrl) return undefined;

  cleanupOldJobs();

  const now = Date.now();
  const job: AvatarJob = {
    id: randomUUID(),
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };

  avatarJobs.set(job.id, job);
  void runLipSyncJob(job.id, audioUrl);

  return job;
}

export function getAvatarJob(jobId: string): AvatarJob | undefined {
  cleanupOldJobs();
  return avatarJobs.get(jobId);
}
