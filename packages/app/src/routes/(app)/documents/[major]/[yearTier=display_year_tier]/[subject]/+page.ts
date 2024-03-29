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
        { uid: params.subject, yearTier, forApprentices },
        {
          name: true,
          emoji: true,
          shortName: true,
          uid: true,
          id: true,
          links: { name: true, computedValue: true },
        },
      ],
      documentsOfSubject: [
        {
          subjectUid: params.subject,
          yearTier,
          forApprentices,
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
};
