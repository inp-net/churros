import { Selector, loadQuery } from '$lib/zeus';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent, fetch, params }) =>
  loadQuery(
    {
      group: [
        { uid: params.uid },
        Selector('Group')({
          uid: true,
          name: true,
          canListPages: true,
        }),
      ],
    },
    { fetch, parent },
  );
