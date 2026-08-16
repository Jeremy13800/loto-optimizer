import { prisma } from "./prisma";

// Persisted in the DB rather than an in-memory Map: on serverless (Vercel),
// each invocation can hit a different / cold instance, so a module-level
// variable is not a reliable cache or rate-limit store. Backing this by the
// same DB used for draws makes it correct across instances.

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour

export async function getCached<T>(
  key: string,
  ttlMs: number = DEFAULT_TTL,
): Promise<T | null> {
  const entry = await prisma.appCache.findUnique({ where: { key } });
  if (!entry) return null;
  if (Date.now() - entry.updatedAt.getTime() > ttlMs) {
    // Expired: best-effort cleanup, don't block the caller on it.
    prisma.appCache.delete({ where: { key } }).catch(() => {});
    return null;
  }
  try {
    return JSON.parse(entry.value) as T;
  } catch {
    return null;
  }
}

export async function setCached(key: string, data: unknown): Promise<void> {
  const value = JSON.stringify(data);
  await prisma.appCache.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

/**
 * Clears cached entries. Pass a `prefix` (e.g. "stats:") to only clear
 * matching keys and leave unrelated entries (like "sync:lastSync") intact.
 * Omit it to clear everything.
 */
export async function invalidateCache(prefix?: string): Promise<void> {
  if (!prefix) {
    await prisma.appCache.deleteMany({});
    return;
  }
  await prisma.appCache.deleteMany({
    where: { key: { startsWith: prefix } },
  });
}
