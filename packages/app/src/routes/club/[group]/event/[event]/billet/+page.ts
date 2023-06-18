import { Selector, loadQuery } from '$lib/zeus';

export const load: PageLoad = async ({ params, fetch, parent }) => {
  const { me } = await parent();
  return loadQuery(
    {
      registrationOfUser: [
        {
          userUid: me?.uid ?? '',
          eventUid: params.event,
        },
        Selector('Registration')({
          id: true,
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
};
