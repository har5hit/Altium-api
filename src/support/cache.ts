export interface ReadCache {
  get: (key: string) => Promise<string | null>;
  set: (key: string, ttlSeconds: number, value: string) => Promise<void>;
}

export async function getOrSetCached<T>(
  cache: ReadCache | null,
  key: string,
  ttlSeconds: number,
  producer: () => Promise<T>
): Promise<T> {
  if (!cache) return producer();

  const cached = await cache.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const fresh = await producer();
  await cache.set(key, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}
