import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  if (params.major === 'eeea') throw redirect(307, '/documents/eeea');
  const yearTier = Number.parseInt(params.yearTier.replace(/a(-fis(e|a))?$/, ''), 10);
  const forApprentices = params.yearTier.endsWith('a-fisa');
  return loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subjectsOfMajor: [
        { uid: params.major, yearTier, forApprentices },
        {
          id: true,
          name: true,
          emoji: true,
          shortName: true,
          semester: true,
          uid: true,
          nextExamAt: true,
          yearTier: true,
          unit: {
            shortName: true,
            name: true,
          },
          minors: {
            name: true,
            uid: true,
            id: true,
          },
          documentsCount: true,
        },
      ],
    },
    { fetch, parent },
  );
};
