import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      subjectsOfMajor: [
        { uid: params.major },
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
              }
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
