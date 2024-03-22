import { getMe } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, parent } = event;
  const me = await getMe(event);
  if (!me) return {};

  return loadQuery(
    {
      registrationsOfUser: [
        { userUid: me.uid },
        Selector('QueryRegistrationsOfUserConnection')({
          pageInfo: { hasNextPage: true, startCursor: true },
          edges: {
            cursor: true,
            node: {
              paid: true,
              cancelled: true,
              authorEmail: true,
              author: {
                firstName: true,
                fullName: true,
                lastName: true,
                uid: true,
              },
              beneficiary: true,
              authorIsBeneficiary: true,
              beneficiaryUser: {
                fullName: true,
                firstName: true,
                lastName: true,
                uid: true,
              },
              id: true,
              ticket: {
                name: true,
                event: {
                  uid: true,
                  group: {
                    uid: true,
                  },
                  title: true,
                  descriptionHtml: true,
                  pictureFile: true,
                },
              },
            },
          },
        }),
      ],
    },
    { fetch, parent },
  );
};
