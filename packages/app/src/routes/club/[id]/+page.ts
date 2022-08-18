import { query } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, session }) =>
  query(
    fetch,
    {
      group: [
        { id: params.id },
        session.me
          ? {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
              members: {
                member: { id: true, firstname: true, lastname: true },
                title: true,
                president: true,
                treasurer: true,
              },
              school: { name: true, color: true },
            }
          : {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
              school: { name: true, color: true },
            },
      ],
    },
    session
  );
