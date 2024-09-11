import { oauthEnabled, oauthInitiateLoginURL, oauthLoginBypassed } from '$lib/oauth';
import { redirect } from '@sveltejs/kit';

export async function load(event) {
  if (oauthEnabled() && !oauthLoginBypassed(event)) redirect(307, oauthInitiateLoginURL(event));
}
