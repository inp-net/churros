import { page } from '$app/stores';
import { env } from '$env/dynamic/public';
import { error, type LoadEvent, type NumericRange } from '@sveltejs/kit';
import {
  Thunder,
  ZeusScalars,
  type GraphQLResponse,
  type GraphQLTypes,
  type InputType,
  type ValueTypes,
} from '../zeus/index';
// @ts-expect-error This file is not typed
import extractFiles from 'extract-files/extractFiles.mjs';
// @ts-expect-error This file is not typed
import isFile from 'extract-files/isExtractableFile.mjs';
import { GraphQLError } from 'graphql';
import { derived } from 'svelte/store';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../../../api/src/lib/error';
import { aled } from './session';

export * from '../zeus/index.js';

export type PropsType<
  T extends (...args: never[]) => unknown,
  U extends keyof GraphQLTypes = 'Query',
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
        ({ message, ...options }) => new GraphQLError(message, options),
      );
      if (response.errors.length === 1) {
        super(errors[0]!.message);
      } else {
        super(
          `${response.errors.length} GraphQL errors\n${errors
            .map((error) => `\t${error.message} ${JSON.stringify(error.extensions)}`)
            .join('\n')}`,
        );
      }
      this.errors = errors;
    }
  }
}

export const chain = (fetch: LoadEvent['fetch'], { token }: Options) => {
  const headers = new Headers();
  aled('zeus.ts: inside chain; maybe setting Authorization header', { token, headers });
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

    const response = await fetch(new URL(env.PUBLIC_API_URL), { body, method: 'POST', headers });

    // If we received an HTTP error, propagate it
    if (!response.ok) throw error(response.status as NumericRange<400, 599>);

    return response
      .json()
      .catch(() => {
        throw new Error('The server returned an error.');
      })
      .then((graphqlResponse: GraphQLResponse) => {
        if (graphqlResponse.errors?.every((e) => e.message === UNAUTHORIZED_ERROR_MESSAGE)) {
          error(401, { message: UNAUTHORIZED_ERROR_MESSAGE });
        }
        if (graphqlResponse.errors || !response.ok) throw new ZeusError(graphqlResponse);
        return graphqlResponse.data;
      });
  });
};

export const scalars = ZeusScalars({
  DateTime: {
    decode: (value: unknown): Date => new Date(value as string),
    encode: (value: unknown): string => JSON.stringify(value),
  },
  Counts: {
    decode: (value: unknown): Record<string, number> =>
      JSON.parse(value as string) as Record<string, number>,
    encode: (value: unknown): string => JSON.stringify(value as Record<string, number>),
  },
  BooleanMap: {
    decode: (value: unknown): Record<string, boolean> =>
      JSON.parse(value as string) as Record<string, boolean>,
    encode: (value: unknown): string => JSON.stringify(value as Record<string, boolean>),
  },
});

export const zeus = derived(page, ({ data }) => {
  aled('zeus.ts: inside derived store $zeus', data);
  const chained = chain(fetch, { token: data.token });
  return {
    query: chained('query', { scalars }),
    mutate: chained('mutation', { scalars }),
  };
});

export const loadQuery = async <Query extends ValueTypes['Query']>(
  query: Query,
  {
    fetch,
    parent,
    token,
  }: {
    fetch: LoadEvent['fetch'];
    parent?: () => Promise<{ token?: string | undefined }>;
    token?: string | undefined;
  },
) => {
  ({ token } = parent ? await parent() : { token });
  return chain(fetch, { token })('query', { scalars })(query);
};

export const makeMutation = async <Mutation extends ValueTypes['Mutation']>(
  mutation: Mutation,
  {
    fetch,
    parent,
    token,
  }: {
    fetch: LoadEvent['fetch'];
    parent?: () => Promise<{ token?: string | undefined }>;
    token?: string | undefined;
  },
) => {
  ({ token } = parent ? await parent() : { token });
  return chain(fetch, { token })('mutation', { scalars })(mutation);
};
