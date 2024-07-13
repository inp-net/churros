import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, parent }) =>
  loadQuery(
    {
      event: [
        { group: params.group, slug: params.uid },
        {
          ticket: [
            { slug: params.ticket },
            {
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
                managers: {
                  user: { uid: true },
                },
              },
              links: {
                name: true,
                computedValue: true,
              },
              remainingGodsons: true,
            },
          ],
        },
      ],
    },
    { fetch, parent },
  );
