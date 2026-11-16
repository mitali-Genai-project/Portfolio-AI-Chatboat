/**
 * Fixed-window, per-key rate limiter held in memory.
 *
 * On serverless platforms each warm instance has its own memory, so this is a
 * best-effort first line of defence, not a global guarantee. For a hard global
 * limit, put a shared store (e.g. Upstash Redis) or Vercel's WAF rate limiting
 * in front of the function.
 */
export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets (only meaningful when not allowed). */
  retryAfterSeconds: number;
}

export function createRateLimiter(limit: number, windowMs = 60_000, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string): RateLimitResult {
    const t = now();
    // Opportunistic cleanup so the map can't grow without bound.
    if (hits.size > 5_000) for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (entry.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - t) / 1000)) };
    }
    entry.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
}
