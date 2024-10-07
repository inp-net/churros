import type {
  PaymentMethod$options,
  PendingValue,
  VariableFunction,
  Visibility$options,
} from '$houdini';
import type { PaymentMethod, Visibility } from '$lib/zeus';

export function hasNoUndefineds<T>(items: T[]): items is NonNullable<T>[] {
  return items.every(Boolean);
}

export function notNull<T>(value: T | null): value is T {
  return value !== null;
}

export function notUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

// Infers LoadingNode to Node on calls... can't use this yet.
export function edges<LoadingNode, Node>({
  edges,
}:
  | { edges: Array<{ node: Node } | null> }
  | { edges: Array<{ node: LoadingNode; cursor: typeof PendingValue }> }): Array<
  Node | LoadingNode
> {
  return edges.map((edge) => edge?.node ?? null).filter(notNull);
}

export function zeusVisibility(houdiniVisibility: Visibility$options): Visibility {
  return houdiniVisibility as Visibility;
}

export function houdiniVisibility(zeusVisibility: Visibility): Visibility$options {
  return zeusVisibility as Visibility$options;
}

export function zeusPaymentMethod(houdiniPaymentMethod: PaymentMethod$options): PaymentMethod {
  return houdiniPaymentMethod as PaymentMethod;
}

export type WithoutRuntimeScalars<T> = Omit<T, 'loggedIn'>;

/**
 * See https://github.com/HoudiniGraphQL/houdini/issues/1308
 */
export type VariableFunctionFixed<Params extends Record<string, string>, Input> = VariableFunction<
  Params,
  WithoutRuntimeScalars<Input>
>;

// See https://github.com/microsoft/TypeScript/issues/38520
export function entries<K extends string | number, V>(obj: Record<K, V>): [K, V][] {
  return Object.entries(obj) as [K, V][];
}

// Turn an iterable into a interator that has access to the previous value
export function* withPrevious<T>(iterable: Iterable<T>): Generator<[T, T | undefined]> {
  let previous: T | undefined = undefined;
  for (const current of iterable) {
    yield [current, previous];
    previous = current;
  }
}
