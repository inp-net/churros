import { redirectToLogin } from '$lib/session.js';

export async function load({ parent, url }) {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return {};
}
