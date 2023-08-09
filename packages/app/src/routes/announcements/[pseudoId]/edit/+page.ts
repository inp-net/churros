import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const id = params.pseudoId.startsWith('ann:') ? params.pseudoId : `ann:${params.pseudoId}`;
  return loadQuery(
    {
      announcement: [
        { id },
        {
          title: true,
          body: true,
          startsAt: true,
          endsAt: true,
          warning: true,
          id: true,
        },
      ],
    },
    { fetch, parent }
  );
};
