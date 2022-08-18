import { GroupType, query } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, session }) =>
  query(
    fetch,
    { groups: [{ types: [GroupType.Association, GroupType.Club] }, { id: true, name: true }] },
    session
  );
