import { loadQuery } from '$lib/zeus';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data }) => {
  const { me, mobile, token } = data;
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
            },
          },
        },
      ],
    },
    {
      fetch,
      async parent() {
        return new Promise((resolve) => {
          resolve({
            me,
            mobile,
            token,
          });
        });
      },
    },
  );

  return { ...data, ...additionalData };
};
