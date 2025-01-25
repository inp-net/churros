import type { PageEventAllBookingsVariables } from './$houdini';
import { tabToFilter } from './filters';

export const _PageEventAllBookingsVariables: PageEventAllBookingsVariables = async ({
  url: { searchParams },
  params,
}) => {
  const tab = (searchParams.get('tab') ?? 'unpaid') as keyof typeof tabToFilter;
  return {
    ...params,
    filter: tabToFilter[tab] ?? 'Unpaid',
    search: searchParams.get('q') ?? '',
    searching: searchParams.has('q'),
  };
};
