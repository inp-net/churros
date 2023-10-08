import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { redirectToLogin } from '$lib/session';
import { yearTier } from '$lib/dates';

export const GET: RequestHandler = ({ locals, url }) => {
  const { me } = locals;
  if (!me) throw redirectToLogin(url.pathname);
  const tier = yearTier(me.graduationYear);
  throw redirect(
    303,
    tier > 3 ? `/documents` : `/documents/${me.major.uid}/${tier}a${me.apprentice ? '-fisa' : ''}/`,
  );
};
