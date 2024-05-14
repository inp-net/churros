import { redirectToLogin } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const _articleQuery = Selector('Article')({
  id: true,
  uid: true,
  title: true,
  body: true,
  bodyHtml: true,
  visibility: true,
  group: {
    uid: true,
    name: true,
    id: true,
    pictureFile: true,
    pictureFileDark: true,
    studentAssociation: { school: { name: true } },
    children: {
      name: true,
      studentAssociation: { school: { name: true } },
    },
  },
  author: {
    firstName: true,
    fullName: true,
    lastName: true,
    id: true,
    pictureFile: true,
    uid: true,
    groups: { group: { name: true, uid: true }, title: true },
  },
  event: {
    id: true,
    uid: true,
    title: true,
    startsAt: true,
    endsAt: true,
    pictureFile: true,
    visibility: true,
    recurringUntil: true,
    frequency: true,
    location: true,
  },
  eventId: true,
  links: {
    name: true,
    value: true,
  },
  publishedAt: true,
  pictureFile: true,
});

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me, canEditGroup } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const { article } = await loadQuery(
    {
      article: [{ uid: params.uid, groupUid: params.group }, _articleQuery],
    },
    { fetch, parent },
  );

  const canEdit =
    canEditGroup ||
    me.groups.some(
      ({ canEditArticles, group }) => group.id === article.group.id && canEditArticles,
    );
  if (!canEdit) throw redirect(307, '..');
  return { article };
};
