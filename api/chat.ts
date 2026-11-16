// Vercel Function: POST /api/chat → { reply: string } | { error: { code, message } }
// Secrets (GEMINI_API_KEY) are read from server-side environment variables only.
import { createChatHandler } from "../server/chat/handler.js";

export const config = { maxDuration: 30 };

const handleChat = createChatHandler();

export default {
  fetch(request: Request): Promise<Response> {
    return handleChat(request);
  },
};
