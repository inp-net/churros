import { loadQuery } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const token = url.searchParams.get('token');

  if (!token) throw redirect(307, '..');

  return loadQuery(
    {
      userCandidate: [
        { token },
        {
          emailValidated: true,
          email: true,
          address: true,
          birthday: true,
          firstName: true,
          fullName: true,
          lastName: true,
          majorId: true,
          graduationYear: true,
          phone: true,
          schoolUid: true,
          cededImageRightsToTVn7: true,
          apprentice: true,
          usingQuickSignup: true,
        },
      ],
      schoolGroups: {
        names: true,
        majors: { id: true, name: true, shortName: true, schools: { name: true } },
      },
    },
    { fetch },
  );
};
