import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      group: [
        { uid: params.uid },
        Selector('Group')({
          name: true,
          uid: true,
          members: {
            member: {
              uid: true,
              firstName: true,
              lastName: true,
              fullName: true,
              pictureFile: true,
            },
            title: true,
            canEditArticles: true,
            canEditMembers: true,
            president: true,
            createdAt: true,
            treasurer: true,
            secretary: true,
            vicePresident: true,
          },
        }),
      ],
    },
    { fetch, parent }
  );
