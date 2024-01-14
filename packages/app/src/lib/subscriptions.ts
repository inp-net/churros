import { env } from '$env/dynamic/public';
import type { MaybePromise } from '@sveltejs/kit';
import { chain, scalars, type ValueTypes } from './zeus';

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

export async function subscribe<Query extends ValueTypes['Subscription']>(
  query: Query,
  // putting Awaited<...> here causes an infinite type recursion
  callback: (
    data: { errors: Array<{ message: string }> } | ReturnType<typeof chainedSubscriptions<Query>>,
  ) => MaybePromise<void>,
) {
  const subscription = new EventSource(
    new URL(
      env.PUBLIC_API_URL +
        '?' +
        new URLSearchParams({
          query: 'subscription { ' + renderQuery(query) + ' }',
        }).toString(),
    ),
  );

  subscription.addEventListener('next', async ({ data }) => {
    const obj = JSON.parse(data);
    await callback(new Promise((resolve) => ('errors' in obj ? resolve(obj) : resolve(obj.data))));
  });
}
