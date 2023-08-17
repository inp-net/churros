import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, parent }) =>
  loadQuery(
    {
      ticketByUid: [
        { uid: params.ticket, eventUid: params.uid, groupUid: params.group },
        Selector('Ticket')({
          uid: true,
          id: true,
          name: true,
          onlyManagersCanProvide: true,
          price: true,
          allowedPaymentMethods: true,
          event: {
            title: true,
            contactMail: true,
            pictureFile: true,
            startsAt: true,
          },
        }),
      ],
    },
    { fetch, parent }
  );
