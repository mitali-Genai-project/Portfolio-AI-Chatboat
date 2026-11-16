import { AnimatePresence, motion } from "framer-motion";
import { Eraser, MessageCircle, RotateCcw, Sparkles, TriangleExclamationPoint, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { chatbot } from "@/data/chatbot";
import { useChat } from "@/hooks/useChat";
import { apiChatService } from "@/services/chat/apiChatService";
import type { ChatService } from "@/services/chat/types";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { TypingIndicator } from "./TypingIndicator";

const MOBILE_QUERY = "(max-width: 639px)";

/** Floating launcher + chat window. All conversation logic lives in useChat / the ChatService. */
export function ChatWidget({ service = apiChatService }: { service?: ChatService }) {
  const [open, setOpen] = useState(false);
  const { messages, status, error, send, retry, reset } = useChat(service);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Focus the input on open; return focus to the launcher on close.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // On wider screens the chat is a side panel: reserve its width so the page reflows beside it.
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("chat-open");
    return () => document.documentElement.classList.remove("chat-open");
  }, [open]);

  // Escape closes; lock page scroll while the full-screen mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const lock = window.matchMedia?.(MOBILE_QUERY).matches;
    if (lock) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (lock) document.body.style.overflow = "";
    };
  }, [open]);

  // Follow the conversation: show the start of a new reply (long answers stay readable
  // from the top); otherwise stick to the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el?.scrollTo) return;
    const last = messages.at(-1);
    const lastEl = el.querySelector<HTMLElement>("[data-message]:last-of-type");
    const top = last?.role === "assistant" && lastEl ? lastEl.offsetTop - 12 : el.scrollHeight;
    el.scrollTo({ top, behavior: "smooth" });
  }, [messages, status, open]);

  const isEmpty = messages.length === 0;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            id="chat-window"
            role="dialog"
            aria-labelledby="chat-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[70] flex flex-col bg-surface sm:left-auto sm:w-[min(400px,45vw)] sm:border-l sm:border-line sm:shadow-2xl sm:shadow-black/20"
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-fg">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="chat-title" className="truncate text-base font-semibold">
                  {chatbot.name}
                </h2>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  {chatbot.subtitle}
                  <span
                    title="Answers are AI-generated from Mitali's portfolio and may contain mistakes."
                    className="rounded-full border border-line px-1.5 py-px text-[10px] font-medium tracking-wide uppercase"
                  >
                    AI
                  </span>
                </p>
              </div>
              {!isEmpty && (
                <IconButton label="Clear conversation" onClick={reset}>
                  <Eraser className="size-[18px]" aria-hidden />
                </IconButton>
              )}
              <IconButton label="Close chat" onClick={() => setOpen(false)}>
                <X className="size-5" aria-hidden />
              </IconButton>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-5">
              <div role="log" aria-live="polite" aria-label="Conversation" className="space-y-4">
                <ChatMessageBubble role="assistant" content={chatbot.greeting} />
                {messages.map((m) => (
                  <div key={m.id} data-message>
                    <ChatMessageBubble role={m.role} content={m.content} />
                  </div>
                ))}
              </div>

              {isEmpty && (
                <div className="mt-5 pl-9">
                  <p className="mb-2 text-xs font-medium text-muted">Suggested questions</p>
                  <ul className="flex flex-col items-start gap-2">
                    {chatbot.suggestedQuestions.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          onClick={() => send(q)}
                          className="rounded-xl border border-line bg-bg px-3 py-2 text-left text-sm text-fg transition hover:border-accent/60 hover:text-accent"
                        >
                          {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {status === "loading" && (
                <div className="mt-4">
                  <TypingIndicator name={chatbot.name} />
                </div>
              )}

              {status === "error" && (
                <div
                  role="alert"
                  className="mt-4 ml-9 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-red-600 dark:text-red-300">
                    <TriangleExclamationPoint className="size-4 shrink-0" aria-hidden />
                    {error ?? "Something went wrong."}
                  </span>
                  <button
                    type="button"
                    onClick={retry}
                    className="inline-flex items-center gap-1.5 font-medium text-fg underline-offset-2 hover:text-accent hover:underline"
                  >
                    <RotateCcw className="size-3.5" aria-hidden /> Retry
                  </button>
                </div>
              )}
            </div>

            <ChatComposer
              ref={inputRef}
              onSend={send}
              disabled={status === "loading"}
              placeholder={chatbot.placeholder}
              maxLength={chatbot.maxInputLength}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher (hidden while the panel is open; the panel has its own close button) */}
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chat-window"
        aria-label={open ? `Close ${chatbot.name}` : `Open ${chatbot.name} chat`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.4 }}
        className={`fixed right-4 bottom-4 z-[70] grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lg shadow-accent/30 sm:right-6 sm:bottom-6 ${
          open ? "hidden" : ""
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </button>
  );
}
