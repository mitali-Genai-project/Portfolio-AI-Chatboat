// @vitest-environment node
import { ApiError, type GenerateContentParameters } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import { GeminiProvider, toProviderError, type GeminiModelsClient } from "./gemini";

const config = { geminiModel: "gemini-3.8-flash", maxOutputTokens: 2048, timeoutMs: 25_000 };
const messages = [
  { role: "user" as const, content: "Who is Mitali?" },
  { role: "assistant" as const, content: "A Java Full Stack Developer." },
  { role: "user" as const, content: "Where has she worked?" },
];

/** Fake of `ai.models` — no network. */
function fakeClient(result: unknown) {
  const generateContent = vi.fn<(params: GenerateContentParameters) => Promise<unknown>>(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  return { client: { generateContent } as unknown as GeminiModelsClient, generateContent };
}

const response = (text: string | undefined, finishReason = "STOP", extra: Record<string, unknown> = {}) => ({
  text,
  candidates: [{ finishReason }],
  ...extra,
});

describe("GeminiProvider", () => {
  it("sends the system prompt, maps roles, and returns the text", async () => {
    const { client, generateContent } = fakeClient(response("She worked at Infosys, Amal Infosystems and TalentCafe."));
    const reply = await new GeminiProvider(config, client).complete({ system: "RULES+KB", messages });

    expect(reply).toBe("She worked at Infosys, Amal Infosystems and TalentCafe.");
    const params = generateContent.mock.calls[0][0];
    expect(params.model).toBe("gemini-3.8-flash");
    expect(params.contents).toEqual([
      { role: "user", parts: [{ text: "Who is Mitali?" }] },
      { role: "model", parts: [{ text: "A Java Full Stack Developer." }] },
      { role: "user", parts: [{ text: "Where has she worked?" }] },
    ]);
    expect(params.config).toMatchObject({ systemInstruction: "RULES+KB", maxOutputTokens: 2048 });
    expect(params.config?.abortSignal).toBeInstanceOf(AbortSignal);
  });

  it("reports not_configured when GEMINI_API_KEY is missing, without calling the API", async () => {
    await expect(new GeminiProvider(config, undefined, {}).complete({ system: "s", messages })).rejects.toMatchObject({
      kind: "not_configured",
    });
  });

  it("returns a polite reply when the prompt or answer is blocked", async () => {
    const blockedPrompt = fakeClient(response(undefined, "STOP", { promptFeedback: { blockReason: "SAFETY" } }));
    await expect(new GeminiProvider(config, blockedPrompt.client).complete({ system: "s", messages })).resolves.toMatch(/can't help/);

    const blockedAnswer = fakeClient(response(undefined, "SAFETY"));
    await expect(new GeminiProvider(config, blockedAnswer.client).complete({ system: "s", messages })).resolves.toMatch(/can't help/);
  });

  it("marks truncated replies and fails on empty ones", async () => {
    const truncated = fakeClient(response("Long answer", "MAX_TOKENS"));
    await expect(new GeminiProvider(config, truncated.client).complete({ system: "s", messages })).resolves.toBe("Long answer…");

    const empty = fakeClient(response(""));
    await expect(new GeminiProvider(config, empty.client).complete({ system: "s", messages })).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("falls back to the next free model when one is overloaded or out of quota", async () => {
    const generateContent = vi
      .fn<(params: GenerateContentParameters) => Promise<unknown>>()
      .mockRejectedValueOnce(new ApiError({ status: 503, message: "high demand" }))
      .mockRejectedValueOnce(new ApiError({ status: 429, message: "quota" }))
      .mockResolvedValueOnce(response("From the lite model."));
    const provider = new GeminiProvider(
      { ...config, geminiFallbackModels: ["gemini-3.6-flash", "gemini-3.5-flash-lite"] },
      { generateContent } as never,
    );

    await expect(provider.complete({ system: "s", messages })).resolves.toBe("From the lite model.");
    expect(generateContent.mock.calls.map(([p]) => p.model)).toEqual([
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
    ]);
  });

  it("moves on when a model hangs, without using the whole budget on it", async () => {
    const generateContent = vi.fn((params: GenerateContentParameters) =>
      params.model === "gemini-3.8-flash"
        ? new Promise((_, reject) =>
            params.config!.abortSignal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))),
          )
        : Promise.resolve(response("Fallback answer.")),
    );
    const provider = new GeminiProvider(
      { ...config, timeoutMs: 500, geminiFallbackModels: ["gemini-3.6-flash"] },
      { generateContent } as never,
    );
    const started = Date.now();
    await expect(provider.complete({ system: "s", messages })).resolves.toBe("Fallback answer.");
    expect(Date.now() - started).toBeLessThan(450);
  });

  it("does not fall back on non-capacity errors (e.g. invalid key)", async () => {
    const generateContent = vi.fn().mockRejectedValue(new ApiError({ status: 401, message: "bad key" }));
    const provider = new GeminiProvider({ ...config, geminiFallbackModels: ["gemini-3.6-flash"] }, { generateContent } as never);
    await expect(provider.complete({ system: "s", messages })).rejects.toMatchObject({ kind: "not_configured" });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("reports the last capacity error when every model is busy", async () => {
    const generateContent = vi.fn().mockRejectedValue(new ApiError({ status: 503, message: "high demand" }));
    const provider = new GeminiProvider({ ...config, geminiFallbackModels: ["gemini-3.6-flash"] }, { generateContent } as never);
    await expect(provider.complete({ system: "s", messages })).rejects.toMatchObject({ kind: "rate_limited" });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("enforces an overall deadline and reports it as a timeout", async () => {
    const generateContent = vi.fn(
      (params: GenerateContentParameters) =>
        new Promise((_, reject) =>
          params.config!.abortSignal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))),
        ),
    );
    const provider = new GeminiProvider({ ...config, timeoutMs: 50 }, { generateContent } as never);
    await expect(provider.complete({ system: "s", messages })).rejects.toMatchObject({ kind: "timeout" });
  });

  it("reports caller cancellation as aborted", async () => {
    const generateContent = vi.fn(
      (params: GenerateContentParameters) =>
        new Promise((_, reject) =>
          params.config!.abortSignal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))),
        ),
    );
    const controller = new AbortController();
    const pending = new GeminiProvider(config, { generateContent } as never).complete({ system: "s", messages, signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ kind: "aborted" });
  });
});

describe("toProviderError (Gemini)", () => {
  const api = (status: number, message = "{}") => new ApiError({ status, message });

  it.each([
    ["400 invalid key", api(400, '{"error":{"details":[{"reason":"API_KEY_INVALID"}]}}'), "not_configured"],
    ["401", api(401), "not_configured"],
    ["403", api(403), "not_configured"],
    ["429 free-tier quota", api(429), "rate_limited"],
    ["503 overloaded", api(503), "rate_limited"],
    ["504", api(504), "timeout"],
    ["500", api(500), "unavailable"],
    ["400 bad request", api(400), "bad_request"],
    ["404 unknown model", api(404), "bad_request"],
    ["network", new TypeError("fetch failed"), "unavailable"],
    ["abort", new DOMException("aborted", "AbortError"), "aborted"],
    ["unknown", new Error("?"), "unavailable"],
  ])("%s → %s", (_label, err, kind) => {
    expect(toProviderError(err).kind).toBe(kind);
  });
});
