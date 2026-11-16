import { motion } from "framer-motion";
import { BotAvatar } from "./ChatMessageBubble";

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2" role="status" aria-label={`${name} is typing`}>
      <BotAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-muted"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
