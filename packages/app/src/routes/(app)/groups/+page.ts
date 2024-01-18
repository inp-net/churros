import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { me } = await parent();
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
