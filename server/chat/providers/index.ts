import type { ChatConfig } from "../config.js";
import { GeminiProvider } from "./gemini.js";
import { MockProvider } from "./mock.js";
import type { LlmProvider } from "./types.js";

/**
 * Picks the LLM backend from CHAT_PROVIDER. To add another provider (e.g. Groq or
 * Claude): implement LlmProvider in providers/<name>.ts, add it to PROVIDERS in
 * config.ts, and add a case here. Nothing else changes.
 */
export function createProvider(config: ChatConfig): LlmProvider {
  switch (config.provider) {
    case "gemini":
      return new GeminiProvider(config);
    case "mock":
      return new MockProvider();
  }
}
