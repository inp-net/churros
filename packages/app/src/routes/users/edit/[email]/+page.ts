import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      userCandidateByEmail: [
        params,
        {
          firstName: true,
          lastName: true,
          email: true,
          address: true,
          birthday: true,
          graduationYear: true,
          majorId: true,
          phone: true,
          schoolEmail: true,
          schoolServer: true,
          schoolUid: true,
        },
      ],
    },
    { fetch, parent }
  );
