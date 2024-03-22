import { getMe } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, parent } = event;
  const me = await getMe(event);
  return loadQuery(
    {
      ...(me
        ? {
            studentAssociations: [
              { canContributeOnly: true },
              { uid: true, name: true, description: true, id: true },
            ],
          }
        : {}),
      groups: [
        {},
        {
          uid: true,
          name: true,
          groupId: true,
          parentId: true,
          pictureFile: true,
          pictureFileDark: true,
          description: true,
          type: true,
          studentAssociation: {
            uid: true,
            contributionOptions: {
              offeredIn: {
                uid: true,
              },
            },
            school: {
              name: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
};
