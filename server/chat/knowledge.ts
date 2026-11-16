import { readFileSync } from "node:fs";
import path from "node:path";

/** Relative to the project root (process.cwd() locally and on Vercel; see vercel.json includeFiles). */
export const KNOWLEDGE_PATH = path.join(process.cwd(), "knowledge", "portfolio.md");

let cached: string | null = null;

/** The portfolio knowledge base (Markdown), read once per server instance. */
export function loadKnowledge(): string {
  cached ??= readFileSync(KNOWLEDGE_PATH, "utf8").trim();
  return cached;
}
