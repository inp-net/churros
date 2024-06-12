import { loadQuery } from '$lib/zeus';
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch, params, parent }) => {
  const { me, token } = await parent();

  if (!me) return { canEditGroup: false };

  const { user: currentUser } = await loadQuery(
    {
      user: [{ id: me?.id }, { canEditGroup: [{ uid: params.group }, true] }],
    },
    { fetch, token },
  );

  return {
    canEditGroup: currentUser?.canEditGroup,
  };
}) satisfies LayoutLoad;
