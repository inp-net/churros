import { Selector, loadQuery } from '$lib/zeus.js';
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
    pictureFile: true,
    visibility: true,
  },
  eventId: true,
  links: {
    name: true,
    value: true,
  },
  publishedAt: true,
  pictureFile: true,
});

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      article: [{ uid: params.post, groupUid: params.group }, _articleQuery],
    },
    { fetch, parent }
  );
