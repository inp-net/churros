export function hasNoUndefineds<T>(items: T[]): items is NonNullable<T>[] {
  return items.every(Boolean);
}
