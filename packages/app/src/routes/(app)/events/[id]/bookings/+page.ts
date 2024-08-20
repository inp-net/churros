import type { PageEventAllBookingsVariables } from './$houdini';

const tabToFilter = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  verified: 'Verified',
} as const;

export const _PageEventAllBookingsVariables: PageEventAllBookingsVariables = async ({
  url: { searchParams },
  params,
}) => {
  const tab = (searchParams.get('tab') ?? 'unpaid') as keyof typeof tabToFilter;
  return {
    ...params,
    filter: tabToFilter[tab] ?? 'Unpaid',
  };
};
