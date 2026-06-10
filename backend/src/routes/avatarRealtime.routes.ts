import { Router } from "express";
import { getOptionalEnv, getRequiredEnv } from "../env.js";

const DID_API_BASE_URL = "https://api.d-id.com";
const DEFAULT_AGENT_SESSION_PATH = "/agents/{agentId}/streams";
const REQUEST_TIMEOUT_MS = 30_000;

type DidProxyMethod = "POST" | "DELETE";

type RealtimeSessionState = {
  chatId?: string;
  sessionId?: string;
  streamId: string;
};

const realtimeSessions = new Map<string, RealtimeSessionState>();

function getDidAuthorizationHeader(): string {
  const rawValue = getRequiredEnv("D_ID_API_KEY");

  if (/^(basic|bearer)\s+/i.test(rawValue)) {
    return rawValue;
  }

  const encodedValue = rawValue.includes(":")
    ? Buffer.from(rawValue, "utf8").toString("base64")
    : rawValue;

  return `Basic ${encodedValue}`;
}

function getAgentId(): string {
  return getRequiredEnv("D_ID_AGENT_ID");
}

function getSessionBasePath(): string {
  return (
    getOptionalEnv("D_ID_AGENT_SESSION_PATH") ?? DEFAULT_AGENT_SESSION_PATH
  ).replace("{agentId}", encodeURIComponent(getAgentId()));
}

function getAgentBasePath(): string {
  return `/agents/${encodeURIComponent(getAgentId())}`;
}

function buildDidUrl(suffix = ""): string {
  const basePath = getSessionBasePath().replace(/\/+$/, "");
  const safeSuffix = suffix ? `/${suffix.replace(/^\/+/, "")}` : "";

  return `${DID_API_BASE_URL}${basePath}${safeSuffix}`;
}

function buildDidAgentUrl(suffix = ""): string {
  const basePath = getAgentBasePath().replace(/\/+$/, "");
  const safeSuffix = suffix ? `/${suffix.replace(/^\/+/, "")}` : "";

  return `${DID_API_BASE_URL}${basePath}${safeSuffix}`;
}

async function readDidResponse(response: Response) {
  const text = await response.text();

  let payload: unknown = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {
      raw: text,
    };
  }

  if (!response.ok) {
    console.error("[avatar/realtime] D-ID error response:", {
      status: response.status,
      payload,
    });

    return {
      ok: false,
      payload: {
        error: "did_realtime_request_failed",
        status: response.status,
        details: payload,
      },
      status: response.status,
    };
  }

  return {
    ok: true,
    payload,
    status: response.status,
  };
}

async function proxyDidRequest(params: {
  method: DidProxyMethod;
  suffix?: string;
  body?: unknown;
}) {
  const url = buildDidUrl(params.suffix);

  console.log("[avatar/realtime] D-ID request:", params.method, url);
  if (params.suffix) {
    console.log("[avatar/realtime] D-ID body summary:", summarizeBody(params.body));
  }

  const response = await fetch(url, {
    method: params.method,
    headers: {
      Authorization: getDidAuthorizationHeader(),
      "Content-Type": "application/json",
    },
    body: params.body === undefined ? undefined : JSON.stringify(params.body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  return readDidResponse(response);
}

async function proxyDidAgentRequest(params: {
  method: DidProxyMethod;
  suffix?: string;
  body?: unknown;
}) {
  const url = buildDidAgentUrl(params.suffix);

  console.log("[avatar/realtime] D-ID request:", params.method, url);
  if (params.suffix) {
    console.log("[avatar/realtime] D-ID body summary:", summarizeBody(params.body));
  }

  const response = await fetch(url, {
    method: params.method,
    headers: {
      Authorization: getDidAuthorizationHeader(),
      "Content-Type": "application/json",
    },
    body: params.body === undefined ? undefined : JSON.stringify(params.body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  return readDidResponse(response);
}

function summarizeBody(body: unknown) {
  if (!body || typeof body !== "object") return body;

  const value = body as Record<string, unknown>;
  const answer = value.answer as Record<string, unknown> | undefined;
  const candidate = value.candidate as string | undefined;
  const messages = Array.isArray(value.messages) ? value.messages : undefined;

  const answerSdp = typeof answer?.sdp === "string" ? answer.sdp : undefined;

  return {
    keys: Object.keys(value),
    answerType: answer?.type,
    answerSdpLength: answerSdp?.length ?? 0,
    answerSdpMedia:
      answerSdp
        ? {
            hasVideo: answerSdp.includes("m=video"),
            hasAudio: answerSdp.includes("m=audio"),
            hasApplication: answerSdp.includes("m=application"),
            hasDataChannel: answerSdp.includes("webrtc-datachannel"),
            hasRecvOnly: answerSdp.includes("a=recvonly"),
            hasSendRecv: answerSdp.includes("a=sendrecv"),
            hasInactive: answerSdp.includes("a=inactive"),
            hasH264: /H264\/90000/i.test(answerSdp),
            hasVp8: /VP8\/90000/i.test(answerSdp),
            mLines: answerSdp
              .split(/\r?\n/)
              .filter((line) => line.startsWith("m=")),
            directions: answerSdp
              .split(/\r?\n/)
              .filter((line) =>
                /^(a=sendrecv|a=recvonly|a=sendonly|a=inactive)$/.test(line),
              ),
          }
        : undefined,
    candidateLength: typeof candidate === "string" ? candidate.length : 0,
    messageCount: messages?.length ?? 0,
    hasSessionId: typeof value.session_id === "string",
    hasCamelSessionId: typeof value.sessionId === "string",
    hasStreamId: typeof value.streamId === "string",
  };
}

export const avatarRealtimeRouter = Router();

avatarRealtimeRouter.post("/session", async (req, res) => {
  try {
    const streamResult = await proxyDidRequest({
      method: "POST",
      body: req.body ?? {},
    });

    if (!streamResult.ok || streamResult.status < 200 || streamResult.status >= 300) {
      return res.status(streamResult.status).json(streamResult.payload);
    }

    const streamPayload = toRecord(streamResult.payload);
    const streamId = getString(streamPayload.id);
    const sessionId = getString(streamPayload.session_id);

    if (!streamId) {
      return res.status(streamResult.status).json(streamPayload);
    }

    const chatResult = await proxyDidAgentRequest({
      method: "POST",
      suffix: "chat",
      body: {},
    });
    const chatPayload = toRecord(chatResult.payload);
    const chatId = getString(chatPayload.id);

    realtimeSessions.set(streamId, {
      chatId,
      sessionId,
      streamId,
    });

    res.status(streamResult.status).json({
      ...streamPayload,
      chat_id: chatId,
    });
  } catch (error) {
    console.error("[avatar/realtime] session creation failed", error);

    res.status(500).json({
      error: "avatar_realtime_session_failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

avatarRealtimeRouter.post("/session/:sessionId/:action", async (req, res) => {
  try {
    const action = req.params.action;
    const streamId = req.params.sessionId;
    const suffix =
      action === "message"
        ? undefined
        : `${encodeURIComponent(streamId)}/${encodeURIComponent(
            action,
          )}`;
    const storedSession = realtimeSessions.get(streamId);
    const body =
      action === "message"
        ? toDidAgentChatBody(req.body, streamId, storedSession)
        : (req.body ?? {});
    const chatId =
      storedSession?.chatId ?? getString(toRecord(req.body).chat_id);

    if (action === "message" && !chatId) {
      return res.status(400).json({
        error: "avatar_realtime_chat_missing",
      });
    }

    const result =
      action === "message"
        ? await proxyDidAgentRequest({
            method: "POST",
            suffix: `chat/${encodeURIComponent(chatId as string)}`,
            body,
          })
        : await proxyDidRequest({
            method: "POST",
            suffix,
            body,
          });

    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("[avatar/realtime] session action failed", error);

    res.status(500).json({
      error: "avatar_realtime_action_failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

function toDidAgentChatBody(
  body: unknown,
  streamId: string,
  storedSession?: RealtimeSessionState,
) {
  const value = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const message = value.message;
  const sessionId = getString(value.session_id) ?? storedSession?.sessionId;

  return {
    messages: [
      {
        content: typeof message === "string" ? message : "",
        created_at: new Date().toISOString(),
        role: "user",
      },
    ],
    sessionId,
    streamId,
  };
}

avatarRealtimeRouter.delete("/session/:sessionId", async (req, res) => {
  try {
    const storedSession = realtimeSessions.get(req.params.sessionId);
    const result = await proxyDidRequest({
      method: "DELETE",
      suffix: encodeURIComponent(req.params.sessionId),
      body: {
        ...(typeof req.body === "object" && req.body ? req.body : {}),
        session_id:
          getString(toRecord(req.body).session_id) ?? storedSession?.sessionId,
      },
    });

    realtimeSessions.delete(req.params.sessionId);

    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("[avatar/realtime] session close failed", error);

    res.status(500).json({
      error: "avatar_realtime_close_failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
