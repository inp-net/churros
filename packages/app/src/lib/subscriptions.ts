import { page } from '$app/stores';
import { env } from '$env/dynamic/public';
import type { MaybePromise } from '@sveltejs/kit';
import { createClient } from 'graphql-ws';
import { derived } from 'svelte/store';
import { chain, scalars, type ValueTypes } from './zeus';

const subscriptionsClient = (token: string | undefined) =>
  createClient({
    url: env.PUBLIC_API_WEBSOCKET_URL,
    connectionParams: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    },
  });

function renderQuery(query: Record<string, unknown> | object): string {
  return Object.entries(query)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        const [args, subquery] = value as [Record<string, unknown>, true | Record<string, unknown>];
        const renderedArgs = Object.entries(args)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(', ');
        return (
          `${key}(${renderedArgs})` +
          (subquery === true ? '\n' : `{ ${renderQuery(subquery ?? {})} }`)
        );
      } else if (typeof value === 'object') {
        return `${key} { ${renderQuery(value ?? {})} }`;
      } else if (value) {
        return key + '\n';
      }
    })
    .join('\n');
}

const chainedSubscriptions = <Q extends ValueTypes['Subscription']>(q: Q) =>
  chain(fetch, {})('subscription', { scalars })(q);

function _suscribeWithToken<Query extends ValueTypes['Subscription']>(
  token: string | undefined,
): (
  query: Query,
  // putting Awaited<...> here causes an infinite type recursion
  callback: (
    data: { errors: Array<{ message: string }> } | ReturnType<typeof chainedSubscriptions<Query>>,
  ) => MaybePromise<void>,
) => void {
  return async (query, callback) => {
    const subscription = subscriptionsClient(token).iterate({
      query: 'subscription { ' + renderQuery(query) + ' }',
    });

    for await (const { data } of subscription)
      await callback(new Promise((resolve) => resolve(data)));
  };
}

export const subscribe = derived(page, ($page) => _suscribeWithToken($page.data.token));
