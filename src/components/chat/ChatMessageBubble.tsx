import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import type { ReactNode } from "react";
import { chatbot } from "@/data/chatbot";
import type { ChatRole } from "@/services/chat/types";

export function BotAvatar() {
  return (
    <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
      <Bot className="size-4" />
    </span>
  );
}

// Turns URLs and email addresses in plain text into links.
const LINK_RE = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    const isEmail = !part.startsWith("http");
    return (
      <a
        key={i}
        href={isEmail ? `mailto:${part}` : part}
        {...(!isEmail && { target: "_blank", rel: "noreferrer" })}
        className="break-all underline decoration-accent/50 underline-offset-2 hover:text-accent"
      >
        {part}
      </a>
    );
  });
}

export function ChatMessageBubble({ role, content }: { role: ChatRole; content: string }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && <BotAvatar />}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-line ${
          isUser ? "rounded-br-md bg-accent text-accent-fg" : "rounded-bl-md bg-surface-2 text-fg"
        }`}
      >
        <span className="sr-only">{isUser ? "You: " : `${chatbot.name}: `}</span>
        {isUser ? content : linkify(content)}
      </div>
    </motion.div>
  );
}
