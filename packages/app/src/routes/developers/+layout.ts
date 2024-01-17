import { redirectToLogin } from '$lib/session';

export async function load({ parent, url }) {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
}
