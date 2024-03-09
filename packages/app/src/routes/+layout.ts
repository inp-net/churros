import { loadQuery } from '$lib/zeus';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data }) => {
  const { me, token } = data;
  if (!me) {
    return {
      ...data,
      registrationsOfUser: {
        edges: [],
      },
    };
  }

  const additionalData = await loadQuery(
    {
      registrationsOfUser: [
        {
          userUid: me?.uid,
          first: 5,
          forUserOnly: true,
        },
        {
          edges: {
            node: {
              id: true,
              code: true,
              ticket: {
                name: true,
                event: {
                  pictureFile: true,
                  title: true,
                  startsAt: true,
                  endsAt: true,
                },
              },
              beneficiary: true,
              beneficiaryUser: {
                fullName: true,
              },
              authorIsBeneficiary: true,
              author: {
                fullName: true,
              },
              authorEmail: true,
              paid: true,
              cancelled: true,
              opposed: true,
            },
          },
        },
      ],
    },
    { fetch, token },
  );

  return { ...data, ...additionalData };
};
