import type { PageEventAllBookingsVariables } from './$houdini';

export const _PageEventAllBookingsVariables: PageEventAllBookingsVariables = async ({
  url: { searchParams },
  params,
}) => ({
  ...params,
  filter:
    {
      paid: 'Paid',
      unpaid: 'Unpaid',
      verified: 'Verified',
    }[searchParams.get('tab') ?? 'unpaid'] ?? 'Unpaid',
});
