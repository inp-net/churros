import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
  const { me, token } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const { user: currentUser } = await loadQuery(
    {
      user: [{ id: me?.id }, { canEditGroup: [{ uid: params.uid }, true] }],
    },
    { fetch, token },
  );

  if (
    !currentUser?.canEditGroup &&
    !me.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === params.uid)
  )
    throw redirect(307, '.');
};
