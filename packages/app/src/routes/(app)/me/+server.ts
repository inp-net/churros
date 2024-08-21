import { graphql } from '$houdini';
import { route } from '$lib/ROUTES';
import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';

export async function GET(event) {
  const { me } = await graphql(`
    query PageMeRedirect {
      me {
        uid
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { me: null });
  if (me) throw redirect(307, route('/[uid=uid]', me.uid));
  throw redirectToLogin(`/me`);
}
