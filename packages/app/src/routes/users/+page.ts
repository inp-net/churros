import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      userCandidates: [
        {},
        {
          pageInfo: { hasNextPage: true, endCursor: true },
          edges: { node: { firstName: true, lastName: true } },
        },
      ],
    },
    { fetch, parent }
  );
