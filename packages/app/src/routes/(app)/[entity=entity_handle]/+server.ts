import { graphql } from '$houdini';
import { route } from '$lib/ROUTES';
import { redirect, type RequestHandler } from '@sveltejs/kit';

const EntityHandleRedirect = graphql(`
  query EntityHandleRedirect($uid: String!) @blocking {
    group(uid: $uid) {
      uid
    }
  }
`);

export const GET: RequestHandler = async (event) => {
  const uid = event.params.entity!.replace('@', '');
  const isGroup = await EntityHandleRedirect.fetch({
    event,
    variables: { uid },
  }).then((d) => d.data?.group.uid);

  const url = new URL(event.request.url);
  url.pathname = `/${isGroup ? 'groups' : 'users'}/${uid}`;
  throw redirect(302, isGroup ? route('/groups/[uid]', uid) : route('/users/[uid]', uid));
};
