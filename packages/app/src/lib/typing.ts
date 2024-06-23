import type { VariableFunction, Visibility$options } from '$houdini';
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

export type WithoutRuntimeScalars<T> = Omit<T, 'loggedIn'>;

/**
 * See https://github.com/HoudiniGraphQL/houdini/issues/1308
 */
export type VariableFunctionFixed<Params extends Record<string, string>, Input> = VariableFunction<
  Params,
  WithoutRuntimeScalars<Input>
>;
