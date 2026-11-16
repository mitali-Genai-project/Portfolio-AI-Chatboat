import type { ChatTurn } from "../validation.js";

export interface CompletionRequest {
  system: string;
  messages: ChatTurn[];
  signal?: AbortSignal;
}

/** Any LLM backend. The handler only depends on this interface. */
export interface LlmProvider {
  readonly name: string;
  complete(request: CompletionRequest): Promise<string>;
}

export type ProviderErrorKind =
  | "timeout" // upstream took too long
  | "rate_limited" // upstream rate limit / overloaded
  | "unavailable" // upstream 5xx or network failure
  | "not_configured" // missing or rejected credentials
  | "bad_request" // request rejected by the upstream API
  | "refused" // model declined to answer
  | "aborted"; // client went away

/** Provider-agnostic error the handler maps to an HTTP response. */
export class ProviderError extends Error {
  constructor(
    readonly kind: ProviderErrorKind,
    message: string,
    readonly retryAfterSeconds?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ProviderError";
  }
}
