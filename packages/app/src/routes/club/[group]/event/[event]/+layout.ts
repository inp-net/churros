import { Selector, loadQuery } from '$lib/zeus';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      event: [
        {
          groupUid: params.group,
          uid: params.event,
        },
        Selector('Event')({
          id: true,
        }),
      ],
    },
    { fetch, parent }
  );
