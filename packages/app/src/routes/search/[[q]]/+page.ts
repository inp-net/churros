import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url, params: { q } }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname + url.search);
  if (!q) return { searchUsers: [], searchGroups: [], searchEvents: [] };

  return loadQuery(
    {
      searchUsers: [
        { q },
        { uid: true, firstName: true, lastName: true, pictureFile: true, fullName: true },
      ],
      searchGroups: [
        {
          q,
          similarityCutoff: Number.parseFloat(url.searchParams.get('sim') ?? '0.05'),
        },
        { uid: true, name: true, pictureFile: true, pictureFileDark: true },
      ],
      searchEvents: [
        {
          q,
        },
        {
          id: true,
          uid: true,
          pictureFile: true,
          title: true,
          group: {
            uid: true,
            name: true,
            pictureFile: true,
          },
          descriptionHtml: true,
          startsAt: true,
          endsAt: true,
          tickets: {
            name: true,
            price: true,
            uid: true,
            opensAt: true,
            closesAt: true,
            placesLeft: true,
            capacity: true,
          },
          author: {
            uid: true,
            pictureFile: true,
            fullName: true,
            groups: { title: true, group: { name: true, uid: true } },
          },
          location: true,
        },
      ],
      searchArticles: [
        { q },
        {
          id: true,
          uid: true,
          title: true,
          pictureFile: true,
          bodyHtml: true,
          author: {
            uid: true,
            fullName: true,
            pictureFile: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
};
