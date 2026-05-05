const memory = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const current = memory.get(key);
  if (!current || now > current.resetAt) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) return { ok: false, remaining: 0 };
  current.count += 1;
  memory.set(key, current);
  return { ok: true, remaining: Math.max(0, limit - current.count) };
}
