import { isOnClubBoard } from '$lib/permissions';
import { GroupType, Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { groups } = await loadQuery(
    {
      groups: [
        {},
        Selector('Group')({
          type: true,
          uid: true,
          name: true,
          pictureFile: true,
          pictureFileDark: true,
          members: {
            president: true,
            vicePresident: true,
            secretary: true,
            treasurer: true,
            title: true,
            member: {
              uid: true,
              fullName: true,
              pictureFile: true,
              lastName: true,
            },
          },
        }),
      ],
    },
    { fetch, parent },
  );
  return {
    groups: groups
      .filter(({ type }) => type !== GroupType.List)
      .map(({ members, ...group }) => ({
        ...group,
        members: members.filter((m) => isOnClubBoard(m)),
      })),
  };
};
