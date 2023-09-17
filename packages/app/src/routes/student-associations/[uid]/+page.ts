import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const data = await loadQuery(
    {
      studentAssociation: [
        params,
        me
          ? // Authenticated query
            {
              uid: true,
              name: true,
              description: true,
              school: {
                id: true,
                uid: true,
                name: true,
                color: true,
                groups: {
                  uid: true,
                  name: true,
                  type: true,
                  description: true,
                  pictureFile: true,
                },
              },
              links: {
                name: true,
                value: true,
              },
              groups: {
                uid: true,
                name: true,
                type: true,
                description: true,
                pictureFile: true,
              },
            }
          : // Unauthenticated query
            {
              uid: true,
              name: true,
              description: true,
              school: {
                id: true,
                uid: true,
                name: true,
                color: true,
                groups: {
                  uid: true,
                  name: true,
                  type: true,
                  description: true,
                  pictureFile: true,
                },
              },
              links: {
                name: true,
                value: true,
              },
              groups: {
                uid: true,
                name: true,
                type: true,
                description: true,
                pictureFile: true,
              },
            },
      ],
    },
    { fetch, parent },
  );
  return {
    ...data,
    studentAssociation: {
      ...data.studentAssociation,
    },
  };
};
