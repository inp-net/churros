import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ session, url, params }) => {
  if (!session.me) redirectToLogin(url.pathname);

  if (
    !session.me?.canEditGroups &&
    !session.me?.groups.some(
      ({ groupId, canEditArticles }) => groupId === params.id && canEditArticles
    )
  )
    throw redirect(307, '.');

  return {};
};
