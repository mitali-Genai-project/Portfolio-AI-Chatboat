interface Compose {
  to: string;
  subject?: string;
  body?: string;
}

/** Phones and tablets always have a mail app registered for mailto:, desktops often don't. */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function mailtoUrl({ to, subject, body }: Compose): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  // mailto expects %20 for spaces, not "+".
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${to}${query ? `?${query}` : ""}`;
}

export function gmailComposeUrl({ to, subject, body }: Compose): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to });
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params}`;
}

/**
 * Where an "email me" link should point. On desktop a bare mailto: silently does nothing when no
 * mail client is configured (common on Windows), so we open Gmail's web composer in a new tab instead.
 */
export function composeEmail(c: Compose): { href: string; external: boolean } {
  return isMobile() ? { href: mailtoUrl(c), external: false } : { href: gmailComposeUrl(c), external: true };
}
