import { getMe } from '$lib/session';
import { redirectToLogin } from '$lib/session.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async (event) => {
  const { parent, url } = event;
  const me = await getMe(event);
  if (!me) throw redirectToLogin(url.pathname);
};
