import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatRole, ChatService } from "@/services/chat/types";

const STORAGE_KEY = "mitali-ai:messages";

let seq = 0;
const makeMessage = (role: ChatRole, content: string): ChatMessage => ({
  id: `${Date.now().toString(36)}-${(seq++).toString(36)}`,
  role,
  content,
  createdAt: Date.now(),
});

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export type ChatStatus = "idle" | "loading" | "error";

/**
 * Conversation state for one browser tab session (persisted in sessionStorage).
 * UI-agnostic: pass in any ChatService.
 */
export function useChat(service: ChatService) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage unavailable — history lasts until the page closes */
    }
  }, [messages]);

  // Cancel any in-flight request on unmount.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const request = useCallback(
    async (history: ChatMessage[]) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setStatus("loading");
      setError(null);
      try {
        const reply = await service.reply(history, controller.signal);
        if (controller.signal.aborted) return;
        setMessages((m) => [...m, makeMessage("assistant", reply)]);
        setStatus("idle");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setStatus("error");
      }
    },
    [service],
  );

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || status === "loading") return;
      const next = [...messages, makeMessage("user", content)];
      setMessages(next);
      void request(next);
    },
    [messages, status, request],
  );

  /** Re-asks the last user message after a failure. */
  const retry = useCallback(() => {
    if (status !== "error") return;
    void request(messages);
  }, [status, messages, request]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setMessages([]);
    setStatus("idle");
    setError(null);
  }, []);

  return { messages, status, error, send, retry, reset };
}
