import type { ChatMessage, ChatService } from "./types";

/** Matches the server's limits (server/chat/validation.ts); older turns are dropped client-side. */
const MAX_HISTORY = 20;
const CLIENT_TIMEOUT_MS = 35_000;

export class ChatApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ChatApiError";
  }
}

const FALLBACK: Record<number, string> = {
  429: "You're sending messages too quickly. Please wait a moment.",
  503: "The assistant is busy right now. Please try again in a moment.",
  504: "The assistant took too long to respond. Please try again.",
};

/** Calls the serverless endpoint. No credentials live in the browser. */
export function createApiChatService(endpoint = "/api/chat"): ChatService {
  return {
    async reply(history: ChatMessage[], signal?: AbortSignal) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(new DOMException("Timed out", "TimeoutError")), CLIENT_TIMEOUT_MS);
      const onAbort = () => controller.abort(signal?.reason);
      if (signal?.aborted) onAbort();
      else signal?.addEventListener("abort", onAbort, { once: true });

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        const data: unknown = await res.json().catch(() => null);
        const body = (data ?? {}) as { reply?: unknown; error?: { code?: string; message?: string } };

        if (!res.ok) {
          throw new ChatApiError(
            body.error?.message ?? FALLBACK[res.status] ?? "The assistant is unavailable right now. Please try again.",
            body.error?.code ?? "http_error",
            res.status,
          );
        }
        if (typeof body.reply !== "string") {
          throw new ChatApiError("The assistant sent an unexpected response.", "invalid_response", res.status);
        }
        return body.reply;
      } catch (err) {
        if (err instanceof ChatApiError) throw err;
        if (signal?.aborted) throw err; // caller cancelled; useChat ignores it
        if (controller.signal.aborted) throw new ChatApiError("The assistant took too long to respond. Please try again.", "timeout");
        throw new ChatApiError("Couldn't reach the assistant. Check your connection and try again.", "network");
      } finally {
        clearTimeout(timeout);
        signal?.removeEventListener("abort", onAbort);
      }
    },
  };
}

export const apiChatService = createApiChatService();
