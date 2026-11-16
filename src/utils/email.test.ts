import { afterEach, describe, expect, it, vi } from "vitest";
import { composeEmail, gmailComposeUrl, mailtoUrl } from "./email";

const msg = {
  to: "me@example.com",
  subject: "Hi there",
  body: "Line 1\nLine 2 & more",
};

describe("email links", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("builds a mailto link with %20-encoded spaces", () => {
    expect(mailtoUrl(msg)).toBe(
      "mailto:me@example.com?subject=Hi%20there&body=Line%201%0ALine%202%20%26%20more",
    );
    expect(mailtoUrl({ to: "me@example.com" })).toBe("mailto:me@example.com");
  });

  it("builds a Gmail compose link", () => {
    const url = new URL(gmailComposeUrl(msg));
    expect(url.origin + url.pathname).toBe("https://mail.google.com/mail/");
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("to")).toBe("me@example.com");
    expect(url.searchParams.get("su")).toBe("Hi there");
    expect(url.searchParams.get("body")).toBe("Line 1\nLine 2 & more");
  });

  it("uses Gmail in a new tab on desktop and mailto on phones", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/130.0",
    });
    expect(composeEmail(msg)).toMatchObject({
      external: true,
      href: expect.stringContaining("mail.google.com"),
    });

    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile",
    });
    expect(composeEmail(msg)).toMatchObject({
      external: false,
      href: expect.stringMatching(/^mailto:/),
    });
  });
});
