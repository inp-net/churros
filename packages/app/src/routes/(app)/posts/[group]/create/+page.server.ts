import { getMe, redirectToLogin } from '$lib/session';
import { Visibility, loadQuery } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, params, parent, url } = event;
  const me = await getMe(event);
  if (!me) throw redirectToLogin(url.pathname);

  const { group } = await loadQuery(
    {
      group: [
        { uid: params.group },
        {
          pictureFile: true,
          pictureFileDark: true,
          uid: true,
          id: true,
          name: true,
          studentAssociation: { school: { name: true } },
          children: {
            name: true,
            studentAssociation: { school: { name: true } },
          },
          members: {
            canEditArticles: true,
            member: { uid: true },
          },
        },
      ],
    },
    { fetch, parent },
  );

  if (
    !me.canEditGroups &&
    !group.members.some(({ canEditArticles, member }) => member.uid === me.uid && canEditArticles)
  )
    throw redirect(307, '/posts/create');

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
