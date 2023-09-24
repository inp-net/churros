import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subject: [{ uid: params.subject }, { name: true, shortName: true, uid: true, id: true }],
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
          description: true,
          solutionPaths: true,
          paperPaths: true,
          createdAt: true,
          updatedAt: true,
          subject: {
            name: true,
            shortName: true,
            uid: true,
            minors: {
              uid: true,
              name: true,
            },
            majors: {
              uid: true,
              name: true,
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
};
