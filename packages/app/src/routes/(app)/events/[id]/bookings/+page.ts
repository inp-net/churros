import type { PageEventAllBookingsVariables } from './$houdini';
import { tabToFilter } from './utils';

export const _PageEventAllBookingsVariables: PageEventAllBookingsVariables = async ({
  url: { searchParams },
  params,
}) => {
  return { ...params, filter: tabToFilter.get(searchParams.get('tab') ?? 'unpaid') ?? 'Unpaid' };
};
