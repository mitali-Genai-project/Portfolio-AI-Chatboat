// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readConfig } from "../config";
import { createProvider } from "./index";

describe("provider selection", () => {
  it("defaults to Gemini with a free-tier model", () => {
    const config = readConfig({});
    expect(config.provider).toBe("gemini");
    expect(config.geminiModel).toBe("gemini-3.8-flash");
    expect(createProvider(config).name).toBe("gemini");
  });

  it.each([
    ["gemini", "gemini"],
    ["mock", "mock"],
    ["anthropic", "gemini"], // removed provider → falls back to the default
    [" Mock ", "mock"],
    ["unknown-provider", "gemini"],
  ])("CHAT_PROVIDER=%j → %s", (value, expected) => {
    expect(createProvider(readConfig({ CHAT_PROVIDER: value })).name).toBe(expected);
  });

  it("honours GEMINI_MODEL", () => {
    expect(readConfig({ GEMINI_MODEL: "gemini-3.6-flash" }).geminiModel).toBe("gemini-3.6-flash");
  });
});
