import "server-only";

// Limiteur en mémoire (une instance). En production multi-instances : Redis / Upstash.
const buckets = new Map<string, number[]>();

export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  buckets.set(key, list);
  return list.length > max;
}
