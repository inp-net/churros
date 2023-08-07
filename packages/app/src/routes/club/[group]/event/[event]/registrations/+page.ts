import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      event: [{ groupUid: params.group, uid: params.event }, Selector('Event')({ id: true })],
      registrationsOfEvent: [
        {
          eventUid: params.event,
          groupUid: params.group,
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
                fullName: true,
              },
              authorIsBeneficiary: true,
              beneficiary: true,
              createdAt: true,
              paymentMethod: true,
              ticket: {
                id: true,
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
