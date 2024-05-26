/* eslint-disable @typescript-eslint/no-explicit-any */

import { ensureHasIdPrefix } from '#lib';
import { client, defaultOrganization } from './auth.js';

export const HELLOASSO_CUSTOM_FIELD_CHURROS_CODE_NAME = 'Code Churros';

/**
 * Returns a mapping of (churros booking ID) -> (paid ?)
 */
export async function helloAssoOrders(slug: string): Promise<Record<string, boolean>> {
  const org = await defaultOrganization();
  const orders = await unrollPaginated(`/v5/${org}/forms/Event/${slug}/orders`);
  const bookingCodeOf = (o: any): string =>
    o.customFields
      .find((f: any) => f.name === HELLOASSO_CUSTOM_FIELD_CHURROS_CODE_NAME)
      ?.value?.toString()
      .trim()
      .toLowerCase();

  return Object.fromEntries(
    orders
      .filter((o) => bookingCodeOf(o))
      .map((o: any) => [
        ensureHasIdPrefix(bookingCodeOf(o)!, 'Registration'),
        o.state === 'Processed',
      ]),
  );
}

async function unrollPaginated<T>(url: string): Promise<T[]> {
  return _unroll(url, await client.call(url).then((r) => r.json()));
}

async function _unroll<T>(
  url: string,
  result: { data: T[]; pagination: { continuationToken: string } },
): Promise<T[]> {
  return result.pagination.continuationToken
    ? [
        ...result.data,
        ...(await _unroll(
          url,
          (await client
            .call(url, {
              continuationToken: result.pagination.continuationToken,
            })
            .then((r) => r.json())) as typeof result,
        )),
      ]
    : result.data;
}
