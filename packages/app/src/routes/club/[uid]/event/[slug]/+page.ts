import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from '../[slug]/$types';

export const load: PageLoad = async ({ fetch, parent, params }) => 
  loadQuery(
    {
      event: [
        { group: params.uid, slug: params.slug },
        Selector('Event')({
          articles: {
            slug: true,
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
