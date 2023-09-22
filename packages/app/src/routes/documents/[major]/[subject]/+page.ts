import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      documentsOfSubject: [
        {
          subjectUid: params.subject,
        },
        {
            pageInfo: { hasNextPage: true, endCursor: true },
          edges: {
            node: {
              id: true,
              title: true,
              uid: true,
              schoolYear: true,
              solutionPaths: true,
              paperPaths: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
