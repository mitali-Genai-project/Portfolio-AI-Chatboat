/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Server-only variables copied from .env files into process.env for the dev API and tests. */
const SERVER_ENV = [
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "GEMINI_FALLBACK_MODELS",
  "CHAT_PROVIDER",
  "CHAT_MAX_OUTPUT_TOKENS",
  "CHAT_TIMEOUT_MS",
  "CHAT_RATE_LIMIT_PER_MINUTE",
  "CHAT_ALLOWED_ORIGINS",
];

/**
 * Serves api/*.ts during `vite dev` with the same Web Request/Response handlers
 * Vercel runs in production, so no Vercel CLI is needed locally.
 * Runs in Node only; nothing here is bundled into the client.
 */
function devApi(): Plugin {
  return {
    name: "dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        try {
          const mod = (await server.ssrLoadModule("/api/chat.ts")) as {
            default: { fetch: (r: Request) => Promise<Response> };
          };
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
          }
          const method = req.method ?? "GET";
          const controller = new AbortController();
          res.on("close", () => !res.writableEnded && controller.abort());
          const response = await mod.default.fetch(
            new Request(`http://${req.headers.host}${req.originalUrl ?? req.url}`, {
              method,
              headers,
              body: method === "GET" || method === "HEAD" ? undefined : Buffer.concat(chunks),
              signal: controller.signal,
            }),
          );
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          console.error(err);
          res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Only the listed server keys go to process.env; the client still only sees VITE_* vars.
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of SERVER_ENV) if (env[key] && !process.env[key]) process.env[key] = env[key];

  return {
    plugins: [react(), tailwindcss(), devApi()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 3000,
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
