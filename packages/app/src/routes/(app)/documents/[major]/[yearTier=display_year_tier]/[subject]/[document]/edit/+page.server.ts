import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { getMe, redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, parent, params, url } = event;
  const me = await getMe(event);
  if (!me) throw redirectToLogin(url.pathname);
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(params.yearTier);
  return loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subject: [
        { uid: params.subject, yearTier, forApprentices },
        {
          name: true,
          shortName: true,
          uid: true,
          id: true,
          forApprentices: true,
          yearTier: true,
          emoji: true,
        },
      ],
      document: [
        {
          subjectUid: params.subject,
          documentUid: params.document,
          subjectYearTier: yearTier,
          subjectForApprentices: forApprentices,
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
            emoji: true,
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
