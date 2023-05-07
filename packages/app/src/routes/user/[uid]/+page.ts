import { redirectToLogin } from '$lib/session';
import { byMemberGroupTitleImportance } from '$lib/sorting';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  const data = await loadQuery(
    {
      user: [
        params,
        {
          uid: true,
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
          groups: {
            group: { uid: true, name: true, color: true },
            title: true,
            president: true,
            treasurer: true,
          },
          linkCollection: { links: { type: true, value: true } },
          major: { name: true, schools: { name: true, color: true } },
        },
      ],
    },
    { fetch, parent }
  );

  return {
    ...data,
    user: {
      ...data.user,
      groups: data.user.groups.sort(byMemberGroupTitleImportance),
    },
  };
};
