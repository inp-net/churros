import {
  graphql,
  type GraphQLObject,
  type GraphQLVariables,
  type MutationConfig,
  type MutationStore,
} from '$houdini';
import { allLoaded, type DeepMaybeLoading, type MaybeLoading } from '$lib/loading';
import { toasts } from '$lib/toasts';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Just like Store.mutate, but with a few goodies. Right now:
 * - Returns early if any of the variables's values are loading
 * @param store the mutation store
 * @param variables variables to pass
 * @param options mutation configuration (see the store's mutate method)
 * @returns the mutaiton result
 */
export function mutate<
  Data extends GraphQLObject,
  Input extends GraphQLVariables,
  Optimistic extends GraphQLObject,
>(
  store: MutationStore<Data, Input, Optimistic>,
  variables: { [key in keyof Input]: MaybeLoading<Input[key]> },
  options?: {
    metadata?: App.Metadata;
    fetch?: typeof globalThis.fetch;
    event?: RequestEvent;
  } & MutationConfig<Data, DeepMaybeLoading<Input>, Optimistic>,
) {
  if (!allLoaded(variables)) return;

  // TODO maybe put toasts.mutation here
  // @ts-expect-error we know that all variables are loaded
  return store.mutate(variables, options);
}

graphql(`
  fragment MutationErrors on ErrorInterface {
    __typename
    ... on Error {
      message
    }
    ... on ZodError {
      fieldErrors {
        path
        message
      }
    }
    ... on NotFoundError {
      message
    }
  }
`);

export async function mutateAndToast<
  Data extends GraphQLObject,
  Input extends GraphQLVariables,
  Optimistic extends GraphQLObject,
>(
  mutationStore: MutationStore<Data, Input, Optimistic>,
  variables: { [key in keyof Input]: MaybeLoading<Input[key]> },
  options?: {
    success?: string;
    error?: string;
    optimistic?: NoInfer<Optimistic>;
  },
) {
  const result = await mutate(mutationStore, variables, {
    optimisticResponse: options?.optimistic,
  });
  const mutationName = Object.keys(result?.data ?? {}).at(0);
  // @ts-expect-error FIXME typing is hard to get right here but tkt it works™
  toasts.mutation(result, mutationName, options?.success, options?.error);
}
