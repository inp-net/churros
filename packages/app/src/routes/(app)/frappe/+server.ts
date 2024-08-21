import { graphql } from '$houdini';
import { yearTier } from '$lib/dates';
import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';

export async function GET(event) {
  const { me } = await graphql(`
    query PageFrappeRedirect {
      me {
        graduationYear
        major {
          uid
        }
        apprentice
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { me: null });

  if (!me) return redirectToLogin(event.url.pathname);

  const tier = yearTier(me.graduationYear);

  throw redirect(
    303,
    me.major
      ? tier > 3
        ? `/documents/${me.major.uid}`
        : `/documents/${me.major.uid}/${tier}a${
            tier === 3 ? '' : me.apprentice ? '-fisa' : '-fise'
          }/`
      : '/documents/',
  );
}
