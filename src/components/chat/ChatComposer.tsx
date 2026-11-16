import { ArrowUp } from "lucide-react";
import { forwardRef, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

interface ChatComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder: string;
  maxLength: number;
}

/** Auto-growing input. Enter sends, Shift+Enter adds a new line. */
export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(function ChatComposer(
  { onSend, disabled, placeholder, maxLength },
  forwardedRef,
) {
  const [value, setValue] = useState("");
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = value.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [value]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(value);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-line p-3">
      <label htmlFor="chat-input" className="sr-only">
        Message
      </label>
      <textarea
        id="chat-input"
        ref={(el) => {
          innerRef.current = el;
          if (typeof forwardedRef === "function") forwardedRef(el);
          else if (forwardedRef) forwardedRef.current = el;
        }}
        rows={1}
        value={value}
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>
    </form>
  );
});
