import { loadQuery } from '$lib/zeus';

export async function load({ params, fetch, parent }) {
  const { event } = await loadQuery(
    {
      event: [
        { id: params.id },
        {
          title: true,
          contactMail: true,
          pictureFile: true,
          startsAt: true,
          managers: {
            user: { uid: true },
          },
          ticket: [
            { slug: params.ticket },
            {
              uid: true,
              id: true,
              name: true,
              onlyManagersCanProvide: true,
              price: true,
              allowedPaymentMethods: true,
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

  return { event };
}
