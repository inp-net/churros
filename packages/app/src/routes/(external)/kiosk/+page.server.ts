import { loadQuery } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, parent, url }) {
  const { events } = await loadQuery(
    {
      events: [
        {
          future: true,
          first: Number.parseInt(url.searchParams.get('count') || '5'),
        },
        {
          nodes: {
            id: true,
            title: true,
            startsAt: true,
            endsAt: true,
            location: true,
            pictureURL: true,
            group: {
              id: true,
              name: true,
              uid: true,
              pictureFile: true,
              pictureFileDark: true,
            },
            coOrganizers: {
              id: true,
              name: true,
              uid: true,
              pictureFile: true,
              pictureFileDark: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );

  if (events.nodes.length === 0) error(400, 'Aucun évènement à venir avec une photo de fond');

  return { events };
}
