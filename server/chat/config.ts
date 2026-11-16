/** Server-only configuration, read from environment variables at request time. */

const int = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const PROVIDERS = ["gemini", "mock"] as const;
export type ProviderName = (typeof PROVIDERS)[number];

export interface ChatConfig {
  provider: ProviderName;
  /** Gemini model ID. */
  geminiModel: string;
  /** Tried in order when the primary Gemini model is overloaded or out of quota. */
  geminiFallbackModels: string[];
  maxOutputTokens: number;
  /** Upstream LLM request timeout. */
  timeoutMs: number;
  rateLimitPerMinute: number;
  /** Extra origins allowed to call the API (same-origin is always allowed). */
  allowedOrigins: string[];
}

export function readConfig(env: Record<string, string | undefined> = process.env): ChatConfig {
  const provider = env.CHAT_PROVIDER?.trim().toLowerCase() as ProviderName | undefined;
  return {
    provider: provider && PROVIDERS.includes(provider) ? provider : "gemini",
    geminiModel: env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
    geminiFallbackModels: (env.GEMINI_FALLBACK_MODELS ?? "gemini-3.6-flash,gemini-3.5-flash-lite")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
    maxOutputTokens: int(env.CHAT_MAX_OUTPUT_TOKENS, 2048),
    timeoutMs: int(env.CHAT_TIMEOUT_MS, 25_000),
    rateLimitPerMinute: int(env.CHAT_RATE_LIMIT_PER_MINUTE, 10),
    allowedOrigins: (env.CHAT_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean),
  };
}
