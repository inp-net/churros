import { getMe } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, params, parent } = event;
  const me = await getMe(event);
  const data = await loadQuery(
    {
      ...(me
        ? {
            me: {
              pendingContributions: {
                id: true,
                name: true,
              },
              contributesTo: { uid: true },
              external: true,
            },
          }
        : {}),
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
              contributionOptions: {
                id: true,
                price: true,
                offeredIn: {
                  uid: true,
                  name: true,
                },
                paysFor: {
                  id: true,
                  name: true,
                  uid: true,
                },
                name: true,
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
