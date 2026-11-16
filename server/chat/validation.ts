export const LIMITS = {
  /** Max raw request body size. */
  maxBodyBytes: 16 * 1024,
  /** Max messages accepted in one request. */
  maxMessages: 40,
  /** Only the most recent messages are sent to the model, to bound cost. */
  contextMessages: 12,
  maxUserChars: 500,
  maxAssistantChars: 4000,
} as const;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export type ValidationResult = { ok: true; messages: ChatTurn[] } | { ok: false; error: string };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Validates the parsed JSON body `{ messages: [{ role, content }] }`. */
export function validateChatRequest(body: unknown): ValidationResult {
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return { ok: false, error: "Body must be a JSON object with a `messages` array." };
  }
  const raw = body.messages;
  if (raw.length === 0) return { ok: false, error: "`messages` must not be empty." };
  if (raw.length > LIMITS.maxMessages) {
    return { ok: false, error: `Too many messages (max ${LIMITS.maxMessages}).` };
  }

  const messages: ChatTurn[] = [];
  for (const [i, m] of raw.entries()) {
    if (!isRecord(m)) return { ok: false, error: `messages[${i}] must be an object.` };
    const { role, content } = m;
    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: `messages[${i}].role must be "user" or "assistant".` };
    }
    if (typeof content !== "string" || content.trim().length === 0) {
      return { ok: false, error: `messages[${i}].content must be a non-empty string.` };
    }
    const max = role === "user" ? LIMITS.maxUserChars : LIMITS.maxAssistantChars;
    if (content.length > max) {
      return { ok: false, error: `messages[${i}].content is too long (max ${max} characters).` };
    }
    messages.push({ role, content: content.trim() });
  }

  if (messages.at(-1)!.role !== "user") {
    return { ok: false, error: "The last message must be from the user." };
  }

  // Keep recent context only, starting on a user turn.
  const recent = messages.slice(-LIMITS.contextMessages);
  while (recent[0].role !== "user") recent.shift();
  return { ok: true, messages: recent };
}
