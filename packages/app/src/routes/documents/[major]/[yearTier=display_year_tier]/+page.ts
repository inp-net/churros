import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
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
          shortName: true,
          semester: true,
          uid: true,
          nextExamAt: true,
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
