import type { Visibility$options } from '$houdini';
import type { Visibility } from '$lib/zeus';

export function hasNoUndefineds<T>(items: T[]): items is NonNullable<T>[] {
  return items.every(Boolean);
}

export function notNull<T>(value: T | null): value is T {
  return value !== null;
}

export function zeusVisibility(houdiniVisibility: Visibility$options): Visibility {
  return houdiniVisibility as Visibility;
}
