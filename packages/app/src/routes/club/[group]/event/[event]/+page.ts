import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      event: [
        { groupUid: params.group, uid: params.event },
        Selector('Event')({
          articles: {
            uid: true,
            bodyHtml: true,
            title: true,
            group: {
              uid: true,
              name: true,
              pictureFile: true,
            },
            author: {
              uid: true,
              firstName: true,
              lastName: true,
              pictureFile: true,
            },
            createdAt: true,
          },
          author: {
            uid: true,
            firstName: true,
            lastName: true,
            pictureFile: true,
          },
          descriptionHtml: true,
          title: true,
          links: {
            links: {
              name: true,
              value: true,
            },
          },
          tickets: {
            name: true,
            descriptionHtml: true,
            price: true,
            capacity: true,
            placesLeft: true,
            links: {
              links: {
                name: true,
                value: true,
              },
            },
            opensAt: true,
            closesAt: true,
            openToAlumni: true,
            openToExternal: true,
            openToGroups: {
              uid: true,
              name: true,
            },
            openToNonAEContributors: true,
            openToSchools: {
              name: true,
              color: true,
              id: true,
            },
            openToPromotions: true,
          },
        }),
      ],
    },
    { fetch, parent }
  );
