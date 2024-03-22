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
      major: [{ uid: params.major }, { uid: true, shortName: true }],
      subject: [
        { uid: params.subject, yearTier, forApprentices },
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
