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
          id: true,
          managers: {
            user: {
              uid: true,
            },
            canEdit: true,
            canEditPermissions: true,
            canVerifyRegistrations: true,
          },
          group: {
            members: {
              member: {
                uid: true,
              },
              canScanEvents: true,
            },
          },
        }),
      ],
    },
    { fetch, parent },
  );
  return { ...(await parent()), ...queryData };
};
