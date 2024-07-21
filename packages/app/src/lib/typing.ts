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
