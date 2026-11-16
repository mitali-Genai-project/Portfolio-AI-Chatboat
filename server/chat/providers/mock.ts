import type { CompletionRequest, LlmProvider } from "./types.js";

/**
 * Deterministic provider for automated tests and for local development without an
 * API key (CHAT_PROVIDER=mock). Never calls the network.
 */
export class MockProvider implements LlmProvider {
  readonly name = "mock";
  readonly calls: CompletionRequest[] = [];

  constructor(private readonly respond: (req: CompletionRequest) => string | Promise<string> = defaultReply) {}

  async complete(request: CompletionRequest): Promise<string> {
    this.calls.push(request);
    return this.respond(request);
  }
}

function defaultReply({ messages }: CompletionRequest): string {
  const question = messages.at(-1)?.content ?? "";
  return `(Mock response — no LLM is configured.) You asked: "${question}". Set CHAT_PROVIDER and its API key to get real answers.`;
}
