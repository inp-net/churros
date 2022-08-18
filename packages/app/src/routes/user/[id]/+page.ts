import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return loadQuery(
    {
      user: [
        { id: params.id },
        {
          id: true,
          address: true,
          biography: true,
          birthday: true,
          firstName: true,
          graduationYear: true,
          lastName: true,
          nickname: true,
          phone: true,
          pictureFile: true,
          groups: { group: { id: true, name: true, color: true }, title: true },
          links: { type: true, value: true },
          major: { name: true, schools: { name: true, color: true } },
        },
      ],
    },
    { fetch, parent }
  );
};
