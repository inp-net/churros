import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, parent, url }) =>
  loadQuery(
    {
      registrationOfUser: [
        {
          beneficiary: url.searchParams.get('for') ?? undefined,
          eventUid: params.event,
        },
        Selector('Registration')({
          id: true,
          paid: true,
          beneficiary: true,
          authorIsBeneficiary: true,
          author: {
            firstName: true,
            lastName: true,
            uid: true,
          },
          ticket: {
            name: true,
            group: {
              name: true,
            },
            event: {
              title: true,
              startsAt: true,
            },
          },
        }),
      ],
    },
    { fetch, parent }
  );
