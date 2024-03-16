import { Selector, loadQuery } from '$lib/zeus';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, parent, params }) => {
  const queryData = await loadQuery(
    {
      event: [
        {
          groupUid: params.group,
          uid: params.uid,
        },
        Selector('Event')({
          canScanBookings: true,
          canEdit: true,
          canSeeBookings: true,
        }),
      ],
    },
    { fetch, parent },
  );
  return { ...(await parent()), ...queryData };
};
