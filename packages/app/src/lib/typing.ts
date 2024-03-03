export function hasNoUndefineds<T>(items: T[]): items is NonNullable<T>[] {
  return items.every(Boolean);
}

export function notNull<T>(value: T | null): value is T {
  return value !== null;
}

export function notUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
