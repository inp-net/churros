import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subject: [{ uid: params.subject }, { name: true, shortName: true, uid: true, id: true }],
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
              type: true,
              createdAt: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
