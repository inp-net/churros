import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return loadQuery(
    {
      user: [
        params,
        {
          address: true,
          birthday: true,
          createdAt: true,
          description: true,
          firstName: true,
          graduationYear: true,
          lastName: true,
          nickname: true,
          phone: true,
          pictureFile: true,
          groups: { group: { slug: true, name: true, color: true }, title: true },
          linkCollection: { links: { type: true, value: true } },
          major: { name: true, schools: { name: true, color: true } },
        },
      ],
    },
    { fetch, parent }
  );
};
