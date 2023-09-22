import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      major: [{ uid: params.major }, { name: true, uid: true }],
      subject: [{ uid: params.subject }, { name: true, uid: true, id: true }],
      document: [
        {
          subjectUid: params.subject,
          documentUid: params.document,
        },
        {
          title: true,
          id: true,
          type: true,
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
