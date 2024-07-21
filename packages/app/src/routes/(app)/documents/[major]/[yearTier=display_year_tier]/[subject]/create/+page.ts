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
      major: [{ uid: params.major }, { uid: true, shortName: true }],
      subject: [
        { slug: params.subject, yearTier, forApprentices },
        {
          name: true,
          emoji: true,
          shortName: true,
          uid: true,
          id: true,
          links: { name: true, computedValue: true },
          forApprentices: true,
          yearTier: true,
          majors: {
            uid: true,
            name: true,
            shortName: true,
          },
          minors: {
            uid: true,
            name: true,
            shortName: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
};
