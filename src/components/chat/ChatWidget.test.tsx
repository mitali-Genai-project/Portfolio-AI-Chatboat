import { act, fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { chatbot } from "@/data/chatbot";
import type { ChatService } from "@/services/chat/types";
import { ChatWidget } from "./ChatWidget";

/** A service whose replies the test resolves/rejects by hand. */
function controllableService() {
  const pending: { resolve: (s: string) => void; reject: (e: Error) => void }[] = [];
  const service: ChatService = {
    reply: vi.fn(() => new Promise<string>((resolve, reject) => pending.push({ resolve, reject }))),
  };
  const settle = async (fn: (p: (typeof pending)[number]) => void) => {
    await act(async () => fn(pending.shift()!));
  };
  return {
    service,
    resolveNext: (text: string) => settle((p) => p.resolve(text)),
    rejectNext: (msg: string) => settle((p) => p.reject(new Error(msg))),
  };
}

const openChat = () => fireEvent.click(screen.getByRole("button", { name: `Open ${chatbot.name} chat` }));
const log = () => screen.getByRole("log", { name: "Conversation" });

describe("<ChatWidget />", () => {
  it("opens from the floating button with greeting and suggested questions, and closes on Escape", async () => {
    render(<ChatWidget service={controllableService().service} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    openChat();
    expect(screen.getByRole("dialog", { name: chatbot.name })).toBeTruthy();
    expect(log().textContent).toContain(chatbot.greeting);
    for (const q of chatbot.suggestedQuestions) expect(screen.getByRole("button", { name: q })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Message"));

    fireEvent.keyDown(window, { key: "Escape" });
    // Exit animation runs before unmount.
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: `Open ${chatbot.name} chat` }));
  });

  it("sends a suggested question, shows the typing indicator, then the reply", async () => {
    const { service, resolveNext } = controllableService();
    render(<ChatWidget service={service} />);
    openChat();

    fireEvent.click(screen.getByRole("button", { name: chatbot.suggestedQuestions[0] }));

    expect(log().textContent).toContain(chatbot.suggestedQuestions[0]);
    expect(screen.getByRole("status", { name: `${chatbot.name} is typing` })).toBeTruthy();
    expect(screen.queryByRole("button", { name: chatbot.suggestedQuestions[1] })).toBeNull();
    expect(screen.getByRole("button", { name: "Send message" }).hasAttribute("disabled")).toBe(true);

    await resolveNext("She has 4+ years of experience.");

    expect(log().textContent).toContain("She has 4+ years of experience.");
    expect(screen.queryByRole("status", { name: `${chatbot.name} is typing` })).toBeNull();
  });

  it("sends typed text on Enter but not on Shift+Enter, and ignores blank input", async () => {
    const { service, resolveNext } = controllableService();
    render(<ChatWidget service={service} />);
    openChat();
    const input = screen.getByLabelText("Message") as HTMLTextAreaElement;

    fireEvent.keyDown(input, { key: "Enter" });
    expect(service.reply).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "Hello there" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(service.reply).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(service.reply).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");
    await resolveNext("Hi!");
  });

  it("shows an error with a retry that re-asks the same question", async () => {
    const { service, rejectNext, resolveNext } = controllableService();
    render(<ChatWidget service={service} />);
    openChat();
    fireEvent.click(screen.getByRole("button", { name: chatbot.suggestedQuestions[4] }));

    await rejectNext("The assistant is temporarily unavailable.");
    expect(screen.getByRole("alert").textContent).toContain("temporarily unavailable");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(service.reply).toHaveBeenCalledTimes(2);
    const retriedHistory = vi.mocked(service.reply).mock.calls[1][0];
    expect(retriedHistory.at(-1)?.content).toBe(chatbot.suggestedQuestions[4]);

    await resolveNext("Email her.");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(log().textContent).toContain("Email her.");
  });

  it("keeps history for the session and can clear it", async () => {
    const first = controllableService();
    const { unmount } = render(<ChatWidget service={first.service} />);
    openChat();
    fireEvent.click(screen.getByRole("button", { name: chatbot.suggestedQuestions[2] }));
    await first.resolveNext("Java answer");
    unmount();

    render(<ChatWidget service={controllableService().service} />);
    openChat();
    expect(log().textContent).toContain("Java answer");

    fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
    expect(log().textContent).not.toContain("Java answer");
    expect(screen.getByRole("button", { name: chatbot.suggestedQuestions[0] })).toBeTruthy();
  });
});
