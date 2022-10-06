import { GroupType, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) =>
  loadQuery(
    {
      groups: [
        { types: [GroupType.Association, GroupType.Club] },
        { groupId: true, name: true, slug: true },
      ],
    },
    { fetch }
  );
