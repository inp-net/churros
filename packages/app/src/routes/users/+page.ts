import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

const THIS_YEAR = new Date().getFullYear();

export const load: PageLoad = async ({ fetch, parent }) =>
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
              email: true,
              major: { name: true },
              graduationYear: true,
            },
          },
        },
      ],
      searchUsers: [
        {
          q: [THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2, THIS_YEAR + 3].map(String).join(' '),
        },
        {
          uid: true,
          firstName: true,
          lastName: true,
          email: true,
          major: { name: true },
          graduationYear: true,
        },
      ],
    },
    { fetch, parent }
  );
