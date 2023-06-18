import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      registrationsOfEvent: [
        {
          eventUid: params.event,
        },
        Selector('QueryRegistrationsOfEventConnection')({
          pageInfo: { hasNextPage: true, startCursor: true },
          edges: {
            cursor: true,
            node: {
              id: true,
              paid: true,
              author: {
                uid: true,
                firstName: true,
                lastName: true,
              },
              authorIsBeneficiary: true,
              beneficiary: true,
              createdAt: true,
              paymentMethod: true,
              ticket: {
                name: true,
                group: {
                  name: true,
                },
              },
              updatedAt: true,
            },
          },
        }),
      ],
    },
    { fetch, parent }
  );
