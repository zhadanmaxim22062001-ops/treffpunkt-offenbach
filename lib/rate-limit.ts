const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

/**
 * In-memory only, on purpose — no Redis, no database, matching the rest of
 * the project's "no external services" brief. That also means it's only
 * ever as good as the single warm serverless instance it runs in: a cold
 * start resets it, and it isn't shared across instances if Vercel scales
 * the function out. Good enough to blunt a script hammering the endpoint
 * from one IP inside one instance; not a defense against a distributed one.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}
