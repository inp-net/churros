import { redirectToLogin } from '$lib/session';
import { Visibility, loadQuery } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.canEditGroups &&
    !me.groups.some(({ group, canEditArticles }) => group.uid === params.group && canEditArticles)
  )
    throw redirect(307, '.');

  const { group } = await loadQuery(
    { group: [{ uid: params.group }, { uid: true, id: true, name: true }] },
    { fetch, parent }
  );
  return {
    article: {
      id: '',
      uid: '',
      bodyHtml: '',
      visibility: Visibility.Private,
      title: '',
      body: '',
      publishedAt: new Date(),
      pictureFile: '',
      links: [],
      eventId: undefined,
      event: undefined,
      author: me,
      authorId: me.id,
      group,
      groupId: group.id,
    },
  };
};
