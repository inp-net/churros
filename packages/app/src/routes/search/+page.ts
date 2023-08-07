import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname + url.search);
  if (!url.searchParams.has('q')) return { searchUsers: [], searchGroups: [], searchEvents: [] };

  return loadQuery(
    {
      searchUsers: [
        { q: url.searchParams.get('q')! },
        { uid: true, firstName: true, lastName: true, pictureFile: true, fullName: true },
      ],
      searchGroups: [
        { q: url.searchParams.get('q')! },
        { uid: true, name: true, pictureFile: true, pictureFileDark: true },
      ],
      searchEvents: [
        {
          q: url.searchParams.get('q')!,
        },
        {
          uid: true,
          title: true,
          group: {
            uid: true,
            name: true,
            pictureFile: true,
          },
        },
      ],
    },
    { fetch, parent }
  );
};
