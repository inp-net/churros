import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      groups: [{}, Selector('Group')({ uid: true, name: true, pictureFile: true })],
      event: [
        {
          groupUid: params.group,
          uid: params.event,
        },
        Selector('Event')({
          startsAt: true,
          endsAt: true,
          pictureFile: true,
          group: {
            uid: true,
            name: true,
            pictureFile: true,
          },
          tickets: {
            id: true,
            name: true,
            description: true,
            price: true,
            capacity: true,
            opensAt: true,
            closesAt: true,
            links: {
              value: true,
              name: true,
            },
            allowedPaymentMethods: true,
            openToPromotions: true,
            openToAlumni: true,
            openToSchools: {
              uid: true,
              name: true,
              color: true,
            },
            openToGroups: {
              uid: true,
              name: true,
              pictureFile: true,
            },
            openToNonAEContributors: true,
            godsonLimit: true,
            onlyManagersCanProvide: true,
          },
          ticketGroups: {
            name: true,
            capacity: true,
            tickets: {
              id: true,
              name: true,
              description: true,
              price: true,
              capacity: true,
              opensAt: true,
              closesAt: true,
              links: {
                value: true,
                name: true,
              },
              allowedPaymentMethods: true,
              openToPromotions: true,
              openToAlumni: true,
              openToSchools: {
                name: true,
                uid: true,
                color: true,
              },
              openToGroups: {
                uid: true,
                name: true,
                pictureFile: true,
              },
              openToNonAEContributors: true,
              godsonLimit: true,
              onlyManagersCanProvide: true,
            },
          },
          contactMail: true,
          lydiaAccountId: true,
          links: {
            value: true,
            name: true,
          },
          location: true,
          uid: true,
          title: true,
          visibility: true,
          managers: {
            user: {
              uid: true,
              firstName: true,
              lastName: true,
              pictureFile: true,
            },
            canEdit: true,
            canEditPermissions: true,
            canVerifyRegistrations: true,
          },
        }),
      ],
    },
    { fetch, parent }
  );
