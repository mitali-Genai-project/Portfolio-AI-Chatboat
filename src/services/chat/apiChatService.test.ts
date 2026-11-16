import { describe, expect, it, vi } from "vitest";
import { createApiChatService } from "./apiChatService";
import type { ChatMessage } from "./types";

const msg = (role: ChatMessage["role"], content: string, i = 0): ChatMessage => ({
  id: String(i),
  role,
  content,
  createdAt: i,
});

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

describe("apiChatService", () => {
  it("posts only role/content to /api/chat and returns the reply", async () => {
    const fetch = respond(200, { reply: "Hello!" });
    vi.stubGlobal("fetch", fetch);

    await expect(createApiChatService().reply([msg("user", "Hi")])).resolves.toBe("Hello!");

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/chat");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ messages: [{ role: "user", content: "Hi" }] });
    expect(JSON.stringify(init.headers)).not.toMatch(/authorization|x-api-key/i);
  });

  it("sends at most the last 20 messages", async () => {
    const fetch = respond(200, { reply: "ok" });
    vi.stubGlobal("fetch", fetch);
    const history = Array.from({ length: 25 }, (_, i) => msg(i % 2 ? "assistant" : "user", `m${i}`, i));

    await createApiChatService().reply(history);
    const sent = JSON.parse((fetch.mock.calls[0] as [string, RequestInit])[1].body as string).messages;
    expect(sent).toHaveLength(20);
    expect(sent.at(-1).content).toBe("m24");
  });

  it("surfaces the server's error message", async () => {
    vi.stubGlobal("fetch", respond(429, { error: { code: "rate_limited", message: "Slow down please." } }));
    await expect(createApiChatService().reply([msg("user", "Hi")])).rejects.toMatchObject({
      message: "Slow down please.",
      code: "rate_limited",
      status: 429,
    });
  });

  it("falls back to a friendly message when the error body is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Gateway Timeout</html>", { status: 504 })));
    await expect(createApiChatService().reply([msg("user", "Hi")])).rejects.toThrow(/took too long/);
  });

  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(createApiChatService().reply([msg("user", "Hi")])).rejects.toMatchObject({ code: "network" });
  });

  it("rejects a malformed success response", async () => {
    vi.stubGlobal("fetch", respond(200, { nope: true }));
    await expect(createApiChatService().reply([msg("user", "Hi")])).rejects.toMatchObject({ code: "invalid_response" });
  });

  it("propagates caller cancellation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => new Promise((_, reject) => init.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))))),
    );
    const controller = new AbortController();
    const pending = createApiChatService().reply([msg("user", "Hi")], controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
