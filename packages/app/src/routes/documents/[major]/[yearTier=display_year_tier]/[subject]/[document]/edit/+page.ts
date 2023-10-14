import { parseYearTier } from '$lib/dates';
import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subject: [
        { uid: params.subject, yearTier: parseYearTier(params.yearTier) },
        { name: true, shortName: true, uid: true, id: true, forApprentices: true, yearTier: true },
      ],
      document: [
        {
          subjectUid: params.subject,
          documentUid: params.document,
          subjectYearTier: parseYearTier(params.yearTier),
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
            forApprentices: true,
            yearTier: true,
            uid: true,
            minors: {
              uid: true,
              name: true,
              shortName: true,
            },
            majors: {
              uid: true,
              name: true,
              shortName: true,
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
