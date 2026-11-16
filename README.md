# Mitali Verma — Portfolio

React + TypeScript + Vite portfolio with live GitHub data and **QueryMe**, a chatbot
that answers questions about Mitali through a Vercel serverless function, powered by
Google Gemini (free tier). The LLM is pluggable; a mock provider is included for testing.

## Quick start

```bash
npm install
cp .env.example .env.local   # then set GEMINI_API_KEY (or CHAT_PROVIDER=mock)
npm run dev                  # http://localhost:3000 — also serves /api/chat
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server; `/api/chat` runs the same handler as production |
| `npm run build` | Type-check and build the static site to `dist/` |
| `npm run lint` | ESLint (TypeScript + React hooks rules) |
| `npm test` | Unit + component tests (no network, mock LLM provider) |
| `npm run test:live` | Live tests against GitHub, and against Gemini when `GEMINI_API_KEY` is set |

## Environment variables

All are **server-side only**: none has a `VITE_` prefix, so Vite never exposes them to
the browser, and only `api/chat.ts` reads them. Locally, put them in `.env.local`
(git-ignored). On Vercel, add them under **Project → Settings → Environment Variables**.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `CHAT_PROVIDER` | No | `gemini` | `gemini`, or `mock` (canned replies, no key). |
| `GEMINI_API_KEY` | **Yes** for Gemini | — | Free key from https://aistudio.google.com/apikey. Missing → chat returns `503 not_configured`. |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | Any free-tier Gemini model, e.g. `gemini-3.6-flash`, `gemini-3.5-flash-lite`. |
| `GEMINI_FALLBACK_MODELS` | No | `gemini-3.6-flash,gemini-3.5-flash-lite` | Tried in order when the main model is overloaded (503) or out of free quota (429). |
| `CHAT_MAX_OUTPUT_TOKENS` | No | `2048` | Max tokens per reply. |
| `CHAT_TIMEOUT_MS` | No | `25000` | Upstream timeout (function `maxDuration` is 30 s). |
| `CHAT_RATE_LIMIT_PER_MINUTE` | No | `10` | Requests per minute per IP, per server instance. |
| `CHAT_ALLOWED_ORIGINS` | No | — | Extra allowed browser origins, comma-separated. Same-origin is always allowed. |

See [`.env.example`](.env.example) for a template.

> **Gemini free tier:** Google may use free-tier prompts and responses to improve its
> products, so visitors' chat questions are shared with Google. Free-tier quotas are
> per project; when exhausted, the chat shows "busy, try again" (`503`). Check your
> limits at https://aistudio.google.com/rate-limit.

## Chatbot architecture

```
Browser ── POST /api/chat {messages} ──▶ api/chat.ts (Vercel Function)
  src/services/chat/apiChatService.ts      └─ server/chat/handler.ts
  (no credentials)                              ├─ validation.ts   size, roles, length limits
                                                ├─ rateLimit.ts    per-IP limit
                                                ├─ prompt.ts       system prompt (answer only from KB)
                                                ├─ knowledge.ts ◀─ knowledge/portfolio.md
                                                └─ providers/
                                                     ├─ index.ts      picks one from CHAT_PROVIDER
                                                     ├─ gemini.ts     Gemini via @google/genai
                                                     └─ mock.ts       tests / no-key local dev
```

- **Switching providers** is a config change: set `CHAT_PROVIDER` and that provider's
  key. To add another (e.g. Groq or Claude), implement the `LlmProvider` interface in
  `providers/<name>.ts`, add the name to `PROVIDERS` in `config.ts`, and add a case in
  `providers/index.ts`. The handler, prompt, knowledge base and frontend don't change.
- **Knowledge base:** [`knowledge/portfolio.md`](knowledge/portfolio.md) is the chatbot's only
  source of facts and is sent in full as context (no vector DB / RAG). When you change
  `src/data/`, update it too — `server/chat/knowledge.test.ts` fails if they drift.
- **Guardrails:** the system prompt limits answers to the knowledge base, keeps
  independent GenAI work separate from professional experience, and declines off-topic
  or prompt-injection requests. Blocked or refused answers return a polite message.
- **Limits:** 16 KB request body, 500 characters per user message, 40 messages per
  request (only the last 12 are sent to the model), 10 requests/minute/IP.
- **Errors:** responses are `{ reply }` or `{ error: { code, message } }`. Upstream
  details are logged server-side, never returned: timeouts → `504`, provider rate
  limits/overload/missing key → `503`, other provider failures → `502`, our rate
  limit → `429` with `Retry-After`.
- The in-memory rate limiter is per serverless instance. For a hard global limit, add
  Vercel WAF rate limiting or a shared store such as Upstash Redis.

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Vite).
2. Set `GEMINI_API_KEY` (and any optional variables above).
3. Deploy. `vercel.json` sets the function's `maxDuration` and bundles `knowledge/`.
