import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      majors: {
        id: true,
        name: true,
        shortName: true,
        uid: true,
        schools: {
          uid: true,
          name: true,
        },
        subjects: {
          id: true,
        },
      },
      schools: {
        uid: true,
        name: true,
      },
    },
    { fetch, parent },
  );
