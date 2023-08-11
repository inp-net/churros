import { redirectToLogin } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  return loadQuery(
    {
      ticketsOfEvent: [
        {
          eventUid: params.uid,
          groupUid: params.group,
        },
        {
          uid: true,
          id: true,
          name: true,
          descriptionHtml: true,
          price: true,
          capacity: true,
          placesLeft: true,
          opensAt: true,
          closesAt: true,
          group: {
            capacity: true,
            name: true,
          },
          links: {
            name: true,
            value: true,
            computedValue: true,
          },
          registrations: {
            id: true,
            beneficiary: true,
            beneficiaryUser: {
              uid: true,
              firstName: true,
              fullName: true,
              lastName: true,
            },
            authorIsBeneficiary: true,
            author: {
              uid: true,
            },
            paid: true,
            ticket: {
              name: true,
            },
          },
          openToAlumni: true,
          openToExternal: true,
          openToGroups: {
            uid: true,
            name: true,
          },
          openToNonAEContributors: true,
          openToSchools: {
            uid: true,
            name: true,
            color: true,
            id: true,
          },
          openToPromotions: true,
          openToMajors: {
            name: true,
            shortName: true,
            id: true,
          },
          onlyManagersCanProvide: true,
          event: { id: true },
        },
      ],
      event: [
        { groupUid: params.group, uid: params.uid },
        Selector('Event')({
          startsAt: true,
          endsAt: true,
          uid: true,
          location: true,
          id: true,
          pictureFile: true,
          articles: {
            uid: true,
            bodyHtml: true,
            publishedAt: true,
            title: true,
            group: {
              uid: true,
              name: true,
              pictureFile: true,
            },
            author: {
              uid: true,
              fullName: true,
              firstName: true,
              lastName: true,
              pictureFile: true,
            },
            createdAt: true,
          },
          author: {
            uid: true,
            firstName: true,
            fullName: true,
            lastName: true,
            pictureFile: true,
          },
          descriptionHtml: true,
          title: true,
          links: {
            name: true,
            value: true,
            computedValue: true,
          },
          group: {
            uid: true,
            name: true,
            pictureFile: true,
          },
          contactMail: true,
        }),
      ],
    },
    { fetch, parent }
  );
};
