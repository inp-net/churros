import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(params.yearTier);
  return loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subject: [
        { slug: params.subject, yearTier, forApprentices },
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
          subject: params.subject,
          slug: params.document,
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
