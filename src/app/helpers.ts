export function omit<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k as keyof T))
  ) as Partial<T>;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => keys.includes(k as K))
  ) as Pick<T, K>;
}
