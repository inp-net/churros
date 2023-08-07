import { page } from '$app/stores';
import { PUBLIC_API_URL } from '$env/static/public';
import type { LayoutServerData } from '.svelte-kit/types/src/routes/$types';
import { error, type LoadEvent } from '@sveltejs/kit';
import {
  Thunder,
  ZeusScalars,
  type GraphQLResponse,
  type GraphQLTypes,
  type InputType,
  type ValueTypes,
} from '../zeus/index';
// @ts-expect-error Not typed
import extractFiles from 'extract-files/extractFiles.mjs';
// @ts-expect-error Not typed
import isFile from 'extract-files/isExtractableFile.mjs';
import { GraphQLError } from 'graphql';
import { derived } from 'svelte/store';

export * from '../zeus/index.js';

export type PropsType<
  T extends (...args: never[]) => unknown,
  U extends keyof GraphQLTypes = 'Query'
> = InputType<GraphQLTypes[U], ReturnType<T>>;

export interface Options {
  token?: string;
}

export class ZeusError extends Error {
  name = 'ZeusError';
  public readonly errors: GraphQLError[] = [];
  constructor(public readonly response: GraphQLResponse) {
    if (!response.errors || response.errors.length === 0) {
      super('the response does not contain any errors');
    } else {
      const errors = response.errors.map(
        ({ message, ...options }) => new GraphQLError(message, options)
      );
      super(
        `${response.errors.length} GraphQL error${response.errors.length === 1 ? '' : 's'}\n${errors
          .map((error) => `\t${error.message} ${JSON.stringify(error.extensions)}`)
          .join('\n')}`
      );
      this.errors = errors;
    }
  }
}

export const chain = (fetch: LoadEvent['fetch'], { token }: Options) => {
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return Thunder(async (query, variables) => {
    /* eslint-disable */
    let body: BodyInit;
    const { clone, files } = extractFiles(variables, isFile, 'variables');

    // If the payload contains files, send as multipart/form-data
    if (files.size > 0) {
      // Sometimes, Content-Type: application/json is already set when we get here. Delete it so that the browser can set the correct content-type header (including the boundary)
      headers.delete('Content-Type');
      body = new FormData();
      body.append('operations', JSON.stringify({ query, variables: clone }));
      body.append('map', JSON.stringify([...files.values()]));
      for (const [i, [file]] of [...files].entries()) body.append(`${i}`, file);
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify({ query, variables });
    }
    /* eslint-enable */

    const response = await fetch(PUBLIC_API_URL, { body, method: 'POST', headers });

    // If we received an HTTP error, propagate it
    if (!response.ok) throw error(response.status);

    return response
      .json()
      .catch(() => {
        throw new Error('The server returned an error.');
      })
      .then((graphqlResponse: GraphQLResponse) => {
        if (graphqlResponse.errors || !response.ok) throw new ZeusError(graphqlResponse);
        return graphqlResponse.data;
      });
  });
};

const scalars = ZeusScalars({
  DateTime: {
    decode: (value: unknown): Date => new Date(value as string),
    encode: (value: unknown): string => JSON.stringify(value),
  },
});

export const zeus = derived(page, ({ data }) => {
  const chained = chain(fetch, { token: (data as LayoutServerData).token });
  return {
    query: chained('query', { scalars }),
    mutate: chained('mutation', { scalars }),
  };
});

export const loadQuery = async <Query extends ValueTypes['Query']>(
  query: Query,
  { fetch, parent }: { fetch: LoadEvent['fetch']; parent?: () => Promise<LayoutServerData> }
) => {
  const { token } = parent ? await parent() : { token: undefined };
  return chain(fetch, { token })('query', { scalars })(query);
};

export const makeMutation = async <Mutation extends ValueTypes['Mutation']>(
  mutation: Mutation,
  { fetch, parent }: { fetch: LoadEvent['fetch']; parent?: () => Promise<LayoutServerData> }
) => {
  const { token } = parent ? await parent() : { token: undefined };
  return chain(fetch, { token })('mutation', { scalars })(mutation);
};
