import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const { token, canEditGroup } = await parent();

  const { group } = await loadQuery(
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
              graduationYear: true,
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
    { fetch, token },
  );

  return {
    group,
    canEditGroup,
  };
};
