import { redirectToLogin } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
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
              author: {
                firstName: true,
                fullName: true,
                lastName: true,
                uid: true,
              },
              beneficiary: true,
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
                },
              },
            },
          },
        }),
      ],
    },
    { fetch, parent }
  );
};
