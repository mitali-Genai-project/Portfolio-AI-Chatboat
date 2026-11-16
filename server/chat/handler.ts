import { readConfig, type ChatConfig } from "./config.js";
import { loadKnowledge } from "./knowledge.js";
import { buildSystemPrompt } from "./prompt.js";
import { createProvider } from "./providers/index.js";
import { ProviderError, type LlmProvider, type ProviderErrorKind } from "./providers/types.js";
import { clientIp, createRateLimiter } from "./rateLimit.js";
import { LIMITS, validateChatRequest } from "./validation.js";

export type ErrorCode =
  | "method_not_allowed"
  | "forbidden_origin"
  | "unsupported_media_type"
  | "payload_too_large"
  | "invalid_json"
  | "invalid_request"
  | "rate_limited"
  | "not_configured"
  | "upstream_busy"
  | "upstream_timeout"
  | "upstream_error";

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...headers } });

const fail = (status: number, code: ErrorCode, message: string, headers?: Record<string, string>) =>
  json(status, { error: { code, message } }, headers);

const UPSTREAM: Record<Exclude<ProviderErrorKind, "refused">, [number, ErrorCode, string]> = {
  timeout: [504, "upstream_timeout", "The assistant took too long to respond. Please try again."],
  rate_limited: [503, "upstream_busy", "The assistant is busy right now. Please try again in a moment."],
  unavailable: [502, "upstream_error", "The assistant is temporarily unavailable. Please try again."],
  bad_request: [502, "upstream_error", "The assistant couldn't process that request."],
  not_configured: [503, "not_configured", "The assistant isn't available at the moment."],
  aborted: [499, "upstream_error", "Request cancelled."],
};

function isAllowedOrigin(request: Request, allowed: string[]): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; still rate limited
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (host && new URL(origin).host === host) return true;
  } catch {
    return false;
  }
  return allowed.includes(origin.replace(/\/$/, ""));
}

interface HandlerDeps {
  config?: ChatConfig;
  provider?: LlmProvider;
  knowledge?: () => string;
  /** Override for tests. */
  rateLimiter?: ReturnType<typeof createRateLimiter>;
  log?: (message: string, detail?: unknown) => void;
}

/** Builds the POST /api/chat handler. Dependencies are injectable for tests. */
export function createChatHandler(deps: HandlerDeps = {}) {
  const config = deps.config ?? readConfig();
  const provider = deps.provider ?? createProvider(config);
  const knowledge = deps.knowledge ?? loadKnowledge;
  const rateLimit = deps.rateLimiter ?? createRateLimiter(config.rateLimitPerMinute);
  const log = deps.log ?? ((message: string, detail?: unknown) => console.error(`[chat] ${message}`, detail ?? ""));

  return async function handleChat(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return fail(405, "method_not_allowed", "Use POST.", { Allow: "POST" });
    }
    if (!isAllowedOrigin(request, config.allowedOrigins)) {
      return fail(403, "forbidden_origin", "Origin not allowed.");
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return fail(415, "unsupported_media_type", "Content-Type must be application/json.");
    }
    const declaredLength = Number(request.headers.get("content-length"));
    if (declaredLength > LIMITS.maxBodyBytes) {
      return fail(413, "payload_too_large", "Request body is too large.");
    }

    const limit = rateLimit(clientIp(request.headers));
    if (!limit.allowed) {
      return fail(429, "rate_limited", "You're sending messages too quickly. Please wait a moment.", {
        "Retry-After": String(limit.retryAfterSeconds),
      });
    }

    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > LIMITS.maxBodyBytes) {
      return fail(413, "payload_too_large", "Request body is too large.");
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return fail(400, "invalid_json", "Request body must be valid JSON.");
    }
    const parsed = validateChatRequest(body);
    if (!parsed.ok) return fail(400, "invalid_request", parsed.error);

    try {
      const reply = await provider.complete({
        system: buildSystemPrompt(knowledge()),
        messages: parsed.messages,
        signal: request.signal,
      });
      return json(200, { reply });
    } catch (err) {
      const e = err instanceof ProviderError ? err : new ProviderError("unavailable", "Unexpected error.", undefined, { cause: err });
      if (e.kind === "refused") return json(200, { reply: e.message });
      const [status, code, message] = UPSTREAM[e.kind];
      if (e.kind !== "aborted") log(`${provider.name} ${e.kind}: ${e.message}`, e.cause);
      return fail(status, code, message, e.retryAfterSeconds ? { "Retry-After": String(e.retryAfterSeconds) } : undefined);
    }
  };
}
