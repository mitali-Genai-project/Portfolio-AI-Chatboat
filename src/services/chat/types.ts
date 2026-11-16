export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

/**
 * Anything that can answer a conversation. The UI only depends on this
 * interface, so the mock can later be swapped for a real LLM-backed client.
 */
export interface ChatService {
  /** Resolves with the assistant's reply to the last user message in `history`. */
  reply(history: ChatMessage[], signal?: AbortSignal): Promise<string>;
}
