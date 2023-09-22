import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      document: [
        {
          subjectUid: params.subject,
          documentUid: params.document,
        },
        {
          title: true,
          id: true,
          schoolYear: true,
          descriptionHtml: true,
          solutionPaths: true,
          paperPaths: true,
          subject: {
            name: true,
            uid: true,
            minors: {
              uid: true,
            },
            majors: {
              uid: true,
            },
          },
          uploader: {
            uid: true,
            pictureFile: true,
            fullName: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
