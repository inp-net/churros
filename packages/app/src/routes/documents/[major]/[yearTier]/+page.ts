import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subjectsOfMajor: [
        { uid: params.major, yearTier: Number.parseInt(params.yearTier.replace('a', ''), 10) },
        {
          pageInfo: { hasNextPage: true, endCursor: true },
          edges: {
            node: {
              id: true,
              name: true,
              uid: true,
              minors: {
                name: true,
                uid: true,
                id: true,
              },
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
