import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const yearTier = Number.parseInt(params.yearTier.replace(/a(-fis(e|a))?$/, ''), 10);
  const forApprentices = params.yearTier.endsWith('a-fisa');
  const { major } = await loadQuery(
    {
      major: [
        { uid: params.major },
        {
          name: true,
          shortName: true,
          uid: true,
          subjects: [
            {
              yearTier,
              forApprentices,
            },
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
      ],
    },
    { fetch, parent },
  );

  return {
    major,
    subjectsOfMajor: major.subjects,
  };
};
