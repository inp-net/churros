import { graphql, type MutationConfig, type MutationStore } from '$houdini';
import { type GraphQLObject, type GraphQLVariables } from '$houdini/runtime/lib/types';
import { allLoaded, type DeepMaybeLoading, type MaybeLoading } from '$lib/loading';
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
  variables: { [key in keyof NoInfer<Input>]: MaybeLoading<NoInfer<Input>[key]> },
  options?: {
    metadata?: App.Metadata;
    fetch?: typeof globalThis.fetch;
    event?: RequestEvent;
  } & MutationConfig<NoInfer<Data>, DeepMaybeLoading<NoInfer<Input>>, NoInfer<Optimistic>>,
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
