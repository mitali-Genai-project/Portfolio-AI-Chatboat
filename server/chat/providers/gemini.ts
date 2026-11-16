import { ApiError, GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse } from "@google/genai";
import type { ChatConfig } from "../config.js";
import { ProviderError, type CompletionRequest, type LlmProvider } from "./types.js";

const BLOCKED_REPLY =
  "Sorry, I can't help with that. I can answer questions about Mitali's experience, skills, projects and how to contact her.";

/** The subset of `ai.models` this provider uses (injectable for tests). */
export interface GeminiModelsClient {
  generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>;
}

/** Google Gemini via the official Google GenAI SDK. The key is read from the server environment only. */
export class GeminiProvider implements LlmProvider {
  readonly name = "gemini";
  private models: GeminiModelsClient | undefined;

  constructor(
    private readonly config: Pick<ChatConfig, "geminiModel" | "maxOutputTokens" | "timeoutMs"> &
      Partial<Pick<ChatConfig, "geminiFallbackModels">>,
    client?: GeminiModelsClient,
    private readonly env: Record<string, string | undefined> = process.env,
  ) {
    this.models = client;
  }

  /** Created lazily so a missing key fails the request (503), not the module load. */
  private client(): GeminiModelsClient {
    if (this.models) return this.models;
    const apiKey = this.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new ProviderError("not_configured", "GEMINI_API_KEY is not set.");
    this.models = new GoogleGenAI({ apiKey, httpOptions: { timeout: this.config.timeoutMs } }).models;
    return this.models;
  }

  async complete(request: CompletionRequest): Promise<string> {
    // One overall deadline across all models, so the function always answers before maxDuration.
    const deadline = AbortSignal.timeout(this.config.timeoutMs);
    const combined = request.signal ? AbortSignal.any([request.signal, deadline]) : deadline;
    const models = [this.config.geminiModel, ...(this.config.geminiFallbackModels ?? [])].filter(
      (m, i, all) => all.indexOf(m) === i,
    );

    const started = Date.now();
    let lastError: ProviderError | undefined;
    for (const [i, model] of models.entries()) {
      const remaining = this.config.timeoutMs - (Date.now() - started);
      if (remaining <= 0) break;
      // Non-final models get a slice of the budget so a slow/overloaded model can't
      // starve the fallbacks; the final model gets whatever is left.
      const isLast = i === models.length - 1;
      const attemptMs = isLast ? remaining : Math.min(remaining, Math.ceil(this.config.timeoutMs * 0.4));
      const attemptDeadline = AbortSignal.timeout(attemptMs);
      try {
        return await this.generate(model, request, AbortSignal.any([combined, attemptDeadline]));
      } catch (err) {
        const e = err instanceof ProviderError ? err : toProviderError(err, request.signal);
        // Capacity problems (quota, "high demand", slow model) are independent per
        // model, so try the next one. Anything else (bad key, cancelled) stops here.
        if (e.kind !== "rate_limited" && e.kind !== "unavailable" && e.kind !== "timeout") throw e;
        lastError = e;
      }
    }
    if (deadline.aborted && !request.signal?.aborted) {
      throw new ProviderError("timeout", "The model took too long to respond.", undefined, { cause: lastError });
    }
    throw lastError ?? new ProviderError("unavailable", "No Gemini model is configured.");
  }

  private async generate(
    model: string,
    { system, messages, signal }: CompletionRequest,
    /** Caller signal + overall deadline + this attempt's deadline. */
    combined: AbortSignal,
  ): Promise<string> {
    try {
      const response = await this.client().generateContent({
        model,
        // Gemini uses "model" for assistant turns.
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        config: {
          systemInstruction: system,
          maxOutputTokens: this.config.maxOutputTokens,
          abortSignal: combined,
        },
      });

      if (response.promptFeedback?.blockReason) return BLOCKED_REPLY;
      const finish = response.candidates?.[0]?.finishReason;
      const text = response.text?.trim();
      if (!text) {
        if (finish && finish !== "STOP" && finish !== "MAX_TOKENS") return BLOCKED_REPLY; // SAFETY, RECITATION, …
        throw new ProviderError("unavailable", "The model returned an empty response.");
      }
      return finish === "MAX_TOKENS" ? `${text}…` : text;
    } catch (err) {
      // Aborted, but not by the caller → one of our deadlines fired.
      if (combined.aborted && !signal?.aborted) {
        throw new ProviderError("timeout", "The model took too long to respond.", undefined, { cause: err });
      }
      throw toProviderError(err, signal);
    }
  }
}

/** Maps Google GenAI SDK errors to provider-agnostic errors. */
export function toProviderError(err: unknown, signal?: AbortSignal): ProviderError {
  if (err instanceof ProviderError) return err;
  if (signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
    return new ProviderError("aborted", "Request was cancelled.", undefined, { cause: err });
  }
  if (err instanceof ApiError) {
    const s = err.status;
    // Invalid keys come back as 400 with reason API_KEY_INVALID.
    if (s === 401 || s === 403 || (s === 400 && err.message.includes("API_KEY_INVALID"))) {
      return new ProviderError("not_configured", "Gemini credentials are missing or invalid.", undefined, { cause: err });
    }
    if (s === 429) {
      // Free-tier quota (per minute or per day) exhausted.
      return new ProviderError("rate_limited", "Gemini is rate limiting requests.", undefined, { cause: err });
    }
    if (s === 503) return new ProviderError("rate_limited", "Gemini is overloaded.", undefined, { cause: err });
    if (s === 408 || s === 504) return new ProviderError("timeout", "Gemini took too long to respond.", undefined, { cause: err });
    if (s >= 500) return new ProviderError("unavailable", "Gemini is temporarily unavailable.", undefined, { cause: err });
    // 400 / 404 (e.g. unknown model) / other 4xx.
    return new ProviderError("bad_request", "Gemini rejected the request.", undefined, { cause: err });
  }
  if (err instanceof TypeError) {
    return new ProviderError("unavailable", "Could not reach Gemini.", undefined, { cause: err });
  }
  return new ProviderError("unavailable", "Unexpected error calling Gemini.", undefined, { cause: err });
}
