import { loadQuery } from '$lib/zeus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) =>
  loadQuery(
    {
      userCandidates: [
        {},
        {
          pageInfo: { hasNextPage: true, endCursor: true },
          edges: {
            node: {
              firstName: true,
              lastName: true,
              fullName: true,
              email: true,
              major: { name: true, shortName: true },
              graduationYear: true,
            },
          },
        },
      ],
    },
    { fetch, token: cookies.get('token') },
  );
